import { QuizPractice } from '../shared/QuizPractice';
import { prepositionQuestions } from './prepositionData';

export function PrepositionsPractice() {
  return (
    <QuizPractice
      moduleId="prepositions"
      title="Voorzetsels"
      subtitle="Use visual clues to practise position, place, and time prepositions."
      questions={prepositionQuestions}
      inputPlaceholder="Type the preposition or full sentence"
      difficultyLabels={{
        easy: 'Easy — visual position choices',
        medium: 'Medium — recall place and time words',
        hard: 'Hard — describe complete relationships',
      }}
    />
  );
}
