import { VulnerabilityWeights, VulnerabilityClass, TimeSeriesPoint, WaterBody } from '../types';

/**
 * Calculates Pearson Correlation Coefficient (r) between two numeric series.
 */
export function calculatePearsonR(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);

  const meanX = xSlice.reduce((sum, val) => sum + val, 0) / n;
  const meanY = ySlice.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = xSlice[i] - meanX;
    const diffY = ySlice[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  return Math.round((numerator / denominator) * 1000) / 1000;
}

/**
 * Calculates Lag Cross-Correlation between Rainfall and Water Area.
 * Lag k means rainfall leads water area by k months.
 */
export function calculateLagCorrelations(
  rainfall: number[],
  waterArea: number[]
): {
  lag0: number;
  lag1: number;
  lag2: number;
  lag3: number;
  optimalLag: number;
  maxCorrelation: number;
} {
  const lag0 = calculatePearsonR(rainfall, waterArea);

  // Lag 1: rainfall[0...N-2] vs waterArea[1...N-1]
  const rainLag1 = rainfall.slice(0, -1);
  const waterLag1 = waterArea.slice(1);
  const lag1 = calculatePearsonR(rainLag1, waterLag1);

  // Lag 2: rainfall[0...N-3] vs waterArea[2...N-1]
  const rainLag2 = rainfall.slice(0, -2);
  const waterLag2 = waterArea.slice(2);
  const lag2 = calculatePearsonR(rainLag2, waterLag2);

  // Lag 3: rainfall[0...N-4] vs waterArea[3...N-1]
  const rainLag3 = rainfall.slice(0, -3);
  const waterLag3 = waterArea.slice(3);
  const lag3 = calculatePearsonR(rainLag3, waterLag3);

  const lags = [
    { lag: 0, r: lag0 },
    { lag: 1, r: lag1 },
    { lag: 2, r: lag2 },
    { lag: 3, r: lag3 },
  ];

  let best = lags[0];
  for (const item of lags) {
    if (item.r > best.r) {
      best = item;
    }
  }

  return {
    lag0,
    lag1,
    lag2,
    lag3,
    optimalLag: best.lag,
    maxCorrelation: best.r,
  };
}

/**
 * Standardizes raw indicator values into 0-100 normalized scores for the vulnerability model.
 */
export function computeSubScores(body: {
  rainfallAnomalyPct: number;
  areaChangePct: number;
  correlation: number;
  historicalVariability: number;
  persistenceMonths: number;
}) {
  // 1. Rainfall Deficit Score (0 - 100):
  // If rainfall anomaly is positive (surplus), score is 0-10.
  // If anomaly is negative, scale -50% deficit to 100.
  let rainfallDeficitScore = 0;
  if (body.rainfallAnomalyPct < 0) {
    rainfallDeficitScore = Math.min(100, Math.max(0, (Math.abs(body.rainfallAnomalyPct) / 45) * 100));
  } else {
    rainfallDeficitScore = Math.max(0, 10 - body.rainfallAnomalyPct * 0.2);
  }

  // 2. Water Area Reduction Score (0 - 100):
  // Negative area change means loss. -40% area change -> ~100.
  let waterAreaReductionScore = 0;
  if (body.areaChangePct < 0) {
    waterAreaReductionScore = Math.min(100, Math.max(0, (Math.abs(body.areaChangePct) / 40) * 100));
  } else {
    waterAreaReductionScore = Math.max(0, 10 - body.areaChangePct * 0.3);
  }

  // 3. Rainfall-Water Response Score (0 - 100):
  // High correlation means the water body has immediate dependence on rainfall and high sensitivity.
  const responseScore = Math.min(100, Math.max(0, Math.abs(body.correlation) * 100));

  // 4. Historical Variability Score (0 - 100):
  const variabilityScore = Math.min(100, Math.max(0, body.historicalVariability));

  // 5. Persistence of Water Loss (0 - 100):
  // 6 or more consecutive months below normal = 100
  const persistenceScore = Math.min(100, Math.max(0, (body.persistenceMonths / 6) * 100));

  return {
    rainfallDeficitScore: Math.round(rainfallDeficitScore),
    waterAreaReductionScore: Math.round(waterAreaReductionScore),
    responseScore: Math.round(responseScore),
    variabilityScore: Math.round(variabilityScore),
    persistenceScore: Math.round(persistenceScore),
  };
}

