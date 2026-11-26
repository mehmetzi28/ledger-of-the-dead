# 5. Roadmap

Everything worth adding, improving or connecting, grouped into big rounds and ordered by priority. Each round is a
substantial feature or rework; small fixes ride along inside one. Rounds name the gaps they close (G-numbers from
[03-connections.md](03-connections.md)) and the balance problems they address (B-numbers from
[04-balance.md](04-balance.md)).

**How to read a round**

- **Goal**: the one-sentence promise to the player.
- **Closes**: gaps and balance problems.
- **Scope**: what gets built. Names are working names.
- **Connects**: the systems it ties together.
- **Done when**: the measurable bar, mostly bot numbers.
- **Needs**: rounds that should ship first. **Size**: L (one PR, a few days) or XL (may split into two PRs).

**Priority order at a glance**

| # | Round | Priority | Closes | Needs | Size |
|---|---|---|---|---|---|
| R0 | Hero power scales with army strength | In progress | G9, B8 | | L |
| R1 | Every foe is a puzzle: foe kits and damage types | P1 | G1, G2, G4, G5, B1, B2, B5 | | XL |
| R2 | Masters worth remembering: boss kits | P1 | G3, G11 (part) | R1 | XL |
| R3 | The end of the book: the seventh gate and the ending | P1 | G16, G21 (part) | R2 helps | XL |
| R4 | Gold that means something: late economy and crafting | P1 | G10, G11, G14, B3 | | L |
| R5 | The necropolis grows: town expansion and the town's dread | P1 | G6, G12, G13, G15, B7 | R4 helps | XL |
| R6 | Expeditions: raids rework and Commanders in battle | P2 | G17, G8 | R5 | L |
| R7 | The rival's war: an arc with an ending | P2 | G19 | R2 | L |
| R8 | The pantheon: faith rework, gods and omens | P2 | G18, G20 | R5 | L |
| R9 | Rift sigils and Riftborn gear | P2 | G22, B4 | R2 | L |
| R10 | Ascension: New Game+ rework | P2 | G21 | R3 | L |
| R11 | Hero builds 2.0 | P2 | G25, B2 | | L |
| R12 | Army roles 2.0: charms, minion actives, a fifth role | P2 | G7, G8 | R1 | XL |
| R13 | Nemeses and a living valley: content pack | P3 | G24, G20 | R1 | L |
| R14 | Sieges 2.0: the Inquisition escalates | P3 | G23 | R5 | L |
| R15 | Modes and playtest logs | P3 | G27, B6 | | L |
| R16 | Titles and collection 2.0 | P3 | G26 | | L |
| R17 | Presentation: music, stage, art | P3 | | R1, R2 | L |
| R18 | UX and onboarding pass | P3 | | after any 3 rounds | L |

The order is a recommendation, not a queue: pick the highest round whose needs are met, unless a later one fixes
something that hurts more right now.

---

## In progress

### R0. Hero power scales with army strength
Being built in another thread ("Improve and connect game systems"). **Goal**: the hero's damage and survival grow with
the army behind them, so a lone, over-geared hero cannot carry rooms and the army stays the character (pillar 1).
**Closes**: G9, B8. When it ships, add its rules to [02-systems.md](02-systems.md) 2.2 and its numbers to 4.2.

---

## P1: the next five rounds

### R1. Every foe is a puzzle: foe kits and damage types
**Goal**: every kind of foe fights in its own way, so reading a room and choosing answers matters in every fight, not
just boss rooms.
**Closes**: G1, G2, G4, G5; B1, B2, B5.

**Scope**
- **Damage types**: physical, frost, fire, rot and shadow. Every source gets one: Strike and Bone Spear physical; Soul
  Siphon, Reap and blight shadow; Grave Chill frost; Corpse Explosion and poison rot; Cinder Wave and burns fire. Minion
  hits take their trait's type (Rimeborn frost, Cinderborn fire, Venomous and Necrotic rot), else physical.
- **Resistances and weaknesses per gate and per kind**, small and readable (weak +25%, resist -25%, immune only on a few
  bosses): the Ashen Barrow resists fire and is weak to frost, the Sunken Crypt's drowned dead are weak to fire, the
  Hollow Cathedral's choir resists shadow, the Iron Orchard's iron is weak to rot, and so on.
