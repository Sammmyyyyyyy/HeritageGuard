import { BackendSite } from '../api/sites';
import { API_BASE_URL } from '../api/config';
import { Monument, MonumentCategory, CrowdLevel, DeteriorationStatus } from '../types/heritage';
import { MONUMENT_FALLBACKS } from '../assets/monumentImages';

// =====================================================
// IMAGE PATH REGISTRY FOR BACKEND SITES
// =====================================================
export const SITE_IMAGE_PATHS: Record<string, string> = {
  DEL001: '/images/red_fort.jpg',
  DEL002: '/images/qutub_minar.jpg',
  DEL003: '/images/india_gate.jpg',
  DEL004: '/images/humayun_tomb.jpg',
  DEL005: '/images/Lotus_temple.jpg',

  JAI001: '/images/amer_fort.jpg',
  JAI002: '/images/Hawa_mahal.jpg',
  JAI003: '/images/city_palace.jpg',
  JAI004: '/images/jantar_mantar.jpg',
  JAI005: '/images/albert_hall.jpg',

  BOM001: '/images/gate_way_of_india.jpg',
  BOM002: '/images/elephanta_caves.jpg',
  BOM003: '/images/chatrapati_shivaji_maharaj_terminus.jpg',
  BOM004: '/images/Haj_ali_dargaah.jpg',
  BOM005: '/images/sidhivinayak_temple.jpg',

  PRA001: '/images/Triveni_sangam.jpg',
  PRA002: '/images/allahabad_fort.jpg',
  PRA003: '/images/Khusro_bagh.jpg',
  PRA004: '/images/Anand_bhavan.jpg',
  PRA005: '/images/ChandraShekhar_azad_park.jpg',
};

// =====================================================
// ROBUST IMAGE URL RESOLVER
// =====================================================
export const resolveImageUrl = (
  imagePath?: string | null,
  siteId?: string
): string => {
  if (imagePath && imagePath.trim().length > 0) {
    const clean = imagePath.trim();
    if (
      clean.startsWith('http://') ||
      clean.startsWith('https://') ||
      clean.startsWith('data:')
    ) {
      return clean;
    }
    if (clean.startsWith('/images/')) {
      return clean;
    }
    return `${API_BASE_URL.replace(/\/+$/, '')}/${clean.replace(/^\/+/, '')}`;
  }

  if (siteId && SITE_IMAGE_PATHS[siteId]) {
    return SITE_IMAGE_PATHS[siteId];
  }

  if (siteId && MONUMENT_FALLBACKS[siteId]) {
    return MONUMENT_FALLBACKS[siteId];
  }

  return '/images/heritage-placeholder.jpg';
};

// =====================================================
// CURATED KNOWLEDGE BASE FOR 20 BACKEND SITES
// =====================================================
interface SiteCuratedData {
  hindiName: string;
  tagline: string;
  category: MonumentCategory;
  timePeriod: string;
  architecturalStyle: string;
  isUnesco: boolean;
  rating: number;
  reviewsCount: string;
  heritagePressureScore: number;
  damageScore: number;
  crowdLevel: CrowdLevel;
  liveFootfall: number;
  maxCapacity: number;
  bestVisitingWindow: {
    start: string;
    end: string;
    reason: string;
    hindiReason: string;
  };
  openingHours: string;
  entryFee: {
    indian: number;
    foreigner: number;
  };
  deteriorationStatus: DeteriorationStatus;
  description: string;
  hindiDescription: string;
  historicalSignificance: string;
  architectureHighlights: string[];
  acousticFeatures?: string;
}

