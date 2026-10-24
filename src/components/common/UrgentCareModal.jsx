import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { URGENT_CARE_RED_FLAGS } from '../../data/clinicalRules';

export default function UrgentCareModal() {
  const { isUrgentModalOpen, setIsUrgentModalOpen } = useApp();

  if (!isUrgentModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsUrgentModalOpen(false)}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', borderTop: '4px solid #C25E48' }}
      >
        <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ background: '#FCF1EE', padding: '0.5rem', borderRadius: '10px' }}>
              <ShieldAlert size={24} color="#C25E48" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#9C4532' }}>Urgent Care & Clinical Red Flags</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Immediate clinical triage guidance for acute symptoms</p>
            </div>
          </div>
          <button 
            onClick={() => setIsUrgentModalOpen(false)}
            aria-label="Close dialog"
            style={{ color: 'var(--text-muted)', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem' }}>
          <div style={{ 
            backgroundColor: '#FCF1EE', 
            border: '1px solid #E8ACA0', 
            borderRadius: '10px', 
            padding: '1rem', 
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <AlertTriangle size={20} color="#C25E48" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.88rem', color: '#5C2419', lineHeight: 1.45 }}>
              <strong>Emergency Instruction:</strong> If you are experiencing sudden excruciating abdominal pain, soaking more than two pads an hour, or feel faint, <strong>do not wait for a routine clinic appointment</strong>.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {URGENT_CARE_RED_FLAGS.map((flag, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-card)', 
                  borderRadius: '12px', 
                  padding: '1rem' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {flag.title}
                  </h3>
                  <span className="badge badge-terracotta" style={{ fontSize: '0.7rem' }}>Red Flag</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {flag.description}
                </p>
                <div style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  color: '#9C4532',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  ➔ {flag.action}
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            borderRadius: '12px', 
            backgroundColor: 'var(--color-berry-subtle)', 
            border: '1px solid var(--color-blush-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-berry)' }}>
                Emergency Contacts
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                National Emergency: 112 (India / EU) / 911 (US) / Local Hospital ER
              </div>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setIsUrgentModalOpen(false)}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
