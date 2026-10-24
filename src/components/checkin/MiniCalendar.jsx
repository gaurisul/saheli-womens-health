import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../../data/sampleProfiles';

export default function MiniCalendar({ selectedDate, onSelectDate, logs = {} }) {
  const currentDate = new Date(selectedDate || new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    onSelectDate(formatDate(prev));
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    onSelectDate(formatDate(next));
  };

  return (
    <div 
      className="saheli-card"
      style={{
        padding: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <CalendarIcon size={16} color="var(--color-berry)" />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {monthNames[month]} {year}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button 
            type="button" 
            onClick={handlePrevMonth} 
            aria-label="Previous month"
            style={{ padding: '0.35rem', borderRadius: '6px', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            type="button" 
            onClick={handleNextMonth} 
            aria-label="Next month"
            style={{ padding: '0.35rem', borderRadius: '6px', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '0.35rem' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {d}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const logForDay = logs[dateStr];
          const hasBleeding = logForDay && logForDay.bleeding && logForDay.bleeding !== 'None';
          const hasHighPain = logForDay && (Number(logForDay.painScore) || 0) >= 6;
          const hasImpact = logForDay && logForDay.functionalImpact;

          return (
            <button
              type="button"
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              aria-label={`Select date ${dateStr}${logForDay ? ', log entry recorded' : ''}`}
              style={{
                aspectRatio: '1',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                fontSize: '0.8rem',
                fontWeight: isSelected ? 700 : logForDay ? 600 : 400,
                backgroundColor: isSelected 
                  ? 'var(--color-berry)' 
                  : logForDay 
                    ? 'var(--color-berry-subtle)' 
                    : 'transparent',
                color: isSelected 
                  ? '#FFFFFF' 
                  : logForDay 
                    ? 'var(--color-berry)' 
                    : 'var(--text-primary)',
                border: isSelected ? '1px solid var(--color-berry)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{dayNum}</span>

              {/* Status indicators */}
              {logForDay && (
                <div style={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '3px' }}>
                  {hasBleeding && (
                    <span 
                      title="Bleeding flow logged"
                      style={{ 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        backgroundColor: isSelected ? '#FFFFFF' : 'var(--color-berry)' 
                      }} 
                    />
                  )}
                  {hasHighPain && (
                    <span 
                      title="Moderate/Severe pain logged"
                      style={{ 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        backgroundColor: isSelected ? '#FCA5A5' : 'var(--color-terracotta)' 
                      }} 
                    />
                  )}
                  {hasImpact && (
                    <span 
                      title="Functional impact logged"
                      style={{ 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        backgroundColor: isSelected ? '#FED7AA' : 'var(--color-amber)' 
                      }} 
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-card)', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-berry)' }} />
          Flow recorded
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-terracotta)' }} />
          Pain ≥ 6
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-amber)' }} />
          Functional impact
        </span>
      </div>
    </div>
  );
}
