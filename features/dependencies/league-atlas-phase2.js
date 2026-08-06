(()=>{
  const REGION_DEFS=[
    {id:'tirannwn',names:['Tirannwn','Elven Lands'],color:'#5fc9cf',path:'M62 278 L82 229 L131 214 L163 244 L160 305 L129 350 L81 344 Z',label:[111,286],sub:'ELVEN LANDS'},
    {id:'fremennik',names:['Fremennik','Fremennik Province'],color:'#c07b32',path:'M111 107 L152 75 L227 82 L269 120 L248 168 L189 181 L127 157 Z',label:[186,126],sub:'PROVINCE'},
    {id:'kandarin',names:['Kandarin'],color:'#6549a5',path:'M137 189 L216 170 L298 203 L309 272 L276 328 L209 360 L147 326 L113 265 Z',label:[211,262]},
    {id:'karamja',names:['Karamja'],color:'#4f9429',path:'M285 326 L328 309 L364 345 L354 405 L304 414 L272 372 Z',label:[319,362]},
    {id:'asgarnia',names:['Asgarnia'],color:'#c34d4d',path:'M294 171 L361 150 L409 187 L409 280 L375 335 L313 315 L281 258 Z',label:[347,244]},
    {id:'wilderness',names:['Wilderness'],color:'#2e3334',path:'M367 85 L506 85 L552 134 L542 205 L480 230 L407 193 L365 149 Z',label:[454,147]},
    {id:'misthalin',names:['Misthalin'],color:'#2e66c9',path:'M408 224 L490 208 L553 241 L551 316 L502 354 L425 335 L390 283 Z',label:[475,279]},
    {id:'morytania',names:['Morytania'],color:'#34743f',path:'M550 221 L629 229 L684 272 L661 336 L600 356 L548 316 Z',label:[611,282]},
    {id:'desert',names:['Kharidian Desert','Desert'],color:'#d6bd4d',path:'M439 348 L516 340 L574 389 L561 486 L504 538 L439 507 L405 425 Z',label:[490,424],sub:'DESERT'},
    {id:'anachronia',names:['Anachronia'],color:'#c985d3',path:'M673 73 L737 49 L812 66 L850 111 L832 174 L775 192 L710 171 L676 126 Z',label:[762,119]},
    {id:'havenhythe',names:['Havenhythe'],color:'#815047',path:'M846 254 L900 231 L951 260 L960 337 L925 385 L865 372 L836 319 Z',label:[899,309]}
  ];
  const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'');

  function findAtlasCard(){
    const heading=[...document.querySelectorAll('h1,h2,h3,h4,b,strong')].find(el=>/league atlas/i.test((el.textContent||'').trim()));
    if(!heading)return null;
    let node=heading;
    for(let i=0;i<6&&node;i++,node=node.parentElement){
      if(node.querySelector?.('svg')&&(node.innerText||'').toLowerCase().includes('unlocked regions'))return node;
    }
    return heading.parentElement;
  }

  function legacyRegionInfo(svg,def){
    const candidates=[...svg.querySelectorAll('g,path,polygon')];
    let target=null;
    for(const el of candidates){
      const text=(el.textContent||'').trim();
      const data=Object.values(el.dataset||{}).join(' ');
      const aria=el.getAttribute?.('aria-label')||'';
      const title=el.querySelector?.('title')?.textContent||'';
      const hay=norm([text,data,aria,title,el.id,el.getAttribute?.('class')].join(' '));
      if(def.names.some(name=>hay.includes(norm(name)))){target=el;break;}
    }
    if(!target){
      const textNode=[...svg.querySelectorAll('text')].find(el=>def.names.some(name=>norm(el.textContent).includes(norm(name))));
      target=textNode?.closest('g')||textNode?.parentElement||null;
    }
    if(!target)return {target:null,unlocked:def.id==='misthalin',selected:def.id==='misthalin'};
    const cls=(target.getAttribute?.('class')||'').toLowerCase();
    const path=target.matches?.('path,polygon')?target:target.querySelector?.('path,polygon');
    const fill=(path?.getAttribute('fill')||getComputedStyle(path||target).fill||'').toLowerCase();
    const stroke=(path?.getAttribute('stroke')||getComputedStyle(path||target).stroke||'').toLowerCase();
    const locked=/locked|disabled/.test(cls)||/rgb\((3[5-9]|4[0-9]|5[0-9]),\s*(3[5-9]|4[0-9]|5[0-9])/.test(fill);
    const selected=/selected|active|current/.test(cls)||stroke.includes('255, 216')||stroke.includes('#ffd');
    const unlocked=!locked&&(!/none|transparent/.test(fill)||/unlocked|active|selected/.test(cls));
    return {target,unlocked:selected||unlocked,selected};
  }

  function markup(states){
    const regions=REGION_DEFS.map(def=>{
      const state=states.get(def.id)||{};
      const cls=`atlas-region ${state.unlocked?'unlocked':'locked'} ${state.selected?'selected':''}`;
      const label=def.sub?`<text x="${def.label[0]}" y="${def.label[1]-7}">${def.names[0]}</text><text class="atlas-sub" x="${def.label[0]}" y="${def.label[1]+12}">${def.sub}</text>`:`<text x="${def.label[0]}" y="${def.label[1]}">${def.names[0]}</text>`;
      return `<g class="${cls}" tabindex="0" role="button" aria-label="${def.names[0]} ${state.unlocked?'unlocked':'locked'}" data-atlas-region="${def.id}" style="--region-color:${def.color}"><path d="${def.path}"/>${label}</g>`;
    }).join('');
    return `<div class="league-atlas-v2-legend"><span><i class="u"></i>Unlocked</span><span><i class="l"></i>Locked</span><span><i class="s"></i>Selected</span></div><div class="league-atlas-v2-wrap"><svg class="league-atlas-v2" viewBox="25 28 960 535" aria-label="Interactive League Atlas"><defs><pattern id="atlasHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="10" fill="#293130"/><rect width="3" height="10" fill="#202726"/></pattern></defs><path class="atlas-watermark" d="M97 246 C220 179 340 205 421 254 C512 307 610 230 731 184"/>${regions}</svg><p class="league-atlas-v2-note">Unlocked regions are illuminated. Select an available region to open its task list.</p></div>`;
  }

  function install(){
    const card=findAtlasCard();
    if(!card||card.dataset.atlasPhase2==='true')return false;
    const legacy=card.querySelector('svg');
    if(!legacy)return false;
    const states=new Map();
    REGION_DEFS.forEach(def=>states.set(def.id,legacyRegionInfo(legacy,def)));
    legacy.classList.add('league-atlas-legacy');
    const host=document.createElement('div');
    host.dataset.leagueAtlasPhase2='true';
    host.innerHTML=markup(states);
    legacy.insertAdjacentElement('afterend',host);
    host.querySelectorAll('[data-atlas-region]').forEach(region=>{
      const activate=()=>{
        const info=states.get(region.dataset.atlasRegion);
        if(!info?.unlocked)return;
        if(info.target){info.target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));}
        else window.dispatchEvent(new CustomEvent('rs3:league-region-selected',{detail:{regionId:region.dataset.atlasRegion}}));
        host.querySelectorAll('.atlas-region').forEach(el=>el.classList.toggle('selected',el===region));
      };
      region.addEventListener('click',activate);
      region.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
    });
    card.dataset.atlasPhase2='true';
    return true;
  }

  const run=()=>{if(!install())setTimeout(install,250)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  const observer=new MutationObserver(()=>{clearTimeout(observer._t);observer._t=setTimeout(()=>{const card=findAtlasCard();if(card&&!card.querySelector('[data-league-atlas-phase2]')){card.dataset.atlasPhase2='';install();}},120)});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('rs3:regions-updated',()=>{const card=findAtlasCard();if(card){card.querySelector('[data-league-atlas-phase2]')?.remove();card.dataset.atlasPhase2='';card.querySelector('svg')?.classList.remove('league-atlas-legacy');install();}});
})();