import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Clock, 
  MapPin, 
  ArrowUpRight, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  Eye, 
  Layers, 
  FileText, 
  Sliders, 
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Send,
  Database,
  BarChart3,
  Calendar,
  AlertCircle,
  Map as MapIcon,
  Download,
  Filter
} from 'lucide-react';
import { 
  AUTHORITY_KPIS, 
  GIS_MONUMENT_PINS, 
  HIGH_RISK_SITES_SUMMARY, 
  HOURLY_OVERALL_CROWD 
} from '../../data/authorityMetricsData';
import { DamageScanResult, AlertItem } from '../../types/heritage';
import { AiDamageInspector } from './AiDamageInspector';
import { ConditionMatrix } from './ConditionMatrix';
import { ConservationWorkflow } from './ConservationWorkflow';

interface AuthorityAppProps {
  language: 'en' | 'hi';
  activeTab?: 'overview' | 'monitoring' | 'analytics' | 'conservation';
  onTabChange?: (tab: 'overview' | 'monitoring' | 'analytics' | 'conservation') => void;
  citizenReports: DamageScanResult[];
  alerts: AlertItem[];
  onActionAlert: (alertId: string) => void;
  onDispatchTeam: (monumentName: string, actionType: string) => void;
  onThrottleFootfall: (monumentName: string) => void;
}

