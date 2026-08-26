import React, { useState } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Users, 
  ShieldCheck, 
  Calendar, 
  Bell, 
  ChevronRight, 
  TrendingUp, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Layers,
  ShieldAlert,
  Send,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { 
  AUTHORITY_KPIS, 
  RISK_DISTRIBUTION, 
  HIGH_RISK_SITES_SUMMARY, 
  RECENT_ALERTS, 
  HOURLY_OVERALL_CROWD,
  GIS_MONUMENT_PINS
} from '../../data/authorityMetricsData';
import { AlertItem } from '../../types/heritage';

interface AuthorityDashboardProps {
  language: 'en' | 'hi';
  onNavigateTab: (tab: string) => void;
  onOpenDamageInspector: (monumentId?: string) => void;
  alerts: AlertItem[];
  onActionAlert: (alertId: string) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  language,
  onNavigateTab,
  onOpenDamageInspector,
  alerts,
  onActionAlert
}) => {
  const [trendTimeframe, setTrendTimeframe] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [selectedMapFilter, setSelectedMapFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const [selectedPin, setSelectedPin] = useState<typeof GIS_MONUMENT_PINS[0] | null>(GIS_MONUMENT_PINS[0]);

  const filteredPins = GIS_MONUMENT_PINS.filter((pin) => {
    if (selectedMapFilter === 'all') return true;
    return pin.risk === selectedMapFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Bar (Image 2 inspired) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#0D3B2E]/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1128] font-serif-heritage">
              Heritage Control Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#1A2621]/70 mt-0.5">
            Monitoring India's heritage sites for preservation, safety & sustainable tourism.
          </p>
        </div>

        {/* Date Selector & Live Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-[#0D3B2E]/15 text-xs font-semibold text-[#0A1128] shadow-sm">
            <Calendar className="w-4 h-4 text-[#C85A32]" />
            <span>24 August, 2026 (Live Feed)</span>
          </div>

          <div className="flex items-center space-x-2 bg-[#0A1128] text-[#D4AF37] px-3.5 py-2 rounded-xl text-xs font-mono font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM NORMAL</span>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Cards (Image 2 inspired) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Sites */}
        <div className="bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm relative overflow-hidden flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#1A2621]/60 uppercase tracking-wider">Total Monitored Sites</p>
            <p className="text-3xl font-bold text-[#0A1128] font-mono-stat">{AUTHORITY_KPIS.totalSites.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>12 added this month</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: High-risk Sites */}
        <div className="bg-white p-5 rounded-2xl border border-red-200/80 shadow-sm relative overflow-hidden flex items-center justify-between group hover:shadow-md transition-all bg-gradient-to-br from-white to-red-50/30">
          <div className="space-y-1">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">High-Risk Sites</p>
            <p className="text-3xl font-bold text-red-600 font-mono-stat">{AUTHORITY_KPIS.highRiskSites}</p>
            <p className="text-[11px] text-red-600 font-semibold flex items-center space-x-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>15% from last month</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 animate-pulse" />
          </div>
        </div>

        {/* Card 3: Overcrowded Sites */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm relative overflow-hidden flex items-center justify-between group hover:shadow-md transition-all bg-gradient-to-br from-white to-amber-50/30">
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Overcrowded Sites</p>
            <p className="text-3xl font-bold text-amber-600 font-mono-stat">{AUTHORITY_KPIS.overcrowdedSites}</p>
            <p className="text-[11px] text-amber-700 font-semibold flex items-center space-x-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>8% from last month</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Card 4: Active Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm relative overflow-hidden flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#1A2621]/60 uppercase tracking-wider">Active Alerts</p>
            <p className="text-3xl font-bold text-[#0D3B2E] font-mono-stat">{alerts.length}</p>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>10% from last month</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0D3B2E] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* Row 2: GIS Heritage Risk Map + Risk Distribution Donut + Crowd Trend (Image 2 inspired) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Interactive GIS India Risk Map (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#0D3B2E]/10 mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0A1128] font-serif-heritage">
                Heritage Risk GIS Map
              </h3>
              <p className="text-[11px] text-gray-500">Live geo-tagged risk clusters</p>
            </div>

            <button
              onClick={() => onNavigateTab('authority-matrix')}
              className="text-xs font-semibold text-[#0D3B2E] hover:underline"
            >
              View Full Table →
            </button>
          </div>

          {/* Interactive Simulated Map Canvas */}
          <div className="relative h-64 w-full bg-[#0A1128] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-3 select-none">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-dark-grid opacity-30 pointer-events-none" />

            {/* India Map Stylized SVG Canvas with Geo Hotspots */}
            <div className="relative w-full h-full">
              
              {/* Map Cluster Nodes */}
              {filteredPins.map((pin) => {
                // Approximate coordinate mapping to percentage
                const topPct = Math.max(10, Math.min(85, 100 - (pin.lat - 8) * 3.6));
                const leftPct = Math.max(15, Math.min(85, (pin.lng - 68) * 3.8));
                const isSelected = selectedPin?.id === pin.id;

                return (
                  <button
                    key={pin.id}
                    onClick={() => setSelectedPin(pin)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full font-mono text-[10px] font-bold transition-transform flex items-center justify-center shadow-lg ${
                      pin.risk === 'high'
                        ? 'bg-red-500 text-white ring-4 ring-red-500/30'
                        : pin.risk === 'moderate'
                        ? 'bg-amber-500 text-black ring-4 ring-amber-500/30'
                        : 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                    } ${isSelected ? 'scale-125 z-30 ring-white' : 'w-7 h-7 hover:scale-110 z-10'}`}
                    style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                    title={`${pin.name} (Risk: ${pin.riskScore}%)`}
                  >
                    {pin.riskScore}
                  </button>
                );
              })}

            </div>

            {/* Floating Legend */}
            <div className="absolute bottom-2 right-2 bg-[#131E3A]/90 backdrop-blur-md p-2 rounded-lg border border-white/10 text-[9px] text-white/80 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Low Risk (0 - 30%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Moderate (30 - 60%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>High Risk (&gt; 60%)</span>
              </div>
            </div>

          </div>

          {/* Selected Pin Quick Drawer */}
          {selectedPin && (
            <div className="mt-3 p-3 bg-[#F8F6F0] rounded-xl border border-[#0D3B2E]/10 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-[#0A1128]">{selectedPin.name} ({selectedPin.state})</p>
                <p className="text-[11px] text-gray-500">
                  Live Footfall: <span className="font-semibold text-[#0D3B2E]">{selectedPin.footfall.toLocaleString()}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  selectedPin.risk === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Risk: {selectedPin.riskScore}%
                </span>
                <button
                  onClick={() => onOpenDamageInspector(selectedPin.name.toLowerCase().replace(/ /g, '-'))}
                  className="p-1.5 rounded-lg bg-[#0D3B2E] text-white hover:bg-[#08281E] text-[10px] font-bold"
                  title="Inspect Damage Scans"
                >
                  Inspect
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Center: Risk Distribution Donut Breakdown (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-[#0D3B2E]/10">
            <h3 className="text-sm font-bold text-[#0A1128] font-serif-heritage">
              Risk Distribution
            </h3>
            <p className="text-[11px] text-gray-500">Nationwide site vulnerability</p>
          </div>

          {/* Donut Chart Visual */}
          <div className="relative py-4 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-[14px] border-emerald-500 border-t-red-500 border-r-amber-500 flex flex-col items-center justify-center shadow-inner">
              <span className="text-xl font-bold font-mono text-[#0A1128]">1,248</span>
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Total Sites</span>
            </div>
          </div>

          {/* Breakdown Legend */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-[#1A2621]/80">Low Risk</span>
              </div>
              <span className="font-mono font-bold text-emerald-700">812 (65%)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-[#1A2621]/80">Moderate Risk</span>
              </div>
              <span className="font-mono font-bold text-amber-700">338 (27%)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-[#1A2621]/80">High Risk</span>
              </div>
              <span className="font-mono font-bold text-red-700">98 (8%)</span>
            </div>
          </div>

        </div>

        {/* Right: Crowd Trend (Today) Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#0D3B2E]/10">
            <div>
              <h3 className="text-sm font-bold text-[#0A1128] font-serif-heritage">
                Crowd Trend
              </h3>
              <p className="text-[11px] text-gray-500">Footfall distribution</p>
            </div>

            {/* Day / Week / Month Pill Selector */}
            <div className="flex items-center space-x-1 bg-[#F8F6F0] p-1 rounded-lg border border-[#0D3B2E]/10 text-[10px] font-bold">
              {(['Day', 'Week', 'Month'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTrendTimeframe(tf)}
                  className={`px-2 py-0.5 rounded ${
                    trendTimeframe === tf ? 'bg-[#0D3B2E] text-white' : 'text-[#1A2621]/70'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Wave Line Chart Simulation */}
          <div className="relative h-40 w-full flex items-end pt-4 pb-2 px-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
              <defs>
                <linearGradient id="crowdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Shaded Area */}
              <path
                d="M 0 110 Q 40 100 80 70 T 160 20 T 220 50 T 300 90 L 300 120 L 0 120 Z"
                fill="url(#crowdGrad)"
              />
              {/* Curve Line */}
              <path
                d="M 0 110 Q 40 100 80 70 T 160 20 T 220 50 T 300 90"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Peak Marker Dot */}
              <circle cx="160" cy="20" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>

          {/* Peak Footfall Banner */}
          <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-[11px] font-semibold">
              Peak footfall observed between <span className="font-bold text-indigo-900">11:00 AM – 03:00 PM</span>
            </span>
          </div>

        </div>

      </div>

      {/* Row 3: High-risk Sites + Recent Alerts + Crowd Overview (Image 2 inspired) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* High-risk Sites Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#0D3B2E]/10">
            <h3 className="text-sm font-bold text-[#0A1128] font-serif-heritage">
              High-Risk Sites Priority
            </h3>
            <button 
              onClick={() => onNavigateTab('authority-matrix')}
              className="text-xs font-semibold text-[#0D3B2E] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {HIGH_RISK_SITES_SUMMARY.slice(0, 4).map((site) => (
              <div
                key={site.id}
                onClick={() => onOpenDamageInspector(site.id)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6F0] hover:bg-white hover:shadow-sm border border-[#0D3B2E]/10 transition-all cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#0A1128] group-hover:text-[#0D3B2E]">
                    {site.name}
                  </h4>
                  <p className="text-[10px] text-gray-500">{site.state} • {site.footfallRatio}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-red-600">
                    {site.riskScore}%
                  </span>
                  <p className="text-[9px] text-gray-400">Risk Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts Feed (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#0D3B2E]/10">
            <h3 className="text-sm font-bold text-[#0A1128] font-serif-heritage flex items-center space-x-1.5">
              <Bell className="w-4 h-4 text-red-600" />
              <span>Live Alert Dispatch</span>
            </h3>
            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              {alerts.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 4).map((alt) => (
              <div
                key={alt.id}
                className="p-3 rounded-xl bg-[#F8F6F0] border border-[#0D3B2E]/10 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                    {alt.type}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{alt.timeAgo}</span>
                </div>
                <h4 className="text-xs font-bold text-[#0A1128] leading-tight">
                  {alt.title}
                </h4>
                <p className="text-[11px] text-[#1A2621]/70 leading-snug">
                  {alt.details}
                </p>
                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => onActionAlert(alt.id)}
                    className="px-2.5 py-1 rounded bg-[#0D3B2E] text-white text-[10px] font-bold hover:bg-[#08281E]"
                  >
                    Dispatch Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crowd Overview Today (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#0D3B2E]/10">
            <div>
              <h3 className="text-sm font-bold text-[#0A1128] font-serif-heritage">
                Crowd Overview (Today)
              </h3>
              <p className="text-[11px] text-gray-500">Live ticket telemetry</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700">
              +18.6% vs yesterday
            </span>
          </div>

          <div>
            <p className="text-3xl font-bold font-mono text-[#0A1128]">
              {AUTHORITY_KPIS.totalFootfallToday.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">Total registered visitors across 1,248 sites</p>
          </div>

          {/* Hourly Vertical Bars */}
          <div className="h-32 flex items-end justify-between gap-1 pt-2 border-t border-[#0D3B2E]/10">
            {HOURLY_OVERALL_CROWD.map((item, idx) => {
              const maxFootfall = 100000;
              const heightPct = Math.min(100, Math.round((item.footfall / maxFootfall) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className="w-full bg-indigo-500 rounded-t-sm group-hover:bg-[#D4AF37] transition-colors"
                    style={{ height: `${heightPct}%` }}
                  />
                  {idx % 3 === 0 && (
                    <span className="text-[8px] font-mono text-gray-400 mt-1">{item.hour}</span>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Bottom Authority Preservation Banner (Image 2 inspired) */}
      <div className="bg-[#0A1128] text-white p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#D4AF37]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Preserve Our Heritage, Secure Our Future
            </h4>
            <p className="text-xs text-white/70">
              Real-time monitoring and intelligent insights to protect India's cultural legacy for generations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('authority-damage')}
            className="px-4 py-2 bg-[#D4AF37] text-[#0A1128] font-bold text-xs rounded-xl hover:bg-[#c59b27] transition-colors"
          >
            Launch Damage AI Inspector
          </button>
        </div>
      </div>

    </div>
  );
};
