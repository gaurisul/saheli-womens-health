import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function QuickCheckinCard() {
  const { todayEntry, todayKey, saveEntry, isSavingEntry, todayCycleMetrics } = useApp();

  const [quickBleeding, setQuickBleeding] = useState('None');
  const [quickPain, setQuickPain] = useState(0);
  const [quickEnergy, setQuickEnergy] = useState(3);
  const [quickMood, setQuickMood] = useState(3);
  const [showQuickForm, setShowQuickForm] = useState(false);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    saveEntry({
      date: todayKey,
      cycleDay: todayCycleMetrics.cycleDay,
      bleeding: quickBleeding,
      painScore: quickPain,
      energyRating: quickEnergy,
      moodRating: quickMood,
      symptoms: quickPain > 0 ? ['Lower abdominal cramps'] : ['Calm & balanced'],
      functionalImpact: quickPain >= 6,
      impactTypes: quickPain >= 6 ? ['Reduced activity'] : [],
      notes: 'Logged via dashboard quick check-in.'
    });
  };

  return (
    <div className="saheli-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header-row">
        <div className="card-title">
          <CalendarCheck size={18} color="var(--color-berry)" />
          <span>Today's Check-in</span>
        </div>
        <span className={`badge ${todayEntry ? 'badge-sage' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
          {todayEntry ? 'Recorded for Today' : 'Pending Check-in'}
        </span>
      </div>

      {todayEntry ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-sage-dark)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.9rem' }}>
              <CheckCircle2 size={16} color="var(--color-sage)" />
              <span>Symptoms recorded for today ({todayKey})</span>
            </div>

            {/* Compact Metric Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', marginBottom: '0.9rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Bleeding Flow
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-berry)', marginTop: '0.15rem' }}>
                  {todayEntry.bleeding || 'None'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Recorded Pain
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: Number(todayEntry.painScore) >= 7 ? 'var(--color-terracotta)' : 'var(--color-berry)', marginTop: '0.15rem' }}>
                  {todayEntry.painScore ?? 0} / 10
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Vitality & Energy
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {todayEntry.energyRating ? `${todayEntry.energyRating} / 5` : 'Not rated'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Mood
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {todayEntry.moodRating ? `${todayEntry.moodRating} / 5` : 'Not rated'}
                </div>
              </div>
            </div>

            {/* Functional Impact Banner */}
            <div
              style={{
                backgroundColor: todayEntry.functionalImpact ? 'rgba(194, 94, 72, 0.08)' : 'var(--bg-secondary)',
                border: todayEntry.functionalImpact ? '1px solid var(--color-terracotta)' : '1px solid var(--border-card)',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
                fontSize: '0.8rem',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              {todayEntry.functionalImpact ? (
                <>
                  <AlertCircle size={15} color="var(--color-terracotta)" style={{ flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>
                    Functional Impact: {Array.isArray(todayEntry.impactTypes) && todayEntry.impactTypes.length > 0 ? todayEntry.impactTypes.join(', ') : 'Daily disruption reported'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} color="var(--color-sage)" style={{ flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Functional Impact: No daily activity disruption reported
                  </span>
                </>
              )}
            </div>

            {/* Logged Symptoms Chips */}
            {todayEntry.symptoms && todayEntry.symptoms.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Recorded Symptoms ({todayEntry.symptoms.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {todayEntry.symptoms.slice(0, 4).map((s, idx) => (
                    <span key={idx} className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
                      {s}
                    </span>
                  ))}
                  {todayEntry.symptoms.length > 4 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                      +{todayEntry.symptoms.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Connected to diary store
            </span>
            <Link to="/checkin" className="btn btn-blush" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
              <Edit3 size={14} />
              <span>Edit Today's Entry</span>
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-berry-subtle)',
                  color: 'var(--color-berry)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}
              >
                <CalendarCheck size={22} />
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                How is your body feeling today?
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '360px', margin: '0 auto 1.25rem' }}>
                You have not recorded your symptoms yet for <strong>Cycle Day {todayCycleMetrics.cycleDay}</strong> ({todayKey}). Regular check-ins take under a minute and build your consultation report.
              </p>

              <Link
                to="/checkin"
                className="btn btn-primary"
                style={{ fontSize: '0.9rem', padding: '0.6rem 1.4rem', boxShadow: '0 2px 6px rgba(129, 39, 70, 0.25)' }}
              >
                <CalendarCheck size={16} />
                <span>Start Today's Check-in</span>
              </Link>
            </div>

            {/* Quick 15-second toggleable inline capture */}
            <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowQuickForm(!showQuickForm)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-berry)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  margin: '0 auto'
                }}
              >
                <span>{showQuickForm ? '▲ Hide Quick Snapshot Form' : '▼ Or Record a 15-Second Snapshot Here'}</span>
              </button>

              {showQuickForm && (
                <form onSubmit={handleQuickSubmit} style={{ marginTop: '0.85rem' }}>
                  {/* Flow buttons */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                      Bleeding Flow Level
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.3rem' }}>
                      {['None', 'Spotting', 'Light', 'Medium', 'Heavy'].map((flow) => (
                        <button
                          type="button"
                          key={flow}
                          onClick={() => setQuickBleeding(flow)}
                          style={{
                            padding: '0.35rem 0.2rem',
                            fontSize: '0.72rem',
                            borderRadius: '6px',
                            backgroundColor: quickBleeding === flow ? 'var(--color-berry)' : 'var(--bg-secondary)',
                            color: quickBleeding === flow ? '#FFFFFF' : 'var(--text-primary)',
                            border: '1px solid var(--border-card)',
                            cursor: 'pointer'
                          }}
                        >
                          {flow}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pain slider */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Pain Severity
                      </label>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: quickPain >= 7 ? 'var(--color-terracotta)' : 'var(--color-berry)' }}>
                        {quickPain}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={quickPain}
                      onChange={(e) => setQuickPain(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--color-berry)' }}
                    />
                  </div>

                  {/* Energy & Mood */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                        Vitality ({quickEnergy}/5)
                      </label>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            type="button"
                            key={n}
                            onClick={() => setQuickEnergy(n)}
                            style={{
                              flex: 1,
                              padding: '0.2rem 0',
                              fontSize: '0.72rem',
                              borderRadius: '4px',
                              backgroundColor: quickEnergy === n ? 'var(--color-berry)' : 'var(--bg-secondary)',
                              color: quickEnergy === n ? '#FFFFFF' : 'var(--text-primary)',
                              border: '1px solid var(--border-card)',
                              cursor: 'pointer'
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                        Mood ({quickMood}/5)
                      </label>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            type="button"
                            key={n}
                            onClick={() => setQuickMood(n)}
                            style={{
                              flex: 1,
                              padding: '0.2rem 0',
                              fontSize: '0.72rem',
                              borderRadius: '4px',
                              backgroundColor: quickMood === n ? 'var(--color-berry)' : 'var(--bg-secondary)',
                              color: quickMood === n ? '#FFFFFF' : 'var(--text-primary)',
                              border: '1px solid var(--border-card)',
                              cursor: 'pointer'
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingEntry}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem 1rem' }}
                  >
                    <span>Save Snapshot to Diary</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Connected to Daily Check-in store
            </span>
            <Link to="/checkin" style={{ fontSize: '0.8rem', color: 'var(--color-berry)', fontWeight: 600 }}>
              Full Diary Form →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
