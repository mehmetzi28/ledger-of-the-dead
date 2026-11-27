// ===== R12 PR A: army roles 2.0, part one: charms, gear-bearer powers, kill counts and the Ledger's name lines =====
// ----- charms: crafted in town from CHARM_TROPHIES trophies of one foe kind you know (Known in the bestiary) and gold.
// A charm carries that kind's kit as an echo (the Undone's table, game-kits.js): one slot on every minion, moved freely in
// town, back to the pouch (S.charms) when its minion leaves or shatters. A charm of a Ledgered kind is x1.5.
const CHARM_TROPHIES=6, CHARM_GOLD=60, CHARM_LEDGER=.5, CHARM_K=.75;   // R12 PR B: a charm carries its echo at three quarters of an Undone body's (Ledgered: x1.5)
const KNOWN_TIERS=['known','mastered','ledgered'];
const charmKey=name=>TROPHY[name]?name:TROPHY['t:'+name]?'t:'+name:null;
const charmTier=name=>{ const k=charmKey(name); return k?(TROPHY[k].rankI|0)+1:1; };
const charmCost=name=>CHARM_GOLD*charmTier(name);
const charmKnown=name=>{ const t=masteryOf(name); return !!t&&KNOWN_TIERS.includes(t.id); };
const charmV=c=>!c||!KITS[c.k]?0:CHARM_K*(1+(c.src&&masteryOf(c.src)&&masteryOf(c.src).id==='ledgered'?CHARM_LEDGER:0));
const charmName=c=>c&&KITS[c.k]?KITS[c.k].name+' charm':'';
function charmKinds(){   // every kind a charm can be made from: it has a kit and a trophy
  return Object.keys(KIT_OF).filter(n=>charmKey(n));
}
function craftWhy(name){   // why a charm cannot be crafted now, or '' when it can
  if(!KIT_OF[name]||!charmKey(name)) return 'No charm comes from it.';
  if(!charmKnown(name)) return 'Know the kind first ('+masteryRungs(name).find(x=>x.t.id==='known').at+' kills).';
  const n=(S.trophies||{})[charmKey(name)]||0; if(n<CHARM_TROPHIES) return 'Needs '+CHARM_TROPHIES+' trophies ('+n+').';
  if(S.gold<charmCost(name)) return 'Needs '+charmCost(name)+' gold.';
  return '';
}
function craftCharm(name){
  if(S.mode!=='town'||craftWhy(name)) return false; const k=charmKey(name);
  S.trophies[k]-=CHARM_TROPHIES; if(!S.trophies[k]) delete S.trophies[k]; S.gold-=charmCost(name);
  S.charms=Array.isArray(S.charms)?S.charms:[]; const c={k:KIT_OF[name],src:name}; S.charms.push(c); tally('charms'); tally('chK_'+c.k); return c;
}
function giveCharm(uid,i){   // a charm from the pouch onto a minion (its old charm goes back)
  if(S.mode!=='town') return false; const m=findMinion(uid); S.charms=Array.isArray(S.charms)?S.charms:[]; const c=S.charms[i]; if(!m||!c) return false;
  S.charms.splice(i,1); if(m.charm) S.charms.push(m.charm); m.charm=c; return true;
}
function takeCharm(uid){ if(S.mode!=='town') return false; const m=findMinion(uid); if(!m||!m.charm) return false; S.charms=Array.isArray(S.charms)?S.charms:[]; S.charms.push(m.charm); delete m.charm; return true; }
function charmHome(m){ if(!m||!m.charm) return; S.charms=Array.isArray(S.charms)?S.charms:[]; S.charms.push(m.charm); delete m.charm; }   // returnGear: a minion leaving gives its charm back
function charmFuse(k,x){ if(x.charm&&(!k.charm||charmV(x.charm)>charmV(k.charm))){ const t=k.charm; k.charm=x.charm; if(t) x.charm=t; else delete x.charm; } }   // fusion keeps the stronger charm (the other goes home with returnGear)
// ----- gear-bearer powers: a unique on a gear-bearer gives the minion its own version of the unique's power, at MF_K
const MF_K=.4, MF_STAT=.08;
const MINION_FLAG={
  bonebank:'It never shatters.', echo:'10% of its hits strike twice.', undying:'Once a run, a killing blow leaves it at 12% HP.',
  lifedrain:'Heals for 32% of the damage it deals.', soulharvest:'Each of its kills restores 2 mana to you.', cheapraise:'+8% HP and attack.',
  execute:'Deals 20% more to foes under 35% HP.', thorns:'Foes that hit it take 8% back.', censer:'Each of its kills restores 4 mana to you and heals it 5%.',
  swarmguard:'Takes 10% less damage.', chorus:'Its hits drain another foe for 20%.', bindsouls:'+8% HP and attack.', cleave:'Its hits also strike another foe for 24%.',
  infernal:'Starts each fight with a ward of 10% of its max HP.', halo:'Heals 1.6% of its max HP at the end of each turn.', ruin:'Deals 10% more damage.',
  hellfire:'Its hits scorch every other foe for 16%.', deathless:'Twice a run, a killing blow leaves it at 20% HP.', ledgerchain:'+8% HP and attack.',
  quill:'+8% HP and attack.', secondhand:'+8% HP and attack.', twobooks:'+8% HP and attack.'   /* the rival's uniques (game-rival-arc.js) */
};
const MF_STATS=['cheapraise','bindsouls','ledgerchain','quill','secondhand','twobooks'];
const mfFlags=m=>{ if(!m||!m.eq) return []; const o=[]; for(const sl of GEAR_SLOTS){ const it=m.eq[sl]; const f=it&&ITEM[it.id]&&ITEM[it.id].flag; if(f&&MINION_FLAG[f]&&!o.includes(f)) o.push(f); } return o; };
const mfHas=(m,f)=>!!m&&m.id!=='p'&&!!m.eq&&mfFlags(m).includes(f);
const mfStat=m=>!m||!m.eq?0:mfFlags(m).filter(f=>MF_STATS.includes(f)).length*MF_STAT;   // extraMul: flags with no minion meaning
function mfDmg(m,tg){ let k=1; if(mfHas(m,'ruin')) k*=1.1; if(mfHas(m,'execute')&&tg&&tg.hp<tg.maxHp*.35) k*=1.2; if(markLv(m,'malefic')&&condOn(tg)) k*=1+markV(m,'malefic'); return k; }   /* Malefic: a hexer's mark (R12 PR B) */
function mfDr(a,d){ if(mfHas(a,'swarmguard')) d=Math.max(1,Math.round(d*.9)); if(holdOn(a)) d=Math.max(1,Math.round(d*(1-S.run.hold.k))); return d; }   /* Hold the Line (R12 PR B) */
function mfHit(m,tg,d,mt){   // after a minion's blow: the log's tail
  if(!m.eq||!(d>0)) return ''; let x=''; const fl=mfFlags(m); if(!fl.length) return '';
  const others=()=>liveFoes().filter(o=>o!==tg);
  if(fl.includes('lifedrain')&&m.hp>0){ const h=healAlly(m,Math.round(d*.32)); if(h) x+=' and drains '+h+' HP'; }
  if(fl.includes('cleave')){ const o=others(); if(o.length){ const t=o[0], d2=Math.max(1,Math.round(d*.24)); hurtFoe(t,d2,mt); x+=' and cuts '+t.name+' for '+d2; } }
  if(fl.includes('hellfire')){ const o=others(); if(o.length){ const d2=Math.max(1,Math.round(d*.16)); o.forEach(t=>hurtFoe(t,d2,'fire')); x+=' and scorches the rest for '+d2; } }
  if(fl.includes('chorus')){ const o=others(); if(o.length){ const t=o[o.length-1], d2=Math.max(1,Math.round(d*.2)); hurtFoe(t,d2,'shad'); x+=' and drains '+t.name+' for '+d2; } }
  if(fl.includes('echo')&&tg.hp>0){ m.ecN=(m.ecN||0)+1; if(m.ecN>=10){ m.ecN=0; hurtFoe(tg,d,mt); x+=', and again for '+d; } }   // every tenth blow: no Math.random
  return x;
}
function mfThorns(e,tg,d){ let x=''; if(mfHas(tg,'thorns')&&e.hp>0){ const t=Math.max(1,Math.round(d*.08)); hurtFoe(e,t,'phys'); x+=', '+t+' thrown back'; }
  if(tg.spec==='avenger'&&e.hp>0&&d>0){ const t=Math.max(1,Math.round(d*.3)); hurtFoe(e,t,'phys'); x+=', and '+tg.nick+' avenges '+t; } return x; }   /* the Avenger (R12 PR B) */
