// ===== R17 PR A: WHAT THE FIGHT SHOWS =====
// Tables and readers that let the cards and the battle stage show what kind of thing happened, not only that something did:
// damage types (a colour, a glyph and a burst of their own on the stage), weak and resisted hits, each foe kit's glyph and its
// moment, every boss move's wind-up pose and who it threatens, and the evolution stages' looks. Everything here reads the
// state and never changes it; the log line and the number always come with the effect.

// ----- damage types: the colour of the number, a glyph beside it and the stage's burst (never blue or purple: the palette).
// R18: chosen to stay apart under protanopia, deuteranopia and tritanopia (a test simulates each), and always shown with the glyph.
const DT_FX={
  phys: {c:'#c9b28a',x:0xc9b28a,fx:'spark',g:[[5,0,7,7,5,10,3,7]]},
  frost:{c:'#eef6f4',x:0xeef6f4,fx:'shard',g:[[5,0,6,4,10,5,6,6,5,10,4,6,0,5,4,4]]},
  fire: {c:'#e25a24',x:0xe25a24,fx:'ember',g:[[5,0,8,5,7,9,3,9,2,5,4,4]]},
  rot:  {c:'#dde27a',x:0xdde27a,fx:'mist', g:[[3,1,7,1,9,4,8,8,2,8,1,4]]},
  shad: {c:'#8a7a76',x:0x8a7a76,fx:'ink',  g:[[6,0,3,2,2,5,3,8,6,10,4,7,4,3]]}
};
const glyphSVG=(g,c,cls)=>'<svg class="'+(cls||'dtg')+'" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">'+g.map(p=>'<polygon points="'+p.join(',')+'" fill="'+c+'"/>').join('')+'</svg>';
const dtGlyph=ty=>DT_FX[ty]?glyphSVG(DT_FX[ty].g,DT_FX[ty].c):'';

// ----- foe kits: a glyph over the foe (once you know its kit) and, for the kits that act, the moment the stage flashes
// m: ward (a shield raised), dust (a burrow), motes (a body called up), mark (a target marked), cleanse, step (a step back)
const KIT_FX={
  shield:{m:'ward',  g:[[2,1,8,1,8,5,5,9,2,5]]},
  ambush:{m:null,    g:[[5,0,6,6,5,7,4,6],[3,7,7,7,7,8,3,8]]},
  thief: {m:null,    g:[[5,1,8,6,5,9,2,6]]},
  call:  {m:'motes', g:[[5,1,8,5,6,5,6,9,4,9,4,5,2,5]]},
  pack:  {m:null,    g:[[1,2,3,8,5,3,7,8,9,2,9,1,1,1]]},
  bomb:  {m:null,    g:[[5,3,7,4,8,6,7,8,5,9,3,8,2,6,3,4],[5,3,6,0,7,0,6,3]]},
  sapper:{m:null,    g:[[1,2,9,2,9,3,6,3,6,9,4,9,4,3,1,3]]},
  skirm: {m:'step',  g:[[1,5,5,1,5,4,9,4,9,6,5,6,5,9]]},
  stance:{m:null,    g:[[1,2,3,2,3,1,7,1,7,2,9,2,9,8,1,8]]},
  hexer: {m:null,    g:[[1,5,5,2,9,5,5,8]]},
  marker:{m:'mark',  g:[[4,1,6,1,6,4,9,4,9,6,6,6,6,9,4,9,4,6,1,6,1,4,4,4]]},
  purify:{m:'cleanse',g:[[5,0,6,4,10,5,6,6,5,10,4,6,0,5,4,4]]},
  burrow:{m:'dust',  g:[[1,8,9,8,9,9,1,9],[4,1,6,1,6,4,8,4,5,7,2,4,4,4]]},
  thorns:{m:null,    g:[[0,9,2,3,4,9,5,2,6,9,8,3,10,9]]},
  frenzy:{m:null,    g:[[5,0,8,5,7,9,3,9,2,5,4,4]]},
  banner:{m:null,    g:[[2,1,3,1,3,10,2,10],[3,1,9,3,3,5]]}
};
const kitGlyph=k=>KIT_FX[k]?glyphSVG(KIT_FX[k].g,'currentColor','ktg'):'';

