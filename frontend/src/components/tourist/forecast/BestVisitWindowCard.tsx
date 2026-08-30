import React from 'react';
import { DailyCrowdForecast } from '../../../types/heritage';
import { Sparkles, Clock, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface BestVisitWindowCardProps {
  forecast: DailyCrowdForecast;
  language: 'en' | 'hi';
}

export const BestVisitWindowCard: React.FC<BestVisitWindowCardProps> = ({ forecast, language }) => {
  const reasons = language === 'hi' && forecast.bestVisitingWindow.hindiReasons
    ? forecast.bestVisitingWindow.hindiReasons
    : forecast.bestVisitingWindow.reasons;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
      
      {/* 1. Recommended Visiting Window (7 cols) - Primary Highlight */}
      <div className="lg:col-span-7 bg-gradient-to-br from-[#0D3B2E] via-[#0A2E24] to-[#08281E] text-white p-6 sm:p-7 rounded-3xl border border-[#D4AF37]/35 shadow-xl flex flex-col justify-between space-y-5 relative overflow-hidden">
        {/* Subtle Decorative Background Aura */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-xs font-bold border border-[#D4AF37]/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? '✨ अनुशंसित समय स्लॉट' : '✨ Recommended Visiting Window'}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono-stat text-[#F8F6F0] tracking-tight">
              {forecast.bestVisitingWindow.start} – {forecast.bestVisitingWindow.end}
            </h3>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {language === 'hi' ? 'न्यूनतम भीड़' : 'Optimal Slot'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-medium">
            {language === 'hi'
              ? 'इस समय पर आने से आपको सर्वोत्तम भ्रमण अनुभव और न्यूनतम प्रतीक्षा समय प्राप्त होगा।'
              : 'Visiting during this morning window ensures undisturbed sightseeing, comfortable temperature, and significantly reduced strain on the monument.'}
          </p>
        </div>

        {/* Bullet Reasons */}
        <div className="pt-4 border-t border-white/15 space-y-2.5 relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
            {language === 'hi' ? 'इस समय जाने के प्रमुख लाभ:' : 'Why Visit During This Window:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-start space-x-2 text-xs text-white/90 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Avoid Window (5 cols) - Clear Warning */}
      <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 to-orange-50/80 p-6 sm:p-7 rounded-3xl border border-amber-200/90 shadow-sm flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>{language === 'hi' ? '⚠️ अत्यधिक भीड़ का समय (PEAK HOURS)' : '⚠️ PEAK HOURS'}</span>
          </div>

          <div>
            <h4 className="text-xl sm:text-2xl font-bold font-mono-stat text-[#991B1B] tracking-tight">
              {forecast.avoidWindow.start} – {forecast.avoidWindow.end}
            </h4>
            <p className="text-xs font-semibold text-amber-900 mt-1 uppercase tracking-wider">
              {language === 'hi' ? 'पीक ऑवर कंजेशन' : 'Midday Inbound Surge'}
            </p>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200 space-y-2">
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              {language === 'hi' && forecast.avoidWindow.hindiReason
                ? forecast.avoidWindow.hindiReason
                : forecast.avoidWindow.reason}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between text-xs text-amber-900 font-medium">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>{language === 'hi' ? 'अनुशंसित वैकल्पिक समय:' : 'Recommended Alternative Window:'}</span>
          </span>
          <span className="font-bold text-[#0D3B2E] font-mono-stat">
            {forecast.bestVisitingWindow.start} – {forecast.bestVisitingWindow.end}
          </span>
        </div>
      </div>

    </div>
  );
};
