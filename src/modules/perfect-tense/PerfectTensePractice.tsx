import { Link } from 'react-router-dom';
import { DutchAudio } from '../../components/DutchAudio';
import { QuizPractice } from '../shared/QuizPractice';
import { buildPerfectTenseQuestions } from './perfectTense';

const questions = buildPerfectTenseQuestions();

export function PerfectTensePractice() {
  return (
    <QuizPractice
      moduleId="perfect-tense"
      title="Perfectum · Voltooide tijd"
      subtitle="Choose hebben or zijn, form participles, and build complete perfect-tense sentences."
      questions={questions}
      introduction={
        <details className="card border-0 shadow-sm mb-4">
          <summary className="card-header bg-white p-3 fw-semibold">
            Guia em português · o que é perfectum?
          </summary>
          <div className="card-body p-4">
            <p>
              É uma forma de falar de acontecimentos passados. Combine uma forma de{' '}
              <span lang="nl">hebben</span> ou <span lang="nl">zijn</span> com o particípio do
              verbo.
            </p>
            <p>
              <strong>Fácil:</strong> escolha o auxiliar. <strong>Médio:</strong> escreva o
              particípio. <strong>Difícil:</strong> monte a frase completa.
            </p>
            <p>
              <span lang="nl">Ik heb gewerkt.</span> — Eu trabalhei.{' '}
              <DutchAudio text="Ik heb gewerkt." compact />
            </p>
            <p>
              <span lang="nl">Ik ben naar huis gegaan.</span> — Eu fui para casa.{' '}
              <DutchAudio text="Ik ben naar huis gegaan." compact />
            </p>
            <p className="small text-secondary">
              Aprenda cada verbo com seu auxiliar: a escolha pode depender de como ele é usado na
              frase.
            </p>
            <Link to="/practice/questions-answers">
              Treinar perguntas e respostas, incluindo perfectum
            </Link>
          </div>
        </details>
      }
      inputPlaceholder="Type the participle or full sentence"
      difficultyLabels={{
        easy: 'Easy — choose hebben or zijn',
        medium: 'Medium — form the participle',
        hard: 'Hard — build the full sentence',
      }}
    />
  );
}
