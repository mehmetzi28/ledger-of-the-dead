// ===== SKILLS =====
// One skill point per level. Each skill has three ranks; rank n needs level lv+(n-1)*SK_STEP.
// Actives cost mana and have a cooldown in turns (cooldowns reset each room). Passives always apply.
const SK_MAX=3, SK_STEP=5;
const SKILLS=[
 {id:'spear',name:'Bone Spear',type:'active',lv:2,cost:10,cd:2,desc:r=>'Hurl a lance of bone at your target for '+(70+15*r)+'% of your Strike plus Siphon. Pierces half of foe armor.'},
 {id:'bonearmor',name:'Bone Armor',type:'passive',lv:3,desc:r=>'+'+(6*r)+'% max HP.'},
 {id:'mend',name:'Dark Mending',type:'active',lv:4,cost:12,cd:3,desc:r=>'Knit your minions back together. Each one heals '+(15+8*r)+'% of its max HP, and you and your army are cured of bleeding, burns, poison and blight.'},
 {id:'blast',name:'Corpse Explosion',type:'active',lv:5,cost:10,cd:3,desc:r=>'Detonate a body that fell this room. Every foe takes '+(60+20*r)+'% of your Siphon, ignoring armor. That body can no longer be raised.'},
 {id:'soulwell',name:'Soul Well',type:'passive',lv:6,desc:r=>'+'+r+' mana every turn in battle.'},
 {id:'curse',name:'Curse of Frailty',type:'active',lv:7,cost:8,cd:4,desc:r=>'Your target takes '+(15+10*r)+'% more damage from every source for 3 turns.'+(r>=3?' It is also Hexed: it deals 20% less damage for 2 turns.':'')},
 {id:'robber',name:'Grave Robber',type:'passive',lv:8,desc:r=>'+'+(5*r)+'% gold from kills.'},
 {id:'gravepact',name:'Grave Pact',type:'passive',lv:9,desc:r=>'+'+(6*r)+'% minion power.'},
 {id:'chill',name:'Grave Chill',type:'active',lv:10,cost:14,cd:5,desc:r=>'Deal 50% of your Siphon and freeze your target for '+(r>=3?'2 turns':'1 turn')+'. Bosses resist '+(60-10*r)+'% of the time.'+(r>=2?' Even then it is Chilled: it takes 20% more damage for 2 turns.':'')},
 {id:'scholar',name:'Forbidden Lore',type:'passive',lv:11,desc:r=>'+'+(4*r)+'% XP from kills.'},
 {id:'edge',name:'Necrotic Edge',type:'passive',lv:12,desc:r=>'Strike deals '+(10*r)+'% more damage.'},
 {id:'frenzy',name:'Unholy Frenzy',type:'active',lv:13,cost:15,cd:6,desc:r=>'Your minions deal '+(20+15*r)+'% more damage for 3 turns.'+(r>=3?' They are also Hasted for 2 turns: each strikes again for 50% at the end of the turn.':'')},
 {id:'mastery',name:'Master of Bones',type:'passive',lv:15,desc:r=>'+'+(4*r)+'% chance to raise the dead.'},
 {id:'calcify',name:'Calcified Hide',type:'passive',lv:16,desc:r=>'You take '+(2*r)+'% less damage.'},
 {id:'sanguine',name:'Sanguine Rites',type:'passive',lv:17,desc:r=>'+'+(8*r)+'% healing received.'},
 {id:'reap',name:'Reap',type:'active',lv:18,cost:18,cd:4,desc:r=>'Deal '+(120+30*r)+'% of your Siphon to your target, ignoring armor, doubled if it is below 35% HP.'},
 {id:'thrift',name:'Corpse Thrift',type:'passive',lv:20,desc:r=>'Raising costs '+(6*r)+'% less mana.'},
 {id:'deathless',name:'Deathless Will',type:'passive',lv:22,desc:r=>'+'+(5*r)+'% max mana.'}
];
const SKILL={}; SKILLS.forEach(s=>SKILL[s.id]=s);
const skReq=(s,rank)=>s.lv+(rank-1)*SK_STEP;
const activeSkills=()=>SKILLS.filter(s=>s.type==='active'&&sk(s.id)>0);
const reapLow=()=>hasMod('reap','a')?MOON_LOW:.35;   // Reap doubles below this share of HP (Harvest Moon lifts it)
const freeCorpse=()=>S.run&&S.run.corpses.find(c=>!c.tried);
function skCd(id){ return (S.run&&S.run.cd&&S.run.cd[id])||0; }
function canUse(id){
  const s=SKILL[id]; if(S.mode!=='battle'||!s||s.type!=='active'||!sk(id)) return false;
  if(S.run.silence>0) return false;   // Hymn of Silence
  if(skCd(id)>0||S.player.mana<skCost(s)) return false;
  if(id==='blast'&&!freeCorpse()) return false;
  if(id==='mend'&&!S.army.some(m=>m.hp>0&&m.hp<m.maxHp)&&!allies().some(a=>a.dots)&&!(hasMod('mend','a')&&S.army.some(m=>m.hp<=0))) return false;
  return true;
}
function useSkill(id,t){
  if(!canUse(id)) return false;
  const s=SKILL[id], rk=sk(id), r=S.run, P=S.player;
  const mg=marginReady(); P.mana-=skCost(s); marginSkill(r,t,mg); hfSkill(); r.naveU=1; r.lastSk=id; r.cd=r.cd||{}; r.cd[id]=s.cd+1; tally('sk_'+id);   // +1: the end-of-turn tick runs this same turn
  if(id==='spear'){ const fb=frozenChilled(t), d=hit((pAtk()+pSiph())*(.7+.15*rk)*pierceMul(hasMod('spear','a')?1:.5)*skMul()*(fb?FROSTBREAK:1)); hurtFoe(t,d,'phys'); log('Bone Spear impales '+t.name+' for '+d+'.'); fxe('spear',t); if(fb&&t.hp>0) frostbreak(t);
    if(hasMod('spear','b')){ const o=liveFoes().filter(x=>x!==t); if(o.length){ const o2=pick(o), d2=Math.round(d*.5); hurtFoe(o2,d2,'phys'); log('A splinter tears into '+o2.name+' for '+d2+'.'); } } }
  else if(id==='blast'){ const c=freeCorpse(); c.tried=true; c.result='exploded'; const base=pSiph()*(.6+.2*rk)*pierceMul(1)*(hasMod('blast','a')?1.3:1)*skMul()*shadowK(); let tot=0;
    const rot=Math.max(c.bl||0,...liveFoes().map(o=>o.dots&&o.dots.blight?o.dots.blight.d:0)), spread=[];   // Spreading Rot: a blighted body, or blight already in the room
    for(const o of liveFoes()){ const d=hit(base); hurtFoe(o,d,'rot'); fxe('burst',o); tot+=d; if(rot&&o.hp>0&&!(o.dots&&o.dots.blight)){ addDot(o,'blight',rot,2); if(o.dots&&o.dots.blight) spread.push(o); } if(hasMod('blast','a')) addSt(o,'sundered',2); if(hasMod('blast','b')){ addDot(o,'poison',pSiph()*.15,3); addDot(o,'blight',pSiph()*.1,3); } } log('The body of '+c.name+' bursts apart, dealing '+tot+' damage across the room.');
    if(spread.length) combo('rot',spread,'Spreading Rot: the blight spreads to '+spread.length+' foe'+(spread.length>1?'s':'')+'.'); }
  else if(id==='mend'){
    let tot=0;
    const cured=allies().some(a=>a.dots);
    let up=null; if(hasMod('mend','a')){ up=S.army.filter(m=>m.hp<=0).sort((a,b)=>mPower(b)-mPower(a))[0]||null; if(up){ up.hp=Math.max(1,Math.round(up.maxHp*MEND_REVIVE)); mark(up,0,up.hp); log('Deep Mending pulls '+up.nick+' back up at '+up.hp+' HP.','ok'); } }   // Deep Mending: one downed minion stands again
    for(const m of S.army) if(m.hp>0&&m!==up) tot+=healAlly(m,Math.round(m.maxHp*(.15+.08*rk)));
    if(hasMod('mend','b')) tot+=healAlly(P,Math.round(pMax()*.15));
    if(cured) tally('cures');
    allies().forEach(clearDots);
    fxe('mend',P);
    log('Dark Mending knits your army back together for '+tot+' HP'+(cured?' and cures every wound and burn':'')+'.','ok');
  }
  else if(id==='curse'){ const turns=hasMod('curse','a')?5:3, bonus=.15+.1*rk;
    if(hasMod('curse','b')){ for(const o of liveFoes()){ o.curse={mul:1+bonus*.8,t:turns}; mark(o,0,0); } log('Every foe is cursed and takes '+Math.round(bonus*80)+'% more damage.'); }
    else { t.curse={mul:1+bonus,t:turns}; mark(t,0,0); log(t.name+' is cursed and takes '+Math.round(bonus*100)+'% more damage.'); }
    if(rk>=3) for(const o of (hasMod('curse','b')?liveFoes():[t])) addSt(o,'hexed',2); }   // rank 3: the curse also hexes
  else if(id==='chill'){ const d=hit(pSiph()*.5*dmgMul()*skMul()*shadowK()); hurtFoe(t,d,'frost'); fxe('ward',t); const held=!t.boss||Math.random()*100<40+10*rk+(hasMod('chill','a')?20:0);
    if(rk>=2&&t.hp>0) addSt(t,'chilled',2);   // rank 2: Chilled, resisted or not
    if(held&&t.hp>0){ t.stun=rk>=3?2:1; tally('frozen'); log('Grave Chill hits '+t.name+' for '+d+' and freezes it solid.'); } else log('Grave Chill hits '+t.name+' for '+d+', but it shakes off the frost.'); }
  else if(id==='frenzy'){ r.frenzy=hasMod('frenzy','a')?5:3; r.frenzyMul=1+(.2+.15*rk); if(hasMod('frenzy','b')) for(const m of S.army) if(m.hp>0) healAlly(m,Math.round(m.maxHp*.15)); if(rk>=3) for(const m of S.army) if(m.hp>0) addSt(m,'hasted',2); log('Unholy Frenzy: your army surges with '+Math.round((r.frenzyMul-1)*100)+'% more damage.','ok'); }
  else if(id==='reap'){ const low=t.hp<t.maxHp*reapLow(); let d=hit(pSiph()*(1.2+.3*rk)*pierceMul(1)*skMul()*shadowK()); if(low) d*=2; else if(hasMod('reap','a')) d=Math.round(d*MOON_HIGH); const fb=frozenChilled(t); if(fb) d=Math.round(d*FROSTBREAK); KILL='reap'; hurtFoe(t,d,'shad'); KILL=null; fxe('strike',t,{crit:1});
    if(hasMod('reap','b')){ healAlly(P,Math.round(d*SOUL_REAP_HEAL)); if(t.hp<=0) P.mana=Math.min(pMana(),P.mana+SOUL_REAP_MANA); }   // Soul Reap
    log('You reap '+t.name+' for '+d+(low?' (harvest)':'')+'.'); if(fb&&t.hp>0) frostbreak(t); }
  MARGIN=null; return true;
}
function skillTick(){
  const r=S.run;
  if(r.cd) for(const k in r.cd) if(r.cd[k]>0) r.cd[k]--;
  if(r.frenzy>0) r.frenzy--;
  r.tt=(r.tt||0)+1;   // turns this run, for the fastest-clear record
  if(r.silence>0) r.silence--;
  if(r.taunt>0) r.taunt--;
  for(const e of r.enemies) if(e.curse&&--e.curse.t<=0) delete e.curse;
  tickSt(); progTick();
}
function learnSkill(id){
  const s=SKILL[id], P=S.player; if(!s||S.mode!=='town'||P.sp<=0) return;
  const rk=sk(id); if(rk>=SK_MAX||P.lvl<skReq(s,rk+1)) return;
  vitals(()=>{ P.skills[id]=rk+1; P.sp--; });
}
function resetSkills(){
  const P=S.player; if(S.mode!=='town') return;
  const spent=Object.values(P.skills).reduce((a,b)=>a+b,0); if(!spent) return;
  vitals(()=>{ P.skills={}; P.skMod={}; P.sp+=spent; }); P.hp=Math.min(P.hp,pMax()); P.mana=Math.min(P.mana,pMana());
  notify('Your skills are forgotten. '+spent+' skill point'+(spent>1?'s':'')+' returned.');
}

