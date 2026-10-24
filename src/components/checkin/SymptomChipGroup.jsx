import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const SYMPTOM_CATEGORIES = [
  {
    category: 'Pain & Body',
    description: 'Pelvic, cramping, and somatic symptoms',
    items: [
      'Lower abdominal cramps',
      'Lower back ache',
      'Pelvic pressure',
      'Ovulation pain / Mittelschmerz',
      'Pain with bowel movement',
      'Dyspareunia / intercourse pain',
      'Shooting nerve pain',
      'Headaches / Migraine',
      'Breast tenderness',
      'Joint / muscle aches'
    ]
  },
  {
    category: 'Energy & Sleep',
    description: 'Vitality, fatigue, and sleep disturbances',
    items: [
      'Fatigue / low stamina',
      'Brain fog',
      'Insomnia / trouble sleeping',
      'Restless night',
      'Drowsiness',
      'Morning stiffness'
    ]
  },
  {
    category: 'Mood & Mental',
    description: 'Emotional balance and psychological state',
    items: [
      'Irritability',
      'Anxiety / restlessness',
      'Low mood / tearful',
      'Mood swings',
      'Calm & centered',
      'High motivation'
    ]
  },
  {
    category: 'Digestion & GI',
    description: 'Gut, motility, and appetite changes',
    items: [
      'Bloating / abdominal distension',
      'Nausea',
      'Constipation',
      'Diarrhea',
      'Food cravings',
      'Acid reflux'
    ]
  },
  {
    category: 'Skin & Hair',
    description: 'Androgenic and dermatological markers',
    items: [
      'Hormonal acne flare',
      'Hair shedding / thinning',
      'Unwanted facial hair',
      'Excess facial oil',
      'Dry skin'
    ]
  }
];

export default function SymptomChipGroup({ selectedSymptoms, onToggleSymptom }) {
  // Allow collapsing categories if desired, default all open
  const [collapsed, setCollapsed] = useState({});

  const toggleCategory = (catName) => {
    setCollapsed((prev) => ({ ...prev, [catName]: !prev[catName] }));
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
        Symptom Observations ({selectedSymptoms.length} selected)
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {SYMPTOM_CATEGORIES.map((cat) => {
          const isCollapsed = collapsed[cat.category];
          const countInCat = cat.items.filter((item) => selectedSymptoms.includes(item)).length;

          return (
            <div 
              key={cat.category}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <div 
                onClick={() => toggleCategory(cat.category)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  paddingBottom: isCollapsed ? '0' : '0.65rem',
                  borderBottom: isCollapsed ? 'none' : '1px solid var(--border-card)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-berry)' }}>
                      {cat.category}
                    </span>
                    {countInCat > 0 && (
                      <span className="badge badge-berry" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                        {countInCat} active
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {cat.description}
                  </span>
                </div>
                <button type="button" aria-label="Toggle section" style={{ color: 'var(--text-muted)' }}>
                  {isCollapsed ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
                </button>
              </div>

              {!isCollapsed && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {cat.items.map((item) => {
                    const isSelected = selectedSymptoms.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => onToggleSymptom(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.8rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 600 : 500,
                          backgroundColor: isSelected ? 'var(--color-blush)' : 'var(--bg-secondary)',
                          color: isSelected ? 'var(--color-berry)' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid var(--color-berry)' : '1px solid var(--border-card)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <Check size={13} color="var(--color-berry)" />}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
