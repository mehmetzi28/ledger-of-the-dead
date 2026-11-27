// ===== FOE KITS =====
// Every kind of foe (not bosses, the rival or secret masters) has one kit: a rule of its own, shown as a chip on its card once
// you have studied the kind. A kit acts through the turn: intents (rollIntent: shield, mark, cleanse, call, burrow), the blow
// (kitAtk), what its hit leaves (foeOnHit), the damage it takes (kitTaken), its death (kitDeath) and its row (rowOf).
// Run-only fields on foes: e.ambU (ambush spent), e.gcU (call spent), e.risen (called back once), e.burrow, e.back (a skirmisher
// stepped back), e.fz (frenzy stacks), e.mkd (marked by an Undone marker until that turn). S.run.mk: a foe marker's mark.
const KIT_SHIELD=.15, KIT_AMBUSH=1.3, KIT_THIEF=.1, KIT_CALL=.4, KIT_PACK=.1, KIT_PACK_MAX=3, KIT_BOMB=.4, KIT_SAP=2, KIT_SKIRM=.5, KIT_STANCE=.5,
  KIT_SURFACE=1.5, KIT_THORN=.15, KIT_FRENZY=.15, KIT_BANNER=.1, KIT_SHIELD_CAP=.4;
const KITS={
  shield: {name:'Shieldbearer', rule:'Every second turn, instead of attacking, shields the most hurt foe for 15% of its own max HP.', ans:'Kill or freeze it first; Corpse Explosion goes past shields.'},
  ambush: {name:'Ambusher',     rule:'Its first attack each fight ignores rows and strikes your back row (you, if no minion stands there) for 30% more.', ans:'Ward on turn 1; keep a minion in the back row; Taunt pulls it.'},
  thief:  {name:'Mana thief',   rule:'Its hits on you drain mana: 10% of your max mana.', ans:'Keep it off you with Taunt; Bone Shield and Bone Ward.'},
  call:   {name:'Gravecaller',  rule:'Once a fight, after a foe falls, it calls that body back up at 40% HP on its next turn.', ans:'Kill it first, burst the body with Corpse Explosion, or freeze it on the turn it calls.'},
  pack:   {name:'Pack hunter',  rule:'+10% attack for every other foe standing beside it, up to +30%.', ans:'Thin the pack: cleaves, Volley, Corpse Explosion.'},
  bomb:   {name:'Bomber',       rule:'When it dies it bursts: 40% of its attack as fire on every unit in your front row.', ans:'Kill it while frozen, or with Reap or Execute: the body rises Preserved or Clean and does not burst.'},
  sapper: {name:'Sapper',       rule:'Its hits tear twice as much ward off you and Bone Shield off your minions.', ans:'Don\'t ward against it; kill it first, then ward.'},
  skirm:  {name:'Skirmisher',   rule:'Below half HP it steps back to the back row, out of your melee\'s reach while its front row stands.', ans:'Strikers, skills and Strike reach it anywhere.'},
  stance: {name:'Bulwark stance',rule:'Every other turn it braces and takes 50% less damage; its card shows which turn.', ans:'Spend big hits on its open turns; a Sundered foe cannot brace.'},
  hexer:  {name:'Hexer',        rule:'Its hits hex the target 1 time in 3: 20% less damage dealt for 2 turns.', ans:'Ironbound minions shrug it off; kill it before the big turn.'},
  marker: {name:'Marker',       rule:'Every third turn it marks one of your minions instead of attacking: next turn every foe that can reach it strikes it.', ans:'Taunt overrides the mark; Guard; move the marked minion back.'},
  purify: {name:'Purifier',     rule:'When a foe carries two or more wounds and conditions, it cleanses that foe instead of acting.', ans:'Kill it before you stack; burst instead of wounds.'},
  burrow: {name:'Burrower',     rule:'Every third turn it burrows (out of reach of single blows) and surfaces next turn hitting 50% harder.', ans:'Ward for the surfacing turn; Corpse Explosion, Death\'s Toll and splash still reach it.'},
  thorns: {name:'Thorned',      rule:'Melee hits on it from your minions reflect 15% back onto the attacker.', ans:'Strikers, skills and Strike; Stalwart and Ironbound vanguards.'},
  frenzy: {name:'Frenzy',       rule:'+15% attack each time another foe falls, for the rest of the fight.', ans:'Kill it first, or last with a burst.'},
  banner: {name:'Banner-bearer',rule:'Stands in the back row. While it stands, every other foe deals 10% more damage and takes 10% less.', ans:'Kill it first: strikers and skills reach the back row.'}
};
const KIT_IDS=Object.keys(KITS);
const KIT_OF={
  'Tunnel Rat':'pack','Grave Beetle':'stance','Marrow Mite':'purify','Tannery Brute':'shield','Shiv Cutpurse':'ambush','Tallow Chandler':'bomb','Warren Bandit':'thief',
  'Skeleton Guard':'shield','Crypt Ghoul':'frenzy','Drowned Priest':'call','Drowned Sentinel':'thorns','Coffin Crawler':'burrow','Tide Acolyte':'hexer','Crypt Legionnaire':'stance',
  'Ash Husk':'bomb','Barrow Wight':'thief','Pyre Witch':'banner','Barrow Thrall':'pack','Ember Stalker':'ambush','Cinder Weaver':'sapper','Barrow Champion':'frenzy',
  'Stone Gargoyle':'stance','Nave Stalker':'ambush','Hollow Chorister':'banner','Glass Sentinel':'thorns','Tooth Collector':'marker','Vestment Wraith':'burrow','Cathedral Templar':'shield',
  'Thorn Troll':'thorns','Rust Knight':'sapper','Sap Weaver':'call','Iron Scarecrow':'marker','Fruit Reaver':'bomb','Grove Shepherd':'purify','Orchard Marshal':'banner',
  'Throne Guard':'shield','Ash Revenant':'frenzy','Whisper Choir':'hexer','Ember Herald':'skirm','Crownless Duelist':'banner','Pallbearer':'call','Ash Praetorian':'sapper',
  'Imp':'bomb','Hellhound':'pack','Chain Devil':'marker','Pit Warden':'stance','Soul Tender':'call','Brimstone Chanter':'banner','Hell Legionary':'shield','Infernal Duelist':'thief',
  'Militia Spearman':'shield','Crossbowman':'ambush','Chaplain':'purify','Witch-hunter':'marker'
};
const KIND_RES={'Glass Sentinel':{phys:-.25}};   // kinds with a weakness of their own on top of their place's (foeRes)
const kitOf=e=>!e||e.boss||e.rival||e.secret||e.id==null?null:e.kitO||KIT_OF[e.base]||null;   /* kitO: a kit given by a boss (the Rat King's Crown of Rats) */
const hasKit=(e,k)=>kitOf(e)===k||(!!e&&!!e.kit2&&e.kit2===k&&!!kitOf(e));   /* kit2: Kits Plus (game-asc.js) */
const kitNum=e=>parseInt(String(e.id).slice(1),10)||0;
const stanceOn=(e,t)=>hasKit(e,'stance')&&!hasSt(e,'sundered')&&(((t==null?S.run.turn:t)+kitNum(e))%2===0||(pactOn('hides')&&(t==null?S.run.turn:t)===1));   /* Thick Hides: braced from the first turn */   // braced this turn
const kitBack=e=>hasKit(e,'banner')||!!e.back;   // stands in the back row whatever its role
const reachable=e=>e.hp>0&&!e.burrow;   // single blows (your target, your minions' targets) cannot reach a burrowed foe
const otherBanner=e=>!!S.run&&S.run.enemies.some(o=>o!==e&&o.hp>0&&hasKit(o,'banner'));
const packN=e=>Math.min(KIT_PACK_MAX,S.run.enemies.filter(o=>o!==e&&o.hp>0).length);
function kitAtk(e,it){   // a kit's share of a foe's blow
  let k=1;
  if(hasKit(e,'pack')) k*=1+KIT_PACK*packN(e);
  if(hasKit(e,'frenzy')&&e.fz) k*=1+KIT_FRENZY*e.fz;
  if(otherBanner(e)) k*=1+KIT_BANNER;
  if(it&&it.amb) k*=KIT_AMBUSH;
  if(it&&it.sf) k*=KIT_SURFACE;
  return k;
}
function kitTaken(e,d){   // a kit's share of the damage a foe takes (hurtFoe, before shields)
  if(stanceOn(e)) d=Math.round(d*KIT_STANCE);
  if(otherBanner(e)) d=Math.round(d*(1-KIT_BANNER));
  return d;
}
// ----- intents: what a kit plans for turn T (rollIntent passes the turn it plans for)
function kitIntent(e,k,T,alive){
  const r=S.run, K=kitOf(e); if(!K) return null;
  { const ab=abbeyIntent(e,K,T,alive); if(ab) return ab; }   /* the Chained Lector (game-abbey.js) */
  if(K==='burrow'){ if(e.burrow||(k==='it2'&&e.it&&e.it.k==='burrow')) return {sf:1}; if(T%3===0) return {k:'burrow'}; }
  if(K==='shield'&&T%2===0){ const f=liveFoes().filter(o=>!(o.shield>=o.maxHp*KIT_SHIELD_CAP)).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]; if(f) return {k:'shield',t:f.id}; }
  if(K==='marker'&&T%3===1){ const ms=alive.filter(a=>a.id!=='p'); if(ms.length) return {k:'mark',t:fxKey(ms.sort((a,b)=>b.maxHp-a.maxHp)[0])}; }   // the sturdiest minion: the one your plan leans on
  if(K==='purify'){ const f=liveFoes().filter(o=>woundN(o)>=2).sort((a,b)=>woundN(b)-woundN(a))[0]; if(f) return {k:'cleanse',t:f.id}; }
  if(K==='call'&&!e.gcU){ const c=callable(); if(c) return {k:'call',t:c.id}; }
  if(K==='ambush'&&!e.ambU&&!(k==='it2'&&e.it&&e.it.amb)) return {amb:1};
  return null;
}
const woundN=o=>Object.keys(o.dots||{}).length+Object.keys(o.st||{}).filter(x=>o.st[x]>0).length;
function callable(){ const r=S.run; return r.enemies.find(o=>o.dead&&!o.boss&&!o.rival&&!o.risen&&!o.split&&r.corpses.some(c=>c.id==='c'+o.id&&!c.tried))||null; }
function kitIntentOk(e,it){   // a planned kit action still possible
  const r=S.run;
  if(it.k==='shield'){ const f=r.enemies.find(o=>o.id===it.t); return !!f&&f.hp>0; }
  if(it.k==='cleanse'){ const f=r.enemies.find(o=>o.id===it.t); return !!f&&f.hp>0; }
  if(it.k==='call'){ const f=r.enemies.find(o=>o.id===it.t); return !!f&&f.dead&&!f.risen&&r.corpses.some(c=>c.id==='c'+f.id&&!c.tried); }
  if(it.k==='mark'){ return allies().some(a=>a.hp>0&&fxKey(a)===it.t); }
  if(it.k==='burrow') return true;
  if(it.k==='read') return !!readable();
  return null;   // not a kit action: the usual checks
}
function kitAct(e,it){   // a foe spends its turn on its kit; true if it did
  const r=S.run; if(abbeyKitAct(e,it)) return true;
  if(it.k==='shield'){ const f=r.enemies.find(o=>o.id===it.t); if(!f||!(f.hp>0)) return true; const add=Math.round(e.maxHp*KIT_SHIELD); f.shield=Math.min(Math.round(f.maxHp*KIT_SHIELD_CAP),(f.shield||0)+add); fxe('ward',f); log(e.name+' raises a shield over '+(f===e?'itself':f.name)+'.','bad'); return true; }
  if(it.k==='mark'){ const tg=allies().find(a=>a.hp>0&&fxKey(a)===it.t); if(tg){ r.mk={t:it.t,turn:r.turn+1}; log(e.name+' marks '+nameOf(tg)+': next turn every foe that can reach it strikes it.','bad'); } return true; }
  if(it.k==='cleanse'){ const f=r.enemies.find(o=>o.id===it.t); if(f&&f.hp>0){ delete f.dots; delete f.st; log(e.name+' cleanses '+(f===e?'itself':f.name)+' of every wound and condition.','bad'); } return true; }
  if(it.k==='call'){ const f=r.enemies.find(o=>o.id===it.t); if(f&&f.dead&&!f.risen){ f.dead=false; f.risen=1; f.hp=Math.max(1,Math.round(f.maxHp*KIT_CALL)); delete f.cd; delete f.dots; delete f.st; delete f.stun; f.shield=0; r.corpses=r.corpses.filter(c=>c.id!=='c'+f.id); e.gcU=1; fxe('raise',f); log(e.name+' calls '+f.name+' back up at '+f.hp+' HP.','bad'); } return true; }
  if(it.k==='burrow'){ e.burrow=1; if(r.target===e.id){ const t=liveFoes().find(reachable); if(t) r.target=t.id; } log(e.name+' burrows out of reach.','bad'); return true; }
  return false;
}
function kitDeath(e){   // from checkDeaths, once per death
  const r=S.run; if(r.sweep) return;
  if(hasKit(e,'call')&&!e.gcU) tally('gcBane'); abbeyKitDeath(e);
  if(hasKit(e,'bomb')){ if(e.cd==='preserved'||e.cd==='clean'||e.lt==='frost'){ tally('defused'); log(e.name+' falls without bursting.','ok'); } else bomb(e); }
  for(const o of r.enemies) if(o!==e&&o.hp>0&&hasKit(o,'frenzy')) o.fz=(o.fz||0)+1;
  if(e.lt&&foeRes(e,e.lt)<0) tally('weakK');
}
function bomb(e){ const r=S.run; if(r.sweep) return; const d=Math.max(1,Math.round(e.atk*KIT_BOMB)); let n=0;
  for(const a of S.army) if(a.hp>0&&rowOf(a)==='f'){ hurtAlly(a,d,'fire'); fxe('hurt',a,{fire:1}); n++; if(a.hp<=0) log(a.nick+' is down.','bad'); }
  log(e.name+' bursts in fire'+(n?' over your front row, '+d+' to each':', but no one stands in front')+'.','bad'); }
