import type { Difficulty } from '../../types/exercise';
import type { QuizQuestion } from '../shared/quizUtils';

export interface VocabularyWord {
  id: string;
  dutch: string;
  article?: 'de' | 'het';
  english: string;
  portuguese: string;
  plural?: string;
  example: string;
  category: 'home' | 'kitchen' | 'transport' | 'food' | 'family' | 'weather';
  difficulty: Difficulty;
  emoji: string;
}

export const vocabularyWords: VocabularyWord[] = [
  {
    id: 'door',
    dutch: 'deur',
    article: 'de',
    english: 'door',
    portuguese: 'porta',
    plural: 'deuren',
    example: 'De deur is open.',
    category: 'home',
    difficulty: 'easy',
    emoji: '🚪',
  },
  {
    id: 'chair',
    dutch: 'stoel',
    article: 'de',
    english: 'chair',
    portuguese: 'cadeira',
    plural: 'stoelen',
    example: 'Ik zit op de stoel.',
    category: 'home',
    difficulty: 'easy',
    emoji: '🪑',
  },
  {
    id: 'bed',
    dutch: 'bed',
    article: 'het',
    english: 'bed',
    portuguese: 'cama',
    plural: 'bedden',
    example: 'Het bed staat boven.',
    category: 'home',
    difficulty: 'easy',
    emoji: '🛏️',
  },
  {
    id: 'bread',
    dutch: 'brood',
    article: 'het',
    english: 'bread',
    portuguese: 'pão',
    plural: 'broden',
    example: 'Ik eet brood.',
    category: 'food',
    difficulty: 'easy',
    emoji: '🍞',
  },
  {
    id: 'apple',
    dutch: 'appel',
    article: 'de',
    english: 'apple',
    portuguese: 'maçã',
    plural: 'appels',
    example: 'De appel is rood.',
    category: 'food',
    difficulty: 'easy',
    emoji: '🍎',
  },
  {
    id: 'train',
    dutch: 'trein',
    article: 'de',
    english: 'train',
    portuguese: 'trem',
    plural: 'treinen',
    example: 'De trein vertrekt om acht uur.',
    category: 'transport',
    difficulty: 'easy',
    emoji: '🚆',
  },
  {
    id: 'spoon',
    dutch: 'lepel',
    article: 'de',
    english: 'spoon',
    portuguese: 'colher',
    plural: 'lepels',
    example: 'De lepel ligt op tafel.',
    category: 'kitchen',
    difficulty: 'medium',
    emoji: '🥄',
  },
  {
    id: 'fridge',
    dutch: 'koelkast',
    article: 'de',
    english: 'fridge',
    portuguese: 'geladeira',
    plural: 'koelkasten',
    example: 'De melk staat in de koelkast.',
    category: 'kitchen',
    difficulty: 'medium',
    emoji: '🧊',
  },
  {
    id: 'ticket',
    dutch: 'kaartje',
    article: 'het',
    english: 'ticket',
    portuguese: 'bilhete',
    plural: 'kaartjes',
    example: 'Ik koop een kaartje.',
    category: 'transport',
    difficulty: 'medium',
    emoji: '🎫',
  },
  {
    id: 'cloud',
    dutch: 'wolk',
    article: 'de',
    english: 'cloud',
    portuguese: 'nuvem',
    plural: 'wolken',
    example: 'Er is een donkere wolk.',
    category: 'weather',
    difficulty: 'medium',
    emoji: '☁️',
  },
  {
    id: 'brother',
    dutch: 'broer',
    article: 'de',
    english: 'brother',
    portuguese: 'irmão',
    plural: 'broers',
    example: 'Mijn broer woont in Utrecht.',
    category: 'family',
    difficulty: 'medium',
    emoji: '👦',
  },
  {
    id: 'parents',
    dutch: 'ouders',
    english: 'parents',
    portuguese: 'pais',
    plural: 'ouders',
    example: 'Mijn ouders komen morgen.',
    category: 'family',
    difficulty: 'medium',
    emoji: '👪',
  },
  {
    id: 'drawer',
    dutch: 'lade',
    article: 'de',
    english: 'drawer',
    portuguese: 'gaveta',
    plural: 'laden',
    example: 'Het bestek ligt in de lade.',
    category: 'kitchen',
    difficulty: 'hard',
    emoji: '🗄️',
  },
  {
    id: 'platform',
    dutch: 'perron',
    article: 'het',
    english: 'platform',
    portuguese: 'plataforma',
    plural: 'perrons',
    example: 'De trein staat op perron vijf.',
    category: 'transport',
    difficulty: 'hard',
    emoji: '🚉',
  },
  {
    id: 'drizzle',
    dutch: 'motregen',
    article: 'de',
    english: 'drizzle',
    portuguese: 'garoa',
    example: 'Vandaag is er motregen.',
    category: 'weather',
    difficulty: 'hard',
    emoji: '🌦️',
  },
  {
    id: 'blanket',
    dutch: 'deken',
    article: 'de',
    english: 'blanket',
    portuguese: 'cobertor',
    plural: 'dekens',
    example: 'De deken is warm.',
    category: 'home',
    difficulty: 'hard',
    emoji: '🧶',
  },
  {
    id: 'cousin',
    dutch: 'neef',
    article: 'de',
    english: 'male cousin',
    portuguese: 'primo',
    plural: 'neven',
    example: 'Mijn neef studeert Nederlands.',
    category: 'family',
    difficulty: 'hard',
    emoji: '🧑',
  },
  {
    id: 'vegetables',
    dutch: 'groente',
    article: 'de',
    english: 'vegetables',
    portuguese: 'legumes',
    plural: 'groenten',
    example: 'We eten veel groente.',
    category: 'food',
    difficulty: 'hard',
    emoji: '🥦',
  },
];

