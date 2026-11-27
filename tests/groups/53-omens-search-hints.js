// Omen days, Codex search, secret-master hints, new-record flashes and the newest tips.
(function(){
const {test,ok,eq,near,seed,seq,fix,setLvl,foe,arena,renderAll,wonRoom,cdx}=window.LOTD_T;
test('Omens: none before a first clear; a quarter of dawns after; each one does what it says',()=>{
  S.omen=undefined; delete S.omen; S.ti=S.ti||{}; S.ti.clr={}; fix(0); eq(omen(),null,'no omens before a clear');
  S.omen=undefined; delete S.omen; S.ti.clr={0:1}; fix(.9); eq(omen(),null); S.day++; fix(.1); ok(OMENS[omen()],'an omen'); const id=omen(); fix(.99); eq(omen(),id,'it lasts the day');
  S.omen={day:S.day,id:'bloodmoon'}; eq(eliteChance(),.2); S.omen.id=null; eq(eliteChance(),.1);
  setLvl(20); const c={rankI:0,lvl:1,boss:false,elite:false}; S.player.stats.will=0; const r0=raiseChance(c); S.omen.id='paletide'; eq(raiseChance(c),Math.min(RAISE_MAX,r0+OMEN_RAISE));
  S.omen.id=null; const b=foe({boss:true,lvl:10}), x0=killXp(b); S.omen.id='ashfall'; ok(Math.abs(killXp(b)-x0*OMEN_BOSS_XP)<=1,'bosses pay more');
  eq(normalizeSave({v:2,player:{lvl:5},omen:{day:3,id:'bogus'}}).omen,undefined); eq(normalizeSave({v:2,player:{lvl:5},omen:{day:3,id:'ashfall'}}).omen.id,'ashfall');
});
test('Omens: shown above the gates and in the Codex',()=>{
  S.mode='town'; S.ti=S.ti||{}; S.ti.clr={0:1}; S.omen={day:S.day,id:'paletide'}; ui.tab='gates'; ok(/omen-line[\s\S]*Pale Tide/.test(renderAll('gates omen')));
  ui.tab='codex'; ui.cx='omens'; const h=renderAll('cx omens'); ok(h.includes('Blood Moon')&&h.includes('Ashfall')&&/Today/.test(h));
  S.omen.id=null; ui.tab='gates'; ok(!renderAll('no omen').includes('omen-line'));
});
test('Codex search: finds rows and paragraphs on every page, groups them, and clears',()=>{
  S.mode='town'; ui.tab='codex'; ui.cx='basics'; ui.cxq='lifedrain'; let h=renderAll('search');
  ok(/match/.test(h)&&h.includes('Unique powers')&&h.includes('Lifedrain'),'finds the unique power'); ok(!h.includes('cx-nav'),'pages hidden while searching');
  ui.cxq='zzqx'; h=renderAll('none'); ok(/Nothing in the Codex mentions/.test(h)); ui.cxq='a'; ok(renderAll('short').includes('cx-nav'),'one letter is not a search');
  ACTIONS.cxclear(); eq(ui.cxq,''); ui.cxq='<b>"'; ok(!renderAll('escape').includes('value="<b>'),'the box escapes what you type'); ui.cxq='';
});
test('Secret hints: after ten clears of a gate a torn page hints at its master, never naming it, and stops once met',()=>{
  setLvl(30); S.ti=S.ti||{}; S.ti.clrN0=SECRET_HINT-1; S.kills={}; S.watches=3; startRun(0); S.run.room=3; S.run.enemies=[foe({hp:0,dead:true})]; S.notices=[]; roomWon();
  ok(S.notices.some(n=>n.m.includes(SECRET[0].hint)),'torn page'); ok(!S.notices.some(n=>n.m.includes(SECRET[0].name)),'no name'); returnTown();
  S.mode='town'; ui.tab='codex'; ui.cx='gates'; ok(renderAll('hint').includes(SECRET[0].hint)); S.kills[SECRET[0].name]=1; S.notices=[]; ok(!renderAll('met').includes(SECRET[0].hint),'gone once met');
  SECRET.forEach(B=>{ ok(B.hint&&!B.hint.includes(B.name.replace(/^The /,'')),B.name+' hint keeps the secret'); });
});
test('Records: beating a record flashes once a run; a first record stays quiet',()=>{
  setLvl(30); S.rec={}; MOMENTS.length=0; const t=foe({hp:1e7}); arena([t]); hurtFoe(t,100); eq(MOMENTS.length,0,'first record is quiet');
  hurtFoe(t,200); ok(MOMENTS.some(m=>/New record: biggest hit, 200/.test(m.t))); MOMENTS.length=0; hurtFoe(t,300); eq(MOMENTS.length,0,'once per run'); eq(S.rec.hit.v,300); flee();
  S.rec.fast={0:{t:30,day:1}}; MOMENTS.length=0; S.watches=3; startRun(0); S.run.tt=12; S.run.cleared=true; returnTown(); ok(MOMENTS.some(m=>/Rat Warren in 12 turns/.test(m.t)));
});
test('Tips: full devotion, Records, Nightmare and omens',()=>{
  const tip=id=>TIPS.find(t=>t.id===id); S.mode='town';
  ok(tip('bless')&&tip('records')&&tip('nightmare')&&tip('omen'));
  S.runs=9; ok(!tip('records').when()); S.runs=10; ok(tip('records').when());
  S.ti=S.ti||{}; S.ti.clr={0:1}; S.heatMax={}; ok(!tip('nightmare').when()); S.heatMax={0:2}; ok(tip('nightmare').when());
  S.omen={day:S.day,id:null}; ok(!tip('omen').when()); S.omen.id='ashfall'; ok(tip('omen').when());
  setLvl(30); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); S.gold=1e6; delete S.faith; ok(!tip('bless').when()); swear('dis'); ok(!tip('bless').when()); S.faith.dev=DEV_RANKS*DEV_STEP; ok(tip('bless').when());
});
test('Omens: seven at dawn and three the gods call, the old three kept; new ids load, bogus ones are dropped',()=>{
  ['bloodmoon','paletide','ashfall','eclipse','boneharvest','ironrain','soulstorm'].forEach(k=>ok(OMENS[k]&&OMENS[k].name&&OMENS[k].desc,k)); eq(Object.keys(OMENS).length,13); eq(OMEN_NAT.length,10,'three come only by a call');
  eq(normalizeSave({v:2,player:{lvl:5},omen:{day:3,id:'soulstorm'}}).omen.id,'soulstorm'); eq(normalizeSave({v:2,player:{lvl:5},omen:{day:3,id:'paletide'}}).omen.id,'paletide');
  S.ti=S.ti||{}; S.ti.clr={0:1}; const seen=new Set(); for(let i=0;i<200;i++){ S.day++; seed(i); const o=omen(); if(o) seen.add(o); } eq(seen.size,OMEN_NAT.length,'every dawn omen comes up'); ok(!['longnight','rotbloom','choirnight'].some(k=>seen.has(k)),'never a god\'s own');
  S.omen={day:S.day,id:null}; const h=cdx('omens'); Object.values(OMENS).forEach(O=>{ ok(h.includes(O.name),O.name); ok(trText(O.name)!==O.name&&trText(O.desc)!==O.desc,'Turkish '+O.name); });
});
test('Omens: Black Eclipse feeds Siphon and shadow, blunts foe crits and makes them miss',()=>{
  const t=foe({hp:1e6}); arena([t]); const P=S.player; P.mana=99; fix(.5); act('siphon'); const d0=1e6-t.hp; S.omen.id='eclipse'; t.hp=1e6; P.mana=99; act('siphon'); near(1e6-t.hp,d0*ECLIPSE_SHADOW,2);
  eq(foeCrit(),.25-ECLIPSE_CRIT); eq(shadowK(),ECLIPSE_SHADOW);
  const e=foe({atk:50,hp:1e6}); arena([e]); P.hp=pMax(); seq([.5,.5,.5,.05],.5); act('strike'); eq(P.hp,pMax(),'the blow misses'); ok(S.run.log.some(l=>/misses you in the dark/.test(l.m)));
  S.omen.id=null; eq(foeCrit(),.25); eq(shadowK(),1);
});
test('Omens: Bone Harvest pays more trophies, elites one more, and bone dust',()=>{
  arena([foe()]); const r=S.run; S.omen.id='boneharvest'; r.troph={}; r.bdust=0; fix(.7); killLoot(foe({lvl:3}),r); eq(r.troph['Tunnel Rat'],1,'a trophy at 70%'); eq(r.bdust||0,0,'no dust at 70%');
  fix(.1); killLoot(foe({elite:true,lvl:3}),r); eq(r.troph['Tunnel Rat'],1+3,'an elite drops one more'); eq(r.bdust,1);
  const d0=S.dust||0; r.events=[]; bankLoot(r); eq(S.dust,d0+1,'banked with the room'); eq(r.bdust,0); ok(r.events.some(x=>/Bone Harvest: \+1 bone dust/.test(x.m))); eq(trText('Bone Harvest: +1 bone dust.'),'Kemik Hasadı: +1 kemik tozu.');
  S.omen.id=null; r.troph={}; fix(.7); killLoot(foe({lvl:3}),r); eq(r.troph['Tunnel Rat'],undefined);
});
test('Omens: Iron Rain drops more gear with richer lines, and foes wear heavier armor',()=>{
  arena([foe()],1); const a0=foeArmor(); S.omen.id='ironrain'; near(1-foeArmor(),(1-a0)/IRON_ARMOR,1e-9); ok(foeArmor()<1);
  fix(0); const it=rollItem('1-wa'); eq(it.length,ROLL_LINES[2][0],'an uncommon rolls like a rare'); S.omen.id=null; eq(rollItem('1-wa').length,ROLL_LINES[1][0]);
  fix(.3); S.omen.id='ironrain'; eq(rollDrops(foe({lvl:3})).length,1,'a drop at 30%: only under the rain'); fix(.3); S.omen.id=null; eq(rollDrops(foe({lvl:3})).length,0);
});
test('Omens: Soul Storm starts each room with a Soul and more mana, and foes hit 25% harder',()=>{
  S.ti=S.ti||{}; S.ti.clr={0:1}; S.omen={day:S.day,id:'soulstorm'}; S.mod={day:S.day,gi:-1,id:null}; setLvl(5); S.watches=3; startRun(0); eq(S.run.souls,1);
  const e=foe({atk:100}); foeRise([e]); eq(e.atk,Math.round(100*STORM_ATK));
  const t=foe({hp:1e6}); arena([t]); const P=S.player; S.run.souls=0; P.mana=0; S.army=[]; fix(.5); let got=0; for(let i=0;i<5;i++){ const m0=P.mana; act('strike'); got+=P.mana-m0-3; } const base=1+G('regen')+sk('soulwell'); eq(got,Math.floor(base*5*(1+STORM_REGEN)+1e-9),'+20% regen, fractions carried');
  S.omen.id=null; flee();
});

})();
