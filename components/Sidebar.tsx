import React from 'react';
import { LayoutDashboard, TrendingUp, Newspaper, User, Settings, PieChart, Hexagon, GraduationCap, Zap } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobileOpen, setIsMobileOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'market', label: 'Market Intel', icon: PieChart },
    { id: 'signals', label: 'AI Signals', icon: Zap },
    { id: 'academy', label: 'Academy', icon: GraduationCap },
    { id: 'news', label: 'Global Feed', icon: Newspaper },
    { id: 'profile', label: 'Portfolio', icon: User },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-[#05060A]/90 backdrop-blur-xl border-r border-white/5 z-30 transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col
      `}>
        <div className="p-8 flex items-center gap-4 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-crypto-accent/20 to-transparent"></div>
          <div className="w-10 h-10 relative flex items-center justify-center">
             <div className="absolute inset-0 bg-crypto-accent/20 blur-md rounded-full"></div>
             <Hexagon className="text-crypto-accent relative z-10" strokeWidth={2.5} size={32} />
          </div>
          <div>
             <h1 className="text-xl font-bold tracking-wider text-white">NEXUS<span className="text-crypto-accent">.AI</span></h1>
             <p className="text-[10px] text-crypto-accent tracking-[0.2em] uppercase opacity-70">Protocol v2.0</p>
          </div>
        </div>

        <nav className="mt-8 px-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-200'
                  }
                `}
              >
                {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-crypto-accent/10 to-transparent border-l-2 border-crypto-accent"></div>
                )}
                <Icon size={20} className={`relative z-10 transition-colors ${isActive ? 'text-crypto-accent drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]' : 'group-hover:text-white'}`} />
                <span className={`font-medium tracking-wide relative z-10 ${isActive ? 'text-glow' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6">
            <div className="glass-panel p-4 rounded-2xl mb-4 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-crypto-secondary/20 rounded-full blur-xl group-hover:bg-crypto-secondary/30 transition-all"></div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">System Status</h4>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-crypto-success animate-pulse"></span>
                    <span className="text-sm text-crypto-success font-mono">OPERATIONAL</span>
                </div>
            </div>

            <button 
                onClick={() => {
                    setCurrentView('settings');
                    setIsMobileOpen(false);
                }}
                className={`flex items-center gap-3 px-5 py-3 w-full rounded-xl transition-all border border-transparent hover:border-white/10 hover:bg-white/5 ${currentView === 'settings' ? 'text-crypto-accent bg-white/5' : 'text-gray-500'}`}
            >
                <Settings size={20} />
                <span className="font-medium">System Settings</span>
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
