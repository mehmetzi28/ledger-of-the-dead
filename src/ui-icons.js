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
IC['Coffin Crawler']=T('M18 24L6 14L2 22M16 32L2 34M16 42L4 54M46 24L58 14L62 22M48 32L62 34M48 42L60 54',2.6,'currentColor')
 +P('M24 6H40L52 22L44 58H20L12 22Z','m')+P('M27 10H37L46 23L40 54H24L18 23Z')+L('M32 14V46M25 24H39',1.6)
 +E(28,30,1.5,'#ff8a5c')+E(36,30,1.5,'#ff8a5c')+'<path fill="#e9dfc6" d="M27 38l2 4 2-4zM33 38l2 4 2-4z"/>';
IC['Tide Acolyte']=P('M8 62C8 50 16 44 28 44C40 44 48 50 48 62Z','m')+P('M18 14L22 4L27 12L31 3L34 12Z','m')+P('M8 30C8 18 18 10 30 12C38 13 44 18 46 24L38 28L46 32C42 40 34 44 24 44C14 44 8 38 8 30Z','b')+L('M28 21C25 26 25 32 28 38M32 20C29 26 29 32 32 39',1.4)+D('M14 26C14 22 22 22 22 26C22 30 14 30 14 26Z')+E(18,26,1.5,SOULC)+'<path fill="#e9dfc6" d="M38 27l3 1.6-3 .9zM39 30l3 1.4-3 1z"/>'+T('M54 62V12',2.6,'#d3a64d')+P('M47 14V5C47 5 50 8 54 8S61 5 61 5V14C61 18 58 20 54 20S47 18 47 14Z','gd')+'<path d="M54 5V20" stroke="#0a0807" stroke-width="1.2"/>'+'<path d="M6 8C6 12 3 12 3 16" stroke="#7fc1bd" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>';

// ---- C : Ashen Barrow
IC['Barrow Wight']=P('M32 4C18 4 12 14 12 26V60L19 54L26 60L32 54L38 60L45 54L52 60V26C52 14 46 4 32 4Z')+'<path d="M12 26V60L19 54L26 60L32 54L38 60L45 54L52 60V26" fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="1.4"/>'
 +D('M18 20C22 16 28 18 29 26C28 32 22 34 19 30ZM46 20C42 16 36 18 35 26C36 32 42 34 45 30Z')+E(23.5,25,1.7,'#9be870')+E(40.5,25,1.7,'#9be870')+D('M26 40C28 46 36 46 38 40C38 50 26 50 26 40Z')
 +L('M18 8C24 6 40 6 46 8',1);
IC['Pyre Witch']=P('M32 4L44 34H20Z')+P('M6 34H58V40H6Z','m')+'<path d="M20 34L32 4L44 34Z" fill="none"/>'+T('M25 30H39',2.4,'#d3a64d')
 +P('M18 40H46V46C46 52 40 56 32 56C24 56 18 52 18 46Z','bn')+E(26,47,1.4,'#ff8a3c')+E(38,47,1.4,'#ff8a3c')+L('M26 52C30 54 34 54 38 52',1.4)
 +P('M12 62C12 58 20 56 32 56S52 58 52 62Z','m')+FLM(10,50,.9)+FLM(54,50,.9)+L('M18 58C22 54 28 56 32 54',0);
IC['The Ember Knight']=P('M8 62V40C8 30 16 24 32 24S56 30 56 40V62Z','m')+HELM(32,30,1.05,'b','#ff7a2c')
 +'<path d="M32 8C26 14 38 14 32 22C42 20 44 12 36 4C38 8 34 8 32 8Z" fill="#e08a3c"/>'+FLM(32,6,1.2)+P('M4 40H18L16 50H6ZM46 40H60L58 50H48Z','m');
// ---- B : Hollow Cathedral
IC['The Bishop of Teeth']=P('M32 2L48 30H16Z','gd')+P('M16 30H48V38H16Z','b')+'<path d="M32 8V24M26 14H38" stroke="#0a0807" stroke-width="2.6" stroke-linecap="round"/>'
 +P('M10 38H54V46L50 52H14L10 46Z','b')+D('M14 40H50V48H14Z')+'<path fill="#e9dfc6" d="M15 40l3 8 3-8 3 8 3-8 3 8 3-8 3 8 3-8 3 8 3-8 3 8 2-8z"/>'+E(24,28,1.3,'#ff6a3c')+E(40,28,1.3,'#ff6a3c')
 +P('M14 54H50V62H14Z','m')+'<path fill="#e9dfc6" d="M16 54l3 6 3-6 3 6 3-6 3 6 3-6 3 6 3-6 3 6 3-6 3 6z"/>';

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
  reaper:'M2.5 15.5L4 15.5L8.6 4.2C10.8 3.6 13.4 4.3 15 6.4C14.2 2.6 10.4.4 6.4 1.6L7.6 3.5Z',
  hexer:'M8 1C4.5 1 2 3.5 2 7C2 10 4 12 6 12.5V15H10V12.5C12 12 14 10 14 7C14 3.5 11.5 1 8 1ZM6 6A1.2 1.2 0 1 1 6 8.4A1.2 1.2 0 1 1 6 6ZM10 6A1.2 1.2 0 1 1 10 8.4A1.2 1.2 0 1 1 10 6Z'   /* R12 PR B */
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
 'i_6-wa':['bone','#d8cdb0'],'i_6-wb':['metal','#8a7040'],'i_6-aa':['cloth','#3a3440'],'i_6-ab':['cloth','#5a5048'],'i_6-ta':['metal','#5a5650'],'i_6-tb':['glass','#6a6050'],'i_6-tc':['stone','#8a2a24'],i_ledgerchain:['bone','#a8987a'],i_rquill:['bone','#c8b89a'],i_rcoat:['cloth','#3a2a2a'],i_rledger:['cloth','#5a2a24'],
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
// ---- the first gates' second roster and the Ashen Barrow and Hollow Cathedral foes, hand-painted like the first two gates
const TEETH=(pts,c)=>'<path fill="'+(c||'#e3d6b8')+'" d="'+pts.map(([x,y,h])=>'M'+(x-.9)+' '+y+'l.9 '+(h||3)+' .9-'+(h||3)+'z').join('')+'"/>';   // a row of small fangs pointing down
const MAILSH=()=>P('M4 64V50C4 42 11 38 20 38H44C53 38 60 42 60 50V64Z','m')+'<path class="st" style="stroke-width:.8;opacity:.55" d="'+ROWS(10,46,4,5,6,7.3,3)+'"/>'
  +P('M4 50C4 42 9 38.5 17 39L19 50ZM60 50C60 42 55 38.5 47 39L45 50Z')+RIM('M6 47C6.5 43 9.5 40.5 14 40',1.1);   // mailed shoulders under two pauldrons
IC['Tannery Brute']=T('M54 44V20C54 13 45.5 13 46.5 19.5',2.4,'#8a8478')+RIM('M53.3 42V21',.5)
  +P('M2 64V50C2 40 10 34 20 33H44C54 34 62 40 62 50V64Z')+FOLD('M12 40C10 46 10 54 12 64M52 40C54 46 54 54 52 64',1)+RIM('M5 48C6 41 11 36.5 18 35.5',1.2)
  +P('M18 40H46L48 64H16Z','m')+'<path class="st" style="stroke-width:.7;opacity:.6" stroke-dasharray="1.6 1.2" d="M19.5 42.5H44.5M18.5 46V62M45.5 46V62"/>'
  +T('M20 40L25 33M44 40L39 33',2,'#3a2c20')+'<path d="M26 50C28.5 52 27.5 56 25 55.5ZM38 54C41 55 40.5 59 37.5 58.5ZM33 46C34 47 33.5 48.5 32.5 48Z" fill="#5a1c14" opacity=".7"/>'
  +P('M24 29H40V36H24Z')+FOLD('M26 34C29 35.5 35 35.5 38 34',.8)
  +P('M16.5 21C14 20 13 24 15 27L17.5 26ZM47.5 21C50 20 51 24 49 27L46.5 26Z')
  +P('M32 8C42 8 47 15 47 23C47 30 43 35 32 35C21 35 17 30 17 23C17 15 22 8 32 8Z')+RIM('M20 18C21.5 12 26 9 31 8.6',1.3)+FOLD('M25 13C28 12.2 36 12.2 39 13',.8)
  +P('M19 19C23 17 29 18 31 20.5H33C35 18 41 17 45 19L44 22H20Z','m')
  +D('M22 22C22 20.8 29 20.8 29 22.5C29 25 22 25 22 22ZM35 22.5C35 20.8 42 20.8 42 22C42 25 35 25 35 22.5Z')+E(25.5,22.8,1.1,'#ffd27a')+E(38.5,22.8,1.1,'#ffd27a')
  +P('M30.5 24H33.5L35 28H29Z','m')+D('M25 30C28 31.5 36 31.5 39 30L38 32.5C35 33.5 29 33.5 26 32.5Z')+'<path fill="#e3d6b8" d="M26.2 31.6l1.1-4 1.4 3.7zM37.8 31.6l-1.1-4-1.4 3.7z"/>'
  +L('M41 10.5L37.5 16.5',.7)+P('M50 38C52.5 35 58 35.5 58.5 39C59 42 55.5 44 52 42.5Z');
