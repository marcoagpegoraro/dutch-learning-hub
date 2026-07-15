import type { Difficulty } from '../../types/exercise';

export interface PictureTask {
  id: string;
  difficulty: Difficulty;
  prompt: string;
  keywords: string[];
  samples: string[];
}

export const pictureTasks: PictureTask[] = [
  {
    id: 'picture-easy-objects',
    difficulty: 'easy',
    prompt: 'Name at least four things you see in the room.',
    keywords: ['de tafel', 'de stoel', 'het raam', 'de klok', 'de plant', 'de fiets'],
    samples: [
      'Ik zie een tafel, drie stoelen, een raam en een klok.',
      'Er staat een plant naast het raam en buiten staat een fiets.',
    ],
  },
  {
    id: 'picture-easy-people',
    difficulty: 'easy',
    prompt: 'Who is in the room? Write two simple sentences.',
    keywords: ['twee volwassenen', 'een kind', 'de kat', 'de hond'],
    samples: ['Er zijn twee volwassenen en een kind.', 'Er zijn ook een kat en een hond.'],
  },
  {
    id: 'picture-easy-colours',
    difficulty: 'easy',
    prompt: 'Describe two colours and the objects that have them.',
    keywords: ['blauw', 'rood', 'groen', 'oranje'],
    samples: ['De kop is blauw en de rugzak is rood.', 'De plant is groen en de kat is oranje.'],
  },
  {
    id: 'picture-medium-actions',
    difficulty: 'medium',
    prompt: 'Describe what the three people are doing.',
    keywords: ['koffie inschenken', 'brood snijden', 'de kat eten geven', 'ontbijt maken'],
    samples: [
      'Een persoon schenkt koffie in.',
      'De andere persoon snijdt brood en het kind geeft de kat eten.',
    ],
  },
  {
    id: 'picture-medium-position',
    difficulty: 'medium',
    prompt: 'Use at least three position words to describe the room.',
    keywords: ['op', 'onder', 'naast', 'voor', 'buiten'],
    samples: [
      'De appels liggen op tafel en de rugzak ligt onder een stoel.',
      'De plant staat naast het raam en de fiets staat buiten.',
    ],
  },
  {
    id: 'picture-medium-time',
    difficulty: 'medium',
    prompt: 'Describe the time, weather, and likely part of the day.',
    keywords: ['half negen', 'regen', 'ochtend', 'ontbijt'],
    samples: ['Het is half negen in de ochtend.', 'Het regent buiten en het gezin maakt ontbijt.'],
  },
  {
    id: 'picture-hard-scene',
    difficulty: 'hard',
    prompt: 'Write a connected four-sentence description of the whole scene.',
    keywords: ['terwijl', 'omdat', 'naast', 'buiten'],
    samples: [
      'Het is half negen en een gezin maakt ontbijt in de keuken.',
      'Terwijl een persoon koffie inschenkt, snijdt de andere brood.',
      'Het kind geeft de oranje kat eten en de hond slaapt op het kleed.',
      'Buiten regent het en er staat een fiets voor het raam.',
    ],
  },
  {
    id: 'picture-hard-story',
    difficulty: 'hard',
    prompt: 'Imagine what happened just before this scene and what will happen next.',
    keywords: ['net', 'daarna', 'waarschijnlijk', 'voordat'],
    samples: [
      'Het gezin is net opgestaan en maakt nu ontbijt.',
      'Daarna gaan de volwassenen waarschijnlijk naar hun werk en gaat het kind naar school.',
    ],
  },
  {
    id: 'picture-hard-contrast',
    difficulty: 'hard',
    prompt: 'Contrast the atmosphere inside with the weather outside.',
    keywords: ['binnen', 'buiten', 'gezellig', 'hoewel'],
    samples: [
      'Binnen is het warm en gezellig, terwijl het buiten regent.',
      'Hoewel het weer grijs is, begint het gezin rustig aan de dag.',
    ],
  },
];

export function keywordCoverage(answer: string, keywords: string[]): number {
  const normalized = answer.toLocaleLowerCase('nl-NL');
  const matched = keywords.filter((keyword) =>
    normalized.includes(keyword.toLocaleLowerCase('nl-NL')),
  );
  return keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;
}
