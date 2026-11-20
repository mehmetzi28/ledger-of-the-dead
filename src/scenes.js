//==UI==

// ----- sound: tiny synthesized effects (Web Audio, no files). Off/on lives in Settings and is remembered per browser, not in the save.
const SFX={on:true,ctx:null,last:{}};
try{ SFX.on=localStorage.getItem('lotd-sound')!=='off'; }catch(e){}
function sfxCtx(){ if(!SFX.ctx){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; SFX.ctx=new C(); } if(SFX.ctx.state==='suspended') SFX.ctx.resume(); return SFX.ctx; }
function tone(c,f0,f1,dur,type,vol,delay){
  const t=c.currentTime+(delay||0), o=c.createOscillator(), g=c.createGain();
  o.type=type||'sine'; o.frequency.setValueAtTime(f0,t); if(f1) o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||.15,t+.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur+.02);
}
function noise(c,dur,vol,freq,delay){
  const t=c.currentTime+(delay||0), n=Math.floor(c.sampleRate*dur), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
  const s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); s.buffer=b; f.type='lowpass'; f.frequency.value=freq||1200; g.gain.value=vol||.2;
  s.connect(f).connect(g).connect(c.destination); s.start(t);
}
function sfx(kind){
  if(!SFX.on) return; const now=performance.now(); if(now-(SFX.last[kind]||0)<70) return; SFX.last[kind]=now;
  let c; try{ c=sfxCtx(); }catch(e){ return; } if(!c) return;
  try{ switch(kind){
    case 'strike': noise(c,.09,.25,1800); tone(c,140,70,.1,'triangle',.18); break;
    case 'skill':  noise(c,.25,.12,3000); tone(c,300,900,.22,'sine',.08); break;
    case 'hurt':   tone(c,130,55,.18,'square',.07); noise(c,.12,.15,600); break;
    case 'heal':   tone(c,440,0,.12,'sine',.1); tone(c,660,0,.16,'sine',.1,.08); break;
    case 'kill':   tone(c,330,110,.25,'sawtooth',.06); break;
    case 'raise':  tone(c,180,420,.5,'sine',.12); tone(c,183,425,.5,'sine',.06); break;
    case 'fail':   tone(c,220,90,.3,'triangle',.08); break;
    case 'coin':   tone(c,1250,0,.08,'triangle',.08); tone(c,1650,0,.12,'triangle',.08,.06); break;
    case 'level':  [523,659,784,1047].forEach((f,i)=>tone(c,f,0,.18,'triangle',.1,i*.09)); break;
    case 'warn':   tone(c,310,0,.12,'square',.06); tone(c,310,0,.12,'square',.06,.18); break;
    case 'boss':   tone(c,70,40,.5,'sawtooth',.12); noise(c,.45,.2,400); break;
    case 'death':  tone(c,200,40,.9,'sawtooth',.1); break;
  } }catch(e){}
}

