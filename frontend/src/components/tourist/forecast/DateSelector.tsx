import React from 'react';
import { DailyCrowdForecast } from '../../../types/heritage';
import { Calendar, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { getTodayDateString, getFutureDateString } from '../../../data/crowdForecastData';

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
  const todayStr = getTodayDateString();
  const tomorrowStr = getFutureDateString(1);
  const maxFutureDateStr = getFutureDateString(365);

  const isCustomFutureDate = !days.some((d) => d.date === selectedDate);

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (val < todayStr) {
      alert(language === 'hi' ? 'कृपया आज या भविष्य की तारीख चुनें।' : 'Please select today or a future date.');
      return;
    }
    onSelectDate(val);
  };

  return (
    <div className="w-full space-y-3">
      
      {/* Top Bar: Title + Quick Select + Custom 365-Day Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E] flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-[#C85A32]" />
            <span>{language === 'hi' ? 'तारीख चुनें (365 दिनों तक)' : 'Select Date (Up to 365 Days Ahead)'}</span>
          </span>
        </div>

        {/* Quick Select & Date Input Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectDate(todayStr)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedDate === todayStr
                ? 'bg-[#0D3B2E] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-[#0D3B2E]/20 hover:bg-emerald-50'
            }`}
          >
            {language === 'hi' ? 'आज' : 'Today'}
          </button>

          <button
            type="button"
            onClick={() => onSelectDate(tomorrowStr)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedDate === tomorrowStr
                ? 'bg-[#0D3B2E] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-[#0D3B2E]/20 hover:bg-emerald-50'
            }`}
          >
            {language === 'hi' ? 'कल' : 'Tomorrow'}
          </button>

          {/* Custom Date Input Picker (Up to 365 Days) */}
          <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg border border-[#0D3B2E]/20 text-xs shadow-xs focus-within:ring-2 focus-within:ring-[#0D3B2E]">
            <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              max={maxFutureDateStr}
              onChange={handleCustomDateChange}
              className="bg-transparent text-xs font-bold text-[#0D3B2E] font-mono focus:outline-none cursor-pointer"
              title="Pick any date up to 365 days into the future"
            />
          </div>
        </div>
      </div>

      {/* Custom Date Indicator Banner if outside 7-day strip */}
      {isCustomFutureDate && (
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>
              <strong>{language === 'hi' ? 'कस्टम पूर्वानुमान तिथि:' : 'Custom Forecast Date:'}</strong> {selectedDate} (365-day AI Simulation Mode)
            </span>
          </div>
          <button
            onClick={() => onSelectDate(todayStr)}
            className="text-[11px] font-bold text-[#0D3B2E] hover:underline cursor-pointer"
          >
            {language === 'hi' ? 'आज पर वापस जाएं' : 'Reset to Today'}
          </button>
        </div>
      )}

      {/* Horizontally scrollable container for 7-day strip */}
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
              className={`flex-1 min-w-[76px] sm:min-w-[92px] py-2.5 sm:py-3 px-2 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center space-y-1 relative group shrink-0 ${isSelected
                  ? 'bg-[#0D3B2E] text-white border-[#0D3B2E] shadow-md scale-[1.03] z-10'
                  : 'bg-white hover:bg-emerald-50/50 text-[#1A2621] border-[#0D3B2E]/15 hover:border-[#0D3B2E]/40'
                }`}
            >
              {/* Today / Best Day Badge */}
              {day.isToday && (
                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-[#D4AF37] text-[#08281E]' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                  {language === 'hi' ? 'आज' : 'TODAY'}
                </span>
              )}

              {/* Day of Week */}
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#D4AF37]' : 'text-[#0D3B2E]'
                }`}>
                {day.dayOfWeek}
              </span>

              {/* Date Number */}
              <span className={`text-lg sm:text-xl font-bold font-mono-stat leading-none ${isSelected ? 'text-white' : 'text-[#1A2621]'
                }`}>
                {dateNum}
              </span>

              {/* Month */}
              <span className={`text-[10px] font-medium leading-none ${isSelected ? 'text-white/80' : 'text-gray-500'
                }`}>
                {monthShort}
              </span>

              {/* Crowd Indicator Dot & Level */}
              <div className="flex items-center space-x-1 pt-0.5">
                <span className={`w-2 h-2 rounded-full ${dotColor} ${isSelected ? 'ring-1 ring-white/60' : ''}`} />
                <span className={`text-[9px] font-bold capitalize ${isSelected ? 'text-white/90' : 'text-gray-600'
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
