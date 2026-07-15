import { mistakeQuestions } from '../find-the-mistake/mistakeData';
import { buildModalVerbQuestions } from '../modal-verbs/modalVerbs';
import { negationQuestions } from '../negation/negation';
import { buildPerfectTenseQuestions } from '../perfect-tense/perfectTense';
import { prepositionQuestions } from '../prepositions/prepositionData';
import { buildSeparableVerbQuestions } from '../separable-verbs/separableVerbs';
import { translationQuestions } from '../translation/translationData';
import type { QuizQuestion } from '../shared/quizUtils';

export interface GrammarBoss {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bossHealth: number;
  playerHealth: number;
  questions: QuizQuestion[];
}

const take = (questions: QuizQuestion[], count: number) => questions.slice(0, count);

export const grammarBosses: GrammarBoss[] = [
  {
    id: 'word-order-warden',
    title: 'Word Order Warden',
    subtitle: 'Break through negation, modals and location patterns.',
    icon: 'bi-bricks',
    difficulty: 'easy',
    bossHealth: 6,
    playerHealth: 4,
    questions: [
      ...take(negationQuestions, 4),
      ...take(buildModalVerbQuestions(), 4),
      ...take(prepositionQuestions, 4),
    ],
  },
  {
    id: 'verb-dragon',
    title: 'Verb Dragon',
    subtitle: 'Tame separable verbs and the perfect tense.',
    icon: 'bi-fire',
    difficulty: 'medium',
    bossHealth: 8,
    playerHealth: 4,
    questions: [
      ...take(buildSeparableVerbQuestions(), 6),
      ...take(buildPerfectTenseQuestions(), 6),
    ],
  },
  {
    id: 'a1-final-boss',
    title: 'A1 Final Boss',
    subtitle: 'A mixed grammar challenge for everything you have learned.',
    icon: 'bi-lightning-charge-fill',
    difficulty: 'hard',
    bossHealth: 10,
    playerHealth: 5,
    questions: [
      ...take(mistakeQuestions, 5),
      ...take(translationQuestions, 5),
      ...take(buildPerfectTenseQuestions(), 3),
      ...take(negationQuestions, 3),
    ],
  },
];
