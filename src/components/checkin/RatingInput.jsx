import React from 'react';
import { Zap, Heart } from 'lucide-react';

export default function RatingInput({ 
  label, 
  value = 3, 
  onChange, 
  type = 'energy', 
  disabled = false 
}) {
  const isEnergy = type === 'energy';

  const descriptors = isEnergy
    ? [
        { score: 1, label: 'Exhausted', desc: 'Bed-bound / severe depletion' },
        { score: 2, label: 'Low', desc: 'Sluggish, struggling with tasks' },
        { score: 3, label: 'Moderate', desc: 'Functional, normal energy' },
        { score: 4, label: 'Good', desc: 'Active, clear stamina' },
        { score: 5, label: 'Optimal', desc: 'Vibrant, high vitality' }
      ]
    : [
        { score: 1, label: 'Distressed', desc: 'Severely overwhelmed or tearful' },
        { score: 2, label: 'Low / Irritable', desc: 'Edgy, low patience, anxious' },
        { score: 3, label: 'Neutral', desc: 'Stable, baseline state' },
        { score: 4, label: 'Content', desc: 'Positive, calm and centered' },
        { score: 5, label: 'Thriving', desc: 'Uplifted, joyful, resilient' }
      ];

  const currentDesc = descriptors.find((d) => d.score === value) || descriptors[2];

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isEnergy ? <Zap size={16} color="var(--color-amber)" /> : <Heart size={16} color="var(--color-berry)" />}
          <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {label}
          </label>
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-berry)' }}>
          {value}/5 · {currentDesc.label}
        </span>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
        {currentDesc.desc}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
        {descriptors.map((d) => {
          const isSelected = value === d.score;
          return (
            <button
              type="button"
              key={d.score}
              disabled={disabled}
              onClick={() => !disabled && onChange(d.score)}
              aria-label={`${label} rating ${d.score} of 5: ${d.label}`}
              aria-pressed={isSelected}
              style={{
                padding: '0.45rem 0.2rem',
                borderRadius: '8px',
                textAlign: 'center',
                backgroundColor: isSelected ? 'var(--color-berry)' : 'var(--bg-card)',
                color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                border: isSelected ? '1.5px solid var(--color-berry)' : '1px solid var(--border-card)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{d.score}</div>
              <div style={{ fontSize: '0.65rem', opacity: isSelected ? 0.95 : 0.7, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {d.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
