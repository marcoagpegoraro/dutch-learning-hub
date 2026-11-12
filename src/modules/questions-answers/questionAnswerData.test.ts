import { describe, expect, it } from 'vitest';
import { findModule } from '../../data/modules';
import { isQuizAnswerCorrect, remainingQuizQuestions } from '../shared/quizUtils';
import { recordAttempt, type AttemptInput } from '../../services/progress';
import {
  createDefaultState,
  parseImportedState,
  validateAndMigrateState,
} from '../../services/storage';
import {
  buildQuestionAnswerExercises,
  questionAnswerScenarios,
  structureGuides,
} from './questionAnswerData';

const questions = buildQuestionAnswerExercises();
const question = (scenario: string, task = 'answer') =>
  questions.find((item) => item.id === `questions-answers-${scenario}-${task}`)!;

describe('question and answer content', () => {
  it('provides 30 scenarios with a question and answer, balanced across difficulties and modes', () => {
    expect(questionAnswerScenarios).toHaveLength(30);
    expect(questions).toHaveLength(60);
    expect(new Set(questions.map((item) => item.id)).size).toBe(questions.length);
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (const task of ['question', 'answer'] as const) {
        expect(
          questions.filter((item) => item.difficulty === difficulty && item.task === task),
        ).toHaveLength(10);
      }
    }
  });

  it('covers every structure with explanatory guidance and a Dutch sample', () => {
    const topics = new Set(questions.map((item) => item.topic));
    expect([...topics].sort()).toEqual(Object.keys(structureGuides).sort());
    for (const item of questions) {
      expect(item.explanation).toBeTruthy();
      expect(item.hint).toBeTruthy();
      expect(structureGuides[item.topic].dutch).toBeTruthy();
      expect(item.dutchAudio).toBeUndefined(); // Never read the hidden answer before checking it.
      for (const answer of item.acceptedAnswers)
        expect(isQuizAnswerCorrect(item, answer)).toBe(true);
    }
  });

  it('accepts informal pronoun and punctuation variants without accepting incorrect question order', () => {
    expect(isQuizAnswerCorrect(question('home', 'question'), 'Waar woon je?')).toBe(true);
    expect(isQuizAnswerCorrect(question('home', 'question'), 'WAAR WOON JIJ')).toBe(true);
    expect(isQuizAnswerCorrect(question('home', 'question'), 'Waar woont jij?')).toBe(false);
    expect(isQuizAnswerCorrect(question('home', 'question'), 'Waar jij woont?')).toBe(false);
    expect(isQuizAnswerCorrect(question('help', 'question'), 'Kun je me helpen?')).toBe(true);
    expect(isQuizAnswerCorrect(question('help', 'question'), 'Kun je me te helpen?')).toBe(false);
  });

  it('distinguishes reasons with omdat/want, purpose with om te, and inversion after daarom/als', () => {
    expect(isQuizAnswerCorrect(question('sick'), 'Ik blijf thuis omdat ik ziek ben.')).toBe(true);
    expect(isQuizAnswerCorrect(question('sick'), 'Ik blijf thuis omdat ik ben ziek.')).toBe(false);
    expect(
      isQuizAnswerCorrect(question('early-bed'), 'Ik ga vroeg naar bed want ik ben moe.'),
    ).toBe(true);
    expect(
      isQuizAnswerCorrect(question('early-bed'), 'Ik ga vroeg naar bed want ik moe ben.'),
    ).toBe(false);
    expect(
      isQuizAnswerCorrect(question('learn-purpose'), 'Ik leer Nederlands om werk te vinden.'),
    ).toBe(true);
    expect(
      isQuizAnswerCorrect(question('learn-purpose'), 'Ik leer Nederlands omdat werk te vinden.'),
    ).toBe(false);
    expect(
      isQuizAnswerCorrect(question('consequence'), 'Ik ben ziek. Daarom ik blijf thuis.'),
    ).toBe(false);
    expect(
      isQuizAnswerCorrect(question('condition-first'), 'Als ik ziek ben blijf ik thuis.'),
    ).toBe(true);
    expect(
      isQuizAnswerCorrect(question('condition-first'), 'Als ik ziek ben, ik blijf thuis.'),
    ).toBe(false);
  });

  it('accepts separable infinitives and both configured subordinate perfectum orders', () => {
    expect(
      isQuizAnswerCorrect(
        question('phone-purpose'),
        'Ik gebruik mijn telefoon om mijn moeder op te bellen.',
      ),
    ).toBe(true);
    expect(
      isQuizAnswerCorrect(
        question('phone-purpose'),
        'Ik gebruik mijn telefoon om mijn moeder te opbellen.',
      ),
    ).toBe(false);
    expect(isQuizAnswerCorrect(question('after-food'), 'Ik was af nadat ik gegeten heb.')).toBe(
      true,
    );
    expect(
      isQuizAnswerCorrect(
        question('missed-train'),
        'Ik heb de trein gemist omdat ik te laat vertrokken ben.',
      ),
    ).toBe(true);
    expect(
      isQuizAnswerCorrect(question('missed-train', 'question'), 'Waarom heb je de trein gemist?'),
    ).toBe(true);
  });

  it('exposes the new module and makes existing perfectum discoverable without changing its route', () => {
    expect(findModule('questions-answers')).toMatchObject({
      status: 'available',
      route: '/practice/questions-answers',
    });
    expect(findModule('perfect-tense')).toMatchObject({
      title: 'Perfectum (Perfect Tense)',
      route: '/practice/perfect-tense',
    });
  });
});

describe('saved question and answer mastery', () => {
  const input: AttemptInput = {
    questionId: questions[0].id,
    moduleId: 'questions-answers',
    difficulty: 'easy',
    prompt: questions[0].prompt,
    submittedAnswer: questions[0].acceptedAnswers[0],
    correctAnswer: questions[0].acceptedAnswers[0],
    correct: true,
    xpEarned: 10,
  };
  it('saves question and answer results independently and exports them', () => {
    let state = recordAttempt(createDefaultState(), input);
    state = recordAttempt(state, { ...input, questionId: questions[1].id, correct: false });
    expect(state.progress.masteredItems).toEqual([questions[0].id]);
    expect(remainingQuizQuestions(questions, 'easy', state.progress.masteredItems)).toHaveLength(
      19,
    );
    state = parseImportedState(JSON.stringify(state));
    expect(state.progress.masteredItems).toEqual([questions[0].id]);
    state.progress.masteredItems = [];
    expect(validateAndMigrateState(state).progress.masteredItems).toEqual([questions[0].id]);
  });
});
