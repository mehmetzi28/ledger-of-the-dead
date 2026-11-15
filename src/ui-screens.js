const LEDGER=[['lore','Lore'],['codex','Codex'],['bes','Bestiary'],['hist','History'],['rec','Records'],['help','How to play']];   // the Ledger tab's pages
function spendStrip(){   // on narrow screens the stats sit far below: offer the + buttons up here while points are waiting
  const P=S.player; if(P.pts<=0&&!(P.sp>0)) return '';
  return '<div class="spend-strip">'+(P.pts>0?'<span>'+P.pts+' point'+(P.pts>1?'s':'')+' to spend:</span>'+[['strength','Strength'],['constitution','Constitution'],['intelligence','Intelligence'],['will','Will']].map(([k,n])=>'<button class="btn small" data-a="alloc" data-k="'+k+'" aria-label="Add a point to '+n+'">+ '+n+'</button>').join(''):'')
   +(P.sp>0?'<button class="btn small primary" data-a="tab" data-k="skills">'+P.sp+' skill point'+(P.sp>1?'s':'')+': open Skills</button>':'')+'</div>';
}
function townHTML(){
  if(ui.tab==='town'&&!townOpen()) ui.tab='gates';
  const twLock=S.player.lvl<TW.unlock; if(ui.tab==='tower'&&twLock) ui.tab='gates';   // the Hell Tower tab shows from the start but opens at TW.unlock
  let h=notesHTML()+spendStrip();
  h+='<div class="tabs" role="tablist">'
    +[['gates','Gates'],['tower','Hell Tower'],['gear','Gear &middot; '+S.inv.length],['market','Market']].concat(townOpen()?[['town','Town']]:[])
    .concat([['skills','Skills'+(S.player.sp?' &middot; '+S.player.sp:'')],['titles','Titles &middot; '+Object.keys((S.ti&&S.ti.got)||{}).length],['ledger','Ledger']])
    .map((t,i)=>(t[0]==='tower'&&twLock)
      ?'<button class="tab tw-lock" role="tab" disabled aria-disabled="true" aria-label="Hell Tower, locked until level '+TW.unlock+'" title="The Hell Tower opens at level '
        +TW.unlock+'"><span aria-hidden="true">&#128274; </span>Hell Tower &middot; Lv '+TW.unlock+'</button>'
      :'<button class="tab'+(t[0]==='tower'?' hell':'')+'" role="tab" data-a="tab" data-k="'+t[0]+'" aria-keyshortcuts="'+(i+1)+'" aria-selected="'
        +(t[0]==='ledger'?LEDGER.some(x=>x[0]===ui.tab):(ui.tab||'gates')===t[0])+'">'+t[1]+(i<9?'<kbd aria-hidden="true">'+(i+1)+'</kbd>':'')+'</button>').join('')
   +'<button class="tab keyhint" data-a="keys" aria-keyshortcuts="?" aria-label="Keyboard shortcuts" title="Keyboard shortcuts">?</button></div>';
  if(LEDGER.some(x=>x[0]===ui.tab)){ ui.ledger=ui.tab; h+='<div class="chips sub-nav" role="tablist">'+LEDGER.map(x=>'<button class="btn small'+(x[0]===ui.tab?' primary':'')+'" role="tab" data-a="tab" data-k="'+x[0]+'" aria-selected="'+(x[0]===ui.tab)+'">'+x[1]+'</button>').join('')+'</div>'; }
  if(ui.tab==='gear') return h+bagHTML()+armyHTML();
  if(ui.tab==='bes') return h+bestiaryHTML();
  if(ui.tab==='skills') return h+skillsHTML();
  if(ui.tab==='market') return h+marketHTML();
  if(ui.tab==='town') return h+buildHTML()+armyHTML();
  if(ui.tab==='tower') return h+towerHTML()+armyHTML();
  if(ui.tab==='titles') return h+titlesHTML();
  if(ui.tab==='settings') return h+saveTabHTML();
  if(ui.tab==='help') return h+helpHTML();
  if(ui.tab==='hist') return h+histHTML();
  if(ui.tab==='rec') return h+recordsHTML();
  if(ui.tab==='lore') return h+loreHTML();
  if(ui.tab==='codex') return h+codexHTML();
  const subs=gateSubs(), sub=subs.some(x=>x[0]===ui.gsub)?ui.gsub:'open';   // the Gates tab's own sub-tabs: the gates, the War table, the Rift
  if(subs.length>1) h+='<div class="chips sub-nav" role="tablist">'+subs.map(x=>'<button class="btn small'+(x[0]===sub?' primary':'')+'" role="tab" data-a="gsub" data-k="'+x[0]+'" aria-selected="'+(x[0]===sub)+'">'+x[1]+'</button>').join('')+'</div>';
  if(sub==='war') return h+raidHTML()+armyHTML();
  if(sub==='rift') return h+riftHTML()+armyHTML();
  h+='<section class="win" aria-labelledby="h-gates"><h2 class="win-h" id="h-gates">Open gates</h2><h3 class="win-title">Choose where to hunt</h3>'
   +((n=>n<FIRST_STEPS.length&&!(S.tips&&S.tips.off)?'<p class="q-note guide-link"><button class="linkbtn" data-a="tab" data-k="help">How to play &middot; first steps '+n+'/'+FIRST_STEPS.length+'</button></p>':'')(stepsDone()))   /* for a new player; gone once every step is done or tips are switched off */
   +(omen()?'<div class="omen-line"><b>Omen today: '+OMENS[omen()].name+'.</b> '+OMENS[omen()].desc+' It touches every gate and the Tower until dawn.</div>':'')
   +'<div class="gates">'+DUNGEONS.map((d,i)=>gateHTML(i)).join('')+'</div>'
   +'<div class="btns"><button class="btn small" data-a="rest">Rest until dawn</button></div></section>';
  return h+armyHTML();
}
function gateSubs(){
  const out=S.raids||[], war=S.army.some(isCommander)||out.length||(S.raidLog||[]).length;
  return [['open','Gates']].concat(war?[['war','War table'+(out.length?' &middot; '+out.length+' out':'')]]:[]).concat(S.ti&&S.ti.clr&&S.ti.clr[5]?[['rift','The Rift'+(riftOpen()?' &middot; next '+(riftBest()+1):' &middot; Lv '+RIFT_LV)]]:[]);
}
function nick(u){ return u.id==='p'?'You':u.nick||u.name; }
function unitCard(u,side,mini){
  const r=S.run, isP=u.id==='p', max=isP?pMax():u.maxHp, f=r.fx[fxKey(u)]||{d:0,h:0}, dead=u.hp<=0;
  const sel=side==='foe'&&r.target===u.id&&!dead;
  const tag=isP?'Necromancer':ROLES[u.role].label+(isArmed(u.base||u.name)?' &middot; Armed':'')+(u.boss?' &middot; Boss':'')
    +(u.elite?' &middot; Elite':'')+(u.abil&&!isP?' &middot; <span title="'+BOSS_ABIL[u.abil].desc+'">'+BOSS_ABIL[u.abil].name+'</span>':'')
    +(u.phase2&&!isP?' &middot; <span class="phase-t">Second phase</span>':'')
    +(u.aff&&!isP?u.aff.map(a=>' &middot; <span class="aff" title="'+AFFIX[a].desc+'">'+AFFIX[a].name+'</span>').join(''):'');
  const rk=isP?'':'<span class="rk r'+u.rankI+'">'+RANKS[u.rankI]+'</span>';
  const fx=f.d?'<span class="fx neg">-'+f.d+'</span>':f.h?'<span class="fx pos">+'+f.h+'</span>':'';
  const dots=u.dots&&!dead?Object.keys(u.dots).map(k=>' &middot; <span class="dot-t '+k+'" title="'+u.dots[k].d+' damage a turn for '+u.dots[k].t+' more turn'+(u.dots[k].t>1?'s':'')+'">'+DOTS[k].name+' '+u.dots[k].d+'&times;'+u.dots[k].t+'</span>').join(''):'';
  const sub=side==='foe'?'Lv '+u.lvl+' &middot; ATK '+u.atk+(u.curse&&!dead?' &middot; <span class="bad">Cursed '+u.curse.t+'</span>':'')
    +(u.stun&&!dead?' &middot; <span class="ok">Frozen</span>':'')
    +(u.shield>0&&!dead?' &middot; <span class="sh-t">Shield '+u.shield+'</span>':'')
    +dots
    +(u.charging&&!dead?'<span class="charge">Charging '+BOSS_ABIL[u.move||u.abil].name+'</span>':'')
    :(isP?'Lv '+u.lvl+' &middot; ATK '+pAtk():mName(u)+' &middot; Lv '+u.lvl+' &middot; ATK '+u.atk)
    +dots;
  const inner=fx+'<div class="u-head">'+(isP?ico('Necromancer',pRankI(),{}):ico(u.base||u.kind||u.name,u.rankI,u))+'<div class="u-id"><div class="u-top">'+rk+'<span class="u-tag">'+tag+'</span></div>'
   +'<div class="u-name">'+(side==='foe'?u.name:nick(u))+'</div><div class="u-sub num">'+sub+'</div></div></div>'
   +'<div class="bar"><i class="fill hp" style="width:'+pct(u.hp,max)+'%"></i></div>'
   +'<div class="num u-hp">'+Math.max(0,u.hp)+'/'+max+(isP&&u.shield?' <span class="sh-t">+'+u.shield+' ward</span>':'')+'</div>'
   +(isP?'<div class="bar"><i class="fill mp" style="width:'+pct(u.mana,pMana())+'%"></i></div><div class="num u-hp">Mana '+u.mana+'/'+pMana()+'</div>':'');
  if(mini){   // a minion in battle: icon, name, level, attack, HP; the rest lives on the Army tab
    const m='<div class="u-head">'+ico(u.base||u.kind||u.name,u.rankI,u)+'<div class="u-id"><div class="u-name">'+nick(u)+'</div><div class="u-sub num">Lv '+u.lvl+' &middot; ATK '+u.atk+dots+'</div></div></div>'
      +'<div class="bar"><i class="fill hp" style="width:'+pct(u.hp,max)+'%"></i></div><div class="num u-hp">'+Math.max(0,u.hp)+'/'+max+'</div>';
    return '<div class="unit ally mini'+(dead?' dead':'')+(u.elite?' elite':'')+(f.d?' hit':'')+'" data-u="'+fxKey(u)+'" title="'+mName(u)+', '+ROLES[u.role].label+'">'+fx+m+'</div>'; }
  const cls='unit '+side+(dead?' dead':'')+(sel?' sel':'')+(u.elite?' elite':'')+(f.d?' hit':'');
  return side==='foe'&&!dead?'<button class="'+cls+'" data-a="target" data-k="'+u.id+'" data-u="'+u.id+'" aria-pressed="'+sel+'">'+inner+'</button>':'<div class="'+cls+'" data-u="'+fxKey(u)+'">'+inner+'</div>';
}
const ORDER_KEYS={z:'vanguard',x:'striker',c:'mender',v:'reaper'}, ORDER_KEY=Object.fromEntries(Object.entries(ORDER_KEYS).map(([k,r])=>[r,k.toUpperCase()]));
function ultHTML(){   // Souls and the ultimate, from level 20
  const P=S.player; if(P.lvl<ULT_LV) return '';
  const n=S.run.souls||0, U=ULTS[P.ult]; let pips=''; for(let i=0;i<SOUL_MAX;i++) pips+='<i class="soul'+(i<n?' on':'')+'"></i>';
  return '<div class="btns ult-row"><span class="souls" aria-label="'+n+' of '+SOUL_MAX+' Souls">Souls '+pips+'</span>'
   +(U?'<button class="btn ult'+(canUlt()?' primary':'')+'" data-a="act" data-k="ult" title="'+U.desc+'"'+(canUlt()?'':' disabled')+'>'+U.name+'<kbd>R</kbd></button>':'<span class="u-sub">Choose an ultimate on the Skills tab.</span>')+'</div>';
}
function cmdHTML(){
  const roles=Object.keys(CMDS).filter(k=>S.army.some(m=>m.role===k&&m.hp>0)); if(!roles.length) return '';
  return '<div class="btns cmds"><span class="cmd-l" title="Free, once a room">Orders:</span>'+roles.map(k=>{ const used=S.run.cmd&&S.run.cmd[k];
    return '<button class="btn small" data-a="cmd" data-k="'+k+'" title="'+CMDS[k].desc+'"'+(used?' disabled':'')+'>'+CMDS[k].name+(used?' &middot; given':'')+'<kbd>'+ORDER_KEY[k]+'</kbd></button>'; }).join('')+'</div>';
}
function srAnnounce(){   // read out the newest battle line once (the log itself is rebuilt on every render, so it cannot be the live region)
  const el=document.getElementById('sr-live'); if(!el) return; const L=S.run&&S.mode!=='town'&&S.run.log, last=L&&L.length?L[L.length-1].m:'';
  if(last&&last!==TAB.sr){ TAB.sr=last; el.textContent=last.replace(/<[^>]+>/g,''); } }
