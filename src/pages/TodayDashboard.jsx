import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CycleWheel from '../components/dashboard/CycleWheel';
import InsightCard from '../components/dashboard/InsightCard';
import PainChart from '../components/dashboard/PainChart';
import QuickCheckinCard from '../components/dashboard/QuickCheckinCard';
import VisitPrepCard from '../components/dashboard/VisitPrepCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import EduCard from '../components/dashboard/EduCard';
import SafetyAlertBanner from '../components/common/SafetyAlertBanner';
import { getActiveSafetyAlerts } from '../services/safetyRules';
import { findPeriodStarts } from '../utils/cycleCalculations';
import {
  Calendar,
  Activity,
  AlertTriangle,
  FileText,
  CalendarCheck,
  Edit3,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';

export default function TodayDashboard() {
  const {
    currentProfile,
    todayCycleMetrics,
    estimatedNextPeriod,
    profileId,
    logs,
    todayKey,
    todayEntry
  } = useApp();

  // Observational Rule-Based Safety Alerts
  const activeSafetyFlags = useMemo(() => {
    return getActiveSafetyAlerts(logs);
  }, [logs]);

  // Metric Scope switcher: 'cycle' (current cycle) vs 'all' (all-time history)
  const [metricScope, setMetricScope] = useState('cycle');
  const periodStarts = useMemo(() => findPeriodStarts(logs), [logs]);

  // Dynamic time-aware greeting
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  const firstName = currentProfile.name ? currentProfile.name.split(' ')[0] : 'there';

  // Current cycle vs All-time calculation
  const { currentCycleMetrics, cycleBoundaryNote } = useMemo(() => {
    const sortedDates = Object.keys(logs).sort();
    if (sortedDates.length === 0) {
      return {
        currentCycleMetrics: {
          loggedDays: 0,
          avgPain: null,
          painCount: 0,
          severeDays: 0
        },
        cycleBoundaryNote: 'No entries recorded in diary yet.'
      };
    }

    let currentEntries = [];
    let startDate = null;

    if (periodStarts.length === 0) {
      currentEntries = Object.values(logs);
      startDate = sortedDates[0];
    } else {
      const latestStart = periodStarts[periodStarts.length - 1];
      startDate = latestStart;
      currentEntries = Object.entries(logs)
        .filter(([d]) => d >= latestStart)
        .map(([, v]) => v);
    }

    const painScores = currentEntries
      .map((e) => Number(e.painScore))
      .filter((s) => !isNaN(s) && s !== null && s !== undefined);

    const avg = painScores.length > 0
      ? (painScores.reduce((a, b) => a + b, 0) / painScores.length).toFixed(1)
      : null;

    const severe = currentEntries.filter((e) => Number(e.painScore) >= 7).length;

    return {
      currentCycleMetrics: {
        loggedDays: currentEntries.length,
        avgPain: avg,
        painCount: painScores.length,
        severeDays: severe
      },
      cycleBoundaryNote: periodStarts.length > 0
        ? `Current cycle started ${startDate} (${currentEntries.length} recorded days in active cycle; unrecorded days are not counted as symptom-free).`
        : `Showing active diary records (${currentEntries.length} days logged; unrecorded days are not counted as symptom-free).`
    };
  }, [logs, periodStarts]);

  const allTimeMetrics = useMemo(() => {
    const entries = Object.values(logs);
    if (entries.length === 0) {
      return { loggedDays: 0, avgPain: null, painCount: 0, severeDays: 0 };
    }
    const painScores = entries
      .map((e) => Number(e.painScore))
      .filter((s) => !isNaN(s) && s !== null && s !== undefined);
    const avg = painScores.length > 0
      ? (painScores.reduce((a, b) => a + b, 0) / painScores.length).toFixed(1)
      : null;
    const severe = entries.filter((e) => Number(e.painScore) >= 7).length;
    return {
      loggedDays: entries.length,
      avgPain: avg,
      painCount: painScores.length,
      severeDays: severe
    };
  }, [logs]);

  const activeStats = metricScope === 'cycle' ? currentCycleMetrics : allTimeMetrics;

  // Contextual supportive message based on cycle phase
  const supportiveMessage = useMemo(() => {
    const phase = (todayCycleMetrics?.phase || '').toLowerCase();
    if (phase.includes('menstrual')) {
      return 'Your body is in its renewal phase. Prioritize gentle rest, warmth, hydration, and pacing today.';
    }
    if (phase.includes('follicular')) {
      return 'Estrogen is steadily rising, often supporting natural focus, increasing stamina, and lighter mood.';
    }
    if (phase.includes('ovulat')) {
      return 'Mid-cycle vitality is typically peak; remember to log any subtle twinges, changes in discharge, or energy shifts.';
    }
    if (phase.includes('luteal')) {
      return 'Progesterone is dominant. Note any subtle pre-menstrual symptoms, changes in sleep, digestion, or pelvic comfort.';
    }
    return 'Consistent daily logging builds an evidence-based timeline for you and your healthcare provider.';
  }, [todayCycleMetrics?.phase]);

  return (
    <div className="page-content-wrapper">
      {/* 1. Welcome Section & Today's Check-in Action */}
      <div
        className="saheli-card"
        style={{
          marginBottom: '1.75rem',
          padding: '1.5rem 1.75rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ flex: '1 1 500px' }}>
            {/* Cycle Status Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.74rem' }}>
                Cycle Day {todayCycleMetrics.cycleDay} of ~{currentProfile.typicalCycleLength || 28}d
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                · {todayCycleMetrics.phase}
              </span>
              {todayCycleMetrics.isEstimated && (
                <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                  Estimated Phase
                </span>
              )}
            </div>

            {/* Time-Aware Personalized Greeting */}
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.75rem, 4vw + 0.5rem, 2.35rem)',
                fontWeight: 600,
                color: 'var(--color-berry)',
                margin: '0 0 0.45rem 0',
                lineHeight: 1.2
              }}
            >
              {greeting}, {firstName}
            </h1>

            {/* Supportive Contextual Message */}
            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.55, margin: 0 }}>
              Your body is currently in the <strong>{todayCycleMetrics.phase}</strong>. {supportiveMessage}
            </p>
          </div>

          {/* Today's Check-in Status & Call-to-Action */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-secondary)',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid var(--border-card)',
              minWidth: '240px',
              gap: '0.65rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {todayEntry ? (
                <>
                  <CheckCircle2 size={16} color="var(--color-sage)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-sage-dark)' }}>
                    Today's check-in recorded
                  </span>
                </>
              ) : (
                <>
                  <Clock size={16} color="var(--color-berry)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-berry)' }}>
                    Check-in pending for today
                  </span>
                </>
              )}
            </div>

            {todayEntry ? (
              <Link
                to="/checkin"
                className="btn btn-outline"
                style={{ fontSize: '0.84rem', padding: '0.45rem 1.15rem', width: '100%' }}
              >
                <Edit3 size={15} />
                <span>Edit Today's Entry</span>
              </Link>
            ) : (
              <Link
                to="/checkin"
                className="btn btn-primary"
                style={{ fontSize: '0.86rem', padding: '0.5rem 1.2rem', width: '100%', boxShadow: '0 2px 6px rgba(129, 39, 70, 0.25)' }}
              >
                <CalendarCheck size={16} />
                <span>Log Today's Symptoms</span>
              </Link>
            )}

            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {todayKey} · Day {todayCycleMetrics.cycleDay}
            </span>
          </div>
        </div>
      </div>

      {/* Persistent Observational Safety Alert Banner */}
      <SafetyAlertBanner flags={activeSafetyFlags} />

      {/* 2. Quick Statistics Section */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Scope Switcher Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.65rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Summary & Longitudinal Statistics
            </h2>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {metricScope === 'cycle' ? cycleBoundaryNote : 'Aggregated lifetime statistics across all diary records.'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Scope:</span>
            <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'var(--bg-secondary)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              <button
                type="button"
                onClick={() => setMetricScope('cycle')}
                style={{
                  padding: '0.28rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: metricScope === 'cycle' ? 'var(--color-berry)' : 'transparent',
                  color: metricScope === 'cycle' ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Current Cycle
              </button>
              <button
                type="button"
                onClick={() => setMetricScope('all')}
                style={{
                  padding: '0.28rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: metricScope === 'all' ? 'var(--color-berry)' : 'transparent',
                  color: metricScope === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                All-Time History
              </button>
            </div>
          </div>
        </div>

        {/* 4 Compact Metric Cards Grid */}
        <div className="dashboard-stats-grid">
          {/* Card 1: Current Cycle Day */}
          <div
            className="saheli-card"
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid var(--border-card)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Current Cycle Day
                </span>
                <Calendar size={18} color="var(--color-berry)" />
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--color-berry)', lineHeight: 1.1 }}>
                Day {todayCycleMetrics.cycleDay}
              </div>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              of ~{currentProfile.typicalCycleLength || 28}d cycle · {todayCycleMetrics.phase}
            </div>
          </div>

          {/* Card 2: Average Recorded Pain */}
          <div
            className="saheli-card"
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid var(--border-card)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
                  {metricScope === 'cycle' ? 'Cycle Avg Pain' : 'All-Time Avg Pain'}
                </span>
                <Activity size={18} color={activeStats.avgPain !== null && Number(activeStats.avgPain) >= 6 ? 'var(--color-terracotta)' : 'var(--color-berry)'} />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: activeStats.avgPain !== null ? '1.9rem' : '1.3rem',
                  fontWeight: 600,
                  color: activeStats.avgPain !== null && Number(activeStats.avgPain) >= 6 ? 'var(--color-terracotta)' : 'var(--text-primary)',
                  lineHeight: 1.1
                }}
              >
                {activeStats.avgPain !== null ? `${activeStats.avgPain} / 10` : 'No pain logged'}
              </div>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {activeStats.painCount > 0
                ? `Across ${activeStats.painCount} recorded ${activeStats.painCount === 1 ? 'entry' : 'entries'}`
                : 'Missing / unrecorded'}
            </div>
          </div>

          {/* Card 3: Severe Pain Days */}
          <div
            className="saheli-card"
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid var(--border-card)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
                  {metricScope === 'cycle' ? 'Cycle Severe Days' : 'All-Time Severe Days'}
                </span>
                <AlertTriangle size={18} color={activeStats.severeDays > 0 ? 'var(--color-terracotta)' : 'var(--text-muted)'} />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.9rem',
                  fontWeight: 600,
                  color: activeStats.severeDays > 0 ? 'var(--color-terracotta)' : 'var(--text-primary)',
                  lineHeight: 1.1
                }}
              >
                {activeStats.severeDays} {activeStats.severeDays === 1 ? 'day' : 'days'}
              </div>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Recorded pain severity ≥ 7 / 10
            </div>
          </div>

          {/* Card 4: Days Logged */}
          <div
            className="saheli-card"
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid var(--border-card)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
                  {metricScope === 'cycle' ? 'Cycle Days Logged' : 'All-Time Days Logged'}
                </span>
                <FileText size={18} color="var(--color-berry)" />
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--color-berry)', lineHeight: 1.1 }}>
                {activeStats.loggedDays} {activeStats.loggedDays === 1 ? 'day' : 'days'}
              </div>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {metricScope === 'cycle' ? 'Active cycle entries' : 'Total longitudinal records'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Interactive Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* Row 1: Cycle Overview & Clock + Observed Pattern for Clinical Discussion */}
        <div className="dashboard-two-col">

          {/* Cycle Overview & Clock Card */}
          <div className="saheli-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header-row">
                <div className="card-title">
                  <Calendar size={18} color="var(--color-berry)" />
                  <span>Cycle Overview & Clock</span>
                </div>
                <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
                  ~{estimatedNextPeriod.daysUntil} days to next flow (est.)
                </span>
              </div>

              {/* Estimate Notice Banner */}
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Info size={13} style={{ flexShrink: 0 }} />
                <span>Provisional estimate based on logged intervals (±3d natural variation). Not guaranteed clinical dates.</span>
              </div>

              {/* Circular Cycle Visualization */}
              <CycleWheel
                cycleDay={todayCycleMetrics.cycleDay}
                totalCycleLength={Number(currentProfile.typicalCycleLength) || 28}
                currentPhase={todayCycleMetrics.phase}
              />
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Estimated next flow: ~{estimatedNextPeriod.formattedDate} (provisional estimate)
              </span>
              <Link to="/calendar" style={{ fontSize: '0.8rem', color: 'var(--color-berry)', fontWeight: 600 }}>
                View Calendar →
              </Link>
            </div>
          </div>

          {/* Observed Pattern for Clinical Discussion */}
          <InsightCard />
        </div>

        {/* Row 2: Today's Check-in Card + Doctor Visit Prep Card */}
        <div className="dashboard-two-col">
          <QuickCheckinCard />
          <VisitPrepCard />
        </div>

        {/* Row 3: Longitudinal Pain Across Cycle Chart */}
        <div>
          <PainChart />
        </div>

        {/* Row 4: Recent Activity + Educational Clinical Resources */}
        <div className="dashboard-two-col">
          <RecentActivityCard />
          <EduCard />
        </div>

        {/* Row 5: Browser Storage & Privacy Status Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-card)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-berry)' }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <strong>Environment:</strong> Viewing {profileId === 'guest' ? 'private unshared personal diary' : `synthetic demo records for ${currentProfile.name}`} ({currentProfile.primaryPatternFocus}). Stored strictly within your browser. No PHI is sent to external servers.
            </div>
          </div>
          <Link to="/settings" className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}>
            Manage Diary Settings
          </Link>
        </div>

      </div>
    </div>
  );
}
