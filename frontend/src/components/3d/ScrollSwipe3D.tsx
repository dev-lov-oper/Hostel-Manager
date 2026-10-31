import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Copy, 
  GitCommit, 
  Radio, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Award,
  Sparkles,
  MoveHorizontal
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollSwipe3DProps {
  onNavigate: (view: string, tab?: string) => void;
}

interface ShowcaseCard {
  id: string;
  pattern: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  accent: string;
  tabTarget: string;
  details: { label: string; value: string }[];
  graphicType: 'strategy' | 'chain' | 'prototype' | 'template' | 'observer';
}

const CARDS: ShowcaseCard[] = [
  {
    id: 'strategy',
    pattern: 'Strategy Pattern',
    category: 'Behavioral Architecture',
    title: 'Multi-Algorithm Room Allocation',
    subtitle: 'Dynamic Runtime Strategy Selection',
    description: 'Switch seamlessly between CGPA-based, First-Come-First-Served (FCFS), and Preference-based room allocation algorithms.',
    badge: 'Allocation Engine',
    accent: 'cyan',
    tabTarget: 'room-allocation',
    details: [
      { label: 'CGPA-Based', value: 'Ranked by Academic CGPA (0.0 - 10.0 scale)' },
      { label: 'FCFS', value: 'Deterministic Queue by Timestamp' },
      { label: 'Preference-Based', value: 'Matrix Multi-Criteria Matching' }
    ],
    graphicType: 'strategy'
  },
  {
    id: 'chain',
    pattern: 'Chain of Responsibility',
    category: 'Behavioral Architecture',
    title: 'Hierarchical Complaint Escalation',
    subtitle: 'Warden → Chief Warden → Dean',
    description: 'Complaints pass along a sequential chain of authority. High-severity maintenance and safety hazards automatically escalate to higher administrative tiers.',
    badge: 'Hierarchical Dispatch',
    accent: 'violet',
    tabTarget: 'complaints',
    details: [
      { label: 'Tier 1', value: 'Warden (Low & Medium)' },
      { label: 'Tier 2', value: 'Chief Warden (High Escalation)' },
      { label: 'Tier 3', value: 'Dean (Critical Safety Emergencies)' }
    ],
    graphicType: 'chain'
  },
  {
    id: 'prototype',
    pattern: 'Prototype Pattern',
    category: 'Creational Architecture',
    title: 'Room Blueprint Cloning Lab',
    subtitle: 'Deep Copy Architecture for Rapid Provisioning',
    description: 'Instantiate pre-configured room configurations (Deluxe Studio, En-Suite, Penthouse) through template cloning from the central registry.',
    badge: 'Blueprint Registry',
    accent: 'emerald',
    tabTarget: 'templates',
    details: [
      { label: 'Registry Cache', value: '5 Pre-Validated Architectural Templates' },
      { label: 'Deep Clone', value: 'Independent Amenities & Occupancy' },
      { label: 'Provisioning', value: 'Single-Click New Room Generation' }
    ],
    graphicType: 'prototype'
  },
  {
    id: 'template',
    pattern: 'Template Method',
    category: 'Behavioral Architecture',
    title: 'Standardized Check-In / Out Process',
    subtitle: 'Invariable Skeleton with Extensible Steps',
    description: 'Enforces a strict 5-stage workflow for student check-in and check-out while allowing specialized room condition hooks and automated log persistence.',
    badge: 'Lifecycle Pipeline',
    accent: 'amber',
    tabTarget: 'check-in-out',
    details: [
      { label: 'Step 1', value: 'Verification & Student ID Check' },
      { label: 'Step 2', value: 'Physical Room Condition Inspection' },
      { label: 'Step 3', value: 'Key Handoff & Digital Audit Logging' }
    ],
    graphicType: 'template'
  },
  {
    id: 'observer',
    pattern: 'Observer & Mediator',
    category: 'Behavioral Architecture',
    title: 'Real-Time Telemetry & Coordination',
    subtitle: 'Decoupled Communication & Event Broadcasting',
    description: 'Subscribers receive live push notifications whenever complaint status changes, while central coordinator dispatches student-warden-maintenance tasks.',
    badge: 'Event Telemetry',
    accent: 'rose',
    tabTarget: 'complaints',
    details: [
      { label: 'Live Stream', value: 'Sub-second Reactive Updates' },
      { label: 'Coordinator', value: 'Decoupled Maintenance Dispatching' },
      { label: 'State Sync', value: 'Zero-Polling Student & Staff Dashboard' }
    ],
    graphicType: 'observer'
  }
];

