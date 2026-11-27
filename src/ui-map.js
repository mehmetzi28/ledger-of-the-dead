// ===== R19 PR A: the Valley map view (Gates tab, "Valley map") =====
// An SVG painting of the valley from VALLEY_NODES and VALLEY_ROADS (game-map.js): roads as dotted lines with their steps,
// known places as marks with their names, unknown ones as smudges, the hero's marker where you stand. A press on a place opens
// its card; the list under the map holds the same places as buttons, for the keyboard and small screens.
const MAP_GLYPH={town:'M-2.6 1.8V-.6L0-2.6L2.6-.6V1.8Z',gate:'M-2.2 2.4V-.8A2.2 2.2 0 0 1 2.2-.8V2.4Z',tower:'M-1.3 2.6V-1.6L0-3.2L1.3-1.6V2.6Z',
  grave:'M-.5-2.8H.5V-1.4H1.8V-.4H.5V2.6H-.5V-.4H-1.8V-1.4H-.5Z',field:'M-2.4 2.2L-.6-2.4L.2-.2L1.2-1.8L2.4 2.2Z',
  shrine:'M-2 2.4H2V1.4H1.2V-1H-1.2V1.4H-2ZM0-1.4C-1-2.2 0-3.2 0-3.2S1-2.2 0-1.4Z',cross:'M-.4 2.6V-2.6H.4V2.6ZM-2.2-2.2H1.6L2.4-1.6L1.6-1H-2.2ZM2.2.2H-1.6L-2.4.8L-1.6 1.4H2.2Z',
  hermit:'M-2.4 2.4V0L0-2.4L2.4 0V2.4H.6V.8H-.6V2.4Z',mine:'M-2.6 2.4A2.6 2.6 0 0 1 2.6 2.4H1.2A1.2 1.2 0 0 0-1.2 2.4ZM-1.8-2.6L1.8-1.4L1.6-.9L-2-2.1Z',
  gallows:'M-1.8 2.6V-2.6H1.8V-1.8H-1V2.6ZM1.2-1.8H1.6V-.2H1.2Z',stones:'M-2.6 2.4V-.6L-1.8-1.4L-1 -.6V2.4ZM-.6 2.4V-2L0-2.8L.6-2V2.4ZM1 2.4V-1L1.8-1.8L2.6-1V2.4Z',
  ford:'M-2.6-.8Q-1.3-1.8 0-.8T2.6-.8V0Q1.3-1 0 0T-2.6 0ZM-2.6 1.2Q-1.3.2 0 1.2T2.6 1.2V2Q1.3 1 0 2T-2.6 2Z',den:'M-2.4 2.4L-1.6-1.6L-.8.6L0-2.6L.8.6L1.6-1.6L2.4 2.4Z'};
