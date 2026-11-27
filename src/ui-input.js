function render(){   // draws only: titles and lore are settled by the input handlers (settled), so a drawn and an undrawn turn play the same
  document.body.classList.toggle('hell', S.mode==='town'?ui.tab==='tower':!!(S.run&&S.run.tw));   // hell backdrop on the Tower tab and during a climb
  document.body.classList.toggle('fight', S.mode!=='town');   // a slimmer header while you are in a gate or the Tower
  const f=document.activeElement; let key=null;
  if(f&&f.dataset&&f.dataset.a) key='[data-a="'+f.dataset.a+'"]'+(f.dataset.k?'[data-k="'+f.dataset.k+'"]':'');
  let pips=''; for(let i=0;i<WATCHES;i++) pips+='<i class="pip'+(i<S.watches?' on':'')+'"></i>';
  const tabNote=TAB.blocked?'<div class="note bad tab-note"><span>This game was just saved from another tab. This tab has stopped saving so it cannot overwrite that progress. Close one of the tabs, or load the newer save here.</span><button class="btn small primary" data-a="tabsync">Load the newer save</button></div>':'';
  const mo=MOMENTS.length?'<div class="moments" role="status">'+MOMENTS.map(x=>'<div class="moment '+x.c+(x.k?' big '+x.k:'')+'">'+x.t+'</div>').join('')+'</div>':''; MOMENTS.length=0;
  if(ui.title){ paintApp('',titleHTML(),[],''); try{ scene(); }catch(e){} try{ music(); }catch(e){} return; }   /* R17: the title screen (ui-screens.js) */
  const main=S.mode==='battle'?battleHTML():S.mode==='raise'?raiseHTML():S.mode==='defeat'?defeatHTML():S.mode==='siege'?siegeHTML():townHTML();
  const hdr='<header class="top"><div class="brand"><svg class="sigil" viewBox="0 0 64 64" width="54" height="54" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="32" cy="32" r="30"/><circle cx="32" cy="32" r="24" stroke-dasharray="1.5 3.5"/><rect x="16" y="16" width="32" height="32"/><rect x="16" y="16" width="32" height="32" transform="rotate(45 32 32)"/><circle cx="32" cy="32" r="6"/><circle cx="32" cy="32" r="2" fill="currentColor"/></g></svg><div><h1>Ledger of the Dead</h1><p class="tag">Every name in this book answers to you.</p></div></div><div class="top-meta">'+(S.ngp?'<span class="ngp-b" title="New Game+">NG+'+S.ngp+'</span>':'')+'<span>Day '+S.day+'</span><span title="Gold">'+gold(S.gold)+'</span><span title="Each dungeon you enter uses a watch. When the third is spent, the day closes.">Watches<span class="pips" aria-label="'+S.watches+' of '+WATCHES+' watches left">'+pips+'</span></span></div>'
   +'<button class="gearbtn'+((ui.tab==='settings'&&S.mode==='town')?' on':'')+'" data-a="settings" aria-label="Settings" aria-pressed="'+(ui.tab==='settings'&&S.mode==='town')+'"'+(S.mode==='town'?' title="Settings: save, load, new game"':' disabled title="Settings open when you are back in town"')+'><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M10.3 2h3.4l.5 2.6c.6.2 1.2.5 1.7.9l2.5-.9 1.7 2.9-2 1.7c.1.6.1 1.3 0 1.9l2 1.7-1.7 2.9-2.5-.9c-.5.4-1.1.7-1.7.9l-.5 2.6h-3.4l-.5-2.6c-.6-.2-1.2-.5-1.7-.9l-2.5.9-1.7-2.9 2-1.7a6 6 0 0 1 0-1.9l-2-1.7 1.7-2.9 2.5.9c.5-.4 1.1-.7 1.7-.9zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z"/></svg></button></header>'
   ;
  paintApp(hdr,tabNote+mo+tipHTML()+main,[goalsHTML(),questHTML(),statusHTML(),equipHTML(),townOpen()?bountyHTML():''].filter(Boolean),ui.keys?keysHTML():'');
  try{ cxMark(app); if(document.documentElement) document.documentElement.lang=VIEW.lang; }catch(e){}
  if(key){ const n=app.querySelector(key); if(n){ n.focus({preventScroll:true}); if(n.tagName==='INPUT'&&n.type==='search'){ const l=n.value.length; try{ n.setSelectionRange(l,l); }catch(e){} } } }
  const scr=S.mode+'|'+(S.mode==='town'?ui.tab:(S.run?(S.run.tw||'g')+':'+S.run.room:''));   // entering a gate, a new room or another tab starts at the top
  if(ui.scr&&ui.scr!==scr&&typeof window.scrollTo==='function') try{ window.scrollTo(0,0); }catch(e){}
  ui.scr=scr;
  if(ui.goto){ const g=document.getElementById(ui.goto); ui.goto=null; if(g&&g.scrollIntoView) try{ g.scrollIntoView({block:'start',behavior:VIEW.calm?'auto':'smooth'}); }catch(e){} }   // a What next button: its panel
  if(ui.shake&&!VIEW.calm){ ui.shake=false; const w=app.querySelector('.main > .win'); if(w) w.classList.add('shake'); }
  try{ bossBg(); }catch(e){} try{ scene(); }catch(e){} try{ srAnnounce(); }catch(e){}
  try{ music(); }catch(e){} try{ fxSync(); }catch(e){}   // the battle effects layer (src/fx.js): loads, turns off, or plays what this turn queued
  save();   // every screen saves; outside town the snapshot is "as if you walked out now"
}
const PAINTED={};   // the HTML last written for each part of the page: a part whose HTML is unchanged keeps its DOM (no re-parse, no style recalculation)
function paintApp(hdr,mainH,rail,tail){   // rail: one HTML string per side panel, each a single element
  const P=PAINTED, top=app.firstElementChild, m=top&&app.querySelector('.main'), r=top&&app.querySelector('.rail'), tr=el=>{ try{ trDom(el); }catch(e){} };
  if(top&&top===P.top&&m&&r&&P.lang===VIEW.lang&&P.tail===tail){   // the same page shell as last time: replace only what changed
    if(P.hdr!==hdr){ top.outerHTML=hdr; tr(app.firstElementChild); }
    if(P.main!==mainH||ui.shake){ m.innerHTML=mainH; tr(m); }   // a shake replays its animation on fresh nodes
    const old=P.rail||[], kids=r.children;
    if(old.length===rail.length&&kids&&kids.length===rail.length) rail.forEach((x,i)=>{ if(x!==old[i]){ kids[i].outerHTML=x; tr(r.children[i]); } });   // only the panels that changed
    else if(old.join('')!==rail.join('')){ r.innerHTML=rail.join(''); tr(r); }
  } else { app.innerHTML=hdr+'<div class="layout"><div class="main">'+mainH+'</div><aside class="rail">'+rail.join('')+'</aside></div>'+tail; tr(app); }
  Object.assign(P,{top:app.firstElementChild,hdr,main:mainH,rail,tail,lang:VIEW.lang});
}
const ACTIONS={
  equip:k=>equip(+k), unequip:k=>unequip(k), tab:k=>{ if((k==='tower'&&!towerOpen())||(k==='town'&&!townOpen())) return; ui.tab=k==='ledger'?(ui.ledger||'codex'):k; ui.msg=null; }, bes:k=>{ ui.bes=ui.bes===k?null:k; },
  discard:k=>{ if(ui.confirm==='d'+k){ discard(+k); ui.confirm=null; } else ui.confirm='d'+k; },
  alloc:k=>alloc(k), learn:k=>learnSkill(k),
  ngppick:k=>{ ui.ngpPick=ui.ngpPick===k?null:k; },
  rune:k=>{ const [a,b]=String(k).split('|'); slotRune(a,b); },   // a skill rune (game-builds.js)
  ascpick:k=>{ const a=ascPickList(), i=a.indexOf(k); if(i>=0) a.splice(i,1); else { if(a.length>=ascPicks()) a.shift(); a.push(k); } ui.ascPick=a; ui.confirm=null; },   // the ascension rules (game-asc.js)
  carrypick:k=>{ const a=carryPickList(), i=a.indexOf(k); if(i>=0) a.splice(i,1); else { if(a.length>=carryN()) a.shift(); a.push(k); } ui.carry=a; ui.confirm=null; },   // the carries (game-asc.js)
  ngppact:k=>togglePact(k), cappath:k=>choosePath(k),   // src/ui-progression.js, src/game-progression.js
  ngp:()=>{ if(ui.confirm!=='ngp'){ ui.confirm='ngp'; return; } ui.confirm=null; if(startNGP(ui.ngpPick,ui.ngpPacts,ascPickList(),carryPickList())){ ui.ngpPick=null; ui.ngpPacts=null; ui.ascPick=null; ui.carry=null; ui.tab='gates'; ui.msg=null; ui.exp=''; } },
  tip:k=>dismissTip(k), tipsoff:()=>{ S.tips=S.tips||{}; S.tips.off=1; }, tipson:()=>{ S.tips=S.tips||{}; delete S.tips.off; }, tipsreset:()=>{ S.tips={}; },
  sound:()=>{ SFX.on=!SFX.on; try{ localStorage.setItem('lotd-sound',SFX.on?'on':'off'); }catch(e){} if(SFX.on) sfx('coin'); },
  buypot:k=>{ const c=POTIONS[k].price(); ui.msg=buyPotion(k)?{mk:1,m:'Bought a '+POTIONS[k].name+' for '+c+' gold.',c:'ok'}:null; },
  buyitem:k=>{ const s=shopStock()[+k], c=s&&shopPrice(ITEM[s.id]); ui.msg=buyStock(+k)?{mk:1,m:'Bought '+ITEM[s.id].name+' for '+c+' gold. It is in your bag.',c:'ok'}:null; },
  selltro:k=>{ if(vowAsk('sell')) return; const g=sellTrophy(k,false); ui.msg=g?{mk:1,m:'Sold '+TROPHY[k].name+' for '+g+' gold.',c:'ok'}:null; },
  selltroall:k=>{ if(vowAsk('sell')) return; const n=S.trophies[k], g=sellTrophy(k,true); ui.msg=g?{mk:1,m:'Sold '+n+' '+TROPHY[k].name+' for '+g+' gold.',c:'ok'}:null; },
  sellalltro:()=>{ if(vowAsk('sell')) return; const g=sellAllTrophies(); ui.msg=g?{mk:1,m:'Sold every trophy for '+g+' gold.',c:'ok'}:null; },
  buysalt:()=>{ const c=saltPrice(); ui.msg=buySalt()?{mk:1,m:'Bought Grave Salts for '+c+' gold.',c:'ok'}:null; },
  buysaltmax:()=>{ const r=buySaltMax(); ui.msg=r.n?{mk:1,m:'Bought '+r.n+' Grave Salts for '+r.g+' gold.',c:'ok'}:null; },
  buybag:()=>{ const c=BAG_COST[S.bagLv||0]; ui.msg=buyBag()?{mk:1,m:'Your bag now holds '+bagMax()+' items. Paid '+c+' gold.',c:'ok'}:null; },
  empower:k=>{ const m=findMinion(+k), c=m&&empowerCost(m); ui.msg=empower(+k)?{mk:1,m:m.nick+' rises to level '+m.lvl+'. Paid '+c+' gold.',c:'ok'}:null; },
  forge:k=>{ const a=k.split('|'), res=forgeGear(+a[0],a[1]); ui.msg=res?{mk:1,m:(res.master?'Masterwork! ':'')+'The forge gives you '+ITEM[res.it.id].name+'. It is in your bag.',c:'ok'}:null; },
  hfb:k=>{ ui.hfB=k; ui.hfL=[]; ui.confirm=null; }, hfs:k=>{ ui.hfS=k; ui.confirm=null; },
  hfl:k=>{ const I=hfInfo(ui.hfB||(hfHearts()[0]||'').slice(2)); const want=I?I.n-(I.pw?1:0):2; let l=(ui.hfL||[]).slice(); l=l.includes(k)?l.filter(x=>x!==k):l.concat([k]).slice(-want); ui.hfL=l; ui.confirm=null; },
  hforge:()=>{ const boss=ui.hfB&&hfHearts().includes(hfKey(ui.hfB))?ui.hfB:(hfHearts()[0]||'').slice(2), slot=SLOTS[ui.hfS]?ui.hfS:'weapon'; if(hfGuard(boss)&&ui.confirm!=='hf'){ ui.confirm='hf'; return; } const it=heartforge(boss,slot,(ui.hfL||[]),true); ui.confirm=null; ui.msg=it?{mk:1,m:'The heart burns down to '+ITEM[it.id].name+', heartforged. It is in your bag.',c:'ok'}:null; if(it) ui.hfL=[]; },
  twforge:k=>{ const res=forgeTower(k); ui.msg=res?{mk:1,m:(res.extra?'An extra line! ':'')+'The Tower trophies forge '+ITEM[res.it.id].name+'. It is in your bag.',c:'ok'}:null; },
  hfsw:k=>{ ui.hfsw=ui.hfsw===+k?null:+k; }, hfswap:k=>{ const a=k.split('|'); hfSwap(+a[0],+a[1],a[2]); ui.hfsw=null; },
  spec:k=>{ const a=k.split('|'); ui.msg=chooseSpec(a[0],+a[1],a[2])?{mk:1,m:'The '+BUILD[a[0]].name+' becomes the '+specName(a[0],+a[1],a[2])+'.',c:'ok'}:null; },
  respec:()=>{ if(ui.confirm!=='respec'){ ui.confirm='respec'; return; } ui.confirm=null; const n=respec(); ui.msg=n?{mk:1,m:n+' stat points come back to you. Spend them on the Hero tab.',c:'ok'}:null; },
  embkeep:k=>{ embKeepId(k); },
  embraise:k=>{ const r=embRaise(+k); ui.msg=r?{mk:1,m:r.ok?'The kept body rises: '+r.minion+'.':(r.m||'The kept body does not answer. It is gone.'),c:r.ok?'ok':'bad'}:{mk:1,m:'Your army and the Reserve are full.',c:'bad'}; },
  yardsell:k=>{ const g=yardSell(+k); ui.msg=g?{mk:1,m:'Sold at the Grave Market for '+g+' gold.',c:'ok'}:null; },
  ord:k=>{ pickOrder(+k); },
  tithe:()=>{ const c=payTithe(); ui.msg=c?{mk:1,m:'You pay the Old Shrine '+c+' gold. The town breathes easier.',c:'ok'}:null; },
  standwatch:()=>{ standWatch(); },
  gcall:k=>{ const o=callGodOmen(k||null); ui.msg=o?{mk:1,m:'Your god calls tomorrow\'s omen: '+OMENS[o].name+'.',c:'ok'}:null; },
  gward:()=>{ const o=wardOmen(); ui.msg=o?{mk:1,m:'You ward off tomorrow\'s '+OMENS[o].name+'.',c:'ok'}:null; },
  callomen:()=>{ const id=callOmen(); ui.msg=id?{mk:1,m:'The Temple calls a new omen: '+OMENS[id].name+'.',c:'ok'}:null; },
  brewx:k=>{ const B=BREWS[k]; ui.msg=brewIt(k)?{mk:1,m:'You brew '+B.name+'.'+(B.belt?' It is on your belt.':' It waits in your stash.'),c:'ok'}:null; },
  prep:k=>{ const a=k.split('|'); prepSet(a[0],a[1]||null); },
  burn:k=>{ ui.msg=useCharm(k)?{mk:1,m:'The charm burns down. The next siege comes '+QUIET_DAYS+' days later.',c:'ok'}:null; },
  comm:k=>{ const p=commFill(+k); ui.msg=p?{mk:1,m:'Commission filled: +'+p.g+' gold and +'+p.d+' bone dust.',c:'ok'}:null; },
  bmt:k=>{ const a=k.split('|'), got=bmTrade(a[0],a[1]); ui.msg=got?{mk:1,m:'The black market deals: you get '+got+'.',c:'ok'}:null; },
  brew:k=>{ ui.msg=brew(k)?{mk:1,m:'You brew a '+POTIONS[k].name+' from four trophies.',c:'ok'}:null; },
  raisesalt:k=>{ if(!vowAsk('raise')) tryRaise(k,true); }, raisebest:()=>{ if(!vowAsk('raise')) raiseBest(); }, raiseres:k=>{ if(!vowAsk('raise')) tryRaise(k,false,true); }, raiseressalt:k=>{ if(!vowAsk('raise')) tryRaise(k,true,true); },
  mark:k=>{ const a=k.split('|'); chooseMark(+a[0],a[1]); },
  tores:k=>{ toReserve(+k); }, toarmy:k=>{ toArmy(+k); }, swapo:k=>{ ui.swap=ui.swap===+k?null:+k; }, swap:k=>{ const a=k.split('|'); if(swapReserve(+a[0],+a[1])) ui.swap=null; },
  rsort:k=>{ sortReserve(k); }, gatearmy:k=>{ fromGate(+k,'army'); }, gateres:k=>{ fromGate(+k,'reserve'); },
  event:k=>{ resolveEvent(k); }, door:k=>{ descend(k); }, cmd:k=>{ command(k); }, rally:k=>{ rally(k); }, craftc:k=>{ craftCharm(k); }, mspec:k=>{ const a=String(k).split('|'); chooseMSpec(+a[0],a[1]); }, chall:()=>{ ui.chAll=!ui.chAll; }, charm:v=>{ const a=String(v).split('|'); if(a.length<2) return; if(a[1]==='x') takeCharm(+a[0]); else giveCharm(+a[0],+a[1]); syncArmy(); }, sgn:()=>{ useSgn(); }, wager:k=>{ if(!wager(k==='none'?null:+k)) ui.msg={m:'They will not take that one.',c:'bad'}; },
  rgate:()=>{ startRivalGate(); }, reck:()=>{ startReckoning(); }, rend:k=>{ arcEnd(k); }, atrade:k=>{ if(!allyTrade(+k)) ui.msg={m:'They will not take that one.',c:'bad'}; },   /* the rival's end (game-rival-arc.js) */
  skmod:k=>{ const a=k.split('|'); chooseMod(a[0],a[1]); },
  build:k=>{ const c=buildCost(k); ui.msg=build(k)?{mk:1,m:BUILD[k].name+' raised to level '+bl(k)+' for '+c[0]+' gold'+(c[1]?' and '+c[1]+' bone dust':'')+'.',c:'ok'}:null; },
  claimb:k=>{ const r=claimBounty(+k); if(r) notify('Bounty claimed: '+r+'.','ok'); },
  fusepick:k=>{ ui.fuse=ui.fuse===+k?null:+k; },
  fuse:k=>{ if(ui.confirm!=='fu'+k){ ui.confirm='fu'+k; return; } ui.confirm=null; const was=((S.ti&&S.ti.compounds)||[]).length, m=fuse(ui.fuse,+k), nw=m&&S.ti.compounds.length>was; ui.fuse=null; ui.msg=m?{mk:1,m:'The pit closes over them. '+m.nick+' climbs out at level '+m.lvl+' with '+m.traits.map(t=>TRAITS[t].name).join(', ')+'.'+(nw?' Something new has formed in the pit.':''),c:'ok'}:null; },
  salvage:k=>{ const it=S.inv.find(x=>x.u===+k), nm=it&&ITEM[it.id].name, n=salvage(+k); if(n) sfx('fail'); ui.msg=n?{mk:1,m:'Salvaged '+nm+' into '+n+' bone dust.',c:'ok'}:null; },
  sjunk:()=>{ if(ui.confirm!=='sjunk'){ ui.confirm='sjunk'; return; } ui.confirm=null; const r=salvageJunk(); ui.msg=r&&r.n?{mk:1,m:'Salvaged '+r.n+' piece'+(r.n>1?'s':'')+' of junk into '+r.d+' bone dust.',c:'ok'}:null; },
  ench:k=>{ ui.ench=ui.ench===+k?null:+k; }, cx:k=>{ ui.cx=k; },
  enchadd:k=>{ const it=findItem(+k); ui.msg=enchant(+k,-1)?{mk:1,m:ITEM[it.id].name+' gains a bonus line.',c:'ok'}:null; },
  temper:k=>{ const a=k.split('|'), it=findItem(+a[0]); ui.msg=temper(+a[0],+a[1])?{mk:1,m:'Tempered a line on '+ITEM[it.id].name+'.',c:'ok'}:null; },
  enchline:k=>{ const a=k.split('|'), it=findItem(+a[0]); ui.msg=enchant(+a[0],+a[1])?{mk:1,m:'Re-rolled a line on '+ITEM[it.id].name+'.',c:'ok'}:null; },
  music:()=>{ MUSIC.on=!MUSIC.on; MUSIC.armed=true; try{ localStorage.setItem('lotd-music',MUSIC.on?'on':'off'); }catch(e){} },
  mvol:k=>{ musicSetVol(MUSIC.vol+(+k||0)*.1); },
  titlego:()=>{ ui.title=false; },
  titleslot:k=>{ if(ui.confirm!=='sl'+k){ ui.confirm='sl'+k; return; } ui.confirm=null; if(slotLoad(+k)){ ui.title=false; ui.msg={m:'Loaded slot '+k+'.',c:'ok'}; } },
  titlenew:()=>{ ui.title=false; ui.tab='settings'; S.mode==='town'&&(ui.confirm='new'); },
  view:k=>{ const a=k.split('|'); if(a[0]==='size') VIEW.size=clamp(+a[1]||0,-1,2); else if(a[0]==='calm'||a[0]==='hc'||a[0]==='nobg'||a[0]==='notitle') VIEW[a[0]]=!VIEW[a[0]]; else if(a[0]==='lang'&&LANGS[a[1]]) VIEW.lang=a[1]; else if(a[0]==='fx'&&FX_MODES[a[1]]) VIEW.fx=a[1]; else if(a[0]==='army'&&(a[1]==='grid'||a[1]==='compact')) VIEW.army=a[1]; saveView(); applyView(); },
  dlsave:()=>{ ui.msg=downloadSave()?{m:'Save file downloaded.',c:'ok'}:{m:'This browser would not create the file. Use a save code instead.',c:'bad'}; },
  loadfile:()=>{ if(!ui.file) return; if(ui.confirm!=='lf'){ ui.confirm='lf'; return; } ui.confirm=null; const ok=importText(ui.file.text); ui.msg=ok?{m:'Loaded '+ui.file.name+'.',c:'ok'}:{m:ui.file.name+' is not a valid save.',c:'bad'}; ui.file=null; ui.exp=''; },
  dropfile:()=>{ ui.file=null; }, goal:k=>goGoal(k), fold:k=>{ if(!['equip','quest','bounty','goal'].includes(k)) return; if(VIEW.fold[k]) delete VIEW.fold[k]; else VIEW.fold[k]=true; saveView(); }, sort:k=>{ ui.sort=BAG_SORTS[k]?k:'tier'; }, mk:k=>{ ui.mk=k; ui.msg=null; },
  tabsync:()=>{ TAB.blocked=false; TAB.last=null; loadGame(); ui.tab='gates'; ui.msg=null; },
  lock:k=>{ lockItem(+k); }, asort:k=>{ sortArmy(k); }, mdet:k=>{ ui.mdet=ui.mdet===+k?null:+k; }, mrow:k=>{ setRow(+k); },
  afr:k=>{ ui.afr=ui.afr===k||!ROLES[k]?'':k; }, agb:()=>{ ui.agb=!ui.agb; }, asv:k=>{ ui.asv=AV_SORTS[k]!=null?k:''; }, aqt:k=>{ ui.aqt=k; },   // the Army tab's filters, view order and Quick equip target
  war:()=>{ ui.tab='gates'; ui.gsub='war'; ui.msg=null; }, gdet:k=>{ ui.gdet=ui.gdet===+k?null:+k; }, bsel:k=>{ if(k==='list') ui.tlist=!ui.tlist; else if(BUILD[k]){ ui.bsel=k; ui.tlist=false; } },   // bsel: a building in the Town tab's village, or the list of them all   // gdet: a gate card's Details
  keys:()=>{ ui.keys=!ui.keys; },
  renameo:k=>{ ui.rename=+k; const m=findMinion(+k); ui.rn=m?m.nick:''; }, renamex:()=>{ ui.rename=null; },
  rename:k=>{ if(renameMinion(+k,ui.rn)) ui.rename=null; },
  honour:k=>{ const e=(S.memorial||[])[+k]; if(e&&honour(+k)) notify(e.nick+' is honoured. Your army is Remembered until dawn.','ok'); }, memall:()=>{ ui.memAll=!ui.memAll; }, maus:k=>{ const e=(S.memorial||[])[+k]; if(e&&raiseMaus(+k)) notify('A mausoleum rises over '+e.nick+'. Your minions have +'+Math.round(mausN()*MAUS_K*100)+'% max HP and attack for good.','ok'); },
  head:k=>{ const e=(S.memorial||[])[+k]; if(e&&carveHead(+k)) notify('A headstone for '+e.nick+', tier '+e.hs+'. Your minions have +'+(headBonus()*100).toFixed(1)+'% max HP for good.','ok'); },
  losave:k=>{ const i=+k, L=(S.loadouts||[])[i]; if(L&&L.s&&ui.confirm!=='lo'+i){ ui.confirm='lo'+i; return; } ui.confirm=null; if(saveLoadout(i)) notify('Saved to '+loadoutName(i)+'.','ok'); },
  louse:k=>{ useLoadout(+k); }, loreno:k=>{ ui.lren=+k; ui.lrn=loadoutName(+k); }, lorenx:()=>{ ui.lren=null; }, loren:k=>{ if(renameLoadout(+k,ui.lrn)) ui.lren=null; },
  awaken:k=>{ const it=findItem(+k); ui.msg=awaken(+k)?{mk:1,m:ITEM[it.id].name+' is now Awakened '+AWAKEN_RN[it.aw]+'.',c:'ok'}:null; },
  reforge:k=>{ const it=findItem(+k), c=it&&reforgeCost(it); ui.msg=reforge(+k)?{mk:1,m:'Reforged '+ITEM[it.id].name+' for '+c+' gold.',c:'ok'}:null; },
  rift:k=>{ startRift(+k); }, gsub:k=>{ ui.gsub=['open','war','rift','trial'].includes(k)?k:'open'; ui.msg=null; }, trial:()=>{ startTrial(); },
  rsig:k=>{ toggleSigil(k); },
  attune:k=>{ const ok=attune(+k); ui.msg=ok?{m:'Attuned: its depth rises by '+RB_ATT_STEP+'.',c:'ok'}:null; },
  wdive:()=>{ startWeek(); },
  rheart:()=>{ const k=buyHeart(); ui.msg=k?{m:'The Rift gives up a '+TROPHY[k].name+'.',c:'ok'}:null; },
  runlock:()=>{ const k=unlockSigil(); ui.msg=k?{m:'A new sigil opens: '+SIGILS[k].name+'.',c:'ok'}:null; },
  rdep:k=>{ const b=riftBest(); ui.rd=clamp((ui.rd||b+1)+(+k||0),1,b+1); },
  rcmd:k=>{ ui.rc=+k; ui.rsq=[]; }, rgate:k=>{ ui.rg=+k; ui.rt=tKey({k:'gate',di:+k}); }, rtgt:k=>{ ui.rt=String(k); }, rnight:k=>{ ui.rn=+k; },
  expc:k=>{ const [i,c]=String(k).split('|'); expChoose(+i,c); },
  rsq:k=>{ const u=+k; ui.rsq=(ui.rsq||[]).includes(u)?ui.rsq.filter(x=>x!==u):(ui.rsq||[]).concat([u]); },
  raid:()=>{ const pool=raidPool(), cmds=pool.filter(isCommander).filter(m=>!inOrder(m)), T=expTargets(); const c=cmds.find(m=>m.uid===ui.rc)||cmds[0]; if(!c||!raidGates().length) return;
    const t=T.find(x=>tKey(x)===ui.rt)||T.filter(x=>x.k==='gate').slice(-1)[0], NN=expNights(t.k), n=NN.includes(ui.rn)?ui.rn:NN[0], sel=(ui.rsq||[]).filter(u=>pool.some(m=>m.uid===u&&m!==c&&!inOrder(m))).slice(0,squadMax(c)-1);
    if(sendRaid(c.uid,t.di,sel,t,n)){ ui.msg={mk:1,m:c.nick+' will march on '+tName(t)+' tonight with '+sel.length+' at its back. They fight beside you until nightfall.',c:'ok'}; ui.rsq=[]; ui.rc=null; } },
  recall:k=>{ recallRaid(+k); },
  siegego:()=>{ beginSiege(); }, sguard:k=>{ siegeGuard(k); }, swall:k=>{ siegeWallPick(+k); }, sroad:k=>{ siegeRoadPick(k); }, swork:k=>{ buildWork(k); }, cxgo:k=>{ ui.tab='codex'; ui.cx=k; ui.cxq=''; },
  repair:()=>{ const g=sg(), k=g.dmg, c=repairCost(); if(!k) return; if(ui.confirm!=='repair'){ ui.confirm='repair'; return; } ui.confirm=null; ui.msg=repairBuilding()?{mk:1,m:'The '+BUILD[k].name+' is repaired for '+c+' gold. It works again.',c:'ok'}:null; },
  selltier:k=>{ const t=+k; if(ui.confirm!=='st'+t){ ui.confirm='st'+t; return; } ui.confirm=null; const r=sellTier(t); ui.msg=r&&r.n?{mk:1,m:'Sold '+r.n+' '+TIERS[t]+' piece'+(r.n>1?'s':'')+' for '+r.g+' gold.',c:'ok'}:null; },
  salvtier:k=>{ const t=+k; if(ui.confirm!=='sv'+t){ ui.confirm='sv'+t; return; } ui.confirm=null; const r=salvageTier(t); ui.msg=r&&r.n?{mk:1,m:'Salvaged '+r.n+' '+TIERS[t]+' piece'+(r.n>1?'s':'')+' into '+r.d+' bone dust.',c:'ok'}:null; },
  junk:()=>{ if(ui.confirm!=='junk'){ ui.confirm='junk'; return; } ui.confirm=null; const r=sellJunk(); ui.msg=r&&r.n?{mk:1,m:'Sold '+r.n+' piece'+(r.n>1?'s':'')+' of junk for '+r.g+' gold.',c:'ok'}:null; },
  sellitem:k=>{ if(ui.confirm!=='si'+k){ ui.confirm='si'+k; return; } ui.confirm=null; const it=S.inv.find(x=>x.u===+k), nm=it&&ITEM[it.id].name, g=sellItem(+k); ui.msg=g?{mk:1,m:'Sold '+nm+' for '+g+' gold.',c:'ok'}:null; }, skreset:()=>{ if(ui.confirm==='skreset'){ ui.confirm=null; resetSkills(); } else ui.confirm='skreset'; }, claim:()=>claimQuest(), notesall:()=>{ ui.notesAll=!ui.notesAll; }, dismiss:()=>{ S.notices=currentTip()?S.notices.filter(n=>n.c==='story'):[]; },   /* story notes hidden under a tip were not seen yet */
  enter:k=>startRun(+k), sweep:k=>{ sweep(+k); },
  pick:k=>{ const a=k.split('|'); ui.pick=(ui.pick&&ui.pick.uid===+a[0]&&ui.pick.slot===a[1])?null:{uid:+a[0],slot:a[1]}; },
  give:k=>{ const a=k.split('|'); giveGear(+a[0],+a[1]); ui.pick=null; },
  take:k=>{ const a=k.split('|'); takeGear(+a[0],a[1]); }, settings:()=>{ if(S.mode!=='town') return; ui.tab=ui.tab==='settings'?'gates':'settings'; ui.msg=null; ui.exp=''; },
  slotsave:k=>{ if(slotRead(+k)&&ui.confirm!=='ss'+k){ ui.confirm='ss'+k; return; } ui.confirm=null; ui.msg=slotWrite(+k)?{m:'Saved to slot '+k+'.',c:'ok'}:{m:'Could not write to slot '+k+'. Use a save code instead.',c:'bad'}; },
  slotload:k=>{ if(ui.confirm!=='sl'+k){ ui.confirm='sl'+k; return; } ui.confirm=null; ui.msg=slotLoad(+k)?{m:'Loaded slot '+k+'.',c:'ok'}:{m:'That slot could not be read.',c:'bad'}; ui.exp=''; },
  ult:k=>{ chooseUlt(k); },
  swear:k=>{ if(ui.confirm!=='swear'+k){ ui.confirm='swear'+k; return; } ui.confirm=null; if(swear(k)) notify('You are now the '+FAITH[k].name+'.','ok'); },
  renounce:()=>{ if(ui.confirm!=='renounce'){ ui.confirm='renounce'; return; } ui.confirm=null; if(renounce()) notify('You renounce your oath. The shrine is silent.',''); },
  heat:k=>{ const a=k.split('|'); setHeat(+a[0],+a[1]); },
  bakload:k=>{ if(ui.confirm!=='bl'+k){ ui.confirm='bl'+k; return; } ui.confirm=null; ui.msg=bakLoad(+k)?{m:'Restored the earlier autosave.',c:'ok'}:{m:'That autosave could not be read.',c:'bad'}; ui.exp=''; },
  slotdel:k=>{ if(ui.confirm!=='sd'+k){ ui.confirm='sd'+k; return; } ui.confirm=null; slotDelete(+k); ui.msg={m:'Slot '+k+' deleted.',c:''}; },
  mkcode:()=>{ ui.exp=exportCode(); ui.msg=ui.exp?null:{m:'Could not create a code.',c:'bad'}; },
  copycode:()=>{ const t=document.getElementById('exp'); if(!t) return; const v=t.value;
    const fallback=()=>{ const x=document.getElementById('exp'); let ok=false; if(x){ x.focus(); x.select(); try{ ok=document.execCommand('copy'); }catch(e){} }
      ui.msg=ok?{m:'Code copied.',c:'ok'}:{m:'Copying is blocked here. The code is selected: press Ctrl+C (Cmd+C on a Mac) to copy it.',c:'bad'}; render(); const y=document.getElementById('exp'); if(y&&!ok){ y.focus(); y.select(); } };
    try{ navigator.clipboard.writeText(v).then(()=>{ ui.msg={m:'Code copied.',c:'ok'}; render(); },fallback); }catch(e){ setTimeout(fallback,0); } },
  loadcode:()=>{
    if(ui.confirm!=='lc'){ ui.confirm='lc'; return; } ui.confirm=null;
    if(importCode(ui.imp)){ ui.imp=''; ui.exp=''; ui.msg={m:'Save code loaded.',c:'ok'}; } else ui.msg={m:'That code is not a valid save.',c:'bad'};
  },
  wear:k=>{ wearTitle(k); }, insc:k=>{ if(!titleInscribe(k)){ const w=inscWhy(k); if(w) ui.msg={m:'Cannot inscribe: '+w+'.',c:'bad'}; } }, collsub:k=>{ ui.coll=k==='ms'||k==='cos'?k:'tt'; }, coswear:k=>{ const [kind,id]=String(k).split('|'); cosWear(kind,id||null); },
  cxclear:()=>{ ui.cxq=''; },
  cxq:()=>{},   /* the search box: typing is handled by the input listener; data-a only lets focus come back after a render */
  ttf:k=>{ ui.ttf=(k in {all:1,got:1,locked:1,close:1}||/^r[0-5]$/.test(k))?k:'all'; },
  tower:k=>startTower(+k),
  act:k=>act(k),
  target:k=>setTarget(k), logall:()=>{ ui.logAll=!ui.logAll; },
  flee:()=>flee(),
  raise:k=>{ if(!vowAsk('raise')) tryRaise(k); }, descend:()=>descend(), town:()=>returnTown(), retry:()=>{ retryRoom(); }, rest:()=>restDay(),
  release:k=>{ if(ui.confirm===+k){ release(+k); ui.confirm=null; } else ui.confirm=+k; },
  ending:k=>{ if(ui.confirm==='end:'+k){ ui.confirm=null; if(chooseEnding(k)) ui.lpJust=1; } else ui.confirm='end:'+k; },
  inscribe:k=>{ inscribe(k); },
  lplater:()=>{ ui.lpLater=1; ui.lpJust=0; }, lpopen:()=>{ ui.lpLater=0; ui.lpJust=S.ending?1:0; }, lpseen:()=>{ ui.lpJust=0; },
  cross:k=>{ if(ui.confirm==='x'+k){ scriptCross(+k); ui.confirm=null; } else ui.confirm='x'+k; },   /* the Scriptorium (game-abbey.js): a second press confirms */
  ngmode:k=>{ if(NG_MODES[k]){ ui.ng=Object.assign(ngPick(),{mode:k}); ui.confirm='new'; } }, ngstep:k=>{ const [id,d]=String(k).split('|'), n=ngPick(); if(CUSTOM_KEYS[id]){ let v=n.c[id]+(+d)*CUSTOM_KEYS[id][2]; if(id==='siege'&&v>0&&v<50) v=+d<0?0:50; n.c=custClamp(Object.assign({},n.c,{[id]:v}));   /* siege frequency: off, then 50% and up */ n.mode='custom'; ui.ng=n; ui.confirm='new'; } },
  ngcode:k=>{ const n=ngPick(); ui.ngcode=chRandom(k==='iron',n.mode==='custom'||CUSTOM_PRESETS[n.mode]?n.c:null); ui.ng={mode:'code'}; ui.confirm='new'; },
  plogon:()=>{ plogSet(true); plogTabTime(ui.tab); ui.msg={m:'The play log is on. It stays in this browser.',c:'ok'}; }, plogoff:()=>{ plogTabTime(null); plogSet(false); ui.msg={m:'The play log is off. What it holds is kept until you clear it.',c:''}; },
  plogexp:()=>{ ui.msg=plogDownload()?{m:'Play log downloaded.',c:'ok'}:{m:'This browser would not create the file.',c:'bad'}; }, plogclr:()=>{ if(ui.confirm!=='plc'){ ui.confirm='plc'; return; } ui.confirm=null; plogClear(); ui.msg={m:'The play log is cleared.',c:''}; },
  newgame:()=>{ if(ui.confirm==='new'){ const n=ngPick(); if(n.mode==='code'){ if(!chDecode(ui.ngcode)){ ui.msg={m:'That challenge code is not valid. Check each letter.',c:'bad'}; return; } ui.confirm=null; newChallenge(ui.ngcode); ui.ngcode=''; } else { ui.confirm=null; newGameMode(n.mode,n.c); } ui.ng=null; OPEN_HELP.on=false; ui.tab='gates'; ui.gsub='open'; ui.exp=''; ui.msg=null; } else ui.confirm='new'; }
};
function settled(){ sgTipHide(); if(S&&S.mode==='town') cmdSync(); checkTitles(); try{ loreCheck(); }catch(e){} render(); }   // after an action: award titles and lore passages, then draw
// the vow warning (game-pantheon.js): the first press says what breaks; the next one goes ahead (ui.vowOk for the rest of the day)
function vowAsk(k){ if(!vowWarn(k)||ui.vowOk===k+S.day) return false; ui.vowOk=k+S.day; ui.msg={m:k==='raise'?'Raising another body breaks your vow to Morrow (no more than '+MORROW_RAISE+' in a run). Press again to raise anyway.':'Selling a trophy breaks your vow to Ulm. Press again to sell anyway.',c:'bad'}; return true; }
const CONFIRM_ACTS=['titleslot','titlenew','ngmode','ngstep','ascpick','carrypick','release','respec','cross','ending','hforge','newgame','ngcode','plogclr','ngp','ngppick','skreset','sellitem','discard','slotsave','slotload','slotdel','loadcode','junk','loadfile','fuse','sjunk','bakload','swear','renounce','selltier','salvtier','repair','losave'];   // two-press actions: a click on these keeps the pending confirm
document.addEventListener('click',e=>{
  MUSIC.armed=true;
  const b=e.target.closest('[data-a]'); if(!b||b.disabled) return;
  const a=b.dataset.a;
  if(ui.confirm!==null && !CONFIRM_ACTS.includes(a)) ui.confirm=null;
  ACTIONS[a]&&ACTIONS[a](b.dataset.k); settled();
});
document.addEventListener('toggle',e=>{ const d=e.target; if(d&&d.dataset&&d.dataset.det){ ui.det=ui.det||{}; ui.det[d.dataset.det]=d.open; } },true);   // a folded Details stays open across renders
document.addEventListener('input',e=>{ if(e.target&&e.target.id==='cxq'){ ui.cxq=e.target.value.slice(0,40); settled(); return; } if(e.target&&e.target.id==='imp') ui.imp=e.target.value; if(e.target&&e.target.id==='ngcode') ui.ngcode=e.target.value.slice(0,20); if(e.target&&e.target.id==='rn') ui.rn=e.target.value; if(e.target&&e.target.id==='lrn') ui.lrn=e.target.value; });
document.addEventListener('change',e=>{   // a dropdown with data-a works like a button whose data-k is the chosen value
  const sl=e.target&&e.target.tagName==='SELECT'&&e.target.dataset&&e.target.dataset.a; if(sl&&ACTIONS[sl]){ ACTIONS[sl](e.target.value); settled(); return; }
  // a save file was picked: read it, then ask before loading
  const f=e.target&&e.target.id==='loadfile'&&e.target.files&&e.target.files[0]; if(!f) return;
  if(f.size>2e6){ ui.msg={m:'That file is too large to be a save.',c:'bad'}; settled(); return; }
  const rd=new FileReader(); rd.onload=()=>{ ui.file={name:f.name,text:String(rd.result||'')}; ui.confirm=null; settled(); }; rd.readAsText(f);
});
// Stat glyph tooltip: the stat's name and what it does, at once on hover, and for a few seconds on a tap (a title would be slow and never show on touch).
let sgTip=null, sgTimer=0;
function sgTipShow(g){
  if(!sgTip){ sgTip=document.createElement('div'); sgTip.id='sgtip'; sgTip.setAttribute('role','tooltip'); document.body.appendChild(sgTip); }
  const h=g.dataset.h||SG_HINT[g.dataset.k], b=document.createElement('b'); b.textContent=g.getAttribute('aria-label')||''; sgTip.replaceChildren(b);   /* the label is already in the page's language */
  if(h){ const s=document.createElement('span'); s.textContent=VIEW.lang==='tr'?trText(h):h; sgTip.appendChild(s); }
  sgTip.hidden=false; const r=g.getBoundingClientRect(), w=sgTip.offsetWidth, th=sgTip.offsetHeight;
  sgTip.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px'; sgTip.style.top=(r.top-th-8<8?r.bottom+8:r.top-th-8)+'px';
}
const sgTipHide=()=>{ if(sgTip) sgTip.hidden=true; clearTimeout(sgTimer); };
document.addEventListener('pointerover',e=>{ if(e.pointerType==='touch') return; const g=e.target.closest&&e.target.closest('.sg[data-k]'); if(g) sgTipShow(g); });
document.addEventListener('pointerout',e=>{ if(e.target.closest&&e.target.closest('.sg[data-k]')) sgTipHide(); });
document.addEventListener('pointerdown',e=>{ const g=e.target.closest&&e.target.closest('.sg[data-k]'); if(g&&e.pointerType==='touch'){ sgTipShow(g); clearTimeout(sgTimer); sgTimer=setTimeout(sgTipHide,2600); } else if(!g) sgTipHide(); });
window.addEventListener('scroll',sgTipHide,{passive:true});
window.addEventListener('storage',e=>{   // another tab of this game saved: stop saving here so neither overwrites the other
  if(e.key===SAVE_KEY&&e.newValue!=null&&!TAB.blocked){ TAB.blocked=true; try{ settled(); }catch(x){} } });
