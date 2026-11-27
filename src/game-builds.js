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