- **Foe kits**: each of the 42 gate foes and 8 Tower foes gets one behavior from a pool of about 16, shown on its card:
  shield-bearer (guards the weakest ally), ambusher (opens on your back row), mana thief, grave-caller (raises a fallen
  foe once), pack hunter (stronger per living kin), bomber (bursts on death), sapper (breaks your ward), skirmisher
  (steps to the back row when hurt), bulwark stance (armor up every other turn), hexer, marker (marks a minion for
  focus fire), mender-priest (cleanses foes), burrower (untargetable for a turn), reflector, frenzy (faster when allies
  fall), banner-bearer (buffs the room while alive). Two foes of the same role in one gate never share a kit.
- **Bestiary**: Studied shows the kit's name, Known its rules and the kind's weakness, Mastered the numbers, Ledgered the
  best answer. Doors show kits as far as door sight reaches.
- **Corpse conditions**: a foe killed by its weakness rises "Undone" (a new death trait that inherits a weaker copy of
  its kit), linking kits to the army.
- **Gear and affixes**: resistance and "+% type damage" bonus lines; elite affixes gain typed variants (Frost-touched,
  Burning).
- **Sweep** (G5): on Normal, a cleared gate whose rooms the hero's modeled strength far outclasses can be swept: the run
  resolves at once with its full loot and reduced XP (the farming falloff already applies), so outgrown farming costs one
  click, not twenty.
- Teach the bot to answer kits (focus shield-bearers, ward before sappers, kill bombers away from the front row).

**Connects**: combat, bestiary, doors, corpse conditions, traits, gear lines, affixes, omens (Eclipse already boosts
shadow; Iron Rain and Soul Storm get type hooks), Trials.
**Done when**: at the Recommended level a gate room lasts 2-4 player actions for the `market` bot (it is ~1 now when
ahead); gate clears back near 85% (retune `DIFF` down where kits add danger); stat builds within 4 points on gates and
Constitution within 5 floors in the Tower; Sweep used on outgrown gates by the bot with no change to gate rates.
**Size**: XL (damage types and resistances, then kits).

### R2. Masters worth remembering: boss kits
**Goal**: every boss, warden and secret master is a fight with its own moves, phases and answers.
**Closes**: G3, part of G11.

**Scope**
- **Gate bosses**: three moves each (the signature plus two), and a phase two of their own instead of the shared
  Sundering Blow. Examples: the Rat King's court grows a rat for each Swarm left alive; the Crypt Warden locks a minion
  behind the Bone Wall; the Ember Knight's burning ground punishes the front row; the Bishop of Teeth turns your Silence
  into a choir that heals; the Orchard Mother's seedlings mature into vanguards; the Pale Sovereign's Decree names one of
  your minions and executes it unless guarded.
- **Secret masters** with their own kits: the Plague Matriarch's brood, the Drowned Abbot's rising tide (a turn counter),
  the Cinder Wyrm's breath line, the Choir Eternal's verses, the Rootking's regrowth, the Nameless Sovereign copying your
  last skill.
