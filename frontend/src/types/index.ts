export type Role = 'STUDENT' | 'WARDEN' | 'CHIEF_WARDEN' | 'DEAN' | 'MAINTENANCE' | 'ADMIN';

export interface User {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  student?: Student;
  allocation?: AllocationDetail;
}

export interface Student {
  studentId: number;
  userId: number;
  studentCode: string;
  fullName: string;
  academicYear: number;
  gender: string;
  meritScore: number;
  cgpa?: number;
  contactNumber: string;
  emergencyContact: string;
  preferredHostelIds: number[];
}

export interface Hostel {
  hostelId: number;
  hostelName: string;
  genderType: 'MALE' | 'FEMALE' | 'COED';
  totalFloors: number;
}

export interface RoomTemplate {
  templateId: number;
  templateName: string;
  roomType: string;
  capacity: number;
  baseFee: number;
  amenities: string[];
}

export interface Room {
  roomId: number;
  hostelId: number;
  templateId: number;
  roomNumber: string;
  floorNumber: number;
  capacity: number;
  currentOccupancy: number;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
  amenities: string[];
}

export interface AllocationDetail {
  allocationId: number;
  studentId: number;
  roomId: number;
  hostelId?: number;
  strategy: string;
  status: 'ALLOCATED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  allocatedAt: string;
  studentName: string;
  studentCode: string;
  meritScore: number;
  cgpa?: number;
  roomNumber: string;
  floorNumber: number;
  capacity?: number;
  currentOccupancy?: number;
  hostelName: string;
  templateName: string;
  roomType: string;
  baseFee: number;
  amenities?: string;
}

export interface AllocationRequest {
  requestId: number;
  studentId: number;
  preferredHostelId: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

export interface Complaint {
  complaintId: number;
  studentId: number;
  category: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  currentHandlerRole: string;
  createdAt: string;
}

export interface EscalationRecord {
  escalationId: number;
  complaintId: number;
  fromRole: string;
  toRole: string;
  reason: string;
  escalatedByUserId: number;
  escalatedByName?: string;
  escalatedAt: string;
}

export interface NotificationItem {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemStats {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  pendingAllocations: number;
  activeCheckIns: number;
}

export interface PatternMetadata {
  id: string;
  name: string;
  category: string;
  intent: string;
  problem: string;
  solution: string;
  keyClasses: string[];
  flow: string[];
  sampleCode: string;
}

