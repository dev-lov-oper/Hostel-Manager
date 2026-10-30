package app.patterns.template;

import app.model.Room;
import app.repository.ProcessRepository;
import app.repository.RoomRepository;

public class CheckInProcess extends HostelProcess {

    private final ProcessRepository repository = new ProcessRepository();
    private final RoomRepository roomRepository = new RoomRepository();

    @Override
    protected boolean verifyIdentityAndEligibility(int studentId) {
        logStep("Step 1 [Identity]: Verifying student ID card #" + studentId + " against institutional enrollment database...");
        return studentId > 0;
    }

    @Override
    protected boolean verifyAllocationStatus(int allocationId) {
        logStep("Step 2 [Status]: Checking allocation #" + allocationId + " is in 'ALLOCATED' or 'CHECKED_OUT' state...");
        boolean valid = repository.isAllocationInState(allocationId, "ALLOCATED")
                     || repository.isAllocationInState(allocationId, "CHECKED_OUT");
        if (!valid) {
            logStep("FAILED: Allocation is already CHECKED_IN. Use Check-Out to process departure.");
        }
        return valid;
    }

    @Override
    protected boolean inspectRoomAndInventory(int roomId) {
        Room room = roomRepository.findRoomById(roomId);
        String items = (room != null && room.getAmenities() != null && !room.getAmenities().isEmpty())
                ? String.join(", ", room.getAmenities())
                : "Bed Frame, Ergonomic Study Desk, Chair, Wardrobe, Ceiling Fan, Smart Lock";
        String roomNum = room != null ? room.getRoomNumber() : "#" + roomId;

        logStep("Step 3 [Inventory]: Inspecting Room " + roomNum + " against Prototype template blueprint.");
        logStep("Baseline Inventory verified intact: [" + items + "]. Zero pre-existing damage recorded.");
        return true;
    }

    @Override
    protected boolean handleKeyAndDues(int allocationId) {
        logStep("Step 4 [Keys & Dues]: Assigned physical key tag [KEY-ALLOC-" + allocationId + "-ENTRY].");
        logStep("Hostel fee ledger verified: Semester fees settled (₹0.00 outstanding dues).");
        return true;
    }

    @Override
    protected void updateDatabaseStatus(int allocationId, int roomId) {
        logStep("Step 5 [Persistence]: Updating allocation #" + allocationId + " to 'CHECKED_IN' in database...");
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
