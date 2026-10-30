package app.service;

import app.model.Complaint;
import app.patterns.chain.*;
import app.patterns.singleton.ComplaintDAO;

public class ComplaintService {
    private final ComplaintDAO repository = ComplaintDAO.getInstance();
    private final ComplaintHandler chainHead;

    public ComplaintService() {
        // Build Handler Chain: Warden -> ChiefWarden -> Dean
        WardenHandler warden = new WardenHandler();
        ChiefWardenHandler chiefWarden = new ChiefWardenHandler();
        DeanHandler dean = new DeanHandler();

        warden.setNextHandler(chiefWarden);
        chiefWarden.setNextHandler(dean);

        this.chainHead = warden;
    }

    public boolean escalateComplaint(int complaintId, String reason, int escalatedByUserId) {
        Complaint complaint = repository.findById(complaintId);
        if (complaint == null) return false;

        boolean handled = chainHead.handleEscalation(complaint, reason, escalatedByUserId);
        if (handled) {
            repository.updateStatus(complaintId, complaint.getStatus(), complaint.getCurrentHandlerRole());
        }
        return handled;
    }
}
