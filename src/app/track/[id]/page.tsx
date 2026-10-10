'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  Shield, MapPin, CheckCircle2, Clock, AlertTriangle, 
  Cpu, FileText, ArrowLeft, RefreshCw, XCircle
} from 'lucide-react';
import { Report, Incident, ComplaintStatus } from '@/types';

export default function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  // Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeNotes, setDisputeNotes] = useState('');
  const [dismittingDispute, setDismittingDispute] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.report) {
          setReport(data.report);
          setIncident(data.incident);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDisputeSubmit = async () => {
    if (!report) return;
    setDismittingDispute(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispute_closure',
          disputeNotes,
          actorName: report.citizenContact?.name || 'Citizen',
        }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
        setShowDisputeModal(false);
        alert('Closure dispute submitted successfully! Department Officer notified.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDismittingDispute(false);
    }
  };

  const statusSteps: { status: ComplaintStatus; label: string }[] = [
    { status: 'submitted', label: 'Report Submitted' },
    { status: 'under_review', label: 'Under AI & Inspector Review' },
    { status: 'assigned', label: 'Assigned to Department' },
    { status: 'repair_in_progress', label: 'Repair Work in Progress' },
    { status: 'completion_claimed', label: 'Completion Claimed' },
    { status: 'verified_fixed', label: 'Official Verification Passed' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Loading complaint tracking record...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Complaint Not Found</h1>
          <p className="text-xs text-slate-400 mt-2">No record found matching tracking ID: {id}</p>
          <Link href="/track" className="mt-6 inline-block px-5 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl">
            Return to Search
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10 w-full">
        
        {/* Top Navigation */}
        <Link href="/track" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaint Tracking Search</span>
        </Link>

        {/* Complaint Overview Header */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950 border border-sky-800/60 px-2.5 py-0.5 rounded">
                  {report.complaintId}
                </span>
                <span className="text-[11px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {report.category.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight mt-2">{report.title}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{report.location.address}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 block">Current Status</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase mt-1 ${
                report.status === 'verified_fixed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                report.status === 'verification_disputed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              }`}>
                {report.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Status Workflow Timeline */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 mb-8 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Official Resolution Timeline
          </h2>

          <div className="space-y-4">
            {statusSteps.map((step, idx) => {
              const isDone = ['verified_fixed', 'completion_claimed', 'assigned', 'under_review', 'submitted'].indexOf(report.status) >= idx;
              const isCurrent = report.status === step.status;

              return (
                <div key={step.status} className="flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold ${
                    isCurrent ? 'bg-sky-500 text-white border-sky-400 ring-4 ring-sky-500/20' :
                    isDone ? 'bg-teal-950 text-teal-400 border-teal-500' :
                    'bg-slate-950 text-slate-600 border-slate-800'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isCurrent ? 'text-sky-400' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.label}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {step.status === 'submitted' && `Report logged at ${new Date(report.createdAt).toLocaleDateString()}`}
                      {step.status === 'assigned' && incident?.assignedDepartment && `Assigned to ${incident.assignedDepartment}`}
                      {step.status === 'completion_claimed' && incident?.repairSubmission && `Contractor submitted repair evidence`}
                      {step.status === 'verified_fixed' && `Multi-factor evidence verification approved.`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Citizen Dispute Button */}
        {(report.status === 'completion_claimed' || report.status === 'verified_fixed') && (
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Problem Not Fixed? Dispute This Closure</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                If the pothole/drain failure remains unresolved or washed out after repair, file an official closure dispute.
              </p>
            </div>
            <button
              onClick={() => setShowDisputeModal(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 shadow-lg"
            >
              Dispute Closure
            </button>
          </div>
        )}

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>File Closure Dispute</span>
              </h3>
              <p className="text-xs text-slate-400">
                Provide details on why the repair is unsatisfactory (e.g. temporary mud washed away, incomplete desilting):
              </p>
              <textarea
                rows={4}
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                placeholder="Explain the remaining problem..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisputeSubmit}
                  disabled={dismittingDispute || !disputeNotes.trim()}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold"
                >
                  {dismittingDispute ? 'Submitting Dispute...' : 'Submit Official Dispute'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Original Reported Photo</span>
            <div className="h-48 rounded-xl overflow-hidden bg-slate-950">
              <img src={report.evidence[0]?.url} alt="Before" className="w-full h-full object-cover" />
            </div>
          </div>

          {incident?.repairSubmission?.afterPhotos?.[0] && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-teal-400 uppercase">After Repair Evidence</span>
              <div className="h-48 rounded-xl overflow-hidden bg-slate-950">
                <img src={incident.repairSubmission.afterPhotos[0].url} alt="After" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
