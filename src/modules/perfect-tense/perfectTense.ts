import type { QuizQuestion } from '../shared/quizUtils';

export type Auxiliary = 'hebben' | 'zijn';

interface PerfectVerb {
  infinitive: string;
  participle: string;
  auxiliary: Auxiliary;
  example: string;
}

export const perfectVerbs: PerfectVerb[] = [
  {
    infinitive: 'werken',
    participle: 'gewerkt',
    auxiliary: 'hebben',
    example: 'Ik heb gisteren gewerkt',
  },
  {
    infinitive: 'maken',
    participle: 'gemaakt',
    auxiliary: 'hebben',
    example: 'Zij heeft eten gemaakt',
  },
  {
    infinitive: 'leren',
    participle: 'geleerd',
    auxiliary: 'hebben',
    example: 'Wij hebben Nederlands geleerd',
  },
  {
    infinitive: 'eten',
    participle: 'gegeten',
    auxiliary: 'hebben',
    example: 'Hij heeft een appel gegeten',
  },
  {
    infinitive: 'zien',
    participle: 'gezien',
    auxiliary: 'hebben',
    example: 'Ik heb die film gezien',
  },
  {
    infinitive: 'gaan',
    participle: 'gegaan',
    auxiliary: 'zijn',
    example: 'Wij zijn naar huis gegaan',
  },
  {
    infinitive: 'komen',
    participle: 'gekomen',
    auxiliary: 'zijn',
    example: 'Mijn broer is gekomen',
  },
  {
    infinitive: 'blijven',
    participle: 'gebleven',
    auxiliary: 'zijn',
    example: 'Zij is thuis gebleven',
  },
];

export function getPerfectVerb(infinitive: string): PerfectVerb {
  const verb = perfectVerbs.find((item) => item.infinitive === infinitive);
  if (!verb) throw new Error(`Unknown perfect-tense verb: ${infinitive}`);
  return verb;
}

export function buildPerfectTenseQuestions(): QuizQuestion[] {
  const easyVerbs = [
    perfectVerbs[0],
    perfectVerbs[3],
    perfectVerbs[5],
    perfectVerbs[6],
    perfectVerbs[7],
  ];
  const easy = easyVerbs.map((verb): QuizQuestion => ({
    id: `perfect-aux-${verb.infinitive}`,
    moduleId: 'perfect-tense',
    difficulty: 'easy',
    type: 'multiple-choice',
    prompt: `Choose the auxiliary for “${verb.infinitive}” in the perfect tense.`,
    dutchAudio: verb.infinitive,
    dutchAnswerAudio: verb.example,
    options: ['hebben', 'zijn'],
    correctOption: verb.auxiliary,
    hint: 'Most verbs use hebben; movement or change-of-state verbs often use zijn.',
    explanation: `${verb.infinitive} uses ${verb.auxiliary}: ${verb.example}.`,
    tags: ['auxiliary'],
  }));
  const medium = perfectVerbs.slice(1, 6).map((verb): QuizQuestion => ({
    id: `perfect-participle-${verb.infinitive}`,
    moduleId: 'perfect-tense',
    difficulty: 'medium',
    type: 'text',
    prompt: `Type the past participle of “${verb.infinitive}”.`,
    dutchAudio: verb.infinitive,
    dutchAnswerAudio: verb.example,
    acceptedAnswers: [verb.participle],
    hint: verb.participle.startsWith('ge')
      ? 'Many participles use ge- + stem + -d/-t.'
      : 'This participle is irregular.',
    explanation: `The participle is ${verb.participle}: ${verb.example}.`,
    tags: ['participle'],
  }));
  const hard = perfectVerbs.slice(3).map((verb): QuizQuestion => ({
    id: `perfect-sentence-${verb.infinitive}`,
    moduleId: 'perfect-tense',
    difficulty: 'hard',
    type: 'text',
    prompt: `Write this complete perfect-tense sentence: ${verb.example.replace(/^(Ik|Zij|Wij|Hij|Mijn broer) (heb|heeft|hebben|zijn|is) /, '$1 ___ ')}`,
    acceptedAnswers: [verb.example],
    hint: `Use ${verb.auxiliary} and the participle ${verb.participle}.`,
    explanation: `${verb.example}. The auxiliary is finite and the participle closes the sentence.`,
    tags: ['sentence building'],
  }));
  return [...easy, ...medium, ...hard];
}
