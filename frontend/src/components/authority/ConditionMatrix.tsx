import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  ShieldAlert,
  Eye,
  RefreshCw,
} from 'lucide-react';

import {
  getSites,
  getPressure,
  getCrowd,
  BackendSite,
} from '../../api/sites';

import { MONUMENT_FALLBACKS } from '../../assets/monumentImages';

interface ConditionMatrixProps {
  language: 'en' | 'hi';
  onInspectSite: (siteId: string) => void;
  onThrottleFootfall: (monumentName: string) => void;
}

type Telemetry = {
  pressure: any | null;
  crowd: any | null;
};

const normalize = (value: unknown) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const IMAGE_KEY_BY_NAME: Record<string, string> = {
  redfort: 'DEL001',
  qutubminar: 'DEL002',
  indiagate: 'DEL003',
  humayunstomb: 'DEL004',
  lotustemple: 'DEL005',

  amerfort: 'JAI001',
  hawamahal: 'JAI002',
  citypalace: 'JAI003',
  jantarmantar: 'JAI004',
  alberthallmuseum: 'JAI005',

  gatewayofindia: 'BOM001',
  elephantacaves: 'BOM002',
  chhatrapatishivajimaharajterminus: 'BOM003',
  hajialidargah: 'BOM004',
  siddhivinayaktemple: 'BOM005',

  trivenisangam: 'PRA001',
  allahabadfort: 'PRA002',
  khusrobagh: 'PRA003',
  anandbhavan: 'PRA004',
  chandrashekharazadpark: 'PRA005',
};

const getImageForSite = (site: BackendSite) => {
  return (
    MONUMENT_FALLBACKS[site.site_id] ??
    MONUMENT_FALLBACKS[IMAGE_KEY_BY_NAME[normalize(site.name)]] ??
    ''
  );
};

const getPressureScore = (pressure: any): number | null => {
  if (!pressure) return null;

  const candidates = [
    pressure.score,
    pressure.pressure_score,
    pressure.heritage_pressure_score,
    pressure.hps,
    pressure.value,
  ];

  for (const value of candidates) {
    const number = Number(value);
    if (Number.isFinite(number)) {
      return Math.round(Math.max(0, Math.min(100, number)));
    }
  }

  return null;
};

const getCrowdLabel = (crowd: any): string | null => {
  if (!crowd) return null;

  const candidates = [
    crowd.expected_crowd,
    crowd.expectedCrowd,
    crowd.crowd_level,
    crowd.crowdLevel,
    crowd.level,
    crowd.risk,
  ];

  const value = candidates.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== ''
  );

  return value ? String(value) : null;
};

const getCrowdCount = (crowd: any): number | null => {
  if (!crowd) return null;

  const candidates = [
    crowd.live_footfall,
    crowd.liveFootfall,
    crowd.current_footfall,
    crowd.currentFootfall,
    crowd.visitor_count,
    crowd.visitorCount,
    crowd.count,
  ];

  for (const value of candidates) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }

  return null;
};

const getCapacity = (crowd: any): number | null => {
  if (!crowd) return null;

  const candidates = [
    crowd.max_capacity,
    crowd.maxCapacity,
    crowd.capacity,
  ];

  for (const value of candidates) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }

  return null;
};

const getCondition = (pressure: any, crowd: any): string => {
  const explicit =
    pressure?.condition_status ??
    pressure?.conditionStatus ??
    pressure?.status;

  if (explicit) return String(explicit);

  const score = getPressureScore(pressure);

  if (score !== null) {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Moderate';
    return 'Good';
  }

  const crowdLabel = getCrowdLabel(crowd);

  if (crowdLabel) {
    const value = crowdLabel.toLowerCase();
    if (value.includes('high')) return 'High Crowd';
    if (value.includes('moderate') || value.includes('medium')) {
      return 'Moderate Crowd';
    }
  }

  return 'Unavailable';
};

