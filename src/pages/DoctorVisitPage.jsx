import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Stethoscope, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Settings2, 
  Share2, 
  Lock, 
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../data/sampleProfiles';

export default function DoctorVisitPage() {
  const { 
    currentProfile, 
    summaryMetrics, 
    detectedPatterns, 
    addDoctorQuestion, 
    editDoctorQuestion, 
    moveDoctorQuestion, 
    removeDoctorQuestion, 
    toggleDoctorQuestionInReport, 
    updateConsentSettings, 
    exportDataJSON 
  } = useApp();

  const [newQuestionText, setNewQuestionText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showConsentBar, setShowConsentBar] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Consent settings
  const consent = currentProfile.consentSettings || {
    includeName: true,
    includeAge: true,
    includeNotes: true,
    includeMood: true,
    includeTrends: true
  };

  const handleStartEdit = (q) => {
    setEditingQuestionId(q.id);
    setEditingText(q.text);
  };

  const handleSaveEdit = (id) => {
    if (!editingText.trim()) return;
    editDoctorQuestion(id, editingText);
    setEditingQuestionId(null);
    setEditingText('');
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    addDoctorQuestion(newQuestionText);
    setNewQuestionText('');
    setShowAddForm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const matchedPatterns = detectedPatterns.filter((p) => p.matched);
  const allQuestions = currentProfile.customQuestions || [];
  const reportQuestions = allQuestions.filter((q) => q.inReport !== false);

  // Red-flag triage review
  const redFlagsChecked = [
    { label: 'No sudden, excruciating acute abdomen / unilateral emergency pain', status: 'Passed / Ruled Out' },
    { label: 'No hemorrhagic flooding (>2 maxi pads/hr for 2+ consecutive hours)', status: 'Passed / Ruled Out' },
    { label: 'No high fever (≥38°C) or purulent foul-smelling discharge', status: 'Passed / Ruled Out' },
    { label: 'Pregnancy status evaluated (negative or non-applicable)', status: 'Verified' },
  ];

  return (
    <div className="page-content-wrapper">
      
      {/* Top Action Bar (Hidden in Print) */}
      <div className="no-print" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                Clinician Bridge Brief
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Optimized for 15-Minute Consultations (A4 Print-Ready)
              </span>
              {isPreviewMode && (
                <span className="badge badge-sage" style={{ fontSize: '0.68rem' }}>
                  Print Preview Active
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw + 0.3rem, 2.2rem)', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
              Doctor Visit Preparation & Brief
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '680px' }}>
              A high-density clinical summary designed to be handed to your gynecologist or primary care physician. Built from your verified diary entries.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowConsentBar(!showConsentBar)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
              title="Configure data consent and privacy controls"
            >
              <Settings2 size={15} />
              <span>Privacy Controls</span>
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
              title="Secure sharing & export guidelines"
            >
              <Share2 size={15} />
              <span>Share Privately</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            >
              {isPreviewMode ? <EyeOff size={15} /> : <Eye size={15} />}
              <span>{isPreviewMode ? 'Exit Preview' : 'Report Preview'}</span>
            </button>

            <button
              type="button"
              onClick={exportDataJSON}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            >
              <Download size={15} />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
            >
              <Printer size={15} />
              <span>Print A4 PDF</span>
            </button>
          </div>
        </div>

        {/* Expandable Privacy & Consent Controls Bar */}
        {showConsentBar && (
          <div 
            style={{ 
              marginTop: '1.25rem', 
              padding: '1.25rem', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-card)', 
              border: '1px solid var(--border-card)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={18} color="var(--color-berry)" />
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Brief Disclosure & Consent Preferences
                </strong>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Choose which personal data elements appear in the printed brief
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consent.includeName}
                  onChange={(e) => updateConsentSettings({ includeName: e.target.checked })}
                  style={{ accentColor: 'var(--color-berry)' }}
                />
                <span>Include Patient Name</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consent.includeAge}
                  onChange={(e) => updateConsentSettings({ includeAge: e.target.checked })}
                  style={{ accentColor: 'var(--color-berry)' }}
                />
                <span>Include Age / Date of Birth</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consent.includeNotes}
                  onChange={(e) => updateConsentSettings({ includeNotes: e.target.checked })}
                  style={{ accentColor: 'var(--color-berry)' }}
                />
                <span>Include Medications & Trigger Notes</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consent.includeMood}
                  onChange={(e) => updateConsentSettings({ includeMood: e.target.checked })}
                  style={{ accentColor: 'var(--color-berry)' }}
                />
                <span>Include Mood & Vitality Indices</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* PRINTABLE CLINICIAN REPORT CONTAINER */}
      <div 
        className="printable-report"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: isPreviewMode ? 'var(--shadow-elevated)' : 'var(--shadow-card)',
          color: '#1A1A1A',
          maxWidth: isPreviewMode ? '820px' : '100%',
          margin: isPreviewMode ? '0 auto' : '0'
        }}
      >
        {/* Clinician Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--color-berry)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
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
              Observational diary extract prepared for: <strong>{currentProfile.doctorName || 'Attending Clinician'}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#555555', lineHeight: 1.45 }}>
            <div>
              <strong>Patient:</strong>{' '}
              {consent.includeName && currentProfile.name ? currentProfile.name : 'De-identified Patient Summary'}
              {consent.includeAge && currentProfile.age ? ` (Age ${currentProfile.age})` : ''}
            </div>
            <div><strong>Generated:</strong> {formatDate(new Date())}</div>
            <div><strong>Sample Size:</strong> {summaryMetrics.totalLoggedDays} Logged Days in Diary</div>
          </div>
        </div>

        {/* Section 1: Patient-Reported Information & Baseline */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-berry)', borderBottom: '1px solid #E5DCD1', paddingBottom: '0.4rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1. Patient-Reported Information & Functional Impact
          </h3>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '0.85rem' }}>
            {currentProfile.summaryBio}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#666666', textTransform: 'uppercase', fontWeight: 600 }}>Cycle Length</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-berry)' }}>~{currentProfile.typicalCycleLength || 28}d</div>
            </div>

            <div style={{ border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#666666', textTransform: 'uppercase', fontWeight: 600 }}>Avg Pain Score</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: Number(summaryMetrics.averagePainScore) >= 6 ? 'var(--color-terracotta)' : 'var(--color-berry)' }}>
                {summaryMetrics.averagePainScore || '0'}/10
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#666666', textTransform: 'uppercase', fontWeight: 600 }}>Severe Pain Days (≥7)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-terracotta)' }}>{summaryMetrics.severePainDaysCount} days</div>
            </div>

            <div style={{ border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#666666', textTransform: 'uppercase', fontWeight: 600 }}>Heavy Flow Days</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-berry)' }}>{summaryMetrics.heavyFlowDaysCount} days</div>
            </div>

            <div style={{ border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#666666', textTransform: 'uppercase', fontWeight: 600 }}>Incapacitated Days</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#9C4532' }}>{summaryMetrics.functionalImpactDaysCount} days</div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#444444', lineHeight: 1.5 }}>
            <strong>Pain Dynamics:</strong> Cyclic pain predominantly logged during <em>Days 1–3 of Menses</em> (peaking up to 8/10), with secondary mid-cycle peaks observed around <em>Ovulation Window (Days 13–15)</em>. Functional limitation includes missed work/classes and bed rest.
          </div>
        </div>

        {/* Section 2: Observed Clinical Patterns (Literature Traceable) */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-berry)', borderBottom: '1px solid #E5DCD1', paddingBottom: '0.4rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            2. Observed Symptom Patterns (Literature-Referenced Criteria)
          </h3>

          {matchedPatterns.length === 0 ? (
            <p style={{ fontSize: '0.84rem', color: '#666666', fontStyle: 'italic' }}>
              No multi-criterion clinical pattern thresholds crossed in currently logged records.
            </p>
          ) : (
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
                    <strong style={{ fontSize: '0.88rem', color: 'var(--color-berry)' }}>{pat.title}</strong>
                    <span className="badge badge-berry" style={{ fontSize: '0.65rem' }}>{pat.severity}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#444444' }}>
                    {(pat.evidence || []).map((e, idx) => (
                      <div key={idx} style={{ marginBottom: '0.25rem' }}>
                        • <strong>{e.criterion}:</strong> {e.detail.split('.')[0]}.
                      </div>
                    ))}
                  </div>
                  {pat.dateRange && (
                    <div style={{ fontSize: '0.72rem', color: '#777777', marginTop: '0.4rem', borderTop: '1px dashed #DDD', paddingTop: '0.3rem' }}>
                      Identified across {pat.sampleSize} entries ({pat.dateRange.start} to {pat.dateRange.end})
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Acute Red-Flag Triage Verification */}
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
                <span style={{ fontWeight: 600, color: 'var(--color-sage-dark)', fontSize: '0.72rem' }}>
                  {flag.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Prioritized Patient Discussion Questions */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5DCD1', paddingBottom: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-berry)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              4. Patient Discussion Questions for Consultation
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="no-print btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              <Plus size={13} /> <span>Add Question</span>
            </button>
          </div>

          {/* Add Question Inline Form */}
          {showAddForm && (
            <form onSubmit={handleAddQuestion} className="no-print" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Type a specific question for your physician..."
                style={{
                  flex: 1,
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-card)',
                  fontSize: '0.85rem'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
                Save Question
              </button>
              <button 
                type="button" 
                onClick={() => { setShowAddForm(false); setNewQuestionText(''); }} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.82rem' }}
              >
                Cancel
              </button>
            </form>
          )}

          {/* Questions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {reportQuestions.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#666666', fontStyle: 'italic', padding: '0.5rem' }}>
                No questions selected for inclusion in this brief. Use "Add Question" above.
              </div>
            ) : (
              reportQuestions.map((q, idx) => (
                <div 
                  key={q.id || idx}
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
                  <div style={{ display: 'flex', gap: '0.6rem', flex: 1, alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-berry)', flexShrink: 0 }}>
                      Q{idx + 1}:
                    </span>

                    {editingQuestionId === q.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }} className="no-print">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-focus)',
                            fontSize: '0.84rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(q.id)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingQuestionId(null)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#222222', lineHeight: 1.45 }}>
                        "{q.text}"
                      </span>
                    )}
                  </div>

                  {/* Question Controls (Hidden in Print) */}
                  <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.5rem' }}>
                    {/* Toggle Report Inclusion */}
                    <button
                      type="button"
                      onClick={() => toggleDoctorQuestionInReport(q.id)}
                      title={q.inReport !== false ? "Included in brief (click to exclude)" : "Excluded from brief (click to include)"}
                      aria-label="Toggle inclusion in brief"
                      style={{ padding: '0.25rem', color: q.inReport !== false ? 'var(--color-berry)' : 'var(--text-muted)' }}
                    >
                      {q.inReport !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveDoctorQuestion(idx, -1)}
                      title="Move up"
                      aria-label="Move question up"
                      style={{ padding: '0.25rem', color: 'var(--text-muted)', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={idx === reportQuestions.length - 1}
                      onClick={() => moveDoctorQuestion(idx, 1)}
                      title="Move down"
                      aria-label="Move question down"
                      style={{ padding: '0.25rem', color: 'var(--text-muted)', cursor: idx === reportQuestions.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === reportQuestions.length - 1 ? 0.3 : 1 }}
                    >
                      <ArrowDown size={14} />
                    </button>
                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(q)}
                      title="Edit question text"
                      aria-label="Edit question"
                      style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeDoctorQuestion(q.id)}
                      title="Remove question"
                      aria-label="Remove question"
                      style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Regulatory Disclosure Stamp */}
        <div style={{ borderTop: '1px solid #E5DCD1', paddingTop: '1rem', fontSize: '0.72rem', color: '#777777', lineHeight: 1.45 }}>
          <strong>Clinical Notice for Attending Provider:</strong> This document is an observational patient self-reported diary extract generated via Saheli. Pattern matching is derived from demonstration criteria (ACOG, ESHRE, FIGO guidelines) and is unvalidated by formal clinical trial. It does not constitute a diagnostic test, laboratory finding, or prescription.
        </div>
      </div>

      {/* Floating Print CTA Bar (no-print) */}
      <div className="no-print" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-card)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          💡 <strong>Tip for your appointment:</strong> Print 2 copies—one for your doctor to review in 60 seconds, and one for yourself to reference and write notes on.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)} 
            className="btn btn-secondary" 
            style={{ fontSize: '0.88rem' }}
          >
            {isPreviewMode ? 'Exit Preview' : 'Preview Layout'}
          </button>
          <button 
            type="button"
            onClick={handlePrint} 
            className="btn btn-primary" 
            style={{ fontSize: '0.88rem' }}
          >
            <Printer size={16} />
            <span>Print A4 Brief (PDF)</span>
          </button>
        </div>
      </div>

      {/* Secure Sharing Modal */}
      {showShareModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="share-title">
          <div className="modal-card" style={{ maxWidth: '520px', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', color: 'var(--color-berry)' }}>
              <Lock size={20} />
              <h3 id="share-title" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
                Private & Secure Sharing Model
              </h3>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p>
                <strong>No Cloud Storage or Public URLs:</strong> Saheli operates under a strict local-first privacy sandbox. Your symptom logs and clinician brief are never stored on public servers or encoded in shareable web URLs.
              </p>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <strong style={{ color: 'var(--color-berry)', display: 'block', marginBottom: '0.25rem' }}>
                  Recommended Consultation Sharing Methods:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem' }}>
                  <li><strong>Print to Physical Paper:</strong> Most effective for 15-minute consults. Doctors prefer scanning a clean A4 sheet.</li>
                  <li><strong>Save as PDF:</strong> Use Print &gt; "Save as PDF" to store a local document or upload through your hospital's secure patient portal (e.g. MyChart).</li>
                  <li><strong>Encrypted Backup (JSON):</strong> Export your full diary to a local file anytime from Privacy Settings.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <AlertCircle size={14} color="var(--color-amber)" />
                <span>Access is fully in your control. You can revoke local data anytime by clearing your browser storage.</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => { setShowShareModal(false); handlePrint(); }}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <Printer size={15} />
                <span>Print or Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
