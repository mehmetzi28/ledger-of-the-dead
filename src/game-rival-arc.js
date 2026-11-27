// ===== THE RIVAL'S WAR (R7 PR A) =====
// The rival's story runs in chapters (S.rival.arc). 1 Margins: thefts and challenges, as always. 2 The Open Hand (three
// challenges fought): before a challenge you may stake a Reserve minion against a body from their stash; win and theirs
// joins you Reclaimed (+5% stats), lose and yours joins their book. 3 Fire at the Walls (ten days into chapter 2 and a
// siege held since): the next siege is theirs, the rival and their stolen dead in place of the Inquisitor Captain. Won:
// two stolen bodies come back Reclaimed and their next theft waits; lost: they take a Reserve minion as well.
// arc = {ch, op:{ch:day}, wg:{uid,sk,day}|null, ww, wl, rs (their siege: 0 none, 1 coming, 2 won, 3 lost), rw, f, sw}
const ARC_CH=['','Margins','The Open Hand','Fire at the Walls','Their Own Gate','The Reckoning'];
const ARC_FIGHTS=2, ARC_SIEGE_DAYS=10, ARC_SIEGE_BACK=2, ARC_SIEGE_K=1.25, RECL_K=.05, RECL_LV=3;
const ARC_GATE_DAYS=7, ARC_GATE_WAIT=10, ARC_GATE_K=1.4, ARC_RECL_RAISE=25, ARC_DUEL_K=.9, ARC_DUEL_WAIT=7, ARC_LAST_HEAL=.06, ARC_CLEAN=5, BOOK_K=.1, TWO_BOOKS_MAX=15;
let rivalArcOn=()=>true;   // let: the balance bot keeps chapter 1 with "off":["rivalarc"]
const arc=()=>{ const g=rv(); if(!g.arc||typeof g.arc!=='object') g.arc=arcDef(); return g.arc; };
const ARC_VOICE={   // one line of each rival's own voice as a chapter opens
  2:{'Morwen Ashgrave':'You keep winning. Let us make it cost something.','Corvin Hale':'A wager, scribe. Your dead against mine. Fair is fair.','Isolde Vey':'I tire of stealing. Give me one, and I may give one back.',
     'Silas Marrow':'Stake a body. I always pay my debts. Eventually.','Edric Thorne':'Put one of yours on the table. I will put one of yours back.','Agna Wexley':'Every ledger balances. Shall we see whose does?'},
  3:{'Morwen Ashgrave':'The living hate you more than they fear me. I paid them in your coin.','Corvin Hale':'I brought torches. And friends. Your friends, once.','Isolde Vey':'The town wants you gone. So do I. We agreed on a night.',
     'Silas Marrow':'I told the living where you sleep. They were grateful.','Edric Thorne':'Your walls are old. My dead are not.','Agna Wexley':'They march for their god. I march for my book. Same night.'}
};
const arcVoice=ch=>{ const L=ARC_VOICE[ch], g=rv(); return L&&L[g.name]?g.name+': "'+L[g.name]+'"':''; };
const stashKey=b=>b.day+':'+b.di+':'+b.name;
const gateMob=k=>{ for(const D of DUNGEONS.slice(0,GATE_N)){ const m=D.mobs.find(x=>x[0]===k); if(m) return m; } return null; };
function arcOpen(n,r){   // a chapter opens: the day, a passage and the rival's line
  const a=arc(); if(a.ch>=n) return false; a.ch=n; a.op[n]=S.day; tally('arcCh'+n);
  if(n===2) a.sw=T_('siegeWins'); if(n===3) a.rs=1; if(n===4) a.gu=S.day+ARC_GATE_DAYS; if(n===5) a.rd=S.day+1;
  const m='The rival\'s war, chapter '+n+': '+ARC_CH[n]+'. '+(n===2?'Before a challenge you may now stake a Reserve minion against one of their stolen bodies (the Gates tab).':n===3?'Their next siege is coming, and the rival walks with it.':n===4?'The Rival\'s Ledger, a gate built from the dead they stole, is open on the Gates tab for '+ARC_GATE_DAYS+' days.':n===5?'Their gate has fallen. From tomorrow '+rv().name+' waits for the last duel (the Gates tab).':'');
  if(r&&r.events) r.events.push({m,c:'bad'}); else notify(m,'bad'); const v=arcVoice(n); if(v){ if(r&&r.events) r.events.push({m:v,c:'bad'}); else notify(v,'bad'); }
  unlockStory('rarc'+n,r&&r.events?r:null); return true;
}
function arcTick(r){   // dawn, after a challenge and after a siege: the next chapter, a lapsed wager, their siege's warning
  if(!S||!rivalArcOn()||!rivalOpen()) return; const g=rv(); if(!g.name||!g.met) return; const a=arc();
  if(a.wg&&(a.wg.day<S.day||!wagerLive())) a.wg=null;
  if(a.ch<2&&a.f>=ARC_FIGHTS) arcOpen(2,r);
  if(a.ch===2&&S.day>=(a.op[2]||0)+ARC_SIEGE_DAYS&&T_('siegeWins')>a.sw&&siegeOpen()) arcOpen(3,r);
  if(a.ch===3&&a.rs>=2) arcOpen(4,r);
  if(a.ch===4){ if(a.gu&&S.day>=a.gu){ a.gu=0; a.gr=S.day+ARC_GATE_WAIT; notify('The Rival\'s Ledger closes. '+g.name+' will open it again in '+ARC_GATE_WAIT+' days.','bad'); } else if(!a.gu&&a.gr&&S.day>=a.gr){ a.gr=0; a.gu=S.day+ARC_GATE_DAYS; notify('The Rival\'s Ledger opens again on the Gates tab for '+ARC_GATE_DAYS+' days.','bad'); } }
  if(a.ch===3&&a.rs===1&&siegeWarned()&&a.rw!==sg().next){ a.rw=sg().next; notify(g.name+' has paid the living. Their siege comes with the rival and their stolen dead in the Captain\'s place.','bad'); }
}
// ----- Wagers (chapter 2+)
const wagerOpen=()=>!!S&&rivalArcOn()&&rivalOpen()&&arc().ch>=2&&rivalWarned()&&S.mode==='town'&&(rv().stash||[]).length>0;
function theirStake(m){   // the stash body they put up against m: the closest at m's tier or above; never above their best
  if(!m) return null; const L=(rv().stash||[]).filter(b=>b.rankI>=m.rankI).sort((x,y)=>x.rankI-y.rankI||(x.elite-y.elite)||(y.day-x.day)); return L[0]||null; }
