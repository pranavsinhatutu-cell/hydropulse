import React from 'react';
import {
  GitBranch,
  CloudRain,
  Waves,
  Cpu,
  Calculator,
  AlertTriangle,
  Compass,
  ArrowDown,
  CheckCircle2,
  Code2,
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
            Scientific Documentation
          </span>
          <span className="text-xs text-slate-400 font-mono">
            GEO-PIMATHON 1.0 • Problem Statement 2.4
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <GitBranch className="w-6 h-6 text-cyan-400" />
          <span>Complete Geospatial Methodology & Processing Pipeline</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          HydroPulse executes a transparent, end-to-end remote-sensing pipeline designed to investigate how precipitation variability translates into inland surface-water contraction and drought vulnerability.
        </p>
      </div>

      {/* Visual Workflow Diagram (Required by Section 16) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">
          Interactive Architecture & Data Flow Diagram
        </h2>

        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center space-y-4 text-xs font-medium">
          
          {/* Top Sources */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
            <div className="p-4 rounded-xl bg-sky-950/60 border border-sky-700/80 text-center space-y-1">
              <div className="font-bold text-sky-300 text-sm flex items-center justify-center gap-1.5">
                <CloudRain className="w-4 h-4" /> CHIRPS Gridded Rainfall (0.05°)
              </div>
              <p className="text-[11px] text-slate-300">Pentad & Monthly Precipitation Ingestion</p>
              <div className="pt-2 text-cyan-300 font-mono text-[10px]">↓ 30-Year Climatology (1991–2020)</div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-white font-semibold">
                Rainfall Time Series & Anomaly (%)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-700/80 text-center space-y-1">
              <div className="font-bold text-cyan-300 text-sm flex items-center justify-center gap-1.5">
                <Waves className="w-4 h-4" /> Sentinel-2 (MNDWI) + JRC GSW + S1 SAR
              </div>
              <p className="text-[11px] text-slate-300">Multi-sensor Optical/SAR Water Extraction</p>
              <div className="pt-2 text-cyan-300 font-mono text-[10px]">↓ Pixel Thresholding & Boundary Polygon</div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-white font-semibold">
                Water Extent Time Series & Area Change (%)
              </div>
            </div>
          </div>

          <ArrowDown className="w-5 h-5 text-cyan-400 animate-bounce" />

          {/* Convergence: Response Analysis */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-indigo-950/80 border border-cyan-600 w-full max-w-2xl text-center space-y-1 shadow-lg shadow-cyan-600/10">
            <div className="font-bold text-white text-sm">
              Rainfall–Water Response & Lag Cross-Correlation Module
            </div>
            <p className="text-slate-300 text-xs">
              Pearson Correlation Coefficient ($r$) across 0, 1, 2, and 3-Month Lag Horizons
            </p>
            <div className="text-cyan-300 font-mono text-[11px] font-semibold">
              Identifies Catchment Peak Response Latency
            </div>
          </div>

          <ArrowDown className="w-5 h-5 text-cyan-400" />

          {/* Scoring Model */}
          <div className="p-4 rounded-xl bg-slate-900 border border-amber-600/70 w-full max-w-2xl text-center space-y-1">
            <div className="font-bold text-amber-300 text-sm flex items-center justify-center gap-1.5">
              <Calculator className="w-4 h-4" /> Deterministic Drought Sensitivity Score (0–100)
            </div>
            <p className="text-slate-300 text-xs">
              Weighted composite of Rainfall Deficit (25%), Water Area Loss (35%), Lag Coupling (20%), Variability (10%), and Loss Persistence (10%)
            </p>
          </div>

          <ArrowDown className="w-5 h-5 text-cyan-400" />

          {/* Output Map & Decision Support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-center">
              <div className="font-bold text-rose-300">Vulnerable Waterbody GIS Map</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Categorized: Low, Moderate, High, Very High</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700 text-center">
              <div className="font-bold text-emerald-300 flex items-center justify-center gap-1">
                <Compass className="w-4 h-4" /> Evidence-Based Decision Support
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Monitoring frequency, rationing, interventions</div>
            </div>
          </div>

        </div>
      </div>

      {/* Detailed 5 Sections */}
      <div className="space-y-6">
        
        {/* Section 1: Rainfall Data */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <CloudRain className="w-5 h-5" />
            <span>Section 1: Rainfall Data Ingestion (CHIRPS)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Precipitation observations are derived from the <strong>Climate Hazards Group InfraRed Precipitation with Station data (CHIRPS)</strong>. CHIRPS merges 0.05° spatial resolution satellite imagery with in-situ station observations from meteorological networks.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li><strong>GEE Collection:</strong> <code className="text-cyan-300 font-mono">UCSB-CHG/CHIRPS/PENTAD</code></li>
            <li><strong>Climatological Reference Baseline:</strong> 30-year monthly averages (1991–2020) computed for each calendar month.</li>
            <li><strong>Spatial Reduction:</strong> Catchment mean aggregation via <code className="text-cyan-300 font-mono">ee.Reducer.mean()</code> over study area bounds.</li>
          </ul>
        </div>

        {/* Section 2: Surface Water Extraction */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <Waves className="w-5 h-5" />
            <span>Section 2: Multi-Sensor Surface Water Extraction</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Surface waterbodies are delineated through complementary optical and SAR synthetic aperture radar sensors:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="font-bold text-white mb-1">Sentinel-2 MSI (Optical)</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Utilizes Modified Normalized Difference Water Index:
                <br />
                <code className="text-cyan-300 font-mono">MNDWI = (B3 - B11) / (B3 + B11)</code>
                <br />
                Suppresses urban building shadows and delineates clear shoreline edges at 10m/20m.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="font-bold text-white mb-1">JRC Global Surface Water</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                European Commission JRC 38-year global surface water record provides the long-term maximum historical inundation boundary and recurrence frequency.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="font-bold text-white mb-1">Sentinel-1 SAR C-Band</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Active radar pulses penetrate monsoon cloud cover. Specular open water reflects radar pulses away, yielding characteristic low backscatter (VV &lt; -16 dB).
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Image Processing */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <Cpu className="w-5 h-5" />
            <span>Section 3: Cloud Masking & Time-Series Generation</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Cloud contamination in optical imagery is filtered using Sentinel-2 Scene Classification Layer (SCL) masks, removing cloud shadows, dense cirrus, and aerosol haze. Monthly composites are created via median aggregation. Pixels satisfying the water threshold are multiplied by the pixel area geometry to produce total surface water extent in square kilometers (km²).
          </p>
        </div>

        {/* Section 4: Lag Cross-Correlation Analysis */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <Calculator className="w-5 h-5" />
            <span>Section 4: Lag Cross-Correlation Analysis (Pearson r)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To quantify hydrological memory and catchment travel time, Pearson correlation coefficient r is computed across lag horizons k ∈ [0, 1, 2, 3] months:
          </p>
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-center text-cyan-300 text-xs sm:text-sm border border-slate-800">
            r(k) = Σ[(P_(t-k) - P_avg)(W_t - W_avg)] / √[Σ(P_(t-k) - P_avg)² · Σ(W_t - W_avg)²]
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The lag horizon producing the highest positive coefficient is flagged as the <em>Optimal Response Lag</em>, indicating whether the water body responds through flash overland runoff (0-month), interflow (1-month), or regional groundwater baseflow (2–3 months).
          </p>
        </div>

        {/* Section 5: Transparent Vulnerability Model */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Section 5: White-Box Drought Sensitivity Model (0–100)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            In compliance with hackathon guidelines, HydroPulse strictly avoids opaque black-box AI predictions. Instead, it employs a deterministic, normalized composite indicator model:
          </p>
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-center text-amber-300 text-xs sm:text-sm border border-slate-800">
            Score = w₁·I_deficit + w₂·I_loss + w₃·I_coupling + w₄·I_variability + w₅·I_persistence
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-slate-800 border border-emerald-800/80 text-center">
              <span className="font-bold text-emerald-400">0 – 25</span>
              <div className="text-[11px] text-slate-400">Low Sensitivity</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800 border border-amber-800/80 text-center">
              <span className="font-bold text-amber-400">26 – 50</span>
              <div className="text-[11px] text-slate-400">Moderate Sensitivity</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800 border border-orange-800/80 text-center">
              <span className="font-bold text-orange-400">51 – 75</span>
              <div className="text-[11px] text-slate-400">High Sensitivity</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800 border border-rose-800/80 text-center">
              <span className="font-bold text-rose-400">76 – 100</span>
              <div className="text-[11px] text-slate-400">Very High Sensitivity</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
