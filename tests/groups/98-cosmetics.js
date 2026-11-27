// Cosmetics, R16 PR B (src/game-collection.js): robes, staff heads, army banners, night backdrops, Ledger covers and family seals.
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,renderAll,cdx,invariants}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const famAll=f=>{ S.ti=S.ti||{}; S.ti.got=S.ti.got||{}; for(const t of TITLES) if(famOf(t)===f) S.ti.got[t.id]=1; };
test('Cosmetics: 27 looks, each from a family, a milestone step or a title; milestones name theirs',()=>{
  eq(cosTotal(),27); for(const k of COS_KIND_IDS) for(const id in COS[k]){ const [w,a,b]=COS[k][id].src;
    ok(w==='fam'?!!FAMS[a]:w==='ms'?!!MILESTONES[a]&&b>=1&&b<=3:w==='title'?!!TITLE[a]:false,'source of '+k+' '+id); ok(cosSrc(k,id).length>4); }
  for(const m of MS_IDS){ const r=MILESTONES[m].rew; ok(/^the /.test(r[0])&&/^the /.test(r[2])&&!/^the /.test(r[1]),'named: '+r.join(' / ')); }
  eq(MILESTONES.ledger.rew[0],'the Bone banner'); eq(MILESTONES.sets.rew[0],'the Rat Warren night backdrop');
  fresh(10); S.ti=S.ti||{}; S.ti.got={}; eq(cosCount(),0); ok(!cosOwned('robe','drowned')); famAll('raise'); ok(famDone('raise')); ok(cosOwned('robe','drowned'),'a finished family');
  S.ti.got.nm2=1; ok(cosOwned('stage','g2'),'a title'); S.coll={mem:1}; ok(cosOwned('robe','gravecloth'),'a milestone step'); ok(!cosOwned('cover','skin'),'not its last step');
  ok(!cosOwned('robe','nope')&&!cosOwned('hat','x'),'unknown looks'); eq(cosCount(),3);
});
test('Cosmetics: wear what you own, toggle off, plain again; locked looks refused; saves and New Game+',()=>{
  fresh(10); S.ti=S.ti||{}; S.ti.got={}; famAll('raise'); S.ti.got.nm2=1;
  ok(!cosWear('robe','iron'),'locked'); ok(!S.cos); ok(!cosWear('hat','x'),'unknown kind');
  ok(cosWear('robe','drowned')); eq(cosOf('robe'),'drowned'); ok(cosWear('stage','g2')); eq(cosOf('stage'),'g2');
  ok(cosWear('robe','drowned')); eq(cosOf('robe'),null,'wearing it again takes it off'); ok(cosWear('robe','drowned')); ok(cosWear('robe',null)); eq(cosOf('robe'),null,'the plain look');
  ok(cosWear('robe','drowned')); const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(g.cos),JSON.stringify(S.cos),'kept by a save');
  const bad=JSON.parse(JSON.stringify(S)); bad.cos={robe:'drowned',staff:7,banner:'nope',hat:'x',cover:'iron'}; eq(JSON.stringify(normalizeSave(bad).cos),JSON.stringify({robe:'drowned',cover:'iron'}),'unknown dropped, unowned kept for later');
  bad.cos='junk'; ok(!('cos' in normalizeSave(bad)),'junk dropped');
  delete S.ti.got[TITLES.find(t=>famOf(t)==='raise').id]; eq(cosOf('robe'),null,'a look no longer owned is not worn'); famAll('raise');
  S.ti.clr={5:1}; S.mode='town'; ok(startNGP(null,[])); eq(cosOf('robe'),'drowned','New Game+ keeps the worn look'); invariants('cos');
});
test('Cosmetics on screen: the hero\'s robe and staff, the army banner, night backdrops, covers, seals, wardrobe, Codex',()=>{
  fresh(10); S.ti=S.ti||{}; S.ti.got={}; famAll('raise'); famAll('hero'); famAll('army'); S.ti.got.nm1=1;
  const plain=ico('Necromancer',0); ok(plain.includes(STAFF_SKULL),'the skull staff');
  cosWear('robe','drowned'); cosWear('staff','lantern'); const h0=ico('Necromancer',0); ok(h0.includes('color:'+COS.robe.drowned.c),'robe colour'); ok(!h0.includes(STAFF_SKULL)&&h0.includes(STAFF_HEAD.lantern),'lantern head');
  ok(ico('Necromancer',0,{robe:'iron',staff:null}).includes(STAFF_SKULL),'previews override'); ok(!/undefined|NaN/.test(h0));
  for(const id in COS.banner){ const b=bannerSVG(id); ok(/^<svg/.test(b)&&!/undefined|NaN/.test(b),'banner '+id); } eq(bannerSVG('nope'),'');
  eq(armyBannerHTML(),''); cosWear('banner','ash'); ok(/army-bn/.test(armyBannerHTML()));
  arena([foe({hp:1e6})]); ok(/army-bn/.test(renderAll('battle banner')),'the banner flies in battle');
  for(let g=0;g<6;g++) ok(!/undefined|NaN/.test(scNight('g'+g)),'night '+g);
  cosWear('stage','g1'); S.run.di=1; const el={dataset:{k:''},innerHTML:'',classList:{toggle(){}}}, gid=document.getElementById; document.getElementById=id=>id==='scene'?el:gid.call(document,id);
  try{ scene(); ok(/\|night$/.test(el.dataset.k)&&/<svg/.test(el.innerHTML),'gate 2 by night: '+el.dataset.k); S.run.di=0; scene(); ok(!/night/.test(el.dataset.k),'other gates by day'); } finally { document.getElementById=gid; }
  S.mode='town'; S.run=null; ui.tab='titles'; ACTIONS.collsub('cos'); let h=renderAll('wardrobe'); ok(/Cosmetics &middot; \d+\/27/.test(h)&&/data-a="coswear"/.test(h)&&/Locked/.test(h));
  ACTIONS.coswear('robe|drowned'); eq(cosOf('robe'),null,'take off from the wardrobe'); ACTIONS.coswear('robe|drowned'); eq(cosOf('robe'),'drowned');
  ACTIONS.collsub('tt'); ok(/class="seals"/.test(sealsHTML())&&sealsHTML().includes('Army family complete'),'seals');
  const cx=cdx('collection'); ok(/Cosmetics/.test(cx)&&/Gravecloth/.test(cx)&&/Night backdrops/.test(cx));
});
test('Cosmetics in Turkish: the wardrobe, sources, rewards and the Codex',()=>{
  fresh(10); S.ti=S.ti||{}; S.ti.got={}; famAll('raise'); famAll('army'); S.ti.got.nm1=1; cosWear('robe','drowned');
  const strip=s=>s.replace(/<[^>]+>/g,'\u0001').split('\u0001').map(x=>x.replace(/&middot;/g,'·').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/gi,' ').trim()).filter(x=>/[A-Za-z]{2}/.test(x));
  const names=new Set(TITLES.map(t=>t.name).concat(...COS_KIND_IDS.map(k=>Object.values(COS[k]).map(c=>c.name))));
  const lines=strip(wardrobeHTML()+codexSection('collection')+sealsHTML()+armyBannerHTML()).concat(COS_KIND_IDS.map(k=>COS_KINDS[k]),[].concat(...MS_IDS.map(k=>MILESTONES[k].rew)),['Army banner','Ash banner']);
  for(const s of lines) if(!names.has(s)) ok(tr(s)!==s||/^[\d\s·.%:,\/\-]+$/.test(s),'Turkish: '+s);
  eq(tr('the Bone banner'),'Bone sancak'); eq(tr('Earn every Army title'),'Her Ordu unvanını kazan');
});
})();
