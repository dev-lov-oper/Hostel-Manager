package app.patterns;

import app.model.*;
import app.patterns.builder.StudentBuilder;
import app.patterns.strategy.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.sql.Timestamp;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

public class StrategyTest {

    private RoomTemplate template;
    private Room room1;
    private Room room2;
    private Student studentHighMerit;
    private Student studentLowMerit;
    private AllocationRequest req1;
    private AllocationRequest req2;

    @BeforeEach
    public void setup() {
        template = new RoomTemplate(1, "Single Standard", "SINGLE", 1, 4000.0, List.of("Wi-Fi"));
        room1 = new Room(101, 1, template, "101", 1);
        room2 = new Room(102, 1, template, "102", 1);

        studentHighMerit = new StudentBuilder()
                .setUserId(1).setStudentId(1).setStudentCode("STU01").setFullName("Alice")
                .setAcademicYear(2).setGender("FEMALE").setMeritScore(95.0)
                .setContactNumber("9876543210").setEmergencyContact("9123456789").build();

        studentLowMerit = new StudentBuilder()
                .setUserId(2).setStudentId(2).setStudentCode("STU02").setFullName("Bob")
                .setAcademicYear(2).setGender("MALE").setMeritScore(70.0)
                .setContactNumber("9876543211").setEmergencyContact("9123456788").build();

        req1 = new AllocationRequest(1, 1, 1, "PENDING", new Timestamp(System.currentTimeMillis() - 10000));
        req2 = new AllocationRequest(2, 2, 1, "PENDING", new Timestamp(System.currentTimeMillis()));
    }

    @Test
    public void testMeritBasedAllocationPrioritizesHigherScore() {
        AllocationStrategy strategy = new MeritBasedAllocationStrategy();
        // Only 1 room available
        List<Room> availableRooms = List.of(room1);

        Map<Student, Room> allocations = strategy.allocate(
                List.of(req2, req1), // Passed out of order
                List.of(studentLowMerit, studentHighMerit),
                availableRooms
        );

        assertEquals(1, allocations.size());
        assertTrue(allocations.containsKey(studentHighMerit));
        assertEquals(room1, allocations.get(studentHighMerit));
    }

    @Test
    public void testFirstComeFirstServedPrioritizesEarlierTimestamp() {
        AllocationStrategy strategy = new FirstComeFirstServedStrategy();
        List<Room> availableRooms = List.of(room1);

        Map<Student, Room> allocations = strategy.allocate(
                List.of(req2, req1), // req1 has earlier timestamp
                List.of(studentLowMerit, studentHighMerit),
                availableRooms
        );

        assertEquals(1, allocations.size());
        assertTrue(allocations.containsKey(studentHighMerit)); // req1 belongs to studentHighMerit
    }
}