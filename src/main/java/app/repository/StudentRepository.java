package app.repository;

import app.model.Student;
import app.patterns.builder.StudentBuilder;
import app.patterns.singleton.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class StudentRepository {

    public void save(Student student) {
        String sql = "INSERT INTO students (user_id, student_code, academic_year, gender, merit_score, contact_number, emergency_contact, preferences_json) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, student.getUserId());
            stmt.setString(2, student.getStudentCode());
            stmt.setInt(3, student.getAcademicYear());
            stmt.setString(4, student.getGender());
            stmt.setDouble(5, student.getMeritScore());
            stmt.setString(6, student.getContactNumber());
            stmt.setString(7, student.getEmergencyContact());
            stmt.setString(8, convertPreferencesToString(student.getPreferredHostelIds()));

            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Student findByUserId(int userId) {
        String sql = "SELECT s.*, u.full_name FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.user_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToStudent(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Student findByStudentId(int studentId) {
        String sql = "SELECT s.*, u.full_name FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.student_id = ?";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToStudent(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Student> findAll() {
        List<Student> students = new ArrayList<>();
        String sql = "SELECT s.*, u.full_name FROM students s JOIN users u ON s.user_id = u.user_id";
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                students.add(mapResultSetToStudent(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return students;
    }

    private Student mapResultSetToStudent(ResultSet rs) throws SQLException {
        return new StudentBuilder()
                .setStudentId(rs.getInt("student_id"))
                .setUserId(rs.getInt("user_id"))
                .setStudentCode(rs.getString("student_code"))
                .setFullName(rs.getString("full_name"))
                .setAcademicYear(rs.getInt("academic_year"))
                .setGender(rs.getString("gender"))
                .setMeritScore(rs.getDouble("merit_score"))
                .setContactNumber(rs.getString("contact_number"))
                .setEmergencyContact(rs.getString("emergency_contact"))
                .setPreferredHostelIds(parsePreferencesString(rs.getString("preferences_json")))
                .build();
    }

    private String convertPreferencesToString(List<Integer> hostelIds) {
        if (hostelIds == null || hostelIds.isEmpty()) return "";
        return hostelIds.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private List<Integer> parsePreferencesString(String prefStr) {
        if (prefStr == null || prefStr.trim().isEmpty()) return new ArrayList<>();
        return Arrays.stream(prefStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }
}