function kitOnHit(e,tg){   // what a kit's hit leaves behind (foeOnHit): the log's tail
  let x='';
  if(hasKit(e,'thief')&&tg.id==='p'){ const P=S.player, m=Math.min(P.mana,Math.round(pMana()*KIT_THIEF)); if(m>0){ P.mana-=m; x+=', '+m+' mana stolen'; } }
  return x;
}
function kitHurt(e){ if(hasKit(e,'skirm')&&e.hp>0&&e.hp<e.maxHp*KIT_SKIRM&&!e.back){ e.back=1; log(e.name+' steps back out of reach.','bad'); } }   // hurtFoe, after the damage
function kitReflect(e,m,d){   // Thorned: your melee minion's hit bites back
  if(!hasKit(e,'thorns')||!MELEE[m.role]||!(m.hp>0)) return ''; const t=Math.max(1,Math.round(d*KIT_THORN)); hurtAlly(m,t,'phys'); return ', and the thorns bite back for '+t;
}
function kitSeen(list){ for(const e of list){ const k=kitOf(e); if(k&&!T_('ks_'+k)) tally('ks_'+k); } }   // Kit-Reader: kits met (roomStart)
// ----- what the card shows: by the kind's mastery tier (knowLv): nothing learned shows "?", Studied the kit and its rule,
// Known what it does this turn, Ledgered the answer.
function kitState(e){   // the kit's state this turn, in words (Known and up)
  const K=kitOf(e); if(!K||!S.run) return ''; if(K==='unwritten'||K==='recite') return abbeyKitState(e,K);
  if(K==='stance') return stanceOn(e)?'Braced: takes 50% less this turn':'Open this turn';
  if(K==='burrow') return e.burrow?'Burrowed: out of reach':'Burrows every third turn';
  if(K==='call') return e.gcU?'Call spent':'Can call one body back';
  if(K==='ambush') return e.ambU?'Ambush spent':'Ambush ready';
  if(K==='pack'){ const n=packN(e); return n?'+'+Math.round(KIT_PACK*n*100)+'% from the pack':'Alone'; }
  if(K==='frenzy') return e.fz?'+'+Math.round(KIT_FRENZY*e.fz*100)+'% from the fallen':'Not yet frenzied';
  if(K==='skirm') return e.back?'Stepped back':'Steps back below half HP';
  return '';
}
function kitChip(e){
  const K=kitOf(e); if(!K||!(e.hp>0)) return '';
  const lv=knowLv(e); if(lv<1) return ' &middot; <span class="kit unk" title="It has a kit you have not learned. Study its kind to read it.">Kit ?</span>'+kit2Chip(e);
  const st=lv>=2?kitState(e):'', tip=KITS[K].rule+(lv>=4?' Answer: '+KITS[K].ans:'');
  return ' &middot; <span class="kit" title="'+tip+'">'+KITS[K].name+'</span>'+(st?' <span class="kit-st">'+st+'</span>':'')+kit2Chip(e);
}
const kit2Chip=e=>e.kit2&&KITS[e.kit2]?' &middot; <span class="kit kit2" title="Kits Plus: '+KITS[e.kit2].rule+'">+ '+KITS[e.kit2].name+'</span>':'';   /* Kits Plus (game-asc.js): the rule's kit shows from the start */
// ----- the Undone: a body killed by damage it was weak to rises Undone, with an echo of its kind's kit (60% strength).
// The echo is read off the minion's kind (m.kind), so fusion and saves need nothing of their own. R12: a charm (game-army.js)
// carries the same echo from a crafted kind, at echo strength (x1.5 when that kind is Ledgered); every kit has its echo.
const ECHO={shield:.09,pack:.06,stance:.3,thorns:.09,frenzy:.09,banner:.06,marker:.15,call:.25,
  ambush:.3,thief:1,bomb:.3,sapper:.5,skirm:.3,hexer:3,purify:1,burrow:.5}, ECHO_PACK_MAX=3, ECHO_SKIRM_AT=.3;
