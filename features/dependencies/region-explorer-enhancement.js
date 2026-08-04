/* Relic-planner-style Region Planner for the existing Regions page.
 * Reads the app's rendered region cards, then replaces the legacy card grid
 * with a searchable master/detail planner.
 */
(function initRegionPlannerEnhancement(global) {
  'use strict';

  const ROOT_ID = 'rs3-region-explorer-enhanced';
  const STORAGE_KEY = 'rs3-leagues-selected-region-v1';
  const KNOWN_REGIONS = [
    'Misthalin', 'Havenhythe', 'Asgarnia', 'Wilderness', 'Kandarin',
    'Morytania', 'Karamja', 'Desert', 'Fremennik', 'Tirannwn'
  ];
  const LEGACY_ONLY_CARDS = ['Elven Lands', 'Anachronia'];

  function findPlannerHeading() {
    return [...document.querySelectorAll('h1,h2')].find(el => {
      const text = el.textContent.trim().toLowerCase();
      return text === 'region explorer' || text === 'region planner';
    }) || null;
  }

  function closestCard(heading) {
    let current = heading.parentElement;
    while (current && current !== document.body) {
      const text = current.textContent || '';
      const rect = current.getBoundingClientRect();
      if (text.length > 60 && rect.width > 240 && rect.height > 160) return current;
      current = current.parentElement;
    }
    return heading.parentElement;
  }

  function findNamedCard(scope, name) {
    const heading = [...scope.querySelectorAll('h2,h3,h4,strong')].find(el =>
      el.textContent.trim().toLowerCase() === name.toLowerCase()
    );
    return heading ? closestCard(heading) : null;
  }

  function readLabelValue(text, label, nextLabels) {
    const start = text.toUpperCase().indexOf(label.toUpperCase());
    if (start < 0) return '';
    const after = text.slice(start + label.length).trim();
    let end = after.length;
    for (const next of nextLabels) {
      const index = after.toUpperCase().indexOf(next.toUpperCase());
      if (index >= 0 && index < end) end = index;
    }
    return after.slice(0, end).replace(/^[:\s-]+/, '').trim();
  }

  function parseNumber(value) {
    const match = String(value || '').match(/[\d,]+/);
    return match ? Number(match[0].replace(/,/g, '')) : 0;
  }

  function parseCard(card, name) {
    const text = (card.innerText || card.textContent || '').replace(/\n{3,}/g, '\n\n');
    const upper = text.toUpperCase();
    const labels = [
      'SUBAREAS / CITIES', 'LEAGUE STATUS', 'TASKS', 'DUMMY TASKS', 'TOTAL POINTS',
      '10 PT', '30 PT', '80 PT', '200 PT', '400 PT', 'TOP SKILL COVERAGE',
      'BOSSES IN OLD TASK SET', 'PLANNING NOTES'
    ];
    const status = /STARTER REGION|STARTER/i.test(text) ? 'Starter'
      : /UNLOCKED|SELECTED/i.test(text) ? 'Unlocked'
      : /LOCKED/i.test(text) ? 'Locked' : 'Available';
    const value = label => readLabelValue(text, label, labels.filter(item => item !== label));
    const pointCounts = {};
    for (const tier of ['10 PT', '30 PT', '80 PT', '200 PT', '400 PT']) {
      pointCounts[tier.replace(' PT', '')] = parseNumber(value(tier));
    }
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      status,
      subareas: value('SUBAREAS / CITIES'),
      tasks: parseNumber(value(upper.includes('DUMMY TASKS') ? 'DUMMY TASKS' : 'TASKS')),
      totalPoints: parseNumber(value('TOTAL POINTS')),
      skills: value('TOP SKILL COVERAGE'),
      bosses: value('BOSSES IN OLD TASK SET'),
      notes: value('PLANNING NOTES'),
      pointCounts,
      sourceCard: card
    };
  }

  function collectRegions(scope) {
    const regions = [];
    for (const name of KNOWN_REGIONS) {
      const card = findNamedCard(scope, name);
      if (!card || regions.some(region => region.sourceCard === card)) continue;
      regions.push(parseCard(card, name));
    }
    return regions;
  }

  function hideLegacyCards(scope, regions) {
    const cards = new Set(regions.map(region => region.sourceCard));
    for (const name of LEGACY_ONLY_CARDS) {
      const card = findNamedCard(scope, name);
      if (card) cards.add(card);
    }
    cards.forEach(card => {
      card.dataset.rxOriginalRegionCard = 'true';
      card.hidden = true;
      card.style.display = 'none';
    });
  }

  function readSelected(regions) {
    let saved = '';
    try { saved = localStorage.getItem(STORAGE_KEY) || ''; } catch {}
    return regions.find(region => region.id === saved)
      || regions.find(region => region.status === 'Starter')
      || regions[0];
  }

  function saveSelected(region) {
    try { localStorage.setItem(STORAGE_KEY, region.id); } catch {}
    global.dispatchEvent(new CustomEvent('rs3:league-region-selected', {
      detail: { regionId: region.id, regionName: region.name }
    }));
  }

  function metric(label, value) {
    return `<div class="rx-metric"><small>${label}</small><strong>${value || '—'}</strong></div>`;
  }

  function renderDetail(region, root) {
    const detail = root.querySelector('[data-rx-detail]');
    const counts = Object.entries(region.pointCounts)
      .filter(([, value]) => value > 0)
      .map(([tier, value]) => metric(`${tier} pt`, value))
      .join('');
    detail.innerHTML = `
      <div class="rx-detail-head"><div>
        <div class="rx-title-row"><h2>${region.name}</h2><span class="rx-badge ${region.status.toLowerCase()}">${region.status}</span></div>
        <p>${region.subareas || 'Region details will populate from the loaded task set.'}</p>
      </div></div>
      <div class="rx-metrics">${metric('Tasks', region.tasks)}${metric('Total points', region.totalPoints.toLocaleString())}${counts}</div>
      <section class="rx-info"><small>TOP SKILL COVERAGE</small><p>${region.skills || 'Not available in the loaded task set.'}</p></section>
      <section class="rx-info"><small>BOSSES</small><p>${region.bosses || 'No bosses listed in the loaded task set.'}</p></section>
      ${region.notes ? `<section class="rx-info"><small>PLANNING NOTES</small><p>${region.notes}</p></section>` : ''}
      <div class="rx-actions">
        <button type="button" data-rx-select ${region.status === 'Locked' ? 'disabled' : ''}>${region.status === 'Locked' ? 'Region locked' : 'Select this region'}</button>
        <button type="button" data-rx-plan>Plan with this region</button>
      </div>`;

    detail.querySelector('[data-rx-select]')?.addEventListener('click', () => {
      saveSelected(region);
      root.dataset.selectedRegion = region.id;
      root.querySelectorAll('[data-rx-region]').forEach(button => {
        button.classList.toggle('selected', button.dataset.rxRegion === region.id);
      });
      const button = detail.querySelector('[data-rx-select]');
      if (button) button.textContent = 'Selected region';
    });
    detail.querySelector('[data-rx-plan]')?.addEventListener('click', () => {
      saveSelected(region);
      global.dispatchEvent(new CustomEvent('rs3:plan-with-region', {
        detail: { regionId: region.id, regionName: region.name }
      }));
    });
  }

  function mount() {
    if (document.getElementById(ROOT_ID)) return true;
    const heading = findPlannerHeading();
    if (!heading) return false;
    const page = heading.closest('main,section,[role="main"]') || heading.parentElement?.parentElement || document.body;
    const regions = collectRegions(page);
    if (regions.length < 2) return false;

    heading.textContent = 'Region Planner';
    const subtitle = heading.parentElement?.querySelector('p');
    if (subtitle) subtitle.textContent = 'Compare League regions, review task value, and select the region you want to plan around.';

    const selected = readSelected(regions);
    const root = document.createElement('section');
    root.id = ROOT_ID;
    root.dataset.selectedRegion = selected.id;
    root.innerHTML = `
      <div class="rx-toolbar">
        <label><span>Search regions</span><input type="search" data-rx-search placeholder="Search regions, cities, bosses, or skills..."></label>
        <label><span>Status</span><select data-rx-status><option value="all">All regions</option><option value="Starter">Starter</option><option value="Unlocked">Unlocked</option><option value="Available">Available</option><option value="Locked">Locked</option></select></label>
      </div>
      <div class="rx-layout">
        <div class="rx-list-panel"><div class="rx-list-head"><strong>League regions</strong><small data-rx-count>${regions.length} shown</small></div><div class="rx-list" data-rx-list></div></div>
        <article class="rx-detail" data-rx-detail></article>
      </div>`;

    heading.parentElement?.insertAdjacentElement('afterend', root);
    hideLegacyCards(page, regions);

    const list = root.querySelector('[data-rx-list]');
    const search = root.querySelector('[data-rx-search]');
    const status = root.querySelector('[data-rx-status]');
    function renderList() {
      const query = search.value.trim().toLowerCase();
      const selectedStatus = status.value;
      const visible = regions.filter(region => {
        const haystack = [region.name, region.subareas, region.skills, region.bosses].join(' ').toLowerCase();
        return (!query || haystack.includes(query)) && (selectedStatus === 'all' || region.status === selectedStatus);
      });
      root.querySelector('[data-rx-count]').textContent = `${visible.length} shown`;
      list.innerHTML = visible.map(region => `
        <button type="button" class="rx-region-row ${region.id === root.dataset.selectedRegion ? 'selected' : ''}" data-rx-region="${region.id}">
          <span class="rx-region-icon">${region.name.slice(0, 1)}</span>
          <span><strong>${region.name}</strong><small>${region.status}${region.tasks ? ` · ${region.tasks} tasks` : ''}</small></span>
          <span class="rx-radio" aria-hidden="true"></span>
        </button>`).join('') || '<p class="rx-empty">No regions match those filters.</p>';
      list.querySelectorAll('[data-rx-region]').forEach(button => {
        button.addEventListener('click', () => {
          const region = regions.find(item => item.id === button.dataset.rxRegion);
          if (!region) return;
          root.dataset.selectedRegion = region.id;
          list.querySelectorAll('[data-rx-region]').forEach(row => row.classList.toggle('selected', row === button));
          renderDetail(region, root);
        });
      });
    }
    search.addEventListener('input', renderList);
    status.addEventListener('change', renderList);
    renderList();
    renderDetail(selected, root);
    return true;
  }

  let attempts = 0;
  const observer = new MutationObserver(() => {
    if (mount() || attempts++ > 120) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
})(window);
