package app.api;

import app.api.controller.PatternMetaController;
import app.api.dto.Dtos.*;
import app.api.sse.SseBroadcaster;
import app.model.*;
import app.patterns.builder.StudentBuilder;
import app.patterns.chain.ComplaintHandler;
import app.patterns.chain.ChiefWardenHandler;
import app.patterns.chain.DeanHandler;
import app.patterns.chain.WardenHandler;
import app.patterns.mediator.ComplaintMediator;
import app.patterns.mediator.ConcreteComplaintMediator;
import app.patterns.observer.ComplaintPublisher;
import app.patterns.observer.StaffNotificationObserver;
import app.patterns.observer.StudentNotificationObserver;
import app.patterns.prototype.RoomPrototypeRegistry;
import app.patterns.prototype.RoomTemplate;
import app.patterns.singleton.*;
import app.patterns.strategy.AllocationStrategy;
import app.patterns.strategy.FirstComeFirstServedStrategy;
import app.patterns.strategy.MeritBasedAllocationStrategy;
import app.patterns.strategy.PreferenceBasedAllocationStrategy;
import app.patterns.template.CheckInProcess;
import app.patterns.template.CheckOutProcess;
import app.patterns.template.HostelProcess;
import app.repository.*;
import app.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.*;
import java.util.concurrent.Executors;

public class RestApiServer {

    private static final int DEFAULT_PORT = 8080;
    private final HttpServer server;
    private final ObjectMapper mapper;

    // Services and Repositories
    private final AuthService authService = new AuthService();
    private final StudentService studentService = new StudentService();
    private final AllocationService allocationService = new AllocationService();
    private final ComplaintService complaintService = new ComplaintService();
    private final ProcessService processService = new ProcessService();
    private final NotificationService notificationService = new NotificationService();

    private final UserDAO userRepository = UserDAO.getInstance();
    private final StudentDAO studentRepository = StudentDAO.getInstance();
    private final RoomDAO roomRepository = RoomDAO.getInstance();
    private final AllocationDAO allocationRepository = AllocationDAO.getInstance();
    private final ComplaintDAO complaintRepository = ComplaintDAO.getInstance();
    private final MaintenanceDAO maintenanceRepository = MaintenanceDAO.getInstance();

    // Pattern components
    private final ComplaintPublisher complaintPublisher = new ComplaintPublisher();
    private final ComplaintMediator complaintMediator = new ConcreteComplaintMediator();
    private final RoomPrototypeRegistry prototypeRegistry = RoomPrototypeRegistry.getDefaultInstance();

    public RestApiServer(int port) throws IOException {
        this.server = HttpServer.create(new InetSocketAddress(port), 0);
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());

        // Attach Observers for the Observer Pattern
        this.complaintPublisher.attach(new StudentNotificationObserver());
        this.complaintPublisher.attach(new StaffNotificationObserver(2)); // Warden ID 2

        // Preload Prototype Registry with RoomTemplates
        List<RoomTemplate> templates = roomRepository.findAllTemplates();
        prototypeRegistry.loadFromList(templates);

