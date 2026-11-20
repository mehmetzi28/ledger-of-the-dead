// Guidance and polish: the What next panel, Codex search in both languages and "new" page marks, tier marks on item icons,
// glyphs on status pills (src/ui-codex.js, src/ui-panels.js, src/ui-screens.js).
(function(){
const {test,ok,eq,fresh,setLvl,foe,arena,give,wear,renderAll,richState}=window.LOTD_T;
const kinds=()=>goals().map(g=>g.k);

test('Goals: a fresh game has no goals and no panel; points show up first, at most three',()=>{
  fresh(); S.player.pts=0; S.player.sp=0; eq(kinds().join(),'','a new game: no side goals'); eq(nextObjective().k,'gates|open','the objective: the first gate');
  S.ti={clr:{0:1,1:1,2:1,3:1,4:1,5:1}}; S.heatMax={0:3,1:3,2:3,3:3,4:3,5:3}; tri().day=S.day; eq(goals().length,0,'nothing to do'); eq(nextObjective(),null,'no objective either'); ok(!renderAll('town').includes('h-goal'),'panel hidden');
  S.player.pts=2; S.player.sp=1; const g=goals(); eq(g[0].k,'||status'); eq(g[1].k,'skills'); ok(g[0].t.includes('2 stat points'),g[0].t);
  const h=renderAll('town'); ok(h.includes('id="h-goal"')&&h.includes('What next'),'panel shown');
  ok(h.indexOf('h-goal')<h.indexOf('h-quest'),'What next sits at the top of the side panel');
  richState(); S.mode='town'; ok(goals().length<=GOAL_N,'never more than '+GOAL_N);
});
test('Goals: claims, upgrades, gear, gates, buildings and the Memorial',()=>{
  fresh(); S.player.pts=0; S.player.sp=0;
  S.quest.kills=QUEST.kills; S.quest.rooms=QUEST.rooms; S.quest.clears=QUEST.clears; ok(kinds().includes('||quest'),'quest claim');
  S.quest.claimed=true; ok(!kinds().includes('||quest'),'claimed quest gone');
  wear('0-wa'); give('1-wa'); ok(kinds().includes('gear'),'a higher tier weapon in the bag');
  fresh(); S.player.pts=0; S.player.sp=0; S.player.skills.spear=SK_MAX; ok(goals().some(g=>g.t.includes('rank 3')),'a rank 3 choice waits');
  chooseMod('spear','a'); ok(!goals().some(g=>g.t.includes('rank 3')),'chosen: gone');
  fresh(); S.player.pts=0; S.player.sp=0; setLvl(tierRec(0,0)); const g=nextObjective(); ok(g.k==='gates|open'&&g.t.includes(DUNGEONS[0].name),'the first gate is the objective');
  S.ti={clr:{0:1}}; setLvl(tierRec(0,1)); eq(nextObjective().k,'gates|open','cleared: the next gate or a harder tier is suggested');
  fresh(); S.player.pts=0; S.player.sp=0; setLvl(10); S.ti={clr:{0:1,1:1}}; S.gold=BUILD_COST[0][0]; ok(kinds().includes('town'),'a building is affordable');
  S.mode='battle'; eq(goals().length,0,'no goals outside town');
});
test('Goals: each button takes you there, and the panel folds like the others',()=>{
  fresh(); S.player.sp=1; S.player.pts=0; ACTIONS.goal('skills'); eq(ui.tab,'skills');
  ACTIONS.goal('gates|war'); eq(ui.tab,'gates'); eq(ui.gsub,'war');
  VIEW.fold.bounty=true; ACTIONS.goal('||bounty'); eq(ui.goto,'h-bty'); ok(!VIEW.fold.bounty,'a folded bounty board opens');
  render(); ok(!ui.goto,'scroll target used once');
  ACTIONS.fold('goal'); ok(VIEW.fold.goal,'folds'); S.player.sp=1; ok(renderAll('town').includes('goals folded'),'folded class'); ACTIONS.fold('goal'); ok(!VIEW.fold.goal,'unfolds');
});
test('Codex search: matches the text as shown, in Turkish too',()=>{
  fresh(); ui.tab='codex'; ui.cxq='poison'; let h=renderAll('codex'); ok(/[1-9]\d* match/.test(h)&&h.includes('class="cx-hits"'),'English finds poison');
  VIEW.lang='tr';
  try{ ui.cxq='zehir'; h=renderAll('codex tr'); ok(/[1-9]\d* match/.test(h),'Turkish word finds the Turkish text');
    ui.cxq='ZEHİR'; ok(cxQuery()==='zehir','Turkish casing: İ lowers to i');
  } finally { VIEW.lang='en'; ui.cxq=''; }
});
test('Codex: a page whose text changed since it was last opened is marked new, and opening it clears the mark',()=>{
  fresh(); localStorage.removeItem(CX_SEEN_KEY); CXS.v=null; ui.tab='codex'; ui.cx='basics';
  ok(!renderAll('codex').includes('cx-new'),'first visit marks nothing');
  CXS.v.bosses='stale'; let h=renderAll('codex'); ok(/data-k="bosses"[^>]*>[^<]*<span class="cx-new"/.test(h),'changed page marked');
  ok(JSON.parse(localStorage.getItem(CX_SEEN_KEY)).basics,'hashes kept in the browser, not the save'); ok(!JSON.stringify(S).includes('cx-seen'),'not in the save');
  ui.cx='bosses'; renderAll('codex'); ui.cx='basics'; ok(!renderAll('codex').includes('cx-new'),'opened: no longer new');
  eq(cxHash('basics'),cxHash('basics'),'stable hash');
});
test('Tier marks: item icons show their tier as a shape, distinct from the set rank letter',()=>{
  eq(TIER_MARK.length,TIERS.length);
  for(let t=0;t<5;t++) eq((TIER_MARK[t].match(/<path/g)||[]).length,t+1,'tier '+t+' diamonds');
  ok(TIER_MARK[5].includes('<path')&&!/[A-Z]</.test(TIER_MARK[5]),'unique: a star, no letter');
  ok(iico(ITEM['2-wa']).includes('class="tmark"')&&iico(ITEM['2-wa']).includes('class="rb gl'),'both marks on a set piece');
  ok(iico(ITEM.u0).includes('class="tmark"'),'unique has a mark');
});
test('Status pills: every status carries its own glyph',()=>{
  const all=Object.keys(DOTS).concat(Object.keys(CONDS),['frozen','cursed','shield']);
  all.forEach(k=>ok(ST_GLYPH[k],'glyph for '+k)); eq(new Set(all.map(k=>ST_GLYPH[k])).size,all.length,'all different');
  fresh(); const e=foe({}); arena([e]); e.dots={poison:{d:3,t:2}}; e.st={hexed:2}; e.stun=1; e.curse={t:2,mul:1.2}; e.shield=5;
  const h=stPills(e); ['p-poison','p-hexed','p-frozen','p-cursed','p-shield'].forEach(c=>ok(new RegExp('class="pill '+c+'"[^>]*><svg class="pg"').test(h),c+' has a glyph'));
});
test('Turkish: the new guidance text translates',()=>{
  VIEW.lang='tr';
  try{ ['What next','A bounty is ready to claim.','2 stat points to spend.','A rank 3 skill upgrade is waiting for your choice.','Your bag holds gear of a higher tier than you wear.','You can afford a building.',
      'A Commander is free to lead a raid tonight.','This week\'s Trial is not done yet.','You can honour a fallen minion in the Memorial.','Today\'s quest is done: claim the reward.','Changed since you last read it','new','Hide What next']
    .forEach(s=>ok(trText(s)!==s,'untranslated: '+s));
    ok(trText('The Sunken Crypt is within reach.').startsWith('Sunken Crypt'),'gate name kept'); ok(trText('Hard is open on the Sunken Crypt.').includes('Zor'),'tier translated');
    ok(trText('3 matches for "zehir"').includes('3 sonuç'),'match count');
  } finally { VIEW.lang='en'; }
});
})();
