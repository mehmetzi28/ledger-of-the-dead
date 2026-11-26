// ===== BOSS ABILITIES =====
// Every gate boss has a signature move it uses every few turns instead of attacking. Moves marked warn are telegraphed a turn
// ahead: raise Bone Ward, or freeze the boss with Grave Chill to break its focus and cancel the move. Tower wardens borrow these.
const BOSS_ABIL={
  swarm:   {name:'Call the Swarm', every:3,warn:false,desc:'Calls two more of its kind into the fight.'},
  bonewall:{name:'Bone Wall',      every:4,warn:false,desc:'Shields every foe for 20% of its max HP (a shield holds at most 40%).'},
  cinder:  {name:'Cinder Wave',    every:3,warn:true, desc:'Hits you and every minion for 70% of its attack and burns each of you for 2 turns.'},
  hymn:    {name:'Hymn of Silence',every:4,warn:true, desc:'Silences your skills for 2 turns and mends every foe for 10% of its max HP.'},
  seedfall:{name:'Seedfall',       every:4,warn:false,desc:'Mends every foe for 15% of its max HP and sprouts a new one.'},
  decree:  {name:'Royal Decree',   every:4,warn:true, desc:'One blow worth 45% of your max HP. Ward soaks it.'},
  sunder:  {name:'Sundering Blow', every:3,warn:true, desc:'One blow worth 35% of your max HP. Taunt turns it onto a vanguard; a Focus crit or Grave Chill breaks it.'}
};
const GATE_ABIL=['swarm','bonewall','cinder','hymn','seedfall','decree'];
const SUMMON_CAP=4;   // adds a boss may call per fight, so a fight cannot be farmed forever
function giveAbility(e,id,faster){ for(const k of ['kit','kitIx','mvN','twist','imm','res','edictT']) delete e[k]; e.abil=id; e.abilT=BOSS_ABIL[id].every-(faster||0); e.summoned=0; e.fast=faster||0; }
function bossTurn(e){   // true if the boss spent its turn on its ability (or on gathering for it)
  if(!BOSS_ABIL[e.abil]) return false;
  const gap=mv=>Math.max(2,BOSS_ABIL[mv].every-(e.fast||0)-(omen()==='ashfall'?1:0));
  if(e.charging){ const mv=e.move||e.abil; e.charging=false; e.move=null; BLOW={n:e.name,k:'sig',mv,w:1}; fireAbility(e,mv); BLOW=null; if(e.kit&&mv!=='sunder') nextMove(e); e.abilT=gap(mv); return true; }
  if(--e.abilT>0) return false;
  const mv=sigMove(e), A=BOSS_ABIL[mv]; if(e.phase2&&!e.kit) e.alt=!e.alt;   // the second phase alternates with Sundering Blow
  if(A.warn||e.phase2){ e.charging=true; e.move=mv; if(mv==='edict'){ const m=edictTarget(e); log(e.name+' raises the Edict of Ash against '+(m?m.nick:'no one')+'!','bad'); } log(e.name+' gathers itself for '+A.name+'! '+A.desc,'bad'); sfx('warn'); fxe('charge',e); return true; }
  BLOW={n:e.name,k:'sig',mv}; fireAbility(e,mv); BLOW=null; if(e.kit) nextMove(e); e.abilT=gap(mv); return true;
}
function chargeInfo(e){   // a charging boss: the move it lands next turn, what answers it (from the rules here and in fireAbility), and the answer keys the action bar marks
  if(!e||!e.charging||e.hp<=0) return null; const mv=e.move||e.abil, A=BOSS_ABIL[mv]; if(!A) return null;
  if(mv==='sunder') return {mv,name:A.name,hint:'Taunt it onto a vanguard, or freeze it',ans:['vanguard','chill','striker']};
  if(mv==='edict'){ const m=S.army&&S.army.find(x=>fxKey(x)===e.edictT); return {mv,name:A.name,hint:(m?m.nick+' is named. ':'')+'Guard, Taunt onto another vanguard, or freeze it',ans:['guard','vanguard','chill','striker']}; }
  if(mv==='lance'||mv==='called') return {mv,name:A.name,hint:'Ward or freeze it',ans:['ward','chill','striker']};   /* Taunt sends the blow at a vanguard */
  if(mv==='cinder'||mv==='decree') return {mv,name:A.name,hint:'Ward or freeze it',ans:['ward','chill','striker']};   /* a blow: a ward soaks it */
  return {mv,name:A.name,hint:'Freeze it or Focus-crit it',ans:['chill','striker']};   /* no damage to soak: only breaking the focus stops it */
}
function summonAdd(e,kind){   // kind: a set kind of foe (the Pale Sovereign's Court Summons)
  if(e.summoned>=SUMMON_CAP||liveFoes().length>=5) return null;
  const mk=()=>{ const a=e.tw?makeTowerEnemy(e.tw,false,-1):makeEnemy(S.run.rift?S.run.di:e.rankI,Math.max(1,e.lvl-2),false); if(kind) setKind(a,kind); return a; }, hasMender=liveFoes().some(x=>x.role==='mender');
  let a=mk(); for(let i=0;i<30&&hasMender&&a.role==='mender';i++) a=mk(); if(hasMender&&a.role==='mender') return null;   // never a second mender (bug found in play-testing)
  if(e.tw) foeScale([a],TW.foeAtk); else { foeScale([a],foeAtkMul(S.run.di)); bulwark([a]); riftScale([a]); heatScale([a]); }   /* as buildRoom scales a room's foes */
  affixAll([a]); foeRise([a]); e.summoned++; S.run.enemies.push(a); return a;
}
function setKind(a,kind){ for(const D of DUNGEONS){ const t=D.mobs.find(m=>m[0]===kind); if(!t) continue; const s=mobStats(a.rankI,a.lvl,t[2],t[3],false,a.elite); a.name=(a.elite?a.name.split(' ')[0]+' ':'')+t[0]; a.base=t[0]; a.role=t[1]; a.hf=t[2]; a.af=t[3]; a.maxHp=a.hp=s.hp; a.atk=s.atk; return a; } return a; }
function fireAbility(e,mv){
  mv=mv||e.abil; const r=S.run, P=S.player, A=BOSS_ABIL[mv], foes=liveFoes();
  if(mv==='swarm'){ const got=[summonAdd(e),summonAdd(e)].concat(e.twist==='crown'?[summonAdd(e)]:[]).filter(Boolean); if(e.twist==='crown') got.forEach(a=>{ a.kitO='pack'; }); log(got.length?e.name+' uses '+A.name+': '+got.map(x=>x.name).join(' and ')+' join the fight.':e.name+' calls, but nothing more answers.','bad'); }
  else if(mv==='bonewall'){ foes.forEach(f=>{ f.shield=Math.min(Math.round(f.maxHp*.4),(f.shield||0)+Math.round(f.maxHp*.2)); fxe('ward',f); }); log(e.name+' raises a Bone Wall. Every foe is shielded.','bad'); }
  else if(mv==='cinder'){
    let tot=0;
    allies().filter(a=>a.hp>0).forEach(a=>{
      const d=hit(e.atk*(e.secret?.45:.7)*enrage(e));   /* a secret master's wave is spread thinner: at full strength it wiped every army */
      hurtAlly(a,d,'fire');
      fxe('hurt',a,{fire:1});
      addDot(a,'burn',e.atk*.15,2);
      tot+=d;
      if(a.hp<=0&&a.id!=='p') log(a.nick+' is down.','bad');
    });
    log(e.name+' unleashes a Cinder Wave for '+tot+' damage across your side.','bad');
  }
  else if(mv==='hymn'){ r.silence=3; foes.forEach(f=>{ f.hp=Math.min(f.maxHp,f.hp+Math.round(f.maxHp*.1)); }); log(e.name+' sings the Hymn of Silence. Your skills are silenced for 2 turns and every foe mends.','bad'); }
  else if(mv==='seedfall'){ foes.forEach(f=>{ f.hp=Math.min(f.maxHp,f.hp+Math.round(f.maxHp*.15)); }); const a=summonAdd(e); if(a&&e.kit) a.seed=r.turn; log(e.name+' scatters Seedfall. Every foe mends'+(a?' and '+a.name+' sprouts from the ground':'')+'.','bad'); }
  else if(mv==='decree'){ const d=Math.round(pMax()*.45*enrage(e)); hurtAlly(P,d); fxe('hurt',P,{crit:1}); log(e.name+' speaks a Royal Decree. It strikes you for '+d+'.','bad'); }
  else if(fireKitMove(e,mv)){}   /* the move sets' new moves (game-boss-kits.js) */
  else if(mv==='sunder'){ const v=r.taunt>0?S.army.filter(m=>m.role==='vanguard'&&m.hp>0):[];
    if(v.length){ const t=pick(v), d=hit(e.atk*2.2*enrage(e)); hurtAlly(t,d); fxe('hurt',t,{crit:1}); log(e.name+' brings down a Sundering Blow, but '+t.nick+' takes it for you: '+d+' damage.'+(t.hp<=0?' '+t.nick+' is down.':''),'bad'); addSt(t,'sundered',2); }
    else { const d=Math.round(pMax()*.35*enrage(e)); hurtAlly(P,d); fxe('hurt',P,{crit:1}); log(e.name+' brings down a Sundering Blow on you for '+d+'.','bad'); addSt(P,'sundered',2); } }   /* the blow also cracks your guard: Sundered */
  sfx('boss');
}
function playerFalls(){   // the player hit 0 HP: revive from gear if possible, otherwise the run is lost. True if defeated.
  const r=S.run, P=S.player, lim=hasFlag('deathless')?2:hasFlag('undying')?1:0;
  if((r.revives||0)<lim){ r.revives=(r.revives||0)+1; P.hp=Math.round(pMax()*(hasFlag('deathless')?.5:.3)); log('Your armor refuses to break. You rise at '+P.hp+' HP.','ok'); return false; }
  if(blessed('hon')&&!r.tw&&!r.grace){ r.grace=true; P.hp=Math.max(1,Math.round(pMax()*GRACE_HP)); tally('graced'); log('The Old Gods will not let you fall. You rise at '+P.hp+' HP.','story'); moment('Grace','gold'); return false; }
  defeat(); return true;
}
function sellItem(u){ if(S.mode!=='town') return 0; const i=S.inv.findIndex(x=>x.u===u); if(i<0) return 0; const it=S.inv[i], d=ITEM[it.id]; if(d.uq||it.lk) return 0; S.inv.splice(i,1); const g=sellValue(it); S.gold+=g; tally('soldItems'); sfx('coin'); return g; }
const isJunk=it=>{ const d=ITEM[it.id]; return !!d&&!d.uq&&!it.lk&&d.tier<=1; };   // Common and Uncommon pieces in the bag, never locked ones (and never what you wear)
const BULK_TIERS=[2,3,4];   // Rare, Epic, Legendary: each has its own sell and salvage button
const tierLot=t=>S.inv.filter(it=>{ const d=ITEM[it.id]; return !!d&&!d.uq&&!it.lk&&d.tier===t; });
function sellTier(t){ if(S.mode!=='town'||!BULK_TIERS.includes(t)) return null; const list=tierLot(t); let g=0; for(const it of list) g+=sellItem(it.u); return {n:list.length,g}; }
function sellJunk(){ if(S.mode!=='town') return null; const list=S.inv.filter(isJunk); let g=0; for(const it of list) g+=sellItem(it.u); return {n:list.length,g}; }

