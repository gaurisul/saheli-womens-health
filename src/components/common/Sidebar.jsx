import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home, 
  CalendarCheck, 
  CalendarDays, 
  TrendingUp, 
  Stethoscope, 
  Shield, 
  X,
  User,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import BrandLogo from './BrandLogo';

export default function Sidebar() {
  const { currentProfile, profileId, isMobileNavDrawerOpen, setIsMobileNavDrawerOpen } = useApp();

  const navItems = [
    { to: '/dashboard', label: 'Today Dashboard', icon: Home },
    { to: '/checkin', label: 'Daily Check-in', icon: CalendarCheck },
    { to: '/calendar', label: 'Cycle Calendar', icon: CalendarDays },
    { to: '/insights', label: 'Insights & Trends', icon: TrendingUp },
    { to: '/doctor-visit', label: 'Doctor Visit Brief', icon: Stethoscope },
    { to: '/settings', label: 'Privacy & Settings', icon: Shield },
  ];

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileNavDrawerOpen) {
        setIsMobileNavDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavDrawerOpen, setIsMobileNavDrawerOpen]);

  const handleNavClick = () => {
    if (isMobileNavDrawerOpen) {
      setIsMobileNavDrawerOpen(false);
    }
  };

  const sidebarContent = (
    <aside 
      className={`sidebar-nav-container ${isMobileNavDrawerOpen ? 'drawer-open' : ''} no-print`}
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        padding: '1.25rem 1rem'
      }}
    >
      {/* Brand Logo & Mobile Close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-card)', paddingBottom: '1rem' }}>
        <BrandLogo 
          to="/" 
          onClick={handleNavClick}
          size="sidebar"
        />

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileNavDrawerOpen(false)}
          className="mobile-close-btn"
          aria-label="Close navigation menu"
          style={{
            display: 'none',
            padding: '0.4rem',
            borderRadius: '8px',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation links */}
      <nav style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, padding: '0.25rem 0.75rem 0.4rem', letterSpacing: '0.06em' }}>
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-berry)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--color-blush)' : 'transparent',
                border: isActive ? '1px solid var(--color-blush-border)' : '1px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, padding: '0.25rem 0.75rem 0.4rem', letterSpacing: '0.06em' }}>
            Reference & Demos
          </div>
          <NavLink
            to="/"
            onClick={handleNavClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={16} />
            <span>Saheli Overview & Intro</span>
          </NavLink>
          <NavLink
            to="/login"
            onClick={handleNavClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={16} />
            <span>Demo Auth & Personas</span>
          </NavLink>
        </div>
      </nav>

      {/* Patient Profile Card at bottom of sidebar */}
      <div 
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          marginTop: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-berry)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {currentProfile.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {currentProfile.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {currentProfile.age ? `Age ${currentProfile.age}` : 'Personal Diary'}
              </div>
            </div>
          </div>
          <span className="badge badge-berry" style={{ fontSize: '0.65rem' }}>
            {profileId === 'guest' ? 'Private' : 'Demo'}
          </span>
        </div>

        <div style={{ 
          fontSize: '0.74rem', 
          color: 'var(--text-secondary)', 
          marginTop: '0.2rem',
          paddingTop: '0.4rem',
          borderTop: '1px dashed var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Cycle Day <strong>{currentProfile.currentCycleDay}</strong></span>
          <span style={{ color: 'var(--color-berry)', fontWeight: 500 }}>{currentProfile.currentPhase}</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <style>{`
        /* Desktop Fixed Sidebar */
        .sidebar-nav-container {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
        }

        /* Mobile / Tablet off-canvas drawer */
        @media (max-width: 900px) {
          .sidebar-nav-container {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 0 25px rgba(0,0,0,0.15);
            max-width: 290px;
            width: 82vw !important;
          }

          .sidebar-nav-container.drawer-open {
            transform: translateX(0);
          }

          .mobile-close-btn {
            display: inline-flex !important;
          }
        }
      `}</style>

      {/* Mobile Backdrop Overlay */}
      {isMobileNavDrawerOpen && (
        <div 
          onClick={() => setIsMobileNavDrawerOpen(false)}
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(35, 28, 30, 0.45)',
            zIndex: 99,
            backdropFilter: 'blur(2px)'
          }}
          aria-hidden="true"
        />
      )}

      {sidebarContent}
    </>
  );
}
