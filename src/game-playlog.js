// ===== R15 PR B: CHALLENGE CODES AND THE PLAY LOG =====
// A challenge code (base 36: a seed, then the rules, then a check letter) starts a new game in the same valley: the same dawn
// rolls, the same day's curse, the same market stock and the same rooms behind the same doors on the same day. Seeded systems
// draw from their own stream (chSeeded: trialRng over dayHash(seed, system, keys)), so what you do elsewhere never shifts them.
// Fights are not seeded (your choices change them). Rules in a code: Ironman and the five custom settings. S.code = {c, s}.
// The play log is opt-in and local: its own storage key (never the save, never sent anywhere), at most ~2 MB, oldest runs
// pruned first. It records runs, rooms, deaths, choices, town spending, time per tab and the systems you never opened. The
// Ledger's How I play page reads it, and Records exports it as a JSON file for the bot replay (tests/run-balance.js {"log"}).
const CH_SYS={dawn:1,shop:2,room:3,doors:4,curse:5,floor:6,start:7};
const CH_KIND={fight:0,elite:1,nem:2};
const CH_SEEDED=['Dawn: raids, omens and everything else rolled as the day turns','The day\'s cursed gate','The market\'s stock','The foes in each gate and Rift room, by day, gate, room and door','The doors and events between rooms','Hell Tower floors','Your first day'];
const chOn=()=>!!(S&&S.code&&isFinite(S.code.s));
function chRng(){ return trialRng(dayHash.apply(null,[S.code.s].concat([].slice.call(arguments))),0); }
function chSeeded(fn){   // run fn with Math.random as this challenge's stream for these keys; a normal game is untouched
  if(!chOn()) return fn(); const R0=Math.random; Math.random=chRng.apply(null,[].slice.call(arguments,1)); try{ return fn(); } finally { Math.random=R0; } }
