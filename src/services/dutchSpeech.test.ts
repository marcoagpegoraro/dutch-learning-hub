import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDutchUtterance, selectDutchVoice } from './dutchSpeech';
import { savedAnswerSpeech } from './savedAnswerSpeech';

const voice = (lang: string) => ({ lang }) as SpeechSynthesisVoice;
class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
afterEach(() => vi.unstubAllGlobals());

describe('Dutch audio', () => {
  it('configures Dutch and the Netherlands voice for normal and slower playback', () => {
    vi.stubGlobal('window', { SpeechSynthesisUtterance: FakeUtterance });
    const dutch = voice('nl-NL');
    const voices = [voice('en-US'), voice('nl-BE'), dutch];
    expect(createDutchUtterance('  de fiets  ', voices)).toMatchObject({
      text: 'de fiets',
      lang: 'nl-NL',
      voice: dutch,
      rate: 0.92,
    });
    expect(createDutchUtterance('de fiets', voices, 0.68).rate).toBe(0.68);
  });

  it('handles language-only and underscore voice identifiers without accepting another language', () => {
    expect(selectDutchVoice([voice('en-US'), voice('nl')])?.lang).toBe('nl');
    expect(selectDutchVoice([voice('nl-BE'), voice('nl_NL')])?.lang).toBe('nl_NL');
    expect(selectDutchVoice([voice('nld'), voice('en-GB')])).toBeUndefined();
  });

  it('requests a Dutch voice when voices load late, but never intentionally selects an English voice', () => {
    vi.stubGlobal('window', { SpeechSynthesisUtterance: FakeUtterance });
    expect(createDutchUtterance('goedemorgen', [])).toMatchObject({ lang: 'nl-NL', voice: null });
    expect(() => createDutchUtterance('goedemorgen', [voice('en-US')])).toThrow(
      'No Dutch voice is installed',
    );
  });

  it('reads the Dutch source when a saved recognition answer is English', () => {
    expect(savedAnswerSpeech({ questionId: 'vocabulary-door', correctAnswer: 'door' })).toContain(
      'de deur',
    );
    expect(
      savedAnswerSpeech({ questionId: 'translation-easy-hello', correctAnswer: 'goedemorgen' }),
    ).toBe('goedemorgen');
  });
});
