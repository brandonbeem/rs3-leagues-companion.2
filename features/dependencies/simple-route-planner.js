/* Fresh-account-aware simple Route Planner.
 * Shows only realistic tasks for the player's current progression tier.
 * Location knowledge is used privately; no area sweeps or travel directions are shown.
 */
(function(){
  const LIMIT_DEFAULT=20;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const completedSet=()=>new Set((state.completed||[]).map(Number));
  function skippedSet(){state.simpleRouteSkipped=Array.isArray(state.simpleRouteSkipped)?state.simpleRouteSkipped:[];return new Set(state.simpleRouteSkipped.map(Number))}
  function text(task){return `${task?.task||''} ${task?.information||''} ${task?.requirements||''} ${task?.locality||''}`.toLowerCase()}
  function requirements(task){try{return typeof parseRequirements==='function'?parseRequirements(task):[]}catch{return[]}}
  function level(skill){return Number(state.levels?.[skill])||1}
  function progressionTier(){
    const levels=Object.values(state.levels||{}).map(Number).filter(Number.isFinite);
    const highest=levels.length?Math.max(...levels):1;
    const average=levels.length?levels.reduce((a,b)=>a+b,0)/levels.length:1;
    const done=completedSet().size;
    if(highest>=50||average>=25||done>=60)return 3;
    if(highest>=30||average>=15||done>=35)return 2;
    if(highest>=10||average>=5||done>=12)return 1;
    return 0;
  }

  const STARTER_PATTERNS=[
    /talk to hans/,/find out how old/,/kill a chicken/,/kill a cow/,/milk (?:a )?cow/,
    /bury (?:some |a set of )?bones(?!.*dragon)/,/cook (?:a |some |raw )?(?:shrimp|crayfish|chicken|meat|food)/,
    /chop (?:down )?(?:a )?(?:normal )?tree/,/light (?:a )?fire/,
    /catch (?:a |some )?(?:raw )?(?:shrimp|crayfish)/,/mine (?:some |a )?(?:copper|tin)(?: ore)?/,
    /smelt (?:a )?bronze bar/,/smith (?:a )?bronze/,/complete the archaeology tutorial/,
    /activate (?:the )?lumbridge lodestone/,/use (?:the )?lumbridge lodestone/
  ];
  const EARLY_PATTERNS=[
    /reach level (?:5|10|15|20) /,/chop (?:an? )?oak/,/catch (?:a |some )?(?:trout|salmon)/,
    /cook (?:a |some )?(?:trout|salmon)/,/mine (?:some |a )?iron/,/smelt (?:an? )?iron bar/,
    /smith (?:an? )?iron/,/complete cook'?s assistant/,/complete sheep shearer/,
    /complete rune mysteries/,/steal from (?:a )?(?:stall|man|woman)/,/chop (?:a )?willow/
  ];

  const ALWAYS_BLOCK=[
    /soul reaper|reaper task|boss task|hard mode|enrage|defeat .*boss/,
    /quest points?|complete \d+ quests?|grandmaster quest|master quest/,
    /dragon bones?|baby dragon bones?|frost dragon bones?|dinosaur bones?/,
    /impling|hunter creatures?|chinchompa|big game hunter|butterfl(?:y|ies)|salamander/,
    /clue|treasure trail|collection log/,
    /naragi engram|engram from orla|dragon mask|masterwork weapon|bladed dive|shattered worlds/,
    /unlock all (?:of the )?lodestones|hard lumbridge|elite lumbridge|medium lumbridge/,
    /complete 15 slayer tasks|complete \d+ slayer tasks/,
    /equip any .*mask|equip any masterwork/,
    /(?:catch|kill|bury|craft|make|mine|chop|cook|smith|smelt|complete|obtain)\s+(?:over\s+)?(?:50|75|100|150|200|250|500|1000|1,000)\b/
  ];

  function matchesAny(value,patterns){return patterns.some(pattern=>pattern.test(value))}
  function maxRequiredLevel(task){const reqs=requirements(task);return reqs.length?Math.max(...reqs.map(r=>Number(r.level)||1)):1}
  function blocked(task){
    const value=text(task),tier=progressionTier();
    if(matchesAny(value,ALWAYS_BLOCK))return true;
    if(tier===0&&/edgeville|fort forinthry|city of um|varrock|grand exchange|archaeology campus|dig site|draynor|wizard'?s tower/.test(value)){
      if(!/complete the archaeology tutorial/.test(value))return true;
    }
    if(tier===0&&maxRequiredLevel(task)>1)return true;
    if(tier===1&&maxRequiredLevel(task)>25)return true;
    if(tier===2&&maxRequiredLevel(task)>50)return true;
    return false;
  }
  function tierAllowed(task){
    const value=text(task),tier=progressionTier();
    if(tier===0)return matchesAny(value,STARTER_PATTERNS);
    if(tier===1)return matchesAny(value,STARTER_PATTERNS)||matchesAny(value,EARLY_PATTERNS)||maxRequiredLevel(task)<=20;
    if(tier===2)return maxRequiredLevel(task)<=45;
    return true;
  }
  function eligible(task){
    const region=String(task.region||task.locality||'');
    if(!/misthalin|global/i.test(region))return false;
    if(completedSet().has(Number(task.id))||skippedSet().has(Number(task.id)))return false;
    if(!requirements(task).every(req=>level(req.skill)>=Number(req.level||1)))return false;
    if(blocked(task)||!tierAllowed(task))return false;
    return true;
  }
  function minutes(task){
    const value=text(task);
    if(/talk to hans|find out how old|activate .*lumbridge lodestone/.test(value))return 1;
    if(/kill a chicken|kill a cow|bury .*bones|chop .*tree|light .*fire|milk .*cow/.test(value))return 2;
    if(/catch .*shrimp|catch .*crayfish|cook .*shrimp|cook .*crayfish|mine .*copper|mine .*tin/.test(value))return 3;
    if(/archaeology tutorial|smelt .*bronze|smith .*bronze/.test(value))return 5;
    try{if(typeof taskBaseMinutes==='function')return Math.max(1,Math.round(taskBaseMinutes(task)))}catch{}
    return 10;
  }
  function score(task){
    const value=text(task),tier=progressionTier();
    const cluster=window.RS3_MISTHALIN_PROGRESSION?.clusterFor?.(task);
    let result=200-minutes(task)*8+Math.min(Number(task.points)||0,80)/10;
    if(tier===0&&matchesAny(value,STARTER_PATTERNS))result+=150;
    if(/talk to hans|find out how old/.test(value))result+=120;
    if(/kill a chicken/.test(value))result+=100;
    if(/bury .*bones(?!.*dragon)/.test(value))result+=90;
    if(/chop .*tree|light .*fire|catch .*shrimp|catch .*crayfish|cook .*|mine .*copper|mine .*tin|milk .*cow/.test(value))result+=75;
    if(cluster){
      if(tier===0&&cluster.id==='lumbridge-castle')result+=60;
      if(tier===0&&cluster.area==='Lumbridge')result+=45;
      if(cluster.stage>tier)result-=100*(cluster.stage-tier);
    }
    return result;
  }
  function recommendations(){
    const requested=Number(state.optimizerLength)||LIMIT_DEFAULT;
    return (DATA.tasks||[]).filter(eligible).map(task=>({task,score:score(task),minutes:minutes(task)}))
      .sort((a,b)=>b.score-a.score||a.minutes-b.minutes||Number(a.task.id)-Number(b.task.id)).slice(0,requested);
  }
  function row(item,index){
    const task=item.task,reqs=requirements(task);
    const reqText=reqs.length?` · Requires ${reqs.map(r=>`${r.level} ${r.skill}`).join(', ')}`:'';
    return `<article class="simple-route-task" data-simple-route-task="${Number(task.id)}" tabindex="0">
      <div class="simple-route-number">${index+1}</div>
      <div class="simple-route-copy"><strong>${esc(task.task)}</strong><div class="simple-route-meta">${Number(task.points)||0} pts · ~${item.minutes} min${esc(reqText)}</div></div>
      <div class="simple-route-actions"><button type="button" class="simple-route-pill complete" data-simple-complete="${Number(task.id)}">✓ Complete</button><button type="button" class="simple-route-pill skip" data-simple-skip="${Number(task.id)}">▷ Skip</button></div>
    </article>`;
  }
  function render(){
    const results=document.getElementById('routeResults');if(!results)return;
    const tasks=recommendations(),tier=progressionTier();
    document.getElementById('routeNextAction')?.replaceChildren();
    document.getElementById('routeOverview')?.replaceChildren();
    const flow=document.getElementById('regionFlowPanel');if(flow)flow.hidden=true;
    const alt=document.getElementById('routeAlternativePanel');if(alt)alt.hidden=true;
    const status=document.getElementById('optimizerStatus');
    if(status)status.textContent=tasks.length?`${tasks.length} realistic tasks for progression tier ${tier+1}`:'No safe tasks match this progression tier yet';
    results.innerHTML=tasks.length?tasks.map(row).join(''):'<div class="empty">No verified beginner-safe tasks are available right now. Update your stats or restore a skipped task. The planner will not fill the list with unrealistic milestones.</div>';
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
    const lead=document.querySelector('#optimizer .lead');if(lead)lead.textContent='Only tasks that are realistic for your current account progression are shown. The list may be shorter than 20 rather than include bad recommendations.';
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
  window.RS3SimpleRoutePlanner={render,recommendations,progressionTier,blocked};
})();
