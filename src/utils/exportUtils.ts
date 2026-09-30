import { WaterBody, StudyArea } from '../types';

/**
 * Downloads a text file (CSV/JSON) in the browser.
 */
function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports current water bodies and vulnerability indicators to CSV.
 */
export function exportWaterBodiesToCSV(waterBodies: WaterBody[], studyAreaName: string) {
  const headers = [
    'Water Body ID',
    'Name',
    'District',
    'State',
    'Basin',
    'Type',
    'Latitude',
    'Longitude',
    'Current Area (km2)',
    'Historical Avg Area (km2)',
    'Historical Max Area (km2)',
    'Historical Min Area (km2)',
    'Area Change (%)',
    'Water Loss (%)',
    'Avg Rainfall (mm)',
    'Current Rainfall (mm)',
    'Rainfall Anomaly (mm)',
    'Rainfall Anomaly (%)',
    'Pearson Correlation (r)',
    'Strongest Lag (months)',
    'Lag 0 (r)',
    'Lag 1 (r)',
    'Lag 2 (r)',
    'Lag 3 (r)',
    'Historical Variability CV',
    'Persistence (months)',
    'Drought Sensitivity Score (0-100)',
    'Vulnerability Class',
    'Last Observation Date',
  ];

  const rows = waterBodies.map((wb) => [
    `"${wb.id}"`,
    `"${wb.name}"`,
    `"${wb.district}"`,
    `"${wb.state}"`,
    `"${wb.basin}"`,
    `"${wb.type}"`,
    wb.coordinates[0],
    wb.coordinates[1],
    wb.currentAreaKm2,
    wb.historicalAvgAreaKm2,
    wb.historicalMaxAreaKm2,
    wb.historicalMinAreaKm2,
    wb.areaChangePct,
    wb.waterLossPct,
    wb.avgRainfallMm,
    wb.currentRainfallMm,
    wb.rainfallAnomalyMm,
    wb.rainfallAnomalyPct,
    wb.correlation,
    wb.optimalLagMonths,
    wb.lagCorrelations.lag0,
    wb.lagCorrelations.lag1,
    wb.lagCorrelations.lag2,
    wb.lagCorrelations.lag3,
    wb.historicalVariability,
    wb.persistenceMonths,
    wb.vulnerabilityScore,
    `"${wb.vulnerabilityClass}"`,
    `"${wb.lastObsDate}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const safeName = studyAreaName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadFile(csvContent, `hydropulse_${safeName}_waterbodies_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports detailed monthly time-series data across all waterbodies to CSV.
 */
export function exportTimeSeriesToCSV(waterBodies: WaterBody[], studyAreaName: string) {
  const headers = [
    'Water Body ID',
    'Water Body Name',
    'Date (YYYY-MM)',
    'Month Name',
    'Observed Rainfall (mm)',
    'Hist Avg Rainfall (mm)',
    'Rainfall Anomaly (mm)',
    'Rainfall Anomaly (%)',
    'Observed Water Area (km2)',
    'Hist Avg Water Area (km2)',
    'Water Area Change (%)',
    'Mean NDWI Proxy',
  ];

  const rows: string[] = [];

  waterBodies.forEach((wb) => {
    wb.monthlyTimeSeries.forEach((ts) => {
      rows.push([
        `"${wb.id}"`,
        `"${wb.name}"`,
        `"${ts.date}"`,
        `"${ts.monthName}"`,
        ts.rainfallMm,
        ts.rainfallHistAvgMm,
        ts.rainfallAnomalyMm,
        ts.rainfallAnomalyPct,
        ts.waterAreaKm2,
        ts.waterHistAvgKm2,
        ts.waterAreaChangePct,
        ts.ndwiMean,
      ].join(','));
    });
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const safeName = studyAreaName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadFile(csvContent, `hydropulse_${safeName}_monthly_timeseries_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports standard GeoJSON FeatureCollection of water bodies.
 */
export function exportWaterBodiesToGeoJSON(waterBodies: WaterBody[], studyArea: StudyArea) {
  const geojson = {
    type: 'FeatureCollection',
    metadata: {
      generatedBy: 'HydroPulse - Rainfall–Surface Water Response Intelligence',
      studyAreaId: studyArea.id,
      studyAreaName: studyArea.name,
      exportTimestamp: new Date().toISOString(),
      problemStatement: 'Problem Statement 2.4 – Rainfall–Surface Water Response Analysis',
      totalFeatures: waterBodies.length,
    },
    features: waterBodies.map((wb) => {
      // Coordinates in GeoJSON are [longitude, latitude]
      const polygonCoords = wb.polygon.map(([lat, lng]) => [lng, lat]);
      // Ensure closed loop
      if (
        polygonCoords.length > 0 &&
        (polygonCoords[0][0] !== polygonCoords[polygonCoords.length - 1][0] ||
          polygonCoords[0][1] !== polygonCoords[polygonCoords.length - 1][1])
      ) {
        polygonCoords.push([polygonCoords[0][0], polygonCoords[0][1]]);
      }

      return {
        type: 'Feature',
        id: wb.id,
        geometry: {
          type: 'Polygon',
          coordinates: [polygonCoords],
        },
        properties: {
          id: wb.id,
          name: wb.name,
          district: wb.district,
          state: wb.state,
          basin: wb.basin,
          type: wb.type,
          centroid: [wb.coordinates[1], wb.coordinates[0]],
          currentAreaKm2: wb.currentAreaKm2,
          historicalAvgAreaKm2: wb.historicalAvgAreaKm2,
          areaChangePct: wb.areaChangePct,
          waterLossPct: wb.waterLossPct,
          currentRainfallMm: wb.currentRainfallMm,
          avgRainfallMm: wb.avgRainfallMm,
          rainfallAnomalyMm: wb.rainfallAnomalyMm,
          rainfallAnomalyPct: wb.rainfallAnomalyPct,
          correlationR: wb.correlation,
          optimalLagMonths: wb.optimalLagMonths,
          historicalVariabilityCV: wb.historicalVariability,
          persistenceMonths: wb.persistenceMonths,
          vulnerabilityScore: wb.vulnerabilityScore,
          vulnerabilityClass: wb.vulnerabilityClass,
          lastObsDate: wb.lastObsDate,
          riskFactors: wb.riskFactors,
          primaryRecommendation: wb.recommendations[0]?.action || 'Routine hydrological monitoring',
        },
      };
    }),
  };

  const safeName = studyArea.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadFile(
    JSON.stringify(geojson, null, 2),
    `hydropulse_${safeName}_features_${new Date().toISOString().slice(0, 10)}.geojson`,
    'application/geo+json;charset=utf-8;'
  );
}
