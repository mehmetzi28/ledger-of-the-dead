// Boss Phases tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Phases: at half HP a boss enters its second phase once, and speaks',()=>{
  const rk=bossFight(0); rk.hp=rk.maxHp*.3; checkPhase(); ok(!rk.phase2,'the Rat King, a first boss, keeps one phase'); flee();
  const b=bossFight(1); b.hp=b.maxHp*.6; checkPhase(); ok(!b.phase2); b.hp=b.maxHp*.5; checkPhase(); ok(b.phase2); eq(b.fast,1); ok(b.abilT<=2);
  ok(S.run.log.some(l=>/Two hundred years/.test(l.m))&&S.run.log.some(l=>/second phase/.test(l.m))); eq(T_('phases'),1); checkPhase(); eq(T_('phases'),1,'only once');
  const x=foe({hp:10}); S.run.enemies.push(x); x.hp=1; checkPhase(); ok(!x.phase2,'only bosses');
});
test('Phases: every second-phase move is announced; a boss without a move set alternates with Sundering Blow',()=>{
  const b=bossFight(1), P=S.player; giveAbility(b,'bonewall');   /* as a warden or secret master: the single move */ P.stats.constitution=900; P.hp=pMax(); b.hp=b.maxHp/2; checkPhase(); b.abilT=1;
  ok(bossTurn(b)); ok(b.charging); eq(b.move,'sunder'); eq(P.hp,pMax(),'warning only');
  ok(bossTurn(b)); ok(!b.charging); eq(P.hp,pMax()-Math.round(Math.round(pMax()*.35)*(1-pDr()/100))); eq(b.abilT,2);
  eq(bossTurn(b),false); ok(bossTurn(b)); ok(b.charging); eq(b.move,'bonewall','its own move, now telegraphed'); ok(bossTurn(b)); ok(b.shield>0);
});
test('Phases: Taunt turns Sundering Blow onto a vanguard; Focus crits and Grave Chill break a charge',()=>{
  const b=bossFight(2), P=S.player; P.stats.constitution=900; P.hp=pMax(); const v=mkMinion({role:'vanguard'}); v.hp=v.maxHp=1e6; fix(.5);
  S.run.taunt=2; fireAbility(b,'sunder'); eq(P.hp,pMax()); eq(v.hp,1e6-H(b.atk*2.2));
  S.run.taunt=0; fireAbility(b,'sunder'); eq(P.hp,pMax()-Math.round(Math.round(pMax()*.35)*(1-pDr()/100)));
  P.hp=pMax(); mkMinion({role:'striker'}); b.charging=true; b.move='sunder'; ok(command('striker')); act('strike'); ok(!b.charging,'focus broke it'); ok(S.run.log.some(l=>/focused strike/.test(l.m)&&/Sundering Blow is lost/.test(l.m)));
  b.charging=true; b.move='sunder'; b.stun=1; S.run.cmd={}; act('strike'); ok(!b.charging); ok(S.run.log.some(l=>/frozen/.test(l.m)&&/Sundering Blow is lost/.test(l.m)));
});
test('Phases: the boss card shows its phase and the move it is charging',()=>{
  const b=bossFight(3); b.phase2=true; b.charging=true; b.move='sunder'; const h=renderAll('phase'); ok(/Second phase/.test(h)&&/Charging: Sundering Blow/.test(h));
});
const card=(h,id)=>{ const i=h.indexOf('data-u="'+id+'"'); return i<0?'':h.slice(h.lastIndexOf('<button',i),h.indexOf('</button>',i)); };
function srEl(fn){   // the page's live region (in Node a stand-in, since the fake document has none)
  TAB.srCh=''; const real=document.getElementById('sr-live'); if(real) return fn(real);
  const el={textContent:''}, g=document.getElementById; document.getElementById=id=>id==='sr-live'?el:g(id);
  try{ return fn(el); } finally{ document.getElementById=g; }
}
test('Telegraphs: a charging boss card carries a banner, the answer and an ember frame; nothing when no charge is pending',()=>{
  const b=bossFight(5); S.player.mana=99; let h=renderAll('calm boss'), c=card(h,b.id);
  ok(c&&!/class="charge"/.test(c)&&!/ charging/.test(c),'no banner without a charge'); ok(!/class="ans-m"/.test(h),'no answer marks either'); eq(chargeInfo(b),null);
  b.charging=true; b.move='decree'; h=renderAll('decree'); c=card(h,b.id);
  ok(/class="unit foe[^"]* charging/.test(c),'ember frame class'); ok(/<b>Charging: Royal Decree<\/b><span class="charge-h">Ward or freeze it<\/span>/.test(c),'banner and answer');
  ok(/class="btn answer" data-a="act" data-k="ward"/.test(h),'Bone Ward is marked'); eq(chargeInfo(b).ans.join(),'ward,chill,striker');
  S.player.mana=0; ok(!/data-k="ward"[^>]*>[^<]*<span class="ans-m"/.test(renderAll('no mana'))&&!/btn answer" data-a="act" data-k="ward"/.test(renderAll('no mana')),'no mark on a ward you cannot cast'); S.player.mana=99;
  b.move='sunder'; b.phase2=true; mkMinion({role:'vanguard'}); h=renderAll('sunder'); c=card(h,b.id);
  ok(/Charging: Sundering Blow<\/b><span class="charge-h">Taunt it onto a vanguard, or freeze it</.test(c),'Sundering Blow answer');
  ok(/class="btn small answer" data-a="cmd" data-k="vanguard"/.test(h),'Taunt order is marked'); ok(!/btn answer" data-a="act" data-k="ward"/.test(h),'a ward does not answer it');
  S.run.cmd={vanguard:1}; ok(!/answer" data-a="cmd" data-k="vanguard"/.test(renderAll('taunt given')),'a given order is not marked');
  b.move='hymn'; eq(chargeInfo(b).hint,'Freeze it or Focus-crit it');
  b.hp=0; eq(chargeInfo(b),null,'a dead boss charges nothing');
});
test('Telegraphs: the charge is announced once in the live region, in Turkish too, and fires the effects hook',()=>{
  const b=bossFight(5); renderAll('start');
  srEl(el=>{ b.charging=true; b.move='decree'; el.textContent=''; srAnnounce(); ok(/Charging: Royal Decree\. Ward or freeze it\./.test(el.textContent),'announced: '+el.textContent);
    el.textContent=''; srAnnounce(); eq(el.textContent,'','only once');
    b.charging=false; srAnnounce(); b.charging=true; b.move='sunder'; VIEW.lang='tr';
    try{ srAnnounce(); ok(/Güç topluyor: Sundering Blow/.test(el.textContent)&&/Kışkırt ile bir öncüye çevir/.test(el.textContent),'Turkish: '+el.textContent); } finally{ VIEW.lang='en'; } });
  eq(trText('Ward or freeze it'),'Kalkan kaldır ya da dondur'); ok(trText('Freeze it or Focus-crit it')!=='Freeze it or Focus-crit it'); ok(trText('Charging: Royal Decree')==='Güç topluyor: Royal Decree');
  const c=bossFight(5); c.abilT=1; const calls=[]; FXL.spy=(k,key)=>calls.push(k+':'+key);
  try{ bossTurn(c); } finally{ FXL.spy=null; }
  ok(c.charging,'charging'); ok(calls.includes('charge:'+c.id),'charge hook fired: '+calls.join()); eq(FXL.q.length,0,'nothing queued with the layer off');
  const calls2=[]; FXL.spy=(k)=>calls2.push(k); try{ bossTurn(c); } finally{ FXL.spy=null; } ok(!calls2.includes('charge'),'not when the move lands');
});

})();
