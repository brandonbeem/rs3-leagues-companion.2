/* Fresh-account-aware simple Route Planner.
 * Shows only realistic tasks; location knowledge remains hidden.
 */
(function(){
  const LIMIT_DEFAULT=20;
  const STARTER_IDS=new Set([26,52,9,19,15,21,27,35,34,16,36,40,55,93]);
  const EARLY_IDS=new Set([17,18,28,37,41,42,43]);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const completedSet=()=>new Set((state.completed||[]).map(Number));
  function skippedSet(){state.simpleRouteSkipped=Array.isArray(state.simpleRouteSkipped)?state.simpleRouteSkipped:[];return new Set(state.simpleRouteSkipped.map(Number))}
  function taskText(task){return `${task?.task||''} ${task?.information||''} ${task?.requirements||''} ${task?.locality||''}`.toLowerCase()}
  function requirements(task){try{return typeof parseRequirements==='function'?parseRequirements(task):[]}catch{return[]}}
  function currentStage(){
    const levels=Object.values(state.levels||{}).map(Number).filter(Number.isFinite);
    const highest=levels.length?Math.max(...levels):1;
    const done=completedSet().size;
    if(highest>=30||done>=35)return 2;
    if(highest>=10||done>=8)return 1;
    return 0;
  }
  function hiddenSetup(task){
    const text=taskText(task),stage=currentStage(),blocks=[];
    if(/soul reaper|reaper task|boss task|hard mode|enrage|masterwork|dragon mask|bladed dive|shattered worlds/.test(text))blocks.push('advanced content');
    if(/quest points?|hard lumbridge|task set: hard|unlock all (?:of the )?lodestones/.test(text))blocks.push('long-term milestone');
    if(/dragon bones?|baby dragon bones?|frost dragon bones?|dinosaur bones?/.test(text))blocks.push('combat-gated supplies');
    if(/impling|hunter creatures?|chinchompa|big game hunter|butterfl(?:y|ies)|salamander/.test(text))blocks.push('Hunter setup');
    if(/naragi engram|engram from orla|clue|treasure trail|collection log/.test(text))blocks.push('special unlock or random activity');
    if(/complete 15 slayer tasks|complete \d+ slayer tasks/.test(text))blocks.push('large Slayer grind');
    if(/(?:catch|kill|bury|craft|make|mine|chop|cook|smith|smelt|complete|obtain)\s+(?:over\s+)?(?:50|75|100|150|200|250|500|1000|1,000)\b/.test(text))blocks.push('large quantity grind');
    if(stage===0&&/edgeville|fort forinthry|city of um|varrock|grand exchange|dig site|archaeology campus/.test(text)&&Number(task.id)!==93)blocks.push('outside opening progression');
    return blocks;
  }
  function levelEligible(task){
    return requirements(task).every(req=>(Number(state.levels?.[req.skill])||1)>=Number(req.level||1));
  }
  function progressionEligible(task){
    const id=Number(task.id),stage=currentStage();
    if(stage===0)return STARTER_IDS.has(id);
    if(stage===1)return STARTER_IDS.has(id)||EARLY_IDS.has(id)||!hiddenSetup(task).length;
    return !hiddenSetup(task).length;
  }
  function eligible(task){
    const region=String(task.region||task.locality||'');
    const id=Number(task.id);
    if(!/misthalin|global/i.test(region))return false;
    if(completedSet().has(id)||skippedSet().has(id))return false;
    if(!levelEligible(task)||hiddenSetup(task).length)return false;
    return progressionEligible(task);
  }
  function taskMinutes(task){
    const id=Number(task.id),text=taskText(task);
    if(id===26)return 1;
    if([52,9,15,21,34].includes(id))return 2;
    if([19,27,35,16,36].includes(id))return 3;
    if([40,55,93].includes(id))return 5;
    if(/1000|1,000|500\b/.test(text))return 90;
    if(/200\b|150\b|100\b/.test(text))return 45;
    try{if(typeof taskBaseMinutes==='function')return Math.max(1,Math.round(taskBaseMinutes(task)))}catch{}
    return 10;
  }
  function score(task){
    const id=Number(task.id),stage=currentStage(),cluster=window.RS3_MISTHALIN_PROGRESSION?.clusterFor?.(task);
    const mins=taskMinutes(task),points=Number(task.points)||0;
    let value=150-(mins*6)+(Math.min(points,80)/10);
    const starterOrder=[26,52,9,19,27,35,15,21,34,16,36,40,55,93];
    const position=starterOrder.indexOf(id);
    if(stage===0&&position>=0)value+=300-(position*10);
    if(cluster){
      if(cluster.stage<=stage)value+=25;
      else value-=100*(cluster.stage-stage);
      if(stage===0&&cluster.area==='Lumbridge')value+=30;
    }
    return value;
  }
  function recommendations(){
    const requested=Number(state.optimizerLength)||LIMIT_DEFAULT;
    return (DATA.tasks||[]).filter(eligible).map(task=>({task,score:score(task),minutes:taskMinutes(task)}))
      .sort((a,b)=>b.score-a.score||a.minutes-b.minutes||Number(a.task.id)-Number(b.task.id)).slice(0,requested);
  }
  function row(item,index){
    const task=item.task,reqs=requirements(task);
    const requirementText=reqs.length?` · Requires ${reqs.map(r=>`${r.level} ${r.skill}`).join(', ')}`:'';
    return `<article class="simple-route-task" data-simple-route-task="${Number(task.id)}" tabindex="0">
      <div class="simple-route-number">${index+1}</div>
      <div class="simple-route-copy"><strong>${esc(task.task)}</strong><div class="simple-route-meta">${Number(task.points)||0} pts · ~${item.minutes} min${esc(requirementText)}</div></div>
      <div class="simple-route-actions"><button type="button" class="simple-route-pill complete" data-simple-complete="${Number(task.id)}">✓ Complete</button><button type="button" class="simple-route-pill skip" data-simple-skip="${Number(task.id)}">▷ Skip</button></div>
    </article>`;
  }
  function render(){
    const results=document.getElementById('routeResults');if(!results)return;
    const tasks=recommendations();
    document.getElementById('routeNextAction')?.replaceChildren();
    document.getElementById('routeOverview')?.replaceChildren();
    const flow=document.getElementById('regionFlowPanel');if(flow)flow.hidden=true;
    const alt=document.getElementById('routeAlternativePanel');if(alt)alt.hidden=true;
    const status=document.getElementById('optimizerStatus');if(status)status.textContent=`${tasks.length} realistic tasks available for your current account`;
    results.innerHTML=tasks.length?tasks.map(row).join(''):'<div class="empty">No starter tasks are currently available. Restore skipped tasks or verify that Global and starter tasks are included.</div>';
    bind();
  }
  function complete(id){
    const task=DATA.tasks.find(t=>Number(t.id)===Number(id));
    if(typeof setTaskCompleted==='function')setTaskCompleted(id,true,{recalculate:false});
    else if(!completedSet().has(Number(id))){state.completed=[...(state.completed||[]),Number(id)];save?.()}
    showToast?.(`${task?.task||'Task'} completed.`);render();
  }
  function skip(id){const set=skippedSet();set.add(Number(id));state.simpleRouteSkipped=[...set];save?.();showToast?.('Task skipped for now.');render()}
  function bind(){
    document.querySelectorAll('[data-simple-complete]').forEach(button=>button.onclick=()=>complete(button.dataset.simpleComplete));
    document.querySelectorAll('[data-simple-skip]').forEach(button=>button.onclick=()=>skip(button.dataset.simpleSkip));
  }
  function setup(){
    const generate=document.getElementById('generateRoute');
    if(generate){generate.textContent='Refresh recommendations';generate.addEventListener('click',event=>{event.stopImmediatePropagation();render()},true)}
    const heading=document.querySelector('#optimizer h1');if(heading)heading.textContent='Recommended Tasks';
    const lead=document.querySelector('#optimizer .lead');if(lead)lead.textContent='A fresh-account-aware guide showing realistic tasks you can complete now.';
    document.addEventListener('keydown',event=>{
      if(!document.getElementById('optimizer')?.classList.contains('active')||/input|textarea|select/i.test(event.target?.tagName||''))return;
      const first=document.querySelector('.simple-route-task');if(!first)return;
      if(event.key.toLowerCase()==='s'){event.preventDefault();first.querySelector('[data-simple-skip]')?.click()}
      if(event.key.toLowerCase()==='c'||event.code==='Space'){event.preventDefault();first.querySelector('[data-simple-complete]')?.click()}
    });
    const observer=new MutationObserver(()=>{if(document.getElementById('optimizer')?.classList.contains('active')&&!document.querySelector('.simple-route-task'))render()});
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
    if(document.getElementById('optimizer')?.classList.contains('active'))render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
  window.RS3SimpleRoutePlanner={render,recommendations,hiddenSetup};
})();
