// ===== BATTLE EFFECTS (PixiJS layer) =====
// A transparent WebGL canvas over the battle cards that draws short strikes, sparks, wisps and ash. It only draws: no game
// rules, no Math.random (it has its own generator, so seeded tests and the balance bot see the same numbers), nothing saved.
// The library (lib/pixi.min.js, vendored) is loaded at runtime after the first render, and only while effects are allowed:
// Effects not Light, Reduce motion off, and the OS not asking for reduced motion. Without it (missing file, no WebGL, init
// error, or the Node test harness) every call below is a no-op and the game plays exactly as before.
// Game code calls fxe(kind, unit, opts) where it already logs a hit; render() calls fxSync() last, which loads or drops the
// layer and plays what this turn queued, placed on the cards by their data-u attribute (fxKey).
const FXL={st:'off',   // off | loading | init | ready | failed
  app:null,root:null,tex:null,live:[],pool:[],q:[],spy:null,tag:false,later:null,col:null,seed:0x2f6b1d,vis:false,
  MAX:300,QMAX:80};
const fxReduced=()=>{ try{ return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return true; } };
const fxWeak=()=>((typeof navigator!=='undefined'&&navigator.hardwareConcurrency)||8)<=4;
const fxAllowed=()=>{ try{ return !VIEW.calm&&!fxReduced()&&VIEW.fx!=='light'&&!(VIEW.fx==='auto'&&fxWeak()); }catch(e){ return false; } };   // Auto keeps them on phones (only the icon shading goes Light there), off on weak machines
function fxRnd(){ let x=FXL.seed; x^=x<<13; x^=x>>>17; x^=x<<5; FXL.seed=x>>>0; return FXL.seed/4294967296; }   // xorshift32: never touches Math.random
const fxR=(a,b)=>a+(b-a)*fxRnd();

// Called by game code at each combat moment. Cheap when the layer is not running: one check and out.
function fxe(kind,u,o){
  if(FXL.spy) try{ FXL.spy(kind,fxKey(u),o||null); }catch(e){}
  if(FXL.st!=='ready'||FXL.q.length>=FXL.QMAX) return;
  const k=fxKey(u); if(k==null) return;
  FXL.q.push({kind,k,o:o||null,r:fxRect(k)});   // the card's place now, in case the next render removes it (the last kill ends the battle screen)
}
function fxEl(k){ try{ return typeof app!=='undefined'&&app&&app.querySelector?app.querySelector('[data-u="'+k+'"]'):null; }catch(e){ return null; } }
function fxBox(el){ if(!el||!el.getBoundingClientRect) return null; const b=el.getBoundingClientRect(); return b.width>0&&b.height>0?{x:b.left,y:b.top,w:b.width,h:b.height}:null; }
const fxRect=k=>fxStageRect(k)||fxBox(fxEl(k));   // on the battle stage when it runs, else the card
const fxAll=sel=>{ try{ return Array.from(app.querySelectorAll(sel)).map(el=>fxRect(el.getAttribute('data-u'))).filter(Boolean); }catch(e){ return []; } };

// After every render: start loading, shut the layer when effects are switched off, or play the queue.
function fxSync(){
  try{ fxBeats(); }catch(e){} try{ fxSpoils(); }catch(e){}
  if(!fxAllowed()){ if(FXL.st==='ready'||FXL.st==='init') fxDrop(); else if(FXL.st==='loading') FXL.st='off'; FXL.q.length=0; return; }
  if(FXL.st==='off') fxLoad();
  else if(FXL.st==='ready'){ try{ fxStage(); }catch(e){} const hit=fxFlush(); try{ fxStageAfter(hit); }catch(e){} }
}
// Beats that need no PixiJS, read from the state after each render: a boss entering its second phase shakes the battle window
// and dims the room for a moment; a minion that just fell crumbles on its card. They only add CSS classes and a passing overlay.
const FXB={run:null,p1:new Set(),fell:new Set(),loot:null};
function fxBeats(){
  const r=typeof S!=='undefined'&&S&&S.run; if(!r||typeof app==='undefined'||!app||!app.querySelectorAll) return;
  const fresh=r!==FXB.run, dead=new Set(Array.from(app.querySelectorAll('.unit.ally.dead[data-u]')).map(el=>el.getAttribute('data-u')));
  if(fresh){ FXB.run=r; FXB.p1.clear(); }   // a new run (or a loaded save): learn who is down without replaying it
  let phase=null;
  for(const e of r.enemies||[]) if(e.boss){ if(e.phase2&&FXB.p1.has(e.id)){ FXB.p1.delete(e.id); phase=e; } else if(!e.phase2&&e.hp>0) FXB.p1.add(e.id); }   // a boss that starts in phase two (Nightmare) never shakes
  const fell=fresh?[]:[...dead].filter(k=>k!=='p'&&!FXB.fell.has(k)); FXB.fell=dead;
  if(fell.length) sfx('crumble');   // the sound plays even with motion effects off
  if(!fxAllowed()) return;
  fell.forEach(k=>{ const el=fxEl(k); if(el) el.classList.add('crumble'); });
  if(!phase) return;
  const w=app.querySelector('.main > .win'); if(w){ w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); }
  if(document.body&&document.createElement){ const d=document.createElement('div'); d.className='fx-dim'; d.setAttribute('aria-hidden','true'); document.body.appendChild(d); setTimeout(()=>d.remove(),800); }
  if(FXL.st==='ready'&&FXL.q.length<FXL.QMAX){ const k=fxKey(phase); FXL.q.push({kind:'boss',k,o:null,r:fxRect(k)}); }   // and the Pixi layer, when it runs, adds the boss flare
}
// The room's loot row (.loot-fly, spoilsHTML; no PixiJS): once per room the items pop in and fly into the bag mark and the gold counts up.
// Later renders of the same room show the bag already filled; Light effects and reduced motion show the row still, items beside the bag.
function fxSpoils(){
  const el=typeof app!=='undefined'&&app&&app.querySelector&&app.querySelector('.loot-fly'); if(!el||!fxAllowed()||el.classList.contains('go')) return;
  const k=el.getAttribute('data-k'); if(k===FXB.loot){ el.classList.add('done'); return; } FXB.loot=k;
  const bag=fxBox(el.querySelector('.lf-bag')), its=Array.from(el.querySelectorAll('.lf-i'));
  its.forEach((i,n)=>{ const b=fxBox(i); if(b&&bag){ i.style.setProperty('--dx',(bag.x+bag.w/2-b.x-b.w/2)+'px'); i.style.setProperty('--dy',(bag.y+bag.h/2-b.y-b.h/2)+'px'); } i.style.setProperty('--d',n*90+'ms'); });
  el.style.setProperty('--e',(its.length*90+1350)+'ms'); el.classList.add('go');
  const g=el.querySelector('.gold-up'), n=g?+g.getAttribute('data-n'):0;
  if(n>0&&window.requestAnimationFrame){ const t0=performance.now(), f=t=>{ const q=Math.min(1,(t-t0)/800); g.textContent=Math.round(n*(1-(1-q)*(1-q))).toLocaleString(); if(q<1&&g.isConnected) requestAnimationFrame(f); }; g.textContent='0'; requestAnimationFrame(f); }
}
function fxLoad(){
  if(typeof document==='undefined'||typeof document.createElement!=='function') return;   // the Node harness has no DOM to draw in
  if(window.PIXI){ fxInit(); return; }
  const host=document.head||document.body; if(!host||typeof host.appendChild!=='function') return;
  FXL.st='loading'; if(FXL.tag) return;   // the file is already on its way; its onload carries on
  (FXL.later||setTimeout)(()=>{   // after the first paint, so startup never waits on a 900 KB file
    if(FXL.st!=='loading'||FXL.tag) return;   // switched off meanwhile
    try{
      const s=document.createElement('script'); s.src='lib/pixi.min.js'; s.async=true;   // relative: works from the local server and from disk
      s.onload=()=>{ if(FXL.st!=='loading') return; if(window.PIXI) fxInit(); else fxFail('PixiJS did not define PIXI'); };
      s.onerror=()=>fxFail('lib/pixi.min.js could not be loaded');
      FXL.tag=true; host.appendChild(s);
    }catch(e){ fxFail(e&&e.message); }
  },0);
}
function fxFail(why){ FXL.st='failed'; FXL.q.length=0; try{ console.info('Battle effects are off: '+(why||'unavailable')+'. The game plays the same without them.'); }catch(e){} }
async function fxInit(){
  FXL.st='init';
  try{
    if(typeof PIXI.isWebGLSupported==='function'&&!PIXI.isWebGLSupported()) return fxFail('WebGL is not available');
    const a=new PIXI.Application();
    await a.init({backgroundAlpha:0,antialias:false,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true,resizeTo:window,
      autoStart:false,sharedTicker:false,preference:'webgl',powerPreference:'low-power',hello:false});
    if(FXL.st!=='init'||!fxAllowed()){ a.destroy({removeView:true},{children:true}); if(FXL.st==='init') FXL.st='off'; return; }   // switched off while it started
    a.ticker.stop();
    const cv=a.canvas; cv.id='fxl'; cv.setAttribute('aria-hidden','true'); cv.setAttribute('tabindex','-1');
    (document.querySelector('.wrap')||document.body).appendChild(cv);   // inside .wrap: above the cards, below the banners and overlays (see #fxl in style.css)
    FXL.app=a; FXL.root=new PIXI.Container(); a.stage.addChild(FXL.root);
    FXL.tex=fxTextures(a.renderer); FXL.col=fxColours();
    a.ticker.add(fxStep);
    if(!FXL.vis){ FXL.vis=true; document.addEventListener('visibilitychange',()=>{ if(document.hidden) fxClear(); else if(FXS.app&&FXS.app.canvas.isConnected) FXS.app.ticker.start(); }); }
    FXL.st='ready'; fxStageInit();
  }catch(e){ fxFail(e&&e.message); }
}
function fxDrop(){   // effects switched off: take the canvas and the WebGL context away entirely
  const a=FXL.app; fxClear(); FXL.st='off'; FXL.app=null; FXL.root=null; FXL.pool=[]; fxStageDrop();
  if(!a) return;
  try{ for(const k in FXL.tex) FXL.tex[k].destroy(true); }catch(e){}
  FXL.tex=null;
  try{ a.ticker.remove(fxStep); a.destroy({removeView:true},{children:true}); }catch(e){}
}
function fxClear(){   // drop every live effect and stop the ticker (tab hidden, layer dropped)
  FXL.q.length=0;
  for(const p of FXL.live) fxFree(p); FXL.live.length=0;
  const a=FXL.app; if(a) try{ a.render(); a.ticker.stop(); }catch(e){}
  if(FXS.app) try{ FXS.app.ticker.stop(); }catch(e){}
}

