// Army roles 2.0, R12 (src/game-army.js): charms, gear-bearer powers, kill counts and name lines.
(function(){
const {test,ok,eq,near,fix,seed,fresh,setLvl,foe,arena,mkMinion,give,renderAll,cdx}=window.LOTD_T;
const know=n=>{ S.kills[n]=masteryRungs(n).find(x=>x.t.id==='known').at; };
test('Charms: made from six trophies of a Known kind and gold, in town; one a minion, moved freely, home when it leaves',()=>{
  fresh(30); S.mode='town'; const n='Tunnel Rat'; S.trophies={}; S.trophies[n]=CHARM_TROPHIES; S.gold=1000; S.charms=[];
  ok(craftWhy(n).includes('Know'),'Known first'); ok(!craftCharm(n)); know(n); eq(craftWhy(n),''); const c=craftCharm(n); ok(c); eq(c.k,KIT_OF[n]); eq(S.gold,1000-charmCost(n)); ok(!S.trophies[n],'trophies spent'); eq(S.charms.length,1);
  ok(craftWhy(n).includes('trophies'),'needs trophies again'); eq(charmCost('Throne Guard'),CHARM_GOLD*6,'priced by the gate tier');
  const m=mkMinion({lvl:20}), o=mkMinion({lvl:20}); ok(giveCharm(m.uid,0)); eq(m.charm.k,'pack'); eq(S.charms.length,0); eq(echoOf(m),'pack'); eq(echoV(m,'pack'),1);
  S.trophies['Skeleton Guard']=6; know('Skeleton Guard'); craftCharm('Skeleton Guard'); ok(giveCharm(m.uid,0)); eq(m.charm.k,'shield'); eq(S.charms[0].k,'pack','the old charm goes back');
  ok(takeCharm(m.uid)); ok(!m.charm); eq(S.charms.length,2); giveCharm(o.uid,0); S.mode='battle'; ok(!giveCharm(m.uid,0),'town only'); S.mode='town';
  release(o.uid); eq(S.charms.length,2,'a released minion leaves its charm');
  S.kills[n]=5000; eq(charmV({k:'pack',src:n}),1+CHARM_LEDGER,'a Ledgered kind: x1.5');
});
test('Charms: fusion keeps the stronger; every kit now has an echo, Undone or charmed',()=>{
  fresh(30); S.mode='town'; const a=mkMinion({lvl:20}), b=mkMinion({lvl:20}); a.charm={k:'pack',src:'Tunnel Rat'}; b.charm={k:'banner',src:'Pyre Witch'}; S.kills['Pyre Witch']=5000; S.charms=[];
  charmFuse(a,b); eq(a.charm.k,'banner'); eq(b.charm.k,'pack'); returnGear(b); eq(S.charms.length,1);
  KIT_IDS.forEach(k=>{ ok(ECHO[k]!=null,'echo for '+k); ok(echoTxt(k),'text for '+k); });
  S.army=[]; arena([foe({hp:1e6})]); const m=mkMinion({lvl:20}); m.charm={k:'ambush',src:'Shiv Cutpurse'}; near(echoDmg(m,null),1+ECHO.ambush,1e-9); near(echoDmg(m,null),1,1e-9,'first blow only');
  m.charm={k:'hexer',src:'Tide Acolyte'}; const t=foe({hp:1e6}); arena([t]); echoHit(m,t); echoHit(m,t); ok(!hasSt(t,'hexed')); echoHit(m,t); ok(hasSt(t,'hexed'),'every third blow');
  m.charm={k:'burrow',src:'Coffin Crawler'}; S.run.turn=1; eq(echoDr(m,1000),500); S.run.turn=2; eq(echoDr(m,1000),1000);
  m.charm={k:'skirm',src:'Ember Herald'}; m.hp=m.maxHp; eq(echoDr(m,1000),1000); m.hp=1; eq(echoDr(m,1000),700);
  m.charm={k:'purify',src:'Marrow Mite'}; m.hp=m.maxHp; m.st={hexed:2}; echoTurn(); ok(!hasSt(m,'hexed'),'sheds a condition');
  const e=foe({hp:1e6}); arena([e,foe({hp:1e6})]); const bm=mkMinion({lvl:20}); bm.charm={k:'bomb',src:'Ash Husk'}; hurtAlly(bm,1e9); ok(e.hp<1e6,'the bomber echo bursts');
  const s=foe({hp:1e6}); s.shield=1000; const sp=mkMinion({lvl:20}); sp.charm={k:'sapper',src:'Cinder Weaver'}; echoHit(sp,s); eq(s.shield,500);
});
test('Gear-bearer powers: a unique on a gear-bearer gives its own power',()=>{
  fresh(30); S.mode='town'; const m=mkMinion({lvl:20,armed:true,eq:{weapon:null,armor:null,relic:null}}); const a0=m.atk;
  const it=give('w10'); giveGear(m.uid,it.u); ok(mfHas(m,'ruin')); near(mfDmg(m,foe({hp:100})),1.1,1e-9);
  const r=give('u6'); giveGear(m.uid,r.u); ok(mfHas(m,'ledgerchain')&&!mfHas(m,'ruin'),'a relic swap'); near(mfStat(m),MF_STAT,1e-9); ok(m.atk>a0,'stat flags lift it');
  const w=give('w4'); giveGear(m.uid,w.u); eq(mfDr(m,1000),900,'Swarmguard');
  const b=give('u0'); giveGear(m.uid,b.u); eq(shatterOdds(m),0,'Bone Bank: it never shatters');
  const t=foe({hp:1e6}), o=foe({hp:1e6}); arena([t,o]); const cl=give('w7'); S.mode='town'; giveGear(m.uid,cl.u); arena([t,o]); const x=mfHit(m,t,1000,'phys'); ok(o.hp<1e6&&x.includes('cuts'),'Wide Arc');
  const dl=give('w12'); S.mode='town'; giveGear(m.uid,dl.u); arena([foe({hp:1e6})]); m.hp=10; hurtAlly(m,1e6); ok(m.hp>0,'Deathless'); hurtAlly(m,1e6); ok(m.hp>0,'twice'); hurtAlly(m,1e6); ok(!(m.hp>0),'not a third time');
  Object.keys(MINION_FLAG).forEach(f=>ok(FLAGS[f],'a real flag: '+f));
});
test('Kills and names: minions count kills; at 100 a name line lifts the whole role, for good',()=>{
  fresh(30); const m=mkMinion({lvl:20}), o=mkMinion({lvl:20}); const a0=extraMul(o,'atk'); const e=foe({hp:1}); arena([e]); HITTER=m; e.hp=0; checkDeaths(); HITTER=null; eq(m.kills,1);
  m.kills=NAME_AT-1; const e2=foe({hp:1}); arena([e2]); HITTER=m; e2.hp=0; checkDeaths(); HITTER=null; eq(S.nameLines.length,1); eq(S.nameLines[0].name,m.nick); ok(m.nl); ok(extraMul(o,'atk')>a0,'every striker is stronger'); near(nameK('striker'),NAME_K,1e-9); eq(nameK('vanguard'),0);
  const me=memorialize(m,{}); eq(me.kl,NAME_AT); S.army=S.army.filter(x=>x!==m); syncArmy(); ok(extraMul(o,'atk')>a0,'the line survives the minion');
  S.nameLines=Array.from({length:NAME_MAX},(_,i)=>({name:'N'+i,role:'mender',day:1})); const n=mkMinion({lvl:20}); n.kills=NAME_AT-1; const e3=foe({hp:1}); arena([e3]); HITTER=n; e3.hp=0; checkDeaths(); HITTER=null; eq(S.nameLines.length,NAME_MAX,'at most ten');
});
test('Charms and names: saves, the Army tab, the Memorial, the Codex, titles and Turkish',()=>{
  fresh(30); S.mode='town'; const m=mkMinion({lvl:20}); m.charm={k:'pack',src:'Tunnel Rat'}; m.kills=7; S.charms=[{k:'shield',src:'Skeleton Guard'},{k:'bogus',src:'x'}]; S.nameLines=[{name:'Ossa',role:'striker',day:3},{name:'Bad',role:'nope',day:1}];
  const g=JSON.parse(JSON.stringify(S)); armyFix(g); eq(g.charms.length,1); eq(g.nameLines.length,1); eq(g.army[0].charm.k,'pack'); eq(g.army[0].kills,7);
  const h={army:[{}]}; armyFix(h); ok(!('charms' in h)&&!('nameLines' in h)&&!('charm' in h.army[0]),'nothing added');
  S.charms=[{k:'shield',src:'Skeleton Guard'}]; S.nameLines=[{name:'Ossa',role:'striker',day:3}]; S.trophies={'Tunnel Rat':3}; know('Tunnel Rat');
  ui.tab='army'; const a=renderAll('army'); ok(a.includes('Charms')&&a.includes('Pack hunter charm')&&a.includes('Kills 7'),'the Army tab');
  ok(cdx('kits').includes('Gear-bearer powers')&&cdx('kits').includes('Kills and names'));
  S.memorial=[{nick:'Rue',kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:5,st:0,tr:[],role:'striker',day:2,kl:40}]; ui.tab='mem'; const mm=renderAll('memorial'); ok(mm.includes('Kills 40')&&mm.includes('Names in the Ledger'),'the Memorial');
  S.ti=S.ti||{}; S.ti.got=S.ti.got||{}; KIT_IDS.forEach(k=>S.ti['chK_'+k]=1); S.ti.nameLines=1; S.nameLines=Array.from({length:10},(_,i)=>({name:'N'+i,role:'striker',day:1})); checkTitles(); ok(S.ti.got.ar_charmed&&S.ti.got.ar_hundred&&S.ti.got.ar_tennames);
  VIEW.lang='tr'; [echoTxt('bomb'),MINION_FLAG.cleave,charmName({k:'shield'}),'Kills 7'].forEach(s=>ok(trText(s)!==s,s)); VIEW.lang='en';
});
})();
