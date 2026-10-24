import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function CycleWheel({ cycleDay = 14, totalCycleLength = 29, currentPhase = 'Ovulatory Window' }) {
  const { currentProfile } = useApp();
  const [hoveredPhase, setHoveredPhase] = useState(null);

  // SVG parameters
  const size = 260;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Phase Definitions for a standard or personalized cycle length
  const periodLength = currentProfile.typicalPeriodLength || 5;
  const ovulationDay = Math.round(totalCycleLength - 14); // e.g. Day 15 in 29-day cycle
  const fertileStart = Math.max(periodLength + 1, ovulationDay - 3);
  const fertileEnd = Math.min(totalCycleLength - 1, ovulationDay + 1);

  // Phase slices
  const phases = [
    {
      name: 'Menstrual Phase',
      startDay: 1,
      endDay: periodLength,
      color: '#6B1D3A', // Berry
      description: 'Uterine lining shedding. Estrogen and progesterone are at baseline levels.'
    },
    {
      name: 'Follicular Phase',
      startDay: periodLength + 1,
      endDay: fertileStart - 1,
      color: '#E4B5C6', // Blush Pink
      description: 'FSH stimulates follicular development; rising estrogen builds endometrium.'
    },
    {
      name: 'Ovulatory Window',
      startDay: fertileStart,
      endDay: fertileEnd,
      color: '#4E6E58', // Sage green
      description: 'LH surge triggers egg release. Highest fertility and potential mid-cycle ovulation twinges.'
    },
    {
      name: 'Luteal Phase',
      startDay: fertileEnd + 1,
      endDay: totalCycleLength,
      color: '#C25E48', // Soft Terracotta
      description: 'Corpus luteum produces progesterone. Pre-menstrual symptom vulnerability.'
    }
  ];

  // Calculate indicator position on the circle (in degrees, 0 at top = -90 deg in SVG)
  const clampedDay = Math.min(Math.max(cycleDay, 1), totalCycleLength);
  const fraction = (clampedDay - 0.5) / totalCycleLength;
  const angleDeg = fraction * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  const indicatorX = center + radius * Math.cos(angleRad);
  const indicatorY = center + radius * Math.sin(angleRad);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Base Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--bg-secondary)"
            strokeWidth={strokeWidth}
          />

          {/* Phase Arcs */}
          {phases.map((p) => {
            const startFrac = (p.startDay - 1) / totalCycleLength;
            const endFrac = p.endDay / totalCycleLength;
            const sliceFrac = endFrac - startFrac;
            const strokeDash = `${sliceFrac * circumference} ${circumference}`;
            const strokeOffset = -startFrac * circumference;

            return (
              <circle
                key={p.name}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={p.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${center} ${center})`}
                style={{
                  transition: 'opacity 0.2s ease',
                  opacity: hoveredPhase && hoveredPhase !== p.name ? 0.35 : 0.9,
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredPhase(p.name)}
                onMouseLeave={() => setHoveredPhase(null)}
              />
            );
          })}

          {/* Current Day Pointer Dot */}
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r={11}
            fill="#FFFFFF"
            stroke="var(--color-berry)"
            strokeWidth={3.5}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(107, 29, 58, 0.35))' }}
          />
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r={4}
            fill="var(--color-berry)"
          />
        </svg>

        {/* Center Content */}
        <div
          style={{
            position: 'absolute',
            inset: strokeWidth * 1.5,
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '1rem',
            background: 'radial-gradient(circle, #FFFFFF 60%, var(--bg-primary) 100%)',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Current Cycle
          </span>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 600, color: 'var(--color-berry)', lineHeight: 1.05 }}>
            Day {cycleDay}
          </div>
          <span className="badge badge-berry" style={{ marginTop: '0.35rem', fontSize: '0.72rem' }}>
            {currentPhase}
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Cycle length: ~{totalCycleLength} days
          </span>
        </div>
      </div>

      {/* Phase interactive pills below wheel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '1.25rem', width: '100%' }}>
        {phases.map((p) => {
          const isCurrent = currentPhase.toLowerCase().includes(p.name.split(' ')[0].toLowerCase());
          return (
            <div
              key={p.name}
              onMouseEnter={() => setHoveredPhase(p.name)}
              onMouseLeave={() => setHoveredPhase(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.65rem',
                borderRadius: '8px',
                backgroundColor: isCurrent ? 'var(--color-berry-subtle)' : 'var(--bg-secondary)',
                border: isCurrent ? '1px solid var(--color-blush-border)' : '1px solid var(--border-card)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={p.description}
            >
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: p.color,
                  flexShrink: 0
                }}
              />
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Days {p.startDay}–{p.endDay}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
