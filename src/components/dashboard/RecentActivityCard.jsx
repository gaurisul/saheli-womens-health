import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Helper to format friendly relative date label
function formatFriendlyDate(dateStr, todayKey) {
  if (!dateStr) return '';
  if (dateStr === todayKey) return 'Today';
  
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const [ty, tm, td] = todayKey.split('-').map(Number);
    const todayObj = new Date(ty, tm - 1, td);
    const diffDays = Math.round((todayObj - dateObj) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
    
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function RecentActivityCard() {
  const { logs, todayKey } = useApp();

  const recentEntries = useMemo(() => {
    const dates = Object.keys(logs || {}).sort().reverse();
    return dates.slice(0, 4).map((d) => ({
      date: d,
      ...logs[d]
    }));
  }, [logs]);

  const hasEntries = recentEntries.length > 0;

  return (
    <div className="saheli-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header-row">
        <div className="card-title">
          <Clock size={18} color="var(--color-berry)" />
          <span>Recent Activity</span>
        </div>
        <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
          {hasEntries ? `${Object.keys(logs).length} Logged ${Object.keys(logs).length === 1 ? 'Day' : 'Days'}` : 'No Entries'}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {!hasEntries ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-berry-subtle)',
                color: 'var(--color-berry)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem'
              }}
            >
              <Activity size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              No Recent Activity Recorded
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '320px', margin: '0 auto 1.25rem' }}>
              Your latest symptom check-ins, pain patterns, and cycle notes will appear here in chronological order.
            </p>
            <Link to="/checkin" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
              Record First Entry
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {recentEntries.map((entry) => {
              const friendlyDate = formatFriendlyDate(entry.date, todayKey);
              const painNum = Number(entry.painScore) || 0;
              const hasBleeding = entry.bleeding && entry.bleeding !== 'None';

              return (
                <div
                  key={entry.date}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '10px',
                    padding: '0.75rem 0.95rem',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {friendlyDate}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ({entry.date})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {entry.cycleDay && (
                        <span className="badge badge-berry" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                          Day {entry.cycleDay}
                        </span>
                      )}
                      {hasBleeding && (
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.68rem',
                            padding: '0.15rem 0.45rem',
                            backgroundColor: 'var(--color-berry-subtle)',
                            color: 'var(--color-berry)',
                            border: '1px solid var(--color-blush-border)'
                          }}
                        >
                          Flow: {entry.bleeding}
                        </span>
                      )}
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.15rem 0.45rem',
                          backgroundColor: painNum >= 7 ? 'rgba(194, 94, 72, 0.12)' : 'var(--bg-card)',
                          color: painNum >= 7 ? 'var(--color-terracotta)' : painNum > 0 ? 'var(--color-berry)' : 'var(--text-muted)',
                          border: '1px solid var(--border-card)',
                          fontWeight: 600
                        }}
                      >
                        Pain {painNum}/10
                      </span>
                    </div>
                  </div>

                  {/* Symptoms and impact */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem', fontSize: '0.78rem' }}>
                    <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                      {Array.isArray(entry.symptoms) && entry.symptoms.length > 0 ? (
                        <span>{entry.symptoms.slice(0, 3).join(', ')}{entry.symptoms.length > 3 ? ` +${entry.symptoms.length - 3}` : ''}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No specific symptoms noted</span>
                      )}
                    </div>

                    {entry.functionalImpact && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-terracotta)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <AlertCircle size={12} />
                        <span>Functional disruption</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link to="/calendar" style={{ fontSize: '0.8rem', color: 'var(--color-berry)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>View Cycle Calendar</span>
            <ArrowRight size={13} />
          </Link>
          <Link to="/checkin" className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}>
            Daily Check-in
          </Link>
        </div>
      </div>
    </div>
  );
}
