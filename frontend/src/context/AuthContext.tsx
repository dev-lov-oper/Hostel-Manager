import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, NotificationItem } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (roleKey: string) => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationAsRead: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  sseConnected: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ACCOUNTS = [
  { key: 'student1', label: 'Alice (Student)', role: 'STUDENT', username: 'student1', pass: 'password123', desc: 'Year 2, STU001, Sarojini Bhawan S-101' },
  { key: 'student2', label: 'Rahul (Student)', role: 'STUDENT', username: 'student2', pass: 'password123', desc: 'Year 3, STU002, Pending Allocation' },
  { key: 'warden', label: 'Warden (John)', role: 'WARDEN', username: 'warden1', pass: 'password123', desc: 'Hostel Block Warden' },
  { key: 'chiefwarden', label: 'Chief Warden (Dr. Reed)', role: 'CHIEF_WARDEN', username: 'chiefwarden1', pass: 'password123', desc: 'Campus Level Escalation' },
  { key: 'dean', label: 'Dean (Prof. Vance)', role: 'DEAN', username: 'dean1', pass: 'password123', desc: 'Student Affairs High Authority' },
  { key: 'maintenance', label: 'Maintenance (Bob)', role: 'MAINTENANCE', username: 'maint1', pass: 'password123', desc: 'Repairs & Technical Tasks' },
  { key: 'admin', label: 'Admin (System)', role: 'ADMIN', username: 'admin', pass: 'admin123', desc: 'Full System & Analytics' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hostelhub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [sseConnected, setSseConnected] = useState(false);

  const fetchUserNotifications = async (userId: number) => {
    try {
      const items = await api.getUserNotifications(userId);
      setNotifications(items || []);
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      if (user.role === 'STUDENT' && user.userId) {
        const res = await api.getStudentByUserId(user.userId);
        if (res && res.student) {
          const updatedUser: User = {
            ...user,
            student: res.student,
            allocation: res.allocation || undefined
          };
          setUser(updatedUser);
          localStorage.setItem('hostelhub_user', JSON.stringify(updatedUser));
        }
      }
    } catch (e) {
      console.warn('User refresh notice:', e);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchUserNotifications(user.userId);
    }
  }, [user?.userId]);

  // Subscribe to live SSE events
  useEffect(() => {
    const unsubscribe = api.subscribeToEvents((eventType, data) => {
      console.log('SSE Event received:', eventType, data);
      setSseConnected(true);
      if (user?.userId) {
        fetchUserNotifications(user.userId);
        refreshUser();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.userId]);

  const login = async (username: string, pass: string) => {
    setLoading(true);
    try {
      const userData = await api.login(username, pass);
      setUser(userData);
      localStorage.setItem('hostelhub_user', JSON.stringify(userData));
      if (userData.userId) {
        fetchUserNotifications(userData.userId);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const userData = await api.register(data);
      setUser(userData);
      localStorage.setItem('hostelhub_user', JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('hostelhub_user');
  };

  const switchDemoRole = async (roleKey: string) => {
    const demo = DEMO_ACCOUNTS.find(d => d.key === roleKey);
    if (demo) {
      await login(demo.username, demo.pass);
    }
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const refreshNotifications = async () => {
    if (user?.userId) {
      await fetchUserNotifications(user.userId);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        notifications,
        unreadCount,
        markNotificationAsRead,
        refreshNotifications,
        sseConnected,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
