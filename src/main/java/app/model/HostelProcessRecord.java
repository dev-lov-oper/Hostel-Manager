package app.model;

import java.sql.Timestamp;

public class HostelProcessRecord {
    private final int recordId;
    private final int allocationId;
    private final String processType; // CHECK_IN, CHECK_OUT
    private final String status;      // STARTED, COMPLETED, FAILED
    private final String executionLog;
    private final Timestamp processedAt;

    public HostelProcessRecord(int recordId, int allocationId, String processType, String status, String executionLog, Timestamp processedAt) {
        this.recordId = recordId;
        this.allocationId = allocationId;
        this.processType = processType;
        this.status = status;
        this.executionLog = executionLog;
        this.processedAt = processedAt;
    }

    public int getRecordId() { return recordId; }
    public int getAllocationId() { return allocationId; }
    public String getProcessType() { return processType; }
    public String getStatus() { return status; }
    public String getExecutionLog() { return executionLog; }
    public Timestamp getProcessedAt() { return processedAt; }
}