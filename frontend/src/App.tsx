import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { WardenDashboard } from './pages/WardenDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfileBuilderPage } from './pages/ProfileBuilderPage';
import { RoomAllocationPage } from './pages/RoomAllocationPage';
import { ComplaintManagementPage } from './pages/ComplaintManagementPage';
import { CheckInOutPage } from './pages/CheckInOutPage';
import { RoomTemplatesPage } from './pages/RoomTemplatesPage';
import { ArchitectureExplorerPage } from './pages/ArchitectureExplorerPage';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'dashboard' | 'explorer'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('overview');

  const handleNavigate = (view: string, tab?: string) => {
    if (view === 'landing' || view === 'auth' || view === 'dashboard' || view === 'explorer') {
      setCurrentView(view);
      if (tab) {
        setCurrentTab(tab);
      } else {
        setCurrentTab('overview');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDashboardContent = () => {
    switch (currentTab) {
      case 'profile-builder':
        return <ProfileBuilderPage onSuccess={() => setCurrentTab('overview')} />;
      case 'room-allocation':
        return <RoomAllocationPage />;
      case 'complaints':
        return <ComplaintManagementPage />;
      case 'check-in-out':
        return <CheckInOutPage />;
      case 'templates':
        return <RoomTemplatesPage />;
      case 'patterns-explorer':
        return <ArchitectureExplorerPage onNavigateToFeature={(v, t) => handleNavigate(v, t)} />;
      case 'system-singleton':
        return <AdminDashboard onNavigateTab={setCurrentTab} />;
      case 'overview':
      default:
        if (user?.role === 'ADMIN') {
          return <AdminDashboard onNavigateTab={setCurrentTab} />;
        } else if (user?.role === 'STUDENT') {
          return <StudentDashboard onNavigateTab={setCurrentTab} />;
        } else {
          return <WardenDashboard onNavigateTab={setCurrentTab} />;
        }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] text-slate-100">
      {/* Top Navbar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {currentView === 'auth' && (
          <AuthPage
            onSuccess={() => {
              setCurrentView('dashboard');
              setCurrentTab('overview');
            }}
          />
        )}

        {currentView === 'explorer' && (
          <ArchitectureExplorerPage onNavigateToFeature={(v, t) => handleNavigate(v, t)} />
        )}

        {currentView === 'dashboard' && (
          <div className="flex">
            {/* Sidebar Navigation */}
            <div className="hidden md:block">
              <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
            </div>

            {/* Dashboard Workspace */}
            <div className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">
              {renderDashboardContent()}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-black/40 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">HOSTELHUB</span>
            <span>• Design Patterns Mini-Project</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigate('explorer')}
              className="hover:text-brand-cyan transition-colors"
            >
              8 Design Patterns
            </button>
            <a
              href="https://github.com/dev-lov-oper/Hostel-Manager"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-purple transition-colors"
            >
              GitHub Repository
            </a>
            <span>Java 17/25 • React • Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
