package app.service;

import app.model.Complaint;
import app.patterns.mediator.ComplaintMediator;
import app.patterns.mediator.ConcreteComplaintMediator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.sql.Timestamp;

import static org.junit.jupiter.api.Assertions.*;

public class ComplaintServiceTest {

    private ComplaintMediator mediator;

    @BeforeEach
    void setUp() {
        mediator = new ConcreteComplaintMediator();
    }

    @Test
    @DisplayName("Complaint Service: Verify complaint object initialization")
    void testComplaintCreation() {
        Complaint complaint = new Complaint(
                1,
                10,
                "ELECTRICAL",
                "Fan Not Working",
                "Ceiling fan speed regulator is broken.",
                "HIGH",
                "SUBMITTED",
                "WARDEN",
                new Timestamp(System.currentTimeMillis())
        );

        assertNotNull(complaint);
        assertEquals(1, complaint.getComplaintId());
        assertEquals(10, complaint.getStudentId());
        assertEquals("ELECTRICAL", complaint.getCategory());
        assertEquals("HIGH", complaint.getSeverity()); // Updated to getSeverity()
        assertEquals("SUBMITTED", complaint.getStatus());
        assertEquals("WARDEN", complaint.getCurrentHandlerRole());
    }

    @Test
    @DisplayName("Complaint Service: Verify status routing via ConcreteComplaintMediator")
    void testComplaintStatusRouting() {
        Complaint complaint = new Complaint(
                2,
                12,
                "PLUMBING",
                "Sink Clogged",
                "Water overflowing from room sink.",
                "MEDIUM",
                "SUBMITTED",
                "WARDEN",
                new Timestamp(System.currentTimeMillis())
        );

        assertDoesNotThrow(() -> mediator.handleComplaintSubmission(complaint));

        mediator.notifyStatusChange(complaint, "IN_PROGRESS", "MAINTENANCE");
        assertEquals("IN_PROGRESS", complaint.getStatus());
        assertEquals("MAINTENANCE", complaint.getCurrentHandlerRole());

        mediator.notifyStatusChange(complaint, "RESOLVED", "NONE");
        assertEquals("RESOLVED", complaint.getStatus());
        assertEquals("NONE", complaint.getCurrentHandlerRole());
    }
}