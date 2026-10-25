# Saheli Backend API

> [!WARNING]
> **CRITICAL PRIVACY & SECURITY WARNING**:
> This backend service provides demonstration APIs for the Saheli hackathon prototype. While an authentication layer with hashed passwords and signed session tokens is provided for the workflow demo, this service must **NEVER** hold real identifiable patient or medical records. Use synthetic demonstration records only.

---

## 1. Overview

The Saheli Backend is an Express.js REST service backed by Neon PostgreSQL. It manages authentication, user profiles, daily symptom logs, clinician discussion questions, and front-end safety events matching the React frontend's data schemas.

- **Stack**: Node.js (ES Module), Express 4, `pg` (node-postgres), `cors`, `dotenv`, Node built-in `crypto`.
- **Database**: Neon Serverless PostgreSQL with SSL.
- **Port**: `4000` (default).

---

## 2. Environment Variables

Create `.env` in the `Backend` directory (ignored by git):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Local HTTP port for Express | `4000` |
| `DATABASE_URL` | Neon Postgres pooled connection string with SSL | `postgresql://user:pass@ep-xxxx-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Secret key for signing authentication tokens | `saheli-auth-secret-key-2026` |

A template file `Backend/.env.example` is provided with placeholder values.

---

## 3. Scripts

Use `npm.cmd` on Windows or `npm` on Unix:

| Command | Action |
| :--- | :--- |
| `npm.cmd run db:init` | Executes `Backend/db/schema.sql` idempotently to create tables, foreign keys, and indexes. |
| `npm.cmd run db:seed` | Upserts initial demo profiles, direct login demo accounts, and symptom logs matching `SAMPLE_PROFILES` with `is_demo = true`. |
| `npm.cmd run db:reset-demo` | Safely purges only rows marked `is_demo = true` and re-seeds the demo dataset without touching custom user records. |
| `npm.cmd run dev` | Starts server in watch mode using `node --watch index.js`. |
| `npm.cmd start` | Starts the production server using `node index.js`. |

---

## 4. Direct Login Demo Credentials

The backend comes pre-seeded with direct login credentials matching the pre-filled values in `src/pages/AuthPage.jsx`:

| Persona | Email | Password | Linked Profile |
| :--- | :--- | :--- | :--- |
| **Priya Sharma (Default)** | `priya.sharma@demo.saheli.health` | `demo-password-123` | `priya` |
| **Amara K.** | `amara.k@demo.saheli.health` | `demo-password-123` | `amara` |
| **Ananya Sen** | `ananya.sen@demo.saheli.health` | `demo-password-123` | `ananya` |
| **Meera Patel** | `meera.patel@demo.saheli.health` | `demo-password-123` | `meera` |
| **Personal Diary** | `guest@demo.saheli.health` | `demo-password-123` | `guest` |

---

## 5. Database Schema

The database consists of 5 relational tables defined in `db/schema.sql`:

1. **`users`**:
   - `id` (TEXT PRIMARY KEY)
   - `email` (TEXT UNIQUE NOT NULL)
   - `password_hash` (TEXT NOT NULL, scrypt salt + hash)
   - `name` (TEXT NOT NULL)
   - `profile_id` (TEXT REFERENCES profiles(id) ON DELETE SET NULL)
   - `is_demo` (BOOLEAN DEFAULT false)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

2. **`profiles`**:
   - `id` (TEXT PRIMARY KEY, e.g. `'amara'`, `'priya'`, `'guest'`)
   - `name` (TEXT NOT NULL)
   - `age` (INT NULL)
   - `typical_cycle_length` (INT DEFAULT 28)
   - `typical_period_length` (INT DEFAULT 5)
   - `upcoming_visit_date` (DATE NULL)
   - `doctor_name` (TEXT DEFAULT '')
   - `primary_pattern_focus` (TEXT DEFAULT '')
   - `summary_bio` (TEXT DEFAULT '')
   - `current_cycle_day` (INT DEFAULT 1)
   - `current_phase` (TEXT DEFAULT '')
   - `consent_settings` (JSONB)
   - `is_demo` (BOOLEAN DEFAULT false)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

3. **`symptom_logs`**:
   - Composite Primary Key: `(profile_id, log_date)`
   - `bleeding` (TEXT CHECK IN `'None'`, `'Spotting'`, `'Light'`, `'Medium'`, `'Heavy'`)
   - `pain_score` (INT CHECK `0`–`10`)
   - `functional_impact` (BOOLEAN)
   - `impact_types` (TEXT[] DEFAULT '{}')
   - `symptoms` (TEXT[] DEFAULT '{}')
   - `energy_rating` (INT CHECK `1`–`5`)
   - `mood_rating` (INT CHECK `1`–`5`)
   - `notes` (VARCHAR(500))
   - `is_demo` (BOOLEAN DEFAULT false)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

4. **`custom_questions`**:
   - Composite Primary Key: `(profile_id, id)`
   - `text` (TEXT NOT NULL, max 500 chars)
   - `in_report` (BOOLEAN DEFAULT true)
   - `position` (INT DEFAULT 0)
   - `is_demo` (BOOLEAN DEFAULT false)
   - `created_at` (TIMESTAMPTZ)

5. **`safety_events`**:
   - Primary Key: `id` (SERIAL)
   - Stores red-flag notifications detected by the client-side safety engine.
   - `profile_id` (TEXT REFERENCES profiles(id) ON DELETE CASCADE)
   - `event_date` (DATE NOT NULL)
   - `flag_id` (TEXT NOT NULL)
   - `severity` (TEXT NOT NULL)
   - `title` (TEXT NOT NULL)
   - `reason` (TEXT NOT NULL)
   - `action` (TEXT NOT NULL)
   - `triggered_fields` (TEXT[] DEFAULT '{}')
   - `is_demo` (BOOLEAN DEFAULT false)
   - `created_at` (TIMESTAMPTZ)

---

## 6. API Endpoints

All endpoints are hosted under `/api`.

### Authentication
- **`POST /api/auth/login`**
  - Body: `{ email, password }`
  - Returns: `{ success: true, token, user: { id, email, name, profileId }, profile }`
- **`POST /api/auth/signup`**
  - Body: `{ name, email, password }`
  - Validates email uniqueness (returns `409 Conflict` if duplicate), creates user and personal symptom diary profile.
  - Returns: `{ success: true, token, user, profile }`
- **`GET /api/auth/me`**
  - Headers: `Authorization: Bearer <token>`
  - Returns current user details and associated profile.
- **`POST /api/auth/logout`**
  - Clears session context on client.

### Health Check
- **`GET /api/health`**
  - Response: `{ status: "ok", timestamp: "..." }`

### Profiles
- **`GET /api/profiles/:id`**
  - Returns profile metadata, consent settings, and custom questions.
- **`PUT /api/profiles/:id`**
  - Updates profile metadata attributes.

### Symptom Logs
- **`GET /api/profiles/:id/logs`**
  - Returns an object keyed by `YYYY-MM-DD` strings, matching the React front end's `logs` state structure:
    ```json
    {
      "2026-10-08": {
        "date": "2026-10-08",
        "cycleDay": 1,
        "bleeding": "Heavy",
        "painScore": 8,
        "functionalImpact": true,
        "impactTypes": ["Missed work or plans", "Stayed in bed"],
        "symptoms": ["Cramps", "Pelvic pain"],
        "energyRating": 1,
        "moodRating": 2,
        "notes": "Severe pelvic cramping..."
      }
    }
    ```
- **`PUT /api/profiles/:id/logs/:date`**
  - Upserts log entry for the specified calendar date.
- **`DELETE /api/profiles/:id/logs/:date`**
  - Deletes the symptom log entry for that date.

### Clinician Discussion Questions
- **`GET /api/profiles/:id/questions`**
  - Returns ordered array: `[{ id, text, inReport }]`.
- **`PUT /api/profiles/:id/questions`**
  - Atomically replaces discussion questions in transaction.

### Safety Events
- **`GET /api/profiles/:id/safety-events`**
  - Returns safety alerts logged for this profile sorted by date descending.
- **`POST /api/profiles/:id/safety-events`**
  - Persists an alert generated by the client.

### Data Export
- **`GET /api/profiles/:id/export`**
  - Generates JSON backup payload matching the frontend's local export format (`exportVersion: "2.0"`).

---

## 7. Security & Safeguards

- **Password Security**: Uses Node.js native `crypto.scryptSync` with unique 16-byte random salts per user.
- **Token Security**: Tokens are signed with HMAC-SHA256 and verified cryptographically without third-party dependencies.
- **CORS Protection**: Restricted strictly to front end origins `http://localhost:5173` and `http://localhost:5174`.
- **Body Limit**: 200 KB request body limit prevents oversized payloads.
- **Parameterized Queries**: All database interactions use parameter substitution (`$1, $2, ...`) with `pg.Pool`.
- **Information Leak Prevention**: The global error handler shields connection strings, database credentials, and internal stack traces from client responses.
