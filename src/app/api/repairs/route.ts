import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RepairSubmission } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, repairMethod, actualCost, workOrderRef, afterPhotos, notes, submittedBy } = body;

    if (!incidentId || !afterPhotos || afterPhotos.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Incident ID and after-repair photograph evidence are required.' },
        { status: 400 }
      );
    }

    const repair: RepairSubmission = {
      id: `rep-sub-${Date.now()}`,
      incidentId,
      submittedBy: submittedBy || 'Responsible Repair Team',
      submittedAt: new Date().toISOString(),
      repairMethod: repairMethod || 'Asphalt Cold Mix Patch & Surface Roller Compaction',
      actualCost: Number(actualCost) || 65000,
      workOrderRef: workOrderRef || `WO-${Math.floor(1000 + Math.random() * 9000)}`,
      afterPhotos: afterPhotos,
      notes: notes || 'Repair work completed as per work order guidelines.',
    };

    const updatedIncident = db.saveRepairSubmission(incidentId, repair);

    db.addAuditLog({
      actorId: repair.submittedBy,
      actorName: repair.submittedBy,
      actorRole: 'department_officer',
      action: 'SUBMIT_REPAIR_COMPLETION',
      targetType: 'Repair',
      targetId: repair.id,
      details: `Completion claimed for ${updatedIncident?.incidentNumber}. Awaiting Verification Review.`,
    });

    db.addNotification({
      role: 'department_officer',
      title: `Completion Claim Submitted: ${updatedIncident?.incidentNumber}`,
      message: `After-repair evidence submitted for review.`,
      link: `/dashboard/verification`,
      type: 'warning',
    });

    return NextResponse.json({ success: true, repair, incident: updatedIncident });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