const echoV=(m,k)=>{ if(!m||m.id==='p') return 0; let v=hasTrait(m,'undone')&&KIT_OF[m.kind]===k?1:0; if(m.charm&&m.charm.k===k) v=Math.max(v,charmV(m.charm)); return v; };   // 0: no such echo
const echoKits=m=>{ if(!m||m.id==='p') return []; const o=[]; if(hasTrait(m,'undone')&&KIT_OF[m.kind]) o.push(KIT_OF[m.kind]); if(m.charm&&KITS[m.charm.k]&&!o.includes(m.charm.k)) o.push(m.charm.k); return o; };
const echoOf=m=>echoKits(m)[0]||null;
const echoK=m=>echoOf(m);
function echoDmg(m,tg){   // an echo on its own blows, and every Banner echo standing beside it
  const r=S.run; let k=1, v;
  if((v=echoV(m,'pack'))) k*=1+ECHO.pack*v*Math.min(ECHO_PACK_MAX,S.army.filter(o=>o!==m&&o.hp>0&&o.rankI===m.rankI).length);
  if((v=echoV(m,'frenzy'))) k*=1+ECHO.frenzy*v*r.enemies.filter(o=>o.dead).length;
  if((v=echoV(m,'ambush'))&&!m.amU){ m.amU=1; k*=1+ECHO.ambush*v; }   // its first blow each room
  { const b=Math.max(0,...S.army.filter(o=>o!==m&&o.hp>0).map(o=>echoV(o,'banner'))); if(b) k*=1+ECHO.banner*b; }
  if(tg&&tg.mkd>=r.turn) k*=1+ECHO.marker*(tg.mkv||1);
  return k;
}
function echoHit(m,tg){   // what an echo leaves on a blow: the log's tail
  let x='', v;
  if((v=echoV(m,'marker'))&&!m.mkU&&tg.hp>0){ m.mkU=1; tg.mkd=S.run.turn+1; tg.mkv=v; x+=' and marks it'; }   // first hit each room
  if((v=echoV(m,'thief'))){ const g=Math.round(ECHO.thief*v); S.player.mana=Math.min(pMana(),S.player.mana+g); }
  if((v=echoV(m,'sapper'))&&tg.shield>0){ const s=Math.round(tg.shield*Math.min(1,ECHO.sapper*v)); tg.shield-=s; if(s) x+=' and tears '+s+' shield off'; }
  if((v=echoV(m,'hexer'))&&tg.hp>0){ m.hxN=(m.hxN||0)+1; if(m.hxN>=Math.max(1,Math.round(ECHO.hexer/v))){ m.hxN=0; if(addSt(tg,'hexed',2)) x+=' and hexes it'; } }   // every third blow (every second at x1.5)
  return x;
}
function echoDr(a,d){ let v;   // allyDr
  if((v=echoV(a,'stance'))&&S.run&&S.run.turn%2===0) d=Math.max(1,Math.round(d*(1-Math.min(.6,ECHO.stance*v))));
  if((v=echoV(a,'skirm'))&&a.hp<a.maxHp*ECHO_SKIRM_AT) d=Math.max(1,Math.round(d*(1-Math.min(.6,ECHO.skirm*v))));
  if((v=echoV(a,'burrow'))&&S.run&&S.run.turn===1) d=Math.max(1,Math.round(d*(1-Math.min(.75,ECHO.burrow*v))));
  return d; }
