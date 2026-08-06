(function(){
  'use strict';

  function normalizeRouteActions(root=document){
    root.querySelectorAll('.route-action-buttons .route-complete').forEach(label=>{
      const input=label.querySelector('input');
      if(!input)return;
      for(const node of [...label.childNodes]){
        if(node.nodeType===Node.TEXT_NODE)node.remove();
      }
      if(!label.querySelector('.route-complete-label')){
        const text=document.createElement('span');
        text.className='route-complete-label';
        text.textContent='✓ Complete';
        label.appendChild(text);
      }
      label.title='Complete task (C or Space)';
    });

    root.querySelectorAll('.route-action-buttons [data-skip-route-action]').forEach(button=>{
      button.textContent='⏭ Skip';
      button.title='Skip task (S)';
      button.classList.add('skip');
    });
  }

  function currentRouteStep(){
    return document.querySelector('.route-step:not(.completed):not(.done)') ||
      document.querySelector('[data-route-action]')?.closest('.route-step');
  }

  document.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey)return;
    const target=event.target;
    if(target && (/INPUT|TEXTAREA|SELECT/.test(target.tagName)||target.isContentEditable))return;
    const step=currentRouteStep();
    if(!step)return;
    const key=event.key.toLowerCase();
    if(key==='c'||event.key===' '){
      const complete=step.querySelector('.route-complete input');
      if(complete){event.preventDefault();complete.click();}
    }else if(key==='s'){
      const skip=step.querySelector('[data-skip-route-action]');
      if(skip){event.preventDefault();skip.click();}
    }
  });

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType===Node.ELEMENT_NODE)normalizeRouteActions(node);
      }
    }
  });

  function start(){
    normalizeRouteActions();
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
