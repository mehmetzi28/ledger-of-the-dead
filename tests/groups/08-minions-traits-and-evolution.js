// Minions, Traits And Evolution tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Minions: Thick-boned adds 25% HP, Vicious 20% attack',()=>{
  setLvl(40); const o={lvl:40,rankI:5}, a=mkMinion(o), b=mkMinion(Object.assign({traits:['thick']},o)), c=mkMinion(Object.assign({traits:['vicious']},o));
  near(b.maxHp/a.maxHp,1.25,.02); near(c.atk/a.atk,1.2,.03); eq(c.maxHp,a.maxHp);
});
test('Minions: Will, minion power gear and Grave Pact make minions stronger',()=>{
  const a=mkMinion({lvl:10}); const h=a.maxHp; S.player.stats.will=20; syncMinion(a); ok(a.maxHp>h);
  const h2=a.maxHp; S.player.skills.gravepact=3; syncMinion(a); near(a.maxHp/h2,1.18,.02); const h3=a.maxHp; wear('0-tc'); syncMinion(a); ok(a.maxHp>h3);
});
test('Minions: Stalwart and Swarmguard cut damage taken',()=>{
  arena([foe()]); const a=mkMinion({traits:['stalwart']}); a.hp=a.maxHp=1000; hurtAlly(a,100); eq(a.hp,920);
  const b=mkMinion({}); b.hp=b.maxHp=1000; wear('w4'); hurtAlly(b,100); eq(b.hp,925);
});
test('Minions: Leeching heals, Frenzied can strike twice',()=>{
  const t=foe({hp:1e6}); arena([t]); const m=mkMinion({traits:['leech','frenzied']}); m.atk=100; m.hp=10; m.maxHp=1000;
  seq([.5,.9,.5,.5,.1,.5]); act('strike'); ok(m.hp>10,'leech healed'); const d=H(100*dmgMul()); ok(1e6-t.hp>=H(pAtk()*dmgMul())+d,'minion hit');
});
test('Minions: downed minions shatter or bind back; Grave-bound and Bone Bank never shatter',()=>{
  arena([foe({hp:0,dead:true})]); fix(0); const a=mkMinion({}), b=mkMinion({traits:['gravebound']}); a.hp=0; b.hp=0;
  roomWon(); ok(!S.army.includes(a),'shattered'); ok(S.army.includes(b)); eq(b.hp,Math.ceil(b.maxHp*.4));
  S.mode='battle'; const c=mkMinion({}); c.hp=0; wear('u0'); roomWon(); ok(S.army.includes(c),'Bone Bank kept it');
});
test('Minions: shattered gear-bearers drop their gear into the bag',()=>{
  arena([foe({hp:0,dead:true})]); fix(0); const m=mkMinion({armed:true,eq:{weapon:{u:++S.uid,id:'0-wa'},armor:null,relic:null}}); m.hp=0; roomWon();
  ok(S.inv.some(it=>it.id==='0-wa'));
});
test('Minions: evolve at +5, +10, +18 and +28 levels, each stage with its own buff and a trait',()=>{
  setLvl(30); const m=mkMinion({lvl:1}); const h=m.maxHp; m.lvl=6; checkEvolve(m); syncMinion(m); eq(m.stage,1); eq(m.traits.length,1); eq(mName(m),'Greater Tunnel Rat'); eq(S.ti.evolved,1);
  m.lvl=11; checkEvolve(m); eq(m.stage,2); eq(m.traits.length,2); eq(S.ti.elder,1); m.lvl=18; checkEvolve(m); eq(m.stage,2,'not Ancient before +18'); m.lvl=19; checkEvolve(m); eq(m.stage,3); eq(S.ti.ancient,1); eq(mName(m),'Ancient Tunnel Rat');
  m.lvl=60; checkEvolve(m); eq(m.stage,4,'Eternal is the last stage'); eq(S.ti.eternal,1); eq(m.traits.length,4);
  const p=mkMinion({lvl:30,rankI:5}), q=mkMinion({lvl:30,rankI:5,stage:2}), g=mkMinion({lvl:30,rankI:5,stage:1});
  near(g.maxHp/p.maxHp,1.2,.01,'Greater HP'); near(g.atk/p.atk,1.1,.02,'Greater attack'); near(q.maxHp/p.maxHp,1.3,.01,'Elder HP'); near(q.atk/p.atk,1.3,.02,'Elder attack');
  const e=mkMinion({lvl:30,rankI:5,stage:4}); near(e.maxHp/p.maxHp,1.65,.01,'Eternal HP'); ok(/Greater \+20% HP, \+10% ATK; Elder/.test(minionDetail(q)),'buffs listed by stage'); ok(/Base stats/.test(minionDetail(q)));
});
test('Minions: evolving through XP or the Bone Altar works too',()=>{ setLvl(30); const m=mkMinion({lvl:1}); minionXp(m,1e5); eq(m.stage,4); const k=mkMinion({lvl:1}); S.gold=1e6; for(let i=0;i<5;i++) empower(k.uid); eq(k.stage,1); });
test('Minions: names read naturally',()=>{
  eq(mName({name:'The Rat King',stage:2}),'The Elder Rat King'); eq(mName({name:'Crypt Ghoul',stage:1}),'Greater Crypt Ghoul'); eq(mName({name:'Imp'}),'Imp');
  eq(withArticle('Elder Imp'),'an Elder Imp'); eq(withArticle('Greater Imp'),'a Greater Imp'); eq(withArticle('The Elder Rat King'),'The Elder Rat King'); eq(theName('Imp'),'the Imp'); eq(theName('The Rat King'),'The Rat King');
});
test('Minions: releasing returns gear; trait rolls never repeat',()=>{
  const m=mkMinion({armed:true,eq:{weapon:{u:++S.uid,id:'0-wa'},armor:{u:++S.uid,id:'0-aa'},relic:null}}); release(m.uid); eq(S.army.length,0); eq(S.inv.length,2);
  const have=[]; let t; while((t=rollTrait(have))) have.push(t); eq(have.length,TRAIT_IDS.length); eq(new Set(have).size,have.length);
});

})();
