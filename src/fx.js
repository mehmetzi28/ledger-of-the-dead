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
const fxAllowed=()=>{ try{ return !VIEW.calm&&!fxLight()&&!fxReduced(); }catch(e){ return false; } };
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
const fxRect=k=>fxBox(fxEl(k));
const fxAll=sel=>{ try{ return Array.from(app.querySelectorAll(sel)).map(fxBox).filter(Boolean); }catch(e){ return []; } };

// After every render: start loading, shut the layer when effects are switched off, or play the queue.
function fxSync(){
  if(!fxAllowed()){ if(FXL.st==='ready'||FXL.st==='init') fxDrop(); else if(FXL.st==='loading') FXL.st='off'; FXL.q.length=0; return; }
  if(FXL.st==='off') fxLoad();
  else if(FXL.st==='ready') fxFlush();
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
    if(!FXL.vis){ FXL.vis=true; document.addEventListener('visibilitychange',()=>{ if(document.hidden) fxClear(); }); }
    FXL.st='ready';
  }catch(e){ fxFail(e&&e.message); }
}
function fxDrop(){   // effects switched off: take the canvas and the WebGL context away entirely
  const a=FXL.app; fxClear(); FXL.st='off'; FXL.app=null; FXL.root=null; FXL.pool=[];
  if(!a) return;
  try{ for(const k in FXL.tex) FXL.tex[k].destroy(true); }catch(e){}
  FXL.tex=null;
  try{ a.ticker.remove(fxStep); a.destroy({removeView:true},{children:true}); }catch(e){}
}
function fxClear(){   // drop every live effect and stop the ticker (tab hidden, layer dropped)
  FXL.q.length=0;
  for(const p of FXL.live) fxFree(p); FXL.live.length=0;
  const a=FXL.app; if(a) try{ a.render(); a.ticker.stop(); }catch(e){}
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
function fxUlt(e,r,col){   // one stronger version of the fitting effect, across the room
  const id=e.o&&e.o.id, foes=fxAll('.unit.foe[data-u]'), ours=fxAll('.unit.ally[data-u]');
  if(id==='toll') foes.forEach((f,i)=>{ fxSlash(f,i*40,col,true); fxDeath(f,i*40+120,col,true); });
  else if(id==='rise') ours.forEach((f,i)=>fxMotes(f,i*35,col,i?6:12));
  else (foes.length?foes:r?[r]:[]).forEach((f,i)=>fxWard(f,i*40,col,true));
}

// Plays the queued moments in order on a short clock, so a full army's turn reads as a flurry rather than one flash.
function fxFlush(){
  const q=FXL.q; FXL.q=[]; if(!q.length) return;
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
      case 'ult': fxUlt(e,r,col); t+=300; break;
    }
    prev=at;
  }
  fxGo();
}
