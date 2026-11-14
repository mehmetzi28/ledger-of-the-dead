// Ledger of the Dead — balance test bot.
// How to run: open index.html in a browser, open the developer console, paste this whole file, then run:
//   LOTD_BALANCE.run()                          // 30 bots x 40 days, with and without skills
//   LOTD_BALANCE.run({bots:10, days:30})        // quicker
//   LOTD_BALANCE.run({diff:{hp:2.4}})           // try a DIFF change without editing the game
//   LOTD_BALANCE.run({push:true})               // bots enter the hardest unlocked gate (below Recommended)
//   LOTD_BALANCE.run({modes:['skills']})        // only the bot that learns skills (faster)
//   modes: 'noSkills', 'skills', 'full' (market + the town economy), 'market' (skills + sells loot, buys gear, potions and salts, empowers minions at the
//          Bone Altar, drinks potions, and answers telegraphed boss moves with Grave Chill or Bone Ward)
// With the local server running (node tools/serve.js) you can load this file instead of pasting it:
//   await new Promise(r=>{ const s=document.createElement('script'); s.src='/tests/balance-test.js'; s.onload=r; document.head.appendChild(s); })
// Targets used for tuning (fair bot with skills): ~80% clears per gate at its Recommended level; the no-skill bot should do clearly worse.
// Difficulty comes from foe armor (DIFF.armor / TW.armor): fights last more turns instead of numbers growing.
// The ~80% target is for the 'market' bot (skills + shopping + altar). The early option is no longer needed: SAFE for A and S
// now matches where they are balanced. Current numbers, averaged over seeds 7700 and 9100 (results swing ~±7 points per seed set):
// LOTD_BALANCE.run({bots:40, days:100, seed:7700, modes:['market']})   (one mode per call, ~15 s in a browser), or in Node: node tests/run-balance.js
//   market:    clears 81-82% overall (79-87% per gate), deaths ~16%, level ~38 on day 100, tower ~50
//   full:      the market bot plus buildings, salvage, enchanting, fusion, bounties and orders against charging bosses:
//              84-88% per gate near its level, deaths ~6%, level ~45 on day 100, tower ~63. Target: a little above market.
//              opts.off (e.g. ['fuse','crypt']) switches parts off to measure each one.
//              (after gear rolls, events, cursed gates, status effects and the early-game pass: E and D are gentler)
//   skills:    clears 63-87% per gate, deaths ~21%, level ~31 on day 100 (seed 7700, before the A trim)
//   no skills: clears 41-75% per gate, deaths ~35%, level ~24 on day 100 (seed 7700, before the last C tweak)
// The bots play the real game functions from a new game: they allocate stats, equip gear, raise the dead,
// pick the highest gate they are "Fair" for (level >= SAFE), and climb the Hell Tower once at the end.
// Both modes use the same random seeds, so the only difference between them is whether the bot learns skills.
// Your real save is not touched: saving is switched off while the test runs and the game is restored afterwards.
(function(){
  const STAT_ORDER=['intelligence','constitution','will','intelligence','constitution','strength'];
  const SKILL_ORDER=['spear','bonearmor','mend','blast','soulwell','curse','gravepact','chill','frenzy','edge','mastery','reap'];
  const itemScore=d=>d.tier*10+(d.uq?25:0)+(d.set||0);
  const cval=c=>c.rankI*100+c.lvl+(c.boss?40:0)+(c.elite?15:0);
  function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

  // ----- town: stats, skills, gear
  function town(B){
    const P=S.player;
    while(P.pts>0) alloc(STAT_ORDER[B.statI++%STAT_ORDER.length]);
    if(B.skills){
      let again=true;
      while(again&&P.sp>0){ again=false;
        for(let rank=1;rank<=SK_MAX&&!again;rank++) for(const id of SKILL_ORDER){
          if(sk(id)===rank-1&&P.lvl>=skReq(SKILL[id],rank)){ learnSkill(id); again=true; break; } } }
    }
    for(const sl of GEAR_SLOTS){
      const cur=S.equip[sl]; let best=null, bs=cur?itemScore(ITEM[cur.id]):-1;
      for(const it of S.inv){ const d=ITEM[it.id]; if(d.slot===sl&&itemScore(d)>bs){ best=it; bs=itemScore(d); } }
      if(best) equip(best.u);
    }
    if(B.full){   // the new economy: claim bounties, salvage the better spares for dust, build, enchant what you wear
      if(!B.off.bounty) for(let i=0;i<3;i++) claimBounty(i);
      if(!B.off.salvage) for(const it of S.inv.slice()) if(!ITEM[it.id].uq&&ITEM[it.id].tier>=2) salvage(it.u);
    }
    if(B.market){   // sell everything not worn, buy better gear from the merchant, keep the potion belt full
      sellAllTrophies(); for(const it of S.inv.slice()) if(!ITEM[it.id].uq) sellItem(it.u);
      shopStock().forEach((s,i)=>{ if(s.sold) return; const d=ITEM[s.id], cur=S.equip[d.slot];
        if((!cur||itemScore(d)>itemScore(ITEM[cur.id]))&&S.gold-buyPrice(d)>=POTIONS.hp.price()*2&&buyStock(i)){ const it=S.inv[S.inv.length-1]; equip(it.u); for(const x of S.inv.slice()) if(!ITEM[x.id].uq) sellItem(x.u); } });
      while(buyPotion('hp')); while(buyPotion('mp')); while(buySalt());
      // Bone Altar: strongest minions first, keeping enough gold to refill potions next time
      const reserve=(POTIONS.hp.price()+POTIONS.mp.price())*BELT_MAX;
      if(B.full){
        for(const k of ['crypt','ossuary','altar','forge']){ const c=buildCost(k); if(!B.off[k]&&c&&S.gold-c[0]>=reserve) build(k); }
        if(!B.off.enchant) for(const sl of GEAR_SLOTS){ const it=S.equip[sl]; if(it&&!ITEM[it.id].uq) while((it.ro||[]).length<lineMax(it)&&enchant(it.u,-1)); }
        if(!B.off.fuse&&S.army.length>=slots()){ const by={}; for(const m of S.army) (by[m.role]=by[m.role]||[]).push(m);
          const pair=Object.values(by).filter(a=>a.length>=2).map(a=>a.sort((x,y)=>cval(x)-cval(y)).slice(0,2)).sort((a,b)=>cval(a[0])-cval(b[0]))[0];
          if(pair&&S.gold-fuseCost(pair[0],pair[1])>=reserve) fuse(pair[0].uid,pair[1].uid); }
      }
      for(const m of S.army.slice().sort((a,b)=>cval(b)-cval(a))){ while(S.gold-empowerCost(m)>=reserve&&empower(m.uid)); }
    }
    if(S.inv.length>20){ S.inv.sort((a,b)=>itemScore(ITEM[b.id])-itemScore(ITEM[a.id])); S.inv=S.inv.filter((it,i)=>i<12||ITEM[it.id].uq); }
  }
  // fair bots enter the highest gate they meet the Recommended level for; push bots enter the highest gate they have unlocked.
  function pickGate(B){ const l=S.player.lvl; let g=0; for(let i=0;i<DUNGEONS.length;i++) if(l>=RK[i].unlock&&(B.push||l>=SAFE[i])) g=i; return g; }

  // ----- battle: one decision per turn
  function chooseTarget(){
    const f=liveFoes(), men=f.filter(e=>e.role==='mender'), pool=(men.length?men:f).slice().sort((a,b)=>a.hp-b.hp);
    setTarget(pool[0].id); return pool[0];
  }
  function decide(B){
    const P=S.player, t=chooseTarget(), max=pMax(), res=Math.min(15,Math.round(pMana()*.2)), foes=liveFoes();
    const charging=foes.find(e=>e.charging);   // a boss is winding up a telegraphed move: freeze it, or ward against the hit
    if(charging){
      const mv=charging.move||charging.abil;
      if(B.full&&!B.off.orders&&mv==='sunder'&&canCommand('vanguard')) command('vanguard');   // orders are free: send the blow at a vanguard
      if(B.full&&!B.off.orders&&canCommand('striker')){ setTarget(charging.id); command('striker'); }   // and let a Focus crit break the charge
      if(B.skills&&charging.charging&&canUse('chill')&&P.mana>=SKILL.chill.cost){ setTarget(charging.id); return 'sk:chill'; }
      if((mv==='decree'||mv==='cinder'||mv==='sunder')&&charging.charging&&P.mana>=6&&P.shield<max*.3) return 'ward';
    }
    if(B.market&&P.hp<max*.3&&S.belt.hp) return 'pot:hp';
    if(B.market&&P.mana<10&&P.hp<max*.6&&S.belt.mp) return 'pot:mp';
    if(P.hp<max*.35&&P.mana>=8) return 'siphon';
    if(B.skills){
      const ok=id=>canUse(id)&&P.mana-SKILL[id].cost>=res, live=S.army.filter(m=>m.hp>0);
      if(ok('reap')&&t.hp<t.maxHp*.35&&t.hp>pAtk()) return 'sk:reap';
      if(ok('blast')&&foes.length>=2) return 'sk:blast';
      if(ok('mend')&&live.length&&live.reduce((a,m)=>a+m.hp/m.maxHp,0)/live.length<.55) return 'sk:mend';
      if(ok('chill')&&(t.boss||foes.length>=3)) return 'sk:chill';
      if(ok('frenzy')&&live.length>=2) return 'sk:frenzy';
      if(ok('curse')&&t.hp>pSiph()*3) return 'sk:curse';
      if(ok('spear')&&t.hp>pAtk()) return 'sk:spear';
    }
    if(P.shield===0&&P.hp<max*.6&&P.mana>=6+res) return 'ward';
    if(P.mana>=8+res&&pSiph()>=pAtk()) return 'siphon';
    return 'strike';
  }
  function raisePhase(){
    const r=S.run, P=S.player;
    for(const c of r.corpses.filter(c=>!c.tried).sort((a,b)=>cval(b)-cval(a))){
      if(P.mana<raiseCost(c)) continue;
      if(S.army.length>=slots()){
        const w=S.army.slice().sort((a,b)=>cval(a)-cval(b))[0];
        if(!w||cval(w)>=cval(c)-3||raiseChance(c)<40) continue;
        release(w.uid);
      }
      tryRaise(c.id, typeof S.salts==='number'&&S.salts>0&&(c.boss||c.elite));   // salts on the bodies worth the most
    }
  }
  function playRun(B,rec){
    const gi=pickGate(B), lvl=S.player.lvl; startRun(gi);
    if(S.mode!=='battle'){ S.watches=0; endDay(); return; }
    const run={gate:gi,lvl,diff:lvl-SAFE[gi],cleared:false,died:false,left:false,rooms:0,turns:0,hpEnd:[]}; let guard=0;
    for(;;){
      if(S.mode==='battle'){ if(++guard>400){ flee(); run.left=true; break; } act(decide(B)); run.turns++; continue; }
      if(S.mode==='raise'){
        run.rooms++; run.hpEnd.push(S.player.hp/pMax()); raisePhase();
        if(S.run.cleared){ run.cleared=true; returnTown(); break; }
        const P=S.player, live=S.army.filter(m=>m.hp>0).length;
        if(P.hp+pMax()*DIFF.heal>=pMax()*.5||(P.hp>=pMax()*.3&&live>=2)) descend(); else { run.left=true; returnTown(); break; }
        continue;
      }
      if(S.mode==='defeat'){ run.died=true; returnTown(); break; }
      break;
    }
    rec.push(run);
  }
  function climb(B){   // one tower climb from floor 1, never retreating; returns the highest floor cleared
    S.watches=Math.max(1,S.watches); S.mode='town'; S.run=null; startTower(1); let guard=0;
    while(S.mode!=='town'&&guard++<6000){
      if(S.mode==='battle') act(decide(B));
      else if(S.mode==='raise'){ raisePhase(); if(S.run.cleared) break; descend(); }
      else break;
    }
    return S.tower.best;
  }
  function simBot(seed,B,days){
    Math.random=mulberry32(seed); newGame(); B.statI=0;
    const rec=[], lvAt={}, firstClear={};
    while(S.day<=days){
      town(B); const d=S.day; playRun(B,rec);
      const last=rec[rec.length-1]; if(last&&last.cleared&&firstClear[last.gate]==null) firstClear[last.gate]=d;
      if(S.day!==d) lvAt[d]=S.player.lvl;
    }
    town(B);
    const tower=S.player.lvl>=TW.unlock?climb(B):0;
    return {rec,lvAt,firstClear,lvl:S.player.lvl,tower};
  }

  // ----- reporting
  const pc=(a,b)=>b?Math.round(a/b*100)+'%':'-';
  const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:'-';
  function summarize(res,days){
    const gates=DUNGEONS.map((D,i)=>{
      const g=[].concat(...res.map(r=>r.rec)).filter(x=>x.gate===i);
      const fc=res.map(r=>r.firstClear[i]).filter(x=>x!=null), rooms=g.reduce((a,x)=>a+x.rooms,0)||1;
      return {gate:RANKS[i]+' '+D.name,runs:g.length,avgLvlVsSafe:avg(g.map(x=>x.diff)),clear:pc(g.filter(x=>x.cleared).length,g.length),death:pc(g.filter(x=>x.died).length,g.length),
        turnsPerRoom:Math.round(g.reduce((a,x)=>a+x.turns,0)/rooms*10)/10,hpAfterRoom:(h=>h.length?Math.round(h.reduce((a,b)=>a+b,0)/h.length*100)+'%':'-')([].concat(...g.map(x=>x.hpEnd))),
        firstClearDay:avg(fc),botsCleared:fc.length+'/'+res.length};
    });
    const all=[].concat(...res.map(r=>r.rec)), lv={};
    [10,20,30,days].forEach(d=>{ if(d<=days) lv['day'+d]=avg(res.map(r=>r.lvAt[d]).filter(x=>x!=null)); });
    return {gates,runs:all.length,deathRate:pc(all.filter(x=>x.died).length,all.length),clearRate:pc(all.filter(x=>x.cleared).length,all.length),level:lv,towerBest:avg(res.map(r=>r.tower))};
  }

  function run(opts){
    opts=Object.assign({bots:30,days:40,seed:1000,diff:null,tw:null,push:false,early:0,modes:['noSkills','skills']},opts||{});
    const keep={S:JSON.stringify(S),rand:Math.random,save:save,DIFF:JSON.stringify(DIFF),TW:JSON.stringify(TW),SAFE:SAFE.slice()};
    save=function(){};
    const sfxWas=typeof SFX!=='undefined'&&SFX.on; if(typeof SFX!=='undefined') SFX.on=false;   // no sound during simulations
    if(opts.early){ SAFE[4]-=opts.early; SAFE[5]-=opts.early; }   // let fair bots enter A and S early (the XP curve stalls them near level 20)
    if(opts.diff) Object.assign(DIFF,JSON.parse(JSON.stringify(opts.diff)));
    if(opts.tw) Object.assign(TW,opts.tw);
    const out={settings:{DIFF:JSON.parse(JSON.stringify(DIFF)),TW:Object.assign({},TW),bots:opts.bots,days:opts.days}}, t0=Date.now();
    try{
      for(const [name,skills,market,full] of [['noSkills',false,false,false],['skills',true,false,false],['market',true,true,false],['full',true,true,true]].filter(m=>opts.modes.includes(m[0]))){
        const res=[]; for(let b=0;b<opts.bots;b++) res.push(simBot(opts.seed+b,{skills,market,full,push:opts.push,off:Object.fromEntries((opts.off||[]).map(k=>[k,1]))},opts.days));
        out[name]=summarize(res,opts.days);
      }
    } finally {
      Math.random=keep.rand; save=keep.save; keep.SAFE.forEach((v,i)=>SAFE[i]=v); if(typeof SFX!=='undefined') SFX.on=sfxWas;
      Object.assign(DIFF,JSON.parse(keep.DIFF)); Object.assign(TW,JSON.parse(keep.TW));
      S=JSON.parse(keep.S);
    }
    out.ms=Date.now()-t0;
    return out;
  }
  window.LOTD_BALANCE={run};
})();
