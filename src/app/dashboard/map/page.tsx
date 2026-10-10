'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Map, Filter, Layers, RefreshCw } from 'lucide-react';
import { Incident } from '@/types';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-sm">
      Loading GIS Map Command Center...
    </div>
  ),
});

export default function GISMapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
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

  const filteredIncidents = incidents.filter((i) => {
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && i.priorityScore?.priorityLevel !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Map className="w-6 h-6 text-sky-400" />
            <span>Interactive GIS Infrastructure Map</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Geospatial intelligence map displaying live citizen complaints, priority levels, and asset health across Bengaluru.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Priority</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="blocked_drain">Blocked Drain</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="damaged_road">Damaged Road</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <MapComponent incidents={filteredIncidents} height="600px" zoom={12} />
      </div>
    </div>
  );
}
