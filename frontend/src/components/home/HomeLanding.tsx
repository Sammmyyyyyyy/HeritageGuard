import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Building2, 
  HeartHandshake, 
  Globe2, 
  Play, 
  X,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { createSvgFallback } from '../../assets/monumentImages';

interface HomeLandingProps {
  language: 'en' | 'hi';
  onNavigateToTourist: () => void;
  onNavigateToAuthority: () => void;
}

interface HeroSlide {
  id: string;
  name: string;
  location: string;
  imageSrc: string;
  objectPosition: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    imageSrc: '/images/hero_taj_sunset.jpg',
    objectPosition: 'center center'
  },
  {
    id: 'qutub-minar',
    name: 'Qutub Minar',
    location: 'Mehrauli, New Delhi',
    imageSrc: '/images/hero_qutub_minar.jpg',
    objectPosition: 'center 20%'
  },
  {
    id: 'ellora-caves',
    name: 'Ellora Rock-Cut Caves',
    location: 'Chhatrapati Sambhaji Nagar, Maharashtra',
    imageSrc: '/images/hero_ellora_caves.png',
    objectPosition: 'center center'
  }
];

const CardCyberFX = () => (
  <>
    <div className="card-glare" />
    <div className="glowing-elements">
      <div className="glow-1" />
      <div className="glow-2" />
      <div className="glow-3" />
    </div>
    <div className="card-particles">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
    <div className="corner-elements">
      <span />
      <span />
      <span />
      <span />
    </div>
    <div className="scan-line" />
    <div className="cyber-lines">
      <span />
      <span />
      <span />
      <span />
    </div>
  </>
);

