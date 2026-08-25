import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Eye, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Languages, 
  Search, 
  Camera, 
  Cpu, 
  Compass,
  Play
} from 'lucide-react';
import { HIGH_RISK_SITES_SUMMARY } from '../../data/authorityMetricsData';

interface TouristHeroProps {
  language: 'en' | 'hi';
  onSelectTouristRole: () => void;
  onSelectAuthorityRole: () => void;
  onExploreMonuments: () => void;
  onOpenScanner: () => void;
  onOpenAIChat: () => void;
}

export const TouristHero: React.FC<TouristHeroProps> = ({
  language,
  onSelectTouristRole,
  onSelectAuthorityRole,
  onExploreMonuments,
  onOpenScanner,
  onOpenAIChat
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-16">
      
      {/* Background Subtle Gradient & Mandala Accent */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-mandala-pattern" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Left Column: Vision & Pathway Cards (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0D3B2E]/10 border border-[#0D3B2E]/20 text-[#0D3B2E] text-xs font-semibold mb-5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>
                  {language === 'hi'
                    ? 'अतुल्य भारत • एआई-आधारित एकीकृत धरोहर मंच'
                    : 'Next-Gen AI Heritage Conservation & Tourism Platform'}
                </span>
              </div>

              {/* Majestic Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0D3B2E] leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-5 font-serif-heritage">
                Preserve Our <span className="text-[#C85A32] underline decoration-[#D4AF37]/50 underline-offset-4">Heritage</span>.<br />
                Enrich Every Journey.
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-[#1A2621]/80 max-w-2xl leading-relaxed mb-6 sm:mb-8 font-medium">
                {language === 'hi'
                  ? 'हेरिटेजगार्ड एआई वास्तविक समय निगरानी, कंप्यूटर विज़न दरार पहचान, सटीक भीड़ भविष्यवाणी और व्यक्तिगत यात्रा योजनाओं के माध्यम से स्मारकों के संरक्षण और सुखद पर्यटन को जोड़ता है।'
                  : 'DhoroharDhirsti AI bridges conservation and tourism through intelligent insights, real-time visual damage monitoring, crowd forecasting, and sustainable personalized experiences.'}
              </p>
            </div>

            {/* Dual Pathway Interactive Cards (Image 3 inspired) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              
              {/* I'm a Tourist Card */}
              <div 
                onClick={onSelectTouristRole}
                className="group relative bg-[#0D3B2E] text-white p-6 rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#D4AF37]/30 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-[#D4AF37]/15 blur-xl group-hover:scale-150 transition-transform" />
                
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 border border-white/15">
                    <Compass className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                    <span>{language === 'hi' ? 'मैं पर्यटक हूँ' : "I'm a Tourist"}</span>
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed mb-6">
                    {language === 'hi'
                      ? 'स्मारक खोजें, इतिहास जानें, एआई स्कैनर से क्षति दर्ज करें और कम भीड़ वाली यात्राएं बनाएं।'
                      : 'Discover monuments, explore stories, scan damage, plan smart itineraries, and travel sustainably.'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-semibold text-[#D4AF37]">
                  <span>{language === 'hi' ? 'पर्यटक पोर्टल खोलें' : 'Start Exploring'}</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                </div>
              </div>

              {/* I'm an Authority Card */}
              <div 
                onClick={onSelectAuthorityRole}
                className="group relative bg-white text-[#0A1128] p-6 rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#0D3B2E]/15 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0A1128]/5 flex items-center justify-center mb-4 border border-[#0A1128]/10">
                    <ShieldCheck className="w-6 h-6 text-[#C85A32]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0A1128] mb-2 flex items-center justify-between">
                    <span>{language === 'hi' ? 'मैं प्राधिकरण / ASI हूँ' : "I'm an Authority"}</span>
                  </h3>
                  <p className="text-xs text-[#1A2621]/70 leading-relaxed mb-6">
                    {language === 'hi'
                      ? 'स्मारकों की स्थिति मॉनिटर करें, लाइव दरारें देखें, भीड़ नियंत्रित करें और मरम्मत को प्राथमिकता दें।'
                      : 'Monitor heritage sites, detect visual damage, manage crowd pressure, and prioritize conservation.'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-semibold text-[#0D3B2E]">
                  <span>{language === 'hi' ? 'कंट्रोल सेंटर खोलें' : 'Launch Control Center'}</span>
                  <div className="w-8 h-8 rounded-full bg-[#0D3B2E]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 text-[#0D3B2E]" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Live Heritage Pressure Map & Hero Stone Chariot Widget (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Live Heritage Pressure Map Card (Image 3 inspired) */}
            <div className="bg-[#0A1128] text-white p-5 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden flex-1">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <h4 className="text-sm font-bold tracking-wide uppercase text-white font-serif-heritage">
                    Heritage Pressure Map
                  </h4>
                </div>
                <span className="text-[11px] text-[#D4AF37] px-2 py-0.5 rounded bg-white/5 border border-[#D4AF37]/30">
                  Live Telemetry
                </span>
              </div>

              {/* Mini Map Visual with Pinpoints */}
              <div className="relative h-44 w-full bg-[#131E3A] rounded-xl border border-white/10 mb-4 overflow-hidden flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1600100397608-f010f445b23e?auto=format&fit=crop&w=800&q=80" 
                  alt="Hampi Stone Chariot"
                  className="absolute inset-0 w-full h-full object-cover opacity-25"
                />
                
                {/* SVG India Map Simulation overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-transparent" />
                
                {/* Hotspot Indicators */}
                <div className="absolute top-[28%] left-[45%] flex items-center space-x-1 animate-bounce">
                  <span className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/30"></span>
                  <span className="text-[10px] bg-red-950/90 text-red-200 px-1.5 py-0.5 rounded font-mono font-bold">Taj Mahal 91</span>
                </div>

                <div className="absolute top-[42%] left-[62%] flex items-center space-x-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/30"></span>
                  <span className="text-[10px] bg-amber-950/90 text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">Konark 82</span>
                </div>

                <div className="absolute bottom-[25%] left-[40%] flex items-center space-x-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/30"></span>
                  <span className="text-[10px] bg-amber-950/90 text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">Hampi 78</span>
                </div>

                {/* Map Legend */}
                <div className="absolute bottom-2 right-2 bg-[#0A1128]/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10 text-[9px] flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>High (80-100)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Med (50-80)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Low (0-50)</span>
                  </span>
                </div>
              </div>

              {/* Top High Risk Sites List */}
              <div>
                <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-2">
                  Top Critical Conservation Pressure Sites
                </p>
                <div className="space-y-1.5">
                  {HIGH_RISK_SITES_SUMMARY.slice(0, 4).map((site) => (
                    <div 
                      key={site.id}
                      className="flex items-center justify-between bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors border border-white/5 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        <span className="font-medium text-white">{site.name}</span>
                        <span className="text-[10px] text-white/50">({site.state})</span>
                      </div>
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-xs border border-red-500/40">
                        {site.riskScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Quick Action Bar */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onOpenScanner}
                className="flex items-center justify-center space-x-2 bg-[#D4AF37] hover:bg-[#c59b27] text-[#08281E] font-bold py-3 px-4 rounded-xl shadow-md transition-all text-xs"
              >
                <Camera className="w-4 h-4" />
                <span>{language === 'hi' ? 'स्मारक स्कैन करें' : 'AI Damage Scanner'}</span>
              </button>

              <button
                onClick={onOpenAIChat}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-[#F8F6F0] text-[#0D3B2E] font-bold py-3 px-4 rounded-xl border border-[#0D3B2E]/20 shadow-sm transition-all text-xs"
              >
                <Sparkles className="w-4 h-4 text-[#C85A32]" />
                <span>{language === 'hi' ? 'धरोहर AI से पूछें' : 'Ask Heritage AI'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Counter Stats Bar (Image 3 inspired) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#0D3B2E]/10 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#0D3B2E]/10">
            
            <div className="pt-3 md:pt-0">
              <p className="text-3xl font-bold text-[#0D3B2E] font-mono-stat">10,000+</p>
              <p className="text-xs text-[#1A2621]/70 font-medium mt-1">Heritage Sites Documented</p>
            </div>

            <div className="pt-3 md:pt-0">
              <p className="text-3xl font-bold text-[#C85A32] font-mono-stat">2M+</p>
              <p className="text-xs text-[#1A2621]/70 font-medium mt-1">Sustainable Travelers</p>
            </div>

            <div className="pt-3 md:pt-0">
              <p className="text-3xl font-bold text-[#0D3B2E] font-mono-stat">500+</p>
              <p className="text-xs text-[#1A2621]/70 font-medium mt-1">Protected Sites Monitored</p>
            </div>

            <div className="pt-3 md:pt-0">
              <p className="text-3xl font-bold text-emerald-700 font-mono-stat">95%</p>
              <p className="text-xs text-[#1A2621]/70 font-medium mt-1">Crowd Prediction Accuracy</p>
            </div>

            <div className="pt-3 md:pt-0 col-span-2 md:col-span-1">
              <p className="text-3xl font-bold text-[#D4AF37] font-mono-stat">12+</p>
              <p className="text-xs text-[#1A2621]/70 font-medium mt-1">Indian Languages Supported</p>
            </div>

          </div>
        </div>

        {/* Powered by Advanced AI Section (Image 3 inspired) */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#C85A32] uppercase tracking-widest mb-1">
              <span>✦</span>
              <span>Proprietary Technology</span>
              <span>✦</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0D3B2E]">
              Powered by Advanced AI & Computer Vision
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: AI Damage Detection */}
            <div className="bg-white p-6 rounded-2xl border border-[#0D3B2E]/10 hover:border-[#0D3B2E]/30 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0D3B2E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-emerald-700" />
              </div>
              <h4 className="text-base font-bold text-[#0D3B2E] mb-2">AI Damage Detection</h4>
              <p className="text-xs text-[#1A2621]/70 leading-relaxed">
                Computer Vision models detect cracks, salt erosion, dampness, micro-fissures, and vegetation overgrowth automatically from phone photos.
              </p>
            </div>

            {/* Feature 2: Historical Knowledge (RAG) */}
            <div className="bg-white p-6 rounded-2xl border border-[#0D3B2E]/10 hover:border-[#0D3B2E]/30 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-[#C85A32]" />
              </div>
              <h4 className="text-base font-bold text-[#0D3B2E] mb-2">Historical Knowledge (RAG)</h4>
              <p className="text-xs text-[#1A2621]/70 leading-relaxed">
                Source-grounded answers retrieved directly from Archaeological Survey of India (ASI) monographs, inscriptions, and UNESCO archives.
              </p>
            </div>

            {/* Feature 3: Crowd Prediction */}
            <div className="bg-white p-6 rounded-2xl border border-[#0D3B2E]/10 hover:border-[#0D3B2E]/30 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-blue-700" />
              </div>
              <h4 className="text-base font-bold text-[#0D3B2E] mb-2">Crowd Prediction Engine</h4>
              <p className="text-xs text-[#1A2621]/70 leading-relaxed">
                Machine learning forecast based on historical footfall, seasons, festivals, weather, and live ticket velocity to prevent overcrowding.
              </p>
            </div>

            {/* Feature 4: Smart Recommendations */}
            <div className="bg-white p-6 rounded-2xl border border-[#0D3B2E]/10 hover:border-[#0D3B2E]/30 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 text-purple-700" />
              </div>
              <h4 className="text-base font-bold text-[#0D3B2E] mb-2">Smart Recommendations</h4>
              <p className="text-xs text-[#1A2621]/70 leading-relaxed">
                Dynamic route optimization that suggests serene alternative heritage gems when primary sites exceed safe carrying capacity.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
