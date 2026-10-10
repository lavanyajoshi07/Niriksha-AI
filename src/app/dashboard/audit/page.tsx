'use client';

import { useState, useEffect } from 'react';
import { FileText, Shield, User, Clock, Lock } from 'lucide-react';
import { AuditLog } from '@/types';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading security audit trail...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-sky-400" />
          <span>Security Audit & Compliance Trail Log</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable audit record of status updates, work order assignments, repair submissions, and verification decisions.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-400">{log.action}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded uppercase">
                    {log.actorRole}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">Target: {log.targetType} #{log.targetId}</span>
                </div>
                <p className="text-slate-200 font-medium">{log.details}</p>
                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                  <span>Actor: <strong className="text-slate-400">{log.actorName}</strong></span>
                  <span>&bull;</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
