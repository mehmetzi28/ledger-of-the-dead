# R3. The end of the book: the seventh gate and the ending

**Priority** P1. **Closes** G16, part of G21. **Size** XL, two PRs. **Needs** nothing hard; R2 makes the final boss
richer (its move-set engine), R1 gives the abbey's foes kits.
**Pillars served**: 5 (the Ledger is a story), 2 (every death is a resource), 7 (long game with a destination).

## 1. The problem

The story stops. Act V is a set of reactions to systems (raids, sieges, the rival), and the lore pages tell of Oswin Vane,
the drowned abbey and "a hunger in the dark" that the player never meets. The Tower's floor 100 and the twentieth page
are trophies with no consequence. New Game+ begins from the Throne of Ash, which is a boss, not an ending. A player who
has done everything has nowhere to go and nothing to decide.

## 2. Shape of the round

1. A **seventh gate**, **Vane Abbey**, under the drowned chapel where the game began.
2. Two **keys** so it is reachable by different players: the "deep" route and the "secret" route.
3. A **final boss in three phases**, **the Hunger**, that turns the player's own Memorial against them.
4. **The choice**: close the book or keep writing. Each ending starts a different New Game+.
5. **Act VI**: passages before, during and after.

## 3. Opening the abbey

The abbey door shows on the Gates tab from the first day as a sealed, drowned door ("The river keeps it"), with its
keys listed. It opens when **either** route is complete:

| Route | Requires | Who it is for |
|---|---|---|
| **The deep route** | Throne of Ash cleared (gate 5 on any difficulty), Tower floor 100 taken, 20 pages found | the climber |
| **The secret route** | Throne of Ash cleared, all six secret masters slain (any cycle counts within this save) | the explorer |

Each key fills a slot in the door's picture (a lock per key). Opening plays the passage *The river turns back*. In New
Game+ the keys reset with the cycle, except the Ending marks (section 8).

**Bot pacing target**: a `full` bot reaches the abbey around day 80-95 by the deep route. If it is later than day 100 on
both seeds, lower the floor key to 90 (`ABBEY_TOWER`) before touching the page key.

## 4. The gate

Gate index **6**, rank **SS** (`RK[6]`), on the gate curve as a step beyond S: Recommended level ~34 (S is 27; measure
with the tier probe and set `REC_BASE[6]`). Four rooms like every gate (the last holds the boss), plus a **Scriptorium** room before the boss room: the
**Scriptorium** (section 4.3). Difficulties: Normal and Hard only on the first opening; Brutal and Nightmare unlock
after the first clear like other gates.

### 4.1 Foes (seven kinds, like every gate)

Damage profile: **shadow and rot**; resists shadow, weak to fire (the abbey is wet stone and old vellum) and to frost on
the drowned kinds. Kits from R1's pool where noted, plus two new kits only the abbey has.

| Foe | Role | Kit | Notes |
|---|---|---|---|
| Plague-Year Mourner | vanguard | bulwark stance | the dead Oswin could not write fast enough |
| Drowned Novice | striker | ambusher | weak frost, resists fire (soaked) |
| Brother of the Binding | mender | mender-priest | cleanses foes, heals 8% |
| Ink Wraith | reaper | **Unwritten** (new): untargetable unless a skill has hit it this turn; minion attacks pass through | answers: any skill first, then the army |
| Chained Lector | vanguard | **Recitation** (new): reads one of your minion's traits aloud and gains it for the fight | reads the highest-tier trait; killing it first denies it |
| Censer-Bearer | striker | banner-bearer | the room's foes deal +10% shadow while alive |
| The Weeping Unnamed | reaper | grave-caller | raises a fallen foe once, as an Unnamed (half HP) |

Two foes of the same role never share a kit (the R1 rule holds).

### 4.2 Loot

- **Set: the Scribe's Regalia** (7 pieces like every gate set, at Legendary tier: two weapons, the Quill and the Censer
  Staff; two armors, the Cowl and the Inkstained Robe; three relics, the Chain of the Wrist, the Reading Glass and the
  Wax Seal). Bonuses: (2) +10% shadow damage and +10% bestiary progress from kills; (3) **Marginalia**: each skill you cast writes a note; at three notes your next skill costs no mana and its
  damage type changes to the target's weakness.
- **Unique: Oswin's Ledger-Chain** (relic). "Your Memorial remembers for you: +1% to all minion stats per headstone,
  up to 20%. When a minion would fall, it may instead go to the Memorial with its name kept, and you draw its last blow
  as a free Bone Spear." (The free spear is the unique's power; the stat line connects the Memorial.)
