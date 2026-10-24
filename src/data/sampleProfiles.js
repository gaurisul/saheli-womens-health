// Helper to format date strings YYYY-MM-DD
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOffsetDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return formatDate(d);
}

// Amara K.: Endometriosis & Iron Deficiency Pattern (Mira Primary Showcase)
function generateAmaraLogs() {
  const logs = {};
  // Current cycle: Oct 7 was Day 1 (17 days ago, so Day 18 is today)
  const currentCycleStartOffset = -17; // Day 1 was 17 days ago

  // Days 1-6: Menstrual Period (Heavy flow days 1-5, severe pelvic pain 7-8/10)
  // Day 1 (Oct 7)
  logs[getOffsetDate(currentCycleStartOffset)] = {
    date: getOffsetDate(currentCycleStartOffset),
    cycleDay: 1,
    bleeding: 'Heavy',
    painScore: 8,
    functionalImpact: true,
    impactTypes: ['Missed work or plans', 'Stayed in bed'],
    symptoms: ['Cramps', 'Pelvic pain', 'Fatigue', 'Bloating'],
    energyRating: 1,
    moodRating: 2,
    notes: 'Severe pelvic cramping, day 1 of menses. Had to stay in bed.'
  };

  // Day 2 (Oct 8)
  logs[getOffsetDate(currentCycleStartOffset + 1)] = {
    date: getOffsetDate(currentCycleStartOffset + 1),
    cycleDay: 2,
    bleeding: 'Heavy',
    painScore: 8,
    functionalImpact: true,
    impactTypes: ['Missed work or plans', 'Stayed in bed'],
    symptoms: ['Cramps', 'Pelvic pain', 'Painful bowel movements', 'Fatigue'],
    energyRating: 1,
    moodRating: 1,
    notes: 'Painful bowel movements during period. Heavy bleeding.'
  };

  // Day 3 (Oct 9)
  logs[getOffsetDate(currentCycleStartOffset + 2)] = {
    date: getOffsetDate(currentCycleStartOffset + 2),
    cycleDay: 3,
    bleeding: 'Heavy',
    painScore: 7,
    functionalImpact: true,
    impactTypes: ['Missed work or plans'],
    symptoms: ['Cramps', 'Pelvic pain', 'Fatigue', 'Back pain', 'Bloating'],
    energyRating: 1,
    moodRating: 2,
    notes: 'Severe pelvic pain. Heavy flow continues.'
  };

  // Day 4 (Oct 10)
  logs[getOffsetDate(currentCycleStartOffset + 3)] = {
    date: getOffsetDate(currentCycleStartOffset + 3),
    cycleDay: 4,
    bleeding: 'Heavy',
    painScore: 5,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Pelvic pain', 'Fatigue', 'Headache'],
    energyRating: 2,
    moodRating: 2,
    notes: 'Flow still surprisingly heavy for day 4.'
  };

  // Day 5 (Oct 11)
  logs[getOffsetDate(currentCycleStartOffset + 4)] = {
    date: getOffsetDate(currentCycleStartOffset + 4),
    cycleDay: 5,
    bleeding: 'Heavy',
    painScore: 4,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Pelvic pain', 'Fatigue', 'Dizziness'],
    energyRating: 2,
    moodRating: 3,
    notes: 'Dizziness standing up after lunch.'
  };

  // Day 6 (Oct 12)
  logs[getOffsetDate(currentCycleStartOffset + 5)] = {
    date: getOffsetDate(currentCycleStartOffset + 5),
    cycleDay: 6,
    bleeding: 'Spotting',
    painScore: 2,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Bloating', 'Fatigue'],
    energyRating: 3,
    moodRating: 3,
    notes: 'Bleeding finally tapering.'
  };

  // Days 7 to 17 (Follicular & Ovulation)
  const midSymptoms = [
    ['Fatigue', 'Brain fog'],
    ['Feeling cold', 'Fatigue'],
    ['Hair shedding', 'Fatigue'],
    ['Headache', 'Bloating'],
    ['Pelvic pain', 'Bloating'], // Ovulation flare around day 13-14
    ['Pelvic pain', 'Fatigue'],
    ['Feeling cold', 'Fatigue'],
    ['Low mood', 'Fatigue'],
    ['Bloating', 'Fatigue'],
    ['Hair shedding', 'Cold sensitivity'],
    ['Fatigue', 'Bloating']
  ];

  for (let i = 6; i < 17; i++) {
    const dayNum = i + 1;
    const syms = midSymptoms[i - 6] || ['Fatigue'];
    logs[getOffsetDate(currentCycleStartOffset + i)] = {
      date: getOffsetDate(currentCycleStartOffset + i),
      cycleDay: dayNum,
      bleeding: 'None',
      painScore: dayNum === 13 || dayNum === 14 ? 3 : 1,
      functionalImpact: false,
      impactTypes: [],
      symptoms: syms,
      energyRating: 3,
      moodRating: 3,
      notes: dayNum === 14 ? 'Mild mid-cycle ovulation twinge.' : 'Normal daily routine.'
    };
  }

  // Day 18 (TODAY) - Exactly matching Image 3:
  // Bleeding: None, Pain level: 0, Symptoms: Bloating, Fatigue (2 selected), Energy: Low, Mood: Steady
  logs[getOffsetDate(0)] = {
    date: getOffsetDate(0),
    cycleDay: 18,
    bleeding: 'None',
    painScore: 0,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Bloating', 'Fatigue'],
    energyRating: 2, // Low
    moodRating: 3,   // Steady
    notes: ''
  };

  return logs;
}

