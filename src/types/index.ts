export type VulnerabilityClass = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface TimeSeriesPoint {
  date: string; // "YYYY-MM"
  monthName: string; // e.g. "Aug 2023"
  rainfallMm: number;
  rainfallHistAvgMm: number;
  rainfallAnomalyMm: number;
  rainfallAnomalyPct: number;
  waterAreaKm2: number;
  waterHistAvgKm2: number;
  waterAreaChangePct: number;
  ndwiMean: number;
}

export interface RecommendationItem {
  id: string;
  action: string;
  category: 'Monitoring' | 'Conservation' | 'Groundwater' | 'Emergency' | 'Infrastructure';
  urgency: 'Immediate' | 'High' | 'Moderate' | 'Routine';
  rationale: string;
  leadAgency: string;
}

export interface WaterBody {
  id: string; // e.g. "WB-001"
  name: string;
  district: string;
  state: string;
  basin: string;
  type: 'Reservoir' | 'Natural Lake' | 'Tank Cascade' | 'Wetland';
  coordinates: [number, number]; // [lat, lng] centroid
  polygon: [number, number][]; // Polygon vertices for GeoJSON/Leaflet rendering
  currentAreaKm2: number;
  historicalAvgAreaKm2: number;
  historicalMaxAreaKm2: number;
  historicalMinAreaKm2: number;
  areaChangePct: number;
  waterLossPct: number;
  avgRainfallMm: number;
  currentRainfallMm: number;
  rainfallAnomalyMm: number;
  rainfallAnomalyPct: number;
  correlation: number; // Pearson r (at 0-month or optimal lag)
  optimalLagMonths: number; // 0, 1, 2, or 3
  lagCorrelations: {
    lag0: number;
    lag1: number;
    lag2: number;
    lag3: number;
  };
  historicalVariability: number; // Coefficient of Variation (0-100 normalized)
  persistenceMonths: number; // Consecutive months of below-average water area
  vulnerabilityScore: number; // 0 to 100
  vulnerabilityClass: VulnerabilityClass;
  lastObsDate: string;
  catchmentAreaKm2: number;
  storageCapacityMCM?: number; // Million Cubic Meters
  riskFactors: string[];
  recommendations: RecommendationItem[];
  monthlyTimeSeries: TimeSeriesPoint[];
}

export interface StudyArea {
  id: string;
  name: string;
  region: string;
  country: string;
  center: [number, number];
  zoom: number;
  boundary: [number, number][];
  description: string;
  totalAreaKm2: number;
  climateZone: string;
  waterBodyCount: number;
  defaultDateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface VulnerabilityWeights {
  rainfallDeficit: number; // e.g. 0.25 (25%)
  waterAreaReduction: number; // e.g. 0.35 (35%)
  rainfallWaterResponse: number; // e.g. 0.20 (20%)
  historicalVariability: number; // e.g. 0.10 (10%)
  persistenceOfLoss: number; // e.g. 0.10 (10%)
}

export interface KPISummary {
  totalRainfallMm: number;
  avgRainfallMmPerMonth: number;
  rainfallAnomalyPct: number;
  currentSurfaceWaterAreaKm2: number;
  waterAreaChangePct: number;
  totalWaterBodies: number;
  vulnerableWaterBodiesCount: number;
  severeDeficitWaterBodiesCount: number;
  strongestLagMonths: number;
  meanCorrelation: number;
}

export interface DatasetMeta {
  id: string;
  name: string;
  shortName: string;
  provider: string;
  geeCollectionId: string;
  resolution: string;
  temporalCoverage: string;
  cadence: string;
  purpose: string;
  bandsUsed: string[];
  primaryIndices: string[];
  description: string;
  citationUrl: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'live-map'
  | 'rainfall'
  | 'water'
  | 'response'
  | 'vulnerability'
  | 'waterbodies'
  | 'decision'
  | 'analytics'
  | 'methodology'
  | 'datasets'
  | 'about';
