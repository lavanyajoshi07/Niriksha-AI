'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, Search, Filter, AlertTriangle, 
  MapPin, CheckCircle2, UserPlus, ArrowRight, RotateCcw
} from 'lucide-react';
import { Incident, ComplaintStatus, PriorityLevel, DepartmentName, InfrastructureCategory } from '@/types';

export default function ComplaintQueuePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Assignment Modal
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [contractorName, setContractorName] = useState('');
  const [inspectorId, setInspectorId] = useState('usr-inspector-1');
  const [savingAssignment, setSavingAssignment] = useState(false);

  useEffect(() => {
    fetch('/api/incidents')
      .then((res) => res.json())
      .then((data) => {
        if (data.incidents) setIncidents(data.incidents);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAssignmentSave = async () => {
    if (!selectedIncident) return;
    setSavingAssignment(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          assignedInspectorId: inspectorId,
          assignedContractorId: contractorName || 'Sri Lakshmi Infra Contractors Pvt Ltd',
          status: 'assigned',
        }),
      });
      const data = await res.json();
      if (data.success && data.incident) {
        setIncidents((prev) => prev.map((i) => (i.id === data.incident.id ? data.incident : i)));
        setSelectedIncident(null);
        alert('Work order assigned & status updated to ASSIGNED.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAssignment(false);
    }
  };

  // Filter logic
  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && inc.priorityScore?.priorityLevel !== priorityFilter) return false;
    if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
    if (deptFilter !== 'all' && inc.assignedDepartment !== deptFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        inc.title.toLowerCase().includes(q) ||
        inc.incidentNumber.toLowerCase().includes(q) ||
        inc.location.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading complaint management queue...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-sky-400" />
            <span>Complaint & Incident Management Queue</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch work orders, assign field inspectors, and monitor report lifecycle from intake to verification.
          </p>
        </div>

        <span className="text-xs font-mono font-bold bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 rounded-xl">
          Showing {filteredIncidents.length} of {incidents.length} Incidents
        </span>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, title, or road..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="under_review">Under Review</option>
              <option value="completion_claimed">Completion Claimed</option>
              <option value="verified_fixed">Verified Fixed</option>
              <option value="verification_disputed">Disputed Closure</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="pothole">Pothole</option>
              <option value="blocked_drain">Blocked Drain</option>
              <option value="waterlogging">Waterlogging</option>
              <option value="damaged_road">Damaged Road</option>
              <option value="street_lighting">Street Lighting</option>
            </select>
          </div>

        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="space-y-3">
        {filteredIncidents.map((inc) => (
          <div
            key={inc.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-sky-400 bg-sky-950 border border-sky-800/60 px-2 py-0.5 rounded">
                  {inc.incidentNumber}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  inc.priorityScore?.priorityLevel === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  inc.priorityScore?.priorityLevel === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                }`}>
                  {inc.priorityScore?.priorityLevel || 'HIGH'} ({inc.priorityScore?.finalScore}/100)
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                  {inc.status.replace('_', ' ')}
                </span>

                {inc.recurrenceCount > 1 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    <span>{inc.recurrenceCount}x Recurrence</span>
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white">{inc.title}</h3>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{inc.location.address}</span>
                </span>
                <span>&bull;</span>
                <span>Dept: <strong className="text-slate-200">{inc.assignedDepartment}</strong></span>
                <span>&bull;</span>
                <span>Reports Linked: <strong className="text-sky-400 font-mono">{inc.reportsCount}</strong></span>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
              <button
                onClick={() => {
                  setSelectedIncident(inc);
                  setContractorName(inc.assignedContractorId || '');
                }}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-sky-500 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-sky-400" />
                <span>Assign</span>
              </button>

              <Link
                href={`/dashboard/complaints/${inc.id}`}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-md flex items-center gap-1"
              >
                <span>View Incident</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              Assign Work Order: {selectedIncident.incidentNumber}
            </h3>
            <p className="text-xs text-slate-400">{selectedIncident.title}</p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Assigned Inspector</label>
              <select
                value={inspectorId}
                onChange={(e) => setInspectorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="usr-inspector-1">Inspector Rajesh Varma (PWD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Contractor / Repair Agency</label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder="e.g. Sri Lakshmi Infra Contractors Pvt Ltd"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignmentSave}
                disabled={savingAssignment}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
              >
                {savingAssignment ? 'Saving...' : 'Dispatch Work Order'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
