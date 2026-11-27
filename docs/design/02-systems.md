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
| 3 distinct clears + level 8 | The Pantheon (faith) |
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
dawn. Once a building stands it gives way to **daily orders** (`src/game-dread.js`, `S.orders`): three drawn each dawn from
a hash of the day (a Hunt about 60% of days; Plunder in Terror), you take one in town, and it pays once with 15% of a
level: Hunt (clear the deepest gate or the one above it: +1 stat point), Harvest (raise 3 of a role: bone dust), Clean
kill (a room with no minion downed: +5% raise chance tomorrow), Stand watch (spend a watch: the Charnel Yard trains
twice), Tribute (fill a commission: dread -5), Climb (3 Tower floors: a Tower trophy), Old debt (claim a bounty: half its
gold again), Plunder (half a siege's gold at once, dread +8).

**The town's dread** (`S.dread`, 0-100 from 30, once sieges begin): raises in the gates +0.1 each, a raid won on gates
E-D +3, a building level +2, a siege lost +10, unpaid upkeep +1; a siege won -6 (Toll of the Dead -12), a commission -3,
a tithe at the Old Shrine (5% of held gold, once a day) -5; each dawn a point toward 40. Bands (`DREAD_BANDS`): Calm
(0-19: prices -10%, pedlars twice as common, sieges every 9-12 days and 10% weaker, weekly mourners bring a body to the
Embalmery), Uneasy (20-49: as before), Afraid (50-79: prices +10%, sieges every 6-9 days, 10% stronger, pay +15%, a
weekly tribute), Terror (80+: prices +25%, no black market, sieges every 5-7 days, 15% stronger, the Captain brings two
elites, pay +30%, the Plunder order). **Upkeep**: each building level past 2 costs 15 gold x (deepest gate + 1) at dawn;
one that cannot be paid loses its top level (and a level-5 pick) until a dawn pays it.

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
and faith shrines (one per god: Morrow's, Vesh's, Ulm's, the Choir's and the Profane's defiled altar, plus a shrine to a god not your own that offers conversion). **Event chains** (`CHAIN_EV`): three
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

**Skills** (`game-skills-market.js`: `SKILLS`). 20 skills, 3 ranks each (rank n needs level `lv + 5(n-1)`), one point per
level, free reset in town. 8 actives (Bone Spear, Dark Mending, Corpse Explosion, Curse of Frailty, Grave Chill, Unholy
Frenzy, Reap, Hoarfrost Lance) with mana costs and cooldowns that reset each room; 12 passives (Pestilence, R11, makes wounds
on a foe tick harder per wound). Five ultimates (Death's Toll, Unholy Resurrection, Soul Prison, Requiem, The Long Name).
**Endurance** (R11, `game-builds.js`): past turn 5, Constitution adds damage every turn, up to +25%. At rank 3 each skill offers one of two
upgrades (`SKILL_MODS`, `game-faith-story.js`), each adding a mechanic, not more of the same number.
**Signatures and runes** (R11 PR B, `game-builds.js`): from level 40 the path with the most points gives a signature
(Ossuary Gate, Exsanguinate, White Silence, Bloom of Ruin), 22 mana, once a room, a free action (key T). 16 skill runes,
one slot per active, change how it works; Tower wardens, secret masters and Rift guardians drop them; swapped free in town.

**Mastery paths and capstones** (`game-progression.js`). Skills belong to four paths: Bone, Blood, Frost and Rot,
five skills each. From level 30 the path with the most points (at least 10) grants its first capstone, from level 50 the
second: Ossuary Ward / Barbed Ossuary, Blood Tithe / Sanguine Covenant, Rime / Deep Winter, Festering / Plague Bloom.

**Souls and ultimates** (`game-phases-town.js`: `ULTS`). Siphon, elite kills and boss kills harvest Souls (max 5, per
run). From level 20 you pick one ultimate: Death's Toll (400% Siphon to all, executes non-bosses under 20%), Unholy
Resurrection (raise all downed, heal, +50% army damage), Soul Prison (freeze all, +30% damage taken).

**The pantheon** (`game-pantheon.js`: `FAITH`, `BOONS`, R8 PR A). From level 8 and 3 clears, swear to one of four Old Gods or the Profane path: Morrow, the Last Light (fire; vow: never raise more than 10 bodies in one run), Vesh, the Cold Mother (frost; vow: 3 foes dying Blighted in one run, your minions' blight included, breaks it), Ulm of the Furrow (rot; vow: never sell a trophy), the Hollow Choir (shadow; vow: never lose a named minion) and the Profane (no vow; devotion fades 5 a day). Devotion is points earned by deeds the god likes (fire kills, healing from low, clean clears; freezes and Preserved raises; trophies used, rot kills, bodies exploded; Siphons, headstones, honours; elite and boss kills), x DEED_K (each god's pace) x the Temple; every 100 points (DEV_STEP) is a rank, five ranks, each a boon (`BOONS`: stats through faithB, or hooks such as Morrow's stand and rise, Vesh's extra freeze turn and Hibernation, Ulm's rot pools and Harvest Home, the Choir's siphon, silence and Requiem, the Profane's Soul and Tithe). Breaking a vow (once a day) loses that day's points and a rank; the game asks once before a raise or sale that would break it. Shrines: every god has one in the gates (your own +20 devotion; another's offers conversion at half the points; the Profane may desecrate). Rank 1 and rank 5 write a passage each; seven titles (one per god at rank 5, Godless, Turncoat). Old saves keep their oath (Honored -> Morrow, Dishonored -> Profane) with points from their days. Renouncing costs 100 gold per level. **The gods and the weather** (R8 PR B): a sworn necromancer sees tomorrow's omen (S.omenNext, rolled at dawn for the next day) and once a day may spend CALL_COST 100 devotion to call one of their god's two omens (GOD_OMENS: Morrow Pale Tide/Ashfall, Vesh Soul Storm/Long Night, Ulm Bone Harvest/Rot Bloom, the Choir Black Eclipse/Choir Night, the Profane Blood Moon/Iron Rain) or to ward the forecast off; the Temple at level 5 makes one call a week free; the Profane cannot ward but calls a random omen free once a week. Three omens come only by a call (OMEN_NAT holds the seven a dawn may bring): Long Night (a watch more, foes +10% HP), Rot Bloom (every foe starts each room Blighted), Choir Night (rooms start silenced, foes' signature moves a turn late, minions +15%). The Temple at level 3 opens the god's chapel (CHAPELS: Hospice -10% shatter, Ice House: Embalmery bodies never spoil, Granary: a brew needs a part fewer, Bell Choir: headstones -20%, Black Chapel: decay halved). The town: Morrow -1 dread a dawn, Vesh freezes a siege's third wave for a turn, Ulm commissions +20%, the Choir sieges +10% pay, the Profane's dread rests 10 higher; the Captain curses your god. Title Weather-Maker (20 calls; 184 titles).

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
gets up at 25%). R12 gave the other eight kits real echoes (Ambusher: first blow +30%; Mana thief: 1 mana a hit;
Bomber: bursts for 30% of max HP on falling; Sapper: tears half a shield; Skirmisher: 30% less damage under 30% HP;
Hexer: every third hit hexes; Purifier: sheds a condition a turn; Burrower: 50% less damage on turn 1), replacing
`ECHO_PLAIN`; a charm carries the same echoes (`echoV`). Minion cards show "Echo: <kit>".

**Evolution** (`checkEvolve`). At 5, 10, 18 and 28 levels above its raise level a minion becomes Greater, Elder, Ancient,
then Eternal: more HP and attack and one more trait each time. **Evolution marks** (`MARK`): at Elder a minion picks one of
its role's two marks (Bulwark / Spiked, Marksman / Volley, Warden / Purifier, Butcher / Harvester); at Eternal it
empowers that mark or takes the other.

**Fusion** (the Flesh Pit, `fuse`). Two minions of one role become one: the stronger survives, gains a level, keeps the
higher stage and takes the other's traits up to three. A minion takes at most two fusions. 12 **compound traits**
(`COMPOUNDS`) form only when a fusion brings both halves of a recipe together (Plaguebearer, Shatterwrought, Patchwork,
Pristine, Blur, Bloodfiend, Ironbound, Bonebreaker, Witchrot, Deathless Husk, Glaciermaul, Pyreheart).

**Gear-bearers** (`ARMED`). One armed kind per gate (two in the Tower) keeps weapon, armor and relic slots once raised;
gear converts to minion attack and HP (`gearBonus`). R12: a unique on a gear-bearer gives the minion its own version of
the unique's power at about 40% (`MINION_FLAG`, `game-army.js`); powers with no minion meaning give +8% HP and attack.

**Charms** (R12, `game-army.js`). Six trophies of one Known kind and 60 gold a gate tier make a charm that carries that
kind's kit as an echo (the Undone's table, now with an echo for all sixteen kits). One per minion, moved freely in town,
back to the pouch (`S.charms`) when its minion leaves; fusion keeps the stronger; a Ledgered kind's charm is x1.5.

**The Hexer** (R12 PR B, `ROLES.hexer`). The fifth role, raised from six hexer foes (one per gate): back row, low HP and
attack; each hit leaves a condition for 2 turns by its trait (chill, poison, blight, burn, else a Hex). One hexer per 4
army places brings conditions (`hexCap`). Marks *Augur* (+1 turn) and *Malefic* (+damage to a conditioned foe).

**Specializations and Elder actives** (R12 PR B). At Elder a minion picks one of two specializations for its role, for good
(`SPECS`, `m.spec`: Bastion/Avenger, Duelist/Cleaver, Saint/Plague-doctor, Soul-taker/Executioner, Seer/Malign), and gains
an active on the battle bar (`ACTIVES`: Hold the Line, Execute Order, Last Rites, Collect, Doom) that costs your action,
once a room (twice from Eternal, x1.5 from Ancient). A charm carries its echo at 75% (`CHARM_K`).

**Nemeses** (R13, `game-nemesis.js`). A foe that downs a Greater or older minion and still stands when you fall or flee may
live on (35%, +10% a victim stage past Greater): a name, +1 level a victim and a week, its best victim's trait, a second kit
at 2 victims, a second wind at 3 (arch-nemesis). At most 3; each waits behind a sigil door in its gate, always read. Killed,
it pays trophies and a boss-table roll, and its body rises Avenged (+15%, with the stolen trait).

**Kills and names** (R12). Each minion counts its kills (`m.kills`, kept on its headstone); at 100 its name is written
into the Ledger (`S.nameLines`, at most 10): +1% HP and attack for every minion of its role, for good.

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

**Expeditions** (src/game-exp.js, R6; `sendRaid(cu,di,uids,t,nights)`, `resolveRaid`, `expChoose`). A Commander leads a
squad (1 + 2 + stage + boss bonus + War Room) against a **target**: a cleared gate (1-2 nights), today's cursed gate (1-2
nights, steps 5% harder, gold x1.25, two pieces of gear), ten Hell Tower floors once your best is floor 20 (2 nights,
Tower trophies, a warden's heart 20%), a hunt for a kind you have mastered (1 night, three of its trophies or a boss's
heart 25%) or a scavenge (1 night, no Fight, bone dust and trophies, half the XP). Ordered in town, the squad fights with
you until nightfall, then marches. Each night has three steps at the cube root of the old raid odds: **Approach**
(-10% with no vanguard; a failure loses the night and nothing else), **Fight** (-15% with no striker or reaper, +3% each
up to +9%, +-3% per minion the gate is weak to or resists, +3% for a bonded pair; a failure: each follower may fall (30%),
the Commander shielding the first once) and **Haul** (a failure halves what is carried; with no mender each night's take
is halved). Spoils are carried until the squad comes home. With nights left, the squad waits at dawn in the field (the War
table, and a hub line): **press on** (+50% spoils a night pressed, steps -5%), the **risky path** (no Approach, spoils
x2, a lost Fight costs the weakest follower) or **come home**. One night in ten that holds brings a road event (a lost
patrol, an old camp, another keeper's squad). The bot wins ~83% of expedition nights.
**Rally**: a Commander in your army gives one free order a room: Strike harder (+20% minion damage this turn, +25% with two
Commanders) or Steady (one condition off every minion). An Elder Commander (stage 2+) lengthens Taunt a turn and makes
Bone Shield 25% stronger.

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

**Heart-forging** (`src/game-forge.js`, the market's Forge section). A boss, Tower warden, secret master or Hunger heart,
gold and bone dust forge a **heartforged** piece of that boss's set (wardens and masters: the Throne set; the Hunger: the
Scribe's Regalia) in the slot you pick, with bonus lines you choose from the boss's six (`HF_LINES`, slot rules respected)
at the top of their range. Gate bosses 2,000 x (gate+1) gold and 10 x (gate+1) dust, two lines; wardens 6,000 + 200 x
floor/10 and 40 dust, two lines, 1.2% stronger per floor; masters 20,000 and 80 dust, two lines and a minor power
(`HF_POW`: Brood, Tide, Scales, Verse, Regrowth, Mirror); the Hunger 40,000 and 150 dust, two lines and the Hungry Page.
Reforging re-rolls values (80-100%) but never the lines; a second heart of the same boss swaps one line. The forge warns
(two presses) before it spends a heart a held unique still needs for Awakening. **Tower forge**: 6 Tower trophies and
3,000 gold forge a Throne-set piece, 20% of the time with an extra line.

**Brewing** (`src/game-brew.js`, the market's Brewing section). Recipes take trophy parts of a role (every trophy kind
carries its creature's role: striker, reaper, mender, vanguard) from a gate of a given rank or deeper (Tower trophies count as
the deepest), plus 60 gold per gate step; bone charms take two spare boss hearts. Weapon oils (5, one per damage type, C+):
the army deals that type for a run, +10% against foes weak to it. Incense (Low D+ +5% raise, Grave B+ +10%, Abbot's A+ a
Soul at the boss room). Bone charms: Second Draft (rise once at 30%), Open Door (an elite door at every choice), Extra Order
(one order twice in a room), Lantern (door sight +1), Quiet Grave (burned in town: the next siege three days later). War
banners (B+): Courage +10% raid odds, Host +1 follower, Spoils +50% raid gold. Draughts on the belt: Iron Draught (your side
takes 25% less for 2 turns, key E), Bloodwine (your side mends 15%, key T). Brews wait in a stash (5 each); on the Gates
tab you arm one oil, incense and charm (each gate run takes one of each) and a banner (each raid ordered takes one).
**Belt**: 3 of each drinkable, +1 at Forge 2 and Forge 3 (cap 5).

**Bag**: 30 slots, +5 per upgrade (four upgrades, 250 to 3500 gold).

## 2.6 Economy and town

**Gold** comes from kills (scaled by level, rank, boss/elite, curse, difficulty, gold bonuses; past hero level 35 the level
part grows at a third of its rate, `softLv`), vaults, coffers,
bounties, raids, sieges, Trials and selling. **Trophies** (72 kinds) drop from kills into a pouch: sell, forge 6 points
of one gate (a heart counts 5) into a piece of that gate's gear (20% masterwork from the next set), or brew any 4 into a
potion. Boss hearts also pay for Awakening. **Bone dust** comes from salvage, bounties, sieges, Trials and the Bone
Harvest omen.

**The Market** (`marketHTML`): 4 pieces of stock a day from your top two gates, potions, Grave Salts (max 3), bag
upgrades, and the Bone Altar (pay gold to level a minion, up to your level + 2).

**Buildings** (`BUILD`, `src/game-town2.js`): Crypt (+1 army slot and cap, +2 Reserve), Forge (reforge and enchant 15%
cheaper), Ossuary (+3% raise chance), Altar (+5% mana, Bone Altar 12% cheaper), and seven that open as the town grows:
Charnel Yard (town open: the Reserve gains 4% of a level per Yard level each dawn, never past the army's top level -2),
Library (3 gates cleared: 20% of kills per level count twice for study; from level 2 a stat respec, the first free, then
500 gold per hero level and 20 dust, once a week), Embalmery (4 gates cleared: keep one untried body a run, raise it in
town later at +5% per level; it keeps 3 days + 1 per level, the Embalmery holds 2 + level), Bell Tower (first siege
warned: the warning comes a dawn earlier per two levels), Apothecary (Forge 2: potions and brewing 10% cheaper per
level, +1 belt at level 3), War Room (first raid sent: +1 raid follower at levels 1, 3 and 5, raids +2% per level) and
Temple (an oath sworn: devotion 10% faster per level, gifts +25% at level 3, call a new omen once a week at level 5).
Five levels each (1.5k / 5k + 30 dust / 14k + 90 dust / 30k + 180 / 60k + 300); levels 4 and 5 need the Throne of Ash.
**Specializations** (`SPEC`): at levels 3 and 5 each building but the Temple offers one of two picks, final for the cycle
(the Town tab lists both with what they do; the Codex's town page lists all forty). **Siege perks**: every new building but
the Temple helps on siege nights (attackers 3% weaker per Bell level, the Captain 3% weaker per Library level, Yard
minions on the wall +5% HP per level, the Apothecary's salves before waves 2 and 3, the War Room's pay, the Embalmery
keeping a fallen attacker).

**Bounty board** (`BOUNTIES`): up to 3 contracts, one new each dawn, never expiring: kills, elites, raises, rooms,
bosses, the cursed gate, a flawless clear, arches, orders, Tower floors, poisonings. Pay gold, salts, dust or gear,
growing with your deepest gate.

**Commissions**: three town orders a week on the bounty board (trophy parts of a role from a gate, a heartforged piece,
a Greater-or-better minion of a role); they pay gold and dust and lapse at the week's end. **Black market**: a market
section open every seventh day from day 7; each trade once a week: 3 spare lower hearts for a cleared gate's heart, 30
gate-C+ trophies for 50 dust, 8 Tower trophies for a warden's heart, a master's heart for a set piece of your best gate,
1,500 gold and 5 dust for a Soul on your next run.

**Sinks, in the order a player meets them**: potions and salts, bag, Bone Altar, reforging, buildings, fusion,
tempering, honour, Awakening, heart-forging, brewing, building levels 4-5, the Library respec, mausoleums, headstones
(the only uncapped one); upkeep and tithes run beside them.

## 2.7 Content and modes

**The six gates** (`DUNGEONS`): Rat Warren (E, the Rat King: Call the Swarm), Sunken Crypt (D, the Crypt Warden: Bone
Wall), Ashen Barrow (C, the Ember Knight: Cinder Wave), Hollow Cathedral (B, the Bishop of Teeth: Hymn of Silence), Iron
Orchard (A, the Orchard Mother: Seedfall), Throne of Ash (S, the Pale Sovereign: Royal Decree). Each has 7 foe kinds (two
of each role plus a gear-bearer), sharing their role's stat factors; each kind has a foe kit (2.3).

**The valley map** (R19, `src/game-map.js`, `src/ui-map.js`). The Gates tab's **Valley map** sub-tab paints the valley
as a place: the town, the seven gates, the Hell Tower, four old graveyards and two battlefields (15 nodes), joined by
roads of 1 to 3 steps. The hero stands somewhere (`S.map.pos`): a run from the node you stand on costs no travel; from
anywhere else the road is walked first (fewest steps), and every `MAP_STEP` (3) steps walked in a day spend a watch,
with steps left over carried to the next. A walk that would leave no watch for the run is refused (the gate card's Enter
is shut and says so). After a run you stand at that gate; at dawn the Ledger pulls you home. Every start goes through
it: gate runs, the Tower (its node), the Rift (under the Throne), Trials, the rival's fights and sweeps. **Fog**: the
town, the Rat Warren and the Sunken Crypt are known; an open gate is known, the Tower once open, and clearing a gate
shows its neighbours; the unknown are smudges on the vellum. **Sites**: an old graveyard is dug for 2-4 old bodies of
the nearest gate's kinds (-10% to raise), then rests 5 days; a battlefield fills after every siege, won or lost, with 3-6
of the fallen living (+10% to raise) and empties once walked. A site needs a watch in hand but none left over. Dug
bodies wait in the valley view until dawn and rise in town at no mana, into the army or the Reserve; at dawn the rest
crumble. Two titles: Grave Digger (dig 100) and Wayfarer (300 steps). The Gates list still starts every gate.
**Roads and sites** (R19 PR B, `src/game-roads.js`): the map grows to 27 nodes. A **shrine** to each of the five gods
(swear, pray for devotion, convert, or desecrate it for the Dissonance), a **crossroads** with a daily offer from
`dayHash` (a pedlar's potion at half price, a bounty-man buying trophies, a stranger's raven, a map of two unknown
places), a **hermit** (trophies for a torn page or a lesson on a kind), **gallows** (cut down a hexer's body, or sing
for the hanged), the **standing stones** (call tomorrow's omen), a **ford** (a toll for a step off longer walks that
day, or a drowned Preserved body), an **iron mine** (a two-room fight against Iron Orchard kinds that pays ore, which
cheapens heart-forging) and a **wolf den** (a fight against the valley's beasts, Dire Wolf, Carrion Crows and Grave
Bear, whose pelts make a charm). Each site rests 3-7 days after use (`SITE_REST`). A walk to any site must leave a
watch over, so a day never ends on the road. A walked road can roll an **encounter** (`ENC_CH` 5%, more under
terror): a patrol (fight or bribe), an elite, a body-cart, or a pilgrim (spare or take); fights are where they stand,
at no watch. **Scouting**: a step of walking lifts the fog on a neighbouring node; at dawn the War Room's scouts (level
2) and the **raven** (Library 3, or the stranger's) each find one more, and the raven shows nemeses on the map. The
siege's coming road, squads out and the encounter are markers too. Site fights are runs flagged `r.sv` and leave out
rivals, orders, events, doors, nemesis births and theft. Four titles: Cartographer, Every Road, Ford-Crosser and
Wolf-Skinner.
**The villages of the living** (R20 PR A, `src/game-villages.js`): three villages on the map, known from the start:
**Miller's Ford** (sells grain-salt, which keeps a dug body through a dawn, and Healing Draughts at 70%), **Greyhollow**
(ore, and an iron charm once a week for friends) and **Saint Aldric's** (relics for devotion, incense that calms the
town). Each has a **standing** from -100 to +100 (from -20) in five bands (Hatred, Fear, Wary, Friendly, Allegiance)
and a population. Standing moves with deeds: a weekly **favor** (+10; from a hash of the week: clear the den or the
mine, search the ford, escort a cart on the road (a fight with no watch), send a dug body as a worker, bury a
battlefield, keep a shrine), each purchase (+1), tribute (25 gold a level for +5, once a day), sieges won (+3 to all)
or lost (-5), raising a body from the graveyard a village buries its dead in (-3), the town's dread (Terror -1 a day,
Calm +1), pilgrims spared (+3) or taken (-5) and shrines desecrated (-5). Prices move up to 25% with standing; at -60
and below the doors shut. Favors pay grain-salt and a draught, ore and gold, or a week's blessing (menders heal 5%
more). Three titles at +60.
**Raids and allegiance** (R20 PR B): a **raid** walks to a village and spends a watch on a fight with three militia and
its best (at Saint Aldric's, its knight). Won, it takes 4-6 of its people as bodies (Farmhand, Hardened or Pious: new
corpse conditions, +15 to raise, with the Stalwart, Thick-boned or Warded trait), gold and goods; standing -40 there
and -10 with the others, dread +8, the next siege 2 days sooner (once a siege), and 40-60 souls gone. With no one left
a village is **abandoned** for good: no trade, no favors, and its graveyard digs twice as deep. **Allegiance** (+60 /
+100): Miller's Ford's militia hold a siege's first wave once a week / its salt keeps the Embalmery's bodies 3 days
longer; Greyhollow sends 2 ore a week / its forge-master reforges heart-forged lines at their best; Saint Aldric's
blessing stays / its knight, **Ser Aldwin**, rides with you: a living companion added to every gate run and siege (a
thrall: no slot, never saved past the fight, never raised or evolved, his level set by the standing), who leaves if
the standing falls under +60. At -60 and below a village sends a mob with each siege's first wave. Nine passages (first
dealings, allegiance, abandonment) and three more titles: Empty Valley, Neither Feared nor Loved, The Knight's Oath.
**Corruption and the phylactery** (R21 PR A, `src/game-phyl.js`): the hero carries **corruption** from 0 to 100 in five
bands (Clean, Stained 25, Marked 50, Hungering 75, Named 100), shown on the Status panel as an ink stain that spreads.
It rises with dark power: a boss raised +3, Corpse Explosion, Reap or an Execute order +0.2 each (at most +0.5 a day), a defiled altar or a
broken shrine +5, an Eternal +5, a village raided +10, a day at Terror +1. It falls with restraint: a day without
raising -2, a battlefield buried -1 a body (3), the Memorial honoured -2, Morrow or the Choir at rank 5 -1 a day. At
level 30 and corruption 25 the Ledger offers the **phylactery**: bind the soul into a vessel (the Ledger's clasp, a
bone ring, a skull lantern; cosmetic). Bound, **Death's Door** holds a killing blow at 1 HP once a day (after gear
revives, Grace and the Second Draft; the vessel mends at dawn), and corruption never falls under 25. New Game+ keeps
the soul bound at the floor. The Temple shatters it for 20,000 gold: corruption to 0, the title *Mortal Again*. The
other edge: at 50 each siege wave brings one more foe and every village loses 1 standing a day; at 75 one dawn in ten
the Ledger **hungers** (give it a Reserve minion for +5% damage that day, or refuse and lose 5% max HP that day; a run
started with the question open refuses it); at 100 the Grand Inquisitor **names** you for good (until a shattering):
siege captains come 15% harder and the Hunger reads your own echo as a fourth. Three passages.
**The forms** (R21 PR B): bound, at corruption 50, the hero may take one **form** for the cycle (only a shattering or
New Game+ clears it), if the build carries it. **Lich** (Intelligence highest): Soul Siphon becomes Soul Rend and hits
a second foe, +1 Soul, your frost and shadow +15%; healing received -30%, Bone Ward -20%. **Blood Lord** (Strength):
Strike heals 15% of its damage, Bloodfiend minions drink double; sunlight, the first room of each day, -10% damage.
**Bone Colossus** (Constitution): the hero stands in the front row with +40% max HP and Strike hits every foe in the
target's row (50% to the others); foes reach the hero first, Siphon -25%. **Choir Saint** (Will): every minion's marks
count a step higher, each order twice a room; the hero's own damage -20%. **Plague Herald** (the Rot path deepest): a
fallen foe passes its poison and blight on, Corpse Explosion leaves plague; menders heal 15% less. At corruption 75 the
**second stage** (Phylactery Ward: the first minion blow each room that would destroy it is held at 1 HP for 20% of max
mana; Red Tithe: each kill heals 4%; Ossuary Mass: 15% less damage taken; Choir of Many: minions +10% damage; Rotting
Air: every room's foes start poisoned) and at 100 the **apotheosis**, a once-a-run act (Winter of the Book, Red Feast,
Earthshaker, Hymn of All, Pandemic); both stay open once reached. The hero's sprite takes the form's tint. Six titles
(one per form, Apotheosis). Close the book under corruption 25 adds *The Clean Hand* to the epilogue, above 75 *The
Ledger's Own*.

