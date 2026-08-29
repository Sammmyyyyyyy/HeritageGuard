import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Send,
} from 'lucide-react';

import { MONUMENT_FALLBACKS } from '../../assets/monumentImages';

interface AiDamageInspectorProps {
  language: 'en' | 'hi';
  onDispatchTeam: (monumentName: string, actionType: string) => void;
}

type Site = {
  site_id: string;
  name: string;
  city: string;
  state: string;
};

/* =========================================================
   YOUR 20 HERITAGE SITES
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
   JPG IMAGE LOADING
   ---------------------------------------------------------
   All your monument images are .jpg.

   This scans src/assets and its subfolders recursively.
   ========================================================= */

const LOCAL_IMAGES = import.meta.glob(
  '/src/assets/**/*.jpg',
  {
    eager: true,
    import: 'default',
  }
) as Record<string, string>;

/* =========================================================
   IMAGE NAME NORMALIZATION
   ========================================================= */

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.jpg$/i, '')
    .replace(/[^a-z0-9]/g, '');

/* =========================================================
   IMAGE ALIASES
   ---------------------------------------------------------
   Matches the filenames you showed in VS Code.
   ========================================================= */

const IMAGE_ALIASES: Record<string, string[]> = {
  DEL001: [
    'red_fort',
    'redfort',
  ],

  DEL002: [
    'qutub_minar',
    'qutubminar',
  ],

  DEL003: [
    'india_gate',
    'indiagate',
  ],

  DEL004: [
    'humayun_tomb',
    'humayuns_tomb',
    'humayunstomb',
  ],

  DEL005: [
    'Lotus_temple',
    'lotustemple',
  ],

  JAI001: [
    'amber_fort',
    'amberfort',
    'amer_fort',
    'amerfort',
  ],

  JAI002: [
    'hawa_mahal',
    'hawamahal',
  ],

  JAI003: [
    'city_palace',
    'citypalace',
  ],

  JAI004: [
    'jantar_mantar',
    'jantarmantar',
  ],

  JAI005: [
    'albert_hall',
    'albert_hall_museum',
    'alberthall',
    'alberthallmuseum',
  ],

  BOM001: [
    'gate_way',
    'gateway_of_india',
    'gatewayofindia',
  ],

  BOM002: [
    'elephant',
    'elephanta',
    'elephanta_caves',
    'elephantacaves',
  ],

  BOM003: [
    'chhatrapati',
    'chhatrapati_shivaji',
    'chhatrapati_shivaji_maharaj_terminus',
    'csmt',
  ],

  BOM004: [
    'haj_ali_dargah',
    'haji_ali_dargah',
    'hajialidargah',
    'hajiali',
  ],

  BOM005: [
    'siddhivinayak',
    'siddhivinayak_temple',
  ],

  PRA001: [
    'triveni_sangam',
    'trivenisangam',
    'triveni',
  ],

  PRA002: [
    'allahabad_fort',
    'allahabadfort',
  ],

  PRA003: [
    'khusro_bagh',
    'khusrobagh',
    'khusro',
  ],

  PRA004: [
    'anand_bhavan',
    'anandbhavan',
  ],

  PRA005: [
    'chandrashekhar_azad_park',
    'chandrashekhar_azad',
    'chandrashekharazadpark',
    'azadpark',
  ],
};

/* =========================================================
   BUILD IMAGE INDEX
   ========================================================= */

const LOCAL_IMAGE_INDEX: Record<string, string> = {};

Object.entries(LOCAL_IMAGES).forEach(([filePath, url]) => {
  const fileName = filePath.split('/').pop() ?? '';
  LOCAL_IMAGE_INDEX[normalize(fileName)] = url;
});

/* =========================================================
   GET IMAGE FOR SITE
   ========================================================= */

