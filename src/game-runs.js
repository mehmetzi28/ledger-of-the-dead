// ----- dungeon runs
function log(m,c){ const r=S.run; r.log.unshift({m,c:c||''}); r.log.length=Math.min(r.log.length,10); }
function makeEnemy(di,lvl,boss){
  const D=DUNGEONS[di]; let name,role,hf=1,af=1;
  if(boss){ name=D.boss[0]; role=D.boss[1]; }
  else{ const t=pick(D.mobs); name=t[0]; role=t[1]; hf=t[2]; af=t[3]; }
  const er=boss?1:Math.random(), elite=er<eliteChance();
  const s=mobStats(di,lvl,hf,af,boss,elite);
  const e={id:'e'+(++S.uid),name:(elite?pick(ELITE)+' ':'')+name,base:name,role,rankI:di,lvl,hf,af,boss,elite,maxHp:s.hp,hp:s.hp,atk:s.atk,dead:false};
  if(elite&&er>=eliteBase()) e.hx=1;   // an elite only the difficulty rules made (HEAT)
  if(boss){ if(di===ABBEY) hungerSetup(e); else { giveAbility(e,GATE_ABIL[di]); giveKit(e); } }   /* a move set (game-boss-kits.js); the Hunger's pages (game-abbey.js) */
  return e;
}
// Rule: a room never holds more than one mender. Re-roll until the new enemy fits.
function makeSecret(di,lvl){
  const e=makeEnemy(di,Math.max(lvl+2,S.player.lvl+SB_LV),true), B=SECRET[di]; e.name=e.base=B.name; e.secret=true;   // never weaker than you: an outgrown gate still hides a real threat
  const sg=Math.max(di,topGate()); if(sg>di){ const st=mobStats(sg,e.lvl,1,1,true,false); e.maxHp=e.hp=st.hp; e.atk=st.atk; }   // fights with the strength of the hardest gate open to you
  const grow=1+SB_GROW*Math.max(0,S.player.lvl-SAFE[sg]);   // a necromancer far past the gates has an army to match: so does the master
  giveAbility(e,GATE_ABIL[di]); giveMasterKit(e);   /* the master's own kit (game-boss-kits.js) */
  e.maxHp=e.hp=Math.round(e.maxHp*SB_HP*grow*ascSecretHp()); e.atk=Math.max(1,Math.round(e.atk*SB_ATK)); e.phase2=true; e.alt=true; e.fast=(e.fast||0)+1; e.abilT=2;
  tally('secretMet'); return e;
}
function slaySecret(e,r){   // a secret master falls: its tally (for its title), the run history, the Records page and a moment
  tally('secret_'+e.rankI); r.secret=e.name;
  S.rec=S.rec||{}; const first=S.rec.sec=S.rec.sec||{}; if(!first[e.rankI]) first[e.rankI]=S.day;
  moment(e.name+' is slain','gold'); log('You have slain a secret master of the gate. The Ledger writes its name in red.','story');
}
function spawnOne(list,di,lvl){
  let e; for(let i=0;i<40;i++){ e=makeEnemy(di,lvl,false); if(!(e.role==='mender'&&list.some(x=>x.role==='mender'))) break; }
  if(e.role==='mender'&&list.some(x=>x.role==='mender')){ const t=DUNGEONS[di].mobs.filter(m=>m[1]!=='mender'); const pk=pick(t); e=makeEnemy(di,lvl,false); e.name=e.base=pk[0]; e.role=pk[1]; e.hf=pk[2]; e.af=pk[3]; const st=mobStats(di,lvl,pk[2],pk[3],false,false); e.maxHp=e.hp=st.hp; e.atk=st.atk; e.elite=false; }
  list.push(e);
}
function buildRoom(room,kind){   // the foes of a gate room, scaled and affixed (spawnRoom, and the doors' pre-rolled rooms: preRooms)
  const r=S.run, di=r.di, boss=roomBoss(r,room);   /* the weekly dive: a guardian's depth (game-rift.js) */
  const lvl=r.trial?r.tlv+Math.floor(room/2)+(boss?2:0):(r.rift?riftLvl(r.rift):RK[di].lv)+Math.floor((r.wk?2:room)/2)+(boss?2:0)+curseRise(di);   // a Trial's foes stand at the level fixed for its week
  const list=[];
  const extra=(hasRunMod('horde')?1:0)+sigHands()+ascExtra(), R0=Math.random;   /* Crowded Gates (game-asc.js) */   /* Many Hands (game-rift.js) */
  if(r.trial||r.wk) Math.random=trialRng(r.tseed,room);   // a Trial: the same rooms and foes for every attempt this week (src/game-rival-trials.js)
  try{
    if(r.rg) rgRoom(list,di,room,lvl); else if(r.rk) reckRoom(list,di,lvl);   /* the rival's own gate and the duel (game-rival-arc.js) */
    else if(boss){ if(rivalHere(di)) rivalRoom(list,di,lvl); else { list.push(r.rift&&guardAt(r.rift)?makeGuardian(di,lvl,r.rift):!r.trial&&secretRoll(di)?makeSecret(di,lvl):makeEnemy(di,lvl,true));   /* a Rift guardian every fifth depth (game-rift.js) */ const adds=(di===0?2:3)+extra; for(let i=0;i<adds;i++) spawnOne(list,di,lvl-1); } }
    else{ const n=(room===0?2:room===1?3:3+Math.round(Math.random()))+extra; for(let i=0;i<n;i++) spawnOne(list,di,lvl); }
    heatRoom(list,di); ledgerRoom(list,di); rwRoom(list,di); ascKits(list); ascRoom(list); brewRoom(r); foeScale(list,foeAtkMul(di)); if(r.trial) trialPow(list,di); bulwark(list); riftScale(list); if(boss&&r.rift) sigNamed(list);
    heatScale(list);
    if(!boss&&kind==='elite') for(const e of list){ e.maxHp=e.hp=Math.round(e.maxHp*ELITE_ROOM); e.atk=Math.max(1,Math.round(e.atk*ELITE_ROOM)); }
    affixAll(list);
  } finally { Math.random=R0; }
  return list;
}
function spawnRoom(){
  if(S.run.tw) return spawnFloor();
  const r=S.run, room=r.room, boss=roomBoss(r,room);
  const list=(!boss&&r.pre&&r.pre[r.roomKind])||buildRoom(room,r.roomKind); r.pre=null;   // a door's room was rolled with the doors: what it showed is what waits
  r.enemies=list; r.corpses=[]; r.events=[]; r.turn=1; r.fx={}; r.target=list[0].id; delete r.lcU; delete r.mirU; delete r.mirS; delete r.flU; r.loot=[]; r.spoils=[]; r.lostLoot=[]; r.cmd={}; r.taunt=0; r.quiet=null; roomStart(list);
  log(boss?(list[0].rival?list[0].name+' stands where the master should be, with their own dead around them.':list[0].secret?'The air turns wrong. This is not the master you came for.':'The air thickens. Something large waits ahead.'):(r.trial?'Trial, room ':'Room ')+(room+1)+' of '+r.rooms+(r.roomKind==='elite'?', behind the bloodied arch. These foes are stronger.':'.'));
  if(boss){ bossSpeaks(list[0],'hi'); fxe('boss',list[0]); }
  if(hasFlag('infernal')) infernalWard();
  snapRoom();
}
function startTower(f){
  f=+f; if(S.mode!=='town'||S.watches<=0||!towerOpen()||!towerStarts().includes(f)) return;
  S.watches--; S.runs++; tally('twRuns'); S.notices=[];   // notes are about what happened since your last run
  S.run={tw:f,tw0:f,di:5,room:0,rooms:1,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[]};
  S.mode='battle'; titheSouls();
  log('You step into the Hell Tower.');
  spawnFloor();
}
function startRun(di){
  if(S.mode!=='town'||S.watches<=0||!RK[di]||gateLocked(di)) return;
  S.watches--; S.runs++; S.notices=[];
  S.run={di,room:0,rooms:di===ABBEY?ABBEY_ROOMS:4,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:gateMod(di),heat:heatOf(di)};
  S.mode='battle'; titheSouls(); prepTake(S.run); prepSoul(S.run); townStart(S.run); ascRead(S.run); rwEnter(S.run);   /* run prep, the black market's Soul (game-brew.js), the Soul Well (game-town2.js) */
  log('You step through the '+DUNGEONS[di].name+' gate.'+(S.run.mod?' It is cursed today: '+MODS[S.run.mod].name+'.':''));
  if(di===ABBEY) unlockStory('abbey3',S.run);
  spawnRoom();
}
const nameOf = u=>u.id==='p'?'You':(u.nick||u.name);
const allies = ()=>[S.player].concat(S.army);
const liveFoes = ()=>S.run.enemies.filter(e=>e.hp>0);
const fxKey=u=>u==null?null:typeof u==='string'?u:u.id!=null?u.id:u.uid!=null?'m'+u.uid:null;   // the key a unit's card answers to (data-u, r.fx): minions have no id, only a uid
function mark(u,d,h){ const id=fxKey(u); if(id==null) return; const f=S.run.fx[id]||(S.run.fx[id]={d:0,h:0}); f.d+=d; f.h+=h; if(id==='p'&&d>0) S.run.dt=(S.run.dt||0)+d; }   // dt: damage you took this run (History, Records)
function hit(b){ return Math.max(1,Math.round(b*rnd(.85,1.15))); }
function hurtFoe(e,d,ty){ if(abbeyMiss(e)) return; ty=MARGIN||(DTYPE[ty]?ty:'phys');   /* an Unwritten foe; a Marginalia skill (game-abbey.js) */ if(e.curse) d=Math.round(d*e.curse.mul); { const mk=masteryDmg(e.base); if(mk) d=Math.round(d*(1+mk/100)); }   /* bestiary mastery: every hit from you and your army, once */ if(e.stun>0&&hasMod('chill','b')) d=Math.round(d*1.25); if(e.stun>0&&capOn('frost1')) d=Math.round(d*CAP_RIME); { const fk=faithHit(e); if(fk!==1) d=Math.round(d*fk); }   /* Vesh: frozen foes take more (game-pantheon.js) */
  if(hasSt(e,'sundered')) d=Math.round(d*SUNDER_MUL); if(hasSt(e,'chilled')) d=Math.round(d*CHILL_MUL);   // conditions (game-gate-rules.js)
  { const k=(1-foeRes(e,ty))*typeDmg(ty)*oilK(e,ty)*archiveK(e)*rallyK()*widenK()*rbDescent(); if(k!==1) d=Math.max(1,Math.round(d*k)); }   /* damage types: the foe's resistance or weakness, your typed bonus lines */
  e.lt=ty;   /* the type of the last hit it took (a weakness kill) */
  d=bossTaken(e,kitTaken(e,d));   /* Heartwood (game-boss-kits.js) */   /* Bulwark stance, a Banner-bearer beside it (game-kits.js) */
  if(e.shield>0){ const s=Math.min(e.shield,d); e.shield-=s; d-=s; if(d<=0){ mark(e,0,0); return; } }   // Bone Wall shield soaks damage first
  if(e.hp>0&&d>=e.hp){ e.cd=deathCond(e,d); e.kb=d; }   /* kb: the killing blow (Morrow's scorch) */   // the killing blow decides the body's condition
  recBest('hit',d); d=Math.min(d,e.hp); e.hp-=d; mark(e,d,0); kitHurt(e); bossHurt(e,d,ty); { const r=S.run; r.dd=(r.dd||0)+d; if(d>(r.mh||0)) r.mh=d; } }   /* damage dealt and the biggest hit this run, for the History */
