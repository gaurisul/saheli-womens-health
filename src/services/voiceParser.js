/**
 * Saheli Voice Symptom Parser (Rule-Based, Non-Diagnostic)
 * 
 * Languages supported:
 * - English (en-IN)
 * - Hindi (hi-IN) - Devanagari & Hinglish
 * - Marathi (mr-IN) - Devanagari
 * 
 * STRICT ARCHITECTURE RULES:
 * 1. Pure rule-based parsing with zero external APIs and zero LLMs.
 * 2. Only an EXPLICIT number (digit, spelled word, Devanagari digit) can set painScore to 9 or 10.
 *    Severity phrases like "severe" or "bohot dard" can suggest at most 7-8, and must be marked "estimated".
 * 3. Only accept a pain number when a pain word ("pain", "cramp", "dard", "दर्द", "वेदना", "traas")
 *    or "score"/"out of 10" is nearby. Do not parse "3 days", "2 pads", "ek din" as pain.
 * 4. Return only fields the user actually mentioned. Never reset or overwrite unmentioned fields.
 * 5. Handle negation ("no fever", "dard nahi hai") so negated symptoms/pain are never falsely asserted.
 * 6. Mentions of fever go into notes (positive mentions only; negated ones ignored).
 * 7. Normalize input before matching: Unicode NFC, strip zero-width characters (U+200B-U+200D, U+FEFF).
 */

