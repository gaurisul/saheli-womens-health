/**
 * Saheli Safety Engine - Observational Rule-Based Red-Flag Detection
 * 
 * IMPORTANT SAFETY & COMPLIANCE NOTICE:
 * Saheli is an observational symptom diary and clinician communication bridge,
 * NOT a diagnostic medical device. These pure, rule-based algorithms detect clinical
 * red-flag criteria to provide timely urgent-care guidance.
 * No output may present a confirmed diagnosis. Missing entries are NEVER counted as symptom-free days.
 */

// Centralized Emergency Contacts Configuration
// NOTE: Verify emergency contact numbers for your specific district or state.
export const EMERGENCY_CONTACTS_CONFIG = {
  region: 'India',
  nationalEmergency: {
    number: '112',
    label: 'National Emergency (All Services)',
    description: 'Unified emergency response for Police, Fire, and Medical emergencies.'
  },
  ambulance: {
    number: '108',
    label: 'Emergency Medical & Ambulance',
    description: 'Toll-free emergency medical response and hospital transport.'
  },
  womensHelpline: {
    number: '1091',
    label: "Women's Helpline",
    description: '24/7 emergency response and assistance for women.'
  },
  disclaimer: 'Verify emergency contact numbers for your local municipality or state jurisdiction before relying on them in an emergency.'
};

/**
 * Helper to check if two YYYY-MM-DD date strings are consecutive calendar days (dateB is day before dateA)
 */
