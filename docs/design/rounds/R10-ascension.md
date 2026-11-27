# R10. Ascension: New Game+ rework

**Priority** P2. **Closes** G21. **Size** L. **Needs** R3 (the two endings set a cycle's flavor); R1/R2 supply variant kits.
**Pillars served**: 7 (a long game), 4 (choices with a cost), 6 (bosses keep paying).

## 1. The problem

New Game+ (`startNGP`) restarts at level 1 keeping titles, bestiary, lore, records, Memorial, rival name and one unique.
Each cycle: foes +30%, rewards +25%, and up to 3 of 7 pacts (more HP, more damage, regen, -raise, no potions, -healing,
one watch fewer) for more XP, gold and drops. Every cycle is the same valley with bigger numbers.

## 2. Ascension levels

Each completed cycle adds an **ascension level**. Starting a cycle, the player picks the next level's **rule** from three
drawn from the list below; chosen rules stay for every later cycle (the valley remembers). Flat growth drops from +30% to
**+15% per level** so rules carry the difficulty (lesson 3: rules over multipliers).

| Rule | Effect | Reward |
|---|---|---|
| **Two Faces** | each gate boss starts in its R2 phase two | boss hearts +1 |
| **Fewer Souls** | Soul max -1 | ultimate +25% |
| **Elite Doors** | one door in three is elite | elite drops +1 tier chance |
| **Hungry Ledger** | raising costs 20% more mana | raise chance +5 |
| **Short Year** | 80 days instead of 100 (where the calendar matters: sieges, rival, orders) | gold +15% |
| **Kits Plus** | ordinary foes get a second kit from their gate's pool | bestiary progress x1.5 |
| **No Retreat** | no Retry after a lost room | XP +15% |
| **Cold Town** | dread starts at 60 and drifts toward 50 | siege pay +25% |
| **Early Rival** | the rival begins at chapter 2 (R7) | rival uniques' powers +20% |
| **Thin Tether** | the Soul Tether caps blows at 60% instead of 50% | +10% army HP |
| **Black Omens** | omens 40% of days, and only the harsh ones | omen calls cost nothing once a week |
| **Wandering Masters** | secret masters appear twice as often and are stronger | their hearts +1 |
| **Old Wounds** | minions bind back from a fall at 25% instead of 40% | Memorial honours +50% |
| **Iron Market** | market stock 2 pieces a day | heartforging -20% |
| **The Book Hungers** | each run, one random minion is "read": it fights at -20% | its XP x2 |

## 3. Valley rewrites

Each cycle rewrites one gate (drawn, never the same twice in a row):

- **A boss variant**: the gate's boss in **Ledger form** (R3): new name ("the Rat King, Twice Crowned"), its phase two
  from the start and one new move from a list of six per boss.
- **Two foe variants**: two kinds swapped for variants with new names, a new kit from R1's pool, and a new trophy (forges
  that gate's set at +1 tier chance).
- **A cycle curse**: one curse available only that cycle (from R13's new curses) on that gate.
- The rewritten gate shows a red seal on the Gates tab; its passage *The page was written over* plays on first entry.

## 4. Pacts as rules

The seven pacts stay (S.pacts, up to `PACT_MAX` 3), keep their numbers and add a rule:

| Pact | Number (today) | Added rule |
|---|---|---|
| Thick Hides | foes +20% HP | Bulwark-stance foes enter the stance at once |
| Sharp Claws | foes +15% damage | strikers' crits apply bleed |
| Knitting Flesh | foes regen 3% | mender-priests cleanse twice |
| Deaf Graves | raise -10 | bosses' bodies need a Soul to raise |
| Dry Throat | no potions | draughts (R4) still work, at half effect |
| Bitter Blood | healing -25% | Dark Mending also heals foes 5% |
| Short Nights | one watch fewer | expeditions take one night more |

## 5. Carry choices

At cycle start, besides the unique: pick **one** carry:

| Carry | What crosses |
|---|---|
| A trait | one trait from any army minion goes to the first raise of the cycle |
| A mark | one evolution mark, given to the first minion to reach Elder |
| A building | one building starts at level 2 |
| A Riftborn item (R9) | one, at half its depth |
| A heartforged piece (R4) | one, its lines at 70% |

## 6. Endings tie-in (R3)

- **The Quiet Valley** (Close the book) is an ascension cycle with no rule drawn and -15% foes; its carry choice is free
  (two carries).
- **The Keeper's Cycle** (Keep writing) draws one extra rule (two picks), and grants an inscription each time it ends.
- The ascension level shows on the title screen and the Records beside the endings.

## 7. Numbers and tuning

- Cycles 1-3 at their Recommended levels on the gate curve (~80% `market`), measured with forced rule picks per probe
  (`"asc":["twofaces","elitedoors"]`).
- Each rule's reward should leave the cycle's value within ~5% of a no-rule cycle for the `full` bot.
- Valley rewrites: the rewritten gate's clear rate within 5 points of its normal self at the same level.

## 8. Save

`S.asc = {lvl, rules:[...], offered:[...], rewrite:{gate, boss, foes:[...], curse}, carry}`. Loader: `S.ngp` cycles become
ascension levels with no rules (the old +30% per cycle is replaced by +15% per level, so old NG+ saves become easier; the
first dawn shows a note).

## 9. UI, Turkish, Codex, titles

UI: the cycle start page (rule cards, carry choice, pacts); the red seal on rewritten gates; ascension on the Records.
~170 strings (15 rules, 6 bosses x 6 Ledger-form moves, variant foe names). Codex: Ascension, Rules, Rewrites. Titles (5):
*Ascendant III / VI / X*, *Every Rule* (all 15 chosen once), *Rewritten* (clear six rewritten gates).

## 10. Tests

`100-ascension`: rules apply and stack; offered rules never repeat a chosen one; rewrites build a valid gate; pacts' rules;
carries cross; old NG+ saves convert.

## 11. Bot policy

Pick rules by the probe's measured cost (cheapest first); carry the best trait. `"off":["asc"]` falls back to +30% cycles.

## 12. Risks

- **Old NG+ saves get easier**: shown once, and the loader gives one free rule pick at the next cycle start.
- **Rules that hit one build**: three are offered, so a player can avoid a rule their build hates.

## As built (PR A, #26)

- **Code**: `src/game-asc.js` (new, built right after game-rift.js). `ASC_RULES` holds 13 rules; `ASC_*` holds their
  numbers. A rule acts only through `ascOn(k)`, which needs `S.ngp>0`, so a first cycle and every bot run never see one.
- **Levels**: the ascension level is the NG+ cycle (`S.ngp`). Flat growth per cycle went from +30% to +15% (`NGP_FOE`);
  `ngpReward` is multiplied by `ascReward` (No Retreat +15%, Black Omens +10%).
- **Pick**: the New Game+ page draws three rules not yet chosen (`ascOffer`, from `dayHash`, fixed for the level, so
  reopening the page never rerolls). The pick is optional; the chosen rule joins `S.asc.rules` for every later cycle.
- **Rules built** (13 of 15 in the spec, plus two new): Two Faces, Elite Doors, Hungry Ledger, No Retreat, Cold Town,
  Thin Tether, Black Omens, Wandering Masters, Deep Scars (replaces Old Wounds: shatter -10 points instead of Memorial
  honours), Iron Market, The Book Hungers, and the new Crowded Gates (one more foe per gate room, gear drops +20%) and
  Blood Price (potions x2 price, +25% effect).
- **Hooks**: buildRoom (extra foe, boss phase two), killLoot (boss and master hearts), rollDoors, the drop chance,
  raiseCost/raiseChance, canRetry, dreadRest, siegeGoldPay, the tether cap, extraMul (Thin Tether +10% army HP, the read
  minion -20% damage), secretChance and makeSecret HP, shatterOdds/bind HP, the shop stock, hfCost, potion price and heal,
  dayOmen, startRun (`ascRead` picks the read minion; minionXp doubles its share).
- **Not built yet** (PR B): Kits Plus, Early Rival, Short Year, Fewer Souls; valley rewrites; pacts as rules; carry
  choices; the endings tie-in; the *Rewritten* title.
- **Titles** (4): Ascendant III / VI / X and Every Rule (all 13). Total 193.
- **Save**: `S.asc={rules:[]}`; `ascFix` drops unknown and repeated rules. Old NG+ saves keep their cycle count with no
  rules and get +15% per cycle instead of +30% (easier; no note shown).
- **Tests**: `tests/groups/98-ascension.js` (offer never repeats a chosen rule and is stable; rules stack across cycles;
  rules are off in cycle 0; hooks apply; a save round-trips). 846 tests.
- **Balance**: rules only exist in NG+, which the bots never start; market and full runs are unchanged (see 04).

## As built (PR B)

- **Two more rules** (15 in all): **Kits Plus** (ordinary gate foes carry a second kit, `e.kit2`, drawn from the kits of
  their gate's other kinds and limited to `ASC_KIT2`, the kits that act through `hasKit` alone; every second kill of a
  two-kit foe counts twice toward the bestiary) and **Heavy Souls** (replaces Fewer Souls: an ultimate costs one Soul more,
  `ultCost`, and the Soul cap rises with it; ultimates are 25% stronger, `ascUlt`). **Short Year** and **Early Rival** were
  dropped: the calendar has no year end to shorten, and after the rival's war (R7) the rival is gone for good in later
  cycles, so neither would bite.
- **Valley rewrites** (`rwPick`, `rwRoom`, `rwEnter`, `rwCleared`): every ascension cycle but the Quiet Valley writes over
  one gate (from `dayHash`; never last cycle's gate or the Keeper's Ledger boss). Its boss returns in Ledger form ("…,
  Written Over": phase two from the start, its twist, hearts x2 through `e.ledger`) with one move borrowed from another
  gate boss (`GATE_ABIL`, the same pool Tower wardens borrow from). Two of its kinds come back **Ink-Wet** (`e.rwv`):
  another kit (`kitO`), +15% HP (`RW_HP`), trophies x2 (`RW_TRO`). The gate card shows a "Written over" seal; the first
  entry each cycle logs the passage *The page was written over* (story entry `rewritten`). A cycle curse (R13) is not
  built yet.
- **Carries** (`carryOpts`, `carryPack`, `carryApply`, `carryTrait`): besides the unique, one more thing crosses (two
  into the Quiet Valley): a trait from any army or Reserve minion (given to the cycle's first raise, `S.asc.ct`), a
  building at level 2 (any building at 2 or more), a Riftborn piece at half its depth (attunements reset), or a
  heartforged piece with its lines at 70% (`CARRY_*`). The evolution-mark carry was dropped: marks are tied to a role and
  a stage and would need a minion to hold them.
- **Endings tie-in** (`ascPicks`, `carryN`): Close the book draws no rule and no rewrite, and gives two carries; Keep
  writing offers four rules and takes two. The endings' New Game+ lines say so. (Each ending already offers an
  inscription.)
- **Pacts as rules** (`PACT_CLAW_*`, `PACT_DRY`, `PACT_MEND`): Thick Hides braces Bulwark-stance foes on turn 1; Sharp
  Claws deepens a striker's crit bleed to 50% of its attack for 3 turns (the old crit already bled at 30% for 2, so the
  spec's "crits apply bleed" became a deeper bleed); Knitting Flesh lets a foe mender's heal clear its target's wounds and
  conditions; Deaf Graves makes a boss's body cost a Soul to raise; Dry Throat now allows draughts at half effect; Bitter
  Blood makes Dark Mending heal every foe 5%; Short Nights adds a night to every expedition.
- **Title**: *Rewritten* (clear six rewritten gates, `T_('rewritten')`). 194 titles.
- **Save**: `S.asc` adds `rw`, `rwP` (last cycle's gate), `ct` (the carried trait) and `kp` (the Kits Plus counter);
  `ascFix` checks each. `expFix` now accepts either expedition length (the loader runs with no live save, so it cannot read
  the pacts) and keeps the save's key order, which fixed a fuzz-found round-trip mismatch.
- **Recommended levels follow the cycle** (`REC_NGP` .5, `ngpRec` in game-data.js): the gate advice, the farming falloff and
  the bot's entry level add half the modeled shift for `ngpFoe` (NG+1 about +1-2 levels, NG+3 +2-7, rising with the gate).
  Without it a fresh NG+3 bot entered gates at first-cycle levels and cleared 30%.
- **Bot**: `"ngp":N,"asc":[...],"pacts":[...]` starts every bot as a fresh save at that ascension level with those rules
  and pacts (a probe; it carries nothing over). See 04 for the probe numbers.
- **Tests**: four more in `98-ascension.js` (Kits Plus and Heavy Souls; rewrites, the seal, the passage, the title and both
  endings; carries; the pacts' rules). 850 tests.
