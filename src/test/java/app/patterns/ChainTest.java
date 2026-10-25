package app.patterns;

import app.model.Complaint;
import app.patterns.chain.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.sql.Timestamp;
import static org.junit.jupiter.api.Assertions.*;

public class ChainTest {

    private ComplaintHandler chainHead;

    @BeforeEach
    public void setup() {
        WardenHandler warden = new WardenHandler();
        ChiefWardenHandler chiefWarden = new ChiefWardenHandler();
        DeanHandler dean = new DeanHandler();

        warden.setNextHandler(chiefWarden);
        chiefWarden.setNextHandler(dean);

        chainHead = warden;
    }

    @Test
    public void testCriticalComplaintEscalatesToDean() {
        Complaint complaint = new Complaint(1, 10, "SAFETY", "Gas Leak", "Leak in block B", "CRITICAL", "SUBMITTED", "WARDEN", new Timestamp(System.currentTimeMillis()));

        boolean result = chainHead.handleEscalation(complaint, "Immediate safety risk", 1);

        assertTrue(result);
        assertEquals("DEAN", complaint.getCurrentHandlerRole());
        assertEquals("ESCALATED", complaint.getStatus());
    }

    @Test
    public void testHighSeverityEscalatesToChiefWarden() {
        Complaint complaint = new Complaint(2, 10, "ELECTRICAL", "Power Outage", "No power on floor 3", "HIGH", "SUBMITTED", "WARDEN", new Timestamp(System.currentTimeMillis()));

        boolean result = chainHead.handleEscalation(complaint, "Requires senior authority", 1);

        assertTrue(result);
        assertEquals("CHIEF_WARDEN", complaint.getCurrentHandlerRole());
    }
}