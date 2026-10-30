package app.patterns.singleton;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.model.AllocationRequest;

/**
 * Singleton Pattern / DAO: AllocationDAO
 * Resides in singleton folder, manages Allocation persistence via DatabaseManager singleton.
 */
public class AllocationDAO {

    private static AllocationDAO instance;

    public AllocationDAO() {
    }

    public static synchronized AllocationDAO getInstance() {
        if (instance == null) {
            instance = new AllocationDAO();
        }
        return instance;
    }

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

    public List<AllocationRequest> findAllRequests() {
        List<AllocationRequest> list = new ArrayList<>();
        String sql = "SELECT * FROM allocation_requests ORDER BY request_id ASC";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(new AllocationRequest(
                        rs.getInt("request_id"),
                        rs.getInt("student_id"),
                        rs.getObject("preferred_hostel_id") != null ? rs.getInt("preferred_hostel_id") : null,
                        rs.getString("status"),
                        rs.getTimestamp("requested_at")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<AllocationRequest> findPendingRequests() {
        List<AllocationRequest> list = new ArrayList<>();
        String sql = "SELECT * FROM allocation_requests WHERE status = 'PENDING' ORDER BY request_id ASC";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(new AllocationRequest(
                        rs.getInt("request_id"),
                        rs.getInt("student_id"),
                        rs.getObject("preferred_hostel_id") != null ? rs.getInt("preferred_hostel_id") : null,
                        rs.getString("status"),
                        rs.getTimestamp("requested_at")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public int createRequest(int studentId, Integer preferredHostelId) {
        String sql = "INSERT INTO allocation_requests (student_id, preferred_hostel_id, status) VALUES (?, ?, 'PENDING')";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, studentId);
            if (preferredHostelId != null) {
                stmt.setInt(2, preferredHostelId);
            } else {
                stmt.setNull(2, Types.INTEGER);
            }
            stmt.executeUpdate();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public List<Map<String, Object>> findAllAllocationsWithDetails() {
        List<Map<String, Object>> result = new ArrayList<>();
        String sql = """
            SELECT a.allocation_id, a.student_id, a.room_id, a.allocation_strategy, a.status, a.allocated_at,
                   u.full_name as student_name, s.student_code, s.merit_score,
                   r.room_number, r.floor_number, h.hostel_name, t.template_name, t.room_type, t.base_fee
            FROM room_allocations a
            JOIN students s ON a.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            JOIN rooms r ON a.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            JOIN room_templates t ON r.template_id = t.template_id
            ORDER BY a.allocated_at DESC
        """;
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("allocationId", rs.getInt("allocation_id"));
                map.put("studentId", rs.getInt("student_id"));
                map.put("roomId", rs.getInt("room_id"));
                map.put("strategy", rs.getString("allocation_strategy"));
                map.put("status", rs.getString("status"));
                map.put("allocatedAt", rs.getString("allocated_at"));
                map.put("studentName", rs.getString("student_name"));
                map.put("studentCode", rs.getString("student_code"));
                double rawScore = rs.getDouble("merit_score");
                double cgpa = rawScore > 10.0 ? Math.round((rawScore / 10.0) * 100.0) / 100.0 : rawScore;
                map.put("cgpa", cgpa);
                map.put("meritScore", cgpa);
                map.put("roomNumber", rs.getString("room_number"));
                map.put("floorNumber", rs.getInt("floor_number"));
                map.put("hostelName", rs.getString("hostel_name"));
                map.put("templateName", rs.getString("template_name"));
                map.put("roomType", rs.getString("room_type"));
                map.put("baseFee", rs.getDouble("base_fee"));
                result.add(map);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return result;
    }

    public Map<String, Object> getAllocationForStudent(int studentId) {
        String sql = """
            SELECT a.allocation_id, a.student_id, a.room_id, a.allocation_strategy, a.status, a.allocated_at,
                   u.full_name as student_name, s.student_code, s.merit_score,
                   r.room_number, r.floor_number, r.capacity, r.current_occupancy,
                   h.hostel_id, h.hostel_name, t.template_name, t.room_type, t.base_fee, t.amenities_csv
            FROM room_allocations a
            JOIN students s ON a.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            JOIN rooms r ON a.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            JOIN room_templates t ON r.template_id = t.template_id
            WHERE a.student_id = ? AND a.status IN ('ALLOCATED', 'CHECKED_IN')
            ORDER BY a.allocated_at DESC LIMIT 1
        """;
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("allocationId", rs.getInt("allocation_id"));
                    map.put("studentId", rs.getInt("student_id"));
                    map.put("roomId", rs.getInt("room_id"));
                    map.put("hostelId", rs.getInt("hostel_id"));
                    map.put("strategy", rs.getString("allocation_strategy"));
                    map.put("status", rs.getString("status"));
                    map.put("allocatedAt", rs.getString("allocated_at"));
                    map.put("studentName", rs.getString("student_name"));
                    map.put("studentCode", rs.getString("student_code"));
                    double rawScore = rs.getDouble("merit_score");
                    double cgpa = rawScore > 10.0 ? Math.round((rawScore / 10.0) * 100.0) / 100.0 : rawScore;
                    map.put("cgpa", cgpa);
                    map.put("meritScore", cgpa);
                    map.put("roomNumber", rs.getString("room_number"));
                    map.put("floorNumber", rs.getInt("floor_number"));
                    map.put("capacity", rs.getInt("capacity"));
                    map.put("currentOccupancy", rs.getInt("current_occupancy"));
                    map.put("hostelName", rs.getString("hostel_name"));
                    map.put("templateName", rs.getString("template_name"));
                    map.put("roomType", rs.getString("room_type"));
                    map.put("baseFee", rs.getDouble("base_fee"));
                    map.put("amenities", rs.getString("amenities_csv"));
                    return map;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}

