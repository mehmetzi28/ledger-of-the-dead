// UX and onboarding, R18 PR B: a late-game save renders within budget, the save size is watched, damage colours stay apart
// for colour blindness, text size 90-130%, the phone's short battle log and tap-to-open tooltips.
(function(){
const {test,ok,eq,fresh,foe,arena,mkMinion,give,renderAll,TABS,richState}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
function lateSave(){   // the spec's fixture: 500+ items, 60 minions, every title, 200 Memorial names, a full History and three lost rooms
  richState(); const ids=Object.keys(ITEM).filter(id=>!ITEM[id].uq);
  while(S.inv.length<520) give(ids[S.inv.length%ids.length]); S.inv.forEach((it,i)=>{ if(i%2&&!ITEM[it.id].uq&&!it.ro) it.ro=rollItem(it.id,true); });
  const names=allNames().filter(n=>!TW_BOSS.includes(n));
  for(let i=S.army.length;i<40;i++) mkMinion({name:names[i%names.length],kind:names[i%names.length],lvl:30+i%20,lvl0:20,stage:i%4,traits:['thick','vicious']});
  S.reserve=S.reserve||[]; for(let i=0;i<20;i++){ const m=mkMinion({name:names[i],kind:names[i],lvl:25}); S.army.pop(); S.reserve.push(m); }
  S.memorial=Array.from({length:MEM_MAX},(_,i)=>({nick:'N'+i,name:'Tunnel Rat',kind:'Tunnel Rat',rk:0,st:i%3,lvl:10+i%40,day:i,tr:['thick'],role:'striker'}));
  S.lost=Array.from({length:LOST_N},(_,i)=>({d:30+i,g:i,room:2,lv:30,turns:Array.from({length:TJ_MAX},(_,j)=>[1+(j>>2),'Line '+j+' of a long fight in the dark.','']),hp:{1:[100,200,3,5]},foes:[{n:'Tunnel Rat',hp:5,mx:90}],fb:{n:'Tunnel Rat',k:'hit'}}));
  syncArmy(); S.mode='town'; return S;
}
const med=f=>{ f(); const t=[]; for(let i=0;i<5;i++){ const a=performance.now(); f(); t.push(performance.now()-a); } return t.sort((a,b)=>a-b)[2]; };
test('A late save: every tab renders within budget (Town and Army under 50 ms) and a battle turn under 16 ms',()=>{
  lateSave(); eq(S.army.length+S.reserve.length,60); ok(S.inv.length>=500); const got=[];
  for(const t of TABS){ ui.tab=t; const ms=med(()=>{ PAINTED.top=null; render(); }); got.push(t+' '+ms.toFixed(1)); ok(ms<(t==='town'||t==='army'?50:100),'tab '+t+': '+ms.toFixed(1)+' ms'); }
  arena([foe({hp:1e9}),foe({hp:1e9}),foe({hp:1e9})]); const turn=med(()=>{ S.player.hp=pMax(); act('strike'); }); ok(turn<16,'a battle turn: '+turn.toFixed(1)+' ms');
  ok(TAB.size>0&&TAB.size<SAVE_WARN,'the save stays well under the warning: '+TAB.size);
});
test('A long bag shows '+'60 pieces at a time, with Show more',()=>{
  lateSave(); S.mode='town'; ui.tab='gear'; const eqN=h=>(h.match(/data-a="equip"/g)||[]).length; let h=renderAll('bag');
  eq(eqN(h),BAG_PAGE); ok(new RegExp('Show '+BAG_PAGE+' more \\('+(S.inv.length-BAG_PAGE)+' not shown\\)').test(h));
  ACTIONS.bagmore(); eq(eqN(renderAll('more')),2*BAG_PAGE); ui.bagN=1e4; h=renderAll('all'); eq(eqN(h),S.inv.filter(it=>it).length); ok(!/data-a="bagmore"/.test(h));
  ok(tr('Show 60 more (460 not shown)')!=='Show 60 more (460 not shown)','Turkish');
});
test('Saves stay bounded: History, Memorial, lost rooms and the turn journal keep their caps through a load',()=>{
  lateSave(); S.hist=Array.from({length:HIST_N+30},(_,i)=>({d:i,g:0,f0:0,f1:0,rooms:1,kills:1,xp:1,gold:1,items:0,raised:0,mod:null,res:'cleared'}));
  S.memorial=S.memorial.concat(S.memorial); S.lost=S.lost.concat(S.lost);
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.hist.length,HIST_N); ok(g.memorial.length<=MEM_MAX); eq(g.lost.length,LOST_N); ok(g.lost.every(x=>x.turns.length<=TJ_MAX));
  const r=arena([foe({hp:1e9})]); r.tj=[]; for(let i=0;i<TJ_MAX+40;i++) log('x'.repeat(400)); eq(r.tj.length,TJ_MAX); ok(r.tj.every(t=>t[1].length<=TJ_LINE));
});
test('Save size: the Settings page shows it; a large save and a refused write warn on every screen',()=>{
  fresh(5); ui.tab='settings'; let h=renderAll('settings'); ok(/Save size: [\d,]+ KB/.test(h));
  const keep=save; try{ save=()=>{}; TAB.size=SAVE_WARN+1e5; h=renderAll('big'); ok(/Your save is 4\.1 MB/.test(h)&&/large: download a save file/.test(h));
    TAB.size=1000; TAB.full=true; ui.tab='gates'; h=renderAll('full'); ok(/refused the last save/.test(h)); TAB.full=false; ok(!/refused the last save/.test(renderAll('ok')));
  } finally { save=keep; TAB.size=0; TAB.full=false; }
  const set=localStorage.setItem; try{ localStorage.setItem=()=>{ throw new Error('QuotaExceededError'); }; S.gold++; save(); ok(TAB.full,'a refused write is caught'); } finally { localStorage.setItem=set; } S.gold++; save(); ok(!TAB.full);
});
test('Damage colours: apart under protanopia, deuteranopia and tritanopia, never blue or purple, always with their glyph',()=>{
  const M={none:[1,0,0,0,1,0,0,0,1],prot:[.152286,1.052583,-.204868,.114503,.786281,.099216,-.003882,-.048116,1.051998],deut:[.367322,.860646,-.227968,.280085,.672501,.047413,-.01182,.04294,.968881],trit:[1.255528,-.076749,-.178779,-.078411,.930809,.147602,.004733,.691367,.3039]};
  const lin=c=>{ c/=255; return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4); }, rgb=h=>[1,3,5].map(i=>lin(parseInt(h.slice(i,i+2),16)));
  const lab=([r,g,b])=>{ [r,g,b]=[r,g,b].map(v=>Math.max(0,v)); const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116, X=f((r*.4124+g*.3576+b*.1805)/.95047), Y=f(r*.2126+g*.7152+b*.0722), Z=f((r*.0193+g*.1192+b*.9505)/1.08883); return [116*Y-16,500*(X-Y),200*(Y-Z)]; };
  for(const m in M){ const a=M[m], L=DT_IDS.map(t=>{ const [r,g,b]=rgb(DT_FX[t].c); return lab([a[0]*r+a[1]*g+a[2]*b,a[3]*r+a[4]*g+a[5]*b,a[6]*r+a[7]*g+a[8]*b]); });
    for(let i=0;i<L.length;i++) for(let j=i+1;j<L.length;j++){ const d=Math.hypot(L[i][0]-L[j][0],L[i][1]-L[j][1],L[i][2]-L[j][2]); ok(d>=12,m+': '+DT_IDS[i]+' and '+DT_IDS[j]+' '+d.toFixed(1)); } }
  for(const t of DT_IDS){ const [r,g,b]=[1,3,5].map(i=>parseInt(DT_FX[t].c.slice(i,i+2),16)/255), mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
    const hue=d?(mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4)*60:0, sat=mx?d/mx:0; ok(!(sat>.2&&((hue+360)%360)>=190&&((hue+360)%360)<=300),'not blue or purple: '+t); }
  if(window.__css) for(const t of DT_IDS) ok(window.__css.includes('.dt-'+t+'{color:'+DT_FX[t].c+'}'),'the CSS class matches: '+t);
  fresh(30); ui.tab='gates'; ok(/Weak: <b class="dt dt-fire"><svg class="dtg"/.test(renderAll('gates')),'a type name carries its glyph');
});
test('Text size: five steps from 90% to 130%, kept by the view; the phone shows the short battle log',()=>{
  fresh(5); ui.tab='settings'; let h=renderAll('sizes'); for(const p of ['90%','100%','110%','120%','130%']) ok(h.includes('>'+p+'</button>'),p);
  ACTIONS.view('size|3'); ok(document.body.classList.contains('ts3')); eq(VIEW.size,3); ACTIONS.view('size|0'); ok(!document.body.classList.contains('ts3'));
  arena([foe({hp:1e6})]); for(let i=0;i<6;i++) log('line '+i); const w=window.innerWidth;
  try{ window.innerWidth=1200; ok(!/class="log short"/.test(renderAll('wide'))||FXS.on,'wide: the whole log'); window.innerWidth=360; ok(/class="log short"/.test(renderAll('phone')),'a phone: three lines and a toggle'); } finally { window.innerWidth=w; }
});
test('Tooltips on touch: a tap on text with a tooltip opens it; controls keep their own tap',()=>{
  const el=(title,ctl)=>({closest:sel=>sel==='[title]'?(title?{getAttribute:()=>title,closest:s=>ctl&&s.includes('button')?{}:null}:null):null});
  eq(tsheetFor(el('+20% HP')),'+20% HP'); eq(tsheetFor(el('Ready in 2 turns',true)),null,'a button'); eq(tsheetFor(el(null)),null);
});
test('Turkish: the R18 PR B text',()=>{
  for(const s of ['Text size','90% is the compact view: it fits more on a phone, with tighter spacing and tabs on one swipeable line. 110% to 130% make the whole page bigger','Save size: 64 KB','large: download a save file',
    'The browser refused the last save: its storage for this page is full. Download a save file from Settings now, then clear old save slots or backups','Your save is 4.1 MB, close to what a browser keeps for one page. Download a save file from Settings to be safe','90% is the compact view: it fits more on a phone, with tighter spacing and tabs on one swipeable line (recommended on this screen). 110% to 130% make the whole page bigger'])
    ok(tr(s)!==s,'Turkish: '+s);
});
})();
