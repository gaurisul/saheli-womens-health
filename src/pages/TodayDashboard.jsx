import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import CycleWheel from '../components/dashboard/CycleWheel';
import InsightCard from '../components/dashboard/InsightCard';
import PainChart from '../components/dashboard/PainChart';
import QuickCheckinCard from '../components/dashboard/QuickCheckinCard';
import VisitPrepCard from '../components/dashboard/VisitPrepCard';
import EduCard from '../components/dashboard/EduCard';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { findPeriodStarts } from '../utils/cycleCalculations';
import SafetyAlertBanner from '../components/common/SafetyAlertBanner';
import { getActiveSafetyAlerts } from '../services/safetyRules';

export default function TodayDashboard() {
  const {
    currentProfile,
    summaryMetrics,
    todayCycleMetrics,
    estimatedNextPeriod,
    profileId,
    logs
  } = useApp();

  // Task 7: Distinguish Current Cycle Metrics from Lifetime History
  // Observational Rule-Based Safety Alerts
  const activeSafetyFlags = useMemo(() => {
    return getActiveSafetyAlerts(logs);
  }, [logs]);

  const [metricScope, setMetricScope] = useState('cycle'); // 'cycle' | 'all'
  const periodStarts = useMemo(() => findPeriodStarts(logs), [logs]);

  const { currentCycleMetrics, cycleBoundaryNote } = useMemo(() => {
    const sortedDates = Object.keys(logs).sort();
    if (sortedDates.length === 0) {
      return {
        currentCycleMetrics: { loggedDays: 0, avgPain: '0.0', severeDays: 0 },
        cycleBoundaryNote: 'No entries recorded in diary yet.'
      };
    }

    if (periodStarts.length === 0) {
      const entries = Object.values(logs);
      const painScores = entries
        .map((e) => Number(e.painScore))
        .filter((s) => !isNaN(s) && s > 0);
      const avg = painScores.length > 0
        ? (painScores.reduce((a, b) => a + b, 0) / painScores.length).toFixed(1)
        : '0.0';
      const severe = entries.filter((e) => Number(e.painScore) >= 7).length;

      return {
        currentCycleMetrics: { loggedDays: entries.length, avgPain: avg, severeDays: severe },
        cycleBoundaryNote: 'No menstrual Day 1 logged; showing active diary records (unrecorded days are not counted as symptom-free).'
      };
    }

    const latestStart = periodStarts[periodStarts.length - 1];
    const currentEntries = Object.entries(logs)
      .filter(([d]) => d >= latestStart)
      .map(([, v]) => v);

    const painScores = currentEntries
      .map((e) => Number(e.painScore))
      .filter((s) => !isNaN(s) && s > 0);
    const avg = painScores.length > 0
      ? (painScores.reduce((a, b) => a + b, 0) / painScores.length).toFixed(1)
      : '0.0';
    const severe = currentEntries.filter((e) => Number(e.painScore) >= 7).length;

    return {
      currentCycleMetrics: {
        loggedDays: currentEntries.length,
        avgPain: avg,
        severeDays: severe
      },
      cycleBoundaryNote: `Current cycle started ${latestStart} (${currentEntries.length} days logged; unrecorded days are not counted as symptom-free).`
    };
  }, [logs, periodStarts]);

  const displayedMetrics = metricScope === 'cycle'
    ? currentCycleMetrics
    : {
        loggedDays: summaryMetrics.totalLoggedDays,
        avgPain: summaryMetrics.averagePainScore || '0.0',
        severeDays: summaryMetrics.severePainDaysCount
      };

  // Dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = currentProfile.name ? currentProfile.name.split(' ')[0] : 'there';

  return (
    <div className="page-content-wrapper">
      {/* Welcome Headline & Supportive Guidance */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.74rem' }}>
                Cycle Day {todayCycleMetrics.cycleDay} of ~{currentProfile.typicalCycleLength || 28}d
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                · {todayCycleMetrics.phase}
              </span>
              {todayCycleMetrics.isEstimated && (
                <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                  Estimated Phase
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 'clamp(1.65rem, 5vw + 0.3rem, 2.35rem)', color: 'var(--text-primary)', marginBottom: '0.4rem', wordBreak: 'break-word' }}>
              {getGreeting()}, {firstName}
            </h1>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.5 }}>
              Your body is currently in the <strong>{todayCycleMetrics.phase}</strong>. {todayCycleMetrics.phaseDescription}
            </p>
          </div>

          {/* Quick Real Metrics Header Pills with Cycle vs Lifetime Scope */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            {/* Scope switcher */}
            <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-secondary)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              <button
                type="button"
                onClick={() => setMetricScope('cycle')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: metricScope === 'cycle' ? 'var(--color-berry)' : 'transparent',
                  color: metricScope === 'cycle' ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Current Cycle
              </button>
              <button
                type="button"
                onClick={() => setMetricScope('all')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: metricScope === 'all' ? 'var(--color-berry)' : 'transparent',
                  color: metricScope === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                All-Time History
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '0.65rem 1rem', textAlign: 'center', minWidth: '95px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {metricScope === 'cycle' ? 'Cycle Days Logged' : 'All-Time Days Logged'}
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-berry)' }}>
                  {displayedMetrics.loggedDays}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '0.65rem 1rem', textAlign: 'center', minWidth: '95px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {metricScope === 'cycle' ? 'Cycle Avg Pain' : 'All-Time Avg Pain'}
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: Number(displayedMetrics.avgPain) >= 6 ? 'var(--color-terracotta)' : 'var(--color-sage-dark)' }}>
                  {displayedMetrics.avgPain}/10
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '0.65rem 1rem', textAlign: 'center', minWidth: '95px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {metricScope === 'cycle' ? 'Cycle Severe Days (≥7)' : 'All-Time Severe Days (≥7)'}
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: displayedMetrics.severeDays > 0 ? 'var(--color-terracotta)' : 'var(--text-muted)' }}>
                  {displayedMetrics.severeDays}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {metricScope === 'cycle' ? cycleBoundaryNote : 'Aggregated lifetime statistics across all diary records.'}
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Observational Safety Alert Banner */}
      <SafetyAlertBanner flags={activeSafetyFlags} />

      {/* Main Dashboard Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* Top Row: Cycle Wheel + Latest Insight Card */}
        <div className="dashboard-two-col">

          {/* Cycle Overview Card with Circular Wheel */}
          <div className="saheli-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header-row">
              <div className="card-title">
                <Calendar size={18} color="var(--color-berry)" />
                <span>Cycle Overview & Clock</span>
              </div>
              <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
                ~{estimatedNextPeriod.daysUntil} days to next menses
              </span>
            </div>

            <CycleWheel
              cycleDay={todayCycleMetrics.cycleDay}
              totalCycleLength={Number(currentProfile.typicalCycleLength) || 28}
              currentPhase={todayCycleMetrics.phase}
            />

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Estimated next flow: ~{estimatedNextPeriod.formattedDate} (±3 days variation)
              </span>
              <Link to="/calendar" style={{ fontSize: '0.8rem', color: 'var(--color-berry)', fontWeight: 600 }}>
                View Calendar →
              </Link>
            </div>
          </div>

          {/* Latest Evidence-Based Insight Card */}
          <InsightCard />
        </div>

        {/* Middle Row: Quick Check-in + Doctor Visit Prep */}
        <div className="dashboard-two-col">
          {/* Daily Check-in Card */}
          <QuickCheckinCard />

          {/* Visit Preparation Card */}
          <VisitPrepCard />
        </div>

        {/* Pain Across Cycle Chart */}
        <div>
          <PainChart />
        </div>

        {/* Educational Resource Cards */}
        <div>
          <EduCard />
        </div>

        {/* Fictional Sample Data Banner */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-card)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
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
