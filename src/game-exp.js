// ===== EXPEDITIONS (R6 PR A) =====
// A raid order becomes an expedition: a target (a gate, today's cursed gate, a band of the Tower, a hunt for one kind, or a
// scavenge), a length in nights, and three steps a night. The squad marches at nightfall as before; each dawn resolves one
// night. Approach (a vanguard covers it) fails: the night is lost, nothing else. Fight (strikers and reapers) fails: each
// follower may fall, the Commander shielding the first once per expedition. Haul (a mender) fails or is uncovered: half
// of the spoils are lost on the way. Spoils are carried until the squad comes home; at each dawn with nights left the
// squad presses on (spoils +50%, steps -5%), takes the risky path (no Approach, spoils doubled, a failed Fight costs the
// weakest follower outright) or comes home at once. A night's odds are the old raid odds spread over three steps (each
// step its cube root), then each step's cover and modifiers apply. x.t = {k, di, f, kind}; x.nights, x.night, x.sp, x.pick.
const EXP_TARGETS=['gate','curse','band','hunt','scav'];
const EXP_NAME={gate:'Gate',curse:'Cursed gate',band:'Tower band',hunt:'Hunt',scav:'Scavenge'};
const EXP_STEPS=['approach','fight','haul'], EXP_STEP_NAME={approach:'Approach',fight:'Fight',haul:'Haul'};
const EXP_NO_VAN=.10, EXP_NO_FIGHT=.15, EXP_FIGHTER=.03, EXP_FIGHT_MAX=.09, EXP_TYPE=.03, EXP_BOND=.03, EXP_PRESS=.05, EXP_PRESS_PAY=.5,
  EXP_RISKY_PAY=1, EXP_CURSE=.05, EXP_CURSE_PAY=1.25, EXP_HUNT_KIT=.05, EXP_HUNT_TRO=3, EXP_HEART=.25, EXP_WARDEN=.2, EXP_WARDEN_HIT=.10,
  EXP_BAND_AT=20, EXP_STEP_MIN=.15, EXP_STEP_MAX=.97, EXP_SCAV_XP=.5;
