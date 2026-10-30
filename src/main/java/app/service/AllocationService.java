package app.service;

import app.exception.AllocationException;
import app.model.AllocationRequest;
import app.model.Room;
import app.model.Student;
import app.patterns.singleton.AllocationDAO;
import app.patterns.singleton.DatabaseManager;
import app.patterns.singleton.RoomDAO;
import app.patterns.strategy.AllocationStrategy;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class AllocationService {
    private final RoomDAO roomRepository = RoomDAO.getInstance();
    private final AllocationDAO allocationRepository = AllocationDAO.getInstance();

    public int processAllocations(AllocationStrategy strategy, List<AllocationRequest> requests, List<Student> students) {
        List<Room> availableRooms = roomRepository.findAvailableRooms();
        Map<Student, Room> assignments = strategy.allocate(requests, students, availableRooms);

        if (assignments.isEmpty()) {
            return 0;
        }

        Connection conn = null;
        int count = 0;
        try {
            conn = DatabaseManager.getInstance().getConnection();
            conn.setAutoCommit(false); // Begin SQLite Transaction

            for (Map.Entry<Student, Room> entry : assignments.entrySet()) {
                Student student = entry.getKey();
                Room room = entry.getValue();

                if (allocationRepository.hasActiveAllocation(student.getStudentId())) {
                    throw new AllocationException("Student ID " + student.getStudentId() + " already has an active allocation.");
                }

                // Persist allocation & update room state
                allocationRepository.saveAllocation(conn, student.getStudentId(), room.getRoomId(), strategy.getStrategyName());
                allocationRepository.updateRequestStatus(conn, student.getStudentId(), "APPROVED");
                roomRepository.updateOccupancy(conn, room.getRoomId(), room.getCurrentOccupancy(), room.getStatus());
                count++;
            }

            conn.commit(); // Commit Transaction
        } catch (Exception e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            }
            throw new AllocationException("Transactional allocation failed: " + e.getMessage());
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException e) { e.printStackTrace(); }
            }
        }
        return count;
    }
}