const canStake=m=>!!m&&(S.reserve||[]).includes(m)&&!m.lk&&!m.boss&&!m.tw&&!!gateMob(m.kind||m.name)&&!!theirStake(m);
function wager(uid){   // stake a Reserve minion for today's (or tomorrow's) challenge; null withdraws it
  if(!wagerOpen()) return false; const a=arc();
  if(uid==null){ a.wg=null; return true; }
  const m=(S.reserve||[]).find(x=>x.uid===uid), b=theirStake(m); if(!canStake(m)||!b) return false;
  a.wg={uid,sk:stashKey(b),day:rv().next}; return true;
}
const wagerMine=()=>{ const a=arc(); return a.wg?S.army.concat(S.reserve||[],S.waiting||[]).find(m=>m.uid===a.wg.uid&&!m.thrall&&!m.wall)||null:null; };   // staked from the Reserve; it may have stepped into the army since
const wagerTheirs=()=>{ const a=arc(); return a.wg?(rv().stash||[]).find(b=>stashKey(b)===a.wg.sk)||null:null; };
const wagerLive=()=>{ const a=arc(); return !!a.wg&&!!wagerMine()&&!!wagerTheirs(); };
function bodyMinion(b,why){   // a stolen body comes back to you: Reclaimed, at your level less a little, to the Reserve first
  const lv=Math.max(1,S.player.lvl-RECL_LV), m={uid:++S.uid,armed:false,eq:null,nick:freeNick(),name:b.name,kind:b.base,role:b.role,rankI:b.rankI,lvl:lv,lvl0:lv,xp:0,boss:false,elite:!!b.elite,hf:b.hf,af:b.af,hp:1,maxHp:null,atk:0,stage:0,
    traits:[b.cd&&CORPSE_CONDS[b.cd]?CORPSE_CONDS[b.cd].trait:rollTrait([])],recl:1};
  if(b.cd&&CORPSE_CONDS[b.cd]) m.cd=b.cd; m.traits=m.traits.filter(Boolean);
  syncMinion(m); m.hp=m.maxHp; const w=placeMinion(m,true); tally('reclaimed'); return {m,w};
}
function minionBody(m){   // one of yours goes into their book (a lost wager, their siege won)
  returnGear(m); S.reserve=(S.reserve||[]).filter(x=>x!==m); S.army=S.army.filter(x=>x!==m); S.waiting=(S.waiting||[]).filter(x=>x!==m); bondsClean();
  const k=gateMob(m.kind||m.name), b={base:k[0],name:m.name,role:k[1],rankI:m.rankI,hf:k[2],af:k[3],elite:!!m.elite,di:clamp(m.rankI,0,GATE_N-1),day:S.day,mine:m.nick};
  if(m.cd&&CORPSE_CONDS[m.cd]) b.cd=m.cd; const g=rv(); g.stash.push(b); g.stash=g.stash.slice(-RIVAL_STASH); return b;
}
function wagerSettle(won,r){   // rivalBeaten / rivalLost
  const a=arc(); if(!wagerLive()){ a.wg=null; return; } const m=wagerMine(), b=wagerTheirs(), g=rv(); a.wg=null;
  if(won){ g.stash=g.stash.filter(x=>x!==b); const p=bodyMinion(b); a.ww++; tally('wagerWins'); log('The wager is yours: '+p.m.nick+', once '+withArticle(b.base)+', comes back Reclaimed'+(p.w==='reserve'?' to your Reserve':p.w==='army'?' to your army':' and waits at the gate')+'.','ok'); }
  else { minionBody(m); a.wl++; tally('wagerLosses'); const t=m.nick+' goes into '+g.name+'\'s book. They will raise it against you.'; if(r&&r.events) r.events.push({m:t,c:'bad'}); else notify(t,'bad'); }
}
// ----- Their siege (chapter 3)
const rivalSiegeNow=()=>!!S&&rivalArcOn()&&rivalOpen()&&!!rv().name&&arc().ch===3&&arc().rs===1;
function rivalSiegeWave(list,r){   // spawnSiege, the last wave: the rival and their stolen dead instead of the Captain and the living
  list.length=0; const riv=makeRival(r.di,siegeLvl()+SIEGE_BOSS_LV); riv.rsiege=1; riv.maxHp=riv.hp=Math.round(riv.maxHp*ARC_SIEGE_K); riv.atk=Math.round(riv.atk*ARC_SIEGE_K);   /* a challenge's rival, a quarter stronger: the walls and the town's perks are on your side */ list.push(riv); rivalFollowersAdd(list,r.di,riv); list.forEach(e=>{ if(e!==riv) e.living=false; });
  r.rivalSiege=1; tally('rivalSieges');
}
function rivalSiegeDown(e,r){ r.rsDown=1; log(rv().name+' falls back from the walls, and their dead fight on without them.','ok'); log(rivalTaunt('beaten',rv().wins+T_('rivalSieges')),'boss'); }
function rivalSiegeWon(r){   // siegeWon: two stolen bodies come back, and the next theft waits
  const a=arc(), g=rv(); a.rs=2; tally('rivalSiegeWins'); g.steal=Math.max(g.steal||0,S.day)+theftGap();
  const back=g.stash.splice(-ARC_SIEGE_BACK,ARC_SIEGE_BACK).map(b=>bodyMinion(b).m.nick);
  r.events.push({m:g.name+'\'s siege is broken.'+(back.length?' '+back.join(' and ')+' come'+(back.length===1?'s':'')+' back to you Reclaimed.':'')+' Their next theft will wait.',c:'ok'});
  unlockStory('rarc3w',r); arcTick(r);
}
function rivalSiegeLost(r){   // siegeLost: they take one of your Reserve as well
  const a=arc(), g=rv(); a.rs=3; tally('rivalSiegeLosses');
  const m=(S.reserve||[]).filter(x=>!x.lk&&!x.boss&&!x.tw&&gateMob(x.kind||x.name)).sort((x,y)=>x.lvl-y.lvl)[0];
  if(m){ minionBody(m); notify(g.name+' carries '+m.nick+' away from your Reserve in the smoke.','bad'); }
  arcTick(r);
}
function arcFix(o,g){   // rivalFix: the arc; a save from before it starts in chapter 2 after three encounters
  const d=arcDef(), n=(v,def)=>typeof v==='number'&&isFinite(v)?Math.floor(v):def; if(!o||typeof o!=='object'||Array.isArray(o)){ if(g.enc>=ARC_FIGHTS){ d.ch=2; d.f=g.enc; d.op={2:Math.max(1,g.met||1)}; } return d; }
  d.ch=clamp(n(o.ch,1),1,5); for(const k of ['ww','wl','rw','f','sw','gu','gr','rd','ed']) d[k]=Math.max(0,n(o[k],0)); d.pick=d.ch===5&&o.pick?1:0; d.end=d.ch===5&&(o.end==='ended'||o.end==='spared')?o.end:null; if(d.end) d.pick=0; if(d.ch!==4){ d.gu=0; d.gr=0; } if(d.ch!==5) d.rd=0; if(!d.end) d.ed=0; d.rs=clamp(n(o.rs,0),0,3); if(d.ch<3) d.rs=0; else if(!d.rs) d.rs=1;
  if(o.op&&typeof o.op==='object') for(let c=2;c<=d.ch;c++) if(n(o.op[c],0)>0) d.op[c]=n(o.op[c],0);
  if(o.wg&&typeof o.wg==='object'&&typeof o.wg.uid==='number'&&typeof o.wg.sk==='string'&&d.ch>=2) d.wg={uid:o.wg.uid,sk:o.wg.sk.slice(0,80),day:Math.max(0,n(o.wg.day,0))};
  return d;
}
// ----- UI
function arcTrackHTML(){   // the Rival's page: the five chapters, the one you are in, and what opens the next
  const a=arc(), need={2:ARC_FIGHTS+' challenges fought ('+Math.min(a.f,ARC_FIGHTS)+'/'+ARC_FIGHTS+')',3:'chapter 2 open for '+ARC_SIEGE_DAYS+' days, and a siege held',4:'their siege fought',5:'their gate cleared'};
  return '<p class="group-h">The rival\'s war</p><ol class="arc-track">'+[1,2,3,4,5].map(c=>'<li class="'+(c<a.ch?'done':c===a.ch?'on':'')+'"><b>'+ARC_CH[c]+'</b>'+(c===a.ch?' <span class="dim">&middot; now</span>':c>a.ch?' <span class="dim">&middot; '+need[c]+'</span>':'')+'</li>').join('')+'</ol>'
   +(a.ch===3?'<p class="u-sub">'+(a.rs===1?'Their siege is coming: the rival and their stolen dead hold the last wave.':a.rs===2?'You broke their siege. The rival is gathering what dead they have left.':'Their siege burned your walls. The rival is gathering their dead.')+'</p>':'')
   +(a.ww||a.wl?'<p class="u-sub">Wagers: '+a.ww+' won, '+a.wl+' lost.</p>':'');
}
function wagerHTML(){   // the Gates tab, under the rival's warning: stake a Reserve minion
  if(!wagerOpen()) return ''; const a=arc(), g=rv();
  if(wagerLive()){ const m=wagerMine(), b=wagerTheirs(); return '<div class="rival-line wager"><b>Wager:</b> your '+m.nick+' ('+RANKS[m.rankI]+') against their '+b.name+' ('+RANKS[b.rankI]+(b.elite?', elite':'')+'). Win and it joins you Reclaimed; lose and '+m.nick+' joins their book. <button class="btn small" data-a="wager" data-k="none">Withdraw</button></div>'; }
  const ok=(S.reserve||[]).filter(canStake);
  return '<div class="rival-line wager"><b>'+g.name+' offers a wager.</b> Stake a Reserve minion against a body from their stash, at its rank or higher.'+(ok.length?'<div class="chips">'+ok.map(m=>{ const b=theirStake(m); return '<button class="btn small" data-a="wager" data-k="'+m.uid+'">'+m.nick+' ('+RANKS[m.rankI]+') for '+b.name+' ('+RANKS[b.rankI]+')</button>'; }).join('')+'</div>':' <span class="dim">No Reserve minion they would take: they want a body from the gates, unlocked, of a rank they hold.</span>')+'</div>';
}
// ----- Story
STORY.push(
  {act:5,id:'rarc2',t:'An offer in red ink',m:'A letter on the gate this morning, sealed with your own wax. The rival writes a careful hand: they will stand their dead against yours, one for one, and the better keeper keeps both. The Ledger did not like the letter. It kept it anyway.'},
  {act:5,id:'rarc3',t:'They came with torches and a friend',m:'The living have found an ally. The pedlar at the back gate swears the town\'s captain dined with a stranger in red, who paid in coins from your own crypt. Tonight the torches on the hill road will have someone else\'s dead marching behind them.'},
  {act:5,id:'rarc3w',t:'The walls and the margins',m:'They came with torches and with stolen dead, and both broke on your walls. In the morning you found two of your old names lying among the living, and they rose for you as if they had never been away. The Ledger wrote them in again, in the first ink.'});
