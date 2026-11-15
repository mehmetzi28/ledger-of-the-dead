function trCore(t){ const nums=[]; const key=t.replace(/\d+(?:[.,]\d+)?/g,m=>{ nums.push(m); return '#'; }); let v=TR_DICT.get(key), low=false;
  if(v==null&&/^[a-z]/.test(key)){ v=TR_DICT.get(key[0].toUpperCase()+key.slice(1)); low=v!=null; }   // "every kill restores # mana" after "Censer: "
  if(v==null) return null; let i=0; v=v.replace(/#/g,()=>nums[i++]); return low?v[0].toLocaleLowerCase('tr')+v.slice(1):v; }
function trText(s){
  if(!s||!/[A-Za-z]/.test(s)) return s;
  const m=s.match(/^([\s·.,:;+\-−–]*)([\s\S]*?)([\s·.,:;!?\-–]*)$/), pre=m[1], core=m[2], post=m[3]; if(!core) return s;
  let v=trCore(core);
  if(v==null&&/\((vanguard|striker|mender|reaper)/.test(core)){ const r2=core.replace(/\((vanguard|striker|mender|reaper)(, gear-bearer)?\)/g,(x,a,b)=>'('+trCore(a)+(b?', '+trCore('gear-bearer'):'')+')'); if(r2!==core) v=r2; }   // creature lists: names stay, roles translate
  if(v==null) for(const [re,rep] of TR_RX){ const g=core.match(re); if(g){ v=rep.replace(/\{t(\d)\}/g,(x,n)=>trText(g[+n]||'')).replace(/\$(\d)/g,(x,n)=>g[+n]||''); break; } }
  if(v==null&&core.includes('. ')){ const P=core.split('. '), out=[]; let changed=false;   // sentences: take the longest run of them the table knows, then the next
    for(let i=0;i<P.length;){ let hit=null, j=P.length; for(;j>i;j--){ hit=trCore(P.slice(i,j).join('. ')); if(hit!=null) break; }
      if(hit!=null){ out.push(hit); changed=true; i=j; } else { const t=trText(P[i]); if(t!==P[i]) changed=true; out.push(t); i++; } }
    if(changed) v=out.join('. '); }
  if(v==null) for(const sep of [' · ',', ',': ']){ if(!core.includes(sep)) continue; const parts=core.split(sep), out=parts.map(x=>trText(x)); if(out.some((x,i)=>x!==parts[i])){ v=out.join(sep); break; } }
  if(v==null){ const k=core.match(/^([+-]?\d+(?:\.\d+)?%?) (.+)$/); if(k){ const r=trCore('# '+k[2])||trCore(k[2]); if(r!=null) v=r.startsWith(k[1])?r:k[1]+' '+r; } }
  return v==null?s:pre+v+post;
}
function trDom(root){
  if(VIEW.lang!=='tr'||!root||typeof document.createTreeWalker!=='function') return;
  const w=document.createTreeWalker(root,4); let n; while((n=w.nextNode())){ const v=n.nodeValue; if(/[A-Za-z]/.test(v)){ const t=trText(v); if(t!==v) n.nodeValue=t; } }
  root.querySelectorAll('[title],[aria-label],[placeholder]').forEach(el=>{ for(const a of ['title','aria-label','placeholder']){ const v=el.getAttribute(a); if(v){ const t=trText(v); if(t!==v) el.setAttribute(a,t); } } });
}
function saveView(){ try{ localStorage.setItem('lotd-view',JSON.stringify(VIEW)); }catch(e){} }
function applyView(){ const c=document.body.classList; c.toggle('compact',VIEW.size===-1); c.toggle('ts1',VIEW.size===1); c.toggle('ts2',VIEW.size===2); c.toggle('calm',VIEW.calm); c.toggle('hc',VIEW.hc); c.toggle('nobg',VIEW.nobg); c.toggle('lite',fxLight()); }
// ----- save files: the same text as a save code, as a download
function downloadSave(){
  try{ const code=exportCode(); if(!code) return false; const url=URL.createObjectURL(new Blob([code],{type:'text/plain'})), a=document.createElement('a');
    a.href=url; a.download='ledger-of-the-dead-day'+S.day+'-lv'+S.player.lvl+'.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),2000); return true; }catch(e){ return false; }
}
function importText(txt){   // a save file holds a save code; plain JSON saves work too
  txt=String(txt||'').trim(); if(txt.indexOf(CODE_TAG)===0) return importCode(txt);
  try{ return adoptSave(JSON.parse(txt)); }catch(e){ return false; }
}

// ----- icons (32x32 silhouettes; .c = cutout, .cs = cut line, .s = stroke)
const GH='M16 2c-6 0-10 5-10 11v17l3-3 3 3 4-3 4 3 3-3 3 3V13c0-6-4-11-10-11z';
const SK='<path d="M16 3C9 3 5 8 5 14c0 4 2 6 4 8v4h14v-4c2-2 4-4 4-8 0-6-4-11-11-11z"/><circle class="c" cx="11.5" cy="14" r="3"/><circle class="c" cx="20.5" cy="14" r="3"/><path class="c" d="M16 18l-2 4h4z"/><path class="cs" d="M13 23v3M16 23v3M19 23v3"/>';
const RAT='<ellipse cx="14" cy="19" rx="9" ry="6"/><path d="M21 14l9 5-9 6z"/><circle cx="20" cy="13.5" r="3.2"/><path class="s" d="M5 19c-4-1-5-5-2-8"/><circle class="c" cx="25" cy="19" r="1.1"/><rect x="9" y="23" width="2.6" height="5"/><rect x="17" y="23" width="2.6" height="5"/>';
const HOOD='<path d="M16 2C9 2 6 9 6 16c0 5-2 9-4 14h28c-2-5-4-9-4-14 0-7-3-14-10-14z"/><path class="c" d="M16 9c-4 0-6 3-6 7s2 7 6 7 6-3 6-7-2-7-6-7z"/><circle cx="13.5" cy="15.5" r="1.2"/><circle cx="18.5" cy="15.5" r="1.2"/>';
const HELMB='<path d="M6 28V14C6 8 10 4 16 4s10 4 10 10v14h-5v-8H11v8z"/><rect class="c" x="9" y="13" width="14" height="3"/>';
const TREE='<circle cx="10" cy="11" r="6"/><circle cx="22" cy="11" r="6"/><circle cx="16" cy="7" r="6"/><circle cx="16" cy="14" r="6"/><rect x="14" y="16" width="4" height="14"/><path d="M14 27l-5 3h5zM18 27l5 3h-5z"/>';
const CROWN='<path class="gold" d="M5 3l3 3 3-4 3 4 3-3-1.5 7h-9z"/>';
const GLYPH={
 'Tunnel Rat':RAT,
 'Grave Beetle':'<ellipse cx="16" cy="19" rx="8.5" ry="10"/><circle cx="16" cy="7" r="3.6"/><path class="cs" d="M16 11v17"/><path class="s" d="M8 14L3 11M7.5 19H2M9 24l-5 4M24 14l5-3M24.5 19H30M23 24l5 4M14 4L11 1M18 4l3-3"/>',
 'Marrow Mite':'<circle cx="16" cy="19" r="5.5"/><circle cx="16" cy="11" r="3.5"/><circle class="c" cx="14.7" cy="10.5" r=".9"/><circle class="c" cx="17.3" cy="10.5" r=".9"/><path class="s" d="M11 16L3 10M10.5 19H2M11 22l-8 4M13 24l-5 6M21 16l8-6M21.5 19H30M21 22l8 4M19 24l5 6"/>',
 'The Rat King':'<g transform="translate(0 4) scale(.92)">'+RAT+'</g><g transform="translate(11 0)">'+CROWN+'</g>',
 'Skeleton Guard':SK+'<path class="cs" d="M5.5 9.5h21M16 9.5v5"/>',
 'Crypt Ghoul':'<path d="M16 3c-6 0-9 5-9 11 0 4 1 7 3 9l1 6h10l1-6c2-2 3-5 3-9 0-6-3-11-9-11z"/><path class="c" d="M9.5 12l5 2-4.5 2zM22.5 12l-5 2 4.5 2z"/><path class="c" d="M10 21h12l-2 5-2-3-2 3-2-3-2 3z"/>',
 'Drowned Priest':HOOD+'<path class="cs" d="M16 25v5M13.5 27h5"/>',
 'The Crypt Warden':HELMB+'<circle class="gold" cx="16" cy="20.5" r="2.6"/><rect class="gold" x="15.2" y="22" width="1.6" height="6"/><rect class="gold" x="16.8" y="25" width="2.5" height="1.4"/>',
 'Ash Husk':'<circle cx="16" cy="20" r="9"/><path d="M16 1c-3 4 2 6-1 10 4-1 6-4 5-8 3 3 3 7 0 10h-8c-3-3-2-8 4-12z"/><circle class="c" cx="12.5" cy="20" r="2"/><circle class="c" cx="19.5" cy="20" r="2"/><path class="cs" d="M16 24v4M23 15l-3 4"/>',
 'Barrow Wight':'<path d="'+GH+'"/><ellipse class="c" cx="12" cy="13" rx="2" ry="2.8"/><ellipse class="c" cx="20" cy="13" rx="2" ry="2.8"/><ellipse class="c" cx="16" cy="20" rx="2" ry="2.5"/>',
 'Pyre Witch':'<path d="M16 2L9 18h14z"/><rect x="3" y="18" width="26" height="3" rx="1"/><path class="cs" d="M11.5 13h9"/><path class="ember" transform="translate(2 0)" d="M7 30c-1-4 3-5 3-9 3 2 4 5 3 9 2-1 4-3 4-7 3 2 5 5 4 7z"/>',
 'The Ember Knight':HELMB+'<path class="ember" d="M13 5c-3-3 1-4 0-5 5 1 6 5 4 8z"/>',
 'Stone Gargoyle':'<path d="M12 10h8l3 6-2 8h-10l-2-8z"/><path d="M12 10L8 3l5 5zM20 10l4-7-5 5z"/><path d="M10 14L1 10l3 8-2 6 8-3zM22 14l9-4-3 8 2 6-8-3z"/><path class="c" d="M12 15l3 1.5-3 1zM20 15l-3 1.5 3 1z"/><path class="cs" d="M14 22v2M18 22v2"/>',
 'Nave Stalker':'<path d="M3 2c7 7 8 18 4 28-3-9-6-19-4-28z"/><path transform="translate(10 -1)" d="M3 2c7 7 8 18 4 28-3-9-6-19-4-28z"/><path transform="translate(20 1)" d="M3 2c6 7 7 17 3 27-3-9-5-18-3-27z"/>',
 'Hollow Chorister':'<circle cx="14" cy="16" r="10"/><ellipse class="c" cx="14" cy="21" rx="4" ry="5"/><path class="cs" d="M8 12l4 1.5M20 12l-4 1.5"/><path class="s" d="M26 9c3 3 3 9 0 12M28 7c4 4 4 14 0 18"/>',
 'The Bishop of Teeth':'<path d="M16 2L6 22h20z"/><rect x="5" y="22" width="22" height="5"/><path class="cs" style="stroke-width:2.2" d="M16 8v10M11.5 12.5h9"/><path class="c" d="M5 22l2.2 4 2.2-4 2.2 4 2.2-4 2.2 4 2.2-4 2.2 4 2.2-4 2.2 4 2.2-4z"/>',
 'Thorn Troll':'<path d="M5 8l5-5h12l5 5v10c0 6-5 10-11 10S5 24 5 18z"/><rect class="c" x="9" y="14" width="5" height="3"/><rect class="c" x="18" y="14" width="5" height="3"/><rect class="c" x="10" y="21" width="12" height="3"/><path d="M10 22l-2 7 5-4zM22 22l2 7-5-4z"/>',
 'Rust Knight':HELMB+'<path d="M16 4c0-3 5-4 8-2-2 1-3 3-3 6z"/>',
 'Sap Weaver':TREE+'<path class="cs" d="M16 2v13M7 8l18 8M25 8L7 16"/>',
 'The Orchard Mother':TREE+'<path class="c" d="M11 9l4 2-4 2zM21 9l-4 2 4 2z"/><ellipse class="c" cx="16" cy="16.5" rx="2.5" ry="2"/>',
 'Throne Guard':'<path d="M16 2l11 4v9c0 8-5 13-11 15C10 28 5 23 5 15V6z"/><path class="cs" style="stroke-width:2.4" d="M16 7v17M10 13h12"/>',
 'Ash Revenant':'<path d="M7 9L2 2l8 4zM25 9l5-7-8 4z"/>'+SK,
 'Whisper Choir':'<g style="stroke:var(--well);stroke-width:1.4"><path transform="translate(-1 8) scale(.6)" d="'+GH+'"/><path transform="translate(13 8) scale(.6)" d="'+GH+'"/><path transform="translate(5 1) scale(.7)" d="'+GH+'"/></g><ellipse class="c" cx="6.2" cy="15.8" rx="1" ry="1.4"/><ellipse class="c" cx="11" cy="15.8" rx="1" ry="1.4"/><ellipse class="c" cx="20.2" cy="15.8" rx="1" ry="1.4"/><ellipse class="c" cx="25" cy="15.8" rx="1" ry="1.4"/><ellipse class="c" cx="13.4" cy="10.1" rx="1.2" ry="1.7"/><ellipse class="c" cx="19" cy="10.1" rx="1.2" ry="1.7"/>',
 'The Pale Sovereign':'<g transform="translate(4 8) scale(.75)">'+SK+'</g><g transform="translate(5 0)">'+CROWN+'</g>',
 'Necromancer':'<g transform="translate(-2 2) scale(.92)">'+HOOD+'</g><path class="s" d="M29 9v21"/><circle cx="29" cy="6" r="3"/><circle class="c" cx="28" cy="5.5" r=".8"/><circle class="c" cx="30" cy="5.5" r=".8"/>',
 '_':SK
};
// ===== ICONS v2 : 64x64 shaded illustrations =====
const E=(x,y,r,c)=>{ r=r||1.8; c=c||'#ffd27a'; return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+(r*2.6)+'" ry="'+(r*1.7)+'" fill="'+c+'" opacity=".2"/><ellipse cx="'+x+'" cy="'+y+'" rx="'+(r*1.25)+'" ry="'+(r*.6)+'" fill="'+c+'"/>'; };   // a narrow glare, not a round dot
const P=(d,c)=>'<path class="'+(c||'b')+'" d="'+d+'"/><path class="tx tx-'+(c||'b')+'" d="'+d+'"/><path d="'+d+'" fill="url(#gSh)"/>';   // fill, surface texture (by material), then light
const D=d=>'<path class="dk" d="'+d+'"/>';
const L=(d,w)=>'<path class="st" d="'+d+'"'+(w?' style="stroke-width:'+w+'"':'')+'/>';
const T=(d,w,c)=>'<path class="stb" d="'+d+'" style="stroke-width:'+(w||2)+(c?';stroke:'+c:'')+'"/>';
const GR=(t,s)=>'<g transform="'+t+'">'+s+'</g>';
const HELLC='#ff5a3c', SOULC='#9be870', FIREC='#ffb347';
const FLM=(x,y,s,c)=>GR('translate('+x+' '+y+') scale('+(s||1)+')','<path d="M0-14C-5-7 4-5 0 2C-6 0-9-6-4-11C-4-8-2-8 0-14ZM1 6C-7 5-8-3-3-8C-1-3 7-1 5 5C4 6 2 6 1 6Z" fill="'+(c||'#e08a3c')+'"/><path d="M0-5C-3-1 3 0 0 5C-4 3-4-2 0-5Z" fill="#ffd27a"/>');
const SKULL=(x,y,s,c,eye)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',
  P('M0-17C-10-17-16-10-16-1C-16 5-13 8-10 10V17H10V10C13 8 16 5 16-1C16-10 10-17 0-17Z',c||'bn')
  +'<ellipse class="dk" cx="-6.2" cy="-1" rx="4.6" ry="5.2"/><ellipse class="dk" cx="6.2" cy="-1" rx="4.6" ry="5.2"/><path class="dk" d="M0 5L-2.8 10.5H2.8Z"/>'
  +'<path class="st" d="M-6.5 13.5v3.5M-2.2 13.5v3.5M2.2 13.5v3.5M6.5 13.5v3.5" style="stroke-width:1.3"/>'+(eye?E(-6.2,-1,1.7,eye)+E(6.2,-1,1.7,eye):''));
const HELM=(x,y,s,c,slit)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',
  P('M-17 20V-4C-17-14-9-21 0-21S17-14 17-4V20H8V9H-8V20Z',c||'b')+D('M-12-3H12V3H-12Z')+L('M0-21V-3M0 3V9',1.4)+(slit?E(-6,0,1.5,slit)+E(6,0,1.5,slit):''));
const HORNP=(x,y,s,c)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',P('M-8 0C-14-2-19-8-18-17C-14-11-9-8-5-6Z','bn')+P('M8 0C14-2 19-8 18-17C14-11 9-8 5-6Z','bn'));
const HOODP=(x,y,s,c)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',P('M0-24C-13-24-19-13-19-2C-19 10-25 20-29 30H29C25 20 19 10 19-2C19-13 13-24 0-24Z',c||'b')+'<path class="dk" d="M0-14C-8-14-12-8-12-1C-12 7-7 12 0 12S12 7 12-1C12-8 8-14 0-14Z"/>');
const CROWNP=(x,y,s)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',P('M-14 8L-17-8L-8-1L0-12L8-1L17-8L14 8Z','gd')+'<circle cx="0" cy="-12" r="2" fill="#ffe9a8"/><circle cx="-17" cy="-8" r="1.7" fill="#ffe9a8"/><circle cx="17" cy="-8" r="1.7" fill="#ffe9a8"/>');
const WINGS=(c)=>P('M26 30C14 14 4 12 1 14C3 24 10 34 22 38Z',c||'m')+P('M38 30C50 14 60 12 63 14C61 24 54 34 42 38Z',c||'m')+L('M22 30C14 24 8 20 4 17M22 33C15 29 10 26 6 24M42 30C50 24 56 20 60 17M42 33C49 29 54 26 58 24',1);
const IC={};
// ---- E : Rat Warren
IC['Tunnel Rat']=T('M12 42C4 44 1 52 8 57',2.6,'currentColor')+P('M10 40C10 29 20 25 31 26C39 26 45 30 48 34L59 37L48 42C45 47 36 50 26 50C16 50 10 46 10 40Z')
 +P('M36 27a5.5 5.5 0 1 1 .1 0Z','m')+D('M36 27a2.8 2.8 0 1 1 .1 0Z')+P('M20 48v8h6v-8Z','m')+P('M34 48v8h6v-8Z','m')
 +L('M17 34C21 31 26 31 29 34M15 40C19 38 24 38 27 40')+E(47,35,1.7,'#ff8a5c')+'<circle cx="59" cy="37" r="1.8" class="dk"/>'
 +'<path fill="#e9dfc6" d="M49 42l1.8 4 1.8-4z"/>'+L('M52 36L63 32M52 39L63 41',1);
IC['Grave Beetle']=T('M20 18L9 10M19 28L6 28M20 38L8 48M44 18L55 10M45 28L58 28M44 38L56 48',2.4,'currentColor')
 +P('M32 14C46 14 52 26 52 38C52 50 44 58 32 58C20 58 12 50 12 38C12 26 18 14 32 14Z')+L('M32 18V57',1.6)
 +P('M32 8C38 8 41 13 40 18H24C23 13 26 8 32 8Z','m')+P('M24 10C20 8 18 6 16 2C21 3 24 5 26 8Z','bn')+P('M40 10C44 8 46 6 48 2C43 3 40 5 38 8Z','bn')
 +E(28,13,1.4,'#8fd46a')+E(36,13,1.4,'#8fd46a')+L('M16 30C20 28 24 28 28 30M36 30C40 28 44 28 48 30M15 42C20 40 25 40 29 42M35 42C40 40 45 40 49 42',1.2)
 +'<path d="M20 26C22 22 26 20 29 20" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none" stroke-linecap="round"/>';
IC['Marrow Mite']=T('M24 34L8 26L4 36M24 38L6 42L8 54M24 42L12 56M40 34L56 26L60 36M40 38L58 42L56 54M40 42L52 56M26 30L16 16M38 30L48 16',2,'currentColor')
 +P('M32 24C42 24 48 31 48 39C48 49 41 56 32 56C23 56 16 49 16 39C16 31 22 24 32 24Z')+P('M32 14C38 14 41 18 41 23C41 26 37 28 32 28C27 28 23 26 23 23C23 18 26 14 32 14Z','m')
 +E(28,21,1.5,'#ff8a5c')+E(36,21,1.5,'#ff8a5c')+L('M24 40C28 37 36 37 40 40M22 46C28 43 36 43 42 46',1.2)+'<circle cx="32" cy="50" r="3.6" fill="#e9dfc6" opacity=".75"/>';
IC['The Rat King']=GR('translate(0 6)',T('M8 40C2 44 4 54 12 56M56 40C62 44 60 54 52 56M32 54C30 60 36 62 40 58',2.4,'currentColor')
 +P('M32 14C46 14 54 24 54 34C54 46 44 54 32 54C20 54 10 46 10 34C10 24 18 14 32 14Z')
 +P('M16 20a8 8 0 1 1 .1 0Z','m')+P('M48 20a8 8 0 1 1 .1 0Z','m')+D('M16 20a4.2 4.2 0 1 1 .1 0ZM48 20a4.2 4.2 0 1 1 .1 0Z')
 +P('M32 34C40 36 44 42 40 48C37 52 27 52 24 48C20 42 24 36 32 34Z','m')+'<circle cx="32" cy="38" r="2.6" class="dk"/>'
 +E(22,30,2,'#ff6a3c')+E(42,30,2,'#ff6a3c')+'<path fill="#e9dfc6" d="M28 47l2 5 2-5zM33 47l2 5 2-5z"/>'+L('M14 38L2 34M14 42L2 44M50 38L62 34M50 42L62 44',1))
 +CROWNP(32,10,.95);
IC['Tannery Brute']=P('M6 62V46C6 38 14 34 24 33H40C50 34 58 38 58 46V62Z')+P('M32 6C42 6 48 14 48 24C48 32 42 38 32 38C22 38 16 32 16 24C16 14 22 6 32 6Z','m')
 +P('M14 62L20 38L28 40L26 62ZM50 62L44 38L36 40L38 62Z','dk')+L('M20 42L30 62M44 42L34 62',1.2)+D('M20 20H44V24H20Z')+E(25,22,1.4,'#ffd27a')+E(39,22,1.4,'#ffd27a')
 +'<path fill="#e9dfc6" d="M24 32l-3 9 6-4zM40 32l3 9-6-4z"/>'+L('M26 31C30 33 34 33 38 31',1.4)+L('M20 12L30 14M44 12L34 14',1.2);
IC['Shiv Cutpurse']=P('M8 62C8 50 16 44 30 44C44 44 50 50 50 62Z','m')+P('M30 16C38 16 42 22 42 30C42 38 37 44 30 44C23 44 18 38 18 30C18 22 22 16 30 16Z','b')+'<path d="M18 31H42C42 39 37 45 30 45C23 45 18 39 18 31Z" fill="#6e2a20"/><path d="M18 31H42C42 39 37 45 30 45C23 45 18 39 18 31Z" fill="url(#gSh)"/><path d="M41 34L48 40L44 42Z" fill="#6e2a20"/>'+P('M18 18C18 8 24 4 30 4C36 4 42 8 42 18Z','m')+T('M18 16H42',2,'#8a6a3e')+P('M3 22C3 18 15 16 30 16C45 16 57 18 57 22C57 25 45 24 30 24C15 24 3 25 3 22Z','m')+D('M20 24H40V30H20Z')+E(25,27,1.3,'#ffd27a')+E(35,27,1.3,'#ffd27a')+P('M53 32L58 52L55 55L49 52Z','bn')+L('M54 35L56 51',1)+P('M46 52H60V56H46Z','gd')+'<rect x="51" y="56" width="4" height="8" class="dk"/>';
IC['Tallow Chandler']=P('M10 62C10 50 14 40 20 34C24 30 40 30 44 34C50 40 54 50 54 62Z','bn')+P('M24 7H28V17H24ZM36 6H40V17H36ZM30 4H34V15H30Z','b')+FLM(26,5,.38)+FLM(38,4,.38)+FLM(32,2,.4)+P('M32 14C40 14 44 20 44 28C44 34 40 38 32 38C24 38 20 34 20 28C20 20 24 14 32 14Z','bn')+'<path d="M22 30V41M42 30V44M27 38V47M38 38V45" stroke="#e9dfc6" stroke-width="3" stroke-linecap="round"/>'+D('M24.5 25C24.5 22.5 30 22.5 30 25C30 27.5 24.5 27.5 24.5 25ZM34 25C34 22.5 39.5 22.5 39.5 25C39.5 27.5 34 27.5 34 25Z')+E(27.2,25,1.2,'#ffd27a')+'<path d="M37 15V31" stroke="#e9dfc6" stroke-width="4.4" stroke-linecap="round"/>'+D('M28 31C28 29.5 36 29.5 36 31C36 35 34.5 38 32 38C29.5 38 28 35 28 31Z')+P('M14 54H50V60H14Z','m');

// ---- D : Sunken Crypt
IC['Skeleton Guard']=P('M32 4L38 12H26Z','bn')+L('M32 4V56',0)+P('M45 24H62V40C62 50 54 56 53.5 58C53 56 45 50 45 40Z','m')+L('M53.5 24V56M45 32H62',1.2)
 +SKULL(26,32,1,'bn',FIREC)+P('M10 20C10 12 18 8 26 8S42 12 42 20V26H10Z','b')+L('M26 8V26',1.4)
 +P('M12 50C12 44 18 42 26 42S40 44 40 50V62H12Z','b')+L('M18 50L34 62M34 50L18 62',1.2);
IC['Crypt Ghoul']=P('M10 62C10 50 14 44 22 42H42C50 44 54 50 54 62Z','m')+P('M32 6C44 6 50 16 50 26C50 32 48 36 46 40L44 46H20L18 40C16 36 14 32 14 26C14 16 20 6 32 6Z','bn')
 +D('M16 22L28 28L18 32ZM48 22L36 28L46 32Z')+E(23,28,1.5,'#ff8a5c')+E(41,28,1.5,'#ff8a5c')+D('M20 38C26 36 38 36 44 38L42 48H22Z')
 +'<path fill="#e9dfc6" d="M23 38l2 5 2-5zM29 38l2 6 2-6zM35 38l2 5 2-5zM41 38l-1 4-2-4z"/>'+L('M24 10C26 14 24 18 22 20M40 10C38 14 40 18 42 20',1.2)
 +'<path d="M4 54L8 40L12 54ZM60 54L56 40L52 54Z" class="bn"/>';
IC['Drowned Priest']=P('M6 62C6 50 16 44 32 44C48 44 58 50 58 62Z','m')+T('M24 46L27 62M40 46L37 62',2.6,'#d3a64d')+P('M32 8C46 8 52 18 52 28C52 38 44 46 32 46C20 46 12 38 12 28C12 18 18 8 32 8Z','b')+D('M19 24C19 20 30 20 30 24C30 28 19 28 19 24ZM34 24C34 20 45 20 45 24C45 28 34 28 34 24Z')+E(25,24,1.4,SOULC)+E(39,24,1.4,SOULC)+D('M27 34C27 31 37 31 37 34C37 39 34 42 32 42C30 42 27 39 27 34Z')+T('M16 16C10 22 14 30 8 38M22 10C18 18 22 24 18 32M48 16C54 22 50 30 56 38M42 10C46 18 42 24 46 32',2.4,'#5f9a58')+'<path d="M14 40C14 44 12 44 12 47M50 40C50 44 52 44 52 47" stroke="#7fc1bd" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>'+'<path d="M4 56C12 52 18 58 26 54S40 58 48 54 58 58 62 54V64H4Z" fill="#6ea8a4" opacity=".55"/>';
IC['The Crypt Warden']=P('M8 62V40C8 30 16 24 32 24S56 30 56 40V62Z','m')+HELM(32,28,1.05,'b','#ffd27a')+P('M8 40H20V54H8ZM44 40H56V54H44Z','m')
 +'<circle cx="32" cy="52" r="5" fill="#d3a64d"/><circle cx="32" cy="52" r="2" class="dk"/><rect x="31" y="56" width="2.4" height="8" fill="#d3a64d"/><rect x="33" y="60" width="4" height="2.2" fill="#d3a64d"/>'
 +'<path d="M20 4L32 10L44 4L40 16H24Z" class="gd"/>'+CROWNP(32,6,.5);
IC['Drowned Sentinel']=P('M6 62V44C6 34 16 30 32 30S58 34 58 44V62Z','m')+P('M32 4C45 4 52 14 52 26C52 38 45 44 32 44C19 44 12 38 12 26C12 14 19 4 32 4Z','b')+'<circle cx="32" cy="24" r="11" class="gd"/>'+D('M32 15.5a8.5 8.5 0 1 0 .1 0Z')+'<ellipse cx="32" cy="24" rx="6" ry="3.4" fill="#9be870" opacity=".3"/>'+E(32,24,2,SOULC)+L('M23.5 24H40.5M32 15.5V32.5',1)+'<g class="gd"><circle cx="16" cy="20" r="1.6"/><circle cx="48" cy="20" r="1.6"/><circle cx="16" cy="32" r="1.6"/><circle cx="48" cy="32" r="1.6"/></g>'+'<g fill="#cfc6b0"><circle cx="20" cy="10" r="2.2"/><circle cx="24" cy="7" r="1.4"/><circle cx="45" cy="38" r="2"/><circle cx="14" cy="52" r="2.4"/></g>'+T('M46 8C52 14 48 20 54 26',2.6,'#5f9a58')+'<path d="M4 56C12 52 18 58 26 54S40 58 48 54 58 58 62 54V64H4Z" fill="#6ea8a4" opacity=".55"/>';
IC['Coffin Crawler']=T('M18 24L6 14L2 22M16 32L2 34M16 42L4 54M46 24L58 14L62 22M48 32L62 34M48 42L60 54',2.6,'currentColor')
 +P('M24 6H40L52 22L44 58H20L12 22Z','m')+P('M27 10H37L46 23L40 54H24L18 23Z')+L('M32 14V46M25 24H39',1.6)
 +E(28,30,1.5,'#ff8a5c')+E(36,30,1.5,'#ff8a5c')+'<path fill="#e9dfc6" d="M27 38l2 4 2-4zM33 38l2 4 2-4z"/>';
IC['Tide Acolyte']=P('M8 62C8 50 16 44 28 44C40 44 48 50 48 62Z','m')+P('M18 14L22 4L27 12L31 3L34 12Z','m')+P('M8 30C8 18 18 10 30 12C38 13 44 18 46 24L38 28L46 32C42 40 34 44 24 44C14 44 8 38 8 30Z','b')+L('M28 21C25 26 25 32 28 38M32 20C29 26 29 32 32 39',1.4)+D('M14 26C14 22 22 22 22 26C22 30 14 30 14 26Z')+E(18,26,1.5,SOULC)+'<path fill="#e9dfc6" d="M38 27l3 1.6-3 .9zM39 30l3 1.4-3 1z"/>'+T('M54 62V12',2.6,'#d3a64d')+P('M47 14V5C47 5 50 8 54 8S61 5 61 5V14C61 18 58 20 54 20S47 18 47 14Z','gd')+'<path d="M54 5V20" stroke="#0a0807" stroke-width="1.2"/>'+'<path d="M6 8C6 12 3 12 3 16" stroke="#7fc1bd" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>';

// ---- C : Ashen Barrow
IC['Ash Husk']=P('M32 8C46 8 54 18 54 32C54 48 44 58 32 58C20 58 10 48 10 32C10 18 18 8 32 8Z')+L('M32 8L28 22L36 30L30 42L34 58M16 20L26 26M48 18L40 26M14 40L24 38M50 42L42 40',1.6)
 +'<path d="M28 22L36 30L30 42M26 26L16 20M40 26L48 18" stroke="#ff8a3c" stroke-width="1.3" fill="none" stroke-linecap="round"/>'
 +D('M18 28H28V36H18ZM36 28H46V36H36Z')+E(23,32,1.8,'#ff7a2c')+E(41,32,1.8,'#ff7a2c')+FLM(32,6,.5,'#e08a3c');
IC['Barrow Wight']=P('M32 4C18 4 12 14 12 26V60L19 54L26 60L32 54L38 60L45 54L52 60V26C52 14 46 4 32 4Z')+'<path d="M12 26V60L19 54L26 60L32 54L38 60L45 54L52 60V26" fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="1.4"/>'
 +D('M18 20C22 16 28 18 29 26C28 32 22 34 19 30ZM46 20C42 16 36 18 35 26C36 32 42 34 45 30Z')+E(23.5,25,1.7,'#9be870')+E(40.5,25,1.7,'#9be870')+D('M26 40C28 46 36 46 38 40C38 50 26 50 26 40Z')
 +L('M18 8C24 6 40 6 46 8',1);
IC['Pyre Witch']=P('M32 4L44 34H20Z')+P('M6 34H58V40H6Z','m')+'<path d="M20 34L32 4L44 34Z" fill="none"/>'+T('M25 30H39',2.4,'#d3a64d')
 +P('M18 40H46V46C46 52 40 56 32 56C24 56 18 52 18 46Z','bn')+E(26,47,1.4,'#ff8a3c')+E(38,47,1.4,'#ff8a3c')+L('M26 52C30 54 34 54 38 52',1.4)
 +P('M12 62C12 58 20 56 32 56S52 58 52 62Z','m')+FLM(10,50,.9)+FLM(54,50,.9)+L('M18 58C22 54 28 56 32 54',0);
IC['The Ember Knight']=P('M8 62V40C8 30 16 24 32 24S56 30 56 40V62Z','m')+HELM(32,30,1.05,'b','#ff7a2c')
 +'<path d="M32 8C26 14 38 14 32 22C42 20 44 12 36 4C38 8 34 8 32 8Z" fill="#e08a3c"/>'+FLM(32,6,1.2)+P('M4 40H18L16 50H6ZM46 40H60L58 50H48Z','m');
IC['Barrow Thrall']=P('M6 62V46C6 38 14 34 24 33H40C50 34 58 38 58 46V62Z','m')+P('M32 6C42 6 48 14 48 24C48 32 42 38 32 38C22 38 16 32 16 24C16 14 22 6 32 6Z','bn')
 +D('M20 20H29V27H20ZM35 20H44V27H35Z')+E(24.5,23.5,1.3,'#ffd27a')+E(39.5,23.5,1.3,'#8fd46a')+L('M24 32C28 34 36 34 40 32',1.4)+L('M28 33V36M32 33V36M36 33V36',1)
 +L('M16 46L24 56M48 46L40 58M30 44L34 60',1.2)+'<path d="M20 8C24 4 40 4 44 8L40 12H24Z" class="b"/>';
IC['Ember Stalker']=T('M54 34C62 26 62 16 55 10',2.6,'currentColor')+FLM(55,9,.45)+P('M20 28C28 22 44 22 52 28C58 32 60 38 58 44H49L45 38H27L23 46H14L16 38C14 34 16 30 20 28Z')+P('M17 44H24V58H18ZM45 42H51L53 58H47Z','m')+P('M3 36L6 24L11 30C13 27 19 25 24 27L22 41H8C5 41 3 39 3 36Z')+L('M30 29V36M36 28V36M42 29V36',1.3)+E(11,31,1.4,'#ff7a2c')+'<path fill="#e9dfc6" d="M5 39l1.4 4 1.4-4zM9 39l1.4 3.5 1.4-3.5z"/>'+FLM(31,22,.32)+FLM(40,20,.36)+FLM(48,23,.3);
IC['Cinder Weaver']='<g fill="none" stroke="currentColor" stroke-width="1" opacity=".35"><path d="M32 2V62M2 32H62M8 8L56 56M56 8L8 56"/><circle cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="24"/></g>'+T('M32 22V2',1,'currentColor')+T('M26 31L12 19L6 25M24 35L8 35L4 43M26 39L12 49L10 59M38 31L52 19L58 25M40 35L56 35L60 43M38 39L52 49L54 59',2.4,'currentColor')+P('M32 34C40 34 46 40 46 48C46 56 40 60 32 60C24 60 18 56 18 48C18 40 24 34 32 34Z')+'<path d="M32 39L37 47L32 56L27 47Z" fill="#e08a3c"/><path d="M32 43L34.5 47L32 51L29.5 47Z" fill="#ffd27a"/>'+P('M32 22C37 22 40 26 40 30C40 34 36 36 32 36C28 36 24 34 24 30C24 26 27 22 32 22Z','m')+E(29,29,1.1,'#ff7a2c')+E(35,29,1.1,'#ff7a2c')+E(30.5,26,.75,'#ff7a2c')+E(33.5,26,.75,'#ff7a2c');
// ---- B : Hollow Cathedral
IC['Stone Gargoyle']=WINGS('m')+P('M22 18L32 12L42 18L46 34L40 52H24L18 34Z')+P('M22 18L14 4L28 14ZM42 18L50 4L36 14Z','m')
 +D('M23 27L30 30L24 34ZM41 27L34 30L40 34Z')+E(27,30,1.5,'#ffb347')+E(37,30,1.5,'#ffb347')+D('M26 40L32 44L38 40V46L32 48L26 46Z')+'<path fill="#e9dfc6" d="M27 44l1.5 4 1.5-4zM34 44l1.5 4 1.5-4z"/>'+L('M26 20L28 26M38 20L36 26',1);
IC['Nave Stalker']=P('M26 4C34 4 38 10 36 18L40 40L36 62H28L24 40L28 18C26 12 24 8 26 4Z')+D('M26 11H34V16H26Z')+E(28.5,13.5,1.2,'#ff8a5c')+E(32.5,13.5,1.2,'#ff8a5c')
 +T('M26 26L10 38L4 58M40 26L56 38L60 58',3,'currentColor')+'<path fill="#e9dfc6" d="M2 58l2-6 3 6zM6 59l3-6 2 6zM62 58l-2-6-3 6zM58 59l-3-6-2 6z"/>'+L('M28 30L36 32M28 40L36 42',1.2);
IC['Hollow Chorister']=P('M32 6C44 6 50 16 50 26C50 36 44 42 38 44V50H26V44C20 42 14 36 14 26C14 16 20 6 32 6Z','bn')+D('M19 21H29V27H19ZM35 21H45V27H35Z')+E(24,24,1.3,'#9be870')+E(40,24,1.3,'#9be870')
 +'<ellipse class="dk" cx="32" cy="36" rx="6" ry="7"/>'+P('M12 62C12 54 20 50 32 50S52 54 52 62Z','b')+T('M54 14C60 20 60 32 54 38M58 8C66 18 66 36 58 46',1.8,'currentColor')+T('M10 14C4 20 4 32 10 38M6 8C-2 18-2 36 6 46',1.8,'currentColor');
IC['The Bishop of Teeth']=P('M32 2L48 30H16Z','gd')+P('M16 30H48V38H16Z','b')+'<path d="M32 8V24M26 14H38" stroke="#0a0807" stroke-width="2.6" stroke-linecap="round"/>'
 +P('M10 38H54V46L50 52H14L10 46Z','b')+D('M14 40H50V48H14Z')+'<path fill="#e9dfc6" d="M15 40l3 8 3-8 3 8 3-8 3 8 3-8 3 8 3-8 3 8 3-8 3 8 2-8z"/>'+E(24,28,1.3,'#ff6a3c')+E(40,28,1.3,'#ff6a3c')
 +P('M14 54H50V62H14Z','m')+'<path fill="#e9dfc6" d="M16 54l3 6 3-6 3 6 3-6 3 6 3-6 3 6 3-6 3 6 3-6 3 6z"/>';
IC['Glass Sentinel']=P('M32 2L52 14V34L32 60L12 34V14Z','m')+'<path d="M32 2L52 14L32 22Z" fill="#fff" opacity=".28"/><path d="M12 14L32 22L12 34Z" fill="#fff" opacity=".12"/><path d="M52 34L32 22V60Z" fill="#000" opacity=".25"/>'
 +L('M32 2V60M12 14L52 34M52 14L12 34',1.2)+'<path d="M32 22L24 28H40Z" fill="currentColor"/>'+E(26,29,1.5,'#9be0e0')+E(38,29,1.5,'#9be0e0');
IC['Tooth Collector']=P('M6 6H58V28C58 44 46 52 32 52C18 52 6 44 6 28Z','m')+D('M10 10H54V28C54 40 44 46 32 46C20 46 10 40 10 28Z')
 +'<path fill="#e9dfc6" d="M12 10h8l-2 14zM22 10h9l-3 20zM33 10h9l-3 20zM44 10h8l-3 14z"/><path fill="#e9dfc6" d="M16 44l2-12 3 14zM26 46l2-12 4 12zM36 46l1-12 5 12zM46 42l1-10 3 10z"/>'
 +E(18,28,1.6,'#ff8a5c')+E(46,28,1.6,'#ff8a5c')+P('M20 54H44V62H20Z','b');
IC['Vestment Wraith']=P('M14 22C8 26 4 34 4 42C8 40 12 38 16 34Z','m')+P('M50 22C56 26 60 34 60 42C56 40 52 38 48 34Z','m')+P('M20 14C26 10 38 10 44 14L50 40C52 50 56 56 60 62C52 58 48 62 42 58C38 62 34 58 32 62C30 58 26 62 22 58C16 62 12 58 4 62C8 56 12 50 14 40Z','b')+D('M21 14C26 18 38 18 43 14C41 23 37 27 32 27C27 27 23 23 21 14Z')+'<ellipse cx="32" cy="20" rx="7" ry="3.4" fill="#9be870" opacity=".22"/>'+E(29,20,1.1,SOULC)+E(35,20,1.1,SOULC)+P('M26 27H38L40 58H24Z','gd')+T('M32 33V45M28 38H36',1.6,'#0a0807');

// ---- A : Iron Orchard
IC['Thorn Troll']=P('M4 62V44C4 36 12 32 22 32H42C52 32 60 36 60 44V62Z','m')+P('M32 6C44 6 50 14 50 24C50 34 44 40 32 40C20 40 14 34 14 24C14 14 20 6 32 6Z')+'<path d="M14 18L6 10L20 14ZM50 18L58 10L44 14ZM24 8L22 0L30 7ZM40 8L42 0L34 7Z" fill="#6a8a46"/>'
 +D('M18 22H29V27H18ZM35 22H46V27H35Z')+E(23.5,24.5,1.4,'#ffd27a')+E(40.5,24.5,1.4,'#ffd27a')+'<path fill="#e9dfc6" d="M22 36l2-8 3 8zM42 36l-2-8-3 8z"/>'+'<path d="M8 44L2 38L12 40ZM56 44L62 38L52 40ZM20 36L16 30L24 34ZM44 36L48 30L40 34Z" fill="#6a8a46"/>';
IC['Rust Knight']=P('M8 62V40C8 30 16 24 32 24S56 30 56 40V62Z','m')+HELM(32,28,1.05,'b','#ff8a3c')+'<path d="M14 14L22 20M46 12L40 20M18 36L26 40M44 38L50 34" stroke="#b8571f" stroke-width="3" stroke-linecap="round" opacity=".8"/>'
 +'<path d="M32 8C32 2 42 0 50 4C46 6 44 10 44 14Z" fill="#c24a2a"/>';
IC['Sap Weaver']=T('M16 40L4 30L8 20M20 44L6 52M48 40L60 30L56 20M44 44L58 52M24 36L12 22M40 36L52 22',2.4,'currentColor')
 +P('M32 6C44 6 52 14 52 24C52 30 48 34 44 36L42 50H22L20 36C16 34 12 30 12 24C12 14 20 6 32 6Z','m')+'<circle cx="22" cy="18" r="6" fill="#7aa046"/><circle cx="42" cy="18" r="6" fill="#7aa046"/><circle cx="32" cy="12" r="6" fill="#8ab656"/>'
 +D('M20 28H29V34H20ZM35 28H44V34H35Z')+E(24.5,31,1.3,'#ffb347')+E(39.5,31,1.3,'#ffb347')+P('M26 50H38V60H26Z','b')+'<path d="M32 50V62" stroke="#e8a63c" stroke-width="2.6"/>';
IC['The Orchard Mother']=P('M26 62L28 40H36L38 62Z','m')+P('M32 4C46 4 58 12 58 26C58 38 48 42 40 42H24C16 42 6 38 6 26C6 12 18 4 32 4Z','m')
 +'<circle cx="16" cy="16" r="9" fill="#6a8a46"/><circle cx="48" cy="16" r="9" fill="#6a8a46"/><circle cx="32" cy="10" r="9" fill="#7aa046"/><circle cx="32" cy="22" r="9" fill="#5f7c3e"/>'
 +'<circle cx="14" cy="28" r="3.4" fill="#c24a2a"/><circle cx="50" cy="26" r="3.4" fill="#c24a2a"/><circle cx="22" cy="6" r="3" fill="#e8a63c"/>'
 +P('M24 22C24 18 28 16 32 16S40 18 40 22V36C40 40 36 42 32 42S24 40 24 36Z','b')+D('M26 24H31V28H26ZM33 24H38V28H33Z')+E(28.5,26,1.3,'#ffb347')+E(35.5,26,1.3,'#ffb347')+'<ellipse class="dk" cx="32" cy="35" rx="3" ry="3.6"/>';
IC['Iron Scarecrow']=P('M30 6H34V62H30Z','m')+P('M4 22H60V28H4Z','m')+P('M32 6C40 6 44 12 44 18C44 24 40 28 32 28C24 28 20 24 20 18C20 12 24 6 32 6Z')
 +'<path d="M14 6H50L44 12H20Z" class="b"/><path d="M12 8H52" stroke="#0a0807" stroke-width="2"/>'+D('M24 14H30V19H24ZM34 14H40V19H34Z')+E(27,16.5,1.2,'#ff8a3c')+E(37,16.5,1.2,'#ff8a3c')
 +L('M26 23L28 25L30 23L32 25L34 23L36 25L38 23',1.2)+'<path d="M4 28L0 40L8 34ZM60 28L64 40L56 34Z" fill="#b8a874"/>'+P('M22 34H42L46 56H18Z','b')+L('M26 36L22 54M38 36L42 54',1);
IC['Fruit Reaver']=T('M10 60L44 8',3,'#8a6a3e')+P('M44 6C28 2 10 12 6 30C16 20 32 16 46 20C48 14 46 10 44 6Z','bn')+L('M40 10C28 10 18 16 12 26',1.2)
 +'<circle cx="44" cy="46" r="10" fill="#c2402a"/><circle cx="44" cy="46" r="10" fill="url(#gSh)"/><path d="M44 36C44 32 48 30 50 30" stroke="#6a8a46" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M38 42C40 40 42 40 44 40" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/>'
 +E(41,48,1.2,'#ffd27a')+E(48,48,1.2,'#ffd27a')+L('M40 53C43 55 47 55 50 53',1.2);
IC['Grove Shepherd']=P('M32 12C24 12 20 18 20 26C20 36 26 42 32 42S44 36 44 26C44 18 40 12 32 12Z','bn')+'<path d="M16 14C14 6 22 2 28 6C22 6 20 10 22 16Z" fill="#6a8a46"/><path d="M48 14C50 6 42 2 36 6C42 6 44 10 42 16Z" fill="#6a8a46"/>'
 +P('M10 62C10 50 18 44 32 44S54 50 54 62Z','m')+E(27,26,1.3,'#ffd27a')+E(37,26,1.3,'#ffd27a')+L('M28 34C30 36 34 36 36 34',1.4)+T('M54 62V18C54 8 44 6 44 14',2.8,'#8a6a3e')+'<path d="M48 16L44 20L48 24" stroke="#6a8a46" stroke-width="2" fill="none"/>';
// ---- S : Throne of Ash
IC['Throne Guard']=T('M52 62V6',2.4,'#c8c2b4')+P('M52 0L56 10H48Z','gd')+P('M30 2L42 20V30H18V20Z','b')+D('M20 22H40V32H20Z')+E(25,27,1.3,FIREC)+E(35,27,1.3,FIREC)+P('M28 18H32V38H28Z','m')+P('M8 34H48V54C48 60 40 64 28 64C16 64 8 60 8 54Z','m')+L('M12 38H44V54C44 58 37 61 28 61C19 61 12 58 12 54Z',1.2)+CROWNP(28,48,.5);
IC['Ash Revenant']=P('M32 4C18 4 12 14 12 28C12 40 20 46 24 52V62H40V52C44 46 52 40 52 28C52 14 46 4 32 4Z','m')+SKULL(32,28,.95,'bn','#ff7a2c')
 +'<path d="M12 28C10 20 14 12 18 8M52 28C54 20 50 12 46 8" stroke="#ff8a3c" stroke-width="2" fill="none" stroke-linecap="round"/>'+FLM(32,4,.7)+L('M20 54L26 62M44 54L38 62',1.2);
IC['Whisper Choir']=SKULL(14,34,.55,'bn',SOULC)+SKULL(50,34,.55,'bn',SOULC)+SKULL(32,28,.85,'bn',SOULC)+P('M8 62C8 52 16 48 32 48S56 52 56 62Z','b')
 +T('M6 14C2 20 2 28 6 32M58 14C62 20 62 28 58 32M26 8C28 4 36 4 38 8',1.8,'currentColor');
IC['The Pale Sovereign']=P('M6 62V42C6 32 16 28 32 28S58 32 58 42V62Z','m')+SKULL(32,32,1.05,'bn','#ff6a3c')+CROWNP(32,10,1.15)+P('M14 46L6 40M50 46L58 40','b')+'<path d="M20 46L32 56L44 46L32 62Z" fill="#d3a64d" opacity=".9"/>'+T('M10 62V44M54 62V44',2,'#d3a64d');
IC['Ember Herald']=P('M8 4H12V62H8Z','m')+P('M12 6H56L46 16L56 26H12Z')+FLM(34,16,.75)+'<path d="M12 6H56L46 16L56 26H12Z" fill="none" stroke="#0a0807" stroke-width="1.2"/>'+P('M20 36H46L52 46H14Z','gd')+P('M14 46H52V52H14Z','m')+E(26,56,0,'#fff')+P('M40 52H46V62H40Z','m');
IC['Crownless Duelist']=T('M8 56L46 8M56 56L18 8',3,'#c8c2b4')+P('M2 52L14 62L10 64L0 56Z','gd')+P('M62 52L50 62L54 64L64 56Z','gd')+P('M10 6L18 4L20 12L12 14Z','gd')+P('M54 6L46 4L44 12L52 14Z','gd')
 +P('M22 26C22 20 26 16 32 16S42 20 42 26C42 34 38 38 32 38S22 34 22 26Z','bn')+'<path d="M20 14H44L40 20H24Z" class="dk"/>'+E(28,26,1.3,'#ffd27a')+E(36,26,1.3,'#ffd27a')+L('M28 32H36',1.4)+'<path d="M24 12L26 6L29 11L32 4L35 11L38 6L40 12" fill="none" stroke="#6a5a30" stroke-width="1.4" stroke-dasharray="2 2"/>';
IC['Pallbearer']=P('M14 4H50L60 28L50 62H14L4 28Z','m')+P('M20 10H44L52 28L44 56H20L12 28Z')+L('M32 14V52M22 26H42',1.6)+SKULL(32,28,.5,'bn',FIREC)
 +P('M0 40H10V62H0ZM54 40H64V62H54Z','b');

// ---- Hell Tower
IC['Imp']=P('M32 14C44 14 52 22 52 34C52 46 44 56 32 56C20 56 12 46 12 34C12 22 20 14 32 14Z','b')+P('M16 20L6 6L26 14ZM48 20L58 6L38 14Z','m')+D('M18 28L29 33L19 36ZM46 28L35 33L45 36Z')+E(24,32,1.7,HELLC)+E(40,32,1.7,HELLC)
 +D('M20 42C26 50 38 50 44 42C42 54 22 54 20 42Z')+'<path fill="#e9dfc6" d="M25 44l2 4 2-4zM35 44l2 4 2-4z"/>'+T('M32 56C32 62 42 62 44 56',2.2,'currentColor')+'<path d="M44 56L48 60L42 61Z" fill="#c9402c"/>';
IC['Hellhound']=P('M3 36L12 18L22 22L28 10L34 20L52 22L61 38L52 50H18Z')+P('M38 24L61 38L50 46L34 38Z','m')+D('M44 30L52 33L44 35Z')+E(41,30,1.8,HELLC)+'<circle cx="59" cy="38" r="2" class="dk"/>'
 +'<path fill="#e9dfc6" d="M46 42l2 5 2-5zM53 41l2 4 1-5z"/>'+P('M12 18L8 4L22 14Z','m')+'<path d="M12 36C20 42 26 42 32 40" stroke="#ff7a3c" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M10 28C16 30 20 30 24 28" stroke="#ff7a3c" stroke-width="2" fill="none" stroke-linecap="round"/>'+FLM(24,12,.55,'#e0502c');
IC['Chain Devil']=T('M2 18L10 26L4 34L12 42M62 18L54 26L60 34L52 42',2.8,'#a9a090')+HORNP(32,22,1.2)+P('M6 62V42C6 34 16 30 32 30S58 34 58 42V62Z')+P('M32 6C42 6 46 14 46 22C46 30 40 34 32 34C24 34 18 30 18 22C18 14 22 6 32 6Z','m')
 +D('M22 18L30 22L22 24ZM42 18L34 22L42 24Z')+E(26.5,21,1.4,HELLC)+E(37.5,21,1.4,HELLC)+L('M26 28C30 30 34 30 38 28',1.4)+T('M14 44L30 60M50 44L34 60',2.6,'#a9a090')+T('M24 44L40 62',2.6,'#a9a090');
IC['Pit Warden']=P('M32 2L58 10V32C58 48 46 58 32 62C18 58 6 48 6 32V10Z')+P('M32 2L58 10V32C58 48 46 58 32 62Z','m')+'<path d="M32 2V62M6 22H58" stroke="#0a0807" stroke-width="2.2" fill="none"/>'
 +FLM(32,34,1.2,'#e0502c')+HORNP(32,10,.65)+L('M12 14L26 18M52 14L38 18',1.4);
IC['Soul Tender']=P('M26 4H38V10H26Z','gd')+T('M26 10C20 4 44 4 38 10',2,'#a9a090')+P('M18 12H46L50 22V48C50 56 42 60 32 60C22 60 14 56 14 48V22Z','m')+'<path d="M18 12H46L50 22H14Z" fill="#a98a4a" opacity=".6"/>'
 +'<path d="M32 22C24 30 38 32 32 42C24 40 22 32 32 22Z" fill="#8fd46a"/><path d="M32 30C29 34 35 35 32 40C28 38 29 34 32 30Z" fill="#d8ffb8"/>'+E(24,48,1,SOULC)+E(40,48,1,SOULC)+L('M14 30H50M14 40H50',1);
IC['Brimstone Chanter']=P('M6 62C6 52 14 46 32 46C50 46 58 52 58 62Z','m')+HORNP(32,18,1.35)+SKULL(32,30,.9,'bn',HELLC)+D('M28 42C28 46 36 46 36 42Z')+T('M14 34C8 28 8 20 12 14M50 34C56 28 56 20 52 14M10 40C3 32 3 20 8 12M54 40C61 32 61 20 56 12',1.8,'#e0a82c')+T('M24 54H40M26 58H38',1.8,'#e0a82c');
IC['The Gate Hound']=P('M2 62V46L10 38H54L62 46V62Z','m')+P('M4 30C4 20 10 14 18 14C26 14 30 20 30 28C30 36 24 40 16 40C8 40 4 36 4 30Z')+P('M34 30C34 20 40 14 46 14C54 14 60 20 60 28C60 36 56 40 48 40C40 40 34 36 34 30Z')
 +P('M20 22C20 12 26 6 32 6C38 6 44 12 44 22C44 32 38 38 32 38C26 38 20 32 20 22Z','m')+D('M8 24L16 26L9 29ZM56 24L48 26L55 29ZM25 15L31 18L25 20ZM39 15L33 18L39 20Z')
 +E(12,27,1.3,HELLC)+E(52,27,1.3,HELLC)+E(28.5,17.5,1.3,HELLC)+E(35.5,17.5,1.3,HELLC)+'<path fill="#e9dfc6" d="M26 32l1.5 4 1.5-4zM30 33l1.5 4 1.5-4zM35 32l1.5 4 1.5-4z"/>'+T('M10 56H54',2.4,'#a9a090');
IC['Cinder Matron']=FLM(14,16,1.3)+FLM(50,16,1.3)+FLM(32,8,1.6)+P('M4 62C4 48 14 42 32 42S60 48 60 62Z','m')+P('M32 14C42 14 46 22 46 30C46 40 40 46 32 46C24 46 18 40 18 30C18 22 22 14 32 14Z','bn')
 +D('M23 28H30V33H23ZM34 28H41V33H34Z')+E(26.5,30.5,1.4,'#ff7a2c')+E(37.5,30.5,1.4,'#ff7a2c')+L('M28 39C30 41 34 41 36 39',1.4)+'<path d="M18 28C14 38 16 48 22 52M46 28C50 38 48 48 42 52" stroke="#e08a3c" stroke-width="3" fill="none" stroke-linecap="round"/>';
IC['The Iron Inquisitor']=P('M10 2H54V32C54 46 44 56 32 62C20 56 10 46 10 32Z')+P('M32 2H54V32C54 46 44 56 32 62Z','m')+D('M14 24H50V32H14Z')+E(24,28,1.3,'#ffb347')+E(40,28,1.3,'#ffb347')+L('M32 2V24M32 32V62M10 16H54',1.6)
 +P('M22 4L26 0L32 6L38 0L42 4V10H22Z','gd')+T('M26 42H38M28 48H36',2,'#0a0807');
IC['Lord of Flies']=WINGS('m')+P('M32 26C42 26 46 34 46 42C46 52 40 60 32 60C24 60 18 52 18 42C18 34 22 26 32 26Z')+L('M20 42H44M21 48H43M23 54H41',1.4)+P('M32 6C40 6 44 12 44 18C44 24 40 28 32 28C24 28 20 24 20 18C20 12 24 6 32 6Z','m')
 +'<circle cx="25" cy="16" r="5.4" fill="#c9402c"/><circle cx="39" cy="16" r="5.4" fill="#c9402c"/><circle cx="23.5" cy="14.5" r="1.6" fill="#ffd0b0"/><circle cx="37.5" cy="14.5" r="1.6" fill="#ffd0b0"/>'+T('M28 6L24 0M36 6L40 0',1.8,'currentColor');
IC['The Bone Cantor']=P('M32 2C44 2 52 10 52 22C52 30 48 36 44 38V46H20V38C16 34 12 30 12 22C12 10 20 2 32 2Z','bn')+D('M16 14H28V26H16ZM36 14H48V26H36Z')+E(22,20,1.6,SOULC)+E(42,20,1.6,SOULC)+D('M32 28L28 36H36Z')
 +P('M8 46H56V62H8Z','m')+'<path d="M14 46V62M22 46V62M30 46V62M38 46V62M46 46V62M54 46V62" stroke="#0a0807" stroke-width="2"/>'+T('M10 6C4 14 4 26 10 34M54 6C60 14 60 26 54 34',2,'currentColor');
IC['Duke of Chains']=T('M2 8L12 16L4 26L14 34L6 44L16 52M62 8L52 16L60 26L50 34L58 44L48 52',3,'#a9a090')+HORNP(32,20,1.25)+P('M8 62V42C8 34 18 30 32 30S56 34 56 42V62Z')+P('M32 4C42 4 46 12 46 20C46 30 40 34 32 34C24 34 18 30 18 20C18 12 22 4 32 4Z','m')
 +D('M22 16L30 20L22 22ZM42 16L34 20L42 22Z')+E(26.5,19,1.4,HELLC)+E(37.5,19,1.4,HELLC)+P('M20 44H44L38 62H26Z','gd')+T('M32 44V60',1.6,'#0a0807')+'<circle cx="32" cy="38" r="3" class="gd"/>';
IC['The Pale Executioner']=P('M6 62V40C6 32 14 28 32 28S58 32 58 40V62Z','m')+P('M32 4C42 4 48 12 48 22V34H16V22C16 12 22 4 32 4Z')+D('M20 18H44V26H20Z')+E(27,22,1.3,HELLC)+E(37,22,1.3,HELLC)+L('M32 4V18M32 26V34',1.4)
 +P('M46 6L62 20L58 28L44 18Z','bn')+T('M50 24L36 56',3,'#8a6a3e')+L('M24 40L18 62M40 40L46 62',1.2);
IC['Archdevil Vael']=HORNP(32,18,1.5)+P('M8 62C8 48 18 40 32 40S56 48 56 62Z','m')+P('M32 8C44 8 50 16 50 26C50 36 42 44 32 44C22 44 14 36 14 26C14 16 20 8 32 8Z')
 +D('M20 20L30 26L20 29ZM44 20L34 26L44 29Z')+E(25,24.5,1.8,HELLC)+E(39,24.5,1.8,HELLC)+L('M24 34C30 38 34 38 40 34',1.6)+'<path d="M26 34l1.6 4 1.6-4zM35 34l1.6 4 1.6-4z" fill="#e9dfc6"/>'+P('M26 0L32 8L38 0L36 10H28Z','gd')+T('M18 46L24 62M46 46L40 62',2,'#d3a64d');
IC['The Hollow Seraph']=WINGS('bn')+P('M24 12H40V40L36 60H28L24 40Z','b')+'<ellipse cx="32" cy="8" rx="11" ry="3.6" fill="none" stroke="#ffe9a8" stroke-width="2.4"/><ellipse cx="32" cy="8" rx="11" ry="3.6" fill="none" stroke="#ffe9a8" stroke-width="5" opacity=".2"/>'
 +D('M28 20H36V44H28Z')+E(32,26,1.6,'#ffe9a8')+L('M24 40H40',1.2);
IC['Abaddon, King of Hell']=HORNP(32,22,1.75)+FLM(10,50,1.2,'#e0502c')+FLM(54,50,1.2,'#e0502c')+SKULL(32,34,1.1,'bn',HELLC)+CROWNP(32,12,1.25)+P('M8 62C8 54 16 50 32 50S56 54 56 62Z','b')+T('M26 46L30 50M38 46L34 50',2,'#d3a64d');

// ---- Player and misc
IC['Necromancer']=HOODP(28,32,1,'b')+E(23,31,1.4,SOULC)+E(33,31,1.4,SOULC)+P('M6 62C6 52 14 44 28 44C42 44 50 52 50 62Z','m')+T('M52 62V14',2.6,'#8a6a3e')+P('M46 6C46 2 58 2 58 6C58 10 55 14 52 14C49 14 46 10 46 6Z','bn')+D('M48 6H51V9H48ZM53 6H56V9H53Z')+FLM(52,2,.4,SOULC);
IC['_']=SKULL(32,30,1.2,'b');
IC['?']='<path d="M20 22C20 12 28 8 32 8C40 8 46 12 46 22C46 30 36 32 34 40" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/><circle cx="34" cy="53" r="3.4"/>';

// ---- armed dead
IC['Warren Bandit']=P('M6 62V46C6 38 14 34 24 33H40C50 34 58 38 58 46V62Z','m')+P('M32 8C42 8 48 16 48 26C48 34 42 40 32 40C22 40 16 34 16 26C16 16 22 8 32 8Z')+P('M14 16C14 8 22 4 32 4S50 8 50 16L46 20H18Z','b')+'<path d="M16 22H48V30H16Z" class="dk"/>'+E(25,26,1.4,'#ffd27a')+E(39,26,1.4,'#ffd27a')
 +L('M12 14C20 10 44 10 52 14',1.2)+T('M54 20L36 58',3,'#c8c2b4')+P('M50 14L58 22L54 26L46 18Z','gd')+P('M18 46H30V56H18Z','gd');
IC['Crypt Legionnaire']=P('M6 62V44C6 34 16 30 30 30S54 34 54 44V62Z','m')+'<path d="M10 12C14 2 46 2 50 12L46 13C42 6 18 6 14 13Z" fill="#c9402c"/><path d="M10 12C14 2 46 2 50 12L46 13C42 6 18 6 14 13Z" fill="url(#gSh)"/>'+P('M14 42V22C14 12 21 7 30 7S46 12 46 22V42L40 44V30H20V44Z','b')+D('M20 18H40V23H33V36H27V23H20Z')+E(24,20.5,1.3,SOULC)+E(36,20.5,1.3,SOULC)+P('M40 38H62V52C62 60 56 64 51 64C46 64 40 60 40 52Z','gd')+L('M51 38V62M40 50H62',1.2)+'<circle cx="51" cy="50" r="3" class="dk"/>';
IC['Barrow Champion']=P('M6 62V42C6 32 16 26 32 26S58 32 58 42V62Z','m')+HELM(32,30,1.02,'b','#ff7a2c')+P('M16 20C10 20 6 14 8 6C12 10 16 12 20 14Z','bn')+P('M48 20C54 20 58 14 56 6C52 10 48 12 44 14Z','bn')
 +T('M56 62L40 20',3,'#8a6a3e')+P('M30 10C34 6 46 8 50 16C44 14 38 16 36 22Z','bn')+'<path d="M36 22L50 16" stroke="#0a0807" stroke-opacity=".4" stroke-width="1.4"/>';
IC['Cathedral Templar']=P('M6 62V42C6 32 16 26 32 26S58 32 58 42V62Z','m')+HELM(32,30,1.05,'b','#ffe9a8')+'<path d="M32 6V22M26 12H38" stroke="#d3a64d" stroke-width="3.4" stroke-linecap="round"/>'
 +P('M44 4L50 8L48 40L44 42L40 40L38 8Z','bn')+P('M34 40H54V45H34Z','gd')+P('M2 40H16V54C16 58 12 62 9 62C6 62 2 58 2 54Z','gd')+L('M9 40V62M2 50H16',1.2);
IC['Orchard Marshal']=P('M6 62V44C6 34 16 30 32 30S58 34 58 44V62Z','m')+T('M20 9C16 3 10 3 6 -1M18 7C12 7 8 11 4 9M44 9C48 3 54 3 58 -1M46 7C52 7 56 11 60 9',2.4,'#6b5536')+'<g fill="#7aa046"><ellipse cx="7" cy="2" rx="3" ry="1.6"/><ellipse cx="5" cy="10" rx="2.6" ry="1.4"/><ellipse cx="58" cy="2" rx="3" ry="1.6"/></g><circle cx="59" cy="10" r="2.6" fill="#c2402a"/>'+P('M16 42V14C16 8 22 6 32 6S48 8 48 14V42Z','b')+D('M20 17H44V22H20ZM20 26H44V28.5H20Z')+E(26,19.5,1.3,'#ffb347')+E(38,19.5,1.3,'#ffb347')+'<g class="gd"><circle cx="19" cy="34" r="1.4"/><circle cx="45" cy="34" r="1.4"/><circle cx="19" cy="10" r="1.4"/><circle cx="45" cy="10" r="1.4"/></g>'+T('M20 42C18 48 22 52 18 56M44 42C46 48 42 52 46 56M32 42V50',1.8,'#6b5536');
IC['Ash Praetorian']=P('M6 62V44C6 34 16 30 32 30S58 34 58 44V62Z','m')+SKULL(32,30,.82,'bn','#ff8a3c')+P('M14 28C14 13 22 6 32 6S50 13 50 28L46 24C44 15 38 11 32 11S20 15 18 24Z','b')+'<path d="M24 8C24 0 40 0 40 8L37 9C36 4 28 4 27 9Z" fill="#c9402c"/><path d="M30 -2H34V8H30Z" fill="#c9402c"/>'+T('M15 30C17 36 21 40 25 42M49 30C47 36 43 40 39 42',2,'#d3a64d')+T('M58 62V16',2.4,'#c8c2b4')+P('M58 6L62 16H54Z','gd')+P('M2 42H16V54C16 58 12 62 9 62C6 62 2 58 2 54Z','gd')+'<circle cx="9" cy="49" r="2.6" fill="#c9402c"/>';
IC['Hell Legionary']=HORNP(32,18,1.4)+P('M6 62V44C6 34 16 30 32 30S58 34 58 44V62Z','m')+P('M32 10C42 10 48 18 48 28C48 38 42 44 32 44C22 44 16 38 16 28C16 18 22 10 32 10Z','b')+P('M16 21C20 13 44 13 48 21L46 23C40 17 24 17 18 23Z','m')+D('M18 23L30 27L32 25L34 27L46 23L44 30H20Z')+E(25,28,1.5,HELLC)+E(39,28,1.5,HELLC)+D('M24 36C28 34 36 34 40 36L38 41H26Z')+'<path fill="#e9dfc6" d="M25 38L23 31L28 37ZM39 38L41 31L36 37Z"/>'+P('M38 44H62V56C62 61 56 64 50 64C44 64 38 61 38 56Z')+FLM(50,54,.7,'#e0502c');
IC['Infernal Duelist']=P('M12 62V46C12 38 20 34 30 34C40 34 46 38 46 46V62Z','m')+P('M30 8C40 8 46 16 46 26C46 34 40 40 30 40C20 40 14 34 14 26C14 16 20 8 30 8Z')+'<path d="M16 22C22 18 38 18 44 22L42 30H18Z" class="dk"/>'+E(24,25,1.5,HELLC)+E(36,25,1.5,HELLC)
 +P('M20 8L12 0L26 6ZM40 8L48 0L34 6Z','m')+T('M58 4L36 56',2,'#c8c2b4')+P('M50 40H62V44H50Z','gd')+T('M44 48L54 46',2.4,'#d3a64d')+L('M24 34C28 36 34 36 38 34',1.2);

// ---- items
const GEM=(x,y,r,c)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(c||'#ff5a3c')+'"/><circle cx="'+(x-r*.3)+'" cy="'+(y-r*.3)+'" r="'+(r*.35)+'" fill="#fff" opacity=".55"/>';
IC.i_wa=GR('rotate(-35 32 32)',P('M32 2L38 14V40H26V14Z','bn')+'<path d="M32 2V40" stroke="#0a0807" stroke-opacity=".35" stroke-width="1.4"/>'+P('M18 40H46V46H18Z','gd')+P('M29 46H35V58H29Z','m')+'<circle cx="32" cy="61" r="3.2" fill="#d3a64d"/>');
IC.i_wb=T('M32 22V62',3.4,'#8a6a3e')+SKULL(32,14,.62,'bn','#8fd46a')+P('M20 24H44L40 30H24Z','b')+L('M32 30V62',0)+'<path d="M26 34L38 38M26 44L38 48" stroke="#5a4426" stroke-width="2.4"/>'+T('M20 4C14 8 14 18 20 22M44 4C50 8 50 18 44 22',1.8,'currentColor');
IC.i_aa=P('M20 6L32 10L44 6L58 14L52 28L46 26V58H18V26L12 28L6 14Z')+P('M32 10V58H18V26L12 28L6 14L20 6Z','m')+L('M32 10V58M18 28H46M20 42H44',1.4)+'<circle cx="32" cy="30" r="4" class="gd"/>'+P('M6 14L14 22L8 28L2 18Z','b')+P('M58 14L50 22L56 28L62 18Z','b');
IC.i_ab=P('M32 4C24 4 20 10 18 16L4 24L10 34L16 30L12 60H52L48 30L54 34L60 24L46 16C44 10 40 4 32 4Z')+'<path d="M32 4C27 12 27 20 32 30C37 20 37 12 32 4Z" class="dk"/>'+P('M32 30L24 60H40Z','m')+L('M20 36L16 58M44 36L48 58',1.2)+'<circle cx="32" cy="32" r="3" class="gd"/>';
IC.i_ta=T('M14 4C14 28 22 36 32 36C42 36 50 28 50 4',2.6,'#a9a090')+P('M32 34L42 44L32 60L22 44Z','gd')+GEM(32,45,4.2,'#8fd46a')+'<path d="M32 34L42 44L32 60L22 44Z" fill="none" stroke="#0a0807" stroke-width="1.2"/>';
IC.i_tb=P('M32 18C44 18 54 26 54 38C54 50 44 58 32 58C20 58 10 50 10 38C10 26 20 18 32 18ZM32 26C26 26 20 31 20 38C20 45 26 50 32 50C38 50 44 45 44 38C44 31 38 26 32 26Z','gd')+P('M24 6H40L44 16H20Z','gd')+GEM(32,11,3.6,'#ff5a3c')+'<path d="M16 34C18 28 24 24 30 24" stroke="#fff" stroke-opacity=".4" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
IC.i_tc=P('M32 4L40 22L60 24L44 38L50 58L32 47L14 58L20 38L4 24L24 22Z','gd')+'<path d="M32 4L40 22L60 24L44 38L50 58L32 47L14 58L20 38L4 24L24 22Z" fill="none" stroke="#0a0807" stroke-width="1.2"/>'+GEM(32,32,6,'#c9402c');
IC.i_u0=P('M8 52L4 16L20 30L32 8L44 30L60 16L56 52Z','gd')+'<path d="M8 52H56V58H8Z" fill="#a98a4a"/>'+GEM(32,40,4.6,'#c9402c')+GEM(16,42,3,'#8fd46a')+GEM(48,42,3,'#8fd46a')+'<circle cx="32" cy="8" r="3" fill="#ffe9a8"/><circle cx="4" cy="16" r="2.6" fill="#ffe9a8"/><circle cx="60" cy="16" r="2.6" fill="#ffe9a8"/>';
IC.i_u4=P('M32 58C8 42 2 26 10 14C18 4 30 8 32 18C34 8 46 4 54 14C62 26 56 42 32 58Z')+'<path d="M32 18C28 28 36 36 32 50" stroke="#0a0807" stroke-width="2" fill="none" stroke-linecap="round"/>'+'<path d="M14 18C18 14 24 14 26 18" stroke="#fff" stroke-opacity=".4" stroke-width="2.4" fill="none" stroke-linecap="round"/>'+E(32,34,1.8,'#ffd27a');
IC.i_censer=T('M32 2V12M20 14C20 8 44 8 44 14',2.2,'#a9a090')+P('M10 16H54C54 36 46 48 32 50C18 48 10 36 10 16Z','gd')+'<path d="M18 22H46M20 30H44M24 38H40" stroke="#0a0807" stroke-width="2.4" stroke-linecap="round"/>'+P('M24 50H40V56H24Z','m')+'<path d="M32 60C28 62 30 64 32 64C34 64 36 62 32 60Z" fill="#e08a3c"/><path d="M24 6C20 2 26 -2 24 -6" stroke="#aaa" stroke-width="2" fill="none" opacity=".5"/>';
IC.i_axe=GR('rotate(30 32 32)',P('M29 4H35V62H29Z','m')+P('M35 8C52 6 62 16 62 28C62 40 52 46 35 44Z','bn')+'<path d="M38 12C48 12 56 18 56 28C56 36 48 40 38 40" fill="none" stroke="#0a0807" stroke-opacity=".4" stroke-width="2"/>'+P('M26 52H38V58H26Z','b'));
IC.i_halo=WINGS('bn')+'<ellipse cx="32" cy="14" rx="20" ry="7" fill="none" stroke="#ffe9a8" stroke-width="4.4"/><ellipse cx="32" cy="14" rx="20" ry="7" fill="none" stroke="#ffe9a8" stroke-width="9" opacity=".18"/>'+'<path d="M14 18L10 30L18 28ZM50 18L54 30L46 28Z" fill="#ffe9a8" opacity=".5"/>';
IC.i_greatsword=GR('rotate(-20 32 32)',P('M32 0L40 14V46H24V14Z','bn')+'<path d="M32 2V46" stroke="#0a0807" stroke-opacity=".4" stroke-width="2"/>'+P('M12 46H52V54H12Z','gd')+P('M28 54H36V64H28Z','m')+GEM(32,50,3.6,'#ff5a3c')+'<path d="M26 20L38 24M26 30L38 34" stroke="#ff5a3c" stroke-width="1.4" opacity=".7"/>');

const ROLE_BADGE={
  vanguard:'M8 1L14 3.5V8C14 11.5 11.5 14 8 15C4.5 14 2 11.5 2 8V3.5Z',
  striker:'M13 1H15V3L7 11L5 9ZM3.5 8.5L7.5 12.5L6.3 13.7L5 12.4L2.4 15L1 13.6L3.6 11L2.3 9.7Z',
  mender:'M6 1.5H10V6H14.5V10H10V14.5H6V10H1.5V6H6Z',
  reaper:'M2.5 15.5L4 15.5L8.6 4.2C10.8 3.6 13.4 4.3 15 6.4C14.2 2.6 10.4.4 6.4 1.6L7.6 3.5Z'
};
const roleBadge=r=>ROLE_BADGE[r]?'<span class="rb rb-'+r+'"><svg viewBox="0 0 16 16"><path d="'+ROLE_BADGE[r]+'"/></svg></span>':'';
// ---- hand-painted bosses and the Necromancer: more anatomy, folds, scars and wear (light from the top left)
const RIM=(d,w)=>'<path d="'+d+'" fill="none" stroke="#fff3dc" stroke-opacity=".28" stroke-width="'+(w||1.2)+'" stroke-linecap="round"/>';   // a lit edge
const FOLD=(d,w)=>'<path d="'+d+'" fill="none" stroke="#000" stroke-opacity=".38" stroke-width="'+(w||1.1)+'" stroke-linecap="round"/>';   // a crease in shadow
IC['Necromancer']=P('M32 14C20 14 14 24 13 36C12 46 8 54 4 64H60C56 54 52 46 51 36C50 24 44 14 32 14Z','m')
  +FOLD('M24 42C22 50 20 57 18 64M32 44V64M40 42C42 50 44 57 46 64M14 50C17 52 20 52 23 50',1.2)+RIM('M16 40C14 48 11 56 8 63',1.4)
  +P('M32 3C21 3 15 12 15 23C15 30 17 35 20 40C24 42 40 42 44 40C47 35 49 30 49 23C49 12 43 3 32 3Z')
  +D('M32 11C25 11 21 17 21 25C21 32 25 37 32 37C39 37 43 32 43 25C43 17 39 11 32 11Z')
  +'<path d="M32 17C27.5 17 25.5 21 25.5 25C25.5 29 27.5 32.5 29.5 33.5H34.5C36.5 32.5 38.5 29 38.5 25C38.5 21 36.5 17 32 17Z" fill="#cfc4a8" opacity=".18"/>'
  +'<path d="M29.5 33.5V36M32 34V36.5M34.5 33.5V36" stroke="#cfc4a8" stroke-opacity=".25" stroke-width=".7"/>'
  +E(28.3,25,1.25,SOULC)+E(35.7,25,1.25,SOULC)
  +FOLD('M18 30C20 21 25 15 32 12M46 30C44 21 39 15 32 12',1)+RIM('M18 26C19 16 24 8 31 5',1.3)
  +GEM(32,43,1.9,'#8fd46a')+FOLD('M26 41C28 43 36 43 38 41',.8)
  +T('M53 11V64',2.6,'#4a3a2a')+RIM('M52.2 16V62',.6)+SKULL(53,10,.42,'bn',SOULC)
  +P('M48 38C50 36 54 36 56 38V42C54 43 50 43 48 42Z','bn')+L('M50 38V42.5M52 37.6V42.8M54 38V42.5',.55)
  +'<path d="M7 24C4 18 11 15 8 9M58 28C61 22 56 19 59 13" stroke="#9be870" stroke-opacity=".35" stroke-width="1.3" fill="none" stroke-linecap="round"/>';

IC['The Rat King']=P('M5 64C5 50 13 42 32 42S59 50 59 64Z','m')+FOLD('M20 48L16 64M44 48L48 64',1)
  +P('M15 25C8 19 8 10 14 8C19 9 21 15 20.5 21Z')+P('M49 25C56 19 56 10 50 8C45 9 43 15 43.5 21Z')
  +'<path d="M14.5 21.5C11.5 17.5 11.5 12.5 14.5 11.5C17.5 12.5 18.5 15.5 18 18.5Z" fill="#9a5c50" opacity=".85"/><path d="M49.5 21.5C52.5 17.5 52.5 12.5 49.5 11.5C46.5 12.5 45.5 15.5 46 18.5Z" fill="#9a5c50" opacity=".85"/>'+D('M52.5 11L56 12.5L53.5 15Z')
  +P('M32 14C46 14 54 24 54 34C54 42 48 48 40 50L32 58L24 50C16 48 10 42 10 34C10 24 18 14 32 14Z')
  +P('M32 33C38.5 33 42.5 37.5 42.5 43C42.5 48.5 37.5 53 32 53C26.5 53 21.5 48.5 21.5 43C21.5 37.5 25.5 33 32 33Z','fl')
  +L('M24 20L26.2 24.5M29.5 17.5L30.6 22M34.5 17.5L33.4 22M40 20L37.8 24.5M15 30L18.5 32M49 30L45.5 32',.8)
  +D('M19.5 29C19.5 25.8 27.5 25.8 27.5 29C27.5 32.2 19.5 32.2 19.5 29ZM36.5 29C36.5 25.8 44.5 25.8 44.5 29C44.5 32.2 36.5 32.2 36.5 29Z')+E(23.5,29,1.4,'#ff4a2c')+E(40.5,29,1.4,'#ff4a2c')
  +'<path d="M38 21L45.5 35" stroke="#d89080" stroke-width="1" opacity=".75"/>'
  +'<path d="M28.5 40C28.5 37.6 35.5 37.6 35.5 40C35.5 42.4 33.5 43.6 32 43.6C30.5 43.6 28.5 42.4 28.5 40Z" fill="#2a1412"/><path d="M30 39.2C30.6 38.6 31.4 38.6 31.8 39" stroke="#fff" stroke-opacity=".35" stroke-width=".6"/>'
  +L('M32 43.6V46.5M32 46.5C30 48 28 48 27 47M32 46.5C34 48 36 48 37 47',.8)
  +'<path d="M29.9 47H31.8V54H29.9ZM32.2 47H34.1V54H32.2Z" fill="#e3c26a"/><path d="M29.9 52H34.1" stroke="#7a5a20" stroke-width=".5"/>'
  +'<path d="M22 44L7 41M22 46.5L6 47.5M42 44L57 41M42 46.5L58 47.5" stroke="#d8ccb4" stroke-opacity=".6" stroke-width=".6"/>'
  +RIM('M14 30C15 22 21 16 29 15',1.3)
  +GR('rotate(-12 32 12)',CROWNP(32,13,.62))+GEM(26,13,1.2,'#c9402c');

IC['The Crypt Warden']=P('M3 64V47C3 39 11 35 22 35H42C53 35 61 39 61 47V64Z','m')
  +P('M3 47C3 39 9 34.5 18 36.5L20.5 48Z')+P('M61 47C61 39 55 34.5 46 36.5L43.5 48Z')+L('M5 44L19 45M59 44L45 45',.9)
  +FOLD('M10 52H54M8 58H56',1)+RIM('M5 46C6 41 10 38 16 37.5',1.1)
  +P('M18 37V16C18 8 24 4 32 4S46 8 46 16V37C46 41 40 43 32 43S18 41 18 37Z')
  +P('M20 12.5L22 7L26 10.5L32 4.5L38 10.5L42 7L44 12.5Z','gd')
  +D('M21 20H43V24.5H21Z')+E(27,22.2,1.2,'#ffd27a')+E(37,22.2,1.2,'#ffd27a')
  +'<g class="dk"><circle cx="26" cy="31" r=".95"/><circle cx="29" cy="32.2" r=".95"/><circle cx="35" cy="32.2" r=".95"/><circle cx="38" cy="31" r=".95"/><circle cx="32" cy="33" r=".95"/></g>'
  +L('M32 12.5V20M32 24.5V43',1.1)+RIM('M23.5 9C20.8 13 20 19 20 32',1.5)
  +'<g class="gd"><circle cx="20.2" cy="17" r=".85"/><circle cx="43.8" cy="17" r=".85"/><circle cx="20.2" cy="35" r=".85"/><circle cx="43.8" cy="35" r=".85"/></g>'
  +'<path d="M18.5 28C17.4 31 18.4 33.5 17.2 37M45.5 26C46.6 29 45.6 31 46.8 34" stroke="#5f8a58" stroke-width="1.2" opacity=".75" fill="none"/>'
  +'<circle cx="32" cy="52" r="5" fill="none" stroke="#c8a24a" stroke-width="1.7"/>'+P('M29.2 56H31.2V63.5H29.2Z','gd')+P('M33.6 55.4L35.6 56.2L33.8 63.6L31.9 62.9Z','gd')
  +'<path d="M29.2 60H27.6M29.2 62H27.9M35 60.3L36.6 60.9" stroke="#c8a24a" stroke-width="1.1"/>';

IC['The Ember Knight']=P('M3 64V47C3 39 11 35 22 35H42C53 35 61 39 61 47V64Z','m')
  +P('M3 47C3 39 9 34.5 18 36.5L20.5 48Z')+P('M61 47C61 39 55 34.5 46 36.5L43.5 48Z')+FOLD('M10 53H54M8 59H56',1)
  +'<path d="M9 48L15 52L13 58M51 46L46.5 52L50.5 57M27 50L30 55" stroke="#ff7a2c" stroke-width=".9" fill="none" opacity=".9"/>'
  +P('M17 39V18C17 9 24 4 32 4S47 9 47 18V39L40 43H24Z')
  +D('M20 20H44L42 27.5H22Z')+'<path d="M23.5 23.5H40.5" stroke="#ff7a2c" stroke-width="1.8"/><path d="M24 23.5H40" stroke="#ffd27a" stroke-width=".6"/>'
  +'<path d="M27 31.5V37M30 31.5V38M34 31.5V38M37 31.5V37" stroke="#ff5a1c" stroke-width="1.05" opacity=".9"/>'
  +L('M32 4V20',1.1)+RIM('M23 9C20 13 19.5 19 19.5 34',1.4)
  +'<path d="M22 11L25.5 15M42 30L44.5 34" stroke="#ff7a2c" stroke-width=".8" opacity=".85"/>'
  +FLM(32,4,.55)+'<g fill="#ffb347"><circle cx="8" cy="20" r=".8"/><circle cx="56" cy="14" r=".6"/><circle cx="53" cy="28" r=".7"/><circle cx="11" cy="31" r=".55"/><circle cx="48" cy="6" r=".5"/></g>';

IC['The Bishop of Teeth']=P('M3 64C5 50 14 42 32 42S59 50 61 64Z','m')+FOLD('M14 52L10 64M50 52L54 64',1.1)
  +P('M26 42L24 64H30L32 47L34 64H40L38 42Z','gd')+'<path d="M27 50H29.5M26.4 56H29M34.5 50H37M35 56H37.6" stroke="#5a3a10" stroke-width="1"/>'
  +'<g fill="#e3d8be">'+[14,18,22,42,46,50].map((x,i)=>'<path d="M'+x+' '+(47+Math.abs(i-2.5)*.8)+'l1.3 3.4 1.3-3.4z"/>').join('')+'</g>'
  +P('M32 21C40.5 21 45.5 27.5 45.5 35C45.5 41.5 41 45.5 32 45.5C23 45.5 18.5 41.5 18.5 35C18.5 27.5 23.5 21 32 21Z','bn')
  +P('M19.5 26L21.5 9.5L32 1.5L42.5 9.5L44.5 26Z','gd')+'<path d="M28.8 6.5L32 3.8L35.2 6.5V24.5H28.8Z" fill="#6e2a20"/>'
  +'<path d="M32 8.5V19M28.5 12.5H35.5" stroke="#e8c86a" stroke-width="1.4"/>'+P('M19.5 21.5H44.5V26.5H19.5Z','gd')+GEM(25,24,1.3,'#c9402c')+GEM(32,24,1.5,'#8fd46a')+GEM(39,24,1.3,'#c9402c')
  +RIM('M22.5 23L24 11L31 5.5',1.1)
  +D('M22.6 31C22.6 27.8 29 27.8 29 31C29 34.2 22.6 34.2 22.6 31ZM35 31C35 27.8 41.4 27.8 41.4 31C41.4 34.2 35 34.2 35 31Z')+E(25.8,31,1,'#ffd27a')+E(38.2,31,1,'#ffd27a')
  +D('M22.5 36.5H41.5C41.5 41 37.5 44.5 32 44.5C26.5 44.5 22.5 41 22.5 36.5Z')
  +'<path d="M23.5 36.5L25 40.6L26.6 36.5L28.1 41.4L29.7 36.5L31.2 41.8L32.8 36.5L34.3 41.8L35.9 36.5L37.4 41.4L39 36.5L40.4 40Z" fill="#ece2c8"/>'
  +'<path d="M25.5 44L26.8 40.8L28.2 44.2M30.8 44.5L32 41L33.2 44.5M35.8 44.2L37.2 40.8L38.5 44" fill="#d8ccb0"/>'
  +L('M27 27L29 24.5',.6);

IC['The Orchard Mother']=P('M14 64C18 60 22 58 24.5 56L26.5 64ZM50 64C46 60 42 58 39.5 56L37.5 64Z')
  +P('M22 64C24 54 26 46 26 39H38C38 46 40 54 42 64Z')+L('M28 44C28.5 50 27.5 56 28.5 63M33 42C33.5 49 32.5 56 33.5 63M36.5 46C37 52 36.5 58 37.5 63',.8)
  +T('M25 44C17 44 11 40 6 33M6 33L3 29M6 33L4.5 36M39 44C47 44 53 40 58 33M58 33L61 29M58 33L59.5 36',2.4,'currentColor')
  +P('M32 2C46 2 60 10 60 22C60 32 52 36 46 34C44 40 38 42 32 42C26 42 20 40 18 34C12 36 4 32 4 22C4 10 18 2 32 2Z','lf')
  +RIM('M8 18C10 10 20 5 30 4.5',1.4)+FOLD('M12 30C16 32 20 31 22 28M52 30C48 32 44 31 42 28',1)
  +P('M32 13.5C38.5 13.5 42.5 20 42.5 27C42.5 34 38.5 39.5 32 39.5C25.5 39.5 21.5 34 21.5 27C21.5 20 25.5 13.5 32 13.5Z','m')
  +L('M26 17C27 20 26.5 23 27.5 25M38 17C37 20 37.5 23 36.5 25M24.5 31C26 34 28 36 30 37',.7)
  +D('M25.5 25C25.5 22.4 30.5 22.4 30.5 25C30.5 27.6 25.5 27.6 25.5 25ZM33.5 25C33.5 22.4 38.5 22.4 38.5 25C38.5 27.6 33.5 27.6 33.5 25Z')+E(28,25,1.15,'#ffb347')+E(36,25,1.15,'#ffb347')
  +D('M29.5 32C29.5 30 34.5 30 34.5 32C34.5 35 33.2 36.5 32 36.5C30.8 36.5 29.5 35 29.5 32Z')
  +[[11,24],[52,26],[20,9],[45,10],[56,17],[9,15]].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="2.5" fill="#7e2418"/><circle cx="'+(x-.8)+'" cy="'+(y-.9)+'" r=".8" fill="#fff" opacity=".45"/><path d="M'+x+' '+(y-2.4)+'v-1.4" stroke="#3a2a14" stroke-width=".6"/>').join('');

IC['The Pale Sovereign']=P('M2 64C4 50 12 42 32 42S60 50 62 64Z')+FOLD('M16 50L12 64M48 50L52 64M32 52V64',1.1)+RIM('M6 60C8 52 12 47 18 45',1.3)
  +P('M13 46.5C19 40.5 26 40.5 32 44.5C38 40.5 45 40.5 51 46.5L46.5 52.5C42 48.5 36.5 48.5 32 50.5C27.5 48.5 22 48.5 17.5 52.5Z','bn')
  +'<g class="dk">'+[[19,47],[25,45.5],[39,45.5],[45,47],[22,50],[42,50]].map(([x,y])=>'<path d="M'+x+' '+y+'l.9 2.4-.9.5-.9-.5z"/>').join('')+'</g>'
  +SKULL(32,27,1.05,'bn','#9be870')+L('M27.5 13.5L29.5 18.5L27.8 21.5M37 15L35.6 18',.7)
  +CROWNP(32,9,.9)+GEM(32,8,1.6,'#9be870')+GEM(21,9.5,1.1,'#c9402c')+GEM(43,9.5,1.1,'#c9402c')
  +T('M54 28V64',2.2,'#c8a24a')+RIM('M53.3 31V62',.5)+GEM(54,24,3.6,'#9be870')+P('M50.5 27.5H57.5V29.5H50.5Z','gd');
IC['Tunnel Rat']=T('M13 44C5 46 2 53 6 58C8 61 12 61 14 59',2.2,'currentColor')
  +P('M9 41C9 31 19 26 30 26C38 26 44 29 48 33L58 37.5L48.5 42.5C45 47 36 50.5 26 50.5C16 50.5 9 47 9 41Z')
  +P('M30 47C38 47 44 45 48.5 42.5L50 44C45 48 37 50.5 28 50.5Z','fl')
  +L('M14 33L16.5 36M19 30.5L21 34M24 29L25.5 33M29 28.5L30 32.5M34 29L34.6 32.8M15 42L18 43.5M20 45L22.5 46',.7)
  +P('M37 26.5C39.5 22.5 44 22.5 45 26.5C45.5 29.5 42 31.5 39 30.5Z','m')+'<path d="M38.8 27C40.3 24.6 43 24.6 43.6 27C43.8 28.5 41.8 29.6 40 29Z" fill="#9a5c50" opacity=".8"/>'
  +D('M44.5 34.4C44.5 32.8 48 32.8 48 34.4C48 36 44.5 36 44.5 34.4Z')+E(46.3,34.4,1.1,'#ff6a4c')
  +'<path d="M56.5 37.5C56.5 36.2 59.5 36.2 59.5 37.5C59.5 38.8 56.5 38.8 56.5 37.5Z" fill="#c07a70"/>'
  +'<path fill="#e3c26a" d="M51.2 41.5l.9 3.2.9-3.2zM53 41.2l.8 2.8.8-2.8z"/>'
  +'<path d="M54 37L63 33.5M54 38.5L63.5 38.5M54 40L62.5 43" stroke="#d8ccb4" stroke-opacity=".55" stroke-width=".5"/>'
  +P('M19 48V55.5C19 56.5 21.5 57 22.5 56L24 48ZM33 49V56C33 57 35.5 57.5 36.5 56.5L38 48.5Z','m')
  +'<path d="M18.5 56.5h5M32.5 57h5" stroke="#c07a70" stroke-width="1" stroke-linecap="round"/>'
  +RIM('M12 37C14 31 20 27.5 28 27',1.2);

IC['Barrow Wight']=P('M32 3C18 3 12 13 12 26V58C14 56 16 57 18 60C20 56 23 56 25 59C27 55 30 55 32 58C34 55 37 55 39 59C41 56 44 56 46 60C48 57 50 56 52 58V26C52 13 46 3 32 3Z')
  +FOLD('M20 34C19 42 20 50 18 58M44 34C45 42 44 50 46 58M32 38V56M26 40C25 48 26 52 25 58M38 40C39 48 38 52 39 58',1)
  +RIM('M15 24C16 14 22 7 30 5.5',1.4)
  +D('M32 9C24.5 9 20 15.5 20 23C20 30.5 24.5 36 32 36C39.5 36 44 30.5 44 23C44 15.5 39.5 9 32 9Z')
  +'<path d="M32 13.5C27 13.5 24.5 17.5 24.5 22.5C24.5 27 26.5 30 28.8 31.2V34H35.2V31.2C37.5 30 39.5 27 39.5 22.5C39.5 17.5 37 13.5 32 13.5Z" fill="#cfc4a8" opacity=".55"/>'
  +D('M26.3 21.8C26.3 19.3 30.6 19.3 30.6 21.8C30.6 24.6 26.3 24.6 26.3 21.8ZM33.4 21.8C33.4 19.3 37.7 19.3 37.7 21.8C37.7 24.6 33.4 24.6 33.4 21.8Z')
  +E(28.4,22,1.25,'#9be870')+E(35.6,22,1.25,'#9be870')+D('M31.2 26L32 28.4L32.8 26Z')
  +'<path d="M29.4 31.5V33.6M31.2 31.8V34M32.8 31.8V34M34.6 31.5V33.6" stroke="#2a2420" stroke-width=".55"/>'
  +'<path d="M14 44C10 46 9 50 6 51M50 42C54 44 56 48 59 49" stroke="#cfc4a8" stroke-opacity=".25" stroke-width="1" fill="none"/>';

IC['Pyre Witch']=P('M12 64C12 56 20 50 32 50S52 56 52 64Z','m')+FOLD('M22 54L19 64M42 54L45 64M32 54V64',1)
  +P('M20 41H44V46C44 52.5 38.5 57 32 57C25.5 57 20 52.5 20 46Z','fl')
  +L('M22.5 46C24 44.5 26 44.5 27.5 45.5M36.5 45.5C38 44.5 40 44.5 41.5 46M24 51C25 52.5 26.5 53 27.5 53M30 50C31 49 33 49 34 50',.6)
  +D('M23.5 47.2C23.5 45.6 28 45.6 28 47.2C28 48.8 23.5 48.8 23.5 47.2ZM36 47.2C36 45.6 40.5 45.6 40.5 47.2C40.5 48.8 36 48.8 36 47.2Z')+E(25.8,47.3,1.05,'#ff8a3c')+E(38.2,47.3,1.05,'#ff8a3c')
  +'<path d="M31 49.5L29.6 52.5H32.4Z" fill="#000" opacity=".4"/>'+D('M28.5 54C30 53.2 34 53.2 35.5 54C34.5 55.2 29.5 55.2 28.5 54Z')
  +'<path d="M20 41C17 44 17 50 15 54M44 41C47 44 47 50 49 54" stroke="#8a8478" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M21 42C19 46 19.5 50 18 53M43 42C45 46 44.5 50 46 53" stroke="#5a564e" stroke-width="1.4" fill="none" stroke-linecap="round"/>'
  +P('M33 4C30 9 26 20 21 34H45C40 22 36 12 37 7C36 5 34.5 4 33 4Z')+FOLD('M33 8C32 16 30 26 28 34',1)+RIM('M31 9C29 15 26 23 23.5 32',1.2)
  +P('M4 34C10 32 22 31.5 32 31.5S54 32 60 34C58 37.5 50 39.5 32 39.5S6 37.5 4 34Z','m')
  +T('M24 31H40',2,'#8a6a3e')+FLM(9,52,.85)+FLM(55,52,.85)
  +'<g fill="#ffb347"><circle cx="14" cy="42" r=".7"/><circle cx="50" cy="44" r=".6"/><circle cx="6" cy="44" r=".5"/></g>';

IC['Crypt Ghoul']=P('M8 64C8 52 14 45 22 43H42C50 45 56 52 56 64Z','m')+FOLD('M20 48L17 64M44 48L47 64M27 46C28 50 30 52 32 52C34 52 36 50 37 46',1)
  +P('M32 5C43 5 49 14 49 25C49 32 47.5 37 45 41L42.5 47H21.5L19 41C16.5 37 15 32 15 25C15 14 21 5 32 5Z','bn')
  +L('M22 14C24 17 24 20 23 23M42 14C40 17 40 20 41 23M20 31C22 34 24 35 26 35.5M44 31C42 34 40 35 38 35.5M29 8C30 10 30 12 29.5 14',.65)
  +'<path d="M18 26C19.5 31 22 34 25 35L22 41C19.5 37 18 32 18 26ZM46 26C44.5 31 42 34 39 35L42 41C44.5 37 46 32 46 26Z" fill="#000" opacity=".22"/>'
  +D('M19 22.5C21 20 27 21 28.5 25.5C27.5 29.5 22 30.5 19.5 27.5ZM45 22.5C43 20 37 21 35.5 25.5C36.5 29.5 42 30.5 44.5 27.5Z')+E(23.8,25.3,1.3,'#ff7a4c')+E(40.2,25.3,1.3,'#ff7a4c')
  +D('M30.2 30L32 34.2L33.8 30Z')
  +D('M21.5 38.5C26 36.8 38 36.8 42.5 38.5L41 46.5H23Z')
  +'<path fill="#d9cdb0" d="M23.5 38.4l1.6 4.4 1.7-4.6 1.6 5.2 1.7-5.4 1.6 5.6 1.7-5.6 1.6 5.4 1.7-5.2 1.6 4.6 1.6-4.4z"/>'
  +'<path fill="#bfb296" d="M24.5 46.3l1.4-3.3 1.4 3.3M29.4 46.5l1.5-3.6 1.5 3.6M34.4 46.3l1.4-3.3 1.4 3.3"/>'
  +RIM('M18 20C19.5 12 25 7 31 6.2',1.3)
  +P('M3 56L7.5 41L12 56ZM61 56L56.5 41L52 56Z','bn');
// ---- the ten Hell Tower wardens, hand-painted like the gate bosses
IC['The Gate Hound']=P('M2 64V48C2 42 8 38 16 38H48C56 38 62 42 62 48V64Z','m')+FOLD('M14 44L10 64M50 44L54 64M32 42V64',1)
  +[[13,26,.82],[51,26,.82],[32,20,1]].map(([x,y,k])=>GR('translate('+x+' '+y+') scale('+k+')',
     P('M0-14C9-14 13-6 13 1C13 6 10 9 6 11L0 14L-6 11C-10 9-13 6-13 1C-13-6-9-14 0-14Z')+P('M-10-10L-14-20L-5-13ZM10-10L14-20L5-13Z')
     +D('M-8-3C-8-6-3-6-3-3C-3 0-8 0-8-3ZM3-3C3-6 8-6 8-3C8 0 3 0 3-3Z')+E(-5.5,-3,1,'#ff4a1a')+E(5.5,-3,1,'#ff4a1a')
     +'<path d="M-6 6L-4 10L-2 6L0 11L2 6L4 10L6 6" fill="#e3d8be"/>'+D('M-2 1L0 4L2 1Z')+RIM('M-11-4C-10-10-5-13 0-13',1))).join('')
  +'<path d="M8 50C16 46 24 50 32 46S48 50 56 46" stroke="#5a4a3a" stroke-width="2.5" fill="none" stroke-dasharray="4 2"/>'+'<g fill="#ffb347" opacity=".6"><circle cx="26" cy="40" r=".9"/><circle cx="38" cy="40" r=".9"/></g>';

IC['Cinder Matron']=P('M8 64C10 52 18 44 32 44S54 52 56 64Z','m')+FOLD('M20 50L16 64M44 50L48 64M32 48V64',1)
  +'<path d="M18 44C10 36 6 24 10 12C14 22 18 28 24 32ZM46 44C54 36 58 24 54 12C50 22 46 28 40 32Z" fill="#e0602a" opacity=".8"/><path d="M18 42C13 34 11 26 13 18M46 42C51 34 53 26 51 18" stroke="#ffd27a" stroke-width="1" fill="none" opacity=".7"/>'
  +P('M32 12C40 12 44 18 44 26C44 34 39 40 32 40C25 40 20 34 20 26C20 18 24 12 32 12Z','fl')
  +L('M24 22C26 20 28 20 30 21M34 21C36 20 38 20 40 22M26 33C28 35 36 35 38 33',.7)
  +D('M24.5 26C24.5 23.6 29.5 23.6 29.5 26C29.5 28.4 24.5 28.4 24.5 26ZM34.5 26C34.5 23.6 39.5 23.6 39.5 26C39.5 28.4 34.5 28.4 34.5 26Z')+E(27,26,1.1,'#ffb347')+E(37,26,1.1,'#ffb347')
  +'<path d="M22 30L20 38M42 30L44 38M30 38L29 42M34 38L35 42" stroke="#ff7a2c" stroke-width=".8" opacity=".85"/>'
  +FLM(32,10,.7)+FLM(22,13,.45)+FLM(42,13,.45)+RIM('M21 22C22 16 26 13 31 12.5',1.1)
  +'<g fill="#ffb347"><circle cx="8" cy="30" r=".8"/><circle cx="56" cy="26" r=".7"/><circle cx="12" cy="48" r=".6"/></g>';

IC['The Iron Inquisitor']=P('M4 64V48C4 40 12 36 22 36H42C52 36 60 40 60 48V64Z','m')+FOLD('M10 50H54M8 57H56',1)
  +P('M16 6H48V30C48 42 41 50 32 52C23 50 16 42 16 30Z','gd')+RIM('M19 9V30C19 38 23 44 28 47',1.3)
  +D('M20 18H30V22H20ZM34 18H44V22H34Z')+E(25,20,1.1,'#ff6a3c')+E(39,20,1.1,'#ff6a3c')
  +L('M32 6V52M20 28H44M22 36H42',.9)+'<g class="dk">'+[24,28,32,36,40].map(x=>'<circle cx="'+x+'" cy="44" r=".8"/>').join('')+'</g>'
  +'<path d="M16 6L32 2L48 6" stroke="#8a6a2a" stroke-width="2" fill="none"/>'+GEM(32,12,1.6,'#c9402c')
  +T('M54 64V20',2.2,'#4a3a2a')+'<circle cx="54" cy="16" r="5" fill="none" stroke="#8a8a80" stroke-width="1.6"/>'+'<path d="M50 12L58 20M58 12L50 20" stroke="#8a8a80" stroke-width="1.1"/>';

IC['Lord of Flies']=WINGS('m')+'<path d="M26 30C14 14 4 12 1 14M38 30C50 14 60 12 63 14" stroke="#c8d8a0" stroke-opacity=".25" stroke-width=".8" fill="none"/>'
  +L('M6 18C12 22 18 26 24 30M58 18C52 22 46 26 40 30M8 24C14 27 19 30 24 33M56 24C50 27 45 30 40 33',.5)
  +P('M32 34C40 34 44 42 44 50C44 58 38 63 32 63C26 63 20 58 20 50C20 42 24 34 32 34Z')+L('M21 44H43M20.5 50H43.5M22 56H42',1)
  +P('M32 18C38 18 42 22 42 27C42 32 38 36 32 36C26 36 22 32 22 27C22 22 26 18 32 18Z','m')
  +'<circle cx="26" cy="25" r="5.4" fill="#7a1a12"/><circle cx="38" cy="25" r="5.4" fill="#7a1a12"/><circle cx="24.5" cy="23.5" r="1.6" fill="#ffb0a0" opacity=".6"/><circle cx="36.5" cy="23.5" r="1.6" fill="#ffb0a0" opacity=".6"/>'
  +'<path d="M26 25h.1M28 23h.1M28 27h.1M24 27h.1M38 25h.1M40 23h.1M40 27h.1M36 27h.1" stroke="#000" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>'
  +T('M30 34L28 40M34 34L36 40',1.4,'#2a1a0a')+'<path d="M29 10L32 16L35 10" fill="none" stroke="#c8a24a" stroke-width="1.2"/>'+CROWNP(32,12,.42)
  +'<g fill="#0a0806">'+[[8,40],[56,44],[12,56],[52,58],[6,8]].map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="1.4" ry="1"/>').join('')+'</g>';

IC['The Bone Cantor']=P('M6 64C8 52 16 44 32 44S56 52 58 64Z','m')+FOLD('M18 50L14 64M46 50L50 64M32 48V64',1)
  +P('M32 3C42 3 49 10 49 20C49 27 46 31 43 34V42H21V34C18 31 15 27 15 20C15 10 22 3 32 3Z','bn')
  +D('M20 17C20 13 29 13 29 18C29 22 25 24 21 22ZM44 17C44 13 35 13 35 18C35 22 39 24 43 22Z')+E(24.5,18.5,1.1,'#9be870')+E(39.5,18.5,1.1,'#9be870')
  +D('M30.5 24L32 28L33.5 24Z')+'<ellipse class="dk" cx="32" cy="35" rx="5" ry="6"/><path d="M27.5 33h9M27.8 37h8.4" stroke="#d8ccb0" stroke-width=".6"/>'
  +L('M26 6L27 10M38 6L37 10',.6)+RIM('M18 14C19 8 24 4.5 30 4',1.2)
  +'<path d="M54 10C58 14 58 20 54 24M58 6C64 12 64 22 58 28M10 10C6 14 6 20 10 24M6 6C0 12 0 22 6 28" stroke="#9be870" stroke-opacity=".45" stroke-width="1.4" fill="none"/>'
  +'<g fill="#d8ccb0">'+[[10,46],[54,46],[14,54],[50,54]].map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="2.2" ry="1.6"/><path d="M'+(x+2)+' '+y+'V'+(y-7)+'" stroke="#d8ccb0" stroke-width="1"/>').join('')+'</g>';

IC['Duke of Chains']=P('M4 64V48C4 40 12 36 22 36H42C52 36 60 40 60 48V64Z','m')+FOLD('M14 44L10 64M50 44L54 64',1)
  +'<path d="M2 10L16 22L6 34L18 46L8 60M62 10L48 22L58 34L46 46L56 60" stroke="#6a5a48" stroke-width="3.4" fill="none" stroke-dasharray="5 2.5"/>'
  +P('M18 36V18C18 9 24 4 32 4S46 9 46 18V36C46 40 40 42 32 42S18 40 18 36Z')+P('M20 12L23 4L27 9L32 2L37 9L41 4L44 12Z','gd')
  +D('M22 19H42V24H22Z')+E(27,21.5,1.1,'#ff8a3c')+E(37,21.5,1.1,'#ff8a3c')+L('M32 12V19M32 24V42',1)+RIM('M23 9C21 13 20.5 19 20.5 33',1.3)
  +'<circle cx="32" cy="50" r="6" fill="none" stroke="#6a5a48" stroke-width="2.2"/><circle cx="32" cy="50" r="2" class="gd"/>'
  +'<path d="M20 44L26 48M44 44L38 48" stroke="#6a5a48" stroke-width="2.2" stroke-dasharray="3 1.5"/>';

IC['The Pale Executioner']=P('M5 64V44C5 36 13 32 24 32H40C51 32 59 36 59 44V64Z','m')+FOLD('M16 40L12 64M48 40L52 64M32 36V64',1)
  +P('M32 4C42 4 46 12 46 20V34C42 37 37 38 32 38S22 37 18 34V20C18 12 22 4 32 4Z')+FOLD('M24 8C22 14 22 24 23 34M40 8C42 14 42 24 41 34',.8)
  +D('M23 18C23 15 29 15 29 18C29 21 23 21 23 18ZM35 18C35 15 41 15 41 18C41 21 35 21 35 18Z')+E(26,18,1,'#e8e0c8')+E(38,18,1,'#e8e0c8')
  +RIM('M20.5 20C20.5 12 25 6.5 31 5.5',1.2)
  +T('M54 64V12',2.6,'#3a2a1a')+'<path d="M54 12C64 12 66 22 64 32C60 26 57 25 54 26Z" fill="#c8c0b0"/><path d="M54 12C64 12 66 22 64 32" stroke="#fff" stroke-opacity=".35" stroke-width="1" fill="none"/><path d="M56 26C59 25 61 27 62 29" stroke="#7a0e08" stroke-width="1.4" fill="none"/>'
  +'<path d="M14 50H30V54H14Z" fill="#3a2a1a"/><path d="M16 50V46H28V50" fill="none" stroke="#3a2a1a" stroke-width="1.2"/>';

IC['Archdevil Vael']=P('M4 64C6 50 16 42 32 42S58 50 60 64Z','m')+FOLD('M16 48L12 64M48 48L52 64M32 46V64',1)
  +'<path d="M12 44C4 34 2 20 8 8C10 18 14 26 22 32ZM52 44C60 34 62 20 56 8C54 18 50 26 42 32Z" fill="#3a0c08"/><path d="M12 42C6 32 5 22 8 12M52 42C58 32 59 22 56 12" stroke="#c8321a" stroke-width=".8" fill="none" opacity=".7"/>'
  +HORNP(32,14,1.3)+P('M32 12C41 12 46 19 46 27C46 36 40 42 32 42C24 42 18 36 18 27C18 19 23 12 32 12Z')
  +L('M24 20L28 23M40 20L36 23M26 34C28 36 36 36 38 34M30 14L32 18L34 14',.7)
  +D('M23 25C23 22.5 29 23 29 26C28 28 24 28 23 25ZM41 25C41 22.5 35 23 35 26C36 28 40 28 41 25Z')+E(26,25.6,1.2,'#ffd060')+E(38,25.6,1.2,'#ffd060')
  +'<path d="M26 35L27.5 38L29 35.5L30.5 38.5L32 35.5L33.5 38.5L35 35.5L36.5 38L38 35" fill="#e3d8be"/>'+RIM('M20 24C21 17 26 13 31 12.5',1.2)
  +FLM(8,58,.8,'#e0502c')+FLM(56,58,.8,'#e0502c')+GEM(32,48,1.8,'#c9402c');

IC['The Hollow Seraph']=WINGS('bn')+'<path d="M26 30C14 14 4 12 1 14C3 24 10 34 22 38ZM38 30C50 14 60 12 63 14C61 24 54 34 42 38Z" fill="url(#gSh)"/>'
  +L('M4 16L22 31M6 22L21 34M9 28L21 36M60 16L42 31M58 22L43 34M55 28L43 36',.5)
  +P('M24 22H40V44L36 60H28L24 44Z')+FOLD('M28 24V58M36 24V58',.8)+RIM('M25.5 24V44L29 58',1.2)
  +P('M32 6C37 6 40 10 40 15C40 20 37 24 32 24C27 24 24 20 24 15C24 10 27 6 32 6Z','bn')+D('M28 12H36V16H28Z')+'<path d="M28.5 14H35.5" stroke="#f0d870" stroke-width=".8" opacity=".6"/>'
  +'<path d="M22 4A10 3.5 0 1 1 42 4" stroke="#f0d870" stroke-width="2" fill="none"/><path d="M42 4A10 3.5 0 0 1 34 7" stroke="#f0d870" stroke-width="2" fill="none" opacity=".35"/>'
  +'<path d="M30 30L34 30L33 40L31 40Z" fill="#1a1712"/>';

IC['Abaddon, King of Hell']=P('M2 64C4 50 14 42 32 42S60 50 62 64Z','m')+FOLD('M14 50L10 64M50 50L54 64M32 48V64',1.1)
  +'<path d="M6 46C2 36 4 24 10 16C12 26 16 32 22 36ZM58 46C62 36 60 24 54 16C52 26 48 32 42 36Z" fill="#2a0806"/>'
  +HORNP(32,18,1.65)+SKULL(32,30,1.15,'bn',HELLC)+L('M26 18L28 23L26.5 26M38 19L36.6 22',.7)
  +CROWNP(32,13,.7)+GEM(32,12,1.5,'#c9402c')+RIM('M17 26C18 18 23 13 30 12',1.2)
  +FLM(9,56,1.1,'#e0502c')+FLM(55,56,1.1,'#e0502c')+FLM(32,62,.8,'#e0502c')
  +'<g fill="#ffb347"><circle cx="6" cy="34" r=".8"/><circle cx="58" cy="30" r=".7"/><circle cx="16" cy="6" r=".6"/><circle cx="50" cy="8" r=".6"/></g>';
SECRET.forEach((B,i)=>{ IC[B.name]=IC[DUNGEONS[i].boss[0]]; });   // a secret master wears its gate boss's shape, drawn in a darker light (CSS .secret)
// Natural colour and material for each creature (fur, chitin, flesh, bone, cloth, metal, stone, wood, spirit, glass).
// The rank colour stays on the frame; the creature is painted in its own colours, textured and lit by the #paint filter.
const MAT={'Tunnel Rat':['fur','#6f6253'],'Grave Beetle':['chitin','#3d4a3c'],'Marrow Mite':['chitin','#8a7556'],'The Rat King':['fur','#7a5f45'],'Tannery Brute':['flesh','#8a5a48'],'Shiv Cutpurse':['cloth','#4f4a40'],'Tallow Chandler':['cloth','#6b5a44'],'Warren Bandit':['cloth','#4e463c'],'Skeleton Guard':['metal','#5d6a66'],'Crypt Ghoul':['flesh','#7d8a6e'],'Drowned Priest':['flesh','#5f7a74'],'The Crypt Warden':['metal','#556160'],'Drowned Sentinel':['metal','#4f6a68'],'Coffin Crawler':['wood','#5a4636'],'Tide Acolyte':['flesh','#4f7268'],'Crypt Legionnaire':['metal','#4f5f58'],'Ash Husk':['stone','#6a5f58'],'Barrow Wight':['spirit','#8f8a7c'],'Pyre Witch':['cloth','#6e2f22'],'The Ember Knight':['metal','#6a5248'],'Barrow Thrall':['flesh','#6d665c'],'Ember Stalker':['flesh','#7a4a30'],'Cinder Weaver':['chitin','#5a3a28'],'Barrow Champion':['metal','#6a5a40'],'Stone Gargoyle':['stone','#6b6a66'],'Nave Stalker':['flesh','#6b2f2a'],'Hollow Chorister':['cloth','#5a5048'],'The Bishop of Teeth':['cloth','#6a5a48'],'Glass Sentinel':['glass','#5f8c86'],'Tooth Collector':['metal','#5a4a3a'],'Vestment Wraith':['cloth','#5a3a2e'],'Cathedral Templar':['metal','#6e6650'],'Thorn Troll':['flesh','#5d6b44'],'Rust Knight':['metal','#7a4a2c'],'Sap Weaver':['chitin','#4f5a3a'],'The Orchard Mother':['wood','#4d5a36'],'Iron Scarecrow':['wood','#6b5a40'],'Fruit Reaver':['wood','#5a4632'],'Grove Shepherd':['wood','#55603e'],'Orchard Marshal':['flesh','#6e3a2e'],'Throne Guard':['metal','#6a665c'],'Ash Revenant':['stone','#5f5650'],'Whisper Choir':['spirit','#6d7a6a'],'The Pale Sovereign':['cloth','#6b6458'],'Ember Herald':['cloth','#7a3a24'],'Crownless Duelist':['cloth','#4a3e36'],'Pallbearer':['wood','#5a4838'],'Ash Praetorian':['metal','#6a6058'],'Imp':['flesh','#7a3a30'],'Hellhound':['flesh','#5a2e26'],'Chain Devil':['flesh','#6e3428'],'Pit Warden':['metal','#5a3a2c'],'Soul Tender':['glass','#6a3a30'],'Brimstone Chanter':['cloth','#6e4a2a'],'Hell Legionary':['metal','#4e4a48'],'Infernal Duelist':['flesh','#4f5e3e'],'The Gate Hound':['fur','#4e4440'],'Cinder Matron':['flesh','#7a4a36'],'The Iron Inquisitor':['metal','#7a6a48'],'Lord of Flies':['chitin','#6a4a2a'],'The Bone Cantor':['cloth','#4a2a2a'],'Duke of Chains':['metal','#5e5a54'],'The Pale Executioner':['metal','#55585a'],'Archdevil Vael':['flesh','#6b3a2a'],'The Hollow Seraph':['spirit','#b0a68a'],'Abaddon, King of Hell':['flesh','#7a2e22'],'Necromancer':['cloth','#3e3a44'],'_':['bone','#cfc4a8']};
const matOf=key=>MAT[key]||(()=>{ const i=SECRET.findIndex(B=>B.name===key); return i>=0?MAT[DUNGEONS[i].boss[0]]:null; })()||MAT._;
function ico(key,rankI,o){ o=o||{}; const M=matOf(key); return '<span class="ico r'+rankI+(o.boss?' boss':'')+(o.secret?' secret':'')+(o.elite?' elite':'')+'" aria-hidden="true"><svg viewBox="0 0 64 64" class="mt-'+M[0]+'" style="color:'+M[1]+'"><g filter="url(#paint)">'+(IC[key]||IC._)+'</g></svg>'+(key!=='Necromancer'?roleBadge(o.role):'')+'</span>'; }
const app=document.getElementById('app');
const ui={confirm:null};
const pct=(v,m)=>Math.max(0,Math.min(100,m?v/m*100:0));
const meter=(label,v,m,cls)=>'<div class="meter"><div class="m-top"><span>'+label+'</span><span class="num">'+Math.max(0,Math.round(v))+' / '+m+'</span></div><div class="bar"><i class="fill '+cls+'" style="width:'+pct(v,m)+'%"></i></div></div>';


// ----- icons for the extended roster
const BUST='<circle cx="16" cy="9" r="5.5"/><path d="M4 30V19c0-5 5-7 12-7s12 2 12 7v11z"/>';
Object.assign(GLYPH,{
 'Tannery Brute':BUST+'<path class="cs" d="M11 17v13M21 17v13M11 24h10"/>',
 'Shiv Cutpurse':'<g transform="translate(-3 2) scale(.88)">'+HOOD+'</g><path d="M27 5l2.4 14-2.4 3-2.4-3z"/><rect x="24" y="22" width="6" height="2"/><rect x="26" y="24" width="2" height="5"/>',
 'Tallow Chandler':'<path class="ember" d="M16 1c-3 4 2 5 0 9 4-2 4-6 0-9z"/><rect x="11" y="12" width="10" height="18" rx="1"/><path class="cs" d="M14 16v5M18.5 18v6"/>',
 'Drowned Sentinel':HELMB+'<path class="s" d="M2 30c3-3 6 3 9 0s6 3 9 0 6 3 10 0"/>',
 'Coffin Crawler':'<path d="M12 2h8l5 8-3 20H10L7 10z"/><path class="cs" d="M16 8v12M12 12h8"/><path class="s" d="M6 12l-4-3M6 17H1M26 12l4-3M26 17h5"/>',
 'Tide Acolyte':'<path class="s" d="M16 30V8M8 8v6c0 3 3 4 8 4s8-1 8-4V8"/><path d="M8 2l-2.5 7h5zM16 1l-2.5 7h5zM24 2l-2.5 7h5z"/>',
 'Barrow Thrall':BUST+'<path class="cs" d="M9 16c2 5 12 5 14 0"/>',
 'Ember Stalker':'<path d="M4 3l7 5h10l7-5-1 13c0 7-5 12-11 12S5 23 5 16z"/><path class="c" d="M9 14l5 2-5 1zM23 14l-5 2 5 1z"/><path class="cs" d="M12 23l1.5 3 1.5-3 1.5 3 1.5-3 1.5 3 1.5-3"/>',
 'Cinder Weaver':'<path class="s" d="M16 2v28M2 16h28M6 6l20 20M26 6L6 26"/><circle class="s" cx="16" cy="16" r="5"/><circle class="s" cx="16" cy="16" r="10"/><path class="ember" d="M16 10c-3 4 1 4 0 8 4-2 4-5 0-8z"/>',
 'Glass Sentinel':'<path d="M16 2l12 8v12l-12 8L4 22V10z"/><path class="cs" d="M16 2v28M4 10l24 12M28 10L4 22"/>',
 'Tooth Collector':'<path d="M8 4h16c1 8-1 14-4 24l-4-8-4 8C9 18 7 12 8 4z"/><path class="cs" d="M16 6v11M12 8l1 6M20 8l-1 6"/>',
 'Vestment Wraith':'<ellipse class="s" cx="16" cy="3" rx="6" ry="1.8"/><g transform="translate(3 4) scale(.82)">'+HOOD+'</g>',
 'Iron Scarecrow':'<rect x="14" y="8" width="4" height="22"/><rect x="3" y="13" width="26" height="3"/><circle cx="16" cy="10" r="4.2"/><path d="M9 7h14l-4-5h-6z"/><circle class="c" cx="14.7" cy="10" r=".9"/><circle class="c" cx="17.7" cy="10" r=".9"/>',
 'Fruit Reaver':'<path class="s" style="stroke-width:2.4" d="M9 30L24 6"/><path d="M24 4C14 2 5 8 3 17c6-6 13-9 21-9z"/>',
 'Grove Shepherd':'<path class="s" style="stroke-width:2.4" d="M18 30V10c0-5-8-6-8-1"/><path d="M20 12c5-1 8 1 9 5-5 1-8-1-9-5zM18 20c-5-1-8 1-9 5 5 1 8-1 9-5z"/>',
 'Ember Herald':'<rect x="6" y="2" width="2.5" height="28"/><path d="M8.5 4h18l-5 6 5 6h-18z"/><circle class="c" cx="16" cy="10" r="2.6"/>',
 'Crownless Duelist':'<path class="s" style="stroke-width:3" d="M5 5l22 22M27 5L5 27"/><path class="s" d="M3 11l8-8M21 29l8-8M29 11l-8-8M11 29l-8-8"/>',
 'Pallbearer':'<path d="M10 3h12l-2 5c5 3 6 8 5 13l-3 9H10l-3-9c-1-5 0-10 5-13z"/><path class="cs" d="M9 14h14M10 22h12"/>'
});

Object.assign(GLYPH,{'?':'<path class="s" style="stroke-width:3" d="M10 11c0-4 3-6 6-6s6 2 6 6c0 5-6 5-6 10"/><circle cx="16" cy="27" r="2"/>'});


const WING='<path d="M13 12C8 5 3 5 1 8c2 5 5 9 9 11zM19 12c5-7 10-7 12-4-2 5-5 9-9 11z"/>';
const HORNS='<path d="M9 9C5 8 3 4 4 1c3 2 6 3 8 6zM23 9c4-1 6-5 5-8-3 2-6 3-8 6z"/>';
Object.assign(GLYPH,{
 'Imp':'<circle cx="16" cy="17" r="9"/><path d="M9 11L5 3l8 5zM23 11l4-8-8 5z"/><path class="c" d="M10.5 15l4 2-4 1zM21.5 15l-4 2 4 1z"/><path class="c" d="M11 22c3 3 7 3 10 0-3 1-7 1-10 0z"/><path class="s" d="M16 26c0 4 5 4 6 1"/>',
 'Hellhound':'<path d="M3 20l4-9 7-2 4-6 3 6 6 3 2 8-5 3H9z"/><path class="c" d="M18 14l4 1.5-4 1z"/><path class="c" d="M24 20h3v2h-3z"/><path class="s" d="M5 26c3 3 8 4 12 3"/>',
 'Chain Devil':'<circle cx="16" cy="10" r="6"/>'+HORNS+'<path d="M5 31V21c0-4 5-6 11-6s11 2 11 6v10z"/><path class="cs" d="M9 21l6 8M23 21l-6 8"/><circle class="c" cx="14" cy="10" r="1.2"/><circle class="c" cx="18" cy="10" r="1.2"/>',
 'Pit Warden':'<path d="M16 2L4 6v10c0 8 5 13 12 15 7-2 12-7 12-15V6z"/><path class="cs" d="M16 6v21M8 12h16"/>'+'<path class="ember" d="M16 12c-2 3 1 4 0 7 3-1 4-4 2-6z"/>',
 'Soul Tender':'<rect x="14" y="2" width="4" height="4"/><path d="M11 6h10l2 5v14c0 3-3 5-7 5s-7-2-7-5V11z"/><path class="ember" d="M16 12c-3 3 0 5-1 9 4-1 5-5 2-9z"/><path class="s" d="M14 3c0-3 4-3 4 0"/>',
 'Brimstone Chanter':'<path d="M16 2C9 2 6 9 6 16c0 5-2 9-4 14h28c-2-5-4-9-4-14 0-7-3-14-10-14z"/>'+'<path class="c" d="M16 9c-4 0-6 3-6 7s2 7 6 7 6-3 6-7-2-7-6-7z"/><path d="M9 6L5 1l7 3zM23 6l4-5-7 3z"/><circle cx="13.5" cy="15.5" r="1.2"/><circle cx="18.5" cy="15.5" r="1.2"/>',
 'The Gate Hound':'<path d="M4 27l1-8 5-4h12l5 4 1 8z"/><circle cx="8" cy="11" r="4.5"/><circle cx="16" cy="8" r="4.5"/><circle cx="24" cy="11" r="4.5"/><path class="c" d="M6 10h4M14 7h4M22 10h4"/><path class="cs" d="M11 22l2 3 3-3 3 3 2-3"/>',
 'Cinder Matron':'<circle cx="16" cy="14" r="6"/><path d="M4 31c0-8 5-11 12-11s12 3 12 11z"/><path class="ember" d="M10 10C6 6 7 2 9 0c0 4 4 3 5 6 1-4 5-4 6-6 3 3 1 8-3 10z" transform="translate(0 1)"/><path class="c" d="M13.5 14h1.5v1.5h-1.5zM17 14h1.5v1.5H17z"/>',
 'The Iron Inquisitor':'<path d="M6 4h20v12c0 7-4 12-10 14C10 28 6 23 6 16z"/><rect class="c" x="9" y="12" width="14" height="3"/><path class="cs" d="M16 4v8M16 15v13"/><path d="M12 3l1-3 3 2 3-2 1 3z"/>',
 'Lord of Flies':'<ellipse cx="16" cy="20" rx="6" ry="9"/><circle cx="16" cy="9" r="5"/><path d="M10 15L1 7l2 10zM22 15l9-8-2 10z"/><path class="c" d="M12.5 8h2.4v2.4h-2.4zM17.1 8h2.4v2.4h-2.4z"/><path class="cs" d="M11 19h10M11 23h10"/>',
 'The Bone Cantor':'<path d="M16 2c-6 0-10 4-10 10v6h20v-6c0-6-4-10-10-10z"/><path class="c" d="M11 11h3v3h-3zM18 11h3v3h-3z"/><path d="M8 20h16v10H8z"/><path class="cs" d="M11 20v10M16 20v10M21 20v10"/><path class="c" d="M12 16h8v2h-8z"/>',
 'Duke of Chains':'<circle cx="16" cy="9" r="5.5"/>'+HORNS+'<path d="M5 31V19c0-5 5-7 11-7s11 2 11 7v12z"/><path class="s" d="M3 14l5 5-5 5M29 14l-5 5 5 5"/><path class="c" d="M12 20l4 4 4-4"/>',
 'The Pale Executioner':'<path d="M16 2c-5 0-8 4-8 9v6h16v-6c0-5-3-9-8-9z"/><path class="c" d="M11 10h10v2.5H11z"/><path d="M6 17h20l2 14H4z"/><path d="M26 3l5 10-4 2-3-8z"/><path class="cs" d="M16 17v14"/>',
 'Archdevil Vael':'<circle cx="16" cy="14" r="7"/>'+HORNS+'<path d="M8 6C4 2 6-1 9 0c-1 3 1 4 3 5zM24 6c4-4 2-7-1-6 1 3-1 4-3 5z"/><path d="M4 31c0-8 5-10 12-10s12 2 12 10z"/><path class="c" d="M11 12l4 2-4 1zM21 12l-4 2 4 1z"/><path class="cs" d="M12 19c2 2 6 2 8 0"/>',
 'The Hollow Seraph':WING+'<path d="M16 8c-4 0-6 4-6 9v13h12V17c0-5-2-9-6-9z"/><ellipse class="s" cx="16" cy="4" rx="5.5" ry="1.8"/><path class="c" d="M13 15h1.8v6H13zM17.2 15H19v6h-1.8z"/>',
 'Abaddon, King of Hell':'<path d="M16 6c-6 0-9 4-9 9 0 4 2 6 4 8v4h10v-4c2-2 4-4 4-9 0-5-3-8-9-8z"/><path d="M7 11C3 10 1 6 2 2c3 2 5 4 7 7zM25 11c4-1 6-5 5-9-3 2-5 4-7 7z"/><path class="gold" d="M8 5l2.5 3 2.5-5 3 5 3-5 2.5 5 2.5-3-1.5 6H9.5z"/><circle class="c" cx="12.5" cy="16" r="2.4"/><circle class="c" cx="19.5" cy="16" r="2.4"/><path class="c" d="M16 20l-1.6 3h3.2z"/>',
 i_censer:'<path class="s" d="M16 1v7M10 8h12"/><path d="M7 14h18c0 8-3 12-9 12s-9-4-9-12z"/><path class="cs" d="M9 18h14M12 22h8"/><path class="ember" d="M16 27c-2 2-1 4 0 4 2-1 2-3 0-4z"/>',
 i_axe:'<rect x="14.5" y="2" width="3" height="28"/><path d="M17.5 3c8 0 12 4 12 9s-4 7-12 7z"/><path class="cs" d="M21 8c3 1 4 3 4 5"/>',
 i_halo:'<ellipse class="s" style="stroke-width:3" cx="16" cy="9" rx="10" ry="4"/><path d="M3 14l5 9-1 7 9-6 9 6-1-7 5-9-9 4-4-4-4 4z" opacity=".95"/>',
 i_greatsword:'<path d="M16 0l4 22-4 3-4-3z"/><rect x="7" y="21" width="18" height="3.5" rx="1"/><rect x="14.5" y="24" width="3" height="6"/><path class="cs" d="M16 4v16"/>'
});

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
function iico(d){ const set=!d.uq&&!d.tower&&RANKS[d.set]!=null;   // each gate's set has its own metal and its rank letter in the corner
  return '<span class="ico t'+d.tier+(set?' s'+d.set:'')+'" aria-hidden="true"><svg viewBox="0 0 64 64" class="mt-metal" style="color:'+(ITEM_HUE[d.slot]||'#6a655c')+'"><g filter="url(#paint)">'+(IC[d.glyph||('i_'+d.kind)]||IC._)+'</g></svg>'+(set?'<span class="rb gl r'+d.set+'">'+RANKS[d.set]+'</span>':'')+'</span>'; }
const statTxt=(k,v)=>(v>0?'+':'&minus;')+Math.abs(v)+STATL[k][1]+' '+STATL[k][0];
function statsHTML(d,it){ return Object.keys(d.stats).filter(k=>d.stats[k]).map(k=>'<span>'+statTxt(k,d.stats[k])+'</span>').join('')
  +((it&&it.ro)||[]).map(r=>'<span class="roll" title="Bonus line">'+statTxt(r[0],r[1])+'</span>').join(''); }
function cmpHTML(it){   // what wearing this would change, against what is in that slot now
  const d=ITEM[it.id], cur=S.equip[d.slot]; if(cur&&cur.u===it.u) return '';
  if(!cur) return '<div class="cmp">Your '+SLOTS[d.slot].toLowerCase()+' slot is empty.</div>';
  const a=itStats(it), b=itStats(cur), keys=[...new Set(Object.keys(a).concat(Object.keys(b)))].filter(k=>(a[k]||0)!==(b[k]||0));
  return '<div class="cmp">vs '+ITEM[cur.id].name+': '+(keys.length?keys.map(k=>{ const v=(a[k]||0)-(b[k]||0); return '<span class="'+(v>0?'up':'down')+'">'+statTxt(k,v)+'</span>'; }).join(''):'<span>same stats</span>')+'</div>';
}
function usetLine(d){ if(d.uset==null) return ''; const U=USET[d.uset], n=usetCount(d.uset), worn=id=>GEAR_SLOTS.some(sl=>S.equip[sl]&&S.equip[sl].id===id);
  return '<div class="setl uset">Unique set: <b>'+U.name+'</b>'+(n?' ('+n+'/3 worn)':'')+' &middot; '+U.ids.map(id=>'<span class="'+(worn(id)?'on':'')+'">'+ITEM[id].name+'</span>').join(', ')
   +'<br><span class="'+(n>=2?'on':'')+'">2: '+buffTxt(U.b[2])+'</span> &middot; <span class="'+(n>=3?'on':'')+'">3: '+buffTxt(U.b[3])+'</span></div>'; }
function setLine(d){ if(d.tower||SET_NAMES[d.set]==null) return usetLine(d); const n=setCount(d.set), B=SET_BONUS[d.set];
  return '<div class="setl">'+SET_NAMES[d.set]+' set'+(n?' ('+n+'/3 worn)':'')+': <span class="'+(n>=2?'on':'')+'">2: '+buffTxt(B[2])+'</span> &middot; <span class="'+(n>=3?'on':'')+'">3: '+buffTxt(B[3])+'</span></div>'+usetLine(d); }
function itemCard(it,acts,cmp){
  const d=ITEM[it.id];
  return '<div class="item t'+d.tier+'">'+iico(d)+'<div class="i-body"><div class="i-top"><span class="i-name">'+d.name+'</span><span class="i-tag">'+TIERS[d.tier]+' &middot; '+SLOTS[d.slot]+(!d.uq&&!d.tower&&RANKS[d.set]?'<span class="sr"> &middot; gate '+RANKS[d.set]+' set</span>':'')+(d.tower?' &middot; <span class="i-floor">Hell Tower '+d.floor+'</span>':'')+'</span></div>'
   +'<div class="i-stats">'+statsHTML(d,it)+'</div>'+(d.flag?'<div class="i-fx">'+FLAGS[d.flag]+'</div>':'')+setLine(d)+(cmp?cmpHTML(it):'')+'</div><div class="i-acts">'+(acts||'')+'</div></div>';
}
const lockBtn=it=>'<button class="btn small lockb'+(it.lk?' on':'')+'" data-a="lock" data-k="'+it.u+'" aria-pressed="'+!!it.lk+'" title="'+(it.lk?'Locked: never sold, salvaged or discarded. Press to unlock.':'Lock it so it is never sold, salvaged or discarded')+'">'+(it.lk?'Locked':'Lock')+'</button>';
const reforgeBtn=it=>ITEM[it.id].uq||S.mode!=='town'?'':'<button class="btn small" data-a="reforge" data-k="'+it.u+'"'+(S.gold<reforgeCost(it)?' disabled':'')+' title="Re-roll its bonus lines">Reforge &middot; '+gold(reforgeCost(it))+'</button>'+enchBtn(it);
const dust=n=>'<span class="dust-n">'+n.toLocaleString()+' dust</span>';
function enchBtn(it){   // Enchant opens the choices: add a line (if there is room) or re-roll one line
  if(ITEM[it.id].uq||S.mode!=='town'||!workOpen()) return '';
  const open=ui.ench===it.u, c=enchCost(it), poor=(S.dust||0)<c, ro=it.ro||[];
  let h='<button class="btn small" data-a="ench" data-k="'+it.u+'" aria-expanded="'+open+'" title="Spend bone dust on its bonus lines">Enchant</button>';
  if(open) h+='<div class="ench">'+(ro.length<lineMax(it)?'<button class="btn small primary" data-a="enchadd" data-k="'+it.u+'"'+(poor?' disabled':'')+'>Add a line &middot; '+dust(c)+'</button>':'')
    +ro.map((r,i)=>'<button class="btn small" data-a="enchline" data-k="'+it.u+'|'+i+'"'+(poor?' disabled':'')+'>Re-roll '+statTxt(r[0],r[1])+' &middot; '+dust(c)+'</button>').join('')
    +(!ro.length&&!lineMax(it)?'<span class="u-sub">Common gear has no room for a bonus line.</span>':'')+'</div>';
  return h;
}
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
    return itemCard(it,'<button class="btn small primary" data-a="equip" data-k="'+it.u+'">'+(cur?'Swap':'Equip')+'</button>'+(d.uq?'':lockBtn(it))+reforgeBtn(it)+(d.uq||it.lk?'':(workOpen()?'<button class="btn small" data-a="salvage" data-k="'+it.u+'" title="Break it into bone dust">Salvage &middot; '+dust(dustValue(it))+'</button>':'')+'<button class="btn small warn" data-a="discard" data-k="'+it.u+'">'+(conf?'Confirm':'Discard')+'</button>'),true); }).join('');
  return '<section class="win" aria-labelledby="h-bag"><h2 class="win-h" id="h-bag">Bag '+S.inv.length+'/'+bagMax()+(workOpen()?' &middot; '+dust(S.dust||0):'')+'</h2>'
   +'<p class="lede">Uniques ignore the bag limit. Green lines are bonus rolls.</p>'
   +(ui.msg&&ui.msg.mk?'<div class="note '+(ui.msg.c||'')+'"><span>'+ui.msg.m+'</span></div>':'')
   +(S.inv.length?'<div class="bag-tools">Sort: '+Object.keys(BAG_SORTS).map(k=>'<button class="linkbtn" data-a="sort" data-k="'+k+'" aria-pressed="'+((ui.sort||'tier')===k)+'">'+BAG_SORTS[k]+'</button>').join('')+junkHTML()+salvJunkHTML()+tierBulkHTML('salv')+'</div>':'')
   +(rows?'<div class="items">'+rows+'</div>':'<p class="lede">Empty. Kill things and clear rooms to fill it.</p>')+'</section>';
}
function traitChips(m){
  const stage=m.stage||0, next=evoNext(m);
  return '<div class="traits">'+(m.traits||[]).map(t=>'<span class="trait'+(t==='commander'?' cmdr':'')+'" title="'+TRAITS[t].desc+'">'+TRAITS[t].name+'</span>').join('')
    +(next!=null?'<span class="evo">Evolves at Lv '+next+'</span>':stage===STAGE_MAX?'<span class="evo">Eternal</span>':'')+'</div>';
}
function besExtra(tkey,abil){   // trophy and boss move, shown on every opened bestiary entry (known from the first kill)
  const t=TROPHY[tkey], A=abil&&BOSS_ABIL[abil];
  return '<div class="bes-extra">'+(t?'<div class="u-sub"><b>Trophy:</b> '+t.name+' &middot; '+gold(t.value)+' each'+(tkey.startsWith('b:')?' &middot; counts as 5 at the forge':'')+'</div>':'')
    +(A?'<div class="u-sub"><b>Signature move:</b> '+A.name+(A.warn?' (telegraphed)':'')+' &middot; '+A.desc+'</div>':'')+'</div>';
}
function bestiaryHTML(){
  const all=[]; DUNGEONS.forEach(D=>{ D.mobs.forEach(m=>all.push(m[0])); all.push(D.boss[0]); });
  const kn=n=>(S.kills&&S.kills[n])||0;
  const met=all.filter(n=>kn(n)>0).length, studied=all.filter(n=>kn(n)>=KNOW_AT).length;
  let h='<section class="win" aria-labelledby="h-bes"><h2 class="win-h" id="h-bes">Bestiary &amp; drop tables</h2>'
   +'<p class="lede">Entries stay hidden until you kill the creature. Defeat one '+KNOW_AT+' times to study it and reveal its drop table. Ordinary enemies drop something 28% of the time, elites 65% with a lean toward better tiers, and bosses roll twice. Percentages are the share of drops.</p>'
   +'<div class="tiers-line">Met '+met+'/'+all.length+' &middot; Studied '+studied+'/'+all.length+'</div>';
  DUNGEONS.forEach((D,di)=>{
    const list=D.mobs.map(m=>({name:m[0],role:m[1],boss:false})).concat([{name:D.boss[0],role:D.boss[1],boss:true}]).concat(kn(SECRET[di].name)>0?[{name:SECRET[di].name,role:'reaper',boss:true,secret:true}]:[]);
    const anyStudied=list.some(e=>kn(e.name)>=KNOW_AT);
    h+='<div class="bes-gate"><div class="bes-h"><div class="badge r'+di+'">'+RANKS[di]+'</div><div><h3>'+D.name+'</h3><div class="tiers-line">'+(anyStudied?TIER_W[di].map((w,t)=>w?TIERS[t]+' '+w+'%':'').filter(Boolean).join(' &middot; '):'Tier mix unknown. Study an enemy here to learn it.')+'</div></div></div>';
    list.forEach(e=>{
      const k=kn(e.name), isStudied=k>=KNOW_AT, open=ui.bes===e.name;
      if(k<=0){
        h+='<div class="bes-row locked"><span class="ico unk" aria-hidden="true"><svg viewBox="0 0 64 64">'+IC['?']+'</svg></span><div><div class="u-name">???</div><div class="u-sub">Unknown. Defeat it to add it to the ledger.</div></div><span class="u-tag">Locked</span></div>';
        return;
      }
      const rolls=e.boss?'2 rolls (100% and 60%)':'28% per kill';
      h+='<button class="bes-row" data-a="bes" data-k="'+e.name+'" aria-expanded="'+open+'">'+ico(e.name,di,{boss:e.boss,role:e.role,secret:e.secret})+'<div><div class="u-name">'+e.name+'</div><div class="u-sub">'+ROLES[e.role].label+(isArmed(e.name)?' &middot; Gear-bearer':'')+' &middot; '+(isStudied?rolls:'Kills '+k+'/'+KNOW_AT+' &middot; drops unknown')+'</div></div><span class="u-tag">'+(open?'Hide':(isStudied?'Drops':'Study'))+'</span></button>';
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
  // Hell Tower
  const twList=TW_MOBS.map(m=>({name:m[0],role:m[1],boss:false})).concat(TW_BOSS.map(n=>({name:n,role:'vanguard',boss:true})));
  h+='<div class="bes-gate"><div class="bes-h"><div class="badge" style="color:#ff8a6a">T</div><div><h3>The Hell Tower</h3><div class="tiers-line">Drops improve with every floor. Studied entries show the tier mix at several heights.</div></div></div>';
  twList.forEach(e=>{
    const k=kn(e.name), isStudied=k>=KNOW_AT, open=ui.bes===e.name;
    if(k<=0){ h+='<div class="bes-row locked"><span class="ico unk" aria-hidden="true"><svg viewBox="0 0 64 64">'+IC['?']+'</svg></span><div><div class="u-name">???</div><div class="u-sub">Unknown. Defeat it to add it to the ledger.</div></div><span class="u-tag">Unseen</span></div>'; return; }
    h+='<button class="bes-row" data-a="bes" data-k="'+e.name+'" aria-expanded="'+open+'">'+ico(e.name,5,{boss:e.boss,role:e.boss?'reaper':e.role})+'<div><div class="u-name">'+e.name+'</div><div class="u-sub">'+(e.boss?'Warden':ROLES[e.role].label+(isArmed(e.name)?' &middot; Gear-bearer':''))+' &middot; '+(isStudied?'Studied':'Kills '+k+'/'+KNOW_AT)+'</div></div><span class="u-tag">'+(open?'Hide':'Open')+'</span></button>';
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
  return h+'</section>';
}

// What one more point in a stat would change, worked out from the real formulas (shown next to each + button).
function statGain(k){
  const P=S.player, f=()=>({Strike:pAtk(),'Max HP':pMax(),Mana:pMana(),Siphon:pSiph(),Ward:pWard(),Slots:slots()});
  const a=f(); P.stats[k]++; const b=f(); P.stats[k]--;
  const out=Object.keys(a).filter(x=>b[x]!==a[x]).map(x=>x+' +'+(b[x]-a[x]));
  if(k==='will') out.push('raise +2.2%','minions +2%');
  return out.join(', ');
}
function statusHTML(){
  const P=S.player, st=P.stats, ri=pRankI();
  const rows=[['strength','Strength','Strike damage'],['constitution','Constitution','Max HP'],['intelligence','Intelligence','Mana, Siphon, Ward'],['will','Will','Army slots, raise odds, minion bond']];
  const canAlloc=P.pts>0&&S.mode!=='battle';
  return '<section class="win" aria-labelledby="h-status"><h2 class="win-h" id="h-status">Status</h2>'
   +'<div class="id-row"><div class="badge r'+ri+'" title="Necromancer rank">'+RANKS[ri]+'</div><div><div class="who">Gravewalker</div>'+(faithOf()?'<div class="faith-l '+faithOf()+'">'+FAITH[faithOf()].name+'</div>':'')+(titleName()?'<div class="ttl" title="'+buffTxt(TITLE[S.ti.sel].b)+'">'+titleName()+'</div>':'')+'<div class="num dim" style="font-size:12px">Level '+P.lvl+(P.debuff?' &middot; <span class="bad">Wounded dawn</span>':'')+'</div></div></div>'
   +meter('HP',P.hp,pMax(),'hp')+meter('Mana',P.mana,pMana(),'mp')+meter('XP',P.xp,need(P.lvl),'xp')
   +((P.pts>0||P.sp>0)?'<div class="chips">'+(P.pts>0?'<span class="chip">'+P.pts+' unspent point'+(P.pts>1?'s':'')+'</span>':'')+(P.sp>0?'<span class="chip">'+P.sp+' skill point'+(P.sp>1?'s':'')+'</span>':'')+'</div>':'')
   +'<div class="stats">'+rows.map(r=>'<div class="stat"><div><b>'+r[1]+'</b><small>'+r[2]+'</small>'+(canAlloc?'<small class="gain">Next point: '+statGain(r[0])+'</small>':'')+'</div><span class="val">'+st[r[0]]+(G(r[0])?'<small class="gb"> +'+G(r[0])+'</small>':'')+'</span>'
      +(canAlloc?'<button class="plus" data-a="alloc" data-k="'+r[0]+'" aria-label="Add a point to '+r[1]+'">+</button>':'<span class="plus-slot"></span>')+'</div>').join('')+'</div>'
   +'<div class="derived"><div><span>Strike</span><b>'+pAtk()+'</b></div><div><span>Siphon</span><b>'+pSiph()+'</b></div><div><span>Slots</span><b>'+slots()+'</b></div></div>'
   +'</section>';
}
function questHTML(){
  const q=S.quest, rows=[['Defeat foes',q.kills,QUEST.kills],['Clear rooms',q.rooms,QUEST.rooms],['Clear a dungeon',q.clears,QUEST.clears]];
  const done=questDone();
  return '<section class="win'+foldCls('quest')+'" aria-labelledby="h-quest"><h2 class="win-h" id="h-quest">Daily quest &middot; Day '+S.day+'<span class="fold-sum">'+(q.claimed?'claimed':done?'ready to claim':rows.filter(r=>r[1]>=r[2]).length+'/3')+'</span>'+foldBtn('quest')+'</h2>'
   +rows.map(r=>'<div class="q-row"><span class="box'+(r[1]>=r[2]?' on':'')+'"></span><span>'+r[0]+'</span><span class="num">'+Math.min(r[1],r[2])+'/'+r[2]+'</span></div>').join('')
   +(q.claimed?'<p class="q-note ok">Reward claimed for today.</p>':done?'<button class="btn primary" data-a="claim">Claim reward</button>':'<p class="q-note">Reward: +'+QUEST_PTS+' stat point'+(QUEST_PTS>1?'s':'')+' and bonus XP.<br>'+(everCleared()?'<span class="bad">Penalty if unfinished at dawn: lose '+Math.round(QUEST_LOSS*100)+'% of a level in XP and max HP -'+Math.round(QUEST_DEBUFF*100)+'% for a day.</span>':'<span class="ok">No penalty if unfinished until you clear your first gate.</span>')+'</p>')
   +'<p class="q-note">Each dungeon you enter uses a watch. When the third is spent, the day closes.</p></section>';
}
function bountyHTML(){
  const list=bounties(), town=S.mode==='town';
  const rw=r=>[r.g?gold(r.g):'',r.salt?'Grave Salts':'',r.dust?dust(r.dust):'',r.gear?'a '+TIERS[SET_TIER[topGate()]]+' piece with bonus lines':''].filter(Boolean).join(' + ');
  return '<section class="win'+foldCls('bounty')+'" aria-labelledby="h-bty"><h2 class="win-h" id="h-bty">Bounty board<span class="fold-sum">'+list.filter(b=>bountyDone(b)&&!b.claimed).length+' ready</span>'+foldBtn('bounty')+'</h2>'
   +list.map((b,i)=>{ const got=Math.min(bountyGot(b),b.n), done=got>=b.n;
     return '<div class="b-row'+(b.claimed?' claimed':done?' done':'')+'"><span>'+BOUNTIES[b.id].t(b.n)+'</span><span class="num">'+got+'/'+b.n+'</span>'
      +'<span class="u-sub">'+(b.claimed?'Claimed.':'Pays '+rw(b.rw))+'</span>'
      +(done&&!b.claimed&&town?'<button class="btn small primary" data-a="claimb" data-k="'+i+'"'+(b.rw.gear&&S.inv.length>=bagMax()?' disabled title="Your bag is full"':'')+'>Claim</button>':'')+'</div>'; }).join('')
   +'<p class="q-note">New contracts every dawn. Claim finished ones in town; unclaimed ones lapse without penalty.</p></section>';
}
function notesHTML(){
  if(!S.notices.length) return '';
  return '<div class="notes">'+S.notices.map(n=>'<div class="note '+n.c+'"><span>'+n.m+'</span></div>').join('')+'<div><button class="linkbtn" data-a="dismiss">Dismiss</button></div></div>';
}
function armorTag(a){   // foe armor with its rule spelled out (pierceMul): hover text plus the same words for screen readers
  const p=Math.round(a*100), t='Foes shrug off '+p+'% of every hit you and your minions land. Piercing skills such as Bone Spear ignore part of it';
  return '<span class="armor-tag" title="'+t+'.">armor '+p+'%<span class="sr-only">. '+t+'.</span></span>';
}
function gateHTML(i){
  const D=DUNGEONS[i], R=RK[i], P=S.player, locked=P.lvl<R.unlock, rec=gateRec(i), diff=P.lvl-rec;
  const danger=locked?'Locked':diff<-2?'Deadly':diff<0?'Hard':diff<=3?'Fair':'Easy';
  const GL=BOSS_LOOK[D.boss[0]]||['#1a1714','#5a4a3a'];
  return '<div class="gate'+(locked?' locked':'')+(gateMod(i)?' cursed':'')+'" style="--g1:'+GL[0]+';--g2:'+GL[1]+'"><svg class="gate-mark" viewBox="0 0 64 64" aria-hidden="true">'+(IC[D.boss[0]]||'')+'</svg><div class="badge r'+i+'">'+RANKS[i]+'</div><div><h3>'+D.name+'</h3><p>'+D.blurb+'</p>'
   +'<div class="meta">'+(locked?'Opens at level '+R.unlock:'<span class="danger-'+danger.toLowerCase()+'">'+danger+' for you</span>')+' &middot; <span class="rec-lv" title="Most necromancers clear this gate from this hero level">Recommended Lv '+rec+'+</span>'
   +(DIFF.armor[i]?' &middot; '+armorTag(DIFF.armor[i]):'')+' &middot; Boss: <b>'+D.boss[0]+'</b>'
   +(gateMod(i)?'<span class="curse-line">Cursed: <b>'+MODS[gateMod(i)].name+'</b>. '+MODS[gateMod(i)].desc+' '+MOD_REWARD+(S.ti&&S.ti.clr&&S.ti.clr[5]&&P.lvl-CURSE_GAP>RK[i].lv?' Foes about Lv '+(P.lvl-CURSE_GAP)+'.':'')+'</span>':'')
   +(S.mode==='town'&&raidGates().includes(i)&&bestSquad()&&!(S.raids||[]).length?(sq=>'<div class="raid-odds" title="'+sq[0].nick+' and '+(sq.length-1)+' of your strongest; set the squad on the War table">Raid odds '+Math.round(raidOdds(sq,i)*100)+'%</div>')(bestSquad()):'')
   +heatHTML(i)+(gateFarm(i)<1?'<div class="farm-line dim">Rewards here '+Math.round(gateFarm(i)*100)+'% on Normal at your level; Hard and up pay in full.</div>':'')+'</div></div>'
   +'<button class="btn '+(locked?'':'primary')+'" data-a="enter" data-k="'+i+'"'+(locked?' disabled':'')+'>'+(locked?'Reach Lv '+R.unlock:'Enter'+(heatOf(i)?' &middot; '+HEAT[heatOf(i)].name:''))+'</button></div>';
}
function heatHTML(i){   // difficulty picker on a cleared gate's card
  const mx=heatMax(i); if(!mx) return '';
  const cur=heatOf(i), H=HEAT[cur], nm=T_('nm'+i);
  return '<div class="heat" role="group" aria-label="Difficulty">'+HEAT.map((x,lv)=>'<button class="chip-btn'+(lv===cur?' on':'')+'" data-a="heat" data-k="'+i+'|'+lv+'"'+(lv>mx?' disabled title="Clear the gate on '+HEAT[lv-1].name+' first"':'')+' aria-pressed="'+(lv===cur)+'">'+x.name+'</button>').join('')
   +(nm?'<span class="nm-mark" title="Cleared on Nightmare '+nm+' time'+(nm>1?'s':'')+'">&#9760; Nightmare'+(nm>1?' x'+nm:'')+'</span>':'')
   +(cur?'<div class="heat-note">Foes x'+H.foe+' &middot; XP x'+H.xp+' &middot; gold x'+H.gold+' &middot; gear x'+H.drop+(gateMod(i)?' <b class="bad">Cursed and '+H.name+': the curse feeds on it: foes x'+DAMNED_FOE+', rewards x'+DAMNED+'.</b>':'')+'</div>':'')+'</div>';
}
function titlesHTML(){
  const T=S.ti||{got:{}}, n=Object.keys(T.got).length;
  let h='<section class="win" aria-labelledby="h-tt"><h2 class="win-h" id="h-tt">Titles &middot; '+n+'/'+TITLES.length+'</h2>'
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
  const P=S.player, T=S.tower, st=towerStarts(), locked=P.lvl<TW.unlock, noWatch=S.watches<=0;
  const bosses=TW_BOSS.map((n,i)=>({f:(i+1)*10,name:n}));
  let h='<section class="win" aria-labelledby="h-tw"><h2 class="win-h" id="h-tw">The Hell Tower</h2>'
   +'<h3 class="win-title">One hundred floors. Every floor is harder than the last.</h3>'
   +'<p class="lede">A separate climb from the gates. Each floor is a single fight; between floors you raise the dead and climb on. A warden waits on every tenth floor and carries a unique relic. The first time you break a warden its unique is guaranteed. After that it drops '+Math.round(TW.repeat*100)+'% of the time, as gold if you already carry it. Wardens grow wrathful if the fight drags on. A climb uses one watch, and floors you have cleared become checkpoints.'+(TW.armor?' Tower foes wear '+Math.round(TW.armor*100)+'% armor.':'')+'</p>'
   +'<div class="tw-hero"><b>Highest floor '+T.best+' / 100</b><div class="tw-prog"><i style="width:'+T.best+'%"></i></div>'
   +'<div class="u-sub">Uniques claimed '+Object.keys(T.got).length+' / '+TW_UNIQ.length+'</div></div>'
   +'<p class="group-h">Begin the climb from</p>';
  if(locked) h+='<p class="lede bad">The Tower answers only necromancers of level '+TW.unlock+' or more.</p>';
  else{
    h+='<div class="chips">'+st.map(f=>'<button class="btn'+(f===st[st.length-1]?' primary':'')+'" data-a="tower" data-k="'+f+'"'+(noWatch?' disabled':'')+'>Floor '+f+'</button>').join('')+'</div>'
     +'<p class="q-note">Recommended level for floor '+st[st.length-1]+': '+recLv(st[st.length-1])+'. '+(noWatch?'No watches left today. Rest until dawn.':'Uses one watch.')+'</p>';
  }
  h+=T.best>=100?'<div class="tw-hero abyss"><b>The Abyss &middot; floor '+(T.best>100?T.best:'101')+'+</b><div class="u-sub">Abaddon is dead, but the Tower goes on. Past floor 100 every floor is harder than the last, forever. Each tenth floor holds an abyssal warden that leaves gold and a legendary. Your record: floor '+T.best+'.</div></div>'
     :'<p class="q-note">Beyond floor 100 lies the Abyss, a climb with no top.</p>';
  h+='<p class="group-h">The wardens</p><div class="items">';
  bosses.forEach(b=>{
    const seen=T.best>=b.f-10, ids=TW_IDS[b.f]||[], fin=b.f===100;
    h+='<div class="tw-row'+(seen?'':' locked')+(fin?' final':'')+'">'+(seen?ico(b.name,5,{boss:true}):'<span class="ico unk" aria-hidden="true"><svg viewBox="0 0 64 64">'+IC['?']+'</svg></span>')
     +'<div><div class="tw-fl">Floor '+b.f+(T.best>=b.f?' &middot; defeated':'')+'</div><h4>'+(seen?b.name:'???')+'</h4>'
     +(seen?'<div class="u-sub">Recommended level '+recLv(b.f)+'. '+(fin?'The final warden. It drops three uniques and is the hardest thing in the game.':'Drops a unique.')+'</div>'
        +'<div class="tw-uq">'+ids.map(id=>{ const d=ITEM[id], got=T.got[id];
            return itemCard({id:id},got?'<span class="tw-got">Owned</span>':''); }).join('')+'</div>'
       :'<div class="u-sub">Reach floor '+(b.f-9)+' to learn what waits here.</div>')+'</div></div>';
  });
  return h+'</div></section>';
}
const COIN='<svg class="coin" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="currentColor"/><circle cx="8" cy="8" r="4.3" fill="none" stroke="#5a4420" stroke-width="1.1"/><path d="M8 5.2v5.6M6.4 6.6h3.2" stroke="#5a4420" stroke-width="1.1"/></svg>';
const gold=n=>'<span class="gold-n">'+COIN+n.toLocaleString()+'</span>';
const MK_SECS=[['buy','Buy'],['forge','Forge'],['altar','Altar and bag'],['sell','Sell']];
function marketHTML(){
  const P=S.player, stock=shopStock(), tk=Object.keys(S.trophies).sort((a,b)=>TROPHY[b].value-TROPHY[a].value||TROPHY[a].name.localeCompare(TROPHY[b].name));
  const tTotal=tk.reduce((a,k)=>a+S.trophies[k]*TROPHY[k].value,0), bagFull=S.inv.length>=bagMax();
  let h='<section class="win" aria-labelledby="h-mk"><h2 class="win-h" id="h-mk">Bone Market</h2><h3 class="win-title">You have '+gold(S.gold)+'</h3>'
   +'<p class="lede">The dead pay well for what the living leave behind. Sell trophies and spare gear here, and buy supplies before you go down. The merchant\'s wares change every dawn.</p>';
  if(ui.msg&&ui.msg.mk) h+='<div class="note '+(ui.msg.c||'')+'"><i>Market</i><span>'+ui.msg.m+'</span></div>';
  const sec=MK_SECS.some(x=>x[0]===ui.mk)?ui.mk:'buy';
  h+='<div class="chips sub-nav" role="tablist">'+MK_SECS.map(x=>'<button class="btn small'+(x[0]===sec?' primary':'')+'" role="tab" data-a="mk" data-k="'+x[0]+'" aria-selected="'+(x[0]===sec)+'">'+x[1]+'</button>').join('')+'</div>';
  if(sec==='buy'){
  // supplies
  h+='<p class="group-h">Supplies &middot; carry up to '+BELT_MAX+' of each</p><div class="items">'+Object.keys(POTIONS).map(k=>{ const p=POTIONS[k], c=p.price(), full=S.belt[k]>=BELT_MAX;
    return '<div class="tt-row"><div><h4>'+p.name+' <span class="u-tag">'+S.belt[k]+'/'+BELT_MAX+'</span></h4><div class="u-sub">'+p.desc+' Key '+p.key+' in battle.</div></div>'
     +'<button class="btn small primary" data-a="buypot" data-k="'+k+'"'+(full||S.gold<c?' disabled':'')+'>'+(full?'Belt full':'Buy &middot; '+gold(c))+'</button></div>'; }).join('')+'</div>';
  // merchant stock
  h+='<p class="group-h">Merchant\'s wares &middot; day '+S.day+'</p>'+(bagFull?'<p class="q-note bad">Your bag is full. Sell or discard something first.</p>':'')
   +'<div class="items">'+stock.map((s,i)=>{ const d=ITEM[s.id], c=buyPrice(d);
     return itemCard({id:s.id,ro:s.ro,u:-1-i},s.sold?'<span class="u-tag">Sold</span>':'<button class="btn small primary" data-a="buyitem" data-k="'+i+'"'+(S.gold<c||bagFull?' disabled':'')+'>Buy &middot; '+gold(c)+'</button>',!s.sold); }).join('')+'</div>';
  // grave salts (raising aid)
  { const c=saltPrice(), full=S.salts>=SALT_MAX;
    h+='<div class="items" style="margin-top:8px"><div class="tt-row"><div><h4>Grave Salts <span class="u-tag">'+S.salts+'/'+SALT_MAX+'</span></h4><div class="u-sub">Sprinkle on a body before raising it: +'+SALT_BONUS+'% raise chance for that attempt. Worth it on bosses and elites.</div></div>'
     +'<button class="btn small primary" data-a="buysalt"'+(full||S.gold<c?' disabled':'')+'>'+(full?'Pouch full':'Buy &middot; '+gold(c))+'</button></div></div>'; }
  }
  if(sec==='forge'){
  // trophy forge
  const fg=DUNGEONS.map((D,i)=>i).filter(i=>forgePoints(i)>0);
  h+='<p class="group-h">Trophy forge</p><p class="q-note">'+FORGE_N+' trophies from one gate (a boss heart counts as 5) and a little gold forge that gate\'s gear in the slot you pick. One in five comes out a masterwork from the next gate. Or brew a potion from any '+BREW_N+' trophies.</p>';
  if(fg.length) h+='<div class="items">'+fg.map(i=>{ const pts=forgePoints(i), ok=pts>=FORGE_N&&S.gold>=forgeGold(i)&&!bagFull;
      return '<div class="tt-row"><div><h4>'+DUNGEONS[i].name+' forge <span class="u-tag">'+Math.min(pts,99)+'/'+FORGE_N+' trophies</span></h4><div class="u-sub">'+TIERS[SET_TIER[i]]+' gear &middot; costs '+gold(forgeGold(i))+'</div></div>'
       +'<div class="btns" style="margin:0">'+GEAR_SLOTS.map(sl=>'<button class="btn small'+(ok?' primary':'')+'" data-a="forge" data-k="'+i+'|'+sl+'"'+(ok?'':' disabled')+'>'+SLOTS[sl]+'</button>').join('')+'</div></div>'; }).join('')+'</div>';
  { const n=Object.values(S.trophies).reduce((a,b)=>a+b,0);
    h+='<div class="btns">'+Object.keys(POTIONS).map(k=>'<button class="btn small" data-a="brew" data-k="'+k+'"'+(n<BREW_N||S.belt[k]>=BELT_MAX?' disabled':'')+'>Brew '+POTIONS[k].name+' &middot; '+BREW_N+' trophies</button>').join('')+'</div>'; }
  }
  if(sec==='altar'){
  // bone altar
  h+='<p class="group-h">Bone Altar</p><p class="q-note">Pour gold on the altar to raise a minion one level at once. Minions still stop at your level + 2.</p>';
  h+=S.army.length?'<div class="items">'+S.army.map(m=>{ const capped=m.lvl>=P.lvl+2, c=empowerCost(m);
      return '<div class="tt-row trow">'+ico(m.kind||m.name,m.rankI,m)+'<div><h4>'+m.nick+' <span class="dim" style="font-size:13px">'+theName(mName(m))+'</span></h4><div class="u-sub">Lv '+m.lvl+' &middot; ATK '+m.atk+' &middot; HP '+m.maxHp+'</div></div>'
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
   +'<p class="lede">You earn one skill point each level. Active skills appear as buttons in battle (keys 4 and up). They cost mana, and their cooldowns reset every room. Passive skills always apply. Each skill has '+SK_MAX+' ranks, and each rank needs '+SK_STEP+' more levels than the last.</p>';
  [['active','Active'],['passive','Passive']].forEach(g=>{
    h+='<p class="group-h">'+g[1]+'</p><div class="items">'+SKILLS.filter(s=>s.type===g[0]).map(s=>{
      const rk=sk(s.id), next=rk+1, req=rk<SK_MAX?skReq(s,next):0, lockedLv=rk<SK_MAX&&P.lvl<req;
      const meta=(s.type==='active'?s.cost+' mana &middot; cooldown '+s.cd+' turn'+(s.cd>1?'s':'')+' &middot; ':'')+'Unlocks at Lv '+s.lv;
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
  h+='<p class="group-h">Ultimate'+(P.lvl<ULT_LV?' &middot; opens at level '+ULT_LV:'')+'</p><p class="q-note">Soul Siphon harvests a Soul, and every elite or boss that falls gives one. With '+SOUL_MAX+' Souls, unleash your ultimate in battle (key R). Choose one here; you can switch for free in town.</p><div class="items">'
   +Object.keys(ULTS).map(id=>{ const U=ULTS[id], on=P.ult===id; return '<div class="tt-row'+(on?' on':'')+(P.lvl<ULT_LV?' off':'')+'"><div><h4>'+U.name+'</h4><div class="u-sub">'+U.desc+'</div></div>'
     +(on?'<span class="u-tag ok">Chosen</span>':'<button class="btn small primary" data-a="ult" data-k="'+id+'"'+(P.lvl<ULT_LV?' disabled':'')+'>Choose</button>')+'</div>'; }).join('')+'</div>';
  if(spent) h+='<div class="btns"><button class="btn small warn" data-a="skreset">'+(ui.confirm==='skreset'?'Press again to forget all skills':'Forget all skills ('+spent+' back)')+'</button></div>';
  return h+'</section>';
}
function ngpHTML(){
  const n=(S.ngp||0)+1;
  let h='<p class="group-h">New Game+'+(S.ngp?' &middot; you are in New Game+ '+S.ngp:'')+'</p>';
  if(!canNGP()) return h+'<p class="q-note">Clear the Throne of Ash to unlock New Game+ '+n+'. You start again at level 1 with your titles, your bestiary and one unique, against foes with '+Math.round(NGP_FOE*n*100)+'% more HP and attack that pay '+Math.round(NGP_REWARD*n*100)+'% more XP and gold.</p>';
  const own=ownedUniques(), sel=own.includes(ui.ngpPick)?ui.ngpPick:null;
  h+='<div class="danger-zone"><p class="q-note" style="margin-top:0">Begin New Game+ '+n+': level 1, day 1, a fresh army, bag and gold. You keep your titles and bestiary, and one unique. Foes get '+Math.round(NGP_FOE*n*100)+'% more HP and attack and pay '+Math.round(NGP_REWARD*n*100)+'% more XP and gold.</p>';
  h+=own.length?'<p class="q-note">Choose the unique to carry:</p><div class="chips">'+own.map(id=>'<button class="btn small'+(sel===id?' primary':'')+'" data-a="ngppick" data-k="'+id+'" aria-pressed="'+(sel===id)+'">'+ITEM[id].name+'</button>').join('')+'</div>'
    :'<p class="q-note">You hold no unique to carry.</p>';
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
  ['Finish a daily quest',()=>T_('claims')>0,'Defeat foes, clear rooms and clear a dungeon in one day for a stat point and XP. An unfinished quest costs a little at dawn, once you have cleared your first gate.'],
  ['Open the town',()=>townOpen(),'After your first clear (or level 4) a Town tab and a bounty board appear: buildings, fusion and daily contracts.'],
  ['Reach the Hell Tower',()=>S.player.lvl>=TW.unlock,'At level '+TW.unlock+' a separate climb opens: one fight per floor, a unique relic every tenth floor, checkpoints as you go.'],
  ['Break the Throne of Ash',()=>!!(S.ti&&S.ti.clr&&S.ti.clr[5]),'The last gate. Clearing it opens New Game+ in Settings and makes cursed gates rise to just below your level.']
];
// Later systems for the How to play page, read from the game's own unlock levels so the page cannot go stale.
const HELP_LATER=()=>[
  ['Town and bounties','At level 4 or after your first clear: buildings, the Flesh Pit and three daily contracts.',townOpen()],
  ['Salvage and enchanting','At level 6 or once you have bone dust: break spare gear into dust and add bonus lines.',workOpen()],
  ['Faith','At level '+FAITH_LV+' the Old Shrine (Town tab) takes an oath: Honored One or Dishonored One, each with a gift and a price.',S.player.lvl>=FAITH_LV],
  ['The Hell Tower','At level '+TW.unlock+': one fight per floor and a unique on every tenth floor.',S.player.lvl>=TW.unlock],
  ['Harder gates','A cleared gate offers Hard, then Brutal and Nightmare: stronger foes, bigger rewards.',DUNGEONS.some((D,i)=>heatMax(i)>0)],
  ['Cursed gates','Each day one cleared gate is cursed: harder, and pays more.',DUNGEONS.some((D,i)=>S.ti&&S.ti.clr&&S.ti.clr[i])],
  ['Ultimates','At level '+ULT_LV+' choose an ultimate on the Skills tab. Gather '+SOUL_MAX+' Souls in a run and press R.',S.player.lvl>=ULT_LV]
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
   +'<p class="group-h">Saving</p><p class="help-p">The game saves after every action and keeps a backup from each of the last '+BAK_N+' days (Settings).</p><p class="help-p">The game saves itself after every action, and keeps your save from the start of each of the last '+BAK_N+' days (Settings). In a gate or the Tower it saves as if you had walked out, so closing the tab there counts as leaving. Use save slots before something risky, and save files or codes to move to another browser.</p>'
   +'<div class="btns"><button class="btn small primary" data-a="tab" data-k="codex">Open the Codex: every rule and number</button></div></section>';
}
function saveTabHTML(){
  const ok=storageOk(), when=t=>t?new Date(t).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'never';
  const tipsOff=!!(S.tips&&S.tips.off), seenTips=TIPS.filter(t=>S.tips&&S.tips[t.id]).length;
  let h='<section class="win" aria-labelledby="h-sv"><h2 class="win-h" id="h-sv">Settings</h2>'
   +'<p class="group-h">Help</p><div class="items"><div class="tt-row"><div><h4>How to play</h4><div class="u-sub">First steps, ticked off as you play.</div></div>'
   +'<button class="btn small primary" data-a="tab" data-k="help">Open</button></div>'
   +'<div class="tt-row'+(tipsOff?'':' on')+'"><div><h4>Tips</h4><div class="u-sub">'+(tipsOff?'Tips are hidden.':seenTips+' of '+TIPS.length+' seen.')+'</div></div>'
   +'<div class="btns" style="margin:0">'+(tipsOff?'<button class="btn small primary" data-a="tipson">Show tips</button>':'')+(seenTips?'<button class="btn small" data-a="tipsreset">Show all again</button>':'')+'</div></div></div>'
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
   +'<div class="tt-row"><div><h4>Effects</h4><div class="u-sub">Light uses simpler icon shading and still backgrounds, for phones. Full also draws battle effects. Auto picks Light on small or slow devices'+(VIEW.fx==='auto'?' (now: '+(fxLight()?'Light':'Full')+')':'')+'.</div></div><div class="btns" style="margin:0">'
     +Object.keys(FX_MODES).map(k=>'<button class="btn small'+(VIEW.fx===k?' primary':'')+'" data-a="view" data-k="fx|'+k+'" aria-pressed="'+(VIEW.fx===k)+'">'+FX_MODES[k]+'</button>').join('')+'</div></div>'
   +'<div class="tt-row'+(VIEW.hc?' on':'')+'"><div><h4>High contrast</h4><div class="u-sub">Brighter text and bolder bars.</div></div><button class="btn small'+(VIEW.hc?'':' primary')+'" data-a="view" data-k="hc" aria-pressed="'+VIEW.hc+'">'+(VIEW.hc?'Turn off':'Turn on')+'</button></div></div>'
   +'<p class="group-h">Save &amp; load</p><p class="lede">Saves after every action. Slots keep a safe copy; a save code carries your game to another browser.</p><p class="lede">The game saves itself after every action (in a gate or the Tower, as if you had walked out). Slots are for keeping a safe copy before something risky, like a Tower warden. A save code lets you carry your progress to another browser or device.</p>';
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
   +LORE_PAGES.slice(0,np).map((P0,i)=>'<details class="chron"'+(i===np-1?' open':'')+'><summary>'+(i+1)+'. '+P0.t+'</summary><p>'+P0.m+'</p></details>').join('')
   +(np<LORE_PAGES.length?'<p class="q-note">Bosses, Tower wardens, elites and sealed coffers sometimes hold the next page'+(S.player.lvl<PAGE_LV(np)?', but page '+(np+1)+' waits until you reach level '+PAGE_LV(np):'')+'. Secret masters always carry one.</p>':'<p class="q-note ok">Every page is home.</p>');
  return h+'</section>';
}
function recordsHTML(){
  const Rc=S.rec||{}, n=v=>(v||0).toLocaleString(), on=o=>o?'<b>'+n(o.v)+'</b> <span class="dim">&middot; day '+o.day+'</span>':'<span class="dim">not yet</span>';
  const row=(t,v)=>'<div class="tt-row"><div><h4>'+t+'</h4></div><div class="rec-v">'+v+'</div></div>';
  let h='<section class="win" aria-labelledby="h-rec"><h2 class="win-h" id="h-rec">Records</h2><h3 class="win-title">Your best, kept through every New Game+</h3>'
   +'<div class="items">'+row('Deepest Tower floor',Rc.floor?'<b>'+Rc.floor.v+'</b>'+(Rc.floor.v>100?' <span class="dim">(Abyss)</span>':'')+' <span class="dim">&middot; day '+Rc.floor.day+'</span>':'<span class="dim">not yet</span>')
   +row('Biggest single hit',on(Rc.hit))+row('Most foes slain in one run',on(Rc.kills))+row('Most gold from one run',on(Rc.gold))
   +row('Souls spent on ultimates','<b>'+n(T_('ults')*SOUL_MAX)+'</b> <span class="dim">&middot; '+n(T_('ults'))+' ultimate'+(T_('ults')===1?'':'s')+'</span>')
   +row('Highest level','<b>'+S.player.lvl+'</b>'+(S.ngp?' <span class="dim">&middot; New Game+ '+S.ngp+'</span>':''))+'</div>'
   +'<p class="group-h">Fastest clears</p><p class="q-note">Fewest turns from the first room to the fallen boss, on any difficulty.</p><div class="items">'
   +DUNGEONS.map((D,i)=>{ const o=Rc.fast&&Rc.fast[i]; return row(D.name,o?'<b>'+o.t+' turns</b> <span class="dim">&middot; day '+o.day+(o.heat&&HEAT[o.heat]?' &middot; '+HEAT[o.heat].name:'')+'</span>':'<span class="dim">not yet</span>'); }).join('')+'</div>';
  const sl=SECRET.map((B,i)=>({B,i})).filter(x=>Rc.sec&&Rc.sec[x.i]);
  if(sl.length) h+='<p class="group-h">Secret masters</p><div class="items">'+sl.map(x=>row('<span class="sec-k">&#9760; '+x.B.name+'</span>','<span class="dim">first slain day '+Rc.sec[x.i]+'</span>')).join('')+'</div>';
  return h+'</section>';
}
function histHTML(){
  const L=S.life||{}, n=v=>(v||0).toLocaleString(), H=(S.hist||[]).slice().reverse();
  const where=h=>h.g<0?'Hell Tower, floor'+(h.f1>h.f0?'s '+h.f0+'&ndash;'+h.f1:' '+h.f0):h.rift?'The Rift, depth '+h.rift+(h.rr?' &middot; new deepest':''):DUNGEONS[h.g].name;
  const RES={cleared:'Cleared',fell:'Fell',fled:'Fled',left:'Walked out'};
  const seen=STORY.filter(st=>S.story&&S.story[st.id]);
  let h='<section class="win" aria-labelledby="h-hist"><h2 class="win-h" id="h-hist">History</h2><h3 class="win-title">The ledger keeps count</h3>'
   +'<p class="q-note">The Ledger&#39;s story ('+seen.length+'/'+STORY.length+' passages, '+(S.pages||0)+'/'+LORE_PAGES.length+' torn pages) is on the <button class="linkbtn" data-a="tab" data-k="lore">Lore page</button>.</p>'
   +'<p class="group-h">Every run so far'+(S.ngp?' (New Game+ runs included)':'')+'</p><div class="life">'
   +[['Runs',L.runs],['Gates cleared',L.clears],['Falls',L.deaths],['Fled',L.fled],['Rooms won',L.rooms],['Kills',L.kills],['XP earned',L.xp],['Gold found',L.gold],['Gear found',L.items],['Dead raised',L.raised]]
     .map(x=>'<div><span>'+x[0]+'</span><b>'+n(x[1])+'</b></div>').join('')+'</div>'
   +(()=>{ const sl=SECRET.filter((B,i)=>T_('secret_'+i)); return sl.length?'<p class="group-h">Secret masters slain &middot; '+sl.length+'/'+SECRET.length+'</p><div class="sec-list">'+sl.map(B=>'<span class="sec-k">&#9760; '+B.name+(T_('secret_'+secretOf(B.name))>1?' x'+T_('secret_'+secretOf(B.name)):'')+'</span>').join('')+'</div>':''; })()
   +'<p class="group-h">Last '+HIST_N+' runs</p>';
  if(!H.length) return h+'<p class="lede">No runs yet. Enter a gate and the ledger will remember it.</p></section>';
  return h+'<div class="hist-wrap"><table class="hist"><thead><tr><th>Day</th><th>Where</th><th>Result</th><th class="num">Rooms</th><th class="num">Kills</th><th class="num">XP</th><th class="num">Gold</th><th class="num">Gear</th><th class="num">Raised</th></tr></thead><tbody>'
   +H.map(x=>'<tr><td class="num">'+x.d+'</td><td>'+where(x)+(x.mod&&MODS[x.mod]?' <span class="dim">('+MODS[x.mod].name+')</span>':'')+(x.heat&&HEAT[x.heat]?' <span class="dim">'+HEAT[x.heat].name+'</span>':'')+(x.sec?'<div class="sec-k">&#9760; '+x.sec+' slain</div>':'')+'</td><td class="res-'+x.res+'">'+(RES[x.res]||x.res)+'</td><td class="num">'+x.rooms+'</td><td class="num">'+x.kills+'</td><td class="num">'+n(x.xp)+'</td><td class="num">'+n(x.gold)+'</td><td class="num">'+x.items+'</td><td class="num">'+x.raised+'</td></tr>').join('')
   +'</tbody></table></div></section>';
}
// ----- the Codex: every rule and list in the game, read straight from the game's own tables so it never goes stale.
// Enemies you have not met yet stay hidden, as in the bestiary.
const CODEX=[['basics','Basics'],['raising','Raising'],['faith','Faith'],['omens','Omens'],['roles','Roles'],['traits','Traits'],['minions','Minion stats'],['affixes','Elite affixes'],['bosses','Bosses'],['status','Status effects'],['skills','Skills'],['orders','Orders'],
  ['gates','Gates'],['tower','Hell Tower'],['gear','Gear'],['uniques','Unique powers'],['sets','Sets'],['supplies','Supplies'],['rooms','Doors and events'],['curses','Curses'],['raids','Raids'],['rift','The Rift'],['town','Town'],['bounties','Bounties'],['titles','Titles']];
const CDX_ROLE={
  vanguard:'When a foe picks a target, each vanguard counts 5 and everyone else (you included) counts 2, so vanguards draw most blows. They take Taunt orders and stand in front of a Sundering Blow.',
  striker:'This goes for your strikers and the enemy\'s. An enemy striker\'s crit also makes its target bleed. Focus makes your strikers crit every hit for a turn.',
  mender:'As a minion: heals the ally with the lowest share of HP, if anyone is below 85%. As a foe: heals the most hurt foe below 70%, blunted by its armor. A room never holds more than one enemy mender.',
  reaper:'Only your reapers cleave; enemy reapers strike one target. Every gate boss and Tower warden is a reaper, so a raised boss cleaves for you. Execute doubles your reapers\' hits on foes below 40% HP.'
};
const CDX_DOT={
  poison:'From Venomous minions and the Grave Gas upgrade of Corpse Explosion. 15% of the poisoner\'s attack (Grave Gas: 15% of your Siphon) each turn for 3 turns.',
  bleed:'From an enemy striker\'s crit. 30% of its attack each turn for 2 turns.',
  burn:'From a Cinder Wave. 15% of the boss\'s attack each turn for 2 turns.'
};
const cxRow=(title,body,tag)=>'<div class="tt-row cx-row"><div><h4>'+title+(tag?' <span class="u-tag">'+tag+'</span>':'')+'</h4><div class="u-sub">'+body+'</div></div></div>';
const cxP=t=>'<p class="help-p">'+t+'</p>';
const cxList=a=>'<div class="items">'+a.join('')+'</div>';
const metName=n=>!!(S.kills&&S.kills[n]>0);
function codexSection(k){
  const pct=v=>Math.round(v*100)+'%';
  if(k==='basics') return cxP('A day has '+WATCHES+' watches. Entering a gate or the Tower uses one; when the last is spent the day ends. The daily quest asks you to defeat '+QUEST.kills+' foes, clear '+QUEST.rooms+' rooms (gate rooms or Tower floors) and clear '+QUEST.clears+' dungeon. Finish it for '+QUEST_PTS+' stat point'+(QUEST_PTS>1?'s':'')+' and '+pct(QUEST_XP)+' of a level in XP. Leave it unfinished and dawn costs '+pct(QUEST_LOSS)+' of a level in XP and '+pct(QUEST_DEBUFF)+' of your max HP for a day, once you have cleared your first gate.')
    +cxP('Each level gives 3 stat points and 1 skill point. Falling in a fight loses that room\'s spoils and '+pct(DIFF.deathXp)+' of a level in XP. Going on to the next room heals '+pct(DIFF.heal)+' of your HP, restores '+pct(DIFF.mana)+' of your mana and heals your minions '+pct(DIFF.mheal)+'.')
    +'<p class="group-h">Stats</p>'+cxList([cxRow('Strength','Strike damage: 3 + 1.5 per point + your level + gear.'),cxRow('Constitution','Max HP: 24 + 6 per point + 4 per level + gear.'),
      cxRow('Intelligence','Mana (5 per point), Soul Siphon (2 per point) and Bone Ward (2 per point).'),cxRow('Will','Mana (3 per point), one army slot per 3 points, 2.2% raise chance per point, and 2% minion power per point.')])
    +'<p class="group-h">Everything gear can give</p>'+cxList(Object.keys(STATL).map(s=>cxRow(STATL[s][0],(ROLL_KEYS[s]?'Can appear as a bonus line.':'Only on base stats and uniques.')+(STATL[s][1]?' Measured in percent.':''))))
    +'<p class="group-h">New Game+</p>'+cxP('Clear the Throne of Ash and Settings offers New Game+: start again at level 1 with your titles, bestiary, story and one unique of your choice. Foes get '+Math.round(NGP_FOE*100)+'% more HP and attack and pay '+Math.round(NGP_REWARD*100)+'% more XP and gold, and each New Game+ stacks.')
    +'<p class="group-h">Bestiary</p>'+cxP('Defeat '+KNOW_AT+' of one kind of foe to study it: its drop table opens in the bestiary. Foes you have not met stay hidden, here and there.')
    +'<p class="group-h">Lore</p>'+cxP('The Ledger tells its story in four acts as you play, and '+LORE_PAGES.length+' torn pages tell its history in order. Bosses ('+pct(PAGE_CHANCE.boss)+'), Tower wardens ('+pct(PAGE_CHANCE.warden)+'), elites ('+pct(PAGE_CHANCE.elite)+') and sealed coffers ('+pct(PAGE_CHANCE.coffer)+') may hold the next page, and secret masters always do; page N waits until level '+PAGE_LV(0)+' + 3 per page. Read them on the Lore page.')
    +'<p class="group-h">Saving</p>'+cxP('The game saves itself after every action. Settings holds '+SLOTS_N+' save slots, save codes and save files, and the first save of each day is kept as a backup ('+BAK_N+' days back).')
    +'<p class="group-h">Ranks</p>'+cxList(RK.map((R,i)=>cxRow('Rank '+RANKS[i],'Your rank at level '+R.unlock+'+. Rank '+RANKS[i]+' foes have '+R.hp+'x HP and '+R.atk+'x attack, give '+R.xp+'x XP and are '+R.pen+'% harder to raise.')));
  if(k==='raising') return cxP('After a room, every foe that fell leaves a body. Raising one costs mana and can fail: the chance starts at '+RAISE_BASE+'% and rises with Will ('+RAISE_WILL+'% a point), your level above the body\'s, gear, the Ossuary and Master of Bones. Deeper ranks are harder to raise; elites cost 10% and bosses 15%. Odds stay between '+RAISE_MIN+'% and '+RAISE_MAX+'% ('+SALT_CAP+'% with salts).')
    +cxP('Grave Salts add '+SALT_BONUS+'% to one attempt. A wounded straggler between rooms can be raised for free at +'+STRAGGLER_BONUS+'%. Bodies you do not raise before moving on are gone. "Raise the best" on the raise screen tries every body, most valuable first.')
    +cxP('Minions keep the level they had, share half of each room\'s XP, and grow up to two levels above you. One downed in a fight may shatter when the room ends (less often with more Will; never if Grave-bound); otherwise it binds back together. Released or shattered gear-bearers return their gear to your bag.')
    +cxList([cxRow('Army slots','1, plus one per 2.5 Will, one per 4 levels, gear and the Crypt. At most '+ARMY_CAP+', plus the Crypt\'s levels.'),cxRow('Gear-bearers','Armed foes (marked Armed) can wear a weapon, armor and relic from your bag once raised.'),cxRow('Bone Altar','Gold raises a minion one level at once, never past your level + 2.')]);
  if(k==='faith') return cxP('From level '+FAITH_LV+' the Old Shrine on the Town tab takes an oath. Devotion grows with the days you keep it: the gift grows x'+DEVOTION_MUL[1]+' after '+DEVOTION[1]+' days and x'+DEVOTION_MUL[2]+' after '+DEVOTION[2]+'; the price stays as it is. Renouncing costs 100 gold per level and starts devotion over. Swearing and renouncing happen in town.')
    +cxP('In about '+pct(FAITH_EVENT)+' of the events between rooms, a sworn necromancer meets a shrine of their own path instead: the Honored One may pray at a shrine of the Old Gods (heal 30% HP and refill mana), the Dishonored One may loot a defiled altar (gold and a Soul for 10% of their HP).')
    +cxList(Object.keys(FAITH).map(k=>cxRow(FAITH[k].name,FAITH[k].vow+'<br><b>Gives:</b> '+buffTxt(FAITH[k].buff)+'<br><b>Costs:</b> '+buffTxt(FAITH[k].debuff)+'<br><b>At devotion 3:</b> '+FAITH[k].bless.name+'. '+FAITH[k].bless.desc,faithOf()===k?'Sworn':'')));
  if(k==='omens') return cxP('Once you have cleared a gate, about '+pct(OMEN_CHANCE)+' of dawns bring an omen. It lasts the whole day and touches every gate and the Tower. Today: '+(omen()?OMENS[omen()].name:'no omen')+'.')
    +cxList(Object.keys(OMENS).map(o=>cxRow(OMENS[o].name,OMENS[o].desc,omen()===o?'Today':'')));
  if(k==='roles') return cxP('Every creature, yours or the enemy\'s, has one of four roles.')+cxList(Object.keys(ROLES).map(r=>cxRow(ROLES[r].label,ROLES[r].text+' '+CDX_ROLE[r])));
  if(k==='minions') return cxP('What each body rises with at its gate\'s base foe level, before Will, Grave Pact, gear, traits and evolution. Every level adds 16% HP and 12% attack. A raised elite has x1.5 HP and x1.3 attack; a raised boss x3.2 HP and x1.4 attack.')
    +DUNGEONS.map((D,di)=>{ const lv=RK[di].lv, list=D.mobs.map(t=>({n:t[0],role:t[1],hf:t[2],af:t[3],boss:false})).concat([{n:D.boss[0],role:D.boss[1],hf:1,af:1,boss:true}]);
      return '<p class="group-h">'+D.name+' &middot; Lv '+lv+'</p>'+cxList(list.map(x=>{ const met=!!(S.kills&&S.kills[x.n]); if(!met) return cxRow('???','Not met yet.');
        const st=mobStats(di,lv,x.hf,x.af,x.boss,false); return cxRow(x.n,'HP '+st.hp+' &middot; ATK '+st.atk+(x.boss?' &middot; boss':''),ROLES[x.role].label); })); }).join('');
  if(k==='traits') return cxP('Every raised minion rolls one trait (bosses two). It evolves at set levels above the level it was raised at; each stage adds its own buff and one more trait. A raised elite also keeps one of its affixes as a trait. Fusion can stack traits up to '+FUSE_TRAITS+'.')
    +cxList(STAGES.slice(1).map((n,i)=>cxRow(n.trim(),fxText(STAGE_FX[i+1])+' and one more trait.','+'+EVOLVE_AT[i+1]+' levels')))
    +cxList(['commander'].concat(TRAIT_IDS).map(t=>{ const from=AFFIX_IDS.filter(a=>AFFIX[a].trait===t).map(a=>AFFIX[a].name); return cxRow(TRAITS[t].name,TRAITS[t].desc+(from.length?' Kept from '+withArticle(from.join(' or '))+' elite.':'')); }));
  if(k==='affixes') return cxP('About one foe in ten is an elite: '+pct(.5)+' more HP, 30% more attack, more XP, gold, trophies and better drops, and harder to raise. Every elite carries a named affix, two in the '+DUNGEONS[3].name+' and deeper and from Tower floor 50.')
    +cxList(AFFIX_IDS.map(a=>cxRow(AFFIX[a].name,AFFIX[a].desc+' Raised, it becomes '+TRAITS[AFFIX[a].trait].name+': '+TRAITS[AFFIX[a].trait].desc)));
  if(k==='bosses') return cxP('Every gate boss has a signature move it uses every few turns in place of attacking. Moves marked telegraphed are announced a turn ahead (Charging): soak them with Bone Ward, or freeze the boss with Grave Chill to cancel them. A boss calls at most '+SUMMON_CAP+' helpers a fight. Tower wardens borrow these moves, a turn sooner from floor 50, and grow wrathful after turn 8: every turn after that they hit 7% harder (12% on floor 100).')
    +cxP('At '+pct(PHASE_AT)+' HP a boss (from the Sunken Crypt on, and every Tower warden) enters its second phase: its moves come a turn sooner, every move is telegraphed, and it alternates its own move with Sundering Blow. Taunt sends that blow at a vanguard, and a Focus crit breaks any charging move.')
    +cxList(Object.keys(BOSS_ABIL).map(id=>{ const A=BOSS_ABIL[id], gi=GATE_ABIL.indexOf(id), who=id==='sunder'?'Every boss, second phase':gi>=0?(metName(DUNGEONS[gi].boss[0])?DUNGEONS[gi].boss[0]:'An unmet boss')+' &middot; '+DUNGEONS[gi].name:'';
      return cxRow(A.name,A.desc+' Every '+A.every+' turns.',(A.warn?'Telegraphed &middot; ':'')+who); }))
    +(()=>{ const met=SECRET.map((B,i)=>({B,i})).filter(x=>metName(x.B.name)); if(!met.length) return '';
      return '<p class="group-h">Secret masters</p>'+cxP('Some gates hide an older master. Once a gate is cleared, its boss room very rarely holds that master instead, a little more often on harder difficulty and each time it stays away. It is never weaker than you, fights with the strength of the hardest gate open to you, and grows tougher the further you stand past that gate. It enters its second phase at once and acts faster. It pays four times the XP and gold, two legendaries and its heart, and its title.')
        +cxList(met.map(x=>cxRow(x.B.name,'The secret master of the '+DUNGEONS[x.i].name+'. It borrows '+BOSS_ABIL[GATE_ABIL[x.i]].name+'.',T_('secret_'+x.i)?'Slain':'Met'))); })();
  if(k==='status') return cxP('Damage over time ticks at the end of each turn, ignores ward and armor, and wears off when you leave the room. A new dose of the same kind refreshes it rather than stacking. A Healing Draught cures you; Dark Mending cures your whole side. Foes with the Warded affix and minions with the Warded trait are immune.')
    +cxList(Object.keys(DOTS).map(d=>cxRow(DOTS[d].name,CDX_DOT[d])))
    +'<p class="group-h">Other effects in a fight</p>'+cxList([cxRow('Frozen','From Grave Chill and Soul Prison. The foe skips its turn; a charging move is lost.'),cxRow('Cursed','From Curse of Frailty and Soul Prison. The foe takes more damage from everything.'),
      cxRow('Shield','Soaks damage before HP. Foes get it from Bone Wall and the Shielded affix; your Bone Ward is capped at 60% of your max HP.'),cxRow('Silenced','From the Hymn of Silence. Your skills cannot be used for 2 turns.'),
      cxRow('Armor','Deeper foes wear armor that blunts every hit you and your army land: '+DIFF.armor.map((a,i)=>RANKS[i]+' '+pct(a)).join(', ')+', Tower '+pct(TW.armor)+'. Soul Siphon pierces '+pct(SIPHON_PIERCE)+', Bone Spear half (all of it with Impaler); Corpse Explosion, Reap and Death\'s Toll ignore it.')]);
  if(k==='skills') return cxP('One skill point per level. Each skill has '+SK_MAX+' ranks, and each rank needs '+SK_STEP+' more levels than the last. Active skills cost mana and have cooldowns that reset every room. At rank '+SK_MAX+' you choose one of two upgrades. Forgetting your skills in town refunds every point.')
    +cxList(SKILLS.map(s=>{ const M=SKILL_MODS[s.id]; return cxRow(s.name,[1,2,3].map(r=>'<b>Rank '+r+' (Lv '+skReq(s,r)+'):</b> '+s.desc(r)).join('<br>')+(M?'<br><b>Upgrades:</b> '+M.a[0]+' ('+M.a[1]+') or '+M.b[0]+' ('+M.b[1]+')':''),s.type==='active'?'Active &middot; '+s.cost+' mana &middot; cooldown '+s.cd:'Passive'); }))
    +'<p class="group-h">Soul Siphon and Souls</p>'+cxP('Soul Siphon (key 2, '+siphonCost()+' mana) pierces '+pct(SIPHON_PIERCE)+' of foe armor, drains twice as hard from a foe below '+pct(SIPHON_LOW)+' HP, heals you for '+pct(SIPHON_HEAL)+' of what it drains ('+pct(SIPHON_HEAL_LD)+' with Lifedrain), and harvests a Soul. Every elite or boss that falls also gives a Soul. You hold up to '+SOUL_MAX+', and they last for the whole run.')
    +'<p class="group-h">Ultimates</p>'+cxP('From level '+ULT_LV+', choose one ultimate on the Skills tab (switch for free in town). With '+SOUL_MAX+' Souls, unleash it in battle with R; it uses your turn and all your Souls.')
    +cxList(Object.keys(ULTS).map(id=>cxRow(ULTS[id].name,ULTS[id].desc,S.player.ult===id?'Chosen':'')));
  if(k==='orders') return cxP('Once per room, each kind of minion in your army can be given one order. Orders are free and do not use your turn.')+cxList(Object.keys(CMDS).map(r=>cxRow(CMDS[r].name,CMDS[r].desc,ROLES[r].label+'s')));
  if(k==='gates') return cxP('Six gates of four rooms each, the last holding the boss. Clearing a gate pays bonus XP and, the first time, a page of the story.')
    +cxP('A cleared gate can be entered on a harder difficulty, picked on its card: '+HEAT.slice(1).map(h=>h.name+' (foes x'+h.foe+'; XP x'+h.xp+', gold x'+h.gold+', gear x'+h.drop+')').join(', ')+'. Each opens after clearing the one below. On a cursed day the curse feeds on it: a further x'+DAMNED_FOE+' to foes, x'+DAMNED+' to rewards. A Nightmare clear marks the gate\'s card and earns that gate\'s Nightmare title.')
    +cxP('On Normal, a gate far below you pays less: kill XP, gold and the clear bonus stay full until you stand about '+DIFF.farmFrom+' levels past its recommended level, then fall to '+pct(DIFF.farmMin)+' at about '+DIFF.farmTo+' levels past; the gate card says when it applies. A first clear, a cursed gate and every harder difficulty pay in full, and gear drops never shrink.')
    +cxList(DUNGEONS.map((D,i)=>{ const mobs=D.mobs.map(m=>metName(m[0])?m[0]+' ('+ROLES[m[1]].label.toLowerCase()+(isArmed(m[0])?', gear-bearer':'')+')':'???').join(', ');
      return cxRow(D.name,'Opens at level '+RK[i].unlock+', recommended from level '+gateRec(i)+'. Armor '+pct(DIFF.armor[i])+'. Clear bonus '+RK[i].clear+' XP.<br><b>Foes:</b> '+mobs+'<br><b>Boss:</b> '+(metName(D.boss[0])?D.boss[0]+', '+BOSS_ABIL[GATE_ABIL[i]].name:'???')+(secretHinted(i)?'<br><i class="dim">'+SECRET[i].hint+'</i>':''),'Rank '+RANKS[i]); }));
  if(k==='tower') return cxP('Opens at level '+TW.unlock+'. One fight per floor and a warden every tenth floor, each carrying a unique: guaranteed the first time, '+pct(TW.repeat)+' after (as gold while you carry one). Floors you clear become checkpoints every ten floors. Past floor 100 the Abyss never ends, and each tenth floor pays gold and a legendary. Tower foes wear '+pct(TW.armor)+' armor.')
    +cxList(TW_BOSS.map((n,i)=>{ const f=(i+1)*10, seen=S.tower.best>=f-10; return cxRow(seen?n:'???','Floor '+f+' &middot; recommended level '+recLv(f)+(seen?' &middot; '+BOSS_ABIL[GATE_ABIL[i%GATE_ABIL.length]].name:''),S.tower.best>=f?'Defeated':''); }));
  if(k==='gear') return cxP('You wear a weapon, armor and a relic. Gear-bearer minions can wear them too. On a minion, attack, strength, crit, Siphon and intelligence add to its attack; HP, constitution, ward, mana and will add to its HP; minion power works as usual.')
    +cxList(TIERS.map((t,i)=>cxRow(t,i===5?'One per gate boss and Tower warden. Fixed stats and a unique power. A unique you already carry never drops again: you get ordinary gear (or gold, from a warden) instead. Cannot be sold, salvaged or enchanted, and ignores the bag limit.':(ROLL_LINES[i]?'Up to '+ROLL_LINES[i][0]+' bonus line'+(ROLL_LINES[i][0]>1?'s':'')+', each rolled at '+pct(ROLL_LINES[i][1])+'.':'')+' Salvages for '+(DUST_TIER[i]||0)+' bone dust, plus 1 per two bonus lines.',i===5?'':'Tier '+(i+1))))
    +'<p class="group-h">Working on gear</p>'+cxList([cxRow('Reforge','Re-rolls every bonus line for '+pct(REFORGE_COST)+' of the merchant price in gold. Always leaves at least one line.'),cxRow('Enchant','Spends bone dust to add one bonus line to a piece with room for it, or to re-roll one line you choose.'),
      cxRow('Salvage','Breaks a piece into bone dust.'),cxRow('Lock','A locked piece cannot be sold, salvaged or discarded until you unlock it.'),cxRow('Sell','Gear sells for a quarter of the merchant price, plus a quarter more per bonus line.'),cxRow('Trophy forge',FORGE_N+' trophies from one gate (a boss heart counts as 5) and some gold forge that gate\'s gear in the slot you choose. '+pct(MASTERWORK)+' come out a masterwork from the next gate.')]);
  if(k==='uniques') return cxP('Uniques carry one of these powers. Only worn gear counts.')+cxList(Object.keys(FLAGS).map(f=>{ const i=FLAGS[f].indexOf(':'), d=FLAGS[f].slice(i+1).trim(); return cxRow(FLAGS[f].slice(0,i),d.charAt(0).toUpperCase()+d.slice(1)); }));
  if(k==='sets') return cxP('Each gate\'s gear is a set, and its unique counts toward it. Ordinary Tower gear belongs to no set.')+cxList(SET_NAMES.map((n,i)=>cxRow(n,'<b>2 pieces:</b> '+buffTxt(SET_BONUS[i][2])+'<br><b>3 pieces:</b> '+buffTxt(SET_BONUS[i][3]),DUNGEONS[i].name)))
    +'<p class="group-h">Unique sets</p>'+cxP('The uniques form six sets of three: a weapon, an armor and a relic. Their bonuses are bigger than a gate set\'s, and a gate unique counts toward both its gate set and its unique set.')
    +cxList(USET.map((U,i)=>{ return cxRow(U.name,'<b>Pieces:</b> '+U.ids.map(id=>ITEM[id].name).join(', ')+'<br><b>From:</b> '+U.from+'<br><b>2 pieces:</b> '+buffTxt(U.b[2])+'<br><b>3 pieces:</b> '+buffTxt(U.b[3]),'Worn '+usetCount(i)+'/3'); }));
  if(k==='supplies') return cxList(Object.keys(POTIONS).map(p=>cxRow(POTIONS[p].name,POTIONS[p].desc+' Key '+POTIONS[p].key+'. Carry up to '+BELT_MAX+'.'))
    .concat([cxRow('Grave Salts','+'+SALT_BONUS+'% chance on one raise. Carry up to '+SALT_MAX+'.'),cxRow('Brewing','Any '+BREW_N+' trophies brew a potion at the market.'),cxRow('Bone Altar','Pour gold on it to raise a minion one level, never past your level + 2.'),cxRow('Larger bag','+'+BAG_STEP+' slots per upgrade, '+BAG_COST.length+' upgrades. The bag starts at '+BAG_MAX+'.')]));
  if(k==='rooms') return '<p class="group-h">Doors</p>'+cxP('After each gate room you choose the next from two or three doors. The first is always an ordinary fight; the room before the boss leads only to the boss.')
    +cxList(Object.keys(DOORS).map(d=>cxRow(DOORS[d].name,DOORS[d].desc)))
    +'<p class="group-h">Between rooms</p>'+cxP('After '+pct(EVENT_CHANCE)+' of gate rooms (never the last, never in the Tower) you find something. Walking past is always safe.')
    +cxList(Object.keys(EVENTS).map(e=>cxRow(EVENTS[e].name,EVENTS[e].text+' Choices: '+EVENTS[e].opts.map(o=>o[1]).join(' or ')+'.'+(EVENTS[e].faith?' Only for the '+FAITH[EVENTS[e].faith].name+', in about '+pct(FAITH_EVENT)+' of events.':''))));
  if(k==='raids') return cxP('A raised elite can rise as a Commander ('+pct(CMD_ELITE)+'; a boss '+pct(CMD_BOSS)+'), and may become one when it evolves. Only elites and bosses can hold it, even through fusion. From the War table on the Gates tab, a Commander leads one to '+RAID_SQUAD+' followers (+1 per evolution, +1 for a boss) against a gate you have cleared. They are away until dawn and still fill their slots.')
    +cxList([cxRow('Odds','Your squad\'s total attack and HP against the gate\'s foes, raised 10% per Commander evolution and 15% for a boss. Between '+pct(RAID_MIN)+' and '+pct(RAID_MAX)+'.'),cxRow('Win',RAID_GOLD+'x a gate\'s gold, two or three pieces of gear from its table (never a unique) and half a level of XP for each member.'),cxRow('Loss','Each follower falls '+pct(RAID_LOSS)+' of the time (Grave-bound never do); its gear returns to your bag. The Commander always comes home.')]);
  if(k==='rift') return cxP('Opens at level '+RIFT_LV+' once the Throne of Ash has fallen. Each depth is a '+RIFT_ROOMS+'-room run through a random gate\'s dead, at your level plus one per three depths, as strong as the deepest gate and '+pct(RIFT_STEP)+' harder per depth. Gear drops rise '+pct(RIFT_DROP)+' per depth (at most x'+RIFT_DROP_MAX+'). Clearing your deepest depth opens the next and leaves an extra legendary. No curses, no difficulty levels.');
  if(k==='curses') return cxP('Each day one gate you have cleared is cursed. '+MOD_REWARD+' Once the Throne of Ash has fallen, a cursed gate\'s foes rise to '+CURSE_GAP+' levels below yours, so cursed days stay a real fight.')+cxList(Object.keys(MODS).map(m=>cxRow(MODS[m].name,MODS[m].desc)));
  if(k==='town') return '<p class="group-h">Buildings</p>'+cxP('Each has '+BUILD_MAX+' levels, costing '+BUILD_COST.map((c,i)=>'level '+(i+1)+': '+c[0]+' gold'+(c[1]?' + '+c[1]+' bone dust':'')).join('; ')+'. They last until New Game+.')
    +cxList(Object.keys(BUILD).map(b=>cxRow(BUILD[b].name,BUILD[b].desc,'Level '+bl(b)+'/'+BUILD_MAX)))
    +'<p class="group-h">The Flesh Pit</p>'+cxP('Fuse two minions of the same role. The stronger survives with '+FUSE_LV+' more level (never past your level + 2), the higher evolution, and both sets of traits up to '+FUSE_TRAITS+'. A minion can take part in at most '+FUSE_MAX+' fusions. It costs 60 gold per level of the two minions together.');
  if(k==='bounties') return cxP('Three contracts go up each dawn; progress counts from then. Claim finished ones in town before the day ends. Rewards are gold, Grave Salts, bone dust, or a piece of gear from your deepest open gate with bonus lines.')
    +cxList(Object.keys(BOUNTIES).map(b=>cxRow(BOUNTIES[b].t(BOUNTIES[b].n),BOUNTIES[b].ok?'Only offered once it makes sense for you.':'Can be offered any day.')));
  if(k==='titles'){ const by=g=>TITLES.filter(t=>t.grp===g).length, rc=TIERS.map((n,i)=>TITLES.filter(t=>t.r===i).length+' '+n.toLowerCase()).join(', ');
    return cxP('Titles are earned once and kept forever, even through New Game+. Each gives a small bonus, but only the one you wear counts. There are '+TITLES.length+': '+['Gates','Hell Tower','Curses and events','Deeds'].map(g=>by(g)+' for '+(g==='Hell Tower'?g:g.toLowerCase())).join(', ')+'.')
      +'<p class="group-h">Rarity</p>'+cxP('Titles come in the same rarities as gear: '+rc+'. A rarer title gives a bigger bonus ('+TIERS.map((n,i)=>RARITY_MUL[i]>1?n+' x'+RARITY_MUL[i]:'').filter(Boolean).join(', ')+'). '+TIERS.slice(HIDDEN_FROM).join(', ').replace(/, ([^,]*)$/,' and $1')+' titles stay hidden as "???" until you earn them.')
      +cxP('The Titles tab filters by earned, locked, close to earning and rarity, and titles that count something show how far along you are.')
      +'<p class="group-h">Kinds of title bonus</p>'+cxList((()=>{ const n={}; TITLES.forEach(t=>Object.keys(t.b||{}).forEach(k=>{ n[k]=(n[k]||0)+1; })); return Object.keys(n).sort((a,b)=>n[b]-n[a]).map(k=>{ const L=TBUFF_L[k]||STATL[k], pc=!!TBUFF_L[k], twin=!pc&&Object.values(TBUFF_L).some(x=>x[0]===L[0]);
        return cxRow(L[0]+(pc&&Object.values(STATL).some(x=>x[0]===L[0])?' (percent)':twin?' (flat)':''),pc?(L[2]<0?'Lowers ':'Raises ')+'it by a percent of the total.':'Added like the same stat on gear'+(L[1]?' (in percentage points).':'.'),n[k]+' title'+(n[k]>1?'s':'')); }); })())
      +'<div class="btns"><button class="btn small" data-a="tab" data-k="titles">Open the Titles tab</button></div>'; }
  return '';
}
const cxQuery=()=>String(ui.cxq||'').trim().toLowerCase().length>=2?String(ui.cxq).trim().toLowerCase():'';
function cxSearchHTML(){   // every row and paragraph of every page that mentions the search, grouped by page
  const q=cxQuery(), plain=x=>x.replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').toLowerCase(); let n=0, h='';
  for(const [k,name] of CODEX){ const html=codexSection(k); if(!html) continue;
    const bits=(html.match(/<div class="tt-row cx-row">[\s\S]*?<\/div><\/div><\/div>|<p class="help-p">[\s\S]*?<\/p>/g)||[]).filter(b=>plain(b).includes(q));
    if(!bits.length) continue; n+=bits.length;
    h+='<p class="group-h">'+name+' <button class="linkbtn" data-a="cx" data-k="'+k+'">open page</button></p>'+bits.map(b=>b.startsWith('<p')?b:'<div class="items">'+b+'</div>').join(''); }
  return '<p class="q-note">'+(n?n+' match'+(n>1?'es':'')+' for "'+q.replace(/[&<>]/g,'')+'". <button class="linkbtn" data-a="cxclear">Clear</button>':'Nothing in the Codex mentions "'+q.replace(/[&<>]/g,'')+'". <button class="linkbtn" data-a="cxclear">Clear</button>')+'</p>'+h;
}
function codexHTML(){
  const k=CODEX.some(c=>c[0]===ui.cx)?ui.cx:'basics', name=CODEX.find(c=>c[0]===k)[1];
  return '<section class="win" aria-labelledby="h-cx"><h2 class="win-h" id="h-cx">Codex &middot; '+name+'</h2>'
   +'<input id="cxq" class="cx-q" type="search" data-a="cxq" placeholder="Search every page (poison, armor, Lifedrain...)" aria-label="Search the Codex" value="'+String(ui.cxq||'').replace(/[&"<>]/g,c=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]))+'">'
   +(cxQuery()?cxSearchHTML():'<div class="chips cx-nav" role="tablist">'+CODEX.map(c=>'<button class="btn small'+(c[0]===k?' primary':'')+'" role="tab" data-a="cx" data-k="'+c[0]+'" aria-selected="'+(c[0]===k)+'">'+c[1]+'</button>').join('')+'</div>'
   +codexSection(k))+'</section>';
}
function faithHTML(){
  const P=S.player, id=faithOf();
  let h='<p class="group-h">The Old Shrine &middot; faith</p>';
  if(P.lvl<FAITH_LV) return h+'<p class="lede">A cracked altar at the edge of town. It will hear an oath from a necromancer of level '+FAITH_LV+' or more.</p>';
  if(id){ const F=FAITH[id], dv=devotion(), nx=DEVOTION[dv+1];
    return h+'<div class="items"><div class="tt-row on"><div><h4>'+F.name+' <span class="u-tag">devotion '+(dv+1)+'/3</span></h4><div class="u-sub">Gives '+buffTxt(faithBuff(id))+'; costs '+buffTxt(F.debuff)+'.</div>'
      +'<div class="u-sub">'+'<div class="u-sub'+(blessed(id)?' ok':'')+'"><b>'+F.bless.name+'</b> (devotion 3): '+F.bless.desc+(blessed(id)?'':' Not yet.')+'</div>'+'<div class="u-sub">'+(nx!=null?'Keep the oath until day '+(S.faith.day+nx)+' for devotion '+(dv+2)+' (the gift grows x'+DEVOTION_MUL[dv+1]+').':'Your devotion is complete.')+'</div></div>'
      +'<button class="btn small warn" data-a="renounce"'+(S.gold<renounceCost()?' disabled':'')+'>'+(ui.confirm==='renounce'?'Confirm: renounce for '+renounceCost()+' gold':'Renounce &middot; '+gold(renounceCost()))+'</button></div></div>';
  }
  return h+'<p class="q-note">Swear an oath. Each path gives and takes. Devotion grows with the days you keep it; renouncing costs gold and starts it over.</p><div class="items">'
   +Object.keys(FAITH).map(k=>{ const F=FAITH[k]; return '<div class="tt-row"><div><h4>'+F.name+'</h4><div class="u-sub">'+F.vow+'</div><div class="u-sub"><span class="ok">Gives '+buffTxt(F.buff)+'</span> &middot; <span class="bad">costs '+buffTxt(F.debuff)+'</span></div><div class="u-sub">At devotion 3: <b>'+F.bless.name+'</b>. '+F.bless.desc+'</div></div>'
     +'<button class="btn small primary" data-a="swear" data-k="'+k+'">'+(ui.confirm==='swear'+k?'Confirm the oath':'Swear')+'</button></div>'; }).join('')+'</div>';
}
function buildHTML(){
  const P=S.player;
  let h='<section class="win" aria-labelledby="h-bld"><h2 class="win-h" id="h-bld">The town</h2><h3 class="win-title">You have '+gold(S.gold)+' and '+dust(S.dust||0)+'</h3>'
   +'<p class="lede">Build up the necropolis. Each building has '+BUILD_MAX+' levels and its bonus lasts for the rest of this game. The higher levels need bone dust, which you get by salvaging gear on the Gear tab.</p>';
  if(ui.msg&&ui.msg.mk) h+='<div class="note '+(ui.msg.c||'')+'"><i>Town</i><span>'+ui.msg.m+'</span></div>';
  h+='<div class="items">'+Object.keys(BUILD).map(k=>{ const B=BUILD[k], lv=bl(k), c=buildCost(k), can=c&&S.gold>=c[0]&&(S.dust||0)>=c[1];
    return '<div class="tt-row"><div><h4>'+B.name+' <span class="u-tag">Level '+lv+'/'+BUILD_MAX+'</span></h4><div class="u-sub">'+B.desc+'</div></div>'
     +(c?'<button class="btn small primary" data-a="build" data-k="'+k+'"'+(can?'':' disabled')+'>'+(lv?'Upgrade':'Build')+' &middot; '+gold(c[0])+(c[1]?' + '+dust(c[1]):'')+'</button>':'<span class="u-tag ok">Complete</span>')+'</div>'; }).join('')+'</div>';
  h+=faithHTML();
  // flesh pit
  h+='<p class="group-h">The Flesh Pit &middot; fuse two minions</p><p class="q-note">Two minions of the same role become one. The stronger survives, gains '+FUSE_LV+' level (never past your level + 2), keeps the higher evolution and takes the other\'s traits, up to '+FUSE_TRAITS+'. A minion can take part in at most '+FUSE_MAX+' fusions. The other\'s gear returns to your bag.</p>';
  const a=ui.fuse!=null&&S.army.find(m=>m.uid===ui.fuse);
  if(S.army.length<2) h+='<p class="lede">You need at least two minions.</p>';
  else if(!a) h+='<div class="items">'+S.army.map(m=>{ const pals=S.army.filter(x=>canFuse(m,x)).length;
      return '<div class="tt-row trow">'+ico(m.kind||m.name,m.rankI,m)+'<div><h4>'+m.nick+' <span class="dim" style="font-size:13px">'+theName(mName(m))+'</span></h4><div class="u-sub">'+ROLES[m.role].label+' &middot; Lv '+m.lvl+' &middot; '+(m.traits||[]).map(t=>TRAITS[t].name).join(', ')+'</div></div>'
       +'<button class="btn small" data-a="fusepick" data-k="'+m.uid+'"'+(pals?'':' disabled title="No other '+ROLES[m.role].label.toLowerCase()+' to fuse with"')+'>Choose</button></div>'; }).join('')+'</div>';
  else{
    h+='<p class="q-note">Fusing <b>'+a.nick+'</b> ('+ROLES[a.role].label+', Lv '+a.lvl+') with: <button class="linkbtn" data-a="fusepick" data-k="'+a.uid+'">change</button></p><div class="items">'
     +S.army.filter(x=>canFuse(a,x)).map(m=>{ const c=fuseCost(a,m), conf=ui.confirm==='fu'+m.uid;
       return '<div class="tt-row trow">'+ico(m.kind||m.name,m.rankI,m)+'<div><h4>'+m.nick+' <span class="dim" style="font-size:13px">'+theName(mName(m))+'</span></h4><div class="u-sub">Lv '+m.lvl+' &middot; '+(m.traits||[]).map(t=>TRAITS[t].name).join(', ')+'</div></div>'
        +'<button class="btn small '+(conf?'warn':'primary')+'" data-a="fuse" data-k="'+m.uid+'"'+(S.gold<c?' disabled':'')+'>'+(conf?'Confirm: one is consumed':'Fuse &middot; '+gold(c))+'</button></div>'; }).join('')+'</div>';
  }
  return h+'</section>';
}
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
  h+='<div class="tabs" role="tablist">'+[['gates','Gates'],['tower','Hell Tower'],['gear','Gear &middot; '+S.inv.length],['market','Market']].concat(townOpen()?[['town','Town']]:[]).concat([['skills','Skills'+(S.player.sp?' &middot; '+S.player.sp:'')],['titles','Titles &middot; '+Object.keys((S.ti&&S.ti.got)||{}).length],['ledger','Ledger']]).map((t,i)=>(t[0]==='tower'&&twLock)?'<button class="tab tw-lock" role="tab" disabled aria-disabled="true" aria-label="Hell Tower, locked until level '+TW.unlock+'" title="The Hell Tower opens at level '+TW.unlock+'"><span aria-hidden="true">&#128274; </span>Hell Tower &middot; Lv '+TW.unlock+'</button>':'<button class="tab'+(t[0]==='tower'?' hell':'')+'" role="tab" data-a="tab" data-k="'+t[0]+'" aria-keyshortcuts="'+(i+1)+'" aria-selected="'+(t[0]==='ledger'?LEDGER.some(x=>x[0]===ui.tab):(ui.tab||'gates')===t[0])+'">'+t[1]+(i<9?'<kbd aria-hidden="true">'+(i+1)+'</kbd>':'')+'</button>').join('')
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
  const r=S.run, isP=u.id==='p', max=isP?pMax():u.maxHp, f=r.fx[u.id]||{d:0,h:0}, dead=u.hp<=0;
  const sel=side==='foe'&&r.target===u.id&&!dead;
  const tag=isP?'Necromancer':ROLES[u.role].label+(isArmed(u.base||u.name)?' &middot; Armed':'')+(u.boss?' &middot; Boss':'')+(u.elite?' &middot; Elite':'')+(u.abil&&!isP?' &middot; <span title="'+BOSS_ABIL[u.abil].desc+'">'+BOSS_ABIL[u.abil].name+'</span>':'')+(u.phase2&&!isP?' &middot; <span class="phase-t">Second phase</span>':'')+(u.aff&&!isP?u.aff.map(a=>' &middot; <span class="aff" title="'+AFFIX[a].desc+'">'+AFFIX[a].name+'</span>').join(''):'');
  const rk=isP?'':'<span class="rk r'+u.rankI+'">'+RANKS[u.rankI]+'</span>';
  const fx=f.d?'<span class="fx neg">-'+f.d+'</span>':f.h?'<span class="fx pos">+'+f.h+'</span>':'';
  const dots=u.dots&&!dead?Object.keys(u.dots).map(k=>' &middot; <span class="dot-t '+k+'" title="'+u.dots[k].d+' damage a turn for '+u.dots[k].t+' more turn'+(u.dots[k].t>1?'s':'')+'">'+DOTS[k].name+' '+u.dots[k].d+'&times;'+u.dots[k].t+'</span>').join(''):'';
  const sub=side==='foe'?'Lv '+u.lvl+' &middot; ATK '+u.atk+(u.curse&&!dead?' &middot; <span class="bad">Cursed '+u.curse.t+'</span>':'')+(u.stun&&!dead?' &middot; <span class="ok">Frozen</span>':'')+(u.shield>0&&!dead?' &middot; <span class="sh-t">Shield '+u.shield+'</span>':'')+dots+(u.charging&&!dead?'<span class="charge">Charging '+BOSS_ABIL[u.move||u.abil].name+'</span>':''):(isP?'Lv '+u.lvl+' &middot; ATK '+pAtk():mName(u)+' &middot; Lv '+u.lvl+' &middot; ATK '+u.atk)+dots;
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
  return '<div class="mrow"><span class="rk r'+m.rankI+'">'+RANKS[m.rankI]+'</span><span class="mr-name"><b style="'+(m.elite?'color:var(--gold)':'')+'">'+m.nick+'</b> <span class="dim">'+theName(mName(m))+'</span></span>'
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
   +(S.army.length>1&&S.mode!=='battle'?'<div class="bag-tools">Order: '+Object.keys(ARMY_SORTS).map(k=>'<button class="linkbtn" data-a="asort" data-k="'+k+'">'+ARMY_SORTS[k]+'</button>').join('')+'<span class="a-dens" role="group" aria-label="Army view">View: '+[['cards','Cards'],['compact','Compact']].map(x=>'<button class="linkbtn'+(VIEW.army===x[0]?' on':'')+'" data-a="view" data-k="army|'+x[0]+'" aria-pressed="'+(VIEW.army===x[0])+'">'+x[1]+'</button>').join('')+'</span></div>':'')
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
     +'<div class="u-name" style="'+(c.elite?'color:var(--gold)':'')+'">'+c.name+'</div><div class="u-sub num">Lv '+c.lvl+(c.aff?' &middot; <span class="aff" title="A raised elite keeps one of these as a trait">'+c.aff.map(a=>AFFIX[a].name===TRAITS[AFFIX[a].trait].name?'keeps '+AFFIX[a].name:AFFIX[a].name+' &rarr; '+TRAITS[AFFIX[a].trait].name).join(', ')+'</span>':'')+(c.free?' &middot; <span class="free-t">Straggler: free, +'+STRAGGLER_BONUS+'%</span>':'')+'</div></div></div></div>'+right+'</div>';
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
function render(){
  checkTitles(); try{ loreCheck(); }catch(e){}
  document.body.classList.toggle('hell', S.mode==='town'?ui.tab==='tower':!!(S.run&&S.run.tw));   // hell backdrop on the Tower tab and during a climb
  document.body.classList.toggle('fight', S.mode!=='town');   // a slimmer header while you are in a gate or the Tower
  const f=document.activeElement; let key=null;
  if(f&&f.dataset&&f.dataset.a) key='[data-a="'+f.dataset.a+'"]'+(f.dataset.k?'[data-k="'+f.dataset.k+'"]':'');
  let pips=''; for(let i=0;i<WATCHES;i++) pips+='<i class="pip'+(i<S.watches?' on':'')+'"></i>';
  const tabNote=TAB.blocked?'<div class="note bad tab-note"><span>This game was just saved from another tab. This tab has stopped saving so it cannot overwrite that progress. Close one of the tabs, or load the newer save here.</span><button class="btn small primary" data-a="tabsync">Load the newer save</button></div>':'';
  const mo=MOMENTS.length?'<div class="moments" role="status">'+MOMENTS.map(x=>'<div class="moment '+x.c+'">'+x.t+'</div>').join('')+'</div>':''; MOMENTS.length=0;
  const main=S.mode==='battle'?battleHTML():S.mode==='raise'?raiseHTML():S.mode==='defeat'?defeatHTML():townHTML();
  app.innerHTML='<header class="top"><div class="brand"><svg class="sigil" viewBox="0 0 64 64" width="54" height="54" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="32" cy="32" r="30"/><circle cx="32" cy="32" r="24" stroke-dasharray="1.5 3.5"/><rect x="16" y="16" width="32" height="32"/><rect x="16" y="16" width="32" height="32" transform="rotate(45 32 32)"/><circle cx="32" cy="32" r="6"/><circle cx="32" cy="32" r="2" fill="currentColor"/></g></svg><div><h1>Ledger of the Dead</h1><p class="tag">Every name in this book answers to you.</p></div></div><div class="top-meta">'+(S.ngp?'<span class="ngp-b" title="New Game+">NG+'+S.ngp+'</span>':'')+'<span>Day '+S.day+'</span><span title="Gold">'+gold(S.gold)+'</span><span>Watches<span class="pips" aria-label="'+S.watches+' of '+WATCHES+' watches left">'+pips+'</span></span></div>'
   +'<button class="gearbtn'+((ui.tab==='settings'&&S.mode==='town')?' on':'')+'" data-a="settings" aria-label="Settings" aria-pressed="'+(ui.tab==='settings'&&S.mode==='town')+'"'+(S.mode==='town'?' title="Settings: save, load, new game"':' disabled title="Settings open when you are back in town"')+'><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M10.3 2h3.4l.5 2.6c.6.2 1.2.5 1.7.9l2.5-.9 1.7 2.9-2 1.7c.1.6.1 1.3 0 1.9l2 1.7-1.7 2.9-2.5-.9c-.5.4-1.1.7-1.7.9l-.5 2.6h-3.4l-.5-2.6c-.6-.2-1.2-.5-1.7-.9l-2.5.9-1.7-2.9 2-1.7a6 6 0 0 1 0-1.9l-2-1.7 1.7-2.9 2.5.9c.5-.4 1.1-.7 1.7-.9zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z"/></svg></button></header>'
   +'<div class="layout"><div class="main">'+tabNote+mo+tipHTML()+main+'</div><aside class="rail">'+questHTML()+statusHTML()+equipHTML()+(townOpen()?bountyHTML():'')+'</aside></div>'+(ui.keys?keysHTML():'');
  try{ trDom(app); if(document.documentElement) document.documentElement.lang=VIEW.lang; }catch(e){}
  if(key){ const n=app.querySelector(key); if(n){ n.focus({preventScroll:true}); if(n.tagName==='INPUT'&&n.type==='search'){ const l=n.value.length; try{ n.setSelectionRange(l,l); }catch(e){} } } }
  const scr=S.mode+'|'+(S.mode==='town'?ui.tab:(S.run?(S.run.tw||'g')+':'+S.run.room:''));   // entering a gate, a new room or another tab starts at the top
  if(ui.scr&&ui.scr!==scr&&typeof window.scrollTo==='function') try{ window.scrollTo(0,0); }catch(e){}
  ui.scr=scr;
  if(ui.shake&&!VIEW.calm){ ui.shake=false; const w=app.querySelector('.main > .win'); if(w) w.classList.add('shake'); }
  try{ bossBg(); }catch(e){} try{ scene(); }catch(e){} try{ srAnnounce(); }catch(e){}
  try{ music(); }catch(e){} try{ fxSync(); }catch(e){}   // the battle effects layer (src/fx.js): loads, turns off, or plays what this turn queued
  save();   // every screen saves; outside town the snapshot is "as if you walked out now"
}
const ACTIONS={
  equip:k=>equip(+k), unequip:k=>unequip(k), tab:k=>{ if(k==='tower'&&S.player.lvl<TW.unlock) return; ui.tab=k==='ledger'?(ui.ledger||'codex'):k; ui.msg=null; }, bes:k=>{ ui.bes=ui.bes===k?null:k; },
  discard:k=>{ if(ui.confirm==='d'+k){ discard(+k); ui.confirm=null; } else ui.confirm='d'+k; },
  alloc:k=>alloc(k), learn:k=>learnSkill(k),
  ngppick:k=>{ ui.ngpPick=ui.ngpPick===k?null:k; },
  ngp:()=>{ if(ui.confirm!=='ngp'){ ui.confirm='ngp'; return; } ui.confirm=null; if(startNGP(ui.ngpPick)){ ui.ngpPick=null; ui.tab='gates'; ui.msg=null; ui.exp=''; } },
  tip:k=>dismissTip(k), tipsoff:()=>{ S.tips=S.tips||{}; S.tips.off=1; }, tipson:()=>{ S.tips=S.tips||{}; delete S.tips.off; }, tipsreset:()=>{ S.tips={}; },
  sound:()=>{ SFX.on=!SFX.on; try{ localStorage.setItem('lotd-sound',SFX.on?'on':'off'); }catch(e){} if(SFX.on) sfx('coin'); },
  buypot:k=>{ const c=POTIONS[k].price(); ui.msg=buyPotion(k)?{mk:1,m:'Bought a '+POTIONS[k].name+' for '+c+' gold.',c:'ok'}:null; },
  buyitem:k=>{ const s=shopStock()[+k], c=s&&buyPrice(ITEM[s.id]); ui.msg=buyStock(+k)?{mk:1,m:'Bought '+ITEM[s.id].name+' for '+c+' gold. It is in your bag.',c:'ok'}:null; },
  selltro:k=>{ const g=sellTrophy(k,false); ui.msg=g?{mk:1,m:'Sold '+TROPHY[k].name+' for '+g+' gold.',c:'ok'}:null; },
  selltroall:k=>{ const n=S.trophies[k], g=sellTrophy(k,true); ui.msg=g?{mk:1,m:'Sold '+n+' '+TROPHY[k].name+' for '+g+' gold.',c:'ok'}:null; },
  sellalltro:()=>{ const g=sellAllTrophies(); ui.msg=g?{mk:1,m:'Sold every trophy for '+g+' gold.',c:'ok'}:null; },
  buysalt:()=>{ const c=saltPrice(); ui.msg=buySalt()?{mk:1,m:'Bought Grave Salts for '+c+' gold.',c:'ok'}:null; },
  buybag:()=>{ const c=BAG_COST[S.bagLv||0]; ui.msg=buyBag()?{mk:1,m:'Your bag now holds '+bagMax()+' items. Paid '+c+' gold.',c:'ok'}:null; },
  empower:k=>{ const m=S.army.find(x=>x.uid===+k), c=m&&empowerCost(m); ui.msg=empower(+k)?{mk:1,m:m.nick+' rises to level '+m.lvl+'. Paid '+c+' gold.',c:'ok'}:null; },
  forge:k=>{ const a=k.split('|'), res=forgeGear(+a[0],a[1]); ui.msg=res?{mk:1,m:(res.master?'Masterwork! ':'')+'The forge gives you '+ITEM[res.it.id].name+'. It is in your bag.',c:'ok'}:null; },
  brew:k=>{ ui.msg=brew(k)?{mk:1,m:'You brew a '+POTIONS[k].name+' from four trophies.',c:'ok'}:null; },
  raisesalt:k=>tryRaise(k,true), raisebest:()=>{ raiseBest(); },
  event:k=>{ resolveEvent(k); }, door:k=>{ descend(k); }, cmd:k=>{ command(k); },
  skmod:k=>{ const a=k.split('|'); chooseMod(a[0],a[1]); },
  build:k=>{ const c=buildCost(k); ui.msg=build(k)?{mk:1,m:BUILD[k].name+' raised to level '+bl(k)+' for '+c[0]+' gold'+(c[1]?' and '+c[1]+' bone dust':'')+'.',c:'ok'}:null; },
  claimb:k=>{ const r=claimBounty(+k); if(r) notify('Bounty claimed: '+r+'.','ok'); },
  fusepick:k=>{ ui.fuse=ui.fuse===+k?null:+k; },
  fuse:k=>{ if(ui.confirm!=='fu'+k){ ui.confirm='fu'+k; return; } ui.confirm=null; const m=fuse(ui.fuse,+k); ui.fuse=null; ui.msg=m?{mk:1,m:'The pit closes over them. '+m.nick+' climbs out at level '+m.lvl+' with '+m.traits.map(t=>TRAITS[t].name).join(', ')+'.',c:'ok'}:null; },
  salvage:k=>{ const it=S.inv.find(x=>x.u===+k), nm=it&&ITEM[it.id].name, n=salvage(+k); if(n) sfx('fail'); ui.msg=n?{mk:1,m:'Salvaged '+nm+' into '+n+' bone dust.',c:'ok'}:null; },
  sjunk:()=>{ if(ui.confirm!=='sjunk'){ ui.confirm='sjunk'; return; } ui.confirm=null; const r=salvageJunk(); ui.msg=r&&r.n?{mk:1,m:'Salvaged '+r.n+' piece'+(r.n>1?'s':'')+' of junk into '+r.d+' bone dust.',c:'ok'}:null; },
  ench:k=>{ ui.ench=ui.ench===+k?null:+k; }, cx:k=>{ ui.cx=k; },
  enchadd:k=>{ const it=findItem(+k); ui.msg=enchant(+k,-1)?{mk:1,m:ITEM[it.id].name+' gains a bonus line.',c:'ok'}:null; },
  enchline:k=>{ const a=k.split('|'), it=findItem(+a[0]); ui.msg=enchant(+a[0],+a[1])?{mk:1,m:'Re-rolled a line on '+ITEM[it.id].name+'.',c:'ok'}:null; },
  music:()=>{ MUSIC.on=!MUSIC.on; MUSIC.armed=true; try{ localStorage.setItem('lotd-music',MUSIC.on?'on':'off'); }catch(e){} },
  view:k=>{ const a=k.split('|'); if(a[0]==='size') VIEW.size=clamp(+a[1]||0,-1,2); else if(a[0]==='calm'||a[0]==='hc'||a[0]==='nobg') VIEW[a[0]]=!VIEW[a[0]]; else if(a[0]==='lang'&&LANGS[a[1]]) VIEW.lang=a[1]; else if(a[0]==='fx'&&FX_MODES[a[1]]) VIEW.fx=a[1]; else if(a[0]==='army'&&(a[1]==='cards'||a[1]==='compact')) VIEW.army=a[1]; saveView(); applyView(); },
  dlsave:()=>{ ui.msg=downloadSave()?{m:'Save file downloaded.',c:'ok'}:{m:'This browser would not create the file. Use a save code instead.',c:'bad'}; },
  loadfile:()=>{ if(!ui.file) return; if(ui.confirm!=='lf'){ ui.confirm='lf'; return; } ui.confirm=null; const ok=importText(ui.file.text); ui.msg=ok?{m:'Loaded '+ui.file.name+'.',c:'ok'}:{m:ui.file.name+' is not a valid save.',c:'bad'}; ui.file=null; ui.exp=''; },
  dropfile:()=>{ ui.file=null; }, fold:k=>{ if(!['equip','quest','bounty'].includes(k)) return; if(VIEW.fold[k]) delete VIEW.fold[k]; else VIEW.fold[k]=true; saveView(); }, sort:k=>{ ui.sort=BAG_SORTS[k]?k:'tier'; }, mk:k=>{ ui.mk=k; ui.msg=null; },
  tabsync:()=>{ TAB.blocked=false; TAB.last=null; loadGame(); ui.tab='gates'; ui.msg=null; },
  lock:k=>{ lockItem(+k); }, asort:k=>{ sortArmy(k); }, mdet:k=>{ ui.mdet=ui.mdet===+k?null:+k; },
  keys:()=>{ ui.keys=!ui.keys; },
  renameo:k=>{ ui.rename=+k; const m=S.army.find(x=>x.uid===+k); ui.rn=m?m.nick:''; }, renamex:()=>{ ui.rename=null; },
  rename:k=>{ if(renameMinion(+k,ui.rn)) ui.rename=null; },
  reforge:k=>{ const it=findItem(+k), c=it&&reforgeCost(it); ui.msg=reforge(+k)?{mk:1,m:'Reforged '+ITEM[it.id].name+' for '+c+' gold.',c:'ok'}:null; },
  rift:k=>{ startRift(+k); }, gsub:k=>{ ui.gsub=['open','war','rift'].includes(k)?k:'open'; ui.msg=null; },
  rdep:k=>{ const b=riftBest(); ui.rd=clamp((ui.rd||b+1)+(+k||0),1,b+1); },
  rcmd:k=>{ ui.rc=+k; ui.rsq=[]; }, rgate:k=>{ ui.rg=+k; },
  rsq:k=>{ const u=+k; ui.rsq=(ui.rsq||[]).includes(u)?ui.rsq.filter(x=>x!==u):(ui.rsq||[]).concat([u]); },
  raid:()=>{ const cmds=S.army.filter(isCommander), gates=raidGates(); const c=cmds.find(m=>m.uid===ui.rc)||cmds[0]; if(!c||!gates.length) return;
    const di=gates.includes(ui.rg)?ui.rg:gates[gates.length-1], sel=(ui.rsq||[]).filter(u=>S.army.some(m=>m.uid===u&&m!==c)).slice(0,squadMax(c)-1);
    if(sendRaid(c.uid,di,sel)){ ui.msg={mk:1,m:c.nick+' marches on the '+DUNGEONS[di].name+' with '+sel.length+' at its back. They return at dawn.',c:'ok'}; ui.rsq=[]; ui.rc=null; } },
  recall:k=>{ recallRaid(+k); },
  selltier:k=>{ const t=+k; if(ui.confirm!=='st'+t){ ui.confirm='st'+t; return; } ui.confirm=null; const r=sellTier(t); ui.msg=r&&r.n?{mk:1,m:'Sold '+r.n+' '+TIERS[t]+' piece'+(r.n>1?'s':'')+' for '+r.g+' gold.',c:'ok'}:null; },
  salvtier:k=>{ const t=+k; if(ui.confirm!=='sv'+t){ ui.confirm='sv'+t; return; } ui.confirm=null; const r=salvageTier(t); ui.msg=r&&r.n?{mk:1,m:'Salvaged '+r.n+' '+TIERS[t]+' piece'+(r.n>1?'s':'')+' into '+r.d+' bone dust.',c:'ok'}:null; },
  junk:()=>{ if(ui.confirm!=='junk'){ ui.confirm='junk'; return; } ui.confirm=null; const r=sellJunk(); ui.msg=r&&r.n?{mk:1,m:'Sold '+r.n+' piece'+(r.n>1?'s':'')+' of junk for '+r.g+' gold.',c:'ok'}:null; },
  sellitem:k=>{ if(ui.confirm!=='si'+k){ ui.confirm='si'+k; return; } ui.confirm=null; const it=S.inv.find(x=>x.u===+k), nm=it&&ITEM[it.id].name, g=sellItem(+k); ui.msg=g?{mk:1,m:'Sold '+nm+' for '+g+' gold.',c:'ok'}:null; }, skreset:()=>{ if(ui.confirm==='skreset'){ ui.confirm=null; resetSkills(); } else ui.confirm='skreset'; }, claim:()=>claimQuest(), dismiss:()=>{S.notices=[]},
  enter:k=>startRun(+k),
  pick:k=>{ const a=k.split('|'); ui.pick=(ui.pick&&ui.pick.uid===+a[0]&&ui.pick.slot===a[1])?null:{uid:+a[0],slot:a[1]}; },
  give:k=>{ const a=k.split('|'); giveGear(+a[0],+a[1]); ui.pick=null; },
  take:k=>{ const a=k.split('|'); takeGear(+a[0],a[1]); }, settings:()=>{ if(S.mode!=='town') return; ui.tab=ui.tab==='settings'?'gates':'settings'; ui.msg=null; ui.exp=''; },
  slotsave:k=>{ if(slotRead(+k)&&ui.confirm!=='ss'+k){ ui.confirm='ss'+k; return; } ui.confirm=null; ui.msg=slotWrite(+k)?{m:'Saved to slot '+k+'.',c:'ok'}:{m:'Could not write to slot '+k+'. Use a save code instead.',c:'bad'}; },
  slotload:k=>{ if(ui.confirm!=='sl'+k){ ui.confirm='sl'+k; return; } ui.confirm=null; ui.msg=slotLoad(+k)?{m:'Loaded slot '+k+'.',c:'ok'}:{m:'That slot could not be read.',c:'bad'}; ui.exp=''; },
  ult:k=>{ chooseUlt(k); },
  swear:k=>{ if(ui.confirm!=='swear'+k){ ui.confirm='swear'+k; return; } ui.confirm=null; if(swear(k)) notify('You are now the '+FAITH[k].name+'.','ok'); },
  renounce:()=>{ if(ui.confirm!=='renounce'){ ui.confirm='renounce'; return; } ui.confirm=null; if(renounce()) notify('You renounce your oath. The shrine is silent.',''); },
  heat:k=>{ const a=k.split('|'); setHeat(+a[0],+a[1]); },
  bakload:k=>{ if(ui.confirm!=='bl'+k){ ui.confirm='bl'+k; return; } ui.confirm=null; ui.msg=bakLoad(+k)?{m:'Restored the earlier autosave.',c:'ok'}:{m:'That autosave could not be read.',c:'bad'}; ui.exp=''; },
  slotdel:k=>{ if(ui.confirm!=='sd'+k){ ui.confirm='sd'+k; return; } ui.confirm=null; slotDelete(+k); ui.msg={m:'Slot '+k+' deleted.',c:''}; },
  mkcode:()=>{ ui.exp=exportCode(); ui.msg=ui.exp?null:{m:'Could not create a code.',c:'bad'}; },
  copycode:()=>{ const t=document.getElementById('exp'); if(!t) return; const v=t.value;
    const fallback=()=>{ const x=document.getElementById('exp'); let ok=false; if(x){ x.focus(); x.select(); try{ ok=document.execCommand('copy'); }catch(e){} }
      ui.msg=ok?{m:'Code copied.',c:'ok'}:{m:'Copying is blocked here. The code is selected: press Ctrl+C (Cmd+C on a Mac) to copy it.',c:'bad'}; render(); const y=document.getElementById('exp'); if(y&&!ok){ y.focus(); y.select(); } };
    try{ navigator.clipboard.writeText(v).then(()=>{ ui.msg={m:'Code copied.',c:'ok'}; render(); },fallback); }catch(e){ setTimeout(fallback,0); } },
  loadcode:()=>{ if(ui.confirm!=='lc'){ ui.confirm='lc'; return; } ui.confirm=null; if(importCode(ui.imp)){ ui.imp=''; ui.exp=''; ui.msg={m:'Save code loaded.',c:'ok'}; } else ui.msg={m:'That code is not a valid save.',c:'bad'}; }, wear:k=>{ wearTitle(k); }, cxclear:()=>{ ui.cxq=''; }, cxq:()=>{},   /* the search box: typing is handled by the input listener; data-a only lets focus come back after a render */ ttf:k=>{ ui.ttf=(k in {all:1,got:1,locked:1,close:1}||/^r[0-5]$/.test(k))?k:'all'; }, tower:k=>startTower(+k), act:k=>act(k), target:k=>setTarget(k), flee:()=>flee(),
  raise:k=>tryRaise(k), descend:()=>descend(), town:()=>returnTown(), rest:()=>restDay(),
  release:k=>{ if(ui.confirm===+k){ release(+k); ui.confirm=null; } else ui.confirm=+k; },
  newgame:()=>{ if(ui.confirm==='new'){ ui.confirm=null; newGame(); OPEN_HELP.on=false; ui.tab='gates'; ui.gsub='open'; ui.exp=''; ui.msg=null; } else ui.confirm='new'; }
};
const CONFIRM_ACTS=['release','newgame','ngp','ngppick','skreset','sellitem','discard','slotsave','slotload','slotdel','loadcode','junk','loadfile','fuse','sjunk','bakload','swear','renounce','selltier','salvtier'];   // two-press actions: a click on these keeps the pending confirm
document.addEventListener('click',e=>{
  MUSIC.armed=true;
  const b=e.target.closest('[data-a]'); if(!b||b.disabled) return;
  const a=b.dataset.a;
  if(ui.confirm!==null && !CONFIRM_ACTS.includes(a)) ui.confirm=null;
  ACTIONS[a]&&ACTIONS[a](b.dataset.k); render();
});
document.addEventListener('input',e=>{ if(e.target&&e.target.id==='cxq'){ ui.cxq=e.target.value.slice(0,40); render(); return; } if(e.target&&e.target.id==='imp') ui.imp=e.target.value; if(e.target&&e.target.id==='rn') ui.rn=e.target.value; });
document.addEventListener('change',e=>{   // a dropdown with data-a works like a button whose data-k is the chosen value
  const sl=e.target&&e.target.tagName==='SELECT'&&e.target.dataset&&e.target.dataset.a; if(sl&&ACTIONS[sl]){ ACTIONS[sl](e.target.value); render(); return; }
  // a save file was picked: read it, then ask before loading
  const f=e.target&&e.target.id==='loadfile'&&e.target.files&&e.target.files[0]; if(!f) return;
  if(f.size>2e6){ ui.msg={m:'That file is too large to be a save.',c:'bad'}; render(); return; }
  const rd=new FileReader(); rd.onload=()=>{ ui.file={name:f.name,text:String(rd.result||'')}; ui.confirm=null; render(); }; rd.readAsText(f);
});
window.addEventListener('storage',e=>{   // another tab of this game saved: stop saving here so neither overwrites the other
  if(e.key===SAVE_KEY&&e.newValue!=null&&!TAB.blocked){ TAB.blocked=true; try{ render(); }catch(x){} } });
window.addEventListener('resize',()=>{ if(VIEW.fx==='auto') try{ applyView(); }catch(e){} });   // Auto effects follow the window size
document.addEventListener('pointerdown',()=>{ if(!MUSIC.armed){ MUSIC.armed=true; music(); } },{once:true});
document.addEventListener('keydown',e=>{
  if(e.target&&e.target.id==='rn'){ if(e.key==='Escape'){ e.preventDefault(); ui.rename=null; render(); return; } if(e.key==='Enter'&&ui.rename!=null){ e.preventDefault(); ACTIONS.rename(String(ui.rename)); render(); } return; }   // typing a minion's new name
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  const typing=e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  if(e.key==='?'&&!typing){ e.preventDefault(); ui.keys=!ui.keys; render(); return; }   // the shortcut sheet
  if(e.key==='Escape'){ let ch=true;   // closes the sheet, then a pending confirm, a rename, a Gates sub-tab, then any other town tab
    if(ui.keys) ui.keys=false; else if(ui.confirm) ui.confirm=null; else if(ui.rename!=null) ui.rename=null;
    else if(S.mode==='town'&&ui.tab==='gates'&&ui.gsub&&ui.gsub!=='open') ui.gsub='open';
    else if(S.mode==='town'&&ui.tab&&ui.tab!=='gates'){ ui.tab='gates'; ui.gsub='open'; } else ch=false;
    if(ch){ e.preventDefault(); ui.msg=null; render(); } return; }
  if(ui.keys) return;
  if(S.mode==='town'&&!typing&&/^[1-9]$/.test(e.key)){ const b=app.querySelectorAll('.tabs>.tab:not(.keyhint)')[+e.key-1];   // town: 1-9 switch tabs
    if(b&&!b.disabled&&b.dataset.k){ e.preventDefault(); ACTIONS.tab(b.dataset.k); render(); } return; }
  if(S.mode==='raise'&&e.target&&!/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)){   // between rooms: 1-4 pick a door
    const r=S.run, ds=r&&!r.cleared&&r.doors; const i=/^[1-9]$/.test(e.key)?+e.key-1:-1;
    if(ds&&i>=0&&i<ds.length){ e.preventDefault(); ACTIONS.door(ds[i]); render(); }
    else if(e.key===' '&&r&&r.corpses.some(c=>!c.tried)&&!(e.target&&e.target.tagName==='BUTTON')){ e.preventDefault(); ACTIONS.raisebest(); render(); }   // Space: raise the best
    return; }
  if(S.mode!=='battle') return;
  if(e.key===']'||e.key==='['){ const f=liveFoes(); if(f.length>1){ e.preventDefault(); const i=f.findIndex(x=>x.id===S.run.target); setTarget(f[(i+(e.key==='['?f.length-1:1))%f.length].id); render(); } return; }   // Tab stays with the browser, so keyboard players can still move between buttons
  const ord=ORDER_KEYS[e.key.toLowerCase()]; if(ord){ e.preventDefault(); if(command(ord)) render(); return; }
  let k={'1':'strike','2':'siphon','3':'ward'}[e.key]; if(!k&&e.key.toLowerCase()==='r'&&canUlt()) k='ult';
  if(!k&&/^[4-9]$/.test(e.key)){ const s=activeSkills()[+e.key-4]; if(s) k='sk:'+s.id; }
  if(!k){ const pk=Object.keys(POTIONS).find(x=>POTIONS[x].key.toLowerCase()===e.key.toLowerCase()); if(pk) k='pot:'+pk; }
  if(k){ e.preventDefault(); act(k); render(); }
});

// drifting souls and embers
(function(){
  const cv=document.getElementById('embers'); if(!cv||!cv.getContext) return;
  const cx=cv.getContext('2d'); let W=0,H=0,P=[];
  const still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){ const d=Math.min(2,window.devicePixelRatio||1); W=window.innerWidth; H=window.innerHeight; cv.width=W*d; cv.height=H*d; cx.setTransform(d,0,0,d,0,0); }
  function mk(init){ return {x:Math.random()*W,y:init?Math.random()*H:H+12,r:rnd(.7,2.2),vy:rnd(.12,.5),dx:rnd(-.12,.12),ph:Math.random()*6.28,soul:Math.random()<.65}; }
  function draw(t){
    cx.clearRect(0,0,W,H); const hell=document.body.classList.contains('hell');
    for(const p of P){
      const a=.25+.35*Math.sin(t/900+p.ph), c=hell?(p.soul?'255,122,60':'255,190,90'):p.soul?'143,212,106':'224,138,60';   // in the Tower every soul burns
      cx.fillStyle='rgba('+c+','+(a*.18)+')'; cx.beginPath(); cx.arc(p.x,p.y,p.r*4,0,6.283); cx.fill();
      cx.fillStyle='rgba('+c+','+a+')'; cx.beginPath(); cx.arc(p.x,p.y,p.r,0,6.283); cx.fill();
    }
  }
  function step(t){
    if(document.body.classList.contains('calm')){ draw(0); requestAnimationFrame(step); return; }
    const hot=document.body.classList.contains('hell')?2.2:1;
    for(let i=0;i<P.length;i++){ const p=P[i]; p.y-=p.vy*hot; p.x+=p.dx+Math.sin(t/2000+p.ph)*.15; if(p.y<-12) P[i]=mk(false); }
    draw(t); requestAnimationFrame(step);
  }
  size(); const n=W<600?22:44; for(let i=0;i<n;i++) P.push(mk(true));
  window.addEventListener('resize',()=>{ size(); });
  if(still) draw(0); else requestAnimationFrame(step);
})();

applyView(); loadGame(); if(OPEN_HELP.on){ ui.tab='gates'; OPEN_HELP.on=false; } render();
