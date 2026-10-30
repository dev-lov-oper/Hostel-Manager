import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatternPill } from '../components/common/PatternPill';
import { FloorPlan3D } from '../components/3d/FloorPlan3D';
import { Hostel, Room, AllocationDetail, AllocationRequest } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Building2,
  Sliders,
  CheckCircle2,
  Users,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';

export const RoomAllocationPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allocations, setAllocations] = useState<AllocationDetail[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AllocationRequest[]>([]);
  
  const [selectedHostelId, setSelectedHostelId] = useState<number>(1);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Strategy Execution State
  const [selectedStrategy, setSelectedStrategy] = useState<'MERIT_BASED' | 'FIRST_COME_FIRST_SERVED' | 'PREFERENCE_BASED'>('MERIT_BASED');
  const [executingStrategy, setExecutingStrategy] = useState(false);
  const [strategyResult, setStrategyResult] = useState<{
    strategyUsed: string;
    requestsProcessed: number;
    roomsAssigned: number;
  } | null>(null);

  // Student request state
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestNotice, setRequestNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [hostelsData, roomsData, allocData, reqData] = await Promise.all([
        api.getHostels(),
        api.getRooms(),
        api.getAllocations(),
        api.getAllocationRequests()
      ]);
      setHostels(hostelsData || []);
      setRooms(roomsData || []);
      setAllocations(allocData || []);
      setPendingRequests(reqData || []);
    } catch (e) {
      console.warn('Failed to load room allocation data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteStrategy = async () => {
    setExecutingStrategy(true);
    setStrategyResult(null);
    try {
      // Direct call to Java backend AllocationService.processAllocations(strategy, ...)
      const res = await api.executeAllocationStrategy(selectedStrategy);
      setStrategyResult(res);
      confetti({ particleCount: 70, spread: 50 });
      setRequestNotice(`Strategy executed successfully! Assigned ${res.roomsAssigned} room(s) via ${res.strategyUsed}.`);
      await loadData();
      await refreshUser();
    } catch (err: any) {
      alert('Allocation error: ' + (err.message || 'Execution failed'));
    } finally {
      setExecutingStrategy(false);
    }
  };

  // Student 1-click action: Queue & instantly execute strategy pattern
  const handleInstantAllocate = async () => {
    if (!user?.student?.studentId) return;
    setExecutingStrategy(true);
    setRequestNotice(null);
    try {
      // 1. Submit allocation request if not already queued
      try {
        await api.submitAllocationRequest(user.student.studentId, selectedHostelId);
      } catch (ignored) {
        // May already be queued or active, continue to execution
      }

      // 2. Run Strategy Pattern algorithm immediately
      const res = await api.executeAllocationStrategy(selectedStrategy);
      setStrategyResult(res);
      confetti({ particleCount: 80, spread: 60 });
      setRequestNotice(`Room allocated successfully using ${res.strategyUsed || selectedStrategy}!`);
      await loadData();
      await refreshUser();
    } catch (err: any) {
      alert('Allocation error: ' + (err.message || 'Execution failed'));
    } finally {
      setExecutingStrategy(false);
    }
  };

  const handleStudentSubmitRequest = async () => {
    if (!user?.student?.studentId) return;
    setSubmittingRequest(true);
    setRequestNotice(null);
    try {
      await api.submitAllocationRequest(user.student.studentId, selectedHostelId);
      setRequestNotice('Allocation request logged into queue. Click "Run Strategy Engine" below to assign your room immediately!');
      await loadData();
    } catch (err: any) {
      setRequestNotice(err.message || 'Failed to submit allocation request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Filter rooms by selected hostel
  const hostelRooms = rooms.filter((r) => r.hostelId === selectedHostelId);
  const selectedHostel = hostels.find((h) => h.hostelId === selectedHostelId) || hostels[0];

  const studentAllocation = user?.student 
    ? allocations.find((a) => a.studentId === user.student?.studentId) || user?.allocation 
    : null;

  const hasPendingRequest = user?.student
    ? pendingRequests.some((r) => r.studentId === user.student?.studentId && r.status === 'PENDING')
    : false;

  return (
    <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Room Allocation & Strategies
            </h1>
            <PatternPill name="Strategy Pattern" category="Behavioral" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Explore 3D floor maps and execute interchangeable room allocation algorithms via Java Strategy engine.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2 self-start transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* STUDENT ALLOCATION STATUS BANNER */}
      {user?.role === 'STUDENT' && studentAllocation && (
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/40">
                  ALLOCATION ACTIVE
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Strategy: {studentAllocation.strategy || 'MERIT_BASED'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {studentAllocation.hostelName} — Room {studentAllocation.roomNumber}
              </h3>
              <p className="text-xs text-slate-300">
                Floor {studentAllocation.floorNumber} • Status: {studentAllocation.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STRATEGY ENGINE EXECUTION CARD (Accessible to all for design pattern demonstration) */}
      <div className="glass-panel rounded-2xl p-6 border border-brand-violet/30 bg-gradient-to-r from-brand-violet/10 via-surface to-brand-cyan/10 space-y-5 shadow-glass">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-cyan" />
              <h3 className="font-bold text-white text-lg">
                Strategy Pattern Control Center
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                Interactive Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Switch allocation algorithm dynamically at runtime without modifying client callers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Pending Queue:</span>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-brand-violet/30 text-brand-sky border border-brand-violet/40">
              {pendingRequests.filter((r) => r.status === 'PENDING').length} Student(s)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'MERIT_BASED' as const,
              name: 'Merit-Based Allocation',
              icon: Award,
              desc: 'Sorts pending students descending by CGPA/merit score. Highest achievers get first room choice.',
              badge: 'MeritBasedAllocationStrategy'
            },
            {
              id: 'FIRST_COME_FIRST_SERVED' as const,
              name: 'First-Come-First-Served',
              icon: Clock,
              desc: 'Sorts pending requests chronologically by submission timestamp (FCFS queue).',
              badge: 'FirstComeFirstServedStrategy'
            },
            {
              id: 'PREFERENCE_BASED' as const,
              name: 'Preference-Based Allocation',
              icon: Building2,
              desc: 'Matches requested preferred hostel block first before falling back to campus spares.',
              badge: 'PreferenceBasedAllocationStrategy'
            }
          ].map((strat) => {
            const Icon = strat.icon;
            const isSelected = selectedStrategy === strat.id;

            return (
              <button
                key={strat.id}
                onClick={() => setSelectedStrategy(strat.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-brand-violet/25 border-brand-cyan text-white shadow-glow-cyan'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-200">
                      <Icon className="w-4 h-4 text-brand-cyan" />
                      <span>{strat.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-cyan" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{strat.desc}</p>
                </div>
                <span className="text-[10px] font-mono mt-3 px-2 py-0.5 rounded bg-black/40 text-slate-300 block truncate">
                  {strat.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-300 font-mono flex items-center gap-2">
            <span>Selected Strategy:</span>
            <span className="text-brand-cyan font-bold bg-black/40 px-2 py-1 rounded border border-white/5">
              {selectedStrategy}
            </span>
          </div>

          <button
            onClick={handleExecuteStrategy}
            disabled={executingStrategy}
            className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{executingStrategy ? 'Executing Algorithm...' : `Run ${selectedStrategy.replace(/_/g, ' ')}`}</span>
          </button>
        </div>

        {strategyResult && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                Strategy execution completed: <strong>{strategyResult.roomsAssigned}</strong> rooms allocated out of{' '}
                <strong>{strategyResult.requestsProcessed}</strong> pending requests.
              </span>
            </div>
            <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-lg">
              {strategyResult.strategyUsed}
            </span>
          </div>
        )}
      </div>

      {/* STUDENT ACTION: QUEUE OR INSTANT ALLOCATE */}
      {user?.role === 'STUDENT' && !studentAllocation && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-glass">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base sm:text-lg">Request Hostel Accommodation</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
                Student Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Choose your preferred hostel block. You can either queue your request for batch processing, 
              or run the Strategy Pattern immediately for instant allocation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleInstantAllocate}
              disabled={executingStrategy}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-brand-cyan to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-glow-cyan transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{executingStrategy ? 'Allocating...' : '⚡ Instant Allocate via Strategy'}</span>
            </button>

            <button
              onClick={handleStudentSubmitRequest}
              disabled={submittingRequest}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{submittingRequest ? 'Submitting...' : 'Queue Request Only'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PENDING NOTIFICATION / STATUS ALERT */}
      {requestNotice && (
        <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-glass">
          <div className="flex items-center gap-3">
            <FileCheck2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">Allocation Status Update</p>
              <p className="text-xs text-slate-300 mt-0.5">{requestNotice}</p>
            </div>
          </div>

          {/* If student is pending, provide instant 1-click execute button */}
          {user?.role === 'STUDENT' && !studentAllocation && (
            <button
              onClick={handleExecuteStrategy}
              disabled={executingStrategy}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{executingStrategy ? 'Running Engine...' : '⚡ Run Strategy & Assign Room Now'}</span>
            </button>
          )}
        </div>
      )}

      {/* HOSTEL & FLOOR SELECTOR */}
      <div className="space-y-4">
        {/* Hostel Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {hostels.map((hostel) => (
            <button
              key={hostel.hostelId}
              onClick={() => {
                setSelectedHostelId(hostel.hostelId);
                setSelectedFloor(1);
              }}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedHostelId === hostel.hostelId
                  ? 'bg-brand-violet text-white shadow-glow-violet'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{hostel.hostelName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300 font-bold">
                {hostel.genderType}
              </span>
            </button>
          ))}
        </div>

        {/* Floor selector tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-2">Select Floor:</span>
          {[1, 2, 3, 4].map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`w-10 h-10 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedFloor === floor
                  ? 'bg-brand-cyan text-slate-900 shadow-glow-cyan'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              F{floor}
            </button>
          ))}
        </div>
      </div>

      {/* 3D FLOOR PLAN VISUALIZATION */}
      <FloorPlan3D
        rooms={hostelRooms}
        selectedFloor={selectedFloor}
        onSelectRoom={(r) => setSelectedRoom(r)}
        selectedRoomId={selectedRoom?.roomId}
      />

      {/* ALLOCATION AUDIT HISTORY TABLE */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-4 shadow-glass">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Live Room Allocation History</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Verified assignments committed transactionally to SQLite
            </p>
          </div>
          <span className="text-xs font-mono text-brand-sky bg-brand-violet/20 px-3 py-1 rounded-full border border-brand-violet/30">
            {allocations.length} total allocations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Student</th>
                <th className="pb-3 font-semibold">Merit</th>
                <th className="pb-3 font-semibold">Hostel & Room</th>
                <th className="pb-3 font-semibold">Strategy Engine</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Allocated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {allocations.map((a) => (
                <tr key={a.allocationId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 font-sans">
                    <p className="font-semibold text-white text-sm">{a.studentName}</p>
                    <p className="text-[10px] font-mono text-slate-500">{a.studentCode}</p>
                  </td>
                  <td className="py-3.5 font-bold text-brand-sky text-sm">{a.meritScore}</td>
                  <td className="py-3.5">
                    <span className="font-semibold text-white">{a.hostelName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Room {a.roomNumber} (Floor {a.floorNumber})
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded bg-brand-violet/20 text-brand-sky border border-brand-violet/30 text-[10px] font-bold">
                      {a.strategy}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border font-semibold ${
                      a.status === 'CHECKED_IN'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-[11px] text-slate-500">
                    {new Date(a.allocatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
