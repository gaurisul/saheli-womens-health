import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, AlertCircle, Check, X, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { parseVoiceTranscript } from '../../services/voiceParser';

const STORAGE_KEY_VOICE_PRIVACY = 'saheli_voice_privacy_acknowledged';

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'हिंदी (Hindi)' },
  { code: 'mr-IN', label: 'मराठी (Marathi)' }
];

export default function VoiceLogButton({ onApplyParsed, disabled = false }) {
  // Feature detection initialized directly without cascading effect setState
  const [isSupported] = useState(() => {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState('en-IN');
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // One-time privacy disclosure acknowledgement
  const [hasAcknowledgedPrivacy, setHasAcknowledgedPrivacy] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_VOICE_PRIVACY) === 'true';
    } catch {
      return false;
    }
  });
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const recognitionRef = useRef(null);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const startListening = () => {
    setErrorMsg(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. Please type or select symptoms manually.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions in your browser settings to use voice check-in.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Please speak closer to your microphone.');
        } else if (event.error === 'network') {
          setErrorMsg('Network error connecting to browser speech service. Please verify your connection or enter symptoms manually.');
        } else if (event.error !== 'aborted') {
          setErrorMsg(`Voice input error: ${event.error}.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsDrawerOpen(true);
    } catch {
      setIsListening(false);
      setErrorMsg('Failed to initialize speech recognition. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (!hasAcknowledgedPrivacy) {
      setShowPrivacyModal(true);
      return;
    }

    startListening();
  };

  const handleConfirmPrivacy = () => {
    try {
      localStorage.setItem(STORAGE_KEY_VOICE_PRIVACY, 'true');
    } catch {
      // ignore
    }
    setHasAcknowledgedPrivacy(true);
    setShowPrivacyModal(false);
    startListening();
  };

  // Real-time parsed preview
  const parseResult = parseVoiceTranscript(transcript, lang);
  const { parsed, meta } = parseResult;
  const hasRecognizedFields = Object.keys(parsed).length > 0;

  const handleFillForm = () => {
    stopListening();
    if (onApplyParsed) {
      onApplyParsed(parsed, meta);
    }
    setIsDrawerOpen(false);
  };

  const handleClearTranscript = () => {
    stopListening();
    setTranscript('');
    setErrorMsg(null);
  };

  if (!isSupported) {
    return (
      <div
        title="Speech recognition is not supported in this browser"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-card)',
          borderRadius: '12px',
          padding: '0.45rem 0.85rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        <MicOff size={16} color="var(--text-muted)" />
        <span style={{ fontSize: '0.78rem' }}>Voice Logging (Browser Unsupported)</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Trigger Button with pulsing listening state */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          type="button"
          onClick={handleMicClick}
          disabled={disabled}
          title={isListening ? 'Stop listening' : 'Record symptoms by voice (English, Hindi, Marathi)'}
          aria-label={isListening ? 'Stop voice recording' : 'Start voice symptom recording'}
          className={isListening ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{
            fontSize: '0.85rem',
            padding: '0.45rem 0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: isListening ? 'var(--color-berry)' : undefined,
            borderColor: isListening ? 'var(--color-berry)' : undefined,
            color: isListening ? '#FFFFFF' : 'var(--color-berry)',
            boxShadow: isListening ? '0 0 0 3px rgba(156, 44, 84, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          {isListening ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  animation: 'pulse 1.2s infinite'
                }}
              />
              <Mic size={16} />
              <span>Listening...</span>
            </>
          ) : (
            <>
              <Mic size={16} />
              <span>Voice Check-in</span>
            </>
          )}
        </button>

        {/* Language selector toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', backgroundColor: 'var(--bg-card)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <Globe size={13} color="var(--text-muted)" />
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              if (isListening) {
                stopListening();
              }
            }}
            disabled={disabled || isListening}
            aria-label="Select voice recognition language"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.76rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Voice Review Drawer / Modal */}
      {isDrawerOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="voice-modal-title">
          <div className="modal-card" style={{ maxWidth: '580px', padding: '1.75rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ backgroundColor: isListening ? '#FDF2F4' : 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-berry)' }}>
                  <Mic size={20} />
                </div>
                <div>
                  <h3 id="voice-modal-title" style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-primary)' }}>
                    Voice Symptom Check-in
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Language: <strong>{SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.label}</strong> · Rule-based transcription
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopListening();
                  setIsDrawerOpen(false);
                }}
                aria-label="Close voice logger"
                style={{ color: 'var(--text-muted)', padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error banner if speech fails */}
            {errorMsg && (
              <div
                role="alert"
                style={{
                  backgroundColor: '#FFF5F5',
                  border: '1px solid var(--color-critical-border, #FED7D7)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.8rem',
                  color: 'var(--color-critical, #C53030)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Live Recording Status Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="voice-transcript-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Spoken Transcript (Editable)
              </label>
              {isListening ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-berry)', fontSize: '0.78rem', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-berry)', animation: 'pulse 1.2s infinite' }} />
                  <span>Listening... Speak symptoms naturally</span>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Paused. You can edit the text before applying.
                </span>
              )}
            </div>

            {/* Editable Transcript Textarea */}
            <textarea
              id="voice-transcript-input"
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={`Example: "Severe cramps, pain is 8, heavy bleeding with clots, had to stay in bed today."\nया "आज खूप पोटात मरोड आणि मळमळ आहे, कामावर जाता आले नाही."`}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-card)',
                backgroundColor: 'var(--bg-primary)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                resize: 'vertical',
                marginBottom: '1rem'
              }}
            />

            {/* Controls: Listen/Pause & Clear */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={isListening ? 'btn btn-outline' : 'btn btn-secondary'}
                style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span>{isListening ? 'Pause Listening' : 'Resume Speaking'}</span>
              </button>
              <button
                type="button"
                onClick={handleClearTranscript}
                disabled={!transcript}
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem', color: 'var(--text-muted)' }}
              >
                <RefreshCw size={14} />
                <span>Clear</span>
              </button>
            </div>

            {/* Structured Schema Extraction Preview */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid var(--border-card)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--color-berry)', fontSize: '0.82rem', fontWeight: 700 }}>
                <Sparkles size={15} />
                <span>Extracted Schema Fields</span>
              </div>

              {!hasRecognizedFields ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Speak physical symptoms, pain level, flow, or functional impact to see rule-based fields populate.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
                  {parsed.painScore !== undefined && (
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Pain Severity:</strong>{' '}
                      <span className="badge badge-berry" style={{ fontSize: '0.72rem' }}>
                        {parsed.painScore}/10 {meta.isPainEstimated ? '(Estimated)' : '(Explicit)'}
                      </span>
                    </div>
                  )}

                  {parsed.bleeding !== undefined && (
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Bleeding / Flow:</strong>{' '}
                      <span className="badge badge-sage" style={{ fontSize: '0.72rem' }}>
                        {parsed.bleeding}
                      </span>
                    </div>
                  )}

                  {parsed.functionalImpact !== undefined && (
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Functional Disruption:</strong>{' '}
                      <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                        {parsed.functionalImpact ? 'Reported' : 'None'}
                      </span>
                    </div>
                  )}

                  {parsed.impactTypes && parsed.impactTypes.length > 0 && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Impact Types:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{parsed.impactTypes.join(', ')}</span>
                    </div>
                  )}

                  {parsed.symptoms && parsed.symptoms.length > 0 && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Recognized Chips ({parsed.symptoms.length}):</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                        {parsed.symptoms.map((s) => (
                          <span key={s} className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsed.notes && (
                    <div style={{ gridColumn: '1 / -1', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      <strong>Notes to Append:</strong> <em>"{parsed.notes}"</em>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-card)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                * Pre-fills form fields only. You review and click Save.
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    setIsDrawerOpen(false);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFillForm}
                  disabled={!hasRecognizedFields && !transcript.trim()}
                  className="btn btn-primary"
                  style={{ fontSize: '0.84rem' }}
                >
                  <Check size={15} />
                  <span>Fill Form & Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* One-Time Privacy Acknowledgement Modal (Instruction #7) */}
      {showPrivacyModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="privacy-disclosure-title">
          <div className="modal-card" style={{ maxWidth: '500px', padding: '1.75rem', borderTop: '4px solid var(--color-berry)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-berry)', marginBottom: '0.85rem' }}>
              <ShieldAlert size={24} />
              <h3 id="privacy-disclosure-title" style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
                Speech Recognition Privacy Notice
              </h3>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '0.85rem' }}>
              Voice input uses your browser's built-in speech recognition (Web Speech API). In browsers like Google Chrome and Microsoft Edge, spoken audio is streamed to the browser vendor's cloud service for real-time speech-to-text transcription.
            </p>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-card)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
              <strong>Saheli Data Policy:</strong> Saheli does not record, process, or store your voice audio on any server. Once transcribed, all symptom parsing occurs purely on your device in local memory.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPrivacy}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                I Understand & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
