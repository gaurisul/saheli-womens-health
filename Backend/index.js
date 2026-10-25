import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { pool, query } from './db/db.js';
import {
  isValidProfileId,
  isValidDateStr,
  validateLogPayload
} from './validators.js';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
} from './auth.js';

// Ensure DATE columns are returned as YYYY-MM-DD strings without timezone shifting
pg.types.setTypeParser(1082, (val) => val);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 4000;

// CORS restricted strictly to localhost:5173 and localhost:5174
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. curl / automated test runners) with no origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

// Payload size limit max 200kb
app.use(express.json({ limit: '200kb' }));

// Helper to format profile for response
function formatProfile(row, questions = []) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    age: row.age !== null ? row.age : '',
    typicalCycleLength: row.typical_cycle_length,
    typicalPeriodLength: row.typical_period_length,
    upcomingVisitDate: row.upcoming_visit_date || '',
    doctorName: row.doctor_name || '',
    primaryPatternFocus: row.primary_pattern_focus || '',
    summaryBio: row.summary_bio || '',
    currentCycleDay: row.current_cycle_day,
    currentPhase: row.current_phase || '',
    consentSettings: row.consent_settings || {},
    customQuestions: questions.map((q) => ({
      id: q.id,
      text: q.text,
      inReport: q.in_report
    })),
    isDemo: row.is_demo
  };
}

// Helper to format a symptom log row
function formatLogRow(row) {
  if (!row) return null;
  return {
    date: row.log_date,
    cycleDay: row.cycle_day,
    bleeding: row.bleeding,
    painScore: row.pain_score,
    functionalImpact: row.functional_impact,
    impactTypes: row.impact_types || [],
    symptoms: row.symptoms || [],
    energyRating: row.energy_rating,
    moodRating: row.mood_rating,
    notes: row.notes || '',
    updatedAt: row.updated_at
  };
}

