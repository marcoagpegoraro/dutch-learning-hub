import type { LearningModule } from '../types/exercise';

const timeModule: LearningModule = {
  id: 'time',
  title: 'Dutch Time Practice',
  description: 'Read analog and digital clocks and write the time naturally.',
  icon: 'bi-clock',
  category: 'skills',
  status: 'available',
  route: '/practice/time',
};

const placeholderModules: Array<
  readonly [string, string, string, string, LearningModule['category']]
> = [
  [
    'word-order',
    'Word Order Trainer',
    'Build correct Dutch sentences from shuffled words.',
    'bi-list-ol',
    'grammar',
  ],
  [
    'articles',
    'De / Het Trainer',
    'Choose the right article and learn useful noun patterns.',
    'bi-tags',
    'grammar',
  ],
  [
    'verbs',
    'Verb Conjugation',
    'Practice present, past, perfect, modal, and irregular verbs.',
    'bi-pencil-square',
    'grammar',
  ],
  [
    'listening',
    'Listening Trainer',
    'Listen to Dutch words and phrases, then choose or type.',
    'bi-headphones',
    'skills',
  ],
  [
    'prepositions',
    'Preposition Trainer',
    'Learn position words with simple visual prompts.',
    'bi-geo-alt',
    'grammar',
  ],
  [
    'separable-verbs',
    'Separable Verbs',
    'Place common separable verbs correctly in sentences.',
    'bi-arrows-expand',
    'grammar',
  ],
  [
    'translation',
    'Translation Trainer',
    'Translate curated English or Portuguese prompts into Dutch.',
    'bi-translate',
    'skills',
  ],
  [
    'modal-verbs',
    'Modal Verb Trainer',
    'Practice kunnen, willen, mogen, moeten, and zullen.',
    'bi-chat-square-text',
    'grammar',
  ],
  [
    'negation',
    'Negation Trainer',
    'Learn when and where to use niet and geen.',
    'bi-slash-circle',
    'grammar',
  ],
  [
    'perfect-tense',
    'Perfect Tense Builder',
    'Choose the auxiliary and build complete past sentences.',
    'bi-hammer',
    'grammar',
  ],
  [
    'picture-description',
    'Picture Description',
    'Describe a scene with keywords and sample sentences.',
    'bi-image',
    'skills',
  ],
  [
    'vocabulary',
    'Vocabulary Builder',
    'Grow practical vocabulary by topic and review it often.',
    'bi-journal-bookmark',
    'vocabulary',
  ],
  [
    'body',
    'Body Vocabulary',
    'Learn body parts in Dutch, including whether each word uses de or het.',
    'bi-person-arms-up',
    'vocabulary',
  ],
  [
    'word-lists',
    'Word List Drill',
    'Memorise a whole list in both directions, or create and save your own.',
    'bi-card-list',
    'vocabulary',
  ],
  [
    'conversations',
    'Conversation Simulator',
    'Work through useful, predefined everyday conversations.',
    'bi-people',
    'skills',
  ],
  [
    'find-the-mistake',
    'Find the Mistake',
    'Spot and correct common Dutch grammar errors.',
    'bi-search',
    'review',
  ],
  [
    'numbers',
    'Number Trainer',
    'Practice numbers, prices, phone numbers, and years.',
    'bi-123',
    'vocabulary',
  ],
  [
    'dates',
    'Date & Calendar',
    'Practice weekdays, dates, appointments, and relative time.',
    'bi-calendar3',
    'vocabulary',
  ],
  [
    'pronunciation',
    'Pronunciation Shadowing',
    'Experimentally compare speech recognition with a phrase.',
    'bi-mic',
    'skills',
  ],
  [
    'missing-word',
    'Fill the Missing Word',
    'Complete contextual vocabulary and grammar sentences.',
    'bi-input-cursor-text',
    'review',
  ],
  [
    'boss-battle',
    'Grammar Boss Battles',
    'Mix familiar question types into a playful challenge.',
    'bi-controller',
    'review',
  ],
];

const availableModuleIds = new Set([
  'word-order',
  'articles',
  'verbs',
  'vocabulary',
  'body',
  'word-lists',
  'numbers',
  'dates',
  'missing-word',
  'modal-verbs',
  'negation',
  'separable-verbs',
  'perfect-tense',
  'prepositions',
  'find-the-mistake',
  'translation',
  'listening',
  'conversations',
  'picture-description',
  'pronunciation',
  'boss-battle',
]);

export const learningModules: LearningModule[] = [
  timeModule,
  ...placeholderModules.map(([id, title, description, icon, category]): LearningModule => {
    const available = availableModuleIds.has(id);
    return {
      id,
      title,
      description,
      icon,
      category,
      status: available ? 'available' : 'coming-soon',
      route: available ? `/practice/${id}` : `/modules/${id}`,
    };
  }),
];

export function findModule(moduleId: string | undefined): LearningModule | undefined {
  return learningModules.find((module) => module.id === moduleId);
}
