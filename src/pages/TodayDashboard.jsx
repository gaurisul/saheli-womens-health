import React from 'react';
import { useApp } from '../context/AppContext';
import CycleWheel from '../components/dashboard/CycleWheel';
import InsightCard from '../components/dashboard/InsightCard';
import PainChart from '../components/dashboard/PainChart';
import QuickCheckinCard from '../components/dashboard/QuickCheckinCard';
import VisitPrepCard from '../components/dashboard/VisitPrepCard';
import EduCard from '../components/dashboard/EduCard';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TodayDashboard() {
  const { currentProfile, summaryMetrics } = useApp();

  // Dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-content-wrapper">
      {/* Welcome Headline & Supportive Guidance */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                Cycle Day {currentProfile.currentCycleDay} of {currentProfile.typicalCycleLength || 28}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                · {currentProfile.currentPhase}
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              {getGreeting()}, {currentProfile.name.split(' ')[0]}
            </h1>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.5 }}>
              Your body is currently in the <strong>{currentProfile.currentPhase}</strong>. Today is a great day to note any subtle pelvic shifts, energy patterns, or digestive changes.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '0.65rem 1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Logged Days
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-berry)' }}>
                {summaryMetrics.totalLoggedDays}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '0.65rem 1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Avg Pain
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: Number(summaryMetrics.averagePainScore) >= 6 ? 'var(--color-terracotta)' : 'var(--color-sage-dark)' }}>
                {summaryMetrics.averagePainScore || '0'}/10
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Top Row: Cycle Wheel + Latest Insight Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
          
          {/* Cycle Overview Card with Circular Wheel */}
          <div className="saheli-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header-row">
              <div className="card-title">
                <Calendar size={18} color="var(--color-berry)" />
                <span>Cycle Overview & Clock</span>
              </div>
              <span className="badge badge-berry" style={{ fontSize: '0.7rem' }}>
                {currentProfile.daysUntilNextPeriod} days to menses
              </span>
            </div>

            <CycleWheel 
              cycleDay={currentProfile.currentCycleDay}
              totalCycleLength={currentProfile.typicalCycleLength || 29}
              currentPhase={currentProfile.currentPhase}
            />

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Next anticipated flow: in ~{currentProfile.daysUntilNextPeriod} days
              </span>
              <Link to="/calendar" style={{ fontSize: '0.8rem', color: 'var(--color-berry)', fontWeight: 600 }}>
                View Calendar →
              </Link>
            </div>
          </div>

          {/* Latest Evidence-Based Insight Card */}
          <InsightCard />
        </div>

        {/* Middle Row: Quick Check-in + Doctor Visit Prep */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
          {/* Daily Check-in Card */}
          <QuickCheckinCard />

          {/* Visit Preparation Card */}
          <VisitPrepCard />
        </div>

        {/* Pain Across Cycle Chart */}
        <div>
          <PainChart />
        </div>

        {/* Educational Resource Cards */}
        <div>
          <EduCard />
        </div>

        {/* Fictional Sample Data Banner */}
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          border: '1px solid var(--border-card)', 
          borderRadius: '12px', 
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-berry)' }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <strong>Demo Environment:</strong> You are viewing synthetic, clearly labeled sample records for <em>{currentProfile.name}</em> ({currentProfile.primaryPatternFocus}). No personal health information (PHI) is transmitted or stored on cloud servers.
            </div>
          </div>
          <Link to="/settings" className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}>
            Manage Demo Profiles
          </Link>
        </div>

      </div>
    </div>
  );
}
