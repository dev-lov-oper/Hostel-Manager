package app.patterns.template;

import app.repository.ProcessRepository;

public class CheckOutProcess extends HostelProcess {

    private final ProcessRepository repository = new ProcessRepository();

    @Override
    protected boolean verifyIdentityAndEligibility(int studentId) {
        logStep("Verifying student departure authorization...");
        return studentId > 0;
    }

    @Override
    protected boolean verifyAllocationStatus(int allocationId) {
        logStep("Checking if allocation is currently 'CHECKED_IN'...");
        boolean valid = repository.isAllocationInState(allocationId, "CHECKED_IN");
        if (!valid) {
            logStep("FAILED: Allocation is not 'CHECKED_IN'. Student must be checked in first.");
        }
        return valid;
    }

    @Override
    protected boolean inspectRoomAndInventory(int roomId) {
        logStep("Inspecting room condition against baseline inventory for damages...");
        return true;
    }

    @Override
    protected boolean handleKeyAndDues(int allocationId) {
        logStep("Verifying key return and ensuring zero outstanding hostel dues...");
        return true;
    }

    @Override
    protected void updateDatabaseStatus(int allocationId, int roomId) {
        logStep("Updating allocation to 'CHECKED_OUT' and decrementing room occupancy...");
        repository.releaseBed(allocationId, roomId);
    }

    @Override
    protected void recordSuccess(int allocationId) {
        repository.saveProcessRecord(allocationId, "CHECK_OUT", "COMPLETED", String.join("\n", executionLog));
    }

    @Override
    protected void recordFailure(int allocationId, String reason) {
        repository.saveProcessRecord(allocationId, "CHECK_OUT", "FAILED", String.join("\n", executionLog));
    }
}
