package app.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import app.patterns.singleton.DatabaseManager;

public class AllocationRepository {

    public boolean hasActiveAllocation(int studentId) {
        String sql = "SELECT COUNT(*) FROM room_allocations WHERE student_id = ? AND status IN ('ALLOCATED', 'CHECKED_IN')";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, studentId);
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

    public void saveAllocation(Connection conn, int studentId, int roomId, String strategyName) throws SQLException {
        String sql = "INSERT INTO room_allocations (student_id, room_id, allocation_strategy, status) VALUES (?, ?, ?, 'ALLOCATED')";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, studentId);
            stmt.setInt(2, roomId);
            stmt.setString(3, strategyName);
            stmt.executeUpdate();
        }
    }

    public void updateRequestStatus(Connection conn, int studentId, String status) throws SQLException {
        String sql = "UPDATE allocation_requests SET status = ? WHERE student_id = ? AND status = 'PENDING'";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setInt(2, studentId);
            stmt.executeUpdate();
        }
    }
}