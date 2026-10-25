package app.patterns.strategy;

import app.model.AllocationRequest;
import app.model.Room;
import app.model.Student;
import java.util.*;

/**
 * Allocates rooms prioritizing students with higher merit scores.
 */
public class MeritBasedAllocationStrategy implements AllocationStrategy {

    @Override
    public Map<Student, Room> allocate(List<AllocationRequest> requests, List<Student> students, List<Room> availableRooms) {
        Map<Student, Room> result = new HashMap<>();
        List<Room> remainingRooms = new ArrayList<>(availableRooms);

        // Map student ID to student object
        Map<Integer, Student> studentMap = new HashMap<>();
        for (Student s : students) {
            studentMap.put(s.getStudentId(), s);
        }

        // Sort requests by student merit score descending
        List<AllocationRequest> sortedRequests = new ArrayList<>(requests);
        sortedRequests.sort((r1, r2) -> {
            Student s1 = studentMap.get(r1.getStudentId());
            Student s2 = studentMap.get(r2.getStudentId());
            double merit1 = s1 != null ? s1.getMeritScore() : 0.0;
            double merit2 = s2 != null ? s2.getMeritScore() : 0.0;
            return Double.compare(merit2, merit1); // Highest score first
        });

        for (AllocationRequest req : sortedRequests) {
            Student student = studentMap.get(req.getStudentId());
            if (student == null) continue;

            // Find first available room with spare capacity
            Optional<Room> assignedRoomOpt = remainingRooms.stream()
                    .filter(r -> r.getCurrentOccupancy() < r.getCapacity() && "AVAILABLE".equalsIgnoreCase(r.getStatus()))
                    .findFirst();

            if (assignedRoomOpt.isPresent()) {
                Room assignedRoom = assignedRoomOpt.get();
                result.put(student, assignedRoom);
                assignedRoom.setCurrentOccupancy(assignedRoom.getCurrentOccupancy() + 1);

                if (assignedRoom.getCurrentOccupancy() >= assignedRoom.getCapacity()) {
                    remainingRooms.remove(assignedRoom);
                }
            }
        }
        return result;
    }

    @Override
    public String getStrategyName() {
        return "MERIT_BASED";
    }
}