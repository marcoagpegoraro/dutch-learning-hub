import { QuizPractice } from '../shared/QuizPractice';
import { buildSeparableVerbQuestions } from './separableVerbs';

const questions = buildSeparableVerbQuestions();

export function SeparableVerbsPractice() {
  return (
    <QuizPractice
      moduleId="separable-verbs"
      title="Scheidbare werkwoorden"
      subtitle="Practise prefixes in main clauses, modal constructions, perfect tense, and subordinate clauses."
      questions={questions}
      inputPlaceholder="Type the prefix, verb, or full sentence"
      difficultyLabels={{
        easy: 'Easy — recognise prefixes',
        medium: 'Medium — main clauses and modals',
        hard: 'Hard — perfect and subordinate forms',
      }}
    />
  );
}
