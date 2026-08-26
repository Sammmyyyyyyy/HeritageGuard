import { Monument, MonumentCrowdForecast, DailyCrowdForecast, HourlyForecastItem, CrowdLevel } from '../types/heritage';
import { MONUMENTS_DATA } from './monumentsData';

// Helper to format date nicely
const getUpcomingDates = () => {
  const dates: Array<{
    dateStr: string;
    dayOfWeek: string;
    dayName: string;
    formattedDate: string;
    isToday: boolean;
    dayIndex: number;
  }> = [];

  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayShorts = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayOfWeek = dayShorts[d.getDay()];
    const dayName = dayNames[d.getDay()];
    const formattedDate = `${d.getDate()} ${monthShorts[d.getMonth()]}`;

    dates.push({
      dateStr,
      dayOfWeek,
      dayName,
      formattedDate,
      isToday: i === 0,
      dayIndex: d.getDay() // 0 = Sun, 6 = Sat
    });
  }

  return dates;
};

// Generate realistic 7-day forecast dynamically for any monument
export function generateMonumentForecast(monument: Monument): MonumentCrowdForecast {
  const dates = getUpcomingDates();
  const baseCapacity = monument.maxCapacity || 20000;
  const baseLiveFootfall = monument.liveFootfall || Math.round(baseCapacity * 0.75);

  // Hourly curve multipliers relative to peak capacity
  const hoursConfig = [
    { hour: '06:00', weightWeekday: 0.12, weightWeekend: 0.18 },
    { hour: '07:00', weightWeekday: 0.22, weightWeekend: 0.32 },
    { hour: '08:00', weightWeekday: 0.38, weightWeekend: 0.52 },
    { hour: '09:00', weightWeekday: 0.54, weightWeekend: 0.74 },
    { hour: '10:00', weightWeekday: 0.72, weightWeekend: 0.92 },
    { hour: '11:00', weightWeekday: 0.85, weightWeekend: 1.08 },
    { hour: '12:00', weightWeekday: 0.88, weightWeekend: 1.15 },
    { hour: '13:00', weightWeekday: 0.82, weightWeekend: 1.05 },
    { hour: '14:00', weightWeekday: 0.78, weightWeekend: 1.02 },
    { hour: '15:00', weightWeekday: 0.84, weightWeekend: 1.10 },
    { hour: '16:00', weightWeekday: 0.75, weightWeekend: 0.95 },
    { hour: '17:00', weightWeekday: 0.55, weightWeekend: 0.72 },
    { hour: '18:00', weightWeekday: 0.28, weightWeekend: 0.38 }
  ];

  const currentHour = new Date().getHours();

  const days: DailyCrowdForecast[] = dates.map((d, index) => {
    const isWeekend = d.dayIndex === 0 || d.dayIndex === 6;
    const isFriday = d.dayIndex === 5;
    const isMonday = d.dayIndex === 1;

    // Day coefficient
    let dayMultiplier = 1.0;
    if (d.dayIndex === 0) dayMultiplier = 1.35; // Sunday
    else if (d.dayIndex === 6) dayMultiplier = 1.30; // Saturday
    else if (d.dayIndex === 5) dayMultiplier = 1.12; // Friday
    else if (d.dayIndex === 1) dayMultiplier = 0.72; // Monday
    else if (d.dayIndex === 2) dayMultiplier = 0.78; // Tuesday
    else if (d.dayIndex === 3) dayMultiplier = 0.82; // Wednesday
    else if (d.dayIndex === 4) dayMultiplier = 0.88; // Thursday

    // Calculate expected total day visitors
    let expectedVisitors = Math.round(baseLiveFootfall * dayMultiplier);
    if (d.isToday) {
      expectedVisitors = baseLiveFootfall;
    }

    // Delta vs today
    const deltaNumber = expectedVisitors - baseLiveFootfall;
    const deltaPercent = Math.round((deltaNumber / baseLiveFootfall) * 100);

    let comparisonLabel = 'Baseline today';
    let comparisonDirection: 'up' | 'down' | 'same' = 'same';
    if (!d.isToday) {
      if (deltaPercent > 0) {
        comparisonLabel = `↑ ${deltaPercent}% vs today`;
        comparisonDirection = 'up';
      } else if (deltaPercent < 0) {
        comparisonLabel = `↓ ${Math.abs(deltaPercent)}% vs today`;
        comparisonDirection = 'down';
      } else {
        comparisonLabel = 'Same as today';
      }
    }

    // Determine Crowd Level
    const capacityRatio = expectedVisitors / baseCapacity;
    let crowdLevel: CrowdLevel = 'Moderate';
    if (capacityRatio > 1.05) crowdLevel = 'Overcrowded';
    else if (capacityRatio > 0.82) crowdLevel = 'High';
    else if (capacityRatio > 0.52) crowdLevel = 'Moderate';
    else crowdLevel = 'Low';

    // Comfort Score (0 - 100)
    const comfortScore = Math.max(22, Math.min(96, Math.round(100 - capacityRatio * 58)));
    let comfortLabel = 'Good visiting conditions';
    if (comfortScore >= 80) comfortLabel = 'Excellent time to visit';
    else if (comfortScore >= 65) comfortLabel = 'Comfortable crowd flow';
    else if (comfortScore >= 45) comfortLabel = 'Moderate crowd congestion';
    else comfortLabel = 'Heavy crowding expected';

    // Heritage Pressure Score for this day
    const baseHeritagePressure = monument.heritagePressureScore || 65;
    const heritagePressure = Math.max(15, Math.min(98, Math.round(baseHeritagePressure * (0.65 + capacityRatio * 0.45))));

    let heritageImpactLabel = 'Moderate Impact';
    let heritageImpactDetails = 'Controlled tourist footprint keeps surface micro-abrasion within safe structural tolerance levels.';
    if (heritagePressure < 40) {
      heritageImpactLabel = 'Low Impact';
      heritageImpactDetails = 'Lower visitor density significantly reduces stress on sensitive marble inlays, frescoes, and stone foundations.';
    } else if (heritagePressure > 75) {
      heritageImpactLabel = 'Elevated Structural Strain';
      heritageImpactDetails = 'High ambient humidity and footstep vibrations trigger accelerated micro-fissure expansion in critical zones.';
    }

    // Hourly Breakdown
    const hourlyForecast: HourlyForecastItem[] = hoursConfig.map((hc) => {
      const weight = isWeekend ? hc.weightWeekend : hc.weightWeekday;
      // Hourly capacity is roughly baseCapacity / 6 as peak concurrency
      const peakHourlyCap = Math.round(baseCapacity * 0.22);
      const visitors = Math.round(peakHourlyCap * weight * (dayMultiplier * 0.9 + 0.1));
      const capPercent = Math.min(125, Math.round((visitors / peakHourlyCap) * 100));

      let hourCrowdLevel: CrowdLevel = 'Low';
      if (capPercent > 90) hourCrowdLevel = 'Overcrowded';
      else if (capPercent > 70) hourCrowdLevel = 'High';
      else if (capPercent > 40) hourCrowdLevel = 'Moderate';
      else hourCrowdLevel = 'Low';

      const hourNum = parseInt(hc.hour.split(':')[0], 10);
      const isNow = d.isToday && Math.abs(currentHour - hourNum) <= 1;

      return {
        hour: hc.hour,
        visitors,
        capacityPercentage: capPercent,
        crowdLevel: hourCrowdLevel,
        isNow
      };
    });

    // Best and Avoid Windows
    const bestVisitingWindow = {
      start: isWeekend ? '06:00 AM' : '06:30 AM',
      end: isWeekend ? '08:30 AM' : '09:30 AM',
      reasons: [
        'Lowest predicted crowd (70% below peak midday volumes)',
        'Significantly lower vibration strain on heritage stonework',
        'Comfortable morning breeze and superior lighting for photography',
        'Minimal queueing at security checkpoints & ticket verification'
      ],
      hindiReasons: [
        'दोपहर की भीड़ की तुलना में 70% कम आगंतुक',
        'स्मारक की दीवारों और फर्श पर न्यूनतम दबाव',
        'शांत वातावरण और बेहतर फोटोग्राफी के अवसर',
        'सुरक्षा जांच पर न्यूनतम प्रतीक्षा समय'
      ]
    };

    const avoidWindow = {
      start: isWeekend ? '11:30 AM' : '12:00 PM',
      end: isWeekend ? '04:30 PM' : '03:30 PM',
      reason: isWeekend
        ? 'Midday tourist surge approaches 115% of safe structural carrying capacity with long chamber queues.'
        : 'Peak concurrent visitors cause bottlenecking at central sanctums and elevated thermal radiation.',
      hindiReason: 'दोपहर के समय भारी भीड़ और लंबी कतारों के कारण असुविधा हो सकती है।'
    };

    // Dynamic Crowd Reasons
    const isHigh = isWeekend || capacityRatio > 0.85;
    const crowdReasons = isHigh
      ? {
          isHigh: true,
          title: 'Why is the Crowd High?',
          factors: [
            isWeekend ? 'Weekend Leisure & Domestic Tourism' : 'Peak Tourist Circuit Inflow',
            'Favourable Clear Weather Forecast',
            'Organised Group & School Excursions',
            'Prominent Sunset Photo Attraction'
          ],
          summary: `Footfall on ${d.dayName} is projected to surge by ${Math.abs(deltaPercent || 28)}% due to weekend travel patterns, pleasant temperatures, and high tourist circuit convergence.`,
          hindiSummary: `${d.dayName} को सप्ताहांत अवकाश और अनुकूल मौसम के चलते आगंतुकों की संख्या में उल्लेखनीय वृद्धि का अनुमान है।`
        }
      : {
          isHigh: false,
          title: 'Why is today a good day?',
          factors: [
            'Mid-week Low Inbound Footfall',
            'Minimal Group Tour Bookings',
            'Comfortable Walking Temperatures',
            'Low Structural Heritage Pressure'
          ],
          summary: `${d.dayName} offers serene visiting conditions with comfortable transit through all corridors and minimal wait times.`,
          hindiSummary: `${d.dayName} को शांतिपूर्ण भ्रमण, न्यूनतम प्रतीक्षा और सुखद अनुभव का उत्तम अवसर है।`
        };

    // AI Recommendation
    const aiRecommendation = isHigh
      ? `Dharohar AI suggests arriving before ${bestVisitingWindow.start} to experience ${monument.name} with minimal congestion. If arriving after 11:00 AM, consider visiting nearby eco-alternative sites like ${monument.alternativeSites[0]?.name || 'neighboring heritage monuments'} to avoid queuing.`
      : `Dharohar AI confirms ${d.dayName} is an optimal day for a relaxed exploration of ${monument.name}. Morning slots (${bestVisitingWindow.start} – ${bestVisitingWindow.end}) provide the lowest heritage strain score of the week.`;

    const hindiAiRecommendation = isHigh
      ? `धरोहर एआई सलाह देता है कि भीड़ से बचने के लिए ${bestVisitingWindow.start} से पहले पहुंचे। यदि दोपहर में आ रहे हैं, तो नजदीकी वैकल्पिक स्मारकों का रुख करें।`
      : `धरोहर एआई के अनुसार ${d.dayName} शांतिपूर्ण दर्शन के लिए सबसे उपयुक्त दिनों में से एक है।`;

    return {
      date: d.dateStr,
      dayOfWeek: d.dayOfWeek,
      dayName: d.dayName,
      formattedDate: d.formattedDate,
      isToday: d.isToday,
      expectedVisitors,
      comparisonWithToday: {
        label: comparisonLabel,
        direction: comparisonDirection,
        percentage: Math.abs(deltaPercent)
      },
      crowdLevel,
      comfortScore,
      comfortLabel,
      heritagePressure,
      heritageImpactLabel,
      heritageImpactDetails,
      bestVisitingWindow,
      avoidWindow,
      hourlyForecast,
      crowdReasons,
      aiRecommendation,
      hindiAiRecommendation
    };
  });

  // Find Best Day of the Week (highest comfortScore)
  const bestDay = [...days].sort((a, b) => b.comfortScore - a.comfortScore)[0];

  return {
    monumentId: monument.id,
    monumentName: monument.name,
    hindiName: monument.hindiName,
    city: monument.city,
    state: monument.state,
    imageUrl: monument.imageUrl,
    safeCapacity: baseCapacity,
    currentLiveFootfall: baseLiveFootfall,
    currentCrowdLevel: monument.crowdLevel,
    bestDayThisWeek: {
      dayName: bestDay.dayName,
      date: bestDay.date,
      formattedDate: bestDay.formattedDate,
      expectedVisitors: bestDay.expectedVisitors,
      reason: `Lowest weekly footfall (${bestDay.expectedVisitors.toLocaleString()} visitors) with highest comfort score (${bestDay.comfortScore}/100).`,
      hindiReason: `सप्ताह का सबसे शांत दिन (${bestDay.expectedVisitors.toLocaleString()} अनुमानित आगंतुक)।`
    },
    days
  };
}

// Map cache for performance
const FORECAST_CACHE: Record<string, MonumentCrowdForecast> = {};

export function getMonumentCrowdForecast(monumentIdOrMonument: string | Monument): MonumentCrowdForecast {
  let monument: Monument | undefined;
  if (typeof monumentIdOrMonument === 'string') {
    monument = MONUMENTS_DATA.find((m) => m.id === monumentIdOrMonument || m.name.toLowerCase().includes(monumentIdOrMonument.toLowerCase()));
    if (!monument) {
      monument = MONUMENTS_DATA[0];
    }
  } else {
    monument = monumentIdOrMonument;
  }

  if (!FORECAST_CACHE[monument.id]) {
    FORECAST_CACHE[monument.id] = generateMonumentForecast(monument);
  }

  return FORECAST_CACHE[monument.id];
}
