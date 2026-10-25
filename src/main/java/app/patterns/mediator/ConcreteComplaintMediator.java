package app.patterns.mediator;

import app.model.Complaint;
import app.service.NotificationService;

/**
 * Concrete Mediator Pattern Implementation.
 * Encapsulates how Student, Warden, and Maintenance interact without direct coupling.
 */
public class ConcreteComplaintMediator implements ComplaintMediator {

    private final NotificationService notificationService = new NotificationService();

    @Override
    public void handleComplaintSubmission(Complaint complaint) {
        if (complaint != null) {
            notificationService.sendNotification(
                    complaint.getStudentId(),
                    "Complaint Logged",
                    "Your complaint '" + complaint.getTitle() + "' has been submitted to Warden."
            );
        }
    }

    @Override
    public void notifyStatusChange(Complaint complaint, String newStatus, String newHandlerRole) {
        if (complaint == null) return;

        complaint.setStatus(newStatus);
        complaint.setCurrentHandlerRole(newHandlerRole);

        notificationService.sendNotification(
                complaint.getStudentId(),
                "Complaint Status Updated",
                "Complaint #" + complaint.getComplaintId() + " status changed to: " + newStatus
        );
    }
}