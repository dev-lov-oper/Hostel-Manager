import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { PatternPill } from '../components/common/PatternPill';
import confetti from 'canvas-confetti';
import {
  Building2,
  Lock,
  User,
  Mail,
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [username, setUsername] = useState('student1');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');

  // Student specific registration fields
  const [studentCode, setStudentCode] = useState('STU-2026-99');
  const [academicYear, setAcademicYear] = useState(1);
  const [cgpa, setCgpa] = useState(8.85);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isRegister) {
        await register({
          username,
          password,
          fullName,
          email,
          role,
          studentCode,
          academicYear: Number(academicYear),
          cgpa: Number(cgpa),
          meritScore: Number(cgpa),
          contactNumber: '9876543210',
          emergencyContact: '9876543211',
          preferredHostelIds: [1, 2]
        });
      } else {
        await login(username, password);
      }
      confetti({ particleCount: 70, spread: 60 });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleSelectDemo = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setIsRegister(false);
    setUsername(demo.username);
    setPassword(demo.pass);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Side: Brand & Quick Demo Logins (5 cols) */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-xs font-mono text-brand-cyan">
            <Shield className="w-3.5 h-3.5" />
            <span>Role-Based Authentication Engine</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white">
            Access Your Hostel Space
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Select a verified demo account below or register a brand-new student account.
          </p>

          {/* Quick Demo Fill Buttons */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
              1-Click Instant Demo Credentials:
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              {DEMO_ACCOUNTS.slice(0, 6).map((demo) => (
                <button
                  key={demo.key}
                  type="button"
                  onClick={() => handleSelectDemo(demo)}
                  className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    username === demo.username
                      ? 'bg-brand-violet/25 border-brand-cyan text-white shadow-glow-cyan'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <p className="font-bold truncate text-[11px]">{demo.label}</p>
                  <p className="text-[10px] font-mono text-slate-500">{demo.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-glass space-y-6">
          
          {/* Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-brand-cyan text-slate-900 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isRegister
                  ? 'bg-brand-violet text-white shadow-glow-violet'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-violet"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. jdoe@campus.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-violet"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Select Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1320] border border-white/10 text-white text-xs font-mono"
                  >
                    <option value="STUDENT">STUDENT (Access room allocation & complaints)</option>
                    <option value="WARDEN">WARDEN (Hostel block administrator)</option>
                    <option value="ADMIN">ADMIN (Full campus management)</option>
                  </select>
                </div>

                {role === 'STUDENT' && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Student Roll ID</label>
                      <input
                        type="text"
                        value={studentCode}
                        onChange={(e) => setStudentCode(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">CGPA (0.0 - 10.0)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        value={cgpa}
                        onChange={(e) => setCgpa(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isRegister
                  ? 'bg-brand-violet text-white hover:bg-violet-600 shadow-glow-violet'
                  : 'bg-brand-cyan text-slate-900 hover:bg-cyan-300 shadow-glow-cyan'
              }`}
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Student Account' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

