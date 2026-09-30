import React, { useState } from 'react';
import {
  X,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  Info,
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
  ScatterChart,
  Scatter,
} from 'recharts';
import { WaterBody } from '../types';
import { generateVulnerabilityExplanation, computeSubScores } from '../utils/calculations';

interface WaterBodyDetailModalProps {
  waterBody: WaterBody | null;
  onClose: () => void;
}

export const WaterBodyDetailModal: React.FC<WaterBodyDetailModalProps> = ({
  waterBody,
  onClose,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'rainfall' | 'water' | 'scatter' | 'seasonality'>('rainfall');

  if (!waterBody) return null;

  const explanation = generateVulnerabilityExplanation(waterBody);
  const subScores = computeSubScores(waterBody);

  // Color according to vulnerability
  const badgeColors = {
    Low: 'bg-emerald-950 text-emerald-400 border-emerald-700/60',
    Moderate: 'bg-amber-950 text-amber-400 border-amber-700/60',
    High: 'bg-orange-950 text-orange-400 border-orange-700/60',
    'Very High': 'bg-rose-950 text-rose-400 border-rose-700/60',
  }[waterBody.vulnerabilityClass];

  // Prepare scatter data: observed rainfall vs observed water area
  const scatterData = waterBody.monthlyTimeSeries.map((pt) => ({
    rainfallMm: pt.rainfallMm,
    waterAreaKm2: pt.waterAreaKm2,
    month: pt.monthName,
  }));

  // Prepare 12-month climatology data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const seasonalData = months.map((mName, idx) => {
    // average points for that month
    const matching = waterBody.monthlyTimeSeries.filter((_, i) => i % 12 === idx);
    const avgRain = matching.reduce((s, p) => s + p.rainfallMm, 0) / (matching.length || 1);
    const avgWater = matching.reduce((s, p) => s + p.waterAreaKm2, 0) / (matching.length || 1);
    return {
      month: mName,
      avgRainfallMm: Math.round(avgRain * 10) / 10,
      avgWaterKm2: Math.round(avgWater * 10) / 10,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-5xl my-auto rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl text-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {waterBody.id}
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {waterBody.name}
                </h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeColors}`}>
                  {waterBody.vulnerabilityClass} Sensitivity
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {waterBody.district}, {waterBody.state} • {waterBody.type} • Basin: {waterBody.basin} • Lat: {waterBody.coordinates[0].toFixed(3)}°, Lng: {waterBody.coordinates[1].toFixed(3)}°
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Top 5 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* 1. Current Area */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Current Extent
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {waterBody.currentAreaKm2.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-400">km²</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Max: {waterBody.historicalMaxAreaKm2.toFixed(1)} km²
              </div>
            </div>

            {/* 2. Historical Average Area */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Hist Avg Extent
              </div>
              <div className="text-xl font-bold text-slate-200 mt-1">
                {waterBody.historicalAvgAreaKm2.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-400">km²</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Min: {waterBody.historicalMinAreaKm2.toFixed(1)} km²
              </div>
            </div>

            {/* 3. Area Change % */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Area Change
              </div>
              <div
                className={`text-xl font-bold mt-1 flex items-center gap-1 ${
                  waterBody.areaChangePct < 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {waterBody.areaChangePct < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {waterBody.areaChangePct > 0 ? '+' : ''}
                {waterBody.areaChangePct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {waterBody.waterLossPct > 0 ? `${waterBody.waterLossPct.toFixed(1)}% loss` : 'Stable'}
              </div>
            </div>

            {/* 4. Rainfall Anomaly */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Rainfall Anomaly
              </div>
              <div
                className={`text-xl font-bold mt-1 ${
                  waterBody.rainfallAnomalyPct < 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {waterBody.rainfallAnomalyPct > 0 ? '+' : ''}
                {waterBody.rainfallAnomalyPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {waterBody.rainfallAnomalyMm > 0 ? '+' : ''}
                {waterBody.rainfallAnomalyMm.toFixed(1)} mm deficit
              </div>
            </div>

            {/* 5. Sensitivity Score */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Sensitivity Score
              </div>
              <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1">
                <span>{waterBody.vulnerabilityScore}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className="text-[10px] text-cyan-400 mt-0.5">
                Lag {waterBody.optimalLagMonths} mo (r = {waterBody.correlation.toFixed(2)})
              </div>
            </div>
          </div>

          {/* Section: Dynamic Evidence-Based Vulnerability Explanation */}
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-slate-200">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold mb-1 text-sm">
              <Info className="w-4 h-4" />
              <span>Why is this water body vulnerable? (Analytical Assessment)</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              {explanation}
            </p>
            
            {/* Breakdown of Subscores */}
            <div className="mt-3 pt-3 border-t border-cyan-800/40 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Rainfall Deficit:</span>
                <span className="font-semibold text-white">{subScores.rainfallDeficitScore}/100</span>
              </div>
              <div>
                <span className="text-slate-400 block">Area Reduction:</span>
                <span className="font-semibold text-white">{subScores.waterAreaReductionScore}/100</span>
              </div>
              <div>
                <span className="text-slate-400 block">Lag Coupling (r):</span>
                <span className="font-semibold text-white">{subScores.responseScore}/100</span>
              </div>
              <div>
                <span className="text-slate-400 block">Variability (CV):</span>
                <span className="font-semibold text-white">{subScores.variabilityScore}/100</span>
              </div>
              <div>
                <span className="text-slate-400 block">Loss Persistence:</span>
                <span className="font-semibold text-white">{subScores.persistenceScore}/100</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Section with 4 Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Detailed Time-Series & Cross-Correlation
              </span>
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setActiveChartTab('rainfall')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeChartTab === 'rainfall'
                      ? 'bg-cyan-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rainfall History
                </button>
                <button
                  onClick={() => setActiveChartTab('water')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeChartTab === 'water'
                      ? 'bg-cyan-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Water Extent
                </button>
                <button
                  onClick={() => setActiveChartTab('scatter')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeChartTab === 'scatter'
                      ? 'bg-cyan-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rain vs Water Scatter
                </button>
                <button
                  onClick={() => setActiveChartTab('seasonality')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeChartTab === 'seasonality'
                      ? 'bg-cyan-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Seasonality
                </button>
              </div>
            </div>

            <div className="h-64 w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === 'rainfall' ? (
                  <ComposedChart data={waterBody.monthlyTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="mm" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="rainfallMm" name="Observed Rainfall (mm)" fill="#38bdf8" />
                    <Line
                      type="monotone"
                      dataKey="rainfallHistAvgMm"
                      name="Historical Average (mm)"
                      stroke="#fbbf24"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </ComposedChart>
                ) : activeChartTab === 'water' ? (
                  <ComposedChart data={waterBody.monthlyTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="km²" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="waterAreaKm2"
                      name="Observed Extent (km²)"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="waterHistAvgKm2"
                      name="Baseline Average (km²)"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </ComposedChart>
                ) : activeChartTab === 'scatter' ? (
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      type="number"
                      dataKey="rainfallMm"
                      name="Rainfall"
                      unit=" mm"
                      stroke="#64748b"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="waterAreaKm2"
                      name="Water Area"
                      unit=" km²"
                      stroke="#64748b"
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Scatter name="Monthly Observations" data={scatterData} fill="#38bdf8" />
                  </ScatterChart>
                ) : (
                  <ComposedChart data={seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10 }} unit="mm" />
                    <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{ fontSize: 10 }} unit="km²" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="avgRainfallMm" name="Avg Monthly Rainfall (mm)" fill="#38bdf8" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgWaterKm2"
                      name="Avg Water Extent (km²)"
                      stroke="#06b6d4"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section: Risk Factors & Decision Support Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Risk Factors */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70">
              <div className="flex items-center gap-2 text-rose-300 font-semibold mb-2 text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Risk Factors</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {waterBody.riskFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5"></span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence-Based Recommendations */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-2 text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Decision Support Action Items</span>
              </div>
              <div className="space-y-2.5 text-xs">
                {waterBody.recommendations.map((rec) => (
                  <div key={rec.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">{rec.action}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          rec.urgency === 'Immediate'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : rec.urgency === 'High'
                            ? 'bg-orange-950 text-orange-400 border border-orange-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {rec.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{rec.rationale}</p>
                    <div className="mt-1 text-[10px] text-cyan-400">
                      Lead Agency: {rec.leadAgency}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Legal / Analytical Output Disclaimer */}
          <p className="text-[11px] text-slate-400 italic text-center pt-2">
            "These recommendations are analytical decision-support outputs, not official policy decisions."
          </p>

        </div>

      </div>
    </div>
  );
};
