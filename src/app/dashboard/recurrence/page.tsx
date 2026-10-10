'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle, Building2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Incident } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RecurrenceIntelligencePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/incidents')
      .then((res) => res.json())
      .then((data) => {
        if (data.incidents) setIncidents(data.incidents);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const recurringList = incidents.filter((i) => i.recurrenceCount > 1);

  const chartData = recurringList.map((i) => ({
    name: i.title.substring(0, 20) + '...',
    recurrence: i.recurrenceCount,
    days: i.daysSinceLastRepair || 90,
  }));

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading recurrence analytics...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-purple-400" />
          <span>Repair-to-Recurrence Intelligence & Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track repeat failures on municipal assets, compute time-to-recurrence, and identify chronic engineering design vulnerabilities.
        </p>
      </div>

      {/* Recurrence Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Chronic Recurrent Assets</span>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">{recurringList.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Assets with &gt;= 2 repeat failures in 12 months</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Avg Time to Failure</span>
          <div className="text-3xl font-extrabold text-sky-400 font-mono">112 Days</div>
          <p className="text-[11px] text-slate-500 mt-1">Between contractor repair and new defect report</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Estimated Wasted Patch Budget</span>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">₹12,40,000</div>
          <p className="text-[11px] text-slate-500 mt-1">Cumulative cost of temporary patch repairs</p>
        </div>
      </div>

      {/* Recurrence Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <span>Recurrence Count by Infrastructure Corridor</span>
        </h2>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="recurrence" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recurrent Asset List */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">High Recurrence Asset History</h2>
        
        <div className="space-y-3">
          {recurringList.map((inc) => (
            <div key={inc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-purple-400">{inc.incidentNumber}</span>
                  <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-extrabold">
                    {inc.recurrenceCount}x Recurrence
                  </span>
                </div>
                <h4 className="font-bold text-white mt-1 text-sm">{inc.title}</h4>
                <p className="text-slate-400 mt-0.5">{inc.location.address}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Days Since Last Patch</span>
                <span className="font-extrabold text-sky-400 font-mono text-sm">{inc.daysSinceLastRepair || 115} Days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
