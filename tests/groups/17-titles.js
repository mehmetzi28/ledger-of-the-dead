// Titles tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Titles: earned once, worn automatically, with one notice',()=>{
  checkTitles(); eq(Object.keys(S.ti.got).length,0); S.ti.raised=1; checkTitles(); ok(S.ti.got.d_raise1); eq(S.ti.sel,'d_raise1'); eq(titleName(),'First Whisper');
  const n=S.notices.length; checkTitles(); eq(S.notices.length,n,'no second notice');
});
test('Titles: every condition can be checked on a new game without errors',()=>{ checkTitles(); TITLES.forEach(t=>{ const v=t.ok(); ok(v===true||v===false||v===undefined||typeof v==='number','title '+t.id+' returned '+v); }); });
test('Titles: deed counters add up',()=>{ tally('x'); tally('x',4); eq(S.ti.x,5); });
test('Titles: 204 titles, each with a small, readable bonus',()=>{
  eq(TITLES.length,204); eq(new Set(TITLES.map(t=>t.name)).size,204,'unique names');
  for(const t of TITLES){ const ks=Object.keys(t.b); ok(ks.length>=1&&ks.length<=2,t.id+' bonus count'); ks.forEach(k=>{ ok(TBUFF_L[k]||STATL[k],t.id+' unknown bonus '+k); ok(t.b[k]>0&&t.b[k]<=(TBUFF_L[k]?10:25)*RARITY_MUL[t.r],t.id+' '+k+' is not small'); ok(k!=='slot',t.id+' gives army slots'); }); ok(buffTxt(t.b)&&!BAD_TEXT.test(buffTxt(t.b)),t.id+' text'); }
  ['Gates','Hell Tower','Curses and events','Deeds'].forEach(g=>ok(TITLES.some(t=>t.grp===g),g));
});
test('Titles: a bonus only applies while that title is worn',()=>{
  const P=S.player, h=pMax(); earn('g2','g0'); S.ti.sel=null; eq(pMax(),h,'earned but not worn');
  ok(wearTitle('g2')); eq(S.ti.sel,'g2'); eq(pMax(),Math.round(h*1.03)); eq(P.hp,pMax(),'HP rises with it');
  ok(wearTitle('g0')); eq(pMax(),h+10,'switching swaps the bonus'); ok(wearTitle('g0')); eq(S.ti.sel,null); eq(pMax(),h); eq(P.hp,h,'HP drops back to the new max');
  ok(!wearTitle('t100'),'not earned'); arena([foe()]); ok(!wearTitle('g2'),'not in battle'); eq(S.ti.sel,null);
});
test('Titles: every kind of bonus does what it says',()=>{
  const P=S.player; earn('g3','t20','d_uq','d_study','t50','d_lv25','g4','t30','t10','t60','d_tower1','d_cancel','d_kill100');
  arena([foe()],2); const m=dmgMul(); wearTitle; S.mode='town'; wearTitle('g3'); S.mode='battle'; near(dmgMul(),m*(1+TITLE.g3.b.dmgp/100),1e-9,'damage');
  S.mode='town'; wearTitle('t20'); S.mode='battle'; P.hp=1000; S.player.stats.constitution=500; P.hp=pMax(); const hp=P.hp; hurtAlly(P,100); eq(hp-P.hp,100-TITLE.t20.b.drp-CON_DR_CAP,'damage taken (plus the capped Constitution part)');
  const e=foe({lvl:6}); S.mode='town'; wearTitle('d_study'); const x=killXp(e); wearTitle('d_study'); eq(x,Math.round(killXp(e)*(1+TITLE.d_study.b.xpp/100)),'XP');
  fix(.5); wearTitle('d_uq'); const r={}; killLoot(foe({lvl:20}),r); wearTitle('d_uq'); const r2={}; killLoot(foe({lvl:20}),r2); eq(r.gold,Math.round(r2.gold*(1+TITLE.d_uq.b.goldp/100)),'gold');
  const mana=pMana(); wearTitle('t50'); eq(pMana(),Math.round(mana*(1+TITLE.t50.b.manap/100)),'mana %');
  wearTitle('d_lv25'); eq(A('intelligence'),S.player.stats.intelligence+TITLE.d_lv25.b.intelligence); eq(A('will'),S.player.stats.will+TITLE.d_lv25.b.will);
  const mn=mkMinion({lvl:20,rankI:4}), a=mn.maxHp; wearTitle('g4'); syncMinion(mn); ok(mn.maxHp>a,'minion power reaches the army');
  for(const id of ['t10','t60','d_tower1','d_cancel','d_kill100','t30']){ wearTitle(id); const [k,v]=Object.entries(TITLE[id].b)[0]; eq(G(k),v,id); }
});
test('Titles: a new title is worn automatically only when you wear none',()=>{
  S.ti={raised:1}; checkTitles(); eq(S.ti.sel,'d_raise1'); S.ti.raised=50; checkTitles(); ok(S.ti.got.d_raise50); eq(S.ti.sel,'d_raise1','your choice is kept');
  ok(S.notices.some(n=>/Worn, it gives/.test(n.m)));
});
test('Titles: an automatically worn title updates HP, mana and the army at once (bug found by the fuzzer)',()=>{
  const m=mkMinion({lvl:20,rankI:4}); const mh=m.maxHp; S.ti={evolved:1}; checkTitles(); eq(S.ti.sel,'d_evolve');
  const c=JSON.parse(JSON.stringify(m)); syncMinion(c); eq(m.maxHp,c.maxHp,'army refreshed'); ok(m.maxHp>mh);
  fresh(); const P=S.player, h=pMax(); S.ti={deaths:1}; checkTitles(); eq(S.ti.sel,'d_death'); eq(pMax(),h+15); eq(P.hp,pMax(),'HP rose with the title');
  S.ti.got={}; S.ti.deaths=0; checkTitles(); eq(S.ti.sel,null); eq(P.hp,h,'losing a title never leaves HP above max');
});
test('Titles: a worn title that is somehow unknown gives nothing and is cleared',()=>{ S.ti={got:{zz:1},sel:'zz'}; eq(titleB('hpp'),0); S.ti={got:{},sel:'g2'}; S.player.hp=pMax(); checkTitles(); eq(S.ti.sel,null); ok(S.player.hp<=pMax()); });
test('Titles: the worn title survives saving and loading',()=>{ earn('g2'); wearTitle('g2'); const h=pMax(); save(); S=null; loadGame(); eq(S.ti.sel,'g2'); eq(pMax(),h); });
test('Titles: new deeds are counted as you play',()=>{
  const P=S.player; P.stats.strength=400; P.stats.constitution=300; P.hp=pMax(); S.ti={clr:{0:1}}; S.mod={day:1,gi:0,id:'horde'}; fix(.05); startRun(0); let n=0;
  while(n++<300&&!(S.mode==='raise'&&S.run.cleared)){ if(S.mode==='battle') act('strike'); else descend(); }
  eq(S.ti.clrN0,1); eq(S.ti.cur_horde,1); eq(S.ti.cursed,1); ok(S.ti.crits>=4,'crits counted'); ok(S.ti.bosses>=1); returnTown();
  S.watches=3; startRun(0); S.run.enemies=[foe({hp:1,boss:true,elite:false}),foe({hp:1e6,atk:5})]; S.run.target=S.run.enemies[0].id; act('strike'); ok(S.run.hurt,'hurt this run');
  fresh(); P.hp; setLvl(20); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); startTower(1); eq(S.ti.twRuns,1); flee();
  eventScene('shrine'); resolveEvent('bleed'); eq(S.ti.shrine,1); eventScene('pedlar'); S.gold=99; resolveEvent('buy'); eq(S.ti.pedlar,1);
  eventScene('coffer'); fix(.99); resolveEvent('open'); eq(S.ti.coffer,1); eq(S.ti.trap,1); eventScene('straggler',3); fix(.5); resolveEvent('raise'); fix(0); tryRaise(S.run.corpses[S.run.corpses.length-1].id); eq(S.ti.straggler,1);
  const b=corpse({boss:true,name:'The Rat King',base:'The Rat King',role:'reaper'}); raiseScene([b],10); S.player.mana=99; fix(0); tryRaise(b.id); eq(S.ti.raisedBoss,1);
  arena([foe({hp:1e6})]); fix(.5); S.belt={hp:2,mp:2}; addDot(S.player,'bleed',3,3); act('pot:hp'); S.player.mana=0; act('pot:mp'); eq(S.ti.drank,2); eq(S.ti.cures,1);
  S.player.skills={spear:1,chill:1}; S.player.mana=200; S.run.cd={}; act('sk:spear'); act('sk:chill'); eq(S.ti.sk_spear,1); eq(S.ti.frozen,1);
  const v=mkMinion({traits:['venom']}); v.atk=50; act('strike'); ok(S.ti.poisoned>=1);
  flee(); const it=give('1-wa'); sellItem(it.u); eq(S.ti.soldItems,1);
});
test('Titles: flawless clears and last-breath wins are recognised',()=>{
  const P=S.player; P.stats.strength=400; P.hp=pMax(); startRun(0); S.run.room=3; S.run.enemies=[foe({hp:1})]; S.run.target=S.run.enemies[0].id; fix(.5); act('strike'); ok(S.run.cleared); eq(S.ti.flawless,1);
  fresh(); arena([foe({hp:1})]); S.player.hp=3; fix(.5); act('strike'); eq(S.ti.lastBreath,1); fresh(); arena([foe({hp:1})]); act('strike'); eq((S.ti||{}).lastBreath,undefined);
});
test('Titles: the Titles page shows every bonus and what you wear',()=>{ earn('g2'); wearTitle('g2'); ui.tab='titles'; const h=renderAll('titles'); ok(/When worn: \+3% Max HP/.test(h)); ok(/Wearing <b>Ashwalker<\/b>/.test(h)); ok(/Curses and events/.test(h)); });
test('Titles: the big deeds unlock',()=>{
  const s=richState(); S.ti.got={}; S.ti.sel=null; S.player.lvl=50; S.ti.raised=200; S.ti.rewritten=6; S.ti.longHaul=1; S.ti.sgnCast=100; S.runes=RUNE_IDS.slice(); KIT_IDS.forEach(k=>S.ti['chK_'+k]=1); S.ti.nameLines=1; S.nameLines=Array.from({length:10},(_,i)=>({name:'N'+i,role:'striker',day:1})); S.ti.actives=500; S.ti.deaths=10; S.ti.claims=7; S.ti.cancels=10; S.ti.master=1; S.ti.soldTro=500; S.ti.emp=25; S.ti.evolved=1; S.ti.elder=1; S.ti.ancient=1; S.ti.eternal=1; S.ti.raidWins=25; S.rift={best:30}; S.ti.armed=1; S.tower.best=150; S.ngp=10; ASC_IDS.forEach(k=>S.ti["asc_"+k]=1); S.pacts=['hides','claws','regen']; S.ti.clr[5]=1;
  allNames().forEach(n=>S.kills[n]=2000);
  S.player.lvl=75; S.ti.raised=500; S.tower.best=200; S.day=100; for(let i=0;i<6;i++){ S.ti['secret_'+i]=1; S.ti['nm'+i]=1; } S.ti.heat1=S.ti.heat2=S.ti.damned3=1; for(let i=0;i<6;i++) S.ti['clrN'+i]=25; Object.keys(MODS).forEach(m=>S.ti['cur_'+m]=1);
  Object.assign(S.ti,{twRuns:50,cursed:25,shrine:10,pedlar:10,coffer:15,trap:5,straggler:10,poisoned:200,cures:25,drank:100,sk_spear:100,sk_blast:50,frozen:50,sk_reap:100,crits:1000,flawless:1,lastBreath:1,bosses:25,elites:100,reforged:25,soldItems:100,raisedBoss:1});
  Object.assign(S.ti,{flawless:10,floors:500,riftRuns:25,rifts:50,fused:10,omenRuns:1,omenWins:25}); Object.keys(OMENS).forEach(o=>{ S.ti['om_'+o]=1; S.ti['omw_'+o]=5; }); S.life.clears=100;
  S.rec=Object.assign(S.rec||{},{fast:{0:{t:16,day:1,heat:0}},streak:{v:10,day:1},tw10:{v:75,day:1},ftr:{v:FUSE_TRAITS,day:1},riftF:{10:{t:25,day:1,d:10}}}); S.gold=25000; ['u0','u1','u2','u3','u4','u5'].forEach(id=>give(id));
  S.ti.fullGear=true; Object.assign(S.life,{gold:50000,items:200,runs:100,rooms:1000}); const L=give('4-wa'); L.ro=[['will',1],['hp',9],['crit',2]];
  S.army=[]; TRAIT_IDS.forEach((t,i)=>mkMinion({traits:[t],stage:i<3?2:0,lvl:20})); mkMinion({lvl:50}); Object.keys(ROLES).forEach(r=>mkMinion({lvl:30,role:r,stage:4})); while(S.army.length<slots()) mkMinion({});
  KIT_IDS.forEach(k=>S.ti['ks_'+k]=1); S.ti.weakK=500; S.ti.defused=25; S.ti.gcBane=50; for(let i=0;i<10;i++){ S.ti['tf_'+i]=1; if(i<6) S.ti['ub_'+i]=1; }   /* the foe-kit and boss-kit deeds */
  S.abbey={keys:{deep:1,secret:0},open:1}; Object.assign(S.ti,{scriptor:1,echoBreak:1,nm6:1}); S.ti.clr[ABBEY]=1; S.endHist=[{k:'closed',day:1,cycle:0},{k:'kept',day:2,cycle:1}];   /* Vane Abbey and both endings */
  Object.assign(S.ti,{expLong:1,exp_hunt:10,expClean:20,rallies:100,wagerWins:5,reclaimed:10,rivalEnded:1,rivalSpared:1,arcClean:1,r5_hon:1,r5_vesh:1,r5_ulm:1,r5_choir:1,r5_dis:1,godless:1,converted:3,godCalls:20,sig3_20:1,weekBests:10,rb50:1}); S.rift.gk={0:1,1:1,2:1,3:1,4:1,5:1}; S.rift.fr=4;   /* the expedition, Rally and rival deeds */
  checkTitles(); const miss=TITLES.filter(t=>!S.ti.got[t.id]).map(t=>t.id); eq(miss.join(),'','titles not earned');
});