function hurtAlly(a,d,ty){
  if(S.run&&S.run.widen) d=Math.round(d*widenK());   /* the Tear Itself (game-rift.js) */
  if(a.id==='p'&&S.run&&S.run.conf) d=Math.round(d*BK_CONFESS);   /* the Iron Inquisitor's Confession, until you ward */
  if(a.id==='p'&&BLOW){ const v=guardBlow(a,d); if(v) return hurtAlly(v,Math.round(d*SB_TAKE),ty); }   // Guard, for boss moves (plain hits swap their target before this)
  if(a.id==='p'&&S.run) S.run.blow=BLOW?blowNote(BLOW):null;
  hfScales(a,d);   /* Scales (game-forge.js) */   // what hits you, for the defeat recap (before the ward soaks it)
  d=allyDr(a,d); { const ik=brewDr(a); if(ik!==1) d=Math.round(d*ik); }   /* Iron Draught (game-brew.js) */ { const rs=allyRes(a,ty); if(rs) d=Math.max(1,Math.round(d*(1-rs))); }   /* damage types: your resistance lines, a minion's typed trait */
  if(a.id==='p'){ const sk=SAP?KIT_SAP:1, s=Math.min(S.player.shield,d*sk); S.player.shield-=s; d-=Math.round(s/sk); if(BLOW&&d>0) d=tetherBlow(d); /* the Soul Tether (game-faith-story.js) */ } else if(a.mw>0){ const sk=SAP?KIT_SAP:1, s=Math.min(a.mw,d*sk); a.mw-=s; d-=Math.round(s/sk); }   // a Warden's ward on a minion
  d=Math.min(d,a.hp); a.hp-=d; if(d>0) mark(a,d,0); if(a.id==='p'&&d>0&&S.run) S.run.hurt=true; if(d>0&&a.hp<=0&&a.id!=='p'&&!echoCall(a)&&!stitchUp(a)&&!faithSave(a)){ fxe('death',a); chainSpear(); }
  return d;
}
function allyDr(a,d){   // a blow on you or a minion after its damage reduction, before your ward (pure: the bestiary's damage figures use it too)
  if(a.id!=='p'&&hasFlag('swarmguard')) d=Math.max(1,Math.round(d*.75));
  if(a.id!=='p'&&hasTrait(a,'stalwart')) d=Math.max(1,Math.round(d*.8));
  if(a.id==='p'&&pDr()) d=Math.max(1,Math.round(d*(1-pDr()/100)));   // Constitution adds to it (pDr)
  if(a.id!=='p'&&hasMod('gravepact','b')) d=Math.max(1,Math.round(d*.9));
  if(hasSt(a,'sundered')) d=Math.round(d*SUNDER_MUL);
  if(hasSt(a,'chilled')) d=Math.round(d*CHILL_MUL);   /* a Frost-touched foe's chill */
  if(a.id!=='p') d=echoDr(a,d);   /* an Undone minion's Bulwark echo */
  if(a.id!=='p') d=rbBulwark(d);   /* Bulwark of the Deep (game-rift.js) */
  if(a.id==='p'&&hasMod('deathless','b')) d=Math.max(1,Math.round(d*(a.hp<pMax()*IRON_LOW?IRON_WILL:IRON_BASE)));   // Iron Will
  return d;
}
function healAlly(a,h){
  if(a.id==='p'){ const hp=xb('healp')+conHeal(); if(hp) h=Math.max(0,Math.round(h*(1+hp/100))); }   // faith, Sanguine Rites and Constitution change the healing you receive
  if(a.dots&&a.dots.blight) h=Math.round(h*BLIGHT_HEAL);   // Blight halves it
  if(S.run&&S.run.rift) h=Math.round(h*sigHeal());   /* Hungry Dark (game-rift.js) */
  if(a.id==='p'&&pactOn('bitter')) h=Math.round(h*(1-PACT_BITTER));   // the Bitter Blood pact
  const max=a.id==='p'?pMax():a.maxHp, over=h-(max-a.hp);
  if(a.id==='p'&&over>0&&hasMod('sanguine','a')&&S.run){ const P=S.player; P.shield=Math.max(P.shield||0,Math.min((P.shield||0)+over,Math.round(pMax()*FEAST_CAP))); }   // Blood Feast: overhealing becomes Ward
  if(a.id==='p'&&over>0&&S.run) capOverheal(over);   // Blood Tithe
  h=Math.min(h,max-a.hp); if(h<=0) return 0;
  faithHealed(a,a.hp,h); a.hp+=h; mark(a,0,h);
  if(a.id==='p'&&hasMod('sanguine','b')) a.mana=Math.min(pMana(),a.mana+Math.round(h*CLEAR_MIND));   // Clear Mind
  return h;
}
function killXp(e){ return Math.round((4+e.lvl*2.5)*RK[e.rankI].xp*(e.boss?2.5*(omen()==='ashfall'?OMEN_BOSS_XP:1):1)*(e.elite?1.5:1)*(e.tw?1+e.tw/12:1)*(e.secret?SB_REWARD:1)*(e.rival?RIVAL_GOLD:1)*ngpReward()*(runMod()?MOD_XP:1)*heatK('xp')*(S.run&&S.run.rift?riftRew():1)*(1+xb('xpp')/100)*(e.living?SIEGE_XP:1)*((e.boss||e.elite)&&hasMod('scholar','a')?INSIGHT:1)*(S.run&&S.run.sweep?SWEEP_XP:1)); }   // Insight
function studyFoe(name,x){   // count a kill toward studying this kind of foe (its drop table opens in the bestiary)
  const notes=hasMod('scholar','b')&&(tally('notes'),T_('notes')%2===0), n0=S.kills[name]||0, n=S.kills[name]=n0+(notes?2:1)+(x|0)+(Math.random()*100<xb('studyp')?1:0)+(libStudy()>0&&Math.random()*100<libStudy()?1:0);   /* the Library (game-town2.js) */   /* the Scribe's Regalia: some kills count twice */   // Field Notes: every second kill counts twice
  const hit=at=>n0<at&&n>=at;
  if(hit(KNOW_AT)) notify('Bestiary: you have studied '+name+'. Its drop table is now known.','ok');
  for(const x of masteryRungs(name)) if(x.t.id!=='studied'&&hit(x.at)) notify('Mastery: '+name+' is now '+x.t.name+'. '+masteryGives(x.t)+'.','ok');
}
function killPowers(){   // unique powers that pay out on every kill
  const P=S.player;
  if(hasFlag('soulharvest')) P.mana=Math.min(pMana(),P.mana+6);
  if(hasFlag('censer')){ P.mana=Math.min(pMana(),P.mana+10); healAlly(P,Math.round(pMax()*.05)); }
}
function checkDeaths(){
  const r=S.run;
  for(const e of r.enemies){
    if(!(e.hp<=0)||e.dead) continue;
    if(e.echo){ echoFades(e); continue; }   /* the Hunger's echoes leave nothing (game-abbey.js) */
    if(e.risen){ e.dead=true; kitDeath(e); bossFoeDies(e); r.corpses.push(corpseOf(e)); log(e.name+' falls again.'); fxe('death',e); continue; }   /* called back by a Gravecaller: its reward was paid the first time */
    e.dead=true; r.kills++; S.quest.kills++; kitDeath(e); bossFoeDies(e); pestDeath(e);   /* Contagion (game-builds.js) */
    if(e.boss||e.elite) gainSoul();
    if(e.boss){ tally('bosses'); r.bossK=e.name; }   /* the History notes the boss that fell */
    if(e.elite) tally('elites');
    studyFoe(e.base,ascStudy(e));
    r.pending+=killXp(e); if(!e.stash) r.loot.push(...rollDrops(e)); killLoot(e,r);   // a stolen body drops no gear: the body is the reward
    killPowers(); capKill(e); faithKill(e,r); runeDrop(e,r);   /* skill runes (game-builds.js) */
    if(!e.rival&&!e.guard&&sigBody()){ const c=corpseOf(e);   /* guardians and Loud Grave leave no body (game-rift.js) */ if(e.stash) rivalReclaim(e,c); r.corpses.push(c); longNameRise(e,r); }   /* The Long Name (game-builds.js) */   // the rival leaves no body: they retreat
    if(e.boss) bossSpeaks(e,'bye');
    log(e.rival?e.name+' is beaten.':e.name+' falls.'); sfx('kill'); fxe('death',e);
    const page=e.secret?'secret':e.boss?(e.tw?'warden':'boss'):e.elite?'elite':null;   // who may carry a torn page
    if(page&&!r.trial&&!e.rival) findPage(page,r);
    if(e.secret) slaySecret(e,r);
    if(e.rival){ if(e.rsiege) rivalSiegeDown(e,r); else if(e.reck) reckDown(e,r); else rivalBeaten(e,r); }
    if(hasRunMod('volatile')) volatileBurst(e);
    if(hasAff(e,'splitting')) splitFoe(e);
  }
}
function minionOnHit(m,tg){   // what a minion's hit leaves behind (its traits; a vanguard may sunder): the log's tail, e.g. ' and poisons it'
  let extra='';
  if(!(tg.hp>0)&&hasTrait(m,'plaguebearer')) extra+=plagueJump(tg);
  if(hasTrait(m,'venom')&&tg.hp>0){ addDot(tg,'poison',m.atk*.15*pierceMul(.5),3); tally('poisoned'); extra+=' and poisons it'; }
  if(hasTrait(m,'necrotic')&&tg.hp>0){ addDot(tg,'blight',m.atk*.1*pierceMul(.5),2); if(tg.dots&&tg.dots.blight) extra+=' and blights it'; }
  if(tg.hp>0){ const sc=(hasTrait(m,'crushing')?ST_CH:0)+(m.role==='vanguard'?VAN_SUNDER:0); if(((hasTrait(m,'glaciermaul')&&hasSt(tg,'chilled'))||(sc&&Math.random()<sc))&&addSt(tg,'sundered',2)) extra+=' and sunders it'; }   // vanguards, and the Crushing trait
  if(hasTrait(m,'hexing')&&tg.hp>0&&Math.random()<ST_CH&&addSt(tg,'hexed',2)) extra+=' and hexes it';
  if(hasTrait(m,'witchrot')&&tg.hp>0){ if(hasSt(tg,'hexed')) addDot(tg,'blight',m.atk*.1*pierceMul(.5),2); else if(tg.dots&&tg.dots.blight&&addSt(tg,'hexed',2)) extra+=' and hexes it'; }
  const sw=hasTrait(m,'shatterwrought')?(m.swt=!m.swt):null;   // Shatterwrought alternates Chill and Burn instead of rolling
  if(hasTrait(m,'rimeborn')&&tg.hp>0&&(sw===null?Math.random()<RIME_CH:sw)&&addSt(tg,'chilled',2)) extra+=' and chills it';
  if(hasTrait(m,'cinderborn')&&tg.hp>0&&((sw===null?Math.random()<CINDER_CH:!sw)||(hasTrait(m,'pyreheart')&&m.hp<m.maxHp/2))){ addDot(tg,'burn',m.atk*CINDER_K*pierceMul(.5),2); if(tg.dots&&tg.dots.burn) extra+=' and burns it'; }
  return extra;
}
function plagueJump(tg){   // Plaguebearer: a slain foe's poison and blight move on to another foe
  const d=tg.dots||{}, o=liveFoes().filter(x=>x!==tg); if(!o.length||!(d.poison||d.blight)) return '';
  const to=pick(o); for(const k of ['poison','blight']) if(d[k]) addDot(to,k,d[k].d,d[k].t); return ' and its plague jumps to '+to.name;
}
const breakK=(m,tg)=>(hasTrait(m,'bonebreaker')&&hasSt(tg,'sundered')?1.25:1)*bondEchoK(m,tg);   /* a fallen partner's echo stands: +30% on the Hunger (game-abbey.js) */   // Bonebreaker
const mCritCh=m=>(m.role==='striker'?.25:0)+(hasMod('gravepact','a')?BLOOD_OATH:0)+markV(m,'marksman');
const blurCrit=m=>hasTrait(m,'blur')&&Math.random()<mCritCh(m);   // Blur: its extra strikes can crit
function currentTarget(){
  const r=S.run; let t=r.enemies.find(e=>e.id===r.target&&reachable(e));
  if(!t){ t=liveFoes().find(reachable)||liveFoes()[0]; r.target=t?t.id:null; }   /* a burrowed foe is out of reach while another stands */
  return t||null;
}
function setTarget(id){ const e=S.run&&S.run.enemies.find(x=>x.id===id); if(e&&reachable(e)) S.run.target=id; }

