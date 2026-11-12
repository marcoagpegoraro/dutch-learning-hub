import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppStateProvider } from '../app/AppStateContext';
import { SpeechContext, type SpeechState } from '../hooks/useSpeechSynthesis';
import { createDefaultState, STORAGE_KEY } from '../services/storage';
import { selectDutchVoice } from '../services/dutchSpeech';
import { DutchVoiceSettings } from './DutchVoiceSettings';

function renderVoices(voices: SpeechSynthesisVoice[], preferred = '') {
  const state = createDefaultState();
  state.settings.dutchVoiceURI = preferred;
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => (key === STORAGE_KEY ? JSON.stringify(state) : null),
    },
  });
  const speech: SpeechState = {
    supported: true,
    enabled: true,
    voices,
    voice: selectDutchVoice(voices, preferred),
    speaking: false,
    activeText: '',
    error: '',
    speak: vi.fn(),
    stop: vi.fn(),
    clearError: vi.fn(),
    refreshVoices: vi.fn(),
  };
  return renderToStaticMarkup(
    <MemoryRouter>
      <AppStateProvider>
        <SpeechContext.Provider value={speech}>
          <DutchVoiceSettings />
        </SpeechContext.Provider>
      </AppStateProvider>
    </MemoryRouter>,
  );
}
afterEach(() => vi.unstubAllGlobals());
const dutch = {
  name: 'Netherlands voice',
  lang: 'nl-NL',
  voiceURI: 'dutch',
} as SpeechSynthesisVoice;

describe('Dutch voice settings', () => {
  it('shows the selected voice and a test using the sentence the user reported', () => {
    const html = renderVoices([dutch], 'dutch');
    expect(html).toContain('Voz em uso:');
    expect(html).toContain('Netherlands voice');
    expect(html).toContain('nl-NL');
    expect(html).toContain('value="dutch" selected=""');
    expect(html).toContain('Hear Dutch: Ik heb die film gezien. Goedemorgen. Graag gedaan.');
  });

  it('explains how to add Dutch voices when none are available', () => {
    const html = renderVoices([]);
    expect(html).toContain('Ainda não há uma voz holandesa disponível.');
    expect(html).toContain('Atualizar lista de vozes');
    expect(html).toContain('support.apple.com');
    expect(html).toContain('support.microsoft.com');
  });

  it('makes an unavailable saved preference visible instead of silently showing automatic', () => {
    const html = renderVoices([dutch], 'old-voice');
    expect(html).toContain('Voz salva indisponível');
    expect(html).toContain('A voz salva não está disponível');
    expect(html).not.toContain('Voz em uso:');
  });
});