const EXP_EVENT=.1, EXP_CAMP_DUST=10;
function expEvent(x){   // something on the road (10% of nights that hold): a lost patrol, an old camp, another keeper's squad
  const t=x.t, di=tDi(t), k=pick(['patrol','camp','keeper']), lead=x.units[0];
  if(k==='patrol'){ const c={name:'Militia Spearman',base:'Militia Spearman',role:'vanguard',rankI:Math.min(di,GATE_N-1),lvl:Math.max(1,S.player.lvl-3),hf:1.3,af:.85,boss:false,elite:false};
    if(bl('embalm')&&embKeep(c,true)) return {k,m:lead.nick+'\'s squad found a lost patrol of the living and brought one home for the Embalmery.'};
    dread(-3); return {k,m:lead.nick+'\'s squad found a lost patrol of the living and let it go. The town hears of it.'}; }
  if(k==='camp'){ const d=EXP_CAMP_DUST*(di+1); x.sp=x.sp||{}; x.sp.dust=(x.sp.dust||0)+d; tally('expCamps'); return {k,m:'An old camp on the road: '+d+' bone dust in its ashes.'}; }
  const won=Math.random()<.6; if(!won){ const fol=x.units.slice(1).filter(m=>!hasTrait(m,'gravebound')); if(fol.length&&Math.random()<RAID_LOSS){ const m=pick(fol); returnGear(m); memorialize(m,{raid:di}); x.units=x.units.filter(y=>y!==m); x.lostN=(x.lostN||0)+1; return {k,won,m:'Another keeper\'s squad on the same road. '+m.nick+' fell in the skirmish.'}; } }
  return {k,won,m:'Another keeper\'s squad on the same road. '+(won?'Your dead drove them off and took their share: spoils +50% tonight.':'They slipped away.')};
}
const expNights=(k,add)=>(k==='gate'||k==='curse'?[1,2]:k==='band'?[2]:[1]).map(n=>n+(add==null?pactWatch():add));   /* Short Nights: one night more (game-progression.js) */
const tDi=t=>t.k==='band'?5:t.di;   // the gate whose loot and resistances a target uses
function expTargets(){   // what the War table offers today
  const out=[], G=raidGates(); G.forEach(di=>out.push({k:'gate',di}));
  const m=dayMod(); if(m&&m.id&&G.includes(m.gi)) out.push({k:'curse',di:m.gi});
  if(S.tower&&S.tower.best>=EXP_BAND_AT) out.push({k:'band',di:5,f:Math.max(10,Math.floor((S.tower.best-10)/10)*10)});
  G.forEach(di=>{ DUNGEONS[di].mobs.map(x=>x[0]).concat([DUNGEONS[di].boss[0]]).forEach(kind=>{ if(masteryOf(kind)) out.push({k:'hunt',di,kind}); }); });
  out.push({k:'scav',di:G.length?G[G.length-1]:0}); return out;
}
const tKey=t=>t.k+':'+t.di+':'+(t.f||0)+':'+(t.kind||'');
const tValid=t=>!!t&&EXP_TARGETS.includes(t.k)&&expTargets().some(x=>tKey(x)===tKey(t));
function tName(t){ const D=DUNGEONS[t.di]; return t.k==='gate'?'the '+D.name:t.k==='curse'?'the cursed '+D.name:t.k==='band'?'Tower floors '+t.f+'-'+(t.f+9):t.k==='hunt'?'a hunt for '+(bossKind(t.kind)?t.kind:t.kind+'s')+' in the '+D.name:'a scavenge near the '+D.name; }
function bandThreat(f){ const lv=twLvl(f), a=towerStats(f,lv,1,1,false,false), b=towerStats(f+9-(f+9)%10||10,lv+2,1,1,true,false); return {hp:a.hp*13+b.hp*.5,atk:a.atk*3+b.atk*.3}; }
function expBase(units,t){   // the old raid odds against the target
  if(t.k!=='band') return raidOdds(units,t.di);
  const T=bandThreat(t.f); let atk=0,hp=0; for(const m of units){ atk+=m.atk; hp+=m.maxHp; }
  const c=units.find(isCommander), lead=c?1+.1*(c.stage||0)+(c.boss?.15:0):1, x=Math.sqrt(atk*hp/(T.hp*T.atk))*lead/RAID_K; return clamp(x/(1+x)+warOdds(),RAID_MIN,RAID_MAX);
}
const expCover=units=>({van:units.some(m=>m.role==='vanguard'),fight:units.filter(m=>m.role==='striker'||m.role==='reaper').length,mend:units.some(m=>m.role==='mender')});
function expTypeK(units,t){ const R=t.k==='band'?TOWER_RES:GATE_RES[t.di]||{}; let k=0; for(const m of units){ const v=R[minionType(m)]||0; if(v<0) k+=EXP_TYPE; else if(v>0) k-=EXP_TYPE; } return clamp(k,-EXP_FIGHT_MAX,EXP_FIGHT_MAX); }
function expBonded(units){ return bondPairs().some(([a,b])=>units.includes(a)&&units.includes(b)); }
function expOdds(units,t,o){   // {approach, fight, haul}: each step's chance; o: {pressed, risky, odds (taken at nightfall)}
  o=o||{}; const b=Math.cbrt(typeof o.odds==='number'?o.odds:bannerOdds(o,expBase(units,t))), cv=expCover(units), pen=EXP_PRESS*(o.pressed||0)+(t.k==='curse'?EXP_CURSE:0);
  const st=x=>clamp(x-pen,EXP_STEP_MIN,EXP_STEP_MAX);
  const fight=b+(cv.fight?Math.min(EXP_FIGHT_MAX,EXP_FIGHTER*cv.fight):-EXP_NO_FIGHT)+expTypeK(units,t)+(expBonded(units)?EXP_BOND:0)-(t.k==='hunt'?EXP_HUNT_KIT:0);
  return {approach:o.risky?1:st(b-(cv.van?0:EXP_NO_VAN)),fight:t.k==='scav'?1:st(fight),haul:st(b)};
}
const expNightOdds=(units,t,o)=>{ const p=expOdds(units,t,o); return p.approach*p.fight*p.haul; };
function expSpoils(x,k){   // one night's take, times k
  const t=x.t, di=tDi(t), g0=(15+S.player.lvl*4)*(1+di)*RAID_GOLD*ngpReward()*bannerGold(x)*warGold(), sp={g:0,items:[],tro:{},dust:0};
  const tro=(key,n)=>{ if(TROPHY[key]) sp.tro[key]=(sp.tro[key]||0)+n; };
  const gear=n=>{ for(let i=0;i<n;i++){ if(i===2&&Math.random()>=RAID_ITEM3) break; sp.items.push(pickNorm(tableFor(di,'vanguard',i===0,false).filter(r=>!ITEM[r.id].uq))); } };
  if(t.k==='gate'){ sp.g=g0*k; gear(3); }
  else if(t.k==='curse'){ sp.g=g0*EXP_CURSE_PAY*k; gear(2); }
  else if(t.k==='band'){ sp.g=g0*.5*k; const ks=TW_MOBS.map(m=>'t:'+m[0]); for(let i=0;i<2;i++) tro(pick(ks),Math.round(k)); gear(1); if(Math.random()<EXP_WARDEN) tro('b:'+TW_BOSS[(t.f/10)%TW_BOSS.length],1); }
  else if(t.k==='hunt'){ sp.g=g0*.25*k; if(bossKind(t.kind)){ if(Math.random()<EXP_HEART*k) tro('b:'+t.kind,1); } else tro(t.kind,Math.round(EXP_HUNT_TRO*k)); }
  else { sp.dust=Math.round(5*(di+1)*k); const ks=DUNGEONS[di].mobs.map(m=>m[0]); tro(pick(ks),Math.round(2*k)); }
  sp.g=Math.round(sp.g); return sp;
}
function spAdd(a,b,half){ const h=v=>half?Math.floor(v/2):v; a.g=(a.g||0)+h(b.g||0); a.dust=(a.dust||0)+h(b.dust||0); a.items=(a.items||[]).concat(half?b.items.filter((_,i)=>i%2):b.items); a.tro=a.tro||{}; for(const k in b.tro){ const n=h(b.tro[k]); if(n) a.tro[k]=(a.tro[k]||0)+n; } return a; }
function spHalve(a){ a.g=Math.floor((a.g||0)/2); a.dust=Math.floor((a.dust||0)/2); a.items=(a.items||[]).filter((_,i)=>i%2); for(const k in a.tro||{}){ a.tro[k]=Math.floor(a.tro[k]/2); if(!a.tro[k]) delete a.tro[k]; } }
function expNight(x){   // dawn: resolve one night; returns the night's record
  const t=x.t, units=x.units, lead=units[0], o={pressed:x.pressed||0,risky:x.pick==='risky',odds:x.night>0?undefined:x.odds,bn:x.bn}, p=expOdds(units,t,o);
  const roll={}, lost=[]; let ok=true, saved=null;
  for(const s of EXP_STEPS){ if((s==='approach'&&o.risky)||(s==='fight'&&t.k==='scav')){ roll[s]=1; continue; } roll[s]=Math.random()<p[s]?1:0; if(s==='approach'&&!roll[s]){ ok=false; break; } if(s==='fight'&&!roll[s]){ ok=false; break; } }
  if(roll.fight===0){   // a lost fight: followers may fall; the risky path takes the weakest outright
    const fol=units.slice(1).filter(m=>!hasTrait(m,'gravebound'));
    if(o.risky&&fol.length){ lost.push(fol.slice().sort((a,b)=>a.atk*a.maxHp-b.atk*b.maxHp)[0]); }
    else for(const m of fol) if(Math.random()<RAID_LOSS){ if(!x.saved&&isCommander(lead)){ x.saved=1; saved=m; continue; } lost.push(m); }
  }
  lost.forEach(m=>{ returnGear(m); memorialize(m,{raid:tDi(t)}); }); x.units=units.filter(m=>!lost.includes(m)); if(lost.length) x.lostN=(x.lostN||0)+lost.length;
  let half=false;
  let ev=null; if(ok&&Math.random()<EXP_EVENT) ev=expEvent(x);
  if(ok){ const k=(1+EXP_PRESS_PAY*(x.pressed||0))*(o.risky?1+EXP_RISKY_PAY:1)*(ev&&ev.k==='keeper'&&ev.won?1.5:1), sp=expSpoils(x,k), cv=expCover(x.units); half=!cv.mend||!roll.haul;
    if(!roll.haul) spHalve(x.sp=x.sp||{}); spAdd(x.sp=x.sp||{},sp,!cv.mend); x.won=(x.won||0)+1; tally('expNightsWon'); }
  tally('expNights'); x.night=(x.night||0)+1; delete x.pick;
  const rec={n:x.night,roll,ok,lost:lost.map(m=>m.nick),saved:saved?saved.nick:null,half}; if(ev){ rec.ev=ev.k; rec.evm=ev.m; } x.log=(x.log||[]).concat([rec]).slice(-3); return rec;
}
function expHome(x){   // bank the spoils and bring everyone back
  const sp=x.sp||{}, t=x.t, di=tDi(t); let items=0, full=0;
  if(sp.g) S.gold+=sp.g; if(sp.dust) S.dust=(S.dust||0)+sp.dust; for(const k in sp.tro||{}) S.trophies[k]=(S.trophies[k]||0)+sp.tro[k];
  for(const id of sp.items||[]) if(addItem(id)) items++; else full++;
  const nw=x.won||0; if(nw) x.units.forEach(m=>minionXp(m,Math.round(mneed(m.lvl)*RAID_XP*nw*(t.k==='scav'?EXP_SCAV_XP:1))));
  else x.units.forEach(m=>minionXp(m,Math.round(mneed(m.lvl)*RAID_XP*.25)));
  const won=nw>0; if(won){ tally('raidWins'); tally('exp_'+t.k); if(!x.lostN){ tally('expClean'); if((x.night||1)>=2) tally('expLong'); } if(di<=1&&t.k!=='scav') dread(DREAD_RAID); }
  const tro=Object.values(sp.tro||{}).reduce((a,b)=>a+b,0), got=[sp.g?'+'+sp.g+' gold':'',sp.dust?'+'+sp.dust+' bone dust':'',tro?tro+' troph'+(tro>1?'ies':'y'):'',items?items+' piece'+(items>1?'s':'')+' of gear':''].filter(Boolean).join(', ');
  let msg=x.units[0].nick+' is back from '+tName(t)+(won?': '+(got||'nothing worth carrying'):' with nothing')+(full?' ('+full+' left behind: your bag is full)':'')+'.';
  msg+=homeLine(x.units.map(m=>placeMinion(m,Array.isArray(x.res)&&x.res.includes(m.uid)))); notify(msg,won?'ok':'bad');
  const lostN=x.lostN||0; S.raidLog=[{day:S.day,di:t.di,won,nick:x.units[0].nick,lost:lostN,k:t.k,nights:x.night||1}].concat(S.raidLog||[]).slice(0,RAID_LOG);
  return {won,lost:lostN};
}
function expChoose(i,c){   // the dawn choice for a squad still out: press on, the risky path, or come home now
  const x=(S.raids||[])[i]; if(!x||S.mode!=='town'||!['press','risky','home'].includes(c)||(x.night||0)>=(x.nights||1)) return false;
  if(c==='home'){ S.raids.splice(i,1); expHome(x); return true; }
  x.pick=c; return true;
}
const expOut=()=>(S.raids||[]).filter(x=>(x.night||0)<(x.nights||1)&&(x.night||0)>0);   // squads in the field during the day
function expFix(x){   // the loader: a raid from before expeditions is a one-night gate expedition
  const t=x.t&&EXP_TARGETS.includes(x.t.k)&&RK[x.t.di]?{k:x.t.k,di:x.t.di}:{k:'gate',di:x.di}; if(t.k==='band') t.f=Math.max(10,Math.floor((+x.t.f||10)/10)*10); if(t.k==='hunt'){ if(typeof x.t.kind==='string'&&TROPHY[bossKind(x.t.kind)?'b:'+x.t.kind:x.t.kind]) t.kind=x.t.kind; else { t.k='gate'; } }
  const nights=expNights(t.k,0).concat(expNights(t.k,1)).includes(x.nights)?x.nights:expNights(t.k)[0],   /* either length: the loader does not read the pacts */ out={t,nights,night:clamp(Math.floor(+x.night||0),0,nights)};
  if(x.sp&&typeof x.sp==='object'){ const sp={g:Math.max(0,Math.floor(+x.sp.g||0)),dust:Math.max(0,Math.floor(+x.sp.dust||0)),items:Array.isArray(x.sp.items)?x.sp.items.filter(id=>ITEM[id]):[],tro:{}}; for(const k in x.sp.tro||{}) if(TROPHY[k]&&x.sp.tro[k]>0) sp.tro[k]=Math.floor(x.sp.tro[k]); out.sp=sp; }
  for(const k of ['won','pressed','saved','lostN']) if(x[k]>0) out[k]=Math.floor(x[k]); if(x.pick==='press'||x.pick==='risky') out.pick=x.pick;
  if(Array.isArray(x.log)) out.log=x.log.filter(r=>r&&typeof r==='object').slice(-3).map(r=>({n:Math.floor(+r.n||1),roll:Object.fromEntries(EXP_STEPS.filter(s=>r.roll&&s in r.roll).map(s=>[s,r.roll[s]?1:0])),ok:!!r.ok,lost:Array.isArray(r.lost)?r.lost.filter(s=>typeof s==='string').map(cleanNick):[],saved:typeof r.saved==='string'?cleanNick(r.saved):null,half:!!r.half}));
  const o={}; for(const k of Object.keys(x)) if(k in out) o[k]=out[k]; for(const k in out) if(!(k in o)) o[k]=out[k];   /* keep the save's key order: a round trip must give the same game */
  return o;
}
function expOrderFix(o){ const t=o.t&&EXP_TARGETS.includes(o.t.k)&&RK[o.t.di]?Object.assign({k:o.t.k,di:o.t.di},o.t.k==='band'?{f:Math.max(10,Math.floor((+o.t.f||10)/10)*10)}:{},o.t.k==='hunt'&&typeof o.t.kind==='string'?{kind:o.t.kind}:{}):null; return t?{t,nights:expNights(t.k).includes(o.nights)?o.nights:expNights(t.k)[0]}:{}; }
function resolveRaid(x){   // one night for x; home when its nights are done (a raid from before expeditions is one night at a gate)
  if(!x.t) x.t={k:'gate',di:x.di}; if(!x.nights) x.nights=1; const rec=expNight(x);
  if(x.night>=x.nights){ if(rec.evm) notify(rec.evm,rec.ev==='keeper'&&!rec.ok?'bad':'ok'); const r=expHome(x); return {won:r.won,lost:rec.lost.length,home:true}; }
  x.pressed=(x.pressed||0)+1; const P=Math.round(expNightOdds(x.units,x.t,{pressed:x.pressed})*100);
  notify('Night '+rec.n+' of '+x.nights+', '+tName(x.t)+': '+EXP_STEPS.filter(s=>s in rec.roll).map(s=>EXP_STEP_NAME[s]+(rec.roll[s]?' held':' failed')).join(', ')+'.'+(rec.lost.length?' Fallen: '+rec.lost.join(', ')+'.':'')+(rec.saved?' '+x.units[0].nick+' shielded '+rec.saved+'.':'')+' '+x.units[0].nick+' waits for your word: press on ('+P+'% tonight) or come home.'+(rec.evm?' '+rec.evm:''),rec.ok?'ok':'bad');
  return {won:rec.ok,lost:rec.lost.length,home:false};
}
function resolveRaids(){ const all=S.raids||[], out=[]; S.raids=all.slice(); for(const x of all){ S.raids=S.raids.filter(y=>y!==x); const r=resolveRaid(x); out.push(r); if(!r.home) S.raids.push(x); } return out; }   // a squad coming home holds no place while it is placed
// ----- Rally: a Commander in battle (free, once a room): +20% army damage this turn, or a condition off every minion
const RALLY_DMG=.2, RALLY_TWO=.05, ELDER_STAGE=2, ELDER_SHIELD=1.25;
const rallyCmdrs=()=>S.army.filter(m=>isCommander(m)&&m.hp>0);
const canRally=()=>S.mode==='battle'&&!!S.run&&!(S.run.cmd&&S.run.cmd.rally)&&rallyCmdrs().length>0;
function rally(k){
  if(!canRally()||(k!=='dmg'&&k!=='cleanse')) return false; const r=S.run, c=rallyCmdrs()[0]; r.cmd=r.cmd||{}; r.cmd.rally=k; tally('rallies');
  if(k==='dmg'){ r.rally=r.turn; log('Rally: '+c.nick+' roars, and your dead strike '+Math.round((rallyK(true)-1)*100)+'% harder this turn.','ok'); }
  else { let n=0; for(const m of S.army) if(m.hp>0){ const st=Object.keys(m.st||{}), dt=Object.keys(m.dots||{}); if(st.length){ delete m.st[st[0]]; n++; } else if(dt.length){ delete m.dots[dt[0]]; n++; } } log('Rally: '+c.nick+' steadies the line. '+n+' minion'+(n===1?' sheds':'s shed')+' a condition.','ok'); }
  sfx('skill'); return true;
}
function rallyK(any){ const r=S.run; if(!r||(!any&&(r.rally!==r.turn||!HITTER||HITTER===S.player||!S.army.includes(HITTER)))) return 1; return 1+RALLY_DMG+(rallyCmdrs().length>1?RALLY_TWO:0); }   // hurtFoe
const elderCmdr=()=>rallyCmdrs().some(m=>(m.stage||0)>=ELDER_STAGE);   // command: Taunt a turn longer, Bone Shield 25% more
function rallyHTML(){ if(!rallyCmdrs().length) return ''; const used=S.run.cmd&&S.run.cmd.rally;
  return '<span class="cmd-l" title="A Commander\'s free order, once a room">Rally:</span><button class="btn small" data-a="rally" data-k="dmg" title="Your minions deal '+Math.round(RALLY_DMG*100)+'% more damage this turn"'+(used?' disabled':'')+'>Strike harder'+(used==='dmg'?' &middot; given':'')+'</button>'
   +'<button class="btn small" data-a="rally" data-k="cleanse" title="Every minion sheds one condition"'+(used?' disabled':'')+'>Steady'+(used==='cleanse'?' &middot; given':'')+'</button>'; }