const getSiteImage = (site: Site): string => {
  /*
   * 1. Existing explicit site_id mapping.
   */
  const explicitImage =
    MONUMENT_FALLBACKS?.[site.site_id];

  if (explicitImage) {
    return explicitImage;
  }

  /*
   * 2. Filename aliases.
   */
  const aliases =
    IMAGE_ALIASES[site.site_id] ?? [];

  for (const alias of aliases) {
    const image =
      LOCAL_IMAGE_INDEX[normalize(alias)];

    if (image) {
      return image;
    }
  }

  /*
   * 3. Exact normalized monument name.
   */
  const exact =
    LOCAL_IMAGE_INDEX[normalize(site.name)];

  if (exact) {
    return exact;
  }

  /*
   * 4. Partial filename match.
   */
  const normalizedName =
    normalize(site.name);

  const partial =
    Object.entries(LOCAL_IMAGE_INDEX).find(
      ([fileName]) =>
        fileName.includes(normalizedName) ||
        normalizedName.includes(fileName)
    );

  return partial?.[1] ?? '';
};

/* =========================================================
   COMPONENT
   ========================================================= */

export const AiDamageInspector: React.FC<AiDamageInspectorProps> = ({
  onDispatchTeam,
}) => {
  const [selectedSiteId, setSelectedSiteId] =
    useState('DEL001');

  const [imageError, setImageError] =
    useState(false);

  const selectedSite = useMemo(
    () =>
      SITES.find(
        (site) =>
          site.site_id === selectedSiteId
      ) ?? SITES[0],
    [selectedSiteId]
  );

  const imageUrl = useMemo(
    () => getSiteImage(selectedSite),
    [selectedSite]
  );

  const handleSiteChange = (
    siteId: string
  ) => {
    setSelectedSiteId(siteId);
    setImageError(false);
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-slate-200">

        <div>

          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
            Multi-Spectral Computer Vision
          </div>

          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#0F3D3E] font-serif-heritage">
            AI Damage Inspector & Baseline Comparison
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Select any of the 20 configured heritage sites
            to review its monument image and conservation state.
          </p>

        </div>

        {/* SELECT */}
        <div className="flex items-center gap-3">

          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Select Monument:
          </label>

          <select
            value={selectedSite.site_id}
            onChange={(e) =>
              handleSiteChange(e.target.value)
            }
            className="w-full sm:w-80 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F3D3E] cursor-pointer"
          >

            {SITES.map((site) => (
              <option
                key={site.site_id}
                value={site.site_id}
              >
                {site.name} ({site.city})
              </option>
            ))}

          </select>

        </div>

      </div>

      {/* =====================================================
          MAIN GRID
          ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* ===================================================
            IMAGE PANEL
            =================================================== */}

        <div className="lg:col-span-8">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="relative h-[430px] bg-slate-950">

              {imageUrl && !imageError ? (

                <img
                  src={imageUrl}
                  alt={selectedSite.name}
                  className="w-full h-full object-cover"
                  onError={() => {
                    console.error(
                      'AI DAMAGE IMAGE LOAD FAILED:',
                      selectedSite.site_id,
                      imageUrl
                    );

                    setImageError(true);
                  }}
                />

              ) : (

                <div className="w-full h-full flex flex-col items-center justify-center text-white/80 px-6 text-center">

                  <ImageIcon className="w-12 h-12 mb-3 opacity-70" />

                  <p className="font-semibold text-base">
                    Image not available
                  </p>

                  <p className="text-xs text-white/70 mt-2">
                    {selectedSite.name}
                    {' '}
                    ({selectedSite.site_id})
                  </p>

                  <p className="text-[10px] text-white/40 mt-1">
                    Expected JPG asset inside src/assets.
                  </p>

                </div>

              )}

              {imageUrl && !imageError && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent pointer-events-none" />

                  <div className="absolute top-4 left-4">

                    <span className="px-3 py-1.5 rounded-full bg-[#0F3D3E]/90 text-white text-[10px] font-bold shadow-lg">
                      Heritage Site Image
                    </span>

                  </div>

                  <div className="absolute bottom-4 left-4 right-4">

                    <div className="flex items-end justify-between gap-3">

                      <div className="text-white">

                        <p className="text-lg font-bold">
                          {selectedSite.name}
                        </p>

                        <p className="text-xs text-white/80">
                          {selectedSite.city}
                          {', '}
                          {selectedSite.state}
                          {' • '}
                          {selectedSite.site_id}
                        </p>

                      </div>

                      <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur text-[10px] font-semibold text-white">
                        Local project image
                      </div>

                    </div>

                  </div>
                </>
              )}

            </div>

            {/* IMAGE FOOTER */}

            <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100">

              <div className="flex items-center gap-2 text-[10px] text-slate-500">

                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />

                <span>
                  {selectedSite.name} selected
                </span>

              </div>

              <span className="text-[10px] font-mono text-slate-400">
                {selectedSite.site_id}
              </span>

            </div>

          </div>

          {/* =================================================
              AI DETECTION LAYER
              ================================================= */}

          <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

            <div className="flex items-center space-x-2 mb-3">

              <AlertTriangle className="w-4 h-4 text-amber-600" />

              <h3 className="text-xs font-bold text-[#0F3D3E]">
                AI Detection Layer
              </h3>

            </div>

            <div className="flex flex-wrap gap-2">

              <span className="px-3 py-1.5 rounded-lg bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold">
                Micro-Crack Vectors
              </span>

              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                Moisture Saturation
              </span>

              <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                Surface / Salt Exfoliation
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            DIAGNOSTICS
            ================================================= */}

        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">

          <div className="mb-4">

            <span className="inline-flex px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
              Telemetry Diagnostics
            </span>

            <h3 className="text-xl font-bold text-[#0F3D3E] mt-2 font-serif-heritage">
              {selectedSite.name}
            </h3>

            <p className="text-xs text-slate-500">
              {selectedSite.city}
              {', '}
              {selectedSite.state}
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">

            <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-slate-200">

              <p className="text-[10px] text-slate-500 font-bold uppercase">
                Surface Damage
              </p>

              <p className="text-3xl font-bold text-slate-400 mt-2">
                —
              </p>

              <p className="text-[10px] text-slate-400 mt-1">
                Run damage scan
              </p>

            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-slate-200">

              <p className="text-[10px] text-slate-500 font-bold uppercase">
                Crack Velocity
              </p>

              <p className="text-2xl font-bold text-slate-400 mt-3">
                —
              </p>

              <p className="text-[10px] text-slate-400 mt-1">
                Run damage scan
              </p>

            </div>

          </div>

          <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-200 p-4">

            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Detected Anomalies
            </h4>

            <div className="flex flex-col items-center justify-center min-h-[190px] text-center">

              <CheckCircle2 className="w-9 h-9 text-emerald-500 mb-2" />

              <p className="text-sm font-semibold text-slate-700">
                No AI scan result loaded
              </p>

              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Select a site and run its damage scan to populate
                AI detections and conservation recommendations.
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
            className="mt-4 w-full py-3 rounded-xl bg-[#0F3D3E] hover:bg-[#0A2627] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >

            <Send className="w-4 h-4 text-[#D4AF37]" />

            Dispatch ASI Conservation Team

          </button>

        </div>

      </div>

      {/* =====================================================
          QUICK SITE SELECT
          ===================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">

        <div className="flex items-center justify-between mb-3">

          <div>

            <h3 className="text-xs font-bold text-[#0F3D3E]">
              Configured Heritage Sites
            </h3>

            <p className="text-[10px] text-slate-500">
              Each site uses its own local JPG image.
            </p>

          </div>

          <span className="text-[10px] font-mono text-slate-400">
            20 sites
          </span>

        </div>

        <div className="flex flex-wrap gap-2">

          {SITES.map((site) => {

            const hasImage =
              Boolean(getSiteImage(site));

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

                {site.name}

              </button>

            );
          })}

        </div>

      </div>

    </div>
  );
};

export default AiDamageInspector;
