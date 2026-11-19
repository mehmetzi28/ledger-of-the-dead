// The Memorial (src/game-phases-town.js): minions lost for good are written down; honouring one gives the army a day's +5% max HP.
(function(){
const {test,ok,eq,fix,setLvl,foe,arena,mkMinion,renderAll,cdx,invariants}=window.LOTD_T;
const shatter=m=>{ arena([foe({hp:0,dead:true})],0); m.hp=0; fix(0); roomWon(); S.mode='town'; S.run=null; };

test('Memorial: a shattered minion is written down with its name, kind, rank, level, stage, traits, day and gate, and one notice',()=>{
  setLvl(8); S.day=12; const m=mkMinion({nick:'Brine',lvl:7,stage:1,traits:['thick','vicious'],rankI:0}); shatter(m);
  ok(!S.army.includes(m),'gone from the army'); eq(S.memorial.length,1); const e=S.memorial[0];
  eq([e.nick,e.kind,e.name,e.rk,e.lvl,e.st,e.tr.join(),e.day,e.g].join('|'),'Brine|Tunnel Rat|Tunnel Rat|0|7|1|thick,vicious|12|0');
  ok(S.notices.some(n=>n.m==='Brine the Greater Tunnel Rat is written into the Memorial.'),'the notice');
  eq(memWhere(e),'Shattered in the '+DUNGEONS[0].name); eq(memWhere({f:30}),'Shattered in the Hell Tower, floor 30'); eq(memWhere({rd:4}),'Shattered in the Rift, depth 4');
  const b=mkMinion({nick:'Bound',traits:['gravebound']}); shatter(b); ok(S.army.includes(b),'Grave-bound never shatters'); eq(S.memorial.length,1); invariants('after shatter');
});

test('Memorial: a minion fallen on a raid is written down; a released one is not',()=>{
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={2:1}; S.mode='town'; const c=mkMinion({elite:true,traits:['commander'],lvl:12,rankI:2}), f=mkMinion({nick:'Rook',lvl:12,rankI:2});
  S.army=S.army.filter(m=>m!==c&&m!==f); fix(0); const r=resolveRaid({di:2,day:S.day,units:[c,f],odds:0});
  eq(r.lost,1); eq(S.memorial.length,1); eq(S.memorial[0].nick,'Rook'); eq(S.memorial[0].raid,2); eq(memWhere(S.memorial[0]),'Fell on a raid to the '+DUNGEONS[2].name);
  const x=mkMinion({nick:'Freed',stage:2}); release(x.uid); eq(S.memorial.length,1,'release is a choice: not recorded');
});

test('Memorial: newest first, capped at 200, kept through New Game+, and old saves load with an empty one',()=>{
  setLvl(5); eq(MEM_MAX,200); S.memorial=Array.from({length:MEM_MAX},(x,i)=>({nick:'N'+i,kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:1,st:0,tr:[],role:'striker',day:1,g:0}));
  const m=mkMinion({nick:'Newest'}); shatter(m); eq(S.memorial.length,MEM_MAX); eq(S.memorial[0].nick,'Newest'); eq(S.memorial[MEM_MAX-1].nick,'N198','the oldest dropped');
  const old=JSON.parse(JSON.stringify(S)); delete old.memorial; delete old.honor; const g=normalizeSave(old); ok(Array.isArray(g.memorial)&&g.memorial.length===0); eq(g.honor,null);
  const bad=JSON.parse(JSON.stringify(S)); bad.memorial=[null,{nick:5},{nick:'Ok<b>',name:'Tunnel Rat',rk:99,lvl:-3,st:9,tr:['nope','thick'],day:'x',g:77}].concat(bad.memorial); const h=normalizeSave(bad);
  eq(h.memorial.length,MEM_MAX); eq(h.memorial[0].nick,'Okb'); eq(h.memorial[0].rk,RANKS.length-1); eq(h.memorial[0].lvl,1); eq(h.memorial[0].st,STAGE_MAX); eq(h.memorial[0].tr.join(),'thick'); ok(!('g' in h.memorial[0]));
  S.memorial=S.memorial.slice(0,3); S.ti={clr:{5:1}}; S.mode='town'; ok(startNGP()); eq(S.memorial.length,3,'kept through New Game+'); eq(S.memorial[0].nick,'Newest');
});

test('Memorial: the Ledger page lists the fallen newest first with icons, and an empty page says one line',()=>{
  ui.tab='mem'; let h=renderAll('empty memorial'); ok(/h-mem/.test(h)&&/No name has been lost yet\./.test(h)); ok(/data-k="mem"[^>]*>Memorial</.test(h),'a Ledger sub-tab');
  setLvl(8); S.mode='town'; const m=mkMinion({nick:'Brine',stage:1,traits:['thick']}); shatter(m); const n=mkMinion({nick:'Ash'}); shatter(n);
  ui.tab='mem'; h=renderAll('memorial'); ok(h.indexOf('<b>Ash</b>')<h.indexOf('<b>Brine</b>'),'newest first'); eq((h.match(/class="mem-row"/g)||[]).length,2);
  ok(/mem-row"><span class="ico r0/.test(h),'the army icon'); ok(/the Greater Tunnel Rat/.test(h)&&/Shattered in the /.test(h)&&/Day \d+/.test(h)&&/Thick/.test(h));
  ok(/Memorial is written|Shattered|Memorial/.test(cdx('raising'))&&/written into the Memorial on the Ledger tab/.test(cdx('raising')),'Codex');
});

test('Memorial: honour once a day in town for about a Bone Altar level; +5% max HP for the living army until dawn',()=>{
  setLvl(20); S.mode='town'; const d0=mkMinion({nick:'Low',lvl:10,stage:0}); shatter(d0); const d1=mkMinion({nick:'High',lvl:10,stage:1}); shatter(d1);
  const a=mkMinion({lvl:10}), r=mkMinion({lvl:10}); S.army=S.army.filter(x=>x!==r); S.reserve.push(r); const hp=a.maxHp, rhp=r.maxHp;
  eq(honourCost(S.memorial[0]),Math.round(mneed(10)*.6)); S.gold=0; ok(!honour(0),'no gold'); S.gold=1e5;
  ok(!honour(1),'stage 0 cannot be honoured'); ui.tab='mem'; let h=renderAll('honour'); ok(h.includes('data-a="honour" data-k="0"')&&!h.includes('data-a="honour" data-k="1"'));
  const g=S.gold; ACTIONS.honour('0'); eq(S.gold,g-honourCost(S.memorial[0])); ok(remembered()); eq(a.maxHp,Math.round(hp*1.05),'+5%'); near1(r.maxHp,rhp*1.05);
  ok(!honour(0),'once a day'); h=renderAll('honoured'); ok(/Honoured today: <b>High<\/b>/.test(h)&&!/data-a="honour"/.test(h)); ok(/Remembered: \+5% minion max HP until dawn/.test(h),'status chip');
  invariants('remembered'); S.watches=0; endDay(); ok(!remembered(),'gone at dawn'); eq(a.maxHp,hp); eq(a.hp,a.maxHp); invariants('after dawn'); ok(honour(0),'a new day');
  arena([foe()],0); S.honor=null; ok(!honour(0),'never in a run');
});
function near1(a,b){ ok(Math.abs(a-b)<=1,'expected about '+b+', got '+a); }

test('Memorial: Turkish',()=>{
  eq(trText('Memorial'),'Anıt'); eq(trText('Brine the Greater Tunnel Rat is written into the Memorial.'),'Brine the Greater Tunnel Rat Anıt\'a yazıldı.');
  eq(trText('Shattered in the Rat Warren'),'Rat Warren içinde parçalandı'); eq(trText('Shattered in the Hell Tower, floor 30'),'Cehennem Kulesi\'nin 30. katında parçalandı');
  eq(trText('Fell on a raid to the Sunken Crypt'),'Sunken Crypt akınında düştü'); eq(trText('Honour · 120 gold'),'Onurlandır · 120 altın');
  eq(trText('Remembered: +5% minion max HP until dawn'),'Anılmış: şafağa dek hizmetkârlara +%5 azami can'); eq(trText('No name has been lost yet.'),'Henüz hiçbir isim kaybolmadı.');
  ok(!/Every name|honour/.test(trText('Every name in this book answered to you'))); eq(trText('Brine is honoured. Your army is Remembered until dawn.'),'Brine onurlandırıldı. Ordun şafağa dek Anılmış.');
});
})();
