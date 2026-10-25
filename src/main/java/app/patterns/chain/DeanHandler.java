package app.patterns.chain;

import app.model.Complaint;

public class DeanHandler extends ComplaintHandler {

    @Override
    public boolean handleEscalation(Complaint complaint, String reason, int escalatedByUserId) {
        complaint.setCurrentHandlerRole("DEAN");
        complaint.setStatus("ESCALATED");
        return true;
    }

    @Override
    public String getRoleName() { return "DEAN"; }
}