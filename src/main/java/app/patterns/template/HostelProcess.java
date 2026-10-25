package app.patterns.template;

import java.util.ArrayList;
import java.util.List;

/**
 * Template Method Pattern: Abstract Hostel Lifecycle Process
 */
public abstract class HostelProcess {

    protected final List<String> executionLog = new ArrayList<>();

    /**
     * Final Template Method defining the fixed process sequence.
     */
    public final boolean executeProcess(int allocationId, int studentId, int roomId) {
        executionLog.clear();
        logStep("Starting process sequence for Allocation ID: " + allocationId);

        try {
            if (!verifyIdentityAndEligibility(studentId)) {
                logStep("FAILED: Identity verification failed.");
                recordFailure(allocationId, "Identity verification failed.");
                return false;
            }

            if (!verifyAllocationStatus(allocationId)) {
                logStep("FAILED: Allocation status invalid.");
                recordFailure(allocationId, "Allocation status invalid.");
                return false;
            }

            if (!inspectRoomAndInventory(roomId)) {
                logStep("FAILED: Room and inventory inspection failed.");
                recordFailure(allocationId, "Room inspection failed.");
                return false;
            }

            if (!handleKeyAndDues(allocationId)) {
                logStep("FAILED: Key/Dues clearance failed.");
                recordFailure(allocationId, "Key/Dues clearance failed.");
                return false;
            }

            updateDatabaseStatus(allocationId, roomId);
            logStep("COMPLETED: Process completed successfully.");
            recordSuccess(allocationId);
            return true;

        } catch (Exception e) {
            logStep("ERROR: Exception occurred - " + e.getMessage());
            recordFailure(allocationId, e.getMessage());
            return false;
        }
    }

    // Step 1: Subclass-defined verification
    protected abstract boolean verifyIdentityAndEligibility(int studentId);

    // Step 2: Subclass-defined allocation state check
    protected abstract boolean verifyAllocationStatus(int allocationId);

    // Step 3: Room/Inventory condition check
    protected abstract boolean inspectRoomAndInventory(int roomId);

    // Step 4: Keys handover / Return and Dues clearance
    protected abstract boolean handleKeyAndDues(int allocationId);

    // Step 5: Database state updates
    protected abstract void updateDatabaseStatus(int allocationId, int roomId);

    // Audit Record Hooks
    protected abstract void recordSuccess(int allocationId);
    protected abstract void recordFailure(int allocationId, String reason);

    protected void logStep(String message) {
        executionLog.add(message);
    }

    public List<String> getExecutionLog() {
        return List.copyOf(executionLog);
    }
}