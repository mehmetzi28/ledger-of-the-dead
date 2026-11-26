// ===== VANE ABBEY: THE SEVENTH GATE (R3) =====
// Under the drowned chapel lies the abbey where Oswin Vane bound the Ledger. Its door shows on the Gates tab once the Throne of Ash falls,
// sealed, with two keys: the deep route (Throne of Ash cleared, Tower floor ABBEY_TOWER, ABBEY_PAGES torn pages) and the secret
// route (Throne of Ash cleared, all six secret masters slain in any cycle of this save). Either one opens it for the cycle
// (S.abbey = {keys:{deep,secret}, open}; reset by New Game+). Gate index ABBEY (6), rank SS. Five rooms: three fights, the
// Scriptorium (cross out one name for a blessing and one echo fewer) and the Hunger, a boss in three phases that wears your
// Memorial. The abbey is never cursed, raided, folded into the Rift or a Trial, and hides no secret master or rival.
// Run-only: r.crossed {nick}, r.lbless (the Ledger blessing: a trait every minion of yours carries in the boss fight), r.p3n
// (your actions in the Hunger's last phase), r.notes (Marginalia), r.lcU (the Ledger-Chain spent this room); on foes e.hunger,
// e.ph (1-3), e.echo {kind, day, bd}, e.echoN, e.devU, e.fireT, e.readT; on minions m.read (a trait read aloud, muted).
const ABBEY_TOWER=90, ABBEY_PAGES=20, ABBEY_ROOMS=5;
const HUNGER_ECHO=.6, HUNGER_AT=[.6,.3], HUNGER_REGEN=.03, HUNGER_DR=.5, HUNGER_ACTS=6, HUNGER_ECHOES=3, HUNGER_HEAL=.05, ECHO_TIER_MAX=2, ECHO_BOND=1.3;
const LECTOR_ATK=1.25, CHAIN_HEAD=.01, CHAIN_MAX=.2, CHAIN_SPEAR=.85;
// ----- the door and its keys
function abbeyFix(a){ const o={keys:{deep:0,secret:0},open:0}; if(a&&typeof a==='object'){ if(a.keys&&typeof a.keys==='object'){ o.keys.deep=a.keys.deep?1:0; o.keys.secret=a.keys.secret?1:0; } if(a.open) o.open=1; } return o; }   // normalizeSave
const abbeyState=()=>S.abbey||(S.abbey=abbeyFix(null));
const abbeyOpen=()=>!!(S&&S.abbey&&S.abbey.open);
const gateLocked=i=>i===ABBEY?!abbeyOpen():S.player.lvl<RK[i].unlock;   // the abbey opens by its keys, every other gate by level
const throneDown=()=>!!(S.ti&&S.ti.clr&&S.ti.clr[5]);
const mastersSlain=()=>SECRET.filter((B,i)=>T_('secret_'+i)>0).length;
const ABBEY_KEYS={
  deep:  {name:'The deep route',  parts:()=>[['The Throne of Ash cleared',throneDown()],['Hell Tower floor '+ABBEY_TOWER,((S.tower&&S.tower.best)||0)>=ABBEY_TOWER],[ABBEY_PAGES+' torn pages found',(S.pages||0)>=ABBEY_PAGES]]},
  secret:{name:'The secret route',parts:()=>[['The Throne of Ash cleared',throneDown()],['All six secret masters slain ('+mastersSlain()+'/'+SECRET.length+')',mastersSlain()>=SECRET.length]]}
};
const keyDone=k=>ABBEY_KEYS[k].parts().every(p=>p[1]);
function abbeyCheck(){   // after every action (checkTitles): a finished route turns its key; one key opens the door
  if(!S||!S.player||!S.ti) return; const A=abbeyState();
  for(const k of ['deep','secret']) if(!A.keys[k]&&keyDone(k)){ A.keys[k]=1; notify('A key turns in the drowned door of Vane Abbey: '+ABBEY_KEYS[k].name+'.','story'); }
  if(!A.open&&(A.keys.deep||A.keys.secret)){ A.open=1; tally('abbeyOpened'); moment('Vane Abbey opens','gold'); notify('The river turns back. Vane Abbey, the seventh gate, stands open on the Gates tab.','story'); }
}
// ----- the Scriptorium: one name crossed out before the Hunger
DOORS.script={name:'The Scriptorium',desc:'No fight. The Ledger lets you cross out one name: a minion leaves for good, the Hunger calls one echo fewer, and every minion of yours carries its trait in the boss fight.',s:'Cross out a name, or pass'};
const scriptRoom=r=>!!r&&r.di===ABBEY&&!r.tw&&!r.rift&&!r.trial&&!r.siege;
const topTrait=m=>{ const t=(m.traits||[]).slice(); return t.find(x=>COMPOUND[x])||t.find(x=>DEATH_TRAITS.includes(x)||AFFIX_TRAITS.includes(x))||t[t.length-1]||null; };   // the trait a name is remembered by: a compound first, then a rare one, then the newest
const canCross=m=>!!m&&!m.thrall&&S.mode==='raise'&&!!S.run&&S.run.quiet==='script'&&!S.run.crossed;
function scriptCross(uid){   // cross out a name: the minion leaves for good (not to the Memorial)
  const r=S.run, m=S.army.concat(S.reserve||[]).find(x=>x.uid===uid); if(!canCross(m)) return false;
  returnGear(m); S.army=S.army.filter(x=>x!==m); if(S.reserve) S.reserve=S.reserve.filter(x=>x!==m);
  const t=topTrait(m); r.crossed={nick:m.nick}; if(t) r.lbless=t; tally('scriptor'); cmdSync();
  r.events.push({m:'You draw a line through '+m.nick+'. The name is gone from the Ledger, and from the Memorial before it could be written there. The Hunger will call one echo fewer'+(t?', and every minion of yours carries '+TRAITS[t].name+' against it.':'.'),c:'story'}); sfx('carve');
  return true;
}
const ledgerBless=(m,t)=>{ const r=S&&S.run; return !!r&&r.lbless===t&&m.uid!=null&&m.id==null&&r.di===ABBEY&&!r.tw&&r.room===r.rooms-1; };   // hasTrait: the blessing holds in the boss room only
// ----- the abbey's two kits (game-kits.js hands these to the hooks below)
Object.assign(KITS,{
  unwritten:{name:'Unwritten',rule:'Your minions\' blows pass through it unless a skill or your Siphon has struck it this turn.',ans:'Any skill or Siphon first, then the army.'},
  recite:   {name:'Recitation',rule:'On its first turn it reads your strongest minion\'s best trait aloud: the minion loses it and the Lector hits 25% harder. Killing the Lector gives the trait back.',ans:'Kill it first; a minion with no traits gives it nothing to read.'}
});
Object.assign(KIT_OF,{'Plague-Year Mourner':'stance','Drowned Novice':'ambush','Brother of the Binding':'purify','Ink Wraith':'unwritten','Chained Lector':'recite','Censer-Bearer':'banner','Weeping Unnamed':'call'});
Object.assign(KIND_RES,{'Drowned Novice':{frost:-.25,fire:.25}});   // soaked: weak to frost, resists fire
const inked=e=>e.inkT===S.run.turn;
function abbeyMiss(e){   // hurtFoe, first: an Unwritten foe lets a minion's blow pass through; a skill or your Siphon inks it for the turn
  if(!hasKit(e,'unwritten')||!S.run) return false;
  if(SKILLHIT||(HITTER&&HITTER.id==='p'&&SIPHONING)) { e.inkT=S.run.turn; return false; }
  if(HITTER&&HITTER.id!=='p'&&!inked(e)){ mark(e,0,0); return true; }
  return false;
}
let SIPHONING=false;   // Soul Siphon is landing (it inks an Unwritten foe)
function abbeyTarget(m,t){   // minionTarget: a minion does not waste its blow on an Unwritten foe, nor strike the echo of the one it was bonded to
  if(!t||!S.run) return t; const L=liveFoes().filter(reachable);
  const bad=x=>(hasKit(x,'unwritten')&&!inked(x))||(x.echo&&x.echo.bd===m.nick);
  if(!bad(t)) return t; const h=L.find(x=>x.hunger&&x.echo==null); if(t.echo&&h) return h;
  return L.find(x=>!bad(x))||t;
}
const bondEchoK=(m,tg)=>tg.hunger&&liveFoes().some(o=>o.echo&&o.echo.bd===m.nick)?ECHO_BOND:1;   // breakK: a minion facing its fallen partner's echo strikes the Hunger harder
function abbeyIntent(e,K,T,alive){
  if(K==='recite'&&!e.readU){ const m=readable(); if(m) return {k:'read',t:fxKey(m)}; }
  return null;
}
const readable=()=>S.army.filter(m=>hittable(m)&&topTrait(m)&&m.read==null).sort((a,b)=>b.atk-a.atk)[0]||null;
function readAloud(by,m){   // a trait read aloud: the minion loses it while the reader stands (the Hunger: for the fight)
  const t=topTrait(m); if(!t) return null; m.read=t; m.readBy=by.id; return t;
}
function abbeyKitAct(e,it){
  if(it.k!=='read') return false; e.readU=1; const m=S.army.find(x=>fxKey(x)===it.t&&x.hp>0)||readable();
  const t=m&&readAloud(e,m); if(t){ e.readT=t; e.atk=Math.max(1,Math.round(e.atk*LECTOR_ATK)); log(e.name+' reads '+m.nick+'\'s '+TRAITS[t].name+' aloud. '+m.nick+' forgets it, and the Lector hits harder.','bad'); }
  else log(e.name+' searches your army for a trait to read, and finds none.','ok');
  return true;
}
function abbeyKitDeath(e){   // kitDeath: a fallen Lector gives back what it read
  if(!e.readT) return; for(const m of S.army) if(m.readBy===e.id){ delete m.read; delete m.readBy; log(m.nick+' remembers its '+TRAITS[e.readT].name+'.','ok'); }
}
function abbeyKitState(e,K){
  if(K==='unwritten') return inked(e)?'Inked: your army can reach it this turn':'Unwritten: a skill or Siphon makes it solid';
  if(K==='recite') return e.readT?'Read aloud: '+TRAITS[e.readT].name:e.readU?'Found nothing to read':'Will read a trait on its first turn';
  return '';
}
// ----- Marginalia (the Scribe's Regalia, 3 pieces): every skill writes a note; at three the next skill is free and strikes the foe's weakness
const MARGIN_TXT='Marginalia: each skill you cast writes a note; at three notes your next skill costs no mana and strikes the target\'s weakness';
let MARGIN=null;   // the damage type a Marginalia skill lands as (hurtFoe)
const marginReady=()=>!!(S&&S.run&&S.mode==='battle'&&setB('margin')>0&&(S.run.notes||0)>=3);
const weakOf=t=>DT_IDS.slice().sort((a,b)=>foeRes(t,a)-foeRes(t,b))[0];
function marginSkill(r,t,free){ if(free){ r.notes=0; MARGIN=t?weakOf(t):null; log('Marginalia: the skill writes itself, free, in '+(MARGIN?DTYPE[MARGIN].name.toLowerCase():'plain')+' ink.','ok'); } else if(setB('margin')>0) r.notes=Math.min(3,(r.notes||0)+1); }
// ----- Oswin's Ledger-Chain
const headstones=()=>S&&S.memorial?S.memorial.filter(e=>(e.hs|0)>=1).length:0;
const chainK=()=>hasFlag('ledgerchain')?Math.min(CHAIN_MAX,CHAIN_HEAD*headstones()):0;   // extraMul: +1% to all minion stats per headstone
function chainSpear(){   // hurtAlly: a minion of yours is downed; once a room you strike its last blow back
  const r=S.run; if(!r||r.lcU||!hasFlag('ledgerchain')||S.mode!=='battle') return; const t=currentTarget(); if(!t||t.hp<=0) return; r.lcU=1;
  const h=HITTER, sh=SKILLHIT; HITTER=S.player; SKILLHIT=1; const d=hit((pAtk()+pSiph())*CHAIN_SPEAR*pierceMul(.5)); hurtFoe(t,d,'phys'); HITTER=h; SKILLHIT=sh;
  log('The Ledger-Chain pulls taut: a Bone Spear of its last blow strikes '+t.name+' for '+d+'.','ok'); fxe('spear',t);
}
// ----- the Hunger
Object.assign(BOSS_ABIL,{
  erase:    {name:'Erase',              every:3,warn:false,desc:'Wipes your Bone Ward and your strongest blessing: Unholy Frenzy, else your minions\' Bone Shields.'},
  hollow:   {name:'Hollow Hymn',        every:3,warn:false,desc:'Shadow over your whole side: 55% of its attack to each unit.'},
  hunger:   {name:'Hunger',             every:3,warn:false,desc:'Bites your strongest minion (you, if none) for 130% of its attack and mends 5% of its max HP.'},
  remember: {name:'Call the Fallen',     every:3,warn:false,desc:'Calls up to three of your own fallen from the Memorial as echoes, at 60% strength. While an echo stands it takes 50% less damage.'},
  readaloud:{name:'Read Aloud',         every:4,warn:false,desc:'Reads your strongest minion\'s best trait aloud: it forgets it for the rest of the fight.'},
  writename:{name:'Write Your Name',    every:4,warn:true, desc:'The pen comes down on you: you drop to 1 HP. A Bone Ward takes the pen instead; freezing it breaks the stroke.'},
  devour:   {name:'Devour the Margin',  every:4,warn:true, desc:'Eats your strongest minion outright, once a fight. A Guard order saves it.'}
});
const HUNGER_PH=[null,
  {name:'The Blank Page',  kit:['erase','hollow','hunger'],   desc:'Immune to shadow. Each turn it was not hit by fire it regains 3% of its max HP.'},
  {name:'The Remembered',  kit:['remember','readaloud','hollow'],desc:'Calls your fallen from the Memorial. While an echo stands it takes 50% less damage.'},
  {name:'The Last Entry',  kit:['writename','devour','hollow'],desc:'The book is running out: after six of your actions in this phase, the fight ends in your favour if you stand.'}];
