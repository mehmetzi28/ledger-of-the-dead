// ===== R19 PR A: the Valley map view (Gates tab, "Valley map") =====
// An SVG painting of the valley from VALLEY_NODES and VALLEY_ROADS (game-map.js): roads as dotted lines with their steps,
// known places as marks with their names, unknown ones as smudges, the hero's marker where you stand. A press on a place opens
// its card; the list under the map holds the same places as buttons, for the keyboard and small screens.
const MAP_GLYPH={town:'M-2.6 1.8V-.6L0-2.6L2.6-.6V1.8Z',gate:'M-2.2 2.4V-.8A2.2 2.2 0 0 1 2.2-.8V2.4Z',tower:'M-1.3 2.6V-1.6L0-3.2L1.3-1.6V2.6Z',
  grave:'M-.5-2.8H.5V-1.4H1.8V-.4H.5V2.6H-.5V-.4H-1.8V-1.4H-.5Z',field:'M-2.4 2.2L-.6-2.4L.2-.2L1.2-1.8L2.4 2.2Z'};
const KIND_NAME={town:'Your town',gate:'A gate',tower:'The Tower',grave:'An old graveyard',field:'A battlefield'};
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
  let h='<svg class="vmap" viewBox="0 0 100 70" role="img" aria-label="Map of the valley"><defs><radialGradient id="vlm" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#3a3024"/><stop offset="1" stop-color="#17120d"/></radialGradient>'
    +'<filter id="vsm"><feGaussianBlur stdDeviation="1.4"/></filter></defs><rect width="100" height="70" rx="2" fill="url(#vlm)"/>'
    +'<path class="v-river" d="M100 44C88 46 80 52 70 56S52 66 40 68" fill="none" stroke="#2e3a36" stroke-width="2.4" opacity=".7"/>'
    +'<path class="v-hills" d="M0 14C10 8 18 12 26 7S44 4 50 2M62 4C70 8 82 5 100 10" fill="none" stroke="#4a3d2c" stroke-width="1.2" opacity=".8"/>';
  for(const [p,q,n] of VALLEY_ROADS){ const a=N[p], b=N[q], both=seen(p)&&seen(q); if(!seen(p)&&!seen(q)) continue;
    h+='<line class="v-road'+(both?'':' faint')+'" x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'"/>'+(both?'<text class="v-steps" x="'+((a.x+b.x)/2)+'" y="'+((a.y+b.y)/2-.8)+'">'+n+'</text>':''); }
  for(const id of MAP_IDS){ const n=N[id];
    if(!seen(id)){ h+='<ellipse class="v-fog" cx="'+n.x+'" cy="'+n.y+'" rx="4" ry="2.6" filter="url(#vsm)"/>'; continue; }
    const rest=(n.k==='grave'||n.k==='field')&&!siteReady(id);
    h+='<g class="v-node k-'+n.k+(id===sel?' sel':'')+(rest?' rest':'')+'" data-a="vnode" data-k="'+id+'" transform="translate('+n.x+' '+n.y+')"><title>'+nodeName(id)+'</title><circle r="3.6"/><path d="'+MAP_GLYPH[n.k]+'"/>'
      +'<text class="v-name" y="6.4">'+nodeName(id)+'</text></g>'; }
  const p=N[pos]; h+='<g class="v-me" transform="translate('+p.x+' '+(p.y-5.2)+')"><path d="M0 2.2L-1.6-.6A1.9 1.9 0 1 1 1.6-.6Z"/></g>';
  return h+'</svg>';
}
function siteText(id){
  const n=VALLEY_NODES[id];
  if(n.k==='grave'){ const r=siteRest(id); return 'Old bones of the '+DUNGEONS[nearGate(id)].name+'\'s kinds: '+MAP_GY_N[0]+' to '+MAP_GY_N[1]+' bodies to raise before dawn, '+MAP_OLD+'% harder to raise. '+(r?'Dug over: ready in '+r+' day'+(r>1?'s':'')+'.':'Ready to dig.'); }
  if(n.k==='field') return 'The fallen of the last siege lie here: '+MAP_BF_N[0]+' to '+MAP_BF_N[1]+' fresh bodies, '+MAP_FRESH+'% easier to raise. '+(siteReady(id)?'Fresh dead wait.':'Nothing here until the next siege.');
  return '';
}
function nodeCardHTML(id){
  const n=VALLEY_NODES[id], here=id===mapPos(), can=mapCan(id,n.k==='grave'||n.k==='field'?0:1), note=tripNote(id), away=!can&&!here?' disabled title="Too far for the watches left today"':'';
  let h='<div class="v-card"><h3>'+nodeName(id)+'</h3><p class="u-sub">'+KIND_NAME[n.k]+(here?' &middot; you stand here':note?' &middot; '+note:'')+'</p>';
  if(n.k==='gate'){ const i=n.g, locked=gateLocked(i);
    h+=(locked?'<p class="q-note">Not open to you yet.</p>':'<div class="btns"><button class="btn primary" data-a="enter" data-k="'+i+'"'+away+'>Enter'+(note?' &middot; '+stepTxt(tripSteps(id)):'')+'</button>'+(i===5&&riftOpen()?'<button class="btn small" data-a="gsub" data-k="rift">The Rift lies under it</button>':'')+'</div>'); }
  if(n.k==='tower') h+='<div class="btns"><button class="btn primary" data-a="tab" data-k="tower">Climb from the Tower tab</button></div>';
  if(n.k==='town') h+='<p class="q-note">Buildings, the market and your army wait here whatever road you stand on. The Ledger pulls you home at dawn.</p>';
  if(n.k==='grave'||n.k==='field') h+='<p>'+siteText(id)+'</p>'+(siteReady(id)?'<div class="btns"><button class="btn primary" data-a="vsite" data-k="'+id+'"'+away+'>'+(n.k==='grave'?'Dig':'Walk the field')+(note?' &middot; '+stepTxt(tripSteps(id)):'')+'</button></div>':'');
  return h+'</div>';
}
function dugHTML(){   // the bodies dug today, raised in town before dawn
  const B=(S.map&&S.map.bodies)||[]; if(!B.length) return '';
  return '<div class="v-dug"><p class="group-h">Bodies from the valley &middot; until dawn</p>'+B.map((x,i)=>{ const c=x.c, ch=raiseChance(Object.assign({},c));
    return '<div class="tt-row"><div><h4>'+cleanText(c.name)+' &middot; Lv '+c.lvl+'</h4><div class="u-sub">'+(c.old?'Old bones':'Fresh dead')+' from '+nodeName(x.s)+' &middot; '+ch+'% to rise</div></div><button class="btn small primary" data-a="vraise" data-k="'+i+'"'+(armyRoom()||reserveRoom()?'':' disabled title="Your army and Reserve are full"')+'>Raise</button></div>'; }).join('')+'</div>';
}
function valleyHTML(){
  const pos=mapPos(), sel=ui.vsel&&VALLEY_NODES[ui.vsel]&&mapSeen(ui.vsel)?ui.vsel:pos, known=MAP_IDS.filter(mapSeen);
  return '<section class="win" aria-labelledby="h-valley"><h2 class="win-h" id="h-valley">The valley</h2>'+mapPlanHTML()+(MAP_ON?'':'<p class="q-note">The map is off: every road is free.</p>')
   +'<div class="vmap-wrap">'+mapSVG()+'</div>'+nodeCardHTML(sel)+dugHTML()
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
     cxRow('Visiting','A site needs a watch in hand but none left over: the walk is the visit.')]);
}
