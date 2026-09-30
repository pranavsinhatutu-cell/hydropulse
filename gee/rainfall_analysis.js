/**
 * HydroPulse - Rainfall Time-Series & Anomaly Extraction Engine
 * Dataset: UCSB-CHG/CHIRPS/PENTAD (or DAILY)
 * Problem Statement 2.4 – Rainfall–Surface Water Response Analysis
 * 
 * Instructions:
 * Run directly in Google Earth Engine Code Editor (https://code.earthengine.google.com/)
 */

// 1. Define Region of Interest (Default: Cauvery Basin Upper Catchment)
var geometry = /* color: #00ffff */
  ee.Geometry.Polygon([
    [[75.85, 12.20], [76.40, 11.85], [77.20, 11.95],
     [77.60, 12.35], [77.85, 12.80], [77.90, 13.15],
     [77.65, 13.35], [77.10, 13.50], [76.10, 13.45],
     [75.75, 12.65], [75.85, 12.20]]
  ]);

Map.centerObject(geometry, 8);
Map.setOptions('HYBRID');

// 2. Load CHIRPS Pentad ImageCollection
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
  .filterBounds(geometry);

// 3. Define Historical Baseline Period (1991 - 2020) and Study Analysis Period (2022 - 2024)
var baselineStart = '1991-01-01';
var baselineEnd = '2020-12-31';
var studyStart = '2022-01-01';
var studyEnd = '2024-12-31';

var baselineCol = chirps.filterDate(baselineStart, baselineEnd);
var studyCol = chirps.filterDate(studyStart, studyEnd);

// 4. Compute Monthly Climatological Mean (12 Months Baseline)
var months = ee.List.sequence(1, 12);
var monthlyClimatology = ee.ImageCollection.fromImages(
  months.map(function(m) {
    var monthImages = baselineCol.filter(ee.Filter.calendarRange(m, m, 'month'));
    var monthlyMean = monthImages.sum().divide(30) // 30-year average monthly total in mm
      .set('month', m)
      .rename('baseline_precip_mm');
    return monthlyMean;
  })
);

// 5. Function to Calculate Monthly Aggregates and Anomalies for the Study Period
var startYear = 2022;
var endYear = 2024;
var years = ee.List.sequence(startYear, endYear);

var monthlyStudySeries = ee.ImageCollection.fromImages(
  years.map(function(y) {
    return months.map(function(m) {
      var dStart = ee.Date.fromYMD(y, m, 1);
      var dEnd = dStart.advance(1, 'month');

      var monthlyTotal = studyCol.filterDate(dStart, dEnd)
        .select('precipitation')
        .sum()
        .rename('rainfall_observed_mm');

      // Retrieve corresponding monthly climatology
      var baseline = monthlyClimatology.filter(ee.Filter.eq('month', m)).first();
      
      // Rainfall Anomaly = Observed - Baseline
      var anomalyMm = monthlyTotal.subtract(baseline).rename('rainfall_anomaly_mm');

      // Rainfall Anomaly (%) = ((Observed - Baseline) / Baseline) * 100
      var anomalyPct = monthlyTotal.subtract(baseline)
        .divide(baseline)
        .multiply(100)
        .rename('rainfall_anomaly_pct');

      return monthlyTotal
        .addBands(baseline)
        .addBands(anomalyMm)
        .addBands(anomalyPct)
        .set('system:time_start', dStart.millis())
        .set('year', y)
        .set('month', m)
        .set('date_str', dStart.format('YYYY-MM'));
    });
  }).flatten()
);

// 6. Visualization Palette for Rainfall Anomaly
// Severe deficit (Red/Orange) to Normal (White/Yellow) to Surplus (Cyan/Blue)
var anomalyVis = {
  bands: ['rainfall_anomaly_mm'],
  min: -100,
  max: 100,
  palette: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850']
};

var recentAnomaly = monthlyStudySeries.sort('system:time_start', false).first().clip(geometry);
Map.addLayer(recentAnomaly, anomalyVis, 'Recent Monthly Rainfall Anomaly (mm)');

// 7. Extract Time Series Table for Basin Centroid or Reservoirs
var basinMeanTS = monthlyStudySeries.map(function(img) {
  var meanStats = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 5566,
    maxPixels: 1e9
  });
  return ee.Feature(null, {
    'date': img.get('date_str'),
    'year': img.get('year'),
    'month': img.get('month'),
    'observed_rainfall_mm': meanStats.get('rainfall_observed_mm'),
    'baseline_rainfall_mm': meanStats.get('baseline_precip_mm'),
    'anomaly_mm': meanStats.get('rainfall_anomaly_mm'),
    'anomaly_pct': meanStats.get('rainfall_anomaly_pct')
  });
});

print('First 12 Months Processed Rainfall Records:', basinMeanTS.limit(12));

// 8. Export to Google Drive as CSV for ingestion into HydroPulse
Export.table.toDrive({
  collection: basinMeanTS,
  description: 'HydroPulse_CHIRPS_Rainfall_TimeSeries',
  fileFormat: 'CSV'
});
