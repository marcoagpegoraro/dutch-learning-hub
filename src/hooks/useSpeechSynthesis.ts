import { createContext, useContext } from 'react';
export { selectDutchVoice } from '../services/dutchSpeech';

export interface SpeechState {
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  voice?: SpeechSynthesisVoice;
  refreshVoices: () => void;
  enabled: boolean;
  speaking: boolean;
  activeText: string;
  error: string;
  speak: (text: string, rate?: number) => boolean;
  stop: () => void;
  clearError: () => void;
}
export const SpeechContext = createContext<SpeechState | null>(null);

export function useSpeechSynthesis(): SpeechState {
  const speech = useContext(SpeechContext);
  if (!speech) throw new Error('Speech controls must be inside SpeechSynthesisProvider.');
  return speech;
}
