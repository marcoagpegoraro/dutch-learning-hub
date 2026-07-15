import { QuizPractice } from '../shared/QuizPractice';
import { buildPerfectTenseQuestions } from './perfectTense';

const questions = buildPerfectTenseQuestions();

export function PerfectTensePractice() {
  return <QuizPractice moduleId="perfect-tense" title="Voltooide tijd" subtitle="Choose hebben or zijn, form participles, and build complete perfect-tense sentences." questions={questions} inputPlaceholder="Type the participle or full sentence" difficultyLabels={{ easy: 'Easy — choose hebben or zijn', medium: 'Medium — form the participle', hard: 'Hard — build the full sentence' }} />;
}
