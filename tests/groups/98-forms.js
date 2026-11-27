// The forms, R21 PR B (src/game-phyl.js): five forms that need their build, each with gains and a cost, the second stage at
// corruption 75, the apotheosis at 100 (once a run), the Colossus in the front row, titles, the endings' lines, the save.
(function(){
const {test,ok,eq,fix,fresh,arena,foe,mkMinion,setLvl,renderAll,invariants}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const STAT={lich:'intelligence',blood:'strength',colossus:'constitution',saint:'will'};
const ready=(k,c)=>{ fresh(40); S.mode='town'; S.run=null; S.gold=1e6; S.notices=[]; delete S.player.form; S.player.corr=30; phylBind('clasp'); S.player.corr=c==null?55:c;
  S.player.stats={strength:5,constitution:5,intelligence:5,will:5}; if(STAT[k]) S.player.stats[STAT[k]]=40; if(k==='herald') S.player.skills={blast:3}; return S.player; };
const take=(k,c)=>{ ready(k,c); ok(takeForm(k),'took '+k); return S.player; };

test('Forms: five, each needs its build, bound at corruption 50, once a cycle; the Status panel offers them',()=>{
  eq(FORM_IDS.join(),'lich,blood,colossus,saint,herald');
  ready('lich',49); ok(!formCan('lich'),'corruption 49'); S.player.corr=50; ok(formCan('lich')); ok(!formCan('blood'),'Strength is not highest'); ok(!formCan('herald'),'no Rot path');
  ui.tab='gates'; const h=renderAll('forms'); ok(h.includes('data-a="form"'),'the offer');
  delete S.player.phyl; ok(!formCan('lich'),'needs the phylactery'); S.player.phyl={v:'clasp',cr:0};
  for(const k of FORM_IDS){ ready(k); ok(formCan(k),k+' with its build'); }
  take('lich'); ok(!formCan('lich')&&!takeForm('blood'),'once'); eq(formSt(),1); ok(S.story.form_lich!=null,'its passage');
  S.mode='battle'; delete S.player.form; ok(!formCan('lich'),'not in battle');
});
test('Lich: Soul Rend hits a second foe, +1 Soul, frost and shadow +15%; healing -30%, Bone Ward -20%',()=>{
  ready('lich'); const w0=pWard(), s0=soulCap(); takeForm('lich'); const r=arena([foe({hp:1e6}),foe({hp:1e6})]); fix(.5); S.player.mana=999; act('siphon'); ok(r.enemies[1].hp<1e6,'Soul Rend'); eq(r.enemies[1].hp,r.enemies[0].hp,'the same blow');
  S.mode='town'; S.run=null; ready('lich'); takeForm('lich'); eq(soulCap(),s0+1); eq(pWard(),Math.round(w0*.8)); eq(formHealK(),.7);
  HITTER=S.player; eq(formDmgK('frost'),1.15); eq(formDmgK('shad'),1.15); eq(formDmgK('phys'),1); HITTER=null; eq(formDmgK('frost'),1,'only your blows');
});
test('Blood Lord: Strike heals 15% of its damage, Bloodfiends drink double; the first room of the day is in sunlight',()=>{
  take('blood'); const P=S.player; arena([foe({hp:1e6})]); ok(S.run.sun,'sunlight in the first room'); HITTER=P; eq(formDmgK('phys'),.9); HITTER=null;
  roomStart(S.run.enemies); ok(!S.run.sun,'only once a day'); P.hp=1; fix(.5); act('strike'); ok(P.hp>1,'the strike drinks'); eq(formFiendK(),2);
});
test('Bone Colossus: front row, +40% max HP, Strike hits the row; Siphon -25%; Ossuary Mass at 75 (its own group)',()=>{
  ready('colossus'); const h0=pMax(); eq(rowOf(S.player),'b'); takeForm('colossus'); eq(rowOf(S.player),'f','the front row'); eq(pMax(),Math.round(h0*1.4)||pMax()); ok(pMax()>h0*1.35);
  eq(formSiphK(),.75); const r=arena([foe({hp:1e6,role:'vanguard'}),foe({hp:1e6,role:'vanguard'}),foe({hp:1e6,role:'mender'})]); fix(.5); act('strike');
  ok(r.enemies[1].hp<1e6,'the same row'); eq(r.enemies[2].hp,1e6,'not the back row');
  eq(formDr(100),100,'stage 1'); corrAdd(25); eq(formSt(),2); eq(formDr(100),85);
});
test('Choir Saint: marks count a step higher, each order twice a room; own damage -20%; Choir of Many at 75',()=>{
  take('saint'); const m=mkMinion({role:'striker',marks:['keen']}); ok(markLv(m,'keen')===2,'one step higher'); eq(markLv(m,'other'),0,'no mark, no step');
  HITTER=S.player; eq(formDmgK('phys'),.8); HITTER=null;
  arena([foe({hp:1e6})]); ok(command('striker')); ok(canCommand('striker'),'again'); ok(command('striker')); eq(S.run.saintN,1);
  eq(formArmyK(),1); corrAdd(25); eq(formArmyK(),1.1);
});
test('Plague Herald: a fallen foe passes its rot, Corpse Explosion leaves plague; menders -15%; Rotting Air at 75',()=>{
  take('herald'); eq(formMendK(),.85); const a=foe({hp:1}), b=foe({hp:1e6}); arena([a,b]); a.dots={poison:{d:5,t:2}}; a.hp=0; checkDeaths(); ok(b.dots&&b.dots.poison,'the poison passes');
  b.dots={}; formBlast(); ok(b.dots.poison,'plague'); corrAdd(25); const c=foe({hp:1000}); formRoom([c]); ok(c.dots&&c.dots.poison,'Rotting Air');
});
test('Stages: the second at 75, the apotheosis at 100, both stay open; the apotheosis once a run for each form',()=>{
  for(const k of FORM_IDS){ take(k,55); eq(formSt(),1); corrAdd(19); eq(formSt(),1); corrAdd(1); eq(formSt(),2,k+' stage 2'); corrAdd(30); eq(formSt(),3); corrAdd(-60); eq(formSt(),3,'stays open');
    const r=arena([foe({hp:1e6}),foe({hp:1e6})]); mkMinion({role:'striker'}); ok(canApo()); const t0=T_('apo'); fix(.5); act('apo'); eq(T_('apo'),t0+1); ok(r.apoU); ok(!canApo(),'once a run');
    ok(r.enemies.some(e=>e.hp<1e6||e.stun||(e.dots&&e.dots.poison))||r.frenzy>0,k+' did something'); S.mode='town'; S.run=null; }
  ok(String(renderAll('apo')).length>0);
});
test('Lich stage 2: Phylactery Ward holds the first minion blow each room for 20% of your max mana',()=>{
  take('lich',80); const m=mkMinion({role:'vanguard'}); arena([foe({hp:1e6})]); S.player.mana=pMana(); hurtAlly(m,1e6); eq(m.hp,1,'held'); eq(S.player.mana,pMana()-Math.round(pMana()*.2)); hurtAlly(m,1e6); ok(m.hp<=0,'once a room');
});
test('Shattering and New Game+ clear the form; the save repairs it; titles, the endings\' lines, Turkish and the Codex',()=>{
  take('blood'); S.build=Object.assign({},S.build,{temple:1}); phylShatter(); ok(!S.player.form,'shattered');
  take('saint'); const old=S.player; S.player={lvl:1}; phylNgp(old); ok(!S.player.form,'New Game+ resets the form'); ok(S.player.phyl,'but keeps the soul'); S.player=old;
  const P={phyl:{v:'ring'},form:{k:'nope'}}; phylFix(P); ok(!P.form); const Q={phyl:{v:'ring'},form:{k:'lich',st:9}}; phylFix(Q); eq(Q.form.st,3); const R={form:{k:'lich',st:1}}; phylFix(R); ok(!R.form,'no form without the vessel');
  eq(TITLES.filter(t=>t.id.startsWith('fm_')).length,6); S.ti.form_lich=1; S.ti.apo=1; checkTitles(); ok(S.ti.got.fm_lich&&S.ti.got.fm_apo);
  S.player.corr=10; ok(/Clean Hand/.test(endingVariant('closed'))); S.player.corr=90; ok(/Ledger's Own/.test(endingVariant('closed'))); ok(!/Ledger's Own/.test(endingVariant('kept')),'only Close the book');
  ok(tr('Take the form of the Lich')!=='Take the form of the Lich'); ok(tr('Winter of the Book')!=='Winter of the Book'); ok(cxPhylHTML().includes('Plague Herald'));
  eq(typeof formTint(),'number'); invariants();
});
})();
