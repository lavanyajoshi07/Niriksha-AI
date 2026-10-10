import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runAIScreening } from '@/lib/ai-screening';
import { detectDuplicateIncidents } from '@/lib/duplicate-detector';
import { calculateExplainablePriority } from '@/lib/priority-queue';
import { DepartmentName, InfrastructureCategory, Incident, Report } from '@/types';

function mapCategoryToDepartment(cat: InfrastructureCategory): DepartmentName {
  switch (cat) {
    case 'pothole':
    case 'road_crack':
    case 'damaged_road':
      return 'Roads & Bridges (PWD)';
    case 'blocked_drain':
    case 'waterlogging':
      return 'Stormwater Drains (BBMP)';
    case 'street_lighting':
      return 'Electrical & Lighting (BESCOM)';
    case 'bridge_structural':
      return 'Roads & Bridges (PWD)';
    default:
      return 'General Maintenance';
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');

  let reports = db.getReports();
  if (category) {
    reports = reports.filter((r) => r.category === category);
  }
  if (status) {
    reports = reports.filter((r) => r.status === status);
  }

  return NextResponse.json({ success: true, count: reports.length, reports });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, description, location, evidence, citizenContact, consentGiven, forceDuplicateLinkId } = body;

    if (!title || !category || !location || !location.latitude || !location.longitude) {
      return NextResponse.json(
        { success: false, message: 'Title, category, and location coordinates are required.' },
        { status: 400 }
      );
    }

    const reportId = `rep-${Date.now()}`;
    const complaintId = `BS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Run AI Screening
    const firstPhotoUrl = evidence?.[0]?.url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800';
    const aiScreening = await runAIScreening(firstPhotoUrl, category, description);

    // 2. Check for Duplicate Incidents
    const existingIncidents = db.getIncidents();
    const duplicateMatches = detectDuplicateIncidents(location, category, existingIncidents);

    let assignedIncidentId = forceDuplicateLinkId || undefined;
    let isDuplicate = false;

    if (!forceDuplicateLinkId && duplicateMatches.length > 0 && duplicateMatches[0].matchScore >= 70) {
      // Auto link to top duplicate match
      assignedIncidentId = duplicateMatches[0].incident.id;
      isDuplicate = true;
    }

    let parentIncident: Incident | undefined;

    if (assignedIncidentId) {
      // Link to existing incident
      parentIncident = db.getIncidentById(assignedIncidentId);
      if (parentIncident) {
        parentIncident.reportsCount += 1;
        if (!parentIncident.reportIds.includes(reportId)) {
          parentIncident.reportIds.push(reportId);
        }
        parentIncident.status = 'duplicate_linked';
        db.updateIncident(parentIncident.id, parentIncident);
      }
    } else {
      // 3. Create NEW Incident
      const incidentId = `inc-${Date.now()}`;
      const incidentNumber = `INC-2026-10-${Math.floor(100 + Math.random() * 900)}`;
      const department = mapCategoryToDepartment(category);

      // Check recurrence on nearby assets
      const assets = db.getStore().assets;
      const matchedAsset = assets.find(
        (a) => a.category === category && a.zone === (location.zone || 'Mahadevapura')
      ) || assets[0];

      const recurrenceCount = matchedAsset ? matchedAsset.totalIncidentsCount + 1 : 1;

      // Priority calculation
      const priorityScore = calculateExplainablePriority({
        severity: aiScreening.estimatedSeverity,
        category,
        isHighSpeedCorridor: location.address?.toLowerCase().includes('outer ring road') || location.address?.toLowerCase().includes('hosur road'),
        recurrenceCount,
        confidenceScore: aiScreening.confidenceScore,
        isImmediateSafetyHazard: aiScreening.suggestedPriority === 'critical',
      });

      parentIncident = {
        id: incidentId,
        incidentNumber,
        title,
        category,
        description,
        location,
        assetId: matchedAsset?.id,
        status: 'submitted',
        priorityScore,
        assignedDepartment: department,
        reportsCount: 1,
        reportIds: [reportId],
        recurrenceCount,
        daysSinceLastRepair: matchedAsset?.lastRepairedAt ? Math.round((Date.now() - new Date(matchedAsset.lastRepairedAt).getTime()) / (1000 * 3600 * 24)) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.createIncident(parentIncident);
      assignedIncidentId = incidentId;
    }

    // 4. Save Report
    const newReport: Report = {
      id: reportId,
      complaintId,
      title,
      category,
      description,
      location,
      evidence: evidence || [
        {
          id: `ev-${Date.now()}`,
          type: 'before_photo',
          url: firstPhotoUrl,
          filename: 'complaint_photo.jpg',
          timestamp: new Date().toISOString(),
          uploadedBy: citizenContact?.name || 'Citizen',
        },
      ],
      citizenContact,
      consentGiven: !!consentGiven,
      status: isDuplicate ? 'duplicate_linked' : 'submitted',
      incidentId: assignedIncidentId,
      isDuplicate,
      aiScreening,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createReport(newReport);

    // Audit Log & Notification
    db.addAuditLog({
      actorId: citizenContact?.name || 'Citizen',
      actorName: citizenContact?.name || 'Anonymous Citizen',
      actorRole: 'citizen',
      action: 'SUBMIT_COMPLAINT',
      targetType: 'Report',
      targetId: reportId,
      details: `Complaint ${complaintId} created (${category}). Duplicate status: ${isDuplicate ? 'LINKED' : 'NEW INCIDENT'}.`,
    });

    db.addNotification({
      role: 'department_officer',
      title: `New Incident Reported: ${complaintId}`,
      message: `${title} at ${location.address}. AI Severity: ${aiScreening.estimatedSeverity.toUpperCase()}`,
      link: `/dashboard/complaints/${parentIncident?.id || reportId}`,
      type: 'info',
    });

    return NextResponse.json({
      success: true,
      complaintId,
      report: newReport,
      incident: parentIncident,
      aiScreening,
      duplicateMatches: isDuplicate ? [] : duplicateMatches,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to submit complaint' },
      { status: 500 }
    );
  }
}