**The Bone Workshop and constructs** (R22 PR A, `src/game-workshop.js`): a building that opens at the Crypt L2. Parts
(`S.parts`) are sewn from 6 trophies of one kind (4 with *Bonesmith*) or cut from a body kept in the Embalmery (two with
*Flesh Sculptor*). A **construct** takes four slots: the **frame** sets its role and HP factor (its gate is the tier),
the **arms** its attack factor and damage type (a striker's arms hit with their gate's type), the **head** its kind's
kit as a full echo plus the role's trait (Stalwart, Vicious, Warded, Wrathful, Hexing), and the **core** a spare boss
heart (+15% HP and attack, +25% from a secret master), a Soul core (40 bone dust: a Soul once a room when it kills) or a
Rift core (3 shards: +10% attack, +25% in the Rift). Parts below the frame's gate cost 5% a step of the average.
Building costs 1,000 gold and 10 dust a tier and a watch. A construct is an ordinary minion record (`m.cons`) that
levels and evolves, can never be fused, sold at the Grave Market, staked, fed to the Hunger or taken by the rival, and
never shatters: it **breaks** (`S.broken`) and is repaired after a day (300 gold and 5 dust a tier, half at L2, free and
at once with *Living Steel*). A part can be replaced in town (500 gold a tier, the old part lost); *Masterwork* allows a
second head. The Workshop keeps 1/2/3 constructs at L1/2/5 (broken ones count); L4 gives +10% max HP, and its siege
perk +10% max HP on the wall. Four titles (First Stitch, Patchwork Army, Heart of a King, Every Gate in One).

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
11), Of the Masters (all six masters: their hearts drop one more), Of the Faithful (an oath held to rank 4 or more with no
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

**Cursed gates** (`MODS`): each day one cleared gate is cursed (Volatile dead, Drought, Fury, Bulwark, Horde; R13 adds
Hunger, Mirror, Silent, Long and Thin, `game-valley.js`; a Trial never draws Long): harder
(+15% foes), double gold and trophies, +25% XP, +50% gear. After the Throne, cursed foes rise to 5 levels below you.

**Omens** (`OMENS`): 25% of days once a gate is cleared: Blood Moon, Pale Tide, Ashfall, Black Eclipse, Bone Harvest,
Iron Rain, Soul Storm, and from R13 Red Mist (+10% crit for every unit), Grave Wind (+5% raise, one Soul fewer) and Still Air
(no damage over time). They touch every gate and the Tower, never sieges or Trials. Volatile dead bursts for 30% of the
foe's attack, at most 6% of your max HP (R13; it was half, uncapped).

**Valley events and chains** (R13, `game-valley.js`): ten more events between rooms (Mourners only when the town is Calm,
the Saint only for the sworn, the Ledger thief once the rival is met), and three three-step chains that start and continue
only in their own gate: the Tanner's Debt (Rat Warren, title *Paid in Full*), the Warden's Relief (Sunken Crypt, the
Reserve gains a level) and the Ash Choir (Hollow Cathedral: Choir devotion, or a cantor's body that rises at Elder).

**Secret masters** (`SECRET`). A cleared gate's boss room very rarely (1%, +1% per difficulty tier, +0.05% per boss room
since the last) holds an older master: 3.5x HP growing with your level, 1.7x attack, second phase from turn one, x4
rewards, two legendaries, a red-ink title. After 10 clears the Ledger hints at it.

**The Hell Tower** (`TW`). 100 floors, one fight each, a warden every 10th floor with a unique, checkpoints every 10;
endless "abyssal" floors past 100 pay gold and a legendary. Foes grow every floor (faster past 60). Bot curve: floor ~43
on day 35, ~68 on day 60, ~78 on day 100 (market); ~88 (full).

**The Rift** (`RIFT_*`). From level 40 after the Throne. Depth n: five rooms of a random gate's dead at the Throne's
strength, at your level + n/3, x(1 + 0.55(n-1)). A new deepest depth leaves a legendary. Bot: depth ~16 (market), ~19
(full). **Sigils and guardians** (`game-rift.js`, R9 PR A): before a dive pick up to three of ten sigils (SIGILS: Iron Sky,
Hungry Dark, Many Hands, Mirror, Short Breath, Old Wounds, Named, Loud Grave, Typed Dark, Thin Veil), each a harder rule
and +10-30% to the dive's reward multiplier (riftRew: gold, XP, drops, the clear's XP); three open at depth 5, one more
per 5 depths, or for Rift Shards (10, 20, ...). Every fifth depth ends in a guardian (GUARDIANS, in turn: the Folded Knight,
Mother of Gates, the Echo, Brass Saint, the Tear Itself, the Counting Dead), a boss kit of two moves, a second phase and
sometimes a hazard; it leaves no body. Rift Shards (`S.rift.shards`): 1 + depth/10 per guardian, 1 per sigil on a cleared
dive. **Riftborn gear** (R9 PR B, `it.rb={p,d,a}`): from depth 10 a room leaves one 5% of the time (x the reward
multiplier), a guardian always; a legendary Throne-set piece with one rift power that grows with its depth d (RB_POW:
Descent, First Light, Bulwark of the Deep, Deep Lungs, Riftwalker, Deep Ward), full in the Rift and 30% elsewhere; the
drop is rolled from a hash (no Math.random). Attunement: +5 depth for 5, 10, 15... shards, up to 100. 40 shards buy a
secret master's heart. **The weekly dive** (`S.rift.wk`): once a day, rooms seeded by the week, three fixed sigils, one
room a depth from depth 1 with a guardian every fifth, no Retry, events or doors; a shard per 5 depths; a new weekly best
from depth 10 leaves a Riftborn piece. **Rift events** (EVENTS with `rift:true`, half the events of a dive): a fold (+2
depths), one of yours from the Memorial (a free body that keeps its name, or let it go), a fragment of the other half
(four pages, `S.rift.fr`), a tear-shrine (-10% max HP, +20% rewards). Never in the gates.

