import React from 'react';
import { X, CheckCircle2, BookOpen, HelpCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function EvidenceDrawer() {
  const { activeEvidenceRule, setActiveEvidenceRule } = useApp();
  const navigate = useNavigate();

  if (!activeEvidenceRule) return null;

  const rule = activeEvidenceRule;

  return (
    <div className="modal-overlay" onClick={() => setActiveEvidenceRule(null)}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
      >
        <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span className={`badge badge-${rule.badgeColor || 'berry'}`}>
                {rule.category}
              </span>
              <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                {rule.status}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem' }}>{rule.title}</h2>
          </div>
          <button 
            onClick={() => setActiveEvidenceRule(null)}
            aria-label="Close evidence modal"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Transparent Notice */}
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-card)', 
            borderRadius: '12px', 
            padding: '1rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} color="var(--color-berry)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Explainable Clinical Logic:</strong> Saheli does not use "black-box" predictive scores. This pattern is flagged because your logged diary entries match explicit observational criteria defined in clinical literature.
            </div>
          </div>

          {/* Matched Evidence Breakdown */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--color-sage)" />
              Detected Evidence from Your Diary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(rule.evidence || []).length > 0 ? (
                rule.evidence.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      backgroundColor: 'var(--bg-card)', 
                      border: '1px solid var(--border-card)', 
                      borderRadius: '10px', 
                      padding: '0.85rem 1rem',
                      borderLeft: '3px solid var(--color-berry)'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {item.criterion}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {item.detail}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem' }}>
                  No matching entries detected yet for this pattern in the current diary logs.
                </div>
              )}
            </div>
          </div>

          {/* Clinical Rationale & Literature */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--color-berry)', fontWeight: 600, fontSize: '0.88rem' }}>
              <BookOpen size={16} />
              Clinical Rationale & Published Guidelines
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.55 }}>
              {rule.clinicalRationale}
            </p>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <strong>Literature Reference:</strong> {rule.literatureBasis}
            </div>
          </div>

          {/* Suggested Questions for Clinician */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HelpCircle size={16} color="var(--color-berry)" />
              Recommended Clinician Discussion Prompts
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(rule.suggestedClinicianQuestions || []).map((q, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    gap: '0.6rem', 
                    fontSize: '0.84rem', 
                    color: 'var(--text-primary)', 
                    padding: '0.6rem 0.85rem', 
                    background: 'var(--color-berry-subtle)', 
                    borderRadius: '8px',
                    border: '1px solid var(--color-blush-border)'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--color-berry)' }}>Q{idx + 1}:</span>
                  <span>"{q}"</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-card)' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveEvidenceRule(null)}
              style={{ fontSize: '0.85rem' }}
            >
              Close
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setActiveEvidenceRule(null);
                navigate('/doctor-visit');
              }}
              style={{ fontSize: '0.85rem' }}
            >
              Prepare Clinician Brief <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
