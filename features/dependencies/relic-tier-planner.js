/* Equilibrium Relic Tiers UI.
 * Uses the official unlock-tier grouping while preserving existing relic detail data.
 * One relic may be selected per tier. Detailed effect text is never invented for
 * newly revealed relics that are not yet in the companion's reference data.
 */
(()=>{
  const STORAGE_KEY='rs3-leagues-equilibrium-tier-relics-v1';
  const TIERS=[
    {tier:1,names:['Endless Harvest','Survivalist','Golden Touch']},
    {tier:2,names:['Animal Wrangler','Superheated','Divine Druid']},
    {tier:3,names:["Nature's Network","Assassin's Insight",'Voidwalker']},
    {tier:4,names:['Crystal Grace','Transmutation','Antiquarian']},
    {tier:5,names:['Clue Connoisseur','Production Master','Devout']},
    {tier:6,names:['Perkfection','Rejuvenated']},
    {tier:7,names:['Infernal Fire','Naragi Edict','Icyenic Faith']}
  ];
  const OFFICIAL_NAMES=new Set(TIERS.flatMap(group=>group.names));
  const FALLBACKS={
    'Antiquarian':{category:'Details pending'},
    'Clue Connoisseur':{category:'Details pending'},
    'Production Master':{category:'Details pending'},
    'Infernal Fire':{category:'Details pending'},
    'Naragi Edict':{category:'Details pending'}
  };
  let activeRelic=null;
  let installTimer=null;

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const asArray=value=>Array.isArray(value)?value.filter(Boolean):String(value||'').split(',').map(v=>v.trim()).filter(Boolean);

  function tierFor(name){
    return TIERS.find(group=>group.names.includes(name))?.tier||null;
  }

  function loadSelections(){
    try{
      const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      const clean={};
      for(const group of TIERS){
        const name=parsed[group.tier];
        if(group.names.includes(name))clean[group.tier]=name;
      }
      return clean;
    }catch{return {};}
  }

  function saveSelections(value){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(value));}catch{}
  }

  function addRecords(map,records){
    if(!Array.isArray(records))return;
    for(const raw of records){
      if(!raw||typeof raw!=='object'||!raw.name||!OFFICIAL_NAMES.has(String(raw.name)))continue;
      const name=String(raw.name);
      map.set(name,{...(map.get(name)||{}),...raw,name});
    }
  }

  function collectRelics(){
    const map=new Map();
    try{addRecords(map,globalThis.CONST?.relics);}catch{}
    try{addRecords(map,globalThis.DATA?.relics);}catch{}
    try{addRecords(map,globalThis.RS3_EXTRA_RELICS);}catch{}
    try{addRecords(map,Object.values(globalThis.RELIC_SUMMARY_PATCH||{}));}catch{}
    try{
      const knowledge=globalThis.RELIC_KNOWLEDGE||{};
      for(const [name,info] of Object.entries(knowledge)){
        if(!OFFICIAL_NAMES.has(name))continue;
        map.set(name,{...(map.get(name)||{}),...info,name});
      }
    }catch{}
    if(map.size<15){
      const seen=new Set();
      for(const key of Object.getOwnPropertyNames(globalThis)){
        let value;
        try{value=globalThis[key];}catch{continue;}
        if(Array.isArray(value)&&!seen.has(value)){seen.add(value);addRecords(map,value);}
        if(value&&typeof value==='object'&&!Array.isArray(value)){
          for(const childKey of Object.keys(value).slice(0,80)){
            let child;
            try{child=value[childKey];}catch{continue;}
            if(Array.isArray(child)&&!seen.has(child)){seen.add(child);addRecords(map,child);}
          }
        }
      }
    }
    for(const group of TIERS){
      for(const name of group.names){
        const existing=map.get(name)||{};
        map.set(name,{...FALLBACKS[name],...existing,name,tier:group.tier,tierStatus:'revealed'});
      }
    }
    return map;
  }

  function iconFor(relic){
    const icon=relic.icon||relic.artwork||relic.image||'';
    if(icon)return `<img src="${esc(icon)}" alt="" loading="lazy">`;
    const initials=relic.name.split(/\s+/).map(word=>word[0]).join('').slice(0,2).toUpperCase();
    return `<span class="relic-tier-icon-fallback" aria-hidden="true">${esc(initials||'✦')}</span>`;
  }

  function findPlanner(){
    const heading=[...document.querySelectorAll('h1,h2,h3')].find(el=>/relic\s+(build\s+)?planner/i.test((el.textContent||'').trim()));
    const list=document.querySelector('.relic-list-panel');
    if(!heading||!list)return null;
    let page=heading.parentElement;
    for(let i=0;i<6&&page&&!page.contains(list);i++)page=page.parentElement;
    if(!page||page===document.body||page===document.documentElement)return null;
    return {heading,list,page,legacyGrid:list.parentElement};
  }

  function hideLegacy(planner){
    if(planner.legacyGrid){planner.legacyGrid.dataset.relicTierLegacy='true';planner.legacyGrid.hidden=true;}
    const summary=planner.page.querySelector('#relicPlannerSummary');
    if(summary){summary.dataset.relicTierLegacy='true';summary.hidden=true;}
    const search=[...planner.page.querySelectorAll('input')].find(input=>/search relic/i.test(input.placeholder||''));
    if(search){
      let row=search.parentElement;
      for(let i=0;i<3&&row;i++){
        if(row.querySelectorAll('select').length>=1)break;
        row=row.parentElement;
      }
      if(row&&row!==planner.page){row.dataset.relicTierLegacy='true';row.hidden=true;}
    }
  }

  function chosenSummary(){
    const selected=loadSelections();
    const chosen=Object.keys(selected).length;
    const chips=TIERS.map(group=>{
      const name=selected[group.tier];
      return `<span class="relic-tier-choice${name?' chosen':''}"><b>T${group.tier}</b>${name?esc(name):'Open'}</span>`;
    }).join('');
    return `<div class="relic-tier-summary-copy"><strong>${chosen} / 7 tiers chosen</strong><span>Choose one relic from each Equilibrium unlock tier.</span></div><div class="relic-tier-choice-strip">${chips}</div>`;
  }

  function cardMarkup(relic,tier,selected){
    const isSelected=selected[tier]===relic.name;
    const category=relic.category||'Relic';
    return `<button type="button" class="relic-tier-card${isSelected?' selected':''}" data-tier-relic="${esc(relic.name)}" data-tier="${tier}" aria-pressed="${isSelected?'true':'false'}">
      <span class="relic-tier-card-icon">${iconFor(relic)}</span>
      <span class="relic-tier-card-copy"><strong>${esc(relic.name)}</strong><small>${esc(category)}</small></span>
      ${isSelected?'<span class="relic-tier-selected-badge">Selected ✓</span>':''}
    </button>`;
  }

  function renderBoard(root,relics){
    const selected=loadSelections();
    root.innerHTML=`
      <section class="relic-tier-intro">
        <div><span class="relic-tier-kicker">EQUILIBRIUM LEAGUE</span><h2>Relic Tiers</h2><p>Choose one relic from each tier as you progress through the league. Tiers show unlock order, not a power ranking.</p></div>
      </section>
      <section class="relic-tier-summary" data-tier-summary>${chosenSummary()}</section>
      <div class="relic-tier-board">
        ${TIERS.map(group=>`<section class="relic-tier-row" data-tier-row="${group.tier}">
          <div class="relic-tier-row-head"><span class="relic-tier-badge">Tier ${group.tier}</span><span>Choose 1 relic</span></div>
          <div class="relic-tier-cards">${group.names.map(name=>cardMarkup(relics.get(name),group.tier,selected)).join('')}</div>
        </section>`).join('')}
      </div>
      <div class="relic-tier-backdrop" data-tier-close hidden></div>
      <aside class="relic-tier-drawer" data-tier-drawer aria-hidden="true" aria-label="Relic details"></aside>`;
    wireBoard(root,relics);
  }

  function legacyAction(name,selector){
    return [...document.querySelectorAll(selector)].find(action=>{
      let node=action;
      for(let i=0;i<5&&node;i++,node=node.parentElement){
        if((node.innerText||'').includes(name))return true;
      }
      return false;
    })||null;
  }

  function isLegacySelected(action){
    if(!action)return false;
    return action.getAttribute('aria-pressed')==='true'||action.dataset.selected==='true'||action.classList.contains('selected')||/remove/i.test(action.textContent||'');
  }

  function syncLegacyChoice(oldName,newName){
    const selector='[data-relic-quick-toggle],[data-relic-toggle]';
    try{
      if(oldName&&oldName!==newName){
        const oldAction=legacyAction(oldName,selector);
        if(oldAction&&isLegacySelected(oldAction))oldAction.click();
      }
      const newAction=legacyAction(newName,selector);
      if(newAction&&!isLegacySelected(newAction))newAction.click();
    }catch{}
  }

  function selectRelic(root,relics,relic){
    const tier=tierFor(relic.name);
    if(!tier)return;
    const selected=loadSelections();
    const previous=selected[tier]||null;
    selected[tier]=relic.name;
    saveSelections(selected);
    syncLegacyChoice(previous,relic.name);
    root.querySelectorAll(`[data-tier="${tier}"]`).forEach(card=>{
      const active=card.dataset.tierRelic===relic.name;
      card.classList.toggle('selected',active);
      card.setAttribute('aria-pressed',active?'true':'false');
      card.querySelector('.relic-tier-selected-badge')?.remove();
      if(active)card.insertAdjacentHTML('beforeend','<span class="relic-tier-selected-badge">Selected ✓</span>');
    });
    const summary=root.querySelector('[data-tier-summary]');
    if(summary)summary.innerHTML=chosenSummary();
    openDrawer(root,relics,relic);
    try{window.dispatchEvent(new CustomEvent('rs3:tier-relic-selection-changed',{detail:{tier,name:relic.name,replaced:previous}}));}catch{}
  }

  function section(title,content,cls=''){
    if(!content)return '';
    return `<section class="relic-drawer-section ${cls}"><small>${esc(title)}</small><div>${content}</div></section>`;
  }

  function textOrPending(value){
    return value?esc(value):'<span class="relic-detail-pending">Details not added yet.</span>';
  }

  function stars(value){
    const text=String(value||'').trim();
    return text?esc(text):'<span class="relic-detail-pending">Pending</span>';
  }

  function openDrawer(root,relics,relic){
    activeRelic=relic.name;
    const drawer=root.querySelector('[data-tier-drawer]');
    const backdrop=root.querySelector('[data-tier-close]');
    if(!drawer||!backdrop)return;
    const tier=tierFor(relic.name);
    const selected=loadSelections();
    const current=selected[tier]||null;
    const skills=asArray(relic.skills||relic.bestFor);
    const category=relic.category||'Relic';
    const tagline=relic.tagline||relic.notes||relic.description||'';
    const impact=relic.benefits||relic.logicSummary||'';
    const taskText=relic.tasks||'';
    const synergies=Array.isArray(relic.synergies)?relic.synergies.join(', '):relic.synergies||'';
    const regions=Array.isArray(relic.regions)?relic.regions.join(', '):relic.regions||'';
    const hasReference=Boolean(tagline||impact||taskText||skills.length||regions);
    const selectLabel=current===relic.name?'Selected for Tier '+tier:(current?`Replace ${current} with ${relic.name}`:`Select ${relic.name}`);

    drawer.innerHTML=`
      <div class="relic-drawer-head">
        <button type="button" class="relic-drawer-close" data-tier-close-button aria-label="Close relic details">×</button>
        <div class="relic-drawer-identity">
          <span class="relic-drawer-icon">${iconFor(relic)}</span>
          <div><span class="relic-tier-badge">Tier ${tier}</span><h2>${esc(relic.name)}</h2><span class="relic-drawer-category">${esc(category)}</span></div>
        </div>
      </div>
      <div class="relic-drawer-body">
        ${tagline?`<p class="relic-drawer-tagline">${esc(tagline)}</p>`:(!hasReference?'<p class="relic-drawer-tagline relic-detail-pending">Official tier placement is loaded. Full relic effect details have not been added to the companion yet.</p>':'')}
        ${skills.length?`<div class="relic-drawer-tags">${skills.map(skill=>`<span>${esc(skill)}</span>`).join('')}</div>`:''}
        ${section('PLANNER IMPACT',textOrPending(impact))}
        <div class="relic-drawer-grid">
          ${section('BEST REGIONS',textOrPending(regions))}
          ${section('GAME-STAGE VALUE',`<div class="relic-stage-line"><span>Early</span><b>${stars(relic.early)}</b></div><div class="relic-stage-line"><span>Mid</span><b>${stars(relic.mid)}</b></div><div class="relic-stage-line"><span>Late</span><b>${stars(relic.late)}</b></div>`)}
        </div>
        ${section('TASK TYPES HELPED',textOrPending(taskText))}
        ${section('SYNERGIES',textOrPending(synergies))}
        ${section('PLANNER RATING',`<strong class="relic-drawer-rating">${textOrPending(relic.rating)}</strong>`)}
      </div>
      <div class="relic-drawer-actions">
        <button type="button" class="relic-drawer-primary" data-tier-select ${current===relic.name?'data-selected="true"':''}>${esc(selectLabel)}</button>
        <button type="button" class="relic-drawer-secondary" data-tier-plan>Plan with this relic</button>
      </div>`;

    drawer.querySelector('[data-tier-close-button]')?.addEventListener('click',()=>closeDrawer(root));
    drawer.querySelector('[data-tier-select]')?.addEventListener('click',()=>selectRelic(root,relics,relic));
    drawer.querySelector('[data-tier-plan]')?.addEventListener('click',()=>planWithRelic(root,relics,relic));
    backdrop.hidden=false;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('relic-tier-drawer-open');
  }

  function planWithRelic(root,relics,relic){
    const tier=tierFor(relic.name);
    const selected=loadSelections();
    if(selected[tier]!==relic.name)selectRelic(root,relics,relic);
    const action=legacyAction(relic.name,'[data-plan-relic]');
    if(action){try{action.click();return;}catch{}}
    try{window.dispatchEvent(new CustomEvent('rs3:plan-relic',{detail:{tier,name:relic.name,relic}}));}catch{}
    const button=root.querySelector('[data-tier-plan]');
    if(button){
      const old=button.textContent;
      button.textContent='Added to planning ✓';
      setTimeout(()=>{if(button.isConnected)button.textContent=old;},1400);
    }
  }

  function closeDrawer(root){
    activeRelic=null;
    const drawer=root.querySelector('[data-tier-drawer]');
    const backdrop=root.querySelector('[data-tier-close]');
    drawer?.classList.remove('open');
    drawer?.setAttribute('aria-hidden','true');
    if(backdrop)backdrop.hidden=true;
    document.documentElement.classList.remove('relic-tier-drawer-open');
  }

  function wireBoard(root,relics){
    root.querySelectorAll('[data-tier-relic]').forEach(card=>card.addEventListener('click',()=>{
      const relic=relics.get(card.dataset.tierRelic);
      if(relic)openDrawer(root,relics,relic);
    }));
    root.querySelector('[data-tier-close]')?.addEventListener('click',()=>closeDrawer(root));
  }

  function install(force=false){
    const planner=findPlanner();
    if(!planner)return false;
    let root=planner.page.querySelector('[data-relic-tier-planner]');
    hideLegacy(planner);
    if(root&&!force)return true;
    const relics=collectRelics();
    if(!root){
      root=document.createElement('div');
      root.dataset.relicTierPlanner='true';
      root.className='relic-tier-planner';
      planner.legacyGrid.insertAdjacentElement('beforebegin',root);
    }
    const preserve=activeRelic;
    renderBoard(root,relics);
    if(preserve&&relics.has(preserve))openDrawer(root,relics,relics.get(preserve));
    return true;
  }

  function scheduleInstall(force=false){
    clearTimeout(installTimer);
    installTimer=setTimeout(()=>install(force),120);
  }

  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const root=document.querySelector('[data-relic-tier-planner]');
    if(root)closeDrawer(root);
  });
  window.addEventListener('rs3:relics-updated',()=>scheduleInstall(true));
  window.addEventListener('rs3:navigation-changed',()=>scheduleInstall(false));
  const observer=new MutationObserver(()=>{
    const planner=findPlanner();
    if(planner&&!planner.page.querySelector('[data-relic-tier-planner]'))scheduleInstall(false);
  });
  function init(){
    install();
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  globalThis.RS3_TIER_RELIC_PLANNER={tiers:TIERS,getSelections:loadSelections,refresh:()=>install(true)};
})();
