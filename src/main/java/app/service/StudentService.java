package app.service;

import app.model.Student;
import app.patterns.builder.StudentBuilder;
import app.patterns.singleton.StudentDAO;

import java.util.List;

public class StudentService {

    private final StudentDAO studentRepository = StudentDAO.getInstance();

    /**
     * Registers a new student profile using StudentBuilder.
     */
    public Student createStudentProfile(int userId, String studentCode, int academicYear,
                                        String gender, double meritScore, String contactNumber,
                                        String emergencyContact, List<Integer> preferredHostelIds) {
        
        // Build and validate using StudentBuilder
        Student student = new StudentBuilder()
                .setUserId(userId)
                .setStudentCode(studentCode)
                .setAcademicYear(academicYear)
                .setGender(gender)
                .setMeritScore(meritScore)
                .setContactNumber(contactNumber)
                .setEmergencyContact(emergencyContact)
                .setPreferredHostelIds(preferredHostelIds)
                .build();

        studentRepository.save(student);
        return studentRepository.findByUserId(userId);
    }

    /**
     * Fetches a student profile by their user ID.
     */
    public Student getStudentByUserId(int userId) {
        return studentRepository.findByUserId(userId);
    }

    /**
     * Fetches a student profile by their student ID.
     */
    public Student getStudentByStudentId(int studentId) {
        return studentRepository.findByStudentId(studentId);
    }

    /**
     * Retrieves all registered student profiles.
     */
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
}