function act(kind){
  if(S.mode!=='battle') return;
  const r=S.run, P=S.player; r.fx={};
  const t=currentTarget(); if(!t) return; HITTER=P;
  if(kind==='strike'){
    let d=hit(pAtk()*pierceMul(strPen())*(1+.1*sk('edge'))*hexK(P)), crit=Math.random()<critChance(); if(crit){ d=Math.round(d*1.8); tally('crits'); } if(hasFlag('execute')&&t.hp<t.maxHp*.35) d=Math.round(d*1.5);
    const fb=frozenChilled(t); if(fb) d=Math.round(d*FROSTBREAK);
    hurtFoe(t,d); P.mana=Math.min(pMana(),P.mana+3); if(hasMod('edge','b')){ healAlly(P,Math.round(d*.1)); addDot(t,'bleed',d*BLOODLET,2); } if(crit&&hasMod('edge','a')) addSt(t,'sundered',2);   // Bloodletting, Rending
    log('You strike '+t.name+' for '+d+(crit?' (crit)':'')+'. +3 mana.'); fxe('strike',t,crit?{crit:1}:null); if(fb&&t.hp>0) frostbreak(t);
    if(hasFlag('echo')&&t.hp>0&&Math.random()<.25){ const d2=hit(pAtk()*pierceMul(strPen())); hurtFoe(t,d2,'phys'); log('Echo: the blade strikes again for '+d2+'.','ok'); }
    if(hasFlag('hellfire')){ for(const o of liveFoes()) if(o!==t) hurtFoe(o,Math.round(d*.4)); }
    else if(hasFlag('cleave')){ const o=liveFoes().filter(x=>x!==t); if(o.length) hurtFoe(pick(o),Math.round(d*.6)); }
  }else if(kind==='siphon'){
    if(P.mana<siphonCost()) return;
    P.mana-=siphonCost(); const low=t.hp<t.maxHp*SIPHON_LOW; let d=hit(pSiph()*pierceMul(SIPHON_PIERCE)*hexK(P)*shadowK()*faithSiph()); if(low) d*=2; deed('choir',1); SIPHONING=true; hurtFoe(t,d,'shad'); SIPHONING=false;   // pierces a quarter of armor; devours the weak
    if(hasFlag('chorus')) for(const o of liveFoes()) if(o!==t) hurtFoe(o,Math.round(d*.5),'shad');
    const h=healAlly(P,Math.round(d*(hasFlag('lifedrain')?SIPHON_HEAL_LD:SIPHON_HEAL))); const got=gainSoul();
    log('Soul Siphon '+(low?'devours ':'drains ')+t.name+' for '+d+(h?', you recover '+h:'')+(got?' and harvest a Soul ('+S.run.souls+'/'+SOUL_MAX+')':'')+'.'); fxe('siphon',t);
  }else if(kind==='ward'){
    if(P.mana<6) return;
    P.mana-=6; delete r.conf; const w=Math.round(pWard()*smokeK()); P.shield=Math.min(Math.round(pMax()*.6),P.shield+w);
    mark('p',0,0); log('Bone Ward raised. You hold '+P.shield+' ward.'); fxe('ward',P);
  }else if(kind.startsWith('sk:')){ SKILLHIT=1; const done=useSkill(kind.slice(3),t); SKILLHIT=null; if(!done) return; }
  else if(kind==='ult'){ if(!useUlt(t)) return; }
  else if(kind.startsWith('pot:')){ if(!drink(kind.slice(4))) return; }
  else if(kind==='guard'){ if(!guard()) return; }   // an order that costs the turn (game-faith-story.js)
  else return;
  sfx(kind==='strike'?'strike':kind==='guard'?'guard':kind.startsWith('pot:')?'heal':'skill');
  hungerAct();   /* the Last Entry counts your actions (game-abbey.js) */
  checkDeaths();
  if(!liveFoes().length){ roomWon(); return; }
  // minions act
  for(const m of S.army){
    if(m.hp<=0) continue;
    if(!liveFoes().length) break;
    if(lockedNow(m)) continue;   /* locked or rooted by a boss move (game-boss-kits.js) */
    HITTER=m;
    if(r.cloud>r.turn&&Math.random()<BK_CLOUD){ log(m.nick+' swings blind in the Swarm Cloud.'); continue; }
    if(m.role==='mender'){
      const hurt=allies().filter(a=>a.hp>0&&a.hp<(a.id==='p'?pMax():a.maxHp)*.85).sort((a,b)=>a.hp/(a.id==='p'?pMax():a.maxHp)-b.hp/(b.id==='p'?pMax():b.maxHp))[0];
      if(hurt){ const h=healAlly(hurt,Math.round(m.atk*.9*rnd(.9,1.1))); log(m.nick+' mends '+(hurt.id==='p'?'you':hurt===m?'itself':nameOf(hurt))+' for '+h+'.','ok'); markHeal(m,hurt,h); continue; }
    }
    let tg=minionTarget(m); if(!tg) break;
    const breach=m.role==='reaper'&&r.execute&&hasSt(tg,'sundered')&&foeArmor()>0;   // Breach: Execute ignores a Sundered foe's armor
    let d=hit(m.atk*(breach?pierceMul(1):dmgMul())*(r.frenzy>0?r.frenzyMul:1)*(m.role==='reaper'&&r.execute&&tg.hp<tg.maxHp*.4?2:1)*(hasTrait(m,'wrathful')&&m.hp<m.maxHp/2?1.4:1)*hexK(m)*rowK(m)*(tg.hp<tg.maxHp*BUTCHER_LOW?1+markV(m,'butcher'):1)*breakK(m,tg)*echoDmg(m,tg)); const cc=mCritCh(m), crit=(m.role==='striker'&&r.focus)||(cc>0&&Math.random()<cc); if(crit){ d=Math.round(d*1.8); tally('crits'); }
    const mt=minionType(m); KILL=m.role==='reaper'&&r.execute?'exec':null; hurtFoe(tg,d,mt); KILL=null; runeLeech(m,d); fxe('mhit',tg,{by:fxKey(m)});
    if(crit&&r.focus&&tg.charging&&tg.hp>0) breakCharge(tg,m.nick+'\'s focused strike breaks '+theName(tg.name)+'\'s focus.');
    let extra=minionOnHit(m,tg)+echoHit(m,tg)+kitReflect(tg,m,d);
    if(m.role==='reaper'&&m.hp>0){ const o=liveFoes().filter(x=>x!==tg&&reachable(x)); if(o.length){ const o2=pick(o); const d2=Math.round(d*.5); hurtFoe(o2,d2,mt); extra+=' and cleaves '+o2.name+' for '+d2; } }
    if(hasTrait(m,'frenzied')&&tg.hp>0&&m.hp>0&&Math.random()<.2){ let d3=hit(m.atk*dmgMul()*(r.frenzy>0?r.frenzyMul:1)*rowK(m)*breakK(m,tg)); const c3=blurCrit(m); if(c3) d3=Math.round(d3*1.8); hurtFoe(tg,d3,mt); d+=d3; extra+=', then strikes again for '+d3+(c3?' (crit)':''); if(hasTrait(m,'blur')) extra+=minionOnHit(m,tg); }   // Blur: the extra strike carries its on-hit effects
    if(hasTrait(m,'leech')){ const h=healAlly(m,Math.round(d*(hasTrait(m,'bloodfiend')&&m.hp<m.maxHp/2?.5:.25))); if(h) extra+=' and drinks '+h+' HP'; }
    log(m.nick+' hits '+tg.name+' for '+d+(crit?' (crit)':'')+extra+'.'); if(breach) combo('breach',tg,'Breach: '+m.nick+' cuts through the cracked armor.');
    markHit(m,tg,d);
    checkDeaths();
  }
  r.focus=false; r.execute=false; HITTER=null;   // these orders last one minion phase
  if(!liveFoes().length){ roomWon(); return; }
  // foes act
  checkPhase(); bossRoomTurn();
  const hpBefore=P.hp;
  for(const e of liveFoes()){
    if(e.hp<=0) continue; let alive=allies().filter(hittable); if(!alive.length) break;
    if(e.stun>0){ delete e.it; delete e.burrow; e.stun--; e.froze=r.turn; if(e.charging) breakCharge(e,e.name+' is frozen. The frost breaks its focus and'); else log(e.name+' is frozen and cannot act.','ok'); continue; }
    if(e.abil&&bossTurn(e)){ if(P.hp<=0&&playerFalls()) return; checkDeaths(); continue; }   // a move turn keeps the planned blow for its next turn
    if(!intentOk(e)) rollIntent(e);   // the planned action, rolled again only if its target fell or Taunt pulled it away
    const it=e.it; delete e.it; if(!it) continue;
    if(kitAct(e,it)){ checkDeaths(); continue; }   /* a kit's own action (game-kits.js) */
    if(it.sf){ delete e.burrow; log(e.name+' surfaces.','bad'); }
    if(it.amb) e.ambU=1;
    if(it.k==='heal'){
      const hurt=r.enemies.find(x=>x.id===it.t);
      if(hurt){ const h=Math.min(Math.round(e.atk*.9*(1-foeArmor())*blightK(hurt)),hurt.maxHp-hurt.hp); /* scaled by armor like your damage, so menders can't stall a fight */ hurt.hp+=h; if(pactOn('regen')&&(hurt.dots||hurt.st)){ delete hurt.dots; delete hurt.st; log(e.name+' mends '+hurt.name+' and knits its wounds shut.'); continue; } log(e.name+' mends '+hurt.name+'.'); continue; }   /* Knitting Flesh: a mender cleanses too */
    }
    let tg=alive.find(a=>fxKey(a)===it.t)||foeTarget(foeReach(e,alive));
    if(it.bw&&fxKey(tg)===it.t) log('Bulwark: '+tg.nick+' intercepts '+e.name+'\'s blow.','ok');   // planned with the intent, so the card already showed it
    if(omen()==='eclipse'&&Math.random()<ECLIPSE_MISS){ log(e.name+' misses '+(tg.id==='p'?'you':nameOf(tg))+' in the dark.','ok'); continue; }   // Black Eclipse
    let d=hit(e.atk*enrage(e)*(hasAff(e,'enraged')&&e.hp<e.maxHp/2?1.6:1)*hexK(e)*kitAtk(e,it)); let crit=e.role==='striker'&&Math.random()<foeCrit(); if(crit&&hasSt(e,'hexed')){ crit=false; combo('fizzle',e,'Fizzle: the hex spoils '+e.name+'\'s killing blow.'); } if(crit&&tg.id==='p'&&hasMod('calcify','a')) crit=false;   /* Petrified: rolled, then refused */ if(crit) d=Math.round(d*1.8);
    { const gv=guardBlow(tg,d); if(gv){ tg=gv; d=Math.round(d*SB_TAKE); } }   // Guard: swapped here so the log names who was hit
    BLOW={n:e.name,k:crit?'crit':'hit'}; SAP=hasKit(e,'sapper'); hurtAlly(tg,d,foeHitType(e)); SAP=false; BLOW=null; fxe('hurt',tg,{crit:crit?1:0,by:e.id}); if(crit) addDot(tg,'bleed',e.atk*(pactOn('claws')?PACT_CLAW_BLEED:.3),pactOn('claws')?PACT_CLAW_T:2);   // a striker's crit opens a wound (deeper under Sharp Claws)
    if(hasAff(e,'vampiric')){ const h=Math.min(e.maxHp-e.hp,Math.round(d*.4*blightK(e))); if(h>0){ e.hp+=h; mark(e,0,h); } }
    const ex=foeOnHit(e,tg)+echoThorns(e,tg,d);
    log(e.name+' hits '+(tg.id==='p'?'you':nameOf(tg))+' for '+d+(crit?' (crit'+(tg.hp>0&&tg.dots&&tg.dots.bleed?', bleeding':'')+')':'')+ex+'.','bad');
    if(tg.id==='p'&&hasFlag('thorns')&&e.hp>0) hurtFoe(e,Math.max(1,Math.round(d*.2*(1-foeArmor()))));
    if(tg.id==='p'&&hasMod('calcify','b')&&e.hp>0) hurtFoe(e,Math.max(1,Math.round(d*BARBS*(1-foeArmor()))));   // Barbed Hide
    if(tg.id!=='p'&&markV(tg,'spiked')&&e.hp>0) hurtFoe(e,Math.max(1,Math.round(d*markV(tg,'spiked')*(1-foeArmor()))));   // the Spiked mark
    if(tg.hp<=0&&tg.id!=='p') log(tg.nick+' is down.','bad');
    if(P.hp<=0&&playerFalls()) return;
  }
  hasteStrikes(); requiemStrikes(); if(P.hp<=0&&playerFalls()) return;   /* Requiem (game-builds.js) */
  checkDeaths(); if(!liveFoes().length){ roomWon(); return; }
  tickDots(); if(P.hp<=0&&playerFalls()) return;
  if(P.hp<hpBefore){ sfx('hurt'); if(hpBefore-P.hp>=pMax()*.2) ui.shake=true; }   // a heavy turn shakes the screen
  checkDeaths(); if(!liveFoes().length){ roomWon(); return; }
  r.turn++; if(!hasRunMod('drought')){ let g=1+G('regen')+sk('soulwell')+(hasMod('deathless','a')?DEEP_REGEN:0); g=rbLungs(sigRegen(g)); if(omen()==='soulstorm'){ r.mf=(r.mf||0)+g*STORM_REGEN; const x=Math.floor(r.mf); r.mf-=x; g+=x; } P.mana=Math.min(pMana(),P.mana+g); } skillTick();   // Soul Storm: +20%, the fractions carried
  echoTurn(); bossEndTurn(); hfTurn();   /* Undone shieldbearers (game-kits.js), boss hazards (game-boss-kits.js) */
  if(hasFlag('halo')) allies().forEach(a=>{ if(a.hp>0) healAlly(a,Math.round((a.id==='p'?pMax():a.maxHp)*.04)); });
  if(r.turn===9&&liveFoes().some(e=>e.tw&&e.boss)) log('Wrath: the warden is enraged and hits harder every turn.','bad');
  planFoes();   // what every foe will do next turn, shown on its card
}
function gateCleared(r){   // the boss room of a gate is won: story, clear tallies (titles, difficulty, curses) and the secret-master hint; returns the clear bonus XP
  const di=r.di, fk=runFarm(); unlockStory('g'+di,r); r.cleared=true; S.quest.clears++;   /* fk before the clear is marked: a first clear pays in full */
  S.ti=S.ti||{}; S.ti.clr=S.ti.clr||{}; S.ti.clr[di]=1; tally('clrN'+di); orderEv('clear',di); rwCleared(r);   /* a rewritten gate (game-asc.js) */
  if(T_('clrN'+di)===SECRET_HINT&&secretHinted(di)) notify('A torn page in the Ledger: '+SECRET[di].hint,'');
  if(r.heat){
    S.heatMax=S.heatMax||{}; S.heatMax[di]=Math.max(S.heatMax[di]||0,r.heat); tally('heat'+r.heat); if(r.mod) tally('damned');
    if(r.heat===3){ tally('nm'+di); if(r.mod) tally('damned3'); }
  }
  if(r.mod){ tally('cur_'+r.mod); tally('cursed'); }
  if(!r.hurt) tally('flawless');
  if(!r.lostN) deed('hon',10); faithHarvest(r);   /* Morrow: a clear with no minion lost; Ulm's Harvest Home (game-pantheon.js) */
  return Math.round(RK[di].clear*fk);
}
function roomWon(){
  const r=S.run, P=S.player; r.events=[]; r.focus=false; r.execute=false; bondsRoom(); lnClear(); if(r.turn>=LONG_HAUL&&!r.sweep) tally('longHaul');   /* The Long Name's thralls go; Long Haul (game-builds.js) */   /* Focus and Execute end with the room even if no minion phase came */
  let xp=r.wk?0:r.pending; r.pending=0; const dn0=r.downs||0;   /* the weekly dive pays only its own rewards (game-rift.js) */
  const last=r.room===r.rooms-1;
  const share=Math.round(xp*.5), downs=[], bound=[];   /* the downed come first on the screen after the fight: who is gone, who got back up */
  for(const m of S.army.slice()){
    if(m.thrall) continue;   /* a siege thrall earns nothing and is gone at dawn */
    if(m.hp<=0) r.downs=(r.downs||0)+1;   /* downed this room: a Trial's score counts them */
    if(m.hp>0){ if(minionXp(m,Math.round(share*ascReadXp(r,m)))) r.events.push({m:m.nick+' reaches level '+m.lvl+'.',c:'ok'}); continue; }
    const ch=r.wk?0:shatterOdds(m);   /* nothing shatters in the weekly dive (game-rift.js) */
    if(Math.random()*100<ch&&!secondHand(m,r)){ r.lostN=(r.lostN||0)+1; returnGear(m); S.army=S.army.filter(x=>x!==m); downs.push({m:m.nick+', '+theName(mName(m))+', shattered and is gone ('+ch+'% chance).',c:'bad'}); memorialize(m,r.tw?{f:r.tw}:r.rift?{rd:r.rift}:{g:r.di}); }
    else{ m.hp=Math.ceil(m.maxHp*ascBind()); bound.push(m); }
  }
  if(bound.length){ const ch=Math.max(...bound.map(shatterOdds)); downs.push({m:'Downed but bound back together at '+Math.round(ascBind()*100)+'% HP: '+bound.map(m=>m.nick).join(', ')+'. '+(ch?'The chance to shatter was '+ch+'%.':'None of them could shatter.'),c:'down'}); }
  r.events.unshift(...downs);
  if(r.tw){
    const f=r.tw; S.tower.best=Math.max(S.tower.best,f); recBest('floor',f); towerSplit(r); for(const k of [10,25,40,50,60,75,90,100]) if(S.tower.best>=k) unlockStory('t'+k,r);
    if(f%10===0){ xp+=120*f; S.quest.clears++; towerBossLoot(f,r); }
    if(f===100) r.cleared=true;   // floor 100 ends the first climb; floor 101 onward is the endless abyss
  } else if(last){ xp+=r.siege?siegeWon(r):r.rift?riftCleared(r):r.trial?trialCleared(r):r.rg?rgCleared(r):r.rk?reckCleared(r):gateCleared(r); if(!r.siege&&!r.rift&&!r.trial&&!r.rg&&!r.rk) rivalMeet(r); }
  if(r.trial){ r.loot=[]; r.gold=0; r.troph={}; r.corpses=[]; }
  if(r.wk){ r.loot=[]; r.gold=0; r.troph={}; r.bdust=0; }   /* nor gear, gold or trophies: shards and a Riftborn piece only */   /* a Trial pays only its first completion each week: no gear, gold, trophies or bodies */
  for(const id of r.loot){ const it=addItem(id); if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } else r.lostLoot.push(ITEM[id].name); } r.loot=[];
  if(r.rift){ if(r.wk) weekRoom(r); rbDrop(r,last); }   /* the weekly dive's depth; Riftborn pieces (game-rift.js) */
  bankLoot(r); r.won=(r.won||0)+1; S.quest.rooms=(S.quest.rooms||0)+1; tally('rooms'); if(r.tw){ tally('floors'); orderEv('floor'); } else if(!r.siege&&!r.rift&&!r.trial&&!r.rg&&!r.rk) orderEv('room',{ok:(r.downs||0)===dn0,di:r.di}); if(P.hp>0&&P.hp<=pMax()*.1) tally('lastBreath');
  r.event=(!r.tw&&!r.siege&&!r.trial&&!r.rg&&!r.rk&&!r.wk&&!last&&Math.random()<EVENT_CHANCE)?rollEvent():null;   // something waits between rooms
  r.doors=(!r.tw&&!r.siege&&!r.trial&&!r.rg&&!r.rk&&!r.wk&&!last)?rollDoors(r):null;   // which way next
  r.gained+=xp; r.lastXp=xp;
  r.ups+=addXp(xp); preRooms(r);   // after the level-up: the rooms behind the doors stand at the level you will enter them at
  if(r.siege&&!last){ nextWave(); return; }   // a siege goes straight on to its next wave
  rivalTheft(r); S.mode='raise';
}
function defeat(){
  sfx('death');
  const r=S.run; if(r.siege){ r.pending=0; r.loot=[]; S.mode='defeat'; S.army.forEach(m=>{ if(m.hp<=0) m.hp=Math.ceil(m.maxHp*.4); }); siegeLost(false); return; }   // a lost siege costs no XP; the town pays instead
  S.ti=S.ti||{}; S.ti.deaths=(S.ti.deaths||0)+1; r.pending=0; r.gold=0; r.troph={}; r.bdust=0; S.mode='defeat'; if(!r.wk) S.player.xp=Math.max(0,S.player.xp-Math.round(need(S.player.lvl)*DIFF.deathXp));   /* the weekly dive pays no XP and costs none (game-rift.js) */
  S.army.forEach(m=>{ if(m.hp<=0) m.hp=Math.ceil(m.maxHp*.4); });
  if(rivalStanding(r)) rivalLost(r); if(reckStanding(r)) reckLost(r);
  if(r.blow) r.felled=r.blow;
  if(r.wk) notify('The weekly dive ends at depth '+(r.wkD||0)+'. It costs you no XP.','bad'); else notify('You were dragged out of '+(r.tw?'the Hell Tower on floor '+r.tw:'the '+DUNGEONS[r.di].name)+'. That room\'s spoils are lost, and you lose '+Math.round(DIFF.deathXp*100)+'% of a level in XP.','bad');
}
// ----- the fall: the blow that felled you, and Instant Retry
// BLOW: the foe blow being dealt right now (set around each hurtAlly on you); ROOM0: the room as it began. ROOM0 lives outside the save:
// after a reload the defeat screen simply has no Retry.
let BLOW=null, ROOM0=null, KILL=null, SAP=false, HITTER=null, SKILLHIT=null;   /* SKILLHIT: a skill's damage is landing (the Hollow Seraph's Halo) */   /* HITTER: who lands the hits now (you, then each minion), for reflects */   // SAP: a Sapper's blow is landing (its hits tear twice the ward)
//   // KILL: what deals the blow to a foe right now ('reap', 'exec', a DoT kind; null: a hit), for the body's condition
function blowNote(b){ const n=Object.assign({},b), c=blowCounters(b); if(c.length) n.c=c; return n; }   // the blow about to land, and the answers you had and did not use
function blowCounters(b){   // the answers to a blow you have and have not used, only those that apply to it (the defeat recap and the bestiary's Ledgered hints)
  const r=S.run, c=[], up=role=>S.army.some(m=>m.role===role&&m.hp>0)&&!(r.cmd&&r.cmd[role]);   /* an order not yet given this room, with someone to give it to */
  if((b.k!=='sig'||b.mv==='sunder')&&!(r.taunt>0)&&up('vanguard')) c.push('taunt');   /* single-target blows only: Taunt moves no other boss move */
  if(!(r.cmd&&r.cmd.guard)&&guardFront()) c.push('guard');   /* every blow, boss moves too */
  if(!(S.player.shield>0)) c.push('ward');
  if(sk('chill')&&!(r.silence>0)&&!skCd('chill')) c.push('chill');
  if(b.w&&up('striker')) c.push('focus');   /* a charged move: a focused crit breaks it */
  return c;
}
function snapRoom(){ const r=S.run; if(!r) return; delete r.blow; delete r.felled;   // the start of a fight room: what Instant Retry restores
  ROOM0=(r.siege||r.trial)?null:{r,j:JSON.stringify(r),s:JSON.stringify({p:['hp','mana','shield','st','dots'].map(k=>S.player[k]),a:S.army.map(m=>[m.uid,m.hp,m.st,m.dots])})}; }
