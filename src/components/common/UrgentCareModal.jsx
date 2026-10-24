import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { URGENT_CARE_RED_FLAGS } from '../../data/clinicalRules';
import { EMERGENCY_CONTACTS_CONFIG, getActiveSafetyAlerts } from '../../services/safetyRules';

export default function UrgentCareModal() {
  const { isUrgentModalOpen, setIsUrgentModalOpen, logs } = useApp();
  const activeFlags = React.useMemo(() => getActiveSafetyAlerts(logs), [logs]);

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

          {activeFlags.length > 0 && (
            <div style={{ marginBottom: '1.25rem', backgroundColor: '#FFF5F5', border: '1.5px solid var(--color-critical-border, #FED7D7)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--color-critical)' }}>
                <ShieldAlert size={18} />
                <span style={{ fontSize: '0.86rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Active Red-Flag Detected from Your Diary</span>
              </div>
              {activeFlags.map((flag) => (
                <div key={flag.id} style={{ fontSize: '0.84rem', color: '#742A2A', marginBottom: '0.35rem' }}>
                  <strong>• {flag.title} ({flag.triggeredDate}):</strong> {flag.reason}
                </div>
              ))}
            </div>
          )}

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
                Emergency Contacts ({EMERGENCY_CONTACTS_CONFIG.region})
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                <strong>{EMERGENCY_CONTACTS_CONFIG.nationalEmergency.number}</strong> — {EMERGENCY_CONTACTS_CONFIG.nationalEmergency.label} &nbsp;|&nbsp; <strong>{EMERGENCY_CONTACTS_CONFIG.ambulance.number}</strong> — {EMERGENCY_CONTACTS_CONFIG.ambulance.label}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Women's Helpline: <strong>{EMERGENCY_CONTACTS_CONFIG.womensHelpline.number}</strong> · <em>{EMERGENCY_CONTACTS_CONFIG.disclaimer}</em>
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
