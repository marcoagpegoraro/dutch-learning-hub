export function selectDutchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((voice) => voice.lang.toLowerCase().replaceAll('_', '-') === 'nl-nl') ??
    voices.find((voice) => /^nl(?:[-_]|$)/i.test(voice.lang))
  );
}

export function createDutchUtterance(
  text: string,
  voices: SpeechSynthesisVoice[],
  rate = 0.92,
): SpeechSynthesisUtterance {
  const voice = selectDutchVoice(voices);
  if (voices.length && !voice)
    throw new Error(
      'No Dutch voice is installed. Add a Dutch (Nederlands) voice in your device’s speech settings, then reload this page.',
    );
  const utterance = new window.SpeechSynthesisUtterance(text.trim());
  utterance.lang = 'nl-NL';
  utterance.rate = Math.min(1.3, Math.max(0.5, rate));
  utterance.voice = voice ?? null;
  return utterance;
}
