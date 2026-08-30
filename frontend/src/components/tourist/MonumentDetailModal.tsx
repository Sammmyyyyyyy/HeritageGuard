import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Star,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Compass,
  ArrowRight,
  Info,
  Calendar,
  IndianRupee,
  Share2,
  Bookmark,
  CheckCircle,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Monument } from '../../types/heritage';
import { getCrowd, CrowdPredictionResponse, HourlyPrediction } from '../../api/crowd';
import { getPressure, PressureResponse } from '../../api/pressure';
import { getTodayDateString, formatTime12, formatTimeRange } from '../../data/crowdForecastData';

interface MonumentDetailModalProps {
  monument: Monument | null;
  onClose: () => void;
  language: 'en' | 'hi';
  onSelectAlternative: (altId: string) => void;
  onOpenScanner: () => void;
  onOpenCrowdForecast?: (monument: Monument) => void;
}

export const MonumentDetailModal: React.FC<MonumentDetailModalProps> = ({
  monument,
  onClose,
  language,
  onSelectAlternative,
  onOpenScanner,
  onOpenCrowdForecast
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Backend Telemetry State
  const [liveCrowd, setLiveCrowd] = useState<CrowdPredictionResponse | null>(null);
  const [livePressure, setLivePressure] = useState<PressureResponse | null>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState<boolean>(true);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

  // Fetch live crowd and pressure from backend whenever monument changes
  useEffect(() => {
    if (!monument) return;

    let isMounted = true;
    setIsLoadingTelemetry(true);
    setTelemetryError(null);

    const todayStr = getTodayDateString();

    Promise.all([
      getCrowd(monument.id, todayStr),
      getPressure(monument.id).catch(() => null)
    ])
      .then(([crowdData, pressureData]) => {
        if (!isMounted) return;
        setLiveCrowd(crowdData);
        setLivePressure(pressureData);
        setIsLoadingTelemetry(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load telemetry for modal:', err);
        setTelemetryError('Live crowd telemetry currently unavailable from server.');
        setIsLoadingTelemetry(false);
      });

    return () => {
      isMounted = false;
    };
  }, [monument?.id]);

  if (!monument) return null;

  // Single-source calculations derived from the authoritative backend response
  const effectivePressureScore = livePressure
    ? Math.round(livePressure.pressure_score)
    : monument.heritagePressureScore;

  const effectiveSafeCapacity = liveCrowd?.safe_capacity || monument.maxCapacity || 15000;

  // Current local hour in IST/browser timezone
  const currentHour = new Date().getHours();

  // Current-Hour Footfall prediction (matches current local hour)
  const currentHourSlot = liveCrowd?.predictions?.find((p) => {
    const h = parseInt(p.time.split(':')[0], 10);
    return h === currentHour;
  }) || (liveCrowd?.predictions && liveCrowd.predictions.length > 0 ? liveCrowd.predictions[0] : null);

  const currentHourFootfall = currentHourSlot
    ? currentHourSlot.expected_visitors
    : liveCrowd?.daily_expected_total ?? monument.liveFootfall;

  // Crowd Level badge derived from current-hour capacity ratio (<50% LOW, 50-75% MODERATE, 75-100% HIGH, >=100% PEAK)
  let effectiveCrowdLevel: 'Low' | 'Moderate' | 'High' | 'Peak' = 'Low';
  if (liveCrowd) {
    const capacityRatio = effectiveSafeCapacity > 0 ? currentHourFootfall / effectiveSafeCapacity : 0;
    if (capacityRatio >= 1.0) effectiveCrowdLevel = 'Peak';
    else if (capacityRatio >= 0.75) effectiveCrowdLevel = 'High';
    else if (capacityRatio >= 0.50) effectiveCrowdLevel = 'Moderate';
    else effectiveCrowdLevel = 'Low';
  }

  // Operating Hours from backend
  const effectiveOperatingHours = liveCrowd?.operating_hours
    ? `${formatTimeRange(liveCrowd.operating_hours).start} – ${formatTimeRange(liveCrowd.operating_hours).end}`
    : monument.openingHours;

  // AI Recommended Visiting Window from backend best_time
  const effectiveBestWindow = liveCrowd?.best_time
    ? formatTimeRange(liveCrowd.best_time)
    : monument.bestVisitingWindow;

  // Best Upcoming Slot: strictly filters out passed hours based on current local time
  const upcomingSlots = (liveCrowd?.predictions || []).filter((p) => {
    const h = parseInt(p.time.split(':')[0], 10);
    return h >= currentHour;
  });

  let bestUpcomingSlotStr = '';
  if (upcomingSlots.length > 0) {
    const sorted = [...upcomingSlots].sort((a, b) => a.crowd_percent - b.crowd_percent);
    const bestSlot = sorted[0];
    const slotH = parseInt(bestSlot.time.split(':')[0], 10);
    const nextH = slotH + 1;
    bestUpcomingSlotStr = `${formatTime12(bestSlot.time)} – ${formatTime12(`${String(nextH).padStart(2, '0')}:00`)}`;
  } else if (liveCrowd?.operating_hours) {
    const openH = liveCrowd.operating_hours.split('-')[0];
    bestUpcomingSlotStr = `Gates closed for today • Tomorrow at ${formatTime12(openH)}`;
  } else {
    bestUpcomingSlotStr = `${effectiveBestWindow.start} – ${effectiveBestWindow.end}`;
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAudioTourToggle = () => {
    if (!isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const textToSpeak = language === 'hi'
          ? `${monument.hindiName}। ${monument.hindiDescription} ${monument.historicalSignificance}`
          : `${monument.name}. ${monument.description} ${monument.historicalSignificance}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fadeIn">

      <div className="relative bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#0D3B2E]/20 overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">

        {/* Modal Header Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#0D3B2E]/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D3B2E] text-white flex items-center justify-center text-sm font-bold shrink-0">
              🏛️
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-[#0D3B2E] font-serif-heritage leading-tight truncate">
                {monument.name}
              </h2>
              <p className="text-xs text-[#1A2621]/60 flex items-center space-x-1 truncate">
                <MapPin className="w-3 h-3 text-[#C85A32] shrink-0" />
                <span className="truncate">{monument.city}, {monument.state}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors text-xs flex items-center space-x-1 cursor-pointer"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && <span className="text-[10px] text-emerald-600 font-bold hidden sm:inline">Copied!</span>}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0D3B2E]/10 hover:bg-[#0D3B2E]/20 text-[#0D3B2E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 flex-1">

          {/* Main Visual Carousel / Gallery Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Primary Large Image */}
            <div className="lg:col-span-8 relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 border border-[#0D3B2E]/10">
              <img
                src={monument.gallery[activeImageIndex] || monument.imageUrl || '/images/heritage-placeholder.jpg'}
                alt={monument.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/heritage-placeholder.jpg';
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

              {/* Status Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {monument.isUnesco && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0D3B2E]/90 text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm backdrop-blur-md">
                    UNESCO WORLD HERITAGE
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-[#0D3B2E] shadow-sm backdrop-blur-md">
                  {monument.architecturalStyle}
                </span>
              </div>

              {/* Live Audio Narration Bar Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/15 flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAudioTourToggle}
                    className="w-10 h-10 rounded-full bg-[#D4AF37] hover:bg-[#c59b27] text-[#08281E] flex items-center justify-center font-bold shadow-md transition-transform active:scale-95"
                    title={isPlayingAudio ? "Stop Audio Tour" : "Play Audio Tour"}
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                  <div>
                    <p className="text-xs font-bold flex items-center space-x-1.5">
                      <span>{language === 'hi' ? 'स्मार्ट ऑडियो गाइड (AI स्पीच)' : 'Smart AI Audio Guide'}</span>
                      {isPlayingAudio && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                    </p>
                    <p className="text-[11px] text-white/70">
                      {isPlayingAudio
                        ? (language === 'hi' ? 'ऑडियो चल रहा है...' : 'Narrating historical records...')
                        : (language === 'hi' ? 'इतिहास सुनने के लिए प्ले दबाएं' : 'Click to listen to AI voice tour')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onOpenScanner}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold border border-white/20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Scan for Damage</span>
                </button>
              </div>

            </div>

            {/* Right Column: Quick Stats & Booking Card */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">

              {/* Rating & Heritage Pressure Gauge */}
              <div className="bg-[#F8F6F0] p-5 rounded-2xl border border-[#0D3B2E]/10 space-y-4">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#1A2621]/60 font-semibold uppercase">Rating & Footfall</p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-lg font-bold text-[#0D3B2E]">{monument.rating}</span>
                      <span className="text-xs text-gray-500">({monument.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-[#1A2621]/60 font-semibold uppercase">Condition Status</p>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {monument.deteriorationStatus}
                    </span>
                  </div>
                </div>

                {/* Heritage Pressure Meter (Live Backend Source) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-[#0D3B2E] flex items-center space-x-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Heritage Pressure Score (HPS)</span>
                    </span>
                    {isLoadingTelemetry ? (
                      <span className="inline-block w-12 h-4 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      <span className="font-mono font-bold text-red-700">
                        {effectivePressureScore}/100
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                    {isLoadingTelemetry ? (
                      <div className="h-full bg-gray-300 animate-pulse w-1/2 rounded-full" />
                    ) : (
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${effectivePressureScore > 75
                            ? 'bg-gradient-to-r from-amber-500 to-red-600'
                            : effectivePressureScore > 50
                              ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        style={{ width: `${effectivePressureScore}%` }}
                      />
                    )}
                  </div>
                  <p className="text-[10px] text-[#1A2621]/60 mt-1 leading-tight">
                    Live structural pressure assessment from backend AI (calibrated on footfall load, weathering, and material wear).
                  </p>
                </div>

                {/* Timings & Entry Ticket Fee (Live Backend Source) */}
                <div className="pt-3 border-t border-[#0D3B2E]/10 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-semibold">Opening Hours</span>
                    {isLoadingTelemetry ? (
                      <span className="inline-block w-24 h-4 bg-gray-200 animate-pulse rounded mt-0.5" />
                    ) : (
                      <span className="font-medium text-[#0D3B2E]">{effectiveOperatingHours}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-semibold">Entry Ticket</span>
                    <span className="font-bold text-[#0D3B2E]">₹{monument.entryFee.indian} (Indian) / ₹{monument.entryFee.foreigner}</span>
                  </div>
                </div>

              </div>

              {/* Best Visiting Window AI Box (Live Backend Model best_time) */}
              <div className="bg-gradient-to-br from-[#0D3B2E] to-[#165342] text-white p-4 rounded-2xl shadow-md border border-[#D4AF37]/30">
                <div className="flex items-center space-x-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Recommended Visiting Window</span>
                </div>
                {isLoadingTelemetry ? (
                  <div className="h-7 w-40 bg-white/20 animate-pulse rounded my-1" />
                ) : (
                  <p className="text-lg font-bold font-mono text-white mb-1">
                    {effectiveBestWindow.start} – {effectiveBestWindow.end}
                  </p>
                )}
                <p className="text-xs text-white/80 leading-relaxed">
                  {language === 'hi'
                    ? `${effectiveBestWindow.start} से ${effectiveBestWindow.end} के दौरान न्यूनतम भीड़ और सुखद तापमान रहता है।`
                    : `Optimal visiting window calculated by AI crowd model to ensure shortest checkpoint queues and lowest vibration load.`}
                </p>
              </div>

            </div>

          </div>

          {/* Today's Crowd Prediction Preview (Compact preview with View Crowd Forecast CTA) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#0D3B2E]/12 shadow-sm space-y-4">

            {/* Header & Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#0D3B2E]/10 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#0D3B2E] font-serif-heritage flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-[#C85A32]" />
                    <span>{language === 'hi' ? 'आज का भीड़ पूर्वानुमान' : "Today's Crowd Prediction"}</span>
                  </h3>
                  {isLoadingTelemetry ? (
                    <span className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${effectiveCrowdLevel === 'Low'
                        ? 'bg-emerald-100 text-emerald-800'
                        : effectiveCrowdLevel === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : effectiveCrowdLevel === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                      {effectiveCrowdLevel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#1A2621]/65 mt-0.5 font-medium">
                  {language === 'hi' ? 'दिन भर में अनुमानित आगंतुक घनत्व' : 'Predicted visitor density throughout the day'}
                </p>
              </div>

              {/* Status Chips */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block font-semibold uppercase">Real-time Footfall</span>
                  <span className="font-bold text-[#0D3B2E] font-mono-stat">
                    {isLoadingTelemetry ? (
                      <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      `${currentHourFootfall.toLocaleString()} visitors`
                    )}
                  </span>
                </div>
                <div className="h-7 w-[1px] bg-gray-200" />
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block font-semibold uppercase">Safe Capacity</span>
                  <span className="font-bold text-gray-700 font-mono-stat">
                    {isLoadingTelemetry ? (
                      <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      effectiveSafeCapacity.toLocaleString()
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Preview Insights Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#0D3B2E]/10 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span className="text-gray-600 font-medium">Best Upcoming Slot:</span>
                </div>
                <span className="font-bold text-[#0D3B2E] font-mono-stat">
                  {bestUpcomingSlotStr}
                </span>
              </div>

              <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#0D3B2E]/10 flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Crowd Density Legend:</span>
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Low</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Mod</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Peak</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Hourly Footfall Bars Preview (Directly from backend predictions) */}
            <div className="pt-2">
              {isLoadingTelemetry ? (
                <div className="flex items-center justify-center py-8 space-x-2 text-xs text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0D3B2E]" />
                  <span>Loading live hourly predictions from AI engine...</span>
                </div>
              ) : liveCrowd?.predictions && liveCrowd.predictions.length > 0 ? (
                <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#0D3B2E]/20 scrollbar-track-gray-100 rounded-xl px-1">
                  <div className="flex items-end gap-2.5 min-w-full">
                    {liveCrowd.predictions.map((p: HourlyPrediction, i: number) => {
                      const slotHour = parseInt(p.time.split(':')[0], 10);
                      const isNow = currentHour === slotHour;
                      const isPeak = p.crowd_percent > 75;

                      return (
                        <div key={i} className="flex-1 min-w-[58px] max-w-[85px] flex flex-col items-center shrink-0">
                          <div className={`w-full bg-[#F8F6F0] h-20 rounded-lg flex flex-col justify-end p-1 relative overflow-hidden border ${isNow ? 'border-[#0D3B2E] ring-2 ring-[#0D3B2E]/30' : 'border-[#0D3B2E]/10'}`}>
                            <div
                              className={`w-full rounded-md transition-all ${isPeak
                                  ? 'bg-gradient-to-t from-red-600 to-red-400'
                                  : p.crowd_percent > 45
                                    ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                                    : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                                }`}
                              style={{ height: `${Math.max(15, Math.min(100, p.crowd_percent))}%` }}
                            />
                            {isNow ? (
                              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[7px] font-black text-[#08281E] bg-[#D4AF37] px-1 rounded uppercase tracking-wider whitespace-nowrap">
                                Now
                              </span>
                            ) : isPeak ? (
                              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[7.5px] font-bold text-red-700 bg-red-100 px-1 rounded whitespace-nowrap">
                                Peak
                              </span>
                            ) : null}
                          </div>
                          <span className={`text-[10px] font-mono-stat mt-1 font-semibold whitespace-nowrap ${isNow ? 'text-[#0D3B2E] font-black' : 'text-[#1A2621]/70'}`}>
                            {p.time}
                          </span>
                          <span className="text-[9.5px] text-gray-500 font-mono whitespace-nowrap">
                            {p.expected_visitors.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-gray-500">
                  {telemetryError || 'Hourly predictions unavailable'}
                </div>
              )}
            </div>

            {/* Primary Action Button: View Crowd Forecast */}
            <div className="pt-3 border-t border-[#0D3B2E]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-gray-500 font-medium">
                {language === 'hi'
                  ? '7-दिनों का विस्तृत घंटेवार पूर्वानुमान व हेरिटेज प्रेशर रिपोर्ट देखें।'
                  : 'Explore multi-day predicted footfall, hourly simulation curves & heritage preservation impact.'}
              </p>

              <button
                onClick={() => {
                  if (onOpenCrowdForecast) {
                    onOpenCrowdForecast(monument);
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#0D3B2E] hover:bg-[#08281E] text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <span>{language === 'hi' ? 'भीड़ पूर्वानुमान देखें' : 'View Crowd Forecast'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>
            </div>

          </div>

          {/* Historical Significance & Architectural Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-[#F8F6F0] p-5 rounded-2xl border border-[#0D3B2E]/10">
              <h3 className="text-base font-bold text-[#0D3B2E] font-serif-heritage mb-3 flex items-center space-x-2">
                <Info className="w-4 h-4 text-[#C85A32]" />
                <span>{language === 'hi' ? 'ऐतिहासिक विवरण' : 'Historical Overview & Archives'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#1A2621]/80 leading-relaxed mb-3">
                {language === 'hi' ? monument.hindiDescription : monument.description}
              </p>
              <p className="text-xs text-[#1A2621]/70 leading-relaxed italic border-l-2 border-[#D4AF37] pl-3">
                {monument.historicalSignificance}
              </p>
            </div>

            <div className="bg-[#F8F6F0] p-5 rounded-2xl border border-[#0D3B2E]/10">
              <h3 className="text-base font-bold text-[#0D3B2E] font-serif-heritage mb-3">
                {language === 'hi' ? 'वास्तुकला की मुख्य विशेषताएं' : 'Architectural Highlights'}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#1A2621]/80">
                {monument.architectureHighlights.map((hl, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </li>
                ))}
                {monument.acousticFeatures && (
                  <li className="flex items-start space-x-2 text-[#0D3B2E] font-semibold bg-[#0D3B2E]/5 p-2 rounded-lg mt-2">
                    <Volume2 className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                    <span>{monument.acousticFeatures}</span>
                  </li>
                )}
              </ul>
            </div>

          </div>

          {/* Alternative Sites Recommendation Section (Key Requirement!) */}
          {monument.alternativeSites.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
              <div className="flex items-center space-x-2 mb-2">
                <Compass className="w-5 h-5 text-[#C85A32]" />
                <h3 className="text-base font-bold text-[#0D3B2E]">
                  {language === 'hi'
                    ? 'पर्यावरण-अनुकूल वैकल्पिक स्मारक (भीड़ से बचें)'
                    : 'Recommended Sustainable Alternative Sites'}
                </h3>
              </div>
              <p className="text-xs text-[#1A2621]/70 mb-4 max-w-2xl">
                When popular sites like {monument.name} experience heavy footfall, visiting these nearby cultural gems promotes sustainable tourism and ensures a relaxed, undisturbed visit.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {monument.alternativeSites.map((alt) => (
                  <div
                    key={alt.id}
                    className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-[#0D3B2E]">{alt.name}</h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          HPS: {alt.pressureScore} (Low Strain)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-[#C85A32]" />
                        <span>{alt.location} ({alt.distanceKm} km away)</span>
                      </p>
                      <p className="text-xs text-[#1A2621]/80 leading-relaxed mb-3">
                        {alt.whyVisit}
                      </p>
                    </div>

                    <button
                      onClick={() => onSelectAlternative(alt.id)}
                      className="w-full py-2 bg-[#0D3B2E] hover:bg-[#08281E] text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <span>Explore this Alternative Site</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        <div className="sticky bottom-0 z-30 bg-[#F8F6F0] px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#0D3B2E]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#1A2621]/70 text-center sm:text-left">
            <span>Help protect our national heritage. Follow ASI photography & cordoned line rules.</span>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl border border-[#0D3B2E]/20 text-xs font-semibold text-[#0D3B2E] hover:bg-white transition-colors cursor-pointer text-center"
            >
              Close
            </button>
            <button
              onClick={onOpenScanner}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c59b27] text-[#08281E] text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-center"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">Launch AI Scanner</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
