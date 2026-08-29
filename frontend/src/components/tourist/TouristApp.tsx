import React, { useState, useEffect } from 'react';

import {
  Search,
  MapPin,
  Star,
  Calendar,
  ShieldCheck,
  SlidersHorizontal,
  Heart,
  Sparkles,
  ArrowRight,
  Camera,
  Bot,
  Compass,
  AlertTriangle,
  Settings,
  Filter,
  Users
} from 'lucide-react';

import { Monument, DamageScanResult } from '../../types/heritage';
import { MONUMENTS_DATA } from '../../data/monumentsData';
import { getSites, BackendSite, createReport, } from '../../api/sites';
import { MONUMENT_FALLBACKS } from '../../assets/monumentImages';

// Subcomponents for the Tourist Navigation View
import { ScanMonument } from './ScanMonument';
import { AskHeritageAI } from './AskHeritageAI';
import { ItineraryPlanner } from './ItineraryPlanner';


// =====================================================
// BACKEND SITE → FRONTEND MONUMENT CONVERTER
// =====================================================

const convertBackendSiteToMonument = (site: BackendSite): Monument => {
  return {
    id: site.site_id,

    name: site.name,
    hindiName: site.name,
    tagline: site.description,

    city: site.city,
    state: site.state,

    lat: site.latitude,
    lng: site.longitude,

    category: 'Other Heritage',

    timePeriod: 'Historical Period',
    architecturalStyle: 'Heritage Architecture',

    isUnesco: false,

    rating: 0,
    reviewsCount: '0 reviews',

    imageUrl:
      MONUMENT_FALLBACKS[site.site_id] ||
      '/images/heritage-placeholder.jpg',

    gallery: [],

    heritagePressureScore: 0,
    damageScore: 0,

    crowdLevel: 'Low',

    liveFootfall: 0,
    maxCapacity: 0,

    bestVisitingWindow: {
      start: '09:00 AM',
      end: '05:00 PM',
      reason: 'Recommended based on available site information.',
      hindiReason: 'उपलब्ध साइट जानकारी के आधार पर अनुशंसित समय।'
    },

    openingHours: 'Check local timings',

    entryFee: {
      indian: 0,
      foreigner: 0
    },

    deteriorationStatus: 'Good',

    description: site.description,
    hindiDescription: site.description,

    historicalSignificance: site.historical_significance,

    architectureHighlights: [],

    alternativeSites: [],

    hourlyFootfall: []
  };
};


// =====================================================
// TOURIST APP PROPS
// =====================================================

interface TouristAppProps {
  language: 'en' | 'hi';
  activeTab?: 'discover' | 'itinerary' | 'scan' | 'ai-assistant';
  onTabChange?: (tab: 'discover' | 'itinerary' | 'scan' | 'ai-assistant') => void;
  onSelectMonument: (monument: Monument) => void;
  onReportSubmitted?: (scan: DamageScanResult) => void | Promise<void>;
  selectedSiteId?: string;
}


// =====================================================
// TOURIST APP
// =====================================================

