/* Fort Forinthry bridge for the v21 standalone companion.
 * Keeps the dependency engine decoupled from the legacy app while exposing a stable
 * state adapter and a small optimizer panel that can be replaced by native UI later.
 */
(function initFortIntegration(global) {
  'use strict';

  const STORAGE_KEY = 'rs3-leagues-fort-progress-v1';
  const PANEL_ID = 'rs3-fort-next-steps-panel';

  function safeParse(value, fallback = null) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function normalizeList(value) {
    if (value instanceof Set) return [...value];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value && typeof value === 'object') {
      return Object.entries(value).filter(([, complete]) => Boolean(complete)).map(([id]) => id);
    }
    return [];
  }

  function readLegacyState() {
    const candidates = [
      global.RS3_APP_STATE,
      global.appState,
      global.playerState,
      global.leagueState,
      global.state
    ].filter(value => value && typeof value === 'object');

    let stored = {};
    try {
      stored = safeParse(localStorage.getItem(STORAGE_KEY), {}) || {};
    } catch {}

    const source = candidates[0] || {};
    const profile = source.profile || source.player || source;
    const progress = source.progress || profile.progress || {};

    return {
      completed: normalizeList(
        stored.completed || progress.completedNodes || profile.completedNodes || profile.completed
      ),
      quests: normalizeList(
        stored.quests || progress.completedQuests || profile.completedQuests || profile.quests
      ),
      levels: {
        ...(profile.skills || source.skills || {}),
        ...(stored.levels || {})
      },
      inventory: {
        ...(profile.inventory || source.inventory || {}),
        ...(stored.inventory || {})
      }
    };
  }

  function saveState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function missingText(item) {
    if (item.type === 'skill') return `${item.skill} ${item.required}`;
    if (item.type === 'material') return `${item.shortfall} more ${item.name}`;
    return item.node?.name || item.id;
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;

    panel = document.createElement('section');
    panel.id = PANEL_ID;
    panel.setAttribute('aria-label', 'Fort Forinthry recommendations');
    panel.style.cssText = [
      'position:fixed', 'right:16px', 'bottom:16px', 'z-index:2147483000',
      'width:min(360px,calc(100vw - 32px))', 'max-height:55vh', 'overflow:auto',
      'background:#111812', 'color:#f3f5f3', 'border:1px solid #38553d',
      'border-radius:12px', 'box-shadow:0 14px 40px rgba(0,0,0,.45)',
      'font:14px/1.4 system-ui,sans-serif', 'padding:14px'
    ].join(';');
    document.body.appendChild(panel);
    return panel;
  }

  function render(options = {}) {
    const engine = global.RS3Dependencies?.createFortEngine?.();
    if (!engine) return null;

    const player = options.player || readLegacyState();
    const next = engine.nextSteps(player, {
      limit: options.limit || 5,
      predicate: node => node.region === 'fort-forinthry' || node.category === 'fort-forinthry'
    });
    const blocked = engine.blocked(player, node => node.region === 'fort-forinthry' || node.category === 'fort-forinthry');
    const panel = ensurePanel();

    const rows = next.length
      ? next.map((result, index) => `<li style="margin:.45rem 0"><strong>${index + 1}. ${result.node.name}</strong><div style="opacity:.75">Ready now${result.unlocks.length ? ` · unlocks ${result.unlocks.length}` : ''}</div></li>`).join('')
      : '<li>No Fort step is currently ready.</li>';

    const nearestBlocked = blocked
      .sort((a, b) => a.missing.length - b.missing.length)
      .slice(0, 3)
      .map(result => `<li style="margin:.4rem 0"><strong>${result.node.name}</strong><div style="opacity:.75">${result.missing.map(missingText).join(', ')}</div></li>`)
      .join('');

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <strong style="font-size:16px">Fort Forinthry — Next Steps</strong>
        <button type="button" data-fort-close aria-label="Close" style="background:transparent;color:inherit;border:0;font-size:20px;cursor:pointer">×</button>
      </div>
      <ol style="padding-left:1.35rem;margin:.7rem 0">${rows}</ol>
      ${nearestBlocked ? `<details><summary style="cursor:pointer">Closest blocked goals</summary><ul style="padding-left:1.25rem">${nearestBlocked}</ul></details>` : ''}
      <div style="margin-top:.65rem;font-size:12px;opacity:.65">Updates when profile or Fort progress changes.</div>`;

    panel.querySelector('[data-fort-close]')?.addEventListener('click', () => panel.remove());
    global.dispatchEvent(new CustomEvent('rs3:fort-recommendations', { detail: { player, next, blocked } }));
    return { player, next, blocked };
  }

  function updateProgress(patch = {}) {
    const current = readLegacyState();
    const merged = {
      completed: normalizeList(patch.completed ?? current.completed),
      quests: normalizeList(patch.quests ?? current.quests),
      levels: { ...current.levels, ...(patch.levels || {}) },
      inventory: { ...current.inventory, ...(patch.inventory || {}) }
    };
    saveState(merged);
    return render({ player: merged });
  }

  const api = { readPlayerState: readLegacyState, updateProgress, render, refresh: render, storageKey: STORAGE_KEY };
  global.RS3FortIntegration = api;

  ['rs3:profile-updated', 'rs3:tasks-updated', 'rs3:state-changed', 'storage'].forEach(eventName => {
    global.addEventListener(eventName, () => render());
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => render(), { once: true });
  } else {
    render();
  }
})(window);
