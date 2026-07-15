import { QuizPractice } from '../shared/QuizPractice';
import { buildModalVerbQuestions } from './modalVerbs';

const questions = buildModalVerbQuestions();

export function ModalVerbsPractice() {
  return (
    <QuizPractice
      moduleId="modal-verbs"
      title="Modale werkwoorden"
      subtitle="Practise kunnen, willen, mogen, moeten, and zullen in useful sentences."
      questions={questions}
      inputPlaceholder="Type the modal form or full sentence"
      difficultyLabels={{
        easy: 'Easy — recognise meanings',
        medium: 'Medium — conjugate modal verbs',
        hard: 'Hard — build complete modal sentences',
      }}
    />
  );
}
