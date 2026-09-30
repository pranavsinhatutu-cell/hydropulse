# HydroPulse 💧
### *Rainfall–Surface Water Response Intelligence*
**GEO-PIMATHON 1.0 Geospatial Hackathon**  
**Problem Statement 2.4 – Rainfall–Surface Water Response Analysis**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)
[![Google Earth Engine](https://img.shields.io/badge/Google%20Earth%20Engine-Ready-orange.svg)](https://earthengine.google.com/)

---

## 📌 Executive Summary

**HydroPulse** is an enterprise-grade geospatial intelligence and decision-support web platform engineered to investigate how rainfall variability directly impacts inland surface-water availability. Built for water resource managers, urban planners, disaster response teams, and environmental authorities, HydroPulse bridges the gap between raw remote sensing observations and operational hydrological interventions.

### Official Challenge Statement
> **Problem Statement 2.4:** Investigate how rainfall variability affects surface-water availability.
> 
> **Official Required Tasks:**
> 1. Obtain rainfall time series.
> 2. Extract surface-water extent.
> 3. Compare rainfall and water-area changes.
> 4. Identify drought-sensitive water bodies.
> 
> **Expected Output:**
> - Rainfall–water response analysis.
> - Vulnerable/drought-sensitive waterbody map.

---

## 🔄 Visible Geospatial Workflow

HydroPulse visibly demonstrates the complete end-to-end geospatial workflow across all views:

```
Satellite / Remote Sensing Data (CHIRPS, Sentinel-2, Sentinel-1 SAR, JRC GSW)
                        ↓
Image Processing (Cloud Masking SCL, MNDWI/NDWI, SAR -16 dB Specular Threshold)
                        ↓
Geospatial Analysis (Rainfall Anomaly %, Water Area Contraction %, Temporal Series)
                        ↓
Indicator / Vulnerability Model (Pearson Lag r [0–3 Mo], 0–100 Drought Sensitivity Score)
                        ↓
Interactive Map + Dashboard (Leaflet GIS Layers, Severity Popups, Recharts Suites)
                        ↓
Decision / Recommendation (Prioritized Interventions, Monitoring Cadence, Rule Curves)
```

---

## ✅ How This Project Satisfies Problem Statement 2.4

| Official Requirement | Implementation in HydroPulse | Corresponding Code & View Module |
| :--- | :--- | :--- |
| **Task 1: Obtain rainfall time series** | Ingests CHIRPS 0.05° precipitation pentads/months, calculates 30-year climatological baseline (1991–2020), computes absolute anomaly (mm) and percentage anomaly (%). | `gee/rainfall_analysis.js`<br>`src/views/RainfallAnalysisView.tsx` |
| **Task 2: Extract surface-water extent** | Derives water extent via Sentinel-2 Level-2A MNDWI thresholding ($>0.0$), JRC 38-year Global Surface Water baseline, and Sentinel-1 SAR cloud-penetrating specular radar mask. | `gee/water_extraction.js`<br>`src/views/WaterAnalysisView.tsx` |
| **Task 3: Compare rainfall and water-area changes** | Combined dual-axis time-series visualization, empirical scatter plot regression, Pearson correlation coefficient ($r$), and multi-horizon lag cross-correlation ($0, 1, 2, 3$ months). | `src/views/RainfallWaterResponseView.tsx`<br>`src/utils/calculations.ts` |
| **Task 4: Identify drought-sensitive water bodies** | Transparent, deterministic Drought Sensitivity Score (0–100) combining rainfall deficit, area shrinkage, lag coupling, variability, and persistence with live configurable weight sliders. | `gee/vulnerability_model.js`<br>`src/views/VulnerabilityView.tsx` |
| **Expected Output 1: Response Analysis** | Multi-basin empirical latency extraction isolating strongest response lag in months with hydrological interpretation. | `RainfallWaterResponseView.tsx` |
| **Expected Output 2: Vulnerable Waterbody Map** | Interactive Leaflet GIS map with multi-point polygons, severity classes (Low, Moderate, High, Very High), layer controls, popups, and hotspot filters. | `src/views/LiveMapView.tsx`<br>`src/components/layers/MapLegend.tsx` |
| **Decision Support** | Formulates evidence-based operational mitigation recommendations tailored per water body with urgency classifications and lead agency designations. | `src/views/DecisionSupportView.tsx`<br>`src/components/ExecutiveReportModal.tsx` |

---

## 🧮 Mathematical Formulations & Algorithms

### 1. Rainfall Anomaly Formulation
$$\text{Rainfall Anomaly}_{\text{mm}} = P_{\text{observed}} - \bar{P}_{\text{climatology}}$$

$$\text{Rainfall Anomaly}_{\%} = \left( \frac{P_{\text{observed}} - \bar{P}_{\text{climatology}}}{\bar{P}_{\text{climatology}}} \right) \times 100$$

*Severity Categories:*
- **Severe Deficit:** Anomaly $< -25\%$
- **Below Normal:** $-25\% \le \text{Anomaly} < -10\%$
- **Normal:** $-10\% \le \text{Anomaly} \le +10\%$
- **Above Normal:** Anomaly $> +10\%$

### 2. Modified Normalized Difference Water Index (MNDWI)
$$\text{MNDWI} = \frac{\rho_{\text{Green}} - \rho_{\text{SWIR1}}}{\rho_{\text{Green}} + \rho_{\text{SWIR1}}} = \frac{B3 - B11}{B3 + B11} \quad (\text{Sentinel-2 MSI})$$
*Water Classification Threshold:* Pixels where $\text{MNDWI} > 0.0$ are classified as open surface water.

### 3. Sentinel-1 SAR Dual-Pol All-Weather Water Extraction
* Band: Vertical-Vertical (VV) backscatter in decibels (dB).
* Specular reflection property: Smooth open water reflects microwave radar pulses away from the antenna.
$$\text{Water Pixel} \iff \sigma^0_{\text{VV}} < -16.0\text{ dB}$$

### 4. Water Area Change Percentage
$$\text{Water Area Change}_{\%} = \left( \frac{\text{Current Area}_{\text{km}^2} - \bar{A}_{\text{historical}}}{\bar{A}_{\text{historical}}} \right) \times 100$$

### 5. Pearson Lag Cross-Correlation
$$r(k) = \frac{\sum (P_{t-k} - \bar{P})(W_t - \bar{W})}{\sqrt{\sum (P_{t-k} - \bar{P})^2 \sum (W_t - \bar{W})^2}} \quad \text{for } k \in \{0, 1, 2, 3\} \text{ months}$$
The lag horizon $k$ yielding $\max [r(k)]$ is identified as the *Optimal Catchment Response Latency*.

### 6. Transparent Drought Sensitivity Model (0–100 Score)
Unlike unexplainable deep-learning black boxes, HydroPulse utilizes normalized deterministic indicators:
$$\text{Score} = w_1 \cdot I_{\text{deficit}} + w_2 \cdot I_{\text{loss}} + w_3 \cdot I_{\text{coupling}} + w_4 \cdot I_{\text{variability}} + w_5 \cdot I_{\text{persistence}}$$

| Indicator Component | Default Weight | Description & Normalization |
| :--- | :---: | :--- |
| **Rainfall Deficit Score ($I_{\text{deficit}}$)** | **25%** | Scaled from 0 (normal/surplus) to 100 ($-45\%$ or worse deficit). |
| **Water Area Reduction ($I_{\text{loss}}$)** | **35%** | Scaled from 0 (baseline) to 100 ($-40\%$ or worse contraction). |
| **Lag Coupling ($I_{\text{coupling}}$)** | **20%** | Pearson correlation $|r| \times 100$ at optimal lag. |
| **Historical Variability ($I_{\text{variability}}$)** | **10%** | Coefficient of variation (CV) capturing year-to-year storage volatility. |
| **Persistence of Loss ($I_{\text{persistence}}$)** | **10%** | Consecutive observation cycles with below-normal water extent ($\ge 6\text{ months} = 100$). |

*Classification Tiers:*
- **0 – 25:** Low Drought Sensitivity (Green)
- **26 – 50:** Moderate Drought Sensitivity (Amber)
- **51 – 75:** High Drought Sensitivity (Orange)
- **76 – 100:** Very High Drought Sensitivity (Red)

*All weights are interactive and dynamically reconfigurable via the UI.*

---

## 🛰️ Satellite Datasets & Google Earth Engine Ingestion

| Dataset | Provider | GEE Collection ID | Resolution & Cadence | Role in HydroPulse |
| :--- | :--- | :--- | :--- | :--- |
| **CHIRPS Pentad** | UCSB / USGS | `UCSB-CHG/CHIRPS/PENTAD` | 0.05° (~5.5 km), 5-Day | Precipitation time series, 30-year climatology baseline, anomaly detection. |
| **Sentinel-2 L2A** | ESA / Copernicus | `COPERNICUS/S2_SR_HARMONIZED` | 10m / 20m, 5-Day Revisit | MNDWI/NDWI surface water boundary delineation and optical indices. |
| **JRC Global Surface Water** | EC JRC / Google | `JRC/GSW1_4/GlobalSurfaceWater` | 30m, 38-Year Record | Long-term maximum inundation baseline, occurrence and permanence. |
| **Sentinel-1 SAR GRD** | ESA / Copernicus | `COPERNICUS/S1_GRD` | 10m, 6–12 Day Revisit | All-weather, day-and-night surface-water extraction during cloud-covered monsoons. |

---

## 📂 Repository Structure

```
hydropulse/
├── gee/                                # Google Earth Engine Production Scripts
│   ├── rainfall_analysis.js            # CHIRPS baseline, aggregation & anomaly extraction
│   ├── water_extraction.js             # Sentinel-2 MNDWI & Sentinel-1 SAR water masks
│   ├── vulnerability_model.js          # Lag correlation and 0-100 drought scoring engine
│   └── README.md                       # Complete GEE deployment and execution guide
├── src/
│   ├── components/
│   │   ├── Navbar.tsx                  # Topbar with study area selector, demo badge, exports
│   │   ├── Sidebar.tsx                 # Navigation suite across all 12 modules
│   │   ├── KPICards.tsx                # Official 6 hackathon KPI metric cards
│   │   ├── ModelWeightsModal.tsx       # Live slider configuration for vulnerability model
│   │   ├── WaterBodyDetailModal.tsx    # Dossier modal with 4 interactive charts & explanation
│   │   ├── ExecutiveReportModal.tsx    # Printable briefing document preview
│   │   └── layers/
│   │       └── MapLegend.tsx           # GIS layers switcher, severity scale & basemap toggle
│   ├── data/
│   │   ├── studyAreas.ts               # Predefined basins (Cauvery, Marathwada, Colorado)
│   │   ├── waterBodiesData.ts          # Authentic polygon geometries & 36-month time series
│   │   └── datasetsMeta.ts             # Metadata specifications for satellite sensors
│   ├── utils/
│   │   ├── calculations.ts             # Pearson r, lag cross-correlation, composite score
│   │   ├── exportUtils.ts              # CSV, GeoJSON (RFC 7946), and executive summary exports
│   │   └── formatters.ts
│   ├── views/
│   │   ├── DashboardView.tsx           # Main dashboard with KPIs and response chart
│   │   ├── LiveMapView.tsx             # Interactive Leaflet GIS map with popups & search
│   │   ├── RainfallAnalysisView.tsx    # CHIRPS monthly/seasonal/annual anomaly analysis
│   │   ├── WaterAnalysisView.tsx       # Surface water extent dynamics & water loss hotspots
│   │   ├── RainfallWaterResponseView.tsx # Core lag cross-correlation & scatter plots
│   │   ├── VulnerabilityView.tsx       # Sensitivity assessment & prioritized ranking
│   │   ├── WaterBodiesView.tsx         # Water bodies catalog & filterable directory
│   │   ├── DecisionSupportView.tsx     # Evidence-based mitigation action matrix
│   │   ├── AnalyticsView.tsx           # Multi-metric cross-filtering & distributions
│   │   ├── MethodologyView.tsx         # End-to-end scientific methodology & flowcharts
│   │   ├── DatasetsView.tsx            # Data catalog & satellite sensor details
│   │   ├── AboutView.tsx               # Problem Statement 2.4 compliance documentation
│   │   └── PresentationModeView.tsx    # Judge-friendly pitch deck (2-3 min demo video)
│   ├── App.tsx                         # Master state orchestration
│   ├── index.css                       # Dark theme and Leaflet styles
│   └── main.tsx
├── .env.example                        # Template for GEE API keys & config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher; tested on v24.x)
- **npm** (v9 or higher; tested on v11.x)

### Local Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/hydropulse.git
cd hydropulse

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env

# 4. Start the development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛡️ Demo Mode vs Live Earth Engine Mode

HydroPulse is designed with enterprise-grade modularity:

* **Demo Mode (Default):**  
  When live Earth Engine service account credentials are not configured, HydroPulse operates in **Demo Mode**. It uses realistic, high-fidelity GeoJSON polygons and multi-year monthly time series reflecting real hydrological drought events (e.g., the 2023 El Niño deficit in South India).  
  *Notice Displayed:* `"Demo Mode – Sample data is being used because live Earth Engine credentials are not configured."`
* **Live Mode:**  
  When Google Earth Engine API credentials are provided in `.env` (`VITE_ENABLE_LIVE_GEE=true` and service account keys), HydroPulse connects to backend endpoints to execute live Earth Engine reducers and asset evaluations.

---

## 🗺️ Study Areas Included

1. **Cauvery–Arkavathi Basin (Southern India) [Default]:**  
   - 12 major reservoirs and lakes (Krishnarajasagara, Kabini, Harangi, Hemavathi, TG Halli, Hesaraghatta, Bellandur, Varthur, Kanva, Manchanabele, Byramangala, Yele Mallappa Shetty).
   - Real-world relevance: Critical drinking water supply for Bengaluru metropolitan area and interstate agricultural release obligations.
2. **Marathwada Drought Zone / Godavari Sub-Basin (Maharashtra, India):**  
   - 8 major reservoirs (Jayakwadi, Majalgaon, Yeldari, Lower Terna, Sina Kolegaon, Vishnupuri, Manjara, Siddheshwar).
   - Epizone of agrarian distress and multi-month zero-live-storage crises.
3. **Upper Colorado & Lake Mead Basin (SW USA):**  
   - 6 desert reservoirs (Lake Mead, Lake Mohave, Lake Havasu, etc.).

---

## 📊 Export Capabilities

HydroPulse provides instantaneous data portability:
- **Export Water Bodies (CSV):** Detailed tabular records of current area, baseline, anomalies, lag correlations, and vulnerability scores.
- **Monthly Time Series (CSV):** 36 months of paired precipitation and water surface extents.
- **GeoJSON FeatureCollection (RFC 7946):** Full spatial vector polygons with attached properties for direct import into QGIS or ArcGIS.
- **Executive Summary Report:** Clean printable/PDF-ready briefing document designed for administrative decision-makers.

---

## ⚖️ Analytical Disclaimer

> *"These recommendations are analytical decision-support outputs, not official policy decisions. They serve as scientific evidence-based inputs for water resource managers, disaster response units, and environmental planning authorities."*

---

## 👥 Team & Hackathon Submission

- **Hackathon:** GEO-PIMATHON 1.0 (Geospatial Hackathon)
- **Challenge Track:** Problem Statement 2.4 – Rainfall–Surface Water Response Analysis
- **Project Lead & Geospatial Engineering:** HydroPulse Hackathon Team
- **License:** MIT License
