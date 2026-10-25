package app.model;

import java.util.Collections;
import java.util.List;

/**
 * Domain Model: Student
 * Immutable profile object constructed via StudentBuilder.
 */
public class Student {
    private final int studentId;
    private final int userId;
    private final String studentCode;
    private final String fullName;
    private final int academicYear;
    private final String gender;
    private final double meritScore;
    private final String contactNumber;
    private final String emergencyContact;
    private final List<Integer> preferredHostelIds;

    public Student(int studentId, int userId, String studentCode, String fullName,
                   int academicYear, String gender, double meritScore,
                   String contactNumber, String emergencyContact, List<Integer> preferredHostelIds) {
        this.studentId = studentId;
        this.userId = userId;
        this.studentCode = studentCode;
        this.fullName = fullName;
        this.academicYear = academicYear;
        this.gender = gender;
        this.meritScore = meritScore;
        this.contactNumber = contactNumber;
        this.emergencyContact = emergencyContact;
        this.preferredHostelIds = preferredHostelIds != null ? List.copyOf(preferredHostelIds) : Collections.emptyList();
    }

    public int getStudentId() { return studentId; }
    public int getUserId() { return userId; }
    public String getStudentCode() { return studentCode; }
    public String getFullName() { return fullName; }
    public int getAcademicYear() { return academicYear; }
    public String getGender() { return gender; }
    public double getMeritScore() { return meritScore; }
    public String getContactNumber() { return contactNumber; }
    public String getEmergencyContact() { return emergencyContact; }
    public List<Integer> getPreferredHostelIds() { return preferredHostelIds; }

    @Override
    public String toString() {
        return "Student{" +
                "studentCode='" + studentCode + '\'' +
                ", fullName='" + fullName + '\'' +
                ", academicYear=" + academicYear +
                ", meritScore=" + meritScore +
                '}';
    }
}