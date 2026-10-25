package app.patterns.strategy;

import app.model.AllocationRequest;
import app.model.Room;
import app.model.Student;
import java.util.*;

/**
 * Allocates rooms prioritizing requested hostel preferences.
 */
public class PreferenceBasedAllocationStrategy implements AllocationStrategy {

    @Override
    public Map<Student, Room> allocate(List<AllocationRequest> requests, List<Student> students, List<Room> availableRooms) {
        Map<Student, Room> result = new HashMap<>();
        List<Room> remainingRooms = new ArrayList<>(availableRooms);

        Map<Integer, Student> studentMap = new HashMap<>();
        for (Student s : students) {
            studentMap.put(s.getStudentId(), s);
        }

        for (AllocationRequest req : requests) {
            Student student = studentMap.get(req.getStudentId());
            if (student == null) continue;

            Room matchedRoom = null;

            // 1. Try matching preferred hostel first
            if (req.getPreferredHostelId() != null) {
                matchedRoom = remainingRooms.stream()
                        .filter(r -> r.getHostelId() == req.getPreferredHostelId()
                                && r.getCurrentOccupancy() < r.getCapacity()
                                && "AVAILABLE".equalsIgnoreCase(r.getStatus()))
                        .findFirst()
                        .orElse(null);
            }

            // 2. Fallback to any room if no preferred hostel is available
            if (matchedRoom == null) {
                matchedRoom = remainingRooms.stream()
                        .filter(r -> r.getCurrentOccupancy() < r.getCapacity() && "AVAILABLE".equalsIgnoreCase(r.getStatus()))
                        .findFirst()
                        .orElse(null);
            }

            if (matchedRoom != null) {
                result.put(student, matchedRoom);
                matchedRoom.setCurrentOccupancy(matchedRoom.getCurrentOccupancy() + 1);

                if (matchedRoom.getCurrentOccupancy() >= matchedRoom.getCapacity()) {
                    remainingRooms.remove(matchedRoom);
                }
            }
        }
        return result;
    }

    @Override
    public String getStrategyName() {
        return "PREFERENCE_BASED";
    }
}