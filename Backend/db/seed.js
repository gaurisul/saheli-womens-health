import { pool } from './db.js';
import { SAMPLE_PROFILES } from '../../src/data/sampleProfiles.js';
import { hashPassword } from '../auth.js';

export const DEMO_ACCOUNTS = [
  {
    id: 'usr-priya',
    email: 'priya.sharma@demo.saheli.health',
    password: 'demo-password-123',
    name: 'Priya Sharma',
    profileId: 'priya'
  },
  {
    id: 'usr-amara',
    email: 'amara.k@demo.saheli.health',
    password: 'demo-password-123',
    name: 'Amara K.',
    profileId: 'amara'
  },
  {
    id: 'usr-ananya',
    email: 'ananya.sen@demo.saheli.health',
    password: 'demo-password-123',
    name: 'Ananya Sen',
    profileId: 'ananya'
  },
  {
    id: 'usr-meera',
    email: 'meera.patel@demo.saheli.health',
    password: 'demo-password-123',
    name: 'Meera Patel',
    profileId: 'meera'
  },
  {
    id: 'usr-guest',
    email: 'guest@demo.saheli.health',
    password: 'demo-password-123',
    name: 'Personal Diary',
    profileId: 'guest'
  }
];

export async function seedDemoData(clientOrPool = pool) {
  let profileCount = 0;
  let logCount = 0;
  let questionCount = 0;
  let userCount = 0;

  // 1. Seed Profiles & Logs from SAMPLE_PROFILES
  for (const [key, profile] of Object.entries(SAMPLE_PROFILES)) {
    const ageVal = typeof profile.age === 'number' ? profile.age : (profile.age ? parseInt(profile.age, 10) : null);
    const visitDate = profile.upcomingVisitDate && profile.upcomingVisitDate.trim() !== '' ? profile.upcomingVisitDate : null;

    // Upsert profile
    await clientOrPool.query(
      `INSERT INTO profiles (
        id, name, age, typical_cycle_length, typical_period_length,
        upcoming_visit_date, doctor_name, primary_pattern_focus, summary_bio,
        current_cycle_day, current_phase, consent_settings, is_demo, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        age = EXCLUDED.age,
        typical_cycle_length = EXCLUDED.typical_cycle_length,
        typical_period_length = EXCLUDED.typical_period_length,
        upcoming_visit_date = EXCLUDED.upcoming_visit_date,
        doctor_name = EXCLUDED.doctor_name,
        primary_pattern_focus = EXCLUDED.primary_pattern_focus,
        summary_bio = EXCLUDED.summary_bio,
        current_cycle_day = EXCLUDED.current_cycle_day,
        current_phase = EXCLUDED.current_phase,
        consent_settings = EXCLUDED.consent_settings,
        is_demo = true,
        updated_at = NOW()`,
      [
        profile.id,
        profile.name,
        ageVal,
        profile.typicalCycleLength || 28,
        profile.typicalPeriodLength || 5,
        visitDate,
        profile.doctorName || '',
        profile.primaryPatternFocus || '',
        profile.summaryBio || '',
        profile.currentCycleDay || 1,
        profile.currentPhase || '',
        JSON.stringify(profile.consentSettings || {})
      ]
    );
    profileCount++;

    // Upsert custom questions
    if (Array.isArray(profile.customQuestions)) {
      for (let i = 0; i < profile.customQuestions.length; i++) {
        const q = profile.customQuestions[i];
        const qId = q.id || `q-${i + 1}`;
        await clientOrPool.query(
          `INSERT INTO custom_questions (
            id, profile_id, text, in_report, position, is_demo
          ) VALUES ($1, $2, $3, $4, $5, true)
          ON CONFLICT (profile_id, id) DO UPDATE SET
            text = EXCLUDED.text,
            in_report = EXCLUDED.in_report,
            position = EXCLUDED.position,
            is_demo = true`,
          [qId, profile.id, q.text || '', q.inReport !== false, i]
        );
        questionCount++;
      }
    }

    // Upsert symptom logs
    if (profile.logs && typeof profile.logs === 'object') {
      for (const [dateKey, log] of Object.entries(profile.logs)) {
        const validBleeding = ['None', 'Spotting', 'Light', 'Medium', 'Heavy'].includes(log.bleeding) ? log.bleeding : 'None';
        const painScore = Math.max(0, Math.min(10, Number(log.painScore) || 0));
        const energyRating = Math.max(1, Math.min(5, Number(log.energyRating) || 3));
        const moodRating = Math.max(1, Math.min(5, Number(log.moodRating) || 3));
        const notes = (log.notes || '').slice(0, 500);

        await clientOrPool.query(
          `INSERT INTO symptom_logs (
            profile_id, log_date, cycle_day, bleeding, pain_score,
            functional_impact, impact_types, symptoms, energy_rating, mood_rating,
            notes, is_demo, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW())
          ON CONFLICT (profile_id, log_date) DO UPDATE SET
            cycle_day = EXCLUDED.cycle_day,
            bleeding = EXCLUDED.bleeding,
            pain_score = EXCLUDED.pain_score,
            functional_impact = EXCLUDED.functional_impact,
            impact_types = EXCLUDED.impact_types,
            symptoms = EXCLUDED.symptoms,
            energy_rating = EXCLUDED.energy_rating,
            mood_rating = EXCLUDED.mood_rating,
            notes = EXCLUDED.notes,
            is_demo = true,
            updated_at = NOW()`,
          [
            profile.id,
            log.date || dateKey,
            log.cycleDay || null,
            validBleeding,
            painScore,
            Boolean(log.functionalImpact),
            Array.isArray(log.impactTypes) ? log.impactTypes : [],
            Array.isArray(log.symptoms) ? log.symptoms : [],
            energyRating,
            moodRating,
            notes
          ]
        );
        logCount++;
      }
    }
  }

  // 2. Seed Users with Direct Login Credentials
  for (const acc of DEMO_ACCOUNTS) {
    const pwdHash = hashPassword(acc.password);
    await clientOrPool.query(
      `INSERT INTO users (
        id, email, password_hash, name, profile_id, is_demo, updated_at
      ) VALUES ($1, $2, $3, $4, $5, true, NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        profile_id = EXCLUDED.profile_id,
        is_demo = true,
        updated_at = NOW()`,
      [acc.id, acc.email.toLowerCase(), pwdHash, acc.name, acc.profileId]
    );
    userCount++;
  }

  // 3. Seed initial demo safety events for demonstration
  await clientOrPool.query(
    `INSERT INTO safety_events (
      profile_id, event_date, flag_id, severity, title, reason, action, triggered_fields, is_demo
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
    ON CONFLICT DO NOTHING`,
    [
      'amara',
      '2026-10-11',
      'heavy-bleeding-orthostatic',
      'urgent',
      'Heavy Flow with Dizziness or Lightheadedness',
      'Heavy flow recorded alongside dizziness standing up after lunch.',
      'Seek urgent clinical triage or visit an emergency room promptly.',
      ['bleeding', 'notes', 'symptoms']
    ]
  );

  return { profileCount, logCount, questionCount, userCount };
}

async function run() {
  try {
    console.log('Seeding demo data and direct login accounts...');
    const result = await seedDemoData();
    console.log(
      `Demo seed complete: ${result.profileCount} profiles, ${result.userCount} users, ${result.logCount} logs, ${result.questionCount} custom questions seeded.`
    );
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  run();
}
