import React from 'react';
import { Droplet } from 'lucide-react';

export default function BleedingSelector({ value = 'None', onChange, disabled = false }) {
  const options = [
    { id: 'None', label: 'None', desc: 'No flow', droplets: 0, color: 'var(--text-muted)' },
    { id: 'Spotting', label: 'Spotting', desc: 'A few drops / pantyliner', droplets: 1, color: 'var(--color-terracotta)' },
    { id: 'Light', label: 'Light', desc: 'Light pad or tampon', droplets: 2, color: 'var(--color-berry-light)' },
    { id: 'Medium', label: 'Medium', desc: 'Standard / regular flow', droplets: 3, color: 'var(--color-berry)' },
    { id: 'Heavy', label: 'Heavy', desc: 'Flooding / large clots', droplets: 4, color: 'var(--color-berry-dark)' },
  ];

  const handleKeyDown = (e, index) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % options.length;
      onChange(options[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + options.length) % options.length;
      onChange(options[prevIndex].id);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label 
          id="bleeding-selector-label"
          style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          Bleeding & Menstrual Flow
        </label>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Selected: <strong style={{ color: 'var(--color-berry)' }}>{value}</strong>
        </span>
      </div>

      <div 
        role="radiogroup" 
        aria-labelledby="bleeding-selector-label"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', 
          gap: '0.65rem' 
        }}
      >
        {options.map((opt, idx) => {
          const isSelected = value === opt.id;
          return (
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              key={opt.id}
              onClick={() => !disabled && onChange(opt.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                backgroundColor: isSelected ? 'var(--color-blush)' : 'var(--bg-card)',
                border: isSelected ? '2px solid var(--color-berry)' : '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 0.6rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? 'var(--shadow-subtle)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '22px' }}>
                {opt.droplets === 0 ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>—</span>
                ) : (
                  <div style={{ display: 'flex', gap: '2px' }} aria-hidden="true">
                    {Array.from({ length: opt.droplets }).map((_, i) => (
                      <Droplet
                        key={i}
                        size={14}
                        fill={opt.color}
                        color={opt.color}
                      />
                    ))}
                  </div>
                )}
              </div>
              <span style={{ 
                fontSize: '0.88rem', 
                fontWeight: isSelected ? 700 : 600, 
                color: isSelected ? 'var(--color-berry)' : 'var(--text-primary)' 
              }}>
                {opt.label}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.25 }}>
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