// Priya Sharma: Endometriosis / Severe Dysmenorrhea Pattern
// Cycle length: 29 days. Today is Cycle Day 14 (Ovulation window).
function generatePriyaLogs() {
  const logs = {};
  
  // Current cycle: Day 1 was 13 days ago (today = Day 14)
  const currentCycleStartOffset = -13;

  // Day 1 (13 days ago): Heavy bleeding, severe cramps (8/10), bed rest
  logs[getOffsetDate(currentCycleStartOffset)] = {
    date: getOffsetDate(currentCycleStartOffset),
    cycleDay: 1,
    bleeding: 'Heavy',
    painScore: 8,
    functionalImpact: true,
    impactTypes: ['Spent day in bed', 'Missed work/classes', 'Needed prescription painkillers'],
    symptoms: ['Lower abdominal cramps', 'Lower back ache', 'Pelvic pressure', 'Fatigue / low stamina', 'Bloating / abdominal distension'],
    energyRating: 1,
    moodRating: 2,
    notes: 'Severe sharp cramping in lower left quadrant. Had to take 500mg naproxen and cancel work presentation.'
  };

  // Day 2 (12 days ago): Heavy bleeding, severe cramps (8/10), nausea
  logs[getOffsetDate(currentCycleStartOffset + 1)] = {
    date: getOffsetDate(currentCycleStartOffset + 1),
    cycleDay: 2,
    bleeding: 'Heavy',
    painScore: 8,
    functionalImpact: true,
    impactTypes: ['Spent day in bed', 'Reduced activity', 'Needed prescription painkillers'],
    symptoms: ['Lower abdominal cramps', 'Pelvic pressure', 'Pain with bowel movement', 'Nausea', 'Fatigue / low stamina'],
    energyRating: 1,
    moodRating: 1,
    notes: 'Sharp shooting pain with bowel movement this morning. Hot water bottle barely helped.'
  };

  // Day 3 (11 days ago): Medium bleeding, pain 6/10
  logs[getOffsetDate(currentCycleStartOffset + 2)] = {
    date: getOffsetDate(currentCycleStartOffset + 2),
    cycleDay: 3,
    bleeding: 'Medium',
    painScore: 6,
    functionalImpact: true,
    impactTypes: ['Reduced activity'],
    symptoms: ['Lower abdominal cramps', 'Lower back ache', 'Bloating / abdominal distension'],
    energyRating: 2,
    moodRating: 2,
    notes: 'Working from bed. Cramps duller but deep ache in sacrum persists.'
  };

  // Day 4 (10 days ago): Light bleeding, pain 4/10
  logs[getOffsetDate(currentCycleStartOffset + 3)] = {
    date: getOffsetDate(currentCycleStartOffset + 3),
    cycleDay: 4,
    bleeding: 'Light',
    painScore: 4,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Lower back ache', 'Fatigue / low stamina'],
    energyRating: 3,
    moodRating: 3,
    notes: 'Bleeding tapering off. Energy slowly improving.'
  };

  // Day 5 (9 days ago): Spotting, pain 2/10
  logs[getOffsetDate(currentCycleStartOffset + 4)] = {
    date: getOffsetDate(currentCycleStartOffset + 4),
    cycleDay: 5,
    bleeding: 'Spotting',
    painScore: 2,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Mild bloating'],
    energyRating: 3,
    moodRating: 4,
    notes: 'Menses finished. Felt able to take a walk.'
  };

  // Days 6-11 (Follicular phase): Low pain, good energy
  for (let i = 5; i <= 10; i++) {
    const dayNum = i + 1;
    logs[getOffsetDate(currentCycleStartOffset + i)] = {
      date: getOffsetDate(currentCycleStartOffset + i),
      cycleDay: dayNum,
      bleeding: 'None',
      painScore: dayNum === 9 ? 2 : 1,
      functionalImpact: false,
      impactTypes: [],
      symptoms: dayNum === 9 ? ['Mild lower back ache'] : ['Calm & centered'],
      energyRating: 4,
      moodRating: 4,
      notes: 'Follicular phase feeling relatively clear.'
    };
  }

  // Day 12 (1 day ago): Ovulation onset, twinge in right ovary
  logs[getOffsetDate(currentCycleStartOffset + 11)] = {
    date: getOffsetDate(currentCycleStartOffset + 11),
    cycleDay: 12,
    bleeding: 'None',
    painScore: 3,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Ovulation pain / Mittelschmerz', 'Bloating / abdominal distension'],
    energyRating: 4,
    moodRating: 4,
    notes: 'Cervical mucus egg-white texture. Noticeable right side twinge.'
  };

  // Day 13 (yesterday): Ovulation peak pain 5/10
  logs[getOffsetDate(currentCycleStartOffset + 12)] = {
    date: getOffsetDate(currentCycleStartOffset + 12),
    cycleDay: 13,
    bleeding: 'None',
    painScore: 5,
    functionalImpact: true,
    impactTypes: ['Reduced activity'],
    symptoms: ['Ovulation pain / Mittelschmerz', 'Pelvic pressure', 'Lower back ache'],
    energyRating: 3,
    moodRating: 3,
    notes: 'Deep ache during walking and sitting down. Classic mid-cycle pelvic ache.'
  };

  // Day 14 (TODAY):
  logs[getOffsetDate(0)] = {
    date: getOffsetDate(0),
    cycleDay: 14,
    bleeding: 'None',
    painScore: 4,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Ovulation pain / Mittelschmerz', 'Pelvic pressure', 'Calm & centered'],
    energyRating: 3,
    moodRating: 3,
    notes: 'Ovulatory window. Still mild pelvic fullness. Kept hydration up.'
  };

  // Add Previous Cycle (29 days total before current cycle start)
  const prevCycleStartOffset = currentCycleStartOffset - 29;
  // Day 1 of previous cycle: Heavy, pain 8
  logs[getOffsetDate(prevCycleStartOffset)] = {
    date: getOffsetDate(prevCycleStartOffset),
    cycleDay: 1,
    bleeding: 'Heavy',
    painScore: 8,
    functionalImpact: true,
    impactTypes: ['Spent day in bed', 'Missed work/classes'],
    symptoms: ['Lower abdominal cramps', 'Lower back ache', 'Pelvic pressure', 'Nausea'],
    energyRating: 1,
    moodRating: 2,
    notes: 'Debilitating cramps. Took ibuprofen 600mg twice.'
  };
  // Day 2 of previous cycle: Heavy, pain 9
  logs[getOffsetDate(prevCycleStartOffset + 1)] = {
    date: getOffsetDate(prevCycleStartOffset + 1),
    cycleDay: 2,
    bleeding: 'Heavy',
    painScore: 9,
    functionalImpact: true,
    impactTypes: ['Spent day in bed', 'Needed prescription painkillers'],
    symptoms: ['Lower abdominal cramps', 'Pain with bowel movement', 'Dyspareunia / intercourse pain', 'Fatigue / low stamina'],
    energyRating: 1,
    moodRating: 1,
    notes: 'Extremely painful defecation and severe stabbing pelvic pain.'
  };
  // Day 14 of previous cycle: Midcycle ovulation pain 6
  logs[getOffsetDate(prevCycleStartOffset + 13)] = {
    date: getOffsetDate(prevCycleStartOffset + 13),
    cycleDay: 14,
    bleeding: 'None',
    painScore: 6,
    functionalImpact: true,
    impactTypes: ['Reduced activity'],
    symptoms: ['Ovulation pain / Mittelschmerz', 'Pelvic pressure'],
    energyRating: 3,
    moodRating: 3,
    notes: 'Sharp mid-cycle pain on left side this time.'
  };

  return logs;
}

