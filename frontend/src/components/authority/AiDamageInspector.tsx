import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Send,
} from 'lucide-react';

import { MONUMENT_FALLBACKS } from '../../assets/monumentImages';
import { SITE_METADATA } from '../../data/siteMapper';

interface AiDamageInspectorProps {
  language?: 'en' | 'hi';
  onDispatchTeam: (monumentName: string, actionType: string) => void;
}

type Site = {
  site_id: string;
  name: string;
  city: string;
  state: string;
};

/* =========================================================
   20 PROJECT SITES
   ========================================================= */

const SITES: Site[] = [
  { site_id: 'DEL001', name: 'Red Fort', city: 'Delhi', state: 'Delhi' },
  { site_id: 'DEL002', name: 'Qutub Minar', city: 'Delhi', state: 'Delhi' },
  { site_id: 'DEL003', name: 'India Gate', city: 'Delhi', state: 'Delhi' },
  { site_id: 'DEL004', name: "Humayun's Tomb", city: 'Delhi', state: 'Delhi' },
  { site_id: 'DEL005', name: 'Lotus Temple', city: 'Delhi', state: 'Delhi' },

  { site_id: 'JAI001', name: 'Amer Fort', city: 'Jaipur', state: 'Rajasthan' },
  { site_id: 'JAI002', name: 'Hawa Mahal', city: 'Jaipur', state: 'Rajasthan' },
  { site_id: 'JAI003', name: 'City Palace', city: 'Jaipur', state: 'Rajasthan' },
  { site_id: 'JAI004', name: 'Jantar Mantar', city: 'Jaipur', state: 'Rajasthan' },
  { site_id: 'JAI005', name: 'Albert Hall Museum', city: 'Jaipur', state: 'Rajasthan' },

  { site_id: 'BOM001', name: 'Gateway of India', city: 'Mumbai', state: 'Maharashtra' },
  { site_id: 'BOM002', name: 'Elephanta Caves', city: 'Mumbai', state: 'Maharashtra' },
  {
    site_id: 'BOM003',
    name: 'Chhatrapati Shivaji Maharaj Terminus',
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  { site_id: 'BOM004', name: 'Haji Ali Dargah', city: 'Mumbai', state: 'Maharashtra' },
  { site_id: 'BOM005', name: 'Siddhivinayak Temple', city: 'Mumbai', state: 'Maharashtra' },

  { site_id: 'PRA001', name: 'Triveni Sangam', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { site_id: 'PRA002', name: 'Allahabad Fort', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { site_id: 'PRA003', name: 'Khusro Bagh', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { site_id: 'PRA004', name: 'Anand Bhavan', city: 'Prayagraj', state: 'Uttar Pradesh' },
  {
    site_id: 'PRA005',
    name: 'Chandrashekhar Azad Park',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
  },
];

/* =========================================================
   IMAGE LOADING
   =========================================================
   IMPORTANT:
   Use an absolute Vite glob from /src/assets and recurse
   through subfolders. This fixes the "Image not found"
   problem when the image isn't directly under one folder.

   Your asset filenames can be:
     red_fort.jpg
     red_fort.png
     redfort.webp
     qutub_minar.jpg
     jantar_mantar.png
     etc.
   ========================================================= */

const LOCAL_IMAGES = import.meta.glob(
  '/src/assets/**/*.{png,jpg,jpeg,webp,JPG,JPEG,PNG,WEBP}',
  {
    eager: true,
    import: 'default',
  }
) as Record<string, string>;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.(png|jpe?g|webp)$/i, '')
    .replace(/[^a-z0-9]/g, '');

const IMAGE_ALIASES: Record<string, string[]> = {
  DEL001: ['redfort', 'red_fort', 'redfortdelhi'],
  DEL002: ['qutubminar', 'qutub_minar', 'qutub'],
  DEL003: ['indiagate', 'india_gate', 'india_gate_delhi'],
  DEL004: [
    'humayunstomb',
    'humayuns_tomb',
    'humayun_tomb',
    'humayun_tomb_delhi',
  ],
  DEL005: ['lotustemple', 'lotus_temple', 'lotus'],

  JAI001: ['amerfort', 'amer_fort', 'amberfort', 'amber_fort', 'amber'],
  JAI002: ['hawamahal', 'hawa_mahal'],
  JAI003: ['citypalace', 'city_palace'],
  JAI004: ['jantarmantar', 'jantar_mantar', 'jantar'],
  JAI005: [
    'alberthall',
    'albert_hall',
    'alberthallmuseum',
    'albert_hall_museum',
  ],

  BOM001: [
    'gatewayofindia',
    'gateway_of_india',
    'gate_way',
    'gateway_india',
  ],
  BOM002: ['elephantacaves', 'elephanta_caves', 'elephanta', 'elephant'],
  BOM003: [
    'chhatrapati',
    'chhatrapati_shivaji',
    'chhatrapati_shivaji_maharaj_terminus',
    'csmt',
  ],
  BOM004: [
    'hajialidargah',
    'haji_ali_dargah',
    'haj_ali_dargah',
    'hajiali',
  ],
  BOM005: [
    'siddhivinayak',
    'siddhivinayak_temple',
    'siddhi_vinayak',
  ],

  PRA001: ['trivenisangam', 'triveni_sangam', 'triveni'],
  PRA002: ['allahabadfort', 'allahabad_fort'],
  PRA003: ['khusrobagh', 'khusro_bagh', 'khusro'],
  PRA004: ['anandbhavan', 'anand_bhavan'],
  PRA005: [
    'chandrashekharazadpark',
    'chandrashekhar_azad_park',
    'chandrashekhar_azad',
    'azadpark',
  ],
};

const LOCAL_IMAGE_INDEX: Record<string, string> = {};

Object.entries(LOCAL_IMAGES).forEach(([filePath, url]) => {
  const fileName = filePath.split('/').pop() ?? '';
  LOCAL_IMAGE_INDEX[normalize(fileName)] = url;
});

const getSiteImage = (site: Site): string => {
  /* 1. Explicit existing mapping */
  const mapped = MONUMENT_FALLBACKS?.[site.site_id];

  if (mapped) return mapped;

  /* 2. Filename aliases */
  const aliases = IMAGE_ALIASES[site.site_id] ?? [];

  for (const alias of aliases) {
    const image = LOCAL_IMAGE_INDEX[normalize(alias)];

    if (image) return image;
  }

  /* 3. Exact normalized site name */
  const exactName = LOCAL_IMAGE_INDEX[normalize(site.name)];

  if (exactName) return exactName;

  /* 4. Partial match against all loaded assets */
  const siteTokens = normalize(site.name);

  const partial = Object.entries(LOCAL_IMAGE_INDEX).find(
    ([fileName]) =>
      fileName.includes(siteTokens) ||
      siteTokens.includes(fileName)
  );

  return partial?.[1] ?? '';
};

/* =========================================================
   COMPONENT
   ========================================================= */

export const AiDamageInspector: React.FC<AiDamageInspectorProps> = ({
  language = 'en',
  onDispatchTeam,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState('DEL001');
  const [imageError, setImageError] = useState(false);

  const getSiteDisplayName = (siteId: string, defaultName: string) => {
    if (language === 'hi' && SITE_METADATA[siteId]?.hindiName) {
      return SITE_METADATA[siteId].hindiName;
    }
    return defaultName;
  };

  const selectedSite = useMemo(
    () =>
      SITES.find((site) => site.site_id === selectedSiteId) ??
      SITES[0],
    [selectedSiteId]
  );

  const imageUrl = useMemo(
    () => getSiteImage(selectedSite),
    [selectedSite]
  );

  const handleSiteChange = (siteId: string) => {
    setSelectedSiteId(siteId);
    setImageError(false);
  };

  const currentDisplayName = getSiteDisplayName(selectedSite.site_id, selectedSite.name);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-slate-200">

        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
            {language === 'hi' ? 'मल्टी-स्पेक्ट्रल कंप्यूटर विजन' : 'Multi-Spectral Computer Vision'}
          </div>

          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-serif-heritage">
            {language === 'hi' ? 'एआई क्षति विश्लेषक और आधारभूत तुलना' : 'AI Damage Inspector & Baseline Comparison'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {language === 'hi'
              ? 'स्मारक छवि और संरक्षण स्थिति की समीक्षा के लिए 20 कॉन्फ़िगर किए गए धरोहर स्थलों में से किसी का चयन करें।'
              : 'Select any of the 20 configured heritage sites to review its monument image and conservation state.'}
          </p>
        </div>

        {/* MONUMENT SELECTOR */}
        <div className="flex items-center gap-3">

          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            {language === 'hi' ? 'स्मारक चुनें:' : 'Select Monument:'}
          </label>

          <select
            value={selectedSite.site_id}
            onChange={(e) => handleSiteChange(e.target.value)}
            className="w-full sm:w-80 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F3D3E] cursor-pointer"
          >
            {SITES.map((site) => (
              <option key={site.site_id} value={site.site_id}>
                {getSiteDisplayName(site.site_id, site.name)} ({site.city})
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* IMAGE PANEL */}
        <div className="lg:col-span-8">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="relative h-[430px] bg-slate-950">

              {imageUrl && !imageError ? (
                <>

                  <img
                    src={imageUrl}
                    alt={selectedSite.name}
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.error(
                        'AI DAMAGE IMAGE LOAD FAILED',
                        selectedSite.site_id,
                        imageUrl
                      );

                      setImageError(true);
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent pointer-events-none" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-full bg-[#0F3D3E]/90 text-white text-[10px] font-bold shadow-lg">
                      {language === 'hi' ? 'धरोहर स्थल छवि' : 'Heritage Site Image'}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">

                    <div className="flex items-end justify-between gap-3">

                      <div className="text-white">

                        <p className="text-lg font-bold">
                          {currentDisplayName}
                        </p>

                        <p className="text-xs text-white/80">
                          {selectedSite.city}, {selectedSite.state}
                          {' • '}
                          {selectedSite.site_id}
                        </p>

                      </div>

                      <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur text-[10px] font-semibold text-white">
                        {language === 'hi' ? 'परियोजना छवि' : 'Local project image'}
                      </div>

                    </div>

                  </div>

                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/80 px-6 text-center">

                  <ImageIcon className="w-12 h-12 mb-3 opacity-70" />

                  <p className="font-semibold text-base">
                    {language === 'hi' ? 'छवि उपलब्ध नहीं है' : 'Image not available'}
                  </p>

                  <p className="text-xs text-white/70 mt-2">
                    {currentDisplayName} ({selectedSite.site_id})
                  </p>

                  <p className="text-[10px] text-white/40 mt-1">
                    {language === 'hi' ? 'src/assets में फ़ाइल नाम जांचें।' : 'Check the image filename inside src/assets.'}
                  </p>

                </div>
              )}

            </div>

            <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100">

              <div className="flex items-center gap-2 text-[10px] text-slate-500">

                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />

                <span>
                  {currentDisplayName} {language === 'hi' ? 'चयनित' : 'selected'}
                </span>

              </div>

              <span className="text-[10px] font-mono text-slate-400">
                {selectedSite.site_id}
              </span>

            </div>

          </div>

          {/* AI DETECTION LAYER */}

          <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

            <div className="flex items-center space-x-2 mb-3">

              <AlertTriangle className="w-4 h-4 text-amber-600" />

              <h3 className="text-xs font-bold text-[#0F3D3E]">
                {language === 'hi' ? 'एआई डिटेक्शन लेयर' : 'AI Detection Layer'}
              </h3>

            </div>

            <div className="flex flex-wrap gap-2">

              <span className="px-3 py-1.5 rounded-lg bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold">
                {language === 'hi' ? 'सूक्ष्म-दरार वेक्टर्स' : 'Micro-Crack Vectors'}
              </span>

              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                {language === 'hi' ? 'नमी संतृप्ति' : 'Moisture Saturation'}
              </span>

              <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                {language === 'hi' ? 'सतह / लवण क्षरण' : 'Surface / Salt Exfoliation'}
              </span>

            </div>

          </div>

        </div>

        {/* DIAGNOSTICS PANEL */}

        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">

          <div className="mb-4">

            <span className="inline-flex px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
              {language === 'hi' ? 'टेलीमेट्री निदान' : 'Telemetry Diagnostics'}
            </span>

            <h3 className="text-xl font-bold text-[#0F3D3E] mt-2 font-serif-heritage">
              {currentDisplayName}
            </h3>

            <p className="text-xs text-slate-500">
              {selectedSite.city}, {selectedSite.state}
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">

            <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-slate-200">

              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {language === 'hi' ? 'सतह क्षति' : 'Surface Damage'}
              </p>

              <p className="text-3xl font-bold text-slate-400 mt-2">
                —
              </p>

              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'hi' ? 'क्षति स्कैन चलाएं' : 'Run damage scan'}
              </p>

            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-slate-200">

              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {language === 'hi' ? 'दरार गति' : 'Crack Velocity'}
              </p>

              <p className="text-2xl font-bold text-slate-400 mt-3">
                —
              </p>

              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'hi' ? 'क्षति स्कैन चलाएं' : 'Run damage scan'}
              </p>

            </div>

          </div>

          <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-200 p-4">

            <h4 className="text-xs font-bold text-slate-800 mb-2">
              {language === 'hi' ? 'पहचाने गए असामान्यताएं' : 'Detected Anomalies'}
            </h4>

            <div className="flex flex-col items-center justify-center min-h-[190px] text-center">

              <CheckCircle2 className="w-9 h-9 text-emerald-500 mb-2" />

              <p className="text-sm font-semibold text-slate-700">
                {language === 'hi' ? 'कोई एआई स्कैन परिणाम लोड नहीं' : 'No AI scan result loaded'}
              </p>

              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                {language === 'hi'
                  ? 'एआई डिटेक्शन और संरक्षण सिफारिशों को लोड करने के लिए एक साइट चुनें और क्षति स्कैन चलाएं।'
                  : 'Select a site and run its damage scan to populate AI detections and conservation recommendations.'}
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              onDispatchTeam(
                selectedSite.name,
                'Field Conservation Inspection'
              )
            }
            className="mt-4 w-full py-3 rounded-xl bg-[#0F3D3E] hover:bg-[#0A2627] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#D4AF37]" />
            {language === 'hi' ? 'एएसआई संरक्षण टीम प्रेषित करें' : 'Dispatch ASI Conservation Team'}
          </button>

        </div>

      </div>

      {/* QUICK SITE SELECT */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">

        <div className="flex items-center justify-between mb-3">

          <div>
            <h3 className="text-xs font-bold text-[#0F3D3E]">
              {language === 'hi' ? 'कॉन्फ़िगर किए गए धरोहर स्थल' : 'Configured Heritage Sites'}
            </h3>

            <p className="text-[10px] text-slate-500">
              {language === 'hi' ? 'प्रत्येक स्थल अपनी स्थानीय छवि का उपयोग करता है।' : 'Each site uses its own local image asset.'}
            </p>
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            {language === 'hi' ? '20 स्थल' : '20 sites'}
          </span>

        </div>

        <div className="flex flex-wrap gap-2">

          {SITES.map((site) => {

            const hasImage = Boolean(getSiteImage(site));

            return (
              <button
                key={site.site_id}
                onClick={() =>
                  handleSiteChange(site.site_id)
                }
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all ${
                  selectedSite.site_id === site.site_id
                    ? 'bg-[#0F3D3E] text-white border-[#0F3D3E]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#0F3D3E]'
                }`}
              >

                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasImage
                      ? 'bg-emerald-500'
                      : 'bg-red-400'
                  }`}
                />

                {getSiteDisplayName(site.site_id, site.name)}

              </button>
            );
          })}

        </div>

      </div>

    </div>
  );
};

export default AiDamageInspector;
