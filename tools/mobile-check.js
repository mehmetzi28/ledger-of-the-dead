// R18: the phone and late-save check in a real browser (Playwright's Chromium; not part of run-tests.js, which needs no packages).
//   node tools/mobile-check.js          every town tab, a fight and the raise screen at 360 px: nothing wider than the screen;
//                                       then a late save (500+ items, 60 minions, 200 Memorial names) rendered on a desktop
//                                       window, English and Turkish: the time to switch to each tab (draw and lay out; the best of 9,
//                                       as a shared machine is noisy), against
//                                       the budget (Town and Army under 50 ms)
// Exits 1 on a failure. Uses the built index.html.
const path=require('path'); let chromium; try{ ({chromium}=require('playwright')); }catch(e){ console.log('Playwright is not installed: nothing checked.'); process.exit(0); }
const url='file://'+(process.env.LOTD_HTML||path.join(__dirname,'..','index.html')), TABS=['gates','gear','bes','skills','market','army','town','tower','titles','settings','help','hist','rec','mem','lore','codex'];
(async()=>{
  const b=await chromium.launch(), fails=[]; const errs=[];
  const setup=`(()=>{ ui.title=false; newGame(); S.player.lvl=30; S.gold=99999; S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1}; S.tips={off:1};
    const ids=Object.keys(ITEM); for(let i=0;i<520;i++){ const id=ids[i%ids.length]; S.inv.push({u:++S.uid,id}); }
    const names=allNames().filter(n=>!TW_BOSS.includes(n)); S.army=[]; S.reserve=[];
    for(let i=0;i<60;i++){ const n=names[i%names.length], m={uid:++S.uid,armed:false,eq:null,nick:'M'+i,name:n,kind:n,role:'striker',rankI:0,lvl:30,xp:0,boss:false,elite:false,hf:1,af:1,hp:1,maxHp:null,atk:0,lvl0:20,stage:i%4,traits:['thick']}; syncMinion(m); m.hp=m.maxHp; (i<40?S.army:S.reserve).push(m); }
    S.memorial=Array.from({length:200},(_,i)=>({nick:'N'+i,name:'Tunnel Rat',kind:'Tunnel Rat',rk:0,st:i%3,lvl:10+i%40,day:i,tr:['thick'],role:'striker'})); S.ti.got=S.ti.got||{}; TITLES.forEach(t=>S.ti.got[t.id]=1); syncArmy(); render(); })()`;
  const over=`(()=>{ const W=document.documentElement.clientWidth, bad=new Set(); document.querySelectorAll('#app *').forEach(el=>{ const r=el.getBoundingClientRect(); if(!(r.width>0&&r.right>W+1)) return;
    for(let a=el.parentElement;a;a=a.parentElement){ const cs=getComputedStyle(a); if(/auto|scroll|hidden/.test(cs.overflowX)&&a.getBoundingClientRect().right<=W+1) return; } bad.add((el.className&&el.className.baseVal==null?el.className:el.tagName)+''); }); return [document.documentElement.scrollWidth,[...bad].slice(0,6)]; })()`;
  // 1. a phone
  const p=await b.newPage({viewport:{width:360,height:740},hasTouch:true,isMobile:true}); p.on('pageerror',e=>errs.push(e.message)); await p.goto(url); await p.waitForTimeout(300); await p.evaluate(setup);
  for(const t of TABS){ await p.evaluate(t=>{ ui.tab=t; render(); },t); await p.waitForTimeout(20); const [sw,bad]=await p.evaluate(over); if(sw>360||bad.length) fails.push('360 px, '+t+': '+sw+' '+bad.join(' ')); }
  await p.evaluate(()=>{ S.mode='town'; startRun(0); render(); }); await p.waitForTimeout(60); { const [sw,bad]=await p.evaluate(over); if(sw>360||bad.length) fails.push('360 px, battle: '+sw+' '+bad.join(' ')); }
  { const log=await p.evaluate(()=>!!document.querySelector('.log.short')); if(!log) fails.push('360 px, battle: the log is not short'); }
  await p.evaluate(()=>{ S.run.corpses=[]; S.mode='raise'; render(); }); { const [sw,bad]=await p.evaluate(over); if(sw>360||bad.length) fails.push('360 px, raise: '+sw+' '+bad.join(' ')); }
  // 2. the late save's render times, in a real browser, in both languages
  const d=await b.newPage({viewport:{width:1280,height:900}}); d.on('pageerror',e=>errs.push(e.message)); await d.goto(url); await d.waitForTimeout(300); await d.evaluate(setup);
  for(const lang of ['en','tr']){ const times=await d.evaluate(([TABS,lang])=>{ VIEW.lang=lang; const o={}; for(const t of TABS){ const v=[]; for(let i=0;i<9;i++){ ui.tab=t==="help"?"lore":"help"; render(); document.body.offsetHeight; ui.tab=t; const a=performance.now(); render(); document.body.offsetHeight; v.push(performance.now()-a); } o[t]=Math.min(...v); } return o; },[TABS,lang]);
    console.log(lang+': '+TABS.map(t=>t+' '+times[t].toFixed(0)).join(', ')+' ms'); for(const t of ['town','army']) if(times[t]>=50) fails.push(lang+' '+t+' '+times[t].toFixed(0)+' ms (budget 50)'); }
  await b.close(); if(errs.length) fails.push('page errors: '+errs.slice(0,3).join(' | '));
  console.log(fails.length?'FAIL\n  '+fails.join('\n  '):'mobile and late-save checks pass'); process.exit(fails.length?1:0);
})();
