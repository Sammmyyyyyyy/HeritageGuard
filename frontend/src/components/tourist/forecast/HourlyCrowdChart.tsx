import React, { useState } from 'react';
import { HourlyForecastItem } from '../../../types/heritage';
import { TrendingUp, Clock, Info, Users, Sparkles } from 'lucide-react';

interface HourlyCrowdChartProps {
  hourlyData: HourlyForecastItem[];
  isToday: boolean;
  safeCapacity: number;
  language: 'en' | 'hi';
}

export const HourlyCrowdChart: React.FC<HourlyCrowdChartProps> = ({
  hourlyData,
  isToday,
  safeCapacity,
  language
}) => {
  const [activeHoverItem, setActiveHoverItem] = useState<HourlyForecastItem | null>(null);

  // Maximum visitors for relative height calculation
  const maxVal = Math.max(...hourlyData.map((d) => d.visitors), 1000);

  return (
    <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#0D3B2E]/12 shadow-sm space-y-6">
      
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#0D3B2E] text-white flex items-center justify-center text-xs font-bold">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0D3B2E] font-serif-heritage leading-tight">
                {language === 'hi' ? 'घंटेवार भीड़ पूर्वानुमान' : 'Hourly Crowd Forecast'}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {language === 'hi'
                  ? 'दिन भर में प्रति घंटे अनुमानित आगंतुक व क्षमता प्रतिशत'
                  : 'Predicted concurrent footfall & carrying capacity throughout the day'}
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <div className="flex items-center space-x-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-emerald-900">Low (&lt; 40%)</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-amber-900">Moderate (40–75%)</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
            <span className="text-red-900">Peak (&gt; 75%)</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Grid */}
      <div className="space-y-3">
        
        {/* Active Inspection Tooltip Banner (Sticky on Mobile & Desktop) */}
        <div className="min-h-[46px] p-3 rounded-2xl bg-[#0D3B2E]/5 border border-[#0D3B2E]/15 flex items-center justify-between text-xs transition-all">
          {activeHoverItem ? (
            <div className="flex flex-wrap items-center justify-between w-full gap-2 animate-fadeIn">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#C85A32]" />
                <span className="font-bold text-[#0D3B2E] text-sm font-mono-stat">{activeHoverItem.hour}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeHoverItem.crowdLevel === 'Low'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeHoverItem.crowdLevel === 'Moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {activeHoverItem.crowdLevel.toUpperCase()}
                </span>
                {activeHoverItem.isNow && (
                  <span className="bg-[#D4AF37] text-[#08281E] px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                    CURRENT TIME
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs font-semibold">
                <span className="text-[#0D3B2E] font-mono-stat">
                  {activeHoverItem.visitors.toLocaleString()} visitors
                </span>
                <span className="text-gray-400">|</span>
                <span className={`font-mono-stat ${
                  activeHoverItem.capacityPercentage > 85 ? 'text-red-700 font-bold' : 'text-gray-700'
                }`}>
                  {activeHoverItem.capacityPercentage}% of safe hourly capacity
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500 text-xs">
              <Info className="w-4 h-4 text-gray-400" />
              <span>Hover or tap any hourly bar below to view precise visitor numbers and capacity percentage.</span>
            </div>
          )}
        </div>

        {/* The Bars Visual Canvas */}
        <div className="relative pt-2 pb-2">
          {/* Scroll hint for 24-hour / long operating schedules */}
          {hourlyData.length > 12 && (
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium pb-2 px-1">
              <span className="flex items-center space-x-1 text-[#C85A32]">
                <Clock className="w-3.5 h-3.5" />
                <span>Full 24-Hour Continuous Timeline ({hourlyData.length} time slots)</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                ← Scroll horizontally to inspect all hours →
              </span>
            </div>
          )}

          {/* 80% Threshold Baseline Line */}
          <div className="absolute top-14 left-0 right-0 border-b border-dashed border-red-300 pointer-events-none z-0 flex items-center justify-end pr-2">
            <span className="text-[10px] font-mono font-bold text-red-600 bg-white px-1.5 py-0.5 rounded border border-red-200 shadow-2xs">
              Safe Capacity Threshold (80%)
            </span>
          </div>

          {/* Horizontally expandable / scrollable bar track */}
          <div className="overflow-x-auto pb-3 pt-6 relative z-10 scrollbar-thin scrollbar-thumb-[#0D3B2E]/25 scrollbar-track-gray-100 rounded-xl px-1">
            <div className="flex items-end gap-2 sm:gap-2.5 min-w-full h-64">
              {hourlyData.map((item, index) => {
                const heightPercent = Math.max(16, Math.min(100, (item.visitors / maxVal) * 100));
                const isHovered = activeHoverItem?.hour === item.hour;

                // Bar gradient matching state
                let barGradient = 'from-emerald-600 to-emerald-400';
                if (item.crowdLevel === 'Overcrowded' || item.crowdLevel === 'High') {
                  barGradient = 'from-red-600 to-amber-500';
                } else if (item.crowdLevel === 'Moderate') {
                  barGradient = 'from-amber-500 to-amber-300';
                }

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setActiveHoverItem(item)}
                    onTouchStart={() => setActiveHoverItem(item)}
                    onClick={() => setActiveHoverItem(item)}
                    className="flex-1 min-w-[56px] sm:min-w-[64px] max-w-[90px] flex flex-col items-center h-full justify-end group cursor-pointer shrink-0"
                  >
                    {/* Status badge above bar */}
                    <div className="min-h-[22px] flex items-center justify-center mb-1">
                      {item.isNow ? (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-[#0D3B2E] text-[#D4AF37] px-1.5 py-0.5 rounded-full shadow-xs ring-1 ring-[#D4AF37]/50 animate-pulse whitespace-nowrap">
                          NOW
                        </span>
                      ) : item.capacityPercentage > 75 ? (
                        <span className="text-[8px] font-bold text-red-700 bg-red-100 px-1 py-0.2 rounded whitespace-nowrap">
                          Peak
                        </span>
                      ) : (
                        <span className="text-[8.5px] font-mono text-gray-500 font-semibold opacity-80 group-hover:opacity-100 whitespace-nowrap">
                          {item.capacityPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Bar Box */}
                    <div className="w-full bg-[#F8F6F0] rounded-xl flex flex-col justify-end p-1 relative overflow-hidden border border-[#0D3B2E]/10 h-36 transition-all duration-200 group-hover:border-[#0D3B2E] group-hover:shadow-md">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-lg bg-gradient-to-t ${barGradient} transition-all duration-300 relative flex flex-col justify-between items-center py-1 ${
                          isHovered ? 'brightness-110 scale-[1.02]' : 'opacity-90'
                        }`}
                      >
                        {/* Numerical label printed on/above bar fill */}
                        <span className="text-[9px] font-mono font-black text-white drop-shadow-sm px-0.5 text-center leading-none">
                          {item.visitors >= 1000 ? `${(item.visitors / 1000).toFixed(1)}k` : item.visitors}
                        </span>
                      </div>
                    </div>

                    {/* Time Label & Exact Visitors Count */}
                    <div className="flex flex-col items-center mt-1.5">
                      <span className={`text-[10px] font-mono-stat font-bold transition-colors whitespace-nowrap ${
                        item.isNow
                          ? 'text-[#0D3B2E] font-black scale-105'
                          : isHovered
                          ? 'text-[#C85A32]'
                          : 'text-gray-700'
                      }`}>
                        {item.hour}
                      </span>
                      <span className="text-[9.5px] font-mono text-[#0D3B2E]/80 font-bold whitespace-nowrap">
                        {item.visitors.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