// ----- textures: drawn once with Graphics, no image files -----
function fxTextures(rd){
  const G=()=>new PIXI.Graphics(), T=g=>{ const t=rd.generateTexture({target:g,resolution:2}); g.destroy(); return t; };
  const dot=G(); for(let i=8;i>=1;i--) dot.circle(0,0,16*i/8).fill({color:0xffffff,alpha:.13});   // soft round glow
  const core=G().circle(0,0,4).fill(0xffffff);   // hard little ember
  const chip=G().poly([0,0,6,1.5,8,6,3,8.5,-1.5,4.5]).fill(0xffffff);   // a bone chip
  const streak=G().poly([0,6,40,0,96,4,100,6,96,8,40,12]).fill({color:0xffffff,alpha:.3}).poly([4,6,40,2.5,96,5.2,100,6,96,6.8,40,9.5]).fill(0xffffff);   // a tapered slash
  const ring=G().circle(0,0,30).stroke({width:8,color:0xffffff,alpha:.18}).circle(0,0,30).stroke({width:2.5,color:0xffffff,alpha:.9});
  return {dot:T(dot),core:T(core),chip:T(chip),streak:T(streak),ring:T(ring)};
}
function fxColours(){   // the page's own palette (CSS variables), never blue or purple
  const hex=(v,d)=>{ v=String(v||'').trim(); return /^#[0-9a-f]{6}$/i.test(v)?parseInt(v.slice(1),16):d; };
  let cs=null; try{ cs=getComputedStyle(document.documentElement); }catch(e){}
  const g=(n,d)=>cs?hex(cs.getPropertyValue(n),d):d;
  return {bone:g('--bone',0xe8dec6),ash:g('--mute',0x9a8f81),ember:g('--ember',0xe08a3c),soul:g('--soul',0x8fd46a),blood:g('--blood',0xb83a2a),gold:g('--gold',0xd3a64d),ward:g('--ward',0xddd3b8),soot:0x1c1410};
}

// ----- particles: pooled sprites, at most FXL.MAX alive (the oldest go first) -----
function fxFree(p){ const s=p.s; s.visible=false; if(s.parent) s.parent.removeChild(s); FXL.pool.push(s); }
function fxP(o){   // o: tex, x, y, tint, life (ms), and optionally delay, vx, vy (px/ms), g, a0, a1, sx0, sx1, sy0, sy1, rot, vr, add, fi, path
  const L=FXL.live; if(L.length>=FXL.MAX) fxFree(L.shift());
  const s=FXL.pool.pop()||new PIXI.Sprite(); s.texture=FXL.tex[o.tex]; s.anchor.set(.5); s.tint=o.tint; s.blendMode=o.add?'add':'normal'; s.visible=false; s.alpha=0;
  FXL.root.addChild(s);
  const sx0=o.sx0==null?1:o.sx0, sy0=o.sy0==null?sx0:o.sy0;
  const p={s,x:o.x,y:o.y,vx:o.vx||0,vy:o.vy||0,g:o.g||0,age:-(o.delay||0),life:o.life,a0:o.a0==null?1:o.a0,a1:o.a1||0,sx0,sy0,sx1:o.sx1==null?sx0:o.sx1,sy1:o.sy1==null?(o.sx1==null?sy0:o.sx1*(sy0/sx0)):o.sy1,rot:o.rot||0,vr:o.vr||0,fi:o.fi||0,path:o.path||null};
  L.push(p); return p;
}
function fxStep(tk){
  const dt=Math.min(50,tk.deltaMS), L=FXL.live;
  for(let i=L.length-1;i>=0;i--){
    const p=L[i], s=p.s; p.age+=dt;
    if(p.age<0) continue;
    const k=p.age/p.life; if(k>=1){ fxFree(p); L.splice(i,1); continue; }
    if(p.path){ const P=p.path, e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2, u=1-e; p.x=u*u*P[0]+2*u*e*P[2]+e*e*P[4]; p.y=u*u*P[1]+2*u*e*P[3]+e*e*P[5]; }
    else { p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; }
    p.rot+=p.vr*dt; const eo=1-(1-k)*(1-k);
    s.visible=true; s.x=p.x; s.y=p.y; s.rotation=p.rot;
    s.scale.set(p.sx0+(p.sx1-p.sx0)*eo,p.sy0+(p.sy1-p.sy0)*eo);
    s.alpha=(p.a0+(p.a1-p.a0)*k)*(p.fi&&k<p.fi?k/p.fi:1);
  }
  if(!L.length){ try{ FXL.app.render(); }catch(e){} FXL.app.ticker.stop(); }   // last frame drawn empty, then no more frames until the next effect
}
function fxGo(){ const a=FXL.app; if(a&&FXL.live.length&&!a.ticker.started) a.ticker.start(); }

// ----- the effects (all short: about 250-700 ms) -----
const fxC=r=>({x:r.x+r.w/2,y:r.y+r.h/2});
function fxChips(c,n,t,col,big){   // bone and ash chips thrown out and falling
  for(let i=0;i<n;i++){ const a=fxR(-Math.PI,0), v=fxR(.08,.22)*(big?1.4:1);
    fxP({tex:'chip',x:c.x+fxR(-6,6),y:c.y+fxR(-6,6),vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:.0009,life:fxR(380,620),delay:t,tint:i%3===0?col.ash:i%5===4&&big?col.gold:col.bone,sx0:fxR(.6,1.1)*(big?1.3:1),rot:fxR(0,6.3),vr:fxR(-.02,.02),a0:.9}); }
}
function fxSlash(r,t,col,crit){
  const c=fxC(r), len=Math.min(r.w,r.h)*(crit?1.25:1)/100;
  fxP({tex:'streak',x:c.x,y:c.y,rot:-.75,sx0:len*.25,sx1:len,sy0:crit?1.1:.8,sy1:crit?.7:.5,life:crit?320:260,delay:t,tint:col.bone,add:1,a0:.9});
  if(crit){ fxP({tex:'streak',x:c.x,y:c.y,rot:.65,sx0:len*.2,sx1:len*.85,sy0:.9,sy1:.5,life:300,delay:t+50,tint:col.gold,add:1,a0:.8});
    fxP({tex:'dot',x:c.x,y:c.y,sx0:r.w/40,sx1:r.w/22,life:320,delay:t,tint:col.gold,add:1,a0:.5}); }
  fxChips(c,crit?9:5,t+30,col,crit);
}
function fxSpark(r,t,col,n){
  const c=fxC(r), x=c.x+fxR(-r.w*.25,r.w*.25), y=c.y+fxR(-r.h*.2,r.h*.2);
  fxP({tex:'dot',x,y,sx0:.5,sx1:.9,life:220,delay:t,tint:col.ember,add:1,a0:.45});
  for(let i=0;i<n;i++){ const a=fxR(0,6.3), v=fxR(.06,.16); fxP({tex:'core',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:.0004,life:fxR(200,320),delay:t,tint:i%2?col.bone:col.ember,add:1,sx0:fxR(.35,.6),sx1:.15,a0:.9}); }
}
function fxHurt(r,t,col,o){
  const c=fxC(r), tint=o&&o.fire?col.ember:col.blood, big=o&&o.crit;
  fxP({tex:'dot',x:c.x,y:c.y,sx0:r.w/50,sy0:r.h/50,sx1:r.w/34,sy1:r.h/34,life:big?420:320,delay:t,tint,add:o&&o.fire?1:0,a0:big?.55:.4});
  for(let i=0;i<(big?7:4);i++){ const a=fxR(-2.6,-.5), v=fxR(.05,.14); fxP({tex:'core',x:c.x+fxR(-10,10),y:c.y+fxR(-8,8),vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:.0008,life:fxR(350,500),delay:t,tint,sx0:fxR(.4,.75),sx1:.3,a0:.85}); }
}
function fxSiphon(from,to,t,col,n){
  const a=fxC(from), b=fxC(to), dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1;
  for(let i=0;i<n;i++){ const bend=fxR(-.45,.45)*d, mx=(a.x+b.x)/2-dy/d*bend, my=(a.y+b.y)/2+dx/d*bend, path=[a.x+fxR(-12,12),a.y+fxR(-10,10),mx,my,b.x,b.y], life=fxR(440,600), dl=t+i*28;
    fxP({tex:'dot',x:a.x,y:a.y,path,life,delay:dl,tint:col.soul,add:1,sx0:.7,sx1:.35,a0:.5,a1:.15,fi:.2});
    fxP({tex:'core',x:a.x,y:a.y,path,life,delay:dl,tint:col.soul,add:1,sx0:.7,sx1:.4,a0:.95,a1:.4,fi:.15}); }
}
function fxWard(r,t,col,strong){
  const c=fxC(r);
  fxP({tex:'ring',x:c.x,y:c.y,sx0:r.w/64,sy0:r.h/64,sx1:r.w/56,sy1:r.h/56,life:strong?600:460,delay:t,tint:col.ward,add:1,a0:strong?.75:.5});
  for(let i=0;i<(strong?8:5);i++) fxP({tex:'core',x:r.x+fxR(.1,.9)*r.w,y:r.y+fxR(.2,.9)*r.h,vy:-fxR(.02,.05),life:fxR(350,520),delay:t+fxR(0,120),tint:col.ward,add:1,sx0:.45,sx1:.1,a0:.8,fi:.3});
}
function fxSpear(from,to,t,col){
  const a=fxC(from), b=fxC(to), ang=Math.atan2(b.y-a.y,b.x-a.x), fly=220;
  fxP({tex:'streak',x:a.x,y:a.y,path:[a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2,b.x,b.y],rot:ang,sx0:.9,sx1:1.1,sy0:.7,life:fly,delay:t,tint:col.bone,add:1,a0:.95,a1:.8});
  fxSlash(to,t+fly-20,col,false);
}
function fxDeath(r,t,col,ember){
  const c=fxC(r);
  fxP({tex:'dot',x:c.x,y:c.y,sx0:r.w/60,sx1:r.w/30,life:600,delay:t,tint:ember?col.ember:col.soot,add:ember?1:0,a0:ember?.35:.55});
  for(let i=0;i<14;i++) fxP({tex:i%3?'chip':'core',x:r.x+fxR(.15,.85)*r.w,y:r.y+fxR(.15,.6)*r.h,vx:fxR(-.03,.03),vy:fxR(-.06,.01),g:.0007,life:fxR(480,700),delay:t+fxR(0,80),tint:i%4===0?col.bone:ember&&i%2?col.ember:col.ash,sx0:fxR(.5,1),sx1:.4,rot:fxR(0,6.3),vr:fxR(-.012,.012),a0:.9});
}
function fxMotes(r,t,col,n,tint){
  for(let i=0;i<n;i++) fxP({tex:i%2?'core':'dot',x:r.x+fxR(.15,.85)*r.w,y:r.y+fxR(.5,.95)*r.h,vx:fxR(-.012,.012),vy:-fxR(.05,.11),life:fxR(560,700),delay:t+fxR(0,160),tint:tint||col.soul,add:1,sx0:i%2?fxR(.5,.8):fxR(.35,.55),sx1:.15,a0:i%2?.9:.4,fi:.25});
}
function fxWisp(r,t,col){
  const c=fxC(r);
  for(let i=0;i<2;i++) fxP({tex:'dot',x:c.x+fxR(-8,8),y:c.y,vy:-fxR(.025,.04),vx:fxR(-.01,.01),life:650,delay:t+i*90,tint:col.ash,sx0:.25,sy0:.9,sx1:.35,sy1:1.6,a0:.35,fi:.3});
}
function fxBoss(r,t,col){
  const c=fxC(r);
  fxP({tex:'dot',x:c.x,y:c.y,sx0:r.w/40,sx1:r.w/14,life:700,delay:t,tint:col.soot,a0:.7});
  fxP({tex:'ring',x:c.x,y:c.y,sx0:r.w/80,sx1:r.w/36,life:700,delay:t+60,tint:col.ember,add:1,a0:.35});
  for(let i=0;i<10;i++) fxP({tex:'core',x:r.x+fxR(.1,.9)*r.w,y:r.y+r.h*fxR(.7,1),vx:fxR(-.015,.015),vy:-fxR(.04,.09),life:fxR(500,700),delay:t+fxR(80,260),tint:i%3?col.ember:col.gold,add:1,sx0:fxR(.35,.6),sx1:.1,a0:.9,fi:.2});
}
function fxCharge(r,t,col){   // a boss gathers itself: embers drawn in from the card's edge and an ember ring closing on it, about 700 ms
  const c=fxC(r), R=Math.max(r.w,r.h)*.62;
  fxP({tex:'ring',x:c.x,y:c.y,sx0:r.w/34,sy0:r.h/34,sx1:r.w/90,sy1:r.h/90,life:700,delay:t,tint:col.ember,add:1,a0:.15,a1:.7,fi:.3});
  fxP({tex:'dot',x:c.x,y:c.y,sx0:r.w/90,sx1:r.w/36,life:700,delay:t+250,tint:col.blood,a0:.1,a1:.5,fi:.4});
  for(let i=0;i<14;i++){ const a=fxR(0,6.3), d=R*fxR(.85,1.15), x=c.x+Math.cos(a)*d, y=c.y+Math.sin(a)*d*.8, sw=fxR(-.35,.35);
    fxP({tex:'core',x,y,path:[x,y,c.x+(x-c.x)*.4-(y-c.y)*sw,c.y+(y-c.y)*.4+(x-c.x)*sw,c.x+fxR(-4,4),c.y+fxR(-4,4)],life:fxR(520,680),delay:t+fxR(0,140),tint:i%3?col.ember:col.blood,add:1,sx0:fxR(.35,.6),sx1:.2,a0:.95,a1:.3,fi:.25}); }
}
function fxUlt(e,r,col){   // one stronger version of the fitting effect, across the room
  const id=e.o&&e.o.id, foes=fxAll('.unit.foe[data-u]'), ours=fxAll('.unit.ally[data-u]');
  if(id==='toll') foes.forEach((f,i)=>{ fxSlash(f,i*40,col,true); fxDeath(f,i*40+120,col,true); });
  else if(id==='rise') ours.forEach((f,i)=>fxMotes(f,i*35,col,i?6:12));
  else (foes.length?foes:r?[r]:[]).forEach((f,i)=>fxWard(f,i*40,col,true));
}

// Plays the queued moments in order on a short clock, so a full army's turn reads as a flurry rather than one flash.
function fxFlush(){
  const q=FXL.q, hit={}; FXL.q=[]; if(!q.length) return hit;   // hit: when each unit is first struck this turn (the stage's numbers wait for it)
  const col=FXL.col, me=()=>fxRect('p'), nM=q.filter(e=>e.kind==='mhit').length, sparks=nM>8?2:nM>4?3:4;
  let t=0, prev=0;
  for(const e of q){
    if(t>1600) break;   // a very long turn: the rest would play long after the numbers changed
    const r=fxRect(e.k)||e.r; if(!r&&e.kind!=='ult') continue;
    let at=t;
    switch(e.kind){
      case 'strike': fxSlash(r,at,col,e.o&&e.o.crit); t+=120; break;
      case 'mhit': fxSpark(r,at,col,sparks); t+=nM>8?35:55; break;
      case 'hurt': fxHurt(r,at,col,e.o); t+=e.o&&e.o.fire?25:90; break;
      case 'siphon': { const m=me(); if(m) fxSiphon(r,m,at,col,7); t+=200; break; }
      case 'spear': { const m=me(); if(m) fxSpear(m,r,at,col); else fxSlash(r,at,col,false); t+=260; break; }
      case 'ward': fxWard(r,at,col,false); t+=30; break;
      case 'burst': fxDeath(r,at,col,true); t+=40; break;
      case 'death': at=prev+60; fxDeath(r,at,col,false); break;
      case 'raise': fxMotes(r,at,col,12); t+=110; break;
      case 'rfail': fxWisp(r,at,col); t+=110; break;
      case 'mend': fxMotes(r,at,col,8); break;
      case 'boss': fxBoss(r,at,col); break;
      case 'charge': fxCharge(r,at,col); t+=120; break;
      case 'ult': fxUlt(e,r,col); t+=300; break;
    }
    prev=at;
    if(HIT_K[e.kind]){ const h=hit[e.k]||(hit[e.k]={t:at,c:0}); if(e.o&&e.o.crit) h.c=1; try{ fxStageMove(e,at); }catch(x){} }
  }
  fxGo(); return hit;
}

// ===== THE BATTLE STAGE =====
// While the layer runs, the battle is shown on a second small canvas in .stage (battleHTML): the foes' back and front rows at the
// top, your front and back rows below, each fighter a sprite cut from its painted icon (ico(), rasterised once and cached by its
// markup) with a name plate, an HP bar, status marks and, on foes, the intent. It reads the state after each render and never
// changes it; clicking a foe goes through stageTap (ui-screens.js), the same action as its card. The cards fold into a compact
// strip (.win.staged) that stays in the DOM for screen readers and keyboards. Without the layer nothing here runs.
const FXS={app:null,root:null,floor:null,tex:null,col:null,f:new Map(),ico:new Map(),css:null,seen:null,h:0,W:0,t:0,ok:false,nums:[],font:['serif'],fontH:['serif'],rs:false};
const stageOn=()=>FXS.ok&&FXL.st==='ready'&&fxAllowed();
const HIT_K={strike:1,mhit:1,hurt:1,spear:1,burst:1,siphon:1};
const ST_COL={poison:0x9fd47a,bleed:0xe5776a,burn:0xf0a05a,blight:0xb9b46a,frozen:0xdfe6e2,chilled:0xdfe6e2,cursed:0xff8a6a,sundered:0xd08a52,hexed:0xb8a48c,hasted:0xe8c66a,shield:0xe8dcc8};
const INT_COL={atk:0xe5776a,heal:0x9fd47a,abil:0xd3a64d,frozen:0xdfe6e2};
function fxStatus(u){   // one colour per status on a unit, in the order its pills show them
  const c=[]; if(!u||u.hp<=0) return c;
  if(u.dots) for(const k in u.dots) c.push(ST_COL[k]||ST_COL.shield);
  if(u.stun>0) c.push(ST_COL.frozen); if(u.curse) c.push(ST_COL.cursed);
  if(u.st) for(const k in u.st) if(u.st[k]>0) c.push(ST_COL[k]||ST_COL.shield);
  if(u.shield>0) c.push(ST_COL.shield); return c;
}
function fxStageRect(k){   // a fighter's box on the page, for the overlay effects
  const F=FXS.ok&&k!=null&&FXS.f.get(String(k)), cv=FXS.app&&FXS.app.canvas; if(!F||!cv||!cv.isConnected) return null;
  const b=cv.getBoundingClientRect(); return b.width>0?{x:b.left+F.x-F.s/2,y:b.top+F.y-F.s,w:F.s,h:F.s}:null;
}
async function fxStageInit(){
  if(FXS.app) return;
  try{
    const a=new PIXI.Application();
    await a.init({backgroundAlpha:0,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true,width:320,height:200,
      autoStart:false,sharedTicker:false,preference:'webgl',powerPreference:'low-power',hello:false});
    if(FXL.st!=='ready'||FXS.app){ a.destroy({removeView:true},{children:true}); return; }
    a.ticker.stop(); a.ticker.maxFPS=40;
    a.canvas.className='stage-cv'; a.canvas.setAttribute('aria-hidden','true');
    const fam=n=>{ try{ const v=getComputedStyle(document.documentElement).getPropertyValue(n).split(',').map(x=>x.trim().replace(/^['"]|['"]$/g,'')).filter(Boolean); return v.length?v:['serif']; }catch(e){ return ['serif']; } };
    FXS.font=fam('--font-data'); FXS.fontH=fam('--font-head'); FXS.col=fxColours();
    FXS.app=a; FXS.root=new PIXI.Container(); FXS.root.sortableChildren=true; FXS.floor=new PIXI.Graphics(); FXS.floor.zIndex=-1e4;
    a.stage.addChild(FXS.root); FXS.root.addChild(FXS.floor); FXS.tex=fxTextures(a.renderer);
    a.ticker.add(fxStageStep); FXS.ok=true;
    if(!FXS.rs){ FXS.rs=true; window.addEventListener('resize',()=>{ if(FXS.app) try{ fxStage(); }catch(e){} }); }
    if(typeof S!=='undefined'&&S&&S.mode==='battle') render();   // swap the cards for the stage now, not on the next turn
  }catch(e){ FXS.ok=false; try{ console.info('Battle stage is off: '+(e&&e.message)+'. The cards show the fight instead.'); }catch(x){} }
}
function fxStageDrop(){   // the layer is going away: the stage too, and the cards come back
  const a=FXS.app, was=FXS.ok; FXS.ok=false; FXS.app=null; FXS.root=null; FXS.floor=null; FXS.f.clear(); FXS.nums=[]; FXS.seen=null; FXS.W=0; FXS.lk=''; FXS.bgk=null;
  try{ document.body.style.removeProperty('--stage-bg'); if(FXS.bgu) URL.revokeObjectURL(FXS.bgu); }catch(e){} FXS.bgu=null;
  if(a) try{ a.ticker.remove(fxStageStep); for(const k in FXS.tex) FXS.tex[k].destroy(true); FXS.ico.forEach(t=>{ if(t) t.destroy(true); }); a.destroy({removeView:true},{children:true}); }catch(e){}
  FXS.tex=null; FXS.ico.clear();
  if(was&&typeof app!=='undefined'&&app&&app.querySelector&&app.querySelector('.win.staged')) setTimeout(()=>render(),0);
}

// ----- fighter sprites: the painted icon drawn once into a texture -----
function fxIcoCss(){   // the icon rules from the page's stylesheet, so the picture matches the cards
  if(FXS.css!=null) return FXS.css; let s='';
  for(const sh of Array.from(document.styleSheets||[])){ let rs; try{ rs=sh.cssRules; }catch(e){ continue; }
    for(const r of Array.from(rs||[])) if(r.selectorText&&/\.ico|\.mt-/.test(r.selectorText)&&!/body|\.unit|\.item|\.gslot|\.trow|\.mrow|\.bes/.test(r.selectorText)) s+=r.cssText; }
  const cs=getComputedStyle(document.documentElement), v=n=>cs.getPropertyValue(n).trim();
  return FXS.css=s+'.ico svg,.ico>svg,.ico.boss svg,.ico.boss>svg{width:64px!important;height:64px!important;overflow:visible}g.ico{--well:'+v('--well')+';--gold:'+v('--gold')+';--ember:'+v('--ember')+'}';
}
function fxIcoTex(html){   // null until the image has loaded; the fighters that wear it are updated then
  if(FXS.ico.has(html)) return FXS.ico.get(html);
  FXS.ico.set(html,null);
  const m=/^<span class="([^"]*)"[^>]*>(<svg[\s\S]*<\/svg>)/.exec(html), defs=document.getElementById('paint');
  if(!m||!defs||!window.URL||!URL.createObjectURL) return null;
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="-4 -4 72 72"><style>'+fxIcoCss()+'</style><defs>'+defs.parentNode.innerHTML+'</defs><g class="'+m[1]+'">'+m[2].replace('<svg ','<svg x="0" y="0" width="64" height="64" ')+'</g></svg>';
  const img=new Image(), url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  img.onload=()=>{ URL.revokeObjectURL(url); if(!FXS.app) return;
    try{ const c=document.createElement('canvas'); c.width=c.height=160; c.getContext('2d').drawImage(img,0,0,160,160); const t=PIXI.Texture.from(c); FXS.ico.set(html,t);
      for(const F of FXS.f.values()) if(F.html===html){ F.spr.texture=t; fxFit(F); } }catch(e){} };
  img.onerror=()=>URL.revokeObjectURL(url);
  img.src=url; return null;
}
function fxFit(F){ const z=F.s*72/64; if(F.spr.texture&&F.spr.texture!==PIXI.Texture.EMPTY){ F.spr.width=z; F.spr.height=z; } F.spr.y=F.s*4/64; }
function fxFighter(k,foe){
  const c=new PIXI.Container(), sp=(t,add)=>{ const s=new PIXI.Sprite(FXS.tex[t]); s.anchor.set(.5); if(add) s.blendMode='add'; s.visible=false; return s; };
  const F={k,foe,c,x:0,y:0,cx:null,cy:0,s:0,ph:fxR(0,6.3),a:[],dead:null,key:'',html:''};
  F.shadow=sp('dot'); F.shadow.tint=0; F.shadow.visible=true;
  F.glow=sp('dot',1); F.ring=sp('ring',1); F.chg=sp('ring',1); F.chg.tint=FXS.col.ember; F.bk=sp('ring',1); F.bk.tint=FXS.col.ward;
  F.body=new PIXI.Container(); F.spr=new PIXI.Sprite(PIXI.Texture.EMPTY); F.spr.anchor.set(.5,1); F.body.addChild(F.spr);
  F.plate=new PIXI.Graphics();
  F.name=new PIXI.Text({text:'',style:{fontFamily:FXS.fontH,fontSize:13,fontWeight:'600',fill:FXS.col.bone,stroke:{color:0x0a0806,width:3}}}); F.name.anchor.set(.5,0);
  F.tag=foe?new PIXI.Text({text:'',style:{fontFamily:FXS.font,fontSize:11,fontWeight:'700',fill:0xe5776a,stroke:{color:0x0a0806,width:3}}}):new PIXI.Graphics();
  if(foe) F.tag.anchor.set(.5,1);
  c.addChild(F.shadow,F.glow,F.ring,F.chg,F.body,F.bk,F.plate,F.name,F.tag);
  if(foe){ c.eventMode='static'; c.cursor='pointer'; c.on('pointertap',()=>{ try{ if(foe===2) stageRaise(k); else stageTap(k); }catch(e){} }); }   // foe 2: a body on the raise stage
  FXS.root.addChild(c); FXS.f.set(k,F); return F;
}
const fxTr=t=>{ try{ return VIEW.lang==='tr'?trText(t):t; }catch(e){ return t; } };
function fxFitText(T,s,w,two){   // one line if it fits; else a size smaller; else (two) wrapped onto two lines; only then cut
  const st=T.style, fs=st.fontSize; st.wordWrap=false; T.text=s; if(T.width<=w) return;
  st.fontSize=fs-1; if(T.width<=w) return;
  if(two){ st.wordWrap=true; st.breakWords=true; st.wordWrapWidth=w; st.align='center'; T.text=s; }
  const lim=two?fs*2.6:fs*1.6; let n=s.length; while(n>3&&(T.width>w+1||T.height>lim)){ n--; T.text=s.slice(0,n)+'…'; }
}
function fxUpd(F,p,cell,tg,r){
  const u=p.u, s=p.s, dead=u.hp<=0, isP=u.id==='p', max=isP?pMax():u.maxHp;
  F.u=u; F.x=p.x; F.y=p.y; if(F.cx==null){ F.cx=p.x; F.cy=p.y; } if(F.dead===null) F.dead=dead;
  const html=isP?ico('Necromancer',pRankI(),{}):ico(u.base||u.kind||u.name,u.rankI,{boss:u.boss,secret:u.secret,elite:u.elite});
  if(F.html!==html){ F.html=html; F.spr.texture=fxIcoTex(html)||PIXI.Texture.EMPTY; F.s=0; }
  if(F.s!==s){ F.s=s; fxFit(F); F.shadow.scale.set(s/34,s/120); F.glow.scale.set(s/26,s/76); F.ring.scale.set(s/52,s/150); F.bk.position.set(0,-s*.5); F.c.hitArea=new PIXI.Rectangle(-cell/2,-s-20,cell,s+64); }
  const nm=F.foe?u.name:(isP?'You':nick(u)), st=fxStatus(u), sel=F.foe&&!dead&&r.target===u.id, ch=F.foe&&!dead?chargeInfo(u):null, it=F.foe&&!dead&&!ch?intentInfo(u):null;
  const kd=it&&it.k==='atk'?foeKnow(u).dmg:null, lab=ch?'Charging: '+ch.name:it?it.txt+(kd!=null?' · '+aboutN(kd):''):'', kind=ch?'abil':it?it.k:'', bw=Math.round(Math.max(s*1.2,cell*.94)), bb=Math.round(Math.min(bw*.9,s*1.15));   /* bw: the name's room, bb: the HP bar */
  const key=[nm,u.hp,max,s,bw,dead,st.join(','),sel,lab,kind,tg.has(F.k),VIEW.lang,isP?u.shield:0].join('|');
  if(key===F.key) return; F.key=key;
  F.name.style.fill=u.boss||u.elite?FXS.col.gold:FXS.col.bone; F.name.style.fontSize=s<56?12:14; fxFitText(F.name,fxTr(nm),bw,true); F.name.y=6;
  const g=F.plate.clear(), by=F.name.y+F.name.height+2, w=Math.max(0,Math.min(1,u.hp/max));
  g.rect(-bb/2-1,by-1,bb+2,8).fill({color:0x0a0806,alpha:.85}).rect(-bb/2,by,bb*w,6).fill(F.foe?0xb83a2a:0x6f9a4c);
  if(isP&&u.shield>0) g.rect(-bb/2,by,bb*Math.min(1,u.shield/max),2).fill(FXS.col.ward);
  st.slice(0,6).forEach((c,i,a)=>{ const x=(i-(a.length-1)/2)*8; g.poly([x,by+10,x+3,by+13,x,by+16,x-3,by+13]).fill(c).stroke({width:1,color:0x0a0806,alpha:.8}); });
  F.glow.visible=!!st.length; if(st.length){ F.glow.tint=st[0]; F.glow.alpha=.45; }
  F.ring.visible=sel; F.ring.tint=FXS.col.bone; F.chg.visible=!!ch;
  if(F.foe){ F.tag.style.fill=INT_COL[kind]||FXS.col.bone; F.tag.style.fontSize=s<56?11:12; fxFitText(F.tag,fxTr(lab),Math.max(cell*.96,70)); F.tag.y=-s-4; }
  else { F.tag.clear(); if(tg.has(F.k)) F.tag.poly([-6,-s-12,6,-s-12,0,-s-4]).fill(0xc9402c).stroke({width:1.5,color:0x0a0806}); }   // a foe means to hit this one next
}
// After each render: place the fighters, sized to the stage's width (a phone gets smaller sprites, never fewer lanes).
function fxStage(){
  const A=FXS.app; if(!A) return;
  const rs=typeof S!=='undefined'&&S&&S.run&&S.mode==='raise', host=typeof S!=='undefined'&&S&&(S.mode==='battle'||rs)&&S.run&&app.querySelector('.stage');   /* rs: the raise screen, bodies where the foes stood */
  if(!host){ FXS.md=null; if(A.canvas.parentNode) A.canvas.parentNode.removeChild(A.canvas); A.ticker.stop();
    if(FXS.f.size||FXS.nums.length){ FXS.f.forEach(F=>F.c.destroy({children:true})); FXS.f.clear(); FXS.nums.forEach(n=>n.T.destroy()); FXS.nums=[]; } return; }
  if(A.canvas.parentNode!==host) host.appendChild(A.canvas);
  const r=S.run, fresh=!FXS.f.size, from=FXS.md, W=Math.max(200,host.clientWidth|0), all=[S.player].concat(S.army), foes=rs?fxBodies(r):r.enemies, fk=rs?2:1;
  const L=[[foes,'b',fk],[foes,'f',fk],[all,'f',0],[all,'b',0]].map(([l,k,foe])=>({foe,u:l.filter(u=>rowOf(u)===k)})).filter(l=>l.u.length);
  const n=Math.max(3,...L.map(l=>l.u.length)), cell=W/n, s=Math.round(Math.max(W<520?40:56,Math.min(96,cell*.72))), pos=new Map(), tg=new Set();   // the fighters fill the stage; a crowded row shrinks them
  if(!rs) for(const e of r.enemies){ const i=e.hp>0&&intentInfo(e); if(i&&i.k==='atk'&&i.tg) tg.add(fxKey(i.tg)); }
  let y=6, mid=0;
  for(const l of L){
    if(!l.foe&&!mid){ mid=y+4; y+=12; }
    const big=l.u.some(u=>u.boss)?1.3:1; y+=(l.foe?26:16)+s*big*1.08;
    l.u.forEach((u,i)=>pos.set(String(fxKey(u)),{u,foe:l.foe,x:Math.round((W-l.u.length*cell)/2+cell*(i+.5)),y:Math.round(y),s:Math.round(s*(u.boss?1.3:1))}));
    l.y=Math.round(y); y+=52;   // the plate: up to two lines of name, the HP bar, status marks
  }
  const H=Math.round(y);
  host.style.height=H+'px';
  if(H!==FXS.h||W!==FXS.W){ FXS.h=H; FXS.W=W; A.renderer.resize(W,H); }
  const lk=W+':'+L.map(l=>l.y).join(',');
  if(lk!==FXS.lk){ FXS.lk=lk; FXS.floor.removeChildren().forEach(c=>c.destroy()); FXS.floor.clear();   // the ground each row stands on: a soft dark band, and a worn line between the sides
    for(const l of L){ const b=new PIXI.Sprite(FXS.tex.dot); b.anchor.set(.5); b.tint=0; b.alpha=.5; b.position.set(W/2,l.y+2); b.scale.set(W/26,s/70); FXS.floor.addChild(b); }
    if(mid) FXS.floor.rect(W*.08,mid,W*.84,1).fill({color:FXS.col.bone,alpha:.16}).rect(W*.2,mid+2,W*.6,1).fill({color:0,alpha:.5}); }
  fxStageBg();
  for(const [k,p] of pos){ const nw=!FXS.f.has(k), F=FXS.f.get(k)||fxFighter(k,p.foe);
    if(p.foe===2) fxBodyUpd(F,p,cell,nw&&from==='battle'); else { fxUpd(F,p,cell,tg,r); if(nw&&rs&&!fresh&&!p.foe) fxAnim(F,'spawn',650,500); }   // a body just raised joins your side
    F.c.zIndex=p.y; }
  for(const [k,F] of FXS.f) if(!pos.has(k)){ F.c.destroy({children:true}); FXS.f.delete(k); }
  if(fresh){ FXS.seen=r.fx; if(r.cmd&&r.cmd.guard) FXS.gcmd=r.cmd; }   // a stage just opened: show what stands, do not replay the last turn
  FXS.md=S.mode; A.ticker.start();
}
// ----- the raise stage: each body lies where its foe stood (in the foes' order), its raise chance an arc on the ground around it -----
const fxBodies=r=>{ const at=c=>{ const i=r.enemies.findIndex(e=>'c'+e.id===c.id); return i<0?1e3:i; }; return r.corpses.slice().sort((a,b)=>at(a)-at(b)); };
function fxBodyUpd(F,p,cell,fall){   // fall: the stage comes straight from the fight, so the body drops first
  const c=p.u, s=p.s, res=c.tried?c.result:null, P=S.player;
  F.u=c; F.x=p.x; F.y=p.y; if(F.cx==null){ F.cx=p.x; F.cy=p.y; }
  if(F.res===undefined){ F.res=res; F.gone=!!res; if(fall&&!res) fxAnim(F,'fall',150,450); }
  else if(res!==F.res){ F.res=res; fxAnim(F,res==='raised'?'rise':'dust',0,res==='raised'?1300:850);
    if(res!=='raised'&&FXL.root){ const b=fxStageRect(F.k); if(b){ fxDeath({x:b.x,y:b.y+b.h*.55,w:b.w,h:b.h*.45},80,FXL.col,false); fxGo(); } } }   // crumbles: ash on the overlay
  if(!F.arc){ F.arc=new PIXI.Graphics(); F.c.addChildAt(F.arc,1); }
  const html=ico(c.base,c.rankI,{boss:c.boss,elite:c.elite});
  if(F.html!==html){ F.html=html; F.spr.texture=fxIcoTex(html)||PIXI.Texture.EMPTY; F.s=0; }
  if(F.s!==s){ F.s=s; fxFit(F); F.shadow.scale.set(s/24,s/110); F.glow.scale.set(s/20,s/40); F.glow.tint=FXS.col.soul; F.c.hitArea=new PIXI.Rectangle(-cell/2,-s*.8,cell,s*.8+48); }
  const can=!res&&!soulBound(c)&&P.mana>=raiseCost(c)&&(armyUsed()<slots()||reserveRoom()), ch=raiseChance(c), K=c.cd&&CORPSE_CONDS[c.cd];
  F.can=can; F.c.eventMode=res?'none':'static'; F.c.cursor=can?'pointer':'default';
  const key=[c.name,s,ch,can,!!res,VIEW.lang].join('|'); if(key===F.key) return; F.key=key;
  F.name.style.fill=c.boss||c.elite?FXS.col.gold:FXS.col.bone; F.name.style.fontSize=s<56?12:13; fxFitText(F.name,fxTr(c.name),Math.round(Math.max(s*1.2,cell*.94)),true); F.name.y=6;
  F.tag.anchor.set(.5,0); F.tag.style.fill=can?FXS.col.soul:FXS.col.ash; F.tag.style.fontSize=13; F.tag.text=ch+'%'; F.tag.y=F.name.y+F.name.height+1;
  const R=s*.64, a0=-Math.PI/2, g=F.arc.clear(); F.arc.position.set(0,-s*.1); F.arc.scale.set(1,.42);   // a ring lying on the ground, read clockwise from the back
  g.circle(0,0,R).stroke({width:5,color:0x0a0806,alpha:.65});
  if(ch>0) g.moveTo(0,-R).arc(0,0,R,a0,a0+Math.PI*2*Math.min(1,ch/100)).stroke({width:3.5,color:can?FXS.col.soul:FXS.col.ash,alpha:can?1:.6});
  const pl=F.plate.clear();
  if(K){ const x=F.tag.width/2+9, y=F.tag.y+7, up=K.raise>0; pl.poly(up?[x-5,y+3,x+5,y+3,x,y-5]:[x-5,y-3,x+5,y-3,x,y+5]).fill(up?FXS.col.soul:0xc9402c).stroke({width:1.5,color:0x0a0806}); }   // the corpse condition: up adds to the chance, down takes from it
}
const fxEase=k=>1-(1-k)*(1-k);
function fxBodyStep(F,dt,T){   // lying, falling, rising (stands, glows, walks to your side and fades) or crumbling to dust
  const e=Math.min(1,dt/120); F.cx+=(F.x-F.cx)*e; F.cy+=(F.y-F.cy)*e;
  let up=0, rk=-1, dk=-1;
  for(let i=F.a.length-1;i>=0;i--){ const a=F.a[i]; a.age+=dt; const k=a.age/a.d;
    if(a.k==='fall'){ if(k>=1){ F.a.splice(i,1); continue; } up=a.age<0?1:1-k*k; continue; }
    if(a.age<0) continue; if(k>=1){ F.a.splice(i,1); F.gone=true; continue; }
    if(a.k==='rise') rk=k; else dk=k; }
  F.c.visible=!F.gone; if(F.gone) return;
  const s=F.s, stand=rk>=0?fxEase(Math.min(1,rk/.35)):up, lie=1-stand, walk=rk>.35?fxEase((rk-.35)/.65):0;
  F.body.rotation=-.4*lie; F.body.x=s*.12*lie; F.body.y=0;   // slumped (tipped and flattened), so wide and tall creatures both read as down
  F.c.x=F.cx; F.c.y=F.cy+walk*s*1.1;
  F.body.scale.set(1+.1*lie,(1-.45*lie)*(dk>=0?1-.8*dk:1));
  F.spr.alpha=dk>=0?1-dk:rk>.6?1-(rk-.6)/.4:.94;
  F.spr.tint=dk>=0?fxMix(0x8a7b68,0x2e2925,dk):rk>=0?fxMix(0x8a7b68,0xffffff,stand):0x8a7b68;   // sepia while it lies
  F.glow.visible=rk>=0; if(rk>=0) F.glow.alpha=.75*Math.sin(Math.PI*rk);
  const idle=!F.res; F.arc.visible=F.plate.visible=F.name.visible=F.tag.visible=idle&&up<.5;
  if(idle) F.arc.alpha=F.can?.75+.25*Math.sin(T/380):.7;
  F.shadow.alpha=dk>=0?1-dk:1;
}
function fxStageBg(){   // the painted backdrop (#scene, scenes.js) as the stage's own background, so the fighters stand in the place
  const sc=document.getElementById('scene'), k=sc&&sc.dataset.k||'', sv=k&&sc.querySelector('svg'); if(k===FXS.bgk) return;
  FXS.bgk=k; if(FXS.bgu) try{ URL.revokeObjectURL(FXS.bgu); }catch(e){} FXS.bgu=null;
  try{ if(sv&&window.XMLSerializer){ FXS.bgu=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(sv)],{type:'image/svg+xml'})); document.body.style.setProperty('--stage-bg','url("'+FXS.bgu+'")'); }
    else document.body.style.removeProperty('--stage-bg'); }catch(e){}
}
function fxAnim(F,k,t,d,dx,dy){ F.a.push({k,age:-t,d,dx:dx||0,dy:dy||0}); }
function fxStageMove(e,at){   // from fxFlush, on the same clock as the overlay: the attacker lunges, the target recoils
  const T=FXS.f.get(String(e.k)); if(!T) return;
  const by=e.kind==='strike'||e.kind==='spear'||e.kind==='siphon'?'p':e.o&&e.o.by, A=by!=null&&FXS.f.get(String(by));
  if(A&&A!==T){ const dx=T.x-A.x, dy=T.y-A.y, d=Math.hypot(dx,dy)||1, go=e.kind==='strike'||e.kind==='mhit'||e.kind==='hurt'?Math.min(d*.4,A.s*.9):A.s*.15;
    fxAnim(A,'lunge',Math.max(0,at-110),240,dx/d*go,dy/d*go); }
  fxAnim(T,'recoil',at,300,0,T.foe?-1:1);
}
function fxNum(F,txt,col,t,big,small){   // a number that rises off a fighter and fades
  const T=new PIXI.Text({text:txt,style:{fontFamily:FXS.fontH,fontSize:Math.round((small?12:big?28:19)*(F.s<50?.85:1)),fontWeight:'700',fill:col,stroke:{color:0x0a0806,width:4}}});
  T.anchor.set(.5,1); T.visible=false; T.zIndex=2e4; FXS.root.addChild(T);
  FXS.nums.push({T,x:F.x+fxR(-F.s*.15,F.s*.15),y:F.y-F.s*(small?1.05:.7),age:-t,life:big?1050:850,big});
}
function fxStageAfter(hit){   // numbers, blocks and deaths for this turn, once per turn (r.fx is new on every action)
  const r=typeof S!=='undefined'&&S&&S.run; if(!FXS.app||!FXS.f.size||!r) return;
  if(r.fx!==FXS.seen){ FXS.seen=r.fx;
    for(const k in r.fx){ const f=r.fx[k], F=FXS.f.get(k); if(!F) continue; const h=hit[k], t=h?h.t:0;
      if(f.d) fxNum(F,String(f.d),h&&h.c?FXS.col.gold:F.foe?FXS.col.bone:0xe5776a,t+60,h&&h.c);
      if(f.h) fxNum(F,'+'+f.h,0x9fd47a,t+(f.d?220:0));
      if(f.c) fxNum(F,fxTr(f.c),FXS.col.gold,t+300,false,true); }
    for(const k in hit){ const f=r.fx[k], F=FXS.f.get(k); if(F&&!(f&&(f.d||f.h))) fxAnim(F,'block',hit[k].t,420); } }   // struck for nothing: a ward or shield took it
  if(r.cmd&&r.cmd.guard&&FXS.gcmd!==r.cmd){ FXS.gcmd=r.cmd;   // Guard given this turn: the vanguard plants itself before you while the foes strike
    const v=guardFront(), V=v&&FXS.f.get(String(fxKey(v))), P=FXS.f.get('p');
    if(V&&P){ V.c.zIndex=P.y+1; fxAnim(V,'guard',0,1500,P.x+P.s*.25-V.x,P.y-P.s*.35-V.y); } }
  for(const F of FXS.f.values()){ if(F.foe===2) continue; const dead=F.u.hp<=0; if(dead&&F.dead===false) fxAnim(F,'die',(hit[F.k]?hit[F.k].t:0)+180,700); F.dead=dead; }
}
const fxMix=(a,b,k)=>{ const c=s=>Math.round(((a>>s)&255)*(1-k)+((b>>s)&255)*k); return (c(16)<<16)|(c(8)<<8)|c(0); };
function fxStageStep(tk){
  const dt=Math.min(50,tk.deltaMS), T=(FXS.t+=dt);
  for(const F of FXS.f.values()){
    if(F.foe===2){ fxBodyStep(F,dt,T); continue; }
    const e=Math.min(1,dt/120); F.cx+=(F.x-F.cx)*e; F.cy+=(F.y-F.cy)*e; if(!F.a.length) F.c.zIndex=F.y;
    let ox=0,oy=0,fl=0,dk=-1,bk=-1,sp=1;
    for(let i=F.a.length-1;i>=0;i--){ const a=F.a[i]; a.age+=dt;
      if(a.age<0){ if(a.k==='die') dk=Math.max(dk,0); if(a.k==='spawn') sp=0; continue; }
      const k=a.age/a.d; if(k>=1){ F.a.splice(i,1); continue; }
      const w=Math.sin(Math.PI*k);
      if(a.k==='lunge'){ ox+=a.dx*w; oy+=a.dy*w; }
      else if(a.k==='guard'){ const h=Math.min(1,k/.2,(1-k)/.2); ox+=a.dx*h; oy+=a.dy*h; }
      else if(a.k==='recoil'){ oy+=a.dy*w*F.s*.1; ox+=Math.sin(k*28)*(1-k)*3; fl=Math.max(fl,1-k); }
      else if(a.k==='die') dk=k; else if(a.k==='block') bk=k; else if(a.k==='spawn') sp=k;
    }
    const gone=F.dead&&dk<0, bob=gone?0:Math.sin(T/650+F.ph);
    F.c.x=F.cx+ox; F.c.y=F.cy+oy-(dk>0?dk*F.s*.18:0); F.c.alpha=sp;
    F.body.y=-bob*F.s*.02; F.body.scale.set(1+(dk>0?dk*.08:0),(1+bob*.012)*(dk>0?1-.3*dk:1));
    F.spr.alpha=gone?.26:dk>0?1-.74*dk:1;
    F.spr.tint=gone?0x5a5450:fl>0?fxMix(0xffffff,0xff6a55,fl):dk>0?fxMix(0xffffff,0x5a5450,dk):0xffffff;
    F.plate.visible=F.name.visible=F.tag.visible=!gone;
    if(F.ring.visible) F.ring.alpha=.5+.25*Math.sin(T/280);
    if(F.chg.visible){ const p=(T%900)/900; F.chg.alpha=.8*(1-p)+.1; F.chg.scale.set(F.s/34*(1.35-.6*p),F.s/100*(1.35-.6*p)); }
    F.bk.visible=bk>=0; if(bk>=0){ F.bk.alpha=.9*(1-bk); F.bk.scale.set(F.s/90*(1+bk*.6)); }
  }
  for(let i=FXS.nums.length-1;i>=0;i--){ const n=FXS.nums[i]; n.age+=dt; if(n.age<0) continue;
    const k=n.age/n.life; if(k>=1){ n.T.destroy(); FXS.nums.splice(i,1); continue; }
    n.T.visible=true; n.T.x=n.x; n.T.y=n.y-36*(1-(1-k)*(1-k)); n.T.alpha=k>.6?(1-k)/.4:1; n.T.scale.set(n.big?1.5-.5*Math.min(1,k*5):1);
  }
}