IC['Drowned Sentinel']=T('M10 6V64',2.2,'#5a4a3a')+P('M10 0L13 8L10 12L7 8Z')+L('M8.5 13H11.5',.8)
  +MAILSH()+P('M22 36H42V42H22Z','m')+L('M22 39H42',.6)
  +P('M32 4C44 4 50 13 50 24C50 32 47 37 42 39H22C17 37 14 32 14 24C14 13 20 4 32 4Z')+RIM('M17.5 20C18.5 11 24 6 31 5',1.3)+FOLD('M15.5 28C16.5 33 19 36 22 38M48.5 28C47.5 33 45 36 42 38',1)
  +P(ANN(32,23,11,8.2),'gd')+D(CIR(32,23,8.2))+'<ellipse cx="32" cy="23" rx="6.8" ry="6" fill="#2e5a50" opacity=".6"/>'
  +'<path d="M32 17C28.5 17 26.5 19.5 26.5 22.5C26.5 25 27.5 26.5 29 27.3V29H35V27.3C36.5 26.5 37.5 25 37.5 22.5C37.5 19.5 35.5 17 32 17Z" fill="#cfc4a8" opacity=".3"/>'
  +E(29.6,22.4,1,SOULC)+E(34.4,22.4,1,SOULC)+L('M23.8 23H40.2M32 14.8V31.2',.9)+RIM('M25 18C26.5 16 28.5 15 31 14.8',.7)
  +'<g class="dk">'+[[32,13],[23.3,18],[40.7,18],[23.3,28],[40.7,28],[32,33]].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r=".7"/>').join('')+'</g>'
  +'<path d="M38 34C38.5 36 38 37 38.6 39M26 34C25.5 36 26 37 25.4 39M47 30C47.3 32 47 33 47.4 35" stroke="#8a5a3a" stroke-width="1" opacity=".6" fill="none"/>'
  +'<g fill="#cfc6b0" opacity=".85"><circle cx="19" cy="11" r="1.8"/><circle cx="22" cy="8.4" r="1.1"/><circle cx="46" cy="33" r="1.5"/><circle cx="13" cy="54" r="1.9"/><circle cx="16.4" cy="56.6" r="1.1"/><circle cx="50" cy="46" r="1.3"/></g>'
  +T('M44 6C50 12 46 18 51 24C53 27 51 31 53 35',1.8,'#4f7a48')+T('M24 41C22 46 25 50 22 56',1.6,'#4f7a48')
  +'<path d="M2 58C10 54 16 60 24 56S38 60 46 56 56 60 62 56V64H2Z" fill="#6ea8a4" opacity=".45"/><path d="M2 58C10 54 16 60 24 56S38 60 46 56 56 60 62 56" stroke="#cfe6e0" stroke-opacity=".4" stroke-width=".8" fill="none"/>';
IC['Ash Husk']='<path d="M29 9C26 5 30 3 28 0M37 10C40 6 36 3.5 39 .5" stroke="#8a8478" stroke-opacity=".45" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
  +P('M3 64C3 50 9 40 20 37H44C55 40 61 50 61 64Z')+FOLD('M16 42C13 50 13 58 15 64M48 42C51 50 51 58 49 64M32 44V64',1)+RIM('M6 54C7 46 11 41 18 39',1.2)
  +EMB('M20 46L24 52L22 58M42 44L39 50L43 56M30 50L33 54L31 60')
  +P('M32 12C42 12 47 19 47 27C47 35 41 41 32 41C23 41 17 35 17 27C17 19 22 12 32 12Z')+RIM('M20 22C21.5 16 26 13 31 12.6',1.3)+FOLD('M19 32C21 37 26 40 32 40.5',1)
  +EMB('M30 12.5L28 19L32 23M44 20L40 24')
  +D('M21 25C23 22.5 28 23 29 27C28 30 23 30.5 21.5 28.5ZM43 25C41 22.5 36 23 35 27C36 30 41 30.5 42.5 28.5Z')+E(25,26.8,1.3,'#ff7a2c')+E(39,26.8,1.3,'#ff7a2c')
  +D('M31 29.5L32 32L33 29.5Z')+D('M25 34.5L28 34L31 35L34 34L37 35L39 34.5L37.5 37.5L34 36.8L31 37.6L28 36.8L26.5 37.5Z')+'<path d="M27 35.8L31 36.4L34 35.6L37 36.2" stroke="#ff7a3c" stroke-width=".8" opacity=".7" fill="none"/>'
  +P('M4 52C2 58 4 63 9 63C13 63 15 59 14 55Z','m')+P('M60 52C62 58 60 63 55 63C51 63 49 59 50 55Z','m')+L('M6 58.5H11M53 58.5H58',.6)
  +'<g fill="#ffb347"><circle cx="10" cy="34" r=".7"/><circle cx="54" cy="30" r=".6"/><circle cx="50" cy="19" r=".5"/><circle cx="13" cy="24" r=".5"/></g><g fill="#cfc6b0" opacity=".5"><circle cx="8" cy="44" r=".8"/><circle cx="57" cy="41" r=".7"/></g>';
IC['Barrow Thrall']=P('M4 64V52C4 43 12 38 22 37H42C52 38 60 43 60 52V64Z','m')+FOLD('M16 44L13 64M48 44L51 64M32 47V64',1)+RIM('M6 50C7 44 11 40 18 39',1.1)
  +'<path d="M7 50L57 44M5 58L59 52" stroke="#b8ab90" stroke-opacity=".45" stroke-width="2.2"/>'
  +'<path d="M32 41V52" stroke="#6a665e" stroke-width="2.4" stroke-dasharray="2.4 1.2"/>'+P(ANN(32,55,3,1.6),'m')
  +P('M24 31H40V38H24Z')+T('M21 38H43',4.2,'#4a4640')+L('M21 38H43',.5)+'<g class="gd"><circle cx="24" cy="38" r=".8"/><circle cx="40" cy="38" r=".8"/></g>'
  +P('M32 7C41 7 46 14 46 22C46 30 41 35 32 35C23 35 18 30 18 22C18 14 23 7 32 7Z')+RIM('M20.5 17C22 11 26 8 31 7.6',1.3)
  +'<path d="M18.4 16.5C24 13.5 40 13.5 45.6 16.5L45.9 20C40 17 24 17 18.1 20Z" fill="#b8ab90"/><path d="M18.4 16.5C24 13.5 40 13.5 45.6 16.5L45.9 20C40 17 24 17 18.1 20Z" fill="url(#gSh)"/>'+L('M24 15.2L25 18.4M32 14.6V17.8M40 15.2L39 18.4',.5)
  +D('M21.5 22.5C21.5 20.8 28.5 20.8 28.5 22.8C28.5 25.4 21.5 25.4 21.5 22.5ZM35.5 22.8C35.5 20.8 42.5 20.8 42.5 22.5C42.5 25.4 35.5 25.4 35.5 22.8Z')+E(25,23,1.15,'#ffd27a')+E(39,23,1.15,'#8fd46a')
  +D('M31.2 25.5L32 28L32.8 25.5Z')+D('M26 29C29 30.5 35 30.5 38 29L37 31.5C34 32.5 30 32.5 27 31.5Z')+'<path d="M28 28.6V32.2M31 29.2V32.8M34 29.2V32.8M37 28.6V32.2" stroke="#b8ab90" stroke-width=".6"/>'
  +FOLD('M19 26C20 30 23 33 27 34.5M45 26C44 30 41 33 37 34.5',.8);
IC['Ember Stalker']=T('M50 36C58 32 61 24 57 16',2.2,'currentColor')+FLM(57,15,.45)
  +P('M44 43L50 43L54 60H49L46 51Z','m')+P('M17 43L24 44L22 60H17Z','m')+'<path fill="#e9dfc6" d="M16 60l.8 2.4.8-2.4zM18.5 60l.8 2.4.8-2.4zM48.5 60l.8 2.4.8-2.4zM51 60l.8 2.4.8-2.4z"/>'
  +P('M14 38C16 30 24 27 34 27C44 27 51 30 53 36C55 42 52 46 46 47H24C18 47 14 44 14 38Z')+FOLD('M22 45C30 46.5 40 46.5 47 45',1)
  +L('M22 32L24 35M27 30L28.5 33.5M32 29.5L33 33M37 29.5L37.6 33M42 30L42.4 33.5M47 32L46.8 35M20 39L23 40.5M26 42L28.5 43',.6)+EMB('M28 36L31 39L29 43M40 35L43 38L41.5 42')
  +P('M14 29L15.5 21.5L19 28Z','m')+P('M21 33C17 28 10 27 6 29L2 34L4.5 38C7 42 13 43 19 41Z')+RIM('M7 29.5C10 27.8 14 27.8 17 29.5',.9)
  +D('M2.5 35C5 37 9 38 13 38L12 40.5C8 40.5 5 39 3.5 37.5Z')+'<path fill="#e9dfc6" d="M5 36.4l.9 2.4.9-2.2zM8 37.2l.9 2.3.9-2.2z"/>'+E(11,32,1.2,'#ff7a2c')+D('M2.4 33.2C2.4 32.4 4 32.4 4 33.2Z')
  +RIM('M18 30.5C24 27.8 32 27.2 40 27.8',1.2)+FLM(26,26.5,.32)+FLM(34,25.5,.38)+FLM(42,26.5,.34)
  +'<g fill="#ffb347"><circle cx="30" cy="18" r=".6"/><circle cx="40" cy="16" r=".5"/><circle cx="36" cy="62" r=".5"/></g>';
