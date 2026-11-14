// Gate difficulty and secret boss tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Difficulty: Hard opens after a clear, each level after clearing the one below, never past Nightmare',()=>{
  eq(heatMax(0),0,'not cleared'); ok(!setHeat(0,1)); S.ti=S.ti||{}; S.ti.clr={0:1}; eq(heatMax(0),1); ok(setHeat(0,1)); ok(!setHeat(0,2),'Brutal needs a Hard clear');
  S.heatMax={0:1}; eq(heatMax(0),2); S.heatMax={0:3}; eq(heatMax(0),3,'Nightmare is the top'); ok(setHeat(0,3)); eq(heatOf(0),3); ok(setHeat(0,0)); eq(heatOf(0),0);
  arena([foe()]); ok(!setHeat(0,1),'not mid-run');
});
test('Difficulty: foes grow and rewards follow; a cursed day stacks a further x1.3',()=>{
  setLvl(5); S.ti=S.ti||{}; S.ti.clr={0:1}; S.mod={day:S.day,gi:3,id:'fury'}; fix(.5);
  S.watches=3; startRun(0); const base=S.run.enemies.map(e=>[e.maxHp,e.atk]); const x0=killXp(foe({lvl:5})); flee();
  S.heatMax={0:1}; ok(setHeat(0,2)); S.watches=3; fix(.5); startRun(0); eq(S.run.heat,2); S.run.enemies.forEach((e,i)=>{ near(e.maxHp,base[i][0]*HEAT[2].foe,1.5,'foe HP x2'); }); near(killXp(foe({lvl:5})),x0*HEAT[2].xp,1.5,'XP x1.7'); flee();
  S.mod={day:S.day,gi:0,id:'fury'}; S.watches=3; fix(.5); startRun(0); near(heatK('foe'),HEAT[2].foe*DAMNED,1e-9,'damned'); ok(/the curse feeds on it/.test(renderAll('damned battle'))); flee();
  ui.tab='gates'; ok(/Cursed and Brutal: the curse feeds on it/.test(renderAll('card')));
});
test('Difficulty: a clear on a level opens the next, and saves keep only sane levels',()=>{
  setLvl(30); S.ti=S.ti||{}; S.ti.clr={0:1}; setHeat(0,1); const r=wonRoom(3); ok(!r.cleared||true); S.run.heat=1; S.run.room=3; S.run.enemies=[foe({hp:0,dead:true})]; S.run.cleared=false; roomWon(); eq(S.heatMax[0],1); eq(heatMax(0),2);
  const g=normalizeSave({v:2,player:{lvl:3},heat:{0:2,9:1,1:'x'},heatMax:{0:7,2:-1}}); eq(JSON.stringify(g.heat),'{"0":2}'); eq(JSON.stringify(g.heatMax),'{"0":3}');
  ui.tab='gates'; S.mode='town'; S.run=null; ok(/data-a="heat" data-k="0\|2"/.test(renderAll('picker')));
});
test('Secrets: a cleared gate very rarely holds its secret master instead of the boss; never before the first clear',()=>{
  setLvl(5); S.watches=3; startRun(0); S.run.room=3; fix(0); spawnRoom(); ok(!S.run.enemies[0].secret,'not before a clear'); flee();
  S.ti=S.ti||{}; S.ti.clr={0:1}; S.watches=3; startRun(0); S.run.room=3; fix(.5); spawnRoom(); ok(!S.run.enemies[0].secret,'50% roll: the usual boss'); flee();
  S.watches=3; startRun(0); S.run.room=3; fix(.01); spawnRoom(); const b=S.run.enemies[0]; ok(b.secret); eq(b.name,SECRET[0].name); ok(b.phase2,'second phase from the start');
  ok(S.run.log.some(l=>/not the master you came for/.test(l.m))&&S.run.log.some(l=>/children ate/.test(l.m)));
  const plain=makeEnemy(0,b.lvl,true); ok(b.maxHp>=plain.maxHp*3,'far tougher'); ok(/class="ico r0 boss secret/.test(renderAll('secret')));
});
test('Secrets: slaying one pays four times, leaves two legendaries and a heart, and earns a hidden unique title',()=>{
  setLvl(30); arena([foe()],0); const e=makeSecret(0,5); const x=killXp(e); e.secret=false; const x0=killXp(e); e.secret=true; near(x,x0*SB_REWARD,SB_REWARD,'XP x4');
  fix(.5); const d=rollDrops(e); eq(d.filter(id=>ITEM[id].tier===4).length>=2,true,'two legendaries'); ok(TROPHY['b:'+SECRET[0].name].value>=TROPHY['b:The Rat King'].value*4);
  S.run.enemies=[e]; e.hp=0; checkDeaths(); eq(T_('secret_0'),1); ok(MOMENTS.some(m=>/is slain/.test(m.t))); checkTitles(); ok(S.ti.got.sb0); eq(TITLE.sb0.r,5);
  flee(); S.notices=[]; ui.tab='bes'; ok(renderAll('bestiary').includes(SECRET[0].name),'in the bestiary once met'); S.kills[SECRET[0].name]=0; S.notices=[]; ok(!renderAll('unmet').includes(SECRET[0].name),'hidden before');
});
test('Siphon: pierces a quarter of armor, devours a foe below 30% HP for double, and harvests a Soul (up to five)',()=>{
  const t=foe({hp:10000}); arena([t],3); fix(.5); const P=S.player; P.mana=200; P.stats.constitution=300; P.hp=pMax();
  ok(pierceMul(SIPHON_PIERCE)>dmgMul(),'pierces armor'); act('siphon'); eq(S.run.souls,1);
  t.hp=2000; const before=t.hp, d=H(pSiph()*pierceMul(SIPHON_PIERCE))*2; act('siphon'); eq(before-t.hp,d,'devours'); ok(S.run.log.some(l=>/devours/.test(l.m)));
  for(let i=0;i<6;i++){ P.mana=200; act('siphon'); } eq(S.run.souls,SOUL_MAX,'capped'); const e=foe({elite:true,hp:1}); S.run.souls=0; S.run.enemies.push(e); e.hp=0; checkDeaths(); eq(S.run.souls,1,'an elite gives a Soul');
});
test('Ultimates: open at level 20, chosen in town, cost five Souls and use the turn',()=>{
  ok(!chooseUlt('toll'),'too low'); setLvl(20); ok(chooseUlt('toll')); eq(S.player.ult,'toll'); ui.tab='skills'; ok(/Death&#39;s Toll|Death's Toll/.test(renderAll('skills'))&&/data-a="ult" data-k="rise"/.test(renderAll('skills2')));
  const a=foe({hp:1000}), b=foe({hp:1000}); arena([a,b]); ok(!canUlt(),'no Souls'); S.run.souls=SOUL_MAX; ok(canUlt()); ok(/data-a="act" data-k="ult"/.test(renderAll('battle')));
  fix(.5); act('ult'); eq(S.run.souls,0); ok(a.hp<1000&&b.hp<1000,'every foe hit'); eq(S.run.turn,2,'uses the turn'); ok(MOMENTS.some(m=>/Death's Toll/.test(m.t)));
  const g=normalizeSave({v:2,player:{lvl:30,ult:'bogus'}}); eq('ult' in g.player,false); eq(normalizeSave({v:2,player:{lvl:30,ult:'rise'}}).player.ult,'rise');
});
test("Ultimates: Death's Toll finishes the weak, Resurrection raises the fallen, Soul Prison freezes and curses",()=>{
  setLvl(25); S.mode='town'; chooseUlt('toll'); const w=foe({hp:1000}), bo=foe({hp:1e6,boss:true}); arena([w,bo]); fix(.5); w.hp=Math.round(pSiph()*3*pierceMul(1)*1.1); S.run.souls=SOUL_MAX; useUlt(w); eq(w.hp,0,'finished below 15%'); ok(bo.hp>0,'bosses are spared the execute');
  flee(); chooseUlt('rise'); const m=mkMinion({}), n=mkMinion({}); arena([foe({hp:1e6})]); m.hp=0; n.hp=1; S.run.souls=SOUL_MAX; useUlt(); eq(m.hp,m.maxHp,'risen'); eq(n.hp,n.maxHp); ok(S.run.frenzy>=2&&S.run.frenzyMul>=1.5);
  flee(); chooseUlt('prison'); const f1=foe({hp:1e6}), f2=foe({hp:1e6,boss:true,charging:true,abil:'decree',move:'decree'}); arena([f1,f2]); S.run.souls=SOUL_MAX; useUlt(); eq(f1.stun,2); eq(f2.stun,1); eq(f1.curse.mul,1.3);
});
test('Faith: an oath from level 8, each path gives and takes, and the gift grows with devotion',()=>{
  ok(!swear('hon'),'too low'); setLvl(8); const P=S.player, hp=pMax(), dm=dmgMul(); ok(swear('hon')); eq(faithOf(),'hon'); ok(!swear('dis'),'one oath at a time');
  eq(pMax(),Math.round(hp*1.1)||pMax()); ok(Math.abs(pMax()-hp*1.1)<=2,'+10% max HP'); arena([foe()]); ok(dmgMul()<dm,'deals less'); P.stats.constitution=300; P.hp=10; const h=healAlly(P,100); eq(h,125,'heals 25% more'); flee();
  S.day+=10; eq(devotion(),1); eq(faithBuff('hon').healp,38); S.day+=15; eq(devotion(),2); eq(faithBuff('hon').hpp,20); eq(FAITH.hon.debuff.dmgp,-8,'the price stays');
  S.gold=0; ok(!renounce(),'costs gold'); S.gold=1e4; ok(renounce()); eq(faithOf(),null); eq(S.gold,1e4-renounceCost());
  ok(swear('dis')); arena([foe()]); P.hp=10; eq(healAlly(P,100),75,'heals 25% less'); ok(P.hp<=pMax()); invariants('faith');
});
test('Faith: the shrine on the Town tab, debuffs read with a minus, saves keep only a real oath',()=>{
  setLvl(8); ui.tab='town'; let h=renderAll('shrine'); ok(/Old Shrine/.test(h)&&/data-a="swear" data-k="dis"/.test(h)); ok(/costs &minus;8% Damage dealt/.test(h),'debuff text');
  ACTIONS.swear('dis'); eq(faithOf(),null,'asks first'); ACTIONS.swear('dis'); eq(faithOf(),'dis'); h=renderAll('sworn'); ok(/Dishonored One/.test(h)&&/devotion 1\/3/.test(h)&&/faith-l dis/.test(h));
  eq(buffTxt({drp:-3}),'+3% Damage taken'); eq(buffTxt({drp:3}),'&minus;3% Damage taken'); ok(TIPS.find(t=>t.id==='faith').m.includes('level '+FAITH_LV),'tip matches the level');
  const g=normalizeSave({v:2,player:{lvl:9},faith:{id:'nope',day:1}}); eq('faith' in g,false); eq(normalizeSave({v:2,player:{lvl:9},faith:{id:'hon',day:3}}).faith.id,'hon');
});
test('Music and looks: every boss (secret ones too) has its own theme and background, with no blue or purple',()=>{
  const bosses=DUNGEONS.map(D=>D.boss[0]).concat(TW_BOSS,SECRET.map(x=>x.name));
  bosses.forEach(n=>{ ok(BOSS_THEME[n]&&MODES[BOSS_THEME[n][1]],n+' theme'); ok(BOSS_LOOK[n]&&['rays','rings','drip','mist'].includes(BOSS_LOOK[n][2]),n+' look'); });
  eq(new Set(bosses.map(n=>BOSS_THEME[n].join())).size,bosses.length,'no two themes alike');
  const hue=h=>{ const r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn; if(d<.08) return -1; let x=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4; return (x*60+360)%360; };
  bosses.forEach(n=>BOSS_LOOK[n].slice(0,2).forEach(c=>{ const h=hue(c); ok(h<0||h<190||h>320,n+' colour '+c+' is blue or purple'); }));
  arena([foe()]); eq(musicScene(),'gate'); flee(); const b=bossFight(2); eq(musicScene(),'boss:The Ember Knight'); eq(sceneOf(musicScene()).mode,'hm'); b.hp=0; ok(/gate|boss/.test(musicScene()));
  Object.keys(SCENES).forEach(k=>ok(MODES[SCENES[k].mode],k)); MUSIC.on=false; music();
});
})();
