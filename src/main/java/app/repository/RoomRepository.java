package app.repository;

import app.model.Room;
import app.model.RoomTemplate;
import app.patterns.singleton.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RoomRepository {

    public List<Room> findAvailableRooms() {
        List<Room> rooms = new ArrayList<>();
        String sql = "SELECT r.*, t.template_name, t.room_type, t.base_fee, t.amenities_csv " +
                     "FROM rooms r JOIN room_templates t ON r.template_id = t.template_id " +
                     "WHERE r.status = 'AVAILABLE' AND r.current_occupancy < r.capacity";

        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                RoomTemplate t = new RoomTemplate(
                        rs.getInt("template_id"),
                        rs.getString("template_name"),
                        rs.getString("room_type"),
                        rs.getInt("capacity"),
                        rs.getDouble("base_fee"),
                        List.of(rs.getString("amenities_csv").split(","))
                );
                Room r = new Room(
                        rs.getInt("room_id"),
                        rs.getInt("hostel_id"),
                        t,
                        rs.getString("room_number"),
                        rs.getInt("floor_number")
                );
                r.setCurrentOccupancy(rs.getInt("current_occupancy"));
                r.setStatus(rs.getString("status"));
                rooms.add(r);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return rooms;
    }

    public void updateOccupancy(Connection conn, int roomId, int newOccupancy, String status) throws SQLException {
        String sql = "UPDATE rooms SET current_occupancy = ?, status = ? WHERE room_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, newOccupancy);
            stmt.setString(2, status);
            stmt.setInt(3, roomId);
            stmt.executeUpdate();
        }
    }
}