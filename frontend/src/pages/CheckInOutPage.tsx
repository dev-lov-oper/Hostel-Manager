import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatternPill } from '../components/common/PatternPill';
import { api } from '../services/api';
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
  FileText
} from 'lucide-react';

export const CheckInOutPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [processType, setProcessType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [allocationId, setAllocationId] = useState<number>(user?.allocation?.allocationId || 1);
  const [studentId, setStudentId] = useState<number>(user?.student?.studentId || 1);
  const [roomId, setRoomId] = useState<number>(user?.allocation?.roomId || 11);

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

  const fetchLogs = async () => {
    try {
      const data = await api.getProcessLogs();
      setLogs(data || []);
    } catch (e) {
      console.warn('Failed to load process logs:', e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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
        confetti({ particleCount: 60, spread: 60 });
      }
      await fetchLogs();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 self-start">
          <button
            onClick={() => {
              setProcessType('CHECK_IN');
              setExecutionResult(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              processType === 'CHECK_OUT'
                ? 'bg-brand-violet text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Check-Out Workflow
          </button>
        </div>
      </div>

      {/* Main Grid: Visual Step Tracker & Trigger Box (7 cols) + Live Step Execution Log (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Workflow Step Visualizer & Inputs (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-8">
          
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-brand-cyan" />
                Template Method Invariant Sequence: {processType}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Subclasses implement specialized verification hooks
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
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
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.03] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isCompleted ? 'bg-emerald-500 text-slate-900' : 'bg-white/10 text-white'
                    }`}>
                      0{step.num}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-200">{step.label}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{step.method}</p>
                    </div>
                  </div>

                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Awaiting</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input Parameters */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Execution Target Parameters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Allocation ID</label>
                <input
                  type="number"
                  value={allocationId}
                  onChange={(e) => setAllocationId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Student ID</label>
                <input
                  type="number"
                  value={studentId}
                  onChange={(e) => setStudentId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Room ID</label>
                <input
                  type="number"
                  value={roomId}
                  onChange={(e) => setRoomId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <button
              onClick={handleExecute}
              disabled={executing}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-glow-cyan flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                processType === 'CHECK_IN'
                  ? 'bg-brand-cyan text-slate-900 hover:bg-cyan-300'
                  : 'bg-brand-violet text-white hover:bg-violet-600'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {executing
                  ? 'Executing Template Method Steps...'
                  : `Run ${processType === 'CHECK_IN' ? 'Check-In Sequence' : 'Check-Out Sequence'}`}
              </span>
            </button>
          </div>

        </div>

        {/* Right Column: Real-time Execution Steps Log (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-purple" />
                  Live Execution Trace Log
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  Captured via HostelProcess.logStep()
                </p>
              </div>
              {executionResult && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  executionResult.success
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {executionResult.success ? 'SUCCESS' : 'FAILED'}
                </span>
              )}
            </div>

            <div className="bg-[#090d16] rounded-xl p-4 font-mono text-xs space-y-2 max-h-80 overflow-y-auto border border-white/[0.06]">
              {executionResult ? (
                executionResult.executionSteps.map((stepMsg, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-brand-cyan select-none">›</span>
                    <span className={stepMsg.startsWith('FAILED') ? 'text-rose-400 font-bold' : stepMsg.startsWith('COMPLETED') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {stepMsg}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-[11px] italic">
                  Run the check-in or check-out workflow to trace execution steps in real time.
                </div>
              )}
            </div>
          </div>

          {/* Process Audit Logs Table */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-brand-cyan" />
                Audit Logs in SQLite (process_logs)
              </h4>
              <span className="text-[10px] font-mono text-slate-500">{logs.length} entries</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.logId} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold text-white">{log.processType}</span>
                    <span className="text-emerald-400">{log.status}</span>
                  </div>
                  <p className="text-slate-400 text-[10px] line-clamp-2">{log.remarks}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

