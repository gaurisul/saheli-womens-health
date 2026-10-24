# Saheli — Symptom-to-Clinician Bridge for Women's Health

> **"Your body tells a continuous story. We help your clinician hear it."**

**Saheli** is a clinically grounded, patient-advocacy web application designed to bridge the **7–10 year diagnostic delay** often associated with endometriosis, PCOS, and heavy menstrual bleeding (menorrhagia). It converts ambiguous, dismissed daily symptoms into cycle-synchronized, explainable clinical evidence and generates a high-density, **doctor-ready one-page printable brief** tailored for a 15-minute consultation.

---

## 🌸 Visual Identity & Design System

- **Background:** Warm ivory/off-white (`#FAF7F2`, `#F4EFEB`)
- **Primary Accent:** Deep berry/burgundy (`#6B1D3A`, `#4F142A`)
- **Selected States:** Muted blush-pink (`#F5E6EB`, `#E4B5C6`)
- **Secondary Data Indicators:** Sage green (`#4E6E58`) and soft terracotta (`#C25E48`)
- **Cards:** Crisp white cards with warm borders (`#EFE7DE`) and rounded corners (`16px`)
- **Typography:**
  - Headings: Editorial serif (*Newsreader* / *Playfair Display*)
  - Body: Modern readable sans-serif (*Plus Jakarta Sans*)
- **Layout:** Fixed desktop sidebar (250px) that transforms into responsive mobile navigation.

---

## 🚀 Tech Stack

- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **Iconography:** Lucide React
- **Data Visualizations:** Recharts (AreaChart, LineChart, BarChart)
- **Styling:** Modular CSS variables and design tokens (`variables.css`, `base.css`)
- **Storage:** Browser-local demo storage (`localStorage`) with JSON export/import and demo profile resets.

---

## 📋 Comprehensive Page Overview

1. **Landing Page (`/`):**
   - Value proposition on overcoming diagnostic dismissal.
   - Highlights the 7–10 year delay, 15-minute appointment challenges, and Saheli's 3-step bridge.
   - One-click interactive case studies for Priya (Endometriosis), Ananya (PCOS), and Meera (Anaemia).

2. **Login & Sign-Up Demo (`/login`, `/signup`):**
   - Interactive demo authentication sandbox with persona shortcuts.
   - Form validation, password visibility toggle, and honest local-storage disclosure.

3. **Today Dashboard (`/dashboard`):**
   - Supportive welcome banner dynamically synchronized to the current cycle day.
   - **Circular Cycle Visualization Wheel:** Interactive SVG clock mapping menstrual, follicular, ovulatory, and luteal phases.
   - **Latest Pattern Insight Card:** Displays detected symptom patterns with a direct "See Evidence" drawer action.
   - **Daily Check-in Quick Card:** Instant logging of today's flow, pain severity (0–10), energy, and mood.
   - **Pain Across Cycle Chart:** Recharts area chart plotting pain levels against cycle days with severe threshold indicators.
   - **Doctor Visit Preparation Card:** Countdown to appointment and summary of discussion topics.
   - **Educational Resource Cards:** In-depth guides on menorrhagia, describing pain, and appointment advocacy.

4. **Daily Symptom Check-in (`/checkin`):**
   - Date picker and auto-calculated Cycle Day.
   - Bleeding flow selection: *None*, *Spotting*, *Light*, *Medium*, *Heavy*.
   - Pain severity scale (0–10) with dynamic clinical descriptors and urgent care warnings for scores ≥9.
   - Functional disability toggle with chips (missed work, bed rest, medication taken).
   - Grouped multi-select symptom chips: *Pain & Body*, *Energy & Sleep*, *Mood & Mental*, *Digestion & GI*, *Skin & Hair*.
   - Energy (1–5) and Mood (1–5) ratings.
   - Optional notes field for medications, physical activity, and dietary triggers.
   - Mini monthly calendar showing logged days with visual flow and pain dots.
   - Real-time save, validation, and confirmation toast.

5. **Cycle Calendar & History (`/calendar`):**
   - Full monthly interactive calendar with cycle day badges, bleeding droplets, and pain heat dots.
   - Click any date to open the inspection drawer or navigate to edit that day's entry.
   - Filter bar: *All Days*, *Flow Recorded*, *High Pain (≥6)*, *Functional Impact*.
   - Multi-cycle comparison table showing duration, bleeding length, peak pain, and incapacitated days.

