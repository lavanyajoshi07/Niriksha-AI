'use client';

import { useState, useEffect } from 'react';
import { Bell, RefreshCw, UserCheck, ShieldAlert, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { NotificationItem, UserRole } from '@/types';

interface DashboardHeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  title?: string;
}

export default function DashboardHeader({
  currentRole,
  onRoleChange,
  title = 'Government Operations Center',
}: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then(() => {
        return fetch('/api/seed');
      })
      .catch(() => {});

    // Load initial notifications
    setNotifications([
      {
        id: 'n1',
        title: 'Completion Claim Submitted',
        message: 'Contractor uploaded repair photos for Indiranagar 100ft road drain.',
        timestamp: '10 mins ago',
        read: false,
        link: '/dashboard/verification',
        type: 'warning',
      },
      {
        id: 'n2',
        title: 'Recurrence Threshold Triggered',
        message: 'Outer Ring Road asset reached 4th failure in 12 months.',
        timestamp: '1 hour ago',
        read: false,
        link: '/dashboard/recurrence',
        type: 'alert',
      },
    ]);
  }, []);

  const handleResetDemoData = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const roles: { role: UserRole; label: string }[] = [
    { role: 'citizen', label: 'Citizen' },
    { role: 'field_inspector', label: 'Inspector' },
    { role: 'department_officer', label: 'Officer' },
    { role: 'administrator', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
      
      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <span>{title}</span>
          <span className="text-[10px] bg-sky-950 text-sky-400 font-mono px-2 py-0.5 rounded border border-sky-800/60 uppercase">
            Live Sentinel DB
          </span>
        </h1>
        <p className="text-xs text-slate-400">Bengaluru Civic Command & Infrastructure Monitoring</p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        
        {/* Quick Demo Role Selector */}
        <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold px-2">Role Preview:</span>
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => onRoleChange && onRoleChange(r.role)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                currentRole === r.role
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Demo Database Reset Button */}
        <button
          onClick={handleResetDemoData}
          disabled={isResetting}
          title="Reset Demo Data"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset Demo DB</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4 text-sky-400" />
            {notifications.some((n) => !n.read) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
                <span>System Notifications</span>
                <span className="text-[10px] bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded">
                  {notifications.length} New
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link || '/dashboard'}
                    onClick={() => setShowNotifDropdown(false)}
                    className="block p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 transition-colors text-xs border border-slate-850"
                  >
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{n.message}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {currentRole.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-white capitalize">{currentRole.replace('_', ' ')}</div>
            <div className="text-[10px] text-slate-400">Authenticated</div>
          </div>
        </div>

      </div>
    </header>
  );
}
