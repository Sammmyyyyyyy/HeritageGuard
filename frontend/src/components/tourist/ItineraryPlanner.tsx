import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Calendar, 
  Printer, 
  Download, 
  CheckCircle2,
  Navigation,
  Compass,
  AlertCircle,
  Plus,
  RefreshCw,
  Share2,
  Sliders,
  Users,
  Sun,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ITINERARY_CIRCUITS } from '../../data/itinerariesData';
import { ItineraryPlan, ItineraryStop } from '../../types/heritage';
import { createItinerary } from '../../api/sites';

interface ItineraryPlannerProps {
  language: 'en' | 'hi';
  onSelectMonumentName?: (name: string) => void;
}

const interestOptions = [
  'UNESCO Landmarks',
  'Historical Epigraphs',
  'Sunset & Photography',
  'Architectural Marvels',
  'Sufi & Spiritual Trails',
  'Royal Cuisine & Bazaars',
  'Eco Alternatives'
];

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({ language, onSelectMonumentName }) => {
  // Mode: 'custom' (Interactive Form) or 'curated' (Presets)
  const [plannerMode, setPlannerMode] = useState<'custom' | 'curated'>('custom');

  // Custom Generator Form States
  const [destinationRegion, setDestinationRegion] = useState('Red Fort');
  const [durationDays, setDurationDays] = useState(2);
  const [startDate, setStartDate] = useState('2026-08-28');
  const [startTime, setStartTime] = useState('08:00 AM');
  const [travelPace, setTravelPace] = useState<'relaxed' | 'moderate' | 'fast'>('moderate');
  const [travelParty, setTravelParty] = useState('Family / Friends');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'UNESCO Landmarks',
    'Historical Epigraphs',
    'Sunset & Photography'
  ]);
  const [avoidPeakCrowds, setAvoidPeakCrowds] = useState(true);
  const [includeEcoGems, setIncludeEcoGems] = useState(true);

  // State of generated custom itinerary
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ItineraryPlan | null>(null);

  // Preset circuits state
  const [selectedCircuitIndex, setSelectedCircuitIndex] = useState(0);

  // Backend recommendation state
  const [backendError, setBackendError] = useState<string | null>(null);

  // These are the 20 sites currently supported by the project database
  // and the recommendation engine's supported cities.
  // Local images for the 20 supported heritage sites.
  // Put these files in: public/images/
  const SITE_IMAGES: Record<string, string> = {
    DEL001: '/images/red_fort.jpg',
    DEL002: '/images/qutub_minar.jpg',
    DEL003: '/images/india_gate.jpg',
    DEL004: '/images/humayuns_tomb.jpg',
    DEL005: '/images/Lotus_temple.jpg',
    JAI001: '/images/amer_fort.jpg',
    JAI002: '/images/Hawa_mahal.jpg',
    JAI003: '/images/city_palace.jpg',
    JAI004: '/images/jantar_mantar.jpg',
    JAI005: '/images/albert_hall.jpg',
    BOM001: '/images/gate_way_of_india.jpg',
    BOM002: '/images/elephanta_caves.jpg',
    BOM003: '/images/chatrapati_shivaji_maharaj_terminus.jpg',
    BOM004: '/images/Haj_ali_dargaah.jpg',
    BOM005: '/images/sidhivinayak_temple.jpg',
    PRA001: '/images/Triveni_sangam.jpg',
    PRA002: '/images/allahabad_fort.jpg',
    PRA003: '/images/Khusro_bagh.jpg',
    PRA004: '/images/Anand_bhavan.jpg',
    PRA005: '/images/Chandrashekhar_azad_park.jpg'
  };

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

  const normalizeStartTime = (time: string): string => {
    if (!time) return '08:00';
    const trimmed = time.trim();
    if (!/[AaPp][Mm]$/.test(trimmed)) {
      return trimmed;
    }
    const parts = trimmed.split(/\s+/);
    const clock = parts[0];
    const period = parts[1].toUpperCase();
    let [hours, minutes] = clock.split(':').map(Number);

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const normalizeCrowd = (value: unknown): 'Low' | 'Moderate' | 'High' | '' => {
    if (value === null || value === undefined || value === '') return '';

    const crowd = String(value).toLowerCase();
    if (crowd.includes('low')) return 'Low';
    if (crowd.includes('high')) return 'High';
    if (crowd.includes('moderate') || crowd.includes('medium')) return 'Moderate';
    return '';
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Generate Custom AI Plan using the backend recommendation engine.
  const handleGenerateCustomPlan = async () => {
    setIsGenerating(true);
    setBackendError(null);

    try {
      const selectedSite = destinationOptions.find(
        (site) => site.name === destinationRegion
      );

      if (!selectedSite) {
        throw new Error('Please select a valid heritage site.');
      }

      const interests = selectedInterests.reduce(
        (acc, interest) => {
          acc[interest] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );

      if (includeEcoGems) {
        interests['Eco Alternatives'] = true;
      }

      const availableTimeByPace: Record<typeof travelPace, number> = {
        relaxed: 360,
        moderate: 480,
        fast: 600
      };

      const requestBody = {
        starting_latitude: selectedSite.latitude,
        starting_longitude: selectedSite.longitude,
        start_time: normalizeStartTime(startTime),
        available_time_minutes: availableTimeByPace[travelPace],
        budget: 5000,
        interests,
        crowd_tolerance: avoidPeakCrowds ? 0.25 : 0.75,
        itinerary: {
          selected_site_id: selectedSite.site_id,
          selected_site_name: selectedSite.name,
          selected_city: selectedSite.city,
          duration_days: durationDays,
          travel_party: travelParty,
          travel_pace: travelPace
        }
      };

      const response: any = await createItinerary(requestBody as any);

      const rawStops: any[] =
        Array.isArray(response?.stops)
          ? response.stops
          : Array.isArray(response?.itinerary?.itinerary)
            ? response.itinerary.itinerary
            : Array.isArray(response?.itinerary)
              ? response.itinerary
              : Array.isArray(response?.items)
                ? response.items
                : [];

      const stops: ItineraryStop[] = rawStops
        .map((stop: any, index: number) => {
          const monumentId = String(
            stop?.monumentId ??
            stop?.monument_id ??
            stop?.site_id ??
            ''
          );

          if (!monumentId) return null;

          const site = destinationOptions.find(
            (item) => item.site_id === monumentId
          );

          if (!site) {
            console.warn(
              'ITINERARY - UNKNOWN RECOMMENDED SITE:',
              monumentId
            );
            return null;
          }

          const crowd = normalizeCrowd(
            stop?.expectedCrowd ??
            stop?.expected_crowd
          );

          return {
            id: String(
              stop?.id ??
              stop?.stop_id ??
              `backend-stop-${Date.now()}-${index}`
            ),
            monumentId: site.site_id,
            monumentName: site.name,
            city: site.city,
            timeSlot: String(
              stop?.timeSlot ??
              stop?.time_slot ??
              stop?.arrival ??
              stop?.start_time ??
              ''
            ),
            recommendedDuration:
              stop?.duration_minutes != null
                ? `${Number(stop.duration_minutes)} mins`
                : String(
                    stop?.recommendedDuration ??
                    stop?.recommended_duration ??
                    stop?.duration ??
                    ''
                  ),
            expectedCrowd: crowd,
            pressureScore: Number(
              stop?.pressureScore ??
              stop?.pressure_score ??
              0
            ),
            travelTimeFromPrev: String(
              stop?.travelTimeFromPrev ??
              stop?.travel_time_from_prev ??
              (index === 0 ? 'Start Point' : '')
            ),
            imageUrl: String(
              stop?.imageUrl ??
              stop?.image_url ??
              SITE_IMAGES[site.site_id] ??
              ''
            ),
            tips: String(
              stop?.tips ??
              stop?.tip ??
              ''
            ),
            isAlternativeRecommended: Boolean(
              stop?.isAlternativeRecommended ??
              stop?.is_alternative_recommended ??
              false
            ),
            alternativeSuggestion:
              stop?.alternativeSuggestion ??
              stop?.alternative_suggestion
          } as ItineraryStop;
        })
        .filter(
          (stop): stop is ItineraryStop =>
            stop !== null
        );

      if (stops.length === 0 && response?.site_id) {
        const site = destinationOptions.find(
          (item) => item.site_id === String(response.site_id)
        );

        if (site) {
          stops.push({
            id: `backend-stop-${Date.now()}`,
            monumentId: site.site_id,
            monumentName: site.name,
            city: site.city,
            timeSlot: String(
              response.arrival ??
              response.time_slot ??
              response.start_time ??
              ''
            ),
            recommendedDuration:
              response.duration_minutes != null
                ? `${Number(response.duration_minutes)} mins`
                : String(
                    response.duration ??
                    response.recommended_duration ??
                    ''
                  ),
            expectedCrowd: normalizeCrowd(
              response.expected_crowd
            ),
            pressureScore: Number(
              response.pressure_score ?? 0
            ),
            travelTimeFromPrev: 'Start Point',
            imageUrl: String(
              response.image_url ??
              SITE_IMAGES[site.site_id] ??
              ''
            ),
            tips: String(
              response.tips ?? ''
            ),
            isAlternativeRecommended: Boolean(
              response.is_alternative_recommended
            ),
            alternativeSuggestion:
              response.alternative_suggestion
          } as ItineraryStop);
        }
      }

      if (stops.length === 0) {
        throw new Error('Backend returned no itinerary stops.');
      }

      const newPlan: ItineraryPlan = {
        id: String(
          response?.id ??
          response?.plan_id ??
          `backend-plan-${Date.now()}`
        ),
        title: String(
          response?.title ??
          response?.plan_title ??
          `${destinationRegion} Custom AI Itinerary`
        ),
        region: String(
          response?.region ??
          response?.destination ??
          destinationRegion
        ),
        durationDays: Number(
          response?.durationDays ??
          response?.duration_days ??
          durationDays
        ),
        idealFor: String(
          response?.idealFor ??
          response?.ideal_for ??
          `${travelParty} • ${travelPace.toUpperCase()} Pace`
        ),
        stops,
        totalDistanceKm: Number(
          response?.totalDistanceKm ??
          response?.total_distance_km ??
          0
        ),
        sustainabilityScore: Number(
          response?.sustainabilityScore ??
          response?.sustainability_score ??
          0
        ),
        crowdAvoidancePercent: Number(
          response?.crowdAvoidancePercent ??
          response?.crowd_avoidance_percent ??
          0
        )
      };

      setGeneratedPlan(newPlan);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // Optional animation only.
      }
    } catch (error: any) {
      console.error('ITINERARY - BACKEND GENERATION FAILED:', error);
      setBackendError(
        error?.message ||
        'Unable to generate itinerary from recommendation engine.'
      );
      setGeneratedPlan(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const activePlan: ItineraryPlan = plannerMode === 'custom' && generatedPlan
    ? generatedPlan
    : ITINERARY_CIRCUITS[selectedCircuitIndex];

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
            : 'Enter your trip preferences to generate a personalized AI itinerary optimized to avoid peak crowds, reduce monument strain, and discover hidden gems.'}
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

      {/* 2. Interactive AI Custom Planning Form (Shown when plannerMode === 'custom') */}
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
                  Tell our AI where, when, and how you want to experience India's heritage.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full self-start sm:self-auto">
              ● Live Crowd Engine Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Destination / Region */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D3B2E] flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Destination / Heritage Circuit</span>
              </label>
              <select
                value={destinationRegion}
                onChange={(e) => setDestinationRegion(e.target.value)}
                className="w-full p-3 bg-[#F8F6F0] border border-[#0D3B2E]/15 rounded-xl text-xs font-semibold text-[#1A2621] outline-none cursor-pointer focus:ring-2 focus:ring-[#0D3B2E]/20"
              >
                {destinationOptions.map((opt) => (
                  <option key={opt.site_id} value={opt.name}>
                    {opt.name} — {opt.city} ({opt.site_id})
                  </option>
                ))}
              </select>
              {destinationRegion && (
                <p className="text-[10px] text-[#1A2621]/60 mt-1">
                  Site ID: {destinationOptions.find((site) => site.name === destinationRegion)?.site_id ?? '—'}
                </p>
              )}
            </div>

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

            {/* Start Date & Preferred Morning Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D3B2E] flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Trip Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-[#F8F6F0] border border-[#0D3B2E]/15 rounded-xl text-xs font-semibold text-[#1A2621] outline-none"
              />
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
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold text-[#0D3B2E]">AI Optimization Rules</label>
              
              <div className="flex items-center justify-between p-2 bg-[#F8F6F0] rounded-xl text-xs">
                <span className="font-semibold text-gray-700">Avoid Peak Footfall Hours</span>
                <input
                  type="checkbox"
                  checked={avoidPeakCrowds}
                  onChange={(e) => setAvoidPeakCrowds(e.target.checked)}
                  className="w-4 h-4 accent-[#0D3B2E] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-[#F8F6F0] rounded-xl text-xs">
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
              Backend recommendation unavailable. Showing the existing local itinerary.
            </div>
          )}

          {/* Submit Generator Button */}
          <div className="pt-4">
            <button
              onClick={handleGenerateCustomPlan}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-[#0D3B2E] to-[#165342] hover:from-[#08281E] hover:to-[#0D3B2E] text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-[#D4AF37]" />
                  <span>Synthesizing ASI Carrying Capacities & Crowd Waves...</span>
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

      {/* 3. Preset Curated Circuits (Shown when plannerMode === 'curated') */}
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
          
          {/* Left Column: Itinerary Timeline (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Circuit Summary Banner */}
            <div className="bg-white p-6 rounded-3xl border border-[#0D3B2E]/15 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#C85A32] uppercase tracking-wider">
                    {activePlan.durationDays} Days • {activePlan.region}
                  </span>
                  <h2 className="text-2xl font-bold text-[#0D3B2E] font-serif-heritage mt-0.5">
                    {activePlan.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono text-xs font-bold">
                    🌿 {activePlan.sustainabilityScore}/100 Eco Score
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#1A2621]/80 leading-relaxed font-medium">
                {activePlan.idealFor} • Total Circuit Distance: ~{activePlan.totalDistanceKm} km
              </p>

              {/* Crowd avoidance insight pill */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">AI Optimization Note:</span> Route sequenced to shift high-traffic sites to early morning hours, reducing your crowd wait time by {activePlan.crowdAvoidancePercent}%.
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
                      alert('Itinerary link copied to clipboard!');
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

            {/* Timeline Stops Sequence */}
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-[#0D3B2E]/20">
              {activePlan.stops.map((stop, sIdx) => {
                const isAlternative = stop.isAlternativeRecommended;
                return (
                  <div key={stop.id} className="relative pl-14 group animate-fadeIn">
                    
                    {/* Circle Node on Timeline */}
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
                        
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-[#0D3B2E]/10 text-[#0D3B2E] rounded-full text-[10px] font-bold font-mono">
                              ⏰ {stop.timeSlot}
                            </span>
                            <span className="text-[10px] text-gray-500 font-semibold">
                              ⏱️ {stop.recommendedDuration}
                            </span>
                          </div>

                          <h4 
                            onClick={() => onSelectMonumentName?.(stop.monumentName)}
                            className="text-lg font-bold text-[#0D3B2E] font-serif-heritage hover:text-[#C85A32] transition-colors cursor-pointer"
                          >
                            {stop.monumentName}
                          </h4>

                          <p className="text-xs text-[#1A2621]/70">
                            {stop.city}
                            {stop.expectedCrowd && (
                              <>
                                {' • '}
                                <span className="font-semibold">Crowd Level:</span>{' '}
                                {stop.expectedCrowd}
                              </>
                            )}
                          </p>

                          {stop.tips && (
                            <p className="text-xs text-[#1A2621]/80 bg-[#F8F6F0] p-2.5 rounded-xl border border-gray-100 mt-2">
                              💡 <span className="font-semibold">AI Tip:</span> {stop.tips}
                            </p>
                          )}

                          {isAlternative && stop.alternativeSuggestion && (
                            <div className="mt-2 p-2.5 bg-amber-100/60 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-amber-800 shrink-0" />
                              <span>{stop.alternativeSuggestion}</span>
                            </div>
                          )}
                        </div>

                        {/* Monument Thumbnail */}
                        {stop.imageUrl ? (
                          <div className="w-full sm:w-28 h-28 rounded-2xl overflow-hidden shrink-0 border border-gray-200">
                            <img
                              src={stop.imageUrl}
                              alt={stop.monumentName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : null}

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Sidebar Map / Quick Guidance (4 cols) */}
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