const KIND_NAME={town:'Your town',gate:'A gate',tower:'The Tower',grave:'An old graveyard',field:'A battlefield',shrine:'A ruined shrine',cross:'A crossroads',hermit:'A hermit\'s hut',mine:'An old mine',gallows:'A gallows',stones:'Standing stones',ford:'A ford',den:'A wolf den'};
const stepTxt=n=>n+' step'+(n===1?'':'s');
function tripNote(id){   // what the walk costs: "2 steps", "2 steps: spends a watch", or nothing where you stand
  if(!MAP_ON) return ''; const d=tripSteps(id); if(!d) return ''; if(d===Infinity) return 'off the known roads';
  const w=Math.floor((((S.map&&S.map.st)||0)+d)/MAP_STEP); return stepTxt(d)+(w?': spends '+(w>1?w+' watches':'a watch'):'');
}
function tripTag(id){ const t=tripNote(id); return t?' &middot; '+t:''; }
function mapPlanHTML(){   // today's watches and steps as pips
  let w=''; for(let i=0;i<WATCHES;i++) w+='<i class="pip'+(i<S.watches?' on':'')+'"></i>'; let s=''; const st=(S.map&&S.map.st)||0; for(let i=0;i<MAP_STEP;i++) s+='<i class="spip'+(i<st?' on':'')+'"></i>';
  return '<div class="map-plan"><span title="Each run takes a watch.">Watches '+w+'</span><span title="Every '+MAP_STEP+' steps walked spend a watch. You are pulled home at dawn.">Steps toward a watch '+s+'</span><span>You stand at <b>'+nodeName(mapPos())+'</b></span></div>';
}
function mapSVG(){
  const pos=mapPos(), sel=ui.vsel&&VALLEY_NODES[ui.vsel]?ui.vsel:pos, N=VALLEY_NODES, seen=id=>mapSeen(id);
  let h='<svg class="vmap" viewBox="0 0 100 76" role="img" aria-label="Map of the valley"><defs><radialGradient id="vlm" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#3a3024"/><stop offset="1" stop-color="#17120d"/></radialGradient>'
    +'<filter id="vsm"><feGaussianBlur stdDeviation="1.4"/></filter></defs><rect width="100" height="76" rx="2" fill="url(#vlm)"/>'
    +'<path class="v-river" d="M100 44C88 46 80 52 70 56S52 66 30 76" fill="none" stroke="#2e3a36" stroke-width="2.4" opacity=".7"/>'
    +'<path class="v-hills" d="M0 14C10 8 18 12 26 7S44 4 50 2M62 4C70 8 82 5 100 10" fill="none" stroke="#4a3d2c" stroke-width="1.2" opacity=".8"/>';
  for(const [p,q,n] of VALLEY_ROADS){ const a=N[p], b=N[q], both=seen(p)&&seen(q); if(!seen(p)&&!seen(q)) continue;
    h+='<line class="v-road'+(both?'':' faint')+'" x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'"/>'+(both?'<text class="v-steps" x="'+((a.x+b.x)/2)+'" y="'+((a.y+b.y)/2-.8)+'">'+n+'</text>':''); }
  for(const id of MAP_IDS){ const n=N[id];
    if(!seen(id)){ const sc=scoutable().includes(id); h+=sc?'<g class="v-fog scout'+(id===sel?' sel':'')+'" data-a="vnode" data-k="'+id+'"><title>An unknown place</title><ellipse cx="'+n.x+'" cy="'+n.y+'" rx="4" ry="2.6" filter="url(#vsm)"/><text class="v-q" x="'+n.x+'" y="'+(n.y+1)+'">?</text></g>':'<ellipse class="v-fog" cx="'+n.x+'" cy="'+n.y+'" rx="4" ry="2.6" filter="url(#vsm)"/>'; continue; }
    const rest=(n.k==='grave'||n.k==='field'||isSite(id))&&!siteReady(id);
    h+='<g class="v-node k-'+n.k+(id===sel?' sel':'')+(rest?' rest':'')+'" data-a="vnode" data-k="'+id+'" transform="translate('+n.x+' '+n.y+')"><title>'+nodeName(id)+'</title><circle r="3.6"/><path d="'+MAP_GLYPH[n.k]+'"/>'
      +'<text class="v-name" y="6.4">'+nodeName(id)+'</text></g>'; }
  const sr=mapSiegeRoad(); if(sr&&MAP_SIEGE_FROM[sr]){ const f=MAP_SIEGE_FROM[sr]; h+='<line class="v-siege" x1="'+f[0]+'" y1="'+f[1]+'" x2="'+N.T.x+'" y2="'+N.T.y+'"><title>Tonight\'s siege comes by this road</title></line>'; }
  for(const o of mapSquads()){ const a=N[o.at]; h+='<g class="v-squad" transform="translate('+(a.x+3.4)+' '+(a.y-3.4)+')"><title>Your squad is in the field here</title><path d="M-.3 1.6V-1.8H1.6L1-1.2L1.6-.6H.3V1.6Z"/></g>'; }
  for(const o of mapNems()){ const a=N[o.at]; h+='<g class="v-nem" transform="translate('+(a.x-3.6)+' '+(a.y-3.4)+')"><title>'+o.n.name+' walks here</title><circle r="1.3"/></g>'; }
  const E=S.map&&S.map.enc; if(E&&N[E.s]){ const a=N[E.s]; h+='<g class="v-enc" data-a="vnode" data-k="enc" transform="translate('+a.x+' '+(a.y+3.4)+')"><title>Something waits on the road</title><circle r="1.6"/><text y=".9">!</text></g>'; }
  const p=N[pos]; h+='<g class="v-me" transform="translate('+p.x+' '+(p.y-5.2)+')"><path d="M0 2.2L-1.6-.6A1.9 1.9 0 1 1 1.6-.6Z"/></g>';
  return h+'</svg>';
}
function siteText(id){
  const n=VALLEY_NODES[id];
  if(n.k==='grave'){ const r=siteRest(id); return 'Old bones of the '+DUNGEONS[nearGate(id)].name+'\'s kinds: '+MAP_GY_N[0]+' to '+MAP_GY_N[1]+' bodies to raise before dawn, '+MAP_OLD+'% harder to raise. '+(r?'Dug over: ready in '+r+' day'+(r>1?'s':'')+'.':'Ready to dig.'); }
  if(isSite(id)){ const r=siteRest(id), rest=r?' It rests: ready in '+r+' day'+(r>1?'s':'')+'.':'';
    const T={shrine:'A ruined shrine to '+(FAITH[n.g]||{}).name+'. Pray here if it is your god; swear or convert if not.',cross:'Roads meet here, and so do strangers. Each day brings someone new.',
      hermit:'An old man who knew the valley before the Ledger. He trades what he knows for trophies.',mine:'Iron foes still dig in the dark, two rooms down. Ore from here makes heart-forging cheaper.',
      gallows:'The hanged swing in the wind. Some were hexers.',stones:'Nine stones in a ring. Here you may call tomorrow\'s omen, once a week.',ford:'A ferryman, and the drowned under the water.',
      den:'Beasts the gates never made: wolves, crows and a bear. Their pelts make charms.'};
    return T[n.k]+rest; }
  if(n.k==='field') return 'The fallen of the last siege lie here: '+MAP_BF_N[0]+' to '+MAP_BF_N[1]+' fresh bodies, '+MAP_FRESH+'% easier to raise. '+(siteReady(id)?'Fresh dead wait.':'Nothing here until the next siege.');
  return '';
}
function siteCardHTML(id){   // a site of PR B: its text and its choices
  const n=VALLEY_NODES[id], note=tripNote(id), rdy=siteReady(id), far=!mapCan(id,siteNeed(id))&&id!==mapPos();
  let h='<p>'+siteText(id)+'</p>'; if(n.k==='mine'&&(S.map&&S.map.ore)) h+='<p class="u-sub">Ore held: '+S.map.ore+' (heart-forging '+Math.round(ORE_K*100*oreUse())+'% cheaper)</p>';
  if(n.k==='den'&&(S.map&&S.map.pelt)) h+='<p class="u-sub">Pelts: '+S.map.pelt+'/'+DEN_PELTS+'</p>';
  if(!rdy) return h; const O=siteOpts(id); if(!O.length) return h;
  return h+'<div class="btns v-opts">'+O.map(o=>{ const why=o.why||(far?'Too far for the watches left today':''); return '<button class="btn small'+(o.k==='fight'?' primary':'')+'" data-a="vpick" data-k="'+id+'|'+o.k+'"'+(why?' disabled title="'+why.replace(/\.$/,'')+'"':'')+'>'+o.t+(note?' &middot; '+stepTxt(tripSteps(id)):'')+'</button>'; }).join('')+'</div>';
}
function scoutCardHTML(id){ const why=scoutWhy(id);
  return '<div class="v-card"><h3>An unknown place</h3><p class="u-sub">A road leads there from a place you know.</p><div class="btns"><button class="btn primary" data-a="vscout" data-k="'+id+'"'+(why?' disabled title="'+why.replace(/\.$/,'')+'"':'')+'>Scout it &middot; '+stepTxt(SCOUT_STEPS)+'</button></div></div>'; }
function encCardHTML(){ const E=S.map&&S.map.enc; if(!E) return '';
  return '<div class="v-card v-enc-card"><h3>On the road</h3><p>'+encText(E)+'</p><div class="btns">'+encOpts().map(o=>'<button class="btn small'+(o.k==='fight'?' primary':'')+'" data-a="venc" data-k="'+o.k+'"'+(o.why?' disabled title="'+o.why.replace(/\.$/,'')+'"':'')+'>'+o.t+'</button>').join('')+'</div></div>'; }
function nodeCardHTML(id){
  if(id==='enc') return encCardHTML(); if(!mapSeen(id)) return scoutCardHTML(id);
  const n=VALLEY_NODES[id], here=id===mapPos(), can=mapCan(id,1), note=tripNote(id), away=!can&&!here?' disabled title="Too far for the watches left today"':'';
  let h='<div class="v-card"><h3>'+nodeName(id)+'</h3><p class="u-sub">'+KIND_NAME[n.k]+(here?' &middot; you stand here':note?' &middot; '+note:'')+'</p>';
  if(n.k==='gate'){ const i=n.g, locked=gateLocked(i);
    h+=(locked?'<p class="q-note">Not open to you yet.</p>':'<div class="btns"><button class="btn primary" data-a="enter" data-k="'+i+'"'+away+'>Enter'+(note?' &middot; '+stepTxt(tripSteps(id)):'')+'</button>'+(i===5&&riftOpen()?'<button class="btn small" data-a="gsub" data-k="rift">The Rift lies under it</button>':'')+'</div>'); }
  if(n.k==='tower') h+='<div class="btns"><button class="btn primary" data-a="tab" data-k="tower">Climb from the Tower tab</button></div>';
  if(n.k==='town') h+='<p class="q-note">Buildings, the market and your army wait here whatever road you stand on. The Ledger pulls you home at dawn.</p>';
  if(isSite(id)) h+=siteCardHTML(id);
  if(n.k==='grave'||n.k==='field') h+='<p>'+siteText(id)+'</p>'+(siteReady(id)?'<div class="btns"><button class="btn primary" data-a="vsite" data-k="'+id+'"'+away+'>'+(n.k==='grave'?'Dig':'Walk the field')+(note?' &middot; '+stepTxt(tripSteps(id)):'')+'</button></div>':'');
  return h+'</div>';
}
function dugHTML(){   // the bodies dug today, raised in town before dawn
  const B=(S.map&&S.map.bodies)||[]; if(!B.length) return '';
  return '<div class="v-dug"><p class="group-h">Bodies from the valley &middot; until dawn</p>'+B.map((x,i)=>{ const c=x.c, ch=raiseChance(Object.assign({},c));
    return '<div class="tt-row"><div><h4>'+cleanText(c.name)+' &middot; Lv '+c.lvl+'</h4><div class="u-sub">'+(c.old?'Old bones':'Fresh dead')+' from '+nodeName(x.s)+' &middot; '+ch+'% to rise</div></div><button class="btn small primary" data-a="vraise" data-k="'+i+'"'+(armyRoom()||reserveRoom()?'':' disabled title="Your army and Reserve are full"')+'>Raise</button></div>'; }).join('')+'</div>';
}
function valleyHTML(){
  const pos=mapPos(), E=S.map&&S.map.enc, sel=ui.vsel==='enc'&&E?'enc':ui.vsel&&VALLEY_NODES[ui.vsel]&&(mapSeen(ui.vsel)||scoutable().includes(ui.vsel))?ui.vsel:pos, known=MAP_IDS.filter(mapSeen);
  return '<section class="win" aria-labelledby="h-valley"><h2 class="win-h" id="h-valley">The valley</h2>'+mapPlanHTML()+(MAP_ON?'':'<p class="q-note">The map is off: every road is free.</p>')
   +'<div class="vmap-wrap">'+mapSVG()+'</div>'+(E&&sel!=='enc'?encCardHTML():'')+nodeCardHTML(sel)+dugHTML()
   +'<p class="group-h">Known places &middot; '+known.length+'/'+MAP_IDS.length+'</p><div class="chips v-list">'+known.map(id=>'<button class="btn small'+(id===sel?' primary':'')+'" data-a="vnode" data-k="'+id+'" aria-pressed="'+(id===sel)+'">'+nodeName(id)+(tripSteps(id)?' &middot; '+tripSteps(id):'')+'</button>').join('')+'</div>'
   +'<div class="btns"><button class="btn small" data-a="rest">Rest until dawn</button></div></section>';
}
function cxValleyHTML(){   // the Codex page: travel, fog and the sites, read from the tables
  const gy=MAP_IDS.filter(id=>VALLEY_NODES[id].k==='grave').length, bf=MAP_IDS.filter(id=>VALLEY_NODES[id].k==='field').length;
  return cxP('The Valley map on the Gates tab shows the valley as a place: your town, the gates, the Hell Tower and the sites between them, joined by roads of 1 to 3 steps. The Gates list still starts every gate; its cards show the road.')
   +'<p class="group-h">Travel</p>'+cxList([cxRow('Where you stand','A run from the place you stand on costs no travel. From anywhere else you walk the road first, by the fewest steps. After a run you stand at that gate.'),
     cxRow('Steps and watches','Every '+MAP_STEP+' steps walked in a day spend a watch. Steps left over count toward the next. A walk that would leave no watch for the run is refused.'),
     cxRow('Home','At dawn the Ledger pulls you home to the town, with no steps carried over. Town work needs no walking.'),
     cxRow('The Rift and the Tower','The Rift lies under the Throne of Ash; the Hell Tower stands at the north end of the valley.')])
   +'<p class="group-h">Fog</p>'+cxP('The town, the Rat Warren and the Sunken Crypt are known from the start. A gate is known once it is open to you. Clearing a gate shows the places next to it.')
   +'<p class="group-h">Sites</p>'+cxList([cxRow('Old graveyards ('+gy+')','Dig: '+MAP_GY_N[0]+' to '+MAP_GY_N[1]+' old bodies of the nearest gate\'s kinds, '+MAP_OLD+'% harder to raise. Then the graveyard rests '+MAP_GY_REST+' days.'),
     cxRow('Battlefields ('+bf+')','After each siege, won or lost, each holds '+MAP_BF_N[0]+' to '+MAP_BF_N[1]+' of the fallen living, '+MAP_FRESH+'% easier to raise. Once walked, a field is empty until the next siege.'),
     cxRow('Dug bodies','They wait in the valley view until dawn and rise in town at no mana, into the army or, when it is full, the Reserve. At dawn the rest crumble.'),
     cxRow('Visiting','The walk to a site must leave you a watch: the day never ends on the road. A choice keeps that watch; a fight (the mine, the den) spends it.')])
   +'<p class="group-h">The other sites</p>'+cxList([cxRow('Ruined shrines (5)','One for each god. Pray at your own for '+DEV_SHRINE+' devotion; swear your oath at one if you have none; convert at another\'s; the Profane may desecrate one for gold. Then it rests '+SITE_REST.shrine+' days.'),
     cxRow('The Crossroads','Each day a different stranger: a pedlar (a potion at half price), a bounty-man ('+BOUNTY_TRO+' trophies of one kind for gold), or a stranger with a raven ('+RAVEN_GOLD+' gold; once you have it, a map-seller). Rests '+SITE_REST.cross+' days.'),
     cxRow('The Hermit\'s Hut',HERMIT_TRO+' trophies of one kind for a torn page, or for a lesson: the kind you are closest to studying is studied at once. Rests '+SITE_REST.hermit+' days.'),
     cxRow('The Old Iron Mine','A fight of two rooms against the Iron Orchard\'s kinds at your best gate\'s level. It pays 1 or 2 ore (you hold at most '+ORE_HOLD+'). Each ore makes heart-forging '+Math.round(ORE_K*100)+'% cheaper, up to '+ORE_MAX+' a forging, and is spent. Rests '+SITE_REST.mine+' days.'),
     cxRow('Gallows Hill','Cut down a hanged hexer of the nearest gate (a body to raise before dawn), or sing for the hanged: the Choir\'s devotion, or for anyone else the town\'s dread falls by '+GALLOWS_DREAD+'. Rests '+SITE_REST.gallows+' days.'),
     cxRow('The Nine Stones','Call tomorrow\'s omen from three of the gods\' omens, sworn or not. Rests '+SITE_REST.stones+' days.'),
     cxRow('The Ford','Pay the ferryman ('+FORD_TOLL+' gold a level): every walk of 2 steps or more costs a step less for the rest of the day. Or search the shallows for a drowned body, Preserved. Rests '+SITE_REST.ford+' days.'),
     cxRow('The Wolf Den','A fight with beasts the gates never made: the Grave Bear, Dire Wolves and Carrion Crows. Every '+DEN_PELTS+' clears make a charm of one of their kits. Rests '+SITE_REST.den+' days.')])
   +'<p class="group-h">On the road</p>'+cxP('Every step walked has a '+Math.round(ENC_CH*100)+'% chance to meet something ('+Math.round((ENC_CH+ENC_TERROR)*100)+'% when the town is in Terror). It waits on the Valley map until dawn: a patrol of the living (fight, or bribe), a wandering elite of the nearest gate (fight), a corpse cart ('+CART_N+' bodies for gold), or a pilgrim (let go: the town\'s dread falls by '+PILGRIM_DREAD+'; or take the body: it rises). A fight on the road costs no watch.')
   +'<p class="group-h">Scouting</p>'+cxList([cxRow('Scout','An unknown place next to a known one can be scouted from the map for '+SCOUT_STEPS+' step. You stay where you stand.'),
     cxRow('The War Room','At level 2 its scouts find one unknown place each dawn.'),
     cxRow('The raven','Bought from the stranger at the Crossroads, or nesting in the Library at level 3. It finds one unknown place each dawn and shows where the nemeses walk.'),
     cxRow('Also on the map','Your squads in the field, and on a siege\'s eve the road the living will come by.')]);
}
