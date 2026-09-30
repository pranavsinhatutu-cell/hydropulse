import React from 'react';
import {
  CloudRain,
  Gauge,
  Waves,
  TrendingDown,
  TrendingUp,
  FolderDot,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { KPISummary } from '../types';

interface KPICardsProps {
  kpis: KPISummary;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const isAreaDown = kpis.waterAreaChangePct < 0;
  const isRainDown = kpis.rainfallAnomalyPct < 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      
      {/* 1. Total Rainfall */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wide uppercase">Total Rainfall</span>
          <div className="p-1.5 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/40">
            <CloudRain className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-white">
            {kpis.totalRainfallMm.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-400">mm</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px]">
          <span
            className={`font-semibold flex items-center ${
              isRainDown ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {isRainDown ? <TrendingDown className="w-3 h-3 mr-0.5" /> : <TrendingUp className="w-3 h-3 mr-0.5" />}
            {kpis.rainfallAnomalyPct > 0 ? '+' : ''}
            {kpis.rainfallAnomalyPct.toFixed(1)}%
          </span>
          <span className="text-slate-400">vs historical</span>
        </div>
      </div>

      {/* 2. Average Rainfall */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wide uppercase">Avg Rainfall</span>
          <div className="p-1.5 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/40">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-white">
            {kpis.avgRainfallMmPerMonth.toFixed(1)}
          </span>
          <span className="text-xs font-medium text-slate-400">mm/mo</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>CHIRPS gridded pentad</span>
        </div>
      </div>

      {/* 3. Current Surface Water Area */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wide uppercase">Water Extent</span>
          <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
            <Waves className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-white">
            {kpis.currentSurfaceWaterAreaKm2.toFixed(1)}
          </span>
          <span className="text-xs font-medium text-slate-400">km²</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Sentinel-2 & JRC</span>
        </div>
      </div>

      {/* 4. Water Area Change */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wide uppercase">Area Change</span>
          <div
            className={`p-1.5 rounded-lg border ${
              isAreaDown
                ? 'bg-rose-950/80 text-rose-400 border-rose-800/40'
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
            }`}
          >
            {isAreaDown ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl font-bold tracking-tight ${
              isAreaDown ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {kpis.waterAreaChangePct > 0 ? '+' : ''}
            {kpis.waterAreaChangePct.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <span>Net contraction vs baseline</span>
        </div>
      </div>

      {/* 5. Number of Water Bodies */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wide uppercase">Water Bodies</span>
          <div className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/40">
            <FolderDot className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-white">
            {kpis.totalWaterBodies}
          </span>
          <span className="text-xs font-medium text-slate-400">delineated</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <span>Reservoirs, lakes & tanks</span>
        </div>
      </div>

      {/* 6. Vulnerable Water Bodies */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wide uppercase">Drought-Sensitive</span>
          <div className="p-1.5 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/40">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-rose-400">
            {kpis.vulnerableWaterBodiesCount}
          </span>
          <span className="text-xs font-medium text-slate-400">/ {kpis.totalWaterBodies}</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <span className="text-rose-400 font-semibold">{kpis.severeDeficitWaterBodiesCount} severe</span>
          <span>(High/Very High)</span>
        </div>
      </div>

    </div>
  );
};
