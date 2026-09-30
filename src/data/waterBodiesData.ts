import { WaterBody, TimeSeriesPoint, RecommendationItem } from '../types';
import { calculatePearsonR, calculateLagCorrelations, computeSubScores, calculateDroughtSensitivityScore } from '../utils/calculations';

// Default model weights
const DEFAULT_WEIGHTS = {
  rainfallDeficit: 0.25,
  waterAreaReduction: 0.35,
  rainfallWaterResponse: 0.20,
  historicalVariability: 0.10,
  persistenceOfLoss: 0.10,
};

// Helper to generate 36 months of realistic monthly data (2022-01 to 2024-12)
function generateHydrologicalTimeSeries(params: {
  baseRainfall: number[]; // 12 monthly climatological averages in mm
  rainfallMultiplier2022: number;
  rainfallMultiplier2023: number; // El Nino year deficit
  rainfallMultiplier2024: number; // Recovery
  baseWaterArea: number; // km2
  retentionFactor: number; // How strongly water persists (0.4 to 0.85)
  responseLagMonths: number;
  elasticity: number; // Response scale
  noiseSeed: number;
}): {
  timeSeries: TimeSeriesPoint[];
  currentAreaKm2: number;
  historicalAvgAreaKm2: number;
  historicalMaxAreaKm2: number;
  historicalMinAreaKm2: number;
  avgRainfallMm: number;
  currentRainfallMm: number;
  persistenceMonths: number;
} {
  const {
    baseRainfall,
    rainfallMultiplier2022,
    rainfallMultiplier2023,
    rainfallMultiplier2024,
    baseWaterArea,
    retentionFactor,
    responseLagMonths,
    elasticity,
  } = params;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const years = [2022, 2023, 2024];
  const multipliers = [rainfallMultiplier2022, rainfallMultiplier2023, rainfallMultiplier2024];

  const series: TimeSeriesPoint[] = [];
  let currentStorage = baseWaterArea;

  const rawRainfallList: number[] = [];
  const rawWaterList: number[] = [];

  // Generate 36 months
  for (let y = 0; y < years.length; y++) {
    const year = years[y];
    const mult = multipliers[y];

    for (let m = 0; m < 12; m++) {
      const histAvgRain = baseRainfall[m];
      // Pseudo random noise based on m and y
      const noise = Math.sin((y * 12 + m) * 1.7) * 0.15;
      const actualRain = Math.max(0, Math.round(histAvgRain * (mult + noise) * 10) / 10);
      rawRainfallList.push(actualRain);
    }
  }

  // Calculate water areas with storage decay and lagged inflow
  for (let i = 0; i < 36; i++) {
    const yIdx = Math.floor(i / 12);
    const mIdx = i % 12;
    const year = years[yIdx];
    const month = mIdx + 1;
    const dateStr = `${year}-${month.toString().padStart(2, '0')}`;
    const monthName = `${months[mIdx]} ${year}`;

    const histAvgRain = baseRainfall[mIdx];
    const actualRain = rawRainfallList[i];

    // Inflow from lagged rainfall
    const laggedIdx = Math.max(0, i - responseLagMonths);
    const laggedRain = rawRainfallList[laggedIdx];
    const rainfallInflowRatio = laggedRain / (baseRainfall[laggedIdx % 12] || 1);

    // Dynamic water area calculation based on retention and lagged inflow
    const targetArea = baseWaterArea * (0.6 + 0.4 * rainfallInflowRatio * elasticity);
    currentStorage = currentStorage * retentionFactor + targetArea * (1 - retentionFactor);

    // Evaporation penalty in hot dry summer months (March - May)
    if (mIdx >= 2 && mIdx <= 4) {
      currentStorage *= 0.92;
    }

    const waterArea = Math.round(currentStorage * 100) / 100;
    rawWaterList.push(waterArea);

    const histAvgWater = Math.round((baseWaterArea * (0.8 + 0.4 * (baseRainfall[mIdx] / 120))) * 100) / 100;

    const rainAnomalyMm = Math.round((actualRain - histAvgRain) * 10) / 10;
    const rainAnomalyPct = histAvgRain > 0 ? Math.round(((actualRain - histAvgRain) / histAvgRain) * 1000) / 10 : 0;
    const waterChangePct = histAvgWater > 0 ? Math.round(((waterArea - histAvgWater) / histAvgWater) * 1000) / 10 : 0;
    
    // Normalized Difference Water Index (NDWI) proxy [-1 to +1]
    const ndwi = Math.round((0.35 + 0.3 * (waterArea / (baseWaterArea * 1.3))) * 1000) / 1000;

    series.push({
      date: dateStr,
      monthName,
      rainfallMm: actualRain,
      rainfallHistAvgMm: histAvgRain,
      rainfallAnomalyMm: rainAnomalyMm,
      rainfallAnomalyPct: rainAnomalyPct,
      waterAreaKm2: waterArea,
      waterHistAvgKm2: histAvgWater,
      waterAreaChangePct: waterChangePct,
      ndwiMean: ndwi,
    });
  }

  // Calculate baseline statistics
  const waterAreas = series.map((s) => s.waterAreaKm2);
  const rainfalls = series.map((s) => s.rainfallMm);

  const historicalAvgAreaKm2 = Math.round((waterAreas.reduce((a, b) => a + b, 0) / waterAreas.length) * 100) / 100;
  const historicalMaxAreaKm2 = Math.max(...waterAreas);
  const historicalMinAreaKm2 = Math.min(...waterAreas);
  const avgRainfallMm = Math.round((rainfalls.reduce((a, b) => a + b, 0) / rainfalls.length) * 10) / 10;

  const currentAreaKm2 = series[series.length - 1].waterAreaKm2;
  const currentRainfallMm = series[series.length - 1].rainfallMm;

  // Persistence: count trailing months where water was below historical average
  let persistenceMonths = 0;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].waterAreaKm2 < series[i].waterHistAvgKm2) {
      persistenceMonths++;
    } else {
      break;
    }
  }

  return {
    timeSeries: series,
    currentAreaKm2,
    historicalAvgAreaKm2,
    historicalMaxAreaKm2,
    historicalMinAreaKm2,
    avgRainfallMm,
    currentRainfallMm,
    persistenceMonths,
  };
}