- **Trophy**: Vellum Scraps (common) and **the Hunger's Tooth** (boss heart, forges in R4).
- **Pages**: three new lore pages (21-23) found only here: *The rest of the margin*, *What the river pushed*, *The last
  entry*.

### 4.3 The Scriptorium (before the boss)

A non-combat room before the boss, once per run. The Ledger lets you **cross out one name**: pick a minion from your
army or Reserve. It leaves for good (not to the Memorial), and in return the Hunger's phase three loses that minion's
echo (section 5) and you gain the minion's trait as a **Ledger blessing** for this boss fight only. Skipping it is allowed.
This is the round's one deliberate "sacrifice for power" moment, and it plants the ending's theme: some things should be
forgotten.

## 5. The Hunger (boss)

The thing Oswin gave a shape to. It has no body of its own; it wears what the book remembers. Resists shadow (immune
in phase one), weak to fire. Three phases at 100%, 66% and 33%; each phase has its own HP bar segment and its own move
set (R2's engine: `BOSS_KIT.hunger.phases[]`).

| Phase | Name | Moves | Twist | Answer |
|---|---|---|---|---|
| 1 | **The Blank Page** | Erase (removes your highest buff and your Ward), Hollow Hymn (shadow to all), Hunger (bites one minion, heals 5%) | Immune to shadow. Each turn it is not hit by fire it regains 3% | bring fire, or burst the phase |
| 2 | **The Remembered** | Calls **Memorial echoes**: up to three of your own fallen minions, drawn from the Memorial (highest tier first), with their traits at 60% stats; Read Aloud (a minion of yours is Silenced as if a Chained Lector read it) | While an echo stands, the Hunger takes 50% less damage | kill the echoes; a Scriptorium cross-out removes one; a minion with a Bond to an echo refuses to strike it but deals +30% to the Hunger |
| 3 | **The Last Entry** | Write Your Name (telegraphed: in two turns, sets the hero to 1 HP unless Warded or the Hunger is frozen); Devour the Margin (eats one minion outright, once, Guard saves it); Hollow Hymn | Every action the hero takes in phase three is written on the stage; after six actions the fight ends in your favor if you stand (the book runs out) | survive, ward on the telegraph, guard the named |

- **Without R2** the boss uses the existing `fireAbility` moves mapped to phases (Hymn of Silence, Royal Decree, Sundering
  Blow), keeps the Memorial echoes, and the Scriptorium still works. The echoes are the core and need no R2 code.
- **Echo rules**: echoes come from `S.memorial` entries (name, role, tier, traits). A save with an empty Memorial gets
  three "plague-year dead" stand-ins. Echoes never drop corpses or loot. Their names show in gold ink on the stage.
- **Defeat recap**: names the echo that dealt the killing blow ("Brother Ash, fallen on day 41, struck you down").
- **Tuning target**: 7-10 player actions at the Recommended level; ~80% of `full` attempts at Recommended, matching the
  gate curve. Echo stat share (`HUNGER_ECHO` .6) is the lever, then phase HP split.

## 6. The choice

After the Hunger falls, a full-screen page (not a modal popup; the Ledger itself) offers two answers. The player can
leave and come back: the choice waits at the abbey door as **The last page**, and the gates stay playable.

(Gate sets have 2- and 3-piece bonuses; the abbey keeps that shape.)

### 6.1 Close the book

"Write your own name, and let the rest rest."

- Epilogue passage *The quiet valley* (three paragraphs, varied by: faith oath, rival defeated or not, size of the
  Memorial, whether any Eternal stood in your army).
- Title **The Last Keeper** (Closed). Records keep the day, cycle, deaths and army size at the end.
- The save is marked `S.ending = {k:'closed', day, cycle}`. The player can keep playing this cycle, or begin
  **The Quiet Valley** New Game+:
  - Gates are 15% gentler (foe HP and attack) for the whole cycle, rewards unchanged.
  - **No raising until the first gate clear of the cycle.** The Ledger is quiet; it reopens with the passage
    *The book stirs*.
  - Carries everything New Game+ carries today (level, gear, skills, Memorial), plus one **Ledger inscription** (6.3).
  - A run-long story variant: act I passages get "second reading" lines (an extra sentence each).

### 6.2 Keep writing

"The Ledger is not finished with you. You are not finished with it."

- Epilogue passage *The open book* (variants as above).
- Title **The Hand That Writes** (Kept).
- `S.ending = {k:'kept', day, cycle}`. New Game+ **The Keeper's Cycle**:
  - The usual NG+ cycle (foes +30% per cycle, pacts available) plus one of the six gate bosses, chosen by the book at
    random, returns in **Ledger form** (its R2 phase two from the start, its heart pays double).
  - Carries one **Ledger inscription** and keeps one more each time a cycle ends by Keep writing (cap 5).
  - The abbey opens again in the next cycle with only the Throne and one other key (the book remembers the way).

### 6.3 Ledger inscriptions

Chosen from a list of six, each earned by a deed in the ended cycle (only earned ones are offered):

| Inscription | Earned by | Effect (permanent, small) |
|---|---|---|
| *Of the Many* | 300 raises in the cycle | +3% raise chance |
| *Of the Fallen* | 20 headstones | Memorial minions grant +1% army HP each (cap 10) |
| *Of the Tower* | floor 100 | Tower starts at floor 11 |
| *Of the Masters* | all six secret masters | secret-master hearts drop +1 |
| *Of the Faithful* | oath kept the whole cycle | start with 2 devotion ranks |
| *Of the Rival* | rival beaten 5 times | the rival steals one body fewer per theft |

Saved as `S.inscriptions = ['many', ...]` (top level, survives NG+).

## 7. Act VI

Eight passages (`act:6`): *A door in the water* (first sight of the sealed door), *Two keys* (one key done), *The river
turns back* (opening), *Oswin's cell* (first room), *The Scriptorium*, *What the book wore* (phase two first seen),
*The last entry* (victory, before the choice), plus the two epilogues. The rival speaks in *The last entry* if R7 has
shipped; otherwise a line from the Old Shrine's god if an oath is held.

## 8. Code that assumes six gates

Every place that hard-codes six gates or `RK.length===6`, found by search; each needs the seventh entry or an exclusion:

| Where | What | Change |
|---|---|---|
| `game-data.js` `RK` | gate list | add SS, `hidden:true` until opened |
| `DIFF.gate`, `DIFF.armor`, `DIFF.foeAtk` | per-gate arrays | 7th value (start: gate 5 x1.18, measure) |
| `REC_BASE`, `REC_AT` | Recommended levels | 7th value from the tier probe |
| `TIER_W` | tier weights | 7th |
| `UQ` | uniques per gate | Oswin's Ledger-Chain |
| `SET_PRICE`, `SET_NAMES`, `SET_BONUS` | sets | the Scribe's Regalia |
| `TROPHY_VAL` | trophy prices | Vellum Scraps, Tooth |
| `GATE_TITLES` | titles per gate | abbey titles (section 9) |
| `NAMES` | foe names per gate | seven abbey kinds |
| Rift, Trials, raids, curses | pick a random gate | exclude gate 6 (Rift and Trials keep 0-5; raids may target it after R6) |
| Bestiary pages, Codex "Gates" | per-gate pages | add abbey page, hidden until seen |
| `distinctClears()` and gate-count titles ("clear every gate") | counts | keep the old count at 6, add new "all seven" titles instead of changing old ones (old saves keep their titles) |
| Bot (`run-balance.js`) | gate loop | include gate 6 once open; new metric `abbeyDay` |

Save: `S.abbey = {keys:{deep,secret}, open, script:{used}}` (top level, reset per cycle), `S.ending`, `S.inscriptions`.
All defaulted on load; old saves load with the door sealed.

## 9. Titles (8)

The Last Keeper, The Hand That Writes, Riverturner (open the abbey), Scriptor (cross out a name), Echo-Breaker (beat
phase two without losing a minion), Unwritten (beat the Hunger on Nightmare), Seven Seals (clear all seven gates), Both
Endings (end one cycle each way).

## 10. Tuning steps

1. Ship with `DIFF` 7th values at x1.18 of S; run the tier probe on gate 6 to set `REC_BASE[6]`.
2. Measure `abbeyDay` (full, both seeds); tune `ABBEY_TOWER` if past 100.
3. Measure Hunger attempts at Recommended; tune `HUNGER_ECHO`, then phase HP split (40/30/30 to start).
4. Quiet Valley: bot clears must stay at or above cycle-one numbers (it is gentler); Keeper's Cycle on the NG+ curve.

## 11. Tests

- `86-abbey`: door sealed on a fresh save; each route opens it; old saves load sealed; gate 6 excluded from Rift/Trials;
  Scriptorium cross-out removes the minion and the echo.
- `87-hunger`: three phases trigger once each; echoes come from the Memorial (stand-ins when empty); Write Your Name is
  stopped by Ward and freeze; the six-action rule ends phase three.
- `88-endings`: both choices set `S.ending`; both New Game+ starts are valid; Quiet Valley blocks raising until the first
  clear; inscriptions are offered only when earned and survive a save round trip and a second NG+.

## 12. Turkish, Codex, UI

~180 strings (8 passages are long, ~2,500 words of story). Codex pages: Vane Abbey, the Hunger, Endings, Inscriptions.
UI: the sealed door with its key slots on the Gates tab; the Scriptorium page; the three-segment boss bar; the choice
page; an Endings row in the Records.

## 13. PR split

- **PR A**: the gate (keys, foes, loot, Scriptorium), the Hunger without R2 moves, act VI up to the fight, tests 86-87.
- **PR B**: the choice, both New Game+ variants, inscriptions, titles, epilogues, test 88, docs.

### As built (PR A)

- Code in `src/game-abbey.js` (after game-progression.js, before tr.js). `GATE_N`=6 counts the valley's gates and
  `ABBEY`=6 is the new index; every "pick a gate" rule (curses, raids, rival gates, Trials, the Rift, shop stock, `topGate`,
  gate titles, the objective) loops `i<GATE_N`. `gateLocked(i)` replaces the level check in `startRun` and the gate card.
- Keys: `ABBEY_KEYS` (deep: Throne, Tower floor `ABBEY_TOWER`, `ABBEY_PAGES` pages; secret: Throne and all six masters,
  counted from the `secret_i` tallies of the whole save). `abbeyCheck` runs in `checkTitles`. `S.abbey={keys,open}`
  (`abbeyFix` on load; old saves load sealed). The card stays hidden until the Throne falls, then shows the sealed door
  with both key slots and their parts ticked off.
- Five rooms (`ABBEY_ROOMS`), the Scriptorium forced as the only door before the boss room (`rollDoors`, quiet door
  `script`). The raise screen lists the army and Reserve with "Cross out" (two presses); `scriptCross` returns gear,
  removes the minion without a Memorial entry, sets `r.crossed` and `r.lbless` (its top trait: a compound, else a death or
  affix trait, else the newest). `ledgerBless` makes `hasTrait` true for every minion in the boss room only.
- Kits: `unwritten` and `recite` live in `KITS` but not in `KIT_IDS` (no other gate rolls them; the bestiary and the
  doors show them). Unwritten is checked first in `hurtFoe` (`abbeyMiss`); minions retarget away from an un-inked
  Unwritten foe (`abbeyTarget`). Recitation is an intent (`read`, shown as "Reads X aloud").
- The Hunger: `hungerSetup` gives it the boss-kit rotation without `BOSS_KITS_ON` (it always has its pages);
  `checkPhase` skips it. Moves in `BOSS_ABIL` (erase, hollow, hunger, remember "Call the Fallen", readaloud, writename,
  devour; the last two telegraph). Echoes are `makeEnemy` foes of the abbey kind of their role, at `HUNGER_ECHO` of the
  stats with the Memorial entry's tier (capped at Elder) and its traits Thick, Vicious and Unmarred applied; they leave no
  body (`echoFades`). Stand-ins for an empty Memorial share one name. Gold ink: `.u-name.echo`.
- Simplifications: Read Aloud mutes the trait for the fight (it Hexes the strongest minion when there is none to read)
  instead of Silencing; the defeat recap names the echo through the usual blow note; Erase removes the Ward and Unholy
  Frenzy, else every minion's Bone Shield (there is no general buff list to pick "the highest" from); Normal and Hard are
  not limited on the first opening (difficulties unlock by clears like every gate).
- Loot: set 6 (the Scribe's Regalia, tier 4, `SET_BONUS[6]` sdmg/studyp, then Marginalia) and `UNIQ[6]` Oswin's
  Ledger-Chain (`chainK` in `extraMul`, `chainSpear` from `hurtAlly`). The Hunger's heart is The Hunger's Tooth.
- Story: act VI (seven passages), three abbey-only pages (21-23; `nextPage` only offers them inside an abbey run), boss
  and phase lines, five titles (Riverturner, Scriptor, Echo-Breaker, Unwritten, Seven Seals). The Last Keeper, The Hand
  That Writes and Both Endings come with PR B.
- Tests: `86-abbey` (9) and `87-hunger` (8).
- Bot: `pickGate` honours `gateLocked`; it records `abbeyDay`. The bot climbs the Tower only after its days, so the deep
  route mostly opens then: after the final climb it checks the keys and plays up to 8 abbey runs (opening a still-sealed
  door for measuring only, reported apart). The tier probe can fight the sealed abbey.

## 14. Risks

- **Late content nobody reaches**: if `abbeyDay` is past 100 for most bots, the secret route is the fix (it needs no Tower
  100). Keep both keys.
- **Echoes that are too strong** for players with an Eternal-heavy Memorial: echoes cap at Elder tier.
- **Players who never want it to end**: the choice waits forever, and Keep writing ends nothing.
