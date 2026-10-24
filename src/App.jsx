import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Common components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import MobileNav from './components/common/MobileNav';
import Toast from './components/common/Toast';
import UrgentCareModal from './components/common/UrgentCareModal';
import MedicalDisclaimerModal from './components/common/MedicalDisclaimerModal';
import EvidenceDrawer from './components/common/EvidenceDrawer';
import ArticleModal from './components/common/ArticleModal';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import TodayDashboard from './pages/TodayDashboard';
import DailyCheckinPage from './pages/DailyCheckinPage';
import CycleCalendarPage from './pages/CycleCalendarPage';
import InsightsTrendsPage from './pages/InsightsTrendsPage';
import DoctorVisitPage from './pages/DoctorVisitPage';
import PrivacySettingsPage from './pages/PrivacySettingsPage';

// Main App Shell with Sidebar, Navbar, and persistent disclaimer
function WorkspaceLayout({ children }) {
  const { setIsDisclaimerModalOpen } = useApp();

  return (
    <div className="app-container">
      {/* Fixed Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar />

        {/* Dynamic Page Content */}
        <main style={{ flex: 1, minHeight: 'calc(100vh - 120px)' }}>
          {children}
        </main>

        {/* Persistent Bottom Medical Disclaimer Banner */}
        <footer className="disclaimer-banner no-print">
          <div>
            <strong>Medical Notice:</strong> Saheli is an observational symptom diary and clinician communication bridge, not a diagnostic medical device. Pattern recognition algorithms are demonstration demonstrations based on literature and are unvalidated by clinical trial.
          </div>
          <button
            onClick={() => setIsDisclaimerModalOpen(true)}
            style={{ 
              color: 'var(--color-berry)', 
              fontWeight: 600, 
              whiteSpace: 'nowrap',
              textDecoration: 'underline' 
            }}
          >
            Review Clinical Scope & Limitations
          </button>
        </footer>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Global Modals & Toasts */}
      <Toast />
      <UrgentCareModal />
      <MedicalDisclaimerModal />
      <EvidenceDrawer />
      <ArticleModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage isSignUp={false} />} />
          <Route path="/signup" element={<AuthPage isSignUp={true} />} />

          {/* Core Application Pages inside WorkspaceLayout */}
          <Route
            path="/dashboard"
            element={
              <WorkspaceLayout>
                <TodayDashboard />
              </WorkspaceLayout>
            }
          />
          <Route
            path="/checkin"
            element={
              <WorkspaceLayout>
                <DailyCheckinPage />
              </WorkspaceLayout>
            }
          />
          <Route
            path="/calendar"
            element={
              <WorkspaceLayout>
                <CycleCalendarPage />
              </WorkspaceLayout>
            }
          />
          <Route
            path="/insights"
            element={
              <WorkspaceLayout>
                <InsightsTrendsPage />
              </WorkspaceLayout>
            }
          />
          <Route
            path="/doctor-visit"
            element={
              <WorkspaceLayout>
                <DoctorVisitPage />
              </WorkspaceLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <WorkspaceLayout>
                <PrivacySettingsPage />
              </WorkspaceLayout>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
