import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  MapPin,
  Star,
  Calendar,
  SlidersHorizontal,
  Heart,
  Sparkles,
  ArrowRight,
  Camera,
  Compass,
  Filter,
  Users,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import { Monument, DamageScanResult, MonumentCategory } from '../../types/heritage';
import { getSites, BackendSite } from '../../api/sites';
import {
  convertBackendSiteToMonument,
  resolveImageUrl,
  SITE_IMAGE_PATHS
} from '../../data/siteMapper';
import { MONUMENT_FALLBACKS } from '../../assets/monumentImages';

// Subcomponents for the Tourist Navigation View
import { ScanMonument } from './ScanMonument';
import { AskHeritageAI } from './AskHeritageAI';
import { ItineraryPlanner } from './ItineraryPlanner';
import { SavedMonumentsPage } from './SavedMonumentsPage';

import { useSavedMonuments } from '../../hooks/useSavedMonuments';
import {
  t,
  getCategoryLabel,
  getStyleLabel,
  getStateLabel,
  getCityLabel
} from '../../utils/translations';

// =====================================================
// TOURIST APP PROPS
// =====================================================

interface TouristAppProps {
  language: 'en' | 'hi';
  activeTab?: 'discover' | 'itinerary' | 'scan' | 'ai-assistant' | 'saved';
  onTabChange?: (tab: 'discover' | 'itinerary' | 'scan' | 'ai-assistant' | 'saved') => void;
  onSelectMonument: (monument: Monument) => void;
  onReportSubmitted?: (scan: DamageScanResult) => void;
  selectedSiteId?: string;
}

// =====================================================
// TOURIST APP COMPONENT
// =====================================================

