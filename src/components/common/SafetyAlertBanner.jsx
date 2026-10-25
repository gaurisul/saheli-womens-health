import React from 'react';
import { ShieldAlert, AlertTriangle, PhoneCall, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EMERGENCY_CONTACTS_CONFIG } from '../../services/safetyRules';

export default function SafetyAlertBanner({ flags = [] }) {
  const { setIsUrgentModalOpen } = useApp();

  if (!flags || flags.length === 0) return null;

  const hasUrgent = flags.some((f) => f.severity === 'urgent');

  const theme = hasUrgent
    ? {
        bg: '#FFF5F5',
        border: 'var(--color-critical-border, #FED7D7)',
        accent: 'var(--color-critical, #C53030)',
        textColor: '#742A2A',
        iconBg: '#FED7D7'
      }
    : {
        bg: 'var(--color-amber-light, #FFFBEB)',
        border: 'var(--color-amber-border, #FDE68A)',
        accent: 'var(--color-amber-dark, #92400E)',
        textColor: '#78350F',
        iconBg: '#FDE68A'
      };

  return (
    <section
      role="alert"
      aria-live="polite"
      style={{
        backgroundColor: theme.bg,
        border: `1.5px solid ${theme.border}`,
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-subtle, 0 1px 3px rgba(0,0,0,0.05))',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Banner Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              backgroundColor: theme.iconBg,
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {hasUrgent ? (
              <ShieldAlert size={22} color={theme.accent} />
            ) : (
              <AlertTriangle size={22} color={theme.accent} />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full, 9999px)',
                  backgroundColor: hasUrgent ? 'var(--color-critical, #C53030)' : 'var(--color-amber, #D97706)',
                  color: '#FFFFFF'
                }}
              >
                {hasUrgent ? 'Urgent Safety Flag' : 'Clinical Attention Advisory'}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #666)' }}>
                System-generated red-flag notice · Observational only
              </span>
            </div>
            <h2 style={{ fontSize: '1.12rem', color: theme.accent, margin: '0.25rem 0 0', fontWeight: 700 }}>
              {hasUrgent ? 'Symptoms May Need Prompt Medical Attention' : 'Symptoms Warranting Clinical Discussion'}
            </h2>
          </div>
        </div>

        {/* Action Button to Open Full Urgent Care Modal */}
        <button
          type="button"
          onClick={() => setIsUrgentModalOpen(true)}
          className="btn btn-outline"
          style={{
            fontSize: '0.8rem',
            padding: '0.4rem 0.85rem',
            borderColor: theme.accent,
            color: theme.accent,
            backgroundColor: '#FFFFFF',
            fontWeight: 600
          }}
        >
          <span>View Urgent Care Guide</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Flag Descriptions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        {flags.map((flag) => (
          <div
            key={flag.id}
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary, #222)' }}>
                {flag.title}
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #777)' }}>
                Recorded Date: <strong>{flag.triggeredDate}</strong>
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: theme.textColor, lineHeight: 1.45 }}>
              {flag.reason}
            </p>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: theme.accent, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>➔</span>
              <span>{flag.action}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Emergency Contacts Bar */}
      <div
        style={{
          borderTop: `1px dashed ${theme.border}`,
          paddingTop: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.textColor }}>
          <PhoneCall size={15} color={theme.accent} style={{ flexShrink: 0 }} />
          <span>
            <strong>Emergency Assistance ({EMERGENCY_CONTACTS_CONFIG.region}):</strong> Call{' '}
            <strong style={{ color: theme.accent }}>{EMERGENCY_CONTACTS_CONFIG.nationalEmergency.number}</strong> (National Emergency) or{' '}
            <strong style={{ color: theme.accent }}>{EMERGENCY_CONTACTS_CONFIG.ambulance.number}</strong> (Ambulance).
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #666)', fontStyle: 'italic' }}>
          * {EMERGENCY_CONTACTS_CONFIG.disclaimer}
        </span>
      </div>
    </section>
  );
}
