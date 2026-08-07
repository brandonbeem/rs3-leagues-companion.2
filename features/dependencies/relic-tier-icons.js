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
    'Survivalist':[1,0],
    'Golden Touch':[2,0],
    'Superheated':[3,0],
    'Divine Druid':[4,0],
    "Nature's Network":[0,1],
    "Assassin's Insight":[1,1],
    'Voidwalker':[2,1],
    'Crystal Grace':[3,1],
    'Transmutation':[4,1]
  };

  globalThis.RS3_RELIC_TIER_ICONS=Object.assign({},globalThis.RS3_RELIC_TIER_ICONS||{},ICONS);

  function spriteMarkup(name){
    const cell=REPLACEMENTS[name];
    if(!cell)return '';
    const [column,row]=cell;
    const x=-(column*128+8);
    const y=-(row*112);
    return `<svg viewBox="0 0 112 112" width="100%" height="100%" aria-hidden="true" focusable="false" data-supplied-relic-icon="true"><image href="${REPLACEMENT_SPRITE}" x="${x}" y="${y}" width="640" height="224" preserveAspectRatio="none"></image></svg>`;
  }

  function imageMarkup(name){
    if(REPLACEMENTS[name])return spriteMarkup(name);
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