// ===== STATUS EFFECTS =====
// Damage over time: bleed (crits from enemy strikers), burn (Cinder Wave), poison (Venomous minions). One of each kind per unit;
// a new dose refreshes it. They tick at the end of each turn, ignore ward and armor, and wear off when you leave a room.
const DOTS={poison:{name:'Poisoned'},bleed:{name:'Bleeding'},burn:{name:'Burning'},blight:{name:'Blighted'}};   // blight: a rotting wound that also halves the healing its bearer receives
DOTS.poison.tip='Venom eats HP at the end of each turn.'; DOTS.bleed.tip='An open wound bleeds at the end of each turn.'; DOTS.burn.tip='Fire burns at the end of each turn.'; DOTS.blight.tip='Rot eats HP at the end of each turn and halves the healing received.';
function addDot(u,k,d,t){ d=Math.round(d); if(d<1||!(u.hp>0)||hasAff(u,'warded')||hasTrait(u,'warded')||(k==='burn'&&hasTrait(u,'cinderborn'))) return; u.dots=u.dots||{}; const o=u.dots[k]; u.dots[k]=o?{d:Math.max(o.d,d),t:Math.max(o.t,t)}:{d,t}; }
const clearDots=u=>{ if(u) delete u.dots; };
const BLIGHT_HEAL=.5;   // a blighted unit receives half the healing
const blightK=u=>(u&&u.dots&&u.dots.blight)?BLIGHT_HEAL:1;
// Conditions: turns left in u.st[k]. They tick down at the end of each turn (skillTick) and wear off when you leave a room, like damage over time.
// Sundered: takes 25% more damage. Hexed: deals 20% less. Hasted: strikes again for 50% at the end of each turn. Chilled (Grave Chill rank 2+): takes 20% more.
const CONDS={
  sundered:{name:'Sundered',desc:'Armor cracked: takes 25% more damage.'},
  hexed:   {name:'Hexed',   desc:'Deals 20% less damage.'},
  hasted:  {name:'Hasted',  desc:'Strikes again for 50% damage at the end of each turn.'},
  chilled: {name:'Chilled', desc:'Slowed by frost: takes 20% more damage.'}
};
const SUNDER_MUL=1.25, HEX_MUL=.8, HASTE_MUL=.5, CHILL_MUL=1.2, ST_CH=1/3, VAN_SUNDER=.1;   // ST_CH: the Sundering and Hexing affixes and the Crushing and Hexing traits; VAN_SUNDER: a vanguard minion's hit
function addSt(u,k,t){ if(!u||!(u.hp>0)||!CONDS[k]||stImmune(u,k)) return false; u.st=u.st||{}; u.st[k]=Math.max(u.st[k]||0,t); return true; }
const hasSt=(u,k)=>!!(u&&u.st&&u.st[k]>0);
const hexK=u=>hasSt(u,'hexed')?HEX_MUL:1;
const clearSt=u=>{ if(u) delete u.st; };
const clearAll=u=>{ clearDots(u); clearSt(u); if(u){ delete u.mw; delete u.lock; delete u.root; } };   /* lock, root: a boss's Keymaster's Lock and Iron Thorns */   /* mw: a Warden's ward on a minion */   // leaving a room: every status ends
function tickSt(){ const r=S.run; if(!r) return; for(const u of r.enemies.concat(allies())){ if(!u.st) continue; for(const k of Object.keys(u.st)) if(--u.st[k]<=0) delete u.st[k]; if(!Object.keys(u.st).length) delete u.st; } }
function foeTarget(alive){ const w=alive.map(a=>a.role==='vanguard'?5:2); let roll=Math.random()*w.reduce((x,y)=>x+y,0), tg=alive[0];   // vanguards draw the eye
  for(let i=0;i<alive.length;i++){ roll-=w[i]; if(roll<=0){ tg=alive[i]; break; } } return tg; }
