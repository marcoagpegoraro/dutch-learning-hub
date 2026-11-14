import { recommendA2Task } from './a2Recommendations';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../../app/AppStateContext';
import { a2Units, a2AssetUrl, caseAudioFiles } from './a2Data';
import { A2SkillSummary } from './A2SkillSummary';
import { A2_SKILLS } from './types';
import { skillStatus } from './a2Progress';
export function A2CoursePage() {
  const { state } = useAppState();
  const [download, setDownload] = useState('');
  const next = recommendA2Task(state.a2);
  async function downloadUnit(id: string) {
    const unit = a2Units.find((u) => u.id === id);
    if (!unit) return;
    if (!('caches' in window) || !navigator.serviceWorker?.controller) {
      setDownload(
        'O download offline fica disponível na versão instalada/publicada, após o carregamento da PWA.',
      );
      return;
    }
    setDownload(`Baixando ${unit.title}…`);
    try {
      const cache = await caches.open('dutch-hub-a2-media-v1');
      await cache.addAll([...new Set(unit.cases.flatMap(caseAudioFiles))].map(a2AssetUrl));
      setDownload(
        `Áudios de ${unit.title} disponíveis offline neste dispositivo. Abra também a unidade para guardar sua página.`,
      );
    } catch {
      setDownload('Não foi possível terminar o download. Confira a conexão e o espaço disponível.');
    }
  }
  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Preparação por situações</span>
      <h1 className="display-6 fw-bold">Trilha A2</h1>
      <p className="text-secondary">
        12 unidades para compreender e comunicar em situações cotidianas. Comece pelo piloto de
        transporte ou escolha um contexto. Cada unidade tem estudo, uma situação nova e uma revisão
        com material diferente.
      </p>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link className="btn btn-primary" to="/a2/transport">
          Começar pelo transporte
        </Link>
        <Link className="btn btn-outline-primary" to="/a2/portfolio">
          Portfólio e avaliação do professor
        </Link>
        <Link className="btn btn-outline-secondary" to="/a2/teacher">
          Área de revisão manual
        </Link>
      </div>
      <div className="alert alert-light border small">
        Conteúdo de preparação em versão inicial: revisão linguística por professor e testes com
        alunos estão pendentes. Áudios sintéticos identificados, com Xander (nl-NL) e Ellen (nl-BE).
        Conclusão de atividades não atribui certificação ou nível A2 automaticamente.{' '}
        <a
          href="https://rm.coe.int/common-european-framework-of-reference-for-languages-learning-teaching/16809ea0d4"
          target="_blank"
          rel="noreferrer"
        >
          Referência QECR
        </a>
        .
      </div>
      {next && (
        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <span className="eyebrow">Próxima prática recomendada</span>
            <h2 className="h5 fw-bold">{a2Units.find((u) => u.id === next.unitId)?.title}</h2>
            <p className="text-secondary small">{next.reason}</p>
            <Link
              className="btn btn-primary"
              to={`/a2/${next.unitId}?mode=${next.mode}&task=${next.taskIndex}`}
            >
              Continuar prática
            </Link>
          </div>
        </section>
      )}
      <A2SkillSummary />
      {download && (
        <p className="alert alert-info" role="status">
          {download}
        </p>
      )}
      <div className="row g-4">
        {a2Units.map((unit, i) => {
          const count = state.a2.evidence.filter((e) => e.unitId === unit.id).length;
          const confirmed = A2_SKILLS.filter(
            (s) => skillStatus(state.a2, s, unit.id) === 'confirmed',
          ).length;
          return (
            <div className="col-12 col-md-6 col-xl-4" key={unit.id}>
              <article className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 d-flex flex-column">
                  <span className="module-icon mb-3">
                    <i className={`bi ${unit.icon}`} />
                  </span>
                  <h2 className="h5 fw-bold">{unit.title}</h2>
                  {i === 0 && (
                    <span className="badge text-bg-primary align-self-start mb-2">
                      Unidade piloto
                    </span>
                  )}
                  <p className="text-secondary small">{unit.objective}</p>
                  <p className="small">
                    {count} tentativas salvas · {confirmed}/6 habilidades confirmadas
                  </p>
                  <div className="mt-auto d-flex flex-wrap gap-2">
                    <Link className="btn btn-primary" to={`/a2/${unit.id}`}>
                      {count ? 'Continuar' : 'Abrir unidade'}
                    </Link>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      type="button"
                      onClick={() => void downloadUnit(unit.id)}
                    >
                      Baixar áudios offline
                    </button>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
