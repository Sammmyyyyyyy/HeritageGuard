import React, { useState } from 'react';
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
  const [selectedScanIndex, setSelectedScanIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'0.5x' | '1x' | '2x'>('1x');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState<DamageDetection | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const activeScan: DamageScanResult = customImage 
    ? {
        ...PRESET_DAMAGE_SCANS[0],
        id: 'custom-scan-' + Date.now(),
        monumentName: 'Identified: Custom Heritage Structure (98.2% match)',
        imageUrl: customImage,
      }
    : PRESET_DAMAGE_SCANS[selectedScanIndex];

  const handleCapture = () => {
    setIsScanning(true);
    setSelectedDetection(null);
    setIsSubmitted(false);

    // Simulate AI Computer Vision inference pipeline
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
      if (activeScan.detections.length > 0) {
        setSelectedDetection(activeScan.detections[0]);
      }
    }, 1800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setCustomImage(uploadEvent.target.result as string);
          setHasScanned(false);
          setIsSubmitted(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = () => {
    setIsSubmitted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onReportSubmitted) {
      onReportSubmitted({
        ...activeScan,
        status: 'Pending Review',
        submittedBy: 'Ayush K. (Citizen Heritage Contributor)'
      });
    }
  };

  const damageColorMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    crack: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500', icon: '⚡' },
    erosion: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500', icon: '🌾' },
    discoloration: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500', icon: '🎨' },
    vegetation: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500', icon: '🌿' },
    moisture: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500', icon: '💧' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Title Bar (Image 4 inspired) */}
      <div className="text-center max-w-3xl mx-auto mb-8 relative">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0D3B2E] font-serif-heritage mb-2">
          Scan <span className="text-[#C85A32]">Monument</span>
        </h1>
        <p className="text-sm text-[#1A2621]/70">
          {language === 'hi'
            ? 'स्मारक की तस्वीर लें — हमारा एआई कंप्यूटर विज़न मॉडल सूक्ष्म दरारों, क्षरण, नमी व वनस्पति की पहचान करेगा।'
            : 'Capture the monument to detect damage, classify structural deterioration, and assess physical condition.'}
        </p>

        {/* Top Right Quick Controls */}
        <div className="absolute right-0 top-0 hidden sm:flex items-center space-x-2">
          <button
            onClick={() => setIsFlashOn(!isFlashOn)}
            className={`p-2.5 rounded-full border transition-all ${
              isFlashOn ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-gray-200 text-gray-600'
            }`}
            title="Toggle Flash"
          >
            {isFlashOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preset Test Case Selector Bar */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2 px-1 max-w-full no-scrollbar">
        <span className="text-xs font-semibold text-[#0D3B2E] whitespace-nowrap shrink-0">
          {language === 'hi' ? 'परीक्षण हेतु नमूना चुनें:' : 'Test with Preset Scans:'}
        </span>
        {PRESET_DAMAGE_SCANS.map((scan, idx) => (
          <button
            key={scan.id}
            onClick={() => {
              setCustomImage(null);
              setSelectedScanIndex(idx);
              setHasScanned(false);
              setSelectedDetection(null);
              setIsSubmitted(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border cursor-pointer shrink-0 ${
              !customImage && selectedScanIndex === idx
                ? 'bg-[#0D3B2E] text-white border-[#0D3B2E] shadow-sm'
                : 'bg-white text-[#1A2621] border-[#0D3B2E]/15 hover:bg-[#F8F6F0]'
            }`}
          >
            {scan.monumentName.split('(')[0]}
          </button>
        ))}
        {customImage && (
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] text-[#08281E] shadow-sm whitespace-nowrap shrink-0">
            Custom Uploaded Photo
          </span>
        )}
      </div>

      {/* Main Scanner Grid (Desktop: Steps | Scanner | Results, Mobile: Scanner -> Steps -> Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Step 1 / Instructions Column: Order-2 on mobile, Order-1 on Desktop (3 cols) */}
        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4 w-full">
          
          {/* Step-by-Step Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm">
            <h3 className="text-xs font-bold text-[#0D3B2E] uppercase tracking-wider mb-4 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Scan in 3 Simple Steps</span>
            </h3>

            <div className="space-y-4 relative">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#0D3B2E] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0D3B2E]">Point Camera</h4>
                  <p className="text-[11px] text-[#1A2621]/70">Frame the monument in the viewfinder</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#EAE6DB] text-[#0D3B2E] flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0D3B2E]">Capture</h4>
                  <p className="text-[11px] text-[#1A2621]/70">Take a steady, high-resolution photo</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#EAE6DB] text-[#0D3B2E] flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0D3B2E]">AI Analysis</h4>
                  <p className="text-[11px] text-[#1A2621]/70">Instant crack & erosion classification</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips for Best Results */}
          <div className="bg-[#F8F6F0] p-5 rounded-2xl border border-[#0D3B2E]/10">
            <h4 className="text-xs font-bold text-[#0D3B2E] mb-3 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Tips for Best Results</span>
            </h4>
            <ul className="space-y-2 text-[11px] text-[#1A2621]/75">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Use good natural daylight</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Keep the damaged surface in focus</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Avoid extreme motion blur</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Capture close-up of masonry joints</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Center Column: Camera Viewfinder: Order-1 on mobile, Order-2 on Desktop (6 cols) */}
        <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center w-full">
          
          <div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border-2 sm:border-4 border-[#0D3B2E] select-none">
            
            {/* Monument Photo */}
            <img
              src={activeScan.imageUrl}
              alt="Monument Camera Feed"
              className={`w-full h-full object-cover transition-transform duration-300 ${
                zoomLevel === '0.5x' ? 'scale-90' : zoomLevel === '2x' ? 'scale-125' : 'scale-100'
              }`}
            />

            {/* Viewfinder Rule-of-Thirds Grid */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-white/15" />
              <div className="border-r border-white/15" />
              <div className="" />
            </div>

            {/* Corner Framing Brackets */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-white rounded-tl-lg pointer-events-none" />
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-white rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-white rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-white rounded-br-lg pointer-events-none" />

            {/* Top Status Pill */}
            <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-20 max-w-[90%]">
              <div className="px-2.5 sm:px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold flex items-center space-x-1.5 shadow-md truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="truncate">{isScanning ? 'AI Inferencing in progress...' : hasScanned ? 'Analysis Complete' : 'AI is ready to analyze'}</span>
              </div>
            </div>

            {/* Radar Scan Beam Animation */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_15px_#D4AF37] animate-radar-sweep pointer-events-none z-30" />
            )}

            {/* AI Bounding Boxes when Scanned! */}
            {hasScanned && activeScan.detections.map((det) => {
              const styling = damageColorMap[det.type] || damageColorMap.crack;
              const isSelected = selectedDetection?.id === det.id;

              return (
                <div
                  key={det.id}
                  onClick={() => setSelectedDetection(det)}
                  className={`absolute cursor-pointer border-2 transition-all duration-200 z-20 ${styling.border} ${styling.bg} ${
                    isSelected ? 'ring-4 ring-white shadow-xl scale-105' : 'hover:scale-105'
                  }`}
                  style={{
                    left: `${det.bbox.x}%`,
                    top: `${det.bbox.y}%`,
                    width: `${det.bbox.width}%`,
                    height: `${det.bbox.height}%`
                  }}
                >
                  <span className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-white bg-black/80 border ${styling.border} whitespace-nowrap shadow-md`}>
                    {styling.icon} {det.type.toUpperCase()} ({Math.round(det.confidence * 100)}%)
                  </span>
                </div>
              );
            })}

            {/* Zoom Selector Bar (0.5x, 1x, 2x) */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 flex items-center space-x-1 text-white text-xs">
              {(['0.5x', '1x', '2x'] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`px-2 sm:px-2.5 py-0.5 rounded-full font-mono font-bold transition-all cursor-pointer ${
                    zoomLevel === z ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>

            {/* Bottom Camera Controls Bar (Shutter, Gallery, Camera Switch) */}
            <div className="absolute bottom-3 inset-x-0 px-4 sm:px-8 flex items-center justify-between z-20">
              
              {/* Gallery File Upload Button */}
              <label 
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center cursor-pointer text-white border border-white/30 transition-transform active:scale-95 shadow-md"
                title="Upload from Gallery"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Central Shutter Button */}
              <button
                onClick={handleCapture}
                disabled={isScanning}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-2xl transition-transform active:scale-95 flex items-center justify-center hover:ring-4 hover:ring-[#D4AF37]/50 cursor-pointer"
                title="Capture & Run AI Model"
              >
                <div className="w-full h-full rounded-full bg-[#0D3B2E] border-2 border-white flex items-center justify-center">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#D4AF37] ${isScanning ? 'animate-ping' : ''}`} />
                </div>
              </button>

              {/* Re-orient / Reset Button */}
              <button
                onClick={() => {
                  setHasScanned(false);
                  setSelectedDetection(null);
                  setIsSubmitted(false);
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transition-transform active:scale-95 shadow-md cursor-pointer"
                title="Reset View"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

            </div>

          </div>

          {/* Under-Scanner Info Strip */}
          <div className="w-full mt-4 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#0D3B2E] gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#C85A32] shrink-0" />
              <span className="font-medium">
                Your scan feeds directly into ASI's preventive conservation queue.
              </span>
            </div>
            <span className="font-bold text-[#C85A32] whitespace-nowrap self-end sm:self-auto">Citizen Science Initiative</span>
          </div>

        </div>

        {/* Right Column: "What We Detect" & AI Results Drawer (3 cols) */}
        <div className="order-3 lg:order-3 lg:col-span-3 space-y-4 w-full">
          
          {/* AI Result Inspection Card */}
          {hasScanned ? (
            <div className="bg-white p-5 rounded-2xl border-2 border-[#0D3B2E] shadow-xl space-y-4 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#0D3B2E]/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    AI Auto-Identified
                  </span>
                  <h3 className="text-sm font-bold text-[#0D3B2E] mt-1">
                    {activeScan.monumentName}
                  </h3>
                </div>
              </div>

              {/* Overall Damage Score Meter */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Surface Damage Index</span>
                  <span className="font-mono font-bold text-red-600">{activeScan.overallDamageScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full"
                    style={{ width: `${activeScan.overallDamageScore}%` }}
                  />
                </div>
              </div>

              {/* Selected Defect Detail */}
              {selectedDetection && (
                <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#0D3B2E]/15 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0D3B2E] flex items-center space-x-1">
                      <span>{damageColorMap[selectedDetection.type]?.icon}</span>
                      <span className="capitalize">{selectedDetection.title}</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                      {selectedDetection.severity} Severity
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1A2621]/80 leading-tight">
                    {selectedDetection.description}
                  </p>
                  <div className="pt-2 border-t border-[#0D3B2E]/10 text-[10px] text-[#0D3B2E] font-medium">
                    <span className="font-bold">Remediation:</span> {selectedDetection.recommendedAction}
                  </div>
                </div>
              )}

              {/* Submit Citizen Damage Report Action */}
              <div>
                {isSubmitted ? (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Report Logged to Authority Dashboard!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitReport}
                    className="w-full py-3 bg-[#0D3B2E] hover:bg-[#08281E] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Submit Citizen Damage Report</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* "What We Detect" Reference Card (Image 4 inspired) */
            <div className="bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#0D3B2E] uppercase tracking-wider mb-2">
                What We Detect
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 text-red-900 text-xs font-medium border border-red-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-xs">⚡</span>
                    <span>Cracks & Shear Fissures</span>
                  </div>
                  <span className="text-[10px] text-red-600 font-mono">0.1mm res</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-900 text-xs font-medium border border-amber-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs">🌾</span>
                    <span>Salt & Wind Erosion</span>
                  </div>
                  <span className="text-[10px] text-amber-600 font-mono">Texture CV</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 text-yellow-900 text-xs font-medium border border-yellow-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center text-xs">🎨</span>
                    <span>Surface Discoloration</span>
                  </div>
                  <span className="text-[10px] text-yellow-600 font-mono">RGB Delta</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-medium border border-emerald-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs">🌿</span>
                    <span>Vegetation Overgrowth</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono">Rootlet Seg</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 text-blue-900 text-xs font-medium border border-blue-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs">💧</span>
                    <span>Moisture & Dampness</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-mono">Spectral IR</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
