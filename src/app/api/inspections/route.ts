import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Inspection } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, verifiedSeverity, notes, recommendedRepairMethod, estimatedCost, photos, inspectorId, inspectorName } = body;

    if (!incidentId || !notes) {
      return NextResponse.json({ success: false, message: 'Incident ID and notes are required' }, { status: 400 });
    }

    const inspection: Inspection = {
      id: `insp-${Date.now()}`,
      incidentId,
      inspectorId: inspectorId || 'usr-inspector-1',
      inspectorName: inspectorName || 'Inspector Rajesh Varma',
      inspectedAt: new Date().toISOString(),
      verifiedSeverity: verifiedSeverity || 'high',
      notes,
      recommendedRepairMethod: recommendedRepairMethod || 'Standard Cold Mix Patching',
      estimatedCost: Number(estimatedCost) || 50000,
      photos: photos || [],
      submittedForReview: true,
    };

    const updatedIncident = db.saveInspection(incidentId, inspection);

    db.addAuditLog({
      actorId: inspection.inspectorId,
      actorName: inspection.inspectorName,
      actorRole: 'field_inspector',
      action: 'SUBMIT_FIELD_INSPECTION',
      targetType: 'Inspection',
      targetId: inspection.id,
      details: `Field inspection recorded for ${updatedIncident?.incidentNumber}. Severity: ${verifiedSeverity.toUpperCase()}`,
    });

    db.addNotification({
      role: 'department_officer',
      title: `Field Inspection Completed`,
      message: `Inspector ${inspection.inspectorName} verified incident ${updatedIncident?.incidentNumber}.`,
      link: `/dashboard/complaints/${incidentId}`,
      type: 'info',
    });

    return NextResponse.json({ success: true, inspection, incident: updatedIncident });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