**Weekly Trials** (`TRIAL_*`, `game-rival-trials.js`). After the Throne: each week a seeded cleared gate on a fixed tier
with one or two curses, the same rooms for every attempt, once a day, no doors, raising or loot. Foes fight at the
Throne's strength. Score = turns + 5 per minion downed; the first completion pays a clear's gold and dust, a score at or
under par 8 pays 1-3 of that boss's hearts once a week.

**Siege nights** (`SIEGE_*`). Once the town has 2 building levels, the living march every 7-10 days (warned the dawn
before). Three waves (militia, crossbowmen, chaplains, witch-hunters, then the Inquisitor Captain with Royal Decree);
foes x2.2 HP, x2.5 attack. You pick a building to guard and up to 2 Reserve minions for the wall; each building lends a
perk. Win: ~1.5 clears of gold, dust, gear. Loss: a building is damaged (off until repaired) or a 10% gold fine. Bot
holds 84-86%.
**Siege tiers** (R14, `src/game-siege2.js`): five tiers (Militia, Templars, Inquisition, Crusade, Purge); two held in a
row raise the tier, a loss lowers it, Calm fights one lower and Terror one higher. Each tier adds kinds with kits (Templar
Shieldwall, Flagellant, Relic Bearer, Exorcist, Pyre Priest, Hound Master and War Hounds), waves (3, 3, 4, 4, 5), a boss
(the Captain, then the Witchfinder General, the Saint of Pyres, the Grand Inquisitor) and pay (x1 to x2). Tier 4+ burns
the strongest unguarded perk for the night. On the night you pick a wall: North road (+1 foe, Bell Tower defenses x2,
+25%), River gate (one fewer, all elites, the boss a turn late, +15%) or Graveyard (the Ossuary raises two). Five siege works
(caltrops, oil, palisade, catapult, Ward stones) are built once in town. Each new tier reads a passage of the
Inquisition's arc; reaching tier 5 brings the Purge (every wall, tier 5 whatever the dread). Break it: 20 days of peace,
Calm, the Grand Inquisitor's heart, tier 3 again. Lose it: tier 3.

