import React from 'react';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function InsightCard() {
  const { detectedPatterns, setActiveEvidenceRule } = useApp();

  // Find the top matched pattern
  const matchedPattern = detectedPatterns.find((p) => p.matched) || detectedPatterns[0];

  return (
    <div className="saheli-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header-row">
        <div className="card-title">
          <Sparkles size={18} color="var(--color-berry)" />
          <span>Latest Pattern Insight</span>
        </div>
        <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
          {matchedPattern?.severity || 'Active Review'}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span className={`badge badge-${matchedPattern?.badgeColor || 'berry'}`}>
              {matchedPattern?.category}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Demonstration Rule
            </span>
          </div>

          <h3 style={{ fontSize: '1.18rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            {matchedPattern?.title}
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            {matchedPattern?.description}
          </p>

          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '10px', 
            padding: '0.85rem 1rem', 
            border: '1px solid var(--border-card)',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-berry)', marginBottom: '0.3rem' }}>
              Detected Observations ({matchedPattern?.evidence?.length || 0}):
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {(matchedPattern?.evidence || []).slice(0, 2).map((e, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>
                  <strong>{e.criterion}:</strong> {e.detail.split('.')[0]}.
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            marginBottom: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem' 
          }}>
            <AlertCircle size={13} color="var(--color-terracotta)" />
            <span>Discussion topic for your clinician — not a clinical diagnosis.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-card)', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
              Literature: ESHRE / ACOG
            </span>
            <button
              onClick={() => setActiveEvidenceRule(matchedPattern)}
              className="btn btn-blush"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
            >
              <span>See Evidence</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
