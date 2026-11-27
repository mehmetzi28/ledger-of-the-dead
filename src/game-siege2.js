// ===== R14 PR A: SIEGES 2.0, THE INQUISITION ESCALATES =====
// Five siege tiers. Two sieges held in a row raise the tier by one, a lost one lowers it by one; the town's dread shifts the tier a
// siege is fought at (Calm -1, Terror +1). Each tier brings new kinds of the living (with R1 kits), a rule and better pay. On the
// night you pick the wall you hold (S.siege.road): the North road (more foes, the Bell Tower's defenses twice, +25% pay), the River
// gate (fewer foes, all elites, the boss a turn late, +15%) or the Graveyard (the Ossuary raises two). Tier 3 to 5 bring their own
// bosses (the Witchfinder General, the Saint of Pyres, the Grand Inquisitor). Tier 4 burns one building's perk for the night: the
// strongest perk you did not guard. No Math.random here: every choice is the wave table or the guard.
// S.siege gains tier and streak (written only once they change; absent means tier 1, no streak) and road (tonight's wall, kept
// with guard and wall while a siege is pending). S.run.tier, S.run.road, S.run.burnt: the siege being fought.
let STIERS_ON=true;   // the bots' "off":["siegetiers"]: every siege at tier 1
const STIER_MAX=5, STIER_UP=2, STIER_PAY=[1,1.2,1.4,1.7,2], STIER_K=[.8,1.2,1.5,1.85,2.2], WITCH_MARK=1.5, SERMON_K=1.2, MARTYR_HP=.3, ABSOLVE_HEAL=.2, ABSOLVE_DR=.5;
const STIERS=[
  {name:'Militia',     rule:'The militia, crossbowmen, chaplains and a witch-hunter; the Inquisitor Captain leads.'},
  {name:'Templars',    rule:'Templar Shieldwalls and Flagellants join; the first wave brings a Templar elite.'},
  {name:'Inquisition', rule:'Relic Bearers and Exorcists join; four waves; the Witchfinder General leads.'},
  {name:'Crusade',     rule:'Pyre Priests and a Hound Master with his hounds join; the attackers burn the perk of one building you did not guard for the night; the Saint of Pyres leads.'},
  {name:'Purge',       rule:'All of them; five waves; the Grand Inquisitor leads, in two phases.'}
];
const SIEGE2_FOES={   // token: [name, role, hp factor, atk factor]
  templar:['Templar Shieldwall','vanguard',1.5,.8], flag:['Flagellant','reaper',1,1.25], relic:['Relic Bearer','striker',.9,.7], exor:['Exorcist','striker',.9,1.15],
  pyre:['Pyre Priest','striker',.85,1.2], hound:['Hound Master','reaper',1.1,1.1], dog:['War Hound','striker',.6,.9]
};
Object.assign(KIT_OF,{'Templar Shieldwall':'shield','Flagellant':'frenzy','Relic Bearer':'banner','Exorcist':'sapper','Pyre Priest':'bomb','Hound Master':'pack','War Hound':'pack'});
const STIER_WAVES=[null,   // tier 1 is SIEGE_WAVE; 'templar*' is an elite
  [['templar*','vanguard','striker'],['templar','striker','mender','flag'],['boss','templar','striker','mender']],
  [['templar*','vanguard','striker'],['templar','exor','mender','flag'],['templar','relic','striker','reaper'],['boss','templar','exor','mender']],
  [['templar*','flag','striker'],['templar','exor','mender','pyre'],['hound','dog','dog','relic'],['boss','templar','pyre','mender']],
  [['templar*','flag','striker'],['templar','exor','mender','pyre'],['hound','dog','dog','relic'],['templar','flag','exor','reaper'],['boss','templar','pyre','relic']]
];
const SIEGE_BOSSES=[SIEGE_BOSS,'The Witchfinder General','The Saint of Pyres','The Grand Inquisitor'];
const STIER_BOSS=[0,0,1,2,3];   // tier -> SIEGE_BOSSES index
const SBOSS_F={'Inquisitor Captain':[1,1],'The Witchfinder General':[1.1,1.05],'The Saint of Pyres':[1.15,1.1],'The Grand Inquisitor':[1.25,1.15]};
Object.values(SIEGE2_FOES).forEach(f=>SIEGE_NAMES.push(f[0])); SIEGE_BOSSES.slice(1).forEach(n=>SIEGE_NAMES.push(n));
const ROAD_IDS=['north','river','grave'];
const ROADS={
  north:{name:'North road',pay:1.25,desc:'One more foe in every wave, and the Bell Tower\'s defenses work twice as hard. Pays 25% more.'},
  river:{name:'River gate',pay:1.15,desc:'One foe fewer in every wave, but every one an elite, and the boss acts a turn later. Pays 15% more.'},
  grave:{name:'Graveyard', pay:1,   desc:'Waves as usual. The Ossuary raises two fallen attackers at each wave instead of one.'}
};
Object.assign(BOSS_ABIL,{
  witchmark:{name:'Mark of the Witch',every:3,warn:false,desc:'Marks your strongest minion for 3 turns: it takes 50% more damage from every blow.'},
  pyre:     {name:'Pyre Sentence',    every:3,warn:true, desc:'Burns the marked minion (your strongest, if none is marked) for 180% of its attack as fire, and it burns for 2 turns.'},
  pillar:   {name:'Pillar of Fire',   every:3,warn:true, desc:'A column of fire: 130% of its attack on one unit of your front row and one of your back row (you, where a row is empty).'},
  sermon:   {name:'Sermon',           every:4,warn:false,desc:'Every attacker deals 20% more damage for 2 turns.'}
});
TWISTS.absolve={name:'Absolution',desc:'Heals every attacker for 20% of its max HP, and takes 50% less damage while any Templar Shieldwall stands.'};
Object.assign(BOSS_KIT,{
  'The Witchfinder General':{moves:['witchmark','pyre','decree']},
  'The Saint of Pyres':     {moves:['pillar','sermon','decree']},
  'The Grand Inquisitor':   {moves:['decree','witchmark','pyre','pillar'],twist:'absolve'}
});
const SBOSS_PASSIVE={'The Witchfinder General':['Iron Faith','Cannot be Hexed or Sundered.'],'The Saint of Pyres':['Martyr','The first time it falls, it rises again at 30% HP.']};
Object.assign(BOSS_LINES,{
  'The Witchfinder General':['I have burned a hundred of your kind. Their names were shorter than yours.','The pyre... was meant for you...'],
  'The Saint of Pyres':     ['Kneel in the fire, and be made clean.','Even ash... remembers the flame.'],
  'The Grand Inquisitor':   ['The Inquisition has read your Ledger. It ends tonight.','Then the Church... was wrong about you. Write that down.']
});
Object.assign(PHASE_LINES,{'The Grand Inquisitor':'Templars, to me! I absolve you all of what comes next.'});
// ----- the tier
const stierRaw=()=>{ const t=sg().tier; return Number.isInteger(t)&&t>=1&&t<=STIER_MAX?t:1; };
const stierShift=()=>{ const b=dreadBand().id; return b==='calm'?-1:b==='terror'?1:0; };
const siegeTier=()=>!STIERS_ON?1:sg().pd?STIER_MAX:clamp(stierRaw()+stierShift(),1,STIER_MAX);   /* the Purge: tier 5 whatever the dread */   // the tier tonight's siege is fought at
const runTier=()=>S.run&&S.run.siege&&S.run.tier?S.run.tier:1;
const siegeRooms=t=>{ t=t||siegeTier(); return t<=1?SIEGE_WAVES:STIER_WAVES[t-1].length; };
const siegeBossName=t=>SIEGE_BOSSES[STIER_BOSS[(t||runTier())-1]]||SIEGE_BOSS;
const siegeRoad=()=>{ const r=S.run; if(r&&r.siege&&ROADS[r.road]) return r.road; if(STIERS_ON&&sg().pd) return 'all'; return ROADS[sg().road]&&sg().road!=='all'?sg().road:'grave'; };
function siegeRoadPick(k){ if(!(S.mode==='siege'||(S.mode==='town'&&siegeWarned()))||!ROAD_IDS.includes(k)||siegeRoad()==='all') return false; if(k==='grave') delete sg().road; else sg().road=k; return true; }   // the intro screen
const siegePay2=()=>{ const r=S.run&&S.run.siege?S.run:null; return STIER_PAY[(r?r.tier||1:siegeTier())-1]*ROADS[siegeRoad()].pay; };   // siegeGoldPay (the wall: tonight's pick, or the Graveyard)
function stierMove(won){   // siegeWon / siegeLost: the tier climbs after two held in a row, falls after a loss
  if(!STIERS_ON) return; const g=sg(), t=stierRaw(), r=S.run&&S.run.siege?S.run:null; siegeDeeds(r,won);
  if(r&&r.purge){ purgeEnd(won); return; }
  if(won){ const s=(g.streak|0)+1; if(s>=STIER_UP&&t<STIER_MAX){ g.tier=t+1; g.streak=0; tally('stierUp'); if(g.tier>(T_('stierTop')|0)) S.ti.stierTop=g.tier;
      notify('The Inquisition takes your measure: the next sieges come at tier '+g.tier+', '+STIERS[g.tier-1].name+'. '+STIERS[g.tier-1].rule,'bad'); stierAfter(g,t); }
    else g.streak=s; return; }
  if(g.streak) g.streak=0; if(t>1){ g.tier=t-1; notify('The living think you broken: sieges fall back to tier '+g.tier+', '+STIERS[g.tier-1].name+'.','ok'); }
}
// ----- the burnt perk (tier 4 and up): the strongest perk building you did not guard
function siegeBurnPick(t){ if((t||siegeTier())<4) return null; const g=sg(); const ks=Object.keys(BUILD).filter(k=>SIEGE_PERK[k]&&bl(k)>0&&k!==g.guard); return ks.reduce((a,k)=>a&&bl(a)>=bl(k)?a:k,null); }
const sbl=k=>S.run&&S.run.siege&&S.run.burnt===k?0:bl(k);   // a building's level for its siege perk
// ----- the waves
function siegeFoe2(tok,lvl,di,t){   // one of the living from a wave token
  if(tok==='boss'){ const n=siegeBossName(t), f=SBOSS_F[n]||[1,1], s=mobStats(di,lvl+SIEGE_BOSS_LV,f[0],f[1],true,false);
    const e={id:'e'+(++S.uid),name:n,base:n,role:'reaper',rankI:di,lvl:lvl+SIEGE_BOSS_LV,hf:f[0],af:f[1],boss:true,elite:false,maxHp:Math.round(s.hp*SIEGE_HP),hp:0,atk:Math.max(1,Math.round(s.atk*SIEGE_ATK)),dead:false,living:true};
    e.hp=e.maxHp; giveAbility(e,n===SIEGE_BOSS?SIEGE_MOVE:BOSS_KIT[n].moves[0]); giveKit(e); if(n==='The Witchfinder General') e.faith=1; if(n==='The Saint of Pyres') e.martyr=1; return e; }
  const el=tok.endsWith('*'), k=el?tok.slice(0,-1):tok, F=SIEGE2_FOES[k];
  if(!F) return siegeFoe(k,lvl,di,false,el||k==='reaper');
  const s=mobStats(di,lvl,F[2],F[3],false,el);
  const e={id:'e'+(++S.uid),name:F[0],base:F[0],role:F[1],rankI:di,lvl,hf:F[2],af:F[3],boss:false,elite:el,maxHp:Math.round(s.hp*SIEGE_HP),hp:0,atk:Math.max(1,Math.round(s.atk*SIEGE_ATK)),dead:false,living:true};
  e.hp=e.maxHp; return e;
}
function siegeWaveList(r,lvl,di){   // spawnSiege: the wave for this tier and wall
  const t=r.tier||1, W=t<=1?SIEGE_WAVE:STIER_WAVES[t-1], toks=(W[r.room]||W[W.length-1]).slice(), road=r.road;
  if((road==='north'||road==='all')&&toks.length<5) toks.push('vanguard');
  if(road==='river'&&toks.length>2) toks.pop();
  const list=toks.map(k=>siegeFoe2(road==='river'&&k!=='boss'&&!k.endsWith('*')&&k!=='reaper'?k+'*':k,lvl,di,t));
  const K=STIER_K[t-1]; if(K!==1) for(const e of list){ e.maxHp=e.hp=Math.max(1,Math.round(e.maxHp*K)); e.atk=Math.max(1,Math.round(e.atk*K)); }
  if(road==='river') list.filter(e=>e.boss).forEach(e=>{ e.abilT=(e.abilT||0)+1; });
  return list;
}
function siegeBegin2(r){   // beginSiege: tonight's tier, wall and burnt perk
  if(STIERS_ON&&sg().pd){ r.purge=1; log('The Purge: the Grand Inquisitor comes at every wall at once.','bad'); }
  r.tier=siegeTier(); r.road=siegeRoad(); r.rooms=siegeRooms(r.tier); const b=siegeBurnPick(r.tier); if(b) r.burnt=b;
  if(r.tier>1) log('Tier '+r.tier+': '+STIERS[r.tier-1].name+'. '+STIERS[r.tier-1].rule,'bad');
  if(r.road!=='grave') log('You hold the '+ROADS[r.road].name+'. '+ROADS[r.road].desc,'ok');
  if(b) log('The crusaders fire the '+BUILD[b].name+': its siege perk is lost for the night.','bad');
  tally('road_'+r.road);
}
const ossN=()=>S.run&&S.run.siege&&S.run.road==='grave'?2:1;   // bodies the Ossuary raises at a wave
const bellK=()=>S.run&&S.run.siege&&S.run.road==='north'?2:1;   // the Bell Tower's defenses on the North road
const siegeBossLine=r=>{ const n=siegeBossName(r.tier); return n===SIEGE_BOSS?'The Inquisitor Captain comes through the smoke.'+captainLine():n+' comes through the smoke.'; };
// ----- the bosses' moves and rules
function fireKitMove4(e,mv){   // fireKitMove3 hands on what it does not know
  const r=S.run;
  if(mv==='witchmark'){ const m=strongestMinion(); if(m){ m.wmk=r.turn+4; log(e.name+' brands '+m.nick+' with the Mark of the Witch: it takes 50% more damage for 3 turns.','bad'); } else log(e.name+' looks for a witch to mark, but finds none.','ok'); }
  else if(mv==='pyre'){ const m=S.army.find(x=>hittable(x)&&x.wmk>r.turn)||strongestMinion(); if(!m){ log(e.name+'\'s pyre finds no one to burn.','ok'); return true; }
    const d=bossHit(e,m,1.8,'fire',mv); addDot(m,'burn',e.atk*.2,2); log(e.name+' passes the Pyre Sentence on '+m.nick+' for '+d+'.','bad'); }
  else if(mv==='pillar'){ let tot=0; const f=S.army.filter(a=>hittable(a)&&rowOf(a)==='f').sort((a,b)=>b.maxHp-a.maxHp)[0]||S.player, b=S.army.filter(a=>hittable(a)&&rowOf(a)==='b').sort((a,b)=>b.maxHp-a.maxHp)[0]||S.player;
    tot+=bossHit(e,f,1.3,'fire',mv); if(b!==f) tot+=bossHit(e,b,1.3,'fire',mv); log(e.name+' calls down a Pillar of Fire for '+tot+'.','bad'); }
  else if(mv==='sermon'){ r.serm=r.turn+3; log(e.name+' preaches a Sermon: every attacker deals 20% more damage for 2 turns.','bad'); }
  else return false;
  return true;
}
const siegeTaken=(a,d)=>a&&a.id!=='p'&&S.run&&a.wmk>S.run.turn?Math.round(d*WITCH_MARK):d;   // hurtAlly: the Mark of the Witch
const sermonK=()=>S.run&&S.run.serm>S.run.turn?SERMON_K:1;   // kitAtk
const faithImm=(u,k)=>!!u&&!!u.faith&&(k==='hexed'||k==='sundered');   // stImmune: Iron Faith
function siegeHurt(e){   // hurtFoe, after the damage: the Saint of Pyres's Martyr
  if(!e.martyr||e.martyrU||e.hp>0) return; e.martyrU=1; e.hp=Math.max(1,Math.round(e.maxHp*MARTYR_HP)); delete e.cd; delete e.kb; mark(e,0,e.hp);
  log(e.name+' falls, and rises again in a pillar of flame: the Martyr (+'+e.hp+' HP).','bad'); sfx('phase');
}
function siegeTwist(e){   // bossTwist: Absolution
  if(e.twist!=='absolve') return; let n=0; for(const f of liveFoes()){ const h=Math.min(f.maxHp-f.hp,Math.round(f.maxHp*ABSOLVE_HEAL)); if(h>0){ f.hp+=h; n++; } }
  log(e.name+' grants Absolution: '+n+' of the living mend, and it shelters behind its Templars.','bad');
}
const absolveDr=(e,d)=>e.twist==='absolve'&&S.run&&S.run.enemies.some(o=>o!==e&&o.hp>0&&o.base==='Templar Shieldwall')?Math.round(d*ABSOLVE_DR):d;   // bossTaken
const siegeRoleOf=n=>{ if(SIEGE_BOSSES.includes(n)) return 'reaper'; const a=Object.keys(SIEGE_FOES).find(r=>SIEGE_FOES[r][0]===n); if(a) return a; const b=Object.values(SIEGE2_FOES).find(f=>f[0]===n); return b?b[1]:'vanguard'; };
function stierFix(g,q){   // normalizeSave: tier and streak only when the save has them; tonight's wall while pending
  if('tier' in q) g.tier=clamp(Math.floor(num(q.tier,1)),1,STIER_MAX);
  if('streak' in q) g.streak=clamp(Math.floor(num(q.streak,0)),0,STIER_UP-1);
  if(g.pending&&ROAD_IDS.includes(q.road)&&q.road!=='grave') g.road=q.road;
  stierFix2(g,q);
}

