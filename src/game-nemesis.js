// ===== R13 PR A: NEMESES =====
// A foe that downs one of your Greater (or older) minions and is still standing when the room ends (you fell or fled) may
// become a nemesis: a name, +1 level for every minion it has downed and every week it lives, the trait of its best victim,
// a second kit at two victims, and at three it is an arch-nemesis (a second wind at half HP). At most NEM_MAX live at once.
// Each haunts its gate behind a sigil door that is always read. Killing one pays trophies, the boss table's roll, and an
// Avenged body that keeps the stolen trait; the victims' headstones say so. No Math.random here: births roll on dayHash.
const NEM_CH=.35, NEM_STAGE=.1, NEM_MAX=3, NEM_KIT2=2, NEM_ARCH=3, NEM_ARCH_HEAL=.2, NEM_TRO=4, NEM_RAISE=15, NEM_OLD=28, NEM_DOOR_LV=5, NEM_VMAX=8;
const NEM_NAMES=[   // one list a gate: proper nouns, never translated
  ['Gutter-Tooth','Old Gnaw','Vat-Belly','Sludgetail','Whisker-Knife','Mother Mange','Rind'],
  ['Weeping Hob','Silt-Eye','Drowned Ned','Grey Lantern','Cold Hollis','Brine-Hand','Moss-Coat'],
  ['Cinder Jack','Ashmouth','The Smouldering Maid','Soot-Fingers','Burnt Abel','Pyre-Wick','Old Ember'],
  ['Hollow Gregor','The Off-Key','Brother Lament','Psalm-Breaker','Dirge','Sister Toll','Black Antiphon'],
  ['Rust-Bough','Iron Tom','Graft','The Pruner','Knotwood','Bitter Pip','Sap-Drinker'],
  ['The Pale Herald','Ash-Crowned','Lord Fester','Cinder Countess','The Unkind','Throne-Rot','Gallows Prince'],
  ['The Erasure','Blot','Margin-Walker','Ink-Drowned','The Unwritten Clerk','Palimpsest','Smudge']
];
const NEM_VERB=['gnawed down','drowned','burned','silenced','cut down','unmade','erased'];   // "Gutter-Tooth, who gnawed down Ash"
const nemOn=r=>!!r&&!r.tw&&!r.siege&&!r.trial&&!r.wk&&!r.rift&&!r.rg&&!r.rk&&!!DUNGEONS[r.di];   // ordinary gate runs only
const nemById=id=>(S.nem||[]).find(n=>n.id===id)||null;
const nemAt=di=>(S.nem||[]).filter(n=>n.g===di).sort((a,b)=>nemUp(b)-nemUp(a))[0]||null;   // the strongest one haunting a gate
const nemUp=n=>(n.k|0)+(n.wk|0);   // levels above its room
const nemTitle=n=>n.name+', who '+(NEM_VERB[n.g]||NEM_VERB[0])+' '+((n.v&&n.v[0]&&n.v[0].n)||'one of yours');
const nemFoeOk=e=>!!e&&!e.boss&&!e.rival&&!e.secret&&!e.echo&&!e.guard&&!e.risen&&!e.living&&!e.stash;
function nemDown(e,tg){   // a foe downed a minion (the foes' turn in act)
  const r=S.run; if(!nemOn(r)||!tg||tg.id==='p'||tg.thrall||!nemFoeOk(e)) return;
  if(e.nem){ const n=nemById(e.nem); if(!n) return; n.k=(n.k|0)+1; n.v.push({n:tg.nick,d:S.day}); if(n.v.length>NEM_VMAX) n.v.splice(1,1);   // the first victim names it for good
    if(n.k>=NEM_ARCH&&!n.arch){ n.arch=1; e.arch=1; tally('nemArch'); notify(n.name+' has downed '+n.k+' of your dead. It is an arch-nemesis now.','bad'); }
    log(n.name+' adds '+tg.nick+' to its tally.','bad'); return; }
  if((tg.stage||0)>=1){ e.nv=e.nv||[]; e.nv.push({n:tg.nick,s:tg.stage|0,t:topTrait(tg)||''}); }
}
function nemBirth(r){   // the room ended with foes standing (defeat, flight): a foe that downed a Greater minion may live on with a name
  if(!nemOn(r)) return;
  for(const e of r.enemies){ if(!(e.hp>0)||!e.nv||!e.nv.length||e.nem||!nemFoeOk(e)) continue;
    const st=Math.max(...e.nv.map(v=>v.s)), ch=NEM_CH+NEM_STAGE*Math.max(0,st-1), roll=dayHash(S.day,S.runs,parseInt(String(e.id).slice(1),10)||0,1301)%1000/1000;
    const v=e.nv; delete e.nv; if(roll<ch) nemMake(e,r,v); }
}
function nemMake(e,r,vs){
  const di=r.di, L=NEM_NAMES[di]||NEM_NAMES[0], used=(S.nem||[]).map(n=>n.name), i0=dayHash(S.day,S.runs,di,7)%L.length;
  let name=L[i0]; for(let j=0;j<L.length;j++){ const x=L[(i0+j)%L.length]; if(!used.includes(x)){ name=x; break; } }
  const best=vs.slice().sort((a,b)=>b.s-a.s)[0], n={id:++S.uid,name,g:di,base:e.base,role:e.role,k:vs.length,v:vs.map(x=>({n:x.n,d:S.day})),tr:TRAITS[best.t]?best.t:'',born:S.day,wk:0};
  if(n.k>=NEM_ARCH) n.arch=1;
  S.nem=S.nem||[];
  if(S.nem.length>=NEM_MAX){ const w=S.nem.slice().sort((a,b)=>nemUp(a)-nemUp(b))[0]; S.nem=S.nem.filter(x=>x!==w); notify(w.name+' is forgotten: a new grudge takes its place.',''); }
  S.nem.push(n); tally('nemBorn');
  notify(best.n+' fell to '+withArticle(e.base)+'. It lives, and the Ledger gives it a name: '+nemTitle(n)+'. It waits in the '+DUNGEONS[di].name+'.','bad');
  moment('A nemesis: '+n.name,'bad');
}
function nemDawn(){   // the first dawn of each week: every nemesis grows a level and taunts you (closeDay)
  if(!S.nem||!S.nem.length||(S.day-1)%7!==0) return;
  for(const n of S.nem){ n.wk=(n.wk|0)+1; notify(n.name+' still walks the '+DUNGEONS[n.g].name+' with '+n.v[0].n+'\'s name on its tally. It grows stronger (Lv +'+nemUp(n)+').','bad'); }
}
function nemDoor(r,out){   // rollDoors: the sigil door, once a run, in a gate a nemesis haunts
  if(!nemOn(r)||r.nemU||!nemAt(r.di)||out.includes('boss')||out.includes('script')||out.includes('nem')) return out;
  return out.concat(['nem']);
}
function nemKit2(n,di){ const own=KIT_OF[n.base], ks=[...new Set(DUNGEONS[di].mobs.map(m=>KIT_OF[m[0]]).filter(k=>k&&k!==own))]; return ks.length?ks[n.id%ks.length]:null; }
function nemFoe(n,di,lvl){
  const row=DUNGEONS[di].mobs.find(m=>m[0]===n.base)||DUNGEONS[di].mobs[0], lv=lvl+nemUp(n), s=mobStats(di,lv,row[2],row[3],false,true);
  const e={id:'e'+(++S.uid),name:n.name,base:row[0],role:row[1],rankI:di,lvl:lv,hf:row[2],af:row[3],boss:false,elite:true,maxHp:s.hp,hp:s.hp,atk:s.atk,dead:false,nem:n.id};
  if(n.tr&&TRAITS[n.tr]) e.traits=[n.tr]; if((n.k|0)>=NEM_KIT2){ const k2=nemKit2(n,di); if(k2) e.kit2=k2; } if(n.arch) e.arch=1;
  return e;
}
function nemRoom(list,di,lvl){ const n=nemAt(di); if(!n) return; const e=nemFoe(n,di,lvl); if(list.length) list[0]=e; else list.push(e); }   // buildRoom, kind 'nem'
function nemHurt(e){   // hurtFoe: an arch-nemesis eats its stolen trait for a second wind, once, at half HP
  if(!e.arch||e.archU||!(e.hp>0)||e.hp>=e.maxHp*.5) return;
  e.archU=1; const h=Math.round(e.maxHp*NEM_ARCH_HEAL); e.hp=Math.min(e.maxHp,e.hp+h); mark(e,0,h); if(e.traits) e.traits=[];
  log(e.name+' devours what it stole from your dead and rises again (+'+h+' HP).','bad');
}
function nemSlain(e,r){   // checkDeaths, after the kill's loot: trophies, the boss table's roll, the Avenged body and the headstones
  if(!e.nem) return; const n=nemById(e.nem); if(!n) return;
  S.nem=S.nem.filter(x=>x!==n); tally('nemSlain'); if(S.day-n.born>=NEM_OLD) tally('nemOld');
  const key=trophyKey(e); if(TROPHY[key]){ r.troph=r.troph||{}; r.troph[key]=(r.troph[key]||0)+NEM_TRO; }
  r.loot.push(pickRow(tableFor(e.rankI,e.role,true,false)));
  e.avg=n.tr||'+';   // corpseOf: the body rises Avenged, with the stolen trait
  for(const v of n.v){ const h=(S.memorial||[]).find(x=>x.nick===v.n&&!x.av); if(h) h.av=S.day; }
  log(n.name+' falls. '+n.v.map(v=>v.n).join(', ')+(n.v.length>1?' are':' is')+' avenged.','story'); moment(n.name+' is avenged','gold');
}
const nemRaise=c=>c&&c.avg?NEM_RAISE:0;   // raiseChance
const nemTrait=c=>c&&c.avg&&TRAITS[c.avg]?c.avg:null;   // the raise: the stolen trait comes home in place of the condition's or a random one
function nemFix(g){   // normalizeSave: S.nem only when the save has it
  if(!('nem' in g)) return;
  const ok=n=>n&&typeof n==='object'&&typeof n.name==='string'&&DUNGEONS[n.g]&&typeof n.base==='string'&&DUNGEONS[n.g].mobs.some(m=>m[0]===n.base)&&Array.isArray(n.v)&&n.v.length;
  g.nem=Array.isArray(g.nem)?g.nem.filter(ok).slice(0,NEM_MAX).map(n=>{ const o={id:Math.floor(num(n.id,0)),name:cleanText(n.name).slice(0,40)||'Nameless',g:n.g,base:n.base,role:ROLES[n.role]?n.role:'striker',k:Math.max(1,Math.floor(num(n.k,1))),
    v:n.v.filter(v=>v&&typeof v.n==='string').slice(0,NEM_VMAX).map(v=>({n:cleanNick(v.n)||'Nameless',d:Math.max(1,Math.floor(num(v.d,1)))})),tr:TRAITS[n.tr]?n.tr:'',born:Math.max(1,Math.floor(num(n.born,1))),wk:Math.max(0,Math.floor(num(n.wk,0)))};
    if(n.arch) o.arch=1; return keepOrder(n,o); }).filter(n=>n.v.length):[];
}
function keepOrder(src,o){ const out={}; for(const k of Object.keys(src)) if(k in o) out[k]=o[k]; for(const k of Object.keys(o)) if(!(k in out)) out[k]=o[k]; return out; }   // a repaired object keeps the save's key order
