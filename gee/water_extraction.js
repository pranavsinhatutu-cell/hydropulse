/**
 * HydroPulse - Multi-Sensor Surface Water Extraction Engine
 * Datasets:
 * 1. COPERNICUS/S2_SR_HARMONIZED (Sentinel-2 L2A MSI)
 * 2. JRC/GSW1_4/GlobalSurfaceWater (JRC 38-year Baseline)
 * 3. COPERNICUS/S1_GRD (Sentinel-1 SAR C-Band for all-weather monsoon penetration)
 * 
 * Problem Statement 2.4 – Rainfall–Surface Water Response Analysis
 */

var aoi = ee.Geometry.Point([76.574, 12.428]).buffer(15000); // KRS Reservoir Region
Map.centerObject(aoi, 11);
Map.setOptions('HYBRID');

// =========================================================================
// 1. JRC GLOBAL SURFACE WATER REFERENCE BASELINE
// =========================================================================
var jrc = ee.Image('JRC/GSW1_4/GlobalSurfaceWater');
var jrcMaxExtent = jrc.select('max_extent').clip(aoi);
var jrcOccurrence = jrc.select('occurrence').clip(aoi);

Map.addLayer(jrcOccurrence, {min: 0, max: 100, palette: ['red', 'yellow', 'green', 'cyan', 'blue']}, 'JRC Water Occurrence (%)', false);
Map.addLayer(jrcMaxExtent.selfMask(), {palette: ['#00ffff']}, 'JRC Historical Max Extent', false);

// =========================================================================
// 2. SENTINEL-2 OPTICAL SURFACE WATER EXTRACTION (MNDWI & NDWI)
// =========================================================================

// Cloud mask function for Sentinel-2 Level 2A using SCL band
function maskS2Clouds(image) {
  var scl = image.select('SCL');
  // Keep: 4 (vegetation), 5 (bare soil), 6 (water), 7 (unclassified)
  // Mask: 3 (cloud shadow), 8 (cloud med prob), 9 (cloud high prob), 10 (cirrus), 11 (snow)
  var mask = scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10)).and(scl.neq(11));
  return image.updateMask(mask).divide(10000);
}

// Function to calculate MNDWI = (B3 - B11) / (B3 + B11)
function addWaterIndices(image) {
  var mndwi = image.normalizedDifference(['B3', 'B11']).rename('MNDWI');
  var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
  return image.addBands(mndwi).addBands(ndwi);
}

// Filter Sentinel-2 collection for clear monthly composites
var s2Col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 25))
  .map(maskS2Clouds)
  .map(addWaterIndices);

// Extract water mask (MNDWI > 0.0 threshold is standard for open reservoir surfaces)
var s2Composite = s2Col.median().clip(aoi);
var s2WaterMask = s2Composite.select('MNDWI').gt(0.0).selfMask();

Map.addLayer(s2Composite.select(['B4', 'B3', 'B2']), {min: 0, max: 0.3}, 'Sentinel-2 True Color (RGB)', false);
Map.addLayer(s2Composite.select('MNDWI'), {min: -0.5, max: 0.5, palette: ['brown', 'white', 'blue']}, 'Sentinel-2 MNDWI', false);
Map.addLayer(s2WaterMask, {palette: ['#0077ff']}, 'Sentinel-2 Extracted Water Mask');

// =========================================================================
// 3. SENTINEL-1 SAR ALL-WEATHER WATER EXTRACTION (FOR MONSOON CLOUD COVER)
// =========================================================================

// Load Sentinel-1 GRD collection (Interferometric Wide Swath, Descending/Ascending)
var s1Col = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(aoi)
  .filterDate('2023-07-01', '2023-08-31') // Peak monsoon cloud-cover window
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('instrumentMode', 'IW'));

// Function to apply a 3x3 focal median filter to reduce speckle noise
function filterSARSpeckle(img) {
  var vv = img.select('VV');
  var vvFiltered = vv.focal_median(10, 'circle', 'meters').rename('VV_filtered');
  return img.addBands(vvFiltered);
}

var s1Filtered = s1Col.map(filterSARSpeckle);
var s1Monsoon = s1Filtered.select('VV_filtered').mean().clip(aoi);

// Specular backscatter threshold: Water bodies reflect radar pulses away (Backscatter < -16 dB)
var s1WaterMask = s1Monsoon.lt(-16.0).selfMask();

Map.addLayer(s1Monsoon, {min: -25, max: 0}, 'Sentinel-1 SAR VV Backscatter (dB)', false);
Map.addLayer(s1WaterMask, {palette: ['#00ffff']}, 'Sentinel-1 SAR Water Extent (Monsoon)');

// =========================================================================
// 4. WATER AREA COMPUTATION IN SQUARE KILOMETERS (KM²)
// =========================================================================

function computeWaterAreaKm2(waterBinaryMask, geometry) {
  var areaImage = waterBinaryMask.multiply(ee.Image.pixelArea()).divide(1e6); // Convert m² to km²
  var totalArea = areaImage.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 10,
    maxPixels: 1e9
  });
  return totalArea.get('MNDWI');
}

var krsArea = computeWaterAreaKm2(s2WaterMask, aoi);
print('Extracted Surface Water Area (km²):', krsArea);

// Export layer for GeoJSON boundary generation
Export.image.toDrive({
  image: s2WaterMask.toByte(),
  description: 'HydroPulse_WaterMask_S2',
  scale: 10,
  region: aoi,
  maxPixels: 1e9
});