// ===== ROWS =====
// Every unit stands in the Front ('f') or Back ('b') row. A minion's row is m.row (switched on the Army tab), else vanguards and reapers stand in front;
// you stand at the back. Foes: bosses, the rival, vanguards and reapers in front. Vanguards and reapers are melee: while the other side has a
// standing front row they reach only it. Strikers, menders and bosses reach anyone; Taunt, your Strike and skills, cleaves and splash ignore rows.
// Your vanguards and reapers moved to the back row strike over the line for BACK_MELEE of their damage: safety costs reach.
const MELEE={vanguard:1,reaper:1}, BACK_MELEE=.5;
const rowOf=u=>u.id==='p'?'b':u.id!=null?((u.boss||u.rival||MELEE[u.role])&&!kitBack(u)?'f':'b'):(u.wall?'f':u.row==='f'||u.row==='b'?u.row:MELEE[u.role]?'f':'b');
const rowK=m=>MELEE[m.role]&&rowOf(m)==='b'?BACK_MELEE:1;   // a minion's damage factor from its row
const frontOf=L=>L.filter(u=>u.hp>0&&rowOf(u)==='f');
const foeReach=(e,alive)=>{ const t=tauntPool(alive); if(t!==alive||!MELEE[e.role]||e.boss) return t; const f=frontOf(alive); return f.length?f:alive; };   // whom a foe may strike: Taunt first, then the row rule
function minionTarget(m){ const t=currentTarget(); if(!t||!MELEE[m.role]||rowOf(t)==='f') return t; return frontOf(liveFoes()).sort((a,b)=>a.hp-b.hp)[0]||t; }   // a melee minion hits your target if it can reach it, else the weakest foe in front
function setRow(uid){ if(S.mode==='battle') return; const m=S.army.concat(S.reserve||[]).find(x=>x.uid===uid); if(m&&!m.wall) m.row=rowOf(m)==='f'?'b':'f'; }   // out of battle only, so a fight's foe intents never shift under you
// ===== FOE INTENTS =====
// Each foe's next action (e.it: {k:'atk', t: the fxKey of you or a minion} or {k:'heal', t: a foe id}) is rolled when your turn starts
// and shown on its card; on its turn it does exactly that. Rolled again only if its target fell, Taunt pulled it onto a vanguard (or lapsed: tn) or a row change put the target out of reach;
// a frozen foe loses it. Same weights and odds as rolling on its turn. Boss moves are read off the boss (bossTurn) and shown over it; a move turn keeps e.it.
// e.it2 is the action after it, rolled with it and moved up when e.it is spent, checked by the same rules (a mender heals whoever is most hurt then); Known foes show it.
const tauntPool=alive=>{ if(S.run.taunt>0){ const v=alive.filter(a=>a.role==='vanguard'&&a.id!=='p'); if(v.length) return v; } return alive; };
const mendTarget=()=>liveFoes().filter(x=>x.hp<x.maxHp*.7).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
function rollIntent(e,k){ k=k||'it';
  const alive=allies().filter(hittable); if(!alive.length) return e[k]=null;
  const T=S.run.turn+(k==='it2'?1:0), ki=kitIntent(e,k,T,alive);   /* a kit may plan its own action (game-kits.js) */
  if(ki&&ki.k) return e[k]=ki;
  if(e.role==='mender'){ const h=mendTarget(); if(h) return e[k]={k:'heal',t:h.id}; }
  const reach=foeReach(e,alive), taunted=tauntPool(alive)!==alive, mk=markedFor(T,reach);
  let tg=mk||foeTarget(reach);
  if(ki&&ki.amb&&!taunted){ const back=alive.filter(a=>a.id!=='p'&&rowOf(a)==='b'); tg=back.length?pick(back):S.player; }   /* an Ambusher's first blow ignores rows */
  const bw=ki&&ki.amb?null:bulwarkFor(tg,reach);
  const it=e[k]=bw?{k:'atk',t:fxKey(bw),bw:1}:{k:'atk',t:fxKey(tg)};   // bw: a Bulwark steps in front of a blow meant for your back row
  if(ki&&ki.amb) it.amb=1; if(ki&&ki.sf) it.sf=1; if(mk) it.mk=1;
  if(taunted) it.tn=1; return it;
}
function markedFor(T,reach){ const m=S.run.mk; if(!m||m.turn!==T||tauntPool(reach)!==reach) return null; return reach.find(a=>fxKey(a)===m.t)||null; }   // a foe Marker's mark: every foe that can reach it strikes it
function intentOk(e,k){ const it=e[k||'it']; if(!it) return false;
  { const ko=kitIntentOk(e,it); if(ko!=null) return ko; }
  if(it.amb&&e.ambU) return false;
  if(it.k==='atk'&&!it.mk&&S.run.mk&&S.run.mk.turn===S.run.turn+(k==='it2'?1:0)&&!(S.run.taunt>0)){ const alive=allies().filter(a=>a.hp>0); if(markedFor(S.run.mk.turn,foeReach(e,alive))) return false; }   /* the mark takes over a blow planned before it */
  if(it.k==='heal'){ const h=S.run.enemies.find(x=>x.id===it.t); return !!h&&h.hp>0; }
  if(it.tn&&!(S.run.taunt>0)) return false;
  const alive=allies().filter(hittable), tg=alive.find(a=>fxKey(a)===it.t); return !!tg&&foeReach(e,alive).includes(tg); }
function planFoes(){ const r=S.run; if(!r||!r.enemies) return;
  for(const e of liveFoes()){
    if(!e.it&&e.it2){ e.it=e.it2; delete e.it2; }
    if(e.role==='mender'&&e.it){ const h=mendTarget(); if(h?!(e.it.k==='heal'&&e.it.t===h.id):e.it.k==='heal') delete e.it; }   // as a fresh roll would choose
    if(!intentOk(e)) rollIntent(e);
    if(!intentOk(e,'it2')) rollIntent(e,'it2');
  } }
