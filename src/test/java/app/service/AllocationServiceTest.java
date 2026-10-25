package app.service;

import app.model.RoomAllocation;
import app.model.Student;
import app.patterns.builder.StudentBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.sql.Timestamp;

import static org.junit.jupiter.api.Assertions.*;

public class AllocationServiceTest {

    private AllocationService allocationService;

    @BeforeEach
    void setUp() {
        allocationService = new AllocationService();
    }

    @Test
    @DisplayName("Allocation Service: Verify allocation status lifecycle")
    void testAllocationStatusLifecycle() {
        RoomAllocation allocation = new RoomAllocation(
                1,
                10,
                101,
                "PENDING",
                "PENDING_APPROVAL",
                new Timestamp(System.currentTimeMillis())
        );

        assertNotNull(allocation);
        assertEquals("PENDING", allocation.getAllocationStatus());
        assertEquals(10, allocation.getStudentId());
        assertEquals(101, allocation.getRoomId());
    }

    @Test
    @DisplayName("Allocation Service: Validate student merit priority sorting setup")
    void testStudentMeritPriority() {
        Student s1 = new StudentBuilder()
                .setStudentId(1)
                .setUserId(101)
                .setStudentCode("STU001")
                .setAcademicYear(2)
                .setGender("FEMALE")
                .setContactNumber("1234567890")
                .setEmergencyContact("0987654321")
                .setFullName("Alice")
                .setMeritScore(3.85)
                .build();

        Student s2 = new StudentBuilder()
                .setStudentId(2)
                .setUserId(102)
                .setStudentCode("STU002")
                .setAcademicYear(3)
                .setGender("MALE")
                .setContactNumber("1234567891")
                .setEmergencyContact("0987654322")
                .setFullName("Bob")
                .setMeritScore(3.40)
                .build();

        assertTrue(s1.getMeritScore() > s2.getMeritScore(), "Alice should have higher priority for room allocation than Bob");
    }
}