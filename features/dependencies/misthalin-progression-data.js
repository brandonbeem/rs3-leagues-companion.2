/* Misthalin progression knowledge used privately by the simple Route Planner.
 * Locations influence ranking only; the player-facing list never gives travel directions.
 */
(function(root){
  const clusters=[
    {id:'lumbridge-castle',area:'Lumbridge',stage:0,tags:['tutorial','castle','cook','range','bank','duke','hans','lodestone','spinning wheel'],skills:['Cooking','Crafting']},
    {id:'lumbridge-town',area:'Lumbridge',stage:0,tags:['tree','logs','fire','shop','furnace','anvil','church','altar','bones'],skills:['Woodcutting','Firemaking','Smithing','Prayer']},
    {id:'lumbridge-farms',area:'Lumbridge',stage:0,tags:['chicken','cow','egg','feather','milk','beef','cowhide','bones'],skills:['Combat','Prayer','Cooking','Crafting']},
    {id:'lumbridge-river-swamp',area:'Lumbridge',stage:0,tags:['shrimp','crayfish','fish','fishing','swamp','water altar'],skills:['Fishing','Cooking','Runecrafting']},
    {id:'lumbridge-swamp-mine',area:'Lumbridge',stage:0,tags:['copper','tin','clay','ore','mine','mining'],skills:['Mining','Smithing']},
    {id:'draynor-village',area:'Draynor Village',stage:1,tags:['willow','market','stall','seed','bank','fishing','jail','manor'],skills:['Woodcutting','Thieving','Fishing','Farming']},
    {id:'wizards-tower',area:"Wizards' Tower",stage:1,tags:['wizard','runespan','rune','runecrafting','tower'],skills:['Runecrafting','Magic']},
    {id:'archaeology-campus',area:'Archaeology Campus',stage:1,tags:['archaeology','tutorial','dig site','excavate','restore','artefact','museum'],skills:['Archaeology']},
    {id:'varrock-south',area:'Varrock',stage:1,tags:['varrock','museum','dog','sewer','mine','earth altar'],skills:['Archaeology','Mining','Runecrafting','Combat']},
    {id:'varrock-central',area:'Varrock',stage:2,tags:['grand exchange','palace','cooks guild','champions guild','bank','anvil','furnace'],skills:['Cooking','Smithing','Combat']},
    {id:'edgeville',area:'Edgeville',stage:2,tags:['edgeville','monastery','dungeon','stronghold'],skills:['Prayer','Combat','Mining']},
    {id:'fort-forinthry',area:'Fort Forinthry',stage:2,tags:['fort forinthry','workshop','town hall','command centre','construction'],skills:['Construction','Necromancy']},
    {id:'city-of-um',area:'City of Um',stage:2,tags:['city of um','ritual','glyph','well of souls','necromancy'],skills:['Necromancy','Runecrafting']}
  ];
  function text(task){return `${task?.task||''} ${task?.information||''} ${task?.requirements||''} ${task?.locality||''}`.toLowerCase()}
  function clusterFor(task){
    const value=text(task);let best=null,bestHits=0;
    for(const cluster of clusters){const hits=cluster.tags.reduce((n,tag)=>n+(value.includes(tag)?1:0),0);if(hits>bestHits){best=cluster;bestHits=hits}}
    return best||clusters[0];
  }
  root.RS3_MISTHALIN_PROGRESSION={version:'1.0',start:'lumbridge-castle',clusters,clusterFor};
})(globalThis);
