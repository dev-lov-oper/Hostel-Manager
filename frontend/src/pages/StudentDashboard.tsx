import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatternPill } from '../components/common/PatternPill';
import { Complaint, AllocationDetail } from '../types';
import { api } from '../services/api';
import {
  User,
  Building,
  AlertCircle,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Wifi,
  Users
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const { user, refreshUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [allocation, setAllocation] = useState<AllocationDetail | null>(user?.allocation || null);

  useEffect(() => {
    if (user?.student?.studentId) {
      api.getComplaints(user.student.studentId).then(setComplaints).catch(console.warn);
      api.getStudentAllocation(user.student.studentId).then(setAllocation).catch(console.warn);
    }
  }, [user]);

  const student = user?.student;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-brand-violet/20 via-surface to-brand-cyan/20 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-glass">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              Student Space Portal
            </span>
            <PatternPill name="Builder Pattern" category="Profile" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.fullName || 'Alice Smith'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {student ? `ID: ${student.studentCode} • Year ${student.academicYear} • CGPA: ${student.meritScore}` : 'Student Profile Active'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('complaints')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Submit Complaint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('room-allocation')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer"
          >
            Explore Floor Plan
          </button>
        </div>
      </div>

      {/* Main Grid: Allocation Detail (Left) & Complaints + Quick Stats (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Active Room Allocation Card (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-cyan" />
                <h3 className="font-bold text-white text-base">Your Room Allocation</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Assigned via Strategy Pattern: {allocation?.strategy || 'MERIT_BASED'}
              </p>
            </div>
            {allocation ? (
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono border ${
                allocation.status === 'CHECKED_IN'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}>
                {allocation.status}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PENDING
              </span>
            )}
          </div>

          {allocation ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Hostel Block</span>
                  <p className="font-bold text-base text-white">{allocation.hostelName}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Room Number</span>
                  <p className="font-bold text-base font-mono text-brand-cyan">{allocation.roomNumber}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Floor Level</span>
                  <p className="font-bold text-base font-mono text-white">Floor {allocation.floorNumber}</p>
                </div>
              </div>

              {/* Roommate details & template features */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Room Configuration & Amenities
                </span>
                <div className="flex flex-wrap gap-2">
                  {allocation.amenities ? (
                    allocation.amenities.split(',').map((am, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-xs text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {am.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Standard institutional furnishings</span>
                  )}
                </div>
              </div>

              {/* Check-in status CTA */}
              <div className="p-4 rounded-xl bg-brand-violet/15 border border-brand-violet/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {allocation.status === 'CHECKED_IN' ? 'Check-In Verification Complete' : 'Check-In Required'}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Process managed via Template Method pattern workflow.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('check-in-out')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-violet hover:bg-violet-600 transition-all cursor-pointer"
                >
                  Manage Status
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-4">
              <p className="text-sm text-slate-400">
                You have not been assigned a room yet. Your profile is queued in the allocation engine.
              </p>
              <button
                onClick={() => onNavigateTab('room-allocation')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 transition-all cursor-pointer"
              >
                Queue Room Preference
              </button>
            </div>
          )}
        </div>

        {/* Right: Complaints Tracking & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Complaints */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-brand-purple" />
                  Your Lodged Complaints
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  Chain of Responsibility tracking
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('complaints')}
                className="text-xs text-brand-cyan hover:underline font-mono"
              >
                View all ({complaints.length})
              </button>
            </div>

            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No active complaints logged.
                </div>
              ) : (
                complaints.slice(0, 3).map((c) => (
                  <div
                    key={c.complaintId}
                    onClick={() => onNavigateTab('complaints')}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                        {c.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
                        {c.status}
                      </span>
                    </div>
                    <h5 className="font-semibold text-xs text-slate-200 truncate">{c.title}</h5>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Handler: <strong className="text-brand-cyan">{c.currentHandlerRole}</strong></span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Pattern Quick Navigation
            </h4>
            <div className="space-y-2">
              {[
                { label: 'Update Profile with Builder Pattern', tab: 'profile-builder' },
                { label: 'Inspect 3D Room Floor Plan', tab: 'room-allocation' },
                { label: 'Template Method Check-in Progress', tab: 'check-in-out' },
                { label: 'Architecture Explorer: All 8 Patterns', tab: 'patterns-explorer' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateTab(item.tab)}
                  className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-xs text-slate-300 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

