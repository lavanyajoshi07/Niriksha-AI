import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = db.getReportById(id);

  if (!report) {
    return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
  }

  const incident = report.incidentId ? db.getIncidentById(report.incidentId) : null;

  return NextResponse.json({ success: true, report, incident });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, disputeNotes, actorName } = body;

    const report = db.getReportById(id);
    if (!report) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    if (action === 'dispute_closure') {
      report.status = 'verification_disputed';
      report.updatedAt = new Date().toISOString();

      if (report.incidentId) {
        const inc = db.getIncidentById(report.incidentId);
        if (inc) {
          inc.status = 'verification_disputed';
          inc.disputeNotes = disputeNotes || 'Citizen disputed closure. Problem remains unresolved.';
          inc.priorityScore.finalScore = Math.max(90, inc.priorityScore.finalScore);
          inc.priorityScore.priorityLevel = 'critical';
          inc.priorityScore.escalatedForSafety = true;
          inc.priorityScore.explanation = `ESCALATED TO CRITICAL: Citizen filed closure dispute with notes: "${disputeNotes || 'Unresolved defect'}"`;
          db.updateIncident(inc.id, inc);
        }
      }

      db.addAuditLog({
        actorId: actorName || 'Citizen',
        actorName: actorName || 'Citizen',
        actorRole: 'citizen',
        action: 'DISPUTE_REPAIR_CLOSURE',
        targetType: 'Report',
        targetId: report.id,
        details: `Citizen disputed closure for complaint ${report.complaintId}. Note: "${disputeNotes || 'Unresolved'}"`,
      });

      db.addNotification({
        role: 'department_officer',
        title: `Closure Disputed for ${report.complaintId}`,
        message: `Citizen reported problem is still unresolved. Re-opened for review.`,
        link: `/dashboard/verification`,
        type: 'alert',
      });

      return NextResponse.json({
        success: true,
        message: 'Closure dispute logged successfully. Case escalated to Department Officer.',
        report,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Update failed' },
      { status: 500 }
    );
  }
}