function isPreviousCalendarDay(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return false;
  const [yA, mA, dA] = dateStrA.split('-').map(Number);
  const [yB, mB, dB] = dateStrB.split('-').map(Number);
  const dateA = new Date(yA, mA - 1, dA);
  const dateB = new Date(yB, mB - 1, dB);
  const diffDays = Math.round((dateA - dateB) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Checks if a string or array contains keywords
 */
function textMatchesAny(text, keywords = []) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Evaluates safety red flags for a given entry in the context of recent logs.
 * Pure, rule-based, deterministic. Zero network calls or external APIs.
 * 
 * @param {Object} entry - The diary entry to evaluate (today's check-in or specific date)
 * @param {Object} allLogs - The complete dictionary of saved logs { [dateStr]: entry }
 * @returns {Array} List of active safety flags
 */
export function evaluateSafetyFlags(entry, allLogs = {}) {
  if (!entry) return [];

  const flags = [];
  const entryDate = entry.date || new Date().toISOString().split('T')[0];
  const painNum = entry.painScore !== undefined && entry.painScore !== null ? Number(entry.painScore) : null;
  const symptoms = Array.isArray(entry.symptoms) ? entry.symptoms : [];
  const notesText = typeof entry.notes === 'string' ? entry.notes : '';

  // 1. VERY SEVERE / EMERGENCY PAIN (Pain Score 9 - 10)
  if (painNum !== null && painNum >= 9) {
    flags.push({
      id: 'severe-pain-emergency',
      severity: 'urgent',
      title: 'Emergency Pain Intensity (Score ≥ 9/10)',
      reason: `Pain intensity recorded at ${painNum}/10 (emergency threshold). Sudden, severe pelvic or abdominal pain may need prompt medical attention to evaluate acute causes.`,
      action: 'Seek emergency medical evaluation immediately. Do not wait for a routine clinic appointment.',
      triggeredFields: ['painScore'],
      triggeredDate: entryDate
    });
  }

  // 2. SEVERE PAIN WITH FAINTING, SYNCOPE, OR VOMITING
  const hasFaintOrVomitInNotes = textMatchesAny(notesText, ['faint', 'syncope', 'passed out', 'blackout', 'vomit', 'throwing up']);
  const hasFaintOrVomitInSymptoms = symptoms.some((s) => textMatchesAny(s, ['faint', 'syncope', 'drowsiness', 'nausea']));
  if (painNum !== null && painNum >= 7 && (hasFaintOrVomitInNotes || (hasFaintOrVomitInSymptoms && textMatchesAny(notesText, ['vomit', 'faint'])))) {
    flags.push({
      id: 'severe-pain-fainting-vomiting',
      severity: 'urgent',
      title: 'Severe Pain with Fainting or Systemic Symptoms',
      reason: `Severe pain (${painNum}/10) recorded alongside dizziness, fainting, or vomiting. This combination may indicate acute pelvic pathology requiring urgent clinical evaluation.`,
      action: 'Contact emergency medical services or go to the nearest emergency department.',
      triggeredFields: ['painScore', 'notes', 'symptoms'],
      triggeredDate: entryDate
    });
  }

  // 3. HEAVY BLEEDING WITH ORTHOSTATIC SYMPTOMS (Dizziness / Fainting)
  const isHeavyBleeding = entry.bleeding === 'Heavy';
  const hasDizzinessOrFainting = textMatchesAny(notesText, ['dizzy', 'dizziness', 'lightheaded', 'faint', 'syncope', 'passed out']) ||
    symptoms.some((s) => textMatchesAny(s, ['dizziness', 'faint', 'fatigue / low stamina', 'brain fog']));

  if (isHeavyBleeding && hasDizzinessOrFainting) {
    flags.push({
      id: 'heavy-bleeding-orthostatic',
      severity: 'urgent',
      title: 'Heavy Flow with Dizziness or Lightheadedness',
      reason: 'Heavy menstrual bleeding ("Flooding / large clots") recorded alongside lightheadedness or dizziness. Rapid or extensive blood loss with orthostatic symptoms may need prompt medical attention.',
      action: 'Seek urgent clinical triage or visit an emergency room promptly.',
      triggeredFields: ['bleeding', 'notes', 'symptoms'],
      triggeredDate: entryDate
    });
  }

  // Multi-day rules require inspecting preceding consecutive calendar days in allLogs
  const sortedDates = Object.keys(allLogs).sort();
  const currentIndex = sortedDates.indexOf(entryDate);

  // 4. PROLONGED HEAVY MENSTRUAL FLOW (≥2 Consecutive Logged Days)
  if (isHeavyBleeding && currentIndex > 0) {
    const prevDate = sortedDates[currentIndex - 1];
    // A missing entry is NEVER counted as symptom-free; we only evaluate strictly logged consecutive calendar days
    if (isPreviousCalendarDay(entryDate, prevDate)) {
      const prevEntry = allLogs[prevDate];
      if (prevEntry && prevEntry.bleeding === 'Heavy') {
        flags.push({
          id: 'consecutive-heavy-bleeding',
          severity: 'seek-care-soon',
          title: 'Prolonged Heavy Menstrual Flow',
          reason: `Heavy flow ("Flooding / large clots") logged across consecutive days (${prevDate} and ${entryDate}). Continued heavy bleeding can lead to acute anemia and warrants clinical evaluation.`,
          action: 'Contact your healthcare provider or gynecologist for prompt guidance on managing heavy flow.',
          triggeredFields: ['bleeding'],
          triggeredDate: entryDate
        });
      }
    }
  }

  // 5. PROLONGED FUNCTIONAL DISRUPTION (≥3 Consecutive Logged Days of Severe Pain or Bed Rest)
  const isTodayDisrupted = entry.functionalImpact === true || (painNum !== null && painNum >= 7);
  if (isTodayDisrupted && currentIndex >= 2) {
    const dateMinus1 = sortedDates[currentIndex - 1];
    const dateMinus2 = sortedDates[currentIndex - 2];

    if (isPreviousCalendarDay(entryDate, dateMinus1) && isPreviousCalendarDay(dateMinus1, dateMinus2)) {
      const entryMinus1 = allLogs[dateMinus1];
      const entryMinus2 = allLogs[dateMinus2];

      const isMinus1Disrupted = entryMinus1 && (entryMinus1.functionalImpact === true || (Number(entryMinus1.painScore) || 0) >= 7);
      const isMinus2Disrupted = entryMinus2 && (entryMinus2.functionalImpact === true || (Number(entryMinus2.painScore) || 0) >= 7);

      if (isMinus1Disrupted && isMinus2Disrupted) {
        flags.push({
          id: 'prolonged-functional-disruption',
          severity: 'seek-care-soon',
          title: 'Severe Multi-Day Functional Disruption',
          reason: `Physical symptoms have disrupted normal daily activities or required bed rest across 3 consecutive logged days (${dateMinus2} to ${entryDate}). Unrecorded days are not assumed symptom-free.`,
          action: 'Schedule an evaluation with your clinician. Prolonged debilitating symptoms warrant structured investigation and pain management.',
          triggeredFields: ['functionalImpact', 'painScore', 'impactTypes'],
          triggeredDate: entryDate
        });
      }
    }
  }

  // 6. PELVIC PAIN WITH FEVER OR SIGNS OF INFECTION
  const hasFeverOrChills = textMatchesAny(notesText, ['fever', 'chills', 'high temp', 'purulent', 'foul discharge']) ||
    symptoms.some((s) => textMatchesAny(s, ['feeling cold / chills']));
  if (painNum !== null && painNum > 0 && hasFeverOrChills) {
    flags.push({
      id: 'pelvic-pain-fever',
      severity: 'seek-care-soon',
      title: 'Pelvic Discomfort with Fever or Chills',
      reason: 'Pelvic pain logged alongside chills, fever, or unusual discharge. This pattern may suggest an internal pelvic infection requiring professional medical assessment.',
      action: 'Discuss with a clinician promptly for clinical examination.',
      triggeredFields: ['painScore', 'symptoms', 'notes'],
      triggeredDate: entryDate
    });
  }

  return flags;
}

/**
 * Evaluates all recent logs (or today's entry) to find all active or unresolved safety flags.
 * Used by Dashboard and Doctor Brief.
 * 
 * @param {Object} logs - Dictionary of all logs { [dateStr]: entry }
 * @param {string} anchorDate - Reference date (defaults to today)
 * @returns {Array} De-duplicated list of recent safety flags
 */
export function getActiveSafetyAlerts(logs = {}, anchorDate = null) {
  const dates = Object.keys(logs).sort();
  if (dates.length === 0) return [];

  // Check the latest logged date or specified anchorDate
  const targetDate = anchorDate || dates[dates.length - 1];
  const targetEntry = logs[targetDate];

  if (!targetEntry) return [];

  return evaluateSafetyFlags(targetEntry, logs);
}
