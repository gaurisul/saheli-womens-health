import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  HelpCircle, 
  PlusCircle,
  Menu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { 
    profileId, 
    switchProfile, 
    setIsUrgentModalOpen, 
    setIsDisclaimerModalOpen,
    setIsMobileNavDrawerOpen
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
        padding: '0 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <style>{`
        .navbar-mobile-toggle {
          display: none;
        }
        .navbar-brand-desktop {
          display: flex;
        }
        .navbar-btn-text {
          display: inline;
        }
        @media (max-width: 900px) {
          .top-navbar {
            padding: 0 1rem !important;
          }
          .navbar-mobile-toggle {
            display: inline-flex !important;
          }
          .navbar-brand-desktop {
            display: none !important;
          }
          .navbar-btn-text {
            display: none !important;
          }
        }
      `}</style>

      {/* Left Area: Mobile Drawer Toggle + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setIsMobileNavDrawerOpen(true)}
          className="navbar-mobile-toggle"
          aria-label="Open navigation menu"
          style={{
            padding: '0.45rem',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-card)'
          }}
        >
          <Menu size={20} />
        </button>

        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            textDecoration: 'none'
          }}
          aria-label="Home"
        >
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ 
              height: '44px', 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </Link>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Urgent Care Alert Button */}
        <button
          onClick={() => setIsUrgentModalOpen(true)}
          className="btn btn-urgent"
          title="Clinical Red Flags & Urgent Care Guidance"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ShieldAlert size={15} />
          <span className="navbar-btn-text">Urgent Care</span>
        </button>

        {/* Disclaimer Link */}
        <button
          onClick={() => setIsDisclaimerModalOpen(true)}
          className="btn btn-outline"
          style={{ fontSize: '0.8rem', padding: '0.38rem 0.75rem' }}
          title="Medical Disclaimer & Scope"
        >
          <HelpCircle size={15} />
          <span className="navbar-btn-text">Disclaimer</span>
        </button>

        {/* Persona quick switch */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={profileId}
            onChange={(e) => switchProfile(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-card)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              appearance: 'auto',
              maxWidth: '180px'
            }}
            title="Switch Demo Persona or Personal Diary"
            aria-label="Active patient profile selector"
          >
            <option value="amara">Amara (Endo & Iron Deficiency)</option>
            <option value="priya">Priya (Endometriosis Pattern)</option>
            <option value="ananya">Ananya (PCOS Pattern)</option>
            <option value="meera">Meera (Menorrhagia Pattern)</option>
            <option value="guest">Private Diary (Blank)</option>
          </select>
        </div>

        {/* Fast Check-in CTA button */}
        <Link 
          to="/checkin" 
          className="btn btn-primary"
          style={{ fontSize: '0.82rem', padding: '0.42rem 0.95rem' }}
        >
          <PlusCircle size={15} />
          <span className="navbar-btn-text">Log Symptoms</span>
        </Link>
      </div>
    </header>
  );
}
