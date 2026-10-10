export type UserRole = 'citizen' | 'field_inspector' | 'department_officer' | 'administrator';

export type InfrastructureCategory = 
  | 'pothole'
  | 'road_crack'
  | 'damaged_road'
  | 'blocked_drain'
  | 'waterlogging'
  | 'damaged_public_infrastructure'
  | 'bridge_structural'
  | 'street_lighting';

export type ComplaintStatus = 
  | 'submitted'
  | 'screening'
  | 'under_review'
  | 'verified'
  | 'assigned'
  | 'repair_in_progress'
  | 'completion_claimed'
  | 'verified_fixed'
  | 'rejected'
  | 'duplicate_linked'
  | 'verification_disputed'
  | 'reopened';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export type DepartmentName = 
  | 'Roads & Bridges (PWD)'
  | 'Stormwater Drains (BBMP)'
  | 'Water Supply & Sewerage (BWSSB)'
  | 'Electrical & Lighting (BESCOM)'
  | 'Urban Transport & Traffic'
  | 'General Maintenance';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  city: string;
  zone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: DepartmentName;
  phone?: string;
  badgeId?: string;
  avatarUrl?: string;
}

export interface Evidence {
  id: string;
  type: 'before_photo' | 'after_photo' | 'inspection_photo';
  url: string;
  filename: string;
  timestamp: string;
  location?: LocationData;
  hash?: string;
  uploadedBy: string;
}

export interface AIScreeningResult {
  detectedCategory: InfrastructureCategory;
  categoryLabel: string;
  estimatedSeverity: 'low' | 'medium' | 'high';
  confidenceScore: number; // 0 to 100
  suggestedPriority: PriorityLevel;
  explanation: string;
  isDemoMode: boolean;
  reviewedByInspector?: boolean;
  correctedSeverity?: 'low' | 'medium' | 'high';
  correctedCategory?: InfrastructureCategory;
  detectedFeatures?: string[];
}

export interface PriorityScoreBreakdown {
  finalScore: number; // 0 to 100
  priorityLevel: PriorityLevel;
  factorScores: {
    damageSeverity: number;    // weight 30%
    immediateSafetyRisk: number; // weight 25%
    publicImpact: number;        // weight 20%
    verifiedRecurrence: number;  // weight 15%
    evidenceConfidence: number;  // weight 10%
  };
  explanation: string;
  escalatedForSafety: boolean;
  recommendedAction: string;
}

export interface Report {
  id: string;
  complaintId: string;
  title: string;
  category: InfrastructureCategory;
  description: string;
  location: LocationData;
  evidence: Evidence[];
  citizenContact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  consentGiven: boolean;
  status: ComplaintStatus;
  incidentId?: string;
  isDuplicate?: boolean;
  primaryReportId?: string;
  aiScreening?: AIScreeningResult;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  category: InfrastructureCategory;
  description: string;
  location: LocationData;
  assetId?: string;
  status: ComplaintStatus;
  priorityScore: PriorityScoreBreakdown;
  assignedDepartment: DepartmentName;
  assignedInspectorId?: string;
  assignedContractorId?: string;
  reportsCount: number;
  reportIds: string[];
  recurrenceCount: number;
  lastRepairedAt?: string;
  daysSinceLastRepair?: number;
  previousWorkOrders?: string[];
  inspection?: Inspection;
  workOrder?: WorkOrder;
  repairSubmission?: RepairSubmission;
  verificationReview?: VerificationReview;
  disputeNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  incidentId: string;
  inspectorId: string;
  inspectorName: string;
  inspectedAt: string;
  verifiedSeverity: 'low' | 'medium' | 'high';
  notes: string;
  recommendedRepairMethod: string;
  estimatedCost: number; // INR
  photos: Evidence[];
  submittedForReview: boolean;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  incidentId: string;
  department: DepartmentName;
  contractorName: string;
  assignedDate: string;
  targetCompletionDate: string;
  estimatedBudget: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  instructions: string;
}

export interface RepairSubmission {
  id: string;
  incidentId: string;
  submittedBy: string;
  submittedAt: string;
  repairMethod: string;
  actualCost: number; // INR
  workOrderRef?: string;
  afterPhotos: Evidence[];
  notes: string;
}

export interface VerificationCheck {
  code: string;
  label: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
}

export interface VerificationReview {
  id: string;
  incidentId: string;
  reviewerId: string;
  reviewerName: string;
  reviewedAt: string;
  decision: 'passed' | 'needs_review' | 'disputed';
  finalStatus: 'verified_fixed' | 'verification_disputed' | 'reopened' | 'under_review';
  checks: VerificationCheck[];
  reviewReason: string;
  visualDiffScore?: number; // 0 to 100 similarity/diff metric
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: InfrastructureCategory;
  location: LocationData;
  roadName: string;
  zone: string;
  totalIncidentsCount: number;
  totalRepairCost: number;
  lastRepairedAt?: string;
  healthScore: number; // 0 to 100
  riskLevel: 'high' | 'medium' | 'low';
}

export interface MaintenanceRecommendation {
  id: string;
  assetId: string;
  assetName: string;
  locationName: string;
  category: InfrastructureCategory;
  riskCategory: 'High Risk' | 'Medium Risk' | 'Monitored';
  contributingFactors: string[];
  recommendedIntervention: string;
  estimatedCost: number; // INR
  safetyPriority: PriorityLevel;
  recurrenceHistoryCount: number;
  daysSinceLastRepair?: number;
  selectedForPlan?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'Report' | 'Incident' | 'Inspection' | 'Repair' | 'Verification' | 'User' | 'Asset';
  targetId: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  role?: UserRole;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  type: 'info' | 'warning' | 'success' | 'alert';
}
