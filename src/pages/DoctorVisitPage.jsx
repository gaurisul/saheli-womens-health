import React, { useState, useMemo } from 'react';
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
  AlertCircle,
  AlertTriangle,
  Info
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

  // Derive factual, observational pain summary from active profile logs (Task 2B)
  const painSummary = useMemo(() => {
    const logEntries = Object.values(currentProfile.logs || {});
    if (logEntries.length === 0) {
      return {
        hasData: false,
        text: 'Insufficient recorded diary data to summarize pain history. Log daily check-ins to build this clinical summary.'
      };
    }

    const recordedPainEntries = logEntries.filter((e) => e.painScore !== undefined && e.painScore !== null);
    if (recordedPainEntries.length === 0) {
      return {
        hasData: true,
        text: `Across ${logEntries.length} logged diary day(s), no numerical pain scores were recorded. Unrecorded dates cannot be assumed pain-free.`
      };
    }

    const scores = recordedPainEntries.map((e) => Number(e.painScore) || 0);
    const maxScore = Math.max(...scores);
    const severeEntries = recordedPainEntries.filter((e) => (Number(e.painScore) || 0) >= 7);
    const moderateEntries = recordedPainEntries.filter((e) => {
      const p = Number(e.painScore) || 0;
      return p >= 4 && p < 7;
    });

    const mensesPainEntries = recordedPainEntries.filter((e) => e.bleeding && e.bleeding !== 'None' && (Number(e.painScore) || 0) > 0);
    const nonMensesPainEntries = recordedPainEntries.filter((e) => (!e.bleeding || e.bleeding === 'None') && (Number(e.painScore) || 0) > 0);

    const impactCount = summaryMetrics.functionalImpactDaysCount || 0;
    const topImpacts = Object.keys(summaryMetrics.impactTypesBreakdown || {});

    const dateRangeStr = summaryMetrics.dateRange
      ? `from ${summaryMetrics.dateRange.start} to ${summaryMetrics.dateRange.end}`
      : `${logEntries.length} logged days`;

    const parts = [];
    parts.push(`Across ${recordedPainEntries.length} day(s) with recorded pain scores (${dateRangeStr}), pain scores averaged ${summaryMetrics.averagePainScore || '0'}/10 with a peak of ${maxScore}/10.`);

    if (severeEntries.length > 0) {
      parts.push(`Severe pain (≥7/10) was logged on ${severeEntries.length} day(s), and moderate pain (4–6/10) on ${moderateEntries.length} day(s).`);
    } else if (moderateEntries.length > 0) {
      parts.push(`Moderate pain (4–6/10) was logged on ${moderateEntries.length} day(s) with no severe pain days (≥7/10) reported.`);
    }

    if (mensesPainEntries.length > 0 && nonMensesPainEntries.length > 0) {
      parts.push(`Pain was reported both during menses (${mensesPainEntries.length} day(s)) and outside of menses (${nonMensesPainEntries.length} day(s)).`);
    } else if (mensesPainEntries.length > 0) {
      parts.push(`Reported pain coincided with logged bleeding on ${mensesPainEntries.length} day(s).`);
    } else if (nonMensesPainEntries.length > 0) {
      parts.push(`Reported pain occurred primarily on non-bleeding days (${nonMensesPainEntries.length} day(s)).`);
    }

    if (impactCount > 0) {
      const impactDesc = topImpacts.length > 0 ? ` (${topImpacts.slice(0, 3).join(', ')})` : '';
      parts.push(`Functional disruption was recorded on ${impactCount} day(s)${impactDesc}.`);
    }

    parts.push('Unrecorded dates cannot be assumed pain-free.');

    return {
      hasData: true,
      text: parts.join(' ')
    };
  }, [currentProfile.logs, summaryMetrics]);

  // Red-flag triage review derived from actual patient records (Task 2C)
  const redFlagAssessments = useMemo(() => {
    const logEntries = Object.values(currentProfile.logs || {});
    const totalLogs = logEntries.length;

    // 1. Excruciating or Emergency Pain (≥9/10)
    const severePainLogs = logEntries.filter((e) => (Number(e.painScore) || 0) >= 9);
    const maxPain = logEntries.length > 0
      ? Math.max(...logEntries.map((e) => Number(e.painScore) || 0))
      : 0;

    const acutePainAssessment = totalLogs === 0
      ? { label: 'Severe / Acute Emergency Pain (≥9/10)', status: 'Not Recorded', detail: 'No diary entries logged.', badge: 'badge-secondary', icon: 'unknown' }
      : severePainLogs.length > 0
      ? { label: 'Severe / Acute Emergency Pain (≥9/10)', status: `Reported (${severePainLogs.length}d)`, detail: `Peak pain ${maxPain}/10 logged on ${severePainLogs.length} date(s). Prompt clinical evaluation required if acute.`, badge: 'badge-terracotta', icon: 'flagged' }
      : { label: 'Severe / Acute Emergency Pain (≥9/10)', status: 'None Logged', detail: `Peak logged pain is ${maxPain}/10 across ${totalLogs} recorded date(s). Unrecorded dates cannot be ruled out.`, badge: 'badge-sage', icon: 'none-logged' };

    // 2. Hemorrhagic Flow / Flooding (>2 pads/hr)
    const heavyBleedingLogs = logEntries.filter((e) => e.bleeding === 'Heavy');
    const bleedingLogs = logEntries.filter((e) => e.bleeding && e.bleeding !== 'None');

    const hemorrhagicAssessment = totalLogs === 0
      ? { label: 'Hemorrhagic Bleeding (>2 pads/hr or large clots)', status: 'Not Recorded', detail: 'No bleeding records logged.', badge: 'badge-secondary', icon: 'unknown' }
      : heavyBleedingLogs.length > 0
      ? { label: 'Hemorrhagic Bleeding (>2 pads/hr or large clots)', status: `Heavy Flow Logged (${heavyBleedingLogs.length}d)`, detail: `Heavy menstrual flow logged on ${heavyBleedingLogs.length} day(s). Assess volume and duration with clinician.`, badge: 'badge-terracotta', icon: 'flagged' }
      : bleedingLogs.length > 0
      ? { label: 'Hemorrhagic Bleeding (>2 pads/hr or large clots)', status: 'No Heavy Flow Logged', detail: `Bleeding logged on ${bleedingLogs.length} day(s), none marked Heavy. Flooding cannot be ruled out between logs.`, badge: 'badge-sage', icon: 'none-logged' }
      : { label: 'Hemorrhagic Bleeding (>2 pads/hr or large clots)', status: 'Not Recorded', detail: 'No menstrual bleeding entries in logged period.', badge: 'badge-secondary', icon: 'unknown' };

    // 3. Pelvic Pain with Fever or Purulent Discharge
    const infectionSymptoms = logEntries.filter((e) => {
      const syms = Array.isArray(e.symptoms) ? e.symptoms : [];
      const notesLower = (e.notes || '').toLowerCase();
      return syms.some((s) => s.toLowerCase().includes('chills')) || notesLower.includes('fever') || notesLower.includes('discharge');
    });

    const infectionAssessment = infectionSymptoms.length > 0
      ? { label: 'Fever (≥38°C) or Purulent Vaginal Discharge', status: 'Reported in Notes/Diary', detail: `Fever or chills noted in ${infectionSymptoms.length} entry(ies). Evaluate for infection / PID today.`, badge: 'badge-terracotta', icon: 'flagged' }
      : { label: 'Fever (≥38°C) or Purulent Vaginal Discharge', status: 'Not Tracked in Diary', detail: 'Temperature and discharge characteristics are not monitored as structured fields. Discuss any signs of infection with clinician.', badge: 'badge-secondary', icon: 'not-tracked' };

    // 4. Pregnancy Status & Obstetric Risk
    const pregnancyAssessment = {
      label: 'Pregnancy Status & Ectopic Triage',
      status: 'Not Assessed in Diary',
      detail: 'Pregnancy status is not tracked by this diary. Ectopic pregnancy must be evaluated clinically if acute pelvic pain or bleeding occurs.',
      badge: 'badge-secondary',
      icon: 'not-tracked'
    };

    return [acutePainAssessment, hemorrhagicAssessment, infectionAssessment, pregnancyAssessment];
  }, [currentProfile.logs]);

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

          <div style={{ fontSize: '0.82rem', color: '#444444', lineHeight: 1.5, backgroundColor: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
            <strong style={{ color: 'var(--color-berry)' }}>Patient-Reported Pain Dynamics:</strong>{' '}
            {painSummary.text}
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

        {/* Section 3: Acute Red-Flag Triage Verification (Task 2C) */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5DCD1', paddingBottom: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-berry)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              3. Acute Red-Flag Triage & Safety Review
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Observational diary check · Not a clinical examination
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
            {redFlagAssessments.map((flag, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: flag.icon === 'flagged' ? '#FFF5F5' : 'var(--bg-secondary)',
                  border: flag.icon === 'flagged' ? '1px solid var(--color-critical-border)' : '1px solid var(--border-card)',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {flag.icon === 'flagged' ? (
                      <AlertTriangle size={15} color="var(--color-terracotta)" />
                    ) : flag.icon === 'none-logged' ? (
                      <CheckCircle2 size={15} color="var(--color-sage)" />
                    ) : (
                      <Info size={15} color="var(--text-muted)" />
                    )}
                    <strong style={{ color: flag.icon === 'flagged' ? 'var(--color-terracotta)' : 'var(--text-primary)' }}>
                      {flag.label}
                    </strong>
                  </div>
                  <span
                    className={`badge ${flag.badge}`}
                    style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}
                  >
                    {flag.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#666666', lineHeight: 1.4, paddingLeft: '1.35rem' }}>
                  {flag.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Prioritized Patient Discussion Questions */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5DCD1', paddingBottom: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-berry)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                4. Patient Discussion Questions for Consultation
              </h3>
              <span className="no-print badge badge-berry" style={{ fontSize: '0.7rem' }}>
                {reportQuestions.length} of {allQuestions.length} in brief
              </span>
            </div>
            {!isPreviewMode && (
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="no-print btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                <Plus size={13} /> <span>Add Question</span>
              </button>
            )}
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
            {allQuestions.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#666666', fontStyle: 'italic', padding: '0.5rem' }}>
                No questions created yet. Use "Add Question" above to prepare topics for your appointment.
              </div>
            ) : isPreviewMode && reportQuestions.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#666666', fontStyle: 'italic', padding: '0.5rem' }}>
                No questions selected for inclusion in this brief. Use "Exit Preview" to select questions.
              </div>
            ) : (
              (isPreviewMode ? reportQuestions : allQuestions).map((q, idx) => {
                const isIncluded = q.inReport !== false;
                const reportNum = isIncluded
                  ? reportQuestions.findIndex((rq) => rq.id === q.id) + 1
                  : null;

                return (
                  <div
                    key={q.id || idx}
                    className={!isIncluded ? 'no-print' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: isIncluded ? 'var(--bg-secondary)' : '#FAF8F5',
                      border: isIncluded ? '1px solid var(--border-card)' : '1px dashed var(--border-subtle)',
                      opacity: isIncluded ? 1 : 0.75,
                      fontSize: '0.84rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.65rem', flex: 1, alignItems: 'flex-start' }}>
                      {/* Checkbox selector (hidden in print) */}
                      {!isPreviewMode && (
                        <label
                          htmlFor={`q-include-${q.id}`}
                          className="no-print"
                          title={isIncluded ? 'Included in clinician brief. Click to exclude.' : 'Excluded from clinician brief. Click to include.'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer',
                            userSelect: 'none',
                            flexShrink: 0,
                            marginTop: '1px'
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`q-include-${q.id}`}
                            checked={isIncluded}
                            onChange={() => toggleDoctorQuestionInReport(q.id)}
                            style={{
                              accentColor: 'var(--color-berry)',
                              cursor: 'pointer',
                              width: '16px',
                              height: '16px'
                            }}
                            aria-label={isIncluded ? `Exclude question "${q.text}" from report` : `Include question "${q.text}" in report`}
                          />
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: isIncluded ? 'var(--color-berry)' : 'var(--text-muted)',
                            whiteSpace: 'nowrap'
                          }}>
                            {isIncluded ? 'In Brief' : 'Excluded'}
                          </span>
                        </label>
                      )}

                      {/* Number badge for report */}
                      <span style={{
                        fontWeight: 700,
                        color: isIncluded ? 'var(--color-berry)' : 'var(--text-muted)',
                        flexShrink: 0,
                        minWidth: '28px'
                      }}>
                        {isIncluded ? `Q${reportNum}:` : '—'}
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
                            aria-label="Edit question text"
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
                        <span style={{
                          color: isIncluded ? '#222222' : 'var(--text-secondary)',
                          lineHeight: 1.45,
                          fontStyle: isIncluded ? 'normal' : 'italic'
                        }}>
                          "{q.text}"
                        </span>
                      )}
                    </div>

                    {/* Question Controls (Hidden in Print and Preview) */}
                    {!isPreviewMode && (
                      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.5rem' }}>
                        {/* Toggle Report Inclusion */}
                        <button
                          type="button"
                          onClick={() => toggleDoctorQuestionInReport(q.id)}
                          title={isIncluded ? "Included in brief (click to exclude)" : "Excluded from brief (click to include)"}
                          aria-label={isIncluded ? `Exclude question "${q.text}" from brief` : `Include question "${q.text}" in brief`}
                          style={{ padding: '0.25rem', color: isIncluded ? 'var(--color-berry)' : 'var(--text-muted)' }}
                        >
                          {isIncluded ? <Eye size={14} /> : <EyeOff size={14} />}
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
                          disabled={idx === allQuestions.length - 1}
                          onClick={() => moveDoctorQuestion(idx, 1)}
                          title="Move down"
                          aria-label="Move question down"
                          style={{ padding: '0.25rem', color: 'var(--text-muted)', cursor: idx === allQuestions.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === allQuestions.length - 1 ? 0.3 : 1 }}
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
                    )}
                  </div>
                );
              })
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
                  <li><strong>Local JSON Backup:</strong> Export your full diary to a local file anytime from Privacy Settings.</li>
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