function planTxt(e,it){   // the words for a planned attack or heal
  if(!it) return null;
  if(it.k==='heal'){ const h=S.run.enemies.find(x=>x.id===it.t); if(!h) return null; return {k:'heal',txt:h===e?'Heals itself':'Heals '+h.name,tip:'Mends a wounded foe on its turn.'}; }
  if(it.k==='shield'){ const h=S.run.enemies.find(x=>x.id===it.t); if(!h) return null; return {k:'shield',txt:h===e?'Shields itself':'Shields '+h.name,tip:KITS.shield.rule}; }
  if(it.k==='cleanse'){ const h=S.run.enemies.find(x=>x.id===it.t); if(!h) return null; return {k:'heal',txt:h===e?'Cleanses itself':'Cleanses '+h.name,tip:KITS.purify.rule}; }
  if(it.k==='call'){ const h=S.run.enemies.find(x=>x.id===it.t); if(!h) return null; return {k:'abil',txt:'Calls back '+h.name,tip:KITS.call.rule+' Burst the body or freeze the caller to stop it.'}; }
  if(it.k==='burrow') return {k:'abil',txt:'Burrows',tip:KITS.burrow.rule};
  if(it.k==='mark'){ const m=allies().find(a=>fxKey(a)===it.t); if(!m) return null; return {k:'abil',txt:'Marks '+nameOf(m),tip:KITS.marker.rule}; }
  const tg=allies().find(a=>fxKey(a)===it.t); if(!tg) return null;
  if(it.bw) return {k:'atk',tg,txt:'Attacks '+nameOf(tg),tip:'Bulwark: '+nameOf(tg)+' steps in front of a blow meant for your back row.'};
  if(it.amb) return {k:'atk',tg,txt:'Ambushes '+(tg.id==='p'?'you':nameOf(tg)),tip:KITS.ambush.rule};
  if(it.sf) return {k:'atk',tg,txt:'Surfaces at '+(tg.id==='p'?'you':nameOf(tg)),tip:KITS.burrow.rule};
  if(it.mk) return {k:'atk',tg,txt:'Strikes the marked '+nameOf(tg),tip:KITS.marker.rule};
  return {k:'atk',tg,txt:tg.id==='p'?'Attacks you':'Attacks '+nameOf(tg),tip:'Its next blow. Taunt turns it onto a vanguard; freezing it costs it the turn.'};
}
const sigMove=e=>e.phase2&&e.alt&&!e.kit?'sunder':e.abil, sigCharged=(e,mv)=>!!(BOSS_ABIL[mv].warn||e.phase2);
function intentInfo(e){   // what a foe card says it will do next: {k, txt, tip}, or null (a charging move has its own banner)
  if(!e||e.hp<=0||!S.run||e.charging) return null;
  if(e.stun>0) return {k:'frozen',txt:'Frozen',tip:'Frozen solid: it loses its next action.'};
  const A=e.abil&&BOSS_ABIL[e.abil];
  if(A&&e.abilT<=1){ const mv=sigMove(e), B=BOSS_ABIL[mv]; return sigCharged(e,mv)?{k:'abil',mv,txt:'Gathers for '+B.name,tip:'Next turn it gathers itself, and the turn after it lands '+B.name+'. '+B.desc}:{k:'abil',mv,txt:'Will use '+B.name,tip:B.desc}; }
  return planTxt(e,e.it);
}
function nextInfo(e){   // the action after the next one (Known foes): read off the boss's move counter, else e.it2
  if(!e||e.hp<=0||!S.run||e.charging||e.stun>0) return null;
  if(e.abil&&BOSS_ABIL[e.abil]){ const mv=sigMove(e), B=BOSS_ABIL[mv];
    if(e.abilT<=1) return sigCharged(e,mv)?{k:'abil',txt:'Will use '+B.name}:planTxt(e,e.it);   // gathering, then it lands; or a move now, then the kept blow
    if(e.abilT===2) return {k:'abil',txt:(sigCharged(e,mv)?'Gathers for ':'Will use ')+B.name}; }
  return planTxt(e,e.it2);
}
// ===== BESTIARY KNOWLEDGE =====
// What the Ledger shows on a foe's card by its kind's mastery tier (1 Studied, 2 Known, 3 Mastered, 4 Ledgered; masteryOf). Read only: no Math.random, no state change.
const knowLv=e=>{ const t=masteryOf(e.base||e.name); return t?MASTERY.indexOf(t)+1:0; };
const afterWard=(a,d)=>a.id==='p'?tetherCap(Math.max(0,d-(S.player.shield||0))):d;   // and the Soul Tether's cap (game-faith-story.js)
const foeBlow=(e,tg)=>afterWard(tg,(d=>Math.max(1,Math.round(d*(1-allyRes(tg,foeHitType(e))))))(allyDr(tg,Math.max(1,Math.round(e.atk*enrage(e)*(hasAff(e,'enraged')&&e.hp<e.maxHp/2?1.6:1)*hexK(e)*kitAtk(e,e.it))))));   /* kits, and your resistance to its type */   // a plain blow without the roll's spread or a crit (act)
function sigBlow(e,mv){   // what a damaging boss move deals (fireAbility): {you, army, van}; null for the others
  const P=S.player, k=enrage(e);
  if(mv==='cinder'){ const d=Math.round(e.atk*(e.secret?.45:.7)*k); return {you:afterWard(P,allyDr(P,d)),army:S.army.filter(m=>m.hp>0).reduce((s,m)=>s+allyDr(m,d),0)}; }
  if(mv==='decree') return {you:afterWard(P,allyDr(P,Math.round(pMax()*.45*k)))};
  if(mv==='lance'||mv==='called'){ const d=Math.round(e.atk*(mv==='lance'?1.6:1.8)*k); return S.army.some(m=>hittable(m)&&rowOf(m)==='b')?{army:d}:{you:afterWard(P,allyDr(P,d))}; }   /* the back row: you, if no minion stands there */
  if(mv==='sunder'){ const v=S.run.taunt>0&&S.army.find(m=>m.role==='vanguard'&&m.hp>0); return v?{van:allyDr(v,Math.round(e.atk*2.2*k))}:{you:afterWard(P,allyDr(P,Math.round(pMax()*.35*k)))}; }
  return null;
}
function foeKnow(e){   // {lv, dmg, crit, next, aff, sig, ans}: what this foe's tier shows
  const o={lv:knowLv(e)}; if(!o.lv||!S.run||e.hp<=0) return o;
  const i=intentInfo(e), mv=e.charging?(e.move||e.abil):i&&i.mv;
  if(i&&i.k==='atk'){ o.dmg=foeBlow(e,i.tg); o.crit=e.role==='striker'&&!hasSt(e,'hexed'); }
  if(o.lv>=2){ o.next=nextInfo(e); if(e.aff&&e.aff.length) o.aff=e.aff; }
  if(o.lv>=3&&mv) o.sig=sigBlow(e,mv);
  if(o.lv>=4){
    if(mv){ const c=blowCounters({k:'sig',mv,w:e.charging||sigCharged(e,mv)?1:0}); o.ans=o.sig?c:c.filter(x=>x!=='ward'); }
    else if(i&&i.k==='atk'&&i.tg.id==='p'&&o.dmg>=pMax()*.15) o.ans=blowCounters({k:'hit'});   // heavy blows on you
  }
  return o;
}
function orderHints(){   // the order buttons' hints, from the current plan: {vanguard: blows Taunt pulls, mender: ward Bone Shield adds}; none once an order is given
  const h={}, P=S.player; if(!S.run||S.mode!=='battle') return h;
  if(canCommand('vanguard')) h.vanguard=liveFoes().filter(e=>{ if(e.stun>0) return false; if(e.charging) return (e.move||e.abil)==='sunder';
    const i=intentInfo(e); if(!i) return false; if(i.k==='abil') return i.mv==='sunder'; return i.k==='atk'&&!(i.tg.role==='vanguard'&&i.tg.id!=='p'); }).length;
  if(canCommand('mender')){ const w=S.army.filter(m=>m.role==='mender'&&m.hp>0).reduce((a,m)=>a+Math.round(m.atk*1.5),0); h.mender=Math.min(Math.round(pMax()*.6),P.shield+w)-P.shield; }   // as command() gives it
  return h;
}
const execMark=e=>e.hp>0&&e.hp<e.maxHp*.4&&canCommand('reaper');   // Execute doubles reaper blows below 40% HP (act)
// ===== STATUS COMBOS =====
// Statuses that meet: a short log line, and a floating word on the unit's card (r.fx[key].c).
const COMBOS={
  frostbreak:{name:'Frostbreak',desc:'Your Strike, Bone Spear or Reap on a foe that is Frozen and Chilled deals 50% more, and the blow breaks the freeze.'},
  rot:       {name:'Spreading Rot',desc:'Corpse Explosion with a Blighted body or a Blighted foe in the room spreads that Blight to every foe it hits.'},
  fizzle:    {name:'Fizzle',desc:'A Hexed foe cannot crit: its crit lands as a plain hit and opens no wound.'},
  breach:    {name:'Breach',desc:'Under Execute, your reapers ignore the armor of Sundered foes.'},
  swift:     {name:'Swift Blow',desc:'A Hasted minion\'s follow-up strike carries its venom, blight, sunder and hex like a normal hit.'}
};
const FROSTBREAK=1.5;
function combo(k,units,msg){ const r=S.run; tally('combos'); log(msg,'ok'); for(const u of [].concat(units||[])){ const id=fxKey(u); if(id==null) continue; const f=r.fx[id]||(r.fx[id]={d:0,h:0}); f.c=COMBOS[k].name; } }
const frozenChilled=t=>!!t&&t.hp>0&&t.stun>0&&hasSt(t,'chilled');
function frostbreak(t){ t.stun=0; combo('frostbreak',t,'Frostbreak: '+t.name+' shatters out of the ice.'); }
function foeOnHit(e,tg){   // what a foe's hit leaves behind: affixes and the Whisper Choir
  if(!(tg.hp>0)) return kitOnHit(e,tg);
  let x='';
  if(hasAff(e,'plague')){ addDot(tg,'blight',e.atk*.2,2); if(tg.dots&&tg.dots.blight) x+=', blighted'; }
  if(hasAff(e,'sundering')&&Math.random()<ST_CH&&addSt(tg,'sundered',2)) x+=', sundered';
  if((hasAff(e,'hexing')||hasKit(e,'hexer'))&&Math.random()<ST_CH&&addSt(tg,'hexed',2)) x+=', hexed';
  x+=kitOnHit(e,tg);
  if(hasAff(e,'frosty')&&Math.random()<ST_CH&&addSt(tg,'chilled',2)) x+=', chilled';
  if(hasAff(e,'burning')){ addDot(tg,'burn',e.atk*.15,2); if(tg.dots&&tg.dots.burn) x+=', burning'; }
  return x;
}
function hasteStrikes(){   // the end of the turn: every Hasted unit strikes once more for half damage
  const r=S.run;
  for(const m of S.army){ if(!(m.hp>0)||!hasSt(m,'hasted')) continue; const tg=minionTarget(m); if(!tg) break;
    let d=hit(m.atk*dmgMul()*(r.frenzy>0?r.frenzyMul:1)*HASTE_MUL*hexK(m)*rowK(m)*breakK(m,tg)); const cr=blurCrit(m); if(cr) d=Math.round(d*1.8); hurtFoe(tg,d,minionType(m)); fxe('mhit',tg,{by:fxKey(m)}); log(m.nick+' is hasted and strikes '+tg.name+' again for '+d+(cr?' (crit)':'')+'.'); const x=minionOnHit(m,tg); if(x) combo('swift',tg,'Swift Blow: '+tg.name+' is '+x.split(' and ').filter(Boolean).map(v=>({poisons:'poisoned',blights:'blighted',sunders:'sundered',hexes:'hexed',chills:'chilled',burns:'burning'})[v.split(' ')[0]]).join(', ')+'.'); checkDeaths(); }
  for(const e of liveFoes()){ if(!hasSt(e,'hasted')||e.froze===r.turn) continue; let alive=allies().filter(a=>a.hp>0); if(!alive.length) break;
    alive=foeReach(e,alive);   // Taunt and the row rule hold for the follow-up too
    let tg=foeTarget(alive), d=hit(e.atk*HASTE_MUL*hexK(e)*enrage(e)*kitAtk(e)); const gv=guardBlow(tg,d); if(gv){ tg=gv; d=Math.round(d*SB_TAKE); } BLOW={n:e.name,k:'haste'}; hurtAlly(tg,d,foeHitType(e)); BLOW=null; fxe('hurt',tg,{by:e.id}); log(e.name+' is hasted and strikes '+(tg.id==='p'?'you':nameOf(tg))+' again for '+d+'.','bad');
    if(tg.hp<=0&&tg.id!=='p') log(tg.nick+' is down.','bad'); if(S.player.hp<=0) return; }
}
function tickDots(){
  let foeD=0, ourD=0;
  const tick=(u,hurt)=>{ if(!u.dots) return; for(const k of Object.keys(u.dots)){ const o=u.dots[k]; if(u.hp>0) hurt(u,o.d,k); if(--o.t<=0) delete u.dots[k]; } if(!Object.keys(u.dots).length) delete u.dots; };
  for(const e of S.run.enemies) tick(e,(u,d,k)=>{ const h=u.hp; KILL=k; hurtFoe(u,k==='blight'?Math.round(d*shadowK()):d,DOT_TYPE[k]); KILL=null; foeD+=h-u.hp; });   // Black Eclipse feeds your blight
  for(const a of allies()) tick(a,(u,d,k)=>{ { const rs=allyRes(u,DOT_TYPE[k]); if(rs) d=Math.max(1,Math.round(d*(1-rs))); } const n=Math.min(d,u.hp); u.hp-=n; if(n>0){ mark(u,n,0); if(u.id==='p'){ S.run.hurt=true; S.run.blow={k:'dot',dot:k}; } } ourD+=n; if(u.hp<=0&&u.id!=='p'&&!stitchUp(u)){ log(u.nick+' succumbs.','bad'); fxe('death',u); } });
  capFester(foeD);
  if(foeD) log('Poison eats '+foeD+' HP from your foes.','ok');
  if(ourD) log('Bleeding and burns cost your side '+ourD+' HP.','bad');
}

