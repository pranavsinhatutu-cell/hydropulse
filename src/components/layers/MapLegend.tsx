import React from 'react';
import { Layers, Eye, EyeOff, Info, KeyRound, Sparkles } from 'lucide-react';

export interface MapLayerState {
  studyArea: boolean;
  waterBodies: boolean;
  rainfallAnomaly: boolean;
  waterAreaChange: boolean;
  vulnerability: boolean;
  droughtSensitiveOnly: boolean;
  adminBoundaries: boolean;
  baseMap: 'dark' | 'satellite' | 'streets' | 'live';
}

interface MapLegendProps {
  layers: MapLayerState;
  onToggleLayer: (layerName: keyof MapLayerState) => void;
  onChangeBaseMap: (baseMap: 'dark' | 'satellite' | 'streets' | 'live') => void;
  apiKey?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  layers,
  onToggleLayer,
  onChangeBaseMap,
  apiKey,
}) => {
  const hasKey = Boolean(apiKey && apiKey.trim().length > 0);
  const masked = hasKey ? `${apiKey?.slice(0, 8)}...${apiKey?.slice(-6)}` : '';

  return (
    <div className="absolute top-4 right-4 z-[1000] w-72 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl p-4 text-xs text-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-white text-xs uppercase tracking-wider">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>GIS Layers & Legend</span>
        </div>
        {hasKey && (
          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/60 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE API
          </span>
        )}
      </div>

      {/* Layer Toggles */}
      <div className="py-3 space-y-2 border-b border-slate-800">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
          Active Map Layers
        </div>

        {/* Study Area */}
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-slate-300 group-hover:text-white flex items-center gap-2">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block"></span>
            Study Area Perimeter
          </span>
          <input
            type="checkbox"
            checked={layers.studyArea}
            onChange={() => onToggleLayer('studyArea')}
            className="accent-cyan-500 rounded"
          />
        </label>

        {/* Water Bodies */}
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-slate-300 group-hover:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span>
            Water Bodies (Sentinel-2)
          </span>
          <input
            type="checkbox"
            checked={layers.waterBodies}
            onChange={() => onToggleLayer('waterBodies')}
            className="accent-cyan-500 rounded"
          />
        </label>

        {/* Rainfall Anomaly */}
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-slate-300 group-hover:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500/80 inline-block"></span>
            Rainfall Anomaly Grid (CHIRPS)
          </span>
          <input
            type="checkbox"
            checked={layers.rainfallAnomaly}
            onChange={() => onToggleLayer('rainfallAnomaly')}
            className="accent-cyan-500 rounded"
          />
        </label>

        {/* Water Area Change */}
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-slate-300 group-hover:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-rose-500/80 inline-block"></span>
            Water Loss Hotspots
          </span>
          <input
            type="checkbox"
            checked={layers.waterAreaChange}
            onChange={() => onToggleLayer('waterAreaChange')}
            className="accent-cyan-500 rounded"
          />
        </label>

        {/* Vulnerability Classification */}
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-slate-300 group-hover:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 inline-block"></span>
            Drought Sensitivity Score
          </span>
          <input
            type="checkbox"
            checked={layers.vulnerability}
            onChange={() => onToggleLayer('vulnerability')}
            className="accent-cyan-500 rounded"
          />
        </label>

        {/* High Risk Only Filter */}
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-rose-300 font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse inline-block"></span>
            Highlight Drought-Sensitive Only
          </span>
          <input
            type="checkbox"
            checked={layers.droughtSensitiveOnly}
            onChange={() => onToggleLayer('droughtSensitiveOnly')}
            className="accent-rose-500 rounded"
          />
        </label>
      </div>

      {/* Vulnerability Severity Scale */}
      <div className="py-3 border-b border-slate-800">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
          Drought Sensitivity Severity Scale
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              <span>Low Sensitivity</span>
            </div>
            <span className="font-mono text-slate-400">0 – 25</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
              <span>Moderate Sensitivity</span>
            </div>
            <span className="font-mono text-slate-400">26 – 50</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></span>
              <span>High Sensitivity</span>
            </div>
            <span className="font-mono text-slate-400">51 – 75</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
              <span>Very High Sensitivity</span>
            </div>
            <span className="font-mono text-slate-400">76 – 100</span>
          </div>
        </div>
      </div>

      {/* Basemap Switcher */}
      <div className="pt-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
          <span>Basemap Style</span>
          {hasKey && <span className="text-emerald-400 font-mono text-[9px]">API Linked</span>}
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-center">
          <button
            onClick={() => onChangeBaseMap('dark')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all ${
              layers.baseMap === 'dark'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Carto Dark
          </button>
          <button
            onClick={() => onChangeBaseMap('live')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1 ${
              layers.baseMap === 'live'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-emerald-400 hover:text-white border border-emerald-800/40'
            }`}
            title="Live Satellite Tile Stream using API Key"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Live Satellite</span>
          </button>
          <button
            onClick={() => onChangeBaseMap('satellite')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all ${
              layers.baseMap === 'satellite'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Esri World
          </button>
          <button
            onClick={() => onChangeBaseMap('streets')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all ${
              layers.baseMap === 'streets'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            OpenStreet
          </button>
        </div>
      </div>

    </div>
  );
};
