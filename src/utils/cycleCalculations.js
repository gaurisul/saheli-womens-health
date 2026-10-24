import { formatDate } from '../data/sampleProfiles';

/**
 * Parses YYYY-MM-DD date string to a UTC/local normalized Date object.
 */
export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculates day difference between two YYYY-MM-DD date strings (d2 - d1).
 */
export function getDaysDiff(d1Str, d2Str) {
  const date1 = parseDate(d1Str);
  const date2 = parseDate(d2Str);
  const diffTime = date2.getTime() - date1.getTime();
  return Math.round(diffTime / (1000 * 3600 * 24));
}

/**
 * Finds all period start dates in chronological order from logs.
 * A period start is defined as:
 * - A day with bleeding (Light, Medium, Heavy) where the day before was NOT bleeding (None, Spotting, or unlogged)
 * - Or a day explicitly logged as cycleDay 1 with bleeding.
 */
export function findPeriodStarts(logs = {}) {
  const sortedDates = Object.keys(logs).sort();
  const periodStarts = [];

  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = sortedDates[i];
    const entry = logs[dateStr];
    const isBleeding = entry?.bleeding && entry.bleeding !== 'None' && entry.bleeding !== 'Spotting';

    if (isBleeding) {
      if (entry?.cycleDay === 1) {
        periodStarts.push(dateStr);
        continue;
      }
      
      // Check previous day
      const prevDate = new Date(parseDate(dateStr));
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = formatDate(prevDate);
      const prevEntry = logs[prevDateStr];
      const prevWasBleeding = prevEntry?.bleeding && prevEntry.bleeding !== 'None' && prevEntry.bleeding !== 'Spotting';

      if (!prevWasBleeding) {
        periodStarts.push(dateStr);
      }
    }
  }

  return periodStarts;
}

/**
 * Calculates cycle day and phase for a given date string, aligned with actual logs.
 */
export function calculateCycleDayForDate(targetDateStr, logs = {}, profile = {}) {
  const typicalCycleLength = Number(profile.typicalCycleLength) || 28;
  const typicalPeriodLength = Number(profile.typicalPeriodLength) || 5;

  // 1. If this exact date was logged with a specified cycleDay, respect it
  if (logs[targetDateStr]?.cycleDay) {
    const cycleDay = Number(logs[targetDateStr].cycleDay);
    const phaseInfo = getPhaseInfo(cycleDay, typicalCycleLength, typicalPeriodLength);
    return {
      cycleDay,
      ...phaseInfo,
      isExplicit: true,
      isEstimated: false
    };
  }

  // 2. Look for the most recent period start before or on targetDateStr
  const periodStarts = findPeriodStarts(logs);
  const precedingStarts = periodStarts.filter((startDate) => startDate <= targetDateStr);

  if (precedingStarts.length > 0) {
    const latestStart = precedingStarts[precedingStarts.length - 1];
    const diff = getDaysDiff(latestStart, targetDateStr);
    const cycleDay = diff + 1; // Day 1 on start date
    const phaseInfo = getPhaseInfo(cycleDay, typicalCycleLength, typicalPeriodLength);
    return {
      cycleDay,
      ...phaseInfo,
      isExplicit: false,
      isEstimated: cycleDay > typicalCycleLength,
      referencePeriodStart: latestStart
    };
  }

  // 3. Fallback: use baseline profile's currentCycleDay relative to today
  const todayStr = formatDate(new Date());
  const baselineCycleDay = Number(profile.currentCycleDay) || 1;
  const diffFromToday = getDaysDiff(todayStr, targetDateStr);

  let calculatedDay = ((baselineCycleDay + diffFromToday - 1) % typicalCycleLength) + 1;
  if (calculatedDay <= 0) {
    calculatedDay += typicalCycleLength;
  }

  const phaseInfo = getPhaseInfo(calculatedDay, typicalCycleLength, typicalPeriodLength);
  return {
    cycleDay: calculatedDay,
    ...phaseInfo,
    isExplicit: false,
    isEstimated: true
  };
}

/**
 * Returns phase details for a cycle day.
 */
