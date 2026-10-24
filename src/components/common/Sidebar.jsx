import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home, 
  CalendarCheck, 
  CalendarDays, 
  TrendingUp, 
  Stethoscope, 
  Shield, 
  User, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { currentProfile, profileId } = useApp();

  const navItems = [
    { to: '/dashboard', label: 'Today Dashboard', icon: Home },
    { to: '/checkin', label: 'Daily Check-in', icon: CalendarCheck },
    { to: '/calendar', label: 'Cycle Calendar', icon: CalendarDays },
    { to: '/insights', label: 'Insights & Trends', icon: TrendingUp },
    { to: '/doctor-visit', label: 'Doctor Visit Brief', icon: Stethoscope },
    { to: '/settings', label: 'Privacy & Settings', icon: Shield },
  ];

  return (
    <aside 
      className="sidebar no-print"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        padding: '1.25rem 1rem'
      }}
    >
      {/* Brand Logo */}
      <Link 
        to="/" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '0.5rem 0.75rem 1.25rem',
          borderBottom: '1px solid var(--border-card)'
        }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-berry)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 3px 10px var(--color-berry-glow)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7c-2 0-3.5 1.5-3.5 3.5S10 14 12 16c2-2 3.5-3.5 3.5-5.5S14 7 12 7z" fill="#FAF7F2" stroke="none"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-berry)', margin: 0, lineHeight: 1 }}>
            Saheli
          </h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            Clinician Bridge
          </span>
        </div>
      </Link>

      {/* Navigation links */}
      <nav style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, padding: '0.25rem 0.75rem 0.4rem', letterSpacing: '0.05em' }}>
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-berry)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--color-blush)' : 'transparent',
                border: isActive ? '1px solid var(--color-blush-border)' : '1px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} style={{ opacity: 0.9 }} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-card)' }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              transition: 'all 0.15s ease'
            })}
          >
            <Sparkles size={16} />
            <span>Saheli Overview & Intro</span>
          </NavLink>
          <NavLink
            to="/login"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              transition: 'all 0.15s ease'
            })}
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
          gap: '0.4rem'
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
                Age {currentProfile.age}
              </div>
            </div>
          </div>
          <span className="badge badge-berry" style={{ fontSize: '0.65rem' }}>
            Demo
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
          <span style={{ color: 'var(--color-berry)' }}>{currentProfile.currentPhase}</span>
        </div>
      </div>
    </aside>
  );
}
