'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Shield, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get('role') as UserRole | null;

  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleRoleLogin = async (role: UserRole) => {
    setLoadingRole(role);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('sentinel_token', data.token);
        localStorage.setItem('sentinel_user', JSON.stringify(data.user));
        document.cookie = `sentinel_role=${data.user.role}; path=/`;

        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRole(null);
    }
  };

  const demoAccounts = [
    {
      role: 'citizen' as UserRole,
      title: 'Citizen Account',
      name: 'Aarav Sharma',
      email: 'citizen@sentinel.in',
      desc: 'Submit complaints, track status, dispute false closures, view official updates.',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
    {
      role: 'field_inspector' as UserRole,
      title: 'Field Inspector Account',
      name: 'Inspector Rajesh Varma',
      email: 'inspector@sentinel.in',
      desc: 'View assigned complaints, record verified severity, upload inspection notes & repair recommendations.',
      badgeColor: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
    },
    {
      role: 'department_officer' as UserRole,
      title: 'Department Officer Account',
      name: 'Dr. Priya Kulkarni',
      email: 'officer@sentinel.in',
      desc: 'Queue management, assign contractors, issue work orders, review completion claims & dispute logs.',
      badgeColor: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
    },
    {
      role: 'administrator' as UserRole,
      title: 'System Administrator Account',
      name: 'Vikramaditya Rao',
      email: 'admin@sentinel.in',
      desc: 'Overall analytics, asset management, audit log inspection, maintenance planner, seed demo data.',
      badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {demoAccounts.map((acc) => (
        <div
          key={acc.role}
          className={`p-6 rounded-2xl bg-slate-900/90 border transition-all flex flex-col justify-between shadow-xl ${
            preselectedRole === acc.role
              ? 'border-sky-500 ring-2 ring-sky-500/20'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md border ${acc.badgeColor}`}>
                {acc.role.replace('_', ' ')}
              </span>
              <UserCheck className="w-4 h-4 text-slate-500" />
            </div>

            <h3 className="text-lg font-bold text-white mt-4">{acc.title}</h3>
            <div className="text-xs text-slate-300 font-semibold mt-1">{acc.name}</div>
            <div className="text-[11px] font-mono text-slate-500">{acc.email}</div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              {acc.desc}
            </p>
          </div>

          <button
            onClick={() => handleRoleLogin(acc.role)}
            disabled={loadingRole !== null}
            className="mt-6 w-full py-3 rounded-xl bg-slate-800 hover:bg-sky-600 text-white font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-slate-700 hover:border-sky-500 shadow-md"
          >
            {loadingRole === acc.role ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Login as {acc.title.split(' ')[0]}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full flex flex-col items-center justify-center">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Role-Based Access Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Select a seeded demo role below for instant 1-click authentication and testing.
          </p>
        </div>

        <Suspense fallback={<div className="text-slate-400 text-sm">Loading login options...</div>}>
          <LoginFormContent />
        </Suspense>

        {/* Security Note */}
        <div className="mt-12 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center max-w-xl text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5 font-semibold text-slate-300">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Hackathon Demonstration Environment</span>
          </p>
          <p className="mt-1 text-[11px] leading-relaxed">
            All server endpoints enforce server-side role validation. Pre-loaded accounts use non-production secrets.
          </p>
        </div>

      </main>
    </div>
  );
}
