package app.patterns.observer;

import app.model.Complaint;
import app.repository.NotificationRepository;

public class StaffNotificationObserver implements ComplaintObserver {
    private final NotificationRepository repository = new NotificationRepository();
    private final int staffUserId;

    public StaffNotificationObserver(int staffUserId) {
        this.staffUserId = staffUserId;
    }

    @Override
    public void onComplaintEvent(Complaint complaint, String eventType, String details) {
        String title = "Action Required: Complaint #" + complaint.getComplaintId();
        String message = "Event: " + eventType + " | Details: " + details;
        repository.saveNotification(staffUserId, title, message);
    }
}