const riskClass = (score: number | null) => {
  if (score === null) {
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  if (score >= 75) {
    return 'bg-red-100 text-red-800 border border-red-300';
  }

  if (score >= 50) {
    return 'bg-amber-100 text-amber-800 border border-amber-300';
  }

  return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
};

export const ConditionMatrix: React.FC<ConditionMatrixProps> = ({
  onInspectSite,
  onThrottleFootfall,
}) => {
  const [sites, setSites] = useState<BackendSite[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, Telemetry>>({});
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [sortBy, setSortBy] = useState<'pressure' | 'crowd'>('pressure');

  const loadAnalytics = async () => {
    try {
      setLoadingSites(true);
      setError(null);

      const backendSites = await getSites();

      console.log('ANALYTICS - BACKEND SITES:', backendSites);

      setSites(backendSites);
      setLoadingSites(false);

      setLoadingTelemetry(true);

      const results = await Promise.all(
        backendSites.map(async (site) => {
          try {
            const [pressure, crowd] = await Promise.all([
              getPressure(site.site_id),
              getCrowd(site.site_id),
            ]);

            console.log(
              `ANALYTICS - ${site.site_id} PRESSURE:`,
              pressure
            );

            console.log(
              `ANALYTICS - ${site.site_id} CROWD:`,
              crowd
            );

            return [
              site.site_id,
              { pressure, crowd },
            ] as const;
          } catch (siteError) {
            console.error(
              `ANALYTICS - TELEMETRY FAILED FOR ${site.site_id}:`,
              siteError
            );

            return [
              site.site_id,
              { pressure: null, crowd: null },
            ] as const;
          }
        })
      );

      setTelemetry(Object.fromEntries(results));
    } catch (err: any) {
      console.error('ANALYTICS - LOAD FAILED:', err);
      setError(err?.message || 'Unable to load analytics data.');
      setSites([]);
      setTelemetry({});
    } finally {
      setLoadingSites(false);
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const filteredSites = useMemo(() => {
    const filtered = sites.filter((site) => {
      const q = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !q ||
        site.name.toLowerCase().includes(q) ||
        site.city.toLowerCase().includes(q) ||
        site.state.toLowerCase().includes(q) ||
        site.site_id.toLowerCase().includes(q);

      const matchesState =
        selectedState === 'All' || site.state === selectedState;

      return matchesSearch && matchesState;
    });

    return filtered.sort((a, b) => {
      const aTelemetry = telemetry[a.site_id];
      const bTelemetry = telemetry[b.site_id];

      if (sortBy === 'pressure') {
        return (
          (getPressureScore(bTelemetry?.pressure) ?? -1) -
          (getPressureScore(aTelemetry?.pressure) ?? -1)
        );
      }

      return (
        (getCrowdCount(bTelemetry?.crowd) ?? -1) -
        (getCrowdCount(aTelemetry?.crowd) ?? -1)
      );
    });
  }, [sites, telemetry, searchTerm, selectedState, sortBy]);

  const handleExportCSV = () => {
    const rows = filteredSites.map((site) => {
      const data = telemetry[site.site_id];
      const pressure = getPressureScore(data?.pressure);
      const crowd = getCrowdLabel(data?.crowd);
      const footfall = getCrowdCount(data?.crowd);

      return [
        site.site_id,
        `"${site.name.replace(/"/g, '""')}"`,
        `"${site.city.replace(/"/g, '""')}"`,
        `"${site.state.replace(/"/g, '""')}"`,
        pressure ?? '',
        `"${crowd ?? ''}"`,
        footfall ?? '',
      ].join(',');
    });

    const csv = [
      'Site ID,Monument,City,State,Heritage Pressure,Crowd Level,Live Footfall',
      ...rows,
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'HeritageGuard_Analytics.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-serif-heritage">
              Monument Condition & Heritage Pressure Matrix
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Live analytics from the configured HeritageGuard backend sites.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAnalytics}
            disabled={loadingSites || loadingTelemetry}
            className="px-3 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-[#0F3D3E] border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#0F3D3E] hover:bg-[#0A2627] text-white font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search monument, city or site ID..."
            className="w-full pl-9 pr-3 py-2.5 bg-[#F4F6F9] border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0F3D3E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#F4F6F9] border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
          >
            <option value="All">All States</option>

            {Array.from(
              new Set(sites.map((site) => site.state))
            ).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as 'pressure' | 'crowd'
              )
            }
            className="bg-[#F4F6F9] border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
          >
            <option value="pressure">
              Heritage Pressure
            </option>
            <option value="crowd">
              Live Crowd
            </option>
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loadingSites && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          Loading backend sites...
        </div>
      )}

      {/* TABLE */}
      {!loadingSites && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs">

              <thead className="bg-[#0F3D3E] text-white uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Monument</th>
                  <th className="px-4 py-3.5">State / Era</th>
                  <th className="px-4 py-3.5 text-center">
                    Heritage Pressure
                  </th>
                  <th className="px-4 py-3.5 text-center">
                    Crowd Level
                  </th>
                  <th className="px-4 py-3.5 text-center">
                    Live Footfall
                  </th>
                  <th className="px-4 py-3.5">
                    Condition
                  </th>
                  <th className="px-5 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredSites.map((site) => {
                  const data = telemetry[site.site_id];

                  const pressureScore =
                    getPressureScore(data?.pressure);

                  const crowdLabel =
                    getCrowdLabel(data?.crowd);

                  const footfall =
                    getCrowdCount(data?.crowd);

                  const capacity =
                    getCapacity(data?.crowd);

                  const footfallPct =
                    footfall !== null &&
                    capacity !== null &&
                    capacity > 0
                      ? Math.round(
                          (footfall / capacity) * 100
                        )
                      : null;

                  const condition =
                    getCondition(
                      data?.pressure,
                      data?.crowd
                    );

                  const isOvercrowded =
                    footfallPct !== null &&
                    footfallPct > 100;

                  const imageSrc =
                    getImageForSite(site);

                  return (
                    <tr
                      key={site.site_id}
                      className="hover:bg-slate-50 transition-colors"
                    >

                      {/* MONUMENT */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">

                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={site.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ShieldAlert className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-bold text-[#0F3D3E] text-xs sm:text-sm font-serif-heritage leading-snug">
                              {site.name}
                            </p>

                            <p className="text-[10px] text-gray-500">
                              {site.city}
                            </p>

                            <p className="text-[9px] text-slate-400 font-mono">
                              {site.site_id}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* STATE */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-800">
                          {site.state}
                        </span>

                        <p className="text-[10px] text-gray-500">
                          {site.name}
                        </p>
                      </td>

                      {/* PRESSURE */}
                      <td className="px-4 py-4 text-center">

                        {loadingTelemetry &&
                        !data ? (
                          <span className="text-[10px] text-slate-400">
                            Loading...
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-mono font-bold text-xs ${riskClass(
                              pressureScore
                            )}`}
                          >
                            {pressureScore !== null
                              ? `${pressureScore}/100`
                              : 'Unavailable'}
                          </span>
                        )}

                      </td>

                      {/* CROWD */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">

                          <span className="font-semibold text-slate-800">
                            {crowdLabel ?? 'Unavailable'}
                          </span>

                          {footfallPct !== null && (
                            <span
                              className={`text-[10px] font-mono ${
                                isOvercrowded
                                  ? 'text-red-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {footfallPct}% capacity
                            </span>
                          )}

                        </div>
                      </td>

                      {/* FOOTFALL */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-mono font-bold text-slate-900">
                          {footfall !== null
                            ? footfall.toLocaleString()
                            : '—'}
                        </span>
                      </td>

                      {/* CONDITION */}
                      <td className="px-4 py-4">

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {condition}
                        </span>

                      </td>

                      {/* ACTION */}
                      <td className="px-5 py-4 text-right">

                        <div className="flex items-center justify-end gap-1.5">

                          <button
                            onClick={() =>
                              onInspectSite(site.site_id)
                            }
                            className="px-2.5 py-1 bg-[#0F3D3E] text-white hover:bg-[#0A2627] rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Inspect
                          </button>

                          {isOvercrowded && (
                            <button
                              onClick={() =>
                                onThrottleFootfall(
                                  site.name
                                )
                              }
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Cap Entry
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loadingSites && filteredSites.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          No backend site matches your search.
        </div>
      )}
    </div>
  );
};

export default ConditionMatrix;
