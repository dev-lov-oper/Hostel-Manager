package app.patterns;

import app.exception.ValidationException;
import app.model.Student;
import app.patterns.builder.StudentBuilder;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class BuilderTest {

    @Test
    public void testValidStudentCreation() {
        Student student = new StudentBuilder()
                .setUserId(10)
                .setStudentCode("STU2026001")
                .setFullName("Rahul Sharma")
                .setAcademicYear(2)
                .setGender("MALE")
                .setCgpa(8.85)
                .setContactNumber("9876543210")
                .setEmergencyContact("9123456789")
                .build();

        assertNotNull(student);
        assertEquals("STU2026001", student.getStudentCode());
        assertEquals("Rahul Sharma", student.getFullName());
        assertEquals(8.85, student.getCgpa());
        assertEquals(8.85, student.getMeritScore());
    }

    @Test
    public void testInvalidStudentCreationThrowsException() {
        // Missing student code and contact numbers
        StudentBuilder builder = new StudentBuilder()
                .setUserId(10)
                .setFullName("Rahul Sharma")
                .setAcademicYear(2);

        assertThrows(ValidationException.class, builder::build);
    }

    @Test
    public void testInvalidCgpaThrowsException() {
        StudentBuilder builderHigh = new StudentBuilder()
                .setUserId(10)
                .setStudentCode("STU2026002")
                .setFullName("Priya Patel")
                .setAcademicYear(3)
                .setGender("FEMALE")
                .setCgpa(10.5) // Invalid: > 10.0
                .setContactNumber("9876543210")
                .setEmergencyContact("9123456789");

        assertThrows(ValidationException.class, builderHigh::build);

        StudentBuilder builderLow = new StudentBuilder()
                .setUserId(10)
                .setStudentCode("STU2026003")
                .setFullName("Priya Patel")
                .setAcademicYear(3)
                .setGender("FEMALE")
                .setCgpa(-0.5) // Invalid: < 0.0
                .setContactNumber("9876543210")
                .setEmergencyContact("9123456789");

        assertThrows(ValidationException.class, builderLow::build);
    }
}
