import React from 'react';
import { Droplet } from 'lucide-react';

export default function BleedingSelector({ value, onChange }) {
  const options = [
    { id: 'None', label: 'None', desc: 'No flow', droplets: 0, color: 'var(--text-muted)' },
    { id: 'Spotting', label: 'Spotting', desc: 'A few drops / liner', droplets: 1, color: '#C25E48' },
    { id: 'Light', label: 'Light', desc: 'Light pad/tampon', droplets: 2, color: '#A83256' },
    { id: 'Medium', label: 'Medium', desc: 'Regular flow', droplets: 3, color: '#89284D' },
    { id: 'Heavy', label: 'Heavy', desc: 'Flooding / large clots', droplets: 4, color: '#6B1D3A' },
  ];

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Bleeding & Menstrual Flow
      </label>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', 
          gap: '0.65rem' 
        }}
      >
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => onChange(opt.id)}
              style={{
                backgroundColor: isSelected ? 'var(--color-blush)' : 'var(--bg-card)',
                border: isSelected ? '2px solid var(--color-berry)' : '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '0.85rem 0.6rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 3px 10px var(--color-berry-glow)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '22px' }}>
                {opt.droplets === 0 ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                ) : (
                  <div style={{ display: 'flex', gap: '2px' }}>
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
              <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? 'var(--color-berry)' : 'var(--text-primary)' }}>
                {opt.label}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
