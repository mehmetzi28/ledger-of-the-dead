// ===== FAITH =====
// From level 8 the Old Shrine (Town tab) takes your oath: Honored One or Dishonored One. Each path has a buff and a debuff.
// Devotion grows with the days you keep the oath (buff x1.5 after 10 days, x2 after 25); the debuff stays as it is.
// Renouncing costs gold and devotion starts over.
const FAITH={
  hon:{name:'Honored One',   vow:'Swear to the Old Gods of the valley. They keep your body whole, and ask for restraint.', buff:{hpp:10,healp:25},debuff:{dmgp:-8,goldp:-15}},
  dis:{name:'Dishonored One',vow:'Spit on the Old Gods and take what the grave owes you. Power and plunder, paid for in flesh.',buff:{dmgp:12,goldp:20},debuff:{hpp:-10,healp:-25}}
};
const FAITH_LV=8, DEVOTION=[0,10,25], DEVOTION_MUL=[1,1.5,2];
// At full devotion (3/3) each path also grants a blessing, once per run.
const GRACE_HP=.25, TITHE_SOULS=3;   /* measured: Grace in the Tower too was worth ~11 floors to an Honored bot, so it guards gate runs only */
FAITH.hon.bless={name:'Grace of the Old Gods',desc:'Once per gate run, a killing blow leaves you at '+GRACE_HP*100+'% HP instead (not in the Tower).'};
FAITH.dis.bless={name:'Tithe of Souls',desc:'Every run begins with '+TITHE_SOULS+' Souls already harvested.'};
const blessed=id=>faithOf()===id&&devotion()>=DEVOTION.length-1;
function titheSouls(){ if(blessed('dis')&&S.run){ S.run.souls=Math.max(S.run.souls||0,Math.min(SOUL_MAX,TITHE_SOULS)); } }
const faithOf=()=>(S&&S.faith&&FAITH[S.faith.id])?S.faith.id:null;
const devotion=()=>{ if(!faithOf()) return 0; const d=S.day-S.faith.day; return d>=DEVOTION[2]?2:d>=DEVOTION[1]?1:0; };
const faithBuff=id=>{ const F=FAITH[id], m=faithOf()===id?DEVOTION_MUL[devotion()]:1, o={}; for(const k in F.buff) o[k]=Math.round(F.buff[k]*m); return o; };
const faithB=k=>{ const id=faithOf(); if(!id) return 0; return (faithBuff(id)[k]||0)+(FAITH[id].debuff[k]||0); };
const renounceCost=()=>100*S.player.lvl;
function swear(id){ if(S.mode!=='town'||!FAITH[id]||faithOf()||!faithOpen()) return false; vitals(()=>{ S.faith={id,day:S.day}; }); tally('sworn'); return true; }
function renounce(){ if(S.mode!=='town'||!faithOf()) return false; const c=renounceCost(); if(S.gold<c) return false; S.gold-=c; vitals(()=>{ delete S.faith; }); S.player.hp=Math.min(S.player.hp,pMax()); return true; }
const xb=k=>titleB(k)+(k==='goldp'?titleColB():0)+setB(k)+usetB(k)+faithB(k)+skB(k);   // the worn title, the title collection (gold only), gate sets, unique sets, faith and the small passive skills

// ===== SKILL UPGRADES =====
// At rank 3 each skill offers a choice of two upgrades. Forgetting your skills lets you choose again.
// Rank-3 upgrade numbers (the passives' upgrades each add a mechanic of their own, not more of the same bonus).
const OSSIFIED=.08, MARROW=1.5, MEND_REVIVE=.3, OVERFLOW_MANA=5, BLOOD_OATH=.1, GRAVECALLER=2, POCKETS=1.5, KEEN_TRO=.15, KEEN_DROP=1.1, INSIGHT=1.25, BARBS=.15, FEAST_CAP=.3, CLEAR_MIND=.1, FRUGAL=.5, SENSE_SALT=30, DEEP_WELL=.85, DEEP_REGEN=1, IRON_WILL=.85, IRON_BASE=.95, IRON_LOW=.5, BLOODLET=.15, RENDING=10, MOON_LOW=.5, MOON_HIGH=1.25, SOUL_REAP_HEAL=.25, SOUL_REAP_MANA=10;
// 2026-11-19: a bot measurement found Necrotic Edge, Reap and Deathless Will gave the same results either way (Reap's choices and Iron Will only
// mattered near death). Each choice now works on every use: Rending sunders on a crit, Bloodletting bleeds, Harvest Moon also hits harder above
// the line, Soul Reap heals on every reap, Deep Well adds a mana a turn, Iron Will always takes a little off.
// 2026-11-19, measured with the balance bot rushing one skill to rank 3 ("mod":"skill:a"): Ossified at 15% cleared ~3 points more than Marrow Ward
// (88/87% vs 85/84%, seeds 7700/9100), the only clear outlier: Ossified 15%->8%, Marrow Ward 30%->50% more ward. Field Notes counted every kill twice,
// which undid the slower mastery: now every second kill counts twice (1.5x).
const SKILL_MODS={
  spear:    {a:['Impaler','Pierces all foe armor.'],                      b:['Splinter','Also hits another foe for 50%.']},
  bonearmor:{a:['Ossified','Every room starts with a Ward worth '+Math.round(OSSIFIED*100)+'% of your max HP.'], b:['Marrow Ward','Bone Ward grants '+Math.round((MARROW-1)*100)+'% more ward.']},
  mend:     {a:['Deep Mending','Also pulls your strongest downed minion back up at 30% of its HP.'], b:['Shared Flesh','Also heals you for 15% of your max HP.']},
  blast:    {a:['Bigger Bang','Deals 30% more damage and Sunders every foe it hits for 2 turns.'], b:['Grave Gas','Also poisons and Blights every foe it hits.']},
  soulwell: {a:['Overflow','Every Soul you harvest restores 5 mana.'],     b:['Thrift','Soul Siphon costs 6 mana instead of 8.']},
  curse:    {a:['Lingering','Lasts 5 turns.'],                             b:['Spreading','Curses every foe, at 80% strength.']},
  gravepact:{a:['Blood Oath','Every minion gains +10% crit chance; strikers crit 35% of the time.'], b:['Bone Shell','Your minions take 10% less damage.']},
  chill:    {a:['Deep Freeze','Bosses resist 20% less often.'],            b:['Shatter','Frozen foes take 25% more damage.']},
  edge:     {a:['Rending','Strike has +'+RENDING+'% crit chance, and its crits Sunder the target for 2 turns.'], b:['Bloodletting','Strike heals you for 10% of its damage and makes the target Bleed for '+Math.round(BLOODLET*100)+'% of it for 2 turns.']},
  frenzy:   {a:['Bloodlust','Lasts 2 turns longer.'],                      b:['Unholy Vigor','Also heals each minion for 15% of its HP.']},
  mastery:  {a:['Gravecaller','Raised minions rise 2 levels higher, never past your level + 2.'], b:['Thrifty Rites','Raising costs 25% less mana.']},
  reap:     {a:['Harvest Moon','Doubles below '+Math.round(MOON_LOW*100)+'% HP instead of 35%, and above that deals '+Math.round((MOON_HIGH-1)*100)+'% more.'], b:['Soul Reap','Reap heals you for '+Math.round(SOUL_REAP_HEAL*100)+'% of its damage, and a kill with it refunds '+SOUL_REAP_MANA+' mana.']},
  robber:   {a:['Deep Pockets','Elites and bosses drop 50% more gold.'],   b:['Keen Eye','Foes drop trophies more often, 75% instead of 60%, and gear 10% more often.']},
  scholar:  {a:['Insight','Elites and bosses give 25% more XP.'],          b:['Field Notes','Every second kill counts twice toward studying and mastering its kind.']},
  calcify:  {a:['Petrified','Enemy crits cannot crit you: they land as plain hits and open no wound.'], b:['Barbed Hide','Foes that hit you take 15% of the blow back.']},
  sanguine: {a:['Blood Feast','Healing past your max HP becomes Ward, up to 30% of your max HP.'], b:['Clear Mind','Healing you receive also restores mana worth 10% of it.']},
  thrift:   {a:['Frugal Rites','A failed raise refunds half its mana.'],   b:['Grave Sense','Grave Salts add 30% to a raise instead of 20%.']},
  deathless:{a:['Deep Well','Active skills cost 15% less mana, and you regain '+DEEP_REGEN+' more mana every turn in battle.'], b:['Iron Will','You take '+Math.round((1-IRON_BASE)*100)+'% less damage, and '+Math.round((1-IRON_WILL)*100)+'% less below '+Math.round(IRON_LOW*100)+'% HP.']}
};
// The small passives above feed the same bonus pool as titles, sets and faith.
const skB=k=>{ if(!S||!S.player) return 0;
  switch(k){
    case 'goldp': return 5*sk('robber');
    case 'xpp':   return 4*sk('scholar');
    case 'drp':   return 2*sk('calcify');
    case 'healp': return 8*sk('sanguine');
    case 'manap': return 5*sk('deathless');
  } return 0; };
