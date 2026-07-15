import { QuizPractice } from '../shared/QuizPractice';
import { negationQuestions } from './negation';

export function NegationPractice() {
  return <QuizPractice moduleId="negation" title="Niet of geen?" subtitle="Choose the right negation and place it naturally in the sentence." questions={negationQuestions} inputPlaceholder="Type the missing word or corrected sentence" difficultyLabels={{ easy: 'Easy — choose niet or geen', medium: 'Medium — place the negation', hard: 'Hard — produce and correct sentences' }} />;
}