// Not for sieges (a lost siege is the town's loss, at once), Trials (the score counts each attempt) or a room the rival stood in (the loss is already theirs to keep).
const canRetry=()=>S.mode==='defeat'&&ascRetry()&&!!ROOM0&&ROOM0.r===S.run&&!S.run.siege&&!S.run.trial&&!S.run.wk&&!S.run.rk&&!S.run.enemies.some(e=>e.rival);
function retryRoom(){   // the room again as it began: same foes at full HP, you and your army as you entered; no watch, the XP loss stands, potions drunk stay drunk
  if(!canRetry()) return false;
  const r=S.run, o=JSON.parse(ROOM0.j), s=JSON.parse(ROOM0.s), P=S.player;
  for(const k of ['kills','dt','dd','mh','hurt','soulT','tt','recF','grace','revives','draftU','xordU','abbotU']) if(r[k]!==undefined) o[k]=r[k]; else delete o[k];   /* what happened in the fall still happened: run stats, records, turns, Grace and armor revives spent */
  o.retries=(r.retries||0)+1; S.run=ROOM0.r=o;
  ['hp','mana','shield','st','dots'].forEach((k,i)=>{ if(s.p[i]==null) delete P[k]; else P[k]=s.p[i]; });
  for(const m of S.army){ delete m.sx; delete m.mw; const x=s.a.find(y=>y[0]===m.uid); if(!x) continue;   /* a room begins with Stitched unused and no Warden ward */ m.hp=Math.min(m.maxHp,x[1]); if(x[2]) m.st=x[2]; else delete m.st; if(x[3]) m.dots=x[3]; else delete m.dots; }
  P.hp=Math.min(pMax(),P.hp); P.mana=Math.min(pMana(),P.mana);   /* gear taken off on the defeat screen lowers the caps the snapshot was taken under */
  S.mode='battle'; log('You stand at the threshold again. The room waits as it was.','story'); sfx('skill'); return true;
}
function descend(kind){   // go on: through one of the doors in the gates (the first door by default), or up a floor in the Tower
  if(S.mode!=='raise'||S.run.cleared) return false;
  const r=S.run, P=S.player;
  if(r.doors){ if(kind==null) kind=r.doors[0]; if(!r.doors.includes(kind)) return false; } else kind='fight';
  P.hp=Math.min(pMax(),P.hp+Math.round(pMax()*DIFF.heal)); P.mana=Math.min(pMana(),P.mana+Math.round(pMana()*DIFF.mana)); P.shield=0;
  S.army.forEach(m=>m.hp=Math.min(m.maxHp,m.hp+Math.round(m.maxHp*DIFF.mheal)));
  r.cd={}; r.frenzy=0; r.silence=0; r.event=null; allies().forEach(clearAll); if(r.tw) r.tw++; r.room++; if(r.wk) weekStep(r); r.roomKind=kind; r.doors=null; if(kind==='elite') tally('archs');
  if(kind==='rest'||kind==='treasure'||kind==='script'){ quietRoom(kind); return true; }
  S.mode='battle'; spawnRoom(); return true;
}
function returnTown(){
  if(S.run&&S.run.siege){ siegeEnd(); save(); return; }   // back from the walls: then dawn
  const P=S.player;
  lnClear(); if(S.run){ weekEnd(S.run); recordRun(S,S.run,runResult(S.run)); recRun(S.run); }   /* the weekly dive's depth (game-rift.js) */
  S.army.forEach(m=>m.hp=m.maxHp); cmdSync(); P.hp=pMax(); P.mana=pMana(); P.shield=0; allies().forEach(clearAll);
  const rd=S.run&&S.run.read; S.run=null; S.mode='town'; if(rd) syncArmy();   /* the Book Hungers lets go (game-asc.js) */
  if(S.watches<=0) endDay();
  save();
}
function flee(){ if(S.mode!=='battle') return; if(S.run.siege){ S.run.fled=true; S.run.pending=0; S.run.loot=[]; S.army.forEach(m=>{ if(m.hp<=0) m.hp=Math.ceil(m.maxHp*.4); }); siegeLost(true); S.mode='defeat'; return; }   /* fleeing a siege counts as a defeat */
  S.run.fled=true; if(rivalStanding(S.run)) rivalLost(S.run); if(reckStanding(S.run)) reckLost(S.run); notify('You fled the gate and left the room\'s spoils behind.','bad'); returnTown(); }