// ===== GOLD, TROPHIES AND THE MARKET =====
// Every kill drops a little gold and often a trophy of that enemy type. Trophies stack in a pouch (no bag space) and sell at the market.
// Like XP and items, a room's gold and trophies are only banked when the room is won.
const TROPHY_PART={vanguard:['Hide','Shell','Bone Plate','Scale'],striker:['Fang','Claw','Talon','Tooth'],mender:['Relic','Prayer Bead','Vial','Bone Charm'],reaper:['Fang','Claw']};
const TROPHY_VAL=[3,7,14,26,45,75,110];          // sell value of an ordinary trophy, per gate
const TROPHY={};                             // key -> {name, value, ico, rankI}
(function(){
  const h=s=>{ let x=0; for(const c of s) x=(x*31+c.charCodeAt(0))|0; return Math.abs(x); };
  const add=(key,name,value,ico,rankI,gate,role)=>{ if(!TROPHY[key]) TROPHY[key]={name,value,ico,rankI,gate,role}; };   // role: the part's role, for brewing (game-brew.js)
  const part=(n,role)=>{ const p=TROPHY_PART[role]||TROPHY_PART.vanguard; return n+' '+p[h(n)%p.length]; };
  DUNGEONS.forEach((D,i)=>{ D.mobs.forEach(m=>add(m[0],part(m[0],m[1]),TROPHY_VAL[i],m[0],i,i,m[1])); add('b:'+D.boss[0],i===ABBEY?'The Hunger\'s Tooth':'Heart of '+D.boss[0],TROPHY_VAL[i]*10,D.boss[0],i,i); });
  TW_MOBS.forEach(m=>add('t:'+m[0],part(m[0],m[1]),40,m[0],4,undefined,m[1]));
  TW_BOSS.forEach((n,i)=>add('b:'+n,'Heart of '+n,120*(i+1),n,5));
  SECRET.forEach((B,i)=>add('b:'+B.name,'Heart of '+B.name.replace(/^The /,''),TROPHY_VAL[i]*40,B.name,i,i));
})();
const trophyKey=e=>e.boss?'b:'+e.base:(e.tw?'t:':'')+e.base;
function killLoot(e,r){   // called once per kill, from checkDeaths
  hfKill(e); townKill(e);   /* Hungry Page (game-forge.js), Grave Altar (game-town2.js) */
  const cursed=runMod()?MOD_GOLD:1;
  const coin=Math.max(1,Math.round((1+softLv(e.lvl)*.5)*(1+e.rankI*.5)*(e.boss?5:1)*(e.secret?SB_REWARD:1)*(e.rival?RIVAL_GOLD:1)*(e.elite?2:1)*rnd(.7,1.3)*ngpReward()*cursed*heatK('gold')*(roomKind()==='elite'?ELITE_GOLD:1)*(1+xb('goldp')/100)*((e.boss||e.elite)&&hasMod('robber','a')?POCKETS:1)));   // Deep Pockets: elites and bosses
  r.gold=(r.gold||0)+coin;
  if(omen()==='boneharvest'&&!r.trial&&(e.boss||Math.random()<HARVEST_DUST)) r.bdust=(r.bdust||0)+(e.boss?HARVEST_DUST_BOSS:1);   // Bone Harvest: bone dust from the dead
  const key=trophyKey(e); if(!TROPHY[key]||e.stash) return;
  const har=omen()==='boneharvest', tch=.6*(har?1+HARVEST_TRO:1)+(hasMod('robber','b')?KEEN_TRO:0);   // Bone Harvest and Keen Eye
  const n=(e.boss?(1+(e.secret&&hasInsc('masters')?1:0))*(e.ledger?LEDGER_HEART:1):e.elite?2+(har?1:0):(Math.random()<tch?1:0))*cursed;
  if(n){ r.troph=r.troph||{}; r.troph[key]=(r.troph[key]||0)+n; }
}
function bankLoot(r){     // called when a room is won
  r.lastGold=r.gold||0; if(r.lastGold) sfx('coin'); r.lastTroph=r.troph||{};
  S.gold+=r.lastGold; r.goldTot=(r.goldTot||0)+r.lastGold; for(const k in r.lastTroph) S.trophies[k]=(S.trophies[k]||0)+r.lastTroph[k];
  r.lastDust=r.bdust||0; if(r.lastDust){ S.dust=(S.dust||0)+r.lastDust; if(r.events) r.events.push({m:'Bone Harvest: +'+r.lastDust+' bone dust.',c:'ok'}); }
  r.gold=0; r.troph={}; r.bdust=0;
}
// Potions: carried on the belt, drunk in battle as your action.
const BELT_MAX=3;
const POTIONS={
  hp:{name:'Healing Draught',key:'Q',desc:'Restores 35% of your max HP and cures bleeding, burns, poison and blight. Drinking it uses your turn.',price:()=>Math.round((15+S.player.lvl*5)*apoPotK())},
  mp:{name:'Mana Tonic',key:'W',desc:'Restores 40% of your max mana. Drinking it uses your turn.',price:()=>Math.round((12+S.player.lvl*4)*apoPotK())}
};
function drink(k){
  const P=S.player; if(!S.belt[k]||pactOn('dry')) return false;   // the Dry Throat pact
  if(DRAUGHTS[k]) return drinkDraught(k);   /* Iron Draught, Bloodwine (game-brew.js) */
  if(k==='hp'){ if(P.hp>=pMax()&&!P.dots) return false; S.belt.hp--; const h=healAlly(P,Math.round(pMax()*.35)), cured=!!P.dots; clearDots(P); if(kitchenHeal()) S.army.forEach(m=>{ if(m.hp>0) healAlly(m,Math.round(m.maxHp*.15)); });   /* Plague Kitchen (game-town2.js) */ tally('drank'); if(cured) tally('cures'); log('You drink a Healing Draught and recover '+h+' HP'+(cured?'. Your wounds close':'')+'.','ok'); }
  else { if(P.mana>=pMana()) return false; S.belt.mp--; tally('drank'); const m=Math.min(pMana()-P.mana,Math.round(pMana()*.4)); P.mana+=m; mark('p',0,0); log('You drink a Mana Tonic and recover '+m+' mana.','ok'); }
  return true;
}
// Market prices. Gear sells for a quarter of what the merchant asks. Uniques cannot be sold.
const SET_PRICE=[30,80,200,480,1100,2400,4000];
const buyPrice=d=>SET_PRICE[Math.min(d.set,SET_PRICE.length-1)];
const sellPrice=d=>d.uq?0:Math.max(1,Math.round(buyPrice(d)*.25));
const sellValue=it=>{ const d=ITEM[it.id]; return d.uq?0:Math.round(sellPrice(d)*(1+.25*((it.ro&&it.ro.length)||0))); };   // each bonus line adds a quarter
const STOCK_N=4;
function shopStock(){   // four pieces of gear from your highest unlocked gate (and the one below); new every day and whenever a gate unlocks
  let g=0; for(let i=0;i<GATE_N;i++) if(S.player.lvl>=RK[i].unlock) g=i;
  if(!S.shop||S.shop.day!==S.day||S.shop.g!==g){
    const pool=Object.values(ITEM).filter(d=>!d.uq&&d.set<=g&&d.set>=g-1), ids=[];
    while(ids.length<Math.min(STOCK_N,pool.length)){ const d=pick(pool); if(!ids.includes(d.id)) ids.push(d.id); }
    S.shop={day:S.day,g,stock:ids.map(id=>{ const s={id,sold:false}, ro=rollItem(id); if(ro) s.ro=ro; return s; })};   // rolls are shown before you buy
  }
  return S.shop.stock;
}
function buyPotion(k){ const p=POTIONS[k], cost=p&&p.price(); if(!p||S.mode!=='town'||S.belt[k]>=beltMax()||S.gold<cost) return false; S.gold-=cost; S.belt[k]++; sfx('coin'); return true; }
function buyStock(i){
  const s=shopStock()[i]; if(!s||s.sold||S.mode!=='town') return false; const d=ITEM[s.id], cost=buyPrice(d);
  if(S.gold<cost||S.inv.length>=bagMax()) return false;
  S.gold-=cost; s.sold=true; addItem(s.id,s.ro||null); sfx('coin'); return true;
}
function sellTrophy(k,all){ const n=S.trophies[k]||0; if(!n||!TROPHY[k]||S.mode!=='town') return 0; const q=all?n:1; S.trophies[k]-=q; if(!S.trophies[k]) delete S.trophies[k]; const g=q*TROPHY[k].value; S.gold+=g; tally('soldTro',q); sfx('coin'); return g; }
function sellAllTrophies(){ let g=0; for(const k of Object.keys(S.trophies)){ const keep=k.startsWith('b:')?heartsKept(k):0; if(!keep) g+=sellTrophy(k,true); else for(let n=S.trophies[k]-keep;n>0;n--) g+=sellTrophy(k); } return g; }   // keeps the hearts your uniques still need to awaken
// Gold sinks: the Bone Altar levels a minion up (never past the usual cap of your level + 2), bag upgrades add space, salts help raising.
const empowerCost=m=>Math.round(mneed(m.lvl)*.6*(1-B_ALT_COST*bl('altar'))*empowerK());   /* Bone Altar spec (game-town2.js) */
function empower(uid){
  const m=findMinion(uid); if(!m||S.mode!=='town'||m.lvl>=S.player.lvl+2) return false;
  const c=empowerCost(m); if(S.gold<c) return false;
  S.gold-=c; m.lvl++; m.xp=0; tally('emp'); checkEvolve(m); syncMinion(m); m.hp=m.maxHp; sfx('raise'); return true;
}
function buyBag(){ const lv=S.bagLv||0, c=BAG_COST[lv]; if(S.mode!=='town'||c==null||S.gold<c) return false; S.gold-=c; S.bagLv=lv+1; sfx('coin'); return true; }
function buySalt(){ const c=saltPrice(); if(S.mode!=='town'||S.salts>=SALT_MAX||S.gold<c) return false; S.gold-=c; S.salts++; sfx('coin'); return true; }
const saltMaxN=()=>S.mode!=='town'?0:Math.max(0,Math.min(SALT_MAX-S.salts,Math.floor(S.gold/saltPrice())));   // how many salts one "Buy max" click gets
function buySaltMax(){ let n=0, g=0; while(n<SALT_MAX){ const c=saltPrice(); if(!buySalt()) break; n++; g+=c; } return {n,g}; }   // one buy at a time, so a price that changed per buy would still be paid right

