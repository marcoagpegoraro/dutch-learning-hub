import type { QuizQuestion } from '../shared/quizUtils';

export type SeparableVerbId = 'opstaan' | 'aankomen' | 'meenemen' | 'opbellen' | 'uitgaan';
export type SeparableForm = 'main' | 'modal' | 'perfect' | 'subordinate';

interface SeparableVerb {
  id: SeparableVerbId;
  meaning: string;
  prefix: string;
  forms: Record<SeparableForm, string>;
}

export const separableVerbs: SeparableVerb[] = [
  { id: 'opstaan', meaning: 'to get up', prefix: 'op', forms: { main: 'Ik sta om zeven uur op', modal: 'Ik wil om zeven uur opstaan', perfect: 'Ik ben om zeven uur opgestaan', subordinate: 'omdat ik om zeven uur opsta' } },
  { id: 'aankomen', meaning: 'to arrive', prefix: 'aan', forms: { main: 'De trein komt om acht uur aan', modal: 'De trein kan om acht uur aankomen', perfect: 'De trein is om acht uur aangekomen', subordinate: 'omdat de trein om acht uur aankomt' } },
  { id: 'meenemen', meaning: 'to take along', prefix: 'mee', forms: { main: 'Ik neem mijn tas mee', modal: 'Ik wil mijn tas meenemen', perfect: 'Ik heb mijn tas meegenomen', subordinate: 'omdat ik mijn tas meeneem' } },
  { id: 'opbellen', meaning: 'to call by telephone', prefix: 'op', forms: { main: 'Zij belt haar moeder op', modal: 'Zij moet haar moeder opbellen', perfect: 'Zij heeft haar moeder opgebeld', subordinate: 'omdat zij haar moeder opbelt' } },
  { id: 'uitgaan', meaning: 'to go out', prefix: 'uit', forms: { main: 'Wij gaan vanavond uit', modal: 'Wij willen vanavond uitgaan', perfect: 'Wij zijn gisteren uitgegaan', subordinate: 'omdat wij vanavond uitgaan' } },
];

export function getSeparableForm(verbId: SeparableVerbId, form: SeparableForm): string {
  return separableVerbs.find((verb) => verb.id === verbId)!.forms[form];
}

export function buildSeparableVerbQuestions(): QuizQuestion[] {
  const easy = separableVerbs.map((verb): QuizQuestion => ({
    id: `separable-prefix-${verb.id}`, moduleId: 'separable-verbs', difficulty: 'easy', type: 'multiple-choice',
    prompt: `Which prefix separates from “${verb.id}” in a main clause?`,
    options: Array.from(new Set([verb.prefix, 'be', 'ge', 'ver'])).slice(0, 4), correctOption: verb.prefix,
    hint: `The verb means “${verb.meaning}”.`, explanation: `The prefix is ${verb.prefix}: ${verb.forms.main}.`, tags: ['prefix', verb.meaning],
  }));
  const medium: QuizQuestion[] = [
    { id: 'separable-main-opstaan', moduleId: 'separable-verbs', difficulty: 'medium', type: 'text', prompt: 'Complete: Ik sta om zeven uur ___.', acceptedAnswers: ['op'], hint: 'The infinitive is opstaan.', explanation: 'In a main clause, op moves to the end: Ik sta ... op.', tags: ['main clause'] },
    { id: 'separable-main-aankomen', moduleId: 'separable-verbs', difficulty: 'medium', type: 'text', prompt: 'Complete: De trein komt om acht uur ___.', acceptedAnswers: ['aan'], hint: 'The infinitive is aankomen.', explanation: 'Aankomen separates as komt ... aan.', tags: ['main clause'] },
    { id: 'separable-main-meenemen', moduleId: 'separable-verbs', difficulty: 'medium', type: 'text', prompt: 'Complete: Neem je je paspoort ___?', acceptedAnswers: ['mee'], hint: 'The infinitive is meenemen.', explanation: 'In the question, meenemen separates: Neem ... mee?', tags: ['questions'] },
    { id: 'separable-modal-opbellen', moduleId: 'separable-verbs', difficulty: 'medium', type: 'text', prompt: 'Complete with one word: Ik moet de dokter ___.', acceptedAnswers: ['opbellen'], hint: 'After a modal, use the intact infinitive.', explanation: 'The infinitive stays together at the end: moet ... opbellen.', tags: ['modal construction'] },
    { id: 'separable-modal-uitgaan', moduleId: 'separable-verbs', difficulty: 'medium', type: 'text', prompt: 'Complete with one word: Wij willen vanavond ___.', acceptedAnswers: ['uitgaan'], hint: 'After willen, use the intact infinitive.', explanation: 'Wij willen ... uitgaan: the verb does not separate after a modal.', tags: ['modal construction'] },
  ];
  const hard = separableVerbs.map((verb, index): QuizQuestion => {
    const form: SeparableForm = index % 2 ? 'subordinate' : 'perfect';
    return { id: `separable-${form}-${verb.id}`, moduleId: 'separable-verbs', difficulty: 'hard', type: 'text', prompt: form === 'perfect' ? `Write the perfect-tense sentence for “${verb.forms.main}”.` : `Write the omdat-clause for “${verb.forms.main}”.`, acceptedAnswers: [verb.forms[form]], hint: form === 'perfect' ? 'Ge normally appears between the prefix and verb stem.' : 'In a subordinate clause, the prefix and verb join at the end.', explanation: `${form === 'perfect' ? 'Perfect tense' : 'Subordinate clause'}: ${verb.forms[form]}.`, tags: [form, verb.meaning] };
  });
  return [...easy, ...medium, ...hard];
}
