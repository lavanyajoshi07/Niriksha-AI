import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const category = searchParams.get('category');
  const department = searchParams.get('department');
  const search = searchParams.get('search');

  let incidents = db.getIncidents();

  if (status) {
    incidents = incidents.filter((i) => i.status === status);
  }
  if (priority) {
    incidents = incidents.filter((i) => i.priorityScore.priorityLevel === priority);
  }
  if (category) {
    incidents = incidents.filter((i) => i.category === category);
  }
  if (department) {
    incidents = incidents.filter((i) => i.assignedDepartment === department);
  }
  if (search) {
    const q = search.toLowerCase();
    incidents = incidents.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.incidentNumber.toLowerCase().includes(q) ||
        i.location.address.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ success: true, count: incidents.length, incidents });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, assignedInspectorId, assignedContractorId, status, actorName, actorRole } = body;

    if (!incidentId) {
      return NextResponse.json({ success: false, message: 'Incident ID required' }, { status: 400 });
    }

    const updates: any = {};
    if (assignedInspectorId) updates.assignedInspectorId = assignedInspectorId;
    if (assignedContractorId) updates.assignedContractorId = assignedContractorId;
    if (status) updates.status = status;

    const updated = db.updateIncident(incidentId, updates);

    if (updated) {
      db.addAuditLog({
        actorId: actorName || 'Officer',
        actorName: actorName || 'Department Officer',
        actorRole: actorRole || 'department_officer',
        action: 'UPDATE_INCIDENT_ASSIGNMENT',
        targetType: 'Incident',
        targetId: incidentId,
        details: `Updated incident ${updated.incidentNumber}. Inspector: ${updated.assignedInspectorId || 'N/A'}, Contractor: ${updated.assignedContractorId || 'N/A'}, Status: ${updated.status}`,
      });
    }

    return NextResponse.json({ success: true, incident: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