// ----- music: synthesized themes (a pad, a slow melody in the place's mode, an echo and a pulse) for town, the gates, the
// Tower and every boss (BOSS_THEME). Off by default; remembered per browser. Starts after your first click.
const MUSIC={on:false,armed:false,scene:null,nodes:null};
try{ MUSIC.on=localStorage.getItem('lotd-music')==='on'; }catch(e){}
// Music: a soft pad (root, fifth and third of the scene's mode, under a slowly breathing filter), a sparse melody from the
// same mode played through an echo, and a low pulse. Every boss has its own theme, picked when its fight begins.
const MODES={aeo:[0,2,3,5,7,8,10],phr:[0,1,3,5,7,8,10],dor:[0,2,3,5,7,9,10],loc:[0,1,3,5,6,8,10],hm:[0,2,3,5,7,8,11]};
const SCENES={
  town: {root:55,  mode:'dor',bpm:50,tone:'triangle',drum:0,  noise:0,  dens:.3, vol:.05, cut:420},
  gate: {root:49,  mode:'aeo',bpm:58,tone:'triangle',drum:.12,noise:0,  dens:.3, vol:.055,cut:340},
  tower:{root:41.2,mode:'phr',bpm:64,tone:'sawtooth',drum:.25,noise:.03,dens:.32,vol:.058,cut:480},
  rift: {root:36.7,mode:'loc',bpm:70,tone:'sawtooth',drum:.38,noise:.06,dens:.36,vol:.058,cut:540}   // low, unstable and hissing: the torn sky
};
// [root Hz, mode, beats per minute, timbre, pulse 0-1, hiss 0-1]: one theme per boss
const BOSS_THEME={
  'The Rat King':[55,'phr',72,'square',.4,.02],'The Crypt Warden':[46.2,'aeo',56,'triangle',.3,0],'The Ember Knight':[49,'hm',80,'sawtooth',.55,.04],
  'The Bishop of Teeth':[41.2,'loc',60,'square',.35,0],'The Orchard Mother':[51.9,'dor',66,'triangle',.4,.02],'The Pale Sovereign':[43.7,'hm',62,'sawtooth',.5,.03],
  'The Gate Hound':[46.2,'phr',92,'sawtooth',.7,.05],'Cinder Matron':[49,'hm',76,'triangle',.5,.05],'The Iron Inquisitor':[41.2,'loc',70,'square',.6,.02],
  'Lord of Flies':[55,'phr',84,'square',.45,.08],'The Bone Cantor':[43.7,'dor',58,'triangle',.3,0],'Duke of Chains':[38.9,'aeo',74,'sawtooth',.65,.03],
  'The Pale Executioner':[41.2,'loc',68,'sawtooth',.7,.02],'Archdevil Vael':[46.2,'hm',96,'sawtooth',.75,.06],'The Hollow Seraph':[51.9,'dor',54,'triangle',.25,.02],
  'Abaddon, King of Hell':[36.7,'phr',100,'sawtooth',.85,.07],
  'The Plague Matriarch':[51.9,'loc',88,'square',.6,.08],'The Drowned Abbot':[41.2,'aeo',52,'triangle',.45,.05],'The Cinder Wyrm':[43.7,'hm',104,'sawtooth',.8,.06],
  'The Choir Eternal':[49,'dor',48,'triangle',.2,.01],'The Rootking':[38.9,'phr',82,'square',.65,.04],'The Nameless Sovereign':[34.6,'loc',90,'sawtooth',.9,.05]
};
const liveBoss=()=>S.mode==='battle'&&S.run?liveFoes().find(e=>e.boss)||null:null;
const musicScene=()=>{ const b=liveBoss(); if(b&&BOSS_THEME[b.base]) return 'boss:'+b.base; return S.mode==='town'?(ui.tab==='tower'?'tower':'town'):(S.run&&S.run.tw?'tower':S.run&&S.run.rift?'rift':'gate'); };
function sceneOf(sc){ if(sc.startsWith('boss:')){ const t=BOSS_THEME[sc.slice(5)]; return {root:t[0],mode:t[1],bpm:t[2],tone:t[3],drum:t[4],noise:t[5],dens:.5,vol:.062,cut:620}; } return SCENES[sc]; }
function stopMusic(){
  const n=MUSIC.nodes, c=SFX.ctx; MUSIC.nodes=null; MUSIC.scene=null; if(!n) return; clearInterval(n.timer); if(!c) return;
  try{ n.g.gain.cancelScheduledValues(c.currentTime); n.g.gain.setTargetAtTime(0.0001,c.currentTime,.7); }catch(e){}
  setTimeout(()=>n.src.forEach(o=>{ try{ o.stop(); }catch(e){} }),4000);
}
function music(){
  if(!MUSIC.on){ stopMusic(); return; }
  if(!MUSIC.armed) return;
  const sc=musicScene(); if(sc===MUSIC.scene&&MUSIC.nodes) return;
  let c; try{ c=sfxCtx(); }catch(e){ return; } if(!c) return;
  stopMusic();
  const P=sceneOf(sc), M=MODES[P.mode], t=c.currentTime, g=c.createGain(), lp=c.createBiquadFilter(), lfo=c.createOscillator(), lg=c.createGain(), src=[];
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(P.vol,t+3); g.connect(c.destination);
  // pad: root, fifth and the mode's third, softly detuned, under a breathing low-pass
  lp.type='lowpass'; lp.frequency.value=P.cut; lp.Q.value=2.5; lfo.frequency.value=.06; lg.gain.value=P.cut*.4; lfo.connect(lg).connect(lp.frequency); lfo.start(t); src.push(lfo); lp.connect(g);
  const st=n=>P.root*Math.pow(2,n/12), padG=c.createGain(); padG.gain.value=.55; padG.connect(lp);
  [0,7,M[2]+12].forEach((n,i)=>{ for(const det of [-6,5]){ const o=c.createOscillator(); o.type=i?'sawtooth':'triangle'; o.frequency.value=st(n); o.detune.value=det; o.connect(padG); o.start(t); src.push(o); } });
  const sub=c.createOscillator(), sg=c.createGain(); sub.frequency.value=P.root/2; sg.gain.value=.5; sub.connect(sg).connect(g); sub.start(t); src.push(sub);
  if(P.noise){ const n=Math.floor(c.sampleRate*2), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
    const ns=c.createBufferSource(), bp=c.createBiquadFilter(), ng=c.createGain(); ns.buffer=b; ns.loop=true; bp.type='bandpass'; bp.frequency.value=180; bp.Q.value=.7; ng.gain.value=P.noise*8; ns.connect(bp).connect(ng).connect(g); ns.start(t); src.push(ns); }
  // echo for the melody
  const dl=c.createDelay(1.5), fb=c.createGain(), dlp=c.createBiquadFilter(), mel=c.createGain(); dl.delayTime.value=60/P.bpm*.75; fb.gain.value=.38; dlp.type='lowpass'; dlp.frequency.value=1800;
  mel.gain.value=1; mel.connect(g); mel.connect(dl); dl.connect(dlp).connect(fb).connect(dl); dlp.connect(g);
  // melody and pulse, scheduled a little ahead
  const beat=60/P.bpm; let next=t+1.5, step=0;
  const note=(at,deg,oct)=>{ const o=c.createOscillator(), e=c.createGain(); o.type=P.tone==='square'?'square':'triangle'; o.frequency.value=st(M[deg%M.length]+12*(2+oct)); e.gain.setValueAtTime(0.0001,at); e.gain.exponentialRampToValueAtTime(P.tone==='square'?.05:.09,at+.03); e.gain.exponentialRampToValueAtTime(0.0001,at+beat*2.2); o.connect(e).connect(mel); o.start(at); o.stop(at+beat*2.4); };
  const pulse=at=>{ const o=c.createOscillator(), e=c.createGain(); o.type='sine'; o.frequency.setValueAtTime(70,at); o.frequency.exponentialRampToValueAtTime(38,at+.25); e.gain.setValueAtTime(0.0001,at); e.gain.exponentialRampToValueAtTime(.5*P.drum,at+.01); e.gain.exponentialRampToValueAtTime(0.0001,at+.35); o.connect(e).connect(g); o.start(at); o.stop(at+.4); };
  let deg=0;
  const timer=setInterval(()=>{ if(!MUSIC.nodes||MUSIC.nodes.timer!==timer) return; const now=c.currentTime, ahead=document.hidden?1.5:.35;
    if(next<now) next=now+.05;   // the timer ran late (a busy or hidden tab): skip what was missed instead of playing it all at once
    while(next<now+ahead){ if(step%2===0&&Math.random()<P.dens){ deg=Math.max(0,Math.min(9,deg+[-2,-1,1,1,2][Math.floor(Math.random()*5)])); note(next,deg,deg>6?1:0); }   // a wandering line in the scene's mode
      if(P.drum&&step%4===0&&Math.random()<.5+P.drum/2) pulse(next); next+=beat/2; step++; } },120);
  MUSIC.nodes={g,src,timer}; MUSIC.scene=sc;
}
// Boss backgrounds: each boss fight sets its own colours and pattern behind the battle (#bossbg).
const BOSS_LOOK={
  'The Rat King':['#3a2a18','#6b5a2a','mist'],'The Crypt Warden':['#1d2a22','#4f6b55','rings'],'The Ember Knight':['#3a1206','#c8501e','rays'],
  'The Bishop of Teeth':['#2a2420','#d8c8a0','rays'],'The Orchard Mother':['#1a2410','#5a7a2a','drip'],'The Pale Sovereign':['#1c1a16','#e8dec6','rings'],
  'The Gate Hound':['#2a0a06','#a8241a','rays'],'Cinder Matron':['#3a1406','#e8782a','mist'],'The Iron Inquisitor':['#1a1a1a','#8a8a80','drip'],
  'Lord of Flies':['#1e2410','#8a9a2a','mist'],'The Bone Cantor':['#201c18','#c8b890','rings'],'Duke of Chains':['#1a1410','#7a6a50','drip'],
  'The Pale Executioner':['#200808','#b8b0a0','rays'],'Archdevil Vael':['#2a0606','#e83a1e','rays'],'The Hollow Seraph':['#24200e','#e8c860','rings'],
  'Abaddon, King of Hell':['#140404','#ff3a1a','mist'],'Inquisitor Captain':['#1e1206','#d8862a','rays'],
  'The Plague Matriarch':['#14180a','#7aa02a','mist'],'The Drowned Abbot':['#0e1a16','#3a8a6a','drip'],'The Cinder Wyrm':['#200a04','#ff6a1a','rays'],
  'The Choir Eternal':['#1a1814','#f0e6c8','rings'],'The Rootking':['#141a0a','#6a8a2a','drip'],'The Nameless Sovereign':['#0a0a0a','#e8564a','rings']
};
function bossBg(){
  const el=document.getElementById('bossbg'); if(!el) return; const b=liveBoss(), BL=b&&BOSS_LOOK[b.base];
  const G=!BL&&S.mode!=='town'&&S.run&&!S.run.tw?BOSS_LOOK[S.run.siege?SIEGE_BOSS:DUNGEONS[S.run.di].boss[0]]:null, L=BL||G;   /* a siege burns in torchlight throughout */   // a gate's own colours outside its boss fight
  document.body.classList.toggle('bossfight',!!BL); document.body.classList.toggle('gatefight',!!G); if(!L) return;
  el.className='bb-'+L[2]; el.style.setProperty('--bb1',L[0]); el.style.setProperty('--bb2',L[1]);
}
// ===== BACKDROPS (painted scenes) =====
// A painted backdrop for where you are: the town at dusk, each gate's own place, the Rift and the Hell Tower (whose CSS sky and flames in #hellbg stay in front).
// Built once per place as an SVG in #scene: sky, far to near silhouettes that darken as they come closer, fog, light and
// a vignette. Fog drifts and flames flicker unless motion is reduced. Settings > Backgrounds turns them off.
const SC_W=1600, SC_H=900;
function scRand(seed){ let a=seed|0; return ()=>{ a=(a*1664525+1013904223)|0; return ((a>>>8)&0xffff)/0x10000; }; }
const scFog=(y,o,c,rx,d)=>'<ellipse class="sc-fog'+(d?' d2':'')+'" cx="800" cy="'+y+'" rx="'+(rx||1150)+'" ry="70" fill="'+(c||'#c8bca0')+'" opacity="'+(o*.7).toFixed(3)+'" filter="url(#scB)"/>';
const scLift=(h,k)=>h.replace(/#([0-9a-f]{6})(?![0-9a-f])/gi,(m,x)=>{ const n=parseInt(x,16), f=c=>Math.min(255,Math.round(c*(k||1.45)+4)).toString(16).padStart(2,'0'); return '#'+f(n>>16)+f((n>>8)&255)+f(n&255); });   // scenes are drawn dark, then lifted so they read behind the panels
const scSky=(id,top,mid,bot)=>'<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+top+'"/><stop offset=".62" stop-color="'+mid+'"/><stop offset="1" stop-color="'+bot+'"/></linearGradient>';
const scGlow=(x,y,r,c,o)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'" opacity="'+(o==null?.35:o)+'" filter="url(#scB)"/>';
const scFlame=(x,y,s)=>'<g class="sc-flk" transform="translate('+x+' '+y+') scale('+(s||1)+')"><ellipse cx="0" cy="-4" rx="10" ry="14" fill="#ff9a40" opacity=".18" filter="url(#scB2)"/><path d="M0-12C-3-6 2-5 0 0C-4-1-5-5-2-9Z" fill="#ffb347"/><path d="M0-7C-1.5-4 1.5-3 0 0C-2 0-2.5-3 0-7Z" fill="#ffe2a0"/></g>';
const scArch=(cx,base,w,h,fill)=>'<path d="M'+(cx-w/2)+' '+base+'V'+(base-h+w/2)+'A'+(w/2)+' '+(w/2)+' 0 0 1 '+(cx+w/2)+' '+(base-h+w/2)+'V'+base+'Z" fill="'+fill+'"/>';
const scGothic=(cx,base,w,h,fill)=>'<path d="M'+(cx-w/2)+' '+base+'V'+(base-h*.62)+'Q'+(cx-w/2)+' '+(base-h)+' '+cx+' '+(base-h)+'Q'+(cx+w/2)+' '+(base-h)+' '+(cx+w/2)+' '+(base-h*.62)+'V'+base+'Z" fill="'+fill+'"/>';
function scTree(r,x,y,h,fill,fruit){   // a twisted dead tree: a trunk and a few crooked branches
  let o='<path d="M'+(x-h*.05)+' '+y+'C'+(x-h*.03)+' '+(y-h*.4)+' '+(x+h*.06)+' '+(y-h*.55)+' '+(x+h*.01)+' '+(y-h*.75)+'L'+(x+h*.035)+' '+(y-h*.74)+'C'+(x+h*.1)+' '+(y-h*.52)+' '+(x+h*.02)+' '+(y-h*.4)+' '+(x+h*.05)+' '+y+'Z" fill="'+fill+'"/>';
  for(let i=0;i<5;i++){ const t=.35+i*.1, by=y-h*t, dir=i%2?1:-1, len=h*(.3-.03*i)*(.8+r()*.4), ex=x+dir*len, ey=by-len*(.4+r()*.5);
    o+='<path d="M'+x+' '+by+'Q'+(x+dir*len*.5)+' '+(by-len*.05)+' '+ex+' '+ey+'" stroke="'+fill+'" stroke-width="'+(h*.022*(1-i*.12))+'" fill="none" stroke-linecap="round"/>';
    o+='<path d="M'+(x+dir*len*.6)+' '+(by-len*.2)+'l'+(dir*len*.25)+' '+(-len*.35)+'" stroke="'+fill+'" stroke-width="'+(h*.009)+'" fill="none" stroke-linecap="round"/>';
    if(fruit&&r()<.8) o+='<circle cx="'+ex+'" cy="'+(ey+4)+'" r="'+(h*.012)+'" fill="#7a1e14"/><circle cx="'+(ex-1)+'" cy="'+(ey+3)+'" r="'+(h*.004)+'" fill="#e8a080" opacity=".6"/>'; }
  return o;
}
function scPillars(n,base,col,top,lit){   // two rows of columns running toward a vanishing point at the centre
  let o=''; for(let i=n-1;i>=0;i--){ const k=1-i/(n+1.5), w=26+70*k, off=120+560*k, h=(base-top)*(.45+.55*k), c=i===0?col:lit&&i>n-3?lit:col;
    for(const sx of [-1,1]){ const x=800+sx*off; o+='<rect x="'+(x-w/2)+'" y="'+(base-h)+'" width="'+w+'" height="'+h+'" fill="'+c+'" opacity="'+(.55+.45*k)+'"/><rect x="'+(x-w/2-w*.12)+'" y="'+(base-h)+'" width="'+(w*1.24)+'" height="'+(w*.22)+'" fill="'+c+'" opacity="'+(.55+.45*k)+'"/>'; } }
  return o;
}
// More helpers for the repainted scenes: stars, drifting motes, crows, smoke, lit windows and a tiled floor in perspective.
const scStars=(r,n,ymax)=>{ let o='<g fill="#e8e0c8">'; for(let i=0;i<n;i++) o+='<circle cx="'+(r()*1600).toFixed(0)+'" cy="'+(r()*ymax).toFixed(0)+'" r="'+(.5+r()*1.1).toFixed(2)+'" opacity="'+(.15+r()*.5).toFixed(2)+'"/>'; return o+'</g>'; };
const scMotes=(r,n,c,y0,y1,cls)=>{ const g=['','',''];   // three moving groups (not one animation per mote), each on its own beat; sc-amb marks them for scCalm
  for(let i=0;i<n;i++) g[i%3]+='<circle cx="'+(r()*1600).toFixed(0)+'" cy="'+(y0+r()*(y1-y0)).toFixed(0)+'" r="'+(.8+r()*1.8).toFixed(2)+'" opacity="'+(.15+r()*.45).toFixed(2)+'"/>';
  return g.map((s,k)=>s?'<g class="sc-amb '+(cls||'sc-mote')+(k?' d'+(k+1):'')+'" fill="'+c+'">'+s+'</g>':'').join(''); };
const scCrow=(x,y,s,f)=>'<path d="M'+x+' '+y+'q'+(-6*s)+' '+(-5*s)+' '+(-13*s)+' '+(-2*s)+'q'+(6*s)+' 0 '+(9*s)+' '+(3*s)+'q'+(3*s)+' '+(-4*s)+' '+(10*s)+' '+(-5*s)+'q'+(-5*s)+' '+(3*s)+' '+(-6*s)+' '+(4*s)+'z" fill="'+(f||'#060504')+'"/>';
const scSmoke=(x,y,h)=>'<path class="sc-fog d2" d="M'+x+' '+y+'C'+(x-14)+' '+(y-h*.3)+' '+(x+16)+' '+(y-h*.55)+' '+(x-6)+' '+(y-h*.8)+'S'+(x+20)+' '+(y-h*1.1)+' '+(x+8)+' '+(y-h*1.3)+'" stroke="#a89c84" stroke-opacity=".14" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#scB2)"/>';
const scWin=(x,y,w,h,o)=>scGlow(x+w/2,y+h/2,w*2.4,'#e8a050',.16*(o||1))+'<rect class="sc-flk" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#e8a858" opacity="'+(.6*(o||1)).toFixed(2)+'"/><path d="M'+(x+w/2)+' '+y+'V'+(y+h)+'M'+x+' '+(y+h/2)+'H'+(x+w)+'" stroke="#1a120a" stroke-width="1"/>';
function scTiles(y0,y1,col,n){ let o='<g stroke="'+col+'" stroke-width="1.4" fill="none">'; for(let i=-n;i<=n;i++) o+='<path d="M'+(800+i*14)+' '+y0+'L'+(800+i*230)+' '+y1+'"/>'; for(let k=0;k<8;k++){ const t=Math.pow(k/8,1.8), y=y0+(y1-y0)*t; o+='<path d="M0 '+y.toFixed(1)+'H1600" opacity="'+(.4+.6*t).toFixed(2)+'"/>'; } return o+'</g>'; }
function scHouse(x,base,w,h,fill,lit,r){   // a cottage: walls, a steep roof, a chimney with smoke, maybe a lit window
  let o='<path d="M'+x+' '+base+'V'+(base-h)+'L'+(x+w/2)+' '+(base-h-w*.55)+'L'+(x+w)+' '+(base-h)+'V'+base+'Z" fill="'+fill+'"/><path d="M'+(x+w*.7)+' '+(base-h-w*.3)+'V'+(base-h-w*.62)+'H'+(x+w*.82)+'V'+(base-h-w*.2)+'Z" fill="'+fill+'"/>';
  if(r()<.7) o+=scSmoke(x+w*.76,base-h-w*.64,120);
  if(lit) o+=scWin(x+w*.3,base-h*.65,w*.18,h*.28,lit);
  return o;
}
// Depth for the backdrops: far ridges, ruined arches, arcades, chains, banners, mist bands, torches and braziers. Only whole
// groups move, never single shapes: sc-par drifts a layer a few pixels (far layers slower than near ones, a parallax feel),
// sc-sway stirs everything hanging, sc-amb holds motes and embers. All of it keeps to the edges and stays low in contrast,
// so the cards in the middle read first. With motion reduced, scCalm drops the sc-amb groups and every animation class.
const scPar=(s,near)=>'<g class="sc-par'+(near?' d2':'')+'">'+s+'</g>';
const scSway=s=>'<g class="sc-sway">'+s+'</g>';
const scCalm=h=>VIEW.calm?h.replace(/<g class="sc-amb[^"]*"[^>]*>(?:<circle[^>]*\/>)*<\/g>/g,'').replace(/ class="sc-[^"]*"/g,''):h;
function scRidge(r,y,amp,step,col,o){   // a far mountain ridge: alternating crags and saddles, wider than the view so a drift never shows its end
  let d='M-60 900V'+y; for(let x=-60,i=0;x<=1660;x+=step,i++) d+='L'+x+' '+(y-amp*(i%2?.12+r()*.35:.55+r()*.45)).toFixed(0);
  return '<path d="'+d+'L1660 '+y+'V900Z" fill="'+col+'" opacity="'+(o==null?1:o)+'"/>';
}
function scRuin(x,base,w,h,col,flip){   // a broken archway of dressed stone: one whole pier with its impost, a pier snapped off in steps, the arch ring standing past the crown and broken off along its joints, fallen blocks under it; faint coursing lines
  const R=w/2, p=w*.24, ri=R-p/2, ro=R+p/2, cy=base-h+ro, s=flip?-1:1, r=scRand(Math.round(x*7+base)), n=v=>v.toFixed(0);
  const P=(rad,t)=>n(x-s*rad*Math.cos(t))+' '+n(cy-rad*Math.sin(t)), X=v=>n(x+s*v), sw=flip?0:1, rm=(ri+ro)/2, ta=1.62+r()*.16, tb=ta+.2+r()*.12;
  const yT=base-(base-cy)*(.64+r()*.14), a=R-p/2, b=p*.1;   // the snapped pier's top, and the impost's overhang
  let d='M'+X(-R-p/2-b*2)+' '+n(base)+'v'+n(-p*.3)+'h'+n(s*(w+p+b*4))+'v'+n(p*.3)+'Z'   // the plinth that ties both piers
    +'M'+X(-R-p/2)+' '+n(base)+'V'+n(cy)+'H'+X(-R+p/2)+'V'+n(base)+'Z'   // the whole pier
    +'M'+X(-R-p/2-b)+' '+n(cy)+'h'+n(s*(p+2*b))+'v'+n(p*.2)+'h'+n(-s*(p+2*b))+'Z'   // its impost
    +'M'+X(a)+' '+n(base)+'V'+n(yT-p*.2)+'H'+X(a+p*.38)+'V'+n(yT+p*.12)+'L'+X(a+p*.7)+' '+n(yT+p*.3)+'V'+n(yT+p*.5)+'H'+X(a+p)+'V'+n(base)+'Z'   // the snapped pier, stepped
    +'M'+P(ro,0)+'A'+n(ro)+' '+n(ro)+' 0 0 '+sw+' '+P(ro,tb)+'L'+P(rm,tb)+'L'+P(rm,ta+.08)+'L'+P(ri+p*.1,ta+.06)+'L'+P(ri,ta)+'A'+n(ri)+' '+n(ri)+' 0 0 '+(1-sw)+' '+P(ri,0)+'Z';   // the arch ring, broken off along its voussoir joints
  for(let i=0,bx=a-p*.15;i<3;i++){ const k=p*(.7-i*.14), q=(r()-.5)*.5, c=Math.cos(q)*k/2, si=Math.sin(q)*k/2, cx=x+s*(bx-k/2), by=base-p*.3-k/2-(i===2?p*.5:0);   // fallen blocks, tilted, the last one resting on the others
    d+='M'+n(cx-c+si)+' '+n(by-si-c)+'L'+n(cx+c+si)+' '+n(by+si-c)+'L'+n(cx+c-si)+' '+n(by+si+c)+'L'+n(cx-c-si)+' '+n(by-si+c)+'Z'; bx-=i?-k*.4:k*.95; }
  let j=''; for(let y=base-p*.85;y>cy+p*.4;y-=p*.85) j+='M'+X(-R-p/2)+' '+n(y)+'h'+n(s*p)+(y>yT+p*.6?'M'+X(a)+' '+n(y)+'h'+n(s*p):'');   // coursing on the piers
  for(let t=.32;t<ta-.1;t+=.34) j+='M'+P(ri,t)+'L'+P(ro,t);   // voussoir joints
  return '<path d="'+d+'" fill="'+col+'"/><path d="'+j+'" stroke="#fff" stroke-opacity=".06" stroke-width="'+Math.max(1,p*.06).toFixed(1)+'" fill="none"/>';
}
function scArcade(y,h,w,col,o,sw){   // a far row of pointed arches, open where the cards stand
  let d=''; for(let x=-w;x<1600+w;x+=w){ if(x+w>560&&x<1040) continue; d+='M'+x+' '+y+'V'+(y-h*.6)+'Q'+x+' '+(y-h)+' '+(x+w/2)+' '+(y-h)+'Q'+(x+w)+' '+(y-h)+' '+(x+w)+' '+(y-h*.6)+'V'+y; }
  return '<path d="'+d+'" stroke="'+col+'" stroke-width="'+(sw||8)+'" fill="none" opacity="'+o+'"/>';
}
const scChain=(x,y0,y1,col,w)=>{ w=w||3; return '<path d="M'+x+' '+y0+'V'+y1+'" stroke="'+col+'" stroke-width="'+w+'" stroke-dasharray="'+(w*2.2).toFixed(1)+' '+(w*.9).toFixed(1)+'"/><path d="M'+x+' '+(y1-2)+'q'+(w*2)+' '+(w*3)+' 0 '+(w*4.5)+'" stroke="'+col+'" stroke-width="'+(w*.8).toFixed(1)+'" fill="none"/>'; };   // links, then a hook
function scBanner(r,x,y,w,h,col,trim){   // a tattered banner on a crossbar, its hem torn into uneven tongues, with a faded sigil
  let d='M'+(x-w/2)+' '+y+'H'+(x+w/2)+'V'+(y+h*(.8+r()*.15)).toFixed(0);
  for(let i=1;i<=4;i++){ const tx=x+w/2-w*i/4; d+='L'+(tx+w/8).toFixed(0)+' '+(y+h*(i%2?.92+r()*.08:.7+r()*.12)).toFixed(0)+'L'+tx.toFixed(0)+' '+(y+h*(.76+r()*.16)).toFixed(0); }
  return '<path d="M'+(x-w/2-6)+' '+y+'H'+(x+w/2+6)+'" stroke="#0a0806" stroke-width="4"/><path d="'+d+'Z" fill="'+col+'"/>'
    +(trim?'<path d="M'+(x-w/2+4)+' '+(y+6)+'V'+(y+h*.6).toFixed(0)+'M'+(x+w/2-4)+' '+(y+6)+'V'+(y+h*.6).toFixed(0)+'" stroke="'+trim+'" stroke-opacity=".22" stroke-width="2"/><path d="M'+x+' '+(y+h*.2).toFixed(0)+'l'+(w*.16).toFixed(1)+' '+(h*.14).toFixed(1)+'l'+(-w*.16).toFixed(1)+' '+(h*.14).toFixed(1)+'l'+(-w*.16).toFixed(1)+' '+(-h*.14).toFixed(1)+'Z" fill="'+trim+'" opacity=".2"/>':'');
}
const scMist=(id,y,h,col,o)=>'<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity="0"/><stop offset=".55" stop-color="'+col+'" stop-opacity="'+o+'"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient><rect x="-120" y="'+y+'" width="1840" height="'+h+'" fill="url(#'+id+')"/>';   // a band of lying mist, soft above and below
const scBrazier=(x,y,k,c)=>{ k=k||1; c=c||'#0a0806'; return scGlow(x,y-30*k,60*k,'#ff8a3a',.16)+'<path d="M'+(x-14*k)+' '+y+'L'+x+' '+(y-26*k)+'L'+(x+14*k)+' '+y+'M'+x+' '+y+'V'+(y-26*k)+'" stroke="'+c+'" stroke-width="'+(2.5*k)+'" fill="none"/><path d="M'+(x-16*k)+' '+(y-30*k)+'H'+(x+16*k)+'L'+(x+10*k)+' '+(y-22*k)+'H'+(x-10*k)+'Z" fill="'+c+'"/>'+scFlame(x,y-30*k,1.3*k); };
const scTorch=(x,y,k,c)=>{ k=k||1; c=c||'#0a0806'; return scGlow(x,y-14*k,44*k,'#ff9a40',.14)+'<path d="M'+(x-3*k)+' '+(y+18*k)+'L'+(x-2*k)+' '+y+'H'+(x+2*k)+'L'+(x+3*k)+' '+(y+18*k)+'Z" fill="'+c+'"/><path d="M'+(x-8*k)+' '+(y+12*k)+'H'+(x+8*k)+'" stroke="'+c+'" stroke-width="'+(2*k)+'"/>'+scFlame(x,y+2*k,k); };
const BACKDROPS={
  tower:()=>{ const r=scRand(17); let o='<defs>'+scSky('skW','#0a0302','#2a0805','#5a140a')+'<linearGradient id="lava" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb050"/><stop offset="1" stop-color="#c8321a"/></linearGradient></defs><rect width="1600" height="900" fill="url(#skW)"/>'
    +[[300,150,380],[1250,120,420],[800,230,560]].map(([x,y,w],i)=>'<ellipse class="sc-fog'+(i%2?' d2':'')+'" cx="'+x+'" cy="'+y+'" rx="'+w+'" ry="'+(w*.2)+'" fill="#4a1208" opacity=".55" filter="url(#scB)"/>').join('')
    +scGlow(800,820,520,'#ff5a1a',.32)
    +scPar(scRidge(scRand(117),470,150,80,'#2a0a05',.85)+scRuin(330,560,120,170,'#220805')+scRuin(1290,560,110,150,'#220805',1))
    +'<path d="M0 560L90 500L160 530L240 470L320 520L380 480L470 530L540 460L620 510L700 490L780 530L860 470L950 520L1030 480L1120 530L1200 470L1280 515L1360 485L1440 525L1520 475L1600 520V900H0Z" fill="#2e0c06"/>';
    for(let i=0;i<22;i++){
      const x=r()*1600;
      if(Math.abs(x-800)<120) continue;
      const h=60+r()*170, w=10+r()*12, base=560+r()*30;
      o+='<path d="M'+(x-w).toFixed(0)+' '+base.toFixed(0)+'L'+(x-w*.4).toFixed(0)+' '+(base-h*.7).toFixed(0)+'L'+x.toFixed(0)+' '+(base-h).toFixed(0)
        +'L'+(x+w*.4).toFixed(0)+' '+(base-h*.7).toFixed(0)+'L'+(x+w).toFixed(0)+' '+base.toFixed(0)+'Z" fill="#1c0604"/>';
      if(r()<.6) o+='<rect class="sc-flk" x="'+(x-1.5).toFixed(0)+'" y="'+(base-h*.5).toFixed(0)+'" width="3" height="6" fill="#ff8a3c"/>';
      if(r()<.3) o+=scSmoke(x,base-h,140);
    }
    o+='<path d="M700 760L715 640L735 640L740 500L755 500L760 380L775 380L785 250L800 140L815 250L825 380L840 380L845 500L860 500L865 640L885 640L900 760Z" fill="#0d0302"/>'
      +'<path d="M786 262C770 244 764 224 770 202C777 226 786 240 796 252ZM814 262C830 244 836 224 830 202C823 226 814 240 804 252Z" fill="#0d0302"/>'
      +'<path d="M800 140L815 250L825 380L840 380L845 500L860 500L865 640" stroke="#ff6a2a" stroke-opacity=".25" stroke-width="2" fill="none"/>'
      +[[797,300],[762,430],[832,430],[797,520],[745,600],[850,600],[797,680]].map(([x,y])=>scGlow(x+3,y+5,14,'#ff7a2a',.3)+'<rect class="sc-flk" x="'+x+'" y="'+y+'" width="6" height="11" fill="#ffb050"/>').join('')
      +scPar(scMist('mW',590,150,'#ff5a1a',.09),1)
      +'<path d="M0 700L80 660L150 690L230 640L310 690L380 660L460 700L520 760H0ZM1080 760L1140 700L1210 670L1280 700L1350 650L1420 690L1490 655L1560 690L1600 670V760Z" fill="#120403"/>'
      +scBrazier(250,700,1.1,'#0d0302')+scBrazier(1350,692,1.1,'#0d0302')
      +scSway(scChain(130,0,250,'#140504',4)+scChain(215,0,170,'#140504',3)+scChain(1385,0,210,'#140504',3)+scChain(1470,0,290,'#140504',4)
        +'<path d="M1452 300H1488V346Q1470 356 1452 346ZM1458 300V348M1470 300V352M1482 300V348" stroke="#140504" stroke-width="3" fill="none"/>')
      +'<path d="M760 760C700 800 620 810 560 840S420 880 380 900H520C560 880 640 860 700 840S790 800 840 760Z" fill="url(#lava)" opacity=".85" class="sc-flk"/><path d="M760 760C700 800 620 810 560 840S420 880 380 900" stroke="#ffe0a0" stroke-opacity=".5" stroke-width="2" fill="none"/>'
      +scGlow(600,840,140,'#ff7a2a',.35)+'<path d="M0 760H1600V900H0Z" fill="#0a0202" opacity=".5"/>';
    for(let i=0;i<9;i++){
      const x=r()*1600, y=120+r()*300, s=.6+r()*.9;
      o+='<path class="sc-mote'+(i%2?' d2':'')+'" d="M'+x.toFixed(0)+' '+y.toFixed(0)+'q'+(10*s).toFixed(1)+' '+(-8*s).toFixed(1)+' '
        +(20*s).toFixed(1)+' 0q'+(10*s).toFixed(1)+' '+(-8*s).toFixed(1)+' '+(20*s).toFixed(1)+' 0q'+(-10*s).toFixed(1)+' '+(3*s).toFixed(1)+' '
        +(-20*s).toFixed(1)+' '+(4*s).toFixed(1)+'q'+(-10*s).toFixed(1)+' '+(-1*s).toFixed(1)+' '+(-20*s).toFixed(1)+' -'+(4*s).toFixed(1)
        +'z" fill="#0a0202"/>';
    }
    return o+scMotes(r,60,'#ff9a48',200,880,'sc-ember'); },
  town:()=>{ const r=scRand(7); let o='<defs>'+scSky('skT','#14130f','#342a1c','#4a3720')+'</defs><rect width="1600" height="900" fill="url(#skT)"/>'+scStars(r,70,420)
    +scGlow(1150,175,170,'#e0d6b8',.2)+'<circle cx="1150" cy="175" r="54" fill="#d8cfb2" opacity=".72"/><circle cx="1134" cy="162" r="11" fill="#b0a68a" opacity=".45"/><circle cx="1168" cy="192" r="8" fill="#b0a68a" opacity=".4"/><circle cx="1158" cy="150" r="5" fill="#b0a68a" opacity=".35"/>'
    +'<ellipse class="sc-fog" cx="1120" cy="190" rx="220" ry="16" fill="#14120e" opacity=".55" filter="url(#scB2)"/><ellipse class="sc-fog d2" cx="1240" cy="150" rx="180" ry="12" fill="#14120e" opacity=".4" filter="url(#scB2)"/>'
    +scGlow(800,650,560,'#7a5a32',.26)
    +scPar(scRidge(scRand(107),565,120,90,'#211b14',.9)+scRuin(250,548,90,130,'#1c1712')+'<path d="M1390 560V470L1400 462L1406 476L1414 458L1426 470V560Z" fill="#1c1712"/>')
    +'<path d="M0 590Q240 520 470 560T900 545T1300 560T1600 530V900H0Z" fill="#2a2319"/>'
    +'<path d="M0 625Q200 585 420 610T820 600T1220 615T1600 595V900H0Z" fill="#1d1913"/>';
    for(let i=0;i<28;i++){ const x=r()*1600, y=600+r()*20; o+='<path d="M'+x+' '+(y+10)+'Q'+(x+8)+' '+(y-24-r()*20)+' '+(x+16)+' '+(y+10)+'Z" fill="#191510"/>'; }
    o+='<g>'+scHouse(470,655,64,44,'#14110d',.9,r)+scHouse(548,660,52,36,'#130f0c',0,r)+scHouse(720,662,58,40,'#14110d',.7,r)+scHouse(880,660,70,46,'#130f0c',1,r)+scHouse(965,664,50,34,'#14110d',0,r)+scHouse(1040,660,62,42,'#130f0c',.8,r)+'</g>'
      +'<g fill="#0f0d0a"><path d="M612 664V520L650 490L688 520V664Z"/><path d="M634 500V400L650 360L666 400V500Z"/><path d="M647 360V330H653V360ZM641 340H659V345H641Z"/></g>'+scWin(644,540,12,22,1)+scWin(645,420,10,14,.7)
      +'<path d="M0 668H1600" stroke="#0e0c09" stroke-width="5"/><g stroke="#0e0c09" stroke-width="3">'+Array.from({length:60},(_,i)=>'<path d="M'+(i*27+8)+' 668V'+(652+(i%3)*2)+'"/>').join('')+'</g>'
      +scFog(660,.2,'#b8ac90')+scPar(scMist('mT',600,120,'#8a7a5c',.14),1)
      +'<g fill="#0c0a08"><path d="M298 668V556H303V668ZM1298 668V556H1303V668Z"/></g>'+(q=>scSway(scBanner(q,318,560,34,86,'#3a1c12','#c8a060')+scBanner(q,1318,560,34,86,'#3a1c12','#c8a060')))(scRand(207))
      +scBrazier(420,712,.9)+scBrazier(1180,712,.9)
      +'<path d="M720 900L780 668H820L880 900Z" fill="#3a3024" opacity=".35"/>'
      +'<path d="M0 760Q400 715 760 740T1600 720V900H0Z" fill="#100e0b"/>';
    for(let i=0;i<26;i++){
      const x=30+i*62+r()*30;
      if(x>690&&x<910) continue;
      const y=772+r()*80, h=26+r()*30, k=r();
      o+=k<.45?'<path d="M'+(x-2.5)+' '+y+'V'+(y-h)+'H'+(x+2.5)+'V'+y+'ZM'+(x-11)+' '+(y-h*.7)+'H'+(x+11)+'V'+(y-h*.7+5)+'H'+(x-11)
        +'Z" fill="#0a0907" transform="rotate('+(r()*16-8).toFixed(1)+' '+x+' '+y+')"/>':'<path d="M'+(x-13)+' '+y+'V'+(y-h*.7)+'Q'+x+' '+(y-h*1.1)
        +' '+(x+13)+' '+(y-h*.7)+'V'+y+'Z" fill="#0c0b09" transform="rotate('+(r()*10-5).toFixed(1)+' '+x+' '+y+')"/><path d="M'+(x-12)+' '+(y-h*.72)
        +'Q'+(x-4)+' '+(y-h*.98)+' '+(x+2)+' '+(y-h*.94)+'" stroke="#6a604c" stroke-opacity=".25" stroke-width="1.5" fill="none"/>';
    }
    o+='<g fill="#080706"><path d="M1330 900V690H1339V900Z"/><path d="M1326 690H1424V699H1326Z"/><path d="M1335 722L1364 694" stroke="#080706" stroke-width="6"/></g><path d="M1408 699V742" stroke="#080706" stroke-width="2"/><path d="M1401 742H1415L1412 760H1404Z" fill="#080706"/>'
      +scCrow(1360,688,1.2)+scCrow(1395,688,1)+scTree(r,140,900,360,'#090806')+scCrow(205,690,1.3)+scCrow(90,640,1)
      +scFog(870,.14,'#a89c80',1300,1)+scMotes(r,24,'#d8c8a0',300,880);
    return o; },
  g0:()=>{ const r=scRand(2); let o='<defs><radialGradient id="rw" cx="50%" cy="54%" r="62%"><stop offset="0" stop-color="#6a5230"/><stop offset=".3" stop-color="#2a2014"/><stop offset="1" stop-color="#080706"/></radialGradient></defs><rect width="1600" height="900" fill="url(#rw)"/>';
    const cols=['#0d0a07','#140f0a','#1b150d','#231b10','#2c2214','#362a18','#41321c'];
    for(let i=0;i<7;i++){ const w=1720-i*235, h=1080-i*130, sw=72-i*8, path=scArch(800,700+i*4,w,h,'none').match(/d="([^"]+)"/)[1];
      o+='<path d="'+path+'" fill="none" stroke="'+cols[i]+'" stroke-width="'+sw+'"/><path d="'+path+'" fill="none" stroke="#050403" stroke-opacity=".55" stroke-width="'+sw+'" stroke-dasharray="1.6 '+(14+i*2)+'"/>'
        +'<path d="'+path+'" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.5" transform="translate(0 '+(sw/2-2)+')"/>'; }
    o+=scGlow(800,530,190,'#e0b060',.24)+'<path d="M770 700V560H830V700" stroke="#0a0806" stroke-width="5" fill="none"/>'+'<g stroke="#0a0806" stroke-width="3">'+[580,610,640,670].map(y=>'<path d="M770 '+y+'H830"/>').join('')+'</g>'
      +'<path d="M0 700H1600V900H0Z" fill="#0c0f0b"/><ellipse cx="800" cy="760" rx="70" ry="150" fill="#e0b060" opacity=".14" filter="url(#scB)"/>'
      +'<g stroke="#b8a070" stroke-opacity=".2" stroke-width="2">'+[722,745,775,815,865].map((y,i)=>'<path class="sc-fog'+(i%2?' d2':'')+'" d="M'+(420-i*130)+' '+y+'H'+(1180+i*130)+'"/>').join('')+'</g>'
      +'<path d="M0 500H250Q275 500 275 525V700M1600 520H1350Q1325 520 1325 545V700" stroke="#1d160d" stroke-width="24" fill="none"/><path d="M0 492H250M1600 512H1350" stroke="#4a3a22" stroke-opacity=".4" stroke-width="3"/>'
      +'<g stroke="#5a7a50" stroke-opacity=".35" stroke-width="2">'+[[275,540,620],[1325,560,650],[420,300,380],[1180,320,420]].map(([x,a,b])=>'<path d="M'+x+' '+a+'V'+b+'"/>').join('')+'</g>'
      +'<g stroke="#120d08" stroke-width="2.5" fill="none">'+[[560,120],[640,90],[960,100],[1040,130],[700,70],[900,60]].map(([x,l])=>'<path d="M'+x+' 0C'+(x+8)+' '+(l*.4)+' '+(x-6)+' '+(l*.7)+' '+(x+3)+' '+l+'"/>').join('')+'</g>'
      +'<g fill="#ff5a3c">'+[[250,650],[262,650],[1290,665],[1301,665],[560,690],[571,690],[1050,688],[1060,688]].map(([x,y])=>'<circle class="sc-flk" cx="'+x+'" cy="'+y+'" r="2.3"/>').join('')+'</g>'
      +scTorch(150,420,1.1,'#100c08')+scTorch(1450,440,1.1,'#100c08')
      +scSway(scChain(380,0,230,'#120d08',3)+scChain(430,0,150,'#120d08',2.4)+scChain(1220,0,210,'#120d08',3)+scChain(1170,0,130,'#120d08',2.4))
      +scRuin(120,710,150,200,'#0e0b07')+scRuin(1480,712,140,180,'#0e0b07',1)
      +scPar(scMist('mR',630,130,'#8a8a60',.12),1)
      +scFog(705,.14,'#7a7a58',900)+scMotes(r,18,'#c8b080',380,690);
    return o; },
  g1:()=>{ const r=scRand(4); let o='<defs>'+scSky('skC','#070b0a','#16241f','#1e302a')+'</defs><rect width="1600" height="900" fill="url(#skC)"/>'+scGlow(800,470,280,'#6aa08a',.2);
    for(let i=4;i>=0;i--){ const k=1-i/6; o+=scArch(800,690,180+620*k,520*k+120,i?'#0e1714':'#0a110f')+scArch(800,690,140+560*k,500*k+90,['#1a2a25','#16251f','#13201b','#101b17','#0d1513'][i]); }
    o+='<g stroke="#2a4038" stroke-opacity=".5" stroke-width="3" fill="none">'+[0,1,2,3].map(i=>{ const k=.3+i*.2; return '<path d="M'+(800-300*k)+' 690V'+(400-120*k)+'Q800 '+(150-140*k)+' '+(800+300*k)+' '+(400-120*k)+'V690"/>'; }).join('')+'</g>'
      +scPillars(5,700,'#0b1210',220);
    for(const sx of [-1,1]) for(let row=0;row<4;row++) for(let c=0;c<4;c++){ const x=800+sx*(290+c*38), y=420+row*42; o+='<ellipse cx="'+x+'" cy="'+y+'" rx="11" ry="13" fill="#050807"/><ellipse cx="'+x+'" cy="'+(y+1)+'" rx="6.5" ry="7.5" fill="#a8b8a0" opacity=".12"/>'; }
    o+='<g fill="#0a100e">'+[[330,690,200],[1270,690,200],[560,690,120],[1040,690,120]].map(([x,y,w])=>'<path d="M'+(x-w/2)+' '+y+'V'+(y-w*.28)+'H'+(x+w/2)+'V'+y+'Z"/><path d="M'+(x-w/2-6)+' '+(y-w*.28)+'H'+(x+w/2+6)+'L'+(x+w/2)+' '+(y-w*.36)+'H'+(x-w/2)+'Z"/>').join('')+'</g>'
      +'<g stroke="#0c1412" stroke-width="2.4">'+[[620,0,260],[980,0,240],[700,0,170],[900,0,190]].map(([x,a,b])=>'<path d="M'+x+' '+a+'V'+b+'" stroke-dasharray="6 3"/>').join('')+'</g>'
      +(q=>scSway(scBanner(q,190,30,46,200,'#1a2420','#8aa890')+scBanner(q,1410,30,46,200,'#1a2420','#8aa890')+scBanner(q,400,30,34,140,'#16201c','#8aa890')+scBanner(q,1200,30,34,140,'#16201c','#8aa890')))(scRand(104))
      +scPar(scMist('mC',600,170,'#7fa898',.12),1)
      +'<path d="M0 690H1600V900H0Z" fill="#10201c"/>'
      +[470,1130,640,960].map((x,i)=>scFlame(x,560+(i>1?40:0),i>1?.9:1.2)+'<path class="sc-flk" d="M'+(x-3)+' '+(700+(i>1?0:0))+'V'+(780+(i>1?20:60))+'" stroke="#ffb347" stroke-opacity=".25" stroke-width="'+(i>1?4:6)+'"/>').join('')
      +'<g stroke="#7fc1bd" stroke-opacity=".16" stroke-width="2">'+[712,742,782,832,882].map((y,i)=>'<path class="sc-fog'+(i%2?' d2':'')+'" d="M'+(480-i*110)+' '+y+'H'+(1120+i*110)+'"/>').join('')+'</g>'
      +scRuin(140,900,220,300,'#09100e')+scRuin(1460,900,200,270,'#09100e',1)
      +scFog(700,.16,'#80b0a0',1000)+scFog(560,.09,'#80b0a0',800,1)+scMotes(r,16,'#b0d0c0',250,680);
    return o; },
  g2:()=>{ const r=scRand(3); let o='<defs>'+scSky('skB','#0c0705','#2c140a','#5a240e')+'</defs><rect width="1600" height="900" fill="url(#skB)"/>'
    +[[400,180,420,'#3a1a0e',.5],[1200,140,380,'#3a1a0e',.45],[800,260,520,'#5a2610',.35],[300,330,300,'#1a0c08',.6],[1300,300,320,'#1a0c08',.6]].map(([x,y,w,c,op])=>'<ellipse class="sc-fog'+(x>800?' d2':'')+'" cx="'+x+'" cy="'+y+'" rx="'+w+'" ry="'+(w*.22)+'" fill="'+c+'" opacity="'+op+'" filter="url(#scB)"/>').join('')
    +scGlow(800,700,480,'#d8622a',.3)
    +scPar(scRidge(scRand(103),590,130,80,'#2a120a',.85)+scRuin(210,610,110,160,'#1e0d07')+scRuin(1400,606,90,120,'#1e0d07',1))+scPar(scRidge(scRand(203),630,50,60,'#25110a'),1)
    +'<path d="M0 640Q300 600 520 625T1000 610T1600 630V900H0Z" fill="#221009"/>'
    +'<path d="M370 700Q560 410 800 395Q1040 410 1230 700Z" fill="#160a06"/><path d="M420 700Q590 450 800 440" stroke="#5a2a14" stroke-opacity=".5" stroke-width="5" fill="none"/>';
    for(let i=0;i<50;i++){ const t=r(), x=420+t*760, y=700-Math.sin(t*Math.PI)*(290*(.92+r()*.08))+r()*10; o+='<path d="M'+x.toFixed(0)+' '+y.toFixed(0)+'l'+(r()*6-3).toFixed(1)+' -12" stroke="#2a140a" stroke-width="2"/>'; }
    o+='<path d="M755 700V612Q800 578 845 612V700Z" fill="#050202"/>'+scGlow(800,655,46,'#ff7a2c',.5)
      +'<g stroke="#ff7a2c" stroke-width="2" fill="none" class="sc-flk" opacity=".7"><path d="M755 640L700 620L660 640M845 630L900 610L935 625M800 578L790 520L805 480M770 600L735 560"/></g>'
      +'<g fill="#100806">'+[[330,700,40,120],[440,690,34,150],[1160,690,34,150],[1270,700,40,120],[560,640,26,70],[1040,640,26,70]].map(([x,y,w,h])=>'<path d="M'+(x-w/2)+' '+y+'L'+(x-w*.4)+' '+(y-h)+'L'+(x+w*.35)+' '+(y-h*1.04)+'L'+(x+w/2)+' '+y+'Z"/>').join('')+'</g>'
      +'<g stroke="#ff8a3c" stroke-opacity=".45" stroke-width="1.5" class="sc-flk">'+[[440,600],[1160,600],[330,640],[1270,640]].map(([x,y])=>'<path d="M'+(x-5)+' '+y+'l5-8 5 8M'+x+' '+(y+12)+'v-6"/>').join('')+'</g>'
      +scPar(scMist('mB',640,150,'#6a3020',.15),1)
      +'<g fill="#0d0605"><path d="M118 790V520H123V790ZM1478 790V520H1483V790Z"/></g>'+(q=>scSway(scBanner(q,142,524,40,120,'#3a1a10','#c8783a')+scBanner(q,1502,524,40,120,'#3a1a10','#c8783a')))(scRand(303))
      +'<path d="M0 780Q500 740 800 760T1600 750V900H0Z" fill="#0d0605"/>'+scBrazier(250,800,1,'#080403')+scBrazier(1350,796,1,'#080403');
    for(let i=0;i<70;i++){ const x=r()*1600, y=770+r()*130; o+='<path d="M'+x.toFixed(0)+' '+y.toFixed(0)+'q'+(r()*6-3).toFixed(1)+' -10 '+(r()*10-5).toFixed(1)+' -'+(12+r()*14).toFixed(0)+'" stroke="#1e100a" stroke-width="1.6" fill="none"/>'; }
    o+='<g fill="#2a1a12">'+[[220,840],[1380,830],[620,860],[1020,870]].map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="11" ry="9"/><path d="M'+(x+10)+' '+(y+2)+'l40 -6M'+(x+12)+' '+(y+6)+'l34 4" stroke="#2a1a12" stroke-width="3"/>').join('')+'</g>'
      +'<g stroke="#120a06" stroke-width="4">'+[[300,900,330,760],[1300,900,1270,770],[1450,900,1480,800]].map(([a,b,c,d])=>'<path d="M'+a+' '+b+'L'+c+' '+d+'"/>').join('')+'</g>'
      +scMotes(r,46,'#ff9a48',260,880,'sc-ember')+'<g stroke="#b8a898" stroke-opacity=".09" stroke-width="1.5">'+Array.from({length:60},()=>'<path d="M'+(r()*1600).toFixed(0)+' '+(r()*900).toFixed(0)+'l-8 18"/>').join('')+'</g>'
      +scFog(720,.14,'#8a5a40',1100);
    return o; },
  g3:()=>{ const r=scRand(8); let o='<defs>'+scSky('skH','#090807','#181412','#211b17')+'<linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0d098" stop-opacity=".26"/><stop offset="1" stop-color="#f0d098" stop-opacity="0"/></linearGradient></defs><rect width="1600" height="900" fill="url(#skH)"/>';
    const glass=['#8a3020','#9a7a30','#3f6230','#7a4220','#9a8a52'];
    o+='<circle cx="800" cy="210" r="112" fill="#0c0a09"/>';
    for(let i=0;i<12;i++){ const a=i*Math.PI/6, a2=a+Math.PI/6; o+='<path d="M800 210L'+(800+100*Math.cos(a)).toFixed(1)+' '+(210+100*Math.sin(a)).toFixed(1)+'A100 100 0 0 1 '+(800+100*Math.cos(a2)).toFixed(1)+' '+(210+100*Math.sin(a2)).toFixed(1)+'Z" fill="'+glass[i%5]+'" opacity=".3" stroke="#0c0a09" stroke-width="7"/>'; }
    for(let i=0;i<12;i++){ const a=(i+.5)*Math.PI/6; o+='<circle cx="'+(800+70*Math.cos(a)).toFixed(1)+'" cy="'+(210+70*Math.sin(a)).toFixed(1)+'" r="9" fill="#0c0a09"/><circle cx="'+(800+70*Math.cos(a)).toFixed(1)+'" cy="'+(210+70*Math.sin(a)).toFixed(1)+'" r="5" fill="'+glass[(i+2)%5]+'" opacity=".35"/>'; }
    o+=scGlow(800,210,90,'#c8a060',.12)+scPar(scArcade(700,280,120,'#0a0908',.55,10));
    o+='<circle cx="800" cy="210" r="30" fill="#9a7a30" opacity=".35" stroke="#0c0a09" stroke-width="6"/><circle cx="800" cy="210" r="100" fill="none" stroke="#0c0a09" stroke-width="8"/>';
    [[480,120,560],[1120,120,560],[260,90,420],[1340,90,420]].forEach(([x,w,h],i)=>{ o+=scGothic(x,700,w+24,h+24,'#0c0a09')+scGothic(x,690,w,h,glass[(i+1)%5]).replace('fill=','opacity=".46" fill=');
      o+='<path d="M'+x+' '+(690-h)+'V690M'+(x-w/2)+' '+(690-h*.45)+'H'+(x+w/2)+'M'+(x-w/2)+' '+(690-h*.2)+'H'+(x+w/2)+'" stroke="#0c0a09" stroke-width="'+(w*.06)+'"/>'
        +'<path d="M'+(x-w*.3)+' '+(690-h*.7)+'l'+(w*.25)+' '+(h*.08)+'l'+(-w*.12)+' '+(h*.1)+'Z" fill="#0c0a09"/>'; });
    o+='<path d="M720 300L880 300L1160 900H440Z" fill="url(#shaft)" class="sc-flk"/><path d="M440 560L520 560L700 900H300Z" fill="url(#shaft)" opacity=".7"/><path d="M1080 560L1160 560L1300 900H900Z" fill="url(#shaft)" opacity=".7"/>'
      +scMotes(r,30,'#f0d8a8',320,860)
      +scPillars(4,760,'#0b0a09',100)+scTorch(222,470,.9)+scTorch(1378,470,.9)
      +(q=>scSway(scBanner(q,370,50,40,230,'#2a1410','#9a7a30')+scBanner(q,1230,50,40,230,'#2a1410','#9a7a30')
        +[150,1450].map(x=>scChain(x,0,320,'#0a0908',2.6)+'<path d="M'+(x-12)+' 330H'+(x+12)+'L'+(x+8)+' 350H'+(x-8)+'Z" fill="#0a0908"/>'+scGlow(x,346,26,'#e8a050',.14)).join('')))(scRand(108))
      +scPar(scMist('mH',650,170,'#c8b890',.09),1)
      +'<path d="M800 0V120" stroke="#0a0908" stroke-width="2"/><path d="M740 120H860L840 136H760Z" fill="#0a0908"/>'+[750,780,820,850].map(x=>scFlame(x,120,.6)).join('')
      +'<path d="M740 660H860V700H740Z" fill="#0d0b0a"/>'+scFlame(760,660,.55)+scFlame(840,660,.55)
      +'<path d="M0 760H1600V900H0Z" fill="#0c0a09"/>'+scTiles(700,900,'#18140f',7);
    for(let i=0;i<5;i++){ const y=790+i*24, w=300+i*90; o+='<rect x="'+(560-w/2-40)+'" y="'+y+'" width="'+w+'" height="12" fill="#070606"/><rect x="'+(1040-w/2+40)+'" y="'+y+'" width="'+w+'" height="12" fill="#070606"/>'; }
    return o+scFog(760,.12,'#c8b890',1100); },
  g4:()=>{ const r=scRand(11); let o='<defs>'+scSky('skO','#0b0c07','#232812','#353a18')+'</defs><rect width="1600" height="900" fill="url(#skO)"/>'+scStars(r,40,300)
    +scGlow(920,470,240,'#c8c070',.2)+'<circle cx="920" cy="470" r="92" fill="#b8b070" opacity=".32"/>'
    +scPar(scRidge(scRand(111),600,95,100,'#1c200e',.85)+scRuin(1380,600,100,140,'#181b0c',1)+scRuin(190,604,80,110,'#181b0c'))
    +'<path d="M0 620Q400 590 800 610T1600 600V900H0Z" fill="#171a0b"/>';
    [[.35,640,'#1d2110'],[.55,690,'#14170a'],[.8,760,'#0d0e07']].forEach(([k,y,c])=>{ for(let i=0;i<7;i++){ const x=80+i*240+(k*170)%240+r()*40; o+=scTree(r,x,y,160+260*k,c,true); } o+=scFog(y-20,.08+k*.05,'#a8a878',1200,k>.5?1:0); });
    o+=scPar(scMist('mO',560,170,'#a8a878',.09),1)
      +scSway('<g stroke="#0a0a06" stroke-width="2">'+[[300,390,450],[1290,400,470]].map(([x,a,b])=>'<path d="M'+x+' '+a+'V'+b+'"/>').join('')+'</g>'
      +[[300,450],[1290,470]].map(([x,y])=>'<path d="M'+(x-16)+' '+y+'H'+(x+16)+'V'+(y+46)+'Q'+x+' '+(y+56)+' '+(x-16)+' '+(y+46)+'Z" fill="none" stroke="#0a0a06" stroke-width="3"/><path d="M'+(x-8)+' '+y+'V'+(y+50)+'M'+x+' '+y+'V'+(y+53)+'M'+(x+8)+' '+y+'V'+(y+50)+'" stroke="#0a0a06" stroke-width="2"/>').join(''))
      +scCrow(640,420,1.1,'#0a0a06')+scCrow(700,400,.9,'#0a0a06')+scCrow(1100,380,1,'#0a0a06')
      +'<path d="M0 820H1600V900H0Z" fill="#080905"/><g fill="#0b0b0b">'; for(let x=10;x<1600;x+=34) o+='<path d="M'+x+' 900V770L'+(x+4)+' 756L'+(x+8)+' 770V900Z"/>'; o+='</g><path d="M0 790H1600M0 850H1600" stroke="#0b0b0b" stroke-width="6"/>';
    o+='<g>'+Array.from({length:14},()=>{ const x=r()*1600, y=860+r()*36; return '<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="3" fill="#6a1a10"/><circle cx="'+(x-1).toFixed(0)+'" cy="'+(y-1).toFixed(0)+'" r="1" fill="#e8a080" opacity=".5"/>'; }).join('')+'</g>';
    return o+scFog(830,.12,'#8a8a60',1200,1)+scMotes(r,18,'#d0d0a0',300,800); },
  g5:()=>{ const r=scRand(5); let o='<defs>'+scSky('skA','#0a0908','#1e1a16','#2c2520')+'<linearGradient id="shaftA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8dec6" stop-opacity=".2"/><stop offset="1" stop-color="#e8dec6" stop-opacity="0"/></linearGradient></defs><rect width="1600" height="900" fill="url(#skA)"/>'+scGlow(800,430,280,'#d8c8a0',.14)
    +scPar(scArcade(720,300,140,'#0c0b0a',.5,12))
    +scPillars(5,720,'#0c0b0a',120)
    +scSway([340,1260,520,1080].map((x,i)=>'<path d="M'+(x-30)+' 200H'+(x+30)+'V'+(470+i*20)+'L'+(x+10)+' '+(450+i*20)+'L'+x+' '+(480+i*20)+'L'+(x-14)+' '+(455+i*20)+'L'+(x-30)+' '+(475+i*20)+'Z" fill="#3a1812" opacity=".8"/><path d="M'+(x-12)+' 240L'+x+' 220L'+(x+12)+' 240L'+x+' 290Z" fill="#8a6a2a" opacity=".35"/>').join('')
      +scChain(190,0,330,'#0a0908',3)+scChain(250,0,240,'#0a0908',2.4)+scChain(1410,0,320,'#0a0908',3)+scChain(1350,0,230,'#0a0908',2.4))
    +scPar(scMist('mA',630,150,'#b8b0a0',.09),1)
    +'<path d="M720 0L880 0L960 720H640Z" fill="url(#shaftA)" class="sc-flk"/>'
    +'<path d="M520 720H1080L1040 690H560ZM580 690H1020L985 662H615ZM635 662H965L935 636H665Z" fill="#14120f"/><path d="M560 690H1040M615 662H985M665 636H935" stroke="#4a4238" stroke-opacity=".4" stroke-width="2"/>'
    +'<path d="M754 636V430L763 392L772 418L786 358L800 300L814 358L828 418L837 392L846 430V636Z" fill="#080706"/><path d="M722 572H878V594H722ZM724 594V528H744V594ZM856 594V528H876V594ZM730 594H870V636H730Z" fill="#080706"/><path d="M800 300L814 358L828 418L837 392L846 430V560" stroke="#e8dec6" stroke-opacity=".12" stroke-width="3" fill="none"/>'
    +[[520,700],[1080,700]].map(([x,y])=>'<path d="M'+(x-18)+' '+y+'L'+(x-10)+' '+(y-60)+'H'+(x+10)+'L'+(x+18)+' '+y+'Z" fill="#0a0908"/><path d="M'+(x-22)+' '+(y-60)+'H'+(x+22)+'L'+(x+16)+' '+(y-74)+'H'+(x-16)+'Z" fill="#0a0908"/>'+scFlame(x,y-74,1.6)+scGlow(x,y-90,70,'#ff9a40',.18)).join('')
    +'<path d="M0 720H1600V900H0Z" fill="#0e0d0b"/>'+scTiles(720,900,'#1e1b17',6)
    +'<g fill="#bfb49c" opacity=".55">'+Array.from({length:26},(_,i)=>{ const side=i%2?1:-1, x=800+side*(140+r()*170), y=715+r()*30; return '<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="'+(5+r()*3).toFixed(1)+'"/>'; }).join('')+'</g>'
    +'<g fill="#1a1714">'+Array.from({length:26},(_,i)=>{ const side=i%2?1:-1, x=800+side*(140+r()*170), y=717+r()*30; return '<circle cx="'+(x-2).toFixed(0)+'" cy="'+y.toFixed(0)+'" r="1.4"/><circle cx="'+(x+2).toFixed(0)+'" cy="'+y.toFixed(0)+'" r="1.4"/>'; }).join('')+'</g>'
    +scRuin(120,900,200,260,'#0b0a09')+scRuin(1480,900,190,240,'#0b0a09',1)
    +scMotes(r,80,'#cfc4b0',0,900,'sc-ash');
    return o+scFog(720,.13,'#b8b0a0',1100); },
  rift:()=>{ const r=scRand(13); let o='<defs><radialGradient id="rf" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#3a120c"/><stop offset=".5" stop-color="#120706"/><stop offset="1" stop-color="#040202"/></radialGradient></defs><rect width="1600" height="900" fill="url(#rf)"/>'+scStars(r,110,900)
      +[[420,300,260,'#4a140e'],[1180,560,300,'#3a100a'],[800,140,220,'#5a1a10'],[300,700,240,'#2a0c08']].map(([x,y,w,c])=>'<ellipse class="sc-fog" cx="'+x+'" cy="'+y+'" rx="'+w+'" ry="'+(w*.45)+'" fill="'+c+'" opacity=".45" filter="url(#scB)"/>').join('');
    let d='M800 40', pts=[[800,40]]; for(let y=100;y<=860;y+=60){ const x=800+(r()-.5)*(y<450?150:210); d+='L'+x.toFixed(0)+' '+y; pts.push([x,y]); }
    let br=''; pts.forEach(([x,y],i)=>{ if(i%3===1){ const dir=r()<.5?-1:1; br+='M'+x.toFixed(0)+' '+y+'l'+(dir*(40+r()*60)).toFixed(0)+' '+(10+r()*30).toFixed(0)+'l'+(dir*(20+r()*30)).toFixed(0)+' '+(r()*30-10).toFixed(0); } });
    o+=scGlow(800,450,300,'#e8564a',.22)+'<path d="'+d+'" stroke="#e8564a" stroke-width="34" fill="none" opacity=".22" filter="url(#scB2)"/><path d="'+d+br+'" stroke="#ff8a6a" stroke-width="6" fill="none" opacity=".55" filter="url(#scB2)"/><path d="'+d+'" stroke="#ffe0c8" stroke-width="3" fill="none" class="sc-flk"/><path d="'+br+'" stroke="#ffd0b0" stroke-width="1.4" fill="none" class="sc-flk"/>';
    for(let i=0;i<16;i++){
      const x=r()*1600, y=r()*820, s=18+r()*70, lit=x<800?1:-1;
      o+='<g class="sc-fog'+(i%2?' d2':'')+'"><path d="M'+x.toFixed(0)+' '+y.toFixed(0)+'l'+s.toFixed(0)+' '+(-s*.3).toFixed(0)+'l'+(s*.45).toFixed(0)
        +' '+(s*.6).toFixed(0)+'l'+(-s*.95).toFixed(0)+' '+(s*.42).toFixed(0)+'Z" fill="#0b0605"/><path d="M'+(lit>0?x+s:x).toFixed(0)+' '
        +(lit>0?y-s*.3:y).toFixed(0)+'l'+(lit>0?s*.45:-s*.5).toFixed(0)+' '+(s*.6).toFixed(0)
        +'" stroke="#e8564a" stroke-opacity=".55" stroke-width="2" fill="none"/></g>';
    }
    return o+scPar(scRuin(258,340,120,150,'#0b0605')+scRuin(1350,270,90,120,'#0b0605',1)+'<path d="M176 340H344L310 362H210Z" fill="#0b0605"/><path d="M1286 270H1414L1390 288H1310Z" fill="#0b0605"/>')
      +scPar(scMist('mF',700,200,'#a04030',.1),1)+scMotes(r,40,'#ffb090',0,900,'sc-ember')+scFog(800,.12,'#a04030',1100); }
};
for(const k in BACKDROPS){ const f=BACKDROPS[k]; BACKDROPS[k]=()=>scCalm(f()); }   // reduced motion: a still scene, no drifting motes
// ===== BOSS ARENAS =====
// Every boss, Tower warden and secret master fights in front of its own painted arena (scene key 'b:'+name), built on a
// shared frame: a dark ground lit from behind the boss in its own colours (BOSS_LOOK), one signature motif, a floor,
// drifting motes and a vignette. When the boss falls, the gate or Tower backdrop returns.
function arFrame(name,r,motif,motes){
  const L=BOSS_LOOK[name]||['#1a1714','#8a7a5a'], c1=L[0], c2=L[1];
  return '<defs><radialGradient id="arG" cx="50%" cy="44%" r="72%"><stop offset="0" stop-color="'+c2+'" stop-opacity=".55"/><stop offset=".38" stop-color="'+c1+'"/><stop offset="1" stop-color="#030202"/></radialGradient>'
    +'<linearGradient id="arF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c1+'"/><stop offset="1" stop-color="#030202"/></linearGradient>'
    +'<linearGradient id="arS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c2+'" stop-opacity=".22"/><stop offset="1" stop-color="'+c2+'" stop-opacity="0"/></linearGradient></defs>'
    +'<rect width="1600" height="900" fill="url(#arG)"/>'+scGlow(800,400,260,c2,.22)+motif(c1,c2)
    +'<path d="M0 760Q800 720 1600 760V900H0Z" fill="url(#arF)"/><path d="M0 760Q800 720 1600 760" stroke="'+c2+'" stroke-opacity=".22" stroke-width="2" fill="none"/>'
    +'<ellipse cx="800" cy="770" rx="420" ry="40" fill="'+c2+'" opacity=".1" filter="url(#scB)"/><ellipse cx="800" cy="830" rx="90" ry="70" fill="'+c2+'" opacity=".1" filter="url(#scB)"/>'
    +'<g stroke="#000" stroke-opacity=".55" stroke-width="2.2" fill="none">'+Array.from({length:9},(_,i)=>{ const th=Math.PI*(.06+i*.11), len=260+r()*260; let x=800, y=790, d='M800 790'; for(let k=0;k<4;k++){ const t=th+(r()-.5)*.35; x+=Math.cos(t)*len/4; y+=Math.sin(t)*len/16+r()*4; d+='L'+x.toFixed(0)+' '+y.toFixed(0); } return '<path d="'+d+'"/>'; }).join('')+'</g>'
    +'<g fill="#050403">'+Array.from({length:16},()=>{ const x=r()*1600, y=790+r()*100, w=6+r()*16; return '<path d="M'+x.toFixed(0)+' '+y.toFixed(0)+'l'+w.toFixed(0)+' -'+(w*.6).toFixed(0)+'l'+(w*.8).toFixed(0)+' '+(w*.6).toFixed(0)+'Z"/>'; }).join('')+'</g>'
    +scSmoke(180,800,320)+scSmoke(1420,800,300)+scSmoke(260,820,240)
    +scMotes(r,motes&&motes[0]||28,motes&&motes[1]||c2,120,880,motes&&motes[2]||'sc-mote')+scFog(770,.12,c2,1000);
}
const arRing=(cx,cy,rr,c,w,o,cls)=>'<circle'+(cls?' class="'+cls+'"':'')+' cx="'+cx+'" cy="'+cy+'" r="'+rr+'" fill="none" stroke="'+c+'" stroke-width="'+(w||3)+'" opacity="'+(o==null?.5:o)+'"/>';
const arChain=(x1,y1,x2,y2,c)=>'<path d="M'+x1+' '+y1+'L'+x2+' '+y2+'" stroke="'+(c||'#0c0a09')+'" stroke-width="7" stroke-dasharray="12 5"/><path d="M'+x1+' '+y1+'L'+x2+' '+y2+'" stroke="#000" stroke-opacity=".5" stroke-width="2" stroke-dasharray="12 5" stroke-dashoffset="6"/>';
const arSil=(d,o)=>'<path d="'+d+'" fill="#050403"'+(o!=null?' opacity="'+o+'"':'')+'/>';
const arEyes=(r,n,c,y0,y1)=>{ let o='<g fill="'+c+'" class="sc-flk">'; for(let i=0;i<n;i++){ const x=r()*1600, y=y0+r()*(y1-y0); if(x>560&&x<1040&&y<640) continue; o+='<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="2.2"/><circle cx="'+(x+9).toFixed(0)+'" cy="'+y.toFixed(0)+'" r="2.2"/>'; } return o+'</g>'; };
const ARENAS={
 'The Rat King':(r)=>arFrame('The Rat King',r,(c1,c2)=>{ let o='';
   for(let i=0;i<40;i++){ const a=Math.PI*(1.05+i/40*.9), rr=330+r()*30; o+='<path d="M'+(800+Math.cos(a)*140)+' '+(620+Math.sin(a)*140)+'L'+(800+Math.cos(a)*rr).toFixed(0)+' '+(620+Math.sin(a)*rr).toFixed(0)+'" stroke="#d8ccb0" stroke-opacity=".22" stroke-width="'+(6+r()*6).toFixed(0)+'" stroke-linecap="round"/>'; }
   o+=arSil('M640 760V560Q640 470 700 440L800 380L900 440Q960 470 960 560V760Z')+arSil('M560 760V640H640V760ZM960 760V640H1040V760Z')
     +'<path d="M720 400L740 340L770 380L800 320L830 380L860 340L880 400Z" fill="#c8a24a" opacity=".55"/>'
     +arEyes(r,40,'#ff4a2c',300,760)+'<g fill="#0a0806">'+Array.from({length:18},()=>{ const x=r()*1600, y=780+r()*90; return '<ellipse cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" rx="18" ry="8"/><path d="M'+(x+16).toFixed(0)+' '+y.toFixed(0)+'q20 -4 30 8" stroke="#0a0806" stroke-width="2" fill="none"/>'; }).join('')+'</g>';
   return o; }),
 'The Crypt Warden':(r)=>arFrame('The Crypt Warden',r,(c1,c2)=>arSil('M520 760V300Q520 160 800 140Q1080 160 1080 300V760H980V320Q980 240 800 230Q620 240 620 320V760Z')
   +'<path d="M620 760V320Q620 240 800 230Q980 240 980 320V760Z" fill="'+c2+'" opacity=".12"/>'
   +'<circle cx="800" cy="430" r="70" fill="#050403"/><path d="M770 470H830L850 640H750Z" fill="#050403"/><circle cx="800" cy="430" r="40" fill="'+c2+'" opacity=".3" class="sc-flk"/>'
   +arChain(520,180,780,380)+arChain(1080,180,820,380)+arChain(560,760,760,520)+arChain(1040,760,840,520)
   +'<g stroke="#c8a24a" stroke-width="6" fill="none" opacity=".45">'+[[360,300],[1240,320],[420,520],[1180,540]].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="22"/><path d="M'+(x+22)+' '+y+'H'+(x+70)+'M'+(x+56)+' '+y+'v14M'+(x+66)+' '+y+'v10"/>').join('')+'</g>'
   +'<path d="M0 720H1600V760H0Z" fill="#3a6a5a" opacity=".18"/>',[22,'#a8d8c8']),
 'The Ember Knight':(r)=>arFrame('The Ember Knight',r,(c1,c2)=>{ let o=arSil('M300 760V420L340 380L380 420V360L420 330L460 360V760ZM1140 760V360L1180 330L1220 360V420L1260 380L1300 420V760Z')
   +arSil('M620 760V480Q620 380 800 360Q980 380 980 480V760Z')+'<path d="M680 760V500Q680 430 800 420Q920 430 920 500V760Z" fill="#ff7a2c" opacity=".35" class="sc-flk"/>';
   for(let i=0;i<14;i++){ const x=380+i*64+r()*20, h=60+r()*60, a=r()*30-15; o+='<g transform="rotate('+a.toFixed(0)+' '+x.toFixed(0)+' 800)"><path d="M'+(x-3)+' 800V'+(800-h)+'L'+x+' '+(790-h)+'L'+(x+3)+' '+(800-h)+'V800Z" fill="#1a120e"/><path d="M'+(x-10)+' '+(805-h*.2)+'H'+(x+10)+'" stroke="#1a120e" stroke-width="4"/></g>'; }
   o+=[420,1180,700,900].map(x=>scFlame(x,340,3)).join('')+scGlow(800,560,200,'#ff6a1a',.25);
   return o; },[50,'#ffb050','sc-ember']),
 'The Bishop of Teeth':(r)=>arFrame('The Bishop of Teeth',r,(c1,c2)=>{ let o=arSil('M380 760V280Q380 90 800 70Q1220 90 1220 280V760H1120V300Q1120 170 800 160Q480 170 480 300V760Z');
   for(let i=0;i<22;i++){ const t=i/21, a=Math.PI*(1+t), x=800+Math.cos(a)*330, y=300+Math.sin(a)*150; o+='<path d="M'+(x-12).toFixed(0)+' '+(y-4).toFixed(0)+'L'+x.toFixed(0)+' '+(y+38).toFixed(0)+'L'+(x+12).toFixed(0)+' '+(y-4).toFixed(0)+'Z" fill="#e8dcc0" opacity=".55"/>'; }
   for(const sx of [-1,1]) for(let i=0;i<9;i++){ const x=800+sx*330, y=330+i*46; o+='<path d="M'+(x-sx*4)+' '+(y-14)+'L'+(x+sx*30)+' '+y+'L'+(x-sx*4)+' '+(y+14)+'Z" fill="#e8dcc0" opacity=".45"/>'; }
   o+=[620,980].map(x=>'<path d="M'+x+' 0V260" stroke="#0a0806" stroke-width="2"/><path d="M'+(x-20)+' 260H'+(x+20)+'L'+(x+14)+' 300H'+(x-14)+'Z" fill="#c8a24a" opacity=".6"/>'+scSmoke(x,300,160)).join('')
     +'<path d="M720 760V560L800 470L880 560V760Z" fill="#c8a24a" opacity=".22"/><path d="M800 500V640M760 560H840" stroke="#e8dcc0" stroke-opacity=".5" stroke-width="8"/>';
   return o; },[24,'#f0e0b0']),
 'The Orchard Mother':(r)=>arFrame('The Orchard Mother',r,(c1,c2)=>{ let o='<path d="M690 780C700 620 720 520 740 440C700 400 640 360 560 330C650 340 710 370 760 410C760 330 740 250 700 180C760 240 790 320 800 400C820 320 860 240 920 180C880 260 850 330 840 410C890 370 950 340 1040 330C960 360 900 400 860 440C880 520 900 620 910 780Z" fill="#0a0806"/>';
   o+='<ellipse cx="800" cy="210" rx="430" ry="190" fill="#1e2a10"/><ellipse cx="800" cy="210" rx="430" ry="190" fill="url(#arS)"/>';
   for(let i=0;i<40;i++){ const a=r()*Math.PI*2, d=Math.sqrt(r()); o+='<circle cx="'+(800+Math.cos(a)*400*d).toFixed(0)+'" cy="'+(210+Math.sin(a)*170*d).toFixed(0)+'" r="'+(6+r()*5).toFixed(1)+'" fill="#8a2416" opacity=".75"/>'; }
   o+='<ellipse cx="775" cy="520" rx="12" ry="16" fill="#ffb347" opacity=".7" class="sc-flk"/><ellipse cx="825" cy="520" rx="12" ry="16" fill="#ffb347" opacity=".7" class="sc-flk"/><path d="M780 580Q800 600 820 580" stroke="#000" stroke-width="10" fill="none"/>';
   for(let i=0;i<10;i++){ const sx=i%2?1:-1, x2=800+sx*(200+r()*600); o+='<path d="M800 780C'+(800+sx*80)+' 800 '+(x2-sx*120).toFixed(0)+' '+(820+r()*40).toFixed(0)+' '+x2.toFixed(0)+' '+(840+r()*50).toFixed(0)+'" stroke="#0a0806" stroke-width="'+(10+r()*12).toFixed(0)+'" fill="none" stroke-linecap="round"/>'; }
   return o; },[30,'#c8d890']),
 'The Pale Sovereign':(r)=>arFrame('The Pale Sovereign',r,(c1,c2)=>{ let o=arRing(800,330,170,c2,6,.35,'sc-flk')+arRing(800,330,210,c2,2,.2);
   for(let i=0;i<16;i++){ const a=i*Math.PI/8; o+='<path d="M'+(800+Math.cos(a)*180).toFixed(0)+' '+(330+Math.sin(a)*180).toFixed(0)+'L'+(800+Math.cos(a)*250).toFixed(0)+' '+(330+Math.sin(a)*250).toFixed(0)+'" stroke="'+c2+'" stroke-opacity=".18" stroke-width="3"/>'; }
   o+=arSil('M700 760V380L720 320L750 360L800 280L850 360L880 320L900 380V760Z')+arSil('M640 760V600H960V760Z')
     +'<path d="M720 300L740 250L770 285L800 230L830 285L860 250L880 300Z" fill="#e8c860" opacity=".6"/>';
   for(let i=0;i<10;i++){ const sx=i%2?1:-1, x=800+sx*(260+Math.floor(i/2)*110); o+='<path d="M'+(x-22)+' 760V640Q'+(x-22)+' 600 '+x+' 595Q'+(x+22)+' 600 '+(x+22)+' 640V760Z" fill="#0a0908" opacity=".85"/><circle cx="'+x+'" cy="585" r="14" fill="#0a0908" opacity=".85"/>'; }
   return o; },[26,'#f0e8d0']),
 'The Gate Hound':(r)=>arFrame('The Gate Hound',r,(c1,c2)=>{ let o='<g fill="#060404">'; for(let x=420;x<=1180;x+=60) o+='<rect x="'+(x-7)+'" y="120" width="14" height="640"/><path d="M'+(x-12)+' 130L'+x+' 96L'+(x+12)+' 130Z"/>'; o+='<rect x="400" y="200" width="800" height="16"/><rect x="400" y="600" width="800" height="16"/></g>';
   o+='<ellipse cx="740" cy="400" rx="40" ry="16" fill="#ff3a1a" class="sc-flk"/><ellipse cx="860" cy="400" rx="40" ry="16" fill="#ff3a1a" class="sc-flk"/><ellipse cx="740" cy="400" rx="10" ry="14" fill="#1a0402"/><ellipse cx="860" cy="400" rx="10" ry="14" fill="#1a0402"/>'
     +scGlow(800,400,160,'#ff3a1a',.18)+'<path d="M690 520L720 600L750 530L780 610L800 540L820 610L850 530L880 600L910 520" stroke="#e8dcc0" stroke-opacity=".35" stroke-width="6" fill="none"/>';
   for(let i=0;i<4;i++){ const x=200+i*30; o+='<path d="M'+x+' 300L'+(x+50)+' 520" stroke="#c83a2a" stroke-opacity=".4" stroke-width="6" stroke-linecap="round"/><path d="M'+(1300+i*30)+' 320L'+(1350+i*30)+' 540" stroke="#c83a2a" stroke-opacity=".4" stroke-width="6" stroke-linecap="round"/>'; }
   return o; },[40,'#ff7a40','sc-ember']),
 'Cinder Matron':(r)=>arFrame('Cinder Matron',r,(c1,c2)=>{ let o='';
   for(const sx of [-1,1]) for(let i=0;i<7;i++){
     const a=(-.15-i*.11)*Math.PI, len=420-i*30;
     o+='<path d="M800 420Q'+(800+sx*len*.5)+' '+(420+Math.sin(a)*len*.9).toFixed(0)+' '+(800+sx*len*Math.cos(a*.6)).toFixed(0)+' '
       +(420+Math.sin(a)*len*.6).toFixed(0)+'" stroke="#ff8a3c" stroke-opacity="'+(.35-i*.035).toFixed(2)+'" stroke-width="'+(14-i)
       +'" fill="none" stroke-linecap="round" class="sc-flk"/>';
   }
   o+='<ellipse cx="800" cy="790" rx="520" ry="60" fill="#ff6a1a" opacity=".5" class="sc-flk"/><ellipse cx="800" cy="790" rx="380" ry="38" fill="#ffc060" opacity=".45"/>'
     +[[700,790],[900,800],[620,810],[980,810]].map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="40" ry="8" fill="#3a1406"/>').join('')+arSil('M760 790V480Q760 440 800 430Q840 440 840 480V790Z',.9);
   for(let i=0;i<3;i++) o+=arRing(800,420,90+i*60,'#ffb050',2,.3-i*.08,'sc-flk');
   return o; },[60,'#ffb050','sc-ember']),
 'The Iron Inquisitor':(r)=>arFrame('The Iron Inquisitor',r,(c1,c2)=>{ let o=arRing(800,380,200,'#5a5a54',22,.9)+arRing(800,380,200,'#9a9a90',2,.4);
   for(let i=0;i<12;i++){ const a=i*Math.PI/6; o+='<path d="M800 380L'+(800+Math.cos(a)*200).toFixed(0)+' '+(380+Math.sin(a)*200).toFixed(0)+'" stroke="#3a3a36" stroke-width="10"/><path d="M'+(800+Math.cos(a)*200).toFixed(0)+' '+(380+Math.sin(a)*200).toFixed(0)+'l'+(Math.cos(a)*26).toFixed(0)+' '+(Math.sin(a)*26).toFixed(0)+'" stroke="#6a6a62" stroke-width="6"/>'; }
   o+='<circle cx="800" cy="380" r="34" fill="#2a2a26"/>'
     +[[420,760],[1180,760]].map(([x,y])=>'<path d="M'+(x-50)+' '+y+'V'+(y-260)+'Q'+x+' '+(y-330)+' '+(x+50)+' '+(y-260)+'V'+y
       +'Z" fill="#1a1a18"/><path d="M'+(x-30)+' '+(y-240)+'H'+(x+30)+'" stroke="#6a6a62" stroke-width="3"/>'
       +Array.from({length:5},(_,i)=>'<circle cx="'+(x-24+i*12)+'" cy="'+(y-150)+'" r="2.5" fill="#8a8a80"/>').join('')).join('')
     +scGear(560,250,60,'#2a2a26')+scGear(1050,230,46,'#2a2a26')+scGear(1180,420,38,'#2a2a26');
   return o; },[22,'#c8c8c0']),
 'Lord of Flies':(r)=>arFrame('Lord of Flies',r,(c1,c2)=>{ let o='';
   for(const x of [380,560,1040,1220]) o+='<path d="M'+(x-50)+' 760C'+(x-70)+' 600 '+(x-30)+' 400 '+x+' 260C'+(x+30)+' 400 '+(x+70)+' 600 '+(x+50)+' 760Z" fill="#1e2410"/>'+Array.from({length:6},(_,i)=>'<ellipse cx="'+x+'" cy="'+(320+i*70)+'" rx="'+(18+i*5)+'" ry="9" fill="#050403"/>').join('');
   o+='<g fill="#0a0c04">'; for(let i=0;i<380;i++){ const a=r()*Math.PI*2, d=Math.pow(r(),.6)*300; o+='<circle class="'+(i%3?'sc-mote':'sc-mote d2')+'" cx="'+(800+Math.cos(a)*d*1.3).toFixed(0)+'" cy="'+(400+Math.sin(a)*d*.8).toFixed(0)+'" r="'+(1+r()*2).toFixed(1)+'"/>'; } o+='</g>';
   o+='<path d="M0 790Q400 770 800 790T1600 790V900H0Z" fill="#3a4a10" opacity=".3"/>';
   return o; },[20,'#c8d870']),
 'The Bone Cantor':(r)=>arFrame('The Bone Cantor',r,(c1,c2)=>{ let o='';
   for(let i=0;i<15;i++){ const x=520+i*40, h=200+Math.sin(i/14*Math.PI)*260; o+='<rect x="'+(x-14)+'" y="'+(700-h)+'" width="28" height="'+h+'" rx="12" fill="#d8ccb0" opacity=".5"/><ellipse cx="'+x+'" cy="'+(700-h)+'" rx="16" ry="10" fill="#d8ccb0" opacity=".6"/><rect x="'+(x-8)+'" y="'+(640-h*.2)+'" width="16" height="10" fill="#050403"/>'; }
   o+='<rect x="480" y="700" width="640" height="60" fill="#0a0806"/>';
   for(let k=0;k<5;k++){ const y=140+k*16; o+='<path class="sc-fog'+(k%2?' d2':'')+'" d="M0 '+y+'Q400 '+(y-40)+' 800 '+y+'T1600 '+y+'" stroke="'+c2+'" stroke-opacity=".25" stroke-width="2" fill="none"/>'; }
   for(let i=0;i<10;i++){ const x=r()*1600, y=120+r()*90; o+='<ellipse cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" rx="8" ry="6" fill="'+c2+'" opacity=".45" class="sc-mote"/><path d="M'+(x+7).toFixed(0)+' '+y.toFixed(0)+'v-30" stroke="'+c2+'" stroke-opacity=".45" stroke-width="2" class="sc-mote"/>'; }
   return o; },[24,'#f0e0c0']),
 'Duke of Chains':(r)=>arFrame('Duke of Chains',r,(c1,c2)=>{ let o='';
   for(let i=0;i<16;i++){ const a=i*Math.PI/8+.2, x=800+Math.cos(a)*1000, y=400+Math.sin(a)*700; o+=arChain(800,400,x.toFixed(0),y.toFixed(0),'#5a4a3a'); }
   o+='<circle cx="800" cy="400" r="60" fill="#0a0806"/>'+arRing(800,400,60,c2,4,.5);
   for(const [x,y] of [[460,280],[1140,300],[620,520],[980,540]]) o+='<path d="M'+x+' 0V'+y+'" stroke="#0a0806" stroke-width="3"/><path d="M'+(x-30)+' '+y+'H'+(x+30)+'V'+(y+90)+'Q'+x+' '+(y+110)+' '+(x-30)+' '+(y+90)+'Z" fill="none" stroke="#0a0806" stroke-width="5"/>'+Array.from({length:4},(_,i)=>'<path d="M'+(x-18+i*12)+' '+y+'V'+(y+98)+'" stroke="#0a0806" stroke-width="3"/>').join('');
   return o; },[22,'#c8b090']),
 'The Pale Executioner':(r)=>arFrame('The Pale Executioner',r,(c1,c2)=>{ let o=arSil('M700 760V160H730V760ZM870 760V160H900V760ZM680 140H920V170H680Z')
   +'<path d="M730 240L870 200V300L730 330Z" fill="#c8c0b0" opacity=".65"/><path d="M730 330L870 300" stroke="#e8564a" stroke-opacity=".6" stroke-width="3"/>'
   +'<path d="M740 620H860V660H740Z" fill="#0a0606"/><path d="M780 620Q800 600 820 620" stroke="#0a0606" stroke-width="14" fill="none"/>'
   +'<path d="M640 760H960L930 680H670Z" fill="#1a0e0c"/><ellipse cx="800" cy="770" rx="160" ry="16" fill="#6a0e08" opacity=".7"/>'
   +'<g transform="rotate(-25 330 600)"><path d="M326 820V380H338V820Z" fill="#1a1210"/><path d="M338 380C420 380 450 440 440 520C400 480 370 470 338 480Z" fill="#b8b0a0" opacity=".6"/></g>'
   +'<g transform="rotate(25 1270 600)"><path d="M1262 820V380H1274V820Z" fill="#1a1210"/><path d="M1262 380C1180 380 1150 440 1160 520C1200 480 1230 470 1262 480Z" fill="#b8b0a0" opacity=".6"/></g>';
   return o; },[20,'#e0d0c0']),
 'Archdevil Vael':(r)=>arFrame('Archdevil Vael',r,(c1,c2)=>{ let o=arSil('M560 760C520 560 420 360 260 180C420 260 560 400 640 560C700 500 760 480 800 480C840 480 900 500 960 560C1040 400 1180 260 1340 180C1180 360 1080 560 1040 760Z');
   o+=arRing(800,600,180,'#ff5a2a',5,.55,'sc-flk')+arRing(800,600,140,'#ff5a2a',2,.4);
   for(let i=0;i<5;i++){ const a=-Math.PI/2+i*Math.PI*2/5, b=-Math.PI/2+(i+2)*Math.PI*2/5; o+='<path d="M'+(800+Math.cos(a)*170).toFixed(0)+' '+(600+Math.sin(a)*170).toFixed(0)+'L'+(800+Math.cos(b)*170).toFixed(0)+' '+(600+Math.sin(b)*170).toFixed(0)+'" stroke="#ff5a2a" stroke-opacity=".45" stroke-width="3"/>'; }
   o+='<ellipse cx="770" cy="560" rx="14" ry="6" fill="#ffd060" class="sc-flk"/><ellipse cx="830" cy="560" rx="14" ry="6" fill="#ffd060" class="sc-flk"/>'+[300,1300].map(x=>scFlame(x,760,5)).join('');
   return o; },[60,'#ff8040','sc-ember']),
 'The Hollow Seraph':(r)=>arFrame('The Hollow Seraph',r,(c1,c2)=>{ let o='';
   for(let i=0;i<7;i++){ const x=500+i*100; o+='<path d="M'+(x-20)+' 0H'+(x+20)+'L'+(x+70)+' 900H'+(x-30)+'Z" fill="url(#arS)" opacity=".7"/>'; }
   o+='<path d="M640 260A160 50 0 1 1 960 260" stroke="#f0d870" stroke-width="12" fill="none" opacity=".7" class="sc-flk"/><path d="M960 260A160 50 0 0 1 820 308" stroke="#f0d870" stroke-width="12" fill="none" opacity=".3"/>';
   for(const sx of [-1,1]) for(let i=0;i<8;i++){ const a=(.1+i*.09)*Math.PI; o+='<path d="M800 400Q'+(800+sx*220*Math.cos(a)).toFixed(0)+' '+(400-260*Math.sin(a)).toFixed(0)+' '+(800+sx*(420-i*18)*Math.cos(a*.8)).toFixed(0)+' '+(420-200*Math.sin(a)).toFixed(0)+'" stroke="#e8e0c8" stroke-opacity="'+(.3-i*.025).toFixed(2)+'" stroke-width="'+(16-i)+'" fill="none" stroke-linecap="round"/>'; }
   for(let i=0;i<22;i++){ const x=r()*1600, y=r()*800, a=r()*80-40; o+='<path class="sc-ash" transform="rotate('+a.toFixed(0)+' '+x.toFixed(0)+' '+y.toFixed(0)+')" d="M'+x.toFixed(0)+' '+y.toFixed(0)+'q6 -14 0 -30q-6 16 0 30" fill="#e8e0c8" opacity=".5"/>'; }
   return o; },[30,'#fff0c0']),
 'Abaddon, King of Hell':(r)=>arFrame('Abaddon, King of Hell',r,(c1,c2)=>{ let o='';
   for(let i=0;i<4;i++) o+=arRing(800,820,300+i*140,'#ff3a1a',8-i,.35-i*.06,'sc-flk');
   o+=arSil('M420 760C400 520 480 320 620 240C560 140 600 40 660 20C640 100 660 170 720 220C760 210 840 210 880 220C940 170 960 100 940 20C1000 40 1040 140 980 240C1120 320 1200 520 1180 760Z',.95)
     +'<ellipse cx="740" cy="330" rx="22" ry="9" fill="#ff5a1a" class="sc-flk"/><ellipse cx="860" cy="330" rx="22" ry="9" fill="#ff5a1a" class="sc-flk"/>'
     +arSil('M640 760V640H960V760Z')+[[560,640],[1040,640]].map(([x,y])=>scFlame(x,y,4)).join('');
   return o; },[80,'#ff6a2a','sc-ember']),
 'The Plague Matriarch':(r)=>arFrame('The Plague Matriarch',r,(c1,c2)=>{ let o='';
   for(let i=0;i<8;i++){ const x=200+i*170+r()*40, y=300+r()*300; o+='<ellipse class="sc-fog'+(i%2?' d2':'')+'" cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" rx="'+(120+r()*80).toFixed(0)+'" ry="'+(50+r()*30).toFixed(0)+'" fill="#7aa02a" opacity=".18" filter="url(#scB)"/>'; }
   o+=arSil('M600 760Q600 520 800 480Q1000 520 1000 760Z')+'<path d="M760 500L780 440L800 470L820 440L840 500Z" fill="#c8a24a" opacity=".5"/>'+arEyes(r,60,'#c8f050',280,760)
     +'<g fill="#0a0c06">'+Array.from({length:30},()=>{ const x=r()*1600, y=790+r()*80; return '<ellipse cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" rx="16" ry="7"/>'; }).join('')+'</g>';
   return o; },[40,'#c8f070']),
 'The Drowned Abbot':(r)=>arFrame('The Drowned Abbot',r,(c1,c2)=>{ let o='';
   for(let i=0;i<6;i++){ const x=420+i*152; o+='<path d="M'+(x-40)+' 760V'+(260+Math.abs(i-2.5)*40)+'Q'+x+' '+(200+Math.abs(i-2.5)*40)+' '+(x+40)+' '+(260+Math.abs(i-2.5)*40)+'V760Z" fill="#0a1612"/><path d="M'+(x-24)+' 760V'+(290+Math.abs(i-2.5)*40)+'Q'+x+' '+(250+Math.abs(i-2.5)*40)+' '+(x+24)+' '+(290+Math.abs(i-2.5)*40)+'V760Z" fill="#3a8a6a" opacity=".2"/>'; }
   for(let i=0;i<8;i++){ const x=420+i*110; o+='<path d="M'+x+' 0L'+(x+60)+' 900" stroke="#9ae0c0" stroke-opacity=".06" stroke-width="40"/>'; }
   o+='<g fill="none" stroke="#c8f0e0" stroke-opacity=".5">'+Array.from({length:40},()=>'<circle class="sc-ember" cx="'+(r()*1600).toFixed(0)+'" cy="'+(300+r()*580).toFixed(0)+'" r="'+(2+r()*6).toFixed(1)+'"/>').join('')+'</g>'
     +'<path d="M0 120Q400 90 800 120T1600 120" stroke="#9ae0c0" stroke-opacity=".25" stroke-width="3" fill="none" class="sc-fog"/>';
   return o; },[10,'#c8f0e0']),
 'The Cinder Wyrm':(r)=>arFrame('The Cinder Wyrm',r,(c1,c2)=>{ let o='<path d="M200 700C300 420 560 760 700 520C820 300 1100 600 1200 360C1260 220 1380 200 1420 280" stroke="#140604" stroke-width="90" fill="none" stroke-linecap="round"/>'
   +'<path d="M200 700C300 420 560 760 700 520C820 300 1100 600 1200 360C1260 220 1380 200 1420 280" stroke="#ff6a1a" stroke-opacity=".4" stroke-width="6" fill="none" stroke-dasharray="20 26" class="sc-flk"/>'
   +'<path d="M1380 250L1470 230L1450 290L1400 310Z" fill="#140604"/><ellipse cx="1440" cy="262" rx="8" ry="4" fill="#ffd060" class="sc-flk"/>';
   for(let i=0;i<12;i++){ const t=i/12, x=220+t*1180, y=560-Math.sin(t*9)*150; o+='<path d="M'+x.toFixed(0)+' '+(y-40).toFixed(0)+'l14 -40l14 40" fill="#140604"/>'; }
   return o+scGlow(800,700,300,'#ff6a1a',.2); },[60,'#ffa040','sc-ember']),
 'The Choir Eternal':(r)=>arFrame('The Choir Eternal',r,(c1,c2)=>{ let o='';
   for(let row=0;row<4;row++){
     const n=7+row*2, y=420+row*80, sc=.6+row*.2;
     for(let i=0;i<n;i++){
       const x=800+(i-(n-1)/2)*(110*sc);
       o+='<path d="M'+(x-24*sc).toFixed(0)+' '+(y+90*sc).toFixed(0)+'L'+(x-18*sc).toFixed(0)+' '+(y+10*sc).toFixed(0)+'Q'+x.toFixed(0)+' '
         +(y-34*sc).toFixed(0)+' '+(x+18*sc).toFixed(0)+' '+(y+10*sc).toFixed(0)+'L'+(x+24*sc).toFixed(0)+' '+(y+90*sc).toFixed(0)
         +'Z" fill="#0a0908" opacity="'+(.6+row*.1)+'"/><ellipse cx="'+x.toFixed(0)+'" cy="'+(y+12*sc).toFixed(0)+'" rx="'+(6*sc).toFixed(1)+'" ry="'
         +(8*sc).toFixed(1)+'" fill="'+c2+'" opacity=".35" class="sc-flk"/>';
     }
   }
   o+=arRing(800,200,90,c2,4,.4,'sc-flk')+'<path d="M760 0L840 0L900 420H700Z" fill="url(#arS)"/>';
   return o; },[26,'#fff4d8']),
 'The Rootking':(r)=>arFrame('The Rootking',r,(c1,c2)=>{ let o='';
   for(let i=0;i<26;i++){
     const x0=r()*1600, top=r()<.5;
     const y0=top?0:900, x1=800+(r()-.5)*300, y1=420+(r()-.5)*120;
     o+='<path d="M'+x0.toFixed(0)+' '+y0+'C'+(x0+(r()-.5)*300).toFixed(0)+' '+(top?200:700)+' '+(x1+(r()-.5)*300).toFixed(0)+' '
       +(y1+(top?-120:120)).toFixed(0)+' '+x1.toFixed(0)+' '+y1.toFixed(0)+'" stroke="#0c0e06" stroke-width="'+(8+r()*18).toFixed(0)
       +'" fill="none" stroke-linecap="round"/>';
   }
   o+='<path d="M720 380L740 300L770 350L800 270L830 350L860 300L880 380Z" fill="#6a8a2a" opacity=".5"/><circle cx="800" cy="420" r="70" fill="#0c0e06"/><ellipse cx="780" cy="410" rx="9" ry="12" fill="#c8e060" class="sc-flk"/><ellipse cx="820" cy="410" rx="9" ry="12" fill="#c8e060" class="sc-flk"/>';
   return o; },[30,'#c8e090']),
 'The Nameless Sovereign':(r)=>arFrame('The Nameless Sovereign',r,(c1,c2)=>{ let o='';
   for(let i=0;i<9;i++){ let d='M800 420', x=800, y=420; const a=i*Math.PI*2/9+r()*.3; for(let k=0;k<8;k++){ x+=Math.cos(a+(r()-.5)*.8)*70; y+=Math.sin(a+(r()-.5)*.8)*70; d+='L'+x.toFixed(0)+' '+y.toFixed(0); } o+='<path d="'+d+'" stroke="#e8564a" stroke-opacity=".55" stroke-width="3" fill="none" class="sc-flk"/>'; }
   o+='<ellipse cx="800" cy="420" rx="120" ry="160" fill="#050303"/><ellipse cx="800" cy="420" rx="120" ry="160" fill="none" stroke="#e8564a" stroke-opacity=".4" stroke-width="3"/>'
     +'<path d="M700 290L720 220L750 270L800 200L850 270L880 220L900 290Z" fill="#0a0606" stroke="#e8564a" stroke-opacity=".6" stroke-width="2"/>';
   return o; },[36,'#e8564a','sc-ember'])
};
function scGear(cx,cy,rr,c){ let o='<circle cx="'+cx+'" cy="'+cy+'" r="'+rr+'" fill="'+c+'"/>'; for(let i=0;i<10;i++){ const a=i*Math.PI/5; o+='<rect x="'+(cx-8)+'" y="'+(cy-rr-14)+'" width="16" height="20" fill="'+c+'" transform="rotate('+(a*180/Math.PI).toFixed(0)+' '+cx+' '+cy+')"/>'; } return o+'<circle cx="'+cx+'" cy="'+cy+'" r="'+(rr*.35)+'" fill="#050403"/>'; }
// Shared atmosphere laid over every backdrop and arena: high cloud drifting, soft light falling from above, a slow pulse of
// light behind the focus, and a grade (cooler and darker above, warmer below) so every place reads with depth.
const SC_TINT={town:'#e8c890',g0:'#e0b060',g1:'#80c0a8',g2:'#ff7a3c',g3:'#f0d098',g4:'#c8c870',g5:'#e8dec6',rift:'#e8564a',tower:'#ff5a2a'};
function scAtmos(k){
  const tint=k.startsWith('b:')?((BOSS_LOOK[k.slice(2)]||[])[1]||'#c8b890'):(SC_TINT[k]||'#c8b890'), r=scRand(k.length*31+7);
  let o='<defs><linearGradient id="atR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+tint+'" stop-opacity=".16"/><stop offset="1" stop-color="'+tint+'" stop-opacity="0"/></linearGradient>'
    +'<linearGradient id="atG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050608" stop-opacity=".24"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="'+tint+'" stop-opacity=".07"/></linearGradient></defs>';
  for(let i=0;i<4;i++){ const x=420+i*250+r()*80, w=60+r()*70, sk=-120+r()*240; o+='<path class="sc-ray'+(i%2?' d2':'')+'" d="M'+(x-w/2).toFixed(0)+' -20H'+(x+w/2).toFixed(0)+'L'+(x+w*1.6+sk).toFixed(0)+' 900H'+(x-w*1.6+sk).toFixed(0)+'Z" fill="url(#atR)"/>'; }
  for(let i=0;i<3;i++) o+='<ellipse class="sc-fog'+(i%2?' d2':'')+'" cx="'+(300+i*500)+'" cy="'+(70+i*45)+'" rx="'+(420+r()*200).toFixed(0)+'" ry="34" fill="#000" opacity=".35" filter="url(#scB)"/>';
  return o+'<circle class="sc-pulse" cx="800" cy="440" r="320" fill="'+tint+'" opacity=".07" filter="url(#scB)"/><rect width="1600" height="900" fill="url(#atG)"/>';
}
function sceneKey(){ if(VIEW.nobg) return ''; if(S.mode==='town') return ui.tab==='tower'?'tower':'town'; if(S.mode==='siege'||(S.run&&S.run.siege)) return 'town'; const r=S.run; const b=liveBoss(); if(b&&ARENAS[b.base]) return 'b:'+b.base; if(!r) return ''; if(r.tw) return 'tower'; return r.rift?'rift':'g'+r.di; }
function scene(){
  const el=document.getElementById('scene'); if(!el) return; const k=sceneKey();
  const boss=k.startsWith('b:'), build=boss?()=>scCalm(scLift(ARENAS[k.slice(2)](scRand(k.length*97+k.charCodeAt(2))),1.22)):()=>scLift(BACKDROPS[k]());
  document.body.classList.toggle('arena',boss);
  const ck=k&&k+(VIEW.calm?'|calm':'');   // reduced motion builds a still copy, so switching it rebuilds the scene
  if(el.dataset.k!==ck){ el.dataset.k=ck; el.innerHTML=k&&(boss?ARENAS[k.slice(2)]:BACKDROPS[k])?'<svg viewBox="0 0 '+SC_W+' '+SC_H+'" preserveAspectRatio="xMidYMax slice"><defs><filter id="scB" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="34"/></filter><filter id="scB2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter><radialGradient id="scV" cx="50%" cy="48%" r="75%"><stop offset=".58" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient></defs>'+build()+scCalm(scAtmos(k))+'<rect width="1600" height="900" fill="url(#scV)"/></svg>':''; }
  document.body.classList.toggle('towerscene',k==='tower'); document.body.classList.toggle('scened',!!k);   // a scene brings its own vignette
  el.classList.toggle('on',!!k);
}
// ----- display settings (per browser, not in the save): text size, reduced motion, high contrast
const LANGS={en:'English',tr:'Türkçe'};   // see LANGUAGE below
const VIEW={size:0,calm:false,hc:false,nobg:false,lang:'en',fx:'auto',army:'cards',fold:{}};
const FX_MODES={auto:'Auto',full:'Full',light:'Light'};
const fxLight=()=>VIEW.fx==='light'||(VIEW.fx==='auto'&&((window.innerWidth||1200)<=540||((typeof navigator!=='undefined'&&navigator.hardwareConcurrency)||8)<=4));   // phones and weak machines get the cheap painting
try{
  const v=JSON.parse(localStorage.getItem('lotd-view')||'null');
  if(v&&typeof v==='object'){
    VIEW.size=clamp(+v.size||0,-1,2);
    VIEW.calm=!!v.calm;
    VIEW.hc=!!v.hc;
    VIEW.nobg=!!v.nobg;
    VIEW.lang=LANGS[v.lang]?v.lang:'en';
    VIEW.fx=FX_MODES[v.fx]?v.fx:'auto';
    VIEW.army=v.army==='compact'?'compact':'cards';
    if(v.fold&&typeof v.fold==='object') for(const k of ['equip','quest','bounty','goal']) if(v.fold[k]) VIEW.fold[k]=true;
  }
  else { VIEW.calm=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches); if(window.innerWidth<=540) VIEW.fold={equip:true,bounty:true}; } }catch(e){}   // first visit on a phone: the side panel starts folded
const FOLD_NAME={equip:'Equipment',quest:'Daily quest',bounty:'Bounty board',goal:'What next'};
const foldBtn=k=>'<button class="fold" data-a="fold" data-k="'+k+'" aria-expanded="'+!VIEW.fold[k]+'" aria-label="'+(VIEW.fold[k]?'Show ':'Hide ')+FOLD_NAME[k]+'">'+(VIEW.fold[k]?'&#9662;':'&#9652;')+'</button>';
const foldCls=k=>VIEW.fold[k]?' folded':'';
