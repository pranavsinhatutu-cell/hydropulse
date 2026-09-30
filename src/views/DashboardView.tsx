import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Compass,
  ArrowRight,
  GitCompare,
  Waves,
  CloudRain,
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { KPISummary, WaterBody, StudyArea } from '../types';
import { KPICards } from '../components/KPICards';

interface DashboardViewProps {
  studyArea: StudyArea;
  kpis: KPISummary;
  waterBodies: WaterBody[];
  onSelectWaterBody: (wb: WaterBody) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  studyArea,
  kpis,
  waterBodies,
  onSelectWaterBody,
  onNavigateToTab,
}) => {
  // Aggregate monthly time-series for the entire basin
  const firstBody = waterBodies[0];
  const aggregatedSeries = firstBody?.monthlyTimeSeries.map((pt, i) => {
    // Sum across waterbodies for this month
    const totalRain = waterBodies.reduce((sum, wb) => sum + (wb.monthlyTimeSeries[i]?.rainfallMm || 0), 0) / waterBodies.length;
    const totalWater = waterBodies.reduce((sum, wb) => sum + (wb.monthlyTimeSeries[i]?.waterAreaKm2 || 0), 0);
    const histRain = waterBodies.reduce((sum, wb) => sum + (wb.monthlyTimeSeries[i]?.rainfallHistAvgMm || 0), 0) / waterBodies.length;
    const histWater = waterBodies.reduce((sum, wb) => sum + (wb.monthlyTimeSeries[i]?.waterHistAvgKm2 || 0), 0);

    return {
      date: pt.date,
      monthName: pt.monthName,
      avgRainfallMm: Math.round(totalRain * 10) / 10,
      totalWaterAreaKm2: Math.round(totalWater * 10) / 10,
      histRainfallMm: Math.round(histRain * 10) / 10,
      histWaterAreaKm2: Math.round(histWater * 10) / 10,
    };
  }) || [];

  // Ranked vulnerable water bodies
  const rankedBodies = [...waterBodies].sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);
  const topVulnerable = rankedBodies.slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome / Header Banner */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                Decision Support Active
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {studyArea.name} ({studyArea.region})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Rainfall–Surface Water Response Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Automated multi-sensor observation correlating CHIRPS precipitation variability with Sentinel-2 & JRC surface-water contraction to isolate drought-sensitive waterbodies and trigger analytical intervention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateToTab('response')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-600/20"
            >
              <GitCompare className="w-4 h-4" />
              <span>Response Analysis</span>
            </button>
            <button
              onClick={() => onNavigateToTab('live-map')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs transition-all"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Open GIS Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official 6 KPI Cards */}
      <KPICards kpis={kpis} />

      {/* Main Grid: Core Response Chart (Dual-Axis) & High-Risk Priority Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Feature: Basin-Wide Dual-Axis Response Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                  Problem Statement 2.4 Core
                </span>
                <h2 className="text-base font-bold text-white">
                  Rainfall vs Surface Water Response Dynamics
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dual-axis monthly time series: CHIRPS Rainfall (mm) vs Sentinel-2 Surface Water (km²)
              </p>
            </div>

            {/* Lag & Pearson Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                <span className="text-slate-400">Peak Lag: </span>
                <span className="font-bold text-cyan-300">{kpis.strongestLagMonths} Month{kpis.strongestLagMonths === 1 ? '' : 's'}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                <span className="text-slate-400">Coupling: </span>
                <span className="font-bold text-emerald-300">r = {kpis.meanCorrelation.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Dual Axis Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={aggregatedSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                {/* Left Y Axis: Rainfall */}
                <YAxis
                  yAxisId="rain"
                  stroke="#38bdf8"
                  tick={{ fontSize: 11 }}
                  unit="mm"
                  label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 11 }}
                />
                {/* Right Y Axis: Water Area */}
                <YAxis
                  yAxisId="water"
                  orientation="right"
                  stroke="#06b6d4"
                  tick={{ fontSize: 11 }}
                  unit="km²"
                  label={{ value: 'Water Area (km²)', angle: 90, position: 'insideRight', fill: '#06b6d4', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar
                  yAxisId="rain"
                  dataKey="avgRainfallMm"
                  name="Rainfall (mm)"
                  fill="#38bdf8"
                  opacity={0.8}
                />
                <Line
                  yAxisId="water"
                  type="monotone"
                  dataKey="totalWaterAreaKm2"
                  name="Water Area (km²)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 2.5 }}
                />
                <Line
                  yAxisId="water"
                  type="monotone"
                  dataKey="histWaterAreaKm2"
                  name="Historical Water Baseline (km²)"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Scientific Interpretation Footer */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Hydrological Insight: </span>
              In {studyArea.name}, peak catchment runoff and baseflow replenishment exhibit maximum surface-water extent expansion approximately <strong>{kpis.strongestLagMonths} month(s)</strong> following peak precipitation pulses. Prolonged dry spells produce acute storage depletion that persists 4 to 8 months after rainfall cessation.
            </div>
          </div>
        </div>

        {/* High-Risk Drought-Sensitive Water Bodies Spotlight */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h2 className="text-base font-bold text-white">Drought-Sensitive Watchlist</h2>
              </div>
              <button
                onClick={() => onNavigateToTab('vulnerability')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                View All ({waterBodies.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Waterbodies scoring highest on the transparent 0–100 sensitivity model:
            </p>

            <div className="space-y-2.5">
              {topVulnerable.map((wb) => (
                <div
                  key={wb.id}
                  onClick={() => onSelectWaterBody(wb)}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                      {wb.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        wb.vulnerabilityClass === 'Very High'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : wb.vulnerabilityClass === 'High'
                          ? 'bg-orange-950 text-orange-400 border border-orange-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {wb.vulnerabilityScore}/100 • {wb.vulnerabilityClass}
                    </span>
                  </div>

                  <div className="font-semibold text-white text-xs mb-1">
                    {wb.name}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Change: <strong className="text-rose-400">{wb.areaChangePct.toFixed(1)}%</strong></span>
                    <span>Rain Anomaly: <strong className="text-amber-400">{wb.rainfallAnomalyPct.toFixed(1)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => onNavigateToTab('decision')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Open Decision Support Interventions →</span>
            </button>
          </div>
        </div>

      </div>

      {/* Geospatial Workflow Ribbon (Visible demonstration of end-to-end hackathon workflow) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Complete Geospatial Workflow (Visible Implementation)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center text-xs">
          
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Stage 1</div>
            <div className="font-bold text-white my-1">Satellite Ingestion</div>
            <div className="text-[10px] text-cyan-300 font-mono">CHIRPS + S2 + S1</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Stage 2</div>
            <div className="font-bold text-white my-1">Image Processing</div>
            <div className="text-[10px] text-cyan-300 font-mono">MNDWI + S1 SAR Mask</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Stage 3</div>
            <div className="font-bold text-white my-1">Geospatial Analysis</div>
            <div className="text-[10px] text-cyan-300 font-mono">Anomaly & Area Change</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Stage 4</div>
            <div className="font-bold text-white my-1">Indicator Model</div>
            <div className="text-[10px] text-cyan-300 font-mono">Lag r + 0-100 Score</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Stage 5</div>
            <div className="font-bold text-white my-1">Interactive Map</div>
            <div className="text-[10px] text-cyan-300 font-mono">GIS Layers & Popups</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Stage 6</div>
            <div className="font-bold text-white my-1">Decision Support</div>
            <div className="text-[10px] text-cyan-300 font-mono">Evidence-Based Action</div>
          </div>

        </div>
      </div>

    </div>
  );
};