export const HomeLanding: React.FC<HomeLandingProps> = ({
  language,
  onNavigateToTourist,
  onNavigateToAuthority
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [visionImgSrc, setVisionImgSrc] = useState(
    'https://images.unsplash.com/photo-1588096344356-9b4009f4460f?auto=format&fit=crop&w=800&q=80'
  );

  // Infinite Auto-Advance Carousel with silky smooth crossfade (3.2 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  return (
    <div className="space-y-8 sm:space-y-10 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
      
      {/* 1. Panoramic Hero Section with Infinite Marquee / Cross-fading Heritage Background */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/30 min-h-[540px] sm:min-h-[600px] lg:min-h-[620px] flex flex-col justify-between p-4 sm:p-8 lg:p-10 bg-[#0E1524]">
        
        {/* Infinite Silky-Smooth Crossfade Background Layers */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <div
                key={slide.id}
                className={`carousel-slide-layer ${
                  isActive ? 'carousel-slide-active' : 'carousel-slide-inactive'
                }`}
              >
                <img
                  src={slide.imageSrc}
                  alt={slide.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createSvgFallback(slide.name, slide.location, ['#0D3B2E', '#165342']);
                  }}
                  style={{ objectPosition: slide.objectPosition }}
                  className="w-full h-full object-cover filter brightness-[0.96] contrast-[1.04]"
                />
              </div>
            );
          })}
          
          {/* Subtle Sheer Gradient for readability across mobile and desktop */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 sm:from-black/55 via-black/40 sm:via-black/25 to-transparent sm:w-[55%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Top Header Row: Badge & Slide Controls */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1 rounded-full bg-black/40 border border-white/25 text-[#D4AF37] text-[10px] sm:text-xs font-bold backdrop-blur-md shadow-sm">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate max-w-[200px] xs:max-w-none">
              {language === 'hi'
                ? 'अतुल्य भारत • एआई धरोहर मंच'
                : 'Next-Gen AI Heritage Conservation & Tourism'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Monument Location Tag */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-white text-[11px] font-medium backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{currentSlide.name}</span>
              <span className="text-white/60">({currentSlide.location.split(',')[0]})</span>
            </div>

            {/* Slider Arrow Controls */}
            <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20 text-white">
              <button
                onClick={handlePrevSlide}
                aria-label="Previous slide"
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextSlide}
                aria-label="Next slide"
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Headline on the Left */}
        <div className="relative z-10 max-w-lg space-y-2.5 sm:space-y-3 pt-4 sm:pt-6">
          <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-[1.15] sm:leading-[1.1] font-serif-heritage drop-shadow-md">
            Preserve Our <span className="text-[#D4AF37]">Heritage</span>.<br />
            Enrich Every Journey.
          </h1>

          <p className="text-xs sm:text-sm text-white/90 max-w-md leading-relaxed font-medium drop-shadow-sm">
            {language === 'hi'
              ? 'धरोहर दृष्टि वास्तविक समय निगरानी, कंप्यूटर विज़न दरार पहचान, भीड़ भविष्यवाणी और सतत यात्रा योजनाओं के माध्यम से स्मारकों के संरक्षण और सुखद पर्यटन को जोड़ता है।'
              : 'DhoroharDhirsti AI bridges conservation and tourism through intelligent insights, real-time monitoring, and personalized experiences.'}
          </p>
        </div>

        {/* Two 3D Interactive Tracker Perspective Pathway Cards (Uiverse.io by 00Kubi) */}
        <div className="relative z-10 pt-4 sm:pt-6 w-full">
          <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 w-full max-w-full sm:max-w-xl">
            
            {/* 🧑‍🦱 "Explore as Tourist" 3D Tracker Perspective Card */}
            <div className="tracker-container select-none">
              <div 
                className="tracker-canvas" 
                onClick={onNavigateToTourist}
                role="button"
                tabIndex={0}
                title="Explore as Tourist"
              >
                {Array.from({ length: 25 }, (_, i) => (
                  <div key={i} className={`tracker tr-${i + 1}`} />
                ))}
                
                <div className="tracker-3d-card">
                  <div className="flex items-start justify-between relative z-10">
                    <span className="text-sm sm:text-[15px] font-bold text-white tracking-wide">
                      {language === 'hi' ? 'पर्यटक अन्वेषण' : 'Explore as Tourist'}
                    </span>
                    <div className="w-7.5 h-7.5 rounded-lg bg-black/40 border border-[#D4AF37]/60 flex items-center justify-center shadow-md shrink-0">
                      <Compass className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-[12px] text-white/85 line-clamp-2 my-1 leading-snug relative z-10">
                    {language === 'hi'
                      ? 'स्मारक खोजें, इतिहास जानें, एआई यात्रा बनाएं और सतत घूमें।'
                      : 'Discover monuments, explore stories, plan smart itineraries and travel sustainably.'}
                  </p>

                  <div className="flex items-center justify-between pt-0.5 relative z-10">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#D4AF37] text-[#0A1128] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider shadow-md hover:bg-white transition-colors">
                      <span>{language === 'hi' ? 'पर्यटक पोर्टल' : 'Explore as Tourist'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  <CardCyberFX />
                </div>
              </div>
            </div>

            {/* 🏛️ "Enter Authority Center" 3D Tracker Perspective Card */}
            <div className="tracker-container select-none">
              <div 
                className="tracker-canvas" 
                onClick={onNavigateToAuthority}
                role="button"
                tabIndex={0}
                title="Enter Authority Center"
              >
                {Array.from({ length: 25 }, (_, i) => (
                  <div key={i} className={`tracker tr-${i + 1}`} />
                ))}
                
                <div className="tracker-3d-card authority-style">
                  <div className="flex items-start justify-between relative z-10">
                    <span className="text-sm sm:text-[15px] font-bold text-white tracking-wide">
                      {language === 'hi' ? 'प्राधिकरण केंद्र' : 'Enter Authority Center'}
                    </span>
                    <div className="w-7.5 h-7.5 rounded-lg bg-black/40 border border-[#63B3ED]/60 flex items-center justify-center shadow-md shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[#63B3ED]" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-[12px] text-white/85 line-clamp-2 my-1 leading-snug relative z-10">
                    {language === 'hi'
                      ? 'स्मारकों की स्थिति देखें, दरारें जांचें, भीड़ प्रबंधित करें और संरक्षण करें।'
                      : 'Monitor heritage sites, detect visual damage, manage crowds and prioritize conservation.'}
                  </p>

                  <div className="flex items-center justify-between pt-0.5 relative z-10">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#63B3ED] text-[#0A1128] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider shadow-md hover:bg-white transition-colors">
                      <span>{language === 'hi' ? 'कंट्रोल सेंटर' : 'Enter Authority Center'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  <CardCyberFX />
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Dot Indicators for the 3 Slide Marquee */}
          <div className="flex items-center space-x-1.5 pt-4">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlideIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlideIndex 
                    ? 'w-6 bg-[#D4AF37] shadow-sm' 
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

      </section>

      {/* 2. Key Numbers & Metrics Strip */}
      <section className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-[#0D3B2E]/10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-center text-center divide-y sm:divide-y-0 sm:divide-x divide-[#0D3B2E]/10">
          
          <div className="space-y-0.5 pt-2 sm:pt-0">
            <p className="text-xl sm:text-2xl font-bold text-[#0D3B2E] font-mono-stat tracking-tight">10,000+</p>
            <p className="text-[11px] text-gray-500 font-medium">
              {language === 'hi' ? 'सक्रिय आईओटी सेंसर' : 'Active IoT Sensors'}
            </p>
          </div>

          <div className="space-y-0.5 pt-2 sm:pt-0">
            <p className="text-xl sm:text-2xl font-bold text-[#C85A32] font-mono-stat tracking-tight">2M+</p>
            <p className="text-[11px] text-gray-500 font-medium">
              {language === 'hi' ? 'सस्टेनेबल यात्री' : 'Sustainable Travelers'}
            </p>
          </div>

          <div className="space-y-0.5 pt-2 sm:pt-0">
            <p className="text-xl sm:text-2xl font-bold text-[#0D3B2E] font-mono-stat tracking-tight">500+</p>
            <p className="text-[11px] text-gray-500 font-medium">
              {language === 'hi' ? 'संरक्षित स्मारक' : 'Protected Monuments'}
            </p>
          </div>

          <div className="space-y-0.5 pt-2 sm:pt-0">
            <p className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono-stat tracking-tight">95%</p>
            <p className="text-[11px] text-gray-500 font-medium">
              {language === 'hi' ? 'भीड़ पूर्वानुमान सटीकता' : 'Crowd Forecast Accuracy'}
            </p>
          </div>

          <div className="space-y-0.5 pt-2 sm:pt-0">
            <p className="text-xl sm:text-2xl font-bold text-[#D4AF37] font-mono-stat tracking-tight">12+</p>
            <p className="text-[11px] text-gray-500 font-medium">
              {language === 'hi' ? 'क्षेत्रीय भाषाएं' : 'Regional Languages'}
            </p>
          </div>

          <div className="space-y-0.5 pt-2 sm:pt-0 col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
            <span className="text-emerald-700 font-semibold text-xs flex items-center space-x-1">
              <span>🌱</span>
              <span>{language === 'hi' ? 'सतत पर्यटन' : 'Sustainable Tourism'}</span>
            </span>
            <p className="text-[10px] text-gray-400 font-normal mt-0.5">
              {language === 'hi' ? 'धरोहर संरक्षण' : 'Heritage Preservation'}
            </p>
          </div>

        </div>
      </section>

      {/* 3. Bottom Grid: "Powered by Advanced AI" (Left) + Video Vision Showcase Card (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left (7 cols): Powered by Advanced AI with 4 circular badges */}
        <div className="lg:col-span-7 bg-[#F8F6F0] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#0D3B2E]/10 flex flex-col justify-between space-y-6">
          
          <div className="flex items-center justify-center space-x-3 text-center">
            <span className="text-[#D4AF37]">✦</span>
            <h3 className="text-sm sm:text-base font-bold text-[#0D3B2E] font-serif-heritage uppercase tracking-wider">
              {language === 'hi' ? 'उन्नत एआई द्वारा संचालित' : 'Powered by Advanced AI'}
            </h3>
            <span className="text-[#D4AF37]">✦</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* 1. AI Damage Detection Blob Card */}
            <div className="blob-card group">
              <div className="blob-shape blob-emerald" />
              <div className="blob-card-bg">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs border border-emerald-200 shadow-xs mb-1">
                  82<span className="text-[9px] text-gray-400">/100</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0D3B2E] font-serif-heritage">
                    {language === 'hi' ? 'एआई क्षति पहचान' : 'AI Damage Detection'}
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {language === 'hi'
                      ? 'दरारें, क्षरण, नमी और मलिनकिरण का स्वचालित पता लगाएं।'
                      : 'Detect cracks, erosion, moisture and discoloration automatically.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Historical RAG Blob Card */}
            <div className="blob-card group">
              <div className="blob-shape blob-gold" />
              <div className="blob-card-bg">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-[#C85A32] flex items-center justify-center text-xl border border-amber-200 shadow-xs mb-1">
                  📚
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0D3B2E] font-serif-heritage">
                    {language === 'hi' ? 'ऐतिहासिक आरएजी' : 'Historical RAG'}
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {language === 'hi'
                      ? 'एएसआई दस्तावेजों पर आधारित सटीक प्रामाणिक उत्तर।'
                      : 'Accurate source-backed answers from trusted ASI documents.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Crowd Prediction Blob Card */}
            <div className="blob-card group">
              <div className="blob-shape blob-blue" />
              <div className="blob-card-bg">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center text-xl border border-blue-200 shadow-xs mb-1">
                  👥
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0D3B2E] font-serif-heritage">
                    {language === 'hi' ? 'भीड़ पूर्वानुमान' : 'Crowd Prediction'}
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {language === 'hi'
                      ? 'समय, तिथि और मौसम के अनुसार उच्च सटीकता से भीड़ का पूर्वानुमान।'
                      : 'Forecast visitor density by time, date, and season with high accuracy.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Smart Itinerary Blob Card */}
            <div className="blob-card group">
              <div className="blob-shape blob-purple" />
              <div className="blob-card-bg">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-800 flex items-center justify-center text-xl border border-purple-200 shadow-xs mb-1">
                  🗺️
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0D3B2E] font-serif-heritage">
                    {language === 'hi' ? 'स्मार्ट यात्रा योजना' : 'Smart Itinerary'}
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {language === 'hi'
                      ? 'पर्यटन अनुभव और धरोहर संरक्षण को संतुलित करने वाले व्यक्तिगत मार्ग।'
                      : 'Personalized routes that balance tourist experience & conservation.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right (5 cols): Uniting Heritage Conservation & Intelligent Tourism Video Showcase Card */}
        <div className="lg:col-span-5 bg-[#0C1527] text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
          
          <div className="relative h-40 sm:h-44 w-full rounded-2xl overflow-hidden mb-4 border border-white/10 bg-slate-900">
            <img
              src={visionImgSrc}
              alt="Heritage Conservation Vision"
              onError={() => {
                setVisionImgSrc(createSvgFallback('Jodhpur Fort', 'Heritage Conservation Vision', ['#0A1128', '#1C2E56']));
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <button
                onClick={() => setShowVideoModal(false)}
                className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md hover:bg-white text-[#0A1128] flex items-center justify-center transition-all cursor-pointer shadow-xl group-hover:scale-110"
                title={language === 'hi' ? 'विजन वीडियो देखें' : 'Play Vision Video'}
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white font-serif-heritage">
                {language === 'hi'
                  ? 'धरोहर संरक्षण और बुद्धिमत्तापूर्ण पर्यटन का संगम।'
                  : 'Uniting Heritage Conservation and Intelligent Tourism.'}
              </h4>
              <p className="text-[11px] text-white/70 mt-1">
                {language === 'hi'
                  ? 'आइए मिलकर अपने अतीत की रक्षा करें और भविष्य को प्रेरित करें।'
                  : "Together, let's protect our past and inspire the future."}
              </p>
            </div>

            <button
              onClick={() => onNavigateToTourist()}
              className="px-4 py-2 rounded-xl bg-white text-[#0A1128] hover:bg-gray-100 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>{language === 'hi' ? 'हमारा विजन देखें' : 'Explore Our Vision'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </section>

      {/* 4. Strategic Collaboration & Trust Bar */}
      <section className="bg-[#0C1527] text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
          <span className="text-xs text-white/60 font-semibold uppercase tracking-wider w-full sm:w-auto text-center sm:text-left">
            {language === 'hi' ? 'विश्वासपात्र सहयोगी' : 'Trusted by'}
          </span>
          
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold">{language === 'hi' ? 'पर्यटन मंत्रालय' : 'Ministry of Tourism'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold">{language === 'hi' ? 'भारतीय पुरातत्व सर्वेक्षण' : 'Archaeological Survey of India'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold">INTACH</span>
          </div>

          <div className="flex items-center space-x-2">
            <Globe2 className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold">{language === 'hi' ? 'यूनेस्को' : 'UNESCO'}</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-6 text-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <div>
            <p className="text-base font-bold font-mono text-[#D4AF37]">7,200+</p>
            <p className="text-[9px] text-white/60">{language === 'hi' ? 'स्मारक' : 'Monuments'}</p>
          </div>
          <div>
            <p className="text-base font-bold font-mono text-white">28</p>
            <p className="text-[9px] text-white/60">{language === 'hi' ? 'राज्य' : 'States'}</p>
          </div>
          <div>
            <p className="text-base font-bold font-mono text-[#10B981]">100%</p>
            <p className="text-[9px] text-white/60">{language === 'hi' ? 'संरक्षित' : 'Protected'}</p>
          </div>
        </div>

      </section>

    </div>
  );
};
