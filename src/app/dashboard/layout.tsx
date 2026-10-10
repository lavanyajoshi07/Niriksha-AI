'use client';

import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { UserRole } from '@/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('department_officer');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('sentinel_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role) setCurrentRole(u.role);
      } catch (err) {}
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const storedUser = localStorage.getItem('sentinel_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        u.role = role;
        localStorage.setItem('sentinel_user', JSON.stringify(u));
      } catch (err) {}
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans" suppressHydrationWarning>
      <DashboardSidebar userRole={mounted ? currentRole : 'department_officer'} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader currentRole={mounted ? currentRole : 'department_officer'} onRoleChange={handleRoleChange} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
