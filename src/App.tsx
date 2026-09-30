import React, { useState, useMemo } from 'react';
import { STUDY_AREAS } from './data/studyAreas';
import { getWaterBodiesByStudyArea } from './data/waterBodiesData';

import {
  StudyArea,
  WaterBody,
  ActiveTab,
  VulnerabilityWeights,
  KPISummary,
} from './types';

import { recomputeWaterBodyVulnerability } from './utils/calculations';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ModelWeightsModal } from './components/ModelWeightsModal';
import { WaterBodyDetailModal } from './components/WaterBodyDetailModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';

// Views
import { DashboardView } from './views/DashboardView';
import { LiveMapView } from './views/LiveMapView';
import { RainfallAnalysisView } from './views/RainfallAnalysisView';
import { WaterAnalysisView } from './views/WaterAnalysisView';
import { RainfallWaterResponseView } from './views/RainfallWaterResponseView';
import { VulnerabilityView } from './views/VulnerabilityView';
import { WaterBodiesView } from './views/WaterBodiesView';
import { DecisionSupportView } from './views/DecisionSupportView';
import { AnalyticsView } from './views/AnalyticsView';
import { MethodologyView } from './views/MethodologyView';
import { DatasetsView } from './views/DatasetsView';
import { AboutView } from './views/AboutView';
import { PresentationModeView } from './views/PresentationModeView';

const DEFAULT_WEIGHTS: VulnerabilityWeights = {
  rainfallDeficit: 0.25,
  waterAreaReduction: 0.35,
  rainfallWaterResponse: 0.20,
  historicalVariability: 0.10,
  persistenceOfLoss: 0.10,
};

