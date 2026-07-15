import type { QuizQuestion } from '../shared/quizUtils';

export interface ListeningItem {
  question: QuizQuestion;
  spokenText: string;
}

export const listeningItems: ListeningItem[] = [
  {
    spokenText: 'Goedemorgen',
    question: {
      id: 'listen-easy-morning',
      moduleId: 'listening',
      difficulty: 'easy',
      type: 'multiple-choice',
      prompt: 'Listen and choose the phrase you hear.',
      options: ['Goedemorgen', 'Goedenavond', 'Tot morgen', 'Welterusten'],
      correctOption: 'Goedemorgen',
      hint: 'Listen for morgen.',
      explanation: 'You heard: Goedemorgen — good morning.',
      tags: ['greetings'],
    },
  },
  {
    spokenText: 'Dank je wel',
    question: {
      id: 'listen-easy-thanks',
      moduleId: 'listening',
      difficulty: 'easy',
      type: 'multiple-choice',
      prompt: 'Listen and choose the phrase you hear.',
      options: ['Dank je wel', 'Alsjeblieft', 'Geen probleem', 'Tot ziens'],
      correctOption: 'Dank je wel',
      hint: 'This phrase expresses thanks.',
      explanation: 'You heard: Dank je wel — thank you.',
      tags: ['greetings'],
    },
  },
  {
    spokenText: 'Ik woon in Utrecht',
    question: {
      id: 'listen-easy-home',
      moduleId: 'listening',
      difficulty: 'easy',
      type: 'multiple-choice',
      prompt: 'Listen and choose the matching sentence.',
      options: [
        'Ik woon in Utrecht',
        'Ik werk in Utrecht',
        'Ik kom uit Utrecht',
        'Ik ga naar Utrecht',
      ],
      correctOption: 'Ik woon in Utrecht',
      hint: 'Focus on the verb after ik.',
      explanation: 'You heard: Ik woon in Utrecht.',
      tags: ['personal information'],
    },
  },
  {
    spokenText: 'De trein vertrekt',
    question: {
      id: 'listen-easy-train',
      moduleId: 'listening',
      difficulty: 'easy',
      type: 'multiple-choice',
      prompt: 'Listen and choose the matching sentence.',
      options: ['De trein vertrekt', 'De trein stopt', 'De trein is laat', 'De trein komt aan'],
      correctOption: 'De trein vertrekt',
      hint: 'Listen to the final verb.',
      explanation: 'You heard: De trein vertrekt — the train departs.',
      tags: ['transport'],
    },
  },
  {
    spokenText: 'Een kop koffie',
    question: {
      id: 'listen-easy-coffee',
      moduleId: 'listening',
      difficulty: 'easy',
      type: 'multiple-choice',
      prompt: 'Listen and choose the phrase you hear.',
      options: ['Een kop koffie', 'Een glas water', 'Een broodje kaas', 'Een kop thee'],
      correctOption: 'Een kop koffie',
      hint: 'Listen for kop and the drink.',
      explanation: 'You heard: Een kop koffie.',
      tags: ['food'],
    },
  },
  {
    spokenText: 'Vandaag is het woensdag',
    question: {
      id: 'listen-medium-day',
      moduleId: 'listening',
      difficulty: 'medium',
      type: 'text',
      prompt: 'Listen and type the complete Dutch sentence.',
      acceptedAnswers: ['vandaag is het woensdag'],
      hint: 'The sentence begins with Vandaag.',
      explanation: 'You heard: Vandaag is het woensdag.',
      tags: ['calendar'],
    },
  },
  {
    spokenText: 'Mijn broer werkt in Amsterdam',
    question: {
      id: 'listen-medium-brother',
      moduleId: 'listening',
      difficulty: 'medium',
      type: 'text',
      prompt: 'Listen and type the complete Dutch sentence.',
      acceptedAnswers: ['mijn broer werkt in amsterdam'],
      hint: 'Listen for a family member and a city.',
      explanation: 'You heard: Mijn broer werkt in Amsterdam.',
      tags: ['family'],
    },
  },
  {
    spokenText: 'Mag ik de menukaart?',
    question: {
      id: 'listen-medium-menu',
      moduleId: 'listening',
      difficulty: 'medium',
      type: 'text',
      prompt: 'Listen and type the restaurant question.',
      acceptedAnswers: ['mag ik de menukaart'],
      hint: 'It begins with a modal verb.',
      explanation: 'You heard: Mag ik de menukaart?',
      tags: ['restaurant'],
    },
  },
  {
    spokenText: 'Het regent, maar het is niet koud',
    question: {
      id: 'listen-medium-weather',
      moduleId: 'listening',
      difficulty: 'medium',
      type: 'text',
      prompt: 'Listen and type the complete Dutch sentence.',
      acceptedAnswers: ['het regent maar het is niet koud'],
      hint: 'Two clauses are joined with maar.',
      explanation: 'You heard: Het regent, maar het is niet koud.',
      tags: ['weather'],
    },
  },
  {
    spokenText: 'Ik moet morgen naar de dokter',
    question: {
      id: 'listen-medium-doctor',
      moduleId: 'listening',
      difficulty: 'medium',
      type: 'text',
      prompt: 'Listen and type the complete Dutch sentence.',
      acceptedAnswers: ['ik moet morgen naar de dokter'],
      hint: 'Listen for a modal, a day word, and a destination.',
      explanation: 'You heard: Ik moet morgen naar de dokter.',
      tags: ['doctor'],
    },
  },
  {
    spokenText: 'De afspraak is om kwart over drie',
    question: {
      id: 'listen-hard-time',
      moduleId: 'listening',
      difficulty: 'hard',
      type: 'text',
      prompt: 'Listen carefully and type the appointment time.',
      acceptedAnswers: ['de afspraak is om kwart over drie'],
      hint: 'Focus on whether the time is before or after the hour.',
      explanation: 'You heard: De afspraak is om kwart over drie.',
      tags: ['appointments', 'time'],
    },
  },
  {
    spokenText: 'Het kaartje kost tweeëntwintig euro vijftig',
    question: {
      id: 'listen-hard-price',
      moduleId: 'listening',
      difficulty: 'hard',
      type: 'text',
      prompt: 'Listen and type the ticket price in Dutch words.',
      acceptedAnswers: [
        'het kaartje kost tweeëntwintig euro vijftig',
        'het kaartje kost 22 euro 50',
        'het kaartje kost €22,50',
      ],
      hint: 'Listen for euros and cents.',
      explanation: 'You heard: Het kaartje kost tweeëntwintig euro vijftig.',
      tags: ['prices', 'transport'],
    },
  },
  {
    spokenText: 'Kunt u mij vertellen waar het station is?',
    question: {
      id: 'listen-hard-directions',
      moduleId: 'listening',
      difficulty: 'hard',
      type: 'text',
      prompt: 'Listen and type the polite request.',
      acceptedAnswers: ['kunt u mij vertellen waar het station is'],
      hint: 'It begins with Kunt u mij vertellen…',
      explanation: 'You heard: Kunt u mij vertellen waar het station is?',
      tags: ['directions', 'polite language'],
    },
  },
  {
    spokenText: 'Omdat de bus te laat was, ben ik gaan lopen',
    question: {
      id: 'listen-hard-bus',
      moduleId: 'listening',
      difficulty: 'hard',
      type: 'text',
      prompt: 'Listen and type both clauses.',
      acceptedAnswers: ['omdat de bus te laat was ben ik gaan lopen'],
      hint: 'The first clause begins with Omdat.',
      explanation: 'You heard: Omdat de bus te laat was, ben ik gaan lopen.',
      tags: ['subordinate clause'],
    },
  },
  {
    spokenText: 'Zou ik de afspraak kunnen verzetten?',
    question: {
      id: 'listen-hard-reschedule',
      moduleId: 'listening',
      difficulty: 'hard',
      type: 'text',
      prompt: 'Listen and type the polite question.',
      acceptedAnswers: ['zou ik de afspraak kunnen verzetten'],
      hint: 'Listen for two modal verbs.',
      explanation: 'You heard: Zou ik de afspraak kunnen verzetten?',
      tags: ['appointments', 'polite language'],
    },
  },
];

export const listeningQuestions = listeningItems.map((item) => item.question);

export function spokenTextForQuestion(questionId: string): string {
  const item = listeningItems.find((candidate) => candidate.question.id === questionId);
  if (!item) throw new Error(`Unknown listening question: ${questionId}`);
  return item.spokenText;
}
