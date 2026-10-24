import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import BleedingSelector from '../components/checkin/BleedingSelector';
import PainSlider from '../components/checkin/PainSlider';
import FunctionalImpact from '../components/checkin/FunctionalImpact';
import SymptomChipGroup from '../components/checkin/SymptomChipGroup';
import RatingInput from '../components/checkin/RatingInput';
import MiniCalendar from '../components/checkin/MiniCalendar';
import { 
  Calendar as CalendarIcon, 
  Save, 
  Trash2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DailyCheckinPage() {
  const { logs, todayKey, currentProfile, saveEntry, deleteEntry } = useApp();

  // Selected date defaults to today
  const [selectedDate, setSelectedDate] = useState(todayKey);

  // Form fields
  const [bleeding, setBleeding] = useState('None');
  const [painScore, setPainScore] = useState(0);
  const [hasFunctionalImpact, setHasFunctionalImpact] = useState(false);
  const [impactTypes, setImpactTypes] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [energyRating, setEnergyRating] = useState(3);
  const [moodRating, setMoodRating] = useState(3);
  const [notes, setNotes] = useState('');

  // Existing entry for the selected date
  const existingEntry = logs[selectedDate];

  // Whenever selectedDate changes, populate form with existing values or reset
  useEffect(() => {
    if (existingEntry) {
      setBleeding(existingEntry.bleeding || 'None');
      setPainScore(existingEntry.painScore ?? 0);
      setHasFunctionalImpact(existingEntry.functionalImpact ?? false);
      setImpactTypes(existingEntry.impactTypes || []);
      setSelectedSymptoms(existingEntry.symptoms || []);
      setEnergyRating(existingEntry.energyRating ?? 3);
      setMoodRating(existingEntry.moodRating ?? 3);
      setNotes(existingEntry.notes || '');
    } else {
      setBleeding('None');
      setPainScore(0);
      setHasFunctionalImpact(false);
      setImpactTypes([]);
      setSelectedSymptoms([]);
      setEnergyRating(3);
      setMoodRating(3);
      setNotes('');
    }
  }, [selectedDate, existingEntry]);

  // Compute Cycle Day relative to current profile
  const getCycleDayForDate = (dateStr) => {
    if (existingEntry && existingEntry.cycleDay) {
      return existingEntry.cycleDay;
    }
    // Calculate difference in days from today
    const selected = new Date(dateStr);
    const today = new Date(todayKey);
    const diffTime = selected.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    const calculatedDay = ((currentProfile.currentCycleDay + diffDays - 1) % (currentProfile.typicalCycleLength || 28)) + 1;
    return calculatedDay > 0 ? calculatedDay : calculatedDay + (currentProfile.typicalCycleLength || 28);
  };

  const calculatedCycleDay = getCycleDayForDate(selectedDate);

  // Toggle symptom chip
  const handleToggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  // Toggle functional impact chip
  const handleToggleImpactType = (type) => {
    setImpactTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Save handler
  const handleSave = (e) => {
    e.preventDefault();

    // Validation: Ensure valid data
    const entryData = {
      date: selectedDate,
      cycleDay: calculatedCycleDay,
      bleeding,
      painScore,
      functionalImpact: hasFunctionalImpact,
      impactTypes: hasFunctionalImpact ? impactTypes : [],
      symptoms: selectedSymptoms,
      energyRating,
      moodRating,
      notes: notes.trim()
    };

    saveEntry(entryData);
  };

  // Delete handler
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the check-in for ${selectedDate}?`)) {
      deleteEntry(selectedDate);
    }
  };

  return (
    <div className="page-content-wrapper">
      {/* Page Heading & Date Selector */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.74rem' }}>
                Cycle Day {calculatedCycleDay}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {existingEntry ? '• Existing Log Loaded' : '• New Entry'}
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
              Daily Symptom Check-in
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Record today's physical sensations, pain severity, and functional impact to build your clinician briefing.
            </p>
          </div>

          {/* Date Picker Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-card)', padding: '0.45rem 0.85rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            <CalendarIcon size={16} color="var(--color-berry)" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Main Check-in Form + Sidebar Mini Calendar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Main Form Card */}
        <form onSubmit={handleSave} className="saheli-card" style={{ padding: '2rem' }}>
          
          {/* Bleeding Selection */}
          <BleedingSelector 
            value={bleeding} 
            onChange={setBleeding} 
          />

          <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '1.5rem 0' }} />

          {/* Pain Severity Scale 0-10 */}
          <PainSlider 
            value={painScore} 
            onChange={setPainScore} 
          />

          <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '1.5rem 0' }} />

          {/* Functional Impact Toggle & Multi-select */}
          <FunctionalImpact 
            hasImpact={hasFunctionalImpact}
            onToggleImpact={setHasFunctionalImpact}
            selectedTypes={impactTypes}
            onToggleType={handleToggleImpactType}
          />

          <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '1.5rem 0' }} />

          {/* Grouped Symptom Chips */}
          <SymptomChipGroup 
            selectedSymptoms={selectedSymptoms}
            onToggleSymptom={handleToggleSymptom}
          />

          <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '1.5rem 0' }} />

          {/* Energy and Mood Ratings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <RatingInput 
              label="Energy & Vitality"
              value={energyRating}
              onChange={setEnergyRating}
              type="energy"
            />
            <RatingInput 
              label="Mood & Emotional State"
              value={moodRating}
              onChange={setMoodRating}
              type="mood"
            />
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '1.5rem 0' }} />

          {/* Optional Notes */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Medications, Triggers, or Personal Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Took 400mg Ibuprofen with breakfast; pain radiated into lower spine; heating pad used for 2 hours..."
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                border: '1px solid var(--border-card)',
                backgroundColor: 'var(--bg-primary)',
                resize: 'vertical',
                lineHeight: 1.5
              }}
            />
          </div>

          {/* Save & Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-card)' }}>
            <div>
              {existingEntry && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-outline"
                  style={{ color: '#C25E48', borderColor: '#E8ACA0', fontSize: '0.84rem' }}
                >
                  <Trash2 size={15} />
                  <span>Delete Entry</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/dashboard" className="btn btn-secondary" style={{ fontSize: '0.88rem' }}>
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontSize: '0.92rem', padding: '0.7rem 1.6rem' }}
              >
                <Save size={16} />
                <span>Save Daily Entry</span>
              </button>
            </div>
          </div>
        </form>

        {/* Sidebar: Mini Calendar and Quick Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Mini Calendar of Logged Dates */}
          <MiniCalendar 
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            logs={logs}
          />

          {/* Symptom Logging Advice Card */}
          <div className="saheli-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--color-berry)' }}>
              Clinical Logging Tips
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>Consistency over perfection:</strong> Even logging 3 key days per week provides clinically meaningful trends.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>Functional impact matters:</strong> Doctors pay strong attention to days where work, school, or bed rest was affected.
              </li>
              <li>
                <strong>Mid-cycle pain:</strong> Note any sharp pelvic discomfort around Cycle Day 12–16 (ovulatory window).
              </li>
            </ul>
          </div>

          {/* Active Profile Info */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-card)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Logging for: <strong>{currentProfile.name}</strong> ({currentProfile.primaryPatternFocus}).
            Entries immediately sync across Calendar, Insights, and the Clinician Brief.
          </div>

        </div>

      </div>
    </div>
  );
}
