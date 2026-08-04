/* Generic region progression planner. Every registered region uses this same UI. */
(function initRegionPlanner(global) {
  'use strict';

  const STORAGE_KEY = 'rs3-leagues-region-progress-v1';
  const ROOT_ID = 'rs3-region-planner';
  const readJson = (value, fallback = {}) => { try { return JSON.parse(value) || fallback; } catch { return fallback; } };
  const list = value => value instanceof Set ? [...value] : Array.isArray(value) ? value : [];

  function readStored() {
    try { return readJson(localStorage.getItem(STORAGE_KEY), {}); } catch { return {}; }
  }

  function saveStored(value) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch {}
  }

  function legacyState() {
    const source = global.RS3_APP_STATE || global.appState || global.playerState || global.leagueState || global.state || {};
    const profile = source.profile || source.player || source;
    const progress = source.progress || profile.progress || {};
    return {
      completed: list(progress.completedNodes || profile.completedNodes || profile.completed),
      quests: list(progress.completedQuests || profile.completedQuests || profile.quests),
      levels: { ...(profile.skills || source.skills || {}) },
      inventory: { ...(profile.inventory || source.inventory || {}) }
    };
  }

  function playerState(regionId) {
    const base = legacyState();
    const saved = readStored()[regionId] || {};
    return {
      completed: [...new Set([...base.completed, ...list(saved.completed)])],
      quests: [...new Set([...base.quests, ...list(saved.quests)])],
      levels: { ...base.levels, ...(saved.levels || {}) },
      inventory: { ...base.inventory, ...(saved.inventory || {}) }
    };
  }

  function updateRegion(regionId, patch) {
    const all = readStored();
    const current = all[regionId] || {};
    all[regionId] = {
      completed: patch.completed ?? current.completed ?? [],
      quests: patch.quests ?? current.quests ?? [],
      levels: { ...(current.levels || {}), ...(patch.levels || {}) },
      inventory: { ...(current.inventory || {}), ...(patch.inventory || {}) }
    };
    saveStored(all);
    render(regionId);
  }

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    root = document.createElement('div');
    root.id = ROOT_ID;
    root.innerHTML = '<button class="rp-launch" type="button">🗺️ Region Planner</button><aside class="rp-drawer" hidden></aside>';
    document.body.appendChild(root);
    root.querySelector('.rp-launch').addEventListener('click', () => {
      const drawer = root.querySelector('.rp-drawer');
      drawer.hidden = !drawer.hidden;
      if (!drawer.hidden) render();
    });
    return root;
  }

  function missingText(item) {
    if (item.type === 'skill') return `${item.skill} ${item.required} (current ${item.current})`;
    if (item.type === 'material') return `${item.shortfall} more ${item.name}`;
    return item.node?.name || item.id;
  }

  function render(selectedId = null) {
    const regions = global.RS3RegionRegistry?.list?.() || [];
    if (!regions.length) return;
    const root = ensureRoot();
    const drawer = root.querySelector('.rp-drawer');
    const regionId = selectedId || drawer.dataset.regionId || regions[0].id;
    const region = global.RS3RegionRegistry.get(regionId) || regions[0];
    drawer.dataset.regionId = region.id;

    const engine = global.RS3RegionRegistry.createEngine([region.id]);
    const player = playerState(region.id);
    const ready = engine.nextSteps(player, { limit: 10 });
    const blocked = engine.blocked(player).sort((a, b) => a.missing.length - b.missing.length).slice(0, 8);
    const completedCount = region.nodes.filter(node => player.completed.includes(node.id) || player.quests.includes(node.id)).length;

    const options = regions.map(item => `<option value="${item.id}" ${item.id === region.id ? 'selected' : ''}>${item.parentRegion ? `${item.parentRegion} — ` : ''}${item.name}</option>`).join('');
    const readyRows = ready.length ? ready.map((result, index) => `<li><strong>${index + 1}. ${result.node.name}</strong><small>Ready now${result.unlocks.length ? ` · ${result.unlocks.length} unlocks` : ''}</small></li>`).join('') : '<li>No steps ready with the current progress.</li>';
    const blockedRows = blocked.map(result => `<li><strong>${result.node.name}</strong><small>${result.missing.map(missingText).join(', ')}</small></li>`).join('');

    drawer.innerHTML = `
      <header><div><strong>${region.icon || '🗺️'} Region Progression</strong><small>${completedCount} / ${region.nodes.length} nodes complete</small></div><button data-close type="button">×</button></header>
      <label>Progression area<select data-region>${options}</select></label>
      <p>${region.description || ''}</p>
      <section><h3>Ready now</h3><ol>${readyRows}</ol></section>
      <section><h3>Closest blocked</h3><ul>${blockedRows || '<li>Nothing blocked.</li>'}</ul></section>
      <footer><button data-reset type="button">Reset this area</button><small>Future regions use this same planner and engine.</small></footer>`;

    drawer.querySelector('[data-close]').onclick = () => { drawer.hidden = true; };
    drawer.querySelector('[data-region]').onchange = event => render(event.target.value);
    drawer.querySelector('[data-reset]').onclick = () => {
      const all = readStored(); delete all[region.id]; saveStored(all); render(region.id);
    };
    global.dispatchEvent(new CustomEvent('rs3:region-recommendations', { detail: { region, player, ready, blocked } }));
  }

  global.RS3RegionPlanner = { render, refresh: render, readPlayerState: playerState, updateRegion, storageKey: STORAGE_KEY };
  ['rs3:profile-updated', 'rs3:tasks-updated', 'rs3:state-changed', 'rs3:region-registered', 'storage'].forEach(name => global.addEventListener(name, () => render()));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureRoot, { once: true }); else ensureRoot();
})(window);
