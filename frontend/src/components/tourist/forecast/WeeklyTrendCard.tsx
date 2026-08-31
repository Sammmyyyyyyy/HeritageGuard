import React from 'react';
import { DailyCrowdForecast, MonumentCrowdForecast } from '../../../types/heritage';
import { Calendar, Sparkles, Award, ArrowUpRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { getDayNameLabel, formatDateLocalized } from '../../../utils/translations';

interface WeeklyTrendCardProps {
  days: DailyCrowdForecast[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  bestDayThisWeek: MonumentCrowdForecast['bestDayThisWeek'];
  language: 'en' | 'hi';
}

export const WeeklyTrendCard: React.FC<WeeklyTrendCardProps> = ({
  days,
  selectedDate,
  onSelectDate,
  bestDayThisWeek,
  language
}) => {
  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#0D3B2E]/12 shadow-sm space-y-5 flex flex-col justify-between">
      
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0D3B2E] text-white flex items-center justify-center text-xs font-bold">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0D3B2E] font-serif-heritage">
                {language === 'hi' ? 'साप्ताहिक रुझान' : 'Weekly Crowd Trend'}
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">
                {language === 'hi' ? '7-दिवसीय तुलनात्मक दृश्य' : '7-day comparative density snapshot'}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-[#0D3B2E] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {language === 'hi' ? '7-दिवसीय अवलोकन' : '7 Days Overview'}
          </span>
        </div>

        {/* Best Day This Week Banner */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/90 flex items-start space-x-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                {language === 'hi' ? 'सप्ताह का सर्वोत्तम दिन:' : 'Best Day This Week:'}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                {getDayNameLabel(bestDayThisWeek.dayName, language)} ({formatDateLocalized(bestDayThisWeek.formattedDate, language)})
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/80 mt-1 leading-snug font-medium">
              {language === 'hi' && bestDayThisWeek.hindiReason ? bestDayThisWeek.hindiReason : bestDayThisWeek.reason}
            </p>
          </div>
        </div>

        {/* Days Table List */}
        <div className="space-y-1.5 pt-1">
          {days.map((day) => {
            const isSelected = day.date === selectedDate;
            const isBest = day.date === bestDayThisWeek.date;
            const dayDisplayName = day.isToday
              ? (language === 'hi' ? 'आज' : 'Today')
              : getDayNameLabel(day.dayName, language);
            const localizedDateStr = formatDateLocalized(day.formattedDate, language);

            return (
              <button
                key={day.date}
                onClick={() => onSelectDate(day.date)}
                className={`w-full p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#0D3B2E] text-white border-[#0D3B2E] shadow-sm'
                    : 'bg-[#F8F6F0]/60 hover:bg-white text-gray-800 border-gray-100 hover:border-gray-300'
                }`}
              >
                {/* Left: Day & Date */}
                <div className="flex items-center space-x-2 min-w-[120px]">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    day.crowdLevel === 'Low'
                      ? 'bg-emerald-500'
                      : day.crowdLevel === 'Moderate'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`} />
                  <span className="font-bold">
                    {dayDisplayName}
                  </span>
                  <span className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                    ({localizedDateStr})
                  </span>
                </div>

                {/* Center: Visitors Count */}
                <span className={`font-mono-stat font-bold text-sm ${
                  isSelected ? 'text-[#D4AF37]' : 'text-[#0D3B2E]'
                }`}>
                  {day.expectedVisitors.toLocaleString()}
                </span>

                {/* Right: Delta vs Today / Best Day Chip */}
                <div className="flex items-center space-x-2">
                  {isBest && !isSelected && (
                    <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded uppercase hidden sm:inline">
                      {language === 'hi' ? 'सर्वोत्तम' : 'BEST'}
                    </span>
                  )}
                  {day.comparisonWithToday.direction === 'down' ? (
                    <span className={`text-[11px] font-bold flex items-center space-x-0.5 ${
                      isSelected ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      <TrendingDown className="w-3 h-3" />
                      <span>{day.comparisonWithToday.label.split(' ')[0]} {day.comparisonWithToday.label.split(' ')[1]}</span>
                    </span>
                  ) : day.comparisonWithToday.direction === 'up' ? (
                    <span className={`text-[11px] font-bold flex items-center space-x-0.5 ${
                      isSelected ? 'text-red-300' : 'text-red-600'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      <span>{day.comparisonWithToday.label.split(' ')[0]} {day.comparisonWithToday.label.split(' ')[1]}</span>
                    </span>
                  ) : (
                    <span className={`text-[11px] font-medium ${
                      isSelected ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {language === 'hi' ? 'आधारभूत' : 'Baseline'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center font-medium pt-2">
        {language === 'hi'
          ? 'पूरे दिन का विवरण देखने के लिए ऊपर किसी भी पंक्ति पर क्लिक करें'
          : 'Click any row above to view full day breakdown'}
      </p>

    </div>
  );
};
