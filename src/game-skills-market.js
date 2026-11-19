// ===== SKILLS =====
// One skill point per level. Each skill has three ranks; rank n needs level lv+(n-1)*SK_STEP.
// Actives cost mana and have a cooldown in turns (cooldowns reset each room). Passives always apply.
const SK_MAX=3, SK_STEP=5;
const SKILLS=[
 {id:'spear',name:'Bone Spear',type:'active',lv:2,cost:10,cd:2,desc:r=>'Hurl a lance of bone at your target for '+(70+15*r)+'% of your Strike plus Siphon. Pierces half of foe armor.'},
 {id:'bonearmor',name:'Bone Armor',type:'passive',lv:3,desc:r=>'+'+(6*r)+'% max HP.'},
 {id:'mend',name:'Dark Mending',type:'active',lv:4,cost:12,cd:3,desc:r=>'Knit your minions back together. Each one heals '+(15+8*r)+'% of its max HP, and you and your army are cured of bleeding, burns and poison.'},
 {id:'blast',name:'Corpse Explosion',type:'active',lv:5,cost:10,cd:3,desc:r=>'Detonate a body that fell this room. Every foe takes '+(60+20*r)+'% of your Siphon, ignoring armor. That body can no longer be raised.'},
 {id:'soulwell',name:'Soul Well',type:'passive',lv:6,desc:r=>'+'+r+' mana every turn in battle.'},
 {id:'curse',name:'Curse of Frailty',type:'active',lv:7,cost:8,cd:4,desc:r=>'Your target takes '+(15+10*r)+'% more damage from every source for 3 turns.'},
 {id:'robber',name:'Grave Robber',type:'passive',lv:8,desc:r=>'+'+(5*r)+'% gold from kills.'},
 {id:'gravepact',name:'Grave Pact',type:'passive',lv:9,desc:r=>'+'+(6*r)+'% minion power.'},
 {id:'chill',name:'Grave Chill',type:'active',lv:10,cost:14,cd:5,desc:r=>'Deal 50% of your Siphon and freeze your target for '+(r>=3?'2 turns':'1 turn')+'. Bosses resist '+(60-10*r)+'% of the time.'},
 {id:'scholar',name:'Forbidden Lore',type:'passive',lv:11,desc:r=>'+'+(4*r)+'% XP from kills.'},
 {id:'edge',name:'Necrotic Edge',type:'passive',lv:12,desc:r=>'Strike deals '+(10*r)+'% more damage.'},
 {id:'frenzy',name:'Unholy Frenzy',type:'active',lv:13,cost:15,cd:6,desc:r=>'Your minions deal '+(20+15*r)+'% more damage for 3 turns.'},
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
const freeCorpse=()=>S.run&&S.run.corpses.find(c=>!c.tried);
function skCd(id){ return (S.run&&S.run.cd&&S.run.cd[id])||0; }
function canUse(id){
  const s=SKILL[id]; if(S.mode!=='battle'||!s||s.type!=='active'||!sk(id)) return false;
  if(S.run.silence>0) return false;   // Hymn of Silence
  if(skCd(id)>0||S.player.mana<s.cost) return false;
  if(id==='blast'&&!freeCorpse()) return false;
  if(id==='mend'&&!S.army.some(m=>m.hp>0&&m.hp<m.maxHp)&&!allies().some(a=>a.dots)) return false;
  return true;
}
function useSkill(id,t){
  if(!canUse(id)) return false;
  const s=SKILL[id], rk=sk(id), r=S.run, P=S.player;
  P.mana-=s.cost; r.cd=r.cd||{}; r.cd[id]=s.cd+1; tally('sk_'+id);   // +1: the end-of-turn tick runs this same turn
  if(id==='spear'){ const d=hit((pAtk()+pSiph())*(.7+.15*rk)*pierceMul(hasMod('spear','a')?1:.5)); hurtFoe(t,d); log('Bone Spear impales '+t.name+' for '+d+'.'); fxe('spear',t);
    if(hasMod('spear','b')){ const o=liveFoes().filter(x=>x!==t); if(o.length){ const o2=pick(o), d2=Math.round(d*.5); hurtFoe(o2,d2); log('A splinter tears into '+o2.name+' for '+d2+'.'); } } }
  else if(id==='blast'){ const c=freeCorpse(); c.tried=true; c.result='exploded'; const base=pSiph()*(.6+.2*rk)*pierceMul(1)*(hasMod('blast','a')?1.3:1); let tot=0; for(const o of liveFoes()){ const d=hit(base); hurtFoe(o,d); fxe('burst',o); tot+=d; if(hasMod('blast','b')) addDot(o,'poison',pSiph()*.15,3); } log('The body of '+c.name+' bursts apart, dealing '+tot+' damage across the room.'); }
  else if(id==='mend'){
    let tot=0;
    const cured=allies().some(a=>a.dots);
    for(const m of S.army) if(m.hp>0) tot+=healAlly(m,Math.round(m.maxHp*(.15+.08*rk+(hasMod('mend','a')?.15:0))));
    if(hasMod('mend','b')) tot+=healAlly(P,Math.round(pMax()*.15));
    if(cured) tally('cures');
    allies().forEach(clearDots);
    fxe('mend',P);
    log('Dark Mending knits your army back together for '+tot+' HP'+(cured?' and cures every wound and burn':'')+'.','ok');
  }
  else if(id==='curse'){ const turns=hasMod('curse','a')?5:3, bonus=.15+.1*rk;
    if(hasMod('curse','b')){ for(const o of liveFoes()){ o.curse={mul:1+bonus*.8,t:turns}; mark(o,0,0); } log('Every foe is cursed and takes '+Math.round(bonus*80)+'% more damage.'); }
    else { t.curse={mul:1+bonus,t:turns}; mark(t,0,0); log(t.name+' is cursed and takes '+Math.round(bonus*100)+'% more damage.'); } }
  else if(id==='chill'){ const d=hit(pSiph()*.5*dmgMul()); hurtFoe(t,d); fxe('ward',t); const held=!t.boss||Math.random()*100<40+10*rk+(hasMod('chill','a')?20:0);
    if(held&&t.hp>0){ t.stun=rk>=3?2:1; tally('frozen'); log('Grave Chill hits '+t.name+' for '+d+' and freezes it solid.'); } else log('Grave Chill hits '+t.name+' for '+d+', but it shakes off the frost.'); }
  else if(id==='frenzy'){ r.frenzy=hasMod('frenzy','a')?5:3; r.frenzyMul=1+(.2+.15*rk); if(hasMod('frenzy','b')) for(const m of S.army) if(m.hp>0) healAlly(m,Math.round(m.maxHp*.15)); log('Unholy Frenzy: your army surges with '+Math.round((r.frenzyMul-1)*100)+'% more damage.','ok'); }
  else if(id==='reap'){ const low=t.hp<t.maxHp*(hasMod('reap','a')?.5:.35); let d=hit(pSiph()*(1.2+.3*rk)*pierceMul(1)); if(low) d*=2; hurtFoe(t,d); fxe('strike',t,{crit:1}); if(t.hp<=0&&hasMod('reap','b')) P.mana=Math.min(pMana(),P.mana+10); log('You reap '+t.name+' for '+d+(low?' (harvest)':'')+'.'); }
  return true;
}
function skillTick(){
  const r=S.run;
  if(r.cd) for(const k in r.cd) if(r.cd[k]>0) r.cd[k]--;
  if(r.frenzy>0) r.frenzy--;
  r.tt=(r.tt||0)+1;   // turns this run, for the fastest-clear record
  if(r.silence>0) r.silence--;
  if(r.taunt>0) r.taunt--;
  for(const e of r.enemies) if(e.curse&&--e.curse.t<=0) delete e.curse;
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
const TROPHY_VAL=[3,7,14,26,45,75];          // sell value of an ordinary trophy, per gate
const TROPHY={};                             // key -> {name, value, ico, rankI}
(function(){
  const h=s=>{ let x=0; for(const c of s) x=(x*31+c.charCodeAt(0))|0; return Math.abs(x); };
  const add=(key,name,value,ico,rankI,gate)=>{ if(!TROPHY[key]) TROPHY[key]={name,value,ico,rankI,gate}; };
  const part=(n,role)=>{ const p=TROPHY_PART[role]||TROPHY_PART.vanguard; return n+' '+p[h(n)%p.length]; };
  DUNGEONS.forEach((D,i)=>{ D.mobs.forEach(m=>add(m[0],part(m[0],m[1]),TROPHY_VAL[i],m[0],i,i)); add('b:'+D.boss[0],'Heart of '+D.boss[0],TROPHY_VAL[i]*10,D.boss[0],i,i); });
  TW_MOBS.forEach(m=>add('t:'+m[0],part(m[0],m[1]),40,m[0],4));
  TW_BOSS.forEach((n,i)=>add('b:'+n,'Heart of '+n,120*(i+1),n,5));
  SECRET.forEach((B,i)=>add('b:'+B.name,'Heart of '+B.name.replace(/^The /,''),TROPHY_VAL[i]*40,B.name,i,i));
})();
const trophyKey=e=>e.boss?'b:'+e.base:(e.tw?'t:':'')+e.base;
function killLoot(e,r){   // called once per kill, from checkDeaths
  const cursed=runMod()?MOD_GOLD:1;
  const coin=Math.max(1,Math.round((1+e.lvl*.5)*(1+e.rankI*.5)*(e.boss?5:1)*(e.secret?SB_REWARD:1)*(e.rival?RIVAL_GOLD:1)*(e.elite?2:1)*rnd(.7,1.3)*ngpReward()*cursed*heatK('gold')*(roomKind()==='elite'?ELITE_GOLD:1)*(1+xb('goldp')/100)));
  r.gold=(r.gold||0)+coin;
  const key=trophyKey(e); if(!TROPHY[key]) return;
  const n=(e.boss?1:e.elite?2:(Math.random()<.6?1:0))*cursed;
  if(n){ r.troph=r.troph||{}; r.troph[key]=(r.troph[key]||0)+n; }
}
function bankLoot(r){     // called when a room is won
  r.lastGold=r.gold||0; if(r.lastGold) sfx('coin'); r.lastTroph=r.troph||{};
  S.gold+=r.lastGold; r.goldTot=(r.goldTot||0)+r.lastGold; for(const k in r.lastTroph) S.trophies[k]=(S.trophies[k]||0)+r.lastTroph[k];
  r.gold=0; r.troph={};
}
// Potions: carried on the belt, drunk in battle as your action.
const BELT_MAX=3;
const POTIONS={
  hp:{name:'Healing Draught',key:'Q',desc:'Restores 35% of your max HP and cures bleeding, burns and poison. Drinking it uses your turn.',price:()=>15+S.player.lvl*5},
  mp:{name:'Mana Tonic',key:'W',desc:'Restores 40% of your max mana. Drinking it uses your turn.',price:()=>12+S.player.lvl*4}
};
function drink(k){
  const P=S.player; if(!S.belt[k]) return false;
  if(k==='hp'){ if(P.hp>=pMax()&&!P.dots) return false; S.belt.hp--; const h=healAlly(P,Math.round(pMax()*.35)), cured=!!P.dots; clearDots(P); tally('drank'); if(cured) tally('cures'); log('You drink a Healing Draught and recover '+h+' HP'+(cured?'. Your wounds close':'')+'.','ok'); }
  else { if(P.mana>=pMana()) return false; S.belt.mp--; tally('drank'); const m=Math.min(pMana()-P.mana,Math.round(pMana()*.4)); P.mana+=m; mark('p',0,0); log('You drink a Mana Tonic and recover '+m+' mana.','ok'); }
  return true;
}
// Market prices. Gear sells for a quarter of what the merchant asks. Uniques cannot be sold.
const SET_PRICE=[30,80,200,480,1100,2400];
const buyPrice=d=>SET_PRICE[Math.min(d.set,5)];
const sellPrice=d=>d.uq?0:Math.max(1,Math.round(buyPrice(d)*.25));
const sellValue=it=>{ const d=ITEM[it.id]; return d.uq?0:Math.round(sellPrice(d)*(1+.25*((it.ro&&it.ro.length)||0))); };   // each bonus line adds a quarter
const STOCK_N=4;
function shopStock(){   // four pieces of gear from your highest unlocked gate (and the one below); new every day and whenever a gate unlocks
  let g=0; for(let i=0;i<RK.length;i++) if(S.player.lvl>=RK[i].unlock) g=i;
  if(!S.shop||S.shop.day!==S.day||S.shop.g!==g){
    const pool=Object.values(ITEM).filter(d=>!d.uq&&d.set<=g&&d.set>=g-1), ids=[];
    while(ids.length<Math.min(STOCK_N,pool.length)){ const d=pick(pool); if(!ids.includes(d.id)) ids.push(d.id); }
    S.shop={day:S.day,g,stock:ids.map(id=>{ const s={id,sold:false}, ro=rollItem(id); if(ro) s.ro=ro; return s; })};   // rolls are shown before you buy
  }
  return S.shop.stock;
}
function buyPotion(k){ const p=POTIONS[k], cost=p&&p.price(); if(!p||S.mode!=='town'||S.belt[k]>=BELT_MAX||S.gold<cost) return false; S.gold-=cost; S.belt[k]++; sfx('coin'); return true; }
function buyStock(i){
  const s=shopStock()[i]; if(!s||s.sold||S.mode!=='town') return false; const d=ITEM[s.id], cost=buyPrice(d);
  if(S.gold<cost||S.inv.length>=bagMax()) return false;
  S.gold-=cost; s.sold=true; addItem(s.id,s.ro||null); sfx('coin'); return true;
}
function sellTrophy(k,all){ const n=S.trophies[k]||0; if(!n||!TROPHY[k]||S.mode!=='town') return 0; const q=all?n:1; S.trophies[k]-=q; if(!S.trophies[k]) delete S.trophies[k]; const g=q*TROPHY[k].value; S.gold+=g; tally('soldTro',q); sfx('coin'); return g; }
function sellAllTrophies(){ let g=0; for(const k of Object.keys(S.trophies)) g+=sellTrophy(k,true); return g; }
// Gold sinks: the Bone Altar levels a minion up (never past the usual cap of your level + 2), bag upgrades add space, salts help raising.
const empowerCost=m=>Math.round(mneed(m.lvl)*.6*(1-B_ALT_COST*bl('altar')));
function empower(uid){
  const m=findMinion(uid); if(!m||S.mode!=='town'||m.lvl>=S.player.lvl+2) return false;
  const c=empowerCost(m); if(S.gold<c) return false;
  S.gold-=c; m.lvl++; m.xp=0; tally('emp'); checkEvolve(m); syncMinion(m); m.hp=m.maxHp; sfx('raise'); return true;
}
function buyBag(){ const lv=S.bagLv||0, c=BAG_COST[lv]; if(S.mode!=='town'||c==null||S.gold<c) return false; S.gold-=c; S.bagLv=lv+1; sfx('coin'); return true; }
function buySalt(){ const c=saltPrice(); if(S.mode!=='town'||S.salts>=SALT_MAX||S.gold<c) return false; S.gold-=c; S.salts++; sfx('coin'); return true; }

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
  const set=(gi<5&&Math.random()<MASTERWORK)?gi+1:gi, pool=Object.values(ITEM).filter(d=>!d.uq&&d.set===set&&d.slot===slot); if(!pool.length) return null;
  S.gold-=forgeGold(gi); spendTrophies(Object.keys(S.trophies).filter(k=>trophyGate(k)===gi),FORGE_N,trophyPts);
  const it=addItem(pick(pool).id); sfx('level'); if(set>gi) tally('master'); return {it,master:set>gi};
}
function brew(k){
  const n=Object.values(S.trophies).reduce((a,b)=>a+b,0);
  if(S.mode!=='town'||!POTIONS[k]||S.belt[k]>=BELT_MAX||n<BREW_N) return false;
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
  warded:    {name:'Warded',      desc:'Immune to bleeding, burns and poison.'}
};
const TRAIT_IDS=Object.keys(TRAITS), STAGES=['','Greater ','Elder ','Ancient ','Eternal '], STAGE_MAX=STAGES.length-1, EVOLVE_STEP=5;
const EVOLVE_AT=[0,5,10,18,28];   // levels above the level it was raised at
const STAGE_FX=[{hp:0,atk:0},{hp:.2,atk:.1},{hp:.1,atk:.2},{hp:.15,atk:.15},{hp:.2,atk:.2}];   // what each stage adds (Greater is sturdier, Elder hits harder)
const stageMul=(m,k)=>{ let t=1; for(let i=1;i<=(m.stage||0)&&i<=STAGE_MAX;i++) t+=STAGE_FX[i][k]; return t; };
const evoNext=m=>{ const st=m.stage||0; return st<STAGE_MAX&&m.lvl0!=null?m.lvl0+EVOLVE_AT[st+1]:null; };
const fxText=f=>'+'+Math.round(f.hp*100)+'% HP, +'+Math.round(f.atk*100)+'% ATK';
const hasTrait=(m,t)=>!!(m.traits&&m.traits.includes(t));
const mName=m=>{ const s=STAGES[m.stage||0]; return m.name.startsWith('The ')?'The '+s+m.name.slice(4):s+m.name; };   // "The Elder Rat King", "Greater Crypt Ghoul"
const withArticle=n=>n.startsWith('The ')?n:(/^[AEIOU]/i.test(n)?'an ':'a ')+n;
const theName=n=>n.startsWith('The ')?n:'the '+n;
// Commander: never rolled like the others. Only a raised elite or boss can have it (at the raise, or when it evolves).
TRAITS.commander={name:'Commander',desc:'Can lead a raid on a cleared gate from the War table while you stay behind.'};
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
const armyUsed=()=>S.army.filter(m=>!m.thrall).length+raidHeld(false);   /* a siege thrall holds no slot */   // raiders march at nightfall and keep their places overnight, so a siege raise cannot fill them; at dawn they step back in
const raidPool=()=>S.army.concat(S.reserve||[]);   // a squad may be picked from the army and the Reserve
const squadMax=m=>1+RAID_SQUAD+(m.stage||0)+(m.boss?1:0);   // the Commander and its followers
const raidGates=()=>DUNGEONS.map((D,i)=>i).filter(i=>S.ti&&S.ti.clr&&S.ti.clr[i]);
function gateThreat(di){ const lv=RK[di].lv+2, f=mobStats(di,lv,1,1,false,false), b=mobStats(di,lv+2,1,1,true,false); return {hp:f.hp*13+b.hp,atk:f.atk*3+b.atk*.5}; }
function bestSquad(){ const P=raidPool(), c=P.filter(isCommander).sort((a,b)=>b.atk*b.maxHp-a.atk*a.maxHp)[0]; if(!c) return null;
  return [c].concat(P.filter(m=>m!==c).sort((a,b)=>b.atk*b.maxHp-a.atk*a.maxHp).slice(0,squadMax(c)-1)); }   // what a gate card's raid odds assume
function raidOdds(units,di){
  if(!units.length||!RK[di]) return 0; const T=gateThreat(di); let atk=0,hp=0; for(const m of units){ atk+=m.atk; hp+=m.maxHp; }
  const c=units.find(isCommander), lead=c?1+.1*(c.stage||0)+(c.boss?.15:0):1, x=Math.sqrt(atk*hp/(T.hp*T.atk))*lead/RAID_K;   // the squad's strength against the gate's, like for like
  return clamp(x/(1+x),RAID_MIN,RAID_MAX);
}
const raidOrders=()=>(S&&S.raidOrders)||[];
const inOrder=m=>raidOrders().some(o=>o.cu===m.uid||o.uids.includes(m.uid));   // already promised to tonight's march
const orderSquad=o=>{ const P=raidPool(), c=P.find(m=>m.uid===o.cu); return c?[c].concat(o.uids.map(u=>P.find(m=>m.uid===u&&m!==c)).filter(Boolean)):[]; };   // who would march now: the shattered and released are simply gone
function sendRaid(cu,di,uids){   // order a raid for tonight: nobody leaves until the day ends
  if(S.mode!=='town') return false; const P=raidPool(), c=P.find(m=>m.uid===cu); if(!isCommander(c)||!raidGates().includes(di)||inOrder(c)) return false;
  const fol=[...new Set(uids||[])].map(u=>P.find(m=>m.uid===u&&m!==c)); if(fol.some(m=>!m||inOrder(m))||!fol.length||fol.length>squadMax(c)-1) return false;   // a Commander never marches alone
  S.raidOrders=raidOrders().concat([{di,day:S.day,cu:c.uid,uids:fol.map(m=>m.uid)}]); tally('raidsSent'); sfx('raise'); return true;
}
function recallRaid(i){ if(S.mode!=='town'||!S.raidOrders||!S.raidOrders[i]) return false; S.raidOrders.splice(i,1); return true; }   // cancel tonight's order: free, any time before nightfall
function marchRaids(){   // nightfall: every standing order marches with the squad as it now is
  const os=raidOrders(); S.raidOrders=[];
  for(const o of os){ const units=orderSquad(o), c=units[0];
    if(!c||!isCommander(c)||!raidGates().includes(o.di)){ notify('Tonight\'s raid on the '+DUNGEONS[o.di].name+' lapses: its Commander is gone.','bad'); continue; }
    if(units.length<2){ notify('Tonight\'s raid on the '+DUNGEONS[o.di].name+' lapses: '+c.nick+' has no one left to lead.','bad'); continue; }
    const res=units.filter(m=>inReserve(m)).map(m=>m.uid);   // where each marched from: its place waits for it
    S.army=S.army.filter(m=>!units.includes(m)); if(S.reserve) S.reserve=S.reserve.filter(m=>!units.includes(m)); units.forEach(m=>{ m.hp=m.maxHp; delete m.dots; });
    S.raids=(S.raids||[]).concat([{di:o.di,day:S.day,units,res,odds:raidOdds(units,o.di)}]); }
}
function resolveRaid(x){
  const D=DUNGEONS[x.di], lead=x.units[0], won=Math.random()<(typeof x.odds==='number'?x.odds:raidOdds(x.units,x.di));   /* odds as they marched */ let msg, lost=[];
  if(won){
    const g=Math.round((15+S.player.lvl*4)*(1+x.di)*RAID_GOLD*ngpReward()); S.gold+=g; let items=0, full=0;
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
// leaves an extra legendary.
const RIFT_LV=40, RIFT_ROOMS=5, RIFT_STEP=.1, RIFT_DROP=.05, RIFT_DROP_MAX=2.5;
const riftOpen=()=>!!(S.ti&&S.ti.clr&&S.ti.clr[5])&&S.player.lvl>=RIFT_LV;
const riftBest=()=>(S.rift&&S.rift.best)||0;
const riftMul=n=>1+RIFT_STEP*(n-1);
const riftLvl=n=>S.player.lvl+Math.floor(n/3);
function startRift(n){
  n=Math.floor(+n); if(S.mode!=='town'||S.watches<=0||!riftOpen()||!(n>=1&&n<=riftBest()+1)) return false;
  const di=Math.floor(Math.random()*DUNGEONS.length);
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
  if(r.rift>S.rift.best){ S.rift.best=r.rift; r.riftRec=true; recBest('rift',r.rift); const pool=Object.values(ITEM).filter(d=>!d.uq&&!d.tower&&d.tier===4); r.loot.push(pick(pool).id);
    moment('Rift depth '+r.rift+' conquered','gold'); }
  if(!r.hurt) tally('flawless');
  return Math.round(RK[5].clear*(1+.15*r.rift));
}

// ===== FIRST-TIME TIPS =====
// Each tip shows once, the first time its moment comes up. Seen tips are stored in S.tips; Settings can bring them back.
const TIPS=[
  {id:'stats',  t:'Spend your points', m:'Strength powers Strike, Constitution your HP, Intelligence your mana, Siphon and Ward, and Will your army size and raise odds. Press + next to a stat.', when:()=>S.mode==='town'&&S.player.pts>0&&S.player.lvl===1},
  {id:'battle', t:'How a fight works', m:'Pick a target and your army attacks it with you. Strike (1) refills mana, Soul Siphon (2) drains, heals and harvests a Soul, Bone Ward (3) shields you. Then every foe hits back.', when:()=>S.mode==='battle'},
  {id:'raise',  t:'Raise the dead', m:'Every foe you kill leaves a body. Raising costs mana and can fail, except the very first: that one always answers. The better your Will and level, the better your odds. Raised minions fight for you and grow with every room.', when:()=>S.mode==='raise'&&S.run&&S.run.corpses.length>0},
  {id:'skill',  t:'You have a skill point', m:'Open the Skills tab and learn Bone Spear. Active skills appear in battle on keys 4 and up. You get one point every level.', when:()=>S.mode==='town'&&S.player.sp>0},
  {id:'armor',  t:'These foes wear armor', m:'Armor blunts every hit you and your army land, so fights take longer. Bone Spear pierces half of it, and Corpse Explosion and Reap ignore it completely.', when:()=>S.mode==='battle'&&foeArmor()>=.5},
  {id:'boss',   t:'A boss is winding up', m:'Moves marked Charging land next turn. Raise Bone Ward to soak the hit, or freeze the boss with Grave Chill to break its focus and cancel the move.', when:()=>S.mode==='battle'&&S.run&&liveFoes().some(e=>e.charging)},
  {id:'trophy', t:'Trophies', m:'Fallen foes drop trophies. Sell them at the Market, forge six from one gate into gear, or brew four into a potion.', when:()=>S.mode==='town'&&Object.keys(S.trophies).length>0},
  {id:'market', t:'The Bone Market', m:'Buy potions (drunk in battle with Q and W) and Grave Salts, buy or forge gear, empower minions at the Bone Altar, and sell what you do not need.', when:()=>S.mode==='town'&&ui.tab==='market'},
  {id:'trait',  t:'Minion traits', m:'Every raised minion carries a trait, like Vicious or Grave-bound. Minions evolve at 5 and 10 levels above the level they were raised at, growing stronger and gaining another trait.', when:()=>S.army.some(m=>m.traits&&m.traits.length)},
  {id:'defeat', t:'You fell', m:'Falling costs that room\'s spoils and some XP, but you keep everything from rooms you already cleared. Come back stronger, or try an easier gate.', when:()=>S.mode==='defeat'},
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
  {id:'townopen',t:'The town opens', m:'A Town tab has appeared: build up the necropolis and fuse minions in the Flesh Pit. A bounty board in the side panel now posts three contracts every dawn.', when:()=>S.mode==='town'&&townOpen()},
  {id:'reserve',t:'The Reserve', m:'Your army list now has a Reserve below it: a bench for minions you want to keep but not take along. Benched minions do not fight or grow. Moving one in or out is free, in town. When your army is full, a raised body can go straight to the Reserve.', when:()=>S.mode==='town'&&reserveOpen()},
  {id:'faith',  t:'The Old Shrine', m:'At level 8 the Old Shrine on the Town tab takes an oath: Honored One or Dishonored One. Each path gives a bonus and takes something in return.', when:()=>S.mode==='town'&&townOpen()&&S.player.lvl>=FAITH_LV&&!faithOf()},
  {id:'ult',    t:'Your ultimate awaits', m:'At level 20 you can choose an ultimate on the Skills tab. Soul Siphon, elites and bosses give Souls; with five, press R in battle to unleash it.', when:()=>S.mode==='town'&&S.player.lvl>=ULT_LV&&!S.player.ult},
  {id:'siege',  t:'A siege is coming', m:'The living march on the necropolis tomorrow at dusk. When the day ends you defend it in three waves. Each building lends a perk (Town tab), and a raid ordered for tonight marches before they come. Hold, and the town pays; fall, and a building burns until you repair it.', when:()=>S.mode==='town'&&siegeWarned()},
  {id:'raid',   t:'A Commander', m:'One of your minions can lead. Open the War table under the Gates tab to order it and a squad against a gate you have cleared. They fight beside you until nightfall, march when the day ends and come back at dawn.', when:()=>S.mode==='town'&&raidPool().some(isCommander)},
  {id:'rift',   t:'The Rift', m:'The Rift is open, under the Gates tab. Every depth is harder than the last, and there is no bottom.', when:()=>S.mode==='town'&&riftOpen()},
  {id:'heat',   t:'Harder gates', m:'You have cleared a gate, so its card now offers Hard difficulty: stronger foes for more XP, gold and gear. Clear each level to open the next. On a cursed day the two stack.', when:()=>S.mode==='town'&&!T_('heat1')&&DUNGEONS.some((D,i)=>heatMax(i)>0)},
  {id:'bless',  t:'Full devotion', m:'You have kept your oath long enough: its blessing is now active. The Old Shrine on the Town tab shows what it does.', when:()=>S.mode==='town'&&!!faithOf()&&blessed(faithOf())},
  {id:'records',t:'Records', m:'The Ledger tab keeps your best: deepest floor, biggest hit, most kills, and the fastest clear of each gate. Beat one and you will hear about it.', when:()=>S.mode==='town'&&S.runs>=10},
  {id:'nightmare',t:'Nightmare', m:'A gate now offers Nightmare: foes three times as strong, rewards to match, and a title of its own for the clear.', when:()=>S.mode==='town'&&DUNGEONS.some((D,i)=>heatMax(i)>=3)},
  {id:'omen',   t:'An omen', m:'Some days carry an omen that touches every gate and the Tower. Today\'s is shown above the gates.', when:()=>S.mode==='town'&&!!omen()},
  {id:'tower',  t:'The Hell Tower is open', m:'A separate 100-floor climb, one fight per floor, with a unique relic on every tenth floor. Floors you clear become checkpoints.', when:()=>S.mode==='town'&&S.player.lvl>=TW.unlock},
];
const currentTip=()=>{ if(!S||(S.tips&&S.tips.off)) return null; try{ return TIPS.find(t=>!(S.tips&&S.tips[t.id])&&t.when())||null; }catch(e){ return null; } };
function dismissTip(id){ S.tips=S.tips||{}; S.tips[id]=1; }

