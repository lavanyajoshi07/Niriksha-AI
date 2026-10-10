'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, MapPin, Search, PlusCircle, LayoutDashboard, UserCheck, AlertTriangle } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
                  NIRIKSHA AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-800/60">
                  GOV AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Predict &bull; Prevent &bull; Protect
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                pathname === '/' ? 'bg-slate-800 text-sky-400 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Public Dashboard
            </Link>
            <Link
              href="/report"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                pathname === '/report' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              Report Issue
            </Link>
            <Link
              href="/track"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                pathname.startsWith('/track') ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-teal-400" />
              Track Complaint
            </Link>
          </div>

          {/* CTA & Role Login */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-400" />
              <span>Officer Portal</span>
            </Link>
            
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-teal-600 text-white hover:from-sky-500 hover:to-teal-500 shadow-md shadow-sky-600/20 transition-all transform hover:-translate-y-0.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Role Login</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
