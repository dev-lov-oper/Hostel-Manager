import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  Zap, 
  ArrowUpRight, 
  Users, 
  Layers, 
  Flame,
  Activity
} from 'lucide-react';

interface Hero3DCardStackProps {
  onExplore: () => void;
}

export const Hero3DCardStack: React.FC<Hero3DCardStackProps> = ({ onExplore }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(8);
  const [rotateY, setRotateY] = useState(-12);
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C'>('A');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rY = ((x - centerX) / centerX) * 16;
    const rX = -((y - centerY) / centerY) * 16;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(6);
    setRotateY(-8);
  };

  const roomsA = [
    { num: 'A-101', type: 'Single Deluxe', occ: 1, cap: 1, status: 'occupied' },
    { num: 'A-102', type: 'Double En-Suite', occ: 1, cap: 2, status: 'available' },
    { num: 'A-103', type: 'Double En-Suite', occ: 2, cap: 2, status: 'occupied' },
    { num: 'A-104', type: 'Triple Studio', occ: 0, cap: 3, status: 'available' },
    { num: 'A-201', type: 'Penthouse Suite', occ: 1, cap: 1, status: 'occupied' },
    { num: 'A-202', type: 'Single Deluxe', occ: 0, cap: 1, status: 'available' },
  ];

  return (
    <div 
      className="relative w-full h-[540px] sm:h-[600px] flex items-center justify-center perspective-2000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {/* Ambient background glows */}
      <div className="absolute w-[450px] h-[450px] bg-brand-violet/25 blur-[120px] rounded-full -top-10 -right-10 pointer-events-none" />
      <div className="absolute w-[380px] h-[380px] bg-brand-cyan/20 blur-[100px] rounded-full -bottom-10 -left-10 pointer-events-none" />

      {/* Main 3D Tilted Glass Console */}
      <div
        className="relative w-full max-w-[580px] preserve-3d transition-transform duration-200 ease-out cursor-default"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* BASE CONSOLE LAYER (Z: 0) */}
        <div 
          className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/15 shadow-2xl backdrop-blur-2xl relative overflow-hidden bg-slate-900/80"
          style={{ transform: 'translateZ(0px)' }}
        >
          {/* Top Status Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-brand-cyan" />
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
                  <span>Hostel Allocation Grid</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] font-mono text-slate-400">Live Space Orchestrator</p>
              </div>
            </div>

            {/* Block switcher */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {(['A', 'B', 'C'] as const).map((block) => (
                <button
                  key={block}
                  onClick={() => setActiveTab(block)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                    activeTab === block 
                      ? 'bg-brand-cyan text-slate-950 shadow-glow-cyan' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Block {block}
                </button>
              ))}
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {roomsA.map((r) => (
              <div 
                key={r.num}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  r.status === 'available'
                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400'
                    : 'bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span className="text-white">{r.num}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    r.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {r.status === 'available' ? 'OPEN' : 'OCC'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate">{r.type}</p>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] font-mono text-slate-400">
                  <span>Capacity</span>
                  <span className="text-white">{r.occ}/{r.cap}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom telemetry row */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                94% Occupancy Efficiency
              </span>
            </div>
            <button
              onClick={onExplore}
              className="text-xs font-semibold text-brand-cyan hover:text-cyan-300 flex items-center gap-1 group cursor-pointer"
            >
              <span>Manage Allocations</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* FLOATING 3D CARD 1: STRATEGY PATTERN (Z: 45px) */}
        <div 
          className="absolute -top-7 -right-6 sm:-right-10 bg-slate-900/90 border border-brand-cyan/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-60 preserve-3d"
          style={{ 
            transform: 'translateZ(45px)',
            boxShadow: '0 20px 40px -10px rgba(6, 182, 212, 0.25)'
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-brand-cyan font-bold">Strategy Pattern</p>
              <p className="text-xs text-white font-semibold">CGPA-Based Allocation</p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-300 font-mono flex items-center justify-between bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
            <span>CGPA: 9.85 / 10.0</span>
            <span className="text-emerald-400 font-bold">Priority #1</span>
          </div>
        </div>

        {/* FLOATING 3D CARD 2: CHAIN OF RESPONSIBILITY (Z: 65px) */}
        <div 
          className="absolute -bottom-7 -left-6 sm:-left-10 bg-slate-900/90 border border-brand-violet/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-64 preserve-3d"
          style={{ 
            transform: 'translateZ(65px)',
            boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.25)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-violet/20 flex items-center justify-center text-brand-sky">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-brand-sky font-bold">Chain Escalation</p>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              HIGH
            </span>
          </div>
          <p className="text-xs text-slate-200 font-medium">Warden → Chief Warden</p>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-cyan to-brand-violet w-2/3 rounded-full" />
            </div>
            <span className="text-[10px] font-mono text-slate-400">Tier 2</span>
          </div>
        </div>

        {/* FLOATING 3D CARD 3: PROTOTYPE CLONE BADGE (Z: 85px) */}
        <div 
          className="absolute top-1/2 -right-8 sm:-right-12 -translate-y-1/2 bg-slate-900/90 border border-white/20 rounded-xl p-3 shadow-2xl backdrop-blur-xl preserve-3d flex items-center gap-3"
          style={{ 
            transform: 'translateZ(85px)',
            boxShadow: '0 20px 35px -8px rgba(0,0,0,0.7)'
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400">Prototype Pattern</p>
            <p className="text-xs font-bold text-white">Cloned: Deluxe Studio</p>
          </div>
        </div>

      </div>
    </div>
  );
};

