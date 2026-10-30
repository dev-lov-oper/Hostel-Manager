import {
  User,
  Student,
  Hostel,
  Room,
  RoomTemplate,
  AllocationDetail,
  AllocationRequest,
  Complaint,
  EscalationRecord,
  NotificationItem,
  SystemStats,
  PatternMetadata
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || `API Error: ${res.status} ${res.statusText}`);
    }

    return json.data as T;
  } catch (err: any) {
    console.error(`Request failed: ${endpoint}`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  register: (data: any) =>
    request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getUsers: () => request<User[]>('/auth/users'),

  // Students (Builder Pattern)
  getStudents: () => request<Student[]>('/students'),
  getStudentById: (id: number) => request<Student>(`/students/${id}`),
  getStudentByUserId: (userId: number) =>
    request<{ student: Student; allocation: AllocationDetail | null }>(`/students/user/${userId}`),
  createStudentProfile: (data: any) =>
    request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Hostels & Rooms
  getHostels: () => request<Hostel[]>('/hostels'),
  getRooms: () => request<Room[]>('/rooms'),
  getRoomById: (id: number) => request<Room>(`/rooms/${id}`),
  updateRoomStatus: (id: number, status: string) =>
    request<Room>(`/rooms/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),

  // Room Templates (Prototype Pattern)
  getTemplates: () => request<RoomTemplate[]>('/templates'),
  createTemplate: (data: any) =>
    request<RoomTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  cloneTemplate: (data: {
    sourceTemplateName: string;
    newTemplateName: string;
    roomType?: string;
    capacity?: number;
    baseFee?: number;
    amenities?: string[];
  }) =>
    request<{ original: string; cloned: RoomTemplate }>('/templates/clone', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Allocations (Strategy Pattern)
  getAllocations: () => request<AllocationDetail[]>('/allocations'),
  getAllocationRequests: () => request<AllocationRequest[]>('/allocations/requests'),
  submitAllocationRequest: (studentId: number, preferredHostelId: number | null) =>
    request<{ requestId: number }>('/allocations/requests', {
      method: 'POST',
      body: JSON.stringify({ studentId, preferredHostelId })
    }),
  executeAllocationStrategy: (strategy: 'MERIT_BASED' | 'FIRST_COME_FIRST_SERVED' | 'PREFERENCE_BASED') =>
    request<{ strategyUsed: string; requestsProcessed: number; roomsAssigned: number }>('/allocations/execute', {
      method: 'POST',
      body: JSON.stringify({ strategy })
    }),
  getStudentAllocation: (studentId: number) =>
    request<AllocationDetail>(`/allocations/student/${studentId}`),

  // Complaints (Chain of Responsibility, Observer, Mediator)
  getComplaints: (studentId?: number, role?: string) => {
    let q = '';
    if (studentId) q = `?studentId=${studentId}`;
    else if (role) q = `?role=${role}`;
    return request<Complaint[]>(`/complaints${q}`);
  },
  getComplaintDetails: (id: number) =>
    request<{ complaint: Complaint; escalations: EscalationRecord[] }>(`/complaints/${id}`),
  createComplaint: (data: {
    studentId: number;
    category: string;
    title: string;
    description: string;
    severity: string;
  }) =>
    request<Complaint>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  escalateComplaint: (id: number, reason: string, escalatedByUserId: number) =>
    request<Complaint>(`/complaints/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ complaintId: id, reason, escalatedByUserId })
    }),
  updateComplaintStatus: (id: number, status: string, handlerRole?: string, remarks?: string) =>
    request<Complaint>(`/complaints/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, handlerRole, remarks })
    }),
  assignMaintenance: (complaintId: number, staffId: number, notes?: string) =>
    request<Complaint>(`/complaints/${complaintId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ staffId, notes })
    }),

  // Template Method Pattern Process (Check-In / Check-Out)
  executeProcess: (data: {
    allocationId: number;
    studentId: number;
    roomId: number;
    processType: 'CHECK_IN' | 'CHECK_OUT';
  }) =>
    request<{
      processType: string;
      success: boolean;
      allocationId: number;
      studentId: number;
      roomId: number;
      executionSteps: string[];
    }>('/process/execute', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getProcessLogs: () => request<any[]>('/process/logs'),

  // Notifications
  getUserNotifications: (userId: number) => request<NotificationItem[]>(`/notifications/user/${userId}`),
  markNotificationRead: (id: number) =>
    request<void>(`/notifications/${id}/read`, { method: 'POST' }),

  // System & Patterns Metadata
  getSystemStats: () => request<SystemStats>('/system/stats'),
  getSingletonInfo: () => request<any>('/system/singleton-info'),
  getPatternsMeta: () => request<PatternMetadata[]>('/patterns/meta'),

  // Live SSE Connection
  subscribeToEvents: (onEvent: (eventType: string, data: any) => void) => {
    try {
      const eventSource = new EventSource('/api/events');
      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          onEvent('MESSAGE', parsed);
        } catch {
          onEvent('RAW', e.data);
        }
      };
      eventSource.addEventListener('COMPLAINT_CREATED', (e: any) => onEvent('COMPLAINT_CREATED', JSON.parse(e.data)));
      eventSource.addEventListener('COMPLAINT_ESCALATED', (e: any) => onEvent('COMPLAINT_ESCALATED', JSON.parse(e.data)));
      eventSource.addEventListener('COMPLAINT_UPDATED', (e: any) => onEvent('COMPLAINT_UPDATED', JSON.parse(e.data)));
      eventSource.addEventListener('ALLOCATION_EXECUTED', (e: any) => onEvent('ALLOCATION_EXECUTED', JSON.parse(e.data)));
      eventSource.addEventListener('PROCESS_EXECUTED', (e: any) => onEvent('PROCESS_EXECUTED', JSON.parse(e.data)));
      eventSource.addEventListener('TEMPLATE_CLONED', (e: any) => onEvent('TEMPLATE_CLONED', JSON.parse(e.data)));
      eventSource.addEventListener('ROOM_UPDATED', (e: any) => onEvent('ROOM_UPDATED', JSON.parse(e.data)));

      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.warn('SSE subscription error:', err);
      return () => {};
    }
  }
};
