'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';
import { 
  Shield, PlusCircle, Search, Cpu, CheckCircle2, AlertTriangle, 
  RotateCcw, ShieldCheck, ArrowRight, BarChart3, Users, Building2, MapPin
} from 'lucide-react';
import { Incident, Report } from '@/types';

// Import Map dynamically to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-sm">
      Loading Public Infrastructure Issue Map...
    </div>
  ),
});

export default function LandingPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [reportsCount, setReportsCount] = useState<number>(4);
  const [fixedCount, setFixedCount] = useState<number>(1);
  const [recurringCount, setRecurringCount] = useState<number>(2);
  const [trackSearchId, setTrackSearchId] = useState<string>('');

  useEffect(() => {
    fetch('/api/incidents')
      .then((res) => res.json())
      .then((data) => {
        if (data.incidents) {
          setIncidents(data.incidents);
          setReportsCount(data.incidents.reduce((acc: number, curr: Incident) => acc + curr.reportsCount, 0));
          setFixedCount(data.incidents.filter((i: Incident) => i.status === 'verified_fixed').length);
          setRecurringCount(data.incidents.filter((i: Incident) => i.recurrenceCount > 1).length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        
        {/* Glowing backdrop elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-400 text-xs font-semibold tracking-wider uppercase mb-6 shadow-inner">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>NIRIKSHA AI &bull; INFRASTRUCTURE INTELLIGENCE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Predict. Prevent. Protect.{' '}
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent block mt-2">
              Next-Gen Public Asset Governance
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Empowering citizens to report civic damage while assisting government departments to verify repair quality, group duplicate reports, track recurring failures, and plan preventive maintenance using AI vision analysis.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/report"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-sky-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report Infrastructure Issue</span>
            </Link>

            <Link
              href="/track"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Search className="w-5 h-5 text-teal-400" />
              <span>Track Complaint Status</span>
            </Link>
          </div>

          {/* Quick Track Input Bar */}
          <div className="mt-10 max-w-xl mx-auto p-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={trackSearchId}
              onChange={(e) => setTrackSearchId(e.target.value)}
              placeholder="Enter Complaint ID (e.g. BS-2026-0941)"
              className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-2"
            />
            <Link
              href={trackSearchId.trim() ? `/track/${trackSearchId.trim()}` : '/track'}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shrink-0 transition-colors flex items-center gap-1"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Impact Indicators Section */}
      <section className="py-12 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center">
              <div className="text-3xl font-extrabold text-white font-mono">{reportsCount}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Total Citizen Reports</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center">
              <div className="text-3xl font-extrabold text-teal-400 font-mono">{fixedCount}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Verified Fixes</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center">
              <div className="text-3xl font-extrabold text-amber-400 font-mono">{recurringCount}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Recurrence Alerts Linked</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center">
              <div className="text-3xl font-extrabold text-sky-400 font-mono">94.8%</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">AI Screening Accuracy</div>
            </div>

          </div>
        </div>
      </section>

      {/* Public Infrastructure Map Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">Live GIS Command Center</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Public Infrastructure Incident Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time geolocated infrastructure damage, open complaints, and repair progress across Bengaluru pilot zone.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-rose-500" /> Critical
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> High Priority
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> Verified Fixed
            </span>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <MapComponent incidents={incidents} height="480px" zoom={12} />
        </div>
      </section>

      {/* Core Platform Modules Grid */}
      <section className="py-16 bg-slate-900/30 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Core System Architecture</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Engineered for Complete Public Infrastructure Integrity
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From initial citizen reporting to post-repair verification and long-term budget planning, Bharat Sentinel AI connects every department into one explainable workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Vision Screening</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Automated damage classification and depth/severity estimation powered by vision AI models with clear confidence metrics and inspector verification overrides.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">False-Closure Verification Center</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Prevents premature or fake repair closures using side-by-side photo comparison, visual diff scoring, metadata checks, and citizen re-dispute protection.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Repair-to-Recurrence Intelligence</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Links new complaints to past work orders and asset repair histories. Tracks recurrence frequency and escalates priority when repairs repeatedly fail.
              </p>
            </div>

          </div>

          {/* Secondary Features Banner */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Budget-Aware Maintenance Planner</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Optimize municipal maintenance budgets by selecting high-risk interventions, tracking remaining funds, and exporting plans directly to CSV.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/intelligence"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 transition-colors shadow-lg shadow-sky-600/20"
            >
              Explore Planner &rarr;
            </Link>
          </div>

        </div>
      </section>

      {/* Role Demonstration Portal CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Hackathon Live Demo Ready</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Ready to Test the Full Governance Workflow?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-3">
              Login instantly as a Citizen, Field Inspector, Department Officer, or System Administrator with pre-loaded demo accounts.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/login?role=citizen"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
              >
                Login as Citizen
              </Link>
              <Link
                href="/login?role=field_inspector"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
              >
                Login as Field Inspector
              </Link>
              <Link
                href="/login?role=department_officer"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-lg transition-all"
              >
                Login as Department Officer
              </Link>
              <Link
                href="/login?role=administrator"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
              >
                Login as Administrator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-300">Niriksha AI &bull; Bharat Sentinel Infrastructure Intelligence Platform</p>
          <p className="mt-1">Built for Government Civic Bodies, Municipalities, and Citizen Safety.</p>
        </div>
      </footer>

    </div>
  );
}
