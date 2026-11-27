// ===== HERO BUILDS 2.0, R11 PR A: fifth skills, two ultimates, Endurance =====
// Frost and Rot get a fifth skill each (Hoarfrost Lance, Pestilence), so every path holds five. Two more ultimates: Requiem
// (every minion acts again at the end of the turn) and The Long Name (for 3 turns every foe that falls rises at once as a
// thrall for the room). Constitution gains Endurance: past the 5th turn of a fight you and your army deal more damage each turn.
// the constants (LANCE_*, PEST_*, CON_ENDURE*, REQUIEM_MUL, LNAME_TURNS, LONG_HAUL) live in game-data.js: skills, titles and ultimates read them as they load
// ----- Hoarfrost Lance (Frost, active): Siphon as frost, freezes the target, chills its neighbors
const foeNbrs=t=>{ const L=liveFoes(), i=L.indexOf(t); return [L[i-1],L[i+1]].filter(o=>o&&o!==t); };
function useLance(t,rk){
  const fz=t.stun>0, d=hit(pSiph()*(LANCE_BASE+LANCE_STEP*rk)*dmgMul()*skMul()*shadowK()*(fz&&hasMod('lance','a')?LANCE_SHATTER:1)); hurtFoe(t,d,'frost'); fxe('ward',t);
  const held=t.hp>0&&(!t.boss||Math.random()*100<LANCE_BOSS+10*rk);
  if(held){ t.stun=Math.max(t.stun||0,1)+faithFrozen(t); tally('frozen'); }
  const nb=foeNbrs(t); nb.forEach(o=>addSt(o,'chilled',1));
  let spread=null; if(hasMod('lance','b')&&nb.length){ spread=nb.find(o=>!o.boss)||null; if(spread){ spread.stun=Math.max(spread.stun||0,1); tally('frozen'); } }
  log('Hoarfrost Lance strikes '+t.name+' for '+d+(fz&&hasMod('lance','a')?' (shatterpoint)':'')+'.'); log(held?t.name+' freezes solid.':t.name+' shakes off the frost.');
  if(nb.length) log('The cold chills '+nb.length+' foe'+(nb.length>1?'s':'')+' beside it.'); if(spread) log(spread.name+' freezes too.');
  if(hasRune('lance','a')){ const o=liveFoes().filter(x=>x!==t).pop(); if(o){ const d2=Math.round(d*RUNE_GLACIER); hurtFoe(o,d2,'frost'); log('Glacier: the lance runs on into '+o.name+' for '+d2+'.'); } }
  if(hasRune('lance','b')&&fz&&!(t.hp>0)){ S.run.cd.lance=0; log('Cold Snap: the lance is ready again.','ok'); }
}
// ----- Pestilence (Rot, passive): each wound on a foe makes the ticks on it harder
const pestN=u=>Math.min(PEST_MAX,Object.keys((u&&u.dots)||{}).length);
const pestK=u=>{ const rk=sk('pest'); return rk?1+PEST_STEP*rk*pestN(u):1; };   // tickDots, on foes
const pestCrit=()=>hasMod('pest','b')&&Math.random()<critChance();   // Virulence: a tick can crit
function pestDeath(e){   // checkDeaths: Contagion passes one wound to a neighbor
  if(!hasMod('pest','a')||!e.dots||Object.keys(e.dots).length<2) return; const L=liveFoes().filter(o=>o!==e&&!(o.dots&&Object.keys(e.dots).every(k=>o.dots[k])));
  if(!L.length) return; const o=L[0], k=Object.keys(e.dots).find(x=>!(o.dots&&o.dots[x])), w=e.dots[k]; addDot(o,k,w.d,Math.max(2,w.t)); log('Contagion: '+e.name+'\'s '+k+' passes to '+o.name+'.','ok');
}
// ----- Endurance: Constitution in long fights
const endureK=()=>{ const r=S&&S.run; if(!r||!(r.turn>ENDURE_FROM)) return 1; return 1+Math.min(CON_ENDURE_CAP,CON_ENDURE*Math.max(0,A('constitution'))/10*(r.turn-ENDURE_FROM)); };
// ----- the new ultimates
function requiemStrikes(){   // the end of the turn (after the haste strikes): Requiem's second action
  const r=S.run; if(!r||r.requiem!==r.turn) return;
  for(const m of S.army){ if(!(m.hp>0)) continue; const tg=minionTarget(m); if(!tg) break;
    let d=hit(m.atk*dmgMul()*(r.frenzy>0?r.frenzyMul:1)*REQUIEM_MUL*ascUlt()*hexK(m)*rowK(m)*breakK(m,tg)); hurtFoe(tg,d,minionType(m)); fxe('mhit',tg,{by:fxKey(m)}); log('Requiem: '+m.nick+' strikes '+tg.name+' again for '+d+'.'); minionOnHit(m,tg); }
  checkDeaths();
}
function longNameRise(e,r){   // checkDeaths: The Long Name raises the fallen as thralls for the room
  if(!(r.lname>=r.turn)||e.boss||e.rival||e.secret||e.guard||e.echo||e.stash) return false;
  const i=r.corpses.findIndex(c=>c.id==='c'+e.id); if(i<0) return false; const c=r.corpses.splice(i,1)[0], lv=Math.min(S.player.lvl,c.lvl);
  const m={uid:++S.uid,armed:false,eq:null,nick:freeNick(),name:c.name,kind:c.base,role:c.role,rankI:c.rankI,lvl:lv,lvl0:lv,xp:0,boss:false,elite:false,hf:c.hf,af:c.af,hp:1,maxHp:null,atk:0,stage:0,traits:[],thrall:true,ln:1};
  syncMinion(m); m.hp=m.maxHp; S.army.push(m); tally('lnThralls'); log('The Long Name: '+e.name+' rises at once to fight for you this room.','ok'); return true;
}
const lnClear=()=>{ if(S&&S.army) S.army=S.army.filter(m=>!m.ln); };   // roomWon and returnTown: the Long Name's thralls go back to the dust
// ----- titles: a fight of LONG_HAUL turns won; a path at five skills of rank 3
const fiveByFive=()=>Object.keys(PATHS).some(p=>PATHS[p].skills.length>=5&&PATHS[p].skills.every(id=>sk(id)>=SK_MAX));
// ===== R11 PR B: signature actives and skill runes =====
// From level SGN_LV the path with the most skill points (ties as capstones: the path chosen on the Skills tab) offers its
// signature: one active, SGN_COST mana, once per room, and it does not use your turn (like a Rally). Forget the skills and lean another way to change it.
const SGN={
  bone:{name:'Ossuary Gate',desc:()=>'Every minion gains a ward of '+capPct(SGN_WARD)+' of its max HP.'},
  blood:{name:'Exsanguinate',desc:()=>'Drain '+capPct(SGN_DRAIN)+' of every foe\'s current HP ('+capPct(SGN_DRAIN_BOSS)+' from bosses), ignoring armor, and mend your army for the total, the most hurt first.'},
  frost:{name:'White Silence',desc:()=>'Freeze every foe that is not a boss for a turn. A boss is Chilled for 2 turns instead, and any move it was charging breaks.'},
  rot:{name:'Bloom of Ruin',desc:()=>'Every poisoned or blighted foe bursts for '+capPct(SGN_BLOOM)+' of your Siphon as rot, and every foe is Blighted for a turn.'}
};
function sgnPath(){ const P=S&&S.player; if(!P||!P.skills||P.lvl<SGN_LV) return null; const k=Object.keys(PATHS), best=Math.max(...k.map(pathPts)); if(best<CAP_MIN) return null; const t=k.filter(p=>pathPts(p)===best); return t.includes(P.capPath)?P.capPath:t[0]; }
const canSgn=()=>S.mode==='battle'&&!!S.run&&!!sgnPath()&&!S.run.sgnU&&S.player.mana>=SGN_COST&&!(S.run.silence>0)&&liveFoes().length>0;
function useSgn(){
  if(!canSgn()) return false; const r=S.run, P=S.player, p=sgnPath(); P.mana-=SGN_COST; r.sgnU=1; tally('sgnCast'); tally('sgn_'+p);
  if(p==='bone'){ for(const m of S.army) if(m.hp>0){ m.mw=Math.max(m.mw||0,Math.round(m.maxHp*SGN_WARD)); mark(m,0,0); } fxe('ward',P); log('Ossuary Gate: a wall of bone rises around every one of your dead.','ok'); }
  else if(p==='blood'){ let tot=0; for(const o of liveFoes()){ const d=Math.max(1,Math.round(o.hp*(o.boss?SGN_DRAIN_BOSS:SGN_DRAIN))); hurtFoe(o,d,'shad'); tot+=d; }
    let left=tot; for(const a of allies().filter(u=>u.hp>0).sort((x,y)=>x.hp/(x.id==='p'?pMax():x.maxHp)-y.hp/(y.id==='p'?pMax():y.maxHp))){ if(left<=0) break; const need=(a.id==='p'?pMax():a.maxHp)-a.hp; if(need<=0) continue; const h=healAlly(a,Math.min(need,left)); left-=Math.max(h,1); }
    fxe('mend',P); log('Exsanguinate drains '+tot+' HP from your foes into your side.','ok'); }
  else if(p==='frost'){ for(const o of liveFoes()){ if(o.boss) addSt(o,'chilled',2); else o.stun=Math.max(o.stun||0,1); if(o.charging) breakCharge(o,'White Silence breaks '+o.name+'\'s focus.'); mark(o,0,0); } tally('frozen'); log('White Silence: the foes stand frozen in it.','ok'); }
  else { const hit0=liveFoes().filter(o=>o.dots&&(o.dots.poison||o.dots.blight)); let tot=0; for(const o of hit0){ const d=hit(pSiph()*SGN_BLOOM*pierceMul(1)*skMul()); hurtFoe(o,d,'rot'); fxe('burst',o); tot+=d; }
    for(const o of liveFoes()) addDot(o,'blight',Math.max(1,Math.round(pSiph()*.1)),1); log('Bloom of Ruin: '+hit0.length+' foe'+(hit0.length===1?'':'s')+' burst for '+tot+' in all, and the rot spreads.','ok'); }
  checkDeaths(); if(!liveFoes().length) roomWon(); return true;   /* a free action: a room it ends is won here */
}
// ----- runes: one per active skill (S.player.runes[skill]), kept in a pouch (S.runes); swapped for free in town
const RUNES={
  spear_a:{sk:'spear',name:'Marrow',desc:'A kill with Bone Spear refunds half its mana.'},
  spear_b:{sk:'spear',name:'Sundering Spear',desc:'Bone Spear Sunders its target for 2 turns.'},
  mend_a:{sk:'mend',name:'Stitchwork',desc:'Dark Mending also clears every condition on your side.'},
  mend_b:{sk:'mend',name:'Overgrowth',desc:'Healing past a minion\'s max HP becomes a ward, up to 20% of it.'},
  blast_a:{sk:'blast',name:'Chain',desc:'A second body bursts too, at half strength.'},
  blast_b:{sk:'blast',name:'Bone Shrapnel',desc:'Corpse Explosion makes every foe it hits bleed.'},
  curse_a:{sk:'curse',name:'Spread',desc:'Curse of Frailty also curses the foe beside it, at half strength.'},
  curse_b:{sk:'curse',name:'Deep Curse',desc:'The cursed foe\'s resistances drop by 25 points for the room.'},
  chill_a:{sk:'chill',name:'Avalanche',desc:'Grave Chill also hits every other foe for 60% of its damage.'},
  chill_b:{sk:'chill',name:'Permafrost',desc:'Grave Chill freezes a foe that is not a boss one turn longer.'},
  frenzy_a:{sk:'frenzy',name:'Blood Frenzy',desc:'While the frenzy lasts, your minions heal for 10% of the damage they deal.'},
  frenzy_b:{sk:'frenzy',name:'Last Frenzy',desc:'Unholy Frenzy lasts a turn longer and costs 10% of your current HP.'},
  reap_a:{sk:'reap',name:'Second Harvest',desc:'A kill with Reap resets its cooldown, once a room.'},
  reap_b:{sk:'reap',name:'Soul Harvest',desc:'A kill with Reap harvests a Soul.'},
  lance_a:{sk:'lance',name:'Glacier',desc:'Hoarfrost Lance pierces on into one more foe for 60%.'},
  lance_b:{sk:'lance',name:'Cold Snap',desc:'A kill on a frozen foe with the lance resets its cooldown.'}
};
const RUNE_IDS=Object.keys(RUNES);
const hasRune=(skid,c)=>!!S&&!!S.player&&!!S.player.runes&&S.player.runes[skid]===skid+'_'+c&&!(S.run&&S.run.sweep)&&sk(skid)>0;
const runeOwned=id=>!!S&&Array.isArray(S.runes)&&S.runes.includes(id);
function slotRune(skid,id){ if(S.mode!=='town'||!SKILL[skid]||SKILL[skid].type!=='active') return false; S.player.runes=S.player.runes||{};
  if(id==null||S.player.runes[skid]===id){ delete S.player.runes[skid]; return true; } if(!RUNES[id]||RUNES[id].sk!==skid||!runeOwned(id)) return false; S.player.runes[skid]=id; return true; }
