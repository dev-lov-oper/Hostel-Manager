import React, { useState, useEffect } from 'react';
import { PatternPill } from '../components/common/PatternPill';
import { RoomTemplate } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Copy,
  Plus,
  CheckCircle2,
  Sparkles,
  Users,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const RoomTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<RoomTemplate | null>(null);

  // Clone Form State
  const [newTemplateName, setNewTemplateName] = useState('');
  const [capacity, setCapacity] = useState<number>(1);
  const [baseFee, setBaseFee] = useState<number>(12000);
  const [roomType, setRoomType] = useState('SINGLE');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenityInput, setNewAmenityInput] = useState('');

  const [cloning, setCloning] = useState(false);
  const [lastClonedComparison, setLastClonedComparison] = useState<{
    original: string;
    cloned: RoomTemplate;
  } | null>(null);

  const loadTemplates = async () => {
    try {
      const data = await api.getTemplates();
      setTemplates(data || []);
      if (data && data.length > 0 && !selectedTemplate) {
        selectForCloning(data[0]);
      }
    } catch (e) {
      console.warn('Failed to load room templates:', e);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const selectForCloning = (t: RoomTemplate) => {
    setSelectedTemplate(t);
    setNewTemplateName(`${t.templateName} (Cloned Variant)`);
    setCapacity(t.capacity);
    setBaseFee(t.baseFee + 1500);
    setRoomType(t.roomType);
    setAmenities([...t.amenities]);
  };

  const handleAddAmenity = () => {
    if (!newAmenityInput.trim()) return;
    setAmenities((prev) => [...prev, newAmenityInput.trim()]);
    setNewAmenityInput('');
  };

  const handleRemoveAmenity = (idx: number) => {
    setAmenities((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleExecuteClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setCloning(true);

    try {
      // Calls Java Prototype Pattern clonePrototype()
      const res = await api.cloneTemplate({
        sourceTemplateName: selectedTemplate.templateName,
        newTemplateName,
        roomType,
        capacity: Number(capacity),
        baseFee: Number(baseFee),
        amenities
      });

      setLastClonedComparison(res);
      confetti({ particleCount: 70, spread: 55 });
      await loadTemplates();
    } catch (err: any) {
      alert('Cloning failed: ' + (err.message || 'Error'));
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Room Template Management
            </h1>
            <PatternPill name="Prototype Pattern" category="Creational" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Duplicate specifications, room layouts, and amenity bundles to provision new accommodation types.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison if clone was executed */}
      {lastClonedComparison && (
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-emerald-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Blueprint Duplicated Successfully: Side-by-Side Comparison</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Template Registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Original Prototype */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Source Blueprint
              </span>
              <h4 className="font-bold text-white text-base">
                {lastClonedComparison.original}
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Standard baseline specification stored in registry.
              </p>
            </div>

            {/* Cloned Customized Instance */}
            <div className="p-4 rounded-xl bg-brand-violet/20 border border-brand-violet/40 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-sky block">
                Cloned & Customized Variant
              </span>
              <h4 className="font-bold text-white text-base">
                {lastClonedComparison.cloned.templateName}
              </h4>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                <span>Capacity: {lastClonedComparison.cloned.capacity} Beds</span>
                <span>Base Fee: ₹{lastClonedComparison.cloned.baseFee}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {lastClonedComparison.cloned.amenities.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px]">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Available Prototypes List (Left) & Clone Customizer Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Registered Prototypes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Copy className="w-4 h-4 text-brand-cyan" />
              Available Blueprints ({templates.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Click to Select</span>
          </div>

          <div className="space-y-3">
            {templates.map((tmpl) => {
              const isSelected = selectedTemplate?.templateId === tmpl.templateId;
              return (
                <div
                  key={tmpl.templateId}
                  onClick={() => selectForCloning(tmpl)}
                  className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-cyan bg-brand-violet/15 shadow-glow-cyan'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{tmpl.templateName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      {tmpl.roomType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-brand-cyan" /> {tmpl.capacity} Bed(s)
                    </span>
                    <span className="text-brand-sky font-semibold">
                      ₹{tmpl.baseFee} / semester
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-white/[0.06]">
                    {tmpl.amenities.map((am, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-400">
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Clone & Customization Panel (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-purple" />
                Duplicate &amp; Specialize Room Type
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
                Blueprint Builder
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Source: <strong className="text-brand-cyan">{selectedTemplate?.templateName || 'None'}</strong>
            </p>
          </div>

          <form onSubmit={handleExecuteClone} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                New Cloned Template Name
              </label>
              <input
                type="text"
                required
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1320] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                >
                  <option value="SINGLE">SINGLE</option>
                  <option value="DOUBLE">DOUBLE</option>
                  <option value="TRIPLE">TRIPLE</option>
                  <option value="DORMITORY">DORMITORY</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Capacity (Beds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Base Fee (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  value={baseFee}
                  onChange={(e) => setBaseFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            {/* Cloned Amenities Customizer */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-mono text-slate-300">
                Cloned Amenities (Add or customize specifications):
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Ergonomic Standing Desk, Balcony Garden"
                  value={newAmenityInput}
                  onChange={(e) => setNewAmenityInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {amenities.map((am, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-brand-violet/20 border border-brand-violet/40 text-xs text-white flex items-center gap-1.5"
                  >
                    <span>{am}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(idx)}
                      className="text-slate-400 hover:text-rose-400 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={cloning}
              className="w-full mt-4 py-3 rounded-xl text-xs font-bold text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              <span>{cloning ? 'Saving Room Type...' : 'Save As New Room Type'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