// ----- items: bag and equipment
function addItem(id,ro){ if(S.inv.length>=bagMax()&&!ITEM[id].uq) return null; const it={u:++S.uid,id}; const r=ro===undefined?rollItem(id):ro; if(r&&r.length) it.ro=r; S.inv.push(it); return it; }
const findItem=u=>{ const i=S.inv.find(x=>x.u===u); if(i) return i; for(const sl of GEAR_SLOTS) if(S.equip[sl]&&S.equip[sl].u===u) return S.equip[sl]; return null; };
const reforgeCost=it=>Math.round(buyPrice(ITEM[it.id])*REFORGE_COST*(1-B_FORGE*bl('forge')));
function reforge(u){   // re-roll a piece's bonus lines for gold; always leaves at least one line
  const it=findItem(u); if(!it||S.mode!=='town') return false; const d=ITEM[it.id]; if(d.uq) return false;
  const c=reforgeCost(it); if(S.gold<c) return false;
  S.gold-=c; vitals(()=>{ if(it.hf){ hfReroll(it); return; } it.ro=rollItem(it.id,true)||undefined; if(!it.ro) delete it.ro; });   /* a heartforged piece keeps its lines (game-forge.js) */ tally('reforged'); sfx('level'); return true;
}
function vitals(fn){ const a=pMax(), b=pMana(); fn(); const P=S.player, a2=pMax(), b2=pMana(); P.hp=Math.min(a2,P.hp+Math.max(0,a2-a)); P.mana=Math.min(b2,P.mana+Math.max(0,b2-b)); syncArmy(); }
function equip(u){
  if(S.mode==='battle') return;
  const i=S.inv.findIndex(x=>x.u===u); if(i<0) return;
  vitals(()=>{ const it=S.inv[i], sl=ITEM[it.id].slot, old=S.equip[sl]; S.inv.splice(i,1); if(old) S.inv.push(old); S.equip[sl]=it; });
}
function unequip(sl){ if(S.mode==='battle'||!S.equip[sl]) return; if(S.inv.length>=bagMax()&&!ITEM[S.equip[sl].id].uq){ notify('Your bag is full. Make room first.','bad'); return; }   /* as takeGear refuses */
  vitals(()=>{ S.inv.push(S.equip[sl]); S.equip[sl]=null; }); }
