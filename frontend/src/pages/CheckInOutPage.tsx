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
  ChevronRight,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const CheckInOutPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [processType, setProcessType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [allocations, setAllocations] = useState<AllocationDetail[]>([]);
  
  const [allocationId, setAllocationId] = useState<number>(user?.allocation?.allocationId || 3);
  const [studentId, setStudentId] = useState<number>(user?.student?.studentId || 2);
  const [roomId, setRoomId] = useState<number>(user?.allocation?.roomId || 2);

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

      if (allocData && allocData.length > 0) {
        const userAlloc = user?.student 
          ? allocData.find((a) => a.studentId === user.student?.studentId)
          : null;
        
        const target = userAlloc || allocData[0];
        setAllocationId(target.allocationId);
        setStudentId(target.studentId);
        setRoomId(target.roomId);

        // Pre-select appropriate workflow based on student's current status
        if (target.status === 'ALLOCATED' || target.status === 'CHECKED_OUT') {
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

    // Auto-align process type to current status
    if (alloc.status === 'ALLOCATED' || alloc.status === 'CHECKED_OUT') {
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
        confetti({ particleCount: 75, spread: 60 });
      }
      await loadData();
      await refreshUser();
    } catch (err: any) {
      console.warn('Execution error:', err);
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

  // Helper to determine step status
  const getStepStatus = (stepNum: number) => {
    if (!executionResult) return 'AWAITING';
    if (executionResult.success) return 'SUCCESS';

    const failedStep = executionResult.executionSteps.find((s) => s.startsWith('FAILED:'));
    if (!failedStep) return 'AWAITING';

    if (failedStep.includes('Identity verification') && stepNum === 1) return 'FAILED';
    if (failedStep.includes('Allocation') && stepNum === 2) return 'FAILED';
    if (failedStep.includes('Room') && stepNum === 3) return 'FAILED';
    if (failedStep.includes('Key') && stepNum === 4) return 'FAILED';

    if (stepNum < 2 && failedStep.includes('Allocation')) return 'SUCCESS';
    if (stepNum < 3 && failedStep.includes('Room')) return 'SUCCESS';
    if (stepNum < 4 && failedStep.includes('Key')) return 'SUCCESS';

    return 'AWAITING';
  };

  const failedReason = executionResult?.executionSteps.find((s) => s.startsWith('FAILED:'));

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
              Click an allocation below to automatically populate the parameters and align the workflow.
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
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
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
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className={isSelected ? 'text-brand-cyan font-bold' : 'text-slate-400'}>
                    {a.status === 'CHECKED_IN' ? '⚡ Ready for Check-Out' : '⚡ Ready for Check-In'}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" />}
                </div>
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

          {/* Validation Notice Banner (Replaces intrusive alert popup) */}
          {failedReason && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 shadow-lg animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Template Method Invariant Guard Triggered</p>
                <p className="text-xs text-rose-200 mt-1 leading-relaxed">{failedReason}</p>
                <p className="text-[11px] text-slate-400 mt-2 font-mono">
                  Tip: Use the allocation cards above to automatically toggle between Check-In and Check-Out based on current state.
                </p>
              </div>
            </div>
          )}

          {/* Visual Step Progress Tracker */}
          <div className="space-y-4">
            {activeSteps.map((step) => {
              const status = getStepStatus(step.num);
              return (
                <div
                  key={step.num}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    status === 'SUCCESS'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-md'
                      : status === 'FAILED'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 shadow-md'
                      : 'bg-white/[0.03] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      status === 'SUCCESS' 
                        ? 'bg-emerald-500 text-slate-900 shadow-glow-cyan' 
                        : status === 'FAILED'
                        ? 'bg-rose-500 text-white shadow-lg'
                        : 'bg-white/10 text-white'
                    }`}>
                      0{step.num}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{step.label}</h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{step.method}</p>
                    </div>
                  </div>

                  {status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  ) : status === 'FAILED' ? (
                    <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
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
