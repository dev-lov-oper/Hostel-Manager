package app.patterns.chain;

import app.model.Complaint;

public class WardenHandler extends ComplaintHandler {

    @Override
    public boolean handleEscalation(Complaint complaint, String reason, int escalatedByUserId) {
        // Warden handles standard issues. If HIGH or CRITICAL, escalate to Chief Warden.
        if ("HIGH".equalsIgnoreCase(complaint.getSeverity()) || "CRITICAL".equalsIgnoreCase(complaint.getSeverity())) {
            if (nextHandler != null) {
                return nextHandler.handleEscalation(complaint, reason, escalatedByUserId);
            }
        }
        // Warden resolves standard complaints
        complaint.setCurrentHandlerRole("WARDEN");
        return true;
    }

    @Override
    public String getRoleName() { return "WARDEN"; }
}