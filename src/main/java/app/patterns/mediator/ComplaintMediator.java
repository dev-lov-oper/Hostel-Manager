package app.patterns.mediator;

import app.model.Complaint;

/**
 * Mediator Pattern Interface: ComplaintMediator
 * Defines central routing contract between Student, Warden, and Maintenance.
 */
public interface ComplaintMediator {
    void handleComplaintSubmission(Complaint complaint);
    void notifyStatusChange(Complaint complaint, String newStatus, String newHandlerRole);
}