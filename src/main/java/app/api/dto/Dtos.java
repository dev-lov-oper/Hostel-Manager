package app.api.dto;

import java.util.List;

public class Dtos {

    public record LoginRequest(String username, String password) {}

    public record RegisterRequest(
            String username,
            String password,
            String fullName,
            String email,
            String role,
            // Student specific optional fields
            String studentCode,
            Integer academicYear,
            String gender,
            Double meritScore,
            Double cgpa,
            String contactNumber,
            String emergencyContact,
            List<Integer> preferredHostelIds
    ) {
        public double resolvedCgpa() {
            if (cgpa != null) return cgpa;
            if (meritScore != null) return meritScore > 10.0 ? meritScore / 10.0 : meritScore;
            return 8.5;
        }
    }

    public record StudentProfileRequest(
            int userId,
            String studentCode,
            String fullName,
            int academicYear,
            String gender,
            Double meritScore,
            Double cgpa,
            String contactNumber,
            String emergencyContact,
            List<Integer> preferredHostelIds
    ) {
        public double resolvedCgpa() {
            if (cgpa != null) return cgpa;
            if (meritScore != null) return meritScore > 10.0 ? meritScore / 10.0 : meritScore;
            return 8.5;
        }
    }

    public record AllocationSubmissionRequest(
            int studentId,
            Integer preferredHostelId
    ) {}

    public record ExecuteAllocationRequest(
            String strategy // MERIT_BASED, FIRST_COME_FIRST_SERVED, PREFERENCE_BASED
    ) {}

    public record CreateComplaintRequest(
            int studentId,
            String category,
            String title,
            String description,
            String severity // LOW, MEDIUM, HIGH, CRITICAL
    ) {}

    public record EscalateComplaintRequest(
            int complaintId,
            String reason,
            int escalatedByUserId
    ) {}

    public record UpdateComplaintStatusRequest(
            String status, // SUBMITTED, ASSIGNED, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED
            String handlerRole,
            String remarks
    ) {}

    public record AssignTaskRequest(
            int staffId,
            String notes
    ) {}

    public record CloneTemplateRequest(
            String sourceTemplateName,
            String newTemplateName,
            String roomType,
            int capacity,
            double baseFee,
            List<String> amenities
    ) {}

    public record ExecuteProcessRequest(
            int allocationId,
            int studentId,
            int roomId,
            String processType // CHECK_IN, CHECK_OUT
    ) {}

    public record ApiResponse<T>(
            boolean success,
            String message,
            T data,
            Object meta
    ) {
        public static <T> ApiResponse<T> ok(String message, T data) {
            return new ApiResponse<>(true, message, data, null);
        }

        public static <T> ApiResponse<T> ok(String message, T data, Object meta) {
            return new ApiResponse<>(true, message, data, meta);
        }

        public static <T> ApiResponse<T> fail(String message) {
            return new ApiResponse<>(false, message, null, null);
        }
    }
}

