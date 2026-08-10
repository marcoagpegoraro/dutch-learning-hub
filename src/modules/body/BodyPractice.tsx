import { QuizPractice } from '../shared/QuizPractice';
import { buildBodyQuestions } from './bodyData';

const questions = buildBodyQuestions();

export function BodyPractice() {
  return (
    <QuizPractice
      moduleId="body"
      title="Het lichaam"
      subtitle="Learn Dutch body words by typing each word together with its article."
      questions={questions}
      inputPlaceholder="e.g. het hoofd"
      difficultyLabels={{
        easy: 'Easy — face and head',
        medium: 'Medium — limbs and torso',
        hard: 'Hard — detailed body parts and organs',
      }}
      showAnswerDiff
    />
  );
}