function logHTML(){ return '<ol class="log">'+S.run.log.map(l=>'<li class="'+l.c+'">'+l.m+'</li>').join('')+'</ol>'; }
function battleHTML(){
  currentTarget();
  const r=S.run, D=DUNGEONS[r.di], P=S.player, boss=r.room===r.rooms-1;
  const mini='<div class="mini-hp" aria-hidden="true"><div><span>HP '+Math.max(0,P.hp)+'/'+pMax()+(P.shield?' +'+P.shield:'')+'</span><div class="bar"><i class="fill hp" style="width:'+pct(P.hp,pMax())+'%"></i></div></div><div><span>Mana '+P.mana+'/'+pMana()+'</span><div class="bar"><i class="fill mp" style="width:'+pct(P.mana,pMana())+'%"></i></div></div></div>';
  return '<section class="win" aria-labelledby="h-battle">'+mini+'<h2 class="win-h" id="h-battle">'+(r.tw?'Hell Tower &middot; Floor '+r.tw+(r.tw%10===0?' &middot; Warden':'')+' &middot; Turn '+r.turn:(r.rift?'The Rift &middot; Depth '+r.rift+' &middot; ':'')+D.name+' &middot; Room '+(r.room+1)+'/'+r.rooms+(boss?' &middot; Boss':'')+' &middot; Turn '+r.turn)+'</h2>'
   +(r.mod?'<p class="q-note"><span class="curse-line" style="margin:0">Cursed: <b>'+MODS[r.mod].name+'</b>. '+MODS[r.mod].desc+'</span></p>':'')
   +(r.heat?'<p class="q-note bad">Difficulty: <b>'+HEAT[r.heat].name+'</b>'+(r.mod?', and the curse feeds on it':'')+'.</p>':'')
   +(r.bless?'<p class="q-note ok">Blood-blessed: you and your army hit 15% harder in this gate.</p>':'')
   +'<p class="group-h">Foes'+(foeArmor()?' &middot; '+armorTag(foeArmor()):'')+'</p><div class="row">'+r.enemies.map(e=>unitCard(e,'foe')).join('')+'</div>'
   +'<p class="group-h">Your side'+(r.frenzy>0?' &middot; <span class="ok">Frenzy '+r.frenzy+'</span>':'')+(r.silence>0?' &middot; <span class="bad">Silenced '+r.silence+'</span>':'')+(r.taunt>0?' &middot; <span class="ok">Taunting '+r.taunt+'</span>':'')+'</p><div class="row minis side">'+unitCard(S.player,'ally')+S.army.map(a=>unitCard(a,'ally',true)).join('')+'</div>'
   +'<div class="actbar">'+partyStrip()+'<div class="btns"><button class="btn primary" data-a="act" data-k="strike">Strike +3 mana<kbd>1</kbd></button>'
   +'<button class="btn" data-a="act" data-k="siphon"'+(P.mana<siphonCost()?' disabled':'')+'>Soul Siphon '+siphonCost()+'<kbd>2</kbd></button>'
   +'<button class="btn" data-a="act" data-k="ward"'+(P.mana<6?' disabled':'')+'>Bone Ward 6<kbd>3</kbd></button>'
   +'<button class="btn warn" data-a="flee">Flee</button></div>'
   +((S.belt.hp||S.belt.mp)?'<div class="btns">'+Object.keys(POTIONS).filter(k=>S.belt[k]).map(k=>{ const p=POTIONS[k], full=k==='hp'?P.hp>=pMax()&&!P.dots:P.mana>=pMana();
      return '<button class="btn potion" data-a="act" data-k="pot:'+k+'"'+(full?' disabled title="Already full"':' title="'+p.desc+'"')+'>'+p.name+' &times;'+S.belt[k]+'<kbd>'+p.key+'</kbd></button>'; }).join('')+'</div>':'')
   +ultHTML()
   +cmdHTML()
   +(activeSkills().length?'<div class="btns">'+activeSkills().map((s,i)=>{ const cd=skCd(s.id), why=r.silence>0?'Silenced by the Hymn':cd>0?'Ready in '+cd+' turn'+(cd>1?'s':''):s.id==='blast'&&!freeCorpse()?'Needs a body that fell this room':s.id==='mend'&&!S.army.some(m=>m.hp>0&&m.hp<m.maxHp)?'No wounded minions':P.mana<s.cost?'Not enough mana':s.desc(sk(s.id));
      return '<button class="btn" data-a="act" data-k="sk:'+s.id+'" title="'+why+'"'+(canUse(s.id)?'':' disabled')+'>'+s.name+' '+s.cost+(cd>0?' &middot; '+cd+'t':'')+(i<6?'<kbd>'+(i+4)+'</kbd>':'')+'</button>'; }).join('')+'</div>':'')
   +'</div>'+logHTML()+'</section>';
}
function slotsHTML(){ const n=slots(), u=armyUsed(); let s='<span class="slots" aria-label="'+u+' of '+n+' slots used">'; for(let i=0;i<n;i++) s+='<i class="slot'+(i<S.army.length?' on':i<u?' away':'')+'"></i>'; return s+'</span>'; }
function minionDetail(m){   // everything about one minion, readable without hovering
  const stage=m.stage||0, next=evoNext(m), g=gearBonus(m), base=m.tw?towerStats(m.tw,m.lvl,m.hf,m.af,m.boss,m.elite):mobStats(m.rankI,m.lvl,m.hf,m.af,m.boss,m.elite);
  const rows=[['Kind',(m.tw?'Hell Tower ':'')+mName(m)+(m.boss?', a raised boss':m.elite?', a raised elite':'')],['Role',ROLES[m.role].label+': '+ROLES[m.role].text],
    ['Evolution',stage===STAGE_MAX?'Eternal, the last form':(STAGES[stage].trim()||'Base form')+(next!=null?'; next at Lv '+next+' ('+STAGES[stage+1].trim()+': '+fxText(STAGE_FX[stage+1])+')':'')],
    ['Base stats','HP '+base.hp+', ATK '+base.atk+' at Lv '+m.lvl],
    ...(stage?[['Evolution buffs',STAGES.slice(1,stage+1).map((n,i)=>n.trim()+' '+fxText(STAGE_FX[i+1])).join('; ')]]:[]),['Raised at','Lv '+m.lvl0],
    ['Fusions',(m.fused||0)+' of '+FUSE_MAX],['Power','ATK '+m.atk+', HP '+m.maxHp+(m.armed&&(g.atk||g.hp)?' (gear +'+g.atk+' ATK, +'+g.hp+' HP)':'')]];
  return '<div class="m-det">'+rows.map(r=>'<div><b>'+r[0]+'</b><span>'+r[1]+'</span></div>').join('')
    +(m.traits||[]).map(t=>'<div><b>'+TRAITS[t].name+'</b><span>'+TRAITS[t].desc+'</span></div>').join('')+'</div>';
}
function minionCard(m,canRelease){
  const nx=mneed(m.lvl), capped=m.lvl>=S.player.lvl+2;
  const conf=ui.confirm===m.uid;
  return '<div class="minion"><div><div class="u-head">'+ico(m.kind||m.name,m.rankI,m)+'<div class="u-id"><div class="u-top"><span class="rk r'+m.rankI+'">'+RANKS[m.rankI]+'</span><span class="u-tag">'+ROLES[m.role].label+(m.armed?' &middot; Armed':'')+(m.boss?' &middot; Boss':'')+(m.elite?' &middot; Elite':'')+'</span></div>'
   +(ui.rename===m.uid&&canRelease?'<div class="rn-row"><input id="rn" class="rn-in" maxlength="'+NICK_MAX+'" value="'+cleanNick(ui.rn==null?m.nick:ui.rn)+'" aria-label="New name for '+m.nick+'"><button class="btn small primary" data-a="rename" data-k="'+m.uid+'">Save</button><button class="btn small" data-a="renamex">Cancel</button></div>'
     :'<div class="u-name" style="'+(m.elite?'color:var(--gold)':'')+'">'+m.nick+' <span class="dim" style="font-size:15px">'+theName(mName(m))+'</span></div>')
   +traitChips(m)
   +'<div class="m-links"><button class="linkbtn" data-a="mdet" data-k="'+m.uid+'" aria-expanded="'+(ui.mdet===m.uid)+'">'+(ui.mdet===m.uid?'Hide details':'Details')+'</button>'+(canRelease&&S.mode!=='battle'&&ui.rename!==m.uid?'<button class="linkbtn" data-a="renameo" data-k="'+m.uid+'">Rename</button>':'')+'</div>'
   +(ui.mdet===m.uid?minionDetail(m):'')+'</div></div>'
   +'<div class="bars"><div class="meter"><div class="m-top"><span>HP</span><span class="num">'+m.hp+'/'+m.maxHp+'</span></div><div class="bar"><i class="fill hp" style="width:'+pct(m.hp,m.maxHp)+'%"></i></div></div>'
   +'<div class="meter"><div class="m-top"><span>Lv '+m.lvl+' &middot; ATK '+m.atk+'</span><span class="num">'+(capped?'cap':m.xp+'/'+nx)+'</span></div><div class="bar"><i class="fill xp" style="width:'+(capped?100:pct(m.xp,nx))+'%"></i></div></div></div></div>'
   +(canRelease?'<button class="btn small warn" data-a="release" data-k="'+m.uid+'">'+(conf?'Confirm release':'Release')+'</button>':'<span></span>')
   +(m.armed?gearRowHTML(m,canRelease):'')+'</div>';
}
function partyStrip(){   // phones: the pinned action bar hides your side, so one thin HP tick per minion sits above the buttons (CSS shows it only at phone width)
  if(!S.army.length) return '';
  return '<div class="pstrip" role="group" aria-label="Army health">'+S.army.map(m=>{ const lab=m.nick+': '+(m.hp>0?m.hp+'/'+m.maxHp:'down'); return '<i class="pt'+(m.hp<=0?' down':m.hp<m.maxHp*.3?' low':'')+'" role="img" title="'+lab+'" aria-label="'+lab+'"><b style="width:'+pct(Math.max(0,m.hp),m.maxHp)+'%"></b></i>'; }).join('')+'</div>';
}
function minionRow(m,canRelease){   // the compact army list: one row per minion, same actions as the card
  const low=m.hp>0&&m.hp<m.maxHp*.3, tags=(m.traits||[]).map(t=>TRAITS[t].name), next=evoNext(m);
  if(next!=null) tags.push('Evolves at Lv '+next); else if((m.stage||0)===STAGE_MAX) tags.push('Eternal');
  return '<div class="mrow">'+ico(m.kind||m.name,m.rankI,m)+'<span class="rk r'+m.rankI+'">'+RANKS[m.rankI]+'</span><span class="mr-name"><b style="'+(m.elite?'color:var(--gold)':'')+'">'+m.nick+'</b> <span class="dim">'+theName(mName(m))+'</span></span>'
   +'<span class="u-tag">'+ROLES[m.role].label+(m.armed?' &middot; Armed':'')+'</span><span class="num mr-st">Lv '+m.lvl+' &middot; ATK '+m.atk+'</span>'
   +'<span class="mr-hp'+(low?' low':'')+'"><span class="bar"><i class="fill hp" style="width:'+pct(m.hp,m.maxHp)+'%"></i></span><span class="num">'+m.hp+'/'+m.maxHp+'</span></span>'
   +(tags.length?'<span class="mr-tags dim">'+tags.join(', ')+'</span>':'')
   +'<span class="mr-acts"><button class="btn small" data-a="mdet" data-k="'+m.uid+'" aria-expanded="false">Details</button>'+(canRelease?'<button class="btn small" data-a="renameo" data-k="'+m.uid+'">Rename</button><button class="btn small warn" data-a="release" data-k="'+m.uid+'">'+(ui.confirm===m.uid?'Confirm release':'Release')+'</button>':'')+'</span></div>';
}
function gearRowHTML(m,can){
  const g=gearBonus(m), pk=ui.pick&&ui.pick.uid===m.uid?ui.pick.slot:null;
  let h='<div class="gear-row"><div class="gear-h"><span class="u-tag">Gear-bearer</span><span class="u-sub">'+((g.atk||g.hp||g.mpow)?'Gear gives +'+g.atk+' ATK, +'+g.hp+' HP'+(g.mpow?', +'+g.mpow+'% power':''):'Equip it from your bag. Gear returns to the bag if it is released or shattered.')+'</span></div><div class="gear-slots">';
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
  if(S.mode!=='town') return ''; const cmds=S.army.filter(isCommander), out=S.raids||[], logs=S.raidLog||[];
  if(!cmds.length&&!out.length&&!logs.length) return '';
  let h='<section class="win" aria-labelledby="h-raid"><h2 class="win-h" id="h-raid">War table'+(out.length?' &middot; '+out.length+' out':'')+'</h2>';
  out.forEach((x,i)=>{ h+='<div class="raid-row"><div><b>'+x.units[0].nick+'</b> leads '+x.units.length+' to the '+DUNGEONS[x.di].name+'<div class="u-sub">'+Math.round(raidOdds(x.units,x.di)*100)+'% odds &middot; back at dawn</div></div><button class="btn small warn" data-a="recall" data-k="'+i+'">Recall</button></div>'; });
  const gates=raidGates();
  if(cmds.length&&gates.length){
    const c=cmds.find(m=>m.uid===ui.rc)||cmds[0], di=gates.includes(ui.rg)?ui.rg:gates[gates.length-1], max=squadMax(c)-1;
    const sel=(ui.rsq||[]).filter(u=>S.army.some(m=>m.uid===u&&m!==c)).slice(0,max), units=[c].concat(sel.map(u=>S.army.find(m=>m.uid===u)));
    h+=(cmds.length>1?'<p class="group-h">Commander</p><div class="chips">'+cmds.map(m=>'<button class="btn small'+(m===c?' primary':'')+'" data-a="rcmd" data-k="'+m.uid+'" aria-pressed="'+(m===c)+'">'+m.nick+'</button>').join('')+'</div>':'<p class="u-sub">Commander: <b>'+c.nick+'</b>, '+theName(mName(c))+'</p>')
     +'<p class="group-h">Target</p><div class="chips">'+gates.map(i=>'<button class="btn small'+(i===di?' primary':'')+'" data-a="rgate" data-k="'+i+'" aria-pressed="'+(i===di)+'">'+DUNGEONS[i].name+'</button>').join('')+'</div>'
     +'<p class="group-h">Squad &middot; '+sel.length+'/'+max+'</p><div class="chips">'+S.army.filter(m=>m!==c).map(m=>{ const on=sel.includes(m.uid); return '<button class="btn small'+(on?' primary':'')+'" data-a="rsq" data-k="'+m.uid+'" aria-pressed="'+on+'"'+(!on&&sel.length>=max?' disabled':'')+'>'+m.nick+' &middot; Lv '+m.lvl+'</button>'; }).join('')+'</div>'
     +'<div class="btns"><button class="btn primary" data-a="raid"'+(sel.length?'':' disabled title="Pick at least one follower"')+'>Send the raid &middot; '+Math.round(raidOdds(units,di)*100)+'% odds</button></div>';
  } else if(cmds.length) h+='<p class="lede">Clear a gate first.</p>';
  if(logs.length) h+='<p class="group-h">Last raids</p><ul class="raid-log">'+logs.slice(0,3).map(x=>'<li class="'+(x.won?'ok':'bad')+'">Day '+x.day+': '+x.nick+', '+DUNGEONS[x.di].name+' &middot; '+(x.won?'won':'lost'+(x.lost?' ('+x.lost+' fell)':''))+'</li>').join('')+'</ul>';
  return h+'</section>';
}
function armyHTML(){
  const canRel=S.mode==='town'||S.mode==='raise', compact=VIEW.army==='compact'&&S.army.length>1&&S.mode!=='battle';   // an open Details or Rename shows that minion's full card
  return '<section class="win" aria-labelledby="h-army"><h2 class="win-h" id="h-army">Army '+armyUsed()+'/'+slots()+(raidN()?' &middot; '+raidN()+' raiding':'')+slotsHTML()+'</h2>'
   +(S.army.length>1&&S.mode!=='battle'?'<div class="bag-tools">Order: '
     +Object.keys(ARMY_SORTS).map(k=>'<button class="linkbtn" data-a="asort" data-k="'+k+'">'+ARMY_SORTS[k]+'</button>').join('')
     +'<span class="a-dens" role="group" aria-label="Army view">View: '
     +[['cards','Cards'],['compact','Compact']].map(x=>'<button class="linkbtn'+(VIEW.army===x[0]?' on':'')+'" data-a="view" data-k="army|'+x[0]
       +'" aria-pressed="'+(VIEW.army===x[0])+'">'+x[1]+'</button>').join('')
     +'</span></div>':'')
   +(S.army.length?'<div class="army'+(compact?' compact':'')+'">'+S.army.map(m=>compact&&ui.mdet!==m.uid&&ui.rename!==m.uid?minionRow(m,canRel):minionCard(m,canRel)).join('')+'</div>':'<p class="lede">No one answers you yet. Win a room, then raise what fell.</p>')+'</section>';
}
function raiseHTML(){
  const r=S.run, P=S.player, D=DUNGEONS[r.di];
  const full=armyUsed()>=slots();
  const corpses=r.corpses.map(c=>{
    const ch=raiseChance(c), cost=raiseCost(c);
    let right;
    if(c.tried) right=c.result==='raised'?'<span class="ok num">Raised as '+c.minion+'</span>':c.result==='exploded'?'<span class="dim num">Burst apart</span>':'<span class="bad num">Crumbled</span>';
    else right='<div class="btns" style="margin:0"><button class="btn primary small" data-a="raise" data-k="'+c.id+'"'+(P.mana<cost||full?' disabled':'')+(firstRaise()?' title="Your first raise always answers"':'')+'>Raise &middot; '+ch+'% &middot; '+cost+' mana</button>'
      +(S.salts>0?'<button class="btn small" data-a="raisesalt" data-k="'+c.id+'"'+(P.mana<cost||full?' disabled':'')+' title="Uses one Grave Salts ('+S.salts+' left)">With salts &middot; '+saltChance(c)+'%</button>':'')+'</div>';
    return '<div class="corpse'+(c.tried?' done '+c.result:'')+'" data-u="'+c.id+'"><div><div class="u-head">'+ico(c.base,c.rankI,c)+'<div class="u-id"><div class="u-top"><span class="rk r'+c.rankI+'">'+RANKS[c.rankI]+'</span><span class="u-tag">'+ROLES[c.role].label+(c.armed?' &middot; Armed':'')+(c.boss?' &middot; Boss':'')+(c.elite?' &middot; Elite':'')+'</span></div>'
     +'<div class="u-name" style="'+(c.elite?'color:var(--gold)':'')+'">'+c.name+'</div><div class="u-sub num">Lv '+c.lvl
       +(c.aff?' &middot; <span class="aff" title="A raised elite keeps one of these as a trait">'
         +c.aff.map(a=>AFFIX[a].name===TRAITS[AFFIX[a].trait].name?'keeps '+AFFIX[a].name:AFFIX[a].name+' &rarr; '+TRAITS[AFFIX[a].trait].name).join(', ')+'</span>':'')
       +(c.free?' &middot; <span class="free-t">Straggler: free, +'+STRAGGLER_BONUS+'%</span>':'')+'</div></div></div></div>'+right+'</div>';
  }).join('');
  const done=r.cleared, q=r.quiet&&DOORS[r.quiet];
  return '<section class="win" aria-labelledby="h-raise"><h2 class="win-h" id="h-raise">'+(r.tw?'Hell Tower &middot; Floor '+r.tw+(done?' &middot; Conquered':' cleared'):(r.rift?'The Rift '+r.rift+' &middot; ':'')+D.name+' &middot; '+(done?'Cleared':'Room '+(r.room+1)+(q?'':' cleared')))+'</h2>'
   +'<h3 class="win-title">'+(r.tw?(done?'Abaddon is dead. The Tower is yours.':'The floor is still.'):(done?'The gate falls silent.':q?q.name:'The room is still.'))+'</h3>'
   +(q?'<p class="lede">No fight here &middot; Mana '+P.mana+'/'+pMana()+'</p>':'<p class="lede">+'+r.lastXp+' XP'+(r.ups?' &middot; level up':'')+' &middot; Mana '+P.mana+'/'+pMana()+' &middot; <span title="Whatever you do not raise is gone when you move on">unraised bodies are lost</span></p>')
   +(r.events.length?'<div class="notes">'+r.events.map(e=>'<div class="note '+e.c+'"><i>Log</i><span>'+e.m+'</span></div>').join('')+'</div>':'')
   +(full&&r.corpses.some(c=>!c.tried)?(w=>'<div class="note bad"><i>Full</i><span>Your army is full. Release someone to make room.</span>'+(w?'<button class="btn small warn" data-a="release" data-k="'+w.uid+'">'+(ui.confirm===w.uid?'Confirm: release '+w.nick:'Release your weakest, '+w.nick+' (Lv '+w.lvl+' '+ROLES[w.role].label.toLowerCase()+')')+'</button>':'')+'</div>')(weakest()):'')
   +(!full&&r.corpses.filter(c=>!c.tried).length>=2?'<div class="btns"><button class="btn small primary" data-a="raisebest" title="Tries every body, most valuable first; uses salts on bosses and elites" aria-keyshortcuts="Space">Raise the best<kbd>Space</kbd></button></div>':'')
   +eventHTML()+spoilsHTML()+(q&&!r.corpses.length?'':'<p class="group-h">The fallen</p><div class="corpses">'+(corpses||'<p class="lede">Nothing left to raise.</p>')+'</div>')
   +(r.doors&&!done?doorsHTML():'<div class="btns">'+(done?'<button class="btn primary" data-a="town">Return to the gate</button>':'<button class="btn primary" data-a="descend">'+(r.tw?'Ascend to floor '+(r.tw+1)+' (heal ':'Descend (heal ')+Math.round(DIFF.heal*100)+'%, mana +'+Math.round(DIFF.mana*100)+'%)</button><button class="btn" data-a="town">'+(r.tw?'Descend with spoils':'Leave with spoils')+'</button>')+'</div>')+'</section>'
   +armyHTML();
}
function doorsHTML(){
  const r=S.run;
  return '<p class="group-h">Next room &middot; heal '+Math.round(DIFF.heal*100)+'%, mana +'+Math.round(DIFF.mana*100)+'% &middot; keys 1&ndash;'+r.doors.length+'</p><div class="doors">'
   +r.doors.map((k,i)=>'<button class="door d-'+k+'" data-a="door" data-k="'+k+'" aria-keyshortcuts="'+(i+1)+'"><b>'+DOORS[k].name+'<kbd>'+(i+1)+'</kbd></b><span>'+DOORS[k].desc+'</span></button>').join('')+'</div>'
   +'<div class="btns"><button class="btn" data-a="town">Leave with spoils</button></div>';
}
function eventHTML(){
  const r=S.run, ev=r.event; if(!ev||ev.done) return '';
  const E=EVENTS[ev.id], P=S.player;
  const label=(k,t)=>ev.id==='pedlar'&&k==='buy'?'Buy '+withArticle(POTIONS[ev.pot].name)+' &middot; '+gold(ev.price):t;
  const off=k=>ev.id==='pedlar'&&k==='buy'&&(S.gold<ev.price||S.belt[ev.pot]>=BELT_MAX);
  return '<div class="event-box"><h4>'+E.name+'</h4><p>'+E.text+'</p>'+(ev.id==='shrine'&&P.hp<=1?'<p class="q-note">You have no blood to spare.</p>':'')
   +'<div class="btns" style="margin:0">'+E.opts.map((o,i)=>'<button class="btn small'+(i===0?' primary':'')+'" data-a="event" data-k="'+o[0]+'"'+(off(o[0])||(ev.id==='shrine'&&o[0]==='bleed'&&P.hp<=1)?' disabled':'')+'>'+label(o[0],o[1])+'</button>').join('')+'</div></div>';
}
function spoilsHTML(){
  const r=S.run, sp=(r.spoils||[]).map(u=>S.inv.find(x=>x.u===u)).filter(Boolean);
  let h='';
  if(sp.some(it=>ITEM[it.id].uq)) h+='<div class="note ok"><i>Unique</i><span>Something very few ever hold. Equip it and read what it does.</span></div>';
  if((r.lostLoot||[]).length) h+='<div class="note bad"><i>Bag full</i><span>Left behind: '+r.lostLoot.join(', ')+'.</span></div>';
  const tro=Object.keys(r.lastTroph||{});
  if(r.lastGold||tro.length) h+='<p class="group-h">Gold and trophies</p><div class="loot-line">'+gold(r.lastGold||0)
    +tro.map(k=>'<span class="tro-chip">'+TROPHY[k].name+(r.lastTroph[k]>1?' &times;'+r.lastTroph[k]:'')+'</span>').join('')+'</div>';
  if(sp.length) h+='<p class="group-h">Spoils from this room</p><div class="items">'+sp.map(it=>itemCard(it,'<button class="btn small primary" data-a="equip" data-k="'+it.u+'">'+(S.equip[ITEM[it.id].slot]?'Swap in':'Equip')+'</button>',true)).join('')+'</div>';
  return h;
}
function defeatHTML(){
  const r=S.run;
  return '<section class="win" aria-labelledby="h-def"><h2 class="win-h" id="h-def">Fallen</h2><h3 class="win-title">'+(r.tw?'You fell on floor '+r.tw+' of the Hell Tower.':'You went down in room '+(r.room+1)+'.')+'</h3>'
   +'<p class="lede">Loot from rooms already cleared is kept. This room\'s spoils are lost and you lose some XP. Your army carried you out and bound itself back together.</p>'
   +'<div class="btns"><button class="btn primary" data-a="town">Return to the gate</button></div>'+logHTML()+'</section>';
}
function keysHTML(){   // every shortcut in one list; ? opens it, Esc closes it
  const row=(k,t)=>'<div class="kr"><kbd>'+k+'</kbd><span>'+t+'</span></div>';
  return '<div class="keys-ov" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"><div class="win keys-win"><div class="kh"><h2>Keyboard shortcuts</h2><button class="btn small" data-a="keys">Close<kbd>Esc</kbd></button></div>'
   +'<h3>In town</h3>'+row('1-9','Switch tabs')+row('Esc','Back to the gate list, cancel a rename or a confirm')
   +'<h3>Between rooms</h3>'+row('1-4','Pick a door')+row('Space','Raise the best')
   +'<h3>In battle</h3>'+row('1','Strike')+row('2','Soul Siphon')+row('3','Bone Ward')+row('4-9','Your skills')+row('R','Ultimate')+row('[ ]','Change target')
   +Object.keys(CMDS).filter(k=>ORDER_KEY[k]).map(k=>row(ORDER_KEY[k],CMDS[k].name)).join('')
   +Object.keys(POTIONS).map(k=>row(POTIONS[k].key,POTIONS[k].name)).join('')
   +row('?','Show or hide this list')+'</div></div>';
}
