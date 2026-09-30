import React, { useState } from 'react';
import {
  FolderDot,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  Droplets,
  Layers,
} from 'lucide-react';
import { WaterBody, StudyArea } from '../types';

interface WaterBodiesViewProps {
  studyArea: StudyArea;
  waterBodies: WaterBody[];
  onSelectWaterBody: (wb: WaterBody) => void;
}

export const WaterBodiesView: React.FC<WaterBodiesViewProps> = ({
  studyArea,
  waterBodies,
  onSelectWaterBody,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  const districts = Array.from(new Set(waterBodies.map((w) => w.district)));
  const types = Array.from(new Set(waterBodies.map((w) => w.type)));

  const filtered = waterBodies.filter((wb) => {
    const matchesSearch =
      wb.name.toLowerCase().includes(search.toLowerCase()) ||
      wb.id.toLowerCase().includes(search.toLowerCase()) ||
      wb.district.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || wb.type === typeFilter;
    const matchesDistrict = districtFilter === 'all' || wb.district === districtFilter;
    return matchesSearch && matchesType && matchesDistrict;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <FolderDot className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Water Bodies Geospatial Directory
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Delineated reservoirs, natural lakes, and tank cascades in {studyArea.name} ({filtered.length} of {waterBodies.length} displayed)
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Water Body Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((wb) => {
          const isLoss = wb.areaChangePct < 0;
          return (
            <div
              key={wb.id}
              onClick={() => onSelectWaterBody(wb)}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 shadow-lg hover:shadow-cyan-500/10 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {wb.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      wb.vulnerabilityClass === 'Very High'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : wb.vulnerabilityClass === 'High'
                        ? 'bg-orange-950 text-orange-400 border border-orange-800'
                        : wb.vulnerabilityClass === 'Moderate'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {wb.vulnerabilityClass} ({wb.vulnerabilityScore}/100)
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                  {wb.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{wb.district}, {wb.state}</span>
                  <span>•</span>
                  <span>{wb.type}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Current Extent</span>
                    <span className="font-bold text-white text-sm">{wb.currentAreaKm2.toFixed(1)} km²</span>
                    <span className="text-[10px] text-slate-400 block">Baseline: {wb.historicalAvgAreaKm2.toFixed(1)} km²</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Area Contraction</span>
                    <span
                      className={`font-bold text-sm flex items-center ${
                        isLoss ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isLoss ? <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> : <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
                      {wb.areaChangePct > 0 ? '+' : ''}
                      {wb.areaChangePct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Rain Anom: {wb.rainfallAnomalyPct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Lag & Correlation */}
                <div className="flex items-center justify-between text-xs text-slate-300 mb-3 px-1">
                  <span>Lag Coupling: <strong className="text-cyan-300">{wb.optimalLagMonths} Mo Lag</strong></span>
                  <span>Pearson: <strong className="text-emerald-400">r = {wb.correlation.toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 group-hover:text-cyan-300 font-semibold">
                <span>Open Detailed Dossier</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