function discard(u){ S.inv=S.inv.filter(x=>x.u!==u||x.lk); }

// ----- raising
// The first raise of a save always answers (a new necromancer alone in room 1 failed ~44% of the time at ~34% a body). New Game+ keeps
// its lifetime raise count, so it does not get this again.
const firstRaise=()=>!!(S&&S.firstRaise)&&!T_('raised');
// One soul per boss: a boss is one soul however often its gate is cleared, so while a body of that boss serves you (army, Reserve, at
// the gate or on a raid) another will not rise. Before this the bots ended every game with ten or more Pale Sovereigns and no vanguards.
const allMinions=()=>S.army.concat(benched(),...(S.raids||[]).map(x=>x.units||[]));
const SOUL_BOUND='A boss is one soul: while one of its bodies serves you, in the army, the Reserve or on a raid, another will not rise.';
const soulBound=c=>!!(c&&c.boss)&&allMinions().some(m=>m.boss&&(m.kind||m.name)===c.base);
function raiseChance(c){
  if(soulBound(c)) return 0;
  if(firstRaise()) return 100;
  let ch=RAISE_BASE+A('will')*RAISE_WILL+G('raise')+4*sk('mastery')+B_OSS*bl('ossuary')+(omen()==='paletide'?OMEN_RAISE:0)+(S.player.lvl-c.lvl)*RAISE_LV-RK[c.rankI].pen;
  if(c.elite) ch-=RAISE_ELITE; if(c.boss) ch-=RAISE_BOSS+RAISE_BOSS_EACH*S.army.concat(benched()).filter(m=>m.boss).length; if(c.free) ch+=STRAGGLER_BONUS; ch+=masteryRaise(c.base)-pactRaise()+condRaise(c)+(hasInsc('many')?INSC_RAISE:0)+incRaise()+townRaise(c)+rgRaise(c)+twoBooks()+faithRaiseK(c)+ascRaise();
  return clamp(Math.round(ch),RAISE_MIN,RAISE_MAX);
}
const raiseCost = c=>c.free?0:Math.ceil((8+c.rankI*3+(c.boss?4:0))*ascRaiseCost()*(hasFlag('cheapraise')?.5:1)*(hasMod('mastery','b')?.75:1)*(1-.06*sk('thrift')));
function freeNick(){ const used=S.army.concat(benched(),...(S.raids||[]).map(x=>x.units)).map(m=>m.nick); const f=NICKS.filter(n=>!used.includes(n)); return f.length?pick(f):pick(NICKS)+' II'; }
const SALT_BONUS=20, SALT_MAX=3, saltPrice=()=>Math.round((10+S.player.lvl*3)*dreadPriceK());   // Grave Salts: bought at the market, +20% on one raise
const RAISE_BASE=18, RAISE_WILL=1.1, RAISE_MIN=1, RAISE_MAX=80, SALT_CAP=95;   // salts may still reach 95%
const RAISE_BOSS_EACH=10;   // less per boss already in the army or Reserve, so bosses do not snowball
const RAISE_LV=3, RAISE_ELITE=10, RAISE_BOSS=15,SHATTER_BASE=50, SHATTER_WILL=1, SHATTER_MIN=20, BIND_HP=.4;   // % per level you stand above the body, the elite and boss penalties; a downed minion's shatter chance after a fight (% , less per Will point, never below the floor)
function shatterOdds(m){   // % chance a downed minion shatters for good when its room ends; otherwise it binds back at BIND_HP. Never in a siege (home ground), never Grave-bound, never with Bone Bank
  if(hasFlag('bonebank')||hasTrait(m,'gravebound')||(S.run&&S.run.siege)) return 0;
  return Math.max(0,Math.max(SHATTER_MIN,SHATTER_BASE-A('will')*SHATTER_WILL)-hospice()-ascShatter());   /* Deep Scars (game-asc.js) */   /* Morrow's Hospice */
}
const saltAdd=()=>hasMod('thrift','b')?SENSE_SALT:SALT_BONUS;   // Grave Sense
const saltChance=c=>soulBound(c)?0:firstRaise()?100:clamp(raiseChance(c)+saltAdd(),RAISE_MIN,SALT_CAP);
function tryRaise(id,salt,bench){   // bench: raise to the Reserve, only when the army is full and the Reserve has room
  if(S.mode!=='raise') return;
  const r=S.run, P=S.player, c=r.corpses.find(x=>x.id===id); if(!c||c.tried) return;
  r.events=[];
  if(soulBound(c)){ r.events.push({m:c.name+'\'s soul is already bound to you.',c:'bad'}); return; }
  if(quietLocked()){ r.events.push({m:'The Ledger is quiet. Nothing rises until your first gate clear of this cycle.',c:'bad'}); return; }   /* the Quiet Valley (game-abbey.js) */
  const toRes=!!bench&&armyUsed()>=slots()&&reserveRoom();
  if(armyUsed()>=slots()&&!toRes){ r.events.push({m:'Your army is full. Release someone first.',c:'bad'}); return; }
  if(c.boss&&pactOn('deaf')&&!((r.souls||0)>0)){ r.events.push({m:'Deaf Graves: a boss\'s body needs a Soul to answer. You have none.',c:'bad'}); return; }   /* the Pact of Deaf Graves */
  const cost=raiseCost(c);
  if(P.mana<cost){ r.events.push({m:'Not enough mana. You need '+cost+'.',c:'bad'}); return; }
  const salted=!!(salt&&S.salts>0);
  P.mana-=cost; c.tried=true; if(salted) S.salts--; if(c.boss&&pactOn('deaf')) r.souls--;
  if(Math.random()*100<(salted?saltChance(c):raiseChance(c))){
    const m={uid:++S.uid,armed:!!c.armed,eq:c.armed?{weapon:null,armor:null,relic:null}:null,nick:c.mem&&!S.army.concat(S.reserve).some(x=>x.nick===c.mem)?c.mem:freeNick(),name:c.name,kind:c.base,role:c.role,rankI:c.rankI,lvl:c.lvl,xp:0,boss:c.boss,elite:c.elite,hf:c.hf,af:c.af,tw:c.tw,hp:1,maxHp:null,atk:0};
    if(hasFlag('bindsouls')) m.lvl=Math.min(S.player.lvl+2,m.lvl+2);
    if(hasMod('mastery','a')) m.lvl=Math.max(m.lvl,Math.min(S.player.lvl+2,m.lvl+GRAVECALLER));   // Gravecaller
    { const ml=masteryLv(c.base); if(ml) m.lvl=Math.max(m.lvl,Math.min(S.player.lvl+2,m.lvl+ml)); }   // a Ledgered kind rises higher, never past your level + 2
    m.lvl0=m.lvl; m.stage=0; m.traits=[c.cd&&CORPSE_CONDS[c.cd]?CORPSE_CONDS[c.cd].trait:rollTrait([])]; if(c.boss) m.traits.push(rollTrait(m.traits)); if(c.cd&&CORPSE_CONDS[c.cd]) m.cd=c.cd; if(c.recl){ m.recl=1; tally('reclaimed'); }   // bosses rise with two traits; how the body died replaces the random one
    if(c.aff&&c.aff.length){ const t=AFFIX[pick(c.aff)].trait; if(!m.traits.includes(t)) m.traits.push(t); }   // an elite keeps one of its affixes
    { const ct=carryTrait(m); if(ct) r.events.push({m:m.nick+' rises with the trait you carried: '+TRAITS[ct].name+'.',c:'ok'}); }   /* a carried trait (game-asc.js) */
    if(rollCommand(m)) tally('commanders');
    syncMinion(m); m.hp=m.maxHp; if(toRes){ S.reserve.push(m); c.res=1; } else S.army.push(m); r.raised++; faithRaised(c); if(faithOf()==='hon'&&r.raised>MORROW_RAISE) vowBreak('hon','body '+r.raised+' raised in one run'); S.firstRaise=0; S.ti=S.ti||{}; S.ti.raised=(S.ti.raised||0)+1; if(m.armed) S.ti.armed=(S.ti.armed||0)+1;
    if(!r.siege){ dread(DREAD_RAISE); orderEv('raise',c); } if(c.free) tally('straggler'); if(c.boss) tally('raisedBoss'); c.result='raised'; if(c.boss||c.elite) moment(m.nick+' rises: '+(c.boss?'a boss':'an elite')+' serves you','ok'); c.minion=m.nick+' ('+m.traits.map(t=>TRAITS[t].name).join(', ')+')'; sfx('raise'); fxe('raise',c);
  }else{ c.result='failed'; sfx('fail'); fxe('rfail',c); if(hasMod('thrift','a')&&cost>0){ const back=Math.floor(cost*FRUGAL); P.mana=Math.min(pMana(),P.mana+back); r.events.push({m:'Frugal Rites: '+back+' mana comes back.',c:'ok'}); } }   // Frugal Rites
}
// Quicker raising: try every untouched body, most valuable first (salts on bosses and elites), until mana or slots run out.
const bodyValue=c=>(c.boss?1000:0)+(c.elite?300:0)+c.rankI*50+c.lvl+(c.free?500:0);
function raiseBest(){
  if(S.mode!=='raise') return 0; const r=S.run, P=S.player; let n=0;
  for(const c of r.corpses.filter(c=>!c.tried).sort((a,b)=>bodyValue(b)-bodyValue(a))){
    if(armyUsed()>=slots()) break; if(P.mana<raiseCost(c)) continue;
    tryRaise(c.id,(c.boss||c.elite)&&S.salts>0); n++; }
  return n;
}
const weakest=()=>S.army.slice().sort((a,b)=>mPower(a)-mPower(b))[0]||null;
function returnGear(m){ if(!m.eq) return; for(const sl of GEAR_SLOTS){ if(m.eq[sl]){ S.inv.push(m.eq[sl]); m.eq[sl]=null; } } }
function release(uid){ const m=S.army.concat(benched()).find(x=>x.uid===uid); if(m) returnGear(m); S.army=S.army.filter(m=>m.uid!==uid);   // the army, the Reserve or the gate: only the minion you pick
  if(S.reserve) S.reserve=S.reserve.filter(m=>m.uid!==uid); if(S.waiting) S.waiting=S.waiting.filter(m=>m.uid!==uid); bondsClean(); }
function giveGear(uid,u){
  if(S.mode==='battle') return;
  const m=findMinion(uid), i=S.inv.findIndex(x=>x.u===u); if(!m||!m.armed||i<0) return;
  const it=S.inv[i], sl=ITEM[it.id].slot; m.eq=m.eq||{weapon:null,armor:null,relic:null};
  S.inv.splice(i,1); if(m.eq[sl]) S.inv.push(m.eq[sl]); m.eq[sl]=it; syncMinion(m); m.hp=Math.min(m.hp,m.maxHp);
}
function takeGear(uid,sl){
  if(S.mode==='battle') return;
  const m=findMinion(uid); if(!m||!m.eq||!m.eq[sl]) return;
  const it=m.eq[sl]; if(S.inv.length>=bagMax()&&!ITEM[it.id].uq){ notify('Your bag is full. Make room first.','bad'); return; }
  S.inv.push(it); m.eq[sl]=null; syncMinion(m); m.hp=Math.min(m.hp,m.maxHp);
}

