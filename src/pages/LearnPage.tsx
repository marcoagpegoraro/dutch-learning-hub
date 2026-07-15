import { ModuleCard } from '../components/ModuleCard';
import { learningModules } from '../data/modules';
import type { LearningModule } from '../types/exercise';

const categoryLabels: Record<LearningModule['category'], string> = {
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  skills: 'Practical skills',
  review: 'Review & games',
};

export function LearnPage() {
  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Free practice</span>
      <h1 className="display-6 fw-bold">Choose what to learn</h1>
      <p className="text-secondary mb-5">
        Phase 1 and the core A1 exercises are ready. Remaining cards show the roadmap for later
        phases.
      </p>
      {(Object.keys(categoryLabels) as LearningModule['category'][]).map((category) => (
        <section className="mb-5" key={category}>
          <h2 className="h3 fw-bold mb-3">{categoryLabels[category]}</h2>
          <div className="row g-4">
            {learningModules
              .filter((module) => module.category === category)
              .map((module) => (
                <div className="col-12 col-md-6 col-xl-4" key={module.id}>
                  <ModuleCard module={module} />
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
