// ----- icons (32x32 silhouettes; .c = cutout, .cs = cut line, .s = stroke)
const GH='M16 2c-6 0-10 5-10 11v17l3-3 3 3 4-3 4 3 3-3 3 3V13c0-6-4-11-10-11z';
const SK='<path d="M16 3C9 3 5 8 5 14c0 4 2 6 4 8v4h14v-4c2-2 4-4 4-8 0-6-4-11-11-11z"/><circle class="c" cx="11.5" cy="14" r="3"/><circle class="c" cx="20.5" cy="14" r="3"/><path class="c" d="M16 18l-2 4h4z"/><path class="cs" d="M13 23v3M16 23v3M19 23v3"/>';
const RAT='<ellipse cx="14" cy="19" rx="9" ry="6"/><path d="M21 14l9 5-9 6z"/><circle cx="20" cy="13.5" r="3.2"/><path class="s" d="M5 19c-4-1-5-5-2-8"/><circle class="c" cx="25" cy="19" r="1.1"/><rect x="9" y="23" width="2.6" height="5"/><rect x="17" y="23" width="2.6" height="5"/>';
const HOOD='<path d="M16 2C9 2 6 9 6 16c0 5-2 9-4 14h28c-2-5-4-9-4-14 0-7-3-14-10-14z"/><path class="c" d="M16 9c-4 0-6 3-6 7s2 7 6 7 6-3 6-7-2-7-6-7z"/><circle cx="13.5" cy="15.5" r="1.2"/><circle cx="18.5" cy="15.5" r="1.2"/>';
const HELMB='<path d="M6 28V14C6 8 10 4 16 4s10 4 10 10v14h-5v-8H11v8z"/><rect class="c" x="9" y="13" width="14" height="3"/>';
const TREE='<circle cx="10" cy="11" r="6"/><circle cx="22" cy="11" r="6"/><circle cx="16" cy="7" r="6"/><circle cx="16" cy="14" r="6"/><rect x="14" y="16" width="4" height="14"/><path d="M14 27l-5 3h5zM18 27l5 3h-5z"/>';
const CROWN='<path class="gold" d="M5 3l3 3 3-4 3 4 3-3-1.5 7h-9z"/>';
const GLYPH={
 'Tunnel Rat':RAT,
 'Grave Beetle':'<ellipse cx="16" cy="19" rx="8.5" ry="10"/><circle cx="16" cy="7" r="3.6"/><path class="cs" d="M16 11v17"/><path class="s" d="M8 14L3 11M7.5 19H2M9 24l-5 4M24 14l5-3M24.5 19H30M23 24l5 4M14 4L11 1M18 4l3-3"/>',
 'Marrow Mite':'<circle cx="16" cy="19" r="5.5"/><circle cx="16" cy="11" r="3.5"/><circle class="c" cx="14.7" cy="10.5" r=".9"/><circle class="c" cx="17.3" cy="10.5" r=".9"/><path class="s" d="M11 16L3 10M10.5 19H2M11 22l-8 4M13 24l-5 6M21 16l8-6M21.5 19H30M21 22l8 4M19 24l5 6"/>',
 'The Rat King':'<g transform="translate(0 4) scale(.92)">'+RAT+'</g><g transform="translate(11 0)">'+CROWN+'</g>',
 'Skeleton Guard':SK+'<path class="cs" d="M5.5 9.5h21M16 9.5v5"/>',
 'Crypt Ghoul':'<path d="M16 3c-6 0-9 5-9 11 0 4 1 7 3 9l1 6h10l1-6c2-2 3-5 3-9 0-6-3-11-9-11z"/><path class="c" d="M9.5 12l5 2-4.5 2zM22.5 12l-5 2 4.5 2z"/><path class="c" d="M10 21h12l-2 5-2-3-2 3-2-3-2 3z"/>',
 'Drowned Priest':HOOD+'<path class="cs" d="M16 25v5M13.5 27h5"/>',
 'The Crypt Warden':HELMB+'<circle class="gold" cx="16" cy="20.5" r="2.6"/><rect class="gold" x="15.2" y="22" width="1.6" height="6"/><rect class="gold" x="16.8" y="25" width="2.5" height="1.4"/>',
 'Ash Husk':'<circle cx="16" cy="20" r="9"/><path d="M16 1c-3 4 2 6-1 10 4-1 6-4 5-8 3 3 3 7 0 10h-8c-3-3-2-8 4-12z"/><circle class="c" cx="12.5" cy="20" r="2"/><circle class="c" cx="19.5" cy="20" r="2"/><path class="cs" d="M16 24v4M23 15l-3 4"/>',
 'Barrow Wight':'<path d="'+GH+'"/><ellipse class="c" cx="12" cy="13" rx="2" ry="2.8"/><ellipse class="c" cx="20" cy="13" rx="2" ry="2.8"/><ellipse class="c" cx="16" cy="20" rx="2" ry="2.5"/>',
 'Pyre Witch':'<path d="M16 2L9 18h14z"/><rect x="3" y="18" width="26" height="3" rx="1"/><path class="cs" d="M11.5 13h9"/><path class="ember" transform="translate(2 0)" d="M7 30c-1-4 3-5 3-9 3 2 4 5 3 9 2-1 4-3 4-7 3 2 5 5 4 7z"/>',
 'The Ember Knight':HELMB+'<path class="ember" d="M13 5c-3-3 1-4 0-5 5 1 6 5 4 8z"/>',
 'Stone Gargoyle':'<path d="M12 10h8l3 6-2 8h-10l-2-8z"/><path d="M12 10L8 3l5 5zM20 10l4-7-5 5z"/><path d="M10 14L1 10l3 8-2 6 8-3zM22 14l9-4-3 8 2 6-8-3z"/><path class="c" d="M12 15l3 1.5-3 1zM20 15l-3 1.5 3 1z"/><path class="cs" d="M14 22v2M18 22v2"/>',
 'Nave Stalker':'<path d="M3 2c7 7 8 18 4 28-3-9-6-19-4-28z"/><path transform="translate(10 -1)" d="M3 2c7 7 8 18 4 28-3-9-6-19-4-28z"/><path transform="translate(20 1)" d="M3 2c6 7 7 17 3 27-3-9-5-18-3-27z"/>',
 'Hollow Chorister':'<circle cx="14" cy="16" r="10"/><ellipse class="c" cx="14" cy="21" rx="4" ry="5"/><path class="cs" d="M8 12l4 1.5M20 12l-4 1.5"/><path class="s" d="M26 9c3 3 3 9 0 12M28 7c4 4 4 14 0 18"/>',
 'The Bishop of Teeth':'<path d="M16 2L6 22h20z"/><rect x="5" y="22" width="22" height="5"/><path class="cs" style="stroke-width:2.2" d="M16 8v10M11.5 12.5h9"/><path class="c" d="M5 22l2.2 4 2.2-4 2.2 4 2.2-4 2.2 4 2.2-4 2.2 4 2.2-4 2.2 4 2.2-4z"/>',
 'Thorn Troll':'<path d="M5 8l5-5h12l5 5v10c0 6-5 10-11 10S5 24 5 18z"/><rect class="c" x="9" y="14" width="5" height="3"/><rect class="c" x="18" y="14" width="5" height="3"/><rect class="c" x="10" y="21" width="12" height="3"/><path d="M10 22l-2 7 5-4zM22 22l2 7-5-4z"/>',
 'Rust Knight':HELMB+'<path d="M16 4c0-3 5-4 8-2-2 1-3 3-3 6z"/>',
 'Sap Weaver':TREE+'<path class="cs" d="M16 2v13M7 8l18 8M25 8L7 16"/>',
 'The Orchard Mother':TREE+'<path class="c" d="M11 9l4 2-4 2zM21 9l-4 2 4 2z"/><ellipse class="c" cx="16" cy="16.5" rx="2.5" ry="2"/>',
 'Throne Guard':'<path d="M16 2l11 4v9c0 8-5 13-11 15C10 28 5 23 5 15V6z"/><path class="cs" style="stroke-width:2.4" d="M16 7v17M10 13h12"/>',
 'Ash Revenant':'<path d="M7 9L2 2l8 4zM25 9l5-7-8 4z"/>'+SK,
 'Whisper Choir':'<g style="stroke:var(--well);stroke-width:1.4"><path transform="translate(-1 8) scale(.6)" d="'+GH+'"/><path transform="translate(13 8) scale(.6)" d="'+GH+'"/><path transform="translate(5 1) scale(.7)" d="'+GH+'"/></g><ellipse class="c" cx="6.2" cy="15.8" rx="1" ry="1.4"/><ellipse class="c" cx="11" cy="15.8" rx="1" ry="1.4"/><ellipse class="c" cx="20.2" cy="15.8" rx="1" ry="1.4"/><ellipse class="c" cx="25" cy="15.8" rx="1" ry="1.4"/><ellipse class="c" cx="13.4" cy="10.1" rx="1.2" ry="1.7"/><ellipse class="c" cx="19" cy="10.1" rx="1.2" ry="1.7"/>',
 'The Pale Sovereign':'<g transform="translate(4 8) scale(.75)">'+SK+'</g><g transform="translate(5 0)">'+CROWN+'</g>',
 'Necromancer':'<g transform="translate(-2 2) scale(.92)">'+HOOD+'</g><path class="s" d="M29 9v21"/><circle cx="29" cy="6" r="3"/><circle class="c" cx="28" cy="5.5" r=".8"/><circle class="c" cx="30" cy="5.5" r=".8"/>',
 '_':SK
};
// ===== ICONS v2 : 64x64 shaded illustrations =====
const E=(x,y,r,c)=>{ r=r||1.8; c=c||'#ffd27a'; return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+(r*2.6)+'" ry="'+(r*1.7)+'" fill="'+c+'" opacity=".2"/><ellipse cx="'+x+'" cy="'+y+'" rx="'+(r*1.25)+'" ry="'+(r*.6)+'" fill="'+c+'"/>'; };   // a narrow glare, not a round dot
const P=(d,c)=>'<path class="'+(c||'b')+'" d="'+d+'"/><path class="tx tx-'+(c||'b')+'" d="'+d+'"/><path d="'+d+'" fill="url(#gSh)"/>';   // fill, surface texture (by material), then light
const D=d=>'<path class="dk" d="'+d+'"/>';
const L=(d,w)=>'<path class="st" d="'+d+'"'+(w?' style="stroke-width:'+w+'"':'')+'/>';
const T=(d,w,c)=>'<path class="stb" d="'+d+'" style="stroke-width:'+(w||2)+(c?';stroke:'+c:'')+'"/>';
const GR=(t,s)=>'<g transform="'+t+'">'+s+'</g>';
const HELLC='#ff5a3c', SOULC='#9be870', FIREC='#ffb347';
const FLM=(x,y,s,c)=>GR('translate('+x+' '+y+') scale('+(s||1)+')','<path d="M0-14C-5-7 4-5 0 2C-6 0-9-6-4-11C-4-8-2-8 0-14ZM1 6C-7 5-8-3-3-8C-1-3 7-1 5 5C4 6 2 6 1 6Z" fill="'+(c||'#e08a3c')+'"/><path d="M0-5C-3-1 3 0 0 5C-4 3-4-2 0-5Z" fill="#ffd27a"/>');
const SKULL=(x,y,s,c,eye)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',
  P('M0-17C-10-17-16-10-16-1C-16 5-13 8-10 10V17H10V10C13 8 16 5 16-1C16-10 10-17 0-17Z',c||'bn')
  +'<ellipse class="dk" cx="-6.2" cy="-1" rx="4.6" ry="5.2"/><ellipse class="dk" cx="6.2" cy="-1" rx="4.6" ry="5.2"/><path class="dk" d="M0 5L-2.8 10.5H2.8Z"/>'
  +'<path class="st" d="M-6.5 13.5v3.5M-2.2 13.5v3.5M2.2 13.5v3.5M6.5 13.5v3.5" style="stroke-width:1.3"/>'+(eye?E(-6.2,-1,1.7,eye)+E(6.2,-1,1.7,eye):''));
const HELM=(x,y,s,c,slit)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',
  P('M-17 20V-4C-17-14-9-21 0-21S17-14 17-4V20H8V9H-8V20Z',c||'b')+D('M-12-3H12V3H-12Z')+L('M0-21V-3M0 3V9',1.4)+(slit?E(-6,0,1.5,slit)+E(6,0,1.5,slit):''));
const HORNP=(x,y,s,c)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',P('M-8 0C-14-2-19-8-18-17C-14-11-9-8-5-6Z','bn')+P('M8 0C14-2 19-8 18-17C14-11 9-8 5-6Z','bn'));
const HOODP=(x,y,s,c)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',P('M0-24C-13-24-19-13-19-2C-19 10-25 20-29 30H29C25 20 19 10 19-2C19-13 13-24 0-24Z',c||'b')+'<path class="dk" d="M0-14C-8-14-12-8-12-1C-12 7-7 12 0 12S12 7 12-1C12-8 8-14 0-14Z"/>');
const CROWNP=(x,y,s)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',P('M-14 8L-17-8L-8-1L0-12L8-1L17-8L14 8Z','gd')+'<circle cx="0" cy="-12" r="2" fill="#ffe9a8"/><circle cx="-17" cy="-8" r="1.7" fill="#ffe9a8"/><circle cx="17" cy="-8" r="1.7" fill="#ffe9a8"/>');
const WINGS=(c)=>P('M26 30C14 14 4 12 1 14C3 24 10 34 22 38Z',c||'m')+P('M38 30C50 14 60 12 63 14C61 24 54 34 42 38Z',c||'m')+L('M22 30C14 24 8 20 4 17M22 33C15 29 10 26 6 24M42 30C50 24 56 20 60 17M42 33C49 29 54 26 58 24',1);
const IC={};
// ---- E : Rat Warren
IC['Tunnel Rat']=T('M12 42C4 44 1 52 8 57',2.6,'currentColor')+P('M10 40C10 29 20 25 31 26C39 26 45 30 48 34L59 37L48 42C45 47 36 50 26 50C16 50 10 46 10 40Z')
 +P('M36 27a5.5 5.5 0 1 1 .1 0Z','m')+D('M36 27a2.8 2.8 0 1 1 .1 0Z')+P('M20 48v8h6v-8Z','m')+P('M34 48v8h6v-8Z','m')
 +L('M17 34C21 31 26 31 29 34M15 40C19 38 24 38 27 40')+E(47,35,1.7,'#ff8a5c')+'<circle cx="59" cy="37" r="1.8" class="dk"/>'
 +'<path fill="#e9dfc6" d="M49 42l1.8 4 1.8-4z"/>'+L('M52 36L63 32M52 39L63 41',1);
IC['The Rat King']=GR('translate(0 6)',T('M8 40C2 44 4 54 12 56M56 40C62 44 60 54 52 56M32 54C30 60 36 62 40 58',2.4,'currentColor')
 +P('M32 14C46 14 54 24 54 34C54 46 44 54 32 54C20 54 10 46 10 34C10 24 18 14 32 14Z')
 +P('M16 20a8 8 0 1 1 .1 0Z','m')+P('M48 20a8 8 0 1 1 .1 0Z','m')+D('M16 20a4.2 4.2 0 1 1 .1 0ZM48 20a4.2 4.2 0 1 1 .1 0Z')
 +P('M32 34C40 36 44 42 40 48C37 52 27 52 24 48C20 42 24 36 32 34Z','m')+'<circle cx="32" cy="38" r="2.6" class="dk"/>'
 +E(22,30,2,'#ff6a3c')+E(42,30,2,'#ff6a3c')+'<path fill="#e9dfc6" d="M28 47l2 5 2-5zM33 47l2 5 2-5z"/>'+L('M14 38L2 34M14 42L2 44M50 38L62 34M50 42L62 44',1))
 +CROWNP(32,10,.95);
IC['Tannery Brute']=P('M6 62V46C6 38 14 34 24 33H40C50 34 58 38 58 46V62Z')+P('M32 6C42 6 48 14 48 24C48 32 42 38 32 38C22 38 16 32 16 24C16 14 22 6 32 6Z','m')
 +P('M14 62L20 38L28 40L26 62ZM50 62L44 38L36 40L38 62Z','dk')+L('M20 42L30 62M44 42L34 62',1.2)+D('M20 20H44V24H20Z')+E(25,22,1.4,'#ffd27a')+E(39,22,1.4,'#ffd27a')
 +'<path fill="#e9dfc6" d="M24 32l-3 9 6-4zM40 32l3 9-6-4z"/>'+L('M26 31C30 33 34 33 38 31',1.4)+L('M20 12L30 14M44 12L34 14',1.2);
IC['Shiv Cutpurse']=P('M8 62C8 50 16 44 30 44C44 44 50 50 50 62Z','m')+P('M30 16C38 16 42 22 42 30C42 38 37 44 30 44C23 44 18 38 18 30C18 22 22 16 30 16Z','b')+'<path d="M18 31H42C42 39 37 45 30 45C23 45 18 39 18 31Z" fill="#6e2a20"/><path d="M18 31H42C42 39 37 45 30 45C23 45 18 39 18 31Z" fill="url(#gSh)"/><path d="M41 34L48 40L44 42Z" fill="#6e2a20"/>'+P('M18 18C18 8 24 4 30 4C36 4 42 8 42 18Z','m')+T('M18 16H42',2,'#8a6a3e')+P('M3 22C3 18 15 16 30 16C45 16 57 18 57 22C57 25 45 24 30 24C15 24 3 25 3 22Z','m')+D('M20 24H40V30H20Z')+E(25,27,1.3,'#ffd27a')+E(35,27,1.3,'#ffd27a')+P('M53 32L58 52L55 55L49 52Z','bn')+L('M54 35L56 51',1)+P('M46 52H60V56H46Z','gd')+'<rect x="51" y="56" width="4" height="8" class="dk"/>';
IC['Tallow Chandler']=P('M10 62C10 50 14 40 20 34C24 30 40 30 44 34C50 40 54 50 54 62Z','bn')+P('M24 7H28V17H24ZM36 6H40V17H36ZM30 4H34V15H30Z','b')+FLM(26,5,.38)+FLM(38,4,.38)+FLM(32,2,.4)+P('M32 14C40 14 44 20 44 28C44 34 40 38 32 38C24 38 20 34 20 28C20 20 24 14 32 14Z','bn')+'<path d="M22 30V41M42 30V44M27 38V47M38 38V45" stroke="#e9dfc6" stroke-width="3" stroke-linecap="round"/>'+D('M24.5 25C24.5 22.5 30 22.5 30 25C30 27.5 24.5 27.5 24.5 25ZM34 25C34 22.5 39.5 22.5 39.5 25C39.5 27.5 34 27.5 34 25Z')+E(27.2,25,1.2,'#ffd27a')+'<path d="M37 15V31" stroke="#e9dfc6" stroke-width="4.4" stroke-linecap="round"/>'+D('M28 31C28 29.5 36 29.5 36 31C36 35 34.5 38 32 38C29.5 38 28 35 28 31Z')+P('M14 54H50V60H14Z','m');

// ---- D : Sunken Crypt
IC['Crypt Ghoul']=P('M10 62C10 50 14 44 22 42H42C50 44 54 50 54 62Z','m')+P('M32 6C44 6 50 16 50 26C50 32 48 36 46 40L44 46H20L18 40C16 36 14 32 14 26C14 16 20 6 32 6Z','bn')
 +D('M16 22L28 28L18 32ZM48 22L36 28L46 32Z')+E(23,28,1.5,'#ff8a5c')+E(41,28,1.5,'#ff8a5c')+D('M20 38C26 36 38 36 44 38L42 48H22Z')
 +'<path fill="#e9dfc6" d="M23 38l2 5 2-5zM29 38l2 6 2-6zM35 38l2 5 2-5zM41 38l-1 4-2-4z"/>'+L('M24 10C26 14 24 18 22 20M40 10C38 14 40 18 42 20',1.2)
 +'<path d="M4 54L8 40L12 54ZM60 54L56 40L52 54Z" class="bn"/>';
IC['The Crypt Warden']=P('M8 62V40C8 30 16 24 32 24S56 30 56 40V62Z','m')+HELM(32,28,1.05,'b','#ffd27a')+P('M8 40H20V54H8ZM44 40H56V54H44Z','m')
 +'<circle cx="32" cy="52" r="5" fill="#d3a64d"/><circle cx="32" cy="52" r="2" class="dk"/><rect x="31" y="56" width="2.4" height="8" fill="#d3a64d"/><rect x="33" y="60" width="4" height="2.2" fill="#d3a64d"/>'
 +'<path d="M20 4L32 10L44 4L40 16H24Z" class="gd"/>'+CROWNP(32,6,.5);
