import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Calendar, 
  Activity, 
  Stethoscope, 
  ShieldCheck, 
  Menu, 
  X, 
  AlertCircle,
  Lock,
  ChevronRight,
  Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import BrandLogo from '../components/common/BrandLogo';

const CURRENT_YEAR = new Date().getFullYear();

export default function LandingPage() {
  const { switchProfile } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectPersona = (id) => {
    switchProfile(id);
    navigate('/dashboard');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <style>{`
        /* Landing Page Specific Responsive Styles */
        .landing-header {
          padding: 0.85rem 1.75rem;
        }

        .landing-nav-links {
          display: flex;
          align-items: center;
          gap: 1.75rem;
        }

        .landing-mobile-menu-btn {
          display: none;
        }

        /* Hero 2-Column Desktop Grid */
        .hero-layout {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 3.5rem;
          align-items: center;
          padding: 4.5rem 2rem 4rem;
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
        }

        .hero-copy-col {
          text-align: left;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background-color: var(--color-berry-subtle);
          border: 1px solid var(--color-blush-border);
          border-radius: var(--radius-full);
          padding: 0.35rem 0.9rem;
          margin-bottom: 1.25rem;
          color: var(--color-berry);
          font-size: 0.8rem;
          font-weight: 600;
          max-width: 100%;
          line-height: 1.4;
        }

        .hero-title {
          font-family: var(--font-serif);
          font-size: clamp(1.75rem, 5vw + 0.4rem, 3.25rem);
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.18;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
          word-break: break-word;
        }

        .hero-title em {
          font-style: italic;
          color: var(--color-berry);
        }

        .hero-cta-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2.25rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .privacy-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 2.5rem;
        }

        @media (max-width: 1024px) {
          .hero-layout {
            grid-template-columns: 1fr;
            gap: 2.5rem;
            padding: 3rem 1.5rem 3.5rem;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .steps-grid {
            grid-template-columns: 1fr;
          }
          .privacy-grid {
            grid-template-columns: 1fr;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .landing-header {
            padding: 0.65rem 1rem !important;
          }
          .landing-nav-links {
            display: none !important;
          }
          .landing-mobile-menu-btn {
            display: inline-flex !important;
          }
          .hero-layout {
            padding: 2rem 1.25rem 3rem;
            gap: 2rem;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 480px) {
          .landing-header {
            padding: 0.65rem 1rem !important;
          }
          .hero-cta-group {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          .hero-cta-group .btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* 1. Minimal Top Navigation */}
      <header 
        className="landing-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          backgroundColor: 'rgba(250, 247, 242, 0.94)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border-card)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          
          {/* Brand Logo & Wordmark */}
          <BrandLogo to="/" size="md" />

          {/* Minimal Navigation Links: Features, How It Works, Privacy, Sign In, Get Started */}
          <nav className="landing-nav-links">
            <a 
              href="#features" 
              style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}
            >
              How It Works
            </a>
            <a 
              href="#privacy" 
              style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}
            >
              Privacy & Trust
            </a>
            <Link 
              to="/login" 
              style={{ fontSize: '0.9rem', color: 'var(--color-berry)', fontWeight: 600 }}
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="btn btn-primary" 
              style={{ fontSize: '0.86rem', padding: '0.55rem 1.35rem' }}
            >
              <span>Get Started</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="landing-mobile-menu-btn"
            aria-label="Toggle navigation menu"
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border-card)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              minHeight: '44px',
              minWidth: '44px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div 
            style={{
              backgroundColor: 'var(--bg-card)',
              borderBottom: '1px solid var(--border-card)',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500, padding: '0.35rem 0' }}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500, padding: '0.35rem 0' }}
            >
              How It Works
            </a>
            <a 
              href="#privacy" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500, padding: '0.35rem 0' }}
            >
              Privacy & Trust
            </a>
            <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary" 
                style={{ flex: 1, fontSize: '0.9rem', minHeight: '44px' }}
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary" 
                style={{ flex: 1, fontSize: '0.9rem', minHeight: '44px' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section: Refined Two-Column Editorial Layout */}
      <section className="hero-layout">
        
        {/* Left Column: Left-aligned editorial copy & CTAs */}
        <div className="hero-copy-col">
          <div className="hero-badge">
            <Activity size={14} style={{ flexShrink: 0 }} />
            <span>Symptom-to-Clinician Bridge for Women's Health</span>
          </div>

          <h1 className="hero-title">
            Understand your cycle. <br />
            <em>Find your voice.</em>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '540px' }}>
            A calmer way to track your cycle, understand patterns, and prepare for conversations about your health.
          </p>

          <div className="hero-cta-group">
            <Link 
              to="/signup" 
              className="btn btn-primary" 
              style={{ fontSize: '0.98rem', padding: '0.75rem 1.85rem', minHeight: '44px' }}
            >
              <span>Get Started</span>
              <ArrowRight size={17} />
            </Link>
            <a 
              href="#features" 
              className="btn btn-secondary" 
              style={{ fontSize: '0.98rem', padding: '0.75rem 1.75rem', minHeight: '44px' }}
            >
              <span>Explore Features</span>
            </a>
          </div>

          {/* Quick Pre-loaded Clinical Scenarios for Live Testing */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '1rem 1.15rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Test Live Clinical Scenarios:
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Click to explore in dashboard
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleSelectPersona('amara')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', backgroundColor: '#FFFFFF' }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-berry)' }} />
                <span>Amara (Endometriosis)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPersona('ananya')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', backgroundColor: '#FFFFFF' }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-sage-dark)' }} />
                <span>Ananya (PCOS)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPersona('meera')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', backgroundColor: '#FFFFFF' }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-terracotta)' }} />
                <span>Meera (Menorrhagia)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Carefully Designed Preview of the Actual Saheli Dashboard */}
        <div 
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-elevated)',
            width: '100%',
            minWidth: 0
          }}
        >
          {/* Subtle Browser / App Bar */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.7rem 1.15rem', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#D8CEC5' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#D8CEC5' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#D8CEC5' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '0.45rem', fontWeight: 500 }}>
                saheli.health/dashboard
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="badge badge-berry" style={{ fontSize: '0.66rem' }}>
                Day 18 of ~29d
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                · Luteal Phase
              </span>
            </div>
          </div>

          {/* Inner Simulated Workspace Content */}
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Top Workspace Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Good afternoon, Amara
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>
                  Correlating pelvic symptoms and flow across 172 diary days.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.35rem 0.65rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Logged Days</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-berry)' }}>172</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.35rem 0.65rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Pain</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-terracotta)' }}>6.8/10</div>
                </div>
              </div>
            </div>

            {/* Pattern Insight Card */}
            <div className="saheli-card" style={{ padding: '1.15rem', borderLeft: '3.5px solid var(--color-berry)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span className="badge badge-berry" style={{ fontSize: '0.65rem' }}>
                  Strong Pattern Identified
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ESHRE / ACOG Basis
                </span>
              </div>

              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                Severe Cyclical Pelvic Pain & Dysmenorrhea
              </h4>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                Cyclic pain peaking at 7–8/10 on days 1–3 of menses, catamenial bowel symptoms, and 6 missed work days.
              </p>
            </div>

            {/* SVG Pain Trajectory Chart Preview */}
            <div className="saheli-card" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Activity size={15} color="var(--color-berry)" />
                  <strong style={{ fontSize: '0.85rem' }}>Pain Across Cycle Days</strong>
                </div>
                <span className="badge badge-terracotta" style={{ fontSize: '0.62rem' }}>Severe Peak ≥ 7</span>
              </div>

              <div style={{ height: '90px', width: '100%', position: 'relative' }}>
                <svg viewBox="0 0 380 90" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <line x1="0" y1="28" x2="380" y2="28" stroke="var(--color-terracotta)" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="325" y="24" fill="var(--color-terracotta)" fontSize="8.5" fontWeight="600">Severe (7+)</text>
                  
                  {/* Pain Curve Area */}
                  <path 
                    d="M 10 16 Q 30 20, 50 28 T 100 70 T 180 65 Q 200 36, 220 68 T 320 72 T 370 72 L 370 85 L 10 85 Z" 
                    fill="var(--color-blush)" 
                    opacity="0.55" 
                  />
                  <path 
                    d="M 10 16 Q 30 20, 50 28 T 100 70 T 180 65 Q 200 36, 220 68 T 320 72 T 370 72" 
                    fill="none" 
                    stroke="var(--color-berry)" 
                    strokeWidth="2.2" 
                  />
                  
                  {/* Dots on key days */}
                  <circle cx="10" cy="16" r="3.5" fill="var(--color-berry)" />
                  <circle cx="50" cy="28" r="3.5" fill="var(--color-berry)" />
                  <circle cx="200" cy="36" r="3.5" fill="var(--color-berry)" />
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>Day 1–3: Menses (Peak 8/10)</span>
                <span>Day 14: Mid-cycle</span>
                <span>Day 28: Luteal</span>
              </div>
            </div>

            {/* Clinician Brief Ready Card */}
            <div className="saheli-card" style={{ padding: '1rem', backgroundColor: '#FFFFFF', border: '1px solid var(--color-blush-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Stethoscope size={16} color="var(--color-berry)" />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--color-berry)' }}>Doctor Brief Ready</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1-page summary formatted for a 60-second clinician review</div>
                  </div>
                </div>

                <Link to="/doctor-visit" className="btn btn-primary" style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem' }}>
                  <Printer size={12} />
                  <span>View Brief</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 3. Three Core Feature Sections */}
      <section id="features" style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 1.5rem', borderTop: '1px solid var(--border-card)', borderBottom: '1px solid var(--border-card)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-berry)', fontWeight: 700, letterSpacing: '0.06em' }}>
              Features
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginTop: '0.4rem', color: 'var(--text-primary)' }}>
              Designed for Patients, Respected by Clinicians
            </h2>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
              Three purposeful capabilities built to turn daily health tracking into collaborative clinician dialogue.
            </p>
          </div>

          <div className="features-grid">
            
            {/* Feature 1: Track */}
            <div className="saheli-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-berry-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-berry)',
                  marginBottom: '1.25rem'
                }}>
                  <Calendar size={22} />
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                  Track Symptoms & Daily Changes
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Log bleeding volume, a clinically anchored 0–10 pain scale, functional disability (missed work, bed rest), and grouped symptom chips in 30 seconds.
                </p>

                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>Bleeding selector (None, Spotting, Light, Medium, Heavy)</li>
                  <li>0–10 numeric scale with clinical descriptors</li>
                  <li>Functional disruption tracking for missed work or bed rest</li>
                  <li>Vitality and mood indices across cycle phases</li>
                </ul>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-card)' }}>
                <Link to="/checkin" style={{ fontSize: '0.84rem', color: 'var(--color-berry)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Open Daily Check-in Form</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* Feature 2: Understand */}
            <div className="saheli-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-sage-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-sage-dark)',
                  marginBottom: '1.25rem'
                }}>
                  <Activity size={22} />
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                  Understand Cycle Patterns
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Review recorded information and observe patterns over time. Analyzed against published clinical guidelines (ESHRE, ACOG, Rotterdam) for endometriosis, PCOS, and menorrhagia.
                </p>

                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>Traceable criteria with sample sizes and date ranges</li>
                  <li>Pain trajectory mapped against 7/10 severe threshold</li>
                  <li>Menstrual flow volume and ferritin risk markers</li>
                  <li>Cautious, non-diagnostic clinician talking points</li>
                </ul>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-card)' }}>
                <Link to="/insights" style={{ fontSize: '0.84rem', color: 'var(--color-berry)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>View Symptom Trends</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* Feature 3: Prepare */}
            <div className="saheli-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-terracotta-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-terracotta-dark)',
                  marginBottom: '1.25rem'
                }}>
                  <Stethoscope size={22} />
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                  Prepare for Clinician Visits
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Organize personal notes, symptom history, and prioritized questions into a high-density, printable A4 one-page brief tailored for a 60-second doctor review.
                </p>

                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>Executive chief complaint framing and biometrics</li>
                  <li>Interactive question builder (add, edit, reorder)</li>
                  <li>Acute red-flag verification checklist</li>
                  <li>Print-ready A4 PDF layout with consent controls</li>
                </ul>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-card)' }}>
                <Link to="/doctor-visit" style={{ fontSize: '0.84rem', color: 'var(--color-berry)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Inspect Clinician Brief</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Simple Three-Step User Journey */}
      <section id="how-it-works" style={{ padding: '5rem 1.5rem', maxWidth: '1160px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-berry)', fontWeight: 700, letterSpacing: '0.06em' }}>
            How It Works
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginTop: '0.4rem', color: 'var(--text-primary)' }}>
            Three Steps to an Evidence-Backed Visit
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
            A structured workflow turning daily entries into a productive medical consultation.
          </p>
        </div>

        <div className="steps-grid">
          
          {/* Step 1 */}
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
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
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Record Your Cycle & Symptoms
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Quick, structured check-ins for menstrual flow, pain severity, vitality, and functional impact. Built to prevent tracking burnout.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
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
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Review Personal Tracking History
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Visual charts correlate pain spikes and fatigue with cycle phases, highlighting objective trends documented over multiple cycles.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
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
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Prepare Notes & Questions for Your Visit
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Print a clean, one-page A4 clinician brief. Walk into your 15-minute consultation prepared with organized data and prioritized questions.
            </p>
          </div>

        </div>
      </section>

      {/* 5. Privacy & Responsible Health Information Section */}
      <section id="privacy" style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 1.5rem', borderTop: '1px solid var(--border-card)', borderBottom: '1px solid var(--border-card)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-berry)', fontWeight: 700, letterSpacing: '0.06em' }}>
              Privacy & Trust
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginTop: '0.4rem', color: 'var(--text-primary)' }}>
              Privacy, Accuracy & Non-Diagnostic Scope
            </h2>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
              Saheli is built on transparent principles. We do not make medical diagnoses or monetize personal health data.
            </p>
          </div>

          <div className="privacy-grid">
            
            <div className="saheli-card">
              <div style={{ color: 'var(--color-berry)', marginBottom: '0.85rem' }}>
                <Lock size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                Local-First Browser Storage
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                All symptom entries and notes are stored strictly in your browser’s local storage (<code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 5px', borderRadius: '4px' }}>localStorage</code>). No personal health information is transmitted to remote servers.
              </p>
            </div>

            <div className="saheli-card">
              <div style={{ color: 'var(--color-amber-dark)', marginBottom: '0.85rem' }}>
                <AlertCircle size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                Informational, Not Diagnostic
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Pattern indicators reflect observational criteria from published literature (ACOG, ESHRE, FIGO) to facilitate doctor-patient dialogue. Saheli does not provide medical diagnoses or prescribe treatment.
              </p>
            </div>

            <div className="saheli-card">
              <div style={{ color: 'var(--color-sage-dark)', marginBottom: '0.85rem' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                Complete Data Ownership
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                You control your records entirely. Export your complete health diary as an open JSON file at any time, import backups, or delete all stored data from your device with a single click.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Clear Final Call to Action */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        <div 
          className="saheli-card"
          style={{ 
            padding: '3.5rem 2.5rem', 
            border: '1.5px solid var(--color-blush-border)',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-elevated)'
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-berry)', marginBottom: '0.85rem' }}>
            Transform Your Next 15-Minute Visit
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Start logging your cycle symptoms today or test a pre-configured clinical scenario in the live workspace.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{ fontSize: '0.98rem', padding: '0.75rem 2rem', minHeight: '44px' }}>
              <span>Get Started Free</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="btn btn-secondary" style={{ fontSize: '0.98rem', padding: '0.75rem 1.75rem', minHeight: '44px' }}>
              <span>Open Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Complete Footer */}
      <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-card)', padding: '4rem 1.5rem 2rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          
          <div className="footer-grid" style={{ marginBottom: '3rem' }}>
            
            {/* Col 1: Brand & Logo */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <BrandLogo to="/" size="md" />
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '300px' }}>
                Symptom-to-Clinician Bridge for Women's Health. Converting daily symptom logs into cycle-synchronized clinical evidence for productive consultations.
              </p>
            </div>

            {/* Col 2: Product */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Application
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <Link to="/dashboard">Today Dashboard</Link>
                <Link to="/checkin">Daily Check-in</Link>
                <Link to="/calendar">Cycle Calendar</Link>
                <Link to="/insights">Insights & Trends</Link>
                <Link to="/doctor-visit">Doctor Visit Brief</Link>
              </div>
            </div>

            {/* Col 3: Navigation */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Navigation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#privacy">Privacy & Trust</a>
                <Link to="/login">Sign In</Link>
                <Link to="/signup">Get Started</Link>
              </div>
            </div>

            {/* Col 4: Privacy & Data */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Privacy & Data
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <Link to="/settings">Data Management</Link>
                <Link to="/settings">Local Storage Disclosure</Link>
                <Link to="/login">Demo Personas</Link>
              </div>
            </div>

          </div>

          {/* Medical Notice & Copyright */}
          <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '1.5rem', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Medical Disclaimer:</strong> Saheli is an observational symptom diary and patient advocacy communication aid, not a diagnostic medical device. Pattern recognition algorithms are demonstration rules based on clinical literature guidelines (ESHRE, ACOG, FIGO) and are unvalidated by formal clinical trials. Saheli does not provide medical diagnoses, treatment plans, or emergency care. Always seek the advice of a qualified healthcare provider with questions regarding a medical condition.
            </p>
            <p style={{ margin: 0 }}>
              © {CURRENT_YEAR} Saheli Women's Health. Stored locally in your browser sandbox.
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}
