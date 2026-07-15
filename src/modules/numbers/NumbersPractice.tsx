import { QuizPractice } from '../shared/QuizPractice';
import { buildNumberQuestions } from './numberQuestions';

const questions = buildNumberQuestions();

export function NumbersPractice() {
  return (
    <QuizPractice
      moduleId="numbers"
      title="Getallen"
      subtitle="Practise Dutch numbers from zero through prices and thousands."
      questions={questions}
      inputPlaceholder="Write the number in Dutch"
      difficultyLabels={{
        easy: 'Easy — recognise 0–20',
        medium: 'Medium — type numbers to 100',
        hard: 'Hard — hundreds, thousands, and prices',
      }}
    />
  );
}
