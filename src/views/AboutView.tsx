import React from 'react';
import {
  Info,
  CheckCircle2,
  ShieldCheck,
  Award,
  Layers,
  Code,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const complianceMatrix = [
    {
      req: 'Task 1: Obtain rainfall time series',
      status: 'Implemented',
      details: 'CHIRPS gridded pentad & monthly precipitation ingestion, 30-year climatological baseline (1991–2020), absolute & percentage anomaly calculations.',
      module: 'gee/rainfall_analysis.js & RainfallAnalysisView',
    },
    {
      req: 'Task 2: Extract surface-water extent',
      status: 'Implemented',
      details: 'Sentinel-2 Level-2A MNDWI thresholding (MNDWI > 0.0), cloud-masking via SCL, JRC 38-year Global Surface Water reference, and Sentinel-1 SAR GRD cloud-penetrating water mask.',
      module: 'gee/water_extraction.js & WaterAnalysisView',
    },
    {
      req: 'Task 3: Compare rainfall and water-area changes',
      status: 'Implemented',
      details: 'Combined dual-axis time-series visualization, scatter plot regression, Pearson correlation coefficient (r), and multi-horizon lag cross-correlation (0, 1, 2, 3 months).',
      module: 'RainfallWaterResponseView & src/utils/calculations.ts',
    },
    {
      req: 'Task 4: Identify drought-sensitive water bodies',
      status: 'Implemented',
      details: 'White-box Drought Sensitivity Score (0–100) combining rainfall deficit, area reduction, lag correlation, variability, and persistence with real-time configurable sliders.',
      module: 'gee/vulnerability_model.js & VulnerabilityView',
    },
    {
      req: 'Expected Output 1: Rainfall–water response analysis',
      status: 'Implemented',
      details: 'Multi-basin correlation suite with empirical latency extraction (showing peak response lag in months).',
      module: 'Core Response Module',
    },
    {
      req: 'Expected Output 2: Vulnerable/drought-sensitive waterbody map',
      status: 'Implemented',
      details: 'Full Leaflet GIS map with multi-point polygons, severity styling (Low, Moderate, High, Very High), layer controls, popups, and hotspot filters.',
      module: 'LiveMapView',
    },
    {
      req: 'Decision Support: Reach actionable recommendations',
      status: 'Implemented',
      details: 'Evidence-based mitigation matrix matching reservoir drought sensitivity with specific operational interventions (monitoring cadence, rule curves, conservation).',
      module: 'DecisionSupportView',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
            GEO-PIMATHON 1.0 Submission
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Problem Statement 2.4 Compliance Dossier
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Award className="w-6 h-6 text-amber-400" />
          <span>HydroPulse – Rainfall–Surface Water Response Intelligence</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          HydroPulse is an enterprise-grade geospatial decision-support platform engineered specifically for Problem Statement 2.4 of GEO-PIMATHON 1.0. It investigates the complex hydrological sensitivity of inland surface water bodies to precipitation variability.
        </p>
      </div>

      {/* Compliance Matrix Table (Section 26 Requirement) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>How This Project Satisfies Problem Statement 2.4</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explicit mapping of hackathon challenge requirements to architectural implementation
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Official Requirement</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Implementation Details</th>
                <th className="py-2.5 px-3">Key Modules</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {complianceMatrix.map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-white">
                    {item.req}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ✓ {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 leading-relaxed">
                    {item.details}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-cyan-300">
                    {item.module}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technology Architecture */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-cyan-400" />
          <span>Technology Stack & Modular Architecture</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Frontend Core</span>
            <div className="font-bold text-white text-sm">React 19 & TypeScript</div>
            <p className="text-slate-400 text-[11px] mt-1">High-performance UI with Vite 8 tooling</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Geospatial Mapping</span>
            <div className="font-bold text-white text-sm">Leaflet GIS Engine</div>
            <p className="text-slate-400 text-[11px] mt-1">Interactive layers, polygons, and popups</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Analytical Charts</span>
            <div className="font-bold text-white text-sm">Recharts Suite</div>
            <p className="text-slate-400 text-[11px] mt-1">Dual-axis time series, scatter, and anomaly bars</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Earth Engine</span>
            <div className="font-bold text-white text-sm">GEE API Scripts (/gee)</div>
            <p className="text-slate-400 text-[11px] mt-1">CHIRPS, S2 MNDWI, S1 SAR, JRC GSW</p>
          </div>
        </div>
      </div>

      {/* Target Users & Value Proposition */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <span>Intended Stakeholders & Target Users</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <strong className="text-cyan-300 block mb-0.5">Water Resource Managers & CWMA</strong>
            <p className="text-slate-300 text-[11px]">Reservoir rule curve optimization and inter-state release scheduling.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <strong className="text-cyan-300 block mb-0.5">Urban Planners & Municipal Boards</strong>
            <p className="text-slate-300 text-[11px]">Securing drinking water supplies for metropolitan areas (Bengaluru, Mysuru, Latur).</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <strong className="text-cyan-300 block mb-0.5">Disaster Management Authorities</strong>
            <p className="text-slate-300 text-[11px]">Early warning for acute water scarcity and emergency tanker route planning.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <strong className="text-cyan-300 block mb-0.5">Environmental Researchers</strong>
            <p className="text-slate-300 text-[11px]">Long-term climate impact assessment on inland wetland ecosystems.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
