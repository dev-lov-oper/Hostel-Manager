package app.patterns.template;

import app.repository.ProcessRepository;

public class CheckInProcess extends HostelProcess {

    private final ProcessRepository repository = new ProcessRepository();

    @Override
    protected boolean verifyIdentityAndEligibility(int studentId) {
        logStep("Verifying student ID card and institutional eligibility...");
        return studentId > 0;
    }

    @Override
    protected boolean verifyAllocationStatus(int allocationId) {
        logStep("Checking if allocation is in 'ALLOCATED' state...");
        return repository.isAllocationInState(allocationId, "ALLOCATED");
    }

    @Override
    protected boolean inspectRoomAndInventory(int roomId) {
        logStep("Recording baseline room inventory condition (Furniture, Fixtures, Lock)...");
        return true;
    }

    @Override
    protected boolean handleKeyAndDues(int allocationId) {
        logStep("Issuing room keys to student...");
        return true;
    }

    @Override
    protected void updateDatabaseStatus(int allocationId, int roomId) {
        logStep("Updating allocation status to 'CHECKED_IN'...");
        repository.updateAllocationState(allocationId, "CHECKED_IN");
    }

    @Override
    protected void recordSuccess(int allocationId) {
        repository.saveProcessRecord(allocationId, "CHECK_IN", "COMPLETED", String.join("\n", executionLog));
    }

    @Override
    protected void recordFailure(int allocationId, String reason) {
        repository.saveProcessRecord(allocationId, "CHECK_IN", "FAILED", String.join("\n", executionLog));
    }
}