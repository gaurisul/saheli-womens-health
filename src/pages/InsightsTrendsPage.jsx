import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart2,
  Activity,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import { formatDate } from '../data/sampleProfiles';
import {
  getPhaseInfo,
  parseDate,
  findPeriodStarts
} from '../utils/cycleCalculations';

export default function InsightsTrendsPage() {
  const { logs, currentProfile, detectedPatterns, setActiveEvidenceRule, summaryMetrics } = useApp();

  const [timeRange, setTimeRange] = useState('30days'); // '30days', '3cycles', '6months'

  // Sort and index all logged entries chronologically
  const sortedDates = useMemo(() => Object.keys(logs).sort(), [logs]);
  const allEntries = useMemo(() => {
    return sortedDates.map((date) => ({ date, ...logs[date] }));
  }, [sortedDates, logs]);

  const anchorDateStr = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;

  // Task 3: Functional date-range filtering
  const { filteredEntries, timeRangeLabel, cycleExplanation } = useMemo(() => {
    if (sortedDates.length === 0) {
      return {
        filteredEntries: [],
        timeRangeLabel: 'All Records',
        cycleExplanation: null
      };
    }

    if (timeRange === '30days') {
      const anchorDate = parseDate(anchorDateStr);
      const cutoff = new Date(anchorDate);
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = formatDate(cutoff);
      const filtered = allEntries.filter((e) => e.date >= cutoffStr && e.date <= anchorDateStr);
      return {
        filteredEntries: filtered,
        timeRangeLabel: 'Last 30 Days',
        cycleExplanation: null
      };
    }

    if (timeRange === '3cycles') {
      const periodStarts = findPeriodStarts(logs);
      let cutoffStr = null;
      let explanation = null;

      if (periodStarts.length >= 3) {
        cutoffStr = periodStarts[periodStarts.length - 3];
        explanation = `Covering the last 3 logged cycle starts (${cutoffStr} to ${anchorDateStr}).`;
      } else if (periodStarts.length > 0) {
        cutoffStr = periodStarts[0];
        explanation = `Displaying all ${periodStarts.length} cycle start(s) recorded in diary. Tracking 3 complete cycles requires at least 3 logged menstrual starts.`;
      } else {
        explanation = 'No distinct period start dates identified in diary. Showing all available records.';
      }

      const filtered = cutoffStr
        ? allEntries.filter((e) => e.date >= cutoffStr && e.date <= anchorDateStr)
        : allEntries;

      return {
        filteredEntries: filtered,
        timeRangeLabel: 'Past 3 Cycles',
        cycleExplanation: explanation
      };
    }

    if (timeRange === '6months') {
      const anchorDate = parseDate(anchorDateStr);
      const cutoff = new Date(anchorDate);
      cutoff.setMonth(cutoff.getMonth() - 6);
      const cutoffStr = formatDate(cutoff);
      const filtered = allEntries.filter((e) => e.date >= cutoffStr && e.date <= anchorDateStr);
      return {
        filteredEntries: filtered,
        timeRangeLabel: 'Past 6 Months',
        cycleExplanation: null
      };
    }

    return {
      filteredEntries: allEntries,
      timeRangeLabel: 'All Records',
      cycleExplanation: null
    };
  }, [logs, timeRange, sortedDates, allEntries, anchorDateStr]);

  // Task 5: Dynamic cycle phase correlation using shared getPhaseInfo
  const cycleLength = Number(currentProfile.typicalCycleLength) || 28;
  const periodLength = Number(currentProfile.typicalPeriodLength) || 5;

  const ovulationDay = Math.max(periodLength + 2, cycleLength - 14);
  const fertileStart = Math.max(periodLength + 1, ovulationDay - 3);
  const fertileEnd = Math.min(cycleLength - 1, ovulationDay + 1);

  const phaseBuckets = {
    'Menstrual Phase': { label: `Menstrual (D1–${periodLength})`, entries: [] },
    'Follicular Phase': { label: `Follicular (D${periodLength + 1}–${fertileStart - 1})`, entries: [] },
    'Ovulatory Window': { label: `Ovulatory (D${fertileStart}–${fertileEnd})`, entries: [] },
    'Luteal Phase': { label: `Luteal (D${fertileEnd + 1}–${cycleLength})`, entries: [] }
  };

  filteredEntries.forEach((e) => {
    if (e.cycleDay && Number(e.cycleDay) > 0) {
      const info = getPhaseInfo(Number(e.cycleDay), cycleLength, periodLength);
      if (phaseBuckets[info.phase]) {
        phaseBuckets[info.phase].entries.push(e);
      } else if (info.phase === 'Extended / Delayed Cycle') {
        phaseBuckets['Luteal Phase'].entries.push(e);
      }
    }
  });

  const phaseData = Object.values(phaseBuckets).map((bucket) => {
    if (bucket.entries.length === 0) {
      return { phase: bucket.label, energy: null, mood: null, sample: 0 };
    }
    const avgEnergy = (
      bucket.entries.reduce((acc, curr) => acc + (Number(curr.energyRating) || 3), 0) / bucket.entries.length
    ).toFixed(1);
    const avgMood = (
      bucket.entries.reduce((acc, curr) => acc + (Number(curr.moodRating) || 3), 0) / bucket.entries.length
    ).toFixed(1);
    return {
      phase: bucket.label,
      energy: parseFloat(avgEnergy),
      mood: parseFloat(avgMood),
      sample: bucket.entries.length
    };
  });

  // Chart 2: Bleeding Frequency Distribution in filtered window
  const bleedingCounts = {
    None: 0,
    Spotting: 0,
    Light: 0,
    Medium: 0,
    Heavy: 0
  };
  filteredEntries.forEach((e) => {
    if (e.bleeding && bleedingCounts[e.bleeding] !== undefined) {
      bleedingCounts[e.bleeding]++;
    }
  });
  const bleedingChartData = [
    { level: 'Spotting', count: bleedingCounts.Spotting, color: 'var(--color-terracotta)' },
    { level: 'Light', count: bleedingCounts.Light, color: 'var(--color-berry-light)' },
    { level: 'Medium', count: bleedingCounts.Medium, color: 'var(--color-berry)' },
    { level: 'Heavy', count: bleedingCounts.Heavy, color: 'var(--color-berry-dark)' },
  ];

  // Chart 3: Top Reported Symptoms Frequency in filtered window
  const symptomMap = {};
  filteredEntries.forEach((e) => {
    (e.symptoms || []).forEach((s) => {
      symptomMap[s] = (symptomMap[s] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomMap)
    .map(([symptom, count]) => ({ symptom: symptom.split('/')[0].trim(), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="page-content-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                Longitudinal Analytics
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentProfile.name} · {filteredEntries.length} of {allEntries.length} Logged Days ({timeRangeLabel})
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw + 0.3rem, 2.2rem)', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
              Insights & Symptom Trends
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Cycle-synced pattern recognition mapped against clinical literature guidelines (ESHRE, ACOG, FIGO).
            </p>
          </div>

          {/* Time Filter Controls */}
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-card)' }}>
            {[
              { id: '30days', label: 'Last 30 Days' },
              { id: '3cycles', label: 'Past 3 Cycles' },
              { id: '6months', label: '6 Months' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: timeRange === t.id ? 600 : 500,
                  backgroundColor: timeRange === t.id ? 'var(--color-berry)' : 'transparent',
                  color: timeRange === t.id ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detected Patterns Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
              Literature-Referenced Clinical Patterns
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Evaluated across all historical diary entries ({summaryMetrics.totalLoggedDays} days) per clinical guidelines. Non-diagnostic discussion points for clinician consult.
            </span>
          </div>
          <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
            Full History ({summaryMetrics.totalLoggedDays}d)
          </span>
        </div>

        <div className="patterns-grid">
          {detectedPatterns.map((pattern) => (
            <div
              key={pattern.id}
              className="saheli-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: pattern.matched ? '4px solid var(--color-berry)' : '1px solid var(--border-card)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className={`badge badge-${pattern.badgeColor || 'berry'}`}>
                    {pattern.category}
                  </span>
                  <span className="badge" style={{
                    fontSize: '0.7rem',
                    backgroundColor: pattern.matched ? 'var(--color-berry-subtle)' : 'var(--bg-secondary)',
                    color: pattern.matched ? 'var(--color-berry)' : 'var(--text-muted)',
                    border: '1px solid var(--border-card)'
                  }}>
                    {pattern.matched ? pattern.severity : 'Threshold Unmet'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.18rem', marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
                  {pattern.title}
                </h3>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {pattern.description}
                </p>

                {/* Evidence points */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem', border: '1px solid var(--border-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-berry)', textTransform: 'uppercase' }}>
                      Evidence from Diary ({pattern.evidence?.length || 0}):
                    </span>
                    {pattern.dateRange && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {pattern.dateRange.start} to {pattern.dateRange.end}
                      </span>
                    )}
                  </div>

                  {(pattern.evidence || []).length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {pattern.evidence.map((ev, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>
                          <strong>{ev.criterion}:</strong> {ev.detail}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No matching criteria recorded for this pattern in current logs.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                  * {pattern.status} — Reference: {pattern.literatureBasis.split(';')[0]}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-card)', paddingTop: '0.75rem' }}>
                  <Link to="/doctor-visit" style={{ fontSize: '0.78rem', color: 'var(--color-berry)', fontWeight: 600 }}>
                    Add to Doctor Brief
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveEvidenceRule(pattern)}
                    className="btn btn-blush"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                  >
                    <span>See Evidence</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Trends Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>
            Longitudinal Symptom Visualizations — {timeRangeLabel}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing {filteredEntries.length} diary entry date(s) within selected window.
          </span>
        </div>
        {cycleExplanation && (
          <span style={{ fontSize: '0.76rem', color: 'var(--color-sage-dark)', backgroundColor: 'var(--bg-secondary)', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-card)' }}>
            ℹ️ {cycleExplanation}
          </span>
        )}
      </div>

      {filteredEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-subtle)', margin: '1rem 0' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            No symptom entries recorded in diary for {timeRangeLabel}.
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Missing entries cannot be assumed symptom-free. Log check-ins in the Daily Check-in tab to build longitudinal trends.
          </span>
        </div>
      ) : (
        <div className="insights-chart-grid">

          {/* Chart 1: Energy & Mood by Cycle Phase */}
          <div className="saheli-card">
            <div className="card-header-row">
              <div className="card-title">
                <Zap size={18} color="var(--color-berry)" />
                <span>Energy & Mood Across Phases</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rating (1–5)</span>
            </div>

            <div style={{ width: '100%', height: 240, marginTop: '0.5rem', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={phaseData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card)" />
                  <XAxis dataKey="phase" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="energy" stroke="#4E6E58" strokeWidth={2.5} name="Energy Level" dot={{ r: 4 }} connectNulls={true} />
                  <Line type="monotone" dataKey="mood" stroke="#6B1D3A" strokeWidth={2.5} name="Mood Rating" dot={{ r: 4 }} connectNulls={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.78rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4E6E58', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '3px', backgroundColor: '#4E6E58' }} /> Vitality
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6B1D3A', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '3px', backgroundColor: '#6B1D3A' }} /> Mood
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem', fontStyle: 'italic' }}>
              Self-reported ratings across dynamic cycle phases. Unrecorded phases contain no data. Observed associations do not establish medical causation.
            </div>
          </div>

          {/* Chart 2: Bleeding Heaviness Distribution */}
          <div className="saheli-card">
            <div className="card-header-row">
              <div className="card-title">
                <Activity size={18} color="var(--color-berry)" />
                <span>Menstrual Flow Profile</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Days logged</span>
            </div>

            <div style={{ width: '100%', height: 240, marginTop: '0.5rem', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bleedingChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card)" />
                  <XAxis dataKey="level" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {bleedingChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
              {bleedingCounts.Heavy >= 2 ? (
                <span style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>
                  ⚠️ Frequent heavy flow days detected in this window ({bleedingCounts.Heavy} days): discussion point for menorrhagia.
                </span>
              ) : (
                <span>Flow volume distributed across {filteredEntries.length} logged days in this window.</span>
              )}
            </div>
          </div>

          {/* Chart 3: Top Co-occurring Symptoms */}
          <div className="saheli-card">
            <div className="card-header-row">
              <div className="card-title">
                <BarChart2 size={18} color="var(--color-berry)" />
                <span>Top Co-occurring Symptoms</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Frequency</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
              {topSymptoms.length > 0 ? (
                topSymptoms.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.symptom}</span>
                      <span style={{ color: 'var(--color-berry)', fontWeight: 700 }}>{item.count} days</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (item.count / Math.max(1, filteredEntries.length)) * 100)}%`,
                          backgroundColor: idx === 0 ? 'var(--color-berry)' : idx === 1 ? 'var(--color-terracotta)' : 'var(--color-sage)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
                  No symptoms recorded in this window to display frequency.
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Total unique symptoms in window: {Object.keys(symptomMap).length}
              </span>
              <Link to="/doctor-visit" style={{ fontSize: '0.8rem', color: 'var(--color-berry)', fontWeight: 600 }}>
                Include in Brief →
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
