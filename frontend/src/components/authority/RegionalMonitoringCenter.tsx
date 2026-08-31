import React, { useMemo } from 'react';
import {
  Building2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Users,
  Activity
} from 'lucide-react';
import { BackendSite, PressureResponse } from '../../api/sites';
import { CrowdPredictionResponse } from '../../api/crowd';
import {
  calculateConditionStatus,
  calculateCrowdLevel,
  getCurrentHourPredictedVisitors,
  isMonumentCurrentlyClosed,
  resolveImageUrl
} from '../../api/authority';
import { MONUMENT_FALLBACKS } from '../../assets/monumentImages';
import { SITE_METADATA } from '../../data/siteMapper';

interface RegionalMonitoringCenterProps {
  sites: BackendSite[];
  pressureMap: Record<string, PressureResponse>;
  crowdMap: Record<string, CrowdPredictionResponse>;
  selectedSite: BackendSite | null;
  onSelectSite: (site: BackendSite) => void;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const RegionalMonitoringCenter: React.FC<RegionalMonitoringCenterProps> = ({
  sites,
  pressureMap,
  crowdMap,
  selectedSite,
  onSelectSite,
  loading,
  error,
  onRetry
}) => {
  // Group sites into 4 regional buckets
  const regions = useMemo(() => {
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

  // Compute National Executive Summary metrics
  const summaryMetrics = useMemo(() => {
    let highRiskCount = 0;
    let totalVisitors = 0;

    sites.forEach((s) => {
      const p = pressureMap[s.site_id];
      if (p && (p.risk?.toUpperCase() === 'HIGH' || p.risk?.toUpperCase() === 'CRITICAL' || p.pressure_score >= 60)) {
        highRiskCount++;
      }
      const c = crowdMap[s.site_id];
      if (c) {
        totalVisitors += getCurrentHourPredictedVisitors(c, SITE_METADATA[s.site_id]?.openingHours);
      }
    });

    return {
      totalSites: sites.length || 20,
      totalRegions: Object.keys(regions).length,
      highRiskCount,
      totalVisitors
    };
  }, [sites, pressureMap, crowdMap, regions]);

  // Helper for condition badge styling
  const getBadgeStyle = (status: 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'STABLE') => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-300';
      case 'SEVERE':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'STABLE':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. NATIONAL OVERVIEW EXECUTIVE STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sites */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sites</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-[#0F3D3E] mt-0.5">
              {loading ? '...' : summaryMetrics.totalSites}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Monitored Nationwide</p>
          </div>
          <Building2 className="w-8 h-8 text-[#0F3D3E]/20" />
        </div>

        {/* Live Monitoring Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Telemetry</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 flex items-center space-x-1.5 mt-0.5">
              <span>Active</span>
            </p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Backend Online</span>
            </p>
          </div>
          <Activity className="w-8 h-8 text-emerald-600/20" />
        </div>

        {/* Total Regions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Regions</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-[#0F3D3E] mt-0.5">
              {summaryMetrics.totalRegions}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Cultural Hub Zones</p>
          </div>
          <MapPin className="w-8 h-8 text-[#0F3D3E]/20" />
        </div>

        {/* High Risk Flagged Sites */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High-Risk Sites</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-red-600 mt-0.5">
              {loading ? '...' : summaryMetrics.highRiskCount}
            </p>
            <p className="text-[10px] text-red-600 font-bold">Priority Actions Needed</p>
          </div>
          <ShieldAlert className="w-8 h-8 text-red-600/20" />
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3.5 py-1.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-all cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* 2. 2x2 REGIONAL MONITORING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(regions).map(([cityKey, citySites]) => {
          // Compute regional statistics
          let totalCityVisitors = 0;
          let maxPressureScore = 0;

          citySites.forEach((site) => {
            const p = pressureMap[site.site_id];
            if (p && p.pressure_score > maxPressureScore) {
              maxPressureScore = p.pressure_score;
            }
            const c = crowdMap[site.site_id];
            if (c) {
              totalCityVisitors += getCurrentHourPredictedVisitors(c);
            }
          });

          let cityStrainLabel = 'STABLE';
          let cityStrainColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          if (maxPressureScore >= 75) {
            cityStrainLabel = 'CRITICAL';
            cityStrainColor = 'bg-red-100 text-red-800 border-red-300';
          } else if (maxPressureScore >= 60) {
            cityStrainLabel = 'HIGH';
            cityStrainColor = 'bg-amber-100 text-amber-900 border-amber-300';
          } else if (maxPressureScore >= 40) {
            cityStrainLabel = 'MODERATE';
            cityStrainColor = 'bg-yellow-100 text-yellow-900 border-yellow-300';
          }

          return (
            <div
              key={cityKey}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between overflow-hidden hover:border-slate-300 transition-all"
            >
              {/* Regional Module Card Header */}
              <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base sm:text-lg font-bold text-[#0F3D3E] font-serif-heritage tracking-wide">
                      {cityKey} REGION
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                      {citySites.length} Sites
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live telemetry feed across {citySites.length} protected monuments
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${cityStrainColor}`}
                  >
                    Strain: {cityStrainLabel}
                  </span>
                </div>
              </div>

              {/* List of 5 Monuments in City */}
              <div className="divide-y divide-slate-100 flex-1">
                {loading ? (
                  /* Skeleton rows */
                  Array.from({ length: 5 }).map((_, idx) => (
                    <div key={`skel-${cityKey}-${idx}`} className="p-3.5 flex items-center justify-between animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0" />
                        <div className="space-y-1">
                          <div className="w-28 h-3 bg-slate-200 rounded" />
                          <div className="w-16 h-2 bg-slate-200 rounded" />
                        </div>
                      </div>
                      <div className="w-16 h-5 bg-slate-200 rounded-full" />
                    </div>
                  ))
                ) : (
                  citySites.map((site) => {
                    const isSelected = selectedSite?.site_id === site.site_id;
                    const pressure = pressureMap[site.site_id] || null;
                    const crowd = crowdMap[site.site_id] || null;
                    const openingHours = SITE_METADATA[site.site_id]?.openingHours || '';
                    const isClosed = isMonumentCurrentlyClosed(crowd, openingHours);
                    const condition = calculateConditionStatus(pressure);
                    const liveVisitors = getCurrentHourPredictedVisitors(crowd, openingHours);
                    const imgUrl = resolveImageUrl(site.image_url, site.site_id);

                    return (
                      <div
                        key={site.site_id}
                        onClick={() => onSelectSite(site)}
                        className={`p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0F3D3E] text-white shadow-xs'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        {/* Left: Thumbnail & Name */}
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                          <img
                            src={imgUrl}
                            alt={site.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                MONUMENT_FALLBACKS[site.site_id] || '/images/heritage-placeholder.jpg';
                            }}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0">
                            <p className={`font-bold text-xs sm:text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {site.name}
                            </p>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                              {site.city}, {site.state}
                            </p>
                          </div>
                        </div>

                        {/* Right: Pressure & Risk Badge */}
                        <div className="flex items-center space-x-3 shrink-0">
                          <div className="text-right font-mono">
                            <p className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-900'}`}>
                              {pressure ? `${pressure.pressure_score.toFixed(1)}/100` : 'N/A'}
                            </p>
                            {isClosed ? (
                              <p className={`text-[9px] font-bold ${isSelected ? 'text-amber-300' : 'text-amber-600'}`}>
                                0 (currently closed)
                              </p>
                            ) : (
                              <p className={`text-[9px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                {liveVisitors.toLocaleString()} visitors
                              </p>
                            )}
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getBadgeStyle(
                              condition
                            )}`}
                          >
                            {condition}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Regional Summary Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
                <span>Total Live Footfall: <strong className="text-slate-900 font-bold">{totalCityVisitors.toLocaleString()}</strong></span>
                <span>Max Peak Pressure: <strong className="text-red-600 font-bold">{maxPressureScore.toFixed(1)}/100</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
