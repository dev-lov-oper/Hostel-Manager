package app.model;

import java.sql.Timestamp;

public class AllocationRequest {
    private final int requestId;
    private final int studentId;
    private final Integer preferredHostelId;
    private final String status; // PENDING, APPROVED, REJECTED
    private final Timestamp requestedAt;

    public AllocationRequest(int requestId, int studentId, Integer preferredHostelId, String status, Timestamp requestedAt) {
        this.requestId = requestId;
        this.studentId = studentId;
        this.preferredHostelId = preferredHostelId;
        this.status = status;
        this.requestedAt = requestedAt;
    }

    public int getRequestId() { return requestId; }
    public int getStudentId() { return studentId; }
    public Integer getPreferredHostelId() { return preferredHostelId; }
    public String getStatus() { return status; }
    public Timestamp getRequestedAt() { return requestedAt; }
}