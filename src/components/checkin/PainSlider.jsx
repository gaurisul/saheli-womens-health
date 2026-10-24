import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function PainSlider({ value, onChange }) {
  const getDescriptor = (score) => {
    if (score === 0) return { text: '0 — No pain / Comfortable', severity: 'none', color: 'var(--color-sage)' };
    if (score <= 3) return { text: `${score} — Mild cramping or dull discomfort`, severity: 'mild', color: 'var(--color-sage)' };
    if (score <= 6) return { text: `${score} — Moderate pain, noticeable during daily activities`, severity: 'moderate', color: 'var(--color-amber)' };
    if (score <= 8) return { text: `${score} — Severe pain, limits activities or requires bed rest / prescription drugs`, severity: 'severe', color: 'var(--color-terracotta)' };
    return { text: `${score} — Debilitating / Emergency level pain (consider Urgent Care)`, severity: 'critical', color: '#B91C1C' };
  };

  const descriptor = getDescriptor(value);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Pain Severity Scale (0 to 10)
        </label>
        <span 
          style={{ 
            fontSize: '0.82rem', 
            fontWeight: 700, 
            color: descriptor.color,
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-card)'
          }}
        >
          {descriptor.text.split(' — ')[0]}
        </span>
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
        {descriptor.text.split(' — ')[1]}
      </div>

      {/* Number pills 0 through 10 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: '0.25rem', marginBottom: '0.75rem' }}>
        {Array.from({ length: 11 }).map((_, num) => {
          const isSelected = value === num;
          const isHigh = num >= 7;
          return (
            <button
              type="button"
              key={num}
              onClick={() => onChange(num)}
              style={{
                height: '38px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected 
                  ? (isHigh ? 'var(--color-terracotta)' : 'var(--color-berry)') 
                  : 'var(--bg-secondary)',
                color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                border: isSelected ? '2px solid transparent' : '1px solid var(--border-card)',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Smooth slider */}
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: value >= 7 ? 'var(--color-terracotta)' : 'var(--color-berry)',
          cursor: 'pointer'
        }}
      />

      {value >= 9 && (
        <div style={{ 
          marginTop: '0.65rem', 
          backgroundColor: '#FCF1EE', 
          border: '1px solid #E8ACA0', 
          borderRadius: '8px', 
          padding: '0.6rem 0.85rem',
          fontSize: '0.78rem',
          color: '#9C4532',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <AlertCircle size={15} />
          <span>Severe pain (score {value}) logged. If accompanied by fever, vomiting, or dizziness, seek urgent medical evaluation.</span>
        </div>
      )}
    </div>
  );
}
