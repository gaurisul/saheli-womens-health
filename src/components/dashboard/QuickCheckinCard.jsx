import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Edit3, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function QuickCheckinCard() {
  const { todayEntry, todayKey, currentProfile, saveEntry, isSavingEntry, todayCycleMetrics } = useApp();

  const [quickBleeding, setQuickBleeding] = useState('None');
  const [quickPain, setQuickPain] = useState(0);
  const [quickEnergy, setQuickEnergy] = useState(3);
  const [quickMood, setQuickMood] = useState(3);

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
        <span className={`badge ${todayEntry ? 'badge-sage' : 'badge-amber'}`}>
          {todayEntry ? 'Recorded' : 'Pending Entry'}
        </span>
      </div>

      {todayEntry ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-sage-dark)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.85rem' }}>
              <CheckCircle2 size={16} color="var(--color-sage)" />
              <span>Symptoms recorded for today ({todayKey})</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Flow
                </span>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-berry)', marginTop: '0.15rem' }}>
                  {todayEntry.bleeding || 'None'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Pain Severity
                </span>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: Number(todayEntry.painScore) >= 7 ? 'var(--color-terracotta)' : 'var(--color-berry)', marginTop: '0.15rem' }}>
                  {todayEntry.painScore ?? 0} / 10
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Vitality
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

            {todayEntry.symptoms && todayEntry.symptoms.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Logged Symptoms ({todayEntry.symptoms.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {todayEntry.symptoms.slice(0, 4).map((s, idx) => (
                    <span key={idx} className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                      {s}
                    </span>
                  ))}
                  {todayEntry.symptoms.length > 4 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                      +{todayEntry.symptoms.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Updated {new Date(todayEntry.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <Link to="/checkin" className="btn btn-blush" style={{ fontSize: '0.82rem', padding: '0.4rem 0.95rem' }}>
              <Edit3 size={14} />
              <span>Edit Details</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleQuickSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.45 }}>
              How is your body feeling on <strong>Cycle Day {todayCycleMetrics.cycleDay}</strong>? Log a fast 30-second snapshot:
            </p>

            {/* Quick Flow */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Flow Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.3rem' }}>
                {['None', 'Spotting', 'Light', 'Medium', 'Heavy'].map((flow) => (
                  <button
                    type="button"
                    key={flow}
                    onClick={() => setQuickBleeding(flow)}
                    style={{
                      padding: '0.35rem 0.2rem',
                      fontSize: '0.75rem',
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

            {/* Quick Pain */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
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

            {/* Quick Vitality & Mood Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  Vitality ({quickEnergy}/5)
                </label>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setQuickEnergy(n)}
                      style={{
                        flex: 1,
                        padding: '0.25rem 0',
                        fontSize: '0.74rem',
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
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  Mood ({quickMood}/5)
                </label>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setQuickMood(n)}
                      style={{
                        flex: 1,
                        padding: '0.25rem 0',
                        fontSize: '0.74rem',
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
          </div>

          <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/checkin" style={{ fontSize: '0.8rem', color: 'var(--color-berry)', fontWeight: 600 }}>
              Full Check-in Form →
            </Link>
            <button
              type="submit"
              disabled={isSavingEntry}
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
            >
              <span>Record Snapshot</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
