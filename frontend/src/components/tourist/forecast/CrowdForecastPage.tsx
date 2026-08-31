import React, { useState, useEffect } from 'react';
import { Monument, MonumentCrowdForecast, DailyCrowdForecast } from '../../../types/heritage';
import {
  fetchSiteCrowdForecast,
  fetchSingleDateCrowdForecast,
  getTodayDateString,
  formatDateLabel,
} from '../../../data/crowdForecastData';
import { DateSelector } from './DateSelector';
import { CrowdSummaryCards } from './CrowdSummaryCards';
import { BestVisitWindowCard } from './BestVisitWindowCard';
import { HourlyCrowdChart } from './HourlyCrowdChart';
import { CrowdReasonsCard } from './CrowdReasonsCard';
import { WeeklyTrendCard } from './WeeklyTrendCard';
import { HeritageImpactCard } from './HeritageImpactCard';
import { 
  ArrowLeft, 
  MapPin, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  Share2, 
  Bot, 
  ShieldCheck,
  Compass,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface CrowdForecastPageProps {
  monument: Monument;
  language: 'en' | 'hi';
  onBackToMonument: (monument: Monument) => void;
  onPlanVisit: (monument: Monument) => void;
  initialDate?: string;
}

export const CrowdForecastPage: React.FC<CrowdForecastPageProps> = ({
  monument,
  language,
  onBackToMonument,
  onPlanVisit,
  initialDate
}) => {
  const [forecastBundle, setForecastBundle] = useState<MonumentCrowdForecast | null>(null);
  const [cachedDays, setCachedDays] = useState<Record<string, DailyCrowdForecast>>({});
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || getTodayDateString());
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isLoadingDate, setIsLoadingDate] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Initial load: Fetch 7-day forecast bundle from backend AI model
  const loadInitialForecast = async () => {
    setIsLoadingInitial(true);
    setErrorMessage(null);
    try {
      const bundle = await fetchSiteCrowdForecast(monument);
      setForecastBundle(bundle);

      const dayMap: Record<string, DailyCrowdForecast> = {};
      if (Array.isArray(bundle?.days)) {
        bundle.days.forEach((d) => {
          if (d?.date) dayMap[d.date] = d;
        });
      }

      // If an initial custom date was requested and isn't in the initial 7 days, fetch it
      const fallbackToday = new Date().toISOString().split('T')[0];
      const defaultDate = bundle?.days?.[0]?.date || fallbackToday;
      const targetDate = initialDate && initialDate.trim().length > 0 ? initialDate : defaultDate;
      setSelectedDate(targetDate);

      if (!dayMap[targetDate]) {
        try {
          const baselineTotal = bundle?.days?.[0]?.expectedVisitors || bundle?.currentLiveFootfall || 5000;
          const customDay = await fetchSingleDateCrowdForecast(monument, targetDate, baselineTotal);
          dayMap[targetDate] = customDay;
        } catch {
          // If custom date fails, fallback to today
          setSelectedDate(defaultDate);
        }
      }

      setCachedDays(dayMap);
      setIsLoadingInitial(false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Crowd prediction backend currently unavailable.');
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialForecast();
  }, [monument.id]);

  // Handle user selecting any date (quick select or custom date picker)
  const handleSelectDate = async (newDate: string) => {
    if (!newDate || newDate === selectedDate) return;
    setSelectedDate(newDate);

    // Update URL hash parameter seamlessly without page reload
    if (window.history?.replaceState) {
      window.history.replaceState(null, '', `#forecast-${monument.id}?date=${newDate}`);
    }

    // If date is already cached, no need to fetch
    if (cachedDays[newDate]) {
      return;
    }

    // Fetch live backend prediction for this custom date
    setIsLoadingDate(true);
    try {
      const baselineTotal = forecastBundle?.days[0]?.expectedVisitors || monument.liveFootfall;
      const customDay = await fetchSingleDateCrowdForecast(monument, newDate, baselineTotal);
      setCachedDays((prev) => ({
        ...prev,
        [newDate]: customDay,
      }));
      setIsLoadingDate(false);
    } catch (err: any) {
      setIsLoadingDate(false);
      setErrorMessage(`Failed to fetch prediction for ${newDate}: ${err?.message || 'Network error'}`);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#forecast-${monument.id}?date=${selectedDate}`;
    navigator.clipboard?.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Active selected day's forecast
  const activeDayForecast: DailyCrowdForecast | null =
    cachedDays[selectedDate] ||
    (forecastBundle?.days.find((d) => d.date === selectedDate) ?? forecastBundle?.days[0] ?? null);

  // Initial Loading State
  if (isLoadingInitial) {
    return (
      <div className="w-full bg-[#F8F6F0] min-h-screen text-[#1A2621] py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#0D3B2E]/15 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0D3B2E] text-[#D4AF37] flex items-center justify-center mx-auto shadow-md animate-pulse">
            <Compass className="w-7 h-7 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#0D3B2E] font-serif-heritage">
            {language === 'hi' ? 'एआई भीड़ पूर्वानुमान लोड हो रहा है...' : 'Analyzing Crowd Predictions...'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Fetching LightGBM crowd inference, safe capacity limits, and heritage pressure metrics for {monument.name}.
          </p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-[#D4AF37] h-full rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (errorMessage && !activeDayForecast) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto shadow-md">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-[#0D3B2E] font-serif-heritage">
          {language === 'hi' ? 'भीड़ पूर्वानुमान सेवा अनुपलब्ध है' : 'Crowd Prediction Unavailable'}
        </h2>
        <p className="text-xs text-gray-600 max-w-md mx-auto">
          {errorMessage}
        </p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => onBackToMonument(monument)}
            className="px-5 py-2.5 rounded-xl border border-[#0D3B2E]/20 text-xs font-bold text-[#0D3B2E] hover:bg-white transition-colors"
          >
            Return to {monument.name}
          </button>
          <button
            onClick={loadInitialForecast}
            className="px-5 py-2.5 rounded-xl bg-[#0D3B2E] text-white text-xs font-bold shadow-md hover:bg-[#08281E] transition-all flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  if (!activeDayForecast || !forecastBundle) return null;

  return (
    <div className="w-full bg-[#F8F6F0] min-h-screen text-[#1A2621] py-6 sm:py-10 animate-fadeIn">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7 sm:space-y-9">
        
        {/* =========================================================================
            1. TOP NAVIGATION & MONUMENT HEADER
           ========================================================================= */}
        <div className="space-y-4">
          
          {/* Back Action Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => onBackToMonument(monument)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-full bg-white border border-[#0D3B2E]/15 text-xs font-bold text-[#0D3B2E] hover:bg-[#0D3B2E] hover:text-white transition-all cursor-pointer shadow-2xs group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>
                {language === 'hi' ? `← वापस ${monument.name}` : `Back to ${monument.name}`}
              </span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#0D3B2E]/15 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-2xs"
                title="Share Forecast"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-gray-500" />}
                <span className="text-[11px] hidden sm:inline">{isCopied ? 'Link Copied' : 'Share Forecast'}</span>
              </button>
            </div>
          </div>

          {/* Page Headline & Monument Title */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#0D3B2E]/12 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0D3B2E] text-xs font-bold border border-emerald-200">
                <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{language === 'hi' ? 'एआई भीड़ पूर्वानुमान प्रणाली' : 'INTELLIGENT CROWD FORECAST'}</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D3B2E] font-serif-heritage tracking-tight leading-tight">
                  {language === 'hi' ? monument.hindiName : monument.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium flex items-center space-x-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                  <span>{monument.city}, {monument.state}</span>
                  <span className="text-gray-300">•</span>
                  <span>Safe Capacity: {forecastBundle.safeCapacity.toLocaleString()}</span>
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#1A2621]/80 max-w-2xl font-medium pt-1">
                {language === 'hi'
                  ? 'किसी भी भविष्य की तारीख के लिए एआई मॉडल द्वारा अनुमानित भीड़ घनत्व और धरोहर संरक्षण प्रभाव देखें।'
                  : 'Explore AI crowd predictions for any future date with hourly simulation curves, safe capacity thresholds, and structural preservation telemetry.'}
              </p>
            </div>

            {/* Monument Thumbnail Banner */}
            <div className="w-full md:w-56 h-36 rounded-2xl overflow-hidden shrink-0 border border-[#0D3B2E]/15 shadow-sm relative group">
              <img
                src={monument.imageUrl}
                alt={monument.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                {monument.architecturalStyle.split(' ')[0]}
              </span>
            </div>
          </div>

        </div>

        {/* =========================================================================
            2. HORIZONTAL & CUSTOM DATE SELECTOR (Allows ANY future date)
           ========================================================================= */}
        <DateSelector
          days={forecastBundle.days}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          language={language}
        />

        {/* Custom Date Loading Banner */}
        {isLoadingDate && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0D3B2E] text-xs flex items-center justify-center space-x-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#0D3B2E]" />
            <span className="font-bold">
              {language === 'hi'
                ? `तारीख ${selectedDate} के लिए एआई भीड़ मॉडल से गणना की जा रही है...`
                : `Querying AI crowd prediction engine for ${selectedDate}...`}
            </span>
          </div>
        )}

        {/* =========================================================================
            3. DAILY SUMMARY METRICS CARDS (4 Tiles)
           ========================================================================= */}
        <CrowdSummaryCards
          forecast={activeDayForecast}
          language={language}
        />

        {/* =========================================================================
            4. BEST TIME TO VISIT & AVOID WINDOW CARDS (Highlighted Prominently)
           ========================================================================= */}
        <BestVisitWindowCard
          forecast={activeDayForecast}
          language={language}
        />

        {/* =========================================================================
            5. INTERACTIVE HOURLY CROWD FORECAST CHART
           ========================================================================= */}
        <HourlyCrowdChart
          hourlyData={activeDayForecast.hourlyForecast}
          isToday={activeDayForecast.isToday}
          safeCapacity={forecastBundle.safeCapacity}
          language={language}
        />

        {/* =========================================================================
            6. TWO COLUMN: WHY IS CROWD HIGH? + WEEKLY TREND TABLE
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 flex">
            <CrowdReasonsCard
              forecast={activeDayForecast}
              language={language}
            />
          </div>
          <div className="lg:col-span-6 flex">
            <WeeklyTrendCard
              days={forecastBundle.days}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              bestDayThisWeek={forecastBundle.bestDayThisWeek}
              language={language}
            />
          </div>
        </div>

        {/* =========================================================================
            7. HERITAGE CONSERVATION IMPACT SECTION
           ========================================================================= */}
        <HeritageImpactCard
          forecast={activeDayForecast}
          language={language}
        />

        {/* =========================================================================
            8. RECOMMENDED BY DHAROHAR AI CARD
           ========================================================================= */}
        <div className="bg-gradient-to-br from-[#0D3B2E] via-[#0A2A20] to-[#08281E] text-white p-6 sm:p-7 rounded-3xl border border-[#D4AF37]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start space-x-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#D4AF37] text-[#08281E] flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
                  {language === 'hi' ? 'धरोहर एआई की विशेष सिफारिश' : 'Recommended by Dharohar AI'}
                </span>
                <span className="text-[9px] bg-white/15 text-white px-2 py-0.5 rounded-full font-bold">
                  {activeDayForecast.dayName} ({activeDayForecast.date})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                {language === 'hi' && activeDayForecast.hindiAiRecommendation
                  ? activeDayForecast.hindiAiRecommendation
                  : activeDayForecast.aiRecommendation}
              </p>
            </div>
          </div>

          <button
            onClick={() => onPlanVisit(monument)}
            className="shrink-0 px-5 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#c59b27] text-[#08281E] font-bold text-xs flex items-center space-x-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <span>{language === 'hi' ? 'यात्रा की योजना बनाएं' : 'Apply AI Window'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================================
            9. BOTTOM CTA: WANT TO AVOID CROWDS? PLAN MY VISIT
           ========================================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#0D3B2E]/15 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-[#0D3B2E] font-serif-heritage">
              {language === 'hi' ? 'भीड़ से बचना चाहते हैं?' : 'Want to avoid crowds on your trip?'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
              {language === 'hi'
                ? 'स्मार्ट रूट और भीड़-रहित समय के साथ अपनी पूर्ण यात्रा की योजना बनाएं।'
                : 'Plan your personalized itinerary incorporating AI optimal visiting windows and nearby eco-friendly alternative monuments.'}
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-center">
            <button
              onClick={() => onBackToMonument(monument)}
              className="px-5 py-3 rounded-2xl border border-[#0D3B2E]/20 text-xs font-bold text-[#0D3B2E] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'स्मारक विवरण' : 'Monument Details'}
            </button>
            <button
              onClick={() => onPlanVisit(monument)}
              className="px-6 py-3 rounded-2xl bg-[#0D3B2E] hover:bg-[#08281E] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <span>{language === 'hi' ? 'यात्रा की योजना बनाएं' : 'Plan My Visit'}</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