IC['Cinder Weaver']='<g fill="none" stroke="#ff9a4c" stroke-opacity=".25" stroke-width=".7"><path d="M4 4L22 24M60 4L42 24M0 30H14M64 30H50"/><path d="M14 10C22 14 42 14 50 10M8 20C20 24 44 24 56 20"/></g>'
  +T('M32 0V21',.9,'#e0b48a')
  +T('M26 31C18 24 12 22 7 25L4 30M25 35C16 33 9 35 5 41M26 39C18 43 13 49 12 57M38 31C46 24 52 22 57 25L60 30M39 35C48 33 55 35 59 41M38 39C46 43 51 49 52 57',2.2,'currentColor')
  +L('M7 25L6 24M5 41L4 42M12 57L11.5 59M57 25L58 24M59 41L60 42M52 57L52.5 59',.8)
  +P('M32 34C41 34 47 41 47 49C47 57 40 62 32 62C24 62 17 57 17 49C17 41 23 34 32 34Z')+FOLD('M20 46C26 44 38 44 44 46M20 54C26 52.5 38 52.5 44 54',.8)+RIM('M19.5 45C20.5 39 25 35.5 30 35',1.2)
  +'<path d="M32 40L36.5 47L32 49L27.5 47ZM32 49L36.5 51L32 58L27.5 51Z" fill="#e0602c"/><path d="M32 43L34 47L32 48ZM32 50L34 51L32 55Z" fill="#ffd27a"/>'+E(32,49,1.4,FIREC)
  +P('M32 20C37.5 20 41 24 41 28.5C41 33 37 36 32 36C27 36 23 33 23 28.5C23 24 26.5 20 32 20Z','m')+RIM('M25 25C26 22.5 28.5 21.3 31 21',.8)
  +E(29,28.4,1,'#ff7a2c')+E(35,28.4,1,'#ff7a2c')+'<g fill="#ff9a4c"><circle cx="30.4" cy="25.2" r=".7"/><circle cx="33.6" cy="25.2" r=".7"/><circle cx="27.6" cy="26" r=".5"/><circle cx="36.4" cy="26" r=".5"/></g>'
  +'<path fill="#e9dfc6" d="M29.4 33l1 3.2 1-3zM32.6 33l1 3 1-3.2z"/>'+'<g fill="#ffb347"><circle cx="32" cy="8" r=".7"/><circle cx="32" cy="14" r=".5"/></g>';
IC['Barrow Champion']=T('M9 3L4 64',2.4,'#5a4426')+P('M8.6 4C3 2.5 .5 6 .5 13C2.5 11.5 5.5 12 8.2 15Z')+P('M9.4 5.5L14 7.5L9.2 9.5Z','m')+RIM('M1.6 11C1.8 7.5 3.5 5 6.5 4.5',.8)
  +MAILSH()+P('M24 42H40L41 64H23Z','m')+EMB('M32 46L30 50L33 53L31 57')
  +P('M20 20C16 19 13 16 12.5 11C15.5 13 18 14 21 14.5Z','bn')+P('M44 20C48 19 51 16 51.5 11C48.5 13 46 14 43 14.5Z','bn')+L('M15 14.5L16.5 13.2M49 14.5L47.5 13.2',.6)
  +P('M32 9C24 9 19 15 19 23V36C19 38 21 40 24 40H40C43 40 45 38 45 36V23C45 15 40 9 32 9Z')+RIM('M21.5 21C22.5 14 26.5 10.5 31 10',1.3)+FOLD('M20.5 30V37M43.5 30V37',.9)
  +D('M22 22.5H42V26.5H34V36H30V26.5H22Z')+E(26.5,24.5,1.2,'#ff7a2c')+E(37.5,24.5,1.2,'#ff7a2c')+L('M32 9V22.5',1)
  +EMB('M40 12L38 16L40.5 19')+'<g class="gd"><circle cx="21" cy="29" r=".8"/><circle cx="43" cy="29" r=".8"/><circle cx="21" cy="34" r=".8"/><circle cx="43" cy="34" r=".8"/></g>'
  +P('M2 38C5 36 9 37 9 40.5C9 43.5 5 44 2.5 42.5Z','m');
IC['Stone Gargoyle']=P('M24 26C16 12 6 8 1 10C2 20 6 30 14 36L22 38Z','m')+P('M40 26C48 12 58 8 63 10C62 20 58 30 50 36L42 38Z','m')
  +FOLD('M22 30C16 22 9 16 3 12M21 34C14 30 8 24 4 20M42 30C48 22 55 16 61 12M43 34C50 30 56 24 60 20',.9)+RIM('M2 11C6 9.5 12 11 17 16',.9)
  +P('M6 60H58V64H6Z','m')+L('M6 60H58',.7)
  +P('M14 50C12 56 14 61 20 61H28L26 52ZM50 50C52 56 50 61 44 61H36L38 52Z')
  +P('M20 34C20 28 25 25 32 25S44 28 44 34L47 50C48 56 44 60 40 60H24C20 60 16 56 17 50Z')+FOLD('M32 30V58M24 36C26 38 38 38 40 36',.9)+RIM('M21 34C21.5 30 24 27 28 26',1.2)
  +P('M22 38C19 44 19 52 21 59H26.5L26 44ZM42 38C45 44 45 52 43 59H37.5L38 44Z')+'<path fill="#d9cdb0" d="M21 59l1 2.6 1-2.6zM23.5 59l1 2.6 1-2.6zM38 59l1 2.6 1-2.6zM40.5 59l1 2.6 1-2.6z"/>'
  +P('M24 12C20 9 18 4 19 1C22 3 25 6 27 9ZM40 12C44 9 46 4 45 1C42 3 39 6 37 9Z','m')
  +P('M32 8C39 8 43 13 43 19C43 25 39 29 32 29S21 25 21 19C21 13 25 8 32 8Z')+RIM('M23.5 14C25 10.5 28 9 31 8.8',1)
  +P('M23 16C26 14.5 30 15 31.5 17H32.5C34 15 38 14.5 41 16L40.5 18.5H23.5Z','m')
  +D('M24.5 18.5C24.5 17.4 30 17.4 30 19C30 21 24.5 21 24.5 18.5ZM34 19C34 17.4 39.5 17.4 39.5 18.5C39.5 21 34 21 34 19Z')+E(27.2,19,1.05,'#ffb347')+E(36.8,19,1.05,'#ffb347')
  +P('M29 20.5H35L36 24H28Z','m')+D('M25 24.5C28 26.5 36 26.5 39 24.5L37.5 27.5C35 28.3 29 28.3 26.5 27.5Z')+'<path fill="#d9cdb0" d="M27 25.4l1 2.6 1-2.4zM35 25.6l1 2.4 1-2.6z"/>'
  +L('M36 30L34 36L37 42M26 44L28 50M46 18L49 24',.7)
  +'<path d="M21 14C22 12 24 11.5 25 12.5M15 52C16 50 18 50 19 51M44 57C46 56 48 57 48 58M8 33C9 31.5 11 31.5 12 32.5" stroke="#5f7a40" stroke-width="1.6" opacity=".7" fill="none" stroke-linecap="round"/>';
IC['Nave Stalker']='<path d="M14 64V30C14 18 23 10 32 5C41 10 50 18 50 30V64" stroke="#d8ccb4" stroke-opacity=".12" stroke-width="1.4" fill="none"/>'
  +T('M24 25C16 29 10 37 7 50',2.6,'currentColor')+T('M40 25C48 29 54 37 57 50',2.6,'currentColor')+P(CIR(13,34,1.8),'m')+P(CIR(51,34,1.8),'m')
  +P('M7 49L2 62L5.6 58.4L5 63.5L8.6 56.6L9.2 62.4L11 52Z','bn')+P('M57 49L62 62L58.4 58.4L59 63.5L55.4 56.6L54.8 62.4L53 52Z','bn')
  +P('M28.5 44L26 64H29.5L31.5 46ZM35.5 44L38 64H34.5L32.5 46Z','m')+P('M24 22C24 18 28 16 32 16S40 18 40 22L38 40C38 44 37 46 35 47H29C27 46 26 44 26 40Z')+'<path d="M27 44L37 44L36 50L34 48L32 51L30 48L28 50Z" fill="#3a2c20" opacity=".8"/>'+FOLD('M32 22V40',.8)+RIM('M25.5 24C26 20 28 17.5 31 17',1)
  +L('M27 26C30 27.5 34 27.5 37 26M27 30C30 31.5 34 31.5 37 30M27.5 34C30 35.5 34 35.5 36.5 34',.7)
  +P('M21 22C21 19 25 17.5 28 19.5L26 26ZM43 22C43 19 39 17.5 36 19.5L38 26Z','m')
  +P('M32 2C37 2 39 6 39 11C39 16 36 20 32 20S25 16 25 11C25 6 27 2 32 2Z')+RIM('M27 8C27.5 5 29.5 3 31.5 2.8',.9)+FOLD('M26 14C27 17 29 19 32 19.5',.7)
  +D('M26.5 10L31 11.5L27.5 13.2ZM37.5 10L33 11.5L36.5 13.2Z')+E(28.6,11.6,1,'#ff8a5c')+E(35.4,11.6,1,'#ff8a5c')
  +D('M29 15.3C30.5 16.3 33.5 16.3 35 15.3L34 18.6H30Z')+TEETH([[30.4,15.8,1.8],[32,16.1,2],[33.6,15.8,1.8]]);
