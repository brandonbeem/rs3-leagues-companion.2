/* Refresh the Relic Planner after the five V20.2 relic patches load. */
(()=>{
  const relicNames=["Animal Wrangler","Devout","Icyenic Faith","Perkfection","Rejuvenated"];

  function relicTab(){
    return [...document.querySelectorAll('button,[role="tab"],a')]
      .find(el=>/relic planner/i.test((el.textContent||'').trim()));
  }

  function visibleRelicNames(){
    const text=(document.body?.innerText||'').toLowerCase();
    return relicNames.filter(name=>text.includes(name.toLowerCase())).length;
  }

  function refresh(){
    try{
      window.dispatchEvent(new CustomEvent('rs3:relics-updated',{detail:{count:15,names:relicNames}}));
      document.dispatchEvent(new CustomEvent('rs3:relics-updated',{detail:{count:15,names:relicNames}}));
    }catch{}

    const tab=relicTab();
    if(!tab)return;
    const active=tab.classList.contains('active')||tab.getAttribute('aria-selected')==='true';
    if(active&&visibleRelicNames()<5){
      tab.click();
      setTimeout(()=>tab.click(),60);
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,80),{once:true});
  }else{
    setTimeout(refresh,80);
  }
  window.addEventListener('load',()=>setTimeout(refresh,180),{once:true});
  setTimeout(refresh,600);
})();