**Modes** (R15, `src/game-modes.js`). At New game: Normal, Ironman (`S.iron`: no Retry or save slots; a fall costs the
run's banked gold, trophies and gear and shatters one fallen minion; three Iron titles), or custom difficulty (`S.custom`:
foe HP, foe attack, raise, gold, siege frequency in 10% steps; Story and Hardened presets). Easing anything makes the save
Custom: no titles.

**Challenge codes and the play log** (R15 PR B, `src/game-playlog.js`). A challenge code (`seed-rules` in base 36 with
a check letter; rules are Ironman and the custom settings) starts a game in a shared valley: the dawn, the day's curse, the
market stock, Tower floors, and the rooms, doors and events of each gate draw from their own seeded streams keyed by day,
gate, room and door (`chSeeded`), so nothing the player does elsewhere shifts them. Fights are not seeded. `S.code = {c, s}`;
the browser keeps a list of challenges played (`lotd-codes`). The play log (`lotd-log`, opt-in, never in the save, ~2 MB
cap) records runs, rooms, doors, events, orders, skills, the fatal blow (whether its intent showed, HP before), town spending
and time per tab; the Ledger's How I play page reads it and Records exports it as JSON for the bot replay.

**Collection** (R16, `src/game-collection.js`). Every title has one of ten families (Gates, Army, Raising, Hero, Tower and
Rift, Town, Faith, Rival and sieges, Story, Secrets). Up to three earned titles are inscribed (`S.insc`; slots at 40, 80
and 120 titles), one a family, each giving its family's ~1% perk. Six milestones (`S.coll`: Bestiary Ledgered, Uniques
found, Sets completed, Trophy kinds, Pages, Memorial) pay at three steps; the middle step eases a rule (door sight, Awakening
-10%, a bag row, a free weekly brew, early title hints, headstones -10%). Hidden titles show a masked hint from 100 titles.
The Titles tab is now Collection. **Cosmetics** (PR B, `S.cos`): 27 looks (robes, staff heads, army banners, night
backdrops per gate, Ledger covers) owned through families, milestone steps and five titles; only worn looks are saved.
A finished family sets a seal on the hero card.