window.addEventListener('resize',()=>{ if(VIEW.fx==='auto') try{ applyView(); }catch(e){} });   // Auto effects follow the window size
document.addEventListener('pointerdown',()=>{ if(!MUSIC.armed){ MUSIC.armed=true; music(); } },{once:true});
document.addEventListener('keydown',e=>{
  if(e.target&&e.target.id==='lrn'){ if(e.key==='Escape'){ e.preventDefault(); ui.lren=null; settled(); return; } if(e.key==='Enter'&&ui.lren!=null){ e.preventDefault(); ACTIONS.loren(String(ui.lren)); settled(); } return; }   // typing a loadout's new name
  if(e.target&&e.target.id==='rn'){ if(e.key==='Escape'){ e.preventDefault(); ui.rename=null; settled(); return; } if(e.key==='Enter'&&ui.rename!=null){ e.preventDefault(); ACTIONS.rename(String(ui.rename)); settled(); } return; }   // typing a minion's new name
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  const typing=e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  if(ui.title){ if(!typing&&(e.key==='Enter'||e.key==='Escape'||e.key===' ')&&!(e.target&&e.target.tagName==='BUTTON')){ e.preventDefault(); ui.title=false; settled(); } return; }   /* R17: the title screen */
  if(e.key==='?'&&!typing){ e.preventDefault(); ui.keys=!ui.keys; settled(); return; }   // the shortcut sheet
  if(e.key==='Escape'){ let ch=true;   // closes the sheet, then a pending confirm, a rename, a Gates sub-tab, then any other town tab
    if(ui.keys) ui.keys=false; else if(ui.confirm) ui.confirm=null; else if(ui.rename!=null) ui.rename=null;
    else if(S.mode==='town'&&ui.tab==='gates'&&ui.gsub&&ui.gsub!=='open') ui.gsub='open';
    else if(S.mode==='town'&&ui.tab&&ui.tab!=='gates'){ ui.tab='gates'; ui.gsub='open'; } else ch=false;
    if(ch){ e.preventDefault(); ui.msg=null; settled(); } return; }
  if(ui.keys) return;
  if(S.mode==='town'&&!typing&&/^[1-9]$/.test(e.key)){ const b=app.querySelectorAll('.tabs>.tab:not(.keyhint)')[+e.key-1];   // town: 1-9 switch tabs
    if(b&&!b.disabled&&b.dataset.k){ e.preventDefault(); ACTIONS.tab(b.dataset.k); settled(); } return; }
  if(S.mode==='raise'&&e.target&&!/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)){   // between rooms: 1-4 pick a door
    const r=S.run, ds=r&&!r.cleared&&r.doors; const i=/^[1-9]$/.test(e.key)?+e.key-1:-1;
    if(ds&&i>=0&&i<ds.length){ e.preventDefault(); ACTIONS.door(ds[i]); settled(); }
    else if(e.key===' '&&r&&r.corpses.some(c=>!c.tried)&&!(e.target&&e.target.tagName==='BUTTON')){ e.preventDefault(); ACTIONS.raisebest(); settled(); }   // Space: raise the best
    return; }
  if(S.mode==='defeat'&&!typing&&e.key.toLowerCase()==='r'&&canRetry()){ e.preventDefault(); retryRoom(); settled(); return; }   // R: Instant Retry
  if(S.mode!=='battle') return;
  if(e.key===']'||e.key==='['){ const f=liveFoes(); if(f.length>1){ e.preventDefault(); const i=f.findIndex(x=>x.id===S.run.target); setTarget(f[(i+(e.key==='['?f.length-1:1))%f.length].id); settled(); } return; }   // Tab stays with the browser, so keyboard players can still move between buttons
  if(e.key.toLowerCase()==='g'){ e.preventDefault(); if(canGuard()){ act('guard'); settled(); } return; }   // G: Guard (uses the turn)
  const ord=ORDER_KEYS[e.key.toLowerCase()]; if(ord){ e.preventDefault(); if(command(ord)) settled(); return; }
  let k={'1':'strike','2':'siphon','3':'ward'}[e.key]; if(!k&&e.key.toLowerCase()==='r'&&canUlt()) k='ult'; if(!k&&e.key.toLowerCase()==='t'){ e.preventDefault(); if(useSgn()) settled(); return; }   /* the signature does not use the turn */
  if(!k&&/^[4-9]$/.test(e.key)){ const s=activeSkills()[+e.key-4]; if(s) k='sk:'+s.id; }
  if(!k){ const pk=DRINK_IDS.find(x=>drinkDef(x).key.toLowerCase()===e.key.toLowerCase()); if(pk) k='pot:'+pk; }
  if(k){ e.preventDefault(); act(k); settled(); }
});

