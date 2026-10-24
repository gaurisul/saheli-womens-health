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
    title: 'Endometriosis-Related Symptom Pattern',
    category: 'Pelvic Pain & Dysmenorrhea',
    badgeColor: 'berry',
    status: 'Demonstration Rule (Unvalidated)',
    description: 'A cyclic pattern of severe menstrual pain (dysmenorrhea) accompanied by non-menstrual pelvic pain, gastrointestinal distress, or deep pelvic pressure.',
    clinicalRationale:
      'According to ESHRE (European Society of Human Reproduction and Embryology) and ACOG guidelines, endometriosis frequently presents with severe dysmenorrhea unresponsive to standard NSAIDs, acyclic pelvic pain, deep dyspareunia, and cyclical bowel symptoms. The average delay from symptom onset to diagnosis remains 7 to 10 years.',
    literatureBasis:
      'ESHRE Guideline: Endometriosis (2022); ACOG Practice Bulletin No. 114: Management of Endometriosis.',
    evaluate: (logs) => {
      const logEntries = Object.values(logs || {});
      if (logEntries.length === 0) return { matched: false, evidence: [] };

      const evidence = [];
      
      // Criterion 1: Severe menstrual pain (painScore >= 7)
      const severePainDays = logEntries.filter(e => e.painScore >= 7);
      if (severePainDays.length > 0) {
        evidence.push({
          criterion: 'Severe Pain Intensity (Score ≥ 7/10)',
          detail: `Recorded on ${severePainDays.length} day(s). Pain at this intensity typically causes functional limitation and may warrant thorough investigation beyond primary dysmenorrhea.`
        });
      }

      // Criterion 2: Non-menstrual or mid-cycle pain (ovulatory pain or acyclic pain)
      const acyclicPainDays = logEntries.filter(e => e.bleeding === 'None' && e.painScore >= 4);
      if (acyclicPainDays.length > 0) {
        evidence.push({
          criterion: 'Acyclic / Mid-Cycle Pelvic Pain',
          detail: `Recorded on ${acyclicPainDays.length} non-bleeding day(s). Chronic or mid-cycle pelvic pain outside of menses is a common hallmark to discuss.`
        });
      }

      // Criterion 3: Bowel or intercourse-related symptoms
      const bowelOrIntercoursePain = logEntries.filter(e => 
        e.symptoms?.includes('Pain with bowel movement') || 
        e.symptoms?.includes('Dyspareunia / intercourse pain')
      );
      if (bowelOrIntercoursePain.length > 0) {
        evidence.push({
          criterion: 'Deep Infiltrating Symptom Indicators',
          detail: `Catamenial dyschezia (pain with bowel movements during menses) or deep dyspareunia logged on ${bowelOrIntercoursePain.length} day(s). Important indicators to share with your gynecologist.`
        });
      }

      // Criterion 4: Functional disability
      const impactedDays = logEntries.filter(e => e.functionalImpact === true);
      if (impactedDays.length > 0) {
        evidence.push({
          criterion: 'Significant Functional Impairment',
          detail: `Reported interference with daily activities, work, or bed rest on ${impactedDays.length} logged day(s). Demonstrates clinical severity for your appointment brief.`
        });
      }

      const matched = severePainDays.length >= 1 || (acyclicPainDays.length >= 2 && bowelOrIntercoursePain.length >= 1);
      return {
        matched,
        severity: severePainDays.length >= 2 ? 'Significant match' : 'Moderate match',
        evidence,
        suggestedClinicianQuestions: [
          'Given the intensity of my cyclic pain and bowel symptoms, could this point to endometriosis or adenomyosis?',
          'Would a pelvic mapping ultrasound performed by an endometriosis imaging specialist or an MRI be helpful?',
          'What are the recommended medical suppression trials (e.g. continuous oral progestins) versus diagnostic surgical options?'
        ]
      };
    }
  },
  {
    id: 'pcos_pattern',
    title: 'PCOS-Related Symptom Pattern',
    category: 'Cycle Regularity & Androgens',
    badgeColor: 'sage',
    status: 'Demonstration Rule (Unvalidated)',
    description: 'A pattern characterized by extended or irregular cycle intervals, prolonged follicular phases, and outward androgenic manifestations like cystic acne or hirsutism.',
    clinicalRationale:
      'Under the Rotterdam Consensus Criteria, PCOS is suspected when at least two of the following are present: oligo/anovulation (infrequent or absent cycles), clinical or biochemical hyperandrogenism, and polycystic ovarian morphology on ultrasound.',
    literatureBasis:
      'International Evidence-based Guideline for the Assessment and Management of Polycystic Ovary Syndrome (PCOS 2023 Update); Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus.',
    evaluate: (logs, profile) => {
      const logEntries = Object.values(logs || {});
      const evidence = [];

      // Criterion 1: Cycle irregularity or extended cycle length
      const isLongCycle = (profile?.typicalCycleLength || 28) > 35 || (profile?.currentCycleDay || 1) > 35;
      if (isLongCycle) {
        evidence.push({
          criterion: 'Extended or Oligomenorrheic Cycle Length (>35 days)',
          detail: `Current cycle or typical interval spans >35 days (Current: Day ${profile?.currentCycleDay || 'N/A'}). Oligo-ovulation or delayed follicular maturation should be evaluated.`
        });
      }

      // Criterion 2: Hyperandrogenic features
      const androgenicDays = logEntries.filter(e =>
        e.symptoms?.includes('Hormonal acne flare') || 
        e.symptoms?.includes('Unwanted facial hair') || 
        e.symptoms?.includes('Hair shedding / thinning')
      );
      if (androgenicDays.length > 0) {
        evidence.push({
          criterion: 'Clinical Hyperandrogenism Indicators',
          detail: `Cutaneous signs (hormonal cystic acne, hirsutism, hair shedding) logged across ${androgenicDays.length} day(s). Warrant evaluation of free testosterone and DHEA-S.`
        });
      }

      // Criterion 3: Metabolic symptoms
      const metabolicDays = logEntries.filter(e =>
        e.symptoms?.includes('Food cravings') || 
        e.symptoms?.includes('Brain fog') || 
        e.symptoms?.includes('Bloating / abdominal distension')
      );
      if (metabolicDays.length > 0) {
        evidence.push({
          criterion: 'Metabolic & Insulin Sensitisation Indicators',
          detail: `Insulin-associated symptoms (intense carbohydrate cravings, energy dips) noted on ${metabolicDays.length} day(s).`
        });
      }

      const matched = isLongCycle || androgenicDays.length >= 3;
      return {
        matched,
        severity: isLongCycle && androgenicDays.length >= 2 ? 'Significant match' : 'Moderate match',
        evidence,
        suggestedClinicianQuestions: [
          'Given my cycle length variability and persistent acne/hirsutism, do I meet criteria for PCOS?',
          'Could we order a comprehensive morning hormonal panel (free testosterone, LH/FSH ratio, DHEA-S, prolactin, TSH)?',
          'Would checking fasting insulin and glucose (HOMA-IR) or an ultrasound of the ovaries be recommended?'
        ]
      };
    }
  },
  {
    id: 'anaemia_pattern',
    title: 'Anaemia / Heavy Bleeding Pattern',
    category: 'Menorrhagia & Ferritin',
    badgeColor: 'terracotta',
    status: 'Demonstration Rule (Unvalidated)',
    description: 'A pattern marked by consecutive heavy menstrual bleeding days co-occurring with systemic fatigue, dizziness, and cognitive sluggishness.',
    clinicalRationale:
      'ACOG and FIGO classify Heavy Menstrual Bleeding (HMB) as menstrual blood loss that interferes with physical, emotional, social, or material quality of life. Repeated heavy flow is the leading cause of iron deficiency and microcytic anaemia in reproductive-age women, often leaving ferritin severely depleted even when hemoglobin appears borderline normal.',
    literatureBasis:
      'FIGO Menstrual Disorders Committee (FIGO AUB guidelines); ACOG Committee Opinion No. 557: Management of Acute Abnormal Uterine Bleeding.',
    evaluate: (logs) => {
      const logEntries = Object.values(logs || {});
      const evidence = [];

      // Criterion 1: Heavy bleeding frequency
      const heavyDays = logEntries.filter(e => e.bleeding === 'Heavy');
      if (heavyDays.length > 0) {
        evidence.push({
          criterion: 'Prolonged or Consecutive Heavy Bleeding',
          detail: `Heavy flow logged on ${heavyDays.length} day(s). Soaking through multiple pads/tampons in rapid succession or passing large clots suggests menorrhagia.`
        });
      }

      // Criterion 2: Profound fatigue & exhaustion
      const lowEnergyDays = logEntries.filter(e => e.energyRating && e.energyRating <= 2);
      if (lowEnergyDays.length > 0) {
        evidence.push({
          criterion: 'Persistent Low Stamina / Exhaustion',
          detail: `Energy rated 1 or 2 out of 5 on ${lowEnergyDays.length} logged day(s), temporally coinciding with menstrual blood loss.`
        });
      }

      // Criterion 3: Neurological & cognitive symptoms
      const neuroSymptoms = logEntries.filter(e => 
        e.symptoms?.includes('Brain fog') || 
        e.symptoms?.includes('Drowsiness') || 
        e.symptoms?.includes('Morning stiffness')
      );
      if (neuroSymptoms.length > 0) {
        evidence.push({
          criterion: 'Cognitive & Tissue Hypoxia Indicators',
          detail: `Cognitive fatigue and brain fog recorded on ${neuroSymptoms.length} day(s), frequent systemic markers of low circulating iron and reduced oxygen-carrying capacity.`
        });
      }

      const matched = heavyDays.length >= 2 || (heavyDays.length >= 1 && lowEnergyDays.length >= 3);
      return {
        matched,
        severity: heavyDays.length >= 3 ? 'Significant match' : 'Moderate match',
        evidence,
        suggestedClinicianQuestions: [
          'Given that my heavy flow coincides with severe fatigue, could we check a Complete Blood Count (CBC) and serum ferritin?',
          'What is the threshold for diagnosing iron deficiency even if my standard hemoglobin is within normal laboratory limits?',
          'What medical therapies (such as tranexamic acid, hormonal IUD, or iron supplementation/infusion) would help prevent monthly iron depletion?'
        ]
      };
    }
  }
];

