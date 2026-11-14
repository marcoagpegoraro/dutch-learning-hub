import { Link } from 'react-router-dom';
import { useAppState } from '../../app/AppStateContext';
import { a2Units, skillObjectives } from './a2Data';
import { skillStatus, STATUS_LABELS } from './a2Progress';
import { A2_SKILLS, SKILL_LABELS } from './types';
export function A2SkillSummary({ unitId }: { unitId?: string }) {
  const { state } = useAppState();
  return (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <h2 className="h4 fw-bold">Evidências por habilidade</h2>
        <p className="small text-secondary">
          XP mede atividade. Estes estados usam tarefas novas e revisão em outra sessão, após pelo
          menos 24 horas. Respostas abertas em autoavaliação ficam como prática até uma avaliação
          manual ser importada. Critérios internos, sujeitos à validação pedagógica.
        </p>
        <div className="row g-3">
          {A2_SKILLS.map((skill) => {
            const units = unitId ? a2Units.filter((u) => u.id === unitId) : a2Units;
            const statuses = units.map((unit) => skillStatus(state.a2, skill, unit.id));
            return (
              <div className="col-md-6 col-xl-4" key={skill}>
                <div className="border rounded-3 p-3 h-100">
                  <h3 className="h6 fw-bold">{SKILL_LABELS[skill]}</h3>
                  <p className="small mb-2">{skillObjectives[skill].objective}</p>
                  {unitId ? (
                    <strong className={`small a2-status-${statuses[0]}`}>
                      {STATUS_LABELS[statuses[0]]}
                    </strong>
                  ) : (
                    <>
                      <p className="small mb-1">
                        {statuses.filter((s) => s === 'confirmed').length}/{units.length} unidades
                        com revisão confirmada
                      </p>
                      <p className="small mb-0 text-secondary">
                        {statuses.filter((s) => s === 'demonstrated').length} demonstradas ·{' '}
                        {statuses.filter((s) => s === 'practised').length} em prática
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {!unitId && (
          <Link className="small d-inline-block mt-3" to="/a2">
            Abrir a trilha A2 e as evidências
          </Link>
        )}
      </div>
    </section>
  );
}
