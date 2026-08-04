import { useMemo, useState } from 'react';
import { relics } from '../data/relics';

interface RelicPlannerProps {
  selectedRelics: string[];
  onToggleRelic: (id: string) => void;
}

function stageStars(value: number | null) {
  if (value === null) return 'Pending';
  return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`;
}

export function RelicPlanner({ selectedRelics, onToggleRelic }: RelicPlannerProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [focusedId, setFocusedId] = useState(relics[0].id);

  const categories = useMemo(
    () => ['All categories', ...Array.from(new Set(relics.map((relic) => relic.category)))],
    [],
  );

  const filteredRelics = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return relics.filter((relic) => {
      const matchesCategory = category === 'All categories' || relic.category === category;
      const haystack = [
        relic.name,
        relic.category,
        relic.summary,
        relic.plannerImpact,
        ...relic.skills,
        ...relic.bestRegions,
      ]
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!normalizedSearch || haystack.includes(normalizedSearch));
    });
  }, [category, search]);

  const focusedRelic = relics.find((relic) => relic.id === focusedId) ?? filteredRelics[0] ?? relics[0];
  const isSelected = selectedRelics.includes(focusedRelic.id);

  return (
    <section className="page-stack relic-page">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">DATA-DRIVEN PLANNER</p>
          <h1>Relic Build Planner</h1>
          <p>Relics now live in typed data instead of being hard-coded throughout one giant HTML file.</p>
        </div>
        <div className="version-badge">{selectedRelics.length} / {relics.length} selected</div>
      </header>

      <div className="filter-bar">
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter relic categories">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search relics, effects, skills, or regions..."
          aria-label="Search relics"
        />
        <select aria-label="Tier filter" disabled>
          <option>Tier order pending</option>
        </select>
      </div>

      <div className="selection-summary">
        <strong>{selectedRelics.length} / {relics.length} selected</strong>
        <span>Official tier order is still pending; choices will group automatically when confirmed.</span>
      </div>

      <div className="relic-layout">
        <aside className="relic-selector panel">
          <div className="panel-heading sticky-heading">
            <div>
              <p className="eyebrow">REVEALED RELICS</p>
              <h2>{filteredRelics.length} shown</h2>
            </div>
          </div>
          <div className="relic-list">
            {filteredRelics.map((relic) => {
              const selected = selectedRelics.includes(relic.id);
              return (
                <button
                  type="button"
                  key={relic.id}
                  className={focusedRelic.id === relic.id ? 'relic-row active' : 'relic-row'}
                  onClick={() => setFocusedId(relic.id)}
                >
                  <span className={`relic-icon category-${relic.category.toLowerCase()}`}>
                    {relic.name.slice(0, 1)}
                  </span>
                  <span className="relic-row-copy">
                    <strong>{relic.name}</strong>
                    <small>{relic.category}</small>
                  </span>
                  <span className={selected ? 'selection-dot selected' : 'selection-dot'} aria-label={selected ? 'Selected' : 'Not selected'}>
                    {selected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <article className="relic-detail panel">
          <div className="relic-title-row">
            <span className={`relic-hero-icon category-${focusedRelic.category.toLowerCase()}`}>
              {focusedRelic.name.slice(0, 2)}
            </span>
            <div>
              <div className="title-with-chip">
                <h2>{focusedRelic.name}</h2>
                <span className="category-chip">{focusedRelic.category}</span>
              </div>
              <span className="tier-chip">Tier order pending</span>
            </div>
          </div>

          <p className="relic-summary">{focusedRelic.summary}</p>

          <div className="skill-chips">
            {focusedRelic.skills.map((skill) => <span key={skill}>{skill}</span>)}
          </div>

          <div className="impact-box">
            <p className="eyebrow">PLANNER IMPACT</p>
            <p>{focusedRelic.plannerImpact}</p>
          </div>

          <div className="relic-stats-grid">
            <div className="stat-panel">
              <p className="eyebrow">BEST REGIONS</p>
              <p>{focusedRelic.bestRegions.join(', ')}</p>
            </div>
            <div className="stat-panel stage-panel">
              <p className="eyebrow">GAME-STAGE VALUE</p>
              <div><span>Early</span><strong>{stageStars(focusedRelic.stageValue.early)}</strong></div>
              <div><span>Mid</span><strong>{stageStars(focusedRelic.stageValue.mid)}</strong></div>
              <div><span>Late</span><strong>{stageStars(focusedRelic.stageValue.late)}</strong></div>
            </div>
            <div className="stat-panel">
              <p className="eyebrow">PLANNER RATING</p>
              <strong className="rating">{focusedRelic.rating === null ? 'Tier-dependent' : `${focusedRelic.rating.toFixed(1)}/10`}</strong>
            </div>
          </div>

          <details className="details-block">
            <summary>Complete relic details</summary>
            <div className="details-content">
              {focusedRelic.details.map((section) => (
                <section key={section.title}>
                  <h3>{section.title}</h3>
                  <ul>
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                </section>
              ))}
            </div>
          </details>

          <div className="detail-actions">
            <button
              type="button"
              className={isSelected ? 'primary-button selected' : 'primary-button'}
              onClick={() => onToggleRelic(focusedRelic.id)}
            >
              {isSelected ? 'Remove from build' : 'Add to build'}
            </button>
            <button type="button" className="secondary-button" disabled>
              Route logic coming later
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
