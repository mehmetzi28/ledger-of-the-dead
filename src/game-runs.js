// ----- dungeon runs
function log(m,c){ const r=S.run; r.log.unshift({m,c:c||''}); r.log.length=Math.min(r.log.length,10); }
function makeEnemy(di,lvl,boss){
  const D=DUNGEONS[di]; let name,role,hf=1,af=1;
  if(boss){ name=D.boss[0]; role=D.boss[1]; }
  else{ const t=pick(D.mobs); name=t[0]; role=t[1]; hf=t[2]; af=t[3]; }
  const elite=!boss&&Math.random()<eliteChance();
  const s=mobStats(di,lvl,hf,af,boss,elite);
  const e={id:'e'+(++S.uid),name:(elite?pick(ELITE)+' ':'')+name,base:name,role,rankI:di,lvl,hf,af,boss,elite,maxHp:s.hp,hp:s.hp,atk:s.atk,dead:false};
  if(boss) giveAbility(e,GATE_ABIL[di]);
  return e;
}
// Rule: a room never holds more than one mender. Re-roll until the new enemy fits.
function makeSecret(di,lvl){
  const e=makeEnemy(di,Math.max(lvl+2,S.player.lvl+SB_LV),true), B=SECRET[di]; e.name=e.base=B.name; e.secret=true;   // never weaker than you: an outgrown gate still hides a real threat
  const sg=Math.max(di,topGate()); if(sg>di){ const st=mobStats(sg,e.lvl,1,1,true,false); e.maxHp=e.hp=st.hp; e.atk=st.atk; }   // fights with the strength of the hardest gate open to you
  const grow=1+SB_GROW*Math.max(0,S.player.lvl-SAFE[sg]);   // a necromancer far past the gates has an army to match: so does the master
  e.maxHp=e.hp=Math.round(e.maxHp*SB_HP*grow); e.atk=Math.max(1,Math.round(e.atk*SB_ATK)); e.phase2=true; e.alt=true; e.fast=(e.fast||0)+1; e.abilT=2;
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
function spawnRoom(){
  if(S.run.tw) return spawnFloor();
  const r=S.run, di=r.di, room=r.room, boss=room===r.rooms-1;
  const lvl=r.trial?r.tlv+Math.floor(room/2)+(boss?2:0):(r.rift?riftLvl(r.rift):RK[di].lv)+Math.floor(room/2)+(boss?2:0)+curseRise(di);   // a Trial's foes stand at the level fixed for its week
  const list=[];
  const extra=hasRunMod('horde')?1:0, R0=Math.random;
  if(r.trial) Math.random=trialRng(r.tseed,room);   // a Trial: the same rooms and foes for every attempt this week (src/game-rival-trials.js)
  try{
    if(boss){ if(rivalHere(di)) rivalRoom(list,di,lvl); else { list.push(!r.trial&&secretRoll(di)?makeSecret(di,lvl):makeEnemy(di,lvl,true)); const adds=(di===0?2:3)+extra; for(let i=0;i<adds;i++) spawnOne(list,di,lvl-1); } }
    else{ const n=(room===0?2:room===1?3:3+Math.round(Math.random()))+extra; for(let i=0;i<n;i++) spawnOne(list,di,lvl); }
    foeScale(list,foeAtkMul(di)); bulwark(list); riftScale(list);
    { const f=foeHeat(); if(f!==1) for(const e of list){ if(e.rival) continue; e.maxHp=e.hp=Math.round(e.maxHp*f); e.atk=Math.max(1,Math.round(e.atk*f)); } }   // the rival keeps their own measure
    if(!boss&&r.roomKind==='elite') for(const e of list){ e.maxHp=e.hp=Math.round(e.maxHp*ELITE_ROOM); e.atk=Math.max(1,Math.round(e.atk*ELITE_ROOM)); }
    affixAll(list);
  } finally { Math.random=R0; }
  r.enemies=list; r.corpses=[]; r.events=[]; r.turn=1; r.fx={}; r.target=list[0].id; r.loot=[]; r.spoils=[]; r.lostLoot=[]; r.cmd={}; r.taunt=0; r.quiet=null;
  log(boss?(list[0].rival?list[0].name+' stands where the master should be, with their own dead around them.':list[0].secret?'The air turns wrong. This is not the master you came for.':'The air thickens. Something large waits ahead.'):(r.trial?'Trial, room ':'Room ')+(room+1)+' of '+r.rooms+(r.roomKind==='elite'?', behind the bloodied arch. These foes are stronger.':'.'));
  if(boss){ bossSpeaks(list[0],'hi'); fxe('boss',list[0]); }
  if(hasFlag('infernal')) infernalWard();
}
function startTower(f){
  f=+f; if(S.mode!=='town'||S.watches<=0||S.player.lvl<TW.unlock||!towerStarts().includes(f)) return;
  S.watches--; S.runs++; tally('twRuns'); S.notices=[];   // notes are about what happened since your last run
  S.run={tw:f,tw0:f,di:5,room:0,rooms:1,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[]};
  S.mode='battle'; titheSouls();
  log('You step into the Hell Tower.');
  spawnFloor();
}
function startRun(di){
  if(S.mode!=='town'||S.watches<=0||S.player.lvl<RK[di].unlock) return;
  S.watches--; S.runs++; S.notices=[];
  S.run={di,room:0,rooms:4,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:gateMod(di),heat:heatOf(di)};
  S.mode='battle'; titheSouls();
  log('You step through the '+DUNGEONS[di].name+' gate.'+(S.run.mod?' It is cursed today: '+MODS[S.run.mod].name+'.':''));
  spawnRoom();
}
const nameOf = u=>u.id==='p'?'You':(u.nick||u.name);
const allies = ()=>[S.player].concat(S.army);
const liveFoes = ()=>S.run.enemies.filter(e=>e.hp>0);
const fxKey=u=>u==null?null:typeof u==='string'?u:u.id!=null?u.id:u.uid!=null?'m'+u.uid:null;   // the key a unit's card answers to (data-u, r.fx): minions have no id, only a uid
function mark(u,d,h){ const id=fxKey(u); if(id==null) return; const f=S.run.fx[id]||(S.run.fx[id]={d:0,h:0}); f.d+=d; f.h+=h; }
function hit(b){ return Math.max(1,Math.round(b*rnd(.85,1.15))); }
function hurtFoe(e,d){ if(e.curse) d=Math.round(d*e.curse.mul); { const mk=masteryDmg(e.base); if(mk) d=Math.round(d*(1+mk/100)); }   /* bestiary mastery: every hit from you and your army, once */ if(e.stun>0&&hasMod('chill','b')) d=Math.round(d*1.25);
  if(e.shield>0){ const s=Math.min(e.shield,d); e.shield-=s; d-=s; if(d<=0){ mark(e,0,0); return; } }   // Bone Wall shield soaks damage first
  recBest('hit',d); d=Math.min(d,e.hp); e.hp-=d; mark(e,d,0); }
function hurtAlly(a,d){
  if(a.id!=='p'&&hasFlag('swarmguard')) d=Math.max(1,Math.round(d*.75));
  if(a.id!=='p'&&hasTrait(a,'stalwart')) d=Math.max(1,Math.round(d*.8));
  if(a.id==='p'&&xb('drp')) d=Math.max(1,Math.round(d*(1-xb('drp')/100)));
  if(a.id!=='p'&&hasMod('gravepact','b')) d=Math.max(1,Math.round(d*.9));
  if(a.id==='p'){ const s=Math.min(S.player.shield,d); S.player.shield-=s; d-=s; }
  d=Math.min(d,a.hp); a.hp-=d; if(d>0) mark(a,d,0); if(a.id==='p'&&d>0&&S.run) S.run.hurt=true; if(d>0&&a.hp<=0&&a.id!=='p') fxe('death',a);
}
function healAlly(a,h){
  if(a.id==='p'&&xb('healp')) h=Math.max(0,Math.round(h*(1+xb('healp')/100)));   // faith changes the healing you receive
  const max=a.id==='p'?pMax():a.maxHp; h=Math.min(h,max-a.hp); if(h<=0) return 0;
  a.hp+=h; mark(a,0,h); return h;
}
function killXp(e){ return Math.round((4+e.lvl*2.5)*RK[e.rankI].xp*(e.boss?2.5*(omen()==='ashfall'?OMEN_BOSS_XP:1):1)*(e.elite?1.5:1)*(e.tw?1+e.tw/12:1)*(e.secret?SB_REWARD:1)*(e.rival?RIVAL_GOLD:1)*ngpReward()*(runMod()?MOD_XP:1)*heatK('xp')*(1+xb('xpp')/100)*(e.living?SIEGE_XP:1)); }
function studyFoe(name){   // count a kill toward studying this kind of foe (its drop table opens in the bestiary)
  const n=S.kills[name]=(S.kills[name]||0)+1;
  if(n===KNOW_AT) notify('Bestiary: you have studied '+name+'. Its drop table is now known.','ok');
  for(const x of masteryRungs(name)) if(x.t.id!=='studied'&&n===x.at) notify('Mastery: '+name+' is now '+x.t.name+'. '+masteryGives(x.t)+'.','ok');
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
    e.dead=true; r.kills++; S.quest.kills++;
    if(e.boss||e.elite) gainSoul();
    if(e.boss) tally('bosses');
    if(e.elite) tally('elites');
    studyFoe(e.base);
    r.pending+=killXp(e); r.loot.push(...rollDrops(e)); killLoot(e,r);
    killPowers();
    if(!e.rival) r.corpses.push(corpseOf(e));   // the rival leaves no body: they retreat
    if(e.boss) bossSpeaks(e,'bye');
    log(e.rival?e.name+' is beaten.':e.name+' falls.'); sfx('kill'); fxe('death',e);
    const page=e.secret?'secret':e.boss?(e.tw?'warden':'boss'):e.elite?'elite':null;   // who may carry a torn page
    if(page&&!r.trial&&!e.rival) findPage(page,r);
    if(e.secret) slaySecret(e,r);
    if(e.rival) rivalBeaten(e,r);
    if(hasRunMod('volatile')) volatileBurst(e);
    if(hasAff(e,'splitting')) splitFoe(e);
  }
}
function currentTarget(){
  const r=S.run; let t=r.enemies.find(e=>e.id===r.target&&e.hp>0);
  if(!t){ t=liveFoes()[0]; r.target=t?t.id:null; }
  return t||null;
}
function setTarget(id){ const e=S.run&&S.run.enemies.find(x=>x.id===id); if(e&&e.hp>0) S.run.target=id; }

