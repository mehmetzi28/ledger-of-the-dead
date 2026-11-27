// ----- item icons + cards
Object.assign(GLYPH,{
 i_wa:'<path d="M16 1l3.5 15-3.5 3-3.5-3z"/><rect x="9" y="17" width="14" height="3" rx="1"/><rect x="14.5" y="20" width="3" height="8"/><circle cx="16" cy="29.5" r="2"/>',
 i_wb:'<rect x="15" y="9" width="2" height="21"/><circle cx="16" cy="6" r="5"/><circle class="c" cx="14" cy="5.5" r="1.3"/><circle class="c" cx="18" cy="5.5" r="1.3"/>',
 i_aa:'<path d="M10 3l6 3 6-3 7 5-3 6-3-1v16H9V13l-3 1-3-6z"/><path class="cs" d="M16 6v21"/>',
 i_ab:'<path d="M16 2c-4 0-7 3-8 7l-5 6 5 2-3 13h22l-3-13 5-2-5-6c-1-4-4-7-8-7z"/><path class="cs" d="M16 9v19"/>',
 i_ta:'<path class="s" style="stroke-width:2" d="M8 2c0 10 3 14 8 14s8-4 8-14"/><circle cx="16" cy="22" r="6.5"/><circle class="c" cx="16" cy="22" r="2.5"/>',
 i_tb:'<circle class="s" cx="16" cy="20" r="8" style="stroke-width:3.2"/><path d="M16 2l5 7h-10z"/>',
 i_tc:'<circle cx="16" cy="16" r="12"/><circle class="c" cx="16" cy="16" r="8"/><path d="M16 9l2 5 5 .5-4 3.5 1.2 5-4.2-2.7-4.2 2.7 1.2-5-4-3.5 5-.5z"/>',
 i_u0:'<g transform="translate(-5 6) scale(2)"><path d="M5 3l3 3 3-4 3 4 3-3-1.5 7h-9z"/></g><rect x="6" y="23" width="20" height="4"/>',
 i_u4:'<path d="M16 29C5 21 3 13 7 8c3-4 8-3 9 1 1-4 6-5 9-1 4 5 2 13-9 21z"/><path class="cs" d="M16 9c-1 5 1 9 0 14"/>'
});
const ITEM_HUE={weapon:'#6f665a',armor:'#5f5a52',relic:'#6e5e40'};   // gear is painted in worn steel, leather and brass; rarity shows on the frame and the name
const GLINT='<path class="glint" d="M51 5L52.2 9.8L57 11L52.2 12.2L51 17L49.8 12.2L45 11L49.8 9.8Z"/>';   // a small star of light on Legendary and Unique gear
// The tier also as a shape, for anyone who cannot tell the frame colours apart: one to five small diamonds (Common to Legendary), a star for a Unique.
const TIER_MARK=TIERS.map((n,t)=>'<svg class="tmark" viewBox="0 0 '+(t>=5?8:t*5+4)+' 8" aria-hidden="true">'+(t>=5?'<path d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z"/>':Array.from({length:t+1},(x,i)=>'<path d="M'+(i*5+2)+' 1.5L'+(i*5+4)+' 4L'+(i*5+2)+' 6.5L'+i*5+' 4Z"/>').join(''))+'</svg>');
function iico(d){ const set=!d.uq&&!d.tower&&RANKS[d.set]!=null, g=iglyph(d), M=IMAT[g]||['metal',ITEM_HUE[d.slot]||'#6a655c'];   // each gate's set has its own metal and its rank letter in the corner; each piece its own shape and material
  return '<span class="ico t'+d.tier+(set?' s'+d.set:'')+'" aria-hidden="true"><svg viewBox="0 0 64 64" class="mt-'+M[0]+'" style="color:'+M[1]+'"><g filter="url(#paint)">'+(IC[g]||IC._)+'</g>'+(d.tier>=4?GLINT:'')+'</svg>'+(set?'<span class="rb gl r'+d.set+'">'+RANKS[d.set]+'</span>':'')+(TIER_MARK[d.tier]||'')+'</span>'; }
const statTxt=(k,v)=>(v>0?'+':'&minus;')+Math.abs(v)+STATL[k][1]+' '+STATL[k][0];
function statsHTML(d,it){ return Object.keys(d.stats).filter(k=>d.stats[k]).map(k=>'<span>'+statG(k,baseStat(it,d,k))+'</span>').join('')
  +((it&&it.ro)||[]).map(r=>'<span class="roll" title="Bonus line">'+statG(r[0],r[1])+'</span>').join(''); }
