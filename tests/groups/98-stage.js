// What the fight shows, R17 PR A (src/fx-cues.js): typed hits, weak and resisted, kit glyphs, boss cues and threats, evolution looks.
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,give,renderAll,cdx,bossFight}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const spy=f=>{ const c=[]; FXL.spy=(k,key,o)=>c.push({k,key,o}); try{ f(); } finally { FXL.spy=null; } return c; };
test('Stage tables: every damage type, kit, boss move and evolution stage has its cue',()=>{
  for(const t of DT_IDS){ ok(DT_FX[t]&&/^#[0-9a-f]{6}$/.test(DT_FX[t].c)&&DT_FX[t].x===parseInt(DT_FX[t].c.slice(1),16)&&DT_FX[t].g.length,'type '+t); ok(/<polygon/.test(dtGlyph(t))); }
  const fx=new Set(DT_IDS.map(t=>DT_FX[t].fx)); eq(fx.size,5,'five different bursts');
  for(const k of KIT_IDS){ ok(KIT_FX[k]&&KIT_FX[k].g.every(p=>p.length>=6&&p.length%2===0&&p.every(v=>v>=0&&v<=10)),'kit '+k); ok(KIT_FX[k].m===null||['ward','dust','motes','mark','cleanse','step'].includes(KIT_FX[k].m)); }
  const poses=['lunge','rear','cast','call','guard'];
  for(const mv of Object.keys(BOSS_ABIL)){ const c=BOSS_CUE[mv]; ok(c&&poses.includes(c.pose)&&CUE_AT[c.at],'boss move '+mv); }
  for(const mv of Object.keys(BOSS_ABIL)) if(BOSS_ABIL[mv].warn) ok(!['foes','self'].includes(BOSS_CUE[mv].at),'a telegraphed move names its targets: '+mv);
  eq(STAGE_LOOK.length,STAGE_MAX+1); ok(!STAGE_LOOK[0]); for(let i=1;i<=STAGE_MAX;i++) ok(STAGE_LOOK[i].ol,'stage '+i);
});
test('Typed hits: the biggest hit\'s type, Weak and Resisted on the card, a burst queued; physical plain hits stay quiet',()=>{
  fresh(10); const e=foe({hp:5000,res:{frost:-.25,shad:.5}}); arena([e]);
  let c=spy(()=>hurtFoe(e,100,'frost')); const f=S.run.fx[e.id]; eq(f.ty,'frost'); eq(f.w,'weak'); ok(c.some(x=>x.k==='typed'&&x.o.ty==='frost'&&x.o.w===1),'a typed burst');
  c=spy(()=>hurtFoe(e,10,'shad')); eq(f.ty,'frost','the bigger hit keeps the colour'); eq(f.w,'weak','weak stays over resisted');
  S.run.fx={}; c=spy(()=>hurtFoe(e,50,'shad')); eq(S.run.fx[e.id].w,'res'); ok(c.some(x=>x.k==='typed'&&x.o.w===-1));
  S.run.fx={}; c=spy(()=>hurtFoe(e,50,'phys')); ok(!c.some(x=>x.k==='typed'),'plain physical'); ok(!S.run.fx[e.id].w);
  S.run.fx={}; hurtFoe(e,100,'frost'); S.mode='battle'; let h=renderAll('typed'); ok(/fx neg dt-frost wk/.test(h)&&h.includes(DT_FX.frost.c)&&/class="dtg"/.test(h)&&/>Weak</.test(h),'the card');
  S.run.fx={}; hurtFoe(e,100,'shad'); h=renderAll('resisted'); ok(/>Resisted</.test(h)&&/dt-shad/.test(h));
  const m=mkMinion({lvl:10}); S.run.fx={}; hurtAlly(m,5,'rot'); eq(S.run.fx[String(fxKey(m))].ty,'rot','our side too');
  S.run.fx={}; const e2=foe({hp:10}); S.run.enemies.push(e2); KILL='exec'; try{ hurtFoe(e2,50,'phys'); } finally{ KILL=null; } eq(S.run.fx[e2.id].x,1,'an execution is marked for the hit-stop');
});
test('Telegraphs: a gathering move marks the units it will land on; its own side and itself mark no one',()=>{
  fresh(20); const v=mkMinion({lvl:20,role:'vanguard',atk:5}), s=mkMinion({lvl:20,role:'striker',atk:50}), d=mkMinion({lvl:20,role:'mender',atk:1});
  const b=bossFight(0,20); syncArmy(); const K=u=>String(fxKey(u)), at=mv=>{ b.charging=true; b.move=mv; return threatKeys(b).sort().join(); };
  eq(at('decree'),'p'); eq(at('cinder'),['p',K(v),K(s),K(d)].sort().join(),'the whole side');
  eq(at('lance'),[S.player,...S.army].filter(u=>rowOf(u)==='b').map(K).sort().join(),'the back row'); ok(at('lance').includes('p'));
  eq(at('breath'),S.army.filter(u=>rowOf(u)==='f').map(K).sort().join(),'the front row');
  b.edictT=K(d); eq(at('edict'),K(d),'the minion the Edict names'); eq(at('lock'),K(strongestMinion()),'the strongest');
  eq(at('bonewall'),''); eq(at('heartwood'),''); b.charging=false; eq(threatKeys(b).length,0,'nothing gathers');
  s.lock=S.run.turn+3; b.charging=true; b.move='cinder'; ok(!threatKeys(b).includes(K(s)),'a locked minion cannot be hit'); delete s.lock;
  b.move='decree'; S.mode='battle'; const h=renderAll('threat'); ok(/unit[^"]*threat/.test(h)&&/>Threatened</.test(h)&&/Gathering against it: Royal Decree/.test(h),'the hero card'); ok(/pose-rear/.test(h),'the boss draws back');
  eq(threatMap().get('p').join(),'Royal Decree');
});
test('Cards: an intent that changes pulses for its turn, kit glyphs, the phase cue reaches the stage',()=>{
  fresh(10); const e=foe({hp:1000,atk:5,stun:1}); arena([e]); S.mode='battle';
  let h=renderAll('first'); ok(/class="intent i-frozen"/.test(h)&&!/i-chg/.test(h),'not on first sight'); h=renderAll('same'); ok(!/i-chg/.test(h));
  e.stun=0; e.abil='swarm'; e.abilT=1; h=renderAll('changed'); ok(/class="intent i-abil i-chg"/.test(h),'a changed intent pulses'); h=renderAll('again'); ok(/i-chg/.test(h),'all this turn');
  S.run.turn++; h=renderAll('next turn'); ok(!/i-chg/.test(h),'and stops next turn');
  const kf=foe({base:'Skeleton Guard',name:'Skeleton Guard',hp:100}); S.run.enemies.push(kf); S.bestiary=S.bestiary||{}; const c=kitChip(kf); if(knowLv(kf)>=1) ok(/class="ktg"/.test(c),'the kit glyph'); else ok(/Kit \?/.test(c));
  const b=bossFight(1,30); b.hp=Math.round(b.maxHp*.3); const calls=spy(()=>checkPhase()); if(b.phase2) ok(calls.some(x=>x.k==='phase'),'the phase cue');
  const m=mkMinion({lvl:10}); const ms=foe({hp:5,base:'Coffin Crawler',name:'Coffin Crawler'}); arena([ms]); const c2=spy(()=>kitAct(ms,{k:'burrow'})); ok(c2.some(x=>x.k==='kit'&&x.o.k==='burrow'),'a kit moment');
});
test('Evolution looks: outline, role glow, larger with motes, halo; the hero and foes stay as drawn; item frames',()=>{
  fresh(10); const base=ico('Tunnel Rat',0,{stage:0,role:'striker'}); ok(!/ st\d/.test(base)&&!/drop-shadow/.test(base));
  const l=s=>ico('Tunnel Rat',0,{stage:s,role:'mender'});
  ok(/ st1/.test(l(1))&&/drop-shadow\(0 0 1px/.test(l(1))&&!l(1).includes(ROLE_GLOW.mender),'Greater');
  ok(l(2).includes('drop-shadow(0 0 3px '+ROLE_GLOW.mender),'Elder glows in its role colour'); ok(/scale\(1\.1\)/.test(l(3))&&/class="motes"/.test(l(3))&&!/halo/.test(l(3)),'Ancient');
  ok(/class="halo"/.test(l(4)),'Eternal'); for(let s=0;s<=4;s++) ok(!/undefined|NaN/.test(l(s)));
  eq(ico('Necromancer',0,{stage:4}),ico('Necromancer',0,{}),'the hero');
  const m=mkMinion({lvl:30,stage:4,role:'vanguard'}); ui.tab='army'; ok(/class="halo"/.test(renderAll('army')),'on the Army tab');
  const uq=Object.values(ITEM).find(d=>d.uq); ok(/item[^"]*f-uq/.test(itemCard({id:uq.id,u:1})),'a unique frame');
  const any=Object.values(ITEM).find(d=>!d.uq&&!d.tower); ok(/f-hf/.test(itemCard({id:any.id,u:2,hf:'The Rat King'}))&&/f-rb/.test(itemCard({id:any.id,u:3,rb:{d:5,p:Object.keys(RB_POW)[0]}})));
});
test('Reduced view and Turkish',()=>{
  VIEW.calm=true; ok(fxQuiet()); VIEW.calm=false;
  const lines=['Weak','Resisted','Threatened','Gathering against it: Royal Decree','The Rat King · Second phase'];
  for(const s of lines) ok(tr(s)!==s,'Turkish: '+s);
  for(const k of ['types','bosses','traits']) ok(cdx(k).length>200);
});
})();
