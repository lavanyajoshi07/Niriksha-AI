'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  Shield, MapPin, CheckCircle2, Clock, AlertTriangle, 
  Cpu, FileText, ArrowLeft, Camera, UserPlus, RotateCcw, ShieldCheck
} from 'lucide-react';
import { Incident, Report } from '@/types';

export default function DeepIncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspector Form Modal
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [inspNotes, setInspNotes] = useState('');
  const [inspMethod, setInspMethod] = useState('');
  const [inspCost, setInspCost] = useState('85000');
  const [inspSeverity, setInspSeverity] = useState<'low' | 'medium' | 'high'>('high');

  // Contractor Repair Submit Modal
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [repairMethod, setRepairMethod] = useState('');
  const [repairCost, setRepairCost] = useState('85000');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800');

  useEffect(() => {
    fetch(`/api/incidents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.incident) {
          setIncident(data.incident);
          setReports(data.reports || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleInspectorSubmit = async () => {
    if (!incident) return;
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incident.id,
          verifiedSeverity: inspSeverity,
          notes: inspNotes,
          recommendedRepairMethod: inspMethod || 'Cold Mix Bituminous Patching with Sub-grade Compaction',
          estimatedCost: inspCost,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIncident(data.incident);
        setShowInspectorModal(false);
        alert('Field inspection record saved.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepairSubmit = async () => {
    if (!incident) return;
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incident.id,
          repairMethod,
          actualCost: repairCost,
          afterPhotos: [
            {
              id: `ev-after-${Date.now()}`,
              type: 'after_photo',
              url: afterPhotoUrl,
              filename: 'after_repair.jpg',
              timestamp: new Date().toISOString(),
              uploadedBy: incident.assignedContractorId || 'Contractor',
            },
          ],
          notes: 'Repair works completed as per work order instructions.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIncident(data.incident);
        setShowRepairModal(false);
        alert('Completion claim submitted! Case moved to Verification Center for Review.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading incident intelligence details...</div>;
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-white">Incident Not Found</h2>
        <Link href="/dashboard/complaints" className="text-xs text-sky-400 underline mt-2 block">
          Return to Queue
        </Link>
      </div>
    );
  }

  const primaryReport = reports[0];
  const ai = primaryReport?.aiScreening;
  const p = incident.priorityScore;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div>
        <Link href="/dashboard/complaints" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaint Queue</span>
        </Link>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-sky-400 bg-sky-950 border border-sky-800/60 px-2.5 py-0.5 rounded">
                {incident.incidentNumber}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                {incident.assignedDepartment}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-2">{incident.title}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{incident.location.address}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowInspectorModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              Record Inspection
            </button>
            <button
              onClick={() => setShowRepairModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-md"
            >
              Submit Repair Completion
            </button>
          </div>
        </div>
      </div>

      {/* Recurrence Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-purple-400" />
          <span>Incident Recurrence & Lifecycle Timeline</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">1. Intake</span>
            <span className="font-bold text-slate-200 block mt-1">Submitted</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">2. Inspection</span>
            <span className="font-bold text-slate-200 block mt-1">{incident.inspection ? 'Inspected' : 'Pending'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">3. Work Order</span>
            <span className="font-bold text-slate-200 block mt-1">{incident.assignedContractorId ? 'Assigned' : 'Unassigned'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">4. Repair Claim</span>
            <span className="font-bold text-slate-200 block mt-1">{incident.repairSubmission ? 'Claimed' : 'In Progress'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">5. Verification</span>
            <span className="font-bold text-slate-200 block mt-1">{incident.verificationReview ? incident.verificationReview.decision.toUpperCase() : 'Pending'}</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800 text-purple-300">
            <span className="text-[10px] text-purple-400 block uppercase font-bold">6. Recurrence</span>
            <span className="font-bold block mt-1">{incident.recurrenceCount}x Repeat Defect</span>
          </div>
        </div>
      </div>

      {/* Grid: Priority Score Breakdown & AI Vision Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Priority Score Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-400" />
              <span>Explainable Priority Score</span>
            </h3>
            <span className="text-xl font-extrabold font-mono text-sky-400">
              {p?.finalScore || 88.5}/100
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Damage Severity (30%)</span>
                <span className="font-mono text-white">{p?.factorScores.damageSeverity}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500" style={{ width: `${p?.factorScores.damageSeverity}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Immediate Safety Hazard Risk (25%)</span>
                <span className="font-mono text-white">{p?.factorScores.immediateSafetyRisk}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${p?.factorScores.immediateSafetyRisk}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Public Disruption Impact (20%)</span>
                <span className="font-mono text-white">{p?.factorScores.publicImpact}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${p?.factorScores.publicImpact}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Verified Recurrence Frequency (15%)</span>
                <span className="font-mono text-white">{p?.factorScores.verifiedRecurrence}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${p?.factorScores.verifiedRecurrence}%` }} />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-850 leading-relaxed">
            {p?.explanation}
          </p>
        </div>

        {/* AI Vision Screening Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-400" />
              <span>AI Vision Screening Analysis</span>
            </h3>
            {ai?.isDemoMode && (
              <span className="text-[10px] bg-sky-950 text-sky-400 font-mono px-2 py-0.5 rounded border border-sky-800/60">
                Sentinel AI Demo Engine
              </span>
            )}
          </div>

          {ai ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Detected Defect</span>
                  <span className="font-bold text-slate-200 block mt-0.5">{ai.categoryLabel}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Confidence Score</span>
                  <span className="font-bold text-teal-400 block mt-0.5 font-mono">{ai.confidenceScore}%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Engineering Rationale</span>
                <p className="text-slate-300 mt-1 leading-relaxed">{ai.explanation}</p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">AI Screening pending for this incident.</div>
          )}
        </div>

      </div>

      {/* Inspector Form Modal */}
      {showInspectorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Record Field Inspection Findings</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Verified Severity</label>
              <select
                value={inspSeverity}
                onChange={(e) => setInspSeverity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="high">HIGH - Severe Structural Hazard</option>
                <option value="medium">MEDIUM - Surface Degradation</option>
                <option value="low">LOW - Minor Defect</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Inspection Notes</label>
              <textarea
                rows={3}
                value={inspNotes}
                onChange={(e) => setInspNotes(e.target.value)}
                placeholder="Observed crater depth, sub-grade water saturation..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estimated Repair Cost (INR)</label>
              <input
                type="number"
                value={inspCost}
                onChange={(e) => setInspCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowInspectorModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleInspectorSubmit} className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold">
                Save Field Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contractor Repair Submit Modal */}
      {showRepairModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Submit Repair Completion Claim</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Repair Method Used</label>
              <input
                type="text"
                value={repairMethod}
                onChange={(e) => setRepairMethod(e.target.value)}
                placeholder="e.g. VG-30 Bituminous Concrete Asphalt Paving"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">After-Repair Photo URL</label>
              <input
                type="text"
                value={afterPhotoUrl}
                onChange={(e) => setAfterPhotoUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowRepairModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleRepairSubmit} className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold">
                Submit Claim for Verification Review
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
