interface PlaceholderPageProps {
  title: string;
  eyebrow: string;
  description: string;
  nextStep: string;
}

export function PlaceholderPage({ title, eyebrow, description, nextStep }: PlaceholderPageProps) {
  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="version-badge muted">Migration queued</div>
      </header>

      <article className="panel placeholder-panel">
        <div className="placeholder-icon">↗</div>
        <h2>This system remains safely in V20 for now.</h2>
        <p>
          V3 is being migrated one feature at a time so working behavior is not lost during the architecture change.
        </p>
        <div className="next-step-box">
          <span>Next migration step</span>
          <strong>{nextStep}</strong>
        </div>
      </article>
    </section>
  );
}
