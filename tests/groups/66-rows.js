// Front and back rows: defaults, the melee reach rule both ways, Taunt, row switching and saves, the battle and Army tab display,
// the Codex section and Turkish (src/game-gate-rules.js ROWS, src/game-runs.js act, src/ui-screens.js).
(function(){
const {test,ok,eq,near,fix,fresh,foe,arena,mkMinion,seed,renderAll,cdx}=window.LOTD_T;

test('Rows: vanguards and reapers stand in front, strikers, menders and you at the back; bosses in front',()=>{
  fresh(); const m=r=>mkMinion({role:r});
  eq(rowOf(S.player),'b'); eq(rowOf(m('vanguard')),'f'); eq(rowOf(m('reaper')),'f'); eq(rowOf(m('striker')),'b'); eq(rowOf(m('mender')),'b');
  eq(rowOf(foe({role:'vanguard'})),'f'); eq(rowOf(foe({role:'reaper'})),'f'); eq(rowOf(foe({role:'striker'})),'b'); eq(rowOf(foe({role:'mender'})),'b'); eq(rowOf(foe({role:'striker',boss:true})),'f');
  const s=m('striker'); s.row='f'; eq(rowOf(s),'f','a chosen row wins');
});
test('Rows: foe melee strikes only the front row while it stands; ranged foes and bosses reach anyone',()=>{
  fresh(); const a=foe({hp:1e6}); arena([a]); const v=mkMinion({role:'vanguard'}), st=mkMinion({role:'striker'}); seed(11);
  for(let i=0;i<300;i++){ delete a.it; rollIntent(a); if(a.it.t!==fxKey(v)) throw new Error('a melee foe planned to hit '+a.it.t); }
  a.it={k:'atk',t:'p'}; ok(!intentOk(a),'a plan on the back row is rolled again'); planFoes(); eq(a.it.t,fxKey(v));
  a.role='striker'; const seen=new Set(); for(let i=0;i<300;i++){ delete a.it; rollIntent(a); seen.add(a.it.t); } ok(seen.has('p')&&seen.has(fxKey(st)),'a striker reaches the back row');
  a.role='vanguard'; a.boss=true; const sb=new Set(); for(let i=0;i<300;i++){ delete a.it; rollIntent(a); sb.add(a.it.t); } ok(sb.has('p'),'a boss reaches every row'); a.boss=false;
  a.role='vanguard'; v.hp=0; const s2=new Set(); for(let i=0;i<300;i++){ delete a.it; rollIntent(a); s2.add(a.it.t); } ok(s2.has('p'),'with the front row down, melee reaches you');
});
test('Rows: the foe phase does what the intent says, and a vanguard moved back is not a front row',()=>{
  fresh(); const a=foe({hp:1e6,atk:20}); arena([a]); const v=mkMinion({role:'vanguard'}); v.maxHp=v.hp=1e6; S.player.hp=S.player.maxHp=pMax(); seed(4);
  for(let i=0;i<30;i++){ const hp=S.player.hp; act('strike'); eq(S.player.hp,hp,'turn '+i+': you are behind the front row'); }
  v.row='b'; let hit=false; for(let i=0;i<30&&!hit;i++){ const hp=S.player.hp; act('strike'); if(S.player.hp<hp) hit=true; } ok(hit,'nobody in front: you can be hit');
});
test('Rows: Taunt pulls melee onto your vanguards even in the back row',()=>{
  fresh(); const a=foe({hp:1e6}); arena([a]); const v=mkMinion({role:'vanguard'}); v.row='b'; mkMinion({role:'reaper'}); S.run.taunt=2; seed(9);
  for(let i=0;i<200;i++){ delete a.it; rollIntent(a); if(a.it.t!==fxKey(v)) throw new Error('Taunt lost a blow to '+a.it.t); }
});
test('Rows: your melee hits the foe front row, strikers and your Strike reach the back',()=>{
  fresh(); const f=foe({name:'Front Foe',hp:1e6,role:'vanguard'}), b=foe({name:'Back Foe',hp:1e6,role:'mender'}); arena([f,b]); setTarget(b.id);
  const v=mkMinion({role:'vanguard'}), s=mkMinion({role:'striker'}); seed(2); act('strike'); const L=S.run.log.map(l=>l.m).join('|');
  ok(L.includes(v.nick+' hits Front Foe'),'vanguard hits the front: '+L); ok(L.includes(s.nick+' hits Back Foe'),'striker reaches the back'); ok(/You strike Back Foe/.test(L),'you hit whom you choose');
  f.hp=0; S.run.log=[]; act('strike'); ok(S.run.log.some(l=>l.m.startsWith(v.nick+' hits Back Foe')),'front row down: melee reaches the back');
});
test('Rows: a vanguard or reaper in the back row strikes for half damage; strikers lose nothing',()=>{
  fresh(); const v=mkMinion({role:'vanguard'}), s=mkMinion({role:'striker'}); eq(rowK(v),1); eq(rowK(s),1);
  v.row='b'; eq(rowK(v),BACK_MELEE); eq(BACK_MELEE,.5); s.row='f'; eq(rowK(s),1,'a striker in front keeps full damage');
  const run=row=>{ fresh(); const f=foe({name:'Dummy',hp:1e7,atk:0}); arena([f]); const m=mkMinion({role:'vanguard'}); m.atk=1000; m.row=row; seed(5); const h=f.hp; S.player.atk=0; act('strike'); return h-f.hp; };
  const front=run('f'), back=run('b'); ok(back<front*.7&&back>front*.3,'back '+back+' vs front '+front);
});
test('Rows: switched out of battle only, saved on the minion, junk repaired on load',()=>{
  fresh(); const v=mkMinion({role:'vanguard'}); S.mode='town'; ACTIONS.mrow(String(v.uid)); eq(v.row,'b'); ACTIONS.mrow(String(v.uid)); eq(v.row,'f');
  arena([foe()]); ACTIONS.mrow(String(v.uid)); eq(v.row,'f','no switching mid-fight');
  S.mode='town'; S.run=null; v.row='b'; const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.army[0].row,'b','kept');
  const j=JSON.parse(JSON.stringify(S)); j.army[0].row='side'; eq(normalizeSave(j).army[0].row,undefined,'junk dropped: the role decides');
});
test('Rows: battle shows Front and Back, the Army tab toggles them, the Codex explains, all in Turkish too',()=>{
  fresh(); const v=mkMinion({role:'vanguard'}); mkMinion({role:'striker'}); arena([foe({role:'vanguard'}),foe({role:'striker'})]);
  let h=renderAll('battle'); eq((h.match(/class="row-l"/g)||[]).length,4,'two rows a side'); ok(h.indexOf('>Front<')<h.indexOf('>Back<')); ok(!/data-a="mrow"/.test(h),'no switch in battle');
  S.mode='town'; S.run=null; ui.tab='army'; h=renderAll('army'); ok(new RegExp('data-a="mrow" data-k="'+v.uid+'"').test(h)&&/Front row/.test(h)&&/Back row/.test(h));
  VIEW.army='compact'; ok(/data-a="mrow"[^>]*>Front</.test(renderAll('compact'))); VIEW.army='cards';
  ok(/Rows/.test(cdx('roles'))&&/What ignores rows/.test(cdx('roles')));
  try{ VIEW.lang='tr'; ['Front','Back','Front row','Back row','Move to back','Move to front','Rows','Melee','Reach','Back-row melee','What ignores rows'].forEach(t=>ok(trText(t)!==t,'untranslated: '+t));
    ok(trText('Vanguard · Front row')==='Öncü · Ön sıra','a card tag');
    const nodes=codexSection('roles').replace(/<[^>]+>/g,'|').split('|').map(x=>x.replace(/&#39;/g,"'")).filter(x=>/Rows|row|Taunt pulls/.test(x)); ok(nodes.length>=4); nodes.forEach(x=>ok(trText(x)!==x,'untranslated: '+x)); } finally { VIEW.lang='en'; }
});
test('Rows: Shield-bearer: once per room a front-row vanguard takes the hit that would kill you, at SB_TAKE of it',()=>{
  fresh(); const a=foe({name:'Grim Biter',hp:1e6,atk:50,role:'striker'}); arena([a]); const v=mkMinion({role:'vanguard'}); v.maxHp=v.hp=1e6; const P=S.player; P.hp=1; P.shield=0; fix(.99);
  a.it={k:'atk',t:'p'}; act('strike'); eq(S.mode,'battle','saved'); eq(P.hp,1); ok(v.hp<v.maxHp,'the vanguard took it'); eq(S.run.sb,S.run.room);
  ok(S.run.log.some(l=>/^Shield-bearer: .+ steps in front of you and takes Grim Biter's killing blow\.$/.test(l.m)),'logged');
  ok(trText('Shield-bearer: Bonehound steps in front of you and takes Grim Biter\'s killing blow.').startsWith('Kalkan taşıyıcı'),'Turkish');
  const d=v.maxHp-v.hp; v.row='b'; P.stats.constitution=300; P.hp=pMax(); const h=P.hp; a.it={k:'atk',t:'p'}; act('strike'); near(d*(1-pDr()/100)/(h-P.hp),SB_TAKE,.05,'at SB_TAKE of the blow (yours after your damage reduction)');
  v.row='f'; P.hp=1; a.it={k:'atk',t:'p'}; act('strike'); eq(S.mode,'defeat','only once per room'); ok(S.run.felled.c.includes('sbspent'),'the recap says why');
  ok(cdx('roles').includes('Shield-bearer'),'the Codex rows section');
});
test('Rows: Shield-bearer needs a living front-row vanguard, lets survivable hits through, holds in sieges and comes back each room',()=>{
  const run=prep=>{ fresh(); const a=foe({hp:1e6,atk:50,role:'striker'}); arena([a]); const v=mkMinion({role:'vanguard'}); v.maxHp=v.hp=1e6; S.player.hp=1; S.player.shield=0; fix(.99); a.it={k:'atk',t:'p'}; prep(v,a); act('strike'); return v; };
  run(v=>{ v.row='b'; }); eq(S.mode,'defeat','a vanguard in the back row'); ok(S.run.felled.c.includes('sbrow'),'the recap says why');
  run(v=>{ v.hp=0; }); eq(S.mode,'defeat','a downed vanguard'); ok(!(S.run.felled.c||[]).includes('sbrow'));
  run(v=>{ v.role='reaper'; }); eq(S.mode,'defeat','only a vanguard');
  const v=run((v,a)=>{ a.atk=2; S.player.hp=pMax(); }); eq(S.run.sb,undefined,'a hit you survive is not taken'); eq(v.hp,v.maxHp);
  run(()=>{ S.run.siege=1; }); eq(S.mode,'battle','in a siege too: the wall is a front row as well');
  run(()=>{ S.run.sb=S.run.room; S.run.room++; }); eq(S.mode,'battle','ready again in the next room');
});
})();
