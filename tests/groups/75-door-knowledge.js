// The Ledger reads the doors: rooms rolled with the doors (r.pre), what a door shows by how well you know the gate
// (src/game-gate-rules.js preRooms, doorSight, doorBoss; src/game-runs.js buildRoom, spawnRoom; src/ui-screens.js doorLore).
(function(){
const {test,ok,eq,near,seed,fresh,foe,arena,renderAll}=window.LOTD_T;
const kills=(name,n)=>{ S.kills=S.kills||{}; S.kills[name]=n; };
const mobs=di=>DUNGEONS[di].mobs.map(m=>m[0]);
function won(room,doors){ fresh(); arena([foe({hp:0,dead:true})]); S.run.room=room; roomWon(); if(doors){ S.run.doors=doors; preRooms(S.run); } return S.run; }
const doorHtml=k=>{ const h=renderAll('doors'), i=h.indexOf('data-k="'+k+'"'); ok(i>=0,'door '+k+' drawn'); return h.slice(i,h.indexOf('</button>',i)); };
const sig=L=>JSON.stringify(L.map(e=>[e.name,e.base,e.role,e.lvl,e.elite,e.aff||null,e.maxHp,e.atk]));

test('Door knowledge: the room behind a fight or elite door is rolled with the doors and is what spawns',()=>{
  for(let s=1;s<=30;s++){ seed(s); const r=won(s%2); ok(r.pre&&r.pre.fight,'a fight door has its room');
    for(const k of r.doors.slice()){ if(k!=='fight'&&k!=='elite'){ ok(!(S.run.pre[k]),'no room behind '+k); continue; }
      const want=sig(S.run.pre[k]), keep=JSON.stringify(S); ok(descend(k)); eq(sig(S.run.enemies),want,'door '+k+' seed '+s); eq(S.run.pre,null,'cleared on entry'); S=JSON.parse(keep); } }
  const b=won(2); eq(b.doors.join(),'boss'); eq(b.pre,null,'nothing pre-rolled for the boss');
  const q=won(1,['fight','rest']); ok(descend('rest')); eq(q.doors.join(),'boss'); eq(q.pre,null,'a rest room rolls doors and rooms again');
});
test('Door knowledge: the odds of pre-rolled rooms are unchanged (sample)',()=>{
  seed(77); let foes=0, el=0, n2=0, cnt=0;
  for(let i=0;i<400;i++){ const r=won(1,['fight','elite']); const L=r.pre.fight; foes+=L.length; el+=L.filter(e=>e.elite).length; n2+=L.length; cnt++;
    const E=r.pre.elite; ok(E.every(e=>e.lvl===RK[0].lv+1),'room 2 level'); }
  near(n2/cnt,3.5,.12,'room 3 holds 3 or 4 foes'); near(el/foes,eliteChance(),.03,'elite share');
  won(0); seed(8); const a=buildRoom(1,'fight'); seed(8); const b=buildRoom(1,'elite'); a.forEach((e,i)=>eq(b[i].maxHp,Math.round(e.maxHp*ELITE_ROOM),'elite door +25% HP'));
});
test('Door knowledge: unstudied shows only the old text; Studied names foes, elite and affix; Known adds rows and levels',()=>{
  seed(5); const r=won(0,['fight','elite']); const ms=mobs(0); ms.forEach(m=>kills(m,0));
  let h=doorHtml('fight'); ok(!h.includes('class="dl"'),'nothing when unstudied'); ok(h.includes(DOORS.fight.desc));
  kills(ms[0],25); h=doorHtml('fight'); ok(!h.includes('class="dl"'),'one kind is not most'); eq(doorSight(0),0);
  kills(ms[1],30); eq(doorSight(0),1); const e=r.pre.fight[0]; Object.assign(e,{elite:true,name:'Frenzied '+e.base,aff:['shielded']});
  h=doorHtml('fight'); ok(h.includes('Behind it')); r.pre.fight.forEach(x=>ok(h.includes(x.name),'names '+x.name)); ok(h.includes('class="df el"')&&h.includes('Shielded'),'elite and affix');
  ok(!/<small>Lv \d+<\/small>/.test(h)&&!h.includes('<small>Front</small>')&&!h.includes('<small>Back</small>'),'no rows or levels yet');
  ok(doorHtml('elite').includes(r.pre.elite[0].name),'the elite door too');
  kills(ms[0],75); eq(doorSight(0),1,'one Known is not most'); kills(ms[1],75); eq(doorSight(0),2); h=doorHtml('fight');
  r.pre.fight.forEach(x=>ok(h.includes('<small>Lv '+x.lvl+'</small>'),'level')); ok(h.includes('<small>'+(rowOf(e)==='f'?'Front':'Back')+'</small>'),'row'); ok(h.includes('title="Elite &middot; Shielded &middot; '),'tooltip detail');
  won(1,['fight','rest']); ok(!doorHtml('rest').includes('class="dl"'),'rest doors unchanged');
});
test('Door knowledge: the boss door names the signature move and its answer once the master is Ledgered',()=>{
  const r=won(2); const B=DUNGEONS[0].boss[0]; kills(B,34); ok(!doorHtml('boss').includes('class="dl"'),'Mastered is not enough'); eq(doorBoss(0),null);
  kills(B,35); const h=doorHtml('boss'); ok(h.includes('Call the Swarm')&&h.includes('At most '+SUMMON_CAP+' answer it in one fight'),h);
  kills(DUNGEONS[2].boss[0],35); const c=doorBoss(2); eq(c.name,'Cinder Wave · Burning Ground · Ember Lance'); ok(c.tip.includes('Cinder Wave: Ward or freeze it')&&c.tip.includes('Hazard: Smoke'),c.tip);
  kills(DUNGEONS[3].boss[0],35); ok(doorBoss(3).tip.startsWith('Hymn of Silence: Freeze it or Focus-crit it'));
  BOSS_KITS_ON=false; eq(doorBoss(2).name,'Cinder Wave','the single move with the kits off'); eq(doorBoss(2).tip,'Ward or freeze it'); BOSS_KITS_ON=true;
  for(let di=0;di<DUNGEONS.length;di++){ kills(DUNGEONS[di].boss[0],35); const d=doorBoss(di); ok(d&&d.name&&d.tip,'gate '+di); }
});
test('Door knowledge: saving with pre-rolled doors works, a load ends the run as before, and a run without them still spawns',()=>{
  seed(11); const r=won(0,['fight','elite']); ok(r.pre.elite.length>0); save(); ok(JSON.parse(localStorage.getItem(SAVE_KEY)).run==null,'a save holds no run'); S=null; loadGame();
  eq(S.mode,'town'); eq(S.run,null,'a load ends the run, as before'); S.watches=WATCHES; startRun(0); eq(S.mode,'battle'); ok(S.run.enemies.length>0);
  const o=won(0); delete o.pre; ok(descend('fight'),'a run without pre-rolled rooms still spawns'); ok(S.run.enemies.length>0);
});
test('Door knowledge: drawing the doors uses no randomness and changes no state; Turkish',()=>{
  seed(4); const r=won(0,['fight','elite','rest']); mobs(0).forEach(m=>kills(m,80)); const keep=JSON.stringify(S), R=Math.random;
  Math.random=()=>{ throw new Error('random while drawing doors'); }; let h; try{ h=doorsHTML(); } finally { Math.random=R; }
  ok(h.includes('Behind it')); eq(JSON.stringify(S),keep,'state untouched');
  won(2); kills(DUNGEONS[0].boss[0],35); const k2=JSON.stringify(S); Math.random=()=>{ throw new Error('random while drawing the boss door'); }; try{ h=doorsHTML(); } finally { Math.random=R; }
  ok(h.includes('Call the Swarm')); eq(JSON.stringify(S),k2,'state untouched at the boss door');
  VIEW.lang='tr'; try{ eq(trText('Behind it'),'Ardında'); for(const x of ['Front','Back','Lv 7','Shielded, Vampiric','Ward or freeze it']) ok(trText(x)!==x,'Turkish: '+x);
    eq(trText('Elite · Shielded · Front row · Lv 7'),'Seçkin · Kalkanlı · Ön sıra · Sv 7');
    for(const s of Object.values(DOOR_TIP)) ok(trText(s)!==s,'Turkish: '+s);
  } finally { VIEW.lang='en'; }
});
test('Door knowledge: the Codex explains it, in Turkish too',()=>{ fresh(); const cx=codexSection('basics').replace(/&#39;/g,"'"), m=cx.match(/The doors between rooms read the same way[^<]*/); ok(m,'Codex line'); VIEW.lang='tr'; try{ ok(trText(m[0])!==m[0],'Turkish'); } finally { VIEW.lang='en'; } });
})();
