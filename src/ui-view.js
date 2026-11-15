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

