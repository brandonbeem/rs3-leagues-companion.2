/* Temporarily removes the Route Planner from the production UI.
 * The underlying task and location data remain in the repository for possible future use.
 */
(function(){
  const ROUTE_SECTION_IDS = ['optimizer', 'routePlanner', 'route-planner'];

  function isRouteControl(element){
    if (!(element instanceof HTMLElement)) return false;
    const text = (element.textContent || '').trim().toLowerCase();
    const target = [
      element.getAttribute('data-tab'),
      element.getAttribute('data-target'),
      element.getAttribute('data-section'),
      element.getAttribute('href'),
      element.id
    ].filter(Boolean).join(' ').toLowerCase();
    return text === 'route planner' || /(^|[#\s_-])(optimizer|route[-_ ]?planner)($|[\s_-])/.test(target);
  }

  function hideElement(element){
    if (!element || element.dataset.routePlannerRemoved === 'true') return;
    element.dataset.routePlannerRemoved = 'true';
    element.hidden = true;
    element.style.display = 'none';
    element.setAttribute('aria-hidden', 'true');
    element.setAttribute('tabindex', '-1');
  }

  function hideRoutePlanner(){
    const routeWasActive = ROUTE_SECTION_IDS.some(id => document.getElementById(id)?.classList.contains('active'));

    ROUTE_SECTION_IDS.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;
      section.classList.remove('active');
      hideElement(section);
    });

    document.querySelectorAll('a, button, [role="button"], .nav-item, .sidebar-item').forEach(element => {
      if (isRouteControl(element)) hideElement(element);
    });

    if (routeWasActive) {
      const dashboardControl = [...document.querySelectorAll('a, button, [role="button"], .nav-item, .sidebar-item')]
        .find(element => (element.textContent || '').trim().toLowerCase() === 'dashboard' && !element.hidden);
      dashboardControl?.click();
    }
  }

  function setup(){
    hideRoutePlanner();
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        hideRoutePlanner();
      });
    });
    observer.observe(document.body, {subtree:true, childList:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, {once:true});
  else setup();
})();
