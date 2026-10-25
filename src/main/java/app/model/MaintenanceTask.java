package app.model;

import java.sql.Timestamp;

public class MaintenanceTask {
    private final int taskId;
    private final int complaintId;
    private final int assignedStaffId;
    private String status; // PENDING, IN_PROGRESS, COMPLETED
    private String completionNotes;
    private final Timestamp assignedAt;

    public MaintenanceTask(int taskId, int complaintId, int assignedStaffId, String status, String completionNotes, Timestamp assignedAt) {
        this.taskId = taskId;
        this.complaintId = complaintId;
        this.assignedStaffId = assignedStaffId;
        this.status = status;
        this.completionNotes = completionNotes;
        this.assignedAt = assignedAt;
    }

    public int getTaskId() { return taskId; }
    public int getComplaintId() { return complaintId; }
    public int getAssignedStaffId() { return assignedStaffId; }
    public String getStatus() { return status; }
    public String getCompletionNotes() { return completionNotes; }
    public Timestamp getAssignedAt() { return assignedAt; }

    public void setStatus(String status) { this.status = status; }
    public void setCompletionNotes(String notes) { this.completionNotes = notes; }
}