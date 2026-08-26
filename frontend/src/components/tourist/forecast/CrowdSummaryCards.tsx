import React from 'react';
import { DailyCrowdForecast } from '../../../types/heritage';
import { Users, Activity, Smile, ShieldAlert, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface CrowdSummaryCardsProps {
  forecast: DailyCrowdForecast;
  language: 'en' | 'hi';
}

export const CrowdSummaryCards: React.FC<CrowdSummaryCardsProps> = ({ forecast, language }) => {
  // Crowd Level Theme Styling
  const getCrowdBadgeStyle = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'High':
      case 'Overcrowded':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getComfortScoreBadge = (score: number) => {
    if (score >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getPressureBadge = (score: number) => {
    if (score <= 40) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score <= 70) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-red-800 bg-red-50 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      
      {/* Card 1: Expected Visitors */}
      <div className="bg-white p-5 rounded-2xl border border-[#0D3B2E]/12 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0D3B2E]/70 uppercase tracking-wider">
            {language === 'hi' ? 'अनुमानित आगंतुक' : 'Expected Visitors'}
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#0D3B2E]/5 text-[#0D3B2E] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div>
          <p className="text-2xl sm:text-3xl font-bold text-[#0D3B2E] font-mono-stat tracking-tight">
            {forecast.expectedVisitors.toLocaleString()}
          </p>
          <div className="flex items-center space-x-1.5 mt-1">
            {forecast.comparisonWithToday.direction === 'down' && (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{forecast.comparisonWithToday.label}</span>
              </span>
            )}
            {forecast.comparisonWithToday.direction === 'up' && (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{forecast.comparisonWithToday.label}</span>
              </span>
            )}
            {forecast.comparisonWithToday.direction === 'same' && (
              <span className="inline-flex items-center space-x-1 text-xs font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                <Minus className="w-3.5 h-3.5 text-gray-400" />
                <span>{forecast.comparisonWithToday.label}</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-[#1A2621]/60 pt-2 border-t border-gray-100 font-medium">
          {language === 'hi' ? 'दैनिक औसत प्रवेश गणना' : 'Projected aggregate entrance gate count'}
        </p>
      </div>

      {/* Card 2: Crowd Level */}
      <div className="bg-white p-5 rounded-2xl border border-[#0D3B2E]/12 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0D3B2E]/70 uppercase tracking-wider">
            {language === 'hi' ? 'भीड़ का स्तर' : 'Crowd Level'}
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-xl text-sm font-bold border ${getCrowdBadgeStyle(forecast.crowdLevel)}`}>
              {forecast.crowdLevel === 'Overcrowded'
                ? 'Peak / Overcrowded'
                : forecast.crowdLevel === 'High'
                ? 'High Density'
                : forecast.crowdLevel === 'Moderate'
                ? 'Moderate Flow'
                : 'Low – Peaceful'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            {forecast.crowdLevel === 'Low'
              ? 'Minimal queuing across all corridors.'
              : forecast.crowdLevel === 'Moderate'
              ? 'Steady flow with brief queuing at sanctums.'
              : 'Heavy congestion expected during peak hours.'}
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-medium text-gray-500">
          <span>Density Scale</span>
          <span className="font-bold text-[#0D3B2E]">ASI Safety Standard</span>
        </div>
      </div>

      {/* Card 3: Crowd Comfort Score */}
      <div className="bg-white p-5 rounded-2xl border border-[#0D3B2E]/12 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0D3B2E]/70 uppercase tracking-wider">
            {language === 'hi' ? 'भ्रमण सुविधा स्कोर' : 'Crowd Comfort Score'}
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Smile className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-[#0D3B2E] font-mono-stat tracking-tight">
              {forecast.comfortScore}
            </span>
            <span className="text-sm text-gray-400 font-mono-stat font-semibold">/ 100</span>
          </div>
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md border mt-1 ${getComfortScoreBadge(forecast.comfortScore)}`}>
            {forecast.comfortLabel}
          </span>
        </div>

        <p className="text-[11px] text-[#1A2621]/60 pt-2 border-t border-gray-100 font-medium">
          {language === 'hi' ? 'स्थानिक घनत्व व तापमान पर आधारित' : 'Based on spatial density & movement pace'}
        </p>
      </div>

      {/* Card 4: Heritage Pressure */}
      <div className="bg-white p-5 rounded-2xl border border-[#0D3B2E]/12 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0D3B2E]/70 uppercase tracking-wider">
            {language === 'hi' ? 'धरोहर दबाव (HPS)' : 'Heritage Pressure'}
          </span>
          <div className="w-8 h-8 rounded-xl bg-red-50 text-[#C85A32] flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-[#0D3B2E] font-mono-stat tracking-tight">
              {forecast.heritagePressure}
            </span>
            <span className="text-sm text-gray-400 font-mono-stat font-semibold">/ 100</span>
          </div>
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md border mt-1 ${getPressureBadge(forecast.heritagePressure)}`}>
            {forecast.heritageImpactLabel}
          </span>
        </div>

        <p className="text-[11px] text-[#1A2621]/60 pt-2 border-t border-gray-100 font-medium">
          {language === 'hi' ? 'संरचनात्मक घिसाव व कंपन सूचकांक' : 'Physical abrasion & foundation vibration index'}
        </p>
      </div>

    </div>
  );
};