// ----- boss moves: the wind-up pose on the stage and who the move threatens, so a telegraph marks its targets
// pose: lunge (a blow), rear (a great blow drawn back), cast (a spell), call (a summons), guard (itself)
// at: p (you), all (your side), front / back (that row of yours), one (one minion it names), foes (its own side), self
const BOSS_CUE={
  swarm:{pose:'call',at:'foes'}, bonewall:{pose:'guard',at:'foes'}, cinder:{pose:'cast',at:'all'}, hymn:{pose:'cast',at:'p'}, seedfall:{pose:'call',at:'foes'},
  decree:{pose:'rear',at:'p'}, sunder:{pose:'rear',at:'p'}, gnaw:{pose:'lunge',at:'front'}, lock:{pose:'cast',at:'one'}, bash:{pose:'lunge',at:'front'},
  burnground:{pose:'cast',at:'front'}, lance:{pose:'rear',at:'back'}, tithe:{pose:'cast',at:'p'}, bite:{pose:'lunge',at:'one'}, ironthorns:{pose:'cast',at:'one'},
  graft:{pose:'guard',at:'self'}, summons:{pose:'call',at:'foes'}, edict:{pose:'cast',at:'one'}, mirror:{pose:'cast',at:'p'}, rampart:{pose:'guard',at:'foes'},
  called:{pose:'rear',at:'back'}, blackmass:{pose:'cast',at:'foes'}, harvest:{pose:'lunge',at:'one'}, purge:{pose:'cast',at:'one'}, rally:{pose:'call',at:'foes'},
  brood:{pose:'call',at:'foes'}, plague:{pose:'cast',at:'all'}, feed:{pose:'guard',at:'self'}, drown:{pose:'lunge',at:'one'}, litany:{pose:'cast',at:'self'},
  breath:{pose:'rear',at:'front'}, molten:{pose:'guard',at:'self'}, tail:{pose:'lunge',at:'back'}, verse:{pose:'cast',at:'p'}, crescendo:{pose:'cast',at:'p'},
  echoes:{pose:'call',at:'foes'}, spread:{pose:'cast',at:'one'}, heartwood:{pose:'guard',at:'self'}, unwrite:{pose:'cast',at:'one'}, nothing:{pose:'rear',at:'p'},
  heads:{pose:'lunge',at:'all'}, moth:{pose:'cast',at:'back'}, confess:{pose:'cast',at:'p'}, cloud:{pose:'cast',at:'all'}, dirge:{pose:'cast',at:'all'},
  chain:{pose:'cast',at:'one'}, block:{pose:'rear',at:'one'}, bargain:{pose:'guard',at:'self'}, halo:{pose:'guard',at:'p'}, otherhalf:{pose:'cast',at:'p'},
  erase:{pose:'cast',at:'p'}, hollow:{pose:'cast',at:'all'}, hunger:{pose:'lunge',at:'one'}, remember:{pose:'call',at:'foes'}, readaloud:{pose:'cast',at:'one'},
  writename:{pose:'rear',at:'p'}, devour:{pose:'lunge',at:'one'}, fold:{pose:'cast',at:'all'}, gateedge:{pose:'rear',at:'back'}, opendoor:{pose:'call',at:'foes'},
  closedoor:{pose:'cast',at:'one'}, repeat:{pose:'cast',at:'p'}, delay:{pose:'cast',at:'p'}, hymnbrass:{pose:'guard',at:'self'}, brassbell:{pose:'rear',at:'front'},
  widen:{pose:'cast',at:'all'}, swallow:{pose:'guard',at:'self'}, count:{pose:'cast',at:'one'}, tally:{pose:'guard',at:'self'}, witchmark:{pose:'cast',at:'one'},
  pyre:{pose:'rear',at:'one'}, pillar:{pose:'rear',at:'all'}, sermon:{pose:'call',at:'foes'}
};
const CUE_AT={p:'you',all:'your whole side',front:'your front row',back:'your back row',one:'one of your minions',foes:'its own side',self:'itself'};
const cueOf=mv=>BOSS_CUE[mv]||{pose:'cast',at:'p'};
function threatKeys(e){   // the units a gathering move will land on (empty when it lands on its own side, or nothing gathers)
  if(!e||!e.charging||!(e.hp>0)||!S.run) return [];
  const mv=e.move||e.abil, at=cueOf(mv).at, side=[S.player].concat(S.army||[]).filter(u=>u.hp>0&&!(u.lock>S.run.turn)), K=u=>String(fxKey(u));
  if(at==='p') return ['p'];
  if(at==='all') return side.map(K);
  if(at==='front'){ const f=side.filter(u=>u.id!=='p'&&rowOf(u)==='f'); return (f.length?f:[S.player]).map(K); }
  if(at==='back') return side.filter(u=>rowOf(u)==='b').map(K);
  if(at==='one'){ const k=mv==='edict'?e.edictT:mv==='block'?e.blockT:null; if(k!=null) return [String(k)]; const m=typeof strongestMinion==='function'?strongestMinion():null; return [m?K(m):'p']; }
  return [];
}
function threatMap(){   // unit key -> the moves gathering against it this turn
  const m=new Map(); if(!S.run||S.mode!=='battle') return m;
  for(const e of S.run.enemies||[]){ const ks=threatKeys(e); if(!ks.length) continue; const n=BOSS_ABIL[e.move||e.abil]?BOSS_ABIL[e.move||e.abil].name:e.name;
    for(const k of ks){ if(!m.has(k)) m.set(k,[]); m.get(k).push(n); } }
  return m;
}

