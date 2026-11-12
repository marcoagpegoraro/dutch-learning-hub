import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppStateProvider } from '../../app/AppStateContext';
import { SpeechSynthesisProvider } from '../../app/SpeechSynthesisProvider';
import { createDefaultState, STORAGE_KEY } from '../../services/storage';
import type { Difficulty } from '../../types/exercise';
import { TranslationPractice } from './TranslationPractice';
import { translationQuestions } from './translationData';

function renderTranslations(mastered: string[], difficulty: Difficulty = 'easy') {
  const state = createDefaultState();
  state.progress.masteredItems = mastered;
  state.settings.defaultDifficulty = difficulty;
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => (key === STORAGE_KEY ? JSON.stringify(state) : null),
    },
  });
  return renderToStaticMarkup(
    <MemoryRouter>
      <AppStateProvider>
        <SpeechSynthesisProvider>
          <TranslationPractice />
        </SpeechSynthesisProvider>
      </AppStateProvider>
    </MemoryRouter>,
  );
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Vertalen screens', () => {
  it('shows saved completion, the completed phrases, and a next difficulty instead of another question', () => {
    const mastered = translationQuestions
      .filter((question) => question.difficulty === 'easy')
      .map((question) => question.id);
    const html = renderTranslations(mastered);
    expect(html).toContain('Easy complete!');
    expect(html).toContain('Go to Medium');
    expect(html).toContain('View completed phrases (5)');
    expect(html).toContain('5 / 5 mastered');
    expect(html).not.toContain('id="quizTextAnswer"');
  });

  it('shows the final completion when all difficulties are solved', () => {
    const html = renderTranslations(
      translationQuestions.map((question) => question.id),
      'hard',
    );
    expect(html).toContain('All translation phrases complete!');
    expect(html).not.toContain('Go to');
    expect(html).not.toContain('id="quizTextAnswer"');
  });

  it('keeps an unsolved question available and does not expose its Dutch answer through audio', () => {
    const otherEasy = translationQuestions
      .filter(
        (question) => question.difficulty === 'easy' && question.id !== 'translation-easy-hello',
      )
      .map((question) => question.id);
    const html = renderTranslations(otherEasy);
    expect(html).toContain('id="quizTextAnswer"');
    expect(html).toContain('Good morning!');
    expect(html).toContain('4 / 5 mastered');
    expect(html).not.toContain('Hear Dutch: goedemorgen');
    expect(html).not.toContain('Easy complete!');
  });
});
