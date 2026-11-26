# 2. Systems as they work today

Every system on `main` (2026-11-26), with its key rules and numbers and where the code lives. Numbers here are a
snapshot: the constants in `src/` are the truth, and their comments carry the measurement history. When a round changes
a system, update its section here in the same PR.

Contents: [Core loop](#21-the-core-loop) · [The hero](#22-the-hero) · [Combat](#23-combat) · [The army](#24-the-army) ·
[Loot and gear](#25-loot-and-gear) · [Economy and town](#26-economy-and-town) · [Content and modes](#27-content-and-modes) ·
[Meta-progression](#28-meta-progression-and-knowledge) · [Story](#29-story) · [Presentation](#210-presentation-and-ux) ·
[Saves](#211-saves-and-safety) · [Tooling](#212-tooling)

## Unlock timeline

New players meet the game gradually. Most gates are counted in distinct gate clears (`S.ti.clr`), not stored flags.

| When | What opens |
|---|---|
| Start | Rat Warren (E), the Market, Strike / Soul Siphon / Bone Ward, raising (the first raise always succeeds) |
| Level 2+ | Skills, one per level band (Bone Spear at 2 ... Deathless Will at 22) |
| Level 4 / 8 / 12 / 17 / 23 | Gates D / C / B / A / S (Recommended levels 1/5/9/16/19/27, Vane Abbey 31, at the current tuning, `gateRec`) |
| First clear of a gate | Hard difficulty on it (then Brutal, then Nightmare); cursed days and omens start |
| Level 6 (or holding bone dust) | Salvage, enchanting, tempering, Awakening (the workshop, `workOpen`) |
| 2 distinct clears | Town tab: buildings, the Reserve, bounty board, Flesh Pit (fusion) |
| Town + 2 building levels | Siege nights, every 7-10 days |
| 3 distinct clears + level 8 | The Old Shrine (faith) |
| 3 distinct clears + level 10 | The Hell Tower |
| 4 distinct clears | The Rival |
| A raised elite or boss with Commander | Raids (the War table) |
| Level 20 | An ultimate (Souls) |
| Level 30 / 50 | First / second capstone of your main skill path |
| Throne of Ash cleared | Weekly Trials, New Game+, cursed gates rise to near your level |
| Throne cleared + level 40 | The Rift |
| Throne cleared + a key (Tower floor 90 and 20 torn pages, or all six secret masters slain) | Vane Abbey (SS), the seventh gate (R3) |

## 2.1 The core loop

**Days and watches** (`game-player.js`: `endDay`, `closeDay`). Each day has 3 watches (`WATCHES`); a gate run, a Tower
climb, a Rift dive or a Trial costs one. When the last is spent (or you Rest until dawn) night falls: ordered raids march,
then a siege if one is due, then dawn: the quest resets, raids resolve, waiting minions find places, bond moods update,
HP and mana refill, the siege and rival schedules tick, and a new curse, omen, shop stock and bounty arrive lazily.

**Daily quest** (`QUEST`): 8 kills, 4 rooms, 1 clear. Pays 1 stat point and 15% of a level's XP, claimed automatically at
dawn. In practice it is always completed.

**A gate run** (`game-runs.js`: `startRun`, `spawnRoom`, `roomWon`, `descend`). Four rooms; the last holds the boss.
Room 1 has 2 foes, room 2 has 3, later rooms 3-4; the boss brings 2-3 adds. Foe level is the gate's `RK.lv` plus half
the room index (+2 for the boss). At most one mender per room. After each room: XP is banked, loot lands in the bag,
gold and trophies bank, minions get half the room's XP, downed minions shatter or bind back, then the raise screen
(bodies), maybe an event (30%), and the doors. Between rooms you heal 15% HP, 25% mana, minions 20%.

**Doors** (`game-gate-rules.js`: `DOORS`, `rollDoors`, `preRooms`). After each non-boss room you pick from the ordinary
passage plus one or two of: a bloodied arch (foes +25%, gear x2, gold +50%), a quiet ossuary (rest 40%), a sealed vault
(gold and gear). The room behind a fight door is pre-rolled, and the Ledger shows as much of it as your bestiary
knowledge allows (`doorSight`, `doorBoss`).

**Events between rooms** (`EVENTS`, `resolveEvent`): blood shrine (pay 20% HP, +15% damage this gate), pedlar (a potion
at half price), sealed coffer (60% gold and gear, 40% needle trap), wounded straggler (free raise at +25%, or bonus XP),
and faith shrines (Old Gods for the Honored, defiled altar for the Dishonored). **Event chains** (`CHAIN_EV`): three
first meetings (wounded priest, sealed reliquary, deserter) whose choice decides a follow-up two days later.

**Defeat** (`defeat`, `retryRoom`). Falling loses that room's spoils and 15% of a level's XP; downed minions get up at
40%. The defeat recap names the blow that felled you and the answers you had and did not use. **Instant Retry** replays
the room from its start (not for sieges, Trials or a rival room). Fleeing keeps earlier rooms' loot.

**Farming falloff** (`farmK`): on Normal, kill XP, kill gold and the clear bonus fall from full at 8 levels past a gate's
`SAFE` level to half at 20 past. Hard and up, cursed gates, first clears, drops and every other mode pay in full.

## 2.2 The hero

**Stats** (`game-player.js`). Four, +3 points per level, +1 per daily quest; no respec.

| Stat | Gives |
|---|---|
| Strength | Strike (+2.2 per point), crit (+0.5%, cap 15%), Strike armor piercing (1% per 2 points, cap 25%), minion attack +1.3% |
| Constitution | Max HP (+5), damage taken -0.25% (cap 8%), healing received +1.5% (cap 20%), minion max HP +1% |
| Intelligence | Mana (+6), Siphon (+2.8), Bone Ward (+3), skill damage +2%, minion attack +1.2% |
| Will | Mana (+3), army slots (1 per 2.5), raise chance (+1.1%), minion power +2%, shatter chance -1.5% |

**Command** (PR #5, `cmdSync` in `game-player.js`): the army's power is the average attack and max HP of its three
strongest minions (empty places count as nothing). Strike gains 1.5% of that attack per Strength point, Siphon and the
skills built on it 0.5% per Intelligence point, max HP 0.04% of that HP per Constitution point. Measured at each room
start, on the way home and after town actions.

Derived: max HP `(24 + 5 Con + 4 lvl + gear) x Bone Armor x %HP`; Strike `3 + 2.2 Str + lvl + gear`; Siphon
`6 + 2.8 Int + lvl + gear`; army slots `1 + Will x 0.4 + lvl/4 + gear + Crypt` (cap 12 + Crypt). All damage reduction
together is capped at 75% (`DR_CAP`). Leveling needs `64 x lvl^1.85` XP.

**Base actions**: Strike (+3 mana, 10% base crit), Soul Siphon (8 mana, pierces 25% armor, double damage under 30% HP,
heals 35% of damage, harvests a Soul), Bone Ward (6 mana, a shield up to 60% of max HP). Potions (belt of 3 each):
Healing Draught 35% HP and cures, Mana Tonic 40% mana; drinking costs the turn.

**Skills** (`game-skills-market.js`: `SKILLS`). 18 skills, 3 ranks each (rank n needs level `lv + 5(n-1)`), one point per
level, free reset in town. 7 actives (Bone Spear, Dark Mending, Corpse Explosion, Curse of Frailty, Grave Chill, Unholy
Frenzy, Reap) with mana costs and cooldowns that reset each room; 11 passives. At rank 3 each skill offers one of two
upgrades (`SKILL_MODS`, `game-faith-story.js`), each adding a mechanic, not more of the same number.

**Mastery paths and capstones** (`game-progression.js`). Skills belong to four paths: Bone (5 skills), Blood (5),
Frost (4), Rot (4). From level 30 the path with the most points (at least 10) grants its first capstone, from level 50 the
second: Ossuary Ward / Barbed Ossuary, Blood Tithe / Sanguine Covenant, Rime / Deep Winter, Festering / Plague Bloom.

**Souls and ultimates** (`game-phases-town.js`: `ULTS`). Siphon, elite kills and boss kills harvest Souls (max 5, per
run). From level 20 you pick one ultimate: Death's Toll (400% Siphon to all, executes non-bosses under 20%), Unholy
Resurrection (raise all downed, heal, +50% army damage), Soul Prison (freeze all, +30% damage taken).

**Faith** (`game-faith-story.js`: `FAITH`). From level 8 and 3 clears, swear Honored (+10% HP, +25% healing; -8% damage,
-15% gold) or Dishonored (+12% damage, +20% gold; -10% HP, -25% healing). Devotion multiplies the buff x1.5 after 10
days and x2 after 25; at full devotion a blessing: Grace (once per gate run, survive a killing blow at 25%) or Tithe of
Souls (start every run with 3 Souls). Renouncing costs 100 gold per level and resets devotion.

**Titles** (`game-player.js`: `TITLES`). 148 titles, earned once and kept through New Game+. The worn title gives a
small bonus scaled by rarity (Common to Unique; Epic and up hidden until earned). Every 10 titles add 1% gold from kills
(max 10%).

## 2.3 Combat

**Turn order** (`act`). You act; then every minion acts in army order (menders heal the most hurt ally under 85%);
then every foe acts (frozen foes skip, bosses may spend the turn on a move); then hasted follow-ups; then damage over
time ticks; then mana regen (1 + gear + Soul Well) and skill cooldowns.

**Foe strength** (`mobStats`). HP and attack scale with the gate's rank multiplier (`RK`), the mob's factors, `DIFF.hp/atk`,
`DIFF.gate[di]` and level (+16% HP, +12% attack per level). Living foes also get **armor** (`DIFF.armor`, 30% at E to 94%
at S; 85% in the Tower), which blunts every hit you and your minions land, and a per-gate attack multiplier
(`DIFF.foeAtk`, 1.0 at E, 0.9 at D, up to 7.0 at B; lowered at E and D in R1 PR B to pay for kits). Minions use the same formula, so `DIFF.hp/atk/gate` move both sides.

**Rows** (`rowOf`). Front and back. Vanguards, reapers and bosses stand in front; you stand at the back. Melee (vanguards
and reapers) can reach only the other side's front row while it stands; strikers, menders and bosses reach anyone. A
melee minion moved back strikes at half damage.

**Foe intents** (`rollIntent`, `planFoes`). Every foe's next action is rolled at the start of your turn and shown on its
card; it does exactly that unless its target fell or a Taunt pulled it. Known foes (bestiary) also show the action after.
Foes favor vanguards 5:2.

**The Soul Tether** (`TETHER`). While any minion stands in your front row, no single foe blow takes more than 50% of
your max HP after your ward; the sturdiest front-row minion takes the rest. Damage over time is never tethered. This
exists because ~97% of late deaths were one blow at full HP.

**Free orders** (`CMDS`, once per room per role, no turn cost): Taunt (vanguards draw every blow for 2 turns and take
Sundering Blows), Focus (strikers always crit this turn, a focused crit breaks a charging move), Bone Shield (menders
ward you for 150% of their attack), Execute (reapers double damage under 40% HP). **Guard** costs your turn: the next
blow that would kill you lands on a front-row vanguard at 150%.

**Damage types** (`DTYPE`, `hurtFoe(e,d,type)`, `hurtAlly(a,d,type)`, R1 PR A). Every hit is Physical, Shadow, Frost, Fire or
Rot. Strike, Bone Spear, Echo, Cleave, Hellfire, Thorns, marks and plain minion hits are physical; Siphon, Chorus, Reap,
Death's Toll and Bloodfiend shadow; Grave Chill, Deep Winter, Rimeborn/Glaciermaul frost; burns, Cinderborn/Pyreheart fire
(Shatterwrought alternates frost and fire); Corpse Explosion, poison, blight and Venomous/Necrotic/Plaguebearer/Witchrot rot;
bleeding physical. Where foes stand sets their profile (`GATE_RES`, `TOWER_RES`, `riftRes(depth)`, `SIEGE_RES`): one
weakness (+25% taken) and one or two resistances (-25%, strong -50%), applied once in `hurtFoe` after armor and before
shields (`foeRes`, cap 90%). Iron Rain adds 15% physical resistance; Soul Storm +10% to your shadow damage. Foe strikers hit
with their place's type (`GATE_HITS`), vanguards and menders physical; Frost-touched elites hit frost and chill, Burning
elites hit fire and burn; Cinder Wave and Volatile bodies are fire. Your side resists through armor bonus lines
(`fres/frres/rres/sres`, up to `RES_CAP` 50%) and typed minion traits (Rimeborn frost, Cinderborn fire, Venomous/Necrotic
rot, 25%); weapons and relics roll `fdmg/frdmg/rdmg/sdmg` (+% of that type for you and your army). Gate cards, the Tower and
Rift cards and the battle header show the profile; Codex page "Damage types".

**Foe kits** (`KITS`, `KIT_OF`, src/game-kits.js, R1 PR B). Every foe kind (not bosses, the rival or secret masters) has one of
sixteen kits, and no gate repeats one: Shieldbearer (shields the most hurt foe every second turn), Ambusher (first blow
ignores rows, +30%), Mana thief (drains 10% max mana), Gravecaller (calls a fallen body back at 40% once a fight; the
second death pays nothing), Pack hunter (+10% per other foe, max +30%), Bomber (bursts 40% of its attack as fire on your
front row unless killed frozen or reaped), Sapper (tears ward and minion ward twice as fast), Skirmisher (steps back below
half HP), Bulwark stance (50% less damage every other turn; Sundered cannot brace), Hexer (hexes 1 time in 3), Marker
(every third turn marks a minion that every foe in reach then strikes; Taunt overrides), Purifier (cleanses a foe with
two or more wounds and conditions), Burrower (under every third turn, out of reach of single blows, surfaces +50%),
Thorned (reflects 15% of melee hits), Frenzy (+15% per fallen foe), Banner-bearer (back row; others deal +10% and take
-10%). Kits act through intents (`kitIntent`: shield, cleanse, call, burrow, mark), the blow (`kitAtk`), the hit
(`kitOnHit`), damage taken (`kitTaken`), death (`kitDeath`) and the row (`kitBack`). The card shows "Kit ?" until the kind
is Studied, then the kit and its rule; Known adds its state this turn, Ledgered the answer (`kitChip`). Door lore lists the
kits behind a door. Codex page "Foe kits". Glass Sentinels are also weak to physical (`KIND_RES`).

**Statuses** (`DOTS`, `CONDS`). Damage over time: poison, bleed (enemy striker crits), burn (Cinder Wave, Cinderborn),
blight (halves healing received). Conditions: Sundered (+25% damage taken), Hexed (-20% damage dealt), Hasted (a 50%
follow-up strike), Chilled (+20% damage taken). **Combos** (`COMBOS`): Frostbreak, Spreading Rot, Fizzle, Breach, Swift
Blow.

**Bosses** (`BOSS_ABIL`, `BOSS_KIT`, `checkPhase`, src/game-boss-kits.js since R2 PR A). Each gate boss fights with a move
set: two or three moves on a rotation (`e.kit`, `e.kitIx`; `e.abil` is always the next move), each at its own pace, shown
on the card ("Next: X", and the one after from Known). The Rat King: Call the Swarm, Gnaw (bleeds). The Crypt Warden: Bone
Wall, Keymaster's Lock (telegraphed: your strongest minion can't act or be hit for 2 turns), Shield Bash (sunders). The
Ember Knight: Cinder Wave, Burning Ground (front row burns 3 turns), Ember Lance (telegraphed, fire at your back row). The
Bishop of Teeth: Hymn of Silence, Tithe of Teeth (20% of your mana, mends 8%), Bite of Faith (hexes). The Orchard Mother:
Seedfall, Iron Thorns (roots and rots a minion), Graft (drinks a seedling, mends 10%; skipped without one). The Pale
Sovereign: Royal Decree, Court Summons (two Throne Guards), Edict of Ash (telegraphed: names your strongest minion and
executes it unless Guard or Taunt puts another vanguard under it, or a freeze breaks it). Each has a personal resistance
entry (`e.res`) and a second phase of its own at 50% (65% on Brutal) instead of Sundering Blow (`TWISTS`): Crown of Rats
(Swarm calls three Pack hunters), The Last Watch (reflects 20% onto the striker while a Bone Wall shield stands), Let It
Burn (immune to fire, +25% frost, Cinder Wave every second move), The Choir Answers (its adds Hasted while you are
silenced), Bloom (seedlings mature into Thorn Trolls after two turns), What the Book Gave Me (every third move turns your
last skill on you). Hazards (`HAZARDS`, while the boss stands): Smoke (Ember Knight, Bone Ward -20%), Echoing nave (Bishop,
first skill costs double), Roots (Orchard Mother, back-row minions take 5% rot a turn). The Inquisitor Captain: Royal
Decree, Purge, Rally. The rival: Royal Decree plus a move from the main role of the bodies they stole (Bone Rampart, Called
Shot, Black Mass, Harvest), named in the warning. Telegraphed moves charge a turn ahead and can be broken by a freeze or a
focused crit. The Rat King keeps one phase on Normal. Secret masters (R2 PR B) have their own kits and enter in phase
two, alternating their moves with Sundering Blow; at half HP a second rule wakes (`HALVES`): the Plague Matriarch (Brood
mites that burst into poison, Plague Breath, Feed; immune to poison; The Swarm Remembers), the Drowned Abbot (Drown,
Litany, a tide that floods the room at 5 unless frozen; Undertow), the Cinder Wyrm (Breath Line, Molten Scales, Tail
Sweep; immune to fire; Wyrmfire), the Choir Eternal (Verse of Binding, Crescendo, Echoes; Last Note), the Rootking
(Spreading Roots, Heartwood, regrowth unless it rots; Deep Roots), the Nameless Sovereign (the mirror, Unwriting, Decree of
Nothing; The Name). Tower wardens carry a signature (`WARDEN_SIG`: Three Heads, Moth Light, Confession, Swarm Cloud, Dirge,
Chain, Mark for the Block, Infernal Bargain, Halo) beside the gate move they borrow and keep Sundering Blow in phase two;
Abaddon rotates every signature and The Other Half (steals your Souls); abyssal wardens roll two signatures. Titles: one
per gate boss for beating its twist without a minion falling (`ub_*`), and Ten Faces (every warden beaten after showing its
signature). Ledgered boss doors show the whole kit and each move's answer;
Codex page "Bosses" is generated from `BOSS_KIT`.

**Elite affixes** (`AFFIX`): Shielded, Splitting, Vampiric, Enraged, Warded, Plaguebearer, Sundering, Hexing, Swift,
Frost-touched (raises Rimeborn), Burning (raises Cinderborn). One
per elite (two from the B gate and Tower floor 50). A raised elite keeps one as a trait. 10% of foes are elite.

**Unique powers** (`FLAGS`): each unique has a flag (Bone Bank, Echo, Undying, Lifedrain, Soul Harvest, Cheap Dead,
Headsman, Thorns, Censer, Swarmguard, Chorus, Bind Souls, Wide Arc, Infernal, Halo, Ruin, Hellfire, Deathless).

## 2.4 The army

**Raising** (`raiseChance`, `tryRaise`). Every kill leaves a body. Raising costs mana (`8 + 3 x rank`, +4 for a boss) and
rolls: base 18% + 1.1% per Will + gear + 4% per Master of Bones rank + 3% per Ossuary level + omen + 3% per level you
stand above the body - the gate's rank penalty (0 to 20), -10% for an elite, -15% for a boss and -10% more per boss you
already own, + bestiary mastery + the corpse condition; clamped 1-80% (Grave Salts add 20%, up to 95%). **One soul per
boss**: while a body of a boss serves you anywhere, another of that boss will not rise. Bodies can also go straight to the
Reserve when the army is full. "Raise best" tries every body in value order.

**Roles** (`ROLES`): Vanguard (draws blows, sometimes sunders), Striker (25% crit for 1.8x), Mender (heals instead of
striking), Reaper (cleaves a second foe for half). Minion stats follow `mobStats` at their level, times Will, minion
power, gear, traits, stage, Constitution, bonds, headstones and mausoleums (`syncMinion`). Minions level with half of a
room's XP, never past your level + 2.

**Traits** (`TRAITS`). Every minion rises with one (bosses two): 9 common traits (Thick-boned, Vicious, Frenzied,
Leeching, Stalwart, Grave-bound, Venomous, Wrathful, Warded), or the elite's affix trait (Necrotic, Crushing, Hexing,
Swift...), or a **death trait** from how its body died (`CORPSE_CONDS`: Preserved = frozen -> Rimeborn, Clean = reaped ->
Unmarred, Rotten -> Necrotic, Tainted -> Venomous, Charred -> Cinderborn, Mangled -> Stitched; each also moves the raise
chance). **Commander** comes only to raised elites (20%) and bosses (40%), at the raise or at an evolution.

**The Undone** (`CORPSE_CONDS.undone`, `ECHO`, R1 PR B). A foe killed by damage of a type its place is weak to leaves an
Undone body (+10 raise; after the DoT conditions in `deathCond`), which rises with the `undone` trait and an echo of its
kind's kit, read from `m.kind` (`echoOf`): Shieldbearer (every second turn wards the most hurt minion for 9% of its HP),
Pack hunter (+6% per other minion of its gate, max +18%), Bulwark stance (30% less damage every other turn), Thorned
(reflects 9% of melee hits), Frenzy (+9% per fallen foe this fight), Banner-bearer (your other minions +6%), Marker (its
first hit each room marks the target: +15% from your minions next turn), Gravecaller (once a room the first minion to fall
gets up at 25%). Other kits give +10% damage (`ECHO_PLAIN`). Minion cards show "Echo: <kit>".

**Evolution** (`checkEvolve`). At 5, 10, 18 and 28 levels above its raise level a minion becomes Greater, Elder, Ancient,
then Eternal: more HP and attack and one more trait each time. **Evolution marks** (`MARK`): at Elder a minion picks one of
its role's two marks (Bulwark / Spiked, Marksman / Volley, Warden / Purifier, Butcher / Harvester); at Eternal it
empowers that mark or takes the other.

**Fusion** (the Flesh Pit, `fuse`). Two minions of one role become one: the stronger survives, gains a level, keeps the
higher stage and takes the other's traits up to three. A minion takes at most two fusions. 12 **compound traits**
(`COMPOUNDS`) form only when a fusion brings both halves of a recipe together (Plaguebearer, Shatterwrought, Patchwork,
Pristine, Blur, Bloodfiend, Ironbound, Bonebreaker, Witchrot, Deathless Husk, Glaciermaul, Pyreheart).

**Gear-bearers** (`ARMED`). One armed kind per gate (two in the Tower) keeps weapon, armor and relic slots once raised;
gear converts to minion attack and HP (`gearBonus`).

**Bonds** (`BOND_ROOMS`). Two minions alive together through 25 won rooms bond (+5% attack). When one is lost the other is
Vengeful (+15% until dawn) if it saw it, else Grieving (-10% through a day).

**Shattering and the Memorial**. A minion downed in a fight shatters afterwards at 50% - 1% per Will (min 20%; never in
sieges, never with Grave-bound or Bone Bank; `shatterOdds`), else binds back at 40% (`BIND_HP`). A downed minion's card in
battle shows its odds, and the screen after the fight opens with who shattered and who bound back (2026-11-26: the old
25% - 1.5%/Will, min 5% read as "my dead came back"; the bots replace the extra losses with ~15% more raises and clear
as often). The lost are written into the **Memorial** (200
names). Once a day you may honour a fallen evolved minion (+5% max HP to the army until dawn). **Headstones**: an
uncapped gold sink, each tier adds about 0.5% army max HP, softly capped at 6%. **Mausoleums**: 5 at most (5k to 40k),
each +2% army HP and attack for good.

**The Reserve** (`RESERVE_BASE`). A bench of 6 places (+2 per Crypt level) beside the army. Benched minions do not fight,
heal, earn XP or bond. **Loadouts**: three named setups of worn gear, army, Reserve and ultimate.

**Raids** (`sendRaid`, `resolveRaid`). A Commander leads a squad (1 + 2 + stage + boss bonus) against a cleared gate on
Normal. Ordered in town, the squad fights with you until nightfall, then marches; odds come from the squad's attack and
HP against the gate's (5-95%). Win: 3x gold, up to three pieces of gear, half a level of minion XP. Loss: each follower
may fall (30%). About 77-78% are won by the bot.

## 2.5 Loot and gear

**Items** (`ITEM`). Three slots (weapon, armor, relic). Each gate has a set of 7 pieces (two weapons, two armors, three
relics) at its tier: Common, Uncommon, Rare, Epic, Legendary, Legendary (the Throne). 42 ordinary pieces, 6 gate uniques
(one per boss, rare drop) and 12 Tower uniques (one per warden, three at floor 100). Uniques carry a power flag.

**Drops** (`tableFor`, `rollDrops`). Ordinary foes drop 28%, elites 65%, bosses 100% + 60%. A gate leans on its own tier
and sometimes the next; bosses and elites lean higher; each enemy has a signature piece (x4) and a role bias. A unique you
already own becomes ordinary gear instead. Secret masters leave two legendaries.

**Bonus lines** (`rollItem`). Every non-unique piece may roll 1-3 extra stat lines by tier. **Reforge** (gold) re-rolls
all lines; **enchant** (bone dust) adds or re-rolls one; **temper** (gold, growing x1.5 per temper) moves a line 25% toward
its best roll. **Salvage** breaks gear into bone dust. **Locks** protect pieces from bulk actions.

**Sets** (`SET_BONUS`, `USET`). 2 or 3 pieces of one gate's set give a bonus; the 18 uniques form six unique sets of three
with bigger bonuses.

**Awakening** (`AWAKEN_*`). A unique can be ranked up 5 times (+8% of its own stats each) for gold (doubling), bone
dust and its boss's hearts (1 to 5). Five ranks of a Throne unique cost ~250k gold. New Game+ carries one unique with
its ranks.

**Bag**: 30 slots, +5 per upgrade (four upgrades, 250 to 3500 gold).

## 2.6 Economy and town

**Gold** comes from kills (scaled by level, rank, boss/elite, curse, difficulty, gold bonuses), vaults, coffers,
bounties, raids, sieges, Trials and selling. **Trophies** (72 kinds) drop from kills into a pouch: sell, forge 6 points
of one gate (a heart counts 5) into a piece of that gate's gear (20% masterwork from the next set), or brew any 4 into a
potion. Boss hearts also pay for Awakening. **Bone dust** comes from salvage, bounties, sieges, Trials and the Bone
Harvest omen.

**The Market** (`marketHTML`): 4 pieces of stock a day from your top two gates, potions, Grave Salts (max 3), bag
upgrades, and the Bone Altar (pay gold to level a minion, up to your level + 2).

**Buildings** (`BUILD`): Crypt (+1 army slot and cap, +2 Reserve), Forge (reforge and enchant 15% cheaper), Ossuary
(+3% raise chance), Altar (+5% mana, Bone Altar 12% cheaper). Three levels each (1.5k / 5k + 30 dust / 14k + 90 dust).

**Bounty board** (`BOUNTIES`): up to 3 contracts, one new each dawn, never expiring: kills, elites, raises, rooms,
bosses, the cursed gate, a flawless clear, arches, orders, Tower floors, poisonings. Pay gold, salts, dust or gear,
growing with your deepest gate.

**Sinks, in the order a player meets them**: potions and salts, bag, Bone Altar, reforging, buildings, fusion,
tempering, honour, Awakening, mausoleums, headstones (the only uncapped one).

## 2.7 Content and modes

**The six gates** (`DUNGEONS`): Rat Warren (E, the Rat King: Call the Swarm), Sunken Crypt (D, the Crypt Warden: Bone
Wall), Ashen Barrow (C, the Ember Knight: Cinder Wave), Hollow Cathedral (B, the Bishop of Teeth: Hymn of Silence), Iron
Orchard (A, the Orchard Mother: Seedfall), Throne of Ash (S, the Pale Sovereign: Royal Decree). Each has 7 foe kinds (two
of each role plus a gear-bearer), sharing their role's stat factors; each kind has a foe kit (2.3).

**Vane Abbey, the seventh gate** (`ABBEY`=6, rank SS, src/game-abbey.js, R3 PR A). Its card shows once the Throne of Ash
falls, as a sealed door with two key slots (`ABBEY_KEYS`): the deep route (Throne cleared, Tower floor `ABBEY_TOWER` 90,
`ABBEY_PAGES` 20 torn pages) or the secret route (Throne cleared, all six secret masters slain). Either key opens it for
the cycle (`S.abbey`). `GATE_N`=6 keeps every "the six gates" rule (curses, raids, the rival, Trials, the Rift, shop
stock, `topGate`, gate-count titles) on the valley's gates. Five rooms: three fights, the **Scriptorium** (a quiet door:
cross out one minion of the army or Reserve for good, not to the Memorial; the Hunger then calls one echo fewer and every
minion of yours carries its best trait in the boss room) and the boss. Seven kinds (one mender, two reapers) with two
abbey-only kits: **Unwritten** (Ink Wraith: a minion's blow passes through unless a skill or your Siphon struck it this
turn) and **Recitation** (Chained Lector: reads your strongest minion's best trait aloud; the minion loses it and the
Lector hits 25% harder until it dies). The boss, **the Hunger**, has three pages at 100/60/30% HP, each with its own
three moves (the boss-kit engine): The Blank Page (immune to shadow, mends 3% a turn unless fire hit it), The Remembered
(calls up to three of your fallen from the Memorial as gold-ink echoes at 60%, three plague-year stand-ins for an empty
Memorial; it takes 50% less while one stands; a minion bonded to an echo will not strike it and hits the Hunger 30%
harder) and The Last Entry (Write Your Name sets you to 1 HP unless warded or frozen, Devour the Margin eats your
strongest minion once unless Guarded; after six of your actions the book runs out and you win). Loot: the Scribe's
Regalia (legendary set; 3 pieces give Marginalia: every third skill is free and lands as the target's weakest damage
type) and Oswin's Ledger-Chain (+1% minion stats per headstone, up to 20%; a downed minion's last blow comes back as a
free Bone Spear once a room). Eight titles (Riverturner, Scriptor, Echo-Breaker, Unwritten, Seven Seals, The Last Keeper, The Hand That Writes, Both
Endings).

**The last page** (R3 PR B, game-abbey.js). When the Hunger falls the Gates tab shows the Ledger's last page (it can be
put off; a banner waits). **Close the book** or **Keep writing** sets `S.ending` (once a cycle; `S.endHist` keeps every
ending), unlocks its epilogue (*The quiet valley* or *The open book*, with a closing paragraph varied by your oath, the
rival, the Memorial's size and an Eternal in the army) and its title. Each ending writes one **Ledger inscription**
earned that cycle (`INSCRIPTIONS`, permanent, at most 5): Of the Many (300 raises: +3% raise chance), Of the Fallen
(20 headstones: +1% army max HP per Memorial name, up to 10%), Of the Tower (floor 100: the Tower can start at floor
11), Of the Masters (all six masters: their hearts drop one more), Of the Faithful (an oath held at full devotion with no
renouncing: a new oath starts at the second rank), Of the Rival (5 wins: thefts come half as often). New Game+ after an
ending: **the Quiet Valley** (foes x0.85, no raising until the cycle's first gate clear, then *The book stirs*) or **the
Keeper's Cycle** (one random gate boss in Ledger form: phase two from the start, heart x2; a third abbey key, the
remembered way: the Throne and any one other key part).

**Sweep** (`sweepOk`, `sweep`, R1 PR B). A gate cleared on Normal at least 5 times (`SWEEP_CLEARS`), Normal and uncursed
today, with you at least 12 levels above its Recommended level (`SWEEP_LV`) and no rival there, offers Sweep on its card:
one watch wins the whole run at once (rooms generated and won as usual, quiet rooms passed), with kill XP at 80%
(`SWEEP_XP`), gold, trophies, drops, bestiary and quest kills, but nothing to raise, no events or doors and no
fastest-clear record. A secret master stops the sweep at the boss room and is fought as usual.

**Gate difficulty** (`HEAT`). After a clear: Hard (foes x1.8, elites doubled), Brutal (x2.5, boss phase at 65%, an affix
on every front-row foe), Nightmare (x3.6, an elite in every room, bosses start in phase two). Rewards rise with it; each
tier's Recommended level is modeled (`tierRec`).

**Cursed gates** (`MODS`): each day one cleared gate is cursed (Volatile dead, Drought, Fury, Bulwark, Horde): harder
(+15% foes), double gold and trophies, +25% XP, +50% gear. After the Throne, cursed foes rise to 5 levels below you.

**Omens** (`OMENS`): 25% of days once a gate is cleared: Blood Moon, Pale Tide, Ashfall, Black Eclipse, Bone Harvest,
Iron Rain, Soul Storm. They touch every gate and the Tower, never sieges or Trials.

**Secret masters** (`SECRET`). A cleared gate's boss room very rarely (1%, +1% per difficulty tier, +0.05% per boss room
since the last) holds an older master: 3.5x HP growing with your level, 1.7x attack, second phase from turn one, x4
rewards, two legendaries, a red-ink title. After 10 clears the Ledger hints at it.