**The Rival** (`RIVAL_*`). After 4 distinct clears a rival keeper (one of six names) appears. Every 2-6 days they steal
the best body of the role your army leans on; about every two weeks (warned a day ahead) they wait in a cleared gate's
boss room with 2-4 followers, fielding the bodies they stole. They grow 10% per win of yours. Beat them: a legendary,
x2 gold, a stolen page back, the next challenge pushed back. Lose: they borrow a torn page or 10% gold. Bot wins ~63-65%.
**The rival's war** (src/game-rival-arc.js, R7; `S.rival.arc`). Chapters: 1 Margins; 2 The Open Hand after 2 challenges
fought: before a challenge (the Gates tab) you may stake a Reserve minion against the closest stolen body of theirs at its
rank or higher, which then sits out the fight; win and it joins you **Reclaimed** (+5% HP and attack; stolen followers
killed and raised are Reclaimed too), lose and yours goes into their book (`b.mine`); 3 Fire at the Walls 10 days later
once a siege is held: the next siege's last wave is the rival (a challenge's strength x1.25) and their stolen dead instead
of the Captain; broken, 2 stolen bodies come back and the next theft waits; lost, they carry off the weakest Reserve
minion; 4 Their Own Gate once their siege is fought: the Rival's Ledger, four rooms of their stolen dead (never below your
level, foes x1.4) open 7 days, closed 10, with a lieutenant shaped like your strongest minion; 5 The Reckoning the next
day: the rival with every move (x0.9 a challenge) and The Last Page at half HP (followers burn to heal them 6% each); a
loss costs a Reserve minion and a week. Beaten, you **end them** (three rival uniques, set The Rival's Book, and every
stolen body back Reclaimed) or **spare them** (`S.ally`: a weekly body trade and the first wave of a siege, from the next
cycle); the rival is gone for good either way. The bot finishes the arc by day ~70.

