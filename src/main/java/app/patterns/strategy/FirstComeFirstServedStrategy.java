package app.patterns.strategy;

import app.model.AllocationRequest;
import app.model.Room;
import app.model.Student;
import java.util.*;

/**
 * Allocates rooms sequentially based on request submission timestamp (FCFS).
 */
public class FirstComeFirstServedStrategy implements AllocationStrategy {

    @Override
    public Map<Student, Room> allocate(List<AllocationRequest> requests, List<Student> students, List<Room> availableRooms) {
        Map<Student, Room> result = new HashMap<>();
        List<Room> remainingRooms = new ArrayList<>(availableRooms);

        Map<Integer, Student> studentMap = new HashMap<>();
        for (Student s : students) {
            studentMap.put(s.getStudentId(), s);
        }

        // Sort by timestamp ascending (earliest first)
        List<AllocationRequest> sortedRequests = new ArrayList<>(requests);
        sortedRequests.sort(Comparator.comparing(AllocationRequest::getRequestedAt));

        for (AllocationRequest req : sortedRequests) {
            Student student = studentMap.get(req.getStudentId());
            if (student == null) continue;

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
        return "FIRST_COME_FIRST_SERVED";
    }
}