**The Hell Tower** (`TW`). 100 floors, one fight each, a warden every 10th floor with a unique, checkpoints every 10;
endless "abyssal" floors past 100 pay gold and a legendary. Foes grow every floor (faster past 60). Bot curve: floor ~43
on day 35, ~68 on day 60, ~78 on day 100 (market); ~88 (full).

**The Rift** (`RIFT_*`). From level 40 after the Throne. Depth n: five rooms of a random gate's dead at the Throne's
strength, at your level + n/3, x(1 + 0.3(n-1)). A new deepest depth leaves a legendary. Bot: depth ~31 (market), ~13
(full; the full bot spends its days elsewhere).

**Weekly Trials** (`TRIAL_*`, `game-rival-trials.js`). After the Throne: each week a seeded cleared gate on a fixed tier
with one or two curses, the same rooms for every attempt, once a day, no doors, raising or loot. Foes fight at the
Throne's strength. Score = turns + 5 per minion downed; the first completion pays a clear's gold and dust, a score at or
under par 8 pays 1-3 of that boss's hearts once a week.

**Siege nights** (`SIEGE_*`). Once the town has 2 building levels, the living march every 7-10 days (warned the dawn
before). Three waves (militia, crossbowmen, chaplains, witch-hunters, then the Inquisitor Captain with Royal Decree);
foes x2.2 HP, x2.5 attack. You pick a building to guard and up to 2 Reserve minions for the wall; each building lends a
perk. Win: ~1.5 clears of gold, dust, gear. Loss: a building is damaged (off until repaired) or a 10% gold fine. Bot
holds 84-86%.

