import { QuizPractice } from '../shared/QuizPractice';
import { mistakeQuestions } from './mistakeData';

export function FindTheMistakePractice() {
  return (
    <QuizPractice
      moduleId="find-the-mistake"
      title="Vind de fout"
      subtitle="Rewrite each incorrect sentence and learn which rule it breaks."
      questions={mistakeQuestions}
      inputPlaceholder="Type the corrected Dutch sentence"
      difficultyLabels={{
        easy: 'Easy — agreement, articles, and spelling',
        medium: 'Medium — word order and grammar',
        hard: 'Hard — mixed sentence correction',
      }}
      showAnswerDiff
    />
  );
}