// Trophy forge: 6 trophies from one gate (a boss heart counts as 5) plus some gold forge a piece of that gate's gear in the slot
// you choose, with a 20% chance of a masterwork from the next gate's set. Any 4 trophies brew a potion.
const FORGE_N=6, FORGE_GOLD=.3, MASTERWORK=.2, BREW_N=4;
const trophyGate=k=>{ const t=TROPHY[k]; return (t&&t.gate!=null)?t.gate:-1; };
const trophyPts=k=>k.startsWith('b:')?5:1;
function forgePoints(gi){ let n=0; for(const k in S.trophies) if(trophyGate(k)===gi) n+=S.trophies[k]*trophyPts(k); return n; }
const forgeGold=gi=>Math.round(SET_PRICE[gi]*FORGE_GOLD);
function spendTrophies(keys,need,pts){   // cheapest first, boss hearts last
  keys.sort((a,b)=>trophyPts(a)-trophyPts(b)||TROPHY[a].value-TROPHY[b].value);
  for(const k of keys){ while(need>0&&S.trophies[k]>0){ S.trophies[k]--; need-=pts(k); } if(!S.trophies[k]) delete S.trophies[k]; if(need<=0) break; }
}
function forgeGear(gi,slot){
  if(S.mode!=='town'||forgePoints(gi)<FORGE_N||S.gold<forgeGold(gi)||S.inv.length>=bagMax()||!SLOTS[slot]) return null;
  const set=(gi<5&&Math.random()<MASTERWORK+smithK())?gi+1:gi, pool=Object.values(ITEM).filter(d=>!d.uq&&d.set===set&&d.slot===slot); if(!pool.length) return null;
  S.gold-=forgeGold(gi); spendTrophies(Object.keys(S.trophies).filter(k=>trophyGate(k)===gi),FORGE_N,trophyPts);
  const it=addItem(pick(pool).id); sfx('level'); if(set>gi) tally('master'); return {it,master:set>gi};
}
function brew(k){
  const n=Object.values(S.trophies).reduce((a,b)=>a+b,0);
  if(S.mode!=='town'||!POTIONS[k]||S.belt[k]>=beltMax()||n<BREW_N) return false;
  spendTrophies(Object.keys(S.trophies),BREW_N,()=>1); S.belt[k]++; sfx('heal'); return true;
}