// ===== EVENTS BETWEEN ROOMS =====
// After some rooms in the gates (not the last, not the Tower) you find something. Walking past is always safe.
const EVENT_CHANCE=.3;
const EVENTS={
  shrine:   {name:'A blood shrine',     text:'Old blood crusts a stone basin. Feed it, and it sharpens every blow for the rest of this gate.', opts:[['bleed','Feed it 20% of your max HP'],['pass','Walk past']]},
  pedlar:   {name:'A wandering pedlar', text:'A hooded dead man rattles a tray of bottles and asks half the market price.', opts:[['buy','Buy'],['pass','Wave him off']]},
  coffer:   {name:'A sealed coffer',    text:'An iron box, chained shut. It might hold gold and gear, or a trap.', opts:[['open','Force it open'],['pass','Leave it']]},
  oldgods:  {name:'A shrine of the Old Gods',faith:'hon',text:'A clean stone in a dirty place, still warm. The Old Gods know an Honored One.', opts:[['pray','Pray (heal 30% HP, refill mana)'],['pass','Walk past']]},
  defiled:  {name:'A defiled altar',   faith:'dis',text:'Someone gutted the old altar and left the offerings. A Dishonored One takes what is owed.', opts:[['take','Take the offerings (lose 10% HP, gain gold and a Soul)'],['pass','Walk past']]},
  straggler:{name:'A wounded straggler',text:'One of the gate\'s dead drags itself away from the fight, broken.', opts:[['raise','Take it as it is (free raise, +25%)'],['finish','Finish it (bonus XP)']]}
};
const STRAGGLER_BONUS=25;
const FAITH_EVENT=.25;   // a sworn necromancer meets a shrine true to the oath in a quarter of events
function rollEvent(){ { const cd=chainDue(); if(cd) return {id:cd}; } const fe=Object.keys(EVENTS).find(k=>EVENTS[k].faith&&EVENTS[k].faith===faithOf()), id=fe&&Math.random()<FAITH_EVENT?fe:pick(Object.keys(EVENTS).filter(k=>!EVENTS[k].faith&&chainOk(k))), ev={id}; if(id==='pedlar'){ ev.pot=pick(Object.keys(POTIONS)); ev.price=Math.ceil(POTIONS[ev.pot].price()/2); } return ev; }
function corpseOf(e){ const c={id:'c'+e.id,armed:isArmed(e.base),name:e.name,base:e.base,role:e.role,rankI:e.rankI,lvl:e.lvl,hf:e.hf,af:e.af,tw:e.tw,boss:e.boss,elite:e.elite,tried:false,result:null,minion:null}; if(e.aff&&e.aff.length) c.aff=e.aff.slice(); if(e.dots&&e.dots.blight) c.bl=e.dots.blight.d; if(e.cd&&e.hp<=0) c.cd=e.cd; return c; }   // bl: it died Blighted (Spreading Rot); cd: how it died (CORPSE_CONDS)
// Corpse conditions: how a foe died marks its body. First match in this order; raise: % added before the clamp; trait: what it rises with
// in place of the random trait (a boss still rolls its second one, an elite still keeps an affix).
const CORPSE_CONDS={
  preserved:{name:'Preserved',raise:15, trait:'rimeborn',  when:'Frozen when it died.',                                 story:'Pulled from the ice: its hits Chill.'},
  clean:    {name:'Clean',    raise:8,  trait:'unmarred',  when:'Killed by your Reap, or by a reaper under Execute.',   story:'Cut down clean: nothing of it was spoiled.'},
  rot:      {name:'Rotten',   raise:-10,trait:'necrotic',  when:'Died Blighted.',                                       story:'Risen from the rot: its hits Blight.'},
  tainted:  {name:'Tainted',  raise:-5, trait:'venom',     when:'Killed by poison.',                                    story:'Venom still in its veins: its hits Poison.'},
  charred:  {name:'Charred',  raise:-10,trait:'cinderborn',when:'Killed by a burn.',                                    story:'Raised from the ashes: its hits Burn.'},
  undone:   {name:'Undone',   raise:10, trait:'undone',    when:'Killed by damage of a type it was weak to.',            story:'Undone by its weakness: it keeps an echo of its kind\'s kit.'},
  mangled:  {name:'Mangled',  raise:-8, trait:'stitched',  when:'The killing blow went past its HP by more than its max HP.',story:'Sewn back together: it gets up once more.'}
};
const RIME_CH=1/3, CINDER_CH=1/3, CINDER_K=.15, UNMARRED_K=.15, STITCH_HP=.25, STITCH_MAX=.9;   // death traits: proc chances, Cinderborn's burn (sized like Venomous poison), Unmarred's bonus, Stitched's rise and HP
function deathCond(e,d){ return e.stun>0?'preserved':KILL==='reap'||KILL==='exec'?'clean':(e.dots&&e.dots.blight)||KILL==='blight'?'rot':KILL==='poison'?'tainted':KILL==='burn'?'charred':e.lt&&foeRes(e,e.lt)<0&&!e.risen?'undone':d-e.hp>e.maxHp?'mangled':null; }   // undone: a weakness kill (game-kits.js)
const condRaise=c=>c.cd&&CORPSE_CONDS[c.cd]?CORPSE_CONDS[c.cd].raise:0;
function stitchUp(a){ if(a.id==='p'||a.hp>0||!hasTrait(a,'stitched')||(a.sx||0)>=(hasTrait(a,'patchwork')?2:1)) return false; a.sx=(a.sx||0)+1; a.hp=Math.max(1,Math.round(a.maxHp*(hasTrait(a,'deathlesshusk')?.5:STITCH_HP))); log(a.nick+' is Stitched together and gets up again.','ok'); return true; }   // once per room (roomStart clears sx)
function resolveEvent(ch){
  const r=S.run; if(S.mode!=='raise'||!r||!r.event||r.event.done) return false;
  const ev=r.event, P=S.player, lvl=RK[r.di].lv+Math.floor(r.room/2); let m='', c='';
  if(EVENTS[ev.id].chain){ const o=chainResolve(ev,ch); if(!o) return false; m=o.m; c=o.c; }
  else if(ch==='pass') m='You leave it be.';
  else if(ev.id==='shrine'&&ch==='bleed'){ if(P.hp<=1) return false; const d=Math.max(0,Math.min(P.hp-1,Math.round(pMax()*.2))); P.hp-=d; r.bless=true; tally('shrine'); m='The shrine drinks '+d+' HP. You and your army hit 15% harder for the rest of this gate.'; c='ok'; }
  else if(ev.id==='pedlar'&&ch==='buy'){ if(S.gold<ev.price||S.belt[ev.pot]>=BELT_MAX) return false; S.gold-=ev.price; S.belt[ev.pot]++; tally('pedlar'); m='You buy a '+POTIONS[ev.pot].name+' for '+ev.price+' gold.'; c='ok'; sfx('coin'); }
  else if(ev.id==='coffer'&&ch==='open'){ tally('coffer');
    if(Math.random()<.6){ const g=Math.round((10+P.lvl*4)*(1+r.di)*ngpReward()); S.gold+=g; r.goldTot=(r.goldTot||0)+g; const it=addItem(pickRow(tableFor(r.di,'vanguard',false,true)));
      if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } findPage('coffer',r); m='Inside: '+g+' gold'+(it?' and '+withArticle(ITEM[it.id].name)+'.':'. There was gear too, but your bag is full.'); c='ok'; sfx('coin'); }
    else { const d=Math.max(0,Math.min(P.hp-1,Math.round(pMax()*.25))); P.hp-=d; tally('trap'); m='A needle trap. You lose '+d+' HP and find nothing.'; c='bad'; sfx('hurt'); }
  }
  else if(ev.id==='oldgods'&&ch==='pray'){ const h=healAlly(P,Math.round(pMax()*.3)); P.mana=pMana(); tally('prayed'); m='The Old Gods hear you. You recover '+h+' HP and your mana is full.'; c='ok'; sfx('coin'); }
  else if(ev.id==='defiled'&&ch==='take'){ const d=Math.max(0,Math.min(P.hp-1,Math.round(pMax()*.1))), g=Math.round((10+P.lvl*3)*(1+r.di)*ngpReward()); P.hp-=d; S.gold+=g; r.goldTot=(r.goldTot||0)+g; const got=gainSoul(); tally('defiled');
    m='You take the offerings: '+g+' gold'+(got?' and a Soul ('+r.souls+'/'+SOUL_MAX+')':'')+'. The altar takes '+d+' HP in return.'; c='ok'; sfx('coin'); }
  else if(ev.id==='straggler'&&ch==='raise'){ const e=makeEnemy(r.di,lvl,false), cp=corpseOf(e); cp.free=true; r.corpses.push(cp); m=e.name+' waits with the other bodies. Raising it costs no mana.'; c='ok'; }
  else if(ev.id==='straggler'&&ch==='finish'){ const e=makeEnemy(r.di,lvl,false), xp=Math.round(killXp(e)*1.5); r.gained+=xp; r.ups+=addXp(xp); m='You finish '+theName(e.name)+'. +'+xp+' XP.'; c='ok'; }
  else return false;
  ev.done=m; r.events.push({m,c}); return true;
}