function act(kind){
  if(S.mode!=='battle') return;
  const r=S.run, P=S.player; r.fx={};
  const t=currentTarget(); if(!t) return;
  if(kind==='strike'){
    let d=hit(pAtk()*dmgMul()*(1+.1*sk('edge'))), crit=Math.random()<.1+G('crit')/100+(hasMod('edge','a')?.1:0); if(crit){ d=Math.round(d*1.8); tally('crits'); } if(hasFlag('execute')&&t.hp<t.maxHp*.35) d=Math.round(d*1.5);
    hurtFoe(t,d); P.mana=Math.min(pMana(),P.mana+3); if(hasMod('edge','b')) healAlly(P,Math.round(d*.1));
    log('You strike '+t.name+' for '+d+(crit?' (crit)':'')+'. +3 mana.'); fxe('strike',t,crit?{crit:1}:null);
    if(hasFlag('echo')&&t.hp>0&&Math.random()<.25){ const d2=hit(pAtk()*dmgMul()); hurtFoe(t,d2); log('Echo: the blade strikes again for '+d2+'.','ok'); }
    if(hasFlag('hellfire')){ for(const o of liveFoes()) if(o!==t) hurtFoe(o,Math.round(d*.4)); }
    else if(hasFlag('cleave')){ const o=liveFoes().filter(x=>x!==t); if(o.length) hurtFoe(pick(o),Math.round(d*.6)); }
  }else if(kind==='siphon'){
    if(P.mana<siphonCost()) return;
    P.mana-=siphonCost(); const low=t.hp<t.maxHp*SIPHON_LOW; let d=hit(pSiph()*pierceMul(SIPHON_PIERCE)); if(low) d*=2; hurtFoe(t,d);   // pierces a quarter of armor; devours the weak
    if(hasFlag('chorus')) for(const o of liveFoes()) if(o!==t) hurtFoe(o,Math.round(d*.5));
    const h=healAlly(P,Math.round(d*(hasFlag('lifedrain')?SIPHON_HEAL_LD:SIPHON_HEAL))); const got=gainSoul();
    log('Soul Siphon '+(low?'devours ':'drains ')+t.name+' for '+d+(h?', you recover '+h:'')+(got?' and harvest a Soul ('+S.run.souls+'/'+SOUL_MAX+')':'')+'.'); fxe('siphon',t);
  }else if(kind==='ward'){
    if(P.mana<6) return;
    P.mana-=6; const w=pWard(); P.shield=Math.min(Math.round(pMax()*.6),P.shield+w);
    mark('p',0,0); log('Bone Ward raised. You hold '+P.shield+' ward.'); fxe('ward',P);
  }else if(kind.startsWith('sk:')){ if(!useSkill(kind.slice(3),t)) return; }
  else if(kind==='ult'){ if(!useUlt(t)) return; }
  else if(kind.startsWith('pot:')){ if(!drink(kind.slice(4))) return; }
  else return;
  sfx(kind==='strike'?'strike':kind.startsWith('pot:')?'heal':'skill');
  checkDeaths();
  if(!liveFoes().length){ roomWon(); return; }
  // minions act
  for(const m of S.army){
    if(m.hp<=0) continue;
    if(!liveFoes().length) break;
    if(m.role==='mender'){
      const hurt=allies().filter(a=>a.hp>0&&a.hp<(a.id==='p'?pMax():a.maxHp)*.85).sort((a,b)=>a.hp/(a.id==='p'?pMax():a.maxHp)-b.hp/(b.id==='p'?pMax():b.maxHp))[0];
      if(hurt){ const h=healAlly(hurt,Math.round(m.atk*.9*rnd(.9,1.1))); log(m.nick+' mends '+(hurt.id==='p'?'you':hurt===m?'itself':nameOf(hurt))+' for '+h+'.','ok'); continue; }
    }
    let tg=currentTarget(); if(!tg) break;
    let d=hit(m.atk*dmgMul()*(r.frenzy>0?r.frenzyMul:1)*(m.role==='reaper'&&r.execute&&tg.hp<tg.maxHp*.4?2:1)*(hasTrait(m,'wrathful')&&m.hp<m.maxHp/2?1.4:1)); const crit=m.role==='striker'&&(r.focus||Math.random()<.25); if(crit){ d=Math.round(d*1.8); tally('crits'); }
    hurtFoe(tg,d); fxe('mhit',tg); let extra='';
    if(crit&&r.focus&&tg.charging&&tg.hp>0) breakCharge(tg,m.nick+'\'s focused strike breaks '+theName(tg.name)+'\'s focus.');
    if(hasTrait(m,'venom')&&tg.hp>0){ addDot(tg,'poison',m.atk*.15*pierceMul(.5),3); tally('poisoned'); extra+=' and poisons it'; }
    if(m.role==='reaper'){ const o=liveFoes().filter(x=>x!==tg); if(o.length){ const o2=pick(o); const d2=Math.round(d*.5); hurtFoe(o2,d2); extra=' and cleaves '+o2.name+' for '+d2; } }
    if(hasTrait(m,'frenzied')&&tg.hp>0&&Math.random()<.2){ const d3=hit(m.atk*dmgMul()*(r.frenzy>0?r.frenzyMul:1)); hurtFoe(tg,d3); d+=d3; extra+=', then strikes again for '+d3; }
    if(hasTrait(m,'leech')){ const h=healAlly(m,Math.round(d*.25)); if(h) extra+=' and drinks '+h+' HP'; }
    log(m.nick+' hits '+tg.name+' for '+d+(crit?' (crit)':'')+extra+'.');
    checkDeaths();
  }
  r.focus=false; r.execute=false;   // these orders last one minion phase
  if(!liveFoes().length){ roomWon(); return; }
  // foes act
  checkPhase();
  const hpBefore=P.hp;
  for(const e of liveFoes()){
    if(e.hp<=0) continue; let alive=allies().filter(a=>a.hp>0); if(!alive.length) break;
    if(r.taunt>0){ const v=alive.filter(a=>a.role==='vanguard'&&a.id!=='p'); if(v.length) alive=v; }   // Taunt
    if(e.stun>0){ e.stun--; if(e.charging) breakCharge(e,e.name+' is frozen. The frost breaks its focus and'); else log(e.name+' is frozen and cannot act.','ok'); continue; }
    if(e.abil&&bossTurn(e)){ if(P.hp<=0&&playerFalls()) return; checkDeaths(); continue; }
    if(e.role==='mender'){
      const hurt=liveFoes().filter(x=>x.hp<x.maxHp*.7).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
      if(hurt){ const h=Math.min(Math.round(e.atk*.9*(1-foeArmor())),hurt.maxHp-hurt.hp); /* scaled by armor like your damage, so menders can't stall a fight */ hurt.hp+=h; log(e.name+' mends '+hurt.name+'.'); continue; }
    }
    const weights=alive.map(a=>a.role==='vanguard'?5:2); let roll=Math.random()*weights.reduce((x,y)=>x+y,0), tg=alive[0];
    for(let i=0;i<alive.length;i++){ roll-=weights[i]; if(roll<=0){ tg=alive[i]; break; } }
    let d=hit(e.atk*enrage(e)*(hasAff(e,'enraged')&&e.hp<e.maxHp/2?1.6:1)); const crit=e.role==='striker'&&Math.random()<.25; if(crit) d=Math.round(d*1.8);
    hurtAlly(tg,d); fxe('hurt',tg,crit?{crit:1}:null); if(crit) addDot(tg,'bleed',e.atk*.3,2);   // a striker's crit opens a wound
    if(hasAff(e,'vampiric')){ const h=Math.min(e.maxHp-e.hp,Math.round(d*.4)); if(h>0){ e.hp+=h; mark(e,0,h); } }
    log(e.name+' hits '+(tg.id==='p'?'you':nameOf(tg))+' for '+d+(crit?' (crit'+(tg.hp>0&&tg.dots&&tg.dots.bleed?', bleeding':'')+')':'')+'.','bad');
    if(tg.id==='p'&&hasFlag('thorns')&&e.hp>0) hurtFoe(e,Math.max(1,Math.round(d*.2*(1-foeArmor()))));
    if(tg.hp<=0&&tg.id!=='p') log(tg.nick+' is down.','bad');
    if(P.hp<=0&&playerFalls()) return;
  }
  tickDots(); if(P.hp<=0&&playerFalls()) return;
  if(P.hp<hpBefore){ sfx('hurt'); if(hpBefore-P.hp>=pMax()*.2) ui.shake=true; }   // a heavy turn shakes the screen
  checkDeaths(); if(!liveFoes().length){ roomWon(); return; }
  r.turn++; if(!hasRunMod('drought')) P.mana=Math.min(pMana(),P.mana+1+G('regen')+sk('soulwell')+(hasMod('soulwell','a')?1:0)); skillTick();
  if(hasFlag('halo')) allies().forEach(a=>{ if(a.hp>0) healAlly(a,Math.round((a.id==='p'?pMax():a.maxHp)*.04)); });
  if(r.turn===9&&liveFoes().some(e=>e.tw&&e.boss)) log('Wrath: the warden is enraged and hits harder every turn.','bad');
}
function gateCleared(r){   // the boss room of a gate is won: story, clear tallies (titles, difficulty, curses) and the secret-master hint; returns the clear bonus XP
  const di=r.di, fk=runFarm(); unlockStory('g'+di,r); r.cleared=true; S.quest.clears++;   /* fk before the clear is marked: a first clear pays in full */
  S.ti=S.ti||{}; S.ti.clr=S.ti.clr||{}; S.ti.clr[di]=1; tally('clrN'+di);
  if(T_('clrN'+di)===SECRET_HINT&&secretHinted(di)) notify('A torn page in the Ledger: '+SECRET[di].hint,'');
  if(r.heat){
    S.heatMax=S.heatMax||{}; S.heatMax[di]=Math.max(S.heatMax[di]||0,r.heat); tally('heat'+r.heat); if(r.mod) tally('damned');
    if(r.heat===3){ tally('nm'+di); if(r.mod) tally('damned3'); }
  }
  if(r.mod){ tally('cur_'+r.mod); tally('cursed'); }
  if(!r.hurt) tally('flawless');
  return Math.round(RK[di].clear*fk);
}
function roomWon(){
  const r=S.run, P=S.player; r.events=[];
  let xp=r.pending; r.pending=0;
  const last=r.room===r.rooms-1;
  const share=Math.round(xp*.5), shatter=hasFlag('bonebank')?0:Math.max(5,25-A('will')*1.5);
  for(const m of S.army.slice()){
    if(m.thrall) continue;   /* a siege thrall earns nothing and is gone at dawn */
    if(m.hp<=0) r.downs=(r.downs||0)+1;   /* downed this room: a Trial's score counts them */
    if(m.hp>0){ if(minionXp(m,share)) r.events.push({m:m.nick+' reaches level '+m.lvl+'.',c:'ok'}); }
    else if(!r.siege&&!hasTrait(m,'gravebound')&&Math.random()*100<shatter){   /* home ground: nothing shatters in a siege */ returnGear(m); S.army=S.army.filter(x=>x!==m); r.events.push({m:m.nick+', '+theName(mName(m))+', shattered and is gone.',c:'bad'}); memorialize(m,r.tw?{f:r.tw}:r.rift?{rd:r.rift}:{g:r.di}); }
    else{ m.hp=Math.ceil(m.maxHp*.4); r.events.push({m:m.nick+' was downed but binds back together.',c:''}); }
  }
  if(r.tw){
    const f=r.tw; S.tower.best=Math.max(S.tower.best,f); recBest('floor',f); for(const k of [10,25,40,50,60,75,90,100]) if(S.tower.best>=k) unlockStory('t'+k,r);
    if(f%10===0){ xp+=120*f; S.quest.clears++; towerBossLoot(f,r); }
    if(f===100) r.cleared=true;   // floor 100 ends the first climb; floor 101 onward is the endless abyss
  } else if(last){ xp+=r.siege?siegeWon(r):r.rift?riftCleared(r):r.trial?trialCleared(r):gateCleared(r); if(!r.siege&&!r.rift&&!r.trial) rivalMeet(r); }
  if(r.trial){ r.loot=[]; r.gold=0; r.troph={}; r.corpses=[]; }   /* a Trial pays only its first completion each week: no gear, gold, trophies or bodies */
  for(const id of r.loot){ const it=addItem(id); if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } else r.lostLoot.push(ITEM[id].name); } r.loot=[];
  bankLoot(r); r.won=(r.won||0)+1; S.quest.rooms=(S.quest.rooms||0)+1; tally('rooms'); if(r.tw) tally('floors'); if(P.hp>0&&P.hp<=pMax()*.1) tally('lastBreath');
  r.event=(!r.tw&&!r.siege&&!r.trial&&!last&&Math.random()<EVENT_CHANCE)?rollEvent():null;   // something waits between rooms
  r.doors=(!r.tw&&!r.siege&&!r.trial&&!last)?rollDoors(r):null;   // which way next
  r.gained+=xp; r.lastXp=xp;
  r.ups+=addXp(xp);
  if(r.siege&&!last){ nextWave(); return; }   // a siege goes straight on to its next wave
  rivalTheft(r); S.mode='raise';
}
function defeat(){
  sfx('death');
  const r=S.run; if(r.siege){ r.pending=0; r.loot=[]; S.mode='defeat'; S.army.forEach(m=>{ if(m.hp<=0) m.hp=Math.ceil(m.maxHp*.4); }); siegeLost(false); return; }   // a lost siege costs no XP; the town pays instead
  S.ti=S.ti||{}; S.ti.deaths=(S.ti.deaths||0)+1; r.pending=0; r.gold=0; r.troph={}; S.mode='defeat'; S.player.xp=Math.max(0,S.player.xp-Math.round(need(S.player.lvl)*DIFF.deathXp));
  S.army.forEach(m=>{ if(m.hp<=0) m.hp=Math.ceil(m.maxHp*.4); });
  if(rivalStanding(r)) rivalLost(r);
  notify('You were dragged out of '+(r.tw?'the Hell Tower on floor '+r.tw:'the '+DUNGEONS[r.di].name)+'. That room\'s spoils are lost, and you lose '+Math.round(DIFF.deathXp*100)+'% of a level in XP.','bad');
}
function descend(kind){   // go on: through one of the doors in the gates (the first door by default), or up a floor in the Tower
  if(S.mode!=='raise'||S.run.cleared) return false;
  const r=S.run, P=S.player;
  if(r.doors){ if(kind==null) kind=r.doors[0]; if(!r.doors.includes(kind)) return false; } else kind='fight';
  P.hp=Math.min(pMax(),P.hp+Math.round(pMax()*DIFF.heal)); P.mana=Math.min(pMana(),P.mana+Math.round(pMana()*DIFF.mana)); P.shield=0;
  S.army.forEach(m=>m.hp=Math.min(m.maxHp,m.hp+Math.round(m.maxHp*DIFF.mheal)));
  r.cd={}; r.frenzy=0; r.silence=0; r.event=null; allies().forEach(clearDots); if(r.tw) r.tw++; r.room++; r.roomKind=kind; r.doors=null; if(kind==='elite') tally('archs');
  if(kind==='rest'||kind==='treasure'){ quietRoom(kind); return true; }
  S.mode='battle'; spawnRoom(); return true;
}
function returnTown(){
  if(S.run&&S.run.siege){ siegeEnd(); save(); return; }   // back from the walls: then dawn
  const P=S.player;
  if(S.run){ recordRun(S,S.run,runResult(S.run)); recRun(S.run); }
  P.hp=pMax(); P.mana=pMana(); P.shield=0; allies().forEach(clearDots); S.army.forEach(m=>m.hp=m.maxHp);
  S.run=null; S.mode='town';
  if(S.watches<=0) endDay();
  save();
}
function flee(){ if(S.mode!=='battle') return; if(S.run.siege){ S.run.fled=true; S.run.pending=0; S.run.loot=[]; S.army.forEach(m=>{ if(m.hp<=0) m.hp=Math.ceil(m.maxHp*.4); }); siegeLost(true); S.mode='defeat'; return; }   /* fleeing a siege counts as a defeat */
  S.run.fled=true; if(rivalStanding(S.run)) rivalLost(S.run); notify('You fled the gate and left the room\'s spoils behind.','bad'); returnTown(); }


