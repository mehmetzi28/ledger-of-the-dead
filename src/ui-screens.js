const LEDGER=[['lore','Lore'],['codex','Codex'],['bes','Bestiary'],['hist','History'],['rec','Records'],['mem','Memorial'],['help','How to play']];   // the Ledger tab's pages
function spendStrip(){   // on narrow screens the stats sit far below: offer the + buttons up here while points are waiting
  const P=S.player; if(P.pts<=0&&!(P.sp>0)) return '';
  return '<div class="spend-strip">'+(P.pts>0?'<span>'+P.pts+' point'+(P.pts>1?'s':'')+' to spend:</span>'+[['strength','Strength'],['constitution','Constitution'],['intelligence','Intelligence'],['will','Will']].map(([k,n])=>'<button class="btn small" data-a="alloc" data-k="'+k+'" aria-label="Add a point to '+n+'">+ '+n+'</button>').join(''):'')
   +(P.sp>0?'<button class="btn small primary" data-a="tab" data-k="skills">'+P.sp+' skill point'+(P.sp>1?'s':'')+': open Skills</button>':'')+'</div>';
}
function townHTML(){
  if(ui.tab==='town'&&!townOpen()) ui.tab='gates';
  if(ui.tab==='tower'&&!towerOpen()) ui.tab='gates';   // closed tabs are not shown at all; the number keys follow the tabs that are
  let h=notesHTML()+spendStrip();
  h+='<div class="tabs" role="tablist">'
    +[['gates','Gates']].concat(towerOpen()?[['tower','Hell Tower']]:[]).concat([['gear','Gear &middot; '+S.inv.length],['market','Market'],['army','Army &middot; '+S.army.length]]).concat(townOpen()?[['town','Town']]:[])
    .concat([['skills','Skills'+(S.player.sp?' &middot; '+S.player.sp:'')],['titles','Titles &middot; '+Object.keys((S.ti&&S.ti.got)||{}).length],['ledger','Ledger']])
    .map((t,i)=>'<button class="tab'+(t[0]==='tower'?' hell':'')+'" role="tab" data-a="tab" data-k="'+t[0]+'" aria-keyshortcuts="'+(i+1)+'" aria-selected="'
        +(t[0]==='ledger'?LEDGER.some(x=>x[0]===ui.tab):(ui.tab||'gates')===t[0])+'">'+t[1]+(i<9?'<kbd aria-hidden="true">'+(i+1)+'</kbd>':'')+'</button>').join('')
   +'<button class="tab keyhint" data-a="keys" aria-keyshortcuts="?" aria-label="Keyboard shortcuts" title="Keyboard shortcuts">?</button></div>';
  if(LEDGER.some(x=>x[0]===ui.tab)){ ui.ledger=ui.tab; h+='<div class="chips sub-nav" role="tablist">'+LEDGER.map(x=>'<button class="btn small'+(x[0]===ui.tab?' primary':'')+'" role="tab" data-a="tab" data-k="'+x[0]+'" aria-selected="'+(x[0]===ui.tab)+'">'+x[1]+'</button>').join('')+'</div>'; }
  if(ui.tab==='gear') return h+loadoutHTML()+bagHTML();
  if(ui.tab==='army') return h+armyTabHTML();
  if(ui.tab==='bes') return h+bestiaryHTML();
  if(ui.tab==='skills') return h+skillsHTML();
  if(ui.tab==='market') return h+marketHTML();
  if(ui.tab==='town') return h+buildHTML();
  if(ui.tab==='tower') return h+towerHTML();
  if(ui.tab==='titles') return h+titlesHTML();
  if(ui.tab==='settings') return h+saveTabHTML();
  if(ui.tab==='help') return h+helpHTML();
  if(ui.tab==='hist') return h+histHTML();
  if(ui.tab==='rec') return h+recordsHTML();
  if(ui.tab==='mem') return h+memorialHTML();
  if(ui.tab==='lore') return h+loreHTML();
  if(ui.tab==='codex') return h+codexHTML();
  const subs=gateSubs(), sub=subs.some(x=>x[0]===ui.gsub)?ui.gsub:'open';   // the Gates tab's own sub-tabs: the gates, the War table, the Rift
  if(subs.length>1) h+='<div class="chips sub-nav" role="tablist">'+subs.map(x=>'<button class="btn small'+(x[0]===sub?' primary':'')+'" role="tab" data-a="gsub" data-k="'+x[0]+'" aria-selected="'+(x[0]===sub)+'">'+x[1]+'</button>').join('')+'</div>';
  if(sub==='war') return h+raidHTML()+armyBriefHTML();
  if(sub==='rift') return h+riftHTML()+armyBriefHTML();
  if(sub==='trial') return h+trialHTML()+armyBriefHTML();
  h+='<section class="win" aria-labelledby="h-gates"><h2 class="win-h" id="h-gates">Open gates</h2><h3 class="win-title">Choose where to hunt</h3>'+gateArmyHTML()
   +((n=>n<FIRST_STEPS.length&&!(S.tips&&S.tips.off)?'<p class="q-note guide-link"><button class="linkbtn" data-a="tab" data-k="help">How to play &middot; first steps '+n+'/'+FIRST_STEPS.length+'</button></p>':'')(stepsDone()))   /* for a new player; gone once every step is done or tips are switched off */
   +(omen()?'<div class="omen-line" title="It touches every gate and the Tower until dawn."><b>Omen today: '+OMENS[omen()].name+'.</b> '+OMENS[omen()].desc+'</div>':'')+rivalWarnHTML()
   +'<div class="gates">'+DUNGEONS.map((d,i)=>gateHTML(i)).join('')+'</div>'
   +'<div class="btns"><button class="btn small" data-a="rest">Rest until dawn</button></div></section>';
  return h;
}
function gateSubs(){
  const out=raidOrders(), war=raidPool().some(isCommander)||out.length||(S.raidLog||[]).length;
  return [['open','Gates']].concat(war?[['war','War table'+(out.length?' &middot; '+out.length+' tonight':'')]]:[]).concat(S.ti&&S.ti.clr&&S.ti.clr[5]?[['rift','The Rift'+(riftOpen()?' &middot; next '+(riftBest()+1):' &middot; Lv '+RIFT_LV)]]:[]).concat(trialOpen()?[['trial','Trial'+(tri().day===S.day?' &middot; tried today':'')]]:[]);
}
function nick(u){ return u.id==='p'?'You':u.nick||u.name; }
// A small glyph on each status pill, so they read without colour: drop, bubbles, flame, wilt, snowflake, frost waves, eye, crack, down arrow, chevrons, shield.
const ST_GLYPH=(G=>{ const o={}; for(const k in G) o[k]='<svg class="pg" viewBox="0 0 10 10" aria-hidden="true">'+G[k]+'</svg>'; return o; })({
  bleed:'<path d="M5 1C3 4 2 5.5 2 6.8A3 3 0 0 0 8 6.8C8 5.5 7 4 5 1Z"/>',
  poison:'<circle cx="3.2" cy="6.6" r="2.1"/><circle cx="6.9" cy="5.4" r="1.6"/><circle cx="5" cy="2.4" r="1.2"/>',
  burn:'<path d="M5 .8C6.6 3 8 4.3 8 6.4A3 3 0 0 1 2 6.4C2 5 2.8 4.2 3.4 3.6C3.6 4.7 4.1 5.2 4.6 5.3C4.4 3.7 4.5 2.3 5 .8Z"/>',
  blight:'<path class="pgs" d="M5 9V4.5M5 4.5C3.5 4.5 2 3.6 1.6 1.6M5 4.5C6.5 4.5 8 3.6 8.4 1.6M5 6.5L3 8M5 6.5L7 8"/>',
  frozen:'<path class="pgs" d="M5 .8V9.2M1.4 2.9L8.6 7.1M1.4 7.1L8.6 2.9M3.8 1.6L5 2.8L6.2 1.6M3.8 8.4L5 7.2L6.2 8.4"/>',
  chilled:'<path class="pgs" d="M1 3.2Q2.5 2 4 3.2T7 3.2T9.6 3.2M1 6.8Q2.5 5.6 4 6.8T7 6.8T9.6 6.8"/>',
  cursed:'<path class="pgs" d="M.8 5Q5 .6 9.2 5Q5 9.4 .8 5Z"/><circle cx="5" cy="5" r="1.6"/>',
  sundered:'<path class="pgs" d="M5 .8L8.6 2.2V5.2C8.6 7.2 7 8.6 5 9.3C3 8.6 1.4 7.2 1.4 5.2V2.2Z"/><path class="pgs" d="M5.4 1.4L4.2 4L6 5.2L4.6 8.6"/>',
  hexed:'<path d="M5 9.2L1.2 4.6H3.6V.8H6.4V4.6H8.8Z"/>',
  hasted:'<path class="pgs" d="M1.4 1.8L4.6 5L1.4 8.2M5.2 1.8L8.4 5L5.2 8.2"/>',
  shield:'<path d="M5 .8L8.6 2.2V5.2C8.6 7.2 7 8.6 5 9.3C3 8.6 1.4 7.2 1.4 5.2V2.2Z"/>'
});
// Status pills under a unit's name in battle: damage over time, conditions, Frozen, Cursed and a foe's shield. Small, wrapping, each with a tooltip.
function stPills(u){
  if(!u||u.hp<=0) return '';
  const p=[], tl=t=>t+' turn'+(t>1?'s':'')+' left.', add=(cls,lab,tip)=>p.push('<span class="pill '+cls+'" title="'+tip+'">'+(ST_GLYPH[cls.slice(2)]||'')+lab+'</span>');
  if(u.dots) for(const k of Object.keys(u.dots)){ const o=u.dots[k]; if(DOTS[k]) add('p-'+k,DOTS[k].name+' '+o.t,DOTS[k].tip+' '+o.d+' damage a turn. '+tl(o.t)); }
  if(hasTrait(u,'stitched')) add('p-shield','Stitched &middot; '+((u.sx||0)>=(hasTrait(u,'patchwork')?2:1)?'spent':'ready'),TRAITS.stitched.desc);   // its one rise this room
  if(u.stun>0) add('p-frozen','Frozen '+u.stun,'Frozen solid: skips its turn, and a charging move is lost. '+tl(u.stun));
  if(u.curse) add('p-cursed','Cursed '+u.curse.t,'Takes '+Math.round((u.curse.mul-1)*100)+'% more damage from every source. '+tl(u.curse.t));
  if(u.st) for(const k of Object.keys(CONDS)) if(u.st[k]>0) add('p-'+k,CONDS[k].name+' '+u.st[k],CONDS[k].desc+' '+tl(u.st[k]));
  if(u.id!=='p'&&u.shield>0) add('p-shield','Shield '+u.shield,'A bone shield soaks damage before HP.');
  return p.length?'<div class="pills">'+p.join('')+'</div>':'';
}
// A foe's next action under its name (intentInfo, game-gate-rules.js): a small glyph, a few words, the detail in the tooltip.
const INTENT_ICO={atk:'M2 10L9 3M6.5 3H9V5.5M3 7l2 2',heal:'M6 2v8M2 6h8',abil:'M6 1l1.4 3.6L11 6 7.4 7.4 6 11 4.6 7.4 1 6l3.6-1.4z',frozen:'M6 1v10M1.7 3.5l8.6 5M1.7 8.5l8.6-5'};
const KNOW_ANS={taunt:['Taunt','Taunt pulls this onto a vanguard.'],guard:['Guard','Guard has a front-row vanguard take it if it would kill you.'],ward:['Bone Ward','Bone Ward soaks it.'],chill:['Grave Chill','Grave Chill freezes it first.'],focus:['Focus','Focus breaks it.']};
const aboutN=n=>n<50?n:Math.round(n/(n<200?5:10))*(n<200?5:10);   // "about": the roll spreads a blow by 15% either way
const endDot=t=>/[.!?]$/.test(t)?t:t+'.';
function sigHTML(s){ return s?(s.you!=null?'<b class="kn">you '+s.you+'</b>':'')+(s.army?'<b class="kn">army '+s.army+'</b>':'')+(s.van!=null?'<b class="kn">vanguard '+aboutN(s.van)+'</b>':''):''; }
function ansHTML(c){ return c&&c.length?'<div class="kn-ans" title="'+c.map(k=>KNOW_ANS[k][1]).join(' ')+'">'+c.map(k=>'<span>'+KNOW_ANS[k][0]+'</span>').join(' &middot; ')+'</div>':''; }
function intentHTML(u){ const i=intentInfo(u); if(!i) return ''; const K=foeKnow(u);   // bestiary knowledge (foeKnow) adds figures by tier; the tooltip carries the detail
  const tip=[i.tip].concat(K.aff?K.aff.map(a=>endDot(AFFIX[a].name+': '+AFFIX[a].desc)):[],K.ans?K.ans.map(k=>KNOW_ANS[k][1]):[]).join(' ');
  return '<div class="intent i-'+i.k+'" title="'+tip+'"><svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="'+INTENT_ICO[i.k]+'"/></svg><span>'+i.txt+'</span>'
   +(K.dmg!=null?'<b class="kn">about '+aboutN(K.dmg)+'</b>':'')+(K.crit?'<span class="kn-crit" title="A striker: its blow can crit for 80% more and open a wound.">can crit</span>':'')+sigHTML(K.sig)+'</div>'
   +(K.next?'<div class="intent-2"><span>then likely</span> <span>'+K.next.txt+'</span></div>':'')+ansHTML(K.ans);
}
function unitCard(u,side,mini){
  const r=S.run, isP=u.id==='p', max=isP?pMax():u.maxHp, f=r.fx[fxKey(u)]||{d:0,h:0}, dead=u.hp<=0;
  const sel=side==='foe'&&r.target===u.id&&!dead, ch=side==='foe'&&!isP?chargeInfo(u):null;
  const tag=isP?'Necromancer':ROLES[u.role].label+(isArmed(u.base||u.name)?' &middot; Armed':'')+(u.boss?' &middot; Boss':'')
    +(u.elite?' &middot; Elite':'')+(u.abil&&!isP?' &middot; <span title="'+BOSS_ABIL[u.abil].desc+'">'+BOSS_ABIL[u.abil].name+'</span>':'')
    +(u.phase2&&!isP?' &middot; <span class="phase-t">Second phase</span>':'')
    +(u.aff&&!isP?u.aff.map(a=>' &middot; <span class="aff" title="'+AFFIX[a].desc+'">'+AFFIX[a].name+'</span>').join(''):'')
    +(u.scd&&CORPSE_CONDS[u.scd]?' &middot; <span class="stash-t" title="A body the rival stole. '+CORPSE_CONDS[u.scd].when+'">'+CORPSE_CONDS[u.scd].name+'</span>':'');
  const rk=isP?'':'<span class="rk r'+u.rankI+'">'+RANKS[u.rankI]+'</span>';
  const fx=(f.d?'<span class="fx neg">-'+f.d+'</span>':f.h?'<span class="fx pos">+'+f.h+'</span>':'')+(f.c?'<span class="fx cmb">'+f.c+'</span>':'');   // c: a status combo fired on it
  const dots=stPills(u)+(side==='foe'?intentHTML(u)+(!dead&&execMark(u)?'<div class="kn-exe" title="Below 40% HP: Execute doubles your reapers\' blows on it this turn.">Execute</div>':''):''), K=ch?foeKnow(u):null;
  const sub=side==='foe'?'Lv '+u.lvl+' &middot; ATK '+u.atk+(dead?'':masteryTag(u.base))
    :(isP?'Lv '+u.lvl+' &middot; ATK '+pAtk():mName(u)+' &middot; Lv '+u.lvl+' &middot; ATK '+u.atk);
  const inner=fx+(ch?'<div class="charge"><b>Charging: '+ch.name+'</b><span class="charge-h">'+ch.hint+'</span>'+sigHTML(K.sig)+ansHTML(K.ans)+(canCommand('striker')?'<span class="kn-ord">Focus breaks this</span>':'')+'</div>':'')+'<div class="u-head">'+(isP?ico('Necromancer',pRankI(),{}):ico(u.base||u.kind||u.name,u.rankI,u))+'<div class="u-id"><div class="u-top">'+rk+'<span class="u-tag">'+tag+'</span></div>'
   +'<div class="u-name">'+(side==='foe'?u.name:nick(u))+'</div><div class="u-sub num">'+sub+'</div>'+dots+'</div></div>'
   +'<div class="bar"><i class="fill hp" style="width:'+pct(u.hp,max)+'%"></i></div>'
   +'<div class="num u-hp">'+Math.max(0,u.hp)+'/'+max+(isP&&u.shield?' <span class="sh-t">+'+u.shield+' ward</span>':'')+'</div>'
   +(isP?'<div class="bar"><i class="fill mp" style="width:'+pct(u.mana,pMana())+'%"></i></div><div class="num u-hp">Mana '+u.mana+'/'+pMana()+'</div>':'');
  if(mini){   // a minion in battle: icon, name, level, attack, HP; the rest lives on the Army tab
    const m='<div class="u-head">'+ico(u.base||u.kind||u.name,u.rankI,u)+'<div class="u-id"><div class="u-name">'+nick(u)+'</div><div class="u-sub num">Lv '+u.lvl+' &middot; ATK '+u.atk+(u.wall?' &middot; Wall':'')+'</div>'+dots+'</div></div>'
      +'<div class="bar"><i class="fill hp" style="width:'+pct(u.hp,max)+'%"></i></div><div class="num u-hp">'+Math.max(0,u.hp)+'/'+max+'</div>';
    return '<div class="unit ally mini'+(dead?' dead':'')+(u.elite?' elite':'')+(f.d?' hit':'')+'" data-u="'+fxKey(u)+'" title="'+mName(u)+', '+ROLES[u.role].label+(u.wall?', on the wall':'')+'">'+fx+m+'</div>'; }
  const cls='unit '+side+(dead?' dead':'')+(sel?' sel':'')+(ch?' charging':'')+(u.elite?' elite':'')+(f.d?' hit':'');
  return side==='foe'&&!dead?'<button class="'+cls+'" data-a="target" data-k="'+u.id+'" data-u="'+u.id+'" aria-pressed="'+sel+'">'+inner+'</button>':'<div class="'+cls+'" data-u="'+fxKey(u)+'">'+inner+'</div>';
}
const ORDER_KEYS={z:'vanguard',x:'striker',c:'mender',v:'reaper'}, ORDER_KEY=Object.fromEntries(Object.entries(ORDER_KEYS).map(([k,r])=>[r,k.toUpperCase()]));
function ultHTML(){   // Souls and the ultimate, from level 20
  const P=S.player; if(P.lvl<ULT_LV) return '';
  const n=S.run.souls||0, U=ULTS[P.ult]; let pips=''; for(let i=0;i<SOUL_MAX;i++) pips+='<i class="soul'+(i<n?' on':'')+'"></i>';
  return '<div class="btns ult-row"><span class="souls" aria-label="'+n+' of '+SOUL_MAX+' Souls">Souls '+pips+'</span>'
   +(U?'<button class="btn ult'+(canUlt()?' primary':'')+'" data-a="act" data-k="ult" title="'+U.desc+'"'+(canUlt()?'':' disabled')+'>'+U.name+'<kbd>R</kbd></button>':'<span class="u-sub">Choose an ultimate on the Skills tab.</span>')+'</div>';
}
const ANS_M='<span class="ans-m" aria-hidden="true" title="Answers the charge"></span>', ANS_S='<span class="sr-only">, answers the charge</span>';
function chargeAns(){ const c=S.run&&S.mode==='battle'&&S.run.enemies.map(chargeInfo).find(Boolean); return c?c.ans:[]; }   // answer keys for the pending charge (none when nothing charges)
function cmdHTML(){
  const roles=Object.keys(CMDS).filter(k=>S.army.some(m=>m.role===k&&m.hp>0)); if(!roles.length) return ''; const ans=chargeAns(), oh=orderHints(), OH={vanguard:n=>'pulls '+n,mender:n=>'+'+n+' ward'};
  return '<div class="btns cmds"><span class="cmd-l" title="Free, once a room">Orders:</span>'+roles.map(k=>{ const used=S.run.cmd&&S.run.cmd[k];
    const an=!used&&ans.includes(k);
    return '<button class="btn small'+(an?' answer':'')+'" data-a="cmd" data-k="'+k+'" title="'+CMDS[k].desc+'"'+(used?' disabled':'')+'>'+(an?ANS_M:'')+CMDS[k].name+(used?' &middot; given':'')+(oh[k]!=null?'<span class="ord-h">'+OH[k](oh[k])+'</span>':'')+(an?ANS_S:'')+'<kbd>'+ORDER_KEY[k]+'</kbd></button>'+(k==='vanguard'?guardBtn():''); }).join('')+'</div>';
}
function guardBtn(){ const used=S.run.cmd&&S.run.cmd.guard;   // Guard: costs the turn, so it goes through act; disabled with no vanguard in the front row
  return '<button class="btn small" data-a="act" data-k="guard" title="'+GUARD.desc+'"'+(canGuard()?'':' disabled')+'>'+GUARD.name+(used?' &middot; given':'')+'<kbd>G</kbd></button>';
}
function srAnnounce(){   // read out the newest battle line once (the log itself is rebuilt on every render, so it cannot be the live region)
  const el=document.getElementById('sr-live'); if(!el) return; const L=S.run&&S.mode!=='town'&&S.run.log, last=L&&L.length?L[L.length-1].m:'';
  let say=last&&last!==TAB.sr?last.replace(/<[^>]+>/g,''):'';
  if(last) TAB.sr=last;
  const ch=S.run&&S.mode==='battle'?S.run.enemies.map(e=>[e,chargeInfo(e)]).find(x=>x[1]):null, ck=ch?ch[0].id+'|'+ch[1].mv:'';
  if(ck&&ck!==TAB.srCh){ TAB.srCh=ck; say=(say?say+' ':'')+ch[0].name+'. Charging: '+ch[1].name+'. '+ch[1].hint+'.'; }   /* once per charge, with what answers it */
  if(!ck) TAB.srCh='';
  if(say) el.textContent=VIEW.lang==='tr'?trText(say):say; }
