/* Prevent Task Tracker rerenders from jumping the document back to the top. */
(function initTaskTrackerScrollGuard(global) {
  'use strict';

  const TRACKER_TITLES = ['task tracker'];
  let lastScrollY = 0;
  let restorePending = false;
  let trackerVisible = false;

  function findTrackerHeading() {
    return [...document.querySelectorAll('h1,h2')].find(element =>
      TRACKER_TITLES.includes((element.textContent || '').trim().toLowerCase())
    ) || null;
  }

  function updateTrackerState() {
    const heading = findTrackerHeading();
    trackerVisible = Boolean(heading && heading.getClientRects().length);
    return trackerVisible;
  }

  function rememberPosition() {
    if (!updateTrackerState()) return;
    lastScrollY = global.scrollY || document.documentElement.scrollTop || 0;
  }

  function restorePosition() {
    if (!trackerVisible || restorePending || lastScrollY <= 0) return;
    restorePending = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restorePending = false;
        if (!updateTrackerState()) return;
        const current = global.scrollY || document.documentElement.scrollTop || 0;
        if (current < lastScrollY - 40) {
          global.scrollTo({ top: lastScrollY, left: 0, behavior: 'auto' });
        }
      });
    });
  }

  global.addEventListener('scroll', rememberPosition, { passive: true });
  global.addEventListener('wheel', rememberPosition, { passive: true });
  global.addEventListener('touchmove', rememberPosition, { passive: true });

  const observer = new MutationObserver(() => {
    const wasVisible = trackerVisible;
    updateTrackerState();
    if (wasVisible && trackerVisible) restorePosition();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'hidden', 'style']
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateTrackerState, { once: true });
  } else {
    updateTrackerState();
  }
})(window);
