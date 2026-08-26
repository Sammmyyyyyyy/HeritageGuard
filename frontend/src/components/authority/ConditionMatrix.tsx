import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { MONUMENTS_DATA } from '../../data/monumentsData';
import { Monument } from '../../types/heritage';

interface ConditionMatrixProps {
  language: 'en' | 'hi';
  onInspectSite: (siteId: string) => void;
  onThrottleFootfall: (monumentName: string) => void;
}

export const ConditionMatrix: React.FC<ConditionMatrixProps> = ({
  language,
  onInspectSite,
  onThrottleFootfall
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'hps' | 'damage' | 'footfall'>('hps');

  const filteredList = useMemo(() => {
    return MONUMENTS_DATA.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.state.toLowerCase().includes(searchTerm.toLowerCase());
      const matchState = selectedState === 'All' || m.state === selectedState;
      const matchStatus = selectedStatus === 'All' || m.deteriorationStatus === selectedStatus;
      return matchSearch && matchState && matchStatus;
    }).sort((a, b) => {
      if (sortBy === 'hps') return b.heritagePressureScore - a.heritagePressureScore;
      if (sortBy === 'damage') return b.damageScore - a.damageScore;
      if (sortBy === 'footfall') return (b.liveFootfall / b.maxCapacity) - (a.liveFootfall / a.maxCapacity);
      return 0;
    });
  }, [searchTerm, selectedState, selectedStatus, sortBy]);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Monument,State,HeritagePressureScore,DamageScore,LiveFootfall,MaxCapacity,Status\n"
      + filteredList.map(e => `"${e.name}","${e.state}",${e.heritagePressureScore},${e.damageScore},${e.liveFootfall},${e.maxCapacity},"${e.deteriorationStatus}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ASI_Heritage_Pressure_Matrix_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-serif-heritage">
              Monument Condition & Heritage Pressure Matrix
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Surveillance index combining real-time crowd saturation, sensor telemetry, and structural decay.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-[#0F3D3E] hover:bg-[#0A2627] text-white font-bold text-xs rounded-xl shadow-sm border border-white/20 flex items-center space-x-2 shrink-0 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
          <span>Export ASI Matrix (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by monument or state..."
            className="w-full pl-9 pr-3 py-2 bg-[#F4F6F9] border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0F3D3E]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-gray-500 font-semibold">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-[#F4F6F9] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="All">All States</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Delhi">Delhi</option>
              <option value="Odisha">Odisha</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-gray-500 font-semibold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F4F6F9] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="hps">Heritage Pressure (HPS)</option>
              <option value="damage">Damage Score</option>
              <option value="footfall">Footfall Saturation</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Condition Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F3D3E] text-white uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Monument Name</th>
                <th className="px-4 py-3.5">State / Era</th>
                <th className="px-4 py-3.5 text-center">Heritage Pressure (HPS)</th>
                <th className="px-4 py-3.5 text-center">Damage Score</th>
                <th className="px-4 py-3.5 text-center">Live Footfall / Cap</th>
                <th className="px-4 py-3.5">Condition Status</th>
                <th className="px-4 py-3.5">Structural Sensor Feed</th>
                <th className="px-5 py-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredList.map((m) => {
                const footfallPct = Math.round((m.liveFootfall / m.maxCapacity) * 100);
                const isOvercrowded = footfallPct > 100;

                return (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Monument Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={m.imageUrl}
                          alt={m.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#0F3D3E] text-xs sm:text-sm font-serif-heritage leading-snug">{m.name}</p>
                          <p className="text-[10px] text-gray-500 font-normal">{m.city}</p>
                        </div>
                      </div>
                    </td>

                    {/* State / Era */}
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-800">{m.state}</span>
                      <p className="text-[10px] text-gray-500 font-normal">{m.architecturalStyle}</p>
                    </td>

                    {/* Heritage Pressure Score */}
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full font-mono-stat font-bold text-xs ${
                        m.heritagePressureScore > 75
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : m.heritagePressureScore > 50
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {m.heritagePressureScore}/100
                      </span>
                    </td>

                    {/* Damage Score */}
                    <td className="px-4 py-4 text-center">
                      <span className="font-mono-stat font-bold text-slate-900">
                        {m.damageScore}%
                      </span>
                    </td>

                    {/* Live Footfall Saturation */}
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`font-mono-stat font-bold ${isOvercrowded ? 'text-red-600' : 'text-emerald-700'}`}>
                          {m.liveFootfall.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          ({footfallPct}% capacity)
                        </span>
                      </div>
                    </td>

                    {/* Condition Status */}
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        m.deteriorationStatus.includes('Critical') || m.deteriorationStatus.includes('Severe')
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : m.deteriorationStatus.includes('Moderate')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {m.deteriorationStatus}
                      </span>
                    </td>

                    {/* Sensor Telemetry */}
                    <td className="px-4 py-4">
                      {m.structuralSensors ? (
                        <div className="text-[10px] text-gray-600 space-y-0.5 font-mono-stat">
                          <p>⚡ {m.structuralSensors.crackExpansionRate}</p>
                          <p>💧 {m.structuralSensors.moistureIndex}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-normal">Normal range</span>
                      )}
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onInspectSite(m.id)}
                          className="px-2.5 py-1 bg-[#0F3D3E] text-white hover:bg-[#0A2627] rounded-lg text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                          title="Open AI Damage Inspector"
                        >
                          Inspect Scans
                        </button>
                        {isOvercrowded && (
                          <button
                            onClick={() => onThrottleFootfall(m.name)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            title="Throttle Ticketing / Divert Tourists"
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

    </div>
  );
};