IC['Drowned Sentinel']=P('M6 62V44C6 34 16 30 32 30S58 34 58 44V62Z','m')+P('M32 4C45 4 52 14 52 26C52 38 45 44 32 44C19 44 12 38 12 26C12 14 19 4 32 4Z','b')+'<circle cx="32" cy="24" r="11" class="gd"/>'+D('M32 15.5a8.5 8.5 0 1 0 .1 0Z')+'<ellipse cx="32" cy="24" rx="6" ry="3.4" fill="#9be870" opacity=".3"/>'+E(32,24,2,SOULC)+L('M23.5 24H40.5M32 15.5V32.5',1)+'<g class="gd"><circle cx="16" cy="20" r="1.6"/><circle cx="48" cy="20" r="1.6"/><circle cx="16" cy="32" r="1.6"/><circle cx="48" cy="32" r="1.6"/></g>'+'<g fill="#cfc6b0"><circle cx="20" cy="10" r="2.2"/><circle cx="24" cy="7" r="1.4"/><circle cx="45" cy="38" r="2"/><circle cx="14" cy="52" r="2.4"/></g>'+T('M46 8C52 14 48 20 54 26',2.6,'#5f9a58')+'<path d="M4 56C12 52 18 58 26 54S40 58 48 54 58 58 62 54V64H4Z" fill="#6ea8a4" opacity=".55"/>';
IC['Coffin Crawler']=T('M18 24L6 14L2 22M16 32L2 34M16 42L4 54M46 24L58 14L62 22M48 32L62 34M48 42L60 54',2.6,'currentColor')
 +P('M24 6H40L52 22L44 58H20L12 22Z','m')+P('M27 10H37L46 23L40 54H24L18 23Z')+L('M32 14V46M25 24H39',1.6)
 +E(28,30,1.5,'#ff8a5c')+E(36,30,1.5,'#ff8a5c')+'<path fill="#e9dfc6" d="M27 38l2 4 2-4zM33 38l2 4 2-4z"/>';
IC['Tide Acolyte']=P('M8 62C8 50 16 44 28 44C40 44 48 50 48 62Z','m')+P('M18 14L22 4L27 12L31 3L34 12Z','m')+P('M8 30C8 18 18 10 30 12C38 13 44 18 46 24L38 28L46 32C42 40 34 44 24 44C14 44 8 38 8 30Z','b')+L('M28 21C25 26 25 32 28 38M32 20C29 26 29 32 32 39',1.4)+D('M14 26C14 22 22 22 22 26C22 30 14 30 14 26Z')+E(18,26,1.5,SOULC)+'<path fill="#e9dfc6" d="M38 27l3 1.6-3 .9zM39 30l3 1.4-3 1z"/>'+T('M54 62V12',2.6,'#d3a64d')+P('M47 14V5C47 5 50 8 54 8S61 5 61 5V14C61 18 58 20 54 20S47 18 47 14Z','gd')+'<path d="M54 5V20" stroke="#0a0807" stroke-width="1.2"/>'+'<path d="M6 8C6 12 3 12 3 16" stroke="#7fc1bd" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>';

// ---- C : Ashen Barrow
IC['Ash Husk']=P('M32 8C46 8 54 18 54 32C54 48 44 58 32 58C20 58 10 48 10 32C10 18 18 8 32 8Z')+L('M32 8L28 22L36 30L30 42L34 58M16 20L26 26M48 18L40 26M14 40L24 38M50 42L42 40',1.6)
 +'<path d="M28 22L36 30L30 42M26 26L16 20M40 26L48 18" stroke="#ff8a3c" stroke-width="1.3" fill="none" stroke-linecap="round"/>'
 +D('M18 28H28V36H18ZM36 28H46V36H36Z')+E(23,32,1.8,'#ff7a2c')+E(41,32,1.8,'#ff7a2c')+FLM(32,6,.5,'#e08a3c');
IC['Barrow Wight']=P('M32 4C18 4 12 14 12 26V60L19 54L26 60L32 54L38 60L45 54L52 60V26C52 14 46 4 32 4Z')+'<path d="M12 26V60L19 54L26 60L32 54L38 60L45 54L52 60V26" fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="1.4"/>'
 +D('M18 20C22 16 28 18 29 26C28 32 22 34 19 30ZM46 20C42 16 36 18 35 26C36 32 42 34 45 30Z')+E(23.5,25,1.7,'#9be870')+E(40.5,25,1.7,'#9be870')+D('M26 40C28 46 36 46 38 40C38 50 26 50 26 40Z')
 +L('M18 8C24 6 40 6 46 8',1);
IC['Pyre Witch']=P('M32 4L44 34H20Z')+P('M6 34H58V40H6Z','m')+'<path d="M20 34L32 4L44 34Z" fill="none"/>'+T('M25 30H39',2.4,'#d3a64d')
 +P('M18 40H46V46C46 52 40 56 32 56C24 56 18 52 18 46Z','bn')+E(26,47,1.4,'#ff8a3c')+E(38,47,1.4,'#ff8a3c')+L('M26 52C30 54 34 54 38 52',1.4)
 +P('M12 62C12 58 20 56 32 56S52 58 52 62Z','m')+FLM(10,50,.9)+FLM(54,50,.9)+L('M18 58C22 54 28 56 32 54',0);
IC['The Ember Knight']=P('M8 62V40C8 30 16 24 32 24S56 30 56 40V62Z','m')+HELM(32,30,1.05,'b','#ff7a2c')
 +'<path d="M32 8C26 14 38 14 32 22C42 20 44 12 36 4C38 8 34 8 32 8Z" fill="#e08a3c"/>'+FLM(32,6,1.2)+P('M4 40H18L16 50H6ZM46 40H60L58 50H48Z','m');
IC['Barrow Thrall']=P('M6 62V46C6 38 14 34 24 33H40C50 34 58 38 58 46V62Z','m')+P('M32 6C42 6 48 14 48 24C48 32 42 38 32 38C22 38 16 32 16 24C16 14 22 6 32 6Z','bn')
 +D('M20 20H29V27H20ZM35 20H44V27H35Z')+E(24.5,23.5,1.3,'#ffd27a')+E(39.5,23.5,1.3,'#8fd46a')+L('M24 32C28 34 36 34 40 32',1.4)+L('M28 33V36M32 33V36M36 33V36',1)
 +L('M16 46L24 56M48 46L40 58M30 44L34 60',1.2)+'<path d="M20 8C24 4 40 4 44 8L40 12H24Z" class="b"/>';
IC['Ember Stalker']=T('M54 34C62 26 62 16 55 10',2.6,'currentColor')+FLM(55,9,.45)+P('M20 28C28 22 44 22 52 28C58 32 60 38 58 44H49L45 38H27L23 46H14L16 38C14 34 16 30 20 28Z')+P('M17 44H24V58H18ZM45 42H51L53 58H47Z','m')+P('M3 36L6 24L11 30C13 27 19 25 24 27L22 41H8C5 41 3 39 3 36Z')+L('M30 29V36M36 28V36M42 29V36',1.3)+E(11,31,1.4,'#ff7a2c')+'<path fill="#e9dfc6" d="M5 39l1.4 4 1.4-4zM9 39l1.4 3.5 1.4-3.5z"/>'+FLM(31,22,.32)+FLM(40,20,.36)+FLM(48,23,.3);
IC['Cinder Weaver']='<g fill="none" stroke="currentColor" stroke-width="1" opacity=".35"><path d="M32 2V62M2 32H62M8 8L56 56M56 8L8 56"/><circle cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="24"/></g>'+T('M32 22V2',1,'currentColor')+T('M26 31L12 19L6 25M24 35L8 35L4 43M26 39L12 49L10 59M38 31L52 19L58 25M40 35L56 35L60 43M38 39L52 49L54 59',2.4,'currentColor')+P('M32 34C40 34 46 40 46 48C46 56 40 60 32 60C24 60 18 56 18 48C18 40 24 34 32 34Z')+'<path d="M32 39L37 47L32 56L27 47Z" fill="#e08a3c"/><path d="M32 43L34.5 47L32 51L29.5 47Z" fill="#ffd27a"/>'+P('M32 22C37 22 40 26 40 30C40 34 36 36 32 36C28 36 24 34 24 30C24 26 27 22 32 22Z','m')+E(29,29,1.1,'#ff7a2c')+E(35,29,1.1,'#ff7a2c')+E(30.5,26,.75,'#ff7a2c')+E(33.5,26,.75,'#ff7a2c');
// ---- B : Hollow Cathedral
IC['Stone Gargoyle']=WINGS('m')+P('M22 18L32 12L42 18L46 34L40 52H24L18 34Z')+P('M22 18L14 4L28 14ZM42 18L50 4L36 14Z','m')
 +D('M23 27L30 30L24 34ZM41 27L34 30L40 34Z')+E(27,30,1.5,'#ffb347')+E(37,30,1.5,'#ffb347')+D('M26 40L32 44L38 40V46L32 48L26 46Z')+'<path fill="#e9dfc6" d="M27 44l1.5 4 1.5-4zM34 44l1.5 4 1.5-4z"/>'+L('M26 20L28 26M38 20L36 26',1);
IC['Nave Stalker']=P('M26 4C34 4 38 10 36 18L40 40L36 62H28L24 40L28 18C26 12 24 8 26 4Z')+D('M26 11H34V16H26Z')+E(28.5,13.5,1.2,'#ff8a5c')+E(32.5,13.5,1.2,'#ff8a5c')
 +T('M26 26L10 38L4 58M40 26L56 38L60 58',3,'currentColor')+'<path fill="#e9dfc6" d="M2 58l2-6 3 6zM6 59l3-6 2 6zM62 58l-2-6-3 6zM58 59l-3-6-2 6z"/>'+L('M28 30L36 32M28 40L36 42',1.2);
IC['Hollow Chorister']=P('M32 6C44 6 50 16 50 26C50 36 44 42 38 44V50H26V44C20 42 14 36 14 26C14 16 20 6 32 6Z','bn')+D('M19 21H29V27H19ZM35 21H45V27H35Z')+E(24,24,1.3,'#9be870')+E(40,24,1.3,'#9be870')
 +'<ellipse class="dk" cx="32" cy="36" rx="6" ry="7"/>'+P('M12 62C12 54 20 50 32 50S52 54 52 62Z','b')+T('M54 14C60 20 60 32 54 38M58 8C66 18 66 36 58 46',1.8,'currentColor')+T('M10 14C4 20 4 32 10 38M6 8C-2 18-2 36 6 46',1.8,'currentColor');
IC['The Bishop of Teeth']=P('M32 2L48 30H16Z','gd')+P('M16 30H48V38H16Z','b')+'<path d="M32 8V24M26 14H38" stroke="#0a0807" stroke-width="2.6" stroke-linecap="round"/>'
 +P('M10 38H54V46L50 52H14L10 46Z','b')+D('M14 40H50V48H14Z')+'<path fill="#e9dfc6" d="M15 40l3 8 3-8 3 8 3-8 3 8 3-8 3 8 3-8 3 8 3-8 3 8 2-8z"/>'+E(24,28,1.3,'#ff6a3c')+E(40,28,1.3,'#ff6a3c')
 +P('M14 54H50V62H14Z','m')+'<path fill="#e9dfc6" d="M16 54l3 6 3-6 3 6 3-6 3 6 3-6 3 6 3-6 3 6 3-6 3 6z"/>';
IC['Glass Sentinel']=P('M32 2L52 14V34L32 60L12 34V14Z','m')+'<path d="M32 2L52 14L32 22Z" fill="#fff" opacity=".28"/><path d="M12 14L32 22L12 34Z" fill="#fff" opacity=".12"/><path d="M52 34L32 22V60Z" fill="#000" opacity=".25"/>'
 +L('M32 2V60M12 14L52 34M52 14L12 34',1.2)+'<path d="M32 22L24 28H40Z" fill="currentColor"/>'+E(26,29,1.5,'#9be0e0')+E(38,29,1.5,'#9be0e0');
IC['Tooth Collector']=P('M6 6H58V28C58 44 46 52 32 52C18 52 6 44 6 28Z','m')+D('M10 10H54V28C54 40 44 46 32 46C20 46 10 40 10 28Z')
 +'<path fill="#e9dfc6" d="M12 10h8l-2 14zM22 10h9l-3 20zM33 10h9l-3 20zM44 10h8l-3 14z"/><path fill="#e9dfc6" d="M16 44l2-12 3 14zM26 46l2-12 4 12zM36 46l1-12 5 12zM46 42l1-10 3 10z"/>'
 +E(18,28,1.6,'#ff8a5c')+E(46,28,1.6,'#ff8a5c')+P('M20 54H44V62H20Z','b');
IC['Vestment Wraith']=P('M14 22C8 26 4 34 4 42C8 40 12 38 16 34Z','m')+P('M50 22C56 26 60 34 60 42C56 40 52 38 48 34Z','m')+P('M20 14C26 10 38 10 44 14L50 40C52 50 56 56 60 62C52 58 48 62 42 58C38 62 34 58 32 62C30 58 26 62 22 58C16 62 12 58 4 62C8 56 12 50 14 40Z','b')+D('M21 14C26 18 38 18 43 14C41 23 37 27 32 27C27 27 23 23 21 14Z')+'<ellipse cx="32" cy="20" rx="7" ry="3.4" fill="#9be870" opacity=".22"/>'+E(29,20,1.1,SOULC)+E(35,20,1.1,SOULC)+P('M26 27H38L40 58H24Z','gd')+T('M32 33V45M28 38H36',1.6,'#0a0807');

// ---- A : Iron Orchard
IC['Thorn Troll']=P('M4 62V44C4 36 12 32 22 32H42C52 32 60 36 60 44V62Z','m')+P('M32 6C44 6 50 14 50 24C50 34 44 40 32 40C20 40 14 34 14 24C14 14 20 6 32 6Z')+'<path d="M14 18L6 10L20 14ZM50 18L58 10L44 14ZM24 8L22 0L30 7ZM40 8L42 0L34 7Z" fill="#6a8a46"/>'
 +D('M18 22H29V27H18ZM35 22H46V27H35Z')+E(23.5,24.5,1.4,'#ffd27a')+E(40.5,24.5,1.4,'#ffd27a')+'<path fill="#e9dfc6" d="M22 36l2-8 3 8zM42 36l-2-8-3 8z"/>'+'<path d="M8 44L2 38L12 40ZM56 44L62 38L52 40ZM20 36L16 30L24 34ZM44 36L48 30L40 34Z" fill="#6a8a46"/>';
IC['Rust Knight']=P('M8 62V40C8 30 16 24 32 24S56 30 56 40V62Z','m')+HELM(32,28,1.05,'b','#ff8a3c')+'<path d="M14 14L22 20M46 12L40 20M18 36L26 40M44 38L50 34" stroke="#b8571f" stroke-width="3" stroke-linecap="round" opacity=".8"/>'
 +'<path d="M32 8C32 2 42 0 50 4C46 6 44 10 44 14Z" fill="#c24a2a"/>';
IC['Sap Weaver']=T('M16 40L4 30L8 20M20 44L6 52M48 40L60 30L56 20M44 44L58 52M24 36L12 22M40 36L52 22',2.4,'currentColor')
 +P('M32 6C44 6 52 14 52 24C52 30 48 34 44 36L42 50H22L20 36C16 34 12 30 12 24C12 14 20 6 32 6Z','m')+'<circle cx="22" cy="18" r="6" fill="#7aa046"/><circle cx="42" cy="18" r="6" fill="#7aa046"/><circle cx="32" cy="12" r="6" fill="#8ab656"/>'
 +D('M20 28H29V34H20ZM35 28H44V34H35Z')+E(24.5,31,1.3,'#ffb347')+E(39.5,31,1.3,'#ffb347')+P('M26 50H38V60H26Z','b')+'<path d="M32 50V62" stroke="#e8a63c" stroke-width="2.6"/>';
IC['The Orchard Mother']=P('M26 62L28 40H36L38 62Z','m')+P('M32 4C46 4 58 12 58 26C58 38 48 42 40 42H24C16 42 6 38 6 26C6 12 18 4 32 4Z','m')
 +'<circle cx="16" cy="16" r="9" fill="#6a8a46"/><circle cx="48" cy="16" r="9" fill="#6a8a46"/><circle cx="32" cy="10" r="9" fill="#7aa046"/><circle cx="32" cy="22" r="9" fill="#5f7c3e"/>'
 +'<circle cx="14" cy="28" r="3.4" fill="#c24a2a"/><circle cx="50" cy="26" r="3.4" fill="#c24a2a"/><circle cx="22" cy="6" r="3" fill="#e8a63c"/>'
 +P('M24 22C24 18 28 16 32 16S40 18 40 22V36C40 40 36 42 32 42S24 40 24 36Z','b')+D('M26 24H31V28H26ZM33 24H38V28H33Z')+E(28.5,26,1.3,'#ffb347')+E(35.5,26,1.3,'#ffb347')+'<ellipse class="dk" cx="32" cy="35" rx="3" ry="3.6"/>';
IC['Iron Scarecrow']=P('M30 6H34V62H30Z','m')+P('M4 22H60V28H4Z','m')+P('M32 6C40 6 44 12 44 18C44 24 40 28 32 28C24 28 20 24 20 18C20 12 24 6 32 6Z')
 +'<path d="M14 6H50L44 12H20Z" class="b"/><path d="M12 8H52" stroke="#0a0807" stroke-width="2"/>'+D('M24 14H30V19H24ZM34 14H40V19H34Z')+E(27,16.5,1.2,'#ff8a3c')+E(37,16.5,1.2,'#ff8a3c')
 +L('M26 23L28 25L30 23L32 25L34 23L36 25L38 23',1.2)+'<path d="M4 28L0 40L8 34ZM60 28L64 40L56 34Z" fill="#b8a874"/>'+P('M22 34H42L46 56H18Z','b')+L('M26 36L22 54M38 36L42 54',1);
IC['Fruit Reaver']=T('M10 60L44 8',3,'#8a6a3e')+P('M44 6C28 2 10 12 6 30C16 20 32 16 46 20C48 14 46 10 44 6Z','bn')+L('M40 10C28 10 18 16 12 26',1.2)
 +'<circle cx="44" cy="46" r="10" fill="#c2402a"/><circle cx="44" cy="46" r="10" fill="url(#gSh)"/><path d="M44 36C44 32 48 30 50 30" stroke="#6a8a46" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M38 42C40 40 42 40 44 40" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/>'
 +E(41,48,1.2,'#ffd27a')+E(48,48,1.2,'#ffd27a')+L('M40 53C43 55 47 55 50 53',1.2);
IC['Grove Shepherd']=P('M32 12C24 12 20 18 20 26C20 36 26 42 32 42S44 36 44 26C44 18 40 12 32 12Z','bn')+'<path d="M16 14C14 6 22 2 28 6C22 6 20 10 22 16Z" fill="#6a8a46"/><path d="M48 14C50 6 42 2 36 6C42 6 44 10 42 16Z" fill="#6a8a46"/>'
 +P('M10 62C10 50 18 44 32 44S54 50 54 62Z','m')+E(27,26,1.3,'#ffd27a')+E(37,26,1.3,'#ffd27a')+L('M28 34C30 36 34 36 36 34',1.4)+T('M54 62V18C54 8 44 6 44 14',2.8,'#8a6a3e')+'<path d="M48 16L44 20L48 24" stroke="#6a8a46" stroke-width="2" fill="none"/>';
// ---- S : Throne of Ash
IC['Throne Guard']=T('M52 62V6',2.4,'#c8c2b4')+P('M52 0L56 10H48Z','gd')+P('M30 2L42 20V30H18V20Z','b')+D('M20 22H40V32H20Z')+E(25,27,1.3,FIREC)+E(35,27,1.3,FIREC)+P('M28 18H32V38H28Z','m')+P('M8 34H48V54C48 60 40 64 28 64C16 64 8 60 8 54Z','m')+L('M12 38H44V54C44 58 37 61 28 61C19 61 12 58 12 54Z',1.2)+CROWNP(28,48,.5);
IC['Ash Revenant']=P('M32 4C18 4 12 14 12 28C12 40 20 46 24 52V62H40V52C44 46 52 40 52 28C52 14 46 4 32 4Z','m')+SKULL(32,28,.95,'bn','#ff7a2c')
 +'<path d="M12 28C10 20 14 12 18 8M52 28C54 20 50 12 46 8" stroke="#ff8a3c" stroke-width="2" fill="none" stroke-linecap="round"/>'+FLM(32,4,.7)+L('M20 54L26 62M44 54L38 62',1.2);
IC['Whisper Choir']=SKULL(14,34,.55,'bn',SOULC)+SKULL(50,34,.55,'bn',SOULC)+SKULL(32,28,.85,'bn',SOULC)+P('M8 62C8 52 16 48 32 48S56 52 56 62Z','b')
 +T('M6 14C2 20 2 28 6 32M58 14C62 20 62 28 58 32M26 8C28 4 36 4 38 8',1.8,'currentColor');
IC['The Pale Sovereign']=P('M6 62V42C6 32 16 28 32 28S58 32 58 42V62Z','m')+SKULL(32,32,1.05,'bn','#ff6a3c')+CROWNP(32,10,1.15)+P('M14 46L6 40M50 46L58 40','b')+'<path d="M20 46L32 56L44 46L32 62Z" fill="#d3a64d" opacity=".9"/>'+T('M10 62V44M54 62V44',2,'#d3a64d');
IC['Ember Herald']=P('M8 4H12V62H8Z','m')+P('M12 6H56L46 16L56 26H12Z')+FLM(34,16,.75)+'<path d="M12 6H56L46 16L56 26H12Z" fill="none" stroke="#0a0807" stroke-width="1.2"/>'+P('M20 36H46L52 46H14Z','gd')+P('M14 46H52V52H14Z','m')+E(26,56,0,'#fff')+P('M40 52H46V62H40Z','m');
IC['Crownless Duelist']=T('M8 56L46 8M56 56L18 8',3,'#c8c2b4')+P('M2 52L14 62L10 64L0 56Z','gd')+P('M62 52L50 62L54 64L64 56Z','gd')+P('M10 6L18 4L20 12L12 14Z','gd')+P('M54 6L46 4L44 12L52 14Z','gd')
 +P('M22 26C22 20 26 16 32 16S42 20 42 26C42 34 38 38 32 38S22 34 22 26Z','bn')+'<path d="M20 14H44L40 20H24Z" class="dk"/>'+E(28,26,1.3,'#ffd27a')+E(36,26,1.3,'#ffd27a')+L('M28 32H36',1.4)+'<path d="M24 12L26 6L29 11L32 4L35 11L38 6L40 12" fill="none" stroke="#6a5a30" stroke-width="1.4" stroke-dasharray="2 2"/>';
