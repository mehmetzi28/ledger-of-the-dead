// Bestiary mastery tests (MASTERY in src/game-data.js): tiers read from S.kills only. Helpers and the runner live in tests/game-tests.js.
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,renderAll,cdx}=window.LOTD_T;
const tierAt=(name,k)=>{ S.kills[name]=k; const t=masteryOf(name); return t?t.id:null; };

test('Mastery: tier boundaries for an ordinary foe and for bosses, wardens and secret masters',()=>{
  fresh(); const T=id=>MASTERY.find(t=>t.id===id);
  eq(T('studied').at,KNOW_AT); eq(T('known').at,75); eq(T('mastered').at,180); eq(T('ledgered').at,450); eq(T('known').bossAt,6); eq(T('mastered').bossAt,15); eq(T('ledgered').bossAt,35);
  eq(MASTERY.map(t=>t.raise).join(),'0,2,4,5'); eq(MASTERY.map(t=>t.dmg).join(),'0,0,3,4'); eq(MASTERY.map(t=>t.lv).join(),'0,0,0,1','a level only on Ledgered');
  eq(tierAt('Tunnel Rat',0),null); eq(tierAt('Tunnel Rat',24),null); eq(tierAt('Tunnel Rat',25),'studied'); eq(tierAt('Tunnel Rat',74),'studied');
  eq(tierAt('Tunnel Rat',75),'known'); eq(tierAt('Tunnel Rat',179),'known'); eq(tierAt('Tunnel Rat',180),'mastered'); eq(tierAt('Tunnel Rat',449),'mastered'); eq(tierAt('Tunnel Rat',450),'ledgered');
  for(const b of [DUNGEONS[0].boss[0],TW_BOSS[0],SECRET[0].name]){
    ok(bossKind(b),b+' is a boss kind');
    eq(tierAt(b,T('known').bossAt-1),null,b); eq(tierAt(b,T('known').bossAt),'known',b); eq(tierAt(b,T('mastered').bossAt),'mastered',b); eq(tierAt(b,T('ledgered').bossAt),'ledgered',b);
  }
  ok(!bossKind('Tunnel Rat')); eq(masteryNext('Tunnel Rat'),null,'complete at 450'); S.kills['Tunnel Rat']=80; eq(masteryNext('Tunnel Rat').t.id,'mastered');
  eq(masteryRaise('Tunnel Rat'),2); eq(masteryDmg('Tunnel Rat'),0); S.kills['Tunnel Rat']=180; eq(masteryRaise('Tunnel Rat'),4); eq(masteryDmg('Tunnel Rat'),3); eq(masteryLv('Tunnel Rat'),0);
  S.kills['Tunnel Rat']=450; eq(masteryLv('Tunnel Rat'),1); eq(masteryRaise('Tunnel Rat'),5); eq(masteryDmg('Tunnel Rat'),4); eq(masteryRaise('Nobody'),0);
});

test('Mastery: raise chance with and without mastery; the first-raise rule and the clamp still win',()=>{
  fresh(5); const c=corpse({lvl:5}); S.kills={};
  const base=raiseChance(c); ok(base>RAISE_MIN&&base+8<RAISE_MAX,'room to move: '+base);
  S.kills['Tunnel Rat']=75; eq(raiseChance(c),base+2); S.kills['Tunnel Rat']=180; eq(raiseChance(c),base+4); eq(saltChance(c),Math.min(SALT_CAP,base+4+SALT_BONUS));
  const el=corpse({lvl:5,elite:true,name:'Savage Tunnel Rat'}); S.kills['Tunnel Rat']=0; const eb=raiseChance(el); S.kills['Tunnel Rat']=180; eq(raiseChance(el),eb+4,'an elite body counts as its base kind');
  S.player.stats.will=200; eq(raiseChance(c),RAISE_MAX,'the clamp');
  S.player.stats.will=1; S.firstRaise=1; S.ti={}; eq(raiseChance(c),100,'the first raise always answers'); S.firstRaise=0;
});

