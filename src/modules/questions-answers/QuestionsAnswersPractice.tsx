import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DutchAudio } from '../../components/DutchAudio';
import { QuizPractice } from '../shared/QuizPractice';
import {
  buildQuestionAnswerExercises,
  questionAnswerScenarios,
  structureGuides,
  type PracticeTask,
  type StructureId,
} from './questionAnswerData';

const exercises = buildQuestionAnswerExercises();
type PracticeMode = PracticeTask | 'mixed';

function StructureGuide() {
  const [selected, setSelected] = useState<StructureId>('omdat');
  const guide = structureGuides[selected];
  return (
    <details className="card border-0 shadow-sm mb-4">
      <summary className="card-header bg-white p-3 fw-semibold">
        Guia em português · como perguntar e responder
      </summary>
      <div className="card-body p-4">
        <p>
          <strong>Porque ou para?</strong> <span lang="nl">Omdat</span> apresenta um motivo;{' '}
          <span lang="nl">om … te</span> apresenta um objetivo. Não são intercambiáveis.
        </p>
        <label className="form-label" htmlFor="structureGuide">
          Escolha uma estrutura para estudar
        </label>
        <select
          id="structureGuide"
          className="form-select mb-3"
          value={selected}
          onChange={(event) => setSelected(event.target.value as StructureId)}
        >
          {Object.entries(structureGuides).map(([id, item]) => (
            <option key={id} value={id}>
              {item.title}
            </option>
          ))}
        </select>
        <h2 className="h5 fw-bold">{guide.title}</h2>
        <p className="text-secondary">{guide.meaning}</p>
        <p>{guide.rule}</p>
        <p className="small fw-semibold">{guide.pattern}</p>
        <div className="alert alert-light border">
          <p lang="nl" className="fw-semibold mb-1">
            {guide.dutch}
          </p>
          <p className="small mb-2">{guide.portuguese}</p>
          <DutchAudio text={guide.dutch} />
        </div>
        <a className="small" href={guide.source} target="_blank" rel="noreferrer">
          Consultar a referência de gramática
        </a>
      </div>
    </details>
  );
}

export function QuestionsAnswersPractice() {
  const [mode, setMode] = useState<PracticeMode>('mixed');
  const questions = exercises.filter((exercise) => mode === 'mixed' || exercise.task === mode);
  return (
    <QuizPractice
      key={mode}
      moduleId="questions-answers"
      title="Vragen & antwoorden"
      subtitle="Questions & Answers · Formule perguntas e respostas em holandês a partir do inglês."
      questions={questions}
      inputPlaceholder="Escreva a pergunta ou resposta completa em holandês"
      difficultyLabels={{
        easy: 'Easy — perguntas e respostas simples',
        medium: 'Medium — motivos, objetivos e perfectum',
        hard: 'Hard — condições, contraste e frases conectadas',
      }}
      controls={
        <>
          <label htmlFor="questionAnswerMode" className="form-label fw-semibold">
            O que praticar
          </label>
          <select
            id="questionAnswerMode"
            className="form-select"
            value={mode}
            onChange={(event) => setMode(event.target.value as PracticeMode)}
          >
            <option value="mixed">Perguntas e respostas</option>
            <option value="question">Só formular perguntas</option>
            <option value="answer">Só formular respostas</option>
          </select>
        </>
      }
      introduction={
        <>
          <p className="small text-secondary">
            São 30 situações e 60 exercícios. Use je/jij para “you” e a estrutura indicada na dica.
            Os acertos ficam salvos; as frases erradas voltam até você acertar. Após a correção,
            ouça e repita em voz alta. Para estudar os tempos passados, abra{' '}
            <Link to="/practice/perfect-tense">Perfectum</Link>.
          </p>
          <StructureGuide />
        </>
      }
      completionLabel={
        mode === 'mixed' ? 'questions and answers' : mode === 'question' ? 'questions' : 'answers'
      }
      excludeMastered
      showAnswerDiff
      renderPromptAddon={(question) => {
        const exercise = exercises.find((item) => item.id === question.id);
        const scenario = questionAnswerScenarios.find((item) => item.id === exercise?.scenarioId);
        if (!exercise || !scenario) return null;
        return (
          <div className="mb-4">
            <p className="small text-secondary mb-2">
              {exercise.task === 'question'
                ? 'Formule a pergunta indicada em inglês.'
                : 'Imagine que alguém fez esta pergunta. Responda com a frase indicada em inglês.'}
            </p>
            {exercise.task === 'answer' && (
              <div className="alert alert-light border">
                <p className="small mb-1">{scenario.englishQuestion}</p>
                <p lang="nl" className="fw-semibold mb-2">
                  {scenario.dutchQuestions[0]}
                </p>
                <DutchAudio text={scenario.dutchQuestions[0]} />
              </div>
            )}
            <span className="badge text-bg-primary-subtle text-primary-emphasis">
              {structureGuides[exercise.topic].title}
            </span>
          </div>
        );
      }}
    />
  );
}
