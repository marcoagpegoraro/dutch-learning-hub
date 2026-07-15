import { QuizPractice } from '../shared/QuizPractice';
import { buildDateQuestions } from './dateQuestions';

const questions = buildDateQuestions();

export function DatesPractice() {
  return (
    <QuizPractice
      moduleId="dates"
      title="Datum en kalender"
      subtitle="Practise weekdays, months, dates, and simple appointments."
      questions={questions}
      inputPlaceholder="Write the date or phrase in Dutch"
      difficultyLabels={{
        easy: 'Easy — recognise weekdays',
        medium: 'Medium — write calendar dates',
        hard: 'Hard — appointments and relative dates',
      }}
    />
  );
}
