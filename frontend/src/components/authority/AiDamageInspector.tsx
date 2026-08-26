import React, { useState } from 'react';
import { 
  Sliders, 
  Layers, 
  Sparkles, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Maximize2, 
  Download,
  Info,
  Calendar,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRESET_DAMAGE_SCANS } from '../../data/damageScansData';

interface AiDamageInspectorProps {
  language: 'en' | 'hi';
  initialMonumentId?: string;
  onDispatchTeam: (monumentName: string, actionType: string) => void;
}

export const AiDamageInspector: React.FC<AiDamageInspectorProps> = ({
  language,
  initialMonumentId,
  onDispatchTeam
}) => {
  const [selectedScanIdx, setSelectedScanIdx] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showCracksLayer, setShowCracksLayer] = useState(true);
  const [showMoistureLayer, setShowMoistureLayer] = useState(true);
  const [showErosionLayer, setShowErosionLayer] = useState(true);
  const [isDispatched, setIsDispatched] = useState(false);

  const scan = PRESET_DAMAGE_SCANS[selectedScanIdx];

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleDispatchAction = () => {
    setIsDispatched(true);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });
    onDispatchTeam(scan.monumentName, 'ASI Structural Consolidation & Lime Grout Injection');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#0D3B2E]/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
              Multi-Spectral Computer Vision
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1128] font-serif-heritage">
              AI Damage Inspector & Baseline Comparison
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#1A2621]/70 mt-1">
            Compare 1995 Archival Baseline photographs against 2026 AI multi-spectral scans with crack progression vectors.
          </p>
        </div>

        {/* Site Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-[#0A1128]">Select Monument:</label>
          <select
            value={selectedScanIdx}
            onChange={(e) => {
              setSelectedScanIdx(Number(e.target.value));
              setIsDispatched(false);
            }}
            className="bg-white border border-[#0D3B2E]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#0A1128] shadow-sm outline-none"
          >
            {PRESET_DAMAGE_SCANS.map((s, idx) => (
              <option key={s.id} value={idx}>{s.monumentName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Split Comparison Slider + Telemetry Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Split Image Comparison (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div
            className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-black shadow-2xl border-2 border-[#0A1128] cursor-ew-resize select-none"
            onMouseMove={(e) => { if (isDragging || e.buttons === 1) handleSliderMove(e); }}
            onTouchMove={handleSliderMove}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          >
            {/* Right / Background Image: 2026 AI Scan with Overlays */}
            <div className="absolute inset-0">
              <img
                src={scan.imageUrl}
                alt="2026 Present Condition"
                className="w-full h-full object-cover"
              />

              {/* AI Damage Heatmap Layer */}
              {showMoistureLayer && (
                <div className="absolute inset-0 bg-blue-500/15 mix-blend-color pointer-events-none" />
              )}

              {/* AI Bounding Boxes & Vectors */}
              {showCracksLayer && scan.detections.map((det) => (
                <div
                  key={det.id}
                  className="absolute border-2 border-red-500 bg-red-500/25 pointer-events-none animate-pulse"
                  style={{
                    left: `${det.bbox.x}%`,
                    top: `${det.bbox.y}%`,
                    width: `${det.bbox.width}%`,
                    height: `${det.bbox.height}%`
                  }}
                >
                  <span className="absolute -top-5 left-0 px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-red-950 text-red-200 border border-red-500">
                    {det.title} ({Math.round(det.confidence * 100)}%)
                  </span>
                </div>
              ))}

              {/* Label Badge Right */}
              <div className="absolute top-4 right-4 bg-red-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-red-200 border border-red-500/40">
                2026 AI Multi-Spectral Scan
              </div>
            </div>

            {/* Left Image: 1995 Archival Baseline (Clipped via clip-path) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
              <img
                src={scan.imageUrl}
                alt="1995 Archival Baseline"
                className="w-full h-full object-cover filter sepia-[0.35] brightness-90 contrast-95"
              />

              {/* Label Badge Left */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-200 border border-amber-500/40">
                1995 Archival Baseline (ASI Monograph)
              </div>
            </div>

            {/* Central Vertical Split Drag Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-30"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-[#0A1128] shadow-2xl flex items-center justify-center font-bold text-xs border-2 border-[#0A1128]">
                ↔
              </div>
            </div>

          </div>

          {/* Layer Toggles Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-[#0D3B2E]/10 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-[#0A1128] flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-[#C85A32]" />
              <span>AI Detection Layer Overlays:</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCracksLayer(!showCracksLayer)}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                  showCracksLayer
                    ? 'bg-red-100 text-red-900 border-red-300 shadow-xs'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
              >
                ⚡ Micro-Crack Vectors
              </button>

              <button
                onClick={() => setShowMoistureLayer(!showMoistureLayer)}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                  showMoistureLayer
                    ? 'bg-blue-100 text-blue-900 border-blue-300 shadow-xs'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
              >
                💧 Moisture Saturation Heatmap
              </button>

              <button
                onClick={() => setShowErosionLayer(!showErosionLayer)}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                  showErosionLayer
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
              >
                🌾 Salt Exfoliation Fissures
              </button>
            </div>
          </div>

        </div>

        {/* Right: Telemetry & Conservation Action Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Defect Diagnostics Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#0D3B2E]/10 shadow-sm space-y-4">
            
            <div className="pb-3 border-b border-[#0D3B2E]/10">
              <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                Telemetry Diagnostics
              </span>
              <h3 className="text-base font-bold text-[#0A1128] mt-1 font-serif-heritage">
                {scan.monumentName}
              </h3>
              <p className="text-xs text-gray-500">{scan.locationDetails}</p>
            </div>

            {/* Damage Severity Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#0D3B2E]/10">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Surface Damage</span>
                <p className="text-2xl font-bold font-mono text-red-600 mt-0.5">
                  {scan.overallDamageScore}<span className="text-xs text-gray-400">/100</span>
                </p>
              </div>

              <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#0D3B2E]/10">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Crack Velocity</span>
                <p className="text-xl font-bold font-mono text-amber-700 mt-0.5">
                  +0.04 <span className="text-[10px] font-normal">mm/yr</span>
                </p>
              </div>
            </div>

            {/* Detections List */}
            <div>
              <p className="text-xs font-bold text-[#0A1128] uppercase mb-2">Detected Anomalies ({scan.detections.length})</p>
              <div className="space-y-2">
                {scan.detections.map((det) => (
                  <div key={det.id} className="p-3 rounded-xl bg-red-50/60 border border-red-200/80 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-red-950">{det.title}</span>
                      <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                        {det.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-red-900/80 leading-snug">{det.description}</p>
                    <p className="text-[10px] text-red-950 font-semibold mt-1 pt-1 border-t border-red-200/50">
                      Recommendation: {det.recommendedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispatch Action Button */}
            <div className="pt-2">
              {isDispatched ? (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ASI Conservation Team Dispatched!</span>
                </div>
              ) : (
                <button
                  onClick={handleDispatchAction}
                  className="w-full py-3 bg-[#0A1128] hover:bg-[#131E3A] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg border border-[#D4AF37]/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch ASI Conservation Team</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
