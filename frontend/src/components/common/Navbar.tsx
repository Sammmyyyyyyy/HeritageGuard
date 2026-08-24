import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Menu, 
  X, 
  Compass, 
  Calendar, 
  Camera, 
  Bot, 
  Activity, 
  Map, 
  BarChart3, 
  ShieldCheck, 
  ChevronDown, 
  User, 
  ArrowRight,
  Check
} from 'lucide-react';

interface NavbarProps {
  activeView: 'home' | 'tourist' | 'authority';
  onViewChange: (view: 'home' | 'tourist' | 'authority') => void;
  touristTab: 'discover' | 'itinerary' | 'scan' | 'ai-assistant';
  onTouristTabChange: (tab: 'discover' | 'itinerary' | 'scan' | 'ai-assistant') => void;
  authorityTab: 'overview' | 'monitoring' | 'analytics' | 'conservation';
  onAuthorityTabChange: (tab: 'overview' | 'monitoring' | 'analytics' | 'conservation') => void;
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  touristTab,
  onTouristTabChange,
  authorityTab,
  onAuthorityTabChange,
  language,
  onLanguageChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    onViewChange('home');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchInterface = (view: 'home' | 'tourist' | 'authority') => {
    onViewChange(view);
    setIsModeDropdownOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 relative select-none ${
      activeView === 'authority'
        ? 'bg-[#F4F7FB] border-b border-[#E2E8F0] shadow-xs'
        : 'bg-[#F9F7F1] border-b border-[#E8E2D5] shadow-xs'
    }`}>
      
      {/* =========================================================================
          HERITAGE BACKGROUND ILLUSTRATION LAYER (Exact attached asset)
          pointer-events: none, z-index: 0, object-fit: cover, object-position: center
         ========================================================================= */}
      <img 
        src="/assets/heritage-navbar-bg.png" 
        alt="" 
        className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 select-none transition-all duration-300 ${
          activeView === 'authority'
            ? 'opacity-70 filter hue-rotate-180 contrast-95'
            : 'opacity-85 mix-blend-multiply'
        }`}
        loading="eager"
      />

      {/* Main Navbar Content Container (relative z-10) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-20 sm:h-[84px] gap-2 sm:gap-4">
          
          {/* =========================================================================
              LEFT: Brand Logo & Wordmark (Acts as Home Button)
             ========================================================================= */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group select-none shrink-0"
            title="DharoharDrishti Home"
          >
            {/* Architectural Emblem Icon */}
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 border ${
              activeView === 'authority'
                ? 'bg-[#0F2B48] text-[#63B3ED] border-blue-400/30'
                : 'bg-[#0D3B2E] text-[#D4AF37] border-[#D4AF37]/30'
            }`}>
              <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 20h16M2 20h20M12 2v4M6 6h12M5 6v14M19 6v14M9 6v14M15 6v14M12 6v4M8 10h8M9 14h6" />
              </svg>
            </div>
            
            {/* Wordmark */}
            <div className="flex flex-col">
              <span className={`font-serif-heritage text-base sm:text-lg lg:text-xl font-bold tracking-tight leading-none ${
                activeView === 'authority' ? 'text-[#0F2B48]' : 'text-[#0D3B2E]'
              }`}>
                DHAROHAR<span className={activeView === 'authority' ? 'text-[#2B6CB0]' : 'text-[#C85A32]'}>DRISHTI</span>
              </span>
              <span className="text-[8px] sm:text-[9.5px] tracking-[0.22em] uppercase font-bold text-[#6B7280] mt-0.5 sm:mt-1">
                HERITAGEGUARD AI
              </span>
            </div>
          </div>

          {/* =========================================================================
              CENTER: 3 Contextual Navigation States (Desktop & Tablet)
             ========================================================================= */}
          
          {/* STATE 1: HOME / LANDING NAVBAR */}
          {activeView === 'home' && (
            <nav className="hidden md:flex items-center space-x-3 shrink-0">
              <button
                onClick={() => handleSwitchInterface('tourist')}
                className="px-4 lg:px-5 py-2.5 rounded-full border border-[#D1D5DB] bg-white/70 hover:bg-white text-xs lg:text-sm font-semibold text-[#1F2937] flex items-center space-x-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span>🧑</span>
                <span>Tourist</span>
                <ArrowRight className="w-4 h-4 text-gray-500 ml-0.5" />
              </button>

              <button
                onClick={() => handleSwitchInterface('authority')}
                className="px-4 lg:px-5 py-2.5 rounded-full border border-[#D1D5DB] bg-white/70 hover:bg-white text-xs lg:text-sm font-semibold text-[#1F2937] flex items-center space-x-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span>🏛</span>
                <span>Authority</span>
                <ArrowRight className="w-4 h-4 text-gray-500 ml-0.5" />
              </button>
            </nav>
          )}

          {/* STATE 2: TOURIST CONTEXTUAL NAVBAR */}
          {activeView === 'tourist' && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <button
                onClick={() => onTouristTabChange('discover')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  touristTab === 'discover'
                    ? 'bg-[#0D3B2E] text-white shadow-sm'
                    : 'text-[#0D3B2E] hover:bg-[#0D3B2E]/8'
                }`}
              >
                <Compass className={`w-4 h-4 ${touristTab === 'discover' ? 'text-white' : 'text-[#0D3B2E]'}`} />
                <span>Discover</span>
              </button>

