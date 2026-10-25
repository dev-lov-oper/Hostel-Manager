package app.patterns;

import app.model.Complaint;
import app.patterns.observer.*;
import org.junit.jupiter.api.Test;
import java.sql.Timestamp;
import java.util.concurrent.atomic.AtomicBoolean;
import static org.junit.jupiter.api.Assertions.*;

public class ObserverTest {

    @Test
    public void testNotificationTriggeredOnEvent() {
        ComplaintPublisher publisher = new ComplaintPublisher();
        AtomicBoolean notified = new AtomicBoolean(false);

        publisher.attach((complaint, eventType, details) -> notified.set(true));

        Complaint complaint = new Complaint(1, 10, "PLUMBING", "Leak", "Tap broken", "LOW", "SUBMITTED", "WARDEN", new Timestamp(System.currentTimeMillis()));
        publisher.notifyObservers(complaint, "SUBMITTED", "Submitted.");

        assertTrue(notified.get());
    }
}