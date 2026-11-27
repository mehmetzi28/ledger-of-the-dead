// R15 PR B: the bot replay of a human play log (Records, Export play log). run-balance.js '{"log":"play-log.json"}' runs the
// bots as usual, then sets each logged gate run beside the bot's runs at the same gate, difficulty and hero level (within 2):
// the human's clear rate against the bot's, the deaths the bot would have avoided, actions a room, doors chosen and the
// systems the human never opened. A bot cannot stand in the human's exact army, so matching is by gate, difficulty and level;
// a challenge-code log also names its code, so the same valley can be played by hand again.
var LOTD_REPLAY=(function(){
  const NEAR=2, SAFE=75;
  function valid(log){ return !!log&&log.kind==='lotd-play-log'&&Array.isArray(log.runs); }
  function matchBot(bot,e){   // the bot's runs that stand where this human run stood
    let m=bot.filter(x=>x.g===e.g&&(x.h|0)===(e.h|0)&&Math.abs(x.l-e.lv)<=NEAR);
    if(!m.length) m=bot.filter(x=>x.g===e.g&&Math.abs(x.l-e.lv)<=NEAR);   // that difficulty never came up for the bot: any
    return m;
  }
  function compare(log,bot,botDoors,gateNames){
    if(!valid(log)) throw new Error('not a Ledger of the Dead play log (Records, Export play log)');
    const name=g=>(gateNames&&gateNames[g])||('gate '+g), gates=log.runs.filter(e=>typeof e.g==='number'), per={}, avoided=[], unmatched=[];
    let hc=0, bc=0, n=0, ha=0, hr=0, ba=0, br=0;
    for(const e of gates){
      const m=matchBot(bot,e); if(!m.length){ unmatched.push(e); continue; }
      const rate=m.filter(x=>x.c).length/m.length, won=e.out==='clear'; n++; hc+=won?1:0; bc+=rate;
      const p=per[e.g]=per[e.g]||{n:0,h:0,b:0}; p.n++; p.h+=won?1:0; p.b+=rate;
      if(e.death&&rate*100>=SAFE) avoided.push({g:e.g,lv:e.lv,rm:e.death.rm,blow:e.death.n+(e.death.mv?' ('+e.death.mv+')':''),bot:Math.round(rate*100)});
      for(const o of e.rooms||[]) if(o.acts){ ha+=o.acts; hr++; }
      for(const x of m) if(x.rm){ ba+=x.t/x.rm/m.length; br+=1/m.length; }
    }
    const hd={}; let hp=0; for(const e of log.runs) for(const o of e.rooms||[]) if(o.of){ hd[o.k]=(hd[o.k]|0)+1; hp++; }
    const bp=Object.values(botDoors||{}).reduce((a,b)=>a+b,0), kinds=[...new Set(Object.keys(hd).concat(Object.keys(botDoors||{})))].sort();
    const pc=(a,b)=>b?Math.round(a/b*100)+'%':'-';
    const out={runs:log.runs.length,gateRuns:gates.length,matched:n,human:pc(hc,n),bot:pc(bc,n),avoided,unmatched:unmatched.length,
      perGate:Object.keys(per).map(Number).sort((a,b)=>a-b).map(g=>({gate:name(g),runs:per[g].n,human:pc(per[g].h,per[g].n),bot:pc(per[g].b,per[g].n)})),
      actsHuman:hr?+(ha/hr).toFixed(1):null,actsBot:br?+(ba/br).toFixed(1):null,
      doors:kinds.map(k=>({door:k,human:pc(hd[k]|0,hp),bot:pc((botDoors||{})[k]|0,bp)})),never:log.never||{tabs:[],cx:[],bld:[]},code:log.game&&log.game.code||null};
    return out;
  }
  function lines(o){
    const L=['== play log replay: '+o.runs+' runs logged, '+o.gateRuns+' in the gates, '+o.matched+' matched to bot runs'+(o.unmatched?' ('+o.unmatched+' at levels the bots never stood)':'')+(o.code?'; challenge '+o.code:''),
      '  clear rate at matched gates and levels: human '+o.human+', bot '+o.bot];
    for(const p of o.perGate) L.push('    '+p.gate+': '+p.runs+' runs, human '+p.human+', bot '+p.bot);
    L.push('  actions a fight room: human '+(o.actsHuman==null?'-':o.actsHuman)+', bot '+(o.actsBot==null?'-':o.actsBot));
    const by={}; for(const a of o.avoided){ const k=a.blow||'a damage-over-time'; by[k]=(by[k]||0)+1; }
    const top=Object.entries(by).sort((a,b)=>b[1]-a[1]);
    L.push('  deaths the bot avoided (it clears '+SAFE+'%+ there): '+(o.avoided.length?o.avoided.length+' of the human\'s deaths; most from '+top.slice(0,6).map(([k,n])=>k+' x'+n).join(', '):'none'));
    if(o.doors.length) L.push('  doors chosen (human / bot): '+o.doors.map(d=>d.door+' '+d.human+' / '+d.bot).join(', '));
    L.push('  never opened by the human: tabs '+(o.never.tabs.join(', ')||'none')+'; Codex pages '+(o.never.cx||[]).length+'; buildings '+((o.never.bld||[]).join(', ')||'none'));
    return L;
  }
  return {compare,lines,valid,NEAR,SAFE};
})();
if(typeof module!=='undefined'&&module.exports) module.exports=LOTD_REPLAY;
