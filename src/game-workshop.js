// ===== R22 PR A: the Bone Workshop, constructs built from parts =====
// A new building (opens at the Crypt level 2). Parts are cut from bodies kept in the Embalmery (one part a body, two with
// the Flesh Sculptor) or sewn from trophies (CONS_TROPHIES of one kind, 4 with the Bonesmith) into the parts pouch
// S.parts = {kind: n}. A construct takes four slots: a frame (its role and HP factor; its gate sets the tier), arms (its
// attack factor and damage type), a head (the kind's kit as a full echo, and its role's trait)
// and a core (a boss heart: +15% HP and attack, +25% from a secret master's; a Soul core: a Soul once a room when it
// kills; a Rift core: +10% damage, +25% in the Rift). It is an ordinary minion record with m.cons={fr,ar,hd,co,h2?}; it
// levels and evolves like any other, it can never be fused, and it never shatters: it breaks (S.broken, m.broken = the
// day) and is repaired in town after a day for gold and dust. Up to consCap() constructs owned at once.
let CONS_ON=true;   // the bots' off-switch ("off":["constructs"])
const CONS_TROPHIES=6, CONS_TROPHIES_SMITH=4, CONS_GOLD=1000, CONS_DUST=10, CONS_REPAIR_G=300, CONS_REPAIR_D=5, CONS_REPLACE=500,
  CONS_LOW=.05, CONS_HEART=.15, CONS_HEART_SB=.25, CONS_SOUL_DUST=40, CONS_SHARD=3, CONS_SHARD_K=.1, CONS_SHARD_RIFT=.25, CONS_L4=.1, CONS_SIEGE=.1,
  CONS_HEAD_TRAIT={vanguard:'stalwart',striker:'vicious',mender:'warded',reaper:'wrathful',hexer:'hexing'};
