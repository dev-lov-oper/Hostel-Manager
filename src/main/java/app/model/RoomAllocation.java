package app.model;

import java.sql.Timestamp;

public class RoomAllocation {

    private int allocationId;
    private int studentId;
    private int roomId;
    private String allocationStatus;
    private String approvalStatus;
    private Timestamp createdAt;

    public RoomAllocation() {
    }

    public RoomAllocation(int allocationId, int studentId, int roomId, 
                          String allocationStatus, String approvalStatus, Timestamp createdAt) {
        this.allocationId = allocationId;
        this.studentId = studentId;
        this.roomId = roomId;
        this.allocationStatus = allocationStatus;
        this.approvalStatus = approvalStatus;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public int getAllocationId() {
        return allocationId;
    }

    public void setAllocationId(int allocationId) {
        this.allocationId = allocationId;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public int getRoomId() {
        return roomId;
    }

    public void setRoomId(int roomId) {
        this.roomId = roomId;
    }

    public String getAllocationStatus() {
        return allocationStatus;
    }

    public void setAllocationStatus(String allocationStatus) {
        this.allocationStatus = allocationStatus;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}