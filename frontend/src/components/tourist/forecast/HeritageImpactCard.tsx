import React from 'react';
import { DailyCrowdForecast } from '../../../types/heritage';
import { ShieldCheck, ShieldAlert, ArrowRight, Activity, Leaf, HeartHandshake } from 'lucide-react';

interface HeritageImpactCardProps {
  forecast: DailyCrowdForecast;
  language: 'en' | 'hi';
}

export const HeritageImpactCard: React.FC<HeritageImpactCardProps> = ({ forecast, language }) => {
  const pressureScore = forecast.heritagePressure;

  return (
    <div className="bg-[#F8F6F0] p-6 sm:p-7 rounded-3xl border border-[#0D3B2E]/15 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#0D3B2E]/10 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0D3B2E] text-[#D4AF37] flex items-center justify-center text-xs font-bold">
            🏛️
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0D3B2E] font-serif-heritage">
              {language === 'hi' ? 'धरोहर संरक्षण प्रभाव' : 'Heritage Conservation Impact'}
            </h3>
            <span className="text-[11px] text-[#1A2621]/60 font-medium">
              {language === 'hi' ? 'पर्यटन घनत्व व स्मारक सुरक्षा संबंध' : 'Tourist footprint & structural preservation relationship'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            pressureScore <= 40
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : pressureScore <= 70
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}>
            {forecast.heritageImpactLabel}
          </span>
        </div>
      </div>

      {/* Conservation Concept Chain Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-[#0D3B2E]/10 flex flex-col justify-between space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">1. Crowd Density</span>
          <p className="text-sm font-bold text-[#0D3B2E] font-mono-stat">
            {forecast.expectedVisitors.toLocaleString()} visitors
          </p>
          <span className="text-[10px] text-gray-500">Gate Inflow Volume</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-[#0D3B2E]/10 flex flex-col justify-between space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">2. Visitor Pressure</span>
          <p className="text-sm font-bold text-[#C85A32] font-mono-stat">
            {forecast.comfortScore}/100 Comfort
          </p>
          <span className="text-[10px] text-gray-500">Spatiotemporal Load</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-[#0D3B2E]/10 flex flex-col justify-between space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">3. Heritage Strain</span>
          <p className="text-sm font-bold text-[#0D3B2E] font-mono-stat">
            {pressureScore}/100 (HPS)
          </p>
          <span className="text-[10px] text-gray-500">Structural Abrasion Rate</span>
        </div>
      </div>

      {/* Progress Bar & Explanation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#0D3B2E]">
          <span>Heritage Pressure Score (HPS)</span>
          <span className="font-mono-stat text-sm">{pressureScore} / 100</span>
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden p-0.5">
          <div
            style={{ width: `${pressureScore}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              pressureScore <= 40
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : pressureScore <= 70
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}
          />
        </div>

        <p className="text-xs text-[#1A2621]/80 leading-relaxed pt-1 font-medium">
          {forecast.heritageImpactDetails}
        </p>
      </div>

    </div>
  );
};