['rarc2','rarc3','rarc3w'].forEach(id=>{ STORY_BY[id]=STORY.find(s=>s.id===id); });
// ===== R7 PR B: their gate, the reckoning, the endings, the rival uniques, the ally =====
// ----- The Rival's Ledger (chapter 4): four rooms built from what they stole, open ARC_GATE_DAYS days, again after ARC_GATE_WAIT
const rgOpen=()=>!!S&&rivalArcOn()&&!!S.rival&&arc().ch===4&&arc().gu>0&&S.day<arc().gu;
const rgReady=()=>rgOpen()&&S.mode==='town'&&S.watches>0;
function startRivalGate(){
  if(!rgReady()||!mapCan(gateNode(topGate()))) return false; const di=topGate(); mapGo(gateNode(di)); S.watches--; S.runs++; S.notices=[]; tally('rgRuns');
  S.run={di,rg:1,room:0,rooms:4,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:null,heat:0};
  S.mode='battle'; titheSouls(); log('You open the Rival\'s Ledger. Every page is a body they took from you.'); spawnRoom(); return true;
}
function stashFoe(b,lvl,sg,elite){ const s=mobStats(sg,lvl,b.hf,b.af,false,elite||b.elite);
  const e={id:'e'+(++S.uid),name:b.name,base:b.base,role:b.role,rankI:b.rankI,lvl,hf:b.hf,af:b.af,boss:false,elite:!!(elite||b.elite),follower:true,stash:1,sk:stashKey(b),maxHp:s.hp,hp:s.hp,atk:s.atk,dead:false};
  if(b.aff) e.aff=b.aff.slice(); if(b.cd) e.scd=b.cd; return e; }