function chRules(iron,c){ c=custClamp(c||{}); let v=0; for(let i=CUSTOM_IDS.length-1;i>=0;i--) v=v*32+Math.round(c[CUSTOM_IDS[i]]/10); return v*2+(iron?1:0); }
const chCheck=(s,r)=>(dayHash(s,r,36)%36).toString(36).toUpperCase();
function chEncode(seed,iron,c){ seed=seed>>>0; const r=chRules(iron,c); return seed.toString(36).toUpperCase()+'-'+r.toString(36).toUpperCase()+chCheck(seed,r); }
function chDecode(code){   // {s, iron, c} or null: a mistyped code fails its check letter
  const m=String(code||'').toUpperCase().replace(/\s+/g,'').match(/^([0-9A-Z]{1,7})-([0-9A-Z]{1,6})([0-9A-Z])$/); if(!m) return null;
  const s=parseInt(m[1],36), r=parseInt(m[2],36); if(!(s>=0&&s<=0xffffffff)||!(r>=0)||chCheck(s,r)!==m[3]) return null;
  const c={}; let v=Math.floor(r/2); for(const k of CUSTOM_IDS){ c[k]=(v%32)*10; v=Math.floor(v/32); } if(v) return null;
  const cc=custClamp(c); if(CUSTOM_IDS.some(k=>cc[k]!==c[k])) return null; return {s,iron:!!(r%2),c:cc};
}
const chRandom=(iron,c)=>chEncode(Math.floor(Math.random()*4294967296),iron,c);
function newChallenge(code){   // a new game in the code's valley, with its rules
  const d=chDecode(code); if(!d) return false; const R0=Math.random; Math.random=trialRng(dayHash(d.s,CH_SYS.start),0);
  try{ newGameMode(d.iron?'iron':'custom',d.c); if(d.iron&&!custNorm(d.c)) S.custom=d.c; } finally { Math.random=R0; }
  S.code={c:chEncode(d.s,d.iron,d.c),s:d.s}; notify('Challenge '+S.code.c+': the same valley for everyone who plays this code.','ok'); chHistNote(); return true;
}
const codeOf=()=>chOn()?S.code.c:'';
function codeFix(g){   // normalizeSave
  if(!('code' in g)) return; const c=g.code, d=c&&typeof c==='object'&&chDecode(c.c);
  if(d&&d.s===c.s){ const o={c:chEncode(d.s,d.iron,d.c),s:d.s}; if(c.t0>0) o.t0=Math.floor(c.t0); g.code=o; } else delete g.code;
}
// Each challenge game this browser played, kept apart from the save (so a New game keeps the list): code, best day and result.
const CH_HIST_KEY='lotd-codes', CH_HIST_N=20;
function chHist(){ try{ const h=JSON.parse(localStorage.getItem(CH_HIST_KEY)||'[]'); return Array.isArray(h)?h.filter(x=>x&&typeof x.c==='string').slice(0,CH_HIST_N):[]; }catch(e){ return []; } }
function chHistNote(){   // at dawn and when the game starts: this game's line, newest first
  if(!chOn()) return; const h=chHist().filter(x=>x.c!==S.code.c||x.t0!==S.code.t0), clr=Object.keys((S.ti&&S.ti.clr)||{}).filter(k=>S.ti.clr[k]).length;
  if(!S.code.t0) S.code.t0=Date.now();
  h.unshift({c:S.code.c,t0:S.code.t0,day:S.day,lvl:S.player.lvl,gates:clr,tower:(S.tower&&S.tower.best)||0,iron:S.iron?(S.ironDeaths|0):null,t:Date.now()});
  try{ localStorage.setItem(CH_HIST_KEY,JSON.stringify(h.slice(0,CH_HIST_N))); }catch(e){}
}
// ----- the play log
const PLOG_KEY='lotd-log', PLOG_MAX=2e6, PLOG_IDLE=60000, PLOG_FLUSH=30000;
const PLOG_TOWN={buypot:'buy',buyitem:'buy',buysalt:'buy',buysaltmax:'buy',buybag:'buy',bmt:'buy',empower:'build',build:'build',spec:'build',forge:'craft',hforge:'craft',brew:'craft',craftc:'craft',fuse:'craft',enchadd:'craft',temper:'craft',reforge:'craft',awaken:'craft',comm:'craft'};
const PLOG_TABS=['gates','tower','gear','market','army','town','skills','titles','lore','codex','bes','hist','rec','mem','help','play','settings'];
// What the market bot does at each gate (100 days, seed 7700): actions a room and clear %, for How I play.
const PLOG_BOT={tpr:[3.4,4.1,5.1,3,3.7,3,1.7],clr:[92,94,95,95,92,96,99]};
let PLOG=null, PLOG_OF=null, PLOG_RUN=null, PLOG_DIRTY=false, PLOG_AT=0, PLOG_TAB=null, PLOG_HIT=null;
const plogBlank=()=>({v:1,on:false,runs:[],days:[],seen:{tabs:{},cx:{}}});
function plogLoad(){ if(PLOG) return PLOG; let p=null; try{ p=JSON.parse(localStorage.getItem(PLOG_KEY)||'null'); }catch(e){}
  PLOG=p&&p.v===1&&Array.isArray(p.runs)&&Array.isArray(p.days)&&p.seen&&typeof p.seen==='object'?p:plogBlank(); PLOG.seen.tabs=PLOG.seen.tabs||{}; PLOG.seen.cx=PLOG.seen.cx||{}; return PLOG; }
const plogOn=()=>plogLoad().on===true;
function plogSet(on){ const p=plogLoad(); p.on=!!on; if(on&&!p.t0) p.t0=Date.now(); PLOG_RUN=null; plogFlush(true); return p.on; }
function plogClear(){ const on=plogOn(); PLOG=plogBlank(); PLOG.on=on; PLOG_RUN=null; plogFlush(true); }
function plogPrune(p,max){   // the oldest runs and days go first, a tenth at a time
  let j=JSON.stringify(p); while(j.length>max&&(p.runs.length>1||p.days.length>1)){ p.runs.splice(0,Math.max(1,Math.ceil(p.runs.length/10))); p.days.splice(0,Math.max(1,Math.ceil(p.days.length/10))); p.pruned=(p.pruned|0)+1; j=JSON.stringify(p); } return j; }