**New Game+** (`startNGP`). After the Throne: start again at level 1 keeping titles, bestiary, tips, lifetime counts,
story, records, pages, Rift best, Memorial, rival name and record, and one unique (with its Awakening ranks). Foes +15%
per cycle (the **ascension level**, R10), rewards +25%. Each cycle start offers three **ascension rules** (15 in `ASC_RULES`,
src/game-asc.js: Two Faces, Elite Doors, Crowded Gates, Cold Town, Black Omens, Kits Plus and more); a chosen rule stays
for every later cycle and brings its own reward. Each cycle also **rewrites one gate** (a Ledger-form boss with a borrowed
move, two Ink-Wet kinds) and lets one more thing **cross** besides the unique (a trait, a building at level 2, a Riftborn
or heartforged piece). Close the book: no rule, no rewrite, two carries; Keep writing: two rules from four. Up to 3 of 7 **pacts** (`PACTS`) make the cycle harder for more XP, gold and drops, and each adds a rule (stance foes brace at once, deeper crit
bleeds, menders cleanse, boss bodies cost a Soul, draughts at half, Dark Mending heals foes, expeditions a night longer).

## 2.8 Meta-progression and knowledge

**Bestiary mastery** (`MASTERY`). Kills of each kind climb Studied (25: drop table), Known (75, bosses 6: +2% raise,
the foe's second intent, door sight), Mastered (180 / 15: +4% raise, +3% damage, damage figures on cards), Ledgered
(450 / 35: +5% raise, +4% damage, bodies rise a level higher, the answers to its blows). Kept through New Game+.

**Records** (`REC_NAME`): biggest hit, most kills, most gold, deepest floor, deepest Rift, fastest climbs and clears,
streaks, most damage survived, highest minion level, most traits on a fused minion, most gold held. **History**: the last
20 runs with details, plus lifetime analytics, and **Why you fell** (R18, `game-lost.js`): the last 3 lost rooms, each
turn by turn (every log line, where you and your army stood at the end of each turn), the blow that felled you, whether it
was shown, the answers the rules give for it (its move's counters or its kit's answer) and what the bestiary knew of its
kind then. The defeat screen opens the same view.

**The Codex** (`ui-codex.js`): every rule and list, generated from the game's own tables, searchable. **What next**:
a next-objective callout and goals, now covering orders, sieges, nemeses, inscriptions, boss hearts, brewing, tithes and the
black market (R18). **Tips** (R18): 49 first-time tips (11 core, 17 moment, 21 system), one at a time, each with a kind and a Codex page (its "Read more"
link in town): core tips (the first hour) and moment tips show when their moment comes; a system tip waits if another
system was introduced that day, so at most one new system arrives a day (`TIP_META`, `S.tips.pace`). Every town panel
heading carries a "?" that opens its Codex page (`H_CX`, `cxHeads`).

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
- **What the fight shows** (R17 PR A, `fx-cues.js`): each hit's type colours its number and adds a glyph (frost shards,
  fire embers, rot mist, shadow ink, physical sparks on the stage); a weakness reads Weak and cracks, a resistance reads
  Resisted. Foe kits have glyphs and their acting moments flash. Every boss move has a cue (`BOSS_CUE`: a wind-up pose and
  who it lands on), so a telegraph marks its targets Threatened on the cards and with a red ring on the stage. Crits and
  executions get a 60 ms hit-stop and a nudge, a phase change a slow beat and a banner (not in the quiet view: reduced
  motion, Light effects or a phone). Evolution stages show on the icon (outline, role glow, larger with motes, halo);
  unique, heartforged, Riftborn and Awakened items have frames; stage numbers stack and drift; a changed intent pulses.