export const URGENT_CARE_RED_FLAGS = [
  {
    title: 'Severe, Sudden, or Unilateral Pelvic Pain',
    description: 'Sudden sharp pelvic or abdominal pain, especially if localized to one side or worsening rapidly, could signify an ovarian cyst rupture, ovarian torsion, or an ectopic pregnancy.',
    action: 'Seek emergency medical care (ER) immediately.'
  },
  {
    title: 'Hemorrhagic Bleeding (Soaking ≥ 2 Pads per Hour)',
    description: 'Soaking through two or more maxi pads or super tampons every hour for two or more consecutive hours, or passing blood clots larger than a golf ball.',
    action: 'Contact emergency services or go to the nearest emergency department without delay.'
  },
  {
    title: 'Pelvic Pain with Fever or Purulent Discharge',
    description: 'Pelvic pain accompanied by chills, temperature ≥ 38.0°C (100.4°F), or foul-smelling vaginal discharge may indicate Pelvic Inflammatory Disease (PID) or acute internal infection.',
    action: 'Requires urgent in-person medical evaluation today.'
  },
  {
    title: 'Dizziness, Syncope (Fainting), or Shortness of Breath',
    description: 'Feeling faint upon standing, actual loss of consciousness, pallor, or rapid heart rate during menstrual bleeding can indicate acute hypovolemia or critical anaemia.',
    action: 'Seek emergency assistance immediately.'
  },
  {
    title: 'Positive Pregnancy Test with Any Bleeding or Cramping',
    description: 'Any vaginal spotting or cramping in the setting of a positive or suspected pregnancy requires immediate exclusion of ectopic pregnancy.',
    action: 'Seek immediate emergency obstetric triage.'
  }
];

export const MEDICAL_DISCLAIMER_TEXT = 
  "Saheli is an observational health tracking and clinician-communication facilitation tool. It does not provide medical diagnoses, clinical treatment plans, or emergency triage. All pattern indicators, symptom scores, and generated doctor visit briefs are for personal educational use and clinician conversation preparation only. Never disregard professional medical advice or delay seeking care because of information displayed in this application.";
