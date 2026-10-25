package app.model;

import java.sql.Timestamp;

public class Complaint {
    private final int complaintId;
    private final int studentId;
    private final String category;
    private final String title;
    private final String description;
    private final String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String status;         // SUBMITTED, ASSIGNED, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED
    private String currentHandlerRole; // WARDEN, CHIEF_WARDEN, DEAN
    private final Timestamp createdAt;

    public Complaint(int complaintId, int studentId, String category, String title,
                     String description, String severity, String status,
                     String currentHandlerRole, Timestamp createdAt) {
        this.complaintId = complaintId;
        this.studentId = studentId;
        this.category = category;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.currentHandlerRole = currentHandlerRole;
        this.createdAt = createdAt;
    }

    public int getComplaintId() { return complaintId; }
    public int getStudentId() { return studentId; }
    public String getCategory() { return category; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getSeverity() { return severity; }
    public String getStatus() { return status; }
    public String getCurrentHandlerRole() { return currentHandlerRole; }
    public Timestamp getCreatedAt() { return createdAt; }

    public void setStatus(String status) { this.status = status; }
    public void setCurrentHandlerRole(String role) { this.currentHandlerRole = role; }
}