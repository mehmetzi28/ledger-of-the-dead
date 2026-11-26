// Awakening: gold, bone dust and a boss's hearts raise a unique's own stats (src/game-phases-town.js AWAKENING, item cards in src/ui-panels.js).
(function(){
const {test,ok,eq,setLvl,give,wear,renderAll,cdx,invariants}=window.LOTD_T;
const rich=()=>{ setLvl(30); S.mode='town'; S.gold=1e7; S.dust=1e5; };

test('Awakening: a rank costs gold, dust and hearts, adds its share of the unique\'s stats (not army slots or mana per turn), and stops at the top',()=>{
  rich(); const it=give('u0'), key='b:The Rat King'; eq(uniqHeart('u0'),key); S.trophies[key]=100;
  const c=awakenCost(it); eq(c.h,1); eq(c.g,AWAKEN_GOLD); eq(c.key,key);
  ok(awaken(it.u)); eq(it.aw,1); eq(S.gold,1e7-c.g); eq(S.dust,1e5-c.d); eq(S.trophies[key],99); ok(T_('awakened')===1&&T_('awakenG')===c.g,'counted');
  eq(itStat(it,'mpow'),Math.round(ITEM.u0.stats.mpow*(1+AWAKEN_K)),'its own stats grow'); eq(itStat(it,'slot'),ITEM.u0.stats.slot,'army slots do not'); eq(itStats(it).mana,Math.round(ITEM.u0.stats.mana*(1+AWAKEN_K)));
  eq(awakenCost(it).h,2,'the next rank wants more hearts'); ok(awakenCost(it).g>c.g,'and more gold');
  for(let i=1;i<AWAKEN_MAX;i++) ok(awaken(it.u),'rank '+(i+1)); eq(it.aw,AWAKEN_MAX); eq(awakenCost(it),null); ok(!awaken(it.u),'no rank past the top');
  eq(itStat(it,'will'),Math.round(ITEM.u0.stats.will*(1+AWAKEN_K*AWAKEN_MAX))); invariants('awakened');
});

test('Awakening: needs every part of the price, in town; never for ordinary gear; Tower uniques take their warden\'s heart',()=>{
  rich(); const it=give('u5'), key=uniqHeart('u5'); eq(key,'b:The Pale Sovereign');
  ok(!awaken(it.u),'no hearts'); S.trophies[key]=1; S.gold=awakenCost(it).g-1; ok(!awaken(it.u),'too poor'); S.gold=1e7; S.dust=0; ok(!awaken(it.u),'no dust');
  S.dust=1e5; S.mode='battle'; ok(!awaken(it.u),'town only'); S.mode='town'; ok(awaken(it.u)); eq(S.trophies[key],undefined,'the last heart is gone');
  const g=give('3-wa'); eq(awakenCost(g),null); ok(!awaken(g.u),'not ordinary gear');
  eq(uniqHeart('w1'),'b:'+TW_BOSS[0]); eq(uniqHeart('w10'),'b:'+TW_BOSS[9]); eq(uniqHeart('w12'),'b:'+TW_BOSS[9],'the last warden\'s three'); ok(awakenScale(ITEM.w12)>awakenScale(ITEM.u5),'Tower uniques cost more');
});

test('Awakening: a worn unique makes you stronger; Sell all keeps the hearts your uniques still need',()=>{
  rich(); wear('u2'); const hp=pMax(); const it=S.equip.armor; S.trophies['b:The Ember Knight']=50; ok(awaken(it.u)); ok(pMax()>hp,'more HP');
  const need=[2,3,4,5].reduce((a,b)=>a+b,0); eq(heartsKept('b:The Ember Knight'),need);
  S.trophies['Tunnel Rat']=4; S.trophies['b:The Crypt Warden']=3; sellAllTrophies();
  eq(S.trophies['b:The Ember Knight'],need,'kept what the armor still needs'); eq(S.trophies['Tunnel Rat'],undefined); eq(S.trophies['b:The Crypt Warden'],undefined,'no unique wants these');
});

test('Awakening: item cards, the Gear tab button, the Codex and Turkish; saves repair it; New Game+ keeps the carried unique\'s ranks',()=>{
  rich(); const it=give('u1'); S.trophies['b:The Crypt Warden']=3; ui.tab='gear';
  let h=renderAll('gear awaken'); ok(new RegExp('data-a="awaken" data-k="'+it.u+'"').test(h),'the button'); ok(h.includes('Awaken I')&&h.includes('Heart of The Crypt Warden 3/1'),'its price');
  ACTIONS.awaken(String(it.u)); eq(it.aw,1); h=renderAll('awakened'); ok(h.includes('Awakened I'),'the tag'); ok(h.includes(String(Math.round(ITEM.u1.stats.atk*(1+AWAKEN_K)))),'the awakened figure');
  S.trophies={}; ok(/data-a="awaken"[^>]*disabled/.test(renderAll('poor')),'disabled without hearts');
  ok(cdx('gear').includes('Awaken'),'Codex'); ok(trText(AWAKEN_TXT)!==AWAKEN_TXT&&trText('Awakened II')==='Uyanmış II'&&trText('Awaken III')==='Uyandır III','Turkish');
  const n=give('2-wa'); n.aw=3; const big=give('u3'); big.aw=99; const bad=give('u4'); bad.aw='x';
  const g=normalizeSave(JSON.parse(JSON.stringify(S))), find=u=>g.inv.find(x=>x.u===u);
  ok(!('aw' in find(n.u)),'ordinary gear never'); eq(find(big.u).aw,AWAKEN_MAX); ok(!('aw' in find(bad.u)),'junk dropped'); eq(find(it.u).aw,1,'a good rank stays');
  S.ti.clr={5:1}; ok(startNGP('u1')); const c=S.inv.find(x=>x.id==='u1'); ok(c,'carried'); eq(c.aw,1,'with its rank');
});
})();
