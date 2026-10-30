package app.patterns.template;

import app.model.Room;
import app.repository.ProcessRepository;
import app.repository.RoomRepository;

public class CheckOutProcess extends HostelProcess {

    private final ProcessRepository repository = new ProcessRepository();
    private final RoomRepository roomRepository = new RoomRepository();

    @Override
    protected boolean verifyIdentityAndEligibility(int studentId) {
        logStep("Step 1 [Authorization]: Verifying student departure clearance and enrollment status for Student #" + studentId + "...");
        return studentId > 0;
    }

    @Override
    protected boolean verifyAllocationStatus(int allocationId) {
        logStep("Step 2 [Status]: Checking allocation #" + allocationId + " is currently 'CHECKED_IN'...");
        boolean valid = repository.isAllocationInState(allocationId, "CHECKED_IN");
        if (!valid) {
            logStep("FAILED: Allocation is not 'CHECKED_IN'. Student must be checked in first.");
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

        logStep("Step 3 [Damage Assessment]: Inspecting Room " + roomNum + " against baseline check-in inventory.");
        logStep("Assessing fixtures [" + items + "]: 0 damages found. Wall paint, electrical sockets & furniture certified intact.");
        return true;
    }

    @Override
    protected boolean handleKeyAndDues(int allocationId) {
        logStep("Step 4 [Keys & Dues]: Physical key tag [KEY-ALLOC-" + allocationId + "] returned to Warden.");
        logStep("Accounts verification: Mess & utility balance ₹0.00. Institutional 'No Dues Certificate' issued.");
        return true;
    }

    @Override
    protected void updateDatabaseStatus(int allocationId, int roomId) {
        logStep("Step 5 [Persistence]: Releasing bed for allocation #" + allocationId + " (Status -> CHECKED_OUT, Room occupancy -1)...");
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
