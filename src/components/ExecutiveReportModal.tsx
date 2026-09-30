import React from 'react';
import { X, Printer, Download, Droplets, ShieldCheck, AlertTriangle } from 'lucide-react';
import { WaterBody, StudyArea, KPISummary } from '../types';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyArea: StudyArea;
  kpis: KPISummary;
  waterBodies: WaterBody[];
  dateRange: { startDate: string; endDate: string };
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  studyArea,
  kpis,
  waterBodies,
  dateRange,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const highRiskBodies = waterBodies.filter(
    (wb) => wb.vulnerabilityClass === 'High' || wb.vulnerabilityClass === 'Very High'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl my-auto rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:m-0 print:p-0">
        
        {/* Modal Controls Bar (hidden during print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Executive Briefing Document Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 overflow-y-auto print:overflow-visible space-y-6 text-sm font-sans">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-700 font-bold text-xl tracking-tight">
                <Droplets className="w-6 h-6 text-cyan-600" />
                <span>HydroPulse Intelligence Platform</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                Rainfall–Surface Water Drought Sensitivity Assessment
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                GEO-PIMATHON 1.0 • Problem Statement 2.4 Analytical Synthesis Report
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div>Date Generated: <span className="font-semibold text-slate-900">{new Date().toLocaleDateString()}</span></div>
              <div>Study Horizon: <span className="font-semibold text-slate-900">{dateRange.startDate} to {dateRange.endDate}</span></div>
              <div className="mt-1 px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600 border border-slate-200">
                Evaluation: GEE-Validated
              </div>
            </div>
          </div>

          {/* Study Area Context */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Study Area Overview
            </h2>
            <div className="text-slate-800 font-semibold text-base">
              {studyArea.name} ({studyArea.region}, {studyArea.country})
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {studyArea.description}
            </p>
          </div>

          {/* Executive Metrics Grid */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              1. Key Hydrological Indicators
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[10px] text-slate-500 uppercase">Total Rainfall</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{kpis.totalRainfallMm.toFixed(1)} mm</div>
                <div className="text-[10px] text-slate-600">{kpis.rainfallAnomalyPct.toFixed(1)}% anomaly</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[10px] text-slate-500 uppercase">Surface Water Extent</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{kpis.currentSurfaceWaterAreaKm2.toFixed(1)} km²</div>
                <div className="text-[10px] text-slate-600">{kpis.waterAreaChangePct.toFixed(1)}% change</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[10px] text-slate-500 uppercase">Coupling & Lag</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">r = {kpis.meanCorrelation.toFixed(2)}</div>
                <div className="text-[10px] text-slate-600">Peak Lag: {kpis.strongestLagMonths} Months</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-rose-50 border-rose-200">
                <div className="text-[10px] text-rose-700 uppercase font-semibold">Drought Sensitive</div>
                <div className="text-xl font-bold text-rose-700 mt-0.5">{kpis.vulnerableWaterBodiesCount} / {kpis.totalWaterBodies}</div>
                <div className="text-[10px] text-rose-600">{kpis.severeDeficitWaterBodiesCount} High/Very High</div>
              </div>
            </div>
          </div>

          {/* High-Risk Waterbodies Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              2. Priority Drought-Sensitive Water Bodies
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Water Body</th>
                    <th className="p-2">District</th>
                    <th className="p-2">Current Area</th>
                    <th className="p-2">Change %</th>
                    <th className="p-2">Rain Anomaly</th>
                    <th className="p-2">Score</th>
                    <th className="p-2">Vulnerability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {highRiskBodies.map((wb) => (
                    <tr key={wb.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-semibold text-slate-900">{wb.id}</td>
                      <td className="p-2 font-medium text-slate-900">{wb.name}</td>
                      <td className="p-2 text-slate-600">{wb.district}</td>
                      <td className="p-2 text-slate-800">{wb.currentAreaKm2.toFixed(1)} km²</td>
                      <td className="p-2 font-semibold text-rose-600">{wb.areaChangePct.toFixed(1)}%</td>
                      <td className="p-2 text-amber-700">{wb.rainfallAnomalyPct.toFixed(1)}%</td>
                      <td className="p-2 font-bold text-slate-900">{wb.vulnerabilityScore}/100</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          {wb.vulnerabilityClass}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evidence-Based Strategic Recommendations */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              3. Strategic Interventions & Recommendations
            </h2>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900">1. Adaptive Reservoir Rule Curve & Release Curtailment</div>
                <p className="text-slate-600 mt-0.5">
                  Given the observed {kpis.strongestLagMonths}-month rainfall-to-water lag, non-essential irrigation canal releases must be curtailed immediately upon confirmation of two consecutive monthly rainfall deficits to safeguard municipal drinking water.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900">2. Enhanced Satellite Monitoring Cadence</div>
                <p className="text-slate-600 mt-0.5">
                  Transition from monthly reviews to bi-weekly Sentinel-2 (MNDWI) and Sentinel-1 SAR observations for all reservoirs scoring above 50 on the Drought Sensitivity index.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900">3. Upstream Feeder Channel Desiltation & Recharge Protection</div>
                <p className="text-slate-600 mt-0.5">
                  Clear obstructions in critical upstream stream corridors to ensure convective shower runoff freely replenishes drying wetlands and tank cascades.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 italic text-center">
            "These recommendations are analytical decision-support outputs, not official policy decisions. Developed for GEO-PIMATHON 1.0 – Problem Statement 2.4."
          </div>

        </div>

      </div>
    </div>
  );
};
