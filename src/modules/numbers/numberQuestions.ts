import type { QuizQuestion } from '../shared/quizUtils';
import { numberToDutch, numberToDutchSpaced } from './numberWords';

const easyValues = [0, 5, 11, 16, 20, 24];
const mediumValues = [32, 47, 58, 76, 99, 100];
const hardValues = [125, 342, 999, 2026, 4500, 9999];

export function buildNumberQuestions(): QuizQuestion[] {
  const easy: QuizQuestion[] = easyValues.map((value, index) => {
    const alternatives = easyValues
      .filter((item) => item !== value)
      .slice(0, 3)
      .map(numberToDutch);
    return {
      id: `numbers-easy-${value}`,
      moduleId: 'numbers',
      difficulty: 'easy',
      type: 'multiple-choice',
      prompt: `Which Dutch word means ${value}?`,
      options: [numberToDutch(value), ...alternatives].sort(),
      correctOption: numberToDutch(value),
      hint:
        index < 3
          ? 'Say the number slowly and compare each option.'
          : 'Numbers up to twenty have individual forms.',
      explanation: `${value} is ${numberToDutch(value)} in Dutch.`,
      tags: ['0–20', 'recognition'],
    };
  });
  const typed = [
    ...mediumValues.map((value) => ({ value, difficulty: 'medium' as const })),
    ...hardValues.map((value) => ({ value, difficulty: 'hard' as const })),
  ];
  return [
    ...easy,
    ...typed.map(({ value, difficulty }): QuizQuestion => ({
      id: `numbers-${difficulty}-${value}`,
      moduleId: 'numbers',
      difficulty,
      type: 'text',
      prompt: `Write ${value.toLocaleString('nl-NL')} in Dutch words.`,
      acceptedAnswers: [
        numberToDutch(value),
        numberToDutchSpaced(value),
        numberToDutchSpaced(value).replaceAll(' ', '-'),
      ],
      hint:
        difficulty === 'medium'
          ? 'For 24, Dutch puts the unit before the tens: vier-en-twintig.'
          : 'Build thousands, hundreds, then the final two-digit number.',
      explanation: `${value.toLocaleString('nl-NL')} is written ${numberToDutch(value)}. Dutch number words are normally written together.`,
      tags: [difficulty === 'medium' ? '0–100' : 'hundreds & thousands', 'normalize-hyphens'],
    })),
    {
      id: 'numbers-price-12-50',
      moduleId: 'numbers',
      difficulty: 'hard',
      type: 'text',
      prompt: 'Write €12,50 as you would say the price in Dutch.',
      acceptedAnswers: ['twaalf euro vijftig', 'twaalf euro en vijftig cent'],
      hint: 'Say the euros first, then the cents.',
      explanation: '€12,50 can be said as twaalf euro vijftig or twaalf euro en vijftig cent.',
      tags: ['prices'],
    },
  ];
}
