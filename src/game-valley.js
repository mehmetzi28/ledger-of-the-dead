// ===== R13 PR B: A LIVING VALLEY =====
// Five more curses, ten events between rooms, three three-step chains tied to their gates, and three omens. The tables join the old
// ones (MODS, EVENTS, OMENS in game-gate-rules.js; CHAIN_EV in game-faith-story.js); the rules are hooks named below.
// ----- curses
Object.assign(MODS,{
  hunger:{name:'Hunger',desc:'Your Souls drain by one at the start of each room.'},
  mirror:{name:'Mirror',desc:'Every foe takes your army\'s most common trait: a wound trait (Venomous, Necrotic, Cinderborn, Rimeborn) on its hits, any other as +15% HP and attack.'},
  silent:{name:'Silent',desc:'No free orders: Taunt, Focus, Bone Shield and Execute stay quiet.'},
  long:  {name:'Long',  desc:'The gate has one more room before its master.'},
  thin:  {name:'Thin',  desc:'Only two bodies stay after each room: a boss\'s and the elites\' first.'}
});
const NEW_CURSES=['hunger','mirror','silent','long','thin'], MIRROR_K=1.15, THIN_KEEP=2;
const WOUND_TRAIT={venom:['poison',.2,3],necrotic:['blight',.15,2],cinderborn:['burn',.2,2]};
function curseRoom(r){   // spawnRoom, before roomStart: Hunger
  if(hasRunMod('hunger')&&(r.souls||0)>0){ r.souls--; log('Hunger: a Soul drains away ('+r.souls+' left).','bad'); }
}
function armyTrait(){ const n={}; for(const m of S.army) if(!m.thrall) for(const t of m.traits||[]) n[t]=(n[t]||0)+1; let b=null; for(const t of Object.keys(n)) if(!b||n[t]>n[b]) b=t; return b; }   // the army's most common trait (first met wins a tie)
function mirrorRoom(list){   // buildRoom: Mirror
  if(!hasRunMod('mirror')) return; const t=armyTrait(); if(!t||!TRAITS[t]) return;
  for(const e of list){ if(e.rival) continue; e.traits=(e.traits||[]).filter(x=>x!==t).concat([t]); if(!WOUND_TRAIT[t]&&t!=='rimeborn'){ e.maxHp=e.hp=Math.round(e.maxHp*MIRROR_K); e.atk=Math.max(1,Math.round(e.atk*MIRROR_K)); } }
}
function foeTraitHit(e,tg){   // foeOnHit: a foe's wound trait (a Mirror curse, a nemesis's stolen trait) marks what it hits
  if(!e.traits||!e.traits.length||!(tg.hp>0)) return ''; let x='';
  for(const t of e.traits){ const w=WOUND_TRAIT[t]; if(w){ addDot(tg,w[0],e.atk*w[1],w[2]); if(tg.dots&&tg.dots[w[0]]) x+=', '+DOTS[w[0]].name.toLowerCase(); } else if(t==='rimeborn'&&addSt(tg,'chilled',1)) x+=', chilled'; }
  return x;
}
const silentNow=()=>hasRunMod('silent');   // canCommand
const longRooms=mods=>mods&&mods.includes('long')?1:0;   // startRun (a Trial never draws Long)
function thinRoom(r){   // roomWon: Thin keeps a boss's and the elites' bodies first
  if(!hasRunMod('thin')||r.corpses.length<=THIN_KEEP) return; const k=c=>c.boss?0:c.elite?1:2; const keep=r.corpses.slice().sort((a,b)=>k(a)-k(b)).slice(0,THIN_KEEP);
  const gone=r.corpses.length-keep.length; r.corpses=r.corpses.filter(c=>keep.includes(c)); r.events.push({m:'Thin: '+gone+(gone>1?' bodies crumble':' body crumbles')+' to dust before you can reach '+(gone>1?'them':'it')+'.',c:'bad'});
}
// ----- omens
Object.assign(OMENS,{
  redmist: {name:'Red Mist', desc:'Every unit, yours and theirs, crits 10% more often.'},
  gravewind:{name:'Grave Wind',desc:'+5% chance to raise the dead, and you hold one Soul fewer.'},
  stillair:{name:'Still Air',desc:'Wounds hold still: no damage over time ticks, on either side.'}
});
OMEN_NAT.push('redmist','gravewind','stillair'); GOD_OMENS.dis.push('redmist'); GOD_OMENS.choir.push('gravewind'); GOD_OMENS.vesh.push('stillair');
const MIST_CRIT=.1, WIND_RAISE=5;
const mistCrit=()=>omen()==='redmist'?MIST_CRIT:0;   // foeCrit, mCritCh, pCrit
const windRaise=()=>omen()==='gravewind'?WIND_RAISE:0;   // raiseChance
const windSoul=()=>omen()==='gravewind'?1:0;   // soulCap
const stillAir=()=>omen()==='stillair';   // tickDots
// ----- events between rooms (vl: resolved here)
const VEV={
  mourners:{vl:1,name:'Mourners at the gate',text:'The living have come to the gate with a body on a door. They are not afraid of you today, and they ask nothing.',opts:[['take','Take the body they bring (a free raise)'],['bless','Bless it and send it home (dread -4)'],['pass','Walk past']],when:()=>dreadOn()&&dreadBand().id==='calm'},
  hanged:  {vl:1,name:'The Hanged Choir',text:'Seven singers hang from the rafters, and still they sing. One of them is still moving.',opts:[['cut','Cut them down (lose 15% HP: a hexer\'s body)'],['leave','Leave them singing (Choir devotion +15)'],['pass','Walk past']]},
  patrol:  {vl:1,name:'The lost patrol',text:'A patrol of the living took a wrong turn in the dark. Their torches are nearly out.',opts:[['spare','Spare them (dread -3)'],['raise','Raise them (two free bodies, dread +3)'],['pass','Walk past']]},
  bonemerch:{vl:1,name:'The bone merchant',text:'A dealer in the dead offers a trade: your weakest servant for one of his, sight unseen.',opts:[['swap','Trade your weakest minion for a stranger of this gate'],['pass','Walk past']],off:k=>k==='swap'&&!weakMinion()},
  bell:    {vl:1,name:'A drowned bell',text:'A bell lies in black water. Ring it and the sky answers; muffle it and the sky stays still.',opts:[['ring','Ring it (tomorrow brings an omen)'],['silence','Silence it (no omen tomorrow)'],['pass','Walk past']]},
  statue:  {vl:1,name:'The weeping statue',text:'A stone saint weeps black water into a bowl. Words are cut into its base, half worn away.',opts:[['read','Read the inscription (perhaps a torn page)'],['tears','Take the tears (a mana draught)'],['pass','Walk past']]},
  thief:   {vl:1,name:'The Ledger thief',text:'A masked agent of your rival crouches over a body with a knife and a stolen page.',opts:[['duel','Duel the agent (lose 20% HP: the page or its price)'],['pass','Let them go']],when:()=>!!(S.rival&&S.rival.met)},
  fever:   {vl:1,name:'The fever pit',text:'A pit of hot grave-mud bubbles in the floor. What goes in comes out changed, if it comes out.',opts:[['throw','Throw in your weakest minion (a new trait; 30%: it is lost)'],['pass','Walk past']],off:k=>k==='throw'&&!weakMinion()},
  wagon:   {vl:1,name:'The broken wagon',text:'A wagon of the living lies on its side. The driver is alive, pinned under a wheel; the cargo is trophies.',opts:[['cargo','Take the cargo (3 trophies of this gate)'],['help','Help the driver (dread -2, gold)'],['pass','Walk past']]},
  saint:   {vl:1,name:'The hollow saint',text:'A statue of another god, hollow inside, and something in it is listening.',opts:[['kneel','Kneel (convert to its god, keep 75% of your devotion)'],['break','Break it (Profane devotion +20, dread +2)'],['pass','Walk past']],when:()=>!!faithOf(),off:k=>k==='kneel'&&!faithOf()}
};
Object.assign(EVENTS,VEV);
const VEV_IDS=Object.keys(VEV), FEVER_LOSS=.3, SAINT_KEEP=.75;
const evOk=k=>!EVENTS[k].when||!!EVENTS[k].when();   // rollEvent
const weakMinion=()=>S.army.filter(m=>!m.thrall&&!m.boss&&!m.recl&&!m.cons).sort((a,b)=>a.lvl-b.lvl||(a.stage||0)-(b.stage||0))[0]||null;
function vlBody(r,base,free){ const lvl=RK[r.di].lv+Math.floor(r.room/2); const e=makeEnemy(r.di,lvl,false); if(base){ const row=DUNGEONS[r.di].mobs.find(x=>x[0]===base); if(row){ const s=mobStats(r.di,lvl,row[2],row[3],false,false); Object.assign(e,{name:row[0],base:row[0],role:row[1],hf:row[2],af:row[3],elite:false,maxHp:s.hp,hp:s.hp,atk:s.atk}); } } const c=corpseOf(e); if(free) c.free=true; r.corpses.push(c); return c; }
function valleyEv(ev,ch){   // resolveEvent for the valley's events: {m,c}, or null for a choice that cannot be taken
  const E=EVENTS[ev.id], r=S.run, P=S.player; if(E.opts.every(o=>o[0]!==ch)||(E.off&&E.off(ch))) return null;
  const id=ev.id, gold=k=>{ const g=chainGold(k); chainCoin(g); return g; };
  if(id==='mourners'&&ch==='take'){ const c=vlBody(r,null,true); tally('mourners'); return {m:'You take the body from the mourners. '+c.name+' waits with the others; raising it costs no mana.',c:'ok'}; }
  if(id==='mourners'&&ch==='bless'){ dread(-4); tally('mourners'); return {m:'You bless the dead one and send it home. The living will speak of it (dread -4).',c:'ok'}; }
  if(id==='hanged'&&ch==='cut'){ const d=chainHp(.15), h=HEXER_FOES[r.di], c=vlBody(r,h&&h[0],false); return {m:'You cut the choir down. One of them claws you for '+d+' HP before it dies. '+c.name+'\'s body can be raised.',c:''}; }
  if(id==='hanged'&&ch==='leave'){ const p=faithOf()==='choir'?deed('choir',15/DEED_K.choir/templeDev()):0; return {m:p?'You leave them singing. The Choir hears its own (+15 devotion).':'You leave them singing. No god of yours is listening.',c:p?'ok':''}; }
  if(id==='patrol'&&ch==='spare'){ dread(-3); return {m:'You point the patrol back to the light. They will tell the town the dead let them live (dread -3).',c:'ok'}; }
  if(id==='patrol'&&ch==='raise'){ vlBody(r,null,true); vlBody(r,null,true); dread(3); tally('patrolRaised'); return {m:'The patrol joins the bodies on the floor. Two of them can be raised for free (dread +3).',c:'ok'}; }
  if(id==='bonemerch'&&ch==='swap'){ const m=weakMinion(); if(!m) return null; returnGear(m); S.army=S.army.filter(x=>x!==m); bondsClean(); const c=vlBody(r,null,true); c.lvl=Math.max(c.lvl,m.lvl); tally('swapped'); return {m:'The merchant takes '+m.nick+' away. In its place, '+c.name+' (Lv '+c.lvl+') waits to be raised for free.',c:''}; }
  if(id==='bell'&&ch==='ring'){ S.omenNext={day:S.day+1,id:pick(OMEN_NAT)}; return {m:'The bell tolls under the water. Tomorrow brings '+OMENS[S.omenNext.id].name+'.',c:'ok'}; }
  if(id==='bell'&&ch==='silence'){ S.omenNext={day:S.day+1,id:null}; return {m:'You muffle the bell with mud. Tomorrow\'s sky will be still.',c:''}; }
  if(id==='statue'&&ch==='read'){ if(findPage('statue',r)) return {m:'You read the worn words, and under the bowl lies a torn page.',c:'ok'}; const xp=chainXp(); return {m:'The words are a prayer for the dead. You learn something from them (+'+xp+' XP).',c:'ok'}; }
  if(id==='statue'&&ch==='tears'){ if(S.belt.mp<beltMax()){ S.belt.mp++; return {m:'You bottle the black tears: a mana draught for your belt.',c:'ok'}; } const g=gold(.5); return {m:'Your belt is full. You sell the tears to the next dead man you meet: '+g+' gold.',c:'ok'}; }
  if(id==='thief'&&ch==='duel'){ const d=chainHp(.2); tally('thiefDuels'); if(findPage('statue',r)) return {m:'You cut the agent down for '+d+' HP of your own and take back the stolen page.',c:'ok'}; const g=gold(1.2); return {m:'You cut the agent down for '+d+' HP of your own. The page burns, but their purse does not: '+g+' gold.',c:'ok'}; }
  if(id==='fever'&&ch==='throw'){ const m=weakMinion(); if(!m) return null; tally('fever');
    if(Math.random()<FEVER_LOSS){ if(consBreak(m,null)) return {m:m.nick+' comes apart in the fever pit. The Workshop can mend it.',c:'bad'}; returnGear(m); S.army=S.army.filter(x=>x!==m); memorialize(m,{g:r.di}); return {m:m.nick+' sinks into the fever pit and does not come back.',c:'bad'}; }
    const old=m.traits.length?m.traits[m.traits.length-1]:null, nt=rollTrait(m.traits.filter(t=>t!==old)); if(old) m.traits[m.traits.length-1]=nt; else m.traits.push(nt); syncMinion(m);
    return {m:m.nick+' crawls out of the pit changed: '+(old?TRAITS[old].name+' is gone, ':'')+TRAITS[nt].name+' instead.',c:'ok'}; }
  if(id==='wagon'&&ch==='cargo'){ const row=DUNGEONS[r.di].mobs[0], key=row[0]; r.troph=r.troph||{}; r.troph[key]=(r.troph[key]||0)+3; return {m:'You take the cargo: 3 '+key+' trophies.',c:'ok'}; }
  if(id==='wagon'&&ch==='help'){ dread(-2); const g=gold(.6); return {m:'You lift the wheel. The driver pays you '+g+' gold and swears he never saw you (dread -2).',c:'ok'}; }
  if(id==='saint'&&ch==='kneel'){ const g=ev.g, dev=(S.faith&&S.faith.dev)||0; if(!convert(g)) return null; S.faith.dev=Math.floor(dev*SAINT_KEEP); return {m:'You kneel to '+FAITH[g].name+'. Three quarters of your devotion comes with you.',c:'ok'}; }
  if(id==='saint'&&ch==='break'){ dread(2); const p=faithOf()==='dis'?deed('dis',20/DEED_K.dis/templeDev()):0; return {m:'You break the hollow saint'+(p?'. The Profane approve (+20 devotion).':'.')+' The town hears of it (dread +2).',c:p?'ok':''}; }
  return null;
}
// ----- chains: three steps each, tied to their gates
Object.assign(CHAIN_EV,{
  tanner:{chain:'tanner',start:1,gate:0,name:'A ledger in the vats',text:'Floating in a tanning vat: a ledger of debts, every page signed by the Rat King, every debt unpaid.',get opts(){ return [['take','Take the ledger'],['pass','Leave it in the vat']]; }},
  tanner_2:{chain:'tanner',gate:0,name:'The Rat King\'s creditors',text:'Three dead moneylenders block the tunnel. They want what the Rat King owes, and you carry his ledger.',get opts(){ return [['fight','Fight them off (lose 20% HP, bonus XP)'],['pay','Pay them ('+chainGold(1)+' gold)'],['pass','Not now']]; },off:k=>k==='pay'&&S.gold<chainGold(1)},
  tanner_3:{chain:'tanner',gate:0,name:'Paid in full',text:'The last line of the ledger is a debt to the warren itself. Pay it, and the Rat King\'s name is clean.',get opts(){ return [['settle','Settle the debt in his name ('+chainGold(1.5)+' gold)'],['pass','Not now']]; },off:k=>k==='settle'&&S.gold<chainGold(1.5)},
  warden:{chain:'warden',start:1,gate:1,name:'The watch roster',text:'A drowned board lists the crypt\'s night watch. Three names are scratched out; three are not.',get opts(){ return [['take','Take the roster'],['pass','Leave it']]; }},
  warden_2:{chain:'warden',gate:1,name:'Three watchmen',text:'The three watchmen on the roster still keep their posts, rotting in the water. They will not stand down.',get opts(){ return [['rest','Lay them to rest (lose 25% HP, bonus XP)'],['pass','Not now']]; }},
  warden_3:{chain:'warden',gate:1,name:'The last watch',text:'The roster ends with an empty line. Someone has to stand the last watch.',get opts(){ return [['stand','Stand it yourself (lose 20% HP: every Reserve minion gains a level)'],['pass','Not now']]; }},
  ashchoir:{chain:'ashchoir',start:1,gate:3,name:'The missing voice',text:'The cathedral\'s choir of bones sings with a gap in it, one voice missing from every hymn.',get opts(){ return [['listen','Listen for the missing voice'],['pass','Walk past']]; }},
  ashchoir_2:{chain:'ashchoir',gate:3,name:'The lost cantor',text:'Deep under the nave, something hums the missing part, alone.',get opts(){ return [['search','Search the crypts (lose 15% HP)'],['pass','Not now']]; }},
  ashchoir_3:{chain:'ashchoir',gate:3,name:'The cantor found',text:'The Bishop\'s cantor, chained in the dark, still singing. It looks at you and waits.',get opts(){ return [['free','Free it (Choir devotion +50, or a Soul and full mana)'],['bind','Bind it (a cantor\'s body, raised at Elder, free)'],['pass','Not now']]; }}
});
Object.assign(EVENTS,CHAIN_EV); CHAIN_IDS.push('tanner','warden','ashchoir');
Object.assign(CHAIN_NEXT,{tan1:'tanner_2',tan2:'tanner_3',war1:'warden_2',war2:'warden_3',ash1:'ashchoir_2',ash2:'ashchoir_3'});
const chainGate=k=>EVENTS[k].gate==null||!!(S.run&&S.run.di===EVENTS[k].gate);   // chainOk, chainDue
function valleyChain(id,ch,go,end){   // chainResolve, for the three gate chains
  const r=S.run, P=S.player;
  if(id==='tanner'&&ch==='take'){ go('tan1'); return {m:'You fish out the ledger. The Rat King owed everyone.',c:''}; }
  if(id==='tanner_2'&&ch==='fight'){ const d=chainHp(.2), xp=chainXp(); go('tan2'); return {m:'You send the creditors back to their graves. It costs '+d+' HP; +'+xp+' XP.',c:'bad'}; }
  if(id==='tanner_2'&&ch==='pay'){ const g=chainGold(1); S.gold-=g; go('tan2'); return {m:'You pay the creditors '+g+' gold. They cross the debt out and fade.',c:''}; }
  if(id==='tanner_3'&&ch==='settle'){ const g=chainGold(1.5); S.gold-=g; end(); tally('paidFull'); return {m:'You pay '+g+' gold into the warren\'s mud. The Rat King\'s name is clean, and the Ledger marks you Paid in Full.',c:'ok'}; }
  if(id==='warden'&&ch==='take'){ go('war1'); return {m:'You take the roster. Three names wait.',c:''}; }
  if(id==='warden_2'&&ch==='rest'){ const d=chainHp(.25), xp=chainXp(); go('war2'); return {m:'You lay the three watchmen to rest. It costs '+d+' HP; +'+xp+' XP.',c:'bad'}; }
  if(id==='warden_3'&&ch==='stand'){ const d=chainHp(.2), R=(S.reserve||[]).filter(m=>!m.thrall); for(const m of R){ m.lvl=Math.min(S.player.lvl+2,m.lvl+1); syncMinion(m); } end(); tally('lastWatch');
    return {m:'You stand the last watch through the night for '+d+' HP. '+(R.length?'Your Reserve watched with you: '+R.length+' minion'+(R.length>1?'s gain':' gains')+' a level.':'Your Reserve is empty; only you learn from it.'),c:'ok'}; }
  if(id==='ashchoir'&&ch==='listen'){ go('ash1'); return {m:'You hear it, faintly: the missing voice, somewhere below.',c:''}; }
  if(id==='ashchoir_2'&&ch==='search'){ const d=chainHp(.15); go('ash2'); return {m:'You search the crypts for '+d+' HP of scrapes and bites, and find where the humming comes from.',c:''}; }
  if(id==='ashchoir_3'&&ch==='free'){ end(); tally('cantorFreed'); if(faithOf()==='choir'){ deed('choir',50/DEED_K.choir/templeDev()); return {m:'You break the cantor\'s chain. The choir is whole again, and the Choir remembers it (+50 devotion).',c:'ok'}; } const got=gainSoul(); P.mana=pMana(); return {m:'You break the cantor\'s chain. It sings you whole: full mana'+(got?' and a Soul ('+r.souls+'/'+SOUL_MAX+')':'')+'.',c:'ok'}; }
  if(id==='ashchoir_3'&&ch==='bind'){ const c=vlBody(r,'Choir Cantor',true); c.st2=1; end(); tally('cantorBound'); return {m:'You bind the cantor to the Ledger. Its body waits to rise at Elder, for free.',c:'ok'}; }
  return null;
}
const cantorStage=(c,m)=>{ if(!c||!c.st2) return; m.stage=2; m.traits.push(rollTrait(m.traits)); m.traits.push(rollTrait(m.traits)); };   // tryRaise: the bound cantor rises at Elder
PAGE_CHANCE.statue=.5;