- **Tower wardens**: ten signature moves of their own (the Gate Hound's three heads act as three intents, the Duke of
  Chains chains a minion, the Pale Executioner marks a target for execution, the Hollow Seraph's halo reflects...).
- **Boss damage types and resistances** from R1; arena hazards shown on the boss card.
- **The rival** fights with moves drawn from the roles of the bodies they stole, so their thefts change the duel.
- **Hearts**: each boss's heart gets a second use beyond Awakening (a heart-forged item line, see R4).
- Bestiary Ledgered shows the whole kit and its answers; defeat recaps name kit moves.

**Connects**: combat, bestiary, rival, Tower, secret masters, Awakening, crafting, presentation (arenas).
**Done when**: each boss fight averages 4-7 turns at the Recommended level; boss room clears stay at the gate's target;
the Tower curve and rival win rate stay in their target bands.
**Needs**: R1 (damage types). **Size**: XL (gate bosses and rival, then wardens and secret masters).

### R3. The end of the book: the seventh gate and the ending
**Goal**: the story the Ledger has been telling ends with a real choice and a final place to fight for it.
**Closes**: G16, part of G21.

**Scope**
- **Vane Abbey**, a seventh gate beneath the drowned chapel, opening once the Throne has fallen, the Tower's floor 100 is
  taken and the twentieth page is found (or all six secret masters slain, so a player has two routes). New foes (the
  plague year's dead, Oswin's brothers), its own set, unique and boss: **the Hunger**, the thing Oswin gave a shape to.
- **The choice** after the Hunger falls: **Close the book** (write your own name: an epilogue, the dead sleep, the save is
  marked Closed, and a New Game+ "The Quiet Valley" begins with gentler gates but no raising until the first clear) or
  **Keep writing** (the book stays open: a New Game+ "The Keeper's Cycle" begins, carrying one Ledger inscription, a
  permanent small perk chosen from your deeds). Both endings have their own title and passages, and the Records keep the
  day and cycle you ended on.
- **Act VI** passages for the abbey and both endings; the rival appears at the end if R7 has shipped.
- Floor 100 of the Tower and the twentieth page get mechanical weight: they are the abbey's keys.

**Connects**: story, pages, Tower, secret masters, NG+, titles, records, rival.
**Done when**: a `full` bot can reach and clear the abbey in a long game (measure the day it does), the boss sits on the
gate curve (~80% at its Recommended level), both endings start a valid New Game+ and survive save round trips.
**Needs**: R2 makes the final boss richer but is not required. **Size**: XL.

### R4. Gold that means something: late economy and crafting
**Goal**: late gold, trophies and hearts always have something worth buying, and every kind of loot has a use.
**Closes**: G10, G11, G14; B3.

**Scope**
- **Heart-forging** (the Forge): boss and warden hearts plus gold and dust forge a legendary of your choice of slot with
  two bonus lines you pick from that boss's themed list; secret-master hearts add a third line or a minor power.
- **Tower trophies** forge Tower-tier gear; abyssal floors past 100 pay abyssal trophies for the same.
- **Consumables 2.0** (brewing from specific trophies): weapon oils (a damage type for a run), incense (raise chance for a
  run), bone charms (one-shot effects: an extra order, a free Retry, a guaranteed elite door), war banners for raids. Belt
  upgrades (three to five slots).
- **The income curve**: kill gold grows more slowly past the Throne; open-ended sinks (heart-forging, consumables,
  commissions, town upkeep from R5) take over from capped ones. Keep the measured Awakening and headstone spending.
- **Commissions**: the town posts orders for specific trophies or gear (gold and town standing, see R5).
- **Market**: a weekly black-market stall that trades dust, hearts and abyssal trophies.

**Connects**: trophies, bosses, Tower, secret masters, market, Awakening, combat (consumables), raids (banners), town.
**Done when**: `full` bot gold held at day 100 ~10-20k (from ~35k) with most lifetime gold spent; every trophy kind has
at least one use besides selling; `full` stays 1-3 points over `market`.
**Size**: L.

### R5. The necropolis grows: town expansion and the town's dread
**Goal**: the town keeps growing all game, every building changes how you play, and the living react to what you do.
**Closes**: G6, G12, G13, G15; B7.

**Scope**
- **New buildings** (to about ten): the **Charnel Yard** (benched Reserve minions train and earn XP each day), the
  **Library** (faster bestiary study, research projects, stat respec), the **Embalmery** (keep one body per run to raise
  later), the **Bell Tower** (siege warning and wall defenses), the **Apothecary** (R4's consumables), the **War Room**
  (R6), the **Temple** (R8). Existing buildings go to five levels with a choice of specialization at levels 3 and 5.
- **Dread**: a town meter moved by sieges won and lost, raising near town, oaths, commissions and tithes. Low dread: better
  prices and gentler sieges; high dread: bigger sieges, harder market, but plunder and fear-driven events.
- **Daily orders** replace the fixed daily quest: pick one of three each dawn (a gate, a role to raise, a style of win),
  each paying a different reward (a stat point, dust, standing).
- **Upkeep**: higher building levels cost a little gold each dawn, a soft sink that scales with the town.
- Every building lends a siege perk (extend `SIEGE_PERK`).

**Connects**: town, Reserve, sieges, raids, faith, bestiary, economy, calendar, events.
**Done when**: the Reserve's minions grow while benched; the town has something to build through day 100; daily order
choice measurably varies between bots; sieges held stays 80-87% with dread in play.
**Needs**: R4 helps (Apothecary, upkeep). **Size**: XL (buildings and the Yard, then dread and orders).

---

## P2: rounds after that

### R6. Expeditions: raids rework and Commanders in battle
**Goal**: sending your dead out is a plan with choices, and a Commander matters in every fight.
**Closes**: G17, G8.
**Scope**: raids become expeditions of one to three nights against any cleared gate on any cleared difficulty, a cursed
gate, a Tower floor band, a hunt for one kind (its trophies and hearts) or the rival's stash (with R7); dawn reports offer
a choice (press on, come home, take the risky path); squad roles and damage types against the target's kits change the
odds; a Commander in your army grants a free **Rally** order once per room; the War Room building (R5) adds squad size and
intel. **Connects**: raids, Commander, town, bestiary, kits, economy, rival. **Done when**: raids won stays ~75-80% with
choices; expeditions are worth about as much as a watch spent fighting; Rally changes room outcomes measurably.
**Needs**: R5 (War Room). **Size**: L.

### R7. The rival's war: an arc with an ending
**Goal**: the rival becomes a story with stakes that builds to a final reckoning.
**Closes**: G19.
**Scope**: an escalating arc (thefts, challenges, a raid on your town led by the rival, then their lair, a gate of their
own built from the bodies they stole); the final duel with their whole book; outcomes that matter (beat them for good and
their ledger becomes a set of three rival uniques, or spare them and they return in New Game+ as an uneasy ally who
trades bodies); rival strength carries a share into New Game+; recover stolen bodies by raiding their stash.
**Connects**: rival, sieges, expeditions, story, NG+, uniques, bestiary. **Done when**: the arc completes in a 100-day
`full` bot game; the duel is won ~65-75%. **Needs**: R2 (rival kit). **Size**: L.

### R8. The pantheon: faith rework, gods and omens
**Goal**: an oath is a relationship with a god that you grow through deeds, and the gods move the weather.
**Closes**: G18, G20.
**Scope**: four named Old Gods and a profane path, each tied to omens and a playstyle; devotion grows by deeds (not only
days); boons unlock in steps; an oath forecasts tomorrow's omen and lets you spend devotion to call or ward one; shrines
in gates per god; the Inquisition (sieges) and the town's dread react to your god. **Connects**: faith, omens, events,
sieges, dread, story. **Done when**: each oath is within a few points of the others on gates; omen calls are used by the
bot. **Needs**: R5 (Temple, dread). **Size**: L.

### R9. Rift sigils and Riftborn gear
**Goal**: the Rift is a chosen risk with rewards that exist nowhere else.
**Closes**: G22, B4.
**Scope**: pick sigils (modifiers) before a dive for better rewards; Riftborn items with a fixed rift power; named
guardians every five depths with kits from R2; a weekly seeded Rift dive beside the Trial; Rift events; a dedicated bot
probe for depth. **Connects**: Rift, gear, Trials, records, kits. **Done when**: sigils change the bot's depth by a
predictable amount; Riftborn gear is wanted by the bot. **Needs**: R2. **Size**: L.

### R10. Ascension: New Game+ rework
**Goal**: each cycle is new, not just harder.
**Closes**: G21.
**Scope**: each cycle rewrites part of the valley (a boss variant per gate, new foe variants, a new curse); ascension
levels with rules instead of flat +30% numbers; pacts become rule changes; carry choices (a trait, a mark, a building
level) chosen when the cycle starts; ties to R3's two endings. **Connects**: NG+, story, kits, curses, town. **Done when**:
cycles 1-3 each play differently in bot runs and stay on the gate curve. **Needs**: R3. **Size**: L.

### R11. Hero builds 2.0
**Goal**: a necromancer's build is a real choice that can be changed at a cost.
**Closes**: G25, B2.
**Scope**: paid stat respec (Library); Frost and Rot get a fifth skill; each path gets a signature active at level 40;
skill runes (dropped by wardens and secret masters) modify actives; two more ultimates; a clear endless-mode role for
Constitution builds. **Connects**: skills, paths, stats, loot, Library. **Done when**: path builds within ~4 points on
gates and within a few floors in the Tower. **Size**: L.

### R12. Army roles 2.0: charms, minion actives, a fifth role
**Goal**: every minion can be shaped, and elders can act on command.
**Closes**: G7, G8.
**Scope**: a charm slot on every minion (crafted from trophies); a gear-bearer wearing a unique gains a minion version of
its power; Elder minions gain one active ability given through orders; a fifth role (the Hexer: back row, applies
conditions) or role specializations at Elder; per-minion kill counts for the Memorial. **Connects**: army, gear, uniques,
commands, crafting, Memorial. **Done when**: the bot's army mix uses every role; charm and active use measurable with
`"off"` switches. **Needs**: R1. **Size**: XL.

---

## P3: later

### R13. Nemeses and a living valley: content pack
**Closes**: G24, G20. A foe that downs one of your minions may survive with a name, grow, and return in later runs (avenge
it for its trophies and a Memorial line); five more curses, ten more events, three more chains, three more omens, event
outcomes that touch dread, faith and the rival. **Needs**: R1.

### R14. Sieges 2.0: the Inquisition escalates
**Closes**: G23. Siege tiers that grow with your wins; new foe kinds with kits and damage types; choose which wall to
hold; defenses built in town; siege boss variants; an Inquisition story arc that ends in a confrontation. **Needs**: R5.

### R15. Modes and playtest logs
**Closes**: G27, B6. An Ironman save slot (falls cost much more, nothing else changes); seeded challenge codes to share
locally; custom difficulty sliders; a local play log (runs, deaths and their blows, time per run, ignored systems)
exportable as a file for review. Never uploaded anywhere.

### R16. Titles and collection 2.0
**Closes**: G26. Inscribe up to three earned titles beside the worn one (slots unlock with the collection); collection
milestones pay cosmetics (robes, army banners, stage backdrops) and small rule perks.

### R17. Presentation: music, stage, art
Per-gate and per-boss music themes; stage animations for kits, damage types and boss moves; evolved minion art by stage;
a title screen; painted epilogues for the endings. **Needs**: R1, R2.

### R18. UX and onboarding pass
Re-run the first hour with the new systems; a mobile layout pass; Codex links from every number; a "why did I lose"
view in the History; render performance on large late-game saves.

---

## Ride-alongs

Small fixes to bundle into the round named. Don't ship them alone.

| Fix | Ride with |
|---|---|
| Tower trophies forge Tower-tier gear | R4 |
| Belt upgrades for potions | R4 |
| Daily quest becomes a choice (daily orders) | R5 |
| Stat respec | R5 (Library) or R11 |
| Frost and Rot paths get a fifth skill | R11 |
| Commander gives Rally in battle | R6 |
| Per-minion kill counts in the Memorial | R12 |
| A dedicated Rift depth probe in the bot | R9 |
| Typed variants of elite affixes | R1 |
| Re-measure `REC_BASE` after kits | R1 |
| Every new string gets Turkish, every new system a Codex page and a tip | every round |

## Parking lot

Ideas worth keeping that are not yet a round:

- **Grave garden**: plant a body in town to raise it later, stronger (ties corpses, town, calendar).
- **Ledger inscriptions**: write a fallen minion's name into the Ledger for a permanent small effect (ties the Memorial).
- **Minion voices**: short lines from evolved minions at key moments.
- **Necromancer appearance**: robes and staff looks unlocked by deeds.
- **Valley map**: a painted map of the gates, Tower, Rift, town and abbey as the Gates tab's backdrop.
- **Weather and seasons**: a slow calendar layer above omens.

## Not doing

- Publishing, hosting or deploying the game (only if Mehmet asks).
- Online features, accounts, servers, leaderboards that need a server.
- Monetization of any kind.
- Real-time combat.
- Outside image or audio files, or CDNs (the vendored PixiJS and Google Fonts are the exceptions).
- Recreating any existing game's content, characters or look.

## Shipped

| Round | PR | Date |
|---|---|---|
| Soul Tether, one soul per boss, unique Awakening, B/A/S/Tower/Rift retune | #1 | 2026-11-26 |
| Constitution feeds the army, tier advice refit, Throne-strength Trials paying hearts | #2 | 2026-11-26 |
| Lord of the Eclipse requirement fix, bot raise rate | #3 | 2026-11-26 |