export const ScrollSwipe3D: React.FC<ScrollSwipe3DProps> = ({ onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentDrag = useRef(0);

  const totalCards = CARDS.length;

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  // ScrollTrigger integration: smooth 3D swipe progression as user scrolls
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const index = Math.min(
            Math.floor(self.progress * totalCards),
            totalCards - 1
          );
          setActiveIndex(index);
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [totalCards]);

  // Touch / Mouse drag swipe handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    currentDrag.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    currentDrag.current = clientX - startX.current;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (currentDrag.current < -50) {
      nextCard();
    } else if (currentDrag.current > 50) {
      prevCard();
    }
    currentDrag.current = 0;
  };

  const renderCardGraphic = (type: ShowcaseCard['graphicType']) => {
    switch (type) {
      case 'strategy':
        return (
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-cyan-500/20">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold">ALGORITHM MATRIX</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">ACTIVE: CGPA</span>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-white/5 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white">CGPA Strategy</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">CGPA 9.85 → Room #A-101</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between opacity-70">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-300">FCFSStrategy</span>
                </div>
                <span className="text-xs font-mono text-slate-400">Queue #042</span>
              </div>
            </div>
          </div>
        );
      case 'chain':
        return (
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-violet-500/20">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-violet-400 font-bold">ESCALATION HIERARCHY</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">CRITICAL</span>
            </div>
            <div className="space-y-2 relative">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">1</span>
                <span className="text-xs text-slate-300">WardenHandler (Filtered)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-violet-500/30">
                <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-300 text-xs flex items-center justify-center font-bold">2</span>
                <span className="text-xs text-white font-medium">ChiefWardenHandler (Authorizing)</span>
                <ArrowRight className="w-4 h-4 text-violet-400 ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 text-xs flex items-center justify-center font-bold">3</span>
                <span className="text-xs text-rose-200 font-semibold">DeanHandler (Emergency Override)</span>
                <AlertTriangle className="w-4 h-4 text-rose-400 ml-auto" />
              </div>
            </div>
          </div>
        );
      case 'prototype':
        return (
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">BLUEPRINT CLONING</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">REGISTRY: 5</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-mono text-slate-400">ORIGINAL PROTOTYPE</p>
                <p className="text-xs font-bold text-white mt-1">Deluxe Studio</p>
                <p className="text-[10px] text-slate-400 font-mono mt-2">Base: ₹14,000</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40">
                <p className="text-[10px] font-mono text-emerald-400 font-bold">CLONED INSTANCE</p>
                <p className="text-xs font-bold text-white mt-1">Room #B-302</p>
                <p className="text-[10px] text-emerald-300 font-mono mt-2">Assigned • Fresh</p>
              </div>
            </div>
          </div>
        );
      case 'template':
        return (
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold">WORKFLOW SEQUENCE</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">5 STAGES</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {['Verify', 'Inspect', 'Keys', 'Sign', 'Log'].map((step, idx) => (
                <div key={step} className="p-2 rounded-xl bg-white/5 border border-amber-500/30">
                  <p className="text-[10px] font-mono text-amber-400 font-bold">0{idx + 1}</p>
                  <p className="text-[11px] font-semibold text-white mt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'observer':
        return (
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-rose-500/20">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold">LIVE TELEMETRY STREAM</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SSE ONLINE
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-2 rounded-lg bg-white/5 text-slate-300 truncate">
                📡 [Observer] StudentNotificationObserver: Alert sent to student #STU002
              </div>
              <div className="p-2 rounded-lg bg-white/5 text-slate-300 truncate">
                ⚡ [Mediator] StaffNotificationObserver: Maintenance ticket dispatched
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen py-20 flex flex-col justify-center overflow-hidden bg-gradient-to-b from-transparent via-[#090d16] to-transparent"
    >
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-brand-violet/15 blur-[160px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-14 mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-xs font-mono text-brand-cyan">
          <MoveHorizontal className="w-3.5 h-3.5 animate-pulse" />
          <span>Interactive 3D Swipe & Scroll Showcase</span>
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          Explore The Architecture In 3D Motion
        </h2>
        <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto">
          Swipe horizontally or scroll down to experience each design pattern's real-time functional implementation.
        </p>
      </div>

      {/* 3D SWIPE CAROUSEL STAGE */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-14 h-[560px] sm:h-[620px] flex items-center justify-center perspective-2000 select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {CARDS.map((card, idx) => {
          const offset = idx - activeIndex;
          const isActive = idx === activeIndex;

          // 3D positioning calculation
          let transform = '';
          let opacity = 0;
          let zIndex = 0;
          let pointerEvents: 'auto' | 'none' = 'none';

          if (offset === 0) {
            transform = 'translateX(0%) translateZ(0px) rotateY(0deg) scale(1)';
            opacity = 1;
            zIndex = 30;
            pointerEvents = 'auto';
          } else if (offset === 1 || (idx === 0 && activeIndex === totalCards - 1)) {
            transform = 'translateX(65%) translateZ(-180px) rotateY(-24deg) scale(0.9)';
            opacity = 0.55;
            zIndex = 20;
          } else if (offset === -1 || (idx === totalCards - 1 && activeIndex === 0)) {
            transform = 'translateX(-65%) translateZ(-180px) rotateY(24deg) scale(0.9)';
            opacity = 0.55;
            zIndex = 20;
          } else if (offset > 1) {
            transform = 'translateX(120%) translateZ(-360px) rotateY(-40deg) scale(0.8)';
            opacity = 0.15;
            zIndex = 10;
          } else {
            transform = 'translateX(-120%) translateZ(-360px) rotateY(40deg) scale(0.8)';
            opacity = 0.15;
            zIndex = 10;
          }

          return (
            <div
              key={card.id}
              className="absolute w-full max-w-[560px] sm:max-w-[640px] preserve-3d transition-all duration-500 ease-out"
              style={{
                transform,
                opacity,
                zIndex,
                pointerEvents
              }}
              onClick={() => {
                if (!isActive) setActiveIndex(idx);
              }}
            >
              <div className="glass-panel rounded-3xl p-6 sm:p-9 border border-white/15 shadow-2xl backdrop-blur-2xl bg-slate-900/90 relative overflow-hidden space-y-6">
                
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/15">
                      0{idx + 1} / 0{totalCards}
                    </span>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
                      {card.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                    {card.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <p className="text-xs font-mono text-brand-cyan uppercase tracking-wider font-bold mb-1">
                    {card.pattern}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* 3D Visual Simulation Box */}
                {renderCardGraphic(card.graphicType)}

                {/* Technical Metric Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  {card.details.map((d, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-mono text-slate-400">{d.label}</p>
                      <p className="text-xs font-bold text-slate-200 truncate mt-0.5">{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                <div className="pt-2 flex items-center justify-between border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('dashboard', card.tabTarget);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Launch Live Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('explorer');
                    }}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Architecture Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* SWIPE CONTROLS & INDICATORS */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-14 flex items-center justify-between mt-4">
        {/* Left Arrow Button */}
        <button
          onClick={prevCard}
          className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
          title="Previous 3D Card"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Dots Indicators */}
        <div className="flex items-center gap-2.5">
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                i === activeIndex 
                  ? 'w-10 bg-brand-cyan shadow-glow-cyan' 
                  : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={nextCard}
          className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
          title="Next 3D Card"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
};

