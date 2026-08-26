import React from 'react';
import { DailyCrowdForecast } from '../../../types/heritage';
import { Lightbulb, CheckCircle2, TrendingUp, Sun, Sparkles, Compass } from 'lucide-react';

interface CrowdReasonsCardProps {
  forecast: DailyCrowdForecast;
  language: 'en' | 'hi';
}

export const CrowdReasonsCard: React.FC<CrowdReasonsCardProps> = ({ forecast, language }) => {
  const { crowdReasons } = forecast;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#0D3B2E]/12 shadow-sm space-y-5 flex flex-col justify-between">
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
            crowdReasons.isHigh ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
          }`}>
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0D3B2E] font-serif-heritage">
              {language === 'hi' 
                ? (crowdReasons.isHigh ? 'भीड़ अधिक क्यों है?' : 'आज का दिन अनुकूल क्यों है?')
                : crowdReasons.title}
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">
              {language === 'hi' ? 'एआई अंतर्दृष्टि व विश्लेषणात्मक कारक' : 'AI Explainability & Contributing Factors'}
            </span>
          </div>
        </div>

        {/* Narrative paragraph */}
        <p className="text-xs sm:text-sm text-[#1A2621]/80 leading-relaxed font-medium bg-[#F8F6F0] p-4 rounded-2xl border border-[#0D3B2E]/8">
          {language === 'hi' && crowdReasons.hindiSummary ? crowdReasons.hindiSummary : crowdReasons.summary}
        </p>

        {/* Contributing Factors Grid */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#0D3B2E]/70">
            {language === 'hi' ? 'प्रमुख निर्धारक कारक:' : 'Key Influencing Drivers:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {crowdReasons.factors.map((factor, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs font-medium">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  crowdReasons.isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
        <span>Model Confidence: 94.8%</span>
        <span className="text-[#0D3B2E] font-semibold">ASI & Weather Telemetry Sync</span>
      </div>

    </div>
  );
};
