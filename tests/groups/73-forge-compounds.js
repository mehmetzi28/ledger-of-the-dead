// Tempering (temper, temperTo, temperCost in src/game-phases-town.js) and fusion compounds (COMPOUNDS in src/game-skills-market.js,
// fuseTraits in src/game-phases-town.js, their hooks in game-runs.js and game-gate-rules.js). Helpers and the runner live in tests/game-tests.js.
(function(){
const {test,ok,eq,fresh,setLvl,foe,arena,mkMinion,give,renderAll,invariants,cdx}=window.LOTD_T;
const uqId=()=>Object.values(ITEM).find(d=>d.uq).id;
const bare=(...t)=>({traits:t});

test('Forge: tempering moves a line a quarter of the way to its best roll, for gold that grows with each temper',()=>{
  fresh(); setLvl(6); const it=give('3-wa'), d=ITEM['3-wa'], mx=rollMax(it,'hp');
  eq(mx,Math.max(1,Math.round(ROLL_KEYS.hp*TM[d.set])),'max is ROLL_KEYS x TM'); it.ro=[['hp',2],['atk',rollMax(it,'atk')]];
  eq(temperTo(it,0),Math.min(mx,2+Math.max(1,Math.ceil((mx-2)*.25)))); eq(temperTo(it,1),null,'a line at its best cannot be tempered');
  const cost=n=>Math.round(TEMPER_GOLD*(d.tier+1)*(1+.5*d.set)*Math.pow(TEMPER_GROW,n)); eq(temperCost(it),cost(0));
  S.gold=0; ok(!temper(it.u,0),'no gold'); S.gold=1e6; const to=temperTo(it,0); ok(temper(it.u,0)); eq(it.ro[0][1],to); eq(it.tp,1); eq(S.gold,1e6-cost(0));
  eq(temperCost(it),cost(1),'x TEMPER_GROW per temper of this piece'); ok(!temper(it.u,1)); ok(!temper(it.u,7),'no such line');
  let n=0; while(temperTo(it,0)!=null&&n<50){ ok(temper(it.u,0)); n++; } eq(it.ro[0][1],mx,'never past its best'); eq(it.tp,1+n);
  it.ro=[['hp',mx-1]]; eq(temperTo(it,0),mx,'at least +1'); invariants('tempered');
});
test('Forge: tempering needs the workshop and town, refuses uniques, and its count survives re-rolls and saves',()=>{
  fresh(); setLvl(1); S.dust=0; const it=give('3-wa'); it.ro=[['hp',2]]; S.gold=1e6;
  ok(!workOpen()); ok(!temper(it.u,0),'no workshop'); setLvl(6); ok(temper(it.u,0)); S.dust=100; ok(enchant(it.u,0)); eq(it.tp,1,'a dust re-roll keeps the count');
  const uq=give(uqId()); uq.ro=[['hp',1]]; eq(temperTo(uq,0),null); ok(!temper(uq.u,0),'uniques cannot be tempered');
  arena([foe()]); ok(!temper(it.u,0),'not in battle'); flee();
  const bad=give('3-wa'); bad.ro=[['hp',2]]; bad.tp='x'; uq.tp=3;
  const nm=normalizeSave(JSON.parse(JSON.stringify(S))), f=u=>nm.inv.find(x=>x.u===u);
  eq(f(it.u).tp,1,'kept'); ok(!('tp' in f(bad.u)),'junk dropped'); ok(!('tp' in f(uq.u)),'never on a unique');
});
test('Forge: the Temper button sits with the enchant choices and reads in Turkish',()=>{
  fresh(); setLvl(6); S.gold=1e6; const it=give('3-wa'); it.ro=[['hp',2]]; const mx=rollMax(it,'hp'), to=temperTo(it,0); ui.tab='gear'; ACTIONS.ench(String(it.u));
  const h=renderAll('temper'); ok(h.includes('data-a="temper" data-k="'+it.u+'|0"')); ok(h.includes('Temper: 2 &rarr; '+to+' (max '+mx+')'),'shows from, to and max');
  ACTIONS.temper(it.u+'|0'); eq(it.tp,1); ok(ui.msg&&/Tempered/.test(ui.msg.m));
  eq(trText('Temper: 12 → 14 (max 16)'),'Tavla: 12 → 14 (en çok 16)'); ok(trText('Tempered a line on Bone Blade.').includes('tavlandı'));
});

test('Compounds: every recipe forms in the Flesh Pit and counts as both halves',()=>{
  for(const [c,p,q] of COMPOUNDS){ fresh(); setLvl(40); S.gold=1e7; const a=mkMinion({role:'striker',lvl:20,traits:[p]}), b=mkMinion({role:'striker',lvl:10,traits:[q]});
    const k=fuse(a.uid,b.uid); eq(k.traits.join(),c,c); ok(hasTrait(k,p)&&hasTrait(k,q)&&hasTrait(k,c),c+' counts as '+p+' and '+q); ok(compoundFound(c),c+' found'); ok(TRAITS[c].name&&TRAITS[c].desc&&TRAITS[c].story); }
  eq(COMPOUNDS.length,12);
});
test('Compounds: recipes resolve in order, each trait feeds one, compounds never feed another, and the cap comes after',()=>{
  eq(fuseTraits(bare('unmarred','crushing'),bare('vicious')).tr.join(),'pristine,crushing','Pristine before Bonebreaker');
  eq(fuseTraits(bare('rimeborn','crushing'),bare('cinderborn')).tr.join(),'shatterwrought,crushing','Shatterwrought before Glaciermaul');
  eq(fuseTraits(bare('stitched','gravebound'),bare('thick')).tr.join(),'patchwork,gravebound','Patchwork before Deathless Husk');
  eq(fuseTraits(bare('venom','necrotic'),bare('hexing')).tr.join(),'plaguebearer,hexing','Plaguebearer takes the necrotic before Witchrot');
  eq(fuseTraits(bare('plaguebearer'),bare('hexing')).tr.join(),'plaguebearer,hexing','a compound is never an ingredient');
  const r=fuseTraits(bare('thick','stalwart','venom'),bare('necrotic','warded')); eq(r.tr.join(),'thick,ironbound,plaguebearer','merged first, so all fit under the cap'); eq(r.made.join(),'ironbound,plaguebearer');
  eq(fuseTraits(bare('plaguebearer'),bare('necrotic','venom')).tr.join(),'plaguebearer,necrotic,venom','never two of one compound');
  eq(fuseTraits(bare('thick','vicious','leech'),bare('stalwart')).tr.join(),'thick,vicious,leech','no recipe: the old cap');
  const e={traits:['commander','venom'],elite:true}; eq(fuseTraits(e,bare('necrotic')).tr.join(),'commander,plaguebearer','Commander never takes part');
});
test('Compounds: never rolled, never from a death or an affix, kept out of TRAIT_IDS, and kept by a save',()=>{
  const ids=COMPOUNDS.map(x=>x[0]);
  for(const c of ids){ ok(!TRAIT_IDS.includes(c)&&!AFFIX_TRAITS.includes(c)&&!DEATH_TRAITS.includes(c),c); ok(!Object.values(CORPSE_CONDS).some(k=>k.trait===c)); ok(!Object.values(AFFIX).some(a=>a.trait===c)); }
  for(let i=0;i<300;i++) ok(!ids.includes(rollTrait([])));
  fresh(); const m=mkMinion({traits:['bloodfiend']}); S.ti=S.ti||{}; S.ti.compounds=['bloodfiend','nonsense','bloodfiend'];
  const nm=normalizeSave(JSON.parse(JSON.stringify(S))); eq(nm.army.find(x=>x.uid===m.uid).traits.join(),'bloodfiend'); eq(nm.ti.compounds.join(),'bloodfiend','repaired');
});
test('Compounds: Plaguebearer spreads, Patchwork rises twice, Deathless Husk at half HP, Bonebreaker, Glaciermaul and the immunities',()=>{
  fresh(); const a=foe(), b=foe(); arena([a,b]); const pl=mkMinion({traits:['plaguebearer']});
  a.dots={poison:{d:7,t:3},blight:{d:4,t:2}}; a.hp=0; ok(/plague jumps/.test(minionOnHit(pl,a))); ok(b.dots&&b.dots.poison&&b.dots.poison.d===7&&b.dots.blight&&b.dots.blight.d===4,'poison and blight jump');
  fresh(); arena([foe({hp:1e6})]); const pw=mkMinion({traits:['patchwork']});
  hurtAlly(pw,1e9); ok(pw.hp>0,'first rise'); hurtAlly(pw,1e9); ok(pw.hp>0,'second rise'); hurtAlly(pw,1e9); eq(pw.hp,0,'only twice'); roomStart([]); ok(!pw.sx);
  const dh=mkMinion({traits:['deathlesshusk']}); hurtAlly(dh,1e9); eq(dh.hp,Math.round(dh.maxHp*.5),'rises at 50%'); ok(hasTrait(dh,'gravebound'),'never shatters');
  fresh(); const e=foe(); arena([e]); const bb=mkMinion({traits:['bonebreaker']}), plain=mkMinion({});
  eq(breakK(bb,e),1); addSt(e,'sundered',2); eq(breakK(bb,e),1.25,'+25% on Sundered'); eq(breakK(plain,e),1);
  const f=foe(); arena([f]); const gm=mkMinion({traits:['glaciermaul']}); addSt(f,'chilled',2); minionOnHit(gm,f); ok(hasSt(f,'sundered'),'a Chilled foe is always Sundered');
  const g=foe(); arena([g]); const sw=mkMinion({traits:['shatterwrought']}); minionOnHit(sw,g); ok(hasSt(g,'chilled')&&!(g.dots&&g.dots.burn),'Chill first'); minionOnHit(sw,g); ok(g.dots&&g.dots.burn,'then Burn');
  ok(!addSt(sw,'chilled',2)); addDot(sw,'burn',10,2); ok(!(sw.dots&&sw.dots.burn),'Shatterwrought is immune to both');
  const ib=mkMinion({traits:['ironbound']}); ok(!addSt(ib,'hexed',2)&&!addSt(ib,'chilled',2)); const pr=mkMinion({traits:['pristine']}); ok(!addSt(pr,'sundered',2)); ok(addSt(plain,'sundered',2));
  const h=foe(); arena([h]); const wr=mkMinion({traits:['witchrot']}); h.dots={blight:{d:5,t:2}}; minionOnHit(wr,h); ok(h.dots&&h.dots.blight&&hasSt(h,'hexed'),'Witchrot: blighted, so hexed too');
});
test('Compounds: discovery, the Flesh Pit preview and the Codex, in Turkish too',()=>{
  fresh(); setLvl(20); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1}}); S.gold=1e5; delete S.ti.compounds;
  const a=mkMinion({role:'mender',lvl:9,traits:['venom','thick']}), b=mkMinion({role:'mender',lvl:8,traits:['necrotic']}); ui.tab='town'; ACTIONS.fusepick(String(a.uid));
  let h=renderAll('preview'); ok(h.includes('Becomes: Thick-boned, ???')||h.includes('Becomes: ???, Thick-boned'),'traits shown, the unfound one hidden'); ok(h.includes('Something new will form')); ok(!h.includes('Plaguebearer'));
  let c=cdx('fusion'); ok(c.includes('Compounds')&&!c.includes('Plaguebearer')&&(c.match(/\?\?\?/g)||[]).length>=12,'all 12 listed as ???');
  S.ti.compounds=['plaguebearer']; ui.tab='town'; ACTIONS.fusepick(String(a.uid)); ACTIONS.fusepick(String(a.uid)); h=renderAll('found'); ok(h.includes('Plaguebearer')&&!h.includes('Something new will form'),'named once found');
  delete S.ti.compounds; ACTIONS.fuse(String(b.uid)); ACTIONS.fuse(String(b.uid)); ok(compoundFound('plaguebearer')); ok(ui.msg&&/Something new has formed/.test(ui.msg.m));
  c=cdx('fusion'); ok(c.includes('Plaguebearer')&&c.includes('Found'),'found in the Codex');
  S.ti.compounds=COMPOUNDS.map(x=>x[0]);
  const nodes=codexSection('fusion').replace(/<[^>]+>/g,'\u0001').split('\u0001').map(s=>s.replace(/&middot;/g,'·').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/gi,' ')).filter(s=>/[A-Za-z]{2}/.test(s));
  for(const s of nodes) ok(trText(s)!==s,'Turkish for "'+s.trim().slice(0,80)+'"');
  for(const [k] of COMPOUNDS){ const t=TRAITS[k].desc+' '+TRAITS[k].story; ok(trText(t)!==t&&!/[A-Z][a-z]+ and [A-Z]/.test(trText(t)),'tooltip in Turkish: '+k); ok(trText(TRAITS[k].name)!==TRAITS[k].name,'name '+k); }
  for(const s of ['Becomes','Something new will form','Something new has formed in the pit','Temper','Compounds']) ok(TR_DICT.has(s),s);
});

})();