// Front and Back rows in battle (rowOf, game-gate-rules.js): a small label over each row; an empty row is left out
function rowsHTML(list,cls,card){ return [['f','Front'],['b','Back']].map(([k,l])=>{ const L=list.filter(u=>rowOf(u)===k); return L.length?'<div class="brow"><span class="row-l">'+l+'</span><div class="'+cls+'">'+L.map(card).join('')+'</div></div>':''; }).join(''); }
const rowBtn=(m,cls,txt)=>{ const f=rowOf(m)==='f'; return S.mode==='battle'?'':'<button class="'+cls+'" data-a="mrow" data-k="'+m.uid+'" title="'+(f?'Move to back':'Move to front')+'">'+txt(f)+'</button>'; };   // rows change out of battle only
function logHTML(short){   // short (the battle stage is on): the newest three lines, and a toggle for the rest
  const L=S.run.log, cut=short&&L.length>3;
  return '<ol class="log'+(short?' short':'')+'">'+(cut&&!ui.logAll?L.slice(0,3):L).map(l=>'<li class="'+l.c+'">'+l.m+'</li>').join('')+'</ol>'
   +(cut?'<button class="linkbtn log-t" data-a="logall" aria-expanded="'+!!ui.logAll+'">'+(ui.logAll?'Show fewer lines':'Show the full log')+'</button>':''); }
