// The Soul Tether (src/game-faith-story.js tetherBlow, hurtAlly in src/game-runs.js) and one soul per boss (soulBound, src/game-runs.js).
(function(){
const {test,ok,eq,fix,fresh,foe,arena,mkMinion,corpse,raiseScene,renderAll,cdx}=window.LOTD_T;
// a striker that will hit you this turn for about atk, and a sturdy vanguard; you at full HP with no ward
const room=(atk,row)=>{ fresh(10); const a=foe({name:'Grim Biter',hp:1e6,atk,role:'striker'}); arena([a]); const v=mkMinion({role:'vanguard'}); v.maxHp=v.hp=1e6; if(row) v.row=row;
  const P=S.player; P.hp=pMax(); P.shield=0; fix(.99); a.it={k:'atk',t:'p'}; return {a,v,P}; };

test('Tether: while a minion holds the front row, one foe blow takes at most half your max HP and the minion takes the rest',()=>{
  const {v,P}=room(5000), cap=Math.round(pMax()*TETHER); act('strike');
  eq(S.mode,'battle','you stand'); eq(P.hp,pMax()-cap,'exactly the cap');
  ok(v.maxHp-v.hp>4000,'the vanguard took the rest'); ok(S.run.log.some(l=>/^Soul Tether: .+ takes \d+ of the blow for you\.$/.test(l.m)),'logged'); ok(T_('tethered')>=1,'counted');
});

test('Tether: no front row, no tether; a small blow is not touched; Bone Ward soaks first; damage over time is never tethered',()=>{
  let {v,P}=room(5000,'b'); act('strike'); eq(S.mode,'defeat','a back-row army cannot hold the blow'); eq(v.hp,v.maxHp,'and takes none of it');
  ({v,P}=room(5)); act('strike'); ok(P.hp<pMax()&&P.hp>pMax()-20,'a small blow lands on you'); eq(v.hp,v.maxHp,'the tether stays out of it');
  ({v,P}=room(5000)); const cap=Math.round(pMax()*TETHER); P.shield=100; act('strike'); eq(P.shield,0,'the ward went first'); eq(P.hp,pMax()-cap,'then the cap');
  ({v,P}=room(1)); const d=Math.round(pMax()*.9), want=P.hp-allyDr(P,d); hurtAlly(P,d); eq(P.hp,want,'not a blow: no cap'); eq(v.hp,v.maxHp);
});

test('Tether: the blow previews and Guard count it; the battle shows a Tethered pill; Codex and Turkish',()=>{
  let {v,P}=room(5000); const cap=Math.round(pMax()*TETHER);
  eq(afterWard(P,99999),cap,'previews are capped'); v.row='b'; eq(afterWard(P,99999),99999,'not without a front row'); v.row='f';
  mkMinion({role:'vanguard'}); act('guard'); ok(S.run.guard!=null,'Guard given'); S.run.enemies[0].it={k:'atk',t:'p'}; act('strike');
  ok(S.run.guard!=null||!S.run.log.some(l=>/^Guard: .+ steps in front/.test(l.m)),'a held blow does not spend Guard'); ok(S.run.log.some(l=>/^Soul Tether:/.test(l.m)));
  ({v,P}=room(1)); const h=renderAll('tether pill'); ok(/class="pill p-shield" title="Soul Tether: [^"]+ stands in front\./.test(h)&&h.includes('Tethered'),'the pill on you');
  ok(cdx('roles').includes('Soul Tether'),'Codex row');
  ok(trText('Soul Tether: Vesk takes 120 of the blow for you.').startsWith('Ruh Bağı:'),'log in Turkish'); ok(trText(TETHER_TXT)!==TETHER_TXT,'rule in Turkish');
});

test('Souls: a boss already serving you will not rise again; another boss will; the Reserve and raids count; a release frees the soul',()=>{
  fresh(20); const k=mkMinion({name:'The Rat King',kind:'The Rat King',role:'reaper',boss:true,lvl:10});
  const r=raiseScene([corpse({name:'The Rat King',base:'The Rat King',role:'reaper',boss:true,lvl:3}),corpse({name:'The Crypt Warden',base:'The Crypt Warden',role:'reaper',rankI:1,boss:true,lvl:6})],20);
  const [c1,c2]=r.corpses; ok(soulBound(c1)&&!soulBound(c2)); eq(raiseChance(c1),0); eq(saltChance(c1),0); ok(raiseChance(c2)>0,'another boss is fine');
  S.player.mana=pMana(); S.salts=1; const mana=S.player.mana; tryRaise(c1.id,true); eq(S.player.mana,mana,'no mana spent'); eq(S.salts,1,'no salt spent'); ok(!c1.tried,'not tried');
  ok(r.events.some(e=>e.m==="The Rat King's soul is already bound to you."),'told why');
  const h=renderAll('bound'); ok(h.includes('Soul already bound'),'raise screen'); ok(!new RegExp('data-a="raise" data-k="'+c1.id+'"').test(h),'no raise button for it');
  S.army=S.army.filter(m=>m!==k); S.reserve=[k]; ok(soulBound(c1),'in the Reserve'); S.reserve=[]; S.raids=[{units:[k]}]; ok(soulBound(c1),'on a raid');
  S.raids=[]; ok(!soulBound(c1),'released: free again'); ok(raiseChance(c1)>0); ok(!soulBound(corpse({base:'Tunnel Rat'})),'ordinary bodies never');
  S.mode='town'; S.run=null; ok(cdx('raising').includes('One soul per boss'),'Codex'); ok(trText(SOUL_BOUND)!==SOUL_BOUND&&trText("The Rat King's soul is already bound to you.")!=="The Rat King's soul is already bound to you.",'Turkish');
});
})();
