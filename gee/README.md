# HydroPulse – Google Earth Engine Processing Pipeline
**Problem Statement 2.4: Rainfall–Surface Water Response Analysis (GEO-PIMATHON 1.0)**

This directory contains production Google Earth Engine (GEE) JavaScript scripts for automated extraction, time-series generation, multi-sensor water extent classification, and drought sensitivity scoring.

---

## Script Architecture

| Script | Datasets Used | Key Operations | Output |
| :--- | :--- | :--- | :--- |
| **`rainfall_analysis.js`** | `UCSB-CHG/CHIRPS/PENTAD` | 30-year climatology (1991–2020), monthly aggregation, absolute anomaly (mm), percentage anomaly (%) | Gridded rainfall anomaly & monthly CSV time series |
| **`water_extraction.js`** | `COPERNICUS/S2_SR_HARMONIZED`, `JRC/GSW1_4/GlobalSurfaceWater`, `COPERNICUS/S1_GRD` | S2 cloud masking (SCL), MNDWI & NDWI calculation, S1 SAR speckle filtering & specular thresholding, JRC baseline max extent | Binary surface water raster & water area in km² |
| **`vulnerability_model.js`** | Integrated CHIRPS + Water Extent | Normalized indicator scoring, lag cross-correlation ($r$), composite Drought Sensitivity Score (0–100) | Scored water bodies FeatureCollection & GeoJSON |

---

## 1. How to Run in Google Earth Engine Code Editor

1. Open the [Google Earth Engine Code Editor](https://code.earthengine.google.com/).
2. Create a new script in your repository.
3. Paste the contents of `rainfall_analysis.js`, `water_extraction.js`, or `vulnerability_model.js`.
4. Click **Run** in the upper toolbar.
5. In the **Tasks** tab (right panel), click **Run** on any pending export tasks to save the processed GeoJSON/CSV outputs directly into your Google Drive.

---

## 2. Methodology & Key Equations

### Rainfall Anomaly
$$\text{Rainfall Anomaly}_{\text{mm}} = P_{\text{observed}} - \bar{P}_{\text{climatology}}$$

$$\text{Rainfall Anomaly}_{\%} = \left( \frac{P_{\text{observed}} - \bar{P}_{\text{climatology}}}{\bar{P}_{\text{climatology}}} \right) \times 100$$

### Modified Normalized Difference Water Index (MNDWI)
$$\text{MNDWI} = \frac{\text{Green} - \text{SWIR1}}{\text{Green} + \text{SWIR1}} = \frac{B3 - B11}{B3 + B11} \quad (\text{Sentinel-2 MSI})$$
*Threshold:* Pixels with $\text{MNDWI} > 0.0$ are classified as surface water.

### Sentinel-1 SAR Cloud-Penetrating Water Extraction
* Band: Vertical-Vertical (VV) polarization in decibels (dB).
* Water acts as a specular reflector, resulting in low backscatter ($\text{VV} < -16\text{ dB}$).
* Cloud-free and cloudy observations are integrated seamlessly.

### Pearson Lag Cross-Correlation
$$r(k) = \frac{\sum (P_{t-k} - \bar{P})(W_t - \bar{W})}{\sqrt{\sum (P_{t-k} - \bar{P})^2 \sum (W_t - \bar{W})^2}}$$
where $k \in \{0, 1, 2, 3\}$ months.

---

## 3. Connecting GEE Outputs to the HydroPulse Web App

1. Exported GeoJSON and CSV files from Earth Engine can be placed in `src/data/` or served via the backend API.
2. If Earth Engine Service Account credentials are created (`credentials.json`), set `VITE_GEE_API_URL` or run the optional FastAPI server in `/server` to trigger live GEE REST API evaluations.
3. When live credentials are not present, HydroPulse runs in **Demo Mode**, displaying authentic sample datasets without pretending to be live satellite queries.
