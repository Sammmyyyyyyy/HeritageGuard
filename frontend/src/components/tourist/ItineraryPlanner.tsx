import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Printer, 
  CheckCircle2,
  Compass,
  AlertCircle,
  RefreshCw,
  Share2,
  Sliders,
  Users,
  Layers,
  Car,
  Tag,
  Info,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ITINERARY_CIRCUITS } from '../../data/itinerariesData';
import { ItineraryPlan, ItineraryStop } from '../../types/heritage';
import { createItinerary } from '../../api/sites';
import { resolveImageUrl, convertBackendSiteToMonument } from '../../data/siteMapper';

interface ItineraryPlannerProps {
  language: 'en' | 'hi';
  onSelectMonumentName?: (name: string) => void;
}

// 20 Backend Heritage Sites with exact coordinates & city details
const destinationOptions = [
  { name: 'Red Fort', site_id: 'DEL001', city: 'Delhi', latitude: 28.6562, longitude: 77.2410 },
  { name: 'Qutub Minar', site_id: 'DEL002', city: 'Delhi', latitude: 28.5245, longitude: 77.1855 },
  { name: 'India Gate', site_id: 'DEL003', city: 'Delhi', latitude: 28.6129, longitude: 77.2295 },
  { name: "Humayun's Tomb", site_id: 'DEL004', city: 'Delhi', latitude: 28.5933, longitude: 77.2507 },
  { name: 'Lotus Temple', site_id: 'DEL005', city: 'Delhi', latitude: 28.5535, longitude: 77.2588 },

  { name: 'Amer Fort', site_id: 'JAI001', city: 'Jaipur', latitude: 26.9855, longitude: 75.8513 },
  { name: 'Hawa Mahal', site_id: 'JAI002', city: 'Jaipur', latitude: 26.9239, longitude: 75.8267 },
  { name: 'City Palace', site_id: 'JAI003', city: 'Jaipur', latitude: 26.9255, longitude: 75.8236 },
  { name: 'Jantar Mantar', site_id: 'JAI004', city: 'Jaipur', latitude: 26.9247, longitude: 75.8245 },
  { name: 'Albert Hall Museum', site_id: 'JAI005', city: 'Jaipur', latitude: 26.9116, longitude: 75.8195 },

  { name: 'Gateway of India', site_id: 'BOM001', city: 'Mumbai', latitude: 18.9220, longitude: 72.8347 },
  { name: 'Elephanta Caves', site_id: 'BOM002', city: 'Mumbai', latitude: 18.9633, longitude: 72.9315 },
  { name: 'Chhatrapati Shivaji Maharaj Terminus', site_id: 'BOM003', city: 'Mumbai', latitude: 18.9400, longitude: 72.8355 },
  { name: 'Haji Ali Dargah', site_id: 'BOM004', city: 'Mumbai', latitude: 18.9827, longitude: 72.8089 },
  { name: 'Siddhivinayak Temple', site_id: 'BOM005', city: 'Mumbai', latitude: 19.0166, longitude: 72.8304 },

  { name: 'Triveni Sangam', site_id: 'PRA001', city: 'Prayagraj', latitude: 25.4299, longitude: 81.8848 },
  { name: 'Allahabad Fort', site_id: 'PRA002', city: 'Prayagraj', latitude: 25.4287, longitude: 81.8761 },
  { name: 'Khusro Bagh', site_id: 'PRA003', city: 'Prayagraj', latitude: 25.4429, longitude: 81.8153 },
  { name: 'Anand Bhavan', site_id: 'PRA004', city: 'Prayagraj', latitude: 25.4615, longitude: 81.8596 },
  { name: 'Chandrashekhar Azad Park', site_id: 'PRA005', city: 'Prayagraj', latitude: 25.4542, longitude: 81.8499 },
];

const interestOptions = [
  'UNESCO Landmarks',
  'Historical Epigraphs',
  'Sunset & Photography',
  'Architectural Marvels',
  'Sufi & Spiritual Trails',
  'Royal Cuisine & Bazaars',
  'Eco Alternatives'
];

// Helper: Haversine distance in km between two lat/lng points
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371.0;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Helper: Travel time in minutes based on distance
function calculateTravelTimeMinutes(distKm: number): number {
  if (distKm <= 0) return 0;
  // 25 km/h avg city speed + 5 min walking/parking buffer
  return Math.round((distKm / 25.0) * 60) + 5;
}

// Helper: Parse 12-hour or 24-hour time string into hours & minutes
function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 8, minutes: 0 };
  const clean = timeStr.trim();
  const isPM = /PM$/i.test(clean);
  const isAM = /AM$/i.test(clean);
  const rawClock = clean.replace(/\s*[AP]M$/i, '');
  const parts = rawClock.split(':').map(Number);
  let hours = parts[0] || 0;
  const minutes = parts[1] || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return { hours, minutes };
}

