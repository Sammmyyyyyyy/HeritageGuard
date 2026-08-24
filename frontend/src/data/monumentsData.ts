import { Monument } from '../types/heritage';

export const MONUMENTS_DATA: Monument[] = [
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    hindiName: 'ताज महल',
    tagline: 'The timeless monument of eternal love and peak Mughal architecture',
    city: 'Agra',
    state: 'Uttar Pradesh',
    lat: 27.1751,
    lng: 78.0421,
    category: 'Tombs & Mausoleums',
    timePeriod: '1632–1653 CE (Mughal Era)',
    architecturalStyle: 'Mughal Architecture',
    isUnesco: true,
    rating: 4.8,
    reviewsCount: '2.5K reviews',
    imageUrl: '/images/taj_mahal_card.jpg',
    gallery: [
      '/images/taj_mahal_card.jpg',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80'
    ],
    heritagePressureScore: 91,
    damageScore: 64,
    crowdLevel: 'Overcrowded',
    liveFootfall: 42800,
    maxCapacity: 35000,
    bestVisitingWindow: {
      start: '06:00 AM',
      end: '08:30 AM',
      reason: 'Sunrise offers minimal particulate refraction, cooler temperatures, and 75% less crowd density.',
      hindiReason: 'सूर्योदय के समय भीड़ 75% कम रहती है और संगमरमर की प्राकृतिक चमक सबसे सुंदर दिखती है।'
    },
    openingHours: 'Sunrise to Sunset (Closed on Fridays)',
    entryFee: { indian: 50, foreigner: 1100 },
    deteriorationStatus: 'Severe Deterioration',
    description: 'An ivory-white marble mausoleum on the south bank of the Yamuna river. Commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal.',
    hindiDescription: 'यमुना नदी के दक्षिणी तट पर स्थित सफेद संगमरमर का अनुपम मकबरा। 1632 में मुगल सम्राट शाहजहाँ द्वारा अपनी बेगम मुमताज महल की याद में बनवाया गया।',
    historicalSignificance: 'Designated as a UNESCO World Heritage Site in 1983 for being "the jewel of Muslim art in India and one of the universally admired masterpieces of the world\'s heritage".',
    architectureHighlights: [
      'Pure Makrana white marble with Pietra Dura gemstone inlay',
      'Four minarets slightly tilted outwards for seismic safety',
      'Symmetrical Charbagh Persian garden layout',
      'Central onion dome rising 73 metres'
    ],
    acousticFeatures: 'The central dome reverberates sound for nearly 28 seconds, designed to hold echoes of verses.',
    structuralSensors: {
      crackExpansionRate: '0.04 mm/yr (North-East Minaret)',
      moistureIndex: 'Moderate (Riverbed Sub-base)',
      vibrationVulnerability: 'High (Heavy Tourist Footfall)'
    },
    alternativeSites: [
      {
        id: 'mehtab-bagh',
        name: 'Mehtab Bagh (Moonlight Garden)',
        location: 'Agra, UP (Opposite Yamuna Bank)',
        distanceKm: 4.2,
        pressureScore: 24,
        whyVisit: 'Direct unhindered panoramic view of Taj Mahal across the river without crowd surges or security bottlenecks.',
        imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'fatehpur-sikri',
        name: 'Fatehpur Sikri Royal Complex',
        location: 'Fatehpur Sikri, UP',
        distanceKm: 36.0,
        pressureScore: 48,
        whyVisit: 'Akbar’s grand sandstone capital featuring the towering Buland Darwaza and Panch Mahal.',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'
      }
    ],
    hourlyFootfall: [
      { hour: '06:00', count: 1200, isPeak: false, pressurePercentage: 20 },
      { hour: '08:00', count: 3400, isPeak: false, pressurePercentage: 45 },
      { hour: '10:00', count: 7100, isPeak: true, pressurePercentage: 88 },
      { hour: '12:00', count: 8900, isPeak: true, pressurePercentage: 98 },
      { hour: '14:00', count: 8200, isPeak: true, pressurePercentage: 92 },
      { hour: '16:00', count: 9800, isPeak: true, pressurePercentage: 100 },
      { hour: '18:00', count: 4200, isPeak: false, pressurePercentage: 55 }
    ]
  },
  {
    id: 'hampi-monuments',
    name: 'Hampi (Vijayanagara Ruins)',
    hindiName: 'हम्पी (विजयनगर)',
    tagline: 'The surreal boulder-strewn capital of the historic Vijayanagara Empire',
    city: 'Vijayanagara',
    state: 'Karnataka',
    lat: 15.3350,
    lng: 76.4600,
    category: 'Temples',
    timePeriod: '1336–1565 CE',
    architecturalStyle: 'Dravidian Architecture',
    isUnesco: true,
    rating: 4.7,
    reviewsCount: '1.9K reviews',
    imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f445b23e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600100397608-f010f445b23e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80'
    ],
    heritagePressureScore: 78,
    damageScore: 58,
    crowdLevel: 'High',
    liveFootfall: 18400,
    maxCapacity: 15000,
    bestVisitingWindow: {
      start: '06:30 AM',
      end: '09:30 AM',
      reason: 'Cool morning breeze over Matanga Hill and unobstructed photography of the Stone Chariot.',
      hindiReason: 'मतंग पहाड़ी पर सुबह की ठंडी हवा और बिना भीड़ के रथ मंदिर के दर्शन।'
    },
    openingHours: '06:00 AM - 06:00 PM',
    entryFee: { indian: 40, foreigner: 600 },
    deteriorationStatus: 'Moderate Concern',
    description: 'A UNESCO World Heritage Site located in east-central Karnataka. Hampi was the capital of the Vijayanagara Empire in the 14th century, described by European travellers as prosperous and grand.',
    hindiDescription: 'कर्नाटक के बेल्लारी जिले में स्थित विजयनगर साम्राज्य की ऐतिहासिक राजधानी। तुंगभद्रा नदी के किनारे फैला यह क्षेत्र 1600 से अधिक स्मारकों का घर है।',
    historicalSignificance: 'Spread over 4,100 hectares, Hampi encompasses more than 1,600 surviving remains of the last great Hindu kingdom in South India.',
    architectureHighlights: [
      'Monolithic Stone Chariot dedicated to Garuda inside the Vittala Temple',
      '56 Musical Pillars (SaReGaMa pillars) tuned to Indian swaras',
      'Virupaksha Temple with an inverted pinhole camera shadow effect',
      'Lotus Mahal and Elephant Stables demonstrating Indo-Islamic confluence'
    ],
    acousticFeatures: 'The Vittala Temple musical pillars emit resonant acoustic notes when tapped gently.',
    structuralSensors: {
      crackExpansionRate: '0.02 mm/yr (Stone Chariot axle)',
      moistureIndex: 'Low (Semi-arid granite terrain)',
      vibrationVulnerability: 'Critical (Acoustic pillars wear)'
    },
    alternativeSites: [
      {
        id: 'badami-caves',
        name: 'Badami Cave Temples & Aihole',
        location: 'Bagalkot, Karnataka',
        distanceKm: 138.0,
        pressureScore: 32,
        whyVisit: 'Rock-cut sandstone marvels and the cradle of early temple architecture by the Chalukyas.',
        imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80'
      }
    ],
    hourlyFootfall: [
      { hour: '06:00', count: 600, isPeak: false, pressurePercentage: 15 },
      { hour: '08:00', count: 1800, isPeak: false, pressurePercentage: 35 },
      { hour: '10:00', count: 3900, isPeak: true, pressurePercentage: 75 },
      { hour: '12:00', count: 4800, isPeak: true, pressurePercentage: 88 },
      { hour: '14:00', count: 4200, isPeak: true, pressurePercentage: 80 },
      { hour: '16:00', count: 3100, isPeak: false, pressurePercentage: 60 }
    ]
  },
  {
    id: 'qutub-minar',
    name: 'Qutub Minar',
    hindiName: 'क़ुतुब मीनार',
    tagline: 'The tallest brick minaret in the world standing tall for over eight centuries',
    city: 'New Delhi',
    state: 'Delhi',
    lat: 28.5245,
    lng: 77.1855,
    category: 'UNESCO Sites',
    timePeriod: '1192–1220 CE',
    architecturalStyle: 'Indo-Islamic Architecture',
    isUnesco: true,
    rating: 4.6,
    reviewsCount: '1.6K reviews',
    imageUrl: 'https://images.unsplash.com/photo-1545126178-8628045585b4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545126178-8628045585b4?auto=format&fit=crop&w=800&q=80'
    ],
    heritagePressureScore: 72,
    damageScore: 42,
    crowdLevel: 'Moderate',
    liveFootfall: 14200,
    maxCapacity: 16000,
    bestVisitingWindow: {
      start: '07:00 AM',
      end: '09:00 AM',
      reason: 'Crisp morning air and gentle sun illumination on the fluted sandstone bands.',
      hindiReason: 'सुबह 7 से 9 बजे के बीच कम प्रदूषण और शांत वातावरण में मीनार का अवलोकन।'
    },
    openingHours: '07:00 AM - 05:00 PM',
    entryFee: { indian: 40, foreigner: 600 },
    deteriorationStatus: 'Good',
    description: 'A 72.5-metre tall fluted red sandstone tower, surrounded by ancient ruins including the 4th-century rust-resistant Iron Pillar of Chandragupta II.',
    hindiDescription: '72.5 मीटर ऊंची लाल बलुआ पत्थर की भव्य मीनार, जिसके परिसर में प्रसिद्ध जंग-रोधी गुप्तकालीन लौह स्तंभ स्थित है।',
    historicalSignificance: 'Started by Qutb-ud-din Aibak and completed by Iltutmish; one of the earliest examples of Indo-Islamic architectural synthesis.',
    architectureHighlights: [
      'Five distinct storeys each marked by a projecting balcony',
      'Intricate Quranic inscriptions and floral motifs in Nagari and Arabic scripts',
      'Corbelled arches of the adjacent Quwwat-ul-Islam Mosque',
      '1,600-year-old metallurgically pure Iron Pillar'
    ],
    alternativeSites: [
      {
        id: 'hauz-khas-complex',
        name: 'Hauz Khas Complex & Feroz Shah Tomb',
        location: 'South Delhi',
        distanceKm: 5.5,
        pressureScore: 28,
        whyVisit: 'Serene reservoir, 14th-century madrasa pavilions, and peaceful medieval park setting.',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'
      }
    ],
    hourlyFootfall: [
      { hour: '07:00', count: 400, isPeak: false, pressurePercentage: 10 },
      { hour: '10:00', count: 2600, isPeak: false, pressurePercentage: 50 },
      { hour: '12:00', count: 3800, isPeak: true, pressurePercentage: 75 },
      { hour: '15:00', count: 4200, isPeak: true, pressurePercentage: 85 }
    ]
  },
  {
    id: 'konark-sun-temple',
    name: 'Konark Sun Temple',
    hindiName: 'कोणार्क सूर्य मंदिर',
    tagline: 'The magnificent stone chariot of the Sun God rising on the Bay of Bengal',
    city: 'Puri',
    state: 'Odisha',
    lat: 19.8876,
    lng: 86.0945,
    category: 'Temples',
    timePeriod: '1250 CE (Eastern Ganga Dynasty)',
    architecturalStyle: 'Kalinga Architecture',
    isUnesco: true,
    rating: 4.6,
    reviewsCount: '1.3K reviews',
    imageUrl: 'https://images.unsplash.com/photo-1599818816824-747201c10712?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599818816824-747201c10712?auto=format&fit=crop&w=800&q=80'
    ],
    heritagePressureScore: 82,
    damageScore: 71,
    crowdLevel: 'High',
    liveFootfall: 16500,
    maxCapacity: 12000,
    bestVisitingWindow: {
      start: '06:00 AM',
      end: '08:30 AM',
      reason: 'First rays of the sun strike the grand sanctum just as envisioned by King Narasimhadeva I.',
      hindiReason: 'समुद्र तट से सूर्योदय की पहली किरणें जब पहियों पर पड़ती हैं, तब का नजारा अद्वितीय होता है।'
    },
    openingHours: '06:00 AM - 08:00 PM',
    entryFee: { indian: 40, foreigner: 600 },
    deteriorationStatus: 'Severe Deterioration',
    description: 'Conceived as a colossal chariot of the Sun God Surya, with 24 intricately carved wheels drawn by seven horses, crafted from Khondalite and Chlorite stone.',
    hindiDescription: 'सूर्य भगवान का महाकाय पाषाण रथ, जिसमें 24 अलंकृत पहिए और सात अश्व तराशे गए हैं। खोंडालाइट पत्थरों से निर्मित यह कलिंग वास्तुकला का शिखर है।',
    historicalSignificance: 'Built in the 13th century, famous for its sundial wheels that calculate time accurate to minutes, and monumental erotic and celestial sculptures.',
    architectureHighlights: [
      '24 Sun Dial wheels acting as astronomical timekeepers',
      'Chlorite stone deity statues aligned to solstice dawn angles',
      'Natamandira (Dance Hall) with 128 classical Odissi dance mudras carved on pillars',
      'Massive iron beams supporting interlocking stone masonry'
    ],
    structuralSensors: {
      crackExpansionRate: '0.07 mm/yr (Salt crystallisation in Khondalite)',
      moistureIndex: 'High (Coastal Saline Humidity)',
      vibrationVulnerability: 'Critical (High conservation focus)'
    },
    alternativeSites: [
      {
        id: 'biranchi-narayan',
        name: 'Biranchinarayan Sun Temple (Buguda)',
        location: 'Ganjam, Odisha',
        distanceKm: 160.0,
        pressureScore: 16,
        whyVisit: 'Known as the Wooden Konark, filled with exquisite wood carvings of Ramayana legends.',
        imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80'
      }
    ],
    hourlyFootfall: [
      { hour: '06:00', count: 800, isPeak: false, pressurePercentage: 20 },
      { hour: '09:00', count: 3200, isPeak: false, pressurePercentage: 65 },
      { hour: '12:00', count: 4900, isPeak: true, pressurePercentage: 95 },
      { hour: '15:00', count: 5200, isPeak: true, pressurePercentage: 100 }
    ]
  },
  {
    id: 'ajanta-caves',
    name: 'Ajanta Caves',
    hindiName: 'अजंता की गुफाएं',
    tagline: 'Ancient rock-cut Buddhist sanctuaries preserved with timeless mural masterpieces',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    lat: 20.5519,
    lng: 75.7033,
    category: 'Caves & Rock Cut',
    timePeriod: '2nd century BCE – 480 CE',
    architecturalStyle: 'Buddhist Heritage',
    isUnesco: true,
    rating: 4.5,
    reviewsCount: '1.2K reviews',
    imageUrl: 'https://images.unsplash.com/photo-1591522810850-58128c5fb089?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1591522810850-58128c5fb089?auto=format&fit=crop&w=800&q=80'
    ],
    heritagePressureScore: 79,
    damageScore: 72,
    crowdLevel: 'High',
    liveFootfall: 11200,
    maxCapacity: 9000,
    bestVisitingWindow: {
      start: '09:00 AM',
      end: '11:00 AM',
      reason: 'Cave micro-climate humidity is lowest early in the session, reducing vapor deposition on delicate murals.',
      hindiReason: 'सुबह के समय गुफाओं के भीतर आर्द्रता कम रहती है जिससे भित्ति चित्रों को नुकसान नहीं पहुँचता।'
    },
    openingHours: '09:00 AM - 05:00 PM (Closed on Mondays)',
    entryFee: { indian: 40, foreigner: 600 },
    deteriorationStatus: 'Critical Restoration Required',
    description: '30 rock-cut Buddhist cave monuments carved into a horseshoe cliff along the Waghur River, famous for expressive fresco paintings and sculpted chaityas.',
    hindiDescription: 'वाघूर नदी की घाटी में घोड़े की नाल के आकार की चट्टानों को काटकर बनाई गई 30 बौद्ध गुफाएं, जो जातक कथाओं के भित्तिचित्रों के लिए विश्वप्रसिद्ध हैं।',
    historicalSignificance: 'Pinnacle of ancient Indian painting and expressive rock-cut architecture depicting the lives of Buddha and Jataka tales.',
    architectureHighlights: [
      'Cave 1 Bodhisattva Padmapani and Vajrapani tempera frescoes',
      'Cave 19 Chaitya hall with ribbed stone barrel vault',
      'Cave 26 colossal 7-metre reclining Mahaparinirvana Buddha statue',
      'Natural mineral pigments (lapislazuli, ochre, malachite) lasting 2000 years'
    ],
    structuralSensors: {
      crackExpansionRate: '0.01 mm/yr (Basalt cleavage joints)',
      moistureIndex: 'Critical (Microbial fungal growth risk)',
      vibrationVulnerability: 'High (Strict acoustic limits inside caves)'
    },
    alternativeSites: [
      {
        id: 'pitalkhora-caves',
        name: 'Pitalkhora Buddhist Caves',
        location: 'Kannad, Maharashtra',
        distanceKm: 85.0,
        pressureScore: 18,
        whyVisit: 'Among the earliest Hinayana rock-cut sanctuaries in Western Ghats, virtually untouched by massive crowds.',
        imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80'
      }
    ],
    hourlyFootfall: [
      { hour: '09:00', count: 800, isPeak: false, pressurePercentage: 30 },
      { hour: '11:00', count: 2800, isPeak: true, pressurePercentage: 85 },
      { hour: '13:00', count: 3600, isPeak: true, pressurePercentage: 98 },
      { hour: '15:00', count: 3200, isPeak: true, pressurePercentage: 90 }
    ]
  },
  {
    id: 'mehrangarh-fort',
    name: 'Mehrangarh Fort',
    hindiName: 'मेहरानगढ़ दुर्ग',
    tagline: 'The invincible citadel of the Sun perched 400 feet above the Blue City',
    city: 'Jodhpur',
    state: 'Rajasthan',
    lat: 26.2978,
    lng: 73.0185,
    category: 'Forts & Palaces',
    timePeriod: '1459 CE (Rathore Dynasty)',
    architecturalStyle: 'Rajput Architecture',
    isUnesco: false,
    rating: 4.6,
    reviewsCount: '1.4K reviews',
    imageUrl: 'https://images.unsplash.com/photo-1588096344356-9b4009f4460f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1588096344356-9b4009f4460f?auto=format&fit=crop&w=800&q=80'
    ],
    heritagePressureScore: 65,
    damageScore: 36,
    crowdLevel: 'Moderate',
    liveFootfall: 9800,
    maxCapacity: 12000,
    bestVisitingWindow: {
      start: '09:00 AM',
      end: '11:30 AM',
      reason: 'Pleasant museum walk and panoramic views of the blue houses before afternoon desert heat.',
      hindiReason: 'दोपहर की गर्मी से पहले जोधपुर के नीले शहर का मनमोहक विहंगम दृश्य।'
    },
    openingHours: '09:00 AM - 05:00 PM',
    entryFee: { indian: 100, foreigner: 600 },
    deteriorationStatus: 'Good',
    description: 'One of the largest forts in India, built around 1459 by Rao Jodha. The fort is situated 410 feet (125 m) above the city and is enclosed by imposing thick walls.',
    hindiDescription: '1459 में राव जोधा द्वारा निर्मित भारत के विशालतम किलों में से एक। 125 मीटर ऊंची पहाड़ी पर स्थित यह दुर्ग अपनी भव्यता के लिए प्रसिद्ध है।',
    historicalSignificance: 'Preserved under the Mehrangarh Museum Trust, regarded as one of the best-maintained living fort museums in South Asia.',
    architectureHighlights: [
      'Sheesh Mahal (Palace of Mirrors) with fine gold-leaf glasswork',
      'Phool Mahal (Flower Palace) with ceiling frescoes depicting Ragas',
      'Cannon ramparts hosting historic cannons including Kilkila and Shambhuban',
      'Seven historic entry gates including Jai Pol and Fateh Pol'
    ],
    alternativeSites: [
      {
        id: 'khimsar-fort',
        name: 'Khimsar Fort & Sand Dunes',
        location: 'Khimsar, Rajasthan',
        distanceKm: 85.0,
        pressureScore: 22,
        whyVisit: 'Tranquil 16th-century fortress on the edge of the Thar desert with minimal footfall.',
        imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80'
      }
    ],
    hourlyFootfall: [
      { hour: '09:00', count: 700, isPeak: false, pressurePercentage: 25 },
      { hour: '11:00', count: 2400, isPeak: false, pressurePercentage: 60 },
      { hour: '13:00', count: 3200, isPeak: true, pressurePercentage: 80 },
      { hour: '15:00', count: 2700, isPeak: false, pressurePercentage: 70 }
    ]
  },
  {
    id: 'brihadisvara-temple',
    name: 'Brihadisvara Temple (Big Temple)',
    hindiName: 'बृहदेश्वर मन्दिर (तंजावुर)',
    tagline: 'The magnificent Chola granite marvel with an 80-tonne monolithic cupola',
    city: 'Thanjavur',
    state: 'Tamil Nadu',
    lat: 10.7828,
    lng: 79.1318,
    category: 'Temples',
    timePeriod: '1010 CE (Raja Raja Chola I)',
    architecturalStyle: 'Dravidian Architecture',
    isUnesco: true,
    rating: 4.9,
    reviewsCount: '2.1K reviews',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'
    ],
    heritagePressureScore: 54,
    damageScore: 29,
    crowdLevel: 'Moderate',
    liveFootfall: 8600,
    maxCapacity: 14000,
    bestVisitingWindow: {
      start: '06:00 AM',
      end: '08:30 AM',
      reason: 'Morning puja chanting and golden sunlight illuminating the 216-foot vimana tower.',
      hindiReason: 'सुबह की दिव्य महाआरती और 216 फीट ऊंचे विमान पर पड़ती स्वर्णिम धूप।'
    },
    openingHours: '06:00 AM - 12:30 PM, 04:00 PM - 08:30 PM',
    entryFee: { indian: 0, foreigner: 0 },
    deteriorationStatus: 'Good',
    description: 'Dedicated to Lord Shiva, built entirely of granite without binding mortar. Part of the UNESCO "Great Living Chola Temples".',
    hindiDescription: 'राजा राज चोल प्रथम द्वारा 1010 ईस्वी में बनवाया गया ग्रेनाइट का विशाल मंदिर। यूनेस्को विश्व धरोहर स्थल का गौरव।',
    historicalSignificance: 'A triumph of structural engineering where the apex Kumbam (80 tonnes) was moved via a 6 km earthen ramp.',
    architectureHighlights: [
      '66-metre tall Vimana among the tallest in the ancient world',
      'Monolithic 20-tonne Nandi bull carved from a single granite block',
      'Chola-period Tamil and Sanskrit epigraphs wrapping the plinth',
      'Original 11th-century fresco murals beneath Nayaka layer'
    ],
    alternativeSites: [
      {
        id: 'airavatesvara-temple',
        name: 'Airavatesvara Temple (Darasuram)',
        location: 'Kumbakonam, Tamil Nadu',
        distanceKm: 38.0,
        pressureScore: 19,
        whyVisit: 'Exquisite musical stone steps and miniature filigree carvings with serene, uncrowded courtyard.',
        imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80'
      }
    ],
    hourlyFootfall: [
      { hour: '06:00', count: 900, isPeak: false, pressurePercentage: 20 },
      { hour: '09:00', count: 2100, isPeak: false, pressurePercentage: 45 },
      { hour: '17:00', count: 3800, isPeak: true, pressurePercentage: 80 }
    ]
  },
  {
    id: 'khajuraho-monuments',
    name: 'Khajuraho Group of Monuments',
    hindiName: 'खजुराहो स्मारक समूह',
    tagline: 'Celebration of sublime sculpture, philosophy, and Nagara temple elegance',
    city: 'Chhatarpur',
    state: 'Madhya Pradesh',
    lat: 24.8318,
    lng: 79.9199,
    category: 'Temples',
    timePeriod: '950–1050 CE (Chandela Dynasty)',
    architecturalStyle: 'Nagara Architecture',
    isUnesco: true,
    rating: 4.7,
    reviewsCount: '1.5K reviews',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80'
    ],
    heritagePressureScore: 59,
    damageScore: 45,
    crowdLevel: 'Low',
    liveFootfall: 5200,
    maxCapacity: 10000,
    bestVisitingWindow: {
      start: '07:00 AM',
      end: '10:00 AM',
      reason: 'Low ambient humidity and sharp horizontal lighting detailing the fine relief friezes.',
      hindiReason: 'सुबह की सीधी धूप में कंदारिया महादेव मंदिर की मूर्तिकला का अद्भुत सौन्दर्य।'
    },
    openingHours: 'Sunrise to Sunset',
    entryFee: { indian: 40, foreigner: 600 },
    deteriorationStatus: 'Moderate Concern',
    description: 'A group of Hindu and Jain temples in Madhya Pradesh, renowned for their Nagara-style architectural symbolism and erotic sculptures.',
    hindiDescription: 'चंदेल राजाओं द्वारा 10वीं-11वीं शताब्दी में निर्मित नागर शैली के भव्य हिन्दू एवं जैन मंदिर समूह।',
    historicalSignificance: 'Out of 85 original temples, 25 survive today across Western, Eastern and Southern complexes.',
    architectureHighlights: [
      'Kandariya Mahadeva temple with 84 miniature shikhara spires',
      'Lakshmana temple with Vaikuntha Vishnu idol brought from Kashmir',
      'Sandstone mortise-and-tenon joints engineered without cement',
      'Relief panels depicting dance, daily life, warriors, and philosophy'
    ],
    alternativeSites: [
      {
        id: 'orchha-complex',
        name: 'Orchha Fort & Chhatris Complex',
        location: 'Orchha, MP',
        distanceKm: 170.0,
        pressureScore: 26,
        whyVisit: 'Magnificent riverside cenotaphs and Bundela palaces overlooking the pristine Betwa river.',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'
      }
    ],
    hourlyFootfall: [
      { hour: '07:00', count: 300, isPeak: false, pressurePercentage: 15 },
      { hour: '10:00', count: 1400, isPeak: false, pressurePercentage: 45 },
      { hour: '14:00', count: 1900, isPeak: true, pressurePercentage: 65 }
    ]
  }
];
