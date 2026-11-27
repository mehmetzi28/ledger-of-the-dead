// Titles and collection 2.0, R16 PR A (src/game-collection.js): families, inscriptions, milestones, hidden title hints.
(function(){
const {test,ok,eq,near,fix,fresh,setLvl,foe,arena,mkMinion,give,renderAll,cdx,invariants}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const earnN=n=>{ S.ti=S.ti||{}; S.ti.got=S.ti.got||{}; let i=0; for(const t of TITLES){ if(i>=n) break; S.ti.got[t.id]=1; i++; } };
const firstOf=(f,skip)=>TITLES.find(t=>famOf(t)===f&&t.id!==skip).id;
test('Collection: every title has one of the ten families; gate titles know their gate',()=>{
  for(const t of TITLES) ok(FAMS[famOf(t)],'family for '+t.id);
  for(const f of FAM_IDS) ok(TITLES.some(t=>famOf(t)===f),'titles in '+f);
  eq(titleGate(TITLE.g2),2); eq(titleGate(TITLE.nm4),4); eq(titleGate(TITLE.d_raise1),null); eq(famOf(TITLE.t10),'endless'); eq(famOf(TITLE.c_fury),'gate'); eq(famOf(TITLE.e_shrine),'faith');
});
test('Inscriptions: slots at 40, 80 and 120 titles; earned only; one a family; erase frees the slot; in town',()=>{
  fresh(10); S.ti=S.ti||{}; S.ti.got={}; eq(inscSlots(),0); const a=firstOf('army'); S.ti.got[a]=1; ok(!titleInscribe(a),'no slot below 40');
  earnN(40); S.ti.got[a]=1; eq(inscSlots(),1); ok(titleInscribe(a)); eq(S.insc.join(),a); const h=firstOf('hero'); S.ti.got[h]=1; ok(!titleInscribe(h),'one slot'); ok(/next slot at 80/.test(inscWhy(h)));
  earnN(120); eq(inscSlots(),3); const a2=firstOf('army',a); S.ti.got[a2]=1; ok(!titleInscribe(a2),'one a family'); ok(/Army title is inscribed/.test(inscWhy(a2)));
  ok(titleInscribe(h)); const e=firstOf('endless'); S.ti.got[e]=1; ok(titleInscribe(e)); eq(inscList().length,3); ok(!titleInscribe(firstOf('town')),'three at most');
  ok(titleInscribe(a),'erase'); eq(inscList().length,2); delete S.ti.got['zz']; const lock=TITLES.find(t=>!S.ti.got[t.id]); ok(!titleInscribe(lock.id),'not earned');
  S.mode='battle'; ok(!titleInscribe(firstOf('town'))); S.mode='town';
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.insc.join(),S.insc.join(),'kept by a save'); const bad=JSON.parse(JSON.stringify(S)); bad.insc=[h,h,'nope',a,a2]; const n=normalizeSave(bad); eq(n.insc.join(),[h,a].join(),'duplicates, unknowns and a second of a family dropped');
  S.ti.clr={5:1}; ok(startNGP(null,[])); eq(S.insc.length,2,'New Game+ keeps inscriptions'); invariants('insc');
});
test('Inscriptions: each family perk applies where its rule lives, and only once',()=>{
  fresh(20); earnN(120); const on=f=>{ S.insc=[firstOf(f)]; S.ti.got[S.insc[0]]=1; };
  S.insc=[]; const m=mkMinion({lvl:20}); syncArmy(); const hp0=m.maxHp; on('army'); syncArmy(); ok(m.maxHp>hp0,'army max HP'); near(m.maxHp/hp0,1.01,.006);
  on('town'); const bc=buildCost('crypt'); S.insc=[]; const bc0=buildCost('crypt'); eq(bc[0],Math.round(bc0[0]*.98),'buildings 2% cheaper');
  const cs={lvl:20,rankI:0,name:'Tunnel Rat',base:'Tunnel Rat',role:'striker'}; S.insc=[]; const r0=raiseChance(cs); on('raise'); ok(raiseChance(cs)>=r0,'raise chance');
  const gt=TITLES.find(t=>famOf(t)==='gate'&&titleGate(t)===0).id; S.insc=[gt]; S.ti.got[gt]=1; arena([foe({hp:1e6})]); S.run.di=0; near(inscDmgK(),1.01,1e-9,'its gate'); S.run.di=1; eq(inscDmgK(),1,'not another gate');
  on('endless'); S.run.tw=10; near(inscDmgK(),1.01,1e-9,'the Tower'); delete S.run.tw; eq(inscDmgK(),1);
  on('rival'); S.run.siege=1; near(inscDmgK(),1.02,1e-9,'sieges'); delete S.run.siege;
  on('story'); eq(inscBossXp({boss:true}),1.02); eq(inscBossXp({}),1); on('secrets'); eq(inscDrop(),1.01); on('faith'); eq(inscFaith(),1.05); on('hero'); eq(inscHero(),1.01);
  INSC_ON=false; eq(inscHero(),1,'the bot\'s off-switch'); INSC_ON=true;
});
test('Milestones: pay once at their steps, never lost; the middle steps ease a rule',()=>{
  fresh(10); S.memorial=Array.from({length:100},(_,i)=>({nick:'N'+i,name:'Tunnel Rat',kind:'Tunnel Rat',rk:0,st:0,lvl:1,day:1,tr:[],role:'striker'}));
  const e={hs:0}, hc0=headCost(e); checkTitles(); eq(msAt('mem'),2,'50 and 100 names'); eq(headCost(e),Math.round(hc0*.9),'headstones 10% cheaper');
  S.memorial=[]; checkTitles(); eq(msAt('mem'),2,'kept when the list shrinks');
  S.pages=20; checkTitles(); eq(msAt('pages'),2); S.ti.got={}; earnN(50); ok(hintsOn(),'hints from 50 titles with the Pages milestone');
  const b0=bagMax(); for(let i=0;i<4;i++) for(const d of Object.values(ITEM).filter(d=>d.set===i&&!d.tower&&!d.rival&&!d.uq)) give(d.id); S.coll.sets=0; checkTitles(); eq(msAt('sets'),2); eq(bagMax(),b0+BAG_STEP,'a bag row');
  ['u0','u1','u2','u3','u4','u5'].forEach(id=>give(id)); checkTitles(); eq(msAt('uq'),1); eq(S.coll.u.length,6);
  S.coll.tro=2; S.day=8; ok(freeBrew(),'a free brew this week'); collBrewUse(); ok(!freeBrew(),'once a week'); S.day=15; ok(freeBrew(),'and next week');
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(g.coll),JSON.stringify(S.coll),'kept by a save'); const bad=JSON.parse(JSON.stringify(S)); bad.coll={mem:9,u:['u0','u0','x'],zz:1}; eq(JSON.stringify(normalizeSave(bad).coll),JSON.stringify({mem:3,u:['u0']}));
  S.ti.clr={5:1}; S.mode='town'; ok(startNGP(null,[])); eq(msAt('mem'),2,'New Game+ keeps milestones'); invariants('coll');
});
test('Hidden titles: a masked hint after 100 titles, none before',()=>{
  fresh(10); S.ti=S.ti||{}; S.ti.got={}; ui.tab='titles'; const hid=TITLES.find(t=>t.r>=HIDDEN_FROM); let h=renderAll('no hints'); ok(!/Hint:/.test(h));
  earnN(101); delete S.ti.got[hid.id]; ok(hintsOn()); h=renderAll('hints'); ok(/Hint: <span class="t-hint">/.test(h)); const m=titleHint(hid); ok(m!==hid.req&&m.includes('…'),'masked: '+m);
});
test('Collection on screen: titles by family with inscriptions, milestones, the hero card, the Codex; Turkish',()=>{
  fresh(10); earnN(120); const a=firstOf('army'); titleInscribe(a); ui.tab='titles'; let h=renderAll('coll'); ok(/Inscribed titles/.test(h)&&/data-a="insc"/.test(h)&&/Tower and Rift/.test(h),'titles');
  ok(h.includes('insc-l'),'the hero card'); ACTIONS.collsub('ms'); h=renderAll('ms'); ok(/Milestones/.test(h)&&/Bestiary Ledgered/.test(h)); ACTIONS.collsub('tt');
  const cx=cdx('collection'); ok(/Families/.test(cx)&&/Milestones/.test(cx));
  const strip=s=>s.replace(/<[^>]+>/g,'\u0001').split('\u0001').map(x=>x.replace(/&middot;/g,'·').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/gi,' ').trim()).filter(x=>/[A-Za-z]{2}/.test(x));
  const names=new Set(TITLES.map(t=>t.name).concat(TIERS));
  const lines=strip(inscHTML()+milestonesHTML()+codexSection('collection')).concat(FAM_IDS.map(f=>FAMS[f].name),FAM_IDS.map(f=>FAMS[f].perk),MS_IDS.map(k=>MILESTONES[k].name),MS_IDS.map(k=>MILESTONES[k].unit),[].concat(...MS_IDS.map(k=>MILESTONES[k].rew)));
  for(const s of lines) if(!names.has(s)) ok(tr(s)!==s||/^[\d\s·.%:,\/\-]+$/.test(s),'Turkish: '+s);
});
})();
