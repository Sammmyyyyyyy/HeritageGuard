import React from 'react';
import { DailyCrowdForecast } from '../../../types/heritage';
import { Calendar, Sparkles } from 'lucide-react';

interface DateSelectorProps {
  days: DailyCrowdForecast[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  language: 'en' | 'hi';
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  days,
  selectedDate,
  onSelectDate,
  language
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]/80 flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>{language === 'hi' ? 'तारीख चुनें (अगले 7 दिन)' : 'Select Date (Next 7 Days)'}</span>
        </span>
        <span className="text-[11px] text-[#1A2621]/60 hidden sm:inline">
          {language === 'hi' ? 'अनुमानित भीड़ देखने के लिए तिथि पर क्लिक करें' : 'Click any date to update live AI forecast'}
        </span>
      </div>

      {/* Horizontally scrollable container on mobile */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-emerald-800/20 scrollbar-track-transparent">
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const dateNum = day.formattedDate.split(' ')[0];
          const monthShort = day.formattedDate.split(' ')[1];

          // Crowd Level Status Dot Color
          const dotColor = 
            day.crowdLevel === 'Low'
              ? 'bg-emerald-500'
              : day.crowdLevel === 'Moderate'
              ? 'bg-amber-500'
              : 'bg-red-500';

          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              aria-selected={isSelected}
              className={`flex-1 min-w-[76px] sm:min-w-[92px] py-2.5 sm:py-3 px-2 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center space-y-1 relative group shrink-0 ${
                isSelected
                  ? 'bg-[#0D3B2E] text-white border-[#0D3B2E] shadow-md scale-[1.03] z-10'
                  : 'bg-white hover:bg-emerald-50/50 text-[#1A2621] border-[#0D3B2E]/15 hover:border-[#0D3B2E]/40'
              }`}
            >
              {/* Today / Best Day Badge */}
              {day.isToday && (
                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-[#D4AF37] text-[#08281E]' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {language === 'hi' ? 'आज' : 'TODAY'}
                </span>
              )}

              {/* Day of Week */}
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isSelected ? 'text-[#D4AF37]' : 'text-[#0D3B2E]'
              }`}>
                {day.dayOfWeek}
              </span>

              {/* Date Number */}
              <span className={`text-lg sm:text-xl font-bold font-mono-stat leading-none ${
                isSelected ? 'text-white' : 'text-[#1A2621]'
              }`}>
                {dateNum}
              </span>

              {/* Month */}
              <span className={`text-[10px] font-medium leading-none ${
                isSelected ? 'text-white/80' : 'text-gray-500'
              }`}>
                {monthShort}
              </span>

              {/* Crowd Indicator Dot & Level */}
              <div className="flex items-center space-x-1 pt-0.5">
                <span className={`w-2 h-2 rounded-full ${dotColor} ${isSelected ? 'ring-1 ring-white/60' : ''}`} />
                <span className={`text-[9px] font-bold capitalize ${
                  isSelected ? 'text-white/90' : 'text-gray-600'
                }`}>
                  {day.crowdLevel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
