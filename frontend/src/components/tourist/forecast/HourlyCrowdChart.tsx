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
        <div className="relative pt-6 pb-2">
          {/* 80% Threshold Baseline Line */}
          <div className="absolute top-12 left-0 right-0 border-b border-dashed border-red-300 pointer-events-none z-0 flex items-center justify-end pr-2">
            <span className="text-[10px] font-mono font-bold text-red-600 bg-white px-1.5 py-0.5 rounded border border-red-200">
              Safe Capacity Threshold (80%)
            </span>
          </div>

          {/* Bar Columns */}
          <div className="grid grid-cols-7 sm:grid-cols-13 gap-1.5 sm:gap-2 items-end h-56 pt-8 pb-1 relative z-10">
            {hourlyData.map((item, index) => {
              const heightPercent = Math.max(14, Math.min(100, (item.visitors / maxVal) * 100));
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
                  className="flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Tooltip / NOW badge above bar */}
                  <div className="min-h-[22px] flex items-center justify-center mb-1">
                    {item.isNow ? (
                      <span className="text-[8.5px] font-black uppercase tracking-wider bg-[#0D3B2E] text-[#D4AF37] px-1.5 py-0.5 rounded-full shadow-xs ring-1 ring-[#D4AF37]/50 animate-pulse whitespace-nowrap">
                        NOW
                      </span>
                    ) : isHovered ? (
                      <span className="text-[9px] font-mono font-bold text-[#0D3B2E] bg-white px-1 rounded shadow-xs border border-gray-200 whitespace-nowrap">
                        {item.capacityPercentage}%
                      </span>
                    ) : null}
                  </div>

                  {/* Bar Box */}
                  <div className="w-full bg-[#F8F6F0] rounded-xl flex flex-col justify-end p-1 relative overflow-hidden border border-[#0D3B2E]/10 h-36 transition-all duration-200 group-hover:border-[#0D3B2E] group-hover:shadow-md">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-lg bg-gradient-to-t ${barGradient} transition-all duration-300 ${
                        isHovered ? 'brightness-110 scale-[1.02]' : 'opacity-90'
                      }`}
                    />
                  </div>

                  {/* Time Label */}
                  <span className={`text-[10px] font-mono-stat font-bold mt-1.5 transition-colors ${
                    item.isNow
                      ? 'text-[#0D3B2E] font-black scale-110'
                      : isHovered
                      ? 'text-[#C85A32]'
                      : 'text-gray-600'
                  }`}>
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
