// ===== THE NECROPOLIS GROWS (R5 PR A) =====
// Buildings go to BUILD_MAX (5) levels; levels 4-5 need the Throne of Ash cleared. At levels 3 and 5 each building offers a
// specialization (S.spec[k][3|5] = 'a'|'b'), final for this cycle. Seven new buildings open as the town grows (BUILD[k].open):
// the Charnel Yard trains the Reserve at dawn, the Library speeds study and sells a stat respec, the Embalmery keeps bodies
// out of the gate to raise in town, the Bell Tower warns of sieges earlier, the Apothecary cheapens potions and brewing,
// the War Room strengthens raids, the Temple deepens your oath. Every new building has a siege perk.
const B4_LOCK=3;   // levels past this need the Throne of Ash
const YARD_XP=.04, YARD_GAP=2, YARD_SELL=150, LIB_STUDY=20, RESPEC_GOLD=500, RESPEC_DUST=20, RESPEC_DAYS=7;
const EMB_DAYS=3, EMB_RAISE=5, APO_POT=.1, APO_BREW=.1, WAR_ODDS=.02, TEMPLE_DEV=.1, TEMPLE_BUFF=.25;
const SIEGE_BELL=.03, SIEGE_LIB=.03, SIEGE_APO=.04, SIEGE_WAR=.04, SIEGE_YARD=.05;
Object.assign(BUILD,{
  yard:  {name:'Charnel Yard', open:()=>townOpen(), desc:'Each dawn your Reserve minions train: '+b100(YARD_XP)+'% of a level per Yard level, never past your army\'s highest level -'+YARD_GAP+'.', now:n=>'the Reserve gains '+b100(YARD_XP*n)+'% of a level each dawn'},
  library:{name:'Library',     open:()=>clearsN()>=3, desc:'Every kill has a '+LIB_STUDY+'% chance per level to count twice toward studying and mastering its kind. From level 2 you can buy a stat respec.', now:n=>LIB_STUDY*n+'% of kills count twice for study'+(n>=2?', stat respec':'')},
  embalm:{name:'Embalmery',    open:()=>clearsN()>=4, desc:'Keep one untried body from each gate run and raise it in town later, +'+EMB_RAISE+'% raise chance per level. Bodies keep for '+EMB_DAYS+' days and a day more per level.', now:n=>'keeps a body '+embDays(n)+' days, +'+EMB_RAISE*n+'% to raise it'},
  bell:  {name:'Bell Tower',   open:()=>T_('siegeWarned')>0, desc:'The siege warning comes one dawn earlier for every two levels.', now:n=>'sieges warned '+(1+Math.floor(n/2))+' dawn'+(Math.floor(n/2)?'s':'')+' ahead'},
  apoth: {name:'Apothecary',   open:()=>blRaw('forge')>=2, desc:'Potions cost '+b100(APO_POT)+'% less and brewing '+b100(APO_BREW)+'% less gold per level. At level 3 the belt holds one more of each.', now:n=>'potions '+b100(APO_POT*n)+'% and brewing '+b100(APO_BREW*n)+'% cheaper'+(n>=3?', one more on the belt':'')},
  war:   {name:'War Room',     open:()=>T_('raidsSent')>0, desc:'A Commander leads one more follower at levels 1, 3 and 5, and raids are '+b100(WAR_ODDS)+'% likelier to win per level.', now:n=>'+'+warSquad(n)+' squad, raids +'+b100(WAR_ODDS*n)+'%'},
  temple:{name:'Temple',       open:()=>!!faithOf(), desc:'Devotion grows '+b100(TEMPLE_DEV)+'% faster per level. At level 3 your oath\'s gifts are '+b100(TEMPLE_BUFF)+'% stronger and your god\'s chapel opens; at level 5 you can call a new omen once a week, today\'s or, through your god, tomorrow\'s.', now:n=>'devotion '+b100(TEMPLE_DEV*n)+'% faster'+(n>=3?', gifts +'+b100(TEMPLE_BUFF)+'%':'')+(n>=5?', a weekly omen':'')}
});
const clearsN=()=>Object.keys((S.ti&&S.ti.clr)||{}).filter(k=>S.ti.clr[k]).length;
const bOpen=k=>!!BUILD[k]&&(!BUILD[k].open||blRaw(k)>0||BUILD[k].open());
const embDays=n=>iceHouse()?1e6:EMB_DAYS+n+(hasSpec('embalm',3,'a')?3:0);   /* Vesh's Ice House: never */
const warSquad=n=>(n>=1?1:0)+(n>=3?1:0)+(n>=5?1:0);
const buildReady=k=>blRaw(k)<B4_LOCK||throneDown();   // levels 4 and 5 wait for the Throne
// ----- specializations
const SPEC={
  crypt:  {3:[['Ossuary Halls','The Reserve holds 4 more.'],['War Crypt','Your minions have +5% max HP.']],5:[['Catacombs','The Charnel Yard trains twice as fast.'],['Throne Crypt','+1 army slot, and the slot cap rises by one.']]},
  forge:  {3:[['Smithy','Trophy forging makes a masterwork 10% more often, and the Tower forge an extra line.'],['Bonewright','Tempering costs 25% less gold.']],5:[['Great Forge','Heart-forging costs 25% less gold and bone dust.'],['Tempering Pit','Each temper moves a line twice as far toward its best.']]},
  ossuary:{3:[['Charnel Rites','Elites raise 10% more easily.'],['Soul Well','Each gate run starts with a Soul.']],5:[['Grave Lord\'s Seat','Bosses raise 10% more easily.'],['Deep Ossuary','+5% chance on every raise.']]},
  altar:  {3:[['Blood Altar','Your skills cost 5% less mana.'],['Bone Altar','The Bone Altar costs 25% less.']],5:[['Black Altar','+10% max mana.'],['Grave Altar','A Soul each time a boss falls.']]},
  yard:   {3:[['Drill Yard','The Yard trains 50% faster.'],['Bone Pits','The Yard trains up to your army\'s highest level.']],5:[['Yard of Heroes','The Yard also trains the three weakest minions of your army.'],['Grave Market','Sell a Reserve minion for gold.']]},
  library:{3:[['Reading Room','+1 stat point.'],['Archive','Study counts twice 50% more often.']],5:[['Forbidden Stacks','+1 skill point.'],['Grand Archive','Kinds you have Ledgered take 5% more damage from your side.']]},
  embalm: {3:[['Preservers','Bodies keep three days longer.'],['Body Thieves','Keep one more body from each run.']],5:[['Grand Embalmery','Kept bodies raise 15% more easily.'],['Grave Garden','A kept body rises three levels higher, never past your level + 2.']]},
  bell:   {3:[['Watchtower','Attackers strike 5% softer.'],['Belfry','Sieges pay 20% more.']],5:[['Toll of the Dead','A siege won pays twice the bone dust and calms the town twice as much.'],['Iron Bells','The Inquisitor Captain has 15% less HP.']]},
  apoth:  {3:[['Distillery','Each brew makes two.'],['Censer House','Incense gives twice the raise chance.']],5:[['Alchemist','Your first brew each day costs no gold.'],['Plague Kitchen','A Healing Draught also mends your minions for 15%.']]},
  war:    {3:[['Map Table','Won raids bring back 25% more gold.'],['Quartermaster','War banners cost no gold to brew.']],5:[['Generals\' Hall','Raids are another 5% likelier to win.'],['Spy Network','The rival comes to steal half as often.']]}
};
const hasSpec=(k,lv,c)=>!!(S&&S.spec&&S.spec[k]&&S.spec[k][lv]===c&&blRaw(k)>=lv&&bl(k)>=lv);
const specPend=k=>SPEC[k]?[3,5].filter(lv=>blRaw(k)>=lv&&!(S.spec&&S.spec[k]&&S.spec[k][lv])):[];
const specName=(k,lv,c)=>SPEC[k]&&SPEC[k][lv]?SPEC[k][lv][c==='a'?0:1][0]:'';
function chooseSpec(k,lv,c){
  if(S.mode!=='town'||!SPEC[k]||!SPEC[k][lv]||(c!=='a'&&c!=='b')||!specPend(k).includes(lv)) return false;
  S.spec=S.spec||{}; S.spec[k]=Object.assign({},S.spec[k],{[lv]:c}); tally('specs');
  if(k==='library'&&lv===3&&c==='a') S.player.pts++; if(k==='library'&&lv===5&&c==='a') S.player.sp=(S.player.sp||0)+1;   /* one-time gifts */
  syncArmy(); sfx('level'); return true;
}
// ----- the hooks: small numbers other systems read
const cryptSlot=()=>hasSpec('crypt',5,'b')?1:0;   // slots, the slot cap
const reserveSpec=()=>hasSpec('crypt',3,'a')?4:0;   // reserveMax
const townHpK=m=>(hasSpec('crypt',3,'b')?1.05:1)*(S.run&&S.run.siege&&m.wall?1+SIEGE_YARD*sbl('yard'):1);   // extraMul (HP)
const smithK=()=>hasSpec('forge',3,'a')?.1:0;   // forgeGear, forgeTower
const temperK=()=>hasSpec('forge',3,'b')?.75:1;   // temperCost
const temperStep=()=>hasSpec('forge',5,'b')?2:1;   // temperTo
const hfTownK=()=>hasSpec('forge',5,'a')?.75:1;   // hfInfo
function townRaise(c){ let n=0; if(c.elite&&hasSpec('ossuary',3,'a')) n+=10; if(c.boss&&hasSpec('ossuary',5,'a')) n+=10; if(hasSpec('ossuary',5,'b')) n+=5; n+=cleanRaise(); if(EMB_RAISING) n+=EMB_RAISE*bl('embalm')+(hasSpec('embalm',5,'a')?15:0); return n; }   // raiseChance
const skillK=()=>hasSpec('altar',3,'a')?.95:1;   // skCost
const empowerK=()=>hasSpec('altar',3,'b')?.75:1;   // empowerCost
const manaK=()=>hasSpec('altar',5,'a')?1.1:1;   // pMana
function townStart(r){ if(hasSpec('ossuary',3,'b')&&!PREP_SKIP&&gainSoul()) log('The Soul Well gives you a Soul for the road.','ok'); }   // startRun
function townKill(e){ if(e.boss&&hasSpec('altar',5,'b')&&S.run&&!S.run.siege) gainSoul(); }   // killLoot
const libStudy=()=>LIB_STUDY*bl('library')*(hasSpec('library',3,'b')?1.5:1);   // study, in percent
const archiveK=e=>hasSpec('library',5,'b')&&masteryOf(e.base)&&masteryOf(e.base).id==='ledgered'?1.05:1;   // hurtFoe
const bellAhead=()=>Math.floor(bl('bell')/2);   // siegeTick
const apoPotK=()=>1-APO_POT*bl('apoth');   // potion prices
const apoBrewK=()=>1-APO_BREW*bl('apoth');   // brewGold
const apoBelt=()=>bl('apoth')>=3?1:0;   // beltMax
const brewTwice=()=>hasSpec('apoth',3,'a');
const censerK=()=>hasSpec('apoth',3,'b')?2:1;   // incRaise
const freeBrew=()=>hasSpec('apoth',5,'a')&&S.freeBrew!==S.day;
const kitchenHeal=()=>hasSpec('apoth',5,'b');   // drink('hp')
const warSquadN=()=>warSquad(bl('war'));   // squadMax
const warOdds=()=>WAR_ODDS*bl('war')+(hasSpec('war',5,'a')?.05:0);   // raidOdds
const warGold=()=>hasSpec('war',3,'a')?1.25:1;   // resolveRaid
const bannerFree=()=>hasSpec('war',3,'b');   // brewGold for banners
const spyK=()=>hasSpec('war',5,'b')?2:1;   // theftGap
const templeDev=()=>1+TEMPLE_DEV*bl('temple');   // devotion
const templeBuff=()=>bl('temple')>=3?1+TEMPLE_BUFF:1;   // faithBuff
// ----- sieges: the new buildings' perks
Object.assign(SIEGE_PERK,{
  yard:   {t:n=>'Reserve minions on the wall have +'+b100(SIEGE_YARD*n)+'% max HP', d:'Reserve minions on the wall have +'+b100(SIEGE_YARD)+'% max HP per level.'},
  library:{t:n=>'the Inquisitor Captain has '+b100(SIEGE_LIB*n)+'% less HP', d:'The Inquisitor Captain has '+b100(SIEGE_LIB)+'% less HP per level.'},
  embalm: {t:()=>'one fallen attacker is kept as a body when the siege is won', d:'When a siege is won, one fallen attacker is kept in the Embalmery, if there is room.'},
  bell:   {t:n=>'attackers have '+b100(SIEGE_BELL*n)+'% less HP', d:'Attackers have '+b100(SIEGE_BELL)+'% less HP per level.'},
  apoth:  {t:n=>'waves 2 and 3 mend you for '+b100(SIEGE_APO*n)+'% of max HP', d:'Waves 2 and 3 mend you for '+b100(SIEGE_APO)+'% of your max HP per level.'},
  war:    {t:n=>'sieges pay '+b100(SIEGE_WAR*n)+'% more gold', d:'Sieges pay '+b100(SIEGE_WAR)+'% more gold per level.'}
});
function townSiegeWave(list,r){   // spawnSiege, after scaling
  const hpK=(1-SIEGE_BELL*sbl('bell')), atkK=hasSpec('bell',3,'a')?.95:1;
  dreadWave(list,r); for(const e of list){ let k=hpK; if(e.boss) k*=(1-SIEGE_LIB*sbl('library'))*(hasSpec('bell',5,'b')?.85:1); if(k!==1){ e.maxHp=e.hp=Math.max(1,Math.round(e.maxHp*k)); } if(atkK!==1) e.atk=Math.max(1,Math.round(e.atk*atkK)); }
  bellDefense(list,r); worksWave(list,r); godSiegeWave(list,r);   /* siege works (game-siege2.js) */ if(r.room&&sbl('apoth')){ const P=S.player, h=healAlly(P,Math.round(pMax()*SIEGE_APO*sbl('apoth'))); if(h) log('The Apothecary\'s salves: +'+h+' HP.','ok'); }
}
const siegePayK=()=>(1+SIEGE_WAR*sbl('war'))*(hasSpec('bell',3,'b')?1.2:1)*dreadPayK()*godPayK();   // siegeGoldPay (the Choir: game-pantheon.js)
const siegeDustK=()=>hasSpec('bell',5,'a')?2:1;   // siegeWon
function townSiegeWon(r){ dread(-DREAD_SIEGE_WON*tollK()); if(!sbl('embalm')||!r.fallen||!r.fallen.length) return; const c=pick(r.fallen.concat(r.corpses||[]).filter(x=>x&&!x.boss)); if(c&&embKeep(c,true)) r.events.push({m:'The Embalmery takes in '+withArticle(c.base||c.name)+' from the walls.',c:'ok'}); }
// ----- the Charnel Yard: dawn training
function yardDawn(){
  const n=bl('yard'); if(!n) return 0; const top=Math.max(0,...S.army.map(m=>m.lvl)); if(!top) return 0;
  const k=YARD_XP*n*(hasSpec('yard',3,'a')?1.5:1)*(hasSpec('crypt',5,'a')?2:1), cap=top-(hasSpec('yard',3,'b')?0:YARD_GAP);
  const pupils=(S.reserve||[]).slice(); if(hasSpec('yard',5,'a')) pupils.push(...S.army.filter(m=>!m.wall&&!m.thrall).sort((a,b)=>a.lvl-b.lvl).slice(0,3));
  let ups=0; for(const m of pupils){ const c=S.army.includes(m)?top-YARD_GAP:cap; let gain=Math.round(mneed(m.lvl)*k);
    while(gain>0&&m.lvl<c&&m.lvl<S.player.lvl+2){ const step=Math.min(gain,Math.max(1,mneed(m.lvl)-m.xp)); gain-=step; ups+=minionXp(m,step); } }
  if(ups) tally('yardUps',ups); return ups;
}
function yardSell(uid){ if(S.mode!=='town'||!hasSpec('yard',5,'b')) return 0; const m=(S.reserve||[]).find(x=>x.uid===uid); if(!m||m.lk) return 0; const g=yardPrice(m); returnGear(m); S.reserve=S.reserve.filter(x=>x!==m); bondsClean(); S.gold+=g; tally('yardSold'); sfx('coin'); return g; }
const yardPrice=m=>YARD_SELL*m.lvl*(1+(m.stage||0))*(m.boss?3:m.elite?1.5:1);
// ----- the Library: a stat respec
const respecCost=()=>!T_('respecs')?{g:0,d:0}:{g:RESPEC_GOLD*S.player.lvl,d:RESPEC_DUST};
const respecReady=()=>bl('library')>=2&&S.mode==='town'&&!(S.respecDay&&S.day-S.respecDay<RESPEC_DAYS);
function respec(){
  if(!respecReady()) return false; const c=respecCost(), P=S.player; if(S.gold<c.g||(S.dust||0)<c.d) return false;
  const base=freshState().player.stats; let back=0; for(const k in P.stats){ const b=base[k]||0; if(P.stats[k]>b){ back+=P.stats[k]-b; } }
  if(!back) return false; S.gold-=c.g; S.dust=(S.dust||0)-c.d;
  vitals(()=>{ for(const k in P.stats) P.stats[k]=Math.min(P.stats[k],base[k]||0); P.pts+=back; }); S.respecDay=S.day; tally('respecs'); syncArmy(); sfx('level'); return back;
}
// ----- the Embalmery: bodies kept out of the gate
let EMB_RAISING=false;
const embCap=()=>bl('embalm')?1+(hasSpec('embalm',3,'b')?1:0):0;   // per run
const embHold=()=>bl('embalm')?2+bl('embalm'):0;   // how many it holds at once
function embKeep(c,siege){
  if(!bl('embalm')||!c||(S.embalm||[]).length>=embHold()) return false;
  if(!siege){ const r=S.run; if(S.mode!=='raise'||!r||c.tried||soulBound(c)||(r.kept||0)>=embCap()) return false; r.kept=(r.kept||0)+1; c.tried=true; c.result='kept'; }
  const b={}; for(const k of ['name','base','role','rankI','lvl','boss','elite','hf','af','tw','cd','armed','aff']) if(c[k]!=null) b[k]=c[k];
  S.embalm=(S.embalm||[]).concat([{c:b,day:S.day}]); tally('embalmed'); return true;
}
const embCan=c=>!!(bl('embalm')&&S.mode==='raise'&&S.run&&c&&!c.tried&&!soulBound(c)&&(S.run.kept||0)<embCap()&&(S.embalm||[]).length<embHold());
const embKeepId=id=>{ const r=S.run, c=r&&r.corpses.find(x=>x.id===id); return embKeep(c); };
function embDawn(){ if(!S.embalm||!S.embalm.length) return; const n=Math.max(1,bl('embalm')), keep=S.embalm.filter(x=>S.day-x.day<embDays(n)); const lost=S.embalm.length-keep.length; S.embalm=keep; if(lost) notify(lost+' kept bod'+(lost>1?'ies':'y')+' in the Embalmery spoiled.','bad'); }
function embRaise(i){   // raise a kept body in town: the usual raise, with the Embalmery's bonus
  const x=(S.embalm||[])[i]; if(!x||S.mode!=='town'||!bl('embalm')) return null;
  const c=Object.assign({id:'emb'+i,tried:false},x.c); if(hasSpec('embalm',5,'b')) c.lvl=Math.min(S.player.lvl+2,c.lvl+3);
  const run0=S.run, mode0=S.mode, mana=S.player.mana; S.run={corpses:[c],events:[],raised:0,di:0,enemies:[],log:[]}; S.mode='raise'; EMB_RAISING=true; let res;
  try{ S.player.mana=Math.max(mana,raiseCost(c)); tryRaise(c.id,false,true); if(!c.tried) res=null; else res={ok:c.result==='raised',m:(S.run.events[0]||{}).m||null,minion:c.minion}; } finally{ EMB_RAISING=false; S.run=run0; S.mode=mode0; S.player.mana=mana; }
  if(c.tried){ S.embalm.splice(i,1); tally('embRaised'); } return res;
}
// ----- the Temple: a weekly omen
const omenReady=()=>bl('temple')>=5&&S.mode==='town'&&!(S.omenCall&&S.day-S.omenCall<7);
function callOmen(){ if(!omenReady()) return false; const cur=dayOmen().id, ids=OMEN_NAT.filter(k=>k!==cur); S.omen={day:S.day,id:pick(ids)}; S.omenCall=S.day; tally('omensCalled'); sfx('skill'); return S.omen.id; }
// ----- save
function townFix(g){
  if(g.build) for(const k of Object.keys(g.build)) g.build[k]=Math.min(BUILD_MAX,g.build[k]);
  const sp={}; if(g.spec&&typeof g.spec==='object') for(const k in g.spec){ if(!SPEC[k]||!g.spec[k]) continue; for(const lv of [3,5]){ const c=g.spec[k][lv]; if((c==='a'||c==='b')&&((g.build&&g.build[k])||0)>=lv){ sp[k]=sp[k]||{}; sp[k][lv]=c; } } } g.spec=sp;
  g.embalm=Array.isArray(g.embalm)?g.embalm.filter(x=>x&&x.c&&typeof x.c.name==='string'&&isFinite(x.day)&&RK[x.c.rankI]).slice(0,8).map(x=>({c:Object.assign({},x.c,{lvl:Math.max(1,Math.floor(+x.c.lvl||1))}),day:Math.floor(x.day)})):[];
  for(const k of ['respecDay','omenCall','freeBrew']) if(g[k]!=null&&!isFinite(g[k])) delete g[k];
}
