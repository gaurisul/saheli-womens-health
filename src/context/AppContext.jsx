import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SAMPLE_PROFILES, DEFAULT_CONSENT_SETTINGS, formatDate } from '../data/sampleProfiles';
import { CLINICAL_RULES } from '../data/clinicalRules';
import { 
  calculateCycleDayForDate, 
  computeSummaryMetricsFromLogs, 
  getEstimatedNextPeriod 
} from '../utils/cycleCalculations';

const AppContext = createContext();

const STORAGE_KEY_PROFILE = 'saheli_profile_id';
const STORAGE_KEY_PROFILES_DATA = 'saheli_profiles_data';

// Helper to normalize question objects
function normalizeQuestions(questions = []) {
  return questions.map((q, idx) => {
    if (typeof q === 'string') {
      return { id: `q-${idx}-${Date.now()}`, text: q, inReport: true };
    }
    return {
      id: q.id || `q-${idx}`,
      text: q.text || '',
      inReport: q.inReport !== false
    };
  });
}

export function AppProvider({ children }) {
  // Load current active profile id
  const [profileId, setProfileId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      return saved && (SAMPLE_PROFILES[saved] || saved === 'amara') ? saved : 'amara';
    } catch {
      return 'amara';
    }
  });

  // Load profiles dictionary (allowing edits to persist)
  const [profiles, setProfiles] = useState(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY_PROFILES_DATA);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Ensure consentSettings and normalized questions exist on all loaded profiles
        const merged = { ...SAMPLE_PROFILES };
        Object.keys(parsed).forEach((k) => {
          merged[k] = {
            ...SAMPLE_PROFILES[k],
            ...parsed[k],
            consentSettings: {
              ...DEFAULT_CONSENT_SETTINGS,
              ...(parsed[k]?.consentSettings || {})
            },
            customQuestions: normalizeQuestions(parsed[k]?.customQuestions || SAMPLE_PROFILES[k]?.customQuestions)
          };
        });
        return merged;
      }
    } catch (e) {
      console.error('Failed to load local storage profiles:', e);
    }
    return SAMPLE_PROFILES;
  });

  // Mobile navigation drawer state
  const [isMobileNavDrawerOpen, setIsMobileNavDrawerOpen] = useState(false);

  // Active profile
  const currentProfile = profiles[profileId] || SAMPLE_PROFILES.amara;
  const logs = currentProfile.logs || {};

  // Persist whenever profiles or profileId changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, profileId);
      localStorage.setItem(STORAGE_KEY_PROFILES_DATA, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to persist to localStorage:', e);
    }
  }, [profileId, profiles]);

  // Toast Notification state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Modals state
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);
  const [activeEvidenceRule, setActiveEvidenceRule] = useState(null);
  const [activeEduArticle, setActiveEduArticle] = useState(null);

  // Switch persona profile
  const switchProfile = (newId) => {
    if (profiles[newId] || SAMPLE_PROFILES[newId]) {
      setProfileId(newId);
      showToast(`Switched active profile to ${profiles[newId]?.name || newId}`);
    }
  };

  // Reset to initial sample data
  const resetToFactorySampleData = () => {
    setProfiles(SAMPLE_PROFILES);
    setProfileId('amara');
    localStorage.removeItem(STORAGE_KEY_PROFILES_DATA);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    showToast('Reset to original sample data successfully');
  };

  // Clear all local data (for Privacy page)
  const clearAllData = () => {
    const blankProfiles = {
      ...SAMPLE_PROFILES,
      guest: {
        ...SAMPLE_PROFILES.guest,
        logs: {},
        customQuestions: normalizeQuestions(SAMPLE_PROFILES.guest.customQuestions)
      }
    };
    setProfiles(blankProfiles);
    setProfileId('guest');
    localStorage.clear();
    showToast('All local logs and stored data cleared.');
  };

  // Today key
  const todayKey = formatDate(new Date());
  const todayEntry = logs[todayKey] || null;

  // Single source for Cycle Day and Phase calculations
  const getCycleDayInfo = (dateStr = todayKey) => {
    return calculateCycleDayForDate(dateStr, logs, currentProfile);
  };

  // Dynamic Today Cycle Metrics
  const todayCycleMetrics = useMemo(() => {
    return calculateCycleDayForDate(todayKey, logs, currentProfile);
  }, [todayKey, logs, currentProfile]);

  // Estimated next period
  const estimatedNextPeriod = useMemo(() => {
    return getEstimatedNextPeriod(logs, currentProfile, todayKey);
  }, [logs, currentProfile, todayKey]);

  // Save entry (supports async feedback)
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const saveEntry = async (entryData) => {
    setIsSavingEntry(true);
    const dateKey = entryData.date || todayKey;

    // Check if severe pain was entered (9 or 10) to proactively suggest urgent care guide
    if (Number(entryData.painScore) >= 9) {
      setIsUrgentModalOpen(true);
    }

    try {
      // Small simulated latency for accessible UX feedback
      await new Promise((resolve) => setTimeout(resolve, 200));

      setProfiles((prev) => {
        const active = prev[profileId] || SAMPLE_PROFILES.amara;
        const updatedLogs = {
          ...active.logs,
          [dateKey]: {
            ...entryData,
            date: dateKey,
            updatedAt: new Date().toISOString()
          }
        };
        return {
          ...prev,
          [profileId]: {
            ...active,
            logs: updatedLogs
          }
        };
      });

      showToast(`Saved check-in for ${dateKey}`);
      return { success: true };
    } catch (err) {
      showToast('Failed to save entry. Please try again.', 'error');
      return { success: false, error: err };
    } finally {
      setIsSavingEntry(false);
    }
  };

  // Delete an entry
  const deleteEntry = (dateKey) => {
    setProfiles((prev) => {
      const active = prev[profileId] || SAMPLE_PROFILES.amara;
      const updatedLogs = { ...active.logs };
      delete updatedLogs[dateKey];
      return {
        ...prev,
        [profileId]: {
          ...active,
          logs: updatedLogs
        }
      };
    });
    showToast(`Deleted check-in entry for ${dateKey}`, 'info');
  };

  // Update profile attributes
  const updateProfile = (updates) => {
    setProfiles((prev) => ({
      ...prev,
      [profileId]: {
        ...prev[profileId],
        ...updates
      }
    }));
    showToast('Profile preferences updated');
  };

  // Update user consent preferences
  const updateConsentSettings = (consentUpdates) => {
    setProfiles((prev) => {
      const active = prev[profileId] || SAMPLE_PROFILES.amara;
      return {
        ...prev,
        [profileId]: {
          ...active,
          consentSettings: {
            ...DEFAULT_CONSENT_SETTINGS,
            ...(active.consentSettings || {}),
            ...consentUpdates
          }
        }
      };
    });
  };

  // Question Management: Add
  const addDoctorQuestion = (questionText) => {
    if (!questionText || !questionText.trim()) return;
    const currentQuestions = normalizeQuestions(currentProfile.customQuestions);
    const newQ = {
      id: `q-${Date.now()}`,
      text: questionText.trim(),
      inReport: true
    };
    updateProfile({
      customQuestions: [...currentQuestions, newQ]
    });
    showToast('Added discussion question to clinician brief');
  };

  // Question Management: Edit
  const editDoctorQuestion = (id, newText) => {
    if (!newText || !newText.trim()) return;
    const currentQuestions = normalizeQuestions(currentProfile.customQuestions);
    const updated = currentQuestions.map((q) =>
      q.id === id ? { ...q, text: newText.trim() } : q
    );
    updateProfile({ customQuestions: updated });
    showToast('Question updated');
  };

  // Question Management: Reorder (direction: -1 for up, 1 for down)
  const moveDoctorQuestion = (index, direction) => {
    const currentQuestions = [...normalizeQuestions(currentProfile.customQuestions)];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentQuestions.length) return;
    
    const [moved] = currentQuestions.splice(index, 1);
    currentQuestions.splice(targetIndex, 0, moved);
    updateProfile({ customQuestions: currentQuestions });
  };

  // Question Management: Toggle Report Inclusion
  const toggleDoctorQuestionInReport = (id) => {
    const currentQuestions = normalizeQuestions(currentProfile.customQuestions);
    const updated = currentQuestions.map((q) =>
      q.id === id ? { ...q, inReport: !q.inReport } : q
    );
    updateProfile({ customQuestions: updated });
  };

  // Question Management: Remove
  const removeDoctorQuestion = (id) => {
    const currentQuestions = normalizeQuestions(currentProfile.customQuestions);
    const filtered = currentQuestions.filter((q) => q.id !== id);
    updateProfile({ customQuestions: filtered });
    showToast('Question removed from brief', 'info');
  };

  // Export all data as JSON
  const exportDataJSON = () => {
    const dataToExport = {
      exportVersion: '2.0',
      exportedAt: new Date().toISOString(),
      activeProfileId: profileId,
      profile: {
        ...currentProfile,
        customQuestions: normalizeQuestions(currentProfile.customQuestions)
      },
      disclaimer: 'Saheli local-first symptom diary backup. Unvalidated demonstration data.'
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `saheli_diary_${profileId}_${formatDate(new Date())}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported diary backup file (JSON)');
  };

  // Import JSON backup
  const importDataJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) {
        setProfiles((prev) => ({
          ...prev,
          [parsed.activeProfileId || 'guest']: {
            ...parsed.profile,
            customQuestions: normalizeQuestions(parsed.profile.customQuestions),
            consentSettings: {
              ...DEFAULT_CONSENT_SETTINGS,
              ...(parsed.profile.consentSettings || {})
            }
          }
        }));
        setProfileId(parsed.activeProfileId || 'guest');
        showToast('Successfully restored backup records');
        return { success: true };
      } else if (parsed.allProfiles) {
        setProfiles(parsed.allProfiles);
        if (parsed.activeProfileId) setProfileId(parsed.activeProfileId);
        showToast('Successfully restored backup records');
        return { success: true };
      } else {
        throw new Error('Unrecognized diary format');
      }
    } catch (err) {
      showToast('Failed to import file: invalid format', 'error');
      return { success: false, error: err.message };
    }
  };

  // Evaluate clinical rules dynamically against current logs
  const detectedPatterns = useMemo(() => {
    return CLINICAL_RULES.map((rule) => {
      const evaluation = rule.evaluate(logs, currentProfile);
      return {
        ...rule,
        ...evaluation
      };
    });
  }, [logs, currentProfile]);

  // Overall metrics summary strictly from logs
  const summaryMetrics = useMemo(() => {
    return computeSummaryMetricsFromLogs(logs);
  }, [logs]);

  return (
    <AppContext.Provider
      value={{
        profileId,
        currentProfile: {
          ...currentProfile,
          customQuestions: normalizeQuestions(currentProfile.customQuestions),
          consentSettings: currentProfile.consentSettings || DEFAULT_CONSENT_SETTINGS,
          currentCycleDay: todayCycleMetrics.cycleDay,
          currentPhase: todayCycleMetrics.phase,
          daysUntilNextPeriod: estimatedNextPeriod.daysUntil
        },
        profiles,
        logs,
        todayKey,
        todayEntry,
        todayCycleMetrics,
        estimatedNextPeriod,
        summaryMetrics,
        detectedPatterns,
        getCycleDayInfo,
        switchProfile,
        saveEntry,
        isSavingEntry,
        deleteEntry,
        updateProfile,
        updateConsentSettings,
        addDoctorQuestion,
        editDoctorQuestion,
        moveDoctorQuestion,
        removeDoctorQuestion,
        toggleDoctorQuestionInReport,
        exportDataJSON,
        importDataJSON,
        resetToFactorySampleData,
        clearAllData,
        toast,
        showToast,
        isUrgentModalOpen,
        setIsUrgentModalOpen,
        isDisclaimerModalOpen,
        setIsDisclaimerModalOpen,
        activeEvidenceRule,
        setActiveEvidenceRule,
        activeEduArticle,
        setActiveEduArticle,
        isMobileNavDrawerOpen,
        setIsMobileNavDrawerOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