// Helper to validate email format
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required.' });
  }

  try {
    const userRes = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];
    const isMatch = verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Retrieve linked profile
    let profileData = null;
    if (user.profile_id) {
      const profRes = await query('SELECT * FROM profiles WHERE id = $1', [user.profile_id]);
      if (profRes.rows.length > 0) {
        const qRes = await query(
          'SELECT id, text, in_report, position FROM custom_questions WHERE profile_id = $1 ORDER BY position ASC, created_at ASC',
          [user.profile_id]
        );
        profileData = formatProfile(profRes.rows[0], qRes.rows);
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      profileId: user.profile_id
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileId: user.profile_id,
        isDemo: user.is_demo
      },
      profile: profileData
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if email already exists
    const existing = await client.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Create a new user profile
    const profileId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProfileRes = await client.query(
      `INSERT INTO profiles (
        id, name, age, typical_cycle_length, typical_period_length,
        upcoming_visit_date, doctor_name, primary_pattern_focus, summary_bio,
        current_cycle_day, current_phase, consent_settings, is_demo, created_at, updated_at
      ) VALUES ($1, $2, null, 28, 5, null, '', 'Personal Symptom Diary', 'Private symptom diary.', 1, 'Follicular Phase', '{"includeName": true, "includeAge": true, "includeNotes": true, "includeMood": true, "includeTrends": true}'::jsonb, false, NOW(), NOW())
      RETURNING *`,
      [profileId, name.trim()]
    );

    // Create default question
    await client.query(
      `INSERT INTO custom_questions (id, profile_id, text, in_report, position, is_demo, created_at)
       VALUES ($1, $2, $3, true, 0, false, NOW())`,
      [`q1_${Date.now()}`, profileId, 'How do my tracked symptoms compare to expected menstrual patterns?']
    );

    // Create user record
    const userId = `u_${Date.now()}`;
    const passwordHash = hashPassword(password);
    const userRes = await client.query(
      `INSERT INTO users (id, email, password_hash, name, profile_id, is_demo, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW(), NOW())
       RETURNING id, email, name, profile_id, is_demo`,
      [userId, email.trim().toLowerCase(), passwordHash, name.trim(), profileId]
    );

    await client.query('COMMIT');

    const createdUser = userRes.rows[0];
    const token = generateToken({
      userId: createdUser.id,
      email: createdUser.email,
      profileId: createdUser.profile_id
    });

    const formatted = formatProfile(newProfileRes.rows[0], [
      { id: `q1_${Date.now()}`, text: 'How do my tracked symptoms compare to expected menstrual patterns?', in_report: true }
    ]);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        profileId: createdUser.profile_id,
        isDemo: createdUser.is_demo
      },
      profile: formatted
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/auth/me
app.get('/api/auth/me', async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }

  try {
    const userRes = await query(
      'SELECT id, email, name, profile_id, is_demo FROM users WHERE id = $1',
      [payload.userId]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const user = userRes.rows[0];
    let profileData = null;
    if (user.profile_id) {
      const profRes = await query('SELECT * FROM profiles WHERE id = $1', [user.profile_id]);
      if (profRes.rows.length > 0) {
        const qRes = await query(
          'SELECT id, text, in_report, position FROM custom_questions WHERE profile_id = $1 ORDER BY position ASC, created_at ASC',
          [user.profile_id]
        );
        profileData = formatProfile(profRes.rows[0], qRes.rows);
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileId: user.profile_id,
        isDemo: user.is_demo
      },
      profile: profileData
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ----------------------------------------------------
// PROFILES & LOGS ROUTES
// ----------------------------------------------------

// GET /api/profiles/:id
app.get('/api/profiles/:id', async (req, res, next) => {
  const { id } = req.params;
  if (!isValidProfileId(id)) {
    return res.status(400).json({ error: 'Invalid profile ID format.' });
  }

  try {
    const profileRes = await query(
      'SELECT * FROM profiles WHERE id = $1',
      [id]
    );

    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: `Profile '${id}' not found.` });
    }

    const questionsRes = await query(
      'SELECT id, text, in_report, position FROM custom_questions WHERE profile_id = $1 ORDER BY position ASC, created_at ASC',
      [id]
    );

    res.json(formatProfile(profileRes.rows[0], questionsRes.rows));
  } catch (err) {
    next(err);
  }
});

