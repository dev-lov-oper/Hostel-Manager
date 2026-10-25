package app.patterns;

import app.patterns.template.CheckInProcess;
import app.patterns.template.HostelProcess;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class TemplateTest {

    @Test
    public void testCheckInWorkflowFailsForInvalidStudentId() {
        HostelProcess checkIn = new CheckInProcess();
        
        // Student ID = 0 (Invalid)
        boolean result = checkIn.executeProcess(1, 0, 101);

        assertFalse(result);
        assertTrue(checkIn.getExecutionLog().stream().anyMatch(log -> log.contains("FAILED")));
    }
}