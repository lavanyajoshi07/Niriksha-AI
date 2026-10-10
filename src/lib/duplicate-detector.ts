import { LocationData, InfrastructureCategory, Report, Incident } from '@/types';

// Haversine distance in meters
export function calculateDistanceMeters(loc1: LocationData, loc2: LocationData): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.latitude * Math.PI) / 180) *
      Math.cos((loc2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface DuplicateMatchResult {
  incident: Incident;
  distanceMeters: number;
  timeDiffHours: number;
  matchScore: number; // 0 to 100
  reason: string;
}

export function detectDuplicateIncidents(
  targetLocation: LocationData,
  category: InfrastructureCategory,
  existingIncidents: Incident[],
  maxDistanceMeters: number = 300
): DuplicateMatchResult[] {
  const matches: DuplicateMatchResult[] = [];
  const now = new Date().getTime();

  for (const inc of existingIncidents) {
    if (inc.status === 'verified_fixed' || inc.status === 'rejected') continue;

    const dist = calculateDistanceMeters(targetLocation, inc.location);
    if (dist > maxDistanceMeters) continue;

    const incTime = new Date(inc.createdAt).getTime();
    const diffHours = Math.round(Math.abs(now - incTime) / (1000 * 60 * 60));

    let matchScore = 0;

    // Category match
    if (inc.category === category) {
      matchScore += 40;
    } else {
      matchScore += 10;
    }

    // Distance score (closer = higher score)
    if (dist <= 50) matchScore += 45;
    else if (dist <= 150) matchScore += 30;
    else matchScore += 15;

    // Time recency score
    if (diffHours <= 24) matchScore += 15;
    else if (diffHours <= 72) matchScore += 10;

    if (matchScore >= 50) {
      matches.push({
        incident: inc,
        distanceMeters: dist,
        timeDiffHours: diffHours,
        matchScore,
        reason: `${dist}m away from active incident #${inc.incidentNumber} (${inc.category.replace('_', ' ')}) submitted ${diffHours}h ago.`,
      });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
