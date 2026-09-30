import React, { useState } from 'react';
import {
  GitCompare,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
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
  ScatterChart,
  Scatter,
  ReferenceLine,
} from 'recharts';
import { WaterBody, StudyArea } from '../types';

interface RainfallWaterResponseViewProps {
  studyArea: StudyArea;
  waterBodies: WaterBody[];
  selectedWaterBody: WaterBody | null;
  onSelectWaterBody: (wb: WaterBody) => void;
}

export const RainfallWaterResponseView: React.FC<RainfallWaterResponseViewProps> = ({
  studyArea,
  waterBodies,
  selectedWaterBody,
  onSelectWaterBody,
}) => {
  const [activeBodyId, setActiveBodyId] = useState<string>(
    selectedWaterBody ? selectedWaterBody.id : waterBodies[0]?.id || ''
  );

  const activeWb = waterBodies.find((w) => w.id === activeBodyId) || waterBodies[0];

  if (!activeWb) return null;

  // Prepare dual-axis time-series data
  const timeSeriesData = activeWb.monthlyTimeSeries.map((pt) => ({
    date: pt.date,
    monthName: pt.monthName,
    rainfallMm: pt.rainfallMm,
    waterAreaKm2: pt.waterAreaKm2,
    rainfallHistMm: pt.rainfallHistAvgMm,
    waterHistKm2: pt.waterHistAvgKm2,
  }));

  // Scatter plot points: Rainfall vs Water Area
  const scatterPoints = activeWb.monthlyTimeSeries.map((pt) => ({
    x: pt.rainfallMm,
    y: pt.waterAreaKm2,
    month: pt.monthName,
  }));

  // Lags array for visual comparison
  const lagData = [
    {
      lag: '0 Month Lag',
      lagNum: 0,
      r: activeWb.lagCorrelations.lag0,
      description: 'Immediate catchment direct runoff & rapid filling',
    },
    {
      lag: '1 Month Lag',
      lagNum: 1,
      r: activeWb.lagCorrelations.lag1,
      description: 'Sub-surface throughflow & tributary cascade inflow',
    },
    {
      lag: '2 Month Lag',
      lagNum: 2,
      r: activeWb.lagCorrelations.lag2,
      description: 'Baseflow discharge & intermediate catchment transit',
    },
    {
      lag: '3 Month Lag',
      lagNum: 3,
      r: activeWb.lagCorrelations.lag3,
      description: 'Deep regional groundwater table contribution',
    },
  ];

  const strongestLag = activeWb.optimalLagMonths;
  const maxR = activeWb.correlation;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
              Core Hackathon Module
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 uppercase">
              DEMO DATA EVALUATION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            <span>Rainfall → Water Response Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Investigating empirical lag coupling between CHIRPS rainfall events and Sentinel-2 surface-water extent changes to determine catchment response latency.
          </p>
        </div>

        {/* Water Body Picker */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 shrink-0">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Select Water Body:</span>
          <select
            value={activeWb.id}
            onChange={(e) => {
              setActiveBodyId(e.target.value);
              const match = waterBodies.find((w) => w.id === e.target.value);
              if (match) onSelectWaterBody(match);
            }}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            {waterBodies.map((wb) => (
              <option key={wb.id} value={wb.id} className="bg-slate-900 text-slate-100">
                {wb.id}: {wb.name} ({wb.vulnerabilityClass})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lag Analysis Cards Grid (Section 8 Requirement) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Lag Cross-Correlation Analysis (0 to 3 Months)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pearson correlation coefficient (r) computed by lagging rainfall time series by k months
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strongest Observed Lag: {strongestLag} Month{strongestLag === 1 ? '' : 's'} (r = {maxR.toFixed(2)})</span>
          </div>
        </div>

        {/* 4 Lag Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {lagData.map((item) => {
            const isOptimal = item.lagNum === strongestLag;
            return (
              <div
                key={item.lagNum}
                className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                  isOptimal
                    ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                {isOptimal && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider">
                    Optimal Lag
                  </span>
                )}
                
                <div className="text-xs font-bold text-slate-300">{item.lag}</div>
                <div className="flex items-baseline gap-2 my-1.5">
                  <span
                    className={`text-2xl font-extrabold ${
                      isOptimal ? 'text-cyan-300' : 'text-slate-100'
                    }`}
                  >
                    r = {item.r.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.r >= 0.7 ? 'Strong' : item.r >= 0.4 ? 'Moderate' : 'Weak'}
                  </span>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${
                      isOptimal ? 'bg-cyan-400' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, item.r * 100))}%` }}
                  ></div>
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Formal Equation & Explanation Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Mathematical Implementation: </span>
            The cross-correlation at lag k is calculated as r(k) = Σ[(P_(t-k) - P_avg)(W_t - W_avg)] / √[Σ(P_(t-k) - P_avg)² · Σ(W_t - W_avg)²]. For <strong>{activeWb.name}</strong>, peak correlation occurs at <strong>lag {strongestLag} month(s)</strong> with r = {maxR.toFixed(2)}, confirming that catchment runoff and tributary replenishment take approximately {strongestLag * 30} days to fully manifest in surface-water area.
          </div>
        </div>
      </div>

      {/* Side-by-Side: Dual-Axis Time Series vs Scatter Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dual Axis Time-Series (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">
                Dual-Axis Time-Series: Rainfall vs Surface Water Extent
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Blue Bars = Monthly Rainfall (mm) • Cyan Line = Observed Water Area (km²)
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {activeWb.id} • {activeWb.district}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis
                  yAxisId="rain"
                  stroke="#38bdf8"
                  tick={{ fontSize: 10 }}
                  unit="mm"
                  label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="water"
                  orientation="right"
                  stroke="#06b6d4"
                  tick={{ fontSize: 10 }}
                  unit="km²"
                  label={{ value: 'Water Area (km²)', angle: 90, position: 'insideRight', fill: '#06b6d4', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar
                  yAxisId="rain"
                  dataKey="rainfallMm"
                  name="Rainfall (mm)"
                  fill="#38bdf8"
                  opacity={0.8}
                />
                <Line
                  yAxisId="water"
                  type="monotone"
                  dataKey="waterAreaKm2"
                  name="Water Extent (km²)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
                <Line
                  yAxisId="water"
                  type="monotone"
                  dataKey="waterHistKm2"
                  name="Historical Water Mean (km²)"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Plot with Regression Trend (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Rainfall vs Water Scatter Plot</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Testing empirical coupling ($R^2 \approx {(maxR * maxR).toFixed(2)}$)
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Rainfall"
                  unit=" mm"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Water Area"
                  unit=" km²"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs space-y-0.5">
                          <div className="font-bold text-white">{data.month}</div>
                          <div className="text-sky-300">Rainfall: {data.x} mm</div>
                          <div className="text-cyan-300">Water Area: {data.y} km²</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Observations" data={scatterPoints} fill="#38bdf8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-[11px] text-slate-300">
            <div className="flex justify-between items-center mb-1">
              <span>Correlation Coefficient:</span>
              <span className="font-bold text-cyan-300">r = {maxR.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Variance Explained ($R^2$):</span>
              <span className="font-bold text-emerald-300">{((maxR * maxR) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
