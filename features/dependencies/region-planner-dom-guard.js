/* Prevent the legacy-card cleanup observer from mistaking the new Region Planner
 * rows and detail headings for source cards. The zero-width suffix is invisible
 * but makes exact legacy heading matches impossible inside the enhanced planner.
 */
(function guardRegionPlannerDom() {
  'use strict';

  const ROOT_ID = 'rs3-region-explorer-enhanced';
  const REGION_NAMES = new Set([
    'misthalin', 'havenhythe', 'asgarnia', 'wilderness', 'kandarin',
    'morytania', 'karamja', 'desert', 'fremennik', 'tirannwn',
    'elven lands', 'anachronia'
  ]);
  const INVISIBLE_SUFFIX = '\u200b';

  function protectPlanner(root) {
    if (!root) return;

    root.hidden = false;
    root.style.removeProperty('display');

    root.querySelectorAll('h2,h3,h4,strong').forEach(element => {
      const text = element.textContent.replace(/\u200b/g, '').trim();
      if (!REGION_NAMES.has(text.toLowerCase())) return;
      if (!element.textContent.endsWith(INVISIBLE_SUFFIX)) {
        element.textContent = text + INVISIBLE_SUFFIX;
      }
    });

    root.querySelectorAll('[hidden]').forEach(element => {
      if (element.matches('[data-rx-unlocked]') && !element.children.length) return;
      element.hidden = false;
    });
  }

  function start() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

    protectPlanner(root);
    const observer = new MutationObserver(() => protectPlanner(root));
    observer.observe(root, { childList: true, subtree: true });
    return true;
  }

  if (!start()) {
    const pageObserver = new MutationObserver(() => {
      if (start()) pageObserver.disconnect();
    });
    pageObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
