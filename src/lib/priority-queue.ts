import { PriorityLevel, PriorityScoreBreakdown, InfrastructureCategory } from '@/types';

export interface PriorityInput {
  severity: 'low' | 'medium' | 'high';
  category: InfrastructureCategory;
  isHighSpeedCorridor?: boolean;
  isNearSchoolOrHospital?: boolean;
  recurrenceCount: number;
  confidenceScore: number; // 0-100
  isImmediateSafetyHazard?: boolean;
}

export function calculateExplainablePriority(input: PriorityInput): PriorityScoreBreakdown {
  // 1. Damage Severity Score (30%)
  let damageSeverity = 40;
  if (input.severity === 'high') damageSeverity = 95;
  else if (input.severity === 'medium') damageSeverity = 70;
  else damageSeverity = 35;

  // 2. Immediate Safety Risk Score (25%)
  let immediateSafetyRisk = 45;
  if (input.isImmediateSafetyHazard) immediateSafetyRisk = 100;
  else if (input.category === 'pothole' && input.severity === 'high') immediateSafetyRisk = 90;
  else if (input.category === 'waterlogging' || input.category === 'bridge_structural') immediateSafetyRisk = 88;
  else if (input.severity === 'high') immediateSafetyRisk = 75;
  else if (input.severity === 'medium') immediateSafetyRisk = 50;

  // 3. Public Impact Score (20%)
  let publicImpact = 50;
  if (input.isHighSpeedCorridor) publicImpact += 30;
  if (input.isNearSchoolOrHospital) publicImpact += 20;
  if (input.category === 'blocked_drain' || input.category === 'waterlogging') publicImpact += 15;
  publicImpact = Math.min(100, Math.max(20, publicImpact));

  // 4. Verified Recurrence Score (15%)
  let verifiedRecurrence = 10;
  if (input.recurrenceCount >= 5) verifiedRecurrence = 100;
  else if (input.recurrenceCount >= 3) verifiedRecurrence = 80;
  else if (input.recurrenceCount >= 1) verifiedRecurrence = 55;

  // 5. Evidence Confidence Score (10%)
  const evidenceConfidence = Math.min(100, Math.max(30, input.confidenceScore));

  // Calculate Weighted Sum
  const weightedScore = (
    damageSeverity * 0.30 +
    immediateSafetyRisk * 0.25 +
    publicImpact * 0.20 +
    verifiedRecurrence * 0.15 +
    evidenceConfidence * 0.10
  );

  const finalScore = Math.round(weightedScore * 10) / 10;

  // Safety Escalation Rule
  const escalatedForSafety = 
    input.isImmediateSafetyHazard || 
    (input.severity === 'high' && input.category === 'pothole' && (input.isHighSpeedCorridor || input.recurrenceCount >= 3)) ||
    (input.category === 'bridge_structural' && input.severity === 'high');

  let priorityLevel: PriorityLevel = 'low';
  if (escalatedForSafety || finalScore >= 85) {
    priorityLevel = 'critical';
  } else if (finalScore >= 70) {
    priorityLevel = 'high';
  } else if (finalScore >= 50) {
    priorityLevel = 'medium';
  } else {
    priorityLevel = 'low';
  }

  // Generate Human-Readable Rationale
  const reasons: string[] = [];
  reasons.push(`Damage Severity (${damageSeverity}/100 - Weight 30%)`);
  reasons.push(`Safety Hazard Risk (${immediateSafetyRisk}/100 - Weight 25%)`);
  reasons.push(`Public Disruption Impact (${publicImpact}/100 - Weight 20%)`);
  if (input.recurrenceCount > 0) {
    reasons.push(`Recurrence Frequency: ${input.recurrenceCount} repeat failures on asset`);
  }

  let explanation = `Scored ${finalScore}/100 based on weighted multi-factor risk assessment. `;
  if (escalatedForSafety) {
    explanation += `ESCALATED TO CRITICAL: High-speed corridor / repeat structural risk threshold triggered safety override.`;
  } else {
    explanation += `Categorized as ${priorityLevel.toUpperCase()} priority for engineering intervention.`;
  }

  let recommendedAction = 'Schedule routine department queue review within 48 hours.';
  if (priorityLevel === 'critical') {
    recommendedAction = 'DEPLOYS EMERGENCY REPAIR TEAM WITHIN 6 HOURS. Set traffic warning barriers immediately.';
  } else if (priorityLevel === 'high') {
    recommendedAction = 'Issue Work Order to Field Inspector within 24 hours.';
  } else if (priorityLevel === 'medium') {
    recommendedAction = 'Include in upcoming weekly municipal maintenance bundle.';
  }

  return {
    finalScore,
    priorityLevel,
    factorScores: {
      damageSeverity,
      immediateSafetyRisk,
      publicImpact,
      verifiedRecurrence,
      evidenceConfidence: Math.round(evidenceConfidence),
    },
    explanation,
    escalatedForSafety,
    recommendedAction,
  };
}
