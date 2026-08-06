(()=>{
  const REGION_DEFS=[
    {id:'tirannwn',names:['Tirannwn','Elven Lands'],color:'#5fc9cf',path:'M48 290 L58 261 L72 244 L92 238 L105 214 L126 203 L151 210 L161 233 L171 253 L163 277 L170 302 L151 329 L131 350 L103 348 L82 340 L68 324 L58 310 Z',fragments:['M41 265 L49 258 L55 266 L51 275 L43 274 Z','M87 210 L95 202 L104 206 L101 216 L91 218 Z'],label:[111,287],sub:'ELVEN LANDS'},
    {id:'fremennik',names:['Fremennik','Fremennik Province'],color:'#c07b32',path:'M103 108 L119 89 L145 78 L169 74 L190 82 L207 71 L231 82 L248 99 L269 113 L262 137 L252 159 L230 170 L201 174 L177 183 L149 170 L123 162 L110 142 Z',fragments:['M72 101 L86 89 L96 91 L96 105 L84 111 L74 108 Z','M56 128 L65 119 L76 121 L79 132 L68 140 L58 137 Z','M224 66 L232 56 L244 58 L247 68 L237 74 Z'],label:[186,126],sub:'PROVINCE'},
    {id:'kandarin',names:['Kandarin'],color:'#6549a5',path:'M119 193 L145 181 L170 184 L193 170 L222 176 L246 187 L270 190 L294 205 L306 228 L301 251 L309 274 L294 298 L282 322 L260 336 L235 348 L210 360 L186 351 L164 337 L145 324 L128 303 L115 282 L112 257 L118 234 Z',fragments:['M101 184 L112 172 L123 176 L120 188 L110 193 Z','M301 292 L316 286 L323 298 L316 309 L302 306 Z'],label:[211,263]},
    {id:'karamja',names:['Karamja'],color:'#4f9429',path:'M277 329 L295 318 L315 309 L334 318 L349 334 L364 346 L358 369 L355 393 L344 407 L321 414 L301 408 L286 395 L274 375 L269 352 Z',fragments:['M360 318 L370 312 L378 319 L375 328 L365 330 Z'],label:[319,365]},
    {id:'asgarnia',names:['Asgarnia'],color:'#c34d4d',path:'M290 170 L313 164 L335 155 L359 151 L378 160 L394 174 L410 188 L407 211 L413 235 L407 259 L411 280 L399 300 L386 320 L371 336 L349 329 L329 319 L311 314 L298 295 L285 277 L280 255 L284 230 L281 207 Z',fragments:['M273 157 L282 147 L294 151 L292 163 L281 168 Z'],label:[348,244]},
    {id:'wilderness',names:['Wilderness'],color:'#2e3334',path:'M365 87 L389 86 L411 87 L435 84 L457 86 L480 84 L505 86 L520 98 L535 112 L552 132 L548 153 L544 177 L541 204 L520 211 L499 220 L479 230 L456 219 L434 209 L412 195 L394 183 L377 166 L366 149 L370 126 Z',fragments:['M340 80 L352 72 L364 76 L363 88 L351 92 Z','M532 73 L545 65 L558 70 L557 84 L545 90 Z'],label:[454,145]},
    {id:'misthalin',names:['Misthalin'],color:'#2e66c9',path:'M405 224 L425 218 L447 214 L469 208 L491 210 L510 220 L530 231 L551 241 L553 262 L551 283 L552 315 L537 327 L522 340 L502 354 L481 348 L461 343 L438 337 L423 326 L410 312 L396 298 L390 282 L394 260 Z',fragments:['M493 196 L503 188 L514 191 L514 202 L504 207 Z'],label:[474,281]},
    {id:'morytania',names:['Morytania'],color:'#34743f',path:'M548 219 L568 224 L590 225 L612 229 L631 239 L647 251 L663 261 L684 272 L678 291 L670 313 L661 336 L642 342 L621 349 L600 356 L581 346 L564 335 L549 317 L551 296 L547 273 L550 246 Z',fragments:['M682 236 L694 229 L705 234 L704 246 L692 251 Z','M699 323 L710 316 L720 321 L718 332 L707 337 Z'],label:[611,282]},
    {id:'desert',names:['Kharidian Desert','Desert'],color:'#d6bd4d',path:'M436 349 L458 344 L480 341 L516 340 L534 351 L552 367 L574 389 L570 414 L565 441 L561 486 L548 501 L531 519 L505 538 L486 530 L462 518 L439 507 L428 486 L419 461 L405 425 L414 401 L423 376 Z',fragments:['M462 544 L474 537 L485 543 L482 554 L470 559 Z','M505 553 L516 548 L527 553 L525 565 L513 569 Z'],label:[491,421],sub:'DESERT'},
    {id:'anachronia',names:['Anachronia'],color:'#c985d3',path:'M670 74 L690 65 L714 57 L737 49 L760 52 L783 57 L811 65 L826 80 L838 95 L850 111 L846 133 L840 153 L832 174 L812 180 L794 188 L775 192 L755 185 L735 180 L710 171 L699 154 L685 141 L676 125 L678 102 Z',fragments:['M653 83 L663 76 L672 81 L669 91 L659 94 Z','M818 52 L827 43 L838 47 L838 58 L828 62 Z','M851 88 L862 81 L872 86 L870 97 L859 101 Z'],label:[760,119]},
    {id:'havenhythe',names:['Havenhythe'],color:'#815047',path:'M842 253 L861 247 L880 239 L900 231 L920 238 L938 247 L951 259 L956 279 L959 300 L960 337 L948 354 L938 370 L925 385 L904 383 L883 379 L865 372 L856 355 L847 338 L836 319 L839 298 L837 276 Z',fragments:['M820 272 L831 264 L841 269 L839 280 L828 284 Z','M944 221 L955 214 L966 219 L964 230 L953 234 Z'],label:[900,309]}
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
      const fragments=(def.fragments||[]).map(d=>`<path class="atlas-fragment" d="${d}"/>`).join('');
      return `<g class="${cls}" tabindex="0" role="button" aria-label="${def.names[0]} ${state.unlocked?'unlocked':'locked'}" data-atlas-region="${def.id}" style="--region-color:${def.color}"><path class="atlas-mainland" d="${def.path}"/>${fragments}${label}</g>`;
    }).join('');
    return `<div class="league-atlas-v2-legend"><span><i class="u"></i>Unlocked</span><span><i class="l"></i>Locked</span><span><i class="s"></i>Selected</span></div><div class="league-atlas-v2-wrap"><svg class="league-atlas-v2" viewBox="25 28 960 545" aria-label="Interactive League Atlas"><defs><pattern id="atlasHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="10" fill="#293130"/><rect width="3" height="10" fill="#202726"/></pattern></defs><path class="atlas-watermark" d="M97 246 C220 179 340 205 421 254 C512 307 610 230 731 184"/>${regions}</svg><p class="league-atlas-v2-note">Unlocked regions are illuminated. Select an available region to open its task list.</p></div>`;
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