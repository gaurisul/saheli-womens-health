import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const SYMPTOM_CATEGORIES = [
  {
    category: 'Pain & Pelvic',
    description: 'Pelvic cramping, somatic pain, and catamenial symptoms',
    items: [
      'Lower abdominal cramps',
      'Lower back ache',
      'Pelvic pressure / heaviness',
      'Ovulation pain / Mittelschmerz',
      'Pain with bowel movement',
      'Dyspareunia / intercourse pain',
      'Shooting nerve pain down legs',
      'Headaches / Hormonal migraine',
      'Breast tenderness',
      'Joint / muscle aches'
    ]
  },
  {
    category: 'Energy & Sleep',
    description: 'Vitality, fatigue, and sleep quality markers',
    items: [
      'Fatigue / low stamina',
      'Brain fog / mental sluggishness',
      'Insomnia / restless sleep',
      'Excessive daytime drowsiness',
      'Feeling cold / chills',
      'Post-exertional exhaustion'
    ]
  },
  {
    category: 'Mood & Emotional State',
    description: 'Neurohormonal balance and emotional wellbeing',
    items: [
      'Irritability / short fuse',
      'Heightened anxiety / restlessness',
      'Low mood / tearfulness',
      'Emotional overwhelm / mood swings',
      'Calm & balanced',
      'High motivation & mental clarity'
    ]
  },
  {
    category: 'Digestion & GI',
    description: 'Gut motility, bloating, and gastrointestinal sensitivity',
    items: [
      'Bloating / abdominal distension',
      'Nausea / stomach upset',
      'Constipation',
      'Diarrhea / loose stools',
      'Intense sugar / carb cravings',
      'Acid reflux / heartburn'
    ]
  },
  {
    category: 'Skin & Hair',
    description: 'Cutaneous and androgenic markers',
    items: [
      'Hormonal cystic acne flare',
      'Diffuse hair shedding / thinning',
      'Unwanted facial hair / hirsutism',
      'Excess skin oiliness',
      'Dry or inflamed skin'
    ]
  }
];

export default function SymptomChipGroup({ selectedSymptoms = [], onToggleSymptom, disabled = false }) {
  const [collapsed, setCollapsed] = useState({});

  const toggleCategory = (catName) => {
    setCollapsed((prev) => ({ ...prev, [catName]: !prev[catName] }));
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Symptom Observations ({selectedSymptoms.length} recorded)
        </label>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Click chips to toggle
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {SYMPTOM_CATEGORIES.map((cat) => {
          const isCollapsed = collapsed[cat.category];
          const countInCat = cat.items.filter((item) => selectedSymptoms.includes(item)).length;

          return (
            <div 
              key={cat.category}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1.1rem',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <div 
                onClick={() => toggleCategory(cat.category)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCategory(cat.category); } }}
                aria-expanded={!isCollapsed}
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
                      <span className="badge badge-berry" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                        {countInCat} selected
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {cat.description}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)' }} aria-hidden="true">
                  {isCollapsed ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
                </div>
              </div>

              {!isCollapsed && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.75rem' }}>
                  {cat.items.map((item) => {
                    const isSelected = selectedSymptoms.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        disabled={disabled}
                        onClick={() => !disabled && onToggleSymptom(item)}
                        aria-pressed={isSelected}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.8rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.82rem',
                          fontWeight: isSelected ? 600 : 500,
                          backgroundColor: isSelected ? 'var(--color-blush)' : 'var(--bg-secondary)',
                          color: isSelected ? 'var(--color-berry)' : 'var(--text-secondary)',
                          border: isSelected ? '1.5px solid var(--color-berry)' : '1px solid var(--border-card)',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <Check size={13} color="var(--color-berry)" strokeWidth={2.5} />}
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
