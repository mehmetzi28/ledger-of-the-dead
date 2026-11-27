// ===== ASCENSION, R10 PR A: New Game+ cycles become ascension levels with rules =====
// Every New Game+ cycle is an ascension level (S.ngp). Foes grow +15% a level (NGP_FOE, was +30%) and the difficulty comes
// from rules instead: starting a cycle, you pick one rule from three drawn (ascOffer, from a hash of the level, so the offer
// does not change while you think), and every rule you have picked stays for every later cycle (S.asc.rules: the valley
// remembers). Each rule makes one thing harder and pays for it in its own coin. All hooks read ascOn(), so a first cycle and
// the balance bots (which never begin New Game+) play exactly as before.
const ASC_OFFER=3, ASC_BOSS_HEART=1, ASC_ELITE_DROP=1.25, ASC_RAISE_COST=1.2, ASC_RAISE=5, ASC_XP=.15, ASC_DREAD=60, ASC_DREAD_REST=50, ASC_SIEGE=1.25,
  ASC_TETHER=.6, ASC_ARMY_HP=1.1, ASC_OMEN=.4, ASC_OMEN_PAY=.1, ASC_SECRET=2, ASC_SECRET_HP=1.25, ASC_BIND=.25, ASC_SHATTER=10, ASC_STOCK=2, ASC_HF=.8,
  ASC_READ=.8, ASC_READ_XP=2, ASC_CROWD_DROP=1.2, ASC_POT_PRICE=2, ASC_POT_HEAL=1.25, ASC_ULT=1.25,
  ASC_KIT2=['pack','stance','thief','bomb','sapper','skirm','thorns','frenzy','hexer','banner'],   /* Kits Plus: kits that act through hasKit alone, so a second one needs no intent of its own */
  RW_HP=1.15, RW_TRO=2, CARRY_RB=.5, CARRY_HF=.7, CARRY_BUILD=2;
