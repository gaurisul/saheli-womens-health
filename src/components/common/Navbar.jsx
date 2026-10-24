import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  HelpCircle, 
  PlusCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { 
    profileId, 
    switchProfile, 
    setIsUrgentModalOpen, 
    setIsDisclaimerModalOpen 
  } = useApp();

  return (
    <header 
      className="top-navbar no-print"
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Brand area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-berry) 0%, var(--color-berry-dark) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px var(--color-berry-glow)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
              <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6z" fill="#FAF7F2" stroke="none"/>
              <circle cx="12" cy="12" r="2.5" fill="#6B1D3A"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-berry)', lineHeight: 1.1 }}>
              Saheli
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Clinician Bridge
            </div>
          </div>
        </Link>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Urgent Care Alert Button */}
        <button
          onClick={() => setIsUrgentModalOpen(true)}
          className="btn btn-urgent"
          title="Clinical Red Flags & Urgent Care Guidance"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ShieldAlert size={15} />
          <span style={{ display: 'none', md: 'inline' }}>Urgent Care</span>
        </button>

        {/* Disclaimer Link */}
        <button
          onClick={() => setIsDisclaimerModalOpen(true)}
          className="btn btn-outline"
          style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
          title="Medical Disclaimer & Scope"
        >
          <HelpCircle size={15} />
          <span style={{ display: 'none', md: 'inline' }}>Disclaimer</span>
        </button>

        {/* Persona quick switch */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={profileId}
            onChange={(e) => switchProfile(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--color-berry-subtle)',
              color: 'var(--color-berry)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              appearance: 'auto'
            }}
            title="Switch Demo Patient Profile"
          >
            <option value="priya">Priya (Endometriosis Pattern)</option>
            <option value="ananya">Ananya (PCOS Pattern)</option>
            <option value="meera">Meera (Anaemia Pattern)</option>
            <option value="guest">Guest User (Blank Diary)</option>
          </select>
        </div>

        {/* Fast Check-in CTA button */}
        <Link 
          to="/checkin" 
          className="btn btn-primary"
          style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
        >
          <PlusCircle size={15} />
          <span>Log Symptoms</span>
        </Link>
      </div>
    </header>
  );
}
