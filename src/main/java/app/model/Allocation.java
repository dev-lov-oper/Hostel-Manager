package app.model;

import java.sql.Timestamp;

public class Allocation {
    private final int allocationId;
    private final int studentId;
    private final int roomId;
    private final String strategyName;
    private final Timestamp allocatedAt;
    private final String status; // ALLOCATED, CHECKED_IN, CHECKED_OUT, CANCELLED

    public Allocation(int allocationId, int studentId, int roomId, String strategyName, Timestamp allocatedAt, String status) {
        this.allocationId = allocationId;
        this.studentId = studentId;
        this.roomId = roomId;
        this.strategyName = strategyName;
        this.allocatedAt = allocatedAt;
        this.status = status;
    }

    public int getAllocationId() { return allocationId; }
    public int getStudentId() { return studentId; }
    public int getRoomId() { return roomId; }
    public String getStrategyName() { return strategyName; }
    public Timestamp getAllocatedAt() { return allocatedAt; }
    public String getStatus() { return status; }
}