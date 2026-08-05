/* Keep the enhanced Region Planner scoped to the Regions sidebar tab. */
(function initRegionPlannerTabLifecycle(global) {
  'use strict';

  const ROOT_ID = 'rs3-region-explorer-enhanced';
  const REGION_LABEL = 'Regions';
  const APP_TAB_LABELS = new Set([
    'Dashboard', 'Route Planner', 'Task Tracker', 'Relic Planner', 'Regions',
    'My Build', 'Friends', 'Admin Mode', 'Strategy Center', 'Boss Planner'
  ]);

  let regionsSelected = false;

  function text(node) {
    return String(node?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function findTab(label) {
    return [...document.querySelectorAll('button,a,[role="button"]')]
      .find(node => text(node) === label) || null;
  }

  function tabLooksActive(node) {
    if (!node) return false;
    return node.classList.contains('active')
      || node.getAttribute('aria-current') === 'page'
      || node.getAttribute('aria-selected') === 'true'
      || /active|selected|current/i.test(node.className || '');
  }

  function setPlannerVisible(visible) {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

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
    return true;
  }

  function applySelectedState() {
    setPlannerVisible(regionsSelected);
  }

  document.addEventListener('click', event => {
    const item = event.target.closest('button,a,[role="button"]');
    if (!item) return;

    const label = text(item);
    if (!APP_TAB_LABELS.has(label)) return;

    regionsSelected = label === REGION_LABEL;

    // Allow the app's own tab handler to finish first. This code changes only
    // the injected planner's visibility and never scrolls or hides other pages.
    requestAnimationFrame(() => requestAnimationFrame(applySelectedState));
  }, true);

  function initialise() {
    regionsSelected = tabLooksActive(findTab(REGION_LABEL));

    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (setPlannerVisible(regionsSelected) || attempts > 100) {
        global.clearInterval(timer);
      }
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})(window);
