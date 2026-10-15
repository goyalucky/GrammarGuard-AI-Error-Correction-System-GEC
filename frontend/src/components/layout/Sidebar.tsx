import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  SpellCheck2,
  FileText,
  BarChart3,
  GraduationCap,
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeft,
  PenLine,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/correction', label: 'Grammar Correction', icon: SpellCheck2 },
  { to: '/documents', label: 'Document Review', icon: FileText },
  { to: '/analytics', label: 'My Writing Analytics', icon: BarChart3 },
  { to: '/learning', label: 'Grammar Learning', icon: GraduationCap },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-60'
      } flex h-screen flex-col border-r border-gray-200 bg-white transition-[width] duration-200 ease-in-out`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <PenLine className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="truncate text-sm font-bold text-gray-900">GrammarGuard AI</p>
            <p className="truncate text-[10px] text-gray-400">Grammar Intelligence</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 px-2 py-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
        {!collapsed && (
          <p className="mt-2 px-3 text-[10px] leading-tight text-gray-400">
            Agentic AI • Grammar Intelligence
          </p>
        )}
      </div>
    </aside>
  );
}