const ASC_HARSH=['bloodmoon','ashfall','ironrain'];
const ASC_RULES={
  twofaces:  {name:'Two Faces',        desc:'Every gate boss starts in its second phase.',                              rew:'Each gate boss leaves one heart more.'},
  elitedoors:{name:'Elite Doors',      desc:'Every fork in a gate has an elite door.',                                  rew:'Elite rooms drop gear 25% more often.'},
  hungry:    {name:'Hungry Ledger',    desc:'Raising costs 20% more mana.',                                             rew:'+5 raise chance.'},
  noretreat: {name:'No Retreat',       desc:'No Instant Retry after a lost room.',                                      rew:'+15% XP and gold.'},
  coldtown:  {name:'Cold Town',        desc:'The town\'s dread starts the cycle at 60 and drifts toward 50.',           rew:'Sieges pay 25% more gold.'},
  thintether:{name:'Thin Tether',      desc:'The Soul Tether lets a blow take up to 60% of your max HP, not 50%.',      rew:'Your minions have 10% more HP.'},
  blackomens:{name:'Black Omens',      desc:'Omens come on 40% of days, and only Blood Moon, Ashfall and Iron Rain.',   rew:'+10% XP and gold.'},
  wandering: {name:'Wandering Masters',desc:'Secret masters appear twice as often and have 25% more HP.',               rew:'Each leaves one heart more.'},
  deepscars: {name:'Deep Scars',       desc:'A downed minion binds back at 25% HP, not 40%.',                           rew:'Minions shatter 10 points less often.'},
  ironmarket:{name:'Iron Market',      desc:'The market stocks two pieces of gear a day, not four.',                    rew:'Heart-forging costs 20% less gold.'},
  bookhungers:{name:'The Book Hungers',desc:'Each run the Ledger reads one of your minions: it deals 20% less damage.',  rew:'That minion earns double XP in the run.'},
  crowded:   {name:'Crowded Gates',    desc:'One more foe in every gate room.',                                         rew:'Gear drops 20% more often in the gates.'},
  bloodprice:{name:'Blood Price',      desc:'Potions cost twice as much.',                                              rew:'Potions heal and restore 25% more.'},
  kitsplus:  {name:'Kits Plus',        desc:'Ordinary gate foes carry a second kit, taken from another kind of their gate.', rew:'Every second kill of a two-kit foe counts twice in the bestiary.'},
  fewsouls:  {name:'Heavy Souls',      desc:'An ultimate needs one Soul more.',                                         rew:'Ultimates are 25% stronger.'}
};
const ASC_IDS=Object.keys(ASC_RULES);
const ascRules=()=>(S&&S.asc&&Array.isArray(S.asc.rules)?S.asc.rules:[]).filter(k=>ASC_RULES[k]);
const ascOn=k=>!!S&&S.ngp>0&&ascRules().includes(k);
const ascLvl=()=>(S&&S.ngp)||0;
const ascNext=()=>S&&S.ending?S.ending.k:null;   // the ending that sets the next cycle: 'closed' the Quiet Valley, 'kept' the Keeper's Cycle (game-abbey.js)
const ascPicks=()=>ascNext()==='closed'?0:ascNext()==='kept'?2:1;   // the Quiet Valley draws no rule; the Keeper's Cycle takes two
const carryN=()=>ascNext()==='closed'?2:1;   // the Quiet Valley's carry choice is free: two
function ascOffer(){   // three rules not yet chosen (four when two are picked), fixed for the next level
  if(!ascPicks()) return [];
  const L=ASC_IDS.filter(k=>!ascRules().includes(k)), out=[], n=ascLvl()+1;
  for(let i=0;i<ASC_OFFER+ascPicks()-1&&L.length;i++) out.push(L.splice(dayHash(n,ascRules().length,i,401)%L.length,1)[0]);
  return out;
}
function ascStart(keep,rule,carry){   // startNGP, before newGame: the chosen rules join the ones the valley remembers; the carries are packed
  const R=ascRules().slice(), off=ascOffer(), want=(Array.isArray(rule)?rule:rule?[rule]:[]).filter((k,i,a)=>off.includes(k)&&a.indexOf(k)===i).slice(0,ascPicks());
  R.push(...want);
  keep.asc={rules:R,rwP:S.asc&&S.asc.rw?S.asc.rw.g:null,kp:0};
  keep.carryPack=carryPack(carry); return keep;
}
function ascBegin(){   // after newGame in startNGP
  if(ascOn('coldtown')) S.dread=ASC_DREAD;
  S.ti=S.ti||{}; for(const k of ascRules()){ S.ti['asc_'+k]=1; }
  carryApply(S.carryPack); delete S.carryPack;
  rwPick();
}
// ----- carries (R10 PR B): besides the unique, one more thing crosses into the new cycle (two into the Quiet Valley)
// trait:<t> goes to the cycle's first raise; build:<k> starts that building at level 2; item:<u> a Riftborn piece at half
// its depth or a heartforged piece with its lines at 70%.
function carryOpts(){
  const out=[], seen=new Set();
  for(const m of S.army.concat(S.reserve||[])) for(const t of (m.traits||[])) if(TRAITS[t]&&!seen.has(t)){ seen.add(t); out.push({k:'trait:'+t,kind:'trait',name:TRAITS[t].name,desc:'Your first raise of the cycle rises with '+TRAITS[t].name+' (from '+m.nick+').'}); }
  for(const k of Object.keys(BUILD)) if(((S.build&&S.build[k])||0)>=CARRY_BUILD) out.push({k:'build:'+k,kind:'build',name:BUILD[k].name,desc:'The '+BUILD[k].name+' stands at level '+CARRY_BUILD+' from the first day.'});
  for(const it of S.inv.concat(Object.values(S.equip))) if(it&&(it.rb||it.hf)&&ITEM[it.id]) out.push({k:'item:'+it.u,kind:it.rb?'rb':'hf',name:ITEM[it.id].name,desc:it.rb?'This Riftborn piece crosses at depth '+Math.max(1,Math.floor(it.rb.d*CARRY_RB))+' (now '+it.rb.d+').':'This heartforged piece crosses with its lines at '+Math.round(CARRY_HF*100)+'%.'});
  return out;
}
function carryPack(carry){   // the chosen carries, taken out of the old save
  const want=(Array.isArray(carry)?carry:carry?[carry]:[]), ok=carryOpts().map(o=>o.k), pack=[];
  for(const k of want) if(ok.includes(k)&&!pack.some(p=>p.k===k)&&pack.length<carryN()){
    const [kind,v]=[k.slice(0,k.indexOf(':')),k.slice(k.indexOf(':')+1)];
    if(kind==='item'){ const it=findItem(+v); if(!it) continue; const c=JSON.parse(JSON.stringify(it)); if(c.rb) delete c.rb.a; pack.push({k,it:c}); }
    else pack.push({k});
  }
  return pack;
}
function carryApply(pack){   // after newGame: unpack the carries into the new cycle
  if(!Array.isArray(pack)) return; const got=[];
  for(const p of pack){ const k=p.k, kind=k.slice(0,k.indexOf(':')), v=k.slice(k.indexOf(':')+1);
    if(kind==='trait'&&TRAITS[v]){ S.asc.ct=v; got.push(TRAITS[v].name+' waits for your first raise'); }
    else if(kind==='build'&&BUILD[v]){ S.build=S.build||{}; S.build[v]=Math.max(S.build[v]||0,CARRY_BUILD); got.push('the '+BUILD[v].name+' stands at level '+CARRY_BUILD); }
    else if(kind==='item'&&p.it&&ITEM[p.it.id]){ const it=p.it; it.u=++S.uid;
      if(it.rb) it.rb.d=Math.max(1,Math.floor(it.rb.d*CARRY_RB));
      if(it.hf&&Array.isArray(it.ro)) it.ro=it.ro.map(([l,x])=>[l,typeof x!=='number'?x:Number.isInteger(x)?Math.max(1,Math.round(x*CARRY_HF)):Math.round(x*CARRY_HF*1000)/1000]);
      delete it.aw; S.inv.push(it); got.push(ITEM[it.id].name+' is in your bag'); }
  }
  if(got.length){ tally('carried'); notify('Carried into the new cycle: '+got.join('; ')+'.','ok'); }
}
function carryTrait(m){ const t=S.asc&&S.asc.ct; if(!t||!TRAITS[t]||!m) return; if(!m.traits.includes(t)) m.traits.push(t); delete S.asc.ct; return t; }   // tryRaise: the cycle's first raise
// ----- valley rewrites (R10 PR B): every ascension cycle but the Quiet Valley writes over one gate (never the same twice in
// a row). Its boss returns in Ledger form (phase two from the start, hearts paid twice) with a move borrowed from another gate's
// boss; two of its kinds come back as Ink-Wet variants with another kit, 15% more HP and twice the trophies. S.asc.rw =
// {g, foes:[kind,kind], kits:[kit,kit], mv, seen, clr}.
function rwPick(){
  if(!S.asc||!(S.ngp>0)||S.cycle==='quiet') return; const n=S.ngp, prev=S.asc.rwP;
  const L=[...Array(GATE_N).keys()].filter(i=>i!==prev&&i!==S.ledgerBoss); const g=L[dayHash(n,prev==null?9:prev,0,403)%L.length];
  const kinds=DUNGEONS[g].mobs.map(x=>x[0]).filter(k=>KIT_OF[k]), a=kinds.splice(dayHash(n,g,1,403)%kinds.length,1)[0], b=kinds[dayHash(n,g,2,403)%kinds.length];
  const kit=(k,i)=>{ const K=KIT_IDS.filter(x=>x!==KIT_OF[k]&&x!=='call'); return K[dayHash(n,g,3+i,403)%K.length]; };
  const mv=GATE_ABIL.filter((x,i)=>i!==g); S.asc.rw={g,foes:[a,b],kits:[kit(a,0),kit(b,1)],mv:mv[dayHash(n,g,5,403)%mv.length],seen:0,clr:0};
  notify('The Ledger has written over '+DUNGEONS[g].name+'. Its boss waits in Ledger form with a borrowed move, and two of its kinds have changed.','story');
}
const rwGate=()=>S&&S.ngp>0&&S.asc&&S.asc.rw?S.asc.rw.g:-1;
const rwRun=r=>!!r&&r.di===rwGate()&&ascGateRun(r)&&!r.sweep;
function rwRoom(list,di){   // spawnRoom, after ledgerRoom: the rewritten gate
  const r=S.run, W=S.asc&&S.asc.rw; if(!W||!rwRun(r)) return;
  for(const e of list){
    if(e.boss&&!e.secret&&!e.rival&&!e.guard&&e.base===DUNGEONS[di].boss[0]&&!e.rw){ e.rw=1; e.ledger=1; e.name=e.name.replace(/^The /,'')+', Written Over';
      if(e.abil&&!e.phase2){ e.phase2=true; e.fast=(e.fast||0)+1; e.alt=true; e.abilT=Math.min(e.abilT,2); bossTwist(e); }
      if(Array.isArray(e.kit)&&BOSS_ABIL[W.mv]&&!e.kit.includes(W.mv)) e.kit.push(W.mv); }
    else if(!e.boss&&!e.rw){ const i=W.foes.indexOf(e.base); if(i<0) continue; e.rw=1; e.rwv=1; e.name='Ink-Wet '+e.name; e.kitO=W.kits[i]; e.maxHp=e.hp=Math.round(e.maxHp*RW_HP); }
  }
}
function rwEnter(r){   // startRun: the passage on the cycle's first entry
  const W=S.asc&&S.asc.rw; if(!W||W.seen||!rwRun(r)) return; W.seen=1; unlockStory('rewritten');
  log('The page was written over. '+DUNGEONS[r.di].name+' is not the place you remember.','story');
}
function rwCleared(r){ const W=S.asc&&S.asc.rw; if(!W||W.clr||!rwRun(r)) return; W.clr=1; tally('rewritten'); notify('You cleared the rewritten '+DUNGEONS[r.di].name+'.','ok'); }   // gateCleared
const rwTro=e=>e&&e.rwv?RW_TRO:1;   // killLoot
// ----- Kits Plus and Heavy Souls
function ascKits(list){   // buildRoom: Kits Plus gives ordinary gate foes a second kit from their gate's kinds
  const r=S.run; if(!ascOn('kitsplus')||!ascGateRun(r)||!DUNGEONS[r.di]) return;
  const pool=[...new Set(DUNGEONS[r.di].mobs.map(x=>KIT_OF[x[0]]).filter(k=>ASC_KIT2.includes(k)))];
  for(const e of list){ const K=kitOf(e); if(!K||e.kit2) continue; const L=pool.filter(k=>k!==K); if(L.length) e.kit2=L[dayHash(S.runs,r.room,kitNum(e),405)%L.length]; }
}
function ascStudy(e){ if(!e||!e.kit2||!ascOn('kitsplus')) return 0; S.asc.kp=(S.asc.kp||0)+1; return S.asc.kp%2===0?1:0; }   // studyFoe: every second kill counts twice
const ultCost=()=>SOUL_MAX+(ascOn('fewsouls')?1:0);
const ascUlt=()=>ascOn('fewsouls')?ASC_ULT:1;
const ascGateRun=r=>!!r&&!r.tw&&!r.rift&&!r.trial&&!r.siege&&!r.rg&&!r.rk;
// the rules' hooks
function ascRoom(list){   // buildRoom: Two Faces
  const r=S.run; if(!ascOn('twofaces')||!ascGateRun(r)) return;
  for(const e of list) if(e.boss&&!e.secret&&!e.rival&&!e.guard&&e.abil&&!e.phase2){ e.phase2=true; e.fast=(e.fast||0)+1; e.alt=true; e.abilT=Math.min(e.abilT,2); bossTwist(e); e.asc2=1; }
}
const ascHearts=e=>(e.boss&&!e.secret&&!e.rival&&e.asc2?ASC_BOSS_HEART:0)+(e.secret&&ascOn('wandering')?ASC_BOSS_HEART:0);   // killLoot: hearts more
const ascExtra=()=>ascOn('crowded')&&ascGateRun(S.run)?1:0;   // buildRoom
function ascDoors(r,out){ if(!ascOn('elitedoors')||out.includes('elite')||out.includes('boss')||out.includes('script')) return out; if(out.length>1) out[out.length-1]='elite'; else out.push('elite'); return out; }   // rollDoors
const ascDrop=()=>(ascOn('elitedoors')&&roomKind()==='elite'?ASC_ELITE_DROP:1)*(ascOn('crowded')&&ascGateRun(S&&S.run)?ASC_CROWD_DROP:1);   // the drop chance
const ascRaiseCost=()=>ascOn('hungry')?ASC_RAISE_COST:1;
const ascRaise=()=>ascOn('hungry')?ASC_RAISE:0;
const ascRetry=()=>!ascOn('noretreat');   // canRetry
const ascReward=()=>1+(ascOn('noretreat')?ASC_XP:0)+(ascOn('blackomens')?ASC_OMEN_PAY:0);   // ngpReward: XP and gold
const ascDreadRest=()=>ascOn('coldtown')?ASC_DREAD_REST:null;
const ascSiege=()=>ascOn('coldtown')?ASC_SIEGE:1;
const ascTether=()=>ascOn('thintether')?ASC_TETHER:TETHER;
const ascArmyHp=()=>ascOn('thintether')?ASC_ARMY_HP:1;
const ascOmen=()=>ascOn('blackomens')?(Math.random()<ASC_OMEN?pick(ASC_HARSH):null):undefined;   // dayOmen: undefined leaves the dawn as it was
const ascSecret=()=>ascOn('wandering')?ASC_SECRET:1;
const ascSecretHp=()=>ascOn('wandering')?ASC_SECRET_HP:1;
const ascBind=()=>ascOn('deepscars')?ASC_BIND:BIND_HP;
const ascShatter=()=>ascOn('deepscars')?ASC_SHATTER:0;
const ascStock=()=>ascOn('ironmarket')?ASC_STOCK:STOCK_N;
const ascHf=()=>ascOn('ironmarket')?ASC_HF:1;
const ascPotPrice=()=>ascOn('bloodprice')?ASC_POT_PRICE:1;
const ascPotHeal=()=>ascOn('bloodprice')?ASC_POT_HEAL:1;
function ascRead(r){   // startRun: the Book Hungers reads one minion
  if(!ascOn('bookhungers')||!ascGateRun(r)) return; const L=S.army.filter(m=>!m.thrall); if(!L.length) return;
  const m=L[Math.floor(Math.random()*L.length)]; r.read=m.uid; syncMinion(m); log('The Ledger reads '+m.nick+'. It fights at '+Math.round(ASC_READ*100)+'% this run, and learns twice as fast.','story');
}
const ascReadK=m=>S&&S.run&&m&&S.run.read===m.uid?ASC_READ:1;   // extraMul (attack)
const ascReadXp=(r,m)=>r&&r.read===m.uid?ASC_READ_XP:1;   // roomWon
function ascFix(g){   // normalizeSave
  if(!g.asc||typeof g.asc!=='object'||Array.isArray(g.asc)){ delete g.asc; return; }
  const o=g.asc, n=(v,d)=>typeof v==='number'&&isFinite(v)?Math.floor(v):d;
  g.asc={rules:Array.isArray(o.rules)?o.rules.filter((k,i,a)=>ASC_RULES[k]&&a.indexOf(k)===i):[],kp:Math.max(0,n(o.kp,0))};
  if(Number.isInteger(o.rwP)&&o.rwP>=0&&o.rwP<GATE_N) g.asc.rwP=o.rwP;
  if(typeof o.ct==='string'&&TRAITS[o.ct]) g.asc.ct=o.ct;
  const W=o.rw; if(W&&typeof W==='object'&&Number.isInteger(W.g)&&W.g>=0&&W.g<GATE_N&&Array.isArray(W.foes)&&W.foes.length===2&&W.foes.every(k=>KIT_OF[k])&&Array.isArray(W.kits)&&W.kits.length===2&&W.kits.every(k=>KITS[k])&&BOSS_ABIL[W.mv])
    g.asc.rw={g:W.g,foes:W.foes.slice(),kits:W.kits.slice(),mv:W.mv,seen:W.seen?1:0,clr:W.clr?1:0};
}
STORY.push({act:6,id:'rewritten',t:'The page was written over',when:()=>false,m:'You knew this gate. You had its turns by heart, the drip of it, the place the floor gave. The Ledger knew it too, and it has written over the page: the same walls in a wetter ink, the same dead with new habits, and its master waiting in the shape the book remembers best. Nothing here is a mistake. The book is practising.'});
STORY_BY.rewritten=STORY.find(x=>x.id==='rewritten');
