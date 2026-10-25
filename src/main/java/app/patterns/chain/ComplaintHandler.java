package app.patterns.chain;

import app.model.Complaint;

/**
 * Chain of Responsibility: Handler Abstraction
 */
public abstract class ComplaintHandler {
    protected ComplaintHandler nextHandler;

    public void setNextHandler(ComplaintHandler nextHandler) {
        this.nextHandler = nextHandler;
    }

    public abstract boolean handleEscalation(Complaint complaint, String reason, int escalatedByUserId);
    public abstract String getRoleName();
}