import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppState } from './AppStateContext';
import { SpeechContext } from '../hooks/useSpeechSynthesis';
import { createDutchUtterance } from '../services/dutchSpeech';

export function SpeechSynthesisProvider({ children }: { children: ReactNode }) {
  const { state } = useAppState();
  const enabled = state.settings.soundEnabled;
  const { pathname } = useLocation();
  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;
  const voices = useRef<SpeechSynthesisVoice[]>([]);
  const active = useRef<SpeechSynthesisUtterance | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [activeText, setActiveText] = useState('');
  const [error, setError] = useState('');
  const stop = useCallback(() => {
    active.current = null;
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
    setActiveText('');
  }, [supported]);

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      voices.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      active.current = null;
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener('voiceschanged', load);
    };
  }, [supported]);

  useEffect(() => {
    stop();
    setError('');
  }, [pathname, enabled, stop]);

  const speak = useCallback(
    (text: string, rate = 0.92) => {
      if (!supported || !enabled || !text.trim()) return false;
      stop();
      setError('');
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        const utterance = createDutchUtterance(
          text,
          availableVoices.length ? availableVoices : voices.current,
          rate,
        );
        active.current = utterance;
        setActiveText(text.trim());
        setSpeaking(true);
        const finish = () => {
          if (active.current !== utterance) return;
          active.current = null;
          setSpeaking(false);
          setActiveText('');
        };
        utterance.onend = finish;
        utterance.onerror = (event) => {
          if (active.current !== utterance) return;
          finish();
          if (event.error !== 'canceled' && event.error !== 'interrupted')
            setError('Dutch audio could not play. Check your device’s Dutch voice and try again.');
        };
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (cause) {
        stop();
        setError(cause instanceof Error ? cause.message : 'Dutch audio is unavailable.');
        return false;
      }
    },
    [enabled, stop, supported],
  );

  const value = useMemo(
    () => ({
      supported,
      enabled,
      speaking,
      activeText,
      error,
      speak,
      stop,
      clearError: () => setError(''),
    }),
    [supported, enabled, speaking, activeText, error, speak, stop],
  );
  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}
