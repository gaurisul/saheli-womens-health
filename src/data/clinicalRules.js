/**
 * Clinical Pattern Logic for Saheli (Demonstration Rules)
 * 
 * IMPORTANT SAFETY & COMPLIANCE NOTICE:
 * These algorithms are unvalidated demonstration rules created solely to illustrate how
 * patient symptom diaries can be synthesized into structured talking points for a clinician visit.
 * These are NOT medical diagnoses, predictive risk scores, or diagnostic tools.
 * All thresholds are provisional and must not replace professional clinical evaluation.
 */

export const CLINICAL_RULES = [
  {
    id: 'endometriosis_pattern',
    title: 'Severe Cyclical Pelvic Pain & Dysmenorrhea Pattern',
    category: 'Pelvic Pain & Dysmenorrhea',
    badgeColor: 'berry',
    status: 'Demonstration Pattern (Non-diagnostic)',
    description: 'A cyclical pattern of severe menstrual cramping accompanied by non-menstrual pelvic pain, catamenial gastrointestinal symptoms, or functional disruption.',
    clinicalRationale:
      'According to ESHRE and ACOG guidelines, endometriosis frequently presents with severe dysmenorrhea unresponsive to standard NSAIDs, acyclic pelvic pain, deep dyspareunia, and cyclical bowel symptoms. The average delay from symptom onset to diagnosis remains 7 to 10 years.',
    literatureBasis:
      'ESHRE Guideline: Endometriosis (2022); ACOG Practice Bulletin No. 114: Management of Endometriosis.',
    evaluate: (logs, _profile) => {
      const logEntries = Object.values(logs || {});
      if (logEntries.length === 0) {
        return {
          matched: false,
          severity: 'Insufficient Data',
          sampleSize: 0,
          dateRange: null,
          evidence: [],
          suggestedClinicianQuestions: []
        };
      }

      const evidence = [];
      const matchingDates = [];
      
      // Criterion 1: Severe menstrual pain (painScore >= 7)
      const severePainEntries = logEntries.filter((e) => (Number(e.painScore) || 0) >= 7);
      if (severePainEntries.length > 0) {
        severePainEntries.forEach((e) => { if (e.date) matchingDates.push(e.date); });
        evidence.push({
          criterion: 'Severe Pain Intensity (Score ≥ 7/10)',
          sampleCount: severePainEntries.length,
          dates: severePainEntries.map((e) => e.date).filter(Boolean),
          detail: `Severe pelvic pain (≥7/10) documented on ${severePainEntries.length} logged day(s). High pain intensity often warrants dedicated clinical investigation.`
        });
      }

      // Criterion 2: Non-menstrual or mid-cycle pain (ovulatory pain or acyclic pain)
      const acyclicPainEntries = logEntries.filter(
        (e) => (e.bleeding === 'None' || !e.bleeding) && (Number(e.painScore) || 0) >= 4
      );
      if (acyclicPainEntries.length > 0) {
        acyclicPainEntries.forEach((e) => { if (e.date) matchingDates.push(e.date); });
        evidence.push({
          criterion: 'Acyclic / Mid-Cycle Pelvic Pain',
          sampleCount: acyclicPainEntries.length,
          dates: acyclicPainEntries.map((e) => e.date).filter(Boolean),
          detail: `Pelvic pain outside of active bleeding recorded on ${acyclicPainEntries.length} day(s), suggestive of possible ovulatory or non-menstrual pelvic inflammation.`
        });
      }

      // Criterion 3: Bowel or intercourse-related symptoms
      const bowelOrIntercoursePain = logEntries.filter((e) => 
        (e.symptoms || []).some((s) => 
          s.includes('bowel') || s.includes('intercourse') || s.includes('Pelvic pressure')
        )
      );
      if (bowelOrIntercoursePain.length > 0) {
        bowelOrIntercoursePain.forEach((e) => { if (e.date) matchingDates.push(e.date); });
        evidence.push({
          criterion: 'Deep Infiltrating Symptom Indicators',
          sampleCount: bowelOrIntercoursePain.length,
          dates: bowelOrIntercoursePain.map((e) => e.date).filter(Boolean),
          detail: `Catamenial bowel discomfort or deep pelvic pressure noted on ${bowelOrIntercoursePain.length} day(s).`
        });
      }

      // Criterion 4: Functional disability
      const impactedEntries = logEntries.filter((e) => e.functionalImpact === true);
      if (impactedEntries.length > 0) {
        impactedEntries.forEach((e) => { if (e.date) matchingDates.push(e.date); });
        evidence.push({
          criterion: 'Significant Functional Impairment',
          sampleCount: impactedEntries.length,
          dates: impactedEntries.map((e) => e.date).filter(Boolean),
          detail: `Reported disruption to work, school, or daily activity (including bed rest) on ${impactedEntries.length} day(s).`
        });
      }

      const uniqueDates = [...new Set(matchingDates)].sort();
      const matched = severePainEntries.length >= 1 || (acyclicPainEntries.length >= 2 && bowelOrIntercoursePain.length >= 1);

      return {
        matched,
        severity: severePainEntries.length >= 2 ? 'Strong Pattern' : 'Moderate Pattern',
        sampleSize: uniqueDates.length,
        dateRange: uniqueDates.length > 0 ? { start: uniqueDates[0], end: uniqueDates[uniqueDates.length - 1] } : null,
        evidence,
        suggestedClinicianQuestions: [
          'Could my cyclical pelvic pain and bowel discomfort indicate endometriosis or adenomyosis?',
          'Would a specialized deep-endometriosis pelvic ultrasound mapping scan or MRI be informative?',
          'What medical suppression options or specialist gynecology referrals should we explore?'
        ]
      };
    }
  },
  {
    id: 'pcos_pattern',
    title: 'Irregular Cycle Interval & Androgenic Flare Pattern',
    category: 'Cycle Regularity & Androgens',
    badgeColor: 'sage',
    status: 'Demonstration Pattern (Non-diagnostic)',
    description: 'A pattern marked by extended cycle length (>35 days), delayed ovulation, and outward dermatological features associated with androgenic sensitivity.',
    clinicalRationale:
      'Under the international Rotterdam consensus guidelines, PCOS is evaluated based on ovulatory dysfunction (oligomenorrhea/amenorrhea), clinical or biochemical hyperandrogenism, and polycystic ovarian morphology.',
    literatureBasis:
      'International Evidence-based Guideline for PCOS Assessment and Management (2023 Update); Rotterdam Consensus.',
    evaluate: (logs, profile) => {
      const logEntries = Object.values(logs || {});
      const evidence = [];
      const matchingDates = [];

      // Criterion 1: Cycle irregularity or extended cycle length
      const isLongCycle = (Number(profile?.typicalCycleLength) || 28) > 35 || (Number(profile?.currentCycleDay) || 1) > 35;
      if (isLongCycle) {
        evidence.push({
          criterion: 'Extended or Oligomenorrheic Cycle Length (>35 days)',
          sampleCount: 1,
          dates: [],
          detail: `Cycle interval extends beyond 35 days (typical: ${profile?.typicalCycleLength || 35}d). Extended follicular intervals suggest delayed or irregular ovulation.`
        });
      }

      // Criterion 2: Hyperandrogenic features
      const androgenicEntries = logEntries.filter((e) =>
        (e.symptoms || []).some((s) => 
          s.includes('acne') || s.includes('hair') || s.includes('Skin & Hair')
        )
      );
      if (androgenicEntries.length > 0) {
        androgenicEntries.forEach((e) => { if (e.date) matchingDates.push(e.date); });
        evidence.push({
          criterion: 'Dermatological / Androgenic Observations',
          sampleCount: androgenicEntries.length,
          dates: androgenicEntries.map((e) => e.date).filter(Boolean),
          detail: `Hormonal acne flares, hirsutism, or hair shedding documented on ${androgenicEntries.length} day(s).`
        });
      }

      // Criterion 3: Metabolic symptoms
      const metabolicEntries = logEntries.filter((e) =>
        (e.symptoms || []).some((s) => 
          s.includes('cravings') || s.includes('fog') || s.includes('Bloating')
        )
      );
      if (metabolicEntries.length > 0) {
        metabolicEntries.forEach((e) => { if (e.date) matchingDates.push(e.date); });
        evidence.push({
          criterion: 'Metabolic & Energy Fluctuations',
          sampleCount: metabolicEntries.length,
          dates: metabolicEntries.map((e) => e.date).filter(Boolean),
          detail: `Energy dips and intense food cravings recorded on ${metabolicEntries.length} day(s).`
        });
      }

      const uniqueDates = [...new Set(matchingDates)].sort();
      const matched = isLongCycle || androgenicEntries.length >= 2;

      return {
        matched,
        severity: isLongCycle && androgenicEntries.length >= 2 ? 'Strong Pattern' : 'Moderate Pattern',
        sampleSize: uniqueDates.length,
        dateRange: uniqueDates.length > 0 ? { start: uniqueDates[0], end: uniqueDates[uniqueDates.length - 1] } : null,
        evidence,
        suggestedClinicianQuestions: [
          'Given my cycle variability and acne flares, should we evaluate hormone levels (free testosterone, LH/FSH, DHEA-S)?',
          'Would checking fasting insulin, HOMA-IR, or a pelvic ultrasound be appropriate?',
          'What lifestyle or medical strategies support ovulatory regularity?'
        ]
      };
    }
  },
  {
    id: 'anaemia_pattern',
    title: 'Heavy Menstrual Bleeding & Fatigue Co-occurrence',
    category: 'Menorrhagia & Ferritin',
    badgeColor: 'terracotta',
    status: 'Demonstration Pattern (Non-diagnostic)',
    description: 'Multiple days of heavy menstrual bleeding temporally associated with pronounced fatigue, dizziness, and cognitive exhaustion.',
    clinicalRationale:
      'ACOG and FIGO classify Heavy Menstrual Bleeding (menorrhagia) as blood loss that impairs physical or quality-of-life parameters. It represents the primary cause of iron deficiency anemia in menstruating women.',
    literatureBasis:
      'FIGO Menstrual Disorders Committee (FIGO AUB guidelines); ACOG Practice Bulletin No. 128: Diagnosis of Abnormal Uterine Bleeding.',
    evaluate: (logs) => {
      const logEntries = Object.values(logs || {});
      const evidence = [];
      const matchingDates = [];

      // Criterion 1: Heavy bleeding frequency
      const heavyEntries = logEntries.filter((e) => e.bleeding === 'Heavy');
      if (heavyEntries.length > 0) {
        heavyEntries.forEach((e) => { if (e.date) matchingDates.push(e.date); });
        evidence.push({
          criterion: 'Heavy Menstrual Flow (Flooding / Clots)',
          sampleCount: heavyEntries.length,
          dates: heavyEntries.map((e) => e.date).filter(Boolean),
          detail: `Heavy flow logged on ${heavyEntries.length} day(s). Frequent protection changes or flooding indicate elevated blood loss.`
        });
      }

      // Criterion 2: Low energy ratings
      const lowEnergyEntries = logEntries.filter((e) => Number(e.energyRating) <= 2 && e.energyRating !== undefined);
      if (lowEnergyEntries.length > 0) {
        lowEnergyEntries.forEach((e) => { if (e.date) matchingDates.push(e.date); });
        evidence.push({
          criterion: 'Pronounced Low Stamina / Fatigue',
          sampleCount: lowEnergyEntries.length,
          dates: lowEnergyEntries.map((e) => e.date).filter(Boolean),
          detail: `Energy rated 1 or 2 out of 5 across ${lowEnergyEntries.length} day(s), frequently coinciding with menstrual bleeding.`
        });
      }

      // Criterion 3: Neurological & orthostatic symptoms
      const neuroEntries = logEntries.filter((e) => 
        (e.symptoms || []).some((s) => s.includes('Brain fog') || s.includes('Drowsiness') || s.includes('Dizziness'))
      );
      if (neuroEntries.length > 0) {
        neuroEntries.forEach((e) => { if (e.date) matchingDates.push(e.date); });
        evidence.push({
          criterion: 'Cognitive & Orthostatic Symptoms',
          sampleCount: neuroEntries.length,
          dates: neuroEntries.map((e) => e.date).filter(Boolean),
          detail: `Brain fog or lightheadedness noted on ${neuroEntries.length} day(s). Common physiological markers of depleted iron stores.`
        });
      }

      const uniqueDates = [...new Set(matchingDates)].sort();
      const matched = heavyEntries.length >= 2 || (heavyEntries.length >= 1 && lowEnergyEntries.length >= 2);

      return {
        matched,
        severity: heavyEntries.length >= 3 ? 'Strong Pattern' : 'Moderate Pattern',
        sampleSize: uniqueDates.length,
        dateRange: uniqueDates.length > 0 ? { start: uniqueDates[0], end: uniqueDates[uniqueDates.length - 1] } : null,
        evidence,
        suggestedClinicianQuestions: [
          'Given consecutive heavy flow days and fatigue, could we check a Complete Blood Count (CBC) and serum ferritin?',
          'What ferritin threshold do you consider optimal rather than merely borderline?',
          'What medical interventions (tranexamic acid, hormonal therapy, or iron replacement) are recommended?'
        ]
      };
    }
  }
];

