(function initBossPlanner(global){
  'use strict';
  const PAGE_ID='rs3-boss-planner-page';
  const STORAGE_KEY='rs3-boss-planner-progress-v1';
  const BOSSES=[
    {id:'hermod',name:'Hermod',region:'Misthalin',area:'City of Um',arena:'Hermod arena',aliases:['Hermod'],requirements:['City of Um access','Necromancy progression'],notes:'Track first kills, repeated kill-count goals, drops, and achievement tasks linked to Hermod.'},
    {id:'rasial',name:'Rasial',region:'Misthalin',area:'City of Um',arena:'Rasial arena',aliases:['Rasial','The First Necromancer'],requirements:['City of Um progression','Rasial encounter access'],notes:'Endgame Necromancy boss progression and related equipment goals.'},
    {id:'vorkath',name:'Vorkath',region:'Misthalin',area:'Fort Forinthry',arena:'Battle of Forinthry arena',aliases:['Vorkath','Zemouregal'],requirements:['Fort Forinthry progression','Arena access'],notes:'Track encounter access, kill-count milestones, challenge tasks, and unique rewards.'}
  ];

  function norm(value){return String(value||'').replace(/\s+/g,' ').trim();}
  function slug(value){return norm(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
  function loadProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{};}catch{return {};}}
  function saveProgress(progress){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}catch{}}

  function taskCandidates(){
    const selectors=['[data-task-id]','.task-card','.task-row','.task-item','label'];
    const nodes=[...document.querySelectorAll(selectors.join(','))];
    const seen=new Set();
    return nodes.filter(node=>{
      if(node.closest(`#${PAGE_ID}`))return false;
      const text=norm(node.innerText||node.textContent);
      if(text.length<5||text.length>500)return false;
      if(seen.has(text))return false;
      seen.add(text);
      return /task|kill|defeat|complete|obtain|unlock|kc|times?/i.test(text);
    }).map((node,index)=>({
      id:node.dataset.taskId||`dom-${index}-${slug(norm(node.innerText||node.textContent)).slice(0,48)}`,
      text:norm(node.innerText||node.textContent),
      points:(norm(node.innerText||node.textContent).match(/(\d+)\s*(?:pt|points?)/i)||[])[1]||'',
      completed:!!node.querySelector('input[type="checkbox"]:checked')||/completed|done/i.test(node.className),
      source:node
    }));
  }

  function linkedTasks(boss){
    const aliases=boss.aliases.map(v=>v.toLowerCase());
    return taskCandidates().filter(task=>aliases.some(alias=>task.text.toLowerCase().includes(alias)));
  }

  function discoverNavHost(){
    const labels=['Dashboard','Route Planner','Task Tracker','Relic Planner','Regions','Friends'];
    const candidates=[...document.querySelectorAll('nav,aside,[role="navigation"]')];
    return candidates.find(el=>labels.filter(label=>norm(el.textContent).includes(label)).length>=3)||null;
  }

  function currentMain(){
    return document.querySelector('main')||document.querySelector('[role="main"]')||document.body;
  }

  function addNavButton(page){
    const host=discoverNavHost();
    if(!host||host.querySelector('[data-boss-planner-nav]'))return;
    const template=[...host.querySelectorAll('button,a')].find(el=>/Relic Planner|Regions|Task Tracker/i.test(norm(el.textContent)));
    const button=template?template.cloneNode(true):document.createElement('button');
    button.removeAttribute('href');
    button.dataset.bossPlannerNav='true';
    button.textContent='Boss Planner';
    button.addEventListener('click',event=>{
      event.preventDefault();
      showPage(page,button,host);
    });
    host.appendChild(button);
    host.addEventListener('click',event=>{
      const target=event.target.closest('button,a');
      if(target&&target!==button&&!target.closest('[data-boss-planner-nav]'))hidePage(page,button);
    });
  }

  function showPage(page,button,host){
    const main=currentMain();
    [...main.children].forEach(child=>{
      if(child!==page){
        if(!child.dataset.bpPreviousDisplay)child.dataset.bpPreviousDisplay=child.style.display||'__empty__';
        child.style.display='none';
      }
    });
    page.classList.add('active');
    button.classList.add('active');
    host.querySelectorAll('button,a').forEach(el=>{if(el!==button)el.classList.remove('active');});
    global.scrollTo({top:0,behavior:'auto'});
    refresh(page);
  }

  function hidePage(page,button){
    if(!page.classList.contains('active'))return;
    page.classList.remove('active');
    button.classList.remove('active');
    const main=currentMain();
    [...main.children].forEach(child=>{
      if(child===page)return;
      const prior=child.dataset.bpPreviousDisplay;
      if(prior!==undefined){child.style.display=prior==='__empty__'?'':prior;delete child.dataset.bpPreviousDisplay;}
    });
  }

  function statusFor(boss,tasks,progress){
    const complete=tasks.filter(task=>progress[task.id]||task.completed).length;
    if(tasks.length&&complete===tasks.length)return 'Completed';
    if(complete>0)return 'In progress';
    return tasks.length?'Ready':'No linked tasks yet';
  }

  function metric(label,value){return `<div class="bp-metric"><small>${label}</small><strong>${value}</strong></div>`;}

  function renderDetail(page,boss){
    const detail=page.querySelector('[data-bp-detail]');
    const progress=loadProgress();
    const tasks=linkedTasks(boss);
    const done=tasks.filter(task=>progress[task.id]||task.completed).length;
    const status=statusFor(boss,tasks,progress);
    detail.innerHTML=`
      <div><div class="bp-title"><h2>${boss.name}</h2><span class="bp-badge">${status}</span></div><p>${boss.region} · ${boss.area} · ${boss.arena}</p></div>
      <div class="bp-metrics">${metric('Linked tasks',tasks.length)}${metric('Completed',done)}${metric('Remaining',Math.max(0,tasks.length-done))}${metric('Progress',tasks.length?Math.round(done/tasks.length*100)+'%':'—')}</div>
      <section class="bp-section"><small>ACCESS REQUIREMENTS</small><p>${boss.requirements.join(' · ')}</p></section>
      <section class="bp-section"><small>PLANNING NOTES</small><p>${boss.notes}</p></section>
      <section class="bp-section"><small>RELATED LEAGUE TASKS</small>
        <div class="bp-task-list">${tasks.length?tasks.map(task=>`<label class="bp-task"><input type="checkbox" data-bp-task="${task.id}" ${progress[task.id]||task.completed?'checked':''}><span>${task.text}</span><small>${task.points?task.points+' pt':''}</small></label>`).join(''):'<p class="bp-empty">No matching tasks are currently visible in the loaded Task Tracker. Open Task Tracker once, then return here to refresh linked tasks.</p>'}</div>
      </section>
      <div class="bp-actions"><button type="button" data-bp-refresh>Refresh linked tasks</button><button type="button" data-bp-open-tasks>Open Task Tracker for ${boss.name}</button></div>`;
    detail.querySelectorAll('[data-bp-task]').forEach(box=>box.addEventListener('change',()=>{
      const next=loadProgress();next[box.dataset.bpTask]=box.checked;saveProgress(next);renderDetail(page,boss);renderList(page);
    }));
    detail.querySelector('[data-bp-refresh]').addEventListener('click',()=>{renderDetail(page,boss);renderList(page);});
    detail.querySelector('[data-bp-open-tasks]').addEventListener('click',()=>{
      global.dispatchEvent(new CustomEvent('rs3:boss-task-filter',{detail:{bossId:boss.id,bossName:boss.name,aliases:boss.aliases}}));
      const nav=[...document.querySelectorAll('button,a')].find(el=>norm(el.textContent)==='Task Tracker');
      if(nav)nav.click();
    });
  }

  function filteredBosses(page){
    const query=page.querySelector('[data-bp-search]').value.toLowerCase().trim();
    const region=page.querySelector('[data-bp-region]').value;
    const status=page.querySelector('[data-bp-status]').value;
    const progress=loadProgress();
    return BOSSES.filter(boss=>{
      const tasks=linkedTasks(boss);
      const bossStatus=statusFor(boss,tasks,progress);
      const hay=[boss.name,boss.region,boss.area,boss.arena,boss.aliases.join(' ')].join(' ').toLowerCase();
      return(!query||hay.includes(query))&&(region==='all'||boss.region===region)&&(status==='all'||bossStatus===status);
    });
  }

  function renderList(page){
    const list=page.querySelector('[data-bp-list]');
    const bosses=filteredBosses(page);
    const progress=loadProgress();
    page.querySelector('[data-bp-count]').textContent=`${bosses.length} shown`;
    list.innerHTML=bosses.map(boss=>{
      const tasks=linkedTasks(boss);const done=tasks.filter(t=>progress[t.id]||t.completed).length;
      return `<button class="bp-row ${page.dataset.selectedBoss===boss.id?'selected':''}" data-bp-boss="${boss.id}"><span class="bp-icon">${boss.name[0]}</span><span><strong>${boss.name}</strong><small>${boss.region} · ${done}/${tasks.length} tasks</small></span><span class="bp-radio"></span></button>`;
    }).join('')||'<p class="bp-empty">No bosses match those filters.</p>';
    list.querySelectorAll('[data-bp-boss]').forEach(button=>button.addEventListener('click',()=>{
      const boss=BOSSES.find(item=>item.id===button.dataset.bpBoss);if(!boss)return;
      page.dataset.selectedBoss=boss.id;renderList(page);renderDetail(page,boss);
    }));
  }

  function refresh(page){
    renderList(page);
    const boss=BOSSES.find(item=>item.id===page.dataset.selectedBoss)||BOSSES[0];
    page.dataset.selectedBoss=boss.id;renderDetail(page,boss);
  }

  function mount(){
    if(document.getElementById(PAGE_ID))return true;
    const main=currentMain();if(!main)return false;
    const page=document.createElement('section');
    page.id=PAGE_ID;page.dataset.selectedBoss=BOSSES[0].id;
    page.innerHTML=`<header class="bp-heading"><h1>Boss Planner</h1><p>Compare boss access, progression, arenas, and every League task connected to each encounter.</p></header>
      <div class="bp-toolbar"><label><span>Search bosses</span><input data-bp-search type="search" placeholder="Search bosses, arenas, or regions..."></label><label><span>Region</span><select data-bp-region><option value="all">All regions</option><option>Misthalin</option></select></label><label><span>Status</span><select data-bp-status><option value="all">All statuses</option><option>Ready</option><option>In progress</option><option>Completed</option><option>No linked tasks yet</option></select></label></div>
      <div class="bp-layout"><aside class="bp-list-panel"><div class="bp-list-head"><strong>Bosses</strong><small data-bp-count></small></div><div class="bp-list" data-bp-list></div></aside><article class="bp-detail" data-bp-detail></article></div>`;
    main.appendChild(page);
    page.querySelector('[data-bp-search]').addEventListener('input',()=>renderList(page));
    page.querySelector('[data-bp-region]').addEventListener('change',()=>renderList(page));
    page.querySelector('[data-bp-status]').addEventListener('change',()=>renderList(page));
    addNavButton(page);refresh(page);return true;
  }

  let tries=0;const timer=setInterval(()=>{if(mount()||tries++>100)clearInterval(timer);},200);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})(window);