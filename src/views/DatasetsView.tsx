import React from 'react';
import { Database, ExternalLink, Calendar, Layers, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { DATASETS_METADATA } from '../data/datasetsMeta';

export const DatasetsView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
            Data Governance & Lineage
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Earth Engine Catalog Integration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Database className="w-6 h-6 text-cyan-400" />
          <span>Remote Sensing Data Sources & Sensor Specifications</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          HydroPulse relies exclusively on open-access, peer-reviewed satellite observations and climatological precipitation reanalysis. Below are the verified specifications for all integrated datasets.
        </p>
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DATASETS_METADATA.map((ds) => (
          <div
            key={ds.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 uppercase">
                    {ds.shortName}
                  </span>
                  <h2 className="text-base font-bold text-white mt-1.5">
                    {ds.name}
                  </h2>
                </div>
                <a
                  href={ds.citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition-colors"
                  title="View in Google Earth Engine Catalog"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Purpose */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                <span className="font-semibold text-cyan-300 block mb-0.5">Primary Purpose:</span>
                {ds.purpose}
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Provider:</span>
                  <span className="font-semibold text-white">{ds.provider}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Resolution:</span>
                  <span className="font-semibold text-white">{ds.resolution}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Temporal Cadence:</span>
                  <span className="font-semibold text-white">{ds.cadence}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Coverage:</span>
                  <span className="font-semibold text-white">{ds.temporalCoverage}</span>
                </div>
              </div>

              {/* Bands & Indices */}
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">GEE Asset ID: </span>
                  <code className="text-cyan-300 font-mono text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {ds.geeCollectionId}
                  </code>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Bands Used: </span>
                  <span className="text-slate-300">{ds.bandsUsed.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Computed Indices: </span>
                  <span className="text-slate-300">{ds.primaryIndices.join(' • ')}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-2">
                {ds.description}
              </p>
            </div>

            {/* Footer link */}
            <div className="pt-3 border-t border-slate-800/80">
              <a
                href={ds.citationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
              >
                <span>Google Earth Engine Dataset Catalog Documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