/**
 * Calculates Transparent Composite Drought Sensitivity Score (0-100) based on weights.
 */
export function calculateDroughtSensitivityScore(
  subScores: {
    rainfallDeficitScore: number;
    waterAreaReductionScore: number;
    responseScore: number;
    variabilityScore: number;
    persistenceScore: number;
  },
  weights: VulnerabilityWeights
): { score: number; classification: VulnerabilityClass } {
  const totalWeight =
    weights.rainfallDeficit +
    weights.waterAreaReduction +
    weights.rainfallWaterResponse +
    weights.historicalVariability +
    weights.persistenceOfLoss;

  const wDeficit = weights.rainfallDeficit / totalWeight;
  const wReduction = weights.waterAreaReduction / totalWeight;
  const wResponse = weights.rainfallWaterResponse / totalWeight;
  const wVariability = weights.historicalVariability / totalWeight;
  const wPersistence = weights.persistenceOfLoss / totalWeight;

  const rawScore =
    subScores.rainfallDeficitScore * wDeficit +
    subScores.waterAreaReductionScore * wReduction +
    subScores.responseScore * wResponse +
    subScores.variabilityScore * wVariability +
    subScores.persistenceScore * wPersistence;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  let classification: VulnerabilityClass = 'Low';
  if (score >= 76) {
    classification = 'Very High';
  } else if (score >= 51) {
    classification = 'High';
  } else if (score >= 26) {
    classification = 'Moderate';
  } else {
    classification = 'Low';
  }

  return { score, classification };
}

/**
 * Recomputes vulnerability score for a waterbody using current weights.
 */
export function recomputeWaterBodyVulnerability(
  body: WaterBody,
  weights: VulnerabilityWeights
): WaterBody {
  const subScores = computeSubScores(body);
  const { score, classification } = calculateDroughtSensitivityScore(subScores, weights);
  return {
    ...body,
    vulnerabilityScore: score,
    vulnerabilityClass: classification,
  };
}

/**
 * Generates an analytical evidence-based explanation for why a waterbody is classified as vulnerable.
 */
export function generateVulnerabilityExplanation(body: WaterBody): string {
  const causes: string[] = [];

  if (body.rainfallAnomalyPct <= -20) {
    causes.push(
      `sustained rainfall deficit (${body.rainfallAnomalyPct.toFixed(1)}% below historical average)`
    );
  } else if (body.rainfallAnomalyPct < -5) {
    causes.push(
      `mild rainfall shortfall (${body.rainfallAnomalyPct.toFixed(1)}% anomaly)`
    );
  }

  if (body.areaChangePct <= -25) {
    causes.push(
      `acute surface-water contraction (${Math.abs(body.areaChangePct).toFixed(1)}% contraction against baseline)`
    );
  } else if (body.areaChangePct < 0) {
    causes.push(
      `surface-water area shrinkage (${Math.abs(body.areaChangePct).toFixed(1)}% reduction)`
    );
  }

  if (body.correlation >= 0.6) {
    causes.push(
      `strong hydrological coupling with rainfall (Pearson r = ${body.correlation.toFixed(2)} at ${body.optimalLagMonths}-month lag)`
    );
  }

  if (body.persistenceMonths >= 4) {
    causes.push(
      `persistent water loss over ${body.persistenceMonths} consecutive observation cycles`
    );
  }

  if (causes.length === 0) {
    return `Water body ${body.id} (${body.name}) currently demonstrates stable hydrological retention with surface-water extent near or above long-term seasonal baselines.`;
  }

  return `Water body ${body.id} (${body.name}) exhibits ${body.vulnerabilityClass.toLowerCase()} drought sensitivity primarily driven by ${causes.join(', and ')}. Catchment replenishment exhibits peak response with a ${body.optimalLagMonths}-month lag from rainfall events.`;
}