              <button
                onClick={() => onTouristTabChange('itinerary')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  touristTab === 'itinerary'
                    ? 'bg-[#0D3B2E] text-white shadow-sm'
                    : 'text-[#0D3B2E] hover:bg-[#0D3B2E]/8'
                }`}
              >
                <Calendar className={`w-4 h-4 ${touristTab === 'itinerary' ? 'text-white' : 'text-[#0D3B2E]'}`} />
                <span>Plan Journey</span>
              </button>

              <button
                onClick={() => onTouristTabChange('scan')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  touristTab === 'scan'
                    ? 'bg-[#0D3B2E] text-white shadow-sm'
                    : 'text-[#0D3B2E] hover:bg-[#0D3B2E]/8'
                }`}
              >
                <Camera className={`w-4 h-4 ${touristTab === 'scan' ? 'text-white' : 'text-[#0D3B2E]'}`} />
                <span>Scan</span>
              </button>

              <button
                onClick={() => onTouristTabChange('ai-assistant')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  touristTab === 'ai-assistant'
                    ? 'bg-[#0D3B2E] text-white shadow-sm'
                    : 'text-[#0D3B2E] hover:bg-[#0D3B2E]/8'
                }`}
              >
                <Bot className={`w-4 h-4 ${touristTab === 'ai-assistant' ? 'text-white' : 'text-[#0D3B2E]'}`} />
                <span>Heritage AI</span>
              </button>
            </nav>
          )}

          {/* STATE 3: AUTHORITY CONTEXTUAL NAVBAR */}
          {activeView === 'authority' && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <button
                onClick={() => onAuthorityTabChange('overview')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  authorityTab === 'overview'
                    ? 'bg-[#0F2B48] text-white shadow-sm'
                    : 'text-[#1A365D] hover:bg-[#1A365D]/8'
                }`}
              >
                <Activity className={`w-4 h-4 ${authorityTab === 'overview' ? 'text-[#E28743]' : 'text-[#E28743]'}`} />
                <span>Overview</span>
              </button>

              <button
                onClick={() => onAuthorityTabChange('monitoring')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  authorityTab === 'monitoring'
                    ? 'bg-[#0F2B48] text-white shadow-sm'
                    : 'text-[#1A365D] hover:bg-[#1A365D]/8'
                }`}
              >
                <Map className={`w-4 h-4 ${authorityTab === 'monitoring' ? 'text-white' : 'text-[#3182CE]'}`} />
                <span>Monitoring</span>
              </button>

              <button
                onClick={() => onAuthorityTabChange('analytics')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  authorityTab === 'analytics'
                    ? 'bg-[#0F2B48] text-white shadow-sm'
                    : 'text-[#1A365D] hover:bg-[#1A365D]/8'
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${authorityTab === 'analytics' ? 'text-white' : 'text-[#805AD5]'}`} />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => onAuthorityTabChange('conservation')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  authorityTab === 'conservation'
                    ? 'bg-[#0F2B48] text-white shadow-sm'
                    : 'text-[#1A365D] hover:bg-[#1A365D]/8'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${authorityTab === 'conservation' ? 'text-white' : 'text-[#38A169]'}`} />
                <span>Conservation</span>
              </button>
            </nav>
          )}

          {/* =========================================================================
              RIGHT: Contextual Mode Selector, Language & Profile
             ========================================================================= */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Tourist Mode Selector (Always 100% visible on Tourist pages) */}
            {activeView === 'tourist' && (
              <div className="relative shrink-0" ref={modeDropdownRef}>
                <button
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-[#86EFAC] bg-[#F0FDF4] hover:bg-[#DCFCE7] text-xs sm:text-sm font-semibold text-[#15803D] shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                  title="Switch Mode"
                >
                  <span className="text-xs">🧑</span>
                  <span>Tourist Mode</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5 shrink-0" />
                </button>

                {/* Dropdown Menu (Opens cleanly outside header without clipping) */}
                {isModeDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 animate-fadeIn">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-2 py-1">
                      Switch Platform View
                    </p>
                    <button
                      onClick={() => handleSwitchInterface('tourist')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-[#0D3B2E] cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span>🧑</span>
                        <span>Tourist Interface</span>
                      </div>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => handleSwitchInterface('authority')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span>🏛</span>
                        <span>Authority Center</span>
                      </div>
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => handleSwitchInterface('home')}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-gray-50 cursor-pointer font-medium"
                    >
                      <span>🏠</span>
                      <span>Back to Home</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Authority Portal Selector (Always 100% visible on Authority pages) */}
            {activeView === 'authority' && (
              <div className="relative shrink-0" ref={modeDropdownRef}>
                <button
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-xs sm:text-sm font-semibold text-[#1D4ED8] shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                  title="Switch Mode"
                >
                  <span className="text-xs">🏛</span>
                  <span>Authority Portal</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5 shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {isModeDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 animate-fadeIn">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-2 py-1">
                      Switch Platform View
                    </p>
                    <button
                      onClick={() => handleSwitchInterface('authority')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-[#1E40AF] cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span>🏛</span>
                        <span>Authority Center</span>
                      </div>
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleSwitchInterface('tourist')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span>🧑</span>
                        <span>Tourist Interface</span>
                      </div>
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => handleSwitchInterface('home')}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-gray-50 cursor-pointer font-medium"
                    >
                      <span>🏠</span>
                      <span>Back to Home</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Language Selector */}
            <div className="flex items-center px-3 sm:px-4 py-2 rounded-full border border-[#D1D5DB] bg-white/70 hover:bg-white text-xs sm:text-sm font-semibold text-[#374151] shadow-2xs transition-all cursor-pointer shrink-0">
              <Globe className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1 sm:mr-1.5 text-[#C85A32] shrink-0" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as 'en' | 'hi')}
                aria-label="Select Language"
                className="bg-transparent outline-none cursor-pointer text-xs sm:text-sm font-semibold text-[#374151]"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            {/* User Profile Avatar Icon */}
            <div className="relative shrink-0" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-9 h-9 rounded-full p-0.5 shadow-2xs cursor-pointer hover:scale-105 transition-transform flex items-center justify-center text-white shrink-0 ${
                  activeView === 'authority'
                    ? 'bg-gradient-to-tr from-[#0F2B48] to-[#1E40AF]'
                    : 'bg-gradient-to-tr from-[#3D4F37] to-[#8C7335]'
                }`}
                title="User Profile"
              >
                <User className="w-4 h-4" />
              </button>

              {/* Profile Popover */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 animate-fadeIn space-y-2">
                  <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      activeView === 'authority' ? 'bg-[#0F2B48]' : 'bg-[#0D3B2E]'
                    }`}>
                      {activeView === 'authority' ? 'ASI' : 'TG'}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {activeView === 'authority' ? 'Ayush K. Maurya' : 'Heritage Explorer'}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {activeView === 'authority' ? 'ASI Chief Conservator' : 'Level 2 Citizen Contributor'}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1.5 pt-1">
                    <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <span>Saved Monuments</span>
                      <span className="font-semibold text-gray-900">4</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <span>Submitted Scans</span>
                      <span className="font-semibold text-emerald-600">2 Verified</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <span>Platform Status</span>
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Sync</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle (< md) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/80 border border-gray-200 text-[#0D3B2E] hover:bg-white transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

          </div>

        </div>

        {/* =========================================================================
            MOBILE DROPDOWN DRAWER (< md)
           ========================================================================= */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-gray-200/80 space-y-2 animate-fadeIn bg-white/98 rounded-b-2xl shadow-2xl relative z-50">
            
            {/* Tourist Links */}
            {activeView === 'tourist' && (
              <div className="space-y-1 pb-2 border-b border-gray-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 py-1">Tourist Navigation</p>
                <button
                  onClick={() => { onTouristTabChange('discover'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    touristTab === 'discover' ? 'bg-[#0D3B2E] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Discover Monuments</span>
                </button>
                <button
                  onClick={() => { onTouristTabChange('itinerary'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    touristTab === 'itinerary' ? 'bg-[#0D3B2E] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Plan Journey & Itinerary</span>
                </button>
                <button
                  onClick={() => { onTouristTabChange('scan'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    touristTab === 'scan' ? 'bg-[#0D3B2E] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>AI Damage Scanner</span>
                </button>
                <button
                  onClick={() => { onTouristTabChange('ai-assistant'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    touristTab === 'ai-assistant' ? 'bg-[#0D3B2E] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask Heritage AI</span>
                </button>
              </div>
            )}

            {/* Authority Links */}
            {activeView === 'authority' && (
              <div className="space-y-1 pb-2 border-b border-gray-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 py-1">Authority Navigation</p>
                <button
                  onClick={() => { onAuthorityTabChange('overview'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    authorityTab === 'overview' ? 'bg-[#0F2B48] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Activity className="w-4 h-4 text-[#E28743]" />
                  <span>Control Center Overview</span>
                </button>
                <button
                  onClick={() => { onAuthorityTabChange('monitoring'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    authorityTab === 'monitoring' ? 'bg-[#0F2B48] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Map className="w-4 h-4 text-[#3182CE]" />
                  <span>Site Map & Monitoring</span>
                </button>
                <button
                  onClick={() => { onAuthorityTabChange('analytics'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    authorityTab === 'analytics' ? 'bg-[#0F2B48] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-[#805AD5]" />
                  <span>Risk Matrix & Analytics</span>
                </button>
                <button
                  onClick={() => { onAuthorityTabChange('conservation'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    authorityTab === 'conservation' ? 'bg-[#0F2B48] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#38A169]" />
                  <span>Conservation & Inspector</span>
                </button>
              </div>
            )}

            {/* Interface Switchers */}
            <div className="pt-2 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3">Switch Mode</p>
              <div className="grid grid-cols-2 gap-2 px-1">
                <button
                  onClick={() => handleSwitchInterface('tourist')}
                  className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                    activeView === 'tourist'
                      ? 'bg-[#0D3B2E] text-white border-[#0D3B2E]'
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  }`}
                >
                  <span>🧑</span>
                  <span>Tourist</span>
                </button>

                <button
                  onClick={() => handleSwitchInterface('authority')}
                  className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                    activeView === 'authority'
                      ? 'bg-[#0F2B48] text-white border-[#0F2B48]'
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  }`}
                >
                  <span>🏛</span>
                  <span>Authority</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </header>
  );
};
