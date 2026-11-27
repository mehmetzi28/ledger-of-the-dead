// Damage types (src/game-data.js DAMAGE TYPES): every hit carries a type; where foes stand sets their weaknesses and resistances.
(function(){
const {test,ok,eq,near,fix,H,fresh,setLvl,foe,arena,mkMinion,renderAll,cdx}=window.LOTD_T;
const armorId=()=>Object.keys(ITEM).find(id=>ITEM[id].slot==='armor'&&!ITEM[id].uq&&ITEM[id].tier>=3);
const weaponId=()=>Object.keys(ITEM).find(id=>ITEM[id].slot==='weapon'&&!ITEM[id].uq&&ITEM[id].tier>=3);

test('Damage types: five types; every gate, the Tower, the Rift and sieges have a profile; the Rift rolls one weakness and one resistance per depth',()=>{
  fresh(); eq(DT_IDS.join(),'phys,shad,frost,fire,rot'); eq(GATE_RES.length,DUNGEONS.length); eq(GATE_HITS.length,DUNGEONS.length);
  GATE_RES.forEach((p,i)=>{ ok(DT_IDS.some(t=>p[t]<0),'gate '+i+' has a weakness'); ok(DT_IDS.some(t=>p[t]>0),'gate '+i+' has a resistance'); ok(Object.keys(p).every(t=>DTYPE[t]),'known types'); ok(DTYPE[GATE_HITS[i]]); });
  eq(placeRes({di:2}),GATE_RES[2]); eq(placeRes({tw:7,di:5}),TOWER_RES); eq(placeRes({siege:1,di:3}),SIEGE_RES); eq(JSON.stringify(placeRes(null)),'{}','outside a run');
  for(let n=1;n<=60;n++){ const r=riftRes(n), w=DT_IDS.filter(t=>r[t]<0), s=DT_IDS.filter(t=>r[t]>0); eq(w.length,1,'one weakness at depth '+n); eq(s.length,1,'one resistance at depth '+n); ok(w[0]!==s[0]); eq(JSON.stringify(riftRes(n)),JSON.stringify(r),'the same every time'); eq(JSON.stringify(placeRes({rift:n,di:5})),JSON.stringify(r)); }
  ok(new Set([1,2,3,4,5,6,7,8,9,10].map(n=>JSON.stringify(riftRes(n)))).size>=4,'depths differ');
});
test('Damage types: a resistance or weakness scales a hit once, after armor and before a shield; untyped hits are physical',()=>{
  fresh(10); const a=foe({hp:1e6}), b=foe({hp:1e6}), c=foe({hp:1e6,shield:100}); arena([a,b,c],2);   /* the Ashen Barrow: weak to frost, resists fire strongly */
  hurtFoe(a,1000,'frost'); eq(1e6-a.hp,1250,'weak: +25%'); hurtFoe(b,1000,'fire'); eq(1e6-b.hp,500,'strong resistance: -50%');
  const h=a.hp; hurtFoe(a,1000); eq(h-a.hp,1000,'no type is physical, and the Barrow has no physical profile'); eq(a.lt,'phys');
  hurtFoe(a,1000,'bogus'); eq(a.lt,'phys','an unknown type is physical');
  hurtFoe(c,200,'fire'); eq(c.shield,0,'the shield soaks what is left after the resistance'); eq(1e6-c.hp,0); hurtFoe(c,1000,'frost'); eq(1e6-c.hp,1250);
  a.res={frost:.25}; const h2=a.hp; hurtFoe(a,1000,'frost'); eq(h2-a.hp,1000,'a foe\'s own resistance adds to the place\'s');
  a.res={fire:.9}; const h3=a.hp; hurtFoe(a,1000,'fire'); eq(h3-a.hp,Math.round(1000*(1-FOE_RES_MAX)),'capped at '+FOE_RES_MAX);
});
test('Damage types: every source of your damage carries its type',()=>{
  const lt=(setup,key)=>{ fresh(30); const t=foe({hp:1e8,maxHp:1e8}); arena([t],4); fix(.5); S.player.mana=500; if(setup) setup(t); act(key); return t.lt; };
  eq(lt(null,'strike'),'phys'); eq(lt(null,'siphon'),'shad');
  eq(lt(()=>{ S.player.skills.spear=1; },'sk:spear'),'phys'); eq(lt(()=>{ S.player.skills.chill=1; },'sk:chill'),'frost'); eq(lt(()=>{ S.player.skills.reap=1; },'sk:reap'),'shad');
  eq(lt(()=>{ S.player.skills.blast=1; S.run.corpses=[{id:'cx',name:'Tunnel Rat',base:'Tunnel Rat',role:'striker',rankI:0,lvl:1,tried:false}]; },'sk:blast'),'rot');
  fresh(30); const t=foe({hp:1e8,maxHp:1e8}); arena([t],4); fix(.5);
  for(const [k,ty] of [['poison','rot'],['blight','rot'],['burn','fire'],['bleed','phys']]){ t.dots={}; t.dots[k]={d:10,t:1}; tickDots(); eq(t.lt,ty,k+' ticks are '+ty); }
  const m=mkMinion({lvl:20}); const typeOf=tr=>{ m.traits=tr; return minionType(m); };
  eq(typeOf([]),'phys'); eq(typeOf(['rimeborn']),'frost'); eq(typeOf(['glaciermaul']),'frost'); eq(typeOf(['cinderborn']),'fire'); eq(typeOf(['pyreheart']),'fire');
  eq(typeOf(['venom']),'rot'); eq(typeOf(['necrotic']),'rot'); eq(typeOf(['plaguebearer']),'rot'); eq(typeOf(['witchrot']),'rot'); eq(typeOf(['bloodfiend']),'shad');
  m.traits=['shatterwrought']; delete m.swt; const seen=[]; for(let i=0;i<4;i++){ seen.push(minionType(m)); minionOnHit(m,t); } eq(seen.join(),'frost,fire,frost,fire','Shatterwrought alternates with its chill and burn');
  m.traits=['rimeborn']; S.army=[m]; t.dots={}; delete t.dots; act('strike'); eq(t.lt,'frost','a minion\'s hit carries its type');
});
test('Damage types: gear lines resist one type (armor only) or add damage of one type (weapon and relic only)',()=>{
  fresh(30); const types=['fres','frres','rres','sres'], dmg=['fdmg','frdmg','rdmg','sdmg'];
  ok(types.concat(dmg).every(k=>ROLL_KEYS[k]&&STATL[k]&&STATL[k][1]==='%'),'roll keys with labels');
  for(let i=0;i<300;i++){ const a=rollItem(armorId())||[], w=rollItem(weaponId())||[]; ok(!a.some(r=>dmg.includes(r[0])),'no damage line on armor'); ok(!w.some(r=>types.includes(r[0])),'no resistance line on a weapon'); }
  eq(rollKeys('armor').filter(k=>dmg.includes(k)).length,0); eq(rollKeys('relic').filter(k=>types.includes(k)).length,0); ok(rollKeys('relic').includes('sdmg')&&rollKeys('armor').includes('fres'));
  ok(Math.round(ROLL_KEYS.fres*TM[5])<=21,'a best roll stays near 20%');
  const it={u:++S.uid,id:armorId()}; S.inv.push(it); for(let i=0;i<60;i++){ const l=rollLine(it,[]); ok(!dmg.includes(l[0]),'enchanting armor never adds a damage line'); }
});
test('Damage types: your resistance softens typed hits, burns and wounds, up to its cap; physical has none; typed minions resist their element',()=>{
  fresh(30); arena([foe({hp:1e6})],2); const P=S.player; S.equip.armor={u:++S.uid,id:armorId(),ro:[['fres',20]]};
  eq(allyRes(P,'fire'),.2); eq(allyRes(P,'phys'),0); eq(allyRes(P,'frost'),0);
  P.hp=pMax(); P.shield=0; P.stats.constitution=400; P.hp=pMax(); const h=P.hp; hurtAlly(P,1000,'fire'); eq(h-P.hp,Math.round(allyDr(P,1000)*.8),'a fire hit is 20% softer');
  P.hp=pMax(); const h2=P.hp; hurtAlly(P,1000,'phys'); eq(h2-P.hp,allyDr(P,1000),'physical is not resisted');
  P.hp=pMax(); P.dots={burn:{d:100,t:1}}; const h3=P.hp; tickDots(); eq(h3-P.hp,80,'a burn tick is softened too');
  S.equip.armor.ro=[['fres',90]]; eq(allyRes(P,'fire'),RES_CAP,'capped');
  const m=mkMinion({lvl:10,traits:['cinderborn']}); eq(allyRes(m,'fire'),TRAIT_RES.cinderborn[1]); eq(allyRes(m,'frost'),0); m.traits=['shatterwrought']; eq(allyRes(m,'frost'),.25,'compounds count as both halves');
});
test('Damage types: strikers hit with their place\'s type, vanguards and menders physical; Frost-touched and Burning elites',()=>{
  fresh(30); const s=foe({role:'striker'}), v=foe({role:'vanguard'}), md=foe({role:'mender'}); arena([s,v,md],2);
  eq(foeHitType(s),'fire'); eq(foeHitType(v),'phys'); eq(foeHitType(md),'phys'); S.run.di=1; eq(foeHitType(s),'frost');
  S.run.tw=5; eq(foeHitType(s),TOWER_HITS); delete S.run.tw; S.run.siege=1; eq(foeHitType(s),SIEGE_HITS); delete S.run.siege;
  v.aff=['frosty']; eq(foeHitType(v),'frost'); v.aff=['burning']; eq(foeHitType(v),'fire');
  ok(AFFIX.frosty&&AFFIX.burning&&AFFIX_IDS.includes('frosty')&&AFFIX_IDS.includes('burning')); eq(AFFIX.frosty.trait,'rimeborn'); eq(AFFIX.burning.trait,'cinderborn');
  const P=S.player; fix(0); v.atk=50; const tx=foeOnHit(v,P); ok(P.dots&&P.dots.burn,'Burning burns'); ok(/burning/.test(tx));
  P.stats.constitution=400; delete P.dots; v.aff=['frosty']; foeOnHit(v,P); ok(hasSt(P,'chilled'),'Frost-touched chills 1 time in 3'); P.hp=pMax(); P.shield=0; const h=P.hp; hurtAlly(P,1000,'phys'); const chilledHit=h-P.hp; delete P.st; P.hp=pMax(); const h2=P.hp; hurtAlly(P,1000,'phys'); ok(chilledHit>h2-P.hp,'a Chilled ally takes more');
});
test('Damage types: Iron Rain toughens foes against physical, Soul Storm and damage lines sharpen your types',()=>{
  fresh(30); const a=foe({hp:1e6}); arena([a],0);
  S.omen={day:S.day,id:'ironrain'}; near(foeRes(a,'phys'),IRON_PHYS,1e-9); S.omen={day:S.day,id:null}; eq(foeRes(a,'phys'),0);
  eq(typeDmg('shad'),1); S.omen={day:S.day,id:'soulstorm'}; near(typeDmg('shad'),STORM_SHAD,1e-9); eq(typeDmg('frost'),1); S.omen={day:S.day,id:null};
  S.equip.weapon={u:++S.uid,id:weaponId(),ro:[['frdmg',20]]}; near(typeDmg('frost'),1.2,1e-9); eq(typeDmg('phys'),1);
  const h=a.hp; hurtFoe(a,1000,'frost'); eq(h-a.hp,1200,'a frost damage line: +20% for every frost hit of yours');
  ok(/resist 15% of physical/.test(OMENS.ironrain.desc)&&/shadow damage is 10% stronger/.test(OMENS.soulstorm.desc));
});
test('Damage types: the gate card, the Tower, the Rift and the battle show the profile; the Codex page; Turkish',()=>{
  fresh(30); ui.tab='gates'; const g=renderAll('gates'); ok(/class="dt-tag"/.test(g)&&/Weak: <b class="dt dt-fire"><svg class="dtg"[^]*?<\/svg>Fire<\/b>/.test(g),'gate cards');
  arena([foe({hp:1e6})],1); const b=renderAll('battle'); ok(/Weak: <b class="dt dt-frost"><svg[^]*?<\/svg>Frost<\/b>/.test(b)&&/Resists: <b class="dt dt-fire"><svg[^]*?<\/svg>Fire<\/b>/.test(b)&&/Strikers deal: <b class="dt dt-frost">/.test(b),'battle header');
  const t=resTag(riftRes(4),GATE_HITS[5]); ok(/Weak:/.test(t)&&/Resists:/.test(t));
  ok(resTag(TOWER_RES,TOWER_HITS).includes('Resists strongly'),'the Tower resists fire strongly'); eq(resTag({},'phys'),'');
  ok(CODEX.some(c=>c[0]==='types')); const c=codexSection('types'); DUNGEONS.forEach(D=>ok(c.includes(D.name),D.name)); DT_IDS.forEach(t=>ok(c.includes(DTYPE[t].name)));
  ['Weak','Resists','Resists strongly','Strikers deal','Damage types','Frost-touched'].concat(DT_IDS.map(t=>DTYPE[t].name),Object.keys(DTYPE).map(t=>DTYPE[t].res).filter(Boolean).map(k=>STATL[k][0])).forEach(s=>ok(trText(s)!==s,'Turkish: '+s));
  ok(trText('Weak to Frost (+25%). Resists Fire (-50%). Strikers deal Fire')!=='Weak to Frost (+25%). Resists Fire (-50%). Strikers deal Fire');
  ok(!/Frost|Fire/.test(trText('Weak to Frost (+25%). Resists Fire (-50%). Strikers deal Fire')),'every piece translated');
});

})();