// ----- evolution looks: Greater a darker outline, Elder a glow in the role's colour, Ancient a tenth larger with motes,
// Eternal a halo. Drawn into the icon's own markup, so the cards and the stage show the same.
const ROLE_GLOW={vanguard:'#c9b98f',striker:'#e5776a',mender:'#9fd47a',reaper:'#d3a64d',hexer:'#b8a48c'};
const STAGE_LOOK=[null,{ol:1},{ol:1,glow:1},{ol:1,glow:1,big:1.1,motes:1},{ol:1,glow:1,big:1.1,motes:1,halo:1}];
function evoLook(o){   // {cls, style, pre, post} for ico(): the svg's filter, a scaled group and the halo and motes
  const st=o&&o.stage|0, L=STAGE_LOOK[Math.min(st,STAGE_LOOK.length-1)]; if(!L) return null;
  const f=['drop-shadow(0 0 1px #0a0807)','drop-shadow(0 0 1px #0a0807)']; if(L.glow) f.push('drop-shadow(0 0 3px '+(ROLE_GLOW[o.role]||'#c9b98f')+')');
  return {cls:' st'+st, style:'filter:'+f.join(' '), pre:L.big?'<g transform="translate(32 36) scale('+L.big+') translate(-32 -36)">':'', post:(L.big?'</g>':'')
    +(L.motes?'<g class="motes" fill="'+(ROLE_GLOW[o.role]||'#c9b98f')+'"><circle cx="8" cy="40" r="1.4"/><circle cx="57" cy="30" r="1.2"/><circle cx="12" cy="18" r="1"/><circle cx="54" cy="52" r="1.3"/></g>':'')
    +(L.halo?'<ellipse class="halo" cx="32" cy="3" rx="13" ry="3.2" fill="none" stroke="#d3a64d" stroke-width="2.2"/>':'')};
}

// ----- the reduced view: Light effects or reduced motion turn off hit-stop, the stage's nudge and dense bursts
const fxQuiet=()=>{ try{ return !!VIEW.calm||fxReduced()||fxLight(); }catch(e){ return true; } };   // also the phone view (Auto on a small screen)
