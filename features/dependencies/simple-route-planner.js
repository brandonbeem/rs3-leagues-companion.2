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
  function taskText(task){return `${task?.task||''} ${task?.information||''} ${task?.requirements||''} ${task?.locality||''}`.toLowerCase()}
  function requirements(task){try{return typeof parseRequirements==='function'?parseRequirements(task):[]}catch{return[]}}
  function hiddenSetup(task){
    const text=taskText(task);
    const stage=currentStage();
    const blocks=[];
    if(/soul reaper|reaper task|boss task|defeat .*boss|hard mode|enrage/.test(text))blocks.push('bossing');
    if(/quest points?|complete \d+ quests?|grandmaster quest|master quest/.test(text))blocks.push('quest progression');
    if(/dragon bones?|baby dragon bones?|frost dragon bones?|dinosaur bones?/.test(text))blocks.push('rare or combat-gated supplies');
    if(/impling|hunter creatures?|chinchompa|big game hunter|butterfl(?:y|ies)|salamander/.test(text))blocks.push('Hunter setup');
    if(/clue|treasure trail|collection log/.test(text))blocks.push('random or long-form activity');
    if(/edgeville|fort forinthry|city of um|varrock|grand exchange|archaeology campus|dig site/.test(text)&&stage===0)blocks.push('outside the opening Lumbridge cluster');
    if(/(?:catch|kill|bury|craft|make|mine|chop|cook|smith|smelt|complete|obtain)\s+(?:over\s+)?(?:50|75|100|150|200|250|500|1000|1,000)\b/.test(text))blocks.push('large quantity grind');
    if(/obtain .*75|reach .*50|reach .*60|reach .*70|reach .*80|reach .*90|reach .*99/.test(text)&&stage===0)blocks.push('long-term milestone');
    return blocks;
  }
  function starterFriendly(task){
    const text=taskText(task);
    return /talk to hans|find out how old|kill a chicken|bury (?:some|a set of)? ?bones|cook (?:a piece|some|an?)|chop (?:down )?(?:a )?tree|light (?:a )?fire|catch (?:a )?(?:shrimp|crayfish)|mine (?:some |a )?(?:copper|tin)|milk (?:a )?cow|complete the archaeology tutorial/.test(text);
  }
  function eligible(task){
    const region=String(task.region||task.locality||'');
    if(!/misthalin|global/i.test(region))return false;
    if(completedSet().has(Number(task.id))||skippedSet().has(Number(task.id)))return false;
    if(!requirements(task).every(req=>(Number(state.levels?.[req.skill])||1)>=Number(req.level||1)))return false;
    if(hiddenSetup(task).length)return false;
    return true;
  }
  function taskMinutes(task){
    const text=taskText(task);
    if(/1000|1,000|500\b/.test(text))return 90;
    if(/200\b|150\b|100\b/.test(text))return 45;
    if(/75 quest points?|50 quest points?/.test(text))return 240;
    if(/soul reaper|boss task/.test(text))return 60;
    try{if(typeof taskBaseMinutes==='function')return Math.max(1,Math.round(taskBaseMinutes(task)))}catch{}
    if(/talk to hans|find out how old|kill a chicken|bury (?:some )?bones|light (?:a )?fire|chop (?:down )?(?:a )?tree|milk (?:a )?cow/.test(text))return 2;
    if(/cook|catch (?:a )?(?:shrimp|crayfish)|mine (?:some |a )?(?:copper|tin)|tutorial/.test(text))return 4;
    return 10;
  }
  function score(task){
    const stage=currentStage();
    const cluster=window.RS3_MISTHALIN_PROGRESSION?.clusterFor?.(task);
    const mins=taskMinutes(task);
    const reqs=requirements(task);
    const points=Number(task.points)||0;
    let value=120-(mins*5)+(Math.min(points,80)/10)-(reqs.length*4);
    if(cluster){
      if(cluster.stage<=stage)value+=30;
      else value-=80*(cluster.stage-stage);
      if(stage===0&&cluster.id==='lumbridge-castle')value+=55;
      if(stage===0&&cluster.area==='Lumbridge')value+=35;
    }
    if(stage===0&&starterFriendly(task))value+=100;
    const text=taskText(task);
    if(/talk to hans|find out how old/.test(text))value+=75;
    if(/kill a chicken/.test(text))value+=55;
    if(/bury (?:some )?bones|cook|chop.*tree|light.*fire|catch.*(?:shrimp|crayfish)|mine.*(?:copper|tin)|milk.*cow/.test(text))value+=45;
    if(/requires? [2-9]\d|requires? \d{3}/.test(text)&&stage===0)value-=200;
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
    const status=document.getElementById('optimizerStatus');if(status)status.textContent=`${tasks.length} realistic tasks available for your current account`;
    results.innerHTML=tasks.length?tasks.map(row).join(''):'<div class="empty">No realistic Misthalin tasks are available at the current levels. Update your stats or restore a skipped task.</div>';
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
    const lead=document.querySelector('#optimizer .lead');if(lead)lead.textContent='A fresh-account-aware guide showing realistic tasks you can complete now. Location and setup requirements stay behind the scenes.';
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