function plogFlush(force){ if(!PLOG||(!PLOG_DIRTY&&!force)) return; const j=plogPrune(PLOG,PLOG_MAX); PLOG_DIRTY=false; PLOG_AT=Date.now(); try{ localStorage.setItem(PLOG_KEY,j); }catch(e){} }
const plogTick=()=>{ if(PLOG_DIRTY&&Date.now()-PLOG_AT>PLOG_FLUSH) plogFlush(); };   // save(): at most every 30 seconds
const plogNow=()=>Date.now();
function plogActive(o){ const t=plogNow(), d=o.last?t-o.last:0; o.ms=(o.ms|0)+Math.min(Math.max(0,d),PLOG_IDLE); o.last=t; }   // idle time does not count
function plogRun(){   // this run's entry: found again after a reload by the run number and the gate
  const r=S.run; if(!r||!plogOn()) return null; const g=r.tw?'t':r.rift?'r':r.siege?'s':r.di, key=S.runs+':'+g+':'+S.day;
  if(PLOG_RUN&&PLOG_RUN.key===key&&!PLOG_RUN.out) return PLOG_RUN;
  const p=plogLoad(); let e=p.runs.find(x=>x.key===key&&!x.out);
  if(!e){ e={key,g,d:S.day,lv:S.player.lvl,h:r.heat|0,rooms:[],acts:0,ms:0}; if(r.mod) e.mod=r.mod; if(r.tw) e.fl=r.tw; if(r.rift) e.dp=r.rift; if(S.ngp) e.ngp=S.ngp; if(chOn()) e.code=S.code.c; if(S.iron) e.iron=1; p.runs.push(e); PLOG_DIRTY=true; }
  return PLOG_RUN=e;
}
const plogRoom=()=>{ const e=plogRun(); return e&&e.rooms[e.rooms.length-1]||null; };
function plogEnter(kind,offered){   // spawnRoom and quietRoom: a new room; kind is the door taken
  const e=plogRun(); if(!e) return; const o={i:S.run.room,k:kind||'fight',acts:0}; if(offered&&offered.length>1) o.of=offered.slice(); e.rooms.push(o); PLOG_DIRTY=true; }
function plogAct(kind){ const e=plogRun(); if(!e) return; const o=plogRoom(); e.acts++; plogActive(e); if(o){ o.acts++; if(kind&&kind!=='strike'){ o.sk=o.sk||{}; o.sk[kind]=(o.sk[kind]|0)+1; } } PLOG_DIRTY=true; }
function plogWon(){ const o=plogRoom(); if(o){ o.won=1; o.t=S.run.turn|0; PLOG_DIRTY=true; } }
function plogChoice(k,v){ const o=plogRoom(); if(!o) return; if(k==='ord'){ (o.ord=o.ord||[]).push(v); } else o[k]=v; PLOG_DIRTY=true; }
function plogHit(a){   // hurtAlly, on you: your HP before the blow, and whether the foe's card showed what it would do
  if(!plogOn()||!S.run||a.id!=='p') return; const n=BLOW&&BLOW.n, e=n&&(S.run.enemies||[]).find(x=>x.name===n&&!x.dead);
  PLOG_HIT={hp:a.hp,sh:!!(BLOW&&(BLOW.w||(e&&typeof intentInfo==='function'&&intentInfo(e))))}; }
function plogDeath(r){ const e=plogRun(); if(!e) return; const b=r.blow||{}, d={rm:r.room|0,n:b.n||'',k:b.k||''};
  if(b.mv) d.mv=b.mv; if(b.dot) d.dot=b.dot; if(b.c) d.c=b.c.slice(); if(PLOG_HIT){ d.hp=PLOG_HIT.hp; d.sh=PLOG_HIT.sh?1:0; } e.death=d; PLOG_DIRTY=true; }
function plogEnd(r){ const e=plogRun(); if(!e) return; plogActive(e); delete e.last; e.out=r.cleared?'clear':e.death?'death':r.fled?'fled':'left'; e.won=r.won|0; PLOG_RUN=null; PLOG_DIRTY=true; plogFlush(); }
function plogDay(){ const p=plogLoad(); let d=p.days[p.days.length-1]; if(!d||d.d!==S.day){ d={d:S.day,x:{},tab:{}}; p.days.push(d); } return d; }
function plogTown(a,k){ if(!plogOn()||S.mode!=='town') return; const d=plogDay(), w=PLOG_TOWN[a]; (d.x[w]=d.x[w]||[]).push(a+(k!=null&&k!==''?':'+k:'')); PLOG_DIRTY=true; }
function plogTabTime(next){   // the time on the tab you leave, by day; idle minutes do not count
  if(!plogOn()) return; const t=plogNow(); if(PLOG_TAB&&PLOG_TAB.k){ const d=plogDay(), ms=Math.min(Math.max(0,t-PLOG_TAB.t),PLOG_IDLE*5); d.tab[PLOG_TAB.k]=(d.tab[PLOG_TAB.k]|0)+ms; }
  PLOG_TAB={k:next,t}; if(next){ plogLoad().seen.tabs[next]=1; } PLOG_DIRTY=true; }
