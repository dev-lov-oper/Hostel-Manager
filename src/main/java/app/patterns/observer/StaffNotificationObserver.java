package app.patterns.observer;

import app.model.Complaint;
import app.patterns.singleton.NotificationDAO;

public class StaffNotificationObserver implements ComplaintObserver {
    private final NotificationDAO repository = NotificationDAO.getInstance();
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
