import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Activity, 
  FileCheck2, 
  HeartHandshake 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const { switchProfile } = useApp();

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner Navigation */}
      <nav 
        style={{
          borderBottom: '1px solid var(--border-card)',
          padding: '1rem 2.5rem',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center' }} aria-label="Home">
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ 
              height: '54px', 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/login" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            Demo Personas
          </Link>
          <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <span>Enter Dashboard</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '4rem 2rem 3rem', maxWidth: '1080px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--color-berry-subtle)', border: '1px solid var(--color-blush-border)', borderRadius: 'var(--radius-full)', padding: '0.35rem 1rem', marginBottom: '1.5rem', color: 'var(--color-berry)', fontSize: '0.82rem', fontWeight: 600 }}>
          <Sparkles size={14} />
          <span>Overcoming the 7–10 Year Women's Health Diagnostic Delay</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.18, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
          Your body tells a continuous story. <br />
          <span style={{ color: 'var(--color-berry)', fontStyle: 'italic' }}>
            We help your clinician hear it.
          </span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
          Saheli transforms ambiguous, dismissed daily symptoms into objective, cycle-synchronized clinical data. Built to turn the standard 15-minute gynecological appointment from a rushed struggle into a collaborative, evidence-backed dialogue.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 1.8rem' }}>
            <span>Explore Live Prototype</span>
            <ArrowRight size={17} />
          </Link>
          <Link to="/checkin" className="btn btn-blush" style={{ fontSize: '1rem', padding: '0.8rem 1.8rem' }}>
            <span>Test Daily Check-in</span>
          </Link>
        </div>

        {/* 3 Interactive Quick Personas */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-card)', padding: '1.75rem', boxShadow: 'var(--shadow-elevated)', textAlign: 'left' }}>
          <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Try Pre-loaded Real-World Case Studies:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <Link 
              to="/dashboard"
              onClick={() => switchProfile('priya')}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'block',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <strong style={{ color: 'var(--color-berry)', fontSize: '0.95rem' }}>Priya, 28</strong>
                <span className="badge badge-berry" style={{ fontSize: '0.65rem' }}>Endometriosis Focus</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Severe dysmenorrhea (pain 8/10), pain with bowel movement, mid-cycle ovulation flare, missed work.
              </p>
            </Link>

            <Link 
              to="/dashboard"
              onClick={() => switchProfile('ananya')}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'block',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <strong style={{ color: 'var(--color-sage-dark)', fontSize: '0.95rem' }}>Ananya, 24</strong>
                <span className="badge badge-sage" style={{ fontSize: '0.65rem' }}>PCOS Focus</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Irregular 35–45 day cycles, stubborn hormonal cystic acne, hirsutism, insulin-related cravings.
              </p>
            </Link>

            <Link 
              to="/dashboard"
              onClick={() => switchProfile('meera')}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'block',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <strong style={{ color: 'var(--color-terracotta-dark)', fontSize: '0.95rem' }}>Meera, 34</strong>
                <span className="badge badge-terracotta" style={{ fontSize: '0.65rem' }}>Anaemia Focus</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Consecutive heavy bleeding, flooding, severe chronic fatigue, cold intolerance, low ferritin.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* The Diagnostic Gap Section */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '4rem 2rem', borderTop: '1px solid var(--border-card)', borderBottom: '1px solid var(--border-card)' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-berry)', fontWeight: 700, letterSpacing: '0.06em' }}>
              The Systematic Reality
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              Why Women's Health Symptoms Get Dismissed
            </h2>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
              The breakdown rarely stems from lack of clinical care—it is a structural communication mismatch between fragmented memory and a 15-minute consultation window.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="saheli-card">
              <div style={{ color: 'var(--color-berry)', marginBottom: '0.75rem' }}>
                <Clock size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>7 to 10 Year Diagnostic Delay</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Endometriosis patients visit an average of 5 clinicians before receiving an accurate diagnostic laparoscopy or ultrasound mapping scan. "Normal period cramps" mask debilitating pathology.
              </p>
            </div>

            <div className="saheli-card">
              <div style={{ color: 'var(--color-terracotta)', marginBottom: '0.75rem' }}>
                <Activity size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>The 15-Minute Consultation Trap</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Under intense schedule pressure, clinicians ask "what brings you in today?" Patients try to summarize months of pain in 90 seconds, leading to isolated acute prescriptions rather than root-cause investigations.
              </p>
            </div>

            <div className="saheli-card">
              <div style={{ color: 'var(--color-sage)', marginBottom: '0.75rem' }}>
                <FileCheck2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Unexplainable "AI" Traps</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Generic wellness apps generate unexplainable "danger scores" that doctors disregard. Saheli provides transparent observational data anchored in published clinical guidelines (ESHRE, ACOG, Rotterdam).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Saheli Bridges the Gap */}
      <section style={{ padding: '4.5rem 2rem', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-berry)', fontWeight: 700, letterSpacing: '0.06em' }}>
            The 3-Step Methodology
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginTop: '0.5rem' }}>
            How Saheli Powers Your Next Doctor Visit
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-berry-subtle)',
              border: '2px solid var(--color-blush-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-berry)',
              margin: '0 auto 1.25rem',
              fontSize: '1.2rem',
              fontWeight: 700
            }}>
              1
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Effortless 30-Sec Check-in</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Track bleeding, 0–10 pain, energy, mood, and functional disability with grouped symptom chips. Built to be fast enough to log consistently without health tracking fatigue.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-sage-light)',
              border: '2px solid var(--color-sage-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-sage-dark)',
              margin: '0 auto 1.25rem',
              fontSize: '1.2rem',
              fontWeight: 700
            }}>
              2
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Cycle-Synced Pattern Detection</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Correlate pain spikes and symptoms across menstrual, follicular, ovulatory, and luteal phases. Uncovers distinct patterns for PCOS, Endometriosis, and Anaemia.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-terracotta-light)',
              border: '2px solid var(--color-terracotta-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-terracotta-dark)',
              margin: '0 auto 1.25rem',
              fontSize: '1.2rem',
              fontWeight: 700
            }}>
              3
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Printable Doctor Brief</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Hand your clinician a high-density, one-page structured summary formatted for a 60-second review. Includes chief complaint framing, disability metrics, and prioritized questions.
            </p>
          </div>
        </div>
      </section>

      {/* Persistent Footer & Disclaimer */}
      <footer style={{ marginTop: 'auto', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-card)', padding: '2.5rem 2rem 1.5rem' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HeartHandshake size={20} color="var(--color-berry)" />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-berry)' }}>
                Saheli
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                — Empowering women and clinicians through structured communication.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/checkin">Check-in</Link>
              <Link to="/doctor-visit">Clinician Brief</Link>
              <Link to="/settings">Privacy & Demo Info</Link>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--border-card)', paddingTop: '1rem' }}>
            <strong>Regulatory & Demonstration Disclosure:</strong> Saheli is a prototype observational diary designed for personal tracking and doctor appointment preparation. It does not provide medical diagnoses, treatment plans, or emergency care. All demonstration rules are unvalidated algorithms based on literature guidelines. Data is stored solely in your local browser sandbox.
          </div>
        </div>
      </footer>
    </div>
  );
}
