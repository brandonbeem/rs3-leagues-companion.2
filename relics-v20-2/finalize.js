/* V20.2 relic expansion finalizer. */
(()=>{
 const VERSION='2026-08-04-v20-2-compact-five-relic-expansion';
 for(const patch of Object.values(RELIC_SUMMARY_PATCH)){
  patch.tier=null;
  patch.tierStatus='pending';
 }
 try{
  const marker='rs3-leagues-v20-2-relic-expansion-version';
  if(localStorage.getItem(marker)!==VERSION){
   localStorage.removeItem('rs3-leagues-relic-reference-version');
   localStorage.setItem(marker,VERSION);
  }
 }catch{}
})();