// ===== MINION TRAITS AND EVOLUTION =====
// Every raised minion rolls a trait (bosses two). At 5, 10, 18 and 28 levels above the level it was raised at, it evolves:
// Greater, Elder, Ancient, then Eternal. Each stage has its own buff (STAGE_FX) and brings one more trait.
const TRAITS={
  thick:     {name:'Thick-boned', desc:'+25% max HP.'},
  vicious:   {name:'Vicious',     desc:'+20% attack.'},
  frenzied:  {name:'Frenzied',    desc:'20% chance to strike twice.'},
  leech:     {name:'Leeching',    desc:'Heals itself for 25% of the damage it deals.'},
  stalwart:  {name:'Stalwart',    desc:'Takes 20% less damage.'},
  gravebound:{name:'Grave-bound', desc:'Never shatters when downed.'},
  venom:     {name:'Venomous',    desc:'Its hits poison the target for 3 turns.'},
  wrathful:  {name:'Wrathful',    desc:'+40% attack while below half HP.'},
  warded:    {name:'Warded',      desc:'Immune to bleeding, burns, poison and blight.'}
};
const TRAIT_IDS=Object.keys(TRAITS), STAGES=['','Greater ','Elder ','Ancient ','Eternal '], STAGE_MAX=STAGES.length-1, EVOLVE_STEP=5;
const EVOLVE_AT=[0,5,10,18,28];   // levels above the level it was raised at
const STAGE_FX=[{hp:0,atk:0},{hp:.2,atk:.1},{hp:.1,atk:.2},{hp:.15,atk:.15},{hp:.2,atk:.2}];   // what each stage adds (Greater is sturdier, Elder hits harder)
const stageMul=(m,k)=>{ let t=1; for(let i=1;i<=(m.stage||0)&&i<=STAGE_MAX;i++) t+=STAGE_FX[i][k]; return t; };
const evoNext=m=>{ const st=m.stage||0; return st<STAGE_MAX&&m.lvl0!=null?m.lvl0+EVOLVE_AT[st+1]:null; };
const fxText=f=>'+'+Math.round(f.hp*100)+'% HP, +'+Math.round(f.atk*100)+'% ATK';
const hasTrait=(m,t)=>!m.unw&&!(m.read&&(m.read===t||(COMPOUND[m.read]&&COMPOUND[m.read].includes(t))))&&(!!(m.traits&&(m.traits.includes(t)||m.traits.some(x=>COMPOUND[x]&&COMPOUND[x].includes(t))))||ledgerBless(m,t));   // a trait read aloud is muted; the Ledger blessing (game-abbey.js)   // a fusion compound counts as both its halves
const mName=m=>{ const s=STAGES[m.stage||0]; return m.name.startsWith('The ')?'The '+s+m.name.slice(4):s+m.name; };   // "The Elder Rat King", "Greater Crypt Ghoul"
const withArticle=n=>n.startsWith('The ')?n:(/^[AEIOU]/i.test(n)?'an ':'a ')+n;
const theName=n=>n.startsWith('The ')?n:'the '+n;
// Commander: never rolled like the others. Only a raised elite or boss can have it (at the raise, or when it evolves).
TRAITS.commander={name:'Commander',desc:'Can lead a raid on a cleared gate from the War table while you stay behind.'};
// Affix traits: never rolled like the others (and so outside TRAIT_IDS). A minion gets one only by being raised from an elite with that affix.
TRAITS.necrotic={name:'Necrotic',desc:'Its hits blight the target for 2 turns: rot damage each turn, and half the healing it receives.'};
TRAITS.crushing={name:'Crushing',desc:'Its hits sunder the target 1 time in 3: 25% more damage taken for 2 turns.'};
TRAITS.hexing  ={name:'Hexing',  desc:'Its hits hex the target 1 time in 3: it deals 20% less damage for 2 turns.'};
TRAITS.swift   ={name:'Swift',   desc:'Hasted for the first 2 turns of every fight: strikes again for 50% at the end of each turn.'};
const AFFIX_TRAITS=['necrotic','crushing','hexing','swift'];
// Death traits: never rolled either (outside TRAIT_IDS). A body rises with one by how it died (CORPSE_CONDS, game-gate-rules.js).
TRAITS.rimeborn  ={name:'Rimeborn',  desc:'Its hits chill the target 1 time in 3: 20% more damage taken for 2 turns.'};
TRAITS.unmarred  ={name:'Unmarred',  desc:'+15% max HP and attack.'};
TRAITS.cinderborn={name:'Cinderborn',desc:'Its hits burn the target 1 time in 3 for 2 turns. Immune to burns.'};
TRAITS.undone    ={name:'Undone',    desc:'Keeps an echo of its kind\'s kit, at 60% strength; kinds whose kit has no echo give +10% damage.'};
TRAITS.stitched  ={name:'Stitched',  desc:'Once per room, when downed it rises again at 25% HP. -10% max HP.'};
const DEATH_TRAITS=['rimeborn','unmarred','cinderborn','stitched','undone'];
// Compounds: formed only in the Flesh Pit, when a fusion brings both halves of a recipe together (never rolled, never from a death or
// an affix, so outside TRAIT_IDS). One slot; counts as both halves (hasTrait) plus one extra. Recipes resolve in this order, each trait feeds
// at most one, compounds are never ingredients. Found ones are kept in S.ti.compounds.
const COMPOUNDS=[['plaguebearer','necrotic','venom'],['shatterwrought','rimeborn','cinderborn'],['patchwork','stitched','thick'],['pristine','unmarred','vicious'],
  ['blur','swift','frenzied'],['bloodfiend','leech','wrathful'],['ironbound','stalwart','warded'],['bonebreaker','crushing','vicious'],['witchrot','hexing','necrotic'],
  ['deathlesshusk','gravebound','stitched'],['glaciermaul','rimeborn','crushing'],['pyreheart','cinderborn','wrathful']];
