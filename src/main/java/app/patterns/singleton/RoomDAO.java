package app.patterns.singleton;

import app.model.Hostel;
import app.model.Room;
import app.patterns.prototype.RoomTemplate;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Singleton Pattern / DAO: RoomDAO
 * Resides in singleton folder, manages Room & Template persistence via DatabaseManager singleton.
 */
public class RoomDAO {

    private static RoomDAO instance;

    public RoomDAO() {
    }

    public static synchronized RoomDAO getInstance() {
        if (instance == null) {
            instance = new RoomDAO();
        }
        return instance;
    }

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

    public List<Room> findAllRooms() {
        List<Room> rooms = new ArrayList<>();
        String sql = "SELECT r.*, t.template_name, t.room_type, t.base_fee, t.amenities_csv " +
                     "FROM rooms r JOIN room_templates t ON r.template_id = t.template_id " +
                     "ORDER BY r.hostel_id, r.floor_number, r.room_number";

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

    public Room findRoomById(int roomId) {
        String sql = "SELECT r.*, t.template_name, t.room_type, t.base_fee, t.amenities_csv " +
                     "FROM rooms r JOIN room_templates t ON r.template_id = t.template_id " +
                     "WHERE r.room_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, roomId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
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
                    return r;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Hostel> findAllHostels() {
        List<Hostel> hostels = new ArrayList<>();
        String sql = "SELECT * FROM hostels ORDER BY hostel_id";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                hostels.add(new Hostel(
                        rs.getInt("hostel_id"),
                        rs.getString("hostel_name"),
                        rs.getString("gender_type"),
                        rs.getInt("total_floors")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return hostels;
    }

    public List<RoomTemplate> findAllTemplates() {
        List<RoomTemplate> templates = new ArrayList<>();
        String sql = "SELECT * FROM room_templates ORDER BY template_id";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                templates.add(new RoomTemplate(
                        rs.getInt("template_id"),
                        rs.getString("template_name"),
                        rs.getString("room_type"),
                        rs.getInt("capacity"),
                        rs.getDouble("base_fee"),
                        List.of(rs.getString("amenities_csv").split(","))
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return templates;
    }

    public RoomTemplate findTemplateById(int templateId) {
        String sql = "SELECT * FROM room_templates WHERE template_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, templateId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new RoomTemplate(
                            rs.getInt("template_id"),
                            rs.getString("template_name"),
                            rs.getString("room_type"),
                            rs.getInt("capacity"),
                            rs.getDouble("base_fee"),
                            List.of(rs.getString("amenities_csv").split(","))
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public int saveTemplate(RoomTemplate template) {
        String sql = "INSERT INTO room_templates (template_name, room_type, capacity, base_fee, amenities_csv) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, template.getTemplateName());
            stmt.setString(2, template.getRoomType());
            stmt.setInt(3, template.getCapacity());
            stmt.setDouble(4, template.getBaseFee());
            stmt.setString(5, String.join(",", template.getAmenities()));
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

    public void updateOccupancy(Connection conn, int roomId, int newOccupancy, String status) throws SQLException {
        String sql = "UPDATE rooms SET current_occupancy = ?, status = ? WHERE room_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, newOccupancy);
            stmt.setString(2, status);
            stmt.setInt(3, roomId);
            stmt.executeUpdate();
        }
    }

    public void updateRoomStatus(int roomId, String status) {
        String sql = "UPDATE rooms SET status = ? WHERE room_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setInt(2, roomId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}

