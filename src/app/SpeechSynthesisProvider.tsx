import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppState } from './AppStateContext';
import { SpeechContext } from '../hooks/useSpeechSynthesis';
import { createDutchUtterance, isDutchVoice, selectDutchVoice } from '../services/dutchSpeech';

export function SpeechSynthesisProvider({ children }: { children: ReactNode }) {
  const { state } = useAppState();
  const enabled = state.settings.soundEnabled;
  const preferredVoiceURI = state.settings.dutchVoiceURI;
  const { pathname } = useLocation();
  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
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

  const refreshVoices = useCallback(() => {
    if (supported) setVoices(window.speechSynthesis.getVoices());
  }, [supported]);

  useEffect(() => {
    if (!supported) return;
    refreshVoices();
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    return () => {
      active.current = null;
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices);
    };
  }, [supported, refreshVoices]);

  useEffect(() => {
    stop();
    setError('');
  }, [pathname, enabled, preferredVoiceURI, stop]);

  const speak = useCallback(
    (text: string, rate = 0.92) => {
      if (!supported || !enabled || !text.trim()) return false;
      stop();
      setError('');
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        const utterance = createDutchUtterance(text, availableVoices, rate, preferredVoiceURI);
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
            setError(
              'A voz holandesa não conseguiu reproduzir o áudio. Escolha outra voz em Settings e teste novamente.',
            );
        };
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (cause) {
        stop();
        setError(cause instanceof Error ? cause.message : 'Dutch audio is unavailable.');
        return false;
      }
    },
    [enabled, stop, supported, preferredVoiceURI],
  );

  const value = useMemo(
    () => ({
      supported,
      voices: voices.filter(isDutchVoice),
      voice: selectDutchVoice(voices, preferredVoiceURI),
      refreshVoices,
      enabled,
      speaking,
      activeText,
      error,
      speak,
      stop,
      clearError: () => setError(''),
    }),
    [
      supported,
      voices,
      preferredVoiceURI,
      refreshVoices,
      enabled,
      speaking,
      activeText,
      error,
      speak,
      stop,
    ],
  );
  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}
