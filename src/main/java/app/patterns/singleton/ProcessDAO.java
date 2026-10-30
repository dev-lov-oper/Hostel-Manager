package app.patterns.singleton;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Singleton Pattern / DAO: ProcessDAO
 * Resides in singleton folder, manages Process lifecycle persistence via DatabaseManager singleton.
 */
public class ProcessDAO {

    private static ProcessDAO instance;

    public ProcessDAO() {
    }

    public static synchronized ProcessDAO getInstance() {
        if (instance == null) {
            instance = new ProcessDAO();
        }
        return instance;
    }

    /**
     * Records a process step execution into the audit log.
     */
    public void saveProcessRecord(int allocationId, String processType, String status, String remarks) {
        String logSql = "INSERT INTO process_logs (student_id, process_type, status, remarks, created_at) " +
                     "VALUES (COALESCE((SELECT student_id FROM room_allocations WHERE allocation_id = ?), ?), ?, ?, ?, CURRENT_TIMESTAMP)";
        String recordSql = "INSERT INTO hostel_process_records (allocation_id, process_type, status, execution_log, processed_at) " +
                     "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            try (PreparedStatement stmt = conn.prepareStatement(logSql)) {
                stmt.setInt(1, allocationId);
                stmt.setInt(2, allocationId);
                stmt.setString(3, processType);
                stmt.setString(4, status);
                stmt.setString(5, remarks);
                stmt.executeUpdate();
            }
            try (PreparedStatement stmt = conn.prepareStatement(recordSql)) {
                stmt.setInt(1, allocationId);
                stmt.setString(2, processType);
                stmt.setString(3, status);
                stmt.setString(4, remarks);
                stmt.executeUpdate();
            }
        } catch (SQLException e) {
            System.err.println("Process DB Notice: " + e.getMessage());
        }
    }

    /**
     * Checks if a student or allocation matches the required state.
     */
    public boolean isAllocationInState(int id, String requiredState) {
        String sql = "SELECT COUNT(*) FROM room_allocations WHERE (allocation_id = ? OR student_id = ?) AND status = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            stmt.setInt(2, id);
            stmt.setString(3, requiredState);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Updates the allocation status for a given student or allocation.
     */
    public void updateAllocationState(int id, String newState) {
        String sql = "UPDATE room_allocations SET status = ? WHERE allocation_id = ? OR student_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, newState);
            stmt.setInt(2, id);
            stmt.setInt(3, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Releases a room bed allocation and sets the status to CHECKED_OUT.
     */
    public void releaseBed(int id, int roomId) {
        String updateAllocationSql = "UPDATE room_allocations SET status = 'CHECKED_OUT' WHERE allocation_id = ? OR student_id = ?";
        String updateRoomSql = "UPDATE rooms SET current_occupancy = MAX(0, current_occupancy - 1) WHERE room_id = ?";

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement stmt1 = conn.prepareStatement(updateAllocationSql);
                 PreparedStatement stmt2 = conn.prepareStatement(updateRoomSql)) {

                stmt1.setInt(1, id);
                stmt1.setInt(2, id);
                stmt1.executeUpdate();

                stmt2.setInt(1, roomId);
                stmt2.executeUpdate();

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
