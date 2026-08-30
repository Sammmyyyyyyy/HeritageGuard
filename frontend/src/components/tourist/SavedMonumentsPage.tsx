import React from 'react';
import { Heart, MapPin, Star, Sparkles, ArrowRight, Compass } from 'lucide-react';
import { Monument } from '../../types/heritage';
import { useSavedMonuments } from '../../hooks/useSavedMonuments';
import { Language, t } from '../../utils/translations';

interface SavedMonumentsPageProps {
  language: Language;
  monuments: Monument[];
  onSelectMonument: (monument: Monument) => void;
  onExploreClick: () => void;
}

export const SavedMonumentsPage: React.FC<SavedMonumentsPageProps> = ({
  language,
  monuments,
  onSelectMonument,
  onExploreClick
}) => {
  const { savedIds, toggleSave } = useSavedMonuments();

  // Filter backend monuments matching persisted saved site IDs
  const savedMonuments = monuments.filter((m) =>
    savedIds.includes(m.id) || savedIds.includes(m.id.toUpperCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#0D3B2E]/10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0D3B2E]/10 text-[#0D3B2E] text-xs font-bold mb-2">
            <Heart className="w-3.5 h-3.5 text-[#C85A32] fill-current" />
            <span>{t('savedMonuments', language)} ({savedMonuments.length})</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A2621] font-serif-heritage leading-tight">
            {t('savedMonumentsTitle', language)}
          </h1>
          <p className="text-xs sm:text-sm text-[#1A2621]/70 mt-1 font-medium">
            {t('savedMonumentsSubtitle', language)}
          </p>
        </div>

        {savedMonuments.length > 0 && (
          <button
            onClick={onExploreClick}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#0D3B2E] text-white text-xs font-bold shadow-md hover:bg-[#08281E] transition-all cursor-pointer self-start md:self-auto"
          >
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('exploreHeritageSites', language)}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {savedMonuments.length === 0 ? (
        <div className="max-w-md mx-auto py-16 px-6 text-center space-y-5 bg-white rounded-3xl border border-[#0D3B2E]/10 shadow-sm my-8">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#C85A32] flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0D3B2E] font-serif-heritage">
              {t('noSavedMonumentsYet', language)}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              {t('noSavedMonumentsSubtext', language)}
            </p>
          </div>
          <button
            onClick={onExploreClick}
            className="px-6 py-3 bg-[#0D3B2E] hover:bg-[#08281E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center space-x-2 active:scale-95"
          >
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('exploreHeritageSites', language)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Saved Monument Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedMonuments.map((monument) => (
            <div
              key={monument.id}
              onClick={() => onSelectMonument(monument)}
              className="bg-white rounded-3xl border border-[#0D3B2E]/12 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              {/* Card Image Banner */}
              <div className="relative h-52 overflow-hidden bg-gray-100">
                <img
                  src={monument.imageUrl}
                  alt={monument.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Category Pill */}
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                  {monument.category}
                </span>

                {/* Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(monument.id);
                  }}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-red-500 shadow-md hover:scale-110 transition-transform cursor-pointer"
                  title="Remove from Saved"
                >
                  <Heart className="w-4 h-4 fill-current text-red-500" />
                </button>

                {/* City & State Tag */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                  <div className="flex items-center space-x-1 drop-shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{monument.city}, {monument.state}</span>
                  </div>
                  {monument.isUnesco && (
                    <span className="px-2 py-0.5 rounded bg-[#D4AF37] text-[#08281E] font-bold text-[9px] uppercase tracking-wider shadow-xs">
                      UNESCO
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#0D3B2E] font-serif-heritage group-hover:text-[#C85A32] transition-colors leading-snug">
                    {language === 'hi' ? monument.hindiName || monument.name : monument.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1 font-medium">
                    {monument.description}
                  </p>
                </div>

                {/* Metrics Row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center space-x-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{monument.rating.toFixed(1)}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold font-mono text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>HPS: {monument.heritagePressureScore}</span>
                  </div>
                </div>

                {/* View Details Action Button */}
                <button
                  onClick={() => onSelectMonument(monument)}
                  className="w-full py-2.5 bg-[#F8F6F0] hover:bg-[#0D3B2E] text-[#0D3B2E] hover:text-white font-bold text-xs rounded-xl border border-[#0D3B2E]/20 transition-all cursor-pointer flex items-center justify-center space-x-1.5 mt-2"
                >
                  <span>{t('viewDetails', language)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
