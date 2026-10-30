import React, { useState, useEffect, useRef } from 'react';
import { Hero3DCardStack } from '../components/3d/Hero3DCardStack';
import { ScrollSwipe3D } from '../components/3d/ScrollSwipe3D';
import { FloorPlan3D } from '../components/3d/FloorPlan3D';
import { Room, SystemStats, PatternMetadata } from '../types';
import { api } from '../services/api';
import {
  ArrowRight,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  GitBranch,
  Zap,
  Activity,
  Flame,
  Building
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
    api.getRooms().then(setRooms).catch(console.warn);
    api.getSystemStats().then(setStats).catch(console.warn);
    api.getPatternsMeta().then(setPatterns).catch(console.warn);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gsap-fade-in', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      if (storyRef.current) {
        gsap.from(storyRef.current, {
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'power2.out'
        });
      }

      if (timelineRef.current) {
        gsap.from('.timeline-step', {
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 75%',
          },
          x: -30,
          opacity: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: 'power3.out'
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen space-y-28 pb-32 overflow-hidden w-full">
      
      {/* 1. HERO SECTION (EXPANDED TO FULL SCREEN WITH 3D INTERACTIVE CONSOLE) */}
      <section ref={heroRef} className="relative pt-8 lg:pt-16 max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-14 xl:px-20">
        
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-brand-violet/15 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[400px] bg-brand-cyan/12 blur-[130px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-8 gsap-fade-in text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.05] border border-white/15 text-xs sm:text-sm font-mono text-brand-sky shadow-inner">
              <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
              <span>8 Enterprise Design Patterns Integrated</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.05]">
              Your Campus. <br />
              <span className="bg-gradient-to-r from-brand-cyan via-slate-100 to-brand-violet bg-clip-text text-transparent">
                Your Space. Simplified.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              A modern, architectural hostel room allocation and complaint lifecycle platform powered by 
              clean Java object-oriented design patterns with real-time reactive telemetry.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-3">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-8 py-4 rounded-2xl font-bold text-base text-slate-950 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Explore Live Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate('explorer')}
                className="px-8 py-4 rounded-2xl font-bold text-base text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 transition-all flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Layers className="w-5 h-5 text-brand-purple" />
                <span>Architecture Explorer</span>
              </button>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.1]">
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <p className="text-3xl sm:text-4xl font-black font-mono text-white">
                  {stats ? `${stats.totalRooms}` : '24+'}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Configured Rooms</p>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-brand-cyan/20">
                <p className="text-3xl sm:text-4xl font-black font-mono text-brand-cyan">
                  {stats ? `${stats.availableRooms}` : '18'}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Available Beds</p>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-brand-violet/20">
                <p className="text-3xl sm:text-4xl font-black font-mono text-brand-sky">
                  8 / 8
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Patterns Active</p>
              </div>
            </div>
          </div>

          {/* Right Hero 3D Card Stack (Replaced Blocky Model) */}
          <div className="lg:col-span-6 relative">
            <Hero3DCardStack onExplore={() => onNavigate('dashboard', 'room-allocation')} />
          </div>

        </div>
      </section>

      {/* 2. 3D SWIPE & SCROLL ANIMATION SECTION */}
      <ScrollSwipe3D onNavigate={onNavigate} />

      {/* 3. SCROLL-BASED STORYTELLING: INTERACTIVE FLOOR PLAN */}
      <section ref={storyRef} className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-14 xl:px-20 space-y-10">
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-xs sm:text-sm font-mono text-brand-cyan">
            <Cpu className="w-4 h-4" />
            <span>Interactive Floor Level Inspection</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            From Macro Architecture to Micro Space
          </h2>
          <p className="text-slate-300 text-sm sm:text-lg">
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

      {/* 4. CHAIN OF RESPONSIBILITY WORKFLOW TIMELINE */}
      <section ref={timelineRef} className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-14 xl:px-20 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-xs sm:text-sm font-mono text-brand-sky">
            <GitBranch className="w-4 h-4" />
            <span>Chain of Responsibility & Observer Patterns</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Complaint Escalation Hierarchy
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Complaints auto-escalate through verified handlers based on severity level, triggering
            real-time observer notifications to students and staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              className={`timeline-step glass-panel rounded-2xl p-6 border relative flex flex-col justify-between ${item.color} shadow-lg`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-white/10 text-white font-mono font-bold text-xs flex items-center justify-center">
                    0{item.step}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-100 text-lg">{item.title}</h4>
                <p className="text-xs font-mono text-brand-sky mt-1">{item.handler}</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Status Broadcast</span>
                <span className="text-emerald-400 font-semibold">Observer SSE</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. DESIGN PATTERNS SHOWCASE GRID */}
      <section className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-14 xl:px-20 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-xs sm:text-sm font-mono text-brand-sky mb-3">
              <Layers className="w-4 h-4" />
              <span>The 8 Core Software Patterns</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Architectural Design Patterns in Action
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Every feature in HostelHub is anchored directly to its corresponding Java class.
            </p>
          </div>

          <button
            onClick={() => onNavigate('explorer')}
            className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-brand-cyan bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 flex items-center gap-2 self-start cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <span>Open Architecture Explorer</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {patterns.map((pat) => (
            <div
              key={pat.id}
              onClick={() => onNavigate('explorer')}
              className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/10 space-y-4 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-brand-violet/20 text-brand-sky border border-brand-violet/30 font-semibold">
                    {pat.category}
                  </span>
                  <Code2 className="w-5 h-5 text-slate-400" />
                </div>
                <h4 className="font-extrabold text-white text-lg group-hover:text-brand-cyan transition-colors">
                  {pat.name}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">
                  {pat.intent}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Core Java Class:
                </span>
                <span className="text-xs font-mono text-slate-200 truncate block bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  {pat.keyClasses[0]?.split('.').pop()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-14 xl:px-20">
        <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-br from-brand-violet/20 via-surface to-brand-cyan/20 border border-white/15 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-black text-white">
              Ready to Experience Smart Hostel Management?
            </h2>
            <p className="text-slate-200 text-base sm:text-xl leading-relaxed">
              Login as Student, Warden, or Admin to test allocation strategies, build student profiles, 
              clone room templates, and track complaint escalations in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 pt-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-10 py-4 rounded-2xl font-bold text-base text-slate-950 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              Launch Dashboard
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="px-10 py-4 rounded-2xl font-bold text-base text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