// With the battle stage on (fx.js), each side is one strip of small chips: name, HP, the intent glyph and a charge's answer. The stage
// draws the rest; the card's full text (statuses, intent, bestiary figures) stays in each chip for screen readers.
function chipHTML(u,side){
  const r=S.run, isP=u.id==='p', max=isP?pMax():u.maxHp, dead=u.hp<=0, foe=side==='foe', ch=foe&&!dead?chargeInfo(u):null, i=foe&&!dead&&!ch?intentInfo(u):null, sel=foe&&!dead&&r.target===u.id;
  const inner='<b class="c-n">'+(foe?u.name:nick(u))+'</b><span class="num c-hp">'+Math.max(0,u.hp)+'/'+max+(isP&&u.shield?' +'+u.shield:'')+'</span>'
   +(isP?'<span class="num c-mp">Mana '+u.mana+'/'+pMana()+'</span>':'')
   +(i?'<svg class="c-i i-'+i.k+'" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="'+INTENT_ICO[i.k]+'"/></svg>':'')
   +(ch?'<span class="c-ch"><b>'+ch.name+'</b> <span>'+ch.hint+'</span></span>':'')
   +'<div class="sr-only">'+stPills(u)+(foe?intentHTML(u):'')+'</div>';
  const cls='unit chip '+(foe?'foe':'ally')+(dead?' dead':'')+(sel?' sel':'')+(ch?' charging':'');
  return foe&&!dead?'<button class="'+cls+'" data-a="target" data-k="'+u.id+'" data-u="'+u.id+'" aria-pressed="'+sel+'">'+inner+'</button>':'<div class="'+cls+'" data-u="'+fxKey(u)+'">'+inner+'</div>';
}
function stripHTML(lab,list,side){ const L=list.filter(u=>rowOf(u)==='f').concat(list.filter(u=>rowOf(u)!=='f'));   // front row first, as the stage reads from the middle out
  return '<div class="strip" role="group" aria-label="'+(side==='foe'?'Foes':'Your side')+'"><span class="strip-l">'+lab+'</span>'+L.map(u=>chipHTML(u,side)).join('')+'</div>'; }
const grpHTML=(t,h)=>h?'<div class="cgrp"><p class="rub">'+t+'</p>'+h+'</div>':'';   // a rubric over a group of battle commands (shown in the wide command panel)
function stageTap(k){   // a foe clicked on the battle stage (fx.js): the same action as its card's button
  if(S.mode!=='battle'||!S.run||!S.run.enemies.some(e=>e.id===k&&e.hp>0)) return false;
  if(ui.confirm!==null) ui.confirm=null; ACTIONS.target(k); settled(); return true; }
function stageRaise(k){   // a body clicked on the raise stage (fx.js): the same action as its card's first button (into the Reserve when the army is full)
  const c=S.mode==='raise'&&S.run&&S.run.corpses.find(x=>x.id===k); if(!c||c.tried) return false;
  if(ui.confirm!==null) ui.confirm=null; (armyUsed()>=slots()&&reserveRoom()?ACTIONS.raiseres:ACTIONS.raise)(k); settled(); return true; }
