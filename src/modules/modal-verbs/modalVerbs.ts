import type { QuizQuestion } from '../shared/quizUtils';

export type ModalVerbId = 'kunnen' | 'willen' | 'mogen' | 'moeten' | 'zullen';
export type ModalSubject = 'ik' | 'jij' | 'hij' | 'wij';

interface ModalVerb {
  id: ModalVerbId;
  meaning: string;
  forms: Record<ModalSubject, string>;
}

export const modalVerbs: ModalVerb[] = [
  { id: 'kunnen', meaning: 'can / to be able to', forms: { ik: 'kan', jij: 'kunt', hij: 'kan', wij: 'kunnen' } },
  { id: 'willen', meaning: 'to want to', forms: { ik: 'wil', jij: 'wilt', hij: 'wil', wij: 'willen' } },
  { id: 'mogen', meaning: 'may / to be allowed to', forms: { ik: 'mag', jij: 'mag', hij: 'mag', wij: 'mogen' } },
  { id: 'moeten', meaning: 'must / to have to', forms: { ik: 'moet', jij: 'moet', hij: 'moet', wij: 'moeten' } },
  { id: 'zullen', meaning: 'will / shall', forms: { ik: 'zal', jij: 'zult', hij: 'zal', wij: 'zullen' } },
];

export function conjugateModal(verbId: ModalVerbId, subject: ModalSubject): string {
  return modalVerbs.find((verb) => verb.id === verbId)!.forms[subject];
}

export function buildModalVerbQuestions(): QuizQuestion[] {
  const meanings = modalVerbs.map((verb) => verb.meaning);
  const easy = modalVerbs.map((verb, index): QuizQuestion => ({
    id: `modal-meaning-${verb.id}`, moduleId: 'modal-verbs', difficulty: 'easy', type: 'multiple-choice',
    prompt: `What does “${verb.id}” mean?`,
    options: [verb.meaning, meanings[(index + 1) % meanings.length], meanings[(index + 2) % meanings.length]],
    correctOption: verb.meaning,
    hint: `Think of a common sentence with ${verb.id}.`,
    explanation: `${verb.id} means “${verb.meaning}”.`, tags: ['meaning'],
  }));
  const mediumSpecs: Array<[ModalVerbId, ModalSubject, string]> = [
    ['kunnen', 'ik', 'Ik ___ Nederlands spreken.'], ['willen', 'jij', 'Jij ___ koffie drinken.'],
    ['mogen', 'hij', 'Hij ___ hier parkeren.'], ['moeten', 'wij', 'Wij ___ nu vertrekken.'],
    ['zullen', 'ik', 'Ik ___ je morgen bellen.'],
  ];
  const medium = mediumSpecs.map(([verb, subject, prompt]): QuizQuestion => ({
    id: `modal-form-${verb}-${subject}`, moduleId: 'modal-verbs', difficulty: 'medium', type: 'text', prompt,
    acceptedAnswers: [conjugateModal(verb, subject)], hint: `Use the ${subject}-form of ${verb}.`,
    explanation: `${subject} ${conjugateModal(verb, subject)}. The other infinitive stays at the end.`,
    tags: ['conjugation'],
  }));
  const hard: QuizQuestion[] = [
    { id: 'modal-order-kunnen', moduleId: 'modal-verbs', difficulty: 'hard', type: 'text', prompt: 'Translate: “Tomorrow I can work at home.”', acceptedAnswers: ['morgen kan ik thuis werken'], hint: 'Start with Morgen, then invert modal and subject.', explanation: 'Morgen kan ik thuis werken: the modal is second and werken is final.', tags: ['word order', 'translation'] },
    { id: 'modal-order-willen', moduleId: 'modal-verbs', difficulty: 'hard', type: 'text', prompt: 'Translate: “We want to buy a new bicycle.”', acceptedAnswers: ['wij willen een nieuwe fiets kopen', 'we willen een nieuwe fiets kopen'], hint: 'Kopen belongs at the end.', explanation: 'The modal and infinitive form a bracket: wij willen ... kopen.', tags: ['word order', 'translation'] },
    { id: 'modal-order-mogen', moduleId: 'modal-verbs', difficulty: 'hard', type: 'text', prompt: 'Translate: “May I ask something?”', acceptedAnswers: ['mag ik iets vragen'], hint: 'A yes/no question begins with the modal.', explanation: 'Mag ik iets vragen? uses modal + subject + object + infinitive.', tags: ['questions'] },
    { id: 'modal-order-moeten', moduleId: 'modal-verbs', difficulty: 'hard', type: 'text', prompt: 'Translate: “Why do you have to leave now?”', acceptedAnswers: ['waarom moet je nu vertrekken', 'waarom moet jij nu vertrekken'], hint: 'The question word comes first and vertrekken goes last.', explanation: 'Waarom moet je nu vertrekken? keeps the finite modal second.', tags: ['questions', 'word order'] },
    { id: 'modal-order-zullen', moduleId: 'modal-verbs', difficulty: 'hard', type: 'text', prompt: 'Translate: “Shall we cook together?”', acceptedAnswers: ['zullen we samen koken', 'zullen wij samen koken'], hint: 'Begin the suggestion with Zullen.', explanation: 'Zullen we samen koken? is a common way to make a suggestion.', tags: ['suggestions'] },
  ];
  return [...easy, ...medium, ...hard];
}
