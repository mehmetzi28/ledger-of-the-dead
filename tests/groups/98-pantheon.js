// The pantheon (src/game-pantheon.js, R8 PR A): five gods, devotion by deeds, vows, boons by rank, shrines and conversion.
(function(){
const {test,ok,eq,near,fix,seq,fresh,setLvl,foe,arena,corpse,mkMinion,renderAll,cdx,invariants,eventScene}=window.LOTD_T;
const K0=Object.assign({},DEED_K);   // the deed tests count raw points; DEED_K is put back in the last test
const sworn=(id,rank)=>{ GODS.forEach(g=>{ DEED_K[g]=1; }); fresh(30); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); S.mode='town'; ok(swear(id),'swear '+id); if(rank) S.faith.dev=rank*DEV_STEP; syncArmy(); return S.faith; };
const dev=()=>faithDev();

test('Pantheon: Morrow\'s deeds: a fire kill, a minion healed from low, a clean clear; the vow breaks on the eleventh raise',()=>{
  sworn('hon'); const e=foe({hp:10}); arena([e,foe()]); hurtFoe(e,50,'fire'); fix(.99); checkDeaths(); eq(dev(),1,'fire kill');
  const m=mkMinion({lvl:10}); m.hp=1; healAlly(m,Math.round(m.maxHp*.5)); eq(dev(),3,'healed from under 25%'); healAlly(m,5); eq(dev(),3,'only from low');
  S.run.lostN=0; gateCleared(S.run); eq(dev(),13,'a clean clear'); S.run.lostN=1; gateCleared(S.run); eq(dev(),13);
  S.faith.dev=250; S.faith.dd=0; S.run.raised=MORROW_RAISE; ok(vowWarn('raise'),'the game warns first'); S.run.corpses=[corpse()]; S.mode='raise'; S.player.mana=1e4; fix(0); S.firstRaise=1; tryRaise(S.run.corpses[0].id);
  ok(S.run.raised>MORROW_RAISE); eq(dev(),150,'a rank lost'); eq(S.faith.vb,S.day); eq(T_('vowsBroken'),1); ok(!vowBreak('hon'),'once a day');
});
test('Pantheon: Vesh, Ulm, the Choir and the Profane earn by their deeds; their vows break',()=>{
  sworn('vesh'); S.player.mana=1e4; const t=foe({hp:1e6}); arena([t]); S.player.skills.chill=1; S.run.cd={}; fix(0); useSkill('chill',t); eq(dev(),1,'a freeze');
  const b=foe({hp:1e6,boss:true}); S.run.enemies=[b]; S.run.cd={}; fix(0); useSkill('chill',b); eq(dev(),6,'a boss frozen');
  S.run.corpses=[corpse({cd:'preserved'})]; S.mode='raise'; fix(0); S.firstRaise=1; tryRaise(S.run.corpses[0].id); eq(dev(),11,'a Preserved body raised');
  const r=foe({hp:5}); S.run.enemies=[r,foe()]; addDot(r,'blight',50,2); KILL='blight'; hurtFoe(r,50,'rot'); KILL=null; fix(.99); checkDeaths(); ok(S.faith.vb!==S.day,'one Rotten body is forgiven'); S.run.vrot=VESH_ROT-1; const r2=foe({hp:5}); S.run.enemies=[r2,foe()]; addDot(r2,'blight',50,2); KILL='blight'; hurtFoe(r2,50,'rot'); KILL=null; checkDeaths(); eq(S.faith.vb,S.day,'bodies rotted'); eq(dev(),0);
  sworn('ulm'); arena([foe()]); S.player.skills.blast=1; S.player.mana=1e4; S.run.corpses=[corpse()]; S.run.cd={}; useSkill('blast',S.run.enemies[0]); eq(dev(),2,'a body exploded'); faithUsed(3); eq(dev(),5,'trophies used');
  S.mode='town'; S.run=null; S.trophies={'Tunnel Rat':3}; ok(vowWarn('sell')); sellTrophy('Tunnel Rat',false); eq(S.faith.vb,S.day,'a trophy sold');
  sworn('choir'); arena([foe({hp:1e6})]); S.player.mana=1e4; act('siphon'); eq(dev(),1,'Soul Siphon'); S.mode='town'; S.run=null; S.gold=1e9; S.memorial=[{nick:'A',kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:5,st:1,tr:[],role:'striker',day:1}];
  ok(carveHead(0)); eq(dev(),11,'a headstone'); ok(honour(0)); eq(dev(),16,'an honour'); S.faith.dev=300; const el=mkMinion({lvl:20,stage:2}); memorialize(el,{g:0}); eq(S.faith.vb,S.day,'a named minion lost'); ok(dev()<=200);
  sworn('dis'); arena([foe({hp:1,elite:true}),foe()]); hurtFoe(S.run.enemies[0],10); fix(.99); checkDeaths(); eq(dev(),2,'an elite'); ok(!vowBreak('dis'),'no vow');
  S.faith.dev=12; faithDawn(); eq(dev(),12-PROFANE_DECAY,'devotion fades'); invariants('deeds');
});
test('Pantheon: Morrow\'s boons: fire scorches the foes beside, the first minion stands at 10%, a fallen one rises once a run',()=>{
  sworn('hon',3); const a=foe({hp:1e5}), b=foe({hp:10}), c=foe({hp:1e5}); arena([a,b,c]); hurtFoe(b,1000,'fire'); fix(.99); checkDeaths(); ok(a.hp<1e5&&a.hp>=1e5-1000,'scorched: '+a.hp); eq(c.hp,a.hp);
  S.faith.dev=4*DEV_STEP; const m=mkMinion({lvl:10}), n=mkMinion({lvl:10}); hurtAlly(m,1e6); eq(m.hp,Math.max(1,Math.round(m.maxHp*MORROW_STAND)),'stands'); hurtAlly(n,1e6); eq(n.hp,0,'once a room');
  S.faith.dev=5*DEV_STEP; n.hp=n.maxHp; hurtAlly(n,1e6); eq(n.hp,Math.max(1,Math.round(n.maxHp*MORROW_RISE)),'rises at rank 5'); n.hp=n.maxHp; hurtAlly(n,1e6); eq(n.hp,0,'once a run'); ok(blessed('hon'));
});
test('Pantheon: Vesh\'s boons: cheaper Chill, frozen foes take more, Preserved bodies rise easier, longer freezes, Hibernation',()=>{
  sworn('vesh'); const c0=skCost(SKILL.chill); S.faith.dev=DEV_STEP; eq(skCost(SKILL.chill),Math.max(0,c0-VESH_CHILL));
  const e=foe({hp:1e6}); arena([e]); e.stun=1; const h0=e.hp; hurtFoe(e,100,'phys'); const d1=h0-e.hp; S.faith.dev=2*DEV_STEP; const h1=e.hp; hurtFoe(e,100,'phys'); ok(h1-e.hp>d1,'frozen foes take more at rank 2');
  const pc=corpse({cd:'preserved'}), base=raiseChance(pc); S.faith.dev=3*DEV_STEP; eq(raiseChance(pc),Math.min(RAISE_MAX,base+VESH_PRES));
  S.faith.dev=4*DEV_STEP; const t=foe({hp:1e6}); S.run.enemies=[t]; S.player.skills.chill=1; S.player.mana=1e4; S.run.cd={}; fix(0); useSkill('chill',t); eq(t.stun,2,'one turn longer');
  S.faith.dev=5*DEV_STEP; const bo=foe({hp:100,maxHp:1000,boss:true,abil:'sunder',rankI:2}); S.run.enemies=[bo]; bo.stun=1; checkPhase(); ok(!bo.phase2,'Hibernation'); bo.stun=0; checkPhase(); ok(bo.phase2);
});
test('Pantheon: Ulm\'s boons: more trophies, harder blight, rot left behind, a faster Corpse Explosion, Harvest Home',()=>{
  sworn('ulm',3); arena([foe({hp:1}),foe({hp:1e6})]); hurtFoe(S.run.enemies[0],10); fix(.99); checkDeaths(); ok(S.run.enemies[1].dots&&S.run.enemies[1].dots.blight,'rot left behind');
  S.faith.dev=4*DEV_STEP; S.player.skills.blast=1; S.player.mana=1e4; S.run.corpses=[corpse()]; S.run.cd={}; useSkill('blast',S.run.enemies[1]); eq(S.run.cd.blast,SKILL.blast.cd);
  S.faith.dev=5*DEV_STEP; S.run.troph={'Tunnel Rat':2}; S.run.events=[]; gateCleared(S.run); eq(S.run.troph['Tunnel Rat'],4,'Harvest Home'); eq(faithTro(),ULM_TRO); eq(faithRot(),ULM_ROT);
});
test('Pantheon: the Choir\'s and the Profane\'s boons',()=>{
  sworn('choir',1); for(let i=0;i<4;i++) mkMinion({lvl:60}); near(faithSiph(),1+CHOIR_SIPH*4,1e-9); S.faith.dev=2*DEV_STEP; eq(silenceT(3),2);
  S.faith.dev=3*DEV_STEP; S.gold=1e9; S.memorial=[{nick:'A',kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:5,st:1,tr:[],role:'striker',day:1,hs:1},{nick:'B',kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:5,st:1,tr:[],role:'striker',day:1}];
  ok(honour(0)); S.day++; ok(remembered(),'two days'); S.day++; ok(!remembered());
  S.faith.dev=5*DEV_STEP; near(choirK(),1+CHOIR_STONE+CHOIR_REQ*2,1e-9); syncArmy(); const m=S.army[0], a0=m.atk; S.faith.dev=0; syncArmy(); ok(m.atk<a0,'army damage');
  sworn('dis',3); arena([foe({hp:1e6})]); for(let i=0;i<9;i++) gainSoul(); eq(S.run.souls,SOUL_MAX+1); S.player.lvl=Math.max(S.player.lvl,ULT_LV); S.player.ult=Object.keys(ULTS)[0]; ok(useUlt(S.run.enemies[0])); eq(S.run.souls,1,'one Soul kept past the ultimate');
});
test('Pantheon: another god\'s shrine converts with half the devotion; the Profane may desecrate it; Turncoat and Godless',()=>{
  sworn('hon',3); eventScene('godshrine'); S.run.event.g='vesh'; ok(!resolveEvent('desecrate'),'the Profane only'); ok(resolveEvent('convert')); eq(faithOf(),'vesh'); eq(dev(),150); eq(S.faith.cv,1); eq(T_('converted'),1);
  S.mode='town'; S.run=null; S.gold=1e6; renounce(); swear('dis'); eventScene('godshrine'); S.run.event.g='ulm'; const g0=S.gold; ok(resolveEvent('desecrate')); ok(S.gold>g0); eq(dev(),10); eq(T_('desecrated'),1);
  S.ti.converted=3; checkTitles(); ok(S.ti.got.f_turncoat); S.mode='town'; S.run=null; S.ti.clr={5:1}; ok(startNGP()); eq(T_('godless'),1); checkTitles(); ok(S.ti.got.f_godless);
});
test('Pantheon: rank-ups say so, write a passage at ranks 1 and 5, and earn the god\'s title',()=>{
  sworn('ulm'); S.faith.dev=DEV_STEP-1; deed('ulm',1); eq(faithRank(),1); ok(S.notices.some(n=>/grants you rank 1/.test(n.m))); ok(S.story.g_ulm1);
  S.faith.dev=5*DEV_STEP-1; deed('ulm',1); ok(S.story.g_ulm5); eq(T_('r5_ulm'),1); checkTitles(); ok(S.ti.got.f_ulm);
  const t0=templeDev(); S.build={temple:2}; S.faith.dev=0; deed('ulm',10); near(dev(),10*templeDev(),1e-9); ok(templeDev()>t0,'the Temple speeds devotion');
});
test('Pantheon: the Codex, the Pantheon screen and Turkish',()=>{
  sworn('choir',2); ui.tab='town'; const h=renderAll('pantheon'); ok(/rank 2\/5/.test(h)&&/dev-bar/.test(h)&&h.includes(FAITH.choir.vow)); ok(/faith-l choir/.test(h));
  const c=cdx('faith'); GODS.forEach(k=>ok(c.includes(FAITH[k].name),k)); ok(c.includes('Requiem Chorus'));
  VIEW.lang='tr'; try{ ['Morrow grants you rank 3: Fire kills scorch the foes beside them for 20% of the blow.','You broke your vow to Ulm (a trophy sold). You lose a rank of devotion and today\'s.','120 of 200 devotion for rank 2.','Raising another body breaks your vow to Morrow (no more than 10 in a run). Press again to raise anyway.','Selling a trophy breaks your vow to Ulm. Press again to sell anyway.'].forEach(s=>ok(trText(s)!==s,'untranslated: '+s)); } finally { VIEW.lang='en'; }
});
test('Pantheon: each god\'s pace (DEED_K) scales its deeds',()=>{ Object.assign(DEED_K,K0); sworn('choir'); Object.assign(DEED_K,K0); deed('choir',10); near(dev(),10*K0.choir*templeDev(),1e-6); Object.assign(DEED_K,K0); });
})();
