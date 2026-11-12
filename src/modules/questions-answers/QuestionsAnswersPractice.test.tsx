import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppStateProvider } from '../../app/AppStateContext';
import { SpeechSynthesisProvider } from '../../app/SpeechSynthesisProvider';
import { createDefaultState, STORAGE_KEY } from '../../services/storage';
import { QuestionsAnswersPractice } from './QuestionsAnswersPractice';
import { buildQuestionAnswerExercises } from './questionAnswerData';
import { PerfectTensePractice } from '../perfect-tense/PerfectTensePractice';

const questions = buildQuestionAnswerExercises();
function renderPractice(mastered: string[] = [], perfectum = false) {
  const state = createDefaultState();
  state.progress.masteredItems = mastered;
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => (key === STORAGE_KEY ? JSON.stringify(state) : null),
    },
  });
  return renderToStaticMarkup(
    <MemoryRouter>
      <AppStateProvider>
        <SpeechSynthesisProvider>
          {perfectum ? <PerfectTensePractice /> : <QuestionsAnswersPractice />}
        </SpeechSynthesisProvider>
      </AppStateProvider>
    </MemoryRouter>,
  );
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('questions and answers screens', () => {
  it('offers questions, answers, a mixed mode, and Portuguese grammar help', () => {
    const html = renderPractice();
    expect(html).toContain('Questions &amp; Answers');
    expect(html).toContain('Só formular perguntas');
    expect(html).toContain('Só formular respostas');
    expect(html).toContain('id="structureGuide"');
    expect(html).toContain('id="quizTextAnswer"');
    expect(html).toContain('href="/practice/perfect-tense"');
  });

  it('provides spoken question context for an answer without reading the hidden answer', () => {
    const mastered = questions
      .filter((item) => item.difficulty === 'easy' && item.id !== 'questions-answers-coffee-answer')
      .map((item) => item.id);
    const html = renderPractice(mastered);
    expect(html).toContain('Hear Dutch: Drink jij koffie?');
    expect(html).toContain('Answer in Dutch:');
    expect(html).not.toContain('Hear Dutch: Ja, ik drink koffie.');
    expect(html).toContain('19 / 20 mastered');
  });

  it('shows saved difficulty completion and offers the next level', () => {
    const html = renderPractice(
      questions.filter((item) => item.difficulty === 'easy').map((item) => item.id),
    );
    expect(html).toContain('Easy complete!');
    expect(html).toContain('Go to Medium');
    expect(html).toContain('View completed phrases (20)');
    expect(html).toContain('id="questionAnswerMode"');
    expect(html).not.toContain('id="quizTextAnswer"');
  });

  it('uses the correct completion label when the whole module is finished', () => {
    const html = renderPractice(questions.map((item) => item.id));
    expect(html).toContain('All questions and answers complete!');
    expect(html).not.toContain('All translation phrases complete!');
  });

  it('keeps the perfectum trainer and explains its three difficulties in Portuguese', () => {
    const html = renderPractice([], true);
    expect(html).toContain('Perfectum · Voltooide tijd');
    expect(html).toContain('Guia em português · o que é perfectum?');
    expect(html).toContain('Hear Dutch: Ik heb gewerkt.');
    expect(html).toContain('href="/practice/questions-answers"');
  });
});
