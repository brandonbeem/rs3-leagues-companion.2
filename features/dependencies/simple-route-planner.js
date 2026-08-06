/* Simple level-aware Route Planner.
 * Replaces visible area sweeps with a ranked task list while retaining hidden location intelligence.
 */
(function(){
  const LIMIT_DEFAULT=20;
  const escValue=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const completedSet=()=>new Set((state.completed||[]).map(Number));
  function skippedSet(){state.simpleRouteSkipped=Array.isArray(state.simpleRouteSkipped)?state.simpleRouteSkipped:[];return new Set(state.simpleRouteSkipped.map(Number))}
  function currentStage(){
    const levels=Object.values(state.levels||{}).map(Number).filter(Number.isFinite);
    const highest=levels.length?Math.max(...levels):1;
    const done=completedSet().size;
    if(highest>=30||done>=35)return 2;
    if(highest>=10||done>=10)return 1;
    return 0;
  }
  function requirements(task){try{return typeof parseRequirements==='function'?parseRequirements(task):[]}catch{return[]}}
  function eligible(task){
    const region=String(task.region||task.locality||'');
    if(!/misthalin|global/i.test(region))return false;
    if(completedSet().has(Number(task.id))||skippedSet().has(Number(task.id)))return false;
    return requirements(task).every(req=>(Number(state.levels?.[req.skill])||1)>=Number(req.level||1));
  }
  function taskMinutes(task){
    try{if(typeof taskBaseMinutes==='function')return Math.max(1,Math.round(taskBaseMinutes(task)))}catch{}
    const txt=`${task.task||''} ${task.information||''}`.toLowerCase();
    if(/1000|1,000|200 times|100 times/.test(txt))return 45;
    if(/tutorial|talk to|bury|light|cook|chop|mine|catch|kill a/.test(txt))return 3;
    return 8;
  }
  function score(task){
    const stage=currentStage();
    const cluster=window.RS3_MISTHALIN_PROGRESSION?.clusterFor?.(task);
    const mins=taskMinutes(task);
    const reqs=requirements(task);
    const points=Number(task.points)||0;
    let value=120-(mins*4)+(Math.min(points,80)/8)-(reqs.length*3);
    if(cluster){
      if(cluster.stage<=stage)value+=30;
      else value-=50*(cluster.stage-stage);
      if(stage===0&&cluster.id==='lumbridge-castle')value+=35;
      if(stage===0&&cluster.area==='Lumbridge')value+=22;
    }
    const text=`${task.task||''} ${task.information||''}`.toLowerCase();
    if(/tutorial|chop.*tree|light.*fire|catch.*shrimp|cook|bury.*bones|mine.*copper|mine.*tin|kill.*chicken|milk.*cow/.test(text))value+=25;
    if(/clue|treasure trail|collection log/.test(text))value-=500;
    return value;
  }
  function recommendations(){
    const requested=Number(state.optimizerLength)||LIMIT_DEFAULT;
    return (DATA.tasks||[]).filter(eligible).map(task=>({task,score:score(task),minutes:taskMinutes(task)})).sort((a,b)=>b.score-a.score||a.minutes-b.minutes||Number(a.task.id)-Number(b.task.id)).slice(0,requested);
  }
  function row(item,index){
    const task=item.task;
    const reqs=requirements(task);
    const requirementText=reqs.length?` · Requires ${reqs.map(r=>`${r.level} ${r.skill}`).join(', ')}`:'';
    return `<article class="simple-route-task" data-simple-route-task="${Number(task.id)}" tabindex="0">
      <div class="simple-route-number">${index+1}</div>
      <div class="simple-route-copy"><strong>${escValue(task.task)}</strong><div class="simple-route-meta">${Number(task.points)||0} pts · ~${item.minutes} min${escValue(requirementText)}</div></div>
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
    const status=document.getElementById('optimizerStatus');if(status)status.textContent=`${tasks.length} best tasks available at your current levels`;
    results.innerHTML=tasks.length?tasks.map(row).join(''):'<div class="empty">No eligible Misthalin tasks are available at the current levels. Update your stats or restore a skipped task.</div>';
    bind();
  }
  function complete(id){
    const task=DATA.tasks.find(t=>Number(t.id)===Number(id));
    if(typeof setTaskCompleted==='function')setTaskCompleted(id,true,{recalculate:false});
    else if(!completedSet().has(Number(id))){state.completed=[...(state.completed||[]),Number(id)];save?.()}
    showToast?.(`${task?.task||'Task'} completed.`);render();
  }
  function skip(id){
    const set=skippedSet();set.add(Number(id));state.simpleRouteSkipped=[...set];save?.();showToast?.('Task skipped for now.');render();
  }
  function bind(){
    document.querySelectorAll('[data-simple-complete]').forEach(button=>button.onclick=()=>complete(button.dataset.simpleComplete));
    document.querySelectorAll('[data-simple-skip]').forEach(button=>button.onclick=()=>skip(button.dataset.simpleSkip));
  }
  function setup(){
    const generate=document.getElementById('generateRoute');
    if(generate){generate.textContent='Refresh recommendations';generate.addEventListener('click',event=>{event.stopImmediatePropagation();render()},true)}
    const heading=document.querySelector('#optimizer h1');if(heading)heading.textContent='Recommended Tasks';
    const lead=document.querySelector('#optimizer .lead');if(lead)lead.textContent='A simple level-aware guide showing the best tasks you can complete now. Location data is used quietly in the background.';
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
  window.RS3SimpleRoutePlanner={render,recommendations};
})();