IC['Hollow Chorister']='<path d="M54 14C59 19 59 29 54 34M58 9C65 17 65 33 58 40M10 14C5 19 5 29 10 34M6 9C-1 17-1 33 6 40" stroke="#cfc4a8" stroke-opacity=".35" stroke-width="1.4" fill="none" stroke-linecap="round"/>'
  +P('M8 64C9 52 15 42 32 42S55 52 56 64Z')+FOLD('M20 48L17 64M44 48L47 64M27 52L25 64M37 52L39 64',1)+RIM('M11 60C12 52 16 46 22 44',1.2)
  +P('M23 50L32 52L41 50V58L32 60L23 58Z','m')+P('M24.2 51.2L31.4 52.8V58.8L24.2 57.2ZM39.8 51.2L32.6 52.8V58.8L39.8 57.2Z','bn')+L('M26 53.6L30 54.5M26 55.6L30 56.5M34 54.5L38 53.6M34 56.5L38 55.6',.4)
  +P('M16 42C20 38 44 38 48 42C46 46.5 18 46.5 16 42Z','bn')+L('M20 41.4V44.2M24 40.6V44.8M28 40.2V45.2M32 40V45.4M36 40.2V45.2M40 40.6V44.8M44 41.4V44.2',.5)
  +P('M32 5C43 5 48 14 48 25C48 32 46 37 44 40H20C18 37 16 32 16 25C16 14 21 5 32 5Z','m')+RIM('M19 22C19.5 13 24.5 7 31 6',1.3)
  +D('M32 10C25 10 21.5 16 21.5 23C21.5 31 25 38 32 38S42.5 31 42.5 23C42.5 16 39 10 32 10Z')
  +P('M32 12.5C37.5 12.5 40.5 17 40.5 22.5C40.5 29.5 37.5 36.5 32 36.5S23.5 29.5 23.5 22.5C23.5 17 26.5 12.5 32 12.5Z','bn')+RIM('M25.5 18C26.5 15 29 13.5 31.5 13.3',.8)
  +'<ellipse class="dk" cx="28.2" cy="21.5" rx="2.5" ry="3.1"/><ellipse class="dk" cx="35.8" cy="21.5" rx="2.5" ry="3.1"/>'+E(28.2,21.8,1,SOULC)+E(35.8,21.8,1,SOULC)
  +D('M32 26.5C34.3 26.5 35.3 29.5 35.3 31.8C35.3 34.2 33.8 35.6 32 35.6S28.7 34.2 28.7 31.8C28.7 29.5 29.7 26.5 32 26.5Z')+L('M37.5 15L36.4 18.4L37.8 20M26 30L27 32',.5);
IC['Glass Sentinel']='<path d="M6 12L9 6L10 14ZM56 8L60 4L59 13ZM3 34L7 30L6.5 38ZM58 30L62 27L61 35Z" fill="#bfe0da" opacity=".45"/>'
  +P('M4 64V50C4 42 11 38 20 38H44C53 38 60 42 60 50V64Z')
  +'<path d="M4 50L18 44L28 40L32 52Z" fill="#d3a64d" opacity=".3"/><path d="M60 50L46 44L36 40L32 52Z" fill="#8a3a2a" opacity=".35"/><path d="M18 44L20 64H32V52Z" fill="#cfe6e0" opacity=".18"/>'
  +'<path d="M4 50L18 44L20 64M18 44L28 40M60 50L46 44L44 64M46 44L36 40M28 40L32 52L36 40M32 52V64M10 58L18 52M54 58L46 52" stroke="#0a0807" stroke-width="1.2" fill="none" stroke-linejoin="round"/>'+RIM('M6 47C7 43 10 40.5 15 39.6',1.1)
  +P('M32 4L46 12L48 28L40 40H24L16 28L18 12Z')
  +'<path d="M32 4L46 12L32 18Z" fill="#fff" opacity=".22"/><path d="M18 12L32 18L16 28Z" fill="#fff" opacity=".1"/><path d="M48 28L32 18L40 40Z" fill="#000" opacity=".22"/><path d="M24 40L32 32L40 40Z" fill="#d3a64d" opacity=".3"/>'
  +'<path d="M32 4V18M18 12L32 18L46 12M16 28L32 18L48 28M24 40L32 32L40 40" stroke="#0a0807" stroke-width="1.1" fill="none" stroke-linejoin="round"/>'
  +D('M21 23L32 26L43 23L42 28.5L32 31L22 28.5Z')+E(27,26.6,1.2,'#9be0e0')+E(37,26.6,1.2,'#9be0e0')+RIM('M19 13L31 5.6',1.2)
  +'<path d="M40 14L37.5 19.5L41 21.5M10 48L14 52M50 56L53 60" stroke="#fff" stroke-opacity=".5" stroke-width=".6" fill="none"/>';
IC['Tooth Collector']='<path d="M55 30C54 23 52 17 50 12C50 10.5 51.5 10 52.5 11M57.5 30C58.5 23 60 17 62 12C62 10.5 60.5 10 59.5 11" stroke="#8a8478" stroke-width="2" fill="none" stroke-linecap="round"/>'+T('M55 30L50 62M57.5 30L55.5 62',2,'#6a665e')+P(CIR(56.2,30,1.5),'gd')
  +P('M4 64C5 52 12 42 32 42S59 52 60 64Z','m')+FOLD('M18 48L15 64M46 48L49 64M32 52V64',1)+RIM('M7 60C8 52 12 46 19 44',1.1)
  +'<path d="M18 46C24 52.5 40 52.5 46 46" stroke="#5a4426" stroke-width="1" fill="none"/>'+TEETH([[20,48.2,3],[24,50.2,3.4],[28,51.4,3.6],[32,51.8,3.8],[36,51.4,3.6],[40,50.2,3.4],[44,48.2,3]])
  +P('M32 4C44 4 50 14 50 26C50 34 48 40 46 44H18C16 40 14 34 14 26C14 14 20 4 32 4Z','m')+RIM('M17 22C17.5 12 23 6 31 5',1.3)
  +D('M32 10C24 10 20 17 20 25C20 33 24 40 32 40S44 33 44 25C44 17 40 10 32 10Z')
  +P('M32 14C26 14 23 18 23 24V34C23 37 27 39 32 39S41 37 41 34V24C41 18 38 14 32 14Z')+RIM('M24.5 21C25 17.5 28 15.2 31 15',1)
  +D(CIR(28,23,1.9)+CIR(36,23,1.9))+E(28,23,.95,'#ff8a5c')+E(36,23,.95,'#ff8a5c')+L('M32 15V27',.7)
  +L('M24 29.5C28 30.6 36 30.6 40 29.5',.7)+TEETH([[25.5,30,3],[28.5,30.6,3.4],[32,30.9,3.6],[35.5,30.6,3.4],[38.5,30,3]])
  +'<g class="gd"><circle cx="24.6" cy="26.5" r=".7"/><circle cx="39.4" cy="26.5" r=".7"/><circle cx="25" cy="36" r=".7"/><circle cx="39" cy="36" r=".7"/></g>'
  +P('M52 40C55 38 59 39 59 42.5C59 45.5 55 46 52.5 44.5Z','bn');
IC['Vestment Wraith']=P('M18 22C10 26 5 34 4 44C9 42 13 40 17 36Z','m')+P('M46 22C54 26 59 34 60 44C55 42 51 40 47 36Z','m')+D('M4 44C9 42 13 40 17 36L16.5 39C12.5 42 8.5 44 5.5 45ZM60 44C55 42 51 40 47 36L47.5 39C51.5 42 55.5 44 58.5 45Z')
  +'<path d="M58 44V53" stroke="#a8873e" stroke-width="1"/>'+P('M54.5 53H61.5L60.5 58C59.5 60 56.5 60 55.5 58Z','gd')+E(58,56.5,.9,FIREC)+'<path d="M57 52C55 49 58 47 56 44" stroke="#cfc4a8" stroke-opacity=".35" stroke-width="1" fill="none"/>'
  +P('M20 14C26 10 38 10 44 14L49 38C51 48 54 54 58 60C52 58 48 62 43 58C39 62 35 58 32 62C29 58 25 62 21 58C16 62 12 58 6 60C10 54 13 48 15 38Z')
  +FOLD('M22 24L18 56M42 24L46 56M26 30L25 58M38 30L39 58',1)+RIM('M19 22C18 30 16 40 13 50',1.2)
  +P('M21 15L29 26V58.5H35V26L43 15L40.5 13.5L32 22L23.5 13.5Z','gd')+D('M31.2 34H32.8V45H31.2ZM28 38H36V39.6H28Z')+'<path d="M30 28V56M34 28V56" stroke="#0a0807" stroke-opacity=".4" stroke-width=".5" stroke-dasharray="1 1"/>'
  +D('M23 14C27 18 37 18 41 14C39 22 36 26 32 26S25 22 23 14Z')+'<ellipse cx="32" cy="19.5" rx="6.5" ry="3.2" fill="#9be870" opacity=".2"/>'+E(29.2,19.6,1.05,SOULC)+E(34.8,19.6,1.05,SOULC)
  +'<path d="M14 61C13 63 15 64 16 63M31 63C31 64 33 64 34 63.4M48 61C49 63 47 64 46 63" stroke="#cfc4a8" stroke-opacity=".35" stroke-width="1" fill="none"/>';
