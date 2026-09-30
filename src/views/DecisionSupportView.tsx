import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Building2,
  Sliders,
} from 'lucide-react';
import { WaterBody, StudyArea, RecommendationItem } from '../types';

interface DecisionSupportViewProps {
  studyArea: StudyArea;
  waterBodies: WaterBody[];
  onSelectWaterBody: (wb: WaterBody) => void;
}

export const DecisionSupportView: React.FC<DecisionSupportViewProps> = ({
  studyArea,
  waterBodies,
  onSelectWaterBody,
}) => {
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Flatten recommendations with water body context
  const allRecommendations: {
    rec: RecommendationItem;
    wb: WaterBody;
  }[] = [];

  waterBodies.forEach((wb) => {
    wb.recommendations.forEach((rec) => {
      allRecommendations.push({ rec, wb });
    });
  });

  const filtered = allRecommendations.filter(({ rec, wb }) => {
    const matchesUrgency = urgencyFilter === 'all' || rec.urgency === urgencyFilter;
    const matchesCategory = categoryFilter === 'all' || rec.category === categoryFilter;
    return matchesUrgency && matchesCategory;
  });

  // Action categories
  const categories = ['Monitoring', 'Conservation', 'Emergency', 'Groundwater', 'Infrastructure'];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
              Operational Phase 6
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Evidence-Based Decision Matrix
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>Decision Support & Mitigation Interventions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Translating remote-sensing indicator metrics into actionable, evidence-based water management decisions prioritized by hydrological severity.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Urgency Levels</option>
            <option value="Immediate">Immediate Priority</option>
            <option value="High">High Priority</option>
            <option value="Moderate">Moderate Priority</option>
            <option value="Routine">Routine Monitoring</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Intervention Types</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Disclaimer Banner (Prompt Requirement) */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200 flex items-start gap-3 shadow-md">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Analytical Decision Support Notice: </span>
          "These recommendations are analytical decision-support outputs, not official policy decisions. They serve as evidence-based scientific inputs for water resource managers, disaster response units, and environmental planning authorities."
        </div>
      </div>

      {/* Grid of Actionable Interventions */}
      <div className="space-y-3.5">
        {filtered.map(({ rec, wb }) => {
          const urgencyColor = {
            Immediate: 'bg-rose-950 text-rose-400 border-rose-800',
            High: 'bg-orange-950 text-orange-400 border-orange-800',
            Moderate: 'bg-amber-950 text-amber-400 border-amber-800',
            Routine: 'bg-slate-800 text-slate-300 border-slate-700',
          }[rec.urgency];

          return (
            <div
              key={rec.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                {/* Meta line */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${urgencyColor}`}>
                    {rec.urgency}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-cyan-300 border border-slate-700 uppercase">
                    {rec.category}
                  </span>
                  <span className="font-mono text-slate-400 font-semibold">
                    {wb.id} • {wb.name} ({wb.district})
                  </span>
                </div>

                {/* Main Action Title */}
                <h3 className="font-bold text-white text-sm sm:text-base">
                  {rec.action}
                </h3>

                {/* Analytical Rationale */}
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="font-semibold text-cyan-300">Empirical Rationale: </span>
                  {rec.rationale}
                </div>

                {/* Lead Agency & Trigger Metrics */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lead Agency: <strong className="text-slate-300">{rec.leadAgency}</strong></span>
                  </div>
                  <div>
                    Water Area Change: <strong className="text-rose-400">{wb.areaChangePct.toFixed(1)}%</strong>
                  </div>
                  <div>
                    Rainfall Anomaly: <strong className="text-amber-400">{wb.rainfallAnomalyPct.toFixed(1)}%</strong>
                  </div>
                  <div>
                    Sensitivity Score: <strong className="text-white">{wb.vulnerabilityScore}/100</strong>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectWaterBody(wb)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>View Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
