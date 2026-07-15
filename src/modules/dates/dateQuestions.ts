import type { QuizQuestion } from '../shared/quizUtils';
import { dutchMonths, dutchWeekdays, formatDutchDate } from './dateUtils';

const weekdayMeanings = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function buildDateQuestions(): QuizQuestion[] {
  const easy: QuizQuestion[] = dutchWeekdays.slice(0, 6).map((weekday, index) => ({
    id: `dates-weekday-${weekday}`,
    moduleId: 'dates',
    difficulty: 'easy',
    type: 'multiple-choice',
    prompt: `Which Dutch word means ${weekdayMeanings[index]}?`,
    options: [
      weekday,
      dutchWeekdays[(index + 1) % 7],
      dutchWeekdays[(index + 3) % 7],
      dutchWeekdays[(index + 5) % 7],
    ],
    correctOption: weekday,
    hint: 'Dutch weekday names are not capitalised.',
    explanation: `${weekdayMeanings[index]} is ${weekday}.`,
    tags: ['weekdays'],
  }));
  const mediumDates = [
    [1, 1],
    [14, 2],
    [27, 4],
    [5, 5],
    [15, 7],
    [31, 12],
  ] as const;
  const medium: QuizQuestion[] = mediumDates.map(([day, month]) => ({
    id: `dates-calendar-${month}-${day}`,
    moduleId: 'dates',
    difficulty: 'medium',
    type: 'text',
    prompt: `Write the date ${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')} in Dutch.`,
    acceptedAnswers: [formatDutchDate(day, month)],
    hint: `Month ${month} is ${dutchMonths[month - 1]}.`,
    explanation: `Dutch writes this as ${formatDutchDate(day, month)}; month names are lowercase.`,
    tags: ['dates', 'months'],
  }));
  const hard: QuizQuestion[] = [
    {
      id: 'dates-appointment-1',
      moduleId: 'dates',
      difficulty: 'hard',
      type: 'text',
      prompt: 'Translate the appointment: “Monday at nine o’clock”.',
      acceptedAnswers: ['maandag om negen uur'],
      hint: 'Use om before a clock time.',
      explanation: 'Appointments use weekday + om + time: maandag om negen uur.',
      tags: ['appointments'],
    },
    {
      id: 'dates-relative-tomorrow',
      moduleId: 'dates',
      difficulty: 'hard',
      type: 'multiple-choice',
      prompt: 'Vandaag is dinsdag. Welke dag is het morgen?',
      options: ['maandag', 'woensdag', 'donderdag', 'zondag'],
      correctOption: 'woensdag',
      hint: 'Morgen means tomorrow.',
      explanation: 'The day after dinsdag is woensdag.',
      tags: ['relative dates'],
    },
    {
      id: 'dates-relative-yesterday',
      moduleId: 'dates',
      difficulty: 'hard',
      type: 'multiple-choice',
      prompt: 'Vandaag is vrijdag. Welke dag was het gisteren?',
      options: ['donderdag', 'zaterdag', 'woensdag', 'maandag'],
      correctOption: 'donderdag',
      hint: 'Gisteren means yesterday.',
      explanation: 'The day before vrijdag is donderdag.',
      tags: ['relative dates'],
    },
    {
      id: 'dates-birthday',
      moduleId: 'dates',
      difficulty: 'hard',
      type: 'text',
      prompt: 'Complete in Dutch: “My birthday is on 8 March.”',
      acceptedAnswers: ['mijn verjaardag is op 8 maart', 'mijn verjaardag is op acht maart'],
      hint: 'Use op before a date.',
      explanation: 'Mijn verjaardag is op 8 maart. Dates use op.',
      tags: ['dates', 'production'],
    },
    {
      id: 'dates-weekend',
      moduleId: 'dates',
      difficulty: 'hard',
      type: 'text',
      prompt: 'Which two Dutch weekdays form the weekend?',
      acceptedAnswers: ['zaterdag en zondag', 'zondag en zaterdag'],
      hint: 'Begin with zaterdag.',
      explanation: 'Het weekend consists of zaterdag en zondag.',
      tags: ['weekdays', 'production'],
    },
    {
      id: 'dates-month-after',
      moduleId: 'dates',
      difficulty: 'hard',
      type: 'multiple-choice',
      prompt: 'Welke maand komt na september?',
      options: ['augustus', 'oktober', 'november', 'december'],
      correctOption: 'oktober',
      hint: 'Na means after.',
      explanation: 'Oktober comes after september.',
      tags: ['months'],
    },
  ];
  return [...easy, ...medium, ...hard];
}