        // Register Root Dispatcher
        server.createContext("/", new ApiDispatcher());
        server.setExecutor(Executors.newCachedThreadPool());
    }

    public void start() {
        server.start();
        System.out.println("======================================================");
        System.out.println("  HostelHub REST API Server Running on port " + server.getAddress().getPort());
        System.out.println("  API Base URL: http://localhost:" + server.getAddress().getPort() + "/api");
        System.out.println("  Live SSE Events: http://localhost:" + server.getAddress().getPort() + "/api/events");
        System.out.println("======================================================");
    }

    public void stop() {
        server.stop(0);
    }

    public static void main(String[] args) {
        try {
            int port = DEFAULT_PORT;
            String envPort = System.getenv("PORT");
            if (envPort != null && !envPort.isBlank()) {
                port = Integer.parseInt(envPort.trim());
            }
            // Ensure Database initialized & seeded
            DatabaseManager.getInstance();
            RestApiServer apiServer = new RestApiServer(port);
            apiServer.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private class ApiDispatcher implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Apply CORS headers to all responses
            setCorsHeaders(exchange);

            String method = exchange.getRequestMethod();
            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();

            // Serve static frontend files if non-API path
            if (!path.startsWith("/api")) {
                if (serveStaticFile(exchange, path)) {
                    return;
                }
            }

            // SSE stream endpoint
            if ("/api/events".equals(path)) {
                SseBroadcaster.getInstance().registerClient(exchange);
                return;
            }

            try {
                routeRequest(exchange, path, method);
            } catch (Exception e) {
                e.printStackTrace();
                sendJsonResponse(exchange, 500, ApiResponse.fail("Internal Server Error: " + e.getMessage()));
            }
        }

        private void routeRequest(HttpExchange exchange, String path, String method) throws Exception {
            // AUTH
            if ("/api/auth/login".equals(path) && "POST".equalsIgnoreCase(method)) {
                handleLogin(exchange);
            } else if ("/api/auth/register".equals(path) && "POST".equalsIgnoreCase(method)) {
                handleRegister(exchange);
            } else if ("/api/auth/users".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetUsers(exchange);
            }
            // STUDENTS & BUILDER PATTERN
            else if ("/api/students".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetStudents(exchange);
            } else if ("/api/students".equals(path) && "POST".equalsIgnoreCase(method)) {
                handleCreateStudent(exchange);
            } else if (path.startsWith("/api/students/user/") && "GET".equalsIgnoreCase(method)) {
                int userId = Integer.parseInt(path.substring("/api/students/user/".length()));
                handleGetStudentByUserId(exchange, userId);
            } else if (path.startsWith("/api/students/") && "GET".equalsIgnoreCase(method)) {
                int studentId = Integer.parseInt(path.substring("/api/students/".length()));
                handleGetStudentById(exchange, studentId);
            }
            // HOSTELS & ROOMS
            else if ("/api/hostels".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetHostels(exchange);
            } else if ("/api/rooms".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetRooms(exchange);
            } else if (path.matches("^/api/rooms/\\d+/status$") && "POST".equalsIgnoreCase(method)) {
                int roomId = Integer.parseInt(path.split("/")[3]);
                handleUpdateRoomStatus(exchange, roomId);
            } else if (path.matches("^/api/rooms/\\d+$") && "GET".equalsIgnoreCase(method)) {
                int roomId = Integer.parseInt(path.substring("/api/rooms/".length()));
                handleGetRoomById(exchange, roomId);
            }
            // TEMPLATES & PROTOTYPE PATTERN
            else if ("/api/templates".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetTemplates(exchange);
            } else if ("/api/templates".equals(path) && "POST".equalsIgnoreCase(method)) {
                handleCreateTemplate(exchange);
            } else if ("/api/templates/clone".equals(path) && "POST".equalsIgnoreCase(method)) {
                handleCloneTemplate(exchange);
            }
            // ALLOCATIONS & STRATEGY PATTERN
            else if ("/api/allocations".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetAllocations(exchange);
            } else if ("/api/allocations/requests".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetRequests(exchange);
            } else if ("/api/allocations/requests".equals(path) && "POST".equalsIgnoreCase(method)) {
                handleSubmitAllocationRequest(exchange);
            } else if ("/api/allocations/execute".equals(path) && "POST".equalsIgnoreCase(method)) {
                handleExecuteAllocation(exchange);
            } else if (path.startsWith("/api/allocations/student/") && "GET".equalsIgnoreCase(method)) {
                int studentId = Integer.parseInt(path.substring("/api/allocations/student/".length()));
                handleGetStudentAllocation(exchange, studentId);
            }
            // COMPLAINTS & CHAIN OF RESPONSIBILITY / MEDIATOR / OBSERVER
            else if ("/api/complaints".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetComplaints(exchange);
            } else if ("/api/complaints".equals(path) && "POST".equalsIgnoreCase(method)) {
                handleCreateComplaint(exchange);
            } else if (path.matches("^/api/complaints/\\d+/escalate$") && "POST".equalsIgnoreCase(method)) {
                int complaintId = Integer.parseInt(path.split("/")[3]);
                handleEscalateComplaint(exchange, complaintId);
            } else if (path.matches("^/api/complaints/\\d+/status$") && "POST".equalsIgnoreCase(method)) {
                int complaintId = Integer.parseInt(path.split("/")[3]);
                handleUpdateComplaintStatus(exchange, complaintId);
            } else if (path.matches("^/api/complaints/\\d+/escalations$") && "GET".equalsIgnoreCase(method)) {
                int complaintId = Integer.parseInt(path.split("/")[3]);
                handleGetEscalations(exchange, complaintId);
            } else if (path.matches("^/api/complaints/\\d+/assign$") && "POST".equalsIgnoreCase(method)) {
                int complaintId = Integer.parseInt(path.split("/")[3]);
                handleAssignMaintenance(exchange, complaintId);
            } else if (path.matches("^/api/complaints/\\d+$") && "GET".equalsIgnoreCase(method)) {
                int complaintId = Integer.parseInt(path.substring("/api/complaints/".length()));
                handleGetComplaintById(exchange, complaintId);
            }
            // TEMPLATE METHOD PATTERN PROCESS
            else if ("/api/process/execute".equals(path) && "POST".equalsIgnoreCase(method)) {
                handleExecuteProcess(exchange);
            } else if ("/api/process/logs".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetProcessLogs(exchange);
            }
            // NOTIFICATIONS
            else if (path.startsWith("/api/notifications/user/") && "GET".equalsIgnoreCase(method)) {
                int userId = Integer.parseInt(path.substring("/api/notifications/user/".length()));
                handleGetNotifications(exchange, userId);
            } else if (path.matches("^/api/notifications/\\d+/read$") && "POST".equalsIgnoreCase(method)) {
                int notifId = Integer.parseInt(path.split("/")[3]);
                handleMarkNotificationRead(exchange, notifId);
            }
            // SYSTEM & DESIGN PATTERNS META
            else if ("/api/system/stats".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetSystemStats(exchange);
            } else if ("/api/system/singleton-info".equals(path) && "GET".equalsIgnoreCase(method)) {
                handleGetSingletonInfo(exchange);
            } else if ("/api/patterns/meta".equals(path) && "GET".equalsIgnoreCase(method)) {
                sendJsonResponse(exchange, 200, ApiResponse.ok("Design Patterns Metadata", PatternMetaController.getPatternsMetadata()));
            } else {
                sendJsonResponse(exchange, 404, ApiResponse.fail("Endpoint not found: " + method + " " + path));
            }
        }
    }

    // ----------------------------------------------------
    // AUTH CONTROLLERS
    // ----------------------------------------------------
    private void handleLogin(HttpExchange exchange) throws IOException {
        LoginRequest req = mapper.readValue(exchange.getRequestBody(), LoginRequest.class);
        User user = authService.authenticate(req.username(), req.password());
        if (user == null) {
            sendJsonResponse(exchange, 401, ApiResponse.fail("Invalid username or password"));
            return;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("userId", user.getUserId());
        data.put("username", user.getUsername());
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());
        data.put("role", user.getRole().name());

        if (user.getRole() == Role.STUDENT) {
            Student student = studentService.getStudentByUserId(user.getUserId());
            data.put("student", student);
            if (student != null) {
                Map<String, Object> allocation = allocationRepository.getAllocationForStudent(student.getStudentId());
                data.put("allocation", allocation);
            }
        }

        sendJsonResponse(exchange, 200, ApiResponse.ok("Login successful", data));
    }

    private void handleRegister(HttpExchange exchange) throws IOException {
        RegisterRequest req = mapper.readValue(exchange.getRequestBody(), RegisterRequest.class);
        if (req.username() == null || req.password() == null || req.fullName() == null || req.email() == null) {
            sendJsonResponse(exchange, 400, ApiResponse.fail("Username, password, full name, and email are required"));
            return;
        }

        User existing = userRepository.findByUsername(req.username());
        if (existing != null) {
            sendJsonResponse(exchange, 409, ApiResponse.fail("Username already exists"));
            return;
        }

        Role role = Role.STUDENT;
        if (req.role() != null) {
            try {
                role = Role.valueOf(req.role().toUpperCase());
            } catch (Exception ignored) {}
        }

        User createdUser = userRepository.createUser(req.username(), req.password(), role, req.fullName(), req.email());
        if (createdUser == null) {
            sendJsonResponse(exchange, 500, ApiResponse.fail("Failed to create user account"));
            return;
        }

        Student student = null;
        if (role == Role.STUDENT) {
            String code = req.studentCode() != null ? req.studentCode() : "STU-" + System.currentTimeMillis() % 10000;
            int year = req.academicYear() != null ? req.academicYear() : 1;
            String gender = req.gender() != null ? req.gender() : "FEMALE";
            double merit = req.resolvedCgpa();
            String phone = req.contactNumber() != null ? req.contactNumber() : "9876543210";
            String emergency = req.emergencyContact() != null ? req.emergencyContact() : "9876543211";
            List<Integer> prefs = req.preferredHostelIds() != null ? req.preferredHostelIds() : List.of(1);

            // Use Builder Pattern
            student = studentService.createStudentProfile(
                    createdUser.getUserId(), code, year, gender, merit, phone, emergency, prefs
            );
        }

        Map<String, Object> data = new HashMap<>();
        data.put("userId", createdUser.getUserId());
        data.put("username", createdUser.getUsername());
        data.put("fullName", createdUser.getFullName());
        data.put("role", createdUser.getRole().name());
        data.put("student", student);

        sendJsonResponse(exchange, 201, ApiResponse.ok("User registered successfully", data));
    }

    private void handleGetUsers(HttpExchange exchange) throws IOException {
        List<User> users = userRepository.findAllUsers();
        sendJsonResponse(exchange, 200, ApiResponse.ok("Users retrieved", users));
    }

    // ----------------------------------------------------
    // STUDENT CONTROLLERS (BUILDER PATTERN)
    // ----------------------------------------------------
    private void handleGetStudents(HttpExchange exchange) throws IOException {
        List<Student> students = studentService.getAllStudents();
        sendJsonResponse(exchange, 200, ApiResponse.ok("Students retrieved", students));
    }

    private void handleGetStudentById(HttpExchange exchange, int studentId) throws IOException {
        Student student = studentService.getStudentByStudentId(studentId);
        if (student == null) {
            sendJsonResponse(exchange, 404, ApiResponse.fail("Student not found"));
            return;
        }
        sendJsonResponse(exchange, 200, ApiResponse.ok("Student retrieved", student));
    }

    private void handleGetStudentByUserId(HttpExchange exchange, int userId) throws IOException {
        Student student = studentService.getStudentByUserId(userId);
        if (student == null) {
            sendJsonResponse(exchange, 404, ApiResponse.fail("Student not found for user ID: " + userId));
            return;
        }
        Map<String, Object> allocation = allocationRepository.getAllocationForStudent(student.getStudentId());
        Map<String, Object> data = new HashMap<>();
        data.put("student", student);
        data.put("allocation", allocation);
        sendJsonResponse(exchange, 200, ApiResponse.ok("Student profile retrieved", data));
    }

    private void handleCreateStudent(HttpExchange exchange) throws IOException {
        StudentProfileRequest req = mapper.readValue(exchange.getRequestBody(), StudentProfileRequest.class);

        try {
            // Demonstrates Builder Pattern directly
            Student student = new StudentBuilder()
                    .setUserId(req.userId())
                    .setStudentCode(req.studentCode())
                    .setFullName(req.fullName())
                    .setAcademicYear(req.academicYear())
                    .setGender(req.gender())
                    .setMeritScore(req.resolvedCgpa())
                    .setContactNumber(req.contactNumber())
                    .setEmergencyContact(req.emergencyContact())
                    .setPreferredHostelIds(req.preferredHostelIds())
                    .build();

            studentRepository.save(student);
            Student saved = studentRepository.findByUserId(req.userId());

            SseBroadcaster.getInstance().broadcast("STUDENT_CREATED", mapper.writeValueAsString(saved));
            sendJsonResponse(exchange, 201, ApiResponse.ok("Student profile built and saved successfully (Builder Pattern)", saved));
        } catch (Exception e) {
            sendJsonResponse(exchange, 400, ApiResponse.fail("Builder validation error: " + e.getMessage()));
        }
    }

    // ----------------------------------------------------
    // ROOMS & HOSTELS
    // ----------------------------------------------------
    private void handleGetHostels(HttpExchange exchange) throws IOException {
        List<Hostel> hostels = roomRepository.findAllHostels();
        sendJsonResponse(exchange, 200, ApiResponse.ok("Hostels retrieved", hostels));
    }

    private void handleGetRooms(HttpExchange exchange) throws IOException {
        List<Room> rooms = roomRepository.findAllRooms();
        sendJsonResponse(exchange, 200, ApiResponse.ok("Rooms retrieved", rooms));
    }

    private void handleGetRoomById(HttpExchange exchange, int roomId) throws IOException {
        Room room = roomRepository.findRoomById(roomId);
        if (room == null) {
            sendJsonResponse(exchange, 404, ApiResponse.fail("Room not found"));
            return;
        }
        sendJsonResponse(exchange, 200, ApiResponse.ok("Room retrieved", room));
    }

    private void handleUpdateRoomStatus(HttpExchange exchange, int roomId) throws IOException {
        Map<String, Object> body = mapper.readValue(exchange.getRequestBody(), Map.class);
        String status = (String) body.get("status");
        if (status == null) {
            sendJsonResponse(exchange, 400, ApiResponse.fail("Status is required"));
            return;
        }
        roomRepository.updateRoomStatus(roomId, status);
        Room updated = roomRepository.findRoomById(roomId);
        SseBroadcaster.getInstance().broadcast("ROOM_UPDATED", mapper.writeValueAsString(updated));
        sendJsonResponse(exchange, 200, ApiResponse.ok("Room status updated", updated));
    }

    // ----------------------------------------------------
    // TEMPLATES & PROTOTYPE PATTERN
    // ----------------------------------------------------
    private void handleGetTemplates(HttpExchange exchange) throws IOException {
        List<RoomTemplate> templates = roomRepository.findAllTemplates();
        sendJsonResponse(exchange, 200, ApiResponse.ok("Room templates retrieved", templates));
    }

    private void handleCreateTemplate(HttpExchange exchange) throws IOException {
        Map<String, Object> body = mapper.readValue(exchange.getRequestBody(), Map.class);
        String name = (String) body.get("templateName");
        String roomType = (String) body.get("roomType");
        int capacity = ((Number) body.get("capacity")).intValue();
        double baseFee = ((Number) body.get("baseFee")).doubleValue();
        List<String> amenities = (List<String>) body.get("amenities");

        RoomTemplate template = new RoomTemplate(0, name, roomType, capacity, baseFee, amenities);
        int generatedId = roomRepository.saveTemplate(template);
        RoomTemplate saved = roomRepository.findTemplateById(generatedId);

        // Register in Prototype Registry
        prototypeRegistry.registerTemplate(saved.getTemplateName(), saved);

        sendJsonResponse(exchange, 201, ApiResponse.ok("Room template created", saved));
    }

    private void handleCloneTemplate(HttpExchange exchange) throws IOException {
        CloneTemplateRequest req = mapper.readValue(exchange.getRequestBody(), CloneTemplateRequest.class);

        // Demonstrates Prototype Pattern: getClonedTemplate clones prototype
        RoomTemplate cloned;
        try {
            if (prototypeRegistry.hasTemplate(req.sourceTemplateName())) {
                cloned = prototypeRegistry.getClonedTemplate(req.sourceTemplateName());
            } else {
                // Find in DB
                List<RoomTemplate> all = roomRepository.findAllTemplates();
                RoomTemplate source = all.stream()
                        .filter(t -> t.getTemplateName().equalsIgnoreCase(req.sourceTemplateName()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Template not found: " + req.sourceTemplateName()));
                cloned = source.clonePrototype();
            }
        } catch (Exception e) {
            sendJsonResponse(exchange, 404, ApiResponse.fail("Prototype cloning failed: " + e.getMessage()));
            return;
        }

        // Apply modifications to the cloned prototype
        String newName = req.newTemplateName() != null ? req.newTemplateName() : cloned.getTemplateName() + " (Clone)";
        String roomType = req.roomType() != null ? req.roomType() : cloned.getRoomType();
        int capacity = req.capacity() > 0 ? req.capacity() : cloned.getCapacity();
        double baseFee = req.baseFee() > 0 ? req.baseFee() : cloned.getBaseFee();
        List<String> amenities = req.amenities() != null ? req.amenities() : cloned.getAmenities();

        RoomTemplate customizedClone = new RoomTemplate(0, newName, roomType, capacity, baseFee, amenities);
        int savedId = roomRepository.saveTemplate(customizedClone);
        RoomTemplate finalTemplate = roomRepository.findTemplateById(savedId);

        // Register new cloned prototype in the registry
        prototypeRegistry.registerTemplate(finalTemplate.getTemplateName(), finalTemplate);

        Map<String, Object> data = new HashMap<>();
        data.put("original", req.sourceTemplateName());
        data.put("cloned", finalTemplate);

        SseBroadcaster.getInstance().broadcast("TEMPLATE_CLONED", mapper.writeValueAsString(data));
        sendJsonResponse(exchange, 201, ApiResponse.ok("Room template cloned successfully (Prototype Pattern)", data));
    }

    // ----------------------------------------------------
    // ALLOCATION & STRATEGY PATTERN
    // ----------------------------------------------------
    private void handleGetAllocations(HttpExchange exchange) throws IOException {
        List<Map<String, Object>> list = allocationRepository.findAllAllocationsWithDetails();
        sendJsonResponse(exchange, 200, ApiResponse.ok("Room allocations retrieved", list));
    }

    private void handleGetRequests(HttpExchange exchange) throws IOException {
        List<AllocationRequest> requests = allocationRepository.findAllRequests();
        sendJsonResponse(exchange, 200, ApiResponse.ok("Allocation requests retrieved", requests));
    }

    private void handleSubmitAllocationRequest(HttpExchange exchange) throws IOException {
        AllocationSubmissionRequest req = mapper.readValue(exchange.getRequestBody(), AllocationSubmissionRequest.class);
        if (allocationRepository.hasActiveAllocation(req.studentId())) {
            sendJsonResponse(exchange, 400, ApiResponse.fail("Student already has an active allocation"));
            return;
        }

        int reqId = allocationRepository.createRequest(req.studentId(), req.preferredHostelId());
        SseBroadcaster.getInstance().broadcast("REQUEST_SUBMITTED", "{\"requestId\":" + reqId + ",\"studentId\":" + req.studentId() + "}");
        sendJsonResponse(exchange, 201, ApiResponse.ok("Allocation request submitted successfully", Map.of("requestId", reqId)));
    }

    private void handleExecuteAllocation(HttpExchange exchange) throws IOException {
        ExecuteAllocationRequest req = mapper.readValue(exchange.getRequestBody(), ExecuteAllocationRequest.class);
        String strategyName = req.strategy() != null ? req.strategy().toUpperCase() : "MERIT_BASED";

        // Demonstrates Strategy Pattern: Dynamic strategy instantiation
        AllocationStrategy strategy;
        switch (strategyName) {
            case "FIRST_COME_FIRST_SERVED" -> strategy = new FirstComeFirstServedStrategy();
            case "PREFERENCE_BASED" -> strategy = new PreferenceBasedAllocationStrategy();
            case "MERIT_BASED" -> strategy = new MeritBasedAllocationStrategy();
            default -> {
                sendJsonResponse(exchange, 400, ApiResponse.fail("Invalid strategy. Choose MERIT_BASED, FIRST_COME_FIRST_SERVED, or PREFERENCE_BASED"));
                return;
            }
        }

        List<AllocationRequest> pending = allocationRepository.findPendingRequests();
        List<Student> students = studentService.getAllStudents();

        if (pending.isEmpty()) {
            sendJsonResponse(exchange, 200, ApiResponse.ok("No pending requests to allocate with " + strategy.getStrategyName(), Map.of("assignedCount", 0)));
            return;
        }

        try {
            int allocatedCount = allocationService.processAllocations(strategy, pending, students);

            Map<String, Object> data = new HashMap<>();
            data.put("strategyUsed", strategy.getStrategyName());
            data.put("requestsProcessed", pending.size());
            data.put("roomsAssigned", allocatedCount);

            SseBroadcaster.getInstance().broadcast("ALLOCATION_EXECUTED", mapper.writeValueAsString(data));
            sendJsonResponse(exchange, 200, ApiResponse.ok("Allocation execution completed with " + strategy.getStrategyName(), data));
        } catch (Exception e) {
            sendJsonResponse(exchange, 400, ApiResponse.fail("Allocation failed: " + e.getMessage()));
        }
    }

    private void handleGetStudentAllocation(HttpExchange exchange, int studentId) throws IOException {
        Map<String, Object> allocation = allocationRepository.getAllocationForStudent(studentId);
        if (allocation == null) {
            sendJsonResponse(exchange, 404, ApiResponse.fail("No active room allocation found for student ID: " + studentId));
            return;
        }
        sendJsonResponse(exchange, 200, ApiResponse.ok("Allocation details retrieved", allocation));
    }

    // ----------------------------------------------------
    // COMPLAINTS (CHAIN OF RESPONSIBILITY, OBSERVER, MEDIATOR)
    // ----------------------------------------------------
    private void handleGetComplaints(HttpExchange exchange) throws IOException {
        String query = exchange.getRequestURI().getQuery();
        List<Complaint> complaints;

        if (query != null && query.contains("studentId=")) {
            int studentId = Integer.parseInt(query.split("studentId=")[1].split("&")[0]);
            complaints = complaintRepository.findByStudentId(studentId);
        } else if (query != null && query.contains("role=")) {
            String role = query.split("role=")[1].split("&")[0];
            complaints = complaintRepository.findByHandlerRole(role);
        } else {
            complaints = complaintRepository.findAllComplaints();
        }

        sendJsonResponse(exchange, 200, ApiResponse.ok("Complaints retrieved", complaints));
    }

    private void handleGetComplaintById(HttpExchange exchange, int complaintId) throws IOException {
        Complaint c = complaintRepository.findById(complaintId);
        if (c == null) {
            sendJsonResponse(exchange, 404, ApiResponse.fail("Complaint not found"));
            return;
        }
        List<Map<String, Object>> escalations = complaintRepository.getEscalationHistory(complaintId);
        Map<String, Object> data = new HashMap<>();
        data.put("complaint", c);
        data.put("escalations", escalations);
        sendJsonResponse(exchange, 200, ApiResponse.ok("Complaint details retrieved", data));
    }

    private void handleCreateComplaint(HttpExchange exchange) throws IOException {
        CreateComplaintRequest req = mapper.readValue(exchange.getRequestBody(), CreateComplaintRequest.class);
        String severity = req.severity() != null ? req.severity().toUpperCase() : "MEDIUM";

        Complaint created = complaintRepository.createComplaint(
                req.studentId(), req.category(), req.title(), req.description(), severity
        );

        if (created == null) {
            sendJsonResponse(exchange, 500, ApiResponse.fail("Failed to create complaint"));
            return;
        }

        // Demonstrates Mediator Pattern: dispatching initial submission
        complaintMediator.handleComplaintSubmission(created);

        // Demonstrates Observer Pattern: notify attached observers
        complaintPublisher.notifyObservers(created, "SUBMITTED", "Submitted with severity: " + severity);

        SseBroadcaster.getInstance().broadcast("COMPLAINT_CREATED", mapper.writeValueAsString(created));
        sendJsonResponse(exchange, 201, ApiResponse.ok("Complaint created and routed through Mediator", created));
    }

    private void handleEscalateComplaint(HttpExchange exchange, int complaintId) throws IOException {
        EscalateComplaintRequest req = mapper.readValue(exchange.getRequestBody(), EscalateComplaintRequest.class);
        Complaint complaint = complaintRepository.findById(complaintId);
        if (complaint == null) {
            sendJsonResponse(exchange, 404, ApiResponse.fail("Complaint not found"));
            return;
        }

        String fromRole = complaint.getCurrentHandlerRole();

        // Demonstrates Chain of Responsibility Pattern: Warden -> ChiefWarden -> Dean
        WardenHandler warden = new WardenHandler();
        ChiefWardenHandler chiefWarden = new ChiefWardenHandler();
        DeanHandler dean = new DeanHandler();

        warden.setNextHandler(chiefWarden);
        chiefWarden.setNextHandler(dean);

        // Advance through chain based on starting handler
        ComplaintHandler startHandler = switch (fromRole) {
            case "CHIEF_WARDEN" -> chiefWarden;
            case "DEAN" -> dean;
            default -> warden;
        };

        // Forcing escalation step forward
        ComplaintHandler effectiveHandler = startHandler;
        if ("WARDEN".equalsIgnoreCase(fromRole)) {
            effectiveHandler = chiefWarden;
        } else if ("CHIEF_WARDEN".equalsIgnoreCase(fromRole)) {
            effectiveHandler = dean;
        }

        boolean handled = effectiveHandler.handleEscalation(complaint, req.reason(), req.escalatedByUserId());

        if (handled) {
            complaintRepository.updateStatus(complaintId, complaint.getStatus(), complaint.getCurrentHandlerRole());
            complaintRepository.logEscalation(
                    complaintId, fromRole, complaint.getCurrentHandlerRole(),
                    req.reason() != null ? req.reason() : "Escalated for administrative intervention",
                    req.escalatedByUserId() > 0 ? req.escalatedByUserId() : 1
            );

            // Demonstrates Mediator Pattern: notify role transition
            complaintMediator.notifyStatusChange(complaint, complaint.getStatus(), complaint.getCurrentHandlerRole());

            // Demonstrates Observer Pattern: notify student and staff observers
            complaintPublisher.notifyObservers(complaint, "ESCALATED", "Escalated from " + fromRole + " to " + complaint.getCurrentHandlerRole());

            Complaint updated = complaintRepository.findById(complaintId);
            SseBroadcaster.getInstance().broadcast("COMPLAINT_ESCALATED", mapper.writeValueAsString(updated));
            sendJsonResponse(exchange, 200, ApiResponse.ok("Complaint escalated via Chain of Responsibility: " + fromRole + " -> " + complaint.getCurrentHandlerRole(), updated));
        } else {
            sendJsonResponse(exchange, 400, ApiResponse.fail("Complaint could not be escalated by chain handler"));
        }
    }

    private void handleUpdateComplaintStatus(HttpExchange exchange, int complaintId) throws IOException {
        UpdateComplaintStatusRequest req = mapper.readValue(exchange.getRequestBody(), UpdateComplaintStatusRequest.class);
        Complaint complaint = complaintRepository.findById(complaintId);
        if (complaint == null) {
            sendJsonResponse(exchange, 404, ApiResponse.fail("Complaint not found"));
            return;
        }

        String newStatus = req.status() != null ? req.status().toUpperCase() : complaint.getStatus();
        String newHandler = req.handlerRole() != null ? req.handlerRole().toUpperCase() : complaint.getCurrentHandlerRole();

        complaintRepository.updateStatus(complaintId, newStatus, newHandler);
        complaint.setStatus(newStatus);
        complaint.setCurrentHandlerRole(newHandler);

        // Demonstrates Mediator Pattern
        complaintMediator.notifyStatusChange(complaint, newStatus, newHandler);

        // Demonstrates Observer Pattern
        complaintPublisher.notifyObservers(complaint, "STATUS_UPDATE", req.remarks() != null ? req.remarks() : "Status changed to " + newStatus);

        Complaint updated = complaintRepository.findById(complaintId);
        SseBroadcaster.getInstance().broadcast("COMPLAINT_UPDATED", mapper.writeValueAsString(updated));
        sendJsonResponse(exchange, 200, ApiResponse.ok("Complaint status updated via Mediator", updated));
    }

    private void handleGetEscalations(HttpExchange exchange, int complaintId) throws IOException {
        List<Map<String, Object>> escalations = complaintRepository.getEscalationHistory(complaintId);
        sendJsonResponse(exchange, 200, ApiResponse.ok("Escalation timeline retrieved", escalations));
    }

    private void handleAssignMaintenance(HttpExchange exchange, int complaintId) throws IOException {
        AssignTaskRequest req = mapper.readValue(exchange.getRequestBody(), AssignTaskRequest.class);
        maintenanceRepository.createTask(complaintId, req.staffId());
        complaintRepository.updateStatus(complaintId, "IN_PROGRESS", "MAINTENANCE");

        Complaint c = complaintRepository.findById(complaintId);
        if (c != null) {
            complaintMediator.notifyStatusChange(c, "IN_PROGRESS", "MAINTENANCE");
            complaintPublisher.notifyObservers(c, "TASK_ASSIGNED", "Maintenance assigned: " + (req.notes() != null ? req.notes() : ""));
        }

        SseBroadcaster.getInstance().broadcast("TASK_ASSIGNED", "{\"complaintId\":" + complaintId + ",\"staffId\":" + req.staffId() + "}");
        sendJsonResponse(exchange, 200, ApiResponse.ok("Maintenance technician assigned via Mediator", c));
    }

    // ----------------------------------------------------
    // TEMPLATE METHOD PATTERN PROCESS (CHECK-IN / CHECK-OUT)
    // ----------------------------------------------------
    private void handleExecuteProcess(HttpExchange exchange) throws IOException {
        ExecuteProcessRequest req = mapper.readValue(exchange.getRequestBody(), ExecuteProcessRequest.class);

        // Demonstrates Template Method Pattern:
        HostelProcess process = "CHECK_OUT".equalsIgnoreCase(req.processType())
                ? new CheckOutProcess()
                : new CheckInProcess();

        boolean success = process.executeProcess(req.allocationId(), req.studentId(), req.roomId());
        List<String> logSteps = process.getExecutionLog();

        Map<String, Object> data = new HashMap<>();
        data.put("processType", req.processType().toUpperCase());
        data.put("success", success);
        data.put("allocationId", req.allocationId());
        data.put("studentId", req.studentId());
        data.put("roomId", req.roomId());
        data.put("executionSteps", logSteps);

        SseBroadcaster.getInstance().broadcast("PROCESS_EXECUTED", mapper.writeValueAsString(data));
        sendJsonResponse(exchange, 200, ApiResponse.ok(
                success ? "Process sequence executed successfully (Template Method Pattern)" : "Process sequence rejected by Template Method validation", 
                data
        ));
    }

    private void handleGetProcessLogs(HttpExchange exchange) throws IOException {
        List<Map<String, Object>> logs = new ArrayList<>();
        String sql = "SELECT * FROM process_logs ORDER BY created_at DESC LIMIT 50";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> m = new HashMap<>();
                m.put("logId", rs.getInt("log_id"));
                m.put("studentId", rs.getInt("student_id"));
                m.put("processType", rs.getString("process_type"));
                m.put("status", rs.getString("status"));
                m.put("remarks", rs.getString("remarks"));
                m.put("createdAt", rs.getString("created_at"));
                logs.add(m);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        sendJsonResponse(exchange, 200, ApiResponse.ok("Process execution logs", logs));
    }

    // ----------------------------------------------------
    // NOTIFICATIONS
    // ----------------------------------------------------
    private void handleGetNotifications(HttpExchange exchange, int userId) throws IOException {
        List<Notification> notifs = notificationService.getUserNotifications(userId);
        sendJsonResponse(exchange, 200, ApiResponse.ok("Notifications retrieved", notifs));
    }

    private void handleMarkNotificationRead(HttpExchange exchange, int notificationId) throws IOException {
        notificationService.markAsRead(notificationId);
        sendJsonResponse(exchange, 200, ApiResponse.ok("Notification marked as read", null));
    }

    // ----------------------------------------------------
    // SYSTEM STATS & SINGLETON PATTERN INFO
    // ----------------------------------------------------
    private void handleGetSystemStats(HttpExchange exchange) throws IOException {
        Map<String, Object> stats = new HashMap<>();
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement()) {

            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM students")) {
                stats.put("totalStudents", rs.next() ? rs.getInt(1) : 0);
            }
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM rooms")) {
                stats.put("totalRooms", rs.next() ? rs.getInt(1) : 0);
            }
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM rooms WHERE status = 'FULL'")) {
                stats.put("occupiedRooms", rs.next() ? rs.getInt(1) : 0);
            }
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM rooms WHERE status = 'AVAILABLE'")) {
                stats.put("availableRooms", rs.next() ? rs.getInt(1) : 0);
            }
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM rooms WHERE status = 'MAINTENANCE'")) {
                stats.put("maintenanceRooms", rs.next() ? rs.getInt(1) : 0);
            }
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM complaints WHERE status != 'RESOLVED' AND status != 'CLOSED'")) {
                stats.put("pendingComplaints", rs.next() ? rs.getInt(1) : 0);
            }
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM complaints WHERE status = 'RESOLVED' OR status = 'CLOSED'")) {
                stats.put("resolvedComplaints", rs.next() ? rs.getInt(1) : 0);
            }
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM allocation_requests WHERE status = 'PENDING'")) {
                stats.put("pendingAllocations", rs.next() ? rs.getInt(1) : 0);
            }
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM room_allocations WHERE status = 'CHECKED_IN'")) {
                stats.put("activeCheckIns", rs.next() ? rs.getInt(1) : 0);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        sendJsonResponse(exchange, 200, ApiResponse.ok("System statistics", stats));
    }

    private void handleGetSingletonInfo(HttpExchange exchange) throws IOException {
        DatabaseManager instance1 = DatabaseManager.getInstance();
        DatabaseManager instance2 = DatabaseManager.getInstance();

        Map<String, Object> info = new HashMap<>();
        info.put("singletonVerified", instance1 == instance2);
        info.put("instanceHashCode", System.identityHashCode(instance1));
        info.put("className", instance1.getClass().getName());
        info.put("databaseUrl", "jdbc:sqlite:hostel_management.db");
        info.put("driverClass", "org.sqlite.JDBC");
        info.put("threadSafe", true);
        info.put("foreignKeysEnabled", true);

        sendJsonResponse(exchange, 200, ApiResponse.ok("Singleton Pattern verification info", info));
    }

    // ----------------------------------------------------
    // HELPER METHODS
    // ----------------------------------------------------
    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    }

    private void sendJsonResponse(HttpExchange exchange, int statusCode, Object data) throws IOException {
        byte[] bytes = mapper.writeValueAsBytes(data);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private boolean serveStaticFile(HttpExchange exchange, String path) throws IOException {
        java.io.File staticDir = new java.io.File("frontend/dist");
        if (!staticDir.exists() || !staticDir.isDirectory()) {
            staticDir = new java.io.File("dist");
        }
        if (!staticDir.exists() || !staticDir.isDirectory()) {
            return false;
        }

        String relative = path.equals("/") ? "index.html" : path.startsWith("/") ? path.substring(1) : path;
        java.io.File targetFile = new java.io.File(staticDir, relative);

        // Fallback to index.html for SPA routes (e.g. /login, /complaints, /dashboard)
        if (!targetFile.exists() || targetFile.isDirectory()) {
            targetFile = new java.io.File(staticDir, "index.html");
        }

        if (!targetFile.exists() || !targetFile.isFile()) {
            return false;
        }

        String mimeType = getMimeType(targetFile.getName());
        exchange.getResponseHeaders().set("Content-Type", mimeType);
        exchange.sendResponseHeaders(200, targetFile.length());
        try (java.io.InputStream in = new java.io.FileInputStream(targetFile);
             OutputStream out = exchange.getResponseBody()) {
            in.transferTo(out);
        }
        return true;
    }

    private String getMimeType(String name) {
        String lower = name.toLowerCase();
        if (lower.endsWith(".html")) return "text/html; charset=UTF-8";
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript; charset=UTF-8";
        if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
        if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".woff")) return "font/woff";
        if (lower.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }
}
