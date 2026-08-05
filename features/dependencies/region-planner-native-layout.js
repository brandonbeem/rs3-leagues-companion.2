/* Layout-only cleanup for the native Region Planner. */
(function initRegionPlannerNativeLayout(global) {
  'use strict';

  const ROOT_ID = 'rs3-region-explorer-enhanced';
  const LEGACY_NAMES = new Set(['elven lands', 'anachronia']);

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function findLegacyCard(heading, root) {
    let node = heading?.parentElement || null;
    while (node && node !== document.body) {
      if (node === root || node.contains(root)) return null;
      const button = [...node.querySelectorAll('button')].find(item =>
        /select region|need region milestone|claim free region|starter region/i.test(clean(item.textContent))
      );
      if (button && clean(node.textContent).length > 35) return node;
      node = node.parentElement;
    }
    return null;
  }

  function applyLayout() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

    root.style.setProperty('grid-column', '1 / -1', 'important');
    root.style.setProperty('width', '100%', 'important');
    root.style.setProperty('max-width', 'none', 'important');
    root.style.setProperty('min-width', '0', 'important');

    const host = root.parentElement;
    if (host) {
      host.dataset.rxNativeHost = 'true';
      host.style.setProperty('width', '100%', 'important');
      host.style.setProperty('max-width', 'none', 'important');
      host.style.setProperty('min-width', '0', 'important');
    }

    [...document.querySelectorAll('h2,h3,h4,strong')].forEach(heading => {
      if (!LEGACY_NAMES.has(clean(heading.textContent).toLowerCase())) return;
      const card = findLegacyCard(heading, root);
      if (!card) return;
      card.hidden = true;
      card.style.setProperty('display', 'none', 'important');
    });

    return true;
  }

  function retry() {
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (applyLayout() || attempts > 30) global.clearInterval(timer);
    }, 100);
  }

  document.addEventListener('click', event => {
    const tab = event.target.closest('button,a,[role="button"]');
    if (tab && clean(tab.textContent) === 'Regions') setTimeout(retry, 0);
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', retry, { once: true });
  } else {
    retry();
  }
})(window);
