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
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Settings2,
  Share2,
  Lock,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  Activity,
  Droplets,
  BedDouble,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatDate } from '../data/sampleProfiles';
import { findPeriodStarts, getDaysDiff } from '../utils/cycleCalculations';
import { getActiveSafetyAlerts } from '../services/safetyRules';
import BrandLogo from '../components/common/BrandLogo';

// Tooltip declared outside render to prevent re-render flicker
function SymptomChartTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '0.65rem 0.85rem',
          borderRadius: '10px',
          border: '1px solid var(--border-card)',
          fontSize: '0.8rem',
          boxShadow: 'var(--shadow-elevated)',
          maxWidth: '240px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.25rem' }}>
          <strong style={{ color: 'var(--color-berry)' }}>{data.fullDate}</strong>
          {data.cycleDay && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{data.cycleDay}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Pain Score:</span>
          <strong style={{ color: data.painScore >= 7 ? 'var(--color-terracotta)' : 'var(--color-berry)' }}>
            {data.painScore} / 10
          </strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Flow:</span>
          <span className="badge badge-berry" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
            {data.bleeding}
          </span>
        </div>
        {data.functionalImpact && (
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.72rem', marginTop: '0.2rem', fontWeight: 600 }}>
            • Functional impact logged
          </div>
        )}
      </div>
    );
  }
  return null;
}

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

  // Derive factual, observational pain summary from active profile logs
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

  // Flow breakdown from actual logs
  const flowBreakdown = useMemo(() => {
    const entries = Object.values(currentProfile.logs || {});
    const counts = { Heavy: 0, Medium: 0, Light: 0, Spotting: 0, None: 0 };
    entries.forEach((e) => {
      const b = e.bleeding || 'None';
      if (counts[b] !== undefined) counts[b]++;
    });
    return counts;
  }, [currentProfile.logs]);

  // Fatigue & energy observations
  const fatigueObservation = useMemo(() => {
    const entries = Object.values(currentProfile.logs || {});
    const fatigueEntries = entries.filter((e) => {
      const syms = Array.isArray(e.symptoms) ? e.symptoms : [];
      const notes = (e.notes || '').toLowerCase();
      return (
        syms.some((s) => s.toLowerCase().includes('fatigue') || s.toLowerCase().includes('exhaustion') || s.toLowerCase().includes('brain fog')) ||
        notes.includes('fatigue') ||
        notes.includes('tired') ||
        notes.includes('exhausted')
      );
    });
    return {
      count: fatigueEntries.length,
      hasFatigue: fatigueEntries.length > 0,
      text: fatigueEntries.length > 0
        ? `Fatigue or marked exhaustion was documented on ${fatigueEntries.length} logged day(s), commonly coinciding with high pain or heavy bleeding episodes.`
        : 'No specific fatigue or exhaustion symptoms recorded in the logged period.'
    };
  }, [currentProfile.logs]);

  // Symptom timeline chart data (chronological)
  const chartData = useMemo(() => {
    const logs = currentProfile.logs || {};
    const sortedDates = Object.keys(logs).sort();
    return sortedDates.map((d) => {
      const entry = logs[d] || {};
      const dateObj = new Date(d + 'T00:00:00');
      return {
        dateLabel: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: d,
        painScore: entry.painScore !== undefined && entry.painScore !== null ? Number(entry.painScore) : 0,
        bleeding: entry.bleeding || 'None',
        functionalImpact: Boolean(entry.functionalImpact),
        cycleDay: entry.cycleDay ? `Day ${entry.cycleDay}` : ''
      };
    });
  }, [currentProfile.logs]);

  // Historical cycles derived directly from actual logs
  const cycleHistory = useMemo(() => {
    const logs = currentProfile.logs || {};
    const periodStarts = findPeriodStarts(logs);
    const sortedDates = Object.keys(logs).sort();

    if (sortedDates.length === 0) {
      return {
        cycles: [],
        hasData: false,
        note: 'No symptom records found in diary. Complete daily check-ins to track cycle history.'
      };
    }

    if (periodStarts.length === 0) {
      return {
        cycles: [],
        hasData: false,
        note: 'No period start dates (Day 1 with bleeding) recorded in diary. Menstrual start dates are needed to calculate completed cycles.'
      };
    }

    const cycles = [];
    const typicalLength = Number(currentProfile.typicalCycleLength) || 28;

    // 1. Current Active Cycle
    const latestStart = periodStarts[periodStarts.length - 1];
    const latestLogDate = sortedDates[sortedDates.length - 1];
    const currentDurationDays = getDaysDiff(latestStart, latestLogDate) + 1;

    const currentEntries = Object.entries(logs)
      .filter(([d]) => d >= latestStart)
      .map(([d, data]) => ({ date: d, ...data }));

    const currentBleeding = currentEntries.filter((e) => e.bleeding && e.bleeding !== 'None');
    const currentScores = currentEntries.map((e) => Number(e.painScore)).filter((s) => !isNaN(s) && s > 0);
    const currentPeakPain = currentScores.length > 0 ? Math.max(...currentScores) : null;
    const currentImpact = currentEntries.filter((e) => e.functionalImpact === true);

    cycles.push({
      name: 'Current Cycle (Active)',
      isCurrent: true,
      startDate: latestStart,
      durationLabel: `Day ${currentDurationDays} (Ongoing, est. ~${typicalLength}d)`,
      bleedingDuration: `${currentBleeding.length} days`,
      peakPain: currentPeakPain !== null ? `${currentPeakPain} / 10` : 'None logged',
      impactDaysCount: currentImpact.length
    });

    // 2. Preceding Completed Cycles
    for (let i = periodStarts.length - 2; i >= 0; i--) {
      const start = periodStarts[i];
      const nextStart = periodStarts[i + 1];
      const cycleDuration = getDaysDiff(start, nextStart);

      const cycleEntries = Object.entries(logs)
        .filter(([d]) => d >= start && d < nextStart)
        .map(([d, data]) => ({ date: d, ...data }));

      const cBleeding = cycleEntries.filter((e) => e.bleeding && e.bleeding !== 'None');
      const cScores = cycleEntries.map((e) => Number(e.painScore)).filter((s) => !isNaN(s) && s > 0);
      const cPeakPain = cScores.length > 0 ? Math.max(...cScores) : null;
      const cImpact = cycleEntries.filter((e) => e.functionalImpact === true);
      const cycleIndex = periodStarts.length - 1 - i;

      cycles.push({
        name: `Preceding Cycle (-${cycleIndex})`,
        isCurrent: false,
        startDate: start,
        durationLabel: `${cycleDuration} days (Complete)`,
        bleedingDuration: `${cBleeding.length} days`,
        peakPain: cPeakPain !== null ? `${cPeakPain} / 10` : 'None logged',
        impactDaysCount: cImpact.length
      });
    }

    return {
      cycles,
      hasData: true,
      note: periodStarts.length === 1
        ? '1 period start recorded in diary. Completed cycle durations will calculate as subsequent period starts are logged.'
        : null
    };
  }, [currentProfile.logs, currentProfile.typicalCycleLength]);

  // System-generated rule-based safety alerts
  const systemSafetyAlerts = useMemo(() => {
    return getActiveSafetyAlerts(currentProfile.logs || {});
  }, [currentProfile.logs]);

  // Red-flag triage review derived from actual patient records
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
    <div className="page-content-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 1. Page Header (Hidden in Print) */}
      <header className="no-print" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.72rem', padding: '0.2rem 0.65rem' }}>
                Clinician Bridge Brief
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Optimized for 15-Minute Consultations (A4 Print-Ready)
              </span>
              {isPreviewMode && (
                <span className="badge badge-sage" style={{ fontSize: '0.7rem' }}>
                  Report Preview Active
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw + 0.3rem, 2.35rem)', color: 'var(--text-primary)', lineHeight: 1.2, margin: '0 0 0.4rem 0' }}>
              Doctor Visit Preparation & Brief
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.55 }}>
              Your symptoms, patterns, and questions — organized for your next consultation.
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowConsentBar(!showConsentBar)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
              title="Configure data consent and privacy controls"
            >
              <Settings2 size={15} />
              <span>Privacy Controls</span>
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
              title="Secure sharing & export guidelines"
            >
              <Share2 size={15} />
              <span>Share Privately</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
              title="Toggle printable report preview mode"
            >
              {isPreviewMode ? <EyeOff size={15} /> : <Eye size={15} />}
              <span>{isPreviewMode ? 'Exit Preview' : 'Report Preview'}</span>
            </button>

            <button
              type="button"
              onClick={exportDataJSON}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
              title="Export diary as JSON backup"
            >
              <Download size={15} />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.5rem 1.05rem' }}
              title="Print clinician report or save to PDF"
            >
              <Printer size={15} />
              <span>Print A4 PDF</span>
            </button>
          </div>
        </div>

        {/* Expandable Privacy & Consent Controls Drawer */}
        {showConsentBar && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--border-card)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--color-berry)" />
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Brief Disclosure & Consent Preferences
                </strong>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Choose which personal data elements appear in the printed brief
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.82rem' }}>
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
                <span>Include Age / DOB</span>
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
      </header>

      {/* DASHBOARD CONTAINER / CLINICIAN REPORT */}
      <div
        className="printable-report"
        style={{
          maxWidth: isPreviewMode ? '840px' : '100%',
          margin: isPreviewMode ? '0 auto' : '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          transition: 'all 0.2s ease'
        }}
      >
        {/* 2. Patient Summary Card */}
        <div
          className="saheli-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-card)',
            padding: '1.75rem 2rem',
            boxShadow: isPreviewMode ? 'var(--shadow-elevated)' : 'var(--shadow-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--color-berry)', paddingBottom: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <BrandLogo to={false} size="sm" />
                <span style={{ fontSize: '1.15rem', color: 'var(--text-muted)', fontWeight: 300 }}>|</span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: 'var(--color-berry)', margin: 0, fontWeight: 600 }}>
                  Patient Symptom & Cycle Summary
                </h2>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Observational diary extract prepared for: <strong style={{ color: 'var(--text-primary)' }}>{currentProfile.doctorName || 'Attending Clinician'}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <div>
                <strong>Patient:</strong>{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {consent.includeName && currentProfile.name ? currentProfile.name : 'De-identified Patient Summary'}
                  {consent.includeAge && currentProfile.age ? ` (Age ${currentProfile.age})` : ''}
                </span>
              </div>
              <div>
                <strong>Generated:</strong> {formatDate(new Date())}
              </div>
              <div>
                <strong>Tracking Period:</strong>{' '}
                {summaryMetrics.dateRange
                  ? `${summaryMetrics.dateRange.start} to ${summaryMetrics.dateRange.end}`
                  : `${summaryMetrics.totalLoggedDays} logged entries`}
              </div>
              <div>
                <strong>Total Logged Days:</strong>{' '}
                <span style={{ color: 'var(--color-berry)', fontWeight: 700 }}>
                  {summaryMetrics.totalLoggedDays} Days in Diary
                </span>
              </div>
            </div>
          </div>

          {currentProfile.summaryBio && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {currentProfile.summaryBio}
            </p>
          )}
        </div>

        {/* 3. Key Metrics Cards (5 Compact Cards in Responsive Grid) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}
        >
          {/* Card 1: Average Cycle Length */}
          <div
            className="saheli-card"
            style={{
              padding: '1.25rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Avg Cycle Length
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-berry-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={15} color="var(--color-berry)" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 600, color: 'var(--color-berry)', lineHeight: 1.1 }}>
                ~{currentProfile.typicalCycleLength || 28}d
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Baseline cycle interval
              </div>
            </div>
          </div>

          {/* Card 2: Average Pain Score */}
          <div
            className="saheli-card"
            style={{
              padding: '1.25rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Avg Pain Score
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: Number(summaryMetrics.averagePainScore) >= 6 ? 'var(--color-terracotta-light)' : 'var(--color-berry-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={15} color={Number(summaryMetrics.averagePainScore) >= 6 ? 'var(--color-terracotta)' : 'var(--color-berry)'} />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 600, color: Number(summaryMetrics.averagePainScore) >= 6 ? 'var(--color-terracotta)' : 'var(--color-berry)', lineHeight: 1.1 }}>
                {summaryMetrics.averagePainScore || '0'}/10
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Across all recorded days
              </div>
            </div>
          </div>

          {/* Card 3: Severe Pain Days */}
          <div
            className="saheli-card"
            style={{
              padding: '1.25rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Severe Pain Days
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-terracotta-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={15} color="var(--color-terracotta)" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 600, color: 'var(--color-terracotta)', lineHeight: 1.1 }}>
                {summaryMetrics.severePainDaysCount} days
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Pain rated ≥ 7 / 10
              </div>
            </div>
          </div>

          {/* Card 4: Heavy Flow Days */}
          <div
            className="saheli-card"
            style={{
              padding: '1.25rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Heavy Flow Days
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-berry-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={15} color="var(--color-berry)" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 600, color: 'var(--color-berry)', lineHeight: 1.1 }}>
                {summaryMetrics.heavyFlowDaysCount} days
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Heavy menstrual flow
              </div>
            </div>
          </div>

          {/* Card 5: Incapacitated Days */}
          <div
            className="saheli-card"
            style={{
              padding: '1.25rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Incapacitated Days
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-terracotta-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BedDouble size={15} color="#9C4532" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 600, color: '#9C4532', lineHeight: 1.1 }}>
                {summaryMetrics.functionalImpactDaysCount} days
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Bed rest or missed work
              </div>
            </div>
          </div>
        </div>

        {/* 4. Symptom Overview Card */}
        <div
          className="saheli-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-card)',
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-berry)', margin: '0 0 0.25rem 0', fontWeight: 600 }}>
              Symptom Overview
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Detailed synthesis of chief complaints, pain dynamics, flow characteristics, and functional disruption.
            </p>
          </div>

          {/* Chief Complaints Pills */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
              Chief Reported Complaints
            </span>
            {summaryMetrics.mostFrequentSymptoms.length === 0 ? (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No symptoms logged yet.
              </span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {summaryMetrics.mostFrequentSymptoms.slice(0, 8).map((sym, idx) => (
                  <span
                    key={idx}
                    className="badge badge-berry"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <span>{sym.name}</span>
                    <strong style={{ opacity: 0.85 }}>({sym.count}d · {sym.percent}%)</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pain Dynamics Narrative Callout */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              fontSize: '0.86rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)'
            }}
          >
            <strong style={{ color: 'var(--color-berry)', display: 'block', marginBottom: '0.35rem' }}>
              Pain Patterns & Cycle Phase Dynamics:
            </strong>
            {painSummary.text}
          </div>

          {/* Flow, Fatigue & Functional Impact Subgrid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            {/* Flow Observations */}
            <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Droplets size={14} color="var(--color-berry)" />
                <span>Menstrual Flow Distribution</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <div>Heavy: <strong>{flowBreakdown.Heavy} days</strong></div>
                <div>Medium: <strong>{flowBreakdown.Medium} days</strong></div>
                <div>Light / Spotting: <strong>{flowBreakdown.Light + flowBreakdown.Spotting} days</strong></div>
              </div>
            </div>

            {/* Fatigue & Vitality */}
            <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} color="var(--color-amber)" />
                <span>Fatigue & Energy Disruption</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {fatigueObservation.text}
              </div>
            </div>

            {/* Functional Impact */}
            <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <BedDouble size={14} color="#9C4532" />
                <span>Functional Impact Disruption</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {summaryMetrics.functionalImpactDaysCount > 0 ? (
                  <div>
                    Total disruption days: <strong>{summaryMetrics.functionalImpactDaysCount}</strong>
                    {Object.keys(summaryMetrics.impactTypesBreakdown).length > 0 && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Types: {Object.entries(summaryMetrics.impactTypesBreakdown).map(([k, v]) => `${k} (${v})`).join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <span>No days logged with incapacitated or missed work status.</span>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Symptom & Pain Chart */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
                Chronological Pain Score Progression (0–10 Scale)
              </span>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-berry)', borderRadius: '2px' }} />
                  Pain Score
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '12px', height: '2px', backgroundColor: 'var(--color-terracotta)', borderTop: '2px dashed var(--color-terracotta)' }} />
                  Severe Threshold (≥7)
                </span>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-card)', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No daily symptom check-ins logged yet to display timeline chart.
              </div>
            ) : (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="doctorVisitPainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-berry)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--color-berry)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card)" />
                    <XAxis
                      dataKey="dateLabel"
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border-card)' }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<SymptomChartTooltip />} />
                    <ReferenceLine y={7} stroke="var(--color-terracotta)" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="painScore"
                      stroke="var(--color-berry)"
                      strokeWidth={2.2}
                      fillOpacity={1}
                      fill="url(#doctorVisitPainGrad)"
                      activeDot={{ r: 5, fill: 'var(--color-berry)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* 5. Observed Patterns Cards */}
        <div
          className="saheli-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-card)',
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-berry)', margin: '0 0 0.25rem 0', fontWeight: 600 }}>
                  Observed Clinical Patterns
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Observational patterns matched against clinical literature (ACOG, ESHRE, FIGO guidelines). Not a medical diagnosis.
                </p>
              </div>
              <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                {matchedPatterns.length} of {detectedPatterns.length} Criteria Matched
              </span>
            </div>
          </div>

          {matchedPatterns.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-card)', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                No multi-criterion clinical pattern thresholds crossed in currently logged records.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Unrecorded symptom dates cannot be ruled out. Continue tracking check-ins across complete cycles to identify recurring trends.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.15rem' }}>
              {matchedPatterns.map((pat) => (
                <div
                  key={pat.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '14px',
                    padding: '1.25rem 1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Pattern Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--color-berry)', lineHeight: 1.3 }}>
                        {pat.title}
                      </strong>
                      <span className="badge badge-berry" style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                        {pat.severity}
                      </span>
                    </div>

                    {/* Date range & sample size */}
                    {pat.dateRange && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} />
                        <span>Identified across {pat.sampleSize} entries ({pat.dateRange.start} to {pat.dateRange.end})</span>
                      </div>
                    )}

                    {/* Evidence List */}
                    <div style={{ marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                        Supporting Diary Evidence
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {(pat.evidence || []).map((e, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', lineHeight: 1.45 }}>
                            <span style={{ color: 'var(--color-berry)', fontWeight: 700, flexShrink: 0 }}>•</span>
                            <div>
                              <strong>{e.criterion}:</strong> {e.detail.split('.')[0]}.
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Why It May Matter */}
                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)', marginBottom: '0.85rem', fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--color-berry)', display: 'block', marginBottom: '0.2rem' }}>
                        Why it may matter:
                      </strong>
                      {pat.clinicalRationale || pat.description}
                    </div>
                  </div>

                  {/* Clinician Discussion Questions */}
                  {Array.isArray(pat.suggestedClinicianQuestions) && pat.suggestedClinicianQuestions.length > 0 && (
                    <div style={{ borderTop: '1px dashed var(--border-card)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', display: 'block', marginBottom: '0.4rem' }}>
                        Recommended Discussion Question
                      </span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '0.45rem', lineHeight: 1.45 }}>
                        "{pat.suggestedClinicianQuestions[0]}"
                      </div>
                      {!allQuestions.some((q) => q.text === pat.suggestedClinicianQuestions[0]) && (
                        <button
                          type="button"
                          onClick={() => addDoctorQuestion(pat.suggestedClinicianQuestions[0])}
                          className="no-print btn btn-outline"
                          style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem' }}
                        >
                          <Plus size={12} />
                          <span>Add to My Doctor Questions</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Acute Red-Flag Triage & Safety Review */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={18} color="var(--color-berry)" />
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                  Acute Red-Flag Safety & Clinical Triage Review
                </h4>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Observational check · Not a diagnostic examination
              </span>
            </div>

            {systemSafetyAlerts.length > 0 && (
              <div style={{ marginBottom: '1rem', padding: '0.85rem 1.15rem', backgroundColor: '#FFF5F5', border: '1px solid var(--color-critical-border, #FED7D7)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', color: 'var(--color-critical)' }}>
                  <AlertTriangle size={16} />
                  <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active Safety Rule Notifications
                  </strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {systemSafetyAlerts.map((flag) => (
                    <div key={flag.id} style={{ fontSize: '0.8rem', color: '#742A2A', lineHeight: 1.45 }}>
                      <strong>• {flag.title}:</strong> {flag.reason}{' '}
                      <span style={{ fontWeight: 600, color: 'var(--color-critical)' }}>Action: {flag.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {redFlagAssessments.map((flag, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: flag.icon === 'flagged' ? '#FFF5F5' : 'var(--bg-secondary)',
                    border: flag.icon === 'flagged' ? '1px solid var(--color-critical-border)' : '1px solid var(--border-card)',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {flag.icon === 'flagged' ? (
                        <AlertTriangle size={15} color="var(--color-terracotta)" />
                      ) : flag.icon === 'none-logged' ? (
                        <CheckCircle2 size={15} color="var(--color-sage)" />
                      ) : (
                        <Info size={15} color="var(--text-muted)" />
                      )}
                      <strong style={{ color: flag.icon === 'flagged' ? 'var(--color-terracotta)' : 'var(--text-primary)', fontSize: '0.82rem' }}>
                        {flag.label}
                      </strong>
                    </div>
                    <span className={`badge ${flag.badge}`} style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                      {flag.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', paddingLeft: '1.4rem', lineHeight: 1.45 }}>
                    {flag.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Cycle History Card */}
        <div
          className="saheli-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-card)',
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-berry)', margin: '0 0 0.25rem 0', fontWeight: 600 }}>
              Recorded Cycle History
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Chronological log of recent menstrual cycles, bleeding duration, peak pain intensity, and functional impacts.
            </p>
          </div>

          {!cycleHistory.hasData ? (
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-card)', color: 'var(--text-muted)', fontSize: '0.86rem', fontStyle: 'italic' }}>
              {cycleHistory.note}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-card)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Cycle Interval</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Start Date</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Duration</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Bleeding Days</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Peak Pain</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Impact Days</th>
                  </tr>
                </thead>
                <tbody>
                  {cycleHistory.cycles.map((c, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: idx < cycleHistory.cycles.length - 1 ? '1px solid var(--border-card)' : 'none',
                        backgroundColor: c.isCurrent ? 'var(--bg-secondary)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600, color: c.isCurrent ? 'var(--color-berry)' : 'var(--text-primary)' }}>
                        {c.name}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-secondary)' }}>
                        {c.startDate}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {c.durationLabel}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-secondary)' }}>
                        {c.bleedingDuration}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {c.peakPain}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-secondary)' }}>
                        {c.impactDaysCount !== undefined ? `${c.impactDaysCount} days` : '0 days'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {cycleHistory.note && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0.85rem', borderTop: '1px solid var(--border-card)', backgroundColor: 'var(--bg-secondary)', marginTop: '0.5rem', borderRadius: '8px' }}>
                  💡 {cycleHistory.note}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 7. Questions for Your Doctor Card */}
        <div
          className="saheli-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-card)',
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-berry)', margin: '0 0 0.25rem 0', fontWeight: 600 }}>
                  Questions for Your Doctor
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Personalized discussion questions for your consultation. Check items to include in the printed brief.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                  {reportQuestions.length} of {allQuestions.length} Selected
                </span>
                {!isPreviewMode && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="no-print btn btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  >
                    <Plus size={14} />
                    <span>Add Question</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Add Question Inline Form */}
          {showAddForm && (
            <form onSubmit={handleAddQuestion} className="no-print" style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Type a specific question for your physician..."
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-focus)',
                  backgroundColor: 'var(--bg-primary)',
                  fontSize: '0.88rem'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.84rem', padding: '0.65rem 1.15rem' }}>
                Save Question
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewQuestionText(''); }}
                className="btn btn-secondary"
                style={{ fontSize: '0.84rem', padding: '0.65rem 0.95rem' }}
              >
                Cancel
              </button>
            </form>
          )}

          {/* Questions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {allQuestions.length === 0 ? (
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px' }}>
                No questions added yet. Click "Add Question" above or choose from recommended questions in the patterns section.
              </div>
            ) : isPreviewMode && reportQuestions.length === 0 ? (
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px' }}>
                No questions selected for inclusion in this brief. Exit preview mode to check questions for your appointment.
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
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: isIncluded ? 'var(--bg-secondary)' : '#FAF8F5',
                      border: isIncluded ? '1px solid var(--border-card)' : '1px dashed var(--border-subtle)',
                      opacity: isIncluded ? 1 : 0.72,
                      fontSize: '0.86rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1, alignItems: 'flex-start' }}>
                      {/* Inclusion Checkbox (Hidden in Print & Preview) */}
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
                            marginTop: '2px'
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
                              width: '17px',
                              height: '17px'
                            }}
                            aria-label={isIncluded ? `Exclude question "${q.text}" from report` : `Include question "${q.text}" in report`}
                          />
                        </label>
                      )}

                      {/* Number badge */}
                      <span
                        style={{
                          fontWeight: 700,
                          color: isIncluded ? 'var(--color-berry)' : 'var(--text-muted)',
                          flexShrink: 0,
                          minWidth: '28px',
                          marginTop: '1px'
                        }}
                      >
                        {isIncluded ? `Q${reportNum}:` : '—'}
                      </span>

                      {/* Question Text / Edit Input */}
                      {editingQuestionId === q.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }} className="no-print">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '0.4rem 0.65rem',
                              borderRadius: '8px',
                              border: '1px solid var(--border-focus)',
                              fontSize: '0.85rem'
                            }}
                            aria-label="Edit question text"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(q.id)}
                            className="btn btn-primary"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingQuestionId(null)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span
                          style={{
                            color: isIncluded ? 'var(--text-primary)' : 'var(--text-muted)',
                            lineHeight: 1.5,
                            fontWeight: isIncluded ? 500 : 400
                          }}
                        >
                          "{q.text}"
                        </span>
                      )}
                    </div>

                    {/* Question Action Controls (Hidden in Print and Preview) */}
                    {!isPreviewMode && (
                      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.75rem', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => toggleDoctorQuestionInReport(q.id)}
                          title={isIncluded ? 'Included in brief (click to exclude)' : 'Excluded from brief (click to include)'}
                          aria-label={isIncluded ? `Exclude question "${q.text}" from brief` : `Include question "${q.text}" in brief`}
                          style={{ padding: '0.3rem', color: isIncluded ? 'var(--color-berry)' : 'var(--text-muted)' }}
                        >
                          {isIncluded ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveDoctorQuestion(idx, -1)}
                          title="Move up"
                          aria-label="Move question up"
                          style={{ padding: '0.3rem', color: 'var(--text-muted)', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === allQuestions.length - 1}
                          onClick={() => moveDoctorQuestion(idx, 1)}
                          title="Move down"
                          aria-label="Move question down"
                          style={{ padding: '0.3rem', color: 'var(--text-muted)', cursor: idx === allQuestions.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === allQuestions.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDown size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(q)}
                          title="Edit question text"
                          aria-label="Edit question"
                          style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDoctorQuestion(q.id)}
                          title="Remove question"
                          aria-label="Remove question"
                          style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Regulatory Clinical Notice Stamp */}
        <div
          style={{
            borderTop: '1px solid var(--border-card)',
            paddingTop: '1rem',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}
        >
          <strong>Clinical Notice for Attending Provider:</strong> This document is an observational patient self-reported diary extract generated via Saheli. Pattern matching is derived from demonstration criteria (ACOG, ESHRE, FIGO guidelines) and is unvalidated by formal clinical trial. It does not constitute a diagnostic test, laboratory finding, or prescription.
        </div>
      </div>

      {/* Floating Bottom Print CTA Bar (no-print) */}
      <div
        className="no-print"
        style={{
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          padding: '1.25rem 1.75rem',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          💡 <strong>Tip for your appointment:</strong> Print 2 physical copies — one to hand to your doctor at the start of your consultation, and one to reference and write notes on.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            {isPreviewMode ? 'Exit Preview' : 'Report Preview'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem' }}
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
              <h3 id="share-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: 0, color: 'var(--text-primary)' }}>
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