IC['Cathedral Templar']=P('M47 2L50 6L49.5 36H44.5L44 6Z','bn')+L('M47 7V34',.6)+RIM('M45.2 8V34',.5)
  +MAILSH()+P('M20 42H44L46 64H18Z','bn')+FOLD('M24 46L22 64M40 46L42 64',.9)+'<path d="M32 46V62M26 51H38" stroke="#8a2a1e" stroke-width="3"/>'
  +P('M40 36H54V39H40Z','gd')+T('M47 39V45',2.4,'#5a4426')+P('M43.5 43C43.5 40.5 50.5 40.5 50.5 43V48H43.5Z','m')
  +P('M19 14C19 10 24 7 32 7S45 10 45 14V36C45 38 43 40 40 40H24C21 40 19 38 19 36Z')+RIM('M21 16C21 11 25 8.5 30 8',1.2)+FOLD('M20 28V37M44 28V37',.9)
  +D('M21 21H43V24.5H21Z')+E(27,22.8,1.2,'#ffe9a8')+E(37,22.8,1.2,'#ffe9a8')+L('M32 7V21M19 17.5H45',.8)
  +'<path d="M32 26V37M28 30H36" stroke="#d3a64d" stroke-width="2.4" stroke-linecap="round"/>'+D(CIR(25,32,.7)+CIR(25,35,.7)+CIR(39,32,.7)+CIR(39,35,.7))
  +'<path fill="#4a3a2c" d="M3 42C9 40 19 40 25 42V54C25 59 19 63 14 64.5C9 63 3 59 3 54Z"/><path fill="url(#gSh)" d="M3 42C9 40 19 40 25 42V54C25 59 19 63 14 64.5C9 63 3 59 3 54Z"/>'
  +'<path d="M4 42.5C9.5 40.6 18.5 40.6 24 42.5V54C24 58.4 18.6 62.2 14 63.5C9.4 62.2 4 58.4 4 54Z" fill="none" stroke="#d3a64d" stroke-width="1.4"/>'+T('M14 44V60M8 50H20',2.4,'#d3a64d')+RIM('M5 44.5C5 50 5.5 55 8.5 59',1);
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
// ---- SS : Vane Abbey (R3): plague-year monks, drowned novices, ink and chains, and the Hunger that wears your dead
const QUILLP=(x,y,s)=>GR('translate('+x+' '+y+') scale('+(s||1)+')',P('M0-22C8-16 9-4 2 8L0 12L-2 8C-6-2-5-14 0-22Z','bn')+L('M0-18V10',1)+L('M0-12L4-15M0-6L5-9M0 0L4-3',.8));
const PAGEP=(x,y,s,r)=>GR('translate('+x+' '+y+') rotate('+(r||0)+') scale('+(s||1)+')',P('M-8-10H6L9-7V10H-8Z','bn')+L('M-5-5H5M-5-1H6M-5 3H4M-5 7H5',.7));
const INKC='#1a1418', GOLDINK='#e8c060';
IC['Plague-Year Mourner']=P('M10 62C10 48 16 40 32 40S54 48 54 62Z','m')+HOODP(32,26,.95,'m')+P('M26 20C26 16 38 16 38 20L44 34L32 30L20 34Z','bn')+E(27,22,1.2,'#d8c878')+E(37,22,1.2,'#d8c878')
 +L('M32 22L32 30',1)+P('M44 44H50V62H44Z','b')+P('M40 40H54V46H40Z','b')+FOLD('M22 46L18 60M42 48L44 60',1.1)+'<path d="M18 52C16 56 18 60 22 60" fill="none" stroke="#5a6a3a" stroke-width="1.6"/>';
IC['Drowned Novice']=P('M14 62C14 50 18 42 32 42S50 50 50 62Z','m')+HOODP(32,24,.85,'m')+E(27,24,1.3,'#9ad8e8')+E(37,24,1.3,'#9ad8e8')
 +'<path d="M20 30C20 36 18 40 16 44M44 30C44 36 46 40 48 44M26 36C26 42 25 46 24 50" stroke="#6aa8c0" stroke-width="1.4" fill="none" opacity=".75"/>'
 +SWD(25,P('M48 30L52 34L40 50L37 47Z','m'))+'<circle cx="18" cy="58" r="1.6" fill="#6aa8c0"/><circle cx="46" cy="60" r="1.3" fill="#6aa8c0"/>';
IC['Brother of the Binding']=P('M10 62C10 48 18 40 32 40S54 48 54 62Z','m')+P('M32 6C40 6 44 12 44 20C44 28 39 34 32 34S20 28 20 20C20 12 24 6 32 6Z','bn')+P('M20 16C20 6 44 6 44 16C40 12 24 12 20 16Z','m')
 +E(27,21,1.2,'#e8d8a0')+E(37,21,1.2,'#e8d8a0')+L('M28 28C30 29 34 29 36 28',1.1)+P('M20 44H44V58H20Z','b')+L('M32 44V58',1.4)+L('M23 48H30M23 52H30M34 48H41M34 52H41',.8)
 +'<path d="M14 50C10 46 12 40 18 42M50 50C54 46 52 40 46 42" fill="none" stroke="#a9a090" stroke-width="2" stroke-dasharray="2.6 1.2"/>';
IC['Ink Wraith']=P('M32 4C46 4 52 16 52 28C52 40 50 48 54 60L46 54L40 62L32 54L24 62L18 54L10 60C14 48 12 40 12 28C12 16 18 4 32 4Z','m')
 +D('M22 20C22 16 28 16 28 20S22 24 22 20ZM36 20C36 16 42 16 42 20S36 24 36 20Z')+E(25,20,1.4,GOLDINK)+E(39,20,1.4,GOLDINK)+D('M26 32C28 36 36 36 38 32L36 40H28Z')
 +'<path d="M16 34C14 40 15 44 13 48M48 34C50 40 49 44 51 48M30 44V52" stroke="'+INKC+'" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+QUILLP(54,26,.7);
IC['Chained Lector']=P('M8 62C8 48 16 40 32 40S56 48 56 62Z','m')+P('M32 6C40 6 45 12 45 20C45 28 39 34 32 34S19 28 19 20C19 12 24 6 32 6Z','bn')+D('M22 18H42V23H22Z')+E(27,20.5,1.2,'#ff9a5c')+E(37,20.5,1.2,'#ff9a5c')
 +P('M16 44L32 48L48 44V56L32 60L16 56Z','bn')+L('M32 48V60',1.2)+L('M19 48L29 50M19 52L29 54M35 50L45 48M35 54L45 52',.8)
 +'<path d="M8 40C14 46 22 46 26 40M56 40C50 46 42 46 38 40M12 30C10 36 12 42 16 44" fill="none" stroke="#a9a090" stroke-width="2.4" stroke-dasharray="3 1.3"/>';
IC['Censer-Bearer']=P('M12 62C12 50 18 42 30 42S48 50 48 62Z','m')+HOODP(30,24,.82,'m')+E(25,24,1.2,'#ffb347')+E(35,24,1.2,'#ffb347')+T('M44 30L54 46',1.6,'#a98a4a')
 +P('M48 46C48 42 60 42 60 46L58 54C56 57 52 57 50 54Z','gd')+L('M49 49H59',.9)+'<path d="M54 40C50 34 58 30 54 22C60 26 58 32 60 36M50 38C47 33 52 30 50 26" fill="none" stroke="#c8c0b0" stroke-width="1.6" opacity=".6"/>';
IC['Weeping Unnamed']=P('M10 62C10 48 18 38 32 38S54 48 54 62Z','m')+P('M32 4C42 4 47 12 47 22C47 32 41 38 32 38S17 32 17 22C17 12 22 4 32 4Z','bn')
 +D('M24 20C24 18 30 18 30 20M34 20C34 18 40 18 40 20')+'<path d="M26 22C26 28 25 32 24 36M38 22C38 28 39 32 40 36" stroke="#9ad8e8" stroke-width="1.6" fill="none"/>'
 +FOLD('M28 30C30 31 34 31 36 30',1)+FOLD('M20 46L16 60M44 46L48 60M32 44V60',1.1)+'<path d="M8 56L4 44L12 50ZM56 56L60 44L52 50Z" class="bn"/>';
IC['The Hunger']=P('M32 4C50 4 60 18 60 34C60 50 48 62 32 62S4 50 4 34C4 18 14 4 32 4Z','m')+PAGEP(14,22,1,-20)+PAGEP(50,22,1,20)+PAGEP(10,44,.9,-35)+PAGEP(54,44,.9,35)
 +D('M14 34C14 26 24 22 32 22S50 26 50 34C50 46 42 54 32 54S14 46 14 34Z')+TEETH([[18,34,4],[22,33,5],[26,32,5],[30,32,6],[34,32,6],[38,32,5],[42,33,5],[46,34,4]])
 +'<path fill="#e3d6b8" d="M20 48l1.4-5 1.4 5zM26 51l1.4-6 1.4 6zM32 52l1.4-6 1.4 6zM38 51l1.4-6 1.4 6zM44 48l-1.4-5-1.4 5z"/>'+E(24,14,1.8,GOLDINK)+E(40,14,1.8,GOLDINK)+E(32,10,1.4,GOLDINK);
