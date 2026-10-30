import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatternPill } from '../components/common/PatternPill';
import { FloorPlan3D } from '../components/3d/FloorPlan3D';
import { HostelBuilding3D } from '../components/3d/HostelBuilding3D';
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
  RefreshCw
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

  // Strategy Execution State (Admin / Staff)
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
      setRequestNotice('Allocation request logged into queue. Waiting for admin strategy run.');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
          className="px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2 self-start transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* STRATEGY ENGINE EXECUTION CARD (For Admins / Wardens) */}
      {(user?.role === 'ADMIN' || user?.role === 'WARDEN' || user?.role === 'CHIEF_WARDEN') && (
        <div className="glass-panel rounded-2xl p-6 border border-brand-violet/30 bg-gradient-to-r from-brand-violet/10 via-surface to-brand-cyan/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-cyan" />
                <h3 className="font-bold text-white text-base">
                  Strategy Pattern Control Center
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch allocation algorithm dynamically at runtime without modifying client callers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Queue:</span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-brand-violet/30 text-brand-sky border border-brand-violet/40">
                {pendingRequests.filter((r) => r.status === 'PENDING').length} Pending Requests
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
                  <span className="text-[9px] font-mono mt-3 px-2 py-0.5 rounded bg-black/40 text-slate-300 block truncate">
                    {strat.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400 font-mono">
              Selected Policy: <span className="text-brand-cyan font-bold">{selectedStrategy}</span>
            </div>

            <button
              onClick={handleExecuteStrategy}
              disabled={executingStrategy}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{executingStrategy ? 'Executing Algorithm...' : `Run ${selectedStrategy.replace(/_/g, ' ')}`}</span>
            </button>
          </div>

          {strategyResult && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Strategy execution completed: <strong>{strategyResult.roomsAssigned}</strong> rooms allocated out of{' '}
                  <strong>{strategyResult.requestsProcessed}</strong> pending requests.
                </span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400 font-bold">
                {strategyResult.strategyUsed}
              </span>
            </div>
          )}
        </div>
      )}

      {/* STUDENT QUICK ACTION: SUBMIT ROOM REQUEST */}
      {user?.role === 'STUDENT' && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-base">Request Hostel Accommodation</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit your preferred hostel block into the queue. The allocation engine will assign your room.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStudentSubmitRequest}
              disabled={submittingRequest}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{submittingRequest ? 'Submitting...' : 'Queue Allocation Request'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {requestNotice && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{requestNotice}</span>
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
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                selectedHostelId === hostel.hostelId
                  ? 'bg-brand-violet text-white shadow-glow-violet'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{hostel.hostelName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-slate-300">
                {hostel.genderType}
              </span>
            </button>
          ))}
        </div>

        {/* Floor selector tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-2">Floor:</span>
          {Array.from({ length: selectedHostel?.totalFloors || 4 }, (_, i) => i + 1).map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`w-9 h-9 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedFloor === floor
                  ? 'bg-brand-cyan text-slate-900 shadow-glow-cyan'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 border border-white/10'
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
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Live Room Allocation History</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified assignments committed transactionally to SQLite
            </p>
          </div>
          <span className="text-xs font-mono text-brand-sky">
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
                  <td className="py-3 font-sans">
                    <p className="font-semibold text-white">{a.studentName}</p>
                    <p className="text-[10px] font-mono text-slate-500">{a.studentCode}</p>
                  </td>
                  <td className="py-3 font-bold text-brand-sky">{a.meritScore}</td>
                  <td className="py-3">
                    <span className="font-semibold text-white">{a.hostelName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Room {a.roomNumber} (Floor {a.floorNumber})
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-brand-violet/20 text-brand-sky border border-brand-violet/30 text-[10px]">
                      {a.strategy}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                      a.status === 'CHECKED_IN'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 text-[11px] text-slate-500">
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
