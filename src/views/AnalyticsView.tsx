import React, { useState } from 'react';
import {
  BarChart3,
  Filter,
  PieChart as PieIcon,
  TrendingDown,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from 'recharts';
import { WaterBody, StudyArea } from '../types';

interface AnalyticsViewProps {
  studyArea: StudyArea;
  waterBodies: WaterBody[];
  onSelectWaterBody: (wb: WaterBody) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  studyArea,
  waterBodies,
  onSelectWaterBody,
}) => {
  const [districtFilter, setDistrictFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  const districts = Array.from(new Set(waterBodies.map((w) => w.district)));

  // Filtered set
  const filtered = waterBodies.filter((wb) => {
    const matchesDistrict = districtFilter === 'all' || wb.district === districtFilter;
    const matchesClass = classFilter === 'all' || wb.vulnerabilityClass === classFilter;
    return matchesDistrict && matchesClass;
  });

  // 1. Vulnerability distribution
  const classCounts = [
    { name: 'Low (0-25)', count: waterBodies.filter((w) => w.vulnerabilityClass === 'Low').length, color: '#22c55e' },
    { name: 'Moderate (26-50)', count: waterBodies.filter((w) => w.vulnerabilityClass === 'Moderate').length, color: '#eab308' },
    { name: 'High (51-75)', count: waterBodies.filter((w) => w.vulnerabilityClass === 'High').length, color: '#f97316' },
    { name: 'Very High (76-100)', count: waterBodies.filter((w) => w.vulnerabilityClass === 'Very High').length, color: '#ef4444' },
  ];

  // 2. Correlation vs Water Loss comparison per water body
  const correlationLossData = filtered.map((wb) => ({
    name: wb.name.length > 15 ? `${wb.name.slice(0, 14)}...` : wb.name,
    id: wb.id,
    correlation: wb.correlation,
    waterLossPct: wb.waterLossPct,
    vulnerabilityScore: wb.vulnerabilityScore,
  }));

  // 3. Lag distribution histogram
  const lagDist = [
    { lag: '0-Mo Lag', count: waterBodies.filter((w) => w.optimalLagMonths === 0).length },
    { lag: '1-Mo Lag', count: waterBodies.filter((w) => w.optimalLagMonths === 1).length },
    { lag: '2-Mo Lag', count: waterBodies.filter((w) => w.optimalLagMonths === 2).length },
    { lag: '3-Mo Lag', count: waterBodies.filter((w) => w.optimalLagMonths === 3).length },
  ];

  // 4. District aggregated area loss
  const districtLoss = districts.map((dist) => {
    const dBodies = waterBodies.filter((w) => w.district === dist);
    const avgLoss = dBodies.reduce((s, b) => s + b.areaChangePct, 0) / (dBodies.length || 1);
    const avgScore = dBodies.reduce((s, b) => s + b.vulnerabilityScore, 0) / (dBodies.length || 1);
    return {
      district: dist,
      avgLossPct: Math.round(avgLoss * 10) / 10,
      avgScore: Math.round(avgScore),
      waterBodiesCount: dBodies.length,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Cross-Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Cross-Metric Geospatial Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Interactive multi-variable synthesis across districts, lag response horizons, and vulnerability classes
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Districts ({districts.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Vulnerability Classes</option>
            <option value="Very High">Very High</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Row 1: Vulnerability Class Distribution (Pie) & Lag Distribution (Bar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Vulnerability Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Drought Sensitivity Class Distribution</h2>
            <p className="text-xs text-slate-400 mt-0.5">Partition of analyzed water bodies across severity tiers</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classCounts}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => `${entry.name}: ${entry.value}`}
                >
                  {classCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Optimal Lag Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Catchment Response Latency (Lag Distribution)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Frequency of peak rainfall-water correlation lag horizons</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lagDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="lag" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="count" name="Water Bodies Count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Water Loss vs Correlation Sensitivity Comparison */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">
            Water Loss (%) vs Sensitivity Score Across Filtered Water Bodies
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Displaying {filtered.length} water bodies in selected scope
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={correlationLossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="id" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="waterLossPct" name="Water Loss (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vulnerabilityScore" name="Sensitivity Score (0-100)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: District Aggregated Vulnerability Summary */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Administrative District Vulnerability Aggregate</h2>
          <p className="text-xs text-slate-400 mt-0.5">Comparing regional average surface water shrinkage and sensitivity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {districtLoss.map((d) => (
            <div key={d.district} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="font-bold text-white text-sm mb-1">{d.district}</div>
              <div className="text-xs text-slate-400 mb-2">{d.waterBodiesCount} Water Bodies</div>
              <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="text-slate-400">Avg Area Change:</span>
                <span className={`font-bold ${d.avgLossPct < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {d.avgLossPct > 0 ? '+' : ''}{d.avgLossPct}%
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-400">Mean Sensitivity:</span>
                <span className="font-bold text-cyan-300">{d.avgScore} / 100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