// Helper to assemble a complete WaterBody object
function buildWaterBody(config: {
  id: string;
  name: string;
  district: string;
  state: string;
  basin: string;
  type: 'Reservoir' | 'Natural Lake' | 'Tank Cascade' | 'Wetland';
  coordinates: [number, number];
  polygon: [number, number][];
  catchmentAreaKm2: number;
  storageCapacityMCM?: number;
  baseRainfall: number[];
  rainfallMultiplier2022: number;
  rainfallMultiplier2023: number;
  rainfallMultiplier2024: number;
  baseWaterArea: number;
  retentionFactor: number;
  responseLagMonths: number;
  elasticity: number;
  historicalVariability: number;
  riskFactors: string[];
  recommendations: RecommendationItem[];
}): WaterBody {
  const ts = generateHydrologicalTimeSeries({
    baseRainfall: config.baseRainfall,
    rainfallMultiplier2022: config.rainfallMultiplier2022,
    rainfallMultiplier2023: config.rainfallMultiplier2023,
    rainfallMultiplier2024: config.rainfallMultiplier2024,
    baseWaterArea: config.baseWaterArea,
    retentionFactor: config.retentionFactor,
    responseLagMonths: config.responseLagMonths,
    elasticity: config.elasticity,
    noiseSeed: config.coordinates[0],
  });

  const rainfallArr = ts.timeSeries.map((t) => t.rainfallMm);
  const waterArr = ts.timeSeries.map((t) => t.waterAreaKm2);

  const lagResult = calculateLagCorrelations(rainfallArr, waterArr);

  const areaChangePct =
    ts.historicalAvgAreaKm2 > 0
      ? Math.round(((ts.currentAreaKm2 - ts.historicalAvgAreaKm2) / ts.historicalAvgAreaKm2) * 1000) / 10
      : 0;

  const waterLossPct = areaChangePct < 0 ? Math.abs(areaChangePct) : 0;

  const currentMonth = ts.timeSeries[ts.timeSeries.length - 1];
  const rainfallAnomalyMm = currentMonth.rainfallAnomalyMm;
  const rainfallAnomalyPct = currentMonth.rainfallAnomalyPct;

  const subScores = computeSubScores({
    rainfallAnomalyPct,
    areaChangePct,
    correlation: lagResult.maxCorrelation,
    historicalVariability: config.historicalVariability,
    persistenceMonths: ts.persistenceMonths,
  });

  const { score, classification } = calculateDroughtSensitivityScore(subScores, DEFAULT_WEIGHTS);

  return {
    id: config.id,
    name: config.name,
    district: config.district,
    state: config.state,
    basin: config.basin,
    type: config.type,
    coordinates: config.coordinates,
    polygon: config.polygon,
    currentAreaKm2: ts.currentAreaKm2,
    historicalAvgAreaKm2: ts.historicalAvgAreaKm2,
    historicalMaxAreaKm2: ts.historicalMaxAreaKm2,
    historicalMinAreaKm2: ts.historicalMinAreaKm2,
    areaChangePct,
    waterLossPct,
    avgRainfallMm: ts.avgRainfallMm,
    currentRainfallMm: ts.currentRainfallMm,
    rainfallAnomalyMm,
    rainfallAnomalyPct,
    correlation: lagResult.maxCorrelation,
    optimalLagMonths: lagResult.optimalLag,
    lagCorrelations: {
      lag0: lagResult.lag0,
      lag1: lagResult.lag1,
      lag2: lagResult.lag2,
      lag3: lagResult.lag3,
    },
    historicalVariability: config.historicalVariability,
    persistenceMonths: ts.persistenceMonths,
    vulnerabilityScore: score,
    vulnerabilityClass: classification,
    lastObsDate: '2024-12-15',
    catchmentAreaKm2: config.catchmentAreaKm2,
    storageCapacityMCM: config.storageCapacityMCM,
    riskFactors: config.riskFactors,
    recommendations: config.recommendations,
    monthlyTimeSeries: ts.timeSeries,
  };
}

// ----------------------------------------------------
// CAUVERY & ARKAVATHI BASIN WATER BODIES (12 Water Bodies)
// ----------------------------------------------------
const CAUVERY_BASE_RAIN = [3.5, 5.2, 14.1, 46.8, 108.4, 78.5, 122.3, 138.6, 142.1, 164.2, 58.7, 12.3];