function plogCx(k){ if(!plogOn()||!k) return; plogLoad().seen.cx[k]=1; PLOG_DIRTY=true; }
function plogWrap(A){   // ui-input.js: the actions the log listens to
  const wrap=(a,fn)=>{ const f=A[a]; if(typeof f==='function') A[a]=function(k){ const t0=S&&S.mode==='town'&&plogOn()?ui.tab:null, out=f.apply(this,arguments); try{ fn(k,t0); }catch(e){} return out; }; };
  wrap('tab',(k,t0)=>{ if(ui.tab!==t0||!PLOG_TAB) plogTabTime(ui.tab); });
  wrap('cx',k=>plogCx(k)); wrap('cmd',k=>plogChoice('ord',k));
  for(const a of Object.keys(PLOG_TOWN)) wrap(a,k=>plogTown(a,k));
  const ev=A.event; if(typeof ev==='function') A.event=function(k){ const id=S.run&&S.run.event&&S.run.event.id; const out=ev.apply(this,arguments); if(id) try{ plogChoice('ev',id+':'+k); }catch(e){} return out; };
}
function plogNever(){   // the systems this log never saw you open or use
  const p=plogLoad(), tabs=PLOG_TABS.filter(t=>!p.seen.tabs[t]&&(t!=='tower'||towerOpen())&&(t!=='town'||townOpen())), cx=CODEX.map(x=>x[0]).filter(k=>!p.seen.cx[k]);
  const bld=typeof BUILD!=='undefined'&&townOpen()?Object.keys(BUILD).filter(k=>!(S.build&&S.build[k])):[];
  return {tabs,cx,bld};
}
function plogExport(){ const p=plogLoad(); plogFlush(true);
  return JSON.stringify({v:1,kind:'lotd-play-log',made:new Date().toISOString(),game:{day:S.day,lvl:S.player.lvl,ngp:S.ngp|0,code:codeOf()||null,iron:!!S.iron,custom:S.custom||null},runs:p.runs.filter(e=>e.out),days:p.days,seen:p.seen,never:plogNever(),pruned:p.pruned|0}); }
function plogDownload(){ try{ const url=URL.createObjectURL(new Blob([plogExport()],{type:'application/json'})), a=document.createElement('a');
  a.href=url; a.download='ledger-play-log-day'+S.day+'.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),2000); return true; }catch(e){ return false; } }
function plogStats(){   // what How I play shows: runs, deaths by cause, actions a room against the bot, doors, time
  const p=plogLoad(), R=p.runs.filter(e=>e.out), gates=R.filter(e=>typeof e.g==='number');
  const deaths={}; for(const e of R) if(e.death){ const d=e.death, k=(d.n||'?')+(d.mv?' ('+(BOSS_ABIL[d.mv]?BOSS_ABIL[d.mv].name:d.mv)+')':d.k==='dot'?' (a damage-over-time)':d.k==='crit'?' (a critical hit)':''); deaths[k]=(deaths[k]|0)+1; }
  let rooms=0, acts=0, bot=0; for(const e of gates) for(const o of e.rooms) if(o.acts){ rooms++; acts+=o.acts; bot+=PLOG_BOT.tpr[e.g]||3; }
  const doors={}; let picks=0; for(const e of R) for(const o of e.rooms) if(o.of){ doors[o.k]=(doors[o.k]|0)+1; picks++; }
  const tab={}; for(const d of p.days) for(const k in d.tab) tab[k]=(tab[k]|0)+d.tab[k];
  const unseen=R.filter(e=>e.death&&e.death.sh===0).length, dn=R.filter(e=>e.death).length;
  return {runs:R.length,clears:R.filter(e=>e.out==='clear').length,deaths,dn,unseen,rooms,apr:rooms?acts/rooms:0,bpr:rooms?bot/rooms:0,doors,picks,tab,ms:R.length?R.reduce((a,e)=>a+(e.ms|0),0)/R.length:0,
    botClr:gates.length?gates.reduce((a,e)=>a+(PLOG_BOT.clr[e.g]||90),0)/gates.length:0,gClr:gates.length?gates.filter(e=>e.out==='clear').length/gates.length*100:0,gn:gates.length};
}
