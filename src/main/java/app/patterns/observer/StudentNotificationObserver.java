package app.patterns.observer;

import app.model.Complaint;
import app.patterns.singleton.NotificationDAO;

public class StudentNotificationObserver implements ComplaintObserver {
    private final NotificationDAO repository = NotificationDAO.getInstance();

    @Override
    public void onComplaintEvent(Complaint complaint, String eventType, String details) {
        String title = "Complaint Status Update: " + complaint.getTitle();
        String message = "Your complaint status changed to " + complaint.getStatus() + ". " + details;
        repository.saveNotification(complaint.getStudentId(), title, message);
    }
}