IC['Pallbearer']=P('M14 4H50L60 28L50 62H14L4 28Z','m')+P('M20 10H44L52 28L44 56H20L12 28Z')+L('M32 14V52M22 26H42',1.6)+SKULL(32,28,.5,'bn',FIREC)
 +P('M0 40H10V62H0ZM54 40H64V62H54Z','b');

// ---- Hell Tower
IC['Imp']=P('M32 14C44 14 52 22 52 34C52 46 44 56 32 56C20 56 12 46 12 34C12 22 20 14 32 14Z','b')+P('M16 20L6 6L26 14ZM48 20L58 6L38 14Z','m')+D('M18 28L29 33L19 36ZM46 28L35 33L45 36Z')+E(24,32,1.7,HELLC)+E(40,32,1.7,HELLC)
 +D('M20 42C26 50 38 50 44 42C42 54 22 54 20 42Z')+'<path fill="#e9dfc6" d="M25 44l2 4 2-4zM35 44l2 4 2-4z"/>'+T('M32 56C32 62 42 62 44 56',2.2,'currentColor')+'<path d="M44 56L48 60L42 61Z" fill="#c9402c"/>';
IC['Hellhound']=P('M3 36L12 18L22 22L28 10L34 20L52 22L61 38L52 50H18Z')+P('M38 24L61 38L50 46L34 38Z','m')+D('M44 30L52 33L44 35Z')+E(41,30,1.8,HELLC)+'<circle cx="59" cy="38" r="2" class="dk"/>'
 +'<path fill="#e9dfc6" d="M46 42l2 5 2-5zM53 41l2 4 1-5z"/>'+P('M12 18L8 4L22 14Z','m')+'<path d="M12 36C20 42 26 42 32 40" stroke="#ff7a3c" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M10 28C16 30 20 30 24 28" stroke="#ff7a3c" stroke-width="2" fill="none" stroke-linecap="round"/>'+FLM(24,12,.55,'#e0502c');
IC['Chain Devil']=T('M2 18L10 26L4 34L12 42M62 18L54 26L60 34L52 42',2.8,'#a9a090')+HORNP(32,22,1.2)+P('M6 62V42C6 34 16 30 32 30S58 34 58 42V62Z')+P('M32 6C42 6 46 14 46 22C46 30 40 34 32 34C24 34 18 30 18 22C18 14 22 6 32 6Z','m')
 +D('M22 18L30 22L22 24ZM42 18L34 22L42 24Z')+E(26.5,21,1.4,HELLC)+E(37.5,21,1.4,HELLC)+L('M26 28C30 30 34 30 38 28',1.4)+T('M14 44L30 60M50 44L34 60',2.6,'#a9a090')+T('M24 44L40 62',2.6,'#a9a090');
IC['Pit Warden']=P('M32 2L58 10V32C58 48 46 58 32 62C18 58 6 48 6 32V10Z')+P('M32 2L58 10V32C58 48 46 58 32 62Z','m')+'<path d="M32 2V62M6 22H58" stroke="#0a0807" stroke-width="2.2" fill="none"/>'
 +FLM(32,34,1.2,'#e0502c')+HORNP(32,10,.65)+L('M12 14L26 18M52 14L38 18',1.4);
IC['Soul Tender']=P('M26 4H38V10H26Z','gd')+T('M26 10C20 4 44 4 38 10',2,'#a9a090')+P('M18 12H46L50 22V48C50 56 42 60 32 60C22 60 14 56 14 48V22Z','m')+'<path d="M18 12H46L50 22H14Z" fill="#a98a4a" opacity=".6"/>'
 +'<path d="M32 22C24 30 38 32 32 42C24 40 22 32 32 22Z" fill="#8fd46a"/><path d="M32 30C29 34 35 35 32 40C28 38 29 34 32 30Z" fill="#d8ffb8"/>'+E(24,48,1,SOULC)+E(40,48,1,SOULC)+L('M14 30H50M14 40H50',1);
IC['Brimstone Chanter']=P('M6 62C6 52 14 46 32 46C50 46 58 52 58 62Z','m')+HORNP(32,18,1.35)+SKULL(32,30,.9,'bn',HELLC)+D('M28 42C28 46 36 46 36 42Z')+T('M14 34C8 28 8 20 12 14M50 34C56 28 56 20 52 14M10 40C3 32 3 20 8 12M54 40C61 32 61 20 56 12',1.8,'#e0a82c')+T('M24 54H40M26 58H38',1.8,'#e0a82c');
IC['The Gate Hound']=P('M2 62V46L10 38H54L62 46V62Z','m')+P('M4 30C4 20 10 14 18 14C26 14 30 20 30 28C30 36 24 40 16 40C8 40 4 36 4 30Z')+P('M34 30C34 20 40 14 46 14C54 14 60 20 60 28C60 36 56 40 48 40C40 40 34 36 34 30Z')
 +P('M20 22C20 12 26 6 32 6C38 6 44 12 44 22C44 32 38 38 32 38C26 38 20 32 20 22Z','m')+D('M8 24L16 26L9 29ZM56 24L48 26L55 29ZM25 15L31 18L25 20ZM39 15L33 18L39 20Z')
 +E(12,27,1.3,HELLC)+E(52,27,1.3,HELLC)+E(28.5,17.5,1.3,HELLC)+E(35.5,17.5,1.3,HELLC)+'<path fill="#e9dfc6" d="M26 32l1.5 4 1.5-4zM30 33l1.5 4 1.5-4zM35 32l1.5 4 1.5-4z"/>'+T('M10 56H54',2.4,'#a9a090');
IC['Cinder Matron']=FLM(14,16,1.3)+FLM(50,16,1.3)+FLM(32,8,1.6)+P('M4 62C4 48 14 42 32 42S60 48 60 62Z','m')+P('M32 14C42 14 46 22 46 30C46 40 40 46 32 46C24 46 18 40 18 30C18 22 22 14 32 14Z','bn')
 +D('M23 28H30V33H23ZM34 28H41V33H34Z')+E(26.5,30.5,1.4,'#ff7a2c')+E(37.5,30.5,1.4,'#ff7a2c')+L('M28 39C30 41 34 41 36 39',1.4)+'<path d="M18 28C14 38 16 48 22 52M46 28C50 38 48 48 42 52" stroke="#e08a3c" stroke-width="3" fill="none" stroke-linecap="round"/>';
IC['The Iron Inquisitor']=P('M10 2H54V32C54 46 44 56 32 62C20 56 10 46 10 32Z')+P('M32 2H54V32C54 46 44 56 32 62Z','m')+D('M14 24H50V32H14Z')+E(24,28,1.3,'#ffb347')+E(40,28,1.3,'#ffb347')+L('M32 2V24M32 32V62M10 16H54',1.6)
 +P('M22 4L26 0L32 6L38 0L42 4V10H22Z','gd')+T('M26 42H38M28 48H36',2,'#0a0807');
IC['Lord of Flies']=WINGS('m')+P('M32 26C42 26 46 34 46 42C46 52 40 60 32 60C24 60 18 52 18 42C18 34 22 26 32 26Z')+L('M20 42H44M21 48H43M23 54H41',1.4)+P('M32 6C40 6 44 12 44 18C44 24 40 28 32 28C24 28 20 24 20 18C20 12 24 6 32 6Z','m')
 +'<circle cx="25" cy="16" r="5.4" fill="#c9402c"/><circle cx="39" cy="16" r="5.4" fill="#c9402c"/><circle cx="23.5" cy="14.5" r="1.6" fill="#ffd0b0"/><circle cx="37.5" cy="14.5" r="1.6" fill="#ffd0b0"/>'+T('M28 6L24 0M36 6L40 0',1.8,'currentColor');
IC['The Bone Cantor']=P('M32 2C44 2 52 10 52 22C52 30 48 36 44 38V46H20V38C16 34 12 30 12 22C12 10 20 2 32 2Z','bn')+D('M16 14H28V26H16ZM36 14H48V26H36Z')+E(22,20,1.6,SOULC)+E(42,20,1.6,SOULC)+D('M32 28L28 36H36Z')
 +P('M8 46H56V62H8Z','m')+'<path d="M14 46V62M22 46V62M30 46V62M38 46V62M46 46V62M54 46V62" stroke="#0a0807" stroke-width="2"/>'+T('M10 6C4 14 4 26 10 34M54 6C60 14 60 26 54 34',2,'currentColor');
IC['Duke of Chains']=T('M2 8L12 16L4 26L14 34L6 44L16 52M62 8L52 16L60 26L50 34L58 44L48 52',3,'#a9a090')+HORNP(32,20,1.25)+P('M8 62V42C8 34 18 30 32 30S56 34 56 42V62Z')+P('M32 4C42 4 46 12 46 20C46 30 40 34 32 34C24 34 18 30 18 20C18 12 22 4 32 4Z','m')
 +D('M22 16L30 20L22 22ZM42 16L34 20L42 22Z')+E(26.5,19,1.4,HELLC)+E(37.5,19,1.4,HELLC)+P('M20 44H44L38 62H26Z','gd')+T('M32 44V60',1.6,'#0a0807')+'<circle cx="32" cy="38" r="3" class="gd"/>';
IC['The Pale Executioner']=P('M6 62V40C6 32 14 28 32 28S58 32 58 40V62Z','m')+P('M32 4C42 4 48 12 48 22V34H16V22C16 12 22 4 32 4Z')+D('M20 18H44V26H20Z')+E(27,22,1.3,HELLC)+E(37,22,1.3,HELLC)+L('M32 4V18M32 26V34',1.4)
 +P('M46 6L62 20L58 28L44 18Z','bn')+T('M50 24L36 56',3,'#8a6a3e')+L('M24 40L18 62M40 40L46 62',1.2);
IC['Archdevil Vael']=HORNP(32,18,1.5)+P('M8 62C8 48 18 40 32 40S56 48 56 62Z','m')+P('M32 8C44 8 50 16 50 26C50 36 42 44 32 44C22 44 14 36 14 26C14 16 20 8 32 8Z')
 +D('M20 20L30 26L20 29ZM44 20L34 26L44 29Z')+E(25,24.5,1.8,HELLC)+E(39,24.5,1.8,HELLC)+L('M24 34C30 38 34 38 40 34',1.6)+'<path d="M26 34l1.6 4 1.6-4zM35 34l1.6 4 1.6-4z" fill="#e9dfc6"/>'+P('M26 0L32 8L38 0L36 10H28Z','gd')+T('M18 46L24 62M46 46L40 62',2,'#d3a64d');
IC['The Hollow Seraph']=WINGS('bn')+P('M24 12H40V40L36 60H28L24 40Z','b')+'<ellipse cx="32" cy="8" rx="11" ry="3.6" fill="none" stroke="#ffe9a8" stroke-width="2.4"/><ellipse cx="32" cy="8" rx="11" ry="3.6" fill="none" stroke="#ffe9a8" stroke-width="5" opacity=".2"/>'
 +D('M28 20H36V44H28Z')+E(32,26,1.6,'#ffe9a8')+L('M24 40H40',1.2);
IC['Abaddon, King of Hell']=HORNP(32,22,1.75)+FLM(10,50,1.2,'#e0502c')+FLM(54,50,1.2,'#e0502c')+SKULL(32,34,1.1,'bn',HELLC)+CROWNP(32,12,1.25)+P('M8 62C8 54 16 50 32 50S56 54 56 62Z','b')+T('M26 46L30 50M38 46L34 50',2,'#d3a64d');

// ---- Player and misc
IC['Necromancer']=HOODP(28,32,1,'b')+E(23,31,1.4,SOULC)+E(33,31,1.4,SOULC)+P('M6 62C6 52 14 44 28 44C42 44 50 52 50 62Z','m')+T('M52 62V14',2.6,'#8a6a3e')+P('M46 6C46 2 58 2 58 6C58 10 55 14 52 14C49 14 46 10 46 6Z','bn')+D('M48 6H51V9H48ZM53 6H56V9H53Z')+FLM(52,2,.4,SOULC);
IC['_']=SKULL(32,30,1.2,'b');
IC['?']='<path d="M20 22C20 12 28 8 32 8C40 8 46 12 46 22C46 30 36 32 34 40" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/><circle cx="34" cy="53" r="3.4"/>';

// ---- armed dead
IC['Warren Bandit']=P('M6 62V46C6 38 14 34 24 33H40C50 34 58 38 58 46V62Z','m')+P('M32 8C42 8 48 16 48 26C48 34 42 40 32 40C22 40 16 34 16 26C16 16 22 8 32 8Z')+P('M14 16C14 8 22 4 32 4S50 8 50 16L46 20H18Z','b')+'<path d="M16 22H48V30H16Z" class="dk"/>'+E(25,26,1.4,'#ffd27a')+E(39,26,1.4,'#ffd27a')
 +L('M12 14C20 10 44 10 52 14',1.2)+T('M54 20L36 58',3,'#c8c2b4')+P('M50 14L58 22L54 26L46 18Z','gd')+P('M18 46H30V56H18Z','gd');
IC['Crypt Legionnaire']=P('M6 62V44C6 34 16 30 30 30S54 34 54 44V62Z','m')+'<path d="M10 12C14 2 46 2 50 12L46 13C42 6 18 6 14 13Z" fill="#c9402c"/><path d="M10 12C14 2 46 2 50 12L46 13C42 6 18 6 14 13Z" fill="url(#gSh)"/>'+P('M14 42V22C14 12 21 7 30 7S46 12 46 22V42L40 44V30H20V44Z','b')+D('M20 18H40V23H33V36H27V23H20Z')+E(24,20.5,1.3,SOULC)+E(36,20.5,1.3,SOULC)+P('M40 38H62V52C62 60 56 64 51 64C46 64 40 60 40 52Z','gd')+L('M51 38V62M40 50H62',1.2)+'<circle cx="51" cy="50" r="3" class="dk"/>';
IC['Barrow Champion']=P('M6 62V42C6 32 16 26 32 26S58 32 58 42V62Z','m')+HELM(32,30,1.02,'b','#ff7a2c')+P('M16 20C10 20 6 14 8 6C12 10 16 12 20 14Z','bn')+P('M48 20C54 20 58 14 56 6C52 10 48 12 44 14Z','bn')
 +T('M56 62L40 20',3,'#8a6a3e')+P('M30 10C34 6 46 8 50 16C44 14 38 16 36 22Z','bn')+'<path d="M36 22L50 16" stroke="#0a0807" stroke-opacity=".4" stroke-width="1.4"/>';
IC['Cathedral Templar']=P('M6 62V42C6 32 16 26 32 26S58 32 58 42V62Z','m')+HELM(32,30,1.05,'b','#ffe9a8')+'<path d="M32 6V22M26 12H38" stroke="#d3a64d" stroke-width="3.4" stroke-linecap="round"/>'
 +P('M44 4L50 8L48 40L44 42L40 40L38 8Z','bn')+P('M34 40H54V45H34Z','gd')+P('M2 40H16V54C16 58 12 62 9 62C6 62 2 58 2 54Z','gd')+L('M9 40V62M2 50H16',1.2);
IC['Orchard Marshal']=P('M6 62V44C6 34 16 30 32 30S58 34 58 44V62Z','m')+T('M20 9C16 3 10 3 6 -1M18 7C12 7 8 11 4 9M44 9C48 3 54 3 58 -1M46 7C52 7 56 11 60 9',2.4,'#6b5536')+'<g fill="#7aa046"><ellipse cx="7" cy="2" rx="3" ry="1.6"/><ellipse cx="5" cy="10" rx="2.6" ry="1.4"/><ellipse cx="58" cy="2" rx="3" ry="1.6"/></g><circle cx="59" cy="10" r="2.6" fill="#c2402a"/>'+P('M16 42V14C16 8 22 6 32 6S48 8 48 14V42Z','b')+D('M20 17H44V22H20ZM20 26H44V28.5H20Z')+E(26,19.5,1.3,'#ffb347')+E(38,19.5,1.3,'#ffb347')+'<g class="gd"><circle cx="19" cy="34" r="1.4"/><circle cx="45" cy="34" r="1.4"/><circle cx="19" cy="10" r="1.4"/><circle cx="45" cy="10" r="1.4"/></g>'+T('M20 42C18 48 22 52 18 56M44 42C46 48 42 52 46 56M32 42V50',1.8,'#6b5536');
IC['Ash Praetorian']=P('M6 62V44C6 34 16 30 32 30S58 34 58 44V62Z','m')+SKULL(32,30,.82,'bn','#ff8a3c')+P('M14 28C14 13 22 6 32 6S50 13 50 28L46 24C44 15 38 11 32 11S20 15 18 24Z','b')+'<path d="M24 8C24 0 40 0 40 8L37 9C36 4 28 4 27 9Z" fill="#c9402c"/><path d="M30 -2H34V8H30Z" fill="#c9402c"/>'+T('M15 30C17 36 21 40 25 42M49 30C47 36 43 40 39 42',2,'#d3a64d')+T('M58 62V16',2.4,'#c8c2b4')+P('M58 6L62 16H54Z','gd')+P('M2 42H16V54C16 58 12 62 9 62C6 62 2 58 2 54Z','gd')+'<circle cx="9" cy="49" r="2.6" fill="#c9402c"/>';
IC['Hell Legionary']=HORNP(32,18,1.4)+P('M6 62V44C6 34 16 30 32 30S58 34 58 44V62Z','m')+P('M32 10C42 10 48 18 48 28C48 38 42 44 32 44C22 44 16 38 16 28C16 18 22 10 32 10Z','b')+P('M16 21C20 13 44 13 48 21L46 23C40 17 24 17 18 23Z','m')+D('M18 23L30 27L32 25L34 27L46 23L44 30H20Z')+E(25,28,1.5,HELLC)+E(39,28,1.5,HELLC)+D('M24 36C28 34 36 34 40 36L38 41H26Z')+'<path fill="#e9dfc6" d="M25 38L23 31L28 37ZM39 38L41 31L36 37Z"/>'+P('M38 44H62V56C62 61 56 64 50 64C44 64 38 61 38 56Z')+FLM(50,54,.7,'#e0502c');
IC['Infernal Duelist']=P('M12 62V46C12 38 20 34 30 34C40 34 46 38 46 46V62Z','m')+P('M30 8C40 8 46 16 46 26C46 34 40 40 30 40C20 40 14 34 14 26C14 16 20 8 30 8Z')+'<path d="M16 22C22 18 38 18 44 22L42 30H18Z" class="dk"/>'+E(24,25,1.5,HELLC)+E(36,25,1.5,HELLC)
 +P('M20 8L12 0L26 6ZM40 8L48 0L34 6Z','m')+T('M58 4L36 56',2,'#c8c2b4')+P('M50 40H62V44H50Z','gd')+T('M44 48L54 46',2.4,'#d3a64d')+L('M24 34C28 36 34 36 38 34',1.2);

