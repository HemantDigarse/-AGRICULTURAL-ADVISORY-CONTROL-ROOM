import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Bot,
  CloudSun,
  TrendingUp,
  Landmark,
  ShieldAlert,
  ClipboardList,
  Menu,
  X,
  Sprout,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/generate', label: 'Generate Advisory', icon: FileText },
  { to: '/agents', label: 'Agent Control Room', icon: Bot },
  { to: '/weather', label: 'Weather', icon: CloudSun },
  { to: '/market', label: 'Market', icon: TrendingUp },
  { to: '/schemes', label: 'Schemes', icon: Landmark },
  { to: '/alerts', label: 'Risk Alerts', icon: ShieldAlert },
  { to: '/report', label: 'Advisory Report', icon: ClipboardList },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const linkClasses = (isActive) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-green-600 text-white shadow-md'
        : 'text-green-100 hover:bg-green-700/60 hover:text-white'
    }`;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-green-700/50">
        <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center shadow">
          <Sprout className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">Agri Advisory</h1>
          <p className="text-xs text-green-300">Control Room</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => linkClasses(isActive)}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Demo badge */}
      <div className="px-4 py-3 border-t border-green-700/50">
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 rounded-lg">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-yellow-200">DEMO MODE</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-green-800 text-white">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 h-full bg-green-800 text-white shadow-xl">
            <button
              className="absolute top-4 right-4 text-green-300 hover:text-white"
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
        <header className="flex items-center h-14 px-4 bg-white border-b border-gray-200 shadow-sm">
          <button
            className="lg:hidden mr-3 text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            Agricultural Advisory Control Room
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
              Demo
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
