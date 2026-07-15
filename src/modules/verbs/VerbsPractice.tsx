import { QuizPractice } from '../shared/QuizPractice';
import { buildPresentTenseQuestions } from './presentTense';

const questions = buildPresentTenseQuestions();

export function VerbsPractice() {
  return (
    <QuizPractice
      moduleId="verbs"
      title="Tegenwoordige tijd"
      subtitle="Conjugate useful A1 verbs in the Dutch present tense."
      questions={questions}
      inputPlaceholder="Type only the verb form"
      difficultyLabels={{
        easy: 'Easy — regular verb recognition',
        medium: 'Medium — type spelling-changing forms',
        hard: 'Hard — irregular present-tense verbs',
      }}
    />
  );
}
