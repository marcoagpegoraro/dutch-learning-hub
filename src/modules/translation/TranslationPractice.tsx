import { QuizPractice } from '../shared/QuizPractice';
import { translationQuestions } from './translationData';

export function TranslationPractice() {
  return (
    <QuizPractice
      moduleId="translation"
      title="Vertalen"
      subtitle="Translate curated English and Portuguese prompts without pretending free-form alternatives are equivalent."
      questions={translationQuestions}
      inputPlaceholder="Type the complete Dutch sentence"
      difficultyLabels={{
        easy: 'Easy — short A1 phrases',
        medium: 'Medium — everyday sentences',
        hard: 'Hard — mixed grammar and word order',
      }}
      showAnswerDiff
    />
  );
}
