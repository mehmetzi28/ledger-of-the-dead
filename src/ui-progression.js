// ----- mastery paths and New Game+ pacts on screen (rules in src/game-progression.js)
CODEX.splice(CODEX.findIndex(c=>c[0]==='skills')+1,0,['capstones','Capstones']);
CODEX.splice(CODEX.findIndex(c=>c[0]==='titles'),0,['pacts','Pacts']);
const ptsTxt=n=>n+' point'+(n===1?'':'s');
function capRows(p){
  const on=capsOn();
  return [1,2].map(i=>{ const id=p+i, C=CAPS[id]; return '<div class="u-sub'+(on.includes(id)?' ok':'')+'"><b>'+C.name+'</b> <span class="u-tag'+(on.includes(id)?' ok':'')+'">'+(on.includes(id)?'Active':'Level '+(i===1?CAP_LV1:CAP_LV2))+'</span> '+C.desc()+'</div>'; }).join('');
}
function capHTML(){   // on the Skills tab
  const P=S.player, cur=capPath(), tied=capTied();
  let h='<p class="group-h">Mastery paths'+(P.lvl<CAP_LV1?' &middot; capstones open at level '+CAP_LV1:'')+'</p>'
   +'<p class="q-note" title="Every skill belongs to a path. At level '+CAP_LV1+' the path with the most skill points (at least '+CAP_MIN+') grants its first capstone, and at level '+CAP_LV2+' its second. Forgetting skills recounts them.">Most points (min '+CAP_MIN+') wins &middot; capstones at Lv '+CAP_LV1+' and '+CAP_LV2+'</p><div class="items">';
  for(const p in PATHS){
    const pick=tied.length>1&&tied.includes(p)?(P.capPath===p||(!tied.includes(P.capPath)&&tied[0]===p)?'<span class="u-tag ok">Followed</span>':'<button class="btn small primary" data-a="cappath" data-k="'+p+'">Follow</button>'):'';
    h+='<div class="tt-row'+(cur===p?' on':'')+'"><div><h4>'+PATHS[p].name+' path <span class="u-tag">'+ptsTxt(pathPts(p))+'</span></h4><div class="u-sub dim">'+PATHS[p].skills.map(id=>SKILL[id].name).join(', ')+'</div>'+capRows(p)+'</div>'+pick+'</div>';
  }
  return h+'</div>';
}
function togglePact(k){ if(!PACTS[k]) return; const a=cleanPacts(ui.ngpPacts), i=a.indexOf(k); if(i>=0) a.splice(i,1); else if(a.length<PACT_MAX) a.push(k); ui.ngpPacts=a; }
function pactPickHTML(){   // in the New Game+ box
  const sel=cleanPacts(ui.ngpPacts), rw=pactRw(sel);
  return '<p class="q-note">Swear up to '+PACT_MAX+' pacts for this cycle (optional). Each makes it harder and pays more; they last until the next New Game+.</p><div class="items">'
   +Object.keys(PACTS).map(k=>{ const A=PACTS[k], on=sel.includes(k);
     return '<div class="tt-row'+(on?' on':'')+'"><div><h4>'+A.name+' <span class="u-tag">+'+A.rw+'%</span></h4><div class="u-sub">'+A.desc()+'</div></div>'
      +'<button class="btn small'+(on?' primary':'')+'" data-a="ngppact" data-k="'+k+'" aria-pressed="'+on+'"'+(!on&&sel.length>=PACT_MAX?' disabled':'')+'>'+(on?'Sworn':'Swear')+'</button></div>'; }).join('')+'</div>'
   +'<p class="q-note">'+(sel.length?sel.length+' of '+PACT_MAX+' pacts: +'+rw+'% XP and gold, +'+rw/2+'% gear drops.':'No pacts.')+'</p>';
}
function pactChipsHTML(){   // on the Status panel
  const l=pactList(); if(!l.length) return '';
  return '<div class="chips">'+l.map(k=>'<span class="chip" title="'+PACTS[k].desc()+'">'+PACTS[k].name+'</span>').join('')+'<span class="chip" title="Pacts sworn for this New Game+ cycle">+'+pactRw()+'% XP and gold</span></div>';
}
function cxCapHTML(){
  const on=capsOn(), cur=capPath();
  let h=cxP('Every skill belongs to one of four paths: Bone, Blood, Frost and Rot. From level '+CAP_LV1+' the path with the most skill points spent (at least '+CAP_MIN+') grants its first capstone; from level '+CAP_LV2+' it grants its second as well. Only one path pays out at a time.')
   +cxP('Ties go to the path you follow on the Skills tab, or else the first in this list. Forgetting your skills in town recounts the paths at once.');
  for(const p in PATHS) h+=cxList([cxRow(PATHS[p].name+' path',PATHS[p].skills.map(id=>SKILL[id].name).join(', '),ptsTxt(pathPts(p)))]
    .concat([1,2].map(i=>{ const id=p+i, C=CAPS[id]; return cxRow(C.name,C.desc(),on.includes(id)?'Active':'Level '+(i===1?CAP_LV1:CAP_LV2)); })));
  return h+cxP(cur?'You follow the '+PATHS[cur].name+' path.':'No path grants a capstone yet.');
}
function cxPactHTML(){
  const l=pactList();
  return cxP('When you begin New Game+ you may swear up to '+PACT_MAX+' pacts. They last for that whole cycle, until the next New Game+, and cannot be broken. Each makes the gates harder and adds its share to the XP and gold you earn, and half of it to gear drop chances.')
   +cxP('Finish a cycle (clear the Throne of Ash) under at least one pact to earn '+TITLE.pk1.name+', and under three to earn '+TITLE.pk3.name+'.')
   +cxList(Object.keys(PACTS).map(k=>cxRow(PACTS[k].name,PACTS[k].desc(),'+'+PACTS[k].rw+'% XP and gold')))
   +(l.length?cxP('This cycle: '+l.map(k=>PACTS[k].name).join(', ')+'.'):cxP('You swore no pacts this cycle.'));
}
