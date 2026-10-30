package app.util;

import app.patterns.singleton.DatabaseManager;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Seeds comprehensive initial demonstration data if tables are empty.
 */
public class DatabaseSeeder {

    public static void seedIfNeeded() {
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            seedWithConnection(conn);
        } catch (Exception e) {
            System.err.println("DatabaseSeeder error: " + e.getMessage());
        }
    }

    public static void seedIfNeeded(Connection conn) {
        seedWithConnection(conn);
    }

    private static void seedWithConnection(Connection conn) {
        try {
            // Check if hostels already exist
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM hostels")) {
                if (rs.next() && rs.getInt(1) > 0) {
                    return;
                }
            }

            System.out.println("Seeding demonstration data into HostelHub database...");
            boolean originalAutoCommit = conn.getAutoCommit();
            conn.setAutoCommit(false);

            try (Statement stmt = conn.createStatement()) {
                // 1. Additional Users
                stmt.execute("""
                    INSERT OR IGNORE INTO users (user_id, username, password_hash, role, full_name, email) VALUES
                    (5, 'chiefwarden1', 'password123', 'CHIEF_WARDEN', 'Dr. Evelyn Reed', 'chiefwarden@hostel.edu'),
                    (6, 'dean1', 'password123', 'DEAN', 'Prof. Arthur Vance', 'dean@hostel.edu'),
                    (7, 'student2', 'password123', 'STUDENT', 'Rahul Sharma', 'rahul@hostel.edu'),
                    (8, 'student3', 'password123', 'STUDENT', 'Priya Patel', 'priya@hostel.edu'),
                    (9, 'student4', 'password123', 'STUDENT', 'David Miller', 'david@hostel.edu'),
                    (10, 'student5', 'password123', 'STUDENT', 'Sneha Rao', 'sneha@hostel.edu')
                """);

                // 2. Students
                stmt.execute("""
                    INSERT OR IGNORE INTO students (student_id, user_id, student_code, academic_year, gender, merit_score, contact_number, emergency_contact, preferences_json) VALUES
                    (2, 7, 'STU002', 3, 'MALE', 88.5, '9876543210', '9876543211', '1,3'),
                    (3, 8, 'STU003', 1, 'FEMALE', 96.0, '9876543220', '9876543221', '2,3'),
                    (4, 9, 'STU004', 4, 'MALE', 75.0, '9876543230', '9876543231', '1'),
                    (5, 10, 'STU005', 2, 'FEMALE', 85.0, '9876543240', '9876543241', '2')
                """);

                // 3. Room Templates (Prototype pattern sources)
                stmt.execute("""
                    INSERT OR IGNORE INTO room_templates (template_id, template_name, room_type, capacity, base_fee, amenities_csv) VALUES
                    (1, 'Single Deluxe Studio', 'SINGLE', 1, 14000.0, 'Air Conditioning,Attached Bath,High-Speed Wi-Fi,Ergonomic Desk,Balcony'),
                    (2, 'Double Classic En-Suite', 'DOUBLE', 2, 9000.0, 'Dual Study Desks,Attached Bath,High-Speed Wi-Fi,Ceiling Fan,Wardrobe'),
                    (3, 'Triple Standard Room', 'DOUBLE', 3, 6800.0, 'Individual Wardrobes,Wi-Fi,Shared Modern Bath,Study Area'),
                    (4, 'Executive Penthouse Suite', 'SINGLE', 1, 18500.0, 'King Bed,Climate Control,Kitchenette,Balcony View,Smart Lock,Smart TV'),
                    (5, 'Quad Community Dorm', 'DORMITORY', 4, 4500.0, 'Bunk Beds,Personal Key Lockers,Wi-Fi,Shared Study Hall')
                """);

                // 4. Hostels
                stmt.execute("""
                    INSERT OR IGNORE INTO hostels (hostel_id, hostel_name, gender_type, total_floors) VALUES
                    (1, 'Aryabhata Hall of Residence', 'MALE', 4),
                    (2, 'Sarojini Naidu Bhawan', 'FEMALE', 4),
                    (3, 'Homi Bhabha International Tower', 'COED', 3)
                """);

                // 5. Rooms across hostels and floors
                stmt.execute("""
                    INSERT OR IGNORE INTO rooms (room_id, hostel_id, template_id, room_number, floor_number, capacity, current_occupancy, status) VALUES
                    -- Aryabhata Hall (Male) - Floor 1
                    (1, 1, 1, 'A-101', 1, 1, 1, 'FULL'),
                    (2, 1, 2, 'A-102', 1, 2, 1, 'AVAILABLE'),
                    (3, 1, 2, 'A-103', 1, 2, 0, 'AVAILABLE'),
                    (4, 1, 3, 'A-104', 1, 3, 2, 'AVAILABLE'),
                    -- Aryabhata Hall - Floor 2
                    (5, 1, 1, 'A-201', 2, 1, 0, 'AVAILABLE'),
                    (6, 1, 2, 'A-202', 2, 2, 2, 'FULL'),
                    (7, 1, 5, 'A-203', 2, 4, 1, 'AVAILABLE'),
                    (8, 1, 2, 'A-204', 2, 2, 0, 'MAINTENANCE'),
                    -- Aryabhata Hall - Floor 3
                    (9, 1, 1, 'A-301', 3, 1, 0, 'AVAILABLE'),
                    (10, 1, 2, 'A-302', 3, 2, 1, 'AVAILABLE'),

                    -- Sarojini Naidu Bhawan (Female) - Floor 1
                    (11, 2, 1, 'S-101', 1, 1, 1, 'FULL'),
                    (12, 2, 2, 'S-102', 1, 2, 0, 'AVAILABLE'),
                    (13, 2, 2, 'S-103', 1, 2, 1, 'AVAILABLE'),
                    (14, 2, 3, 'S-104', 1, 3, 0, 'AVAILABLE'),
                    -- Sarojini Naidu Bhawan - Floor 2
                    (15, 2, 1, 'S-201', 2, 1, 0, 'AVAILABLE'),
                    (16, 2, 2, 'S-202', 2, 2, 2, 'FULL'),
                    (17, 2, 5, 'S-203', 2, 4, 2, 'AVAILABLE'),
                    (18, 2, 2, 'S-204', 2, 2, 0, 'AVAILABLE'),

                    -- Homi Bhabha International Tower (Coed) - Floor 1 & 2
                    (19, 3, 4, 'H-101', 1, 1, 0, 'AVAILABLE'),
                    (20, 3, 4, 'H-102', 1, 1, 1, 'FULL'),
                    (21, 3, 2, 'H-201', 2, 2, 1, 'AVAILABLE'),
                    (22, 3, 2, 'H-202', 2, 2, 0, 'AVAILABLE'),
                    (23, 3, 5, 'H-301', 3, 4, 3, 'AVAILABLE')
                """);

                // 6. Active Allocation for Student 1 (Alice)
                stmt.execute("""
                    INSERT OR IGNORE INTO room_allocations (allocation_id, student_id, room_id, allocation_strategy, status) VALUES
                    (1, 1, 11, 'MERIT_BASED', 'CHECKED_IN')
                """);

                // 7. Allocation Requests (Pending for demonstration of Strategy Pattern)
                stmt.execute("""
                    INSERT OR IGNORE INTO allocation_requests (request_id, student_id, preferred_hostel_id, status) VALUES
                    (1, 2, 1, 'PENDING'),
                    (2, 3, 2, 'PENDING'),
                    (3, 4, 1, 'PENDING'),
                    (4, 5, 2, 'PENDING')
                """);

                // 8. Complaints demonstrating Chain of Responsibility & Mediator
                stmt.execute("""
                    INSERT OR IGNORE INTO complaints (complaint_id, student_id, category, title, description, severity, status, current_handler_role) VALUES
                    (1, 1, 'Electrical', 'AC Unit intermittent cooling & high noise', 'The split AC in room S-101 cuts off frequently with fan rattling sound.', 'HIGH', 'ESCALATED', 'CHIEF_WARDEN'),
                    (2, 1, 'Plumbing', 'Severe water heater pipe leakage', 'Water pressure valve failure creating water accumulation in the en-suite bathroom.', 'CRITICAL', 'ESCALATED', 'DEAN'),
                    (3, 1, 'Internet', 'Corridor Wi-Fi 5GHz AP disconnecting', 'High packet loss and random disconnects during evening study hours.', 'MEDIUM', 'ASSIGNED', 'WARDEN'),
                    (4, 1, 'Furniture', 'Ergonomic study chair gas-lift sinking', 'Chair hydraulic cylinder no longer maintains set height.', 'LOW', 'RESOLVED', 'WARDEN')
                """);

                // 9. Complaint Escalations Log
                stmt.execute("""
                    INSERT OR IGNORE INTO complaint_escalations (escalation_id, complaint_id, from_role, to_role, reason, escalated_by_user_id) VALUES
                    (1, 1, 'WARDEN', 'CHIEF_WARDEN', 'High priority electrical issue requiring vendor service order approval.', 2),
                    (2, 2, 'WARDEN', 'CHIEF_WARDEN', 'Critical infrastructure failure hazard.', 2),
                    (3, 2, 'CHIEF_WARDEN', 'DEAN', 'Critical plumbing pipeline failure impacting building riser; emergency Dean approval required.', 5)
                """);

                // 10. Maintenance Tasks
                stmt.execute("""
                    INSERT OR IGNORE INTO maintenance_tasks (task_id, complaint_id, assigned_staff_id, status, completion_notes) VALUES
                    (1, 3, 4, 'IN_PROGRESS', 'Diagnosing corridor access point PoE switch port.'),
                    (2, 4, 4, 'COMPLETED', 'Replaced hydraulic gas piston with new heavy-duty unit.')
                """);

                // 11. Process Logs (Template Method Pattern audit history)
                stmt.execute("""
                    INSERT OR IGNORE INTO process_logs (student_id, process_type, status, remarks) VALUES
                    (1, 'CHECK_IN', 'COMPLETED', 'Step 1: Student Alice Smith ID STU001 verified.\nStep 2: Allocation #1 active.\nStep 3: Baseline inventory verified.\nStep 4: RFID Keycard issued.\nStep 5: Database record set to CHECKED_IN.')
                """);

                // 12. Notifications
                stmt.execute("""
                    INSERT OR IGNORE INTO notifications (user_id, title, message, is_read) VALUES
                    (3, 'Welcome to HostelHub', 'Your room S-101 at Sarojini Naidu Bhawan is confirmed and checked in.', 0),
                    (3, 'Complaint Escalated', 'Complaint #1 (AC Unit) has been escalated to Chief Warden for expedited service.', 0),
                    (3, 'Complaint Escalated', 'Complaint #2 (Plumbing Pipe) has been escalated to Dean of Student Affairs.', 0),
                    (3, 'Task Assigned', 'Maintenance technician Bob Builder has been assigned to your Wi-Fi complaint.', 1),
                    (3, 'Complaint Resolved', 'Your Furniture complaint has been marked as RESOLVED by Warden.', 1)
                """);
            }

            conn.commit();
            conn.setAutoCommit(originalAutoCommit);
            System.out.println("Demonstration data seeded successfully!");
        } catch (Exception e) {
            System.err.println("Seeding notice: " + e.getMessage());
        }
    }
}