export const SITE_METADATA: Record<string, SiteCuratedData> = {
  DEL001: {
    hindiName: 'लाल किला',
    tagline: 'Historic Mughal fortress of red sandstone, symbol of Indian independence',
    category: 'Forts & Palaces',
    timePeriod: '1638–1648 CE (Mughal Era)',
    architecturalStyle: 'Mughal Architecture',
    isUnesco: true,
    rating: 4.6,
    reviewsCount: '3.1K reviews',
    heritagePressureScore: 78,
    damageScore: 42,
    crowdLevel: 'High',
    liveFootfall: 18500,
    maxCapacity: 25000,
    bestVisitingWindow: {
      start: '09:00 AM',
      end: '11:30 AM',
      reason: 'Morning hours offer lower heat and shorter security queues.',
      hindiReason: 'सुबह के समय गर्मी कम होती है और सुरक्षा जांच में कम समय लगता है।'
    },
    openingHours: '09:30 AM - 04:30 PM (Closed on Mondays)',
    entryFee: { indian: 35, foreigner: 500 },
    deteriorationStatus: 'Moderate Concern',
    description: 'The Red Fort is a historic fort in Old Delhi that served as the main residence of the Mughal Emperors for nearly 200 years.',
    hindiDescription: 'लाल किला पुरानी दिल्ली का एक ऐतिहासिक किला है जो लगभग 200 वर्षों तक मुगल सम्राटों का मुख्य निवास रहा।',
    historicalSignificance: 'Designated a UNESCO World Heritage Site in 2007, representing the zenith of Mughal architectural creativity under Emperor Shah Jahan.',
    architectureHighlights: [
      'Massive 2.41 km red sandstone defensive octagonal walls',
      'Lahori and Delhi Gates with ornamental domed pavilions (chattris)',
      'Diwan-i-Aam (Hall of Public Audience) with carved marble baldachin',
      'Diwan-i-Khas featuring inlaid Pietra Dura pietra floral motifs'
    ]
  },

  DEL002: {
    hindiName: 'कुतुब मीनार',
    tagline: 'World’s tallest brick minaret and masterpiece of early Indo-Islamic art',
    category: 'UNESCO Sites',
    timePeriod: '1192–1220 CE',
    architecturalStyle: 'Indo-Islamic Architecture',
    isUnesco: true,
    rating: 4.7,
    reviewsCount: '2.8K reviews',
    heritagePressureScore: 65,
    damageScore: 35,
    crowdLevel: 'Moderate',
    liveFootfall: 14200,
    maxCapacity: 20000,
    bestVisitingWindow: {
      start: '07:00 AM',
      end: '09:30 AM',
      reason: 'Early morning light illuminates the intricate fluted calligraphic sandstone bands.',
      hindiReason: 'सुबह की धूप में मीनार की नक्काशी और सुलेख सबसे सुंदर दिखते हैं।'
    },
    openingHours: '07:00 AM - 08:00 PM (Open all days)',
    entryFee: { indian: 35, foreigner: 550 },
    deteriorationStatus: 'Good',
    description: 'A 72.5-metre tapering tower of five storeys, built with red sandstone and marble, surrounded by ancient monumental ruins.',
    hindiDescription: '72.5 मीटर ऊंची पांच मंजिला मीनार, जो लाल बलुआ पत्थर और संगमरमर से बनी है, और प्राचीन खंडहरों से घिरी है।',
    historicalSignificance: 'UNESCO World Heritage Site inscribed in 1993, housing the famous 1,600-year-old rust-resistant Iron Pillar of Chandragupta II.',
    architectureHighlights: [
      '72.5m tapering minaret with 379 spiral staircase steps',
      'Alternating angular and rounded flutings with Arabic epigraphy',
      'Ancient 4th-century metallurgical marvel: Rustless Iron Pillar',
      'Quwwat-ul-Islam Mosque complex and Alai Darwaza gateway'
    ]
  },

  DEL003: {
    hindiName: 'इंडिया गेट',
    tagline: 'Triumphal arch war memorial dedicated to 84,000 soldiers of the British Indian Army',
    category: 'Other Heritage',
    timePeriod: '1921–1931 CE (Designed by Sir Edwin Lutyens)',
    architecturalStyle: 'Edwardian Classical Arch',
    isUnesco: false,
    rating: 4.7,
    reviewsCount: '4.2K reviews',
    heritagePressureScore: 82,
    damageScore: 28,
    crowdLevel: 'High',
    liveFootfall: 32000,
    maxCapacity: 40000,
    bestVisitingWindow: {
      start: '05:30 PM',
      end: '08:30 PM',
      reason: 'Evening illumination and ambient breezes across the Kartavya Path lawns.',
      hindiReason: 'शाम के समय भव्य रोशनी और कर्तव्य पथ की खुली हवा का आनंद लें।'
    },
    openingHours: 'Open 24 Hours (Illumination 7 PM - 11 PM)',
    entryFee: { indian: 0, foreigner: 0 },
    deteriorationStatus: 'Good',
    description: 'Standing at the center of New Delhi, India Gate is a 42-metre tall triumphal arch war memorial commemorating Indian soldiers who died in World War I.',
    hindiDescription: 'नई दिल्ली के केंद्र में स्थित, इंडिया गेट 42 मीटर ऊंचा युद्ध स्मारक है जो प्रथम विश्व युद्ध में शहीद भारतीय सैनिकों को समर्पित है।',
    historicalSignificance: 'National landmark bearing inscribed names of over 13,000 soldiers and housing the eternal flame Amar Jawan Jyoti.',
    architectureHighlights: [
      '42-metre triumphal arch constructed of pale red and yellow Bharatpur granite',
      'Inscribed with 13,300 servicemen names',
      'Central canopy and reflective fountains along Kartavya Path',
      'Grand architectural alignment with Rashtrapati Bhavan'
    ]
  },

  DEL004: {
    hindiName: 'हुमायूँ का मकबरा',
    tagline: 'First garden-tomb on the Indian subcontinent and inspiration for the Taj Mahal',
    category: 'Tombs & Mausoleums',
    timePeriod: '1565–1572 CE (Empress Bega Begum)',
    architecturalStyle: 'Mughal Persian Charbagh Architecture',
    isUnesco: true,
    rating: 4.8,
    reviewsCount: '2.4K reviews',
    heritagePressureScore: 54,
    damageScore: 30,
    crowdLevel: 'Moderate',
    liveFootfall: 9500,
    maxCapacity: 16000,
    bestVisitingWindow: {
      start: '08:00 AM',
      end: '10:30 AM',
      reason: 'Serene ambience and golden reflection across the four-quadrant waterways.',
      hindiReason: 'चारबाग नहरों में लाल बलुआ पत्थर के गुंबद का शांत और मनमोहक दृश्य।'
    },
    openingHours: '06:00 AM - 06:00 PM (Sunrise to Sunset)',
    entryFee: { indian: 35, foreigner: 550 },
    deteriorationStatus: 'Good',
    description: 'Humayun’s Tomb is the tomb of the Mughal Emperor Humayun, commissioned by his chief consort Bega Begum and designed by Persian architect Mirak Mirza Ghiyas.',
    hindiDescription: 'हुमायूँ का मकबरा मुगल सम्राट हुमायूँ की समाधि है, जिसे बेगा बेगम द्वारा बनवाया गया और ईरानी वास्तुकार द्वारा डिजाइन किया गया।',
    historicalSignificance: 'Inscribed as a UNESCO World Heritage Site in 1993, representing the earliest synthesis of Persian and Indian architectural traditions.',
    architectureHighlights: [
      'First grand scale Charbagh (four-quadrant Paradise garden) layout in India',
      'Double dome of pure white marble rising 42.5 metres',
      'Intricate red sandstone lattice jali screens and arched alcoves',
      'Complex housing Barber’s Tomb, Isa Khan’s Tomb and Arab Serai'
    ]
  },

  DEL005: {
    hindiName: 'लोटस टेम्पल (कमल मंदिर)',
    tagline: 'Expressionist Baháʼí sanctuary shaped like a blooming white lotus flower',
    category: 'Temples',
    timePeriod: '1986 CE (Architect Fariborz Sahba)',
    architecturalStyle: 'Expressionist Modern Sacred Architecture',
    isUnesco: false,
    rating: 4.6,
    reviewsCount: '3.6K reviews',
    heritagePressureScore: 72,
    damageScore: 22,
    crowdLevel: 'High',
    liveFootfall: 22000,
    maxCapacity: 30000,
    bestVisitingWindow: {
      start: '09:00 AM',
      end: '11:00 AM',
      reason: 'Morning tranquility and crystal reflection in the 9 surrounding blue water pools.',
      hindiReason: 'सुबह की शांति और 9 जलकुंडों में संगमरमरी पंखुड़ियों का अनुपम सौंदर्य।'
    },
    openingHours: '08:30 AM - 05:00 PM (Closed on Mondays)',
    entryFee: { indian: 0, foreigner: 0 },
    deteriorationStatus: 'Good',
    description: 'The Lotus Temple is a Baháʼí House of Worship notable for its flowerlike shape. It is open to all, regardless of religion or any other qualification.',
    hindiDescription: 'लोटस टेम्पल एक बहाई उपासना मंदिर है जो अपने कमल के फूल जैसे आकार के लिए प्रसिद्ध है और सभी धर्मों के लोगों के लिए खुला है।',
    historicalSignificance: 'One of the most visited buildings in the world, having received over 100 million visitors since dedication.',
    architectureHighlights: [
      '27 free-standing marble petals arranged in clusters of three to form nine doors',
      'Pure Greek Penteli white marble exterior cladding',
      'Nine ponds representing green lotus leaves floating on water',
      'Naturally ventilated acoustic central hall holding 2,500 people'
    ]
  },

  JAI001: {
    hindiName: 'आमेर दुर्ग (किला)',
    tagline: 'Majestic hilltop Rajput citadel featuring the glittering Sheesh Mahal',
    category: 'Forts & Palaces',
    timePeriod: '1592 CE (Raja Man Singh I)',
    architecturalStyle: 'Rajput & Mughal Architecture',
    isUnesco: true,
    rating: 4.8,
    reviewsCount: '3.8K reviews',
    heritagePressureScore: 86,
    damageScore: 48,
    crowdLevel: 'Overcrowded',
    liveFootfall: 24000,
    maxCapacity: 22000,
    bestVisitingWindow: {
      start: '08:00 AM',
      end: '10:30 AM',
      reason: 'Avoid the harsh desert midday sun and witness the morning reflection on Maota Lake.',
      hindiReason: 'मावठा झील पर किले का सुंदर दृश्य देखने और धूप से बचने के लिए सुबह जाएं।'
    },
    openingHours: '08:00 AM - 05:30 PM & 06:30 PM - 09:15 PM (Night Tour)',
    entryFee: { indian: 100, foreigner: 500 },
    deteriorationStatus: 'Moderate Concern',
    description: 'Amer Fort is known for its artistic Hindu style elements. Located high on a hill overlooking Maota Lake, it features sweeping courtyards and intricate palaces.',
    hindiDescription: 'आमेर किला अपनी कलात्मक राजपूत शैली के लिए प्रसिद्ध है। पहाड़ी पर स्थित यह किला मावठा झील के किनारे अपनी भव्यता बिखेरता है।',
    historicalSignificance: 'Inscribed in 2013 as part of the Hill Forts of Rajasthan UNESCO World Heritage Site.',
    architectureHighlights: [
      'Sheesh Mahal (Mirror Palace) inlaid with convex Belgian glass foils',
      'Ganesh Pol gateway with delicate frescoes and lattice jharokhas',
      'Diwan-e-Khas and Sukh Niwas with natural water-cooled breeze channels',
      'Underground secret tunnel connecting to the formidable Jaigarh Fort'
    ]
  },

  JAI002: {
    hindiName: 'हवा महल',
    tagline: 'Iconic Palace of Winds featuring 953 intricately carved pink sandstone jharokhas',
    category: 'Forts & Palaces',
    timePeriod: '1799 CE (Maharaja Sawai Pratap Singh)',
    architecturalStyle: 'Rajput Architecture',
    isUnesco: false,
    rating: 4.6,
    reviewsCount: '4.1K reviews',
    heritagePressureScore: 89,
    damageScore: 45,
    crowdLevel: 'High',
    liveFootfall: 21000,
    maxCapacity: 18000,
    bestVisitingWindow: {
      start: '08:30 AM',
      end: '10:30 AM',
      reason: 'Morning sun rays illuminate the red and pink honeycomb facade directly.',
      hindiReason: 'सुबह का सूर्य गुलाबी बलुआ पत्थर के झरोखों को सुनहरी चमक प्रदान करता है।'
    },
    openingHours: '09:00 AM - 05:00 PM (Daily)',
    entryFee: { indian: 50, foreigner: 200 },
    deteriorationStatus: 'Moderate Concern',
    description: 'Hawa Mahal is a palace in Jaipur built from red and pink sandstone. Its unique five-floor exterior resembles a honeycomb with 953 small windows called Jharokhas.',
    hindiDescription: 'हवा महल जयपुर में लाल और गुलाबी बलुआ पत्थर से बना एक महल है। इसका पांच मंजिला अग्रभाग 953 झरोखों के साथ मधुमक्खी के छत्ते जैसा दिखता है।',
    historicalSignificance: 'Built so royal ladies could observe everyday street festivals unnoticed behind privacy screens.',
    architectureHighlights: [
      'Five-storey pyramidical facade without foundation, inclined at 87 degrees',
      '953 finely carved sandstone casements producing natural Venturi cooling',
      'Stained glass windows casting vibrant rainbow illumination in inner courtyards',
      'Crown-shaped crown elevation inspired by Lord Krishna\'s mukut'
    ]
  },

  JAI003: {
    hindiName: 'सिटी पैलेस, जयपुर',
    tagline: 'Living royal palace combining Rajput, Mughal, and European architecture',
    category: 'Forts & Palaces',
    timePeriod: '1727–1732 CE (Maharaja Sawai Jai Singh II)',
    architecturalStyle: 'Rajput, Mughal & European Fusion',
    isUnesco: false,
    rating: 4.6,
    reviewsCount: '2.7K reviews',
    heritagePressureScore: 74,
    damageScore: 36,
    crowdLevel: 'Moderate',
    liveFootfall: 15500,
    maxCapacity: 22000,
    bestVisitingWindow: {
      start: '09:30 AM',
      end: '12:00 PM',
      reason: 'Ideal for exploring the grand courtyards and viewing royal royal weapon galleries.',
      hindiReason: 'शाही आंगनों, वस्त्र संग्रहालय और मयूर द्वार के विस्तृत भ्रमण का उपयुक्त समय।'
    },
    openingHours: '09:30 AM - 05:00 PM & 07:00 PM - 10:00 PM (Night)',
    entryFee: { indian: 200, foreigner: 700 },
    deteriorationStatus: 'Good',
    description: 'City Palace complex in the heart of Jaipur includes the Chandra Mahal and Mubarak Mahal palaces and museum courtyards.',
    hindiDescription: 'जयपुर के केंद्र में स्थित सिटी पैलेस परिसर में चंद्र महल, मुबारक महल और समृद्ध संग्रहालय शामिल हैं।',
    historicalSignificance: 'Seat of the Maharaja of Jaipur, housing historic arms, royal regalia, and two colossal silver urns (Guinness record holders).',
    architectureHighlights: [
      'Pritam Niwas Chowk featuring four magnificent seasonal decorated gates including the Peacock Gate',
      'Mubarak Mahal reception pavilion with delicate Islamic arches and marble carving',
      'Chandra Mahal with seven tiers of sweeping royal apartments',
      'Gangajalis: World’s largest sterling silver vessels used to carry sacred Ganga water'
    ]
  },

  JAI004: {
    hindiName: 'जंतर मंतर',
    tagline: 'World’s largest stone astronomical observatory with 19 monumental instruments',
    category: 'UNESCO Sites',
    timePeriod: '1734 CE (Maharaja Sawai Jai Singh II)',
    architecturalStyle: 'Astronomical Masonry Architecture',
    isUnesco: true,
    rating: 4.7,
    reviewsCount: '2.5K reviews',
    heritagePressureScore: 60,
    damageScore: 28,
    crowdLevel: 'Moderate',
    liveFootfall: 11200,
    maxCapacity: 17000,
    bestVisitingWindow: {
      start: '11:00 AM',
      end: '01:30 PM',
      reason: 'Midday sun allows accurate observation of solar shadow movements on the giant sundials.',
      hindiReason: 'दोपहर की धूप में सम्राट यंत्र धूपघड़ी की सटीक छाया और समय देखा जा सकता है।'
    },
    openingHours: '09:00 AM - 05:00 PM (Daily)',
    entryFee: { indian: 50, foreigner: 200 },
    deteriorationStatus: 'Good',
    description: 'The Jantar Mantar is a collection of 19 architectural astronomical instruments built by the Rajput king Sawai Jai Singh II.',
    hindiDescription: 'जंतर मंतर सवाई जय सिंह द्वितीय द्वारा निर्मित 19 वास्तुशिल्पीय खगोलीय उपकरणों का एक अनूठा संग्रह है।',
    historicalSignificance: 'Inscribed as a UNESCO World Heritage Site in 2010; features the world’s largest stone sundial, the Vrihat Samrat Yantra (accuracy within 2 seconds).',
    architectureHighlights: [
      'Vrihat Samrat Yantra: 27-metre high sundial accurate to within 2 seconds',
      'Jai Prakash Yantra: Hemispherical bowl instruments measuring celestial coordinates',
      'Rama Yantra: Cylindrical open masonry instruments for measuring altitude and azimuth',
      'Misra Yantra: Multi-purpose instrument designed to determine noon in five world cities'
    ]
  },

  JAI005: {
    hindiName: 'अल्बर्ट हॉल संग्रहालय',
    tagline: 'Oldest museum of Rajasthan showcasing Indo-Saracenic grandeur and rare treasures',
    category: 'Museums',
    timePeriod: '1887 CE (Sir Samuel Swinton Jacob)',
    architecturalStyle: 'Indo-Saracenic Architecture',
    isUnesco: false,
    rating: 4.6,
    reviewsCount: '2.1K reviews',
    heritagePressureScore: 50,
    damageScore: 26,
    crowdLevel: 'Moderate',
    liveFootfall: 9800,
    maxCapacity: 15000,
    bestVisitingWindow: {
      start: '07:00 PM',
      end: '09:30 PM',
      reason: 'Magical night illumination transforms the museum facade into a glowing palace.',
      hindiReason: 'रात्रि के समय रंग-बिरंगी रोशनी में संग्रहालय का दृश्य बेहद मनमोहक होता है।'
    },
    openingHours: '09:00 AM - 05:00 PM & 07:00 PM - 10:00 PM (Night View)',
    entryFee: { indian: 40, foreigner: 300 },
    deteriorationStatus: 'Good',
    description: 'Albert Hall Museum is the oldest museum of Rajasthan and functions as the state museum of Rajasthan. It is a fine example of Indo-Saracenic architecture.',
    hindiDescription: 'अल्बर्ट हॉल संग्रहालय राजस्थान का सबसे पुराना संग्रहालय है और इंडो-सारसेनिक वास्तुकला का उत्कृष्ट उदाहरण है।',
    historicalSignificance: 'Named after King Edward VII (Albert Edward), housing an authentic 2,300-year-old Egyptian mummy and royal Persian carpets.',
    architectureHighlights: [
      'Intricate stone carved domed towers, open courtyards and Mughal chhatris',
      'Rich exhibits of Persian carpets, Jaipur miniature paintings and ancient armor',
      'Rare Ptolemaic-era Egyptian mummy (Tutu) preservation gallery',
      'Surrounding Ram Niwas Garden with flocking pigeon squares'
    ]
  },

  BOM001: {
    hindiName: 'गेटवे ऑफ इंडिया',
    tagline: 'Colonial Indo-Saracenic basalt arch monument overlooking Mumbai Harbour',
    category: 'Other Heritage',
    timePeriod: '1911–1924 CE (George Wittet)',
    architecturalStyle: 'Indo-Saracenic & 16th-century Gujarati',
    isUnesco: false,
    rating: 4.7,
    reviewsCount: '5.4K reviews',
    heritagePressureScore: 92,
    damageScore: 40,
    crowdLevel: 'Overcrowded',
    liveFootfall: 38000,
    maxCapacity: 35000,
    bestVisitingWindow: {
      start: '06:00 AM',
      end: '08:30 AM',
      reason: 'Catch the Arabian Sea sunrise without dense pedestrian crowding.',
      hindiReason: 'अरब सागर से उगते सूरज और समुद्री लहरों का शांत आनंद लेने का सबसे अच्छा समय।'
    },
    openingHours: 'Open 24 Hours',
    entryFee: { indian: 0, foreigner: 0 },
    deteriorationStatus: 'Moderate Concern',
    description: 'The Gateway of India is an arch-monument built in the early 20th century in the city of Mumbai, standing on the waterfront facing the Arabian Sea.',
    hindiDescription: 'गेटवे ऑफ इंडिया 20वीं सदी की शुरुआत में बना एक भव्य तोरण द्वार है जो अरब सागर के तट पर स्थित है।',
    historicalSignificance: 'Erected to commemorate the landing of King George V and Queen Mary in 1911; marked the ceremonial exit of the last British troops in 1948.',
    architectureHighlights: [
      '26-metre high central arch built of yellow basalt and reinforced concrete',
      'Central dome measuring 15 metres in diameter with delicate Muslim trefoil tracery',
      'Intricate pierced stone jali work influenced by 16th-century Gujarati woodwork',
      'Overlooks Mumbai harbor and ferry departure points for Elephanta Island'
    ]
  },

  BOM002: {
    hindiName: 'एलिफेंटा गुफाएं',
    tagline: 'Ancient UNESCO rock-cut cave temples dedicated to the syncretic cult of Lord Shiva',
    category: 'Caves & Rock Cut',
    timePeriod: '5th–8th Century CE',
    architecturalStyle: 'Rock-Cut Basalt Architecture',
    isUnesco: true,
    rating: 4.6,
    reviewsCount: '2.9K reviews',
    heritagePressureScore: 68,
    damageScore: 56,
    crowdLevel: 'Moderate',
    liveFootfall: 8500,
    maxCapacity: 12000,
    bestVisitingWindow: {
      start: '09:00 AM',
      end: '12:30 PM',
      reason: 'Take the early morning ferry from Gateway of India to explore before afternoon humidity.',
      hindiReason: 'गेटवे से सुबह की पहली नौका लेकर दोपहर की धूप और नमी से पहले गुफाओं का भ्रमण करें।'
    },
    openingHours: '09:30 AM - 05:30 PM (Closed on Mondays)',
    entryFee: { indian: 40, foreigner: 600 },
    deteriorationStatus: 'Moderate Concern',
    description: 'Elephanta Caves are a collection of cave temples predominantly dedicated to the Hindu god Shiva, located on Elephanta Island in Mumbai Harbour.',
    hindiDescription: 'एलिफेंटा गुफाएं मुंबई हार्बर में एलीफेंटा द्वीप पर स्थित भगवान शिव को समर्पित रॉक-कट गुफा मंदिरों का संग्रह हैं।',
    historicalSignificance: 'Inscribed as a UNESCO World Heritage Site in 1987; famous for the masterwork 20-foot high relief of Sadashiva Trimurti.',
    architectureHighlights: [
      'Colossal 6-metre high three-headed Trimurti sculpture representing Creator, Preserver, Destroyer',
      'Rock-cut pillared mandapa hall spanning over 1,600 square metres',
      'Sculpted high-relief panels: Ardhanarishvara, Gangadhara, and Nataraja cosmic dance',
      'Monolithic Dvarapala guardian statues guarding the four-door inner Garbhagriha'
    ]
  },

  BOM003: {
    hindiName: 'छत्रपति शिवाजी महाराज टर्मिनस',
    tagline: 'Spectacular UNESCO Victorian Gothic railway palace blending European and Indian motifs',
    category: 'UNESCO Sites',
    timePeriod: '1878–1887 CE (Frederick William Stevens)',
    architecturalStyle: 'High Victorian Gothic Revival',
    isUnesco: true,
    rating: 4.8,
    reviewsCount: '4.7K reviews',
    heritagePressureScore: 88,
    damageScore: 32,
    crowdLevel: 'High',
    liveFootfall: 45000,
    maxCapacity: 50000,
    bestVisitingWindow: {
      start: '10:30 AM',
      end: '01:00 PM',
      reason: 'Between morning and evening office rush hours to admire stained glass and stone gargoyles.',
      hindiReason: 'कार्यालयी भीड़ के बाद हेरिटेज विंग और नक्काशीदार मेहराबों को शांति से देखने का समय।'
    },
    openingHours: 'Open 24 Hours (Heritage Gallery: 11 AM - 5 PM on weekdays)',
    entryFee: { indian: 0, foreigner: 0 },
    deteriorationStatus: 'Good',
    description: 'Chhatrapati Shivaji Maharaj Terminus (CSMT), formerly Victoria Terminus, is a historic terminal train station and UNESCO World Heritage Site in Mumbai.',
    hindiDescription: 'छत्रपति शिवाजी महाराज टर्मिनस (पूर्व में विक्टोरिया टर्मिनस) मुंबई में एक ऐतिहासिक रेलवे स्टेशन और यूनेस्को विश्व धरोहर स्थल है।',
    historicalSignificance: 'Declared a UNESCO World Heritage Site in 2004, serving as the headquarters of the Central Railway and India\'s busiest transit hub.',
    architectureHighlights: [
      'Massive 100-metre high octagonal central dome crowned with the colossal statue of Progress',
      'Grand cantilevered staircase, Italian marble flooring, and stained-glass rose windows',
      'Stone reliefs and gargoyles depicting indigenous Indian fauna and flora',
      'Turrets, pointed arches, and buttresses fusing Gothic style with Indian palace design'
    ]
  },

  BOM004: {
    hindiName: 'हाजी अली दरगाह',
    tagline: 'Historic Indo-Islamic shrine and mosque perched on an offshore islet in the Arabian Sea',
    category: 'Tombs & Mausoleums',
    timePeriod: '1431 CE (Pir Haji Ali Shah Bukhari)',
    architecturalStyle: 'Indo-Islamic Marine Architecture',
    isUnesco: false,
    rating: 4.7,
    reviewsCount: '3.4K reviews',
    heritagePressureScore: 84,
    damageScore: 46,
    crowdLevel: 'High',
    liveFootfall: 26000,
    maxCapacity: 25000,
    bestVisitingWindow: {
      start: '07:30 AM',
      end: '10:00 AM',
      reason: 'Low tide provides clear access along the 1-km ocean causeway.',
      hindiReason: 'भाटे (लो-टाइड) के समय समुद्र के रास्ते से दरगाह तक आसान और सुरक्षित पहुंच।'
    },
    openingHours: '05:30 AM - 10:00 PM (Daily)',
    entryFee: { indian: 0, foreigner: 0 },
    deteriorationStatus: 'Moderate Concern',
    description: 'Haji Ali Dargah is a mosque and dargah located on an islet off the coast of Worli in the southern part of Mumbai, accessed by a narrow pathway across the sea.',
    hindiDescription: 'हाजी अली दरगाह दक्षिण मुंबई के वर्ली तट से दूर एक छोटे द्वीप पर स्थित प्रसिद्ध मस्जिद और दरगाह है।',
    historicalSignificance: 'Contains the tomb of the wealthy merchant-saint Pir Haji Ali Shah Bukhari who gave up all worldly possessions.',
    architectureHighlights: [
      'Pure white Makrana marble minarets and domed sanctum surrounded by water',
      'Intricate kaleidoscope glass mirror work and Quranic calligraphy in 99 names of Allah',
      '1-km long natural tidal causeway submerged during high tide',
      'Courtyards resonant with traditional Sufi Qawwali devotional music'
    ]
  },

  BOM005: {
    hindiName: 'सिद्धिविनायक मंदिर',
    tagline: 'Iconic golden sanctum shrine dedicated to Lord Ganesha in Prabhadevi',
    category: 'Temples',
    timePeriod: '1801 CE (Laxman Vithu & Deubai Patil)',
    architecturalStyle: 'Contemporary Hindu Temple Architecture',
    isUnesco: false,
    rating: 4.8,
    reviewsCount: '5.1K reviews',
    heritagePressureScore: 90,
    damageScore: 20,
    crowdLevel: 'Overcrowded',
    liveFootfall: 50000,
    maxCapacity: 45000,
    bestVisitingWindow: {
      start: '06:00 AM',
      end: '08:00 AM',
      reason: 'Early morning Kakad Aarti offers peaceful darshan with minimal queue delays.',
      hindiReason: 'सुबह की काकड़ आरती के समय दर्शन सुगमता से और शांतिपूर्ण ढंग से होते हैं।'
    },
    openingHours: '05:30 AM - 10:00 PM (Special timings on Tuesdays)',
    entryFee: { indian: 0, foreigner: 0 },
    deteriorationStatus: 'Good',
    description: 'The Shree Siddhivinayak Ganapati Mandir is a Hindu temple dedicated to Lord Shri Ganesh, located in Prabhadevi, Mumbai. It is one of the richest temples in India.',
    hindiDescription: 'श्री सिद्धिविनायक गणपति मंदिर मुंबई के प्रभादेवी में स्थित भगवान श्री गणेश को समर्पित एक अत्यंत प्रतिष्ठित मंदिर है।',
    historicalSignificance: 'Sacred deity with right-turning trunk (Navasacha Ganapati), revered for fulfilling heartfelt wishes of millions of pilgrims.',
    architectureHighlights: [
      'Six-storey multi-angled sanctum capped with a gold-plated central dome (Shikhara)',
      'Intricate wooden doors carved with the Ashtavinayak (eight Ganesha manifestations)',
      'Inner gold-plated canopy housing the two-and-a-half-foot black stone idol',
      'Integrated modern crowd-management corridors and robotic security scanning'
    ]
  },

  PRA001: {
    hindiName: 'त्रिवेणी संगम',
    tagline: 'Sacred confluence of the holy Ganga, Yamuna, and mythical Saraswati rivers',
    category: 'Other Heritage',
    timePeriod: 'Ancient Vedic Heritage (Timeless)',
    architecturalStyle: 'Sacred Confluence & Ghats',
    isUnesco: false,
    rating: 4.9,
    reviewsCount: '6.2K reviews',
    heritagePressureScore: 85,
    damageScore: 30,
    crowdLevel: 'High',
    liveFootfall: 35000,
    maxCapacity: 50000,
    bestVisitingWindow: {
      start: '05:30 AM',
      end: '08:30 AM',
      reason: 'Witness the serene sunrise boat ride and visible color contrast between emerald Yamuna and ochre Ganga.',
      hindiReason: 'सूर्योदय पर नौका विहार करते हुए यमुना के गहरे और गंगा के हल्के जल का मिलन स्पष्ट दिखाई देता है।'
    },
    openingHours: 'Open 24 Hours (Boating sunrise to sunset)',
    entryFee: { indian: 0, foreigner: 0 },
    deteriorationStatus: 'Good',
    description: 'Triveni Sangam is the confluence of three rivers: the Ganges, the Yamuna, and the invisible Saraswati. It is the holiest site in Hinduism and the epicenter of the Kumbh Mela.',
    hindiDescription: 'त्रिवेणी संगम तीन नदियों: गंगा, यमुना और अदृश्य सरस्वती का पवित्र संगम है, जो कुंभ मेले का मुख्य केंद्र है।',
    historicalSignificance: 'Host site of the Maha Kumbh Mela, recognized by UNESCO in 2017 as an Intangible Cultural Heritage of Humanity.',
    architectureHighlights: [
      'Distinct visible chromatic confluence between deep green Yamuna and sandy brown Ganga',
      'Traditional wooden heritage riverboats and ceremonial floating bathing ghats',
      'Historic backdrop of the colossal Akbar Fort walls along the river bank',
      'Spiritual evening Aarti ceremonies and thousands of floating clay lamps (diyas)'
    ]
  },

  PRA002: {
    hindiName: 'इलाहाबाद का किला',
    tagline: 'Massive Mughal fortress built by Akbar at the Sangam housing the Ashoka Pillar',
    category: 'Forts & Palaces',
    timePeriod: '1583 CE (Emperor Akbar)',
    architecturalStyle: 'Mughal Imperial Fortification',
    isUnesco: false,
    rating: 4.5,
    reviewsCount: '1.9K reviews',
    heritagePressureScore: 62,
    damageScore: 44,
    crowdLevel: 'Moderate',
    liveFootfall: 11000,
    maxCapacity: 18000,
    bestVisitingWindow: {
      start: '09:00 AM',
      end: '11:30 AM',
      reason: 'Pleasant lighting for exploring the accessible Patalpuri temple and Ashoka Pillar area.',
      hindiReason: 'पातालपुरी मंदिर और अक्षयवट दर्शन के लिए सुबह का समय सबसे अनुकूल है।'
    },
    openingHours: '07:00 AM - 06:00 PM (Public sections: Patalpuri & Akshayavat)',
    entryFee: { indian: 0, foreigner: 0 },
    deteriorationStatus: 'Moderate Concern',
    description: 'Allahabad Fort is a fort built by the Mughal emperor Akbar at Allahabad (Prayagraj) in 1583. The fort stands on the banks of the Yamuna near its confluence with the Ganges.',
    hindiDescription: 'इलाहाबाद किला 1583 में मुगल सम्राट अकबर द्वारा गंगा-यमुना संगम के निकट बनवाया गया एक विशाल किला है।',
    historicalSignificance: 'One of the largest military forts built by Akbar, containing the 3rd-century BCE Ashoka Pillar with inscriptions by Samudragupta and Jahangir.',
    architectureHighlights: [
      'Massive triple defensive wall system with imposing octagonal watchtowers',
      'Monolithic polished 10.6-metre Ashoka Pillar dating to 232 BCE',
      'Underground Patalpuri Temple housing the immortal Banyan tree (Akshayavat)',
      'Jodhabai Palace and Zenana pavilions with distinctive Rajput-Mughal brackets'
    ]
  },

  PRA003: {
    hindiName: 'खुसरो बाग',
    tagline: 'Walled Mughal Charbagh garden housing exquisitely carved funerary mausoleums',
    category: 'Tombs & Mausoleums',
    timePeriod: '1622 CE (Jahangiri Mughal Period)',
    architecturalStyle: 'Mughal Charbagh Architecture',
    isUnesco: false,
    rating: 4.6,
    reviewsCount: '1.8K reviews',
    heritagePressureScore: 45,
    damageScore: 38,
    crowdLevel: 'Low',
    liveFootfall: 6200,
    maxCapacity: 15000,
    bestVisitingWindow: {
      start: '07:00 AM',
      end: '10:00 AM',
      reason: 'Peaceful morning walks surrounded by historic mango and guava orchards.',
      hindiReason: 'ऐतिहासिक बाग और शांत बगीचों में सुबह की सैर का सुखद अनुभव।'
    },
    openingHours: '06:00 AM - 07:00 PM (Daily)',
    entryFee: { indian: 0, foreigner: 0 },
    deteriorationStatus: 'Good',
    description: 'Khusro Bagh is a large walled garden and burial complex situated in Prayagraj. It contains the tombs of Prince Khusrau Mirza, his mother Shah Begum, and his sister Nithar Begam.',
    hindiDescription: 'खुसरो बाग प्रयागराज में स्थित एक विशाल चारबाग उद्यान और समाधि परिसर है, जिसमें राजकुमार खुसरो और शाह बेगम के मकबरे हैं।',
    historicalSignificance: 'Exemplifies refined Jahangiri-era sandstone architecture with Persian calligraphic inscriptions and fresco medallions.',
    architectureHighlights: [
      'Three-tiered sandstone mausoleum of Prince Khusrau designed by Aqa Reza',
      'Shah Begum’s tomb featuring a marble chhatri canopy and decorative cenotaph',
      'Nithar Begam’s tomb with ceiling frescoes depicting elaborate celestial stars and floral arabesques',
      'Intact monumental Mughal gateways and stone boundary walls'
    ]
  },

  PRA004: {
    hindiName: 'आनंद भवन',
    tagline: 'Historic ancestral mansion of the Nehru-Gandhi family and freedom movement museum',
    category: 'Museums',
    timePeriod: '1930 CE (Motilal Nehru)',
    architecturalStyle: 'Colonial Indian Heritage Mansion',
    isUnesco: false,
    rating: 4.7,
    reviewsCount: '2.6K reviews',
    heritagePressureScore: 52,
    damageScore: 24,
    crowdLevel: 'Moderate',
    liveFootfall: 8900,
    maxCapacity: 14000,
    bestVisitingWindow: {
      start: '10:00 AM',
      end: '01:00 PM',
      reason: 'Ideal for touring the preserved historical rooms and the adjacent Jawahar Planetarium.',
      hindiReason: 'ऐतिहासिक कक्षों और जवाहर तारामंडल के विस्तृत भ्रमण के लिए दोपहर पूर्व का समय।'
    },
    openingHours: '09:30 AM - 05:00 PM (Closed on Mondays)',
    entryFee: { indian: 70, foreigner: 250 },
    deteriorationStatus: 'Good',
    description: 'Anand Bhavan is a historic house museum in Prayagraj which belonged to the Nehru family. It was constructed by Indian political leader Motilal Nehru in the 1930s.',
    hindiDescription: 'आनंद भवन प्रयागराज में एक ऐतिहासिक संग्रहालय है जो नेहरू परिवार का पैतृक निवास था। इसका निर्माण 1930 में मोतीलाल नेहरू ने कराया था।',
    historicalSignificance: 'Epicenter of strategy meetings during the Indian Independence Movement, where the Congress Working Committee drafted key resolutions.',
    architectureHighlights: [
      'Two-storey white colonial mansion featuring expansive columned verandas and high ceilings',
      'Preserved study rooms and private libraries of Jawaharlal Nehru and Mahatma Gandhi',
      'Exhibition galleries showcasing rare photographic archives of the Freedom Struggle',
      'Adjacent Swaraj Bhavan and Jawahar Planetarium within manicured botanical grounds'
    ]
  },

  PRA005: {
    hindiName: 'चंद्रशेखर आजाद पार्क',
    tagline: 'Sprawling colonial park commemorating the supreme sacrifice of Chandrashekhar Azad',
    category: 'Other Heritage',
    timePeriod: '1870 CE (Alfred Park)',
    architecturalStyle: 'Colonial Park & Freedom Memorial',
    isUnesco: false,
    rating: 4.7,
    reviewsCount: '3.1K reviews',
    heritagePressureScore: 48,
    damageScore: 20,
    crowdLevel: 'Moderate',
    liveFootfall: 14000,
    maxCapacity: 25000,
    bestVisitingWindow: {
      start: '06:00 AM',
      end: '09:00 AM',
      reason: 'Fresh morning air, jogging tracks, and paying homage at the Azad memorial tree site.',
      hindiReason: 'सुबह की ताजी हवा, भ्रमण और अमर शहीद चंद्रशेखर आजाद स्मारक पर श्रद्धांजलि का समय।'
    },
    openingHours: '05:00 AM - 09:00 PM (Daily)',
    entryFee: { indian: 10, foreigner: 10 },
    deteriorationStatus: 'Good',
    description: 'Chandrashekhar Azad Park (formerly Alfred Park / Company Bagh) is a public park in Prayagraj. It is the biggest park in Prayagraj spanning 133 acres.',
    hindiDescription: 'चंद्रशेखर आजाद पार्क (पूर्व में अल्फ्रेड पार्क) प्रयागराज का सबसे बड़ा 133 एकड़ में फैला ऐतिहासिक सार्वजनिक पार्क है।',
    historicalSignificance: 'Historic site where revolutionary hero Chandrashekhar Azad attained martyrdom on 27 February 1931 fighting colonial police.',
    architectureHighlights: [
      'Bronze statue memorial marking the exact spot under the sacred Jamun tree',
      'Italian Gothic Victoria Memorial canopy crafted of imported white Italian marble',
      'Prayagraj Museum and Public Library with Gothic turrets and sandstone towers inside the park',
      '133 acres of flowering avenues, rose nurseries and heritage jogging loops'
    ]
  }
};