const COMPOUND={}; for(const [c,a,b] of COMPOUNDS) COMPOUND[c]=[a,b];
Object.assign(TRAITS,{
  plaguebearer:  {name:'Plaguebearer',  desc:'Venomous and Necrotic in one. When it kills a foe, that foe\'s poison and blight jump to another foe.', story:'It does not let a sickness die with its host. It carries it on.'},
  shatterwrought:{name:'Shatterwrought',desc:'Rimeborn and Cinderborn in one. Its hits alternate Chill and Burn. Immune to both.', story:'Frost in one hand, embers in the other. Neither can touch it any more.'},
  patchwork:     {name:'Patchwork',     desc:'Stitched and Thick-boned in one. Stitched can raise it twice per room.', story:'More thread than flesh now, and the thread holds better.'},
  pristine:      {name:'Pristine',      desc:'Unmarred and Vicious in one. Immune to Sundered.', story:'Not a scratch on it, and no blow has yet found where to begin one.'},
  blur:          {name:'Blur',          desc:'Swift and Frenzied in one. Its extra strikes can crit and carry its on-hit effects.', story:'You see it start the blow. You never see it finish.'},
  bloodfiend:    {name:'Bloodfiend',    desc:'Leeching and Wrathful in one. Below half HP it heals for 50% of the damage it deals.', story:'The more it bleeds, the more it drinks.'},
  ironbound:     {name:'Ironbound',     desc:'Stalwart and Warded in one. Immune to Hexed and Chilled.', story:'Bound in old iron bands. Curses and cold slide off them.'},
  bonebreaker:   {name:'Bonebreaker',   desc:'Crushing and Vicious in one. +25% damage to Sundered foes.', story:'Once it hears a bone crack, it goes looking for the rest.'},
  witchrot:      {name:'Witchrot',      desc:'Hexing and Necrotic in one. A Hexed foe it hits is Blighted too, and a Blighted foe it hits is Hexed too.', story:'Curse and rot feed each other in whatever it touches.'},
  deathlesshusk: {name:'Deathless Husk',desc:'Grave-bound and Stitched in one. Stitched raises it at 50% HP, and it never shatters.', story:'An empty shell that refuses to stay down. There is nothing left in it to break.'},
  glaciermaul:   {name:'Glaciermaul',   desc:'Rimeborn and Crushing in one. Its hits on Chilled foes always Sunder.', story:'Frozen bone breaks clean. It knows.'},
  pyreheart:     {name:'Pyreheart',     desc:'Cinderborn and Wrathful in one. Below half HP every hit Burns.', story:'Wound it and the fire inside shows through the cracks.'}
});
const stImmune=(u,k)=>(k==='chilled'&&(hasTrait(u,'shatterwrought')||hasTrait(u,'ironbound')))||(k==='hexed'&&hasTrait(u,'ironbound'))||(k==='sundered'&&hasTrait(u,'pristine'));
const CMD_ELITE=.2, CMD_BOSS=.4;   // chance an elite or a boss rises as a Commander (and again at each evolution)
const canLead=m=>!!(m&&(m.elite||m.boss));
function rollTrait(have){ const left=TRAIT_IDS.filter(t=>!have.includes(t)); return left.length?pick(left):null; }
function rollCommand(m){ if(canLead(m)&&!hasTrait(m,'commander')&&Math.random()<(m.boss?CMD_BOSS:CMD_ELITE)){ m.traits.push('commander'); return true; } return false; }
function checkEvolve(m){
  m.traits=m.traits||[]; if(m.lvl0==null) m.lvl0=m.lvl;
  while((m.stage||0)<STAGE_MAX&&m.lvl>=m.lvl0+EVOLVE_AT[(m.stage||0)+1]){
    m.stage=(m.stage||0)+1; const t=rollTrait(m.traits); if(t) m.traits.push(t); const led=rollCommand(m); tally('evolved'); if(m.stage===2) tally('elder'); if(m.stage===3) tally('ancient'); if(m.stage===4) tally('eternal');
    const msg=m.nick+' evolves into '+withArticle(mName(m))+(t?' and becomes '+TRAITS[t].name:'')+(led?'. It can now lead raids as a Commander':'')+'.'; moment(m.nick+' evolves: '+mName(m),'ok');
    if(S.run&&S.mode!=='battle') S.run.events.push({m:msg,c:'ok'}); else notify(msg,'ok');
    sfx('level');
  }
}

// ===== EVOLUTION MARKS =====
// At Elder (stage 2) a minion picks one of its role's two marks; at Eternal (stage 4) it empowers that mark (its numbers doubled) or takes
// the other at base strength. m.marks holds the picks in order; a mark picked twice is empowered. A choice never interrupts a fight: it
// waits (markPend, worked out from the stage, so old saves get theirs free) until you make it out of battle. Fusion: the survivor keeps its marks.
// Tuning: v is each mark's base number (doubled when empowered); MARK_AT the stages that bring a choice.
const MARK_AT=[2,4], BUTCHER_LOW=.4, MARK_WARD_CAP=.6;   // MARK_WARD_CAP: a Warden's ward tops out at this share of max HP, like Bone Ward
const mkPct=x=>Math.round(x*100)+'%';
const MARK={
  bulwark:  {role:'vanguard',name:'Bulwark',  v:.2, desc:x=>'Takes '+mkPct(x)+' of the single blows aimed at your back row; the foe card shows it'},
  spiked:   {role:'vanguard',name:'Spiked',   v:.1, desc:x=>'Foes that hit it take '+mkPct(x)+' of the blow back'},
  marksman: {role:'striker', name:'Marksman', v:.1, desc:x=>'+'+mkPct(x)+' crit chance'},
  volley:   {role:'striker', name:'Volley',   v:.2, desc:x=>'Also hits a second foe for '+mkPct(x)+' of the hit'},
  warden:   {role:'mender',  name:'Warden',   v:.2, desc:x=>'Its heals also ward the healed ally for '+mkPct(x)+' of the amount'},
  purifier: {role:'mender',  name:'Purifier', v:1,  desc:x=>x>1?'Each heal removes '+x+' damage-over-time effects from the healed ally':'Each heal removes one damage-over-time effect from the healed ally'},
  butcher:  {role:'reaper',  name:'Butcher',  v:.15,desc:x=>'+'+mkPct(x)+' damage to foes below '+mkPct(BUTCHER_LOW)+' HP'},
  harvester:{role:'reaper',  name:'Harvester',v:1,  desc:x=>x>1?'Its first '+x+' kills each room harvest a Soul each':'Its first kill each room harvests a Soul'}
};
const MARK_IDS=Object.keys(MARK);
const roleMarks=r=>MARK_IDS.filter(k=>MARK[k].role===r);
const markLv=(m,k)=>m&&Array.isArray(m.marks)?m.marks.filter(x=>x===k).length:0;
const markV=(m,k)=>markLv(m,k)*MARK[k].v;   // 0 without the mark
const markDue=m=>m&&!m.thrall?MARK_AT.filter(s=>(m.stage||0)>=s).length:0;
const markPend=m=>Math.max(0,markDue(m)-((m&&m.marks)||[]).length);
const markOpts=m=>{ const r=roleMarks(m.role), c=m.marks||[]; return c.length?[c[0],r.find(k=>k!==c[0])]:r; };   // first choice: the two marks; second: empower the first, or the other
const markDesc=(m,k)=>MARK[k].desc(Math.max(1,markLv(m,k))*MARK[k].v);
const normMarks=m=>{ const r=roleMarks(m.role), a=(Array.isArray(m.marks)?m.marks:[]).filter(k=>r.includes(k)).slice(0,markDue(m)); if(a.length) m.marks=a; else delete m.marks; };   // save repair
function chooseMark(uid,k){ if(S.mode==='battle') return false; const m=findMinion(uid); if(!m||!markPend(m)||!markOpts(m).includes(k)) return false; (m.marks=m.marks||[]).push(k); return true; }
function bulwarkFor(tg,reach){   // a blow planned at your back row may be taken by a Bulwark in reach: rolled with the intent, so the foe card shows it
  if(!tg||rowOf(tg)!=='b') return null;
  for(const a of reach) if(a!==tg&&a.id!=='p'&&a.hp>0&&markV(a,'bulwark')&&Math.random()<markV(a,'bulwark')) return a;
  return null;
}
function markHit(m,tg,d){   // a striker's or reaper's marks after its hit: Volley's second foe, Harvester's Soul
  const r=S.run, v=markV(m,'volley');
  if(v){ const o=liveFoes().filter(x=>x!==tg); if(o.length){ const o2=pick(o), d2=Math.max(1,Math.round(d*v)); hurtFoe(o2,d2); log('Volley: '+m.nick+' also hits '+o2.name+' for '+d2+'.'); } }
  const hv=markLv(m,'harvester'); if(!hv) return;
  if(r.hvR!==r.room){ r.hvR=r.room; r.hv={}; }   // counted per room
  let n=r.enemies.filter(e=>e.hp<=0&&!e.dead).length;   // fallen this action: checkDeaths runs after every minion
  while(n-->0&&(r.hv[m.uid]||0)<hv){ r.hv[m.uid]=(r.hv[m.uid]||0)+1; if(gainSoul()) log('Harvester: '+m.nick+' harvests a Soul ('+r.souls+'/'+SOUL_MAX+').','ok'); }
}
function markHeal(m,a,h){   // a mender's marks after it heals a: Warden's ward, Purifier's cleanse
  const who=a.id==='p'?'you':a===m?'itself':nameOf(a), w=Math.round(h*markV(m,'warden'));
  if(w>0){ if(a.id==='p'){ const P=S.player; P.shield=Math.max(P.shield||0,Math.min(Math.round(pMax()*MARK_WARD_CAP),(P.shield||0)+w)); } else a.mw=Math.max(a.mw||0,Math.min(Math.round(a.maxHp*MARK_WARD_CAP),(a.mw||0)+w));
    log('Warden: '+m.nick+' wards '+who+' for '+w+'.','ok'); }
  for(let i=markV(m,'purifier');i>0&&a.dots;i--){ delete a.dots[Object.keys(a.dots)[0]]; if(!Object.keys(a.dots).length) delete a.dots; log('Purifier: '+m.nick+' cleanses '+who+'.','ok'); }
}

