import { QuizPractice } from '../shared/QuizPractice';
import { missingWordQuestions } from './missingWordData';

export function MissingWordPractice() {
  return (
    <QuizPractice
      moduleId="missing-word"
      title="Vul het ontbrekende woord in"
      subtitle="Complete useful A1 sentences and read a short explanation every time."
      questions={missingWordQuestions}
      inputPlaceholder="Type the missing word"
      difficultyLabels={{
        easy: 'Easy — everyday multiple choice',
        medium: 'Medium — grammar in context',
        hard: 'Hard — type the missing word',
      }}
    />
  );
}
