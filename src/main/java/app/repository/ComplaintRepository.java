package app.repository;

import app.model.Complaint;
import app.patterns.singleton.DatabaseManager;

import java.sql.*;

public class ComplaintRepository {

    public Complaint createComplaint(int studentId, String category, String title, String description, String severity) {
        String sql = "INSERT INTO complaints (student_id, category, title, description, severity, status, current_handler_role) " +
                     "VALUES (?, ?, ?, ?, ?, 'SUBMITTED', 'WARDEN')";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, studentId);
            stmt.setString(2, category);
            stmt.setString(3, title);
            stmt.setString(4, description);
            stmt.setString(5, severity);
            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return findById(rs.getInt(1));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Complaint findById(int complaintId) {
        String sql = "SELECT * FROM complaints WHERE complaint_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, complaintId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new Complaint(
                            rs.getInt("complaint_id"),
                            rs.getInt("student_id"),
                            rs.getString("category"),
                            rs.getString("title"),
                            rs.getString("description"),
                            rs.getString("severity"),
                            rs.getString("status"),
                            rs.getString("current_handler_role"),
                            rs.getTimestamp("created_at")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void updateStatus(int complaintId, String status, String handlerRole) {
        String sql = "UPDATE complaints SET status = ?, current_handler_role = ?, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setString(2, handlerRole);
            stmt.setInt(3, complaintId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}