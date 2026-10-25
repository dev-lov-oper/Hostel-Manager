package app.patterns.strategy;

import app.model.AllocationRequest;
import app.model.Room;
import app.model.Student;
import java.util.List;
import java.util.Map;

/**
 * Strategy Pattern Interface for Room Allocation algorithms.
 */
public interface AllocationStrategy {

    /**
     * Executes room assignment for pending requests against available rooms.
     * @return Map of Student to assigned Room.
     */
    Map<Student, Room> allocate(List<AllocationRequest> requests, List<Student> students, List<Room> availableRooms);

    String getStrategyName();
}