// =====================================================
// CONVERTER: BACKEND SITE → COMPLETE MONUMENT OBJECT
// =====================================================
export const convertBackendSiteToMonument = (
  site: BackendSite
): Monument => {
  const meta = SITE_METADATA[site.site_id];

  const id = site.site_id;
  const name = site.name;
  const city = site.city || 'Heritage City';
  const state = site.state || 'India';
  const lat = site.latitude || 28.6139;
  const lng = site.longitude || 77.2090;

  // Resolve Image URL
  const imageUrl = resolveImageUrl(
    site.image_url || site.imageUrl || site.image,
    site.site_id
  );

  // If curated metadata exists for this site, merge it seamlessly
  if (meta) {
    return {
      id,
      name,
      hindiName: meta.hindiName,
      tagline: site.description || meta.tagline,
      city,
      state,
      lat,
      lng,
      category: (site.category as MonumentCategory) || meta.category,
      timePeriod: (site.time_period as string) || meta.timePeriod,
      architecturalStyle:
        (site.architectural_style as string) || meta.architecturalStyle,
      isUnesco:
        site.is_unesco !== null && site.is_unesco !== undefined
          ? Boolean(site.is_unesco)
          : meta.isUnesco,
      rating: meta.rating,
      reviewsCount: meta.reviewsCount,
      imageUrl,
      gallery: [imageUrl],
      heritagePressureScore: meta.heritagePressureScore,
      damageScore: meta.damageScore,
      crowdLevel: meta.crowdLevel,
      liveFootfall: meta.liveFootfall,
      maxCapacity: meta.maxCapacity,
      bestVisitingWindow: meta.bestVisitingWindow,
      openingHours: meta.openingHours,
      entryFee: meta.entryFee,
      deteriorationStatus: meta.deteriorationStatus,
      description: site.description || meta.description,
      hindiDescription: meta.hindiDescription,
      historicalSignificance:
        site.historical_significance || meta.historicalSignificance,
      architectureHighlights: meta.architectureHighlights,
      acousticFeatures: meta.acousticFeatures,
      alternativeSites: [],
      hourlyFootfall: [
        { hour: '08:00', count: Math.round(meta.liveFootfall * 0.3), isPeak: false, pressurePercentage: 30 },
        { hour: '10:00', count: Math.round(meta.liveFootfall * 0.7), isPeak: false, pressurePercentage: 60 },
        { hour: '12:00', count: Math.round(meta.liveFootfall * 0.95), isPeak: true, pressurePercentage: 90 },
        { hour: '14:00', count: meta.liveFootfall, isPeak: true, pressurePercentage: 100 },
        { hour: '16:00', count: Math.round(meta.liveFootfall * 0.8), isPeak: false, pressurePercentage: 75 },
        { hour: '18:00', count: Math.round(meta.liveFootfall * 0.4), isPeak: false, pressurePercentage: 40 }
      ]
    };
  }

  // Dynamic generic fallback for newly created backend sites
  const derivedCategory: MonumentCategory =
    (site.category as MonumentCategory) ||
    (name.toLowerCase().includes('temple') || name.toLowerCase().includes('mandir')
      ? 'Temples'
      : name.toLowerCase().includes('fort') || name.toLowerCase().includes('palace') || name.toLowerCase().includes('mahal')
      ? 'Forts & Palaces'
      : name.toLowerCase().includes('tomb') || name.toLowerCase().includes('dargah')
      ? 'Tombs & Mausoleums'
      : name.toLowerCase().includes('cave')
      ? 'Caves & Rock Cut'
      : name.toLowerCase().includes('museum')
      ? 'Museums'
      : 'Other Heritage');

  return {
    id,
    name,
    hindiName: name,
    tagline: site.description || `${name} in ${city}, ${state}`,
    city,
    state,
    lat,
    lng,
    category: derivedCategory,
    timePeriod: site.time_period || 'Historical Era',
    architecturalStyle: site.architectural_style || 'Indian Heritage Architecture',
    isUnesco: Boolean(site.is_unesco),
    rating: 4.5,
    reviewsCount: '1.2K reviews',
    imageUrl,
    gallery: [imageUrl],
    heritagePressureScore: 40,
    damageScore: 25,
    crowdLevel: 'Moderate',
    liveFootfall: 5000,
    maxCapacity: 10000,
    bestVisitingWindow: {
      start: '09:00 AM',
      end: '04:00 PM',
      reason: 'Recommended based on available site timings.',
      hindiReason: 'उपलब्ध साइट समय के आधार पर अनुशंसित समय।'
    },
    openingHours: '09:00 AM - 05:00 PM',
    entryFee: {
      indian: 25,
      foreigner: 300
    },
    deteriorationStatus: 'Good',
    description:
      site.description ||
      `${name} is an important cultural monument located in ${city}, ${state}.`,
    hindiDescription:
      site.description ||
      `${name} ${city}, ${state} में स्थित एक महत्वपूर्ण सांस्कृतिक स्मारक है।`,
    historicalSignificance:
      site.historical_significance ||
      `Preserved heritage landmark of ${city}, contributing to India's historical legacy.`,
    architectureHighlights: [
      `Signature regional architectural elements of ${city}`,
      'Protected archaeological masonry',
      'Historical stone craftsmanship'
    ],
    alternativeSites: [],
    hourlyFootfall: [
      { hour: '09:00', count: 1200, isPeak: false, pressurePercentage: 25 },
      { hour: '11:00', count: 3200, isPeak: false, pressurePercentage: 60 },
      { hour: '13:00', count: 4800, isPeak: true, pressurePercentage: 90 },
      { hour: '15:00', count: 5000, isPeak: true, pressurePercentage: 100 },
      { hour: '17:00', count: 2600, isPeak: false, pressurePercentage: 50 }
    ]
  };
};
