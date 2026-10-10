import mongoose from 'mongoose';
import { 
  User, Report, Incident, Asset, Inspection, WorkOrder, 
  RepairSubmission, VerificationReview, MaintenanceRecommendation, 
  AuditLog, NotificationItem 
} from '@/types';
import { 
  INITIAL_USERS, INITIAL_REPORTS, INITIAL_INCIDENTS, 
  INITIAL_ASSETS, INITIAL_MAINTENANCE_RECOMMENDATIONS, 
  INITIAL_AUDIT_LOGS, INITIAL_NOTIFICATIONS 
} from './seed-data';

// Global memory cache for Next.js dev server hot reload
declare global {
  var _bharatSentinelStore: {
    users: User[];
    reports: Report[];
    incidents: Incident[];
    assets: Asset[];
    maintenanceRecs: MaintenanceRecommendation[];
    auditLogs: AuditLog[];
    notifications: NotificationItem[];
    budgetLimit: number;
  } | undefined;
}

function initStore() {
  if (!global._bharatSentinelStore) {
    global._bharatSentinelStore = {
      users: [...INITIAL_USERS],
      reports: [...INITIAL_REPORTS],
      incidents: [...INITIAL_INCIDENTS],
      assets: [...INITIAL_ASSETS],
      maintenanceRecs: [...INITIAL_MAINTENANCE_RECOMMENDATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      notifications: [...INITIAL_NOTIFICATIONS],
      budgetLimit: 5000000, // ₹50 Lakhs default demo budget
    };
  }
  return global._bharatSentinelStore;
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri && !uri.includes('localhost')) {
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
        console.log('[BharatSentinelDB] Connected to MongoDB');
      }
    } catch (err) {
      console.warn('[BharatSentinelDB] MongoDB connection fallback to memory store:', err);
    }
  }
  return initStore();
}

// Database helper functions
export const db = {
  getStore: () => initStore(),

  resetToDemo: () => {
    global._bharatSentinelStore = {
      users: [...INITIAL_USERS],
      reports: [...INITIAL_REPORTS],
      incidents: [...INITIAL_INCIDENTS],
      assets: [...INITIAL_ASSETS],
      maintenanceRecs: [...INITIAL_MAINTENANCE_RECOMMENDATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      notifications: [...INITIAL_NOTIFICATIONS],
      budgetLimit: 5000000,
    };
    return global._bharatSentinelStore;
  },

  // Users
  getUsers: () => initStore().users,
  getUserById: (id: string) => initStore().users.find((u) => u.id === id || u.email === id),
  getUserByRole: (role: string) => initStore().users.find((u) => u.role === role),

  // Reports
  getReports: () => initStore().reports,
  getReportById: (id: string) => 
    initStore().reports.find((r) => r.id === id || r.complaintId === id),
  createReport: (report: Report) => {
    const store = initStore();
    store.reports.unshift(report);
    return report;
  },
  updateReportStatus: (id: string, status: Report['status']) => {
    const store = initStore();
    const rep = store.reports.find((r) => r.id === id || r.complaintId === id);
    if (rep) {
      rep.status = status;
      rep.updatedAt = new Date().toISOString();
    }
    return rep;
  },

  // Incidents
  getIncidents: () => initStore().incidents,
  getIncidentById: (id: string) => 
    initStore().incidents.find((inc) => inc.id === id || inc.incidentNumber === id),
  createIncident: (incident: Incident) => {
    const store = initStore();
    store.incidents.unshift(incident);
    return incident;
  },
  updateIncident: (id: string, updates: Partial<Incident>) => {
    const store = initStore();
    const inc = store.incidents.find((i) => i.id === id || i.incidentNumber === id);
    if (inc) {
      Object.assign(inc, updates, { updatedAt: new Date().toISOString() });
    }
    return inc;
  },

  // Inspections
  saveInspection: (incidentId: string, inspection: Inspection) => {
    const store = initStore();
    const inc = store.incidents.find((i) => i.id === incidentId);
    if (inc) {
      inc.inspection = inspection;
      inc.status = 'under_review';
      inc.updatedAt = new Date().toISOString();
    }
    return inc;
  },

  // Repair Submission
  saveRepairSubmission: (incidentId: string, repair: RepairSubmission) => {
    const store = initStore();
    const inc = store.incidents.find((i) => i.id === incidentId);
    if (inc) {
      inc.repairSubmission = repair;
      inc.status = 'completion_claimed';
      inc.updatedAt = new Date().toISOString();
    }
    return inc;
  },

  // Verification Review
  saveVerificationReview: (incidentId: string, review: VerificationReview) => {
    const store = initStore();
    const inc = store.incidents.find((i) => i.id === incidentId);
    if (inc) {
      inc.verificationReview = review;
      inc.status = review.finalStatus;
      inc.updatedAt = new Date().toISOString();
      
      // Update report statuses linked to this incident
      store.reports.forEach((r) => {
        if (r.incidentId === incidentId) {
          r.status = review.finalStatus;
          r.updatedAt = new Date().toISOString();
        }
      });
    }
    return inc;
  },

  // Maintenance Recommendations
  getMaintenanceRecs: () => initStore().maintenanceRecs,
  updateMaintenanceSelection: (recId: string, selected: boolean) => {
    const store = initStore();
    const rec = store.maintenanceRecs.find((r) => r.id === recId);
    if (rec) {
      rec.selectedForPlan = selected;
    }
    return store.maintenanceRecs;
  },
  getBudgetLimit: () => initStore().budgetLimit,
  setBudgetLimit: (limit: number) => {
    const store = initStore();
    store.budgetLimit = limit;
    return limit;
  },

  // Audit Logs
  getAuditLogs: () => initStore().auditLogs,
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const store = initStore();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    store.auditLogs.unshift(newLog);
    return newLog;
  },

  // Notifications
  getNotifications: (role?: string) => {
    const store = initStore();
    if (role) {
      return store.notifications.filter((n) => !n.role || n.role === role);
    }
    return store.notifications;
  },
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const store = initStore();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notif,
    };
    store.notifications.unshift(newNotif);
    return newNotif;
  },
  markNotificationRead: (id: string) => {
    const store = initStore();
    const n = store.notifications.find((item) => item.id === id);
    if (n) n.read = true;
    return store.notifications;
  },
};
