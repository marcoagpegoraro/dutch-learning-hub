import { PwaInstallCard } from '../components/PwaInstallCard';

export function AboutPage() {
  return (
    <div className="container py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <span className="eyebrow">About this project</span>
          <h1 className="display-6 fw-bold">Dutch Learning Hub</h1>
          <p className="lead text-secondary">
            A static, privacy-friendly practice space designed to grow from one good clock exercise
            into a modular A1 learning companion.
          </p>
          <section className="card border-0 shadow-sm mt-4">
            <div className="card-body p-4 p-md-5">
              <h2 className="h4 fw-bold">Complete A1 learning hub</h2>
              <p>
                Guided lessons, grammar, listening, conversation, picture, pronunciation and
                gamified challenges run without an application backend. No account is required.
              </p>
              <h2 className="h4 fw-bold mt-4">Privacy</h2>
              <p className="mb-0">
                Progress is stored in local storage on this device. You can export, import, or reset
                it from Settings.
              </p>
            </div>
          </section>
          <div className="mt-4">
            <PwaInstallCard />
          </div>
        </div>
      </div>
    </div>
  );
}
