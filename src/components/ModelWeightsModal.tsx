import React, { useState } from 'react';
import { Sliders, X, RotateCcw, Check, Info, ShieldCheck } from 'lucide-react';
import { VulnerabilityWeights } from '../types';

interface ModelWeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: VulnerabilityWeights;
  onUpdateWeights: (newWeights: VulnerabilityWeights) => void;
}

const DEFAULT_WEIGHTS: VulnerabilityWeights = {
  rainfallDeficit: 0.25,
  waterAreaReduction: 0.35,
  rainfallWaterResponse: 0.20,
  historicalVariability: 0.10,
  persistenceOfLoss: 0.10,
};

export const ModelWeightsModal: React.FC<ModelWeightsModalProps> = ({
  isOpen,
  onClose,
  weights,
  onUpdateWeights,
}) => {
  const [localWeights, setLocalWeights] = useState<VulnerabilityWeights>({ ...weights });

  if (!isOpen) return null;

  const total =
    Math.round(
      (localWeights.rainfallDeficit +
        localWeights.waterAreaReduction +
        localWeights.rainfallWaterResponse +
        localWeights.historicalVariability +
        localWeights.persistenceOfLoss) *
        100
    );

  const handleSliderChange = (key: keyof VulnerabilityWeights, valuePct: number) => {
    setLocalWeights((prev) => ({
      ...prev,
      [key]: valuePct / 100,
    }));
  };

  const handleReset = () => {
    setLocalWeights({ ...DEFAULT_WEIGHTS });
  };

  const handleApply = () => {
    onUpdateWeights(localWeights);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Drought Sensitivity Model Weights</h2>
              <p className="text-xs text-slate-400">
                Transparent, white-box indicator weighting (0–100 Score)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              Each indicator is normalized onto a 0–100 scale before applying these weights. The composite score identifies waterbodies with highest drought vulnerability.
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            
            {/* 1. Rainfall Deficit */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-200">1. Rainfall Deficit Weight</span>
                <span className="text-cyan-400 font-mono">
                  {Math.round(localWeights.rainfallDeficit * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={Math.round(localWeights.rainfallDeficit * 100)}
                onChange={(e) => handleSliderChange('rainfallDeficit', parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Penalizes chronic negative CHIRPS precipitation anomalies.
              </div>
            </div>

            {/* 2. Water Area Reduction */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-200">2. Water Area Reduction Weight</span>
                <span className="text-cyan-400 font-mono">
                  {Math.round(localWeights.waterAreaReduction * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={Math.round(localWeights.waterAreaReduction * 100)}
                onChange={(e) => handleSliderChange('waterAreaReduction', parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Measures current surface-water extent contraction against historical average.
              </div>
            </div>

            {/* 3. Rainfall-Water Response (Correlation) */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-200">3. Rainfall–Water Response (Lag Correlation)</span>
                <span className="text-cyan-400 font-mono">
                  {Math.round(localWeights.rainfallWaterResponse * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={Math.round(localWeights.rainfallWaterResponse * 100)}
                onChange={(e) => handleSliderChange('rainfallWaterResponse', parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Reflects Pearson r coupling magnitude at the strongest lag horizon (0–3 months).
              </div>
            </div>

            {/* 4. Historical Variability */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-200">4. Historical Variability (CV)</span>
                <span className="text-cyan-400 font-mono">
                  {Math.round(localWeights.historicalVariability * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={Math.round(localWeights.historicalVariability * 100)}
                onChange={(e) => handleSliderChange('historicalVariability', parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Coefficient of variation representing inherent year-to-year storage volatility.
              </div>
            </div>

            {/* 5. Persistent Water Loss */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-200">5. Persistence of Water Loss</span>
                <span className="text-cyan-400 font-mono">
                  {Math.round(localWeights.persistenceOfLoss * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={Math.round(localWeights.persistenceOfLoss * 100)}
                onChange={(e) => handleSliderChange('persistenceOfLoss', parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Accounts for multi-month consecutive below-baseline water area duration.
              </div>
            </div>

          </div>

          {/* Sum indicator */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Weight Sum:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded ${
                total === 100
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {total}% {total === 100 ? '(Balanced 100%)' : '(Will be auto-normalized)'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/60 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply Weights</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
