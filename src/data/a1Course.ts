export interface CourseLesson {
  id: string;
  title: string;
  explanation: string;
  example: string;
  practiceRoute: string;
}

export interface CourseUnit {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  lessons: CourseLesson[];
  checkpoint: { prompt: string; options: string[]; correct: string; explanation: string };
}

const unit = (
  id: string,
  number: number,
  title: string,
  description: string,
  icon: string,
  route: string,
  lessonA: [string, string, string],
  lessonB: [string, string, string],
  checkpoint: [string, string[], string, string],
): CourseUnit => ({
  id,
  number,
  title,
  description,
  icon,
  lessons: [
    {
      id: 'lesson-1',
      title: lessonA[0],
      explanation: lessonA[1],
      example: lessonA[2],
      practiceRoute: route,
    },
    {
      id: 'lesson-2',
      title: lessonB[0],
      explanation: lessonB[1],
      example: lessonB[2],
      practiceRoute: route,
    },
  ],
  checkpoint: {
    prompt: checkpoint[0],
    options: checkpoint[1],
    correct: checkpoint[2],
    explanation: checkpoint[3],
  },
});

export const a1Course: CourseUnit[] = [
  unit(
    'greetings',
    1,
    'Greetings & introductions',
    'Meet someone and say who you are.',
    'bi-chat-heart',
    '/practice/vocabulary',
    ['Hello and goodbye', 'Use hallo informally and goedendag more formally.', 'Hallo! Tot ziens!'],
    ['Introduce yourself', 'Ik heet… and Ik ben… both introduce you.', 'Ik heet Noor.'],
    [
      'Which means “My name is Sam”?',
      ['Ik heet Sam.', 'Jij heet Sam.', 'Hoe heet je?'],
      'Ik heet Sam.',
      'Ik is the first-person subject.',
    ],
  ),
  unit(
    'personal-info',
    2,
    'Personal information',
    'Ask and answer simple personal questions.',
    'bi-person-vcard',
    '/practice/conversations',
    ['Basic questions', 'Question words include wie, wat, waar and hoe.', 'Waar woon je?'],
    [
      'Countries and languages',
      'Use uit for origin and spreken for languages.',
      'Ik kom uit Brazilië.',
    ],
    [
      'How do you ask “Where do you live?”',
      ['Waar woon je?', 'Wie woon je?', 'Wat woon je?'],
      'Waar woon je?',
      'Waar asks about a place.',
    ],
  ),
  unit(
    'numbers-age',
    3,
    'Numbers & age',
    'Count, share ages and understand prices.',
    'bi-123',
    '/practice/numbers',
    ['Numbers to 100', 'From 21, Dutch says the unit before the tens.', 'eenentwintig = 21'],
    ['Talking about age', 'Dutch uses zijn for age, not hebben.', 'Ik ben dertig jaar.'],
    [
      'Which is 24?',
      ['vierentwintig', 'veertig', 'tweeënveertig'],
      'vierentwintig',
      'The unit vier comes before twintig.',
    ],
  ),
  unit(
    'calendar-time',
    4,
    'Dates, calendar & time',
    'Plan your week and tell the time.',
    'bi-calendar3',
    '/practice/dates',
    ['Days and dates', 'Days and months normally use no capital letter.', 'maandag 3 maart'],
    ['Clock language', 'Dutch often counts toward the next half hour.', 'half negen = 8:30'],
    [
      'What time is “half negen”?',
      ['8:30', '9:30', '8:09'],
      '8:30',
      'Half negen is halfway toward nine.',
    ],
  ),
  unit(
    'family',
    5,
    'Family & possession',
    'Describe people close to you.',
    'bi-people',
    '/practice/vocabulary',
    ['Family words', 'Learn nouns together with de or het.', 'de moeder, het kind'],
    ['Possessives', 'Mijn, jouw, zijn and haar come before the noun.', 'Dit is mijn broer.'],
    [
      'Choose the correct phrase.',
      ['mijn zus', 'ik zus', 'mij zus'],
      'mijn zus',
      'Mijn is the possessive determiner.',
    ],
  ),
  unit(
    'home',
    6,
    'Home & objects',
    'Name everyday things around the house.',
    'bi-house-door',
    '/practice/articles',
    ['Rooms and objects', 'Attach an article when learning every noun.', 'de keuken, het raam'],
    ['There is / are', 'Er is is singular; er zijn is plural.', 'Er zijn twee stoelen.'],
    ['Complete: ___ huis', ['het', 'de', 'een de'], 'het', 'Huis is a het-word.'],
  ),
  unit(
    'present-verbs',
    7,
    'Present-tense verbs',
    'Build useful present-tense statements.',
    'bi-pencil-square',
    '/practice/verbs',
    ['The stem', 'Remove -en from the infinitive and adjust spelling.', 'werken → werk'],
    ['Subjects', 'For jij/hij/zij, normally add -t to the stem.', 'Zij werkt vandaag.'],
    [
      'Complete: ik ___ (werken)',
      ['werk', 'werkt', 'werken'],
      'werk',
      'The ik-form is the verb stem.',
    ],
  ),
  unit(
    'routine',
    8,
    'Daily routine',
    'Talk about an ordinary day.',
    'bi-sunrise',
    '/practice/missing-word',
    ['Routine vocabulary', 'Combine time phrases with frequent verbs.', 'Ik ontbijt om acht uur.'],
    ['Frequency', 'Altijd, vaak, soms and nooit describe frequency.', 'Wij fietsen vaak.'],
    [
      'Which means “I sometimes cook”?',
      ['Ik kook soms.', 'Ik soms koken.', 'Soms ik kook.'],
      'Ik kook soms.',
      'The finite verb stays in position two.',
    ],
  ),
  unit(
    'food-shopping',
    9,
    'Food & shopping',
    'Order food and buy essentials.',
    'bi-basket',
    '/practice/conversations',
    ['Polite requests', 'Graag and alstublieft make requests natural.', 'Een koffie, graag.'],
    ['Quantities and prices', 'Use hoeveel to ask for quantity or price.', 'Hoeveel kost dit?'],
    [
      'How do you ask the price?',
      ['Hoeveel kost dit?', 'Waar kost dit?', 'Wie kost dit?'],
      'Hoeveel kost dit?',
      'Hoeveel asks how much.',
    ],
  ),
  unit(
    'transport',
    10,
    'Transport & directions',
    'Find your way around town.',
    'bi-signpost',
    '/practice/prepositions',
    ['Travel words', 'Met introduces transport; te voet means on foot.', 'Ik ga met de trein.'],
    ['Directions', 'Links, rechts and rechtdoor guide movement.', 'Ga hier links.'],
    [
      'Choose “by bus”.',
      ['met de bus', 'op de bus', 'naar de bus'],
      'met de bus',
      'Use met for transport.',
    ],
  ),
  unit(
    'modal-verbs',
    11,
    'Modal verbs',
    'Express ability, wishes and obligation.',
    'bi-chat-square-text',
    '/practice/modal-verbs',
    [
      'Modal meaning',
      'Kunnen is ability; willen is desire; moeten is necessity.',
      'Ik kan zwemmen.',
    ],
    [
      'Two-verb order',
      'The modal is finite and the infinitive goes last.',
      'Wij moeten morgen werken.',
    ],
    [
      'Choose the correct sentence.',
      ['Ik wil Nederlands leren.', 'Ik Nederlands wil leren.', 'Ik wil leren Nederlands.'],
      'Ik wil Nederlands leren.',
      'The infinitive normally closes the clause.',
    ],
  ),
  unit(
    'word-order',
    12,
    'Word order & inversion',
    'Keep the verb in the right position.',
    'bi-list-ol',
    '/practice/word-order',
    ['Main clauses', 'The finite verb takes position two.', 'Vandaag werk ik thuis.'],
    [
      'Inversion',
      'When another element comes first, subject follows the verb.',
      'Morgen ga ik naar school.',
    ],
    [
      'Choose the correct sentence.',
      ['Morgen ga ik werken.', 'Morgen ik ga werken.', 'Morgen werken ik ga.'],
      'Morgen ga ik werken.',
      'Morgen is first, so ga precedes ik.',
    ],
  ),
  unit(
    'negation',
    13,
    'Niet versus geen',
    'Make accurate negative sentences.',
    'bi-slash-circle',
    '/practice/negation',
    ['Geen', 'Use geen before an indefinite noun.', 'Ik heb geen auto.'],
    ['Niet', 'Use niet to negate verbs, adjectives or definite ideas.', 'De koffie is niet warm.'],
    [
      'Complete: Ik heb ___ fiets.',
      ['geen', 'niet', 'niets'],
      'geen',
      'An indefinite noun takes geen.',
    ],
  ),
  unit(
    'separable',
    14,
    'Separable verbs',
    'Split common verbs in main clauses.',
    'bi-arrows-expand',
    '/practice/separable-verbs',
    [
      'Recognise the prefix',
      'Common prefixes include op-, aan-, uit- and mee-.',
      'opstaan, aankomen',
    ],
    [
      'Split position',
      'The conjugated part takes position two; prefix goes last.',
      'Ik sta vroeg op.',
    ],
    [
      'Choose the correct sentence.',
      ['Ik bel je vanavond op.', 'Ik opbel je vanavond.', 'Ik bel op je vanavond.'],
      'Ik bel je vanavond op.',
      'The prefix op closes the clause.',
    ],
  ),
  unit(
    'perfect',
    15,
    'Basic perfect tense',
    'Talk about completed events.',
    'bi-clock-history',
    '/practice/perfect-tense',
    [
      'Auxiliaries',
      'Most verbs use hebben; movement/change verbs often use zijn.',
      'Ik heb gewerkt.',
    ],
    [
      'Past participles',
      'Regular participles often use ge- plus stem plus -d/-t.',
      'maken → gemaakt',
    ],
    [
      'Choose the correct sentence.',
      ['Wij hebben gegeten.', 'Wij zijn gegeten.', 'Wij hebben eten.'],
      'Wij hebben gegeten.',
      'Eten uses hebben and the participle gegeten.',
    ],
  ),
  unit(
    'mixed-review',
    16,
    'A1 mixed review',
    'Combine your core A1 skills.',
    'bi-award',
    '/practice/boss-battle',
    [
      'Connect the pieces',
      'Check subject, finite verb, time and remaining verbs.',
      'Morgen wil ik vroeg opstaan.',
    ],
    [
      'Communicate clearly',
      'A simple correct sentence is better than a complex uncertain one.',
      'Kunt u dat herhalen?',
    ],
    [
      'Choose the correct sentence.',
      ['Vandaag heb ik geen tijd.', 'Vandaag ik heb niet tijd.', 'Vandaag geen tijd ik heb.'],
      'Vandaag heb ik geen tijd.',
      'The finite verb is second and an indefinite noun uses geen.',
    ],
  ),
];

export const courseLessonId = (unitId: string, lessonId: string) => `course:${unitId}:${lessonId}`;
export const courseCheckpointId = (unitId: string) => `course:${unitId}:checkpoint`;

export function isCourseUnitUnlocked(unitIndex: number, completed: string[]): boolean {
  return unitIndex === 0 || completed.includes(courseCheckpointId(a1Course[unitIndex - 1].id));
}

export function courseUnitProgress(courseUnit: CourseUnit, completed: string[]): number {
  const ids = [
    ...courseUnit.lessons.map((lesson) => courseLessonId(courseUnit.id, lesson.id)),
    courseCheckpointId(courseUnit.id),
  ];
  return Math.round((ids.filter((id) => completed.includes(id)).length / ids.length) * 100);
}