- **Sound and music** (`scenes.js`): synthesized Web Audio effects and, since R17 PR B, a small music engine (`THEMES`,
  `musicGraph`, `musicTick`): each gate has its own mode, tempo, lead voice, pad and noise bed and a motif its boss reuses;
  the town follows its dread band (calm music box to terror drone), the Tower rises a semitone every 10 floors, the Rift
  shifts key each phrase, a boss's second phase plays faster and higher with more drums. 1.5 s crossfades, its own volume,
  its own seeded dice (never the game's). No audio files.
- **Title screen and epilogues** (R17 PR B): the drowned chapel at night with the Ledger on its lectern; its pages go on,
  open a slot or begin a new book (Settings can turn it off). Each ending's last page is painted (`scEpilogue`).
- **Tabs**: Gates (with Tower, Rift, Trial and War table views), Army, Gear, Market, Skills, Town, Codex, the Ledger
  (Bestiary, Titles, Lore, Records, History, Memorial), Help, Settings. Keyboard shortcuts for every action (`?` lists them).
- **Language**: English in the page, Turkish laid over it after each render (`tr.js`, ~2,450 lines of `TR_DICT` and
  `TR_RX`). Every new string needs a Turkish entry.
- **Display settings**: text size (90% to 130% in five steps, R18), reduced motion, high contrast, light effects (per
  browser). Damage types use colours that stay apart under protanopia, deuteranopia and tritanopia and always carry their
  glyph (R18).
- **Phones** (R18): one-thumb battle (the sticky command bar: actions, then skills, orders and potions as swipeable rows),
  the battle log cut to its newest three lines with a toggle, and a tap on anything with a tooltip opens it in a sheet at
  the bottom of the screen. `tools/mobile-check.js` (Playwright, run by hand) checks every tab, a fight and the raise
  screen at 360 px for anything wider than the screen.
- **Late saves** (R18): the bag shows 60 pieces at a time (Show more); off-screen item and minion cards skip layout
  (`content-visibility`); Turkish text is worked out once per string (`TR_MEMO`). The save's size shows in Settings, and a
  save past 4 MB, or a write the browser refused, warns on every screen.

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