export const AuthorityApp: React.FC<AuthorityAppProps> = ({
  language,
  activeTab = 'overview',
  onTabChange,
  citizenReports,
  alerts,
  onActionAlert,
  onDispatchTeam,
  onThrottleFootfall
}) => {
  const [selectedMapPin, setSelectedMapPin] = useState<typeof GIS_MONUMENT_PINS[0] | null>(GIS_MONUMENT_PINS[0]);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [activeConservationSubtab, setActiveConservationSubtab] = useState<'inspector' | 'citizen-reports' | 'alerts' | 'workflow'>('inspector');

  const handleNavigateTab = (tab: 'overview' | 'monitoring' | 'analytics' | 'conservation') => {
    if (onTabChange) {
      onTabChange(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert lat/lng to representative 2D coordinates on the visual map
  const getPinCoordinates = (lat: number, lng: number) => {
    // Normalizing India's bounding box: lat ~ 8 to 32, lng ~ 68 to 90
    const topPercent = `${Math.max(12, Math.min(86, ((32 - lat) / (32 - 8)) * 100))}%`;
    const leftPercent = `${Math.max(12, Math.min(86, ((lng - 68) / (90 - 68)) * 100))}%`;
    return { topPercent, leftPercent };
  };

  const kpis = [
    {
      id: 'total-sites',
      title: 'Total Monitored Sites',
      value: AUTHORITY_KPIS.totalSites.toLocaleString(),
      subtitle: 'Across 28 States & UTs',
      change: '+12 added',
      changeType: 'increase'
    },
    {
      id: 'high-risk',
      title: 'High Risk / Strain Sites',
      value: AUTHORITY_KPIS.highRiskSites.toString(),
      subtitle: 'Immediate Grouting Required',
      change: '-3 this week',
      changeType: 'decrease'
    },
    {
      id: 'overcrowded',
      title: 'Overcrowded Sites',
      value: AUTHORITY_KPIS.overcrowdedSites.toString(),
      subtitle: 'Footfall > 110% Threshold',
      change: 'Surge Active',
      changeType: 'increase'
    },
    {
      id: 'footfall',
      title: 'Total Footfall Today',
      value: AUTHORITY_KPIS.totalFootfallToday.toLocaleString(),
      subtitle: `+${AUTHORITY_KPIS.footfallDeltaPercent}% vs last week avg`,
      change: '+18.6%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="w-full bg-[#F4F6F9] text-[#1A202C] min-h-[calc(100vh-72px)]">
      
      {/* Full-Width Main Content Canvas (No Sidebars!) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fadeIn">
        
        {/* =========================================================================
            TAB 1: OVERVIEW (Executive Control Center & KPIs)
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Header Section with Timeframe Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1A365D] text-[10px] font-bold tracking-wider uppercase mb-1 border border-blue-200">
                  <Activity className="w-3 h-3 text-[#E28743]" />
                  <span>ASI EXECUTIVE DASHBOARD</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-serif-heritage">
                  Heritage Control Center
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Real-time structural condition telemetry, visitor density surge controls, and emergency dispatch registry.
                </p>
              </div>

              {/* Timeframe selector & Quick Action */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  {(['day', 'week', 'month'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                        timeframe === tf
                          ? 'bg-[#0F3D3E] text-white shadow-xs'
                          : 'text-slate-600 hover:text-black'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleNavigateTab('conservation')}
                  className="px-4 py-2 rounded-xl bg-[#0F3D3E] hover:bg-[#0A2627] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>AI Damage Inspector</span>
                </button>
              </div>
            </div>

            {/* 2. Top Metric KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {kpis.map((kpi) => (
                <div 
                  key={kpi.id} 
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      kpi.changeType === 'increase' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {kpi.change}
                    </span>
                  </div>

                  <div className="my-3">
                    <p className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-mono-stat">{kpi.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{kpi.subtitle}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Target Range: Normal</span>
                    <span className="text-emerald-700 font-bold">99.4% Uptime</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. High Risk Sites Summary & Hourly Overall Crowd Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left (7 cols): High Risk Vulnerability Sites */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <h3 className="text-base font-bold text-[#0F3D3E] font-serif-heritage">
                      High-Priority Heritage Strain Watchlist
                    </h3>
                  </div>
                  <button 
                    onClick={() => handleNavigateTab('analytics')}
                    className="text-xs font-bold text-[#2B6CB0] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>Open Risk Matrix</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {HIGH_RISK_SITES_SUMMARY.map((site) => (
                    <div 
                      key={site.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">{site.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono">
                            Risk: {site.riskScore}/100
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {site.state} • <span className="text-red-600 font-medium">{site.alertType}</span> ({site.footfallRatio})
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => onThrottleFootfall(site.name)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          Throttle Gate
                        </button>
                        <button
                          onClick={() => onDispatchTeam(site.name, 'Structural Laser Consolidation')}
                          className="px-3 py-1.5 rounded-lg bg-[#0F3D3E] hover:bg-[#0A2627] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          Dispatch Team
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right (5 cols): Hourly Crowd Analytics Curve */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#0F3D3E] font-serif-heritage">
                    Aggregate Hourly Footfall Surge
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Live Sync</span>
                </div>

                <div className="space-y-2">
                  <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 bg-slate-50 rounded-xl border border-slate-100">
                    {HOURLY_OVERALL_CROWD.map((item) => {
                      const isPeak = item.footfall > 70000;
                      return (
                        <div key={item.hour} className="flex-1 flex flex-col items-center gap-1 group">
                          <div 
                            style={{ height: `${Math.max(15, (item.footfall / 100000) * 100)}%` }}
                            className={`w-full rounded-t-md transition-all group-hover:brightness-110 ${
                              isPeak ? 'bg-gradient-to-t from-red-600 to-amber-500' : 'bg-gradient-to-t from-[#0F3D3E] to-teal-500'
                            }`}
                          />
                          <span className="text-[9px] text-slate-500 font-mono truncate">{item.hour.split(':')[0]}h</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <span className="font-bold">Peak Window Advisory:</span> High visitor congestion active at Taj Mahal & Qutub Minar. Eco-diversion flow is re-routing 18% of traffic.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 2: MONITORING (Interactive GIS Site Map & Condition Telemetry)
           ========================================================================= */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-serif-heritage">
                  National Heritage GIS Monitoring Map
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Interactive real-time spatial network of protected monuments, sensor telemetry, and live gate status.
                </p>
              </div>
            </div>

            {/* Wide Interactive Map Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Map Canvas (8 cols) */}
              <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="relative h-[480px] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80"
                    alt="GIS Map Background"
                    className="w-full h-full object-cover filter brightness-75 contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* Interactive Monument Pins on the Map */}
                  {GIS_MONUMENT_PINS.map((pin) => {
                    const isSelected = selectedMapPin?.id === pin.id;
                    const coords = getPinCoordinates(pin.lat, pin.lng);
                    return (
                      <button
                        key={pin.id}
                        onClick={() => setSelectedMapPin(pin)}
                        style={{ top: coords.topPercent, left: coords.leftPercent }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 cursor-pointer ${
                          isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                        }`}
                      >
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 shadow-lg backdrop-blur-md ${
                          pin.risk === 'high' 
                            ? 'bg-red-600/90 text-white ring-2 ring-red-400' 
                            : pin.risk === 'moderate'
                            ? 'bg-amber-600/90 text-white ring-2 ring-amber-400'
                            : 'bg-emerald-600/90 text-white ring-2 ring-emerald-400'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>{pin.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 gap-2">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Optimal Capacity</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Elevated Footfall</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span>Critical Strain Threshold</span>
                    </span>
                  </div>
                  <span className="font-mono text-[11px]">{GIS_MONUMENT_PINS.length} Active Telemetry Nodes Connected</span>
                </div>
              </div>

              {/* Selected Pin Detailed Drawer (4 cols) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                {selectedMapPin ? (
                  <div className="space-y-4">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedMapPin.risk === 'high' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Risk Tier: {selectedMapPin.risk.toUpperCase()}
                      </span>
                      <h3 className="text-xl font-bold text-[#0F3D3E] font-serif-heritage mt-2">
                        {selectedMapPin.name}
                      </h3>
                      <p className="text-xs text-slate-500">{selectedMapPin.state}</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <span className="text-slate-600">Degradation Risk Score</span>
                        <span className="font-bold font-mono text-red-600">{selectedMapPin.riskScore}/100</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <span className="text-slate-600">Live Visitor Count</span>
                        <span className="font-bold font-mono text-slate-900">{selectedMapPin.footfall.toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <span className="text-slate-600">Coordinates (Lat / Lng)</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedMapPin.lat.toFixed(2)}, {selectedMapPin.lng.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        onClick={() => onThrottleFootfall(selectedMapPin.name)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                      >
                        Activate Footfall Diversion
                      </button>
                      <button
                        onClick={() => handleNavigateTab('conservation')}
                        className="w-full py-2.5 rounded-xl bg-[#0F3D3E] hover:bg-[#0A2627] text-white font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                      >
                        Inspect Damage Scans
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Select any monument pin on the GIS map to view real-time telemetry.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: ANALYTICS (Risk & Condition Matrix)
           ========================================================================= */}
        {activeTab === 'analytics' && (
          <ConditionMatrix
            language={language}
            onInspectSite={() => handleNavigateTab('conservation')}
            onThrottleFootfall={onThrottleFootfall}
          />
        )}

        {/* =========================================================================
            TAB 4: CONSERVATION (AI Inspector, Workflow, Citizen Reports, Alerts)
           ========================================================================= */}
        {activeTab === 'conservation' && (
          <div className="space-y-6">
            
            {/* Subtab Header for Conservation Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-serif-heritage">
                  Conservation & Restoration Center
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  AI-assisted crack quantification, field team dispatch workflow, citizen damage logs, and active alerts.
                </p>
              </div>

              {/* Subtab Switcher Pills */}
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setActiveConservationSubtab('inspector')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeConservationSubtab === 'inspector'
                      ? 'bg-[#0F3D3E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  AI Damage Inspector
                </button>
                <button
                  onClick={() => setActiveConservationSubtab('citizen-reports')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeConservationSubtab === 'citizen-reports'
                      ? 'bg-[#0F3D3E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  Citizen Reports ({citizenReports.length})
                </button>
                <button
                  onClick={() => setActiveConservationSubtab('alerts')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeConservationSubtab === 'alerts'
                      ? 'bg-[#0F3D3E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  Telemetry Alerts ({alerts.length})
                </button>
              </div>
            </div>

            {/* Sub-view: AI Damage Inspector */}
            {activeConservationSubtab === 'inspector' && (
              <AiDamageInspector
                language={language}
                onDispatchTeam={onDispatchTeam}
              />
            )}

            {/* Sub-view: Citizen Verified Damage Reports */}
            {activeConservationSubtab === 'citizen-reports' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {citizenReports.map((scan) => (
                    <div key={scan.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F3D3E] truncate max-w-[200px]">{scan.monumentName}</span>
                        <span className="text-[10px] bg-red-100 text-red-800 font-mono font-bold px-2 py-0.5 rounded">
                          Score: {scan.overallDamageScore}/100
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
                        <p><span className="font-semibold text-slate-900">Detected Anomaly:</span> {scan.detections[0]?.title || 'Surface Spalling / Weathering'}</p>
                        <p><span className="font-semibold text-slate-900">Severity:</span> <span className="text-amber-700 font-bold">{scan.detections[0]?.severity || 'Medium'}</span></p>
                        <p><span className="font-semibold text-slate-900">Report Status:</span> <span className="text-emerald-700 font-bold">{scan.status}</span></p>
                        <p className="text-[10px] text-slate-400">Timestamp: {scan.scannedAt}</p>
                      </div>

                      <button
                        onClick={() => onDispatchTeam(scan.monumentName, 'Field Conservation Inspection')}
                        className="w-full py-2 bg-[#0F3D3E] hover:bg-[#0A2627] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Dispatch Field Inspection Team
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-view: Telemetry Alerts */}
            {activeConservationSubtab === 'alerts' && (
              <div className="space-y-3 max-w-4xl">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-white rounded-2xl border border-red-200 shadow-sm flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-red-950">{alert.title}</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">{alert.details}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{alert.timeAgo}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onActionAlert(alert.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs active:scale-95 shrink-0"
                    >
                      Acknowledge
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