// ---- items
const GEM=(x,y,r,c)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(c||'#ff5a3c')+'"/><circle cx="'+(x-r*.3)+'" cy="'+(y-r*.3)+'" r="'+(r*.35)+'" fill="#fff" opacity=".55"/>';
IC.i_wa=GR('rotate(-35 32 32)',P('M32 2L38 14V40H26V14Z','bn')+'<path d="M32 2V40" stroke="#0a0807" stroke-opacity=".35" stroke-width="1.4"/>'+P('M18 40H46V46H18Z','gd')+P('M29 46H35V58H29Z','m')+'<circle cx="32" cy="61" r="3.2" fill="#d3a64d"/>');
IC.i_wb=T('M32 22V62',3.4,'#8a6a3e')+SKULL(32,14,.62,'bn','#8fd46a')+P('M20 24H44L40 30H24Z','b')+L('M32 30V62',0)+'<path d="M26 34L38 38M26 44L38 48" stroke="#5a4426" stroke-width="2.4"/>'+T('M20 4C14 8 14 18 20 22M44 4C50 8 50 18 44 22',1.8,'currentColor');
IC.i_aa=P('M20 6L32 10L44 6L58 14L52 28L46 26V58H18V26L12 28L6 14Z')+P('M32 10V58H18V26L12 28L6 14L20 6Z','m')+L('M32 10V58M18 28H46M20 42H44',1.4)+'<circle cx="32" cy="30" r="4" class="gd"/>'+P('M6 14L14 22L8 28L2 18Z','b')+P('M58 14L50 22L56 28L62 18Z','b');
IC.i_ab=P('M32 4C24 4 20 10 18 16L4 24L10 34L16 30L12 60H52L48 30L54 34L60 24L46 16C44 10 40 4 32 4Z')+'<path d="M32 4C27 12 27 20 32 30C37 20 37 12 32 4Z" class="dk"/>'+P('M32 30L24 60H40Z','m')+L('M20 36L16 58M44 36L48 58',1.2)+'<circle cx="32" cy="32" r="3" class="gd"/>';
IC.i_ta=T('M14 4C14 28 22 36 32 36C42 36 50 28 50 4',2.6,'#a9a090')+P('M32 34L42 44L32 60L22 44Z','gd')+GEM(32,45,4.2,'#8fd46a')+'<path d="M32 34L42 44L32 60L22 44Z" fill="none" stroke="#0a0807" stroke-width="1.2"/>';
IC.i_tb=P('M32 18C44 18 54 26 54 38C54 50 44 58 32 58C20 58 10 50 10 38C10 26 20 18 32 18ZM32 26C26 26 20 31 20 38C20 45 26 50 32 50C38 50 44 45 44 38C44 31 38 26 32 26Z','gd')+P('M24 6H40L44 16H20Z','gd')+GEM(32,11,3.6,'#ff5a3c')+'<path d="M16 34C18 28 24 24 30 24" stroke="#fff" stroke-opacity=".4" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
IC.i_tc=P('M32 4L40 22L60 24L44 38L50 58L32 47L14 58L20 38L4 24L24 22Z','gd')+'<path d="M32 4L40 22L60 24L44 38L50 58L32 47L14 58L20 38L4 24L24 22Z" fill="none" stroke="#0a0807" stroke-width="1.2"/>'+GEM(32,32,6,'#c9402c');
IC.i_u0=P('M8 52L4 16L20 30L32 8L44 30L60 16L56 52Z','gd')+'<path d="M8 52H56V58H8Z" fill="#a98a4a"/>'+GEM(32,40,4.6,'#c9402c')+GEM(16,42,3,'#8fd46a')+GEM(48,42,3,'#8fd46a')+'<circle cx="32" cy="8" r="3" fill="#ffe9a8"/><circle cx="4" cy="16" r="2.6" fill="#ffe9a8"/><circle cx="60" cy="16" r="2.6" fill="#ffe9a8"/>';
IC.i_u4=P('M32 58C8 42 2 26 10 14C18 4 30 8 32 18C34 8 46 4 54 14C62 26 56 42 32 58Z')+'<path d="M32 18C28 28 36 36 32 50" stroke="#0a0807" stroke-width="2" fill="none" stroke-linecap="round"/>'+'<path d="M14 18C18 14 24 14 26 18" stroke="#fff" stroke-opacity=".4" stroke-width="2.4" fill="none" stroke-linecap="round"/>'+E(32,34,1.8,'#ffd27a');
IC.i_censer=T('M32 2V12M20 14C20 8 44 8 44 14',2.2,'#a9a090')+P('M10 16H54C54 36 46 48 32 50C18 48 10 36 10 16Z','gd')+'<path d="M18 22H46M20 30H44M24 38H40" stroke="#0a0807" stroke-width="2.4" stroke-linecap="round"/>'+P('M24 50H40V56H24Z','m')+'<path d="M32 60C28 62 30 64 32 64C34 64 36 62 32 60Z" fill="#e08a3c"/><path d="M24 6C20 2 26 -2 24 -6" stroke="#aaa" stroke-width="2" fill="none" opacity=".5"/>';
IC.i_axe=GR('rotate(30 32 32)',P('M29 4H35V62H29Z','m')+P('M35 8C52 6 62 16 62 28C62 40 52 46 35 44Z','bn')+'<path d="M38 12C48 12 56 18 56 28C56 36 48 40 38 40" fill="none" stroke="#0a0807" stroke-opacity=".4" stroke-width="2"/>'+P('M26 52H38V58H26Z','b'));
IC.i_halo=WINGS('bn')+'<ellipse cx="32" cy="14" rx="20" ry="7" fill="none" stroke="#ffe9a8" stroke-width="4.4"/><ellipse cx="32" cy="14" rx="20" ry="7" fill="none" stroke="#ffe9a8" stroke-width="9" opacity=".18"/>'+'<path d="M14 18L10 30L18 28ZM50 18L54 30L46 28Z" fill="#ffe9a8" opacity=".5"/>';
IC.i_greatsword=GR('rotate(-20 32 32)',P('M32 0L40 14V46H24V14Z','bn')+'<path d="M32 2V46" stroke="#0a0807" stroke-opacity=".4" stroke-width="2"/>'+P('M12 46H52V54H12Z','gd')+P('M28 54H36V64H28Z','m')+GEM(32,50,3.6,'#ff5a3c')+'<path d="M26 20L38 24M26 30L38 34" stroke="#ff5a3c" stroke-width="1.4" opacity=".7"/>');