function battleHTML(){
  currentTarget();
  const r=S.run, D=DUNGEONS[r.di], P=S.player, boss=r.room===r.rooms-1, ans=chargeAns(), st=stageOn();   /* st: the battle stage (fx.js) shows the fight; the cards fold into a strip */
  const foeH='Foes'+(foeArmor()?' &middot; '+armorTag(foeArmor()):''), sideH='Your side'+(r.frenzy>0?' &middot; <span class="ok">Frenzy '+r.frenzy+'</span>':'')+(r.silence>0?' &middot; <span class="bad">Silenced '+r.silence+'</span>':'')+(r.taunt>0?' &middot; <span class="ok">Taunting '+r.taunt+'</span>':'');
  const mini='<div class="mini-hp" aria-hidden="true"><div><span>HP '+Math.max(0,P.hp)+'/'+pMax()+(P.shield?' +'+P.shield:'')+'</span><div class="bar"><i class="fill hp" style="width:'+pct(P.hp,pMax())+'%"></i></div></div><div><span>Mana '+P.mana+'/'+pMana()+'</span><div class="bar"><i class="fill mp" style="width:'+pct(P.mana,pMana())+'%"></i></div></div></div>';
  return '<section class="win'+(st?' staged':'')+'" aria-labelledby="h-battle">'+mini+'<h2 class="win-h" id="h-battle">'+(r.tw?'Hell Tower &middot; Floor '+r.tw+(r.tw%10===0?' &middot; Warden':'')+' &middot; Turn '+r.turn:(r.siege?'Siege &middot; Wave '+(r.room+1)+'/'+r.rooms+' &middot; Turn '+r.turn:r.trial?'Trial &middot; Room '+(r.room+1)+'/'+r.rooms+' &middot; Turn '+((r.tt||0)+1):(r.rift?'The Rift &middot; Depth '+r.rift+' &middot; ':'')+D.name+' &middot; Room '+(r.room+1)+'/'+r.rooms+(boss?' &middot; Boss':'')+' &middot; Turn '+r.turn))+'</h2>'
   +((r.mod||r.mod2||r.heat||r.bless)?'<div class="facts run-mods">'+[r.mod,r.mod2].filter(m=>m&&MODS[m]).map(m=>'<span class="bad" title="Cursed: '+MODS[m].name+'. '+MODS[m].desc+'"><i aria-hidden="true">&#9760;</i> '+MODS[m].name+'</span>').join('')
     +(r.heat?'<span class="bad" title="Difficulty: '+HEAT[r.heat].name+(r.mod?', and the curse feeds on it':'')+'.">'+HEAT[r.heat].name+'</span>':'')
     +(r.bless?'<span class="ok" title="Blood-blessed: you and your army hit 15% harder in this gate.">Blood-blessed +15%</span>':'')+'</div>':'')
   +'<div class="bat"><div class="bat-main">'
   +(st?'<div class="stage" aria-hidden="true" style="height:'+(FXS.h||300)+'px"></div>':'')
   +(st?stripHTML(foeH,r.enemies,'foe'):'<p class="group-h">'+foeH+'</p>'+rowsHTML(r.enemies,'row',e=>unitCard(e,'foe')))
   +(st?stripHTML(sideH,[S.player].concat(S.army),'ally'):'<p class="group-h">'+sideH+'</p>'+rowsHTML([S.player].concat(S.army),'row minis side',u=>u.id==='p'?unitCard(u,'ally'):unitCard(u,'ally',true)))
   +'</div><div class="bat-cmd">'
   +'<div class="actbar">'+partyStrip()+'<div class="cgrp"><p class="rub">Actions</p><div class="btns acts-main"><button class="btn primary" data-a="act" data-k="strike">Strike +3 mana<kbd>1</kbd></button>'
   +'<button class="btn" data-a="act" data-k="siphon"'+(P.mana<siphonCost()?' disabled':'')+'>Soul Siphon '+manaCost(siphonCost())+'<kbd>2</kbd></button>'
   +'<button class="btn'+(ans.includes('ward')&&P.mana>=6?' answer':'')+'" data-a="act" data-k="ward"'+(P.mana<6?' disabled':'')+'>'+(ans.includes('ward')&&P.mana>=6?ANS_M:'')+'Bone Ward '+manaCost(6)+(ans.includes('ward')&&P.mana>=6?ANS_S:'')+'<kbd>3</kbd></button>'
   +'<button class="btn warn" data-a="flee"'+(r.siege?' title="Fleeing a siege counts as a defeat"':'')+'>'+(r.siege?'Abandon the walls':'Flee')+'</button></div>'
   +ultHTML()+'</div>'
   +grpHTML('Skills',(activeSkills().length?'<div class="btns">'+activeSkills().map((s,i)=>{ const cd=skCd(s.id), why=r.silence>0?'Silenced by the Hymn':cd>0?'Ready in '+cd+' turn'+(cd>1?'s':''):s.id==='blast'&&!freeCorpse()?'Needs a body that fell this room':s.id==='mend'&&!S.army.some(m=>m.hp>0&&m.hp<m.maxHp)?'No wounded minions':P.mana<s.cost?'Not enough mana':s.desc(sk(s.id));
      const an=ans.includes(s.id)&&canUse(s.id);
      return '<button class="btn'+(an?' answer':'')+'" data-a="act" data-k="sk:'+s.id+'" title="'+why+'"'+(canUse(s.id)?'':' disabled')+'>'+(an?ANS_M:'')+s.name+' '+manaCost(skCost(s))+(cd>0?' &middot; '+cd+'t':'')+(an?ANS_S:'')+(i<6?'<kbd>'+(i+4)+'</kbd>':'')+'</button>'; }).join('')+'</div>':'')
   )
   +grpHTML('Orders',cmdHTML())
   +grpHTML('Potions',((S.belt.hp||S.belt.mp)?'<div class="btns">'+Object.keys(POTIONS).filter(k=>S.belt[k]&&!pactOn('dry')).map(k=>{ const p=POTIONS[k], full=k==='hp'?P.hp>=pMax()&&!P.dots:P.mana>=pMana();
      return '<button class="btn potion" data-a="act" data-k="pot:'+k+'"'+(full?' disabled title="Already full"':' title="'+p.desc+'"')+'>'+p.name+' &times;'+S.belt[k]+'<kbd>'+p.key+'</kbd></button>'; }).join('')+'</div>':'')
   )
   +'</div>'+logHTML(st)+'</div></div></section>';
}
function slotsHTML(){ const n=slots(), u=armyUsed(); let s='<span class="slots" aria-label="'+u+' of '+n+' slots used">'; for(let i=0;i<n;i++) s+='<i class="slot'+(i<u?' on':'')+'"></i>'; return s+'</span>'; }
function minionDetail(m){   // everything about one minion, readable without hovering
  const stage=m.stage||0, next=evoNext(m), g=gearBonus(m), base=m.tw?towerStats(m.tw,m.lvl,m.hf,m.af,m.boss,m.elite):mobStats(m.rankI,m.lvl,m.hf,m.af,m.boss,m.elite);
  const rows=[['Kind',(m.tw?'Hell Tower ':'')+mName(m)+(m.boss?', a raised boss':m.elite?', a raised elite':'')],['Role',ROLES[m.role].label+': '+ROLES[m.role].text],
    ['Evolution',stage===STAGE_MAX?'Eternal, the last form':(STAGES[stage].trim()||'Base form')+(next!=null?'; next at Lv '+next+' ('+STAGES[stage+1].trim()+': '+fxText(STAGE_FX[stage+1])+')':'')],
    ['Base stats','HP '+base.hp+', ATK '+base.atk+' at Lv '+m.lvl],
    ...(stage?[['Evolution buffs',STAGES.slice(1,stage+1).map((n,i)=>n.trim()+' '+fxText(STAGE_FX[i+1])).join('; ')]]:[]),['Raised at','Lv '+m.lvl0],
    ['Fusions',(m.fused||0)+' of '+FUSE_MAX],['Power','ATK '+m.atk+', HP '+m.maxHp+(m.armed&&(g.atk||g.hp)?' (gear +'+g.atk+' ATK, +'+g.hp+' HP)':'')]];
  return '<div class="m-det">'+rows.map(r=>'<div><b>'+r[0]+'</b><span>'+r[1]+'</span></div>').join('')
    +(m.traits||[]).map(t=>'<div><b>'+TRAITS[t].name+'</b><span>'+traitTip(m,t)+'</span></div>').join('')+'</div>';
}
// The Reserve's controls on a minion: To reserve on an army minion, To army and Swap on a benched one (town only; a move loses nothing, so one press).
function moveActs(m,where,row){
  if(S.mode!=='town'||!reserveOpen()) return '';
  const b=(a,k,t,lab,dis,why)=>'<button class="btn small" data-a="'+a+'" data-k="'+k+'" aria-label="'+lab+': '+m.nick+'"'+(dis?' disabled title="'+why+'"':' title="'+lab+'"')+'>'+t+'</button>';
  if(where==='res') return b('toarmy',m.uid,row?'Army':'To army','To army',!armyRoom(),'Your army is full')
    +b('swapo',m.uid,row?'Swap':'Swap&hellip;','Swap with an army minion',!S.army.length,'Your army is empty');
  return b('tores',m.uid,row?'Bench':'To reserve','To reserve',!reserveRoom(),'The Reserve is full');
}
function swapPick(m){   // a benched minion's Swap: one press on an army minion trades their places
  return '<div class="swap-pick"><span class="u-tag">Swap '+m.nick+' with</span><div class="chips">'+S.army.map(a=>'<button class="btn small" data-a="swap" data-k="'+a.uid+'|'+m.uid+'" aria-label="Swap '+m.nick+' with '+a.nick+'">'+a.nick+' &middot; Lv '+a.lvl+'</button>').join('')
    +'<button class="btn small" data-a="swapo" data-k="'+m.uid+'">Cancel</button></div></div>';
}
function minionCard(m,canRelease,where){
  const nx=mneed(m.lvl), capped=m.lvl>=S.player.lvl+2;
  const conf=ui.confirm===m.uid;
  return '<div class="minion"><div><div class="u-head">'+ico(m.kind||m.name,m.rankI,m)+'<div class="u-id"><div class="u-top"><span class="rk r'+m.rankI+'">'+RANKS[m.rankI]+'</span><span class="u-tag">'+ROLES[m.role].label+(m.armed?' &middot; Armed':'')+(m.boss?' &middot; Boss':'')+(m.elite?' &middot; Elite':'')+' &middot; '+(rowOf(m)==='f'?'Front row':'Back row')+(m.wall?' &middot; On the wall':'')+'</span></div>'
   +(ui.rename===m.uid&&canRelease?'<div class="rn-row"><input id="rn" class="rn-in" maxlength="'+NICK_MAX+'" value="'+cleanNick(ui.rn==null?m.nick:ui.rn)+'" aria-label="New name for '+m.nick+'"><button class="btn small primary" data-a="rename" data-k="'+m.uid+'">Save</button><button class="btn small" data-a="renamex">Cancel</button></div>'
     :'<div class="u-name" style="'+(m.elite?'color:var(--gold)':'')+'">'+m.nick+' <span class="dim" style="font-size:15px">'+theName(mName(m))+'</span></div>')
   +traitChips(m)
   +'<div class="m-links"><button class="linkbtn" data-a="mdet" data-k="'+m.uid+'" aria-expanded="'+(ui.mdet===m.uid)+'">'+(ui.mdet===m.uid?'Hide details':'Details')+'</button>'+rowBtn(m,'linkbtn',f=>f?'Move to back':'Move to front')+(canRelease&&S.mode!=='battle'&&ui.rename!==m.uid?'<button class="linkbtn" data-a="renameo" data-k="'+m.uid+'">Rename</button>':'')+'</div>'
   +(ui.mdet===m.uid?minionDetail(m):'')+'</div></div>'
   +'<div class="bars"><div class="meter"><div class="m-top"><span>'+sgl('hp','HP')+'</span><span class="num">'+m.hp+'/'+m.maxHp+'</span></div><div class="bar"><i class="fill hp" style="width:'+pct(m.hp,m.maxHp)+'%"></i></div></div>'
   +'<div class="meter"><div class="m-top"><span>Lv '+m.lvl+' &middot; '+sgl('atk','ATK')+m.atk+'</span><span class="num">'+(capped?'cap':m.xp+'/'+nx)+'</span></div><div class="bar"><i class="fill xp" style="width:'+(capped?100:pct(m.xp,nx))+'%"></i></div></div></div></div>'
   +(canRelease?'<div class="m-acts">'+moveActs(m,where)+'<button class="btn small warn" data-a="release" data-k="'+m.uid+'">'+(conf?'Confirm release':'Release')+'</button></div>':'<span></span>')
   +(where==='res'&&ui.swap===m.uid&&S.mode==='town'?swapPick(m):'')
   +(m.armed?gearRowHTML(m,canRelease):'')+'</div>';
}
function partyStrip(){   // phones: the pinned action bar hides your side, so one thin HP tick per minion sits above the buttons (CSS shows it only at phone width)
  if(!S.army.length) return '';
  return '<div class="pstrip" role="group" aria-label="Army health">'+S.army.map(m=>{ const lab=m.nick+': '+(m.hp>0?m.hp+'/'+m.maxHp:'down'); return '<i class="pt'+(m.hp<=0?' down':m.hp<m.maxHp*.3?' low':'')+'" role="img" title="'+lab+'" aria-label="'+lab+'"><b style="width:'+pct(Math.max(0,m.hp),m.maxHp)+'%"></b></i>'; }).join('')+'</div>';
}
function minionRow(m,canRelease,where){   // the compact army list: one line per minion (two on a phone), same actions as the card; traits and the rest in the name's title
  const low=m.hp>0&&m.hp<m.maxHp*.3, tags=(m.traits||[]).map(t=>TRAITS[t].name), next=evoNext(m), cmd=isCommander(m);
  if(next!=null) tags.push('Evolves at Lv '+next); else if((m.stage||0)===STAGE_MAX) tags.push('Eternal');
  if(m.armed) tags.push('Gear-bearer'); if(m.wall) tags.push('On the wall'); tags.push(...bondTags(m));
  const tip=m.nick+', '+theName(mName(m))+' &middot; '+ROLES[m.role].label+(tags.length?' &middot; '+tags.join(', '):''), conf=ui.confirm===m.uid;
  return '<div class="mrow">'+ico(m.kind||m.name,m.rankI,m)+'<span class="rk r'+m.rankI+'">'+RANKS[m.rankI]+'</span>'
   +'<span class="mr-name" title="'+tip+'"><b style="'+(m.elite?'color:var(--gold)':'')+'">'+m.nick+'</b>'+(cmd?' <span class="mr-mk" title="Commander: can lead raids">Cmdr</span>':'')+(m.wall?' <span class="mr-mk" title="On the wall: back to the Reserve after the siege">Wall</span>':'')+' <span class="dim">'+theName(mName(m))+'</span></span>'
   +'<span class="u-tag mr-role">'+ROLES[m.role].label+(m.armed?' &middot; Armed':'')+'</span><span class="num mr-st">Lv '+m.lvl+' &middot; '+sgl('atk','ATK')+m.atk+'</span>'
   +'<span class="mr-hp'+(low?' low':'')+'"><span class="bar"><i class="fill hp" style="width:'+pct(m.hp,m.maxHp)+'%"></i></span><span class="num">'+m.hp+'/'+m.maxHp+'</span></span>'
   +'<span class="mr-acts">'+rowBtn(m,'btn small',f=>f?'Front':'Back')+'<button class="btn small" data-a="mdet" data-k="'+m.uid+'" aria-expanded="false" aria-label="Details: '+m.nick+'" title="Details">Info</button>'
   +(canRelease?(where==='res'?'':'<button class="btn small" data-a="renameo" data-k="'+m.uid+'" aria-label="Rename: '+m.nick+'" title="Rename">Name</button>')+moveActs(m,where,true)+'<button class="btn small warn" data-a="release" data-k="'+m.uid+'" aria-label="'+(conf?'Confirm release':'Release')+': '+m.nick+'" title="'+(conf?'Press again to release':'Release')+'">'+(conf?'Sure?':'Release')+'</button>':'')+'</span></div>';
}
function gearRowHTML(m,can){
  const g=gearBonus(m), pk=ui.pick&&ui.pick.uid===m.uid?ui.pick.slot:null;
  let h='<div class="gear-row"><div class="gear-h"><span class="u-tag">Gear-bearer</span><span class="u-sub">'+((g.atk||g.hp||g.mpow)?'Gear gives <span class="sv">'+sgl('atk','ATK')+'+'+g.atk+'</span> <span class="sv">'+sgl('hp','HP')+'+'+g.hp+'</span>'+(g.mpow?' '+statG('mpow',g.mpow):''):'Equip it from your bag. Gear returns to the bag if it is released or shattered.')+'</span></div><div class="gear-slots">';
  GEAR_SLOTS.forEach(sl=>{
    const it=m.eq&&m.eq[sl], d=it&&ITEM[it.id];
    h+=d?'<div class="gslot t'+d.tier+'">'+iico(d)+'<div class="gs-b"><b>'+d.name+'</b><small>'+SLOTS[sl]+'</small></div>'+(can?'<button class="btn small" data-a="take" data-k="'+m.uid+'|'+sl+'">Remove</button>':'')+'</div>'
      :'<button class="gslot empty'+(pk===sl?' on':'')+'" data-a="pick" data-k="'+m.uid+'|'+sl+'"'+(can?'':' disabled')+'>+ '+SLOTS[sl]+'</button>';
  });
  h+='</div>';
  if(pk){
    const list=S.inv.filter(it=>ITEM[it.id].slot===pk).sort((a,b)=>ITEM[b.id].tier-ITEM[a.id].tier);
    h+='<div class="items">'+(list.length?list.map(it=>itemCard(it,'<button class="btn small primary" data-a="give" data-k="'+m.uid+'|'+it.u+'">Give</button>')).join(''):'<p class="u-sub">No '+SLOTS[pk].toLowerCase()+' in your bag.</p>')+'</div>';
  }
  return h+'</div>';
}
function riftHTML(){
  if(!(S.ti&&S.ti.clr&&S.ti.clr[5])) return '';
  if(!riftOpen()) return '<section class="win rift-w locked"><h2 class="win-h">The Rift</h2><p class="lede">Something tears beneath the Throne of Ash. It opens at level '+RIFT_LV+'.</p></section>';
  const b=riftBest(), n=clamp(ui.rd||b+1,1,b+1);
  return '<section class="win rift-w" aria-labelledby="h-rift"><h2 class="win-h" id="h-rift">The Rift &middot; deepest '+b+'</h2>'
   +'<div class="rift-pick"><button class="btn small" data-a="rdep" data-k="-1"'+(n<=1?' disabled':'')+' aria-label="Shallower">&minus;</button><b class="num">Depth '+n+'</b><button class="btn small" data-a="rdep" data-k="1"'+(n>b?' disabled':'')+' aria-label="Deeper">+</button>'
   +'<span class="u-sub num">Foes Lv '+riftLvl(n)+'+ &middot; x'+riftMul(n).toFixed(1)+' strength'+(n>b?' &middot; new depth':'')+'</span></div>'
   +'<div class="btns"><button class="btn primary" data-a="rift" data-k="'+n+'"'+(S.watches<=0?' disabled':'')+'>Enter the Rift</button></div></section>';
}
function raidHTML(){
  if(S.mode!=='town') return ''; const pool=raidPool(), cmds=pool.filter(isCommander).filter(m=>!inOrder(m)), out=raidOrders(), logs=S.raidLog||[];
  if(!cmds.length&&!out.length&&!logs.length) return '';
  let h='<section class="win" aria-labelledby="h-raid"><h2 class="win-h" id="h-raid">War table'+(out.length?' &middot; '+out.length+' tonight':'')+'</h2>';
  out.forEach((x,i)=>{ const u=orderSquad(x); if(!u.length) return; h+='<div class="raid-row"><div><b>'+u[0].nick+'</b> leads '+u.length+' to the '+DUNGEONS[x.di].name+' tonight<div class="u-sub">'+Math.round(raidOdds(u,x.di)*100)+'% odds now &middot; marches at nightfall, back at dawn</div></div><button class="btn small warn" data-a="recall" data-k="'+i+'">Cancel</button></div>'; });
  const gates=raidGates();
  if(cmds.length&&gates.length){
    const c=cmds.find(m=>m.uid===ui.rc)||cmds[0], di=gates.includes(ui.rg)?ui.rg:gates[gates.length-1], max=squadMax(c)-1;
    const sel=(ui.rsq||[]).filter(u=>pool.some(m=>m.uid===u&&m!==c&&!inOrder(m))).slice(0,max), units=[c].concat(sel.map(u=>pool.find(m=>m.uid===u)));
    const rtag=m=>inReserve(m)?' &middot; Reserve':'';
    h+=(cmds.length>1?'<p class="group-h">Commander</p><div class="chips">'+cmds.map(m=>'<button class="btn small'+(m===c?' primary':'')+'" data-a="rcmd" data-k="'+m.uid+'" aria-pressed="'+(m===c)+'">'+m.nick+rtag(m)+'</button>').join('')+'</div>':'<p class="u-sub">Commander: <b>'+c.nick+'</b>, '+theName(mName(c))+rtag(c)+'</p>')
     +'<p class="group-h">Target</p><div class="chips">'+gates.map(i=>'<button class="btn small'+(i===di?' primary':'')+'" data-a="rgate" data-k="'+i+'" aria-pressed="'+(i===di)+'">'+DUNGEONS[i].name+'</button>').join('')+'</div>'
     +'<p class="group-h">Squad &middot; '+sel.length+'/'+max+'</p><div class="chips">'+pool.filter(m=>m!==c&&!inOrder(m)).map(m=>{ const on=sel.includes(m.uid); return '<button class="btn small'+(on?' primary':'')+'" data-a="rsq" data-k="'+m.uid+'" aria-pressed="'+on+'"'+(!on&&sel.length>=max?' disabled':'')+'>'+m.nick+' &middot; Lv '+m.lvl+rtag(m)+'</button>'; }).join('')+'</div>'
     +'<p class="u-sub war-note">A raid is an order for tonight: the squad fights the rest of today\'s runs with you and marches when the day ends. Odds are taken then, from whoever is left. Cancel any time before nightfall. Reserve minions can march too. Away overnight, each keeps its place in the army or the Reserve.</p>'+siegeWarNote()
     +'<div class="btns"><button class="btn primary" data-a="raid"'+(sel.length?'':' disabled title="Pick at least one follower"')+'>Order the raid for tonight &middot; '+Math.round(raidOdds(units,di)*100)+'% odds</button></div>';
  } else if(cmds.length) h+='<p class="lede">Clear a gate first.</p>';
  if(logs.length) h+='<p class="group-h">Last raids</p><ul class="raid-log">'+logs.slice(0,3).map(x=>'<li class="'+(x.won?'ok':'bad')+'">Day '+x.day+': '+x.nick+', '+DUNGEONS[x.di].name+' &middot; '+(x.won?'won':'lost'+(x.lost?' ('+x.lost+' fell)':''))+'</li>').join('')+'</ul>';
  return h+'</section>';
}
function armyHTML(view){   // view (the Army tab): filters and orders what is shown, and sets the army and the Reserve side by side
  const canRel=S.mode==='town'||S.mode==='raise', mode=S.mode==='battle'?'':VIEW.army==='compact'?(S.army.length>1?'compact':''):view&&VIEW.army==='grid'?'grid':'';   // portraits only on the Army tab; elsewhere the grid view shows cards
  const list=view?view(S.army):S.army, body=(S.army.length?(list.length?armyList(list,canRel,'',mode):'<p class="u-sub">No minion matches the filter.</p>'):'<p class="lede">No one answers you yet. Win a room, then raise what fell.</p>');
  return '<section class="win" aria-labelledby="h-army"><h2 class="win-h" id="h-army">Army '+armyUsed()+'/'+slots()+(raidN()?' &middot; '+raidN()+' raiding':'')+slotsHTML()+'</h2>'
   +(S.army.length>1&&S.mode!=='battle'?'<div class="bag-tools">Order: '
     +Object.keys(ARMY_SORTS).map(k=>'<button class="linkbtn" data-a="asort" data-k="'+k+'">'+ARMY_SORTS[k]+'</button>').join('')
     +'<span class="a-dens" role="group" aria-label="Army view">View: '
     +[['grid','Portraits'],['compact','Compact']].map(x=>'<button class="linkbtn'+(VIEW.army===x[0]?' on':'')+'" data-a="view" data-k="army|'+x[0]
       +'" aria-pressed="'+(VIEW.army===x[0])+'">'+x[1]+'</button>').join('')
     +'</span></div>':'')
   +(view?'<div class="army-cols"><div class="army-col">'+body+gateWaitHTML()+'</div>'+reserveHTML(view)+'</div>':body+gateWaitHTML()+reserveHTML())+'</section>';
}
function armyList(L,can,where,mode){   // mode 'grid': portraits, an opened one (Details, Rename, Swap) followed by its full card; 'compact': rows (an opened one is a card); else cards
  const open=m=>ui.mdet===m.uid||ui.rename===m.uid||ui.swap===m.uid;
  return '<div class="army'+(mode==='grid'?' pgrid':mode?' '+mode:'')+'">'+L.map(m=>mode==='grid'?mPortrait(m,open(m))+(open(m)?'<div class="mp-card">'+minionCard(m,can,where)+'</div>':'')
    :mode==='compact'&&!open(m)?minionRow(m,can,where):minionCard(m,can,where)).join('')+'</div>';
}
function mPortrait(m,on){   // one framed portrait: level, HP on the frame, role badge, evolution pips, trait and mark glyphs (their tooltips are the stat-glyph ones)
  const hp=Math.max(0,m.hp), st=m.stage||0, low=hp>0&&hp<m.maxHp*.3;
  const tg=(m.traits||[]).map(t=>[TRAITS[t].name,traitTip(m,t),t==='commander'?' cmdr':'']).concat([...new Set(m.marks||[])].map(k=>[MARK[k].name,markDesc(m,k),' mk']));
  const lab=m.nick+', '+theName(mName(m))+', Rank '+RANKS[m.rankI]+', '+ROLES[m.role].label+', Lv '+m.lvl+', HP '+hp+'/'+m.maxHp+(st?', '+STAGES[st].trim():'')+(m.armed?', Armed':'')+(tg.length?', '+tg.map(x=>x[0]).join(', '):'');
  let pips=''; for(let i=1;i<=STAGE_MAX;i++) pips+='<i'+(i<=st?' class="on"':'')+'></i>';
  return '<div class="mport'+(on?' on':'')+(hp<=0?' down':low?' low':'')+(m.elite?' elite':'')+'"><button class="mp-btn" data-a="mdet" data-k="'+m.uid+'" aria-expanded="'+on+'" aria-label="'+lab+'">'
   +ico(m.kind||m.name,m.rankI,m)+'<span class="mp-lv num" aria-hidden="true">'+m.lvl+'</span><span class="mp-st" aria-hidden="true">'+pips+'</span>'
   +'<span class="mp-hp" aria-hidden="true"><i style="width:'+pct(hp,m.maxHp)+'%"></i></span>'
   +(m.armed?'<span class="sg mp-gear" data-k="gear" aria-label="Gear-bearer" data-h="Carries a weapon, armor and a relic; open the card to change them">'+GEAR_SLOTS.map(sl=>{ const it=m.eq&&m.eq[sl]; return '<i class="'+(it&&ITEM[it.id]?'t'+ITEM[it.id].tier:'empty')+'"></i>'; }).join('')+'</span>':'')   /* weapon, armor, relic: filled in the item's rarity colour */
   +'<span class="mp-nm" aria-hidden="true">'+m.nick+'</span></button>'
   +(tg.length?'<span class="mp-tr" aria-hidden="true">'+tg.map(x=>'<span class="sg tg'+x[2]+'" data-k="trait" aria-label="'+x[0]+'" data-h="'+x[1]+'">'+x[0][0]+'</span>').join('')+'</span>':'')+'</div>';
}
function reserveHTML(view){   // the bench under the army, in town once the Town tab is open; same cards and rows, its own Order links
  if(S.mode!=='town'||!reserveOpen()) return ''; const R0=S.reserve||[], R=view?view(R0):R0, mode=VIEW.army==='compact'?(R0.length>1?'compact':''):view&&VIEW.army==='grid'?'grid':'';
  return '<div class="reserve" role="region" aria-labelledby="h-res"><h3 class="res-h" id="h-res">Reserve '+R0.length+'/'+reserveMax()+'</h3>'
   +(R0.length>1?'<div class="bag-tools">Order: '+Object.keys(ARMY_SORTS).map(k=>'<button class="linkbtn" data-a="rsort" data-k="'+k+'" aria-label="Order the Reserve: '+ARMY_SORTS[k]+'">'+ARMY_SORTS[k]+'</button>').join('')+'</div>':'')
   +(R.length?armyList(R,true,'res',mode)
     :R0.length?'<p class="u-sub">No minion matches the filter.</p>':brief('res','A bench for minions you keep but do not take along. They do not fight, take damage or earn XP, and keep their gear. Moving one in or out is free, in town.','u-sub'))+'</div>';
}
function gateWaitHTML(){   // raiders home when both the army and the Reserve were full: nobody is lost, they wait here
  const W=S.waiting||[]; if(S.mode!=='town'||!W.length) return '';
  return '<div class="note bad gate-wait"><i>Waiting</i><span>Back from a raid, with no room in your army or the Reserve. Make room, or let one go.</span></div><div class="army">'
   +W.map(m=>{ const conf=ui.confirm===m.uid; return '<div class="mrow wait-row">'+ico(m.kind||m.name,m.rankI,m)+'<span class="rk r'+m.rankI+'">'+RANKS[m.rankI]+'</span><span class="mr-name"><b>'+m.nick+'</b> <span class="dim">'+theName(mName(m))+'</span></span><span class="num mr-st">Lv '+m.lvl+' &middot; '+sgl('atk','ATK')+m.atk+'</span>'
     +'<span class="mr-acts"><button class="btn small" data-a="gatearmy" data-k="'+m.uid+'" aria-label="To army: '+m.nick+'"'+(armyRoom()?'':' disabled title="Your army is full"')+'>Army</button>'
     +'<button class="btn small" data-a="gateres" data-k="'+m.uid+'" aria-label="To reserve: '+m.nick+'"'+(reserveRoom()?'':' disabled title="The Reserve is full"')+'>Bench</button>'
     +'<button class="btn small warn" data-a="release" data-k="'+m.uid+'" aria-label="'+(conf?'Confirm release':'Release')+': '+m.nick+'">'+(conf?'Sure?':'Release')+'</button></span></div>'; }).join('')+'</div>';
}
// ----- the Army tab: a command view over the army and the Reserve (strength, roles, filters, quick gear, evolution, tonight's raids)
// Filters and the view order live in ui (not saved) and only change what is shown; the Order links still re-order the army itself.
const AV_SORTS={'':'Army order',power:'Power',level:'Level',rank:'Rank',stage:'Stage'}, QG_N=6;
function armyView(list){
  const r=ui.afr, k=ui.asv||''; let L=list.filter(m=>(!r||m.role===r)&&(!ui.agb||m.armed));
  if(AV_SORTS[k]&&k) L=L.slice().sort(k==='level'?(a,b)=>b.lvl-a.lvl||mPower(b)-mPower(a):k==='rank'?(a,b)=>b.rankI-a.rankI||b.lvl-a.lvl
    :k==='stage'?(a,b)=>(b.stage||0)-(a.stage||0)||b.lvl-a.lvl:(a,b)=>mPower(b)-mPower(a));
  return L;
}
const avBtn=(a,k,t,on)=>'<button class="btn small'+(on?' primary':'')+'" data-a="'+a+'" data-k="'+k+'" aria-pressed="'+on+'">'+t+'</button>';
function armyTabHTML(){ return armySumHTML()+markPickHTML()+bondsArmyHTML()+armyRaidHTML()+armyFilterHTML()+armyHTML(armyView)+quickGearHTML()+evoHTML(); }
function armySumHTML(){
  const A=S.army, R=S.reserve||[], sum=(L,f)=>L.reduce((a,m)=>a+f(m),0), n=r=>A.filter(m=>m.role===r).length;
  const st=(l,v,t)=>'<div class="as-st"'+(t?' title="'+t+'"':'')+'><span class="u-tag">'+l+'</span><b class="num">'+v+'</b></div>';
  return '<section class="win army-sum" aria-labelledby="h-asum"><h2 class="win-h" id="h-asum">Command</h2><div class="as-stats">'
   +st('Power',Math.round(sum(A,mPower)).toLocaleString(),'Attack x2 plus a quarter of health, added up over the army')
   +st('Damage per turn',sum(A.filter(m=>m.role!=='mender'),m=>m.atk).toLocaleString(),'The ATK of every minion that strikes, added up. Menders heal instead. Crits, cleaves and armor are not counted')
   +st('Health',sum(A,m=>Math.max(0,m.hp)).toLocaleString()+'<span class="as-max">/ '+sum(A,m=>m.maxHp).toLocaleString()+'</span>')
   +(reserveOpen()&&R.length?st('Reserve power',Math.round(sum(R,mPower)).toLocaleString()):'')+'</div>'
   +'<div class="as-roles" role="group" aria-label="Roles">'+Object.keys(ROLES).map(r=>{ const c=n(r), on=ui.afr===r;
     return '<button class="as-role'+(on?' on':'')+'" data-a="afr" data-k="'+r+'" aria-pressed="'+on+'" title="'+ROLES[r].text+'"><b>'+ROLES[r].label+'</b><span class="num">'+c+'</span><span class="as-bar"><i style="width:'+pct(c,A.length)+'%"></i></span></button>'; }).join('')+'</div></section>';
}
function armyRaidHTML(){   // tonight's standing raid orders, read-only here; the War table changes them
  if(S.mode!=='town') return ''; const out=raidOrders(), cmds=raidPool().some(isCommander);
  if(!out.length&&!cmds) return '';
  return '<section class="win" aria-labelledby="h-araid"><h2 class="win-h" id="h-araid">Raid squads'+(out.length?' &middot; '+out.length+' tonight':'')+'</h2>'
   +(out.length?out.map(x=>{ const u=orderSquad(x); if(!u.length) return ''; return '<div class="raid-row"><div><b>'+u[0].nick+'</b> leads '+u.length+' to the '+DUNGEONS[x.di].name+' tonight<div class="u-sub">'+u.map(m=>m.nick).join(', ')+' &middot; '+Math.round(raidOdds(u,x.di)*100)+'% odds now</div></div></div>'; }).join('')
     :'<p class="u-sub">No raid is ordered for tonight.</p>')
   +'<div class="btns"><button class="btn small" data-a="war">War table</button></div></section>';
}
function armyFilterHTML(){
  if(S.army.length+(S.reserve||[]).length<2) return ''; const F=ui.afr||'', K=ui.asv||'';
  return '<div class="chips army-filter" role="group" aria-label="Filter the army"><span class="u-tag">Role</span>'
   +[['','All']].concat(Object.keys(ROLES).map(r=>[r,ROLES[r].label])).map(x=>avBtn('afr',x[0],x[1],F===x[0])).join('')
   +avBtn('agb','1','Gear-bearers only',!!ui.agb)+'<span class="u-tag">Sort</span>'+Object.keys(AV_SORTS).map(k=>avBtn('asv',k,AV_SORTS[k],K===k)).join('')+'</div>';
}
function gearDelta(m,it){   // what giving this piece to a gear-bearer would change: the real stat sum, run on a copy
  const sl=ITEM[it.id].slot, c=Object.assign({},m,{eq:Object.assign({weapon:null,armor:null,relic:null},m.eq,{[sl]:it})}); syncMinion(c);
  return {atk:c.atk-m.atk,hp:c.maxHp-m.maxHp};
}
function quickGearHTML(){   // the bag's best pieces for you or one gear-bearer, with what each would change
  if(S.mode!=='town') return ''; const bearers=raidPool().filter(m=>m.armed), who=ui.aqt==null||ui.aqt==='p'?null:bearers.find(m=>m.uid===+ui.aqt)||null;
  let h='<section class="win" aria-labelledby="h-qg"><h2 class="win-h" id="h-qg">Quick equip</h2><div class="chips" role="group" aria-label="Equip whom">'
   +avBtn('aqt','p','You',!who)+bearers.map(m=>avBtn('aqt',m.uid,m.nick,who===m)).join('')+'</div>';
  if(!S.inv.length) return h+'<p class="u-sub">Your bag is empty.</p></section>';
  const row=(it,cmp,act)=>{ const d=ITEM[it.id]; return '<div class="qg-row t'+d.tier+'">'+iico(d)+'<div class="qg-b"><span class="i-name">'+d.name+'</span> <span class="i-tag">'+TIERS[d.tier]+' &middot; '+SLOTS[d.slot]+'</span>'+cmp+'</div>'+act+'</div>'; };
  const sgn=(v,l)=>'<span class="'+(v>0?'up':'down')+'"><span class="sv">'+sgl(l==='HP'?'hp':'atk',l)+(v>0?'+':'&minus;')+Math.abs(v)+'</span></span>';
  let rows;
  if(!who) rows=sortedBag().slice(0,QG_N).map(it=>row(it,cmpHTML(it),'<button class="btn small primary" data-a="equip" data-k="'+it.u+'">'+(S.equip[ITEM[it.id].slot]?'Swap':'Equip')+'</button>'));
  else rows=S.inv.map(it=>({it,d:gearDelta(who,it)})).sort((a,b)=>(b.d.atk*2+b.d.hp/4)-(a.d.atk*2+a.d.hp/4)).slice(0,QG_N).map(x=>{ const cur=who.eq&&who.eq[ITEM[x.it.id].slot], ch=[x.d.atk?sgn(x.d.atk,'ATK'):'',x.d.hp?sgn(x.d.hp,'HP'):''].join('');
    return row(x.it,'<div class="cmp">'+(cur?'vs '+ITEM[cur.id].name+': ':'Empty slot: ')+(ch||'<span>same stats</span>')+'</div>','<button class="btn small primary" data-a="give" data-k="'+who.uid+'|'+x.it.u+'">Give</button>'); });
  return h+'<div class="qg-list">'+rows.join('')+'</div><p class="u-sub">The best '+Math.min(QG_N,S.inv.length)+' of '+S.inv.length+' in your bag. The Gear tab holds them all.</p></section>';
}
function markPickHTML(){   // minions with a mark choice waiting: one press picks (out of battle only)
  const L=raidPool().filter(m=>markPend(m)); if(!L.length||S.mode==='battle') return '';
  return '<section class="win" aria-labelledby="h-mark"><h2 class="win-h" id="h-mark">Marks</h2><div class="evo-list">'+L.map(m=>{ const c=m.marks||[];
    return '<div class="mark-row"><span class="mr-name"><b>'+m.nick+'</b> <span class="dim">'+theName(mName(m))+'</span></span><div class="chips">'+markOpts(m).map(k=>{ const emp=c.includes(k), x=MARK[k].v*(emp?2:1);
      return '<button class="btn small" data-a="mark" data-k="'+m.uid+'|'+k+'" title="'+MARK[k].desc(x)+'">'+(emp?'Empower '+MARK[k].name:c.length?'Take '+MARK[k].name:MARK[k].name)+'</button>'; }).join('')+'</div></div>'; }).join('')
   +'</div>'+brief('marks','At Elder a minion takes one of two marks; at Eternal it empowers that mark (its numbers doubled) or takes the other.','u-sub')+'</section>';
}
function evoHTML(){   // how close each minion is to its next form, nearest first
  const L=raidPool().filter(m=>evoNext(m)!=null).sort((a,b)=>(evoNext(a)-a.lvl)-(evoNext(b)-b.lvl)); if(!L.length) return '';
  return '<section class="win" aria-labelledby="h-evo"><h2 class="win-h" id="h-evo">Evolution</h2><div class="evo-list">'+L.map(m=>{ const st=m.stage||0, from=m.lvl0+EVOLVE_AT[st], to=evoNext(m);
    return '<div class="evo-row"><span class="mr-name"><b>'+m.nick+'</b> <span class="dim">'+theName(mName(m))+'</span></span><span class="u-tag">'+STAGES[st+1].trim()+' at Lv '+to+'</span>'
     +'<span class="as-bar" role="img" aria-label="Lv '+m.lvl+' of '+to+'"><i style="width:'+pct(m.lvl-from,to-from)+'%"></i></span><span class="num">Lv '+m.lvl+'/'+to+'</span></div>'; }).join('')+'</div></section>';
}
function gateArmyHTML(){   // the Gates tab's one-line army status: size, health, the fallen and the hurt, tonight's raid, raiders waiting; the Army tab holds the rest
  const A=S.army, W=S.mode==='town'?(S.waiting||[]):[]; if(!A.length&&!W.length) return '';
  const hp=A.reduce((a,m)=>a+Math.max(0,m.hp),0), mx=A.reduce((a,m)=>a+m.maxHp,0), p=Math.round(pct(hp,mx)), down=A.filter(m=>m.hp<=0).length, hurt=A.filter(m=>m.hp>0&&m.hp<m.maxHp).length;
  const out=S.mode==='town'?raidOrders():[], o0=out.length===1?orderSquad(out[0]):null;
  return '<div class="gate-army" role="group" aria-label="Army status"><span class="ga-n"><b>Army</b> <span class="num">'+armyUsed()+'/'+slots()+'</span></span>'
   +(A.length?'<span class="ga-hp" title="'+hp+' / '+mx+' HP"><span class="u-tag">Health</span> <b class="num">'+p+'%</b><span class="as-bar ga-bar'+(p<35?' low':'')+'" role="img" aria-label="'+p+'% health"><i style="width:'+p+'%"></i></span><span class="num dim">'+hp+'/'+mx+'</span></span>':'')
   +(down?'<span class="ga-down">'+down+' down</span>':'')+(hurt?'<span class="ga-hurt">'+hurt+' wounded</span>':'')+(A.length&&!down&&!hurt?'<span class="ga-ok">All whole</span>':'')
   +(out.length?'<span class="ga-raid">'+(o0&&o0.length?'Raid tonight: '+o0[0].nick+' to the '+DUNGEONS[out[0].di].name:out.length+' raids tonight')+'</span>':'')
   +(W.length?'<span class="ga-wait">'+W.length+(W.length>1?' raiders':' raider')+' waiting at the gate</span>':'')
   +'<button class="linkbtn ga-go" data-a="tab" data-k="army">Army tab</button></div>';
}
function armyBriefHTML(){   // the War table, the Rift and the Trial: who would go, one line each; the full army is on the Army tab
  if(!S.army.length) return '';
  return '<section class="win" aria-labelledby="h-army"><h2 class="win-h" id="h-army">Army '+armyUsed()+'/'+slots()+(raidN()?' &middot; '+raidN()+' raiding':'')+slotsHTML()+'</h2>'
   +'<div class="army compact">'+S.army.map(m=>ui.mdet===m.uid?minionCard(m,false):minionRow(m,false)).join('')+'</div>'
   +'<div class="btns"><button class="btn small" data-a="tab" data-k="army">Open the Army tab</button></div></section>';
}
function condHTML(c){   // how the body died: its condition, the raise chance it adds or takes, and the trait it rises with
  const K=c.cd&&CORPSE_CONDS[c.cd]; if(!K) return '';
  return ' &middot; <span class="cond '+(K.raise>0?'up':'down')+'" title="'+K.when+' '+(K.raise>0?'+':'')+K.raise+'% raise chance">'+K.name+' '+(K.raise>0?'+':'')+K.raise+'%</span> <span class="trait" title="'+TRAITS[K.trait].desc+'">Rises '+TRAITS[K.trait].name+'</span>';
}
function raiseHTML(){
  const r=S.run, P=S.player, D=DUNGEONS[r.di];
  const full=armyUsed()>=slots(), bench=full&&reserveRoom();   // a full army may raise straight into the Reserve
  const corpses=r.corpses.map(c=>{
    const ch=raiseChance(c), cost=raiseCost(c);
    let right;
    if(c.tried) right=c.result==='raised'?'<span class="ok num">'+(c.res?'Raised to the Reserve as ':'Raised as ')+c.minion+'</span>':c.result==='exploded'?'<span class="dim num">Burst apart</span>':c.result==='taken'?'<span class="dim num rival-took">Taken by '+c.taken+'</span>':'<span class="bad num">Crumbled</span>';
    else if(bench) right='<div class="btns" style="margin:0"><button class="btn primary small res-raise" data-a="raiseres" data-k="'+c.id+'"'+(P.mana<cost?' disabled':'')+' title="Your army is full: the minion goes to the Reserve">Raise to the Reserve &middot; '+ch+'% &middot; '+cost+' mana</button>'
      +(S.salts>0?'<button class="btn small" data-a="raiseressalt" data-k="'+c.id+'"'+(P.mana<cost?' disabled':'')+' title="Uses one Grave Salts ('+S.salts+' left)">With salts &middot; '+saltChance(c)+'%</button>':'')+'</div>';
    else right='<div class="btns" style="margin:0"><button class="btn primary small" data-a="raise" data-k="'+c.id+'"'+(P.mana<cost||full?' disabled':'')+(firstRaise()?' title="Your first raise always answers"':'')+'>Raise &middot; '+ch+'% &middot; '+cost+' mana</button>'
      +(S.salts>0?'<button class="btn small" data-a="raisesalt" data-k="'+c.id+'"'+(P.mana<cost||full?' disabled':'')+' title="Uses one Grave Salts ('+S.salts+' left)">With salts &middot; '+saltChance(c)+'%</button>':'')+'</div>';
    return '<div class="corpse'+(c.tried?' done '+c.result:'')+'" data-u="'+c.id+'"><div><div class="u-head">'+ico(c.base,c.rankI,c)+'<div class="u-id"><div class="u-top"><span class="rk r'+c.rankI+'">'+RANKS[c.rankI]+'</span><span class="u-tag">'+ROLES[c.role].label+(c.armed?' &middot; Armed':'')+(c.boss?' &middot; Boss':'')+(c.elite?' &middot; Elite':'')+'</span></div>'
     +'<div class="u-name" style="'+(c.elite?'color:var(--gold)':'')+'">'+c.name+'</div><div class="u-sub num">Lv '+c.lvl+masteryTag(c.base)
       +(c.aff?' &middot; <span class="aff" title="A raised elite keeps one of these as a trait">'
         +c.aff.map(a=>AFFIX[a].name===TRAITS[AFFIX[a].trait].name?'keeps '+AFFIX[a].name:AFFIX[a].name+' &rarr; '+TRAITS[AFFIX[a].trait].name).join(', ')+'</span>':'')
       +(c.free?' &middot; <span class="free-t">Straggler: free, +'+STRAGGLER_BONUS+'%</span>':'')+condHTML(c)+'</div></div></div></div>'+right+'</div>';
  }).join('');
  const done=r.cleared, q=r.quiet&&DOORS[r.quiet], st=stageOn()&&r.corpses.length>0;   /* st: the bodies lie on the battle stage (fx.js); the cards fold into a compact strip */
  return '<section class="win" aria-labelledby="h-raise"><h2 class="win-h" id="h-raise">'+(r.trial?'Trial &middot; '+D.name+' &middot; '+(done?'Complete':'Room '+(r.room+1)+'/'+r.rooms+' cleared'):r.siege?'Siege &middot; The necropolis holds':r.tw?'Hell Tower &middot; Floor '+r.tw+(done?' &middot; Conquered':' cleared'):(r.rift?'The Rift '+r.rift+' &middot; ':'')+D.name+' &middot; '+(done?'Cleared':'Room '+(r.room+1)+(q?'':' cleared')))+'</h2>'
   +'<h3 class="win-title">'+(r.trial?(done?'The Trial is over.':'No bodies rise in a Trial. On to the next room.'):r.siege?'The living break and run. Their dead are yours.':r.tw?(done?'Abaddon is dead. The Tower is yours.':'The floor is still.'):(done?'The gate falls silent.':q?q.name:'The room is still.'))+'</h3>'
   +(q?'<p class="lede">No fight here &middot; Mana '+P.mana+'/'+pMana()+'</p>':'<p class="lede">+'+r.lastXp+' XP'+(r.ups?' &middot; level up':'')+' &middot; Mana '+P.mana+'/'+pMana()+' &middot; <span title="Whatever you do not raise is gone when you move on">unraised bodies are lost</span></p>')
   +(r.events.length?'<div class="notes">'+r.events.map(e=>'<div class="note '+e.c+'"><i>Log</i><span>'+e.m+'</span></div>').join('')+'</div>':'')
   +(st?'<div class="stage raise-st" aria-hidden="true" style="height:'+(FXS.h||300)+'px"></div>':'')
   +(full&&r.corpses.some(c=>!c.tried)?(w=>'<div class="note bad"><i>Full</i><span>'+(bench?'Army full &middot; Reserve: '+(reserveMax()-S.reserve.length)+' free':'Army full &middot; release someone')+'</span>'+(w?'<button class="btn small warn" data-a="release" data-k="'+w.uid+'">'+(ui.confirm===w.uid?'Confirm: release '+w.nick:'Release your weakest, '+w.nick+' (Lv '+w.lvl+' '+ROLES[w.role].label.toLowerCase()+')')+'</button>':'')+'</div>')(weakest()):'')
   +(!full&&r.corpses.filter(c=>!c.tried).length>=2?'<div class="btns"><button class="btn small primary" data-a="raisebest" title="Tries every body, most valuable first; uses salts on bosses and elites" aria-keyshortcuts="Space">Raise the best<kbd>Space</kbd></button></div>':'')
   +(r.trial?trialResultHTML(r):'')+eventHTML()+spoilsHTML()+((q||r.trial)&&!r.corpses.length?'':'<p class="group-h">The fallen</p><div class="corpses'+(st?' staged':'')+'">'+(corpses||'<p class="lede">Nothing left to raise.</p>')+'</div>')
   +(r.doors&&!done?doorsHTML():'<div class="btns">'+(done?'<button class="btn primary" data-a="town">'+(r.siege?'Back to the necropolis &middot; dawn':'Return to the gate')+'</button>':'<button class="btn primary" data-a="descend">'+(r.tw?'Ascend to floor '+(r.tw+1)+' (heal ':'Descend (heal ')+Math.round(DIFF.heal*100)+'%, mana +'+Math.round(DIFF.mana*100)+'%)</button><button class="btn" data-a="town">'+(r.tw?'Descend with spoils':r.trial?'Leave the Trial':'Leave with spoils')+'</button>')+'</div>')+'</section>'
   +armyHTML();
}
function doorLore(k){   // what the Ledger reads behind a door (doorSight, doorBoss in game-gate-rules.js); on phones the details move to the tooltips
  const r=S.run, sight=doorSight(r.di), L=r.pre&&r.pre[k];
  if(k==='boss'){ const b=doorBoss(r.di); return b?'<span class="dl"><span class="dlb">'+b.name+'</span><span>'+b.tip+'</span></span>':''; }
  if(!sight||!L) return '';
  return '<span class="dl"><span class="dlh">Behind it</span>'+L.map(e=>{ const af=(e.aff||[]).map(a=>AFFIX[a].name), row=rowOf(e)==='f'?'Front':'Back';
    const tip=(e.elite?['Elite']:[]).concat(af).concat(sight>1?[row+' row','Lv '+e.lvl]:[]).join(' · ');
    return '<span class="df'+(e.elite?' el':'')+'"'+(tip?' title="'+tip+'"':'')+'>'+e.name+(af.length?'<small>'+af.join(', ')+'</small>':'')+(sight>1?'<small>'+row+'</small><small>Lv '+e.lvl+'</small>':'')+'</span>'; }).join('')+'</span>';
}
function doorsHTML(){
  const r=S.run;
  return '<p class="group-h">Next room &middot; heal '+Math.round(DIFF.heal*100)+'%, mana +'+Math.round(DIFF.mana*100)+'% &middot; keys 1&ndash;'+r.doors.length+'</p><div class="doors">'
   +r.doors.map((k,i)=>'<button class="door d-'+k+'" data-a="door" data-k="'+k+'" aria-keyshortcuts="'+(i+1)+'"><b>'+DOORS[k].name+'<kbd>'+(i+1)+'</kbd></b><span'+(DOORS[k].s?' title="'+DOORS[k].desc+'"':'')+'>'+(DOORS[k].s||DOORS[k].desc)+'</span>'+doorLore(k)+'</button>').join('')+'</div>'
   +'<div class="btns"><button class="btn" data-a="town">Leave with spoils</button></div>';
}
function eventHTML(){
  const r=S.run, ev=r.event; if(!ev||ev.done) return '';
  const E=EVENTS[ev.id], P=S.player;
  const label=(k,t)=>ev.id==='pedlar'&&k==='buy'?'Buy '+withArticle(POTIONS[ev.pot].name)+' &middot; '+gold(ev.price):t;
  const off=k=>(ev.id==='pedlar'&&k==='buy'&&(S.gold<ev.price||S.belt[ev.pot]>=BELT_MAX))||!!(E.off&&E.off(k));
  return '<div class="event-box"><h4>'+E.name+'</h4><p>'+E.text+'</p>'+(ev.id==='shrine'&&P.hp<=1?'<p class="q-note">You have no blood to spare.</p>':'')
   +'<div class="btns" style="margin:0">'+E.opts.map((o,i)=>'<button class="btn small'+(i===0?' primary':'')+'" data-a="event" data-k="'+o[0]+'"'+(off(o[0])||(ev.id==='shrine'&&o[0]==='bleed'&&P.hp<=1)?' disabled':'')+'>'+label(o[0],o[1])+'</button>').join('')+'</div></div>';
}
function spoilsHTML(){
  const r=S.run, sp=(r.spoils||[]).map(u=>S.inv.find(x=>x.u===u)).filter(Boolean);
  let h='', n='';   // n: the spoils notes, kept in one box like the room log above them
  if(sp.some(it=>ITEM[it.id].uq)) n+='<div class="note ok"><i>Unique</i><span>Very few ever hold one.</span></div>';
  if((r.lostLoot||[]).length) n+='<div class="note bad"><i>Bag full</i><span>Left behind: '+r.lostLoot.join(', ')+'.</span></div>';
  if(n) h+='<div class="notes">'+n+'</div>';
  const tro=Object.keys(r.lastTroph||{});
  if(r.lastGold||tro.length||sp.length) h+='<div class="loot-fly" aria-hidden="true" data-k="'+[S.day,r.di,r.room,r.tw||0,r.rift||0,r.lastGold||0,(r.spoils||[]).join('.')].join(':')+'">'   // the same loot drawn: fx.js flies it into the bag once
    +(r.lastGold?'<span class="gold-n">'+COIN+'<b class="gold-up" data-n="'+r.lastGold+'">'+r.lastGold.toLocaleString()+'</b></span>':'')
    +tro.map(k=>'<span class="lf-t">'+ico(TROPHY[k].ico,TROPHY[k].rankI,{boss:k.startsWith('b:')})+'</span>').join('')
    +sp.map(it=>'<span class="lf-i t'+ITEM[it.id].tier+'">'+iico(ITEM[it.id])+'</span>').join('')
    +(sp.length?'<span class="lf-bag"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M9 3h6l-1.6 3.2C17.5 8 20 12 20 16c0 3.3-3.6 5-8 5s-8-1.7-8-5c0-4 2.5-8 6.6-9.8z" fill="#3a2c1e" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M9.6 6.4h4.8" stroke="currentColor" stroke-width="1.4"/></svg><b>'+sp.length+'</b></span>':'')+'</div>';
  if(r.lastGold||tro.length) h+='<p class="group-h">Gold and trophies</p><div class="loot-line">'+gold(r.lastGold||0)
    +tro.map(k=>'<span class="tro-chip">'+TROPHY[k].name+(r.lastTroph[k]>1?' &times;'+r.lastTroph[k]:'')+'</span>').join('')+'</div>';
  if(sp.length) h+='<p class="group-h">Spoils from this room</p><div class="items">'+sp.map(it=>itemCard(it,'<button class="btn small primary" data-a="equip" data-k="'+it.u+'">'+(S.equip[ITEM[it.id].slot]?'Swap in':'Equip')+'</button>',true)).join('')+'</div>';
  return h;
}
const FELL_DOT={bleed:'bleeding',burn:'burns',poison:'poison',blight:'blight'};
const FELL_C={taunt:'Taunt was not used.',ward:'Bone Ward was down.',chill:'Grave Chill was ready but not used.',focus:'Focus was not used to break it.',guard:'Guard was not used.'};
function felledHTML(b){   // the defeat recap: the blow that felled you and the answers you had for it (game-runs.js blowNote)
  if(!b||!b.k) return ''; const A=b.mv&&BOSS_ABIL[b.mv];
  const l1=b.k==='dot'?'Felled by '+(FELL_DOT[b.dot]||'a wound')+'.':'Felled by '+b.n+'\'s '+(A?A.name+(b.w?', telegraphed '+b.w+' turn'+(b.w>1?'s':'')+' ahead':''):b.k==='crit'?'critical hit':b.k==='haste'?'hasted strike':'blow')+'.';
  const c=(b.c||[]).filter(k=>FELL_C[k]);
  return '<div class="felled"><p class="felled-1">'+l1+'</p>'+(c.length?'<p class="felled-2">'+c.map(k=>FELL_C[k]).join(' ')+'</p>':'')+'</div>';
}
function defeatHTML(){
  const r=S.run;
  if(r.siege) return '<section class="win siege-lost" aria-labelledby="h-def"><h2 class="win-h" id="h-def">Siege &middot; The walls fell</h2><h3 class="win-title">'+(r.fled?'You left the walls to the living.':'The living broke through on wave '+(r.room+1)+'.')+'</h3>'
   +'<p class="lede">'+(r.siegeLoss||'')+'</p><div class="facts" title="You lose no XP, and none of your dead were lost: they dragged themselves back into the crypts before dawn."><span class="ok">No XP lost</span><span class="ok">No minions lost</span></div>'
   +'<div class="btns"><button class="btn primary" data-a="town">Wait for dawn</button></div>'+logHTML()+'</section>';
  return '<section class="win" aria-labelledby="h-def"><h2 class="win-h" id="h-def">Fallen</h2><h3 class="win-title">'+(r.tw?'You fell on floor '+r.tw+' of the Hell Tower.':'You went down in room '+(r.room+1)+'.')+'</h3>'
   +felledHTML(r.felled)+'<div class="facts" title="Loot from rooms already cleared is kept. This room\'s spoils are lost and you lose some XP. Your army carried you out and bound itself back together."><span class="ok">Earlier loot kept</span><span class="bad">Room spoils lost</span><span class="bad">&minus;XP</span><span class="ok">Army intact</span></div>'
   +'<div class="btns"><button class="btn primary" data-a="town">Return to the gate</button>'+(canRetry()?'<button class="btn" data-a="retry" title="Retry starts this room over as it began: the same foes at full strength, you and your army as you entered. No watch is spent; the XP loss stands.">Retry the room<kbd>R</kbd></button>':'')+'</div>'
   +(canRetry()?'<p class="u-sub">Same foes &middot; no watch spent</p>':r.trial?'<p class="u-sub">A Trial room cannot be retried: its score counts every attempt.</p>':'')+logHTML()+'</section>';
}
function keysHTML(){   // every shortcut in one list; ? opens it, Esc closes it
  const row=(k,t)=>'<div class="kr"><kbd>'+k+'</kbd><span>'+t+'</span></div>';
  return '<div class="keys-ov" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"><div class="win keys-win"><div class="kh"><h2>Keyboard shortcuts</h2><button class="btn small" data-a="keys">Close<kbd>Esc</kbd></button></div>'
   +'<h3>In town</h3>'+row('1-9','Switch tabs')+row('Esc','Back to the gate list, cancel a rename or a confirm')
   +'<h3>Between rooms</h3>'+row('1-4','Pick a door')+row('Space','Raise the best')
   +'<h3>In battle</h3>'+row('1','Strike')+row('2','Soul Siphon')+row('3','Bone Ward')+row('4-9','Your skills')+row('R','Ultimate')+row('[ ]','Change target')
   +Object.keys(CMDS).filter(k=>ORDER_KEY[k]).map(k=>row(ORDER_KEY[k],CMDS[k].name)).join('')+row('G','Guard (uses your turn)')
   +Object.keys(POTIONS).map(k=>row(POTIONS[k].key,POTIONS[k].name)).join('')
   +'<h3>After a fall</h3>'+row('R','Retry the room')+row('?','Show or hide this list')+'</div></div>';
}
// ----- sieges: the War table note, the Town tab's banner and repair row, the intro screen
function siegeWarNote(){ return siegeTonight()?'<p class="u-sub siege-note bad">The living march on the necropolis tonight. Raids march first: whoever you send will not be on the walls.</p>':''; }
function siegeTownHTML(){   // the Town tab: a warning banner (only once warned: the exact day stays hidden before), the damaged building
  if(!siegeOpen()) return ''; const g=sg(); let h='';
  if(siegeWarned()){ const now=siegeTonight();
    h+='<div class="siege-warn" role="status"><b>'+(now?'The living march on the necropolis tonight, when the day ends.':'The living march on the necropolis tomorrow at dusk.')+'</b> '
     +'<button class="linkbtn" data-a="cxgo" data-k="sieges">Read about sieges</button></div>'
     +'<p class="u-sub siege-line">Siege: '+(now?'tonight':'in 1 day')+'</p>'; }
  if(g.dmg){ const c=repairCost(), conf=ui.confirm==='repair';
    h+='<div class="tt-row siege-dmg bad"><div><h4>'+BUILD[g.dmg].name+' &middot; damaged</h4><div class="u-sub" title="Burned in the last siege. Its effects, siege perk included, are lost until it is repaired. Repairs cost gold only.">No effect until repaired</div></div>'
     +'<button class="btn small '+(conf?'warn':'primary')+'" data-a="repair"'+(S.gold<c?' disabled':'')+'>'+(conf?'Confirm: repair for '+c+' gold':'Repair &middot; '+gold(c))+'</button></div>'; }
  return h;
}
function siegeHTML(){   // nightfall on a siege day: the intro screen
  const di=siegeGate(), P=S.player, pk=siegePerks(), away=raidN(), g=sg();
  return '<section class="win siege-intro" aria-labelledby="h-siege"><h2 class="win-h" id="h-siege">Siege &middot; Night of day '+S.day+'</h2><h3 class="win-title">The living are at the walls</h3>'
   +'<p class="lede">Torches on the hill road. The Inquisition leads the town\'s militia.</p>'
   +'<div class="facts" title="Between waves you heal as between rooms; nothing can be raised until the last wave falls. On home ground your downed minions never shatter. Fleeing counts as a defeat."><span>'+SIEGE_WAVES+' waves</span><span>Lv '+siegeLvl()+'</span><span>Like the '+DUNGEONS[di].name+'</span><span>No raising until the end</span><span class="ok">Minions never shatter</span><span class="bad">Fleeing = defeat</span></div>'
   +'<p class="group-h">Your buildings</p>'+(pk.length?'<ul class="siege-perks">'+pk.map(x=>'<li><b>'+x.name+'</b>: '+x.t+'</li>').join('')+'</ul>':'<p class="q-note">No building lends you its strength tonight.</p>')
   +(g.dmg?'<p class="q-note bad">The '+BUILD[g.dmg].name+' still lies in ruins and gives nothing.</p>':'')
   +(away?'<p class="q-note">'+away+' of your dead marched on a raid tonight and are not on the walls.</p>':'')
   +'<div class="facts" title="Hold, and the town pays: gold, bone dust and a piece of gear. Fall, and they burn one of your buildings until you repair it."><span class="ok">Hold: gold, dust, gear</span><span class="bad">Fall: a building burns</span></div>'+siegeChoiceHTML()
   +'<div class="btns"><button class="btn primary" data-a="siegego">Man the walls</button></div></section>'+armyHTML();
}
function siegeChoiceHTML(){   // the intro screen's two choices: the guarded building and the wall
  const g=sg(), gb=g.dmg?[]:guardable(), pool=wallPool(), w=g.wall||[], chip=(a,k,t,on,dis)=>'<button class="btn small'+(on?' primary':'')+'" data-a="'+a+'" data-k="'+k+'" aria-pressed="'+on+'"'+(dis?' disabled':'')+'>'+t+'</button>';
  return (gb.length?'<p class="group-h">Guard a building</p><p class="u-sub" title="If the walls fall, the living cannot burn the building you guard; they fire another, or take gold if none is left.">Spared if the walls fall</p><div class="chips">'+gb.map(k=>chip('sguard',k,BUILD[k].name+' &middot; Lv '+blRaw(k),g.guard===k)).join('')+'</div>':'')
   +(pool.length?'<p class="group-h">On the wall &middot; '+w.length+'/'+SIEGE_WALL+'</p><p class="u-sub" title="Up to '+SIEGE_WALL+' minions from the Reserve fight this siege in your front row, then go back to the Reserve.">Reserve minions in your front row, tonight only</p><div class="chips">'+pool.map(m=>chip('swall',m.uid,m.nick+' &middot; Lv '+m.lvl,w.includes(m.uid),!w.includes(m.uid)&&w.length>=SIEGE_WALL)).join('')+'</div>':'');
}
