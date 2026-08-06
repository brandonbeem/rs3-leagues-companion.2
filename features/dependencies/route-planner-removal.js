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
      element.id,
      element.className
    ].filter(Boolean).join(' ').toLowerCase();
    return text === 'route planner' || /(^|[#\s_-])(optimizer|route[-_ ]?planner)($|[\s_-])/.test(target);
  }

  function hideRoutePlanner(){
    ROUTE_SECTION_IDS.forEach(id => {
      const section = document.getElementById(id);
      if (section) {
        section.hidden = true;
        section.classList.remove('active');
        section.setAttribute('aria-hidden', 'true');
      }
    });

    document.querySelectorAll('a, button, [role="button"], .nav-item, .sidebar-item').forEach(element => {
      if (isRouteControl(element)) {
        element.hidden = true;
        element.style.display = 'none';
        element.setAttribute('aria-hidden', 'true');
        element.setAttribute('tabindex', '-1');
      }
    });

    const routeActive = ROUTE_SECTION_IDS.some(id => document.getElementById(id)?.classList.contains('active'));
    if (routeActive) {
      const dashboardControl = [...document.querySelectorAll('a, button, [role="button"], .nav-item, .sidebar-item')]
        .find(element => (element.textContent || '').trim().toLowerCase() === 'dashboard');
      dashboardControl?.click();
    }
  }

  function setup(){
    hideRoutePlanner();
    const observer = new MutationObserver(hideRoutePlanner);
    observer.observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class','style','hidden']});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
