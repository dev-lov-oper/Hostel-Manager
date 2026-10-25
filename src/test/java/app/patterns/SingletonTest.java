package app.patterns;

import app.patterns.singleton.DatabaseManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

public class SingletonTest {

    @Test
    @DisplayName("Singleton Pattern: Verify same instance reference")
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
}