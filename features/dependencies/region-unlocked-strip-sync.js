/* Keeps the Region Planner's compact unlocked-region strip synchronized with
 * the app's current region state after the original Regions page rerenders.
 */
(function initUnlockedRegionStripSync(global) {
  'use strict';

  const ROOT_ID = 'rs3-region-explorer-enhanced';
  const STORAGE_KEY = 'rs3-leagues-selected-region-v1';
  const REGION_NAMES = [
    'Misthalin', 'Havenhythe', 'Asgarnia', 'Wilderness', 'Kandarin',
    'Morytania', 'Karamja', 'Desert', 'Fremennik', 'Tirannwn'
  ];

  function regionId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  function findSourceCard(name) {
    const headings = [...document.querySelectorAll('h2,h3,h4,strong')].filter(el =>
      !el.closest(`#${ROOT_ID}`) && el.textContent.trim().toLowerCase() === name.toLowerCase()
    );

    for (const heading of headings) {
      let current = heading.parentElement;
      while (current && current !== document.body) {
        if (current.closest(`#${ROOT_ID}`)) break;
        const action = [...current.querySelectorAll(':scope button')].find(button =>
          /starter region|selected|select region|claim free region|need region milestone/i.test(button.textContent || '')
        );
        if (action) return current;
        current = current.parentElement;
      }
    }
    return null;
  }

  function readState(name) {
    const card = findSourceCard(name);
    if (!card) return null;
    const text = (card.innerText || card.textContent || '').replace(/\s+/g, ' ');
    const action = [...card.querySelectorAll('button')].find(button =>
      /starter region|selected|select region|claim free region|need region milestone/i.test(button.textContent || '')
    );
    const actionText = (action?.textContent || '').trim();

    let status = 'Locked';
    if (/starter region/i.test(text) || /starter region/i.test(actionText)) status = 'Starter';
    else if (/\bunlocked\b/i.test(text) || /\bselected\b/i.test(actionText)) status = 'Unlocked';
    else if (action && !action.disabled && /select region|claim free region/i.test(actionText)) status = 'Available';

    const taskMatch = text.match(/(?:dummy\s+)?tasks?\s+(\d[\d,]*)/i);
    return {
      id: regionId(name),
      name,
      status,
      tasks: taskMatch ? Number(taskMatch[1].replace(/,/g, '')) : 0
    };
  }

  function selectRegion(region, root) {
    try { localStorage.setItem(STORAGE_KEY, region.id); } catch {}
    root.dataset.selectedRegion = region.id;
    global.dispatchEvent(new CustomEvent('rs3:league-region-selected', {
      detail: { regionId: region.id, regionName: region.name }
    }));
    sync();
  }

  function sync() {
    const root = document.getElementById(ROOT_ID);
    const container = root?.querySelector('[data-rx-unlocked]');
    if (!root || !container) return;

    const unlocked = REGION_NAMES
      .map(readState)
      .filter(region => region && (region.status === 'Starter' || region.status === 'Unlocked'));

    container.hidden = unlocked.length === 0;
    container.innerHTML = unlocked.map(region => `
      <button type="button" class="rx-unlocked-card ${region.id === root.dataset.selectedRegion ? 'selected' : ''}" data-rx-live-region="${region.id}">
        <span class="rx-region-icon">${region.name.slice(0, 1)}</span>
        <span><strong>${region.name}</strong><small>${region.status}${region.tasks ? ` · ${region.tasks} tasks` : ''}</small></span>
      </button>`).join('');

    container.querySelectorAll('[data-rx-live-region]').forEach(button => {
      button.addEventListener('click', () => {
        const region = unlocked.find(item => item.id === button.dataset.rxLiveRegion);
        if (region) selectRegion(region, root);
      });
    });
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'hidden', 'disabled']
  });

  global.addEventListener('rs3:league-region-selected', () => setTimeout(sync, 0));
  global.addEventListener('rs3:plan-with-region', () => setTimeout(sync, 0));
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync, { once: true });
  } else {
    sync();
  }
})(window);