// A fold for long text: a native <details>, so it opens from the keyboard; ui.det remembers it across renders (ui-input.js). With keep the summary
// stays when open (a heading); without it the summary (a short line) gives way to the body, which holds the full text.
const detl=(k,sum,body,cls,keep)=>'<details class="more'+(keep?' keep':'')+(cls?' '+cls:'')+'" data-det="'+k+'"'+(ui.det&&ui.det[k]?' open':'')+'><summary>'+(keep?sum:'<span class="more-1">'+sum+'</span>')+' <span class="more-l">Details</span><span class="more-h">Hide details</span></summary><div class="more-b">'+body+'</div></details>';
function brief(k,t,cls){ return '<details class="more brief '+(cls||'q-note')+'" data-det="'+k+'"'+(ui.det&&ui.det[k]?' open':'')+'><summary title="'+t.replace(/<[^>]+>/g,'').replace(/"/g,'&quot;')+'"><span class="more-l">How it works</span><span class="more-h">Hide</span></summary><div class="more-b">'+t+'</div></details>'; }   // a rule text folded to one small link (its tooltip holds the text), the whole text one press away
function cmpHTML(it){   // what wearing this would change, against what is in that slot now
  const d=ITEM[it.id], cur=S.equip[d.slot]; if(cur&&cur.u===it.u) return '';
  if(!cur) return '<div class="cmp">Your '+SLOTS[d.slot].toLowerCase()+' slot is empty.</div>';
  const a=itStats(it), b=itStats(cur), keys=[...new Set(Object.keys(a).concat(Object.keys(b)))].filter(k=>(a[k]||0)!==(b[k]||0));
  return '<div class="cmp">vs '+ITEM[cur.id].name+': '+(keys.length?keys.map(k=>{ const v=(a[k]||0)-(b[k]||0); return '<span class="'+(v>0?'up':'down')+'">'+statG(k,v)+'</span>'; }).join(''):'<span>same stats</span>')+'</div>';
}
function usetLine(d){ if(d.uset==null) return ''; const U=USET[d.uset], n=usetCount(d.uset), worn=id=>GEAR_SLOTS.some(sl=>S.equip[sl]&&S.equip[sl].id===id);
  return detl('us'+d.uset,'Unique set: <b>'+U.name+'</b>'+(n?' ('+n+'/3 worn)':''),U.ids.map(id=>'<span class="'+(worn(id)?'on':'')+'">'+ITEM[id].name+'</span>').join(', ')
   +'<br><span class="'+(n>=2?'on':'')+'">2: '+buffTxt(U.b[2])+'</span> &middot; <span class="'+(n>=3?'on':'')+'">3: '+buffTxt(U.b[3])+'</span>','setl uset',1); }
function setLine(d){ if(d.tower||SET_NAMES[d.set]==null) return usetLine(d); const n=setCount(d.set), B=SET_BONUS[d.set];
  return detl('gs'+d.set,SET_NAMES[d.set]+' set'+(n?' ('+n+'/3 worn)':''),'<span class="'+(n>=2?'on':'')+'">2: '+buffTxt(B[2])+'</span> &middot; <span class="'+(n>=3?'on':'')+'">3: '+buffTxt(B[3])+'</span>','setl',1)+usetLine(d); }
function itemCard(it,acts,cmp){
  const d=ITEM[it.id];
  return '<div class="item t'+d.tier+'">'+iico(d)+'<div class="i-body"><div class="i-top"><span class="i-name">'+d.name+'</span><span class="i-tag">'+TIERS[d.tier]+' &middot; '+SLOTS[d.slot]+(!d.uq&&!d.tower&&RANKS[d.set]?'<span class="sr"> &middot; gate '+RANKS[d.set]+' set</span>':'')+(d.tower?' &middot; <span class="i-floor">Hell Tower '+d.floor+'</span>':'')+(it.aw?' &middot; <span class="i-aw" title="'+AWAKEN_TXT+'">Awakened '+AWAKEN_RN[it.aw]+'</span>':'')+'</span></div>'
   +'<div class="i-stats">'+statsHTML(d,it)+'</div>'+(it.rb&&RB_POW[it.rb.p]?'<div class="i-rb">Riftborn &middot; depth '+it.rb.d+' &middot; <b>'+RB_POW[it.rb.p].name+'</b>: '+rbDesc(it)+'</div>':'')+(it.hf?'<div class="i-hf">Heartforged from '+it.hf+(it.pw?' &middot; <b>'+HF_POW[it.pw].name+'</b>: '+HF_POW[it.pw].desc:'')+'</div>':'')+(d.flag?detl('fx'+d.flag,FLAGS[d.flag].split(':')[0],FLAGS[d.flag],'i-fx'):'')+setLine(d)+(cmp?cmpHTML(it):'')+'</div><div class="i-acts">'+(acts||'')+'</div></div>';
}
const lockBtn=it=>'<button class="btn small lockb'+(it.lk?' on':'')+'" data-a="lock" data-k="'+it.u+'" aria-pressed="'+!!it.lk+'" title="'+(it.lk?'Locked: never sold, salvaged or discarded. Press to unlock.':'Lock it so it is never sold, salvaged or discarded')+'">'+(it.lk?'Locked':'Lock')+'</button>';
const reforgeBtn=it=>S.mode!=='town'?'':ITEM[it.id].uq?awakenBtn(it):'<button class="btn small" data-a="reforge" data-k="'+it.u+'"'+(S.gold<reforgeCost(it)?' disabled':'')+' title="Re-roll its bonus lines">Reforge &middot; '+gold(reforgeCost(it))+'</button>'+enchBtn(it)+attuneBtn(it);
const attuneBtn=it=>!it.rb||it.rb.d>=RB_DMAX?'':'<button class="btn small" data-a="attune" data-k="'+it.u+'"'+(riftShards()<attuneCost(it)?' disabled':'')+' title="Raise its depth by '+RB_ATT_STEP+' with Rift Shards">Attune &middot; '+attuneCost(it)+' shards</button>';   // a Riftborn piece (game-rift.js)
const dust=n=>'<span class="dust-n">'+n.toLocaleString()+' dust</span>';
function hfSwapHTML(it){   // a heartforged piece: a second heart of its boss swaps one line (game-forge.js)
  if(!it||!it.hf||S.mode!=='town'||!it.ro) return ''; const n=S.trophies[hfKey(it.hf)]||0, open=ui.hfsw===it.u;
  let h='<button class="btn small" data-a="hfsw" data-k="'+it.u+'" aria-expanded="'+open+'"'+(n?'':' disabled')+' title="A heart of '+it.hf+' swaps one line for another of its list">Swap a line &middot; 1 heart ('+n+')</button>';
  if(open&&n){ const left=hfLinesFor(it.hf,ITEM[it.id].slot).filter(k=>!it.ro.some(r=>r[0]===k));
    h+='<div class="ench">'+it.ro.map((r,i)=>left.map(k=>'<button class="btn small" data-a="hfswap" data-k="'+it.u+'|'+i+'|'+k+'">'+statTxt(r[0],r[1])+' &rarr; '+statTxt(k,hfLineVal(hfInfo(it.hf),k))+'</button>').join('')).join('')+'</div>'; }
  return h;
}
function heartforgeHTML(bagFull){   // the Heartforge (game-forge.js): pick a heart, a slot and its lines
  const hs=hfHearts(); let h='<p class="group-h">Heartforge</p>'+brief('hforge','A boss, warden, secret master or Hunger heart, gold and bone dust forge a piece of its set in the slot you pick, with the bonus lines you choose from the boss\'s six, at the top of their range. Secret masters and the Hunger add a minor power. Reforging keeps the lines; a second heart swaps one.','q-note');
  if(!hs.length) return h+'<p class="q-note">You hold no heart that the forge can use yet.</p>';
  const boss=hs.includes(hfKey(ui.hfB))?ui.hfB:hs[0].slice(2), I=hfInfo(boss), slot=SLOTS[ui.hfS]?ui.hfS:'weapon', ok=hfLinesFor(boss,slot), want=I.n-(I.pw?1:0), sel=(ui.hfL||[]).filter(k=>ok.includes(k)).slice(0,want), c=hfCost(boss);
  h+='<div class="chips">'+hs.map(k=>'<button class="btn small'+(k.slice(2)===boss?' primary':'')+'" data-a="hfb" data-k="'+k.slice(2)+'" aria-pressed="'+(k.slice(2)===boss)+'">'+TROPHY[k].name+' &times;'+S.trophies[k]+'</button>').join('')+'</div>';
  h+='<div class="chips">'+GEAR_SLOTS.map(sl=>'<button class="btn small'+(sl===slot?' primary':'')+'" data-a="hfs" data-k="'+sl+'" aria-pressed="'+(sl===slot)+'">'+SLOTS[sl]+'</button>').join('')+'</div>';
  h+='<p class="q-note">Pick '+want+' line'+(want>1?'s':'')+(I.pw?', plus '+HF_POW[I.pw].name+': '+HF_POW[I.pw].desc:'')+'</p><div class="chips">'+ok.map(k=>'<button class="btn small'+(sel.includes(k)?' primary':'')+'" data-a="hfl" data-k="'+k+'" aria-pressed="'+sel.includes(k)+'">'+statTxt(k,hfLineVal(I,k))+'</button>').join('')+'</div>';
  const can=hfCan(boss,slot,sel), guard=hfGuard(boss), conf=ui.confirm==='hf';
  return h+'<div class="btns"><button class="btn small '+(guard?'warn':'primary')+'" data-a="hforge"'+(can?'':' disabled')+'>'+(conf?'Press again: a unique you hold still needs this heart':'Forge &middot; '+gold(c.g)+' &middot; '+dust(c.d))+'</button>'+(bagFull?'<span class="q-note bad">Your bag is full.</span>':'')+'</div>';
}
function enchBtn(it){   // Enchant opens the choices: add a line (if there is room) or re-roll one line
  if(ITEM[it.id].uq||it.hf||S.mode!=='town'||!workOpen()) return hfSwapHTML(it);
  const open=ui.ench===it.u, c=enchCost(it), poor=(S.dust||0)<c, ro=it.ro||[];
  let h='<button class="btn small" data-a="ench" data-k="'+it.u+'" aria-expanded="'+open+'" title="Spend bone dust on its bonus lines">Enchant</button>';
  if(open) h+='<div class="ench">'+(ro.length<lineMax(it)?'<button class="btn small primary" data-a="enchadd" data-k="'+it.u+'"'+(poor?' disabled':'')+'>Add a line &middot; '+dust(c)+'</button>':'')
    +ro.map((r,i)=>'<button class="btn small" data-a="enchline" data-k="'+it.u+'|'+i+'"'+(poor?' disabled':'')+'>Re-roll '+statTxt(r[0],r[1])+' &middot; '+dust(c)+'</button>'+temperBtn(it,i)).join('')
    +(!ro.length&&!lineMax(it)?'<span class="u-sub">Common gear has no room for a bonus line.</span>':'')+'</div>';
  return h;
}
function awakenBtn(it){   // a unique: gold, bone dust and its boss's hearts raise its own stats a rank (game-phases-town.js AWAKENING)
  if(!workOpen()) return ''; const c=awakenCost(it); if(!c) return '<span class="u-sub">Fully awakened</span>';
  const T=TROPHY[c.key], have=S.trophies[c.key]||0;
  return '<button class="btn small" data-a="awaken" data-k="'+it.u+'"'+(canAwaken(it)?'':' disabled')+' title="'+AWAKEN_TXT+'">Awaken '+AWAKEN_RN[(it.aw|0)+1]+' &middot; '+gold(c.g)+' &middot; '+dust(c.d)+' &middot; '+(T?T.name:'hearts')+' '+have+'/'+c.h+'</button>'; }
function temperBtn(it,i){ const r=it.ro[i], to=temperTo(it,i), mx=rollMax(it,r[0]), c=temperCost(it);   // gold moves a line toward its best roll
  return to==null?'<span class="u-sub">'+statTxt(r[0],r[1])+': at its best</span>':'<button class="btn small" data-a="temper" data-k="'+it.u+'|'+i+'"'+(S.gold<c?' disabled':'')+' title="Move this line a quarter of the way to its best roll">Temper: '+r[1]+' &rarr; '+to+' (max '+mx+') &middot; '+gold(c)+'</button>'; }
const pc=p=>{ p*=100; return (p>=10?p.toFixed(0):p>=1?p.toFixed(1):p.toFixed(2))+'%'; };
function equipHTML(){
  const locked=S.mode==='battle';
  const rows=['weapon','armor','relic'].map(sl=>{ const it=S.equip[sl];
    return it?itemCard(it,locked?'':'<button class="btn small" data-a="unequip" data-k="'+sl+'">Unequip</button>'+reforgeBtn(it)):'<div class="gempty">No '+SLOTS[sl].toLowerCase()+' equipped.</div>'; }).join('');
  const sets=SET_NAMES.map((n,i)=>({n,i,c:setCount(i)})).filter(x=>x.c>=2);
  return '<section class="win'+foldCls('equip')+'" aria-labelledby="h-gear"><h2 class="win-h" id="h-gear">Equipment<span class="fold-sum">'+GEAR_SLOTS.filter(sl=>S.equip[sl]).length+'/3 worn</span>'+foldBtn('equip')+'</h2><div class="items">'+rows+'</div>'
   +(sets.length?sets.map(x=>'<p class="q-note ok">'+x.n+' set ('+x.c+'/3): '+buffTxt(SET_BONUS[x.i][2])+(x.c>=3?', '+buffTxt(SET_BONUS[x.i][3]):'')+'</p>').join(''):'')
   +USET.map((U,i)=>({U,c:usetCount(i)})).filter(x=>x.c>=2).map(x=>'<p class="q-note uset-on">'+x.U.name+' ('+x.c+'/3): '+buffTxt(x.U.b[2])+(x.c>=3?', '+buffTxt(x.U.b[3]):'')+'</p>').join('')+(locked?'<p class="q-note">Gear is locked while you fight.</p>':'')+'</section>';
}
function loadoutHTML(){   // three named setups on the Gear tab, in town once the Town tab is open: Use is one press, Save over a stored one is two
  if(S.mode!=='town'||!townOpen()) return ''; const LS=Array.isArray(S.loadouts)?S.loadouts:[];
  return '<section class="win lo-w" aria-labelledby="h-lo"><h2 class="win-h" id="h-lo">Loadouts</h2><div class="lo-strip">'+Array.from({length:LOADOUT_N},(x,i)=>{ const L=LS[i]||{}, s=L.s, conf=ui.confirm==='lo'+i;
    return '<div class="lo-slot'+(s?'':' empty')+'">'+(ui.lren===i?'<div class="rn-row"><input id="lrn" class="rn-in" maxlength="'+NICK_MAX+'" value="'+cleanNick(ui.lrn==null?loadoutName(i):ui.lrn)+'" aria-label="New name for '+loadoutName(i)+'"><button class="btn small primary" data-a="loren" data-k="'+i+'">Save</button><button class="btn small" data-a="lorenx">Cancel</button></div>'
       :'<b class="lo-n">'+loadoutName(i)+'</b>')
     +'<span class="u-sub">'+(s?GEAR_SLOTS.filter(sl=>s.gear&&s.gear[sl]).length+' worn &middot; '+s.army.length+' in the army':'Empty')+'</span>'
     +'<div class="lo-btns"><button class="btn small primary" data-a="louse" data-k="'+i+'"'+(s?'':' disabled')+'>Use</button><button class="btn small'+(conf?' warn':'')+'" data-a="losave" data-k="'+i+'">'+(conf?'Confirm':'Save here')+'</button>'
     +(ui.lren===i?'':'<button class="linkbtn" data-a="loreno" data-k="'+i+'">Rename</button>')+'</div></div>'; }).join('')+'</div></section>';
}
const BAG_SORTS={tier:'Best first',slot:'By slot',new:'Newest'};
function sortedBag(){
  const by=ui.sort||'tier', D=it=>ITEM[it.id], score=it=>D(it).tier*100+D(it).set*10+((it.ro&&it.ro.length)||0);
  const order={weapon:0,armor:1,relic:2};
  return S.inv.slice().sort(by==='new'?(a,b)=>b.u-a.u:by==='slot'?(a,b)=>order[D(a).slot]-order[D(b).slot]||score(b)-score(a):(a,b)=>score(b)-score(a)||D(a).name.localeCompare(D(b).name));
}
function junkHTML(){
  const j=S.inv.filter(isJunk); if(!j.length||S.mode!=='town') return '';
  const g=j.reduce((a,it)=>a+sellValue(it),0);
  return '<button class="btn small warn" data-a="junk">'+(ui.confirm==='junk'?'Press again to sell '+j.length+' for '+gold(g):'Sell junk ('+j.length+' Common and Uncommon) &middot; '+gold(g))+'</button>';
}
function tierBulkHTML(kind){   // kind 'sell' or 'salv'
  if(S.mode!=='town'||(kind==='salv'&&!workOpen())) return '';
  return BULK_TIERS.map(t=>{ const lot=tierLot(t); if(!lot.length) return ''; const key=(kind==='sell'?'st':'sv')+t;
    const v=lot.reduce((a,it)=>a+(kind==='sell'?sellValue(it):dustValue(it)),0), price=kind==='sell'?gold(v):dust(v);
    return '<button class="btn small bulk t'+t+'" data-a="'+(kind==='sell'?'selltier':'salvtier')+'" data-k="'+t+'">'+(ui.confirm===key?'Press again: '+lot.length+' for '+price:(kind==='sell'?'Sell':'Salvage')+' '+TIERS[t]+' ('+lot.length+') &middot; '+price)+'</button>'; }).join(''); }
function salvJunkHTML(){
  const j=S.inv.filter(isJunk); if(!j.length||S.mode!=='town'||!workOpen()) return '';
  const n=j.reduce((a,it)=>a+dustValue(it),0);
  return '<button class="btn small" data-a="sjunk">'+(ui.confirm==='sjunk'?'Press again to salvage '+j.length+' for '+dust(n):'Salvage junk &middot; '+dust(n))+'</button>';
}
function bagHTML(){
  const rows=sortedBag().map(it=>{ const d=ITEM[it.id], cur=S.equip[d.slot], conf=ui.confirm==='d'+it.u;
    return itemCard(it,'<button class="btn small primary" data-a="equip" data-k="'+it.u+'">'+(cur?'Swap':'Equip')+'</button>'+(d.uq?'':lockBtn(it))
      +reforgeBtn(it)
      +(d.uq||it.lk?'':(workOpen()?'<button class="btn small" data-a="salvage" data-k="'+it.u+'" title="Break it into bone dust">Salvage &middot; '
        +dust(dustValue(it))+'</button>':'')
        +'<button class="btn small warn" data-a="discard" data-k="'+it.u+'">'+(conf?'Confirm':'Discard')+'</button>'),true); }).join('');
  return '<section class="win" aria-labelledby="h-bag"><h2 class="win-h" id="h-bag">Bag '+S.inv.length+'/'+bagMax()+(workOpen()?' &middot; '+dust(S.dust||0):'')+'</h2>'
   +'<p class="lede">Uniques ignore the bag limit. Green lines are bonus rolls.</p>'
   +(ui.msg&&ui.msg.mk?'<div class="note '+(ui.msg.c||'')+'"><span>'+ui.msg.m+'</span></div>':'')
   +(S.inv.length?'<div class="bag-tools">Sort: '+Object.keys(BAG_SORTS).map(k=>'<button class="linkbtn" data-a="sort" data-k="'+k+'" aria-pressed="'+((ui.sort||'tier')===k)+'">'+BAG_SORTS[k]+'</button>').join('')+junkHTML()+salvJunkHTML()+tierBulkHTML('salv')+'</div>':'')
   +(rows?'<div class="items">'+rows+'</div>':'<p class="lede">Empty. Kill things and clear rooms to fill it.</p>')+'</section>';
}
const traitTip=(m,t)=>TRAITS[t].desc+(TRAITS[t].story?' '+TRAITS[t].story:'')+(m.cd&&CORPSE_CONDS[m.cd]&&CORPSE_CONDS[m.cd].trait===t?' '+CORPSE_CONDS[m.cd].story:'');   // a death trait tells how its body died
function traitChips(m){
  const stage=m.stage||0, next=evoNext(m);
  return '<div class="traits">'+(m.traits||[]).map(t=>'<span class="trait'+(t==='commander'?' cmdr':'')+'" title="'+traitTip(m,t)+'">'+TRAITS[t].name+'</span>').join('')+(m.recl?'<span class="trait recl" title="Won back from the rival: +'+Math.round(RECL_K*100)+'% to its stats">Reclaimed</span>':'')+markChips(m)+bondChips(m)
    +(next!=null?'<span class="evo">Evolves at Lv '+next+'</span>':stage===STAGE_MAX?'<span class="evo">Eternal</span>':'')+'</div>';
}
function markChips(m){   // evolution marks: one chip per mark (empowered ones say so), and a waiting choice
  return [...new Set(m.marks||[])].map(k=>'<span class="trait mark" title="'+markDesc(m,k)+'">'+MARK[k].name+(markLv(m,k)>1?' (empowered)':'')+'</span>').join('')
    +(markPend(m)?'<span class="trait mark-pend" title="Choose its mark out of battle, in the Marks section of the Army tab">Ready to choose</span>':'');
}
function besExtra(tkey,abil){   // trophy and boss move, shown on every opened bestiary entry (known from the first kill)
  const t=TROPHY[tkey], A=abil&&BOSS_ABIL[abil];
  return '<div class="bes-extra">'+(t?'<div class="u-sub"><b>Trophy:</b> '+t.name+' &middot; '+gold(t.value)+' each'+(tkey.startsWith('b:')?' &middot; counts as 5 at the forge':'')+'</div>':'')
    +(A?'<div class="u-sub"><b>Signature move:</b> '+A.name+(A.warn?' (telegraphed)':'')+' &middot; '+A.desc+'</div>':'')+'</div>';
}
function masteryLine(name){   // the bestiary's mastery line: tier, kills, progress to the next tier and what the tier gives
  const k=(S.kills&&S.kills[name])||0, t=masteryOf(name), nx=masteryNext(name);
  return '<div class="u-sub bes-mastery">Mastery: '+(t?t.name:'None yet')+' &middot; '+k+' kills &middot; '+(nx?k+'/'+nx.at+' to '+nx.t.name:'Mastery complete')
    +(t?'<br><span class="dim">'+masteryGives(t)+'.</span>':'')+'</div>';
}
function masteryTag(name){   // a small marker on foe cards and bodies of a kind you have Mastered or Ledgered
  const t=masteryOf(name); if(!t||!t.dmg) return '';
  return ' &middot; <span class="mst dim" title="'+t.name+' in your bestiary: '+masteryGives(t)+'">'+t.name+'</span>';
}
function bestiaryHTML(){
  const all=[]; DUNGEONS.forEach(D=>{ D.mobs.forEach(m=>all.push(m[0])); all.push(D.boss[0]); });
  const kn=n=>(S.kills&&S.kills[n])||0;
  const met=all.filter(n=>kn(n)>0).length, studied=all.filter(n=>kn(n)>=KNOW_AT).length;
  let h='<section class="win" aria-labelledby="h-bes"><h2 class="win-h" id="h-bes">Bestiary &amp; drop tables</h2>'
   +'<p class="lede">Entries stay hidden until you kill the creature. Defeat one '+KNOW_AT+' times to study it and reveal its drop table. Ordinary enemies drop something 28% of the time, elites 65% with a lean toward better tiers, and bosses roll twice. Percentages are the share of drops.</p>'
   +'<div class="tiers-line">Met '+met+'/'+all.length+' &middot; Studied '+studied+'/'+all.length+'</div>';
  DUNGEONS.forEach((D,di)=>{
    const list=D.mobs.map(m=>({name:m[0],role:m[1],boss:false})).concat([{name:D.boss[0],role:D.boss[1],boss:true}]).concat(SECRET[di]&&kn(SECRET[di].name)>0?[{name:SECRET[di].name,role:'reaper',boss:true,secret:true}]:[]);
    const anyStudied=list.some(e=>kn(e.name)>=KNOW_AT);
    h+='<div class="bes-gate"><div class="bes-h"><div class="badge r'+di+'">'+RANKS[di]+'</div><div><h3>'+D.name+'</h3><div class="tiers-line">'+(anyStudied?TIER_W[di].map((w,t)=>w?TIERS[t]+' '+w+'%':'').filter(Boolean).join(' &middot; '):'Tier mix unknown. Study an enemy here to learn it.')+'</div></div></div>';
    list.forEach(e=>{
      const k=kn(e.name), isStudied=k>=KNOW_AT, open=ui.bes===e.name;
      if(k<=0){
        h+='<div class="bes-row locked"><span class="ico unk" aria-hidden="true"><svg viewBox="0 0 64 64">'+IC['?']+'</svg></span><div><div class="u-name">???</div><div class="u-sub">Unknown. Defeat it to add it to the ledger.</div></div><span class="u-tag">Locked</span></div>';
        return;
      }
      const rolls=e.boss?'2 rolls (100% and 60%)':'28% per kill';
      h+='<button class="bes-row" data-a="bes" data-k="'+e.name+'" aria-expanded="'+open+'">'+ico(e.name,di,{boss:e.boss,role:e.role,secret:e.secret})
        +'<div><div class="u-name">'+e.name+'</div><div class="u-sub">'+ROLES[e.role].label+(isArmed(e.name)?' &middot; Gear-bearer':'')+' &middot; '
        +(isStudied?rolls:'Kills '+k+'/'+KNOW_AT+' &middot; drops unknown')+'</div>'+masteryLine(e.name)+'</div><span class="u-tag">'
        +(open?'Hide':(isStudied?'Drops':'Study'))+'</span></button>';
      if(!open) return;
      h+=besExtra(e.boss?'b:'+e.name:e.name, e.boss?GATE_ABIL[di]:null);
      if(isStudied){
        const rows=tableFor(di,e.role,e.boss,false,SIG[e.name]).filter(r=>r.p>0).sort((a,b)=>ITEM[b.id].tier-ITEM[a.id].tier||b.p-a.p);
        h+='<div class="bes-table">'+rows.map(r=>{ const d=ITEM[r.id]; return '<div class="drop t'+d.tier+'"><span class="tn">'+d.name+'</span><span class="u-tag">'+TIERS[d.tier]+' '+SLOTS[d.slot]+'</span><span class="num">'+pc(r.p)+'</span><div class="dbar"><i style="width:'+Math.max(1.5,r.p*100)+'%"></i></div></div>'; }).join('')+'</div>';
      } else {
        h+='<div class="bes-table"><div class="u-sub">Its drops are still a mystery. Defeat '+e.name+' '+(KNOW_AT-k)+' more time'+(KNOW_AT-k===1?'':'s')+' to study it.</div>'
         +'<div class="bar"><i class="fill xp" style="width:'+pct(k,KNOW_AT)+'%"></i></div>'
         +['','',''].map(()=>'<div class="drop"><span class="dim">???</span><span class="u-tag">???</span><span class="num dim">??%</span></div>').join('')+'</div>';
      }
    });
    h+='</div>';
  });
  h+=rivalBesHTML();
  // Hell Tower
  const twList=TW_MOBS.map(m=>({name:m[0],role:m[1],boss:false})).concat(TW_BOSS.map(n=>({name:n,role:'vanguard',boss:true})));
  h+='<div class="bes-gate"><div class="bes-h"><div class="badge" style="color:#ff8a6a">T</div><div><h3>The Hell Tower</h3><div class="tiers-line">Drops improve with every floor. Studied entries show the tier mix at several heights.</div></div></div>';
  twList.forEach(e=>{
    const k=kn(e.name), isStudied=k>=KNOW_AT, open=ui.bes===e.name;
    if(k<=0){ h+='<div class="bes-row locked"><span class="ico unk" aria-hidden="true"><svg viewBox="0 0 64 64">'+IC['?']+'</svg></span><div><div class="u-name">???</div><div class="u-sub">Unknown. Defeat it to add it to the ledger.</div></div><span class="u-tag">Unseen</span></div>'; return; }
    h+='<button class="bes-row" data-a="bes" data-k="'+e.name+'" aria-expanded="'+open+'">'+ico(e.name,5,{boss:e.boss,role:e.boss?'reaper':e.role})
      +'<div><div class="u-name">'+e.name+'</div><div class="u-sub">'
      +(e.boss?'Warden':ROLES[e.role].label+(isArmed(e.name)?' &middot; Gear-bearer':''))+' &middot; '+(isStudied?'Studied':'Kills '+k+'/'+KNOW_AT)
      +'</div>'+masteryLine(e.name)+'</div><span class="u-tag">'+(open?'Hide':'Open')+'</span></button>';
    if(!open) return;
    h+=besExtra(e.boss?'b:'+e.name:'t:'+e.name, e.boss?GATE_ABIL[TW_BOSS.indexOf(e.name)%GATE_ABIL.length]:null);
    if(isStudied){
      h+='<div class="bes-table">'+[1,25,50,75,100].map(f=>{ const rows=towerTable(f,e.role,e.boss,false), tot=[0,0,0,0,0]; rows.forEach(r=>{ tot[ITEM[r.id].tier]+=r.p; });
        return '<div class="u-sub num">Floor '+f+': '+tot.map((v,t)=>v>=.005?TIERS[t]+' '+Math.round(v*100)+'%':'').filter(Boolean).join(' &middot; ')+'</div>'; }).join('')
        +(e.boss?'<div class="u-sub">Its unique: guaranteed the first time, '+Math.round(TW.repeat*100)+'% after (gold instead while you carry one).</div>':'<div class="u-sub">Elites of this kind lean toward better tiers.</div>')+'</div>';
    } else {
      h+='<div class="bes-table"><div class="u-sub">Its drops are still a mystery. Defeat it '+(KNOW_AT-k)+' more time'+(KNOW_AT-k===1?'':'s')+' to study it.</div><div class="bar"><i class="fill xp" style="width:'+pct(k,KNOW_AT)+'%"></i></div></div>';
    }
  });
  h+='</div>';
  const liv=SIEGE_NAMES.filter(n=>kn(n)>0);   // the living who came in sieges: kills and mastery (their gear is the deepest gate's)
  if(liv.length) h+='<div class="bes-gate bes-living"><div class="bes-h"><div class="badge">&#9876;</div><div><h3>The living</h3><div class="tiers-line">They come in sieges and carry the deepest open gate\'s gear, at reduced odds.</div></div></div>'
    +liv.map(n=>{ const boss=n===SIEGE_BOSS, role=boss?'reaper':Object.keys(SIEGE_FOES).find(r=>SIEGE_FOES[r][0]===n);
      return '<div class="bes-row">'+ico(n,siegeGate(),{boss,role})+'<div><div class="u-name">'+n+'</div><div class="u-sub">'+ROLES[role].label+' &middot; Kills '+kn(n)+'</div>'+masteryLine(n)+'</div></div>'; }).join('')+'</div>';
  return h+'</section>';
}

// What one more point in a stat would change, worked out from the real formulas (shown next to each + button).
const GAIN_G={Strike:'atk','Max HP':'hp',Mana:'mana',Siphon:'siph',Ward:'ward',Slots:'slot',crit:'crit','armor pierce':'pierce','damage taken':'dr','healing received':'heal','skill damage':'skill','minion attack':'matk','minion HP':'mhp',raise:'raise',minions:'mpow'};
const GAIN_W={Slots:'Army slots',crit:'Crit chance',raise:'Raise chance',minions:'Minion power'};   // the glyph's full word where the gain's own word is short
function statGainList(k){   // [name, change, unit] for each thing one more point changes
  const P=S.player, f=()=>({Strike:pAtk(),'Max HP':pMax(),Mana:pMana(),Siphon:pSiph(),Ward:pWard(),Slots:slots()}),
    g=()=>({crit:strCrit(),'armor pierce':strPen()*100,'damage taken':-conDr(),'healing received':conHeal(),'skill damage':intSkill(),'minion attack':statMinion(),'minion HP':conMinion()});   // percent parts
  const a=f(), ga=g(); P.stats[k]++; const b=f(), gb=g(); P.stats[k]--;
  const out=Object.keys(a).filter(x=>b[x]!==a[x]).map(x=>[x,b[x]-a[x],'']);
  for(const x in ga){ const d=Math.round((gb[x]-ga[x])*100)/100; if(d) out.push([x,d,'%']); }
  if(k==='will') out.push(['raise',RAISE_WILL,'%'],['minions',2,'%']);
  return out;
}
const statGain=k=>statGainList(k).map(([x,d,u])=>x+' '+(d>0?'+':'')+d+u).join(', ');
const gainG=k=>statGainList(k).map(([x,d,u])=>'<span class="sv">'+sgl(GAIN_G[x],GAIN_W[x]||x[0].toUpperCase()+x.slice(1))+(d>0?'+':'')+d+u+'</span>').join(' ');
function statusHTML(){
  const P=S.player, st=P.stats, ri=pRankI();
  const rows=[['strength','Strength','Strike damage, crit chance, armor piercing, minion attack, Command',['atk','crit','pierce','matk']],['constitution','Constitution','Max HP, damage taken, healing received, minion HP, Command',['hp','dr','heal','mhp']],['intelligence','Intelligence','Mana, Siphon, Ward, skill damage, minion attack, Command',['mana','siph','ward','skill','matk']],['will','Will','Mana, army slots, raise odds, minion bond',['mana','slot','raise','mpow']]];
  const canAlloc=P.pts>0&&S.mode!=='battle';
  return '<section class="win" aria-labelledby="h-status"><h2 class="win-h" id="h-status">Status</h2>'
   +'<div class="id-row"><div class="badge r'+ri+'" title="Necromancer rank">'+RANKS[ri]+'</div><div><div class="who">Gravewalker</div>'+(faithOf()?'<div class="faith-l '+faithOf()+'" title="Devotion rank '+faithRank()+' of '+DEV_RANKS+'">'+FAITH[faithOf()].name+' &middot; '+faithRank()+'</div>':'')+(titleName()?'<div class="ttl" title="'+buffTxt(TITLE[S.ti.sel].b)+'">'+titleName()+'</div>':'')+'<div class="num dim" style="font-size:12px">Level '+P.lvl+'</div></div></div>'
   +'<div class="vials">'+vial('HP',P.hp,pMax(),'hp')+vial('Mana',P.mana,pMana(),'mp')+'</div>'+'<div class="xp-eng">'+meter('XP',P.xp,need(P.lvl),'xp')+'</div>'
   +((P.pts>0||P.sp>0)?'<div class="chips">'+(P.pts>0?'<span class="chip pts">'+P.pts+' unspent point'+(P.pts>1?'s':'')+'</span>':'')+(P.sp>0?'<span class="chip pts">'+P.sp+' skill point'+(P.sp>1?'s':'')+'</span>':'')+'</div>':'')
   +(remembered()?'<div class="chips"><span class="chip mem-buff" title="Honoured a fallen minion today">Remembered: +'+Math.round(MEM_HP*100)+'% minion max HP until dawn</span></div>':'')
   +pactChipsHTML()
   +'<div class="stats">'+rows.map(r=>'<div class="stat"><div>'+detl('st'+r[0],'<b>'+r[1]+'</b><span class="st-g">'+r[3].map(g=>sgl(g)).join('')+'</span>','<small>'+r[2]+'</small>'+(canAlloc?'<small>Next point: '+statGain(r[0])+'</small>':''),'sdesc',1)
      +(canAlloc?'<small class="gain">Next: '+gainG(r[0])+'</small>':'')+'</div><span class="val">'+st[r[0]]+(G(r[0])?'<small class="gb"> +'+G(r[0])+'</small>':'')+'</span>'
      +(canAlloc?'<button class="plus" data-a="alloc" data-k="'+r[0]+'" aria-label="Add a point to '+r[1]+'">+</button>':'<span class="plus-slot"></span>')+'</div>').join('')+'</div>'
   +'<div class="derived"><div>'+sgl('atk')+'<b>'+pAtk()+'</b></div><div>'+sgl('siph')+'<b>'+pSiph()+'</b></div><div>'+sgl('slot')+'<b>'+slots()+'</b></div></div>'
   +(cmdAtk()||cmdSiph()||cmdHp()?'<p class="cmd-line u-sub" title="Command: your hero draws on the power of your three strongest minions">Command: +'+cmdAtk()+' Strike, +'+cmdSiph()+' Siphon, +'+cmdHp()+' max HP</p>':'')
   +'</section>';
}
function questHTML(){
  if(ordersOn()) return ordersHTML();   /* daily orders (game-dread.js) */
  const q=S.quest, rows=[['Defeat foes',q.kills,QUEST.kills],['Clear rooms',q.rooms,QUEST.rooms],['Clear a dungeon',q.clears,QUEST.clears]];
  const done=questDone();
  return '<section class="win'+foldCls('quest')+'" aria-labelledby="h-quest"><h2 class="win-h" id="h-quest">Daily quest &middot; Day '+S.day+'<span class="fold-sum">'+(q.claimed?'claimed':done?'ready to claim':rows.filter(r=>r[1]>=r[2]).length+'/3')+'</span>'+foldBtn('quest')+'</h2>'
   +rows.map(r=>'<div class="q-row"><span class="box'+(r[1]>=r[2]?' on':'')+'"></span><span>'+r[0]+'</span><span class="num">'+Math.min(r[1],r[2])+'/'+r[2]+'</span></div>').join('')
   +(q.claimed?'<p class="q-note ok">Reward claimed for today.</p>':done?'<button class="btn primary" data-a="claim">Claim reward</button>':'<p class="q-note" title="Unfinished at dawn, it simply lapses.">Reward: +'+QUEST_PTS+' stat point'+(QUEST_PTS>1?'s':'')+' &middot; XP</p>')+'</section>';
}
function bountyHTML(){
  const list=bounties(), town=S.mode==='town';
  const rw=r=>[r.g?gold(r.g):'',r.salt?'Grave Salts':'',r.dust?dust(r.dust):'',r.gear?'a '+TIERS[SET_TIER[topGate()]]+' piece with bonus lines':''].filter(Boolean).join(' + ');
  return '<section class="win'+foldCls('bounty')+'" aria-labelledby="h-bty"><h2 class="win-h" id="h-bty">Bounty board<span class="fold-sum">'+list.filter(b=>bountyDone(b)&&!b.claimed).length+' ready</span>'+foldBtn('bounty')+'</h2>'
   +list.map((b,i)=>{ const got=Math.min(bountyGot(b),b.n), done=got>=b.n;
     return '<div class="b-row'+(b.claimed?' claimed':done?' done':'')+'"><span>'+BOUNTIES[b.id].t(b.n)+'</span><span class="num">'+got+'/'+b.n+'</span>'
      +'<span class="u-sub">'+(b.claimed?'Claimed.':'Pays '+rw(b.rw))+'</span>'
      +(done&&!b.claimed&&town?'<button class="btn small primary" data-a="claimb" data-k="'+i+'"'+(b.rw.gear&&S.inv.length>=bagMax()?' disabled title="Your bag is full"':'')+'>Claim</button>':'')+'</div>'; }).join('')
   +brief('bty','Up to '+BOUNTY_N+' contracts; a new one goes up each dawn while there is room. They never expire. Claim finished ones in town.','q-note')+commHTML()+'</section>';
}
const NOTE_N=2;
function notesHTML(){
  const tip=!!currentTip(), ns=S.notices.filter(n=>!(tip&&n.c==='story'));   // a story note waits under a tip: one guidance box at a time
  if(!ns.length) return '';
  const all=ui.notesAll||ns.length<=NOTE_N;   // newest first: the newest two, the rest one press away
  return '<div class="notes">'+(all?ns:ns.slice(0,NOTE_N)).map(n=>'<div class="note '+n.c+'"><span>'+n.m+'</span></div>').join('')
   +'<div class="note-acts">'+(ns.length>NOTE_N?'<button class="linkbtn" data-a="notesall" aria-expanded="'+all+'">'+(all?'Show fewer':'Show all ('+ns.length+')')+'</button>':'')+'<button class="linkbtn" data-a="dismiss">Dismiss</button></div></div>';
}
function armorTag(a){   // foe armor with its rule spelled out (pierceMul): hover text plus the same words for screen readers
  const p=Math.round(a*100), t='Foes shrug off '+p+'% of every hit you and your minions land. Piercing skills such as Bone Spear ignore part of it';
  return '<span class="armor-tag" title="'+t+'.">armor '+p+'%<span class="sr-only">. '+t+'.</span></span>';
}
function resTag(res,hits){   // where foes stand against your damage types (placeRes) and what their strikers hit with: chips with the rule in the hover
  res=res||{}; const nm=t=>'<b class="dt dt-'+t+'">'+DTYPE[t].name+'</b>', grp=(lab,l)=>l.length?'<span class="dt-g">'+lab+': '+l.map(nm).join(', ')+'</span>':'';
  const w=DT_IDS.filter(t=>res[t]<0), r=DT_IDS.filter(t=>res[t]>0&&res[t]<.5), rs=DT_IDS.filter(t=>res[t]>=.5);
  const parts=[grp('Weak',w),grp('Resists',r),grp('Resists strongly',rs),hits&&hits!=='phys'?grp('Strikers deal',[hits]):''].filter(Boolean); if(!parts.length) return '';
  return '<span class="dt-tag" title="Weak: takes 25% more damage of that type. Resists: takes 25% less. Resists strongly: takes 50% less. Strikers deal: the damage type of their hits; your resistance lines soften it.">'+parts.join(' &middot; ')+'</span>';
}
// A gate tile's painted marks: a hooded shape for a boss not yet met, chains and a padlock over a sealed gate, skulls for each difficulty (one on Normal, four on Nightmare).
const G_UNKNOWN='<svg viewBox="0 0 64 64"><path d="M32 7C21 7 15 16 15 27c0 7-3 11-7 15 5 3 7 9 7 18h34c0-9 2-15 7-18-4-4-7-8-7-15C49 16 43 7 32 7Z" fill="#050403"/><path d="M22 30c2-9 6-13 10-13s8 4 10 13c-3-2-6-3-10-3s-7 1-10 3Z" fill="#000"/></svg><b>?</b>';
const G_SEAL='<svg class="g-seal" viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M-10 6L210 94M-10 94L210 6" stroke="#0a0806" stroke-width="9" stroke-dasharray="14 5"/><path d="M-10 6L210 94M-10 94L210 6" stroke="#6a5a44" stroke-opacity=".5" stroke-width="2" stroke-dasharray="14 5" stroke-dashoffset="7"/></svg><svg class="g-lock" viewBox="0 0 24 28"><path d="M6 13V9a6 6 0 0 1 12 0v4" stroke="#3a3128" stroke-width="3" fill="none"/><rect x="3" y="13" width="18" height="14" rx="2" fill="#1a1612" stroke="#5a4a38"/><path d="M12 18v4" stroke="#000" stroke-width="2.4"/></svg>';
const HEAT_SKULL='<svg viewBox="0 0 10 10"><path d="M5 .8C2.5.8 1 2.5 1 4.6c0 1.3.6 2.2 1.5 2.7V9.2h5V7.3C8.4 6.8 9 5.9 9 4.6 9 2.5 7.5.8 5 .8Z"/><circle cx="3.5" cy="4.9" r="1.1" fill="#0a0806"/><circle cx="6.5" cy="4.9" r="1.1" fill="#0a0806"/></svg>';
const heatMarks=lv=>'<i class="hm h'+lv+'" aria-hidden="true">'+HEAT_SKULL.repeat(lv+1)+'</i>';
const bossMet=i=>metName(DUNGEONS[i].boss[0])||!!(S.ti&&S.ti.clr&&S.ti.clr[i]);   // a gate's boss stays ??? on its card until you have met or beaten it
const gateStars=i=>HEAT.map((x,lv)=>lv?!!(S.heatMax&&S.heatMax[i]>=lv):!!(S.ti&&S.ti.clr&&S.ti.clr[i]));   // cleared on Normal, Hard, Brutal, Nightmare
function inscChips(){ const o=inscOffer(); return o.length?'<p class="group-h">Write one inscription &middot; it stays in the Ledger for every cycle to come</p><div class="insc-list">'+o.map(id=>{ const I=INSCRIPTIONS[id]; return '<button class="btn small" data-a="inscribe" data-k="'+id+'" title="Earned: '+I.need+'"><b>'+I.name+'</b> &middot; '+I.desc+'</button>'; }).join('')+'</div>':''; }
function lastPageHTML(){   // the Hunger has fallen: the Ledger open at its last page (chooseEnding, inscribe in game-abbey.js)
  if(!S.ending) return '<section class="win last-page" aria-labelledby="h-lp"><h2 class="win-h" id="h-lp">The last page</h2><h3 class="win-title">The Ledger lies open, and the pen is in your hand</h3>'
    +'<p class="lede">The Hunger is gone. What is left is a blank page and a choice Oswin never made. Answer now, or leave it: the page waits, and the gates stay open.</p><div class="lp-choices">'
    +Object.entries(ENDINGS).map(([k,E])=>'<div class="lp-choice"><h4>'+E.name+'</h4><p class="lp-line">&ldquo;'+E.line+'&rdquo;</p><p class="dim">Title: '+E.title+'. New Game+ becomes '+E.cycle+': '+E.ngp+'</p><button class="btn '+(ui.confirm==='end:'+k?'warn':'primary')+'" data-a="ending" data-k="'+k+'">'+(ui.confirm==='end:'+k?'Press again: '+E.name.toLowerCase():E.name)+'</button></div>').join('')
    +'</div><div class="btns"><button class="btn small" data-a="lplater">Not yet</button></div></section>';
  const st=STORY_BY[S.ending.k==='closed'?'end_closed':'end_kept'];
  return '<section class="win last-page" aria-labelledby="h-lp"><h2 class="win-h" id="h-lp">'+ENDINGS[S.ending.k].name+'</h2><h3 class="win-title">'+st.t+'</h3><p class="lp-text">'+st.m+'</p><p class="lp-text">'+S.ending.v+'</p>'
    +inscChips()+'<p class="q-note">You can keep playing this cycle. New Game+ (Ledger tab, Settings) now begins '+ENDINGS[S.ending.k].cycle+'.</p><div class="btns"><button class="btn primary" data-a="lpseen">Close the Ledger</button></div></section>';
}
function lastPageBanner(){
  if(!S.lastPage||S.mode!=='town') return '';
  if(!S.ending) return '<div class="note story lp-banner"><i>Ledger</i><span>The last page waits for your answer.</span><button class="btn small" data-a="lpopen">Open the Ledger</button></div>';
  return inscOffer().length?'<div class="note story lp-banner"><i>Ledger</i><span>An inscription waits to be written.</span><button class="btn small" data-a="lpopen">Open the Ledger</button></div>':'';
}
function abbeyDoorHTML(){   // Vane Abbey while sealed (game-abbey.js): the drowned door and its two key slots, either one opens it
  const D=DUNGEONS[ABBEY], A=abbeyState(), GL=BOSS_LOOK[D.boss[0]]||['#1a1714','#5a4a3a'];
  const slot=k=>{ const K=ABBEY_KEYS[k], ps=K.parts(), n=ps.filter(p=>p[1]).length; return '<div class="key-slot'+(A.keys[k]?' on':'')+'"><b>'+K.name+'</b> <span class="dim num">'+n+'/'+ps.length+'</span><ul>'+ps.map(p=>'<li class="'+(p[1]?'ok':'dim')+'"><i aria-hidden="true">'+(p[1]?'&#10003;':'&#9675;')+'</i> '+p[0]+'</li>').join('')+'</ul></div>'; };
  return '<div class="gate locked abbey-door" style="--g1:'+GL[0]+';--g2:'+GL[1]+'"><div class="g-head gs-g'+ABBEY+'" aria-hidden="true">'+G_SEAL+'<span class="g-sealtxt">Sealed &middot; two keys</span></div>'
   +'<div class="badge r'+ABBEY+'">'+RANKS[ABBEY]+'</div><div class="g-body"><h3>'+D.name+'</h3><p>'+D.blurb+'</p>'
   +'<p class="lede">A door in the riverbed, bound in chain. Either key opens it.</p><div class="key-slots">'+abbeyKeyIds().map(slot).join('')+'</div></div>'
   +'<button class="btn" disabled>Sealed</button></div>';
}
function rwLineHTML(i){   // the gate the Ledger wrote over this cycle (game-asc.js)
  const W=S.asc&&S.asc.rw; if(rwGate()!==i||!W) return '';
  return '<div role="note" class="curse-line rw-line" title="This cycle the Ledger wrote over this gate. Its boss is in Ledger form with '+BOSS_ABIL[W.mv].name+' borrowed from another gate, its heart paid twice. '+W.foes.map((k,j)=>'Ink-Wet '+k+': '+KITS[W.kits[j]].name).join('; ')+', 15% more HP, trophies twice.'+'"><b class="curse-tag rw-tag"><i aria-hidden="true">&#10070;</i> Written over</b> '+(W.clr?'Cleared this cycle':'Ledger-form boss &middot; two Ink-Wet kinds')+'</div>';
}
function gateHTML(i){
  if(i===ABBEY&&!abbeyOpen()) return throneDown()?abbeyDoorHTML():'';   // the seventh gate shows once the Throne of Ash has fallen
  const D=DUNGEONS[i], R=RK[i], P=S.player, locked=gateLocked(i), rec=tierRec(i,locked?0:heatOf(i)), diff=P.lvl-rec;   // advice and label follow the difficulty picked on the card
  const danger=locked?'Locked':diff<-2?'Deadly':diff<0?'Hard':diff<=3?'Fair':'Easy', met=bossMet(i), stars=gateStars(i), best=S.rec&&S.rec.fast&&S.rec.fast[i], det=ui.gdet===i;
  const GL=BOSS_LOOK[D.boss[0]]||['#1a1714','#5a4a3a']; scThumbs();
  return '<div class="gate'+(locked?' locked':'')+(gateMod(i)?' cursed':'')+'" style="--g1:'+GL[0]+';--g2:'+GL[1]+'">'
   +'<div class="g-head gs-g'+i+'" aria-hidden="true">'+(locked?G_SEAL+'<span class="g-sealtxt">Sealed &middot; Lv '+R.unlock+'</span>':'')   /* the painted place, its boss once met; text here repeats the card, so screen readers skip it */
   +(met?'<span class="g-por gate-mark">'+ico(D.boss[0],i,{boss:true})+'</span>':'<span class="g-por unknown">'+G_UNKNOWN+'</span>')+'</div>'
   +'<div class="badge r'+i+'">'+RANKS[i]+'</div><div class="g-body"><h3>'+D.name+'</h3>'
   +(gateMod(i)?(M=>'<div role="note" class="curse-line" title="Cursed: '+M.name+'. '+M.desc+' '+MOD_REWARD+'"><b class="curse-tag"><i aria-hidden="true">&#9760;</i> '+M.name+'</b> Foes +'+Math.round((CURSE_FOE-1)*100)+'% &middot; gold x'+MOD_GOLD+' &middot; XP +'+Math.round((MOD_XP-1)*100)+'% &middot; gear +'+Math.round((MOD_DROP-1)*100)+'%'+(S.ti&&S.ti.clr&&S.ti.clr[5]&&P.lvl-CURSE_GAP>RK[i].lv?' &middot; Foes Lv '+(P.lvl-CURSE_GAP):'')+'</div>')(MODS[gateMod(i)]):'')
   +rwLineHTML(i)+'<div class="g-stars" role="list" aria-label="Clears by difficulty">'+HEAT.map((x,lv)=>'<span role="listitem" class="g-star h'+lv+(stars[lv]?' on':'')+'" title="'+x.name+(stars[lv]?': cleared':': not cleared yet')+'">'+'<i aria-hidden="true">'+(stars[lv]?'&#9733;':'&#9734;')+'</i> '+x.name+'</span>').join('')
   +(best?'<span class="g-best" title="Your fastest clear of this gate, day '+best.day+(best.heat?', '+HEAT[best.heat].name:'')+'">Best '+best.t+' turns</span>':'')+'</div>'
   +'<p>'+D.blurb+'</p>'
   +'<div class="meta">'+(locked?'Opens at level '+R.unlock:'<span class="danger-'+danger.toLowerCase()+'">'+danger+' for you</span>')+' &middot; <span class="rec-lv" title="Most necromancers clear this gate'+(heatOf(i)&&!locked?' on '+HEAT[heatOf(i)].name:'')+' from this hero level">Recommended Lv '+rec+'+</span>'
   +(DIFF.armor[i]?' &middot; '+armorTag(DIFF.armor[i]):'')+' &middot; '+resTag(GATE_RES[i],GATE_HITS[i])+' &middot; Boss: <b>'+(met?D.boss[0]:'???')+'</b>'
   +(S.mode==='town'&&raidGates().includes(i)&&bestSquad()&&!raidOrders().length?(sq=>'<div class="raid-odds" title="'+sq[0].nick+' and '+(sq.length-1)+' of your strongest; set the squad on the War table">Raid odds '+Math.round(raidOdds(sq,i)*100)+'%</div>')(bestSquad()):'')
   +heatHTML(i)+(gateFarm(i)<1?'<div class="farm-line dim" title="Rewards here '+Math.round(gateFarm(i)*100)+'% on Normal at your level; Hard and up pay in full.">Rewards '+Math.round(gateFarm(i)*100)+'% &middot; Hard+ full</div>':'')+'</div>'
   +'<button class="linkbtn g-detb" data-a="gdet" data-k="'+i+'" aria-expanded="'+det+'">'+(det?'Hide details':'Details')+'</button>'+(det?gateDetHTML(i):'')+'</div>'
   +'<button class="btn '+(locked?'':'primary')+'" data-a="enter" data-k="'+i+'"'+(locked?' disabled':'')+'>'+(locked?'Reach Lv '+R.unlock:'Enter'+(heatOf(i)?' &middot; '+HEAT[heatOf(i)].name:''))+'</button>'
   +(sweepOk(i)?'<button class="btn sweep-b" data-a="sweep" data-k="'+i+'" title="Win the whole run at once: one watch, kill XP at '+Math.round(SWEEP_XP*100)+'%, gold, trophies and gear as usual; nothing raised, no events or doors. A secret master or the rival stops it at the boss room.">Sweep &middot; 1 watch</button>':'')+'</div>';
}
function gateDetHTML(i){   // a gate card's Details: the boss (painted once met), study progress and what the gate pays
  const D=DUNGEONS[i], kn=n=>(S.kills&&S.kills[n])||0, foes=D.mobs.map(m=>m[0]).concat([D.boss[0]]), studied=foes.filter(n=>kn(n)>=KNOW_AT).length, met=bossMet(i), H=HEAT[heatOf(i)];
  const boss=met?'<span class="g-boss">'+ico(D.boss[0],i,{boss:true})+'</span>':'<span class="g-boss unknown" aria-hidden="true">?</span>';
  const st=S.ti&&S.ti.clr&&S.ti.clr[i]?'Beaten':met?'Met, not yet beaten':'Unknown: reach its room to see it';
  return '<div class="g-det">'+boss+'<div class="g-rows">'
   +'<div><b>Boss</b><span>'+(met?D.boss[0]+' &middot; '+ROLES[D.boss[1]].label:'???')+' &middot; '+st+'</span></div>'
   +'<div><b>Studied</b><span>'+studied+'/'+foes.length+' foes'+(studied<foes.length?' &middot; '+KNOW_AT+' kills each to study':'')+'</span></div>'
   +'<div><b>Gear</b><span>'+(studied?TIER_W[i].map((w,t)=>w?TIERS[t]+' '+w+'%':'').filter(Boolean).join(' &middot; '):'Tier mix unknown. Study an enemy here to learn it.')+(H&&heatOf(i)?' &middot; x'+H.drop+' on '+H.name:'')+'</span></div>'
   +(heatOf(i)?'<div class="g-rules"><b>Rules</b><span>'+heatRules(heatOf(i)).join(' ')+'</span></div>':'')
   +'<div><b>Clear bonus</b><span>'+Math.round(RK[i].clear*gateFarm(i)).toLocaleString()+' XP</span></div>'
   +'</div></div>';
}
function heatHTML(i){   // difficulty picker on a cleared gate's card
  const mx=heatMax(i); if(!mx) return '';
  const cur=heatOf(i), H=HEAT[cur], nm=T_('nm'+i);
  return '<div class="heat" role="group" aria-label="Difficulty">'+HEAT.map((x,lv)=>'<button class="chip-btn'+(lv===cur?' on':'')+'" data-a="heat" data-k="'+i+'|'+lv+'"'+(lv>mx?' disabled title="Clear the gate on '+HEAT[lv-1].name+' first"':lv?' title="'+heatRules(lv).join(' ')+'"':'')+' aria-pressed="'+(lv===cur)+'">'+heatMarks(lv)+x.name+' <span class="chip-lv" title="Recommended Lv '+tierRec(i,lv)+'+">'+tierRec(i,lv)+'+</span></button>').join('')
   +(nm?'<span class="nm-mark" title="Cleared on Nightmare '+nm+' time'+(nm>1?'s':'')+'">&#9760; Nightmare'+(nm>1?' x'+nm:'')+'</span>':'')
   +(cur?'<div class="heat-note">Foes x'+H.foe+' &middot; XP x'+H.xp+' &middot; gold x'+H.gold+' &middot; gear x'+H.drop+(gateMod(i)?' <b class="bad" title="Cursed and '+H.name+': the curse feeds on it: foes x'+DAMNED_FOE+', rewards x'+DAMNED+'."><i aria-hidden="true">&#9760;</i> Curse + '+H.name+': foes x'+DAMNED_FOE+' &middot; rewards x'+DAMNED+'</b>':'')+'</div>':'')+'</div>';
}
function titlesHTML(){
  const T=Object.assign({got:{}},S.ti), n=titlesGot();   /* S.ti can exist before checkTitles first adds got */
  let h='<section class="win" aria-labelledby="h-tt"><h2 class="win-h" id="h-tt">Titles &middot; '+n+'/'+TITLES.length+'</h2>'
   +'<p class="q-note tt-col" title="+1% gold from kills for every '+TCOL_STEP+' titles earned, up to +'+TCOL_MAX+'%">'+titleColTxt(n)+'</p>'
   +'<p class="lede">Earned once, kept forever. Only the title you wear gives its bonus.</p>'
   +(titleName()?'<p class="q-note ok">Wearing <b>'+titleName()+'</b>: '+(buffTxt(TITLE[T.sel].b)||'no bonus')+'.</p>':'<p class="q-note">You wear no title, so no title bonus applies.</p>');
  const F=ui.ttf||'all', FL={all:'All',got:'Earned',locked:'Locked',close:'Close to earning'};
  const keep=t=>{ const got=T.got[t.id]; if(F==='got') return got; if(F==='locked') return !got; if(F==='close'){ const p=!got&&!titleHidden(t)&&titleProg(t); return p&&p.v/p.n>=.5; } if(F[0]==='r') return t.r===+F.slice(1); return true; };
  h+='<div class="chips tt-filter" role="group" aria-label="Show titles">'+Object.keys(FL).map(k=>'<button class="btn small'+(F===k?' primary':'')+'" data-a="ttf" data-k="'+k+'" aria-pressed="'+(F===k)+'">'+FL[k]+'</button>').join('')
   +'<label class="tt-rsel"><span>Rarity</span><select data-a="ttf" aria-label="Show titles of one rarity"><option value="all"'+(F[0]==='r'?'':' selected')+'>Any</option>'+TIERS.map((n,r)=>'<option value="r'+r+'"'+(F==='r'+r?' selected':'')+'>'+n+'</option>').join('')+'</select></label></div>';
  let shown=0;
  ['Gates','Hell Tower','Curses and events','Deeds'].forEach(g=>{
    const all=TITLES.filter(t=>t.grp===g), list=all.filter(keep), have=all.filter(t=>T.got[t.id]).length;
    if(!list.length) return; shown+=list.length;
    h+='<p class="group-h">'+g+' &middot; '+have+'/'+all.length+'</p><div class="items">'+list.map(t=>{
      const got=T.got[t.id], on=T.sel===t.id, hid=titleHidden(t), rt='<span class="t-rar t'+t.r+'">'+TIERS[t.r]+'</span>';
      if(hid) return '<div class="tt-row off hidden-t"><div><h4>??? '+rt+'</h4><div class="u-sub">A hidden '+TIERS[t.r].toLowerCase()+' title. Keep playing to discover it.</div></div><span class="u-tag">Hidden</span></div>';
      return '<div class="tt-row'+(on?' on':'')+(got?'':' off')+(g==='Hell Tower'?' hellt':'')+'"><div><h4>'+t.name+' '+rt+'</h4><div class="u-sub">'+t.req+(got?' &middot; earned day '+got:'')+'</div>'+(buffTxt(t.b)?'<div class="u-sub tbuff">When worn: '+buffTxt(t.b)+'</div>':'')+'</div>'
        +(got?'<button class="btn small'+(on?'':' primary')+'" data-a="wear" data-k="'+t.id+'">'+(on?'Remove':'Wear')+'</button>':(p=>p?'<span class="u-tag num tprog" title="Progress">'+p.v+'/'+p.n+'<i style="width:'+Math.round(p.v/p.n*100)+'%"></i></span>':'<span class="u-tag">Locked</span>')(titleProg(t)))+'</div>'; }).join('')+'</div>';
  });
  if(!shown) h+='<p class="q-note">No titles match this filter yet.</p>';
  return h+'</section>';
}
function towerHTML(){
  const P=S.player, T=S.tower, st=towerStarts(), locked=!towerOpen(), noWatch=S.watches<=0;
  const bosses=TW_BOSS.map((n,i)=>({f:(i+1)*10,name:n}));
  let h='<section class="win" aria-labelledby="h-tw"><h2 class="win-h" id="h-tw">The Hell Tower</h2>'
   +'<h3 class="win-title">One hundred floors. Every floor is harder than the last.</h3>'
   +brief('tower','A separate climb from the gates. Each floor is a single fight; between floors you raise the dead and climb on. A warden waits on every tenth floor and carries a unique item. The first time you break a warden its unique is guaranteed. After that it drops '+Math.round(TW.repeat*100)+'% of the time, as gold if you already carry it. Wardens grow wrathful if the fight drags on. A climb uses one watch, and floors you have cleared become checkpoints.'+(TW.armor?' Tower foes wear '+Math.round(TW.armor*100)+'% armor.':'')+'','lede')
   +'<div class="tw-hero"><b>Highest floor '+T.best+' / 100</b><div class="tw-prog"><i style="width:'+Math.min(100,T.best)+'%"></i></div>'
   +'<div class="u-sub">Uniques claimed '+Object.keys(T.got).length+' / '+TW_UNIQ.length+'</div></div>'
   +'<p class="group-h">Begin the climb from</p>';
  if(locked) h+='<p class="lede bad">The Tower opens once '+OPEN_AT.tower+' gates are cleared, from level '+TW.unlock+'.</p>';
  else{
    h+='<div class="chips">'+st.map(f=>'<button class="btn'+(f===st[st.length-1]?' primary':'')+'" data-a="tower" data-k="'+f+'"'+(noWatch?' disabled':'')+'>Floor '+f+'</button>').join('')+'</div>'
     +'<p class="q-note"><span class="rec-lv">Floor '+st[st.length-1]+': Recommended Lv '+recLv(st[st.length-1])+'+</span> &middot; '+resTag(TOWER_RES,TOWER_HITS)+' &middot; '+(noWatch?'<span class="bad">No watches left</span>':'1 watch')+'</p>';
  }
  h+=T.best>=100?'<div class="tw-hero abyss"><b>The Abyss &middot; floor '+(T.best>100?T.best:'101')+'+</b><div class="u-sub" title="Abaddon is dead, but the Tower goes on. Past floor 100 every floor is harder than the last, forever. Each tenth floor holds an abyssal warden that leaves gold and a legendary.">Endless &middot; every 10th floor: gold + legendary &middot; Record '+T.best+'</div></div>'
     :'<p class="q-note">Beyond floor 100 lies the Abyss, a climb with no top.</p>';
  h+='<p class="group-h">The wardens</p><div class="items">';
  bosses.forEach(b=>{
    const seen=T.best>=b.f-10, ids=TW_IDS[b.f]||[], fin=b.f===100;
    h+='<div class="tw-row'+(seen?'':' locked')+(fin?' final':'')+'">'+(seen?ico(b.name,5,{boss:true}):'<span class="ico unk" aria-hidden="true"><svg viewBox="0 0 64 64">'+IC['?']+'</svg></span>')
     +'<div><div class="tw-fl">Floor '+b.f+(T.best>=b.f?' &middot; defeated':'')+'</div><h4>'+(seen?b.name:'???')+'</h4>'
     +(seen?'<div class="u-sub"'+(fin?' title="The final warden. It drops three uniques and is the hardest thing in the game."':'')+'><span class="rec-lv">Recommended Lv '+recLv(b.f)+'+</span> &middot; '+(fin?'3 uniques':'1 unique')+'</div>'
        +'<div class="tw-uq">'+ids.map(id=>{ const d=ITEM[id], got=T.got[id];
            return itemCard({id:id},got?'<span class="tw-got">Owned</span>':''); }).join('')+'</div>'
       :'<div class="u-sub">Reach floor '+(b.f-9)+' to learn what waits here.</div>')+'</div></div>';
  });
  return h+'</div></section>';
}
const COIN='<svg class="coin" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="currentColor"/><circle cx="8" cy="8" r="4.3" fill="none" stroke="#5a4420" stroke-width="1.1"/><path d="M8 5.2v5.6M6.4 6.6h3.2" stroke="#5a4420" stroke-width="1.1"/></svg>';
const gold=n=>'<span class="gold-n">'+COIN+n.toLocaleString()+'</span>';
const MK_SECS=[['buy','Buy'],['forge','Forge'],['brew','Brewing'],['altar','Altar and bag'],['sell','Sell'],['bm','Black market']];
function marketHTML(){
  const P=S.player, stock=shopStock(), tk=Object.keys(S.trophies).sort((a,b)=>TROPHY[b].value-TROPHY[a].value||TROPHY[a].name.localeCompare(TROPHY[b].name));
  const tTotal=tk.reduce((a,k)=>a+S.trophies[k]*TROPHY[k].value,0), bagFull=S.inv.length>=bagMax();
  let h='<section class="win" aria-labelledby="h-mk"><h2 class="win-h" id="h-mk">Bone Market</h2><h3 class="win-title">You have '+gold(S.gold)+'</h3>'
   +brief('market','The dead pay well for what the living leave behind. Sell trophies and spare gear here, and buy supplies before you go down. The merchant\'s wares change every dawn.','lede');
  if(ui.msg&&ui.msg.mk) h+='<div class="note '+(ui.msg.c||'')+'"><i>Market</i><span>'+ui.msg.m+'</span></div>';
  const sec=MK_SECS.some(x=>x[0]===ui.mk)?ui.mk:'buy';
  h+='<div class="chips sub-nav" role="tablist">'+MK_SECS.map(x=>'<button class="btn small'+(x[0]===sec?' primary':'')+'" role="tab" data-a="mk" data-k="'+x[0]+'" aria-selected="'+(x[0]===sec)+'">'+x[1]+'</button>').join('')+'</div>';
  if(sec==='buy'){
  // supplies
  h+='<p class="group-h">Supplies &middot; carry up to '+beltMax()+' of each</p><div class="items">'+Object.keys(POTIONS).map(k=>{ const p=POTIONS[k], c=p.price(), full=S.belt[k]>=beltMax();
    return '<div class="tt-row"><div><h4>'+p.name+' <span class="u-tag">'+S.belt[k]+'/'+beltMax()+'</span></h4><div class="u-sub">'+p.desc+' Key '+p.key+' in battle.</div></div>'
     +'<button class="btn small primary" data-a="buypot" data-k="'+k+'"'+(full||S.gold<c?' disabled':'')+'>'+(full?'Belt full':'Buy &middot; '+gold(c))+'</button></div>'; }).join('')+'</div>';
  // merchant stock
  h+='<p class="group-h">Merchant\'s wares &middot; day '+S.day+'</p>'+(bagFull?'<p class="q-note bad">Your bag is full. Sell or discard something first.</p>':'')
   +'<div class="items">'+stock.map((s,i)=>{ const d=ITEM[s.id], c=shopPrice(d);
     return itemCard({id:s.id,ro:s.ro,u:-1-i},s.sold?'<span class="u-tag">Sold</span>':'<button class="btn small primary" data-a="buyitem" data-k="'+i+'"'+(S.gold<c||bagFull?' disabled':'')+'>Buy &middot; '+gold(c)+'</button>',!s.sold); }).join('')+'</div>';
  // grave salts (raising aid)
  { const c=saltPrice(), full=S.salts>=SALT_MAX;
    h+='<div class="items" style="margin-top:8px"><div class="tt-row"><div><h4>Grave Salts <span class="u-tag">'+S.salts+'/'+SALT_MAX+'</span></h4><div class="u-sub">Sprinkle on a body before raising it: +'+saltAdd()+'% raise chance for that attempt. Worth it on bosses and elites.</div></div>'
     +'<button class="btn small primary" data-a="buysalt"'+(full||S.gold<c?' disabled':'')+'>'+(full?'Pouch full':'Buy &middot; '+gold(c))+'</button>'
     +(full?'':'<button class="btn small" data-a="buysaltmax"'+(saltMaxN()?' title="Buy '+saltMaxN()+' for '+saltMaxN()*c+' gold"':' disabled')+'>Buy max</button>')+'</div></div>'; }
  }
  if(sec==='forge'){
  // trophy forge
  const fg=DUNGEONS.map((D,i)=>i).filter(i=>forgePoints(i)>0);
  h+='<p class="group-h">Trophy forge</p>'+brief('forge',''+FORGE_N+' trophies from one gate (a boss heart counts as 5) and a little gold forge that gate\'s gear in the slot you pick. One in five comes out a masterwork from the next gate. Or brew a potion from any '+BREW_N+' trophies.','q-note');
  if(fg.length) h+='<div class="items">'+fg.map(i=>{ const pts=forgePoints(i), ok=pts>=FORGE_N&&S.gold>=forgeGold(i)&&!bagFull;
      return '<div class="tt-row"><div><h4>'+DUNGEONS[i].name+' forge <span class="u-tag">'+Math.min(pts,99)+'/'+FORGE_N+' trophies</span></h4><div class="u-sub">'+TIERS[SET_TIER[i]]+' gear &middot; costs '+gold(forgeGold(i))+'</div></div>'
       +'<div class="btns" style="margin:0">'+GEAR_SLOTS.map(sl=>'<button class="btn small'+(ok?' primary':'')+'" data-a="forge" data-k="'+i+'|'+sl+'"'+(ok?'':' disabled')+'>'+SLOTS[sl]+'</button>').join('')+'</div></div>'; }).join('')+'</div>';
  { const n=towerTrophies(), ok=n>=TW_FORGE_N&&S.gold>=TW_FORGE_GOLD&&!bagFull; if(n) h+='<div class="items"><div class="tt-row"><div><h4>Hell Tower forge <span class="u-tag">'+Math.min(n,99)+'/'+TW_FORGE_N+' Tower trophies</span></h4><div class="u-sub">Throne of Ash gear, '+Math.round(TW_EXTRA*100)+'% with an extra line &middot; costs '+gold(TW_FORGE_GOLD)+'</div></div><div class="btns" style="margin:0">'+GEAR_SLOTS.map(sl=>'<button class="btn small'+(ok?' primary':'')+'" data-a="twforge" data-k="'+sl+'"'+(ok?'':' disabled')+'>'+SLOTS[sl]+'</button>').join('')+'</div></div></div>'; }
  h+=heartforgeHTML(bagFull);
  { const n=Object.values(S.trophies).reduce((a,b)=>a+b,0);
    h+='<div class="btns">'+Object.keys(POTIONS).map(k=>'<button class="btn small" data-a="brew" data-k="'+k+'"'+(n<BREW_N||S.belt[k]>=beltMax()?' disabled':'')+'>Brew '+POTIONS[k].name+' &middot; '+BREW_N+' trophies</button>').join('')+'</div>'; }
  }
  if(sec==='brew') h+=brewHTML();
  if(sec==='bm') h+=bmHTML(bagFull);
  if(sec==='altar'){
  // bone altar
  h+='<p class="group-h">Bone Altar</p>'+brief('altar','Pour gold on the altar to raise a minion one level at once. Minions still stop at your level + 2.','q-note');
  h+=S.army.length+(S.reserve||[]).length?'<div class="items">'+S.army.concat(S.reserve||[]).map(m=>{ const capped=m.lvl>=P.lvl+2, c=empowerCost(m);
      return '<div class="tt-row trow">'+ico(m.kind||m.name,m.rankI,m)+'<div><h4>'+m.nick+' <span class="dim" style="font-size:13px">'+theName(mName(m))+'</span></h4><div class="u-sub">Lv '+m.lvl+' &middot; '+sgl('atk','ATK')+m.atk+' &middot; '+sgl('hp','HP')+m.maxHp+'</div></div>'
       +'<button class="btn small primary" data-a="empower" data-k="'+m.uid+'"'+(capped||S.gold<c?' disabled':'')+'>'+(capped?'At the cap':'Empower &middot; '+gold(c))+'</button></div>'; }).join('')+'</div>'
    :'<p class="lede">No minions yet. Raise the dead first.</p>';
  // bag upgrades
  { const lv=S.bagLv||0, c=BAG_COST[lv];
    h+='<p class="group-h">Bag</p><div class="items"><div class="tt-row"><div><h4>Larger bag <span class="u-tag">'+bagMax()+' slots</span></h4><div class="u-sub">'+(c!=null?'Stitch in '+BAG_STEP+' more slots. Upgrade '+(lv+1)+' of '+BAG_COST.length+'.':'Your bag cannot grow any larger.')+'</div></div>'
     +(c!=null?'<button class="btn small primary" data-a="buybag"'+(S.gold<c?' disabled':'')+'>Upgrade &middot; '+gold(c)+'</button>':'<span class="u-tag ok">Maxed</span>')+'</div></div>'; }
  }
  if(sec==='sell'){
  // trophies
  h+='<p class="group-h">Trophy pouch &middot; worth '+gold(tTotal)+'</p>';
  if(tk.length){
    h+='<div class="items">'+tk.map(k=>{ const t=TROPHY[k], n=S.trophies[k];
      return '<div class="tt-row trow">'+ico(t.ico,t.rankI,{boss:k.startsWith('b:')})+'<div><h4>'+t.name+' <span class="u-tag">&times;'+n+'</span></h4><div class="u-sub">'+gold(t.value)+' each</div></div>'
       +'<div class="btns" style="margin:0"><button class="btn small" data-a="selltro" data-k="'+k+'">Sell 1</button>'+(n>1?'<button class="btn small primary" data-a="selltroall" data-k="'+k+'">Sell all &middot; '+gold(n*t.value)+'</button>':'')+'</div></div>'; }).join('')+'</div>'
     +'<div class="btns"><button class="btn primary" data-a="sellalltro">Sell every trophy &middot; '+gold(tTotal)+'</button></div>';
  } else h+='<p class="lede">Empty. Enemies drop trophies when they fall; win the room to keep them.</p>';
  // gear from the bag
  const sellable=S.inv.slice().sort((a,b)=>ITEM[a.id].tier-ITEM[b.id].tier||ITEM[a.id].name.localeCompare(ITEM[b.id].name));
  h+='<p class="group-h">Sell gear from your bag &middot; '+S.inv.length+'/'+bagMax()+'</p>'+((junkHTML()||tierBulkHTML('sell'))?'<div class="btns">'+junkHTML()+tierBulkHTML('sell')+'</div>':'');
  h+=sellable.length?'<div class="items">'+sellable.map(it=>{ const d=ITEM[it.id];
      return itemCard(it,d.uq?'<span class="u-tag">Cannot be sold</span>':it.lk?'<span class="u-tag">Locked</span>':'<button class="btn small" data-a="sellitem" data-k="'+it.u+'">'+(ui.confirm==='si'+it.u?'Confirm':'Sell &middot; '+gold(sellValue(it)))+'</button>'); }).join('')+'</div>'
    :'<p class="lede">Nothing in your bag. Equipped gear is not for sale; unequip it first.</p>';
  }
  return h+'</section>';
}
function skillsHTML(){
  const P=S.player, spent=Object.values(P.skills).reduce((a,b)=>a+b,0);
  let h='<section class="win" aria-labelledby="h-sk"><h2 class="win-h" id="h-sk">Skills &middot; '+P.sp+' point'+(P.sp===1?'':'s')+' to spend</h2>'
   +brief('skills','You earn one skill point each level. Active skills appear as buttons in battle (keys 4 and up). They cost mana, and their cooldowns reset every room. Passive skills always apply. Each skill has '+SK_MAX+' ranks, and each rank needs '+SK_STEP+' more levels than the last.','lede');
  [['active','Active'],['passive','Passive']].forEach(g=>{
    h+='<p class="group-h">'+g[1]+'</p><div class="items">'+SKILLS.filter(s=>s.type===g[0]).map(s=>{
      const rk=sk(s.id), next=rk+1, req=rk<SK_MAX?skReq(s,next):0, lockedLv=rk<SK_MAX&&P.lvl<req;
      const meta=(s.type==='active'?skCost(s)+' mana &middot; cooldown '+s.cd+' turn'+(s.cd>1?'s':'')+' &middot; ':'')+'Unlocks at Lv '+s.lv;
      const body='<div class="u-sub">'+(rk?'<span class="ok">Rank '+rk+':</span> '+s.desc(rk):s.desc(1))+'</div>'
        +(rk&&rk<SK_MAX?'<div class="u-sub dim">Rank '+next+(lockedLv?' (Lv '+req+')':'')+': '+s.desc(next)+'</div>':'');
      const M=SKILL_MODS[s.id], mod=skMod(s.id);
      const modH=rk>=SK_MAX?(mod?'<div class="u-sub ok">Upgrade: <b>'+M[mod][0]+'</b>. '+M[mod][1]+'</div>'
          :'<div class="u-sub">Choose an upgrade:</div><div class="btns" style="margin:4px 0 0">'+['a','b'].map(c=>'<button class="btn small primary" data-a="skmod" data-k="'+s.id+'|'+c+'" title="'+M[c][1]+'">'+M[c][0]+': '+M[c][1]+'</button>').join('')+'</div>')
        :'<div class="u-sub dim">At rank '+SK_MAX+', choose: '+M.a[0]+' ('+M.a[1].replace(/\.$/,'')+') or '+M.b[0]+' ('+M.b[1].replace(/\.$/,'')+').</div>';
      const btn=rk>=SK_MAX?'<span class="u-tag ok">Mastered</span>'
        :lockedLv?'<button class="btn small" disabled>Reach Lv '+req+'</button>'
        :'<button class="btn small primary" data-a="learn" data-k="'+s.id+'"'+(P.sp<=0?' disabled':'')+'>'+(rk?'Rank up':'Learn')+'</button>';
      return '<div class="tt-row'+(rk?' on':'')+(!rk&&lockedLv?' off':'')+'"><div><h4>'+s.name+' <span class="u-tag">'+rk+'/'+SK_MAX+'</span></h4><div class="u-sub">'+meta+'</div>'+body+modH+'</div>'+btn+'</div>';
    }).join('')+'</div>';
  });
  h+=capHTML();   // mastery paths and capstones (src/ui-progression.js)
  h+='<p class="group-h">Ultimate'+(P.lvl<ULT_LV?' &middot; opens at level '+ULT_LV:'')+'</p>'+brief('ult','Soul Siphon harvests a Soul, and every elite or boss that falls gives one. With '+SOUL_MAX+' Souls, unleash your ultimate in battle (key R). Choose one here; you can switch for free in town.','q-note')+'<div class="items">'
   +Object.keys(ULTS).map(id=>{ const U=ULTS[id], on=P.ult===id; return '<div class="tt-row'+(on?' on':'')+(P.lvl<ULT_LV?' off':'')+'"><div><h4>'+U.name+'</h4><div class="u-sub">'+U.desc+'</div></div>'
     +(on?'<span class="u-tag ok">Chosen</span>':'<button class="btn small primary" data-a="ult" data-k="'+id+'"'+(P.lvl<ULT_LV?' disabled':'')+'>Choose</button>')+'</div>'; }).join('')+'</div>';
  if(spent) h+='<div class="btns"><button class="btn small warn" data-a="skreset">'+(ui.confirm==='skreset'?'Press again to forget all skills':'Forget all skills ('+spent+' back)')+'</button></div>';
  return h+'</section>';
}
function ascPickHTML(){   // the next level's rules (one; two in the Keeper's Cycle; none in the Quiet Valley), kept for every later cycle, and the carries (game-asc.js)
  const off=ascOffer(), N=ascPicks(), pk=ascPickList(), kept=ascRules();
  let h='<p class="q-note">'+(kept.length?'Rules the valley remembers: '+kept.map(k=>'<b title="'+ASC_RULES[k].desc+' '+ASC_RULES[k].rew+'">'+ASC_RULES[k].name+'</b>').join(', ')+'. ':'')
    +(!N?'The Quiet Valley draws no rule.':off.length?(N>1?'Pick up to two rules for ascension level ':'Pick a rule for ascension level ')+((S.ngp||0)+1)+' (optional): '+(N>1?'they stay':'it stays')+' for every later cycle.':'Every rule is already yours.')+'</p>';
  if(off.length) h+='<div class="items">'+off.map(k=>{ const R=ASC_RULES[k], on=pk.includes(k); return '<div class="item'+(on?' on':'')+'"><div class="i-body"><div class="i-top"><span class="i-name">'+R.name+'</span></div><div class="i-stats">'+R.desc+'</div><div class="i-hf">'+R.rew+'</div></div><div class="i-acts"><button class="btn small'+(on?' primary':'')+'" data-a="ascpick" data-k="'+k+'" aria-pressed="'+on+'">'+(on?'Chosen':'Choose')+'</button></div></div>'; }).join('')+'</div>';
  const C=carryOpts(), cn=carryN(), cp=carryPickList();
  h+='<p class="q-note">'+(C.length?'Carry '+(cn>1?'up to two more things':'one more thing')+' into the new cycle (optional):':'Nothing else to carry: a minion\'s trait, a building at level '+CARRY_BUILD+' or more, a Riftborn or heartforged piece could cross.')+'</p>';
  if(C.length) h+='<div class="chips">'+C.map(o=>{ const on=cp.includes(o.k); return '<button class="btn small'+(on?' primary':'')+'" data-a="carrypick" data-k="'+o.k+'" aria-pressed="'+on+'" title="'+o.desc+'">'+({trait:'Trait',build:'Building',rb:'Riftborn',hf:'Heartforged'}[o.kind])+': '+o.name+'</button>'; }).join('')+'</div>';
  return h;
}
const ascPickList=()=>(Array.isArray(ui.ascPick)?ui.ascPick:[]).filter(k=>ascOffer().includes(k)).slice(0,ascPicks());
const carryPickList=()=>(Array.isArray(ui.carry)?ui.carry:[]).filter(k=>carryOpts().some(o=>o.k===k)).slice(0,carryN());
function ngpHTML(){
  const n=(S.ngp||0)+1;
  let h='<p class="group-h">New Game+'+(S.ngp?' &middot; you are in New Game+ '+S.ngp:'')+'</p>';
  if(!canNGP()) return h+'<p class="q-note">Clear the Throne of Ash to unlock New Game+ '+n+'. You start again at level 1 with your titles, your bestiary and one unique, against foes with '+Math.round(NGP_FOE*n*100)+'% more HP and attack that pay '+Math.round(NGP_REWARD*n*100)+'% more XP and gold.</p>';
  const own=ownedUniques(), sel=own.includes(ui.ngpPick)?ui.ngpPick:null;
  h+='<div class="danger-zone"><p class="q-note" style="margin-top:0">Begin New Game+ '+n+': level 1, day 1, a fresh army, bag and gold. You keep your titles and bestiary, and one unique. Foes get '+Math.round(NGP_FOE*n*100)+'% more HP and attack and pay '+Math.round(NGP_REWARD*n*100)+'% more XP and gold, and you pick a rule for ascension level '+n+' and one more thing to carry.</p>';
  h+=own.length?'<p class="q-note">Choose the unique to carry:</p><div class="chips">'+own.map(id=>'<button class="btn small'+(sel===id?' primary':'')+'" data-a="ngppick" data-k="'+id+'" aria-pressed="'+(sel===id)+'">'+ITEM[id].name+'</button>').join('')+'</div>'
    :'<p class="q-note">You hold no unique to carry.</p>';
  if(S.ending) h+='<p class="q-note"><b>'+ENDINGS[S.ending.k].cycle+'.</b> '+ENDINGS[S.ending.k].ngp+'</p>';   /* the ending you chose (game-abbey.js) */
  if((S.inscriptions||[]).length) h+='<p class="q-note">Ledger inscriptions you carry: '+S.inscriptions.map(id=>INSCRIPTIONS[id].name).join(', ')+'.</p>';
  h+=ascPickHTML()+pactPickHTML();   // the ascension rule (game-asc.js), New Game+ pacts (src/ui-progression.js)
  return h+'<div class="btns"><button class="btn small warn" data-a="ngp">'+(ui.confirm==='ngp'?'Press again: this replaces your current game':'Begin New Game+ '+n+(sel?' with '+ITEM[sel].name:''))+'</button></div></div>';
}
function tipHTML(){
  const t=currentTip(); if(!t) return '';
  return '<div class="tip" role="note"><div class="tip-b"><i>Tip</i><b>'+t.t+'</b><p>'+t.m+'</p></div><div class="btns" style="margin:0;align-items:center"><button class="btn small primary" data-a="tip" data-k="'+t.id+'">Got it</button><button class="linkbtn" data-a="tipsoff">Stop showing tips</button></div></div>';
}
// First steps: a short guide that ticks itself off as you play. Every rule and number lives in the Codex.
const FIRST_STEPS=[
  ['Spend your stat points',()=>S.player.pts===0||S.player.lvl>1,'Press + next to a stat. Constitution keeps you alive early; Will lets you raise more of the dead.'],
  ['Raise your first minion',()=>T_('raised')>0,'Win a room, then raise what fell. Raising costs mana; your first raise always answers, later ones can fail. Your army fights beside you and grows.'],
  ['Clear the Rat Warren',()=>!!(S.ti&&S.ti.clr&&S.ti.clr[0]),'Four rooms, the last holding the Rat King. Between rooms, pick a door: a fight, a stronger room with better loot, a rest or a vault.'],
  ['Learn a skill',()=>Object.keys(S.player.skills||{}).length>0,'You get a skill point each level. Bone Spear (Skills tab) is a strong first pick; active skills sit on keys 4 and up in battle.'],
  ['Stock up at the Market',()=>(S.belt.hp+S.belt.mp)>0||T_('drank')>0,'Healing Draughts (Q) and Mana Tonics (W) save runs. Sell trophies and spare gear there to pay for them.'],
  ['Finish a daily quest',()=>T_('claims')>0,'Defeat foes, clear rooms and clear a dungeon in one day for a stat point and XP. An unfinished quest costs nothing.'],
  ['Open the town',()=>townOpen(),'Clear '+OPEN_AT.town+' gates and a Town tab and a bounty board appear: buildings, fusion and contracts.'],
  ['Reach the Hell Tower',()=>towerOpen(),'Once '+OPEN_AT.tower+' gates are cleared, from level '+TW.unlock+', a separate climb opens: one fight per floor, a warden with a unique every tenth floor, checkpoints as you go.'],
  ['Break the Throne of Ash',()=>!!(S.ti&&S.ti.clr&&S.ti.clr[5]),'The last gate. Clearing it opens New Game+ in Settings and makes cursed gates rise to just below your level.']
];
// Later systems for the How to play page, read from the game's own unlock levels so the page cannot go stale.
const HELP_LATER=()=>[
  ['Town and bounties','Once '+OPEN_AT.town+' gates are cleared: buildings, the Flesh Pit, the Reserve (a bench of '+RESERVE_BASE+' places for spare minions) and a board of up to three contracts.',townOpen()],
  ['Salvage and enchanting','At level 6 or once you have bone dust: break spare gear into dust and add bonus lines.',workOpen()],
  ['Faith','Once '+OPEN_AT.faith+' gates are cleared, from level '+FAITH_LV+', the Pantheon (Town tab) takes an oath to one of four Old Gods or to none: devotion grows with deeds, every rank gives a boon, and each god asks a vow.',faithOpen()],
  ['The Hell Tower','Once '+OPEN_AT.tower+' gates are cleared, from level '+TW.unlock+': one fight per floor and a unique on every tenth floor.',towerOpen()],
  ['Harder gates','A cleared gate offers Hard, then Brutal and Nightmare: stronger foes, bigger rewards.',DUNGEONS.some((D,i)=>heatMax(i)>0)],
  ['Cursed gates','Each day one cleared gate is cursed: harder, and pays more.',DUNGEONS.some((D,i)=>S.ti&&S.ti.clr&&S.ti.clr[i])],
  ['Sieges','Once your buildings have '+SIEGE_BUILT+' levels, the living march on the necropolis every '+SIEGE_GAP[0]+' to '+SIEGE_GAP[1]+' days, at the end of a day you are warned about.',siegeOpen()],
  ['Raids','A raised elite or boss may rise as a Commander. From the War table on the Gates tab it leads a squad against a cleared gate for gold, gear and XP.',raidGates().length>0&&raidPool().some(isCommander)],
  ['The Rift','Once the Throne of Ash has fallen, from level '+RIFT_LV+': a dive through the dead of every gate, one depth deeper each time you clear your deepest.',riftOpen()],
  ['Ultimates','At level '+ULT_LV+' choose an ultimate on the Skills tab. Gather '+SOUL_MAX+' Souls in a run and press R.',S.player.lvl>=ULT_LV],
  ['The Rival','After '+RIVAL_AT+' different gate clears a rival necromancer steals bodies now and then and, about every two weeks, waits in one of your cleared gates.',rivalOpen()&&!!(S.rival&&S.rival.met)],
  ['Trials','Once the Throne of Ash has fallen: one fixed four-room challenge each week, scored by turns, on the Gates tab.',trialOpen()]
];
const stepsDone=()=>FIRST_STEPS.filter(x=>{ try{ return x[1](); }catch(e){ return false; } }).length;
function helpHTML(){
  const done=stepsDone();
  return '<section class="win" aria-labelledby="h-help"><h2 class="win-h" id="h-help">How to play &middot; first steps '+done+'/'+FIRST_STEPS.length+'</h2><h3 class="win-title">Every name in this book answers to you.</h3>'
   +(done<=1&&S.day===1?'<div class="btns"><button class="btn primary" data-a="tab" data-k="gates">Begin: to the gates</button></div>':'')
   +'<p class="lede">Each day has '+WATCHES+' watches; a gate or the Tower uses one. These steps tick off as you play.</p>'
   +'<div class="items">'+FIRST_STEPS.map((x,i)=>{ let ok=false; try{ ok=x[1](); }catch(e){}
      return '<div class="tt-row step'+(ok?' on':'')+'"><div><h4><span class="step-n">'+(ok?'&#10003;':(i+1))+'</span>'+x[0]+'</h4><div class="u-sub">'+x[2]+'</div></div></div>'; }).join('')+'</div>'
   +'<p class="group-h">What opens later</p><div class="items">'+HELP_LATER().map(x=>'<div class="tt-row'+(x[2]?' on':'')+'"><div><h4>'+x[0]+'</h4><div class="u-sub">'+x[1]+'</div></div>'+(x[2]?'<span class="u-tag ok">Open</span>':'')+'</div>').join('')+'</div>'
   +'<p class="group-h">Keys in battle</p><p class="help-p">1 Strike, 2 Soul Siphon, 3 Bone Ward, 4 to 9 your skills, R your ultimate (from level '+ULT_LV+'), Q and W potions, '+Object.keys(ORDER_KEYS).map(k=>k.toUpperCase()).join(' ')+' orders ('+Object.values(ORDER_KEYS).map(r=>CMDS[r].name).join(', ')+'), and ] and [ to change target. Tab moves between buttons as usual.</p>'
   +'<p class="group-h">Saving</p><p class="help-p">The game saves itself after every action, and keeps your save from the start of each of the last '+BAK_N+' days (Settings). In a gate or the Tower it saves as if you had walked out, so closing the tab there counts as leaving. Use save slots before something risky, and save files or codes to move to another browser.</p>'
   +'<div class="btns"><button class="btn small primary" data-a="tab" data-k="codex">Open the Codex: every rule and number</button></div></section>';
}
function saveTabHTML(){
  const ok=storageOk(), when=t=>t?new Date(t).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'never';
  const tipsOff=!!(S.tips&&S.tips.off), seenTips=TIPS.filter(t=>S.tips&&S.tips[t.id]).length;
  let h='<section class="win" aria-labelledby="h-sv"><h2 class="win-h" id="h-sv">Settings</h2>'
   +'<p class="group-h">Help</p><div class="items"><div class="tt-row"><div><h4>How to play</h4><div class="u-sub">First steps, ticked off as you play.</div></div>'
   +'<button class="btn small primary" data-a="tab" data-k="help">Open</button></div>'
   +'<div class="tt-row'+(tipsOff?'':' on')+'"><div><h4>Tips</h4><div class="u-sub">'+(tipsOff?'Tips are hidden.':seenTips+' of '+TIPS.length+' seen.')+'</div></div>'
   +'<div class="btns" style="margin:0">'+(tipsOff?'<button class="btn small primary" data-a="tipson">Show tips</button>':'')+(seenTips?'<button class="btn small" data-a="tipsreset">Show all again</button>':tipsOff?'':'<button class="btn small" disabled>No tips seen yet</button>')+'</div></div></div>'
   +'<p class="group-h">Sound</p><div class="tt-row'+(SFX.on?' on':'')+'"><div><h4>Sound effects</h4><div class="u-sub">Remembered in this browser.</div></div>'
   +'<button class="btn small'+(SFX.on?'':' primary')+'" data-a="sound" aria-pressed="'+SFX.on+'">'+(SFX.on?'Turn off':'Turn on')+'</button></div>'
   +'<div class="tt-row'+(MUSIC.on?' on':'')+'"><div><h4>Music</h4><div class="u-sub">A theme for each place and boss.</div></div>'
   +'<button class="btn small'+(MUSIC.on?'':' primary')+'" data-a="music" aria-pressed="'+MUSIC.on+'">'+(MUSIC.on?'Turn off':'Turn on')+'</button></div>'
   +'<p class="group-h">Language</p><div class="tt-row"><div><h4>Language</h4><div class="u-sub">Names of places, foes and items stay in English.</div></div><div class="btns" style="margin:0">'
     +Object.keys(LANGS).map(k=>'<button class="btn small'+(VIEW.lang===k?' primary':'')+'" data-a="view" data-k="lang|'+k+'" aria-pressed="'+(VIEW.lang===k)+'" lang="'+k+'">'+LANGS[k]+'</button>').join('')+'</div></div>'
   +'<p class="group-h">Display</p><div class="items"><div class="tt-row"><div><h4>Size</h4><div class="u-sub">Compact fits more on a phone: smaller text, tighter spacing and tabs on one swipeable line'+(window.innerWidth<=540&&VIEW.size!==-1?' (recommended on this screen)':'')+'. Large and Larger make the whole page bigger.</div></div><div class="btns" style="margin:0">'
   +[['Compact',-1],['Normal',0],['Large',1],['Larger',2]].map(([t,i])=>'<button class="btn small'+(VIEW.size===i?' primary':'')+'" data-a="view" data-k="size|'+i+'" aria-pressed="'+(VIEW.size===i)+'">'+t+'</button>').join('')+'</div></div>'
   +'<div class="tt-row'+(VIEW.calm?' on':'')+'"><div><h4>Reduce motion</h4><div class="u-sub">Stops embers, flames, pulses and shake.</div></div><button class="btn small'+(VIEW.calm?'':' primary')+'" data-a="view" data-k="calm" aria-pressed="'+VIEW.calm+'">'+(VIEW.calm?'Turn off':'Turn on')+'</button></div>'
   +'<div class="tt-row'+(VIEW.nobg?'':' on')+'"><div><h4>Backgrounds</h4><div class="u-sub">Painted scenes and boss arenas.</div></div><button class="btn small'+(VIEW.nobg?' primary':'')+'" data-a="view" data-k="nobg" aria-pressed="'+!VIEW.nobg+'">'+(VIEW.nobg?'Turn on':'Turn off')+'</button></div>'
   +'<div class="tt-row"><div><h4>Effects</h4><div class="u-sub">Light uses simpler icon shading and still backgrounds, for phones. Full also draws battle effects. Auto picks Light shading on small or slow devices and keeps battle effects unless the device is slow'+(VIEW.fx==='auto'?' (now: '+(fxLight()?'Light':'Full')+')':'')+'.</div></div><div class="btns" style="margin:0">'
     +Object.keys(FX_MODES).map(k=>'<button class="btn small'+(VIEW.fx===k?' primary':'')+'" data-a="view" data-k="fx|'+k+'" aria-pressed="'+(VIEW.fx===k)+'">'+FX_MODES[k]+'</button>').join('')+'</div></div>'
   +'<div class="tt-row'+(VIEW.hc?' on':'')+'"><div><h4>High contrast</h4><div class="u-sub">Brighter text and bolder bars.</div></div><button class="btn small'+(VIEW.hc?'':' primary')+'" data-a="view" data-k="hc" aria-pressed="'+VIEW.hc+'">'+(VIEW.hc?'Turn off':'Turn on')+'</button></div></div>'
   +'<p class="group-h">Save &amp; load</p><p class="lede">The game saves itself after every action (in a gate or the Tower, as if you had walked out). Slots are for keeping a safe copy before something risky, like a Tower warden. A save code lets you carry your progress to another browser or device.</p>';
  if(!ok) h+='<div class="note bad"><i>Storage</i><span>This browser is not letting the page store anything, so autosave and slots will not persist. Use a save code below to keep your progress.</span></div>';
  if(ui.msg) h+='<div class="note '+(ui.msg.c||'')+'"><i>Save</i><span>'+ui.msg.m+'</span></div>';
  h+='<div class="u-sub">Autosave: '+(ok?'on &middot; last saved '+when(S.savedAt):'off')+'</div><p class="group-h">Slots</p><div class="items">';
  for(let i=1;i<=SLOTS_N;i++){
    const g=slotRead(i), d=g&&g.data;
    const info=d?'Level '+d.player.lvl+' &middot; Day '+d.day+' &middot; Tower '+((d.tower&&d.tower.best)||0)+'/100 &middot; '+Object.keys((d.ti&&d.ti.got)||{}).length+' titles &middot; saved '+when(g.t):'Empty';
    h+='<div class="tt-row'+(d?' on':'')+'"><div><h4>Slot '+i+'</h4><div class="u-sub">'+info+'</div></div><div class="btns" style="margin:0">'
     +'<button class="btn small primary" data-a="slotsave" data-k="'+i+'">'+(d?(ui.confirm==='ss'+i?'Confirm overwrite':'Save over'):'Save here')+'</button>'
     +(d?'<button class="btn small" data-a="slotload" data-k="'+i+'">'+(ui.confirm==='sl'+i?'Confirm load':'Load')+'</button><button class="btn small warn" data-a="slotdel" data-k="'+i+'">'+(ui.confirm==='sd'+i?'Confirm':'Delete')+'</button>':'')
     +'</div></div>';
  }
  h+='</div><p class="group-h">Earlier autosaves</p><p class="q-note">The game keeps your save from the start of each of the last '+BAK_N+' days. Restore one if something went wrong.</p><div class="items">';
  let anyBak=false;
  for(let i=1;i<=BAK_N;i++){ const g=bakRead(i), d=g&&g.data; if(!d) continue; anyBak=true;
    h+='<div class="tt-row"><div><h4>Start of day '+d.day+'</h4><div class="u-sub">Level '+d.player.lvl+' &middot; '+(d.gold||0).toLocaleString()+' gold &middot; '+(d.army||[]).length+' minions &middot; saved '+when(g.t)+'</div></div>'
     +'<button class="btn small" data-a="bakload" data-k="'+i+'">'+(ui.confirm==='bl'+i?'Confirm: replaces your current game':'Restore')+'</button></div>'; }
  if(!anyBak) h+='<p class="lede">None yet. One is kept at the start of every day.</p>';
  h+='</div><p class="group-h">Save file</p><p class="q-note">Download your game as a small file to keep as a backup or move to another browser, then load it back here.</p>'
   +'<div class="btns"><button class="btn small primary" data-a="dlsave">Download save file</button><label class="btn small filebtn">Load a save file<input type="file" id="loadfile" accept=".txt,.json,text/plain,application/json"></label></div>'
   +(ui.file?'<div class="btns"><button class="btn small warn" data-a="loadfile">'+(ui.confirm==='lf'?'Press again: '+ui.file.name+' replaces your current game':'Load '+ui.file.name)+'</button><button class="linkbtn" data-a="dropfile">Cancel</button></div>':'');
  h+='<p class="group-h">Save code</p><p class="q-note">Copy this text somewhere safe. Pasting it back restores this exact character.</p>'
   +(ui.exp?'<textarea id="exp" class="codebox" readonly rows="4">'+ui.exp+'</textarea><div class="btns"><button class="btn small primary" data-a="copycode">Copy code</button></div>'
     :'<div class="btns"><button class="btn small primary" data-a="mkcode">Create save code</button></div>')
   +'<p class="group-h">Restore from a code</p><textarea id="imp" class="codebox" rows="3" placeholder="Paste a save code here">'+(ui.imp||'')+'</textarea>'
   +'<div class="btns"><button class="btn small" data-a="loadcode">'+(ui.confirm==='lc'?'Confirm: replaces your current game':'Load code')+'</button></div>'
   +ngpHTML()
   +'<p class="group-h">New game</p><div class="danger-zone"><p class="q-note" style="margin-top:0">Erases this character, its army, gear, skills and titles, and starts again on day 1. Save slots are kept, so save to a slot first if you might want this character back.</p>'
   +'<div class="btns"><button class="btn small warn" data-a="newgame">'+(ui.confirm==='new'?'Press again to erase everything':'New game')+'</button></div></div></section>';
  return h;
}
function loreHTML(){
  const seen=STORY.filter(st=>S.story&&S.story[st.id]), last=seen.slice().sort((a,b)=>S.story[b.id]-S.story[a.id])[0], np=S.pages||0;
  let h='<section class="win" aria-labelledby="h-lore"><h2 class="win-h" id="h-lore">Lore</h2><h3 class="win-title">What the Ledger has told you</h3>'
   +'<p class="lede">The story unfolds as you play: passages for the gates, the Tower and the milestones along the way, and torn pages of the Ledger&#39;s own history. '+seen.length+'/'+STORY.length+' passages, '+np+'/'+LORE_PAGES.length+' pages.</p>';
  for(let a=1;a<ACTS.length;a++){ const all=STORY.filter(st=>st.act===a), got=all.filter(st=>S.story&&S.story[st.id]); if(!got.length&&a>1&&!STORY.filter(st=>st.act===a-1).some(st=>S.story&&S.story[st.id])) break;
    h+='<p class="group-h">'+ACTS[a].replace(' · ',' &middot; ')+' &middot; '+got.length+'/'+all.length+'</p>'
     +got.sort((x,y)=>S.story[x.id]-S.story[y.id]).map(st=>'<details class="chron"'+(st===last?' open':'')+'><summary>'+st.t+' <span class="dim">&middot; day '+S.story[st.id]+'</span></summary><p>'+st.m+'</p></details>').join('')
     +(got.length<all.length?'<p class="q-note">'+(all.length-got.length)+' more in this act.</p>':''); }
  h+='<p class="group-h">Torn pages &middot; '+np+'/'+LORE_PAGES.length+'</p>'
   +LORE_PAGES.slice(0,np).map((P0,i)=>S.rival&&S.rival.page===i?'<details class="chron borrowed"><summary>'+(i+1)+'. Borrowed by '+S.rival.name+'</summary><p class="dim">The page is gone from the binding. Beat '+S.rival.name+' to bring it back.</p></details>':'<details class="chron"'+(i===np-1?' open':'')+'><summary>'+(i+1)+'. '+P0.t+'</summary><p>'+P0.m+'</p></details>').join('')
   +(np<LORE_PAGES.length&&abbeyPage(np)?'<p class="q-note">The last pages lie only in Vane Abbey: its bosses, elites and coffers may hold them.</p>':np<LORE_PAGES.length?'<p class="q-note">Bosses, Tower wardens, elites and sealed coffers sometimes hold the next page'+(S.player.lvl<PAGE_LV(np)?', but page '+(np+1)+' waits until you reach level '+PAGE_LV(np):'')+'. Secret masters always carry one.</p>':'<p class="q-note ok">Every page is home.</p>');
  return h+'</section>';
}
function recordsHTML(){
  const Rc=S.rec||{}, n=v=>(v||0).toLocaleString(), on=o=>o?'<b>'+n(o.v)+'</b> <span class="dim">&middot; day '+o.day+'</span>':'<span class="dim">not yet</span>';
  const row=(t,v)=>'<div class="tt-row"><div><h4>'+t+'</h4></div><div class="rec-v">'+v+'</div></div>';
  let h='<section class="win" aria-labelledby="h-rec"><h2 class="win-h" id="h-rec">Records</h2><h3 class="win-title">Your best, kept through every New Game+</h3>'
   +'<div class="items">'+row('Deepest Tower floor',Rc.floor?'<b>'+Rc.floor.v+'</b>'+(Rc.floor.v>100?' <span class="dim">(Abyss)</span>':'')+' <span class="dim">&middot; day '+Rc.floor.day+'</span>':'<span class="dim">not yet</span>')
   +row('Ascension',S.ngp?'Level '+S.ngp+(ascRules().length?' &middot; '+ascRules().map(k=>ASC_RULES[k].name).join(', '):''):'<span class="dim">not yet</span>')+(T_('rewritten')?row('Rewritten gates cleared','<b>'+T_('rewritten')+'</b>'):'')
   +row('Endings',(S.endHist||[]).length?S.endHist.map(e=>'<b>'+ENDINGS[e.k].name+'</b> <span class="dim">&middot; cycle '+(e.cycle+1)+', day '+e.day+'</span>').join('<br>'):'<span class="dim">not yet</span>')
   +row('Biggest single hit',on(Rc.hit))+row('Most foes slain in one run',on(Rc.kills))+row('Most gold from one run',on(Rc.gold))
   +row('Souls spent on ultimates','<b>'+n(T_('ults')*SOUL_MAX)+'</b> <span class="dim">&middot; '+n(T_('ults'))+' ultimate'+(T_('ults')===1?'':'s')+'</span>')
   +row('Sieges fought / held','<b>'+n(T_('sieges'))+'</b> <span class="dim">&middot; '+n(T_('siegeWins'))+' held</span>')
   +row('Highest level','<b>'+S.player.lvl+'</b>'+(S.ngp?' <span class="dim">&middot; New Game+ '+S.ngp+'</span>':''))
   +row('Longest win streak',on(Rc.streak)+(S.life&&S.life.stk?' <span class="dim">&middot; now '+n(S.life.stk)+'</span>':''))+row('Most damage taken and survived in one run',on(Rc.taken))
   +row('Highest minion level',on(Rc.mlv))+row('Most traits on a fused minion',on(Rc.ftr))+row('Most gold held at once',on(Rc.held))+'</div>'
   +'<p class="group-h">Fastest climbs and dives</p><p class="q-note">The Tower: fewest turns for ten floors in a row in one climb. The Rift: fewest turns to clear a dive, for each band of '+RIFT_BAND+' depths (a dive at depth 12 counts for 10 and deeper).</p><div class="items">'
   +row('Hell Tower, '+TW_SPLIT+' floors',Rc.tw10?'<b>'+Rc.tw10.v+' turns</b> <span class="dim">&middot; day '+Rc.tw10.day+'</span>':'<span class="dim">not yet</span>')
   +(()=>{ const F=Rc.riftF||{}, ks=Object.keys(F).map(Number).filter(m=>m>0).sort((a,b)=>a-b); return ks.length?ks.map(m=>row('The Rift, depth '+m+'&ndash;'+(m+RIFT_BAND-1),'<b>'+F[m].t+' turns</b> <span class="dim">&middot; depth '+F[m].d+' &middot; day '+F[m].day+'</span>')).join(''):row('The Rift','<span class="dim">not yet</span>'); })()+'</div>'
   +'<p class="group-h">Fastest clears</p><p class="q-note">Fewest turns from the first room to the fallen boss, on any difficulty.</p><div class="items">'
   +DUNGEONS.map((D,i)=>{ const o=Rc.fast&&Rc.fast[i]; return row(D.name,o?'<b>'+o.t+' turns</b> <span class="dim">&middot; day '+o.day+(o.heat&&HEAT[o.heat]?' &middot; '+HEAT[o.heat].name:'')+'</span>':'<span class="dim">not yet</span>'); }).join('')+'</div>';
  const sl=SECRET.map((B,i)=>({B,i})).filter(x=>Rc.sec&&Rc.sec[x.i]);
  if(sl.length) h+='<p class="group-h">Secret masters</p><div class="items">'+sl.map(x=>row('<span class="sec-k">&#9760; '+x.B.name+'</span>','<span class="dim">first slain day '+Rc.sec[x.i]+'</span>')).join('')+'</div>';
  return h+rivalCardHTML()+trialRecHTML()+'</section>';
}
const MEM_SHOW=30;
function memorialHTML(){   // the fallen, newest first, in a muted hand; honouring one is a town action, once a day
  const M=S.memorial||[], town=S.mode==='town', list=ui.memAll?M:M.slice(0,MEM_SHOW);
  let h='<section class="win mem-w" aria-labelledby="h-mem"><h2 class="win-h" id="h-mem">Memorial'+(M.length?' &middot; '+M.length:'')+'</h2><h3 class="win-title">Every name in this book answered to you</h3>';
  if(!M.length) return h+'<p class="lede">No name has been lost yet.</p></section>';
  h+=brief('mem','The Ledger keeps the names of those lost for good, shattered after a fight or fallen on a raid. The released are not written here.','q-note')
   +(remembered()?'<p class="q-note ok mem-hon">Honoured today: <b>'+S.honor.nick+'</b>. Your army is Remembered until dawn.</p>'
     :M.some(e=>e.st>=1)?'<p class="q-note">Once a day, in town, you may honour one of the Greater or older: the living army has +'+Math.round(MEM_HP*100)+'% max HP until dawn.</p>':'');
  h+=mausNote();
  { const t=headTiers(); h+='<p class="q-note mem-head-n">'+(t?'Headstones: '+t+' tiers carved. Your minions have +'+(headBonus()*100).toFixed(1)+'% max HP for good, at most +'+Math.round(HEAD_CAP*100)+'%.'
    :'In town you may carve a headstone over any name here and raise it with gold, tier by tier. Each tier gives your minions a little more max HP for good, at most +'+Math.round(HEAD_CAP*100)+'% in all.')+'</p>'; }
  h+='<div class="mem-list">'+list.map((e,i)=>{ const c=honourCost(e);
    return '<div class="mem-row">'+ico(e.kind,e.rk,{boss:e.boss,elite:e.elite,role:e.role})+'<span class="rk r'+e.rk+'">'+RANKS[e.rk]+'</span><div class="mem-t"><b>'+e.nick+'</b> <span class="dim">'+theName(mName({name:e.name,stage:e.st}))+'</span>'
     +'<div class="u-sub"><span>'+memWhere(e)+'</span> &middot; <span>Day '+e.day+'</span> &middot; <span>Lv '+e.lvl+'</span></div>'
     +(e.tr.length?'<div class="u-sub mem-tr">'+e.tr.map(t=>TRAITS[t].name).join(', ')+'</div>':'')+(e.bd?'<div class="u-sub mem-bd">Bonded to '+cleanText(e.bd)+'</div>':'')+(e.maus?'<div class="u-sub mem-maus">Rests in a mausoleum</div>':'')+(e.hs?'<div class="u-sub mem-hs">Headstone, tier '+e.hs+'</div>':'')+'</div>'+(town?'<div class="mem-b">':'')+mausBtn(e,i)
     +(town&&(e.hs|0)<HEAD_TOP?'<button class="btn small" data-a="head" data-k="'+i+'"'+(S.gold<headCost(e)?' disabled title="Not enough gold"':'')+'>'+(e.hs?'Raise headstone':'Carve a headstone')+' &middot; '+headCost(e)+' gold</button>':'')
     +(town&&e.st>=1&&!remembered()?'<button class="btn small" data-a="honour" data-k="'+i+'"'+(S.gold<c?' disabled title="Not enough gold"':'')+'>Honour &middot; '+c+' gold</button>':'')+(town?'</div>':'')+'</div>'; }).join('')+'</div>';
  if(M.length>MEM_SHOW) h+='<div class="btns"><button class="linkbtn" data-a="memall">'+(ui.memAll?'Show the newest '+MEM_SHOW:'Show all '+M.length)+'</button></div>';
  return h+'</section>';
}
function histStatsHTML(L){   // lifetime analytics: from the lifetime counters, not only the last runs
  const n=v=>(v||0).toLocaleString(), rate=L.wt?L.wn/L.wt:(L.runs?(L.clears||0)/L.runs:0), avg=L.cn?Math.round(L.ct/L.cn):0;
  let fav=-1, fn=0; DUNGEONS.forEach((D,i)=>{ const c=T_('clrN'+i); if(c>fn){ fn=c; fav=i; } });
  return '<p class="group-h">Lifetime analytics</p><div class="life h-stats">'
   +[['Win rate',L.runs?Math.round(rate*100)+'%':'&ndash;'],['Average turns per clear',avg?n(avg):'&ndash;'],['Favorite gate',fav>=0?DUNGEONS[fav].name+' <span class="dim">x'+n(fn)+'</span>':'&ndash;'],
     ['Bosses slain',n(T_('bosses'))],['Souls harvested',n(L.souls)],['Win streak',n(L.stk)+(S.rec&&S.rec.streak?' <span class="dim">&middot; best '+n(S.rec.streak.v)+'</span>':'')]]
     .map(x=>'<div><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join('')+'</div>';
}
function histDetail(x){   // the expandable line under a run; runs from before these details were kept have none
  const n=v=>(v||0).toLocaleString(), out=[];
  if(x.bo) out.push('<div><span>Boss</span> <b>'+cleanText(x.bo[0])+'</b> <span class="'+(x.bo[1]?'ok':'dim')+'">'+(x.bo[1]?'slain':'still standing')+'</span></div>');
  if(x.mvp) out.push('<div><span>Best minion</span> <b>'+cleanText(x.mvp[0])+'</b> <span class="dim">'+(ROLES[x.mvp[1]]?ROLES[x.mvp[1]].label:cleanText(x.mvp[1]))+' &middot; Lv '+(+x.mvp[2]||1)+'</span></div>');
  if(x.lv) out.push('<div><span>Your level</span> <b>'+x.lv+'</b></div>');
  if(x.dd||x.mh) out.push('<div><span>Damage dealt</span> <b>'+n(x.dd)+'</b> <span class="dim">&middot; biggest hit '+n(x.mh)+'</span></div>');
  if(x.dt) out.push('<div><span>Damage taken</span> <b>'+n(x.dt)+'</b></div>');
  if(x.om&&OMENS[x.om]) out.push('<div><span>Omen</span> <b>'+OMENS[x.om].name+'</b></div>');
  const cs=[x.mod,x.m2].filter(c=>c&&MODS[c]).map(c=>MODS[c].name); if(cs.length) out.push('<div><span>Curse</span> <b>'+cs.join(', ')+'</b></div>');
  if(out.length&&!x.siege&&x.g>=0) out.push('<div><span>Difficulty</span> <b>'+(HEAT[x.heat||0]?HEAT[x.heat||0].name:'Normal')+'</b></div>');
  return out.length?'<details class="h-det"><summary>Details</summary>'+out.join('')+'</details>':'';
}
function histHTML(){
  const L=S.life||{}, n=v=>(v||0).toLocaleString(), H=(S.hist||[]).slice().reverse();
  const where=h=>h.trial&&DUNGEONS[h.g]?'Trial, week '+h.trial+' &middot; '+DUNGEONS[h.g].name:h.siege?'Siege on the necropolis':h.g<0?'Hell Tower, floor'+(h.f1>h.f0?'s '+h.f0+'&ndash;'+h.f1:' '+h.f0):h.rift?'The Rift, depth '+h.rift+(h.rr?' &middot; new deepest':''):DUNGEONS[h.g].name;
  const RES={cleared:'Cleared',fell:'Fell',fled:'Fled',left:'Walked out'};
  const seen=STORY.filter(st=>S.story&&S.story[st.id]);
  let h='<section class="win" aria-labelledby="h-hist"><h2 class="win-h" id="h-hist">History</h2><h3 class="win-title">The ledger keeps count</h3>'
   +'<p class="q-note">The Ledger&#39;s story ('+seen.length+'/'+STORY.length+' passages, '+(S.pages||0)+'/'+LORE_PAGES.length+' torn pages) is on the <button class="linkbtn" data-a="tab" data-k="lore">Lore page</button>.</p>'
   +'<p class="group-h">Every run so far'+(S.ngp?' (New Game+ runs included)':'')+'</p><div class="life">'
   +[['Runs',L.runs],['Gates cleared',L.clears],['Falls',L.deaths],['Fled',L.fled],['Rooms won',L.rooms],['Kills',L.kills],['XP earned',L.xp],['Gold found',L.gold],['Gear found',L.items],['Dead raised',L.raised]]
     .map(x=>'<div><span>'+x[0]+'</span><b>'+n(x[1])+'</b></div>').join('')+'</div>'
   +histStatsHTML(L)
   +(()=>{ const sl=SECRET.filter((B,i)=>T_('secret_'+i)); return sl.length?'<p class="group-h">Secret masters slain &middot; '+sl.length+'/'+SECRET.length+'</p><div class="sec-list">'+sl.map(B=>'<span class="sec-k">&#9760; '+B.name+(T_('secret_'+secretOf(B.name))>1?' x'+T_('secret_'+secretOf(B.name)):'')+'</span>').join('')+'</div>':''; })()
   +'<p class="group-h">Last '+HIST_N+' runs</p>';
  if(!H.length) return h+'<p class="lede">No runs yet. Enter a gate and the ledger will remember it.</p></section>';
  return h+'<div class="hist-wrap"><table class="hist"><thead><tr><th>Day</th><th>Where</th><th>Result</th><th class="num">Turns</th><th class="num">Rooms</th><th class="num">Kills</th><th class="num">XP</th><th class="num">Gold</th><th class="num">Gear</th><th class="num">Raised</th></tr></thead><tbody>'
   +H.map(x=>'<tr><td class="num">'+x.d+'</td><td>'+where(x)+(x.mod&&MODS[x.mod]?' <span class="dim">('+MODS[x.mod].name+')</span>':'')
     +(x.heat&&HEAT[x.heat]?' <span class="dim">'+HEAT[x.heat].name+'</span>':'')+(x.om&&OMENS[x.om]?' <span class="dim h-om">'+OMENS[x.om].name+'</span>':'')+(x.sec?'<div class="sec-k">&#9760; '+x.sec+' slain</div>':'')+histDetail(x)
     +'</td><td class="res-'+x.res+'">'+(x.siege&&x.res==='cleared'?'Held':RES[x.res]||x.res)+(x.bo&&!x.sec?'<div class="u-sub h-bo">'+(x.bo[1]?'&#9760; ':'')+cleanText(x.bo[0])+'</div>':'')+'</td><td class="num">'+(x.tt?x.tt:'&ndash;')+'</td><td class="num">'+x.rooms+'</td><td class="num">'+x.kills+'</td><td class="num">'
     +n(x.xp)+'</td><td class="num">'+n(x.gold)+'</td><td class="num">'+x.items+'</td><td class="num">'+x.raised+'</td></tr>').join('')
   +'</tbody></table></div></section>';
}

// ----- brewing, run prep, commissions and the black market (game-brew.js)
const partsTxt=B=>B.hearts?B.hearts+' spare boss hearts':(P=>Object.keys(P).map(r=>P[r]+' '+r))(granary(B)).join(' + ')+' parts'+(B.g?' from a gate of rank '+RANKS[B.g]+' or deeper':'');
function brewHTML(){
  let h='<p class="group-h">Brewing</p>'+brief('brew2','Recipes take trophy parts of a role (the part words: Fang, Hide, Relic...) from a gate or deeper, plus a little gold. Tower trophies count as the deepest gate. Oils, incense and charms wait in your stash for the Gates tab, banners for tonight\'s raids; draughts go on your belt.','q-note');
  h+='<p class="q-note">Your parts: '+['striker','reaper','mender','vanguard'].map(r=>partCount(r,0)+' '+r).join(' &middot; ')+' &middot; spare hearts '+spareHearts().reduce((a,[,n])=>a+n,0)+'</p>';
  for(const kind of BREW_KINDS){ h+='<p class="group-h">'+BREW_KIND_NAME[kind]+'</p><div class="items">'+BREW_IDS.filter(id=>BREWS[id].kind===kind).map(id=>{ const B=BREWS[id], n=B.belt?(S.belt[B.belt]||0):stashN(id), cap=B.belt?beltMax():BREW_STASH;
    return '<div class="tt-row"><div><h4>'+B.name+' <span class="u-tag">'+n+'/'+cap+'</span></h4><div class="u-sub">'+B.desc+' Needs '+partsTxt(B)+'.</div></div><button class="btn small primary" data-a="brewx" data-k="'+id+'"'+(brewCan(id)?'':' disabled')+'>Brew &middot; '+gold(brewGold(id))+'</button></div>'; }).join('')+'</div>'; }
  return h;
}
function prepHTML(){   // the Gates tab: arm one oil, incense and charm for the next gate run, and a banner for tonight's raids
  if(S.mode!=='town') return ''; const have=id=>stashN(id)>0, p=S.prep||{};
  const rows=PREP_KINDS.map(kind=>{ const ids=BREW_IDS.filter(id=>BREWS[id].kind===kind&&!BREWS[id].use&&(have(id)||p[kind]===id)); if(!ids.length) return '';
    return '<div class="chips"><span class="u-sub">'+BREW_KIND_NAME[kind]+':</span>'+ids.map(id=>'<button class="btn small'+(p[kind]===id?' primary':'')+'" data-a="prep" data-k="'+kind+'|'+id+'" aria-pressed="'+(p[kind]===id)+'">'+BREWS[id].name+' &times;'+stashN(id)+'</button>').join('')+'</div>'; }).join('');
  const burn=stashN('ch_quiet')?'<div class="chips"><button class="btn small" data-a="burn" data-k="ch_quiet"'+(siegeOpen()&&sg().next?'':' disabled')+'>Burn a Quiet Grave &times;'+stashN('ch_quiet')+'</button></div>':'';
  if(!rows&&!burn&&!p.soul) return '';
  return '<div class="prep"><p class="group-h">Run prep</p>'+brief('prep','Armed brews go with your next gate run, one of each kind, while your stash lasts. A banner goes with each raid you order tonight.','q-note')+rows+burn+(p.soul?'<p class="q-note">A Soul from the black market waits for your next run.</p>':'')+'</div>';
}
function commHTML(){
  if(!townOpen()) return ''; const list=commissions(), town=S.mode==='town';
  return '<p class="group-h">Commissions &middot; this week</p>'+list.map((c,i)=>{ const p=commPay(c);
    return '<div class="b-row'+(c.done?' claimed':commCan(i)?' done':'')+'"><span>'+commTxt(c)+'</span><span class="u-sub">'+(c.done?'Filled.':'Pays '+gold(p.g)+' + '+dust(p.d))+'</span>'+(!c.done&&town&&commCan(i)?'<button class="btn small primary" data-a="comm" data-k="'+i+'">Fill</button>':'')+'</div>'; }).join('')
   +brief('comm','The town posts three orders each week. They lapse when the week ends.','q-note');
}
function bmHTML(bagFull){
  let h='<p class="group-h">Black market</p>'+brief('bm','A stall that opens every seventh day and trades without gold (but for one trade). Each trade once a week.','q-note');
  if(!bmOpen()) return h+'<p class="q-note">The stall is shut. It opens on day '+Math.max(BM_DAY,Math.ceil((S.day+1)/BM_DAY)*BM_DAY)+'.</p>';
  return h+'<div class="items">'+Object.keys(BM_TRADES).map(k=>{ const T=BM_TRADES[k], used=bmUsed(k), ok=!used&&T.can();
    const btn=k==='piece'?GEAR_SLOTS.map(sl=>'<button class="btn small'+(ok?' primary':'')+'" data-a="bmt" data-k="piece|'+sl+'"'+(ok?'':' disabled')+'>'+SLOTS[sl]+'</button>').join(''):'<button class="btn small primary" data-a="bmt" data-k="'+k+'"'+(ok?'':' disabled')+'>'+(used?'Traded':'Trade')+'</button>';
    return '<div class="tt-row"><div><h4>'+T.name+'</h4><div class="u-sub">For '+T.take+'.'+(used?' Traded this week.':'')+'</div></div><div class="btns" style="margin:0">'+btn+'</div></div>'; }).join('')+'</div>';
}