const skMod=id=>(sk(id)>=SK_MAX&&S.player.skMod&&S.player.skMod[id])||null;
const hasMod=(id,c)=>skMod(id)===c;
function chooseMod(id,c){ const P=S.player; if(S.mode!=='town'||!SKILL_MODS[id]||!SKILL_MODS[id][c]||sk(id)<SK_MAX||skMod(id)) return false; vitals(()=>{ P.skMod=P.skMod||{}; P.skMod[id]=c; }); return true; }
const skCost=s=>hasMod('deathless','a')?Math.round(s.cost*DEEP_WELL):s.cost;   // Deep Well
const siphonCost=()=>hasMod('soulwell','b')?6:8;   // Soul Siphon: see the SOULS block for its armor piercing and Souls

// ===== MINION COMMANDS =====
// Once per room, each kind of minion in your army can be given an order. Orders are free: they do not use your turn.
const CMDS={
  vanguard:{name:'Taunt',      desc:'For 2 turns, foes aim their attacks at your vanguards, and a vanguard takes any Sundering Blow (other boss moves still land where they land).'},
  striker: {name:'Focus',      desc:'This turn your strikers always crit, and a focused crit breaks a boss\'s charging move.'},
  mender:  {name:'Bone Shield',desc:'Each mender wards you for 150% of its attack.'},
  reaper:  {name:'Execute',    desc:'This turn your reapers deal double damage to foes below 40% HP.'}
};
const canCommand=role=>S.mode==='battle'&&!!CMDS[role]&&!(S.run.cmd&&S.run.cmd[role])&&S.army.some(m=>m.role===role&&m.hp>0);
function command(role){
  if(!canCommand(role)) return false;
  const r=S.run, P=S.player, mine=S.army.filter(m=>m.role===role&&m.hp>0); r.cmd=r.cmd||{}; r.cmd[role]=true; tally('commands');
  if(role==='vanguard'){ r.taunt=2; log('Taunt: your vanguards bellow, and every foe turns on them.','ok'); }
  else if(role==='striker'){ r.focus=true; log('Focus: your strikers pick their spots.','ok'); }
  else if(role==='mender'){ const w=mine.reduce((a,m)=>a+Math.round(m.atk*1.5),0); P.shield=Math.min(Math.round(pMax()*.6),P.shield+w); mark('p',0,0); log('Bone Shield: your menders ward you. You hold '+P.shield+' ward.','ok'); }
  else { r.execute=true; log('Execute: your reapers look for the weak.','ok'); }
  sfx('skill'); return true;
}
// Guard: a vanguard order that costs your turn (act('guard')), apart from the free orders above. Until your next turn, the first foe blow that
// would kill you, boss moves included, lands on a living front-row vanguard at SB_TAKE of its damage (it may die of it). Once per room (r.cmd.guard);
// r.guard: the turn it holds through. Not in the room snapshot, so a Retry gives it back.
const SB_TAKE=1.5, GUARD={name:'Guard',desc:'Costs your turn. Until your next turn, the first foe blow that would kill you, boss moves included, is taken by a vanguard in your front row at '+Math.round(SB_TAKE*100)+'% of its damage. It may fall to it.'};
const guardFront=()=>frontOf(S.army).filter(m=>m.role==='vanguard').sort((a,b)=>b.hp-a.hp)[0];
const canGuard=()=>S.mode==='battle'&&!!S.run&&!(S.run.cmd&&S.run.cmd.guard)&&!!guardFront();
function guard(){ if(!canGuard()) return false; const r=S.run; r.cmd=r.cmd||{}; r.cmd.guard=true; r.guard=r.turn; tally('commands'); log('Guard: '+guardFront().nick+' plants itself before you. The next blow that would kill you is its to take.','ok'); return true; }
function guardBlow(tg,d){   // the vanguard that takes this blow on you instead, or null
  const r=S.run, P=S.player; if(!r||tg.id!=='p'||r.guard!==r.turn||allyDr(P,d)-(P.shield||0)<P.hp) return null;
  const v=guardFront(); if(!v) return null; delete r.guard; log('Guard: '+v.nick+' steps in front of you and takes the killing blow.','ok'); sfx('guardblow'); return v; }

