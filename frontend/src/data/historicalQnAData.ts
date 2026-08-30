export interface QnAPair {
  keywords: string[];
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
  sources: Array<{ title: string; archive: string; confidence: number }>;
}

export const HISTORICAL_KNOWLEDGE_BASE: QnAPair[] = [
  {
    keywords: ['taj', 'yellow', 'marble', 'pollution', 'conservation', 'mud pack', 'ताज', 'पीला'],
    questionEn: 'What causes the yellowing of Taj Mahal marble and how is ASI conserving it?',
    questionHi: 'ताजमहल का संगमरमर पीला क्यों पड़ रहा है और ASI इसका संरक्षण कैसे कर रहा है?',
    answerEn: 'The discolouration of the Taj Mahal’s Makrana marble is primarily driven by atmospheric sulphur dioxide, nitrogen dioxide, and suspended particulate matter (SPM) emitting from nearby industries and vehicular traffic in the Taj Trapezium Zone (TTZ).\n\nTo remediate this without abrasive chemical damage, the Archaeological Survey of India (ASI) deploys non-invasive **Fuller\'s Earth (Multani Mitti) clay poultice treatment**. The lime clay gently absorbs embedded pollutants, grease, and grime without reacting with the calcium carbonate substrate.',
    answerHi: 'ताजमहल के मकराना संगमरमर का पीलापन मुख्य रूप से वायुमंडलीय सल्फर डाइऑक्साइड, नाइट्रोजन डाइऑक्साइड और निलंबित कणों (SPM) के कारण होता है।\n\nबिना किसी रासायनिक नुकसान के इसे ठीक करने के लिए, भारतीय पुरातत्व सर्वेक्षण (ASI) **मुल्तानी मिट्टी (Fuller\'s Earth) क्ले पैक विधि** का उपयोग करता है। यह मिट्टी संगमरमर से जमी हुई कालिख और प्रदूषकों को सोख लेती है।',
    sources: [
      { title: 'ASI Scientific Monograph: Conservation of Taj Marble (Vol. 42)', archive: 'Archaeological Survey of India Archives, New Delhi', confidence: 0.98 },
      { title: 'UNESCO State of Conservation Report: Taj Mahal & Agra Fort', archive: 'UNESCO World Heritage Centre Dossier #252', confidence: 0.96 }
    ]
  },
  {
    keywords: ['hampi', 'musical', 'pillars', 'vittala', 'saregama', 'हम्पी', 'संगीत', 'स्तंभ'],
    questionEn: 'How do the musical pillars of Vittala Temple in Hampi produce acoustic notes?',
    questionHi: 'हम्पी के विट्ठल मंदिर के संगीतमय स्तंभ स्वर कैसे उत्पन्न करते हैं?',
    answerEn: 'The Vittala Temple complex at Hampi features 56 monolithic granite pillars, known as the **SaReGaMa Pillars**. Each main supporting pillar is surrounded by seven slender miniature shafts carved out of a single monolithic rock block.\n\nGeological and metallographic resonance analyses indicate the rock contains high concentrations of silica and resonant metallic minerals. Furthermore, artisans carved the shafts with varying cross-sectional densities and diameters, allowing them to vibrate at distinct resonant frequencies when tapped.',
    answerHi: 'हम्पी के विट्ठल मंदिर में 56 अखंड ग्रेनाइट स्तंभ हैं जिन्हें **सारेगामा स्तंभ** कहा जाता है। मुख्य स्तंभ के चारों ओर सात बारीक नक्काशीदार छोटे स्तंभ हैं।\n\nभूवैज्ञानिक अध्ययनों से पता चलता है कि इन पत्थरों में सिलिका और धातु-समृद्ध खनिजों का विशेष अनुपात है। विभिन्न मोटाई और घनत्व के कारण हल्के से थपथपाने पर ये संगीत के विभिन्न स्वर उत्पन्न करते हैं।',
    sources: [
      { title: 'Acoustic Resonance in Vijayanagara Lithic Pillars', archive: 'Epigraphia Carnatica & ASI Southern Circle Reports', confidence: 0.97 },
      { title: 'Architectural Genius of the Vijayanagara Dynasty', archive: 'INTACH Heritage Studies Series', confidence: 0.94 }
    ]
  },
  {
    keywords: ['konark', 'wheel', 'sundial', 'sun', 'time', 'कोणार्क', 'पहिया', 'घड़ी'],
    questionEn: 'How do the Konark Sun Temple sundial wheels calculate precise time?',
    questionHi: 'कोणार्क सूर्य मंदिर के 24 पहिए सटीक समय की गणना कैसे करते हैं?',
    answerEn: 'The 24 wheels of Konark Sun Temple represent the 24 fortnights (Pakshas) of the Hindu lunar calendar, with each wheel acting as a giant astronomical chronometer.\n\nEach wheel has **8 major spokes** (representing the 8 Praharas of a 24-hour day, each 3 hours apart) and **8 minor spokes** (1.5 hours apart). The width between the beads along the outer rim allows time estimation down to an accuracy of approximately **3 minutes** by observing the angle of shadow cast by the central axle pin.',
    answerHi: 'कोणार्क मंदिर के 24 पहिए वर्ष के 24 पक्षों का प्रतिनिधित्व करते हैं। प्रत्येक पहिए में 8 मुख्य तीलियाँ (8 प्रहर, प्रत्येक 3 घंटे का) और 8 गौण तीलियाँ (1.5 घंटे की) हैं।\n\nपहिए की धुरी से पड़ने वाली छाया और परिधि पर तराशे गए मणकों की सहायता से लगभग **3 मिनट की सूक्ष्म सटीकता** के साथ समय मापा जा सकता है।',
    sources: [
      { title: 'Astronomical Principles of the Sun Temple of Konarak', archive: 'National Institute of Science & Heritage Archeo-Astronomy', confidence: 0.99 },
      { title: 'Kalinga Temple Architecture & Geometry', archive: 'Odisha State Archaeology Monograph', confidence: 0.95 }
    ]
  },
  {
    keywords: ['ajanta', 'painting', 'fresco', 'dark', 'light', 'अजंता', 'चित्र', 'गुफा'],
    questionEn: 'How did ancient Buddhist monks paint detailed frescoes inside the dark Ajanta caves?',
    questionHi: 'प्राचीन भिक्षुओं ने अंधेरी अजंता गुफाओं में इतने सजीव भित्तिचित्र कैसे बनाए?',
    answerEn: 'The artists of the Vakataka and Satavahana periods illuminated the cave interiors using an ingenious ancient optical technique. They placed **large polished bronze and brass mirrors** and white cloth sheets at the cave entrance to catch the sun\'s rays and reflect diffused natural light onto the rock walls.\n\nThey also utilized brass oil lamps burning purified vegetable oils that produced minimal soot, mixed with natural ground minerals (lapis lazuli for ultramarine blue, malachite for green, and red ochre for terracotta tones) bound with organic plant gum and animal glue tempera.',
    answerHi: 'वाकाटक काल के चित्रकारों ने गुफाओं के प्रवेश द्वारों पर **विशाल पॉलिश किए हुए कांस्य और पीतल के दर्पण** तथा सफेद सूती चादरें रखी थीं, जो सूर्य की रोशनी को परावर्तित करके गुफा के अंधेरे कोनों तक पहुंचाती थीं।\n\nसाथ ही वे विशेष तेल के दीयों का उपयोग करते थे जिससे कालिख नहीं निकलती थी।',
    sources: [
      { title: 'The Cave Paintings of Ajanta: Technical & Mineralogical Analysis', archive: 'ASI Chemistry Branch Technical Bulletins', confidence: 0.96 },
      { title: 'UNESCO Conservation Dossier: Ajanta Caves', archive: 'UNESCO World Heritage Collection', confidence: 0.97 }
    ]
  }
];
