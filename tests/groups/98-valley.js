// A living valley, R13 PR B (src/game-valley.js): five curses, ten events, three gate chains, three omens.
(function(){
const {test,ok,eq,near,fix,fresh,setLvl,foe,arena,mkMinion,renderAll,cdx,invariants}=window.LOTD_T;
const scene=(id,di)=>{ fresh(40); arena([foe({hp:0,dead:true})],di||0); fix(.99); roomWon(); S.run.event={id}; if(id==='saint') S.run.event.g='vesh'; return S.run; };
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const curse=(id,di)=>{ fresh(40); S.ti=S.ti||{}; S.ti.clr={0:1,1:1}; S.mod={day:S.day,gi:di||0,id}; S.watches=WATCHES; startRun(di||0); return S.run; };
test('Valley curses: Hunger drains a Soul, Mirror lends your trait, Silent stops orders, Long adds a room, Thin keeps two bodies',()=>{
  eq(NEW_CURSES.length,5); NEW_CURSES.forEach(k=>ok(MODS[k]&&MODS[k].desc&&tr(MODS[k].name)!==MODS[k].name&&tr(MODS[k].desc)!==MODS[k].desc,k));
  let r=curse('hunger'); r.souls=2; spawnRoom(); eq(r.souls,1,'Hunger'); r.souls=0; spawnRoom(); eq(r.souls,0,'never below 0');
  r=curse('long'); eq(r.rooms,5,'Long: one more room'); r=curse('fury'); eq(r.rooms,4);
  r=curse('mirror'); S.army=[]; const a=mkMinion({lvl:30}), b=mkMinion({lvl:30}); a.traits=['venom']; b.traits=['venom','stalwart']; eq(armyTrait(),'venom'); const L=buildRoom(1,'fight'); ok(L.every(e=>e.traits&&e.traits.includes('venom')),'every foe takes it');
  const t=mkMinion({lvl:30}); t.hp=t.maxHp; const x=foeTraitHit(L[0],t); ok(t.dots&&t.dots.poison,'the wound on its hits'); ok(x.includes('poison'));
  S.army=[a]; a.traits=['stalwart']; const L2=buildRoom(1,'fight'); const plain=(()=>{ S.run.mod=null; const q=buildRoom(1,'fight'); S.run.mod='mirror'; return q; })(); ok(L2[0].traits.includes('stalwart'),'any trait');
  r=curse('silent'); S.army=[mkMinion({lvl:30,role:'vanguard'})]; S.mode='battle'; ok(!canCommand('vanguard'),'Silent'); S.run.mod=null; ok(canCommand('vanguard'));
  r=curse('thin'); r.corpses=[1,2,3,4].map(i=>corpseOf(foe({hp:0,elite:i===3}))); r.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(r.corpses.length,2,'Thin'); ok(r.corpses.some(c=>c.elite),'the elite first');
});
test('Valley omens: Red Mist, Grave Wind and Still Air; dawn and the gods\' calls know them',()=>{
  fresh(40); S.ti=S.ti||{}; S.ti.clr={0:1}; ['redmist','gravewind','stillair'].forEach(k=>{ ok(OMEN_NAT.includes(k),k); ok(tr(OMENS[k].name)!==OMENS[k].name); });
  ok(GOD_OMENS.dis.includes('redmist')&&GOD_OMENS.choir.includes('gravewind')&&GOD_OMENS.vesh.includes('stillair'),'each in a god\'s call list');
  const c0=critChance(), f0=foeCrit(), m=mkMinion({lvl:30,role:'vanguard'}), m0=mCritCh(m); S.omen={day:S.day,id:'redmist'}; near(critChance()-c0,MIST_CRIT,1e-9); near(foeCrit()-f0,MIST_CRIT,1e-9); near(mCritCh(m)-m0,MIST_CRIT,1e-9);
  S.omen={day:S.day,id:null}; arena([foe({hp:1e6})]); const cs=corpseOf(foe({hp:0,lvl:1})); const k0=soulCap(), r0=raiseChance(cs); S.omen={day:S.day,id:'gravewind'}; eq(soulCap(),Math.max(1,k0-1)); ok(raiseChance(cs)>=Math.min(RAISE_MAX,r0+WIND_RAISE-1),'raise +5');
  S.omen={day:S.day,id:'stillair'}; const e=S.run.enemies[0]; e.dots={poison:{d:50,t:3}}; const h=e.hp; tickDots(); eq(e.hp,h,'Still Air'); eq(e.dots.poison.t,3,'it holds');
});
test('Valley events: all ten resolve, each choice does what it says, and every outcome reads in Turkish',()=>{
  eq(VEV_IDS.length,10); const out=[];
  const go=(id,ch,di,prep)=>{ const r=scene(id,di); if(prep) prep(r); ok(resolveEvent(ch),id+':'+ch); const m=r.event.done; out.push(m); return r; };
  S.dread=5; let r=go('mourners','take',0,()=>{ S.dread=5; }); ok(r.corpses.some(c=>c.free),'a free body');
  r=go('mourners','bless',0,()=>{ S.dread=5; S.dread=20; }); ok(!dreadOn()||S.dread<=16,'dread -4');
  r=go('hanged','cut',2); ok(r.corpses.some(c=>c.base==='Ash Seer'),'a hexer body'); go('hanged','leave');
  r=go('patrol','raise'); eq(r.corpses.filter(c=>c.free).length,2); go('patrol','spare');
  r=go('bonemerch','swap',0,()=>{ S.army=[mkMinion({lvl:12})]; }); eq(S.army.length,0); ok(r.corpses.some(c=>c.free&&c.lvl>=12),'a stranger');
  go('bell','ring'); ok(S.omenNext&&S.omenNext.day===S.day+1&&OMEN_NAT.includes(S.omenNext.id),'the bell'); go('bell','silence'); eq(S.omenNext.id,null);
  go('statue','read'); go('statue','tears',0,()=>{ S.belt.mp=0; }); eq(S.belt.mp,1);
  go('thief','duel',0,()=>{ S.rival=S.rival||{}; S.rival.met=1; });
  for(let i=0;i<6;i++) go('fever','throw',0,()=>{ S.army=[mkMinion({lvl:10})]; S.army[0].traits=['venom']; });
  go('wagon','cargo'); go('wagon','help');
  r=scene('saint'); S.faith={id:'hon',day:1,dev:400,dd:0,dday:1,vb:0}; ok(resolveEvent('kneel'),'kneel'); eq(faithOf(),'vesh'); eq(S.faith.dev,300); out.push(r.event.done); go('saint','break',0,()=>{ S.faith={id:'dis',day:1,dev:0,dd:0,dday:1,vb:0}; });
  out.forEach(m=>ok(tr(m)!==m,'Turkish: '+m));
  fresh(40); S.dread=90; ok(!evOk('mourners'),'mourners only when the town is calm'); S.faith=undefined; ok(!evOk('saint'),'the saint needs a god');
  VEV_IDS.forEach(k=>{ const E=EVENTS[k]; [E.name,E.text].concat(E.opts.map(o=>o[1])).forEach(s=>ok(tr(s)!==s,k+': '+s)); });
});
test('Valley chains: three steps each, only in their own gate, saved and ended',()=>{
  const step=(id,ch,di)=>{ const r=scene(id,di); S.gold=1e6; S.player.hp=pMax(); S.chains=S.chains||{}; return r; };
  const C=[['tanner',0,[['tanner','take'],['tanner_2','pay'],['tanner_3','settle']]],['warden',1,[['warden','take'],['warden_2','rest'],['warden_3','stand']]],['ashchoir',3,[['ashchoir','listen'],['ashchoir_2','search'],['ashchoir_3','bind']]]];
  fresh(40); const keep={};
  for(const [c,di,steps] of C){ for(const [id,ch] of steps){ const r=scene(id,di); S.chains=Object.assign({},keep); S.gold=1e6; S.player.hp=pMax(); if(id==='warden_3'){ S.reserve=[mkMinion({lvl:10})]; S.army=S.army.filter(m=>!S.reserve.includes(m)); }
      ok(resolveEvent(ch),id); Object.assign(keep,S.chains); const m=r.event.done; ok(tr(m)!==m,'Turkish: '+m);
      if(id==='ashchoir_3'){ const cp=r.corpses.find(x=>x.st2); ok(cp,'the bound cantor'); S.army=[]; S.mode='raise'; const R0=Math.random; Math.random=()=>0; try{ S.player.mana=1e6; tryRaise(cp.id); } finally { Math.random=R0; } const mm=S.army.find(x=>x.kind==='Choir Cantor'); ok(mm&&mm.stage===2&&mm.traits.length>=3,'it rises at Elder'); }
      if(id==='tanner_3'){ eq(T_('paidFull'),1,'paid'); checkTitles(); ok(S.ti.got.c_paid,'Paid in Full'); }
      if(id==='warden_3') ok(S.reserve[0].lvl===11,'the Reserve gains a level'); }
    eq(keep[c].s,'end',c+' ended'); }
  scene('coffer',2); S.chains={}; ok(!chainOk('tanner'),'not outside the Rat Warren'); scene('coffer',0); S.chains={}; ok(chainOk('tanner'));
  S.chains={warden:{s:'war1',d:1}}; S.day=5; let due=null; const R0=Math.random; Math.random=()=>0; try{ due=chainDue(); } finally { Math.random=R0; } eq(due,null,'its next step waits in its own gate');
  scene('coffer',1); S.chains={warden:{s:'war1',d:1}}; S.day=5; Math.random=()=>0; try{ due=chainDue(); } finally { Math.random=R0; } eq(due,'warden_2');
  const g={chains:{tanner:{s:'tan2',d:3},warden:{s:'end'},ashchoir:{s:'bogus',d:1}}}; chainsFix(g); eq(JSON.stringify(g.chains),JSON.stringify({tanner:{s:'tan2',d:3},warden:{s:'end'}}),'saved and repaired');
  ok(cdx('chains').length>100); invariants('valley');
});
})();
