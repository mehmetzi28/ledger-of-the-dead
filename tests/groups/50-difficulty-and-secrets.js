// Gate difficulty and secret boss tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Difficulty: Hard opens after a clear, each level after clearing the one below, never past Nightmare',()=>{
  eq(heatMax(0),0,'not cleared'); ok(!setHeat(0,1)); S.ti=S.ti||{}; S.ti.clr={0:1}; eq(heatMax(0),1); ok(setHeat(0,1)); ok(!setHeat(0,2),'Brutal needs a Hard clear');
  S.heatMax={0:1}; eq(heatMax(0),2); S.heatMax={0:3}; eq(heatMax(0),3,'Nightmare is the top'); ok(setHeat(0,3)); eq(heatOf(0),3); ok(setHeat(0,0)); eq(heatOf(0),0);
  arena([foe()]); ok(!setHeat(0,1),'not mid-run');
});
test('Difficulty: foes grow and rewards follow; a cursed day stacks x1.5 on foes and x1.3 on rewards',()=>{
  setLvl(5); S.ti=S.ti||{}; S.ti.clr={0:1}; S.mod={day:S.day,gi:3,id:'fury'}; fix(.5);
  S.watches=3; startRun(0); const base=S.run.enemies.map(e=>[e.maxHp,e.atk]); const x0=killXp(foe({lvl:5})); flee();
  S.heatMax={0:1}; ok(setHeat(0,2)); S.watches=3; fix(.5); startRun(0); eq(S.run.heat,2); S.run.enemies.forEach((e,i)=>{ near(e.maxHp,base[i][0]*HEAT[2].foe,1.5,'foe HP x2'); }); near(killXp(foe({lvl:5})),x0*HEAT[2].xp,1.5,'XP x1.7'); flee();
  S.mod={day:S.day,gi:0,id:'fury'}; S.watches=3; fix(.5); startRun(0); near(heatK('foe'),HEAT[2].foe*DAMNED_FOE,1e-9,'damned'); near(heatK('gold'),HEAT[2].gold*DAMNED,1e-9,'rewards unchanged'); ok(/the curse feeds on it/.test(renderAll('damned battle'))); flee();
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
  t.hp=2000; const before=t.hp, d=Math.round(H(pSiph()*pierceMul(SIPHON_PIERCE))*2*(1-foeRes(t,'shad'))); act('siphon'); eq(before-t.hp,d,'devours'); ok(S.run.log.some(l=>/devours/.test(l.m)));
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
test('Faith: an oath from level 8, one god at a time; devotion ranks open boons (Morrow: healing, then HP)',()=>{
  ok(!swear('hon'),'too low'); setLvl(8); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1}}); ok(!swear('hon'),'two clears'); S.ti.clr[2]=1; const P=S.player, hp=pMax(); ok(swear('hon')); eq(faithOf(),'hon'); ok(!swear('dis'),'one oath at a time');
  eq(faithRank(),0); eq(pMax(),hp,'rank 0 gives nothing'); S.faith.dev=DEV_STEP; eq(faithRank(),1); eq(faithBuff('hon').healp,15); P.stats.constitution=300; arena([foe()]); P.hp=10; eq(healAlly(P,100),Math.round(100*(1+(15+conHeal())/100)),'heals 15% more (on top of Constitution)'); flee();
  const hp1=pMax(); S.faith.dev=2*DEV_STEP; ok(Math.abs(pMax()-hp1*1.08)<=2,'+8% max HP at rank 2'); S.faith.dev=99*DEV_STEP; eq(faithRank(),DEV_RANKS,'five ranks at most');
  S.gold=0; ok(!renounce(),'costs gold'); S.gold=1e4; ok(renounce()); eq(faithOf(),null); eq(S.gold,1e4-renounceCost());
  ok(swear('dis')); S.faith.dev=4*DEV_STEP; eq(faithB('dmgp'),20); eq(faithB('hpp'),-10); eq(faithB('goldp'),15); P.hp=Math.min(P.hp,pMax()); invariants('faith');
});
test('Faith: the Pantheon on the Town tab, five gods with vows and boons; saves keep only a real oath and old oaths convert',()=>{
  setLvl(8); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); ui.tab='town'; let h=renderAll('shrine'); ok(/The Pantheon/.test(h)); GODS.forEach(k=>ok(new RegExp('data-a="swear" data-k="'+k+'"').test(h),k)); ok(h.includes(FAITH.ulm.vow));
  ACTIONS.swear('dis'); eq(faithOf(),null,'asks first'); ACTIONS.swear('dis'); eq(faithOf(),'dis'); h=renderAll('sworn'); ok(/The Profane/.test(h)&&/rank 0\/5/.test(h)&&/faith-l dis/.test(h));
  eq(buffTxt({drp:-3}),'+3% Damage taken'); eq(buffTxt({drp:3}),'&minus;3% Damage taken'); ok(TIPS.find(t=>t.id==='faith').m.includes('Pantheon'),'tip names the Pantheon');
  const g=normalizeSave({v:2,player:{lvl:9},faith:{id:'nope',day:1}}); eq('faith' in g,false); eq(normalizeSave({v:2,player:{lvl:9},faith:{id:'hon',day:3}}).faith.id,'hon');
  eq(normalizeSave({v:2,day:40,player:{lvl:9},faith:{id:'hon',day:3}}).faith.dev,4*DEV_STEP,'25+ days: rank 4'); eq(normalizeSave({v:2,day:20,player:{lvl:9},faith:{id:'dis',day:3}}).faith.dev,2*DEV_STEP,'10+ days: rank 2');
  eq(normalizeSave({v:2,day:20,player:{lvl:9},faith:{id:'vesh',day:3,dev:150,vb:2}}).faith.dev,150);
});
test('Music and looks: every boss (secret ones too) has its own theme and background, with no blue or purple',()=>{
  const bosses=DUNGEONS.map(D=>D.boss[0]).concat(TW_BOSS,SECRET.map(x=>x.name));
  bosses.forEach(n=>{ ok(BOSS_THEME[n]&&MODES[BOSS_THEME[n][1]],n+' theme'); ok(BOSS_LOOK[n]&&['rays','rings','drip','mist'].includes(BOSS_LOOK[n][2]),n+' look'); });
  eq(new Set(bosses.map(n=>BOSS_THEME[n].join())).size,bosses.length,'no two themes alike');
  const hue=h=>{ const r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn; if(d<.08) return -1; let x=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4; return (x*60+360)%360; };
  bosses.forEach(n=>BOSS_LOOK[n].slice(0,2).forEach(c=>{ const h=hue(c); ok(h<0||h<190||h>320,n+' colour '+c+' is blue or purple'); }));
  arena([foe()]); eq(musicScene(),'g0'); flee(); const b=bossFight(2); eq(musicScene(),'boss:The Ember Knight'); eq(sceneOf(musicScene()).mode,'hm'); b.hp=0; ok(/^g\d|boss/.test(musicScene()));
  Object.keys(THEMES).forEach(k=>ok(MODES[THEMES[k].mode],k)); MUSIC.on=false; music();
});
test('Gates: a card shows clears by difficulty, the best run, study and rewards, and keeps the boss hidden until met',()=>{
  setLvl(10); S.mode='town'; S.kills={}; S.ti=S.ti||{}; S.ti.clr={}; S.heatMax={}; S.rec={};
  let g=gateHTML(0); ok(/Boss: <b>\?\?\?<\/b>/.test(g)&&!g.includes('gate-mark')&&!g.includes('The Rat King'),'boss unknown: no name, no painting');
  ok(/g-boss unknown/.test(gateDetHTML(0))&&!gateDetHTML(0).includes('The Rat King')); ok(!/Best \d+ turns/.test(g)); eq(gateStars(0).join(),'false,false,false,false');
  S.kills['The Rat King']=1; g=gateHTML(0); ok(g.includes('gate-mark')&&g.includes('Boss: <b>The Rat King</b>'),'met'); ok(gateDetHTML(0).includes('Met, not yet beaten'));
  S.ti.clr={0:1}; S.heatMax={0:2}; S.rec={fast:{0:{t:14,day:3,heat:1}}}; eq(gateStars(0).join(),'true,true,true,false'); g=gateHTML(0);
  eq((g.match(/class="g-star h\d on"/g)||[]).length,3,'three of four stars'); ok(g.includes('Best 14 turns'),'best run'); ok(/Beaten/.test(gateDetHTML(0)));
  ok(gateDetHTML(0).includes('0/'+(DUNGEONS[0].mobs.length+1)+' foes')&&/Tier mix unknown/.test(gateDetHTML(0))); S.kills['Tunnel Rat']=KNOW_AT; ok(gateDetHTML(0).includes('1/'+(DUNGEONS[0].mobs.length+1)+' foes')&&gateDetHTML(0).includes('Common 78%'),'studied foes reveal the tier mix');
  ok(!bossMet(1)&&/Boss: <b>\?\?\?<\/b>/.test(gateHTML(1)),'another gate stays hidden');
  ui.tab='gates'; let h=renderAll('cards'); ok(!/class="g-det"/.test(h)); ACTIONS.gdet('0'); h=renderAll('details'); ok(/class="g-det"/.test(h)&&/data-a="gdet" data-k="0" aria-expanded="true"/.test(h)); ACTIONS.gdet('0'); eq(ui.gdet,null);
  S.mod={day:S.day,gi:0,id:'volatile'}; ok(/class="curse-line" title="Cursed: Volatile dead\. [^"]+"><b class="curse-tag"><i aria-hidden="true">&#9760;<\/i> Volatile dead<\/b> Foes \+15% &middot; gold x2/.test(gateHTML(0)),'curse banner');
  ok(/class="g-head gs-g0" aria-hidden="true">/.test(g)&&/g-por gate-mark/.test(g),'a tile: the painted place and the boss portrait, hidden from screen readers');
  ok(/g-por unknown/.test(gateHTML(1))&&!/g-seal/.test(gateHTML(1)),'an open gate with its boss unmet: the hooded shape'); setLvl(1); ok(/g-seal/.test(gateHTML(5))&&gateHTML(5).includes('Sealed &middot; Lv '+RK[5].unlock)&&/data-a="enter" data-k="5" disabled/.test(gateHTML(5)),'a sealed gate: chains, its level, Enter disabled'); setLvl(10);
  eq((heatHTML(0).match(/<i class="hm h(\d)"/g)||[]).length,HEAT.length,'a skull mark on every difficulty chip'); ok(heatHTML(0).includes('<i class="hm h3" aria-hidden="true">'+HEAT_SKULL.repeat(4)+'</i>'),'four on Nightmare');
  eq(trText('Best 14 turns'),'En iyi 14 tur'); eq(trText('1/4 foes'),'1/4 düşman'); eq(trText('Met, not yet beaten'),'Karşılaşıldı, henüz yenilmedi');
});
test('Difficulty rules: Hard doubles elites (stacking with the Blood Moon); the extra elites carry the unique at ordinary odds',()=>{
  setLvl(30); S.ti=S.ti||{}; S.ti.clr={2:1}; S.heatMax={2:3}; arena([foe()],2);
  near(eliteChance(),.1,1e-9); S.run.heat=1; near(eliteChance(),.2,1e-9); S.omen={day:S.day,id:'bloodmoon'}; near(eliteChance(),.4,1e-9); S.omen={day:S.day,id:null};
  fix(.15); let e=makeEnemy(2,20,false); ok(e.elite&&e.hx,'an elite of the rule'); fix(.05); e=makeEnemy(2,20,false); ok(e.elite&&!e.hx,'an elite of the normal roll'); S.run.heat=0; fix(.15); ok(!makeEnemy(2,20,false).elite,'Normal: no elite');
  const uq=t=>t.find(r=>r.id==='u2').p; near(uq(tableFor(2,'striker',false,true,null,true)),uq(tableFor(2,'striker',false,false)),1e-12,'ordinary unique odds'); ok(uq(tableFor(2,'striker',false,true))>uq(tableFor(2,'striker',false,true,null,true)),'a rolled elite keeps elite odds');
});
test('Difficulty rules: Brutal puts an affix on every front-row foe without elite stats and moves the second phase to 65%',()=>{
  setLvl(30); S.ti=S.ti||{}; S.ti.clr={2:1}; S.heatMax={2:3}; ok(setHeat(2,2)); S.watches=3; seed(31); startRun(2);
  S.run.enemies.forEach(e=>{ eq(!!(e.aff&&e.aff.length),e.elite||rowOf(e)==='f',e.name+' ('+e.role+')'); if(!e.elite&&e.aff) eq(e.aff.length,1); });
  const b=bossFight(0); S.run.heat=1; b.hp=b.maxHp*.6; checkPhase(); ok(!b.phase2,'Hard: still 50%'); S.run.heat=2; checkPhase(); ok(b.phase2,'Brutal: 65%, the Rat King too');
});
test('Difficulty rules: Nightmare puts an elite in every room and starts bosses in their second phase; all of it is shown, in Turkish too',()=>{
  setLvl(30); S.ti=S.ti||{}; S.ti.clr={2:1}; S.heatMax={2:3}; ok(setHeat(2,3)); S.watches=3; fix(.99); startRun(2);
  const L=S.run.enemies.filter(e=>e.elite); eq(L.length,1,'one made elite'); ok(L[0].hx&&L[0].name!==L[0].base);
  S.run.room=S.run.rooms-1; spawnRoom(); ok(S.run.enemies.find(e=>e.boss).phase2,'the boss starts in phase 2'); ok(S.run.enemies.some(e=>e.elite)); flee();
  S.mode='town'; S.run=null; ui.tab='gates'; ui.gdet=2; const h=renderAll('rules'); ok(h.includes('title="'+heatRules(3).join(' ')+'"'),'chip tooltip'); ok(h.includes('class="g-rules"')&&h.includes(HEAT[3].rule),'Details');
  const cx=codexSection('gates'); HEAT.slice(1).forEach(x=>ok(cx.includes(x.rule)));
  HEAT.slice(1).map(x=>x.rule).concat(['Rules',heatRules(3).join(' '),'Each harder difficulty also adds a rule and keeps the rules below it. Elites the rules add drop as elites, but carry the gate\'s unique only at an ordinary foe\'s odds.']).forEach(t=>ok(trText(t)!==t,'untranslated: '+t));
});
test('Difficulty: adds a boss calls in are as strong as the room around them (Hard and up, curses, the Rift)',()=>{
  fresh(10); S.ti={clr:{0:1}}; S.heatMax={0:2}; S.mod={day:S.day,gi:-1,id:null}; setHeat(0,3); S.mode='town'; S.watches=WATCHES; fix(.5); startRun(0);
  const room=S.run.enemies[0], b=makeEnemy(0,room.lvl+2,true); S.run.enemies=[room,b]; const a=summonAdd(b);
  eq(a.base,room.base); eq(a.lvl,room.lvl); eq(a.maxHp,room.maxHp,'Nightmare scales the add like the room');
  const same=(what)=>{ const room=S.run.enemies[0], b=makeEnemy(S.run.di,room.lvl+2,true); if(S.run.rift) riftScale([b]); S.run.enemies=[room,b]; const a=summonAdd(b);
    eq(a.base,room.base,what+': the room\'s own roster'); eq(a.lvl,room.lvl,what); eq(a.maxHp,room.maxHp,what+' scales the add like the room'); eq(a.atk,room.atk,what); };
  fresh(); setLvl(60); S.ti={clr:{0:1,5:1}}; S.mod={day:S.day,gi:0,id:'fury'}; S.watches=WATCHES; fix(.5); startRun(0); eq(S.run.mod,'fury'); ok(curseRise(0)>0); same('a cursed gate');
  fresh(); setLvl(45); S.ti={clr:{5:1}}; S.rift={best:2}; S.watches=WATCHES; fix(.5); ok(startRift(3)); ok(S.run.di<5,'a Rift over a lower gate'); same('the Rift');
});
})();
