'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Search, Shield, ArrowRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function TrackSearchPage() {
  const [query, setQuery] = useState('');

  const sampleIds = ['BS-2026-0941', 'BS-2026-0910', 'BS-2026-0889'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-16 w-full text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Track Your Infrastructure Complaint
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
          Enter your unique 11-digit Complaint Tracking ID to check AI screening results, field inspection notes, repair progress, and verification status.
        </p>

        {/* Search Bar */}
        <div className="mt-8 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex items-center gap-2 max-w-xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. BS-2026-0941"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-4"
          />
          <Link
            href={query.trim() ? `/track/${query.trim()}` : '#'}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shrink-0 transition-colors flex items-center gap-1.5"
          >
            <span>Track Status</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Sample Demo Complaint IDs */}
        <div className="mt-10 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-left max-w-xl mx-auto space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sample Seeded Demo Complaints to Test:
          </div>
          <div className="space-y-2">
            {sampleIds.map((id) => (
              <Link
                key={id}
                href={`/track/${id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 transition-colors text-xs"
              >
                <div>
                  <span className="font-extrabold text-sky-400 font-mono">{id}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {id === 'BS-2026-0941' && 'Hazardous Pothole on Outer Ring Road (Assigned to PWD)'}
                    {id === 'BS-2026-0910' && 'Blocked Storm Drain (Completion Claimed by Contractor)'}
                    {id === 'BS-2026-0889' && 'Disputed Closure Pothole (Reopened after citizen re-report)'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