function mfKill(m){ if(!m||!m.eq) return; const P=S.player;
  if(mfHas(m,'soulharvest')) P.mana=Math.min(pMana(),P.mana+2);
  if(mfHas(m,'censer')){ P.mana=Math.min(pMana(),P.mana+4); if(m.hp>0) healAlly(m,Math.round(m.maxHp*.05)); } }
function mfRoom(){ for(const m of S.army) if(m.hp>0&&mfHas(m,'infernal')) m.mw=Math.max(m.mw||0,Math.round(m.maxHp*.1)); }
function mfTurn(){ for(const m of S.army) if(m.hp>0&&mfHas(m,'halo')) healAlly(m,Math.max(1,Math.round(m.maxHp*.016))); }
function mfSave(a){   // a killing blow on a gear-bearer with Undying or Deathless: back up, so many times a run
  const r=S.run; if(!r||!a.eq) return false; r.mfS=r.mfS||{}; const n=r.mfS[a.uid]||0;
  const cap=(mfHas(a,'undying')?1:0)+(mfHas(a,'deathless')?2:0); if(n>=cap) return false;
  r.mfS[a.uid]=n+1; a.hp=Math.max(1,Math.round(a.maxHp*(mfHas(a,'deathless')&&n>=(mfHas(a,'undying')?1:0)?.2:.12))); log(a.nick+' refuses to fall and stands at '+a.hp+' HP.','ok'); return true;
}
// ----- kill counts and name lines: each minion counts its kills (m.kills); at NAME_AT a minion's name is written into the
// Ledger (S.nameLines, at most NAME_MAX): +NAME_K to its role's HP and attack for your whole army, kept when it falls.
const NAME_AT=100, NAME_MAX=10, NAME_K=.01;
function minionKill(m,e){   // checkDeaths: the minion whose blow (or wound) took the foe
  if(!m||m.id==='p'||m.uid==null||!S.army.includes(m)) return; m.kills=(m.kills||0)+1; tally('mKills'); mfKill(m); specKill(m);
  if(m.kills>=NAME_AT&&!m.nl){ S.nameLines=Array.isArray(S.nameLines)?S.nameLines:[]; if(S.nameLines.length<NAME_MAX){ m.nl=1; S.nameLines.push({name:m.nick,role:m.role,day:S.day}); syncArmy(); tally('nameLines');
    notify(m.nick+' has taken '+NAME_AT+' lives: its name is written into the Ledger. Every '+ROLES[m.role].label.toLowerCase()+' of yours is a little stronger.','ok'); if(S.run) log('The Ledger writes '+m.nick+'\'s name.','story'); } }
}
const nameK=role=>!Array.isArray(S&&S.nameLines)?0:S.nameLines.filter(l=>l.role===role).length*NAME_K;
function armyFix(g){   // normalizeSave: charms, kill counts, name lines (only fields the save has)
  const okC=c=>!!c&&typeof c==='object'&&KITS[c.k]&&typeof c.src==='string'&&KIT_OF[c.src]===c.k;
  if('charms' in g) g.charms=Array.isArray(g.charms)?g.charms.filter(okC).map(c=>({k:c.k,src:c.src})):[];
  if('nameLines' in g) g.nameLines=Array.isArray(g.nameLines)?g.nameLines.filter(l=>l&&typeof l.name==='string'&&ROLES[l.role]).slice(0,NAME_MAX).map(l=>({name:cleanText(l.name).slice(0,40),role:l.role,day:Math.max(1,Math.floor(+l.day||1))})):[];
  const all=(g.army||[]).concat(g.reserve||[],g.waiting||[],...(Array.isArray(g.raids)?g.raids:[]).map(x=>(x&&x.units)||[]));
  for(const m of all){ if(!m||typeof m!=='object') continue;
    if('charm' in m&&!okC(m.charm)) delete m.charm; else if(m.charm) m.charm={k:m.charm.k,src:m.charm.src};
    if('kills' in m) m.kills=Math.max(0,Math.floor(+m.kills||0)); if('nl' in m) m.nl=1;
    for(const k of ['amU','hxN','ecN']) if(k in m&&typeof m[k]!=='number') delete m[k]; specFix(m); }
}
// ===== R12 PR B: the Hexer, Elder actives and specializations =====
// ----- the Hexer (ROLES.hexer, raised from the six hexer foes): back row, low HP and attack, and every hit leaves a
// condition by its trait. At most HEX_PER army places per hexer bring conditions (hexCap); more fight plainly.
const HEX_T=2, HEX_PER=4, SEER_K=.1;
const hexCap=()=>Math.max(1,Math.floor(slots()/HEX_PER));
const hexOn=m=>m&&m.role==='hexer'&&S.army.filter(x=>x.role==='hexer').indexOf(m)<hexCap();
function hexHit(m,tg){   // a hexer's blow: its condition (a Hex, or its trait's wound); Augur longer, Malign a Hex on top
  if(!hexOn(m)||!(tg.hp>0)) return ''; const t=HEX_T+markLv(m,'augur'), a=m.atk||1; let x='';
  if(hasTrait(m,'rimeborn')){ if(addSt(tg,'chilled',t)) x=' and chills it'; }
  else if(hasTrait(m,'venom')){ addDot(tg,'poison',a*.2,t+1); x=' and poisons it'; }
  else if(hasTrait(m,'necrotic')){ addDot(tg,'blight',a*.15,t); if(tg.dots&&tg.dots.blight) x=' and blights it'; }
  else if(hasTrait(m,'cinderborn')){ addDot(tg,'burn',a*.2,t); x=' and burns it'; }
  else if(addSt(tg,'hexed',t)) x=' and hexes it';
  if(m.spec==='malign'&&x&&!x.includes('hexes')&&addSt(tg,'hexed',t)) x+=' and hexes it';
  if(m.spec==='seer'){ tg.mkd=S.run.turn+1; tg.mkv=SEER_K/ECHO.marker; }
  return x;
}
const condOn=e=>!!e&&((e.st&&Object.keys(e.st).some(k=>e.st[k]>0))||(e.dots&&Object.keys(e.dots).length>0));
// ----- specializations: at Elder, one of two per role, for good (m.spec)
const SPECS={
  bastion:{role:'vanguard',name:'Bastion',desc:'+20% HP, and your Taunt lasts a turn longer while it stands.'},
  avenger:{role:'vanguard',name:'Avenger',desc:'Hits back 30% of every blow it takes.'},
  duelist:{role:'striker',name:'Duelist',desc:'+20% crit chance against a foe it has already hit this fight.'},
  cleaver:{role:'striker',name:'Cleaver',desc:'Its hits splash 25% onto another foe.'},
  saint:{role:'mender',name:'Saint',desc:'Heals 25% more.'},
  plague:{role:'mender',name:'Plague-doctor',desc:'Its heals also clear wounds and conditions, but heal 15% less.'},
  soultaker:{role:'reaper',name:'Soul-taker',desc:'Its first kill each room harvests a Soul.'},
  executioner:{role:'reaper',name:'Executioner',desc:'Execute works under 50% HP instead of 40%, and Collect takes foes under 25%.'},
  seer:{role:'hexer',name:'Seer',desc:'Its hits mark the foe: your minions deal 10% more to it next turn.'},
  malign:{role:'hexer',name:'Malign',desc:'Its hits also Hex, on top of its own condition.'}
};
const SPEC_AT=2;
const roleSpecs=r=>Object.keys(SPECS).filter(k=>SPECS[k].role===r);
const mspecPend=m=>!!m&&!m.thrall&&(m.stage||0)>=SPEC_AT&&!m.spec&&roleSpecs(m.role).length>0;
function chooseMSpec(uid,k){ if(S.mode==='battle') return false; const m=findMinion(uid); if(!m||!mspecPend(m)||!SPECS[k]||SPECS[k].role!==m.role) return false; m.spec=k; tally('specs'); syncMinion(m); return true; }
const specHp=m=>m&&m.spec==='bastion'?.2:0;   // extraMul (HP)
const execAt=m=>m&&m.spec==='executioner'?.5:.4;
const duelK=(m,tg)=>m.spec==='duelist'&&tg&&tg.dh&&tg.dh.includes(m.uid)?.2:0;
const healK=m=>(m.spec==='saint'?1.25:m.spec==='plague'?.85:1)*vilBlessK();   /* Saint Aldric's blessing (game-villages.js) */
function specHeal(m,a){ if(m.spec==='plague'&&a){ clearDots(a); if(a.st) delete a.st; } }   // the mender's heal
function specHit(m,tg,d,mt){   // after a blow: Cleaver's splash, the Duelist's memory, the hexer's condition
  let x=''; if(m.spec==='duelist'){ tg.dh=tg.dh||[]; if(!tg.dh.includes(m.uid)) tg.dh.push(m.uid); }
  if(m.spec==='cleaver'){ const o=liveFoes().filter(e=>e!==tg); if(o.length){ const t=o[0], d2=Math.max(1,Math.round(d*.25)); hurtFoe(t,d2,mt); x+=' and cleaves '+t.name+' for '+d2; } }
  if(m.role==='hexer') x+=hexHit(m,tg);
  return x;
}
function specKill(m){ const r=S.run; if(m.spec==='soultaker'&&r){ r.stk=r.stk||{}; if(r.stk[m.uid]!==r.room){ r.stk[m.uid]=r.room; gainSoul(); } } }
// ----- Elder actives: an order to one Elder minion, once a room (twice from Eternal; Ancient +50%), costing your action
const ACTIVES={
  vanguard:{name:'Hold the Line',desc:'This turn every foe strikes it, and it takes 30% less damage.'},
  striker:{name:'Execute Order',desc:'It strikes your target at once for 160% of its attack; a kill gives your action back.'},
  mender:{name:'Last Rites',desc:'Heals every minion 15% of its max HP.'},
  reaper:{name:'Collect',desc:'Takes a foe that is not a boss under 15% HP at once; the body is Clean.'},
  hexer:{name:'Doom',desc:'Your target takes 25% more from the next three hits.'}
};
const MA_AT=2, MA_HOLD=.3, MA_EXEC=1.6, MA_RITES=.15, MA_COLLECT=.15, MA_DOOM=.25, MA_DOOM_N=3, MA_EMP=1.5;
const maEmp=m=>(m.stage||0)>=3?MA_EMP:1;
const maUses=m=>(m.stage||0)>=4?2:1;
const collectAt=m=>(m.spec==='executioner'?.25:MA_COLLECT)*maEmp(m);
function collectFoe(m){ const t=currentTarget(); const ok=e=>e&&e.hp>0&&!e.boss&&!e.rival&&e.hp<e.maxHp*collectAt(m); return ok(t)?t:liveFoes().filter(ok).sort((a,b)=>a.hp-b.hp)[0]||null; }
function canActive(m){
  const r=S.run; if(S.mode!=='battle'||!r||!m||!(m.hp>0)||!S.army.includes(m)||(m.stage||0)<MA_AT||!ACTIVES[m.role]||!liveFoes().length) return false;
  if(((r.maU||{})[m.uid]||0)>=maUses(m)) return false;
  if(m.role==='reaper') return !!collectFoe(m);
  if(m.role==='mender') return S.army.some(a=>a.hp>0&&a.hp<a.maxHp);
  if(m.role==='hexer'||m.role==='striker') return !!currentTarget();
  return true;
}
function useActive(uid){   // act('ma:uid'): true, or 'free' when Execute Order kills
  const m=S.army.find(x=>x.uid===uid); if(!canActive(m)) return false; const r=S.run, k=maEmp(m); r.maU=r.maU||{}; r.maU[m.uid]=(r.maU[m.uid]||0)+1; tally('actives'); tally('ma_'+m.role);
  if(m.role==='vanguard'){ r.hold={uid:m.uid,t:r.turn,k:Math.min(.6,MA_HOLD*k)}; log(m.nick+' holds the line: every foe turns on it.','ok'); return true; }
  if(m.role==='mender'){ let tot=0; for(const a of S.army) if(a.hp>0) tot+=healAlly(a,Math.round(a.maxHp*MA_RITES*k)); log(m.nick+' speaks the last rites: your army mends '+tot+' HP.','ok'); return true; }
  if(m.role==='hexer'){ const t=currentTarget(); t.doom=MA_DOOM_N; t.doomK=1+MA_DOOM*k; mark(t,0,0); log(m.nick+' dooms '+t.name+': the next three hits land harder.','ok'); return true; }
  if(m.role==='reaper'){ const t=collectFoe(m); HITTER=m; t.shield=0; t.cd='clean'; t.kb=t.hp; t.lt=null; mark(t,t.hp,0); t.hp=0; log(m.nick+' collects '+t.name+'.','ok'); checkDeaths(); HITTER=null; return true; }
  const t=currentTarget(), d=hit(m.atk*dmgMul()*MA_EXEC*k*echoDmg(m,t)*mfDmg(m,t)); HITTER=m; hurtFoe(t,d,minionType(m)); log(m.nick+' strikes '+t.name+' on your order for '+d+'.','ok'); checkDeaths(); HITTER=null;
  if(!(t.hp>0)){ log('The kill gives you your action back.','ok'); return 'free'; } return true;
}
const holdOn=a=>{ const h=S.run&&S.run.hold; return !!h&&h.uid===a.uid&&h.t===S.run.turn; };
function holdPool(alive){ const h=S.run&&S.run.hold; if(!h||h.t!==S.run.turn) return null; const m=alive.find(a=>a.uid===h.uid&&a.hp>0); return m?[m]:null; }   // tauntPool
function specFix(m){ if('spec' in m&&!(SPECS[m.spec]&&SPECS[m.spec].role===m.role&&(m.stage||0)>=SPEC_AT)) delete m.spec; }   // armyFix