export const URGENT_CARE_RED_FLAGS = [
  {
    title: 'Severe, Sudden, or Unilateral Pelvic Pain',
    description: 'Sudden sharp pelvic or abdominal pain, especially if localized to one side or worsening rapidly, could signify an ovarian cyst rupture, ovarian torsion, or an ectopic pregnancy.',
    action: 'Seek emergency medical evaluation immediately.'
  },
  {
    title: 'Hemorrhagic Bleeding (Soaking ≥ 2 Pads per Hour)',
    description: 'Soaking through two or more maxi pads or super tampons every hour for two or more consecutive hours, or passing blood clots larger than a golf ball.',
    action: 'Contact emergency services or visit the nearest emergency department without delay.'
  },
  {
    title: 'Pelvic Pain with Fever or Purulent Discharge',
    description: 'Pelvic pain accompanied by chills, temperature ≥ 38.0°C (100.4°F), or foul-smelling vaginal discharge may indicate Pelvic Inflammatory Disease (PID) or acute internal infection.',
    action: 'Requires urgent in-person medical evaluation today.'
  },
  {
    title: 'Dizziness, Syncope (Fainting), or Shortness of Breath',
    description: 'Feeling faint upon standing, loss of consciousness, pallor, or rapid heart rate during menstrual bleeding can indicate acute hypovolemia or critical anaemia.',
    action: 'Seek emergency medical assistance immediately.'
  },
  {
    title: 'Positive Pregnancy Test with Any Bleeding or Cramping',
    description: 'Any vaginal spotting or cramping in the setting of a positive or suspected pregnancy requires immediate exclusion of ectopic pregnancy.',
    action: 'Seek immediate emergency obstetric triage.'
  }
];

export const MEDICAL_DISCLAIMER_TEXT = 
  "Saheli is an observational symptom diary and clinician communication bridge, not a diagnostic medical device. Pattern recognition algorithms are demonstration demonstrations based on published literature and are unvalidated by formal clinical trial. Saheli does not provide medical diagnoses or treatment recommendations. Always consult a licensed healthcare professional for medical evaluation.";
