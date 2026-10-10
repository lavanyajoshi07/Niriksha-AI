import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateMaintenanceBudgetSummary, exportMaintenancePlanCSV } from '@/lib/risk-engine';

export async function GET(req: NextRequest) {
  const recommendations = db.getMaintenanceRecs();
  const budgetLimit = db.getBudgetLimit();
  const summary = calculateMaintenanceBudgetSummary(recommendations, budgetLimit);

  return NextResponse.json({
    success: true,
    budgetLimit,
    recommendations,
    summary,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, recId, selected, budgetLimit } = body;

    if (budgetLimit !== undefined) {
      db.setBudgetLimit(Number(budgetLimit));
    }

    if (recId !== undefined && selected !== undefined) {
      db.updateMaintenanceSelection(recId, Boolean(selected));
    }

    const recommendations = db.getMaintenanceRecs();
    const currentBudget = db.getBudgetLimit();
    const summary = calculateMaintenanceBudgetSummary(recommendations, currentBudget);

    if (action === 'export_csv') {
      const csvContent = exportMaintenancePlanCSV(recommendations);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="bharat_sentinel_maintenance_plan_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      budgetLimit: currentBudget,
      recommendations,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
