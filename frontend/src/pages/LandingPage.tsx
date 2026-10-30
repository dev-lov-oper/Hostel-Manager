import React, { useState, useEffect, useRef } from 'react';
import { HostelBuilding3D } from '../components/3d/HostelBuilding3D';
import { FloorPlan3D } from '../components/3d/FloorPlan3D';
import { PatternPill } from '../components/common/PatternPill';
import { Room, SystemStats, PatternMetadata } from '../types';
import { api } from '../services/api';
import {
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Users,
  Building,
  CheckCircle2,
  Clock,
  ChevronRight,
  Activity,
  Code2,
  Cpu,
  GitBranch,
  Zap
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onNavigate: (view: string, tab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [patterns, setPatterns] = useState<PatternMetadata[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial showcase data
    api.getRooms().then(setRooms).catch(console.warn);
    api.getSystemStats().then(setStats).catch(console.warn);
    api.getPatternsMeta().then(setPatterns).catch(console.warn);
  }, []);

  useEffect(() => {
    // GSAP ScrollTrigger Storytelling
    const ctx = gsap.context(() => {
      gsap.from('.gsap-fade-in', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });

      // Storytelling transition
      if (storyRef.current) {
        gsap.from(storyRef.current, {
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'power2.out'
        });
      }

      // Complaint timeline reveal
      if (timelineRef.current) {
        gsap.from('.timeline-step', {
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 75%',
          },
          x: -30,
          opacity: 0,
          stagger: 0.25,
          duration: 0.8,
          ease: 'power3.out'
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen space-y-24 pb-24 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="relative pt-12 lg:pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-violet/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-brand-cyan/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 gsap-fade-in text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-brand-sky">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              <span>8 Enterprise Design Patterns Integrated</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Your Campus. <br />
              <span className="bg-gradient-to-r from-brand-cyan via-slate-100 to-brand-violet bg-clip-text text-transparent">
                Your Space. Simplified.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              A modern, architectural hostel room allocation and complaint lifecycle platform powered by 
              clean Java object-oriented design patterns.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Live Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('explorer')}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-brand-purple" />
                <span>Architecture Explorer</span>
              </button>
            </div>

            {/* Quick stats mini-row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08]">
              <div>
                <p className="text-2xl font-extrabold font-mono text-white">
                  {stats ? `${stats.totalRooms}` : '24+'}
                </p>
                <p className="text-xs text-slate-400">Configured Rooms</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold font-mono text-brand-cyan">
                  {stats ? `${stats.availableRooms}` : '18'}
                </p>
                <p className="text-xs text-slate-400">Available Beds</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold font-mono text-brand-purple">
                  8 / 8
                </p>
                <p className="text-xs text-slate-400">Patterns Active</p>
              </div>
            </div>
          </div>

          {/* Right Hero 3D Building Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="w-full h-[460px] sm:h-[520px]">
              <HostelBuilding3D
                onFloorSelect={(f) => setSelectedFloor(f)}
                selectedFloor={selectedFloor}
                interactive={true}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 2. SCROLL-BASED STORYTELLING: INTERACTIVE FLOOR PLAN */}
      <section ref={storyRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-xs font-mono text-brand-cyan">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Floor Level Inspection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            From Macro Architecture to Micro Space
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Switch between floors or click individual rooms to inspect real-time bed capacity, 
            amenities cloned via Prototype Pattern, and current maintenance status.
          </p>
        </div>

        <FloorPlan3D
          rooms={rooms}
          selectedFloor={selectedFloor}
          onSelectRoom={(r) => setSelectedRoom(r)}
          selectedRoomId={selectedRoom?.roomId}
        />
      </section>

      {/* 3. CHAIN OF RESPONSIBILITY WORKFLOW TIMELINE */}
      <section ref={timelineRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-xs font-mono text-brand-sky">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Chain of Responsibility & Observer Patterns</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Complaint Escalation Hierarchy
          </h2>
          <p className="text-slate-400 text-sm">
            Complaints auto-escalate through verified handlers based on severity level, triggering
            real-time observer notifications to students and staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '1',
              title: 'Student Submission',
              handler: 'Student',
              desc: 'Complaint submitted with severity (Low, Medium, High, Critical). Handled initially by Warden.',
              badge: 'Mediator Logged',
              color: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400'
            },
            {
              step: '2',
              title: 'Warden Inspection',
              handler: 'WardenHandler',
              desc: 'Resolves standard maintenance. Automatically escalates HIGH and CRITICAL complaints.',
              badge: 'Chain Level 1',
              color: 'border-amber-500/30 bg-amber-500/5 text-amber-400'
            },
            {
              step: '3',
              title: 'Chief Warden Review',
              handler: 'ChiefWardenHandler',
              desc: 'Authorizes vendor repairs & budget. Escalates CRITICAL hazards directly to Dean.',
              badge: 'Chain Level 2',
              color: 'border-purple-500/30 bg-purple-500/5 text-purple-400'
            },
            {
              step: '4',
              title: 'Dean Resolution',
              handler: 'DeanHandler',
              desc: 'Executive level intervention for safety emergencies and institutional complaints.',
              badge: 'Chain Level 3',
              color: 'border-rose-500/30 bg-rose-500/5 text-rose-400'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`timeline-step glass-panel rounded-xl p-5 border relative flex flex-col justify-between ${item.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-white/10 text-white font-mono font-bold text-xs flex items-center justify-center">
                    0{item.step}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-bold text-slate-100 text-base">{item.title}</h4>
                <p className="text-[11px] font-mono text-brand-sky mt-0.5">{item.handler}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Status Broadcast</span>
                <span className="text-emerald-400">Observer SSE</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DESIGN PATTERNS SHOWCASE GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-xs font-mono text-brand-sky mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>The 8 Core Software Patterns</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              Architectural Design Patterns in Action
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Every feature in HostelHub is anchored directly to its corresponding Java class.
            </p>
          </div>

          <button
            onClick={() => onNavigate('explorer')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-cyan bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 flex items-center gap-1.5 self-start cursor-pointer transition-all"
          >
            <span>Open Architecture Explorer</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {patterns.map((pat) => (
            <div
              key={pat.id}
              onClick={() => onNavigate('explorer')}
              className="glass-panel glass-panel-hover rounded-xl p-5 border border-white/10 space-y-3 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
                    {pat.category}
                  </span>
                  <Code2 className="w-4 h-4 text-slate-500" />
                </div>
                <h4 className="font-bold text-white text-base group-hover:text-brand-cyan transition-colors">
                  {pat.name}
                </h4>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {pat.intent}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Core Class:
                </span>
                <span className="text-[11px] font-mono text-slate-300 truncate block bg-black/30 px-2 py-1 rounded">
                  {pat.keyClasses[0]?.split('.').pop()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-brand-violet/20 via-surface to-brand-cyan/20 border border-white/10 text-center space-y-6 relative overflow-hidden shadow-glass">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Experience Smart Hostel Management?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Login as Student, Warden, or Admin to test allocation strategies, build student profiles, 
              clone room templates, and track complaint escalations in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all cursor-pointer"
            >
              Launch Dashboard
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