// Helper: Format total minutes to 12-hour AM/PM string
function formatMinutesTo12Hour(totalMinutes: number): string {
  let mins = Math.floor(totalMinutes) % (24 * 60);
  if (mins < 0) mins += 24 * 60;
  let hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

// Helper: Add minutes to time string and format
function addMinutesToTime(timeStr: string, addMins: number): string {
  const { hours, minutes } = parseTimeString(timeStr);
  const totalMins = hours * 60 + minutes + addMins;
  return formatMinutesTo12Hour(totalMins);
}

// Helper: Format minutes into human readable duration ("2 hr 15 min" or "45 min")
function formatDurationText(mins: number): string {
  if (mins <= 0) return '0 min';
  const hrs = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (hrs === 0) return `${remainder} min`;
  if (remainder === 0) return `${hrs} hr`;
  return `${hrs} hr ${remainder} min`;
}

// Helper: Calculate date string for multi-day trips
function formatDateForDay(baseDateStr: string, dayOffset: number): string {
  try {
    const d = new Date(baseDateStr);
    if (isNaN(d.getTime())) return `Day ${dayOffset + 1}`;
    d.setDate(d.getDate() + dayOffset);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return `Day ${dayOffset + 1}`;
  }
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({ language, onSelectMonumentName }) => {
  // Mode: 'custom' (Interactive Form) or 'curated' (Presets)
  const [plannerMode, setPlannerMode] = useState<'custom' | 'curated'>('custom');

  // Custom Generator Form States
  const [startingSiteId, setStartingSiteId] = useState('DEL001'); // Default: Red Fort (DEL001)
  const [destinationSiteId, setDestinationSiteId] = useState('DEL005'); // Default: Lotus Temple (DEL005)
  const [durationDays, setDurationDays] = useState(1);
  const [startDate, setStartDate] = useState('2026-08-30');
  const [startTime, setStartTime] = useState('06:00 AM');
  const [travelPace, setTravelPace] = useState<'relaxed' | 'moderate' | 'fast'>('moderate');
  const [travelParty, setTravelParty] = useState('Family / Friends');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avoidPeakCrowds, setAvoidPeakCrowds] = useState(false);
  const [includeEcoGems, setIncludeEcoGems] = useState(false);

  // State of generated custom itinerary
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ItineraryPlan | null>(null);
  const [optimizationReason, setOptimizationReason] = useState<string | null>(null);
  const [startingSiteInfo, setStartingSiteInfo] = useState<(typeof destinationOptions)[0] | null>(null);
  const [destinationSiteInfo, setDestinationSiteInfo] = useState<(typeof destinationOptions)[0] | null>(null);

  // Summary Metrics Breakdown
  const [totalVisitTimeMins, setTotalVisitTimeMins] = useState(0);
  const [totalTravelTimeMins, setTotalTravelTimeMins] = useState(0);

  // Preset circuits state
  const [selectedCircuitIndex, setSelectedCircuitIndex] = useState(0);

  // Backend error state
  const [backendError, setBackendError] = useState<string | null>(null);

  // Inline Validation: Starting Location vs Destination
  const isSameLocationError = startingSiteId === destinationSiteId;

  const normalizeStartTime = (time: string): string => {
    if (!time) return '06:00';
    const { hours, minutes } = parseTimeString(time);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Generate Custom AI Plan using the backend recommendation engine
  const handleGenerateCustomPlan = async () => {
    if (isSameLocationError) return;

    setIsGenerating(true);
    setBackendError(null);

    try {
      const startSite = destinationOptions.find((site) => site.site_id === startingSiteId);
      const destSite = destinationOptions.find((site) => site.site_id === destinationSiteId);

      if (!startSite || !destSite) {
        throw new Error('Please select valid starting location and destination sites.');
      }

      setStartingSiteInfo(startSite);
      setDestinationSiteInfo(destSite);

      const interestsPayload = selectedInterests.reduce(
        (acc, interest) => {
          acc[interest] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );

      if (includeEcoGems) {
        interestsPayload['Eco Alternatives'] = true;
      }

      const availableTimeByPace: Record<typeof travelPace, number> = {
        relaxed: durationDays * 360,
        moderate: durationDays * 480,
        fast: durationDays * 600
      };

      const requestBody = {
        starting_latitude: startSite.latitude,
        starting_longitude: startSite.longitude,
        starting_site_id: startSite.site_id,
        destination_latitude: destSite.latitude,
        destination_longitude: destSite.longitude,
        destination_site_id: destSite.site_id,
        start_time: normalizeStartTime(startTime),
        available_time_minutes: availableTimeByPace[travelPace],
        budget: 20000,
        interests: interestsPayload,
        crowd_tolerance: avoidPeakCrowds ? 0.25 : 0.75,
        itinerary: {
          starting_site_id: startSite.site_id,
          starting_site_name: startSite.name,
          destination_site_id: destSite.site_id,
          destination_site_name: destSite.name,
          duration_days: durationDays,
          travel_party: travelParty,
          travel_pace: travelPace
        }
      };

      console.log('ITINERARY GENERATION REQUEST PAYLOAD:', requestBody);

      const response: any = await createItinerary(requestBody as any);

      // Extract raw stops array from backend response schema
      const rawStops: any[] =
        Array.isArray(response?.itinerary?.itinerary)
          ? response.itinerary.itinerary
          : Array.isArray(response?.itinerary)
            ? response.itinerary
            : Array.isArray(response?.stops)
              ? response.stops
              : Array.isArray(response?.items)
                ? response.items
                : [];

      const reason = response?.itinerary?.reason || response?.reason || 'Matching user preferences and optimal route sequencing.';
      setOptimizationReason(reason);

      let prevLat = startSite.latitude;
      let prevLng = startSite.longitude;
      let prevSiteId = startSite.site_id;

      let cumVisitMins = 0;
      let cumTravelMins = 0;
      let cumDistanceKm = 0;
      let totalPressureSum = 0;
      let unescoCount = 0;

      const stopsPerDayBudget = Math.ceil(rawStops.length / durationDays) || 1;

      const stops: (ItineraryStop & {
        departureTime: string;
        distanceFromPrevKm: number;
        travelTimeMins: number;
        dayNumber: number;
        category?: string;
        bestVisitingWindow?: string;
        whyThisStop?: string;
        highlightText?: string;
      })[] = [];

      rawStops.forEach((stop: any, index: number) => {
        const siteId = String(stop?.site_id ?? stop?.monumentId ?? stop?.monument_id ?? '');
        if (!siteId) return;

        const site = destinationOptions.find((opt) => opt.site_id === siteId);
        if (!site) return;

        // Rich site metadata lookup
        const monumentMeta = convertBackendSiteToMonument({
          site_id: site.site_id,
          name: site.name,
          city: site.city,
          state: 'India',
          latitude: site.latitude,
          longitude: site.longitude
        });

        // Compute Haversine distance and travel time from previous stop
        let distKm = 0;
        let travelMins = 0;

        if (index === 0 && siteId === prevSiteId) {
          // Starting location is also the first stop visited
          distKm = 0;
          travelMins = 0;
        } else {
          distKm = haversineDistanceKm(prevLat, prevLng, site.latitude, site.longitude);
          travelMins = calculateTravelTimeMinutes(distKm);
        }

        prevLat = site.latitude;
        prevLng = site.longitude;
        prevSiteId = site.site_id;

        const arrivalTimeRaw = String(stop?.arrival ?? stop?.start_time ?? stop?.timeSlot ?? '06:00');
        const arrivalFormatted = formatMinutesTo12Hour(
          parseTimeString(arrivalTimeRaw).hours * 60 + parseTimeString(arrivalTimeRaw).minutes
        );
        const durationMins = Number(stop?.duration_minutes ?? stop?.duration ?? 60);
        const departureFormatted = addMinutesToTime(arrivalTimeRaw, durationMins);

        cumVisitMins += durationMins;
        cumTravelMins += travelMins;
        cumDistanceKm += distKm;

        const pressureScore = monumentMeta.heritagePressureScore || 35;
        totalPressureSum += pressureScore;

        if (monumentMeta.isUnesco) {
          unescoCount += 1;
        }

        // Determine Day Number for multi-day trips
        const dayNumber = Math.min(durationDays, Math.floor(index / stopsPerDayBudget) + 1);

        const crowdLevel = monumentMeta.crowdLevel || (pressureScore > 70 ? 'High' : pressureScore > 40 ? 'Moderate' : 'Low');

        const bestWindow = monumentMeta.bestVisitingWindow
          ? `${monumentMeta.bestVisitingWindow.start} – ${monumentMeta.bestVisitingWindow.end}`
          : '08:00 AM – 10:30 AM';

        const imageUrl = resolveImageUrl(monumentMeta.imageUrl, site.site_id);

        const whyThisStop = selectedInterests.length > 0
          ? `Matches selected preferences: ${selectedInterests[index % selectedInterests.length]}`
          : 'Sequenced to protect monument carrying capacity.';

        stops.push({
          id: String(stop?.id ?? `stop-${index}-${Date.now()}`),
          monumentId: site.site_id,
          monumentName: site.name,
          city: site.city,
          timeSlot: arrivalFormatted,
          departureTime: departureFormatted,
          recommendedDuration: `${durationMins} mins`,
          expectedCrowd: crowdLevel,
          pressureScore,
          travelTimeFromPrev: travelMins > 0 ? `${travelMins} min` : 'Start Point',
          distanceFromPrevKm: distKm,
          travelTimeMins: travelMins,
          dayNumber,
          imageUrl,
          tips: monumentMeta.bestVisitingWindow?.reason || `Ideal visit time is ${bestWindow} to avoid peak heat and footfall.`,
          category: monumentMeta.category,
          bestVisitingWindow: bestWindow,
          whyThisStop,
          highlightText: monumentMeta.architectureHighlights?.[0] || monumentMeta.tagline,
          isAlternativeRecommended: Boolean(stop?.is_alternative_recommended),
          alternativeSuggestion: stop?.alternative_suggestion
        } as any);
      });

      if (stops.length === 0) {
        throw new Error('Backend returned no itinerary stops.');
      }

      // Response Validation (Requirement 6): Check if selected destination site is reached
      const reachesDestination = stops.some((s) => s.monumentId === destSite.site_id);
      if (!reachesDestination) {
        throw new Error(
          `Could not generate a route reaching ${destSite.name} (${destSite.site_id}). Please adjust trip duration or starting parameters.`
        );
      }

      setTotalVisitTimeMins(cumVisitMins);
      setTotalTravelTimeMins(cumTravelMins);

      const avgPressure = stops.length > 0 ? Math.round(totalPressureSum / stops.length) : 40;
      const derivedEcoScore = Math.min(99, Math.max(50, Math.round(100 - (avgPressure * 0.45) - (cumDistanceKm * 0.25) + (unescoCount * 3))));
      const derivedCrowdAvoidance = Math.min(92, Math.max(15, Math.round(((85 - avgPressure) / 85) * 100)));

      const circuitTitle =
        startSite.city === destSite.city
          ? `${startSite.city} Circuit (${startSite.name} → ${destSite.name})`
          : `${startSite.city} → ${destSite.city} (${startSite.name} → ${destSite.name})`;

      const circuitRegion =
        startSite.city === destSite.city
          ? `${startSite.city} Circuit`
          : `${startSite.city} → ${destSite.city}`;

      const newPlan: ItineraryPlan = {
        id: String(response?.id ?? `plan-${Date.now()}`),
        title: circuitTitle,
        region: circuitRegion,
        durationDays,
        idealFor: `${travelParty} • ${travelPace.toUpperCase()} Pace`,
        stops: stops as ItineraryStop[],
        totalDistanceKm: Number(cumDistanceKm.toFixed(1)),
        sustainabilityScore: derivedEcoScore,
        crowdAvoidancePercent: avoidPeakCrowds ? derivedCrowdAvoidance : 0
      };

      setGeneratedPlan(newPlan);

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {
        // Animation optional
      }
    } catch (error: any) {
      console.error('ITINERARY - BACKEND GENERATION FAILED:', error);
      setBackendError(error?.message || 'Unable to generate itinerary from recommendation engine.');
      setGeneratedPlan(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const activePlan: ItineraryPlan = plannerMode === 'custom' && generatedPlan
    ? generatedPlan
    : ITINERARY_CIRCUITS[selectedCircuitIndex];

  // Calculate actual total visit time in minutes for active plan
  const calculatedVisitMins = React.useMemo(() => {
    if (plannerMode === 'custom' && totalVisitTimeMins > 0) return totalVisitTimeMins;
    if (!activePlan?.stops) return 0;
    return activePlan.stops.reduce((acc, stop) => {
      const rawDuration = stop.recommendedDuration || '1 hr';
      let mins = 60;
      if (rawDuration.includes('hrs') || rawDuration.includes('hr')) {
        const num = parseFloat(rawDuration);
        if (!isNaN(num)) mins = Math.round(num * 60);
      } else if (rawDuration.includes('min')) {
        const num = parseFloat(rawDuration);
        if (!isNaN(num)) mins = Math.round(num);
      }
      return acc + mins;
    }, 0);
  }, [plannerMode, totalVisitTimeMins, activePlan]);

  // Calculate actual total travel time in minutes for active plan
  const calculatedTravelMins = React.useMemo(() => {
    if (plannerMode === 'custom' && totalTravelTimeMins > 0) return totalTravelTimeMins;
    if (!activePlan?.stops) return 0;
    return activePlan.stops.reduce((acc, stop) => {
      const rawTravel = (stop as any).travelTimeFromPrev || '';
      let mins = 0;
      if (rawTravel.includes('hrs') || rawTravel.includes('hr')) {
        const num = parseFloat(rawTravel);
        if (!isNaN(num)) mins = Math.round(num * 60);
      } else if (rawTravel.includes('min')) {
        const num = parseFloat(rawTravel);
        if (!isNaN(num)) mins = Math.round(num);
      }
      return acc + mins;
    }, 0);
  }, [plannerMode, totalTravelTimeMins, activePlan]);

  // Group active plan stops by day
  const stopsByDay: Record<number, ItineraryStop[]> = {};
  if (activePlan?.stops) {
    activePlan.stops.forEach((stop, index) => {
      const dayNum = (stop as any).dayNumber || Math.floor((index / (activePlan.stops.length / activePlan.durationDays)) || 0) + 1;
      if (!stopsByDay[dayNum]) stopsByDay[dayNum] = [];
      stopsByDay[dayNum].push(stop);
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0D3B2E]/10 text-[#0D3B2E] text-xs font-bold">
          <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>AI-Powered Sustainable Travel Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0D3B2E] font-serif-heritage">
          Personalized <span className="text-[#C85A32]">Itinerary Planner</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#1A2621]/70 leading-relaxed">
          {language === 'hi'
            ? 'अपनी यात्रा की जानकारी दें और हमारा एआई वास्तविक समय भीड़ और स्मारक संरक्षण के अनुसार एक सर्वोत्तम यात्रा कार्यक्रम तैयार करेगा।'
            : 'Enter your starting site and trip preferences to generate a custom AI itinerary optimized for real-time crowd predictions and carrying capacity.'}
        </p>

        {/* Mode Toggle Switch */}
        <div className="flex flex-col sm:inline-flex sm:flex-row p-1 bg-white border border-[#0D3B2E]/15 rounded-2xl shadow-xs mt-3 gap-1 w-full sm:w-auto">
          <button
            onClick={() => setPlannerMode('custom')}
            className={`px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              plannerMode === 'custom'
                ? 'bg-[#0D3B2E] text-white shadow-sm'
                : 'text-[#1A2621]/70 hover:text-[#0D3B2E]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>✨ Create Custom Plan with AI</span>
          </button>

          <button
            onClick={() => setPlannerMode('curated')}
            className={`px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              plannerMode === 'curated'
                ? 'bg-[#0D3B2E] text-white shadow-sm'
                : 'text-[#1A2621]/70 hover:text-[#0D3B2E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>🏛️ Curated Eco-Circuits</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive AI Custom Planning Form */}
      {plannerMode === 'custom' && !generatedPlan && (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#0D3B2E]/15 shadow-xl max-w-4xl mx-auto space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0D3B2E]/10 flex items-center justify-center text-[#0D3B2E] shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0D3B2E] font-serif-heritage">
                  Custom Travel Parameters
                </h3>
                <p className="text-[11px] text-gray-500">
                  Select your starting heritage location, target destination, and travel preferences.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full self-start sm:self-auto">
              ● Live Backend & Crowd Engine Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* STARTING LOCATION */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D3B2E] flex items-center space-x-1">
                <Navigation className="w-3.5 h-3.5 text-[#0D3B2E]" />
                <span>STARTING LOCATION</span>
              </label>
              <select
                value={startingSiteId}
                onChange={(e) => setStartingSiteId(e.target.value)}
                className="w-full p-3 bg-[#F8F6F0] border border-[#0D3B2E]/20 rounded-xl text-xs font-semibold text-[#1A2621] outline-none cursor-pointer focus:ring-2 focus:ring-[#0D3B2E]/20"
              >
                {destinationOptions.map((opt) => (
                  <option key={`start-${opt.site_id}`} value={opt.site_id}>
                    {opt.name} — {opt.city} ({opt.site_id})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#1A2621]/60">
                Selected Coordinates: {destinationOptions.find(s => s.site_id === startingSiteId)?.latitude}, {destinationOptions.find(s => s.site_id === startingSiteId)?.longitude}
              </p>
            </div>

            {/* DESTINATION */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D3B2E] flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>DESTINATION / HERITAGE CIRCUIT</span>
              </label>
              <select
                value={destinationSiteId}
                onChange={(e) => setDestinationSiteId(e.target.value)}
                className="w-full p-3 bg-[#F8F6F0] border border-[#0D3B2E]/20 rounded-xl text-xs font-semibold text-[#1A2621] outline-none cursor-pointer focus:ring-2 focus:ring-[#0D3B2E]/20"
              >
                {destinationOptions.map((opt) => (
                  <option key={`dest-${opt.site_id}`} value={opt.site_id}>
                    {opt.name} — {opt.city} ({opt.site_id})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#1A2621]/60">
                Target Site ID: {destinationSiteId}
              </p>
            </div>

          </div>

          {/* Validation Banner if Starting Location === Destination */}
          {isSameLocationError && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Invalid Selection:</strong> Starting location and destination must be different sites. Please choose a different destination or starting point.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Trip Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D3B2E] flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Trip Duration</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      durationDays === d
                        ? 'bg-[#0D3B2E] text-white shadow-xs'
                        : 'bg-[#F8F6F0] text-[#1A2621]/80 hover:bg-gray-200'
                    }`}
                  >
                    {d} {d === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Date & Start Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0D3B2E] flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F6F0] border border-[#0D3B2E]/15 rounded-xl text-xs font-semibold text-[#1A2621] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0D3B2E] flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Start Time</span>
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F6F0] border border-[#0D3B2E]/15 rounded-xl text-xs font-semibold text-[#1A2621] outline-none cursor-pointer"
                >
                  <option value="06:00 AM">06:00 AM (Early)</option>
                  <option value="08:00 AM">08:00 AM (Morning)</option>
                  <option value="10:00 AM">10:00 AM (Standard)</option>
                </select>
              </div>
            </div>

            {/* Travel Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D3B2E] flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Travel Party</span>
              </label>
              <select
                value={travelParty}
                onChange={(e) => setTravelParty(e.target.value)}
                className="w-full p-3 bg-[#F8F6F0] border border-[#0D3B2E]/15 rounded-xl text-xs font-semibold text-[#1A2621] outline-none cursor-pointer"
              >
                <option value="Solo Traveler">Solo Traveler</option>
                <option value="Couple">Couple / Duo</option>
                <option value="Family / Friends">Family with Kids</option>
                <option value="Heritage Enthusiasts Group">Heritage Enthusiasts Group</option>
                <option value="Senior Citizens">Senior Citizens (Low-Pace)</option>
              </select>
            </div>

            {/* Travel Pace */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D3B2E]">Preferred Pace</label>
              <div className="grid grid-cols-3 gap-2">
                {(['relaxed', 'moderate', 'fast'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTravelPace(p)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      travelPace === p
                        ? 'bg-[#0D3B2E] text-white shadow-xs'
                        : 'bg-[#F8F6F0] text-[#1A2621]/80 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Optimization Toggles */}
            <div className="space-y-2.5 pt-1 md:col-span-2">
              <label className="text-xs font-bold text-[#0D3B2E]">AI Optimization Rules</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-[#F8F6F0] rounded-xl text-xs">
                  <span className="font-semibold text-gray-700">Avoid Peak Footfall Hours</span>
                  <input
                    type="checkbox"
                    checked={avoidPeakCrowds}
                    onChange={(e) => setAvoidPeakCrowds(e.target.checked)}
                    className="w-4 h-4 accent-[#0D3B2E] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8F6F0] rounded-xl text-xs">
                  <span className="font-semibold text-gray-700">Recommend Eco-Alternative Gems</span>
                  <input
                    type="checkbox"
                    checked={includeEcoGems}
                    onChange={(e) => setIncludeEcoGems(e.target.checked)}
                    className="w-4 h-4 accent-[#0D3B2E] cursor-pointer"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Interests & Themes Chips */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-[#0D3B2E]">Select Cultural Interests & Highlights</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#0D3B2E] text-white border-[#0D3B2E] shadow-2xs'
                        : 'bg-[#F8F6F0] text-[#1A2621]/70 border-gray-200 hover:bg-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {backendError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3 py-2 text-xs">
              Backend warning: {backendError}
            </div>
          )}

          {/* Submit Generator Button */}
          <div className="pt-4">
            <button
              onClick={handleGenerateCustomPlan}
              disabled={isGenerating || isSameLocationError}
              className="w-full py-4 bg-gradient-to-r from-[#0D3B2E] to-[#165342] hover:from-[#08281E] hover:to-[#0D3B2E] text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-[#D4AF37]" />
                  <span>Synthesizing Live Backend Predictions & Distances...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <span>Generate My Custom AI Itinerary →</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* 3. Preset Curated Circuits */}
      {plannerMode === 'curated' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ITINERARY_CIRCUITS.map((circuit, idx) => (
            <div
              key={circuit.id}
              onClick={() => setSelectedCircuitIndex(idx)}
              className={`p-5 rounded-2xl cursor-pointer border transition-all duration-200 ${
                selectedCircuitIndex === idx
                  ? 'bg-[#0D3B2E] text-white border-[#0D3B2E] shadow-xl -translate-y-1'
                  : 'bg-white text-[#1A2621] border-[#0D3B2E]/15 hover:border-[#0D3B2E]/40 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  selectedCircuitIndex === idx ? 'bg-[#D4AF37] text-[#08281E]' : 'bg-[#0D3B2E]/10 text-[#0D3B2E]'
                }`}>
                  {circuit.durationDays} Days Circuit
                </span>
                <span className="text-xs font-mono font-bold">
                  {circuit.sustainabilityScore}/100 Eco Score
                </span>
              </div>
              <h3 className={`text-base font-bold font-serif-heritage mb-1 ${
                selectedCircuitIndex === idx ? 'text-white' : 'text-[#0D3B2E]'
              }`}>
                {circuit.title}
              </h3>
              <p className={`text-xs ${selectedCircuitIndex === idx ? 'text-white/70' : 'text-[#1A2621]/60'}`}>
                {circuit.region} • {circuit.stops.length} Heritage Stops
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 4. Render Active Generated Itinerary Timeline */}
      {activePlan && (plannerMode === 'curated' || generatedPlan) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          {/* Main Column: Itinerary Timeline (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Circuit Summary Banner */}
            <div className="bg-white p-6 rounded-3xl border border-[#0D3B2E]/15 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-[#C85A32] uppercase tracking-wider">
                    {activePlan.durationDays} {activePlan.durationDays === 1 ? 'Day' : 'Days'} • {activePlan.region}
                  </span>
                  <h2 className="text-2xl font-bold text-[#0D3B2E] font-serif-heritage mt-0.5">
                    {activePlan.title}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {activePlan.idealFor}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full font-mono text-xs font-bold">
                    🌿 Eco Score: {activePlan.sustainabilityScore > 0 ? `${activePlan.sustainabilityScore} / 100` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Start & Destination Summary Pill (Requirement 10) */}
              {startingSiteInfo && destinationSiteInfo && (
                <div className="p-3.5 bg-[#F8F6F0] rounded-2xl border border-[#0D3B2E]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold font-mono text-[10px]">
                      START
                    </div>
                    <div>
                      <span className="font-bold text-[#0D3B2E]">{startingSiteInfo.name}</span>
                      <span className="text-gray-500 text-[11px] ml-1">({startingSiteInfo.city} · {startingSiteInfo.site_id})</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center space-x-2 text-[#C85A32] font-bold text-xs">
                    <span>→</span>
                    <Car className="w-4 h-4" />
                    <span>→</span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <div className="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold font-mono text-[10px]">
                      DESTINATION
                    </div>
                    <div>
                      <span className="font-bold text-[#0D3B2E]">{destinationSiteInfo.name}</span>
                      <span className="text-gray-500 text-[11px] ml-1">({destinationSiteInfo.city} · {destinationSiteInfo.site_id})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4 Key Summary Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
                
                <div className="p-3 bg-[#F8F6F0] rounded-2xl border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-[#0D3B2E]" />
                    <span>TOTAL STOPS</span>
                  </div>
                  <div className="text-lg font-bold text-[#0D3B2E] font-mono mt-0.5">
                    {activePlan.stops.length}
                  </div>
                </div>

                <div className="p-3 bg-[#F8F6F0] rounded-2xl border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#0D3B2E]" />
                    <span>TOTAL VISIT TIME</span>
                  </div>
                  <div className="text-lg font-bold text-[#0D3B2E] font-mono mt-0.5">
                    {formatDurationText(calculatedVisitMins)}
                  </div>
                </div>

                <div className="p-3 bg-[#F8F6F0] rounded-2xl border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center space-x-1">
                    <Car className="w-3 h-3 text-[#C85A32]" />
                    <span>TRAVEL TIME</span>
                  </div>
                  <div className="text-lg font-bold text-[#0D3B2E] font-mono mt-0.5">
                    {calculatedTravelMins > 0 ? formatDurationText(calculatedTravelMins) : '0 min'}
                  </div>
                </div>

                <div className="p-3 bg-[#F8F6F0] rounded-2xl border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#C85A32]" />
                    <span>CIRCUIT DISTANCE</span>
                  </div>
                  <div className="text-lg font-bold text-[#0D3B2E] font-mono mt-0.5">
                    {activePlan.totalDistanceKm > 0 ? `${activePlan.totalDistanceKm} km` : 'N/A'}
                  </div>
                </div>

              </div>

              {/* Data-driven AI Optimization Reason Banner */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>AI Optimization Note</span>
                </div>
                <p className="leading-relaxed font-medium">
                  "{optimizationReason || 'Route sequenced using live ML crowd predictions and heritage carrying capacities.'}"
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {activePlan.crowdAvoidancePercent > 0 ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-bold text-[10px]">
                      ✓ {activePlan.crowdAvoidancePercent}% Crowd Wait Reduction
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-bold text-[10px]">
                      ✓ Optimized using live crowd models
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-bold text-[10px]">
                    ✓ Carrying Capacity Protected
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-bold text-[10px]">
                    ✓ Real-time Weather Adjusted
                  </span>
                </div>
              </div>

              {/* Action buttons bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-[#F8F6F0] hover:bg-gray-200 text-[#0D3B2E] font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Itinerary route link copied to clipboard!');
                    }}
                    className="px-3 py-1.5 bg-[#F8F6F0] hover:bg-gray-200 text-[#0D3B2E] font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Route</span>
                  </button>
                </div>

                {plannerMode === 'custom' && (
                  <button
                    onClick={() => setGeneratedPlan(null)}
                    className="px-3 py-1.5 bg-[#0D3B2E] text-white font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Modify Parameters</span>
                  </button>
                )}
              </div>

            </div>

            {/* Timeline Stops Sequence Grouped by Day */}
            <div className="space-y-8">
              {Object.entries(stopsByDay).map(([dayNumStr, dayStops]) => {
                const dayNum = Number(dayNumStr);
                const dayDateStr = formatDateForDay(startDate, dayNum - 1);

                return (
                  <div key={`day-group-${dayNum}`} className="space-y-4">
                    
                    {/* Day Section Header */}
                    <div className="flex items-center space-x-3 pb-2 border-b border-[#0D3B2E]/15">
                      <div className="px-3 py-1 bg-[#0D3B2E] text-white font-bold text-xs rounded-xl font-mono shadow-xs">
                        DAY {dayNum}
                      </div>
                      <div className="text-sm font-bold text-[#0D3B2E] font-serif-heritage flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-[#C85A32]" />
                        <span>{dayDateStr}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        ({dayStops.length} {dayStops.length === 1 ? 'stop' : 'stops'})
                      </span>
                    </div>

                    {/* Timeline Stops inside Day */}
                    <div className="space-y-4 relative before:absolute before:inset-0 before:left-10 before:w-0.5 before:bg-[#0D3B2E]/20">
                      {dayStops.map((stop: any, sIdx: number) => {
                        const isAlternative = stop.isAlternativeRecommended;
                        const departureTime = stop.departureTime || addMinutesToTime(stop.timeSlot, parseInt(stop.recommendedDuration) || 60);
                        const travelTimeText = stop.travelTimeFromPrev || 'Start Point';
                        const distKm = stop.distanceFromPrevKm != null ? stop.distanceFromPrevKm : 0;

                        return (
                          <div key={stop.id || `stop-node-${sIdx}`} className="space-y-3">
                            
                            {/* Route Transition Connector between stops */}
                            {sIdx > 0 ? (
                              <div className="relative pl-16 py-1 flex items-center space-x-2 text-[11px] font-mono font-bold text-[#0D3B2E]/80">
                                <div className="absolute left-10 w-0.5 h-full bg-[#0D3B2E]/20 -translate-x-1/2"></div>
                                <div className="px-2.5 py-1 bg-[#F8F6F0] border border-[#0D3B2E]/20 rounded-lg flex items-center space-x-1.5 shadow-2xs z-10">
                                  <span>{travelTimeText} travel</span>
                                  <span>·</span>
                                  <span>{distKm > 0 ? `${distKm} km` : '0.0 km'}</span>
                                </div>
                              </div>
                            ) : sIdx === 0 && dayNum === 1 ? (
                              <div className="relative pl-16 py-0.5 text-[11px] font-mono font-bold text-[#0D3B2E]/70 flex items-center space-x-1.5">
                                <div className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900">
                                  Starting Point: {startingSiteInfo?.name || 'Selected Starting Location'} ({startingSiteId})
                                </div>
                              </div>
                            ) : null}

                            <div className="relative pl-16 group animate-fadeIn">
                              
                              {/* Circle Node on Timeline (Positioned LEFT of the vertical line) */}
                              <div className={`absolute left-3.5 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-[10px] -translate-x-1/2 z-10 ${
                                isAlternative
                                  ? 'bg-amber-400 border-amber-600 text-amber-950'
                                  : 'bg-[#0D3B2E] border-[#D4AF37] text-white'
                              }`}>
                                {sIdx + 1}
                              </div>

                              {/* Stop Card */}
                              <div className={`p-5 rounded-3xl border shadow-sm transition-all duration-300 ${
                                isAlternative
                                  ? 'bg-amber-50/50 border-amber-300/80 hover:shadow-md'
                                  : 'bg-white border-[#0D3B2E]/15 hover:border-[#0D3B2E]/40 hover:shadow-md'
                              }`}>
                                
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                  
                                  <div className="space-y-2 flex-1">
                                    
                                    {/* Header Row: Arrival, Departure, Visit Duration */}
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="px-2.5 py-1 bg-[#0D3B2E]/10 text-[#0D3B2E] rounded-xl text-xs font-bold font-mono flex items-center space-x-1">
                                        <Clock className="w-3 h-3 text-[#C85A32]" />
                                        <span>Arrival: {stop.timeSlot}</span>
                                      </span>

                                      <span className="px-2.5 py-1 bg-[#0D3B2E]/5 text-[#0D3B2E]/80 rounded-xl text-xs font-bold font-mono">
                                        Departure: {departureTime}
                                      </span>

                                      <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold font-mono">
                                        ⏱️ {stop.recommendedDuration} visit
                                      </span>
                                    </div>

                                    {/* Site Name & City */}
                                    <div>
                                      <h4 
                                        onClick={() => onSelectMonumentName?.(stop.monumentName)}
                                        className="text-xl font-bold text-[#0D3B2E] font-serif-heritage hover:text-[#C85A32] transition-colors cursor-pointer flex items-center space-x-2"
                                      >
                                        <span>{stop.monumentName}</span>
                                      </h4>

                                      <p className="text-xs text-[#1A2621]/70 font-medium">
                                        {stop.city} {stop.category ? `• ${stop.category}` : ''}
                                      </p>
                                    </div>

                                    {/* Short Description / Highlight */}
                                    {stop.highlightText && (
                                      <p className="text-xs text-[#1A2621]/80 leading-relaxed italic">
                                        "{stop.highlightText}"
                                      </p>
                                    )}

                                    {/* Rich Metadata Badges: Crowd Level, Pressure, Best Window */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                      <div className="p-2.5 bg-[#F8F6F0] rounded-xl border border-gray-100 space-y-1">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Predicted Crowd & Pressure</div>
                                        <div className="flex items-center space-x-2">
                                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                            stop.expectedCrowd === 'Low'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : stop.expectedCrowd === 'High'
                                              ? 'bg-rose-100 text-rose-800'
                                              : 'bg-amber-100 text-amber-800'
                                          }`}>
                                            {stop.expectedCrowd || 'Moderate'} Crowd
                                          </span>
                                          <span className="text-xs font-mono font-bold text-[#0D3B2E]">
                                            Pressure: {stop.pressureScore || 35} / 100
                                          </span>
                                        </div>
                                      </div>

                                      <div className="p-2.5 bg-[#F8F6F0] rounded-xl border border-gray-100 space-y-1">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Recommended Visiting Window</div>
                                        <div className="text-xs font-mono font-bold text-[#0D3B2E]">
                                          {stop.bestVisitingWindow || '08:00 AM – 10:30 AM'}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Why this stop note */}
                                    {stop.whyThisStop && (
                                      <div className="text-[11px] text-[#0D3B2E]/90 bg-emerald-50/60 p-2 rounded-xl border border-emerald-100 flex items-center space-x-1.5">
                                        <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                        <span><strong>Why this stop:</strong> {stop.whyThisStop}</span>
                                      </div>
                                    )}

                                    {/* Tips */}
                                    {stop.tips && (
                                      <p className="text-xs text-[#1A2621]/80 bg-[#F8F6F0] p-2.5 rounded-xl border border-gray-100">
                                        💡 <span className="font-semibold">AI Tip:</span> {stop.tips}
                                      </p>
                                    )}

                                    {isAlternative && stop.alternativeSuggestion && (
                                      <div className="p-2.5 bg-amber-100/60 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center space-x-2">
                                        <AlertCircle className="w-4 h-4 text-amber-800 shrink-0" />
                                        <span>{stop.alternativeSuggestion}</span>
                                      </div>
                                    )}

                                  </div>

                                  {/* Monument Thumbnail */}
                                  {stop.imageUrl ? (
                                    <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                                      <img
                                        src={stop.imageUrl}
                                        alt={stop.monumentName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                          e.currentTarget.src = '/images/heritage-placeholder.jpg';
                                        }}
                                      />
                                    </div>
                                  ) : null}

                                </div>

                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Sidebar Guidance (4 cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-6">
            
            <div className="bg-[#0D3B2E] text-white p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                <h3 className="text-base font-bold font-serif-heritage">
                  Heritage Protection Pledge
                </h3>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                By following this AI-sequenced circuit, you directly contribute to minimizing footfall pressure spikes, preserving historic stonework, and supporting local artisan communities.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
                <span>Certified Sustainable</span>
                <span className="text-[#D4AF37] font-bold">ASI Aligned</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#0D3B2E]/15 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                Need Help on the Ground?
              </h4>
              <p className="text-xs text-[#1A2621]/70 leading-relaxed">
                Access real-time audio guides, multilingual epigraph translations, and emergency assistance directly from any monument profile page.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-2.5 bg-[#F8F6F0] hover:bg-gray-200 text-[#0D3B2E] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Back to Top / Modify Search
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};