6. **Insights & Symptom Trends (`/insights`):**
   - **Explainable Pattern Cards:**
     - **Endometriosis-related pattern:** Severe dysmenorrhea, mid-cycle pain, bowel pain, bed rest.
     - **PCOS-related pattern:** Cycle variability >35 days, hormonal acne flare-ups, hirsutism.
     - **Anaemia / Heavy bleeding pattern:** Consecutive heavy flow days, severe chronic fatigue, brain fog.
   - **Data Visualizations:**
     - Pain by cycle day with severe peak threshold line.
     - Energy & mood correlation across phases.
     - Menstrual flow volume distribution.
     - Top co-occurring symptoms frequency bars.
   - Time range toggle: *Last 30 Days*, *Past 3 Cycles*, *6 Months*.

7. **Doctor Visit Preparation & Printable Report (`/doctor-visit`):**
   - Formatted specifically for a 15-minute consultation (60-second clinician review).
   - Sections include: Chief complaint summary, quantitative biometrics, pain dynamics, acute red-flag verification, and prioritized clinician discussion questions.
   - Interactive question builder: add custom questions or delete items.
   - Printable view (`@media print`) that formats the report onto crisp white paper and strips navigation.
   - JSON export capability.

8. **Privacy, Storage & Preferences (`/settings`):**
   - Transparent disclosure on browser-local storage and sandbox limitations (not an EHR system).
   - Editable patient profile: name, age, typical cycle length, doctor name, appointment date.
   - Data management: Export JSON diary, import JSON backup, reset to default sample profiles, or clear all browser storage.
   - Urgent care and emergency triage escalation guides.

---

## ⚕️ Safety, Health Logic & Privacy Disclaimers

- **Non-Diagnostic:** Symptom patterns are explicitly presented as *possible topics to discuss with a clinician*, **never as medical diagnoses**.
- **Demonstration Rules:** All algorithms are marked as *unvalidated prototype demonstration rules* based on published guidelines (ESHRE, ACOG, Rotterdam, FIGO).
- **Red Flag Escalation:** Immediate emergency care advisories for sudden severe pelvic pain, soaking ≥2 pads/hour, fever, or suspected pregnancy complications.
- **Persistent Medical Disclaimer:** Accessible across the entire app and printed directly on doctor briefs.
- **Local Storage Transparency:** Operates solely in `localStorage` without unverified claims of cloud encryption.

---

## 🛠️ How to Run the Application

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Development Server
```bash
# In PowerShell / Command Prompt within the project directory:
npm install

# Start the Vite development server:
npm run dev
```

### Production Build & Preview
```bash
# Build production bundle:
npm run build

# Preview production build locally:
npm run preview
```

---

## ✅ Comprehensive Testing Checklist

Use this checklist to test every feature across all 8 pages:

### 1. Navigation & App Shell
- [ ] Desktop sidebar is visible, fixed, and highlights the active route.
- [ ] Top navbar displays Saheli branding, active persona badge, urgent care button, and disclaimer button.
- [ ] Switching between demo personas (*Priya*, *Ananya*, *Meera*, *Guest*) instantly updates the cycle day, logs, and dashboard metrics.
- [ ] Clicking "Urgent Care" opens the Clinical Red Flags modal with emergency guidance.
- [ ] Clicking "Medical Disclaimer" opens the regulatory and clinical scope modal.
- [ ] Responsive test: Resize browser window below 900px; desktop sidebar hides and mobile bottom navigation appears.

### 2. Landing Page (`/`)
- [ ] Hero headline and 3-step clinical bridge methodology are rendered clearly.
- [ ] Clicking any of the 3 case studies (*Priya*, *Ananya*, *Meera*) switches the profile and redirects to the dashboard.
- [ ] "Explore Live Prototype" button leads to `/dashboard`.
- [ ] Footer links navigate correctly.

### 3. Login & Sign-up Demo (`/login`)
- [ ] Toggle between "Sign In" and "Create Account" tabs smoothly.
- [ ] Clicking any "Instant Demo Login" button loads the chosen profile and enters the dashboard.
- [ ] Password reveal toggle (eye icon) shows/hides the entered password.
- [ ] Form submission validates inputs and shows a welcome confirmation toast.

