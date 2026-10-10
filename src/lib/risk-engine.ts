import { MaintenanceRecommendation } from '@/types';

export function calculateMaintenanceBudgetSummary(
  recommendations: MaintenanceRecommendation[],
  budgetLimit: number
) {
  const selectedItems = recommendations.filter((r) => r.selectedForPlan);
  const totalCost = selectedItems.reduce((acc, curr) => acc + curr.estimatedCost, 0);
  const remainingBudget = budgetLimit - totalCost;
  const highRiskCount = selectedItems.filter((r) => r.riskCategory === 'High Risk').length;

  return {
    selectedCount: selectedItems.length,
    totalCost,
    remainingBudget,
    isOverBudget: remainingBudget < 0,
    highRiskCount,
    budgetUtilizationPercent: Math.min(100, Math.round((totalCost / budgetLimit) * 100)),
  };
}

export function exportMaintenancePlanCSV(recommendations: MaintenanceRecommendation[]): string {
  const selected = recommendations.filter((r) => r.selectedForPlan);
  const headers = [
    'Recommendation ID',
    'Asset Name',
    'Location Name',
    'Category',
    'Risk Category',
    'Safety Priority',
    'Recurrence Count',
    'Days Since Last Repair',
    'Estimated Cost (INR)',
    'Recommended Intervention',
  ];

  const rows = selected.map((r) => [
    `"${r.id}"`,
    `"${r.assetName.replace(/"/g, '""')}"`,
    `"${r.locationName.replace(/"/g, '""')}"`,
    `"${r.category}"`,
    `"${r.riskCategory}"`,
    `"${r.safetyPriority}"`,
    r.recurrenceHistoryCount,
    r.daysSinceLastRepair || 'N/A',
    r.estimatedCost,
    `"${r.recommendedIntervention.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
