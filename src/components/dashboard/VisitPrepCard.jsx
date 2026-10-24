import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowRight, Calendar, CheckSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function VisitPrepCard() {
  const { currentProfile, summaryMetrics, detectedPatterns } = useApp();

  const flaggedPatternsCount = detectedPatterns.filter((p) => p.matched).length;
  const questionsCount = (currentProfile.customQuestions || []).filter((q) => q.inReport !== false).length;

  return (
    <div className="saheli-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header-row">
        <div className="card-title">
          <Stethoscope size={18} color="var(--color-berry)" />
          <span>Doctor Visit Preparation</span>
        </div>
        <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
          Consultation Brief
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Clinician appointment banner */}
          <div style={{ 
            backgroundColor: 'var(--color-berry-subtle)', 
            border: '1px solid var(--color-blush-border)', 
            borderRadius: '10px', 
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Calendar size={20} color="var(--color-berry)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-berry)' }}>
                {currentProfile.doctorName || 'Upcoming Clinical Consultation'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {currentProfile.upcomingVisitDate 
                  ? `Scheduled consultation: ${currentProfile.upcomingVisitDate}`
                  : 'Ready to export for your next primary care or gynecologist visit'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <CheckSquare size={15} color="var(--color-sage)" />
              <span><strong>{summaryMetrics.totalLoggedDays} days</strong> of longitudinal diary data indexed</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <CheckSquare size={15} color="var(--color-sage)" />
              <span><strong>{flaggedPatternsCount} evidence-based patterns</strong> identified for discussion</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <CheckSquare size={15} color="var(--color-sage)" />
              <span><strong>{questionsCount} prioritized questions</strong> prepared for doctor</span>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Synthesized into a high-density, printable 60-second summary so your doctor gets the whole picture without feeling rushed.
          </p>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            One-page print format
          </span>
          <Link to="/doctor-visit" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
            <span>Generate Clinician Brief</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