// Normalizes text: Unicode NFC and strips zero-width spaces / joiners
export function normalizeTranscript(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

// Devanagari digit characters to standard Arabic digits
const DEVANAGARI_DIGITS = {
  '०': 0, '१': 1, '२': 2, '३': 3, '४': 4,
  '५': 5, '६': 6, '७': 7, '८': 8, '९': 9
};

// Spelled-out number words across English, Hindi (Devanagari + Hinglish), and Marathi
const SPELLED_NUMBERS = {
  // English
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
  'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  // Hindi (Devanagari)
  'शून्य': 0, 'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4,
  'पांच': 5, 'पाँच': 5, 'छह': 6, 'छः': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  // Hinglish
  'shunya': 0, 'ek': 1, 'do': 2, 'teen': 3, 'tin': 3, 'chaar': 4, 'char': 4,
  'paanch': 5, 'panch': 5, 'chhah': 6, 'chhe': 6, 'saat': 7, 'sat': 7, 'aath': 8, 'ath': 8,
  'nau': 9, 'no': 9, 'das': 10, 'dus': 10,
  // Marathi (Devanagari)
  'दोन': 2, 'पाच': 5, 'सहा': 6, 'नऊ': 9, 'दहा': 10
};

// Converts a string token or number into an integer 0-10 if valid
function parseTokenAsNumber(token) {
  if (!token) return null;
  const lower = token.toLowerCase();

  // Single or two Devanagari digits (e.g. १०)
  if (token === '१०') return 10;
  if (token.length === 1 && DEVANAGARI_DIGITS[token] !== undefined) {
    return DEVANAGARI_DIGITS[token];
  }

  // Spelled numbers
  if (SPELLED_NUMBERS[lower] !== undefined) {
    return SPELLED_NUMBERS[lower];
  }

  // Standard Arabic digits
  if (/^\d+$/.test(token)) {
    const n = parseInt(token, 10);
    if (n >= 0 && n <= 10) return n;
  }

  return null;
}

// Negation patterns across languages
const NEGATION_WORDS = [
  'no', 'not', 'none', 'without', 'zero', 'never', 'free of', "don't have", "didn't have",
  'nahi', 'nahin', 'na', 'mat', 'bina', 'नहीं', 'नहीं है', 'ना',
  'nahi hai', 'navhate', 'naslele', 'नसल्यामुळे', 'नव्हते', 'नाही', 'नाहीत'
];

// Checks if a phrase is preceded or followed within 3-4 words by a negation term
function isNegated(text, matchIndex, matchLength) {
  const windowSize = 25; // characters before or after
  let beforeSnippet = text.slice(Math.max(0, matchIndex - windowSize), matchIndex).toLowerCase();
  let afterSnippet = text.slice(matchIndex + matchLength, matchIndex + matchLength + windowSize).toLowerCase();

  // Clause boundary reset: if a comma, semicolon, period, or conjunction ('and', 'but', 'aur', 'par')
  // sits between the negation and the target phrase, do NOT leak negation across clauses!
  const lastClauseBreak = Math.max(
    beforeSnippet.lastIndexOf(','),
    beforeSnippet.lastIndexOf(';'),
    beforeSnippet.lastIndexOf('.'),
    beforeSnippet.lastIndexOf(' and '),
    beforeSnippet.lastIndexOf(' but '),
    beforeSnippet.lastIndexOf(' aur '),
    beforeSnippet.lastIndexOf(' par '),
    beforeSnippet.lastIndexOf(' aani ')
  );
  if (lastClauseBreak !== -1) {
    beforeSnippet = beforeSnippet.slice(lastClauseBreak);
  }

  const firstClauseBreak = afterSnippet.search(/[,;.]|\b(?:and|but|aur|par|aani)\b/);
  if (firstClauseBreak !== -1) {
    afterSnippet = afterSnippet.slice(0, firstClauseBreak);
  }

  return NEGATION_WORDS.some((neg) => {
    const regexBefore = new RegExp(`(?:^|\\s|[.,;])${neg}(?:$|\\s|[.,;])`, 'i');
    const regexAfter = new RegExp(`(?:^|\\s|[.,;])${neg}(?:$|\\s|[.,;])`, 'i');
    return regexBefore.test(beforeSnippet) || regexAfter.test(afterSnippet);
  });
}

/**
 * PAIN PARSER
 * Rules:
 * - Only accept a number if pain keywords or "score" / "out of 10" are nearby.
 * - Non-pain units ("3 days", "2 pads", "4 hours") are guarded against.
 * - Only explicit numbers can set pain to 9 or 10.
 * - Qualitative words ("severe", "bohot dard") can suggest at most 7-8 and are marked "estimated".
 * - "No pain" / "dard nahi hai" sets 0. "No headache" must NOT set 0.
 */
function parsePain(normalizedText) {
  const lower = normalizedText.toLowerCase();

  // 1. Check for explicit general pain negation ("no pain", "zero pain", "dard nahi hai", "traas nahi")
  const generalPainNegationPatterns = [
    /\bno\s+pain\b/i,
    /\bzero\s+pain\b/i,
    /\bpain\s+(?:is\s+)?zero\b/i,
    /\bpain\s+(?:is\s+)?none\b/i,
    /\bdard\s+nahi\b/i,
    /\bdard\s+nahin\b/i,
    /\bpeeda\s+nahi\b/i,
    /\bदर्द\s+नहीं\b/,
    /\bदर्द\s+बिलकुल\s+नहीं\b/,
    /\bवेदना\s+नाही\b/,
    /\bत्रास\s+नाही\b/,
    /\bकाहीही\s+त्रास\s+नाही\b/
  ];

  for (const pat of generalPainNegationPatterns) {
    if (pat.test(lower)) {
      return {
        value: 0,
        isEstimated: false,
        confidence: 'high',
        matchedSnippet: lower.match(pat)[0]
      };
    }
  }

  // 2. Look for numeric score near pain words or "score / 10"
  // Patterns like: "pain is 8", "pain 9", "pain score 7", "8 out of 10", "dard 8 hai", "दर्द 9 है", "8 दर्द"
  const painProximityRegexes = [
    // "pain is 8", "pain score 8", "pain rating 8", "pain level 8"
    /(?:pain|cramp|cramps|ache|aches)\s*(?:(?:score|level|rating|scale|is|was)\s*)*[:=]?\s*([०-९\w\d]+)/i,
    // "8 out of 10", "8/10", "8 out of ten"
    /([०-९\w\d]+)\s*(?:out\s+of\s+(?:10|ten)|(?:\/|\s+by\s+)10)/i,
    // "score 8", "scale 8"
    /(?:score|rating|scale)\s*(?:is|was)?\s*[:=]?\s*([०-९\w\d]+)/i,
    // Hindi / Hinglish: "dard 8", "dard ka score 8", "8 dard"
    /(?:dard|peeda)\s*(?:(?:level|score|hai|ka)\s*)*[:=]?\s*([०-९\w\d]+)/i,
    /([०-९\w\d]+)\s*(?:ka\s+)?(?:dard|peeda)\b/i,
    // Devanagari Hindi: "दर्द 8", "दर्द का स्कोर 8", "8 दर्द", "दर्द ९ है"
    /(?:दर्द|वेदना|कष्ट)\s*(?:का\s+स्कोर|स्कोर|का|लेवल)?\s*[:=]?\s*([०-९\w\d]+)/,
    /([०-९\w\d]+)\s*(?:का\s+)?(?:दर्द|वेदना|कष्ट)\b/,
    // Marathi: "त्रास 8", "8 त्रास", "कळा 8"
    /(?:त्रास|दुखणे|कळा)\s*(?:का|स्कोर)?\s*[:=]?\s*([०-९\w\d]+)/,
    /([०-९\w\d]+)\s*(?:त्रास|दुखणे|कळा)\b/
  ];

  // Guards: only reject if the token is DIRECTLY followed by day/pad/hour/time unit (e.g. "4 days", "2 pads")
  const directNonPainUnitRegex = /^\s*(?:days?|din|divas|pads?|hours?|ghante|taas|weeks?|hafte|months?|mahine|times?|baar)\b/i;

  for (const regex of painProximityRegexes) {
    const match = normalizedText.match(regex);
    if (match) {
      const candidateToken = match[1];
      const matchIndex = match.index;
      const snippetAfter = normalizedText.slice(matchIndex + match[0].length, matchIndex + match[0].length + 15);

      if (!directNonPainUnitRegex.test(snippetAfter)) {
        const numVal = parseTokenAsNumber(candidateToken);
        if (numVal !== null) {
          return {
            value: numVal,
            isEstimated: false,
            confidence: 'high',
            matchedSnippet: match[0]
          };
        }
      }
    }
  }

  // 3. Qualitative severity phrases (suggests at most 7-8, NEVER 9 or 10, marked "estimated")
  // Only matched if qualitative word is within context of pain
  const qualitativePainMappings = [
    // Unbearable / Excruciating -> at most 8 (estimated)
    {
      regex: /(?:excruciating|unbearable|intolerable|asahaaniya|asahanik|असहनीय|अतिशय तीव्र)\s*(?:pain|cramp|dard|traas|वेदना|दर्द|त्रास)?/i,
      value: 8,
      label: 'Excruciating / Unbearable'
    },
    // Severe / Very bad -> 7 (estimated)
    {
      regex: /(?:severe|very bad|horrible|terrible|bohot zyada|bahut|khup|तीव्र|खूप)\s*(?:pain|cramp|cramps|dard|traas|वेदना|दर्द|त्रास)/i,
      value: 7,
      label: 'Severe'
    },
    // Moderate / Medium -> 5 (estimated)
    {
      regex: /(?:moderate|medium|considerable|madhyam|theek theek|मध्यम)\s*(?:pain|cramp|dard|traas|वेदना|दर्द|त्रास)/i,
      value: 5,
      label: 'Moderate'
    },
    // Mild / Slight -> 2 (estimated)
    {
      regex: /(?:mild|slight|little|light|halka|thoda|kamee|कमी|हलका|थोडे)\s*(?:pain|cramp|dard|traas|वेदना|दर्द|त्रास)/i,
      value: 2,
      label: 'Mild'
    }
  ];

  for (const q of qualitativePainMappings) {
    const m = normalizedText.match(q.regex);
    if (m) {
      // Ensure the phrase wasn't negated (e.g. "not severe pain")
      if (!isNegated(normalizedText, m.index, m[0].length)) {
        return {
          value: q.value,
          isEstimated: true,
          confidence: 'estimated',
          matchedSnippet: m[0]
        };
      }
    }
  }

  return null;
}

/**
 * BLEEDING PARSER
 * Returns one of: 'None' | 'Spotting' | 'Light' | 'Medium' | 'Heavy'
 */
function parseBleeding(normalizedText) {
  const lower = normalizedText.toLowerCase();

  const bleedingLevels = [
    {
      level: 'Heavy',
      patterns: [
        /\bheavy\s*(?:bleeding|flow|period)?\b/i,
        /\b(?:bleeding|flow)\s*(?:is\s*)?heavy\b/i,
        /\bsoak(?:ing|ed)?\s*(?:\d+\s*)?(?:pads?|tampons?)\b/i,
        /\bflooding\b/i,
        /\b(?:blood\s*)?clots\b/i,
        /\bbohot\s*(?:zyada\s*)?(?:bleeding|flow|khoon)\b/i,
        /\bkhoon\s*(?:ke\s*)?thakke\b/i,
        /\bclots\s*(?:aa\s*rahe|pad\s*rahe)\b/i,
        /भारी\s*(?:रक्तस्राव|पाळी)/,
        /खूप\s*(?:जास्त\s*)?(?:रक्तस्राव|पाळी)/,
        /रक्ताच्या\s*गुठळ्या/,
        /गुठळ्या\s*पडतात/
      ]
    },
    {
      level: 'Medium',
      patterns: [
        /\bmedium\s*(?:bleeding|flow|period)\b/i,
        /\b(?:bleeding|flow)\s*(?:is\s*)?medium\b/i,
        /\bnormal\s*(?:bleeding|flow|period)\b/i,
        /\b(?:bleeding|flow)\s*(?:is\s*)?normal\b/i,
        /\bregular\s*(?:bleeding|flow|period)\b/i,
        /\btheek\s*(?:theek\s*)?(?:bleeding|flow)\b/i,
        /\bmadhyam\s*(?:bleeding|flow)\b/i,
        /मध्यम\s*(?:रक्तस्राव|पाळी)/,
        /सामान्य\s*(?:रक्तस्राव|पाळी)/
      ]
    },
    {
      level: 'Light',
      patterns: [
        /\blight\s*(?:bleeding|flow|period)\b/i,
        /\b(?:bleeding|flow)\s*(?:is\s*)?light\b/i,
        /\bkam\s*(?:bleeding|flow)\b/i,
        /\bhalka\s*(?:bleeding|flow)\b/i,
        /\b(?:bleeding|flow)\s*(?:hai\s*)?halka\b/i,
        /\bkami\s*(?:bleeding|flow|raktrasrav)\b/i,
        /कमी\s*(?:रक्तस्राव|पाळी)/,
        /हलका\s*(?:रक्तस्राव|पाळी)/
      ]
    },
    {
      level: 'Spotting',
      patterns: [
        /\bspotting\b/i,
        /\bfew\s*drops\b/i,
        /\blight\s*stains?\b/i,
        /\bhalka\s*daag\b/i,
        /\bkuch\s*boondein\b/i,
        /\bkaahi\s*themb\b/i,
        /स्पॉटिंग/,
        /काही\s*थेंब/,
        /हल्के\s*दाग/,
        /डाग\s*पडणे/
      ]
    },
    {
      level: 'None',
      patterns: [
        /\bno\s*(?:bleeding|period|flow)\b/i,
        /\bbleeding\s*(?:is\s*)?none\b/i,
        /\bperiod\s*nahi\b/i,
        /\bbleeding\s*nahi\b/i,
        /\bkhoon\s*nahi\b/i,
        /रक्तस्राव\s*नाही/,
        /पाळी\s*नाही/,
        /खून\s*नहीं/
      ]
    }
  ];

  for (const b of bleedingLevels) {
    for (const pat of b.patterns) {
      const m = lower.match(pat);
      if (m) {
        // Guard against negation for positive bleeding levels (e.g. "no heavy bleeding" -> skip)
        if (b.level !== 'None' && isNegated(lower, m.index, m[0].length)) {
          continue;
        }
        return {
          value: b.level,
          confidence: 'high',
          matchedSnippet: m[0]
        };
      }
    }
  }

  return null;
}

/**
 * SYMPTOM CHIPS PARSER
 * Evaluates against the exact 33 chips defined in SymptomChipGroup.jsx
 */
const SYMPTOM_MAP = [
  // Pain & Pelvic (10)
  {
    chip: 'Lower abdominal cramps',
    patterns: [
      /\bcramps?\b/i, /\bcramping\b/i, /\bstomach\s*cramps?\b/i, /\bpelvic\s*cramps?\b/i,
      /\bpet\s*(?:me\s*)?(?:marod|cramp|dard)\b/i, /\bpeth\s*dard\b/i,
      /\bpottat\s*(?:dukhne|kramps?|marod)\b/i, /पोटात\s*(?:दुखणे|कळा|मरोड)/, /क्रॅम्प्स/, /मरोड़/
    ]
  },
  {
    chip: 'Lower back ache',
    patterns: [
      /\bback\s*(?:pain|ache)\b/i, /\blower\s*back\b/i, /\bbackache\b/i,
      /\bkamar\s*dard\b/i, /\bpeeth\s*dard\b/i, /\bpathit\s*dukhne\b/i,
      /कंबरदुखी/, /कमर\s*दर्द/, /पाठीत\s*दुखणे/
    ]
  },
  {
    chip: 'Pelvic pressure / heaviness',
    patterns: [
      /\bpelvic\s*pressure\b/i, /\bpelvic\s*heaviness\b/i, /\bpressure\s*in\s*pelvis\b/i,
      /\bpet\s*(?:me\s*)?bhari\s*pan\b/i, /\bpottat\s*bhaar\b/i,
      /पेल्विक\s*दबाव/, /ओटीपोटात\s*जडपणा/, /भारीपन/
    ]
  },
  {
    chip: 'Ovulation pain / Mittelschmerz',
    patterns: [
      /\bovulation\s*pain\b/i, /\bmittelschmerz\b/i, /\bmid\s*cycle\s*(?:pain|twinge)\b/i,
      /अंडोत्सर्ग\s*वेदना/
    ]
  },
  {
    chip: 'Pain with bowel movement',
    patterns: [
      /\bbowel\s*pain\b/i, /\bpain\s*(?:with|during)\s*(?:pooping|bowel|stool)\b/i,
      /\bmotion\s*(?:me|karte\s*samay)\s*dard\b/i, /\bshouch\s*(?:me|samay)\s*dard\b/i,
      /शौचाच्या\s*वेळी\s*वेदना/, /शौच\s*के\s*दौरान\s*दर्द/
    ]
  },
  {
    chip: 'Dyspareunia / intercourse pain',
    patterns: [
      /\bintercourse\s*pain\b/i, /\bpainful\s*(?:sex|intercourse)\b/i, /\bdyspareunia\b/i,
      /\bsambhog\s*(?:me|ke\s*dauran)\s*dard\b/i, /संभोग\s*(?:वेळी|दरम्यान)\s*वेदना/
    ]
  },
  {
    chip: 'Shooting nerve pain down legs',
    patterns: [
      /\bshooting\s*pain\s*(?:down\s*)?legs?\b/i, /\bleg\s*pain\b/i, /\bnerve\s*pain\b/i,
      /\bpair(?:o)?\s*me\s*dard\b/i, /\btang(?:o)?\s*me\s*dard\b/i, /\bpayat\s*kal\b/i,
      /पायांमध्ये\s*कळ/, /पैरों\s*में\s*दर्द/
    ]
  },
  {
    chip: 'Headaches / Hormonal migraine',
    patterns: [
      /\bheadaches?\b/i, /\bmigraines?\b/i, /\bhormonal\s*migraine\b/i,
      /\bsar\s*dard\b/i, /\bshirdard\b/i, /\bdokedukhi\b/i,
      /डोकेदुखी/, /सिरदर्द/, /मायग्रेन/
    ]
  },
  {
    chip: 'Breast tenderness',
    patterns: [
      /\bbreast\s*(?:tenderness|pain|soreness)\b/i, /\bsore\s*breasts?\b/i,
      /\bstan\s*(?:me\s*)?dard\b/i, /\bchhati\s*me\s*dard\b/i,
      /स्तन\s*(?:दुखणे|वेदना)/, /छाती\s*में\s*दर्द/
    ]
  },
  {
    chip: 'Joint / muscle aches',
    patterns: [
      /\bjoint\s*pain\b/i, /\bmuscle\s*(?:aches?|pain)\b/i, /\bbody\s*ache\b/i,
      /\bjodon\s*me\s*dard\b/i, /\bangdukhi\b/i, /\bshareer\s*dard\b/i,
      /सांधेदुखी/, /अंगदुखी/, /जोड़ों\s*में\s*दर्द/
    ]
  },

  // Energy & Sleep (7)
  {
    chip: 'Fatigue / low stamina',
    patterns: [
      /\bfatigue\b/i, /\btired\b/i, /\blow\s*stamina\b/i, /\bexhausted\b/i,
      /\bthakan\b/i, /\bkamzori\b/i, /\bthakva\b/i,
      /थकवा/, /सुस्ती/, /कमजोरी/
    ]
  },
  {
    chip: 'Brain fog / mental sluggishness',
    patterns: [
      /\bbrain\s*fog\b/i, /\bmental\s*sluggishness\b/i, /\bcan't\s*focus\b/i,
      /\bdimaag\s*sunn\b/i, /\bdimaag\s*kaam\s*nahi\b/i,
      /मेंदूवर\s*ताण/, /धुंधलापन/
    ]
  },
  {
    chip: 'Insomnia / restless sleep',
    patterns: [
      /\binsomnia\b/i, /\bsleepless(?:ness)?\b/i, /\brestless\s*sleep\b/i, /\bcan't\s*sleep\b/i,
      /\bneend\s*nahi\s*aayi\b/i, /\bjhop\s*nahi\s*aali\b/i,
      /झोप\s*न\s*येणे/, /अनिद्रा/, /नींद\s*नहीं/
    ]
  },
  {
    chip: 'Excessive daytime drowsiness',
    patterns: [
      /\bdrowsiness\b/i, /\bsleepy\s*all\s*day\b/i, /\bdaytime\s*sleepiness\b/i,
      /\bdin\s*me\s*neend\b/i, /\bdivasbhar\s*jhop\b/i,
      /दिवसभर\s*झोप/
    ]
  },
  {
    chip: 'Feeling cold / chills',
    patterns: [
      /\bchills\b/i, /\bfeeling\s*cold\b/i, /\bshivering\b/i,
      /\bthand\s*lagna\b/i, /\bkaampna\b/i, /\bthandi\s*vaajne\b/i,
      /थंडी\s*वाजणे/, /कंपकंपी/
    ]
  },
  {
    chip: 'Dizziness / lightheadedness',
    patterns: [
      /\bdizz(?:y|iness)\b/i, /\blightheaded(?:ness)?\b/i, /\bfeeling\s*faint\b/i,
      /\bchakkar\b/i, /\bchakkar\s*aana\b/i, /\bgar\s*garne\b/i, /\bbhowal\b/i,
      /चक्कर/, /भोवळ/
    ]
  },
  {
    chip: 'Post-exertional exhaustion',
    patterns: [
      /\bpost[- ]exertional\b/i, /\bcrash(?:ed)?\s*after\b/i, /\bexhaustion\s*after\s*activity\b/i,
      /\bthak\s*ke\s*behal\b/i
    ]
  },

  // Mood & Emotional State (6)
  {
    chip: 'Irritability / short fuse',
    patterns: [
      /\birritab(?:le|ility)\b/i, /\bshort\s*fuse\b/i, /\bannoyed\b/i,
      /\bchidchid\b/i, /\bchidchidapan\b/i, /\bgussa\s*aana\b/i,
      /चिडचिड/, /राग\s*येणे/
    ]
  },
  {
    chip: 'Heightened anxiety / restlessness',
    patterns: [
      /\banxiety\b/i, /\banxious\b/i, /\brestlessness\b/i, /\bpanic\b/i,
      /\bghabrahat\b/i, /\bbechaini\b/i, /\bbechain\b/i,
      /घबराट/, /अस्वस्थता/
    ]
  },
  {
    chip: 'Low mood / tearfulness',
    patterns: [
      /\blow\s*mood\b/i, /\btearful(?:ness)?\b/i, /\bcrying\b/i, /\bfeeling\s*sad\b/i,
      /\brona\s*aana\b/i, /\budaas\b/i, /\bdukhi\b/i,
      /उदास/, /रडू\s*येणे/
    ]
  },
  {
    chip: 'Emotional overwhelm / mood swings',
    patterns: [
      /\bmood\s*swings?\b/i, /\bemotional\s*overwhelm\b/i, /\boverwhelmed\b/i,
      /\bbhavuk\b/i
    ]
  },
  {
    chip: 'Calm & balanced',
    patterns: [
      /\bcalm\b/i, /\bbalanced\b/i, /\bpeaceful\b/i, /\bshaant\b/i,
      /शांत/
    ]
  },
  {
    chip: 'High motivation & mental clarity',
    patterns: [
      /\bhigh\s*motivation\b/i, /\bmental\s*clarity\b/i, /\bmotivated\b/i,
      /उत्साही/, /प्रेरित/
    ]
  },

  // Digestion & GI (6)
  {
    chip: 'Bloating / abdominal distension',
    patterns: [
      /\bbloat(?:ed|ing)\b/i, /\babdominal\s*distension\b/i,
      /\bpet\s*phoolna\b/i, /\bpet\s*me\s*gas\b/i, /\bpot\s*fugne\b/i,
      /पोट\s*फुगणे/, /पेट\s*फूलना/
    ]
  },
  {
    chip: 'Nausea / stomach upset',
    patterns: [
      /\bnausea\b/i, /\bnauseous\b/i, /\bstomach\s*upset\b/i,
      /\bjii\s*machalna\b/i, /\bulti\s*jaisa\b/i, /\bmalmal\b/i,
      /मळमळ/, /उल्टी\s*जैसी/
    ]
  },
  {
    chip: 'Constipation',
    patterns: [
      /\bconstipat(?:ed|ion)\b/i, /\bkabz\b/i, /\bpet\s*saaf\s*nahi\b/i,
      /बद्धकोष्ठता/, /कब्ज/
    ]
  },
  {
    chip: 'Diarrhea / loose stools',
    patterns: [
      /\bdiarrhea\b/i, /\bloose\s*(?:stools?|motions?)\b/i, /\bdast\b/i, /\bjulaab\b/i,
      /जुलाब/, /दस्त/
    ]
  },
  {
    chip: 'Intense sugar / carb cravings',
    patterns: [
      /\bsugar\s*cravings?\b/i, /\bcarb\s*cravings?\b/i, /\bsweet\s*cravings?\b/i,
      /\bmeetha\s*khane\s*ka\s*man\b/i, /गोड\s*खाण्याची\s*इच्छा/
    ]
  },
  {
    chip: 'Acid reflux / heartburn',
    patterns: [
      /\bacid\s*reflux\b/i, /\bheartburn\b/i, /\bacidity\b/i,
      /\bseene\s*me\s*jalan\b/i, /\bchhatit\s*jaljal\b/i,
      /छातीत\s*जळजळ/, /एसिडिटी/
    ]
  },

  // Skin & Hair (5)
  {
    chip: 'Hormonal cystic acne flare',
    patterns: [
      /\bacne\b/i, /\bpimples?\b/i, /\bbreakouts?\b/i, /\bcystic\s*acne\b/i,
      /\bmuhase\b/i, /मुंहासे/, /पुरळ/
    ]
  },
  {
    chip: 'Diffuse hair shedding / thinning',
    patterns: [
      /\bhair\s*(?:fall|loss|shedding|thinning)\b/i,
      /\bbaal\s*jhadna\b/i, /\bkeshgalati\b/i,
      /केस\s*गळणे/, /बाल\s*झड़ना/
    ]
  },
  {
    chip: 'Unwanted facial hair / hirsutism',
    patterns: [
      /\bfacial\s*hair\b/i, /\bhirsutism\b/i, /\bchin\s*hair\b/i,
      /\bchehre\s*par\s*baal\b/i
    ]
  },
  {
    chip: 'Excess skin oiliness',
    patterns: [
      /\boily\s*skin\b/i, /\bskin\s*oiliness\b/i, /\bteliy\s*tvacha\b/i,
      /तेलकट\s*त्वचा/
    ]
  },
  {
    chip: 'Dry or inflamed skin',
    patterns: [
      /\bdry\s*skin\b/i, /\binflamed\s*skin\b/i, /\bsookhi\s*tvacha\b/i,
      /कोरडी\s*त्वचा/
    ]
  }
];

function parseSymptoms(normalizedText) {
  const detectedChips = [];
  const matchedSnippets = [];
  const negatedSnippets = [];

  for (const item of SYMPTOM_MAP) {
    for (const pat of item.patterns) {
      const match = normalizedText.match(pat);
      if (match) {
        if (isNegated(normalizedText, match.index, match[0].length)) {
          negatedSnippets.push(`no ${item.chip}`);
        } else {
          if (!detectedChips.includes(item.chip)) {
            detectedChips.push(item.chip);
            matchedSnippets.push(match[0]);
          }
        }
        break;
      }
    }
  }

  return { detectedChips, matchedSnippets, negatedSnippets };
}

/**
 * FUNCTIONAL IMPACT & IMPACT TYPES PARSER
 */
const IMPACT_TYPE_PATTERNS = [
  {
    id: 'Missed work/classes',
    patterns: [
      /\bmissed\s*(?:work|class|classes|school|college|office)\b/i,
      /\bcouldn't\s*(?:go\s*to\s*)?(?:work|office|class)\b/i,
      /\boffice\s*(?:se\s*)?chutti\b/i, /\bchutti\s*li\b/i, /\boffice\s*nahi\s*gayi\b/i,
      /कामावर\s*जाता\s*आले\s*नाही/, /ऑफिसला\s*दांडी/, /काम\s*पर\s*नहीं/
    ]
  },
  {
    id: 'Spent day in bed',
    patterns: [
      /\bspent\s*(?:the\s*)?day\s*in\s*bed\b/i,
      /\bstayed\s*in\s*bed\b/i,
      /\bin\s*bed\s*all\s*day\b/i,
      /\bbed\s*rest\b/i,
      /\bbistar\s*(?:me|par)\s*(?:rahi|padi)\b/i,
      /झोपून\s*राहिले/, /दिवसभर\s*झोपून/, /बिस्तर\s*पर\s*रही/
    ]
  },
  {
    id: 'Needed prescription painkillers',
    patterns: [
      /\bpainkillers?\b/i, /\bpain\s*meds?\b/i, /\bprescription\s*meds?\b/i,
      /\bdawai\s*li\b/i, /\bgoli\s*(?:khayi|ghetli)\b/i,
      /औषध\s*घेतले/, /गोळी\s*घेतली/, /दर्द\s*की\s*दवा/
    ]
  },
  {
    id: 'Reduced activity',
    patterns: [
      /\breduced\s*(?:physical\s*)?activity\b/i,
      /\bhad\s*to\s*rest\b/i,
      /\bkam\s*kaam\s*kiya\b/i,
      /\baaraam\s*kiya\b/i,
      /विश्रांती\s*घेतली/, /कमी\s*हालचाल/
    ]
  },
  {
    id: 'Canceled social plans',
    patterns: [
      /\bcanceled\s*(?:social\s*)?plans?\b/i,
      /\bcouldn't\s*meet\s*friends\b/i,
      /\bplans\s*cancel\b/i,
      /योजना\s*रद्द/
    ]
  },
  {
    id: 'Interrupted sleep',
    patterns: [
      /\binterrupted\s*sleep\b/i,
      /\bsleep\s*interrupted\b/i,
      /\bneend\s*kharab\s*hui\b/i,
      /\braat\s*bhar\s*jhop\s*nahi\b/i,
      /झोपेत\s*व्यत्यय/
    ]
  }
];

function parseFunctionalImpact(normalizedText) {
  const matchedTypes = [];
  const matchedSnippets = [];

  for (const item of IMPACT_TYPE_PATTERNS) {
    for (const pat of item.patterns) {
      const match = normalizedText.match(pat);
      if (match) {
        if (!isNegated(normalizedText, match.index, match[0].length)) {
          matchedTypes.push(item.id);
          matchedSnippets.push(match[0]);
          break;
        }
      }
    }
  }

  // General disruption phrases that trigger functionalImpact even without specific subtype
  const generalDisruptionPatterns = [
    /\bdisrupted\s*my\s*day\b/i,
    /\bunable\s*to\s*function\b/i,
    /\bcouldn't\s*do\s*anything\b/i,
    /\bkaam\s*nahi\s*kar\s*payi\b/i,
    /\bkuch\s*nahi\s*kar\s*saki\b/i,
    /काम\s*नहीं\s*कर\s*पाई/,
    /काही\s*करू\s*शकले\s*नाही/
  ];

  let hasDisruption = matchedTypes.length > 0;
  if (!hasDisruption) {
    for (const pat of generalDisruptionPatterns) {
      const m = normalizedText.match(pat);
      if (m && !isNegated(normalizedText, m.index, m[0].length)) {
        hasDisruption = true;
        matchedSnippets.push(m[0]);
        break;
      }
    }
  }

  if (hasDisruption) {
    return {
      hasImpact: true,
      impactTypes: matchedTypes,
      matchedSnippets
    };
  }

  return null;
}

/**
 * ENERGY & MOOD RATINGS PARSER
 */
function parseEnergy(normalizedText) {
  const energyLevels = [
    { rating: 1, patterns: [/\b(?:zero|no)\s*energy\b/i, /\bcompletely\s*exhausted\b/i, /\burja\s*bilkul\s*nahi\b/i, /ऊर्जा\s*नाही/] },
    { rating: 2, patterns: [/\blow\s*energy\b/i, /\bvery\s*tired\b/i, /\bfeeling\s*weak\b/i, /\bkam\s*urja\b/i, /कमी\s*ऊर्जा/] },
    { rating: 3, patterns: [/\bnormal\s*energy\b/i, /\bmedium\s*energy\b/i, /\btheek\s*energy\b/i, /साधारण\s*ऊर्जा/] },
    { rating: 4, patterns: [/\bgood\s*energy\b/i, /\bhigh\s*energy\b/i, /\benergetic\b/i, /चांगली\s*ऊर्जा/] },
    { rating: 5, patterns: [/\bsuper\s*energetic\b/i, /\bfull\s*of\s*energy\b/i, /अतिशय\s*उत्साही/] }
  ];

  for (const lvl of energyLevels) {
    for (const pat of lvl.patterns) {
      const match = normalizedText.match(pat);
      if (match && !isNegated(normalizedText, match.index, match[0].length)) {
        return { rating: lvl.rating, matchedSnippet: match[0] };
      }
    }
  }
  return null;
}

function parseMood(normalizedText) {
  const moodLevels = [
    { rating: 1, patterns: [/\bvery\s*depressed\b/i, /\bcrying\s*a\s*lot\b/i, /\bextremely\s*low\s*mood\b/i, /अत्यंत\s*उदास/] },
    { rating: 2, patterns: [/\blow\s*mood\b/i, /\bfeeling\s*down\b/i, /\bsad\b/i, /\budaas\b/i, /उदास/] },
    { rating: 3, patterns: [/\bnormal\s*mood\b/i, /\btheek\s*mood\b/i, /\bokay\s*mood\b/i, /साधारण\s*मूड/] },
    { rating: 4, patterns: [/\bgood\s*mood\b/i, /\bfeeling\s*positive\b/i, /\bcheerful\b/i, /चांगला\s*मूड/] },
    { rating: 5, patterns: [/\bgreat\s*mood\b/i, /\bvery\s*happy\b/i, /\bexcellent\s*mood\b/i, /खूप\s*आनंदी/] }
  ];

  for (const lvl of moodLevels) {
    for (const pat of lvl.patterns) {
      const match = normalizedText.match(pat);
      if (match && !isNegated(normalizedText, match.index, match[0].length)) {
        return { rating: lvl.rating, matchedSnippet: match[0] };
      }
    }
  }
  return null;
}

/**
 * FEVER CHECK
 * Instruction #6: Mentions of fever go into notes (positive mentions only; negated ones are ignored).
 * Do NOT invent a fever chip.
 */
function checkFeverMention(normalizedText) {
  const feverPatterns = [
    /\bfever\b/i,
    /\bhigh\s*temperature\b/i,
    /\bbukhar\b/i,
    /\btaap\b/i,
    /बुखार/,
    /ताप/
  ];

  for (const pat of feverPatterns) {
    const match = normalizedText.match(pat);
    if (match) {
      if (!isNegated(normalizedText, match.index, match[0].length)) {
        return { hasFever: true, snippet: match[0] };
      }
    }
  }
  return { hasFever: false };
}

/**
 * MAIN PARSER FUNCTION
 * 
 * @param {string} rawTranscript - Raw speech recognition text
 * @param {string} lang - Language code: 'en-IN' | 'hi-IN' | 'mr-IN'
 * @returns {Object} { parsed, meta }
 */
export function parseVoiceTranscript(rawTranscript, lang = 'en-IN') {
  const normalized = normalizeTranscript(rawTranscript);
  if (!normalized) {
    return {
      parsed: {},
      meta: {
        rawTranscript: '',
        normalizedTranscript: '',
        lang,
        matchedPhrases: [],
        negatedPhrases: [],
        unmatchedText: '',
        isPainEstimated: false,
        confidence: {}
      }
    };
  }

  const parsed = {};
  const confidence = {};
  const matchedPhrases = [];
  const negatedPhrases = [];

  // 1. Pain
  const painResult = parsePain(normalized);
  let isPainEstimated = false;
  if (painResult) {
    parsed.painScore = painResult.value;
    isPainEstimated = painResult.isEstimated;
    confidence.painScore = painResult.confidence;
    matchedPhrases.push(painResult.matchedSnippet);
  }

  // 2. Bleeding
  const bleedingResult = parseBleeding(normalized);
  if (bleedingResult) {
    parsed.bleeding = bleedingResult.value;
    confidence.bleeding = bleedingResult.confidence;
    matchedPhrases.push(bleedingResult.matchedSnippet);
  }

  // 3. Symptoms (Strictly matching existing 33 chips)
  const symptomsResult = parseSymptoms(normalized);
  if (symptomsResult.detectedChips.length > 0) {
    parsed.symptoms = symptomsResult.detectedChips;
    confidence.symptoms = 'high';
    matchedPhrases.push(...symptomsResult.matchedSnippets);
  }
  negatedPhrases.push(...symptomsResult.negatedSnippets);

  // 4. Functional Impact
  const impactResult = parseFunctionalImpact(normalized);
  if (impactResult) {
    parsed.functionalImpact = impactResult.hasImpact;
    parsed.impactTypes = impactResult.impactTypes;
    confidence.functionalImpact = 'high';
    matchedPhrases.push(...impactResult.matchedSnippets);
  }

  // 5. Energy & Mood
  const energyResult = parseEnergy(normalized);
  if (energyResult) {
    parsed.energyRating = energyResult.rating;
    confidence.energyRating = 'high';
    matchedPhrases.push(energyResult.matchedSnippet);
  }

  const moodResult = parseMood(normalized);
  if (moodResult) {
    parsed.moodRating = moodResult.rating;
    confidence.moodRating = 'high';
    matchedPhrases.push(moodResult.matchedSnippet);
  }

  // 6. Fever note (Instruction #6)
  const feverResult = checkFeverMention(normalized);
  const noteParts = [];
  if (feverResult.hasFever) {
    noteParts.push(`Reported fever/temperature (${feverResult.snippet})`);
    matchedPhrases.push(feverResult.snippet);
  }

  // 7. Unmatched Text extraction for Notes
  // Find words/phrases not covered by any matched snippet
  let remainingText = normalized;
  for (const snippet of matchedPhrases) {
    // Replace snippet in remainder case-insensitively
    const escaped = snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    remainingText = remainingText.replace(new RegExp(escaped, 'gi'), ' ');
  }

  // Clean punctuation and multiple spaces in remaining text
  const cleanedRemainder = remainingText
    .replace(/[,;.\-—]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If there is meaningful remaining text (length > 3 and not just common connector words)
  const connectorWords = /^(?:and|also|with|aur|aani|ani|aaj|today|hai|ahe|ki|ka|se)$/i;
  if (cleanedRemainder && cleanedRemainder.length > 3 && !connectorWords.test(cleanedRemainder)) {
    noteParts.push(cleanedRemainder);
  }

  if (noteParts.length > 0) {
    parsed.notes = noteParts.join('; ');
  }

  return {
    parsed,
    meta: {
      rawTranscript,
      normalizedTranscript: normalized,
      lang,
      matchedPhrases,
      negatedPhrases,
      unmatchedText: cleanedRemainder,
      isPainEstimated,
      confidence
    }
  };
}
