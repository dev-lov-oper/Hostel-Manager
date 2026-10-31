import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Building,
  AlertCircle,
  ClipboardList,
  Copy,
  Layers,
  Database,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      roles: ['STUDENT', 'WARDEN', 'CHIEF_WARDEN', 'DEAN', 'MAINTENANCE', 'ADMIN']
    },
    {
      id: 'profile-builder',
      label: 'Profile Setup',
      icon: UserCheck,
      roles: ['STUDENT', 'ADMIN']
    },
    {
      id: 'room-allocation',
      label: 'Room Allocation',
      icon: Building,
      roles: ['STUDENT', 'WARDEN', 'CHIEF_WARDEN', 'DEAN', 'ADMIN']
    },
    {
      id: 'complaints',
      label: 'Complaints & Requests',
      icon: AlertCircle,
      roles: ['STUDENT', 'WARDEN', 'CHIEF_WARDEN', 'DEAN', 'MAINTENANCE', 'ADMIN']
    },
    {
      id: 'check-in-out',
      label: 'Check-In / Out',
      icon: ClipboardList,
      roles: ['STUDENT', 'WARDEN', 'ADMIN']
    },
    {
      id: 'templates',
      label: 'Room Blueprints',
      icon: Copy,
      roles: ['ADMIN', 'WARDEN']
    },
    {
      id: 'patterns-explorer',
      label: 'System Architecture (3D)',
      icon: Layers,
      highlight: true,
      roles: ['STUDENT', 'WARDEN', 'CHIEF_WARDEN', 'DEAN', 'MAINTENANCE', 'ADMIN']
    },
    {
      id: 'system-singleton',
      label: 'System Health',
      icon: Database,
      roles: ['ADMIN', 'WARDEN', 'CHIEF_WARDEN', 'DEAN']
    }
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-72 glass-panel border-r border-white/[0.08] flex flex-col justify-between p-5 min-h-[calc(100vh-5rem)]">
      <div className="space-y-6">
        {/* User Mini Profile */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Active Workspace
          </p>
          <p className="font-semibold text-sm text-slate-100 truncate mt-0.5">
            {user?.fullName || 'Guest User'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-violet/20 text-brand-sky border border-brand-violet/30 uppercase">
              {role}
            </span>
            {user?.student?.studentCode && (
              <span className="text-[10px] font-mono text-slate-400">
                {user.student.studentCode}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            Menu Navigation
          </p>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-violet/20 border border-brand-violet/40 text-white shadow-sm'
                    : item.highlight
                    ? 'text-brand-cyan hover:bg-brand-cyan/10 border border-brand-cyan/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive
                        ? 'text-brand-cyan'
                        : item.highlight
                        ? 'text-brand-cyan'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer System Architecture Badge */}
      <div className="pt-4 border-t border-white/[0.06] space-y-2">
        <div className="p-3 rounded-xl bg-gradient-to-br from-brand-violet/10 to-brand-cyan/10 border border-white/10 text-xs">
          <div className="flex items-center gap-1.5 text-brand-cyan font-semibold text-[11px]">
            <Sliders className="w-3.5 h-3.5" />
            <span>System Architecture</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Interactive 3D structural model &amp; design specifications.
          </p>
          <button
            onClick={() => onTabChange('patterns-explorer')}
            className="mt-2 text-[10px] text-brand-sky hover:underline flex items-center gap-1 font-mono"
          >
            View Architecture (3D) <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};