// Ananya Sen: PCOS / Irregular Cycles / Hyperandrogenism Pattern
function generateAnanyaLogs() {
  const logs = {};
  // Current cycle: Day 1 was 37 days ago (long 42-day cycle pattern)
  const cycleStartOffset = -36;

  // Day 1 (36 days ago)
  logs[getOffsetDate(cycleStartOffset)] = {
    date: getOffsetDate(cycleStartOffset),
    cycleDay: 1,
    bleeding: 'Light',
    painScore: 3,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Lower abdominal cramps', 'Hormonal acne flare', 'Fatigue / low stamina'],
    energyRating: 2,
    moodRating: 2,
    notes: 'Period started after 41 days of waiting. Dark brownish flow.'
  };

  // Day 2: Medium
  logs[getOffsetDate(cycleStartOffset + 1)] = {
    date: getOffsetDate(cycleStartOffset + 1),
    cycleDay: 2,
    bleeding: 'Medium',
    painScore: 4,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Lower abdominal cramps', 'Bloating / abdominal distension', 'Hormonal acne flare'],
    energyRating: 2,
    moodRating: 2,
    notes: 'Cramping manageable. Cystic acne along jawline flared up.'
  };

  // Scattered logs across the long follicular phase showing persistent acne, hirsutism, insulin-related cravings
  const samplePoints = [5, 10, 15, 20, 25, 30, 35, 36];
  samplePoints.forEach((offset, idx) => {
    const day = offset + 1;
    logs[getOffsetDate(cycleStartOffset + offset)] = {
      date: getOffsetDate(cycleStartOffset + offset),
      cycleDay: day,
      bleeding: day <= 4 ? (day <= 2 ? 'Medium' : 'Light') : 'None',
      painScore: day > 4 ? 1 : 4,
      functionalImpact: false,
      impactTypes: [],
      symptoms: ['Hormonal acne flare', 'Unwanted facial hair', 'Bloating / abdominal distension', 'Food cravings'],
      energyRating: idx % 2 === 0 ? 2 : 3,
      moodRating: idx % 2 === 0 ? 2 : 3,
      notes: `Cycle day ${day}. Still waiting for ovulation. Significant sugar cravings and chin hair regrowth.`
    };
  });

  // Today (Day 37 of current cycle)
  logs[getOffsetDate(0)] = {
    date: getOffsetDate(0),
    cycleDay: 37,
    bleeding: 'None',
    painScore: 2,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Hormonal acne flare', 'Unwanted facial hair', 'Bloating / abdominal distension', 'Brain fog'],
    energyRating: 2,
    moodRating: 2,
    notes: 'Day 37 without clear ovulation signs. Persistent fatigue and jawline cystic breakout.'
  };

  return logs;
}