const ROLE_BADGE={
  vanguard:'M8 1L14 3.5V8C14 11.5 11.5 14 8 15C4.5 14 2 11.5 2 8V3.5Z',
  striker:'M13 1H15V3L7 11L5 9ZM3.5 8.5L7.5 12.5L6.3 13.7L5 12.4L2.4 15L1 13.6L3.6 11L2.3 9.7Z',
  mender:'M6 1.5H10V6H14.5V10H10V14.5H6V10H1.5V6H6Z',
  reaper:'M2.5 15.5L4 15.5L8.6 4.2C10.8 3.6 13.4 4.3 15 6.4C14.2 2.6 10.4.4 6.4 1.6L7.6 3.5Z'
};
const roleBadge=r=>ROLE_BADGE[r]?'<span class="rb rb-'+r+'"><svg viewBox="0 0 16 16"><path d="'+ROLE_BADGE[r]+'"/></svg></span>':'';
// ---- hand-painted bosses and the Necromancer: more anatomy, folds, scars and wear (light from the top left)
const RIM=(d,w)=>'<path d="'+d+'" fill="none" stroke="#fff3dc" stroke-opacity=".28" stroke-width="'+(w||1.2)+'" stroke-linecap="round"/>';   // a lit edge
const FOLD=(d,w)=>'<path d="'+d+'" fill="none" stroke="#000" stroke-opacity=".38" stroke-width="'+(w||1.1)+'" stroke-linecap="round"/>';   // a crease in shadow
// ---- bespoke gear: every set piece (IC['i_'+id]) and every unique (its glyph) has its own shape; i_wa..i_tc stay as fallbacks
const CIR=(x,y,r,w)=>'M'+(x-r)+' '+y+'a'+r+' '+r+' 0 1 '+(w?1:0)+' '+2*r+' 0a'+r+' '+r+' 0 1 '+(w?1:0)+' '+(-2*r)+' 0Z';   // w: wound the other way, to cut a hole
const ANN=(x,y,R,r)=>CIR(x,y,R)+CIR(x,y,r,1);
const CHN=(y,c)=>'<path d="M13 0C13 '+y+' 22 '+(y+10)+' 32 '+(y+10)+'S51 '+y+' 51 0" fill="none" stroke="'+(c||'#a9a090')+'" stroke-width="2.4" stroke-dasharray="3.2 1.4"/>';   // a fine chain from the neck
const CORD=y=>'<path d="M13 0C13 '+y+' 22 '+(y+10)+' 32 '+(y+10)+'S51 '+y+' 51 0" fill="none" stroke="#5a4426" stroke-width="2"/>';
const GRIP=(y,c)=>P('M29 '+y+'H35V'+(y+12)+'H29Z',c||'m')+L('M29 '+(y+3)+'L35 '+(y+5)+'M29 '+(y+7)+'L35 '+(y+9),1.1)+P(CIR(32,y+15,3.2),'gd');
const SWD=(r,s)=>GR('rotate('+r+' 32 32)',s);
const BEADS=(cx,cy,rx,ry,n,r,skip)=>{ let d=''; for(let i=0;i<n;i++){ if(skip&&i===0) continue; const a=Math.PI/2+i*2*Math.PI/n; d+=CIR(+(cx+rx*Math.cos(a)).toFixed(1),+(cy+ry*Math.sin(a)).toFixed(1),r); } return d; };   // a loop of beads; skip leaves the bottom free for the pendant
const ROWS=(x,y0,n,dy,seg,w,h)=>Array.from({length:n},(_,i)=>'M'+x+' '+(y0+i*dy)+'q'+w/2+' '+h+' '+w+' 0'+('t'+w+' 0').repeat(seg-1)).join('');   // scallop rows: mail rings, bark scales
const EMB=d=>'<path d="'+d+'" fill="none" stroke="#ff7a3c" stroke-width="1.3" stroke-linecap="round" opacity=".85"/>';   // a glowing crack
const SND=d=>'<path d="'+d+'" fill="none" stroke="#e9dfc6" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round"/>';   // sound in the air
const PLATE='M18 16H46L48 54C42 60 22 60 16 54Z', COAT='M20 6L26 8C28 12 36 12 38 8L44 6L54 14L50 30L46 28V58H18V28L14 30L10 14Z', ROBE='M26 4H38L42 10L56 22L52 30L46 26L48 60H16L18 26L12 30L8 22L22 10Z';
// E : Rat Warren
IC['i_0-wa']=SWD(-35,P('M31 12L36 20L34.5 23L36.5 26L34.5 29L36 32L35 42H28L27.5 24Z')+L('M31 16V40',1)+D('M27.6 27L29.4 28.5L27.6 30Z')+P('M28.5 42H35V56H28.5Z','fl')+L('M28.5 45L35 47M28.5 49L35 51M28.5 53L35 55',1.1)+P('M35 50L43 54L41 57L35 53Z','fl'));   // Gnawed Shiv
IC['i_0-wb']=SWD(-30,P('M26 2C21 3 21 10 25 12C27 13 28 15 28.5 18L29 48C28.5 51 27 52 25 53C21 55 22 62 27 62C29 62 30 61 31 60C32 63 37 63 38 60C41 58 40 53 36.5 51C35.5 49 35 47 35 44L35.5 18C35.5 15 37 13 39 12C43 9 41 2 36 3C35 1 31 0 30 2C29 1 27 1 26 2Z','bn')+L('M31 20L31.5 30M32 38L31.5 46',1)+P('M27.6 30H36V36H27.6Z','m')+L('M27.6 33H36',1)+RIM('M26 5C24 6 24 9 26 10'));   // Femur Staff
IC['i_0-aa']=P('M20 4H25L27 12H22ZM39 4H44L42 12H37Z','m')+P('M31 10C22 9 14 15 13 26C12 38 16 50 31 58Z')+P('M33 10C42 9 50 15 51 26C52 38 48 50 33 58Z')+L('M22 18C20 28 21 40 27 50M42 18C44 28 43 40 37 50',1.2)+RIM('M17 24C17 18 20 14 26 13')+'<ellipse class="dk" cx="20" cy="34" rx="1.6" ry="2.4"/><ellipse class="dk" cx="44" cy="34" rx="1.6" ry="2.4"/><ellipse class="dk" cx="24" cy="44" rx="1.2" ry="1.8"/><ellipse class="dk" cx="40" cy="44" rx="1.2" ry="1.8"/>';   // Beetle-Shell Vest
IC['i_0-ab']=T('M46 50C55 53 59 60 52 63',2.4,'#9a7a6a')+P('M20 6C26 4 38 4 44 6L50 14L54 30L50 34L52 46L46 44L46 56L40 52L36 60L32 54L27 60L24 52L18 56L18 44L12 46L14 34L10 30L14 14Z')+T('M24 10C28 15 36 15 40 10',2,'#3a2c20')+L('M24 20L22 40M40 20L42 40M32 18V48',1)+FOLD('M16 32C20 30 24 31 26 34M48 32C44 30 40 31 38 34');   // Rat-Hide Wrap
IC['i_0-ta']=CORD(16)+P('M26 30C24 38 25 48 30 57C31 48 31 38 30 30Z','bn')+P('M38 30C40 38 39 48 34 57C33 48 33 38 34 30Z','bn')+'<path d="M29 50L30 57L28 52ZM35 50L34 57L36 52Z" fill="#c9a24a"/>'+P('M24 25H40V31H24Z','m')+L('M24 28H40',1);   // Rat-Tooth Charm
IC['i_0-tb']=T('M32 6L22 50M32 6L42 50',1.4,'#a9a090')+P(ANN(32,5,3.4,1.6),'gd')+P('M26 30C26 27 38 27 38 30V50H26Z','bn')+P('M26 30C25 34 25 38 27 38C28 36 27 33 29 31ZM38 30C39 35 38 41 36 41C35 38 36 34 35 31Z','bn')+T('M32 28V23',1.4,'#2a2018')+FLM(32,20,.55)+P('M20 48H44L41 56H23Z','gd');   // Tallow Pendant
IC['i_0-tc']=T('M32 23C26 18 26 8 32 6C38 8 38 18 32 23',2,'#5a4426')+P(CIR(32,38,17))+D(CIR(32,24,2.2))+'<ellipse class="dk" cx="32" cy="41" rx="5.5" ry="7"/>'+D(CIR(32,32,3))+L('M27 37L19 32M26.5 41H18M27 45L20 50M37 37L45 32M37.5 41H46M37 45L44 50',1.4)+RIM('M18 34C19 27 24 23 29 22');   // Mite-Husk Token
// D : Sunken Crypt
IC['i_1-wa']=SWD(-35,P('M32 2L37 10V40H27V10Z')+L('M32 4V40',1.2)+'<path d="M27 18C30 20 29 24 27 25ZM37 28C34 30 35 34 37 35ZM29 33C31 33 32 36 30 37ZM33 12C35 13 35 16 33 16Z" fill="#7a3a1e" opacity=".85"/>'+D('M37 20L35 21.5L37 23Z')+P('M18 40H46V45H18Z','m')+GRIP(45));   // Guard's Rusted Blade
IC['i_1-wb']=T('M32 28V63',3,'#8a8072')+L('M30.5 44H33.5M30.5 54H33.5',1.4)+P('M28 27H36V32H28Z','gd')+P('M22 14L32 4L42 14V28H22Z','gd')+L('M22 14H42',1.2)+D('M29 16H35V25H29Z')+E(32,20,1.5,SOULC)+T('M32 4V-1M29.5 1H34.5',1.4,'#d3a64d');   // Reliquary Rod
IC['i_1-aa']=P('M20 6L26 8C28 12 36 12 38 8L44 6L52 12L50 26L46 24V58H18V24L14 26L12 12Z')+'<path class="st" style="stroke-width:.9" d="'+ROWS(18.5,22,7,5,9,3,2)+ROWS(13,14,2,5,4,3,2)+ROWS(39,14,2,5,4,3,2)+'"/>'+P('M26 8C28 14 36 14 38 8L36 6C34 10 30 10 28 6Z','gd')+P('M18 54H46V58H18Z','m');   // Crypt Mail Vest
IC['i_1-ab']=P('M32 4C24 4 20 10 20 18C20 26 16 40 16 60H48C48 40 44 26 44 18C44 10 40 4 32 4Z')+D('M32 10C28 10 26 13 26 17C26 21 29 23 32 23C35 23 38 21 38 17C38 13 36 10 32 10Z')+L('M20 26L44 32M44 26L20 32M18 38L46 44M46 38L18 44M17 50L47 56',1.4)+RIM('M21 22C19 34 18 46 18 58');   // Burial Shroud
IC['i_1-ta']=CORD(14)+P('M32 56L18 36C18 28 24 24 32 24C40 24 46 28 46 36Z')+L('M32 56L21 31M32 56L26 26M32 56V25M32 56L38 26M32 56L43 31',1.1)+P('M27 53H37L35 58H29Z','m')+'<path d="M45 44C43 48 44 51 46 51C48 51 49 48 45 44ZM18 46C17 49 18 50 19 50C20 50 21 49 18 46Z" fill="#6fa894" opacity=".85"/>';   // Brine Amulet
IC['i_1-tb']=P('M26 40L20 62L26 58L30 62L32 44ZM38 40L44 62L38 58L34 62L32 44Z','m')+P('M32 14C38 13 44 16 46 22C49 27 48 34 45 38C42 44 36 46 30 45C24 44 18 40 17 33C16 27 19 20 24 17C26 15 29 14 32 14Z')+'<circle cx="32" cy="30" r="10" fill="none" stroke="#0a0807" stroke-opacity=".45" stroke-width="1.4"/>'+D('M32 22C28 22 26 25 26 28C26 31 28 32 29 33V36H35V33C36 32 38 31 38 28C38 25 36 22 32 22Z')+'<circle cx="29.6" cy="28" r="1.5" fill="currentColor"/><circle cx="34.4" cy="28" r="1.5" fill="currentColor"/>';   // Grave-Wax Seal
IC['i_1-tc']=P(ANN(32,38,17,11))+P('M23 17H41V23H23Z','m')+P('M28 23H36V27H28Z','m')+P('M43 31L57 22L55 28Z','m')+L('M18 32C20 28 23 25 26 24',1.2)+'<path d="M17 44C19 46 18 49 16 48ZM44 50C46 50 46 53 44 53Z" fill="#7a3a1e" opacity=".8"/>';   // Coffin-Nail Ring
// C : Ember Barrow
IC['i_2-wa']=SWD(-35,P('M32 2C36 8 38 14 37 20L39 24L36.5 27L38.5 31L36 34L37 40H27L28 34L25.5 31L27.5 27L25 24L27 20C26 14 28 8 32 2Z','bn')+L('M32 6V38',1)+P('M20 40C22 38 26 39 28 41H36C38 39 42 38 44 40C44 43 40 45 36 44H28C24 45 20 43 20 40Z','bn')+GRIP(44));   // Wight-Bone Blade
IC['i_2-wb']=T('M30 63C33 50 28 40 32 28C34 22 30 18 32 14',3.6,'currentColor')+T('M32 16C24 14 22 6 26 2M32 16C40 14 42 6 38 2',2.2,'currentColor')+FLM(32,11,.8)+E(32,10,1.6,FIREC)+T('M30.5 30L24 38',1.2,'#a9a090')+P(CIR(24,40.5,2.4),'bn')+L('M29 44L34 46M29 48L34 50',1.2);   // Pyre-Witch Staff
IC['i_2-aa']=P('M18 8L26 6C28 10 36 10 38 6L46 8L50 16L48 30L46 50C42 56 22 56 18 50L16 30L14 16Z')+L('M32 10V54M20 26C26 30 38 30 44 26',1.2)+EMB('M22 36L26 40L24 46M40 18L37 24L41 30M34 44L38 48')+E(38,24,1.1,FIREC)+'<circle class="gd" cx="18" cy="12" r="1.6"/><circle class="gd" cx="46" cy="12" r="1.6"/>'+RIM('M17 18C17 26 18 36 20 46');   // Ashplate Cuirass
IC['i_2-ab']=P(ROBE)+D('M28 4L32 14L36 4Z')+P('M18 34H46V38H18Z','m')+FOLD('M24 40L22 58M40 40L42 58M32 40V58')+'<path d="M17 57H47M9.5 23.5L13 28M54.5 23.5L51 28" stroke="#ff7a3c" stroke-width="1.6" stroke-dasharray="2 2" fill="none"/>'+E(26,57,1.2,FIREC);   // Cinder-Weave Robe
IC['i_2-ta']=CHN(8)+P('M29 16H35V23H29Z','gd')+P('M32 22C40 22 46 30 46 40C46 50 40 58 32 58C24 58 18 50 18 40C18 30 24 22 32 22Z','gd')+'<ellipse class="dk" cx="32" cy="40" rx="8" ry="11"/>'+FLM(32,43,.55)+E(32,40,2,FIREC)+RIM('M21 34C22 28 26 25 30 24');   // Ember Locket
IC['i_2-tb']=P(BEADS(32,24,15,14,13,2.6,1))+'<circle cx="17" cy="24" r="1.5" fill="#ff7a3c"/><circle cx="43.5" cy="13" r="1.5" fill="#ff7a3c"/>'+T('M32 38V46',1.4,'#a9a090')+P(CIR(32,41,2.4))+P('M30 46H34V51H38V55H34V63H30V55H26V51H30Z','gd')+E(32,53,1.2,FIREC);   // Cinder Rosary
IC['i_2-tc']=P('M22 52C10 44 8 26 18 16C26 8 38 8 46 16C56 26 54 44 42 52L38 47C46 41 47 29 41 21C36 15 28 15 23 21C17 29 18 41 26 47Z','gd')+P(CIR(24,51,4.2)+CIR(40,51,4.2),'gd')+'<path d="M16 22L20 25M13 30L18 31M13 38L18 37M16 46L20 43M24 13L26 18M32 11V16M40 13L38 18M48 22L44 25M51 30L46 31M51 38L46 37M48 46L44 43" stroke="#0a0807" stroke-opacity=".45" stroke-width="1.3"/>';   // Barrow Torque
// B : Cathedral
IC['i_3-wa']=SWD(-30,P('M30 2C38 10 40 24 37 40H27C26 26 26 12 30 2Z','bn')+L('M30 6C34 14 35 26 33 38',1)+P('M27 40C20 36 14 38 10 34C12 42 20 46 28 45ZM37 40C44 36 50 38 54 34C52 42 44 46 36 45Z','m')+P('M27 40H37V46H27Z','m')+GRIP(46));   // Gargoyle-Fang Sword
IC['i_3-wb']=T('M32 63V12C32 4 44 2 46 10',3.4,'#6a5034')+L('M30.4 40L33.6 42M30.4 46L33.6 48',1.2)+T('M46 10V16',1.4,'#a9a090')+P('M46 16C40 16 39 22 39 28L37 32H55L53 28C53 22 52 16 46 16Z','gd')+P(CIR(46,34,2),'gd')+SND('M57 22C60 25 60 29 57 32M60 19C64 24 64 30 60 35');   // Chorister's Bell Staff
IC['i_3-aa']=P('M20 14H44L46 54C40 60 24 60 18 54Z')+P('M26 10H38L40 16H24Z','m')+P('M20 14C12 8 4 10 2 16C6 18 8 24 8 30C12 26 16 26 20 28ZM44 14C52 8 60 10 62 16C58 18 56 24 56 30C52 26 48 26 44 28Z','m')+L('M20 32H44M19 44H45M32 34V58',1.2)+'<path class="dk" d="M26 22L30 24L26 25.5ZM38 22L34 24L38 25.5ZM29 28H35L32 30Z"/>';   // Gargoyle Plate
IC['i_3-ab']=P('M32 4C26 4 22 6 20 10L10 14L14 58H50L54 14L44 10C42 6 38 4 32 4Z')+'<ellipse class="dk" cx="32" cy="8" rx="6" ry="3"/>'+P('M28 11H36V58H28Z','gd')+D('M31 20H33V36H31ZM27.5 25H36.5V27H27.5Z')+P('M14 55H50V58H14Z','gd')+FOLD('M18 20L20 54M46 20L44 54');   // Vestments of the Choir
IC['i_3-ta']=P('M14 60V26C14 12 22 4 32 4C42 4 50 12 50 26V60Z','m')+'<path d="M18 26C18 15 24 8 31 8V26Z" fill="#c8862c"/><path d="M33 8C40 8 46 15 46 26H33Z" fill="#a83a2c"/><path d="M18 28H31V42H18Z" fill="#5f8a4a"/><path d="M33 28H46V42H33Z" fill="#c8862c"/><path d="M18 44H31V56H18Z" fill="#a83a2c"/><path d="M33 44H46V56H33Z" fill="#5f8a4a"/>'+'<path d="M18 26C18 15 24 8 32 8C40 8 46 15 46 26V56H18Z" fill="url(#txGlass)"/>'+GEM(32,27,4,'#e0b04a')+E(24,18,1.3,'#ffe9a8');   // Stained-Glass Relic
IC['i_3-tb']=T('M32 16V5M28 9H36',2,'#d3a64d')+P('M12 30L32 16L52 30ZM14 30H50V54H14ZM14 54H20V60H14ZM44 54H50V60H44Z','gd')+D('M18 50V40C18 36 24 36 24 40V50ZM29 50V40C29 36 35 36 35 40V50ZM40 50V40C40 36 46 36 46 40V50Z')+E(21,45,1,SOULC)+E(32,45,1,SOULC)+E(43,45,1,SOULC)+GEM(32,25,2.6,'#c9402c')+L('M14 30H50',1.2);   // Nave Reliquary
IC['i_3-tc']=CHN(8)+P('M22 28C22 22 28 22 32 24C36 22 42 22 42 28C42 34 40 38 40 44L37 58L33 46H31L27 58L24 44C24 38 22 34 22 28Z','bn')+P('M21 26C22 20 28 20 32 22C36 20 42 20 43 26L42 30H22Z','gd')+GEM(32,25,2,'#c9402c')+L('M32 32V44',1);   // Bishop's Tooth Pendant
// A : Orchard
IC['i_4-wa']=SWD(-35,P('M32 2L37 12V40H27V12Z')+P('M37 16L42 13L37 20ZM37 26L42 23L37 30ZM37 35L41 33L37 38ZM27 20L22 17L27 24ZM27 30L22 27L27 34Z','m')+T('M28 38C36 34 28 28 36 24C30 20 34 14 31 10',1.6,'#4b6031')+P('M36 24C40 22 42 24 41 26C39 27 37 26 36 24Z','lf')+P('M20 40C24 38 28 42 32 40C36 42 40 38 44 40V45H20Z','m')+GRIP(45));   // Thornblade
IC['i_4-wb']=T('M32 26V63',3.8,'currentColor')+T('M32 30C24 26 20 18 22 10M32 30C40 26 44 18 42 10M32 28V8',2.2,'currentColor')+P('M32 26C24 20 22 14 25 11C28 8 31 10 32 13C33 10 36 8 39 11C42 14 40 20 32 26Z','gd')+E(30,16,1.3,'#ffb38a')+L('M30 40L34 42M30 50L34 52',1.2);   // Heartwood Scepter
IC['i_4-aa']=P(COAT)+'<path class="st" d="'+ROWS(18,20,7,6,4,7,5)+'"/>'+RIM('M18 28V56')+'<circle class="gd" cx="25" cy="17" r="1.3"/><circle class="gd" cx="39" cy="17" r="1.3"/><circle class="gd" cx="32" cy="35" r="1.3"/>';   // Ironbark Hauberk
IC['i_4-ab']=P('M26 4H38L42 10L54 20L50 28L46 26L48 52L44 60L40 54L36 62L32 54L28 62L24 54L20 60L16 52L18 26L14 28L10 20L22 10Z')+D('M28 4L32 12L36 4Z')+'<path d="M22 32C26 34 24 40 21 40ZM40 40C44 42 43 48 39 47ZM30 18C34 20 33 24 30 24ZM26 48C28 50 27 53 25 52Z" fill="#8a3a1a" opacity=".75"/>'+T('M18 34C26 38 38 38 46 34',2,'#8a6a3e')+FOLD('M24 40L22 54M40 40L42 52');   // Raiment of Rust
IC['i_4-ta']=CHN(10)+P('M32 22C42 28 44 44 32 58C20 44 22 28 32 22Z')+L('M32 26C30 36 30 46 32 54',1.2)+T('M32 22C32 16 36 12 40 12',1.6,'#6f8a3e')+P('M40 12C44 8 50 10 50 12C46 16 42 15 40 12Z','lf')+RIM('M26 34C26 30 28 27 30 26')+E(32,42,1.2,SOULC);   // Mother's Seed Pendant
IC['i_4-tb']=P(BEADS(32,22,15,14,13,2.6,1))+T('M32 36V44',1.4,'#a9a090')+P(CIR(32,40,2.2))+P('M32 44C26 52 26 58 32 61C38 58 38 52 32 44Z')+E(30,54,1.3,'#ffd0a0');   // Sapblood Rosary
IC['i_4-tc']=P('M32 18C44 18 52 28 52 40C52 52 42 60 32 60C22 60 12 52 12 40C12 28 20 18 32 18Z')+P('M26 20L24 10L29 14L32 8L35 14L40 10L38 20Z','m')+L('M32 22C26 32 26 48 32 58M32 22C38 32 38 48 32 58',1.1)+P('M38 14C44 8 52 10 52 12C48 16 42 17 38 14Z','lf')+'<circle class="gd" cx="20" cy="40" r="1.3"/><circle class="gd" cx="44" cy="40" r="1.3"/>'+RIM('M16 34C18 26 24 21 30 20');   // Iron Fruit Talisman
// S : the Throne
IC['i_5-wa']=SWD(-35,P('M32 0L38 10V42H26V10Z','bn')+'<path d="M32 6V38" stroke="#ff7a3c" stroke-width="2" opacity=".85"/>'+E(32,22,1.2,FIREC)+P('M16 42L18 36L23 40L27 35L32 40L37 35L41 40L46 36L48 42V47H16Z','gd')+GEM(32,44,2,'#c9402c')+GRIP(47));   // Sovereign's Cinderblade
IC['i_5-wb']=T('M32 26V63',3,'#a98a4a')+P('M27 27H37L35 33H29Z','gd')+P(ANN(32,16,12,8),'gd')+SKULL(32,16.5,.34,'bn')+SND('M14 8C9 12 9 20 14 24M50 8C55 12 55 20 50 24M10 4C3 10 3 22 10 28M54 4C61 10 61 22 54 28');   // Choir-Song Scepter
IC['i_5-aa']=P(PLATE)+P('M24 6H40L42 16H22Z','m')+P('M18 14C10 14 6 20 6 28L16 30L20 22ZM46 14C54 14 58 20 58 28L48 30L44 22Z','m')+CROWNP(32,34,.6)+L('M18 46H46',1.2)+RIM('M17 22V50');   // Throne-Guard Plate
IC['i_5-ab']=P('M32 6C22 6 16 10 14 16L8 56H56L50 16C48 10 42 6 32 6Z')+D('M26 8C28 13 36 13 38 8Z')+P('M30 14H34V50H30ZM22 24H42V28H22Z','gd')+'<path d="'+Array.from({length:12},(_,i)=>'M'+(9.5+i*4.2).toFixed(1)+' 56v'+(4+i%2)).join('')+'" stroke="#a98a4a" stroke-width="1.3"/>'+FOLD('M18 20L13 54M46 20L51 54');   // Revenant Pall
IC['i_5-ta']=P('M10 48L14 22L22 32L30 12L36 30L40 26L44 36L40 40L46 48L36 52L30 46L22 54Z','gd')+L('M30 16L28 30L33 38M14 26L18 40',1.1)+GEM(26,40,3.6,'#c9402c')+'<circle cx="48" cy="18" r="1" fill="#8a8072"/><circle cx="52" cy="26" r=".8" fill="#8a8072"/><circle cx="44" cy="12" r=".7" fill="#8a8072"/>'+E(38,44,1,FIREC);   // Ashen Crown Shard
IC['i_5-tb']=CHN(12)+'<path d="M40 30C46 24 44 18 50 13C48 20 52 24 47 31Z" fill="#d8e8d0" opacity=".35"/>'+P(CIR(32,40,14),'gd')+'<circle cx="32" cy="40" r="10" fill="none" stroke="#0a0807" stroke-opacity=".45" stroke-width="1.3"/>'+D('M32 32C28.5 32 27 35 27 38V48L29 46L30.7 48L32 46L33.3 48L35 46L37 48V38C37 35 35.5 32 32 32Z')+E(30,38,.8,SOULC)+E(34,38,.8,SOULC);   // Whisper Locket
IC['i_5-tc']=P(ANN(32,42,16,10.5),'gd')+P('M22 12H42C44 12 46 14 46 16V28C46 30 44 32 42 32H22C20 32 18 30 18 28V16C18 14 20 12 22 12Z','gd')+D('M22 15H42V29H22Z')+CROWNP(32,23,.5)+RIM('M19 40C20 34 23 31 26 30');   // Court Signet
// uniques
IC.i_keyblade=SWD(-35,P('M29 6L32 1L35 6V42H29Z')+P('M35 8H44V12H40V15H44V19H35Z')+L('M32 4V40',1)+P('M20 42H44V46H20Z','gd')+P('M29 46H35V50H29Z','m')+P(ANN(32,56,6.5,3.2),'gd')+GEM(32,44,1.6,SOULC));   // Warden's Key-Blade
IC.i_cinderplate=P(PLATE)+P('M24 6H40L42 14H22Z','m')+P('M18 12C8 12 4 20 6 30L18 28ZM46 12C56 12 60 20 58 30L46 28Z','m')+EMB('M24 24L28 30L26 38L30 44M40 20L37 28L40 34M34 48L37 54')+FLM(11,11,.6)+FLM(53,11,.6)+E(32,32,1.6,FIREC)+L('M32 16V56',1.2);   // Ember Knight's Cinderplate
IC.i_tithestaff=T('M32 26V63',3.4,'#5a4426')+T('M32 26V16C32 6 46 4 48 14C49 20 42 22 40 18',3.4,'#d3a64d')+P('M20 26H44L42 30H22Z','gd')+'<path fill="#e9dfc6" d="M25 30L26 33L27 30ZM29 30L30 33L31 30ZM33 30L34 33L35 30ZM37 30L38 33L39 30Z"/>'+T('M22 30V37M42 30V39',1.2,'#a9a090')+P(CIR(22,40,3)+CIR(42,42,3),'gd');   // Bishop's Tithe-Staff
IC.i_paleshroud=P('M32 4C24 4 20 10 20 18L12 60H52L44 18C44 10 40 4 32 4Z')+D('M32 10C28 10 26 13 26 17C26 21 29 24 32 24C35 24 38 21 38 17C38 13 36 10 32 10Z')+FOLD('M24 32L19 58M40 32L45 58M32 36V60',1.2)+CROWNP(32,30,.42)+'<path d="M14 60C12 63 15 64 17 62M50 60C52 63 49 64 47 62" stroke="#d8e8d0" stroke-opacity=".4" stroke-width="1.2" fill="none"/>';   // Funeral Shroud of the Pale Sovereign
// Hell Tower uniques
IC.i_houndfang=SWD(-35,P('M30 14C37 20 38 30 36 40H28C28 32 28 22 30 14Z','bn')+L('M31 18C34 24 34 32 33 38',1)+P('M22 40H42V44H22Z','m')+P('M28 44H36V56H28Z','fl')+L('M28 47L26 49M36 50L38 52M28 53L26 55',1.2)+P('M28 56L32 63L36 56Z','bn'));   // Hound-Fang Dagger
IC.i_embermantle=P('M20 34H44L46 60H18Z','m')+P('M32 8C22 8 14 12 8 20L6 36C14 32 22 34 32 34C42 34 50 32 58 36L56 20C50 12 42 8 32 8Z')+P('M24 6H40L38 14H26Z','m')+FLM(12,40,.5,'#e0502c')+FLM(22,40,.55)+FLM(32,41,.6,'#e0502c')+FLM(42,40,.55)+FLM(52,40,.5,'#e0502c')+FOLD('M20 14L16 32M44 14L48 32');   // Matron's Ember Mantle
IC.i_flychitin='<path d="M20 18C10 10 2 14 2 22C6 32 14 34 20 30ZM44 18C54 10 62 14 62 22C58 32 50 34 44 30Z" fill="#c8c8b0" opacity=".35"/>'+L('M18 22L6 20M18 26L8 28M46 22L58 20M46 26L56 28',.8)+P('M32 10C42 10 46 18 46 28C46 42 40 54 32 60C24 54 18 42 18 28C18 18 22 10 32 10Z')+L('M19 24H45M19 32H45M20 40H44M23 48H41',1.4)+P('M22 12L16 6L24 9ZM42 12L48 6L40 9Z','m')+RIM('M21 20C22 15 26 12 30 11');   // Chitin of the Fly-Lord
IC.i_ribstaff=T('M32 34V63',3.4,'#5a4426')+P('M30 4H34V38H30Z','bn')+T('M32 10C22 10 20 20 24 24M32 10C42 10 44 20 40 24M32 18C24 18 22 26 26 30M32 18C40 18 42 26 38 30M32 26C26 26 26 32 28 34M32 26C38 26 38 32 36 34',2.2,'#e9dfc6')+P(CIR(32,3,3),'bn')+E(32,20,1.2,SOULC);   // Cantor's Rib-Staff
IC.i_collar='<path d="M20 44L12 63M44 44L52 63" stroke="#8a8072" stroke-width="3" stroke-dasharray="4 1.6" fill="none"/>'+P(ANN(32,28,20,13))+'<circle class="gd" cx="12.5" cy="28" r="1.6"/><circle class="gd" cx="51.5" cy="28" r="1.6"/><circle class="gd" cx="32" cy="8.5" r="1.6"/><circle class="gd" cx="18" cy="14" r="1.4"/><circle class="gd" cx="46" cy="14" r="1.4"/>'+T('M29 46V43C29 40 35 40 35 43V46',1.6,'#d3a64d')+P('M27 46H37V56H27Z','gd')+D('M32 49a1.4 1.4 0 1 1 .1 0L33 54H31Z')+RIM('M15 22C17 16 22 12 28 11');   // Chain-Duke's Collar
IC.i_hellplate=P('M18 18C10 16 4 8 6 0C10 6 14 10 22 12ZM46 18C54 16 60 8 58 0C54 6 50 10 42 12Z','bn')+P(PLATE)+P('M18 14C10 16 6 22 8 30L18 28ZM46 14C54 16 58 22 56 30L46 28Z','m')+'<path d="M32 28L36 36L32 44L28 36Z" fill="#ff5a3c"/>'+E(32,36,1.8,HELLC)+L('M32 16V28M32 44V58M18 48H46',1.2);   // Vael's Hellplate
IC.i_ruincrown=FLM(24,12,.5,'#e0502c')+FLM(44,10,.5)+P('M8 52L5 18L18 30L24 14L30 26L34 20L38 28L44 12L50 30L60 18L56 52Z','gd')+D('M33 21L36 34L32 40L35 52H31L29 40L32 34Z')+P('M8 48H56V56H8Z','gd')+GEM(18,44,3,'#c9402c')+GEM(46,44,3,'#c9402c')+D(CIR(26,52,1.6));   // Crown of Ruin
IC.i_lastmantle=P('M32 6C20 6 12 12 8 22L4 60H60L56 22C52 12 44 6 32 6Z')+P('M24 30H40L42 58H22Z','m')+L('M22 44H42',1.2)+P('M14 16C20 24 44 24 50 16L48 26C42 32 22 32 16 26Z','bn')+'<path class="dk" d="M22 24l1 3 1-3zM32 27l1 3 1-3zM42 24l1 3 1-3z"/>'+CROWNP(32,22,.4)+FOLD('M14 30L10 58M50 30L54 58');   // Mantle of the Last Sovereign
const IMAT={'i_0-wb':['bone','#b9ad94'],'i_0-aa':['chitin','#3d4a3c'],'i_0-ab':['fur','#6f6253'],'i_0-ta':['fur','#5a4a3a'],'i_0-tb':['cloth','#6b5a44'],'i_0-tc':['chitin','#8a7556'],
 'i_1-ab':['cloth','#8a8270'],'i_1-ta':['bone','#8fa89a'],'i_1-tb':['stone','#7a3024'],'i_1-tc':['metal','#5a5650'],
 'i_2-wb':['wood','#5a4632'],'i_2-aa':['metal','#4f4a44'],'i_2-ab':['cloth','#4a3a30'],'i_2-tb':['stone','#3a3330'],
 'i_3-wa':['stone','#6a665e'],'i_3-aa':['stone','#6a665e'],'i_3-ab':['cloth','#5a2a24'],'i_3-ta':['glass','#2a2622'],
 'i_4-wa':['wood','#5a4a36'],'i_4-wb':['wood','#5a4632'],'i_4-aa':['wood','#4e4234'],'i_4-ab':['cloth','#6a4630'],'i_4-ta':['wood','#6a5032'],'i_4-tb':['glass','#8a3a22'],'i_4-tc':['metal','#5a5650'],
 'i_5-ab':['cloth','#3a3632'],
 i_cinderplate:['metal','#3a3532'],i_paleshroud:['cloth','#a8a090'],i_houndfang:['fur','#6a5a48'],i_embermantle:['cloth','#5a3226'],i_flychitin:['chitin','#3a4232'],i_collar:['metal','#4a4642'],i_hellplate:['metal','#4a2a24'],i_lastmantle:['cloth','#4a2a26']};   // gear that is not worn steel: its own material and colour
const iglyph=d=>d.glyph&&IC[d.glyph]?d.glyph:IC['i_'+d.id]?'i_'+d.id:'i_'+d.kind;   // own shape first; the old shared kind glyphs are the fallback
IC['Necromancer']=P('M32 14C20 14 14 24 13 36C12 46 8 54 4 64H60C56 54 52 46 51 36C50 24 44 14 32 14Z','m')
  +FOLD('M24 42C22 50 20 57 18 64M32 44V64M40 42C42 50 44 57 46 64M14 50C17 52 20 52 23 50',1.2)+RIM('M16 40C14 48 11 56 8 63',1.4)
  +P('M32 3C21 3 15 12 15 23C15 30 17 35 20 40C24 42 40 42 44 40C47 35 49 30 49 23C49 12 43 3 32 3Z')
  +D('M32 11C25 11 21 17 21 25C21 32 25 37 32 37C39 37 43 32 43 25C43 17 39 11 32 11Z')
  +'<path d="M32 17C27.5 17 25.5 21 25.5 25C25.5 29 27.5 32.5 29.5 33.5H34.5C36.5 32.5 38.5 29 38.5 25C38.5 21 36.5 17 32 17Z" fill="#cfc4a8" opacity=".18"/>'
  +'<path d="M29.5 33.5V36M32 34V36.5M34.5 33.5V36" stroke="#cfc4a8" stroke-opacity=".25" stroke-width=".7"/>'
  +E(28.3,25,1.25,SOULC)+E(35.7,25,1.25,SOULC)
  +FOLD('M18 30C20 21 25 15 32 12M46 30C44 21 39 15 32 12',1)+RIM('M18 26C19 16 24 8 31 5',1.3)
  +GEM(32,43,1.9,'#8fd46a')+FOLD('M26 41C28 43 36 43 38 41',.8)
  +T('M53 11V64',2.6,'#4a3a2a')+RIM('M52.2 16V62',.6)+SKULL(53,10,.42,'bn',SOULC)
  +P('M48 38C50 36 54 36 56 38V42C54 43 50 43 48 42Z','bn')+L('M50 38V42.5M52 37.6V42.8M54 38V42.5',.55)
  +'<path d="M7 24C4 18 11 15 8 9M58 28C61 22 56 19 59 13" stroke="#9be870" stroke-opacity=".35" stroke-width="1.3" fill="none" stroke-linecap="round"/>';