test('Mastery: +3% damage from the player and from a minion on a Mastered kind, once',()=>{
  const strike=k=>{ fresh(10); S.army=[]; S.kills={'Tunnel Rat':k}; const e=foe({hp:100000}); arena([e]); setLvl(10); fix(.5); act('strike'); return 100000-e.hp; };
  const d0=strike(0), d1=strike(180), d2=strike(75); ok(d0>1); eq(d1,Math.round(d0*1.03)); eq(d2,d0,'Known gives no damage');
  const minion=k=>{ fresh(10); S.army=[]; mkMinion({lvl:10,role:'striker'}); S.kills={'Tunnel Rat':k}; const e=foe({hp:100000}); arena([e]); setLvl(10); fix(.5); act('ward'); return 100000-e.hp; };
  const m0=minion(0), m1=minion(450); ok(m0>1); eq(m1,Math.round(m0*1.04),'Ledgered: +4%');
  const el=k=>{ fresh(10); S.army=[]; S.kills={'Tunnel Rat':k}; const e=foe({hp:100000,elite:true,name:'Savage Tunnel Rat'}); arena([e]); setLvl(10); fix(.5); act('strike'); return 100000-e.hp; };
  eq(el(180),Math.round(el(0)*1.03),'elites count as their base kind');
});

test('Mastery: a Ledgered body rises one level higher, never past your level + 2',()=>{
  const rise=(k,lvl,pl)=>{ fresh(pl); S.army=[]; S.kills={'Tunnel Rat':k}; const c=corpse({lvl}); raiseScene([c],pl); S.player.mana=pMana(); fix(0); tryRaise(c.id); eq(c.result,'raised'); return S.army[S.army.length-1].lvl; };
  eq(rise(0,5,10),5); eq(rise(180,5,10),5,'Mastered: no level'); eq(rise(450,5,10),6); eq(rise(450,11,10),12); eq(rise(450,12,10),12,'capped at level + 2'); eq(rise(450,14,10),14,'never lowered');
});

test('Mastery: kills of an elite count for its base kind, and each new tier sends one notice',()=>{
  fresh(10); S.kills={'Tunnel Rat':74}; const e=foe({hp:1,elite:true,name:'Savage Tunnel Rat'}); arena([e,foe()]); setLvl(10); S.notices=[]; act('strike');
  eq(S.kills['Tunnel Rat'],75); ok(!S.kills['Savage Tunnel Rat']); ok(S.notices.some(n=>n.m==='Mastery: Tunnel Rat is now Known. +2% raise chance on its bodies.'),JSON.stringify(S.notices));
  S.notices=[]; S.kills['Tunnel Rat']=178; studyFoe('Tunnel Rat'); eq(S.notices.length,0); studyFoe('Tunnel Rat'); eq(S.notices.length,1); ok(/is now Mastered\. \+4% raise chance on its bodies, you and your minions deal \+3% damage to it\.$/.test(S.notices[0].m));
  S.notices=[]; S.kills['Tunnel Rat']=449; studyFoe('Tunnel Rat'); ok(/is now Ledgered\..*rise 1 level higher\.$/.test(S.notices[0].m)); studyFoe('Tunnel Rat'); eq(S.notices.length,1,'no repeat');
  S.notices=[]; S.kills['Tunnel Rat']=24; studyFoe('Tunnel Rat'); eq(S.notices.length,1); ok(/studied Tunnel Rat/.test(S.notices[0].m),'studying keeps its own notice');
  const B=DUNGEONS[0].boss[0]; S.notices=[]; S.kills[B]=5; studyFoe(B); ok(S.notices[0].m.startsWith('Mastery: '+B+' is now Known.'));
});