// Meera Patel: Heavy Menstrual Bleeding & Iron Deficiency Anaemia Pattern
function generateMeeraLogs() {
  const logs = {};
  // Current cycle: Day 1 was 4 days ago (Day 5 today)
  const cycleStartOffset = -4;

  // Day 1: Heavy, flooding
  logs[getOffsetDate(cycleStartOffset)] = {
    date: getOffsetDate(cycleStartOffset),
    cycleDay: 1,
    bleeding: 'Heavy',
    painScore: 5,
    functionalImpact: true,
    impactTypes: ['Reduced activity', 'Spent day in bed'],
    symptoms: ['Fatigue / low stamina', 'Brain fog', 'Drowsiness', 'Lower abdominal cramps'],
    energyRating: 1,
    moodRating: 2,
    notes: 'Soaked through two super tampons in 3 hours. Extreme dizziness when standing up.'
  };

  // Day 2: Heavy, flooding
  logs[getOffsetDate(cycleStartOffset + 1)] = {
    date: getOffsetDate(cycleStartOffset + 1),
    cycleDay: 2,
    bleeding: 'Heavy',
    painScore: 6,
    functionalImpact: true,
    impactTypes: ['Missed work/classes', 'Spent day in bed'],
    symptoms: ['Fatigue / low stamina', 'Drowsiness', 'Brain fog', 'Pelvic pressure'],
    energyRating: 1,
    moodRating: 1,
    notes: 'Passed large clots (size of quarter). Felt breathless just walking up the stairs.'
  };

  // Day 3: Heavy
  logs[getOffsetDate(cycleStartOffset + 2)] = {
    date: getOffsetDate(cycleStartOffset + 2),
    cycleDay: 3,
    bleeding: 'Heavy',
    painScore: 4,
    functionalImpact: true,
    impactTypes: ['Reduced activity'],
    symptoms: ['Fatigue / low stamina', 'Brain fog', 'Morning stiffness'],
    energyRating: 1,
    moodRating: 2,
    notes: 'Third consecutive heavy day. Cold hands and feet, heart pounding with light walking.'
  };

  // Day 4: Medium
  logs[getOffsetDate(cycleStartOffset + 3)] = {
    date: getOffsetDate(cycleStartOffset + 3),
    cycleDay: 4,
    bleeding: 'Medium',
    painScore: 3,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Fatigue / low stamina', 'Brain fog'],
    energyRating: 2,
    moodRating: 2,
    notes: 'Bleeding slowing slightly. Persistent mental fog and weakness.'
  };

  // Today (Day 5)
  logs[getOffsetDate(0)] = {
    date: getOffsetDate(0),
    cycleDay: 5,
    bleeding: 'Light',
    painScore: 2,
    functionalImpact: false,
    impactTypes: [],
    symptoms: ['Fatigue / low stamina', 'Brain fog'],
    energyRating: 2,
    moodRating: 3,
    notes: 'Day 5. Flow finally light. Still feeling drained and pale.'
  };

  return logs;
}

