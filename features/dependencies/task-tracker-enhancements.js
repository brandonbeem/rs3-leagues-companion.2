/* Task Tracker enhancements: multi-region filtering and task difficulty labels. */
(function(){
  const selectedRegions = new Set();
  const difficultyFor = points => ({10:'Easy',30:'Medium',80:'Hard',200:'Elite',400:'Master'}[Number(points)] || 'Special');
  const escHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function regionNames(){
    return [...new Set((DATA.tasks || []).map(task => String(task.region || '').trim()).filter(Boolean))]
      .sort((a,b) => a.localeCompare(b));
  }

  function buildRegionPicker(){
    const select = document.getElementById('regionFilter');
    if(!select || document.getElementById('taskRegionMulti')) return;
    select.hidden = true;
    select.style.display = 'none';

    const wrap = document.createElement('details');
    wrap.id = 'taskRegionMulti';
    wrap.className = 'task-region-multi';
    wrap.innerHTML = `
      <summary><span id="taskRegionSummary">All regions</span><span class="task-region-caret">▾</span></summary>
      <div class="task-region-menu">
        <label class="task-region-option task-region-all"><input type="checkbox" id="taskRegionAll" checked> <span>All regions</span></label>
        <div id="taskRegionOptions"></div>
      </div>`;
    select.insertAdjacentElement('afterend', wrap);
    populateRegionPicker();
  }

  function populateRegionPicker(){
    const options = document.getElementById('taskRegionOptions');
    if(!options) return;
    const valid = new Set(regionNames());
    [...selectedRegions].forEach(region => { if(!valid.has(region)) selectedRegions.delete(region); });
    options.innerHTML = regionNames().map(region => `
      <label class="task-region-option"><input type="checkbox" value="${escHtml(region)}" ${selectedRegions.has(region)?'checked':''}> <span>${escHtml(region)}</span></label>`).join('');
    options.querySelectorAll('input').forEach(input => input.addEventListener('change', () => {
      input.checked ? selectedRegions.add(input.value) : selectedRegions.delete(input.value);
      syncRegionPicker();
      enhancedRenderTasks();
    }));
    const all = document.getElementById('taskRegionAll');
    if(all) all.onchange = () => {
      if(all.checked) selectedRegions.clear();
      populateRegionPicker();
      syncRegionPicker();
      enhancedRenderTasks();
    };
    syncRegionPicker();
  }

  function syncRegionPicker(){
    const all = document.getElementById('taskRegionAll');
    const summary = document.getElementById('taskRegionSummary');
    if(all) all.checked = selectedRegions.size === 0;
    if(summary){
      if(selectedRegions.size === 0) summary.textContent = 'All regions';
      else if(selectedRegions.size === 1) summary.textContent = [...selectedRegions][0];
      else summary.textContent = `${selectedRegions.size} regions selected`;
    }
  }

  function enhancedRenderTasks(){
    const search = (document.getElementById('taskSearch')?.value || '').toLowerCase();
    const points = document.getElementById('pointsFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const done = new Set((state.completed || []).map(Number));
    const filtered = (DATA.tasks || []).filter(task => {
      const text = `${task.task||''} ${task.information||''} ${task.requirements||''} ${task.locality||''}`.toLowerCase();
      return (!search || text.includes(search)) &&
        (!selectedRegions.size || selectedRegions.has(String(task.region||''))) &&
        (!points || String(task.points) === points) &&
        (!status || (status === 'done') === done.has(Number(task.id)));
    });

    const body = document.getElementById('taskBody');
    if(!body) return;
    body.innerHTML = filtered.slice(0,500).map(task => {
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
    if(count) count.textContent = `Showing ${Math.min(filtered.length,500).toLocaleString()} of ${filtered.length.toLocaleString()} matching tasks${filtered.length>500?' (refine filters to see more)':''}.`;
    body.querySelectorAll('.check').forEach(check => check.onchange = () => setTaskCompleted(check.dataset.id, check.checked, {recalculate:false}));
  }

  function setup(){
    buildRegionPicker();
    const header = document.querySelector('#taskBody')?.closest('table')?.querySelector('thead th:last-child');
    if(header) header.textContent = 'Type';
    ['taskSearch','pointsFilter','statusFilter'].forEach(id => {
      const element = document.getElementById(id);
      if(element) element.addEventListener(id==='taskSearch'?'input':'change', enhancedRenderTasks);
    });
    window.renderTasks = enhancedRenderTasks;
    enhancedRenderTasks();

    const observer = new MutationObserver(() => {
      if(!document.getElementById('taskRegionMulti')) buildRegionPicker();
      const lastHeader = document.querySelector('#taskBody')?.closest('table')?.querySelector('thead th:last-child');
      if(lastHeader && lastHeader.textContent.trim() !== 'Type') lastHeader.textContent = 'Type';
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