function displayDutch(word: VocabularyWord): string {
  return word.article ? `${word.article} ${word.dutch}` : word.dutch;
}

export function buildVocabularyQuestions(words = vocabularyWords): QuizQuestion[] {
  return words.map((word, index) => {
    const details = `${word.example}${word.plural ? ` Plural: ${word.plural}.` : ''} Portuguese: ${word.portuguese}.`;
    if (word.difficulty === 'easy') {
      const distractors = [1, 2, 3].map((offset) => words[(index + offset) % words.length].english);
      return {
        id: `vocabulary-${word.id}`,
        moduleId: 'vocabulary',
        difficulty: word.difficulty,
        type: 'multiple-choice',
        prompt: `${word.emoji} What does “${displayDutch(word)}” mean?`,
        options: [word.english, ...distractors].sort(),
        correctOption: word.english,
        hint: `Category: ${word.category}.`,
        explanation: details,
        tags: [word.category, 'Dutch → English'],
      };
    }
    if (word.difficulty === 'medium') {
      const distractors = [1, 2, 3].map((offset) =>
        displayDutch(words[(index + offset) % words.length]),
      );
      return {
        id: `vocabulary-${word.id}`,
        moduleId: 'vocabulary',
        difficulty: word.difficulty,
        type: 'multiple-choice',
        prompt: `${word.emoji} Choose the Dutch word for “${word.english}”.`,
        options: [displayDutch(word), ...distractors].sort(),
        correctOption: displayDutch(word),
        hint: word.article ? `This noun uses “${word.article}”.` : `Category: ${word.category}.`,
        explanation: details,
        tags: [word.category, 'English → Dutch'],
      };
    }
    return {
      id: `vocabulary-${word.id}`,
      moduleId: 'vocabulary',
      difficulty: word.difficulty,
      type: 'text',
      prompt: `${word.emoji} Translate “${word.english}” into Dutch. Include the article when shown in feedback.`,
      acceptedAnswers: word.article ? [displayDutch(word), word.dutch] : [word.dutch],
      hint: `Category: ${word.category}; Portuguese: ${word.portuguese}.`,
      explanation: details,
      tags: [word.category, 'production'],
    };
  });
}
