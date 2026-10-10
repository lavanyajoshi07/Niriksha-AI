import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = db.getIncidentById(id);

  if (!incident) {
    return NextResponse.json({ success: false, message: 'Incident not found' }, { status: 404 });
  }

  const reports = db.getReports().filter((r) => incident.reportIds.includes(r.id) || r.incidentId === incident.id);
  const asset = incident.assetId ? db.getStore().assets.find((a) => a.id === incident.assetId) : null;

  return NextResponse.json({
    success: true,
    incident,
    reports,
    asset,
  });
}
