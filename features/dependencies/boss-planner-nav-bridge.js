(function initBossPlannerNavBridge(global) {
  'use strict';

  const PAGE_ID = 'rs3-boss-planner-page';
  const NAV_ATTR = 'data-boss-planner-nav-bridge';

  function text(node) {
    return String(node?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function findExistingNavItem(label) {
    return [...document.querySelectorAll('button,a,[role="button"]')]
      .find(node => text(node) === label) || null;
  }

  function findSidebarHost() {
    const tracker = findExistingNavItem('Task Tracker');
    if (!tracker) return null;
    let current = tracker.parentElement;
    while (current && current !== document.body) {
      const labels = ['Dashboard', 'Route Planner', 'Task Tracker', 'Relic Planner', 'Regions', 'Friends'];
      const matches = labels.filter(label => text(current).includes(label)).length;
      if (matches >= 4) return current;
      current = current.parentElement;
    }
    return tracker.parentElement;
  }

  function findContentHost(page) {
    return page.parentElement || document.querySelector('main,[role="main"]') || document.body;
  }

  function hideBossPage(page, button) {
    if (!page.classList.contains('active')) return;
    page.classList.remove('active');
    page.style.display = 'none';
    button?.classList.remove('active');

    const host = findContentHost(page);
    [...host.children].forEach(child => {
      if (child === page) return;
      if (child.dataset.bpBridgeDisplay !== undefined) {
        child.style.display = child.dataset.bpBridgeDisplay === '__empty__'
          ? ''
          : child.dataset.bpBridgeDisplay;
        delete child.dataset.bpBridgeDisplay;
      }
    });
  }

  function showBossPage(page, button, sidebar) {
    const host = findContentHost(page);
    [...host.children].forEach(child => {
      if (child === page) return;
      if (child.dataset.bpBridgeDisplay === undefined) {
        child.dataset.bpBridgeDisplay = child.style.display || '__empty__';
      }
      child.style.display = 'none';
    });

    page.style.display = 'block';
    page.classList.add('active');
    button.classList.add('active');
    sidebar.querySelectorAll('button,a,[role="button"]').forEach(item => {
      if (item !== button) item.classList.remove('active');
    });
  }

  function mount() {
    const page = document.getElementById(PAGE_ID);
    const sidebar = findSidebarHost();
    if (!page || !sidebar) return false;

    page.style.display = page.classList.contains('active') ? 'block' : 'none';

    let button = sidebar.querySelector(`[${NAV_ATTR}]`);
    if (!button) {
      const template = findExistingNavItem('Regions')
        || findExistingNavItem('Relic Planner')
        || findExistingNavItem('Task Tracker');
      button = template ? template.cloneNode(true) : document.createElement('button');
      button.removeAttribute('href');
      button.setAttribute(NAV_ATTR, 'true');
      button.textContent = 'Boss Planner';

      const insertAfter = findExistingNavItem('Regions') || findExistingNavItem('Relic Planner');
      if (insertAfter?.parentElement === sidebar) {
        insertAfter.insertAdjacentElement('afterend', button);
      } else {
        sidebar.appendChild(button);
      }
    }

    if (button.dataset.bpBridgeBound !== 'true') {
      button.dataset.bpBridgeBound = 'true';
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        showBossPage(page, button, sidebar);
      });
    }

    if (sidebar.dataset.bpBridgeBound !== 'true') {
      sidebar.dataset.bpBridgeBound = 'true';
      sidebar.addEventListener('click', event => {
        const clicked = event.target.closest('button,a,[role="button"]');
        if (!clicked || clicked === button || clicked.hasAttribute(NAV_ATTR)) return;
        hideBossPage(page, button);
      });
    }

    return true;
  }

  let attempts = 0;
  const timer = global.setInterval(() => {
    if (mount() || attempts++ > 150) global.clearInterval(timer);
  }, 200);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})(window);
