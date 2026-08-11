import { useRef } from 'react';
import { QuizPractice } from '../shared/QuizPractice';
import { NumberAnswerHint } from './NumberAnswerHint';
import { createNumberQuestionScheduler } from './numberQuestions';

export function NumbersPractice() {
  const scheduler = useRef(createNumberQuestionScheduler());

  return (
    <QuizPractice
      moduleId="numbers"
      title="Getallen"
      subtitle="Practise fresh Dutch numbers, with missed numbers returning later for another try."
      questions={[]}
      getNextQuestion={(difficulty, context) => scheduler.current.next(difficulty, context)}
      renderIncorrectFeedback={(question, answer) =>
        question.type === 'text' ? (
          <NumberAnswerHint expected={question.acceptedAnswers[0]} actual={answer} />
        ) : null
      }
      inputPlaceholder="Write the number in Dutch"
      difficultyLabels={{
        easy: 'Easy — recognise 0–20',
        medium: 'Medium — type numbers to 100',
        hard: 'Hard — hundreds and thousands',
        'very-hard': 'Very hard — up to ten million',
      }}
    />
  );
}
