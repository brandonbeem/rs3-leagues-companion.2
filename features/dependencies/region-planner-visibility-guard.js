/* Safety guard for the in-page Region Planner.
 * Prevents legacy-card cleanup from hiding the page container or planner itself.
 */
(function guardRegionPlannerVisibility(global) {
  'use strict';

  const ROOT_ID = 'rs3-region-explorer-enhanced';
  const ACTION_PATTERN = /select region|starter region|claim free region|need region milestone|selected/i;

  function restorePlanner() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    root.hidden = false;
    root.style.removeProperty('display');
    root.style.removeProperty('visibility');
    root.style.removeProperty('opacity');

    let current = root.parentElement;
    let depth = 0;
    while (current && current !== document.body && depth++ < 6) {
      if (current.dataset.rxOriginalRegionCard === 'true') {
        delete current.dataset.rxOriginalRegionCard;
      }
      if (current.hidden) current.hidden = false;
      if (current.style.display === 'none') current.style.removeProperty('display');
      if (current.style.visibility === 'hidden') current.style.removeProperty('visibility');
      current = current.parentElement;
    }
  }

  function findSafeLegacyCard(button, root) {
    let current = button.parentElement;
    let depth = 0;
    while (current && current !== document.body && depth++ < 5) {
      if (current === root || current.contains(root)) return null;
      const rect = current.getBoundingClientRect();
      const text = current.textContent || '';
      const headings = current.querySelectorAll('h2,h3,h4,strong');
      if (headings.length > 0 && text.length > 40 && rect.width > 180 && rect.width < 900 && rect.height > 120 && rect.height < 1400) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function hideOnlyLegacyCards() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    const page = root.closest('main,section,[role="main"]') || root.parentElement;
    if (!page) return;

    const buttons = [...page.querySelectorAll('button')].filter(button =>
      !button.closest(`#${ROOT_ID}`) && ACTION_PATTERN.test(button.textContent || '')
    );

    for (const button of buttons) {
      const card = findSafeLegacyCard(button, root);
      if (!card) continue;
      card.dataset.rxOriginalRegionCard = 'true';
      card.hidden = true;
      card.style.setProperty('display', 'none', 'important');
    }
  }

  let scheduled = false;
  function enforce() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      restorePlanner();
      hideOnlyLegacyCards();
      restorePlanner();
    });
  }

  const observer = new MutationObserver(enforce);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden', 'style', 'class']
  });

  global.addEventListener('rs3:league-region-selected', enforce);
  global.addEventListener('rs3:plan-with-region', enforce);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforce, { once: true });
  } else {
    enforce();
  }
})(window);
