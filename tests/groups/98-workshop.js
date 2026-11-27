// The Bone Workshop, R22 PR A (src/game-workshop.js, src/ui-codex.js): parts sewn from trophies or cut from kept bodies,
// four slots, cores, the build, breaking instead of shattering, repairs, replacing a part, the specializations, the save.
(function(){
const {test,ok,eq,fresh,arena,foe,renderAll,invariants,canon}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const shop=(lv)=>{ fresh(30); S.mode='town'; S.run=null; S.watches=WATCHES; S.gold=1e6; S.dust=1e4; S.notices=[]; S.build=Object.assign({},S.build,{crypt:2,workshop:lv==null?1:lv}); S.parts={}; S.broken=[]; S.spec={}; return S; };
const D={fr:'Grave Beetle',ar:'Tunnel Rat',hd:'Bog Witch',co:'soul'};
const kit=(k,n)=>{ S.parts=S.parts||{}; S.parts[k]=(S.parts[k]||0)+(n||1); };
const stock=()=>{ kit(D.fr); kit(D.ar); kit(D.hd); };

test('Workshop: opens at the Crypt level 2; parts are sewn from trophies (4 with the Bonesmith) or cut from kept bodies',()=>{
  shop(0); S.build.crypt=1; ok(!BUILD.workshop.open(),'Crypt 1'); S.build.crypt=2; ok(BUILD.workshop.open()); ok(!consOpen(),'not built');
  shop(); S.trophies={'Tunnel Rat':5}; ok(!sewPart('Tunnel Rat'),'five is not enough'); S.trophies['Tunnel Rat']=6; ok(sewPart('Tunnel Rat')); eq(partsOf('Tunnel Rat'),1); ok(!S.trophies['Tunnel Rat'],'spent');
  S.build.workshop=3; S.spec={workshop:{3:'a'}}; S.trophies['Tunnel Rat']=4; ok(sewPart('Tunnel Rat'),'Bonesmith'); eq(partsOf('Tunnel Rat'),2);
  S.embalm=[{c:{base:'Crypt Ghoul',name:'Crypt Ghoul',lvl:5},day:S.day},{c:{base:'The Crypt Warden',name:'Boss',lvl:5,boss:true},day:S.day}];
  ok(!cutPart(1),'not a boss'); ok(cutPart(0)); eq(partsOf('Crypt Ghoul'),1); eq(S.embalm.length,1);
  S.spec={workshop:{3:'b'}}; S.embalm.unshift({c:{base:'Crypt Ghoul',name:'Crypt Ghoul',lvl:5},day:S.day}); cutPart(0); eq(partsOf('Crypt Ghoul'),3,'Flesh Sculptor: two parts');
  S.mode='battle'; S.trophies['Tunnel Rat']=6; ok(!sewPart('Tunnel Rat'),'only in town');
});
test('A construct: the frame sets role and HP, the arms attack and type, the head a trait or a kit, the core its gift; costs a watch',()=>{
  shop(); stock(); ok(/four slots/.test(consWhy({fr:D.fr,ar:D.ar,hd:D.hd})));
  const g0=S.gold, d0=S.dust, w0=S.watches, p=consCost(D); const m=buildCons(D); ok(m,'built'); eq(m.role,'vanguard'); eq(m.kind,'Grave Beetle'); ok(m.cons&&m.cons.co==='soul');
  eq(S.gold,g0-p.g); eq(S.dust,d0-p.d-CONS_SOUL_DUST); eq(S.watches,w0-1); eq(partsOf(D.fr),0); ok(S.army.includes(m)); eq(consN(),1);
  ok(consKits(m).includes(KIT_OF['Bog Witch']),'a kit head gives its echo'); ok(consEchoK(m,KIT_OF['Bog Witch']));
  ok(/keeps 1 construct/.test(consWhy(D)),'the cap'); eq(T_('constructs'),1);
  shop(); kit('Grave Beetle'); kit('Crypt Ghoul'); kit('Tallow Chandler'); S.trophies={'b:The Crypt Warden':1}; const c={fr:'Grave Beetle',ar:'Crypt Ghoul',hd:'Tallow Chandler',co:'heart:The Crypt Warden'};
  ok(coreOpts().some(o=>o[0]===c.co),'a spare heart is a core'); const n=buildCons(c); ok(n); eq(consType(n),GATE_HITS[1],'striker arms strike with their gate');
  eq(consK(n,'atk'),1+CONS_HEART); eq(T_('heartCores'),1); ok(!S.trophies['b:The Crypt Warden'],'the heart is spent');
  eq(consType({cons:{ar:'Crypt Ghoul'}}),GATE_HITS[1]); eq(consType({cons:{ar:'Grave Beetle'}}),'phys');
  shop(); stock(); eq(headTrait('Grave Beetle'),'stalwart','the role trait'); eq(headTrait('Bog Witch'),'hexing'); const x=consPreview(Object.assign({},D,{hd:'Pit Warden'})); ok(x.traits.includes('stalwart'));
});
test('Mismatched parts cost 5% a gate step; a striker frame of gate 3 with gate-1 parts is weaker; Rift core and level 4',()=>{
  shop(); const lo=consPreview({fr:'Ember Stalker',ar:'Ember Stalker',hd:'Ember Stalker',co:''}), mix=consPreview({fr:'Ember Stalker',ar:'Tunnel Rat',hd:'Tunnel Rat',co:''});
  eq(lo.rankI,2); ok(mix.hf<lo.hf,'lower HP factor'); eq(mix.hf,Math.round(kindInfo('Ember Stalker').hf*(1-CONS_LOW)*100)/100,'(2+0+0+2)/4: one step');
  const m={cons:{fr:'Tunnel Rat',ar:'Tunnel Rat',hd:'Tunnel Rat',co:'shard'}}; eq(consK(m,'atk'),1+CONS_SHARD_K); eq(consK(m,'hp'),1);
  S.build.workshop=4; eq(consK(m,'hp'),1+CONS_L4); S.run={rift:1}; eq(consK(m,'atk'),1+CONS_SHARD_RIFT); S.run=null;
  CONS_ON=false; eq(consK(m,'atk'),1,'off'); CONS_ON=true;
});
test('A construct never shatters: it breaks, waits a day, and the Workshop repairs it (half price at level 2, free with Living Steel)',()=>{
  shop(); stock(); const m=buildCons(D); const r={events:[]}; ok(consBreak(m,r)); ok(!S.army.includes(m)); ok(S.broken.includes(m)); eq(m.broken,S.day); ok(r.events.length);
  ok(!consRepairReady(m),'not the same day'); ok(!repairCons(m.uid)); S.day++; ok(consRepairReady(m)); const c=consRepairCost(m); eq(c.g,CONS_REPAIR_G*(m.rankI+1));
  const g0=S.gold; ok(repairCons(m.uid)); eq(S.gold,g0-c.g); ok(S.army.includes(m)); eq(m.hp,m.maxHp); ok(m.broken==null);
  S.build.workshop=2; eq(consRepairCost(m).g,Math.round(CONS_REPAIR_G*(m.rankI+1)*.5)); S.spec={workshop:{5:'b'}}; S.build.workshop=5; consBreak(m); ok(consRepairReady(m),'Living Steel: at once'); eq(consRepairCost(m).g,0);
  ok(!consBreak(S.army.find(x=>!x.cons)||{}),'an ordinary minion is not handled');
  const o=S.army.find(x=>!x.cons&&x.role==='vanguard')||{role:'vanguard'}; ok(!canFuse(m,o)&&!canFuse(o,m),'never fused');
});
test('Replacing a part: the old one is lost, the construct changes; a second head needs the Masterwork',()=>{
  shop(); stock(); const m=buildCons(D); kit('Crypt Ghoul'); const g0=S.gold; ok(replacePart(m.uid,'ar','Crypt Ghoul')); eq(m.cons.ar,'Crypt Ghoul'); eq(S.gold,g0-CONS_REPLACE); eq(consType(m),GATE_HITS[1]);
  kit('Marrow Mite'); ok(!replacePart(m.uid,'h2','Marrow Mite'),'no Masterwork'); S.build.workshop=5; S.spec={workshop:{5:'a'}}; ok(replacePart(m.uid,'h2','Marrow Mite')); ok(m.ht.length+consKits(m).length>=2,'two heads');
  shop(5); S.spec={workshop:{5:'a'}}; stock(); kit('Marrow Mite'); ok(buildCons(Object.assign({},D,{h2:'Marrow Mite'})),'built with two heads');
});
test('Three constructs at level 5 earn Patchwork Army; four gates in one; the cap counts the broken',()=>{
  shop(5); for(let i=0;i<3;i++){ stock(); S.watches=WATCHES; ok(buildCons(D),'construct '+(i+1)); } eq(T_('patchwork'),1); stock(); ok(/keeps 3/.test(consWhy(D)));
  consBreak(S.army.find(m=>m.cons)); ok(/keeps 3/.test(consWhy(D)),'the broken still count');
  shop(); kit('Ember Stalker'); kit('Crypt Ghoul'); kit('Tunnel Rat'); S.trophies={'b:The Choir Eternal':1}; ok(buildCons({fr:'Ember Stalker',ar:'Crypt Ghoul',hd:'Tunnel Rat',co:'heart:The Choir Eternal'})); eq(T_('gatesInOne'),1);
});
test('The bench on the Town tab: sew, cut, the slots, the preview card, build, repair; the Codex section; Turkish',()=>{
  shop(); S.trophies={'Tunnel Rat':6}; S.embalm=[{c:{base:'Crypt Ghoul',name:'Crypt Ghoul',lvl:5},day:S.day}]; ui.tab='town'; ui.bsel='workshop';
  let h=renderAll('workshop'); ok(h.includes('data-a="wssew"')&&h.includes('data-a="wscut"')&&h.includes('data-a="wsslot"'),'the bench');
  ACTIONS.wssew('Tunnel Rat'); eq(partsOf('Tunnel Rat'),1); stock();
  ACTIONS.wsslot('fr'); ACTIONS.wspick(D.fr); eq(ui.ws.fr,D.fr); eq(ui.ws.s,'ar','moves on'); ACTIONS.wspick(D.ar); ACTIONS.wspick(D.hd); eq(ui.ws.s,'co'); ACTIONS.wspick('soul');
  h=renderAll('workshop preview'); ok(h.includes('ws-card')&&h.includes('data-a="wsbuild"'));
  ACTIONS.wsbuild(); eq(consN(),1); const m=consAll()[0]; consBreak(m); S.day++; h=renderAll('workshop broken'); ok(h.includes('data-a="wsfix"')); ACTIONS.wsfix(String(m.uid)); ok(S.army.includes(m));
  ACTIONS.wsrep(String(m.uid)); eq(ui.ws.r,m.uid); h=renderAll('workshop replace'); ok(h.includes('Replacing a part'));
  ui.tab='codex'; ok(consCxHTML().includes('Constructs'));
  for(const s of ['Bone Workshop','Build the Bone Workshop first.','Fill all four slots.','First Stitch','Constructs','The bench']) ok(tr(s)!==s,'Turkish: '+s);
  invariants();
});
test('Save: parts, constructs and the broken survive; bad data is cleaned; off switch',()=>{
  shop(); stock(); const m=buildCons(D); kit('Tunnel Rat',2); consBreak(m); const j=JSON.parse(JSON.stringify(S)); normalizeSave(j); eq(canon(j.parts),canon(S.parts)); eq(j.broken.length,1); eq(j.broken[0].cons.fr,D.fr);
  const b={army:[{cons:{fr:'Nope'},lvl:1}],reserve:[],parts:{'Nope':3,'Tunnel Rat':'2'},broken:[{cons:D,lvl:3,role:'vanguard',broken:'x'},5,{lvl:2}]}; consFix(b); ok(!b.army[0].cons); eq(canon(b.parts),canon({'Tunnel Rat':2})); eq(b.broken.length,1); eq(b.broken[0].broken,0);
  const c={army:[],reserve:[]}; consFix(c); ok(!('parts' in c)&&!('broken' in c),'only what is there');
  CONS_ON=false; ok(!consOpen()); CONS_ON=true;
});
})();