// ===== COMMANDER RAIDS =====
// A Commander (a raised elite or boss with that trait) leads a squad against a gate you have cleared, on Normal. A raid
// ordered on the War table is a standing order for tonight: the squad fights the rest of the day's runs with you and marches
// when the day ends (last watch or Rest until dawn); odds are taken then, from the squad as it is. Survivors are home at dawn.
// Win: gold, up to three pieces of gear (never a unique) and XP for every member. Loss: each follower may fall (Grave-bound
// never do); the Commander always comes home. An order can be cancelled any time before nightfall, at no cost.
// Raid pay, measured 2026-11-15 (full bot, raids on vs off, seeds 7700 and 9100): at 3x gold and half a level of minion XP raids cost
// ~1.1 hero levels by day 100 while the squad left at once (it missed the day's last run and filled its slots). With the Reserve
// (no slots then) it still cost ~0.8: the missed runs. Since raids march at nightfall that cost is gone; see RAID_GOLD/RAID_XP below.
// Marching at nightfall, measured 2026-11-19 (full, raids on vs off at day 100): seed 7700 58.6 vs 59.1, seed 9100 58.9 vs 58.5, gates
// within 4 points either way: even, inside the noise. Raids pay no hero XP, so pulling the pay back would only make them a loss; it stays.
// 2026-11-19: with sieges the full bot on Normal (heat:0) reached 92-93% against a 91% guard rail. Lower siege pay alone left 92%;
// raid pay back to 3x gold and half a level of XP brought it to 91% (default full 87%, gates 77-91%, sieges held 83%).
const RAID_SQUAD=2, RAID_K=.6, RAID_MIN=.05, RAID_MAX=.95, RAID_GOLD=3, RAID_XP=.5, RAID_ITEM3=.5, RAID_LOSS=.3, RAID_LOG=6;
const isCommander=m=>hasTrait(m,'commander')&&canLead(m);
const raidN=()=>((S&&S.raids)||[]).reduce((a,x)=>a+x.units.length,0);
const raidHeld=res=>((S&&S.raids)||[]).reduce((a,x)=>a+(Array.isArray(x.res)?x.units.filter(m=>x.res.includes(m.uid)===res).length:0),0);   // places marched raiders keep overnight: army places, or Reserve places (res)
const armyUsed=()=>S.army.filter(m=>!m.thrall&&!m.wall).length+raidHeld(false);   /* a siege thrall or a minion on the wall holds no slot */   // raiders march at nightfall and keep their places overnight, so a siege raise cannot fill them; at dawn they step back in
const raidPool=()=>S.army.concat(S.reserve||[]);   // a squad may be picked from the army and the Reserve
const squadMax=m=>1+RAID_SQUAD+(m.stage||0)+(m.boss?1:0)+bannerSquad()+warSquadN();   /* Banner of the Host (game-brew.js), the War Room (game-town2.js) */   // the Commander and its followers
const raidGates=()=>DUNGEONS.map((D,i)=>i).filter(i=>i<GATE_N&&S.ti&&S.ti.clr&&S.ti.clr[i]);
function gateThreat(di){ const lv=RK[di].lv+2, f=mobStats(di,lv,1,1,false,false), b=mobStats(di,lv+2,1,1,true,false); return {hp:f.hp*13+b.hp,atk:f.atk*3+b.atk*.5}; }
function bestSquad(){ const P=raidPool(), c=P.filter(isCommander).sort((a,b)=>b.atk*b.maxHp-a.atk*a.maxHp)[0]; if(!c) return null;
  return [c].concat(P.filter(m=>m!==c).sort((a,b)=>b.atk*b.maxHp-a.atk*a.maxHp).slice(0,squadMax(c)-1)); }   // what a gate card's raid odds assume
function raidOdds(units,di){
  if(!units.length||!RK[di]) return 0; const T=gateThreat(di); let atk=0,hp=0; for(const m of units){ atk+=m.atk; hp+=m.maxHp; }
  const c=units.find(isCommander), lead=c?1+.1*(c.stage||0)+(c.boss?.15:0):1, x=Math.sqrt(atk*hp/(T.hp*T.atk))*lead/RAID_K;   // the squad's strength against the gate's, like for like
  return clamp(x/(1+x)+warOdds(),RAID_MIN,RAID_MAX);   /* the War Room (game-town2.js) */
}
const raidOrders=()=>(S&&S.raidOrders)||[];
const inOrder=m=>raidOrders().some(o=>o.cu===m.uid||o.uids.includes(m.uid));   // already promised to tonight's march
const orderSquad=o=>{ const P=raidPool(), c=P.find(m=>m.uid===o.cu); return c?[c].concat(o.uids.map(u=>P.find(m=>m.uid===u&&m!==c)).filter(Boolean)):[]; };   // who would march now: the shattered and released are simply gone
function sendRaid(cu,di,uids){   // order a raid for tonight: nobody leaves until the day ends
  if(S.mode!=='town') return false; const P=raidPool(), c=P.find(m=>m.uid===cu); if(!isCommander(c)||!raidGates().includes(di)||inOrder(c)) return false;
  const fol=[...new Set(uids||[])].map(u=>P.find(m=>m.uid===u&&m!==c)); if(fol.some(m=>!m||inOrder(m))||!fol.length||fol.length>squadMax(c)-1) return false;   // a Commander never marches alone
  const o={di,day:S.day,cu:c.uid,uids:fol.map(m=>m.uid)}; bannerTake(o); S.raidOrders=raidOrders().concat([o]); tally('raidsSent'); sfx('raise'); return true;
}
function recallRaid(i){ if(S.mode!=='town'||!S.raidOrders||!S.raidOrders[i]) return false; S.raidOrders.splice(i,1); return true; }   // cancel tonight's order: free, any time before nightfall
function marchRaids(){   // nightfall: every standing order marches with the squad as it now is
  const os=raidOrders(); S.raidOrders=[];
  for(const o of os){ const units=orderSquad(o), c=units[0];
    if(!c||!isCommander(c)||!raidGates().includes(o.di)){ notify('Tonight\'s raid on the '+DUNGEONS[o.di].name+' lapses: its Commander is gone.','bad'); continue; }
    if(units.length<2){ notify('Tonight\'s raid on the '+DUNGEONS[o.di].name+' lapses: '+c.nick+' has no one left to lead.','bad'); continue; }
    const res=units.filter(m=>inReserve(m)).map(m=>m.uid);   // where each marched from: its place waits for it
    S.army=S.army.filter(m=>!units.includes(m)); if(S.reserve) S.reserve=S.reserve.filter(m=>!units.includes(m)); units.forEach(m=>{ m.hp=m.maxHp; delete m.dots; delete m.st; });
    S.raids=(S.raids||[]).concat([Object.assign({di:o.di,day:S.day,units,res,odds:bannerOdds(o,raidOdds(units,o.di))},o.bn?{bn:o.bn}:{})]); }
}
function resolveRaid(x){
  const D=DUNGEONS[x.di], lead=x.units[0], won=Math.random()<(typeof x.odds==='number'?x.odds:raidOdds(x.units,x.di));   /* odds as they marched */ let msg, lost=[];
  if(won){
    const g=Math.round((15+S.player.lvl*4)*(1+x.di)*RAID_GOLD*ngpReward()*bannerGold(x)*warGold()); S.gold+=g; let items=0, full=0;
    for(let i=0;i<3;i++){ if(i===2&&Math.random()>=RAID_ITEM3) break; const id=pickNorm(tableFor(x.di,'vanguard',i===0,false).filter(r=>!ITEM[r.id].uq)); if(addItem(id)) items++; else full++; }
    x.units.forEach(m=>minionXp(m,Math.round(mneed(m.lvl)*RAID_XP))); tally('raidWins');
    msg=lead.nick+' is back from the '+D.name+' in triumph: +'+g+' gold'+(items?', '+items+' piece'+(items>1?'s':'')+' of gear':'')+(full?' ('+full+' left behind: your bag is full)':'')+'.';
  } else {
    x.units.forEach((m,i)=>{ if(i>0&&!hasTrait(m,'gravebound')&&Math.random()<RAID_LOSS){ lost.push(m); returnGear(m); memorialize(m,{raid:x.di}); } });
    x.units=x.units.filter(m=>!lost.includes(m)); x.units.forEach(m=>minionXp(m,Math.round(mneed(m.lvl)*RAID_XP*.25)));
    msg=lead.nick+'\'s raid on the '+D.name+' was thrown back'+(lost.length?'. Fallen: '+lost.map(m=>m.nick).join(', '):'. Everyone made it home')+'.';
  }
  msg+=homeLine(x.units.map(m=>placeMinion(m,Array.isArray(x.res)&&x.res.includes(m.uid)))); /* back to the place each left */ notify(msg,won?'ok':'bad');
  S.raidLog=[{day:S.day,di:x.di,won,nick:lead.nick,lost:lost.length}].concat(S.raidLog||[]).slice(0,RAID_LOG);
  return {won,lost:lost.length};
}
const homeLine=w=>{ const r=w.filter(x=>x==='reserve').length, g=w.filter(x=>x==='gate').length;   // where homecomers went when the army was full
  return (r?' '+r+' went to the Reserve: your army is full.':'')+(g?' '+g+' wait at the gate: your army and Reserve are full.':''); };
