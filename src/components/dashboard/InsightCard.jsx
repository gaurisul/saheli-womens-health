import React from 'react';
import { Sparkles, ArrowRight, AlertCircle, Calendar, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function InsightCard() {
  const { detectedPatterns, setActiveEvidenceRule, summaryMetrics } = useApp();

  // Find the top matched pattern or fallback
  const matchedPattern = detectedPatterns.find((p) => p.matched) || detectedPatterns[0];
  const hasLogs = summaryMetrics.totalLoggedDays > 0;

  if (!hasLogs) {
    return (
      <div className="saheli-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="card-header-row">
          <div className="card-title">
            <Sparkles size={18} color="var(--color-berry)" />
            <span>Pattern Recognition</span>
          </div>
          <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
            Awaiting Data
          </span>
        </div>

        <div style={{ textAlign: 'center', padding: '1.75rem 1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-berry-subtle)',
            color: 'var(--color-berry)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <FileText size={20} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            Start Logging Your Symptoms
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '320px', margin: '0 auto 1.25rem' }}>
            Saheli analyzes your diary entries against published clinical criteria (ACOG, ESHRE) to identify discussion points for your doctor.
          </p>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Log at least 3 entries to activate pattern insights.
          </div>
        </div>

        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-card)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Evidence-based synthesis for 15-minute consultations
        </div>
      </div>
    );
  }

  return (
    <div className="saheli-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header-row">
        <div className="card-title">
          <Sparkles size={18} color="var(--color-berry)" />
          <span>Observed Pattern for Clinical Discussion</span>
        </div>
        <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
          {matchedPattern?.severity || 'Active Review'}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${matchedPattern?.badgeColor || 'berry'}`}>
              {matchedPattern?.category}
            </span>
            {matchedPattern?.sampleSize > 0 && (
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Based on {matchedPattern.sampleSize} matching logged entries
              </span>
            )}
          </div>

          <h3 style={{ fontSize: '1.18rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            {matchedPattern?.title}
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            {matchedPattern?.description}
          </p>

          {/* Traceable Evidence Box */}
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '10px', 
            padding: '0.85rem 1rem', 
            border: '1px solid var(--border-card)',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-berry)' }}>
                Observed Criteria ({matchedPattern?.evidence?.length || 0}):
              </span>
              {matchedPattern?.dateRange && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Calendar size={12} />
                  <span>{matchedPattern.dateRange.start} to {matchedPattern.dateRange.end}</span>
                </span>
              )}
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
            fontSize: '0.74rem', 
            color: 'var(--text-muted)', 
            marginBottom: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem' 
          }}>
            <AlertCircle size={13} color="var(--color-terracotta)" style={{ flexShrink: 0 }} />
            <span>Discussion agenda for your physician — not a clinical diagnosis or medical conclusion.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-card)', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Source: ESHRE / ACOG guidelines
            </span>
            <button
              type="button"
              onClick={() => setActiveEvidenceRule(matchedPattern)}
              className="btn btn-blush"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
            >
              <span>See Clinical Evidence</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
