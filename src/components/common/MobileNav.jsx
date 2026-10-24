import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CalendarCheck, CalendarDays, TrendingUp, Stethoscope, Shield } from 'lucide-react';

export default function MobileNav() {
  const navItems = [
    { to: '/dashboard', label: 'Today', icon: Home },
    { to: '/checkin', label: 'Check-in', icon: CalendarCheck },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/insights', label: 'Trends', icon: TrendingUp },
    { to: '/doctor-visit', label: 'Doctor', icon: Stethoscope },
    { to: '/settings', label: 'Settings', icon: Shield },
  ];

  return (
    <nav
      className="mobile-nav no-print"
      aria-label="Mobile Bottom Navigation"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-card)',
        zIndex: 50,
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 0.25rem',
        boxShadow: '0 -2px 10px rgba(35, 28, 30, 0.05)'
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .mobile-nav {
            display: flex !important;
          }
        }
      `}</style>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem',
              color: isActive ? 'var(--color-berry)' : 'var(--text-muted)',
              fontSize: '0.68rem',
              fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
              padding: '0.35rem 0.5rem',
              borderRadius: '8px',
              backgroundColor: isActive ? 'var(--color-blush)' : 'transparent',
              transition: 'all 0.15s ease'
            })}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
