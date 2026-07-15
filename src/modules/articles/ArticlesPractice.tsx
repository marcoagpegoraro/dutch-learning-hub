import { QuizPractice } from '../shared/QuizPractice';
import { buildArticleQuestions } from './articleData';

const questions = buildArticleQuestions();

export function ArticlesPractice() {
  return (
    <QuizPractice
      moduleId="articles"
      title="De of het?"
      subtitle="Choose the correct article and learn each noun as a complete phrase."
      questions={questions}
      difficultyLabels={{
        easy: 'Easy — common nouns',
        medium: 'Medium — patterns and diminutives',
        hard: 'Hard — abstract and less common nouns',
      }}
    />
  );
}
