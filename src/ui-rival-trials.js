// ----- the Rival and Trials: icon, arena, Gates tab lines, the Trial card, Records, bestiary row, Codex pages
// The rival: a second keeper in a tall pointed cowl and a standing collar, an open ledger in both hands, a sickle-staff
// behind the shoulder; oxblood cloth and ember eyes (the Necromancer is round-hooded, staff in hand, soul-green).
IC[RIVAL_KIND]=T('M9 64V12',2.4,'#3a2a20')+RIM('M8.3 18V60',.5)
  +P('M9 12C16 6 25 7 28 12C22 10 15 11 9 16Z','bn')+FOLD('M12 13C17 10 22 10 26 11.5',.6)
  +P('M32 20C22 20 17 27 15 36C13 46 8 55 3 64H61C56 55 51 46 49 36C47 27 42 20 32 20Z','m')
  +FOLD('M22 40C20 48 17 56 14 64M32 42V64M42 40C44 48 47 56 50 64',1.2)+RIM('M17 38C15 46 11 54 7 62',1.4)
  +P('M20 34L11 14L26 28Z')+P('M44 34L53 14L38 28Z')+RIM('M12 16L20 32',.9)+FOLD('M52 16L44 32',.8)
  +P('M32 1L21 22C20 29 24 34 32 36C40 34 44 29 43 22Z')
  +D('M32 11C27.5 14 25.5 19 26 24C26.5 29 29 32 32 33C35 32 37.5 29 38 24C38.5 19 36.5 14 32 11Z')
  +'<path d="M27 21.5C29 20 35 20 37 21.5L36.4 25.5C35 26.5 29 26.5 27.6 25.5Z" fill="#cfc4a8" opacity=".3"/>'
  +E(29.4,23.4,1.05,'#e8564a')+E(34.6,23.4,1.05,'#e8564a')
  +FOLD('M22 22C24 14 28 7 32 4M42 22C40 14 36 7 32 4',.9)+RIM('M22.5 20C24 13 27.5 7 31 3.5',1.2)
  +P('M17 44L31 41.5V52L17 54.5Z','bn')+P('M47 44L33 41.5V52L47 54.5Z','bn')+D('M31 41.5H33V52H31Z')
  +L('M20 46.5L28.5 45M20 49L28.5 47.5M35.5 45L44 46.5M35.5 47.5L44 49',.5)
  +'<path d="M32 52V58" stroke="#8a2a1e" stroke-width="1.6"/>'
  +P('M14 46C15 43 18 43 19 45L18 50C16 51 14 50 14 48Z','bn')+P('M50 46C49 43 46 43 45 45L46 50C48 51 50 50 50 48Z','bn')
  +'<path d="M57 30C60 24 55 21 58 15M50 10C52 6 49 4 51 1" stroke="#e8564a" stroke-opacity=".35" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
MAT[RIVAL_KIND]=['cloth','#5c2a22'];
BOSS_LOOK[RIVAL_KIND]=['#1c0c0a','#b0402c','rings'];
ARENAS[RIVAL_KIND]=r=>arFrame(RIVAL_KIND,r,(c1,c2)=>arRing(800,430,200,c2,3,.35)+arRing(800,430,280,c2,2,.2)+arEyes(r,6,c2,200,620));

