package app.patterns.builder;

import app.exception.ValidationException;
import app.model.Student;
import java.util.ArrayList;
import java.util.List;

/**
 * Builder Pattern: StudentBuilder
 * Ensures valid and complete Student profiles.
 */
public class StudentBuilder {
    private int studentId = 0;
    private int userId;
    private String studentCode;
    private String fullName;
    private int academicYear;
    private String gender;
    private double meritScore = 0.0;
    private String contactNumber;
    private String emergencyContact;
    private List<Integer> preferredHostelIds = new ArrayList<>();

    public StudentBuilder setStudentId(int studentId) {
        this.studentId = studentId;
        return this;
    }

    public StudentBuilder setUserId(int userId) {
        this.userId = userId;
        return this;
    }

    public StudentBuilder setStudentCode(String studentCode) {
        this.studentCode = studentCode;
        return this;
    }

    public StudentBuilder setFullName(String fullName) {
        this.fullName = fullName;
        return this;
    }

    public StudentBuilder setAcademicYear(int academicYear) {
        this.academicYear = academicYear;
        return this;
    }

    public StudentBuilder setGender(String gender) {
        this.gender = gender;
        return this;
    }

    public StudentBuilder setMeritScore(double meritScore) {
        this.meritScore = meritScore;
        return this;
    }

    public StudentBuilder setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
        return this;
    }

    public StudentBuilder setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
        return this;
    }

    public StudentBuilder setPreferredHostelIds(List<Integer> hostelIds) {
        if (hostelIds != null) {
            this.preferredHostelIds = new ArrayList<>(hostelIds);
        }
        return this;
    }

    public Student build() {
        validate();
        return new Student(
                studentId, userId, studentCode, fullName,
                academicYear, gender, meritScore,
                contactNumber, emergencyContact, preferredHostelIds
        );
    }

    private void validate() {
        if (userId <= 0) {
            throw new ValidationException("Invalid User ID.");
        }
        if (studentCode == null || studentCode.trim().isEmpty()) {
            throw new ValidationException("Student Code is required.");
        }
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new ValidationException("Full Name is required.");
        }
        if (academicYear < 1 || academicYear > 5) {
            throw new ValidationException("Academic year must be between 1 and 5.");
        }
        if (gender == null || (!gender.equalsIgnoreCase("MALE") && !gender.equalsIgnoreCase("FEMALE"))) {
            throw new ValidationException("Gender must be MALE or FEMALE.");
        }
        if (contactNumber == null || !contactNumber.matches("\\+?\\d{10,15}")) {
            throw new ValidationException("Contact number must be valid (10-15 digits).");
        }
        if (emergencyContact == null || !emergencyContact.matches("\\+?\\d{10,15}")) {
            throw new ValidationException("Emergency contact must be valid (10-15 digits).");
        }
        if (meritScore < 0.0 || meritScore > 100.0) {
            throw new ValidationException("Merit score must be between 0.0 and 100.0.");
        }
    }
}