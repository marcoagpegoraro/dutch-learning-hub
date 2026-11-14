import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../../app/AppStateContext';
import { a2Units, findA2Unit } from './a2Data';
import { A2AudioPlayer } from './A2AudioPlayer';
import { importTeacherReviews, validRubric } from './a2Progress';
import { downloadBlob, getA2Recording } from './a2Recordings';
import {
  decodeRecording,
  exportA2Portfolio,
  importPortfolioRecordings,
  mergeA2State,
  parseA2Portfolio,
  type A2Portfolio,
} from './a2Portfolio';
import {
  MODE_LABELS,
  RUBRIC_LABELS,
  SKILL_LABELS,
  type A2Evidence,
  type A2TeacherReview,
} from './types';
const downloadJSON = (value: unknown, name: string) =>
  downloadBlob(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }), name);
export function A2PortfolioPage() {
  const { state, updateA2 } = useAppState();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');
  async function exportFile() {
    setBusy(true);
    setMessage('Preparando o portfólio com áudios…');
    try {
      downloadJSON(
        await exportA2Portfolio(state.a2, state.profile.displayName),
        `portfolio-a2-${new Date().toISOString().slice(0, 10)}.json`,
      );
      setMessage(
        'Portfólio exportado. Ele contém suas respostas e gravações; compartilhe com o professor pelo canal que você escolher.',
      );
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Não foi possível exportar.');
    } finally {
      setBusy(false);
    }
  }
  async function importFile(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const value: unknown = JSON.parse(await file.text());
      if (
        value &&
        typeof value === 'object' &&
        'kind' in value &&
        value.kind === 'dutch-hub-a2-reviews'
      ) {
        let result = state.a2;
        result = importTeacherReviews(result, value);
        updateA2(() => result);
        setMessage('Avaliações manuais importadas e identificadas pelo nome informado no arquivo.');
      } else {
        const portfolio = parseA2Portfolio(value);
        await importPortfolioRecordings(portfolio);
        updateA2((current) => mergeA2State(current, portfolio.a2));
        setMessage('Portfólio e áudios importados, sem apagar suas outras evidências.');
      }
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Não foi possível importar.');
    } finally {
      setBusy(false);
    }
  }
  const evidence = state.a2.evidence
    .filter((e) => filter === 'all' || e.unitId === filter)
    .slice()
    .reverse();
  return (
    <div className="container py-4 py-lg-5">
      <Link to="/a2">← Trilha A2</Link>
      <h1 className="display-6 fw-bold mt-3">Meu portfólio A2</h1>
      <p className="text-secondary">
        Respostas próprias, apoios utilizados, áudios e avaliações. A revisão manual usa uma escala
        interna e não certifica um nível. O nome do avaliador é informado no arquivo; a identidade
        não é verificada pelo site.
      </p>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className="btn btn-primary"
          type="button"
          disabled={busy}
          onClick={() => void exportFile()}
        >
          Exportar respostas e gravações
        </button>
        <label className={`btn btn-outline-primary mb-0 ${busy ? 'disabled' : ''}`}>
          Importar portfólio ou avaliações
          <input
            className="visually-hidden"
            disabled={busy}
            type="file"
            accept=".json,application/json"
            onChange={(event) => {
              void importFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
        <Link to="/a2/teacher" className="btn btn-outline-secondary">
          Abrir área do professor
        </Link>
      </div>
      {message && (
        <p className="alert alert-info" role="status">
          {message}
        </p>
      )}
      <label htmlFor="evidenceUnit" className="form-label">
        Filtrar unidade
      </label>
      <select
        id="evidenceUnit"
        className="form-select mb-4"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      >
        <option value="all">Todas as unidades</option>
        {a2Units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.title}
          </option>
        ))}
      </select>
      {!evidence.length && (
        <p className="alert alert-light border">
          Nenhuma tentativa neste filtro. Complete uma atividade da trilha para criar sua primeira
          evidência.
        </p>
      )}
      {evidence.map((e) => (
        <EvidenceCard
          key={e.id}
          evidence={e}
          review={state.a2.teacherReviews.find((r) => r.evidenceId === e.id)}
        />
      ))}
    </div>
  );
}
function EvidenceCard({
  evidence: e,
  review,
  portfolio,
}: {
  evidence: A2Evidence;
  review?: A2TeacherReview;
  portfolio?: A2Portfolio;
}) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    const made: string[] = [];
    void Promise.all(
      e.recordings.map(async (id) => {
        const stored = portfolio?.recordings.find((c) => c.id === id);
        return stored ? decodeRecording(stored) : await getA2Recording(id);
      }),
    )
      .then((clips) => {
        if (!active) return;
        setUrls(
          clips.filter(Boolean).map((c) => {
            const url = URL.createObjectURL(c!.blob);
            made.push(url);
            return url;
          }),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
      made.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [e, portfolio]);
  return (
    <article className="card border-0 shadow-sm mb-3">
      <div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between gap-2">
          <h2 className="h5 fw-bold">
            {findA2Unit(e.unitId)?.title ?? e.unitId} · {SKILL_LABELS[e.skill]}
          </h2>
          <span className="small text-secondary">{new Date(e.answeredAt).toLocaleString()}</span>
        </div>
        <p className="small">
          {MODE_LABELS[e.mode]} ·{' '}
          {e.source === 'objective'
            ? e.correct
              ? 'Resposta objetiva correta'
              : 'Resposta objetiva a revisar'
            : 'Autoavaliação'}
          {review ? ' · Revisão manual recebida' : ''}
        </p>
        <p className="a2-response" lang={e.skill === 'mediation' ? 'pt-BR' : 'nl'}>
          {e.response || 'Resposta em áudio.'}
        </p>
        {urls.map((url, i) => (
          <audio
            key={url}
            controls
            src={url}
            aria-label={`Gravação da tentativa ${i + 1}`}
            className="me-2 mb-2"
          />
        ))}
        {e.recordings.length > urls.length && (
          <p className="small text-secondary">
            Algumas gravações não estão neste dispositivo ou não foram incluídas no arquivo.
          </p>
        )}
        <p className="small text-secondary mb-1">
          Apoios: {e.supports.length ? e.supports.join(', ') : 'nenhum registrado'}.
        </p>
        {e.rubric && <p className="small mb-1">Autoavaliação: {e.rubric.join(' / ')}.</p>}
        {review && (
          <div className="alert alert-light border small mb-0">
            Revisão manual por {review.reviewer}: {review.scores.join(' / ')}. {review.comment}
          </div>
        )}
      </div>
    </article>
  );
}
export function A2TeacherPage() {
  const [portfolio, setPortfolio] = useState<A2Portfolio | null>(null);
  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');
  const [reviews, setReviews] = useState<Record<string, A2TeacherReview>>({});
  const [message, setMessage] = useState('');
  const evidence = portfolio?.a2.evidence.filter((e) => e.source === 'self') ?? [];
  const current = evidence[index];
  const review = current ? reviews[current.id] : undefined;
  function patch(scores: number[], comment: string) {
    if (!current) return;
    setReviews((all) => ({
      ...all,
      [current.id]: {
        evidenceId: current.id,
        reviewer: name.trim(),
        scores,
        comment,
        reviewedAt: new Date().toISOString(),
      },
    }));
  }
  async function load(file?: File) {
    if (!file) return;
    try {
      const parsed = parseA2Portfolio(JSON.parse(await file.text()));
      setPortfolio(parsed);
      setIndex(0);
      setReviews({});
      setMessage(
        'Portfólio aberto localmente. Ouça os áudios e avalie a tarefa antes de atribuir notas.',
      );
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Arquivo inválido.');
    }
  }
  const task = current
    ? findA2Unit(current.unitId)?.cases.find((c) => c.id === current.mode)
    : undefined;
  return (
    <div className="container py-4 py-lg-5">
      <Link to="/a2/portfolio">← Portfólio</Link>
      <h1 className="display-6 fw-bold mt-3">Revisão manual do professor</h1>
      <p className="text-secondary">
        Abra o portfólio exportado pelo aluno, avalie as respostas abertas e devolva o arquivo de
        avaliação. O arquivo fica no seu navegador e não é enviado ao site. Esta é uma revisão
        pedagógica, sem autenticação de identidade ou certificação.
      </p>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <label className="form-label" htmlFor="teacherFile">
            Portfólio do aluno (.json)
          </label>
          <input
            id="teacherFile"
            className="form-control mb-3"
            type="file"
            accept=".json,application/json"
            onChange={(event) => {
              void load(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <label className="form-label" htmlFor="reviewerName">
            Nome do avaliador
          </label>
          <input
            id="reviewerName"
            className="form-control"
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </div>
      {message && (
        <p className="alert alert-info" role="status">
          {message}
        </p>
      )}
      {portfolio && (
        <p>
          Aluno: <strong>{portfolio.displayName}</strong> · {evidence.length} respostas abertas.
        </p>
      )}
      {current && (
        <>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <button
              className="btn btn-outline-secondary"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              Anterior
            </button>
            <span className="align-self-center">
              {index + 1}/{evidence.length}
            </span>
            <button
              className="btn btn-outline-secondary"
              disabled={index === evidence.length - 1}
              onClick={() => setIndex(index + 1)}
            >
              Próxima
            </button>
          </div>
          {task && (
            <details className="card p-3 border-0 shadow-sm mb-3">
              <summary>Consultar a tarefa e os materiais</summary>
              <div className="mt-3">
                {task.documents.map((d) => (
                  <p className="a2-document" key={d.title} lang="nl">
                    {d.text}
                  </p>
                ))}
                {task.audios.map((a) => (
                  <div key={a.file}>
                    <A2AudioPlayer file={a.file} label={a.title} />
                    <p className="a2-document" lang="nl">
                      {a.text}
                    </p>
                  </div>
                ))}
                {current.skill === 'interaction' ? (
                  task.dialogue.map((t) => (
                    <p key={t.file}>
                      {t.prompt} — {t.instruction}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="fw-bold">
                      {task[current.skill as 'writing' | 'speaking' | 'mediation']?.instruction}
                    </p>
                    <ul>
                      {task[current.skill as 'writing' | 'speaking' | 'mediation']?.points.map(
                        (p) => (
                          <li key={p}>{p}</li>
                        ),
                      )}
                    </ul>
                  </>
                )}
              </div>
            </details>
          )}
          <EvidenceCard evidence={current} portfolio={portfolio!} />
          <section className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h2 className="h5">Critérios da resposta</h2>
              <p className="small text-secondary">
                0: não cumpre · 1: cumpre parcialmente · 2: cumpre com limitações · 3: cumpre com
                clareza. Uma nota mínima de 2 em cada critério permite registrar evidência positiva
                no curso; não equivale a uma nota oficial de QECR.
              </p>
              <div className="row g-3">
                {RUBRIC_LABELS.map((label, i) => (
                  <div className="col-md-6" key={label}>
                    <label className="form-label" htmlFor={`teacherScore${i}`}>
                      {label}
                    </label>
                    <select
                      id={`teacherScore${i}`}
                      className="form-select"
                      value={review?.scores[i] ?? -1}
                      onChange={(event) => {
                        const scores = [...(review?.scores ?? [-1, -1, -1, -1])];
                        scores[i] = Number(event.target.value);
                        patch(scores, review?.comment ?? '');
                      }}
                    >
                      <option value={-1}>Ainda não avaliado</option>
                      {[0, 1, 2, 3].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <label className="form-label mt-3" htmlFor="teacherComment">
                Feedback para o aluno
              </label>
              <textarea
                id="teacherComment"
                className="form-control"
                rows={3}
                maxLength={3000}
                value={review?.comment ?? ''}
                onChange={(event) => patch(review?.scores ?? [-1, -1, -1, -1], event.target.value)}
              />
            </div>
          </section>
        </>
      )}
      {portfolio && !evidence.length && (
        <p className="alert alert-light border">
          Este portfólio ainda não tem respostas abertas para revisar.
        </p>
      )}
      <button
        type="button"
        className="btn btn-primary"
        disabled={
          !portfolio || !name.trim() || !Object.values(reviews).some((r) => validRubric(r.scores))
        }
        onClick={() => {
          const complete = Object.values(reviews)
            .filter((r) => validRubric(r.scores))
            .map((r) => ({ ...r, reviewer: name.trim() }));
          downloadJSON(
            { kind: 'dutch-hub-a2-reviews', version: 1, reviews: complete },
            'avaliacoes-a2.json',
          );
          setMessage(
            `Arquivo exportado com ${complete.length} avaliações completas. Devolva ao aluno para importar no portfólio.`,
          );
        }}
      >
        Exportar avaliações completas
      </button>
    </div>
  );
}
