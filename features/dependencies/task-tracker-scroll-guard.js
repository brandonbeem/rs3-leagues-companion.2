/* Prevent Task Tracker rerenders from jumping the document back to the top. */
(function initTaskTrackerScrollGuard(global) {
  'use strict';

  const TRACKER_TITLES = ['task tracker'];
  const JUMP_THRESHOLD = 80;
  const MUTATION_WINDOW_MS = 300;

  let stableScrollY = 0;
  let trackerVisible = false;
  let restorePending = false;
  let lastMutationAt = 0;
  let restoring = false;

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

  function currentScrollY() {
    return global.scrollY || document.documentElement.scrollTop || 0;
  }

  function restorePosition(expectedY) {
    if (!trackerVisible || restorePending || expectedY <= 0) return;
    restorePending = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restorePending = false;
        if (!updateTrackerState()) return;

        const current = currentScrollY();
        if (current < expectedY - JUMP_THRESHOLD) {
          restoring = true;
          global.scrollTo({ top: expectedY, left: 0, behavior: 'auto' });
          requestAnimationFrame(() => {
            stableScrollY = expectedY;
            restoring = false;
          });
        }
      });
    });
  }

  function handleScroll() {
    if (!updateTrackerState() || restoring) return;

    const current = currentScrollY();
    const recentlyMutated = Date.now() - lastMutationAt <= MUTATION_WINDOW_MS;
    const looksLikeRerenderJump = recentlyMutated && current < stableScrollY - JUMP_THRESHOLD;

    if (looksLikeRerenderJump) {
      restorePosition(stableScrollY);
      return;
    }

    stableScrollY = current;
  }

  function rememberBeforeUserScroll() {
    if (!updateTrackerState()) return;
    const current = currentScrollY();
    if (current > stableScrollY - JUMP_THRESHOLD) stableScrollY = current;
  }

  global.addEventListener('scroll', handleScroll, { passive: true });
  global.addEventListener('wheel', rememberBeforeUserScroll, { passive: true });
  global.addEventListener('touchmove', rememberBeforeUserScroll, { passive: true });
  global.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
      rememberBeforeUserScroll();
    }
  }, { passive: true });

  const observer = new MutationObserver(() => {
    const wasVisible = trackerVisible;
    updateTrackerState();
    if (!wasVisible || !trackerVisible) return;

    lastMutationAt = Date.now();
    const expectedY = stableScrollY;
    restorePosition(expectedY);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'hidden', 'style']
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateTrackerState();
      stableScrollY = currentScrollY();
    }, { once: true });
  } else {
    updateTrackerState();
    stableScrollY = currentScrollY();
  }
})(window);
