package app.patterns;

import app.model.Complaint;
import app.patterns.mediator.ComplaintMediator;
import app.patterns.mediator.ConcreteComplaintMediator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.sql.Timestamp;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class MediatorTest {

    private ComplaintMediator mediator;

    @BeforeEach
    void setUp() {
        mediator = new ConcreteComplaintMediator();
    }

    @Test
    @DisplayName("Mediator Pattern: Dispatch complaint to initial handler")
    void testDispatchComplaint() {
        Complaint complaint = new Complaint(
                101,
                1,
                "PLUMBING",
                "Leaking Tap",
                "Bathroom tap leaking continuously",
                "MEDIUM",
                "SUBMITTED",
                "WARDEN",
                new Timestamp(System.currentTimeMillis())
        );

        assertDoesNotThrow(() -> mediator.handleComplaintSubmission(complaint));
        assertEquals("SUBMITTED", complaint.getStatus());
    }

    @Test
    @DisplayName("Mediator Pattern: Route status change event through central coordinator")
    void testRouteStatusUpdate() {
        Complaint complaint = new Complaint(
                102,
                2,
                "ELECTRICAL",
                "Power Socket Broken",
                "Sparking when plugging in charger",
                "HIGH",
                "SUBMITTED",
                "WARDEN",
                new Timestamp(System.currentTimeMillis())
        );

        mediator.notifyStatusChange(complaint, "IN_PROGRESS", "MAINTENANCE");

        assertEquals("IN_PROGRESS", complaint.getStatus());
        assertEquals("MAINTENANCE", complaint.getCurrentHandlerRole());
    }
}