function resolveRaids(){ const out=S.raids||[]; S.raids=[]; return out.map(resolveRaid); }
function raidDayLine(rr){ if(!rr||!rr.length) return ''; const w=rr.filter(x=>x.won).length, b=rr.length-w, f=rr.reduce((a,x)=>a+x.lost,0);   // one line for the new-day message
  return ' Raids: '+[w?w+' won':'',b?b+' thrown back':'',f?f+' fallen':''].filter(Boolean).join(', ')+'.'; }

// ===== THE RIFT =====
// Endless endgame: from level 40, once the Throne of Ash has fallen. Each depth is a five-room run through a random gate's
// dead, risen to your level and hardened by depth; rewards rise with it. Clearing your deepest depth opens the next and
// leaves an extra legendary. RIFT_STEP .1->.3 on 2026-11-26: with the Soul Tether the market bot reached depth ~45 instead of ~23 (full ~18 instead of ~10).
const RIFT_LV=40, RIFT_ROOMS=5, RIFT_STEP=.55, RIFT_DROP=.05, RIFT_DROP_MAX=2.5;
const riftOpen=()=>!!(S.ti&&S.ti.clr&&S.ti.clr[5])&&S.player.lvl>=RIFT_LV;
const riftBest=()=>(S.rift&&S.rift.best)||0;
const riftMul=n=>1+RIFT_STEP*(n-1);
const riftLvl=n=>S.player.lvl+Math.floor(n/3);
function startRift(n){
  n=Math.floor(+n); if(S.mode!=='town'||S.watches<=0||!riftOpen()||!(n>=1&&n<=riftBest()+1)) return false;
  const di=Math.floor(Math.random()*GATE_N);   /* the Rift folds the six gates of the valley, never the abbey */
  S.watches--; S.runs++; S.notices=[];
  S.run={di,rift:n,room:0,rooms:RIFT_ROOMS,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:null,heat:0};
  S.mode='battle'; titheSouls(); tally('riftRuns');
  log('You tear the Rift open at depth '+n+'. The dead of the '+DUNGEONS[di].name+' wait beyond it.');
  spawnRoom(); return true;
}
function riftScale(list){   // rift foes stand at the deepest gate's strength, at your level, hardened by depth
  const r=S.run, n=r.rift; if(!n) return;
  for(const e of list){ const a=mobStats(5,e.lvl,1,1,false,false), b=mobStats(e.rankI,e.lvl,1,1,false,false), k=riftMul(n);
    e.maxHp=e.hp=Math.round(e.maxHp*a.hp/b.hp*k); e.atk=Math.max(1,Math.round(e.atk*a.atk/b.atk*k)); e.rankI=5; e.rift=true; }
}
function riftCleared(r){
  r.cleared=true; S.quest.clears++; tally('rifts'); S.rift=S.rift||{best:0};
  if(r.rift>S.rift.best){ S.rift.best=r.rift; r.riftRec=true; recBest('rift',r.rift); const pool=Object.values(ITEM).filter(d=>!d.uq&&!d.tower&&d.tier===4&&d.set!==ABBEY); r.loot.push(pick(pool).id);
    moment('Rift depth '+r.rift+' conquered','gold'); }
  if(!r.hurt) tally('flawless'); riftFast(r);
  return Math.round(RK[5].clear*(1+.15*r.rift));
}

