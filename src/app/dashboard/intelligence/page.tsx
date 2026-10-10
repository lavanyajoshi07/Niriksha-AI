'use client';

import { useState, useEffect } from 'react';
import { 
  Cpu, DollarSign, Download, CheckSquare, Square, 
  AlertTriangle, ShieldCheck, BarChart2, Calculator
} from 'lucide-react';
import { MaintenanceRecommendation } from '@/types';

export default function MaintenancePlannerPage() {
  const [recommendations, setRecommendations] = useState<MaintenanceRecommendation[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(5000000); // ₹50 Lakhs
  const [loading, setLoading] = useState(true);

  const fetchPlan = () => {
    fetch('/api/maintenance/plan')
      .then((res) => res.json())
      .then((data) => {
        if (data.recommendations) setRecommendations(data.recommendations);
        if (data.budgetLimit) setBudgetLimit(data.budgetLimit);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const toggleSelection = async (recId: string, currentSelected?: boolean) => {
    try {
      const res = await fetch('/api/maintenance/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recId,
          selected: !currentSelected,
        }),
      });
      const data = await res.json();
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBudgetChange = async (newLimit: number) => {
    setBudgetLimit(newLimit);
    try {
      await fetch('/api/maintenance/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetLimit: newLimit }),
      });
    } catch (err) {}
  };

  const handleExportCSV = () => {
    window.open('/api/maintenance/plan?export=true', '_blank');
    const selected = recommendations.filter((r) => r.selectedForPlan);
    const headers = ['ID', 'Asset', 'Location', 'Risk', 'Cost (INR)', 'Intervention'];
    const rows = selected.map((r) => [r.id, r.assetName, r.locationName, r.riskCategory, r.estimatedCost, r.recommendedIntervention]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bharat_sentinel_maintenance_plan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedItems = recommendations.filter((r) => r.selectedForPlan);
  const totalCost = selectedItems.reduce((acc, r) => acc + r.estimatedCost, 0);
  const remainingBudget = budgetLimit - totalCost;
  const utilizationPercent = Math.min(100, Math.round((totalCost / budgetLimit) * 100));

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading budget-aware maintenance planner...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-sky-400" />
            <span>Infrastructure Intelligence & Budget Maintenance Planner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prioritize capital interventions, balance municipal budgets, and export decision-support maintenance plans.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shrink-0 transition-colors shadow-lg flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Proposed Plan (CSV)</span>
        </button>
      </div>

      {/* Budget Allocation Widget */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-6 items-center shadow-xl">
        
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Allocated Municipal Maintenance Budget:
          </label>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold font-mono text-sky-400">
              ₹{(budgetLimit / 100000).toFixed(1)} Lakhs
            </span>
            <input
              type="range"
              min={1000000}
              max={15000000}
              step={500000}
              value={budgetLimit}
              onChange={(e) => handleBudgetChange(Number(e.target.value))}
              className="flex-1 accent-sky-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-1 border-l border-slate-800 pl-6">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Total Proposed Spend</span>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            ₹{(totalCost / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[10px] text-slate-400">{selectedItems.length} Interventions Selected</div>
        </div>

        <div className="space-y-1 border-l border-slate-800 pl-6">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Remaining Available Budget</span>
          <div className={`text-2xl font-extrabold font-mono ${remainingBudget >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
            ₹{(remainingBudget / 100000).toFixed(2)} Lakhs
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full ${utilizationPercent > 90 ? 'bg-rose-500' : 'bg-teal-400'}`}
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Recommended Interventions Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-sky-400" />
          <span>Prioritized Preventive Maintenance Recommendations</span>
        </h2>

        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                rec.selectedForPlan
                  ? 'bg-slate-950 border-sky-500/80 shadow-md ring-1 ring-sky-500/20'
                  : 'bg-slate-950/50 border-slate-850 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleSelection(rec.id, rec.selectedForPlan)}
                  className="mt-1 text-sky-400"
                >
                  {rec.selectedForPlan ? (
                    <CheckSquare className="w-5 h-5 text-sky-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      rec.riskCategory === 'High Risk' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {rec.riskCategory}
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      {rec.recurrenceHistoryCount}x Failure Recurrence
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-sm">{rec.assetName}</h3>
                  <p className="text-xs text-slate-400">{rec.locationName}</p>
                  
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-sky-300 mt-2 font-semibold">
                    Recommended: {rec.recommendedIntervention}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated Cost</span>
                <span className="text-lg font-extrabold font-mono text-white">
                  ₹{(rec.estimatedCost / 100000).toFixed(2)} Lakhs
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
