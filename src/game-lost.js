// ===== R18 PR A: WHY DID I LOSE =====
// Every fight room keeps a turn journal (S.run.tj: [turn, log line, class], oldest first, at most TJ_MAX lines) and, at the end of
// each turn, where you and your army stood (S.run.tjh[turn]=[your HP, your max HP, minions standing, minions]). When you fall, the
// room goes into S.lost (the last LOST_N falls, newest first) with the blow, the foes still standing and what the bestiary knew of
// them then. The History tab and the defeat screen read it back turn by turn (ui-panels.js lostHTML). Reads the run, changes no rule.
const TJ_MAX=120, TJ_LINE=200, LOST_N=3;
function tjLog(r,m,c){ if(!r||!Array.isArray(r.tj)) return; r.tj.push([r.turn|0,String(m).slice(0,TJ_LINE),c||'']); if(r.tj.length>TJ_MAX) r.tj.splice(0,r.tj.length-TJ_MAX); }
function tjTurn(r){   // the end of a turn: where your side stands
  if(!r||!r.tjh||!S.player) return; const a=(S.army||[]).filter(m=>!m.thrall);
  r.tjh[r.turn|0]=[Math.max(0,Math.round(S.player.hp)),pMax(),a.filter(m=>m.hp>0).length,a.length];
  const ks=Object.keys(r.tjh); if(ks.length>TJ_MAX) delete r.tjh[ks[0]];
}
function lostRecord(r){   // the fall: keep the room for the History
  if(!r||r.siege||!Array.isArray(r.tj)) return null; tjTurn(r);
  const foes=(r.enemies||[]).filter(e=>e.hp>0&&!e.dead).slice(0,8).map(e=>{ const o={n:e.name,hp:Math.round(e.hp),mx:Math.round(e.maxHp)}; if(e.boss) o.b=1; const k=kitOf(e); if(k) o.k=k; o.kn=knowLv(e); return o; });
  const fb=r.felled||null, by=fb&&fb.n?(r.enemies||[]).find(e=>e.name===fb.n):null;
  const rec={d:S.day,g:r.tw?-1:r.di|0,room:r.room|0,lv:S.player.lvl,turns:r.tj.slice(),hp:Object.assign({},r.tjh||{}),foes};
  if(r.tw) rec.tw=r.tw; if(r.rift) rec.rift=r.rift; if(r.sv) rec.sv=r.sv; if(r.heat) rec.heat=r.heat; if(fb) rec.fb=fb;
  if(by){ rec.kn=knowLv(by); const k=kitOf(by); if(k) rec.kit=k; rec.kills=(S.kills&&S.kills[by.base||by.name])|0; }
  S.lost=[rec].concat(Array.isArray(S.lost)?S.lost:[]).slice(0,LOST_N);
  return rec;
}
function lostFix(g){   // normalizeSave: only well-formed records, at most LOST_N, each with bounded lines
  if(!('lost' in g)) return; const ok=x=>x&&typeof x==='object'&&isFinite(x.d)&&isFinite(x.g)&&Array.isArray(x.turns);
  const L=(Array.isArray(g.lost)?g.lost:[]).filter(ok).slice(0,LOST_N).map(x=>Object.assign({},x,{
    room:Math.max(0,x.room|0),lv:Math.max(1,x.lv|0),g:x.g|0,d:x.d|0,
    turns:x.turns.filter(t=>Array.isArray(t)&&isFinite(t[0])&&typeof t[1]==='string').slice(-TJ_MAX).map(t=>[t[0]|0,t[1],typeof t[2]==='string'?t[2]:'']),
    hp:x.hp&&typeof x.hp==='object'?x.hp:{},foes:Array.isArray(x.foes)?x.foes.filter(f=>f&&typeof f.n==='string').slice(0,8):[]}));
  if(L.length) g.lost=L; else delete g.lost;
}
const lostWhere=x=>x.g<0?'Hell Tower, floor '+(x.tw||1):x.sv?(x.sv==='mine'?'The Old Iron Mine':x.sv==='den'?'The Wolf Den':'On the road'):x.rift?'The Rift, depth '+x.rift:(DUNGEONS[x.g]?DUNGEONS[x.g].name:'A gate')+', room '+(x.room+1);
function lostShown(x){   // was the blow shown before it landed?
  const b=x.fb; if(!b||!b.k) return null;
  if(b.k==='dot') return 'Wounds tick at the end of each turn and go past your ward; your card showed the wound and its turns left.';
  if(b.mv&&BOSS_ABIL[b.mv]) return BOSS_ABIL[b.mv].warn===false&&!b.w?BOSS_ABIL[b.mv].name+' lands without a warning.':BOSS_ABIL[b.mv].name+' was announced'+(b.w?' '+b.w+' turn'+(b.w>1?'s':'')+' ahead':' a turn ahead')+' (Charging on its card).';
  return 'Its card showed whom it would strike this turn.';
}
function lostAnswers(x){   // the answers the rules give for that blow: its move's counters, or its kit's answer
  const out=[], b=x.fb||{};
  if(b.mv){ try{ const c=chargeInfo({charging:true,hp:1,move:b.mv,abil:b.mv}); if(c&&c.hint) out.push(c.hint+'.'); }catch(e){} }
  if(x.kit&&KITS[x.kit]) out.push(KITS[x.kit].name+': '+KITS[x.kit].ans);
  if(b.k==='dot') out.push('A Healing Draught cures you; Dark Mending cures your whole side.');
  return out;
}
function lostKnew(x){   // what the bestiary knew of the foe that dealt the blow, then
  const b=x.fb; if(!b||!b.n||b.k==='dot') return null;
  if(x.kn>0) return 'The bestiary had its kind at '+MASTERY[x.kn-1].name+' ('+x.kills+' kills)'+(x.kit?', so its kit was on its card.':'.');
  return 'You had not studied its kind ('+(x.kills|0)+' of '+KNOW_AT+' kills)'+(x.kit?': its card showed "Kit ?".':'.');
}
