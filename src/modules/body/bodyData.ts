import type { Difficulty } from '../../types/exercise';
import type { QuizQuestion } from '../shared/quizUtils';

interface BodyWord {
  id: string;
  dutch: string;
  portuguese: string;
  emoji: string;
  difficulty: Difficulty;
}

export const bodyWords: BodyWord[] = [
  { id: 'lichaam', dutch: 'het lichaam', portuguese: 'o corpo', emoji: '🧍', difficulty: 'easy' },
  { id: 'hoofd', dutch: 'het hoofd', portuguese: 'a cabeça', emoji: '🗣️', difficulty: 'easy' },
  { id: 'haar', dutch: 'het haar', portuguese: 'o cabelo', emoji: '💇', difficulty: 'easy' },
  { id: 'gezicht', dutch: 'het gezicht', portuguese: 'o rosto', emoji: '🙂', difficulty: 'easy' },
  { id: 'oor', dutch: 'het oor', portuguese: 'a orelha', emoji: '👂', difficulty: 'easy' },
  { id: 'oog', dutch: 'het oog', portuguese: 'o olho', emoji: '👁️', difficulty: 'easy' },
  { id: 'wenkbrauw', dutch: 'de wenkbrauw', portuguese: 'a sobrancelha', emoji: '🤨', difficulty: 'easy' },
  { id: 'neus', dutch: 'de neus', portuguese: 'o nariz', emoji: '👃', difficulty: 'easy' },
  { id: 'wang', dutch: 'de wang', portuguese: 'a bochecha', emoji: '😊', difficulty: 'easy' },
  { id: 'mond', dutch: 'de mond', portuguese: 'a boca', emoji: '👄', difficulty: 'easy' },
  { id: 'lip', dutch: 'de lip', portuguese: 'o lábio', emoji: '💋', difficulty: 'easy' },
  { id: 'tong', dutch: 'de tong', portuguese: 'a língua', emoji: '👅', difficulty: 'easy' },
  { id: 'tand', dutch: 'de tand', portuguese: 'o dente', emoji: '🦷', difficulty: 'easy' },
  { id: 'kies', dutch: 'de kies', portuguese: 'o molar', emoji: '🦷', difficulty: 'easy' },
  { id: 'kin', dutch: 'de kin', portuguese: 'o queixo', emoji: '🧔', difficulty: 'medium' },
  { id: 'nek', dutch: 'de nek', portuguese: 'o pescoço', emoji: '🧣', difficulty: 'medium' },
  { id: 'keel', dutch: 'de keel', portuguese: 'a garganta', emoji: '🗣️', difficulty: 'medium' },
  { id: 'hart', dutch: 'het hart', portuguese: 'o coração', emoji: '🫀', difficulty: 'medium' },
  { id: 'arm', dutch: 'de arm', portuguese: 'o braço', emoji: '💪', difficulty: 'medium' },
  { id: 'hand', dutch: 'de hand', portuguese: 'a mão', emoji: '✋', difficulty: 'medium' },
  { id: 'vinger', dutch: 'de vinger', portuguese: 'o dedo', emoji: '☝️', difficulty: 'medium' },
  { id: 'nagel', dutch: 'de nagel', portuguese: 'a unha', emoji: '💅', difficulty: 'medium' },
  { id: 'rug', dutch: 'de rug', portuguese: 'as costas', emoji: '🔙', difficulty: 'medium' },
  { id: 'buik', dutch: 'de buik', portuguese: 'a barriga', emoji: '🤰', difficulty: 'medium' },
  { id: 'been', dutch: 'het been', portuguese: 'a perna', emoji: '🦵', difficulty: 'medium' },
  { id: 'knie', dutch: 'de knie', portuguese: 'o joelho', emoji: '🦵', difficulty: 'medium' },
  { id: 'voet', dutch: 'de voet', portuguese: 'o pé', emoji: '🦶', difficulty: 'medium' },
  { id: 'teen', dutch: 'de teen', portuguese: 'o dedo do pé', emoji: '🦶', difficulty: 'medium' },
  { id: 'duim', dutch: 'de duim', portuguese: 'o polegar', emoji: '👍', difficulty: 'hard' },
  { id: 'vuist', dutch: 'de vuist', portuguese: 'o punho', emoji: '✊', difficulty: 'hard' },
  { id: 'billen', dutch: 'de billen', portuguese: 'o traseiro', emoji: '🍑', difficulty: 'hard' },
  { id: 'hiel', dutch: 'de hiel', portuguese: 'o calcanhar', emoji: '🦶', difficulty: 'hard' },
  { id: 'elleboog', dutch: 'de elleboog', portuguese: 'o cotovelo', emoji: '💪', difficulty: 'hard' },
  { id: 'pols', dutch: 'de pols', portuguese: 'o pulso', emoji: '⌚', difficulty: 'hard' },
  { id: 'schouder', dutch: 'de schouder', portuguese: 'o ombro', emoji: '🤷', difficulty: 'hard' },
  { id: 'borst', dutch: 'de borst', portuguese: 'o peito', emoji: '🫁', difficulty: 'hard' },
  { id: 'bot', dutch: 'het bot', portuguese: 'o osso', emoji: '🦴', difficulty: 'hard' },
  { id: 'long', dutch: 'de long', portuguese: 'o pulmão', emoji: '🫁', difficulty: 'hard' },
  { id: 'spier', dutch: 'de spier', portuguese: 'o músculo', emoji: '💪', difficulty: 'hard' },
  { id: 'maag', dutch: 'de maag', portuguese: 'o estômago', emoji: '🫃', difficulty: 'hard' },
  { id: 'lever', dutch: 'de lever', portuguese: 'o fígado', emoji: '🫀', difficulty: 'hard' },
  { id: 'huid', dutch: 'de huid', portuguese: 'a pele', emoji: '🫳', difficulty: 'hard' },
];

export function buildBodyQuestions(words = bodyWords): QuizQuestion[] {
  return words.map((word) => ({
    id: `body-${word.id}`,
    moduleId: 'body',
    difficulty: word.difficulty,
    type: 'text',
    prompt: `${word.emoji} Write the Dutch word for “${word.portuguese}”.`,
    acceptedAnswers: [word.dutch],
    hint: 'Include the article: de or het.',
    explanation: `The complete Dutch word is “${word.dutch}”.`,
    tags: ['body', 'Portuguese → Dutch', 'article required'],
  }));
}