function echoThorns(e,tg,d){ const v=echoV(tg,'thorns'); if(!v||!(e.hp>0)||!(MELEE[e.role]||e.boss)) return ''; const t=Math.max(1,Math.round(d*ECHO.thorns*v)); hurtFoe(e,t,'phys'); return ', '+t+' bitten back'; }
function echoCall(a){   // the first minion of yours to fall each room gets up, if a gravecaller echo stands
  const r=S.run; if(!r||a.id==='p'||a.hp>0||r.gcR===r.room) return false; const v=Math.max(0,...S.army.filter(o=>o!==a&&o.hp>0).map(o=>echoV(o,'call'))); if(!v) return false;
  r.gcR=r.room; a.hp=Math.max(1,Math.round(a.maxHp*ECHO.call*v)); log(a.nick+' is called back up at '+a.hp+' HP by a gravecaller\'s echo.','ok'); return true;
}
function echoBomb(a){   // a Bomber echo bursts as it falls: fire on every foe (hurtAlly, when a minion goes down)
  const v=echoV(a,'bomb'); if(!v||!S.run||S.mode!=='battle') return; const d=Math.max(1,Math.round(a.maxHp*ECHO.bomb*v)); for(const o of liveFoes()) hurtFoe(o,d,'fire'); log(a.nick+' bursts as it falls: '+d+' fire on every foe.','ok');
}
function echoTurn(){   // end of each turn: shieldbearer echoes ward your most hurt minion on even turns; purifier echoes shed a condition
  const r=S.run;
  for(const m of S.army){ if(!(m.hp>0)) continue; const v=echoV(m,'purify'); if(v&&m.st){ const k=Object.keys(m.st).find(x=>m.st[x]>0); if(k) delete m.st[k]; } }
  if(r.turn%2!==0) return;
  for(const m of S.army){ const v=echoV(m,'shield'); if(!(m.hp>0)||!v) continue; const t=S.army.filter(o=>o.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]; if(!t) continue;
    t.mw=Math.min(Math.round(t.maxHp*.3),(t.mw||0)+Math.round(m.maxHp*ECHO.shield*v)); }
}
function echoRoom(){ for(const m of S.army){ delete m.mkU; delete m.amU; } mfRoom(); }   // roomStart (gear-bearer powers: game-army.js)
const echoTxt=k=>!k?'':({shield:'Every second turn it wards your most hurt minion for 9% of its own max HP.',pack:'+6% damage for every other minion of its gate in your army, up to +18%.',
  stance:'Takes 30% less damage every other turn.',thorns:'Reflects 9% of melee damage it takes.',frenzy:'+9% damage for every foe fallen this fight.',banner:'Your other minions deal 6% more while it stands.',
  marker:'Its first hit each fight marks the target: your minions deal 15% more to it for 2 turns.',call:'Once a room, the first of your minions to fall gets up at 25% HP.',
  ambush:'Its first blow each fight deals 30% more.',thief:'Each of its hits gives you 1 mana.',bomb:'When it falls it bursts for 30% of its max HP as fire on every foe.',
  sapper:'Its hits tear half of a foe\'s shield away.',skirm:'Below 30% HP it takes 30% less damage.',hexer:'Every third hit hexes the target for 2 turns.',
  purify:'At the end of each turn it sheds one condition.',burrow:'Takes 50% less damage on the first turn of each fight.'})[k];

