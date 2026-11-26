// ===== HEART-FORGING AND THE LATE ECONOMY (R4 PR A) =====
// Late gold bends instead of growing forever: past hero level GOLD_SOFT_LV the level part of kill and vault gold grows at
// GOLD_SOFT_K of its rate (softLv). Boss, warden, secret-master and Hunger hearts forge **heartforged** pieces at the Forge
// (the market's forge section): a piece of the boss's set in the slot you pick, with bonus lines you choose from the boss's
// six (HF_LINES) instead of rolling them, at HF_VAL of the best roll. Secret masters and the Hunger add a third line and a
// minor power (HF_POW, it.pw). Reforging a heartforged piece re-rolls its values, never its lines; a second heart of the same
// boss swaps one line (hfSwap). Six Tower trophies forge Throne-set gear with a chance of an extra line (forgeTower).
// Item fields: it.hf = the boss's name, it.ro the lines, it.pw a minor power.
const GOLD_SOFT_LV=35, GOLD_SOFT_K=.33;
const softLv=l=>l<=GOLD_SOFT_LV?l:GOLD_SOFT_LV+(l-GOLD_SOFT_LV)*GOLD_SOFT_K;
const HF_VAL=1, HF_RE=[.8,1], HF_TW_K=.012;   // heartforged lines: at the top of the roll range; a reforge rolls 80-100%; a warden adds 1.2% per floor
const HF_LINES={
  'The Rat King':['raise','hp','atk','will','siph','frdmg'],
  'The Crypt Warden':['ward','hp','constitution','frres','mana','raise'],
  'The Ember Knight':['fdmg','fres','atk','crit','strength','hp'],
  'The Bishop of Teeth':['mpow','sdmg','mana','intelligence','sres','siph'],
  'The Orchard Mother':['rdmg','rres','hp','raise','will','mpow'],
  'The Pale Sovereign':['atk','crit','mpow','sdmg','will','constitution'],
  'The Hunger':['mpow','sdmg','raise','will','sres','mana'],
  'The Gate Hound':['atk','crit','strength','fdmg','hp','siph'],
  'Cinder Matron':['fdmg','fres','mpow','mana','intelligence','ward'],
  'The Iron Inquisitor':['ward','constitution','hp','rres','atk','will'],
  'Lord of Flies':['rdmg','rres','raise','siph','will','mana'],
  'The Bone Cantor':['mpow','raise','will','sdmg','mana','hp'],
  'Duke of Chains':['constitution','hp','ward','frres','strength','atk'],
  'The Pale Executioner':['crit','atk','strength','sdmg','siph','hp'],
  'Archdevil Vael':['mpow','intelligence','fdmg','mana','crit','sres'],
  'The Hollow Seraph':['ward','mana','mpow','sres','will','hp'],
  'Abaddon, King of Hell':['atk','mpow','crit','hp','fdmg','sdmg'],
  'The Plague Matriarch':['rdmg','raise','will','hp','rres','siph'],
  'The Drowned Abbot':['mana','frdmg','ward','frres','mpow','intelligence'],
  'The Cinder Wyrm':['fdmg','fres','hp','constitution','atk','crit'],
  'The Choir Eternal':['mpow','sdmg','mana','intelligence','sres','siph'],
  'The Rootking':['hp','rres','constitution','raise','will','ward'],
  'The Nameless Sovereign':['mpow','crit','atk','sdmg','will','siph']
};
const HF_POW={   // the minor powers of the secret masters and the Hunger (a third line on their heartforged pieces)
  brood:  {boss:'The Plague Matriarch',  name:'Brood',      desc:'Poison your side lays on a foe deals 25% more.'},
  tide:   {boss:'The Drowned Abbot',     name:'Tide',       desc:'Each turn of a fight you gain 2% of your max mana more, up to 10%.'},
  scales: {boss:'The Cinder Wyrm',       name:'Scales',     desc:'A foe that strikes you takes 10% of the blow back as fire.'},
  verse:  {boss:'The Choir Eternal',     name:'Verse',      desc:'Every third skill you cast costs no mana.'},
  regrow: {boss:'The Rootking',          name:'Regrowth',   desc:'Your minions mend 2% of their max HP each turn.'},
  mirror: {boss:'The Nameless Sovereign',name:'Mirror',     desc:'Your first skill in each room costs no mana.'},
  hungry: {boss:'The Hunger',            name:'Hungry Page',desc:'Each foe that falls mends you for 3% of your max HP.'}
};
const powOf=boss=>Object.keys(HF_POW).find(k=>HF_POW[k].boss===boss)||null;
const hfPow=id=>!!(S&&S.equip)&&Object.values(S.equip).some(it=>it&&it.pw===id);
// where a heart comes from: its gate (the piece's set), its forging price and how many lines it gives
function hfInfo(boss){ const I=hfInfo0(boss); if(I&&hfTownK()!==1){ I.gold*=hfTownK(); I.dust=Math.round(I.dust*hfTownK()); } return I; }   // the Great Forge (game-town2.js)
function hfInfo0(boss){
  if(!HF_LINES[boss]) return null;
  const gi=DUNGEONS.findIndex(D=>D.boss[0]===boss), tw=TW_BOSS.indexOf(boss), si=SECRET.findIndex(B=>B.name===boss);
  if(gi===ABBEY) return {boss,set:ABBEY,m:TM[ABBEY],gold:40000,dust:150,n:3,pw:'hungry'};
  if(gi>=0) return {boss,set:gi,m:TM[gi],gold:2000*(gi+1),dust:10*(gi+1),n:2};
  if(tw>=0){ const f=(tw+1)*10; return {boss,set:5,m:TM[5]*(1+HF_TW_K*f),gold:6000+200*f/10,dust:40,n:2,floor:f}; }
  if(si>=0) return {boss,set:5,m:TM[5],gold:20000,dust:80,n:3,pw:powOf(boss)};
  return null;
}
const hfKey=boss=>'b:'+boss;
const hfLinesFor=(boss,slot)=>(HF_LINES[boss]||[]).filter(k=>!ROLL_SLOT[k]||ROLL_SLOT[k].includes(slot));
const hfLineVal=(I,k,q)=>Math.max(1,Math.round(ROLL_KEYS[k]*I.m*HF_VAL*(q==null?1:q)));
const hfCost=boss=>{ const I=hfInfo(boss); return I?{g:Math.round(I.gold),d:I.dust}:null; };
const hfHearts=()=>Object.keys(S.trophies||{}).filter(k=>k.startsWith('b:')&&S.trophies[k]>0&&hfInfo(k.slice(2)));
const hfGuard=boss=>(S.trophies[hfKey(boss)]||0)-1<heartsKept(hfKey(boss));   // forging would dip into hearts a held unique still needs to awaken
function hfCan(boss,slot,lines){
  const I=hfInfo(boss); if(!I||S.mode!=='town'||!SLOTS[slot]||(S.trophies[hfKey(boss)]||0)<1) return false;
  const ok=hfLinesFor(boss,slot), want=I.n-(I.pw?1:0); if(!Array.isArray(lines)||lines.length!==want||new Set(lines).size!==want||lines.some(k=>!ok.includes(k))) return false;
  return S.gold>=Math.round(I.gold)&&(S.dust||0)>=I.dust&&S.inv.length<bagMax();
}
function heartforge(boss,slot,lines,force){   // returns the item, or null; force: spend a heart a unique still needs
  if(!hfCan(boss,slot,lines)||(hfGuard(boss)&&!force)) return null;
  const I=hfInfo(boss), pool=Object.values(ITEM).filter(d=>!d.uq&&!d.tower&&d.set===I.set&&d.slot===slot); if(!pool.length) return null;
  S.gold-=Math.round(I.gold); S.dust-=I.dust; const k=hfKey(boss); S.trophies[k]--; if(!S.trophies[k]) delete S.trophies[k]; faithUsed(1);
  const it=addItem(pick(pool).id,lines.map(l=>[l,hfLineVal(I,l)])); it.hf=boss; if(I.pw) it.pw=I.pw;
  tally('heartforged'); tally('hfGold',Math.round(I.gold)); sfx('level'); return it;
}
function hfReroll(it){ const I=hfInfo(it.hf); if(!I||!it.ro) return; it.ro=it.ro.map(([k])=>[k,hfLineVal(I,k,rnd(HF_RE[0],HF_RE[1]))]); }   // reforge: values only
function hfSwap(u,i,k){   // a second heart of the same boss: swap one line for another of its list
  const it=findItem(u); if(!it||!it.hf||S.mode!=='town') return false; const I=hfInfo(it.hf), key=hfKey(it.hf);
  if(!I||!it.ro||!it.ro[i]||(S.trophies[key]||0)<1||!hfLinesFor(it.hf,ITEM[it.id].slot).includes(k)||it.ro.some(r=>r[0]===k)) return false;
  vitals(()=>{ it.ro[i]=[k,hfLineVal(I,k)]; }); S.trophies[key]--; if(!S.trophies[key]) delete S.trophies[key]; tally('hfSwaps'); sfx('level'); return true;
}
// ----- the Tower trophies forge too
const TW_FORGE_N=6, TW_FORGE_GOLD=3000, TW_EXTRA=.2;
const towerTrophies=()=>Object.keys(S.trophies||{}).filter(k=>k.startsWith('t:')).reduce((a,k)=>a+S.trophies[k],0);
function forgeTower(slot){
  if(S.mode!=='town'||towerTrophies()<TW_FORGE_N||S.gold<TW_FORGE_GOLD||S.inv.length>=bagMax()||!SLOTS[slot]) return null;
  const pool=Object.values(ITEM).filter(d=>!d.uq&&!d.tower&&d.set===5&&d.slot===slot); if(!pool.length) return null;
  S.gold-=TW_FORGE_GOLD; spendTrophies(Object.keys(S.trophies).filter(k=>k.startsWith('t:')),TW_FORGE_N,()=>1);
  const id=pick(pool).id; let ro=rollItem(id,true)||[]; const extra=Math.random()<TW_EXTRA+smithK();
  if(extra){ const left=rollKeys(slot).filter(k=>!ro.some(r=>r[0]===k)); if(left.length){ const k=pick(left); ro=ro.concat([[k,Math.max(1,Math.round(ROLL_KEYS[k]*TM[5]*rnd(.5,1)))]]); } }
  const it=addItem(id,ro.length?ro:null); sfx('level'); if(extra) tally('master'); return {it,extra};
}
// ----- the minor powers in a fight
function hfTurn(){   // act(), at the end of every turn: Tide, Regrowth
  const r=S.run, P=S.player; if(!r) return;
  if(hfPow('tide')) P.mana=Math.min(pMana(),P.mana+Math.round(pMana()*Math.min(.1,.02*r.turn)));
  if(hfPow('regrow')) S.army.forEach(m=>{ if(m.hp>0) healAlly(m,Math.round(m.maxHp*.02)); });
}
const hfPoison=(u,k,d)=>k==='poison'&&u&&u.id!=null&&u.id!=='p'&&u.uid==null&&hfPow('brood')?d*1.25:d;   // addDot: Brood
function hfScales(a,d){ if(a.id==='p'&&d>0&&hfPow('scales')&&HITTER&&HITTER.hp>0&&HITTER.id!=='p'&&HITTER.uid==null&&S.run&&S.run.enemies.includes(HITTER)){ const h=HITTER; HITTER=S.player; hurtFoe(h,Math.max(1,Math.round(d*.1)),'fire'); HITTER=h; } }   // hurtAlly: Scales
const hfFree=()=>{ const r=S&&S.run; if(!r||S.mode!=='battle') return false; return (hfPow('mirror')&&!r.mirU)||(hfPow('verse')&&(r.verseN||0)%3===2); };   // skCost: Mirror, Verse
function hfSkill(){ const r=S.run; if(!r) return; if(hfPow('mirror')) r.mirU=1; if(hfPow('verse')) r.verseN=(r.verseN||0)+1; }   // useSkill, after the cost is paid
function hfKill(e){ if(hfPow('hungry')&&S.player.hp>0) healAlly(S.player,Math.round(pMax()*.03)); }   // killLoot: Hungry Page
function hfFix(it){ if(!it) return; if(it.hf!=null&&!HF_LINES[it.hf]) delete it.hf; if(it.pw!=null&&!(HF_POW[it.pw]&&it.hf)) delete it.pw; }   // normalizeSave
