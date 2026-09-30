import React, { useState } from 'react';
import {
  Waves,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Layers,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Flame,
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
  Area,
} from 'recharts';
import { WaterBody, StudyArea } from '../types';

interface WaterAnalysisViewProps {
  studyArea: StudyArea;
  waterBodies: WaterBody[];
  selectedWaterBody: WaterBody | null;
  onSelectWaterBody: (wb: WaterBody) => void;
}

export const WaterAnalysisView: React.FC<WaterAnalysisViewProps> = ({
  studyArea,
  waterBodies,
  selectedWaterBody,
  onSelectWaterBody,
}) => {
  const [activeBodyId, setActiveBodyId] = useState<string>(selectedWaterBody ? selectedWaterBody.id : 'all');
  const [sortField, setSortField] = useState<'areaChangePct' | 'currentAreaKm2' | 'vulnerabilityScore'>('areaChangePct');
  const [sortAsc, setSortAsc] = useState(true);

  const activeWb = waterBodies.find((w) => w.id === activeBodyId);

  // Time-series data
  const timeSeriesData = (activeWb ? activeWb.monthlyTimeSeries : waterBodies[0]?.monthlyTimeSeries || []).map((pt, idx) => {
    let observedArea = pt.waterAreaKm2;
    let histArea = pt.waterHistAvgKm2;

    if (!activeWb) {
      observedArea = Math.round(waterBodies.reduce((s, wb) => s + (wb.monthlyTimeSeries[idx]?.waterAreaKm2 || 0), 0) * 10) / 10;
      histArea = Math.round(waterBodies.reduce((s, wb) => s + (wb.monthlyTimeSeries[idx]?.waterHistAvgKm2 || 0), 0) * 10) / 10;
    }

    const changePct = histArea > 0 ? Math.round(((observedArea - histArea) / histArea) * 1000) / 10 : 0;

    return {
      date: pt.date,
      monthName: pt.monthName,
      observedArea,
      histArea,
      changePct,
      ndwi: pt.ndwiMean,
    };
  });

  // Sort water bodies for hotspot ranking
  const sortedWaterBodies = [...waterBodies].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortAsc) return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  // Hotspots: water loss > 20%
  const hotspots = waterBodies.filter((wb) => wb.areaChangePct < -20);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Waves className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Surface Water Extent & Dynamics (Sentinel-2 / JRC)
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Official Task 2: Multi-temporal water area extraction and historical surface-water contraction tracking
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Water Body:</span>
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
              Aggregate Total (All {waterBodies.length} Water Bodies)
            </option>
            {waterBodies.map((wb) => (
              <option key={wb.id} value={wb.id} className="bg-slate-900 text-slate-100">
                {wb.id}: {wb.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Surface Water Time Series Chart */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">
              {activeWb ? `${activeWb.name} (${activeWb.id}) Extent` : 'Basin Total Surface Water Extent'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Observed Water Area (km²) vs Historical Baseline Extent
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-400"></span> Observed Extent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400 border-t-2 border-dashed border-slate-400"></span> 38-Yr JRC Baseline
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="km²" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-white border-b border-slate-700 pb-1">
                          {data.monthName} ({data.date})
                        </div>
                        <div className="text-cyan-300">
                          Observed Water Area: <strong>{data.observedArea} km²</strong>
                        </div>
                        <div className="text-slate-400">
                          Historical Baseline: <strong>{data.histArea} km²</strong>
                        </div>
                        <div
                          className={`font-semibold ${
                            data.changePct < 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          Area Change: {data.changePct > 0 ? '+' : ''}
                          {data.changePct}%
                        </div>
                        <div className="text-sky-300">
                          NDWI Mean: <strong>{data.ndwi}</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="observedArea"
                name="Observed Area (km²)"
                fill="#06b6d4"
                stroke="#0891b2"
                fillOpacity={0.25}
              />
              <Line
                type="monotone"
                dataKey="histArea"
                name="Historical Baseline Average (km²)"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Percentage Area Change Chart */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Water Area Change Percentage (%)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formula: ((Current Area - Historical Avg Area) / Historical Avg Area) × 100
          </p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              />
              <Bar dataKey="changePct" name="Area Change (%)">
                {timeSeriesData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.changePct < -20 ? '#ef4444' : entry.changePct < 0 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Water-Loss Hotspots Ranking Table (Section 10 Requirement) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-base font-bold text-white">Water-Loss Hotspots Ranking</h2>
              <p className="text-xs text-slate-400">
                Water bodies experiencing severe surface area contraction (&gt;20% water loss)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Sort by:</span>
            <button
              onClick={() => {
                if (sortField === 'areaChangePct') setSortAsc(!sortAsc);
                else {
                  setSortField('areaChangePct');
                  setSortAsc(true);
                }
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 ${
                sortField === 'areaChangePct'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span>Area Change %</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                if (sortField === 'currentAreaKm2') setSortAsc(!sortAsc);
                else {
                  setSortField('currentAreaKm2');
                  setSortAsc(false);
                }
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 ${
                sortField === 'currentAreaKm2'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span>Current Size</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Hotspots Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Water Body</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3 text-right">Current Area</th>
                <th className="py-2.5 px-3 text-right">Hist Avg</th>
                <th className="py-2.5 px-3 text-right">Hist Max</th>
                <th className="py-2.5 px-3 text-right">Area Change %</th>
                <th className="py-2.5 px-3 text-right">Water Loss %</th>
                <th className="py-2.5 px-3 text-center">Sensitivity</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedWaterBodies.map((wb) => (
                <tr
                  key={wb.id}
                  onClick={() => onSelectWaterBody(wb)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">{wb.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{wb.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{wb.district}</td>
                  <td className="py-2.5 px-3 text-right text-slate-200">{wb.currentAreaKm2.toFixed(2)} km²</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{wb.historicalAvgAreaKm2.toFixed(2)} km²</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{wb.historicalMaxAreaKm2.toFixed(1)} km²</td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        wb.areaChangePct < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {wb.areaChangePct < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {wb.areaChangePct > 0 ? '+' : ''}
                      {wb.areaChangePct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                    {wb.waterLossPct > 0 ? `${wb.waterLossPct.toFixed(1)}%` : '0.0%'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        wb.vulnerabilityClass === 'Very High'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : wb.vulnerabilityClass === 'High'
                          ? 'bg-orange-950 text-orange-400 border border-orange-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {wb.vulnerabilityScore}/100
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWaterBody(wb);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
