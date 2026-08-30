import React, { useState, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Building2
} from 'lucide-react';
import { BackendSite, PressureResponse } from '../../api/sites';
import { CrowdPredictionResponse } from '../../api/crowd';
import {
  calculateConditionStatus,
  getCurrentHourPredictedVisitors
} from '../../api/authority';

interface IndiaGisMapProps {
  sites: BackendSite[];
  pressureMap: Record<string, PressureResponse>;
  crowdMap: Record<string, CrowdPredictionResponse>;
  selectedSite: BackendSite | null;
  onSelectSite: (site: BackendSite) => void;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// Level 1: Geographic Anchors for the 4 City Nodes on India National Map
const NATIONAL_CITY_NODES: Record<string, { top: number; left: number }> = {
  DELHI: { top: 22, left: 34 },
  JAIPUR: { top: 32, left: 24 },
  MUMBAI: { top: 62, left: 17 },
  PRAYAGRAJ: { top: 38, left: 51 }
};

// Distinct City Theme Palette
const CITY_COLORS: Record<string, { bg: string; text: string; border: string; glow: string; badge: string; hex: string }> = {
  DELHI: {
    bg: 'bg-[#1D4ED8]',
    text: 'text-blue-300',
    border: 'border-blue-400',
    glow: 'shadow-blue-500/50',
    badge: 'bg-blue-950/90 text-blue-300 border-blue-500/60',
    hex: '#1D4ED8'
  },
  JAIPUR: {
    bg: 'bg-[#D97706]',
    text: 'text-amber-300',
    border: 'border-amber-400',
    glow: 'shadow-amber-500/50',
    badge: 'bg-amber-950/90 text-amber-300 border-amber-500/60',
    hex: '#D97706'
  },
  MUMBAI: {
    bg: 'bg-[#0D9488]',
    text: 'text-teal-300',
    border: 'border-teal-400',
    glow: 'shadow-teal-500/50',
    badge: 'bg-teal-950/90 text-teal-300 border-teal-500/60',
    hex: '#0D9488'
  },
  PRAYAGRAJ: {
    bg: 'bg-[#E11D48]',
    text: 'text-rose-300',
    border: 'border-rose-400',
    glow: 'shadow-rose-500/50',
    badge: 'bg-rose-950/90 text-rose-300 border-rose-500/60',
    hex: '#E11D48'
  }
};

export const IndiaGisMap: React.FC<IndiaGisMapProps> = ({
  sites,
  pressureMap,
  crowdMap,
  selectedSite,
  onSelectSite,
  loading,
  error,
  onRetry
}) => {
  // State for Two-Level Navigation: Level 1 ('ALL') vs Level 2 ('DELHI', 'JAIPUR', 'MUMBAI', 'PRAYAGRAJ')
  const [activeCity, setActiveCity] = useState<string>('ALL');

  // Group backend sites by city
  const cityGroups = useMemo(() => {
    const groups: Record<string, BackendSite[]> = {
      DELHI: [],
      JAIPUR: [],
      MUMBAI: [],
      PRAYAGRAJ: []
    };

    sites.forEach((site) => {
      const cityKey = (site.city || 'DELHI').toUpperCase();
      if (groups[cityKey]) {
        groups[cityKey].push(site);
      } else {
        groups['DELHI'].push(site);
      }
    });

    return groups;
  }, [sites]);

  // Legend summary counts
  const legendCounts = useMemo(() => {
    let safe = 0;
    let moderate = 0;
    let high = 0;
    let critical = 0;

    sites.forEach((site) => {
      const p = pressureMap[site.site_id] || null;
      const status = calculateConditionStatus(p);
      if (status === 'CRITICAL') critical++;
      else if (status === 'SEVERE') high++;
      else if (status === 'MODERATE') moderate++;
      else safe++;
    });

    return { safe, moderate, high, critical, total: sites.length };
  }, [sites, pressureMap]);

  // LEVEL 2: Calculate non-overlapping pentagonal coordinates for the 5 sites inside a selected city map
  const getCitySiteCoords = (site: BackendSite, indexInCity: number, totalInCity: number) => {
    // 5-point pentagonal dispersion ring around city center (50%, 50%)
    const angleStep = 360 / Math.max(1, totalInCity);
    const angleRad = (((indexInCity >= 0 ? indexInCity : 0) * angleStep - 90) * Math.PI) / 180;

    // Wide screen radius percentage inside dedicated City Map canvas
    const radiusX = 24.0; // horizontal percentage spread
    const radiusY = 22.0; // vertical percentage spread

    const centerTop = 50.0;
    const centerLeft = 50.0;

    return {
      top: `${(centerTop + radiusY * Math.sin(angleRad)).toFixed(2)}%`,
      left: `${(centerLeft + radiusX * Math.cos(angleRad)).toFixed(2)}%`
    };
  };

  const isLevel1NationalMap = activeCity === 'ALL';
  const currentCitySites = isLevel1NationalMap ? [] : cityGroups[activeCity] || [];
  const activePalette = CITY_COLORS[activeCity] || CITY_COLORS.DELHI;

  return (
    <div className="relative h-[580px] w-full rounded-2xl overflow-hidden bg-[#0A1128] border border-slate-800 shadow-2xl select-none flex flex-col justify-between font-sans">
      {/* Background SVG Canvas */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="gisGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" />
          </pattern>

          <radialGradient id="delhiGlow" cx="34%" cy="22%" r="20%">
            <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="jaipurGlow" cx="24%" cy="32%" r="20%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mumbaiGlow" cx="17%" cy="62%" r="20%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="prayagrajGlow" cx="51%" cy="38%" r="20%">
            <stop offset="0%" stopColor="#E11D48" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
          </radialGradient>

          {/* Level 2 City Center Glow */}
          <radialGradient id="cityCenterGlow" cx="50%" cy="50%" r="35%">
            <stop offset="0%" stopColor={activePalette?.hex || '#1D4ED8'} stopOpacity="0.35" />
            <stop offset="100%" stopColor={activePalette?.hex || '#1D4ED8'} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Grid Pattern */}
        <rect width="100%" height="100%" fill="url(#gisGridPattern)" />

        {isLevel1NationalMap ? (
          /* LEVEL 1: India National Boundary & City Glow Halos */
          <>
            <circle cx="340" cy="132" r="110" fill="url(#delhiGlow)" />
            <circle cx="240" cy="192" r="110" fill="url(#jaipurGlow)" />
            <circle cx="170" cy="372" r="110" fill="url(#mumbaiGlow)" />
            <circle cx="510" cy="228" r="110" fill="url(#prayagrajGlow)" />

            <path
              d="M 320 30 L 370 70 L 400 110 L 440 120 L 480 110 L 520 135 L 580 150 L 640 144 L 720 160 L 800 175 L 840 200 L 780 220 L 710 230 L 650 215 L 600 245 L 540 270 L 560 310 L 520 360 L 480 430 L 440 510 L 420 540 L 400 510 L 340 450 L 260 410 L 160 370 L 140 310 L 180 260 L 220 210 L 250 170 L 280 110 Z"
              fill="#1E293B"
              fillOpacity="0.25"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          </>
        ) : (
          /* LEVEL 2: Dedicated City Focused GIS Map Canvas */
          <>
            <circle cx="500" cy="300" r="240" fill="url(#cityCenterGlow)" />
            {/* Concentric radar rings for city GIS visual */}
            <circle cx="500" cy="300" r="160" fill="none" stroke={activePalette.hex} strokeWidth="1" strokeDasharray="6 4" opacity="0.3" />
            <circle cx="500" cy="300" r="240" fill="none" stroke={activePalette.hex} strokeWidth="1" strokeDasharray="8 6" opacity="0.2" />
          </>
        )}
      </svg>

      {/* Header Bar & Level 2 Back Control */}
      <div className="relative z-20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/85 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center space-x-3">
          {!isLevel1NationalMap && (
            /* Level 2 Back Button (Req 13) */
            <button
              onClick={() => setActiveCity('ALL')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs flex items-center space-x-1.5 shadow-md border border-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to India Map</span>
            </button>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white tracking-wider uppercase font-mono">
                {isLevel1NationalMap ? 'National Heritage GIS Monitoring Map' : `${activeCity} HERITAGE MONITORING`}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isLevel1NationalMap ? 'bg-[#0F3D3E] text-emerald-300 border-emerald-500/30' : activePalette.badge}`}>
                {isLevel1NationalMap ? 'Live GIS Network' : '5 Monitored Sites'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isLevel1NationalMap ? 'Select a city node to zoom into its heritage monuments' : `Dedicated GIS view for ${activeCity} monuments`}
            </p>
          </div>
        </div>

        {/* Level 1 & Level 2 City Toolbar Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {['ALL', 'DELHI', 'JAIPUR', 'MUMBAI', 'PRAYAGRAJ'].map((city) => {
            const isAll = city === 'ALL';
            const palette = CITY_COLORS[city];
            const isActive = activeCity === city;

            return (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                  isActive
                    ? isAll
                      ? 'bg-[#0F3D3E] text-white shadow-md'
                      : `${palette.bg} text-white shadow-md ring-1 ${palette.border}`
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAll ? 'India Map' : city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* MAP LEGEND OVERLAY (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl space-y-1.5 text-[11px] font-mono text-slate-300">
          <div className="flex items-center justify-between font-bold text-white border-b border-slate-800 pb-1 mb-1">
            <span>HERITAGE SITE STATUS</span>
            <span className="text-[10px] text-slate-400">{legendCounts.total} Sites</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Safe ({legendCounts.safe})</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Moderate ({legendCounts.moderate})</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E28743] shrink-0" />
              <span>High ({legendCounts.high})</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
              <span>Critical ({legendCounts.critical})</span>
            </span>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs z-30">
            <div className="text-center text-slate-300 space-y-2">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono">Loading heritage sites & GIS telemetry...</p>
            </div>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/85 backdrop-blur-xs z-30 p-6">
            <div className="text-center text-amber-200 max-w-sm space-y-3 p-6 bg-slate-950 rounded-2xl border border-amber-500/30">
              <AlertTriangle className="w-10 h-10 mx-auto text-amber-500" />
              <p className="text-sm font-bold">Unable to load heritage monitoring data</p>
              <p className="text-xs text-slate-400">Please check backend API connection and try again.</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700 transition-all cursor-pointer"
                >
                  Retry Loading
                </button>
              )}
            </div>
          </div>
        ) : isLevel1NationalMap ? (
          /* =========================================================
             LEVEL 1: INDIA MAP → SHOW ONLY 4 CITY NODE MARKERS (Req 1 & 2)
             ========================================================= */
          Object.entries(cityGroups).map(([cityKey, citySites]) => {
            const node = NATIONAL_CITY_NODES[cityKey] || NATIONAL_CITY_NODES.DELHI;
            const palette = CITY_COLORS[cityKey] || CITY_COLORS.DELHI;

            return (
              <button
                key={`city-node-${cityKey}`}
                onClick={() => setActiveCity(cityKey)}
                style={{ top: `${node.top}%`, left: `${node.left}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group transition-all duration-300 hover:scale-110"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`px-4 py-2 rounded-2xl ${palette.bg} text-white font-mono font-bold text-xs shadow-2xl border-2 border-white/40 flex items-center space-x-2.5 transition-all ${palette.glow}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <div className="text-left leading-none">
                      <p className="font-extrabold text-sm tracking-wider">{cityKey}</p>
                      <p className="text-[10px] text-white/80 mt-0.5">{citySites.length} Heritage Sites</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className={`mt-1.5 text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded border shadow-lg ${palette.badge}`}>
                    Click to Open {cityKey} Map
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          /* =========================================================
             LEVEL 2: CITY MAP VIEW → SHOW ONLY THAT CITY'S 5 MONUMENTS (Req 5 & 6)
             Zero Overlapping Markers & Labels
             ========================================================= */
          <>
            {/* Center City Emblem */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 opacity-70">
              <Building2 className={`w-12 h-12 mx-auto mb-1 ${activePalette.text}`} />
              <p className="font-mono font-extrabold text-sm text-white tracking-widest uppercase">
                {activeCity} GIS CENTER
              </p>
              <p className="text-[10px] text-slate-400 font-mono">5 Monitored Monuments</p>
            </div>

            {/* Render the 5 Monument Pins for this City */}
            {currentCitySites.map((site, index) => {
              const coords = getCitySiteCoords(site, index, currentCitySites.length);
              const isSelected = selectedSite?.site_id === site.site_id;
              const pressure = pressureMap[site.site_id] || null;
              const crowd = crowdMap[site.site_id] || null;
              const condition = calculateConditionStatus(pressure);
              const liveVisitors = getCurrentHourPredictedVisitors(crowd);

              // Secondary Risk Indicator Dot
              let riskDotColor = 'bg-emerald-400';
              if (condition === 'CRITICAL') {
                riskDotColor = 'bg-red-500 animate-ping';
              } else if (condition === 'SEVERE') {
                riskDotColor = 'bg-amber-400';
              } else if (condition === 'MODERATE') {
                riskDotColor = 'bg-yellow-400';
              }

              return (
                <button
                  key={site.site_id}
                  onClick={() => onSelectSite(site)}
                  style={{ top: coords.top, left: coords.left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                    isSelected ? 'z-30 scale-110' : 'z-20 hover:scale-105'
                  }`}
                >
                  <div className="relative group flex items-center">
                    {/* Monument Name Tag Pin (Req 9) */}
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-2xl border-2 border-white/40 backdrop-blur-md transition-all ${activePalette.bg} text-white ${activePalette.glow} ${
                        isSelected ? 'ring-4 ring-white shadow-2xl scale-105' : ''
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${riskDotColor} shrink-0`} />
                      <span className="truncate max-w-[150px] font-sans text-xs font-bold">
                        {site.name}
                      </span>
                    </div>

                    {/* HOVER TOOLTIP (Req 9 & 10) */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 hidden group-hover:block z-40 bg-slate-900 text-white text-[11px] p-3 rounded-xl border border-slate-700 shadow-2xl whitespace-nowrap">
                      <p className="font-bold text-xs">{site.name}</p>
                      <p className="text-slate-400 text-[10px]">{site.city}, {site.state}</p>
                      <p className="text-slate-300 mt-1">
                        Heritage Pressure:{' '}
                        <span className="font-bold font-mono text-red-400">
                          {pressure ? pressure.pressure_score.toFixed(1) : 'N/A'}
                        </span>
                      </p>
                      <p className="text-slate-300 font-mono text-[10px]">
                        Live Visitors:{' '}
                        <span className="font-bold text-amber-400">
                          {liveVisitors.toLocaleString()}
                        </span>
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        Risk: <span className="font-bold text-emerald-400">{condition}</span>
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="relative z-20 px-4 py-2 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>
          {isLevel1NationalMap
            ? 'Level 1: National India Map (4 City Nodes)'
            : `Level 2: ${activeCity} Heritage Map (5 Monitored Monuments)`}
        </span>
        <span className="text-emerald-400 font-bold">100% Backend Connected</span>
      </div>
    </div>
  );
};