// drifting souls and embers
(function(){
  const cv=document.getElementById('embers'); if(!cv||!cv.getContext) return;
  const cx=cv.getContext('2d'); let W=0,H=0,P=[];
  const still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){ const d=Math.min(2,window.devicePixelRatio||1); W=window.innerWidth; H=window.innerHeight; cv.width=W*d; cv.height=H*d; cx.setTransform(d,0,0,d,0,0); }
  function mk(init){ return {x:Math.random()*W,y:init?Math.random()*H:H+12,r:rnd(.7,2.2),vy:rnd(.12,.5),dx:rnd(-.12,.12),ph:Math.random()*6.28,soul:Math.random()<.65}; }
  function draw(t){
    cx.clearRect(0,0,W,H); const hell=document.body.classList.contains('hell');
    for(const p of P){
      const a=.25+.35*Math.sin(t/900+p.ph), c=hell?(p.soul?'255,122,60':'255,190,90'):p.soul?'143,212,106':'224,138,60';   // in the Tower every soul burns
      cx.fillStyle='rgba('+c+','+(a*.18)+')'; cx.beginPath(); cx.arc(p.x,p.y,p.r*4,0,6.283); cx.fill();
      cx.fillStyle='rgba('+c+','+a+')'; cx.beginPath(); cx.arc(p.x,p.y,p.r,0,6.283); cx.fill();
    }
  }
  function step(t){
    if(document.body.classList.contains('calm')){ draw(0); requestAnimationFrame(step); return; }
    const hot=document.body.classList.contains('hell')?2.2:1;
    for(let i=0;i<P.length;i++){ const p=P[i]; p.y-=p.vy*hot; p.x+=p.dx+Math.sin(t/2000+p.ph)*.15; if(p.y<-12) P[i]=mk(false); }
    draw(t); requestAnimationFrame(step);
  }
  size(); const n=W<600?22:44; for(let i=0;i<n;i++) P.push(mk(true));
  window.addEventListener('resize',()=>{ size(); });
  if(still) draw(0); else requestAnimationFrame(step);
})();

applyView(); loadGame(); if(OPEN_HELP.on){ ui.tab='gates'; OPEN_HELP.on=false; } ui.title=!VIEW.notitle&&S.mode==='town'; settled();
plogWrap(ACTIONS);   /* the play log listens to tabs, Codex pages, orders, events and town spending (game-playlog.js) */
try{ window.addEventListener('pagehide',()=>{ plogTabTime(PLOG_TAB&&PLOG_TAB.k); plogFlush(); }); }catch(e){}
