import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SAMPLE_PROFILES, formatDate, getOffsetDate } from '../data/sampleProfiles';
import { CLINICAL_RULES } from '../data/clinicalRules';

const AppContext = createContext();

const STORAGE_KEY_PROFILE = 'saheli_profile_id';
const STORAGE_KEY_PROFILES_DATA = 'saheli_profiles_data';

export function AppProvider({ children }) {
  // Load current active profile id
  const [profileId, setProfileId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      return saved && SAMPLE_PROFILES[saved] ? saved : 'priya';
    } catch {
      return 'priya';
    }
  });

  // Load profiles dictionary (allowing edits to persist)
  const [profiles, setProfiles] = useState(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY_PROFILES_DATA);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (e) {
      console.error('Failed to load local storage profiles:', e);
    }
    return SAMPLE_PROFILES;
  });

  // Current active profile
  const currentProfile = profiles[profileId] || SAMPLE_PROFILES.priya;
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
    setProfileId('priya');
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
        logs: {}
      }
    };
    setProfiles(blankProfiles);
    setProfileId('guest');
    localStorage.clear();
    showToast('All local logs and stored data cleared.');
  };

  // Add or update daily log entry
  const saveEntry = (entryData) => {
    const dateKey = entryData.date || formatDate(new Date());
    
    // Check if severe pain was entered (9 or 10) to proactively suggest urgent care guide
    if (entryData.painScore >= 9) {
      setIsUrgentModalOpen(true);
    }

    setProfiles((prev) => {
      const active = prev[profileId] || SAMPLE_PROFILES.priya;
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

    showToast(`Saved daily symptom check-in for ${dateKey}`);
  };

  // Delete an entry
  const deleteEntry = (dateKey) => {
    setProfiles((prev) => {
      const active = prev[profileId] || SAMPLE_PROFILES.priya;
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

  // Update profile attributes (name, doctor, questions)
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

  // Add a custom question for the doctor
  const addDoctorQuestion = (questionText) => {
    if (!questionText.trim()) return;
    const currentQuestions = currentProfile.customQuestions || [];
    updateProfile({
      customQuestions: [...currentQuestions, questionText.trim()]
    });
    showToast('Added discussion question to clinician brief');
  };

  // Remove a question
  const removeDoctorQuestion = (index) => {
    const currentQuestions = [...(currentProfile.customQuestions || [])];
    currentQuestions.splice(index, 1);
    updateProfile({ customQuestions: currentQuestions });
    showToast('Question removed from brief', 'info');
  };

  // Export all data as JSON
  const exportDataJSON = () => {
    const dataToExport = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      activeProfileId: profileId,
      profile: currentProfile,
      allProfiles: profiles,
      disclaimer: 'Saheli local demo backup. Unvalidated demonstration data.'
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `saheli_health_diary_${profileId}_${formatDate(new Date())}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported diary backup file (JSON)');
  };

  // Import JSON backup
  const importDataJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.allProfiles) {
        setProfiles(parsed.allProfiles);
        if (parsed.activeProfileId && parsed.allProfiles[parsed.activeProfileId]) {
          setProfileId(parsed.activeProfileId);
        }
        showToast('Successfully restored backup data');
        return { success: true };
      } else if (parsed.profile) {
        setProfiles((prev) => ({
          ...prev,
          [parsed.activeProfileId || 'guest']: parsed.profile
        }));
        showToast('Restored profile entries');
        return { success: true };
      } else {
        throw new Error('Invalid backup format');
      }
    } catch (err) {
      showToast('Failed to import file: invalid format', 'error');
      return { success: false, error: err.message };
    }
  };

  // Evaluate clinical rules against current logs
  const detectedPatterns = useMemo(() => {
    return CLINICAL_RULES.map((rule) => {
      const evaluation = rule.evaluate(logs, currentProfile);
      return {
        ...rule,
        ...evaluation
      };
    });
  }, [logs, currentProfile]);

  // Overall metrics summary
  const summaryMetrics = useMemo(() => {
    const entries = Object.values(logs);
    const totalEntries = entries.length;
    if (totalEntries === 0) {
      return {
        totalLoggedDays: 0,
        averagePainScore: 0,
        severePainDaysCount: 0,
        heavyFlowDaysCount: 0,
        functionalImpactDaysCount: 0,
        mostFrequentSymptoms: []
      };
    }

    const totalPain = entries.reduce((acc, curr) => acc + (curr.painScore || 0), 0);
    const averagePainScore = (totalPain / totalEntries).toFixed(1);
    const severePainDaysCount = entries.filter((e) => (e.painScore || 0) >= 7).length;
    const heavyFlowDaysCount = entries.filter((e) => e.bleeding === 'Heavy').length;
    const functionalImpactDaysCount = entries.filter((e) => e.functionalImpact === true).length;

    // Symptom frequency count
    const symptomMap = {};
    entries.forEach((e) => {
      (e.symptoms || []).forEach((s) => {
        symptomMap[s] = (symptomMap[s] || 0) + 1;
      });
    });

    const mostFrequentSymptoms = Object.entries(symptomMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLoggedDays: totalEntries,
      averagePainScore,
      severePainDaysCount,
      heavyFlowDaysCount,
      functionalImpactDaysCount,
      mostFrequentSymptoms
    };
  }, [logs]);

  // Today's entry (if exists)
  const todayKey = formatDate(new Date());
  const todayEntry = logs[todayKey] || null;

  return (
    <AppContext.Provider
      value={{
        profileId,
        currentProfile,
        profiles,
        logs,
        todayKey,
        todayEntry,
        summaryMetrics,
        detectedPatterns,
        switchProfile,
        saveEntry,
        deleteEntry,
        updateProfile,
        addDoctorQuestion,
        removeDoctorQuestion,
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
        setActiveEduArticle
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
