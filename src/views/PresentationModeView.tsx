import React, { useState } from 'react';
import {
  PlayCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Droplets,
  CloudRain,
  Waves,
  GitCompare,
  AlertTriangle,
  Compass,
  MapPin,
  TrendingDown,
  Sparkles,
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
import { StudyArea, WaterBody, KPISummary } from '../types';

interface PresentationModeViewProps {
  studyArea: StudyArea;
  waterBodies: WaterBody[];
  kpis: KPISummary;
  onExit: () => void;
  onSelectWaterBody: (wb: WaterBody) => void;
}

export const PresentationModeView: React.FC<PresentationModeViewProps> = ({
  studyArea,
  waterBodies,
  kpis,
  onExit,
  onSelectWaterBody,
}) => {
  const [slide, setSlide] = useState(0);

  const topVulnerable = [...waterBodies]
    .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore)
    .slice(0, 5);

  // Aggregate time series
  const aggregatedSeries = (waterBodies[0]?.monthlyTimeSeries || []).map((pt, i) => {
    const avgRain = waterBodies.reduce((s, wb) => s + (wb.monthlyTimeSeries[i]?.rainfallMm || 0), 0) / waterBodies.length;
    const totalWater = waterBodies.reduce((s, wb) => s + (wb.monthlyTimeSeries[i]?.waterAreaKm2 || 0), 0);
    return {
      date: pt.date,
      avgRainfallMm: Math.round(avgRain * 10) / 10,
      totalWaterAreaKm2: Math.round(totalWater * 10) / 10,
    };
  });

  const slides = [
    {
      title: 'Problem Statement 2.4: Rainfall–Surface Water Response Analysis',
      subtitle: 'GEO-PIMATHON 1.0 • Geospatial Decision Support Intelligence',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-200 text-sm leading-relaxed">
              <strong className="text-white block text-base mb-1">Official Challenge:</strong>
              "Investigate how rainfall variability affects surface-water availability, extract multi-temporal water extent, compare dynamics, and identify drought-sensitive water bodies."
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span><strong>Input:</strong> CHIRPS Gridded Precipitation + Sentinel-2 MNDWI + JRC GSW</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span><strong>Core Engine:</strong> Pearson Lag Cross-Correlation (0 to 3 Months)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span><strong>Output:</strong> Transparent 0–100 Drought Sensitivity Score & Map</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase">Study Area</div>
              <div className="text-lg font-bold text-white mt-1">{studyArea.name}</div>
              <div className="text-xs text-cyan-300 mt-1">{studyArea.region}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase">Analyzed Bodies</div>
              <div className="text-2xl font-bold text-white mt-1">{kpis.totalWaterBodies}</div>
              <div className="text-xs text-slate-400 mt-1">Reservoirs & Lakes</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase">Rainfall Anomaly</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{kpis.rainfallAnomalyPct.toFixed(1)}%</div>
              <div className="text-xs text-slate-400 mt-1">vs 30-Yr Climatology</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase">Water Contraction</div>
              <div className="text-2xl font-bold text-rose-400 mt-1">{kpis.waterAreaChangePct.toFixed(1)}%</div>
              <div className="text-xs text-slate-400 mt-1">Net Surface Shrinkage</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Rainfall–Water Response & Catchment Lag Latency',
      subtitle: 'Quantifying the empirical time lag between rainfall pulses and reservoir surface expansion',
      content: (
        <div className="space-y-4">
          <div className="h-64 w-full bg-slate-900 rounded-xl p-3 border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={aggregatedSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="rain" stroke="#38bdf8" tick={{ fontSize: 10 }} unit="mm" />
                <YAxis yAxisId="water" orientation="right" stroke="#06b6d4" tick={{ fontSize: 10 }} unit="km²" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Bar yAxisId="rain" dataKey="avgRainfallMm" name="CHIRPS Rainfall (mm)" fill="#38bdf8" />
                <Line yAxisId="water" type="monotone" dataKey="totalWaterAreaKm2" name="Sentinel-2 Water Area (km²)" stroke="#06b6d4" strokeWidth={2.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Mean Pearson Coupling</span>
              <strong className="text-lg text-emerald-400">r = {kpis.meanCorrelation.toFixed(2)}</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Strongest Observed Lag</span>
              <strong className="text-lg text-cyan-300">{kpis.strongestLagMonths} Month{kpis.strongestLagMonths === 1 ? '' : 's'}</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Hydrological Memory</span>
              <strong className="text-lg text-amber-300">4 – 8 Mo Persistence</strong>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Drought-Sensitive Water Bodies Spotlight & Map',
      subtitle: 'Prioritizing waterbodies with highest operational drought risk',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Top 5 Priority Drought-Sensitive Water Bodies
            </div>
            {topVulnerable.map((wb) => (
              <div
                key={wb.id}
                onClick={() => onSelectWaterBody(wb)}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 cursor-pointer text-xs flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="font-mono text-cyan-300">{wb.id}</span>
                    <span>{wb.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {wb.district} • Shrinkage: <span className="text-rose-400 font-semibold">{wb.areaChangePct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    {wb.vulnerabilityScore}/100
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{wb.vulnerabilityClass}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                White-Box Indicator Decomposition
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                HydroPulse replaces black-box deep learning with a transparent formula:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800 my-2">
                Score = 0.25·Deficit + 0.35·AreaLoss + 0.20·LagR + 0.10·Variability + 0.10·Persistence
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Weights are adjustable live during judge evaluation to accommodate diverse regional water management priorities.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-emerald-300">
              ✓ Complies fully with Problem Statement 2.4 Expected Output
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Decision Support: Actionable Operational Interventions',
      subtitle: 'Evidence-based mitigation strategies for water authorities',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                Immediate Action
              </span>
              <h3 className="font-bold text-white text-sm">Drinking Water Rationing & Rule Curve Adjustment</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Curtail non-essential irrigation canal discharges immediately upon 2 consecutive months of deficit to protect municipal supplies.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-800 uppercase">
                High Priority
              </span>
              <h3 className="font-bold text-white text-sm">Bi-Weekly Satellite Sentinel-2 & SAR Monitoring</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Elevate observation cadence from monthly to bi-weekly for all reservoirs with Drought Sensitivity Scores &gt; 50.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                Catchment Protection
              </span>
              <h3 className="font-bold text-white text-sm">Upstream Stream Corridor Desiltation</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Remove feeder channel blockages so convective storm pulses freely recharge downstream wetlands and reservoirs.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 italic">
            "These recommendations are analytical decision-support outputs, not official policy decisions."
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[slide];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 animate-in fade-in">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20">
            <Droplets className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">HydroPulse</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                Pitch Mode (2–3 Min Demo)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              GEO-PIMATHON 1.0 • Problem Statement 2.4 Defense Deck
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">
            Slide <span className="font-bold text-white">{slide + 1}</span> of {slides.length}
          </div>
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Exit Pitch</span>
          </button>
        </div>
      </div>

      {/* Slide Body */}
      <div className="my-auto max-w-5xl mx-auto w-full py-6 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentSlide.title}
          </h2>
          <p className="text-sm text-cyan-300 mt-1 font-medium">
            {currentSlide.subtitle}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-md">
          {currentSlide.content}
        </div>
      </div>

      {/* Bottom Stepper Controls */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4 max-w-5xl mx-auto w-full">
        <button
          disabled={slide === 0}
          onClick={() => setSlide(Math.max(0, slide - 1))}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            slide === 0
              ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === slide ? 'w-8 bg-cyan-400' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          disabled={slide === slides.length - 1}
          onClick={() => setSlide(Math.min(slides.length - 1, slide + 1))}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            slide === slides.length - 1
              ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