**The Rival** (`RIVAL_*`). After 4 distinct clears a rival keeper (one of six names) appears. Every 2-6 days they steal
the best body of the role your army leans on; about every two weeks (warned a day ahead) they wait in a cleared gate's
boss room with 2-4 followers, fielding the bodies they stole. They grow 10% per win of yours. Beat them: a legendary,
x2 gold, a stolen page back, the next challenge pushed back. Lose: they borrow a torn page or 10% gold. Bot wins ~68-79%.

**New Game+** (`startNGP`). After the Throne: start again at level 1 keeping titles, bestiary, tips, lifetime counts,
story, records, pages, Rift best, Memorial, rival name and record, and one unique (with its Awakening ranks). Foes +30%
per cycle, rewards +25%. Up to 3 of 7 **pacts** (`PACTS`) make the cycle harder for more XP, gold and drops.

## 2.8 Meta-progression and knowledge

**Bestiary mastery** (`MASTERY`). Kills of each kind climb Studied (25: drop table), Known (75, bosses 6: +2% raise,
the foe's second intent, door sight), Mastered (180 / 15: +4% raise, +3% damage, damage figures on cards), Ledgered
(450 / 35: +5% raise, +4% damage, bodies rise a level higher, the answers to its blows). Kept through New Game+.

**Records** (`REC_NAME`): biggest hit, most kills, most gold, deepest floor, deepest Rift, fastest climbs and clears,
streaks, most damage survived, highest minion level, most traits on a fused minion, most gold held. **History**: the last
20 runs with details, plus lifetime analytics.

**The Codex** (`ui-codex.js`): every rule and list, generated from the game's own tables, searchable. **What next**:
a next-objective callout and goals. **Tips**: 36 first-time tips, one at a time.

## 2.9 Story

Six acts told by the Ledger (`STORY`, 60 passages; act VI is Vane Abbey's): first clears of each gate and Tower milestones, plus milestone
passages (first raise, first fall, oaths, the town, curses, evolutions, raids, sieges, the Rift, the rival...). **Torn
pages** (`LORE_PAGES`, 23): the Ledger's history from Oswin Vane to the blank page, found in order from bosses, wardens,
elites, coffers and secret masters, each waiting for its level (page i at level 2 + 3i); the last three lie only in Vane Abbey. Bosses speak on entry, phase and
death. The story builds to a choice ("write your own name and close the book, or keep writing"), made on the last page after
the Hunger (2.7).

## 2.10 Presentation and UX

- **Look**: worn and textured (the "Grim realism pass"): 64x64 painted SVG icons through a paint filter, natural
  material colors per creature (`MAT`), rank on the frame only; hand-detailed bosses and Necromancer; painted backdrops
  per place; boss arenas; gate tiles and the village strip as small paintings.
- **Battle stage** (`fx.js`): a PixiJS 8 layer (vendored, loaded at runtime) draws big fighters from their icons on the
  painted scene, plus short effects; off without PixiJS, on Light effects or reduced motion, where cards show instead.
- **Sound and music** (`scenes.js`): synthesized Web Audio effects and per-place themes; no audio files.
- **Tabs**: Gates (with Tower, Rift, Trial and War table views), Army, Gear, Market, Skills, Town, Codex, the Ledger
  (Bestiary, Titles, Lore, Records, History, Memorial), Help, Settings. Keyboard shortcuts for every action (`?` lists them).
- **Language**: English in the page, Turkish laid over it after each render (`tr.js`, ~2,450 lines of `TR_DICT` and
  `TR_RX`). Every new string needs a Turkish entry.
- **Display settings**: text size, reduced motion, high contrast, light effects (per browser).

## 2.11 Saves and safety

Autosave to `localStorage` after every action (`save`); closing the tab mid-run counts as walking out. Three save slots,
three daily backups, save codes and save files. Every load goes through `normalizeSave` (repairs, migrates, strips markup
from pasted codes). A second open tab stops saving until reload. An unreadable save is kept under `-broken`.

## 2.12 Tooling

- `node tools/build.js` builds `index.html` from `src/` (`--check` in CI); `node tools/serve.js` serves and rebuilds.
- `node tests/run-tests.js`: 663 tests in Node with a fake browser, a lint pass and a 30-day bot playthrough.
- `node tests/fuzz.js`: random clicks with invariant checks (12 seeds in CI).
- `node tests/run-balance.js`: the balance bot (modes `market` and `full`, options for seeds, stats, skill upgrades,
  switching systems off, tier probes, by-level curves). See [04-balance.md](04-balance.md).
- `node tools/perf.js`: rough render timings.