function rgRoom(list,di,room,lvl){   // makeRoom for the Rival's Ledger: their followers, their winnings, their best, their lieutenant
  lvl=Math.max(lvl,S.player.lvl+Math.floor(room/2)+(room===3?1:0));   /* their gate keeps pace with you: never below your level */
  const r=S.run, g=rv(), sg=Math.max(di,topGate()), used=r.rgUsed=r.rgUsed||[], free=()=>g.stash.filter(b=>!used.includes(stashKey(b))), top=()=>free().sort((a,b)=>b.rankI-a.rankI||(b.elite-a.elite))[0], take=b=>{ used.push(stashKey(b)); return b; };
  const fill=n=>{ while(list.length<n) spawnOne(list,di,lvl); };
  if(room===0){ const t=top(); free().filter(b=>!b.mine&&b!==t).slice(-3).forEach(b=>list.push(stashFoe(take(b),lvl,sg))); fill(3); }
  else if(room===1){ const t=top(), mine=free().filter(b=>b.mine&&b!==t), rest=free().filter(b=>!b.mine&&b!==t); mine.concat(rest).slice(0,3).forEach(b=>list.push(stashFoe(take(b),lvl,sg))); fill(3); }
  else if(room===2){ const best=top(); if(best) list.push(stashFoe(take(best),lvl+1,sg,true)); else spawnOne(list,di,lvl+1); if(!best) list[0].elite=true; fill(3); }
  else { const m=S.army.filter(x=>!x.thrall&&!x.wall).sort((a,b)=>b.atk*b.maxHp-a.atk*a.maxHp)[0], s=mobStats(sg,lvl+2,m?m.hf:1,m?m.af:1,true,false);
    const e={id:'e'+(++S.uid),name:m?'Reflection of '+m.nick:g.name+'\'s Lieutenant',base:m?m.kind||m.name:RIVAL_KIND,role:m?m.role:'reaper',rankI:sg,lvl:lvl+2,hf:m?m.hf:1,af:m?m.af:1,boss:true,elite:false,rgLt:1,maxHp:s.hp,hp:s.hp,atk:s.atk,dead:false};
    giveAbility(e,'sunder'); list.push(e); free().slice(-2).forEach(b=>list.push(stashFoe(take(b),lvl,sg))); fill(3); }
  for(const e of list){ e.maxHp=e.hp=Math.round(e.maxHp*ARC_GATE_K); e.atk=Math.max(1,Math.round(e.atk*ARC_GATE_K)); }
}
function rgCleared(r){   // the lieutenant's room falls: chapter 5
  const a=arc(); r.cleared=true; a.gu=0; a.gr=0; tally('rgClears'); r.events.push({m:'The Rival\'s Ledger is closed for good. Its last page names '+rv().name+'.',c:'ok'}); arcOpen(5,r); return Math.round(RK[r.di].clear);
}
const rgRaise=c=>S.run&&S.run.rg&&c&&c.recl?ARC_RECL_RAISE:0;   // raiseChance: a stolen body is easier to take back in their own gate
// ----- The Reckoning (chapter 5): the duel with their whole book
const reckReady=()=>!!S&&rivalArcOn()&&!!S.rival&&arc().ch===5&&!arc().end&&!arc().pick&&S.day>=arc().rd&&S.mode==='town'&&S.watches>0;
function startReckoning(){
  if(!reckReady()||!mapCan(gateNode(topGate()))) return false; const di=topGate(); mapGo(gateNode(di)); S.watches--; S.runs++; S.notices=[]; tally('reckTries');
  S.run={di,rk:1,room:0,rooms:1,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:null,heat:0};
  S.mode='battle'; titheSouls(); unlockStory('rarc5d'); log('Torn pages cover the floor, one for every body '+rv().name+' ever took from you.'); spawnRoom(); return true;
}
function reckRoom(list,di,lvl){ const riv=makeRival(di,lvl); riv.reck=1; riv.maxHp=riv.hp=Math.round(riv.maxHp*ARC_DUEL_K); riv.atk=Math.round(riv.atk*ARC_DUEL_K); giveKit(riv,[RIVAL_ABIL].concat(Object.values(RIVAL_MOVE))); list.push(riv); rivalFollowersAdd(list,di,riv); }
function reckLastPage(e){   // checkPhase: The Last Page, they burn their own followers to heal 10% each
  const r=S.run, burn=r.enemies.filter(x=>x!==e&&x.hp>0&&x.follower); if(!burn.length) return;
  const g=rv(); burn.forEach(x=>{ if(x.sk) g.stash=g.stash.filter(b=>stashKey(b)!==x.sk); }); r.enemies=r.enemies.filter(x=>!burn.includes(x));
  const h=Math.round(e.maxHp*ARC_LAST_HEAL*burn.length); e.hp=Math.min(e.maxHp,e.hp+h); log('The Last Page: '+e.name+' burns '+burn.length+' of their own dead and heals '+h+'.','bad');
}
function reckDown(e,r){ arc().pick=1; tally('reckWins'); r.reckWon=1; moment(e.name+' kneels','gold'); log(e.name+' kneels in the torn pages. Their fate is yours to write.','story'); }
function reckCleared(r){ r.cleared=true; r.events.push({m:rv().name+' kneels. Choose their fate on the Gates tab: end them, or spare them.',c:'ok'}); return Math.round(RK[r.di].clear); }
function reckLost(r){   // fell or fled with the rival standing: one more body, and the duel again in a week
  const a=arc(), g=rv(); a.rd=S.day+ARC_DUEL_WAIT; tally('reckLosses'); const m=(S.reserve||[]).filter(x=>!x.lk&&!x.boss&&!x.tw&&gateMob(x.kind||x.name)).sort((x,y)=>x.lvl-y.lvl)[0];
  notify(g.name+' stands over you in the torn pages.'+(m?' They take '+m.nick+' from your Reserve.':'')+' They will wait for you again in '+ARC_DUEL_WAIT+' days.','bad'); if(m) minionBody(m);
}
const reckStanding=r=>!!(r&&r.rk&&r.enemies.some(e=>e.reck&&e.hp>0));
// ----- The endings
const RIVAL_UQ=['r1','r2','r3'];
function arcEnd(k){   // after the duel: 'end' or 'spare'
  const a=arc(), g=rv(); if(!a.pick||a.end||S.mode!=='town'||(k!=='end'&&k!=='spare')) return false; a.pick=0; a.ed=S.day; if(g.thefts<ARC_CLEAN) tally('arcClean');
  if(k==='end'){ a.end='ended'; tally('rivalEnded'); const got=RIVAL_UQ.filter(id=>addItem(id,null)).map(id=>ITEM[id].name), back=g.stash.map(b=>bodyMinion(b).m.nick); g.stash=[];
    notify('You end '+g.name+'. Their ledger is yours: '+got.join(', ')+'.'+(back.length?' '+back.length+' stolen bodies come home Reclaimed.':''),'ok'); unlockStory('rend'); }
  else { a.end='spared'; tally('rivalSpared'); S.ally=allyFix({name:g.name,ngp:S.ngp||0,week:0,aid:-1,stash:g.stash.slice()}); g.stash=[];
    notify('You spare '+g.name+'. They close their ledger and kneel. In the next cycle they will stand with you.','ok'); unlockStory('rspare'); }
  checkTitles(); return true;
}
// ----- The ally (New Game+ after sparing): a weekly body trade, and the first siege of each cycle's first wave
const allyOn=()=>!!S&&!!S.ally&&(S.ngp||0)>S.ally.ngp;
function allyOffer(){ if(!allyOn()||S.ally.week===trialWeek()||!S.ally.stash.length) return null; return S.ally.stash[dayHash(trialWeek(),S.ngp||0,61)%S.ally.stash.length]; }
const allyCan=m=>{ const b=allyOffer(); return !!b&&!!m&&(S.reserve||[]).includes(m)&&!m.lk&&!m.boss&&!m.tw&&!!gateMob(m.kind||m.name)&&m.rankI===b.rankI; };
function allyTrade(uid){ if(S.mode!=='town') return false; const m=(S.reserve||[]).find(x=>x.uid===uid), b=allyOffer(); if(!allyCan(m)) return false;
  S.ally.stash=S.ally.stash.filter(x=>x!==b); const mb=minionBody(m); rv().stash=rv().stash.filter(x=>x!==mb); delete mb.mine; S.ally.stash.push(mb); S.ally=allyFix(S.ally);
  const p=bodyMinion(b); S.ally.week=trialWeek(); tally('allyTrades'); notify(S.ally.name+' takes '+m.nick+' and gives you '+p.m.nick+', once '+withArticle(b.base)+'.','ok'); return true; }