test('Mastery: the bestiary shows tier, kills, progress and what it gives; unmet kinds stay hidden',()=>{
  fresh(); S.kills={'Tunnel Rat':80}; ui.tab='bes'; let h=renderAll('bestiary mastery');
  ok(h.includes('Mastery: Known &middot; 80 kills &middot; 80/180 to Mastered')); ok(h.includes('+2% raise chance on its bodies.'));
  eq((h.match(/bes-mastery/g)||[]).length,1,'only the met kind'); ok(h.includes('???'));
  S.kills={'Tunnel Rat':450,'The Gate Hound':6}; h=renderAll('bestiary ledgered'); ok(h.includes('Mastery: Ledgered &middot; 450 kills &middot; Mastery complete')); ok(h.includes('and its bodies rise 1 level higher.'));
  ok(h.includes('Mastery: Known &middot; 6 kills &middot; 6/15 to Mastered'),'a warden uses the boss ladder');
  S.kills={'Tunnel Rat':3}; h=renderAll('bestiary none'); ok(h.includes('Mastery: None yet &middot; 3 kills &middot; 3/25 to Studied'));
});

test('Mastery: foe cards and bodies of a Mastered or Ledgered kind carry a small marker',()=>{
  fresh(10); S.kills={'Tunnel Rat':75}; arena([foe({hp:500})]); setLvl(10); let h=renderAll('battle known'); ok(!h.includes('class="mst'),'Known: no marker');
  S.kills['Tunnel Rat']=180; h=renderAll('battle mastered'); ok(/<span class="mst dim" title="Mastered in your bestiary: [^"]+">Mastered<\/span>/.test(h));
  raiseScene([corpse({lvl:3})],10); S.run.lastXp=0; S.kills['Tunnel Rat']=450; h=renderAll('raise ledgered'); ok(/class="mst dim" title="Ledgered in your bestiary: [^"]*rise 1 level higher">Ledgered</.test(h));
});

test('Mastery: the Codex explains it from the constants, and an old save without new fields keeps working',()=>{
  fresh(); const h=cdx('basics'); ok(h.includes('<p class="group-h">Mastery</p>')); ok(h.includes('180 kills (15 for bosses, Tower wardens and secret masters)')); ok(h.includes('mastery carries over'));
  fresh(); S.kills={'Tunnel Rat':150,'The Rat King':20}; save(); S=null; loadGame();
  eq(masteryOf('Tunnel Rat').id,'known','an old count under the new ladder just recomputes'); eq(masteryOf('The Rat King').id,'mastered');
  const g=normalizeSave({v:2,player:{lvl:5}}); ok(g); S=null; loadGame(); ok(masteryOf('Tunnel Rat'));
});

test('Mastery: every new string has Turkish',()=>{
  eq(trText('Mastery: Known · 75 kills · 75/150 to Mastered'),'Ustalık: Tanındı · 75 öldürme · Ustalaşıldı için 75/150');
  eq(trText('Mastery: Ledgered · 400 kills · Mastery complete'),'Ustalık: Deftere İşlendi · 400 öldürme · Ustalık tamamlandı');
  eq(trText('Mastery: None yet · 3 kills · 3/25 to Studied'),'Ustalık: Henüz yok · 3 öldürme · İncelendi için 3/25');
  for(const t of MASTERY){ const s=masteryGives(t)+'.'; ok(trText(s)!==s,s); ok(trText(t.name)!==t.name,t.name); }
  const s1='Mastery: Tunnel Rat is now Known. +2% raise chance on its bodies.'; eq(trText(s1),'Ustalık: Tunnel Rat artık Tanındı. +%2 diriltme şansı, bu türün cesetlerinde.');
  const s2='Mastered in your bestiary: '+masteryGives(MASTERY[2]); ok(trText(s2).startsWith('Canavar defterinde Ustalaşıldı: +%4'),trText(s2));
  ok(trText('Bestiary: you have studied Tunnel Rat. Its drop table is now known.').startsWith('Canavar Defteri: Tunnel Rat'));
  const c='Keep killing one kind of foe and you master it. Elites count as their base kind. New Game+ keeps the bestiary, so mastery carries over.'; ok(trText(c)!==c);
  const r='180 kills (15 for bosses, Tower wardens and secret masters). '+masteryGives(MASTERY[2])+'.'; ok(!/kills|raise chance/.test(trText(r)),trText(r));
  ok(trText('Mastery')==='Ustalık');
});
})();