export function App() {
  const [selectedStudyArea, setSelectedStudyArea] =
    useState<StudyArea>(STUDY_AREAS[0]);

  const [dateRange, setDateRange] = useState(
    selectedStudyArea.defaultDateRange
  );

  const [weights, setWeights] =
    useState<VulnerabilityWeights>(DEFAULT_WEIGHTS);

  const [activeTab, setActiveTab] =
    useState<ActiveTab>('dashboard');

  const [selectedWaterBody, setSelectedWaterBody] =
    useState<WaterBody | null>(null);

  const [isWeightsModalOpen, setIsWeightsModalOpen] =
    useState(false);

  const [isReportModalOpen, setIsReportModalOpen] =
    useState(false);

  const [isPresentationMode, setIsPresentationMode] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ============================================================
  // CARTO / MAP API KEY
  // ============================================================

  const [apiKey, setApiKey] = useState(
  () =>
    import.meta.env.VITE_GEOSPATIAL_MAP_API_KEY ||
    import.meta.env.VITE_MAP_API_KEY ||
    ''
);

  // ============================================================
  // LOAD WATER BODIES
  // ============================================================

  const rawWaterBodies = useMemo(() => {
    return getWaterBodiesByStudyArea(selectedStudyArea.id);
  }, [selectedStudyArea.id]);

  // ============================================================
  // RECALCULATE VULNERABILITY
  // ============================================================

  const waterBodies = useMemo(() => {
    return rawWaterBodies.map((wb) =>
      recomputeWaterBodyVulnerability(wb, weights)
    );
  }, [rawWaterBodies, weights]);

  // ============================================================
  // KPI CALCULATIONS
  // ============================================================

  const kpis: KPISummary = useMemo(() => {
    const totalRainfall =
      waterBodies.reduce(
        (sum, wb) => sum + wb.currentRainfallMm,
        0
      ) / (waterBodies.length || 1);

    const avgRainPerMonth = totalRainfall / 12;

    const rainfallAnomaly =
      waterBodies.reduce(
        (sum, wb) => sum + wb.rainfallAnomalyPct,
        0
      ) / (waterBodies.length || 1);

    const currentWaterArea = waterBodies.reduce(
      (sum, wb) => sum + wb.currentAreaKm2,
      0
    );

    const histAvgWaterArea = waterBodies.reduce(
      (sum, wb) => sum + wb.historicalAvgAreaKm2,
      0
    );

    const waterAreaChange =
      histAvgWaterArea > 0
        ? ((currentWaterArea - histAvgWaterArea) /
            histAvgWaterArea) *
          100
        : 0;

    const vulnerableCount = waterBodies.filter(
      (w) =>
        w.vulnerabilityClass === 'High' ||
        w.vulnerabilityClass === 'Very High' ||
        w.vulnerabilityClass === 'Moderate'
    ).length;

    const severeCount = waterBodies.filter(
      (w) =>
        w.vulnerabilityClass === 'High' ||
        w.vulnerabilityClass === 'Very High'
    ).length;

    // Calculate predominant optimal lag
    const lagCounts: { [k: number]: number } = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
    };

    waterBodies.forEach((w) => {
      lagCounts[w.optimalLagMonths] =
        (lagCounts[w.optimalLagMonths] || 0) + 1;
    });

    let bestLag = 1;
    let maxLagCount = -1;

    for (const [lagStr, count] of Object.entries(lagCounts)) {
      if (count > maxLagCount) {
        maxLagCount = count;
        bestLag = parseInt(lagStr);
      }
    }

    const meanCorr =
      waterBodies.reduce(
        (sum, wb) => sum + wb.correlation,
        0
      ) / (waterBodies.length || 1);

    return {
      totalRainfallMm:
        Math.round(totalRainfall * 10) / 10,

      avgRainfallMmPerMonth:
        Math.round(avgRainPerMonth * 10) / 10,

      rainfallAnomalyPct:
        Math.round(rainfallAnomaly * 10) / 10,

      currentSurfaceWaterAreaKm2:
        Math.round(currentWaterArea * 10) / 10,

      waterAreaChangePct:
        Math.round(waterAreaChange * 10) / 10,

      totalWaterBodies:
        waterBodies.length,

      vulnerableWaterBodiesCount:
        vulnerableCount,

      severeDeficitWaterBodiesCount:
        severeCount,

      strongestLagMonths:
        bestLag,

      meanCorrelation:
        Math.round(meanCorr * 100) / 100,
    };
  }, [waterBodies]);

  // ============================================================
  // STUDY AREA HANDLER
  // ============================================================

  const handleSelectStudyArea = (area: StudyArea) => {
    setSelectedStudyArea(area);
    setDateRange(area.defaultDateRange);
    setSelectedWaterBody(null);
  };

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">

      {/* ======================================================
          TOP NAVBAR
      ======================================================= */}

      <Navbar
  studyAreas={STUDY_AREAS}
  selectedStudyArea={selectedStudyArea}
  onSelectStudyArea={handleSelectStudyArea}
  dateRange={dateRange}
  onDateRangeChange={setDateRange}
  weights={weights}
  onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
  onOpenReportModal={() => setIsReportModalOpen(true)}
  isPresentationMode={isPresentationMode}
  onTogglePresentationMode={() =>
    setIsPresentationMode(!isPresentationMode)
  }
  waterBodies={waterBodies}
  mobileMenuOpen={mobileMenuOpen}
  onToggleMobileMenu={() =>
    setMobileMenuOpen(!mobileMenuOpen)
  }
  apiKey={apiKey}
  onUpdateApiKey={setApiKey}
