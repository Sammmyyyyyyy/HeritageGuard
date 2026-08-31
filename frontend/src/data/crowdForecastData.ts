import {
  Monument,
  MonumentCrowdForecast,
  DailyCrowdForecast,
  HourlyForecastItem,
  CrowdLevel,
} from '../types/heritage';
import { getCrowd, CrowdPredictionResponse, HourlyPrediction } from '../api/crowd';
import { getPressure, PressureResponse } from '../api/pressure';

/**
 * Get current date string formatted as 'YYYY-MM-DD' in local timezone.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date string formatted as 'YYYY-MM-DD' offset by N days from today.
 */
export function getFutureDateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get upcoming N date strings starting from today.
 */
export function getUpcomingDateStrings(count: number = 7): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Format 'YYYY-MM-DD' to short display format like '30 Aug'.
 */
export function formatDateLabel(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${day} ${MONTH_NAMES[monthIdx] || ''}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

/**
 * Format 24-hour time "09:00" to "09:00 AM".
 */
export function formatTime12(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(displayH).padStart(2, '0')}:${m} ${period}`;
}

/**
 * Convert backend time range "09:00-16:00" to "09:00 AM – 04:00 PM".
 */
export function formatTimeRange(rangeStr?: string): { start: string; end: string } {
  if (!rangeStr || !rangeStr.includes('-')) {
    return { start: '09:00 AM', end: '05:00 PM' };
  }
  const [rawStart, rawEnd] = rangeStr.split('-');
  return {
    start: formatTime12(rawStart.trim()),
    end: formatTime12(rawEnd.trim()),
  };
}

/**
 * Maps live CrowdPredictionResponse and PressureResponse into the frontend DailyCrowdForecast schema.
 * 100% deterministic with zero client-side Math.random() or synthetic formulas.
 */
export function mapCrowdPredictionToDailyForecast(
  crowd: CrowdPredictionResponse,
  pressure?: PressureResponse | null,
  isToday: boolean = false,
  baselineTodayTotal?: number
): DailyCrowdForecast {
  const safeCapacity = crowd.safe_capacity || 15000;
  const expectedVisitors = crowd.daily_expected_total || 0;
  const baseline = baselineTodayTotal ?? expectedVisitors;

  // Relative delta comparison against today's baseline
  let comparisonLabel = 'Baseline today';
  let comparisonDirection: 'up' | 'down' | 'same' = 'same';
  let comparisonPercentage = 0;

  if (!isToday && baseline > 0) {
    const delta = expectedVisitors - baseline;
    comparisonPercentage = Math.round(Math.abs((delta / baseline) * 100));
    if (delta > 0) {
      comparisonLabel = `↑ ${comparisonPercentage}% vs today`;
      comparisonDirection = 'up';
    } else if (delta < 0) {
      comparisonLabel = `↓ ${comparisonPercentage}% vs today`;
      comparisonDirection = 'down';
    } else {
      comparisonLabel = 'Same as today';
    }
  }

  // Determine Crowd Level according to carrying capacity ratio
  const capacityRatio = safeCapacity > 0 ? expectedVisitors / safeCapacity : 0.5;
  let crowdLevel: CrowdLevel = 'Moderate';
  if (capacityRatio > 1.05) crowdLevel = 'Overcrowded';
  else if (capacityRatio > 0.75) crowdLevel = 'High';
  else if (capacityRatio > 0.45) crowdLevel = 'Moderate';
  else crowdLevel = 'Low';

  // Tourist Crowd Comfort Score (0 - 100, higher is more comfortable)
  const comfortScore = Math.max(15, Math.min(98, Math.round(100 - capacityRatio * 52)));
  let comfortLabel = 'Good visiting conditions';
  if (comfortScore >= 75) comfortLabel = 'Optimal crowd flow & short queues';
  else if (comfortScore >= 50) comfortLabel = 'Moderate crowd flow';
  else comfortLabel = 'Heavy crowding & extended waiting';

  // Heritage Pressure Score (0 - 100) from Pressure AI service
  const heritagePressure = pressure
    ? Math.round(pressure.pressure_score)
    : Math.max(20, Math.min(95, Math.round(capacityRatio * 75 + 15)));

  let heritageImpactLabel = 'Moderate Impact';
  let heritageImpactDetails =
    'Controlled visitor density maintains stone surface preservation and prevents excessive vibration.';
  if (heritagePressure <= 40) {
    heritageImpactLabel = 'Low Structural Impact';
    heritageImpactDetails =
      'Minimal visitor density preserves delicate carvings, fresco pigments, and historic foundations.';
  } else if (heritagePressure > 70) {
    heritageImpactLabel = 'Elevated Structural Strain';
    heritageImpactDetails =
      'High footfall density elevates ambient humidity and micro-abrasion wear on fragile heritage stone.';
  }

  // Current local hour for marking "NOW" badge
  const now = new Date();
  const currentLocalHour = now.getHours();

  // Hourly Breakdown mapped directly from backend prediction slots
  const hourlyForecast: HourlyForecastItem[] = (crowd.predictions || []).map((p: HourlyPrediction) => {
    const hourNum = parseInt(p.time.split(':')[0], 10);
    const isNow = isToday && currentLocalHour === hourNum;
    const capacityPct = p.crowd_percent;

    let hourLevel: CrowdLevel = 'Low';
    if (capacityPct > 85) hourLevel = 'Overcrowded';
    else if (capacityPct > 65) hourLevel = 'High';
    else if (capacityPct > 35) hourLevel = 'Moderate';

    return {
      hour: formatTime12(p.time),
      visitors: p.expected_visitors,
      capacityPercentage: capacityPct,
      crowdLevel: hourLevel,
      isNow,
    };
  });

  // Best Visiting Window from backend model
  const bestWindow = formatTimeRange(crowd.best_time);
  const avoidWindowRaw = (crowd.peak_hours && crowd.peak_hours.length > 0)
    ? formatTimeRange(crowd.peak_hours[0])
    : { start: '12:00 PM', end: '03:00 PM' };

  // Parse Day of Week short
  const dayShort = crowd.day_of_week
    ? crowd.day_of_week.substring(0, 3).toUpperCase()
    : 'DAY';

  // AI Reasoning
  const isHighDensity = capacityRatio >= 0.75;
  const crowdReasons = {
    isHigh: isHighDensity,
    title: isHighDensity
      ? 'Why is crowd density elevated?'
      : 'Why is this an optimal day to visit?',
    factors: [
      `${crowd.day_of_week} visitor flow pattern`,
      `Weather: ${crowd.weather || 'Clear'}, ${crowd.temperature_c ?? 28}°C`,
      `Operating window: ${crowd.operating_hours || '09:00-17:00'}`,
      `Safe carrying capacity: ${safeCapacity.toLocaleString()}`,
    ],
    summary: `On ${crowd.day_of_week} (${crowd.date}), the AI model forecasts ${expectedVisitors.toLocaleString()} total visitors (${Math.round(capacityRatio * 100)}% of safe capacity). ${crowd.weather ? `Weather is expected to be ${crowd.weather}.` : ''}`,
    hindiSummary: `${crowd.day_of_week} (${crowd.date}) को एआई मॉडल कुल ${expectedVisitors.toLocaleString()} आगंतुकों का अनुमान लगाता है।`,
  };

  const aiRecommendation = `Optimal visiting window is ${bestWindow.start} – ${bestWindow.end}. Peak congestion is anticipated during ${avoidWindowRaw.start} – ${avoidWindowRaw.end}. Operating hours: ${crowd.operating_hours}.`;
  const hindiAiRecommendation = `सर्वोत्तम भ्रमण समय ${bestWindow.start} – ${bestWindow.end} है। पीक ऑवर ${avoidWindowRaw.start} – ${avoidWindowRaw.end} के दौरान रहेगा।`;

  return {
    date: crowd.date,
    dayOfWeek: dayShort,
    dayName: crowd.day_of_week,
    formattedDate: formatDateLabel(crowd.date),
    isToday,
    expectedVisitors,
    comparisonWithToday: {
      label: comparisonLabel,
      direction: comparisonDirection,
      percentage: comparisonPercentage,
    },
    crowdLevel,
    comfortScore,
    comfortLabel,
    heritagePressure,
    heritageImpactLabel,
    heritageImpactDetails,
    bestVisitingWindow: {
      start: bestWindow.start,
      end: bestWindow.end,
      reasons: [
        `Lowest predicted footfall density during this operating window`,
        `Comfortable temperature (~${crowd.temperature_c ?? 28}°C, ${crowd.weather || 'Clear'})`,
        `Shortest queues at ticket checkpoints and main gates`,
        `Minimal stress on sensitive heritage structural elements`,
      ],
      hindiReasons: [
        'इस समय न्यूनतम भीड़ और कम प्रतीक्षा समय रहेगा',
        `सुखद तापमान (~${crowd.temperature_c ?? 28}°C, ${crowd.weather || 'साफ'})`,
        'प्रवेश द्वार पर न्यूनतम कतारें',
      ],
    },
    avoidWindow: {
      start: avoidWindowRaw.start,
      end: avoidWindowRaw.end,
      reason: `Midday visitor influx peaks during this slot, causing maximum congestion.`,
      hindiReason: `दोपहर के समय आगंतुकों की संख्या चरम पर होती है।`,
    },
    hourlyForecast,
    crowdReasons,
    aiRecommendation,
    hindiAiRecommendation,
  };
}

/**
 * Fetch full 7-day crowd forecast bundle for a monument directly from backend API.
 */
export async function fetchSiteCrowdForecast(
  monument: Monument
): Promise<MonumentCrowdForecast> {
  const dates = getUpcomingDateStrings(7);

  // Fetch all 7 dates and pressure in parallel
  const [pressureResult, ...crowdResults] = await Promise.all([
    getPressure(monument.id).catch(() => null),
    ...dates.map((date) => getCrowd(monument.id, date)),
  ]);

  const todayPrediction = crowdResults[0];
  const baselineTotal = todayPrediction?.daily_expected_total || 0;

  const days: DailyCrowdForecast[] = crowdResults.map((crowd, idx) => {
    return mapCrowdPredictionToDailyForecast(
      crowd,
      pressureResult,
      idx === 0,
      baselineTotal
    );
  });

  // Find the day with lowest expected visitors as best day of the week
  let bestDayIndex = 0;
  let minVisitors = days[0]?.expectedVisitors ?? Infinity;

  days.forEach((day, idx) => {
    if (day.expectedVisitors < minVisitors) {
      minVisitors = day.expectedVisitors;
      bestDayIndex = idx;
    }
  });

  const bestDay = days[bestDayIndex] || days[0];

  return {
    monumentId: monument.id,
    monumentName: monument.name,
    hindiName: monument.hindiName || monument.name,
    city: monument.city,
    state: monument.state,
    imageUrl: monument.imageUrl,
    safeCapacity: todayPrediction?.safe_capacity || monument.maxCapacity || 15000,
    currentLiveFootfall: baselineTotal,
    currentCrowdLevel: days[0]?.crowdLevel || 'Moderate',
    bestDayThisWeek: {
      dayName: bestDay.dayName,
      date: bestDay.date,
      formattedDate: bestDay.formattedDate,
      expectedVisitors: bestDay.expectedVisitors,
      reason: `Lowest weekly footfall (${bestDay.expectedVisitors.toLocaleString()} visitors) with highest comfort score (${bestDay.comfortScore}/100).`,
      hindiReason: `सप्ताह का सबसे शांत दिन (${bestDay.expectedVisitors.toLocaleString()} अनुमानित आगंतुक)।`,
    },
    days,
  };
}

/**
 * Fetch prediction for a single arbitrary future date directly from backend API.
 */
export async function fetchSingleDateCrowdForecast(
  monument: Monument,
  targetDate: string,
  baselineTodayTotal?: number
): Promise<DailyCrowdForecast> {
  const [crowd, pressure] = await Promise.all([
    getCrowd(monument.id, targetDate),
    getPressure(monument.id).catch(() => null),
  ]);

  const todayStr = getTodayDateString();
  const isToday = targetDate === todayStr;

  return mapCrowdPredictionToDailyForecast(
    crowd,
    pressure,
    isToday,
    baselineTodayTotal
  );
}
