/* Task Tracker enhancements: visible multi-region panel, difficulty labels, and pagination. */
(function(){
  const selectedRegions = new Set();
  const PAGE_SIZE = 100;
  let currentPage = 1;
  const difficultyFor = points => ({10:'Easy',30:'Medium',80:'Hard',200:'Elite',400:'Master'}[Number(points)] || 'Special');
  const escHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));
  const CANONICAL_REGIONS = [
    'Anachronia','Asgarnia','Desert','Elven Lands','Fremennik','Global',
    'Havenhythe','Kandarin','Karamja','Misthalin','Morytania','Wilderness'
  ];

  function removeOutdatedTaskSetNotice(){
    const marker = 'Equilibrium League task set';
    const candidates = [...document.querySelectorAll('div,section,aside,p')]
      .filter(element => (element.textContent || '').includes(marker));
    if(!candidates.length) return;
    candidates.sort((a,b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
    const target = candidates.find(element => {
      const text = (element.textContent || '').replace(/\s+/g,' ').trim();
      return text.length < 500 && text.includes('1,117');
    }) || candidates[0];
    if(target && !target.contains(document.getElementById('taskFilterLayout'))) target.remove();
  }

  function regionNames(){
    const fromTasks = (DATA.tasks || []).map(task => String(task.region || '').trim()).filter(Boolean);
    return [...new Set([...CANONICAL_REGIONS, ...fromTasks])].sort((a,b) => a.localeCompare(b));
  }

  function makeFilterCard(title, element, className){
    const card = document.createElement('section');
    card.className = `task-filter-card ${className}`;
    const label = document.createElement('div');
    label.className = 'task-filter-card-title';
    label.textContent = title;
    card.append(label, element);
    return card;
  }

  function buildFilterLayout(){
    if(document.getElementById('taskFilterLayout')) return;
    const regionSelect = document.getElementById('regionFilter');
    const points = document.getElementById('pointsFilter');
    const status = document.getElementById('statusFilter');
    const search = document.getElementById('taskSearch');
    if(!regionSelect || !points || !status || !search) return;

    regionSelect.hidden = true;
    regionSelect.style.display = 'none';

    const layout = document.createElement('div');
    layout.id = 'taskFilterLayout';
    layout.className = 'task-filter-layout';
    layout.innerHTML = `
      <section class="task-region-panel">
        <div class="task-region-panel-head">
          <div>
            <div class="task-filter-card-title">Regions</div>
            <div id="taskRegionCount" class="task-region-count">All regions selected</div>
          </div>
          <div class="task-region-panel-actions">
            <button type="button" id="taskRegionSelectAll" class="task-filter-mini">Select all</button>
            <button type="button" id="taskRegionClear" class="task-filter-mini">Clear</button>
          </div>
        </div>
        <div id="taskRegionOptions" class="task-region-grid"></div>
      </section>
      <div id="taskFilterSide" class="task-filter-side"></div>
      <div id="taskSearchSlot" class="task-search-slot"></div>`;

    const anchor = regionSelect.parentElement;
    anchor.parentElement.insertBefore(layout, anchor);

    const side = layout.querySelector('#taskFilterSide');
    side.append(makeFilterCard('Points', points, 'task-points-card'));
    side.append(makeFilterCard('Completion', status, 'task-completion-card'));
    layout.querySelector('#taskSearchSlot').append(search);

    anchor.style.display = 'none';
    populateRegionPanel();

    document.getElementById('taskRegionSelectAll').onclick = () => {
      selectedRegions.clear();
      regionNames().forEach(region => selectedRegions.add(region));
      currentPage = 1;
      populateRegionPanel();
      enhancedRenderTasks();
    };
    document.getElementById('taskRegionClear').onclick = () => {
      selectedRegions.clear();
      currentPage = 1;
      populateRegionPanel();
      enhancedRenderTasks();
    };
  }

  function populateRegionPanel(){
    const options = document.getElementById('taskRegionOptions');
    if(!options) return;
    const regions = regionNames();
    const valid = new Set(regions);
    [...selectedRegions].forEach(region => { if(!valid.has(region)) selectedRegions.delete(region); });

    options.innerHTML = regions.map(region => `
      <label class="task-region-checkbox">
        <input type="checkbox" value="${escHtml(region)}" ${selectedRegions.has(region)?'checked':''}>
        <span>${escHtml(region)}</span>
      </label>`).join('');

    options.querySelectorAll('input').forEach(input => input.addEventListener('change', () => {
      input.checked ? selectedRegions.add(input.value) : selectedRegions.delete(input.value);
      currentPage = 1;
      syncRegionCount();
      enhancedRenderTasks();
    }));
    syncRegionCount();
  }

  function syncRegionCount(){
    const count = document.getElementById('taskRegionCount');
    if(!count) return;
    const total = regionNames().length;
    if(selectedRegions.size === 0) count.textContent = 'All regions shown';
    else if(selectedRegions.size === total) count.textContent = 'All regions selected';
    else count.textContent = `${selectedRegions.size} region${selectedRegions.size===1?'':'s'} selected`;
  }

  function ensurePaginationHost(){
    let host = document.getElementById('taskPagination');
    if(host) return host;
    host = document.createElement('nav');
    host.id = 'taskPagination';
    host.className = 'task-pagination';
    host.setAttribute('aria-label','Task pages');
    const count = document.getElementById('taskCount');
    if(count) count.insertAdjacentElement('afterend', host);
    else document.getElementById('taskBody')?.closest('table')?.insertAdjacentElement('afterend',host);
    return host;
  }

  function renderPagination(totalItems){
    const host = ensurePaginationHost();
    if(!host) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    currentPage = Math.min(Math.max(1,currentPage),totalPages);
    if(totalPages <= 1){ host.innerHTML = ''; host.hidden = true; return; }
    host.hidden = false;

    const pageButtons = [];
    for(let page=1; page<=totalPages; page++){
      pageButtons.push(`<button type="button" class="task-page-button${page===currentPage?' active':''}" data-page="${page}" aria-label="Page ${page}" ${page===currentPage?'aria-current="page"':''}>${page}</button>`);
    }
    host.innerHTML = `
      <button type="button" class="task-page-button task-page-nav" data-page="${currentPage-1}" ${currentPage===1?'disabled':''}>‹ Previous</button>
      <div class="task-page-numbers">${pageButtons.join('')}</div>
      <button type="button" class="task-page-button task-page-nav" data-page="${currentPage+1}" ${currentPage===totalPages?'disabled':''}>Next ›</button>`;

    host.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => {
      const nextPage = Number(button.dataset.page);
      if(!Number.isFinite(nextPage) || nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;
      currentPage = nextPage;
      enhancedRenderTasks({scrollToTable:true});
    }));
  }

  function enhancedRenderTasks(options={}){
    removeOutdatedTaskSetNotice();
    const search = (document.getElementById('taskSearch')?.value || '').toLowerCase();
    const points = document.getElementById('pointsFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const done = new Set((state.completed || []).map(Number));
    const filtered = (DATA.tasks || []).filter(task => {
      const text = `${task.task||''} ${task.information||''} ${task.requirements||''} ${task.locality||''} ${task.category||''} ${task.taskType||''} ${task.bossName||''}`.toLowerCase();
      return (!search || text.includes(search)) &&
        (!selectedRegions.size || selectedRegions.has(String(task.region||''))) &&
        (!points || String(task.points) === points) &&
        (!status || (status === 'done') === done.has(Number(task.id)));
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(currentPage,totalPages);
    const startIndex = (currentPage-1)*PAGE_SIZE;
    const pageTasks = filtered.slice(startIndex,startIndex+PAGE_SIZE);

    const body = document.getElementById('taskBody');
    if(!body) return;
    body.innerHTML = pageTasks.map(task => {
      const difficulty = difficultyFor(task.points);
      return `<tr class="${done.has(Number(task.id))?'done':''}">
        <td data-label="Done"><input class="check" aria-label="Mark ${escHtml(task.task)} complete" type="checkbox" data-id="${task.id}" ${done.has(Number(task.id))?'checked':''}></td>
        <td class="task-name" data-label="Task"><b>${escHtml(task.task)}</b><div class="meta">${escHtml(task.information!==task.task?task.information:'')}</div></td>
        <td data-label="Location">${escHtml(task.locality)}</td>
        <td data-label="Requirements">${escHtml(task.requirements)}</td>
        <td class="points" data-label="Points">${Number(task.points)||0}</td>
        <td data-label="Type"><span class="badge task-type task-type-${difficulty.toLowerCase()}">${difficulty}</span></td>
      </tr>`;
    }).join('');

    const count = document.getElementById('taskCount');
    if(count){
      const first = filtered.length ? startIndex+1 : 0;
      const last = Math.min(startIndex+PAGE_SIZE,filtered.length);
      count.textContent = `Showing ${first.toLocaleString()}–${last.toLocaleString()} of ${filtered.length.toLocaleString()} matching tasks.`;
    }
    renderPagination(filtered.length);
    body.querySelectorAll('.check').forEach(check => check.onchange = () => setTaskCompleted(check.dataset.id, check.checked, {recalculate:false}));

    if(options.scrollToTable){
      body.closest('table')?.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }

  function setup(){
    removeOutdatedTaskSetNotice();
    buildFilterLayout();
    const header = document.querySelector('#taskBody')?.closest('table')?.querySelector('thead th:last-child');
    if(header) header.textContent = 'Type';
    ['taskSearch','pointsFilter','statusFilter'].forEach(id => {
      const element = document.getElementById(id);
      if(element) element.addEventListener(id==='taskSearch'?'input':'change', () => {
        currentPage = 1;
        enhancedRenderTasks();
      });
    });
    window.renderTasks = enhancedRenderTasks;
    enhancedRenderTasks();

    const observer = new MutationObserver(() => {
      removeOutdatedTaskSetNotice();
      if(!document.getElementById('taskFilterLayout')) buildFilterLayout();
      const lastHeader = document.querySelector('#taskBody')?.closest('table')?.querySelector('thead th:last-child');
      if(lastHeader && lastHeader.textContent.trim() !== 'Type') lastHeader.textContent = 'Type';
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