export const TouristApp: React.FC<TouristAppProps> = ({
  language,
  activeTab = 'discover',
  onTabChange,
  onSelectMonument,
  onReportSubmitted
}) => {

  // Persist citizen damage reports in the backend before notifying the parent.
  const handleCitizenReportSubmitted = async (scan: DamageScanResult) => {
    const payload = {
      site_id: scan.monumentId,
      damage_score: Number(scan.overallDamageScore ?? 0),
      detections: scan.detections ?? [],
      severity:
        Number(scan.overallDamageScore ?? 0) >= 75
          ? 'HIGH'
          : Number(scan.overallDamageScore ?? 0) >= 50
            ? 'MEDIUM'
            : 'LOW',
      report_type: 'CITIZEN_REPORT',
      summary:
        scan.detections?.length
          ? `Citizen reported ${scan.detections.length} damage detection(s).`
          : 'Citizen submitted a heritage damage report.',
      image_url: scan.imageUrl || ''
    };

    console.log('TOURIST - REPORT PAYLOAD:', payload);

    const savedReport = await createReport(payload);

    console.log('TOURIST - REPORT SAVED:', savedReport);

    // Keep existing app-level state/notifications working after successful save.
    await onReportSubmitted?.({
      ...scan,
      status: 'Pending Review'
    });
  };

  // ===================================================
  // SEARCH & FILTER STATES
  // ===================================================

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedState, setSelectedState] =
    useState('All States');


  // ===================================================
  // BACKEND STATES
  // ===================================================

  const [backendSites, setBackendSites] =
    useState<BackendSite[]>([]);

  const [backendMonuments, setBackendMonuments] =
    useState<Monument[]>([]);

  const [sitesLoading, setSitesLoading] =
    useState(true);

  const [sitesError, setSitesError] =
    useState<string | null>(null);


  // ===================================================
  // LOAD SITES FROM BACKEND
  // ===================================================
