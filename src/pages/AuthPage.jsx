import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthPage({ isSignUp = false }) {
  const [activeTab, setActiveTab] = useState(isSignUp ? 'signup' : 'login');
  const [email, setEmail] = useState('priya.sharma@demo.saheli.health');
  const [password, setPassword] = useState('demo-password-123');
  const [name, setName] = useState('Priya Sharma');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { switchProfile, showToast, currentProfile } = useApp();
  const navigate = useNavigate();

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'signup' && !name.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }
    if (!email.trim() || !password.trim()) {
      showToast('Please enter email and password', 'error');
      return;
    }

    showToast(`Welcome back, ${activeTab === 'signup' ? name : currentProfile.name}! Entered demo workspace.`);
    navigate('/dashboard');
  };

  const handleSelectPersona = (id) => {
    switchProfile(id);
    navigate('/dashboard');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border-card)', backgroundColor: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center' }} aria-label="Home">
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ 
              height: '52px', 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </Link>
        <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
          Skip to Dashboard →
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
        <div style={{ maxWidth: '480px', width: '100%' }}>
          
          {/* Demo Sandbox Alert */}
          <div style={{ 
            backgroundColor: 'var(--color-berry-subtle)', 
            border: '1px solid var(--color-blush-border)', 
            borderRadius: '12px', 
            padding: '0.85rem 1rem', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <ShieldCheck size={20} color="var(--color-berry)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--color-berry)', lineHeight: 1.4 }}>
              <strong>Interactive Demo Sandbox:</strong> All data is stored in your local browser storage. No real email or password is sent to external servers.
            </div>
          </div>

          <div className="saheli-card" style={{ padding: '2rem' }}>
            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-full)', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'login' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'login' ? 'var(--color-berry)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'login' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'signup' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'signup' ? 'var(--color-berry)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'signup' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Create Account
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.45rem', marginBottom: '0.35rem' }}>
                {activeTab === 'login' ? 'Welcome Back to Saheli' : 'Begin Your Symptom Diary'}
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {activeTab === 'login' 
                  ? 'Access your cycle logs, pattern insights, and doctor briefing.'
                  : 'Start tracking daily symptoms to bridge the conversation with your clinician.'}
              </p>
            </div>

            {/* Quick Demo Persona One-Click Logins */}
            <div style={{ marginBottom: '1.5rem', padding: '0.85rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={13} color="var(--color-berry)" />
                <span>Instant Demo Logins:</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => handleSelectPersona('priya')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.76rem', padding: '0.45rem 0.5rem', justifyContent: 'flex-start' }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-berry)' }} />
                  Priya (Endo)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPersona('ananya')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.76rem', padding: '0.45rem 0.5rem', justifyContent: 'flex-start' }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-sage)' }} />
                  Ananya (PCOS)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPersona('meera')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.76rem', padding: '0.45rem 0.5rem', justifyContent: 'flex-start' }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-terracotta)' }} />
                  Meera (Anaemia)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPersona('guest')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.76rem', padding: '0.45rem 0.5rem', justifyContent: 'flex-start' }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                  Guest (Blank)
                </button>
              </div>
            </div>

            {/* Standard Form */}
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeTab === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border-card)',
                        backgroundColor: 'var(--bg-primary)'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-card)',
                      backgroundColor: 'var(--bg-primary)'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.25rem 0.65rem 2.25rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-card)',
                      backgroundColor: 'var(--bg-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', padding: '2px' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--color-berry)' }}
                  />
                  <span>Keep me signed in locally</span>
                </label>
                <button type="button" onClick={() => showToast('Demo note: Local password recovery not needed.', 'info')} style={{ color: 'var(--color-berry)' }}>
                  Forgot?
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.92rem' }}
              >
                <span>{activeTab === 'login' ? 'Enter Demo Workspace' : 'Create Local Profile'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Saheli Local Prototype · Clinical Bridge for Women's Health
          </div>
        </div>
      </div>
    </div>
  );
}
