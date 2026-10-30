package app.api.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Provides comprehensive metadata on all 8 Design Patterns implemented in the codebase.
 */
public class PatternMetaController {

    public static List<Map<String, Object>> getPatternsMetadata() {
        List<Map<String, Object>> patterns = new ArrayList<>();

        // 1. Builder Pattern
        Map<String, Object> builder = new HashMap<>();
        builder.put("id", "builder");
        builder.put("name", "Builder Pattern");
        builder.put("category", "Creational");
        builder.put("intent", "Construct complex student profiles step-by-step with robust validation before creation.");
        builder.put("problem", "Creating a student profile requires multiple mandatory and optional fields (contact numbers, academic year, merit scores, emergency contacts, hostel preferences). A constructor with many parameters leads to telescoping constructors and unvalidated state.");
        builder.put("solution", "StudentBuilder encapsulates validation logic (e.g. academic year 1-5, merit score 0-100, phone regex) and produces an immutable Student object only when build() is invoked.");
        builder.put("keyClasses", List.of("app.patterns.builder.StudentBuilder", "app.model.Student", "app.service.StudentService"));
        builder.put("flow", List.of(
                "UI collects personal, academic, and hostel preference parameters across multi-step form.",
                "StudentBuilder chained methods (.setUserId, .setFullName, .setMeritScore) accumulate state.",
                "StudentBuilder.build() enforces validation rules (regex, ranges, null-checks).",
                "Immutable Student domain model is instantiated and saved to database."
        ));
        builder.put("sampleCode", """
            Student student = new StudentBuilder()
                .setUserId(userId)
                .setStudentCode("STU001")
                .setFullName("Alice Smith")
                .setAcademicYear(2)
                .setGender("FEMALE")
                .setMeritScore(92.5)
                .setContactNumber("9876543210")
                .setEmergencyContact("9876543211")
                .setPreferredHostelIds(List.of(1, 2))
                .build();
        """);
        patterns.add(builder);

        // 2. Strategy Pattern
        Map<String, Object> strategy = new HashMap<>();
        strategy.put("id", "strategy");
        strategy.put("name", "Strategy Pattern");
        strategy.put("category", "Behavioral");
        strategy.put("intent", "Define a family of interchangeable room allocation algorithms and switch dynamically at runtime.");
        strategy.put("problem", "Different allocation policies are needed at different phases: Merit-based for academic excellence, First-Come-First-Served for open enrollment, and Preference-based to honor student choices. Hardcoding logic in one place violates Open/Closed Principle.");
        strategy.put("solution", "AllocationStrategy defines the contract. Concrete classes MeritBasedAllocationStrategy, FirstComeFirstServedStrategy, and PreferenceBasedAllocationStrategy encapsulate the distinct algorithms.");
        strategy.put("keyClasses", List.of(
                "app.patterns.strategy.AllocationStrategy",
                "app.patterns.strategy.MeritBasedAllocationStrategy",
                "app.patterns.strategy.FirstComeFirstServedStrategy",
                "app.patterns.strategy.PreferenceBasedAllocationStrategy",
                "app.service.AllocationService"
        ));
        strategy.put("flow", List.of(
                "Administrator selects the allocation policy (Merit-Based, FCFS, or Preference-Based).",
                "AllocationService receives the chosen AllocationStrategy instance.",
                "Strategy processes pending requests, sorts accordingly, and maps students to available rooms.",
                "AllocationService commits the assignments transactionally in SQLite."
        ));
        strategy.put("sampleCode", """
            AllocationStrategy strategy = switch (type) {
                case "MERIT_BASED" -> new MeritBasedAllocationStrategy();
                case "FIRST_COME_FIRST_SERVED" -> new FirstComeFirstServedStrategy();
                case "PREFERENCE_BASED" -> new PreferenceBasedAllocationStrategy();
                default -> throw new IllegalArgumentException("Unknown strategy: " + type);
            };
            allocationService.processAllocations(strategy, pendingRequests, students);
        """);
        patterns.add(strategy);

        // 3. Chain of Responsibility Pattern
        Map<String, Object> chain = new HashMap<>();
        chain.put("id", "chain");
        chain.put("name", "Chain of Responsibility");
        chain.put("category", "Behavioral");
        chain.put("intent", "Pass complaint escalation requests along a dynamic chain of handlers until one handles it.");
        chain.put("problem", "Complaints vary in severity. A minor broken chair should be resolved by a Warden; a high electrical failure requires Chief Warden budget approval; a hazardous plumbing flood requires the Dean. Senders shouldn't know the exact resolution hierarchy.");
        chain.put("solution", "ComplaintHandler defines the handler chain. WardenHandler handles standard issues; escalates HIGH/CRITICAL to ChiefWardenHandler; ChiefWardenHandler escalates CRITICAL to DeanHandler.");
        chain.put("keyClasses", List.of(
                "app.patterns.chain.ComplaintHandler",
                "app.patterns.chain.WardenHandler",
                "app.patterns.chain.ChiefWardenHandler",
                "app.patterns.chain.DeanHandler",
                "app.service.ComplaintService"
        ));
        chain.put("flow", List.of(
                "Complaint escalation request initiated by student or staff.",
                "WardenHandler inspects complaint severity. If LOW/MEDIUM, Warden handles it.",
                "If HIGH or CRITICAL, WardenHandler forwards to nextHandler (ChiefWardenHandler).",
                "If CRITICAL, ChiefWardenHandler forwards to nextHandler (DeanHandler).",
                "The handling authority updates complaint status and writes audit log to complaint_escalations."
        ));
        chain.put("sampleCode", """
            // Build Handler Chain in ComplaintService:
            WardenHandler warden = new WardenHandler();
            ChiefWardenHandler chiefWarden = new ChiefWardenHandler();
            DeanHandler dean = new DeanHandler();
            warden.setNextHandler(chiefWarden);
            chiefWarden.setNextHandler(dean);

            warden.handleEscalation(complaint, reason, escalatedByUserId);
        """);
        patterns.add(chain);

        // 4. Observer Pattern
        Map<String, Object> observer = new HashMap<>();
        observer.put("id", "observer");
        observer.put("name", "Observer Pattern");
        observer.put("category", "Behavioral");
        observer.put("intent", "Provide a one-to-many subscription mechanism to notify stakeholders when complaint states change.");
        observer.put("problem", "When a complaint is logged, escalated, or resolved, both the affected student and relevant hostel staff need instant notification without tight coupling between complaint logic and notification delivery.");
        observer.put("solution", "ComplaintPublisher manages registered ComplaintObserver subscribers. StudentNotificationObserver and StaffNotificationObserver react to complaint lifecycle events automatically.");
        observer.put("keyClasses", List.of(
                "app.patterns.observer.ComplaintPublisher",
                "app.patterns.observer.ComplaintObserver",
                "app.patterns.observer.StudentNotificationObserver",
                "app.patterns.observer.StaffNotificationObserver"
        ));
        observer.put("flow", List.of(
                "StudentNotificationObserver and StaffNotificationObserver attach to ComplaintPublisher.",
                "Complaint state changes (submitted, escalated, resolved, maintenance assigned).",
                "publisher.notifyObservers(complaint, eventType, details) iterates through observers.",
                "Observers generate targeted database notifications and stream real-time SSE alerts."
        ));
        observer.put("sampleCode", """
            ComplaintPublisher publisher = new ComplaintPublisher();
            publisher.attach(new StudentNotificationObserver());
            publisher.attach(new StaffNotificationObserver());
            publisher.notifyObservers(complaint, "ESCALATED", "Escalated to " + handlerRole);
        """);
        patterns.add(observer);

        // 5. Mediator Pattern
        Map<String, Object> mediator = new HashMap<>();
        mediator.put("id", "mediator");
        mediator.put("name", "Mediator Pattern");
        mediator.put("category", "Behavioral");
        mediator.put("intent", "Encapsulate communication between students, wardens, and maintenance personnel to prevent chaotic many-to-many dependencies.");
        mediator.put("problem", "Direct interactions between students, wardens, and maintenance workers create tight coupling, conflicting updates, and unlogged status modifications.");
        mediator.put("solution", "ConcreteComplaintMediator / HostelMediator coordinates all complaint submissions, status transitions, and role handoffs, orchestrating communication via NotificationService.");
        mediator.put("keyClasses", List.of(
                "app.patterns.mediator.ComplaintMediator",
                "app.patterns.mediator.ConcreteComplaintMediator",
                "app.patterns.mediator.HostelMediator"
        ));
        mediator.put("flow", List.of(
                "Colleagues (Student, Warden, Maintenance) do not talk directly to each other.",
                "All actions pass through ComplaintMediator (handleComplaintSubmission, notifyStatusChange).",
                "Mediator synchronizes complaint status, updates handler role, and delivers notifications."
        ));
        mediator.put("sampleCode", """
            ComplaintMediator mediator = new ConcreteComplaintMediator();
            mediator.handleComplaintSubmission(newComplaint);
            mediator.notifyStatusChange(complaint, "IN_PROGRESS", "MAINTENANCE");
        """);
        patterns.add(mediator);

        // 6. Template Method Pattern
        Map<String, Object> template = new HashMap<>();
        template.put("id", "template");
        template.put("name", "Template Method");
        template.put("category", "Behavioral");
        template.put("intent", "Define the invariant skeleton of the check-in and check-out workflows while letting subclasses specialize individual steps.");
        template.put("problem", "Both Check-In and Check-Out follow a strict, mandatory 5-step sequence (Identity verification -> Allocation check -> Room inventory -> Keys & dues clearance -> Database update). Missing a step can lead to unauthorized access or unrecovered damages.");
        template.put("solution", "HostelProcess declares final executeProcess() defining the exact sequential lifecycle. CheckInProcess and CheckOutProcess implement the specific step details.");
        template.put("keyClasses", List.of(
                "app.patterns.template.HostelProcess",
                "app.patterns.template.CheckInProcess",
                "app.patterns.template.CheckOutProcess",
                "app.service.ProcessService"
        ));
        template.put("flow", List.of(
                "HostelProcess.executeProcess() begins: Step 1: verifyIdentityAndEligibility().",
                "Step 2: verifyAllocationStatus().",
                "Step 3: inspectRoomAndInventory().",
                "Step 4: handleKeyAndDues().",
                "Step 5: updateDatabaseStatus() & recordSuccess() into process_logs table."
        ));
        template.put("sampleCode", """
            // Template method sequence in HostelProcess:
            public final boolean executeProcess(int allocationId, int studentId, int roomId) {
                if (!verifyIdentityAndEligibility(studentId)) return false;
                if (!verifyAllocationStatus(allocationId)) return false;
                if (!inspectRoomAndInventory(roomId)) return false;
                if (!handleKeyAndDues(allocationId)) return false;
                updateDatabaseStatus(allocationId, roomId);
                recordSuccess(allocationId);
                return true;
            }
        """);
        patterns.add(template);

        // 7. Prototype Pattern
        Map<String, Object> prototype = new HashMap<>();
        prototype.put("id", "prototype");
        prototype.put("name", "Prototype Pattern");
        prototype.put("category", "Creational");
        prototype.put("intent", "Clone existing room templates and specifications to rapidly configure new room types without costly recreation from scratch.");
        prototype.put("problem", "Hostels have standard configurations (Single Deluxe, Double Classic, Quad Dorm). Creating customized rooms by specifying all amenities, dimensions, and capacities from scratch is tedious and error-prone.");
        prototype.put("solution", "RoomTemplate implements RoomPrototype (clonePrototype()), providing deep copies of amenities and specifications. RoomPrototypeRegistry manages available prototypes for instant cloning and customization.");
        prototype.put("keyClasses", List.of(
                "app.patterns.prototype.RoomPrototype",
                "app.patterns.prototype.RoomPrototypeRegistry",
                "app.model.RoomTemplate",
                "app.model.Room"
        ));
        prototype.put("flow", List.of(
                "RoomPrototypeRegistry registers base templates (Single, Double, Dormitory).",
                "Administrator requests a clone of an existing template.",
                "template.clonePrototype() creates an independent deep-copy with cloned amenities.",
                "Administrator customizes features (adds AC, modifies fee) and saves the new configuration."
        ));
        prototype.put("sampleCode", """
            RoomPrototypeRegistry registry = RoomPrototypeRegistry.getDefaultInstance();
            RoomTemplate cloned = registry.getClonedTemplate("Double Classic En-Suite");
            cloned.addAmenity("Balcony Garden View");
            // Also used internally by Room to clone template amenities:
            this.amenities = template.clonePrototype().getAmenities();
        """);
        patterns.add(prototype);

        // 8. Singleton Pattern
        Map<String, Object> singleton = new HashMap<>();
        singleton.put("id", "singleton");
        singleton.put("name", "Singleton Pattern");
        singleton.put("category", "Creational");
        singleton.put("intent", "Ensure single shared instances of DatabaseManager and all Data Access Objects (DAOs) inside the singleton package.");
        singleton.put("problem", "SQLite is a file-based embedded database. Opening multiple uncoordinated connections causes database locks. Uncontrolled DAO instances cause memory overhead and redundant statements.");
        singleton.put("solution", "DatabaseManager and all DAO classes (UserDAO, StudentDAO, RoomDAO, AllocationDAO, ComplaintDAO, MaintenanceDAO, NotificationDAO, ProcessDAO) reside in the app.patterns.singleton package, each providing thread-safe getInstance() access.");
        singleton.put("keyClasses", List.of(
                "app.patterns.singleton.DatabaseManager",
                "app.patterns.singleton.UserDAO",
                "app.patterns.singleton.StudentDAO",
                "app.patterns.singleton.RoomDAO",
                "app.patterns.singleton.AllocationDAO",
                "app.patterns.singleton.ComplaintDAO",
                "app.patterns.singleton.MaintenanceDAO",
                "app.patterns.singleton.NotificationDAO",
                "app.patterns.singleton.ProcessDAO"
        ));
        singleton.put("flow", List.of(
                "All DAO classes are placed inside the singleton package (app.patterns.singleton).",
                "Each DAO provides a synchronized getInstance() singleton accessor and connects via DatabaseManager.getInstance().",
                "PRAGMA foreign_keys = ON and PRAGMA busy_timeout = 5000 configured on every connection.",
                "All services, workflows, and controllers route queries through the singleton DAOs."
        ));
        singleton.put("sampleCode", """
            // Central DatabaseManager Singleton
            DatabaseManager dbManager = DatabaseManager.getInstance();

            // Singleton DAOs placed inside app.patterns.singleton:
            UserDAO userDAO = UserDAO.getInstance();
            RoomDAO roomDAO = RoomDAO.getInstance();
            AllocationDAO allocDAO = AllocationDAO.getInstance();
            ComplaintDAO complaintDAO = ComplaintDAO.getInstance();
            ProcessDAO processDAO = ProcessDAO.getInstance();
        """);
        patterns.add(singleton);

        return patterns;
    }
}