useEffect(() => {
  const loadSites = async () => {
    try {
      setSitesLoading(true);

      const sites = await getSites();

      console.log("========== DEBUG ==========");
      console.log("SITES:", sites);
      console.log("SITES TYPE:", typeof sites);
      console.log("IS ARRAY:", Array.isArray(sites));
      console.log("LENGTH:", sites?.length);
      console.log("============================");

      setBackendSites(sites);

      const monuments = sites.map(convertBackendSiteToMonument);

      console.log("CONVERTED MONUMENTS:", monuments);

      setBackendMonuments(monuments);
      setSitesError(null);

    } catch (error) {
      console.error("BACKEND ERROR:", error);
      setSitesError("Unable to load heritage sites from backend.");
    } finally {
      setSitesLoading(false);
    }
  };

  loadSites();
}, []);


  // ===================================================
  // OTHER FILTER STATES
  // ===================================================

  const [selectedCategory, setSelectedCategory] =
    useState<
      | 'All'
      | 'Temples'
      | 'Tombs & Mausoleums'
      | 'Forts & Palaces'
      | 'Caves & Rock Cut'
      | 'UNESCO Sites'
    >('All');

  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState('All Time Periods');

  const [selectedStyle, setSelectedStyle] =
    useState('All Styles');

  const [sortBy, setSortBy] =
    useState('Popular');


  // ===================================================
  // BOOKMARKS
  // ===================================================

  const [bookmarkedIds, setBookmarkedIds] =
    useState<Set<string>>(
      new Set(['taj-mahal', 'hampi'])
    );


  // ===================================================
  // FAILED IMAGES
  // ===================================================

  const [failedImages, setFailedImages] =
    useState<Set<string>>(new Set());


  const handleImageError = (id: string) => {

    setFailedImages(
      (prev) => new Set(prev).add(id)
    );

  };


  // ===================================================
  // BOOKMARK TOGGLE
  // ===================================================

  const toggleBookmark = (
    id: string,
    e: React.MouseEvent
  ) => {

    e.stopPropagation();

    setBookmarkedIds((prev) => {

      const next = new Set(prev);

      if (next.has(id)) {

        next.delete(id);

      } else {

        next.add(id);

      }

      return next;

    });

  };


  // ===================================================
  // TEMPORARY DEBUG
  // ===================================================

  console.log(
    'FINAL BACKEND MONUMENTS:',
    backendMonuments
  );


  // ===================================================
  // YOUR EXISTING JSX / REST OF TOURIST APP
  // ===================================================

  // Yahan se tumhara existing 553-line TouristApp
  // ka baaki code continue hoga.


  // Filter Categories matching Horizontal Chips
  const categories = [
    { id: 'All', label: 'All Monuments', icon: '🏛️' },
    { id: 'Temples', label: 'Temples', icon: '🛕' },
    { id: 'Tombs & Mausoleums', label: 'Tombs & Mausoleums', icon: '🕌' },
    { id: 'Forts & Palaces', label: 'Forts & Palaces', icon: '🏰' },
    { id: 'Caves & Rock Cut', label: 'Caves & Rock Cut', icon: '🪨' },
    { id: 'UNESCO Sites', label: 'UNESCO Sites', icon: '🌐' }
  ];

  // States List
  const states = [
    'All States',
    'Uttar Pradesh',
    'Delhi',
    'Rajasthan',
    'Karnataka',
    'Maharashtra',
    'Tamil Nadu',
    'Odisha',
    'Madhya Pradesh'
  ];

  // Styles List
  const styles = [
    'All Styles',
    'Mughal Architecture',
    'Dravidian Architecture',
    'Rajput & Mughal Architecture',
    'Kalinga Architecture',
    'Buddhist Rock-cut Architecture',
    'Nagara Style Architecture'
  ];

  // Backend is the source of truth once sites are loaded.
  // This prevents stale/hardcoded monument data from overriding backend sites.
  const monumentsWithBackendData: Monument[] =
    backendSites.length > 0
      ? backendMonuments
      : MONUMENTS_DATA;
  // Filter logic
  const filteredMonuments = monumentsWithBackendData.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.architecturalStyle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === 'All States' || m.state === selectedState;
    const matchesStyle = selectedStyle === 'All Styles' || m.architecturalStyle.includes(selectedStyle.split(' ')[0]);
    const matchesTimePeriod = selectedTimePeriod === 'All Time Periods' || m.timePeriod === selectedTimePeriod;
    
    const matchesCategory = 
      selectedCategory === 'All' ||
      (selectedCategory === 'UNESCO Sites' && m.isUnesco) ||
      m.category === selectedCategory;

    return matchesSearch && matchesState && matchesStyle && matchesTimePeriod && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'Rating') return b.rating - a.rating;
    if (sortBy === 'LowPressure') return a.heritagePressureScore - b.heritagePressureScore;
    return b.rating - a.rating;
  });

  const handleNavigateTab = (tab: 'discover' | 'itinerary' | 'scan' | 'ai-assistant') => {
    if (onTabChange) {
      onTabChange(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`w-full text-[#1A2621] min-h-[calc(100vh-72px)] ${
      activeTab === 'itinerary'
        ? 'itinerary-page-bg'
        : activeTab === 'ai-assistant'
          ? 'ask-ai-page-bg'
          : activeTab === 'scan'
            ? 'scan-monument-page-bg'
            : 'bg-[#F8F6F0]'
    }`}>
      
      {/* Full-Width Main Content Canvas (No Sidebars!) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fadeIn">
        
        {/* Sub-View: Plan Journey (Itinerary Planner) */}
        {activeTab === 'itinerary' && (
          <ItineraryPlanner language={language} />
        )}

        {/* Sub-View: AI Damage Scanner */}
        {activeTab === 'scan' && (
              <ScanMonument
                  language={language}
                  onReportSubmitted={handleCitizenReportSubmitted}
/>
        )}

        {/* Sub-View: Ask Heritage AI */}
        {activeTab === 'ai-assistant' && (
          <AskHeritageAI language={language} />
        )}

        {/* Default Sub-View: Discover Monuments */}
        {activeTab === 'discover' && (
          <div className="space-y-8">
            
            {/* Header Section */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#0D3B2E]/10">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#1A2621] font-serif-heritage leading-tight">
                  Discover <span className="text-[#0E382B]">Heritage</span> Monuments
                </h1>
                <p className="text-xs sm:text-sm text-[#1A2621]/70 mt-1 font-medium">
                  {language === 'hi'
                    ? 'भारत की समृद्ध सांस्कृतिक विरासत, मंदिर, दुर्ग और कालजयी गाथाओं को खोजें।'
                    : "Explore India's rich architectural wonders, sacred sanctuaries, and timeless cultural epics."}
                </p>
              </div>

              {/* Quick Jump Action Pills */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavigateTab('itinerary')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#0D3B2E]/15 text-[#0D3B2E] text-xs font-bold shadow-2xs hover:bg-[#0D3B2E] hover:text-white transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Plan Route</span>
                </button>
                <button
                  onClick={() => handleNavigateTab('scan')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#0D3B2E] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold shadow-2xs hover:bg-[#08281E] transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Monument</span>
                </button>
              </div>
            </div>

            {/* Main Full-Width Animated Search Bar */}
            <div className="uiverse-search-bar flex-wrap sm:flex-nowrap">
              <div className="uiverse-search-input-container w-full sm:w-auto">
                <Search className="w-5 h-5 uiverse-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'hi' ? 'स्मारक का नाम, शहर, राज्य या वास्तुकला खोजें...' : 'Search monuments by name, city, dynasty, or architectural style...'}
                  className="uiverse-search-input text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {}}
                  className="px-6 py-2.5 bg-[#0E382B] hover:bg-[#08281E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  Search
                </button>

                <button 
                  className="p-2.5 bg-[#F8F6F0] hover:bg-[#EAE6DB] text-[#0E382B] rounded-xl border border-[#0D3B2E]/10 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              
              <div>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A2621] shadow-2xs outline-none cursor-pointer"
                >
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A2621] shadow-2xs outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Temples">Temples</option>
                  <option value="Tombs & Mausoleums">Tombs & Mausoleums</option>
                  <option value="Forts & Palaces">Forts & Palaces</option>
                  <option value="Caves & Rock Cut">Caves & Rock Cut</option>
                  <option value="UNESCO Sites">UNESCO Sites</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedTimePeriod}
                  onChange={(e) => setSelectedTimePeriod(e.target.value)}
                  className="w-full bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A2621] shadow-2xs outline-none cursor-pointer"
                >
                  <option value="All Time Periods">All Time Periods</option>
                  <option value="Ancient">Ancient Era</option>
                  <option value="Medieval">Medieval Era</option>
                  <option value="Mughal">Mughal Era</option>
                  <option value="Chola">Chola Dynasty</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A2621] shadow-2xs outline-none cursor-pointer"
                >
                  {styles.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A2621] shadow-2xs outline-none cursor-pointer"
                >
                  <option value="Popular">Sort By: Popular</option>
                  <option value="Rating">Highest Rated</option>
                  <option value="LowPressure">Least Pressure</option>
                </select>
              </div>

              <div>
                <button
                  onClick={() => {
                    setSelectedState('All States');
                    setSelectedCategory('All');
                    setSelectedStyle('All Styles');
                    setSearchQuery('');
                  }}
                  className="w-full bg-[#F8F6F0] hover:bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0E382B] flex items-center justify-center space-x-1 transition-all cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>

            </div>

            {/* Horizontal Category Filter Pills */}
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === cat.id
                      ? 'bg-[#0E382B] text-white border-[#0E382B] shadow-sm'
                      : 'bg-white text-[#1A2621]/80 border-[#0D3B2E]/15 hover:bg-[#F8F6F0]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Popular Monuments Section with Wide Responsive Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-[#0E382B] font-serif-heritage flex items-center space-x-2">
                  <span>🌾</span>
                  <span>Popular Monuments</span>
                </h3>

                <button 
                  onClick={() => setSelectedCategory('All')}
                  className="text-xs font-semibold text-[#0E382B] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>View All Monuments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards Grid with Spacious 4-Column Responsive Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
                {filteredMonuments.map((monument) => {
                  const isBookmarked = bookmarkedIds.has(monument.id);
                  const isFailed = failedImages.has(monument.id);
                  const imageSrc = isFailed
                    ? ''
                    : monument.imageUrl;

                  return (
                    <div
                      key={monument.id}
                      onClick={() => onSelectMonument(monument)}
                      className="group bg-white rounded-3xl overflow-hidden border border-[#0D3B2E]/12 hover:border-[#0E382B] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                    >
                      {/* Image Container */}
                      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={monument.name}
                            onError={() => handleImageError(monument.id)}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                            Image unavailable
                          </div>
                        )}

                        {/* Top Left Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                            monument.isUnesco
                              ? 'bg-[#0E382B]/90 text-[#D4AF37] border border-[#D4AF37]/40'
                              : 'bg-black/65 text-white border border-white/20'
                          }`}>
                            {monument.isUnesco ? 'UNESCO SITE' : 'HERITAGE SITE'}
                          </span>
                        </div>

                        {/* Top Right Heart Button */}
                        <button
                          onClick={(e) => toggleBookmark(monument.id, e)}
                          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer shadow-sm"
                        >
                          <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                        </button>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                        <div className="space-y-1.5">
                          <h4 className="text-base sm:text-lg font-bold text-[#0D3B2E] font-serif-heritage group-hover:text-[#C85A32] transition-colors leading-snug tracking-tight">
                            {monument.name}
                          </h4>
                          <p className="text-xs text-gray-500 font-medium truncate flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{monument.city}, {monument.state}</span>
                          </p>

                          <div className="flex items-center space-x-2 text-xs text-amber-700 font-semibold pt-1">
                            <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-amber-800 font-mono-stat">{monument.rating}</span>
                            </div>
                            <span className="text-gray-400 font-normal text-[11px]">({monument.reviewsCount} reviews)</span>
                          </div>
                        </div>

                        {/* Bottom Meta & Action Section */}
                        <div className="space-y-3 pt-3 border-t border-gray-100 mt-auto">
                          <div className="text-xs text-gray-600 flex items-center justify-between font-medium">
                            <span className="truncate max-w-[150px]">{monument.architecturalStyle}</span>
                            <span className="text-[10px] font-mono-stat text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                              HPS: {monument.heritagePressureScore}
                            </span>
                          </div>

                          {/* Primary Card CTA Button: View Details */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMonument(monument);
                            }}
                            aria-label={`View details for ${monument.name}`}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#0D3B2E]/6 hover:bg-[#0D3B2E] text-[#0D3B2E] hover:text-white border border-[#0D3B2E]/15 hover:border-[#0D3B2E] text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer shadow-2xs group/btn active:scale-98"
                          >
                            <span>{language === 'hi' ? 'विवरण देखें' : 'View Details'}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#C85A32] group-hover/btn:text-[#D4AF37] group-hover/btn:translate-x-1 transition-all duration-200" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Row: Stats Bar & AI Assistant Promo Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
              
              {/* Left Stats Bar (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#0D3B2E]/10 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-center text-center">
                
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C85A32] flex items-center justify-center mx-auto mb-1">
                    🏛️
                  </div>
                  <p className="text-xl font-bold text-[#0D3B2E] font-mono-stat">500+</p>
                  <p className="text-[10px] text-gray-500 font-semibold">Protected Sites</p>
                </div>

                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1">
                    🌐
                  </div>
                  <p className="text-xl font-bold text-emerald-700 font-mono-stat">42</p>
                  <p className="text-[10px] text-gray-500 font-semibold">UNESCO World Heritage</p>
                </div>

                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-1">
                    <Compass className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold text-blue-700 font-mono-stat">12+</p>
                  <p className="text-[10px] text-gray-500 font-semibold">Curated Circuits</p>
                </div>

                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-1">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xl font-bold text-purple-700 font-mono-stat">2M+</p>
                  <p className="text-[10px] text-gray-500 font-semibold">Happy Visitors</p>
                </div>

              </div>

              {/* Right Promo Card (5 cols) */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#0D3B2E] to-[#08281E] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Heritage Companion</span>
                  </div>
                  <h4 className="text-lg font-bold font-serif-heritage text-white">
                    Need instant historical stories or crowd forecasts?
                  </h4>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Ask Dhorohar AI for custom routes, epigraph translations, and eco-friendly visit windows.
                  </p>
                </div>

                <button
                  onClick={() => handleNavigateTab('ai-assistant')}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c59b27] text-[#08281E] text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <span>Chat with Dhorohar AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