IC['The Rat King']=P('M5 64C5 50 13 42 32 42S59 50 59 64Z','m')+FOLD('M20 48L16 64M44 48L48 64',1)
  +P('M15 25C8 19 8 10 14 8C19 9 21 15 20.5 21Z')+P('M49 25C56 19 56 10 50 8C45 9 43 15 43.5 21Z')
  +'<path d="M14.5 21.5C11.5 17.5 11.5 12.5 14.5 11.5C17.5 12.5 18.5 15.5 18 18.5Z" fill="#9a5c50" opacity=".85"/><path d="M49.5 21.5C52.5 17.5 52.5 12.5 49.5 11.5C46.5 12.5 45.5 15.5 46 18.5Z" fill="#9a5c50" opacity=".85"/>'+D('M52.5 11L56 12.5L53.5 15Z')
  +P('M32 14C46 14 54 24 54 34C54 42 48 48 40 50L32 58L24 50C16 48 10 42 10 34C10 24 18 14 32 14Z')
  +P('M32 33C38.5 33 42.5 37.5 42.5 43C42.5 48.5 37.5 53 32 53C26.5 53 21.5 48.5 21.5 43C21.5 37.5 25.5 33 32 33Z','fl')
  +L('M24 20L26.2 24.5M29.5 17.5L30.6 22M34.5 17.5L33.4 22M40 20L37.8 24.5M15 30L18.5 32M49 30L45.5 32',.8)
  +D('M19.5 29C19.5 25.8 27.5 25.8 27.5 29C27.5 32.2 19.5 32.2 19.5 29ZM36.5 29C36.5 25.8 44.5 25.8 44.5 29C44.5 32.2 36.5 32.2 36.5 29Z')+E(23.5,29,1.4,'#ff4a2c')+E(40.5,29,1.4,'#ff4a2c')
  +'<path d="M38 21L45.5 35" stroke="#d89080" stroke-width="1" opacity=".75"/>'
  +'<path d="M28.5 40C28.5 37.6 35.5 37.6 35.5 40C35.5 42.4 33.5 43.6 32 43.6C30.5 43.6 28.5 42.4 28.5 40Z" fill="#2a1412"/><path d="M30 39.2C30.6 38.6 31.4 38.6 31.8 39" stroke="#fff" stroke-opacity=".35" stroke-width=".6"/>'
  +L('M32 43.6V46.5M32 46.5C30 48 28 48 27 47M32 46.5C34 48 36 48 37 47',.8)
  +'<path d="M29.9 47H31.8V54H29.9ZM32.2 47H34.1V54H32.2Z" fill="#e3c26a"/><path d="M29.9 52H34.1" stroke="#7a5a20" stroke-width=".5"/>'
  +'<path d="M22 44L7 41M22 46.5L6 47.5M42 44L57 41M42 46.5L58 47.5" stroke="#d8ccb4" stroke-opacity=".6" stroke-width=".6"/>'
  +RIM('M14 30C15 22 21 16 29 15',1.3)
  +GR('rotate(-12 32 12)',CROWNP(32,13,.62))+GEM(26,13,1.2,'#c9402c');

IC['The Crypt Warden']=P('M3 64V47C3 39 11 35 22 35H42C53 35 61 39 61 47V64Z','m')
  +P('M3 47C3 39 9 34.5 18 36.5L20.5 48Z')+P('M61 47C61 39 55 34.5 46 36.5L43.5 48Z')+L('M5 44L19 45M59 44L45 45',.9)
  +FOLD('M10 52H54M8 58H56',1)+RIM('M5 46C6 41 10 38 16 37.5',1.1)
  +P('M18 37V16C18 8 24 4 32 4S46 8 46 16V37C46 41 40 43 32 43S18 41 18 37Z')
  +P('M20 12.5L22 7L26 10.5L32 4.5L38 10.5L42 7L44 12.5Z','gd')
  +D('M21 20H43V24.5H21Z')+E(27,22.2,1.2,'#ffd27a')+E(37,22.2,1.2,'#ffd27a')
  +'<g class="dk"><circle cx="26" cy="31" r=".95"/><circle cx="29" cy="32.2" r=".95"/><circle cx="35" cy="32.2" r=".95"/><circle cx="38" cy="31" r=".95"/><circle cx="32" cy="33" r=".95"/></g>'
  +L('M32 12.5V20M32 24.5V43',1.1)+RIM('M23.5 9C20.8 13 20 19 20 32',1.5)
  +'<g class="gd"><circle cx="20.2" cy="17" r=".85"/><circle cx="43.8" cy="17" r=".85"/><circle cx="20.2" cy="35" r=".85"/><circle cx="43.8" cy="35" r=".85"/></g>'
  +'<path d="M18.5 28C17.4 31 18.4 33.5 17.2 37M45.5 26C46.6 29 45.6 31 46.8 34" stroke="#5f8a58" stroke-width="1.2" opacity=".75" fill="none"/>'
  +'<circle cx="32" cy="52" r="5" fill="none" stroke="#c8a24a" stroke-width="1.7"/>'+P('M29.2 56H31.2V63.5H29.2Z','gd')+P('M33.6 55.4L35.6 56.2L33.8 63.6L31.9 62.9Z','gd')
  +'<path d="M29.2 60H27.6M29.2 62H27.9M35 60.3L36.6 60.9" stroke="#c8a24a" stroke-width="1.1"/>';

IC['The Ember Knight']=P('M3 64V47C3 39 11 35 22 35H42C53 35 61 39 61 47V64Z','m')
  +P('M3 47C3 39 9 34.5 18 36.5L20.5 48Z')+P('M61 47C61 39 55 34.5 46 36.5L43.5 48Z')+FOLD('M10 53H54M8 59H56',1)
  +'<path d="M9 48L15 52L13 58M51 46L46.5 52L50.5 57M27 50L30 55" stroke="#ff7a2c" stroke-width=".9" fill="none" opacity=".9"/>'
  +P('M17 39V18C17 9 24 4 32 4S47 9 47 18V39L40 43H24Z')
  +D('M20 20H44L42 27.5H22Z')+'<path d="M23.5 23.5H40.5" stroke="#ff7a2c" stroke-width="1.8"/><path d="M24 23.5H40" stroke="#ffd27a" stroke-width=".6"/>'
  +'<path d="M27 31.5V37M30 31.5V38M34 31.5V38M37 31.5V37" stroke="#ff5a1c" stroke-width="1.05" opacity=".9"/>'
  +L('M32 4V20',1.1)+RIM('M23 9C20 13 19.5 19 19.5 34',1.4)
  +'<path d="M22 11L25.5 15M42 30L44.5 34" stroke="#ff7a2c" stroke-width=".8" opacity=".85"/>'
  +FLM(32,4,.55)+'<g fill="#ffb347"><circle cx="8" cy="20" r=".8"/><circle cx="56" cy="14" r=".6"/><circle cx="53" cy="28" r=".7"/><circle cx="11" cy="31" r=".55"/><circle cx="48" cy="6" r=".5"/></g>';

IC['The Bishop of Teeth']=P('M3 64C5 50 14 42 32 42S59 50 61 64Z','m')+FOLD('M14 52L10 64M50 52L54 64',1.1)
  +P('M26 42L24 64H30L32 47L34 64H40L38 42Z','gd')+'<path d="M27 50H29.5M26.4 56H29M34.5 50H37M35 56H37.6" stroke="#5a3a10" stroke-width="1"/>'
  +'<g fill="#e3d8be">'+[14,18,22,42,46,50].map((x,i)=>'<path d="M'+x+' '+(47+Math.abs(i-2.5)*.8)+'l1.3 3.4 1.3-3.4z"/>').join('')+'</g>'
  +P('M32 21C40.5 21 45.5 27.5 45.5 35C45.5 41.5 41 45.5 32 45.5C23 45.5 18.5 41.5 18.5 35C18.5 27.5 23.5 21 32 21Z','bn')
  +P('M19.5 26L21.5 9.5L32 1.5L42.5 9.5L44.5 26Z','gd')+'<path d="M28.8 6.5L32 3.8L35.2 6.5V24.5H28.8Z" fill="#6e2a20"/>'
  +'<path d="M32 8.5V19M28.5 12.5H35.5" stroke="#e8c86a" stroke-width="1.4"/>'+P('M19.5 21.5H44.5V26.5H19.5Z','gd')+GEM(25,24,1.3,'#c9402c')+GEM(32,24,1.5,'#8fd46a')+GEM(39,24,1.3,'#c9402c')
  +RIM('M22.5 23L24 11L31 5.5',1.1)
  +D('M22.6 31C22.6 27.8 29 27.8 29 31C29 34.2 22.6 34.2 22.6 31ZM35 31C35 27.8 41.4 27.8 41.4 31C41.4 34.2 35 34.2 35 31Z')+E(25.8,31,1,'#ffd27a')+E(38.2,31,1,'#ffd27a')
  +D('M22.5 36.5H41.5C41.5 41 37.5 44.5 32 44.5C26.5 44.5 22.5 41 22.5 36.5Z')
  +'<path d="M23.5 36.5L25 40.6L26.6 36.5L28.1 41.4L29.7 36.5L31.2 41.8L32.8 36.5L34.3 41.8L35.9 36.5L37.4 41.4L39 36.5L40.4 40Z" fill="#ece2c8"/>'
  +'<path d="M25.5 44L26.8 40.8L28.2 44.2M30.8 44.5L32 41L33.2 44.5M35.8 44.2L37.2 40.8L38.5 44" fill="#d8ccb0"/>'
  +L('M27 27L29 24.5',.6);

IC['The Orchard Mother']=P('M14 64C18 60 22 58 24.5 56L26.5 64ZM50 64C46 60 42 58 39.5 56L37.5 64Z')
  +P('M22 64C24 54 26 46 26 39H38C38 46 40 54 42 64Z')+L('M28 44C28.5 50 27.5 56 28.5 63M33 42C33.5 49 32.5 56 33.5 63M36.5 46C37 52 36.5 58 37.5 63',.8)
  +T('M25 44C17 44 11 40 6 33M6 33L3 29M6 33L4.5 36M39 44C47 44 53 40 58 33M58 33L61 29M58 33L59.5 36',2.4,'currentColor')
  +P('M32 2C46 2 60 10 60 22C60 32 52 36 46 34C44 40 38 42 32 42C26 42 20 40 18 34C12 36 4 32 4 22C4 10 18 2 32 2Z','lf')
  +RIM('M8 18C10 10 20 5 30 4.5',1.4)+FOLD('M12 30C16 32 20 31 22 28M52 30C48 32 44 31 42 28',1)
  +P('M32 13.5C38.5 13.5 42.5 20 42.5 27C42.5 34 38.5 39.5 32 39.5C25.5 39.5 21.5 34 21.5 27C21.5 20 25.5 13.5 32 13.5Z','m')
  +L('M26 17C27 20 26.5 23 27.5 25M38 17C37 20 37.5 23 36.5 25M24.5 31C26 34 28 36 30 37',.7)
  +D('M25.5 25C25.5 22.4 30.5 22.4 30.5 25C30.5 27.6 25.5 27.6 25.5 25ZM33.5 25C33.5 22.4 38.5 22.4 38.5 25C38.5 27.6 33.5 27.6 33.5 25Z')+E(28,25,1.15,'#ffb347')+E(36,25,1.15,'#ffb347')
  +D('M29.5 32C29.5 30 34.5 30 34.5 32C34.5 35 33.2 36.5 32 36.5C30.8 36.5 29.5 35 29.5 32Z')
  +[[11,24],[52,26],[20,9],[45,10],[56,17],[9,15]].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="2.5" fill="#7e2418"/><circle cx="'+(x-.8)+'" cy="'+(y-.9)+'" r=".8" fill="#fff" opacity=".45"/><path d="M'+x+' '+(y-2.4)+'v-1.4" stroke="#3a2a14" stroke-width=".6"/>').join('');

IC['The Pale Sovereign']=P('M2 64C4 50 12 42 32 42S60 50 62 64Z')+FOLD('M16 50L12 64M48 50L52 64M32 52V64',1.1)+RIM('M6 60C8 52 12 47 18 45',1.3)
  +P('M13 46.5C19 40.5 26 40.5 32 44.5C38 40.5 45 40.5 51 46.5L46.5 52.5C42 48.5 36.5 48.5 32 50.5C27.5 48.5 22 48.5 17.5 52.5Z','bn')
  +'<g class="dk">'+[[19,47],[25,45.5],[39,45.5],[45,47],[22,50],[42,50]].map(([x,y])=>'<path d="M'+x+' '+y+'l.9 2.4-.9.5-.9-.5z"/>').join('')+'</g>'
  +SKULL(32,27,1.05,'bn','#9be870')+L('M27.5 13.5L29.5 18.5L27.8 21.5M37 15L35.6 18',.7)
  +CROWNP(32,9,.9)+GEM(32,8,1.6,'#9be870')+GEM(21,9.5,1.1,'#c9402c')+GEM(43,9.5,1.1,'#c9402c')
  +T('M54 28V64',2.2,'#c8a24a')+RIM('M53.3 31V62',.5)+GEM(54,24,3.6,'#9be870')+P('M50.5 27.5H57.5V29.5H50.5Z','gd');
IC['Tunnel Rat']=T('M13 44C5 46 2 53 6 58C8 61 12 61 14 59',2.2,'currentColor')
  +P('M9 41C9 31 19 26 30 26C38 26 44 29 48 33L58 37.5L48.5 42.5C45 47 36 50.5 26 50.5C16 50.5 9 47 9 41Z')
  +P('M30 47C38 47 44 45 48.5 42.5L50 44C45 48 37 50.5 28 50.5Z','fl')
  +L('M14 33L16.5 36M19 30.5L21 34M24 29L25.5 33M29 28.5L30 32.5M34 29L34.6 32.8M15 42L18 43.5M20 45L22.5 46',.7)
  +P('M37 26.5C39.5 22.5 44 22.5 45 26.5C45.5 29.5 42 31.5 39 30.5Z','m')+'<path d="M38.8 27C40.3 24.6 43 24.6 43.6 27C43.8 28.5 41.8 29.6 40 29Z" fill="#9a5c50" opacity=".8"/>'
  +D('M44.5 34.4C44.5 32.8 48 32.8 48 34.4C48 36 44.5 36 44.5 34.4Z')+E(46.3,34.4,1.1,'#ff6a4c')
  +'<path d="M56.5 37.5C56.5 36.2 59.5 36.2 59.5 37.5C59.5 38.8 56.5 38.8 56.5 37.5Z" fill="#c07a70"/>'
  +'<path fill="#e3c26a" d="M51.2 41.5l.9 3.2.9-3.2zM53 41.2l.8 2.8.8-2.8z"/>'
  +'<path d="M54 37L63 33.5M54 38.5L63.5 38.5M54 40L62.5 43" stroke="#d8ccb4" stroke-opacity=".55" stroke-width=".5"/>'
  +P('M19 48V55.5C19 56.5 21.5 57 22.5 56L24 48ZM33 49V56C33 57 35.5 57.5 36.5 56.5L38 48.5Z','m')
  +'<path d="M18.5 56.5h5M32.5 57h5" stroke="#c07a70" stroke-width="1" stroke-linecap="round"/>'
  +RIM('M12 37C14 31 20 27.5 28 27',1.2);

IC['Barrow Wight']=P('M32 3C18 3 12 13 12 26V58C14 56 16 57 18 60C20 56 23 56 25 59C27 55 30 55 32 58C34 55 37 55 39 59C41 56 44 56 46 60C48 57 50 56 52 58V26C52 13 46 3 32 3Z')
  +FOLD('M20 34C19 42 20 50 18 58M44 34C45 42 44 50 46 58M32 38V56M26 40C25 48 26 52 25 58M38 40C39 48 38 52 39 58',1)
  +RIM('M15 24C16 14 22 7 30 5.5',1.4)
  +D('M32 9C24.5 9 20 15.5 20 23C20 30.5 24.5 36 32 36C39.5 36 44 30.5 44 23C44 15.5 39.5 9 32 9Z')
  +'<path d="M32 13.5C27 13.5 24.5 17.5 24.5 22.5C24.5 27 26.5 30 28.8 31.2V34H35.2V31.2C37.5 30 39.5 27 39.5 22.5C39.5 17.5 37 13.5 32 13.5Z" fill="#cfc4a8" opacity=".55"/>'
  +D('M26.3 21.8C26.3 19.3 30.6 19.3 30.6 21.8C30.6 24.6 26.3 24.6 26.3 21.8ZM33.4 21.8C33.4 19.3 37.7 19.3 37.7 21.8C37.7 24.6 33.4 24.6 33.4 21.8Z')
  +E(28.4,22,1.25,'#9be870')+E(35.6,22,1.25,'#9be870')+D('M31.2 26L32 28.4L32.8 26Z')
  +'<path d="M29.4 31.5V33.6M31.2 31.8V34M32.8 31.8V34M34.6 31.5V33.6" stroke="#2a2420" stroke-width=".55"/>'
  +'<path d="M14 44C10 46 9 50 6 51M50 42C54 44 56 48 59 49" stroke="#cfc4a8" stroke-opacity=".25" stroke-width="1" fill="none"/>';

IC['Pyre Witch']=P('M12 64C12 56 20 50 32 50S52 56 52 64Z','m')+FOLD('M22 54L19 64M42 54L45 64M32 54V64',1)
  +P('M20 41H44V46C44 52.5 38.5 57 32 57C25.5 57 20 52.5 20 46Z','fl')
  +L('M22.5 46C24 44.5 26 44.5 27.5 45.5M36.5 45.5C38 44.5 40 44.5 41.5 46M24 51C25 52.5 26.5 53 27.5 53M30 50C31 49 33 49 34 50',.6)
  +D('M23.5 47.2C23.5 45.6 28 45.6 28 47.2C28 48.8 23.5 48.8 23.5 47.2ZM36 47.2C36 45.6 40.5 45.6 40.5 47.2C40.5 48.8 36 48.8 36 47.2Z')+E(25.8,47.3,1.05,'#ff8a3c')+E(38.2,47.3,1.05,'#ff8a3c')
  +'<path d="M31 49.5L29.6 52.5H32.4Z" fill="#000" opacity=".4"/>'+D('M28.5 54C30 53.2 34 53.2 35.5 54C34.5 55.2 29.5 55.2 28.5 54Z')
  +'<path d="M20 41C17 44 17 50 15 54M44 41C47 44 47 50 49 54" stroke="#8a8478" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M21 42C19 46 19.5 50 18 53M43 42C45 46 44.5 50 46 53" stroke="#5a564e" stroke-width="1.4" fill="none" stroke-linecap="round"/>'
  +P('M33 4C30 9 26 20 21 34H45C40 22 36 12 37 7C36 5 34.5 4 33 4Z')+FOLD('M33 8C32 16 30 26 28 34',1)+RIM('M31 9C29 15 26 23 23.5 32',1.2)
  +P('M4 34C10 32 22 31.5 32 31.5S54 32 60 34C58 37.5 50 39.5 32 39.5S6 37.5 4 34Z','m')
  +T('M24 31H40',2,'#8a6a3e')+FLM(9,52,.85)+FLM(55,52,.85)
  +'<g fill="#ffb347"><circle cx="14" cy="42" r=".7"/><circle cx="50" cy="44" r=".6"/><circle cx="6" cy="44" r=".5"/></g>';

IC['Crypt Ghoul']=P('M8 64C8 52 14 45 22 43H42C50 45 56 52 56 64Z','m')+FOLD('M20 48L17 64M44 48L47 64M27 46C28 50 30 52 32 52C34 52 36 50 37 46',1)
  +P('M32 5C43 5 49 14 49 25C49 32 47.5 37 45 41L42.5 47H21.5L19 41C16.5 37 15 32 15 25C15 14 21 5 32 5Z','bn')
  +L('M22 14C24 17 24 20 23 23M42 14C40 17 40 20 41 23M20 31C22 34 24 35 26 35.5M44 31C42 34 40 35 38 35.5M29 8C30 10 30 12 29.5 14',.65)
  +'<path d="M18 26C19.5 31 22 34 25 35L22 41C19.5 37 18 32 18 26ZM46 26C44.5 31 42 34 39 35L42 41C44.5 37 46 32 46 26Z" fill="#000" opacity=".22"/>'
  +D('M19 22.5C21 20 27 21 28.5 25.5C27.5 29.5 22 30.5 19.5 27.5ZM45 22.5C43 20 37 21 35.5 25.5C36.5 29.5 42 30.5 44.5 27.5Z')+E(23.8,25.3,1.3,'#ff7a4c')+E(40.2,25.3,1.3,'#ff7a4c')
  +D('M30.2 30L32 34.2L33.8 30Z')
  +D('M21.5 38.5C26 36.8 38 36.8 42.5 38.5L41 46.5H23Z')
  +'<path fill="#d9cdb0" d="M23.5 38.4l1.6 4.4 1.7-4.6 1.6 5.2 1.7-5.4 1.6 5.6 1.7-5.6 1.6 5.4 1.7-5.2 1.6 4.6 1.6-4.4z"/>'
  +'<path fill="#bfb296" d="M24.5 46.3l1.4-3.3 1.4 3.3M29.4 46.5l1.5-3.6 1.5 3.6M34.4 46.3l1.4-3.3 1.4 3.3"/>'
  +RIM('M18 20C19.5 12 25 7 31 6.2',1.3)
  +P('M3 56L7.5 41L12 56ZM61 56L56.5 41L52 56Z','bn');
// ---- the first two gates' common foes, hand-painted like their bosses (a new player meets these most)
IC['Grave Beetle']=T('M21 25L12 20L7 12M19 35L9 34L3 39M21 45L13 51L10 60M43 25L52 20L57 12M45 35L55 34L61 39M43 45L51 51L54 60',2.4,'currentColor')
  +L('M7 12L5 10.5M3 39L1.5 41M10 60L8.5 62M57 12L59 10.5M61 39L62.5 41M54 60L55.5 62',.9)
  +T('M28 8C25 4.5 21 3.5 17 5M36 8C39 4.5 43 3.5 47 5',1.3,'currentColor')
  +P('M31.2 27C22 27.5 15 33 15 42.5C15 52.5 22 59.5 31.2 61.5Z')+P('M32.8 27C42 27.5 49 33 49 42.5C49 52.5 42 59.5 32.8 61.5Z')
  +FOLD('M24 31.5C20 37.5 20 49.5 25 57.5M28 29.5C26 37 26 50 29 59.5M40 31.5C44 37.5 44 49.5 39 57.5M36 29.5C38 37 38 50 35 59.5',.9)
  +RIM('M17.5 38.5C18 32.5 22 29 28 28.2',1.3)+'<path d="M43.5 34C45.5 37 46 41 45.5 44.5" stroke="#cfe0c0" stroke-opacity=".3" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
  +P('M32 14.5C41 14.5 46 18.5 46 24C46 27.5 40 29 32 29S18 27.5 18 24C18 18.5 23 14.5 32 14.5Z','m')
  +FOLD('M32 15.5V28M25 18C24 21 24.5 24 26 26.5M39 18C40 21 39.5 24 38 26.5',.8)+'<g fill="#d9cdb0" opacity=".45"><circle cx="28.5" cy="21.5" r="1.1"/><circle cx="35.5" cy="21.5" r="1.1"/><circle cx="21.5" cy="23" r=".7"/><circle cx="42.5" cy="23" r=".7"/></g>'+RIM('M20.5 19C23 16.5 26.5 15.5 30 15.3',.9)
  +P('M32 6C36.5 6 39 9 39 12.5C39 15 36 16 32 16S25 15 25 12.5C25 9 27.5 6 32 6Z','m')
  +P('M27.5 8.5C25 7 24 4.5 24.8 2C26.5 3.2 28.5 5 30 7.2Z','bn')+P('M36.5 8.5C39 7 40 4.5 39.2 2C37.5 3.2 35.5 5 34 7.2Z','bn')
  +E(28.6,11.6,1.1,'#8fd46a')+E(35.4,11.6,1.1,'#8fd46a');