// ----- items: bag and equipment
function addItem(id,ro){ if(S.inv.length>=bagMax()&&!ITEM[id].uq) return null; const it={u:++S.uid,id}; const r=ro===undefined?rollItem(id):ro; if(r&&r.length) it.ro=r; S.inv.push(it); return it; }
const findItem=u=>{ const i=S.inv.find(x=>x.u===u); if(i) return i; for(const sl of GEAR_SLOTS) if(S.equip[sl]&&S.equip[sl].u===u) return S.equip[sl]; return null; };
const reforgeCost=it=>Math.round(buyPrice(ITEM[it.id])*REFORGE_COST*(1-B_FORGE*bl('forge')));
function reforge(u){   // re-roll a piece's bonus lines for gold; always leaves at least one line
  const it=findItem(u); if(!it||S.mode!=='town') return false; const d=ITEM[it.id]; if(d.uq) return false;
  const c=reforgeCost(it); if(S.gold<c) return false;
  S.gold-=c; vitals(()=>{ it.ro=rollItem(it.id,true)||undefined; if(!it.ro) delete it.ro; }); tally('reforged'); sfx('level'); return true;
}
function vitals(fn){ const a=pMax(), b=pMana(); fn(); const P=S.player, a2=pMax(), b2=pMana(); P.hp=Math.min(a2,P.hp+Math.max(0,a2-a)); P.mana=Math.min(b2,P.mana+Math.max(0,b2-b)); syncArmy(); }
function equip(u){
  if(S.mode==='battle') return;
  const i=S.inv.findIndex(x=>x.u===u); if(i<0) return;
  vitals(()=>{ const it=S.inv[i], sl=ITEM[it.id].slot, old=S.equip[sl]; S.inv.splice(i,1); if(old) S.inv.push(old); S.equip[sl]=it; });
}
function unequip(sl){ if(S.mode==='battle'||!S.equip[sl]) return; vitals(()=>{ S.inv.push(S.equip[sl]); S.equip[sl]=null; }); }
function discard(u){ S.inv=S.inv.filter(x=>x.u!==u||x.lk); }

