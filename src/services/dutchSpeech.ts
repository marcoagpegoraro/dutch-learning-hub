export const VOICES_NOT_READY =
  'As vozes ainda não foram carregadas pelo navegador. Atualize a lista de vozes em Settings e tente novamente.';
export const NO_DUTCH_VOICE =
  'Nenhuma voz holandesa está disponível. Adicione uma voz Nederlands nas configurações de fala do dispositivo e atualize a lista em Settings.';
export const SELECTED_VOICE_UNAVAILABLE =
  'A voz holandesa escolhida não está disponível neste navegador. Escolha outra voz holandesa em Settings.';

export function isDutchVoice(voice: SpeechSynthesisVoice): boolean {
  return /^nl(?:[-_]|$)/i.test(voice.lang);
}

export function selectDutchVoice(
  voices: SpeechSynthesisVoice[],
  preferredVoiceURI = '',
): SpeechSynthesisVoice | undefined {
  const dutch = voices.filter(isDutchVoice);
  if (preferredVoiceURI) return dutch.find((voice) => voice.voiceURI === preferredVoiceURI);
  return (
    dutch.find((voice) => /^nl[-_]nl(?:[-_]|$)/i.test(voice.lang)) ??
    dutch.find((voice) => voice.lang.toLowerCase() === 'nl') ??
    dutch[0]
  );
}

export function createDutchUtterance(
  text: string,
  voices: SpeechSynthesisVoice[],
  rate = 0.92,
  preferredVoiceURI = '',
): SpeechSynthesisUtterance {
  if (!voices.length) throw new Error(VOICES_NOT_READY);
  const voice = selectDutchVoice(voices, preferredVoiceURI);
  if (!voice) throw new Error(preferredVoiceURI ? SELECTED_VOICE_UNAVAILABLE : NO_DUTCH_VOICE);
  const utterance = new window.SpeechSynthesisUtterance(text.trim());
  utterance.lang = voice.lang.toLowerCase() === 'nl' ? 'nl-NL' : voice.lang.replaceAll('_', '-');
  utterance.rate = Math.min(1.3, Math.max(0.5, rate));
  // Never leave voice null: a browser may otherwise use its default English voice.
  utterance.voice = voice;
  return utterance;
}
