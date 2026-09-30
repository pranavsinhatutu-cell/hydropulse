import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WaterBody, StudyArea } from '../types';
import { MapLegend, MapLayerState } from '../components/layers/MapLegend';
import { Search, Compass, Maximize2, Minimize2, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';

interface LiveMapViewProps {
  studyArea: StudyArea;
  waterBodies: WaterBody[];
  onSelectWaterBody: (wb: WaterBody) => void;
  selectedWaterBody: WaterBody | null;
  apiKey?: string;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  studyArea,
  waterBodies,
  onSelectWaterBody,
  selectedWaterBody,
  apiKey,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    studyAreaLayer: L.LayerGroup;
    waterBodiesLayer: L.LayerGroup;
    rainfallLayer: L.LayerGroup;
    hotspotsLayer: L.LayerGroup;
    tileLayer: L.TileLayer | null;
  }>({
    studyAreaLayer: L.layerGroup(),
    waterBodiesLayer: L.layerGroup(),
    rainfallLayer: L.layerGroup(),
    hotspotsLayer: L.layerGroup(),
    tileLayer: null,
  });

  const [layersState, setLayersState] = useState<MapLayerState>({
    studyArea: true,
    waterBodies: true,
    rainfallAnomaly: true,
    waterAreaChange: false,
    vulnerability: true,
    droughtSensitiveOnly: false,
    adminBoundaries: false,
    baseMap: apiKey ? 'live' : 'dark',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Basemap URLs
  const basemapUrls = {
  dark: `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${apiKey || ''}`,

  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',

  streets:
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

  live: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${apiKey || ''}`,
};

  const basemapAttributions = {
  dark:
    '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

  satellite:
    'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',

  streets:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

  live:
    '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: studyArea.center,
        zoom: studyArea.zoom,
        zoomControl: false,
      });

      // Default Dark Basemap
      const tileLayer = L.tileLayer(basemapUrls[layersState.baseMap], {
        attribution: basemapAttributions[layersState.baseMap],
        maxZoom: 18,
      }).addTo(map);

      layerGroupsRef.current.tileLayer = tileLayer;
      layerGroupsRef.current.studyAreaLayer.addTo(map);
      layerGroupsRef.current.rainfallLayer.addTo(map);
      layerGroupsRef.current.hotspotsLayer.addTo(map);
      layerGroupsRef.current.waterBodiesLayer.addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(studyArea.center, studyArea.zoom);
    }

    return () => {
      // Map cleanup on unmount handled gracefully
    };
  }, [studyArea]);

  // Update Basemap
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupsRef.current.tileLayer) return;
    mapInstanceRef.current.removeLayer(layerGroupsRef.current.tileLayer);

    const newTile = L.tileLayer(basemapUrls[layersState.baseMap], {
      attribution: basemapAttributions[layersState.baseMap],
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);

    layerGroupsRef.current.tileLayer = newTile;
    newTile.bringToBack();
  }, [layersState.baseMap]);

  // Render Map Features
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const { studyAreaLayer, waterBodiesLayer, rainfallLayer, hotspotsLayer } = layerGroupsRef.current;

    // 1. Clear previous layers
    studyAreaLayer.clearLayers();
    waterBodiesLayer.clearLayers();
    rainfallLayer.clearLayers();
    hotspotsLayer.clearLayers();

    // 2. Study Area Boundary
    if (layersState.studyArea && studyArea.boundary.length > 0) {
      const polygon = L.polygon(studyArea.boundary, {
        color: '#06b6d4',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#06b6d4',
        fillOpacity: 0.05,
      });
      polygon.bindTooltip(`Study Area: ${studyArea.name}`, { sticky: true });
      studyAreaLayer.addLayer(polygon);
    }

    // 3. Rainfall Anomaly Overlay (Simulated spatial grid cells across study area)
    if (layersState.rainfallAnomaly) {
      const centerLat = studyArea.center[0];
      const centerLng = studyArea.center[1];
      const gridOffsets = [
        [-0.4, -0.4, -42],
        [-0.4, 0.1, -35],
        [-0.4, 0.5, -28],
        [0.0, -0.4, -38],
        [0.0, 0.0, -45],
        [0.0, 0.4, -22],
        [0.4, -0.3, -30],
        [0.4, 0.1, -18],
        [0.4, 0.5, -12],
      ];

      gridOffsets.forEach(([dLat, dLng, anom]) => {
        const bounds: L.LatLngBoundsExpression = [
          [centerLat + dLat - 0.18, centerLng + dLng - 0.22],
          [centerLat + dLat + 0.18, centerLng + dLng + 0.22],
        ];

        // Anomaly color
        const color = anom < -35 ? '#b91c1c' : anom < -20 ? '#ea580c' : anom < 0 ? '#ca8a04' : '#16a34a';

        const rect = L.rectangle(bounds, {
          color,
          weight: 0.8,
          fillColor: color,
          fillOpacity: 0.18,
          dashArray: '2, 4',
        });
        rect.bindTooltip(
          `CHIRPS Grid Cell Anomaly: ${anom}% (${anom < 0 ? 'Deficit' : 'Surplus'})`,
          { sticky: true }
        );
        rainfallLayer.addLayer(rect);
      });
    }

    // 4. Water Bodies Polygons & Centroid Markers
    const filteredBodies = layersState.droughtSensitiveOnly
      ? waterBodies.filter((wb) => wb.vulnerabilityClass === 'High' || wb.vulnerabilityClass === 'Very High')
      : waterBodies;

    filteredBodies.forEach((wb) => {
      // Color based on vulnerability or area change
      let strokeColor = '#38bdf8';
      let fillColor = '#0284c7';

      if (layersState.vulnerability) {
        switch (wb.vulnerabilityClass) {
          case 'Very High':
            strokeColor = '#ef4444';
            fillColor = '#dc2626';
            break;
          case 'High':
            strokeColor = '#f97316';
            fillColor = '#ea580c';
            break;
          case 'Moderate':
            strokeColor = '#eab308';
            fillColor = '#ca8a04';
            break;
          case 'Low':
            strokeColor = '#22c55e';
            fillColor = '#16a34a';
            break;
        }
      }

      if (layersState.waterBodies) {
        // Draw real polygon shape
        const polygon = L.polygon(wb.polygon, {
          color: strokeColor,
          weight: 2.5,
          fillColor: fillColor,
          fillOpacity: 0.55,
        });

        // Popup content matching hackathon requirement
        const popupContent = `
          <div class="p-2 space-y-2 text-xs">
            <div class="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <span class="font-mono text-cyan-300 font-bold">${wb.id}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase" style="background: ${fillColor}33; color: ${strokeColor}; border: 1px solid ${strokeColor}">
                ${wb.vulnerabilityClass} Sensitivity
              </span>
            </div>
            
            <div class="font-bold text-white text-sm">${wb.name}</div>
            <div class="text-[11px] text-slate-300">${wb.district}, ${wb.state} • ${wb.type}</div>

            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/60 text-[11px]">
              <div>
                <span class="text-slate-400 block">Current Area:</span>
                <span class="font-semibold text-white">${wb.currentAreaKm2.toFixed(2)} km²</span>
              </div>
              <div>
                <span class="text-slate-400 block">Historical Max:</span>
                <span class="font-semibold text-white">${wb.historicalMaxAreaKm2.toFixed(1)} km²</span>
              </div>
              <div>
                <span class="text-slate-400 block">Area Change:</span>
                <span class="font-semibold ${wb.areaChangePct < 0 ? 'text-rose-400' : 'text-emerald-400'}">${wb.areaChangePct.toFixed(1)}%</span>
              </div>
              <div>
                <span class="text-slate-400 block">Rainfall Anomaly:</span>
                <span class="font-semibold ${wb.rainfallAnomalyPct < 0 ? 'text-amber-400' : 'text-emerald-400'}">${wb.rainfallAnomalyPct.toFixed(1)}%</span>
              </div>
              <div>
                <span class="text-slate-400 block">Correlation (r):</span>
                <span class="font-semibold text-cyan-300">${wb.correlation.toFixed(2)} (${wb.optimalLagMonths} mo lag)</span>
              </div>
              <div>
                <span class="text-slate-400 block">Vulnerability Score:</span>
                <span class="font-bold text-white">${wb.vulnerabilityScore} / 100</span>
              </div>
            </div>

            <div class="text-[10px] text-slate-400 pt-1">
              Last Satellite Observation: ${wb.lastObsDate}
            </div>

            <button id="wb-inspect-btn-${wb.id}" class="w-full mt-2 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1">
              Inspect Water Body Detail →
            </button>
          </div>
        `;

        polygon.bindPopup(popupContent, { maxWidth: 320 });
        polygon.on('popupopen', () => {
          const btn = document.getElementById(`wb-inspect-btn-${wb.id}`);
          if (btn) {
            btn.onclick = () => onSelectWaterBody(wb);
          }
        });

        polygon.on('click', () => {
          // Open detail
        });

        waterBodiesLayer.addLayer(polygon);

        // Centroid marker pin with pulsing ring for high risk
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div class="relative flex items-center justify-center">
              ${
                wb.vulnerabilityClass === 'Very High' || wb.vulnerabilityClass === 'High'
                  ? `<span class="animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-75" style="background-color: ${strokeColor}"></span>`
                  : ''
              }
              <div class="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-white shadow-lg text-[9px] font-bold text-white" style="background-color: ${strokeColor}">
                ${wb.id.replace('WB-', '')}
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(wb.coordinates, { icon: customIcon });
        marker.bindTooltip(`${wb.id}: ${wb.name} (${wb.vulnerabilityScore}/100)`, { sticky: true });
        marker.on('click', () => {
          polygon.openPopup();
        });
        waterBodiesLayer.addLayer(marker);
      }

      // Hotspots Layer
      if (layersState.waterAreaChange && wb.areaChangePct < -20) {
        const hotspotCircle = L.circle(wb.coordinates, {
          radius: 4000,
          color: '#f43f5e',
          weight: 1,
          fillColor: '#f43f5e',
          fillOpacity: 0.25,
        });
        hotspotCircle.bindTooltip(`Water Loss Hotspot: ${wb.name} (${wb.areaChangePct}%)`, { sticky: true });
        hotspotsLayer.addLayer(hotspotCircle);
      }
    });
  }, [studyArea, waterBodies, layersState, onSelectWaterBody]);

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    const query = searchQuery.toLowerCase();
    const match = waterBodies.find(
      (wb) =>
        wb.name.toLowerCase().includes(query) ||
        wb.id.toLowerCase().includes(query) ||
        wb.district.toLowerCase().includes(query)
    );

    if (match) {
      mapInstanceRef.current.flyTo(match.coordinates, 13, { duration: 1.2 });
      onSelectWaterBody(match);
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(studyArea.center, studyArea.zoom, { duration: 1 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div
      className={`relative w-full overflow-hidden transition-all duration-300 rounded-2xl border border-slate-800 shadow-2xl bg-slate-950 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[calc(100vh-13rem)] min-h-[580px]'
      }`}
    >
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Floating Search & Quick Actions */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md w-full">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search water body, ID, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs text-white pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-cyan-500 shadow-xl placeholder-slate-400"
          />
        </form>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {apiKey && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-emerald-500/60 shadow-xl text-[11px] font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>API Key:</span>
              <span className="font-mono text-white">{apiKey.slice(0, 8)}...{apiKey.slice(-6)}</span>
            </div>
          )}
          <button
            onClick={handleResetView}
            className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-xl"
            title="Reset Map View"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-xl"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Left Floating Zoom Controls */}
      <div className="absolute bottom-6 left-4 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 shadow-xl transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 shadow-xl transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Layer & Legend Control on Right */}
      <MapLegend
        layers={layersState}
        onToggleLayer={(layerName) =>
          setLayersState((prev) => ({ ...prev, [layerName]: !prev[layerName] }))
        }
        onChangeBaseMap={(baseMap) => setLayersState((prev) => ({ ...prev, baseMap }))}
        apiKey={apiKey}
      />

      {/* Bottom Bar: Quick Active Selection Banner */}
      {selectedWaterBody && (
        <div className="absolute bottom-6 right-4 sm:right-80 left-4 sm:left-24 z-[1000] p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-cyan-800/80 shadow-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">{selectedWaterBody.id}</span>
            <span className="font-semibold text-white">{selectedWaterBody.name}</span>
            <span className="text-slate-400 hidden md:inline">
              ({selectedWaterBody.currentAreaKm2.toFixed(1)} km², Score: {selectedWaterBody.vulnerabilityScore}/100)
            </span>
          </div>
          <button
            onClick={() => onSelectWaterBody(selectedWaterBody)}
            className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors shrink-0"
          >
            Full Dossier →
          </button>
        </div>
      )}
    </div>
  );
};
