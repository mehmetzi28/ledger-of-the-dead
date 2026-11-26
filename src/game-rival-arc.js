// ===== THE RIVAL'S WAR (R7 PR A) =====
// The rival's story runs in chapters (S.rival.arc). 1 Margins: thefts and challenges, as always. 2 The Open Hand (three
// challenges fought): before a challenge you may stake a Reserve minion against a body from their stash; win and theirs
// joins you Reclaimed (+5% stats), lose and yours joins their book. 3 Fire at the Walls (ten days into chapter 2 and a
// siege held since): the next siege is theirs, the rival and their stolen dead in place of the Inquisitor Captain. Won:
// two stolen bodies come back Reclaimed and their next theft waits; lost: they take a Reserve minion as well.
// arc = {ch, op:{ch:day}, wg:{uid,sk,day}|null, ww, wl, rs (their siege: 0 none, 1 coming, 2 won, 3 lost), rw, f, sw}
const ARC_CH=['','Margins','The Open Hand','Fire at the Walls','Their Own Gate','The Reckoning'];
const ARC_FIGHTS=2, ARC_SIEGE_DAYS=10, ARC_SIEGE_BACK=2, ARC_SIEGE_K=1.25, RECL_K=.05, RECL_LV=3;
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
  if(n===2) a.sw=T_('siegeWins'); if(n===3) a.rs=1;
  const m='The rival\'s war, chapter '+n+': '+ARC_CH[n]+'. '+(n===2?'Before a challenge you may now stake a Reserve minion against one of their stolen bodies (the Gates tab).':n===3?'Their next siege is coming, and the rival walks with it.':'');
  if(r&&r.events) r.events.push({m,c:'bad'}); else notify(m,'bad'); const v=arcVoice(n); if(v){ if(r&&r.events) r.events.push({m:v,c:'bad'}); else notify(v,'bad'); }
  unlockStory('rarc'+n,r&&r.events?r:null); return true;
}
function arcTick(r){   // dawn, after a challenge and after a siege: the next chapter, a lapsed wager, their siege's warning
  if(!S||!rivalArcOn()||!rivalOpen()) return; const g=rv(); if(!g.name||!g.met) return; const a=arc();
  if(a.wg&&(a.wg.day<S.day||!wagerLive())) a.wg=null;
  if(a.ch<2&&a.f>=ARC_FIGHTS) arcOpen(2,r);
  if(a.ch===2&&S.day>=(a.op[2]||0)+ARC_SIEGE_DAYS&&T_('siegeWins')>a.sw&&siegeOpen()) arcOpen(3,r);
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
  d.ch=clamp(n(o.ch,1),1,3); for(const k of ['ww','wl','rw','f','sw']) d[k]=Math.max(0,n(o[k],0)); d.rs=clamp(n(o.rs,0),0,3); if(d.ch<3) d.rs=0; else if(!d.rs) d.rs=1;
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