// ===== STORY AND BOSS VOICES =====
// The Ledger tells its story as you go: a passage for the first clear of each gate and for Tower milestones. Bosses speak.
const STORY=[
  {act:1,id:'intro',t:'The Ledger opens',m:'You found the book in a drowned chapel, its pages blank but warm. When you wrote your name inside, every grave in the valley turned over in its sleep. The Ledger wants names. It will give you the dead who answer to them.'},
  {act:1,id:'g0',t:'The Rat King',m:'The Rat King was a tanner once, buried under his own vats. He held his court of vermin for forty years, waiting for someone to tell him he could stop. The Ledger wrote his name in a careful hand, and somewhere beneath the city a second page filled itself in.'},
  {act:1,id:'g1',t:'The Crypt Warden',m:'The Warden kept his post long after the family he guarded had rotted. He did not fight you for treasure. He fought because no one had ever relieved him of his watch. In the Ledger his entry ends with a single word: dismissed.'},
  {act:2,id:'g2',t:'The Ember Knight',m:'The barrow burned because the Knight would not let it go out. He believed the fire kept something worse asleep beneath the mound. The Ledger does not say whether he was right. The ground is still warm.'},
  {act:2,id:'g3',t:'The Bishop of Teeth',m:'The Bishop preached that the dead should keep their voices. His choir sang for a century without breath. When he fell, the Ledger turned to a page already written, in your handwriting, that you do not remember writing.'},
  {act:2,id:'g4',t:'The Orchard Mother',m:'The Mother planted iron in the ground and grew a forest of it, to fence in her children. You learn too late that her children were the graves of the valley, and that the Ledger had been eating them one name at a time.'},
  {act:2,id:'g5',t:'The Pale Sovereign',m:'The Sovereign was the last to hold the Ledger before you. He wrote until there were no names left but his own, and then he wrote that one too. His court kneels to you now. The book has a new final page, and it is blank, and it is waiting.'},
  {act:3,id:'t25',t:'The burning stair',m:'Twenty-five floors into the Tower, the walls begin to whisper names from the Ledger. Some of them are yours. The dead you raised did not come from nowhere; the Tower has been sending them up for a very long time.'},
  {act:3,id:'t50',t:'Halfway to the throne',m:'At the fiftieth floor you find a lectern of black iron, and on it a ledger like yours, open to a page of crossed-out names. Every name but one has a line through it. The last is the name of the Tower itself.'},
  {act:3,id:'t75',t:'The hollow choir',m:'The seraphs here were never holy. They were the Ledger\'s first keepers, burned for the names they would not give up. They sing your name as you climb, not in warning, but in welcome.'},
  {act:3,id:'t100',t:'The King of Hell',m:'Abaddon kept the other half of the book. When he falls, his pages fly to yours and stitch themselves in. The Ledger is whole for the first time in a thousand years, and every soul in it, above and below, now answers to you.'},
  {act:4,id:'ngp',t:'The book begins again',m:'You closed the Ledger and opened it again, and the first page was blank. Your titles remain, written in a margin no one else can read. The dead remember you. They will be harder to convince this time.'},
  // ---- Act I: the name
  {act:1,id:'raise1',t:'The first to answer',when:()=>T_('raised')>=1,m:'The first one stood up slowly, as if embarrassed to be seen. It did not ask who you were. It looked at the Ledger in your hand and waited, the way a dog waits for a word. Somewhere in the book, a line of ink you had not written dried.'},
  {act:1,id:'fall1',t:'The ground says no',when:()=>T_('deaths')>=1,m:'You fell, and for a moment the earth reached for you the way it reaches for everyone. Then it let go. You woke at the gate with the Ledger warm against your chest. It is not finished with you. You are not sure that is a kindness.'},
  {act:1,id:'lv5',t:'Ink under the nails',when:()=>S.player.lvl>=5,m:'Your fingers are stained black now, and the stain does not wash out. When you sleep, you hear pages turning. The townsfolk have started crossing the street when you pass, and the dogs have stopped barking at you altogether.'},
  {act:1,id:'evolve1',t:'They remember being people',when:()=>T_('evolved')>=1,m:'One of your dead grew into something more, and in the moment it changed it spoke a name. Not yours. Its own, from before. The Ledger wrote it down at once, as if afraid it would be forgotten again.'},
  // ---- Act II: the valley
  {act:2,id:'town',t:'A town that looks away',when:()=>townOpen()&&anyClear(),m:'The town lets you build at its edge, because it needs what you bring back and fears what follows you. The mayor will not shake your hand. He takes your gold with gloves on, and burns the gloves after, and thanks you every time.'},
  {act:2,id:'curse1',t:'The gate that hates you',when:()=>T_('cursed')>=1,m:'A cursed gate is not cursed at random. The Ledger has enemies among the dead it has not yet named, and they gather where you hunt, and they twist the stone against you. You won anyway. They will remember that too.'},
  {act:2,id:'oath_hon',t:'The Old Gods answer',when:()=>faithOf()==='hon',m:'You knelt at the cracked altar and the Old Gods, who had not been asked for anything in a long time, answered. They do not approve of the Ledger. But they would rather it were held by someone who still kneels.'},
  {act:2,id:'oath_dis',t:'A debt called in',when:()=>faithOf()==='dis',m:'You spat on the altar and nothing struck you down. That was the answer. The Old Gods are old, and tired, and they have watched the Ledger outlive every one of them. You take what is owed. They let you.'},
  {act:2,id:'army5',t:'A household of the dead',when:()=>S.army.length>=5,m:'Five of them now, following you through the market at dawn. They carry your bags. They stand in the rain without complaint. One of them hums a song from a village that burned a century ago, and the others, slowly, have learned the words.'},
  {act:2,id:'tower0',t:'The Tower notices',when:()=>towerOpen(),m:'Far to the east a tower of red stone has stood for as long as the valley has had a name. Tonight a light came on in its lowest window. The Ledger turned, unbidden, to a page headed with a single word: Climb.'},
  {act:2,id:'hard1',t:'Asking for more',when:()=>T_('heat1')>0,m:'You went back into a gate you had already emptied and asked it for something harder. The dead there were insulted, and rose stronger to prove it. The Ledger likes this about you. It writes faster when you are greedy.'},
  {act:2,id:'elder1',t:'An elder among the dead',when:()=>T_('elder')>=1,m:'One of yours has grown old in death, wiser than the living who buried it. It watches you write in the Ledger with an expression you cannot read. Once, when you hesitated over a name, it reached over and pointed.'},
  // ---- Act III: the climb
  {act:3,id:'t10',t:'The first warden',m:'The Gate Hound was not guarding the Tower from you. It was guarding the valley from the Tower. When it fell, it looked almost relieved, and the stair above it lit itself, step by step, all the way up into the dark.'},
  {act:3,id:'t40',t:'Flies and chains',m:'By the fortieth floor the Tower stops pretending to be a building. The walls breathe. The dukes of this place keep courts of their own, and each of them once held a page torn from the Ledger, and none of them gave it up willingly.'},
  {act:3,id:'t60',t:'The executioner\'s block',m:'The Pale Executioner kept a tally of everyone he had ended. You found it carved into the block: a long column of marks, and at the very bottom, freshly cut, a mark for you. You chiselled it out before you climbed on.'},
  {act:3,id:'t90',t:'The broken halo',m:'The Seraph fell without a sound, and its halo cracked in two. One half held the light of something holy. The other held a name written in the Ledger\'s hand. You could not tell which half was heavier.'},
  {act:3,id:'ult1',t:'Five souls in the hand',when:()=>S.player.lvl>=ULT_LV,m:'You learned to hold souls the way a miser holds coins, and to spend them all at once. The first time you did, the sky over the gate went dark for a heartbeat, and every bird in the valley fell silent until dawn.'},
  {act:3,id:'bless_hon',t:'Grace',when:()=>blessed('hon'),m:'Twenty-five dawns kept faithfully, and the Old Gods have put a hand on your shoulder. They will not let you fall in the gates. They say nothing about the Tower. Even gods have places they will not go.'},
  {act:3,id:'bless_dis',t:'The tithe',when:()=>blessed('dis'),m:'Twenty-five dawns of taking, and now the dead pay you before you ask. You enter every gate with souls already in your hand, warm and pleading. The Old Gods have stopped watching you. You find you prefer it.'},
  {act:3,id:'secret1',t:'Something older',when:()=>SECRET.some((B,i)=>T_('secret_'+i)>0),m:'There are names the Ledger never wanted you to find: masters older than the gates they hide beneath. You found one anyway, and wrote it down in red. The book was quiet for a full day afterwards, as if offended.'},
  {act:3,id:'nm1',t:'Nightmare',when:()=>DUNGEONS.some((D,i)=>T_('nm'+i)>0),m:'You walked through a gate on its worst night and walked back out. The dead who saw it have started telling the story to each other, in the dark between rooms. In their version, you are much taller.'},
  {act:3,id:'lv50',t:'Half a book of names',when:()=>S.player.lvl>=50,m:'You have written more names than the valley has living people. Some nights you take the Ledger out just to read them, the way other people read letters from home. You have started to forget which of them you knew in life.'},
  {act:3,id:'secret6',t:'All the old masters',when:()=>SECRET.every((B,i)=>T_('secret_'+i)>0),m:'Six masters older than the gates, and every one of them in red ink now. The Ledger has stopped arguing. On the page after the last of them, someone long ago wrote a single line: The one who finds us all is ready for the end of the book.'},
  // ---- Act IV: the abyss and the end of the book
  {act:4,id:'t110',t:'Below the bottom',when:()=>S.tower.best>=110,m:'Abaddon was not the bottom. Past his throne the Tower keeps going, down and up at once, into a place with no floors and no names. The Ledger\'s pages are blank here. It is waiting to see what you will write.'},
  {act:4,id:'t150',t:'The Abyss looks back',when:()=>S.tower.best>=150,m:'One hundred and fifty floors. The wardens here have no stories, no faces, no names at all; they are what is left when the Ledger has taken everything else. You wonder, briefly, whether that is what you are climbing toward.'},
  {act:4,id:'t200',t:'Where the ink runs out',when:()=>S.tower.best>=200,m:'At the two hundredth floor the ink in the Ledger thins to grey. The book is not running out of pages. It is running out of reasons. For the first time since the drowned chapel, it asks you a question: Why do you keep climbing?'},
  {act:4,id:'ngp2',t:'Twice told',when:()=>(S.ngp||0)>=2,m:'The second time through, the dead knew your face before you raised them. The Rat King called you by name. The Warden saluted. The book is beginning again, but it is not beginning from nothing anymore, and neither are you.'},
  {act:4,id:'ngp3',t:'The keeper who stays',when:()=>(S.ngp||0)>=3,m:'Three times you have closed the Ledger, and three times opened it. The Pale Sovereign wrote his own name to escape it. You have not. Perhaps that is the difference between a prisoner and a keeper. Perhaps there is none.'},
  {act:4,id:'pages',t:'The last page',when:()=>(S.pages||0)>=LORE_PAGES.length,m:'Every torn page has found its way home, and the Ledger is whole in a way it never was. On the final page is the scribe\'s last instruction: whoever holds the book may close it forever by writing their own name. Your pen hovers over the page. Not yet.'},
  {act:5,id:'cmd1',t:'One who leads',when:()=>T_('commanders')>=1||(S.army||[]).some(m=>hasTrait(m,'commander')),m:'This one rose differently. It looked over your other dead the way a sergeant looks over a muddy field, and they straightened under its gaze. You did not teach it that. Something it was in life remembered how to give orders, and the grave did not take it away.'},
  {act:5,id:'raid1',t:'An empty house',when:()=>T_('raidsSent')>=1,m:'You sent them out without you, and for the first time in a long while the house was quiet. No scraping at the door, no humming from the cellar. You sat with the Ledger open and realised you were listening for their footsteps, the way the living listen for children coming home late.'},
  {act:5,id:'raid10',t:'The war you do not see',when:()=>T_('raidWins')>=10,m:'Your squads come back with gold you did not earn and stories they cannot tell. The gates you cleared are being cleared again in your name, while you sleep. Somewhere a village has started telling tales of a dead captain who marches past at midnight and harms no one who keeps their door shut.'},
  {act:5,id:'siege0',t:'Torches on the hill road',when:()=>T_('siegeWarned')>=1,m:'A pedlar who still trades with you at the back gate would not meet your eyes tonight. The town has been counting its dead and finding the count short. They have written to the Inquisition, and the Inquisition has written back. The Ledger does not mind. It has always liked visitors.'},
  {act:5,id:'siege1',t:'The walls held',when:()=>T_('siegeWins')>=1,m:'They came with torches, prayers and good iron, and by dawn the prayers were the only thing still standing. You walked the walls afterwards and found the captain\'s name stitched inside his collar. The Ledger took it gladly. Somewhere down in the town a bell rang for a long time, and then stopped.'},
  {act:5,id:'siegeL',t:'Smoke at dawn',when:()=>T_('siegeLosses')>=1,m:'They broke through and burned what they could reach, then ran before the sun found them among the graves. Not one of your dead was taken. You stood in the ash and understood that the living do not want you gone. They want you smaller. The Ledger, for once, was silent.'},
  {act:5,id:'rift1',t:'The torn sky',when:()=>riftBest()>=1,m:'Beneath the Throne of Ash the stone did not end. It tore. Through the tear you saw every gate at once, folded over itself, and the dead in it were not the dead you knew. They wore the shapes of the valley, but something older looked out through them. The Ledger grew warm in your hands and would not cool.'},
  {act:5,id:'rift10',t:'No bottom',when:()=>riftBest()>=10,m:'Ten times down, and the Rift only deepens. The pages you write there come back changed: names you did not set down, in a hand that is almost yours. The Pale Sovereign wrote himself out of this book. You begin to wonder if the Rift is where the ink went when he did.'},
  {act:5,id:'eternal1',t:'What does not end',when:()=>T_('eternal')>=1,m:'One of yours has grown past death and past age into something the Ledger has no word for. It does not tire. It does not forget. It stands at the edge of the Rift some nights and looks down, and when you ask it what it sees, it only turns the page of the book for you, gently, as if you were the one who needed keeping.'},
  {act:5,id:'rival0',t:'Another hand in the margins',when:()=>!!(S.rival&&S.rival.name&&S.rival.met),m:'Another hand has been writing in the margins. The Ledger noticed before you did. Names you raised were crossed out and written again in a different ink. There is a second keeper in the valley, and they have opened a book of their own. They do not want yours. They want to be the one the dead remember.'},
  {act:5,id:'rival1',t:'Red ink for a rival',when:()=>T_('rivalWins')>=1,m:'They went down on one knee in the dust of a boss room that was never theirs, and when they rose they were laughing. The Ledger wrote the win in red and underlined it twice. It has never done that for a gate. It knows the difference between a master that was waiting and a keeper who came looking.'},
  {act:5,id:'rivalL',t:'A page goes missing',when:()=>T_('rivalLosses')>=1,m:'You woke at the gate with the Ledger open in your lap and the binding loose. Something had been taken, neatly, the way a scholar borrows from a library he means to return to. The book was not angry. It was interested. It has had thieves before. It has never had one who wanted to be read.'}
];
const STORY_BY=Object.fromEntries(STORY.map(s=>[s.id,s]));
const ACTS=['','Act I · The name','Act II · The valley','Act III · The climb','Act IV · The end of the book','Act V · The torn sky'];
// Milestone passages (those with a when) are checked after every action; inside a run they go to the room's events.
function loreCheck(){
  if(!S||!S.player) return; S.story=S.story||{};
  const due=STORY.filter(st=>{ if(!st.when||S.story[st.id]) return false; try{ return !!st.when(); }catch(e){ return false; } });
  if(due.length>2){ due.forEach(st=>{ S.story[st.id]=S.day; }); notify('The Ledger remembers '+due.length+' passages of your story. Read them on the Lore page (Ledger tab).','story'); return; }   /* catch-up, e.g. an old save */
  for(const st of due) unlockStory(st.id,S.mode==='raise'&&S.run?S.run:null);
}
// ===== TORN PAGES =====
// Twenty pages torn from the Ledger tell its history, always in order. Bosses, wardens, elites and coffers may hold the next
// one, but each page waits until you reach its level, so the story keeps pace with you. Kept through New Game+.
const LORE_PAGES=[
  {t:'The scribe of Vane Abbey',m:'Before the valley had a name, an abbey stood in the drowned chapel\'s place, and in it a scribe named Oswin Vane kept the record of the dead: who died, and when, and how. He believed no soul should be forgotten. It was a kind thought. It was the first mistake.'},
  {t:'The plague year',m:'In the plague year the dead came faster than Oswin could write. He worked by candle until his eyes failed, and still the names piled up unrecorded, and in the night he heard them weeping to be written. He prayed for a book that could keep up.'},
  {t:'The binding',m:'Something answered his prayer. Not the Old Gods; they were already old, and did not care for scribes. Oswin bound the new book in skin he did not ask the source of, and the ink in it was warm, and the pages filled themselves.'},
  {t:'A book that wants',m:'At first the Ledger only recorded. Then it began to want. A name written in it did not rest; it waited to be called. Oswin learned this the night his dead brother knocked on the abbey door, polite and grey, asking what he should do next.'},
  {t:'The first army',m:'The abbot ordered the book burned. It would not burn. Oswin, frightened, called the names in it to protect him, and the dead of the plague year rose and stood around the abbey in a silent ring, and the abbot\'s order was never given again.'},
  {t:'The drowning',m:'The abbey drowned when the river changed its course. Some say the river was pushed. Oswin went down with the chapel, the Ledger chained to his wrist, and for two hundred years the book lay in the dark water, writing the names of the fish.'},
  {t:'The tanner',m:'A tanner fished the book from the river and read one line aloud. By morning his vats were full of the dead and he was their king. He held his court beneath the city for forty years. The Ledger called him its second keeper, and forgot him the moment he fell.'},
  {t:'Keepers and wardens',m:'After the tanner the book passed from hand to hand, and every keeper left something behind: a warden at a door, a knight at a fire, a bishop and his choir. The gates of the valley are not dungeons. They are the graves of the Ledger\'s keepers.'},
  {t:'The orchard',m:'One keeper tried to stop it. She planted iron trees around the valley\'s graves to fence them from the book, and tended them until she was part of the orchard herself. It did not work. Iron does not stop ink. But the trees still stand.'},
  {t:'The Sovereign',m:'The greatest keeper called himself the Sovereign. He named every soul in the valley and ruled them all from a throne of ash. When there was no one left to name, he grew afraid the book would turn on him, and he did the only thing it could not undo.'},
  {t:'His own name',m:'The Sovereign wrote his own name in the Ledger, and the book closed on him like a door. He became its prisoner and its servant, a page among pages. That is why the last page waits blank: the book is always looking for its next keeper\'s name.'},
  {t:'The other half',m:'The Ledger was never whole. Long before Oswin\'s time, someone below had torn it in two and carried half away, down into a tower that grows a floor for every name it steals. The half you hold has been looking for the other half for a very long time.'},
  {t:'The Tower\'s bargain',m:'The King of Hell kept his half of the book in the Tower\'s heart and fed it the souls that climbed to him. Every warden on every tenth floor is a keeper who climbed for the other half and failed. Their relics are what the Tower let them keep.'},
  {t:'Why the dead obey',m:'The dead do not obey the Ledger because it is strong. They obey because it remembers them, and nothing else does. A name in the book is a name that cannot be lost. Most of them would rather serve than be forgotten. You find you understand.'},
  {t:'The price of keeping',m:'Each keeper paid in the same coin: a little more of themselves for every name. The tanner forgot his trade. The Warden forgot his family. The Sovereign forgot everything but the book. You check your own memories at night, and count them, and they are fewer.'},
  {t:'The masters below',m:'Under the keepers\' graves lie older things, masters who held the book before it was a book, when it was only a hunger in the dark. Oswin did not create the Ledger. He gave a shape to something that was already there, waiting to be written down.'},
  {t:'Oswin\'s regret',m:'In the margin of an early page, in a shaking hand, Oswin wrote: I wanted no one forgotten. I did not understand that some things are meant to be forgotten, and that remembering them forever is its own kind of grave.'},
  {t:'The whole book',m:'When the two halves meet, the Ledger will hold every name above and below. Whoever keeps it then will not rule the dead. They will be the dead\'s memory, the only thing between every soul and nothing. It is not a crown. It is a weight.'},
  {t:'How it ends',m:'There are only two endings, the scribe wrote. The keeper writes their own name and the book closes, as the Sovereign did, and the dead sleep at last. Or the keeper keeps writing, forever, and the dead never have to be alone.'},
  {t:'The blank page',m:'The last torn page holds no words at all, only the faint shape of a pen pressed hard and lifted again. Someone stood where you stand and could not decide. The page is yours now. The Ledger does not hurry you. It has all the time in the world.'}
];
const PAGE_LV=i=>2+i*3;   // page i waits until this level, so the story keeps pace (the last page at level 59)
const PAGE_CHANCE={boss:.35,warden:.5,elite:.04,coffer:.2,secret:1};
const nextPage=()=>{ const n=S.pages||0; return n<LORE_PAGES.length&&S.player.lvl>=PAGE_LV(n)?n:-1; };
function findPage(src,r){
  const n=nextPage(); if(n<0||!(Math.random()<(PAGE_CHANCE[src]||0))) return false;
  S.pages=n+1; tally('pages'); const P0=LORE_PAGES[n], m='You find a torn page of the Ledger ('+(n+1)+'/'+LORE_PAGES.length+'): "'+P0.t+'". Read it on the Lore page (Ledger tab).';
  if(r&&r.events) r.events.push({m,c:'story'}); else notify(m,'story'); moment('Torn page '+(n+1)+'/'+LORE_PAGES.length,'gold'); return true;
}
function unlockStory(id,r){
  const st=STORY_BY[id]; if(!st) return false; S.story=S.story||{}; if(S.story[id]) return false;
  S.story[id]=S.day; const m='From the Ledger, "'+st.t+'": '+st.m;
  if(r) r.events.push({m,c:'story'}); else notify(m,'story'); return true;
}
const BOSS_LINES={
  'Inquisitor Captain':  ['By order of the Inquisition this house is to be burned, with every name in it.','Write me down, then. Others will come to read it.'],
  'The Rat King':        ['Another tenant for my court? Kneel, and the rats will not eat you first.','Tell them... the vats can go cold now.'],
  'The Crypt Warden':    ['No one passes. No one has passed in two hundred years.','Relieved... at last. Guard them well.'],
  'The Ember Knight':    ['Keep back from the fire! You do not know what sleeps beneath it.','The flame goes out... may you never hear what wakes.'],
  'The Bishop of Teeth': ['Sing with us, little scribe. Your voice will keep forever.','The hymn... ends on a note I never learned.'],
  'The Orchard Mother':  ['My children grow so quietly. You will make a fine tree.','Water them... someone must water them...'],
  'The Pale Sovereign':  ['So the book chose you. It chose me too, once. It lies.','Write your own name last, scribe. Leave room for it.'],
  'The Gate Hound':      ['(The Hound lowers three heads and breathes sulphur.)','(It whimpers, and the gate behind it falls open.)'],
  'Cinder Matron':       ['Little moth. Come closer to the light.','Burn bright... it is over so quickly...'],
  'The Iron Inquisitor': ['Confess your names. All of them.','Absolved. We are all absolved.'],
  'Lord of Flies':       ['Everything that dies comes to me in the end. Why hurry?','Buzzing... so quiet now...'],
  'The Bone Cantor':     ['One more voice for the choir. One more.','The silence... is louder than I feared.'],
  'Duke of Chains':      ['Every soul here wears my iron. You will too.','The links break... I had forgotten the weight.'],
  'The Pale Executioner':['Kneel. It is easier for both of us.','Finally... a clean stroke.'],
  'Archdevil Vael':      ['You climb well, for a thief. That book belongs to Hell.','Take it, then... and all that comes with it.'],
  'The Hollow Seraph':   ['We burned for that book. Will you?','Keep it... better than we did...'],
  'Abaddon, King of Hell':['At last. Bring me the other half, little scribe.','The book... is whole... and it is yours. Pity you.']
};
SECRET.forEach(B=>{ BOSS_LINES[B.name]=B.lines; });
function bossSpeaks(e,when){ const L=BOSS_LINES[e.base]; if(!L) return; log(e.name+': "'+L[when==='hi'?0:1]+'"','boss'); }

