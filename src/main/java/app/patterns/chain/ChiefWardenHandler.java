package app.patterns.chain;

import app.model.Complaint;

public class ChiefWardenHandler extends ComplaintHandler {

    @Override
    public boolean handleEscalation(Complaint complaint, String reason, int escalatedByUserId) {
        if ("CRITICAL".equalsIgnoreCase(complaint.getSeverity())) {
            if (nextHandler != null) {
                return nextHandler.handleEscalation(complaint, reason, escalatedByUserId);
            }
        }
        complaint.setCurrentHandlerRole("CHIEF_WARDEN");
        complaint.setStatus("ESCALATED");
        return true;
    }

    @Override
    public String getRoleName() { return "CHIEF_WARDEN"; }
}