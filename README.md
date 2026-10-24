# Saheli (saheli-womens-health) — Symptom-to-Clinician Bridge for Women's Health

> **"Your body tells a continuous story. We help your clinician hear it."**

**Saheli** is a privacy-first, clinically grounded women's health symptom tracking and clinician summary prototype designed to bridge the **7–10 year diagnostic delay** often associated with endometriosis, PCOS, and heavy menstrual bleeding (menorrhagia). It converts ambiguous, dismissed daily symptoms into cycle-synchronized, explainable clinical evidence and generates a high-density, **doctor-ready one-page printable brief** tailored for a 15-minute consultation.

---

## 🌸 Visual Identity & Design System

- **Background:** Warm ivory/off-white (`#FAF7F2`, `#F4EFEB`)
- **Primary Accent:** Deep berry/burgundy (`#802846`, `#661D35`, `#6B1D3A`)
- **Selected States:** Muted blush-pink (`#FBECEF`, `#F5E6EB`)
- **Secondary Data Indicators:** Sage green (`#2E7D52`, `#4E6E58`) and soft terracotta (`#E06D53`, `#C25E48`)
- **Cards:** Crisp white cards with warm borders (`#EFEAE4`) and rounded corners (`16px`)
- **Typography:**
  - Headings: Editorial serif (*Newsreader* / *Playfair Display*)
  - Body: Modern readable sans-serif (*Plus Jakarta Sans*)
- **Layout:** Fixed desktop sidebar (220px–250px) that transforms into responsive mobile navigation.

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

1. **Landing Page (`/landing`):**
   - Value proposition on overcoming diagnostic dismissal.
   - Highlights the 7–10 year delay, 15-minute appointment challenges, and Saheli's 3-step bridge.
   - One-click interactive case studies for Priya (Endometriosis), Ananya (PCOS), and Meera (Anaemia).

2. **Login & Sign-Up Demo (`/login`, `/signup`):**
   - Interactive demo authentication sandbox with persona shortcuts.
   - Form validation, password visibility toggle, and honest local-storage disclosure.

3. **Today Dashboard (`/`, `/dashboard`):**
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
     - Menstrual flow volume distribution bars.
     - Top co-occurring symptoms progress bars.

7. **Doctor Visit Preparation & Brief (`/visit-prep`, `/doctor-visit`):**
   - High-density, clinician-ready printable one-page brief.
   - Longitudinal tracking metrics: cycle count, average length, period duration.
   - Chief complaints and clinical pattern evidence summary.
   - Patient discussion questions with dynamic checklist inclusion and custom question entry.
   - Direct "Download PDF" (print-ready) and "Create secure link" features.

8. **Privacy & Settings (`/settings`):**
   - Data Architecture: Discloses local-only storage, client-side persistence, and encryption.
   - Consultation preferences editor: Patient name, age, cycle length, attending clinician name.
   - Complete JSON diary export and import.
   - Reset to rich clinical demo personas or wipe local storage.

---

## 🧪 Verification & Acceptance Testing Checklist

### 1. General App Navigation & Responsive Shell
- [ ] Left fixed desktop sidebar (220px) navigates smoothly between **Today**, **Check-in**, **Insights**, **Visit prep**.
- [ ] Pinned "Private by design" card renders at the bottom of the sidebar.
- [ ] Responsive test: Resize browser window below 900px; desktop sidebar transitions to mobile bottom navigation.

### 2. Today Dashboard (`/`, `/dashboard`)
- [ ] Time-aware greeting (*Good morning / afternoon / evening*) and cycle phase badge are displayed.
- [ ] Quick stats bar displays Days logged, Cycle day, Next period date, and Flagged signals.
- [ ] Quick check-in card allows immediate entry saving or displays today's logged data.
- [ ] Upcoming clinician visit card shows appointment countdown and brief shortcuts.

### 3. Daily Symptom Check-in (`/checkin`)
- [ ] Date defaults to today and displays calculated cycle day.
- [ ] Selecting bleeding level (*None*, *Spotting*, *Light*, *Medium*, *Heavy*) updates selection with droplet indicators.
- [ ] Pain severity number buttons (0–10) sync smoothly.
- [ ] Functional impact toggle records daily disability interference.
- [ ] Selecting symptom chips across categories updates active counts.
- [ ] Energy and Mood ratings update with appropriate feedback.
- [ ] Mini calendar highlights previously logged dates and predicted next period.
- [ ] Clicking "Save today's log" displays a confirmation toast.

### 4. Insights & Trends (`/insights`)
- [ ] Displays 4-metric overview bar (Days logged, Cycles analyzed, Health signals, Disruptive days).
- [ ] 3 evidence-based pattern cards (*Severe cyclical pelvic pain*, *Heavier periods alongside fatigue*, *Cold sensitivity & hair shedding*).
- [ ] Expandable accordion reveals *Why it matters*, *Questions to ask*, and *Tests to discuss*.
- [ ] Recharts visualizations render cleanly:
  - Pain by cycle day area chart.
  - Heavy-flow days per cycle bar chart.
  - Most frequent symptoms comparison bars.

### 5. Doctor Visit Preparation & Brief (`/visit-prep`, `/doctor-visit`)
- [ ] Renders the high-density clinician summary: chief complaints, biometrics, pain dynamics, and symptom table.
- [ ] Custom Questions section allows adding personal questions and toggling report inclusion.
- [ ] Clicking "Download PDF" triggers `window.print()` with print styles (sidebar and buttons hidden).
- [ ] Clicking "Create secure link" copies shareable URL to clipboard with confirmation toast.

### 6. Privacy & Settings (`/settings`)
- [ ] Data Architecture card clearly discloses local-only storage and non-EHR status.
- [ ] Consultation preferences form allows editing patient name, age, cycle length, and doctor name.
- [ ] "Download Diary Backup" exports valid JSON data.
- [ ] "Select JSON File" restores backup data.
- [ ] "Reset Demo Data" restores initial rich sample records.
- [ ] "Wipe Local Storage" prompts confirmation and clears diary data.