// ===== CURSED GATES =====
// Each day one gate you have already cleared is cursed with a twist. It is harder, and it pays more.
const MODS={
  volatile:{name:'Volatile dead',desc:'Foes burst when they die and hurt you for half their attack (never below 1 HP; ward soaks it).'},
  drought: {name:'Drought',      desc:'No mana comes back at the end of a turn. Strike still gives 3.'},
  fury:    {name:'Fury',         desc:'Foes deal 25% more damage.'},
  bulwark: {name:'Bulwark',      desc:'Foes have 30% more HP.'},
  horde:   {name:'Horde',        desc:'Every room holds one more foe.'}
};
const MOD_XP=1.25, MOD_GOLD=2, MOD_DROP=1.5, MOD_REWARD='Foes +15% HP and attack. Double gold and trophies, +25% XP, +50% gear.';
function dayMod(){
  if(!S.mod||S.mod.day!==S.day){
    const cl=DUNGEONS.map((D,i)=>i).filter(i=>S.ti&&S.ti.clr&&S.ti.clr[i]&&S.player.lvl>=RK[i].unlock);
    S.mod=cl.length?{day:S.day,gi:pick(cl),id:pick(Object.keys(MODS))}:{day:S.day,gi:-1,id:null};
  }
  return S.mod;
}
// ===== OMEN DAYS =====
// Once a gate has been cleared, some dawns bring an omen that touches every gate and the Tower for that day.
const OMENS={
  bloodmoon:{name:'Blood Moon',desc:'Elites are twice as common.'},
  paletide: {name:'Pale Tide', desc:'+10% chance to raise the dead.'},
  ashfall:  {name:'Ashfall',   desc:'Bosses and wardens use their moves a turn sooner, and pay 25% more XP.'},
  eclipse:  {name:'Black Eclipse',desc:'Soul Siphon, the Siphon skills and blight deal 20% more. Foes crit 10% less often and miss 1 blow in 10.'},
  boneharvest:{name:'Bone Harvest',desc:'Foes drop trophies 25% more often and elites one more. Any kill may leave bone dust: 1 kill in 4, and 3 from a boss.'},
  ironrain: {name:'Iron Rain', desc:'Gear drops 10% more often and rolls bonus lines as if one tier higher. Foes wear heavier armor: 25% tougher to hurt, and they resist 15% of physical damage on top.'},
  soulstorm:{name:'Soul Storm',desc:'Every room starts with one Soul harvested, and you regain 20% more mana each turn. Your shadow damage is 10% stronger. Foes deal 25% more damage.'}
};
const OMEN_CHANCE=.25, OMEN_RAISE=10, OMEN_BOSS_XP=1.25;
const ECLIPSE_SHADOW=1.2, ECLIPSE_CRIT=.1, ECLIPSE_MISS=.1, HARVEST_TRO=.25, HARVEST_DUST=.25, HARVEST_DUST_BOSS=3, IRON_DROP=1.1, IRON_ARMOR=1.25, STORM_REGEN=.2, STORM_ATK=1.25;
const shadowK=()=>omen()==='eclipse'?ECLIPSE_SHADOW:1;   // Black Eclipse: Soul Siphon, the Siphon skills (Corpse Explosion, Grave Chill, Reap) and blight
const foeCrit=()=>.25-(omen()==='eclipse'?ECLIPSE_CRIT:0);   // an enemy striker's crit chance
function roomStart(list){   // a fresh room or floor: Soul Storm, the Swift affix and trait, and Ossified
  cmdSync();   /* Command: measured as the room begins */
  foeRise(list);
  for(const m of S.army){ delete m.sx; if(m.hp>0&&hasTrait(m,'swift')) addSt(m,'hasted',2); }   // sx: Stitched used this room
  echoRoom(); kitSeen(list); delete S.run.mk;
  if(omen()==='soulstorm') gainSoul();
  if(hasMod('bonearmor','a')) S.player.shield=Math.max(S.player.shield||0,Math.round(pMax()*OSSIFIED));
  planFoes();
  progRoom();
}
function foeRise(list){ progFoes(list); for(const e of list){ if(omen()==='soulstorm') e.atk=Math.max(1,Math.round(e.atk*STORM_ATK)); if(hasAff(e,'swift')) addSt(e,'hasted',3); } }   // also for foes called in mid-fight
function dayOmen(){ if(!S.omen||S.omen.day!==S.day) S.omen={day:S.day,id:anyClear()&&Math.random()<OMEN_CHANCE?pick(Object.keys(OMENS)):null}; return S.omen; }
const omen=()=>(S&&S.player&&!(S.run&&(S.run.siege||S.run.trial)))?dayOmen().id:null;   // omens do not reach a siege or a Trial
const eliteBase=()=>.1*(omen()==='bloodmoon'?2:1), eliteChance=()=>eliteBase()*(runHeat()>=1?HARD_ELITE:1);   // Hard and up: twice the elites
const gateMod=di=>{ const m=dayMod(); return m.gi===di?m.id:null; };
const runMod=()=>(S.run&&!S.run.tw&&S.run.mod)||null;
const hasRunMod=id=>{ const r=S.run; return !!r&&!r.tw&&(r.mod===id||r.mod2===id); };   // a Trial can carry a second curse (r.mod2)
// Once the Throne of Ash has fallen, a cursed gate's foes rise to just below your level: cursed days stay a real fight, and
// pay for it (XP and gold already follow foe level).
const CURSE_GAP=5;
const curseRise=di=>(runMod()&&S.ti&&S.ti.clr&&S.ti.clr[5])?Math.max(0,S.player.lvl-CURSE_GAP-RK[di].lv):0;
const foeAtkMul=di=>DIFF.foeAtk[di]*(hasRunMod('fury')?1.25:1);
const bulwark=list=>{ if(hasRunMod('bulwark')) for(const e of list){ e.maxHp=e.hp=Math.round(e.maxHp*1.3); } };
function volatileBurst(e){   // Volatile dead: a dying foe bursts on you
  const P=S.player; let d=Math.round(e.atk*.5*(1-allyRes(P,'fire'))); const s=Math.min(P.shield,d); P.shield-=s; d=Math.max(0,Math.min(d-s,P.hp-1)); P.hp-=d; if(d){ mark('p',d,0); S.run.hurt=true; }
  log(e.name+' bursts'+(d?' and burns you for '+d:', but your ward takes it')+'.','bad');
}

// ===== GATE DIFFICULTY =====
// A cleared gate can be entered on a higher difficulty: Hard after a clear, Brutal after a Hard clear, Nightmare after Brutal.
// Foes grow stronger and every reward grows with them. On a cursed day the curse feeds on it: foes x1.5 more, rewards x1.3.
// Each level also adds a rule (rule), and keeps the rules below it: Hard doubles the elites (HARD_ELITE); Brutal moves a boss's second phase up to
// BRUTAL_PHASE of its HP and gives every front-row foe an affix (no elite stats, ordinary drops); Nightmare makes one foe an elite in a room that rolled
// none and starts bosses in their second phase. Elites the rules add drop as elites but carry the gate's unique at ordinary odds (e.hx, tableFor).
const HARD_ELITE=2, BRUTAL_PHASE=.65;
const HEAT=[{name:'Normal',foe:1,xp:1,gold:1,drop:1},{name:'Hard',foe:1.8,xp:1.2,gold:1.5,drop:1.3,rule:'Elites appear twice as often.'},{name:'Brutal',foe:2.5,xp:1.7,gold:2.2,drop:1.7,rule:'Bosses enter their second phase at '+Math.round(BRUTAL_PHASE*100)+'% HP, and every foe in the front row carries an affix.'},{name:'Nightmare',foe:3.6,xp:2.3,gold:3,drop:2.2,rule:'Every room holds at least one elite, and bosses start in their second phase.'}];
const heatRules=lv=>HEAT.slice(1,lv+1).map(h=>h.rule);   // the rules in force on a level, its own last
function heatRoom(list,di){   // Nightmare, before scaling: a room with no elite gets one, and the boss starts in its second phase
  if(runHeat()<3||list.some(e=>e.rival)) return;
  if(!list.some(e=>e.elite)){ const c=list.filter(e=>!e.boss); if(c.length){ const e=pick(c), s=mobStats(di,e.lvl,e.hf,e.af,false,true); Object.assign(e,{elite:true,hx:1,name:pick(ELITE)+' '+e.base,maxHp:s.hp,hp:s.hp,atk:s.atk}); } }
  for(const e of list) if(e.boss&&e.abil&&!e.phase2){ e.phase2=true; e.fast=(e.fast||0)+1; e.alt=true; e.abilT=Math.min(e.abilT,2); }
}
const DAMNED=1.3, DAMNED_FOE=1.5, CURSE_FOE=1.15;   // cursed and harder: rewards x1.3, foes x1.5; cursed on Normal: foes x1.15 (rewards come from the curse itself)
const foeHeat=()=>{ const h=runHeat(), m=runMod()&&!(S.run&&S.run.trial); return (h?HEAT[h].foe:1)*(m?(h?DAMNED_FOE:CURSE_FOE):1); };   // a Trial's curses bring only their own rules: its foes already fight at the Throne's strength (trialPow)
function heatScale(list){ const f=foeHeat(); if(f!==1) for(const e of list){ if(e.rival) continue; e.maxHp=e.hp=Math.round(e.maxHp*f); e.atk=Math.max(1,Math.round(e.atk*f)); } }   // a room's foes and the adds called into it; the rival keeps their own measure
const heatMax=di=>Math.min(HEAT.length-1,S.ti&&S.ti.clr&&S.ti.clr[di]?((S.heatMax&&S.heatMax[di]!=null?S.heatMax[di]:0)+1):0);   // highest level you may pick
const heatOf=di=>Math.min((S.heat&&S.heat[di])||0,heatMax(di));
function setHeat(di,lv){ if(S.mode!=='town'||!RK[di]||!(lv>=0&&lv<=heatMax(di))) return false; S.heat=S.heat||{}; if(lv) S.heat[di]=lv; else delete S.heat[di]; return true; }
const runHeat=()=>(S.run&&!S.run.tw&&S.run.heat)||0;
const gateFarm=di=>(heatOf(di)||gateMod(di)||!(S.ti&&S.ti.clr&&S.ti.clr[di]))?1:farmK(di,S.player.lvl);   // what a Normal run of this gate would pay now (the gate card)
const runFarm=()=>{ const r=S.run; if(!r||r.tw||r.rift||r.siege||r.heat||runMod()||!(S.ti&&S.ti.clr&&S.ti.clr[r.di])) return 1; return farmK(r.di,S.player.lvl); };
const heatK=k=>{ const h=runHeat(); if(!h) return (k==='xp'||k==='gold')?runFarm():1; return (k==='foe'?foeHeat():HEAT[h][k]*(runMod()?DAMNED:1)); };   // the cursed and the hard together

