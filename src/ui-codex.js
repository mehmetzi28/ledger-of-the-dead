// ----- the Codex: every rule and list in the game, read straight from the game's own tables so it never goes stale.
// Enemies you have not met yet stay hidden, as in the bestiary.
const CODEX=[['basics','Basics'],['raising','Raising'],['faith','Faith'],['omens','Omens'],['roles','Roles'],['traits','Traits'],['minions','Minion stats'],['army','Army'],['reserve','Reserve'],['fusion','Fusion'],['affixes','Elite affixes'],['bosses','Bosses'],['status','Status effects'],['types','Damage types'],['kits','Foe kits'],['skills','Skills'],['orders','Orders'],
  ['gates','Gates'],['tower','Hell Tower'],['gear','Gear'],['forge','Heartforge'],['uniques','Unique powers'],['sets','Sets'],['supplies','Supplies'],['trade','Commissions and black market'],['rooms','Doors and events'],['curses','Curses'],['raids','Raids'],['rift','The Rift'],['town','Town'],['sieges','Sieges'],['bounties','Bounties'],['rival','The Rival'],['trials','Trials'],['titles','Titles'],['records','Records'],['endings','Endings']];
const CDX_ROLE={
  vanguard:'When a foe picks a target, each vanguard counts 5 and everyone else (you included) counts 2, so vanguards draw most blows. They take Taunt orders and stand in front of a Sundering Blow.',
  striker:'This goes for your strikers and the enemy\'s. An enemy striker\'s crit also makes its target bleed. Focus makes your strikers crit every hit for a turn.',
  mender:'As a minion: heals the ally with the lowest share of HP, if anyone is below 85%. As a foe: heals the most hurt foe below 70%, blunted by its armor. A room never holds more than one enemy mender.',
  reaper:'Only your reapers cleave; enemy reapers strike one target. Every gate boss and Tower warden is a reaper, so a raised boss cleaves for you. Execute doubles your reapers\' hits on foes below 40% HP.'
};
const CDX_DOT={
  poison:'From Venomous minions and the Grave Gas upgrade of Corpse Explosion. 15% of the poisoner\'s attack (Grave Gas: 15% of your Siphon) each turn for 3 turns. The '+CAPS.rot2.name+' capstone poisons too: '+Math.round(CAP_BLOOM*100)+'% of your Siphon, 3 turns.',
  bleed:'From an enemy striker\'s crit. 30% of its attack each turn for 2 turns. Your Strike with the '+SKILL_MODS.edge.b[0]+' upgrade bleeds its target too, for '+Math.round(BLOODLET*100)+'% of the hit.',
  burn:'From a Cinder Wave. 15% of the boss\'s attack each turn for 2 turns. '+TRAITS.cinderborn.name+' minions burn their target too, for '+Math.round(CINDER_K*100)+'% of their attack.',
  blight:'Rot. From Necrotic minions (10% of their attack, 2 turns), Plaguebearer elites (20% of their attack, 2 turns) and the Grave Gas upgrade of Corpse Explosion (10% of your Siphon, 3 turns). It deals that damage each turn, and its bearer receives half the healing (an enemy mender\'s too). Black Eclipse makes your blight 20% stronger.'
};
// What each record measures (keys follow REC_NUM, so a new record without a line here fails the Codex test).
const CDX_REC={
  hit:'The biggest single hit you or a minion has landed.', kills:'The most foes slain in one run.', gold:'The most gold found in one run.', floor:'The deepest Hell Tower floor you have cleared.',
  rift:'The deepest Rift depth you have cleared.', tw10:'The fewest turns for ten Tower floors in a row in one climb.', streak:'The most runs won in a row. A fall or a flight breaks it.',
  taken:'The most damage taken in one run that you walked out of alive.', mlv:'The highest level of any minion in your army or the Reserve.', ftr:'The most traits a minion has carried out of the Flesh Pit.', held:'The most gold you have held at once.'
};
const cxRow=(title,body,tag)=>'<div class="tt-row cx-row"><div><h4>'+title+(tag?' <span class="u-tag">'+tag+'</span>':'')+'</h4><div class="u-sub">'+body+'</div></div></div>';
const cxP=t=>'<p class="help-p">'+t+'</p>';
const cxList=a=>'<div class="items">'+a.join('')+'</div>';
const metName=n=>!!(S.kills&&S.kills[n]>0);
function codexSection(k){
  if(k==='capstones') return cxCapHTML(); if(k==='pacts') return cxPactHTML();   // src/ui-progression.js
  const pct=v=>Math.round(v*100)+'%';
  if(k==='basics') return cxP('A day has '+WATCHES+' watches. Entering a gate or the Tower uses one; when the last is spent the day ends. The daily quest asks you to defeat '+QUEST.kills+' foes, clear '+QUEST.rooms+' rooms (gate rooms or Tower floors) and clear '+QUEST.clears+' dungeon. Finish it for '+QUEST_PTS+' stat point'+(QUEST_PTS>1?'s':'')+' and '+pct(QUEST_XP)+' of a level in XP. Leave it unfinished and it simply lapses at dawn, at no cost.')
    +cxP('Each level gives 3 stat points and 1 skill point. Falling in a fight loses that room\'s spoils and '+pct(DIFF.deathXp)+' of a level in XP. Going on to the next room heals '+pct(DIFF.heal)+' of your HP, restores '+pct(DIFF.mana)+' of your mana and heals your minions '+pct(DIFF.mheal)+'.')
    +cxP('After a fall in a gate room, a Tower floor or the Rift, Retry on the defeat screen starts that room over as it began: the same foes at full strength, you and your army as you stood when you entered, and no watch spent. The XP loss stands, potions you drank stay drunk, and the defeat screen names the blow that felled you. Sieges, Trials and rooms the rival stood in cannot be retried.')
    +'<p class="group-h">Stats</p>'+cxList([cxRow('Strength','Strike damage: 3 + 2.2 per point + your level + gear. Also '+STR_CRIT+'% crit chance per point (up to '+STR_CRIT_CAP+'%), 1% of foe armor pierced by Strike per '+STR_PEN+' points (up to '+STR_PEN_CAP+'%), and '+STR_MINION+'% minion attack per point.'),
      cxRow('Constitution','Max HP: 24 + '+CON_HP+' per point + 4 per level + gear. Also '+CON_DR+'% less damage taken per point (up to '+CON_DR_CAP+'%), '+CON_HEAL+'% more healing received per point (up to '+CON_HEAL_CAP+'%) and '+CON_MINION+'% minion max HP per point.'),
      cxRow('Intelligence','Mana (6 per point), Soul Siphon (2.8 per point), Bone Ward (3 per point), '+INT_SKILL+'% skill damage per point (Bone Spear, Corpse Explosion, Grave Chill and Reap) and '+INT_MINION+'% minion attack per point.'),cxRow('Will','Mana (3 per point), one army slot per 2.5 points, '+RAISE_WILL+'% raise chance per point, 2% minion power per point, and '+SHATTER_WILL+'% less chance per point that a downed minion shatters (never below '+SHATTER_MIN+'%).'),
      cxRow('Command','Your army\'s power is the average attack and max HP of its '+CMD_TOP+' strongest minions; empty places count as nothing. Strike gains '+CMD_STR+'% of that attack per Strength point, Soul Siphon and the skills built on it '+CMD_INT+'% per Intelligence point, and max HP '+CMD_CON+'% of that HP per Constitution point. It is measured as each room begins and in town, so it holds through a fight.'+(cmd().a?' Now: +'+cmdAtk()+' Strike, +'+cmdSiph()+' Siphon, +'+cmdHp()+' max HP.':'')),
      cxRow('Limits','Strike crits 10% of the time before Strength, gear and skills. All your damage reduction together (Constitution, titles, sets, faith and Calcified Hide) stops at '+DR_CAP+'%.')])
    +'<p class="group-h">Everything gear can give</p>'+cxList(Object.keys(STATL).map(s=>cxRow(STATL[s][0],(ROLL_KEYS[s]?'Can appear as a bonus line.':'Only on base stats and uniques.')+(STATL[s][1]?' Measured in percent.':''))))
    +'<p class="group-h">New Game+</p>'+cxP('Clear the Throne of Ash and Settings offers New Game+: start again at level 1 with your titles, bestiary, story and one unique of your choice. Foes get '+Math.round(NGP_FOE*100)+'% more HP and attack and pay '+Math.round(NGP_REWARD*100)+'% more XP and gold, and each New Game+ stacks.')
    +'<p class="group-h">Bestiary</p>'+cxP('Defeat '+KNOW_AT+' of one kind of foe to study it: its drop table opens in the bestiary. Foes you have not met stay hidden, here and there.')
    +'<p class="group-h">Mastery</p>'+cxP('Keep killing one kind of foe and you master it. Elites count as their base kind. New Game+ keeps the bestiary, so mastery carries over.')+cxP('Bosses, Tower wardens and secret masters need far fewer kills. With the '+SKILL_MODS.scholar.b[0]+' upgrade of Forbidden Lore every second kill counts twice. The bestiary shows each kind\'s tier and how far it is to the next.')
      +cxList(MASTERY.map(t=>cxRow(t.name,t.at+' kills'+(t.bossAt!=null?' ('+t.bossAt+' for bosses, Tower wardens and secret masters)':'')+'. '+masteryGives(t)+'.')))
    +'<p class="group-h">What the Ledger tells you</p>'+cxP('The better you know a kind of foe, the more its card tells you in battle; its intent\'s tooltip carries the detail. Each tier keeps what the ones before it show.')
      +cxList([cxRow('Unknown','What it will do next, and to whom.'),cxRow('Studied','About how hard its blow lands, after your damage reduction and ward, and whether it can crit.'),cxRow('Known','Its move after that, marked then likely, and its elite affixes explained.'),cxRow('Mastered','The damage of a boss\'s signature move, and on whom it falls.'),cxRow('Ledgered','The answers you still hold for boss moves and heavy blows on you.')])
      +cxP("The doors between rooms read the same way. When most of a gate's kinds are Studied, a fight or bloodied-arch door names the foes behind it, the elite and its affixes; when most are Known, their rows and levels too. Once the gate's master is Ledgered, its door names the signature move and what answers it.")
      +cxP('Orders always show what they would do now: Taunt how many planned blows it pulls, Bone Shield the ward it adds, Focus breaks this on a charging boss, and Execute on foes below 40% HP.')
    +'<p class="group-h">Lore</p>'+cxP('The Ledger tells its story in four acts as you play, and '+LORE_PAGES.length+' torn pages tell its history in order. Bosses ('+pct(PAGE_CHANCE.boss)+'), Tower wardens ('+pct(PAGE_CHANCE.warden)+'), elites ('+pct(PAGE_CHANCE.elite)+') and sealed coffers ('+pct(PAGE_CHANCE.coffer)+') may hold the next page, and secret masters always do; page N waits until level '+PAGE_LV(0)+' + 3 per page. Read them on the Lore page.')
    +'<p class="group-h">Saving</p>'+cxP('The game saves itself after every action. Settings holds '+SLOTS_N+' save slots, save codes and save files, and the first save of each day is kept as a backup ('+BAK_N+' days back).')
    +'<p class="group-h">Ranks</p>'+cxList(RK.map((R,i)=>cxRow('Rank '+RANKS[i],(i===ABBEY?'Vane Abbey alone, opened by its keys':'Your rank at level '+R.unlock+'+')+'. Rank '+RANKS[i]+' foes have '+R.hp+'x HP and '+R.atk+'x attack, give '+R.xp+'x XP and are '+R.pen+'% harder to raise.')));
  if(k==='raising') return cxP('After a room, every foe that fell leaves a body. Raising one costs mana and can fail: the chance starts at '+RAISE_BASE+'% and rises with Will ('+RAISE_WILL+'% a point), your level above the body\'s, gear, the Ossuary and Master of Bones. Deeper ranks are harder to raise; elites cost '+RAISE_ELITE+'% and bosses '+RAISE_BOSS+'%. Each boss already in your army or Reserve takes '+RAISE_BOSS_EACH+'% more off a boss body. Odds stay between '+RAISE_MIN+'% and '+RAISE_MAX+'% ('+SALT_CAP+'% with salts).')
    +cxP('Grave Salts add '+SALT_BONUS+'% to one attempt. A wounded straggler between rooms can be raised for free at +'+STRAGGLER_BONUS+'%. Bodies you do not raise before moving on are gone. "Raise the best" on the raise screen tries every body, most valuable first.')
    +'<p class="group-h">How the chance is made</p>'+cxList([cxRow('Adds','Each Will point adds '+RAISE_WILL+'%; each level you stand above the body '+RAISE_LV+'% (and it takes '+RAISE_LV+'% per level below it); Raise chance on gear; each rank of Master of Bones 4%; each Ossuary level '+B_OSS+'%; the '+OMENS.paletide.name+' '+OMEN_RAISE+'%; and its kind\'s mastery: '+MASTERY.filter(t=>t.raise).map(t=>t.name+' '+t.raise+'%').join(', ')+'.'),
      cxRow('Takes away','By the body\'s rank: '+RK.map((R,i)=>RANKS[i]+' '+R.pen+'%').join(', ')+'. An elite '+RAISE_ELITE+'% more, a boss '+RAISE_BOSS+'%. Each boss already in your army or Reserve takes '+RAISE_BOSS_EACH+'% more off a boss body.'),
      cxRow('Caps','The total stays between '+RAISE_MIN+'% and '+RAISE_MAX+'%. Grave Salts add '+SALT_BONUS+'% ('+SENSE_SALT+'% with '+SKILL_MODS.thrift.b[0]+') and may lift it to '+SALT_CAP+'%. You carry up to '+SALT_MAX+'; the market sells them, and Buy max takes as many as you can carry and afford.'),
      cxRow('How it died','A body\'s condition adds or takes: '+Object.keys(CORPSE_CONDS).map(k=>CORPSE_CONDS[k].name+' '+(CORPSE_CONDS[k].raise>0?'+':'')+CORPSE_CONDS[k].raise+'%').join(', ')+'.'),
      cxRow('One soul per boss',SOUL_BOUND),
      cxRow('First raise','The first raise of a new save always answers.'),
      cxRow('Mana','8 mana, 3 more per rank of the body and 4 more for a boss. Corpse Thrift, '+SKILL_MODS.mastery.b[0]+' and '+FLAGS.cheapraise.split(':')[0]+' make it cheaper; a straggler costs nothing.')])
    +'<p class="group-h">How they died</p>'+cxP('How a foe dies marks its body. Each body has at most one condition, the first that fits in this order. It changes the raise chance, and the minion rises with the condition\'s trait in place of its random one (a boss still rolls a second trait, and an elite still keeps an affix).')
    +cxList(Object.keys(CORPSE_CONDS).map(k=>{ const K=CORPSE_CONDS[k], T=TRAITS[K.trait]; return cxRow(K.name,K.when+' Rises '+T.name+': '+T.desc,(K.raise>0?'+':'')+K.raise+'%'); }))
    +cxP('Minions keep the level they had, share half of each room\'s XP, and grow up to two levels above you. One downed in a fight shatters when the room ends '+SHATTER_BASE+'% of the time, '+SHATTER_WILL+'% less per Will point (never below '+SHATTER_MIN+'%); Grave-bound minions, the '+FLAGS.bonebank.split(':')[0]+' power and siege nights stop it. Otherwise it binds back together. Released or shattered gear-bearers return their gear to your bag.')
    +'<p class="group-h">Memorial</p>'+cxP('A minion that shatters or falls on a raid is written into the Memorial on the Ledger tab; the released are not. Once a day, in town, honour one of the Greater or older for about the gold of one Bone Altar level: the living army has +'+Math.round(MEM_HP*100)+'% max HP until dawn.')
    +cxP('In town you may also carve a headstone over any name there and raise it tier by tier with gold. The first tier costs '+HEAD_GOLD+' gold and each further tier of that stone costs '+HEAD_GROW+' times the last. Every tier of every headstone gives your minions about +'+(HEAD_K*100)+'% max HP for good, less and less the more you carve, never past +'+Math.round(HEAD_CAP*100)+'% in all.')
    +cxP('You may also raise a mausoleum over a name there, at most '+MAUS_MAX+', for '+MAUS_COST.join(', ')+' gold in turn. Each gives every minion +'+Math.round(MAUS_K*100)+'% max HP and attack for good, kept through New Game+.')
    +cxList([cxRow('Army slots','1, plus one per 2.5 Will, one per 4 levels, gear and the Crypt. At most '+ARMY_CAP+', plus the Crypt\'s levels.'),cxRow('Gear-bearers','Armed foes (marked Armed) can wear a weapon, armor and relic from your bag once raised.'),cxRow('Bone Altar','Gold raises a minion one level at once, never past your level + 2.'),
      cxRow('Reserve','Opens with the Town tab: '+RESERVE_BASE+' places, +'+RESERVE_CRYPT+' per Crypt level. Benched minions do not fight, take damage or earn XP, and keep their gear. Moving one is free, in town; a full army can raise straight into it.')])
    +'<div class="btns"><button class="btn small" data-a="cx" data-k="army">Army</button><button class="btn small" data-a="cx" data-k="reserve">Reserve</button><button class="btn small" data-a="cx" data-k="fusion">Fusion</button></div>';
  if(k==='faith') return cxP('Once '+OPEN_AT.faith+' gates are cleared, from level '+FAITH_LV+', the Pantheon on the Town tab takes an oath to one of four Old Gods, or to none (the Profane path). Devotion is earned by deeds your god likes; every '+DEV_STEP+' points is a rank, up to '+DEV_RANKS+', and each rank opens a boon. Each god asks a vow: break it and you lose a rank and that day\'s devotion (once a day). Renouncing costs 100 gold per level and starts devotion over. Swearing and renouncing happen in town.')
    +cxP('In about '+pct(FAITH_EVENT)+' of the events between rooms a sworn necromancer meets a shrine: their own god\'s (pray: heal, refill mana, +'+DEV_SHRINE+' devotion), or another god\'s, which offers a conversion (that god, keeping '+pct(CONVERT_KEEP)+' of your devotion points). The Profane may desecrate another god\'s shrine instead.')
    +cxList(GODS.map(k=>{ const F=FAITH[k]; return cxRow(F.name,F.domain+'. '+F.about+'<br><b>Vow:</b> '+F.vow+'<br><b>Deeds:</b> '+F.deeds+BOONS[k].map((b,i)=>'<br><b>Rank '+(i+1)+':</b> '+b.t+'.').join('')+'<br><b>Omens:</b> '+godOmens(k).map(o=>OMENS[o].name).join(', ')+'.<br><b>Temple chapel:</b> '+CHAPELS[k].name+': '+CHAPELS[k].d+'.<br><b>The town:</b> '+GOD_TOWN[k]+'.',faithOf()===k?'Sworn':''); }));
  if(k==='omens') return cxP('Once you have cleared a gate, about '+pct(OMEN_CHANCE)+' of dawns bring an omen. It lasts the whole day and touches every gate, the Tower and the Rift, but never a siege or a Trial. Today: '+(omen()?OMENS[omen()].name:'no omen')+'.')
    +cxP('A sworn necromancer sees tomorrow\'s omen a day ahead. Once a day they may spend '+CALL_COST+' devotion (a rank, or the points past rank '+DEV_RANKS+') to call one of their god\'s two omens for tomorrow, or to ward off the omen foreseen. The Temple at level 5 makes one call a week free. The Profane cannot ward, but once a week calls a random omen for free. Long Night, Rot Bloom and Choir Night never come at dawn: only a god calls them.')
    +cxList(Object.keys(OMENS).map(o=>cxRow(OMENS[o].name,OMENS[o].desc+(OMENS[o].god?' Only '+FAITH[OMENS[o].god].short+' calls it.':''),omen()===o?'Today':forecast()&&forecast().id===o?'Tomorrow':'')));
  if(k==='roles') return cxP('Every creature, yours or the enemy\'s, has one of four roles.')+cxList(Object.keys(ROLES).map(r=>cxRow(ROLES[r].label,ROLES[r].text+' '+CDX_ROLE[r])))
    +'<p class="group-h">Rows</p>'+cxP('Every fighter stands in the front row or the back row. Your vanguards and reapers start in front; strikers, menders and you stand at the back. Out of battle, move a minion forward or back on the Army tab. Among foes, bosses, vanguards and reapers stand in front.')
    +cxList([cxRow('Melee','Vanguards and reapers fight up close. While the other side has anyone standing in its front row, they can only strike that row. So enemy melee cannot reach you while one of your minions holds the front, and your vanguards and reapers hit the weakest foe in front when your target stands at the back.'),
      cxRow('Reach','Strikers, menders and bosses reach any row, with the usual odds. Your Strike, skills and ultimate always hit the foe you choose.'),
      cxRow('Back-row melee','A vanguard or reaper you move to the back row is safe from enemy melee while your front holds, but it strikes over the line for only '+pct(BACK_MELEE)+' of its damage, cleave included.'),
      cxRow('Soul Tether',TETHER_TXT+' A broken front leaves you bare, so keep someone sturdy in it.'),
      cxRow('What ignores rows','Taunt pulls every blow onto your vanguards, wherever they stand. Cleaves, blasts and other splash damage hit every row, and so do boss moves.')]);
  if(k==='minions') return cxP('What each body rises with at its gate\'s base foe level, before Will, Grave Pact, gear, traits and evolution. Every level adds '+pct(LV_HP)+' HP and '+pct(LV_ATK)+' attack. A raised elite has x1.5 HP and x1.3 attack; a raised boss x3.2 HP and x1.4 attack.')
    +DUNGEONS.map((D,di)=>{ const lv=RK[di].lv, list=D.mobs.map(t=>({n:t[0],role:t[1],hf:t[2],af:t[3],boss:false})).concat([{n:D.boss[0],role:D.boss[1],hf:1,af:1,boss:true}]);
      return '<p class="group-h">'+D.name+' &middot; Lv '+lv+'</p>'+cxList(list.map(x=>{ const met=!!(S.kills&&S.kills[x.n]); if(!met) return cxRow('???','Not met yet.');
        const st=mobStats(di,lv,x.hf,x.af,x.boss,false); return cxRow(x.n,'HP '+st.hp+' &middot; ATK '+st.atk+(x.boss?' &middot; boss':''),ROLES[x.role].label); })); }).join('');
  if(k==='traits') return cxP('Every raised minion rolls one trait (bosses two). It evolves at set levels above the level it was raised at; each stage adds its own buff and one more trait. A raised elite also keeps one of its affixes as a trait. Fusion can stack traits up to '+FUSE_TRAITS+'.')
    +cxList(STAGES.slice(1).map((n,i)=>cxRow(n.trim(),fxText(STAGE_FX[i+1])+' and one more trait.','+'+EVOLVE_AT[i+1]+' levels')))
    +cxList(['commander'].concat(TRAIT_IDS,AFFIX_TRAITS,DEATH_TRAITS).map(t=>{ const from=AFFIX_IDS.filter(a=>AFFIX[a].trait===t).map(a=>AFFIX[a].name), died=Object.keys(CORPSE_CONDS).filter(k=>CORPSE_CONDS[k].trait===t).map(k=>CORPSE_CONDS[k].name); return cxRow(TRAITS[t].name,TRAITS[t].desc+(from.length?' Kept from '+withArticle(from.join(' or '))+' elite.':'')+(died.length?' Rises from '+withArticle(died.join(' or ').toLowerCase())+' body.':'')); }));
  if(k==='affixes') return cxP('About one foe in ten is an elite: '+pct(.5)+' more HP, 30% more attack, more XP, gold, trophies and better drops, and harder to raise. Every elite carries a named affix, two in the '+DUNGEONS[3].name+' and deeper and from Tower floor 50.')
    +cxList(AFFIX_IDS.map(a=>cxRow(AFFIX[a].name,AFFIX[a].desc+' Raised, it becomes '+TRAITS[AFFIX[a].trait].name+': '+TRAITS[AFFIX[a].trait].desc)));
  if(k==='bosses') return cxP('Every gate boss fights with a move set: two or three moves it uses in turn every few turns in place of attacking, shown on its card once Known ("Next: ..."). Moves marked telegraphed are announced a turn ahead (Charging): soak a blow with Bone Ward, or freeze the boss with Grave Chill to cancel the move. A boss calls at most '+SUMMON_CAP+' helpers a fight. Some bosses also bring a hazard, a rule for the whole room while they stand. Tower wardens bring a signature move of their own beside the gate move they borrow (Abaddon all of them, abyssal wardens two); wardens move a turn sooner from floor 50 and grow wrathful after turn 8: every turn after that they hit 7% harder (12% on floor 100).')
    +cxP('At '+pct(PHASE_AT)+' HP a boss (from the Sunken Crypt on, and every Tower warden) enters its second phase: its moves come a turn sooner and every move is telegraphed. A gate boss turns its fight with a twist of its own; wardens and secret masters alternate their moves with Sundering Blow. Taunt sends that blow at a vanguard, and a Focus crit breaks any charging move.')
    +'<p class="group-h">Gate bosses</p>'+cxList(DUNGEONS.map(D=>{ const n=D.boss[0], met=metName(n); return cxRow(met?n:'An unmet boss',met?bossKitTxt(n):'Meet it to learn its moves.',D.name); }))
    +cxRow(SIEGE_BOSS,bossKitTxt(SIEGE_BOSS),'Sieges')
    +cxRow('The rival','Royal Decree, and a second move shaped by the bodies they stole: mostly vanguards bring '+BOSS_ABIL.rampart.name+', strikers '+BOSS_ABIL.called.name+', menders '+BOSS_ABIL.blackmass.name+', reapers '+BOSS_ABIL.harvest.name+'.','Challenges')
    +'<p class="group-h">Moves</p>'+cxList(Object.keys(BOSS_ABIL).map(id=>{ const A=BOSS_ABIL[id], own=Object.keys(BOSS_KIT).filter(n=>BOSS_KIT[n].moves.includes(id)), gi=GATE_ABIL.indexOf(id);
      const who=id==='sunder'?'Wardens and secret masters, second phase':id==='mirror'?'The Pale Sovereign, second phase':WARDEN_SIG.includes(id)?'A Tower warden':id==='otherhalf'?'Abaddon, King of Hell':own.length?own.map(n=>n===SIEGE_BOSS||metName(n)?n:'An unmet boss').join(', '):Object.values(RIVAL_MOVE).includes(id)?'The rival':gi>=0?DUNGEONS[gi].name:'';
      return cxRow(A.name,A.desc+' Every '+A.every+' turns.',(A.warn?'Telegraphed &middot; ':'')+who); }))
    +'<p class="group-h">Second phases and hazards</p>'+cxList(Object.keys(TWISTS).map(t=>cxRow(TWISTS[t].name,TWISTS[t].desc,'Second phase')).concat(Object.keys(HALVES).map(t=>cxRow(HALVES[t].name,HALVES[t].desc,'A secret master at half HP'))).concat(Object.keys(HAZARDS).map(h=>cxRow(HAZARDS[h].name,HAZARDS[h].desc,'Hazard'))))
    +(()=>{ const met=SECRET.map((B,i)=>({B,i})).filter(x=>metName(x.B.name)); if(!met.length) return '';
      return '<p class="group-h">Secret masters</p>'+cxP('Some gates hide an older master. Once a gate is cleared, its boss room very rarely holds that master instead, a little more often on harder difficulty and each time it stays away. It is never weaker than you, fights with the strength of the hardest gate open to you, and grows tougher the further you stand past that gate. It enters its second phase at once and acts faster, alternating its own moves with Sundering Blow, and at half HP a second rule wakes. It pays four times the XP and gold, two legendaries and its heart, and its title.')
        +cxList(met.map(x=>cxRow(x.B.name,'The secret master of the '+DUNGEONS[x.i].name+'. '+bossKitTxt(x.B.name)+'.',T_('secret_'+x.i)?'Slain':'Met'))); })();
  if(k==='kits'){ const who=K=>Object.keys(KIT_OF).filter(n=>KIT_OF[n]===K&&metName(n));
    return cxP('Every kind of foe has a kit: one rule of its own. Bosses, the rival and secret masters have none. A foe card shows "Kit ?" until you have studied its kind; then it names the kit and its rule. Known kinds also show what the kit does this turn, and Ledgered kinds the answer.')
      +'<p class="group-h">The sixteen kits</p>'+cxList(KIT_IDS.map(K=>{ const w=who(K); return cxRow(KITS[K].name,KITS[K].rule+' Answer: '+KITS[K].ans+(w.length?' Carried by '+w.join(', ')+'.':'')); }))
      +'<p class="group-h">The Undone</p>'+cxP('A foe killed by damage of a type it was weak to leaves an Undone body (+'+CORPSE_CONDS.undone.raise+'% to raise). The minion keeps an echo of its kind\'s kit at 60% strength. Kinds whose kit has no echo give +'+Math.round(ECHO_PLAIN*100)+'% damage instead.')
      +cxList(Object.keys(ECHO).map(K=>cxRow(KITS[K].name+' echo',echoTxt(K))))
      +'<p class="group-h">Sweep</p>'+cxP('A gate you have cleared on Normal at least '+SWEEP_CLEARS+' times can be swept from its card on a Normal, uncursed day once you stand '+SWEEP_LV+' levels above its advice. A sweep costs one watch and wins every room at once: kill XP at '+Math.round(SWEEP_XP*100)+'%, gold, trophies, gear, bestiary kills and quest progress as usual; nothing is raised, and there are no events, doors or records. A secret master or the rival stops the sweep at the boss room, and you fight it.'); }
  if(k==='types'){ const pc=v=>Math.round(Math.abs(v)*100)+'%', prof=(res,hits)=>{ const w=DT_IDS.filter(t=>res[t]<0), r=DT_IDS.filter(t=>res[t]>0); return (w.length?'Weak to '+w.map(t=>DTYPE[t].name+' (+'+pc(res[t])+')').join(', ')+'. ':'')+(r.length?'Resists '+r.map(t=>DTYPE[t].name+' (-'+pc(res[t])+')').join(', ')+'. ':'')+'Strikers deal '+DTYPE[hits].name+'.'; };
    return cxP('Every hit has one of five damage types: Physical, Shadow, Frost, Fire and Rot. Where foes stand decides what they are weak to and what they resist. A weakness adds to the damage, a resistance takes from it, once, after armor and before any shield. Armor and resistance are separate: piercing beats armor, the right type beats resistance.')
      +'<p class="group-h">Your damage</p>'+cxList([cxRow(DTYPE.phys.name,'Strike, Echo, Hellfire, Cleave, Bone Spear and its Splinter, Thorns, Barbed Hide, the Spiked and Volley marks, bleeding, and every minion hit without a typed trait.'),
        cxRow(DTYPE.shad.name,'Soul Siphon and Chorus, Reap, Death\'s Toll, and Bloodfiend minions.'),
        cxRow(DTYPE.frost.name,'Grave Chill, the Deep Winter capstone, and Rimeborn, Glaciermaul and Shatterwrought minions (Shatterwrought alternates frost and fire).'),
        cxRow(DTYPE.fire.name,'Burns, and Cinderborn and Pyreheart minions.'),
        cxRow(DTYPE.rot.name,'Corpse Explosion, poison and blight, and Venomous, Necrotic, Plaguebearer and Witchrot minions.')])
      +'<p class="group-h">Where foes stand</p>'+cxList(DUNGEONS.map((D,i)=>cxRow(D.name,prof(GATE_RES[i],GATE_HITS[i]))).concat([cxRow('The Hell Tower',prof(TOWER_RES,TOWER_HITS)),cxRow('The Rift','Each depth has one weakness and one resistance, the same every time, shown before you enter. Strikers deal '+DTYPE[GATE_HITS[5]].name+'.'),cxRow('Sieges',prof(SIEGE_RES,SIEGE_HITS)+' The living have no resistances.'),cxRow('Trials','As the gate the Trial is set in.')]))
      +'<p class="group-h">Your defenses</p>'+cxList([cxRow('Resistance lines','Armor can roll Fire, Frost, Rot or Shadow resistance as a bonus line. Each takes that much from hits, burns and wounds of its type, up to '+pc(RES_CAP)+'. Physical damage has no resistance line: Constitution, armor sets and titles cover it.'),
        cxRow('Damage lines','Weapons and relics can roll Fire, Frost, Rot or Shadow damage as a bonus line: that much more damage of the type from you and your army.'),
        cxRow('Typed minions','A minion with Rimeborn resists frost, Cinderborn fire, Venomous or Necrotic rot, each by '+pc(TRAIT_RES.rimeborn[1])+'.'),
        cxRow('What hits you','Vanguards and menders hit physical; strikers hit with their place\'s type. Frost-touched elites hit frost and chill, Burning elites hit fire and burn. Cinder Wave and Volatile bodies are fire, poison and blight are rot, bleeding is physical.')])
      +'<p class="group-h">Omens</p>'+cxP(OMENS.ironrain.name+': foes also resist '+pc(IRON_PHYS)+' of physical damage. '+OMENS.soulstorm.name+': your shadow damage is '+pc(STORM_SHAD-1)+' stronger.'); }
  if(k==='status') return cxP('Damage over time ticks at the end of each turn, ignores ward and armor, and wears off when you leave the room. A new dose of the same kind refreshes it rather than stacking. A Healing Draught cures you; Dark Mending cures your whole side. Foes with the Warded affix and minions with the Warded trait are immune.')
    +cxList(Object.keys(DOTS).map(d=>cxRow(DOTS[d].name,CDX_DOT[d])))
    +'<p class="group-h">Other effects in a fight</p>'+cxList([cxRow('Frozen','From Grave Chill (1 turn, 2 at rank 3) and Soul Prison (2 turns, bosses 1). The foe skips its turn; a charging move is lost.'),cxRow('Cursed','From Curse of Frailty and Soul Prison. The foe takes more damage from everything.'),
      cxRow(CONDS.chilled.name,'From Grave Chill at rank 2 and up, even when a boss resists the freeze. '+CONDS.chilled.desc+' 2 turns.'),
      cxRow(CONDS.sundered.name,'From your vanguards (1 hit in 10), Crushing minions, the Bigger Bang upgrade, and on your side from Sundering elites and the Sundering Blow. '+CONDS.sundered.desc+' 2 turns.'),
      cxRow(CONDS.hexed.name,'From Curse of Frailty at rank 3 and Hexing minions, and on your side from Hexing elites and the Whisper Choir. '+CONDS.hexed.desc+' 2 turns. Hexed, your skills hit 20% softer too.'),
      cxRow(CONDS.hasted.name,'From Unholy Frenzy at rank 3 (your army, 2 turns) and Swift minions (the first 2 turns of a fight), and on their side from Swift elites (the first 3 turns). '+CONDS.hasted.desc),
      cxRow('Shield','Soaks damage before HP. Foes get it from Bone Wall and the Shielded affix; your Bone Ward is capped at 60% of your max HP.'),cxRow('Silenced','From the Hymn of Silence. Your skills cannot be used for 2 turns.'),
      cxRow('Armor','Deeper foes wear armor that blunts every hit you and your army land: '+DIFF.armor.map((a,i)=>RANKS[i]+' '+pct(a)).join(', ')+', Tower '+pct(TW.armor)+'. Soul Siphon pierces '+pct(SIPHON_PIERCE)+', Bone Spear half (all of it with Impaler); Corpse Explosion, Reap and Death\'s Toll ignore it.')])
    +'<p class="group-h">Combos</p>'+cxP('Some effects feed each other. When one fires, the log says so and its name rises from the card.')+cxList(Object.keys(COMBOS).map(k=>cxRow(COMBOS[k].name,COMBOS[k].desc)));
  if(k==='skills') return cxP('One skill point per level. Each skill has '+SK_MAX+' ranks, and each rank needs '+SK_STEP+' more levels than the last. Active skills cost mana and have cooldowns that reset every room. At rank '+SK_MAX+' you choose one of two upgrades. Forgetting your skills in town refunds every point.')
    +cxList(SKILLS.map(s=>{ const M=SKILL_MODS[s.id]; return cxRow(s.name,[1,2,3].map(r=>'<b>Rank '+r+' (Lv '+skReq(s,r)+'):</b> '+s.desc(r)).join('<br>')+(M?'<br><b>Upgrades:</b> '+M.a[0]+' ('+M.a[1]+') or '+M.b[0]+' ('+M.b[1]+')':''),s.type==='active'?'Active &middot; '+s.cost+' mana &middot; cooldown '+s.cd:'Passive'); }))
    +'<p class="group-h">Soul Siphon and Souls</p>'+cxP('Soul Siphon (key 2, '+siphonCost()+' mana) pierces '+pct(SIPHON_PIERCE)+' of foe armor, drains twice as hard from a foe below '+pct(SIPHON_LOW)+' HP, heals you for '+pct(SIPHON_HEAL)+' of what it drains ('+pct(SIPHON_HEAL_LD)+' with Lifedrain), and harvests a Soul. Every elite or boss that falls also gives a Soul. You hold up to '+SOUL_MAX+', and they last for the whole run.')
    +'<p class="group-h">Ultimates</p>'+cxP('From level '+ULT_LV+', choose one ultimate on the Skills tab (switch for free in town). With '+SOUL_MAX+' Souls, unleash it in battle with R; it uses your turn and all your Souls.')
    +cxList(Object.keys(ULTS).map(id=>cxRow(ULTS[id].name,ULTS[id].desc,S.player.ult===id?'Chosen':'')));
  if(k==='orders') return cxP('Once per room, each kind of minion in your army can be given one order. Orders are free and do not use your turn.')+cxP('Every foe card shows what that foe will do on its turn: whom it attacks, whom it mends, or the move a boss is about to use. It does exactly that, unless its target falls first, Taunt pulls it onto a vanguard, or you freeze it, which costs it the action.')+cxList(Object.keys(CMDS).map(r=>cxRow(CMDS[r].name,CMDS[r].desc,ROLES[r].label+'s')).concat([cxRow(GUARD.name,GUARD.desc+' Unlike Taunt, it covers boss moves, but only the one blow, and the vanguard must stand in the front row.','Vanguards')]));
  if(k==='gates') return cxP('Six gates of four rooms each, the last holding the boss. Clearing a gate pays bonus XP and, the first time, a page of the story.')
    +cxP('A cleared gate can be entered on a harder difficulty, picked on its card: '+HEAT.slice(1).map(h=>h.name+' (foes x'+h.foe+'; XP x'+h.xp+', gold x'+h.gold+', gear x'+h.drop+')').join(', ')+'. Each opens after clearing the one below. On a cursed day the curse feeds on it: a further x'+DAMNED_FOE+' to foes, x'+DAMNED+' to rewards. A Nightmare clear marks the gate\'s card and earns that gate\'s Nightmare title.')
    +cxP('Each harder difficulty also adds a rule and keeps the rules below it. Elites the rules add drop as elites, but carry the gate\'s unique only at an ordinary foe\'s odds.')+cxList(HEAT.slice(1).map(h=>cxRow(h.name,h.rule)))
    +cxP('Each gate card shows a star for every difficulty you have cleared it on and your fastest clear. Details opens its boss, how many of its foes you have studied, its gear tiers and its clear bonus.')
    +cxP('Each difficulty chip shows the hero level from which most necromancers clear the gate on it (Hard/Brutal/Nightmare: '+DUNGEONS.map((D,i)=>RANKS[i]+' '+[1,2,3].map(h=>tierRec(i,h)).join('/')).join(', ')+').')
    +cxP('On Normal, a gate far below you pays less: kill XP, gold and the clear bonus stay full until you stand about '+DIFF.farmFrom+' levels past its recommended level, then fall to '+pct(DIFF.farmMin)+' at about '+DIFF.farmTo+' levels past; the gate card says when it applies. A first clear, a cursed gate and every harder difficulty pay in full, and gear drops never shrink.')
    +cxList(DUNGEONS.map((D,i)=>{ const mobs=D.mobs.map(m=>metName(m[0])?m[0]+' ('+ROLES[m[1]].label.toLowerCase()+(isArmed(m[0])?', gear-bearer':'')+')':'???').join(', ');
      return cxRow(D.name,(i===ABBEY?'Opens by either of its keys (the deep route or the secret route)':'Opens at level '+RK[i].unlock)+', recommended from level '+gateRec(i)+'. Armor '+pct(DIFF.armor[i])+'. Clear bonus '+RK[i].clear+' XP.<br><b>Foes:</b> '+mobs+'<br><b>Boss:</b> '+(metName(D.boss[0])?D.boss[0]+', '+(i===ABBEY?'three pages of moves':BOSS_ABIL[GATE_ABIL[i]].name):'???')+(secretHinted(i)?'<br><i class="dim">'+SECRET[i].hint+'</i>':''),'Rank '+RANKS[i]); }));
  if(k==='tower') return cxP('Opens once '+OPEN_AT.tower+' gates are cleared, from level '+TW.unlock+'. One fight per floor and a warden every tenth floor, each carrying a unique: guaranteed the first time, '+pct(TW.repeat)+' after (as gold while you carry one). Floors you clear become checkpoints every ten floors. Past floor 100 the Abyss never ends, and each tenth floor pays gold and a legendary. Tower foes wear '+pct(TW.armor)+' armor. A minion raised in the Tower stands like a '+DUNGEONS[5].name+' minion of its level, '+Math.round(TW_MINION*100)+'% stronger for each floor it fell on.')
    +cxList(TW_BOSS.map((n,i)=>{ const f=(i+1)*10, seen=S.tower.best>=f-10; return cxRow(seen?n:'???','Floor '+f+' &middot; recommended level '+recLv(f)+(seen?' &middot; '+wardenKit(f).map(m=>BOSS_ABIL[m].name).join(', '):''),S.tower.best>=f?'Defeated':''); }));
  if(k==='gear') return cxP('You wear a weapon, armor and a relic. Gear-bearer minions can wear them too. On a minion, attack, strength, crit, Siphon and intelligence add to its attack; HP, constitution, ward, mana and will add to its HP; minion power works as usual.')
    +cxList(TIERS.map((t,i)=>cxRow(t,i===5?'One per gate boss and Tower warden. Fixed stats and a unique power. A unique you already carry never drops again: you get ordinary gear (or gold, from a warden) instead. Cannot be sold, salvaged or enchanted, and ignores the bag limit. Gold, bone dust and its boss\'s hearts awaken it instead.':(ROLL_LINES[i]?'Up to '+ROLL_LINES[i][0]+' bonus line'+(ROLL_LINES[i][0]>1?'s':'')+', each rolled at '+pct(ROLL_LINES[i][1])+'.':'')+' Salvages for '+(DUST_TIER[i]||0)+' bone dust, plus 1 per two bonus lines.',i===5?'':'Tier '+(i+1))))
    +'<p class="group-h">Working on gear</p>'+cxList([cxRow('Reforge','Re-rolls every bonus line for '+pct(REFORGE_COST)+' of the merchant price in gold. Always leaves at least one line.'),cxRow('Enchant','Spends bone dust to add one bonus line to a piece with room for it, or to re-roll one line you choose.'),
      cxRow('Temper','Gold moves one bonus line '+pct(TEMPER_STEP)+' of the way to its best roll (at least 1 more). Each temper on the same piece costs '+pct(TEMPER_GROW-1)+' more than the last; re-rolling a line does not reset it. Not for uniques.'),
      cxRow('Awaken',AWAKEN_TXT+' Five ranks of a Rat Warren unique cost about '+Math.round(awakenTotal(0)/1000)+'k gold, of a Throne of Ash unique about '+Math.round(awakenTotal(5)/1000)+'k. "Sell all" keeps the hearts your uniques still need.'),
      cxRow('Salvage','Breaks a piece into bone dust.'),cxRow('Lock','A locked piece cannot be sold, salvaged or discarded until you unlock it.'),cxRow('Sell','Gear sells for a quarter of the merchant price, plus a quarter more per bonus line.'),cxRow('Trophy forge',FORGE_N+' trophies from one gate (a boss heart counts as 5) and some gold forge that gate\'s gear in the slot you choose. '+pct(MASTERWORK)+' come out a masterwork from the next gate.')]);
  if(k==='uniques') return cxP('Each gate boss and Tower warden has its unique. A gate boss leaves one drop for sure and a second '+pct(dropChances(true,false)[1])+' of the time, and each drop has the chance below to be its unique. Ordinary foes of the gate carry it at '+(UQ_MOB*100)+'% of the boss\'s odds, elites at twice that. A Tower warden gives its unique the first time and '+pct(TW.repeat)+' of the time after. A unique you already carry never drops again: you get ordinary gear instead.')
    +cxList(DUNGEONS.map((D,i)=>cxRow(D.name,'Boss '+(+UQ[i].toFixed(4))+'% per drop &middot; elite '+(+(UQ[i]*UQ_MOB*2).toFixed(4))+'% &middot; foe '+(+(UQ[i]*UQ_MOB).toFixed(4))+'%',metName(D.boss[0])?D.boss[0]:'')))
    +'<p class="group-h">Powers</p>'+cxP('Uniques carry one of these powers. Only worn gear counts.')+cxList(Object.keys(FLAGS).map(f=>{ const i=FLAGS[f].indexOf(':'), d=FLAGS[f].slice(i+1).trim(); return cxRow(FLAGS[f].slice(0,i),d.charAt(0).toUpperCase()+d.slice(1)); }));
  if(k==='sets') return cxP('Each gate\'s gear is a set, and its unique counts toward it. Ordinary Tower gear belongs to no set.')+cxList(SET_NAMES.map((n,i)=>cxRow(n,'<b>2 pieces:</b> '+buffTxt(SET_BONUS[i][2])+'<br><b>3 pieces:</b> '+buffTxt(SET_BONUS[i][3]),DUNGEONS[i].name)))
    +'<p class="group-h">Unique sets</p>'+cxP('The uniques form six sets of three: a weapon, an armor and a relic. Their bonuses are bigger than a gate set\'s, and a gate unique counts toward both its gate set and its unique set.')
    +cxList(USET.map((U,i)=>{ return cxRow(U.name,'<b>Pieces:</b> '+U.ids.map(id=>ITEM[id].name).join(', ')+'<br><b>From:</b> '+U.from+'<br><b>2 pieces:</b> '+buffTxt(U.b[2])+'<br><b>3 pieces:</b> '+buffTxt(U.b[3]),'Worn '+usetCount(i)+'/3'); }));
  if(k==='supplies') return cxList(DRINK_IDS.map(p=>cxRow(drinkDef(p).name,drinkDef(p).desc+' Key '+drinkDef(p).key+'.'+(POTIONS[p]?'':' Brewed only.'))).concat([cxRow('Belt','Carry up to '+BELT_MAX+' of each drinkable, one more at Forge level 2 and at level 3 (at most '+BELT_CAP+').')]))
    +'<p class="group-h">Brewing</p>'+cxP('Recipes at the market take trophy parts of a role (striker, reaper, mender, vanguard: the part word in a trophy\'s name) from a gate of a given rank or deeper, and a little gold; bone charms take spare boss hearts instead (never those a unique you hold still needs). Tower trophies count as the deepest gate. Up to '+BREW_STASH+' of each brew wait in your stash. On the Gates tab you arm one oil, one incense and one charm; each gate run takes one of each from the stash. A banner armed goes with each raid you order that day.')
    +cxList(BREW_IDS.map(id=>cxRow(BREWS[id].name,BREWS[id].desc+' Needs '+partsTxt(BREWS[id])+'.')))
    +cxList([cxRow('Grave Salts','+'+SALT_BONUS+'% chance on one raise. Carry up to '+SALT_MAX+'.'),cxRow('Brewing','Any '+BREW_N+' trophies brew a potion at the market.'),cxRow('Bone Altar','Pour gold on it to raise a minion one level, never past your level + 2.'),cxRow('Larger bag','+'+BAG_STEP+' slots per upgrade, '+BAG_COST.length+' upgrades. The bag starts at '+BAG_MAX+'.')]);
  if(k==='trade') return '<p class="group-h">Commissions</p>'+cxP('Once the town opens, the bounty board also carries '+COMM_N+' commissions each week: trophy parts from a gate, a heartforged piece, or a grown minion of a role. Filling one pays gold and bone dust; trophy orders pay '+COMM_TRO_K+' times the trophies\' price and more. They lapse when the week ends, filled or not.')
    +'<p class="group-h">Black market</p>'+cxP('A stall in the market that opens every seventh day from day '+BM_DAY+'. It trades without gold, but for one trade, and each trade once a week.')
    +cxList(Object.keys(BM_TRADES).map(k=>cxRow(BM_TRADES[k].name,'For '+BM_TRADES[k].take+'.')));
  if(k==='rooms') return '<p class="group-h">Doors</p>'+cxP('After each gate room you choose the next from two or three doors. The first is always an ordinary fight; the room before the boss leads only to the boss.')
    +cxList(Object.keys(DOORS).map(d=>cxRow(DOORS[d].name,DOORS[d].desc)))
    +'<p class="group-h">Between rooms</p>'+cxP('After '+pct(EVENT_CHANCE)+' of gate and Rift rooms (never the last, never in the Tower, a siege or a Trial) you find something. Walking past is always safe.')
    +cxList(Object.keys(EVENTS).filter(e=>!EVENTS[e].chain).map(e=>cxRow(EVENTS[e].name,EVENTS[e].text+' Choices: '+EVENTS[e].opts.map(o=>o[1]).join(' or ')+'.'+(EVENTS[e].faith==='*'?' Only for a sworn necromancer, in about '+pct(FAITH_EVENT*SHRINE_OTHER)+' of events.':EVENTS[e].faith?' Only for those sworn to '+FAITH[EVENTS[e].faith].name+', in about '+pct(FAITH_EVENT*(1-SHRINE_OTHER))+' of events.':''))));
  if(k==='raids') return cxP('A raised elite can rise as a Commander ('+pct(CMD_ELITE)+'; a boss '+pct(CMD_BOSS)+'), and may become one when it evolves. Only elites and bosses can hold it, even through fusion. From the War table on the Gates tab, a Commander leads one to '+RAID_SQUAD+' followers (+1 per evolution, +1 for a boss) against a gate you have cleared. A raid is an order for tonight: the squad fights the rest of the day\'s runs with you and marches when the day ends, with whoever is still standing (no Commander, no raid). You can cancel the order any time before nightfall. Away overnight they keep their places in the army or the Reserve, so a siege raise cannot fill them, and at dawn they step back in. Only if those places are gone (a burned Crypt) do they wait at the gate.')
    +cxList([cxRow('Odds','Taken when the squad marches: its total attack and HP against the gate\'s foes, raised 10% per Commander evolution and 15% for a boss. Between '+pct(RAID_MIN)+' and '+pct(RAID_MAX)+'.'),cxRow('A night won at a gate',RAID_GOLD+'x a gate\'s gold, two or three pieces of gear from its table (never a unique) and '+(RAID_XP===.75?'three quarters':RAID_XP===.5?'half':pct(RAID_XP))+' of a level of XP for each member.'),cxRow('Loss','Each follower falls '+pct(RAID_LOSS)+' of the time (Grave-bound never do); its gear returns to your bag. The Commander always comes home.'),
      cxRow('Steps','Each night has three steps, each at the cube root of the odds: the Approach ('+pct(EXP_NO_VAN)+' less with no vanguard), the Fight ('+pct(EXP_NO_FIGHT)+' less with no striker or reaper; '+pct(EXP_FIGHTER)+' more per striker or reaper, at most '+pct(EXP_FIGHT_MAX)+'; '+pct(EXP_TYPE)+' more or less per minion whose type the gate is weak to or resists; '+pct(EXP_BOND)+' more for a bonded pair) and the Haul. A failed Approach loses the night and nothing else. A failed Fight ends the night: each follower may fall, but the Commander shields the first, once an expedition. A failed Haul halves what the squad carries; with no mender, each night\'s take is halved. A step stays between '+pct(EXP_STEP_MIN)+' and '+pct(EXP_STEP_MAX)+'.'),
      cxRow('Targets','A cleared gate (one or two nights). Today\'s cursed gate (one or two nights): steps '+pct(EXP_CURSE)+' harder, gold x'+EXP_CURSE_PAY+', two pieces of gear at most. Ten floors of the Hell Tower once your best is floor '+EXP_BAND_AT+' (two nights): Tower trophies, half the gold, a warden\'s heart '+pct(EXP_WARDEN)+' of nights. A hunt for a kind you have mastered (one night): the Fight '+pct(EXP_HUNT_KIT)+' harder, '+EXP_HUNT_TRO+' of its trophies, or a boss\'s heart '+pct(EXP_HEART)+' of nights. A scavenge near your deepest gate (one night): no Fight, bone dust and trophies, half the XP.'),
      cxRow('Dawn','With nights left, the squad waits at dawn for your word: press on (spoils '+pct(EXP_PRESS_PAY)+' more for each night pressed, steps '+pct(EXP_PRESS)+' harder), the risky path (no Approach and spoils doubled, but a lost Fight costs the weakest follower outright) or come home now. Spoils come home with the squad.'),
      cxRow('On the road','One night in ten that holds brings something on the road: a lost patrol of the living (the Embalmery keeps one, or the town calms), an old camp (bone dust) or another keeper\'s squad (win: spoils +50% that night; lose: a follower may fall).'),
      cxRow('Rally','In battle, a Commander in your army gives one free order a room: Strike harder (your minions deal '+pct(RALLY_DMG)+' more damage this turn, '+pct(RALLY_DMG+RALLY_TWO)+' with two Commanders) or Steady (every minion sheds one condition). An Elder Commander (evolved twice) also makes Taunt last a turn longer and Bone Shield '+pct(ELDER_SHIELD-1)+' stronger.')]);
  if(k==='rift') return cxP('Opens at level '+RIFT_LV+' once the Throne of Ash has fallen. Each depth is a '+RIFT_ROOMS+'-room run through a random gate\'s dead, at your level plus one per three depths, as strong as the deepest gate and '+pct(RIFT_STEP)+' harder per depth. Gear drops rise '+pct(RIFT_DROP)+' per depth (at most x'+RIFT_DROP_MAX+'). Clearing your deepest depth opens the next and leaves an extra legendary. No curses, no difficulty levels.')
    +'<p class="group-h">Sigils</p>'+cxP('Before a dive, pick up to '+SIGIL_MAX+' sigils. Each makes the dive harder in one way and adds to its reward multiplier, for gold, XP and gear drops. The first three open at depth '+SIGIL_AT+', one more every '+SIGIL_STEP+' depths of your deepest dive, or sooner for Rift Shards. A cleared dive pays '+SHARD_SIGIL+' shard per sigil.')
    +cxList(SIGIL_IDS.map(k=>cxRow(SIGILS[k].name,SIGILS[k].desc+' Rewards +'+Math.round(SIGILS[k].rew*100)+'%.',sigOpen(k)?(sigPicked().includes(k)?'Picked':'Open'):'')))
    +'<p class="group-h">Guardians</p>'+cxP('Every '+GUARD_EVERY+'th depth ends in a guardian instead of a gate master: six in turn, each with a move set, a second phase and some with a hazard. A guardian leaves no body, but pays 1 Rift Shard and one more per 10 depths.')
    +cxList(GUARDIANS.map((G,i)=>cxRow(G.name,G.moves.map(m=>'<b>'+BOSS_ABIL[m].name+':</b> '+BOSS_ABIL[m].desc).join('<br>')+'<br><b>'+TWISTS[G.twist].name+':</b> '+TWISTS[G.twist].desc+(G.hazard?'<br><b>'+HAZARDS[G.hazard].name+':</b> '+HAZARDS[G.hazard].desc:''),'Depth '+(GUARD_EVERY*(i+1))+', '+(GUARD_EVERY*(i+1+GUARDIANS.length))+', ...')));
  if(k==='curses') return cxP('Each day one gate you have cleared is cursed. '+MOD_REWARD+' Once the Throne of Ash has fallen, a cursed gate\'s foes rise to '+CURSE_GAP+' levels below yours, so cursed days stay a real fight.')+cxList(Object.keys(MODS).map(m=>cxRow(MODS[m].name,MODS[m].desc)));
  if(k==='town') return cxP('The Town tab, the bounty board and the Reserve open once '+OPEN_AT.town+' gates are cleared.')+'<p class="group-h">Buildings</p>'+cxP('Each has '+BUILD_MAX+' levels, costing '+BUILD_COST.map((c,i)=>'level '+(i+1)+': '+c[0]+' gold'+(c[1]?' + '+c[1]+' bone dust':'')).join('; ')+'. The '+Object.keys(BUILD).filter(k=>BUILD[k].step).map(k=>BUILD[k].name).join(' and the ')+' cost one step less: level 2 at the level-1 price, level 3 at the level-2 price. They last until New Game+.')
    +cxList(Object.keys(BUILD).map(b=>cxRow(BUILD[b].name,BUILD[b].desc,'Level '+bl(b)+'/'+BUILD_MAX)))
    +cxP('Levels 4 and 5 wait until the Throne of Ash has fallen. The newer buildings open as the town grows: the Charnel Yard with the town, the Library after '+3+' gate clears, the Embalmery after 4, the Bell Tower once a siege has been warned, the Apothecary at Forge level 2, the War Room after your first raid, the Temple once you swear an oath.')
    +'<p class="group-h">Specializations</p>'+cxP('At levels 3 and 5 a building offers two specializations. You pick one, and it is final for this cycle.')
    +cxList(Object.keys(SPEC).map(b=>cxRow(BUILD[b].name,[3,5].map(lv=>'Level '+lv+': '+SPEC[b][lv].map(x=>x[0]+' ('+x[1].replace(/\.$/,'')+')').join(' or ')).join('. ')+'.')))
    +'<p class="group-h">Library and Embalmery</p>'+cxP('From Library level 2 you can take back every stat point you spent and spend them again: free the first time, then '+RESPEC_GOLD+' gold per level and '+RESPEC_DUST+' bone dust, once every '+RESPEC_DAYS+' days. The Embalmery keeps untried bodies from your gate runs (Keep for the Embalmery on the raise screen) and holds two plus its level; raise them in town with its bonus before they spoil.')
    +'<p class="group-h">The town\'s dread</p>'+cxP('Once sieges begin, the town keeps a dread meter from 0 to 100, starting at '+DREAD_START+'. Every 20 raises in the gates add 2, a raid won on the two nearest gates adds '+DREAD_RAID+', a new building level '+DREAD_BUILD+' and a siege lost '+DREAD_SIEGE_LOST+'. A siege won takes off '+DREAD_SIEGE_WON+', a commission '+DREAD_COMM+' and a tithe at the Old Shrine ('+b100(TITHE_K)+'% of your gold, once a day) '+DREAD_TITHE+'. Each dawn it drifts a point toward '+DREAD_REST+'.')
    +cxList(DREAD_BANDS.map(b=>cxRow(b.name,b.fx,b.min+'+')))
    +'<p class="group-h">Daily orders</p>'+cxP('Once a building stands, the daily quest gives way to orders: three are posted at dawn, you take one, and it pays once when done, always with '+b100(QUEST_XP)+'% of a level. Only a Hunt pays a stat point.')
    +cxList(Object.keys(ORDERS).map(k=>cxRow(ORDERS[k].name,ORDERS[k].pay())))
    +'<p class="group-h">Upkeep</p>'+cxP('Every building level past 2 costs '+UPKEEP+' gold a day per level past 2 per gate step of your deepest gate, paid at dawn. A building that cannot be paid loses its top level until a dawn pays it, and the town\'s dread rises by '+DREAD_UNPAID+'.')
    +'<p class="group-h">Bell Tower defenses</p>'+cxList(BELL_DEF.map((x,i)=>cxRow(x[0],x[1],'Level '+(i+1))))
    +'<p class="group-h">The Flesh Pit</p>'+cxP('Fuse two minions of the same role. The stronger survives with '+FUSE_LV+' more level (never past your level + 2), the higher evolution, and both sets of traits up to '+FUSE_TRAITS+'. A minion can take part in at most '+FUSE_MAX+' fusions. It costs '+FUSE_GOLD+' gold per level of the two minions together.')+'<div class="btns"><button class="btn small" data-a="cx" data-k="fusion">Fusion</button></div>';
  if(k==='sieges') return cxP('Once the Town tab is open and your buildings have '+SIEGE_BUILT+' levels between them, the living march on the necropolis every '+SIEGE_GAP[0]+' to '+SIEGE_GAP[1]+' days. The dawn before, a notice and a banner on the Town tab warn you. The siege comes when that day ends (your last watch, or Rest until dawn), after tonight\'s raids have marched, so a Commander sent raiding is not on the walls. It costs no watch and cannot be skipped. Closing the game does not stop it: it starts again from the first wave.')
    +cxList([cxRow('The fight',SIEGE_WAVES+' waves on the normal battle screen, with every skill, order, potion and ultimate. Between waves you heal as between rooms ('+pct(DIFF.heal)+' HP, '+pct(DIFF.mana)+' mana, your army '+pct(DIFF.mheal)+'); no doors, no events, no raising until the last wave falls. Downed minions never shatter. Curses, omens and difficulty do not apply.'),
      cxRow('The living','Militia spearmen (vanguard), crossbowmen (striker), chaplains (mender) and a witch-hunter (an elite reaper). The last wave is led by the '+SIEGE_BOSS+', who speaks a telegraphed '+BOSS_ABIL[SIEGE_MOVE].name+'. They stand at your level -'+SIEGE_LV+' (the captain +'+SIEGE_BOSS_LV+'), as hard as the deepest gate open to you. They drop that gate\'s gear at '+pct(SIEGE_DROP)+' of the usual odds.'),
      cxRow('Victory','Gold worth about '+SIEGE_GOLD+' clears of the deepest open gate, bone dust, one piece of that gate\'s gear with a bonus line, and the raise screen for the last wave\'s bodies.'),
      cxRow('Guard and wall','On the night, before the first wave, choose one building to guard: a defeat cannot burn it (another burns instead, or you pay the fine if none is left). You can also send up to '+SIEGE_WALL+' Reserve minions to the wall: they fight this siege in your front row without taking army places, and go back to the Reserve when it ends. Raiders and minions waiting at the gate cannot go.'),
      cxRow('Defeat','Fleeing counts as one. No XP is lost and nothing is deleted. One built building is damaged: its effects, siege perk included, are lost until you repair it on the Town tab for '+pct(SIEGE_REPAIR)+' of its current level\'s gold. Only one can be damaged at a time; a defeat while one is costs '+pct(SIEGE_FINE)+' of the gold you carry instead (at most about '+SIEGE_FINE_MAX+' clear\'s worth).')])
    +'<p class="group-h">Buildings on the walls</p>'+cxList(Object.keys(BUILD).filter(b=>SIEGE_PERK[b]).map(b=>cxRow(BUILD[b].name,SIEGE_PERK[b].d,'Level '+bl(b)+'/'+BUILD_MAX)))
    +(T_('sieges')?cxP('Sieges fought: '+T_('sieges')+', held: '+T_('siegeWins')+'.'):'');
  if(k==='army') return cxP('The Army tab is the command view over your army and the Reserve. Only its buttons change anything; filters and sorting change only what it shows.')
    +cxList([cxRow('Command','Power (attack x2 plus a quarter of health, added up over the army), damage per turn (the attack of every minion that strikes; menders heal instead), health, and the Reserve\'s power. Below them, one bar per role shows its share of the army; press one to show only that role.'),
      cxRow('Slots','1, plus one per 2.5 Will, one per 4 levels, gear and the Crypt. At most '+ARMY_CAP+', plus the Crypt\'s levels. A raider away overnight keeps its place.'),
      cxRow('Filters and order','Filter by role or show gear-bearers only, and sort the view by power, level, rank or stage. The view moves no one; the Order links re-order the army itself, and Cards or Compact sets how much each minion shows.'),
      cxRow('Gear-bearers','Armed foes (marked Armed) can wear a weapon, armor and relic from your bag once raised. On a minion, attack, strength, crit, Siphon and intelligence add to its attack; HP, constitution, ward, mana and will add to its HP.'),
      cxRow('Quick equip','In town: the best '+QG_N+' pieces in your bag for you, or for any gear-bearer in the army or the Reserve, with what each would change. Give puts it on at once, and what it replaces goes back to your bag.'),
      cxRow('Raid squads','Tonight\'s raid orders and their odds as they stand. The War table sets them.')])
    +'<p class="group-h">Evolution</p>'+cxP('A minion evolves at set levels above the level it was raised at. Each stage adds its own buff and one more trait, and an elite or boss may become a Commander. The Evolution list shows who is closest to the next stage.')
    +cxList(STAGES.slice(1).map((n,i)=>cxRow(n.trim(),fxText(STAGE_FX[i+1])+' and one more trait.','+'+EVOLVE_AT[i+1]+' levels')))
    +'<p class="group-h">Marks</p>'+cxP('At Elder a minion chooses one of two marks for its role. At Eternal it either empowers that mark, doubling its numbers, or takes the other at base strength. A choice never interrupts a fight: it waits for you out of battle, in the Marks section of the Army tab. Fusion keeps the survivor\'s marks; the other\'s are lost.')
    +cxList(MARK_IDS.map(k=>cxRow(MARK[k].name,MARK[k].desc(MARK[k].v)+'. Empowered: '+MARK[k].desc(2*MARK[k].v)+'.',ROLES[MARK[k].role].label)));
  if(k==='reserve') return cxP('A bench beside the army. It opens with the Town tab and holds '+RESERVE_BASE+' minions, +'+RESERVE_CRYPT+' per Crypt level (now '+reserveMax()+').')
    +cxList([cxRow('On the bench','Benched minions do not fight, take damage, heal or earn XP. They keep their gear, traits, level and name, keep up with your Will and gear, and leave the bench at full HP with every wound gone.'),
      cxRow('Moving','Free and instant, in town only: To army, To reserve, or Swap, which trades an army minion and a benched one in one press. The Reserve has its own Order links.'),
      cxRow('Raising into it','When your army is full, the raise screen can raise straight into the Reserve while it has room.'),
      cxRow('Raids','A Commander may take Reserve minions on a raid. Away overnight, each keeps its place in the army or the Reserve, so a siege raise cannot fill it, and steps back in at dawn. If both are full when they come home (a burned Crypt, say), they wait at the gate until you make room or release one. No one is lost.'),
      cxRow('Fusion and gear','The Flesh Pit fuses benched minions too, and Quick equip can arm a benched gear-bearer.'),
      cxRow('Over the limit','A Reserve holding more than its places keeps everyone; it only takes no one new.'),
      cxRow('Loadouts','In town, the Gear tab keeps '+LOADOUT_N+' named loadouts: your worn gear, who stands in the army and who sits in the Reserve, and your ultimate. Use puts it all back as far as it can and names what it could not.')]);
  if(k==='fusion') return cxP('The Flesh Pit on the Town tab fuses two minions of the same role into one, in town. Minions in the Reserve can be fused too.')
    +cxList([cxRow('Who survives','The higher level (on a tie, the higher evolution). It ends '+FUSE_LV+' level above the higher of the two, never past your level + 2, keeps the higher evolution stage of the two, starts its next level afresh and rises at full HP. The new level may make it evolve on the spot.'),
      cxRow('Traits','The survivor keeps its own traits, then takes the other\'s that it lacks until it carries '+FUSE_TRAITS+'. Commander passes only to an elite or a boss.'),
      cxRow('Limit','A minion can take part in at most '+FUSE_MAX+' fusions, counting those its partner already took.'),
      cxRow('Cost',FUSE_GOLD+' gold per level of the two minions together.'),
      cxRow('Gear','The consumed minion\'s gear returns to your bag.'),
      cxRow('Compounds','When a fusion brings together two traits that belong together, they fuse into one compound trait: one slot that counts as both, with something more besides. It happens before the trait limit, and only in the pit. Each trait joins at most one compound, and compounds never fuse further. The pit shows when something new will form.')])
    +'<p class="group-h">Compounds</p>'+cxList(COMPOUNDS.map(([c])=>compoundFound(c)?cxRow(TRAITS[c].name,TRAITS[c].desc+' '+TRAITS[c].story,'Found'):cxRow('???','Two traits that have not yet met in the pit.')));
  if(k==='forge') return cxP('At the Forge (the Market) a boss, Tower warden, secret master or Hunger heart, gold and bone dust forge a heartforged piece: an item of that boss\'s set in the slot you pick, whose bonus lines you choose from the boss\'s six instead of rolling them, at the top of their range. Secret masters and the Hunger give three: two lines and a minor power. Reforging a heartforged piece re-rolls its values, never its lines; a second heart of the same boss swaps one line. The forge warns before it spends a heart a unique you hold still needs to awaken.')
    +cxList(Object.keys(HF_LINES).filter(b=>metName(b)||(S.kills&&S.kills[b])).map(b=>{ const I=hfInfo(b), c=hfCost(b); return cxRow(b,HF_LINES[b].map(k=>'<span>'+statTxt(k,hfLineVal(I,k))+'</span>').join(' &middot; ')+'<br>'+(I.n-(I.pw?1:0))+' lines'+(I.pw?' and a minor power':'')+'. Costs '+c.g+' gold and '+c.d+' dust.'+(I.pw?'<br><b>'+HF_POW[I.pw].name+'</b>: '+HF_POW[I.pw].desc:'')); }))
    +'<p class="group-h">Hell Tower forge</p>'+cxP(TW_FORGE_N+' Tower trophies and '+TW_FORGE_GOLD.toLocaleString()+' gold forge a Throne of Ash piece in the slot you pick, '+Math.round(TW_EXTRA*100)+'% of the time with an extra line.')
    +'<p class="group-h">Late gold</p>'+cxP('Past level '+GOLD_SOFT_LV+' the level part of kill and vault gold grows at a third of its rate: later gold comes from difficulty, curses, pacts and what you sell.');
  if(k==='endings'){ if(!S.lastPage&&!(S.endHist||[]).length) return cxP('The Ledger keeps its last page shut until what waits under Vane Abbey has fallen. Open the drowned door with either of its keys, cross the Scriptorium and end the Hunger, and the book will ask you how it ends.');
    return cxP('When the Hunger falls the Ledger opens at its last page and asks once each cycle. The page waits on the Gates tab: you can answer later, and the gates stay open. Either answer lets you keep playing the cycle; it decides what New Game+ becomes.')
      +cxList(Object.values(ENDINGS).map(E=>cxRow(E.name,'&ldquo;'+E.line+'&rdquo; Title: '+E.title+'. New Game+ becomes '+E.cycle+': '+E.ngp)))
      +'<p class="group-h">Ledger inscriptions</p>'+cxP('Each ending lets you write one inscription you earned in that cycle. Inscriptions are permanent and stay through every New Game+, at most '+INSC_MAX+'.')
      +cxList(INSC_IDS.map(id=>{ const I=INSCRIPTIONS[id]; return cxRow(I.name,'Earned by '+I.need+'. '+I.desc+(hasInsc(id)?' Written.':'')); })); }
  if(k==='records') return cxP('The Records page on the Ledger tab keeps your personal bests through every New Game+. A new best flashes a banner, once per run and kind, but never for a first record.')
    +cxList(REC_NUM.map(r=>cxRow(REC_NAME[r].charAt(0).toUpperCase()+REC_NAME[r].slice(1),CDX_REC[r]||'')).concat([cxRow('Fastest clears','The fewest turns from the first room to the fallen boss, for each gate, on any difficulty.'),
      cxRow('Fastest Rift dives','The fewest turns to clear a dive, for each band of '+RIFT_BAND+' depths. A dive at depth 12 counts for 10 and deeper.'),cxRow('Secret masters','The day you first slew each one.')]))
    +'<p class="group-h">History</p>'+cxP('The History page counts every run: runs, clears, falls, flights, rooms, kills, XP, gold, gear and the dead raised. Its lifetime analytics add your win rate, average turns per clear, favorite gate, bosses slain, Souls harvested and win streak. Each of the last '+HIST_N+' runs opens Details: the boss, your best minion, your level, damage dealt and taken, the biggest hit, the omen, the curse and the difficulty.');
  if(k==='rival') return cxRivalHTML();
  if(k==='trials') return cxTrialsHTML();
  if(k==='bonds') return cxBondsHTML();
  if(k==='chains') return cxChainsHTML();
  if(k==='bounties') return cxP('The board holds up to '+BOUNTY_N+' contracts. It starts full, and each dawn one new contract goes up while there is room; progress counts from then. Contracts never expire and leaving one costs nothing. Claim finished ones in town. Rewards are gold, Grave Salts, bone dust, or a piece of gear from your deepest open gate with bonus lines. Gold and bone dust grow with your level and your deepest open gate.')
    +cxList(Object.keys(BOUNTIES).map(b=>cxRow(BOUNTIES[b].t(BOUNTIES[b].n),BOUNTIES[b].ok?'Only offered once it makes sense for you.':'Can be offered any day.')));
  if(k==='titles'){ const by=g=>TITLES.filter(t=>t.grp===g).length, rc=TIERS.map((n,i)=>TITLES.filter(t=>t.r===i).length+' '+n.toLowerCase()).join(', ');
    return cxP('Titles are earned once and kept forever, even through New Game+. Each gives a small bonus, but only the one you wear counts. There are '+TITLES.length+': '+['Gates','Hell Tower','Curses and events','Deeds'].map(g=>by(g)+' for '+(g==='Hell Tower'?g:g.toLowerCase())).join(', ')+'.')
      +'<p class="group-h">Rarity</p>'+cxP('Titles come in the same rarities as gear: '+rc+'. A rarer title gives a bigger bonus ('+TIERS.map((n,i)=>RARITY_MUL[i]>1?n+' x'+RARITY_MUL[i]:'').filter(Boolean).join(', ')+'). '+TIERS.slice(HIDDEN_FROM).join(', ').replace(/, ([^,]*)$/,' and $1')+' titles stay hidden as "???" until you earn them.')
      +'<p class="group-h">Collection</p>'+cxP('Every '+TCOL_STEP+' titles you have earned add 1% gold from kills, up to +'+TCOL_MAX+'%, whatever you wear. It is not combat power, and it stays through New Game+.')+cxP(titleColTxt(titlesGot())+'.')
      +cxP('The Titles tab filters by earned, locked, close to earning and rarity, and titles that count something show how far along you are.')
      +cxP('Many titles count lifetime deeds that survive New Game+: gate clears and fast clears, Tower floors and climbs, Rift dives, fusions and minion levels, runs under each omen, bestiary mastery, the uniques and gold you hold, and the titles you have earned.')
      +'<p class="group-h">Kinds of title bonus</p>'+cxList((()=>{ const n={}; TITLES.forEach(t=>Object.keys(t.b||{}).forEach(k=>{ n[k]=(n[k]||0)+1; })); return Object.keys(n).sort((a,b)=>n[b]-n[a]).map(k=>{ const L=TBUFF_L[k]||STATL[k], pc=!!TBUFF_L[k], twin=!pc&&Object.values(TBUFF_L).some(x=>x[0]===L[0]);
        return cxRow(L[0]+(pc&&Object.values(STATL).some(x=>x[0]===L[0])?' (percent)':twin?' (flat)':''),pc?(L[2]<0?'Lowers ':'Raises ')+'it by a percent of the total.':'Added like the same stat on gear'+(L[1]?' (in percentage points).':'.'),n[k]+' title'+(n[k]>1?'s':'')); }); })())
      +'<div class="btns"><button class="btn small" data-a="tab" data-k="titles">Open the Titles tab</button></div>'; }
  return '';
}
const cxLow=s=>VIEW.lang==='tr'?s.toLocaleLowerCase('tr'):s.toLowerCase();   // Turkish dotted and dotless i
const cxQuery=()=>{ const q=cxLow(String(ui.cxq||'').trim()); return q.length>=2?q:''; };
const CX_ENT={'&middot;':'·','&amp;':'&','&rarr;':'→','&minus;':'−','&quot;':'"','&#39;':"'",'&lt;':'<','&gt;':'>','&nbsp;':' '};
const cxPlain=x=>cxLow(x.split(/<[^>]+>/).map(t=>{ t=t.replace(/&[a-z#0-9]+;/gi,e=>CX_ENT[e]||' '); return VIEW.lang==='tr'&&/[A-Za-z]/.test(t)?trText(t):t; }).join(' '));   // the text as shown, in the current language
function cxSearchHTML(){   // every row and paragraph of every page that mentions the search, grouped by page
  const q=cxQuery(); let n=0, h='';
  for(const [k,name] of CODEX){ const html=codexSection(k); if(!html) continue;
    const bits=(html.match(/<div class="tt-row cx-row">[\s\S]*?<\/div><\/div><\/div>|<p class="help-p">[\s\S]*?<\/p>/g)||[]).filter(b=>cxPlain(b).includes(q));
    if(!bits.length) continue; n+=bits.length;
    h+='<p class="group-h">'+name+' <button class="linkbtn" data-a="cx" data-k="'+k+'">open page</button></p>'+bits.map(b=>b.startsWith('<p')?b:'<div class="items">'+b+'</div>').join(''); }
  return '<p class="q-note">'+(n?n+' match'+(n>1?'es':'')+' for "'+q.replace(/[&<>]/g,'')+'". <button class="linkbtn" data-a="cxclear">Clear</button>':'Nothing in the Codex mentions "'+q.replace(/[&<>]/g,'')+'". <button class="linkbtn" data-a="cxclear">Clear</button>')+'</p><div class="cx-hits">'+h+'</div>';
}
// "new" on a Codex page whose text changed since this browser last opened it: a small hash per page in localStorage (not in the save).
// Numbers are left out of the hash, so a page is new when rows appear or change, not when a count ticks. The first visit marks nothing.
const CX_SEEN_KEY='lotd-cx-seen', CXS={};
function cxHash(k){ const s=codexSection(k).replace(/\d+/g,''); let h=5381; for(let i=0;i<s.length;i++) h=(h*33)^s.charCodeAt(i); return (h>>>0).toString(36); }
function cxFresh(open){   // marks the open page as read; returns the pages changed since they were last read
  if(!CXS.v){ try{ CXS.v=JSON.parse(localStorage.getItem(CX_SEEN_KEY)||'null'); }catch(e){} if(!CXS.v||typeof CXS.v!=='object') CXS.v=null; }
  const now={}; for(const [k] of CODEX) now[k]=cxHash(k);
  const first=!CXS.v; if(first) CXS.v=Object.assign({},now);
  const fresh=CODEX.map(c=>c[0]).filter(k=>k!==open&&CXS.v[k]!==now[k]);
  if(first||CXS.v[open]!==now[open]){ CXS.v[open]=now[open]; try{ localStorage.setItem(CX_SEEN_KEY,JSON.stringify(CXS.v)); }catch(e){} }
  return fresh;
}
function cxMark(root){   // after the Turkish pass: highlight the search words in the Codex results
  const q=S&&S.mode==='town'&&ui.tab==='codex'&&cxQuery(), box=q&&root&&root.querySelector&&root.querySelector('.cx-hits'); if(!box||typeof document.createTreeWalker!=='function') return;
  const w=document.createTreeWalker(box,4), list=[]; let n; while((n=w.nextNode())) if(cxLow(n.nodeValue).includes(q)) list.push(n);
  for(const t of list){ const v=t.nodeValue, low=cxLow(v), f=document.createDocumentFragment(); let i=0, j;
    if(low.length!==v.length) continue;   // a case change that alters length: leave this one plain
    while((j=low.indexOf(q,i))>=0){ if(j>i) f.appendChild(document.createTextNode(v.slice(i,j))); const m=document.createElement('mark'); m.className='cx-hit'; m.textContent=v.slice(j,j+q.length); f.appendChild(m); i=j+q.length; }
    if(i<v.length) f.appendChild(document.createTextNode(v.slice(i))); t.parentNode.replaceChild(f,t); }
}
function codexHTML(){
  const k=CODEX.some(c=>c[0]===ui.cx)?ui.cx:'basics', name=CODEX.find(c=>c[0]===k)[1];
  return '<section class="win" aria-labelledby="h-cx"><h2 class="win-h" id="h-cx">Codex &middot; '+name+'</h2>'
   +'<input id="cxq" class="cx-q" type="search" data-a="cxq" placeholder="Search every page (poison, armor, Lifedrain...)" aria-label="Search the Codex" value="'+String(ui.cxq||'').replace(/[&"<>]/g,c=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]))+'">'
   +(cxQuery()?cxSearchHTML():(fresh=>'<div class="chips cx-nav" role="tablist">'+CODEX.map(c=>'<button class="btn small'+(c[0]===k?' primary':'')+'" role="tab" data-a="cx" data-k="'+c[0]+'" aria-selected="'+(c[0]===k)+'">'+c[1]+(fresh.includes(c[0])?'<span class="cx-new" title="Changed since you last read it">new</span>':'')+'</button>').join('')+'</div>')(cxFresh(k))
   +codexSection(k))+'</section>';
}
function boonList(k,rank){ return '<ol class="boons">'+BOONS[k].map((b,i)=>'<li class="'+(i<rank?'ok':'dim')+'">'+b.t+'</li>').join('')+'</ol>'; }
function omenCallHTML(id){   // the Pantheon: tomorrow's omen, the calls and the ward (game-pantheon.js)
  const f=forecast(), dv=faithDev(), ch=bl('temple')>=3?'<div class="u-sub"><b>Temple chapel:</b> '+CHAPELS[id].name+': '+CHAPELS[id].d+'.</div>':'';
  if(!f) return ch+'<div class="u-sub"><b>Tomorrow:</b> your god shows you tomorrow\'s omen once a gate is cleared.</div>';
  const used=callUsed(), cost=freeCall()?'free (the Temple)':CALL_COST+' devotion';
  let b='';
  if(id==='dis') b='<button class="btn small" data-a="gcall"'+(canCall()?'':' disabled')+'>'+(profCall()?'Call a random omen &middot; free this week':'Your free call returns in '+(7-(S.day-S.faith.pc))+' days')+'</button>';
  else b=godOmens(id).map(o=>'<button class="btn small" data-a="gcall" data-k="'+o+'"'+(canCall(o)?'':' disabled')+'>Call '+OMENS[o].name+' &middot; '+cost+'</button>').join(' ')
    +(f.id?' <button class="btn small" data-a="gward"'+(canWard()?'':' disabled')+'>Ward it off &middot; '+CALL_COST+' devotion</button>':'');
  return ch+'<div class="u-sub omen-fc"><b>Tomorrow:</b> '+(f.id?'<b>'+OMENS[f.id].name+'</b> <span>'+OMENS[f.id].desc+'</span>':'<span>no omen</span>')+(f.ward?' <span>(You warded off '+OMENS[f.ward].name+'.)</span>':'')+(used?' <span class="dim">You have spoken to your god today.</span>':'')+'</div><div class="btns">'+b+'</div>';
}
function faithHTML(){
  const id=faithOf();
  let h='<p class="group-h">The Pantheon &middot; faith</p>';
  if(!faithOpen()) return h+'<p class="lede">A ring of cracked altars at the edge of town. They will hear an oath once '+OPEN_AT.faith+' gates are cleared, from a necromancer of level '+FAITH_LV+' or more.</p>';
  if(id){ const F=FAITH[id], k=faithRank(), dv=Math.floor(faithDev()), nx=k<DEV_RANKS?(k+1)*DEV_STEP:null, pc=nx?Math.round((dv-k*DEV_STEP)/DEV_STEP*100):100;
    return h+'<div class="items"><div class="tt-row on god-'+id+'"><div><h4>'+F.name+' <span class="u-tag">rank '+k+'/'+DEV_RANKS+'</span></h4><div class="u-sub">'+F.domain+'. '+F.about+'</div>'
      +'<div class="dev-bar" title="'+dv+' devotion"><i style="width:'+pc+'%"></i></div><div class="u-sub">'+(nx?dv+' of '+nx+' devotion for rank '+(k+1)+'.':'Your devotion is complete ('+dv+' points).')+(S.faith.dday===S.day&&S.faith.dd?' Today: +'+Math.round(S.faith.dd)+'.':'')+'</div>'
      +'<div class="u-sub"><b>Vow:</b> '+F.vow+(S.faith.vb===S.day?' <span class="bad">Broken today.</span>':'')+'</div><div class="u-sub"><b>Deeds:</b> '+F.deeds+'</div>'+boonList(id,k)+omenCallHTML(id)+'</div>'
      +'<button class="btn small warn" data-a="renounce"'+(S.gold<renounceCost()?' disabled':'')+'>'+(ui.confirm==='renounce'?'Confirm: renounce for '+renounceCost()+' gold':'Renounce &middot; '+gold(renounceCost()))+'</button></div></div>';
  }
  return h+brief('faith','Swear to a god. Devotion grows with the deeds they like, each rank opens a boon, and each god asks a vow. Renouncing costs gold and starts devotion over.','q-note')+'<div class="items">'
   +GODS.map(k=>{ const F=FAITH[k]; return '<div class="tt-row god-'+k+'"><div><h4>'+F.name+'</h4><div class="u-sub">'+F.domain+'. '+F.about+'</div><div class="u-sub"><b>Vow:</b> '+F.vow+'</div><div class="u-sub"><b>Deeds:</b> '+F.deeds+'</div>'+boonList(k,0)+'</div>'
     +'<button class="btn small primary" data-a="swear" data-k="'+k+'">'+(ui.confirm==='swear'+k?'Confirm the oath':'Swear')+'</button></div>'; }).join('')+'</div>';
}
function buildHTML(){
  const P=S.player;
  let h='<section class="win" aria-labelledby="h-bld"><h2 class="win-h" id="h-bld">The town</h2><h3 class="win-title">You have '+gold(S.gold)+' and '+dust(S.dust||0)+'</h3>'
   +brief('town','Build up the necropolis. Each building has '+BUILD_MAX+' levels and its bonus lasts for the rest of this game. The higher levels need bone dust, which you get by salvaging gear on the Gear tab.','lede');
  if(ui.msg&&ui.msg.mk) h+='<div class="note '+(ui.msg.c||'')+'"><i>Town</i><span>'+ui.msg.m+'</span></div>';
  h+=siegeTownHTML()+dreadHTML();
  const so=siegeOpen(), keys=Object.keys(BUILD).filter(bOpen), sel=keys.includes(ui.bsel)?ui.bsel:sg().dmg||keys[0], list=!!ui.tlist; scThumbs();
  // the village: one painted building per BUILD entry, a button that opens that building's row below; List shows every row at once
  h+='<div class="village gs-vil'+(list?' listed':'')+'" role="group" aria-label="Buildings">'+keys.map(k=>{ const lv=blRaw(k), dmg=sg().dmg===k, c=buildCost(k), can=c&&!dmg&&S.gold>=c[0]&&(S.dust||0)>=c[1];
     return '<button class="vb'+(lv?' built':'')+(dmg?' dmg':'')+(can?' can':'')+'" data-a="bsel" data-k="'+k+'" aria-pressed="'+(!list&&k===sel)+'">'+vbIcon(k,dmg?0:lv)
      +'<span class="vb-n">'+BUILD[k].name+'</span><span class="vb-lv">Level '+lv+'/'+BUILD_MAX+'</span>'+'<span class="vb-st'+(dmg?' bad">Damaged':can?' ok">Can build':'">')+'</span>'+'</button>'; }).join('')
   +'</div><p class="vb-tog"><button class="linkbtn" data-a="bsel" data-k="list" aria-pressed="'+list+'">Show every building as a list</button></p>';
  h+='<div class="items">'+keys.filter(k=>list||k===sel).map(k=>{ const B=BUILD[k], lv=blRaw(k), dmg=sg().dmg===k, c=buildCost(k), can=c&&S.gold>=c[0]&&(S.dust||0)>=c[1];
    return '<div class="tt-row bld'+(dmg?' b-dmg':'')+'"><div><h4>'+B.name+' <span class="u-tag">Level '+lv+'/'+BUILD_MAX+'</span>'+(dmg?' <span class="u-tag bad">Damaged</span>':'')+'</h4>'+(i=>i<0?'<div class="u-sub">'+B.desc+'</div>':detl('b'+k,B.desc.slice(0,i+1),B.desc,'u-sub'))(B.desc.indexOf('. '))+''+(lv?'<div class="u-sub b-now">Now: '+(dmg?'nothing until it is repaired':B.now(lv))+'.</div>'+(so&&SIEGE_PERK[k]?'<div class="u-sub b-siege">Siege: '+(dmg?'nothing until it is repaired':SIEGE_PERK[k].t(lv))+'.</div>':''):'')+'</div>'
     +(dmg?'<span class="u-tag bad">Repair first</span>':c&&!buildReady(k)?'<span class="u-tag">Level 4 waits for the Throne of Ash</span>':c?'<button class="btn small primary" data-a="build" data-k="'+k+'"'+(can?'':' disabled')+'>'+(lv?'Upgrade':'Build')+' &middot; '+gold(c[0])+(c[1]?' + '+dust(c[1]):'')+'</button>':'<span class="u-tag ok">Complete</span>')+'</div>'+bldExtra(k); }).join('')+'</div>';
  h+=faithHTML();
  // flesh pit
  h+='<p class="group-h">The Flesh Pit &middot; fuse two minions</p>'+brief('pit','Two minions of the same role become one. The stronger survives, gains '+FUSE_LV+' level (never past your level + 2), keeps the higher evolution and takes the other\'s traits, up to '+FUSE_TRAITS+'. A minion can take part in at most '+FUSE_MAX+' fusions. The other\'s gear returns to your bag.','q-note');
  const all=S.army.concat(S.reserve||[]), a=ui.fuse!=null&&all.find(m=>m.uid===ui.fuse);   // the Reserve fuses too
  if(all.length<2) h+='<p class="lede">You need at least two minions.</p>';
  else if(!a) h+='<div class="items">'+all.map(m=>{ const pals=all.filter(x=>canFuse(m,x)).length;
      return '<div class="tt-row trow">'+ico(m.kind||m.name,m.rankI,m)+'<div><h4>'+m.nick+' <span class="dim" style="font-size:13px">'+theName(mName(m))+'</span></h4><div class="u-sub">'+ROLES[m.role].label+' &middot; Lv '+m.lvl+' &middot; '+(m.traits||[]).map(t=>TRAITS[t].name).join(', ')+'</div></div>'
       +'<button class="btn small" data-a="fusepick" data-k="'+m.uid+'"'+(pals?'':' disabled title="No other '+ROLES[m.role].label.toLowerCase()+' to fuse with"')+'>Choose</button></div>'; }).join('')+'</div>';
  else{
    h+='<p class="q-note">Fusing <b>'+a.nick+'</b> ('+ROLES[a.role].label+', Lv '+a.lvl+') with: <button class="linkbtn" data-a="fusepick" data-k="'+a.uid+'">change</button></p><div class="items">'
     +all.filter(x=>canFuse(a,x)).map(m=>{ const c=fuseCost(a,m), conf=ui.confirm==='fu'+m.uid;
       return '<div class="tt-row trow">'+ico(m.kind||m.name,m.rankI,m)+'<div><h4>'+m.nick+' <span class="dim" style="font-size:13px">'+theName(mName(m))+'</span></h4><div class="u-sub">Lv '+m.lvl+' &middot; '+(m.traits||[]).map(t=>TRAITS[t].name).join(', ')+'</div>'+fusePrev(a,m)+'</div>'
        +'<button class="btn small '+(conf?'warn':'primary')+'" data-a="fuse" data-k="'+m.uid+'"'+(S.gold<c?' disabled':'')+'>'+(conf?'Confirm: one is consumed':'Fuse &middot; '+gold(c))+'</button></div>'; }).join('')+'</div>';
  }
  return h+'</section>';
}

function fusePrev(a,b){   // exactly which traits the survivor will carry; an unfound compound stays a mystery
  const [k,x]=fuseOrder(a,b), f=fuseTraits(k,x), hid=f.made.some(c=>!compoundFound(c));
  return '<div class="u-sub fu-prev">Becomes: '+(f.tr.map(t=>COMPOUND[t]&&!compoundFound(t)?'???':TRAITS[t].name).join(', ')||'no traits')+(hid?' &middot; <b>Something new will form</b>':'')+'</div>'; }

// ----- What next: the Next objective callout on top (the spine: which gate next, or how to grow strong enough for it), then up to GOAL_N goals
// picked from the game as it stands, each with a button that takes you there. Claims first, then points to spend, then gear, buildings, raids,
// the Trial and the Memorial. Town only.
const betterGear=()=>GEAR_SLOTS.some(sl=>{ const cur=S.equip[sl]; return S.inv.some(it=>{ const d=ITEM[it.id]; return d.slot===sl&&(!cur||d.tier>ITEM[cur.id].tier); }); });
function nextObjective(){   // after the Throne of Ash: its next difficulty, then the Rift, then the Tower
  if(!S||S.mode!=='town') return null;
  const P=S.player, clr=i=>!!(S.ti&&S.ti.clr&&S.ti.clr[i]), beat=i=>(S.heatMax&&S.heatMax[i])||0, o=(t,b,k)=>({t,b,k});
  const ng=DUNGEONS.findIndex((D,i)=>i<GATE_N&&!clr(i));
  if(ng>=0){ const D=DUNGEONS[ng], rec=Math.max(RK[ng].unlock,tierRec(ng,0));
    if(P.lvl>=rec) return o('Clear the '+D.name+' (recommended Lv '+rec+').','Gates','gates|open');
    const pre='Grow stronger for the '+D.name+' (recommended Lv '+rec+'): ', hg=DUNGEONS.map((x,i)=>i).reverse().find(i=>clr(i)&&heatMax(i)>beat(i)&&P.lvl>=tierRec(i,heatMax(i)));
    if(hg!=null) return o(pre+'take on the '+DUNGEONS[hg].name+' on '+HEAT[heatMax(hg)].name+'.','Gates','gates|open');
    if(towerOpen()) return o(pre+'climb the Hell Tower.','Hell Tower','tower');
    if(armyRoom()) return o(pre+'raise more of the dead.','Gates','gates|open');
    if(betterGear()) return o(pre+'wear the better gear in your bag.','Gear','gear');
    return o(pre+'clear the gates you know again.','Gates','gates|open');
  }
  if(abbeyOpen()&&!clr(ABBEY)) return o('Descend into Vane Abbey and face what waits under the book (recommended Lv '+tierRec(ABBEY,0)+').','Gates','gates|open');
  const top=GATE_N-1, h=heatMax(top), heat=o('Break the '+DUNGEONS[top].name+' on '+HEAT[h].name+' (recommended Lv '+tierRec(top,h)+').','Gates','gates|open');
  if(beat(top)<HEAT.length-1&&P.lvl>=tierRec(top,h)) return heat;
  if(riftOpen()) return o('Reach depth '+(riftBest()+1)+' of the Rift.','The Rift','gates|rift');
  if(towerOpen()) return o('Climb the Hell Tower: your best floor is '+S.tower.best+'.'+(P.lvl<RIFT_LV?' The Rift opens at level '+RIFT_LV+'.':''),'Hell Tower','tower');
  return beat(top)<HEAT.length-1?heat:null;
}
const GOAL_N=3;
function goals(){
  if(!S||S.mode!=='town') return [];
  const P=S.player, g=[], add=(t,b,k)=>g.push({t,b,k});
  if(townOpen()&&bounties().some(b=>bountyDone(b)&&!b.claimed)) add('A bounty is ready to claim.','Bounty board','||bounty');
  if(questDone()&&!S.quest.claimed) add('Today\'s quest is done: claim the reward.','Daily quest','||quest');
  if(P.pts>0) add(P.pts+' stat point'+(P.pts>1?'s':'')+' to spend.','Status','||status');
  if(P.sp>0) add(P.sp+' skill point'+(P.sp>1?'s':'')+' to spend.','Skills','skills');
  if(SKILLS.some(s=>SKILL_MODS[s.id]&&sk(s.id)>=SK_MAX&&!skMod(s.id))) add('A rank 3 skill upgrade is waiting for your choice.','Skills','skills');
  if(betterGear()) add('Your bag holds gear of a higher tier than you wear.','Gear','gear');
  if(townOpen()&&Object.keys(BUILD).some(k=>{ const c=buildCost(k); return c&&S.gold>=c[0]&&(S.dust||0)>=c[1]; })) add('You can afford a building.','Town','town');
  if(expOut().length) add(expOut().length===1?'A squad in the field waits for your word.':expOut().length+' squads in the field wait for your word.','War table','gates|war');
  if(raidGates().length&&raidPool().some(m=>isCommander(m)&&!inOrder(m))) add('A Commander is free to lead a raid tonight.','War table','gates|war');
  if(trialOpen()&&trialReady()&&!trialBestWeek()) add('This week\'s Trial is not done yet.','Trial','gates|trial');
  if(raidPool().some(m=>markPend(m))) add('A minion is ready to choose its mark.','Army','army');
  if((S.memorial||[]).some(canHonour)) add('You can honour a fallen minion in the Memorial.','Memorial','mem');
  if(GEAR_SLOTS.some(sl=>S.equip[sl]&&canAwaken(S.equip[sl]))) add('A unique you wear can be awakened.','Gear','gear');
  return g.slice(0,GOAL_N);
}
function goalsHTML(){
  const g=goals(), n=nextObjective(); if(!g.length&&!n) return '';
  return '<section class="win goals'+foldCls('goal')+'" aria-labelledby="h-goal"><h2 class="win-h" id="h-goal">What next<span class="fold-sum">'+(g.length+(n?1:0))+'</span>'+foldBtn('goal')+'</h2>'
   +(n?'<button class="next-obj" data-a="goal" data-k="'+n.k+'"><b>Next objective</b><span>'+n.t+'</span><span class="next-go">'+n.b+'</span></button>':'')
   +'<ul class="goal-list">'+g.map(x=>'<li><span>'+x.t+'</span><button class="btn small" data-a="goal" data-k="'+x.k+'">'+x.b+'</button></li>').join('')+'</ul></section>';
}
function goGoal(k){   // "tab|gate sub-tab|side panel": open the tab, then scroll to the panel after the next render (unfolding it)
  const a=String(k||'').split('|');
  if(a[0]) ACTIONS.tab(a[0]); if(a[1]) ACTIONS.gsub(a[1]);
  const id={bounty:'h-bty',quest:'h-quest',status:'h-status'}[a[2]]; if(id){ ui.goto=id; if(VIEW.fold[a[2]]){ delete VIEW.fold[a[2]]; saveView(); } }
}
// ----- bonds on minion cards and the Army tab, and the Codex pages for bonds and event chains
const bondPct=v=>Math.round(Math.abs(v)*100)+'%';
function bondTags(m){   // plain words for the compact row's title and the card's chips
  const t=[]; if(m.bond) t.push('Bonded: '+bondName(m));
  if(moodOn(m)) t.push(m.mood.k==='v'?'Vengeful: '+m.mood.n:'Grieving: '+m.mood.n); return t;
}
function bondChips(m){
  let h=''; if(m.bond) h+='<span class="trait bond" title="+'+bondPct(BOND_ATK)+' attack while the bond holds">Bonded: '+cleanText(bondName(m))+'</span>';
  if(moodOn(m)) h+=m.mood.k==='v'?'<span class="trait mood-v" title="+'+bondPct(BOND_VENGE)+' attack until dawn">Vengeful: '+cleanText(m.mood.n)+'</span>'
    :'<span class="trait mood-g" title="'+bondPct(BOND_GRIEF)+' less attack for a day">Grieving: '+cleanText(m.mood.n)+'</span>';
  return h;
}
function bondsArmyHTML(){   // the Army tab: every bonded pair, and the pairs closest to bonding
  const P=bondPairs(), N=bondNear().slice(0,3); if(!P.length&&!N.length) return '';
  return '<section class="win bonds-w" aria-labelledby="h-bonds"><h2 class="win-h" id="h-bonds">Bonds</h2>'
   +(P.length?'<div class="items">'+P.map(([a,b])=>'<div class="tt-row"><div><h4>'+cleanText(a.nick)+' &amp; '+cleanText(b.nick)+'</h4><div class="u-sub">Bonded &middot; +'+bondPct(BOND_ATK)+' attack each</div></div></div>').join('')+'</div>':'')
   +(N.length?'<p class="u-sub">'+N.map(x=>cleanText(x.a.nick)+' &amp; '+cleanText(x.b.nick)+': '+x.n+'/'+BOND_ROOMS+' rooms together').join(' &middot; ')+'</p>':'')+'</section>';
}
CODEX.splice(CODEX.findIndex(c=>c[0]==='fusion')+1,0,['bonds','Bonds']);
CODEX.splice(CODEX.findIndex(c=>c[0]==='rooms')+1,0,['chains','Event chains']);
function cxBondsHTML(){
  const P=bondPairs();
  return cxP('Two minions that are both standing in your army at the end of '+BOND_ROOMS+' won rooms become Bonded. Each minion has at most one partner. Rooms only count while both fight in the army: the Reserve, the gate and a raid pause the count, and a new partner starts from nothing.')
   +cxP('A bonded minion hits '+bondPct(BOND_ATK)+' harder for as long as the bond holds. Releasing either one, or fusing one into another minion, breaks the bond.')
   +cxP('When one partner is lost for good, the other takes it hard. If it was in your army in that same fight, it is Vengeful: '+bondPct(BOND_VENGE)+' more attack until dawn. If it was anywhere else (benched, waiting, or the loss came on a raid), it is Grieving: '+bondPct(BOND_GRIEF)+' less attack for a day. Either way it is free to bond again. The Memorial remembers who the fallen was bonded to.')
   +'<p class="group-h">Your bonds</p>'+(P.length?cxList(P.map(([a,b])=>cxRow(cleanText(a.nick)+' &amp; '+cleanText(b.nick),'Bonded'))):cxP('None yet.'));
}
function cxChainsHTML(){
  const st=id=>{ const c=chainSt(id); return !c?'Not begun':c.s==='end'?'Ended':'Waiting'; };
  return cxP('Some meetings between rooms are remembered. What you choose is written in the Ledger, and '+CHAIN_DAYS+' or more days later the chain comes back to you in a gate event, once, and ends there. Walking past a first meeting starts nothing; it may come again. A later meeting you walk past waits for another day.')
   +cxP('What comes back depends on what you chose. The Ledger does not say more.')
   +cxList(CHAIN_IDS.map(id=>cxRow(EVENTS[id].name,EVENTS[id].text,st(id))));
}
function mausNote(){ const n=mausN(); return '<p class="q-note mem-maus-n">'+(n?'Mausoleums: '+n+'/'+MAUS_MAX+'. Your minions have +'+Math.round(n*MAUS_K*100)+'% max HP and attack for good.':'In town you may raise a mausoleum over any name here, at most '+MAUS_MAX+'. Each gives every minion +'+Math.round(MAUS_K*100)+'% max HP and attack for good, kept through New Game+.')+'</p>'; }
const mausBtn=(e,i)=>S.mode==='town'&&!e.maus&&mausN()<MAUS_MAX?'<button class="btn small" data-a="maus" data-k="'+i+'"'+(S.gold<mausCost()?' disabled title="Not enough gold"':'')+'>Mausoleum &middot; '+mausCost()+' gold</button>':'';

// ----- the necropolis grows (game-town2.js): specializations and what each new building lets you do
function bldExtra(k){
  if(!blRaw(k)) return ''; let h=upkeepLine(k);
  if(SPEC[k]){ const done=[3,5].filter(lv=>S.spec&&S.spec[k]&&S.spec[k][lv]).map(lv=>'<b>'+specName(k,lv,S.spec[k][lv])+'</b>: '+SPEC[k][lv][S.spec[k][lv]==='a'?0:1][1]);
    if(done.length) h+='<div class="u-sub b-now">'+done.join(' ')+'</div>';
    for(const lv of specPend(k)) h+='<p class="q-note">Level '+lv+': choose a specialization. It is final for this cycle.</p><div class="btns">'+['a','b'].map((c,i)=>'<button class="btn small" data-a="spec" data-k="'+k+'|'+lv+'|'+c+'" title="'+SPEC[k][lv][i][1]+'">'+SPEC[k][lv][i][0]+'</button>').join('')+'</div>'+'<p class="u-sub">'+SPEC[k][lv].map(x=>'<b>'+x[0]+'</b>: '+x[1]).join(' ')+'</p>'; }
  if(k==='library'&&bl('library')>=2){ const c=respecCost(), rd=respecReady(), conf=ui.confirm==='respec';
    h+='<div class="btns"><button class="btn small'+(conf?' warn':'')+'" data-a="respec"'+(rd&&S.gold>=c.g&&(S.dust||0)>=c.d?'':' disabled')+'>'+(conf?'Confirm: every stat point comes back':'Respec your stats &middot; '+(c.g?gold(c.g)+' + '+dust(c.d):'free the first time'))+'</button>'+(rd?'':'<span class="u-sub">Once every '+RESPEC_DAYS+' days.</span>')+'</div>'; }
  if(k==='embalm'){ const L=S.embalm||[]; h+='<p class="u-sub">Kept bodies '+L.length+'/'+embHold()+'. Each run keeps '+embCap()+'.</p>'+L.map((x,i)=>'<div class="b-row"><span>'+x.c.name+' &middot; Lv '+x.c.lvl+'</span><span class="u-sub">spoils in '+Math.max(0,embDays(bl('embalm'))-(S.day-x.day))+' days</span><button class="btn small primary" data-a="embraise" data-k="'+i+'"'+(armyUsed()<slots()?'':' disabled title="Your army is full"')+'>Raise &middot; '+raiseChanceEmb(x.c)+'%</button></div>').join(''); }
  if(k==='yard'&&hasSpec('yard',5,'b')&&(S.reserve||[]).length) h+='<p class="u-sub">Grave Market: sell a Reserve minion.</p><div class="btns">'+S.reserve.filter(m=>!m.lk).map(m=>'<button class="btn small" data-a="yardsell" data-k="'+m.uid+'">'+m.nick+' &middot; '+gold(Math.round(yardPrice(m)))+'</button>').join('')+'</div>';
  if(k==='temple'&&bl('temple')>=5) h+='<div class="btns"><button class="btn small" data-a="callomen"'+(omenReady()?'':' disabled')+'>Call a new omen'+(omenReady()?'':' &middot; once a week')+'</button></div>';
  return h;
}
function raiseChanceEmb(c){ EMB_RAISING=true; try{ return raiseChance(Object.assign({},c,hasSpec('embalm',5,'b')?{lvl:Math.min(S.player.lvl+2,c.lvl+3)}:{})); } finally{ EMB_RAISING=false; } }
