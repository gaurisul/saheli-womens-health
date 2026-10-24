import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Edit3, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function QuickCheckinCard() {
  const { todayEntry, todayKey, currentProfile, saveEntry } = useApp();

  // Quick state if user wants to log right here
  const [quickBleeding, setQuickBleeding] = useState('None');
  const [quickPain, setQuickPain] = useState(0);
  const [quickEnergy, setQuickEnergy] = useState(3);
  const [quickMood, setQuickMood] = useState(3);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    saveEntry({
      date: todayKey,
      cycleDay: currentProfile.currentCycleDay || 14,
      bleeding: quickBleeding,
      painScore: quickPain,
      energyRating: quickEnergy,
      moodRating: quickMood,
      symptoms: quickPain > 0 ? ['Lower abdominal discomfort'] : ['Calm & centered'],
      functionalImpact: quickPain >= 6,
      impactTypes: quickPain >= 6 ? ['Reduced activity'] : [],
      notes: 'Quick check-in logged from dashboard.'
    });
  };

  return (
    <div className="saheli-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header-row">
        <div className="card-title">
          <CalendarCheck size={18} color="var(--color-berry)" />
          <span>Daily Check-in</span>
        </div>
        <span className={`badge ${todayEntry ? 'badge-sage' : 'badge-amber'}`}>
          {todayEntry ? 'Logged for Today' : 'Pending Entry'}
        </span>
      </div>

      {todayEntry ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-sage)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.85rem' }}>
              <CheckCircle size={16} />
              <span>Today's diary entry recorded</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Flow
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-berry)', marginTop: '0.15rem' }}>
                  {todayEntry.bleeding || 'None'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Pain Severity
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: (todayEntry.painScore || 0) >= 7 ? 'var(--color-terracotta)' : 'var(--color-berry)', marginTop: '0.15rem' }}>
                  {todayEntry.painScore || 0} / 10
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Energy
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {todayEntry.energyRating ? `${todayEntry.energyRating} / 5` : 'Not rated'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Mood
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {todayEntry.moodRating ? `${todayEntry.moodRating} / 5` : 'Not rated'}
                </div>
              </div>
            </div>

            {todayEntry.symptoms && todayEntry.symptoms.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Logged Symptoms ({todayEntry.symptoms.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {todayEntry.symptoms.map((s, idx) => (
                    <span key={idx} className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {todayEntry.notes && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
                "{todayEntry.notes}"
              </div>
            )}
          </div>

          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/checkin" className="btn btn-blush" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
              <Edit3 size={14} />
              <span>Edit Full Entry</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleQuickSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              How is your body feeling on Cycle Day {currentProfile.currentCycleDay}?
            </p>

            {/* Bleeding quick select */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Bleeding
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.3rem', marginTop: '0.3rem' }}>
                {['None', 'Spotting', 'Light', 'Medium', 'Heavy'].map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setQuickBleeding(level)}
                    style={{
                      padding: '0.35rem 0.2rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      backgroundColor: quickBleeding === level ? 'var(--color-berry)' : 'var(--bg-secondary)',
                      color: quickBleeding === level ? '#FFFFFF' : 'var(--text-secondary)',
                      border: '1px solid var(--border-card)'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Pain quick slider */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                <span>PAIN INTENSITY</span>
                <span style={{ color: quickPain >= 7 ? 'var(--color-terracotta)' : 'var(--color-berry)' }}>
                  {quickPain} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={quickPain}
                onChange={(e) => setQuickPain(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-berry)', marginTop: '0.3rem', cursor: 'pointer' }}
              />
            </div>

            {/* Energy and Mood ratings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>ENERGY (1-5)</label>
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.2rem' }}>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setQuickEnergy(lvl)}
                      style={{
                        flex: 1,
                        padding: '0.25rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        backgroundColor: quickEnergy === lvl ? 'var(--color-berry)' : 'var(--bg-secondary)',
                        color: quickEnergy === lvl ? '#fff' : 'var(--text-secondary)'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>MOOD (1-5)</label>
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.2rem' }}>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setQuickMood(lvl)}
                      style={{
                        flex: 1,
                        padding: '0.25rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        backgroundColor: quickMood === lvl ? 'var(--color-berry)' : 'var(--bg-secondary)',
                        color: quickMood === lvl ? '#fff' : 'var(--text-secondary)'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-card)' }}>
            <Link to="/checkin" style={{ fontSize: '0.8rem', color: 'var(--color-berry)', fontWeight: 500 }}>
              Full check-in options →
            </Link>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
              Save Today's Log
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