function rivalWarnHTML(){   // the Gates tab, the day before and the day itself
  if(!rivalWarned()) return ''; const g=rv(), D=DUNGEONS[g.gi];
  return '<div class="rival-line">'+(rivalToday()?'<b>'+g.name+' waits today in the '+D.name+'.</b> Your first visit there meets them in the boss room instead of its master.'
    :'<b>'+g.name+' comes tomorrow to the '+D.name+'.</b> Your first visit there tomorrow meets them in the boss room instead of its master.')+'</div>'+wagerHTML();
}
function rivalCardHTML(){   // Records: the rival's page in the Ledger
  const g=S.rival; if(!g||!g.name||!g.met) return '';
  const row=(t,v)=>'<div class="tt-row"><div><h4>'+t+'</h4></div><div class="rec-v">'+v+'</div></div>';
  const next=rivalWarned()?'<b>'+(rivalToday()?'today':'in 1 day')+'</b> <span class="dim">&middot; '+DUNGEONS[g.gi].name+'</span>':'<span class="dim">unknown until you are warned</span>';
  return '<p class="group-h">The Rival</p><div class="rival-card">'+ico(RIVAL_KIND,topGate(),{boss:true,role:'reaper'})+'<div><h4 class="rival-name">'+g.name+'</h4><div class="u-sub">Met on day '+g.met+'</div></div></div>'
   +arcTrackHTML()+'<div class="items">'+row('Encounters','<b>'+g.enc+'</b>')+row('Your wins','<b>'+g.wins+'</b>')+row('Your losses','<b>'+g.losses+'</b>')+row('Bodies taken','<b>'+g.thefts+'</b>')
   +row('Hunting',(w=>w?'<b>your '+ROLES[w].label.toLowerCase()+'s</b> <span class="dim">&middot; the kind your army leans on</span>':'<span class="dim">whatever lies freshest</span>')(rivalWant()))
   +row('Borrowed page',g.page>=0&&LORE_PAGES[g.page]?'<b>'+LORE_PAGES[g.page].t+'</b>':'<span class="dim">none</span>')+row('Next challenge',next)+'</div>'
   +'<p class="group-h">Bodies it holds</p>'+((g.stash||[]).length?'<div class="items">'+g.stash.map(b=>row(b.name+(b.mine?' ('+b.mine+')':''),'<span class="dim">'+(b.mine?'once yours &middot; ':'')+DUNGEONS[b.di].name+(b.cd&&CORPSE_CONDS[b.cd]?' &middot; '+CORPSE_CONDS[b.cd].name:'')+'</span>')).join('')+'</div>':'<p class="q-note">None. Bodies they steal stand with them at their next challenge.</p>');
}
function rivalBesHTML(){   // the bestiary: the rival as a boss kind, once beaten
  const k=(S.kills&&S.kills[RIVAL_KIND])||0; if(k<=0) return '';
  return '<div class="bes-gate"><div class="bes-h"><div class="badge rival-b">R</div><div><h3>The Rival</h3><div class="tiers-line">Leaves no body and no table: a beaten rival pays a legendary from your deepest open gate.</div></div></div>'
   +'<div class="bes-row">'+ico(RIVAL_KIND,topGate(),{boss:true,role:'reaper'})+'<div><div class="u-name">'+RIVAL_KIND+'</div><div class="u-sub">Reaper &middot; Beaten '+k+' time'+(k===1?'':'s')+'</div>'+masteryLine(RIVAL_KIND)+'</div></div></div>';
}
function trialHTML(){   // the Gates tab's Trial sub-tab
  if(!trialOpen()) return ''; const p=trialPlan(), T=tri(), wb=trialBestWeek(), w=trialWeek(), left=7-((S.day-1)%7);
  let h='<section class="win trial-w" aria-labelledby="h-trial"><h2 class="win-h" id="h-trial">Trial &middot; Week '+w+'</h2><h3 class="win-title">The same four rooms for everyone who tries this week</h3>';
  if(!p) return h+'<p class="lede">No gate you have cleared in this book stands open to you yet. Clear one, and the week&#39;s Trial waits there.</p></section>';
  h+='<div class="items"><div class="tt-row"><div><h4>'+DUNGEONS[p.di].name+'</h4><div class="u-sub">'+HEAT[p.tier].name+' &middot; foes from Lv '+p.lv+' &middot; '+left+' day'+(left===1?'':'s')+' left this week</div></div></div>'
   +p.mods.map(k=>'<div class="tt-row"><div><h4>'+MODS[k].name+'</h4><div class="u-sub">'+MODS[k].desc+'</div></div></div>').join('')+'</div>'
   +'<p class="q-note">Four rooms, no doors, no events, no raising. Potions, skills and orders as usual. Score: turns taken plus '+TRIAL_DOWN+' for each minion downed; lower is better. A fall scores nothing. The first completion each week pays gold and bone dust like one clear of the gate.</p>'
   +'<p class="q-note">Par '+TRIAL_PAR+': the first score at or under it this week also pays '+trialHearts(p.tier)+' Heart'+(trialHearts(p.tier)===1?'':'s')+' of '+DUNGEONS[p.di].boss[0]+' (for Awakening)'+(wb&&wb.hp?'. <span class="ok">Paid this week.</span>':'.')+'</p>'
   +'<div class="items"><div class="tt-row"><div><h4>Your best this week</h4></div><div class="rec-v">'+(wb?'<b>'+wb.s+'</b> <span class="dim">&middot; day '+wb.day+'</span>':'<span class="dim">not yet</span>')+'</div></div>'
   +'<div class="tt-row"><div><h4>Your best ever</h4></div><div class="rec-v">'+(T.best?'<b>'+T.best.s+'</b> <span class="dim">&middot; day '+T.best.day+'</span>':'<span class="dim">not yet</span>')+'</div></div></div>';
  const why=T.day===S.day?'You have tried the Trial today. Come back tomorrow.':S.watches<=0?'No watches left today.':S.player.lvl<RK[p.di].unlock?'This gate opens at level '+RK[p.di].unlock+'.':'';
  return h+(why?'<p class="q-note">'+why+'</p>':'')+'<div class="btns"><button class="btn primary" data-a="trial"'+(trialReady()?'':' disabled')+'>Enter the Trial &middot; 1 watch</button></div></section>';
}
function trialRecHTML(){   // Records: the week's best, the all-time best and the last weeks
  const T=S.trials; if(!T||(!T.best&&!(T.log||[]).length)) return '';
  const row=(t,v)=>'<div class="tt-row"><div><h4>'+t+'</h4></div><div class="rec-v">'+v+'</div></div>', at=x=>DUNGEONS[x.di].name+', '+HEAT[x.t].name;
  return '<p class="group-h">Trials</p><p class="q-note">Turns plus '+TRIAL_DOWN+' per minion downed; lower is better.</p><div class="items">'
   +(T.best?row('Best ever','<b>'+T.best.s+'</b> <span class="dim">&middot; week '+T.best.w+' &middot; '+at(T.best)+' &middot; day '+T.best.day+'</span>'):'')
   +T.log.map(x=>row('Week '+x.w,'<b>'+x.s+'</b> <span class="dim">&middot; '+at(x)+' &middot; day '+x.day+'</span>')).join('')+'</div>';
}
function trialResultHTML(r){   // the raise screen after a Trial's last room
  const t=r.trialRes; if(!t) return '';
  return '<div class="trial-res"><p class="group-h">Score</p><div class="items">'
   +'<div class="tt-row"><div><h4>Turns taken</h4></div><div class="rec-v"><b>'+t.turns+'</b></div></div>'
   +'<div class="tt-row"><div><h4>Minions downed</h4></div><div class="rec-v"><b>'+t.downs+'</b> <span class="dim">&times; '+TRIAL_DOWN+' = '+t.downs*TRIAL_DOWN+'</span></div></div>'
   +'<div class="tt-row"><div><h4>Score</h4></div><div class="rec-v"><b>'+t.s+'</b>'+(t.record?' <span class="ok">new best ever</span>':t.better?' <span class="ok">new best this week</span>':'')+'</div></div></div>'
   +(t.g?'<p class="q-note ok">First completion this week: +'+t.g+' gold, +'+t.d+' bone dust.</p>':'<p class="q-note">This week&#39;s reward has been paid.</p>')
   +(t.h?'<p class="q-note ok">Par '+TRIAL_PAR+' beaten: +'+t.h+' Heart'+(t.h===1?'':'s')+' of '+DUNGEONS[r.di].boss[0]+'.</p>':t.s>TRIAL_PAR?'<p class="q-note">Par is '+TRIAL_PAR+'. Beat it for the week&#39;s hearts.</p>':'')+'</div>';
}
function cxRivalHTML(){
  const pct=v=>Math.round(v*100)+'%', g=S.rival||{};
  return cxP('Once you have cleared '+RIVAL_AT+' different gates, a rival necromancer opens a ledger of their own. Their name is written once and stays with the book, through New Game+.')
   +cxList([cxRow('Theft','On a gate run (never the Tower, the Rift, a siege or a Trial), every '+RIVAL_THEFT[0]+' to '+RIVAL_THEFT[1]+' days the rival takes the most valuable body from a room before you act, of the role your army leans on most (the most minions, then the most levels) when there is one: never from the first room, never a boss, never when fewer than 2 bodies are left. The first theft waits until their first challenge has been announced. Nothing you spent is lost.'),
     cxRow('Challenge','Every '+RIVAL_GAP[0]+' to '+RIVAL_GAP[1]+' days the rival waits in the boss room of a gate you have cleared, warned the day before (a notice and a line on the Gates tab). Your first visit there that day meets them instead of its master. Missed, the day passes and they choose another.'),
     cxRow('The fight','The rival is a reaper boss at your level +'+RIVAL_LV+' or more, as strong as the hardest gate open to you, with '+BOSS_ABIL[RIVAL_ABIL].name+' (warned a turn ahead) and a second phase at half HP. '+RIVAL_FOLLOW[0]+' to '+RIVAL_FOLLOW[1]+' raised followers of kinds you have met in that gate stand with them. Every win makes them '+pct(RIVAL_STEP)+' stronger and brings one more follower every two wins.'),
     cxRow('Stolen bodies','They keep the last '+RIVAL_STASH+' bodies they took and raise them as their followers, those from that gate first, at their own level; an elite keeps its affixes and a body its condition. Stolen bodies drop no gear or trophies. Kill one and its body is yours to raise, with the condition it had; fall or flee and they keep it.'),
     cxRow('Win','A legendary from your deepest open gate&#39;s table, gold like a boss x'+RIVAL_GOLD+', a borrowed page back, and the next challenge '+RIVAL_PUSH+' days later than usual. The rival leaves no body.'),
     cxRow('Loss','Falling or fleeing costs no more than an ordinary fall. The rival borrows one of your torn pages until your next win; with no page to take (or one already borrowed) they take '+pct(RIVAL_FINE)+' of the gold you carry, at most one clear&#39;s worth. Nothing is ever deleted.'),
     cxRow('The rival\'s war','Their story runs in five chapters, shown on their page in Records: Margins (as above); The Open Hand, once you have fought '+ARC_FIGHTS+' challenges; Fire at the Walls, '+ARC_SIEGE_DAYS+' days later once you have held a siege; then their own gate and the reckoning.'),
     cxRow('Wagers','From The Open Hand, on the day before a challenge and the day itself, you may stake a Reserve minion (from the gates, unlocked) against the stolen body they name: the closest of theirs at its rank or higher. Win the challenge and their body joins you Reclaimed; lose or flee and yours goes into their book, and they will raise it against you. A wager lapses if the challenge is not fought.'),
     cxRow('Their siege','In Fire at the Walls the next siege is theirs: the last wave is the rival, as strong as a challenge, with their stolen dead instead of the Inquisitor Captain. Broken, it gives back '+ARC_SIEGE_BACK+' stolen bodies Reclaimed and their next theft waits; lost, they also carry off your weakest Reserve minion.'),
     cxRow('Reclaimed','A body won back from the rival (a wager, their siege, or a stolen body you kill and raise) rises Reclaimed: '+Math.round(RECL_K*100)+'% more HP and attack.')])
   +(g.name&&g.met?cxP(g.name+': '+g.enc+' encounters, '+g.wins+' won, '+g.losses+' lost.'):'');
}
function cxTrialsHTML(){
  return cxP('Once the Throne of Ash has fallen, each week (days 1 to 7, 8 to 14, and so on) holds one Trial on the Gates tab: one gate you have cleared, on Normal, Hard or Brutal, with one or two curses. The rooms and foes are the same for every attempt that week; their level is fixed when the week begins.')
   +cxP('Whatever gate they come from, Trial foes fight as hard as the Throne of Ash&#39;s, and stand as far below your level as the Throne&#39;s foes stand below its Recommended level on that tier. The week is never harder than the hardest tier the Throne recommends for your level. Curses bring their rules, not stronger foes.')
   +cxList([cxRow('Entry','One watch, at most once a day. Four rooms in a row: no doors, no events, no raising, no gear, gold or trophies. Potions, skills, orders and ultimates as usual.'),
     cxRow('Score','Turns taken plus '+TRIAL_DOWN+' for each minion downed. Lower is better. A fall scores nothing.'),
     cxRow('Reward','The first completion each week pays gold and bone dust like one clear of that gate. Repeats pay nothing, but a better score replaces the week&#39;s best.'),
     cxRow('Par','The first score at or under '+TRIAL_PAR+' each week pays Hearts of the gate&#39;s boss: 1 on Normal, 2 on Hard, 3 on Brutal. Hearts awaken uniques.'),
     cxRow('Records','Your best for each of the last '+TRIAL_LOG+' weeks and your best ever, with the day, on the Records page. Kept through New Game+.')]);
}
