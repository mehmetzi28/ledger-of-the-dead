// ===== ASCENSION, R10 PR A: New Game+ cycles become ascension levels with rules =====
// Every New Game+ cycle is an ascension level (S.ngp). Foes grow +15% a level (NGP_FOE, was +30%) and the difficulty comes
// from rules instead: starting a cycle, you pick one rule from three drawn (ascOffer, from a hash of the level, so the offer
// does not change while you think), and every rule you have picked stays for every later cycle (S.asc.rules: the valley
// remembers). Each rule makes one thing harder and pays for it in its own coin. All hooks read ascOn(), so a first cycle and
// the balance bots (which never begin New Game+) play exactly as before.
const ASC_OFFER=3, ASC_BOSS_HEART=1, ASC_ELITE_DROP=1.25, ASC_RAISE_COST=1.2, ASC_RAISE=5, ASC_XP=.15, ASC_DREAD=60, ASC_DREAD_REST=50, ASC_SIEGE=1.25,
  ASC_TETHER=.6, ASC_ARMY_HP=1.1, ASC_OMEN=.4, ASC_OMEN_PAY=.1, ASC_SECRET=2, ASC_SECRET_HP=1.25, ASC_BIND=.25, ASC_SHATTER=10, ASC_STOCK=2, ASC_HF=.8,
  ASC_READ=.8, ASC_READ_XP=2, ASC_CROWD_DROP=1.2, ASC_POT_PRICE=2, ASC_POT_HEAL=1.25;
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
  bloodprice:{name:'Blood Price',      desc:'Potions cost twice as much.',                                              rew:'Potions heal and restore 25% more.'}
};
const ASC_IDS=Object.keys(ASC_RULES);
const ascRules=()=>(S&&S.asc&&Array.isArray(S.asc.rules)?S.asc.rules:[]).filter(k=>ASC_RULES[k]);
const ascOn=k=>!!S&&S.ngp>0&&ascRules().includes(k);
const ascLvl=()=>(S&&S.ngp)||0;
function ascOffer(){   // three rules not yet chosen, fixed for the next level
  const L=ASC_IDS.filter(k=>!ascRules().includes(k)), out=[], n=ascLvl()+1;
  for(let i=0;i<ASC_OFFER&&L.length;i++) out.push(L.splice(dayHash(n,ascRules().length,i,401)%L.length,1)[0]);
  return out;
}
function ascStart(keep,rule){   // startNGP: the chosen rule joins the ones the valley remembers
  const R=ascRules().slice(); if(rule&&ascOffer().includes(rule)) R.push(rule);
  keep.asc={rules:R}; return keep;
}
function ascBegin(){   // after newGame in startNGP
  if(ascOn('coldtown')) S.dread=ASC_DREAD;
  for(const k of ascRules()){ S.ti['asc_'+k]=1; }
}
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
  g.asc={rules:Array.isArray(g.asc.rules)?g.asc.rules.filter((k,i,a)=>ASC_RULES[k]&&a.indexOf(k)===i):[]};
}