// PUT /api/profiles/:id
app.put('/api/profiles/:id', async (req, res, next) => {
  const { id } = req.params;
  if (!isValidProfileId(id)) {
    return res.status(400).json({ error: 'Invalid profile ID format.' });
  }

  const {
    name,
    age,
    typicalCycleLength,
    typicalPeriodLength,
    upcomingVisitDate,
    doctorName,
    primaryPatternFocus,
    summaryBio,
    currentCycleDay,
    currentPhase,
    consentSettings
  } = req.body;

  // Validation
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ error: 'Name must be a non-empty string.' });
  }

  const ageVal = age !== undefined && age !== '' && age !== null ? Number(age) : null;
  if (ageVal !== null && (!Number.isInteger(ageVal) || ageVal < 1 || ageVal > 130)) {
    return res.status(400).json({ error: 'Age must be an integer between 1 and 130.' });
  }

  const visitDate = upcomingVisitDate && isValidDateStr(upcomingVisitDate) ? upcomingVisitDate : null;

  try {
    const updateRes = await query(
      `UPDATE profiles
       SET name = COALESCE($1, name),
           age = COALESCE($2, age),
           typical_cycle_length = COALESCE($3, typical_cycle_length),
           typical_period_length = COALESCE($4, typical_period_length),
           upcoming_visit_date = COALESCE($5, upcoming_visit_date),
           doctor_name = COALESCE($6, doctor_name),
           primary_pattern_focus = COALESCE($7, primary_pattern_focus),
           summary_bio = COALESCE($8, summary_bio),
           current_cycle_day = COALESCE($9, current_cycle_day),
           current_phase = COALESCE($10, current_phase),
           consent_settings = COALESCE($11, consent_settings),
           updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [
        name ? name.trim() : null,
        ageVal,
        typicalCycleLength ? Number(typicalCycleLength) : null,
        typicalPeriodLength ? Number(typicalPeriodLength) : null,
        visitDate,
        doctorName !== undefined ? doctorName : null,
        primaryPatternFocus !== undefined ? primaryPatternFocus : null,
        summaryBio !== undefined ? summaryBio : null,
        currentCycleDay !== undefined ? Number(currentCycleDay) : null,
        currentPhase !== undefined ? currentPhase : null,
        consentSettings ? JSON.stringify(consentSettings) : null,
        id
      ]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: `Profile '${id}' not found.` });
    }

    const questionsRes = await query(
      'SELECT id, text, in_report, position FROM custom_questions WHERE profile_id = $1 ORDER BY position ASC, created_at ASC',
      [id]
    );

    res.json(formatProfile(updateRes.rows[0], questionsRes.rows));
  } catch (err) {
    next(err);
  }
});

// GET /api/profiles/:id/logs (Object keyed by YYYY-MM-DD, matching front end)
app.get('/api/profiles/:id/logs', async (req, res, next) => {
  const { id } = req.params;
  if (!isValidProfileId(id)) {
    return res.status(400).json({ error: 'Invalid profile ID format.' });
  }

  try {
    // Verify profile exists
    const profileCheck = await query('SELECT id FROM profiles WHERE id = $1', [id]);
    if (profileCheck.rows.length === 0) {
      return res.status(404).json({ error: `Profile '${id}' not found.` });
    }

    const logsRes = await query(
      'SELECT * FROM symptom_logs WHERE profile_id = $1 ORDER BY log_date ASC',
      [id]
    );

    const logsMap = {};
    for (const row of logsRes.rows) {
      logsMap[row.log_date] = formatLogRow(row);
    }

    res.json(logsMap);
  } catch (err) {
    next(err);
  }
});

// PUT /api/profiles/:id/logs/:date
app.put('/api/profiles/:id/logs/:date', async (req, res, next) => {
  const { id, date } = req.params;
  if (!isValidProfileId(id)) {
    return res.status(400).json({ error: 'Invalid profile ID format.' });
  }

  const validation = validateLogPayload(req.body, date);
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const {
    cycleDay = null,
    bleeding = 'None',
    painScore = 0,
    functionalImpact = false,
    impactTypes = [],
    symptoms = [],
    energyRating = 3,
    moodRating = 3,
    notes = ''
  } = req.body;

  try {
    // Ensure profile exists
    const profileCheck = await query('SELECT id FROM profiles WHERE id = $1', [id]);
    if (profileCheck.rows.length === 0) {
      return res.status(404).json({ error: `Profile '${id}' not found.` });
    }

    const upsertRes = await query(
      `INSERT INTO symptom_logs (
        profile_id, log_date, cycle_day, bleeding, pain_score,
        functional_impact, impact_types, symptoms, energy_rating, mood_rating,
        notes, is_demo, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, NOW())
      ON CONFLICT (profile_id, log_date) DO UPDATE SET
        cycle_day = COALESCE(EXCLUDED.cycle_day, symptom_logs.cycle_day),
        bleeding = EXCLUDED.bleeding,
        pain_score = EXCLUDED.pain_score,
        functional_impact = EXCLUDED.functional_impact,
        impact_types = EXCLUDED.impact_types,
        symptoms = EXCLUDED.symptoms,
        energy_rating = EXCLUDED.energy_rating,
        mood_rating = EXCLUDED.mood_rating,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *`,
      [
        id,
        date,
        cycleDay ? Number(cycleDay) : null,
        bleeding,
        Number(painScore),
        Boolean(functionalImpact),
        impactTypes,
        symptoms,
        Number(energyRating),
        Number(moodRating),
        notes ? notes.trim() : ''
      ]
    );

    res.json(formatLogRow(upsertRes.rows[0]));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/profiles/:id/logs/:date
app.delete('/api/profiles/:id/logs/:date', async (req, res, next) => {
  const { id, date } = req.params;
  if (!isValidProfileId(id)) {
    return res.status(400).json({ error: 'Invalid profile ID format.' });
  }
  if (!isValidDateStr(date)) {
    return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
  }

  try {
    const deleteRes = await query(
      'DELETE FROM symptom_logs WHERE profile_id = $1 AND log_date = $2 RETURNING log_date',
      [id, date]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: `Log entry for '${date}' not found.` });
    }

    res.json({ success: true, deletedDate: date });
  } catch (err) {
    next(err);
  }
});

// GET /api/profiles/:id/questions
app.get('/api/profiles/:id/questions', async (req, res, next) => {
  const { id } = req.params;
  if (!isValidProfileId(id)) {
    return res.status(400).json({ error: 'Invalid profile ID format.' });
  }

  try {
    const profileCheck = await query('SELECT id FROM profiles WHERE id = $1', [id]);
    if (profileCheck.rows.length === 0) {
      return res.status(404).json({ error: `Profile '${id}' not found.` });
    }

    const questionsRes = await query(
      'SELECT id, text, in_report, position FROM custom_questions WHERE profile_id = $1 ORDER BY position ASC, created_at ASC',
      [id]
    );

    const questions = questionsRes.rows.map((q) => ({
      id: q.id,
      text: q.text,
      inReport: q.in_report
    }));

    res.json(questions);
  } catch (err) {
    next(err);
  }
});

// PUT /api/profiles/:id/questions
app.put('/api/profiles/:id/questions', async (req, res, next) => {
  const { id } = req.params;
  if (!isValidProfileId(id)) {
    return res.status(400).json({ error: 'Invalid profile ID format.' });
  }

  const { questions } = req.body;
  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: 'Request body must contain a questions array.' });
  }

  if (questions.length > 50) {
    return res.status(400).json({ error: 'Cannot exceed 50 questions.' });
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q || typeof q.text !== 'string' || !q.text.trim()) {
      return res.status(400).json({ error: `Question at index ${i} must have non-empty text.` });
    }
    if (q.text.length > 500) {
      return res.status(400).json({ error: `Question at index ${i} exceeds 500 characters.` });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure profile exists
    const profileCheck = await client.query('SELECT id FROM profiles WHERE id = $1', [id]);
    if (profileCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `Profile '${id}' not found.` });
    }

    // Replace questions in transaction
    await client.query('DELETE FROM custom_questions WHERE profile_id = $1', [id]);

    const inserted = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qId = q.id || `q-${i + 1}-${Date.now()}`;
      const inReport = q.inReport !== false;

      const resInsert = await client.query(
        `INSERT INTO custom_questions (id, profile_id, text, in_report, position, is_demo)
         VALUES ($1, $2, $3, $4, $5, false)
         RETURNING id, text, in_report`,
        [qId, id, q.text.trim(), inReport, i]
      );
      inserted.push({
        id: resInsert.rows[0].id,
        text: resInsert.rows[0].text,
        inReport: resInsert.rows[0].in_report
      });
    }

    await client.query('COMMIT');
    res.json(inserted);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/profiles/:id/safety-events
app.get('/api/profiles/:id/safety-events', async (req, res, next) => {
  const { id } = req.params;
  if (!isValidProfileId(id)) {
    return res.status(400).json({ error: 'Invalid profile ID format.' });
  }

  try {
    const profileCheck = await query('SELECT id FROM profiles WHERE id = $1', [id]);
    if (profileCheck.rows.length === 0) {
      return res.status(404).json({ error: `Profile '${id}' not found.` });
    }

    const eventsRes = await query(
      'SELECT * FROM safety_events WHERE profile_id = $1 ORDER BY event_date DESC, created_at DESC',
      [id]
    );

    const events = eventsRes.rows.map((row) => ({
      id: row.id,
      profileId: row.profile_id,
      eventDate: row.event_date,
      flagId: row.flag_id,
      severity: row.severity,
      title: row.title,
      reason: row.reason,
      action: row.action,
      triggeredFields: row.triggered_fields || [],
      isDemo: row.is_demo,
      createdAt: row.created_at
    }));

    res.json(events);
  } catch (err) {
    next(err);
  }
});

// POST /api/profiles/:id/safety-events (stores flags front end produces; no triage logic here)
app.post('/api/profiles/:id/safety-events', async (req, res, next) => {
  const { id } = req.params;
  if (!isValidProfileId(id)) {
    return res.status(400).json({ error: 'Invalid profile ID format.' });
  }

  const {
    eventDate,
    triggeredDate,
    date,
    flagId,
    severity,
    title,
    reason,
    action,
    triggeredFields
  } = req.body;

  const targetDate = eventDate || triggeredDate || date || new Date().toISOString().split('T')[0];
  if (!isValidDateStr(targetDate)) {
    return res.status(400).json({ error: 'Invalid event date format. Expected YYYY-MM-DD.' });
  }

  const finalFlagId = flagId || req.body.id || 'unspecified-safety-flag';
  const finalSeverity = severity || 'urgent';
  const finalTitle = title || 'Safety Notice';
  const finalReason = reason || '';
  const finalAction = action || 'Consult clinician or urgent services.';
  const finalFields = Array.isArray(triggeredFields) ? triggeredFields : [];

  try {
    const profileCheck = await query('SELECT id FROM profiles WHERE id = $1', [id]);
    if (profileCheck.rows.length === 0) {
      return res.status(404).json({ error: `Profile '${id}' not found.` });
    }

    const insertRes = await query(
      `INSERT INTO safety_events (
        profile_id, event_date, flag_id, severity, title, reason, action, triggered_fields, is_demo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
      RETURNING *`,
      [id, targetDate, finalFlagId, finalSeverity, finalTitle, finalReason, finalAction, finalFields]
    );

    const row = insertRes.rows[0];
    res.status(201).json({
      success: true,
      event: {
        id: row.id,
        profileId: row.profile_id,
        eventDate: row.event_date,
        flagId: row.flag_id,
        severity: row.severity,
        title: row.title,
        reason: row.reason,
        action: row.action,
        triggeredFields: row.triggered_fields,
        isDemo: row.is_demo,
        createdAt: row.created_at
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/profiles/:id/export (export matching front end backup JSON structure)
app.get('/api/profiles/:id/export', async (req, res, next) => {
  const { id } = req.params;
  if (!isValidProfileId(id)) {
    return res.status(400).json({ error: 'Invalid profile ID format.' });
  }

  try {
    const profileRes = await query('SELECT * FROM profiles WHERE id = $1', [id]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: `Profile '${id}' not found.` });
    }

    const questionsRes = await query(
      'SELECT id, text, in_report, position FROM custom_questions WHERE profile_id = $1 ORDER BY position ASC, created_at ASC',
      [id]
    );

    const logsRes = await query(
      'SELECT * FROM symptom_logs WHERE profile_id = $1 ORDER BY log_date ASC',
      [id]
    );

    const logsMap = {};
    for (const row of logsRes.rows) {
      logsMap[row.log_date] = formatLogRow(row);
    }

    const profileObj = formatProfile(profileRes.rows[0], questionsRes.rows);
    profileObj.logs = logsMap;

    const exportPayload = {
      exportVersion: '2.0',
      exportedAt: new Date().toISOString(),
      activeProfileId: id,
      profile: profileObj,
      disclaimer: 'Saheli local-first symptom diary backup. Unvalidated demonstration data.'
    };

    res.json(exportPayload);
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// GLOBAL ERROR HANDLER
// Never leak stack traces or connection strings to clients
// ----------------------------------------------------
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS origin not permitted.' });
  }

  // Safe server-side error logging
  console.error('Unhandled server error:', err.message);

  res.status(err.status || 500).json({
    error: 'An internal server error occurred.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Saheli Backend running on port ${PORT}`);
});
