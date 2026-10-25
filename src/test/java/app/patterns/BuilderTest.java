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
                .setMeritScore(88.5)
                .setContactNumber("9876543210")
                .setEmergencyContact("9123456789")
                .build();

        assertNotNull(student);
        assertEquals("STU2026001", student.getStudentCode());
        assertEquals("Rahul Sharma", student.getFullName());
        assertEquals(88.5, student.getMeritScore());
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
    public void testInvalidMeritScoreThrowsException() {
        StudentBuilder builder = new StudentBuilder()
                .setUserId(10)
                .setStudentCode("STU2026002")
                .setFullName("Priya Patel")
                .setAcademicYear(3)
                .setGender("FEMALE")
                .setMeritScore(105.0) // Invalid: > 100
                .setContactNumber("9876543210")
                .setEmergencyContact("9123456789");

        assertThrows(ValidationException.class, builder::build);
    }
}