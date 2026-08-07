/* User-supplied Equilibrium relic artwork for the tiered Relic Planner. */
(()=>{
  const ICONS={
    'Animal Wrangler':'features/dependencies/relic-icons/animal-wrangler.png',
    'Antiquarian':'features/dependencies/relic-icons/antiquarian.png',
    'Clue Connoisseur':'features/dependencies/relic-icons/clue-connoisseur.png',
    'Production Master':'features/dependencies/relic-icons/production-master.png',
    'Devout':'features/dependencies/relic-icons/devout.png',
    'Perkfection':'features/dependencies/relic-icons/perkfection.png',
    'Rejuvenated':'features/dependencies/relic-icons/rejuvenated.png',
    'Infernal Fire':'features/dependencies/relic-icons/infernal-fire.png',
    'Naragi Edict':'features/dependencies/relic-icons/naragi-edict.png',
    'Icyenic Faith':'features/dependencies/relic-icons/icyenic-faith.png'
  };
  const REPLACEMENT_SPRITE='features/dependencies/relic-icons/original-ten-replacements.webp';
  const REPLACEMENTS={
    'Endless Harvest':[0,0],
    'Survivalist':[25,0],
    'Golden Touch':[50,0],
    'Superheated':[75,0],
    'Divine Druid':[100,0],
    "Nature's Network":[0,100],
    "Assassin's Insight":[25,100],
    'Voidwalker':[50,100],
    'Crystal Grace':[75,100],
    'Transmutation':[100,100]
  };
  globalThis.RS3_RELIC_TIER_ICONS=Object.assign({},globalThis.RS3_RELIC_TIER_ICONS||{},ICONS);

  function imageMarkup(name){
    const pos=REPLACEMENTS[name];
    if(pos){
      return `<span aria-hidden="true" data-supplied-relic-icon="true" style="display:block;width:100%;height:100%;background-image:url('${REPLACEMENT_SPRITE}');background-repeat:no-repeat;background-size:500% 200%;background-position:${pos[0]}% ${pos[1]}%"></span>`;
    }
    const src=ICONS[name];
    return src?`<img src="${src}" alt="${name} relic icon" loading="lazy" data-supplied-relic-icon="true">`:'';
  }

  function hasArtwork(name){return Boolean(REPLACEMENTS[name]||ICONS[name]);}

  function apply(){
    document.querySelectorAll('.relic-tier-card[data-tier-relic]').forEach(card=>{
      const name=card.dataset.tierRelic;
      const host=card.querySelector('.relic-tier-card-icon');
      if(!host||!hasArtwork(name)||host.querySelector('[data-supplied-relic-icon="true"]'))return;
      host.innerHTML=imageMarkup(name);
    });

    const drawer=document.querySelector('.relic-tier-drawer.open');
    if(drawer){
      const name=(drawer.querySelector('.relic-drawer-identity h2')?.textContent||'').trim();
      const host=drawer.querySelector('.relic-drawer-icon');
      if(host&&hasArtwork(name)&&!host.querySelector('[data-supplied-relic-icon="true"]'))host.innerHTML=imageMarkup(name);
    }
  }

  let timer=null;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(apply,40);};
  const observer=new MutationObserver(schedule);
  function init(){apply();observer.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('rs3:relics-updated',schedule);
  window.addEventListener('rs3:navigation-changed',schedule);
})();
