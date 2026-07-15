import { useCallback, useEffect, useState } from 'react';

export function selectDutchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((voice) => voice.lang.toLocaleLowerCase().startsWith('nl-nl')) ??
    voices.find((voice) => voice.lang.toLocaleLowerCase().startsWith('nl'))
  );
}

export function useSpeechSynthesis() {
  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, rate = 0.92) => {
      if (!supported) return false;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'nl-NL';
      utterance.rate = rate;
      utterance.voice = selectDutchVoice(voices) ?? null;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [supported, voices],
  );

  return { supported, speaking, speak, stop: () => supported && window.speechSynthesis.cancel() };
}
