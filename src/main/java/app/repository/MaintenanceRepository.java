package app.repository;

import java.sql.*;

import app.patterns.singleton.DatabaseManager;

public class MaintenanceRepository {

    public void createTask(int complaintId, int staffId) {
        String sql = "INSERT INTO maintenance_tasks (complaint_id, assigned_staff_id, status) VALUES (?, ?, 'PENDING')";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, complaintId);
            stmt.setInt(2, staffId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void updateTaskStatus(int taskId, String status, String notes) {
        String sql = "UPDATE maintenance_tasks SET status = ?, completion_notes = ?, completed_at = CURRENT_TIMESTAMP WHERE task_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setString(2, notes);
            stmt.setInt(3, taskId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public int getComplaintIdForTask(int taskId) {
        String sql = "SELECT complaint_id FROM maintenance_tasks WHERE task_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, taskId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }
}