function gainRune(id,r,why){ if(!RUNES[id]) return; S.runes=Array.isArray(S.runes)?S.runes:[];
  if(S.runes.includes(id)){ S.dust=(S.dust||0)+RUNE_DUST; if(r&&r.events) r.events.push({m:'A rune you already hold ('+RUNES[id].name+') crumbles into '+RUNE_DUST+' bone dust.',c:''}); return; }
  S.runes.push(id); tally('runes'); const t='A skill rune: '+RUNES[id].name+' for '+SKILL[RUNES[id].sk].name+(why?', '+why:'')+'.'; if(r&&r.events) r.events.push({m:t,c:'ok'}); if(r&&r.log) log(t,'story'); }
function runeDrop(e,r){   // checkDeaths: Tower wardens (their two runes on the first kill, then 10%), secret masters (one each), Rift guardians (15%)
  if(e.tw&&e.boss&&!e.secret){ const i=Math.max(0,TW_BOSS.indexOf(e.base)), two=[RUNE_IDS[(2*i)%RUNE_IDS.length],RUNE_IDS[(2*i+1)%RUNE_IDS.length]];
    if(!T_('rnw_'+i)){ tally('rnw_'+i); two.forEach(id=>gainRune(id,r,'left by '+e.name)); } else if(dayHash(S.uid,S.runs,r.room,e.tw,409)%100<RUNE_WARDEN) gainRune(two[dayHash(S.uid,e.tw,410)%2],r,'left by '+e.name); }
  else if(e.secret){ const i=SECRET.findIndex(s=>s.name===e.base||s.name===e.name); gainRune(RUNE_IDS[((i<0?0:i)*5+3)%RUNE_IDS.length],r,'left by '+e.name); }
  else if(e.guard&&dayHash(S.uid,S.runs,r.room,r.rift||0,411)%100<RUNE_GUARD) gainRune(RUNE_IDS[dayHash(S.uid,S.runs,412)%RUNE_IDS.length],r,'left by '+e.name);
}
function runeLeech(m,d){ const r=S.run; if(d>0&&r&&r.frenzy>0&&hasRune('frenzy','a')&&m.hp>0) healAlly(m,Math.round(d*RUNE_LEECH)); }   // Blood Frenzy (the minion phase)
function runesFix(g){   // normalizeSave: only what the save has (a new game has neither, and a round trip must not add them)
  if('runes' in g) g.runes=Array.isArray(g.runes)?[...new Set(g.runes.filter(id=>RUNES[id]))]:[];
  const P=g.player, R=P&&P.runes; if(!P||!('runes' in P)) return;
  const o={}; if(R&&typeof R==='object'&&!Array.isArray(R)) for(const k in R) if(RUNES[R[k]]&&RUNES[R[k]].sk===k&&(g.runes||[]).includes(R[k])) o[k]=R[k]; P.runes=o;
}
