import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  CloudRain,
  Waves,
  GitCompare,
  AlertTriangle,
  FolderDot,
  Compass,
  BarChart3,
  GitBranch,
  Database,
  Info,
  ChevronRight,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  vulnerableCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileMenuOpen,
  onCloseMobileMenu,
  vulnerableCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'System overview & KPIs',
    },
    {
      id: 'live-map' as ActiveTab,
      label: 'Live Geospatial Map',
      icon: MapPin,
      badge: 'GIS',
      description: 'Interactive map layers',
    },
    {
      id: 'rainfall' as ActiveTab,
      label: 'Rainfall Analysis',
      icon: CloudRain,
      description: 'CHIRPS time series & anomaly',
    },
    {
      id: 'water' as ActiveTab,
      label: 'Water Area Analysis',
      icon: Waves,
      description: 'Surface water dynamics',
    },
    {
      id: 'response' as ActiveTab,
      label: 'Rainfall–Water Response',
      icon: GitCompare,
      badge: 'CORE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Correlation & lag analysis',
    },
    {
      id: 'vulnerability' as ActiveTab,
      label: 'Drought Sensitivity',
      icon: AlertTriangle,
      badge: `${vulnerableCount} at risk`,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: '0–100 scoring model',
    },
    {
      id: 'waterbodies' as ActiveTab,
      label: 'Water Bodies Directory',
      icon: FolderDot,
      description: 'Reservoir deep dives',
    },
    {
      id: 'decision' as ActiveTab,
      label: 'Decision Support',
      icon: Compass,
      description: 'Evidence-based intervention',
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics & Trends',
      icon: BarChart3,
      description: 'Multi-metric exploration',
    },
    {
      id: 'methodology' as ActiveTab,
      label: 'Methodology & Pipeline',
      icon: GitBranch,
      description: 'End-to-end workflow',
    },
    {
      id: 'datasets' as ActiveTab,
      label: 'Satellite Datasets',
      icon: Database,
      description: 'CHIRPS, JRC, Sentinel-2/1',
    },
    {
      id: 'about' as ActiveTab,
      label: 'About & PS 2.4',
      icon: Info,
      description: 'GEO-PIMATHON 1.0 criteria',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 shrink-0 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          
          {/* Workflow Tagline */}
          <div className="px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center justify-between">
              <span>Geospatial Pipeline</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">
              Sensors → Indices → Lag-Correlation → Sensitivity Score → Action
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobileMenu();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/40 text-cyan-200 border border-cyan-700/50 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                      }`}
                    />
                    <div className="text-left">
                      <div className="font-semibold text-slate-100">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal leading-tight">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex justify-between items-center">
              <span>Platform Version:</span>
              <span className="font-mono text-slate-300">v1.4.0 (Hackathon Release)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Challenge Track:</span>
              <span className="font-semibold text-cyan-400">Problem Statement 2.4</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Earth Engine Pipeline:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Standardized
              </span>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};