// ===== R14 PR B: SIEGE WORKS, THE INQUISITION'S ARC, THE PURGE AND THE PEACE =====
// Siege works are built once in town (gold and bone dust) and serve every siege after (S.siege.works = {k:1}). The arc: a
// passage the first time the tier reaches 2, 3, 4 and 5 (S.siege.arc, the last read). Reaching tier 5 makes the next siege
// The Purge (S.siege.pd): tier 5 whatever the dread, every wall at once (no choice, one more foe a wave, no wall pay). Win it:
// the Inquisition sues for peace (S.siege.peace = {until}: no siege for PEACE_DAYS), the town falls Calm, the Grand Inquisitor's
// heart ('b:The Inquisition', forged at the Forge), and the tier restarts at 3. Lose it: the tier falls to 3, and the Purge
// comes again on reaching tier 5. S.siege.purge = {won, day}: the Purges won and the last day.
const PEACE_DAYS=20, PEACE_DREAD=10, PURGE_RESET=3, CATAPULT_K=.08, PALISADE_K=.15, OIL_K=.15, CALTROP_K=.04, WARD_BLOCK=['decree','hymn','verse','nothing'];
const WORKS={
  caltrops:{name:'Caltrop field',  g:800, d:0, desc:'Every attacker in the first wave bleeds for 4% of its max HP a turn for 3 turns.'},
  oil:     {name:'Oil cauldron',   g:1500,d:10,desc:'The first wave\'s front row is scalded for 15% of its max HP as fire.'},
  palisade:{name:'Bone palisade',  g:2000,d:20,desc:'At the start of every wave your front-row minions gain a Bone Shield worth 15% of their max HP.'},
  catapult:{name:'Corpse catapult',g:3000,d:30,desc:'From the second wave, a fallen attacker is flung back over the wall: every attacker takes 8% of its max HP.'},
  wards:   {name:'Ward stones',    g:5000,d:50,desc:'Once a wave, a Royal Decree, Hymn of Silence, Verse of Binding or Decree of Nothing breaks on the stones.'}
};
const WORK_IDS=Object.keys(WORKS);
ROADS.all={name:'Every wall',pay:1,desc:'The Purge comes at every wall at once: one more foe in every wave, and no wall to choose.'};
const SIEGE_ARC=[
  {t:2,name:'Templars on the road',m:'Steel on the hill road at dawn: Templars, riding under the Church\'s white banner. The militia step aside for them. Someone in the town has written to the Inquisition, and the Inquisition has written back.'},
  {t:3,name:'An Inquisitor\'s letter',m:'A letter nailed to your gate, sealed in red wax: "To the keeper of the book. You are named. Your dead are named. The Witchfinder General comes to read your names aloud, and burn them one by one."'},
  {t:4,name:'The pyres in the valley',m:'The valley smells of smoke. They are burning the old graveyards before you can reach them, and singing as they do it. A Saint walks at the head of the crusade, and the fire does not touch her.'},
  {t:5,name:'The last crusade',m:'Every bell in the valley rings at once. The Grand Inquisitor has come himself, with every Templar the Church could spare. This is not a siege. It is a Purge, and it means to end at your door.'}
];
const worksOwn=k=>!!(sg().works&&sg().works[k]);
const workCan=k=>!!WORKS[k]&&S.mode==='town'&&siegeOpen()&&!worksOwn(k)&&S.gold>=WORKS[k].g&&(S.dust||0)>=WORKS[k].d;
function buildWork(k){ if(!workCan(k)) return false; const W=WORKS[k]; S.gold-=W.g; S.dust=(S.dust||0)-W.d; const g=sg(); g.works=Object.assign({},g.works||{},{[k]:1}); tally('works'); sfx('level'); return true; }
const siegePeace=()=>!!S&&!!sg().peace&&S.day<sg().peace.until;
const purgeDue=()=>!!S&&!!sg().pd;
function worksWave(list,r){   // townSiegeWave: the works, then the Ward stones reset for the wave
  const front=e=>rowOf(e)==='f';
  if(r.room===0&&worksOwn('caltrops')) list.forEach(e=>addDot(e,'bleed',Math.max(1,Math.round(e.maxHp*CALTROP_K)),3));
  if(r.room===0&&worksOwn('oil')) list.filter(front).forEach(e=>{ e.hp=Math.max(1,e.hp-Math.round(e.maxHp*OIL_K*(1-foeRes(e,'fire')))); });
  if(worksOwn('palisade')) S.army.filter(m=>m.hp>0&&rowOf(m)==='f').forEach(m=>{ m.mw=Math.max(m.mw||0,Math.round(m.maxHp*PALISADE_K)); });
  if(r.room>0&&worksOwn('catapult')&&r.fallen&&r.fallen.length){ const c=r.fallen.pop(); list.forEach(e=>{ e.hp=Math.max(1,e.hp-Math.round(e.maxHp*CATAPULT_K)); }); log('The Corpse catapult flings '+withArticle(c.base||c.name)+' back over the wall.','ok'); }
  r.wsU=0;
}
function wardStone(e,mv){   // fireAbility: the Ward stones break one move a wave
  const r=S.run; if(!r||!r.siege||!worksOwn('wards')||r.wsU||!WARD_BLOCK.includes(mv)) return false;
  r.wsU=1; log(e.name+'\'s '+BOSS_ABIL[mv].name+' breaks on the Ward stones.','ok'); tally('wardStones'); return true;
}
function siegeArc(t){   // the tier reached t: its passage, once
  const g=sg(), a=SIEGE_ARC.find(x=>x.t===t); if(!a||(g.arc|0)>=t-1) return; g.arc=t-1; notify('From the Ledger, "'+a.name+'": '+a.m,'story'); moment(a.name,'bad');
}
function purgeEnd(won){   // siegeWon / siegeLost on the Purge
  const g=sg(); delete g.pd; g.streak=0;
  if(!won){ g.tier=PURGE_RESET; notify('The Purge broke your walls. The Inquisition withdraws to lick its wounds, and the sieges fall back to tier '+PURGE_RESET+'. It will come again.','bad'); return; }
  const p=g.purge||{}; g.purge={won:(p.won|0)+1,day:S.day}; g.peace={until:S.day+1+PEACE_DAYS}; g.tier=PURGE_RESET; g.next=0; tally('purgeWon');
  if(dreadOn()) dread(PEACE_DREAD-dreadOf()); S.trophies['b:The Inquisition']=(S.trophies['b:The Inquisition']||0)+1;
  notify('The Grand Inquisitor is dead and his Templars are scattered. The Inquisition sues for peace: no siege for '+PEACE_DAYS+' days, and the town is calm. His heart is yours; the Forge can work it.','gold'); moment('The Purge is broken','gold');
}
function stierAfter(g,t0){   // stierMove, once the tier has climbed: the arc, tier 5 and the Purge
  if(g.tier>t0){ siegeArc(g.tier); if(g.tier===STIER_MAX){ tally('stier5'); if(!g.pd){ g.pd=1; notify('The Inquisition has had enough. The next siege is the Purge: the Grand Inquisitor, five waves, every wall at once.','bad'); } } }
}
function siegeDeeds(r,won){   // stierMove: tallies for the titles
  if(!won||!r) return; if(r.road==='north') tally('roadNorth'); if((r.tier|0)>=4&&!S.army.some(m=>!m.thrall&&m.hp<=0)) tally('pyreProof');
}
const hfInfoX=boss=>boss==='The Inquisition'?{boss,set:5,m:TM[5],gold:20000,dust:80,n:3}:null;   // hfInfo0
HF_LINES['The Inquisition']=['fres','will','constitution','hp','ward','atk'];
TROPHY['b:The Inquisition']={name:'Heart of the Grand Inquisitor',value:TROPHY_VAL[5]*40,ico:'The Grand Inquisitor',rankI:5,gate:5};
function stierFix2(g,q){   // normalizeSave: works, arc, the Purge and the peace, each only when the save has it
  const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  if(obj(q.works)){ const w={}; for(const k of WORK_IDS) if(q.works[k]) w[k]=1; g.works=w; }
  if('arc' in q) g.arc=clamp(Math.floor(num(q.arc,0)),0,SIEGE_ARC.length);
  if(q.pd) g.pd=1;
  if(obj(q.peace)) g.peace={until:Math.max(0,Math.floor(num(q.peace.until,0)))};
  if(obj(q.purge)) g.purge={won:Math.max(0,Math.floor(num(q.purge.won,0))),day:Math.max(0,Math.floor(num(q.purge.day,0)))};
}
