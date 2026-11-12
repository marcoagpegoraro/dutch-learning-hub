import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createDutchUtterance,
  selectDutchVoice,
  VOICES_NOT_READY,
  NO_DUTCH_VOICE,
  SELECTED_VOICE_UNAVAILABLE,
} from './dutchSpeech';
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

  it('never constructs an utterance while voices are empty or only English is available', () => {
    const constructor = vi.fn();
    vi.stubGlobal('window', { SpeechSynthesisUtterance: constructor });
    expect(() => createDutchUtterance('Ik heb die film gezien.', [])).toThrow(VOICES_NOT_READY);
    expect(() => createDutchUtterance('Ik heb die film gezien.', [voice('en-US')])).toThrow(
      NO_DUTCH_VOICE,
    );
    expect(constructor).not.toHaveBeenCalled();
  });

  it('honours a saved Dutch voice and uses its actual regional language', () => {
    vi.stubGlobal('window', { SpeechSynthesisUtterance: FakeUtterance });
    const netherlands = { ...voice('nl-NL'), voiceURI: 'netherlands' };
    const belgian = { ...voice('nl-BE'), voiceURI: 'belgian' };
    const utterance = createDutchUtterance(
      'Ik heb die film gezien.',
      [netherlands, belgian],
      0.68,
      'belgian',
    );
    expect(utterance.voice).toBe(belgian);
    expect(utterance.lang).toBe('nl-BE');
    expect(utterance.rate).toBe(0.68);
  });

  it('rejects unavailable saved voices and English voice URIs without silently changing voice', () => {
    const constructor = vi.fn();
    vi.stubGlobal('window', { SpeechSynthesisUtterance: constructor });
    const dutch = { ...voice('nl-NL'), voiceURI: 'dutch' };
    const english = { ...voice('en-US'), voiceURI: 'english' };
    expect(() => createDutchUtterance('gezien', [dutch, english], 0.92, 'english')).toThrow(
      SELECTED_VOICE_UNAVAILABLE,
    );
    expect(() => createDutchUtterance('gezien', [dutch], 0.92, 'deleted-voice')).toThrow(
      SELECTED_VOICE_UNAVAILABLE,
    );
    expect(constructor).not.toHaveBeenCalled();
  });

  it('plays only after a real Dutch voice becomes available following delayed voice loading', () => {
    vi.stubGlobal('window', { SpeechSynthesisUtterance: FakeUtterance });
    expect(() => createDutchUtterance('gezien', [])).toThrow(VOICES_NOT_READY);
    const dutch = voice('nl-NL');
    expect(createDutchUtterance('gezien', [dutch]).voice).toBe(dutch);
    expect(createDutchUtterance('gezien', [dutch]).voice).not.toBeNull();
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
