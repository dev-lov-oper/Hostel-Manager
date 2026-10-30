import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatternPill } from '../components/common/PatternPill';
import { api } from '../services/api';
import { AllocationDetail } from '../types';
import confetti from 'canvas-confetti';
import {
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  UserCheck,
  Building,
  RotateCcw,
  Sparkles,
  ArrowRight,
  History,
  FileText,
  User,
  Home,
  ChevronRight
} from 'lucide-react';

export const CheckInOutPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [processType, setProcessType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [allocations, setAllocations] = useState<AllocationDetail[]>([]);
  
  const [allocationId, setAllocationId] = useState<number>(user?.allocation?.allocationId || 2);
  const [studentId, setStudentId] = useState<number>(user?.student?.studentId || 1);
  const [roomId, setRoomId] = useState<number>(user?.allocation?.roomId || 3);

  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    processType: string;
    success: boolean;
    allocationId: number;
    studentId: number;
    roomId: number;
    executionSteps: string[];
  } | null>(null);

  const [logs, setLogs] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [logData, allocData] = await Promise.all([
        api.getProcessLogs(),
        api.getAllocations()
      ]);
      setLogs(logData || []);
      setAllocations(allocData || []);

      // If user has allocation or if allocations exist, select first eligible
      if (allocData && allocData.length > 0) {
        const userAlloc = user?.student 
          ? allocData.find((a) => a.studentId === user.student?.studentId)
          : null;
        
        const target = userAlloc || allocData[0];
        setAllocationId(target.allocationId);
        setStudentId(target.studentId);
        setRoomId(target.roomId);

        if (target.status === 'ALLOCATED') {
          setProcessType('CHECK_IN');
        } else if (target.status === 'CHECKED_IN') {
          setProcessType('CHECK_OUT');
        }
      }
    } catch (e) {
      console.warn('Failed to load process data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSelectAllocation = (alloc: AllocationDetail) => {
    setAllocationId(alloc.allocationId);
    setStudentId(alloc.studentId);
    setRoomId(alloc.roomId);
    setExecutionResult(null);

    if (alloc.status === 'ALLOCATED') {
      setProcessType('CHECK_IN');
    } else if (alloc.status === 'CHECKED_IN') {
      setProcessType('CHECK_OUT');
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setExecutionResult(null);

    try {
      // Calls Java Template Method implementation
      const res = await api.executeProcess({
        allocationId: Number(allocationId),
        studentId: Number(studentId),
        roomId: Number(roomId),
        processType
      });

      setExecutionResult(res);
      if (res.success) {
        confetti({ particleCount: 70, spread: 60 });
      }
      await loadData();
      await refreshUser();
    } catch (err: any) {
      alert('Process failed: ' + (err.message || 'Execution error'));
    } finally {
      setExecuting(false);
    }
  };

  const stepsCheckIn = [
    { num: 1, label: 'Identity Verification', method: 'verifyIdentityAndEligibility()' },
    { num: 2, label: 'Allocation State Check', method: 'verifyAllocationStatus()' },
    { num: 3, label: 'Room & Inventory Condition', method: 'inspectRoomAndInventory()' },
    { num: 4, label: 'Key & Dues Clearance', method: 'handleKeyAndDues()' },
    { num: 5, label: 'Database State Update', method: 'updateDatabaseStatus()' },
  ];

  const stepsCheckOut = [
    { num: 1, label: 'Departure Authorization', method: 'verifyIdentityAndEligibility()' },
    { num: 2, label: 'Active Stay Verification', method: 'verifyAllocationStatus()' },
    { num: 3, label: 'Damage Assessment', method: 'inspectRoomAndInventory()' },
    { num: 4, label: 'Key Return & Dues Clearance', method: 'handleKeyAndDues()' },
    { num: 5, label: 'Release Bed & Finalize', method: 'updateDatabaseStatus()' },
  ];

  const activeSteps = processType === 'CHECK_IN' ? stepsCheckIn : stepsCheckOut;

  const currentAllocation = allocations.find((a) => a.allocationId === allocationId);

  return (
    <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Check-In & Check-Out Workflow
            </h1>
            <PatternPill name="Template Method" category="Behavioral" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Enforcing standardized, invariant 5-step lifecycle execution defined by abstract HostelProcess.
          </p>
        </div>

        {/* Toggle Process Type */}
        <div className="flex items-center p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 self-start">
          <button
            onClick={() => {
              setProcessType('CHECK_IN');
              setExecutionResult(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              processType === 'CHECK_IN'
                ? 'bg-brand-cyan text-slate-900 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Check-In Workflow
          </button>
          <button
            onClick={() => {
              setProcessType('CHECK_OUT');
              setExecutionResult(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              processType === 'CHECK_OUT'
                ? 'bg-brand-violet text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Check-Out Workflow
          </button>
        </div>
      </div>

      {/* ALLOCATION SELECTOR CARD (1-Click selection) */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 shadow-glass">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-brand-cyan" />
              <span>Select Allocation Target (1-Click Fill)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Click an allocation below to automatically populate the parameters for the Template Method execution.
            </p>
          </div>
          <span className="text-xs font-mono text-brand-sky bg-brand-violet/20 px-3 py-1 rounded-full border border-brand-violet/30">
            {allocations.length} Active Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allocations.map((a) => {
            const isSelected = a.allocationId === allocationId;
            return (
              <button
                key={a.allocationId}
                type="button"
                onClick={() => handleSelectAllocation(a)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-brand-violet/25 border-brand-cyan shadow-glow-cyan text-white'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{a.studentName}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      a.status === 'CHECKED_IN'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : a.status === 'ALLOCATED'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {a.hostelName} — Room {a.roomNumber}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    Student ID: {a.studentId} • Room ID: {a.roomId} • Alloc ID: {a.allocationId}
                  </p>
                </div>
                {isSelected && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-brand-cyan">
                    <span>Selected Target</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Visual Step Tracker & Trigger Box (7 cols) + Live Step Execution Log (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Workflow Step Visualizer & Inputs (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-8 shadow-glass">
          
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-brand-cyan" />
                Template Method Invariant Sequence: {processType}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Subclasses implement specialized verification hooks
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-brand-violet/20 text-brand-sky border border-brand-violet/30 font-bold">
              final executeProcess()
            </span>
          </div>

          {/* Visual Step Progress Tracker */}
          <div className="space-y-4">
            {activeSteps.map((step) => {
              const isCompleted = executionResult?.success;
              return (
                <div
                  key={step.num}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-md'
                      : 'bg-white/[0.03] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      isCompleted ? 'bg-emerald-500 text-slate-900 shadow-glow-cyan' : 'bg-white/10 text-white'
                    }`}>
                      0{step.num}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{step.label}</h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{step.method}</p>
                    </div>
                  </div>

                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1 rounded bg-white/5 border border-white/5">
                      Awaiting
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input Parameters & Run Action */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Execution Target Parameters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Allocation ID</label>
                <input
                  type="number"
                  value={allocationId}
                  onChange={(e) => setAllocationId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-brand-cyan text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Student ID</label>
                <input
                  type="number"
                  value={studentId}
                  onChange={(e) => setStudentId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-brand-cyan text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Room ID</label>
                <input
                  type="number"
                  value={roomId}
                  onChange={(e) => setRoomId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-brand-cyan text-sm font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleExecute}
              disabled={executing}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-glow-cyan flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] ${
                processType === 'CHECK_IN'
                  ? 'bg-brand-cyan text-slate-900 hover:bg-cyan-300'
                  : 'bg-brand-violet text-white hover:bg-violet-600'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {executing
                  ? 'Executing Template Method Steps...'
                  : `Execute ${processType === 'CHECK_IN' ? 'Check-In Workflow' : 'Check-Out Workflow'}`}
              </span>
            </button>
          </div>

        </div>

        {/* Right Column: Real-time Execution Steps Log (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 shadow-glass">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-purple" />
                  Live Execution Trace Log
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  Captured via HostelProcess.logStep()
                </p>
              </div>
              {executionResult && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                  executionResult.success
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {executionResult.success ? 'SUCCESS' : 'FAILED'}
                </span>
              )}
            </div>

            {/* Steps stream */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {executionResult ? (
                executionResult.executionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs font-mono border ${
                      step.startsWith('COMPLETED')
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                        : step.startsWith('FAILED')
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 font-bold'
                        : 'bg-black/30 border-white/5 text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 mr-2">[{idx + 1}]</span>
                    {step}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs font-mono space-y-2">
                  <History className="w-8 h-8 mx-auto text-slate-600" />
                  <p>Awaiting process execution trigger.</p>
                  <p className="text-[10px]">Select an allocation and click Execute to view live logs.</p>
                </div>
              )}
            </div>
          </div>

          {/* Historical Audit Logs */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 shadow-glass">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-brand-cyan" />
                Audit Log History
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                {logs.length} logged records
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs font-mono">
              {logs.map((log) => (
                <div
                  key={log.logId}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{log.processType}</span>
                      <span className="text-[10px] text-slate-500">Student #{log.studentId}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs">{log.remarks}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