export const DEFAULT_CONSENT_SETTINGS = {
  includeName: true,
  includeAge: true,
  includeNotes: true,
  includeMood: true,
  includeTrends: true
};

export const SAMPLE_PROFILES = {
  amara: {
    id: 'amara',
    name: 'Amara K.',
    age: 31,
    typicalCycleLength: 29,
    typicalPeriodLength: 6,
    upcomingVisitDate: '2026-11-03',
    doctorName: 'Dr. Ngozi Okafor, MD (OB/GYN)',
    primaryPatternFocus: 'Severe cyclical pelvic pain',
    summaryBio: '31-year-old experiencing severe pelvic pain (7–8/10) on days 1–3 of menstruation, with catamenial bowel discomfort and functional disruption. Heavy flow has increased over recent cycles alongside persistent fatigue.',
    currentCycleDay: 18,
    currentPhase: 'Luteal Phase',
    consentSettings: { ...DEFAULT_CONSENT_SETTINGS },
    logs: generateAmaraLogs(),
    customQuestions: [
      { id: 'q1', text: 'Could my cyclical pelvic pain and bowel discomfort be consistent with endometriosis?', inReport: true },
      { id: 'q2', text: 'Could multiple heavy bleeding days be causing depleted ferritin or iron deficiency?', inReport: true },
      { id: 'q3', text: 'Would a specialized deep-endometriosis ultrasound mapping or MRI be recommended?', inReport: true },
      { id: 'q4', text: 'What medical pain management strategies exist beyond standard over-the-counter NSAIDs?', inReport: true }
    ]
  },
  priya: {
    id: 'priya',
    name: 'Priya Sharma',
    age: 28,
    typicalCycleLength: 29,
    typicalPeriodLength: 5,
    upcomingVisitDate: '2026-11-04',
    doctorName: 'Dr. Sunita Rao, MD (OB/GYN)',
    primaryPatternFocus: 'Endometriosis-related pattern',
    summaryBio: '28-year-old software engineer experiencing escalating cyclic pelvic pain, mid-cycle ovulatory twinges, and pain during bowel movements during menses. Preparing for upcoming gynecology consultation.',
    currentCycleDay: 14,
    currentPhase: 'Ovulatory Window',
    consentSettings: { ...DEFAULT_CONSENT_SETTINGS },
    logs: generatePriyaLogs(),
    customQuestions: [
      { id: 'q1', text: 'Could my cyclic pelvic pain and mid-cycle ovulation flare indicate peritoneal or deep endometriosis?', inReport: true },
      { id: 'q2', text: 'Would a specialized transvaginal pelvic ultrasound (mapping scan) or MRI be appropriate rather than only standard pelvic ultrasound?', inReport: true },
      { id: 'q3', text: 'Should we trial cyclic or continuous progestin therapy before considering diagnostic laparoscopy?', inReport: true }
    ]
  },
  ananya: {
    id: 'ananya',
    name: 'Ananya Sen',
    age: 24,
    typicalCycleLength: 40,
    typicalPeriodLength: 4,
    upcomingVisitDate: '2026-11-12',
    doctorName: 'Dr. Kavita Verma, Reproductive Endocrinologist',
    primaryPatternFocus: 'PCOS-related pattern',
    summaryBio: '24-year-old student tracking irregular cycles (35-45 days), delayed ovulation, stubborn hormonal cystic acne along the jawline, and mild hirsutism.',
    currentCycleDay: 37,
    currentPhase: 'Extended Follicular Phase',
    consentSettings: { ...DEFAULT_CONSENT_SETTINGS },
    logs: generateAnanyaLogs(),
    customQuestions: [
      { id: 'q1', text: 'Given my 35-45 day cycle variation and persistent cystic acne, do I meet the Rotterdam criteria for PCOS?', inReport: true },
      { id: 'q2', text: 'Could we test fasting insulin, fasting glucose, HOMA-IR, and a morning androgen panel (free testosterone, DHEA-S)?', inReport: true },
      { id: 'q3', text: 'What lifestyle and inositol or medication protocols would you recommend to regulate ovulation?', inReport: true }
    ]
  },
  meera: {
    id: 'meera',
    name: 'Meera Patel',
    age: 34,
    typicalCycleLength: 28,
    typicalPeriodLength: 6,
    upcomingVisitDate: '2026-11-08',
    doctorName: 'Dr. Anita Joshi, General Practitioner',
    primaryPatternFocus: 'Anaemia / Heavy Bleeding pattern',
    summaryBio: '34-year-old teacher presenting with 3+ days of heavy flooding menses, blood clots, profound exhaustion, cold intolerance, and exertional breathlessness.',
    currentCycleDay: 5,
    currentPhase: 'Late Menstrual Phase',
    consentSettings: { ...DEFAULT_CONSENT_SETTINGS },
    logs: generateMeeraLogs(),
    customQuestions: [
      { id: 'q1', text: 'Given that I soak through protection rapidly for 3 consecutive days, does this meet criteria for Menorrhagia (Heavy Menstrual Bleeding)?', inReport: true },
      { id: 'q2', text: 'Could we test a complete blood count (CBC), serum ferritin, and transferrin saturation to evaluate iron-deficiency anaemia?', inReport: true },
      { id: 'q3', text: 'Would tranexamic acid, hormonal IUD, or oral iron therapy be suitable to preserve iron stores?', inReport: true }
    ]
  },
  guest: {
    id: 'guest',
    name: 'Personal Diary',
    age: '',
    typicalCycleLength: 28,
    typicalPeriodLength: 5,
    upcomingVisitDate: '',
    doctorName: '',
    primaryPatternFocus: 'Personal Symptom Diary',
    summaryBio: 'Private symptom diary. Log your daily physical sensations, pain severity, and flow to generate an evidence-based clinical briefing.',
    currentCycleDay: 1,
    currentPhase: 'Menstrual Phase',
    consentSettings: { ...DEFAULT_CONSENT_SETTINGS },
    logs: {},
    customQuestions: [
      { id: 'q1', text: 'How does my symptom frequency and flow intensity compare to expected menstrual norms?', inReport: true },
      { id: 'q2', text: 'Are there specific baseline diagnostic blood tests or imaging studies we should consider?', inReport: true }
    ]
  }
};
