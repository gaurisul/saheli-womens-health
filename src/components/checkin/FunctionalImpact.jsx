import React from 'react';
import { Briefcase, Bed, Ban, Pill, Coffee, Moon } from 'lucide-react';

export default function FunctionalImpact({ hasImpact, onToggleImpact, selectedTypes, onToggleType }) {
  const impactOptions = [
    { id: 'Spent day in bed', icon: Bed },
    { id: 'Missed work/classes', icon: Ban },
    { id: 'Reduced activity', icon: Coffee },
    { id: 'Needed prescription painkillers', icon: Pill },
    { id: 'Canceled social plans', icon: Briefcase },
    { id: 'Interrupted sleep', icon: Moon },
  ];

  return (
    <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
            Functional Impact & Disability
          </label>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Did symptoms interfere with work, classes, or daily activities today?
          </span>
        </div>

        {/* Yes / No Toggle */}
        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-card)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-card)' }}>
          <button
            type="button"
            onClick={() => onToggleImpact(false)}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: !hasImpact ? 'var(--color-berry-subtle)' : 'transparent',
              color: !hasImpact ? 'var(--color-berry)' : 'var(--text-muted)',
              border: !hasImpact ? '1px solid var(--color-blush-border)' : '1px solid transparent'
            }}
          >
            No
          </button>
          <button
            type="button"
            onClick={() => onToggleImpact(true)}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: hasImpact ? 'var(--color-berry)' : 'transparent',
              color: hasImpact ? '#FFFFFF' : 'var(--text-muted)'
            }}
          >
            Yes
          </button>
        </div>
      </div>

      {hasImpact && (
        <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Select how your daily functioning was impacted:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {impactOptions.map((opt) => {
              const isSelected = selectedTypes.includes(opt.id);
              const Icon = opt.icon;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => onToggleType(opt.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 600 : 500,
                    backgroundColor: isSelected ? 'var(--color-blush)' : 'var(--bg-card)',
                    color: isSelected ? 'var(--color-berry)' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--color-berry)' : '1px solid var(--border-card)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} />
                  <span>{opt.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
