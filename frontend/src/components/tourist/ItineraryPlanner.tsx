import React, { useState } from 'react';
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
import { MONUMENT_FALLBACKS } from '../../assets/monumentImages';
import { ItineraryPlan, ItineraryStop } from '../../types/heritage';

interface ItineraryPlannerProps {
  language: 'en' | 'hi';
  onSelectMonumentName?: (name: string) => void;
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({ language, onSelectMonumentName }) => {
  // Mode: 'custom' (Interactive Form) or 'curated' (Presets)
  const [plannerMode, setPlannerMode] = useState<'custom' | 'curated'>('custom');

  // Custom Generator Form States
  const [destinationRegion, setDestinationRegion] = useState('Agra & Golden Triangle');
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

  const interestOptions = [
    'UNESCO Landmarks',
    'Historical Epigraphs',
    'Dravidian Temples',
    'Mughal Heritage',
    'Sunset & Photography',
    'Peaceful & Low Crowd',
    'Cave & Rock Art'
  ];

  const destinationOptions = [
    'Agra & Golden Triangle',
    'Karnataka & Hampi Ruins',
    'Tamil Nadu Sacred Chola Circuit',
    'Rajasthan Forts & Palaces (Jodhpur-Jaipur)',
    'Odisha Heritage (Konark & Puri)',
    'Maharashtra Cave Trail (Ajanta & Ellora)'
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Generate Custom AI Plan based on form inputs
  const handleGenerateCustomPlan = () => {
    setIsGenerating(true);

    setTimeout(() => {
      let customStops: ItineraryStop[] = [];

      if (destinationRegion.includes('Agra')) {
        customStops = [
          {
            id: 'custom-1',
            monumentId: 'taj-mahal',
            monumentName: 'Taj Mahal (Sunrise Entry)',
            city: 'Agra',
            timeSlot: '06:00 AM – 08:30 AM',
            recommendedDuration: '2.5 hrs',
            expectedCrowd: 'Low',
            pressureScore: 42,
            travelTimeFromPrev: 'Start Point',
            imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
            tips: 'Arrive 15 mins before gate opening for serene marble glow and zero queues.'
          },
          {
            id: 'custom-2',
            monumentId: 'fatehpur-sikri',
            monumentName: 'Fatehpur Sikri & Buland Darwaza',
            city: 'Agra Suburbs',
            timeSlot: '11:00 AM – 02:00 PM',
            recommendedDuration: '3 hrs',
            expectedCrowd: 'Moderate',
            pressureScore: 56,
            travelTimeFromPrev: '45 mins drive',
            imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
            tips: 'Explore the Diwan-i-Khas central pillar with audio guide.'
          },
          {
            id: 'custom-3',
            monumentId: 'mehtab-bagh',
            monumentName: 'Mehtab Bagh (Sunset Eco-View)',
            city: 'Agra (Across Yamuna)',
            timeSlot: '04:30 PM – 06:30 PM',
            recommendedDuration: '2 hrs',
            expectedCrowd: 'Low',
            pressureScore: 28,
            isAlternativeRecommended: true,
            alternativeSuggestion: 'Selected over Taj East Gate evening rush to reduce footfall congestion while enjoying panoramic golden hour reflections.',
            travelTimeFromPrev: '30 mins drive',
            imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
            tips: 'Carry water and telephoto lens for stunning Yamuna riverside silhouettes.'
          }
        ];
      } else if (destinationRegion.includes('Karnataka') || destinationRegion.includes('Hampi')) {
        customStops = [
          {
            id: 'custom-k1',
            monumentId: 'hampi-monuments',
            monumentName: 'Vittala Temple & Stone Chariot',
            city: 'Hampi',
            timeSlot: '07:00 AM – 09:30 AM',
            recommendedDuration: '2.5 hrs',
            expectedCrowd: 'Low',
            pressureScore: 35,
            travelTimeFromPrev: 'Start Point',
            imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f445b23e?auto=format&fit=crop&w=800&q=80',
            tips: 'Inspect musical pillars acoustic carvings during morning quiet.'
          },
          {
            id: 'custom-k2',
            monumentId: 'badami-caves',
            monumentName: 'Badami Cave Temples',
            city: 'Bagalkot',
            timeSlot: '11:30 AM – 02:00 PM',
            recommendedDuration: '2.5 hrs',
            expectedCrowd: 'Moderate',
            pressureScore: 40,
            travelTimeFromPrev: '1 hr 15 mins drive',
            imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=800&q=80',
            tips: 'Wear comfortable grip shoes for stone stairs.'
          },
          {
            id: 'custom-k3',
            monumentId: 'hampi-monuments',
            monumentName: 'Hemakuta Hill Sunset Ruins',
            city: 'Hampi',
            timeSlot: '05:00 PM – 06:45 PM',
            recommendedDuration: '1.75 hrs',
            expectedCrowd: 'Low',
            pressureScore: 25,
            isAlternativeRecommended: true,
            alternativeSuggestion: 'Peaceful panoramic vantage point with 0 crowd pressure and breathtaking sunset view over Virupaksha.',
            travelTimeFromPrev: '20 mins walk',
            imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
            tips: 'Watch sunset behind the banana plantations.'
          }
        ];
      } else {
        customStops = [
          {
            id: 'custom-gen1',
            monumentId: 'konark-sun-temple',
            monumentName: 'Konark Sun Temple',
            city: 'Puri',
            timeSlot: '06:30 AM – 09:00 AM',
            recommendedDuration: '2.5 hrs',
            expectedCrowd: 'Low',
            pressureScore: 45,
            travelTimeFromPrev: 'Start Point',
            imageUrl: 'https://images.unsplash.com/photo-1599818816824-747201c10712?auto=format&fit=crop&w=800&q=80',
            tips: 'Check shadow calculations on the 24 sundial chariot wheels.'
          },
          {
            id: 'custom-gen2',
            monumentId: 'brihadisvara-temple',
            monumentName: 'Brihadisvara Great Living Chola Temple',
            city: 'Thanjavur',
            timeSlot: '11:00 AM – 01:30 PM',
            recommendedDuration: '2.5 hrs',
            expectedCrowd: 'Moderate',
            pressureScore: 50,
            travelTimeFromPrev: 'Local Transport',
            imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
            tips: 'Observe the 80-tonne granite monolithic Kumbam dome atop the vimana.'
          },
          {
            id: 'custom-gen3',
            monumentId: 'airavatesvara-temple',
            monumentName: 'Airavatesvara Temple (Eco-Alternative)',
            city: 'Darasuram',
            timeSlot: '04:00 PM – 06:00 PM',
            recommendedDuration: '2 hrs',
            expectedCrowd: 'Low',
            pressureScore: 18,
            isAlternativeRecommended: true,
            alternativeSuggestion: 'Exquisite musical steps and intricate miniature carvings with undisturbed peaceful atmosphere.',
            travelTimeFromPrev: '40 mins drive',
            imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=800&q=80',
            tips: 'Experience undisturbed stone acoustic steps at the porch entry.'
          }
        ];
      }

      const newPlan: ItineraryPlan = {
        id: 'custom-plan-' + Date.now(),
        title: `${destinationRegion} Custom Eco-Circuit`,
        region: destinationRegion,
        durationDays: durationDays,
        idealFor: `${travelParty} • ${travelPace.toUpperCase()} Pace`,
        stops: customStops,
        totalDistanceKm: 120,
        sustainabilityScore: 94,
        crowdAvoidancePercent: 68
      };

      setGeneratedPlan(newPlan);
      setIsGenerating(false);

      // Celebration Confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // ignore
      }
    }, 1200);
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
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
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
                const fallbackImg = MONUMENT_FALLBACKS[stop.monumentId] || MONUMENT_FALLBACKS['taj-mahal'];

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
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              stop.expectedCrowd === 'Low'
                                ? 'bg-emerald-100 text-emerald-800'
                                : stop.expectedCrowd === 'Moderate'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              👥 {stop.expectedCrowd} Crowd
                            </span>
                          </div>

                          <h3 
                            onClick={() => onSelectMonumentName && onSelectMonumentName(stop.monumentName)}
                            className="text-lg font-bold text-[#0D3B2E] font-serif-heritage cursor-pointer hover:text-[#C85A32] transition-colors"
                          >
                            {stop.monumentName}
                          </h3>

                          <p className="text-xs text-gray-500">
                            {stop.city} • Travel from previous: <span className="font-semibold text-gray-700">{stop.travelTimeFromPrev}</span>
                          </p>

                          {/* Explorer Tip */}
                          {stop.tips && (
                            <p className="text-[11px] text-[#1A2621]/75 bg-[#F8F6F0] p-2 rounded-xl border border-gray-200/70">
                              <span className="font-bold text-[#0D3B2E]">💡 Tip:</span> {stop.tips}
                            </p>
                          )}

                          {/* Alternative Recommendation Highlight */}
                          {isAlternative && stop.alternativeSuggestion && (
                            <div className="mt-2 p-3 bg-white/90 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-1">
                              <p className="font-bold flex items-center space-x-1 text-amber-800">
                                <span>🌿 Smart Eco-Alternative Selected:</span>
                              </p>
                              <p className="text-[11px] leading-relaxed">{stop.alternativeSuggestion}</p>
                            </div>
                          )}
                        </div>

                        {/* Thumbnail */}
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-gray-200 bg-slate-900 shadow-xs">
                          <img
                            src={stop.imageUrl}
                            alt={stop.monumentName}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallbackImg;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Route Optimization Telemetry & Guidance (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Sustainability Metrics Card */}
            <div className="bg-[#0D3B2E] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
              <h3 className="text-base font-bold font-serif-heritage text-[#D4AF37]">
                Route Sustainability Index
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/80">Carrying Capacity Balance</span>
                    <span className="font-mono font-bold text-emerald-400">92%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full w-[92%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/80">Crowd Avoidance Optimization</span>
                    <span className="font-mono font-bold text-[#D4AF37]">{activePlan.crowdAvoidancePercent}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: `${activePlan.crowdAvoidancePercent}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/80">Local Community Support</span>
                    <span className="font-mono font-bold text-emerald-400">95%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full w-[95%]"></div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-white/80 leading-relaxed">
                By adhering to these timed slots, you contribute directly to easing structural pressure on fragile marble and sandstone foundations.
              </div>
            </div>

            {/* Travel Essentials Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#0D3B2E]/15 shadow-sm space-y-3 text-xs">
              <h3 className="text-base font-bold text-[#0D3B2E] font-serif-heritage">
                Heritage Explorer Tips
              </h3>

              <div className="space-y-2 text-[#1A2621]/80">
                <div className="flex items-start space-x-2">
                  <span>👟</span>
                  <span>Footwear: Several temples require bare feet or shoe covers.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>📸</span>
                  <span>Photography: Tripods and drones require special ASI permits.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>💧</span>
                  <span>Hydration: Carry reusable bottles; RO refill stations are available at ASI gates.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
