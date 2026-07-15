import { QuizPractice } from '../shared/QuizPractice';
import { buildVocabularyQuestions } from './vocabularyData';

const questions = buildVocabularyQuestions();

export function VocabularyPractice() {
  return (
    <QuizPractice
      moduleId="vocabulary"
      title="Vocabulary Builder"
      subtitle="Build practical A1 vocabulary across everyday topics."
      questions={questions}
      inputPlaceholder="e.g. de deken"
      difficultyLabels={{
        easy: 'Easy — Dutch to English recognition',
        medium: 'Medium — English to Dutch choice',
        hard: 'Hard — type the Dutch word',
      }}
    />
  );
}
