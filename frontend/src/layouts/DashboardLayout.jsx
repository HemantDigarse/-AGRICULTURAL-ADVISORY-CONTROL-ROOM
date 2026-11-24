import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Bot, Workflow, Sprout, FlaskConical, CloudSun,
  Droplets, Bug, TrendingUp, Landmark, ClipboardList, UserCheck, Settings,
  Menu, X, LogOut, ChevronDown, ChevronRight, Leaf, Zap,
} from 'lucide-react';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/advisory/new', label: 'New Advisory', icon: FileText, badge: 'NEW' },
    ],
  },
  {
    label: 'AI Operations',
    items: [
      { to: '/agents', label: 'Agent Control Room', icon: Bot },
      { to: '/agents/workflow', label: 'Agent Workflow', icon: Workflow },
    ],
  },
  {
    label: 'Advisory Modules',
    items: [
      { to: '/crop', label: 'Crop Recommendation', icon: Sprout },
      { to: '/soil', label: 'Soil Health', icon: FlaskConical },
      { to: '/weather', label: 'Weather Intelligence', icon: CloudSun },
      { to: '/irrigation', label: 'Irrigation Advisory', icon: Droplets },
      { to: '/pest', label: 'Pest & Disease', icon: Bug },
      { to: '/market', label: 'Market Intelligence', icon: TrendingUp },
      { to: '/schemes', label: 'Govt Schemes', icon: Landmark },
    ],
  },
  {
    label: 'Reports & Admin',
    items: [
      { to: '/reports', label: 'Reports & History', icon: ClipboardList },
      { to: '/expert', label: 'Expert Review', icon: UserCheck },
      { to: '/settings', label: 'Admin Settings', icon: Settings },
    ],
  },
];

export default function DashboardLayout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const location = useLocation();

  const toggleSection = (label) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const linkClasses = (isActive) =>
    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white/15 text-white shadow-sm backdrop-blur-sm'
        : 'text-green-200/70 hover:bg-white/8 hover:text-white hover:translate-x-1'
    }`;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="relative w-11 h-11 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/40 group">
          <Leaf className="w-5 h-5 text-white" />
          <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-white leading-tight tracking-tight">
            Agri Advisory
          </h1>
          <p className="text-[11px] text-green-300/60 font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" /> Control Room v1.0
          </p>
        </div>
      </div>

      {/* DEMO badge */}
      <div className="mx-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="text-[11px] font-semibold text-amber-300 tracking-wide">DEMO MODE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-5 scrollbar-thin">
        {navSections.map((section, sIdx) => {
          const isCollapsed = collapsed[section.label];
          return (
            <div key={section.label} className="animate-fade-in" style={{ animationDelay: `${sIdx * 0.05}s` }}>
              <button
                onClick={() => toggleSection(section.label)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-green-400/50 hover:text-green-300/80 transition-colors"
              >
                {section.label}
                <span className="transition-transform duration-200" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)' }}>
                  <ChevronDown className="w-3 h-3" />
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isCollapsed ? 0 : `${section.items.length * 48}px`,
                  opacity: isCollapsed ? 0 : 1,
                }}
              >
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item, iIdx) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) => linkClasses(isActive)}
                      onClick={() => setSidebarOpen(false)}
                      style={{ animationDelay: `${iIdx * 0.03}s` }}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-green-400 rounded-r-full" />
                          )}
                          <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-green-500 text-white rounded-md">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-green-900/30">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user?.name || 'User'}</p>
            <p className="truncate text-[11px] text-green-300/50">{user?.email || ''}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            className="rounded-xl p-2 text-green-300/40 transition-all duration-200 hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f8faf9]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] bg-gradient-to-b from-[#0f3d1e] via-[#14532d] to-[#166534] shadow-2xl relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 -left-10 w-40 h-40 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-10 w-32 h-32 bg-emerald-400/5 rounded-full blur-3xl" />
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-[280px] h-full bg-gradient-to-b from-[#0f3d1e] via-[#14532d] to-[#166534] shadow-2xl animate-slide-sidebar">
            <button
              className="absolute top-5 right-4 text-green-300/60 hover:text-white transition-colors p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center h-[60px] px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm relative z-10">
          <button
            className="lg:hidden mr-3 p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 active:scale-95"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-800 tracking-tight truncate">
              Agricultural Advisory Control Room
            </h2>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-600 font-medium">
                {user?.name || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content with page transition */}
        <main key={location.pathname} className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
