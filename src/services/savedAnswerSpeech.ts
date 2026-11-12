import { buildVocabularyQuestions } from '../modules/vocabulary/vocabularyData';
import { buildModalVerbQuestions } from '../modules/modal-verbs/modalVerbs';

const recognitionQuestions = [...buildVocabularyQuestions(), ...buildModalVerbQuestions()];

// Some recognition exercises have English answers; pronounce their Dutch source instead.
export function savedAnswerSpeech(item: { questionId: string; correctAnswer: string }): string {
  const question = recognitionQuestions.find((question) => question.id === item.questionId);
  return question?.dutchAnswerAudio ?? item.correctAnswer;
}
