import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runAutomatedVerificationChecks } from '@/lib/verification-engine';
import { VerificationReview } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, decision, reviewReason, reviewerName, reviewerId } = body;

    if (!incidentId || !decision) {
      return NextResponse.json({ success: false, message: 'Incident ID and decision required' }, { status: 400 });
    }

    const incident = db.getIncidentById(incidentId);
    if (!incident) {
      return NextResponse.json({ success: false, message: 'Incident not found' }, { status: 404 });
    }

    const checks = runAutomatedVerificationChecks(incident);

    let finalStatus: VerificationReview['finalStatus'] = 'verified_fixed';
    if (decision === 'disputed') {
      finalStatus = 'verification_disputed';
    } else if (decision === 'needs_review') {
      finalStatus = 'under_review';
    }

    const review: VerificationReview = {
      id: `ver-${Date.now()}`,
      incidentId,
      reviewerId: reviewerId || 'usr-officer-1',
      reviewerName: reviewerName || 'Dr. Priya Kulkarni',
      reviewedAt: new Date().toISOString(),
      decision,
      finalStatus,
      checks,
      reviewReason: reviewReason || (decision === 'passed' ? 'Approved after multi-factor evidence check passed.' : 'Rejected due to evidence concerns.'),
      visualDiffScore: decision === 'passed' ? 92.0 : 18.2,
    };

    const updatedIncident = db.saveVerificationReview(incidentId, review);

    db.addAuditLog({
      actorId: review.reviewerId,
      actorName: review.reviewerName,
      actorRole: 'department_officer',
      action: decision === 'passed' ? 'APPROVE_REPAIR_CLOSURE' : 'REJECT_REPAIR_CLOSURE',
      targetType: 'Verification',
      targetId: review.id,
      details: `Verification review completed for ${incident.incidentNumber}. Decision: ${decision.toUpperCase()}. Reason: "${review.reviewReason}"`,
    });

    db.addNotification({
      role: 'citizen',
      title: decision === 'passed' ? 'Repair Verified & Closed!' : 'Repair Verification Update',
      message: decision === 'passed' 
        ? `Official repair for incident ${incident.incidentNumber} was verified and closed.` 
        : `Repair for ${incident.incidentNumber} failed verification and has been reopened for rework.`,
      link: `/track/${incident.incidentNumber}`,
      type: decision === 'passed' ? 'success' : 'alert',
    });

    return NextResponse.json({ success: true, review, incident: updatedIncident });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
