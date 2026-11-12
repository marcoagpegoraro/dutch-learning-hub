import type { Difficulty } from '../../types/exercise';
import type { QuizQuestion } from '../shared/quizUtils';

export type SubjectPronoun = 'ik' | 'jij' | 'hij' | 'wij' | 'jullie' | 'zij';

export interface PresentVerb {
  id: string;
  infinitive: string;
  english: string;
  forms: Record<SubjectPronoun, string>;
  difficulty: Difficulty;
}

export const presentVerbs: PresentVerb[] = [
  {
    id: 'werken',
    infinitive: 'werken',
    english: 'to work',
    difficulty: 'easy',
    forms: {
      ik: 'werk',
      jij: 'werkt',
      hij: 'werkt',
      wij: 'werken',
      jullie: 'werken',
      zij: 'werken',
    },
  },
  {
    id: 'wonen',
    infinitive: 'wonen',
    english: 'to live',
    difficulty: 'easy',
    forms: { ik: 'woon', jij: 'woont', hij: 'woont', wij: 'wonen', jullie: 'wonen', zij: 'wonen' },
  },
  {
    id: 'leren',
    infinitive: 'leren',
    english: 'to learn',
    difficulty: 'easy',
    forms: { ik: 'leer', jij: 'leert', hij: 'leert', wij: 'leren', jullie: 'leren', zij: 'leren' },
  },
  {
    id: 'maken',
    infinitive: 'maken',
    english: 'to make',
    difficulty: 'easy',
    forms: { ik: 'maak', jij: 'maakt', hij: 'maakt', wij: 'maken', jullie: 'maken', zij: 'maken' },
  },
  {
    id: 'reizen',
    infinitive: 'reizen',
    english: 'to travel',
    difficulty: 'medium',
    forms: {
      ik: 'reis',
      jij: 'reist',
      hij: 'reist',
      wij: 'reizen',
      jullie: 'reizen',
      zij: 'reizen',
    },
  },
  {
    id: 'lezen',
    infinitive: 'lezen',
    english: 'to read',
    difficulty: 'medium',
    forms: { ik: 'lees', jij: 'leest', hij: 'leest', wij: 'lezen', jullie: 'lezen', zij: 'lezen' },
  },
  {
    id: 'hebben',
    infinitive: 'hebben',
    english: 'to have',
    difficulty: 'medium',
    forms: { ik: 'heb', jij: 'hebt', hij: 'heeft', wij: 'hebben', jullie: 'hebben', zij: 'hebben' },
  },
  {
    id: 'gaan',
    infinitive: 'gaan',
    english: 'to go',
    difficulty: 'medium',
    forms: { ik: 'ga', jij: 'gaat', hij: 'gaat', wij: 'gaan', jullie: 'gaan', zij: 'gaan' },
  },
  {
    id: 'zijn',
    infinitive: 'zijn',
    english: 'to be',
    difficulty: 'hard',
    forms: { ik: 'ben', jij: 'bent', hij: 'is', wij: 'zijn', jullie: 'zijn', zij: 'zijn' },
  },
  {
    id: 'komen',
    infinitive: 'komen',
    english: 'to come',
    difficulty: 'hard',
    forms: { ik: 'kom', jij: 'komt', hij: 'komt', wij: 'komen', jullie: 'komen', zij: 'komen' },
  },
  {
    id: 'eten',
    infinitive: 'eten',
    english: 'to eat',
    difficulty: 'hard',
    forms: { ik: 'eet', jij: 'eet', hij: 'eet', wij: 'eten', jullie: 'eten', zij: 'eten' },
  },
  {
    id: 'zien',
    infinitive: 'zien',
    english: 'to see',
    difficulty: 'hard',
    forms: { ik: 'zie', jij: 'ziet', hij: 'ziet', wij: 'zien', jullie: 'zien', zij: 'zien' },
  },
];

export function conjugatePresent(verbId: string, pronoun: SubjectPronoun): string {
  const verb = presentVerbs.find((item) => item.id === verbId);
  if (!verb) throw new Error(`Unknown verb: ${verbId}`);
  return verb.forms[pronoun];
}

export function buildPresentTenseQuestions(): QuizQuestion[] {
  const pronouns: SubjectPronoun[] = ['ik', 'jij', 'hij', 'wij', 'jullie', 'zij'];
  return presentVerbs.flatMap((verb, index) => {
    const firstPronoun = pronouns[index % pronouns.length];
    const secondPronoun = pronouns[(index + 2) % pronouns.length];
    return [firstPronoun, secondPronoun].map((pronoun, questionIndex): QuizQuestion => {
      const correct = conjugatePresent(verb.id, pronoun);
      if (verb.difficulty === 'easy') {
        const options = Array.from(
          new Set([correct, verb.forms.ik, verb.forms.hij, verb.infinitive]),
        );
        while (options.length < 3) options.push(`${correct}t`);
        return {
          id: `verbs-${verb.id}-${pronoun}-${questionIndex}`,
          moduleId: 'verbs',
          difficulty: verb.difficulty,
          type: 'multiple-choice',
          prompt: `Complete: “${pronoun} ___” (${verb.infinitive} — ${verb.english})`,
          dutchAudio: verb.infinitive,
          options: options.slice(0, 4),
          correctOption: correct,
          hint:
            pronoun === 'ik'
              ? 'The ik-form is normally the stem.'
              : 'Singular jij/hij normally adds -t.',
          explanation: `${pronoun} ${correct}. The plural forms wij/jullie/zij use the infinitive.`,
          tags: ['present tense', 'recognition'],
        };
      }
      return {
        id: `verbs-${verb.id}-${pronoun}-${questionIndex}`,
        moduleId: 'verbs',
        difficulty: verb.difficulty,
        type: 'text',
        prompt: `Complete with the present tense: “${pronoun} ___” (${verb.infinitive} — ${verb.english})`,
        dutchAudio: verb.infinitive,
        acceptedAnswers: [correct],
        hint:
          verb.difficulty === 'hard'
            ? 'This verb has an irregular or spelling-changing singular form.'
            : 'Check whether the subject is singular or plural.',
        explanation: `The correct form is ${pronoun} ${correct}. Full set: ik ${verb.forms.ik}, jij ${verb.forms.jij}, hij ${verb.forms.hij}, wij ${verb.forms.wij}.`,
        tags: ['present tense', verb.difficulty === 'hard' ? 'irregular' : 'typed answer'],
      };
    });
  });
}
