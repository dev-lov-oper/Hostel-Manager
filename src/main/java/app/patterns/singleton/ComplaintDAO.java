package app.patterns.singleton;

import app.model.Complaint;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Singleton Pattern / DAO: ComplaintDAO
 * Resides in singleton folder, manages Complaint persistence via DatabaseManager singleton.
 */
public class ComplaintDAO {

    private static ComplaintDAO instance;

    public ComplaintDAO() {
    }

    public static synchronized ComplaintDAO getInstance() {
        if (instance == null) {
            instance = new ComplaintDAO();
        }
        return instance;
    }

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

    public List<Complaint> findAllComplaints() {
        List<Complaint> complaints = new ArrayList<>();
        String sql = "SELECT * FROM complaints ORDER BY complaint_id DESC";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                complaints.add(new Complaint(
                        rs.getInt("complaint_id"),
                        rs.getInt("student_id"),
                        rs.getString("category"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getString("severity"),
                        rs.getString("status"),
                        rs.getString("current_handler_role"),
                        rs.getTimestamp("created_at")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return complaints;
    }

    public List<Complaint> findByStudentId(int studentId) {
        List<Complaint> complaints = new ArrayList<>();
        String sql = "SELECT * FROM complaints WHERE student_id = ? ORDER BY complaint_id DESC";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    complaints.add(new Complaint(
                            rs.getInt("complaint_id"),
                            rs.getInt("student_id"),
                            rs.getString("category"),
                            rs.getString("title"),
                            rs.getString("description"),
                            rs.getString("severity"),
                            rs.getString("status"),
                            rs.getString("current_handler_role"),
                            rs.getTimestamp("created_at")
                    ));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return complaints;
    }

    public List<Complaint> findByHandlerRole(String role) {
        List<Complaint> complaints = new ArrayList<>();
        String sql = "SELECT * FROM complaints WHERE current_handler_role = ? ORDER BY complaint_id DESC";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, role);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    complaints.add(new Complaint(
                            rs.getInt("complaint_id"),
                            rs.getInt("student_id"),
                            rs.getString("category"),
                            rs.getString("title"),
                            rs.getString("description"),
                            rs.getString("severity"),
                            rs.getString("status"),
                            rs.getString("current_handler_role"),
                            rs.getTimestamp("created_at")
                    ));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return complaints;
    }

    public void logEscalation(int complaintId, String fromRole, String toRole, String reason, int escalatedByUserId) {
        String sql = "INSERT INTO complaint_escalations (complaint_id, from_role, to_role, reason, escalated_by_user_id) " +
                     "VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, complaintId);
            stmt.setString(2, fromRole);
            stmt.setString(3, toRole);
            stmt.setString(4, reason);
            stmt.setInt(5, escalatedByUserId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<Map<String, Object>> getEscalationHistory(int complaintId) {
        List<Map<String, Object>> escalations = new ArrayList<>();
        String sql = "SELECT e.*, u.full_name as escalated_by_name FROM complaint_escalations e " +
                     "LEFT JOIN users u ON e.escalated_by_user_id = u.user_id " +
                     "WHERE e.complaint_id = ? ORDER BY e.escalated_at ASC";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, complaintId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("escalationId", rs.getInt("escalation_id"));
                    map.put("complaintId", rs.getInt("complaint_id"));
                    map.put("fromRole", rs.getString("from_role"));
                    map.put("toRole", rs.getString("to_role"));
                    map.put("reason", rs.getString("reason"));
                    map.put("escalatedByUserId", rs.getInt("escalated_by_user_id"));
                    map.put("escalatedByName", rs.getString("escalated_by_name"));
                    map.put("escalatedAt", rs.getString("escalated_at"));
                    escalations.add(map);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return escalations;
    }
}