// ===== BONDS =====
// Two minions alive together at the end of BOND_ROOMS won rooms in the army become Bonded (one partner each; benched or raiding
// minions do not count, so the Reserve pauses it). A bonded minion hits BOND_ATK harder. When one is lost for good the other is
// Vengeful (+BOND_VENGE attack until dawn) if it stood in the army in that same fight, or else Grieving (BOND_GRIEF attack through
// a full day). A release or a fusion breaks the bond. S.bondT counts rooms per pair ("lowUid-highUid"); m.bond={u,n}; m.mood={k,u,n}.
const BOND_ROOMS=25, BOND_ATK=.05, BOND_VENGE=.15, BOND_GRIEF=-.10;
const allMins=()=>S.army.concat(S.reserve||[],S.waiting||[],...(S.raids||[]).map(x=>x.units||[]));
const bondKey=(a,b)=>Math.min(a,b)+'-'+Math.max(a,b);
const moodOn=m=>!!(m&&m.mood&&m.mood.u>=S.day);
const bondMul=m=>(m&&m.bond?1+BOND_ATK:1)*(moodOn(m)?1+(m.mood.k==='v'?BOND_VENGE:BOND_GRIEF):1);   // syncMinion
const bondMate=m=>m&&m.bond?allMins().find(x=>x.uid===m.bond.u&&x!==m)||null:null;
const bondName=m=>{ const p=bondMate(m); return p?p.nick:m.bond?m.bond.n:''; };
function bondsClean(){   // a bond whose partner is gone (released, fused away) or does not point back is broken
  const all=allMins(); for(const m of all){ if(!m.bond) continue; const p=all.find(x=>x.uid===m.bond.u&&x!==m); if(!p||!p.bond||p.bond.u!==m.uid){ delete m.bond; syncMinion(m); } }
}
function bondsRoom(){   // roomWon: everyone standing in the army shares the room
  const T=S.bondT=S.bondT&&typeof S.bondT==='object'?S.bondT:{}, live=S.army.filter(m=>!m.thrall&&m.hp>0&&!m.bond), r=S.run;
  for(let i=0;i<live.length;i++) for(let j=i+1;j<live.length;j++){ const k=bondKey(live[i].uid,live[j].uid); T[k]=(T[k]||0)+1; }
  const free=new Map(allMins().filter(m=>!m.thrall&&!m.bond).map(m=>[m.uid,m]));
  for(const k of Object.keys(T)){ const [a,b]=k.split('-').map(Number); if(!free.has(a)||!free.has(b)) delete T[k]; }   // only pairs that can still bond are counted
  for(const k of Object.keys(T).filter(k=>T[k]>=BOND_ROOMS).sort((x,y)=>T[y]-T[x])){ const [a,b]=k.split('-').map(Number), A=free.get(a), B=free.get(b); if(A.bond||B.bond) continue;
    A.bond={u:B.uid,n:B.nick}; B.bond={u:A.uid,n:A.nick}; syncMinion(A); syncMinion(B); tally('bonds');
    const m=A.nick+' and '+B.nick+' have fought '+BOND_ROOMS+' rooms side by side. They are Bonded.'; if(r&&r.events) r.events.push({m,c:'ok'}); else notify(m,'ok'); }
  for(const k of Object.keys(T)){ const [a,b]=k.split('-').map(Number); if(free.get(a).bond||free.get(b).bond) delete T[k]; }
}
function setMood(p,k,n,u){ p.mood={k,u,n}; delete p.bond; syncMinion(p); p.hp=Math.min(p.hp,p.maxHp); }
function bondFall(m,at){   // memorialize: a bonded minion is lost for good; returns the partner's name for the Memorial
  if(!m) return null; if(!m.bond) return m.mood&&moodOn(m)?m.mood.n:null;   /* both lost in one fight: the second still names the first */
  const n=bondName(m), p=bondMate(m), raid=!!at&&at.raid!=null;
  if(p){ const v=!raid&&S.army.includes(p); setMood(p,v?'v':'g',m.nick,v||raid?S.day:S.day+1);   /* raid news comes at dawn: grief through the day that begins */
    notify(v?p.nick+' saw '+m.nick+' fall and is Vengeful until dawn.':p.nick+' grieves for '+m.nick+'.',v?'ok':'bad'); }
  else { S.bondPend=S.bondPend||{}; S.bondPend[m.bond.u]={n:m.nick}; }   // the partner marched on a raid that is coming home now: it learns at dawn
  return n||null;
}
function bondsDawn(){   // closeDay, after the raids are home: news of the fallen, moods end, broken bonds part
  const P=S.bondPend||{}; S.bondPend={};
  for(const m of allMins()){ const q=P[m.uid]; if(q){ setMood(m,'g',q.n,S.day); notify(m.nick+' grieves for '+q.n+'.','bad'); }
    else if(m.mood&&!moodOn(m)){ delete m.mood; syncMinion(m); } }
  bondsClean();
}
function bondsFix(g){   // normalizeSave
  const ok=v=>typeof v==='number'&&isFinite(v), all=g.army.concat(g.reserve||[],g.waiting||[],...(g.raids||[]).map(x=>x.units||[]));
  for(const m of all){
    if(m.bond&&!(typeof m.bond==='object'&&ok(m.bond.u)&&all.some(x=>x!==m&&x.uid===m.bond.u&&x.bond&&x.bond.u===m.uid))) delete m.bond;
    if(m.mood&&!(typeof m.mood==='object'&&(m.mood.k==='v'||m.mood.k==='g')&&ok(m.mood.u))) delete m.mood; }
  for(const m of all){ if(m.bond) m.bond={u:m.bond.u,n:cleanNick(String(m.bond.n||''))||'Nameless'}; if(m.mood) m.mood={k:m.mood.k,u:Math.floor(m.mood.u),n:cleanNick(String(m.mood.n||''))||'Nameless'}; }
  if('bondT' in g){ const T=g.bondT&&typeof g.bondT==='object'&&!Array.isArray(g.bondT)?g.bondT:{}; g.bondT={};   /* absent stays absent: a save round trip changes nothing */
  for(const k of Object.keys(T)) if(/^\d+-\d+$/.test(k)&&ok(T[k])&&T[k]>0) g.bondT[k]=Math.min(BOND_ROOMS,Math.floor(T[k])); }
  if('bondPend' in g){ const Q=g.bondPend&&typeof g.bondPend==='object'&&!Array.isArray(g.bondPend)?g.bondPend:{}; g.bondPend={};
  for(const k of Object.keys(Q)) if(/^\d+$/.test(k)&&Q[k]&&typeof Q[k].n==='string') g.bondPend[k]={n:cleanNick(Q[k].n)||'Nameless'}; }
}
const bondPairs=()=>{ const seen=new Set(), out=[]; for(const m of allMins()) if(m.bond&&!seen.has(m.uid)){ const p=bondMate(m); if(p){ seen.add(p.uid); out.push([m,p]); } seen.add(m.uid); } return out; };
const bondNear=()=>{ const T=S.bondT||{}, all=allMins(); return Object.keys(T).map(k=>{ const [a,b]=k.split('-').map(Number); return {a:all.find(m=>m.uid===a),b:all.find(m=>m.uid===b),n:T[k]}; }).filter(x=>x.a&&x.b).sort((x,y)=>y.n-x.n); };

