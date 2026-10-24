import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MEDICAL_DISCLAIMER_TEXT } from '../../data/clinicalRules';

export default function MedicalDisclaimerModal() {
  const { isDisclaimerModalOpen, setIsDisclaimerModalOpen } = useApp();

  if (!isDisclaimerModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsDisclaimerModalOpen(false)}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--color-berry-subtle)', padding: '0.5rem', borderRadius: '10px' }}>
              <ShieldCheck size={22} color="var(--color-berry)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Medical & Regulatory Disclaimer</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Transparency on demonstration scope and intended clinical use</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDisclaimerModalOpen(false)}
            aria-label="Close dialog"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
            {MEDICAL_DISCLAIMER_TEXT}
          </p>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            <h4 style={{ color: 'var(--color-berry)', marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              1. Not a Diagnostic Medical Device
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Saheli is an observational health recording prototype designed to assist users in structuring symptom logs for in-person physician visits. It does not possess CE mark, FDA clearance, or regulatory medical device certification.
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            <h4 style={{ color: 'var(--color-berry)', marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              2. Demonstration Rules (Unvalidated)
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Pattern matching rules (e.g. Endometriosis, PCOS, Anaemia indicators) are prototype algorithmic demonstrations based on published literature (ACOG, ESHRE, FIGO), but have not undergone prospective clinical trials. They are framed strictly as conversational talking points.
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            <h4 style={{ color: 'var(--color-berry)', marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              3. Privacy & Client-Side Local Storage
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Your data is stored solely in your local browser sandbox via HTML5 localStorage. It is not transmitted to cloud databases. This browser environment is not a HIPAA/GDPR certified Electronic Health Record (EHR).
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setIsDisclaimerModalOpen(false)}
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
