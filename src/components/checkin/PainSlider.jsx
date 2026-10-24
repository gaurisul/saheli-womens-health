import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function PainSlider({ value = 0, onChange, disabled = false }) {
  const getDescriptor = (score) => {
    if (score === 0) return { 
      category: 'No Pain',
      desc: 'Comfortable; zero discomfort or cramps.', 
      color: 'var(--color-sage-dark)',
      bg: 'var(--color-sage-light)'
    };
    if (score <= 3) return { 
      category: 'Mild Discomfort',
      desc: 'Noticeable dull ache or light cramping; does not hinder normal daily focus.', 
      color: 'var(--color-sage-dark)',
      bg: 'var(--color-sage-light)'
    };
    if (score <= 6) return { 
      category: 'Moderate Pain',
      desc: 'Intrusive aching or cramps; interferes with concentration or requires heating pads / OTC relief.', 
      color: 'var(--color-amber-dark)',
      bg: 'var(--color-amber-light)'
    };
    if (score <= 8) return { 
      category: 'Severe Pain',
      desc: 'Disruptive cyclic pain; limits daily routine, causes missed commitments or requires bed rest.', 
      color: 'var(--color-terracotta-dark)',
      bg: 'var(--color-terracotta-light)'
    };
    return { 
      category: 'Debilitating / Emergency',
      desc: 'Extreme, incapacitating pain. If acute or accompanied by fever/vomiting, seek prompt medical triage.', 
      color: 'var(--color-critical)',
      bg: 'var(--color-critical-light)'
    };
  };

  const descriptor = getDescriptor(value);

  const getButtonBg = (num, isSelected) => {
    if (!isSelected) return 'var(--bg-secondary)';
    if (num >= 9) return 'var(--color-critical)';
    if (num >= 7) return 'var(--color-terracotta)';
    if (num >= 4) return 'var(--color-amber)';
    return 'var(--color-berry)';
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <label 
            id="pain-scale-label"
            style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Pain Severity Scale (0 to 10)
          </label>
        </div>
        <span 
          style={{ 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            color: descriptor.color,
            backgroundColor: descriptor.bg,
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${descriptor.color}33`
          }}
        >
          {value}/10 — {descriptor.category}
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.45 }}>
        {descriptor.desc}
      </p>

      {/* Number pills 0 through 10 */}
      <div 
        role="group" 
        aria-labelledby="pain-scale-label"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: '0.3rem', marginBottom: '0.85rem' }}
      >
        {Array.from({ length: 11 }).map((_, num) => {
          const isSelected = value === num;
          return (
            <button
              type="button"
              key={num}
              disabled={disabled}
              onClick={() => !disabled && onChange(num)}
              aria-label={`Pain score ${num} of 10`}
              aria-pressed={isSelected}
              style={{
                height: '40px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: getButtonBg(num, isSelected),
                color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                border: isSelected ? '2px solid transparent' : '1px solid var(--border-card)',
                transition: 'all 0.15s ease',
                cursor: disabled ? 'not-allowed' : 'pointer'
              }}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Accessible range slider */}
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Pain severity slider 0 to 10"
        aria-valuemin="0"
        aria-valuemax="10"
        aria-valuenow={value}
        style={{
          width: '100%',
          accentColor: value >= 9 ? 'var(--color-critical)' : value >= 7 ? 'var(--color-terracotta)' : 'var(--color-berry)',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      />

      {value >= 9 && (
        <div 
          role="alert"
          style={{ 
            marginTop: '0.75rem', 
            backgroundColor: 'var(--color-critical-light)', 
            border: '1px solid var(--color-critical-border)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '0.65rem 0.85rem',
            fontSize: '0.78rem',
            color: 'var(--color-critical)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Emergency Threshold (Score {value}):</strong> Severe pain may represent acute pathology. If accompanied by sudden onset, fever, vomiting, or syncope, seek emergency care immediately.
          </span>
        </div>
      )}
    </div>
  );
}
