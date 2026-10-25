package app.repository;

import app.patterns.singleton.DatabaseManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ProcessRepository {

    /**
     * Records a process step execution into the audit log.
     */
    public void saveProcessRecord(int studentId, String processType, String status, String remarks) {
        String sql = "INSERT INTO process_logs (student_id, process_type, status, remarks, created_at) " +
                     "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";

        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, studentId);
            stmt.setString(2, processType);
            stmt.setString(3, status);
            stmt.setString(4, remarks);
            stmt.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Process DB Notice: Log skipped due to constraint for student_id=" 
                    + studentId + " (" + e.getMessage() + ")");
        }
    }

    /**
     * Checks if a student has an allocation matching the required state.
     */
    public boolean isAllocationInState(int studentId, String requiredState) {
        String sql = "SELECT COUNT(*) FROM room_allocations WHERE student_id = ? AND allocation_status = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, studentId);
            stmt.setString(2, requiredState);

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
     * Updates the allocation status for a given student.
     */
    public void updateAllocationState(int studentId, String newState) {
        String sql = "UPDATE room_allocations SET allocation_status = ? WHERE student_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, newState);
            stmt.setInt(2, studentId);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Releases a room bed allocation and sets the student allocation status to CHECKED_OUT.
     */
    public void releaseBed(int studentId, int roomId) {
        String updateAllocationSql = "UPDATE room_allocations SET allocation_status = 'CHECKED_OUT' WHERE student_id = ?";
        String updateRoomSql = "UPDATE rooms SET occupied_beds = MAX(0, occupied_beds - 1) WHERE room_id = ?";

        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement stmt1 = conn.prepareStatement(updateAllocationSql);
                 PreparedStatement stmt2 = conn.prepareStatement(updateRoomSql)) {

                stmt1.setInt(1, studentId);
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