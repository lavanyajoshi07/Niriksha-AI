'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ClipboardList, Map, ShieldCheck, 
  RotateCcw, Cpu, FileText, Settings, User, LogOut, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  userRole?: string;
}

export default function DashboardSidebar({ userRole = 'department_officer' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['citizen', 'field_inspector', 'department_officer', 'administrator'],
    },
    {
      label: 'Complaint Queue',
      href: '/dashboard/complaints',
      icon: ClipboardList,
      roles: ['citizen', 'field_inspector', 'department_officer', 'administrator'],
    },
    {
      label: 'GIS Issue Map',
      href: '/dashboard/map',
      icon: Map,
      roles: ['citizen', 'field_inspector', 'department_officer', 'administrator'],
    },
    {
      label: 'Verification Center',
      href: '/dashboard/verification',
      icon: ShieldCheck,
      badge: 'Needs Review',
      roles: ['field_inspector', 'department_officer', 'administrator'],
    },
    {
      label: 'Recurrence Intelligence',
      href: '/dashboard/recurrence',
      icon: RotateCcw,
      roles: ['field_inspector', 'department_officer', 'administrator'],
    },
    {
      label: 'Maintenance Planner',
      href: '/dashboard/intelligence',
      icon: Cpu,
      roles: ['department_officer', 'administrator'],
    },
    {
      label: 'Security Audit Log',
      href: '/dashboard/audit',
      icon: FileText,
      roles: ['administrator'],
    },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={`relative flex flex-col bg-slate-950 border-r border-slate-800/80 transition-all duration-300 min-h-screen ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80 h-16">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-extrabold text-sm tracking-tight text-white block truncate">
                NIRIKSHA AI
              </span>
              <span className="text-[10px] text-sky-400 font-medium">Infrastructure Intelligence</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Badge Banner */}
      {!collapsed && (
        <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Role</div>
          <div className="font-semibold text-sky-400 capitalize mt-0.5 flex items-center justify-between">
            <span>{userRole.replace('_', ' ')}</span>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          </div>
        </div>
      )}

      {/* Menu Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-sky-600/15 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Exit */}
      <div className="p-3 border-t border-slate-800/80">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Switch / Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