IC['i_6-wa']=SWD(-35,QUILLP(32,30,1.35)+P('M29 46H35V58H29Z','m')+'<circle cx="32" cy="60" r="3" fill="#d3a64d"/>'+'<path d="M32 46V40" stroke="'+INKC+'" stroke-width="2"/>');
IC['i_6-wb']=T('M32 20V63',3,'#6a5a3e')+P('M22 12C22 6 42 6 42 12L40 22C38 26 26 26 24 22Z','gd')+L('M23 15H41',1)+D('M27 17H37V20H27Z')+'<path d="M28 8C24 2 32 0 30 -4M36 8C40 2 34 0 36 -4" fill="none" stroke="#c8c0b0" stroke-width="1.4" opacity=".6"/>'+P(CIR(32,62,2.4),'gd');
IC['i_6-aa']=P('M32 4C18 4 12 14 12 26C12 40 8 50 6 60H58C56 50 52 40 52 26C52 14 46 4 32 4Z')+D('M32 14C25 14 22 19 22 26C22 34 26 40 32 40S42 34 42 26C42 19 39 14 32 14Z')+FOLD('M18 40L14 58M46 40L50 58',1.2)+L('M24 46H40',1)+P(CIR(32,48,2.6),'gd');
IC['i_6-ab']=P(ROBE)+'<path d="M24 20C22 30 26 34 22 44M40 24C42 32 38 38 42 48M30 40C30 46 34 48 32 56" stroke="'+INKC+'" stroke-width="2.4" fill="none" opacity=".75" stroke-linecap="round"/>'+FOLD('M18 30L17 58M46 30L47 58',1.1);
IC['i_6-ta']=CHN(10)+P('M16 34C16 28 48 28 48 34V46C48 52 16 52 16 46Z','m')+L('M16 40H48',1.4)+'<path d="M22 30V50M42 30V50" stroke="#a9a090" stroke-width="2" stroke-dasharray="2.6 1.2"/>';
IC['i_6-tb']=T('M44 42L58 58',3.4,'#6a5a3e')+P(ANN(30,30,16,12),'gd')+'<circle cx="30" cy="30" r="12" fill="#a8d8e8" opacity=".28"/><path d="M22 24C24 20 28 18 32 18" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/>'+L('M24 32H36M24 36H33',.8);
IC['i_6-tc']=P('M32 10C44 10 52 18 52 30C52 34 54 36 56 38C52 40 50 44 50 48C44 52 38 54 32 54C20 54 12 46 12 34C12 20 20 10 32 10Z','gd')+D(CIR(32,32,12))+P('M26 26L32 22L38 26L36 36H28Z','gd')+L('M29 40L35 40',1.2);
IC.i_ledgerchain=CHN(8)+P('M14 30H50V58H14Z','bn')+P('M14 30H50V36H14Z','m')+L('M32 30V58',1.6)+L('M18 40H29M18 44H29M18 48H27M35 40H46M35 44H46M35 48H44',.8)+'<path d="M50 44C56 44 60 40 60 34M50 52C58 52 62 46 62 38" fill="none" stroke="#a9a090" stroke-width="2.4" stroke-dasharray="3 1.3"/>'+GEM(32,54,2.2,'#e8c060');
IC.i_rquill=SWD(-30,QUILLP(32,26,1.5)+'<path d="M32 44L29 58L32 62L35 58Z" fill="#2a1a18"/>'+'<path d="M32 46V60" stroke="#8a2a24" stroke-width="1.6"/>'+GEM(32,40,1.8,'#c0302a'));   // The Thief's Quill: a red-tipped pen, sharpened to a blade
IC.i_rcoat=P(ROBE)+'<path d="M20 14V60M44 14V60" stroke="#8a2a24" stroke-width="1.6" stroke-dasharray="2.4 1.6" fill="none"/>'+L('M24 24H30M24 30H31M24 36H29M34 24H40M33 30H40M35 36H40',.8)+FOLD('M17 40L15 58M47 40L49 58',1.1)+P(CIR(32,18,2.4),'gd');   // Margin-Stitched Coat: notes in the margins, stitched in red
IC.i_rledger=P('M10 26H32V58H10Z','bn')+P('M32 26H54V58H32Z','bn')+P('M10 22H32V28H10ZM32 22H54V28H32Z','m')+L('M32 22V58',1.8)+L('M14 34H28M14 38H28M14 42H26',.8)+'<path d="M36 34H50M36 38H50M36 42H47M36 48L50 34" stroke="#a8281e" stroke-width="1.2" fill="none"/>'+GEM(32,60,2.2,'#c0302a');   // The Other Ledger: their book, every line struck through in red
// ---- the Rift's guardians (R9, game-rift.js)
IC['The Folded Knight']=P('M8 62C8 46 18 38 32 38S56 46 56 62Z','m')+P('M20 8H44L46 30C46 36 40 40 32 40S18 36 18 30Z','bn')+D('M22 18H42V22H22Z')+E(27,20,1.2,'#a8d8ff')+E(37,20,1.2,'#a8d8ff')
 +L('M32 8V40',1.2)+'<path d="M32 38L32 62" stroke="#000" stroke-opacity=".4" stroke-width="2"/>'+T('M54 10L60 2',2,'#c8c8d0')+T('M50 14L58 40',2.6,'#c8c8d0')+L('M12 46L52 58M12 58L52 46',.8);
IC['Mother of Gates']=P('M10 62C10 44 18 34 32 34S54 44 54 62Z','m')+P('M32 4C42 4 46 12 46 20C46 28 40 34 32 34S18 28 18 20C18 12 22 4 32 4Z','bn')+E(27,20,1.2,'#e8c060')+E(37,20,1.2,'#e8c060')
 +P('M20 42H30V60H20Z','m')+P('M34 42H44V60H34Z','m')+'<path d="M20 42A5 5 0 0 1 30 42M34 42A5 5 0 0 1 44 42" fill="none" stroke="#a9a090" stroke-width="1.6"/>'+GEM(28,52,1.2,'#e8c060')+GEM(42,52,1.2,'#e8c060');
IC['The Echo']=P('M32 6C44 6 50 16 50 28C50 42 44 50 48 60H16C20 50 14 42 14 28C14 16 20 6 32 6Z','m')+D('M24 22C24 18 30 18 30 22S24 26 24 22ZM34 22C34 18 40 18 40 22S34 26 34 22Z')+E(27,22,1.2,'#c8c0ff')+E(37,22,1.2,'#c8c0ff')
 +'<path d="M8 28C4 32 4 40 8 44M56 28C60 32 60 40 56 44M2 24C-3 32-3 40 2 48M62 24C67 32 67 40 62 48" fill="none" stroke="#c8c0ff" stroke-width="1.6" opacity=".6"/>';
IC['Brass Saint']=P('M12 62C12 46 20 38 32 38S52 46 52 62Z','gd')+P('M32 6C40 6 44 12 44 20C44 28 39 34 32 34S20 28 20 20C20 12 24 6 32 6Z','gd')+'<circle cx="32" cy="14" r="14" fill="none" stroke="#e8c060" stroke-width="1.6" opacity=".7"/>'
 +E(27,20,1.1,'#fff2c0')+E(37,20,1.1,'#fff2c0')+P('M26 44C26 40 38 40 38 44L40 54H24Z','gd')+L('M25 50H39',.8)+P(CIR(32,57,2),'gd');
IC['The Tear Itself']=P('M32 2C40 14 46 22 46 34C46 48 40 58 32 62C24 58 18 48 18 34C18 22 24 14 32 2Z','m')+D('M32 12C36 20 38 26 38 34C38 44 35 50 32 54C29 50 26 44 26 34C26 26 28 20 32 12Z')
 +'<path d="M32 16C33 26 31 38 32 50" stroke="#c8a0ff" stroke-width="2" fill="none"/>'+E(32,30,1.6,'#c8a0ff')+'<path d="M10 20L16 24M54 20L48 24M8 44L15 42M56 44L49 42" stroke="#c8a0ff" stroke-width="1.4" opacity=".6"/>';
IC['The Counting Dead']=P('M8 62C8 48 16 40 32 40S56 48 56 62Z','m')+P('M32 4C41 4 46 11 46 20C46 29 40 36 32 36S18 29 18 20C18 11 23 4 32 4Z','bn')+D('M24 18C24 14 30 14 30 18S24 22 24 18ZM34 18C34 14 40 14 40 18S34 22 34 18Z')
 +E(27,18,1.1,'#ff9a5c')+E(37,18,1.1,'#ff9a5c')+L('M27 28H37',1)+L('M28 26V30M31 26V30M34 26V30',.7)+L('M16 48V58M20 48V58M24 48V58M28 48V58M12 56L30 50',1.2)+L('M40 48V58M44 48V58M48 48V58',1.2);
SECRET.forEach((B,i)=>{ IC[B.name]=IC[DUNGEONS[i].boss[0]]; });   // a secret master wears its gate boss's shape, drawn in a darker light (CSS .secret)
// Natural colour and material for each creature (fur, chitin, flesh, bone, cloth, metal, stone, wood, spirit, glass).
// The rank colour stays on the frame; the creature is painted in its own colours, textured and lit by the #paint filter.
const MAT={'Tunnel Rat':['fur','#6f6253'],'Grave Beetle':['chitin','#3d4a3c'],'Marrow Mite':['chitin','#8a7556'],'The Rat King':['fur','#7a5f45'],'Tannery Brute':['flesh','#8a5a48'],'Shiv Cutpurse':['cloth','#4f4a40'],'Tallow Chandler':['cloth','#6b5a44'],'Warren Bandit':['cloth','#4e463c'],'Skeleton Guard':['metal','#5d6a66'],'Crypt Ghoul':['flesh','#7d8a6e'],'Drowned Priest':['flesh','#5f7a74'],'The Crypt Warden':['metal','#556160'],'Drowned Sentinel':['metal','#4f6a68'],'Coffin Crawler':['wood','#5a4636'],'Tide Acolyte':['flesh','#4f7268'],'Crypt Legionnaire':['metal','#4f5f58'],'Ash Husk':['stone','#6a5f58'],'Barrow Wight':['spirit','#8f8a7c'],'Pyre Witch':['cloth','#6e2f22'],'The Ember Knight':['metal','#6a5248'],'Barrow Thrall':['flesh','#6d665c'],'Ember Stalker':['flesh','#7a4a30'],'Cinder Weaver':['chitin','#5a3a28'],'Barrow Champion':['metal','#6a5a40'],'Stone Gargoyle':['stone','#6b6a66'],'Nave Stalker':['flesh','#6b2f2a'],'Hollow Chorister':['cloth','#5a5048'],'The Bishop of Teeth':['cloth','#6a5a48'],'Glass Sentinel':['glass','#5f8c86'],'Tooth Collector':['metal','#5a4a3a'],'Vestment Wraith':['cloth','#5a3a2e'],'Cathedral Templar':['metal','#6e6650'],'Thorn Troll':['flesh','#5d6b44'],'Rust Knight':['metal','#7a4a2c'],'Sap Weaver':['chitin','#4f5a3a'],'The Orchard Mother':['wood','#4d5a36'],'Iron Scarecrow':['wood','#6b5a40'],'Fruit Reaver':['wood','#5a4632'],'Grove Shepherd':['wood','#55603e'],'Orchard Marshal':['flesh','#6e3a2e'],'Throne Guard':['metal','#6a665c'],'Ash Revenant':['stone','#5f5650'],'Whisper Choir':['spirit','#6d7a6a'],'The Pale Sovereign':['cloth','#6b6458'],'Ember Herald':['cloth','#7a3a24'],'Crownless Duelist':['cloth','#4a3e36'],'Pallbearer':['wood','#5a4838'],'Ash Praetorian':['metal','#6a6058'],'Imp':['flesh','#7a3a30'],'Hellhound':['flesh','#5a2e26'],'Chain Devil':['flesh','#6e3428'],'Pit Warden':['metal','#5a3a2c'],'Soul Tender':['glass','#6a3a30'],'Brimstone Chanter':['cloth','#6e4a2a'],'Hell Legionary':['metal','#4e4a48'],'Infernal Duelist':['flesh','#4f5e3e'],'The Gate Hound':['fur','#4e4440'],'Cinder Matron':['flesh','#7a4a36'],'The Iron Inquisitor':['metal','#7a6a48'],'Lord of Flies':['chitin','#6a4a2a'],'The Bone Cantor':['cloth','#4a2a2a'],'Duke of Chains':['metal','#5e5a54'],'The Pale Executioner':['metal','#55585a'],'Archdevil Vael':['flesh','#6b3a2a'],'The Hollow Seraph':['spirit','#b0a68a'],'Abaddon, King of Hell':['flesh','#7a2e22'],'Necromancer':['cloth','#3e3a44'],'_':['bone','#cfc4a8']};
// R12 PR B: the six hexers borrow the painted shapes of their gate's casters, in their own colors
[['Bog Witch','Pyre Witch','cloth','#4f6a3a'],['Crypt Augur','Tide Acolyte','cloth','#4a5a6a'],['Ash Seer','Cinder Weaver','cloth','#7a4a30'],['Choir Cantor','Hollow Chorister','cloth','#6a5a7a'],['Iron Oracle','Iron Scarecrow','metal','#6a6a70'],['Court Astrologer','Whisper Choir','cloth','#3a3060']]
  .forEach(([n,src,mat,col],i)=>{ const eye='<g class="hx-eye"><ellipse cx="'+(46-i*2)+'" cy="'+(12+i)+'" rx="7" ry="4" fill="#0c0a10" stroke="#c9a6ff" stroke-width="1.4"/><circle cx="'+(46-i*2)+'" cy="'+(12+i)+'" r="2" fill="#c9a6ff"/></g>';   /* the hexer's eye, a little apart on each */
    if(IC[src]) IC[n]=IC[src]+eye; if(GLYPH[src]) GLYPH[n]=GLYPH[src]+'<circle class="cs" cx="'+(25-i)+'" cy="6" r="2.5"/>'; MAT[n]=[mat,col]; });
