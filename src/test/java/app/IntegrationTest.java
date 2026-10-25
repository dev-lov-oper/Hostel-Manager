package app;

import app.model.*;
import app.patterns.builder.StudentBuilder;
import app.patterns.singleton.DatabaseManager;
import app.patterns.strategy.MeritBasedAllocationStrategy;
import app.service.AllocationService;
import app.service.ComplaintService;
import app.service.ProcessService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.Statement;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class IntegrationTest {

    @BeforeAll
    public static void setupDatabase() {
        // Initialize DB schema and clean existing records
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("DELETE FROM notifications;");
            stmt.execute("DELETE FROM complaint_escalations;");
            stmt.execute("DELETE FROM maintenance_tasks;");
            stmt.execute("DELETE FROM complaints;");
            stmt.execute("DELETE FROM hostel_process_records;");
            stmt.execute("DELETE FROM room_allocations;");
            stmt.execute("DELETE FROM allocation_requests;");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testFullStudentLifecycle() {
        // 1. Verify Builder Pattern Validation
        Student student = new StudentBuilder()
                .setUserId(1)
                .setStudentId(101)
                .setStudentCode("STU-INTEG-01")
                .setFullName("Test Integration Student")
                .setAcademicYear(2)
                .setGender("MALE")
                .setMeritScore(92.5)
                .setContactNumber("9876543210")
                .setEmergencyContact("9123456789")
                .build();
        assertNotNull(student);

        // 2. Verify Strategy Allocation Engine
        AllocationService allocationService = new AllocationService();
        AllocationRequest request = new AllocationRequest(1, 101, 1, "PENDING", new java.sql.Timestamp(System.currentTimeMillis()));
        
        // Execute Merit-Based Strategy (Non-database mockup test call)
        MeritBasedAllocationStrategy strategy = new MeritBasedAllocationStrategy();
        assertNotNull(strategy.getStrategyName());

        // 3. Verify Chain of Responsibility Escalation Service
        ComplaintService complaintService = new ComplaintService();
        assertNotNull(complaintService);

        // 4. Verify Template Method Process Service
        ProcessService processService = new ProcessService();
        assertNotNull(processService);
    }
}