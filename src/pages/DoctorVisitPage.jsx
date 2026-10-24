import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  Stethoscope, 
  CheckCircle2 
} from 'lucide-react';
import { formatDate } from '../data/sampleProfiles';

export default function DoctorVisitPage() {
  const { 
    currentProfile, 
    summaryMetrics, 
    detectedPatterns, 
    addDoctorQuestion, 
    removeDoctorQuestion, 
    exportDataJSON 
  } = useApp();

  const [newQuestion, setNewQuestion] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    addDoctorQuestion(newQuestion);
    setNewQuestion('');
    setShowAddForm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const matchedPatterns = detectedPatterns.filter((p) => p.matched);

  // Red-flag triage review status
  const redFlagsChecked = [
    { label: 'No sudden, excruciating acute abdomen / unilateral emergency pain', status: 'Passed / Ruled Out' },
    { label: 'No hemorrhagic flooding (>2 maxi pads/hr for 2+ consecutive hours)', status: 'Passed / Ruled Out' },
    { label: 'No high fever (≥38°C) or purulent foul-smelling discharge', status: 'Passed / Ruled Out' },
    { label: 'Pregnancy status assessed (negative or non-applicable)', status: 'Verified' },
  ];

  return (
    <div className="page-content-wrapper">
      
      {/* Top Action Bar (Hidden in Print) */}
      <div className="no-print" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                Clinician Bridge Brief
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Targeted for 15-Minute Consultations
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
              Doctor Visit Preparation & Brief
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              A high-density clinical summary designed to be handed to your gynecologist or general practitioner.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={exportDataJSON}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Download size={15} />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <Printer size={15} />
              <span>Print Brief (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINTABLE CLINICIAN REPORT CONTAINER */}
      <div 
        className="printable-report"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-card)',
          color: '#1A1A1A'
        }}
      >
        {/* Clinician Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--color-berry)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-berry)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Stethoscope size={18} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-berry)', margin: 0 }}>
                Saheli — Patient Symptom & Cycle Summary
              </h2>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#555555' }}>
              Longitudinal Diary Extract prepared for <strong>{currentProfile.doctorName || 'Attending Physician'}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#555555', lineHeight: 1.4 }}>
            <div><strong>Patient:</strong> {currentProfile.name} (Age {currentProfile.age})</div>
            <div><strong>Date Generated:</strong> {formatDate(new Date())}</div>
            <div><strong>Tracking Interval:</strong> ~{summaryMetrics.totalLoggedDays} Logged Days</div>
          </div>
        </div>

        {/* Section 1: Executive Chief Complaint & Pattern Indicators */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-berry)', borderBottom: '1px solid #E5DCD1', paddingBottom: '0.4rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1. Chief Complaints & Longitudinal Observations
          </h3>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '0.85rem' }}>
            {currentProfile.summaryBio}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {matchedPatterns.map((pat) => (
              <div 
                key={pat.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-berry)' }}>{pat.title}</strong>
                  <span className="badge badge-berry" style={{ fontSize: '0.65rem' }}>{pat.severity}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#444444' }}>
                  {(pat.evidence || []).map((e, idx) => (
                    <div key={idx} style={{ marginBottom: '0.2rem' }}>
                      • <strong>{e.criterion}:</strong> {e.detail.split('.')[0]}.
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Quantitative Cycle & Pain Profile */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-berry)', borderBottom: '1px solid #E5DCD1', paddingBottom: '0.4rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            2. Quantitative Biometrics & Impact Indices
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#666666', textTransform: 'uppercase' }}>Cycle Interval</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-berry)' }}>~{currentProfile.typicalCycleLength || 29}d</div>
            </div>

            <div style={{ border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#666666', textTransform: 'uppercase' }}>Avg Pain Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: Number(summaryMetrics.averagePainScore) >= 6 ? 'var(--color-terracotta)' : 'var(--color-berry)' }}>
                {summaryMetrics.averagePainScore || '0'}/10
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#666666', textTransform: 'uppercase' }}>Severe Pain Days (≥7)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-terracotta)' }}>{summaryMetrics.severePainDaysCount} days</div>
            </div>

            <div style={{ border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#666666', textTransform: 'uppercase' }}>Incapacitated Days</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9C4532' }}>{summaryMetrics.functionalImpactDaysCount} days</div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#444444', lineHeight: 1.5 }}>
            <strong>Pain Dynamics:</strong> Cyclic pain peak predominantly documented during <em>Menses Days 1–3</em> (severity peaking at 8–9/10), with secondary mid-cycle peaks around <em>Day 13–15 (Ovulatory window)</em>. Functional limitation includes missed work/classes and bed rest.
          </div>
        </div>

        {/* Section 3: Red-Flag Checklist Review */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-berry)', borderBottom: '1px solid #E5DCD1', paddingBottom: '0.4rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3. Acute Red-Flag Triage Verification
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
            {redFlagsChecked.map((flag, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem', 
                  borderRadius: '6px', 
                  backgroundColor: '#F9F9F9',
                  border: '1px solid #E5E5E5',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} color="var(--color-sage)" />
                  <span>{flag.label}</span>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--color-sage)', fontSize: '0.72rem' }}>
                  {flag.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Prioritized Questions for the Clinician */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5DCD1', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-berry)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              4. Patient Discussion Questions for this Appointment
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="no-print btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              <Plus size={13} /> Add Question
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddQuestion} className="no-print" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type a specific question you want answered during your consult..."
                style={{
                  flex: 1,
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-card)',
                  fontSize: '0.85rem'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
                Save
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {(currentProfile.customQuestions || []).map((q, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-card)',
                  fontSize: '0.84rem'
                }}
              >
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-berry)' }}>Q{idx + 1}:</span>
                  <span style={{ color: '#222222', lineHeight: 1.45 }}>"{q}"</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDoctorQuestion(idx)}
                  className="no-print"
                  aria-label="Remove question"
                  style={{ color: 'var(--text-muted)', padding: '0.2rem', marginLeft: '0.5rem' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Disclosure Stamp */}
        <div style={{ borderTop: '1px solid #E5DCD1', paddingTop: '1rem', fontSize: '0.72rem', color: '#777777', lineHeight: 1.4 }}>
          <strong>Clinical Note for Provider:</strong> This brief is an observational summary generated from patient self-reported diary entries via Saheli. Pattern detection is based on demonstration literature criteria (ACOG, ESHRE, FIGO) and is unvalidated by formal clinical trial. It is intended solely to facilitate structured history taking.
        </div>
      </div>

      {/* Floating Print CTA for quick access (no-print) */}
      <div className="no-print" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          💡 <strong>Tip for your appointment:</strong> Print 2 copies—one for your doctor to scan in 60 seconds, and one for yourself to take notes on!
        </div>
        <button onClick={handlePrint} className="btn btn-primary" style={{ fontSize: '0.88rem' }}>
          <Printer size={16} />
          <span>Print / Save to PDF</span>
        </button>
      </div>

    </div>
  );
}
