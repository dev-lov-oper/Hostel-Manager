import React, { useState, useEffect } from 'react';
import { PatternMetadata } from '../types';
import { api } from '../services/api';
import { ScrollSwipe3D } from '../components/3d/ScrollSwipe3D';
import {
  Layers,
  Code2,
  GitBranch,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Terminal,
  Activity,
  Workflow,
  Sparkles
} from 'lucide-react';

interface ArchitectureExplorerPageProps {
  onNavigateToFeature?: (view: string, tab?: string) => void;
}

export const ArchitectureExplorerPage: React.FC<ArchitectureExplorerPageProps> = ({
  onNavigateToFeature
}) => {
  const [patterns, setPatterns] = useState<PatternMetadata[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<PatternMetadata | null>(null);

  useEffect(() => {
    api.getPatternsMeta().then((data) => {
      setPatterns(data || []);
      if (data && data.length > 0 && !selectedPattern) {
        setSelectedPattern(data[0]);
      }
    }).catch(console.warn);
  }, []);

  const getPatternFeatureRoute = (id: string) => {
    switch (id) {
      case 'builder': return { view: 'dashboard', tab: 'profile-builder' };
      case 'strategy': return { view: 'dashboard', tab: 'room-allocation' };
      case 'chain': return { view: 'dashboard', tab: 'complaints' };
      case 'observer': return { view: 'dashboard', tab: 'complaints' };
      case 'mediator': return { view: 'dashboard', tab: 'complaints' };
      case 'template': return { view: 'dashboard', tab: 'check-in-out' };
      case 'prototype': return { view: 'dashboard', tab: 'templates' };
      case 'singleton': return { view: 'dashboard', tab: 'system-singleton' };
      default: return { view: 'dashboard', tab: 'overview' };
    }
  };

  return (
    <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Software Architecture & Pattern Explorer
            </h1>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
              8 Verified Enterprise Patterns
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Interactive 3D animated walkthrough, class relationships, and verified runtime execution flows.
          </p>
        </div>
      </div>

      {/* 3D Animated Description of Design Patterns */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-2 sm:p-6 shadow-2xl backdrop-blur-xl">
        <ScrollSwipe3D onNavigate={(view, tab) => onNavigateToFeature?.(view, tab)} />
      </div>

      {/* Grid of 8 Pattern Cards (Top) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {patterns.map((pat) => {
          const isSelected = selectedPattern?.id === pat.id;
          return (
            <button
              key={pat.id}
              onClick={() => setSelectedPattern(pat)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand-violet/25 border-brand-cyan shadow-glow-cyan text-white scale-[1.02]'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-brand-sky mb-2 inline-block">
                  {pat.category}
                </span>
                <h4 className="font-bold text-sm text-slate-100">{pat.name}</h4>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{pat.keyClasses.length} Classes</span>
                {isSelected && <span className="text-brand-cyan font-bold">Selected ›</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Pattern Inspector (Bottom) */}
      {selectedPattern ? (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-8">
          
          {/* Header of Active Pattern */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                  {selectedPattern.category} Pattern
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Pattern ID: {selectedPattern.id}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {selectedPattern.name}
              </h2>
              <p className="text-sm text-brand-sky font-mono mt-1">
                {selectedPattern.intent}
              </p>
            </div>

            {onNavigateToFeature && (
              <button
                onClick={() => {
                  const target = getPatternFeatureRoute(selectedPattern.id);
                  onNavigateToFeature(target.view, target.tab);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center gap-2 self-start cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Live Feature UI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Problem vs Solution Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold block">
                Problem It Solves
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedPattern.problem}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                HostelHub Implementation
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedPattern.solution}
              </p>
            </div>
          </div>

          {/* Involved Java Classes */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-brand-cyan" />
              Actual Java Source Classes in Repository
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {selectedPattern.keyClasses.map((cls, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-2"
                >
                  <span className="text-brand-purple">›</span>
                  <span className="truncate">{cls}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Flow Diagram */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Workflow className="w-4 h-4 text-brand-purple" />
              Runtime Execution Flow Sequence
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedPattern.flow.map((flowStep, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-2"
                >
                  <span className="w-6 h-6 rounded-lg bg-white/10 text-brand-cyan font-mono font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                    {flowStep}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Java Source Code Snippet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-brand-cyan" />
                Java Code Implementation
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Java 17/25 Source</span>
            </div>

            <div className="bg-[#070a10] rounded-xl p-5 border border-white/10 overflow-x-auto">
              <pre className="font-mono text-xs text-brand-sky leading-relaxed">
                <code>{selectedPattern.sampleCode}</code>
              </pre>
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center text-sm text-slate-400 border border-white/10">
          Select a pattern above to inspect its architecture.
        </div>
      )}
    </div>
  );
};

