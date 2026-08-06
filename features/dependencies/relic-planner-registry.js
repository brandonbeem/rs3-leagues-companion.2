/* Extensible Relic Planner registry.
 * New relics can be added by registering one normalized object instead of editing
 * the embedded planner renderer. Existing V20.2 patch files are imported here.
 */
(()=>{
  const BASE_NAMES=["Golden Touch","Divine Druid","Superheated","Crystal Grace","Survivalist","Transmutation","Endless Harvest","Assassin's Insight","Voidwalker","Nature's Network"];
  const STORAGE_KEY='rs3-leagues-extra-relic-selections';
  const registry=new Map();

  function normalize(raw={}){
    const name=String(raw.name||'').trim();
    if(!name)return null;
    const skills=Array.isArray(raw.skills)?raw.skills:String(raw.skills||'').split(',').map(v=>v.trim()).filter(Boolean);
    return {
      id: raw.id??name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
      name,
      category: raw.category||'Utility',
      tagline: raw.tagline||raw.notes||raw.benefits||'Additional revealed relic.',
      benefits: raw.benefits||raw.tagline||'',
      skills,
      regions: raw.regions||'All unlocked regions',
      early: raw.early||'★★★☆☆', mid: raw.mid||'★★★☆☆', late: raw.late||'★★★☆☆',
      rating: raw.rating||'Pending',
      tasks: raw.tasks||'', economy: raw.economy||'', afk: raw.afk||'', pvm: raw.pvm||'',
      synergies: raw.synergies||'', icon: raw.icon||raw.artwork||'', tier: raw.tier??null,
      tierStatus: raw.tierStatus||'pending'
    };
  }

  function register(raw){
    const relic=normalize(raw);
    if(!relic)return;
    registry.set(relic.name,relic);
  }

  function importPatchGlobals(){
    const patches=globalThis.RELIC_SUMMARY_PATCH||{};
    Object.values(patches).forEach(register);
    const knowledge=globalThis.RELIC_KNOWLEDGE||{};
    Object.entries(knowledge).forEach(([name,info])=>{
      const existing=registry.get(name)||{name};
      register({...existing,...info,name});
    });
  }

  function patchExposedArrays(){
    const extras=[...registry.values()];
    if(!extras.length)return false;
    let changed=false;
    const seen=new Set();
    function inspect(value){
      if(!Array.isArray(value)||seen.has(value))return;
      seen.add(value);
      const names=value.map(v=>v&&typeof v==='object'?v.name:null).filter(Boolean);
      const baseHits=BASE_NAMES.filter(n=>names.includes(n)).length;
      if(baseHits<5)return;
      for(const relic of extras){
        if(!names.includes(relic.name)){ value.push({...relic}); changed=true; }
      }
    }
    for(const key of Object.getOwnPropertyNames(globalThis)){
      let value;
      try{value=globalThis[key];}catch{continue;}
      inspect(value);
      if(value&&typeof value==='object'&&!Array.isArray(value)){
        for(const childKey of Object.keys(value).slice(0,100)){
          try{inspect(value[childKey]);}catch{}
        }
      }
    }
    return changed;
  }

  function selectedSet(){
    try{return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'));}catch{return new Set();}
  }
  function saveSelected(set){ try{localStorage.setItem(STORAGE_KEY,JSON.stringify([...set]));}catch{} }

  function findTextElement(pattern){
    return [...document.querySelectorAll('h1,h2,h3,h4,div,span,p')]
      .find(el=>pattern.test((el.textContent||'').trim())&&el.children.length<4);
  }

  function findListPanel(){
    const heading=findTextElement(/^Revealed relics$/i);
    if(!heading)return null;
    let node=heading.parentElement;
    for(let i=0;i<4&&node;i++,node=node.parentElement){
      const text=node.innerText||'';
      if(BASE_NAMES.filter(n=>text.includes(n)).length>=5)return node;
    }
    return null;
  }

  function findDetailPanel(listPanel){
    if(!listPanel)return null;
    const parent=listPanel.parentElement;
    if(!parent)return null;
    return [...parent.children].find(el=>el!==listPanel&&(el.innerText||'').includes('PLANNER IMPACT'))||null;
  }

  function renderDetails(relic,listPanel){
    const panel=findDetailPanel(listPanel);
    if(!panel)return;
    panel.dataset.relicRegistryDetail='true';
    const stars=v=>String(v||'').replace(/[^★☆]/g,'')||'Pending';
    panel.innerHTML=`
      <div class="registry-relic-detail">
        <div class="registry-relic-title-row">${relic.icon?`<img src="${relic.icon}" alt="">`:''}<div><h2>${relic.name}</h2><span class="registry-category">${relic.category}</span></div></div>
        <p class="registry-tagline">${relic.tagline}</p>
        <div class="registry-skill-tags">${relic.skills.map(skill=>`<span>${skill}</span>`).join('')}</div>
        <section><small>PLANNER IMPACT</small><p>${relic.benefits||relic.tasks||'Planner integration pending.'}</p></section>
        <div class="registry-detail-grid">
          <section><small>BEST REGIONS</small><p>${relic.regions}</p></section>
          <section><small>GAME-STAGE VALUE</small><p>Early ${stars(relic.early)}<br>Mid ${stars(relic.mid)}<br>Late ${stars(relic.late)}</p></section>
        </div>
        <section><small>PLANNER RATING</small><h3>${relic.rating}</h3></section>
        <div class="registry-actions"><button type="button" data-registry-add>${selectedSet().has(relic.name)?'Remove from build':'Add to build'}</button></div>
      </div>`;
    panel.querySelector('[data-registry-add]')?.addEventListener('click',event=>{
      const selected=selectedSet();
      selected.has(relic.name)?selected.delete(relic.name):selected.add(relic.name);
      saveSelected(selected);
      event.currentTarget.textContent=selected.has(relic.name)?'Remove from build':'Add to build';
      updateCounts();
      renderRows();
    });
  }

  function updateCounts(){
    const total=BASE_NAMES.length+registry.size;
    const selected=selectedSet().size;
    for(const el of document.querySelectorAll('div,span,p')){
      const text=(el.textContent||'').trim();
      if(/^\d+\s+shown$/i.test(text))el.textContent=`${total} shown`;
      if(/^\d+\s*\/\s*\d+\s+selected$/i.test(text))el.textContent=`${selected} / ${total} selected`;
    }
  }

  function renderRows(){
    const listPanel=findListPanel();
    if(!listPanel)return false;
    const existingText=listPanel.innerText||'';
    const selected=selectedSet();
    let host=listPanel.querySelector('[data-relic-registry-host]');
    if(!host){
      host=document.createElement('div');
      host.dataset.relicRegistryHost='true';
      host.className='relic-registry-host';
      listPanel.appendChild(host);
    }
    host.innerHTML='';
    for(const relic of registry.values()){
      if(existingText.includes(relic.name))continue;
      const row=document.createElement('button');
      row.type='button';
      row.className='relic-registry-row';
      row.dataset.selected=selected.has(relic.name)?'true':'false';
      row.innerHTML=`${relic.icon?`<img src="${relic.icon}" alt="">`:'<span class="registry-icon-placeholder">✦</span>'}<span class="registry-row-copy"><strong>${relic.name}</strong><small>${relic.category}</small></span><span class="registry-select-dot">${selected.has(relic.name)?'✓':'○'}</span>`;
      row.addEventListener('click',()=>renderDetails(relic,listPanel));
      host.appendChild(row);
    }
    updateCounts();
    return true;
  }

  function run(){
    importPatchGlobals();
    const changed=patchExposedArrays();
    if(changed){
      try{window.dispatchEvent(new CustomEvent('rs3:relics-updated',{detail:{count:BASE_NAMES.length+registry.size}}));}catch{}
    }
    renderRows();
  }

  globalThis.RS3_RELIC_REGISTRY={register,getAll:()=>[...registry.values()],refresh:run};
  const observer=new MutationObserver(()=>{clearTimeout(observer._timer);observer._timer=setTimeout(run,80);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run();observer.observe(document.body,{childList:true,subtree:true});},{once:true});
  else{run();observer.observe(document.body,{childList:true,subtree:true});}
  setTimeout(run,400);setTimeout(run,1200);
})();