/>


      {/* ======================================================
          MAIN BODY
      ======================================================= */}

      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">

        {/* ====================================================
            SIDEBAR
        ===================================================== */}

        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() =>
            setMobileMenuOpen(false)
          }
          vulnerableCount={
            kpis.severeDeficitWaterBodiesCount
          }
        />

        {/* ====================================================
            CONTENT AREA
        ===================================================== */}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">

          {/* ==================================================
              DASHBOARD
          =================================================== */}

          {activeTab === 'dashboard' && (
            <DashboardView
              studyArea={selectedStudyArea}
              kpis={kpis}
              waterBodies={waterBodies}
              onSelectWaterBody={setSelectedWaterBody}
              onNavigateToTab={setActiveTab}
            />
          )}

          {/* ==================================================
              LIVE MAP
          =================================================== */}

          {activeTab === 'live-map' && (
 <LiveMapView
  studyArea={selectedStudyArea}
  waterBodies={waterBodies}
  onSelectWaterBody={setSelectedWaterBody}
  selectedWaterBody={selectedWaterBody}
  apiKey={apiKey}
/>
)}
          {/* ==================================================
              RAINFALL ANALYSIS
          =================================================== */}

          {activeTab === 'rainfall' && (
            <RainfallAnalysisView
              studyArea={selectedStudyArea}
              waterBodies={waterBodies}
              selectedWaterBody={selectedWaterBody}
              onSelectWaterBody={setSelectedWaterBody}
            />
          )}

          {/* ==================================================
              WATER ANALYSIS
          =================================================== */}

          {activeTab === 'water' && (
            <WaterAnalysisView
              studyArea={selectedStudyArea}
              waterBodies={waterBodies}
              selectedWaterBody={selectedWaterBody}
              onSelectWaterBody={setSelectedWaterBody}
            />
          )}

          {/* ==================================================
              RAINFALL-WATER RESPONSE
          =================================================== */}

          {activeTab === 'response' && (
            <RainfallWaterResponseView
              studyArea={selectedStudyArea}
              waterBodies={waterBodies}
              selectedWaterBody={selectedWaterBody}
              onSelectWaterBody={setSelectedWaterBody}
            />
          )}

          {/* ==================================================
              VULNERABILITY
          =================================================== */}

          {activeTab === 'vulnerability' && (
            <VulnerabilityView
              studyArea={selectedStudyArea}
              waterBodies={waterBodies}
              weights={weights}
              onOpenWeightsModal={() =>
                setIsWeightsModalOpen(true)
              }
              onSelectWaterBody={setSelectedWaterBody}
            />
          )}

          {/* ==================================================
              WATER BODIES
          =================================================== */}

          {activeTab === 'waterbodies' && (
            <WaterBodiesView
              studyArea={selectedStudyArea}
              waterBodies={waterBodies}
              onSelectWaterBody={setSelectedWaterBody}
            />
          )}

          {/* ==================================================
              DECISION SUPPORT
          =================================================== */}

          {activeTab === 'decision' && (
            <DecisionSupportView
              studyArea={selectedStudyArea}
              waterBodies={waterBodies}
              onSelectWaterBody={setSelectedWaterBody}
            />
          )}

          {/* ==================================================
              ANALYTICS
          =================================================== */}

          {activeTab === 'analytics' && (
            <AnalyticsView
              studyArea={selectedStudyArea}
              waterBodies={waterBodies}
              onSelectWaterBody={setSelectedWaterBody}
            />
          )}

          {/* ==================================================
              METHODOLOGY
          =================================================== */}

          {activeTab === 'methodology' && (
            <MethodologyView />
          )}

          {/* ==================================================
              DATASETS
          =================================================== */}

          {activeTab === 'datasets' && (
            <DatasetsView />
          )}

          {/* ==================================================
              ABOUT
          =================================================== */}

          {activeTab === 'about' && (
            <AboutView />
          )}

        </main>
      </div>

      {/* ======================================================
          MODEL WEIGHTS MODAL
      ======================================================= */}

      <ModelWeightsModal
        isOpen={isWeightsModalOpen}
        onClose={() =>
          setIsWeightsModalOpen(false)
        }
        weights={weights}
        onUpdateWeights={setWeights}
      />

      {/* ======================================================
          WATER BODY DETAIL MODAL
      ======================================================= */}

      <WaterBodyDetailModal
        waterBody={selectedWaterBody}
        onClose={() =>
          setSelectedWaterBody(null)
        }
      />

      {/* ======================================================
          EXECUTIVE REPORT MODAL
      ======================================================= */}

      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() =>
          setIsReportModalOpen(false)
        }
        studyArea={selectedStudyArea}
        kpis={kpis}
        waterBodies={waterBodies}
        dateRange={dateRange}
      />

      {/* ======================================================
          PRESENTATION MODE
      ======================================================= */}

      {isPresentationMode && (
        <PresentationModeView
          studyArea={selectedStudyArea}
          waterBodies={waterBodies}
          kpis={kpis}
          onExit={() =>
            setIsPresentationMode(false)
          }
          onSelectWaterBody={setSelectedWaterBody}
        />
      )}

    </div>
  );
}

export default App;