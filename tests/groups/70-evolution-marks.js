// Evolution marks: the choices at Elder and Eternal, old saves, fusion, each mark in a fight, Bulwark planned in the foe's intent,
// the Army tab and card chips, What next, the Codex and Turkish (src/game-skills-market.js MARK, src/game-runs.js act, src/ui-screens.js).
(function(){
const {test,ok,eq,fresh,foe,arena,mkMinion,seed,renderAll,cdx}=window.LOTD_T;

test('Marks: two per role; a choice is due at Elder and Eternal, worked out from the stage',()=>{
  fresh(); for(const r of Object.keys(ROLES)) eq(roleMarks(r).length,2,r);
  eq(MARK.bulwark.v,.2); eq(MARK.spiked.v,.1); eq(MARK.marksman.v,.1); eq(MARK.volley.v,.2); eq(MARK.warden.v,.2); eq(MARK.butcher.v,.15); eq(BUTCHER_LOW,.4);
  const m=mkMinion({role:'vanguard'}); eq(markPend(m),0); m.stage=1; eq(markPend(m),0); m.stage=2; eq(markPend(m),1); m.stage=4; eq(markPend(m),2);
  m.thrall=true; eq(markPend(m),0,'a siege thrall chooses nothing'); delete m.thrall;
});
test('Marks: pick one at Elder, then empower it or take the other at Eternal; out of battle only',()=>{
  fresh(); const m=mkMinion({role:'reaper',stage:2}); S.mode='town';
  ok(!chooseMark(m.uid,'bulwark'),'another role\'s mark is refused'); ok(chooseMark(m.uid,'butcher')); eq(m.marks.join(),'butcher'); eq(markPend(m),0); ok(!chooseMark(m.uid,'harvester'),'no second pick before Eternal');
  m.stage=4; eq(markOpts(m).join(),'butcher,harvester'); ok(chooseMark(m.uid,'butcher')); eq(markLv(m,'butcher'),2); near2(markV(m,'butcher'),.3);
  const n=mkMinion({role:'reaper',stage:4}); ok(chooseMark(n.uid,'harvester')); ok(chooseMark(n.uid,'butcher')); eq(markLv(n,'harvester'),1); eq(markLv(n,'butcher'),1);
  const b=mkMinion({role:'striker',stage:2}); arena([foe()]); ok(!chooseMark(b.uid,'marksman'),'not mid-fight'); eq(markPend(b),1,'it waits');
  function near2(a,x){ ok(Math.abs(a-x)<1e-9,a+' vs '+x); }
});
test('Marks: old Elders get a free choice on load; junk and extra marks are dropped',()=>{
  fresh(); const m=mkMinion({role:'mender',stage:3}), y=mkMinion({role:'mender',stage:1}); S.mode='town';
  let g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.army[0].marks,undefined); eq(markPend(g.army[0]),1,'a free choice');
  const j=JSON.parse(JSON.stringify(S)); j.army[0].marks=['warden','bulwark','purifier']; j.army[1].marks=['warden']; g=normalizeSave(j);
  eq(g.army[0].marks.join(),'warden','off-role dropped, no more than the stage allows'); eq(g.army[1].marks,undefined,'a Greater has no mark yet'); void y; void m;
});
test('Marks: fusion keeps the survivor\'s marks; the absorbed one\'s are lost',()=>{
  fresh(10); S.mode='town'; S.gold=1e6; const a=mkMinion({role:'striker',lvl:8,stage:2,marks:['volley']}), b=mkMinion({role:'striker',lvl:5,stage:2,marks:['marksman']});
  const k=fuse(a.uid,b.uid); eq(k,a); eq(a.marks.join(),'volley');
});
test('Marks: Bulwark is planned in the foe\'s intent, and the blow lands where the card said',()=>{
  fresh(); const a=foe({role:'striker',hp:1e6,atk:30}); arena([a]); const v=mkMinion({role:'vanguard',stage:4,marks:['bulwark','bulwark']}), s=mkMinion({role:'striker'}); v.maxHp=v.hp=1e6; seed(21);
  const n={p:0,v:0,s:0,bw:0}; for(let i=0;i<3000;i++){ delete a.it; rollIntent(a); const t=a.it.t; if(a.it.bw){ n.bw++; eq(t,fxKey(v),'a Bulwark intent names the Bulwark'); } n[t==='p'?'p':t===fxKey(v)?'v':'s']++; }
  const back=n.p+n.s, aimed=back+n.bw; ok(Math.abs(n.bw/aimed-.4)<.05,'about 40% of back-row blows taken: '+n.bw+'/'+aimed);
  v.marks=['spiked']; let none=0; for(let i=0;i<500;i++){ delete a.it; rollIntent(a); if(a.it.bw) none++; } eq(none,0,'no Bulwark, no redirect');
  v.marks=['bulwark','bulwark']; a.it={k:'atk',t:fxKey(v),bw:1}; const info=intentInfo(a); ok(/Bulwark/.test(info.tip)&&info.txt==='Attacks '+v.nick,info.txt+' / '+info.tip);
  const hp=v.hp; S.run.log=[]; act('strike'); ok(v.hp<hp,'the Bulwark took it'); ok(S.run.log.some(l=>l.m==='Bulwark: '+v.nick+' intercepts Test Foe\'s blow.'),'logged');
});
test('Marks: Spiked hurts attackers; Marksman crits more; Butcher hits low foes harder; Volley hits a second foe',()=>{
  const spike=marks=>{ fresh(); const a=foe({hp:1e6,atk:200}); arena([a]); const v=mkMinion({role:'vanguard',stage:2,marks}); v.maxHp=v.hp=1e7; S.run.taunt=3; seed(3); act('strike'); return 1e6-a.hp; };
  const sp=spike(['spiked']), no=spike(['bulwark']); ok(sp>no,'spikes: '+sp+' vs '+no);
  const crits=marks=>{ fresh(); const a=foe({hp:1e9,atk:0,stun:1e9}); arena([a]); const m=mkMinion({role:'striker',stage:2,marks}); m.atk=50;   /* frozen for good: it never hits back */ seed(8); const c0=T_('crits'); for(let i=0;i<300;i++) act('strike'); return T_('crits')-c0; };
  const cm=crits(['marksman']), cv=crits(['volley']); ok(cm>cv+20,'marksman crits '+cm+' vs '+cv);
  const low=marks=>{ fresh(); const a=foe({hp:1e6,maxHp:1e7,atk:0}); arena([a]); const m=mkMinion({role:'reaper',stage:2,marks}); m.atk=1000; S.player.atk=0; seed(6); act('strike'); return 1e6-a.hp; };
  const bu=low(['butcher']), hv=low(['harvester']); ok(bu>hv*1.08&&bu<hv*1.35,'butcher '+bu+' vs '+hv);
  fresh(); const f1=foe({name:'First',hp:1e6,atk:0}), f2=foe({name:'Second',hp:1e6,atk:0}); arena([f1,f2]); const s=mkMinion({role:'striker',stage:2,marks:['volley']}); s.atk=500; seed(2); act('strike');
  ok(f2.hp<1e6,'the second foe is hit'); ok(S.run.log.some(l=>l.m.startsWith('Volley: '+s.nick+' also hits Second for ')),'logged');
});
test('Marks: Harvester takes a Soul from its first kill each room (two when empowered)',()=>{
  fresh(); const a=foe({name:'Wall',hp:1e7,atk:0}), b=foe({name:'Chaff',hp:2,atk:0}); arena([a,b]); const m=mkMinion({role:'reaper',stage:2,marks:['harvester']}); m.atk=1000; seed(4);
  const s0=S.run.souls||0; act('strike'); eq(b.dead,true); eq((S.run.souls||0)-s0,1,'one Soul'); ok(S.run.log.some(l=>/^Harvester: /.test(l.m)));
  S.run.enemies.push(foe({name:'Chaff Two',hp:2,atk:0})); act('strike'); eq((S.run.souls||0)-s0,1,'only the first kill each room');
  m.marks=['harvester','harvester']; S.run.enemies.push(foe({name:'Chaff Three',hp:2,atk:0})); act('strike'); eq((S.run.souls||0)-s0,2,'empowered: a second kill counts');
});
test('Marks: Warden wards the healed ally (you or a minion, gone with the room); Purifier lifts a wound',()=>{
  fresh(); const a=foe({hp:1e6,atk:0}); arena([a]); const m=mkMinion({role:'mender',stage:2,marks:['warden']}); m.atk=100; S.player.hp=Math.round(pMax()*.3); S.player.shield=0; seed(5);
  act('strike'); ok(S.player.shield>0,'you hold a ward'); ok(S.run.log.some(l=>/^Warden: .+ wards you for \d+\.$/.test(l.m)));
  const v=mkMinion({role:'vanguard'}); v.mw=10; const hp=v.hp; hurtAlly(v,4); eq(v.hp,hp,'the ward soaks first'); eq(v.mw,6); hurtAlly(v,10); eq(v.hp,hp-4); clearAll(v); eq(v.mw,undefined,'gone with the room');
  fresh(); arena([foe({hp:1e6,atk:0})]); const p=mkMinion({role:'mender',stage:2,marks:['purifier']}); p.atk=50; S.player.hp=Math.round(pMax()*.3); S.player.dots={bleed:{d:1,t:3},burn:{d:1,t:3}}; seed(5);
  act('strike'); eq(Object.keys(S.player.dots||{}).length<=1,true,'one wound lifted'); ok(S.run.log.some(l=>l.m==='Purifier: '+p.nick+' cleanses you.'));
});
test('Marks: card chips, the Army tab\'s Marks section, What next, the Codex, all in Turkish too',()=>{
  fresh(); const m=mkMinion({role:'vanguard',stage:2}); S.mode='town'; ui.tab='army';
  let h=renderAll('army'); ok(/Ready to choose/.test(h)); ok(/id="h-mark"/.test(h)); ok(new RegExp('data-a="mark" data-k="'+m.uid+'\\|bulwark"').test(h)&&/>Spiked</.test(h));
  ok(goals().some(g=>g.t==='A minion is ready to choose its mark.'),'What next');
  ACTIONS.mark(m.uid+'|bulwark'); eq(m.marks.join(),'bulwark'); h=renderAll('army'); ok(!/id="h-mark"/.test(h)&&!/Ready to choose/.test(h)); ok(/class="trait mark" title="Takes 20% of the single blows/.test(h),'a chip with its tooltip');
  m.stage=4; h=renderAll('army'); ok(/>Empower Bulwark</.test(h)&&/>Take Spiked</.test(h)); ACTIONS.mark(m.uid+'|bulwark'); ok(/Bulwark \(empowered\)/.test(renderAll('army'))&&/Takes 40%/.test(renderAll('army')));
  const c=cdx('army'); ok(/>Marks</.test(c)); MARK_IDS.forEach(k=>ok(c.includes(MARK[k].name),k));
  try{ VIEW.lang='tr';
    const T=['Marks','Ready to choose','Choose its mark out of battle, in the Marks section of the Army tab','A minion is ready to choose its mark.','Bulwark (empowered)','Empower Bulwark','Take Spiked',
      'Volley: Rex also hits Rat for 12.','Harvester: Rex harvests a Soul (2/5).','Warden: Rex wards you for 9.','Warden: Rex wards Bob for 9.','Purifier: Rex cleanses you.','Purifier: Rex cleanses Bob.',
      'Bulwark: Rex intercepts Rat\'s blow.','Bulwark: Rex steps in front of a blow meant for your back row.','At Elder a minion takes one of two marks; at Eternal it empowers that mark (its numbers doubled) or takes the other.'];
    for(const k of MARK_IDS){ const d=MARK[k]; T.push(d.name,d.desc(d.v),d.desc(2*d.v),d.desc(d.v)+'. Empowered: '+d.desc(2*d.v)+'.'); }
    T.forEach(t=>ok(trText(t)!==t,'untranslated: '+t+' -> '+trText(t)));
    const nodes=codexSection('army').split('<p class="group-h">Marks</p>')[1].replace(/<[^>]+>/g,'|').split('|').map(x=>x.replace(/&#39;/g,"'").trim()).filter(x=>/[A-Za-z]/.test(x)); ok(nodes.length>=9); nodes.forEach(x=>ok(trText(x)!==x,'untranslated: '+x));
  } finally { VIEW.lang='en'; }
});
})();
