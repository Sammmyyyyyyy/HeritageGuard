import { DamageScanResult } from '../types/heritage';

export const PRESET_DAMAGE_SCANS: DamageScanResult[] = [
  {
    id: 'scan-darasuram-01',
    monumentId: 'airavatesvara-temple',
    monumentName: 'Airavatesvara Temple (Darasuram Vimana)',
    scannedAt: '2026-08-24 14:22:10 IST',
    imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80',
    overallDamageScore: 54,
    source: 'Citizen Camera Scan',
    status: 'Pending Review',
    submittedBy: 'Ayush K. (Verified Citizen Contributor)',
    locationDetails: 'Southern Plinth & Elephant Balustrade',
    detections: [
      {
        id: 'det-1',
        type: 'crack',
        confidence: 0.94,
        severity: 'High',
        bbox: { x: 28, y: 34, width: 22, height: 18 },
        title: 'Vertical Fissure along Plinth Joint',
        description: 'Micro-fracture propagating along granite bedding plane, 3.2mm aperture detected.',
        recommendedAction: 'Grout injection with hydraulic lime and micro-fissure sealant.'
      },
      {
        id: 'det-2',
        type: 'vegetation',
        confidence: 0.91,
        severity: 'Medium',
        bbox: { x: 62, y: 18, width: 16, height: 15 },
        title: 'Micro-Bryophyte & Ficus Rootlet Ingrowth',
        description: 'Biological root penetration in cornice crevices accelerating mortar dislodgement.',
        recommendedAction: 'Biocidal treatment (zinc fluorosilicate) followed by mechanical extraction.'
      },
      {
        id: 'det-3',
        type: 'moisture',
        confidence: 0.88,
        severity: 'Medium',
        bbox: { x: 44, y: 55, width: 26, height: 22 },
        title: 'Capillary Moisture Ingress Zone',
        description: 'Sub-surface dampness detected via spectral analysis near drainage outlet.',
        recommendedAction: 'Check subsurface apron drainage slope and unclog historic runoff channels.'
      }
    ]
  },
  {
    id: 'scan-konark-02',
    monumentId: 'konark-sun-temple',
    monumentName: 'Konark Sun Temple (Natamandira Plinth)',
    scannedAt: '2026-08-24 11:05:44 IST',
    imageUrl: 'https://images.unsplash.com/photo-1599818816824-747201c10712?auto=format&fit=crop&w=1200&q=80',
    overallDamageScore: 78,
    source: 'Official Drone LiDAR',
    status: 'Action Dispatched',
    submittedBy: 'ASI Eastern Circle Survey Drone #4',
    locationDetails: 'Sundial Wheel #7 & Chlorite Relief Band',
    detections: [
      {
        id: 'det-4',
        type: 'erosion',
        confidence: 0.97,
        severity: 'Critical',
        bbox: { x: 35, y: 40, width: 30, height: 28 },
        title: 'Saline Crystallisation & Khondalite Exfoliation',
        description: 'Coastal sea-spray causing salt subflorescence, leading to loss of decorative detail.',
        recommendedAction: 'Paper pulp desalinisation poultice cycles and ethyl silicate consolidation.'
      },
      {
        id: 'det-5',
        type: 'crack',
        confidence: 0.92,
        severity: 'High',
        bbox: { x: 18, y: 60, width: 20, height: 16 },
        title: 'Structural Masonry Shear Joint',
        description: 'Differential settlement fracture across wheel hub bearing.',
        recommendedAction: 'Install stainless steel tension ties and structural displacement gauge.'
      }
    ]
  },
  {
    id: 'scan-taj-03',
    monumentId: 'taj-mahal',
    monumentName: 'Taj Mahal (South-West Arch Facade)',
    scannedAt: '2026-08-23 16:48:12 IST',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    overallDamageScore: 68,
    source: 'Citizen Camera Scan',
    status: 'Verified',
    submittedBy: 'Dr. Priya S. (Heritage Conservator)',
    locationDetails: 'Iwan Archway Inlay Border',
    detections: [
      {
        id: 'det-6',
        type: 'discoloration',
        confidence: 0.95,
        severity: 'High',
        bbox: { x: 42, y: 25, width: 24, height: 35 },
        title: 'Atmospheric Particulate & Soot Deposition',
        description: 'Surface yellowing caused by hydrocarbon particulates and sulfur oxide interactions.',
        recommendedAction: 'Apply Fuller\'s Earth (Multani Mitti) cleansing mud pack.'
      },
      {
        id: 'det-7',
        type: 'moisture',
        confidence: 0.89,
        severity: 'Medium',
        bbox: { x: 68, y: 65, width: 18, height: 20 },
        title: 'Marble Base Dampness Bleed',
        description: 'Capillary suction from high Yamuna basin groundwater table.',
        recommendedAction: 'Inspect damp-proof barrier and replenish perimeter gravel wells.'
      }
    ]
  }
];
