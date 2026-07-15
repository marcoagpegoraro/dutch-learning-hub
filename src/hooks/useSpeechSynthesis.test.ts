import { describe, expect, it } from 'vitest';
import { selectDutchVoice } from './useSpeechSynthesis';

const voice = (name: string, lang: string) => ({ name, lang }) as SpeechSynthesisVoice;

describe('Dutch speech voice selection', () => {
  it('prefers a Netherlands Dutch voice', () => {
    const selected = selectDutchVoice([
      voice('English', 'en-US'),
      voice('Belgian Dutch', 'nl-BE'),
      voice('Netherlands Dutch', 'nl-NL'),
    ]);
    expect(selected?.name).toBe('Netherlands Dutch');
  });

  it('falls back to another Dutch voice', () => {
    expect(selectDutchVoice([voice('English', 'en-GB'), voice('Dutch', 'nl-BE')])?.lang).toBe(
      'nl-BE',
    );
  });

  it('returns undefined when no Dutch voice exists', () => {
    expect(selectDutchVoice([voice('English', 'en-US')])).toBeUndefined();
  });
});