// ===== SWEEP =====
// An outgrown gate, cleared on Normal at least SWEEP_CLEARS times, can be swept from its card on a Normal, uncursed day when you
// stand SWEEP_LV levels above its advice: one watch, the run's rooms generated and won at once (kill XP at SWEEP_XP, gold, trophies,
// drops, bestiary and quest progress), no raising, events, doors or records. A secret master or the rival stops the sweep at the
// boss room and you fight it as usual.
const SWEEP_LV=12, SWEEP_CLEARS=5, SWEEP_XP=.8;
const sweepOk=di=>!!S&&S.mode==='town'&&S.watches>0&&!!(S.ti&&S.ti.clr&&S.ti.clr[di])&&T_('clrN'+di)>=SWEEP_CLEARS&&!heatOf(di)&&!gateMod(di)&&S.player.lvl>=gateRec(di)+SWEEP_LV&&!rivalHere(di);
function sweep(di){
  if(!sweepOk(di)) return false;
  PREP_SKIP=true; try{ startRun(di); } finally{ PREP_SKIP=false; }   /* a sweep takes no brews (game-brew.js) */ const r=S.run; r.sweep=1; r.hurt=true; r.swSp=[]; tally('sweeps');
  for(let guard=0;guard<20;guard++){
    if(r.enemies.some(e=>e.secret||e.rival)){ r.sweepStop=1; delete r.sweep; notify('The sweep stops at the boss room: '+r.enemies.find(e=>e.secret||e.rival).name+' waits there. Fight it.','bad'); return true; }
    if(S.mode==='battle'){ for(let n=0;n<10&&liveFoes().length;n++){ for(const e of liveFoes()){ e.lt=null; e.hp=0; } checkDeaths(); }
      roomWon(); r.swSp.push(...r.spoils); r.spoils=[]; }
    r.corpses=[]; r.event=null; S.mode='raise';
    if(r.cleared) break;
    const D=r.doors; if(!descend(!D?'fight':D.includes('fight')?'fight':D.includes('elite')?'elite':D[0])) break;   /* a quiet room (rest, treasure) needs no fight */
  }
  r.spoils=r.swSp; S.mode='raise'; return true;
}
