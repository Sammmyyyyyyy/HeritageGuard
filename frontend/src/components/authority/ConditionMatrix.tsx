import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  RefreshCw,
  AlertTriangle,
  Shield,
  Activity
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
  getCurrentHourPredictedVisitors,
  fetchAllSitesTelemetry
} from '../../api/authority';

import { MONUMENT_FALLBACKS } from '../../assets/monumentImages';
import { CrowdPredictionResponse } from '../../api/crowd';
import { SITE_METADATA } from '../../data/siteMapper';

interface ConditionMatrixProps {
  language: 'en' | 'hi';
  sites?: BackendSite[];
  pressureMap?: Record<string, PressureResponse>;
  crowdMap?: Record<string, CrowdPredictionResponse>;
  loading?: boolean;
  onInspectSite?: (siteId: string) => void;
  onThrottleFootfall: (monumentName: string) => void;
  onDispatchTeam?: (monumentName: string, actionType: string) => void;
}

interface SiteTelemetryRow {
  site: BackendSite;
  pressure: PressureResponse | null;
  crowd: CrowdPredictionResponse | null;
  condition: 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'STABLE';
  crowdLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'PEAK';
  liveVisitors: number;
}

export const ConditionMatrix: React.FC<ConditionMatrixProps> = ({
  language,
  sites: propSites,
  pressureMap: propPressureMap,
  crowdMap: propCrowdMap,
  loading: propLoading,
  onThrottleFootfall,
  onDispatchTeam
}) => {
  const [sites, setSites] = useState<BackendSite[]>(propSites || []);
  const [pressureMap, setPressureMap] = useState<Record<string, PressureResponse>>(propPressureMap || {});
  const [crowdMap, setCrowdMap] = useState<Record<string, CrowdPredictionResponse>>(propCrowdMap || {});
  const [loading, setLoading] = useState<boolean>(propLoading !== undefined ? propLoading : !propSites?.length);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');

  // Sync state when props change
  useEffect(() => {
    if (propSites && propSites.length > 0) {
      setSites(propSites);
    }
    if (propPressureMap) {
      setPressureMap(propPressureMap);
    }
    if (propCrowdMap) {
      setCrowdMap(propCrowdMap);
    }
    if (propLoading !== undefined) {
      setLoading(propLoading);
    }
  }, [propSites, propPressureMap, propCrowdMap, propLoading]);

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchAllSitesTelemetry(undefined, forceRefresh);
      setSites(res.sites);
      setPressureMap(res.pressureMap);
      setCrowdMap(res.crowdMap);
    } catch (err: any) {
      console.error('Failed to load condition matrix data:', err);
      setError('Unable to load site condition telemetry from backend.');
    } finally {
      setLoading(false);
    }
  };

  // Only run standalone load if no props were passed in
  useEffect(() => {
    if (!propSites || propSites.length === 0) {
      loadData();
    }
  }, []);

  const tableData: SiteTelemetryRow[] = useMemo(() => {
    return sites.map((site) => {
      const pressure = pressureMap[site.site_id] || null;
      const crowd = crowdMap[site.site_id] || null;
      const condition = calculateConditionStatus(pressure);
      const crowdLevel = calculateCrowdLevel(crowd);
      const liveVisitors = getCurrentHourPredictedVisitors(crowd);

      return {
        site,
        pressure,
        crowd,
        condition,
        crowdLevel,
        liveVisitors
      };
    });
  }, [sites, pressureMap, crowdMap]);

  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        row.site.name.toLowerCase().includes(q) ||
        row.site.city.toLowerCase().includes(q) ||
        row.site.site_id.toLowerCase().includes(q);

      const matchesCity =
        cityFilter === 'ALL' ||
        row.site.city.toUpperCase() === cityFilter.toUpperCase();

      const matchesCondition =
        conditionFilter === 'ALL' || row.condition === conditionFilter;

      return matchesSearch && matchesCity && matchesCondition;
    });
  }, [tableData, searchQuery, cityFilter, conditionFilter]);

  const handleExportCSV = () => {
    const headers = [
      'Site ID',
      'Name',
      'City',
      'Condition Status',
      'Pressure Score',
      'Crowd Level',
      'Current Hour Visitors',
      'Safe Capacity'
    ];

    const rows = filteredData.map((d) => [
      d.site.site_id,
      `"${d.site.name}"`,
      `"${d.site.city}"`,
      d.condition,
      d.pressure ? d.pressure.pressure_score : 'N/A',
      d.crowdLevel,
      d.liveVisitors,
      d.crowd ? d.crowd.safe_capacity : 'N/A'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `heritage_condition_matrix_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getConditionBadgeStyle = (status: 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'STABLE') => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300 ring-red-200';
      case 'SEVERE':
        return 'bg-amber-100 text-amber-900 border-amber-300 ring-amber-200';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300 ring-yellow-200';
      case 'STABLE':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-emerald-200';
    }
  };

  const getSiteDisplayName = (siteId: string, defaultName: string) => {
    if (language === 'hi' && SITE_METADATA[siteId]?.hindiName) {
      return SITE_METADATA[siteId].hindiName;
    }
    return defaultName;
  };

  const getConditionLabel = (cond: 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'STABLE') => {
    if (language === 'hi') {
      switch (cond) {
        case 'CRITICAL': return 'गंभीर';
        case 'SEVERE': return 'अति-संवेदनशील';
        case 'MODERATE': return 'मध्यम';
        case 'STABLE': return 'स्थिर';
      }
    }
    return cond;
  };

  const getCrowdLabel = (lvl: 'LOW' | 'MODERATE' | 'HIGH' | 'PEAK') => {
    if (language === 'hi') {
      switch (lvl) {
        case 'LOW': return 'कम';
        case 'MODERATE': return 'मध्यम';
        case 'HIGH': return 'उच्च';
        case 'PEAK': return 'चरम';
      }
    }
    return lvl;
  };

  const getCrowdBadgeStyle = (level: 'LOW' | 'MODERATE' | 'HIGH' | 'PEAK') => {
    switch (level) {
      case 'PEAK':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'HIGH':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'MODERATE':
        return 'bg-[#FFFBEB] text-[#92400E] border-amber-300';
      case 'LOW':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-900 text-[10px] font-bold tracking-wider uppercase mb-1 border border-purple-200">
            <Activity className="w-3 h-3 text-purple-600" />
            <span>{language === 'hi' ? 'एएसआई टेलीमेट्री मैट्रिक्स' : 'ASI TELEMETRY MATRIX'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-serif-heritage">
            {language === 'hi' ? 'संरचनात्मक स्थिति और फुटफॉल विश्लेषण' : 'Structural Condition & Footfall Analytics'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {language === 'hi'
              ? 'सभी 20 पंजीकृत स्मारकों पर वास्तविक समय जोखिम स्कोरिंग, संरचनात्मक क्षरण स्थिति और भीड़ दबाव मेट्रिक्स।'
              : 'Real-time backend risk scoring, structural deterioration status, and crowd pressure metrics across all 20 registered monuments.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>{language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={loading || filteredData.length === 0}
            className="px-4 py-2 rounded-xl bg-[#0F3D3E] hover:bg-[#0A2627] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{language === 'hi' ? 'सीएसवी निर्यात करें' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'स्मारक या शहर खोजें...' : 'Search monument or city...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* City Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <span className="text-[10px] font-bold uppercase text-slate-500 px-2">
              {language === 'hi' ? 'शहर:' : 'City:'}
            </span>
            {[
              { key: 'ALL', label: language === 'hi' ? 'सभी' : 'ALL' },
              { key: 'DELHI', label: language === 'hi' ? 'दिल्ली' : 'DELHI' },
              { key: 'JAIPUR', label: language === 'hi' ? 'जयपुर' : 'JAIPUR' },
              { key: 'MUMBAI', label: language === 'hi' ? 'मुंबई' : 'MUMBAI' },
              { key: 'PRAYAGRAJ', label: language === 'hi' ? 'प्रयागराज' : 'PRAYAGRAJ' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCityFilter(key)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cityFilter === key
                    ? 'bg-[#0F3D3E] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Condition Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <span className="text-[10px] font-bold uppercase text-slate-500 px-2">
              {language === 'hi' ? 'स्थिति:' : 'Condition:'}
            </span>
            {[
              { key: 'ALL', label: language === 'hi' ? 'सभी' : 'ALL' },
              { key: 'CRITICAL', label: language === 'hi' ? 'गंभीर' : 'CRITICAL' },
              { key: 'SEVERE', label: language === 'hi' ? 'अति-संवेदनशील' : 'SEVERE' },
              { key: 'MODERATE', label: language === 'hi' ? 'मध्यम' : 'MODERATE' },
              { key: 'STABLE', label: language === 'hi' ? 'स्थिर' : 'STABLE' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setConditionFilter(key)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  conditionFilter === key
                    ? 'bg-[#0F3D3E] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData(true)}
            className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-all cursor-pointer"
          >
            {language === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
          </button>
        </div>
      )}

      {/* Main Content Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">{language === 'hi' ? 'स्मारक' : 'Monument'}</th>
                <th className="py-3.5 px-4">{language === 'hi' ? 'स्थान' : 'Location'}</th>
                <th className="py-3.5 px-4">{language === 'hi' ? 'संरचनात्मक स्थिति' : 'Condition Status'}</th>
                <th className="py-3.5 px-4">{language === 'hi' ? 'धरोहर दबाव' : 'Heritage Pressure'}</th>
                <th className="py-3.5 px-4">{language === 'hi' ? 'भीड़ घनत्व' : 'Crowd Density'}</th>
                <th className="py-3.5 px-4">{language === 'hi' ? 'वर्तमान फुटफॉल' : 'Current Footfall'}</th>
                <th className="py-3.5 px-4 text-right">{language === 'hi' ? 'कार्रवाई' : 'Actions'}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                /* SKELETON LOADERS */
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0" />
                        <div className="space-y-1.5">
                          <div className="w-28 h-3.5 bg-slate-200 rounded" />
                          <div className="w-16 h-2.5 bg-slate-200 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-20 h-3 bg-slate-200 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-20 h-6 bg-slate-200 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-16 h-3 bg-slate-200 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-16 h-5 bg-slate-200 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-20 h-3 bg-slate-200 rounded" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <div className="w-16 h-7 bg-slate-200 rounded-lg" />
                        <div className="w-20 h-7 bg-slate-200 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                /* EMPTY STATE */
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Shield className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">
                      {language === 'hi' ? 'आपके मानदंडों से मेल खाने वाला कोई डेटा उपलब्ध नहीं है' : 'No data available matching your criteria'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {language === 'hi' ? 'खोज क्वेरी या शहर फ़िल्टर रीसेट करने का प्रयास करें।' : 'Try resetting search query or city filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                /* REAL DATA ROWS */
                filteredData.map((row) => {
                  const resolvedImg = resolveImageUrl(row.site.image_url, row.site.site_id);
                  const displayName = getSiteDisplayName(row.site.site_id, row.site.name);

                  return (
                    <tr
                      key={row.site.site_id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Monument */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={resolvedImg}
                            alt={row.site.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                MONUMENT_FALLBACKS[row.site.site_id] ||
                                '/images/heritage-placeholder.jpg';
                            }}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-100"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">
                              {displayName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{row.site.city}</p>
                        <p className="text-[10px] text-slate-500">{row.site.state}</p>
                      </td>

                      {/* Condition Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getConditionBadgeStyle(
                            row.condition
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{getConditionLabel(row.condition)}</span>
                        </span>
                      </td>

                      {/* Heritage Pressure */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {row.pressure ? (
                          <span
                            className={
                              row.pressure.pressure_score >= 70
                                ? 'text-red-600'
                                : row.pressure.pressure_score >= 50
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }
                          >
                            {row.pressure.pressure_score.toFixed(1)} / 100
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal italic">
                            {language === 'hi' ? 'लोड करने में असमर्थ' : 'Unable to load'}
                          </span>
                        )}
                      </td>

                      {/* Crowd Density */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getCrowdBadgeStyle(
                            row.crowdLevel
                          )}`}
                        >
                          {getCrowdLabel(row.crowdLevel)}
                        </span>
                      </td>

                      {/* Current Footfall */}
                      <td className="py-3.5 px-4 font-mono">
                        <p className="font-bold text-slate-900">
                          {row.liveVisitors.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{language === 'hi' ? 'पर्यटक' : 'visitors'}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {language === 'hi' ? 'क्षमता:' : 'Cap:'} {row.crowd?.safe_capacity ? row.crowd.safe_capacity.toLocaleString() : 'N/A'}
                        </p>
                      </td>

                      {/* Actions (Responsive wrap, Dispatch never hidden) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => onThrottleFootfall(row.site.name)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            {language === 'hi' ? 'प्रवाह डायवर्ट करें' : 'Divert Flow'}
                          </button>

                          {onDispatchTeam && (
                            <button
                              onClick={() => onDispatchTeam(row.site.name, 'Field Structural Inspection')}
                              className="px-3 py-1.5 rounded-lg bg-[#0F3D3E] hover:bg-[#0A2627] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap"
                            >
                              {language === 'hi' ? 'टीम प्रेषित करें' : 'Dispatch'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