### 4. Today Dashboard (`/dashboard`)
- [ ] Time-aware greeting (*Good morning / afternoon / evening*) and cycle phase badge are displayed.
- [ ] Circular cycle wheel correctly shows the current cycle day (e.g. Day 14), phase slice colors, and pointer dot.
- [ ] Hovering over cycle phase pills below the wheel highlights corresponding arcs.
- [ ] Latest insight card displays the active pattern with an explanation.
- [ ] Clicking "See Evidence" opens the Evidence Drawer with exact criteria, literature citations, and questions.
- [ ] Quick check-in card allows immediate entry saving or displays today's logged data.
- [ ] Pain across cycle chart shows the severity curve and 7/10 severe threshold line.
- [ ] Educational cards open the reader modal with formatted clinical articles.

### 5. Daily Symptom Check-in (`/checkin`)
- [ ] Date picker defaults to today's date and displays calculated cycle day.
- [ ] Selecting bleeding level (*None*, *Spotting*, *Light*, *Medium*, *Heavy*) updates selection with droplet indicators.
- [ ] Pain severity slider and number buttons (0–10) sync smoothly and update descriptive labels.
- [ ] Logging pain ≥9 triggers an urgent care advisory banner.
- [ ] Functional impact toggle reveals disability chips when "Yes" is selected.
- [ ] Selecting symptom chips across categories (*Pain & Body*, *Energy & Sleep*, *Mood*, *Digestion*, *Skin & Hair*) updates active counts.
- [ ] Energy and Mood ratings (1–5) update with appropriate icons and feedback.
- [ ] Mini calendar highlights previously logged dates; clicking another date loads that day's entry.
- [ ] Clicking "Save Daily Entry" displays a success confirmation toast.
- [ ] Verify that newly saved entries instantly reflect in the dashboard, calendar, and trends chart!

### 6. Cycle Calendar & History (`/calendar`)
- [ ] Month calendar renders with cycle day numbers, bleeding indicators, and pain heat dots.
- [ ] Previous/Next month arrows navigate smoothly.
- [ ] Filter buttons (*All Days*, *Flow Recorded*, *High Pain ≥6*, *Functional Impact*) dim non-matching days.
- [ ] Clicking any day card opens the side inspection drawer with full logged details.
- [ ] Clicking "Edit This Day" navigates to the check-in form with that date loaded.
- [ ] Historical cycles comparison table accurately displays cycle duration and peak pain.

### 7. Insights & Trends (`/insights`)
- [ ] Displays 3 evidence-based pattern cards (*Endometriosis*, *PCOS*, *Anaemia*).
- [ ] Each card clearly states "Demonstration Rule (Unvalidated)" and "Discussion topic for clinician, not a diagnosis".
- [ ] Clicking "See Evidence" opens the explainability drawer detailing exact diary criteria.
- [ ] Time range buttons (*30 Days*, *3 Cycles*, *6 Months*) toggle active state.
- [ ] Recharts visualizations render cleanly:
  - Energy & Mood line chart across menstrual phases.
  - Menstrual flow volume distribution bars.
  - Top co-occurring symptoms progress bars.

### 8. Doctor Visit Preparation & Brief (`/doctor-visit`)
- [ ] Renders the high-density clinician summary: chief complaints, biometrics, pain dynamics, and red-flag verification.
- [ ] Custom Questions section allows adding personal questions and deleting items.
- [ ] Clicking "Export JSON" downloads the complete data backup file.
- [ ] Clicking "Print Brief (PDF)" triggers `window.print()` with print styles (sidebar and buttons hidden).

### 9. Privacy & Settings (`/settings`)
- [ ] Data Architecture card clearly discloses local-only storage and non-EHR status.
- [ ] Consultation preferences form allows editing patient name, age, cycle length, and doctor name.
- [ ] "Download Diary Backup" exports valid JSON data.
- [ ] "Select JSON File" restores backup data.
- [ ] "Reset Demo Data" restores initial rich sample records.
- [ ] "Wipe Local Storage" prompts confirmation and clears diary data.
