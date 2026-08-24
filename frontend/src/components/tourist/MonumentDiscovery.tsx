import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Heart, 
  Star, 
  MapPin, 
  Landmark, 
  ShieldAlert, 
  Users, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  Building,
  CheckCircle2
} from 'lucide-react';
import { MONUMENTS_DATA } from '../../data/monumentsData';
import { Monument, MonumentCategory, CrowdLevel } from '../../types/heritage';

interface MonumentDiscoveryProps {
  language: 'en' | 'hi';
  onSelectMonument: (monument: Monument) => void;
  onOpenAIChat: () => void;
  onOpenScanner: () => void;
}

export const MonumentDiscovery: React.FC<MonumentDiscoveryProps> = ({
  language,
  onSelectMonument,
  onOpenAIChat,
  onOpenScanner
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MonumentCategory>('All');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('All Periods');
  const [selectedStyle, setSelectedStyle] = useState<string>('All Styles');
  const [sortBy, setSortBy] = useState<string>('pressure-desc');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['taj-mahal', 'hampi-monuments']));
  const [showOnlyUNESCO, setShowOnlyUNESCO] = useState(false);

  // Categories list matching Image 1
  const categories: Array<{ id: MonumentCategory; label: string; icon: string }> = [
    { id: 'All', label: 'All Sites', icon: '🏛️' },
    { id: 'Temples', label: 'Temples', icon: '🛕' },
    { id: 'Tombs & Mausoleums', label: 'Tombs & Mausoleums', icon: '🕌' },
    { id: 'Forts & Palaces', label: 'Forts & Palaces', icon: '🏰' },
    { id: 'Caves & Rock Cut', label: 'Caves & Rock Cut', icon: '🪨' },
    { id: 'UNESCO Sites', label: 'UNESCO Sites', icon: '🌐' }
  ];

  const states = ['All States', 'Uttar Pradesh', 'Karnataka', 'Delhi', 'Odisha', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Madhya Pradesh'];
  const architecturalStyles = ['All Styles', 'Dravidian Architecture', 'Mughal Architecture', 'Indo-Islamic Architecture', 'Kalinga Architecture', 'Buddhist Heritage', 'Rajput Architecture', 'Nagara Architecture'];

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
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

  const filteredMonuments = useMemo(() => {
    return MONUMENTS_DATA.filter((item) => {
      // Search query
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hindiName.includes(searchQuery) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.architecturalStyle.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = 
        selectedCategory === 'All' || 
        (selectedCategory === 'UNESCO Sites' ? item.isUnesco : item.category === selectedCategory);

      // State filter
      const matchesState = selectedState === 'All States' || item.state === selectedState;

      // Style filter
      const matchesStyle = selectedStyle === 'All Styles' || item.architecturalStyle === selectedStyle;

      // UNESCO filter
      const matchesUNESCO = !showOnlyUNESCO || item.isUnesco;

      return matchesSearch && matchesCategory && matchesState && matchesStyle && matchesUNESCO;
    }).sort((a, b) => {
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'pressure-desc') return b.heritagePressureScore - a.heritagePressureScore;
      if (sortBy === 'crowd-asc') return a.liveFootfall - b.liveFootfall;
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedState, selectedStyle, sortBy, showOnlyUNESCO]);

  const getCrowdBadge = (level: CrowdLevel) => {
    switch (level) {
      case 'Low':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500', label: 'Low Crowd' };
      case 'Moderate':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500', label: 'Moderate Crowd' };
      case 'High':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500', label: 'High Footfall' };
      case 'Overcrowded':
        return { bg: 'bg-red-100 text-red-800 border-red-300 animate-pulse', dot: 'bg-red-600', label: 'Overcrowded' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header (Image 1 inspired) */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0D3B2E] font-serif-heritage mb-2">
          Discover <span className="text-[#C85A32]">Heritage</span> Monuments
        </h1>
        <p className="text-sm sm:text-base text-[#1A2621]/70">
          {language === 'hi'
            ? 'भारत की समृद्ध सांस्कृतिक विरासत, स्थापत्य कला और कालजयी गाथाओं को खोजें।'
            : "Explore India's rich cultural legacy, timeless architectural marvels, and sustainable visit timings."}
        </p>
      </div>

      {/* Main Search & Comprehensive Filter Bar (Image 1 inspired) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#0D3B2E]/10 mb-6 space-y-4">
        
        {/* Top Row: Animated Search Input (Uiverse inspired) */}
        <div className="uiverse-search-bar">
          <div className="uiverse-search-input-container">
            <Search className="w-5 h-5 uiverse-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'स्मारक का नाम, शहर, राज्य या वास्तुकला शैली खोजें...' : 'Search by monument name, city, state, or architecture style...'}
              className="uiverse-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          <button 
            onClick={() => {}}
            className="px-6 py-2.5 bg-[#0D3B2E] hover:bg-[#08281E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
          >
            <span>{language === 'hi' ? 'खोजें' : 'Search'}</span>
          </button>
        </div>

        {/* Bottom Row: Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 pt-2 border-t border-[#0D3B2E]/10">
          
          {/* State Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#1A2621]/60 uppercase tracking-wider mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-[#F8F6F0] border border-[#0D3B2E]/15 rounded-lg px-2.5 py-2 text-xs font-medium text-[#1A2621] outline-none"
            >
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Architectural Style Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#1A2621]/60 uppercase tracking-wider mb-1">Architecture Style</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full bg-[#F8F6F0] border border-[#0D3B2E]/15 rounded-lg px-2.5 py-2 text-xs font-medium text-[#1A2621] outline-none"
            >
              {architecturalStyles.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-[#1A2621]/60 uppercase tracking-wider mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#F8F6F0] border border-[#0D3B2E]/15 rounded-lg px-2.5 py-2 text-xs font-medium text-[#1A2621] outline-none"
            >
              <option value="pressure-desc">Heritage Pressure (High to Low)</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="crowd-asc">Least Crowded Now</option>
            </select>
          </div>

          {/* UNESCO Toggle Button */}
          <div className="flex items-end">
            <button
              onClick={() => setShowOnlyUNESCO(!showOnlyUNESCO)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all border ${
                showOnlyUNESCO 
                  ? 'bg-[#D4AF37] text-[#08281E] border-[#D4AF37]' 
                  : 'bg-[#F8F6F0] text-[#1A2621] border-[#0D3B2E]/15 hover:bg-white'
              }`}
            >
              <span>🏛️ UNESCO Sites Only</span>
              {showOnlyUNESCO && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

      </div>

      {/* Horizontal Category Filter Pills (Image 1 inspired) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-[#0D3B2E] text-white border-[#0D3B2E] shadow-sm'
                : 'bg-white text-[#1A2621]/80 border-[#0D3B2E]/15 hover:bg-[#F8F6F0]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Results Count & Subtitle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-[#0D3B2E]">
            {filteredMonuments.length} Monuments Found
          </span>
          {showOnlyUNESCO && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#0D3B2E] font-semibold">
              UNESCO Filter Active
            </span>
          )}
        </div>
        <p className="text-xs text-[#1A2621]/60">
          Showing real-time Heritage Pressure Scores (HPS)
        </p>
      </div>

      {/* Monument Cards Grid (Image 1 inspired) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredMonuments.map((monument) => {
          const crowdInfo = getCrowdBadge(monument.crowdLevel);
          const isBookmarked = bookmarkedIds.has(monument.id);

          return (
            <div
              key={monument.id}
              onClick={() => onSelectMonument(monument)}
              className="group bg-white rounded-2xl overflow-hidden border border-[#0D3B2E]/12 hover:border-[#0D3B2E]/40 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Image Container with Badges */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                <img
                  src={monument.imageUrl}
                  alt={monument.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                {/* UNESCO / Heritage Badge (Top-Left) */}
                <div className="absolute top-3 left-3">
                  {monument.isUnesco ? (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase bg-[#0D3B2E]/90 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm flex items-center space-x-1">
                      <span>UNESCO SITE</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase bg-black/60 backdrop-blur-md text-white/90 border border-white/20 shadow-sm">
                      HERITAGE SITE
                    </span>
                  )}
                </div>

                {/* Bookmark Heart Button (Top-Right) */}
                <button
                  onClick={(e) => toggleBookmark(monument.id, e)}
                  aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                </button>

                {/* Bottom Overlay: Live Crowd Status & Heritage Pressure Score */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  
                  {/* Crowd Pill */}
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md flex items-center space-x-1.5 ${crowdInfo.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${crowdInfo.dot}`} />
                    <span>{crowdInfo.label}</span>
                  </span>

                  {/* Heritage Pressure Score Pill */}
                  <span 
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold backdrop-blur-md border ${
                      monument.heritagePressureScore > 75
                        ? 'bg-red-950/90 text-red-200 border-red-500/40'
                        : monument.heritagePressureScore > 50
                        ? 'bg-amber-950/90 text-amber-200 border-amber-500/40'
                        : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                    }`}
                    title="Heritage Pressure Score (HPS): Vulnerability based on footfall, weather & deterioration"
                  >
                    HPS: {monument.heritagePressureScore}
                  </span>

                </div>

              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                
                <div>
                  {/* Title & Hindi Name */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[#0D3B2E] font-serif-heritage leading-snug group-hover:text-[#C85A32] transition-colors">
                      {monument.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#1A2621]/60 font-medium mb-3 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{monument.city}, {monument.state}</span>
                  </p>

                  {/* Rating & Architecture Tag */}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-[#0D3B2E]/10 mb-3">
                    <div className="flex items-center space-x-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{monument.rating}</span>
                      <span className="text-gray-400 font-normal">({monument.reviewsCount})</span>
                    </div>

                    <span className="text-[11px] text-[#0D3B2E]/80 bg-[#0D3B2E]/5 px-2 py-0.5 rounded font-medium truncate max-w-[150px]">
                      {monument.architecturalStyle}
                    </span>
                  </div>

                  {/* Best Visiting Window Snippet */}
                  <div className="bg-[#F8F6F0] p-2.5 rounded-xl text-xs text-[#1A2621]/80 mb-3">
                    <div className="flex items-center space-x-1.5 font-semibold text-[#0D3B2E] mb-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Best Visiting Window:</span>
                    </div>
                    <p className="text-[11px] text-[#1A2621]/70 font-mono">
                      {monument.bestVisitingWindow.start} – {monument.bestVisitingWindow.end}
                    </p>
                  </div>

                  {/* Alternative Site Badge if Overcrowded */}
                  {monument.heritagePressureScore > 75 && monument.alternativeSites.length > 0 && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/80">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">
                        Alternative: <span className="font-semibold">{monument.alternativeSites[0].name}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Action Button */}
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0D3B2E] group-hover:underline flex items-center space-x-1">
                    <span>{language === 'hi' ? 'विस्तृत विवरण देखें' : 'View Full Details & 360°'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#0D3B2E] group-hover:translate-x-1 transition-transform" />
                  </span>

                  <span className="text-xs font-mono font-bold text-[#0D3B2E]">
                    ₹{monument.entryFee.indian}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* AI Assistant CTA Banner (Image 1 inspired - Bottom Right/Full width) */}
      <div className="bg-gradient-to-r from-[#0D3B2E] via-[#165342] to-[#08281E] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#D4AF37]/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Subtle Decorative Aura */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-3xl animate-bounce">🤖</span>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-heritage text-white mb-1">
              {language === 'hi' ? 'कहाँ जाना है, समझ नहीं आ रहा?' : 'Not sure where to go?'}
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              {language === 'hi'
                ? 'हमारे धरोहर एआई से पूछें। वह आपकी रुचियों और वर्तमान भीड़ के आधार पर सबसे उपयुक्त स्मारकों का सुझाव देगा।'
                : 'Let our AI Assistant suggest the best monuments and eco-alternative circuits for you based on your interests and live crowd levels.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0 relative z-10">
          <button
            onClick={onOpenAIChat}
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#c59b27] text-[#08281E] font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'hi' ? 'एआई गाइड से पूछें' : 'Ask AI Assistant'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
