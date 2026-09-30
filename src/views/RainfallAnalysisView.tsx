import React, { useState } from 'react';
import {
  CloudRain,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers,
  Filter,
  BarChart2,
  Info,
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
  Cell,
  ReferenceLine,
} from 'recharts';
import { WaterBody, StudyArea } from '../types';

interface RainfallAnalysisViewProps {
  studyArea: StudyArea;
  waterBodies: WaterBody[];
  selectedWaterBody: WaterBody | null;
  onSelectWaterBody: (wb: WaterBody) => void;
}

export const RainfallAnalysisView: React.FC<RainfallAnalysisViewProps> = ({
  studyArea,
  waterBodies,
  selectedWaterBody,
  onSelectWaterBody,
}) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'seasonal' | 'annual'>('monthly');
  const [activeBodyId, setActiveBodyId] = useState<string>(selectedWaterBody ? selectedWaterBody.id : 'all');

  // Selected or aggregated series
  const activeWb = waterBodies.find((w) => w.id === activeBodyId);

  // Compute monthly data for active selection
  const monthlyData = (activeWb ? activeWb.monthlyTimeSeries : waterBodies[0]?.monthlyTimeSeries || []).map((pt, idx) => {
    let observed = pt.rainfallMm;
    let hist = pt.rainfallHistAvgMm;

    if (!activeWb) {
      // Mean across all water bodies
      observed = Math.round((waterBodies.reduce((s, wb) => s + (wb.monthlyTimeSeries[idx]?.rainfallMm || 0), 0) / waterBodies.length) * 10) / 10;
      hist = Math.round((waterBodies.reduce((s, wb) => s + (wb.monthlyTimeSeries[idx]?.rainfallHistAvgMm || 0), 0) / waterBodies.length) * 10) / 10;
    }

    const anomalyMm = Math.round((observed - hist) * 10) / 10;
    const anomalyPct = hist > 0 ? Math.round(((observed - hist) / hist) * 1000) / 10 : 0;

    let anomalyCategory = 'Normal';
    if (anomalyPct < -25) anomalyCategory = 'Severe Deficit';
    else if (anomalyPct < -10) anomalyCategory = 'Below Normal';
    else if (anomalyPct > 10) anomalyCategory = 'Above Normal';

    return {
      date: pt.date,
      monthName: pt.monthName,
      observedRainfall: observed,
      histAverage: hist,
      anomalyMm,
      anomalyPct,
      anomalyCategory,
    };
  });

  // Seasonal Aggregation (DJF: Dec-Feb, MAM: Mar-May, JJA: Jun-Aug, SON: Sep-Nov)
  const seasonalData = [
    { season: 'Winter (Jan-Feb)', observed: 0, hist: 0, count: 0 },
    { season: 'Pre-Monsoon / Summer (Mar-May)', observed: 0, hist: 0, count: 0 },
    { season: 'SW Monsoon (Jun-Sep)', observed: 0, hist: 0, count: 0 },
    { season: 'NE / Post-Monsoon (Oct-Dec)', observed: 0, hist: 0, count: 0 },
  ];

  monthlyData.forEach((m) => {
    const monthNum = parseInt(m.date.split('-')[1]);
    if (monthNum <= 2) {
      seasonalData[0].observed += m.observedRainfall;
      seasonalData[0].hist += m.histAverage;
      seasonalData[0].count++;
    } else if (monthNum <= 5) {
      seasonalData[1].observed += m.observedRainfall;
      seasonalData[1].hist += m.histAverage;
      seasonalData[1].count++;
    } else if (monthNum <= 9) {
      seasonalData[2].observed += m.observedRainfall;
      seasonalData[2].hist += m.histAverage;
      seasonalData[2].count++;
    } else {
      seasonalData[3].observed += m.observedRainfall;
      seasonalData[3].hist += m.histAverage;
      seasonalData[3].count++;
    }
  });

  const processedSeasonal = seasonalData.map((s) => ({
    season: s.season,
    observedTotal: Math.round(s.observed),
    histTotal: Math.round(s.hist),
    anomalyPct: s.hist > 0 ? Math.round(((s.observed - s.hist) / s.hist) * 100) : 0,
  }));

  // Annual Aggregation (2022, 2023, 2024)
  const years = ['2022', '2023', '2024'];
  const annualData = years.map((yr) => {
    const yrPoints = monthlyData.filter((m) => m.date.startsWith(yr));
    const obsTotal = Math.round(yrPoints.reduce((s, p) => s + p.observedRainfall, 0));
    const histTotal = Math.round(yrPoints.reduce((s, p) => s + p.histAverage, 0));
    const anomalyPct = histTotal > 0 ? Math.round(((obsTotal - histTotal) / histTotal) * 1000) / 10 : 0;
    return {
      year: yr,
      observedAnnual: obsTotal,
      histAnnual: histTotal,
      anomalyPct,
    };
  });

  // Summary Metrics
  const totalObserved = monthlyData.reduce((s, p) => s + p.observedRainfall, 0);
  const totalHist = monthlyData.reduce((s, p) => s + p.histAverage, 0);
  const netAnomalyPct = totalHist > 0 ? Math.round(((totalObserved - totalHist) / totalHist) * 1000) / 10 : 0;
  const severeDeficitCount = monthlyData.filter((m) => m.anomalyPct < -25).length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/60">
              <CloudRain className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              CHIRPS Rainfall Time-Series & Anomaly Analysis
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Official Task 1: Gridded satellite precipitation extraction vs 30-year climatological baseline (1991–2020)
          </p>
        </div>

        {/* View Controls & Waterbody Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Target Selector */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target:</span>
            <select
              value={activeBodyId}
              onChange={(e) => {
                setActiveBodyId(e.target.value);
                const match = waterBodies.find((w) => w.id === e.target.value);
                if (match) onSelectWaterBody(match);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-100">
                Basin Average (All {waterBodies.length} Water Bodies)
              </option>
              {waterBodies.map((wb) => (
                <option key={wb.id} value={wb.id} className="bg-slate-900 text-slate-100">
                  {wb.id}: {wb.name}
                </option>
              ))}
            </select>
          </div>

          {/* Temporal Scale Buttons */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg text-xs border border-slate-700">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('seasonal')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'seasonal'
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Seasonal
            </button>
            <button
              onClick={() => setViewMode('annual')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'annual'
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Quick Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Precipitation</div>
          <div className="text-2xl font-bold text-white mt-1">
            {Math.round(totalObserved)} <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">36-Month Accumulated</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Historical Climatology</div>
          <div className="text-2xl font-bold text-slate-200 mt-1">
            {Math.round(totalHist)} <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Expected 3-Yr Baseline</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Cumulative Anomaly</div>
          <div
            className={`text-2xl font-bold mt-1 ${
              netAnomalyPct < 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {netAnomalyPct > 0 ? '+' : ''}
            {netAnomalyPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {netAnomalyPct < 0 ? 'Precipitation Deficit' : 'Precipitation Surplus'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Severe Deficit Months</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {severeDeficitCount} <span className="text-xs font-normal text-slate-400">months</span>
          </div>
          <div className="text-[11px] text-rose-400 font-semibold mt-1">
            &lt; -25% below normal
          </div>
        </div>
      </div>

      {/* Main Large Chart: Observed vs Historical Baseline */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">
              {viewMode === 'monthly'
                ? 'Monthly Rainfall vs Historical Average'
                : viewMode === 'seasonal'
                ? 'Seasonal Rainfall Aggregation'
                : 'Annual Total Rainfall'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Highlighting drought deficit periods against the 30-year reference mean
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-400"></span> Observed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 border-t-2 border-dashed border-amber-400"></span> Historical Baseline
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'monthly' ? (
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="mm" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white border-b border-slate-700 pb-1">
                            {data.monthName} ({data.date})
                          </div>
                          <div className="text-sky-300">
                            Observed Rainfall: <strong>{data.observedRainfall} mm</strong>
                          </div>
                          <div className="text-amber-300">
                            Historical Average: <strong>{data.histAverage} mm</strong>
                          </div>
                          <div
                            className={`font-semibold ${
                              data.anomalyPct < 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            Anomaly: {data.anomalyPct > 0 ? '+' : ''}
                            {data.anomalyPct}% ({data.anomalyMm} mm)
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase pt-1">
                            Status: {data.anomalyCategory}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="observedRainfall" name="Observed Rainfall (mm)" fill="#38bdf8" />
                <Line
                  type="monotone"
                  dataKey="histAverage"
                  name="Historical Average (mm)"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            ) : viewMode === 'seasonal' ? (
              <ComposedChart data={processedSeasonal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="season" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="mm" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="observedTotal" name="Observed Seasonal (mm)" fill="#38bdf8" />
                <Bar dataKey="histTotal" name="Historical Baseline (mm)" fill="#fbbf24" opacity={0.6} />
              </ComposedChart>
            ) : (
              <ComposedChart data={annualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="mm" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="observedAnnual" name="Observed Annual (mm)" fill="#38bdf8" />
                <Bar dataKey="histAnnual" name="Historical Annual Baseline (mm)" fill="#fbbf24" opacity={0.6} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rainfall Anomaly Bar Chart (Section 9: Normal, Above Normal, Below Normal, Severe Deficit) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Rainfall Anomaly Percentage (%)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Formula: ((Observed - Baseline) / Baseline) × 100 • Classified by severity thresholds
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-semibold">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Above Normal (&gt; +10%)
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2.5 h-2.5 rounded bg-sky-500"></span> Normal (±10%)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Below Normal (-10% to -25%)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Severe Deficit (&lt; -25%)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <ReferenceLine y={-25} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Severe Deficit Threshold (-25%)', fill: '#ef4444', fontSize: 10 }} />
              <Bar dataKey="anomalyPct" name="Rainfall Anomaly (%)">
                {monthlyData.map((entry, index) => {
                  let barColor = '#38bdf8';
                  if (entry.anomalyPct < -25) barColor = '#ef4444';
                  else if (entry.anomalyPct < -10) barColor = '#f59e0b';
                  else if (entry.anomalyPct > 10) barColor = '#10b981';
                  return <Cell key={`cell-${index}`} fill={barColor} />;
                })}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