// ===== FIRST-TIME TIPS =====
// Each tip shows once, the first time its moment comes up. Seen tips are stored in S.tips; Settings can bring them back.
// One guidance box at a time: the first tip in this order whose moment applies, so the first hour runs stats, fight, raise, traits;
// in town a waiting story note stays hidden under it (notesHTML), and after a room whose log holds a story note the tip waits for the next screen.
const TIPS=[
  {id:'stats',  t:'Spend your points', m:'Strength: Strike. Constitution: HP. Intelligence: mana and skills. Will: army and raise odds. Press + by a stat.', when:()=>S.mode==='town'&&S.player.pts>0&&S.player.lvl===1},
  {id:'battle', t:'How a fight works', m:'Pick a target; your army strikes with you. 1 Strike: mana. 2 Soul Siphon: heal and a Soul. 3 Bone Ward: shield. Then foes hit back.', when:()=>S.mode==='battle'},
  {id:'raise',  t:'Raise the dead', m:'Every kill leaves a body. Raising costs mana and can fail; your first never does. Will and level lift the odds.', when:()=>S.mode==='raise'&&S.run&&S.run.corpses.length>0},
  {id:'trait',  t:'Minion traits', m:'Each minion has a trait. It evolves 5 and 10 levels after it rose: stronger, with another trait.', when:()=>(S.mode==='town'||S.mode==='raise')&&S.army.some(m=>m.traits&&m.traits.length)},
  {id:'skill',  t:'You have a skill point', m:'Open the Skills tab and learn Bone Spear. Active skills appear in battle on keys 4 and up. You get one point every level.', when:()=>S.mode==='town'&&S.player.sp>0},
  {id:'armor',  t:'These foes wear armor', m:'Armor blunts every hit you and your army land, so fights take longer. Bone Spear pierces half of it, and Corpse Explosion and Reap ignore it completely.', when:()=>S.mode==='battle'&&foeArmor()>=.5},
  {id:'boss',   t:'A boss is winding up', m:'Moves marked Charging land next turn. Raise Bone Ward to soak the hit, or freeze the boss with Grave Chill to break its focus and cancel the move.', when:()=>S.mode==='battle'&&S.run&&liveFoes().some(e=>e.charging)},
  {id:'trophy', t:'Trophies', m:'Fallen foes drop trophies. Sell them at the Market, forge six from one gate into gear, or brew four into a potion.', when:()=>S.mode==='town'&&Object.keys(S.trophies).length>0},
  {id:'market', t:'The Bone Market', m:'Buy potions (drunk in battle with Q and W) and Grave Salts, buy or forge gear, empower minions at the Bone Altar, and sell what you do not need.', when:()=>S.mode==='town'&&ui.tab==='market'},
  {id:'defeat', t:'You fell', m:'Come back stronger, or try an easier gate.', when:()=>S.mode==='defeat'},
  {id:'event',  t:'Something between rooms', m:'Sometimes a room leaves something behind: a blood shrine, a pedlar, a sealed coffer or a wounded straggler. Each offers a choice. Walking past is always safe.', when:()=>S.mode==='raise'&&S.run&&S.run.event&&!S.run.event.done},
  {id:'dots',   t:'Bleeding and burns', m:'Enemy strikers\' crits make you bleed, and Cinder Waves burn. These tick at the end of each turn and ignore your ward. A Healing Draught cures you; Dark Mending cures your whole side.', when:()=>S.mode==='battle'&&allies().some(a=>a.dots)},
  {id:'rolls',  t:'Bonus lines', m:'Gear can roll extra stat lines, shown in green under its base stats. Each line raises the sell price. Reforge (Gear tab) re-rolls them for gold.', when:()=>S.mode==='town'&&S.inv.some(it=>it.ro)},
  {id:'curse',  t:'A cursed gate', m:'Each day one gate you have cleared is cursed with a twist that makes it harder. In return it pays double gold and trophies, more XP and more gear.', when:()=>S.mode==='town'&&(ui.tab||'gates')==='gates'&&dayMod().gi>=0},
  {id:'doors',  t:'Choose your way', m:'Pick the next room: an ordinary fight, a bloodied arch with stronger foes and better loot, a quiet ossuary to rest, or a sealed vault.', when:()=>S.mode==='raise'&&S.run&&S.run.doors&&S.run.doors.length>1},
  {id:'cmd',    t:'Give orders', m:'Each kind of minion can take one order per room, for free: Taunt, Focus, Bone Shield or Execute. The buttons sit above your skills.', when:()=>S.mode==='battle'&&S.army.some(m=>m.hp>0)},
  {id:'skmod',  t:'Choose an upgrade', m:'One of your skills reached its last rank. Open the Skills tab and choose one of its two upgrades.', when:()=>S.mode==='town'&&SKILLS.some(x=>sk(x.id)>=SK_MAX&&!skMod(x.id))},
  {id:'affix',  t:'Elite affixes', m:'Elites carry affixes, shown on their card: Shielded, Splitting, Vampiric, Enraged or Warded. Hover one to read it. Raise a fallen elite and the minion keeps one as a trait.', when:()=>S.mode==='battle'&&S.run&&liveFoes().some(e=>e.aff)},
  {id:'phase',  t:'A second phase', m:'At half HP a boss turns dangerous: it moves sooner and adds Sundering Blow. Every move is announced a turn ahead. Taunt sends the blow at a vanguard, and a Focus crit or Grave Chill breaks a charging move.', when:()=>S.mode==='battle'&&S.run&&liveFoes().some(e=>e.phase2)},
  {id:'bounty', t:'A bounty is done', m:'You finished a contract on the bounty board in the side panel. Claim it in town before dawn.', when:()=>S.mode==='town'&&S.bounty&&S.bounty.day===S.day&&S.bounty.list.some(b=>!b.claimed&&bountyDone(b))},
  {id:'salvage',t:'Salvage and enchant', m:'Gear you will not wear can be salvaged into bone dust on the Gear tab. Dust enchants gear (add or re-roll a bonus line) and builds the higher levels of town buildings.', when:()=>S.mode==='town'&&ui.tab==='gear'&&S.inv.length>=6&&workOpen()},
  {id:'townopen',t:'The town opens', m:'A Town tab has appeared: build up the necropolis and fuse minions in the Flesh Pit. A bounty board in the side panel now holds up to three contracts, with a new one each dawn.', when:()=>S.mode==='town'&&townOpen()},
  {id:'reserve',t:'The Reserve', m:'Your army list now has a Reserve below it: a bench for minions you want to keep but not take along. Benched minions do not fight or grow. Moving one in or out is free, in town. When your army is full, a raised body can go straight to the Reserve.', when:()=>S.mode==='town'&&reserveOpen()},
  {id:'faith',  t:'The Old Shrine', m:'The Old Shrine on the Town tab now takes an oath: Honored One or Dishonored One. Each path gives a bonus and takes something in return.', when:()=>S.mode==='town'&&townOpen()&&faithOpen()&&!faithOf()},
  {id:'ult',    t:'Your ultimate awaits', m:'At level 20 you can choose an ultimate on the Skills tab. Soul Siphon, elites and bosses give Souls; with five, press R in battle to unleash it.', when:()=>S.mode==='town'&&S.player.lvl>=ULT_LV&&!S.player.ult},
  {id:'siege',  t:'A siege is coming', m:'The living march on the necropolis tomorrow at dusk. When the day ends you defend it in three waves. Each building lends a perk (Town tab), and a raid ordered for tonight marches before they come. Hold, and the town pays; fall, and a building burns until you repair it.', when:()=>S.mode==='town'&&siegeWarned()},
  {id:'raid',   t:'A Commander', m:'One of your minions can lead. Open the War table under the Gates tab to order it and a squad against a gate you have cleared. They fight beside you until nightfall, march when the day ends and come back at dawn.', when:()=>S.mode==='town'&&raidPool().some(isCommander)},
  {id:'rift',   t:'The Rift', m:'The Rift is open, under the Gates tab. Every depth is harder than the last, and there is no bottom.', when:()=>S.mode==='town'&&riftOpen()},
  {id:'heat',   t:'Harder gates', m:'You have cleared a gate, so its card now offers Hard difficulty: stronger foes for more XP, gold and gear. Clear each level to open the next. On a cursed day the two stack.', when:()=>S.mode==='town'&&!T_('heat1')&&DUNGEONS.some((D,i)=>heatMax(i)>0)},
  {id:'bless',  t:'Full devotion', m:'You have kept your oath long enough: its blessing is now active. The Old Shrine on the Town tab shows what it does.', when:()=>S.mode==='town'&&!!faithOf()&&blessed(faithOf())},
  {id:'records',t:'Records', m:'The Ledger tab keeps your best: deepest floor, biggest hit, most kills, and the fastest clear of each gate. Beat one and you will hear about it.', when:()=>S.mode==='town'&&S.runs>=10},
  {id:'nightmare',t:'Nightmare', m:'A gate now offers Nightmare: foes three times as strong, rewards to match, and a title of its own for the clear.', when:()=>S.mode==='town'&&DUNGEONS.some((D,i)=>heatMax(i)>=3)},
  {id:'omen',   t:'An omen', m:'Some days carry an omen that touches every gate and the Tower. Today\'s is shown above the gates.', when:()=>S.mode==='town'&&!!omen()},
  {id:'kits',   t:'Every foe has a trick', m:'Foes carry kits: a rule of their own, such as shielding an ally or bursting when they die. A "Kit ?" chip means you have not studied that kind yet; study it and the chip names the kit. Hover it to read the rule.', when:()=>S.mode==='battle'&&S.run&&liveFoes().some(e=>kitOf(e))},
  {id:'types',  t:'Weak and resistant', m:'Above the foes you can see what this place is weak to and what it resists. Each hit has a type: Strike and most minions are physical, Soul Siphon and Reap shadow, Grave Chill frost, Corpse Explosion and poison rot. The right type hits harder.', when:()=>S.mode==='battle'&&S.run&&S.player.lvl>=4&&DT_IDS.some(t=>placeRes()[t]<0)},
  {id:'sweep',  t:'Sweep an outgrown gate', m:'A gate far below you can now be swept from its card: one watch wins the whole run at once, with 80% kill XP and the usual spoils, but nothing to raise.', when:()=>S.mode==='town'&&(ui.tab||'gates')==='gates'&&DUNGEONS.some((D,i)=>sweepOk(i))},
  {id:'tower',  t:'The Hell Tower is open', m:'A separate 100-floor climb, one fight per floor, with a unique item on every tenth floor. Floors you clear become checkpoints.', when:()=>S.mode==='town'&&towerOpen()},
];
const currentTip=()=>{ if(!S||(S.tips&&S.tips.off)) return null; if(S.mode==='raise'&&S.run&&(S.run.events||[]).some(e=>e.c==='story')) return null; try{ return TIPS.find(t=>!(S.tips&&S.tips[t.id])&&t.when())||null; }catch(e){ return null; } };
function dismissTip(id){ S.tips=S.tips||{}; S.tips[id]=1; }

