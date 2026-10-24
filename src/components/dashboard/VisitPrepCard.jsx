import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowRight, Calendar, CheckSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function VisitPrepCard() {
  const { currentProfile, summaryMetrics, detectedPatterns } = useApp();

  const flaggedPatternsCount = detectedPatterns.filter((p) => p.matched).length;

  return (
    <div className="saheli-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header-row">
        <div className="card-title">
          <Stethoscope size={18} color="var(--color-berry)" />
          <span>Doctor Visit Preparation</span>
        </div>
        <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
          Brief Prepared
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
            <Calendar size={20} color="var(--color-berry)" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-berry)' }}>
                {currentProfile.doctorName || 'Upcoming Gynecologist Consultation'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {currentProfile.upcomingVisitDate 
                  ? `Scheduled for ${currentProfile.upcomingVisitDate}`
                  : 'Ready for your next in-person or telehealth visit'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <CheckSquare size={15} color="var(--color-sage)" />
              <span><strong>{summaryMetrics.totalLoggedDays} days</strong> of longitudinal diary data indexed</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <CheckSquare size={15} color="var(--color-sage)" />
              <span><strong>{flaggedPatternsCount} evidence-based patterns</strong> ready for clinician review</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <CheckSquare size={15} color="var(--color-sage)" />
              <span><strong>{currentProfile.customQuestions?.length || 2} prioritized questions</strong> prepared for doctor</span>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Synthesized into a high-density, printable 60-second summary so your doctor gets the whole picture without feeling rushed.
          </p>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            One-page format
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
