// Playthrough test (runs last: it is the slowest). Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Playthrough: a bot plays 30 days, checking every rule after every action',()=>{
  seed(2024); fresh(); const order=['will','constitution','strength','intelligence','constitution']; let steps=0, clears=0, lastDay=0, towers=0;
  while(S.day<=30){
    if(++steps>60000) throw new Error('bot stuck on day '+S.day+' in '+S.mode);
    if(S.mode==='town'&&S.day!==lastDay){ lastDay=S.day; save(); const before=canon(S); S=null; loadGame(); const d=firstDiff(JSON.parse(before),JSON.parse(canon(S))); if(d) throw new Error('save/load changed the game on day '+lastDay+' at '+d); }
    const P=S.player;   // read after the reload above, which replaces S
    if(S.mode==='town'){
      while(P.pts>0) alloc(order[P.pts%order.length]);
      for(let k=0;k<3;k++) for(const s of SKILLS) learnSkill(s.id);
      claimQuest(); sellAllTrophies(); while(S.gold>150&&buyPotion('hp')); if(S.gold>400) buySalt();
      for(const it of S.inv.slice()){ const d=ITEM[it.id], cur=S.equip[d.slot]; if(!cur||(!ITEM[cur.id].uq&&ITEM[cur.id].set<d.set)||d.uq) equip(it.u); }
      while(S.inv.length>bagMax()-3){ const it=S.inv.find(x=>!ITEM[x.id].uq); if(!it) break; sellItem(it.u); }
      if(S.army.length&&S.gold>800) empower(S.army[0].uid);
      if(towerOpen()&&S.day%4===0){ startTower(Math.max(...towerStarts())); towers++; }
      else { let g=0; for(let i=0;i<6;i++) if(P.lvl>=RK[i].unlock&&P.lvl>=SAFE[i]) g=i; startRun(g); }
      if(S.mode==='town') throw new Error('bot could not start a run on day '+S.day);
    } else if(S.mode==='battle'){
      let a='strike'; const use=['reap','blast','chill','spear','curse','frenzy','mend'].find(id=>canUse(id));
      if(P.hp<pMax()*.35&&S.belt.hp) a='pot:hp'; else if(use) a='sk:'+use; else if(P.hp<pMax()*.5&&P.mana>=8) a='siphon'; else if(P.mana>=6&&P.shield===0&&liveFoes().some(e=>e.charging)) a='ward';
      const turn=S.run.turn, mode=S.mode; act(a); if(S.mode===mode&&S.run&&S.run.turn===turn&&S.mode==='battle') throw new Error(a+' did nothing');
    } else if(S.mode==='raise'){
      for(const c of S.run.corpses) if(!c.tried&&S.army.length<slots()&&P.mana>=raiseCost(c)) tryRaise(c.id,c.boss&&S.salts>0);
      if(S.run.cleared){ clears++; returnTown(); } else if(P.hp>pMax()*.45) descend(); else returnTown();
    } else returnTown();
    invariants('day '+S.day+', step '+steps);
    if(steps%5===0){ ui.tab=TABS[steps%TABS.length]; renderAll('day '+S.day+' '+S.mode); }
  }
  ok(S.player.lvl>=5,'reached level '+S.player.lvl); ok(clears>=3,'cleared '+clears+' gates'); ok(totalKills()>100);
});

})();
