// Music themes, the title screen and the epilogues, R17 PR B (src/scenes.js, ui-screens.js titleHTML).
(function(){
const {test,ok,eq,near,fresh,setLvl,foe,arena,renderAll,bossFight}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
function mockCtx(){   // a stand-in AudioContext: counts the nodes a theme builds and the notes it schedules
  const n={osc:0,gain:0,filt:0,buf:0}, param=v=>({value:v||0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(x){ if(!(x>0)) throw new Error('exp ramp to '+x); },setTargetAtTime(){},cancelScheduledValues(){}});
  const node=o=>Object.assign({connect(x){ return x; },disconnect(){}},o);
  return {n,currentTime:0,sampleRate:8000,destination:node({}),
    createOscillator(){ n.osc++; return node({type:'sine',frequency:param(440),detune:param(0),start(){},stop(){}}); },
    createGain(){ n.gain++; return node({gain:param(1)}); }, createBiquadFilter(){ n.filt++; return node({type:'lowpass',frequency:param(350),Q:param(1)}); },
    createDelay(){ return node({delayTime:param(0)}); }, createBuffer(c,len){ n.buf++; const d=new Float32Array(len); return {getChannelData:()=>d}; }, createBufferSource(){ return node({buffer:null,loop:false,start(){},stop(){}}); }};
}
const KEYS=()=>Object.keys(THEMES).filter(k=>k!=='tower').concat(['tower:0','tower:5','tower:12'],Object.keys(BOSS_THEME).map(n=>'boss:'+n),Object.keys(BOSS_THEME).map(n=>'boss:'+n+'|2'));
test('Themes: every gate, the town by its dread, Tower bands, the Rift and every boss have a full theme',()=>{
  for(let g=0;g<=6;g++) ok(THEMES['g'+g],'gate '+g); for(const b of DREAD_BANDS) ok(THEMES['town:'+b.id],'town '+b.id);
  for(const k of KEYS()){ const P=themeOf(k); ok(MODES[P.mode]&&P.root>20&&P.bpm>=30&&P.vol>0&&P.cut>0&&Array.isArray(P.motif)&&P.motif.length>=2&&P.motif.every(Number.isInteger),'theme '+k);
    ok(P.lead==null||VOICES[P.lead],'voice '+k); ok(P.pad==null||PADS[P.pad],'pad '+k); }
  eq(new Set([0,1,2,3,4,5,6].map(g=>THEMES['g'+g].mode+THEMES['g'+g].lead)).size,7,'seven gates, seven sounds');
  const g2=themeOf('g2'), kb=themeOf('boss:The Ember Knight'); eq(kb.motif.join(),g2.motif.join(),'a gate boss plays its gate\'s motif'); eq(kb.mode,'hm','in its own mode');
  const p2=themeOf('boss:The Ember Knight|2'); ok(p2.bpm>kb.bpm&&p2.root>kb.root&&p2.drum>kb.drum,'the second phase is faster, higher, with more drums');
  ok(themeOf('tower:3').root>themeOf('tower:0').root,'the Tower climbs a semitone every 10 floors'); ok(themeOf('rift').atonal);
  ok(themeOf('boss:The Gate Hound').motif.length>=4,'a boss of no gate has its own motif'); eq(themeOf('nowhere').name,'Town, uneasy');
});
test('Scenes: the gate you stand in, the town by dread, the Tower band, a boss and its second phase',()=>{
  fresh(20); S.mode='town'; ui.tab='gates'; ok(/^town:/.test(musicScene()));
  S.dread=90; S.siege=S.siege||{}; const want=typeof dreadOn==='function'&&dreadOn()?'town:'+dreadBand().id:'town:uneasy'; eq(musicScene(),want);
  S.tower.best=34; ui.tab='tower'; eq(musicScene(),'tower:3'); ui.tab='gates';
  arena([foe()],3); eq(musicScene(),'g3'); S.run.di=6; eq(musicScene(),'g6'); S.run.di=3; S.run.tw=57; eq(musicScene(),'tower:5'); delete S.run.tw; S.run.rift=1; eq(musicScene(),'rift'); delete S.run.rift;
  S.mode='town'; S.run=null; const b=bossFight(1,30); eq(musicScene(),'boss:'+b.base); b.phase2=true; eq(musicScene(),'boss:'+b.base+'|2');
  S.mode='siege'; eq(musicScene(),'town:terror'); S.mode='town'; S.run=null;
});
test('The engine builds every theme and schedules its motif, the same way each time',()=>{
  for(const k of KEYS()){ const c=mockCtx(); MUSIC.scene=k; const P=themeOf(k), n=musicGraph(c,P); ok(n.g&&n.src.length>=2,'graph '+k); const o0=c.n.osc;
    for(let t=0;t<12;t+=.35){ c.currentTime=t; musicTick(c,n,t,.35); }
    ok(c.n.osc>o0||!P.lead,'notes for '+k);
    const c2=mockCtx(), n2=musicGraph(c2,themeOf(k)); for(let t=0;t<12;t+=.35){ c2.currentTime=t; musicTick(c2,n2,t,.35); } eq(c2.n.osc,c.n.osc,'deterministic '+k); }
  MUSIC.scene=null; const c=mockCtx(), n=musicGraph(c,themeOf('g1')); n.next=0; c.currentTime=10; musicTick(c,n,10,.35); ok(n.next>=10,'a late timer skips ahead');
  ok(!/Math\.random/.test(musicTick.toString()+musicGraph.toString()+musicNote.toString()),'the music never touches the game\'s dice');
});
test('Music volume: its own, kept per browser, and touching it turns the music on',()=>{
  const was=MUSIC.on, v0=MUSIC.vol; MUSIC.on=false; musicSetVol(.3); near(MUSIC.vol,.3,1e-9); eq(localStorage.getItem('lotd-music-vol'),'0.3'); ok(MUSIC.on,'on');
  musicSetVol(5); eq(MUSIC.vol,1); musicSetVol(-1); eq(MUSIC.vol,0); ACTIONS.mvol('1'); near(MUSIC.vol,.1,1e-9);
  ui.tab='settings'; const h=renderAll('settings'); ok(/data-a="mvol"/.test(h)&&/10%/.test(h)&&/data-k="notitle"/.test(h));
  MUSIC.on=was; MUSIC.vol=v0; music();
});
test('Title screen: the drowned chapel, go on, a slot as a page, a new book; Enter closes it; Settings turns it off',()=>{
  fresh(12); S.day=9; ui.title=true; let h=renderAll('title'); ok(/class="title-screen"/.test(h)&&/Go on/.test(h)&&/Day 9 &middot; Level 12/.test(h)&&/A new book/.test(h)); ok(!/class="top"/.test(h),'no header');
  ok(!/NaN|undefined/.test(scTitle()));
  ACTIONS.titlego(); ok(!ui.title); h=renderAll('after'); ok(!/title-screen/.test(h));
  slotWrite(2); const day=S.day; S.day=20; ui.title=true; h=renderAll('slot'); ok(/data-a="titleslot" data-k="2"/.test(h));
  ACTIONS.titleslot('2'); ok(ui.title&&ui.confirm==='sl2','two presses'); h=renderAll('confirm'); ok(/Press again to open slot 2/.test(h)); ACTIONS.titleslot('2'); ok(!ui.title); eq(S.day,day,'loaded');
  ui.title=true; ACTIONS.titlenew(); ok(!ui.title&&ui.tab==='settings'&&ui.confirm==='new'); ui.confirm=null;
  const nt=VIEW.notitle; ACTIONS.view('notitle'); eq(VIEW.notitle,!nt); ACTIONS.view('notitle'); try{ localStorage.removeItem(slotKey(2)); }catch(e){}
  fresh(1); ui.title=true; h=renderAll('new'); ok(/Open the Ledger/.test(h)&&!/A new book<\/b>/.test(h)); ui.title=false;
});
test('Epilogues: each ending painted on its last page; none without backgrounds',()=>{
  for(const k of Object.keys(ENDINGS)){ const a=scEpilogue(k); ok(a.length>2000&&!/NaN|undefined/.test(a),k); }
  ok(scEpilogue('closed')!==scEpilogue('kept'));
  fresh(60); S.lastPage=1; S.ending={k:'kept',day:60,cycle:0,v:'The pen is still warm.'}; ok(/class="epi-art"/.test(lastPageHTML()));
  VIEW.nobg=true; ok(!/epi-art/.test(lastPageHTML())); VIEW.nobg=false; S.ending=null; S.lastPage=0;
});
test('Turkish: the title screen, music settings and their notes',()=>{
  const lines=['Ledger of the Dead','The chapel drowned. The book did not','Go on','Open the Ledger','A new book, a first page','A new book','Begin again (Settings, New game)','Press Enter to go on',
    'Title screen','The drowned chapel when the page opens','A theme for each gate, the Tower, the Rift, the town as its fear changes, and every boss. Its own volume; sound effects keep theirs','Music quieter','Music louder','Music volume','Press again to open slot 2','Slot 2'];
  for(const s of lines) ok(tr(s)!==s||s==='Ledger of the Dead','Turkish: '+s);
  ok(tr('Day 9 · Level 12 · 3 gates cleared')!=='Day 9 · Level 12 · 3 gates cleared');
});
})();