Object.assign(TWISTS,{blank:{name:HUNGER_PH[1].name,desc:HUNGER_PH[1].desc},remembered:{name:HUNGER_PH[2].name,desc:HUNGER_PH[2].desc},lastentry:{name:HUNGER_PH[3].name,desc:HUNGER_PH[3].desc}});
BOSS_KIT['The Hunger']={moves:HUNGER_PH[1].kit,res:{},phases:[1,2,3]};
Object.assign(kitNeeds,{remember:e=>(e.echoN||0)<echoCap(),devour:e=>!e.devU});
const echoCap=()=>Math.max(0,HUNGER_ECHOES-(S.run&&S.run.crossed?1:0));
const hungerOf=()=>S.run?liveFoes().find(e=>e.hunger):null;
function hungerSetup(e){   // makeEnemy, for the abbey's boss: phase one of three (the move-set engine of game-boss-kits.js, without BOSS_KITS_ON)
  giveAbility(e,'erase'); e.hunger=1; hungerPhase(e,1,true); return e;
}
function hungerPhase(e,ph,quiet){
  const P=HUNGER_PH[ph]; e.ph=ph; e.kit=P.kit.slice(); e.kitIx=0; e.mvN=0; e.abil=e.kit[0]; e.charging=false; e.move=null;
  e.abilT=ph===1?BOSS_ABIL.erase.every-(e.fast||0):ph===2?1:2; e.twist=['','blank','remembered','lastentry'][ph];
  if(ph===1) e.imm='shad'; else delete e.imm;
  if(quiet) return;
  const r=S.run; log(e.name+' turns a page: '+P.name+'. '+P.desc,'bad'); sfx('phase'); moment(P.name,'bad'); tally('phases');
  if(ph===2){ e.p2d=S.army.filter(m=>m.hp<=0).length; unlockStory('abbey5',r); }
  if(ph===3){ r.p3n=0; if(e.p2d!=null&&S.army.filter(m=>m.hp<=0).length<=e.p2d&&!r.trial) tally('echoBreak'); }   /* Echo-Breaker: no minion fell in phase two */
}
function hungerTurn(b){   // bossRoomTurn2, every turn: the page turns at 60% and 30%, and the blank page drinks
  const r=S.run;
  if(b.ph===1&&b.hp<=b.maxHp*HUNGER_AT[0]) hungerPhase(b,2);
  else if(b.ph===2&&b.hp<=b.maxHp*HUNGER_AT[1]) hungerPhase(b,3);
  if(b.ph===1&&!(b.fireT>=r.turn-1)){ const h=Math.min(b.maxHp-b.hp,Math.round(b.maxHp*HUNGER_REGEN*blightK(b))); if(h>0){ b.hp+=h; log(b.name+' drinks the blank page and regains '+h+'.','bad'); } }
}
const hungerTaken=(e,d)=>e.hunger&&e.ph===2&&liveFoes().some(o=>o.echo)?Math.round(d*(1-HUNGER_DR)):d;   // bossTaken
function hungerHurt(e,d,ty){ if(e.hunger&&ty==='fire') e.fireT=S.run.turn; }   // bossHurt2
function hungerAct(){   // act(): one of your actions in the Last Entry; at six the book runs out
  const r=S.run, h=hungerOf(); if(!h||h.ph!==3) return;
  r.p3n=(r.p3n||0)+1;
  if(r.p3n>=HUNGER_ACTS){ h.hp=0; tally('bookOut'); log('The last line is written. The book runs out of pages, and the Hunger has nothing left to wear.','story'); moment('The book runs out','gold'); }
}
const STAND_INS=[['A plague-year dead','vanguard'],['A plague-year dead','striker'],['A plague-year dead','reaper']];
function echoEntries(){   // the Memorial's strongest names first (stand-ins for an empty Memorial)
  const L=(S.memorial||[]).slice().sort((a,b)=>(Math.min(ECHO_TIER_MAX,b.st|0)-Math.min(ECHO_TIER_MAX,a.st|0))||((b.lvl|0)-(a.lvl|0)));
  return L.length?L:STAND_INS.map(([nick,role])=>({nick,role,st:0,tr:[],kind:'Plague-Year Mourner',day:0,stand:1}));
}
function makeEcho(boss,en){
  const D=DUNGEONS[ABBEY], role=ROLES[en.role]?en.role:'striker', t=D.mobs.find(m=>m[1]===role)||D.mobs[0];
  const a=makeEnemy(ABBEY,Math.max(1,boss.lvl-2),false), st=Math.min(ECHO_TIER_MAX,en.st|0), s=mobStats(ABBEY,a.lvl,t[2],t[3],false,false), tr=(en.tr||[]).filter(x=>TRAITS[x]);
  const k=HUNGER_ECHO*stageMul({stage:st},'hp')*(tr.includes('thick')?1.25:1), ka=HUNGER_ECHO*stageMul({stage:st},'atk')*(tr.includes('vicious')?1.2:1)*(tr.includes('unmarred')?1.15:1);
  Object.assign(a,{name:'Echo of '+en.nick,base:'Memorial Echo',role,hf:t[2],af:t[3],elite:false,maxHp:Math.max(1,Math.round(s.hp*k)),atk:Math.max(1,Math.round(s.atk*ka)),echo:{kind:en.kind||'',day:en.day|0,bd:en.bd||null,tr}});
  a.hp=a.maxHp; delete a.hx; return a;
}
function callEchoes(e){
  const r=S.run, used=new Set(r.enemies.filter(o=>o.echo).map(o=>o.name)), cap=echoCap(), got=[];
  for(const en of echoEntries()){
    if((e.echoN||0)>=cap||liveFoes().length>=6) break;
    if(r.crossed&&en.nick===r.crossed.nick||(!en.stand&&used.has('Echo of '+en.nick))) continue;
    const a=makeEcho(e,en); if(a.role==='mender'&&liveFoes().some(x=>x.role==='mender')) a.role='striker';
    foeScale([a],foeAtkMul(ABBEY)); heatScale([a]); foeRise([a]); r.enemies.push(a); e.echoN=(e.echoN||0)+1; used.add(a.name); got.push(a);
  }
  log(got.length?e.name+' reads from your Memorial: '+got.map(x=>x.name.replace(/^Echo of /,'')).join(', ')+' stand'+(got.length>1?'':'s')+' again, in gold ink.':e.name+' reaches into the Memorial, but no one more answers.','bad');
}
function echoFades(e){   // checkDeaths: an echo leaves no body, no loot and no study
  e.dead=true; bossFoeDies(e); log(e.name+' fades back into the Memorial.','ok'); fxe('death',e);
}
function fireKitMove3(e,mv){   // the Hunger's moves (fireKitMove2 hands on what it does not know)
  const r=S.run, P=S.player;
  if(mv==='erase'){ const w=P.shield>0; P.shield=0; let what='';
    if(r.frenzy>0){ r.frenzy=0; what='Unholy Frenzy'; } else if(S.army.some(m=>m.mw>0)){ S.army.forEach(m=>{ delete m.mw; }); what='your Bone Shields'; }
    log(e.name+' erases '+[w?'your Bone Ward':'',what].filter(Boolean).join(' and ')+(w||what?'.':' nothing: you held no blessing.'),w||what?'bad':'ok'); }
  else if(mv==='hollow'){ let tot=0; allies().filter(hittable).forEach(a=>{ tot+=bossHit(e,a,.55,'shad',mv); }); log(e.name+' sings a Hollow Hymn over your side for '+tot+'.','bad'); }
  else if(mv==='hunger'){ const t=strongestMinion()||P, d=bossHit(e,t,1.3,'shad',mv), h=Math.min(e.maxHp-e.hp,Math.round(e.maxHp*HUNGER_HEAL*blightK(e))); e.hp+=h; log(e.name+' feeds on '+(t.id==='p'?'you':nameOf(t))+' for '+d+' and mends '+h+'.','bad'); }
  else if(mv==='remember') callEchoes(e);
  else if(mv==='readaloud'){ const m=readable(), t=m&&readAloud(e,m); if(t){ m.readBy='fight'; log(e.name+' reads '+m.nick+'\'s '+TRAITS[t].name+' aloud. '+m.nick+' forgets it for this fight.','bad'); } else { const w=strongestMinion(); if(w) addSt(w,'hexed',2); log(e.name+' reads aloud, but finds no trait to take'+(w?': '+w.nick+' is Hexed instead':'')+'.','bad'); } }
  else if(mv==='writename'){ if(P.shield>0){ P.shield=0; log('The pen comes down on your Bone Ward and breaks it instead of you.','ok'); }
    else { const d=Math.max(0,P.hp-1); S.run.blow=blowNote({n:e.name,k:'sig',mv}); P.hp-=d; if(d){ mark('p',d,0); r.hurt=true; } fxe('hurt',P,{crit:1}); log(e.name+' writes your name. You drop to 1 HP.','bad'); } }
  else if(mv==='devour'){ e.devU=1; const m=strongestMinion();
    if(!m) log(e.name+' reaches for the margin, but no minion stands in it.','ok');
    else if(r.guard===r.turn&&guardFront()){ const g=guardFront(); delete r.guard; const d=bossHit(e,g,1.5,'shad',mv); log(g.nick+' plants itself in the margin. '+e.name+' bites it for '+d+' and swallows nothing.','ok'); }
    else { m.hp=0; fxe('death',m); log(e.name+' devours '+m.nick+' from the margin.','bad'); } }
  else return false;
  return true;
}
function hungerChip(e){   // the boss card: its page, and what counts down
  if(!e.hunger) return ''; const r=S.run;
  return ' &middot; <span class="kit" title="Its pages: 100% to '+Math.round(HUNGER_AT[0]*100)+'% The Blank Page, to '+Math.round(HUNGER_AT[1]*100)+'% The Remembered, then The Last Entry.">Page '+e.ph+'/3</span>'
    +(e.ph===3?' &middot; <span class="kit" title="'+HUNGER_PH[3].desc+'">The book: '+(r.p3n||0)+'/'+HUNGER_ACTS+'</span>':'')+(e.ph===2&&liveFoes().some(o=>o.echo)?' &middot; <span class="kit" title="'+HUNGER_PH[2].desc+'">Echoes guard it</span>':'');
}
const hungerKitTxt=()=>[1,2,3].map(p=>'Page '+p+', '+HUNGER_PH[p].name+': '+HUNGER_PH[p].kit.map(m=>BOSS_ABIL[m].name).join(' · ')+'. '+HUNGER_PH[p].desc).join(' ');
// ----- the torn pages only the abbey keeps
LORE_PAGES.push(
  {t:'The rest of the margin',m:'Oswin kept writing after the drowning. The water did not stop him; it only slowed the ink. On the abbey walls, under the silt, the margin of the first page goes on for a hundred feet: names, and between the names, apologies.',abbey:1},
  {t:'What the river pushed',m:'The river did not change its course. Oswin pushed it. He meant to drown the book, and he chained it to his own wrist so it could not float free. It was the bravest thing he ever did, and it did not work: the book breathed water as easily as air.',abbey:1},
  {t:'The last entry',m:'The last line in Oswin\'s hand is not a name. It reads: There is something under the book. It is not the dead. It is the wanting. I gave it a shape so it could be written, and now it wears whatever it reads. Whoever comes after me: do not let it read you.',abbey:1}
);
const abbeyPage=n=>!!(LORE_PAGES[n]&&LORE_PAGES[n].abbey);   // nextPage: pages 21-23 are found only in Vane Abbey
// ----- Act VI
STORY.push(
  {act:6,id:'abbey0',t:'A door in the water',when:()=>throneDown(),m:'With the Throne of Ash fallen, the river under the drowned chapel has gone quiet, and in the quiet you can see what it was hiding: a door, set into the riverbed, bound in chain and green with two hundred years of silt. There are two locks on it. The Ledger turned to its first page when you saw it, and would not turn back.'},
  {act:6,id:'abbey1',t:'Two keys',when:()=>throneDown()&&(((S.tower&&S.tower.best)||0)>=ABBEY_TOWER||(S.pages||0)>=ABBEY_PAGES||mastersSlain()>=3),m:'The two locks on the drowned door are not the same. One is shaped like a stair that goes on forever, and a page torn twenty times. The other is shaped like six old crowns. The book does not mind which key you bring. It only wants you to come home.'},
  {act:6,id:'abbey2',t:'The river turns back',when:()=>abbeyOpen(),m:'At dawn the river ran backwards for the length of a held breath, and the chain on the drowned door slid off into the dark. Below the chapel the water stands aside like a servant. There are steps. They are dry. Someone has swept them.'},
  {act:6,id:'abbey3',t:'Oswin\'s cell',m:'His cell is exactly as the pages said: a desk, a candle that has not burned down in two hundred years, and an empty chain bolted to the wall at the height of a seated man\'s wrist. The ink on the desk is still wet. Something has been writing here, very slowly, for a very long time.'},
  {act:6,id:'abbey4',t:'The Scriptorium',m:'Rows of desks under the water, and at every desk a scribe who never stopped. They do not look up. The Ledger opens on its own to the page of your dead, and a pen is laid beside it. The scribes wait to see whether you will strike a name out. It has not been done here in two hundred years.'},
  {act:6,id:'abbey5',t:'What the book wore',m:'It has no face of its own, so it wore theirs. Your dead, the ones the Ledger kept for you: it read them out one by one and they stood up in gold ink, wearing the shape you remembered and looking at you as if they did not know your name. That is what the Hunger is. It is the remembering, with nothing behind it.'},
  {act:6,id:'g6',t:'The last entry',m:'The Hunger came apart the way a sentence does when you stop reading it. Where it stood there is only the Ledger, open to its last page, and the last page is blank. Oswin wanted no one forgotten. The thing under the book wanted to be everyone. Now the pen is in your hand, and for the first time since the drowned chapel, the book is waiting for you instead of the other way round.'}
);
['abbey0','abbey1','abbey2','abbey3','abbey4','abbey5','g6'].forEach(id=>{ STORY_BY[id]=STORY.find(s=>s.id===id); });
ACTS[6]='Act VI · The seventh gate';
BOSS_LINES['The Hunger']=['You brought me so many names. Let me read them back to you.','There... are no more pages...'];
PHASE_LINES['The Hunger']='Every name you ever wrote, I can wear.';
