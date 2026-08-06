/* Relic Planner stability guard.
 * The Relic Planner rebuilds its list after a relic is toggled. This keeps the
 * player's list scroll position and page position stable through that rebuild.
 */
(()=>{
  const LIST_SELECTOR='.relic-compact-list';
  const RELIC_AREA_SELECTOR='.relic-list-panel,.relic-detail-panel,#relicPlannerSummary';
  const ACTION_SELECTOR='[data-relic-quick-toggle],[data-relic-focus],[data-relic],[data-plan-relic]';
  let snapshot=null;
  let restoreTimer=null;

  function findList(){
    return document.querySelector(LIST_SELECTOR);
  }

  function remember(event){
    const list=findList();
    if(!list)return;
    const target=event?.target instanceof Element?event.target:null;
    if(target&&!target.closest(RELIC_AREA_SELECTOR)&&!target.closest(ACTION_SELECTOR))return;
    snapshot={
      listTop:list.scrollTop,
      listLeft:list.scrollLeft,
      pageX:window.scrollX,
      pageY:window.scrollY,
      time:Date.now()
    };
  }

  function restore(){
    if(!snapshot||Date.now()-snapshot.time>3000)return;
    const list=findList();
    if(!list)return;
    const maxTop=Math.max(0,list.scrollHeight-list.clientHeight);
    list.scrollTop=Math.max(0,Math.min(snapshot.listTop,maxTop));
    list.scrollLeft=snapshot.listLeft||0;
    if(Math.abs(window.scrollY-snapshot.pageY)>4||Math.abs(window.scrollX-snapshot.pageX)>4){
      window.scrollTo(snapshot.pageX,snapshot.pageY);
    }
  }

  function restoreSoon(){
    clearTimeout(restoreTimer);
    const delays=[0,16,50,100,180,320,600];
    for(const delay of delays){
      setTimeout(()=>requestAnimationFrame(restore),delay);
    }
    restoreTimer=setTimeout(()=>{snapshot=null;},3200);
  }

  function stabilizeSummary(){
    const summary=document.getElementById('relicPlannerSummary');
    if(!summary)return;
    const routeText=summary.querySelector('span');
    if(routeText){
      routeText.title=routeText.textContent||'';
    }
  }

  document.addEventListener('pointerdown',event=>{
    if(event.target instanceof Element&&event.target.closest(RELIC_AREA_SELECTOR))remember(event);
  },true);

  document.addEventListener('click',event=>{
    if(event.target instanceof Element&&event.target.closest(ACTION_SELECTOR)){
      if(!snapshot)remember(event);
      restoreSoon();
    }
  },false);

  document.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ')&&event.target instanceof Element&&event.target.closest(ACTION_SELECTOR)){
      remember(event);
      restoreSoon();
    }
  },true);

  const observer=new MutationObserver(mutations=>{
    stabilizeSummary();
    if(!snapshot)return;
    if(mutations.some(mutation=>{
      const target=mutation.target;
      return target instanceof Element&&(target.matches?.(LIST_SELECTOR)||target.closest?.('.relic-list-panel')||target.closest?.('#relicPlannerSummary'));
    })){
      restoreSoon();
    }
  });

  function init(){
    stabilizeSummary();
    if(document.body)observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
