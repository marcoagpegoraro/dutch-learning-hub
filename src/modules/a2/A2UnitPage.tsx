import { useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../app/AppStateContext';
import { findA2Unit, skillObjectives, tasksForCase, type A2Task as Task } from './a2Data';
import { addA2Evidence, newA2Draft, validRubric } from './a2Progress';
import { A2AudioPlayer } from './A2AudioPlayer';
import { A2Recorder } from './A2Recorder';
import { A2SkillSummary } from './A2SkillSummary';
import {
  MODE_LABELS,
  RUBRIC_LABELS,
  SKILL_LABELS,
  makeA2Id,
  type A2Case,
  type A2Draft,
  type A2Mode,
} from './types';

export function A2UnitPage() {
  const { unitId } = useParams();
  const unit = findA2Unit(unitId);
  const [params, setParams] = useSearchParams();
  const { state } = useAppState();
  const mode = (
    ['practice', 'check', 'review'].includes(params.get('mode') ?? '')
      ? params.get('mode')
      : 'practice'
  ) as A2Mode;
  if (!unit) return <Navigate to="/a2" replace />;
  const material = unit.cases.find((c) => c.id === mode)!;
  const tasks = tasksForCase(unit.id, material);
  const index = Math.min(
    tasks.length - 1,
    Math.max(0, Math.floor(Number(params.get('task'))) || 0),
  );
  const current = tasks[index];
  const completed = tasks.filter((task) =>
    state.a2.evidence.some((e) => e.taskId === task.id),
  ).length;
  return (
    <div className="container py-4 py-lg-5">
      <Link to="/a2" className="text-decoration-none">
        ← Trilha A2
      </Link>
      <h1 className="display-6 fw-bold mt-3">{unit.title}</h1>
      <p className="text-secondary">{unit.objective}</p>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-wrap gap-2 mb-3">
            {(['practice', 'check', 'review'] as A2Mode[]).map((m) => (
              <button
                type="button"
                className={`btn ${m === mode ? 'btn-primary' : 'btn-outline-primary'}`}
                key={m}
                onClick={() => setParams({ mode: m, task: '0' })}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
            <Link to="/a2/portfolio" className="btn btn-outline-secondary ms-md-auto">
              Portfólio
            </Link>
          </div>
          <div className="d-flex justify-content-between small mb-2">
            <span>
              {material.title} · {MODE_LABELS[mode]}
            </span>
            <span>
              {completed}/{tasks.length} atividades registradas
            </span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label="Atividades registradas nesta situação"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={tasks.length}
          >
            <div
              className="progress-bar"
              style={{ width: `${(completed / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      {mode !== 'practice' && (
        <p className="alert alert-light border small">
          Esta é uma situação diferente da prática. Ajuda, transcrição, modelo e tentativas após
          consultar o gabarito ficam registrados como apoio. A revisão só confirma retenção quando
          ocorre em outra sessão, pelo menos 24 horas depois da demonstração. A preparação ainda
          aguarda validação pedagógica.
        </p>
      )}
      <div className="row g-4">
        <aside className="col-lg-3">
          <nav className="list-group" aria-label="Atividades da unidade">
            {tasks.map((task, n) => (
              <button
                type="button"
                className={`list-group-item list-group-item-action ${n === index ? 'active' : ''}`}
                key={task.id}
                onClick={() => setParams({ mode, task: String(n) })}
              >
                <span className="small d-block">{SKILL_LABELS[task.skill]}</span>
                {task.title}
                {state.a2.evidence.some((e) => e.taskId === task.id) && (
                  <span className="ms-2" aria-label="Tentativa registrada">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-4">
            <h2 className="h6 fw-bold">Prática de apoio</h2>
            {unit.supportRoutes.map((route) => (
              <Link className="d-block small mb-2" key={route.route} to={route.route}>
                {route.label}
              </Link>
            ))}
          </div>
        </aside>
        <div className="col-lg-9">
          <TaskPanel
            key={current.id}
            task={current}
            unitId={unit.id}
            material={material}
            onNext={
              index < tasks.length - 1
                ? () => setParams({ mode, task: String(index + 1) })
                : undefined
            }
          />
        </div>
      </div>
      <div className="mt-4">
        <A2SkillSummary unitId={unit.id} />
      </div>
    </div>
  );
}
function TaskPanel({
  task,
  unitId,
  material,
  onNext,
}: {
  task: Task;
  unitId: string;
  material: A2Case;
  onNext?: () => void;
}) {
  const { state, updateA2, completeActivity } = useAppState();
  const stored = state.a2.drafts[task.id];
  const draft = stored ?? newA2Draft();
  const evidence = state.a2.evidence.filter((e) => e.taskId === task.id);
  const latest = evidence.at(-1);
  const [editing, setEditing] = useState(!latest);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const sessionId = useRef(makeA2Id());
  const [dialogueStage, setDialogueStage] = useState(
    Math.min(material.dialogue.length - 1, draft.turns.length),
  );
  const closed = task.skill === 'reading' || task.skill === 'listening';
  const source =
    task.skill === 'reading'
      ? material.documents[task.index]
      : task.skill === 'listening'
        ? material.audios[task.index]
        : undefined;
  const openTask =
    task.skill === 'writing'
      ? material.writing
      : task.skill === 'speaking'
        ? material.speaking
        : task.skill === 'mediation'
          ? material.mediation
          : undefined;
  function patch(update: Partial<A2Draft> | ((current: A2Draft) => A2Draft)) {
    updateA2((current) => {
      const previous = current.drafts[task.id] ?? newA2Draft();
      const next = typeof update === 'function' ? update(previous) : { ...previous, ...update };
      return {
        ...current,
        drafts: { ...current.drafts, [task.id]: { ...next, updatedAt: new Date().toISOString() } },
      };
    });
  }
  function support(name: string) {
    patch((current) => ({ ...current, supports: [...new Set([...current.supports, name])] }));
  }
  function save() {
    setError('');
    if (
      task.skill === 'listening' &&
      !draft.plays &&
      !draft.supports.includes('transcrição consultada')
    ) {
      setError('Ouça o áudio ou consulte a transcrição antes de responder.');
      return;
    }
    if (
      closed &&
      source?.questions.some(
        (q, i) =>
          !Number.isInteger(draft.answers[i]) ||
          draft.answers[i] < 0 ||
          draft.answers[i] >= q.options.length,
      )
    ) {
      setError('Responda a todas as perguntas antes de verificar.');
      return;
    }
    if (!closed && !validRubric(draft.rubric)) {
      setError('Preencha os quatro critérios da autoavaliação.');
      return;
    }
    if (
      !closed &&
      task.skill !== 'interaction' &&
      !draft.response.trim() &&
      !draft.recordings.some(Boolean)
    ) {
      setError('Escreva ou grave sua resposta antes de registrar.');
      return;
    }
    if (
      task.skill === 'interaction' &&
      (draft.turns.length < material.dialogue.length || draft.turns.some((t) => !t.trim()))
    ) {
      setError('Responda aos três turnos da conversa.');
      return;
    }
    const supports = [...draft.supports];
    if (task.skill === 'speaking' && !draft.recordings.some(Boolean))
      supports.push('alternativa escrita à fala');
    if (
      task.skill === 'interaction' &&
      draft.recordings.filter(Boolean).length < material.dialogue.length
    )
      supports.push('interação parcialmente digitada');
    if (evidence.length) supports.push('tarefa já apresentada com feedback');
    const response = source
      ? source.questions
          .map((q, i) => `${q.prompt}\nResposta: ${q.options[draft.answers[i]]}`)
          .join('\n\n')
      : task.skill === 'interaction'
        ? draft.turns.map((t, i) => `${material.dialogue[i].prompt}\n${t}`).join('\n\n')
        : draft.response;
    updateA2((current) =>
      addA2Evidence(current, {
        id: makeA2Id(),
        taskId: task.id,
        unitId,
        mode: material.id,
        skill: task.skill,
        sessionId: sessionId.current,
        response,
        recordings: draft.recordings.filter(Boolean),
        supports: [...new Set(supports)],
        answeredAt: new Date().toISOString(),
        source: closed ? 'objective' : 'self',
        ...(closed
          ? { correct: source!.questions.every((q, i) => q.correct === draft.answers[i]) }
          : { rubric: draft.rubric }),
      }),
    );
    completeActivity(`a2:activity:${task.id}`, 5);
    setEditing(false);
    setSaved(true);
  }
  const reviewed = latest && state.a2.teacherReviews.find((r) => r.evidenceId === latest.id);
  const showModel = draft.supports.includes('modelo consultado');
  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5">
        <span className="badge text-bg-primary mb-2">{SKILL_LABELS[task.skill]}</span>
        <h2 className="h3 fw-bold">{task.title}</h2>
        <p className="small text-secondary">{skillObjectives[task.skill].objective}</p>
        {source && (
          <>
            {task.skill === 'reading' ? (
              <div className="a2-document mb-4" lang="nl">
                {source.text}
              </div>
            ) : (
              <>
                <p className="small text-secondary">
                  Ouça o arquivo em holandês. Conversa: Xander (nl-NL) e Ellen (nl-BE); anúncio:
                  Xander (nl-NL). Vozes sintéticas; revisão linguística pendente.
                </p>
                <A2AudioPlayer
                  file={material.audios[task.index].file}
                  label={source.title}
                  onPlay={() =>
                    patch((current) => ({ ...current, plays: (current.plays ?? 0) + 1 }))
                  }
                  onSlow={() => support('áudio desacelerado')}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary mb-3"
                  onClick={() => support('transcrição consultada')}
                >
                  Consultar transcrição
                </button>
                {draft.supports.includes('transcrição consultada') && (
                  <div className="a2-document mb-4" lang="nl">
                    {source.text}
                  </div>
                )}
              </>
            )}
            {source.questions.map((q, i) => (
              <fieldset className="mb-4" key={q.prompt} disabled={!editing}>
                <legend className="h6 fw-semibold">{q.prompt}</legend>
                {q.options.map((option, n) => (
                  <label className="answer-choice mb-2" key={option}>
                    <input
                      type="radio"
                      className="form-check-input"
                      name={`${task.id}-${i}`}
                      checked={draft.answers[i] === n}
                      onChange={() =>
                        patch((current) => {
                          const answers = [...current.answers];
                          answers[i] = n;
                          return { ...current, answers };
                        })
                      }
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
            ))}
          </>
        )}
        {task.skill === 'mediation' && (
          <div className="a2-document mb-4" lang="nl">
            {material.mediation.source}
          </div>
        )}
        {openTask && (
          <>
            <p className="fw-semibold">{openTask.instruction}</p>
            <ul>
              {openTask.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </>
        )}
        {task.skill === 'interaction' && (
          <>
            <p>
              Responda em voz alta aos três turnos. Se o microfone estiver indisponível, digite e
              registre como prática escrita. A conversa é roteirizada; o professor avalia a
              adequação das suas respostas.
            </p>
            {material.dialogue.slice(0, dialogueStage + 1).map((turn, i) => (
              <div className="border rounded-3 p-3 mb-3" key={turn.file}>
                <h3 className="h6">Interlocutor · turno {i + 1}</h3>
                <A2AudioPlayer
                  file={turn.file}
                  label={`Pergunta do interlocutor ${i + 1}`}
                  onPlay={() =>
                    patch((current) => ({ ...current, plays: (current.plays ?? 0) + 1 }))
                  }
                  onSlow={() => support('interlocutor desacelerado')}
                />
                <button
                  className="btn btn-sm btn-outline-secondary mb-2"
                  type="button"
                  onClick={() => support(`texto do turno ${i + 1}`)}
                >
                  Ler pergunta
                </button>
                {draft.supports.includes(`texto do turno ${i + 1}`) && (
                  <p lang="nl">{turn.prompt}</p>
                )}
                <p className="small">{turn.instruction}</p>
                <label className="form-label small" htmlFor={`turn-${i}`}>
                  Sua resposta ou notas (holandês)
                </label>
                <textarea
                  id={`turn-${i}`}
                  className="form-control"
                  rows={2}
                  maxLength={3000}
                  value={draft.turns[i] === '[resposta em áudio]' ? '' : (draft.turns[i] ?? '')}
                  disabled={!editing}
                  onChange={(event) =>
                    patch((current) => {
                      const turns = [...current.turns];
                      turns[i] = event.target.value;
                      return { ...current, turns };
                    })
                  }
                />
                {editing && (
                  <A2Recorder
                    taskId={`${task.id}:turn:${i}`}
                    ids={draft.recordings[i] ? [draft.recordings[i]] : []}
                    onSave={(id) =>
                      patch((current) => {
                        const recordings = [...current.recordings];
                        recordings[i] = id;
                        const turns = [...current.turns];
                        if (!turns[i]?.trim()) turns[i] = '[resposta em áudio]';
                        return { ...current, recordings, turns };
                      })
                    }
                    onDelete={() =>
                      patch((current) => {
                        const recordings = [...current.recordings];
                        recordings[i] = '';
                        return { ...current, recordings };
                      })
                    }
                  />
                )}
                {editing && i === dialogueStage && i < material.dialogue.length - 1 && (
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    disabled={!draft.turns[i]?.trim()}
                    onClick={() => setDialogueStage(i + 1)}
                  >
                    Ouvir próximo turno
                  </button>
                )}
              </div>
            ))}
          </>
        )}
        {!closed && task.skill !== 'interaction' && (
          <>
            <label className="form-label fw-semibold" htmlFor="a2Response">
              {task.skill === 'speaking'
                ? 'Roteiro ou alternativa escrita (não substitui avaliação oral)'
                : task.skill === 'mediation'
                  ? 'Sua resposta em português'
                  : 'Sua resposta em holandês'}
            </label>
            <textarea
              id="a2Response"
              className="form-control"
              lang={task.skill === 'mediation' ? 'pt-BR' : 'nl'}
              rows={5}
              maxLength={10000}
              disabled={!editing}
              value={draft.response}
              onChange={(event) => patch({ response: event.target.value })}
            />
            {task.skill === 'speaking' && editing && (
              <A2Recorder
                taskId={task.id}
                ids={draft.recordings}
                onSave={(id) => patch((current) => ({ ...current, recordings: [id] }))}
                onDelete={(id) =>
                  patch((current) => ({
                    ...current,
                    recordings: current.recordings.filter((item) => item !== id),
                  }))
                }
              />
            )}
          </>
        )}
        {!closed && (
          <>
            <div className="mt-3 d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => support('modelo consultado')}
              >
                Consultar modelo e comparar
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => support('ajuda de formulação')}
              >
                Ajuda para formular
              </button>
            </div>
            {showModel && (
              <div className="alert alert-light border mt-3">
                <strong>Um exemplo possível</strong>
                {(task.skill === 'interaction'
                  ? material.dialogue.map((t) => t.sample)
                  : openTask!.samples
                ).map((sample) => (
                  <p key={sample} className="mb-1 mt-2">
                    {sample}
                  </p>
                ))}
                <p className="small mt-2 mb-0">
                  Outras respostas podem cumprir a tarefa. O professor avalia a mensagem, não a
                  semelhança com este modelo.
                </p>
              </div>
            )}
            {draft.supports.includes('ajuda de formulação') && (
              <p className="alert alert-info small mt-3">
                Diga primeiro o que precisa comunicar. Use frases curtas, confira cada ponto da
                tarefa e, na conversa, peça repetição se necessário: Kunt u dat herhalen,
                alstublieft?
              </p>
            )}
            <h3 className="h6 fw-bold mt-4">Autoavaliação · ainda não é avaliação do professor</h3>
            <p className="small text-secondary">
              0: não consegui · 1: parcialmente · 2: consegui com limitações · 3: consegui com
              clareza. Escala interna de prática, não nota oficial de A2.
            </p>
            <div className="row g-3">
              {RUBRIC_LABELS.map((label, i) => (
                <div className="col-sm-6" key={label}>
                  <label className="form-label small" htmlFor={`rubric-${i}`}>
                    {label}
                  </label>
                  <select
                    id={`rubric-${i}`}
                    className="form-select"
                    disabled={!editing}
                    value={draft.rubric[i] ?? -1}
                    onChange={(event) =>
                      patch((current) => {
                        const rubric = [...current.rubric];
                        rubric[i] = Number(event.target.value);
                        return { ...current, rubric };
                      })
                    }
                  >
                    <option value={-1}>Escolha uma nota</option>
                    {[0, 1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
        {error && (
          <p className="alert alert-danger mt-3" role="alert">
            {error}
          </p>
        )}
        {!editing && latest && (
          <div
            className={`alert mt-4 ${latest.correct === true ? 'alert-success' : 'alert-info'}`}
            role="status"
          >
            <strong>
              {saved ? 'Tentativa salva. ' : ''}
              {closed
                ? latest.correct
                  ? 'Informação compreendida.'
                  : 'Confira o feedback e pratique novamente.'
                : 'Autoavaliação registrada. Exporte o portfólio para uma revisão manual.'}
            </strong>
            {closed &&
              source?.questions.map((q) => (
                <p className="small mt-2 mb-0" key={q.prompt}>
                  {q.prompt} — {q.explanation}
                </p>
              ))}
            {reviewed && (
              <p className="small mt-2">
                Avaliação manual de {reviewed.reviewer}: {reviewed.scores.join(' / ')}.{' '}
                {reviewed.comment}
              </p>
            )}
          </div>
        )}
        {draft.supports.length > 0 && (
          <p className="small text-secondary mt-3">
            Apoios registrados: {draft.supports.join(', ')}.
          </p>
        )}
        <div className="d-flex flex-wrap gap-2 mt-4">
          {editing ? (
            <button className="btn btn-primary" type="button" onClick={save}>
              {' '}
              {closed ? 'Verificar e registrar' : 'Registrar autoavaliação'}
            </button>
          ) : (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setEditing(true);
                setSaved(false);
              }}
            >
              Praticar novamente
            </button>
          )}
          {onNext && (
            <button type="button" className="btn btn-outline-primary" onClick={onNext}>
              Próxima atividade →
            </button>
          )}
          <Link to="/a2/portfolio" className="btn btn-link">
            Ver evidências
          </Link>
        </div>
      </div>
    </section>
  );
}