test('Titles: six rarities; rarer ones give bigger bonuses, and Epic and rarer stay hidden until earned',()=>{
  TITLES.forEach(t=>ok(TITLE_RARITY[t.id]!=null,t.id+' has a rarity')); for(let r=0;r<6;r++) ok(TITLES.some(t=>t.r===r),TIERS[r]+' titles exist');
  eq(TITLE.t100.r,4); eq(TITLE.tw200.r,5); eq(TITLE.g0.r,0); ok(TITLE.tw200.b.dmgp>=24,'unique: x3');
  ui.tab='titles'; let h=renderAll('titles'); ok(!h.includes('Lord of the Abyss')&&!h.includes(TITLE.tw200.req),'hidden'); ok(/A hidden unique title/.test(h)); ok(h.includes('Ratcatcher'),'common ones show');
  checkTitles(); S.ti.got.tw200=1; h=renderAll('earned'); ok(h.includes('Lord of the Abyss'),'revealed once earned'); ok(/t-rar t5">Unique/.test(h));
});
const earnN=n=>{ S.ti=S.ti||{}; S.ti.got={}; TITLES.slice(0,n).forEach(t=>S.ti.got[t.id]=1); S.ti.sel=null; };
test('Titles collection: +1% gold from kills per 10 titles earned, capped at +10%, and nothing else',()=>{
  const N=TITLES.length; eq(N,204); const base=xb('goldp');
  for(const [n,b] of [[0,0],[9,0],[10,1],[25,2],[99,9],[100,10],[N,10]]){ earnN(n); eq(titlesGot(),n); eq(titleColB(),b,n+' titles'); eq(xb('goldp'),base+b,'goldp at '+n); }
  earnN(N); S.ti.got.nonsense=1; eq(titlesGot(),N,'unknown ids do not count'); for(const k of ['dmgp','hpp','drp','xpp','crit','mpow']) eq(xb(k),0,'no '+k);
  earnN(0); eq(xb('dmgp'),0);
});
test('Titles collection: it adds to gold from a kill, survives New Game+, and the tab and Codex say so',()=>{ const N=TITLES.length;
  const coin=n=>{ earnN(n); arena([foe()]); const r=S.run; fix(.5); killLoot(foe({lvl:400,rankI:3}),r); return r.gold; };
  const g0=coin(0), g10=coin(100); ok(g0>100,'a sizeable coin: '+g0); near(g10/g0,1.1,.01);
  S.run=null; S.mode='town'; earnN(14); ui.tab='titles'; let h=renderAll('titles');
  ok(h.includes('Collection: 14/'+N+' titles &middot; +1% gold from kills &middot; next at 20'),'tab line'); ok(h.indexOf('tt-col')<h.indexOf('tt-filter'),'at the top');
  earnN(N); ok(renderAll('all titles').includes('Collection: '+N+'/'+N+' titles &middot; +10% gold from kills &middot; full bonus'));
  earnN(0); ok(renderAll('no titles').includes('Collection: 0/'+N+' titles &middot; +0% gold from kills &middot; next at 10'));
  earnN(25); ok(/Every 10 titles you have earned add 1% gold from kills, up to \+10%/.test(cdx('titles'))&&cdx('titles').includes('Collection: 25/'+N+' titles &middot; +2% gold from kills &middot; next at 30'),'Codex');
  eq(trText('Collection: 14/122 titles · +1% gold from kills · next at 20'),'Koleksiyon: 14/122 unvan · +%1 öldürmeden altın · sonraki: 20'); ok(trText('full bonus')!=='full bonus');
  S.ti.clr={5:1}; ok(startNGP()); eq(titlesGot(),25,'titles kept through New Game+'); eq(titleColB(),2);
});
test('Titles: the new gate, Tower, Rift, army, omen and collection titles unlock and read in Turkish',()=>{
  const ids=['x_clr100','x_allgates','x_swift','x_flaw10','x_streak10','x_tw10','x_floors500','x_abyss','x_rift25','x_rift50','x_riftfast','x_fuse10','x_ftr','x_mlv50','x_omen1','x_omen25','x_omenall','x_eclipse','x_mastered25','x_ledger10','x_relics','x_hoard','x_titles50','x_titles100'];
  ids.forEach(id=>{ const t=TITLE[id]; ok(t,id); ok(trText(t.name)!==t.name,id+' name in Turkish'); ok(trText(t.req.replace(/\.$/,''))!==t.req.replace(/\.$/,''),id+' req in Turkish: '+t.req); ok(TITLE_RARITY[id]!=null); });
  checkTitles(); ids.forEach(id=>ok(!S.ti.got[id],id+' not on a new game'));
  S.omen={day:S.day,id:'ashfall'}; arena([foe({hp:0,dead:true})]); roomWon(); returnTown(); eq(T_('omenRuns'),1); eq(T_('om_ashfall'),1); checkTitles(); ok(S.ti.got.x_omen1,'Omen-Born');
  S.omen={day:S.day,id:null}; arena([foe()]); flee(); eq(T_('omenRuns'),1,'no omen, no count');
  Object.keys(OMENS).forEach(o=>{ S.ti['om_'+o]=1; }); checkTitles(); ok(S.ti.got.x_omenall,'every omen, whatever omens exist');
  ok(OMENS.eclipse&&/^Win 5 runs under the Eclipse\./.test(TITLE.x_eclipse.req),'the stated requirement is the real one'); S.ti.omw_eclipse=4; checkTitles(); ok(!S.ti.got.x_eclipse,'4 is not enough'); S.ti.omw_eclipse=5; checkTitles(); ok(S.ti.got.x_eclipse,'Lord of the Eclipse');
  S.rec=S.rec||{}; S.rec.ftr={v:FUSE_TRAITS,day:1}; checkTitles(); ok(S.ti.got.x_ftr); ok(TITLE.x_ftr.req.includes(String(FUSE_TRAITS)));
  for(const id of ids) ok(TITLE[id].b&&Object.keys(TITLE[id].b).length,id+' bonus');
});

})();
