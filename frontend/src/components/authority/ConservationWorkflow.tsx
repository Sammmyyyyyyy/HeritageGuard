import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Camera, 
  Layers, 
  UserCheck,
  Building,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DamageScanResult } from '../../types/heritage';
import { PRESET_DAMAGE_SCANS } from '../../data/damageScansData';

interface ConservationWorkflowProps {
  language: 'en' | 'hi';
  citizenReports: DamageScanResult[];
  onVerifyReport: (reportId: string) => void;
  onDispatchAction: (title: string) => void;
}

export const ConservationWorkflow: React.FC<ConservationWorkflowProps> = ({
  language,
  citizenReports,
  onVerifyReport,
  onDispatchAction
}) => {
  const [selectedReport, setSelectedReport] = useState<DamageScanResult>(citizenReports[0] || PRESET_DAMAGE_SCANS[0]);
  const [activeTab, setActiveTab] = useState<'citizen-queue' | 'kanban'>('citizen-queue');
  const [dispatchedItems, setDispatchedItems] = useState<string[]>([]);

  const handleDispatch = (report: DamageScanResult, actionTitle: string) => {
    setDispatchedItems((prev) => [...prev, report.id]);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
    onDispatchAction(`${actionTitle} at ${report.monumentName}`);
    onVerifyReport(report.id);
  };

  const kanbanColumns = [
    {
      id: 'review',
      title: 'Under Surveillance & AI Review',
      count: 4,
      items: [
        { title: 'Airavatesvara Plinth Fissures', site: 'Darasuram, Tamil Nadu', priority: 'High', source: 'Citizen Camera' },
        { title: 'Cave 17 Moisture Ingress', site: 'Ajanta Caves, MH', priority: 'Critical', source: 'Fixed Spectral Sensor' }
      ]
    },
    {
      id: 'dispatched',
      title: 'Action Dispatched to Circle Office',
      count: 3,
      items: [
        { title: 'Konark Wheel 7 Desalination Poultice', site: 'Konark Sun Temple', priority: 'Critical', source: 'ASI Drone LiDAR' },
        { title: 'Taj West Minaret Joint Grouting', site: 'Taj Mahal, Agra', priority: 'High', source: 'Structural Gauge' }
      ]
    },
    {
      id: 'in-progress',
      title: 'Active Restoration In Progress',
      count: 5,
      items: [
        { title: 'Vittala Temple Acoustic Enclosure Cordon', site: 'Hampi, Karnataka', priority: 'Medium', source: 'CCTV Surveillance' },
        { title: 'Fatehpur Sikri Sandstone Consolidation', site: 'Fatehpur Sikri, UP', priority: 'Medium', source: 'Circle Survey' }
      ]
    },
    {
      id: 'resolved',
      title: 'Consolidated & Preserved',
      count: 18,
      items: [
        { title: 'Brihadisvara Granite Water Runoff Clearance', site: 'Thanjavur, Tamil Nadu', priority: 'Low', source: 'Quarterly Maintenance' },
        { title: 'Mehrangarh Rampart Mortar Repointing', site: 'Jodhpur, Rajasthan', priority: 'Low', source: 'Museum Trust' }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#0D3B2E]/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1128] font-serif-heritage">
              Conservation Action & Citizen Reports Pipeline
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#1A2621]/70 mt-1">
            Review crowdsourced damage submissions from tourists and dispatch ASI field conservation tasks.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-2 bg-[#F8F6F0] p-1 rounded-xl border border-[#0D3B2E]/15">
          <button
            onClick={() => setActiveTab('citizen-queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'citizen-queue'
                ? 'bg-[#0A1128] text-[#D4AF37] shadow-sm'
                : 'text-[#1A2621]/70 hover:text-[#0A1128]'
            }`}
          >
            Citizen Scans Review Queue ({citizenReports.length})
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'kanban'
                ? 'bg-[#0A1128] text-[#D4AF37] shadow-sm'
                : 'text-[#1A2621]/70 hover:text-[#0A1128]'
            }`}
          >
            Conservation Kanban Board
          </button>
        </div>
      </div>

      {activeTab === 'citizen-queue' ? (
        /* Citizen Reports Review Queue Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Queue List (5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#0D3B2E]/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#0D3B2E]/10">
              <h3 className="text-sm font-bold text-[#0A1128] font-serif-heritage">
                Incoming Citizen Damage Scans
              </h3>
              <span className="text-xs text-gray-500 font-mono">Live Sync</span>
            </div>

            <div className="space-y-3">
              {citizenReports.map((item) => {
                const isSelected = selectedReport.id === item.id;
                const isItemDispatched = dispatchedItems.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReport(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F8F6F0] border-[#0A1128] shadow-sm ring-1 ring-[#0A1128]'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-[#0A1128]">
                        {item.monumentName}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isItemDispatched
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isItemDispatched ? 'Dispatched' : item.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 mb-2">
                      Submitted by: <span className="font-medium text-[#0D3B2E]">{item.submittedBy}</span>
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-gray-100">
                      <span>{item.scannedAt}</span>
                      <span className="font-mono font-bold text-red-600">Damage: {item.overallDamageScore}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Report Inspection & Dispatch Actions (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#0D3B2E]/10 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#0D3B2E]/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  AI Multi-Spectral Verified
                </span>
                <h3 className="text-lg font-bold text-[#0A1128] font-serif-heritage mt-1">
                  {selectedReport.monumentName}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-red-600">
                  Damage Index: {selectedReport.overallDamageScore}/100
                </span>
              </div>
            </div>

            {/* Scanned Image Preview with Bounding Boxes */}
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-black border border-gray-200">
              <img
                src={selectedReport.imageUrl}
                alt={selectedReport.monumentName}
                className="w-full h-full object-cover"
              />

              {/* Bounding Box Highlights */}
              {selectedReport.detections.map((d) => (
                <div
                  key={d.id}
                  className="absolute border-2 border-red-500 bg-red-500/20"
                  style={{
                    left: `${d.bbox.x}%`,
                    top: `${d.bbox.y}%`,
                    width: `${d.bbox.width}%`,
                    height: `${d.bbox.height}%`
                  }}
                >
                  <span className="absolute -top-5 left-0 px-1 text-[9px] font-bold font-mono bg-black text-white border border-red-500">
                    {d.title} ({Math.round(d.confidence * 100)}%)
                  </span>
                </div>
              ))}
            </div>

            {/* Detections Breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#0A1128] uppercase">Detected Structural Imperfections</p>
              {selectedReport.detections.map((det) => (
                <div key={det.id} className="p-3 bg-[#F8F6F0] rounded-xl text-xs space-y-1 border border-[#0D3B2E]/10">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0D3B2E]">{det.title}</span>
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                      {det.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1A2621]/80">{det.description}</p>
                  <p className="text-[10px] text-emerald-800 font-semibold">
                    Suggested Action: {det.recommendedAction}
                  </p>
                </div>
              ))}
            </div>

            {/* Dispatch Actions Toolbar */}
            <div className="pt-3 border-t border-[#0D3B2E]/10 flex flex-wrap gap-3">
              <button
                onClick={() => handleDispatch(selectedReport, 'ASI Emergency Masonry Grout Injection')}
                className="flex-1 py-3 bg-[#0A1128] hover:bg-[#131E3A] text-[#D4AF37] font-bold text-xs rounded-xl shadow-md border border-[#D4AF37]/30 transition-all flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch ASI Conservation Team</span>
              </button>

              <button
                onClick={() => handleDispatch(selectedReport, 'Drone High-Density LiDAR Survey')}
                className="px-4 py-3 bg-white hover:bg-gray-50 text-[#0A1128] font-bold text-xs rounded-xl border border-gray-300 transition-all"
              >
                Schedule Drone LiDAR
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* Conservation Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
          {kanbanColumns.map((col) => (
            <div key={col.id} className="bg-[#F8F6F0] p-4 rounded-2xl border border-[#0D3B2E]/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#0D3B2E]/10">
                <h3 className="text-xs font-bold text-[#0A1128]">{col.title}</h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-white text-[#0A1128] shadow-xs">
                  {col.count}
                </span>
              </div>

              <div className="space-y-2.5">
                {col.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3.5 rounded-xl border border-[#0D3B2E]/10 shadow-xs hover:shadow-md transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        item.priority === 'Critical' ? 'bg-red-100 text-red-800' : item.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.priority} Priority
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">{item.source}</span>
                    </div>

                    <h4 className="text-xs font-bold text-[#0A1128] leading-tight">
                      {item.title}
                    </h4>

                    <p className="text-[10px] text-gray-500">{item.site}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
