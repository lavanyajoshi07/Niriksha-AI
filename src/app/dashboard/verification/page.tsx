'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  Camera, FileText, ArrowRight, RefreshCw, Eye
} from 'lucide-react';
import { Incident, VerificationCheck } from '@/types';
import { runAutomatedVerificationChecks } from '@/lib/verification-engine';

export default function VerificationCenterPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = () => {
    fetch('/api/incidents')
      .then((res) => res.json())
      .then((data) => {
        if (data.incidents) {
          setIncidents(data.incidents);
          const defaultReview = data.incidents.find(
            (i: Incident) => i.status === 'completion_claimed' || i.status === 'verification_disputed'
          );
          if (defaultReview) setSelectedIncident(defaultReview);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleDecision = async (decision: 'passed' | 'disputed') => {
    if (!selectedIncident) return;
    setSubmittingDecision(true);
    try {
      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          decision,
          reviewReason: reviewReason || (decision === 'passed' ? 'Approved after multi-factor evidence check passed.' : 'Rejected due to failed visual diff or citizen dispute.'),
          reviewerName: 'Dr. Priya Kulkarni',
          reviewerId: 'usr-officer-1',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Verification Decision Logged: ${decision.toUpperCase()}.`);
        setReviewReason('');
        fetchIncidents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading verification review center...</div>;
  }

  const reviewQueue = incidents.filter(
    (i) => i.status === 'completion_claimed' || i.status === 'verification_disputed' || i.repairSubmission
  );

  const activeChecks: VerificationCheck[] = selectedIncident
    ? runAutomatedVerificationChecks(selectedIncident)
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-400" />
          <span>False-Closure & Repair Verification Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Separate completion claims from official fixed status using automated multi-factor evidence verification and side-by-side photo comparison.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Verification Queue (1 Col) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Claims Queue</h2>
            <span className="text-xs font-mono bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-800">
              {reviewQueue.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {reviewQueue.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-xl cursor-pointer border transition-all space-y-2 ${
                  selectedIncident?.id === inc.id
                    ? 'bg-slate-950 border-sky-500 ring-2 ring-sky-500/20'
                    : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-400">{inc.incidentNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    inc.status === 'verification_disputed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    inc.status === 'completion_claimed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  }`}>
                    {inc.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="font-bold text-slate-100 text-xs">{inc.title}</h4>
                <div className="text-[11px] text-slate-400 truncate">{inc.location.address}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Evidence Review (2 Cols) */}
        {selectedIncident ? (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs text-sky-400 font-bold">{selectedIncident.incidentNumber}</span>
                <h2 className="text-lg font-bold text-white mt-1">{selectedIncident.title}</h2>
                <div className="text-xs text-slate-400">{selectedIncident.location.address}</div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase shrink-0 ${
                selectedIncident.status === 'verification_disputed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {selectedIncident.status.replace('_', ' ')}
              </span>
            </div>

            {/* Side-by-Side Photo Comparison */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-sky-400" />
                <span>Side-by-Side Photo Evidence Inspection</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Before Repair (Damage Photo)</span>
                  <div className="h-44 rounded-lg overflow-hidden bg-slate-900">
                    <img
                      src={selectedIncident.inspection?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800'}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
                  <span className="text-[11px] font-bold text-teal-400 uppercase block">After Repair (Claimed Completion)</span>
                  <div className="h-44 rounded-lg overflow-hidden bg-slate-900">
                    <img
                      src={selectedIncident.repairSubmission?.afterPhotos?.[0]?.url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Automated Verification Checks Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Automated System Verification Checks
              </h3>

              <div className="space-y-2">
                {activeChecks.map((chk) => (
                  <div
                    key={chk.code}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{chk.label}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{chk.details}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                      chk.status === 'passed' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                      chk.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {chk.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviewer Decision Controls */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Official Reviewer Decision & Reasoning
              </h3>

              <textarea
                rows={3}
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder="Enter engineering justification or rationale for decision..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
              />

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={() => handleDecision('disputed')}
                  disabled={submittingDecision}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Claim / Flag Disputed</span>
                </button>

                <button
                  onClick={() => handleDecision('passed')}
                  disabled={submittingDecision}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Official Closure (Verified Fixed)</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
            Select a repair claim from the left queue to conduct evidence inspection.
          </div>
        )}

      </div>
    </div>
  );
}
