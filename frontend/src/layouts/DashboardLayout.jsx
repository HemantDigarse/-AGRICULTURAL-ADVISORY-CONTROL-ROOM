import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Bot, Workflow, Sprout, FlaskConical, CloudSun,
  Droplets, Bug, TrendingUp, Landmark, ClipboardList, UserCheck, Settings,
  Menu, X, LogOut, ChevronDown, ChevronRight,
} from 'lucide-react';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/advisory/new', label: 'New Advisory', icon: FileText },
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

  const toggleSection = (label) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const linkClasses = (isActive) =>
    `group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white/15 text-white shadow-sm backdrop-blur-sm'
        : 'text-green-200/80 hover:bg-white/8 hover:text-white'
    }`;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/30">
          <Sprout className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-white leading-tight tracking-tight">Agri Advisory</h1>
          <p className="text-[11px] text-green-300/70 font-medium">Control Room v1.0</p>
        </div>
      </div>

      {/* DEMO badge */}
      <div className="mx-4 mb-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/15 border border-amber-500/20 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-amber-300 tracking-wide">DEMO MODE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-4 scrollbar-thin">
        {navSections.map((section) => {
          const isCollapsed = collapsed[section.label];
          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-green-400/60 hover:text-green-300/80 transition-colors"
              >
                {section.label}
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) => linkClasses(isActive)}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0 opacity-80 group-hover:opacity-100" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user?.name || 'User'}</p>
            <p className="truncate text-[11px] text-green-300/60">{user?.email || ''}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            className="rounded-lg p-1.5 text-green-300/50 transition-colors hover:bg-white/10 hover:text-white"
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
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] bg-gradient-to-b from-[#14532d] via-[#166534] to-[#15803d] shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-[260px] h-full bg-gradient-to-b from-[#14532d] via-[#166534] to-[#15803d] shadow-2xl">
            <button
              className="absolute top-5 right-4 text-green-300 hover:text-white transition-colors"
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
        <header className="flex items-center h-[56px] px-4 md:px-6 bg-white border-b border-gray-200/80 shadow-sm">
          <button
            className="lg:hidden mr-3 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-gray-800 tracking-tight truncate">
            Agricultural Advisory Control Room
          </h2>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
              {user?.name || 'User'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
