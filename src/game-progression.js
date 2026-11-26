// ===== MASTERY PATHS AND CAPSTONES =====
// Every skill belongs to one of four paths. From level CAP_LV1 the path with the most skill points spent (at least CAP_MIN)
// grants its first capstone, and from CAP_LV2 its second as well. Read live from the skills, so forgetting skills in town
// recomputes it. A tie goes to the path the player chose on the Skills tab (S.player.capPath), else the first in PATHS order.
const CAP_LV1=30, CAP_LV2=50, CAP_MIN=10;
const PATHS={
  bone:{name:'Bone',skills:['spear','bonearmor','calcify','mastery','thrift']},
  blood:{name:'Blood',skills:['mend','gravepact','sanguine','frenzy','reap']},
  frost:{name:'Frost',skills:['chill','soulwell','deathless','scholar']},
  rot:{name:'Rot',skills:['blast','curse','edge','robber']}
};
const CAP_WARD=.08, CAP_THORNS=.2, CAP_FEED=.5, CAP_COV=.03, CAP_RIME=1.15, CAP_WINTER=.4, CAP_FESTER=.3, CAP_BLOOM=.12;
const capPct=v=>Math.round(v*100)+'%';
const CAPS={
  bone1:{path:'bone',name:'Ossuary Ward',desc:()=>'Each room or floor begins with a Ward of '+capPct(CAP_WARD)+' of your max HP.'},
  bone2:{path:'bone',name:'Barbed Ossuary',desc:()=>'That Ward is doubled, and you have Thorns: foes that hit you take '+capPct(CAP_THORNS)+' of the damage back.'},
  blood1:{path:'blood',name:'Blood Tithe',desc:()=>'Healing beyond your max HP is not lost: '+capPct(CAP_FEED)+' of it heals your most wounded minion.'},
  blood2:{path:'blood',name:'Sanguine Covenant',desc:()=>'Every foe that falls heals you and each minion for '+capPct(CAP_COV)+' of max HP.'},
  frost1:{path:'frost',name:'Rime',desc:()=>'Frozen foes take '+capPct(CAP_RIME-1)+' more damage from every source.'},
  frost2:{path:'frost',name:'Deep Winter',desc:()=>'A foe that loses its turn to the frost takes '+capPct(CAP_WINTER)+' of your Siphon, ignoring armor, and is Chilled for 2 turns. It never finishes a foe.'},
  rot1:{path:'rot',name:'Festering',desc:()=>'Poison, blight and other wounds ticking on your foes heal you for '+capPct(CAP_FESTER)+' of the damage they deal.'},
  rot2:{path:'rot',name:'Plague Bloom',desc:()=>'A foe that falls spills its rot: every other foe is poisoned for '+capPct(CAP_BLOOM)+' of your Siphon a turn for 3 turns.'}
};
const pathOf=id=>Object.keys(PATHS).find(p=>PATHS[p].skills.includes(id))||null;
const pathPts=p=>PATHS[p].skills.reduce((n,id)=>n+sk(id),0);
function capTied(){   // the paths sharing the lead, if the lead is enough for a capstone
  const k=Object.keys(PATHS), best=Math.max(...k.map(pathPts));
  return best<CAP_MIN?[]:k.filter(p=>pathPts(p)===best);
}
function capPath(){
  const P=S&&S.player; if(!P||!P.skills||P.lvl<CAP_LV1) return null;
  const t=capTied(); return t.includes(P.capPath)?P.capPath:(t[0]||null);
}
const capsOn=()=>{ const p=capPath(); return p?[p+'1'].concat(S.player.lvl>=CAP_LV2?[p+'2']:[]):[]; };
const capOn=id=>capsOn().includes(id);
function choosePath(p){ if(!PATHS[p]||S.mode==='battle') return false; S.player.capPath=p; return true; }
// ----- capstone hooks, called from the shared combat code
function capOverheal(over){   // Blood Tithe (from healAlly, when you are overhealed)
  if(!capOn('blood1')) return;
  const m=S.army.filter(x=>x.hp>0&&x.hp<x.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
  if(m) healAlly(m,Math.round(over*CAP_FEED));
}
function capKill(e){   // Sanguine Covenant and Plague Bloom (from checkDeaths, once per kill)
  if(capOn('blood2')) for(const a of allies()) if(a.hp>0) healAlly(a,Math.round((a.id==='p'?pMax():a.maxHp)*CAP_COV));
  if(capOn('rot2')) for(const o of liveFoes()) if(o!==e) addDot(o,'poison',pSiph()*CAP_BLOOM,3);
}
function capFester(d){ if(d>0&&capOn('rot1')) healAlly(S.player,Math.round(d*CAP_FESTER)); }   // Festering (from tickDots)
function progRoom(){   // a fresh room or floor (from roomStart): Ossuary Ward
  if(capOn('bone1')){ const P=S.player; P.shield=Math.max(P.shield||0,Math.round(pMax()*CAP_WARD*(capOn('bone2')?2:1))); }
}
function progFoes(list){ for(const e of list){ if(pactOn('hides')) e.maxHp=e.hp=Math.round(e.maxHp*(1+PACT_HP)); if(pactOn('claws')) e.atk=Math.max(1,Math.round(e.atk*(1+PACT_ATK))); } }   // from foeRise: every foe, summoned ones too
function progTick(){   // end of each turn (from skillTick): Deep Winter and the Knitting Flesh pact
  const r=S.run; if(!r||!r.enemies) return;
  if(capOn('frost2')) for(const e of liveFoes()) if(e.froze!=null&&e.froze===r.turn-1&&e.capW!==e.froze){ e.capW=e.froze;
    const d=Math.min(e.hp-1,hit(pSiph()*CAP_WINTER*pierceMul(1))); if(d>0) hurtFoe(e,d,'frost'); addSt(e,'chilled',2); }
  if(pactOn('regen')) for(const e of liveFoes()) if(e.hp<e.maxHp){ const h=Math.min(e.maxHp-e.hp,Math.round(e.maxHp*PACT_REGEN*blightK(e))); if(h>0){ e.hp+=h; mark(e,0,h); } }
}

// ===== NEW GAME+ PACTS =====
// Chosen when New Game+ begins (0 to PACT_MAX), kept for that whole cycle in S.pacts. Each makes the cycle harder and adds
// its rw to XP and gold (through ngpReward) and half of it to gear drop chances. Finishing a cycle (clearing the Throne of
// Ash again) under pacts earns titles.
const PACT_MAX=3, PACT_REGEN=.03, PACT_RAISE=10, PACT_HP=.2, PACT_ATK=.15, PACT_BITTER=.25;
const PACTS={
  hides:{name:'Pact of Thick Hides',rw:20,desc:()=>'Foes have '+capPct(PACT_HP)+' more HP.'},
  claws:{name:'Pact of Sharp Claws',rw:20,desc:()=>'Foes deal '+capPct(PACT_ATK)+' more damage.'},
  regen:{name:'Pact of Knitting Flesh',rw:15,desc:()=>'Foes regain '+capPct(PACT_REGEN)+' of their max HP at the end of every turn.'},
  deaf:{name:'Pact of Deaf Graves',rw:15,desc:()=>'Your raise chance is '+PACT_RAISE+' points lower.'},
  dry:{name:'Pact of the Dry Throat',rw:10,desc:()=>'You cannot drink potions.'},
  bitter:{name:'Pact of Bitter Blood',rw:10,desc:()=>'Healing you receive is '+capPct(PACT_BITTER)+' lower.'},
  night:{name:'Pact of Short Nights',rw:25,desc:()=>'Each day has one watch fewer.'}
};
const pactList=()=>(S&&Array.isArray(S.pacts)?S.pacts:[]).filter(k=>PACTS[k]);
const pactOn=k=>pactList().includes(k);
const pactRw=l=>(l||pactList()).reduce((n,k)=>n+PACTS[k].rw,0);   // % more XP and gold
const pactReward=()=>1+pactRw()/100;
const pactDrop=()=>1+pactRw()/200;
const pactRaise=()=>pactOn('deaf')?PACT_RAISE:0;
const pactWatch=()=>pactOn('night')?1:0;
const cleanPacts=a=>Array.isArray(a)?[...new Set(a.filter(k=>PACTS[k]))].slice(0,PACT_MAX):[];
const pactDone=n=>!!(S&&S.ngp>0&&S.ti&&S.ti.clr&&S.ti.clr[5]&&pactList().length>=n);   // this cycle's Throne of Ash has fallen under n pacts
[['pk1','Pact-Bound','Finish a New Game+ cycle (clear the Throne of Ash) under at least one pact.',()=>pactDone(1),{goldp:4},3],
 ['pk3','Oathbreaker','Finish a New Game+ cycle under three pacts.',()=>pactDone(3),{xpp:4,goldp:4},5]
].forEach(([id,name,req,ok,b,r])=>{ for(const k in b) b[k]=Math.max(b[k],Math.round(b[k]*RARITY_MUL[r])); TITLE_RARITY[id]=r; const t={id,grp:'Deeds',name,req,ok,b,r}; TITLES.push(t); TITLE[id]=t; });
