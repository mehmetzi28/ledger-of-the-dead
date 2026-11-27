// ===== R15 PR A: MODES (IRONMAN AND CUSTOM DIFFICULTY) =====
// Ironman (S.iron, set at New game, never changed after): no Instant Retry, no saving to a slot; a lost room costs the whole
// run's spoils (the gold, trophies and gear banked from its earlier rooms) and one minion that fell in it shatters, with no
// roll. Nothing else changes. S.ironDeaths counts its falls. Custom difficulty (S.custom = {foeHp, foeAtk, raise, gold, siege},
// whole percentages): foe HP and attack (foeScale), raise chance, gold from kills (bankLoot) and siege frequency (0: no
// sieges). A save that eases any of them (foes or sieges below 100, raise or gold above) is Custom: no titles are earned.
// Presets: Story (foes 60%, raise 130%) and Hardened (foes 150%, gold 75%). Both fields are absent on a normal save.
const CUSTOM_KEYS={   // [min, max, step, name]
  foeHp:[50,200,10,'Foe HP'], foeAtk:[50,200,10,'Foe attack'], raise:[50,150,10,'Raise chance'], gold:[50,200,10,'Gold'], siege:[0,150,10,'Siege frequency']
};
const CUSTOM_IDS=Object.keys(CUSTOM_KEYS);
const CUSTOM_PRESETS={
  story:   {name:'Story',   desc:'Foes have 60% of their HP and attack; raising is 30% likelier. Custom: no titles.', c:{foeHp:60,foeAtk:60,raise:130,gold:100,siege:100}},
  hardened:{name:'Hardened',desc:'Foes have 150% HP and attack; gold is 75%. Titles are earned as usual.', c:{foeHp:150,foeAtk:150,raise:100,gold:75,siege:100}}
};
const NG_MODES={
  normal:{name:'Normal', desc:'The game as it is meant: every rule as written.'},
  iron:  {name:'Ironman',desc:'One life for the run: no Instant Retry and no save slots. A lost room costs the whole run\'s spoils and one minion that fell in it shatters. Cannot be turned off.'},
  story:CUSTOM_PRESETS.story, hardened:CUSTOM_PRESETS.hardened,
  custom:{name:'Custom', desc:'Set foe HP and attack, raise chance, gold and siege frequency yourself. Easing any of them marks the save Custom: no titles.'},
  code:  {name:'Challenge code', desc:'The same valley as everyone who plays this code: the same dawns, curses, market stock and rooms, day by day. The code carries its own rules.'}
};
const IRON_TITLES=['i_keeper','i_book','i_climb'];
const custOf=()=>S&&S.custom&&typeof S.custom==='object'?S.custom:null;
const custK=k=>{ const c=custOf(); return c&&isFinite(c[k])?c[k]/100:1; };   // a multiplier, 1 on a normal save
const custEasy=c=>{ c=c===undefined?custOf():c; return !!c&&(c.foeHp<100||c.foeAtk<100||c.raise>100||c.gold>100||c.siege<100); };   // no titles
const custClamp=c=>Object.fromEntries(CUSTOM_IDS.map(k=>{ const [lo,hi,st]=CUSTOM_KEYS[k]; let v=Math.round(num(c&&c[k],100)/st)*st; if(k==='siege'&&v>0&&v<50) v=50; return [k,clamp(v,lo,hi)]; }));
const custNorm=c=>CUSTOM_IDS.every(k=>c[k]===100);
const ironOn=()=>!!(S&&S.iron);
function newGameMode(mode,custom){   // New game with a mode: 'normal', 'iron', a preset, or 'custom' with its sliders
  newGame(); if(mode==='iron'){ S.iron=true; S.ironDeaths=0; }
  const c=mode==='custom'?custClamp(custom):CUSTOM_PRESETS[mode]?custClamp(CUSTOM_PRESETS[mode].c):null;
  if(c&&!custNorm(c)) S.custom=c;
  if(S.iron) notify('Ironman: one life for each run. There is no Retry, and a fall costs the run\'s spoils and one of the fallen.','bad');
  if(custEasy()) notify('Custom difficulty: titles are not earned in this game.','');
  return true;
}
function ironFall(r){   // defeat, before the downed get back up: the whole run's spoils, and one of the fallen
  if(!ironOn()||!r||r.wk||r.siege) return; S.ironDeaths=(S.ironDeaths|0)+1; const lost=[];
  const g=Math.min(S.gold,r.goldTot||0); if(g>0){ S.gold-=g; lost.push(g+' gold'); }
  let tn=0; for(const k in r.trTot||{}){ const n=Math.min(S.trophies[k]||0,r.trTot[k]); if(n>0){ S.trophies[k]-=n; tn+=n; if(!S.trophies[k]) delete S.trophies[k]; } } if(tn) lost.push(tn+' trophies');
  const items=(r.spoils||[]).map(u=>S.inv.find(it=>it.u===u)).filter(Boolean); if(items.length){ S.inv=S.inv.filter(it=>!items.includes(it)); lost.push(items.length+' piece'+(items.length>1?'s':'')+' of gear'); }
  const down=S.army.filter(m=>m.hp<=0&&!m.thrall&&!m.wall);
  if(down.length){ const m=down[Math.floor(Math.random()*down.length)]; if(consBreak(m,r)) lost.push(m.nick+', who broke'); else { returnGear(m); S.army=S.army.filter(x=>x!==m); memorialize(m,r.tw?{f:r.tw}:r.rift?{rd:r.rift}:{g:r.di}); lost.push(m.nick+', who shattered');
    log(m.nick+' shatters as you fall. Ironman takes one of the fallen.','bad'); } }
  r.ironLost=lost; if(lost.length) notify('Ironman: the fall costs '+lost.join(', ')+'.','bad');
}
function modesFix(g){   // normalizeSave: the fields only when the save has them
  if(g.iron){ g.iron=true; g.ironDeaths=Math.max(0,Math.floor(num(g.ironDeaths,0))); } else { delete g.iron; delete g.ironDeaths; }
  if('custom' in g){ const c=g.custom&&typeof g.custom==='object'?custClamp(g.custom):null; if(c&&!custNorm(c)) g.custom=keepOrder(g.custom,c); else delete g.custom; }
}
const modeLabel=d=>{ const t=[]; if(d&&d.iron) t.push('Ironman, '+(d.ironDeaths|0)+' fall'+((d.ironDeaths|0)===1?'':'s')); if(d&&d.custom) t.push(custEasy(d.custom)?'Custom':'Hardened'); return t.join(' &middot; '); };