const CONS_SLOTS=['fr','ar','hd','co'];
const CONS_SLOT_NAME={fr:'Frame',ar:'Arms',hd:'Head',co:'Core',h2:'Second head'};
Object.assign(BUILD,{workshop:{name:'Bone Workshop',open:()=>blRaw('crypt')>=2,desc:'Sew constructs from parts: bodies from the Embalmery or trophies. Level 1 keeps one construct, level 2 two (and repairs cost half), level 4 gives them +'+b100(CONS_L4)+'% max HP, level 5 three.',now:n=>consCapOf(n)+' construct'+(consCapOf(n)>1?'s':'')+(n>=2?', repairs half price':'')+(n>=4?', +'+b100(CONS_L4)+'% HP':'')}});
SPEC.workshop={3:[['Bonesmith','A part takes '+CONS_TROPHIES_SMITH+' trophies instead of '+CONS_TROPHIES+'.'],['Flesh Sculptor','Each body gives two parts.']],5:[['Masterwork','A construct may take a second head.'],['Living Steel','Repairs cost nothing and need no day to set.']]};
SIEGE_PERK.workshop={t:()=>'constructs on the wall have +'+b100(CONS_SIEGE)+'% max HP',d:'Constructs have +'+b100(CONS_SIEGE)+'% max HP in a siege.'};
// ----- kinds, parts, cores
function kindInfo(name){   // a part's source: a gate foe (or a Tower foe, as gate 4)
  for(let g=0;g<DUNGEONS.length;g++){ const m=DUNGEONS[g].mobs.find(x=>x[0]===name); if(m) return {name,role:m[1],hf:m[2]||1,af:m[3]||1,g}; }
  const t=TW_MOBS.find(x=>x[0]===name); return t?{name,role:t[1],hf:t[2]||1,af:t[3]||1,g:4,tw:1}:null;
}
const consOpen=()=>CONS_ON&&bl('workshop')>=1;
const consCapOf=n=>n>=5?3:n>=2?2:n>=1?1:0;
const consCap=()=>consCapOf(bl('workshop'));
const consAll=()=>S.army.concat(S.reserve||[],S.broken||[]).filter(m=>m.cons);
const consN=()=>consAll().length;
const partsOf=k=>(S.parts&&S.parts[k])|0;
const partTrophies=()=>hasSpec('workshop',3,'a')?CONS_TROPHIES_SMITH:CONS_TROPHIES;
const partKinds=()=>Object.keys(S.parts||{}).filter(k=>partsOf(k)>0&&kindInfo(k));
const armsType=I=>I.role==='striker'?GATE_HITS[I.g]||'phys':'phys';
function addPart(k,n){ S.parts=S.parts&&typeof S.parts==='object'?S.parts:{}; S.parts[k]=partsOf(k)+n; }
function usePart(k){ if(partsOf(k)<1) return false; S.parts[k]--; if(!S.parts[k]) delete S.parts[k]; return true; }
function sewPart(name){   // trophies into a part
  const I=kindInfo(name), key=I&&(I.tw?'t:':'')+name, need=partTrophies(); if(!consOpen()||S.mode!=='town'||!I||((S.trophies||{})[key]|0)<need) return false;
  S.trophies[key]-=need; if(!S.trophies[key]) delete S.trophies[key]; addPart(name,1); tally('partsSewn'); return true;
}
function cutPart(i){   // an Embalmery body into a part (two with the Flesh Sculptor)
  const L=S.embalm||[], x=L[i], I=x&&x.c&&kindInfo(x.c.base); if(!consOpen()||S.mode!=='town'||!I||x.c.boss) return false;
  L.splice(i,1); addPart(I.name,hasSpec('workshop',3,'b')?2:1); tally('partsCut'); return true;
}
const sewable=()=>Object.keys(S.trophies||{}).map(k=>k.replace(/^t:/,'')).filter((n,i,a)=>a.indexOf(n)===i&&kindInfo(n)&&((S.trophies||{})[(kindInfo(n).tw?'t:':'')+n]|0)>=partTrophies());
function coreOpts(){   // every core you could put in now: [key, name, gate or null]
  const o=[]; for(const [k,n] of (typeof spareHearts==='function'?spareHearts():[])) if(n>0&&TROPHY[k]) o.push([k.replace(/^b:/,'heart:'),TROPHY[k].name,TROPHY[k].rankI|0]);
  if((S.dust||0)>=CONS_SOUL_DUST) o.push(['soul','Soul core',null]);
  if(riftShards()>=CONS_SHARD) o.push(['shard','Rift core',null]);
  return o;
}
const coreName=c=>!c?'':c==='soul'?'Soul core':c==='shard'?'Rift core':c.startsWith('heart:')?(TROPHY['b:'+c.slice(6)]?TROPHY['b:'+c.slice(6)].name:'A heart'):'';
const coreGate=(c,fg)=>c&&c.startsWith('heart:')&&TROPHY['b:'+c.slice(6)]?TROPHY['b:'+c.slice(6)].rankI|0:fg;
const coreSecret=c=>!!c&&c.startsWith('heart:')&&SECRET.some(B=>B.name===c.slice(6));
function payCore(c){
  if(c==='soul'){ if((S.dust||0)<CONS_SOUL_DUST) return false; S.dust-=CONS_SOUL_DUST; return true; }
  if(c==='shard'){ if(riftShards()<CONS_SHARD) return false; S.rift.shards-=CONS_SHARD; return true; }
  if(c&&c.startsWith('heart:')){ const k='b:'+c.slice(6), sp=(spareHearts().find(x=>x[0]===k)||[])[1]|0; if(sp<1) return false; S.trophies[k]--; if(!S.trophies[k]) delete S.trophies[k]; return true; }
  return false;
}
// ----- the construct's numbers
function consTier(c){ const f=kindInfo(c.fr), a=kindInfo(c.ar), h=kindInfo(c.hd); if(!f||!a||!h) return null; const fg=f.g; return {t:fg,avg:(fg+a.g+h.g+coreGate(c.co,fg))/4}; }
function consApply(m){   // the record's role, factors and head trait from its parts
  const c=m.cons, f=kindInfo(c.fr), a=kindInfo(c.ar), h=kindInfo(c.hd), T=consTier(c); if(!f||!a||!h||!T) return m;
  const k=1-CONS_LOW*Math.max(0,T.t-T.avg);
  m.role=f.role; m.rankI=T.t; m.kind=f.name; m.name='Construct of '+f.name; m.hf=Math.round(f.hf*k*100)/100; m.af=Math.round(a.af*k*100)/100; m.boss=false; m.elite=false;
  const want=[headTrait(c.hd)].concat(c.h2?[headTrait(c.h2)]:[]).filter(Boolean); m.traits=(m.traits||[]).filter(t=>!m.ht||!m.ht.includes(t)); for(const t of want) if(!m.traits.includes(t)) m.traits.unshift(t); m.ht=want;
  return m;
}
const headTrait=k=>{ const I=kindInfo(k); return I?CONS_HEAD_TRAIT[I.role]||null:null; };   // the head's role trait (its kit comes as a full echo too)
const consEchoK=(m,k)=>!!(m&&m.cons&&((KIT_OF[m.cons.hd]===k)||(m.cons.h2&&KIT_OF[m.cons.h2]===k)));   // echoV
const consKits=m=>m&&m.cons?[m.cons.hd,m.cons.h2].filter(x=>x&&KIT_OF[x]).map(x=>KIT_OF[x]):[];   // echoKits
function consK(m,k){   // extraMul: the core, the Workshop's level 4, the wall
  if(!m||!m.cons||!CONS_ON) return 1; const c=m.cons.co; let v=1;
  if(c&&c.startsWith('heart:')) v*=1+(coreSecret(c)?CONS_HEART_SB:CONS_HEART);
  if(k==='atk'&&c==='shard') v*=1+(S.run&&S.run.rift?CONS_SHARD_RIFT:CONS_SHARD_K);
  if(k!=='atk'&&bl('workshop')>=4) v*=1+CONS_L4;
  if(k!=='atk'&&S.run&&S.run.siege) v*=1+CONS_SIEGE;
  return v;
}
const consType=m=>m&&m.cons&&CONS_ON?(I=>I?armsType(I):null)(kindInfo(m.cons.ar)):null;   // minionType
function consKill(m){ if(!m||!m.cons||m.cons.co!=='soul'||!S.run||S.run.siege) return; S.run.csl=S.run.csl||{}; if(S.run.csl[m.uid]===S.run.room) return; S.run.csl[m.uid]=S.run.room; if(gainSoul()) log(m.nick+'\'s Soul core takes a Soul from the kill.','ok'); }   // minionKill
// ----- building, breaking, repairing, replacing
const consCost=c=>{ const T=consTier(c); return T?{g:Math.round(CONS_GOLD*(T.t+1)*(inscOn('town')?inscTown():1)),d:CONS_DUST*(T.t+1)}:null; };
function consWhy(c){   // why this design cannot be built now, or ''
  if(!consOpen()) return 'Build the Bone Workshop first.'; if(S.mode!=='town') return 'Only in town.';
  if(!c||!c.fr||!c.ar||!c.hd||!c.co) return 'Fill all four slots.'; if(consN()>=consCap()) return 'The Workshop keeps '+consCap()+' construct'+(consCap()>1?'s':'')+' at once.';
  const need={}; for(const k of [c.fr,c.ar,c.hd].concat(c.h2?[c.h2]:[])) need[k]=(need[k]||0)+1; for(const k in need) if(partsOf(k)<need[k]) return 'Not enough parts of '+k+'.';
  if(c.h2&&!hasSpec('workshop',5,'a')) return 'A second head needs the Masterwork.';
  if(!coreOpts().some(o=>o[0]===c.co)) return 'That core is not at hand.';
  const p=consCost(c); if(S.gold<p.g) return 'Needs '+p.g+' gold.'; if((S.dust||0)<p.d+(c.co==='soul'?CONS_SOUL_DUST:0)) return 'Needs '+(p.d+(c.co==='soul'?CONS_SOUL_DUST:0))+' bone dust.';
  if(armyUsed()>=slots()&&!reserveRoom()) return 'Your army and the Reserve are full.';
  if(S.watches<1) return 'It takes a watch.';
  return '';
}
function consPreview(c){   // the minion it would be (not added anywhere)
  const m={uid:-1,armed:false,eq:null,nick:'Construct',lvl:Math.max(1,S.player.lvl-2),xp:0,stage:0,traits:[],hp:1,maxHp:null,atk:0,cons:Object.assign({},c)};
  consApply(m); m.lvl0=m.lvl; syncMinion(m); m.hp=m.maxHp; return m;
}
function buildCons(c){
  if(consWhy(c)) return null; const p=consCost(c);
  for(const k of [c.fr,c.ar,c.hd].concat(c.h2?[c.h2]:[])) usePart(k); payCore(c.co); S.gold-=p.g; S.dust-=p.d; S.watches--;
  const m={uid:++S.uid,armed:false,eq:null,nick:freeNick(),lvl:Math.max(1,S.player.lvl-2),xp:0,stage:0,traits:[],hp:1,maxHp:null,atk:0,cons:{fr:c.fr,ar:c.ar,hd:c.hd,co:c.co}};
  if(c.h2) m.cons.h2=c.h2; consApply(m); m.lvl0=m.lvl; syncMinion(m); m.hp=m.maxHp;
  if(armyUsed()<slots()) S.army.push(m); else (S.reserve=S.reserve||[]).push(m);
  tally('constructs'); S.ti=S.ti||{}; if(c.co.startsWith('heart:')) tally('heartCores'); if(new Set([c.fr,c.ar,c.hd].map(k=>kindInfo(k).g).concat([coreGate(c.co,-1)]).filter(g=>g>=0)).size>=4) tally('gatesInOne');
  if(consN()>=3) tally('patchwork'); sfx('raise'); moment(m.nick+' is sewn together','ok');
  notify(m.nick+', a construct of '+c.fr+', stands up in the Workshop.','ok'); if(S.watches<=0) endDay(); return m;
}
function consBreak(m,r){   // the shatter roll, Ironman's loss, a fever: a construct breaks instead (true: handled)
  if(!m||!m.cons) return false; S.army=S.army.filter(x=>x!==m); if(S.reserve) S.reserve=S.reserve.filter(x=>x!==m); bondsClean();
  m.hp=0; m.broken=S.day; (S.broken=Array.isArray(S.broken)?S.broken:[]).push(m); tally('consBroken');
  if(r&&r.events) r.events.push({m:m.nick+' breaks apart. The Workshop can mend it.',c:'bad'}); return true;
}
const consRepairCost=m=>{ if(hasSpec('workshop',5,'b')) return {g:0,d:0}; const t=(m.rankI|0)+1, h=bl('workshop')>=2?.5:1; return {g:Math.round(CONS_REPAIR_G*t*h),d:Math.round(CONS_REPAIR_D*t*h)}; };
const consRepairReady=m=>!!m&&m.broken!=null&&(hasSpec('workshop',5,'b')||m.broken<S.day);
function repairCons(uid){
  const m=(S.broken||[]).find(x=>x.uid===uid); if(!m||S.mode!=='town'||!consRepairReady(m)) return false; const c=consRepairCost(m); if(S.gold<c.g||(S.dust||0)<c.d) return false;
  const toArmy=armyUsed()<slots(); if(!toArmy&&!reserveRoom()) return false;
  S.gold-=c.g; S.dust=(S.dust||0)-c.d; S.broken=S.broken.filter(x=>x!==m); delete m.broken; syncMinion(m); m.hp=m.maxHp; if(toArmy) S.army.push(m); else S.reserve.push(m); tally('repairs'); return true;
}
function replacePart(uid,slot,k){   // a new part in one slot; the old one is lost
  const m=S.army.concat(S.reserve||[]).find(x=>x.uid===uid); if(!m||!m.cons||S.mode!=='town'||!['fr','ar','hd','co','h2'].includes(slot)) return false;
  if(slot==='h2'&&!hasSpec('workshop',5,'a')) return false;
  const T=consTier(m.cons), g=CONS_REPLACE*((T?T.t:0)+1); if(S.gold<g) return false;
  if(slot==='co'){ if(!coreOpts().some(o=>o[0]===k)||!payCore(k)) return false; } else { if(!kindInfo(k)||!usePart(k)) return false; }
  S.gold-=g; m.cons[slot]=k; consApply(m); syncMinion(m); m.hp=Math.min(m.hp,m.maxHp); tally('partsReplaced'); return true;
}
function consFix(g){   // normalizeSave
  const ok=m=>{ if(!m||!m.cons) return; const c=m.cons; if(typeof c!=='object'||!kindInfo(c.fr)||!kindInfo(c.ar)||!kindInfo(c.hd)||typeof c.co!=='string'){ delete m.cons; delete m.ht; return; }
    m.cons={fr:c.fr,ar:c.ar,hd:c.hd,co:c.co}; if(c.h2&&kindInfo(c.h2)) m.cons.h2=c.h2; if(!Array.isArray(m.ht)) delete m.ht; };
  if('parts' in g){ const o={}; if(g.parts&&typeof g.parts==='object') for(const k in g.parts){ const n=Math.floor(+g.parts[k]); if(kindInfo(k)&&n>0) o[k]=n; } g.parts=o; }
  g.army.concat(g.reserve||[],g.waiting||[]).forEach(m=>{ ok(m); delete m.broken; });
  if('broken' in g){ g.broken=(Array.isArray(g.broken)?g.broken:[]).filter(m=>m&&typeof m==='object'&&m.cons&&isFinite(m.lvl)&&ROLES[m.role]); g.broken.forEach(m=>{ ok(m); if(!isFinite(m.broken)) m.broken=0; if(!Array.isArray(m.traits)) m.traits=[]; }); g.broken=g.broken.filter(m=>m.cons); }
}
// ----- titles, tip
[['ws_first','First Stitch','Build your first construct.',()=>T_('constructs')>=1,{mpow:3},2],
 ['ws_patch','Patchwork Army','Own three constructs at once.',()=>T_('patchwork')>=1,{mpow:5},4],
 ['ws_heart','Heart of a King','Build a construct around a boss heart.',()=>T_('heartCores')>=1,{dmgp:3},3],
 ['ws_gates','Every Gate in One','Build a construct from parts of four different gates.',()=>T_('gatesInOne')>=1,{mpow:4},4]
].forEach(([id,name,req,ok,b,r])=>{ for(const k in b) b[k]=Math.max(b[k],Math.round(b[k]*RARITY_MUL[r])); TITLE_RARITY[id]=r; const t={id,grp:'Deeds',name,req,ok,b,r}; TITLES.push(t); TITLE[id]=t; });
TIPS.push({id:'workshop',t:'The Bone Workshop',m:'With the Crypt at level 2 you can build the Bone Workshop. It sews constructs from parts: bodies kept in the Embalmery, or trophies of one kind. A construct never shatters; it breaks, and the Workshop mends it.',when:()=>S.mode==='town'&&CONS_ON&&blRaw('crypt')>=2&&!blRaw('workshop')});
TIP_META.workshop=['sys','town'];