// ===== RUN HISTORY =====
const HIST_N=20, LIFE_KEYS=['runs','clears','deaths','fled','rooms','kills','xp','gold','items','raised','souls','wn','wt','ct','cn','stk'];   // wn/wt: wins of the runs tracked for the win rate; ct/cn: turns and count of timed gate clears; stk: the current win streak
const runResult=r=>r.cleared?'cleared':S.mode==='defeat'?'fell':r.fled?'fled':'left';
// A win: a clear (a held siege too), or a Tower climb walked out of with a floor won. A fall or a flight breaks the streak; walking out of a gate early neither adds nor breaks.
const runWon=(r,res)=>res==='cleared'||(!!r.tw&&res==='left'&&(r.won||0)>0);
function runBoss(r){ const b=(r.enemies||[]).find(e=>e.boss&&!e.dead&&e.hp>0); return b?[b.name,0]:r.bossK?[r.bossK,1]:null; }   // the boss or warden faced last, and whether it fell
function runMvp(){ const a=(S.army||[]).filter(m=>!m.thrall).sort((x,y)=>((y.hp>0)-(x.hp>0))||(y.lvl-x.lvl)); const m=a[0]; return m?[m.nick||m.name,m.role||'',m.lvl||1]:null; }   // a standing minion first, then the highest level
function recordRun(target,r,res){
  const h={d:S.day,g:r.tw?-1:r.di,f0:r.tw0||0,f1:r.tw||0,rooms:r.won||0,kills:r.kills||0,xp:r.gained||0,gold:r.goldTot||0,items:r.items||0,raised:r.raised||0,mod:r.mod||null,res}; if(r.heat) h.heat=r.heat; if(r.secret) h.sec=r.secret; if(r.rift) h.rift=r.rift; if(r.riftRec) h.rr=1; if(r.siege) h.siege=1; if(r.trial) h.trial=r.trial;
  { if(r.tt) h.tt=r.tt; if(r.mod2) h.m2=r.mod2; const om=omen(); if(om) h.om=om; const bo=runBoss(r); if(bo) h.bo=bo; const mv=runMvp(); if(mv) h.mvp=mv; h.lv=S.player.lvl; if(r.dd) h.dd=Math.round(r.dd); if(r.mh) h.mh=Math.round(r.mh); if(r.dt) h.dt=Math.round(r.dt); if(res==='fell'&&r.felled) h.fb=r.felled; }   // the details row of the History table
  target.hist=(target.hist||[]).concat([h]).slice(-HIST_N);
  const L=target.life=target.life||{}; LIFE_KEYS.forEach(k=>{ L[k]=L[k]||0; });
  L.runs++; if(res==='cleared') L.clears++; if(res==='fell') L.deaths++; if(res==='fled') L.fled++;
  L.rooms+=h.rooms; L.kills+=h.kills; L.xp+=h.xp; L.gold+=h.gold; L.items+=h.items; L.raised+=h.raised;
  L.souls+=r.soulT||0; L.wt++; if(runWon(r,res)){ L.wn++; L.stk++; } else if(res==='fell'||res==='fled') L.stk=0;
  if(res==='cleared'&&!r.tw&&!r.rift&&!r.siege&&!r.trial&&r.tt>0){ L.ct+=r.tt; L.cn++; }
}
// ===== RECORDS =====
// Personal bests for the Ledger's Records page. They are kept through New Game+.
// S.rec = {hit:{v,day}, fast:{di:{t,day,heat}}, kills:{v,day}, gold:{v,day}, floor:{v,day}, sec:{i:day}}
const REC_NAME={rift:'Deepest Rift',hit:'biggest hit',kills:'most kills in one run',gold:'most gold from one run',floor:'deepest Tower floor',tw10:'fastest 10-floor climb',streak:'longest win streak',taken:'most damage survived in one run',mlv:'highest minion level',ftr:'most traits on a fused minion',held:'most gold held'};
// The {v,day} records normalizeSave keeps; S.rec.fast and S.rec.riftF ({band:{t,day,d}}, fewest turns per Rift depth band) and S.rec.sec have their own shapes.
const REC_NUM=['hit','kills','gold','floor','rift','tw10','streak','taken','mlv','ftr','held'], RIFT_BAND=5, TW_SPLIT=10;
function recFlash(k,txt){ const r=S.run; if(r){ r.recF=r.recF||{}; if(r.recF[k]) return; r.recF[k]=1; } moment('New record: '+txt,'gold'); }   // once per run and kind, never for a first record
function recBest(k,v,quiet){ if(!S||!(v>0)) return; S.rec=S.rec||{}; const o=S.rec[k]; if(!o||v>o.v){ S.rec[k]={v:Math.round(v),day:S.day}; if(o&&!quiet) recFlash(k,REC_NAME[k]+', '+Math.round(v).toLocaleString()); } }
function recLow(k,v){ if(!S||!(v>0)) return; S.rec=S.rec||{}; const o=S.rec[k]; if(!o||v<o.v){ S.rec[k]={v:Math.round(v),day:S.day}; if(o) recFlash(k,REC_NAME[k]+', '+Math.round(v).toLocaleString()+' turns'); } }   // lower is better (turns)
const recV=k=>(S&&S.rec&&S.rec[k]&&S.rec[k].v)||0;
function towerSplit(r){ r.twT=r.twT||[0]; r.twT.push(r.tt||0); const n=r.twT.length; if(n>TW_SPLIT) recLow('tw10',Math.max(1,r.twT[n-1]-r.twT[n-1-TW_SPLIT])); }   // turns over the last ten floors of this climb
function riftFast(r){ const m=Math.floor(r.rift/RIFT_BAND)*RIFT_BAND; if(!(m>=RIFT_BAND)||!(r.tt>0)) return; S.rec=S.rec||{}; const F=S.rec.riftF=S.rec.riftF||{}, o=F[m]; if(!o||r.tt<o.t){ F[m]={t:r.tt,day:S.day,d:r.rift}; if(o) moment('New record: Rift depth '+m+'+ in '+r.tt+' turns','gold'); } }
const riftFastBest=min=>{ const F=(S&&S.rec&&S.rec.riftF)||{}; let b=Infinity; for(const m in F) if(+m>=min&&F[m].t<b) b=F[m].t; return b; };   // fewest turns for a dive of depth min or deeper
function recArmy(){ if(!S||!S.army) return; let lv=0; for(const m of S.army.concat(S.reserve||[])) if(m&&!m.thrall&&m.lvl>lv) lv=m.lvl; recBest('mlv',lv,true); recBest('held',S.gold,true); }   // quiet: checked after every action (checkTitles)
function recRun(r,res){   // at the end of every run
  if(!r) return; recBest('kills',r.kills||0); recBest('gold',r.goldTot||0);
  if(res==null) res=runResult(r); if(res!=='fell') recBest('taken',r.dt||0); recBest('streak',(S.life&&S.life.stk)||0);
  { const om=omen(); if(om&&res!=='fell'){ tally('omenRuns'); tally('om_'+om); if(runWon(r,res)){ tally('omenWins'); tally('omw_'+om); } } }   // omen titles: survived and won under each omen
  if(!r.tw&&!r.rift&&!r.trial&&r.cleared&&r.tt>0){ S.rec=S.rec||{}; const f=S.rec.fast=S.rec.fast||{}, o=f[r.di]; if(!o||r.tt<o.t){ f[r.di]={t:r.tt,day:S.day,heat:r.heat||0}; if(o) moment('New record: '+DUNGEONS[r.di].name+' in '+r.tt+' turns','gold'); } }
}
// ===== DOORS =====
// After each gate room (not before the boss, not in the Tower) you pick the next room from two or three doors.
// The first door is always an ordinary fight, so "descend" with no choice behaves as before.
const ELITE_ROOM=1.25, ELITE_DROP=2, ELITE_GOLD=1.5, REST_HEAL=.4;
const DOORS={
  fight:   {name:'A dark passage',  desc:'Another room of the gate.'},
  elite:   {name:'A bloodied arch', desc:'Stronger foes (+25% HP and attack). Twice the gear drops and 50% more gold.', s:'Foes +25% · gear x2 · gold +50%'},
  rest:    {name:'A quiet ossuary', desc:'No fight. Rest to recover 40% of your HP and mana, and your army 40%.', s:'Rest · +40% HP, mana, army'},
  treasure:{name:'A sealed vault',  desc:'No fight. Gold and a piece of gear.', s:'Gold + gear'},
  boss:    {name:'The boss chamber',desc:'The master of this gate.'}
};
function rollDoors(r){
  if(r.room+1>=r.rooms-1) return ['boss'];
  let pool=['elite','elite','elite','rest','rest','treasure']; const out=['fight'], n=Math.random()<.4?2:1;   // weighted: elite 3, rest 2, treasure 1
  while(out.length<1+n&&pool.length){ const k=pick(pool); out.push(k); pool=pool.filter(x=>x!==k); }
  return out;
}
const roomKind=()=>(S.run&&!S.run.tw&&S.run.roomKind)||null;
function quietRoom(kind){   // a rest or treasure room: no fight, then the doors again
  const r=S.run, P=S.player; let m;
  r.corpses=[]; r.spoils=[]; r.lostLoot=[]; r.events=[]; r.lastXp=0; r.lastGold=0; r.lastTroph={}; r.enemies=[];
  if(kind==='rest'){ P.hp=Math.min(pMax(),P.hp+Math.round(pMax()*REST_HEAL)); P.mana=Math.min(pMana(),P.mana+Math.round(pMana()*REST_HEAL)); S.army.forEach(x=>{ x.hp=Math.min(x.maxHp,x.hp+Math.round(x.maxHp*REST_HEAL)); });
    m='You rest among the bones. You and your army recover.'; sfx('heal'); }
  else { const g=Math.round((15+P.lvl*5)*(1+r.di)*ngpReward()*(1+xb('goldp')/100)); S.gold+=g; r.goldTot=(r.goldTot||0)+g; r.lastGold=g; const it=addItem(pickRow(tableFor(r.di,'vanguard',true,false)));
    if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } m='The vault gives up '+g+' gold'+(it?' and '+withArticle(ITEM[it.id].name):'')+'.'; sfx('coin'); }
  r.events.push({m,c:'ok'}); r.quiet=kind; r.doors=rollDoors(r); preRooms(r); S.mode='raise';
}
// The Ledger reads the doors: the room behind a fight or elite door is rolled with the doors (r.pre, kept in the save), so a door
// can show what waits behind it. How much it shows depends on how well you know this gate's dead (doorSight) and its master (doorBoss).
function preRooms(r){ r.pre=null; for(const k of r.doors||[]) if(k==='fight'||k==='elite'){ r.pre=r.pre||{}; r.pre[k]=buildRoom(r.room+1,k); } }
function doorSight(di){   // 2: most of the gate's kinds Known (rows and levels too), 1: most Studied (names, elites and affixes), 0: nothing. Most: at least 2.
  const ms=DUNGEONS[di].mobs, need=Math.min(2,ms.length), n=id=>{ const at=MASTERY.findIndex(t=>t.id===id); return ms.filter(m=>MASTERY.indexOf(masteryOf(m[0]))>=at).length; };
  return n('known')>=need?2:n('studied')>=need?1:0;
}
const DOOR_TIP={swarm:'At most '+SUMMON_CAP+' answer it in one fight',bonewall:"A shield holds at most 40% of a foe's HP",seedfall:'At most '+SUMMON_CAP+' sprout in one fight'};   // moves that are not telegraphed: what limits them
function doorBoss(di){   // the boss door, once its master is Ledgered: the signature move and what answers it (the same answers as a charging boss: chargeInfo)
  const t=masteryOf(DUNGEONS[di].boss[0]); if(!t||t.id!=='ledgered'||rivalHere(di)) return null;
  const K=BOSS_KITS_ON&&BOSS_KIT[DUNGEONS[di].boss[0]]; if(K){ const ans=m=>BOSS_ABIL[m].name+': '+(BOSS_ABIL[m].warn?chargeInfo({charging:true,hp:1,move:m}).hint:DOOR_TIP[m]||BOSS_ABIL[m].desc.replace(/\.$/,''));
    return {name:K.moves.map(m=>BOSS_ABIL[m].name).join(' · '),tip:K.moves.map(ans).concat(K.twist?['Second phase: '+TWISTS[K.twist].name,TWISTS[K.twist].desc]:[],K.hazard?['Hazard: '+HAZARDS[K.hazard].name,HAZARDS[K.hazard].desc]:[]).join('. ')}; }   /* the whole move set (game-boss-kits.js) */
  const mv=GATE_ABIL[di], A=BOSS_ABIL[mv]; return {name:A.name,tip:A.warn?chargeInfo({charging:true,hp:1,move:mv}).hint:DOOR_TIP[mv]};
}

