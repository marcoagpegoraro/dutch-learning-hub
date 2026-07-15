import type { Difficulty } from '../../types/exercise';
import { normalizeAnswer } from '../../services/answerNormalization';

export interface PronunciationPhrase {
  id: string;
  difficulty: Difficulty;
  phrase: string;
  focus: string;
}

export const pronunciationPhrases: PronunciationPhrase[] = [
  {
    id: 'pronounce-easy-morning',
    difficulty: 'easy',
    phrase: 'Goedemorgen',
    focus: 'The Dutch g is made in the back of the throat.',
  },
  {
    id: 'pronounce-easy-thanks',
    difficulty: 'easy',
    phrase: 'Dank je wel',
    focus: 'Keep the words connected but clear.',
  },
  {
    id: 'pronounce-easy-name',
    difficulty: 'easy',
    phrase: 'Ik heet Maria',
    focus: 'The double ee is a long vowel.',
  },
  {
    id: 'pronounce-easy-home',
    difficulty: 'easy',
    phrase: 'Ik woon in Delft',
    focus: 'Woon has a long oo sound.',
  },
  {
    id: 'pronounce-easy-coffee',
    difficulty: 'easy',
    phrase: 'Een kop koffie, alstublieft',
    focus: 'Keep unstressed syllables light.',
  },
  {
    id: 'pronounce-medium-weather',
    difficulty: 'medium',
    phrase: 'Vandaag regent het een beetje',
    focus: 'Practise the g sounds in vandaag and regent.',
  },
  {
    id: 'pronounce-medium-train',
    difficulty: 'medium',
    phrase: 'De trein vertrekt om half negen',
    focus: 'Contrast the ei sound in trein with the short e sounds.',
  },
  {
    id: 'pronounce-medium-question',
    difficulty: 'medium',
    phrase: 'Waar kan ik een kaartje kopen?',
    focus: 'Let your pitch rise naturally for the question.',
  },
  {
    id: 'pronounce-medium-work',
    difficulty: 'medium',
    phrase: 'Morgen werk ik thuis',
    focus: 'The r and g may vary by Dutch region; clarity matters most.',
  },
  {
    id: 'pronounce-medium-doctor',
    difficulty: 'medium',
    phrase: 'Ik heb sinds gisteren keelpijn',
    focus: 'Keep the consonant cluster in sinds compact.',
  },
  {
    id: 'pronounce-hard-directions',
    difficulty: 'hard',
    phrase: 'Kunt u mij vertellen waar het gemeentehuis is?',
    focus: 'Use a polite, even rhythm and keep unstressed words short.',
  },
  {
    id: 'pronounce-hard-appointment',
    difficulty: 'hard',
    phrase: 'Zou ik de afspraak kunnen verzetten?',
    focus: 'Practise zou, afspraak, and the unstressed ending of kunnen.',
  },
  {
    id: 'pronounce-hard-because',
    difficulty: 'hard',
    phrase: 'Omdat de bus te laat was, ben ik gaan lopen',
    focus: 'Pause lightly at the clause boundary.',
  },
  {
    id: 'pronounce-hard-breakfast',
    difficulty: 'hard',
    phrase: 'Terwijl ik koffie inschenk, snijdt zij het brood',
    focus: 'Keep the sentence flowing across the subordinate clause.',
  },
  {
    id: 'pronounce-hard-municipality',
    difficulty: 'hard',
    phrase: 'Ik wil mij graag op mijn nieuwe adres inschrijven',
    focus: 'Stress graag, nieuwe, adres, and inschrijven.',
  },
];

export function recognitionMatchPercent(expected: string, transcript: string): number {
  const expectedWords = normalizeAnswer(expected).split(' ').filter(Boolean);
  const heardWords = normalizeAnswer(transcript).split(' ').filter(Boolean);
  const lengths = Array.from({ length: expectedWords.length + 1 }, () =>
    Array<number>(heardWords.length + 1).fill(0),
  );
  for (let i = 1; i <= expectedWords.length; i += 1) {
    for (let j = 1; j <= heardWords.length; j += 1) {
      lengths[i][j] =
        expectedWords[i - 1] === heardWords[j - 1]
          ? lengths[i - 1][j - 1] + 1
          : Math.max(lengths[i - 1][j], lengths[i][j - 1]);
    }
  }
  return expectedWords.length
    ? Math.round((lengths[expectedWords.length][heardWords.length] / expectedWords.length) * 100)
    : 0;
}