export const TouristApp: React.FC<TouristAppProps> = ({
  language,
  activeTab = 'discover',
  onTabChange,
  onSelectMonument,
  onReportSubmitted
}) => {
  // ===================================================
  // SEARCH & FILTER STATES
  // ===================================================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCategory, setSelectedCategory] = useState<MonumentCategory | 'All'>('All');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('All Time Periods');
  const [selectedStyle, setSelectedStyle] = useState('All Styles');
  const [sortBy, setSortBy] = useState('Popular');

  // ===================================================
  // BACKEND SITES STATE
  // ===================================================
  const [backendMonuments, setBackendMonuments] = useState<Monument[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError, setSitesError] = useState<string | null>(null);

  // ===================================================
  // BOOKMARKS & FAILED IMAGES (LOCAL STORAGE PERSISTENCE)
  // ===================================================
  const { isSaved, toggleSave } = useSavedMonuments();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // ===================================================
  // LOAD SITES FROM BACKEND
  // ===================================================
  const fetchSites = useCallback(async () => {
    try {
      setSitesLoading(true);
      setSitesError(null);

      const rawSites: BackendSite[] = await getSites();

      if (!Array.isArray(rawSites) || rawSites.length === 0) {
        setBackendMonuments([]);
        return;
      }

      // Convert backend sites to rich frontend Monument objects
      const monuments = rawSites.map(convertBackendSiteToMonument);
      setBackendMonuments(monuments);
    } catch (error) {
      console.error('Failed to fetch sites from backend:', error);
      setSitesError('Unable to load heritage sites from the server. Please check backend connection.');
    } finally {
      setSitesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // ===================================================
  // IMAGE ERROR FALLBACK HANDLER
  // ===================================================
  const handleImageError = (id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  };

  // ===================================================
  // BOOKMARK TOGGLE
  // ===================================================
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(id);
  };

  // ===================================================
  // DYNAMIC DROPDOWN LISTS DERIVED FROM BACKEND DATA
  // ===================================================
  const availableStates = useMemo(() => {
    const statesSet = new Set<string>();
    backendMonuments.forEach((m) => {
      if (m.state) statesSet.add(m.state);
    });
    return ['All States', ...Array.from(statesSet).sort()];
  }, [backendMonuments]);

  const availableStyles = useMemo(() => {
    const stylesSet = new Set<string>();
    backendMonuments.forEach((m) => {
      if (m.architecturalStyle) stylesSet.add(m.architecturalStyle);
    });
    return ['All Styles', ...Array.from(stylesSet).sort()];
  }, [backendMonuments]);

  const availableTimePeriods = useMemo(() => {
    const periodSet = new Set<string>();
    backendMonuments.forEach((m) => {
      if (m.timePeriod) periodSet.add(m.timePeriod);
    });
    return ['All Time Periods', ...Array.from(periodSet).sort()];
  }, [backendMonuments]);

  // Filter Categories matching Horizontal Chips
  const categories: Array<{ id: MonumentCategory | 'All'; label: string; icon: string }> = [
    { id: 'All', label: 'All Monuments', icon: '🏛️' },
    { id: 'Temples', label: 'Temples', icon: '🛕' },
    { id: 'Tombs & Mausoleums', label: 'Tombs & Mausoleums', icon: '🕌' },
    { id: 'Forts & Palaces', label: 'Forts & Palaces', icon: '🏰' },
    { id: 'Caves & Rock Cut', label: 'Caves & Rock Cut', icon: '🪨' },
    { id: 'Museums', label: 'Museums', icon: '🏺' },
    { id: 'UNESCO Sites', label: 'UNESCO Sites', icon: '🌐' },
    { id: 'Other Heritage', label: 'Other Heritage', icon: '✨' }
  ];

  // ===================================================
  // FILTERING & SORTING LOGIC OVER BACKEND MONUMENTS
  // ===================================================
  const filteredMonuments = useMemo(() => {
    return backendMonuments
      .filter((m) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          m.name.toLowerCase().includes(q) ||
          (m.hindiName ? m.hindiName.toLowerCase().includes(q) : false) ||
          m.city.toLowerCase().includes(q) ||
          m.state.toLowerCase().includes(q) ||
          m.architecturalStyle.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q);

        const matchesState =
          selectedState === 'All States' || m.state === selectedState;

        const matchesStyle =
          selectedStyle === 'All Styles' ||
          m.architecturalStyle.toLowerCase().includes(selectedStyle.toLowerCase());

        const matchesTimePeriod =
          selectedTimePeriod === 'All Time Periods' ||
          m.timePeriod === selectedTimePeriod;

        const matchesCategory =
          selectedCategory === 'All' ||
          (selectedCategory === 'UNESCO Sites' && m.isUnesco) ||
          m.category === selectedCategory;

        return (
          matchesSearch &&
          matchesState &&
          matchesStyle &&
          matchesTimePeriod &&
          matchesCategory
        );
      })
      .sort((a, b) => {
        if (sortBy === 'Rating') return b.rating - a.rating;
        if (sortBy === 'LowPressure')
          return a.heritagePressureScore - b.heritagePressureScore;
        if (sortBy === 'HighPressure')
          return b.heritagePressureScore - a.heritagePressureScore;
        return b.rating - a.rating;
      });
  }, [
    backendMonuments,
    searchQuery,
    selectedState,
    selectedStyle,
    selectedTimePeriod,
    selectedCategory,
    sortBy
  ]);

  const handleNavigateTab = (
    tab: 'discover' | 'itinerary' | 'scan' | 'ai-assistant'
  ) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`w-full text-[#1A2621] min-h-[calc(100vh-72px)] ${
        activeTab === 'itinerary'
          ? 'itinerary-page-bg'
          : activeTab === 'ai-assistant'
          ? 'ask-ai-page-bg'
          : activeTab === 'scan'
          ? 'scan-monument-page-bg'
          : 'bg-[#F8F6F0]'
      }`}
    >
      {/* Full-Width Main Content Canvas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fadeIn">
        {/* Sub-View: Plan Journey (Itinerary Planner) */}
        {activeTab === 'itinerary' && (
          <ItineraryPlanner
            language={language}
            onSelectMonumentName={(name) => {
              const match = backendMonuments.find(
                (m) =>
                  m.name.toLowerCase() === name.toLowerCase() ||
                  m.id.toLowerCase() === name.toLowerCase()
              );
              if (match) {
                onSelectMonument(match);
              }
            }}
          />
        )}

        {/* Sub-View: AI Damage Scanner */}
        {activeTab === 'scan' && (
          <ScanMonument
            language={language}
            onReportSubmitted={onReportSubmitted}
          />
        )}

        {/* Sub-View: Ask Heritage AI */}
        {activeTab === 'ai-assistant' && (
          <AskHeritageAI language={language} />
        )}

        {/* Sub-View: Saved Monuments Page */}
        {activeTab === 'saved' && (
          <SavedMonumentsPage
            language={language}
            monuments={backendMonuments}
            onSelectMonument={onSelectMonument}
            onExploreClick={() => handleNavigateTab('discover')}
          />
        )}

        {/* Default Sub-View: Discover Monuments */}
        {activeTab === 'discover' && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#0D3B2E]/10">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#1A2621] font-serif-heritage leading-tight">
                  {language === 'hi' ? (
                    <>धरोहर <span className="text-[#0E382B]">स्मारक</span> खोजें</>
                  ) : (
                    <>Discover <span className="text-[#0E382B]">Heritage</span> Monuments</>
                  )}
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
                  <span>{language === 'hi' ? 'मार्ग योजना' : 'Plan Route'}</span>
                </button>
                <button
                  onClick={() => handleNavigateTab('scan')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#0D3B2E] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold shadow-2xs hover:bg-[#08281E] transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'स्मारक स्कैन करें' : 'Scan Monument'}</span>
                </button>
              </div>
            </div>

            {/* Main Full-Width Search Bar */}
            <div className="uiverse-search-bar flex-wrap sm:flex-nowrap">
              <div className="uiverse-search-input-container w-full sm:w-auto">
                <Search className="w-5 h-5 uiverse-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'स्मारक का नाम, शहर, राज्य या वास्तुकला खोजें...'
                      : 'Search monuments by name, city, dynasty, or architectural style...'
                  }
                  className="uiverse-search-input text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-[#0E382B] font-semibold cursor-pointer"
                  >
                    {language === 'hi' ? 'हटाएं' : 'Clear'}
                  </button>
                )}
                <button
                  onClick={() => {}}
                  className="px-6 py-2.5 bg-[#0E382B] hover:bg-[#08281E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  {language === 'hi' ? 'खोजें' : 'Search'}
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
                  {availableStates.map((s) => (
                    <option key={s} value={s}>
                      {getStateLabel(s, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A2621] shadow-2xs outline-none cursor-pointer"
                >
                  <option value="All">{language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</option>
                  <option value="Temples">{language === 'hi' ? 'मंदिर' : 'Temples'}</option>
                  <option value="Tombs & Mausoleums">{language === 'hi' ? 'मकबरे और समाधि' : 'Tombs & Mausoleums'}</option>
                  <option value="Forts & Palaces">{language === 'hi' ? 'किले और महल' : 'Forts & Palaces'}</option>
                  <option value="Caves & Rock Cut">{language === 'hi' ? 'गुफाएं और शैलकृत' : 'Caves & Rock Cut'}</option>
                  <option value="Museums">{language === 'hi' ? 'संग्रहालय' : 'Museums'}</option>
                  <option value="UNESCO Sites">{language === 'hi' ? 'यूनेस्को स्थल' : 'UNESCO Sites'}</option>
                  <option value="Other Heritage">{language === 'hi' ? 'अन्य धरोहर' : 'Other Heritage'}</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedTimePeriod}
                  onChange={(e) => setSelectedTimePeriod(e.target.value)}
                  className="w-full bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A2621] shadow-2xs outline-none cursor-pointer"
                >
                  {availableTimePeriods.map((p) => (
                    <option key={p} value={p}>
                      {p === 'All Time Periods' ? (language === 'hi' ? 'सभी कालखंड' : p) : p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A2621] shadow-2xs outline-none cursor-pointer"
                >
                  {availableStyles.map((st) => (
                    <option key={st} value={st}>
                      {getStyleLabel(st, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A2621] shadow-2xs outline-none cursor-pointer"
                >
                  <option value="Popular">{language === 'hi' ? 'क्रमबद्ध करें: लोकप्रिय' : 'Sort By: Popular'}</option>
                  <option value="Rating">{language === 'hi' ? 'उच्चतम रेटिंग' : 'Highest Rated'}</option>
                  <option value="LowPressure">{language === 'hi' ? 'न्यूनतम दबाव' : 'Least Pressure'}</option>
                  <option value="HighPressure">{language === 'hi' ? 'सर्वाधिक संवेदनशील' : 'Most Vulnerable'}</option>
                </select>
              </div>

              <div>
                <button
                  onClick={() => {
                    setSelectedState('All States');
                    setSelectedCategory('All');
                    setSelectedStyle('All Styles');
                    setSelectedTimePeriod('All Time Periods');
                    setSearchQuery('');
                  }}
                  className="w-full bg-[#F8F6F0] hover:bg-white border border-[#0D3B2E]/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0E382B] flex items-center justify-center space-x-1 transition-all cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}</span>
                </button>
              </div>
            </div>

            {/* Horizontal Category Filter Pills */}
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === cat.id
                      ? 'bg-[#0E382B] text-white border-[#0E382B] shadow-sm'
                      : 'bg-white text-[#1A2621]/80 border-[#0D3B2E]/15 hover:bg-[#F8F6F0]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{getCategoryLabel(cat.id, language)}</span>
                </button>
              ))}
            </div>

            {/* Monuments Section Header & Counts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-[#0E382B] font-serif-heritage flex items-center space-x-2">
                  <span>🌾</span>
                  <span>{language === 'hi' ? 'धरोहर स्मारक' : 'Heritage Monuments'}</span>
                  {!sitesLoading && (
                    <span className="text-xs font-mono font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                      {filteredMonuments.length} {language === 'hi' ? 'स्थल' : 'sites'}
                    </span>
                  )}
                </h3>

                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedState('All States');
                    setSelectedStyle('All Styles');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-[#0E382B] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>{language === 'hi' ? 'सभी स्मारक देखें' : 'View All Monuments'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* SITES LOADING SKELETON STATE */}
              {sitesLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="bg-white rounded-3xl overflow-hidden border border-[#0D3B2E]/10 p-0 animate-pulse flex flex-col h-96"
                    >
                      <div className="h-52 bg-gray-200 w-full" />
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="h-5 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                        </div>
                        <div className="h-9 bg-gray-200 rounded-xl w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ERROR STATE */}
              {!sitesLoading && sitesError && (
                <div className="p-8 rounded-3xl bg-amber-50 border border-amber-200 text-center space-y-4 max-w-xl mx-auto my-8">
                  <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
                  <h4 className="text-base font-bold text-amber-900">
                    {language === 'hi' ? 'स्मारक लोड करने में असमर्थ' : 'Unable to Load Heritage Sites'}
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {sitesError}
                  </p>
                  <button
                    onClick={fetchSites}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#08281E] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'पुनः प्रयास करें' : 'Retry Loading Sites'}</span>
                  </button>
                </div>
              )}

              {/* EMPTY STATE */}
              {!sitesLoading && !sitesError && filteredMonuments.length === 0 && (
                <div className="p-12 rounded-3xl bg-white border border-[#0D3B2E]/10 text-center space-y-4 max-w-lg mx-auto my-8">
                  <div className="text-4xl">🔍</div>
                  <h4 className="text-base font-bold text-[#0D3B2E]">
                    {language === 'hi' ? 'कोई स्मारक नहीं मिला' : 'No Heritage Sites Found'}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {language === 'hi'
                      ? 'आपकी खोज और फ़िल्टर के अनुसार कोई स्मारक नहीं मिला। कृपया फ़िल्टर बदलें।'
                      : 'No monuments matched your current search and filter criteria. Try adjusting your query or resetting filters.'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedState('All States');
                      setSelectedCategory('All');
                      setSelectedStyle('All Styles');
                      setSelectedTimePeriod('All Time Periods');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0E382B] text-white text-xs font-bold shadow transition-all cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'सभी फ़िल्टर रीसेट करें' : 'Reset All Filters'}</span>
                  </button>
                </div>
              )}

              {/* REAL BACKEND MONUMENTS CARDS GRID */}
              {!sitesLoading && !sitesError && filteredMonuments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
                  {filteredMonuments.map((monument) => {
                    const isBookmarked = isSaved(monument.id);
                    const isFailed = failedImages.has(monument.id);
                    const imageSrc = isFailed
                      ? resolveImageUrl('', monument.id)
                      : resolveImageUrl(monument.imageUrl, monument.id);
                    const monumentDisplayName = (language === 'hi' && monument.hindiName)
                      ? monument.hindiName
                      : monument.name;
                    const localizedCity = getCityLabel(monument.city, language);
                    const localizedState = getStateLabel(monument.state, language);
                    const localizedStyle = getStyleLabel(monument.architecturalStyle, language);

                    return (
                      <div
                        key={monument.id}
                        onClick={() => onSelectMonument(monument)}
                        className="group bg-white rounded-3xl overflow-hidden border border-[#0D3B2E]/12 hover:border-[#0E382B] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                      >
                        {/* Image Container */}
                        <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-900">
                          <img
                            src={imageSrc}
                            alt={monumentDisplayName}
                            onError={() => handleImageError(monument.id)}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                          />

                          {/* Top Left Badge */}
                          <div className="absolute top-3 left-3">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                                monument.isUnesco
                                  ? 'bg-[#0E382B]/90 text-[#D4AF37] border border-[#D4AF37]/40'
                                  : 'bg-black/65 text-white border border-white/20'
                              }`}
                            >
                              {monument.isUnesco
                                ? (language === 'hi' ? 'यूनेस्को स्थल' : 'UNESCO SITE')
                                : (language === 'hi' ? 'धरोहर स्थल' : 'HERITAGE SITE')}
                            </span>
                          </div>

                          {/* Top Right Heart Bookmark Button */}
                          <button
                            onClick={(e) => toggleBookmark(monument.id, e)}
                            aria-label={
                              isBookmarked ? 'Remove bookmark' : 'Bookmark'
                            }
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer shadow-sm"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isBookmarked
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-gray-700'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                          <div className="space-y-1.5">
                            <h4 className="text-base sm:text-lg font-bold text-[#0D3B2E] font-serif-heritage group-hover:text-[#C85A32] transition-colors leading-snug tracking-tight">
                              {monumentDisplayName}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium truncate flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>
                                {localizedCity}, {localizedState}
                              </span>
                            </p>

                            <div className="flex items-center space-x-2 text-xs text-amber-700 font-semibold pt-1">
                              <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="font-bold text-amber-800 font-mono-stat">
                                  {monument.rating}
                                </span>
                              </div>
                              <span className="text-gray-400 font-normal text-[11px]">
                                ({monument.reviewsCount} {language === 'hi' ? 'समीक्षाएं' : ''})
                              </span>
                            </div>
                          </div>

                          {/* Bottom Meta & Action Section */}
                          <div className="space-y-3 pt-3 border-t border-gray-100 mt-auto">
                            <div className="text-xs text-gray-600 flex items-center justify-between font-medium">
                              <span className="truncate max-w-[150px]">
                                {localizedStyle}
                              </span>
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
                              aria-label={`View details for ${monumentDisplayName}`}
                              className="w-full py-2.5 px-3 rounded-xl bg-[#0D3B2E]/6 hover:bg-[#0D3B2E] text-[#0D3B2E] hover:text-white border border-[#0D3B2E]/15 hover:border-[#0D3B2E] text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer shadow-2xs group/btn active:scale-98"
                            >
                              <span>
                                {language === 'hi' ? 'विवरण देखें' : 'View Details'}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#C85A32] group-hover/btn:text-[#D4AF37] group-hover/btn:translate-x-1 transition-all duration-200" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Row: Stats Bar & AI Assistant Promo Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
              {/* Left Stats Bar (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#0D3B2E]/10 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-center text-center">
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C85A32] flex items-center justify-center mx-auto mb-1">
                    🏛️
                  </div>
                  <p className="text-xl font-bold text-[#0D3B2E] font-mono-stat">
                    {!sitesLoading ? backendMonuments.length : '20'}
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {language === 'hi' ? 'लाइव मॉनिटर किए गए स्थल' : 'Live Monitored Sites'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1">
                    🌐
                  </div>
                  <p className="text-xl font-bold text-emerald-700 font-mono-stat">
                    {!sitesLoading
                      ? backendMonuments.filter((m) => m.isUnesco).length
                      : '7'}
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {language === 'hi' ? 'यूनेस्को विश्व धरोहर' : 'UNESCO World Heritage'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-1">
                    <Compass className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold text-blue-700 font-mono-stat">
                    4
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {language === 'hi' ? 'प्रमुख पर्यटन केंद्र' : 'Key Tourist Hubs'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-1">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xl font-bold text-purple-700 font-mono-stat">
                    500K+
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {language === 'hi' ? 'दैनिक पर्यटक' : 'Daily Visitors'}
                  </p>
                </div>
              </div>

              {/* Right Promo Card (5 cols) */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#0D3B2E] to-[#08281E] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'एआई धरोहर साथी' : 'AI Heritage Companion'}</span>
                  </div>
                  <h4 className="text-lg font-bold font-serif-heritage text-white">
                    {language === 'hi'
                      ? 'ऐतिहासिक गाथाएं या भीड़ पूर्वानुमान जानना चाहते हैं?'
                      : 'Need instant historical stories or crowd forecasts?'}
                  </h4>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {language === 'hi'
                      ? 'कस्टम यात्रा मार्गों, अभिलेख अनुवाद और पर्यावरण-अनुकूल समय के लिए धरोहर एआई से पूछें।'
                      : 'Ask Dharohar AI for custom routes, epigraph translations, and eco-friendly visit windows.'}
                  </p>
                </div>

                <button
                  onClick={() => handleNavigateTab('ai-assistant')}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c59b27] text-[#08281E] text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <span>{language === 'hi' ? 'धरोहर एआई से बातचीत करें' : 'Chat with Dharohar AI'}</span>
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
