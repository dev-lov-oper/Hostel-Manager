import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatternPill } from '../components/common/PatternPill';
import { Complaint, EscalationRecord } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Send,
  GitBranch,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Users,
  Wrench,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';

export const ComplaintManagementPage: React.FC = () => {
  const { user, refreshNotifications } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Filter
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Submit Complaint Form State
  const [newComplaint, setNewComplaint] = useState({
    category: 'Electrical',
    title: '',
    description: '',
    severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  });

  // Escalation Form State
  const [escalateReason, setEscalateReason] = useState('');
  const [escalating, setEscalating] = useState(false);

  const loadComplaints = async () => {
    try {
      const studentId = user?.role === 'STUDENT' ? user.student?.studentId : undefined;
      const data = await api.getComplaints(studentId);
      setComplaints(data || []);
      if (data && data.length > 0 && !selectedComplaint) {
        selectComplaintWithHistory(data[0]);
      }
    } catch (e) {
      console.warn('Failed to load complaints:', e);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const selectComplaintWithHistory = async (c: Complaint) => {
    setSelectedComplaint(c);
    try {
      const details = await api.getComplaintDetails(c.complaintId);
      setEscalations(details.escalations || []);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaint.title || !newComplaint.description) return;
    setLoading(true);

    try {
      const payload = {
        studentId: user?.student?.studentId || 1,
        category: newComplaint.category,
        title: newComplaint.title,
        description: newComplaint.description,
        severity: newComplaint.severity
      };

      const created = await api.createComplaint(payload);
      confetti({ particleCount: 50, spread: 45 });
      setShowSubmitModal(false);
      setNewComplaint({
        category: 'Electrical',
        title: '',
        description: '',
        severity: 'MEDIUM'
      });
      await loadComplaints();
      selectComplaintWithHistory(created);
      await refreshNotifications();
    } catch (err: any) {
      alert('Failed to submit complaint: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!selectedComplaint) return;
    setEscalating(true);
    try {
      // Dispatches to Chain of Responsibility: Warden -> ChiefWarden -> Dean
      const updated = await api.escalateComplaint(
        selectedComplaint.complaintId,
        escalateReason || 'Administrative intervention required',
        user?.userId || 1
      );
      setEscalateReason('');
      await loadComplaints();
      await selectComplaintWithHistory(updated);
      await refreshNotifications();
    } catch (err: any) {
      alert('Escalation failed: ' + (err.message || 'Error'));
    } finally {
      setEscalating(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedComplaint) return;
    try {
      const updated = await api.updateComplaintStatus(selectedComplaint.complaintId, status);
      await loadComplaints();
      await selectComplaintWithHistory(updated);
      await refreshNotifications();
    } catch (err: any) {
      alert('Status update failed: ' + err.message);
    }
  };

  const filtered = filterCategory === 'ALL'
    ? complaints
    : complaints.filter((c) => c.category.toUpperCase() === filterCategory.toUpperCase());

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'HIGH': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default: return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Complaint Lifecycle Management
            </h1>
            <PatternPill name="Chain of Responsibility" category="Behavioral" />
            <PatternPill name="Observer Pattern" category="Notifications" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Student → Warden → Chief Warden → Dean escalation pipeline with real-time Observer notifications.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan flex items-center gap-2 self-start cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Lodge Complaint</span>
        </button>
      </div>

      {/* Main Layout: Complaints List (Left) and Vertical Escalation Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Complaints Filter & List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#0e1320] border border-white/10 text-white text-xs font-mono"
              >
                <option value="ALL">All Categories</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Internet">Internet</option>
                <option value="Furniture">Furniture</option>
                <option value="Security">Security</option>
                <option value="Cleaning">Cleaning</option>
              </select>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {filtered.length} found
            </span>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-xs text-slate-400 border border-white/10">
                No complaints registered under this category.
              </div>
            ) : (
              filtered.map((c) => {
                const isSelected = selectedComplaint?.complaintId === c.complaintId;
                return (
                  <div
                    key={c.complaintId}
                    onClick={() => selectComplaintWithHistory(c)}
                    className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-cyan bg-brand-violet/15 shadow-glow-cyan'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                        {c.category}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getSeverityBadge(c.severity)}`}>
                        {c.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white truncate">{c.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Handler: <strong className="text-brand-sky">{c.currentHandlerRole}</strong></span>
                      <span className="text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Complaint Inspector & Vertical Timeline (7 cols) */}
        {selectedComplaint ? (
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-8">
            
            {/* Header of Active Complaint */}
            <div className="space-y-3 border-b border-white/[0.08] pb-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-brand-cyan">
                  Complaint #{selectedComplaint.complaintId} • Student ID: {selectedComplaint.studentId}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${getSeverityBadge(selectedComplaint.severity)}`}>
                    {selectedComplaint.severity}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white">{selectedComplaint.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Vertical Chain Escalation Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-brand-purple" />
                  <h4 className="text-sm font-bold text-white">Chain of Responsibility Progression</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Current Authority: <strong className="text-brand-sky">{selectedComplaint.currentHandlerRole}</strong>
                </span>
              </div>

              {/* Timeline Steps: Student -> Warden -> Chief Warden -> Dean */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-brand-cyan via-brand-purple to-rose-500">
                
                {/* 1. Student origin */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-cyan-400 shadow-glow-cyan" />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Student Submission</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(selectedComplaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Complaint submitted with {selectedComplaint.severity} severity. Logged via Mediator.
                    </p>
                  </div>
                </div>

                {/* 2. Warden stage */}
                <div className="relative">
                  <span className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${
                    selectedComplaint.currentHandlerRole === 'WARDEN' ? 'bg-amber-400 animate-ping' : 'bg-amber-400'
                  }`} />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200">Warden Handler</span>
                      <span className="text-[10px] font-mono text-amber-400">
                        {selectedComplaint.currentHandlerRole === 'WARDEN' ? 'Active' : 'Passed / Resolved'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Evaluates initial issue. High & Critical severity issues are passed automatically to Chief Warden.
                    </p>
                  </div>
                </div>

                {/* 3. Chief Warden stage */}
                <div className="relative">
                  <span className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${
                    selectedComplaint.currentHandlerRole === 'CHIEF_WARDEN'
                      ? 'bg-purple-400 animate-ping'
                      : ['CHIEF_WARDEN', 'DEAN'].includes(selectedComplaint.currentHandlerRole)
                      ? 'bg-purple-400'
                      : 'bg-white/20'
                  }`} />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200">Chief Warden Handler</span>
                      <span className="text-[10px] font-mono text-purple-400">
                        {selectedComplaint.currentHandlerRole === 'CHIEF_WARDEN' ? 'Active' : selectedComplaint.currentHandlerRole === 'DEAN' ? 'Escalated' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Handles high priority complaints and vendor dispatch. Passes critical hazards to Dean.
                    </p>
                  </div>
                </div>

                {/* 4. Dean stage */}
                <div className="relative">
                  <span className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${
                    selectedComplaint.currentHandlerRole === 'DEAN'
                      ? 'bg-rose-400 animate-ping'
                      : 'bg-white/20'
                  }`} />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200">Dean of Student Affairs</span>
                      <span className="text-[10px] font-mono text-rose-400">
                        {selectedComplaint.currentHandlerRole === 'DEAN' ? 'Active Investigation' : 'Hierarchy Top'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Highest executive escalation tier for institutional safety and critical repairs.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Escalation Audit Log Entries from Database */}
            {escalations.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Recorded Escalation Reasons (Audit Log)
                </h4>
                <div className="space-y-2">
                  {escalations.map((esc) => (
                    <div
                      key={esc.escalationId}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-brand-sky text-[11px]">
                        <span>{esc.fromRole} → {esc.toRole}</span>
                        <span className="text-slate-500">{new Date(esc.escalatedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-300 font-sans">{esc.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar (Trigger Escalation or Mark Resolved) */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Pattern Action Triggers
              </h4>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="Reason for escalating to next handler..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-violet"
                />

                <button
                  type="button"
                  onClick={handleEscalate}
                  disabled={escalating || selectedComplaint.currentHandlerRole === 'DEAN'}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-violet to-purple-600 hover:opacity-90 shadow-glow-violet transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{escalating ? 'Escalating...' : 'Trigger Chain Escalation'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleStatusChange('RESOLVED')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleStatusChange('CLOSED')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
                >
                  Close Ticket
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 glass-panel rounded-2xl p-12 text-center text-sm text-slate-400 border border-white/10">
            Select a complaint to inspect its Chain of Responsibility timeline.
          </div>
        )}

      </div>

      {/* LODGE COMPLAINT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 sm:p-8 border border-white/15 space-y-6 shadow-glass">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Lodge New Hostel Complaint</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Submitted via Mediator → Notifies Observers
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Category</label>
                <select
                  value={newComplaint.category}
                  onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1320] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                >
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Internet">Internet / Wi-Fi</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Security">Security</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Severity Level</label>
                <select
                  value={newComplaint.severity}
                  onChange={(e) => setNewComplaint({ ...newComplaint, severity: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1320] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-brand-cyan"
                >
                  <option value="LOW">LOW — Routine maintenance</option>
                  <option value="MEDIUM">MEDIUM — Noticeable defect</option>
                  <option value="HIGH">HIGH — Critical appliance breakdown</option>
                  <option value="CRITICAL">CRITICAL — Hazard / Flood / Safety threat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Split AC leaking water"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide exact room location and symptom details..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan cursor-pointer transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit to Warden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

