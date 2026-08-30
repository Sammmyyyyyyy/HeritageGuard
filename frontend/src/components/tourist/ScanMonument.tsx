import React, { useEffect, useState } from 'react';
import { getSites, analyzeDamage, BackendSite } from '../../api/sites';
import {
  Camera,
  Upload,
  RefreshCw,
  Zap,
  ZapOff,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Info,
  ArrowRight,
  Eye,
  Sliders,
  Send,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRESET_DAMAGE_SCANS } from '../../data/damageScansData';
import { DamageScanResult, DamageDetection } from '../../types/heritage';

interface ScanMonumentProps {
  language: 'en' | 'hi';
  onReportSubmitted?: (scan: DamageScanResult) => void;
  onNavigateToAI?: () => void;
}

export const ScanMonument: React.FC<ScanMonumentProps> = ({
  language,
  onReportSubmitted,
  onNavigateToAI
}) => {
  /* =========================================================
     LOCAL / PRESET STATE
     ========================================================= */

  const [selectedScanIndex, setSelectedScanIndex] = useState(0);

  const [isScanning, setIsScanning] = useState(false);

  const [hasScanned, setHasScanned] = useState(false);

  const [zoomLevel, setZoomLevel] =
    useState<'0.5x' | '1x' | '2x'>('1x');

  const [isFlashOn, setIsFlashOn] = useState(false);

  const [selectedDetection, setSelectedDetection] =
    useState<DamageDetection | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [customImage, setCustomImage] =
    useState<string | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  /* =========================================================
     BACKEND SITE STATE
     ========================================================= */

  const [backendSites, setBackendSites] =
    useState<BackendSite[]>([]);

  const [sitesLoading, setSitesLoading] =
    useState(true);

  const [analysisError, setAnalysisError] =
    useState<string | null>(null);

  const [backendScan, setBackendScan] =
    useState<DamageScanResult | null>(null);

  /*
   * IMPORTANT:
   *
   * There is NO default site here.
   *
   * Earlier code was effectively doing:
   *
   * backendSites[0]?.site_id
   *
   * which caused DEL001 to be sent every time.
   */
  const [selectedSiteId, setSelectedSiteId] =
    useState<string>('');

  /* =========================================================
     LOAD SITES FROM BACKEND
     ========================================================= */

  useEffect(() => {
    const loadSites = async () => {
      try {
        setSitesLoading(true);
        setAnalysisError(null);

        const sites = await getSites();

        console.log(
          'SCAN - BACKEND SITES:',
          sites
        );

        setBackendSites(
          Array.isArray(sites) ? sites : []
        );
      } catch (error) {
        console.error(
          'SCAN - FAILED TO LOAD SITES:',
          error
        );

        setBackendSites([]);

        setAnalysisError(
          'Unable to load heritage sites from backend.'
        );
      } finally {
        setSitesLoading(false);
      }
    };

    loadSites();
  }, []);

  /* =========================================================
     HELPERS
     ========================================================= */

  const getSiteName = (siteId: string) => {
    return (
      backendSites.find(
        (site) => site.site_id === siteId
      )?.name || siteId
    );
  };

  const getSelectedSite = () => {
    if (!selectedSiteId) {
      return null;
    }

    return (
      backendSites.find(
        (site) =>
          site.site_id === selectedSiteId
      ) || null
    );
  };

  /* =========================================================
     BACKEND DETECTION CONVERTER
     ========================================================= */

  const convertBackendDetection = (
    detection: any,
    index: number
  ): DamageDetection => {
    const rawType = String(
      detection?.type ??
        detection?.damage_type ??
        detection?.label ??
        'crack'
    ).toLowerCase();

    const allowedTypes = [
      'crack',
      'erosion',
      'discoloration',
      'vegetation',
      'moisture'
    ] as const;

    const type = allowedTypes.includes(
      rawType as any
    )
      ? (rawType as DamageDetection['type'])
      : 'crack';

    const confidenceValue =
      detection?.confidence ??
      detection?.score ??
      detection?.confidence_score ??
      0;

    const confidenceNumber =
      Number(confidenceValue);

    const confidence =
      confidenceNumber > 1
        ? confidenceNumber / 100
        : confidenceNumber;

    const severityRaw = String(
      detection?.severity ?? 'Medium'
    ).toLowerCase();

    const severityMap: Record<
      string,
      DamageDetection['severity']
    > = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    };

    return {
      id: String(
        detection?.id ??
          `backend-detection-${index}`
      ),

      type,

      confidence: Math.max(
        0,
        Math.min(
          1,
          confidence || 0
        )
      ),

      severity:
        severityMap[severityRaw] ||
        'Medium',

      bbox: {
        x: Number(
          detection?.bbox?.x ??
            detection?.x ??
            0
        ),

        y: Number(
          detection?.bbox?.y ??
            detection?.y ??
            0
        ),

        width: Number(
          detection?.bbox?.width ??
            detection?.width ??
            10
        ),

        height: Number(
          detection?.bbox?.height ??
            detection?.height ??
            10
        )
      },

      title:
        detection?.title ||
        detection?.label ||
        `${type
          .charAt(0)
          .toUpperCase()}${type.slice(
          1
        )} detected`,

      description:
        detection?.description ||
        `AI detected ${type} on the submitted monument image.`,

      recommendedAction:
        detection?.recommendedAction ||
        detection?.recommended_action ||
        'Schedule inspection and preventive conservation review.'
    };
  };

  /* =========================================================
     BUILD BACKEND SCAN
     ========================================================= */

  const buildBackendScan = (
    result: any
  ): DamageScanResult => {
    /*
     * DO NOT FALL BACK TO backendSites[0].
     *
     * The selected site is the source of truth.
     */
    const siteId =
      result?.site_id ||
      selectedSiteId ||
      'unknown-site';

    const rawDetections =
      Array.isArray(result?.detections)
        ? result.detections
        : [];

    const detections =
      rawDetections.map(
        convertBackendDetection
      );

    const score = Number(
      result?.damage_score ??
        result?.overall_damage_score ??
        result?.score ??
        0
    );

    const priorityRaw = String(result?.priority ?? result?.report?.severity ?? 'medium').toLowerCase();
    const priorityMap: Record<string, 'Low' | 'Medium' | 'High' | 'Critical'> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    };

    const severityRaw = String(result?.report?.severity ?? result?.severity ?? 'medium').toLowerCase();

    return {
      id: `backend-scan-${Date.now()}`,

      monumentId: siteId,

      monumentName:
        getSiteName(siteId),

      scannedAt:
        result?.report?.created_at || new Date().toISOString(),

      imageUrl:
        result?.image_url ||
        customImage ||
        '',

      overallDamageScore: Math.max(
        0,
        Math.min(100, Math.round(score))
      ),

      detections,

      priority: priorityMap[priorityRaw] || 'Medium',

      severity: priorityMap[severityRaw] || 'Medium',

      reportId: result?.report?.id || `REP-${Date.now().toString().slice(-6)}`,

      reportType: result?.report?.report_type
        ? String(result.report.report_type).replace(/_/g, ' ').toUpperCase()
        : 'AI STRUCTURAL AUDIT',

      summary: result?.report?.summary || 'AI detected structural anomaly on monument surface.',

      source:
        'Citizen Camera Scan',

      status:
        'Pending Review',

      submittedBy:
        'Citizen Heritage Contributor'
    };
  };

  /* =========================================================
     ACTIVE SCAN
     ========================================================= */

  const activeScan: DamageScanResult =
    backendScan ||
    (customImage
      ? {
          ...PRESET_DAMAGE_SCANS[0],

          id: 'custom-scan',

          /*
           * NEVER use backendSites[0] here.
           */
          monumentId:
            selectedSiteId ||
            'unknown-site',

          monumentName:
            selectedSiteId
              ? getSiteName(
                  selectedSiteId
                )
              : 'Select a monument',

          imageUrl: customImage
        }
      : PRESET_DAMAGE_SCANS[
          selectedScanIndex
        ]);

  /* =========================================================
     SITE SELECTION
     ========================================================= */

  const handleSiteChange = (
    siteId: string
  ) => {
    setSelectedSiteId(siteId);

    /*
     * Changing monument means the old
     * scan result is no longer relevant.
     */
    setBackendScan(null);
    setCustomImage(null);
    setSelectedFile(null);
    setHasScanned(false);
    setSelectedDetection(null);
    setAnalysisError(null);
    setIsSubmitted(false);
  };

  /* =========================================================
     CAPTURE / ANALYZE
     ========================================================= */

  const handleCapture = async () => {
    setSelectedDetection(null);
    setIsSubmitted(false);
    setAnalysisError(null);

    /*
     * FIRST CHECK:
     * User MUST select a backend site.
     */
    if (!selectedSiteId) {
      setAnalysisError(
        sitesLoading
          ? 'Loading heritage sites... please wait.'
          : 'Please select a monument before scanning.'
      );

      return;
    }

    /*
     * Make sure selected site actually exists
     * in the backend site list.
     */
    const selectedSite =
      backendSites.find(
        (site) =>
          site.site_id ===
          selectedSiteId
      );

    if (!selectedSite) {
      setAnalysisError(
        'Selected monument is not available from the backend.'
      );

      return;
    }

    /*
     * Uploaded image => REAL backend AI analysis.
     */
    if (selectedFile) {
      setIsScanning(true);

      try {
        console.log(
          'SCAN - ANALYZING:',
          {
            siteId:
              selectedSite.site_id,

            siteName:
              selectedSite.name,

            fileName:
              selectedFile.name,

            fileType:
              selectedFile.type
          }
        );

        /*
         * IMPORTANT:
         *
         * selectedSite.site_id
         * is passed directly.
         *
         * No backendSites[0].
         */
        const result =
          await analyzeDamage(
            selectedSite.site_id,
            selectedFile,
            ''
          );

        console.log(
          'SCAN - BACKEND DAMAGE RESULT:',
          result
        );

        /*
         * Optional safety check:
         * if backend sends another site_id,
         * don't silently display it as selected site.
         */
        if (
          result?.site_id &&
          result.site_id !==
            selectedSite.site_id
        ) {
          console.warn(
            'SCAN - SITE ID MISMATCH:',
            {
              selectedSite:
                selectedSite.site_id,

              backendSite:
                result.site_id
            }
          );

          setAnalysisError(
            `Backend returned ${result.site_id}, but ${selectedSite.site_id} was selected.`
          );

          setHasScanned(false);
          setBackendScan(null);

          return;
        }

        const scan =
          buildBackendScan(result);

        setBackendScan(scan);
        setHasScanned(true);

        if (
          scan.detections.length > 0
        ) {
          setSelectedDetection(
            scan.detections[0]
          );
        }
      } catch (error: any) {
        console.error(
          'SCAN - DAMAGE ANALYSIS FAILED:',
          error
        );

        setAnalysisError(
          error?.message ||
            'Damage analysis failed. Please try again.'
        );

        setHasScanned(false);
        setBackendScan(null);
      } finally {
        setIsScanning(false);
      }

      return;
    }

    /*
     * No uploaded file:
     * preserve the existing demo/preset behavior.
     */
    setIsScanning(true);

    window.setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);

      if (
        activeScan.detections
          .length > 0
      ) {
        setSelectedDetection(
          activeScan.detections[0]
        );
      }
    }, 1800);
  };

  /* =========================================================
     FILE UPLOAD
     ========================================================= */

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {
      setAnalysisError(
        'Please select a valid image file.'
      );

      return;
    }

    /*
     * Do NOT remove selectedSiteId.
     * The uploaded image belongs to
     * whichever monument user selected.
     */
    setSelectedFile(file);

    setBackendScan(null);

    setCustomImage(null);

    setAnalysisError(null);

    setHasScanned(false);

    setSelectedDetection(null);

    setIsSubmitted(false);

    const reader =
      new FileReader();

    reader.onload = (
      uploadEvent
    ) => {
      if (
        uploadEvent.target?.result
      ) {
        setCustomImage(
          uploadEvent.target
            .result as string
        );
      }
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     SUBMIT REPORT
     ========================================================= */

  const handleSubmitReport = () => {
    if (!hasScanned) {
      return;
    }

    setIsSubmitted(true);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onReportSubmitted?.({
      ...activeScan,
      status:
        'Pending Review',
      submittedBy:
        'Citizen Heritage Contributor'
    });
  };

  /* =========================================================
     DAMAGE COLORS
     ========================================================= */

  const damageColorMap: Record<
    string,
    {
      bg: string;
      text: string;
      border: string;
      icon: string;
    }
  > = {
    crack: {
      bg: 'bg-red-500/20',
      text: 'text-red-300',
      border: 'border-red-500',
      icon: '⚡'
    },

    erosion: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-300',
      border: 'border-amber-500',
      icon: '🌾'
    },

    discoloration: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-300',
      border: 'border-yellow-500',
      icon: '🎨'
    },

    vegetation: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500',
      icon: '🌿'
    },

    moisture: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-300',
      border: 'border-blue-500',
      icon: '💧'
    }
  };

  /* =========================================================
     JSX
     ========================================================= */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* =====================================================
          PAGE TITLE
          ===================================================== */}

      <div className="text-center max-w-3xl mx-auto mb-8 relative">

        <h1 className="text-3xl sm:text-4xl font-bold text-[#0D3B2E] font-serif-heritage mb-2">
          Scan{' '}
          <span className="text-[#C85A32]">
            Monument
          </span>
        </h1>

        <p className="text-sm text-[#1A2621]/70">
          {language === 'hi'
            ? 'स्मारक की तस्वीर लें — हमारा एआई कंप्यूटर विज़न मॉडल सूक्ष्म दरारों, क्षरण, नमी व वनस्पति की पहचान करेगा।'
            : 'Capture the monument to detect damage, classify structural deterioration, and assess physical condition.'}
        </p>

        <div className="absolute right-0 top-0 hidden sm:flex items-center space-x-2">

          <button
            onClick={() =>
              setIsFlashOn(
                !isFlashOn
              )
            }
            className={`p-2.5 rounded-full border transition-all ${
              isFlashOn
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
            title="Toggle Flash"
          >
            {isFlashOn ? (
              <Zap className="w-4 h-4" />
            ) : (
              <ZapOff className="w-4 h-4" />
            )}
          </button>

        </div>
      </div>

      {/* =====================================================
          MONUMENT SELECTOR
          ===================================================== */}

      <div className="w-full max-w-3xl mx-auto mb-6">

        <div className="bg-white rounded-2xl border border-[#0D3B2E]/10 shadow-sm p-4">

          <div className="flex items-center justify-between mb-2">

            <label className="text-xs font-bold text-[#0D3B2E] uppercase tracking-wider">
              Select Monument to Scan
            </label>
          </div>

          <select
            value={selectedSiteId}
            onChange={(e) =>
              handleSiteChange(
                e.target.value
              )
            }
            disabled={
              sitesLoading ||
              isScanning
            }
            className="w-full px-4 py-3 rounded-xl border border-[#0D3B2E]/20 bg-[#F8F6F0] text-sm text-[#0D3B2E] font-medium outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-60 cursor-pointer"
          >
            <option value="">
              {sitesLoading
                ? 'Loading monuments...'
                : 'Choose a monument to scan...'}
            </option>

            {backendSites.map(
              (site) => (
                <option
                  key={site.site_id}
                  value={
                    site.site_id
                  }
                >
                  {site.name}
                </option>
              )
            )}
          </select>

          {!selectedSiteId && !sitesLoading && (
            <div className="mt-2 text-xs font-semibold text-amber-700 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Select a monument to begin analysis.</span>
            </div>
          )}

          {!sitesLoading &&
            backendSites.length ===
              0 && (
              <div className="mt-2 text-xs text-red-700">
                No monuments are available from the backend.
              </div>
            )}

          {selectedSiteId && (
            <div className="mt-2 text-[11px] text-[#1A2621]/60">
              Selected:{' '}
              <span className="font-bold text-[#0D3B2E]">
                {getSiteName(
                  selectedSiteId
                )}
              </span>
            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          MAIN GRID
          ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ===================================================
            LEFT COLUMN
            =================================================== */}

        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4 w-full">

          <div className="bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm">

            <h3 className="text-xs font-bold text-[#0D3B2E] uppercase tracking-wider mb-4 flex items-center space-x-1.5">

              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />

              <span>
                Scan in 3 Simple Steps
              </span>

            </h3>

            <div className="space-y-4 relative">

              <div className="flex items-start space-x-3">

                <div className="w-8 h-8 rounded-full bg-[#0D3B2E] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                  1
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#0D3B2E]">
                    Select Monument
                  </h4>

                  <p className="text-[11px] text-[#1A2621]/70">
                    Choose the monument you want to scan
                  </p>
                </div>

              </div>

              <div className="flex items-start space-x-3">

                <div className="w-8 h-8 rounded-full bg-[#EAE6DB] text-[#0D3B2E] flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#0D3B2E]">
                    Capture
                  </h4>

                  <p className="text-[11px] text-[#1A2621]/70">
                    Take a steady, high-resolution photo
                  </p>
                </div>

              </div>

              <div className="flex items-start space-x-3">

                <div className="w-8 h-8 rounded-full bg-[#EAE6DB] text-[#0D3B2E] flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#0D3B2E]">
                    AI Analysis
                  </h4>

                  <p className="text-[11px] text-[#1A2621]/70">
                    Instant crack & erosion classification
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Tips */}

          <div className="bg-[#F8F6F0] p-5 rounded-2xl border border-[#0D3B2E]/10">

            <h4 className="text-xs font-bold text-[#0D3B2E] mb-3 flex items-center space-x-1.5">

              <Info className="w-3.5 h-3.5 text-[#C85A32]" />

              <span>
                Tips for Best Results
              </span>

            </h4>

            <ul className="space-y-2 text-[11px] text-[#1A2621]/75">

              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Use good natural daylight
                </span>
              </li>

              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Keep the damaged surface in focus
                </span>
              </li>

              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Avoid extreme motion blur
                </span>
              </li>

              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Capture close-up of masonry joints
                </span>
              </li>

            </ul>

          </div>

        </div>

        {/* ===================================================
            CENTER CAMERA
            =================================================== */}

        <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center w-full">

          <div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border-2 sm:border-4 border-[#0D3B2E] select-none">

            {/* Monument Photo */}

            <img
              src={
                activeScan.imageUrl
              }
              alt="Monument Camera Feed"
              className={`w-full h-full object-cover transition-transform duration-300 ${
                zoomLevel ===
                '0.5x'
                  ? 'scale-90'
                  : zoomLevel ===
                    '2x'
                  ? 'scale-125'
                  : 'scale-100'
              }`}
            />

            {/* Grid */}

            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">

              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />

              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />

              <div className="border-r border-white/15" />
              <div className="border-r border-white/15" />
              <div />

            </div>

            {/* Corner brackets */}

            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-white rounded-tl-lg pointer-events-none" />

            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-white rounded-tr-lg pointer-events-none" />

            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-white rounded-bl-lg pointer-events-none" />

            <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-white rounded-br-lg pointer-events-none" />

            {/* Status */}

            <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-20 max-w-[90%]">

              <div className="px-2.5 sm:px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold flex items-center space-x-1.5 shadow-md truncate">

                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />

                <span className="truncate">
                  {isScanning
                    ? 'AI Inferencing in progress...'
                    : hasScanned
                    ? 'Analysis Complete'
                    : selectedSiteId
                    ? 'AI is ready to analyze'
                    : 'Select a monument first'}
                </span>

              </div>

            </div>

            {/* Radar */}

            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_15px_#D4AF37] animate-radar-sweep pointer-events-none z-30" />
            )}

            {/* Bounding boxes */}

            {hasScanned &&
              activeScan.detections.map(
                (det) => {

                  const styling =
                    damageColorMap[
                      det.type
                    ] ||
                    damageColorMap.crack;

                  const isSelected =
                    selectedDetection?.id ===
                    det.id;

                  return (
                    <div
                      key={det.id}
                      onClick={() =>
                        setSelectedDetection(
                          det
                        )
                      }
                      className={`absolute cursor-pointer border-2 transition-all duration-200 z-20 ${styling.border} ${styling.bg} ${
                        isSelected
                          ? 'ring-4 ring-white shadow-xl scale-105'
                          : 'hover:scale-105'
                      }`}
                      style={{
                        left: `${det.bbox.x}%`,
                        top: `${det.bbox.y}%`,
                        width: `${det.bbox.width}%`,
                        height: `${det.bbox.height}%`
                      }}
                    >
                      <span
                        className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-white bg-black/80 border ${styling.border} whitespace-nowrap shadow-md`}
                      >
                        {styling.icon}{' '}
                        {det.type.toUpperCase()}{' '}
                        (
                        {Math.round(
                          det.confidence *
                            100
                        )}
                        %)
                      </span>
                    </div>
                  );
                }
              )}

            {/* Zoom */}

            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 flex items-center space-x-1 text-white text-xs">

              {(
                [
                  '0.5x',
                  '1x',
                  '2x'
                ] as const
              ).map((z) => (

                <button
                  key={z}
                  onClick={() =>
                    setZoomLevel(z)
                  }
                  className={`px-2 sm:px-2.5 py-0.5 rounded-full font-mono font-bold transition-all cursor-pointer ${
                    zoomLevel === z
                      ? 'bg-white text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {z}
                </button>

              ))}

            </div>

            {/* Camera Controls */}

            <div className="absolute bottom-3 inset-x-0 px-4 sm:px-8 flex items-center justify-between z-20">

              {/* Upload */}

              <label
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center cursor-pointer text-white border border-white/30 transition-transform active:scale-95 shadow-md"
                title="Upload from Gallery"
              >

                <Upload className="w-4 h-4" />

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFileUpload
                  }
                  className="hidden"
                />

              </label>

              {/* Shutter */}

              <button
                onClick={
                  handleCapture
                }
                disabled={
                  isScanning || !selectedSiteId
                }
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-2xl transition-transform active:scale-95 flex items-center justify-center hover:ring-4 hover:ring-[#D4AF37]/50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                title="Capture & Run AI Model"
              >

                <div className="w-full h-full rounded-full bg-[#0D3B2E] border-2 border-white flex items-center justify-center">

                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#D4AF37] ${
                      isScanning
                        ? 'animate-ping'
                        : ''
                    }`}
                  />

                </div>

              </button>

              {/* Reset */}

              <button
                onClick={() => {

                  setHasScanned(
                    false
                  );

                  setSelectedDetection(
                    null
                  );

                  setIsSubmitted(
                    false
                  );

                  setBackendScan(
                    null
                  );

                  setSelectedFile(
                    null
                  );

                  setCustomImage(
                    null
                  );

                  setAnalysisError(
                    null
                  );

                  /*
                   * IMPORTANT:
                   * Reset monument selection too.
                   */
                  setSelectedSiteId(
                    ''
                  );

                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transition-transform active:scale-95 shadow-md cursor-pointer"
                title="Reset View"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

            </div>

          </div>

          {/* Error */}

          {analysisError && (
            <div className="w-full mt-4 bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-800 flex items-start gap-2">

              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />

              <span>
                {analysisError}
              </span>

            </div>
          )}

          {/* Selected file */}

          {selectedFile &&
            !isScanning &&
            !hasScanned &&
            !analysisError && (
              <div className="w-full mt-4 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-800">

                <strong>
                  {selectedFile.name}
                </strong>{' '}
                selected.

                {selectedSiteId ? (
                  <>
                    {' '}
                    Press the shutter to send it to the backend AI for{' '}
                    <strong>
                      {getSiteName(
                        selectedSiteId
                      )}
                    </strong>
                    .
                  </>
                ) : (
                  <>
                    {' '}
                    Please select a monument before scanning.
                  </>
                )}

              </div>
            )}

          {/* Under scanner info */}

          <div className="w-full mt-4 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#0D3B2E] gap-2">

            <div className="flex items-center space-x-2">

              <ShieldCheck className="w-4 h-4 text-[#C85A32] shrink-0" />

              <span className="font-medium">
                Your scan feeds directly into ASI's preventive conservation queue.
              </span>

            </div>

            <span className="font-bold text-[#C85A32] whitespace-nowrap self-end sm:self-auto">
              Citizen Science Initiative
            </span>

          </div>

        </div>

        {/* ===================================================
            RIGHT COLUMN
            =================================================== */}

        <div className="order-3 lg:order-3 lg:col-span-3 space-y-4 w-full">

          {hasScanned ? (
            <div className="bg-white p-5 rounded-2xl border-2 border-[#0D3B2E] shadow-xl space-y-4 animate-fadeIn">
              {/* Result Card Header */}
              <div className="flex flex-col pb-3 border-b border-[#0D3B2E]/10 gap-1.5">
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="text-base font-bold text-[#0D3B2E] font-serif-heritage">
                    {activeScan.monumentName}
                  </h3>
                </div>

                <p className="text-[11px] text-[#1A2621]/60 font-mono">
                  {new Date(activeScan.scannedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(activeScan.scannedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>

              {/* Damage Score Meter */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#0D3B2E] font-bold">Surface Damage Index</span>
                  <span className="font-mono font-bold text-red-600 text-sm">
                    {activeScan.overallDamageScore} / 100
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, activeScan.overallDamageScore)}%` }}
                  />
                </div>
              </div>

              {/* Priority & Severity Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#F8F6F0] p-2.5 rounded-xl border border-[#0D3B2E]/10">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Priority</span>
                  <span className={`font-bold uppercase tracking-wider text-xs ${
                    activeScan.priority === 'High' || activeScan.priority === 'Critical'
                      ? 'text-red-700'
                      : activeScan.priority === 'Medium'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}>
                    {activeScan.priority || 'MEDIUM'}
                  </span>
                </div>
                <div className="bg-[#F8F6F0] p-2.5 rounded-xl border border-[#0D3B2E]/10">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Severity</span>
                  <span className={`font-bold uppercase tracking-wider text-xs ${
                    activeScan.severity === 'High' || activeScan.severity === 'Critical'
                      ? 'text-red-700'
                      : activeScan.severity === 'Medium'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}>
                    {activeScan.severity || 'MEDIUM'}
                  </span>
                </div>
              </div>

              {/* Detected Issues List (Deduplicated by title) */}
              {(() => {
                const uniqueDetections = activeScan.detections.filter(
                  (det, index, self) =>
                    index ===
                    self.findIndex(
                      (d) => (d.title || d.type) === (det.title || det.type)
                    )
                );

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0D3B2E]">
                      <span>Detected Issues ({uniqueDetections.length})</span>
                      <span className="text-[10px] text-gray-500 font-normal">Click to highlight</span>
                    </div>

                    {uniqueDetections.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {uniqueDetections.map((det, idx) => {
                          const isSelected = selectedDetection?.id === det.id;
                          const confPct = Math.round(det.confidence * 100);

                          return (
                            <div
                              key={det.id || idx}
                              onClick={() => setSelectedDetection(det)}
                              className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-50/80 border-[#C85A32] shadow-xs'
                                  : 'bg-[#F8F6F0] border-[#0D3B2E]/10 hover:border-[#0D3B2E]/30'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-[#0D3B2E] flex items-center space-x-1 capitalize">
                                  <span>{damageColorMap[det.type]?.icon || '⚡'}</span>
                                  <span>{det.title || det.type}</span>
                                </span>
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[10px] font-mono font-bold text-[#0D3B2E] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                    {confPct}% conf
                                  </span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                    det.severity === 'Critical' || det.severity === 'High'
                                      ? 'bg-red-100 text-red-800'
                                      : det.severity === 'Medium'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {det.severity}
                                  </span>
                                </div>
                              </div>

                              <p className="text-[11px] text-[#1A2621]/80 leading-tight">
                                {det.description}
                              </p>

                              {det.recommendedAction && (
                                <div className="mt-1.5 pt-1.5 border-t border-[#0D3B2E]/10 text-[10px] text-[#0D3B2E]">
                                  <span className="font-bold">Action:</span> {det.recommendedAction}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>No structural damage detected on inspected masonry surface.</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Submit Report Button */}
              <div>
                {isSubmitted ? (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Report Logged to Authority Dashboard!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitReport}
                    className="w-full py-3 bg-[#0D3B2E] hover:bg-[#08281E] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Submit Citizen Damage Report</span>
                  </button>
                )}
              </div>
            </div>
          ) : (

            <div className="bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm space-y-3">

              <h3 className="text-xs font-bold text-[#0D3B2E] uppercase tracking-wider mb-2">
                What We Detect
              </h3>

              <div className="space-y-2">

                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 text-red-900 text-xs font-medium border border-red-100">

                  <div className="flex items-center space-x-2">

                    <span className="w-6 h-6 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-xs">
                      ⚡
                    </span>

                    <span>
                      Cracks & Shear Fissures
                    </span>

                  </div>

                  <span className="text-[10px] text-red-600 font-mono">
                    0.1mm res
                  </span>

                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-900 text-xs font-medium border border-amber-100">

                  <div className="flex items-center space-x-2">

                    <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs">
                      🌾
                    </span>

                    <span>
                      Salt & Wind Erosion
                    </span>

                  </div>

                  <span className="text-[10px] text-amber-600 font-mono">
                    Texture CV
                  </span>

                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 text-yellow-900 text-xs font-medium border border-yellow-100">

                  <div className="flex items-center space-x-2">

                    <span className="w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center text-xs">
                      🎨
                    </span>

                    <span>
                      Surface Discoloration
                    </span>

                  </div>

                  <span className="text-[10px] text-yellow-600 font-mono">
                    RGB Delta
                  </span>

                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-medium border border-emerald-100">

                  <div className="flex items-center space-x-2">

                    <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs">
                      🌿
                    </span>

                    <span>
                      Vegetation Overgrowth
                    </span>

                  </div>

                  <span className="text-[10px] text-emerald-600 font-mono">
                    Rootlet Seg
                  </span>

                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 text-blue-900 text-xs font-medium border border-blue-100">

                  <div className="flex items-center space-x-2">

                    <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs">
                      💧
                    </span>

                    <span>
                      Moisture & Dampness
                    </span>

                  </div>

                  <span className="text-[10px] text-blue-600 font-mono">
                    Spectral IR
                  </span>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};