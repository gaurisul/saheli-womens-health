import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Clock,
  Filter,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { findPeriodStarts, getDaysDiff } from '../utils/cycleCalculations';

export default function CycleCalendarPage() {
  const { logs, currentProfile } = useApp();
  const navigate = useNavigate();

  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayLog, setSelectedDayLog] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'bleeding', 'pain', 'impact'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to get log for a day in current calendar view
  const getLogForDay = (dayNum) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return { dateStr, log: logs[dateStr] };
  };

  // Filter check
  const passesFilter = (log) => {
    if (!log) return filterMode === 'all';
    if (filterMode === 'all') return true;
    if (filterMode === 'bleeding') return log.bleeding && log.bleeding !== 'None';
    if (filterMode === 'pain') return (log.painScore || 0) >= 6;
    if (filterMode === 'impact') return log.functionalImpact === true;
    return true;
  };

  // Task 4: Derive historical cycles from logged period starts
  const cycleHistory = useMemo(() => {
    const periodStarts = findPeriodStarts(logs);
    const sortedDates = Object.keys(logs).sort();

    if (sortedDates.length === 0) {
      return {
        cycles: [],
        hasData: false,
        note: 'No symptom records found in diary. Log check-ins to track cycle history.'
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

    // 1. Current Cycle (from latest period start to latest logged date)
    const latestStart = periodStarts[periodStarts.length - 1];
    const latestLogDate = sortedDates[sortedDates.length - 1];
    const currentDurationDays = getDaysDiff(latestStart, latestLogDate) + 1;

    // Entries in current cycle: date >= latestStart
    const currentCycleEntries = Object.entries(logs)
      .filter(([d]) => d >= latestStart)
      .map(([d, data]) => ({ date: d, ...data }));

    const currentBleeding = currentCycleEntries.filter((e) => e.bleeding && e.bleeding !== 'None');
    const currentScores = currentCycleEntries
      .map((e) => Number(e.painScore))
      .filter((s) => !isNaN(s) && s > 0);
    const currentPeakPain = currentScores.length > 0 ? Math.max(...currentScores) : null;
    const currentImpact = currentCycleEntries.filter((e) => e.functionalImpact === true);

    let currentPattern = 'In progress';
    if (currentPeakPain && currentPeakPain >= 7) currentPattern = 'Severe pain (≥7)';
    else if (currentBleeding.filter((e) => e.bleeding === 'Heavy').length >= 3) currentPattern = 'Heavy flow';

    cycles.push({
      name: 'Current Cycle (Active)',
      isCurrent: true,
      isComplete: false,
      startDate: latestStart,
      endDate: null,
      durationLabel: `Day ${currentDurationDays} (Ongoing, est. ~${typicalLength}d)`,
      bleedingDaysCount: currentBleeding.length,
      peakPain: currentPeakPain !== null ? `${currentPeakPain} / 10` : 'None logged',
      impactDaysCount: currentImpact.length,
      patternFlag: currentPattern,
      badgeType: currentPeakPain && currentPeakPain >= 7 ? 'badge-terracotta' : 'badge-berry'
    });

    // 2. Preceding Completed Cycles: between periodStarts[i] and periodStarts[i+1]
    for (let i = periodStarts.length - 2; i >= 0; i--) {
      const start = periodStarts[i];
      const nextStart = periodStarts[i + 1];
      const cycleDuration = getDaysDiff(start, nextStart);

      const cycleEntries = Object.entries(logs)
        .filter(([d]) => d >= start && d < nextStart)
        .map(([d, data]) => ({ date: d, ...data }));

      const cBleeding = cycleEntries.filter((e) => e.bleeding && e.bleeding !== 'None');
      const cScores = cycleEntries
        .map((e) => Number(e.painScore))
        .filter((s) => !isNaN(s) && s > 0);
      const cPeakPain = cScores.length > 0 ? Math.max(...cScores) : null;
      const cImpact = cycleEntries.filter((e) => e.functionalImpact === true);

      let flag = 'Typical variation';
      let badge = 'badge-sage';
      if (cPeakPain && cPeakPain >= 7) {
        flag = 'Severe pain (≥7)';
        badge = 'badge-terracotta';
      } else if (cBleeding.filter((e) => e.bleeding === 'Heavy').length >= 3) {
        flag = 'Heavy flow';
        badge = 'badge-amber';
      } else if (cycleDuration > typicalLength + 7) {
        flag = 'Extended cycle';
        badge = 'badge-amber';
      }

      const cycleIndex = periodStarts.length - 1 - i;
      cycles.push({
        name: `Preceding Cycle (-${cycleIndex})`,
        isCurrent: false,
        isComplete: true,
        startDate: start,
        endDate: nextStart,
        durationLabel: `${cycleDuration} days (Complete)`,
        bleedingDaysCount: cBleeding.length,
        peakPain: cPeakPain !== null ? `${cPeakPain} / 10` : 'None logged',
        impactDaysCount: cImpact.length,
        patternFlag: flag,
        badgeType: badge
      });
    }

    return {
      cycles,
      hasData: true,
      note: periodStarts.length === 1
        ? 'Only 1 cycle start recorded so far. Preceding cycle durations will be calculated when additional period starts are logged.'
        : null
    };
  }, [logs, currentProfile.typicalCycleLength]);

  // Filter summary counts for calendar pills
  const loggedEntries = useMemo(() => Object.values(logs), [logs]);
  const bleedingDays = useMemo(() => loggedEntries.filter((e) => e.bleeding && e.bleeding !== 'None'), [loggedEntries]);
  const highPainDays = useMemo(() => loggedEntries.filter((e) => (e.painScore || 0) >= 6), [loggedEntries]);
  const impactedDays = useMemo(() => loggedEntries.filter((e) => e.functionalImpact === true), [loggedEntries]);

  // Pain color helper
  const getPainDotColor = (score) => {
    if (!score || score === 0) return null;
    if (score <= 3) return 'var(--color-sage)';
    if (score <= 6) return 'var(--color-amber)';
    if (score <= 8) return 'var(--color-terracotta)';
    return '#B91C1C';
  };

  return (
    <div className="page-content-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                Longitudinal Cycle Map
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentProfile.name}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw + 0.3rem, 2.2rem)', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
              Cycle Calendar & History
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Inspect cycle regularity, bleeding duration, and symptom distribution across months.
            </p>
          </div>

          {/* Quick stats pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '0.5rem 0.85rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cycle Interval</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-berry)' }}>~{currentProfile.typicalCycleLength || 29} days</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '0.5rem 0.85rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Period Length</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-berry)' }}>~{currentProfile.typicalPeriodLength || 5} days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-card)', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--color-berry)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Filter Days:</span>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Days' },
              { id: 'bleeding', label: `Flow Recorded (${bleedingDays.length})` },
              { id: 'pain', label: `High Pain ≥6 (${highPainDays.length})` },
              { id: 'impact', label: `Functional Impact (${impactedDays.length})` }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterMode(f.id)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: filterMode === f.id ? 'var(--color-berry)' : 'var(--bg-secondary)',
                  color: filterMode === f.id ? '#FFFFFF' : 'var(--text-secondary)',
                  border: filterMode === f.id ? '1px solid var(--color-berry)' : '1px solid var(--border-card)'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-berry)' }} />
            Menstrual Flow
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-terracotta)' }} />
            High Pain (≥6)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-sage)' }} />
            Mild / Clear
          </span>
        </div>
      </div>

      <style>{`
        .calendar-cell-box {
          min-height: 80px;
          border-radius: 10px;
          padding: 0.5rem;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        @media (max-width: 600px) {
          .calendar-cell-box {
            min-height: 46px !important;
            padding: 0.25rem 0.2rem !important;
            border-radius: 6px !important;
          }
          .calendar-grid-days {
            gap: 4px !important;
          }
        }
      `}</style>

      {/* Two Column Layout: Full Monthly Calendar + Day Inspection Drawer */}
      <div className={selectedDayLog ? "calendar-layout-grid" : ""}>

        {/* Full Interactive Calendar Card */}
        <div className="saheli-card" style={{ padding: '1.75rem' }}>

          {/* Calendar Header with Month Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-berry-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-berry)'
              }}>
                <CalendarIcon size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.45rem', color: 'var(--text-primary)' }}>
                  {monthNames[month]} {year}
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Click any date to inspect details or log symptoms
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.75rem' }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.75rem' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '0.5rem' }}>
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
              <div key={d} style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.35rem' }}>
                {d.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="calendar-grid-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-cell-${i}`} className="calendar-cell-box" style={{ opacity: 0.2, backgroundColor: 'transparent' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const { dateStr, log } = getLogForDay(dayNum);
              const matchesFilter = passesFilter(log);
              const isSelected = selectedDayLog && selectedDayLog.dateStr === dateStr;
              const hasBleeding = log && log.bleeding && log.bleeding !== 'None';
              const painColor = log ? getPainDotColor(log.painScore) : null;

              return (
                <div
                  key={dateStr}
                  className="calendar-cell-box"
                  onClick={() => setSelectedDayLog({ dateStr, log, dayNum })}
                  style={{
                    minHeight: '85px',
                    borderRadius: '12px',
                    padding: '0.6rem',
                    backgroundColor: isSelected
                      ? 'var(--color-blush)'
                      : log
                        ? 'var(--bg-secondary)'
                        : 'var(--bg-card)',
                    border: isSelected
                      ? '2px solid var(--color-berry)'
                      : '1px solid var(--border-card)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    opacity: matchesFilter ? 1 : 0.25,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 4px 12px var(--color-berry-glow)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-card)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: log ? 700 : 500, color: log ? 'var(--color-berry)' : 'var(--text-primary)' }}>
                      {dayNum}
                    </span>
                    {log && log.cycleDay && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        CD {log.cycleDay}
                      </span>
                    )}
                  </div>

                  {log ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '0.35rem' }}>
                      {hasBleeding && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', color: 'var(--color-berry)', fontWeight: 600 }}>
                          <Droplet size={11} fill="var(--color-berry)" />
                          <span>{log.bleeding}</span>
                        </div>
                      )}

                      {log.painScore > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: painColor, fontWeight: 600 }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: painColor }} />
                          <span>Pain {log.painScore}/10</span>
                        </div>
                      )}

                      {log.functionalImpact && (
                        <div style={{ fontSize: '0.62rem', color: '#B91C1C', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          ⚠️ Incapacitated
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '0.5rem' }}>
                      —
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail Drawer */}
        {selectedDayLog && (
          <div className="saheli-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-berry)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
                  {selectedDayLog.log?.cycleDay ? `Cycle Day ${selectedDayLog.log.cycleDay}` : 'Diary Inspection'}
                </span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>
                  {selectedDayLog.dateStr}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayLog(null)}
                aria-label="Close drawer"
                style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}
              >
                ✕
              </button>
            </div>

            {selectedDayLog.log ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Flow</span>
                    <div style={{ fontWeight: 600, color: 'var(--color-berry)', fontSize: '0.95rem' }}>
                      {selectedDayLog.log.bleeding || 'None'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pain Severity</span>
                    <div style={{ fontWeight: 600, color: (selectedDayLog.log.painScore || 0) >= 7 ? 'var(--color-terracotta)' : 'var(--color-berry)', fontSize: '0.95rem' }}>
                      {selectedDayLog.log.painScore || 0} / 10
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Energy</span>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {selectedDayLog.log.energyRating ? `${selectedDayLog.log.energyRating} / 5` : 'N/A'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mood</span>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {selectedDayLog.log.moodRating ? `${selectedDayLog.log.moodRating} / 5` : 'N/A'}
                    </div>
                  </div>
                </div>

                {selectedDayLog.log.functionalImpact && (
                  <div style={{ backgroundColor: '#FCF1EE', border: '1px solid #E8ACA0', borderRadius: '8px', padding: '0.65rem', fontSize: '0.78rem', color: '#9C4532' }}>
                    <strong>Functional Impact:</strong> Yes
                    {selectedDayLog.log.impactTypes?.length > 0 && (
                      <div style={{ marginTop: '0.25rem' }}>
                        {selectedDayLog.log.impactTypes.join(' · ')}
                      </div>
                    )}
                  </div>
                )}

                {selectedDayLog.log.symptoms?.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Logged Symptoms:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                      {selectedDayLog.log.symptoms.map((s, idx) => (
                        <span key={idx} className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDayLog.log.notes && (
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-card)', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    "{selectedDayLog.log.notes}"
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.82rem' }}
                    onClick={() => navigate(selectedDayLog?.dateStr ? `/checkin?date=${selectedDayLog.dateStr}` : '/checkin')}
                  >
                    Edit This Day
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  No symptoms or diary entries were recorded for this date.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.84rem' }}
                  onClick={() => navigate(selectedDayLog?.dateStr ? `/checkin?date=${selectedDayLog.dateStr}` : '/checkin')}
                >
                  <PlusCircle size={15} />
                  <span>Log Symptoms for this Date</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Historical Cycles Summary Table */}
      <div className="saheli-card" style={{ marginTop: '2rem' }}>
        <div className="card-header-row">
          <div className="card-title">
            <Clock size={18} color="var(--color-berry)" />
            <span>Cycle Regularity History & Variance</span>
          </div>
          <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
            Multi-cycle review
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-card)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Cycle</th>
                <th style={{ padding: '0.75rem 1rem' }}>Cycle Duration</th>
                <th style={{ padding: '0.75rem 1rem' }}>Bleeding Days</th>
                <th style={{ padding: '0.75rem 1rem' }}>Peak Pain Score</th>
                <th style={{ padding: '0.75rem 1rem' }}>Incapacitated Days</th>
                <th style={{ padding: '0.75rem 1rem' }}>Pattern Flags</th>
              </tr>
            </thead>
            <tbody>
              {!cycleHistory.hasData ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {cycleHistory.note}
                  </td>
                </tr>
              ) : (
                cycleHistory.cycles.map((cycle, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < cycleHistory.cycles.length - 1 ? '1px solid var(--border-card)' : 'none' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: cycle.isCurrent ? 'var(--color-berry)' : 'var(--text-primary)' }}>
                      {cycle.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {cycle.durationLabel}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {cycle.bleedingDaysCount} days recorded
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ color: cycle.peakPain.includes('8') || cycle.peakPain.includes('9') || cycle.peakPain.includes('10') || cycle.peakPain.includes('7') ? 'var(--color-terracotta)' : 'var(--text-primary)' }}>
                        {cycle.peakPain}
                      </strong>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {cycle.impactDaysCount} days
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${cycle.badgeType}`} style={{ fontSize: '0.7rem' }}>
                        {cycle.patternFlag}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {cycleHistory.note && cycleHistory.hasData && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0.85rem 1rem', borderTop: '1px solid var(--border-card)', backgroundColor: 'var(--bg-secondary)' }}>
              ℹ️ {cycleHistory.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