export function getPhaseInfo(cycleDay, typicalCycleLength = 28, typicalPeriodLength = 5) {
  const ovulationDay = Math.max(typicalPeriodLength + 2, typicalCycleLength - 14);
  const fertileStart = Math.max(typicalPeriodLength + 1, ovulationDay - 3);
  const fertileEnd = Math.min(typicalCycleLength - 1, ovulationDay + 1);

  if (cycleDay <= typicalPeriodLength) {
    return {
      phase: 'Menstrual Phase',
      phaseDescription: 'Uterine lining shedding. Estrogen and progesterone are at baseline levels.'
    };
  } else if (cycleDay < fertileStart) {
    return {
      phase: 'Follicular Phase',
      phaseDescription: 'Rising estrogen stimulates follicle development and builds endometrial lining.'
    };
  } else if (cycleDay <= fertileEnd) {
    return {
      phase: 'Ovulatory Window',
      phaseDescription: 'LH surge triggers egg release. Peak fertility and possible ovulatory sensation (mittelschmerz).'
    };
  } else if (cycleDay <= typicalCycleLength) {
    return {
      phase: 'Luteal Phase',
      phaseDescription: 'Corpus luteum produces progesterone. Pre-menstrual vulnerability to cramps and mood shifts.'
    };
  } else {
    return {
      phase: 'Extended / Delayed Cycle',
      phaseDescription: `Cycle day ${cycleDay} exceeds estimated ${typicalCycleLength} days. Natural variations occur with stress, illness, or hormonal shifts.`
    };
  }
}

/**
 * Calculates estimated next period date with confidence note.
 */
export function getEstimatedNextPeriod(logs = {}, profile = {}, referenceDateStr = formatDate(new Date())) {
  const typicalCycleLength = Number(profile.typicalCycleLength) || 28;
  const periodStarts = findPeriodStarts(logs);
  
  let lastStartStr;
  if (periodStarts.length > 0) {
    lastStartStr = periodStarts[periodStarts.length - 1];
  } else {
    // derive hypothetical start from currentCycleDay
    const baselineCycleDay = Number(profile.currentCycleDay) || 1;
    const refDate = parseDate(referenceDateStr);
    refDate.setDate(refDate.getDate() - (baselineCycleDay - 1));
    lastStartStr = formatDate(refDate);
  }

  const estNextDate = parseDate(lastStartStr);
  estNextDate.setDate(estNextDate.getDate() + typicalCycleLength);
  const estNextDateStr = formatDate(estNextDate);
  const daysUntil = getDaysDiff(referenceDateStr, estNextDateStr);

  return {
    estimatedDate: estNextDateStr,
    daysUntil: Math.max(0, daysUntil),
    formattedDate: estNextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    note: 'Period timing is an estimate; natural variations of ±2 to 4 days are typical.'
  };
}

/**
 * Calculates comprehensive metrics strictly from saved logs.
 */
export function computeSummaryMetricsFromLogs(logs = {}) {
  const entries = Object.values(logs);
  const totalEntries = entries.length;

  if (totalEntries === 0) {
    return {
      totalLoggedDays: 0,
      dateRange: null,
      averagePainScore: '0.0',
      severePainDaysCount: 0,
      moderatePainDaysCount: 0,
      heavyFlowDaysCount: 0,
      functionalImpactDaysCount: 0,
      impactTypesBreakdown: {},
      mostFrequentSymptoms: [],
      trackedCyclesCount: 0
    };
  }

  const sortedDates = Object.keys(logs).sort();
  const dateRange = {
    start: sortedDates[0],
    end: sortedDates[sortedDates.length - 1]
  };

  const painScores = entries.map((e) => Number(e.painScore) || 0);
  const totalPain = painScores.reduce((a, b) => a + b, 0);
  const averagePainScore = (totalPain / totalEntries).toFixed(1);

  const severePainDaysCount = entries.filter((e) => (Number(e.painScore) || 0) >= 7).length;
  const moderatePainDaysCount = entries.filter((e) => {
    const p = Number(e.painScore) || 0;
    return p >= 4 && p < 7;
  }).length;

  const heavyFlowDaysCount = entries.filter((e) => e.bleeding === 'Heavy').length;
  const functionalImpactDaysCount = entries.filter((e) => e.functionalImpact === true).length;

  // Breakdown of functional impact types
  const impactTypesBreakdown = {};
  entries.forEach((e) => {
    if (e.functionalImpact && Array.isArray(e.impactTypes)) {
      e.impactTypes.forEach((type) => {
        impactTypesBreakdown[type] = (impactTypesBreakdown[type] || 0) + 1;
      });
    }
  });

  // Symptom frequencies
  const symptomMap = {};
  entries.forEach((e) => {
    if (Array.isArray(e.symptoms)) {
      e.symptoms.forEach((s) => {
        symptomMap[s] = (symptomMap[s] || 0) + 1;
      });
    }
  });

  const mostFrequentSymptoms = Object.entries(symptomMap)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / totalEntries) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const periodStarts = findPeriodStarts(logs);
  const trackedCyclesCount = Math.max(1, periodStarts.length);

  return {
    totalLoggedDays: totalEntries,
    dateRange,
    averagePainScore,
    severePainDaysCount,
    moderatePainDaysCount,
    heavyFlowDaysCount,
    functionalImpactDaysCount,
    impactTypesBreakdown,
    mostFrequentSymptoms,
    trackedCyclesCount
  };
}
