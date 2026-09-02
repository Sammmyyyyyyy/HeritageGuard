import React from 'react';
import { ShieldCheck, HeartHandshake, PhoneCall, Globe2, Sparkles, Building2 } from 'lucide-react';

interface FooterProps {
  language: 'en' | 'hi';
  onNavigate?: (tab: string) => void;
  onViewChange?: (view: 'home' | 'tourist' | 'authority') => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate, onViewChange }) => {
  const handleNav = (target: 'home' | 'tourist' | 'authority') => {
    if (onViewChange) {
      onViewChange(target);
    } else if (onNavigate) {
      onNavigate(target);
    }
  };

  return (
    <footer className="bg-[#08281E] text-[#F8F6F0] border-t border-[#D4AF37]/20 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Partner & Trust Bar (Image 3 inspired) */}
        <div className="pb-8 sm:pb-10 border-b border-white/10">
          <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold mb-6 text-center">
            {language === 'hi' ? 'मान्यता प्राप्त एवं समर्थित' : 'In Strategic Collaboration With'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center justify-center opacity-85">
            <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
              <Building2 className="w-6 h-6 text-[#D4AF37] shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">
                  {language === 'hi' ? 'पर्यटन मंत्रालय' : 'Ministry of Tourism'}
                </p>
                <p className="text-[10px] text-white/60">
                  {language === 'hi' ? 'भारत सरकार' : 'Government of India'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
              <ShieldCheck className="w-6 h-6 text-[#D4AF37] shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">
                  {language === 'hi' ? 'भारतीय पुरातत्व सर्वेक्षण' : 'Archaeological Survey'}
                </p>
                <p className="text-[10px] text-white/60">
                  {language === 'hi' ? 'एएसआई (ASI)' : 'of India (ASI)'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
              <HeartHandshake className="w-6 h-6 text-[#D4AF37] shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">
                  {language === 'hi' ? 'इंटेक (INTACH)' : 'INTACH National Trust'}
                </p>
                <p className="text-[10px] text-white/60">
                  {language === 'hi' ? 'कला एवं सांस्कृतिक धरोहर' : 'Art & Cultural Heritage'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
              <Globe2 className="w-6 h-6 text-[#D4AF37] shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">
                  {language === 'hi' ? 'यूनेस्को धरोहर' : 'UNESCO Heritage'}
                </p>
                <p className="text-[10px] text-white/60">
                  {language === 'hi' ? 'विश्व धरोहर केंद्र' : 'World Heritage Centre'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 py-8 sm:py-10">
          
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37] text-[#08281E] flex items-center justify-center font-bold">
                🏛️
              </div>
              <div>
                <span className="font-regal text-xl font-bold tracking-tight text-white">
                  Dharohar<span className="text-[#D4AF37]">Drishti</span>
                </span>
                <p className="text-[10px] text-white/60">
                  {language === 'hi' ? 'धरोहर दृष्टि एआई मंच' : 'DharoharDrishti AI Platform'}
                </p>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              {language === 'hi'
                ? 'भारत भर के स्मारकों की दीर्घायु, सतत भीड़ संतुलन और समृद्ध सांस्कृतिक पर्यटन के लिए कृत्रिम बुद्धिमत्ता का उपयोग।'
                : 'Pioneering artificial intelligence for monument longevity, sustainable crowd balancing, and immersive cultural storytelling across India.'}
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#D4AF37]">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'hi' ? 'एएसआई नवाचार सहयोगी' : 'ASI Innovation Partner'}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
              {language === 'hi' ? 'पर्यटक समाधान' : 'Tourist Features'}
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <button onClick={() => handleNav('tourist')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'स्मार्ट एआई यात्रा योजना जनरेटर' : 'Smart AI Itinerary Generator'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('tourist')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'लाइव धरोहर दबाव हीटमैप' : 'Live Heritage Pressure Heatmap'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('tourist')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'नागरिक क्षति रिपोर्टर और स्कैनर' : 'Citizen Damage Reporter & Scanner'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('tourist')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'ऐतिहासिक आरएजी प्रश्नोत्तर सहायक' : 'Historical RAG Q&A Assistant'}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
              {language === 'hi' ? 'प्राधिकरण समाधान' : 'Authority Control'}
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <button onClick={() => handleNav('authority')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'कंप्यूटर विज़न दरार और क्षरण पहचान' : 'Computer Vision Crack & Spalling AI'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('authority')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'धरोहर दबाव मैट्रिक्स (HPS)' : 'Heritage Pressure Matrix (HPS)'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('authority')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'लाइव फुटफॉल थ्रॉटलिंग व गेटिंग' : 'Live Footfall Throttling & Gating'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('authority')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'एएसआई आपातकालीन टीम प्रेषण' : 'ASI Emergency Dispatch Workflow'}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
              {language === 'hi' ? 'हेल्पलाइन व संपर्क' : 'Conservation Support'}
            </h4>
            <p className="text-xs text-white/70 mb-3">
              {language === 'hi'
                ? 'तत्काल संरचनात्मक क्षति, अवैध खनन या खतरनाक दरारों की रिपोर्ट करें।'
                : 'Report urgent structural vandalism, illegal digging, or hazardous cracks.'}
            </p>
            <div className="flex items-center space-x-2 text-xs bg-white/10 p-2.5 rounded-lg border border-white/10">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-bold text-white">1800-11-1363</p>
                <p className="text-[10px] text-white/60">
                  {language === 'hi' ? '24x7 राष्ट्रीय धरोहर आपातकालीन टोल-फ्री' : '24x7 Heritage Emergency Toll-Free'}
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 text-center text-xs text-white/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>{language === 'hi' ? '© 2026 धरोहर दृष्टि। सर्वाधिकार सुरक्षित।' : '© 2026 DharoharDrishti. All rights reserved.'}</p>
          <p className="text-[11px]">
            {language === 'hi'
              ? "भारत की सांस्कृतिक विरासत के संरक्षण हेतु समर्पित"
              : "Designed for India's Cultural Legacy • Developed for High Conservation Impact"}
          </p>
        </div>

      </div>
    </footer>
  );
};
