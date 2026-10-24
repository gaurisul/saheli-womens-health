import React from 'react';
import { Bed, Ban, Coffee, Pill, Users, Moon } from 'lucide-react';

export default function FunctionalImpact({ 
  hasImpact = false, 
  onToggleImpact, 
  selectedTypes = [], 
  onToggleType,
  disabled = false 
}) {
  const impactOptions = [
    { id: 'Missed work/classes', label: 'Missed work / classes', icon: Ban },
    { id: 'Spent day in bed', label: 'Spent day in bed', icon: Bed },
    { id: 'Needed prescription painkillers', label: 'Needed prescription meds', icon: Pill },
    { id: 'Reduced activity', label: 'Reduced physical activity', icon: Coffee },
    { id: 'Canceled social plans', label: 'Canceled plans / events', icon: Users },
    { id: 'Interrupted sleep', label: 'Severe sleep disruption', icon: Moon },
  ];

  return (
    <div 
      style={{ 
        marginBottom: '1.5rem', 
        backgroundColor: 'var(--bg-secondary)', 
        padding: '1.25rem', 
        borderRadius: 'var(--radius-card)', 
        border: '1px solid var(--border-card)' 
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
            Daily Functional Impairment
          </label>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Did symptoms interfere with your ability to work, study, socialize, or rest today?
          </span>
        </div>

        {/* Yes / No Toggle buttons */}
        <div 
          role="group" 
          aria-label="Functional impact reported"
          style={{ 
            display: 'flex', 
            gap: '0.25rem', 
            backgroundColor: 'var(--bg-card)', 
            padding: '3px', 
            borderRadius: 'var(--radius-full)', 
            border: '1px solid var(--border-card)' 
          }}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onToggleImpact(false)}
            aria-pressed={!hasImpact}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: !hasImpact ? 'var(--color-berry-subtle)' : 'transparent',
              color: !hasImpact ? 'var(--color-berry)' : 'var(--text-muted)',
              border: !hasImpact ? '1px solid var(--color-blush-border)' : '1px solid transparent',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            No Impact
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onToggleImpact(true)}
            aria-pressed={hasImpact}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: hasImpact ? 'var(--color-berry)' : 'transparent',
              color: hasImpact ? '#FFFFFF' : 'var(--text-muted)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Yes, Disrupted
          </button>
        </div>
      </div>

      {hasImpact && (
        <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
            Select how your daily functioning was affected (used in clinician summary):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {impactOptions.map((opt) => {
              const isSelected = selectedTypes.includes(opt.id);
              const Icon = opt.icon;
              return (
                <button
                  type="button"
                  key={opt.id}
                  disabled={disabled}
                  onClick={() => !disabled && onToggleType(opt.id)}
                  aria-pressed={isSelected}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 600 : 500,
                    backgroundColor: isSelected ? 'var(--color-blush)' : 'var(--bg-card)',
                    color: isSelected ? 'var(--color-berry)' : 'var(--text-secondary)',
                    border: isSelected ? '1.5px solid var(--color-berry)' : '1px solid var(--border-card)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} color={isSelected ? 'var(--color-berry)' : 'var(--text-muted)'} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
