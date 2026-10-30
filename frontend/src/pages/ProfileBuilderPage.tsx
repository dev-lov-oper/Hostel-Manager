import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatternPill } from '../components/common/PatternPill';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  Award,
  Phone,
  ShieldAlert,
  Save,
  Layers
} from 'lucide-react';

interface ProfileBuilderPageProps {
  onSuccess?: () => void;
}

export const ProfileBuilderPage: React.FC<ProfileBuilderPageProps> = ({ onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Alice Smith',
    studentCode: user?.student?.studentCode || 'STU-2026-09',
    department: 'Computer Science & Engineering',
    academicYear: user?.student?.academicYear || 2,
    meritScore: user?.student?.meritScore || 92.5,
    gender: user?.student?.gender || 'FEMALE',
    contactNumber: user?.student?.contactNumber || '9876543210',
    emergencyContact: user?.student?.emergencyContact || '9876543211',
    preferredHostelIds: [1, 2],
    roomTypePreference: 'SINGLE',
    specialRequirements: 'Quiet floor preference, near study hall',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleHostelPrefToggle = (hostelId: number) => {
    setFormData((prev) => {
      const exists = prev.preferredHostelIds.includes(hostelId);
      const updated = exists
        ? prev.preferredHostelIds.filter((id) => id !== hostelId)
        : [...prev.preferredHostelIds, hostelId];
      return { ...prev, preferredHostelIds: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        userId: user?.userId || 3,
        studentCode: formData.studentCode,
        fullName: formData.fullName,
        academicYear: Number(formData.academicYear),
        gender: formData.gender,
        meritScore: Number(formData.meritScore),
        contactNumber: formData.contactNumber,
        emergencyContact: formData.emergencyContact,
        preferredHostelIds: formData.preferredHostelIds,
      };

      // Dispatches directly to StudentBuilder backend logic
      await api.createStudentProfile(payload);
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSuccessMessage('Student Profile built and validated successfully via StudentBuilder pattern!');
      await refreshUser();
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Validation failed. Check Builder pattern constraints.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Student Profile Builder
            </h1>
            <PatternPill name="Builder Pattern" category="Creational" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Constructing complex domain model profiles step-by-step with guaranteed validation.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`w-9 h-9 rounded-xl text-xs font-mono font-bold transition-all ${
                step === s
                  ? 'bg-brand-cyan text-slate-900 shadow-glow-cyan'
                  : step > s
                  ? 'bg-brand-violet/30 text-white border border-brand-violet/40'
                  : 'bg-white/[0.05] text-slate-400 border border-white/10'
              }`}
            >
              0{s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Multi-Step Form on Left, Live Profile Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold">Builder Validation Rejection</p>
                <p className="text-[11px] mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Personal & Academic */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-white/[0.06] pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-brand-cyan" />
                    Step 1: Personal & Academic Credentials
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enforces academic year bounds and merit scoring rules
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan transition-colors"
                      placeholder="e.g. Alice Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Student ID / Roll No
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.studentCode}
                      onChange={(e) => handleChange('studentCode', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-brand-cyan transition-colors"
                      placeholder="e.g. STU-2026-09"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Department / Major
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Academic Year (1 - 5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      required
                      value={formData.academicYear}
                      onChange={(e) => handleChange('academicYear', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-brand-cyan transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1320] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan transition-colors"
                    >
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      CGPA / Merit Score (0.0 - 100.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={formData.meritScore}
                      onChange={(e) => handleChange('meritScore', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-brand-cyan transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: Contact Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Emergency */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-white/[0.06] pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-purple" />
                    Step 2: Contact Verification
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Validated against standard 10-15 digit phone regex
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Student Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contactNumber}
                      onChange={(e) => handleChange('contactNumber', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-brand-cyan transition-colors"
                      placeholder="e.g. 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Emergency Guardian Contact
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.emergencyContact}
                      onChange={(e) => handleChange('emergencyContact', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-brand-cyan transition-colors"
                      placeholder="e.g. 9876543211"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: Hostel Preferences</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Hostel Preferences & Special Requirements */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-white/[0.06] pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-sky" />
                    Step 3: Space & Hostel Preferences
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supplies preferred hostel IDs to Strategy Pattern allocation algorithm
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-mono text-slate-300">
                    Select Preferred Hostel Blocks:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 1, name: 'Aryabhata Hall', type: 'Male Block' },
                      { id: 2, name: 'Sarojini Bhawan', type: 'Female Block' },
                      { id: 3, name: 'Homi Bhabha Tower', type: 'Coed International' }
                    ].map((h) => {
                      const isSelected = formData.preferredHostelIds.includes(h.id);
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => handleHostelPrefToggle(h.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-violet/20 border-brand-violet/50 text-white'
                              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs">{h.name}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" />}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{h.type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Room Type Preference
                  </label>
                  <select
                    value={formData.roomTypePreference}
                    onChange={(e) => handleChange('roomTypePreference', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1320] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan transition-colors"
                  >
                    <option value="SINGLE">Single Deluxe Studio</option>
                    <option value="DOUBLE">Double Classic En-Suite</option>
                    <option value="DORMITORY">Quad Community Dormitory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Special Requirements & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.specialRequirements}
                    onChange={(e) => handleChange('specialRequirements', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan transition-colors"
                    placeholder="e.g. Ground floor request, quiet study corner"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-brand-cyan hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Building Profile...' : 'Build & Validate Profile'}</span>
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Right Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Live Profile Preview
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
              StudentBuilder.build()
            </span>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6 relative overflow-hidden">
            {/* Top Badge */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan p-0.5 shadow-glow-cyan">
                <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center font-bold text-lg text-white">
                  {formData.fullName.charAt(0) || 'S'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready to Build
                </span>
              </div>
            </div>

            {/* Profile Core Data */}
            <div className="space-y-3">
              <div>
                <h4 className="text-lg font-bold text-white truncate">
                  {formData.fullName || 'Student Name'}
                </h4>
                <p className="text-xs font-mono text-brand-cyan">
                  {formData.studentCode || 'STU-000'} • Year {formData.academicYear}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {formData.department}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 block font-mono">Merit Score</span>
                  <span className="text-lg font-bold font-mono text-brand-sky">
                    {formData.meritScore}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 block font-mono">Gender</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {formData.gender}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Contact:</span>
                  <span>{formData.contactNumber}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Emergency:</span>
                  <span>{formData.emergencyContact}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Pref Hostels:</span>
                  <span className="text-brand-sky">
                    [{formData.preferredHostelIds.join(', ')}]
                  </span>
                </div>
              </div>
            </div>

            {/* Builder Pattern Verification Banner */}
            <div className="p-3.5 rounded-xl bg-brand-violet/15 border border-brand-violet/30 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-brand-sky">
                <Layers className="w-3.5 h-3.5" />
                <span>Pattern Guarantees:</span>
              </div>
              <ul className="text-[10px] text-slate-300 space-y-0.5 list-disc list-inside">
                <li>No null fields permitted in construction</li>
                <li>Phone regex strictly validated (10-15 digits)</li>
                <li>Academic year bounded between 1 and 5</li>
                <li>Merit score bounded between 0.0 and 100.0</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

