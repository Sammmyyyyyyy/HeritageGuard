// Highly reliable, verified high-resolution images with fallback SVG data URIs
// for offline or rate-limited environments

export const FALLBACK_IMAGES = {
  hampiHero: 'https://images.unsplash.com/photo-1600100397608-f010f445b23e?auto=format&fit=crop&w=1920&q=80',
  tajMahal: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  hampi: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
  qutubMinar: 'https://images.unsplash.com/photo-1545126178-8628045585b4?auto=format&fit=crop&w=800&q=80',
  konark: 'https://images.unsplash.com/photo-1599818816824-747201c10712?auto=format&fit=crop&w=800&q=80',
  ajanta: 'https://images.unsplash.com/photo-1591522810850-58128c5fb089?auto=format&fit=crop&w=800&q=80',
  mehrangarh: 'https://images.unsplash.com/photo-1588096344356-9b4009f4460f?auto=format&fit=crop&w=800&q=80',
  brihadisvara: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  khajuraho: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
  mehtabBagh: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
  fatehpurSikri: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
  darasuram: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=800&q=80'
};

// Generates an instant high-quality decorative SVG data URI as guaranteed offline fallback
export const createSvgFallback = (title: string, subtitle: string, bgGradient: [string, string]) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}"/>
        <stop offset="100%" stop-color="${bgGradient[1]}"/>
      </linearGradient>
      <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0 20 L 20 0 L 40 20 L 20 40 Z" fill="none" stroke="#D4AF37" stroke-width="0.75" opacity="0.15"/>
      </pattern>
    </defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <rect width="800" height="600" fill="url(#p)"/>
    
    <!-- Architectural Silhouette -->
    <g fill="#D4AF37" opacity="0.25" transform="translate(250, 180) scale(1.5)">
      <path d="M50 10 L60 40 L90 40 L70 60 L80 90 L50 70 L20 90 L30 60 L10 40 L40 40 Z"/>
      <rect x="30" y="85" width="40" height="40" rx="4"/>
      <path d="M40 125 L40 105 A10 10 0 0 1 60 105 L60 125 Z" fill="#0D3B2E"/>
    </g>
    
    <!-- Text Labels -->
    <text x="400" y="420" font-family="'Playfair Display', serif" font-size="34" font-weight="bold" fill="#F8F6F0" text-anchor="middle">
      ${title}
    </text>
    <text x="400" y="460" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600" fill="#D4AF37" text-anchor="middle" letter-spacing="2">
      ${subtitle.toUpperCase()}
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const MONUMENT_FALLBACKS: Record<string, string> = {
  'taj-mahal': createSvgFallback('Taj Mahal', 'Agra, Uttar Pradesh • Mughal Architecture', ['#0D3B2E', '#165342']),
  'hampi-monuments': createSvgFallback('Hampi (Vijayanagara)', 'Karnataka • Dravidian Architecture', ['#C85A32', '#7A2E16']),
  'qutub-minar': createSvgFallback('Qutub Minar', 'New Delhi • Indo-Islamic Architecture', ['#8B2635', '#4A121A']),
  'konark-sun-temple': createSvgFallback('Konark Sun Temple', 'Puri, Odisha • Kalinga Architecture', ['#8C5A28', '#4A2E14']),
  'ajanta-caves': createSvgFallback('Ajanta Caves', 'Maharashtra • Buddhist Heritage', ['#2B4162', '#141E2D']),
  'mehrangarh-fort': createSvgFallback('Mehrangarh Fort', 'Jodhpur, Rajasthan • Rajput Architecture', ['#C85A32', '#43281C']),
  'brihadisvara-temple': createSvgFallback('Brihadisvara Temple', 'Thanjavur, Tamil Nadu • Chola Dynasty', ['#0D3B2E', '#22382B']),
  'khajuraho-monuments': createSvgFallback('Khajuraho Group', 'Madhya Pradesh • Chandela Dynasty', ['#784B24', '#3E2510']),
  'mehtab-bagh': createSvgFallback('Mehtab Bagh', 'Agra • Moonlight Garden', ['#165342', '#08281E']),
  'fatehpur-sikri': createSvgFallback('Fatehpur Sikri', 'Uttar Pradesh • Mughal Red Sandstone', ['#A23B2A', '#521910']),
  'airavatesvara-temple': createSvgFallback('Airavatesvara Temple', 'Darasuram, Tamil Nadu • UNESCO', ['#0D3B2E', '#142C23']),
  'badami-caves': createSvgFallback('Badami Caves', 'Karnataka • Chalukya Rock Cut', ['#8B4513', '#3E1F09'])
};
