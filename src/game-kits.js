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
const kitOf=e=>!e||e.boss||e.rival||e.secret||e.id==null?null:KIT_OF[e.base]||null;
const hasKit=(e,k)=>kitOf(e)===k;
const kitNum=e=>parseInt(String(e.id).slice(1),10)||0;
const stanceOn=(e,t)=>hasKit(e,'stance')&&!hasSt(e,'sundered')&&((t==null?S.run.turn:t)+kitNum(e))%2===0;   // braced this turn
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
  return null;   // not a kit action: the usual checks
}
function kitAct(e,it){   // a foe spends its turn on its kit; true if it did
  const r=S.run;
  if(it.k==='shield'){ const f=r.enemies.find(o=>o.id===it.t); if(!f||!(f.hp>0)) return true; const add=Math.round(e.maxHp*KIT_SHIELD); f.shield=Math.min(Math.round(f.maxHp*KIT_SHIELD_CAP),(f.shield||0)+add); fxe('ward',f); log(e.name+' raises a shield over '+(f===e?'itself':f.name)+'.','bad'); return true; }
  if(it.k==='mark'){ const tg=allies().find(a=>a.hp>0&&fxKey(a)===it.t); if(tg){ r.mk={t:it.t,turn:r.turn+1}; log(e.name+' marks '+nameOf(tg)+': next turn every foe that can reach it strikes it.','bad'); } return true; }
  if(it.k==='cleanse'){ const f=r.enemies.find(o=>o.id===it.t); if(f&&f.hp>0){ delete f.dots; delete f.st; log(e.name+' cleanses '+(f===e?'itself':f.name)+' of every wound and condition.','bad'); } return true; }
  if(it.k==='call'){ const f=r.enemies.find(o=>o.id===it.t); if(f&&f.dead&&!f.risen){ f.dead=false; f.risen=1; f.hp=Math.max(1,Math.round(f.maxHp*KIT_CALL)); delete f.cd; delete f.dots; delete f.st; delete f.stun; f.shield=0; r.corpses=r.corpses.filter(c=>c.id!=='c'+f.id); e.gcU=1; fxe('raise',f); log(e.name+' calls '+f.name+' back up at '+f.hp+' HP.','bad'); } return true; }
  if(it.k==='burrow'){ e.burrow=1; if(r.target===e.id){ const t=liveFoes().find(reachable); if(t) r.target=t.id; } log(e.name+' burrows out of reach.','bad'); return true; }
  return false;
}
function kitDeath(e){   // from checkDeaths, once per death
  const r=S.run; if(r.sweep) return;
  if(hasKit(e,'call')&&!e.gcU) tally('gcBane');
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
  const K=kitOf(e); if(!K||!S.run) return '';
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
  const lv=knowLv(e); if(lv<1) return ' &middot; <span class="kit unk" title="It has a kit you have not learned. Study its kind to read it.">Kit ?</span>';
  const st=lv>=2?kitState(e):'', tip=KITS[K].rule+(lv>=4?' Answer: '+KITS[K].ans:'');
  return ' &middot; <span class="kit" title="'+tip+'">'+KITS[K].name+'</span>'+(st?' <span class="kit-st">'+st+'</span>':'');
}
// ----- the Undone: a body killed by damage it was weak to rises Undone, with an echo of its kind's kit (60% strength).
// The echo is read off the minion's kind (m.kind), so fusion and saves need nothing of their own.
const ECHO={shield:.09,pack:.06,stance:.3,thorns:.09,frenzy:.09,banner:.06,marker:.15,call:.25}, ECHO_PLAIN=.1, ECHO_PACK_MAX=3;
const echoOf=m=>m&&m.id!=='p'&&hasTrait(m,'undone')?(KIT_OF[m.kind]||null):null;
const echoK=m=>{ const k=echoOf(m); return k&&ECHO[k]!=null?k:null; };
function echoDmg(m,tg){   // an Undone minion's echo on its own blows, and every Banner echo standing beside it
  const r=S.run; let k=1; const e=echoOf(m);
  if(e&&ECHO[e]==null) k*=1+ECHO_PLAIN;
  if(e==='pack') k*=1+ECHO.pack*Math.min(ECHO_PACK_MAX,S.army.filter(o=>o!==m&&o.hp>0&&o.rankI===m.rankI).length);
  if(e==='frenzy') k*=1+ECHO.frenzy*r.enemies.filter(o=>o.dead).length;
  if(S.army.some(o=>o!==m&&o.hp>0&&echoOf(o)==='banner')) k*=1+ECHO.banner;
  if(tg&&tg.mkd>=r.turn) k*=1+ECHO.marker;
  return k;
}
function echoHit(m,tg){ if(echoOf(m)==='marker'&&!m.mkU&&tg.hp>0){ m.mkU=1; tg.mkd=S.run.turn+1; return ' and marks it'; } return ''; }   // first hit each room
function echoDr(a,d){ return echoOf(a)==='stance'&&S.run&&S.run.turn%2===0?Math.max(1,Math.round(d*(1-ECHO.stance))):d; }   // allyDr
function echoThorns(e,tg,d){ if(echoOf(tg)!=='thorns'||!(e.hp>0)||!(MELEE[e.role]||e.boss)) return ''; const t=Math.max(1,Math.round(d*ECHO.thorns)); hurtFoe(e,t,'phys'); return ', '+t+' bitten back'; }
function echoCall(a){   // the first minion of yours to fall each room gets up, if an Undone gravecaller stands
  const r=S.run; if(!r||a.id==='p'||a.hp>0||r.gcR===r.room||!S.army.some(o=>o!==a&&o.hp>0&&echoOf(o)==='call')) return false;
  r.gcR=r.room; a.hp=Math.max(1,Math.round(a.maxHp*ECHO.call)); log(a.nick+' is called back up at '+a.hp+' HP by an Undone gravecaller.','ok'); return true;
}
function echoTurn(){   // end of each turn: Undone shieldbearers ward your most hurt minion on even turns
  const r=S.run; if(r.turn%2!==0) return;
  for(const m of S.army){ if(!(m.hp>0)||echoOf(m)!=='shield') continue; const t=S.army.filter(o=>o.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]; if(!t) continue;
    t.mw=Math.min(Math.round(t.maxHp*.3),(t.mw||0)+Math.round(m.maxHp*ECHO.shield)); }
}
function echoRoom(){ for(const m of S.army) delete m.mkU; }   // roomStart
const echoTxt=k=>!k?'':ECHO[k]==null?'+10% damage.':({shield:'Every second turn it wards your most hurt minion for 9% of its own max HP.',pack:'+6% damage for every other minion of its gate in your army, up to +18%.',
  stance:'Takes 30% less damage every other turn.',thorns:'Reflects 9% of melee damage it takes.',frenzy:'+9% damage for every foe fallen this fight.',banner:'Your other minions deal 6% more while it stands.',
  marker:'Its first hit each fight marks the target: your minions deal 15% more to it for 2 turns.',call:'Once a room, the first of your minions to fall gets up at 25% HP.'})[k];

// ===== SWEEP =====
// An outgrown gate, cleared on Normal at least SWEEP_CLEARS times, can be swept from its card on a Normal, uncursed day when you
// stand SWEEP_LV levels above its advice: one watch, the run's rooms generated and won at once (kill XP at SWEEP_XP, gold, trophies,
// drops, bestiary and quest progress), no raising, events, doors or records. A secret master or the rival stops the sweep at the
// boss room and you fight it as usual.
const SWEEP_LV=12, SWEEP_CLEARS=5, SWEEP_XP=.8;
const sweepOk=di=>!!S&&S.mode==='town'&&S.watches>0&&!!(S.ti&&S.ti.clr&&S.ti.clr[di])&&T_('clrN'+di)>=SWEEP_CLEARS&&!heatOf(di)&&!gateMod(di)&&S.player.lvl>=gateRec(di)+SWEEP_LV&&!rivalHere(di);
function sweep(di){
  if(!sweepOk(di)) return false;
  startRun(di); const r=S.run; r.sweep=1; r.hurt=true; r.swSp=[]; tally('sweeps');
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
