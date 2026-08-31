import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Map as MapIcon,
  TrendingUp,
  Shield,
  Layers,
  MapPin
} from 'lucide-react';

import {
  getSites,
  getPressure,
  getCrowd,
  BackendSite,
  PressureResponse
} from '../../api/sites';

import {
  resolveImageUrl,
  calculateConditionStatus,
  calculateCrowdLevel,
  getCurrentHourPredictedVisitors
} from '../../api/authority';

import { CrowdPredictionResponse } from '../../api/crowd';
import { ConditionMatrix } from './ConditionMatrix';
import { IndiaGisMap } from './IndiaGisMap';
import { MONUMENT_FALLBACKS } from '../../assets/monumentImages';
import { SITE_METADATA } from '../../data/siteMapper';

interface AuthorityAppProps {
  language: 'en' | 'hi';
  activeTab?: 'overview' | 'monitoring' | 'analytics';
  onTabChange?: (tab: 'overview' | 'monitoring' | 'analytics') => void;
  onDispatchTeam: (monumentName: string, actionType: string) => void;
  onThrottleFootfall: (monumentName: string) => void;
  citizenReports?: any[];
  alerts?: any[];
  onActionAlert?: (alertId: string) => void;
}

export const AuthorityApp: React.FC<AuthorityAppProps> = ({
  language,
  activeTab = 'overview',
  onTabChange,
  onDispatchTeam,
  onThrottleFootfall,
  citizenReports,
  alerts,
  onActionAlert
}) => {
  const [sites, setSites] = useState<BackendSite[]>([]);
  const [pressureMap, setPressureMap] = useState<Record<string, PressureResponse>>({});
  const [crowdMap, setCrowdMap] = useState<Record<string, CrowdPredictionResponse>>({});
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Fetch all 20 backend sites + telemetry
  const loadTelemetryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedSites = await getSites();
      setSites(fetchedSites);

      if (Array.isArray(fetchedSites) && fetchedSites.length > 0 && !selectedSiteId && fetchedSites[0]?.site_id) {
        setSelectedSiteId(fetchedSites[0].site_id);
      }

      const todayStr = new Date().toISOString().split('T')[0];

      const pResults = await Promise.allSettled(
        fetchedSites.map((s) => getPressure(s.site_id))
      );

      const cResults = await Promise.allSettled(
        fetchedSites.map((s) => getCrowd(s.site_id, todayStr))
      );

      const pMap: Record<string, PressureResponse> = {};
      pResults.forEach((res) => {
        if (res.status === 'fulfilled' && res.value?.site_id) {
          pMap[res.value.site_id] = res.value;
        }
      });

      const cMap: Record<string, CrowdPredictionResponse> = {};
      cResults.forEach((res) => {
        if (res.status === 'fulfilled' && res.value?.site_id) {
          cMap[res.value.site_id] = res.value;
        }
      });

      setPressureMap(pMap);
      setCrowdMap(cMap);
    } catch (err: any) {
      console.error('Authority telemetry loading failed:', err);
      setError('Unable to load real-time authority telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetryData();
  }, []);

  const handleNavigateTab = (tab: 'overview' | 'monitoring' | 'analytics') => {
    if (onTabChange) {
      onTabChange(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selected site details
  const selectedSite = useMemo(() => {
    return sites.find((s) => s.site_id === selectedSiteId) || sites[0] || null;
  }, [sites, selectedSiteId]);

  const selectedPressure = selectedSite ? pressureMap[selectedSite.site_id] || null : null;
  const selectedCrowd = selectedSite ? crowdMap[selectedSite.site_id] || null : null;
  const selectedLiveVisitors = getCurrentHourPredictedVisitors(selectedCrowd);

  // Group sites by city for GIS site list
  const sitesByCity = useMemo(() => {
    const groups: Record<string, BackendSite[]> = {
      DELHI: [],
      JAIPUR: [],
      MUMBAI: [],
      PRAYAGRAJ: []
    };

    sites.forEach((s) => {
      const cityKey = (s.city || 'DELHI').toUpperCase();
      if (groups[cityKey]) {
        groups[cityKey].push(s);
      } else {
        groups['DELHI'].push(s);
      }
    });

    return groups;
  }, [sites]);

  // Overview KPI Metrics
  const highRiskSites = useMemo(() => {
    return sites.filter((site) => {
      const p = pressureMap[site.site_id];
      if (!p) return false;
      const risk = (p.risk || '').toUpperCase();
      return risk === 'HIGH' || risk === 'CRITICAL' || p.pressure_score >= 60;
    });
  }, [sites, pressureMap]);

  const overcrowdedSites = useMemo(() => {
    return sites.filter((site) => {
      const c = crowdMap[site.site_id];
      if (!c) return false;
      return c.daily_expected_total > c.safe_capacity || (c.daily_expected_total / c.safe_capacity) >= 0.75;
    });
  }, [sites, crowdMap]);

  const totalFootfallToday = useMemo(() => {
    return sites.reduce((sum, site) => {
      const c = crowdMap[site.site_id];
      return sum + (c ? c.daily_expected_total : 0);
    }, 0);
  }, [sites, crowdMap]);

  // Timeframe aggregated values for KPI cards
  const footfallDisplay = useMemo(() => {
    if (timeframe === 'week') return (totalFootfallToday * 7).toLocaleString();
    if (timeframe === 'month') return (totalFootfallToday * 30).toLocaleString();
    return totalFootfallToday.toLocaleString();
  }, [totalFootfallToday, timeframe]);

  const footfallSubtitle = useMemo(() => {
    if (timeframe === 'week') return 'Predicted 7-Day Cumulative Footfall';
    if (timeframe === 'month') return 'Predicted 30-Day Cumulative Footfall';
    return 'Predicted Daily Total Visitors';
  }, [timeframe]);

  const overcrowdedDisplayCount = useMemo(() => {
    if (timeframe === 'week') return Math.min(sites.length, overcrowdedSites.length + 2);
    if (timeframe === 'month') return Math.min(sites.length, overcrowdedSites.length + 4);
    return overcrowdedSites.length;
  }, [overcrowdedSites, sites, timeframe]);

  // High-Priority Strain Watchlist (Top 4 sites sorted by pressure score)
  const watchlist = useMemo(() => {
    const sorted = [...sites].sort((a, b) => {
      const pA = pressureMap[a.site_id]?.pressure_score || 0;
      const pB = pressureMap[b.site_id]?.pressure_score || 0;
      return pB - pA;
    });

    return sorted.slice(0, 4).map((site) => {
      const pressure = pressureMap[site.site_id] || null;
      const crowd = crowdMap[site.site_id] || null;
      return { site, pressure, crowd };
    });
  }, [sites, pressureMap, crowdMap]);

  // Dynamic Chart Data for DAY, WEEK, MONTH
  const chartData = useMemo(() => {
    if (timeframe === 'day') {
      const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
      return hours.map((h) => {
        let sum = 0;
        sites.forEach((s) => {
          const c = crowdMap[s.site_id];
          if (c && c.predictions) {
            const pred = c.predictions.find((p) => p.time === h);
            if (pred) sum += pred.expected_visitors;
          }
        });
        const val = sum || Math.floor((totalFootfallToday || 32000) / 8);
        return {
          label: `${h.split(':')[0]}h`,
          fullLabel: `Time: ${h}`,
          value: val
        };
      });
    } else if (timeframe === 'week') {
      const days = [
        { label: 'Mon', full: 'Monday' },
        { label: 'Tue', full: 'Tuesday' },
        { label: 'Wed', full: 'Wednesday' },
        { label: 'Thu', full: 'Thursday' },
        { label: 'Fri', full: 'Friday' },
        { label: 'Sat', full: 'Saturday' },
        { label: 'Sun', full: 'Sunday' }
      ];
      const multipliers = [0.85, 0.90, 0.95, 1.0, 1.15, 1.40, 1.30];
      const baseDaily = totalFootfallToday || 45000;
      return days.map((day, idx) => ({
        label: day.label,
        fullLabel: `Day: ${day.full}`,
        value: Math.round(baseDaily * multipliers[idx])
      }));
    } else {
      const weeks = [
        { label: 'W1', full: 'Week 1 (Days 1-7)' },
        { label: 'W2', full: 'Week 2 (Days 8-14)' },
        { label: 'W3', full: 'Week 3 (Days 15-21)' },
        { label: 'W4', full: 'Week 4 (Days 22-30)' }
      ];
      const multipliers = [0.92, 1.05, 1.25, 0.98];
      const baseWeekly = (totalFootfallToday || 45000) * 7;
      return weeks.map((w, idx) => ({
        label: w.label,
        fullLabel: w.full,
        value: Math.round(baseWeekly * multipliers[idx])
      }));
    }
  }, [timeframe, sites, crowdMap, totalFootfallToday]);

  // Max value for dynamic Y-axis chart scaling
  const maxChartValue = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.value), 100);
    return Math.ceil(maxVal * 1.1);
  }, [chartData]);

  const getSiteDisplayName = (siteId: string, defaultName: string) => {
    if (language === 'hi' && SITE_METADATA[siteId]?.hindiName) {
      return SITE_METADATA[siteId].hindiName;
    }
    return defaultName;
  };

  // Peak Window Advisory text calculated dynamically from graph data
  const peakAdvisory = useMemo(() => {
    if (chartData.length === 0) {
      return language === 'hi' ? 'दबाव परामर्श लोड हो रहा है...' : 'Loading surge advisories...';
    }

    let maxItem = chartData[0];
    chartData.forEach((item) => {
      if (item.value > maxItem.value) maxItem = item;
    });

    if (language === 'hi') {
      if (timeframe === 'day') {
        return `पीक विंडो: 11:00 – 14:00 | ${maxItem.label} के आसपास उच्चतम दैनिक पर्यटक घनत्व (${maxItem.value.toLocaleString()} पर्यटक) दर्ज। अनुशंसित कार्रवाई: आने वाले पर्यटकों का प्रवाह डायवर्ट करें / प्रवेश द्वार नियंत्रण सक्रिय करें।`;
      } else if (timeframe === 'week') {
        return `पीक विंडो: शनिवार – रविवार | ${maxItem.fullLabel} पर सर्वाधिक साप्ताहिक दबाव (${maxItem.value.toLocaleString()} पर्यटक)। अनुशंसित कार्रवाई: गेट निगरानी बढ़ाएं और फील्ड संरक्षण टीम प्रेषित करें।`;
      } else {
        return `पीक विंडो: ${maxItem.fullLabel} | ${maxItem.fullLabel} के दौरान उच्चतम मासिक वृद्धि (${maxItem.value.toLocaleString()} पर्यटक)। अनुशंसित कार्रवाई: प्रवेश कोटा सीमाएं और क्षेत्रीय इको-डायवर्जन लागू करें।`;
      }
    }

    if (timeframe === 'day') {
      return `PEAK WINDOW: 11:00 – 14:00 | Highest daily concentration detected around ${maxItem.label} (${maxItem.value.toLocaleString()} visitors). Recommended Action: Divert incoming visitor flow / activate entry gate controls.`;
    } else if (timeframe === 'week') {
      return `PEAK WINDOW: Saturday – Sunday | Highest weekly concentration detected on ${maxItem.fullLabel} (${maxItem.value.toLocaleString()} visitors). Recommended Action: Increase gate monitoring and dispatch field conservation teams.`;
    } else {
      return `PEAK WINDOW: ${maxItem.fullLabel} | Highest monthly surge detected during ${maxItem.fullLabel} (${maxItem.value.toLocaleString()} visitors). Recommended Action: Implement entry quota caps and regional eco-diversion.`;
    }
  }, [chartData, timeframe, language]);

  return (
    <div className="w-full bg-[#F4F6F9] text-[#1A202C] min-h-[calc(100vh-72px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fadeIn">
        {/* =========================================================
            TAB 1: OVERVIEW
           ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1A365D] text-[10px] font-bold tracking-wider uppercase mb-1 border border-blue-200">
                  <Activity className="w-3 h-3 text-[#E28743]" />
                  <span>{language === 'hi' ? 'एएसआई कार्यकारी नियंत्रण केंद्र' : 'ASI EXECUTIVE CONTROL HUB'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-serif-heritage">
                  {language === 'hi' ? 'धरोहर नियंत्रण केंद्र' : 'Heritage Control Center'}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  {language === 'hi'
                    ? '20 पंजीकृत स्मारकों पर वास्तविक समय बैकएंड टेलीमेट्री, पर्यटक घनत्व नियंत्रण और स्वचालित तनाव परामर्श।'
                    : 'Real-time backend telemetry across 20 registered monuments, visitor density surge controls, and automated strain advisories.'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  {(['day', 'week', 'month'] as const).map((tf) => {
                    const labelMap = {
                      day: language === 'hi' ? 'दैनिक' : 'day',
                      week: language === 'hi' ? 'साप्ताहिक' : 'week',
                      month: language === 'hi' ? 'मासिक' : 'month'
                    };

                    return (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                          timeframe === tf
                            ? 'bg-[#0F3D3E] text-white shadow-xs'
                            : 'text-slate-600 hover:text-black'
                        }`}
                      >
                        {labelMap[tf]}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleNavigateTab('analytics')}
                  className="px-4 py-2 rounded-xl bg-[#0F3D3E] hover:bg-[#0A2627] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{language === 'hi' ? 'जोखिम विश्लेषण' : 'Risk Analytics'}</span>
                </button>
              </div>
            </div>

            {/* OVERVIEW KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Total Sites */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {language === 'hi' ? 'कुल मॉनिटर किए गए स्थल' : 'Total Monitored Sites'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {language === 'hi' ? '20 स्थल सक्रिय' : '20 Sites Active'}
                  </span>
                </div>
                <div className="my-3">
                  {loading ? (
                    <div className="h-8 w-24 bg-slate-200 animate-pulse rounded my-1" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-mono">
                      {sites.length}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'hi' ? '4 सांस्कृतिक शहरों में' : 'Across 4 Cultural Cities'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{language === 'hi' ? 'बैकएंड सिंक' : 'Backend Synced'}</span>
                  <span className="text-emerald-700 font-bold">{language === 'hi' ? '100% ऑनलाइन' : '100% Online'}</span>
                </div>
              </div>

              {/* Card 2: High Risk / Strain Sites */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {language === 'hi' ? 'उच्च जोखिम / दबाव वाले स्थल' : 'High Risk / Strain Sites'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                    {language === 'hi' ? 'कार्रवाई आवश्यक' : 'Action Required'}
                  </span>
                </div>
                <div className="my-3">
                  {loading ? (
                    <div className="h-8 w-24 bg-slate-200 animate-pulse rounded my-1" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-bold text-red-600 font-mono">
                      {highRiskSites.length}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'hi' ? 'दबाव स्कोर ≥ 60/100' : 'Pressure Score ≥ 60/100'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{language === 'hi' ? 'प्राथमिकता निरीक्षण' : 'Priority Inspection'}</span>
                  <span className="text-red-600 font-bold">
                    {highRiskSites.length} {language === 'hi' ? 'चिह्नित' : 'Flagged'}
                  </span>
                </div>
              </div>

              {/* Card 3: Overcrowded Sites */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {language === 'hi' ? 'अत्यधिक भीड़ वाले स्थल' : 'Overcrowded Sites'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    {language === 'hi' ? 'घनत्व चेतावनी' : 'Density Alert'}
                  </span>
                </div>
                <div className="my-3">
                  {loading ? (
                    <div className="h-8 w-24 bg-slate-200 animate-pulse rounded my-1" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono">
                      {overcrowdedDisplayCount}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'hi' ? 'फुटफॉल > 75% क्षमता' : 'Footfall > 75% Capacity'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{language === 'hi' ? 'प्रवेश द्वार नियंत्रण' : 'Gate Controls'}</span>
                  <span className="text-amber-700 font-bold">{language === 'hi' ? 'सर्ज सक्रिय' : 'Surge Active'}</span>
                </div>
              </div>

              {/* Card 4: Total Footfall */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {language === 'hi' ? 'कुल पर्यटक / फुटफॉल' : 'Total Footfall'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                    {timeframe === 'day' ? (language === 'hi' ? 'दैनिक सीमा' : 'Day Range') : timeframe === 'week' ? (language === 'hi' ? 'साप्ताहिक सीमा' : 'Week Range') : (language === 'hi' ? 'मासिक सीमा' : 'Month Range')}
                  </span>
                </div>
                <div className="my-3">
                  {loading ? (
                    <div className="h-8 w-28 bg-slate-200 animate-pulse rounded my-1" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-mono">
                      {footfallDisplay}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'hi' ? '20 स्थलों पर कुल अनुमान' : footfallSubtitle}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{language === 'hi' ? 'नेटवर्क क्षमता' : 'Network Capacity'}</span>
                  <span className="text-emerald-700 font-bold">{language === 'hi' ? 'सुरक्षित सीमा' : 'Safe Limits'}</span>
                </div>
              </div>
            </div>

            {/* WATCHLIST & AGGREGATE CROWD CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* WATCHLIST */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <h3 className="text-base font-bold text-[#0F3D3E] font-serif-heritage">
                      {language === 'hi' ? 'उच्च-प्राथमिकता धरोहर दबाव वॉचलिस्ट' : 'High-Priority Heritage Strain Watchlist'}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleNavigateTab('analytics')}
                    className="text-xs font-bold text-[#2B6CB0] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>{language === 'hi' ? 'ओपन मैट्रिक्स' : 'Open Matrix'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={`watchlist-skel-${idx}`}
                        className="p-4 rounded-xl border border-slate-200 animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="w-40 h-4 bg-slate-200 rounded" />
                          <div className="w-56 h-3 bg-slate-200 rounded" />
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-24 h-8 bg-slate-200 rounded-lg" />
                          <div className="w-24 h-8 bg-slate-200 rounded-lg" />
                        </div>
                      </div>
                    ))
                  ) : watchlist.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-xs">
                        {language === 'hi' ? 'कोई उच्च-प्राथमिकता दबाव स्थल नहीं मिला' : 'No high-priority strain sites detected'}
                      </p>
                    </div>
                  ) : (
                    watchlist.map(({ site, pressure, crowd }) => {
                      const pressureScore = pressure ? Math.round(pressure.pressure_score) : 0;
                      const riskLevel = pressure ? pressure.risk : 'MODERATE';
                      const displayName = getSiteDisplayName(site.site_id, site.name);

                      return (
                        <div
                          key={site.site_id}
                          className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-900">
                                {displayName}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono">
                                {language === 'hi' ? 'दबाव:' : 'Pressure:'} {pressureScore}/100
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {site.city}, {site.state}
                              {' • '}
                              <span className="text-red-600 font-medium">
                                {riskLevel} {language === 'hi' ? 'जोखिम' : 'RISK'}
                              </span>
                              {' • '}
                              {language === 'hi' ? 'अनुमानित पर्यटक:' : 'Exp. Visitors:'} {crowd?.daily_expected_total ? crowd.daily_expected_total.toLocaleString() : 'N/A'}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => onThrottleFootfall(site.name)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              {language === 'hi' ? 'प्रवाह डायवर्ट करें' : 'Divert Flow'}
                            </button>
                            <button
                              onClick={() => onDispatchTeam(site.name, 'Structural Inspection')}
                              className="px-3 py-1.5 rounded-lg bg-[#0F3D3E] hover:bg-[#0A2627] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              {language === 'hi' ? 'टीम प्रेषित करें' : 'Dispatch'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* AGGREGATE HOURLY FOOTFALL SURGE */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#0F3D3E] font-serif-heritage">
                      {language === 'hi' ? 'संचयी फुटफॉल वृद्धि' : 'Aggregate Footfall Surge'}
                    </h3>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {language === 'hi' ? `20 स्थलों पर ${timeframe === 'day' ? 'दैनिक' : timeframe === 'week' ? 'साप्ताहिक' : 'मासिक'} वितरण` : `${timeframe} distribution across 20 sites`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-48 flex items-end justify-between gap-2 pt-8 px-2 bg-slate-50 rounded-xl border border-slate-100 relative">
                    {chartData.map((item) => {
                      const heightPercent = Math.max(12, Math.min(100, (item.value / maxChartValue) * 100));
                      const isPeak = heightPercent >= 75;

                      return (
                        <div key={item.label} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end cursor-pointer">
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl font-mono z-30 border border-slate-700 whitespace-nowrap pointer-events-none">
                            <span className="text-slate-300 font-semibold">{item.fullLabel}</span>
                            <span className="font-bold text-amber-400">{language === 'hi' ? 'पर्यटक:' : 'Visitors:'} {item.value.toLocaleString()}</span>
                          </div>

                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-md transition-all duration-300 group-hover:brightness-110 ${
                              isPeak
                                ? 'bg-gradient-to-t from-red-600 to-amber-500'
                                : 'bg-gradient-to-t from-[#0F3D3E] to-teal-500'
                            }`}
                          />
                          <span className="text-[9px] text-slate-500 font-mono truncate">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PEAK WINDOW ADVISORY */}
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <span className="font-bold">{language === 'hi' ? 'पीक एडवाइजरी:' : 'Peak Advisory:'}</span> {peakAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: MONITORING (NATIONAL HERITAGE GIS MONITORING MAP)
           ========================================================= */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-serif-heritage">
                  {language === 'hi' ? 'राष्ट्रीय धरोहर जीआईएस निगरानी मानचित्र' : 'National Heritage GIS Monitoring Map'}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  {language === 'hi' ? 'संरक्षित धरोहर स्थलों का वास्तविक समय स्थानिक अवलोकन' : 'Real-time spatial overview of protected heritage sites'}
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono font-bold text-[#0F3D3E]">
                <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  {language === 'hi' ? '20 स्थल मॉनिटर' : '20 Sites Monitored'}
                </span>
                <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  {language === 'hi' ? '4 क्षेत्र' : '4 Regions'}
                </span>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl shadow-2xs flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{language === 'hi' ? 'लाइव जीआईएस नेटवर्क' : 'Live GIS Network'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* GIS MAP CANVAS */}
              <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <IndiaGisMap
                  language={language}
                  sites={sites}
                  pressureMap={pressureMap}
                  crowdMap={crowdMap}
                  selectedSite={selectedSite}
                  onSelectSite={(s) => setSelectedSiteId(s.site_id)}
                  loading={loading}
                  error={error}
                  onRetry={loadTelemetryData}
                />
              </div>

              {/* SELECTED SITE INSPECTION & TELEMETRY PANEL */}
              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                {selectedSite ? (
                  <div className="space-y-4">
                    <div>
                      {/* SITE HEADER & IMAGE */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {language === 'hi' ? 'चयनित स्मारक' : 'Selected Monument'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs ${
                            (selectedPressure?.risk || '').toUpperCase() === 'HIGH' || (selectedPressure?.risk || '').toUpperCase() === 'CRITICAL'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : (selectedPressure?.risk || '').toUpperCase() === 'MODERATE'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {language === 'hi' ? 'जोखिम:' : 'Risk:'} {selectedPressure ? selectedPressure.risk.toUpperCase() : 'LOADING...'}
                        </span>
                      </div>

                      {/* Site Thumbnail Image */}
                      <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 border border-slate-200 shadow-xs bg-slate-100">
                        <img
                          src={resolveImageUrl(selectedSite.image_url, selectedSite.site_id)}
                          alt={selectedSite.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              MONUMENT_FALLBACKS[selectedSite.site_id] || '/images/heritage-placeholder.jpg';
                          }}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3 text-white">
                          <p className="font-bold text-sm truncate">{getSiteDisplayName(selectedSite.site_id, selectedSite.name)}</p>
                          <p className="text-[10px] text-slate-200">{selectedSite.city}, {selectedSite.state}</p>
                        </div>
                      </div>
                    </div>

                    {/* TELEMETRY METRIC CARDS */}
                    <div className="space-y-2 text-xs">
                      {/* Heritage Pressure Card */}
                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <span className="text-slate-600 font-medium">{language === 'hi' ? 'धरोहर दबाव' : 'Heritage Pressure'}</span>
                        <span className="font-bold font-mono text-red-600">
                          {loading ? '...' : selectedPressure ? `${selectedPressure.pressure_score.toFixed(1)} / 100` : 'N/A'}
                        </span>
                      </div>

                      {/* Live Visitor Count (Current Hour Prediction) */}
                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <span className="text-slate-600 font-medium">{language === 'hi' ? 'वर्तमान घंटे का पूर्वानुमान' : 'Current Hour Prediction'}</span>
                        <span className="font-bold font-mono text-slate-900">
                          {loading ? '...' : `${selectedLiveVisitors.toLocaleString()} ${language === 'hi' ? 'पर्यटक' : 'visitors'}`}
                        </span>
                      </div>

                      {/* Coordinates */}
                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <span className="text-slate-600 font-medium">{language === 'hi' ? 'निर्देशांक' : 'Coordinates'}</span>
                        <span className="font-bold text-slate-800 font-mono text-[11px]">
                          {selectedSite.latitude ? `${selectedSite.latitude.toFixed(4)}° N` : '28.6562° N'}, {selectedSite.longitude ? `${selectedSite.longitude.toFixed(4)}° E` : '77.2410° E'}
                        </span>
                      </div>

                      {/* 3 COMPACT FACTOR CARDS */}
                      <div className="pt-2 grid grid-cols-3 gap-2">
                        {/* Visitor Pressure */}
                        <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-center">
                          <p className="text-[9px] uppercase font-bold text-slate-500">{language === 'hi' ? 'पर्यटक तनाव' : 'Visitor Strain'}</p>
                          <p className="text-sm font-bold font-mono text-[#0F3D3E] mt-0.5">
                            {selectedPressure?.factors ? `${selectedPressure.factors.visitor_pressure}` : '--'}
                          </p>
                        </div>

                        {/* Physical Vulnerability */}
                        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100 text-center">
                          <p className="text-[9px] uppercase font-bold text-slate-500">{language === 'hi' ? 'संवेदनशीलता' : 'Vulnerability'}</p>
                          <p className="text-sm font-bold font-mono text-amber-900 mt-0.5">
                            {selectedPressure?.factors ? `${selectedPressure.factors.physical_vulnerability}` : '--'}
                          </p>
                        </div>

                        {/* Recent Deterioration */}
                        <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-100 text-center">
                          <p className="text-[9px] uppercase font-bold text-slate-500">{language === 'hi' ? 'क्षरण' : 'Deterioration'}</p>
                          <p className="text-sm font-bold font-mono text-rose-900 mt-0.5">
                            {selectedPressure?.factors ? `${selectedPressure.factors.recent_deterioration}` : '--'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 space-y-2">
                      <button
                        onClick={() => onThrottleFootfall(selectedSite.name)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                      >
                        {language === 'hi' ? 'फुटफॉल डायवर्जन सक्रिय करें' : 'Activate Footfall Diversion'}
                      </button>

                      <button
                        onClick={() => handleNavigateTab('analytics')}
                        className="w-full py-2.5 rounded-xl bg-[#0F3D3E] hover:bg-[#0A2627] text-white font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                      >
                        {language === 'hi' ? 'संरचनात्मक स्थिति मैट्रिक्स देखें' : 'View Structural Condition Matrix'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">
                      {language === 'hi' ? 'लाइव टेलीमेट्री देखने के लिए किसी स्मारक का चयन करें।' : 'Select any monument to inspect live telemetry.'}
                    </p>
                  </div>
                )}

                {/* CITY GROUPED SITE LIST */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'hi' ? 'शहर अनुसार 20 स्थल' : '20 Sites Grouped by City'}
                  </p>
                  <div className="max-h-48 overflow-y-auto pr-1 space-y-3">
                    {Object.entries(sitesByCity).map(([city, citySites]) => (
                      <div key={city} className="space-y-1">
                        <p className="text-[10px] font-extrabold text-[#0F3D3E] uppercase tracking-wider">
                          {city} ({citySites.length})
                        </p>
                        <div className="space-y-1">
                          {citySites.map((s) => (
                            <button
                              key={s.site_id}
                              onClick={() => setSelectedSiteId(s.site_id)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                                selectedSiteId === s.site_id
                                  ? 'bg-[#0F3D3E] text-white font-bold'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <span className="truncate">{getSiteDisplayName(s.site_id, s.name)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: ANALYTICS
           ========================================================= */}
        {activeTab === 'analytics' && (
          <ConditionMatrix
            language={language}
            sites={sites}
            pressureMap={pressureMap}
            crowdMap={crowdMap}
            loading={loading}
            onThrottleFootfall={onThrottleFootfall}
            onDispatchTeam={onDispatchTeam}
          />
        )}
      </div>
    </div>
  );
};