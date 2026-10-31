import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatternPill } from '../components/common/PatternPill';
import { Complaint, User } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Wrench,
  CheckCircle2,
  Users,
  AlertTriangle,
  ArrowUpRight,
  MessageSquare,
  Sparkles,
  Send,
  Building,
  RefreshCw
} from 'lucide-react';

interface WardenDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const WardenDashboard: React.FC<WardenDashboardProps> = ({ onNavigateTab }) => {
  const { user, refreshNotifications } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Mediator dispatch message
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<number>(4); // Bob Builder (MAINTENANCE) default
  const [assigning, setAssigning] = useState(false);

  const loadData = async () => {
    try {
      const [complaintData, usersData] = await Promise.all([
        api.getComplaints(),
        api.getUsers()
      ]);
      setComplaints(complaintData || []);
      setUsers(usersData || []);
      if (complaintData && complaintData.length > 0 && !selectedComplaint) {
        setSelectedComplaint(complaintData[0]);
      }
    } catch (e) {
      console.warn('Warden dashboard data fetch error:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setAssigning(true);

    try {
      // Dispatches through Mediator pattern: ConcreteComplaintMediator.notifyStatusChange()
      await api.assignMaintenance(selectedComplaint.complaintId, selectedStaffId, maintenanceNotes);
      confetti({ particleCount: 50, spread: 50 });
      setMaintenanceNotes('');
      await loadData();
      await refreshNotifications();
    } catch (err: any) {
      alert('Task assignment error: ' + (err.message || 'Error'));
    } finally {
      setAssigning(false);
    }
  };

  const handleEscalateToChief = async () => {
    if (!selectedComplaint) return;
    try {
      await api.escalateComplaint(
        selectedComplaint.complaintId,
        'Warden escalated to Chief Warden for emergency procurement approval',
        user?.userId || 2
      );
      await loadData();
      await refreshNotifications();
    } catch (err: any) {
      alert('Escalation error: ' + err.message);
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint) return;
    try {
      await api.updateComplaintStatus(selectedComplaint.complaintId, 'RESOLVED', 'WARDEN', 'Resolved by Hostel Warden');
      await loadData();
      await refreshNotifications();
    } catch (err: any) {
      alert('Resolution error: ' + err.message);
    }
  };

  const maintenanceStaff = users.filter((u) => u.role === 'MAINTENANCE');

  return (
    <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hostel Warden Operations Console
            </h1>
            <PatternPill name="Mediator Pattern" category="Behavioral" />
            <PatternPill name="Chain of Responsibility" category="Warden Handler" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Dispatch maintenance requests, review student reports, and coordinate campus repairs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2 self-start transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Grid: Incoming Tickets (Left) & Mediator Dispatch Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Complaints Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-cyan" />
              Incoming Student Issues ({complaints.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Auto-routed</span>
          </div>

          <div className="space-y-3">
            {complaints.map((c) => {
              const isSelected = selectedComplaint?.complaintId === c.complaintId;
              return (
                <div
                  key={c.complaintId}
                  onClick={() => setSelectedComplaint(c)}
                  className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-cyan bg-brand-violet/15 shadow-glow-cyan'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-white">
                      #{c.complaintId} • {c.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 text-slate-300">
                      {c.severity}
                    </span>
                  </div>

                  <h4 className="font-semibold text-xs text-slate-200 truncate">{c.title}</h4>

                  <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Handler: <strong className="text-brand-sky">{c.currentHandlerRole}</strong></span>
                    <span className="text-brand-cyan font-bold">{c.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Mediator Coordination Console (7 cols) */}
        {selectedComplaint ? (
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
            
            <div className="border-b border-white/[0.08] pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-brand-cyan font-bold">
                  Complaint #{selectedComplaint.complaintId} Action Panel
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
                  {selectedComplaint.currentHandlerRole}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{selectedComplaint.title}</h3>
              <p className="text-xs text-slate-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] leading-relaxed">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Work Order Dispatch Card */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-brand-violet/10 to-brand-cyan/10 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-cyan" />
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    Dispatch Maintenance Work Order
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Technician Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assign technicians to verified tickets. Automated notifications are sent to students and maintenance staff upon dispatch.
              </p>

              <form onSubmit={handleAssignTask} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Assign Maintenance Personnel
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-white/10 text-white text-xs font-mono"
                  >
                    {maintenanceStaff.length > 0 ? (
                      maintenanceStaff.map((st) => (
                        <option key={st.userId} value={st.userId}>
                          {st.fullName} ({st.username} - MAINTENANCE)
                        </option>
                      ))
                    ) : (
                      <option value={4}>Bob Builder (maint1 - MAINTENANCE)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Work Order Instructions & Notes
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inspect corridor AP switch port with spare tester"
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={assigning}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{assigning ? 'Dispatching Task...' : 'Dispatch Maintenance'}</span>
                </button>
              </form>
            </div>

            {/* Quick Actions (Escalate or Resolve) */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleEscalateToChief}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-violet to-purple-600 hover:opacity-90 shadow-glow-violet transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Escalate to Chief Warden</span>
              </button>

              <button
                type="button"
                onClick={handleResolve}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
              >
                Mark Issue Resolved
              </button>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 glass-panel rounded-2xl p-12 text-center text-sm text-slate-400 border border-white/10">
            Select an issue from the queue to dispatch actions.
          </div>
        )}

      </div>
    </div>
  );
};

