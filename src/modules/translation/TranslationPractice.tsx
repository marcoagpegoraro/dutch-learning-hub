import { QuizPractice } from '../shared/QuizPractice';
import { translationQuestions } from './translationData';

export function TranslationPractice() {
  return (
    <QuizPractice
      moduleId="translation"
      title="Vertalen"
      subtitle="Translate English and Portuguese into Dutch. Correct phrases are saved and removed from this difficulty’s queue."
      questions={translationQuestions}
      inputPlaceholder="Type the complete Dutch sentence"
      difficultyLabels={{
        easy: 'Easy — short A1 phrases',
        medium: 'Medium — everyday sentences',
        hard: 'Hard — mixed grammar and word order',
      }}
      excludeMastered
      showAnswerDiff
    />
  );
}