IC['Marrow Mite']=T('M24 31L14 25L9 15M23 35L11 33L5 39M23 39L12 43L8 53M25 43L17 52L16 61M40 31L50 25L55 15M41 35L53 33L59 39M41 39L52 43L56 53M39 43L47 52L48 61',2,'currentColor')
  +T('M26 17C22 14 21 10 22.5 7M38 17C42 14 43 10 41.5 7',1.4,'currentColor')
  +P('M32 28C42 28 48 36 48 45C48 54 41 60.5 32 60.5C23 60.5 16 54 16 45C16 36 22 28 32 28Z')
  +FOLD('M18.5 38C25 35 39 35 45.5 38M17 46C24 43 40 43 47 46M19.5 53.5C25 51.5 39 51.5 44.5 53.5',1)
  +'<ellipse cx="32" cy="46.5" rx="10" ry="8" fill="#e9dfc6" opacity=".12"/>'+P('M32 40C36 40 38.5 43 38.5 46.5C38.5 50 35.5 52.5 32 52.5S25.5 50 25.5 46.5C25.5 43 28 40 32 40Z','bn')
  +L('M30.5 41.5L32 44.5L30.6 47.5L32.4 51.5',.6)+RIM('M27.5 42.5C28.5 41.3 30 40.7 31.5 40.6',.8)
  +L('M17 49L14 50M47 49L50 50M20 56L18 58M44 56L46 58',.7)+RIM('M18.5 41C19.5 34 24 30 30 29.2',1.3)
  +P('M32 15C38.5 15 41.5 19 41.5 24C41.5 28 37.5 31 32 31S22.5 28 22.5 24C22.5 19 25.5 15 32 15Z','m')+RIM('M25 19.5C26.5 17 28.5 16.2 31 16',.9)
  +P('M28.5 15.5C27 12.5 27.5 9.5 29.5 8.5C30 11 30.5 13 31.2 15Z','bn')+P('M35.5 15.5C37 12.5 36.5 9.5 34.5 8.5C34 11 33.5 13 32.8 15Z','bn')
  +E(29,21.5,1,'#ff8a5c')+E(35,21.5,1,'#ff8a5c')+'<circle cx="30.8" cy="18.8" r=".7" fill="#ff8a5c"/><circle cx="33.2" cy="18.8" r=".7" fill="#ff8a5c"/>'
  +FOLD('M26 27C29 28.5 35 28.5 38 27',.8);
IC['Skeleton Guard']=T('M53 9V64',2.2,'#5a4426')+RIM('M52.3 13V62',.5)+P('M53 1L56.5 9L53 13.5L49.5 9Z')+L('M51.5 14H54.5M51.5 16H54.5',.8)
  +P('M6 64V50C6 42 13 38 22 38H42C51 38 58 42 58 50V64Z','m')+'<path class="st" style="stroke-width:.8;opacity:.6" d="'+ROWS(10,44,4,5,6,7.3,3)+'"/>'
  +P('M6 50C6 42 11 38.5 19 39L21 49ZM58 50C58 42 53 38.5 45 39L43 49Z')+RIM('M8 47C8.5 43 11.5 40.5 16 40',1.1)
  +P('M29 34H35V40H29Z','bn')+L('M29 36.8H35',.6)
  +P('M32 12C23.5 12 19 18 19 25C19 30 21 33 23.5 35V40H40.5V35C43 33 45 30 45 25C45 18 40.5 12 32 12Z','bn')
  +'<ellipse class="dk" cx="26.5" cy="26.5" rx="3.6" ry="4.1"/><ellipse class="dk" cx="37.5" cy="26.5" rx="3.6" ry="4.1"/>'+E(26.5,26.8,1.3,FIREC)+E(37.5,26.8,1.3,FIREC)
  +D('M32 30.5L30 34.5H34Z')+L('M24 36.5C28 38 36 38 40 36.5M27 37V40M30 37.6V40.5M34 37.6V40.5M37 37V40',.8)+L('M38.5 31L37 33.5L38.5 35',.6)
  +P('M17 23C17 12 23.5 5 32 5S47 12 47 23L44 24C41 20 37 19 33.6 19.5V31H30.4V19.5C27 19 23 20 20 24Z')
  +P('M16 21.5C22 19 42 19 48 21.5L47.5 24.5C41 22 23 22 16.5 24.5Z','m')+L('M32 5V19.5',1)+RIM('M20 18C21 11 25.5 7 31 6.2',1.3)
  +'<path d="M40 9C41 12 40.5 14 42 16.5M23 12C22.5 14 23.5 15 22.8 17.5" stroke="#7a4a2c" stroke-width="1.1" opacity=".7" fill="none"/>'
  +'<g class="gd"><circle cx="20" cy="22.6" r=".8"/><circle cx="26" cy="21.3" r=".8"/><circle cx="38" cy="21.3" r=".8"/><circle cx="44" cy="22.6" r=".8"/></g>'
  +P('M49.5 40.5C49.5 38.5 56.5 38.5 56.5 40.5V44.5H49.5Z','bn')+L('M51.3 40V44.5M53 39.6V44.5M54.8 40V44.5',.5)
  +'<path fill="#4a3a2c" d="M3 42C9 40 19 40 25 42V54C25 59 19 63 14 64.5C9 63 3 59 3 54Z"/><path fill="url(#gSh)" d="M3 42C9 40 19 40 25 42V54C25 59 19 63 14 64.5C9 63 3 59 3 54Z"/>'
  +'<path d="M4 42.5C9.5 40.6 18.5 40.6 24 42.5V54C24 58.4 18.6 62.2 14 63.5C9.4 62.2 4 58.4 4 54Z" fill="none" stroke="currentColor" stroke-width="1.6"/>'
  +L('M8.5 42V60M14 41V64M19.5 42V60',.6)+'<path d="M14 44.5L19 49.5L14 56L9 49.5Z" fill="#d9cdb0" opacity=".35"/>'+D('M25 46L22.5 47.5L25 49Z')
  +P(CIR(14,50.5,3.2),'gd')+RIM('M5 44.5C5 50 5.5 55 8.5 59',1);
IC['Drowned Priest']=P('M4 64C6 52 14 44 32 44S58 52 60 64Z','m')+FOLD('M18 50L14 64M46 50L50 64M32 52V64',1)
  +T('M24 45L27 64M40 45L37 64',2.4,'#a8873e')+L('M24.6 54H27.4M38.6 54H35.8',.6)
  +P('M32 3C19 3 12 13 12 26C12 36 10 42 7 48C14 46 20 44 24 42H40C44 44 50 46 57 48C54 42 52 36 52 26C52 13 45 3 32 3Z','m')
  +FOLD('M15 30C15 38 13 43 10 46M49 30C49 38 51 43 54 46',1)+RIM('M15 22C15.5 14 21 7 29 5',1.3)
  +D('M32 10C24 10 19 17 19 26C19 34 23 41 32 41S45 34 45 26C45 17 40 10 32 10Z')
  +P('M32 14C26 14 22.5 19 22.5 26C22.5 33 26.5 39 32 39S41.5 33 41.5 26C41.5 19 38 14 32 14Z')
  +'<path d="M22.5 23C25 20 39 20 41.5 23V25.5C38 22.5 26 22.5 22.5 25.5Z" fill="#000" opacity=".3"/>'
  +D('M25 25.8C25 23.8 30 23.8 30 25.8C30 27.8 25 27.8 25 25.8ZM34 25.8C34 23.8 39 23.8 39 25.8C39 27.8 34 27.8 34 25.8Z')+E(27.5,25.9,1.15,SOULC)+E(36.5,25.9,1.15,SOULC)
  +L('M32 27.5V30.5L30.8 31.2M24.5 30C25.5 31.5 26.5 32 27.5 32M39.5 30C38.5 31.5 37.5 32 36.5 32',.6)
  +D('M28.5 33.5C29.5 32.5 34.5 32.5 35.5 33.5C35 36.5 33.5 37.5 32 37.5S29 36.5 28.5 33.5Z')
  +'<path d="M32 37.5C32 40 31.5 41 31.5 42.5M13 47C13 50 11.5 51 11.5 53M52 47C52 50 53.5 51 53.5 53" stroke="#7fc1bd" stroke-width="1.1" opacity=".7" fill="none" stroke-linecap="round"/>'
  +'<circle cx="38" cy="18.5" r="1.3" fill="#cfc6b0" opacity=".45"/><g fill="#cfc6b0" opacity=".85"><circle cx="17" cy="15" r="1.6"/><circle cx="19.6" cy="12.4" r="1"/><circle cx="48.5" cy="34" r="1.4"/><circle cx="46.8" cy="36.3" r=".8"/></g>'
  +T('M16 13C12 19 16 26 11 34C10 37 12 40 10 44M46 7C51 13 47 20 52 26M21 7.5C18 13 21 18 18 23',1.9,'#4f7a48')
  +'<path d="M25 42C26 46 29 48 32 48S38 46 39 42" fill="none" stroke="#a9a090" stroke-width="1.2" stroke-dasharray="1.6 .8"/>'+P(CIR(32,51.5,3.4),'gd')+D(CIR(32,51.5,1.4))
  +'<path d="M2 58C10 54 16 60 24 56S38 60 46 56 56 60 62 56V64H2Z" fill="#6ea8a4" opacity=".45"/><path d="M2 58C10 54 16 60 24 56S38 60 46 56 56 60 62 56" stroke="#cfe6e0" stroke-opacity=".4" stroke-width=".8" fill="none"/>';
// ---- the ten Hell Tower wardens, hand-painted like the gate bosses
IC['The Gate Hound']=P('M2 64V48C2 42 8 38 16 38H48C56 38 62 42 62 48V64Z','m')+FOLD('M14 44L10 64M50 44L54 64M32 42V64',1)
  +[[13,26,.82],[51,26,.82],[32,20,1]].map(([x,y,k])=>GR('translate('+x+' '+y+') scale('+k+')',
     P('M0-14C9-14 13-6 13 1C13 6 10 9 6 11L0 14L-6 11C-10 9-13 6-13 1C-13-6-9-14 0-14Z')+P('M-10-10L-14-20L-5-13ZM10-10L14-20L5-13Z')
     +D('M-8-3C-8-6-3-6-3-3C-3 0-8 0-8-3ZM3-3C3-6 8-6 8-3C8 0 3 0 3-3Z')+E(-5.5,-3,1,'#ff4a1a')+E(5.5,-3,1,'#ff4a1a')
     +'<path d="M-6 6L-4 10L-2 6L0 11L2 6L4 10L6 6" fill="#e3d8be"/>'+D('M-2 1L0 4L2 1Z')+RIM('M-11-4C-10-10-5-13 0-13',1))).join('')
  +'<path d="M8 50C16 46 24 50 32 46S48 50 56 46" stroke="#5a4a3a" stroke-width="2.5" fill="none" stroke-dasharray="4 2"/>'+'<g fill="#ffb347" opacity=".6"><circle cx="26" cy="40" r=".9"/><circle cx="38" cy="40" r=".9"/></g>';

IC['Cinder Matron']=P('M8 64C10 52 18 44 32 44S54 52 56 64Z','m')+FOLD('M20 50L16 64M44 50L48 64M32 48V64',1)
  +'<path d="M18 44C10 36 6 24 10 12C14 22 18 28 24 32ZM46 44C54 36 58 24 54 12C50 22 46 28 40 32Z" fill="#e0602a" opacity=".8"/><path d="M18 42C13 34 11 26 13 18M46 42C51 34 53 26 51 18" stroke="#ffd27a" stroke-width="1" fill="none" opacity=".7"/>'
  +P('M32 12C40 12 44 18 44 26C44 34 39 40 32 40C25 40 20 34 20 26C20 18 24 12 32 12Z','fl')
  +L('M24 22C26 20 28 20 30 21M34 21C36 20 38 20 40 22M26 33C28 35 36 35 38 33',.7)
  +D('M24.5 26C24.5 23.6 29.5 23.6 29.5 26C29.5 28.4 24.5 28.4 24.5 26ZM34.5 26C34.5 23.6 39.5 23.6 39.5 26C39.5 28.4 34.5 28.4 34.5 26Z')+E(27,26,1.1,'#ffb347')+E(37,26,1.1,'#ffb347')
  +'<path d="M22 30L20 38M42 30L44 38M30 38L29 42M34 38L35 42" stroke="#ff7a2c" stroke-width=".8" opacity=".85"/>'
  +FLM(32,10,.7)+FLM(22,13,.45)+FLM(42,13,.45)+RIM('M21 22C22 16 26 13 31 12.5',1.1)
  +'<g fill="#ffb347"><circle cx="8" cy="30" r=".8"/><circle cx="56" cy="26" r=".7"/><circle cx="12" cy="48" r=".6"/></g>';

IC['The Iron Inquisitor']=P('M4 64V48C4 40 12 36 22 36H42C52 36 60 40 60 48V64Z','m')+FOLD('M10 50H54M8 57H56',1)
  +P('M16 6H48V30C48 42 41 50 32 52C23 50 16 42 16 30Z','gd')+RIM('M19 9V30C19 38 23 44 28 47',1.3)
  +D('M20 18H30V22H20ZM34 18H44V22H34Z')+E(25,20,1.1,'#ff6a3c')+E(39,20,1.1,'#ff6a3c')
  +L('M32 6V52M20 28H44M22 36H42',.9)+'<g class="dk">'+[24,28,32,36,40].map(x=>'<circle cx="'+x+'" cy="44" r=".8"/>').join('')+'</g>'
  +'<path d="M16 6L32 2L48 6" stroke="#8a6a2a" stroke-width="2" fill="none"/>'+GEM(32,12,1.6,'#c9402c')
  +T('M54 64V20',2.2,'#4a3a2a')+'<circle cx="54" cy="16" r="5" fill="none" stroke="#8a8a80" stroke-width="1.6"/>'+'<path d="M50 12L58 20M58 12L50 20" stroke="#8a8a80" stroke-width="1.1"/>';

IC['Lord of Flies']=WINGS('m')+'<path d="M26 30C14 14 4 12 1 14M38 30C50 14 60 12 63 14" stroke="#c8d8a0" stroke-opacity=".25" stroke-width=".8" fill="none"/>'
  +L('M6 18C12 22 18 26 24 30M58 18C52 22 46 26 40 30M8 24C14 27 19 30 24 33M56 24C50 27 45 30 40 33',.5)
  +P('M32 34C40 34 44 42 44 50C44 58 38 63 32 63C26 63 20 58 20 50C20 42 24 34 32 34Z')+L('M21 44H43M20.5 50H43.5M22 56H42',1)
  +P('M32 18C38 18 42 22 42 27C42 32 38 36 32 36C26 36 22 32 22 27C22 22 26 18 32 18Z','m')
  +'<circle cx="26" cy="25" r="5.4" fill="#7a1a12"/><circle cx="38" cy="25" r="5.4" fill="#7a1a12"/><circle cx="24.5" cy="23.5" r="1.6" fill="#ffb0a0" opacity=".6"/><circle cx="36.5" cy="23.5" r="1.6" fill="#ffb0a0" opacity=".6"/>'
  +'<path d="M26 25h.1M28 23h.1M28 27h.1M24 27h.1M38 25h.1M40 23h.1M40 27h.1M36 27h.1" stroke="#000" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>'
  +T('M30 34L28 40M34 34L36 40',1.4,'#2a1a0a')+'<path d="M29 10L32 16L35 10" fill="none" stroke="#c8a24a" stroke-width="1.2"/>'+CROWNP(32,12,.42)
  +'<g fill="#0a0806">'+[[8,40],[56,44],[12,56],[52,58],[6,8]].map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="1.4" ry="1"/>').join('')+'</g>';

IC['The Bone Cantor']=P('M6 64C8 52 16 44 32 44S56 52 58 64Z','m')+FOLD('M18 50L14 64M46 50L50 64M32 48V64',1)
  +P('M32 3C42 3 49 10 49 20C49 27 46 31 43 34V42H21V34C18 31 15 27 15 20C15 10 22 3 32 3Z','bn')
  +D('M20 17C20 13 29 13 29 18C29 22 25 24 21 22ZM44 17C44 13 35 13 35 18C35 22 39 24 43 22Z')+E(24.5,18.5,1.1,'#9be870')+E(39.5,18.5,1.1,'#9be870')
  +D('M30.5 24L32 28L33.5 24Z')+'<ellipse class="dk" cx="32" cy="35" rx="5" ry="6"/><path d="M27.5 33h9M27.8 37h8.4" stroke="#d8ccb0" stroke-width=".6"/>'
  +L('M26 6L27 10M38 6L37 10',.6)+RIM('M18 14C19 8 24 4.5 30 4',1.2)
  +'<path d="M54 10C58 14 58 20 54 24M58 6C64 12 64 22 58 28M10 10C6 14 6 20 10 24M6 6C0 12 0 22 6 28" stroke="#9be870" stroke-opacity=".45" stroke-width="1.4" fill="none"/>'
  +'<g fill="#d8ccb0">'+[[10,46],[54,46],[14,54],[50,54]].map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="2.2" ry="1.6"/><path d="M'+(x+2)+' '+y+'V'+(y-7)+'" stroke="#d8ccb0" stroke-width="1"/>').join('')+'</g>';

IC['Duke of Chains']=P('M4 64V48C4 40 12 36 22 36H42C52 36 60 40 60 48V64Z','m')+FOLD('M14 44L10 64M50 44L54 64',1)
  +'<path d="M2 10L16 22L6 34L18 46L8 60M62 10L48 22L58 34L46 46L56 60" stroke="#6a5a48" stroke-width="3.4" fill="none" stroke-dasharray="5 2.5"/>'
  +P('M18 36V18C18 9 24 4 32 4S46 9 46 18V36C46 40 40 42 32 42S18 40 18 36Z')+P('M20 12L23 4L27 9L32 2L37 9L41 4L44 12Z','gd')
  +D('M22 19H42V24H22Z')+E(27,21.5,1.1,'#ff8a3c')+E(37,21.5,1.1,'#ff8a3c')+L('M32 12V19M32 24V42',1)+RIM('M23 9C21 13 20.5 19 20.5 33',1.3)
  +'<circle cx="32" cy="50" r="6" fill="none" stroke="#6a5a48" stroke-width="2.2"/><circle cx="32" cy="50" r="2" class="gd"/>'
  +'<path d="M20 44L26 48M44 44L38 48" stroke="#6a5a48" stroke-width="2.2" stroke-dasharray="3 1.5"/>';

IC['The Pale Executioner']=P('M5 64V44C5 36 13 32 24 32H40C51 32 59 36 59 44V64Z','m')+FOLD('M16 40L12 64M48 40L52 64M32 36V64',1)
  +P('M32 4C42 4 46 12 46 20V34C42 37 37 38 32 38S22 37 18 34V20C18 12 22 4 32 4Z')+FOLD('M24 8C22 14 22 24 23 34M40 8C42 14 42 24 41 34',.8)
  +D('M23 18C23 15 29 15 29 18C29 21 23 21 23 18ZM35 18C35 15 41 15 41 18C41 21 35 21 35 18Z')+E(26,18,1,'#e8e0c8')+E(38,18,1,'#e8e0c8')
  +RIM('M20.5 20C20.5 12 25 6.5 31 5.5',1.2)
  +T('M54 64V12',2.6,'#3a2a1a')+'<path d="M54 12C64 12 66 22 64 32C60 26 57 25 54 26Z" fill="#c8c0b0"/><path d="M54 12C64 12 66 22 64 32" stroke="#fff" stroke-opacity=".35" stroke-width="1" fill="none"/><path d="M56 26C59 25 61 27 62 29" stroke="#7a0e08" stroke-width="1.4" fill="none"/>'
  +'<path d="M14 50H30V54H14Z" fill="#3a2a1a"/><path d="M16 50V46H28V50" fill="none" stroke="#3a2a1a" stroke-width="1.2"/>';

