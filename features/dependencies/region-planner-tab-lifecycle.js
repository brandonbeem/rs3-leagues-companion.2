/* Keep the enhanced Region Planner scoped to the native Regions tab. */
(function initRegionPlannerTabLifecycle(global) {
  'use strict';

  const ROOT_ID = 'rs3-region-explorer-enhanced';
  const NAV_LABEL = 'Regions';
  const NAV_LABELS = [
    'Dashboard', 'Route Planner', 'Task Tracker', 'Relic Planner', 'Regions',
    'My Build', 'Friends', 'Admin Mode', 'Strategy Center', 'Boss Planner'
  ];

  function text(node) {
    return String(node?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function findRegionHeading() {
    return [...document.querySelectorAll('h1,h2')].find(node => {
      const value = text(node).toLowerCase();
      return value === 'region planner' || value === 'region explorer';
    }) || null;
  }

  function nativeRegionsVisible() {
    const heading = findRegionHeading();
    return Boolean(heading && heading.getClientRects().length && getComputedStyle(heading).visibility !== 'hidden');
  }

  function setPlannerVisible(visible) {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    root.hidden = !visible;
    if (visible) {
      root.style.removeProperty('display');
      root.style.removeProperty('visibility');
      root.style.removeProperty('pointer-events');
    } else {
      root.style.setProperty('display', 'none', 'important');
      root.style.setProperty('visibility', 'hidden', 'important');
      root.style.setProperty('pointer-events', 'none', 'important');
    }
  }

  function syncToNativePage() {
    setPlannerVisible(nativeRegionsVisible());
  }

  document.addEventListener('click', event => {
    const item = event.target.closest('button,a,[role="button"]');
    if (!item) return;
    const label = text(item);
    if (!NAV_LABELS.includes(label)) return;

    // Hide immediately before another page renders. When Regions is selected,
    // wait for the native page to become visible before revealing the planner.
    if (label !== NAV_LABEL) {
      setPlannerVisible(false);
      return;
    }

    setPlannerVisible(false);
    requestAnimationFrame(() => requestAnimationFrame(syncToNativePage));
  }, true);

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      syncToNativePage();
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'hidden', 'style', 'aria-hidden']
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncToNativePage, { once: true });
  } else {
    syncToNativePage();
  }
})(window);
