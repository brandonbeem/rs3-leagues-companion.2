/* Task Tracker enhancements: visible multi-region panel and task difficulty labels. */
(function(){
  const selectedRegions = new Set();
  const difficultyFor = points => ({10:'Easy',30:'Medium',80:'Hard',200:'Elite',400:'Master'}[Number(points)] || 'Special');
  const escHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));
  const CANONICAL_REGIONS = [
    'Anachronia','Asgarnia','Desert','Elven Lands','Fremennik','Global',
    'Havenhythe','Kandarin','Karamja','Misthalin','Morytania','Wilderness'
  ];

  function removeOutdatedTaskSetNotice(){
    const phrases = [
      'Equilibrium League task set',
      'these 1,117 tasks are Equilibrium League task data',
      'Version 15 keeps strategy rules separate'
    ];
    document.querySelectorAll('main div, main section, main aside, [role="main"] div, [role="main"] section, [role="main"] aside').forEach(element => {
      if(element.children.length > 4) return;
      const text = (element.textContent || '').replace(/\s+/g,' ').trim();
      if(text && phrases.some(phrase => text.includes(phrase))) element.remove();
    });
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
      populateRegionPanel();
      enhancedRenderTasks();
    };
    document.getElementById('taskRegionClear').onclick = () => {
      selectedRegions.clear();
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

  function enhancedRenderTasks(){
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

    const body = document.getElementById('taskBody');
    if(!body) return;
    body.innerHTML = filtered.map(task => {
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
    if(count) count.textContent = `Showing all ${filtered.length.toLocaleString()} matching tasks.`;
    body.querySelectorAll('.check').forEach(check => check.onchange = () => setTaskCompleted(check.dataset.id, check.checked, {recalculate:false}));
  }

  function setup(){
    removeOutdatedTaskSetNotice();
    buildFilterLayout();
    const header = document.querySelector('#taskBody')?.closest('table')?.querySelector('thead th:last-child');
    if(header) header.textContent = 'Type';
    ['taskSearch','pointsFilter','statusFilter'].forEach(id => {
      const element = document.getElementById(id);
      if(element) element.addEventListener(id==='taskSearch'?'input':'change', enhancedRenderTasks);
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