IC['Archdevil Vael']=P('M4 64C6 50 16 42 32 42S58 50 60 64Z','m')+FOLD('M16 48L12 64M48 48L52 64M32 46V64',1)
  +'<path d="M12 44C4 34 2 20 8 8C10 18 14 26 22 32ZM52 44C60 34 62 20 56 8C54 18 50 26 42 32Z" fill="#3a0c08"/><path d="M12 42C6 32 5 22 8 12M52 42C58 32 59 22 56 12" stroke="#c8321a" stroke-width=".8" fill="none" opacity=".7"/>'
  +HORNP(32,14,1.3)+P('M32 12C41 12 46 19 46 27C46 36 40 42 32 42C24 42 18 36 18 27C18 19 23 12 32 12Z')
  +L('M24 20L28 23M40 20L36 23M26 34C28 36 36 36 38 34M30 14L32 18L34 14',.7)
  +D('M23 25C23 22.5 29 23 29 26C28 28 24 28 23 25ZM41 25C41 22.5 35 23 35 26C36 28 40 28 41 25Z')+E(26,25.6,1.2,'#ffd060')+E(38,25.6,1.2,'#ffd060')
  +'<path d="M26 35L27.5 38L29 35.5L30.5 38.5L32 35.5L33.5 38.5L35 35.5L36.5 38L38 35" fill="#e3d8be"/>'+RIM('M20 24C21 17 26 13 31 12.5',1.2)
  +FLM(8,58,.8,'#e0502c')+FLM(56,58,.8,'#e0502c')+GEM(32,48,1.8,'#c9402c');

IC['The Hollow Seraph']=WINGS('bn')+'<path d="M26 30C14 14 4 12 1 14C3 24 10 34 22 38ZM38 30C50 14 60 12 63 14C61 24 54 34 42 38Z" fill="url(#gSh)"/>'
  +L('M4 16L22 31M6 22L21 34M9 28L21 36M60 16L42 31M58 22L43 34M55 28L43 36',.5)
  +P('M24 22H40V44L36 60H28L24 44Z')+FOLD('M28 24V58M36 24V58',.8)+RIM('M25.5 24V44L29 58',1.2)
  +P('M32 6C37 6 40 10 40 15C40 20 37 24 32 24C27 24 24 20 24 15C24 10 27 6 32 6Z','bn')+D('M28 12H36V16H28Z')+'<path d="M28.5 14H35.5" stroke="#f0d870" stroke-width=".8" opacity=".6"/>'
  +'<path d="M22 4A10 3.5 0 1 1 42 4" stroke="#f0d870" stroke-width="2" fill="none"/><path d="M42 4A10 3.5 0 0 1 34 7" stroke="#f0d870" stroke-width="2" fill="none" opacity=".35"/>'
  +'<path d="M30 30L34 30L33 40L31 40Z" fill="#1a1712"/>';

IC['Abaddon, King of Hell']=P('M2 64C4 50 14 42 32 42S60 50 62 64Z','m')+FOLD('M14 50L10 64M50 50L54 64M32 48V64',1.1)
  +'<path d="M6 46C2 36 4 24 10 16C12 26 16 32 22 36ZM58 46C62 36 60 24 54 16C52 26 48 32 42 36Z" fill="#2a0806"/>'
  +HORNP(32,18,1.65)+SKULL(32,30,1.15,'bn',HELLC)+L('M26 18L28 23L26.5 26M38 19L36.6 22',.7)
  +CROWNP(32,13,.7)+GEM(32,12,1.5,'#c9402c')+RIM('M17 26C18 18 23 13 30 12',1.2)
  +FLM(9,56,1.1,'#e0502c')+FLM(55,56,1.1,'#e0502c')+FLM(32,62,.8,'#e0502c')
  +'<g fill="#ffb347"><circle cx="6" cy="34" r=".8"/><circle cx="58" cy="30" r=".7"/><circle cx="16" cy="6" r=".6"/><circle cx="50" cy="8" r=".6"/></g>';
SECRET.forEach((B,i)=>{ IC[B.name]=IC[DUNGEONS[i].boss[0]]; });   // a secret master wears its gate boss's shape, drawn in a darker light (CSS .secret)
// Natural colour and material for each creature (fur, chitin, flesh, bone, cloth, metal, stone, wood, spirit, glass).
// The rank colour stays on the frame; the creature is painted in its own colours, textured and lit by the #paint filter.
const MAT={'Tunnel Rat':['fur','#6f6253'],'Grave Beetle':['chitin','#3d4a3c'],'Marrow Mite':['chitin','#8a7556'],'The Rat King':['fur','#7a5f45'],'Tannery Brute':['flesh','#8a5a48'],'Shiv Cutpurse':['cloth','#4f4a40'],'Tallow Chandler':['cloth','#6b5a44'],'Warren Bandit':['cloth','#4e463c'],'Skeleton Guard':['metal','#5d6a66'],'Crypt Ghoul':['flesh','#7d8a6e'],'Drowned Priest':['flesh','#5f7a74'],'The Crypt Warden':['metal','#556160'],'Drowned Sentinel':['metal','#4f6a68'],'Coffin Crawler':['wood','#5a4636'],'Tide Acolyte':['flesh','#4f7268'],'Crypt Legionnaire':['metal','#4f5f58'],'Ash Husk':['stone','#6a5f58'],'Barrow Wight':['spirit','#8f8a7c'],'Pyre Witch':['cloth','#6e2f22'],'The Ember Knight':['metal','#6a5248'],'Barrow Thrall':['flesh','#6d665c'],'Ember Stalker':['flesh','#7a4a30'],'Cinder Weaver':['chitin','#5a3a28'],'Barrow Champion':['metal','#6a5a40'],'Stone Gargoyle':['stone','#6b6a66'],'Nave Stalker':['flesh','#6b2f2a'],'Hollow Chorister':['cloth','#5a5048'],'The Bishop of Teeth':['cloth','#6a5a48'],'Glass Sentinel':['glass','#5f8c86'],'Tooth Collector':['metal','#5a4a3a'],'Vestment Wraith':['cloth','#5a3a2e'],'Cathedral Templar':['metal','#6e6650'],'Thorn Troll':['flesh','#5d6b44'],'Rust Knight':['metal','#7a4a2c'],'Sap Weaver':['chitin','#4f5a3a'],'The Orchard Mother':['wood','#4d5a36'],'Iron Scarecrow':['wood','#6b5a40'],'Fruit Reaver':['wood','#5a4632'],'Grove Shepherd':['wood','#55603e'],'Orchard Marshal':['flesh','#6e3a2e'],'Throne Guard':['metal','#6a665c'],'Ash Revenant':['stone','#5f5650'],'Whisper Choir':['spirit','#6d7a6a'],'The Pale Sovereign':['cloth','#6b6458'],'Ember Herald':['cloth','#7a3a24'],'Crownless Duelist':['cloth','#4a3e36'],'Pallbearer':['wood','#5a4838'],'Ash Praetorian':['metal','#6a6058'],'Imp':['flesh','#7a3a30'],'Hellhound':['flesh','#5a2e26'],'Chain Devil':['flesh','#6e3428'],'Pit Warden':['metal','#5a3a2c'],'Soul Tender':['glass','#6a3a30'],'Brimstone Chanter':['cloth','#6e4a2a'],'Hell Legionary':['metal','#4e4a48'],'Infernal Duelist':['flesh','#4f5e3e'],'The Gate Hound':['fur','#4e4440'],'Cinder Matron':['flesh','#7a4a36'],'The Iron Inquisitor':['metal','#7a6a48'],'Lord of Flies':['chitin','#6a4a2a'],'The Bone Cantor':['cloth','#4a2a2a'],'Duke of Chains':['metal','#5e5a54'],'The Pale Executioner':['metal','#55585a'],'Archdevil Vael':['flesh','#6b3a2a'],'The Hollow Seraph':['spirit','#b0a68a'],'Abaddon, King of Hell':['flesh','#7a2e22'],'Necromancer':['cloth','#3e3a44'],'_':['bone','#cfc4a8']};
// The living who march on the necropolis wear borrowed shapes in their own colours: drab wool, oiled leather, the Inquisition's iron.
[['Militia Spearman','Warren Bandit',['cloth','#5c5040']],['Crossbowman','Shiv Cutpurse',['cloth','#46483c']],['Chaplain','Tallow Chandler',['cloth','#5a5448']],['Witch-hunter','Crownless Duelist',['cloth','#3a302a']],[SIEGE_BOSS,'Cathedral Templar',['metal','#6e6046']]]
  .forEach(([n,from,m])=>{ IC[n]=IC[from]; MAT[n]=m; });
const matOf=key=>MAT[key]||(()=>{ const i=SECRET.findIndex(B=>B.name===key); return i>=0?MAT[DUNGEONS[i].boss[0]]:null; })()||MAT._;
function ico(key,rankI,o){ o=o||{}; const M=matOf(key); return '<span class="ico r'+rankI+(o.boss?' boss':'')+(o.secret?' secret':'')+(o.elite?' elite':'')+'" aria-hidden="true"><svg viewBox="0 0 64 64" class="mt-'+M[0]+'" style="color:'+M[1]+'"><g filter="url(#paint)">'+(IC[key]||IC._)+'</g></svg>'+(key!=='Necromancer'?roleBadge(o.role):'')+'</span>'; }
const app=document.getElementById('app');
const ui={confirm:null};
const pct=(v,m)=>Math.max(0,Math.min(100,m?v/m*100:0));
const meter=(label,v,m,cls)=>'<div class="meter"><div class="m-top"><span>'+label+'</span><span class="num">'+Math.max(0,Math.round(v))+' / '+m+'</span></div><div class="bar"><i class="fill '+cls+'" style="width:'+pct(v,m)+'%"></i></div></div>';


// ----- icons for the extended roster
const BUST='<circle cx="16" cy="9" r="5.5"/><path d="M4 30V19c0-5 5-7 12-7s12 2 12 7v11z"/>';
Object.assign(GLYPH,{
 'Tannery Brute':BUST+'<path class="cs" d="M11 17v13M21 17v13M11 24h10"/>',
 'Shiv Cutpurse':'<g transform="translate(-3 2) scale(.88)">'+HOOD+'</g><path d="M27 5l2.4 14-2.4 3-2.4-3z"/><rect x="24" y="22" width="6" height="2"/><rect x="26" y="24" width="2" height="5"/>',
 'Tallow Chandler':'<path class="ember" d="M16 1c-3 4 2 5 0 9 4-2 4-6 0-9z"/><rect x="11" y="12" width="10" height="18" rx="1"/><path class="cs" d="M14 16v5M18.5 18v6"/>',
 'Drowned Sentinel':HELMB+'<path class="s" d="M2 30c3-3 6 3 9 0s6 3 9 0 6 3 10 0"/>',
 'Coffin Crawler':'<path d="M12 2h8l5 8-3 20H10L7 10z"/><path class="cs" d="M16 8v12M12 12h8"/><path class="s" d="M6 12l-4-3M6 17H1M26 12l4-3M26 17h5"/>',
 'Tide Acolyte':'<path class="s" d="M16 30V8M8 8v6c0 3 3 4 8 4s8-1 8-4V8"/><path d="M8 2l-2.5 7h5zM16 1l-2.5 7h5zM24 2l-2.5 7h5z"/>',
 'Barrow Thrall':BUST+'<path class="cs" d="M9 16c2 5 12 5 14 0"/>',
 'Ember Stalker':'<path d="M4 3l7 5h10l7-5-1 13c0 7-5 12-11 12S5 23 5 16z"/><path class="c" d="M9 14l5 2-5 1zM23 14l-5 2 5 1z"/><path class="cs" d="M12 23l1.5 3 1.5-3 1.5 3 1.5-3 1.5 3 1.5-3"/>',
 'Cinder Weaver':'<path class="s" d="M16 2v28M2 16h28M6 6l20 20M26 6L6 26"/><circle class="s" cx="16" cy="16" r="5"/><circle class="s" cx="16" cy="16" r="10"/><path class="ember" d="M16 10c-3 4 1 4 0 8 4-2 4-5 0-8z"/>',
 'Glass Sentinel':'<path d="M16 2l12 8v12l-12 8L4 22V10z"/><path class="cs" d="M16 2v28M4 10l24 12M28 10L4 22"/>',
 'Tooth Collector':'<path d="M8 4h16c1 8-1 14-4 24l-4-8-4 8C9 18 7 12 8 4z"/><path class="cs" d="M16 6v11M12 8l1 6M20 8l-1 6"/>',
 'Vestment Wraith':'<ellipse class="s" cx="16" cy="3" rx="6" ry="1.8"/><g transform="translate(3 4) scale(.82)">'+HOOD+'</g>',
 'Iron Scarecrow':'<rect x="14" y="8" width="4" height="22"/><rect x="3" y="13" width="26" height="3"/><circle cx="16" cy="10" r="4.2"/><path d="M9 7h14l-4-5h-6z"/><circle class="c" cx="14.7" cy="10" r=".9"/><circle class="c" cx="17.7" cy="10" r=".9"/>',
 'Fruit Reaver':'<path class="s" style="stroke-width:2.4" d="M9 30L24 6"/><path d="M24 4C14 2 5 8 3 17c6-6 13-9 21-9z"/>',
 'Grove Shepherd':'<path class="s" style="stroke-width:2.4" d="M18 30V10c0-5-8-6-8-1"/><path d="M20 12c5-1 8 1 9 5-5 1-8-1-9-5zM18 20c-5-1-8 1-9 5 5 1 8-1 9-5z"/>',
 'Ember Herald':'<rect x="6" y="2" width="2.5" height="28"/><path d="M8.5 4h18l-5 6 5 6h-18z"/><circle class="c" cx="16" cy="10" r="2.6"/>',
 'Crownless Duelist':'<path class="s" style="stroke-width:3" d="M5 5l22 22M27 5L5 27"/><path class="s" d="M3 11l8-8M21 29l8-8M29 11l-8-8M11 29l-8-8"/>',
 'Pallbearer':'<path d="M10 3h12l-2 5c5 3 6 8 5 13l-3 9H10l-3-9c-1-5 0-10 5-13z"/><path class="cs" d="M9 14h14M10 22h12"/>'
});

Object.assign(GLYPH,{'?':'<path class="s" style="stroke-width:3" d="M10 11c0-4 3-6 6-6s6 2 6 6c0 5-6 5-6 10"/><circle cx="16" cy="27" r="2"/>'});


const WING='<path d="M13 12C8 5 3 5 1 8c2 5 5 9 9 11zM19 12c5-7 10-7 12-4-2 5-5 9-9 11z"/>';
const HORNS='<path d="M9 9C5 8 3 4 4 1c3 2 6 3 8 6zM23 9c4-1 6-5 5-8-3 2-6 3-8 6z"/>';
Object.assign(GLYPH,{
 'Imp':'<circle cx="16" cy="17" r="9"/><path d="M9 11L5 3l8 5zM23 11l4-8-8 5z"/><path class="c" d="M10.5 15l4 2-4 1zM21.5 15l-4 2 4 1z"/><path class="c" d="M11 22c3 3 7 3 10 0-3 1-7 1-10 0z"/><path class="s" d="M16 26c0 4 5 4 6 1"/>',
 'Hellhound':'<path d="M3 20l4-9 7-2 4-6 3 6 6 3 2 8-5 3H9z"/><path class="c" d="M18 14l4 1.5-4 1z"/><path class="c" d="M24 20h3v2h-3z"/><path class="s" d="M5 26c3 3 8 4 12 3"/>',
 'Chain Devil':'<circle cx="16" cy="10" r="6"/>'+HORNS+'<path d="M5 31V21c0-4 5-6 11-6s11 2 11 6v10z"/><path class="cs" d="M9 21l6 8M23 21l-6 8"/><circle class="c" cx="14" cy="10" r="1.2"/><circle class="c" cx="18" cy="10" r="1.2"/>',
 'Pit Warden':'<path d="M16 2L4 6v10c0 8 5 13 12 15 7-2 12-7 12-15V6z"/><path class="cs" d="M16 6v21M8 12h16"/>'+'<path class="ember" d="M16 12c-2 3 1 4 0 7 3-1 4-4 2-6z"/>',
 'Soul Tender':'<rect x="14" y="2" width="4" height="4"/><path d="M11 6h10l2 5v14c0 3-3 5-7 5s-7-2-7-5V11z"/><path class="ember" d="M16 12c-3 3 0 5-1 9 4-1 5-5 2-9z"/><path class="s" d="M14 3c0-3 4-3 4 0"/>',
 'Brimstone Chanter':'<path d="M16 2C9 2 6 9 6 16c0 5-2 9-4 14h28c-2-5-4-9-4-14 0-7-3-14-10-14z"/>'+'<path class="c" d="M16 9c-4 0-6 3-6 7s2 7 6 7 6-3 6-7-2-7-6-7z"/><path d="M9 6L5 1l7 3zM23 6l4-5-7 3z"/><circle cx="13.5" cy="15.5" r="1.2"/><circle cx="18.5" cy="15.5" r="1.2"/>',
 'The Gate Hound':'<path d="M4 27l1-8 5-4h12l5 4 1 8z"/><circle cx="8" cy="11" r="4.5"/><circle cx="16" cy="8" r="4.5"/><circle cx="24" cy="11" r="4.5"/><path class="c" d="M6 10h4M14 7h4M22 10h4"/><path class="cs" d="M11 22l2 3 3-3 3 3 2-3"/>',
 'Cinder Matron':'<circle cx="16" cy="14" r="6"/><path d="M4 31c0-8 5-11 12-11s12 3 12 11z"/><path class="ember" d="M10 10C6 6 7 2 9 0c0 4 4 3 5 6 1-4 5-4 6-6 3 3 1 8-3 10z" transform="translate(0 1)"/><path class="c" d="M13.5 14h1.5v1.5h-1.5zM17 14h1.5v1.5H17z"/>',
 'The Iron Inquisitor':'<path d="M6 4h20v12c0 7-4 12-10 14C10 28 6 23 6 16z"/><rect class="c" x="9" y="12" width="14" height="3"/><path class="cs" d="M16 4v8M16 15v13"/><path d="M12 3l1-3 3 2 3-2 1 3z"/>',
 'Lord of Flies':'<ellipse cx="16" cy="20" rx="6" ry="9"/><circle cx="16" cy="9" r="5"/><path d="M10 15L1 7l2 10zM22 15l9-8-2 10z"/><path class="c" d="M12.5 8h2.4v2.4h-2.4zM17.1 8h2.4v2.4h-2.4z"/><path class="cs" d="M11 19h10M11 23h10"/>',
 'The Bone Cantor':'<path d="M16 2c-6 0-10 4-10 10v6h20v-6c0-6-4-10-10-10z"/><path class="c" d="M11 11h3v3h-3zM18 11h3v3h-3z"/><path d="M8 20h16v10H8z"/><path class="cs" d="M11 20v10M16 20v10M21 20v10"/><path class="c" d="M12 16h8v2h-8z"/>',
 'Duke of Chains':'<circle cx="16" cy="9" r="5.5"/>'+HORNS+'<path d="M5 31V19c0-5 5-7 11-7s11 2 11 7v12z"/><path class="s" d="M3 14l5 5-5 5M29 14l-5 5 5 5"/><path class="c" d="M12 20l4 4 4-4"/>',
 'The Pale Executioner':'<path d="M16 2c-5 0-8 4-8 9v6h16v-6c0-5-3-9-8-9z"/><path class="c" d="M11 10h10v2.5H11z"/><path d="M6 17h20l2 14H4z"/><path d="M26 3l5 10-4 2-3-8z"/><path class="cs" d="M16 17v14"/>',
 'Archdevil Vael':'<circle cx="16" cy="14" r="7"/>'+HORNS+'<path d="M8 6C4 2 6-1 9 0c-1 3 1 4 3 5zM24 6c4-4 2-7-1-6 1 3-1 4-3 5z"/><path d="M4 31c0-8 5-10 12-10s12 2 12 10z"/><path class="c" d="M11 12l4 2-4 1zM21 12l-4 2 4 1z"/><path class="cs" d="M12 19c2 2 6 2 8 0"/>',
 'The Hollow Seraph':WING+'<path d="M16 8c-4 0-6 4-6 9v13h12V17c0-5-2-9-6-9z"/><ellipse class="s" cx="16" cy="4" rx="5.5" ry="1.8"/><path class="c" d="M13 15h1.8v6H13zM17.2 15H19v6h-1.8z"/>',
 'Abaddon, King of Hell':'<path d="M16 6c-6 0-9 4-9 9 0 4 2 6 4 8v4h10v-4c2-2 4-4 4-9 0-5-3-8-9-8z"/><path d="M7 11C3 10 1 6 2 2c3 2 5 4 7 7zM25 11c4-1 6-5 5-9-3 2-5 4-7 7z"/><path class="gold" d="M8 5l2.5 3 2.5-5 3 5 3-5 2.5 5 2.5-3-1.5 6H9.5z"/><circle class="c" cx="12.5" cy="16" r="2.4"/><circle class="c" cx="19.5" cy="16" r="2.4"/><path class="c" d="M16 20l-1.6 3h3.2z"/>',
 i_censer:'<path class="s" d="M16 1v7M10 8h12"/><path d="M7 14h18c0 8-3 12-9 12s-9-4-9-12z"/><path class="cs" d="M9 18h14M12 22h8"/><path class="ember" d="M16 27c-2 2-1 4 0 4 2-1 2-3 0-4z"/>',
 i_axe:'<rect x="14.5" y="2" width="3" height="28"/><path d="M17.5 3c8 0 12 4 12 9s-4 7-12 7z"/><path class="cs" d="M21 8c3 1 4 3 4 5"/>',
 i_halo:'<ellipse class="s" style="stroke-width:3" cx="16" cy="9" rx="10" ry="4"/><path d="M3 14l5 9-1 7 9-6 9 6-1-7 5-9-9 4-4-4-4 4z" opacity=".95"/>',
 i_greatsword:'<path d="M16 0l4 22-4 3-4-3z"/><rect x="7" y="21" width="18" height="3.5" rx="1"/><rect x="14.5" y="24" width="3" height="6"/><path class="cs" d="M16 4v16"/>'
});

