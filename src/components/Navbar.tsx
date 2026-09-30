import React, { useState } from 'react';
import {
  Droplets,
  Layers,
  Download,
  Sliders,
  PlayCircle,
  HelpCircle,
  ChevronDown,
  FileSpreadsheet,
  FileCode,
  FileText,
  Calendar,
  Globe2,
  Menu,
  X,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { StudyArea, VulnerabilityWeights, WaterBody } from '../types';
import { exportWaterBodiesToCSV, exportTimeSeriesToCSV, exportWaterBodiesToGeoJSON } from '../utils/exportUtils';

interface NavbarProps {
  studyAreas: StudyArea[];
  selectedStudyArea: StudyArea;
  onSelectStudyArea: (area: StudyArea) => void;
  dateRange: { startDate: string; endDate: string };
  onDateRangeChange: (dates: { startDate: string; endDate: string }) => void;
  weights: VulnerabilityWeights;
  onOpenWeightsModal: () => void;
  onOpenReportModal: () => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  waterBodies: WaterBody[];
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  apiKey: string;
  onUpdateApiKey: (newKey: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  studyAreas,
  selectedStudyArea,
  onSelectStudyArea,
  dateRange,
  onDateRangeChange,
  onOpenWeightsModal,
  onOpenReportModal,
  isPresentationMode,
  onTogglePresentationMode,
  waterBodies,
  mobileMenuOpen,
  onToggleMobileMenu,
  apiKey,
  onUpdateApiKey,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);
  const [copiedKey, setCopiedKey] = useState(false);

  const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0);
  const maskedKey = hasApiKey
    ? `${apiKey.slice(0, 8)}...${apiKey.slice(-6)}`
    : '';

  const handleSaveKey = () => {
    onUpdateApiKey(keyInput.trim());
    setShowKeyModal(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
                <Droplets className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                    HydroPulse
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                    PS 2.4 • GEO-PIMATHON
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden md:block">
                  Rainfall–Surface Water Response Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Center: Controls (Study Area & Date Range) */}
          <div className="hidden xl:flex items-center gap-3">
            {/* Study Area Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-1.5 transition-colors">
              <Globe2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <label htmlFor="study-area-select" className="text-xs text-slate-400 font-medium">Study Area:</label>
              <select
                id="study-area-select"
                value={selectedStudyArea.id}
                onChange={(e) => {
                  const area = studyAreas.find((a) => a.id === e.target.value);
                  if (area) onSelectStudyArea(area);
                }}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-2"
              >
                {studyAreas.map((area) => (
                  <option key={area.id} value={area.id} className="bg-slate-900 text-slate-100">
                    {area.name} ({area.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-slate-400">Analysis:</span>
              <input
                type="month"
                value={dateRange.startDate}
                min="2022-01"
                max="2024-11"
                onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
                className="bg-slate-900 text-slate-200 text-xs px-1.5 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-slate-500">to</span>
              <input
                type="month"
                value={dateRange.endDate}
                min={dateRange.startDate}
                max="2024-12"
                onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
                className="bg-slate-900 text-slate-200 text-xs px-1.5 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Right: Actions, API Key Badge, & Presentation Mode */}
          <div className="flex items-center gap-2.5">
            
            {/* Live Geospatial API Key Badge */}
            <div className="relative">
              {hasApiKey ? (
                <button
                  onClick={() => setShowKeyModal(!showKeyModal)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60 transition-all shadow-md shadow-emerald-900/20"
                  title="Live Geospatial Map API Key Active"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="hidden sm:inline">LIVE MAP API:</span>
                  <span className="font-mono text-[11px] text-emerald-200 font-bold">{maskedKey}</span>
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowKeyModal(!showKeyModal)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/70 border border-amber-600/40 text-amber-300 hover:bg-amber-900/60 transition-colors shadow-sm"
                  title="Click to configure Live Map API key"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>DEMO MODE</span>
                  <KeyRound className="w-3.5 h-3.5 text-amber-400/80 ml-0.5" />
                </button>
              )}

              {/* API Key Configuration Popover */}
              {showKeyModal && (
                <div className="absolute right-0 mt-2 w-84 sm:w-96 p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-xs z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                    <span className="font-bold text-white flex items-center gap-2 text-sm">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      Live Geospatial Map API
                    </span>
                    <button
                      onClick={() => setShowKeyModal(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
                      <div className="flex items-center justify-between text-emerald-400 font-semibold mb-1">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {hasApiKey ? 'Active Live Key Configured' : 'No API Key Configured'}
                        </span>
                        <span className="text-[10px] text-slate-400">GEO-PIMATHON 1.0</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        This API key authenticates live satellite layers, high-resolution tile streaming, and geospatial endpoints on the interactive map.
                      </p>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        API Key:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={keyInput}
                          onChange={(e) => setKeyInput(e.target.value)}
                          placeholder="Paste API key (e.g. cb1_44da_1_...)"
                          className="flex-1 bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 shadow-inner"
                        />
                        <button
                          onClick={handleSaveKey}
                          className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    {hasApiKey && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Current key: <strong className="font-mono text-slate-200">{maskedKey}</strong></span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(apiKey);
                            setCopiedKey(true);
                            setTimeout(() => setCopiedKey(false), 2000);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          {copiedKey ? 'Copied!' : 'Copy Key'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Model Weights Config Button */}
            <button
              onClick={onOpenWeightsModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              title="Configure Sensitivity Model Weights"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Weights</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {exportOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-1 text-xs z-50"
                  onClick={() => setExportOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-700">
                    Export Formats
                  </div>
                  <button
                    onClick={() => exportWaterBodiesToCSV(waterBodies, selectedStudyArea.name)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-medium">Export Water Bodies (CSV)</div>
                      <div className="text-[10px] text-slate-400">Indicators, scores & stats</div>
                    </div>
                  </button>
                  <button
                    onClick={() => exportTimeSeriesToCSV(waterBodies, selectedStudyArea.name)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-medium">Monthly Time Series (CSV)</div>
                      <div className="text-[10px] text-slate-400">CHIRPS rain & water area (36 mo)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => exportWaterBodiesToGeoJSON(waterBodies, selectedStudyArea)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-medium">Export GeoJSON</div>
                      <div className="text-[10px] text-slate-400">RFC 7946 Polygon boundaries</div>
                    </div>
                  </button>
                  <button
                    onClick={onOpenReportModal}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-200 hover:bg-slate-700 hover:text-white border-t border-slate-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-medium">Executive Summary Report</div>
                      <div className="text-[10px] text-slate-400">Printable briefing document</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Presentation Mode Toggle */}
            <button
              onClick={onTogglePresentationMode}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
                isPresentationMode
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30'
              }`}
              title="Presentation Mode for Hackathon Judges"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isPresentationMode ? 'Exit Pitch' : 'Pitch Mode'}</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