Object.assign(MAT,{'Plague-Year Mourner':['cloth','#4a4438'],'Drowned Novice':['cloth','#5a6a6e'],'Brother of the Binding':['cloth','#5a4a3a'],'Ink Wraith':['spirit','#2a2430'],'Chained Lector':['cloth','#4a3a34'],'Censer-Bearer':['cloth','#6a5a44'],'Weeping Unnamed':['bone','#a8a090'],'The Hunger':['flesh','#3a2a2e']});   /* Vane Abbey */
Object.assign(MAT,{'The Folded Knight':['metal','#5a5e6a'],'Mother of Gates':['stone','#6a6058'],'The Echo':['spirit','#3a3448'],'Brass Saint':['metal','#8a6a2e'],'The Tear Itself':['spirit','#2a1e38'],'The Counting Dead':['bone','#a89e8a']});   /* the Rift's guardians */
// The living who march on the necropolis wear borrowed shapes in their own colours: drab wool, oiled leather, the Inquisition's iron.
[['Militia Spearman','Warren Bandit',['cloth','#5c5040']],['Crossbowman','Shiv Cutpurse',['cloth','#46483c']],['Chaplain','Tallow Chandler',['cloth','#5a5448']],['Witch-hunter','Crownless Duelist',['cloth','#3a302a']],[SIEGE_BOSS,'Cathedral Templar',['metal','#6e6046']]]
  .forEach(([n,from,m])=>{ IC[n]=IC[from]; MAT[n]=m; });
[['Templar Shieldwall','Cathedral Templar',['metal','#7a7058']],['Flagellant','Ash Revenant',['flesh','#7a4a3a']],['Relic Bearer','Hollow Chorister',['cloth','#6a5a3a']],['Exorcist','Drowned Priest',['cloth','#4a4038']],
 ['Pyre Priest','Pyre Witch',['cloth','#7a3a22']],['Hound Master','Barrow Champion',['cloth','#544634']],['War Hound','Hellhound',['fur','#5a4a38']],
 ['The Witchfinder General','Crownless Duelist',['cloth','#2e2620']],['The Saint of Pyres','Brass Saint',['metal','#a86a2e']],['The Grand Inquisitor','Cathedral Templar',['metal','#8a7a4a']]]
  .forEach(([n,from,m])=>{ IC[n]=IC[from]; MAT[n]=m; });   /* R14: the higher tiers of the living */
const matOf=key=>MAT[key]||(()=>{ const i=SECRET.findIndex(B=>B.name===key); return i>=0?MAT[DUNGEONS[i].boss[0]]:null; })()||MAT._;
// R16 PR B: the hero's robe colour and staff head (game-collection.js); o.robe / o.staff preview a look in the wardrobe
const STAFF_SKULL=SKULL(53,10,.42,'bn',SOULC);
const STAFF_HEAD={
  lantern:P('M49 4H57V15H49Z','dk')+E(53,10,2,'#ffc864')+L('M49 4H57V15H49ZM53 4V15',.6)+P('M50 2H56V4H50Z','gd')+P('M51 15H55V17H51Z','gd'),
  quill:P('M53 16C49 10 49 4 56 0C57 6 56 11 53 16Z','bn')+L('M53 16C54 10 55 5 56 0',.6)+L('M51 9L54 7M51 12L54 10M52 5L55 3',.45),
  crown:P('M47 13L48 5L51 9L53 3L55 9L58 5L59 13Z','gd')+E(53,10,1.2,'#e85a5a')+L('M47 13H59',.7)
};
function heroArt(o){ const st=o.staff!==undefined?o.staff:(typeof cosOf==='function'?cosOf('staff'):null); const b=IC.Necromancer; return st&&STAFF_HEAD[st]?b.replace(STAFF_SKULL,STAFF_HEAD[st]):b; }
const heroRobe=o=>{ const rb=o.robe!==undefined?o.robe:(typeof cosOf==='function'?cosOf('robe'):null); return rb&&COS.robe[rb]?COS.robe[rb].c:null; };
function ico(key,rankI,o){ o=o||{}; const M=matOf(key), hero=key==='Necromancer', col=(hero&&heroRobe(o))||M[1]; return '<span class="ico r'+rankI+(o.boss?' boss':'')+(o.secret?' secret':'')+(o.elite?' elite':'')+'" aria-hidden="true"><svg viewBox="0 0 64 64" class="mt-'+M[0]+'" style="color:'+col+'"><g filter="url(#paint)">'+(hero?heroArt(o):(IC[key]||IC._))+'</g></svg>'+(key!=='Necromancer'?roleBadge(o.role):'')+'</span>'; }
const app=document.getElementById('app');
const ui={confirm:null};
const pct=(v,m)=>Math.max(0,Math.min(100,m?v/m*100:0));
// The Status panel's HP and mana: a painted flask whose liquid stands at the share left, the number on the glass (role="meter" carries it for screen readers).
const VIAL_BODY='M16 15v6C7 25 4 33 4 41c0 11 8 17 18 17s18-6 18-17c0-8-3-16-12-20v-6z';
function vial(label,v,m,cls){
  v=Math.max(0,Math.round(v)); const f=m>0?Math.min(1,v/m):0, y=(58-f*38).toFixed(1);   /* the body runs from y 20 to 58 */
  return '<div class="vial v-'+cls+'" role="meter" aria-label="'+label+'" aria-valuemin="0" aria-valuemax="'+m+'" aria-valuenow="'+v+'" aria-valuetext="'+v+' / '+m+'">'
   +'<svg viewBox="0 0 44 60" aria-hidden="true"><defs><clipPath id="vc-'+cls+'"><path d="'+VIAL_BODY+'"/></clipPath></defs><g filter="url(#paint)">'
   +'<rect x="15" y="1" width="14" height="6" rx="1.5" class="v-cork"/><path d="'+VIAL_BODY+'" class="v-glass"/>'
   +'<g clip-path="url(#vc-'+cls+')"><rect x="0" y="'+y+'" width="44" height="60" class="v-liq"/><ellipse cx="22" cy="'+y+'" rx="20" ry="1.6" class="v-top"/></g>'
   +'<path d="'+VIAL_BODY+'" class="v-rim"/><path d="M10 34c-2 4-2 10 1 14" class="v-shine"/><rect x="14" y="13" width="16" height="3" rx="1" class="v-lip"/></g></svg>'
   +'<span class="v-num num">'+v+'</span><span class="v-cap"><b>'+label+'</b><span class="num">/ '+m+'</span></span></div>';
}
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

