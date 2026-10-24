import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  User, 
  Save 
} from 'lucide-react';

export default function PrivacySettingsPage() {
  const { 
    currentProfile, 
    updateProfile, 
    exportDataJSON, 
    importDataJSON, 
    resetToFactorySampleData, 
    clearAllData, 
    setIsUrgentModalOpen,
    setIsDisclaimerModalOpen 
  } = useApp();

  // Local state for editable user preferences
  const [name, setName] = useState(currentProfile.name);
  const [age, setAge] = useState(currentProfile.age);
  const [cycleLength, setCycleLength] = useState(currentProfile.typicalCycleLength || 28);
  const [periodLength, setPeriodLength] = useState(currentProfile.typicalPeriodLength || 5);
  const [doctorName, setDoctorName] = useState(currentProfile.doctorName || '');
  const [visitDate, setVisitDate] = useState(currentProfile.upcomingVisitDate || '');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      age: Number(age),
      typicalCycleLength: Number(cycleLength),
      typicalPeriodLength: Number(periodLength),
      doctorName,
      upcomingVisitDate: visitDate
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        importDataJSON(content);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all stored logs and reset your browser storage? This cannot be undone.')) {
      clearAllData();
    }
  };

  return (
    <div className="page-content-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
            System Architecture & Data Control
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
          Privacy, Storage & Preferences
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Complete transparency over where your data resides, demo backups, and consultation profile settings.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Transparency & Security Architecture Disclosure */}
        <div className="saheli-card" style={{ borderLeft: '4px solid var(--color-berry)' }}>
          <div className="card-header-row">
            <div className="card-title">
              <ShieldCheck size={20} color="var(--color-berry)" />
              <span>Data Architecture & Privacy Transparency</span>
            </div>
            <span className="badge badge-berry">Local-First Sandbox</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p>
              <strong>Honest Privacy Commitment:</strong> Saheli is built as a client-side prototype. All entries you record are stored strictly inside your browser's local sandbox (via HTML5 <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>localStorage</code>).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <h4 style={{ color: 'var(--color-berry)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  No Remote Cloud Database
                </h4>
                <p style={{ fontSize: '0.8rem' }}>
                  Zero personal symptoms or cycle dates are transmitted over the internet to remote servers or third-party trackers.
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <h4 style={{ color: 'var(--color-berry)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  Not a Certified EHR System
                </h4>
                <p style={{ fontSize: '0.8rem' }}>
                  We do not falsely claim HIPAA or GDPR certified cloud encryption. Browser storage is accessible by anyone who has physical access to this computer.
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <h4 style={{ color: 'var(--color-berry)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  100% Exportable & Erasable
                </h4>
                <p style={{ fontSize: '0.8rem' }}>
                  You own your data completely. You can export your full health diary as a JSON file anytime or clear it with a single click.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Profile Preferences Form */}
        <div className="saheli-card">
          <div className="card-header-row">
            <div className="card-title">
              <User size={18} color="var(--color-berry)" />
              <span>Consultation Profile Preferences</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Updates Clinician Brief
            </span>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Patient Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-card)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-card)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Typical Cycle Duration (Days)
                </label>
                <input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-card)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Typical Menses Duration (Days)
                </label>
                <input
                  type="number"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-card)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Clinician / Practice Name
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Sunita Rao, MD (OB/GYN)"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-card)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Upcoming Appointment Date
                </label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-card)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-card)' }}>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.88rem' }}>
                <Save size={15} />
                <span>Save Profile Preferences</span>
              </button>
            </div>
          </form>
        </div>

        {/* Data Management & Backup Controls */}
        <div className="saheli-card">
          <div className="card-header-row">
            <div className="card-title">
              <Download size={18} color="var(--color-berry)" />
              <span>Data Export, Import & Sample Data Reset</span>
            </div>
            <span className="badge badge-berry">JSON Control</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            
            {/* Export */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Export Health Diary</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Download all your recorded symptom entries, pain logs, and notes as a portable JSON file.
                </p>
              </div>
              <button onClick={exportDataJSON} className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
                <Download size={14} /> Download Diary Backup
              </button>
            </div>

            {/* Import */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Import Health Diary</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Restore previously exported Saheli JSON backup files to your browser session.
                </p>
              </div>
              <label className="btn btn-outline" style={{ fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center' }}>
                <Upload size={14} /> Select JSON File
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Reset to Factory Sample Data */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Reset Sample Personas</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Restore the initial rich demonstration data for Priya (Endo), Ananya (PCOS), and Meera (Anaemia).
                </p>
              </div>
              <button onClick={resetToFactorySampleData} className="btn btn-blush" style={{ fontSize: '0.82rem' }}>
                <RotateCcw size={14} /> Reset Demo Data
              </button>
            </div>

            {/* Danger Zone: Clear Local Storage */}
            <div style={{ backgroundColor: '#FCF1EE', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E8ACA0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', marginBottom: '0.4rem', color: '#9C4532' }}>Clear All Local Logs</h4>
                <p style={{ fontSize: '0.8rem', color: '#5C2419', marginBottom: '1rem' }}>
                  Erase all recorded entries, symptom chips, and notes from this browser.
                </p>
              </div>
              <button 
                onClick={handleClearAll}
                className="btn btn-urgent"
                style={{ fontSize: '0.82rem', padding: '0.5rem' }}
              >
                <Trash2 size={14} /> Wipe Local Storage
              </button>
            </div>

          </div>
        </div>

        {/* Clinical Disclaimer & Urgent Care Quick Modals */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '1.25rem 1.75rem', borderRadius: '14px', border: '1px solid var(--border-card)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Medical & Regulatory Scope Reference</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Review our full medical disclaimer, clinical guidelines, and urgent care red flags.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setIsUrgentModalOpen(true)} className="btn btn-urgent" style={{ fontSize: '0.82rem' }}>
              Urgent Care Guide
            </button>
            <button onClick={() => setIsDisclaimerModalOpen(true)} className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
              Full Medical Disclaimer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
