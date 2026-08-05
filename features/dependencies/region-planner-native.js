/* Native-scoped Region Planner. Replaces the original region card grid in place so the app's own tab system controls visibility. */
(function initNativeRegionPlanner(global) {
  'use strict';

  const ROOT_ID = 'rs3-region-explorer-enhanced';
  const STORAGE_KEY = 'rs3-leagues-selected-region-v1';
  const REGION_NAMES = ['Misthalin','Havenhythe','Asgarnia','Wilderness','Kandarin','Morytania','Karamja','Desert','Fremennik','Tirannwn'];

  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const slug = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const numberFrom = value => Number((String(value || '').match(/[\d,]+/) || ['0'])[0].replace(/,/g, ''));

  function findRegionsTab() {
    return [...document.querySelectorAll('button,a,[role="button"]')].find(node => clean(node.textContent) === 'Regions') || null;
  }

  function findNamedHeading(name) {
    return [...document.querySelectorAll('h2,h3,h4,strong')].find(node =>
      !node.closest(`#${ROOT_ID}`) && clean(node.textContent).toLowerCase() === name.toLowerCase()
    ) || null;
  }

  function findCard(heading) {
    let node = heading?.parentElement || null;
    while (node && node !== document.body) {
      const text = clean(node.textContent);
      const button = [...node.querySelectorAll('button')].find(item => /select region|starter region|claim free region|need region milestone|selected/i.test(clean(item.textContent)));
      if (button && text.length > 35) return node;
      node = node.parentElement;
    }
    return null;
  }

  function commonParent(cards) {
    if (!cards.length) return null;
    let node = cards[0].parentElement;
    while (node && node !== document.body) {
      if (cards.every(card => node.contains(card))) return node;
      node = node.parentElement;
    }
    return null;
  }

  function parseRegion(name, card) {
    const text = clean(card.innerText || card.textContent);
    const action = [...card.querySelectorAll('button')].find(item => /select region|starter region|claim free region|need region milestone|selected/i.test(clean(item.textContent))) || null;
    const actionText = clean(action?.textContent);
    let status = 'Available';
    if (/starter region/i.test(text) || /starter region/i.test(actionText)) status = 'Starter';
    else if (/unlocked|selected/i.test(text) || /selected/i.test(actionText)) status = 'Unlocked';
    else if (/locked|need region milestone/i.test(text) || action?.disabled) status = 'Locked';

    const extract = (label, nextLabels) => {
      const upper = text.toUpperCase();
      const start = upper.indexOf(label);
      if (start < 0) return '';
      const tail = text.slice(start + label.length).trim();
      let end = tail.length;
      nextLabels.forEach(next => {
        const index = tail.toUpperCase().indexOf(next);
        if (index >= 0 && index < end) end = index;
      });
      return tail.slice(0, end).replace(/^[:\s-]+/, '').trim();
    };
    const labels = ['SUBAREAS / CITIES','LEAGUE STATUS','TASKS','DUMMY TASKS','TOTAL POINTS','10 PT','30 PT','80 PT','200 PT','400 PT','TOP SKILL COVERAGE','BOSSES IN OLD TASK SET','PLANNING NOTES'];
    const value = label => extract(label, labels.filter(item => item !== label));
    return {
      id: slug(name), name, card, action, status,
      subareas: value('SUBAREAS / CITIES'),
      tasks: numberFrom(value(text.toUpperCase().includes('DUMMY TASKS') ? 'DUMMY TASKS' : 'TASKS')),
      totalPoints: numberFrom(value('TOTAL POINTS')),
      skills: value('TOP SKILL COVERAGE'),
      bosses: value('BOSSES IN OLD TASK SET'),
      counts: {
        10: numberFrom(value('10 PT')), 30: numberFrom(value('30 PT')), 80: numberFrom(value('80 PT')),
        200: numberFrom(value('200 PT')), 400: numberFrom(value('400 PT'))
      }
    };
  }

  function collect() {
    const regions = [];
    REGION_NAMES.forEach(name => {
      const heading = findNamedHeading(name);
      const card = findCard(heading);
      if (card && !regions.some(region => region.card === card)) regions.push(parseRegion(name, card));
    });
    return regions;
  }

  function selectedRegion(regions) {
    let saved = '';
    try { saved = localStorage.getItem(STORAGE_KEY) || ''; } catch {}
    return regions.find(region => region.id === saved) || regions.find(region => region.status === 'Starter') || regions[0];
  }

  function save(region) {
    try { localStorage.setItem(STORAGE_KEY, region.id); } catch {}
    global.dispatchEvent(new CustomEvent('rs3:league-region-selected', { detail: { regionId: region.id, regionName: region.name } }));
  }

  function metric(label, value) {
    return `<div class="rx-metric"><small>${label}</small><strong>${value || '—'}</strong></div>`;
  }

  function render(root, regions, chosen) {
    root.dataset.selectedRegion = chosen.id;
    const unlocked = regions.filter(region => ['Starter','Unlocked'].includes(region.status));
    root.innerHTML = `
      <section class="rx-unlocked" data-rx-unlocked>${unlocked.map(region => `<button type="button" class="rx-unlocked-card ${region.id === chosen.id ? 'selected' : ''}" data-region="${region.id}"><span class="rx-region-icon">${region.name[0]}</span><span><strong>${region.name}</strong><small>${region.status}${region.tasks ? ` · ${region.tasks} tasks` : ''}</small></span></button>`).join('')}</section>
      <div class="rx-toolbar"><label><span>Search regions</span><input type="search" data-search placeholder="Search regions, cities, bosses, or skills..."></label><label><span>Status</span><select data-status><option value="all">All regions</option><option>Starter</option><option>Unlocked</option><option>Available</option><option>Locked</option></select></label></div>
      <div class="rx-layout"><div class="rx-list-panel"><div class="rx-list-head"><strong>League regions</strong><small data-count></small></div><div class="rx-list" data-list></div></div><article class="rx-detail" data-detail></article></div>`;

    const drawList = () => {
      const query = clean(root.querySelector('[data-search]').value).toLowerCase();
      const status = root.querySelector('[data-status]').value;
      const visible = regions.filter(region => {
        const hay = [region.name,region.subareas,region.skills,region.bosses].join(' ').toLowerCase();
        return (!query || hay.includes(query)) && (status === 'all' || region.status === status);
      });
      root.querySelector('[data-count]').textContent = `${visible.length} shown`;
      root.querySelector('[data-list]').innerHTML = visible.map(region => `<button type="button" class="rx-region-row ${region.id === root.dataset.selectedRegion ? 'selected' : ''}" data-row="${region.id}"><span class="rx-region-icon">${region.name[0]}</span><span><strong>${region.name}</strong><small>${region.status}${region.tasks ? ` · ${region.tasks} tasks` : ''}</small></span><span class="rx-radio"></span></button>`).join('');
      root.querySelectorAll('[data-row]').forEach(button => button.onclick = () => {
        const region = regions.find(item => item.id === button.dataset.row);
        root.dataset.selectedRegion = region.id;
        drawList(); drawDetail(region);
      });
    };

    const drawDetail = region => {
      root.querySelector('[data-detail]').innerHTML = `<div class="rx-title-row"><h2>${region.name}</h2><span class="rx-badge ${region.status.toLowerCase()}">${region.status}</span></div><p>${region.subareas || 'Region details will populate from the loaded task set.'}</p><div class="rx-metrics">${metric('Tasks',region.tasks)}${metric('Total points',region.totalPoints.toLocaleString())}${Object.entries(region.counts).filter(([,v])=>v).map(([k,v])=>metric(`${k} pt`,v)).join('')}</div><section class="rx-info"><small>TOP SKILL COVERAGE</small><p>${region.skills || 'Not available.'}</p></section><section class="rx-info"><small>BOSSES</small><p>${region.bosses || 'No bosses listed.'}</p></section><div class="rx-actions"><button type="button" data-select ${region.status === 'Locked' ? 'disabled' : ''}>${region.status === 'Starter' ? 'Starter region' : region.status === 'Locked' ? 'Need region milestone' : region.status === 'Unlocked' ? 'Select this region' : clean(region.action?.textContent) || 'Unlock this region'}</button><button type="button" data-plan>Plan with this region</button></div>`;
      root.querySelector('[data-select]')?.addEventListener('click', () => {
        if (region.status === 'Locked') return;
        if (region.status === 'Available' && region.action && !region.action.disabled) region.action.click();
        save(region);
        setTimeout(() => mount(true), 120);
      });
      root.querySelector('[data-plan]')?.addEventListener('click', () => save(region));
    };

    root.querySelectorAll('[data-region]').forEach(button => button.onclick = () => {
      const region = regions.find(item => item.id === button.dataset.region);
      root.dataset.selectedRegion = region.id; save(region); drawList(); drawDetail(region);
    });
    root.querySelector('[data-search]').addEventListener('input', drawList);
    root.querySelector('[data-status]').addEventListener('change', drawList);
    drawList(); drawDetail(chosen);
  }

  function mount(forceRefresh = false) {
    const existing = document.getElementById(ROOT_ID);
    const regions = collect();
    if (regions.length < 2) return false;
    const cards = regions.map(region => region.card);
    const host = commonParent(cards);
    if (!host) return false;

    let root = existing;
    if (!root) {
      root = document.createElement('section');
      root.id = ROOT_ID;
      host.insertBefore(root, host.firstChild);
    } else if (root.parentElement !== host) {
      host.insertBefore(root, host.firstChild);
    }

    cards.forEach(card => {
      card.hidden = true;
      card.style.setProperty('display', 'none', 'important');
    });
    const chosen = forceRefresh ? selectedRegion(regions) : selectedRegion(regions);
    render(root, regions, chosen);
    return true;
  }

  function beginMount() {
    let tries = 0;
    const timer = global.setInterval(() => {
      tries += 1;
      if (mount() || tries > 40) global.clearInterval(timer);
    }, 100);
  }

  document.addEventListener('click', event => {
    const tab = event.target.closest('button,a,[role="button"]');
    if (tab && clean(tab.textContent) === 'Regions') setTimeout(beginMount, 0);
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', beginMount, { once: true });
  else beginMount();
})(window);
