/* Ensure the five V20.2 relics are visible even while their official tiers are pending. */
(()=>{
  const relicNames=["Animal Wrangler","Devout","Icyenic Faith","Perkfection","Rejuvenated"];
  const PANEL_ID='rs3-v20-2-pending-relics';

  function plannerRoot(){
    const headings=[...document.querySelectorAll('h1,h2,h3')];
    const heading=headings.find(el=>/relic planner/i.test((el.textContent||'').trim()));
    if(!heading)return null;
    return heading.closest('main,[role="main"],section,.page,.content,.panel')||heading.parentElement;
  }

  function summaryFor(name){
    try{return (typeof RELIC_SUMMARY_PATCH!=='undefined'&&RELIC_SUMMARY_PATCH[name])||null;}catch{return null;}
  }

  function renderPending(){
    const root=plannerRoot();
    if(!root)return false;

    const pageText=(root.innerText||'').toLowerCase();
    const missing=relicNames.filter(name=>!pageText.includes(name.toLowerCase()));
    const old=document.getElementById(PANEL_ID);
    if(!missing.length){old?.remove();return true;}

    let panel=old;
    if(!panel){
      panel=document.createElement('section');
      panel.id=PANEL_ID;
      panel.style.cssText='margin-top:20px;padding:16px;border:1px solid rgba(70,210,125,.35);border-radius:12px;background:rgba(10,42,27,.72)';
      root.appendChild(panel);
    }

    panel.innerHTML='';
    const heading=document.createElement('div');
    heading.innerHTML='<h3 style="margin:0 0 4px;color:#f5efcf;font-size:18px">Additional relics</h3><p style="margin:0 0 14px;color:#9fc7ad;font-size:13px">Official tier placement is still pending.</p>';
    panel.appendChild(heading);

    const grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px';
    for(const name of missing){
      const data=summaryFor(name)||{};
      const card=document.createElement('article');
      card.setAttribute('data-relic-name',name);
      card.style.cssText='padding:14px;border:1px solid rgba(70,210,125,.28);border-radius:10px;background:#0b2116;color:#f4f0d2;box-shadow:0 4px 14px rgba(0,0,0,.18)';
      const category=data.category?`<span style="display:inline-block;margin-bottom:8px;padding:3px 8px;border-radius:999px;background:#174d31;color:#aef3c7;font-size:11px;font-weight:700">${data.category}</span>`:'';
      const benefits=data.benefits||data.notes||'Relic details are available in the companion data.';
      card.innerHTML=`${category}<h4 style="margin:0 0 7px;font-size:16px;color:#fff3c4">${name}</h4><p style="margin:0;color:#b8d4c1;font-size:12px;line-height:1.45">${benefits}</p>`;
      grid.appendChild(card);
    }
    panel.appendChild(grid);
    return true;
  }

  function run(){
    try{
      window.dispatchEvent(new CustomEvent('rs3:relics-updated',{detail:{count:15,names:relicNames}}));
      document.dispatchEvent(new CustomEvent('rs3:relics-updated',{detail:{count:15,names:relicNames}}));
    }catch{}
    renderPending();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  window.addEventListener('load',run,{once:true});
  document.addEventListener('click',event=>{
    const text=(event.target?.textContent||'').trim();
    if(/relic planner/i.test(text))setTimeout(run,80);
  });
  const observer=new MutationObserver(()=>{if(!document.getElementById(PANEL_ID))renderPending();});
  observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(run,250);
  setTimeout(run,1000);
})();
