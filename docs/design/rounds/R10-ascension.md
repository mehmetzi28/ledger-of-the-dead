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
