import React, { useState, useEffect, useMemo } from 'react';
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
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DailyCheckinPage() {
  const { 
    logs, 
    todayKey, 
    currentProfile, 
    saveEntry, 
    isSavingEntry, 
    deleteEntry, 
    getCycleDayInfo 
  } = useApp();

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

  // Unsaved changes state & confirmation modal
  const [pendingDateSwitch, setPendingDateSwitch] = useState(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);

  // Existing entry for the selected date
  const existingEntry = logs[selectedDate];

  // Populate form when selectedDate changes or existingEntry loads
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
    setSaveSuccessMessage(null);
  }, [selectedDate, existingEntry]);

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    if (!existingEntry) {
      return (
        bleeding !== 'None' ||
        painScore !== 0 ||
        hasFunctionalImpact !== false ||
        selectedSymptoms.length > 0 ||
        notes.trim() !== '' ||
        energyRating !== 3 ||
        moodRating !== 3
      );
    }
    return (
      (existingEntry.bleeding || 'None') !== bleeding ||
      (existingEntry.painScore ?? 0) !== painScore ||
      (existingEntry.functionalImpact ?? false) !== hasFunctionalImpact ||
      JSON.stringify(existingEntry.impactTypes || []) !== JSON.stringify(impactTypes) ||
      JSON.stringify(existingEntry.symptoms || []) !== JSON.stringify(selectedSymptoms) ||
      (existingEntry.energyRating ?? 3) !== energyRating ||
      (existingEntry.moodRating ?? 3) !== moodRating ||
      (existingEntry.notes || '').trim() !== notes.trim()
    );
  }, [
    existingEntry, 
    bleeding, 
    painScore, 
    hasFunctionalImpact, 
    impactTypes, 
    selectedSymptoms, 
    energyRating, 
    moodRating, 
    notes
  ]);

  // Dynamically computed cycle info using single source of truth
  const cycleInfo = getCycleDayInfo(selectedDate);

  // Safe date selection with unsaved changes guard
  const handleRequestDateChange = (newDate) => {
    if (newDate === selectedDate) return;
    if (isDirty) {
      setPendingDateSwitch(newDate);
      setShowUnsavedModal(true);
    } else {
      setSelectedDate(newDate);
    }
  };

  const handleConfirmDiscard = () => {
    if (pendingDateSwitch) {
      setSelectedDate(pendingDateSwitch);
      setPendingDateSwitch(null);
    }
    setShowUnsavedModal(false);
  };

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
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const entryData = {
      date: selectedDate,
      cycleDay: cycleInfo.cycleDay,
      bleeding,
      painScore,
      functionalImpact: hasFunctionalImpact,
      impactTypes: hasFunctionalImpact ? impactTypes : [],
      symptoms: selectedSymptoms,
      energyRating,
      moodRating,
      notes: notes.trim()
    };

    const res = await saveEntry(entryData);
    if (res?.success) {
      setSaveSuccessMessage(`Check-in for ${selectedDate} saved successfully.`);
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }
  };

  // Delete handler
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the check-in record for ${selectedDate}?`)) {
      deleteEntry(selectedDate);
      setSaveSuccessMessage(null);
    }
  };

  return (
    <div className="page-content-wrapper">
      <style>{`
        /* Responsive layout: Desktop 2-column, Mobile 1-column with calendar below form */
        .checkin-layout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.9fr) minmax(300px, 1fr);
          gap: 2rem;
          align-items: flex-start;
        }

        .checkin-form-pane {
          order: 1;
        }

        .checkin-sidebar-pane {
          order: 2;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .checkin-layout-grid {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .checkin-form-pane {
            order: 1;
            width: 100%;
          }

          /* Explicitly display calendar below form on mobile */
          .checkin-sidebar-pane {
            order: 2;
            width: 100%;
          }
        }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.74rem' }}>
                Cycle Day {cycleInfo.cycleDay} {cycleInfo.isEstimated ? '(Estimated)' : ''}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                · {cycleInfo.phase}
              </span>
              <span className={`badge ${existingEntry ? 'badge-sage' : 'badge-amber'}`} style={{ fontSize: '0.68rem' }}>
                {existingEntry ? 'Saved Record · Edit Mode' : 'New Entry'}
              </span>
              {isDirty && (
                <span className="badge badge-amber" style={{ fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  ● Unsaved Changes
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw + 0.3rem, 2.2rem)', color: 'var(--text-primary)', marginBottom: '0.25rem', wordBreak: 'break-word' }}>
              Daily Symptom Check-in
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
              Record physical sensations, menstrual flow, and functional disruption to build your structured clinician brief.
            </p>
          </div>

          {/* Quick Date Switcher & Easy-Reach Save Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-card)', padding: '0.45rem 0.85rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
              <CalendarIcon size={16} color="var(--color-berry)" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleRequestDateChange(e.target.value)}
                aria-label="Select check-in entry date"
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

            <button
              type="button"
              onClick={handleSave}
              disabled={isSavingEntry}
              className="btn btn-primary"
              style={{ fontSize: '0.88rem', padding: '0.55rem 1.25rem' }}
            >
              {isSavingEntry ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Entry</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMessage && (
          <div 
            role="status"
            style={{ 
              marginTop: '1rem', 
              backgroundColor: 'var(--color-sage-light)', 
              border: '1px solid var(--color-sage-border)', 
              borderRadius: '8px', 
              padding: '0.65rem 1rem', 
              fontSize: '0.85rem', 
              color: 'var(--color-sage-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle2 size={16} color="var(--color-sage)" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="checkin-layout-grid">
        
        {/* Main Form Pane */}
        <div className="checkin-form-pane">
          <form onSubmit={handleSave} className="saheli-card" style={{ padding: '2rem' }}>
            
            {/* Bleeding Selection */}
            <BleedingSelector 
              value={bleeding} 
              onChange={setBleeding} 
              disabled={isSavingEntry}
            />

            <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '1.5rem 0' }} />

            {/* Pain Severity Scale 0-10 */}
            <PainSlider 
              value={painScore} 
              onChange={setPainScore} 
              disabled={isSavingEntry}
            />

            <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '1.5rem 0' }} />

            {/* Functional Impact Toggle & Multi-select */}
            <FunctionalImpact 
              hasImpact={hasFunctionalImpact}
              onToggleImpact={setHasFunctionalImpact}
              selectedTypes={impactTypes}
              onToggleType={handleToggleImpactType}
              disabled={isSavingEntry}
            />

            <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '1.5rem 0' }} />

            {/* Grouped Symptom Chips */}
            <SymptomChipGroup 
              selectedSymptoms={selectedSymptoms}
              onToggleSymptom={handleToggleSymptom}
              disabled={isSavingEntry}
            />

            <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '1.5rem 0' }} />

            {/* Energy and Mood Ratings */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <RatingInput 
                label="Vitality & Stamina"
                value={energyRating}
                onChange={setEnergyRating}
                type="energy"
                disabled={isSavingEntry}
              />
              <RatingInput 
                label="Mood & Neurohormonal State"
                value={moodRating}
                onChange={setMoodRating}
                type="mood"
                disabled={isSavingEntry}
              />
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '1.5rem 0' }} />

            {/* Optional Notes */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label 
                  htmlFor="checkin-notes"
                  style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}
                >
                  Medications, Physical Triggers, or Personal Notes (Optional)
                </label>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {notes.length} characters
                </span>
              </div>
              <textarea
                id="checkin-notes"
                rows={3}
                value={notes}
                disabled={isSavingEntry}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Took 500mg Naproxen with food; pain radiated into lower spine; heating pad used for 2 hours..."
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-card)',
                  backgroundColor: 'var(--bg-primary)',
                  resize: 'vertical',
                  lineHeight: 1.5,
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Save & Action Buttons at Bottom */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-card)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                {existingEntry && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSavingEntry}
                    className="btn btn-outline"
                    style={{ color: 'var(--color-critical)', borderColor: 'var(--color-critical-border)', fontSize: '0.84rem' }}
                  >
                    <Trash2 size={15} />
                    <span>Delete Record</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Link to="/dashboard" className="btn btn-secondary" style={{ fontSize: '0.88rem' }}>
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSavingEntry}
                  className="btn btn-primary"
                  style={{ fontSize: '0.92rem', padding: '0.7rem 1.6rem' }}
                >
                  {isSavingEntry ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Daily Entry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar Pane (Mini Calendar & Clinical Advice) */}
        <div className="checkin-sidebar-pane">
          
          {/* Mini Calendar of Logged Dates */}
          <MiniCalendar 
            selectedDate={selectedDate}
            onSelectDate={handleRequestDateChange}
            logs={logs}
          />

          {/* Clinical Logging Guidance */}
          <div className="saheli-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--color-berry)' }}>
              Clinical Logging Tips
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <li style={{ marginBottom: '0.45rem' }}>
                <strong>Quality over quantity:</strong> Even logging 3 key days per week (e.g. onset, peak pain, and mid-cycle) establishes clinically valid trends.
              </li>
              <li style={{ marginBottom: '0.45rem' }}>
                <strong>Functional impact:</strong> Clinicians evaluate impairment (missed work or bed rest) as a primary metric of severity.
              </li>
              <li>
                <strong>Ovulatory twinges:</strong> Discomfort around days 12–16 helps determine whether pain is strictly catamenial or persistent.
              </li>
            </ul>
          </div>

          {/* Active Context Card */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-card)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Active Profile: <strong>{currentProfile.name}</strong> ({currentProfile.primaryPatternFocus}).
            Entries immediately update your Dashboard, Cycle Calendar, and Printable Clinician Brief.
          </div>

        </div>

      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="unsaved-title">
          <div className="modal-card" style={{ maxWidth: '440px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-amber-dark)', marginBottom: '0.75rem' }}>
              <AlertTriangle size={22} color="var(--color-amber)" />
              <h3 id="unsaved-title" style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
                Unsaved Changes
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              You have unrecorded edits for <strong>{selectedDate}</strong>. If you switch dates without saving, your changes will be discarded.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="btn btn-outline"
                style={{ color: 'var(--color-critical)', borderColor: 'var(--color-critical-border)', fontSize: '0.85rem' }}
              >
                Discard & Switch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