// Stat glyphs: a small worn mark per stat, so compact lines read as mark + number. The word stays in title and aria-label (trDom lays Turkish over both).
const SG_PATH={
 hp:'<path d="M5 9C1.5 6.5.5 4.6.9 3.1 1.4 1.3 3.6.9 5 2.6 6.4.9 8.6 1.3 9.1 3.1 9.5 4.6 8.5 6.5 5 9Z"/>',
 atk:'<path d="M9.2.8L8.8 3.2 4.3 7.5 2.6 5.8 6.8 1.3Z"/><path d="M1.2 5.4l3.4 3.4-.8.8-3.4-3.4Z"/><path d="M1.6 7.6l.8.8-1.1 1.1-.8-.8Z"/><path class="k" d="M8.3 1.7L3.6 6.4"/>',
 crit:'<path d="M5 .4l1 3.1 3.2-1.1-2 2.6 2.6 2-3.2.1L5 9.6 4.4 7.1l-3.2-.1 2.6-2-2-2.6 3.2 1.1Z"/><circle class="d" cx="5" cy="5" r="1"/>',
 siph:'<path class="o" d="M8.4 2.6A4 4 0 1 0 8.6 7.3"/><path d="M9.4 8.2L8.9 5.6 6.6 7.2Z"/><path d="M5 3.2C4.2 4.4 3.6 5 3.6 5.8a1.4 1.4 0 0 0 2.8 0C6.4 5 5.8 4.4 5 3.2Z"/>',
 mana:'<path d="M5 .8C3.4 3.3 2.2 4.7 2.2 6.2a2.8 2.8 0 0 0 5.6 0C7.8 4.7 6.6 3.3 5 .8Z"/><path class="k" d="M3.8 5.6c-.2.8.2 1.6 1 1.9"/>',
 ward:'<path d="M5 .6L8.8 2v3.2C8.8 7.3 7.1 8.8 5 9.5 2.9 8.8 1.2 7.3 1.2 5.2V2Z"/><path class="k" d="M5 1.8v6.6M2.6 4.4h4.8"/>',
 strength:'<path d="M2 3.4C2 2.6 2.6 2 3.4 2h3.4c.9 0 1.5.6 1.5 1.4v3.4c0 1.4-1 2.4-2.4 2.4H4C2.9 9.2 2 8.3 2 7.2Z"/><path class="k" d="M3.8 2.2v2.6M5.4 2.2v2.6M7 2.2v2.6M2.2 5.6h3.4"/>',
 constitution:'<path class="o" d="M5 1v8.2M5 2.8C3.4 2.8 2.1 3.4 1.7 4.5M5 2.8c1.6 0 2.9.6 3.3 1.7M5 4.9C3.5 4.9 2.3 5.5 1.9 6.6M5 4.9c1.5 0 2.7.6 3.1 1.7M5 7C4 7 3.1 7.4 2.7 8.1M5 7c1 0 1.9.4 2.3 1.1"/>',
 intelligence:'<path d="M5 2.4C3.6 1.5 2 1.4.6 1.8v6.4C2 7.8 3.6 7.9 5 8.8c1.4-.9 3-1 4.4-.6V1.8C8 1.4 6.4 1.5 5 2.4Z"/><path class="k" d="M5 2.6v6M1.8 3.4c.9-.1 1.8 0 2.4.4M1.8 5c.9-.1 1.8 0 2.4.4M5.8 3.8c.6-.4 1.5-.5 2.4-.4M5.8 5.4c.6-.4 1.5-.5 2.4-.4"/>',
 will:'<path d="M5 .4C6.3 1.9 6.8 3 6.1 4.1 5.7 4.9 4.3 4.9 3.9 4.1 3.3 3 3.8 1.9 5 .4Z"/><rect x="3.6" y="5.2" width="2.8" height="4.2" rx=".4"/>',
 raise:'<path d="M.6 8.4h8.8v1.2H.6Z"/><path d="M5 .8L8 4H6v3.8H4V4H2Z"/>',
 mpow:'<path d="M5 .8C2.7.8 1.3 2.4 1.3 4.4c0 1.2.6 2.1 1.4 2.6v2.2h4.6V7c.8-.5 1.4-1.4 1.4-2.6C8.7 2.4 7.3.8 5 .8Z"/><circle class="d" cx="3.6" cy="4.6" r="1"/><circle class="d" cx="6.4" cy="4.6" r="1"/><path class="k" d="M4 7.6v1.4M5 7.6v1.4M6 7.6v1.4"/>',
 matk:'<path class="o" d="M1.8 8.8L3.8 1.4M4.4 8.8L6.1 1.4M7 8.8L8.6 2.4"/>',
 mhp:'<path class="o" d="M5 8.6C2 6.4 1.1 4.8 1.4 3.4 1.9 1.8 3.8 1.5 5 3 6.2 1.5 8.1 1.8 8.6 3.4 8.9 4.8 8 6.4 5 8.6Z"/><path class="k" d="M3.4 5.6h3.2"/>',
 regen:'<path d="M4.4 1.2C3 3.4 2 4.6 2 5.9a2.4 2.4 0 0 0 4.8 0C6.8 4.6 5.8 3.4 4.4 1.2Z"/><path d="M7.6 5.6h.9v1.2h1.2v.9H8.5v1.2h-.9V7.7H6.4v-.9h1.2Z"/>',
 slot:'<path d="M2 9.2V4C2 2.3 3.3 1 5 1s3 1.3 3 3v5.2Z"/><path class="k" d="M5 2.8v3.6M3.7 4h2.6"/>',
 pierce:'<path class="o" d="M1.2 8.8L8.2 1.8M5.6 1.6h2.8v2.8M3 4.4l2.6 2.6"/>',
 dr:'<path d="M5 .6L8.8 2v3.2C8.8 7.3 7.1 8.8 5 9.5 2.9 8.8 1.2 7.3 1.2 5.2V2Z"/><path class="k" d="M5.6 1.4L4.2 4.2l1.9 1.3-1.5 3.4"/>',
 heal:'<path d="M3.8 1h2.4v2.8H9v2.4H6.2V9H3.8V6.2H1V3.8h2.8Z"/>',
 skill:'<path class="o" d="M5 .8L7.5 9 1 3.9h8L2.5 9Z"/>', fres:'<path d="M5 .6C6 2.6 8.2 3.8 8.2 6.3A3.2 3.2 0 0 1 1.8 6.3C1.8 4.9 2.6 4 3.3 3.3 3.4 4.4 3.9 5 4.5 5.2 4.2 3.6 4.4 2 5 .6Z"/><path class="d" d="M5 9C4 9 3.4 8.3 3.6 7.4 3.8 6.6 4.6 6.2 5 5.4 5.6 6.4 6.4 6.9 6.4 7.7 6.4 8.4 5.8 9 5 9Z"/>',fdmg:'<path d="M5 .6C6 2.6 8.2 3.8 8.2 6.3A3.2 3.2 0 0 1 1.8 6.3C1.8 4.9 2.6 4 3.3 3.3 3.4 4.4 3.9 5 4.5 5.2 4.2 3.6 4.4 2 5 .6Z"/><path class="d" d="M5 9C4 9 3.4 8.3 3.6 7.4 3.8 6.6 4.6 6.2 5 5.4 5.6 6.4 6.4 6.9 6.4 7.7 6.4 8.4 5.8 9 5 9Z"/>',
 frres:'<path class="o" d="M5 .6v8.8M1.2 2.8l7.6 4.4M1.2 7.2l7.6-4.4M3.8 1.4L5 2.6l1.2-1.2M3.8 8.6L5 7.4l1.2 1.2"/>',frdmg:'<path class="o" d="M5 .6v8.8M1.2 2.8l7.6 4.4M1.2 7.2l7.6-4.4M3.8 1.4L5 2.6l1.2-1.2M3.8 8.6L5 7.4l1.2 1.2"/>',
 rres:'<path d="M5 .8C3.6 3 2.4 4.6 2.4 6.3a2.6 2.6 0 0 0 5.2 0C7.6 4.6 6.4 3 5 .8Z"/><circle class="d" cx="4.1" cy="6.2" r=".7"/><circle class="d" cx="5.9" cy="6.9" r=".5"/>',rdmg:'<path d="M5 .8C3.6 3 2.4 4.6 2.4 6.3a2.6 2.6 0 0 0 5.2 0C7.6 4.6 6.4 3 5 .8Z"/><circle class="d" cx="4.1" cy="6.2" r=".7"/><circle class="d" cx="5.9" cy="6.9" r=".5"/>',
 sres:'<path d="M6.6 .9A4.3 4.3 0 1 0 9.1 7 3.6 3.6 0 0 1 6.6.9Z"/>',sdmg:'<path d="M6.6 .9A4.3 4.3 0 1 0 9.1 7 3.6 3.6 0 0 1 6.6.9Z"/>'
};
const SG_WORD={pierce:'Armor pierce',dr:'Damage taken',heal:'Healing received',skill:'Skill damage',matk:'Minion attack',mhp:'Minion HP'};
const SG_HINT={hp:'Damage it can take before it falls',atk:'Damage of a basic hit',crit:'Chance for Strike to land a critical hit',siph:'Soul Siphon drains life from a foe and heals you',mana:'Pays for skills and for raising the dead',ward:'Bone Ward: a shield that soaks up damage',
  strength:'Strike damage, crit chance, armor piercing, minion attack, and Strike from your army\'s power (Command)',constitution:'Max HP, damage taken, healing received, minion HP, and max HP from your army\'s power (Command)',intelligence:'Mana, Siphon, Ward, skill damage, minion attack, and Siphon from your army\'s power (Command)',will:'Mana, army slots, raise odds, minion bond',
  raise:'Chance that a fallen foe answers your call',mpow:'More HP and attack for all your minions',matk:'More attack for all your minions',mhp:'More max HP for all your minions',regen:'Mana you regain every turn',slot:'How many minions your army can hold',
  pierce:'Share of foe armor your Strike ignores',dr:'Less damage from every hit you take',heal:'More healing from every source',skill:'More damage from your skills',
  fres:'Less fire damage taken by you',frres:'Less frost damage taken by you',rres:'Less rot damage taken by you',sres:'Less shadow damage taken by you',
  fdmg:'More fire damage from you and your army',frdmg:'More frost damage from you and your army',rdmg:'More rot damage from you and your army',sdmg:'More shadow damage from you and your army'};   // the stat tooltip's second line (sgTipShow, ui-input.js)
const sgl=(k,lab)=>{ lab=lab||SG_WORD[k]||(STATL[k]&&STATL[k][0])||k; return '<span class="sg sg-'+k+'" role="img" data-k="'+k+'" aria-label="'+lab+'"><svg viewBox="0 0 10 10" aria-hidden="true">'+(SG_PATH[k]||'')+'</svg></span>'; };
const manaCost=n=>'<span class="mcost">'+sgl('mana','Mana cost')+n+'</span>';   // battle buttons: what an action costs, so a bare "10" reads as 10 mana
const statG=(k,v)=>'<span class="sv">'+sgl(k)+(v>0?'+':'&minus;')+Math.abs(v)+STATL[k][1]+'</span>';   // item lines: mark and signed number