// ----- raising
// The first raise of a save always answers (a new necromancer alone in room 1 failed ~44% of the time at ~34% a body). New Game+ keeps
// its lifetime raise count, so it does not get this again.
const firstRaise=()=>!!(S&&S.firstRaise)&&!T_('raised');
function raiseChance(c){
  if(firstRaise()) return 100;
  let ch=RAISE_BASE+A('will')*RAISE_WILL+G('raise')+(skMod('thrift')==='b'?3:0)+4*sk('mastery')+(hasMod('mastery','a')?6:0)+B_OSS*bl('ossuary')+(omen()==='paletide'?OMEN_RAISE:0)+(S.player.lvl-c.lvl)*3-RK[c.rankI].pen;
  if(c.elite) ch-=10; if(c.boss) ch-=15; if(c.free) ch+=STRAGGLER_BONUS; ch+=masteryRaise(c.base);
  return clamp(Math.round(ch),RAISE_MIN,RAISE_MAX);
}
const raiseCost = c=>c.free?0:Math.ceil((8+c.rankI*3+(c.boss?4:0))*(hasFlag('cheapraise')?.5:1)*(hasMod('mastery','b')?.75:1)*(1-.06*sk('thrift')-(skMod('thrift')==='a'?.1:0)));
function freeNick(){ const used=S.army.concat(benched(),...(S.raids||[]).map(x=>x.units)).map(m=>m.nick); const f=NICKS.filter(n=>!used.includes(n)); return f.length?pick(f):pick(NICKS)+' II'; }
const SALT_BONUS=20, SALT_MAX=3, saltPrice=()=>10+S.player.lvl*3;   // Grave Salts: bought at the market, +20% on one raise
const RAISE_BASE=25, RAISE_WILL=1.8, RAISE_MIN=1, RAISE_MAX=85, SALT_CAP=95;   // salts may still reach 95%
const saltChance=c=>firstRaise()?100:clamp(raiseChance(c)+SALT_BONUS,RAISE_MIN,SALT_CAP);
function tryRaise(id,salt,bench){   // bench: raise to the Reserve, only when the army is full and the Reserve has room
  if(S.mode!=='raise') return;
  const r=S.run, P=S.player, c=r.corpses.find(x=>x.id===id); if(!c||c.tried) return;
  r.events=[];
  const toRes=!!bench&&armyUsed()>=slots()&&reserveRoom();
  if(armyUsed()>=slots()&&!toRes){ r.events.push({m:'Your army is full. Release someone first.',c:'bad'}); return; }
  const cost=raiseCost(c);
  if(P.mana<cost){ r.events.push({m:'Not enough mana. You need '+cost+'.',c:'bad'}); return; }
  const salted=!!(salt&&S.salts>0);
  P.mana-=cost; c.tried=true; if(salted) S.salts--;
  if(Math.random()*100<(salted?saltChance(c):raiseChance(c))){
    const m={uid:++S.uid,armed:!!c.armed,eq:c.armed?{weapon:null,armor:null,relic:null}:null,nick:freeNick(),name:c.name,kind:c.base,role:c.role,rankI:c.rankI,lvl:c.lvl,xp:0,boss:c.boss,elite:c.elite,hf:c.hf,af:c.af,tw:c.tw,hp:1,maxHp:null,atk:0};
    if(hasFlag('bindsouls')) m.lvl=Math.min(S.player.lvl+2,m.lvl+2);
    { const ml=masteryLv(c.base); if(ml) m.lvl=Math.max(m.lvl,Math.min(S.player.lvl+2,m.lvl+ml)); }   // a Ledgered kind rises higher, never past your level + 2
    m.lvl0=m.lvl; m.stage=0; m.traits=[rollTrait([])]; if(c.boss) m.traits.push(rollTrait(m.traits));   // bosses rise with two traits
    if(c.aff&&c.aff.length){ const t=AFFIX[pick(c.aff)].trait; if(!m.traits.includes(t)) m.traits.push(t); }   // an elite keeps one of its affixes
    if(rollCommand(m)) tally('commanders');
    syncMinion(m); m.hp=m.maxHp; if(toRes){ S.reserve.push(m); c.res=1; } else S.army.push(m); r.raised++; S.firstRaise=0; S.ti=S.ti||{}; S.ti.raised=(S.ti.raised||0)+1; if(m.armed) S.ti.armed=(S.ti.armed||0)+1;
    if(c.free) tally('straggler'); if(c.boss) tally('raisedBoss'); c.result='raised'; if(c.boss||c.elite) moment(m.nick+' rises: '+(c.boss?'a boss':'an elite')+' serves you','ok'); c.minion=m.nick+' ('+m.traits.map(t=>TRAITS[t].name).join(', ')+')'; sfx('raise'); fxe('raise',c);
  }else{ c.result='failed'; sfx('fail'); fxe('rfail',c); }
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
  if(S.reserve) S.reserve=S.reserve.filter(m=>m.uid!==uid); if(S.waiting) S.waiting=S.waiting.filter(m=>m.uid!==uid); }
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

