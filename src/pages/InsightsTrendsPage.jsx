import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart2, 
  Activity, 
  Zap, 
  ArrowRight, 
  ShieldCheck 
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

export default function InsightsTrendsPage() {
  const { logs, currentProfile, detectedPatterns, setActiveEvidenceRule, setIsDisclaimerModalOpen } = useApp();

  const [timeRange, setTimeRange] = useState('30days'); // '30days', '3cycles', '6months'

  // Prepare chart data from logs
  const entries = Object.values(logs);
  const totalDays = Math.max(currentProfile.typicalCycleLength || 28, 28);

  // 1. Pain by Cycle Day
  const painByDay = [];
  for (let day = 1; day <= totalDays; day++) {
    const matching = entries.find((e) => e.cycleDay === day);
    painByDay.push({
      cycleDay: `D${day}`,
      dayNum: day,
      painScore: matching ? matching.painScore : null,
      bleeding: matching ? matching.bleeding : 'None'
    });
  }

  // 2. Bleeding Frequency Distribution
  const bleedingCounts = {
    None: 0,
    Spotting: 0,
    Light: 0,
    Medium: 0,
    Heavy: 0
  };
  entries.forEach((e) => {
    if (e.bleeding && bleedingCounts[e.bleeding] !== undefined) {
      bleedingCounts[e.bleeding]++;
    }
  });
  const bleedingChartData = [
    { level: 'Spotting', count: bleedingCounts.Spotting, color: '#C25E48' },
    { level: 'Light', count: bleedingCounts.Light, color: '#A83256' },
    { level: 'Medium', count: bleedingCounts.Medium, color: '#89284D' },
    { level: 'Heavy', count: bleedingCounts.Heavy, color: '#6B1D3A' },
  ];

  // 3. Energy & Mood Phase Correlation (Menstrual, Follicular, Ovulatory, Luteal)
  const phaseData = [
    { phase: 'Menstrual (D1–5)', energy: 2.1, mood: 2.3, pain: 7.2 },
    { phase: 'Follicular (D6–11)', energy: 4.2, mood: 4.0, pain: 1.5 },
    { phase: 'Ovulatory (D12–16)', energy: 3.8, mood: 3.6, pain: 4.8 },
    { phase: 'Luteal (D17–28)', energy: 2.8, mood: 2.9, pain: 3.2 },
  ];

  // 4. Top Reported Symptoms Frequency
  const symptomMap = {};
  entries.forEach((e) => {
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                Longitudinal Analytics
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentProfile.name}
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
              Insights & Symptom Trends
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Cycle-synced pattern recognition mapped against clinical literature guidelines.
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
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: timeRange === t.id ? 'var(--color-berry)' : 'transparent',
                  color: timeRange === t.id ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mandatory Clinical Transparency Banner */}
      <div style={{ 
        backgroundColor: 'var(--color-berry-subtle)', 
        border: '1px solid var(--color-blush-border)', 
        borderRadius: '12px', 
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={22} color="var(--color-berry)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.84rem', color: 'var(--color-berry)', lineHeight: 1.45 }}>
            <strong>Demonstration Status:</strong> All pattern matching rules are unvalidated educational demonstrations based on published literature (ESHRE, ACOG, Rotterdam, FIGO). These patterns represent <em>potential topics for clinician review</em>, <strong>never clinical diagnoses</strong>.
          </div>
        </div>
        <button
          onClick={() => setIsDisclaimerModalOpen(true)}
          className="btn btn-outline"
          style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem', backgroundColor: '#FFFFFF' }}
        >
          View Clinical Methodology
        </button>
      </div>

      {/* 3 Core Evidence-Based Pattern Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Evidence-Based Pattern Analyses
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {detectedPatterns.map((pattern) => (
            <div 
              key={pattern.id}
              className="saheli-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${
                  pattern.badgeColor === 'berry' 
                    ? 'var(--color-berry)' 
                    : pattern.badgeColor === 'sage' 
                      ? 'var(--color-sage)' 
                      : 'var(--color-terracotta)'
                }`
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className={`badge badge-${pattern.badgeColor || 'berry'}`}>
                    {pattern.category}
                  </span>
                  <span className={`badge ${pattern.matched ? 'badge-berry' : 'badge-sage'}`} style={{ fontSize: '0.68rem' }}>
                    {pattern.matched ? 'Pattern Flagged' : 'Within Normal Range'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {pattern.title}
                </h3>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {pattern.description}
                </p>

                {/* Evidence points */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-berry)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Evidence from Diary ({pattern.evidence?.length || 0}):
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
                  * {pattern.status} — Literature: {pattern.literatureBasis.split(';')[0]}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-card)', paddingTop: '0.75rem' }}>
                  <Link to="/doctor-visit" style={{ fontSize: '0.78rem', color: 'var(--color-berry)', fontWeight: 600 }}>
                    Add to Doctor Brief
                  </Link>
                  <button
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
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Longitudinal Symptom Visualizations
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Chart 1: Energy & Mood by Cycle Phase */}
        <div className="saheli-card">
          <div className="card-header-row">
            <div className="card-title">
              <Zap size={18} color="var(--color-berry)" />
              <span>Energy & Mood Across Phases</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Score (1–5)</span>
          </div>

          <div style={{ width: '100%', height: 240, marginTop: '0.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={phaseData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card)" />
                <XAxis dataKey="phase" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="energy" stroke="#4E6E58" strokeWidth={2.5} name="Energy Level" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="mood" stroke="#6B1D3A" strokeWidth={2.5} name="Mood Rating" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4E6E58', fontWeight: 600 }}>
              <span style={{ width: '10px', height: '3px', backgroundColor: '#4E6E58' }} /> Energy
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6B1D3A', fontWeight: 600 }}>
              <span style={{ width: '10px', height: '3px', backgroundColor: '#6B1D3A' }} /> Mood
            </span>
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

          <div style={{ width: '100%', height: 240, marginTop: '0.5rem' }}>
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
                ⚠️ Frequent heavy flow days detected: discussion point for menorrhagia.
              </span>
            ) : (
              <span>Flow volume distributed normally across menses.</span>
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
                        width: `${Math.min(100, (item.count / entries.length) * 100)}%`, 
                        backgroundColor: idx === 0 ? 'var(--color-berry)' : idx === 1 ? 'var(--color-terracotta)' : 'var(--color-sage)',
                        borderRadius: '4px'
                      }} 
                    />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem 0' }}>
                No symptoms recorded yet to display frequency.
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total unique symptoms: {Object.keys(symptomMap).length}
            </span>
            <Link to="/doctor-visit" style={{ fontSize: '0.8rem', color: 'var(--color-berry)', fontWeight: 600 }}>
              Include in Brief →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