function allyAid(r){   // beginSiege: they hold the first wave alone, once a cycle
  if(!allyOn()||S.ally.aid===(S.ngp||0)) return false; S.ally.aid=S.ngp||0; r.room=1; tally('allyAid'); log(S.ally.name+' holds the first wave alone. Their dead meet the living at the outer wall.','ok'); return true; }
function allyFix(o){ if(!o||typeof o!=='object'||typeof o.name!=='string'||!RIVAL_NAMES.includes(o.name)) return null; const n=(v,d)=>typeof v==='number'&&isFinite(v)?Math.floor(v):d;
  const st=(Array.isArray(o.stash)?o.stash:[]).filter(b=>b&&typeof b==='object'&&gateMob(b.base)).map(b=>{ const k=gateMob(b.base); return {base:k[0],name:typeof b.name==='string'&&b.name?b.name.slice(0,60):k[0],role:k[1],rankI:RK[n(b.rankI,-1)]?n(b.rankI,0):0,hf:k[2],af:k[3],elite:!!b.elite,di:RK[n(b.di,-1)]?n(b.di,0):0,day:Math.max(0,n(b.day,0))}; }).slice(-RIVAL_STASH);
  return {name:o.name,ngp:Math.max(0,n(o.ngp,0)),week:Math.max(0,n(o.week,0)),aid:n(o.aid,-1),stash:st}; }