// ===== GEAR SETS =====
// Two or three pieces from the same gate's set (its uniques count too) give a bonus. Tower gear belongs to no set.
const SET_NAMES=['Scavenger\'s Kit','Drowned Vigil','Ember Rite','Choir of Bones','Ironbark','Pale Court'];
const SET_BONUS=[{2:{hp:15},3:{goldp:10}},{2:{mana:20},3:{manap:8}},{2:{strength:3},3:{dmgp:5}},{2:{will:3},3:{mpow:10}},{2:{constitution:4},3:{drp:5}},{2:{mpow:8},3:{dmgp:6,drp:3}}];
const setCount=si=>(S&&S.equip)?GEAR_SLOTS.filter(sl=>{ const it=S.equip[sl], d=it&&ITEM[it.id]; return d&&!d.tower&&d.set===si; }).length:0;
const setB=k=>{ let n=0; for(let i=0;i<SET_BONUS.length;i++){ const c=setCount(i); if(c>=2) n+=SET_BONUS[i][2][k]||0; if(c>=3) n+=SET_BONUS[i][3][k]||0; } return n; };
// ===== UNIQUE SETS =====
// The uniques form six sets of three (a weapon, an armor and a relic each): two from the gate bosses, four from the Tower
// wardens. Their bonuses are bigger than a gate set's and stack with them (a gate unique still counts toward its gate set).
const USET=[
  {name:'Tithes of the Ledger', from:'Rat Warren, Sunken Crypt and Ashen Barrow bosses', ids:['u0','u1','u2'], b:{2:{mpow:10,raise:5},3:{dmgp:8,xpp:10}}},
  {name:'Last Rites',           from:'Hollow Cathedral, Iron Orchard and Throne of Ash bosses', ids:['u3','u4','u5'], b:{2:{manap:10,raise:8},3:{mpow:15,drp:6}}},
  {name:"Wardens' Tribute",     from:'Tower floors 10, 20 and 30', ids:['w1','w2','w3'], b:{2:{crit:8,hpp:6},3:{dmgp:10,regen:2}}},
  {name:"The Fly-Duke's Court", from:'Tower floors 40, 50 and 60', ids:['w4','w5','w6'], b:{2:{mpow:15},3:{slot:1,manap:12}}},
  {name:"Hell's Executioners",  from:'Tower floors 70, 80 and 90', ids:['w7','w8','w9'], b:{2:{strength:10,drp:5},3:{dmgp:12,hpp:10}}},
  {name:'Regalia of Ruin',      from:'Tower floor 100', ids:['w10','w11','w12'], b:{2:{hpp:10,manap:10},3:{dmgp:15,drp:10,xpp:15}}}
];
USET.forEach((u,i)=>u.ids.forEach(id=>{ ITEM[id].uset=i; }));
const usetCount=i=>(S&&S.equip)?USET[i].ids.filter(id=>GEAR_SLOTS.some(sl=>S.equip[sl]&&S.equip[sl].id===id)).length:0;
const usetB=k=>{ let n=0; for(let i=0;i<USET.length;i++){ const c=usetCount(i); if(c>=2) n+=USET[i].b[2][k]||0; if(c>=3) n+=USET[i].b[3][k]||0; } return n; };
