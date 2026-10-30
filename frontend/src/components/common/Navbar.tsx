import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import {
  Building2,
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Radio,
  Sparkles,
  User as UserIcon,
  Shield,
  Layers
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout, switchDemoRole, notifications, unreadCount, markNotificationAsRead, sseConnected } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'WARDEN': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CHIEF_WARDEN': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'DEAN': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'MAINTENANCE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/[0.08] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-violet via-brand-purple to-brand-cyan p-0.5 shadow-glow-cyan transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-brand-cyan" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  HOSTEL<span className="text-brand-cyan">HUB</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
                  DP LAB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono">
                Smart Space Allocation
              </p>
            </div>
          </button>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm text-slate-300">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'landing' ? 'text-white bg-white/[0.08]' : 'hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                currentView === 'explorer' ? 'text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Layers className="w-4 h-4 text-brand-cyan" />
              <span>Design Patterns</span>
            </button>
            {user && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentView === 'dashboard' ? 'text-white bg-white/[0.08]' : 'hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>
        </div>

        {/* Right Section: Real-time status, Demo Switcher, Notifications, User profile */}
        <div className="flex items-center gap-3">
          
          {/* Live SSE Status Pill */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-white/[0.03] border border-white/[0.08]"
            title={sseConnected ? 'Connected to live EventSource SSE stream' : 'Polling & SSE stream standby'}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sseConnected ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${sseConnected ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
            </span>
            <span className="text-[11px] text-slate-400">
              {sseConnected ? 'Live SSE' : 'Real-time'}
            </span>
          </div>

          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDemoMenu(!showDemoMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-brand-violet/20 to-brand-cyan/20 border border-white/10 hover:border-brand-violet/40 text-slate-200 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="hidden sm:inline">Role Switcher</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-72 glass-panel rounded-xl shadow-glass border border-white/10 p-2 py-2.5 z-50">
                <div className="px-3 py-1.5 mb-1.5 border-b border-white/[0.06]">
                  <p className="text-xs font-semibold text-slate-200">Switch Demo Persona</p>
                  <p className="text-[11px] text-slate-400">Explore different dashboards & authorization levels</p>
                </div>
                <div className="space-y-1">
                  {DEMO_ACCOUNTS.map((demo) => {
                    const isCurrent = user?.username === demo.username;
                    return (
                      <button
                        key={demo.key}
                        onClick={async () => {
                          await switchDemoRole(demo.key);
                          setShowDemoMenu(false);
                          onNavigate('dashboard');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-start justify-between text-xs transition-colors ${
                          isCurrent
                            ? 'bg-brand-violet/20 border border-brand-violet/40 text-white'
                            : 'hover:bg-white/[0.05] text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-200 flex items-center gap-1.5">
                            {demo.label}
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-mono ${getRoleColor(demo.role)}`}>
                              {demo.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{demo.desc}</p>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-brand-cyan mt-1 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Popover (Observer Pattern trigger) */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowDemoMenu(false);
                }}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Notifications (Observer Pattern)"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-glass border border-white/10 p-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Real-Time Notifications</p>
                      <p className="text-[10px] text-slate-400 font-mono">Dispatched by Observer Pattern</p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-violet/20 text-brand-sky border border-brand-violet/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-white/[0.04]">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.notificationId}
                          onClick={() => markNotificationAsRead(n.notificationId)}
                          className={`p-3 text-xs transition-colors cursor-pointer rounded-lg ${
                            !n.isRead ? 'bg-brand-violet/10 hover:bg-brand-violet/15' : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="flex items-center justify-between font-medium text-slate-200">
                            <span className="truncate pr-2">{n.title}</span>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-cyan flex-shrink-0" />}
                          </div>
                          <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                          <span className="text-[9px] font-mono text-slate-500 mt-1.5 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth Action */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium text-slate-200 leading-tight">{user.fullName}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('auth')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('auth')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-90 shadow-glow-cyan transition-all"
              >
                Get Started
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