// ----- The rival uniques and their set
ITEM.r1={id:'r1',name:"The Thief's Quill",slot:'weapon',glyph:'i_rquill',stats:{atk:70,crit:20,intelligence:12},flag:'quill',set:5,tier:5,uq:true,kind:'u',rival:true};
ITEM.r2={id:'r2',name:'Margin-Stitched Coat',slot:'armor',glyph:'i_rcoat',stats:{hp:360,constitution:12,mpow:20,ward:30},flag:'secondhand',set:5,tier:5,uq:true,kind:'u',rival:true};
ITEM.r3={id:'r3',name:'The Other Ledger',slot:'relic',glyph:'i_rledger',stats:{mpow:32,will:14,mana:180,raise:16},flag:'twobooks',set:5,tier:5,uq:true,kind:'u',rival:true};
Object.assign(FLAGS,{quill:'Pickpocket: the first trophy a room drops for you drops twice.',secondhand:'Second Hand: once per run, a minion that would shatter is stolen back and binds instead.',twobooks:'Two Books: +1% raise chance for every body you have won back from the rival, up to 15%.'});
USET.push({name:"The Rival's Book",from:'The rival, ended',ids:RIVAL_UQ.slice(),b:{2:{mpow:10,raise:5},3:{dmgp:8,hpp:6}}}); RIVAL_UQ.forEach(id=>{ ITEM[id].uset=USET.length-1; });
const rivalBook=()=>usetCount(USET.length-1)>=3;   // extraMul: Reclaimed minions take another 10% with all three worn
const quillK=(r,n)=>n&&hasFlag('quill')&&r.qr!==r.room?(r.qr=r.room,2):1;
function secondHand(m,r){ if(!hasFlag('secondhand')||r.shU) return false; r.shU=1; tally('secondHand'); r.events.push({m:'Second Hand: '+m.nick+' is stolen back from the dark.',c:'ok'}); return true; }
const twoBooks=()=>hasFlag('twobooks')?Math.min(TWO_BOOKS_MAX,T_('reclaimed')):0;
// ----- UI for chapters 4-5, the endings and the ally (the Gates tab)
function arcGateHTML(){
  if(!S||S.mode!=='town'||!S.rival||!rivalArcOn()) return ''; const a=arc(), g=rv(); let h='';
  if(rgOpen()) h+='<div class="rival-line arc"><b>The Rival\'s Ledger</b> is open for '+(a.gu-S.day)+' more day'+(a.gu-S.day===1?'':'s')+': four rooms of the dead '+g.name+' took, '+(g.stash||[]).length+' of them yours once. Stolen bodies killed there rise '+ARC_RECL_RAISE+'% easier. <button class="btn small primary" data-a="rgate"'+(S.watches>0?'':' disabled')+'>Enter (1 watch)</button></div>';
  else if(a.ch===4&&a.gr) h+='<div class="rival-line arc">The Rival\'s Ledger is closed. It opens again in '+(a.gr-S.day)+' days.</div>';
  if(a.ch===5&&!a.end&&!a.pick) h+='<div class="rival-line arc"><b>The Reckoning.</b> '+(S.day>=a.rd?g.name+' waits with their whole book: every move their stolen roles give, and a last page at half HP. <button class="btn small primary" data-a="reck"'+(S.watches>0?'':' disabled')+'>Face them (1 watch)</button>':g.name+' will wait for you again in '+(a.rd-S.day)+' days.')+'</div>';
  if(a.pick) h+='<div class="rival-line arc"><b>'+g.name+' kneels.</b> End them: their three uniques and every body they hold come to you. Spare them: they stand with you in the next cycle (a weekly body trade, the first wave of a siege). <button class="btn small warn" data-a="rend" data-k="end">End them</button><button class="btn small" data-a="rend" data-k="spare">Spare them</button></div>';
  const b=allyOffer(); if(b){ const ok=(S.reserve||[]).filter(allyCan); h+='<div class="rival-line arc"><b>'+S.ally.name+' offers a trade:</b> their '+b.name+' ('+RANKS[b.rankI]+') for one of your Reserve of the same rank.'+(ok.length?'<div class="chips">'+ok.map(m=>'<button class="btn small" data-a="atrade" data-k="'+m.uid+'">'+m.nick+'</button>').join('')+'</div>':' <span class="dim">No Reserve minion of that rank.</span>')+'</div>'; }
  return h;
}
STORY.push(
  {act:5,id:'rarc4',t:'A gate of my own dead',m:'There is a new door in the valley, and it is not in any map the Ledger keeps. Behind it the rival has built a gate out of what they stole: your old names, standing in rows, waiting to be read aloud by someone else.'},
  {act:5,id:'rarc5d',t:'Torn pages',m:'The floor is paper. Every page is a body they took, and every one of them is turned toward you. The rival has stopped smiling. Whatever happens here, one of the two books will not be opened again.'},
  {act:5,id:'rend',t:'The pen taken',m:'You took the pen from their hand and wrote the last line in their ledger yourself. It was short. The book shut on it like a door, and the dead it held turned and came home. The Ledger was quiet for a long time afterwards.'},
  {act:5,id:'rspare',t:'Written in red',m:'You let them keep their book and their breath. They closed the ledger and set it at your feet, and did not pick it up again. The Ledger wrote the mercy in red, which it has never done for anything before.'});
['rarc4','rarc5d','rend','rspare'].forEach(id=>{ STORY_BY[id]=STORY.find(s=>s.id===id); });
Object.assign(ARC_VOICE,{4:{'Morwen Ashgrave':'Walk my gate. Count your old names. I counted them every night.','Corvin Hale':'I built it from your leftovers. It is the finest thing I own.','Isolde Vey':'Every stone is someone you lost. Mind your step.',
  'Silas Marrow':'A gate of my own. Interest, on what you owed me.','Edric Thorne':'Come in. Your dead have missed you. Mine have not.','Agna Wexley':'Seven days. Then I close the book on them.'},
 5:{'Morwen Ashgrave':'One book closes tonight. I have made my peace with which.','Corvin Hale':'No more wagers. Everything on the table.','Isolde Vey':'I am tired, scribe. Let us finish it.',
  'Silas Marrow':'All debts come due. Even mine. Even yours.','Edric Thorne':'Bring everything. I have.','Agna Wexley':'The last page. I wrote it years ago. Come and read it.'}});
