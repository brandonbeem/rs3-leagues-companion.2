/* Fort Forinthry player-state bridge and testable progression drawer. */
(function initFortIntegration(global) {
  'use strict';

  const STORAGE_KEY = 'rs3-leagues-fort-progress-v2';
  const LEGACY_KEY = 'rs3-leagues-fort-progress-v1';
  const DRAWER_ID = 'rs3-fort-drawer';
  const LAUNCHER_ID = 'rs3-fort-launcher';

  const safeParse = (value, fallback = null) => { try { return JSON.parse(value); } catch { return fallback; } };
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  const normalizeList = value => {
    if (value instanceof Set) return [...value];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value && typeof value === 'object') return Object.entries(value).filter(([, done]) => Boolean(done)).map(([id]) => id);
    return [];
  };

  function defaultState() {
    return { completed: [], quests: [], levels: { Construction: 1, Necromancy: 1 }, inventory: {} };
  }

  function readStoredState() {
    try {
      const current = safeParse(localStorage.getItem(STORAGE_KEY), null);
      if (current) return current;
      const legacy = safeParse(localStorage.getItem(LEGACY_KEY), null);
      if (legacy) return legacy;
    } catch {}
    return defaultState();
  }

  function readLegacyAppState() {
    const candidates = [global.RS3_APP_STATE, global.appState, global.playerState, global.leagueState, global.state]
      .filter(value => value && typeof value === 'object');
    const source = candidates[0] || {};
    const profile = source.profile || source.player || source;
    const progress = source.progress || profile.progress || {};
    return {
      completed: normalizeList(progress.completedNodes || profile.completedNodes || profile.completed),
      quests: normalizeList(progress.completedQuests || profile.completedQuests || profile.quests),
      levels: { ...(profile.skills || source.skills || {}) },
      inventory: { ...(profile.inventory || source.inventory || {}) }
    };
  }

  function mergeState(base, patch) {
    return {
      completed: [...new Set(normalizeList(patch.completed ?? base.completed))],
      quests: [...new Set(normalizeList(patch.quests ?? base.quests))],
      levels: { ...(base.levels || {}), ...(patch.levels || {}) },
      inventory: { ...(base.inventory || {}), ...(patch.inventory || {}) }
    };
  }

  function readPlayerState() {
    return mergeState(readLegacyAppState(), readStoredState());
  }

  function saveState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function engine() {
    return global.RS3Dependencies?.createFortEngine?.() || null;
  }

  function fortNodes() {
    return global.RS3_FORT_FORINTHRY_DATA?.nodes || [];
  }

  function materialDefinitions() {
    const byId = new Map();
    fortNodes().forEach(node => (node.requirements?.materials || []).forEach(material => byId.set(material.id, material)));
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  function missingText(item) {
    if (item.type === 'skill') return `${item.skill} ${item.required} (current ${item.current})`;
    if (item.type === 'material') return `${item.shortfall} more ${item.name}`;
    return item.node?.name || item.id;
  }

  function nodeLabel(node) {
    return node.type === 'fort-building' ? `${node.name} — Tier ${node.tier}` : node.name;
  }

  function ensureUi() {
    let launcher = document.getElementById(LAUNCHER_ID);
    if (!launcher) {
      launcher = document.createElement('button');
      launcher.id = LAUNCHER_ID;
      launcher.type = 'button';
      launcher.textContent = '🏰 Fort Planner';
      launcher.addEventListener('click', () => openDrawer());
      document.body.appendChild(launcher);
    }

    let drawer = document.getElementById(DRAWER_ID);
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.id = DRAWER_ID;
      drawer.hidden = true;
      drawer.setAttribute('aria-label', 'Fort Forinthry progression planner');
      drawer.innerHTML = `
        <header class="fort-head"><div><h2>Fort Forinthry Planner</h2><p>Test progression dependencies before native optimizer integration.</p></div><button class="fort-close" type="button" aria-label="Close Fort planner">×</button></header>
        <nav class="fort-tabs" aria-label="Fort planner sections">
          <button type="button" class="active" data-fort-tab="recommendations">Next Steps</button>
          <button type="button" data-fort-tab="progress">Progress</button>
          <button type="button" data-fort-tab="materials">Materials</button>
        </nav>
        <div class="fort-body">
          <section class="fort-panel active" data-fort-panel="recommendations"><div id="fortRecommendations"></div></section>
          <section class="fort-panel" data-fort-panel="progress"><div id="fortProgressEditor"></div></section>
          <section class="fort-panel" data-fort-panel="materials"><div id="fortMaterialEditor"></div></section>
        </div>
        <footer class="fort-footer">Saved locally in this browser. Nothing here changes the live app or main branch.</footer>`;
      drawer.querySelector('.fort-close').addEventListener('click', closeDrawer);
      drawer.querySelectorAll('[data-fort-tab]').forEach(button => button.addEventListener('click', () => selectTab(button.dataset.fortTab)));
      document.body.appendChild(drawer);
    }
    return drawer;
  }

  function selectTab(name) {
    const drawer = ensureUi();
    drawer.querySelectorAll('[data-fort-tab]').forEach(button => button.classList.toggle('active', button.dataset.fortTab === name));
    drawer.querySelectorAll('[data-fort-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.fortPanel === name));
  }

  function openDrawer() {
    const drawer = ensureUi();
    drawer.hidden = false;
    render();
  }

  function closeDrawer() {
    const drawer = document.getElementById(DRAWER_ID);
    if (drawer) drawer.hidden = true;
  }

  function renderRecommendations(player) {
    const dependencyEngine = engine();
    const target = document.getElementById('fortRecommendations');
    if (!dependencyEngine || !target) return;
    const predicate = node => node.locality === 'Fort Forinthry';
    const ready = dependencyEngine.nextSteps(player, { limit: 10, predicate });
    const blocked = dependencyEngine.blocked(player, predicate)
      .sort((a, b) => a.missing.length - b.missing.length || a.node.name.localeCompare(b.node.name))
      .slice(0, 8);
    const completeCount = fortNodes().filter(node => player.completed.includes(node.id) || player.quests.includes(node.id)).length;

    target.innerHTML = `
      <div class="fort-status"><b>${completeCount} / ${fortNodes().length} Fort nodes complete</b><br>${ready.length} step${ready.length === 1 ? '' : 's'} currently ready.</div>
      <div class="fort-card"><h3>Recommended next steps</h3><div class="fort-list">${ready.length ? ready.map((result, index) => `
        <article class="fort-step ready"><div class="fort-step-line"><b>${index + 1}. ${esc(nodeLabel(result.node))}</b><span class="fort-pill">Ready</span></div><small>${result.unlocks.length ? `Unlocks ${result.unlocks.length} downstream item${result.unlocks.length === 1 ? '' : 's'}.` : 'Progression requirement satisfied.'}</small></article>`).join('') : '<div class="fort-empty">No Fort steps are ready with the current test profile.</div>'}</div></div>
      <div class="fort-card"><h3>Closest blocked goals</h3><div class="fort-list">${blocked.length ? blocked.map(result => `
        <article class="fort-step blocked"><div class="fort-step-line"><b>${esc(nodeLabel(result.node))}</b><span class="fort-pill">${result.missing.length} blocker${result.missing.length === 1 ? '' : 's'}</span></div><small>${esc(result.missing.map(missingText).join(' · '))}</small></article>`).join('') : '<div class="fort-empty">Nothing is blocked.</div>'}</div></div>`;
  }

  function renderProgressEditor(player) {
    const target = document.getElementById('fortProgressEditor');
    if (!target) return;
    const quests = fortNodes().filter(node => node.type === 'quest');
    const buildings = fortNodes().filter(node => node.type === 'fort-building');
    const bosses = fortNodes().filter(node => node.type === 'boss');
    const checkbox = node => `<label class="fort-check"><input type="checkbox" data-fort-node="${esc(node.id)}" data-fort-kind="${node.type === 'quest' ? 'quest' : 'completed'}" ${(node.type === 'quest' ? player.quests : player.completed).includes(node.id) ? 'checked' : ''}><span><b>${esc(nodeLabel(node))}</b><small>${esc(node.type.replace('-', ' '))}</small></span></label>`;
    target.innerHTML = `
      <div class="fort-card"><h3>Player levels</h3><div class="fort-grid">
        <div class="fort-field"><label for="fortConstruction">Construction</label><input id="fortConstruction" type="number" min="1" max="120" value="${Number(player.levels.Construction || 1)}"></div>
        <div class="fort-field"><label for="fortNecromancy">Necromancy</label><input id="fortNecromancy" type="number" min="1" max="120" value="${Number(player.levels.Necromancy || 1)}"></div>
      </div></div>
      <div class="fort-card"><h3>Quest progression</h3><div class="fort-checks">${quests.map(checkbox).join('')}</div></div>
      <div class="fort-card"><h3>Building tiers</h3><div class="fort-checks">${buildings.map(checkbox).join('')}</div></div>
      <div class="fort-card"><h3>Boss progression</h3><div class="fort-checks">${bosses.map(checkbox).join('')}</div></div>
      <div class="fort-actions"><button class="fort-btn primary" type="button" data-fort-save-progress>Save & recalculate</button><button class="fort-btn" type="button" data-fort-reset>Reset test profile</button></div>`;
    target.querySelector('[data-fort-save-progress]').addEventListener('click', saveProgressForm);
    target.querySelector('[data-fort-reset]').addEventListener('click', resetState);
  }

  function renderMaterialEditor(player) {
    const target = document.getElementById('fortMaterialEditor');
    if (!target) return;
    const materials = materialDefinitions();
    target.innerHTML = `<div class="fort-card"><h3>Available construction materials</h3><div class="fort-grid">${materials.map(material => `
      <div class="fort-field"><label for="fort-mat-${esc(material.id)}">${esc(material.name)}</label><input id="fort-mat-${esc(material.id)}" data-fort-material="${esc(material.id)}" type="number" min="0" value="${Number(player.inventory[material.id] || 0)}"></div>`).join('')}</div></div>
      <div class="fort-actions"><button class="fort-btn primary" type="button" data-fort-save-materials>Save materials & recalculate</button><button class="fort-btn" type="button" data-fort-fill-materials>Fill generous test amounts</button></div>`;
    target.querySelector('[data-fort-save-materials]').addEventListener('click', saveMaterialForm);
    target.querySelector('[data-fort-fill-materials]').addEventListener('click', fillMaterials);
  }

  function saveProgressForm() {
    const current = readPlayerState();
    const quests = [];
    const completed = [];
    document.querySelectorAll('[data-fort-node]').forEach(input => {
      if (!input.checked) return;
      (input.dataset.fortKind === 'quest' ? quests : completed).push(input.dataset.fortNode);
    });
    updateProgress({
      quests,
      completed,
      levels: {
        Construction: Number(document.getElementById('fortConstruction')?.value || 1),
        Necromancy: Number(document.getElementById('fortNecromancy')?.value || 1)
      },
      inventory: current.inventory
    });
    selectTab('recommendations');
  }

  function saveMaterialForm() {
    const inventory = {};
    document.querySelectorAll('[data-fort-material]').forEach(input => { inventory[input.dataset.fortMaterial] = Number(input.value || 0); });
    updateProgress({ inventory });
    selectTab('recommendations');
  }

  function fillMaterials() {
    const inventory = {};
    materialDefinitions().forEach(material => { inventory[material.id] = 500; });
    updateProgress({ inventory });
    selectTab('recommendations');
  }

  function resetState() {
    saveState(defaultState());
    render();
    selectTab('recommendations');
  }

  function render(options = {}) {
    ensureUi();
    const player = options.player || readPlayerState();
    renderRecommendations(player);
    renderProgressEditor(player);
    renderMaterialEditor(player);
    const dependencyEngine = engine();
    const predicate = node => node.locality === 'Fort Forinthry';
    const detail = dependencyEngine ? {
      player,
      next: dependencyEngine.nextSteps(player, { limit: 10, predicate }),
      blocked: dependencyEngine.blocked(player, predicate)
    } : { player, next: [], blocked: [] };
    global.dispatchEvent(new CustomEvent('rs3:fort-recommendations', { detail }));
    return detail;
  }

  function updateProgress(patch = {}) {
    const merged = mergeState(readPlayerState(), patch);
    saveState(merged);
    return render({ player: merged });
  }

  global.RS3FortIntegration = {
    readPlayerState, updateProgress, render, refresh: render, open: openDrawer, close: closeDrawer,
    reset: resetState, storageKey: STORAGE_KEY
  };

  ['rs3:profile-updated', 'rs3:tasks-updated', 'rs3:state-changed'].forEach(eventName => global.addEventListener(eventName, () => render()));
  global.addEventListener('storage', event => { if (!event.key || event.key === STORAGE_KEY) render(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => render(), { once: true });
  else render();
})(window);
