// Screens tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Screens: the Ledger tab holds the Codex, Bestiary, History and How to play, and remembers the last page',()=>{
  ui.tab='gates'; let h=renderAll('tabs'); ok(!/data-k="bes"/.test(h)&&!/data-k="hist"/.test(h),'old tabs folded in');
  ACTIONS.tab('ledger'); eq(ui.tab,'codex','opens on the Codex'); h=renderAll('ledger'); ok(/data-k="ledger" aria-keyshortcuts="[0-9]" aria-selected="true"/.test(h)); LEDGER.forEach(x=>ok(new RegExp('data-a="tab" data-k="'+x[0]+'"').test(h),x[0]));
  ACTIONS.tab('hist'); renderAll('hist'); ACTIONS.tab('gates'); ACTIONS.tab('ledger'); eq(ui.tab,'hist','back to the last page');
});
test('Screens: the Market is split into Buy, Forge, Altar and bag, and Sell',()=>{
  S.gold=1e4; S.trophies={'Tunnel Rat':8}; mkMinion({}); give('0-wa'); ui.tab='market';
  const page=k=>{ ACTIONS.mk(k); return renderAll('market '+k); };
  let h=page('buy'); ok(/data-a="buypot"/.test(h)&&/data-a="buysalt"/.test(h)&&!/data-a="forge"/.test(h)&&!/data-a="sellitem"/.test(h));
  h=page('forge'); ok(/data-a="forge"/.test(h)&&/data-a="brew"/.test(h)&&!/data-a="buypot"/.test(h));
  h=page('altar'); ok(/data-a="empower"/.test(h)&&/data-a="buybag"/.test(h));
  h=page('sell'); ok(/data-a="selltro"/.test(h)&&/data-a="sellitem"/.test(h)); ui.mk='bogus'; ok(/data-a="buypot"/.test(renderAll('fallback')));
});
test('Screens: side panel windows fold to one line with a summary, remembered per browser',()=>{
  const keep=JSON.stringify(VIEW.fold);
  try{ VIEW.fold={}; let h=renderAll('open'); ok(!/class="win folded"/.test(h)); ACTIONS.fold('quest'); h=renderAll('folded'); ok(/class="win folded" aria-labelledby="h-quest"/.test(h)&&/fold-sum">0\/3/.test(h));
    eq(JSON.parse(localStorage.getItem('lotd-view')).fold.quest,true); ACTIONS.fold('quest'); ok(!VIEW.fold.quest); ACTIONS.fold('nope'); eq(VIEW.fold.nope,undefined); }
  finally{ VIEW.fold=JSON.parse(keep); saveView(); }
});
test('Screens: a battle carries a pinned HP and mana bar for phones',()=>{ arena([foe()]); const h=renderAll('mini'); ok(/class="mini-hp"/.test(h)&&new RegExp('HP '+S.player.hp+'/'+pMax()).test(h)); });

test('Screens: the army list has a Compact view, one row per minion with the same actions, remembered in VIEW',()=>{
  S.mode='town'; S.army=[]; const a=mkMinion({lvl:5}), b=mkMinion({lvl:6}), c=mkMinion({lvl:7}); b.hp=Math.floor(b.maxHp*.2);
  let h=armyHTML(); eq(VIEW.army,'cards'); ok(/class="minion"/.test(h)&&!/class="mrow"/.test(h),'cards by default'); ok(/data-k="army\|compact" aria-pressed="false"/.test(h));
  ACTIONS.view('army|compact'); eq(VIEW.army,'compact'); eq(JSON.parse(localStorage.getItem('lotd-view')).army,'compact','saved');
  h=armyHTML(); eq((h.match(/class="mrow"/g)||[]).length,3,'one row each'); ok(!/class="minion"/.test(h)); eq((h.match(/data-a="release"/g)||[]).length,3); eq((h.match(/data-a="mdet"/g)||[]).length,3); eq((h.match(/data-a="renameo"/g)||[]).length,3);
  ok(/class="mr-hp low"/.test(h),'low HP marked'); ok(h.includes('Lv '+c.lvl+' &middot; ')&&h.includes('aria-label="ATK"><svg viewBox="0 0 10 10" aria-hidden="true">'+SG_PATH.atk+'</svg></span>'+c.atk),'level and attack: the attack glyph, labelled ATK, then the number'); ok(!/data-a="(fuse|releaseall|bulk)/.test(h),'no bulk action');
  ui.confirm=a.uid; ok(/Confirm release/.test(armyHTML()),'release keeps its two presses'); ui.confirm=null;
  ui.mdet=b.uid; h=armyHTML(); eq((h.match(/class="minion"/g)||[]).length,1,'Details expands that row'); eq((h.match(/class="mrow"/g)||[]).length,2); ui.mdet=null;
  ui.rename=c.uid; ok(/id="rn"/.test(armyHTML()),'Rename expands that row'); ui.rename=null;
  ACTIONS.view('army|nonsense'); eq(VIEW.army,'compact'); ACTIONS.view('army|cards'); eq(VIEW.army,'cards'); S.army=[];
});

test('Screens: each compact army row starts with the minion icon, the same one its card uses',()=>{
  S.mode='town'; S.army=[]; const m=mkMinion({name:'Grave Ghoul',kind:'Grave Ghoul',rankI:2,role:'vanguard'}); VIEW.army='compact';
  const h=minionRow(m,true); ok(h.startsWith('<div class="mrow">'+ico('Grave Ghoul',2,m)),'icon first'); ok(h.includes('<span class="ico r2'),'rank class');
  mkMinion({lvl:3}); eq((armyHTML().match(/class="mrow"><span class="ico /g)||[]).length,2,'every row'); VIEW.army='cards'; S.army=[];
});
test('Screens: a compact row keeps traits, evolution and Commander in the name title, one short marker, and named actions',()=>{
  S.mode='town'; S.army=[]; const m=mkMinion({name:'Grave Ghoul',kind:'Grave Ghoul',rankI:2,role:'vanguard',elite:true,traits:['stalwart']}); VIEW.army='compact';
  let h=minionRow(m,true); ok(!/mr-tags/.test(h),'no wrapped tag line'); ok(new RegExp('class="mr-name" title="'+m.nick+', the Grave Ghoul &middot; Vanguard &middot; '+TRAITS.stalwart.name).test(h),'traits in the title: '+h.slice(0,400));
  ok(!/class="mr-mk"/.test(h),'no marker without a Commander');
  m.traits.push('commander'); ok(isCommander(m),'an elite Commander'); h=minionRow(m,true); ok(/<span class="mr-mk" title="Commander: can lead raids">Cmdr<\/span>/.test(h),'Commander marker');
  ok(/aria-label="Details: /.test(h)&&/aria-label="Rename: /.test(h)&&/aria-label="Release: /.test(h),'accessible names');
  ui.confirm=m.uid; ok(/aria-label="Confirm release: [^"]+"[^>]*>Sure\?</.test(minionRow(m,true)),'two-press release'); ui.confirm=null;
  eq(trText('Sure?'),'Emin misin?'); eq(trText('Info'),'Bilgi'); VIEW.army='cards'; S.army=[];
});

test('Screens: on phones the pinned action bar carries a thin HP tick per minion, none without an army',()=>{
  S.army=[]; arena([foe()]); let h=renderAll('no army'); ok(/class="actbar"/.test(h),'battle bar'); ok(!/class="pstrip"/.test(h),'absent with no army');
  const a=mkMinion({lvl:5}), b=mkMinion({lvl:5}), c=mkMinion({lvl:5}); b.hp=Math.floor(b.maxHp*.2); c.hp=0; h=renderAll('party strip');
  ok(/class="actbar"><div class="pstrip"/.test(h),'inside the pinned bar, above the buttons'); eq((h.match(/class="pt[ "]/g)||[]).length,3);
  ok(h.includes('title="'+a.nick+': '+a.hp+'/'+a.maxHp+'"'),'title'); ok(/class="pt low"/.test(h),'low'); c.hp=0; h=partyStrip(); ok(/class="pt down"/.test(h),'fallen dimmed'); ok(h.includes('aria-label="'+c.nick+': down"'),'down label');
  S.army=[];
});

test('Screens: item lines are stat glyphs with numbers, each glyph labelled with the full word; the comparison keeps its colours',()=>{
  const it=give('2-wa'); it.ro=[['will',3]]; const h=itemCard(it,'',true), d=ITEM['2-wa'];
  Object.keys(d.stats).filter(k=>d.stats[k]).forEach(k=>ok(h.includes('class="sg sg-'+k+'" role="img" title="'+STATL[k][0]+'" aria-label="'+STATL[k][0]+'"'),'glyph for '+k));
  ok(/class="roll" title="Bonus line"><span class="sv"><span class="sg sg-will"[^>]*aria-label="Will"/.test(h)&&h.includes('+3</span>'),'a bonus line');
  ok(!/\d (Strike|Siphon|Max HP|Will)\b/.test(h.replace(/<[^>]+>/g,' ').replace(/title="[^"]*"/g,'')),'no stat words after numbers');
  ok(Object.keys(SG_PATH).every(k=>!!sgl(k).match(/aria-label="[A-Z][^"]+"/)),'every glyph has a word'); ['Armor pierce','Minion attack','Skill damage','Healing received'].forEach(w=>{ VIEW.lang='tr'; try{ ok(trText(w)!==w,'Turkish: '+w); } finally{ VIEW.lang='en'; } });
});
test('Screens: long text folds behind Details (native, keyboard-ready) and stays open across renders; the full text is kept',()=>{
  S.mode='town'; ui.tab='town'; const h=buildHTML();
  ok(/<details class="more lede" data-det="town"><summary><span class="more-1">Build up the necropolis\.<\/span>/.test(h),'the lede is one line'); ok(h.includes('which you get by salvaging gear on the Gear tab.</div></details>'),'the whole paragraph is in Details');
  ok(h.includes('data-det="bcrypt"')&&h.includes(BUILD.crypt.desc),'building descriptions fold, kept whole');
  ok(/data-det="pit"/.test(h),'the Flesh Pit intro folds'); ui.det={town:true}; ok(/data-det="town" open>/.test(buildHTML()),'remembered open');
  ui.det={}; const it=give('w1'), c=itemCard(it,''); ok(/<details class="more i-fx"[^>]*><summary><span class="more-1">[^<:]+<\/span>/.test(c)&&c.includes(FLAGS[ITEM.w1.flag]),'a unique effect: its name, the rule one press away');
  setLvl(10); S.player.pts=1; const st=statusHTML(); ok(/<details class="more keep sdesc" data-det="ststrength"><summary><b>Strength<\/b>/.test(st)&&st.includes('Strike damage, crit chance'),'stat descriptions fold');
  ok(/<small class="gain">Next: <span class="sv"><span class="sg sg-atk"/.test(st),'the next point in glyphs'); ok(/class="derived"><div><span class="sg sg-atk"[^>]*aria-label="Strike"/.test(st),'derived stats as glyphs');
});
test('Screens: the notices box shows the newest two, with Show all and Dismiss',()=>{
  S.mode='town'; ui.notesAll=false; S.notices=[]; ['one','two','three','four'].forEach(m=>notify(m)); let h=notesHTML();
  eq((h.match(/class="note /g)||[]).length,2); ok(h.includes('four')&&h.includes('three')&&!h.includes('>one<'),'newest first'); ok(/data-a="notesall" aria-expanded="false">Show all \(4\)/.test(h)&&/data-a="dismiss"/.test(h));
  ACTIONS.notesall(); h=notesHTML(); eq((h.match(/class="note /g)||[]).length,4); ok(/Show fewer/.test(h)); ACTIONS.notesall();
  S.notices=[]; notify('only'); ok(!/notesall/.test(notesHTML()),'no toggle for one or two'); VIEW.lang='tr'; try{ ok(trText('Show all (4)')!=='Show all (4)'&&trText('Show fewer')!=='Show fewer'&&trText('Next')!=='Next'); } finally{ VIEW.lang='en'; }
});

})();