// ===== EVENT CHAINS =====
// Three first meetings (a wounded priest, a reliquary, a deserter) are written into S.chains when you choose; CHAIN_DAYS later a
// follow-up waits in a gate event (CHAIN_BACK of events once due) and ends the chain. Walking past a first meeting starts nothing;
// walking past a follow-up leaves it waiting.
// S.chains[id]={s:state,d:day due} while waiting, {s:'end'} when over.
const CHAIN_DAYS=2, CHAIN_BACK=.6;
const chainGold=k=>{ const r=S.run, P=S.player; return Math.max(1,Math.round((10+P.lvl*4)*(1+(r&&RK[r.di]?r.di:0))*ngpReward()*k)); };
const chainHp=f=>{ const P=S.player, d=Math.max(0,Math.min(P.hp-1,Math.round(pMax()*f))); P.hp-=d; return d; };
const chainGear=()=>{ const r=S.run, it=addItem(pickRow(tableFor(r.di,'vanguard',false,true))); if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } return it; };
const chainCoin=g=>{ S.gold+=g; S.run.goldTot=(S.run.goldTot||0)+g; sfx('coin'); };
const chainXp=()=>{ const r=S.run, e=makeEnemy(r.di,RK[r.di].lv+Math.floor(r.room/2),false), xp=Math.round(killXp(e)*2); r.gained+=xp; r.ups+=addXp(xp); return xp; };
const chainLoot=(g,it)=>g+' gold. '+(it?'Gear: '+ITEM[it.id].name+'.':'There was gear too, but your bag is full.');
const CHAIN_EV={
  priest:{chain:'priest',start:1,name:'A wounded priest',text:'A priest of the living lies in the rubble, bleeding from a bite. He sees what you are and does not beg.',
    get opts(){ return [['spare','Bind his wounds (lose 10% HP)'],['finish','Finish him (bonus XP)'],['pass','Walk past']]; }},
  priest_back:{chain:'priest',name:'The priest returns',text:'The priest you spared waits by the next door, his arm in a sling. "I pay my debts, even to your kind."',
    get opts(){ return [['bless','Take his blessing (full HP, hit 15% harder this gate)'],['warn','Take his warning (gold and gear he hid)'],['pass','Not now']]; }},
  priest_kin:{chain:'priest',name:'The grey brothers',text:'Three priests in grey bar the way. They know whose blood is on your hands.',
    get opts(){ return [['fight','Cut through them (lose 20% HP, bonus XP)'],['pay','Pay blood money ('+chainGold(1)+' gold)'],['pass','Not now']]; }, off:k=>k==='pay'&&S.gold<chainGold(1)},
  reliquary:{chain:'reliquary',start:1,name:'A sealed reliquary',text:'A saint\'s bones lie in a silver box under old prayers. The silver alone is worth a fortune.',
    get opts(){ return [['loot','Loot it (gold and gear)'],['offer','Leave an offering ('+chainGold(.5)+' gold)'],['pass','Leave it be']]; }, off:k=>k==='offer'&&S.gold<chainGold(.5)},
  relic_curse:{chain:'reliquary',name:'The saint\'s curse',text:'The air sours. Every shadow wears a saint\'s face, and the silver you took burns cold in your purse.',
    get opts(){ return [['endure','Endure it (lose 25% HP)'],['return','Give the silver back ('+chainGold(1.5)+' gold)'],['pass','Not now']]; }, off:k=>k==='return'&&S.gold<chainGold(1.5)},
  relic_gift:{chain:'reliquary',name:'The saint\'s gift',text:'A pale light waits in the corridor and takes the shape of an old man. He presses something into your hand.',
    get opts(){ return [['take','Take the gift (a Soul, full mana and gear)'],['pass','Not now']]; }},
  deserter:{chain:'deserter',start:1,name:'A deserter',text:'A soldier of the living hides among the dead, his badge torn off. He swears he can guide you, for a price.',
    get opts(){ return [['pay','Pay him well ('+chainGold(.8)+' gold)'],['bread','Share your bread (free)'],['pass','Send him off']]; }, off:k=>k==='pay'&&S.gold<chainGold(.8)},
  deserter_true:{chain:'deserter',name:'The deserter keeps his word',text:'The deserter waves you into a side tunnel, to a cache the living hid from their own.',
    get opts(){ return [['take','Take the cache (gold and gear)'],['pass','Not now']]; }},
  deserter_false:{chain:'deserter',name:'The deserter\'s price',text:'The deserter steps out of the dark with living soldiers at his back. "Nothing personal, necromancer."',
    get opts(){ return [['fight','Fight your way out (lose 25% HP, bonus XP)'],['pay','Buy him off ('+chainGold(1.2)+' gold)'],['pass','Not now']]; }, off:k=>k==='pay'&&S.gold<chainGold(1.2)}
};
Object.assign(EVENTS,CHAIN_EV);
const CHAIN_IDS=['priest','reliquary','deserter'];
const CHAIN_NEXT={spared:'priest_back',slain:'priest_kin',looted:'relic_curse',offered:'relic_gift',paid:'deserter_true',fedTrue:'deserter_true',fedFalse:'deserter_false'};
const chainSt=id=>S.chains&&S.chains[id]||null;
const chainOk=k=>{ const E=EVENTS[k]; return !E.chain||(!!E.start&&!chainSt(E.chain)); };   // rollEvent: first meetings only until chosen
function chainDue(){ const due=CHAIN_IDS.filter(id=>{ const c=chainSt(id); return c&&CHAIN_NEXT[c.s]&&S.day>=c.d; }); if(!due.length||Math.random()>=CHAIN_BACK) return null; return CHAIN_NEXT[chainSt(pick(due)).s]; }
function chainResolve(ev,ch){   // resolveEvent for chain events: {m,c}, or null for a choice that cannot be taken
  const E=EVENTS[ev.id], r=S.run, P=S.player, C=S.chains=S.chains||{}, go=s=>{ C[E.chain]={s,d:S.day+CHAIN_DAYS}; }, end=()=>{ C[E.chain]={s:'end'}; tally('chains'); };
  if(E.opts.every(o=>o[0]!==ch)||(E.off&&E.off(ch))) return null;
  if(ch==='pass') return E.start?{m:'You leave it be.',c:''}:{m:'You turn away. It will find you again.',c:''};   // a follow-up waits for another day
  const id=ev.id;
  if(id==='priest'&&ch==='spare'){ const d=chainHp(.1); go('spared'); return {m:'You bind the priest\'s wounds for '+d+' HP of your own. He limps into the dark without a word.',c:''}; }
  if(id==='priest'&&ch==='finish'){ const xp=chainXp(); go('slain'); return {m:'You finish the priest. +'+xp+' XP. Someone will miss him.',c:'ok'}; }
  if(id==='priest_back'&&ch==='bless'){ P.hp=pMax(); r.bless=true; end(); return {m:'The priest blesses you in the name of a god you do not know. You are whole, and you and your army hit 15% harder for the rest of this gate.',c:'ok'}; }
  if(id==='priest_back'&&ch==='warn'){ const g=chainGold(1.5), it=chainGear(); chainCoin(g); end(); return {m:'He shows you where his order hid its tithe: '+chainLoot(g,it),c:'ok'}; }
  if(id==='priest_kin'&&ch==='fight'){ const d=chainHp(.2), xp=chainXp(); end(); return {m:'You cut through the grey brothers. It costs '+d+' HP; +'+xp+' XP.',c:'bad'}; }
  if(id==='priest_kin'&&ch==='pay'){ const g=chainGold(1); S.gold-=g; end(); return {m:'You pay '+g+' gold in blood money. The brothers let you pass.',c:''}; }
  if(id==='reliquary'&&ch==='loot'){ const g=chainGold(1), it=chainGear(); chainCoin(g); go('looted'); return {m:'You prise the silver off the saint: '+chainLoot(g,it),c:'ok'}; }
  if(id==='reliquary'&&ch==='offer'){ const g=chainGold(.5); S.gold-=g; go('offered'); return {m:'You leave '+g+' gold at the saint\'s feet and close the lid.',c:''}; }
  if(id==='relic_curse'&&ch==='endure'){ const d=chainHp(.25); end(); return {m:'The curse wrings '+d+' HP out of you, then lets go for good.',c:'bad'}; }
  if(id==='relic_curse'&&ch==='return'){ const g=chainGold(1.5); S.gold-=g; end(); return {m:'You leave '+g+' gold in the dust. The faces fade from the shadows.',c:''}; }
  if(id==='relic_gift'&&ch==='take'){ const got=gainSoul(), it=chainGear(); P.mana=pMana(); end(); return {m:'The saint\'s gift: full mana'+(got?'. A Soul ('+r.souls+'/'+SOUL_MAX+')':'')+(it?'. Gear: '+ITEM[it.id].name:'')+'.',c:'ok'}; }
  if(id==='deserter'&&ch==='pay'){ const g=chainGold(.8); S.gold-=g; go('paid'); return {m:'You pay the deserter '+g+' gold. He swears he will find you again.',c:''}; }
  if(id==='deserter'&&ch==='bread'){ go(Math.random()<.5?'fedTrue':'fedFalse'); return {m:'You share your bread. The deserter eats like a wolf and slips away.',c:''}; }
  if(id==='deserter_true'&&ch==='take'){ const g=chainGold(2), it=chainGear(); chainCoin(g); end(); return {m:'The deserter\'s cache: '+chainLoot(g,it),c:'ok'}; }
  if(id==='deserter_false'&&ch==='fight'){ const d=chainHp(.25), xp=chainXp(); end(); return {m:'You fight your way out. It costs '+d+' HP; +'+xp+' XP.',c:'bad'}; }
  if(id==='deserter_false'&&ch==='pay'){ const g=chainGold(1.2); S.gold-=g; end(); return {m:'You buy the deserter off for '+g+' gold. You will not see him again.',c:''}; }
  return null;
}
function chainsFix(g){   // normalizeSave
  if(!('chains' in g)) return; const C=g.chains&&typeof g.chains==='object'&&!Array.isArray(g.chains)?g.chains:{}; g.chains={};
  for(const id of Object.keys(C).filter(id=>CHAIN_IDS.includes(id))){ const c=C[id];   /* saved key order (order met), so a reload is JSON-identical */ if(!c||typeof c!=='object') continue;
    if(c.s==='end') g.chains[id]={s:'end'}; else if(CHAIN_NEXT[c.s]&&EVENTS[CHAIN_NEXT[c.s]].chain===id&&typeof c.d==='number'&&isFinite(c.d)) g.chains[id]={s:c.s,d:Math.floor(c.d)}; }
}

// ===== MAUSOLEUMS =====
// A late gold sink: in town, raise a mausoleum over a name in the Memorial. Each one (at most MAUS_MAX, kept through New Game+
// with the Memorial) gives every minion +MAUS_K max HP and attack for good. Costs climb: MAUS_COST[n] for the next one.
const MAUS_MAX=5, MAUS_K=.02, MAUS_COST=[5000,10000,20000,30000,40000];
const mausN=()=>S&&S.memorial?Math.min(MAUS_MAX,S.memorial.filter(e=>e.maus).length):0;
const mausCost=()=>MAUS_COST[mausN()]||0;
const canMaus=e=>!!e&&!e.maus&&S.mode==='town'&&mausN()<MAUS_MAX&&S.gold>=mausCost();
function raiseMaus(i){ const e=(S.memorial||[])[i]; if(!canMaus(e)) return false; S.gold-=mausCost(); e.maus=1; tally('maus'); syncArmy(); sfx('raise'); return true; }
const extraMul=(m,k)=>(k==='atk'?bondMul(m):1+headBonus())*(1+MAUS_K*mausN());   // syncMinion: bonds and moods (attack), headstones (HP), mausoleums (both)
