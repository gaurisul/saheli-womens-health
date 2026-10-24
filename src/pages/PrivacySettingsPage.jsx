import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  User,
  Save,
  Lock,
  AlertTriangle,
  RefreshCw,
  Mic
} from 'lucide-react';

export default function PrivacySettingsPage() {
  const {
    currentProfile,
    updateProfile,
    exportDataJSON,
    importDataJSON,
    resetToFactorySampleData,
    clearAllData,
    profileId
  } = useApp();

  // Local state for editable user preferences
  const [name, setName] = useState(currentProfile.name || '');
  const [age, setAge] = useState(currentProfile.age || '');
  const [cycleLength, setCycleLength] = useState(currentProfile.typicalCycleLength || 28);
  const [periodLength, setPeriodLength] = useState(currentProfile.typicalPeriodLength || 5);
  const [doctorName, setDoctorName] = useState(currentProfile.doctorName || '');
  const [visitDate, setVisitDate] = useState(currentProfile.upcomingVisitDate || '');

  // Keep local state in sync when profile switches
  useEffect(() => {
    setName(currentProfile.name || '');
    setAge(currentProfile.age || '');
    setCycleLength(currentProfile.typicalCycleLength || 28);
    setPeriodLength(currentProfile.typicalPeriodLength || 5);
    setDoctorName(currentProfile.doctorName || '');
    setVisitDate(currentProfile.upcomingVisitDate || '');
  }, [profileId, currentProfile]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      age: age ? Number(age) : '',
      typicalCycleLength: Number(cycleLength),
      typicalPeriodLength: Number(periodLength),
      doctorName,
      upcomingVisitDate: visitDate
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Import diary records from "${file.name}"? This will restore and update entries in your browser's local diary.`)) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        importDataJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all demonstration profiles (Amara, Priya, Ananya, Meera) back to initial default values? Any edits to demo profiles will be reset.')) {
      resetToFactorySampleData();
    }
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
          Complete transparency over where your data resides, local backups, and consultation profile settings.
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
              <strong>Honest Privacy Commitment:</strong> Saheli is designed as a privacy-respecting, client-side web application. All entries you record are stored strictly inside your browser's local sandbox (via HTML5 <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>localStorage</code>).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-berry)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={15} />
                  <span>No External PHI Transmission</span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0 }}>
                  We do not transmit your symptom diaries, notes, or patient names to remote advertising or EHR servers. Data does not leave this computer.
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-berry)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={15} />
                  <span>Local-Only Storage (Unencrypted)</span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0 }}>
                  Browser <code style={{ fontSize: '0.75rem' }}>localStorage</code> is standard unencrypted web storage. Clearing browser history, cookies, or site cache will erase your diary. Export JSON backups to keep permanent copies.
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-berry)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <RefreshCw size={15} />
                  <span>No Cross-Device Sync</span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0 }}>
                  Saheli does not connect to cloud accounts or sync across devices automatically. To transfer data to another phone or computer, use the JSON Export/Import tools below.
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-berry)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Download size={15} />
                  <span>Complete Data Portability</span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0 }}>
                  You can export your complete health history as an open JSON file at any time, import previous backups, or delete all stored records with one click.
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-berry)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mic size={15} />
                  <span>Speech Recognition & Cloud Audio Notice</span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0 }}>
                  Voice check-in uses your browser's built-in Web Speech API. In Chrome and Edge, spoken audio is streamed to the browser vendor's cloud service for speech-to-text transcription. Saheli itself does not record, process, or store your voice audio on any server; all symptom rule parsing is performed locally in your browser.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile & Clinician Preferences Form */}
        <div className="saheli-card">
          <div className="card-header-row">
            <div className="card-title">
              <User size={18} color="var(--color-berry)" />
              <span>Patient Profile & Clinician Information</span>
            </div>
            <span className="badge badge-berry">Active: {currentProfile.name || 'Private Diary'}</span>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Patient Name or Pseudonym
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amara K. or leave blank for anonymous"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 29"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Typical Cycle Length (Days)
                </label>
                <input
                  type="number"
                  min="20"
                  max="60"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Typical range 24–38 days</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Typical Period Duration (Days)
                </label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Typical range 3–7 days</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Clinician or Practice Name
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Sunita Rao, MD (OB/GYN)"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Upcoming Appointment Date
                </label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}
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

        {/* Backup, Restore & Reset Operations */}
        <div className="saheli-card">
          <div className="card-header-row">
            <div className="card-title">
              <Download size={18} color="var(--color-berry)" />
              <span>Data Management & Backup</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div style={{ border: '1px solid var(--border-card)', padding: '1.25rem', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '0.98rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Export JSON Diary
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Download your symptom entries, custom clinician questions, and cycle metrics as an open, unencrypted JSON backup.
              </p>
              <button
                type="button"
                onClick={exportDataJSON}
                className="btn btn-secondary"
                style={{ fontSize: '0.84rem' }}
              >
                <Download size={14} />
                <span>Download Backup</span>
              </button>
            </div>

            <div style={{ border: '1px solid var(--border-card)', padding: '1.25rem', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '0.98rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Import JSON Backup
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Restore diary records from a previously exported Saheli JSON backup file. Confirms before replacing local records.
              </p>
              <label className="btn btn-secondary" style={{ fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex' }}>
                <Upload size={14} />
                <span>Upload JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{ border: '1px solid var(--border-card)', padding: '1.25rem', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '0.98rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Reset Sample Profiles
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Restore the default demonstration profiles (Amara, Priya, Ananya, Meera) to original literature-calibrated values.
              </p>
              <button
                type="button"
                onClick={handleResetDemoData}
                className="btn btn-outline"
                style={{ fontSize: '0.84rem' }}
              >
                <RotateCcw size={14} />
                <span>Reset Demo Data</span>
              </button>
            </div>

            <div style={{ border: '1px solid #FCA5A5', padding: '1.25rem', borderRadius: '10px', backgroundColor: '#FDF2F2' }}>
              <h4 style={{ fontSize: '0.98rem', marginBottom: '0.35rem', color: '#B91C1C' }}>
                Erase All Local Storage
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#7F1D1D', marginBottom: '1rem' }}>
                Permanently purge all stored entries, custom questions, and profile records from this browser's local storage.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="btn btn-urgent"
                style={{ fontSize: '0.84rem' }}
              >
                <Trash2 size={14} />
                <span>Clear All Records</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
