package app.patterns;

import app.patterns.singleton.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

public class SingletonTest {

    @Test
    @DisplayName("Singleton Pattern: Verify same DatabaseManager instance reference")
    void testSingletonInstanceUniqueness() {
        DatabaseManager instance1 = DatabaseManager.getInstance();
        DatabaseManager instance2 = DatabaseManager.getInstance();

        assertNotNull(instance1, "DatabaseManager instance should not be null");
        assertNotNull(instance2, "DatabaseManager instance should not be null");
        assertSame(instance1, instance2, "Both calls to getInstance() must return the exact same object reference");
    }

    @Test
    @DisplayName("Singleton Pattern: Verify database connection retrieval")
    void testDatabaseConnection() {
        DatabaseManager dbManager = DatabaseManager.getInstance();
        assertDoesNotThrow(() -> {
            try (Connection conn = dbManager.getConnection()) {
                assertNotNull(conn, "Connection returned by DatabaseManager should not be null");
                assertFalse(conn.isClosed(), "Database connection should be open");
            }
        });
    }

    @Test
    @DisplayName("Singleton Pattern: Verify DAO singletons in app.patterns.singleton")
    void testDaoSingletonsInSingletonFolder() {
        UserDAO userDAO1 = UserDAO.getInstance();
        UserDAO userDAO2 = UserDAO.getInstance();
        assertNotNull(userDAO1);
        assertSame(userDAO1, userDAO2, "UserDAO getInstance() must return same singleton instance");

        StudentDAO studentDAO1 = StudentDAO.getInstance();
        StudentDAO studentDAO2 = StudentDAO.getInstance();
        assertNotNull(studentDAO1);
        assertSame(studentDAO1, studentDAO2, "StudentDAO getInstance() must return same singleton instance");

        RoomDAO roomDAO1 = RoomDAO.getInstance();
        RoomDAO roomDAO2 = RoomDAO.getInstance();
        assertNotNull(roomDAO1);
        assertSame(roomDAO1, roomDAO2, "RoomDAO getInstance() must return same singleton instance");

        AllocationDAO allocDAO1 = AllocationDAO.getInstance();
        AllocationDAO allocDAO2 = AllocationDAO.getInstance();
        assertNotNull(allocDAO1);
        assertSame(allocDAO1, allocDAO2, "AllocationDAO getInstance() must return same singleton instance");

        ComplaintDAO complaintDAO1 = ComplaintDAO.getInstance();
        ComplaintDAO complaintDAO2 = ComplaintDAO.getInstance();
        assertNotNull(complaintDAO1);
        assertSame(complaintDAO1, complaintDAO2, "ComplaintDAO getInstance() must return same singleton instance");

        MaintenanceDAO maintDAO1 = MaintenanceDAO.getInstance();
        MaintenanceDAO maintDAO2 = MaintenanceDAO.getInstance();
        assertNotNull(maintDAO1);
        assertSame(maintDAO1, maintDAO2, "MaintenanceDAO getInstance() must return same singleton instance");

        NotificationDAO notifDAO1 = NotificationDAO.getInstance();
        NotificationDAO notifDAO2 = NotificationDAO.getInstance();
        assertNotNull(notifDAO1);
        assertSame(notifDAO1, notifDAO2, "NotificationDAO getInstance() must return same singleton instance");

        ProcessDAO procDAO1 = ProcessDAO.getInstance();
        ProcessDAO procDAO2 = ProcessDAO.getInstance();
        assertNotNull(procDAO1);
        assertSame(procDAO1, procDAO2, "ProcessDAO getInstance() must return same singleton instance");
    }
}
