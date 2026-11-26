// Foe kits, the Undone and Sweep (src/game-kits.js).
(function(){
const {test,ok,eq,near,fix,H,fresh,setLvl,foe,arena,mkMinion,corpse,renderAll,cdx}=window.LOTD_T;
const kf=(base,o)=>foe(Object.assign({base,name:base,hp:1e6,maxHp:1e6,atk:100},o||{}));   /* a foe of a kind, so it carries that kind's kit */
const plan=(e,turn)=>{ S.run.turn=turn; delete e.it; return rollIntent(e); };

test('Kits: every kind of foe has one; a gate never repeats a kit; all sixteen are carried; bosses, the rival and secret masters have none',()=>{
  fresh(); eq(KIT_IDS.length,16);
  DUNGEONS.forEach(D=>{ const ks=D.mobs.map(m=>KIT_OF[m[0]]); ok(ks.every(k=>KITS[k]),D.name+': every kind'); eq(new Set(ks).size,ks.length,D.name+': no kit twice'); ok(!KIT_OF[D.boss[0]],'no boss kit'); });
  TW_MOBS.forEach(m=>ok(KITS[KIT_OF[m[0]]],m[0])); Object.values(SIEGE_FOES).forEach(f=>ok(KITS[KIT_OF[f[0]]],f[0]));
  eq(new Set(Object.values(KIT_OF)).size,16,'all sixteen are carried');
  ok(Object.keys(KIT_OF).every(n=>allNames().includes(n)||Object.values(SIEGE_FOES).some(f=>f[0]===n)),'only real kinds');
  eq(kitOf(kf('Tunnel Rat')),'pack'); eq(kitOf(kf('Tunnel Rat',{boss:true})),null); eq(kitOf(kf('Tunnel Rat',{rival:true})),null); eq(kitOf(kf('Tunnel Rat',{secret:true})),null);
  ok(Object.values(KITS).every(K=>K.name&&K.rule&&K.ans),'names, rules and answers');
});
test('Kits: Shieldbearer shields the most hurt foe every second turn; Banner-bearer stands back and lifts the others',()=>{
  fresh(20); const s=kf('Tannery Brute'), o=kf('Grave Beetle'); arena([s,o],0); o.hp=5e5;
  eq(plan(s,1).k,'atk','odd turns: a blow'); const it=plan(s,2); eq(it.k,'shield'); eq(it.t,o.id,'the most hurt');
  S.run.turn=2; ok(kitAct(s,it)); eq(o.shield,Math.round(s.maxHp*KIT_SHIELD)); for(let i=0;i<5;i++) kitAct(s,it); eq(o.shield,Math.round(o.maxHp*KIT_SHIELD_CAP),'capped');
  fresh(20); const b=kf('Orchard Marshal',{role:'vanguard'}), x=kf('Thorn Troll',{role:'vanguard'}); arena([b,x],4);
  eq(rowOf(b),'b','a banner vanguard stands back'); eq(rowOf(x),'f'); near(kitAtk(x),1+KIT_BANNER,1e-9); eq(kitAtk(b),1,'not for itself');
  eq(kitTaken(x,1000),Math.round(1000*(1-KIT_BANNER))); b.hp=0; eq(kitTaken(x,1000),1000,'gone with the banner');
});
test('Kits: an Ambusher\'s first blow ignores rows for 30% more; a Mana thief drains; a Sapper tears ward twice as fast',()=>{
  fresh(20); const a=kf('Shiv Cutpurse',{role:'striker'}); arena([a],0); const v=mkMinion({lvl:10,role:'vanguard'}), b=mkMinion({lvl:10,role:'mender'});
  let it=plan(a,1); ok(it.amb,'an ambush'); eq(it.t,fxKey(b),'the back-row minion'); near(kitAtk(a,it),KIT_AMBUSH,1e-9);
  b.hp=0; it=plan(a,1); eq(it.t,'p','you, with no minion in the back row'); a.ambU=1; it=plan(a,1); ok(!it.amb,'once a fight');
  S.run.taunt=2; delete a.ambU; it=plan(a,1); eq(it.t,fxKey(v),'Taunt still pulls it'); S.run.taunt=0;
  fresh(20); const t=kf('Warren Bandit',{role:'striker'}); arena([t],0); const P=S.player; P.mana=pMana(); foeOnHit(t,P); eq(P.mana,pMana()-Math.round(pMana()*KIT_THIEF));
  fresh(20); const sp=kf('Cinder Weaver',{atk:100}); arena([sp],2); const P2=S.player; P2.stats.constitution=300; P2.hp=pMax(); P2.shield=500;
  hurtAlly(P2,100); const L=500-P2.shield; P2.shield=500; SAP=true; hurtAlly(P2,100); SAP=false; ok(L>0); eq(500-P2.shield,L*KIT_SAP,'the same blow tears twice the ward'); eq(P2.hp,pMax(),'and none of it gets through');
});
test('Kits: a Gravecaller calls a fallen body back once; a burst body cannot be called; the second death pays nothing',()=>{
  fresh(20); const g=kf('Drowned Priest',{role:'mender'}), d=kf('Skeleton Guard',{hp:100,maxHp:100}); arena([g,d],1); g.hp=g.maxHp;
  d.hp=0; checkDeaths(); ok(d.dead); const k0=S.run.kills, xp0=S.run.pending; const it=plan(g,2); eq(it.k,'call'); eq(it.t,d.id);
  ok(kitAct(g,it)); ok(!d.dead&&d.hp===Math.round(d.maxHp*KIT_CALL),'back at 40%'); ok(d.risen); ok(!S.run.corpses.some(c=>c.id==='c'+d.id),'its body is up');
  d.hp=0; checkDeaths(); eq(S.run.kills,k0,'no second kill'); eq(S.run.pending,xp0,'no second XP'); ok(S.run.corpses.some(c=>c.id==='c'+d.id),'a body again');
  ok(!plan(g,3)||plan(g,3).k!=='call','once a fight');
  fresh(20); const g2=kf('Sap Weaver',{role:'mender'}), d2=kf('Thorn Troll',{hp:100,maxHp:100}); arena([g2,d2],4); d2.hp=0; checkDeaths(); S.run.corpses[0].tried=true; S.run.corpses[0].result='exploded';
  ok(plan(g2,2).k!=='call','a burst body cannot rise'); const t0=T_('gcBane'); g2.hp=0; checkDeaths(); eq(T_('gcBane'),t0+1,'killed before it called');
});
test('Kits: Pack hunter and Frenzy grow; a Bomber bursts on your front row unless frozen or reaped; Thorned bites melee back',()=>{
  fresh(20); const p=kf('Tunnel Rat',{role:'striker'}), o1=kf('Grave Beetle'), o2=kf('Marrow Mite',{role:'mender'}); arena([p,o1,o2],0);
  near(kitAtk(p),1+2*KIT_PACK,1e-9); o2.hp=0; near(kitAtk(p),1+KIT_PACK,1e-9);
  fresh(20); const f=kf('Crypt Ghoul',{role:'striker'}), v=kf('Skeleton Guard',{hp:10}); arena([f,v],1); v.hp=0; checkDeaths(); eq(f.fz,1); near(kitAtk(f),1+KIT_FRENZY,1e-9);
  fresh(20); const bm=kf('Tallow Chandler',{atk:200}); arena([bm,kf('Grave Beetle')],0); const m=mkMinion({lvl:30,role:'vanguard'}), bk=mkMinion({lvl:30,role:'mender'}); m.hp=m.maxHp; const h=m.hp, hb=bk.hp;
  bm.hp=0; checkDeaths(); ok(m.hp<h,'the front row burns'); eq(bk.hp,hb,'the back row does not');
  fresh(20); const bm2=kf('Tallow Chandler',{atk:200}); arena([bm2,kf('Grave Beetle')],0); const m2=mkMinion({lvl:30,role:'vanguard'}); const h2=m2.hp, d0=T_('defused');
  bm2.stun=1; hurtFoe(bm2,2e6); eq(bm2.cd,'preserved'); checkDeaths(); eq(m2.hp,h2,'frozen: no burst'); eq(T_('defused'),d0+1);
  fresh(20); const th=kf('Thorn Troll'); arena([th],4); const mv=mkMinion({lvl:30,role:'vanguard'}), ms=mkMinion({lvl:30,role:'striker'}); const hv=mv.hp, hs=ms.hp;
  ok(/thorns bite back/.test(kitReflect(th,mv,1000))); ok(hv>mv.hp&&hv-mv.hp<=Math.round(1000*KIT_THORN),'up to 15% back'); eq(kitReflect(th,ms,1000),'','strikers are safe'); eq(ms.hp,hs);
});
test('Kits: Bulwark stance braces every other turn (a Sundered foe cannot); a Skirmisher steps back; a Hexer hexes; no kit doubles an affix',()=>{
  fresh(20); const s=kf('Grave Beetle'); arena([s],0); const n=kitNum(s);
  S.run.turn=(2-n%2)%2+2; ok(stanceOn(s),'braced on its turn'); eq(kitTaken(s,1000),500); S.run.turn++; ok(!stanceOn(s)); eq(kitTaken(s,1000),1000,'open the next');
  S.run.turn--; addSt(s,'sundered',2); ok(!stanceOn(s),'Sundered: no stance');
  fresh(20); const k=kf('Ember Herald',{role:'vanguard',hp:1000,maxHp:1000}); arena([k,kf('Throne Guard')],5); eq(rowOf(k),'f'); hurtFoe(k,10,'frost'); eq(rowOf(k),'f');
  k.hp=600; hurtFoe(k,200,'frost'); ok(k.back); eq(rowOf(k),'b','below half: the back row');
  fresh(20); const hx=kf('Tide Acolyte',{role:'mender'}); arena([hx],1); fix(0); foeOnHit(hx,S.player); ok(hasSt(S.player,'hexed'));
  for(let i=0;i<40;i++){ const e=kf('Tide Acolyte'); giveAffixes(e,2); ok(!e.aff.includes('hexing'),'a Hexer is never also Hexing'); const s2=kf('Skeleton Guard'); giveAffixes(s2,2); ok(!s2.aff.includes('shielded')); }
});
test('Kits: a Marker\'s mark draws every blow that can reach it next turn; Taunt overrides; a Purifier cleanses a stacked foe',()=>{
  fresh(20); const mk=kf('Tooth Collector',{role:'striker'}), s=kf('Nave Stalker',{role:'striker'}); arena([mk,s],3); const a=mkMinion({lvl:10,role:'striker'}), b=mkMinion({lvl:20,role:'vanguard'});
  const it=plan(mk,1); eq(it.k,'mark'); eq(it.t,fxKey(b),'the sturdiest minion'); S.run.turn=1; kitAct(mk,it); eq(S.run.mk.turn,2);
  s.ambU=1; for(let i=0;i<10;i++){ const j=plan(s,2); eq(j.t,fxKey(b),'drawn to the mark'); ok(j.mk); }
  S.run.taunt=2; const j2=plan(s,2); ok(!j2.mk,'Taunt overrides the mark'); S.run.taunt=0;
  fresh(20); const pu=kf('Marrow Mite',{role:'mender'}), o=kf('Grave Beetle'); arena([pu,o],0); addSt(o,'sundered',2); addDot(o,'poison',50,3);
  const c=plan(pu,1); eq(c.k,'cleanse'); eq(c.t,o.id); kitAct(pu,c); ok(!o.dots&&!o.st,'cleansed');
});
test('Kits: a Burrower goes under every third turn, out of reach of single blows, and surfaces 50% harder; Corpse Explosion still finds it',()=>{
  fresh(30); const bw=kf('Coffin Crawler',{role:'striker'}), o=kf('Skeleton Guard'); arena([bw,o],1); S.run.target=bw.id;
  eq(plan(bw,3).k,'burrow'); S.run.turn=3; kitAct(bw,bw.it); ok(bw.burrow); eq(currentTarget(),o,'your target moves to a foe in reach'); setTarget(bw.id); eq(S.run.target,o.id,'cannot pick it');
  const s=plan(bw,4); ok(s.sf); near(kitAtk(bw,s),KIT_SURFACE,1e-9);
  S.player.skills.blast=1; S.player.mana=500; S.run.corpses=[corpse()]; const h=bw.hp; fix(.5); act('sk:blast'); ok(bw.hp<h,'room-wide damage reaches it');
});
test('Kits: the card shows "Kit ?" until the kind is studied, then the kit and its rule; Known adds its state; Ledgered the answer; intents read the kit',()=>{
  fresh(20); const s=kf('Grave Beetle'); arena([s],0); S.kills={};
  ok(/Kit \?/.test(kitChip(s)),'unknown: '+kitChip(s)); S.kills['Grave Beetle']=KNOW_AT; ok(kitChip(s).includes('Bulwark stance')&&kitChip(s).includes(KITS.stance.rule.slice(0,20)),'studied: '+kitChip(s));
  const tiers=MASTERY.map(t=>t.at); S.kills['Grave Beetle']=tiers[1]; ok(/Braced|Open this turn/.test(kitChip(s)),'Known: its state');
  S.kills['Grave Beetle']=tiers[tiers.length-1]; ok(kitChip(s).includes('Answer: '+KITS.stance.ans),'ledgered: '+kitChip(s));
  const t=kf('Tannery Brute'); S.run.enemies.push(t); s.hp=1; plan(t,2); ok(/Shields/.test(planTxt(t,t.it).txt),'intent: '+JSON.stringify(t.it)+planTxt(t,t.it).txt);
  const h=renderAll('battle'); ok(h.includes('class="kit'),'on the card');
  KIT_IDS.forEach(k=>ok(trText(KITS[k].name)!==KITS[k].name,'Turkish name '+k)); ok(trText('Kit ?')!=='Kit ?','tr kit');
  ok(CODEX.some(c=>c[0]==='kits')); const c=codexSection('kits'); KIT_IDS.forEach(k=>ok(c.includes(KITS[k].name)));
});
test('Undone: a weakness kill leaves an Undone body that rises with the trait and an echo of its kind\'s kit',()=>{
  fresh(30); const e=kf('Tunnel Rat',{hp:100,maxHp:100}); arena([e,kf('Grave Beetle')],0);   /* the Rat Warren is weak to fire */
  hurtFoe(e,500,'fire'); eq(e.cd,'undone'); checkDeaths(); const c=S.run.corpses.find(x=>x.id==='c'+e.id); eq(c.cd,'undone'); eq(condRaise(c),CORPSE_CONDS.undone.raise);
  const e2=kf('Grave Beetle',{hp:100,maxHp:100}); S.run.enemies.push(e2); hurtFoe(e2,500,'phys'); ok(e2.cd!=='undone','no weakness, no Undone');
  ok(DEATH_TRAITS.includes('undone')&&TRAITS.undone);
  const m=mkMinion({lvl:20,kind:'Tunnel Rat',traits:['undone'],rankI:0}); eq(echoOf(m),'pack'); mkMinion({lvl:20,rankI:0}); mkMinion({lvl:20,rankI:0});
  near(echoDmg(m,null),1+ECHO.pack*2,1e-9);
  const b=mkMinion({lvl:20,kind:'Pyre Witch',traits:['undone'],role:'mender'}); near(echoDmg(m,null),(1+ECHO.pack*3)*(1+ECHO.banner),1e-9,'a Banner echo lifts the others');
  const w=mkMinion({lvl:20,kind:'Warren Bandit',traits:['undone']}); near(echoDmg(w,null)/(1+ECHO.banner),1+ECHO_PLAIN,1e-9,'no echo: +10%');
  const st=mkMinion({lvl:20,kind:'Grave Beetle',traits:['undone']}); S.run.turn=2; eq(echoDr(st,1000),700); S.run.turn=3; eq(echoDr(st,1000),1000);
  const gc=mkMinion({lvl:20,kind:'Drowned Priest',traits:['undone']}); const v=mkMinion({lvl:20}); v.hp=0; ok(echoCall(v)); eq(v.hp,Math.round(v.maxHp*ECHO.call)); v.hp=0; ok(!echoCall(v),'once a room');
  ok(/Echo: /.test(renderAll('battle')),'the minion card names its echo (the small card in its title)'); ok(trText('Undone')!=='Undone');
});
test('Sweep: offered on an outgrown, Normal, uncursed gate cleared 5 times; pays the run at 80% kill XP; a secret master stops it',()=>{
  fresh(); setLvl(40); S.ti=S.ti||{}; S.ti.clr={0:1}; S.watches=WATCHES; ok(!sweepOk(0),'not cleared often enough'); S.ti.clrN0=SWEEP_CLEARS; S.mod={day:S.day,gi:-1,id:null}; ok(sweepOk(0));
  S.heat={0:1}; ok(!sweepOk(0),'Normal only'); S.heat={}; setLvl(gateRec(0)+SWEEP_LV-1); ok(!sweepOk(0),'not far enough above'); setLvl(40);
  ui.tab='gates'; ok(/data-a="sweep" data-k="0"/.test(renderAll('gates')),'the gate card offers it');
  const w0=S.watches, xp0=S.player.xp, k0=S.quest.kills, sw0=T_('sweeps'); secretRoll=()=>false;
  ok(sweep(0)); eq(S.watches,w0-1,'one watch'); eq(S.mode,'raise'); ok(S.run.cleared&&S.run.sweep); ok(S.run.kills>0); ok(S.quest.kills>k0,'quest progress'); eq(S.run.corpses.length,0,'nothing to raise'); eq(T_('sweeps'),sw0+1);
  ok(/Swept/.test(renderAll('swept'))); returnTown(); ok(!(S.rec&&S.rec.fast&&S.rec.fast[0]),'no fastest-clear record');
  const e=kf('Tunnel Rat',{lvl:10,rankI:0}); S.run={sweep:1}; const a=killXp(e); S.run={}; const b=killXp(e); S.run=null; near(a/b,SWEEP_XP,.02,'80% kill XP');
  fresh(); setLvl(40); S.ti={clr:{0:1},clrN0:SWEEP_CLEARS}; S.mod={day:S.day,gi:-1,id:null}; S.watches=WATCHES; secretRoll=()=>true; ok(sweep(0)); eq(S.mode,'battle','stopped at the master'); ok(S.run.enemies.some(x=>x.secret)); ok(!S.run.sweep,'fought as usual');
  ok(trText('Sweep')!=='Sweep');
});

})();