export const CAUVERY_WATER_BODIES: WaterBody[] = [
  buildWaterBody({
    id: 'WB-001',
    name: 'Krishnarajasagara (KRS) Reservoir',
    district: 'Mandya / Mysuru',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Reservoir',
    coordinates: [12.428, 76.574],
    polygon: [
      [12.455, 76.545],
      [12.468, 76.565],
      [12.458, 76.595],
      [12.435, 76.615],
      [12.412, 76.598],
      [12.405, 76.570],
      [12.420, 76.545],
      [12.455, 76.545],
    ],
    catchmentAreaKm2: 10619,
    storageCapacityMCM: 1398,
    baseRainfall: CAUVERY_BASE_RAIN,
    rainfallMultiplier2022: 1.18,
    rainfallMultiplier2023: 0.62, // Severe deficit in 2023
    rainfallMultiplier2024: 0.88,
    baseWaterArea: 128.5,
    retentionFactor: 0.72,
    responseLagMonths: 1,
    elasticity: 1.05,
    historicalVariability: 48,
    riskFactors: [
      'Catchment rainfall deficit in Kodagu & Hassan upper reaches',
      'High downstream agricultural irrigation demand in Mandya cane belt',
      'Drinking water commitments for Bengaluru metropolitan area',
    ],
    recommendations: [
      {
        id: 'rec-1',
        action: 'Prioritize bi-weekly satellite storage and inflow monitoring',
        category: 'Monitoring',
        urgency: 'Immediate',
        rationale: 'KRS water level dropped below 30% of live storage due to weak 2023 monsoon.',
        leadAgency: 'Cauvery Water Management Authority (CWMA) & WRD Karnataka',
      },
      {
        id: 'rec-2',
        action: 'Ration non-critical canal discharges and enforce volumetric canal metering',
        category: 'Conservation',
        urgency: 'High',
        rationale: 'Reservoir storage recovery is 18.4% below historical baseline.',
        leadAgency: 'Irrigation Department & District Administration Mandya',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-002',
    name: 'Kabini Reservoir (Beechanahalli)',
    district: 'Mysuru',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Reservoir',
    coordinates: [11.975, 76.352],
    polygon: [
      [11.995, 76.325],
      [12.010, 76.350],
      [11.990, 76.375],
      [11.965, 76.368],
      [11.952, 76.340],
      [11.970, 76.320],
      [11.995, 76.325],
    ],
    catchmentAreaKm2: 2142,
    storageCapacityMCM: 553,
    baseRainfall: [6.2, 8.4, 22.0, 75.0, 185.0, 290.0, 420.0, 360.0, 180.0, 195.0, 72.0, 18.0],
    rainfallMultiplier2022: 1.25,
    rainfallMultiplier2023: 0.68,
    rainfallMultiplier2024: 0.95,
    baseWaterArea: 55.4,
    retentionFactor: 0.65,
    responseLagMonths: 1,
    elasticity: 1.15,
    historicalVariability: 42,
    riskFactors: [
      'Catchment in Wayanad vulnerable to localized dry spells',
      'Fast drawdown rate during pre-monsoon summer months',
    ],
    recommendations: [
      {
        id: 'rec-3',
        action: 'Synchronize reservoir release protocols with downstream KRS balancing needs',
        category: 'Infrastructure',
        urgency: 'High',
        rationale: 'Kabini response to catchment rainfall is immediate (1-month lag, r=0.74).',
        leadAgency: 'Water Resources Dept, Karnataka',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-003',
    name: 'Hemavathi Reservoir (Gorur)',
    district: 'Hassan',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Reservoir',
    coordinates: [12.898, 76.052],
    polygon: [
      [12.925, 76.025],
      [12.935, 76.060],
      [12.910, 76.085],
      [12.880, 76.070],
      [12.875, 76.035],
      [12.900, 76.020],
      [12.925, 76.025],
    ],
    catchmentAreaKm2: 2810,
    storageCapacityMCM: 1050,
    baseRainfall: [4.0, 6.0, 18.0, 58.0, 130.0, 180.0, 280.0, 240.0, 135.0, 145.0, 52.0, 14.0],
    rainfallMultiplier2022: 1.12,
    rainfallMultiplier2023: 0.70,
    rainfallMultiplier2024: 0.92,
    baseWaterArea: 84.2,
    retentionFactor: 0.70,
    responseLagMonths: 1,
    elasticity: 1.08,
    historicalVariability: 39,
    riskFactors: [
      'Monsoon variability in Chikmagalur / Sakleshpur catchment',
      'Sedimentation reducing dead storage effectiveness',
    ],
    recommendations: [
      {
        id: 'rec-4',
        action: 'Conduct bathymetric LiDAR survey to assess actual active storage capacity',
        category: 'Infrastructure',
        urgency: 'Moderate',
        rationale: 'Sediment buildup exacerbates perceived water surface contraction.',
        leadAgency: 'State Remote Sensing Application Centre (KSRSAC)',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-004',
    name: 'Harangi Reservoir',
    district: 'Kodagu',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Reservoir',
    coordinates: [12.485, 75.905],
    polygon: [
      [12.505, 75.885],
      [12.515, 75.915],
      [12.495, 75.930],
      [12.470, 75.918],
      [12.468, 75.895],
      [12.505, 75.885],
    ],
    catchmentAreaKm2: 419,
    storageCapacityMCM: 240,
    baseRainfall: [8.0, 10.0, 28.0, 95.0, 220.0, 550.0, 780.0, 620.0, 260.0, 210.0, 80.0, 22.0],
    rainfallMultiplier2022: 1.30,
    rainfallMultiplier2023: 0.72,
    rainfallMultiplier2024: 1.05,
    baseWaterArea: 19.8,
    retentionFactor: 0.58,
    responseLagMonths: 0,
    elasticity: 1.25,
    historicalVariability: 52,
    riskFactors: [
      'Very steep mountainous catchment, high runoff velocity, rapid drain-down',
      'Flash deficit during erratic monsoon breaks',
    ],
    recommendations: [
      {
        id: 'rec-5',
        action: 'Install real-time automated weather stations (AWS) across upper Harangi basin',
        category: 'Monitoring',
        urgency: 'High',
        rationale: '0-month lag correlation (r=0.82) confirms immediate surface-water runoff sensitivity.',
        leadAgency: 'IMD & Karnataka Disaster Management Authority (KSDMA)',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-005',
    name: 'Thippagondanahalli (TG Halli) Reservoir',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Reservoir',
    coordinates: [12.965, 77.345],
    polygon: [
      [12.985, 77.325],
      [12.992, 77.355],
      [12.975, 77.370],
      [12.950, 77.360],
      [12.945, 77.330],
      [12.985, 77.325],
    ],
    catchmentAreaKm2: 1453,
    storageCapacityMCM: 95,
    baseRainfall: [2.5, 4.0, 12.0, 42.0, 98.0, 68.0, 95.0, 115.0, 140.0, 155.0, 55.0, 10.0],
    rainfallMultiplier2022: 1.05,
    rainfallMultiplier2023: 0.48, // Critical drought
    rainfallMultiplier2024: 0.78,
    baseWaterArea: 14.6,
    retentionFactor: 0.60,
    responseLagMonths: 2,
    elasticity: 1.30,
    historicalVariability: 65,
    riskFactors: [
      'Extreme rainfall deficit combined with upstream check dams and eucalyptus plantations',
      'Arkavathi river inflow virtually dry during 2023-2024 drought',
      'Severe surface-water contraction (>45% below historical average)',
    ],
    recommendations: [
      {
        id: 'rec-6',
        action: 'Prioritize drought mitigation intervention and upstream stream clearance',
        category: 'Emergency',
        urgency: 'Immediate',
        rationale: 'Critical surface-water shrinkage (-46.2%) combined with 8 months persistent deficit.',
        leadAgency: 'Bengaluru Water Supply and Sewerage Board (BWSSB) & Arkavathi River Basin Authority',
      },
      {
        id: 'rec-7',
        action: 'Enforce ban on uncontrolled groundwater over-extraction in catchment recharge zone',
        category: 'Groundwater',
        urgency: 'High',
        rationale: 'Baseflow contribution to the reservoir has dropped to historic lows.',
        leadAgency: 'Central Ground Water Board (CGWB) & Minor Irrigation Dept',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-006',
    name: 'Hesaraghatta Lake',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Natural Lake',
    coordinates: [13.145, 77.485],
    polygon: [
      [13.165, 77.468],
      [13.170, 77.498],
      [13.150, 77.510],
      [13.130, 77.495],
      [13.128, 77.472],
      [13.165, 77.468],
    ],
    catchmentAreaKm2: 520,
    storageCapacityMCM: 28,
    baseRainfall: [2.8, 4.2, 11.5, 40.0, 92.0, 65.0, 92.0, 110.0, 135.0, 150.0, 52.0, 9.5],
    rainfallMultiplier2022: 1.02,
    rainfallMultiplier2023: 0.44, // Very dry
    rainfallMultiplier2024: 0.72,
    baseWaterArea: 4.8,
    retentionFactor: 0.50,
    responseLagMonths: 2,
    elasticity: 1.45,
    historicalVariability: 74,
    riskFactors: [
      'Very High Drought Sensitivity Score (86/100)',
      'Highly sensitive to multi-month rainfall deficits; dries completely without monsoon replenishment',
      'Encroachment of feeder channels and biodiversity habitat vulnerability',
    ],
    recommendations: [
      {
        id: 'rec-8',
        action: 'Designate as protected drought-refuge wetland and initiate catchment revival',
        category: 'Conservation',
        urgency: 'Immediate',
        rationale: 'Surface-water area contracted by 54% with 9 consecutive dry observation cycles.',
        leadAgency: 'Karnataka State Wetland Authority & Forest Department',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-007',
    name: 'Manchanabele Dam & Reservoir',
    district: 'Ramanagara',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Reservoir',
    coordinates: [12.875, 77.332],
    polygon: [
      [12.895, 77.315],
      [12.905, 77.340],
      [12.885, 77.355],
      [12.860, 77.342],
      [12.858, 77.320],
      [12.895, 77.315],
    ],
    catchmentAreaKm2: 680,
    storageCapacityMCM: 35,
    baseRainfall: [3.0, 4.8, 13.0, 44.0, 102.0, 72.0, 105.0, 122.0, 148.0, 160.0, 58.0, 11.0],
    rainfallMultiplier2022: 1.08,
    rainfallMultiplier2023: 0.55,
    rainfallMultiplier2024: 0.82,
    baseWaterArea: 6.2,
    retentionFactor: 0.62,
    responseLagMonths: 1,
    elasticity: 1.20,
    historicalVariability: 58,
    riskFactors: [
      'Downstream recipient of Arkavathi sewage and erratic runoff',
      'Rapid storage drop in non-monsoon seasons',
    ],
    recommendations: [
      {
        id: 'rec-9',
        action: 'Monitor water quality indices (NDTI & NDCI) alongside NDWI water extent',
        category: 'Monitoring',
        urgency: 'High',
        rationale: 'Low water extent concentrates agricultural effluents and upstream contaminants.',
        leadAgency: 'Karnataka State Pollution Control Board (KSPCB)',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-008',
    name: 'Kanva Reservoir',
    district: 'Ramanagara',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Reservoir',
    coordinates: [12.712, 77.205],
    polygon: [
      [12.730, 77.190],
      [12.738, 77.218],
      [12.720, 77.230],
      [12.698, 77.215],
      [12.695, 77.195],
      [12.730, 77.190],
    ],
    catchmentAreaKm2: 340,
    storageCapacityMCM: 24,
    baseRainfall: [3.2, 5.0, 13.8, 45.0, 105.0, 75.0, 110.0, 128.0, 150.0, 162.0, 56.0, 11.5],
    rainfallMultiplier2022: 1.10,
    rainfallMultiplier2023: 0.58,
    rainfallMultiplier2024: 0.85,
    baseWaterArea: 5.1,
    retentionFactor: 0.64,
    responseLagMonths: 1,
    elasticity: 1.18,
    historicalVariability: 54,
    riskFactors: [
      'Rainfall anomaly -28% in 2023-24',
      'High siltation from degraded agricultural upper slopes',
    ],
    recommendations: [
      {
        id: 'rec-10',
        action: 'Implement watershed catchment contour bunding and desiltation',
        category: 'Conservation',
        urgency: 'Moderate',
        rationale: 'Soil conservation in upper Kanva catchment will increase infiltration and baseflow.',
        leadAgency: 'Watershed Development Department, Karnataka',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-009',
    name: 'Bellandur Lake',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Natural Lake',
    coordinates: [12.935, 77.670],
    polygon: [
      [12.952, 77.652],
      [12.955, 77.685],
      [12.935, 77.698],
      [12.918, 77.675],
      [12.922, 77.655],
      [12.952, 77.652],
    ],
    catchmentAreaKm2: 287,
    storageCapacityMCM: 18,
    baseRainfall: [2.5, 4.0, 12.0, 42.0, 95.0, 70.0, 98.0, 118.0, 145.0, 160.0, 55.0, 10.0],
    rainfallMultiplier2022: 1.15,
    rainfallMultiplier2023: 0.75, // Urban baseflow insulates total area
    rainfallMultiplier2024: 0.90,
    baseWaterArea: 3.65,
    retentionFactor: 0.88, // Urban treated/untreated water creates artificial retention
    responseLagMonths: 0,
    elasticity: 0.65,
    historicalVariability: 28,
    riskFactors: [
      'Urban runoff surges during intense rains, weed proliferation masking open water in optical indices',
      'Artificial persistence due to municipal wastewater discharge',
    ],
    recommendations: [
      {
        id: 'rec-11',
        action: 'Incorporate Sentinel-1 SAR GRD to penetrate water hyacinth canopy for true water extent',
        category: 'Monitoring',
        urgency: 'Moderate',
        rationale: 'Optical NDWI underestimates open water area when dense floating macrophyte mats form.',
        leadAgency: 'BBMP Lake Division & KSRSAC',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-010',
    name: 'Varthur Lake',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Natural Lake',
    coordinates: [12.942, 77.725],
    polygon: [
      [12.955, 77.710],
      [12.960, 77.742],
      [12.940, 77.750],
      [12.925, 77.732],
      [12.932, 77.712],
      [12.955, 77.710],
    ],
    catchmentAreaKm2: 125,
    storageCapacityMCM: 12,
    baseRainfall: [2.5, 4.0, 12.0, 42.0, 95.0, 70.0, 98.0, 118.0, 145.0, 160.0, 55.0, 10.0],
    rainfallMultiplier2022: 1.14,
    rainfallMultiplier2023: 0.74,
    rainfallMultiplier2024: 0.88,
    baseWaterArea: 2.2,
    retentionFactor: 0.85,
    responseLagMonths: 0,
    elasticity: 0.70,
    historicalVariability: 31,
    riskFactors: [
      'Downstream receiving waterbody in Bellandur cascade',
      'Heavy siltation and recent desilting civil works altering surface boundary',
    ],
    recommendations: [
      {
        id: 'rec-12',
        action: 'Maintain automated sensor logs at outlet weirs to quantify storm runoff surge',
        category: 'Monitoring',
        urgency: 'Routine',
        rationale: 'Provides empirical calibration for urban rainfall-runoff response models.',
        leadAgency: 'BWSSB & Lake Development Authority',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-011',
    name: 'Byramangala Tank',
    district: 'Ramanagara',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Tank Cascade',
    coordinates: [12.785, 77.415],
    polygon: [
      [12.802, 77.402],
      [12.808, 77.428],
      [12.790, 77.435],
      [12.770, 77.422],
      [12.772, 77.405],
      [12.802, 77.402],
    ],
    catchmentAreaKm2: 450,
    storageCapacityMCM: 22,
    baseRainfall: [2.8, 4.5, 12.5, 43.0, 100.0, 70.0, 102.0, 120.0, 146.0, 158.0, 56.0, 10.8],
    rainfallMultiplier2022: 1.09,
    rainfallMultiplier2023: 0.60,
    rainfallMultiplier2024: 0.84,
    baseWaterArea: 4.4,
    retentionFactor: 0.68,
    responseLagMonths: 1,
    elasticity: 1.12,
    historicalVariability: 46,
    riskFactors: [
      'Heavy nutrient loading combined with agricultural draft',
      'Rainfall anomaly -24.8% leading to 28% water surface contraction',
    ],
    recommendations: [
      {
        id: 'rec-13',
        action: 'Upgrade tank bund safety and institute community irrigation rotational scheduling',
        category: 'Conservation',
        urgency: 'Moderate',
        rationale: 'Reduces peak summer evaporation losses while guaranteeing tail-end farm supplies.',
        leadAgency: 'Panchayat Raj & Minor Irrigation Dept',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-012',
    name: 'Yele Mallappa Shetty Lake',
    district: 'Bengaluru East',
    state: 'Karnataka',
    basin: 'Cauvery–Arkavathi Basin',
    type: 'Natural Lake',
    coordinates: [13.045, 77.742],
    polygon: [
      [13.060, 77.728],
      [13.065, 77.755],
      [13.048, 77.765],
      [13.030, 77.750],
      [13.032, 77.732],
      [13.060, 77.728],
    ],
    catchmentAreaKm2: 260,
    storageCapacityMCM: 15,
    baseRainfall: [2.6, 4.2, 11.8, 41.0, 94.0, 68.0, 96.0, 116.0, 142.0, 154.0, 54.0, 10.2],
    rainfallMultiplier2022: 1.06,
    rainfallMultiplier2023: 0.52,
    rainfallMultiplier2024: 0.79,
    baseWaterArea: 2.9,
    retentionFactor: 0.55,
    responseLagMonths: 1,
    elasticity: 1.35,
    historicalVariability: 62,
    riskFactors: [
      'High drought sensitivity (Score: 78/100, Very High)',
      '38.5% water area shrinkage during dry spell',
      'Severe encroachment pressure on natural shoreline wetlands',
    ],
    recommendations: [
      {
        id: 'rec-14',
        action: 'Delineate satellite buffer zone and clear feeder channel blockages',
        category: 'Conservation',
        urgency: 'High',
        rationale: 'Rapid replenishment occurs within 1 month of convective pre-monsoon showers if feeder streams are unobstructed.',
        leadAgency: 'Lake Development Authority & Bengaluru Urban DC',
      },
    ],
  }),
];

// ----------------------------------------------------
// MARATHWADA WATER BODIES (8 Water Bodies)
// ----------------------------------------------------
const MARATHWADA_BASE_RAIN = [1.2, 2.8, 7.5, 12.0, 24.5, 135.0, 195.0, 175.0, 160.0, 65.0, 18.0, 4.5];

export const MARATHWADA_WATER_BODIES: WaterBody[] = [
  buildWaterBody({
    id: 'WB-M01',
    name: 'Jayakwadi Dam (Nath Sagar)',
    district: 'Chhatrapati Sambhajinagar (Aurangabad)',
    state: 'Maharashtra',
    basin: 'Marathwada Drought Zone (Godavari Sub-basin)',
    type: 'Reservoir',
    coordinates: [19.495, 75.385],
    polygon: [
      [19.535, 75.340],
      [19.545, 75.415],
      [19.505, 75.445],
      [19.465, 75.420],
      [19.460, 75.360],
      [19.535, 75.340],
    ],
    catchmentAreaKm2: 21750,
    storageCapacityMCM: 2909,
    baseRainfall: MARATHWADA_BASE_RAIN,
    rainfallMultiplier2022: 1.15,
    rainfallMultiplier2023: 0.54, // Severe Marathwada drought
    rainfallMultiplier2024: 0.85,
    baseWaterArea: 350.0,
    retentionFactor: 0.74,
    responseLagMonths: 1,
    elasticity: 1.15,
    historicalVariability: 58,
    riskFactors: [
      'Chronic rainfall deficit in Marathwada agro-climatic zone',
      'Heavy upstream retention in Nashik / Ahmednagar dams',
      'Massive dead storage with 40% surface-water contraction during El Nino dry spells',
    ],
    recommendations: [
      {
        id: 'm-rec-1',
        action: 'Implement upstream equitable water-sharing protocol under Maharashtra Water Resources Regulatory Authority (MWRRA)',
        category: 'Conservation',
        urgency: 'Immediate',
        rationale: 'Jayakwadi active storage hit dead storage buffer following 46% rainfall shortfall.',
        leadAgency: 'MWRRA & Godavari Marathwada Irrigation Development Corp (GMIDC)',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-M02',
    name: 'Majalgaon Dam',
    district: 'Beed',
    state: 'Maharashtra',
    basin: 'Marathwada Drought Zone (Godavari Sub-basin)',
    type: 'Reservoir',
    coordinates: [19.145, 76.220],
    polygon: [
      [19.175, 76.195],
      [19.185, 76.235],
      [19.155, 76.250],
      [19.125, 76.232],
      [19.122, 76.205],
      [19.175, 76.195],
    ],
    catchmentAreaKm2: 3840,
    storageCapacityMCM: 454,
    baseRainfall: MARATHWADA_BASE_RAIN,
    rainfallMultiplier2022: 1.10,
    rainfallMultiplier2023: 0.48,
    rainfallMultiplier2024: 0.78,
    baseWaterArea: 78.4,
    retentionFactor: 0.62,
    responseLagMonths: 1,
    elasticity: 1.25,
    historicalVariability: 66,
    riskFactors: [
      'Beed district recognized as epicenter of agrarian water distress',
      'Over-reliance on Jayakwadi right bank canal which fails during dry years',
    ],
    recommendations: [
      {
        id: 'm-rec-2',
        action: 'Prioritize drinking water preservation over agricultural release',
        category: 'Emergency',
        urgency: 'Immediate',
        rationale: 'Water area contracted by 48.6%, posing acute summer drinking water shortages.',
        leadAgency: 'District Collector Beed & Water Supply Dept',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-M03',
    name: 'Yeldari Reservoir',
    district: 'Parbhani / Hingoli',
    state: 'Maharashtra',
    basin: 'Marathwada Drought Zone (Godavari Sub-basin)',
    type: 'Reservoir',
    coordinates: [19.725, 76.735],
    polygon: [
      [19.755, 76.715],
      [19.765, 76.755],
      [19.735, 76.770],
      [19.705, 76.745],
      [19.708, 76.720],
      [19.755, 76.715],
    ],
    catchmentAreaKm2: 7330,
    storageCapacityMCM: 934,
    baseRainfall: MARATHWADA_BASE_RAIN,
    rainfallMultiplier2022: 1.20,
    rainfallMultiplier2023: 0.58,
    rainfallMultiplier2024: 0.88,
    baseWaterArea: 102.5,
    retentionFactor: 0.70,
    responseLagMonths: 1,
    elasticity: 1.10,
    historicalVariability: 52,
    riskFactors: [
      'Purna river sub-basin erratic monsoon pulses',
      'High seasonal evaporation rates (>2800 mm/year)',
    ],
    recommendations: [
      {
        id: 'm-rec-3',
        action: 'Deploy satellite-based evaporation assessment and investigate solar floating panel shading',
        category: 'Infrastructure',
        urgency: 'Moderate',
        rationale: 'Extreme open water evaporation accounts for up to 25% of annual storage losses in Marathwada.',
        leadAgency: 'Maharashtra Energy Development Agency (MEDA) & Water Resources Dept',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-M04',
    name: 'Lower Terna Reservoir (Makni)',
    district: 'Dharashiv (Osmanabad)',
    state: 'Maharashtra',
    basin: 'Marathwada Drought Zone (Godavari Sub-basin)',
    type: 'Reservoir',
    coordinates: [18.255, 76.245],
    polygon: [
      [18.280, 76.225],
      [18.288, 76.262],
      [18.260, 76.275],
      [18.235, 76.255],
      [18.238, 76.230],
      [18.280, 76.225],
    ],
    catchmentAreaKm2: 1820,
    storageCapacityMCM: 120,
    baseRainfall: MARATHWADA_BASE_RAIN,
    rainfallMultiplier2022: 1.05,
    rainfallMultiplier2023: 0.42, // Extreme drought
    rainfallMultiplier2024: 0.72,
    baseWaterArea: 22.4,
    retentionFactor: 0.52,
    responseLagMonths: 2,
    elasticity: 1.40,
    historicalVariability: 72,
    riskFactors: [
      'Very High Drought Sensitivity Score (89/100)',
      'Water surface area dropped 56% below historical mean',
      'Rainfall deficit -44% with 10 months persistent contraction',
    ],
    recommendations: [
      {
        id: 'm-rec-4',
        action: 'Activate emergency drought contingency pipeline and groundwater tanker rationing',
        category: 'Emergency',
        urgency: 'Immediate',
        rationale: 'Acute reservoir desiccation threatens urban drinking water for Dharashiv district.',
        leadAgency: 'Disaster Management Unit Dharashiv & Rural Development Dept',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-M05',
    name: 'Vishnupuri Dam',
    district: 'Nanded',
    state: 'Maharashtra',
    basin: 'Marathwada Drought Zone (Godavari Sub-basin)',
    type: 'Reservoir',
    coordinates: [19.125, 77.285],
    polygon: [
      [19.145, 77.265],
      [19.155, 77.298],
      [19.130, 77.310],
      [19.110, 77.295],
      [19.112, 77.272],
      [19.145, 77.265],
    ],
    catchmentAreaKm2: 48600,
    storageCapacityMCM: 80,
    baseRainfall: MARATHWADA_BASE_RAIN,
    rainfallMultiplier2022: 1.18,
    rainfallMultiplier2023: 0.65,
    rainfallMultiplier2024: 0.90,
    baseWaterArea: 18.5,
    retentionFactor: 0.65,
    responseLagMonths: 0,
    elasticity: 1.05,
    historicalVariability: 45,
    riskFactors: [
      'High lift irrigation scheme reliance for Nanded city',
      'Rapid sedimentation on Godavari mainstream',
    ],
    recommendations: [
      {
        id: 'm-rec-5',
        action: 'Maintain automated telemetry on barrage gates and prevent upstream sand mining',
        category: 'Infrastructure',
        urgency: 'High',
        rationale: 'Protects hydraulic stability and barrage storage integrity.',
        leadAgency: 'Irrigation Dept Nanded',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-M06',
    name: 'Sina Kolegaon Reservoir',
    district: 'Dharashiv (Osmanabad)',
    state: 'Maharashtra',
    basin: 'Marathwada Drought Zone (Godavari Sub-basin)',
    type: 'Reservoir',
    coordinates: [18.420, 75.785],
    polygon: [
      [18.445, 75.765],
      [18.452, 75.802],
      [18.428, 75.815],
      [18.402, 75.798],
      [18.405, 75.772],
      [18.445, 75.765],
    ],
    catchmentAreaKm2: 4120,
    storageCapacityMCM: 150,
    baseRainfall: MARATHWADA_BASE_RAIN,
    rainfallMultiplier2022: 1.02,
    rainfallMultiplier2023: 0.38, // Severe
    rainfallMultiplier2024: 0.68,
    baseWaterArea: 28.5,
    retentionFactor: 0.48,
    responseLagMonths: 2,
    elasticity: 1.50,
    historicalVariability: 78,
    riskFactors: [
      'Chronic zero-live-storage phenomenon in drought years',
      'Rain shadow location with highest coefficient of variation in Marathwada',
    ],
    recommendations: [
      {
        id: 'm-rec-6',
        action: 'Transition command area cropping pattern away from water-intensive sugarcane to millets and pulses',
        category: 'Conservation',
        urgency: 'Immediate',
        rationale: 'Hydrological balance is unsustainable under high-crop-water demand during rainfall anomalies.',
        leadAgency: 'Agriculture Department Maharashtra & Krishi Vigyan Kendra',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-M07',
    name: 'Manjara Reservoir (Dhanegaon)',
    district: 'Beed / Latur',
    state: 'Maharashtra',
    basin: 'Marathwada Drought Zone (Godavari Sub-basin)',
    type: 'Reservoir',
    coordinates: [18.720, 76.115],
    polygon: [
      [18.745, 76.095],
      [18.752, 76.132],
      [18.730, 76.145],
      [18.705, 76.128],
      [18.708, 76.102],
      [18.745, 76.095],
    ],
    catchmentAreaKm2: 5210,
    storageCapacityMCM: 224,
    baseRainfall: MARATHWADA_BASE_RAIN,
    rainfallMultiplier2022: 1.10,
    rainfallMultiplier2023: 0.45,
    rainfallMultiplier2024: 0.75,
    baseWaterArea: 42.0,
    retentionFactor: 0.55,
    responseLagMonths: 1,
    elasticity: 1.30,
    historicalVariability: 68,
    riskFactors: [
      'Latur municipal water supply hub (site of historic "Water Train" Jaldoot in 2016)',
      'Highly sensitive to 1-month rainfall lag (r = 0.76)',
    ],
    recommendations: [
      {
        id: 'm-rec-7',
        action: 'Establish satellite-guided early warning drought threshold at 40% live capacity',
        category: 'Monitoring',
        urgency: 'High',
        rationale: 'Provides 60-day buffer lead time to organize alternative municipal drinking water reserves.',
        leadAgency: 'Latur Municipal Corporation & WRD',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-M08',
    name: 'Siddheshwar Dam',
    district: 'Hingoli',
    state: 'Maharashtra',
    basin: 'Marathwada Drought Zone (Godavari Sub-basin)',
    type: 'Reservoir',
    coordinates: [19.585, 77.015],
    polygon: [
      [19.610, 76.995],
      [19.618, 77.032],
      [19.595, 77.045],
      [19.570, 77.028],
      [19.572, 77.002],
      [19.610, 76.995],
    ],
    catchmentAreaKm2: 7800,
    storageCapacityMCM: 250,
    baseRainfall: MARATHWADA_BASE_RAIN,
    rainfallMultiplier2022: 1.16,
    rainfallMultiplier2023: 0.60,
    rainfallMultiplier2024: 0.85,
    baseWaterArea: 32.5,
    retentionFactor: 0.64,
    responseLagMonths: 1,
    elasticity: 1.15,
    historicalVariability: 50,
    riskFactors: [
      'Downstream from Yeldari, susceptible to cascade release restrictions',
      'Rapid summer drawdown',
    ],
    recommendations: [
      {
        id: 'm-rec-8',
        action: 'Optimize twin-reservoir rule curve between Yeldari and Siddheshwar',
        category: 'Infrastructure',
        urgency: 'Moderate',
        rationale: 'Coordinated operation minimizes spillway waste during surplus and cushions drought deficits.',
        leadAgency: 'Purna Basin Water Management Committee',
      },
    ],
  }),
];

// ----------------------------------------------------
// COLORADO & LAKE MEAD BASIN (6 Water Bodies)
// ----------------------------------------------------
const COLORADO_BASE_RAIN = [18.0, 16.5, 14.2, 8.5, 4.2, 2.1, 12.5, 18.2, 10.5, 9.8, 11.2, 16.8];

export const COLORADO_WATER_BODIES: WaterBody[] = [
  buildWaterBody({
    id: 'WB-C01',
    name: 'Lake Mead (Hoover Dam)',
    district: 'Clark / Mohave',
    state: 'Nevada / Arizona',
    basin: 'Lower Colorado River & Lake Mead Basin',
    type: 'Reservoir',
    coordinates: [36.145, -114.425],
    polygon: [
      [36.225, -114.520],
      [36.265, -114.380],
      [36.185, -114.280],
      [36.085, -114.360],
      [36.070, -114.490],
      [36.225, -114.520],
    ],
    catchmentAreaKm2: 435000,
    storageCapacityMCM: 32220,
    baseRainfall: COLORADO_BASE_RAIN,
    rainfallMultiplier2022: 0.82,
    rainfallMultiplier2023: 1.15, // Remarkable snowpack wet winter 2023
    rainfallMultiplier2024: 0.92,
    baseWaterArea: 320.0,
    retentionFactor: 0.94, // Huge multi-year reservoir
    responseLagMonths: 3, // Multi-month snowmelt runoff lag
    elasticity: 0.75,
    historicalVariability: 35,
    riskFactors: [
      'Multi-decadal Southwestern megadrought structural deficit',
      'Tier 1 / Tier 2 shortage declaration triggers impacting downstream allotments',
    ],
    recommendations: [
      {
        id: 'c-rec-1',
        action: 'Implement Colorado River Post-2026 Operational Guidelines conservation quotas',
        category: 'Conservation',
        urgency: 'Immediate',
        rationale: 'Lake Mead surface extent remains 32% below full-pool historical baseline despite 2023 snowmelt.',
        leadAgency: 'U.S. Bureau of Reclamation & Lower Basin States',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-C02',
    name: 'Lake Mohave (Davis Dam)',
    district: 'Clark / Mohave',
    state: 'Nevada / Arizona',
    basin: 'Lower Colorado River & Lake Mead Basin',
    type: 'Reservoir',
    coordinates: [35.425, -114.655],
    polygon: [
      [35.485, -114.685],
      [35.495, -114.630],
      [35.415, -114.620],
      [35.365, -114.650],
      [35.370, -114.690],
      [35.485, -114.685],
    ],
    catchmentAreaKm2: 440000,
    storageCapacityMCM: 2240,
    baseRainfall: COLORADO_BASE_RAIN,
    rainfallMultiplier2022: 0.85,
    rainfallMultiplier2023: 1.10,
    rainfallMultiplier2024: 0.94,
    baseWaterArea: 114.0,
    retentionFactor: 0.88,
    responseLagMonths: 2,
    elasticity: 0.80,
    historicalVariability: 25,
    riskFactors: ['Regulated reregulation storage for Hoover Dam discharges'],
    recommendations: [
      {
        id: 'c-rec-2',
        action: 'Monitor riparian temperature and evaporative loss dynamics',
        category: 'Monitoring',
        urgency: 'Routine',
        rationale: 'Maintains required environmental flows for endangered native razorback sucker.',
        leadAgency: 'US Fish and Wildlife Service & Bureau of Reclamation',
      },
    ],
  }),

  buildWaterBody({
    id: 'WB-C03',
    name: 'Lake Havasu (Parker Dam)',
    district: 'San Bernardino / La Paz',
    state: 'California / Arizona',
    basin: 'Lower Colorado River & Lake Mead Basin',
    type: 'Reservoir',
    coordinates: [34.455, -114.345],
    polygon: [
      [34.505, -114.385],
      [34.515, -114.320],
      [34.445, -114.305],
      [34.405, -114.335],
      [34.410, -114.390],
      [34.505, -114.385],
    ],
    catchmentAreaKm2: 463000,
    storageCapacityMCM: 798,
    baseRainfall: COLORADO_BASE_RAIN,
    rainfallMultiplier2022: 0.84,
    rainfallMultiplier2023: 1.12,
    rainfallMultiplier2024: 0.95,
    baseWaterArea: 79.5,
    retentionFactor: 0.90,
    responseLagMonths: 2,
    elasticity: 0.70,
    historicalVariability: 22,
    riskFactors: ['Intake point for Central Arizona Project (CAP) & Colorado River Aqueduct to Southern California'],
    recommendations: [
      {
        id: 'c-rec-3',
        action: 'Enhance automated intake turbidity and water elevation sensor feedback',
        category: 'Monitoring',
        urgency: 'Moderate',
        rationale: 'Ensures uninterrupted urban conveyance for 19+ million municipal water consumers.',
        leadAgency: 'Metropolitan Water District of Southern California (MWD) & CAP',
      },
    ],
  }),
];

/**
 * Returns water bodies for the selected study area.
 */
export function getWaterBodiesByStudyArea(studyAreaId: string): WaterBody[] {
  switch (studyAreaId) {
    case 'marathwada-godavari':
      return MARATHWADA_WATER_BODIES;
    case 'colorado-mead':
      return COLORADO_WATER_BODIES;
    case 'cauvery-arkavathi':
    default:
      return CAUVERY_WATER_BODIES;
  }
}
