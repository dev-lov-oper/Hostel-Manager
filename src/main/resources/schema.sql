PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('STUDENT', 'WARDEN', 'CHIEF_WARDEN', 'DEAN', 'MAINTENANCE', 'ADMIN')),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    student_code TEXT UNIQUE NOT NULL,
    academic_year INTEGER NOT NULL,
    gender TEXT NOT NULL,
    merit_score REAL DEFAULT 0.0,
    contact_number TEXT NOT NULL,
    emergency_contact TEXT NOT NULL,
    preferences_json TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room_templates (
    template_id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT UNIQUE NOT NULL,
    room_type TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    base_fee REAL NOT NULL,
    amenities_csv TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hostels (
    hostel_id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostel_name TEXT UNIQUE NOT NULL,
    gender_type TEXT NOT NULL CHECK(gender_type IN ('MALE', 'FEMALE', 'COED')),
    total_floors INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    room_id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostel_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    room_number TEXT NOT NULL,
    floor_number INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    status TEXT DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'FULL', 'MAINTENANCE')),
    UNIQUE(hostel_id, room_number),
    FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES room_templates(template_id)
);

CREATE TABLE IF NOT EXISTS allocation_requests (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    preferred_hostel_id INTEGER,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room_allocations (
    allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    allocation_strategy TEXT NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'ALLOCATED' CHECK(status IN ('ALLOCATED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

CREATE TABLE IF NOT EXISTS complaints (
    complaint_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status TEXT DEFAULT 'SUBMITTED' CHECK(status IN ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED')),
    current_handler_role TEXT DEFAULT 'WARDEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE TABLE IF NOT EXISTS complaint_escalations (
    escalation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    from_role TEXT NOT NULL,
    to_role TEXT NOT NULL,
    reason TEXT NOT NULL,
    escalated_by_user_id INTEGER NOT NULL,
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (escalated_by_user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS maintenance_tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER UNIQUE NOT NULL,
    assigned_staff_id INTEGER NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    completion_notes TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id),
    FOREIGN KEY (assigned_staff_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hostel_process_records (
    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    allocation_id INTEGER NOT NULL,
    process_type TEXT NOT NULL CHECK(process_type IN ('CHECK_IN', 'CHECK_OUT')),
    status TEXT NOT NULL CHECK(status IN ('STARTED', 'COMPLETED', 'FAILED')),
    execution_log TEXT NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (allocation_id) REFERENCES room_allocations(allocation_id)
);

CREATE TABLE IF NOT EXISTS process_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    process_type TEXT NOT NULL,
    status TEXT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Clean seed data for testing
DELETE FROM users WHERE username IN ('admin', 'warden1', 'student1', 'maint1');

INSERT INTO users (user_id, username, password_hash, role, full_name, email)
VALUES 
(1, 'admin', 'admin123', 'ADMIN', 'System Admin', 'admin@hostel.edu'),
(2, 'warden1', 'password123', 'WARDEN', 'John Warden', 'warden1@hostel.edu'),
(3, 'student1', 'password123', 'STUDENT', 'Alice Smith', 'student1@hostel.edu'),
(4, 'maint1', 'password123', 'MAINTENANCE', 'Bob Builder', 'maint1@hostel.edu');

INSERT OR IGNORE INTO students (student_id, user_id, student_code, academic_year, gender, merit_score, contact_number, emergency_contact)
VALUES (1, 3, 'STU001', 2, 'FEMALE', 3.85, '1234567890', '0987654321');