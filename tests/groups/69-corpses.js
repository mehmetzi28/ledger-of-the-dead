// Corpse conditions: how a foe died marks its body (CORPSE_CONDS, deathCond, stitchUp in src/game-gate-rules.js; the killing-blow
// context KILL and the raise in src/game-runs.js; the death traits in src/game-skills-market.js; condHTML in src/ui-screens.js).
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,renderAll,cdx}=window.LOTD_T;
const body=()=>S.run.corpses[S.run.corpses.length-1];
const tickKill=(e,k)=>{ e.dots={[k]:{d:50,t:2}}; tickDots(); checkDeaths(); return body(); };

test('Corpses: each condition comes from its cause',()=>{
  fresh(); let a=foe({hp:5,stun:2}); arena([a]); fix(.5); act('strike'); eq(body().cd,'preserved','frozen at death');
  fresh(); setLvl(18); S.player.skills.reap=1; S.player.mana=100; a=foe({hp:5,maxHp:1e6}); arena([a]); act('sk:reap'); eq(body().cd,'clean','Reap');
  fresh(); a=foe({hp:1000,maxHp:1e6}); arena([a]); const m=mkMinion({role:'reaper'}); m.atk=1e5; S.run.execute=true; fix(.5); act('strike'); eq(body().cd,'clean','a reaper under Execute');
  fresh(); a=foe({hp:5,maxHp:1e6,dots:{blight:{d:1,t:3}}}); arena([a]); fix(.5); act('strike'); eq(body().cd,'rot','died Blighted');
  fresh(); a=foe({hp:10,maxHp:1e6}); arena([a]); eq(tickKill(a,'poison').cd,'tainted','a poison tick');
  fresh(); a=foe({hp:10,maxHp:1e6}); arena([a]); eq(tickKill(a,'burn').cd,'charred','a burn tick');
  fresh(); a=foe({hp:1,maxHp:1}); arena([a]); fix(.5); act('strike'); eq(body().cd,'mangled','the blow went past HP + max HP');
  fresh(); a=foe({hp:5,maxHp:1e6}); arena([a]); fix(.5); act('strike'); ok(!('cd' in body()),'a plain blow leaves no condition');
  fresh(); a=foe({hp:10,maxHp:1e6}); arena([a]); ok(!('cd' in tickKill(a,'bleed')),'a bleed tick is a plain death');
});
test('Corpses: first match wins (preserved, clean, rot, tainted, charred, mangled)',()=>{
  const kill=(o,k,d)=>{ fresh(); const e=foe(Object.assign({hp:10,maxHp:5},o)); arena([e]); KILL=k||null; hurtFoe(e,d||1000); KILL=null; return corpseOf(e).cd; };
  eq(kill({stun:1},'reap'),'preserved'); eq(kill({dots:{blight:{d:1,t:2}}},'reap'),'clean'); eq(kill({dots:{blight:{d:1,t:2}}},'poison'),'rot');
  eq(kill({},'poison'),'tainted','a poison kill past max HP is still Tainted'); eq(kill({},'burn'),'charred'); eq(kill({},null),'mangled');
  eq(kill({},null,15),undefined,'overkill of exactly max HP is not Mangled'); eq(kill({},'blight'),'rot','a blight tick on its last turn');
});
test('Corpses: the death trait replaces the random one; a boss rolls one more, an elite keeps its affix',()=>{
  for(const k of Object.keys(CORPSE_CONDS)){ fresh(); const c=corpse({cd:k}); raiseScene([c],10); fix(0); tryRaise(c.id); const m=S.army[S.army.length-1]; eq(String(m.traits),CORPSE_CONDS[k].trait,k); eq(m.cd,k); }
  fresh(); let c=corpse({cd:'charred',boss:true}); raiseScene([c],10); fix(0); tryRaise(c.id); let m=S.army[0]; eq(m.traits[0],'cinderborn'); ok(TRAIT_IDS.includes(m.traits[1]),'a boss rolls a second, common trait');
  fresh(); c=corpse({cd:'clean',elite:true,aff:['plague']}); raiseScene([c],10); fix(0); tryRaise(c.id); m=S.army[0]; eq(m.traits[0],'unmarred'); ok(m.traits.includes(AFFIX.plague.trait),'the elite keeps its affix trait');
  fresh(); c=corpse(); raiseScene([c],10); fix(0); tryRaise(c.id); m=S.army[0]; ok(TRAIT_IDS.includes(m.traits[0])&&!('cd' in m),'no condition: random as before');
  ok(DEATH_TRAITS.every(t=>TRAITS[t]&&!TRAIT_IDS.includes(t)),'death traits stay out of TRAIT_IDS (Menagerie)');
});
test('Corpses: the condition moves the raise chance before the clamp, and the raise screen shows it',()=>{
  fresh(); raiseScene([],10); const base=raiseChance(corpse());
  for(const k of Object.keys(CORPSE_CONDS)) eq(raiseChance(corpse({cd:k}))-base,CORPSE_CONDS[k].raise,k);
  eq(raiseChance(corpse({cd:'bogus'})),base,'an unknown key adds nothing');
  const c=corpse({cd:'preserved'}); raiseScene([c,corpse({cd:'mangled'})],10); S.run.lastXp=0; const h=renderAll('raise conditions');
  ok(h.includes('Preserved +15%')&&h.includes('Rises Rimeborn')&&h.includes('Mangled -8%')&&h.includes('Rises Stitched'),'chips on the raise screen');
  ok(h.includes('title="'+TRAITS.rimeborn.desc+'"'),'the trait tooltip');
  S.mode='town'; S.run=null; const x=cdx('raising'); ok(x.includes('How they died')&&x.includes('How it died')&&Object.keys(CORPSE_CONDS).every(k=>x.includes(CORPSE_CONDS[k].name)),'the Codex table');
});
test('Corpses: Rimeborn chills, Cinderborn burns and is immune, Unmarred is stronger',()=>{
  fresh(); const e=foe({hp:1e6}); arena([e]); const r=mkMinion({traits:['rimeborn']}), c=mkMinion({traits:['cinderborn']});
  fix(0); ok(minionOnHit(r,e).includes('chills it')&&hasSt(e,'chilled'),'Rimeborn chills');
  ok(minionOnHit(c,e).includes('burns it')&&e.dots.burn.d===Math.round(c.atk*CINDER_K),'Cinderborn burns, sized like venom');
  fix(.9); const e2=foe({hp:1e6}); minionOnHit(r,e2); minionOnHit(c,e2); ok(!hasSt(e2,'chilled')&&!e2.dots,'only 1 time in 3');
  addDot(c,'burn',50,2); ok(!c.dots,'immune to burns'); addDot(c,'poison',50,2); ok(c.dots.poison,'but not to poison');
  const p=mkMinion({}), u=mkMinion({traits:['unmarred']}); ok(Math.abs(u.maxHp-p.maxHp*1.15)<=1&&Math.abs(u.atk-p.atk*1.15)<=1,'Unmarred +15% HP and attack: '+u.maxHp+'/'+p.maxHp+' '+u.atk+'/'+p.atk);
});
test('Corpses: Stitched rises once per room at 25% HP, with 10% less max HP, and the card shows it',()=>{
  fresh(); const e=foe({hp:1e6}); arena([e]); const p=mkMinion({}), m=mkMinion({traits:['stitched'],cd:'mangled'});
  ok(Math.abs(m.maxHp-p.maxHp*.9)<=1,'-10% max HP');
  ok(renderAll('stitched ready').includes('Stitched &middot; ready'),'ready on the card');
  hurtAlly(m,1e6); eq(m.hp,Math.round(m.maxHp*STITCH_HP),'gets up again'); eq(m.sx,1);
  ok(renderAll('stitched spent').includes('Stitched &middot; spent'),'spent on the card');
  hurtAlly(m,1e6); eq(m.hp,0,'only once a room');
  roomStart([]); ok(!m.sx,'a new room'); m.hp=5; m.dots={bleed:{d:50,t:1}}; tickDots(); eq(m.hp,Math.round(m.maxHp*STITCH_HP),'a wound that downs it counts too');
  ok(traitTip(m,'stitched').endsWith(CORPSE_CONDS.mangled.story),'the tooltip tells how its body died'); ok(!traitTip(p,'thick').includes(':'),'others keep the plain text');
});
test('Corpses: save repair keeps good condition keys and drops unknown ones; Turkish is present',()=>{
  fresh(); mkMinion({traits:['rimeborn','bogus'],cd:'preserved'}); mkMinion({traits:['stitched'],cd:'weird'});
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(String(g.army[0].traits),'rimeborn'); eq(g.army[0].cd,'preserved'); ok(!('cd' in g.army[1]),'an unknown condition is dropped'); eq(String(g.army[1].traits),'stitched');
  for(const k of Object.keys(CORPSE_CONDS)) ok(TR_DICT.has(CORPSE_CONDS[k].name)&&TR_DICT.has(CORPSE_CONDS[k].when.replace(/\.$/,''))&&TR_DICT.has(CORPSE_CONDS[k].story.replace(/\.$/,'')),'tr '+k);
  for(const t of DEATH_TRAITS) ok(TR_DICT.has(TRAITS[t].name)&&trText(TRAITS[t].desc)!==TRAITS[t].desc,'tr '+t);
  ok(trText('Rises Rimeborn')!=='Rises Rimeborn'&&trText('Preserved +15%').includes('+15%')&&trText('Preserved +15%')!=='Preserved +15%','tr chips');
  ok(trText('Mn3 is Stitched together and gets up again.').startsWith('Mn3 '),'tr log');
});
})();
