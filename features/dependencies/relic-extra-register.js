/* Register normalized extra relic data after the extensible planner registry loads. */
(()=>{
  function apply(){
    const registry=globalThis.RS3_RELIC_REGISTRY;
    const relics=globalThis.RS3_EXTRA_RELICS||[];
    if(!registry||!relics.length)return false;
    relics.forEach(relic=>registry.register(relic));
    registry.refresh();
    return true;
  }
  if(!apply()){
    let attempts=0;
    const timer=setInterval(()=>{
      attempts+=1;
      if(apply()||attempts>=20)clearInterval(timer);
    },100);
  }
})();
