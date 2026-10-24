import React from 'react';
import { BatteryCharging, BatteryLow, BatteryMedium, Battery, Zap, Smile, Meh, Frown, Sparkles } from 'lucide-react';

export default function RatingInput({ label, value, onChange, type = 'energy' }) {
  const energyLevels = [
    { score: 1, label: 'Exhausted', icon: BatteryLow, color: '#C25E48' },
    { score: 2, label: 'Low Stamina', icon: Battery, color: '#B26A28' },
    { score: 3, label: 'Moderate', icon: BatteryMedium, color: 'var(--text-secondary)' },
    { score: 4, label: 'Good Energy', icon: BatteryCharging, color: '#4E6E58' },
    { score: 5, label: 'High Vitality', icon: Zap, color: '#2E7D32' },
  ];

  const moodLevels = [
    { score: 1, label: 'Very Low / Distressed', icon: Frown, color: '#C25E48' },
    { score: 2, label: 'Anxious / Irritable', icon: Meh, color: '#B26A28' },
    { score: 3, label: 'Neutral / Stable', icon: Smile, color: 'var(--text-secondary)' },
    { score: 4, label: 'Calm & Centered', icon: Smile, color: '#4E6E58' },
    { score: 5, label: 'Joyful & Motivated', icon: Sparkles, color: '#2E7D32' },
  ];

  const levels = type === 'energy' ? energyLevels : moodLevels;
  const currentLevel = levels.find((l) => l.score === value) || levels[2];

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
        </label>
        <span style={{ fontSize: '0.78rem', color: currentLevel.color, fontWeight: 600 }}>
          {currentLevel.label} ({value}/5)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
        {levels.map((lvl) => {
          const isSelected = value === lvl.score;
          const Icon = lvl.icon;
          return (
            <button
              type="button"
              key={lvl.score}
              onClick={() => onChange(lvl.score)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.65rem 0.35rem',
                borderRadius: '10px',
                backgroundColor: isSelected ? 'var(--color-blush)' : 'var(--bg-secondary)',
                border: isSelected ? '2px solid var(--color-berry)' : '1px solid var(--border-card)',
                color: isSelected ? 'var(--color-berry)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} color={isSelected ? 'var(--color-berry)' : lvl.color} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{lvl.score}</span>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.15 }}>
                {lvl.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
