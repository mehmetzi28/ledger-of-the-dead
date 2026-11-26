// Command (src/game-player.js cmdPow/cmdSync): the hero draws on the army's power; raised Tower minions follow the Throne's curve (src/game-data.js twMinion).
(function(){
const {test,ok,eq,near,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,renderAll,cdx,invariants}=window.LOTD_T;
const st=(s,c,i)=>{ Object.assign(S.player.stats,{strength:s,constitution:c,intelligence:i,will:4}); };

test('Command: the army\'s power is its three strongest minions averaged over three places; Strength, Intelligence and Constitution take their shares',()=>{
  fresh(30); st(0,0,0); const a=mkMinion({lvl:30,rankI:5}), b=mkMinion({lvl:10}), w=mkMinion({lvl:40,rankI:5}); w.wall=true;
  let c=cmdPow(); eq(c.a,Math.round((a.atk+b.atk)/CMD_TOP),'empty places count as nothing; the siege wall is not the army'); eq(c.h,Math.round((a.maxHp+b.maxHp)/CMD_TOP));
  const base={atk:pAtk(),siph:pSiph(),hp:pMax()}; cmdSync(); eq(pAtk(),base.atk,'no Strength, no share'); eq(pMax(),base.hp);
  st(20,30,40); syncArmy(); cmdSync(); const p0={atk:Math.round(3+20*2.2+S.player.lvl+G('atk')),siph:Math.round(6+40*2.8+S.player.lvl+G('siph'))};
  eq(cmdAtk(),Math.round(cmd().a*20*CMD_STR/100)); eq(pAtk(),p0.atk+cmdAtk(),'Strike'); eq(pSiph(),p0.siph+cmdSiph(),'Siphon, and the skills built on it'); eq(cmdHp(),Math.round(cmd().h*30*CMD_CON/100)); ok(cmdHp()>0);
  for(let i=0;i<4;i++) mkMinion({lvl:30,rankI:5}); cmdSync(); const top=S.army.filter(m=>!m.wall).map(m=>m.atk).sort((x,y)=>y-x).slice(0,3); eq(cmd().a,Math.round(top.reduce((x,y)=>x+y,0)/3),'only the three strongest count'); ok(S.army.filter(m=>!m.wall).length>3); invariants('command');
});

test('Command: measured as each room begins and on the way home, never mid-fight; a stronger army never heals you, a weaker one caps your HP',()=>{
  fresh(30); st(10,60,10); mkMinion({lvl:30,rankI:5}); mkMinion({lvl:30,rankI:5}); mkMinion({lvl:30,rankI:5}); cmdSync(); S.player.hp=pMax();
  arena([foe({hp:999})]); const hp=pMax(), atk=pAtk(); ok(hp>S.player.lvl*4+60*CON_HP,'Constitution draws on the army');
  S.army.forEach(m=>{ m.hp=0; }); S.army.length=0; eq(pMax(),hp,'a minion lost mid-fight changes nothing until the next room'); eq(pAtk(),atk);
  roomStart(S.run.enemies); ok(pMax()<hp,'the next room measures again'); ok(S.player.hp<=pMax(),'and caps your HP');
  const lo=pMax(); S.player.hp=10; mkMinion({lvl:40,rankI:5}); roomStart(S.run.enemies); ok(pMax()>lo); eq(S.player.hp,10,'a stronger army is no heal'); invariants('rooms');
  returnTown(); eq(S.player.hp,pMax(),'home: full HP at the new measure');
});

test('Command: saves keep a sound measure and measure an old or damaged one again',()=>{
  fresh(30); st(10,10,10); mkMinion({lvl:30,rankI:5}); cmdSync(); const want=JSON.stringify(cmd());
  eq(JSON.stringify(normalizeSave(JSON.parse(JSON.stringify(S))).player.cmd),want,'kept');
  const g=JSON.parse(JSON.stringify(S)); delete g.player.cmd; eq(JSON.stringify(normalizeSave(g).player.cmd),want,'an old save measures its army');
  const j=JSON.parse(JSON.stringify(S)); j.player.cmd={a:'x',h:-5}; eq(JSON.stringify(normalizeSave(j).player.cmd),want,'junk measured again');
  S.player.cmd={a:NaN}; eq(cmdAtk(),0,'a broken measure reads as none'); ok(isFinite(pMax()));
});

test('Command: the status panel line, the Codex row and Turkish',()=>{
  fresh(30); st(10,10,10); mkMinion({lvl:30,rankI:5}); cmdSync(); S.mode='town';
  const h=renderAll('status'); ok(h.includes('Command: +'+cmdAtk()+' Strike, +'+cmdSiph()+' Siphon, +'+cmdHp()+' max HP'),'the line');
  const c=cdx('basics'); ok(c.includes('strongest minions')&&c.includes(CMD_STR+'% of that attack per Strength point')&&c.includes('Now: +'+cmdAtk()+' Strike'),'Codex');
  eq(trText('Command: +5 Strike, +3 Siphon, +40 max HP'),'Komuta: +5 Vuruş, +3 Emme, +40 azami can');
  fresh(1); S.mode='town'; ok(!/Command: \+/.test(renderAll('none')),'no army, no line');
});

test('Tower minions: like a Throne of Ash minion of their level plus 1% per floor; no more runaway from the floor curve',()=>{
  fresh(60); const s=mobStats(5,60,1,1,true,false), t=twMinion(90,60,1,1,true,false);
  eq(t.hp,Math.round(s.hp*(1+TW_MINION*90))); eq(t.atk,Math.max(1,Math.round(s.atk*(1+TW_MINION*90))));
  ok(towerStats(90,60,1,1,true,false).hp>t.hp*50,'the foe curve itself is untouched');
  const m=mkMinion({name:'Archdevil Vael',kind:'Archdevil Vael',tw:80,boss:true,lvl:60,role:'reaper',rankI:5}), g=mkMinion({name:'The Pale Sovereign',kind:'The Pale Sovereign',boss:true,lvl:60,role:'reaper',rankI:5});
  ok(m.maxHp>g.maxHp&&m.maxHp<g.maxHp*2,'a floor-80 warden: stronger than a Throne boss, not hundreds of times'); eq(JSON.stringify(minionBase(m)),JSON.stringify(twMinion(80,60,1,1,true,false)));
  ok(cdx('tower').includes('% stronger for each floor it fell on'),'Codex');
});
})();
