# R23. Bloodlines and the grave garden

**Priority** P4 (new system). **Size** L. **Needs** R5 (the Embalmery and its Grave Garden spec become this round's
base); R12's kill counts feed lineage.
**Pillars served**: 2 (every death is a resource: the fallen strengthen the next), 1 (the army is the character, across
generations), 7 (a long game).

## 1. Why

When an Eternal falls it goes to the Memorial and gives a small army-wide HP bonus through headstones. Nothing of *what
it was* carries on. Raising the same kind again starts from nothing. Bloodlines make a fallen minion's line continue,
and the grave garden makes raising a slow craft as well as a dice roll.

## 2. Bloodlines

- Every foe kind (the 42 gate kinds, Tower kinds, hexers) has a **bloodline** record.
- When a minion of Elder stage or above falls (shatters) or is retired (section 4), it adds an **ancestor** to its kind's
  line: its name, its highest trait, its mark, its kill count.
- Every new minion of that kind raised later inherits from its line:

| Ancestors in the line | Inheritance |
|---|---|
| 1 | +3% stats |
| 2 | +6% stats; 25% chance to rise with one ancestor's trait instead of a random one |
| 3 | +9%; 50% trait chance |
| 5 | +12%; the trait is guaranteed; rises one level higher |
| 8 (cap) | +15%; also inherits a mark at Elder without choosing |

- The line is per kind, so a player who loved their Crypt Warden's Gravekeepers builds a dynasty of them.
- The bestiary page of a kind shows its line (the ancestors' names and traits).

## 3. Retirement

A living minion of Elder or above can be **retired** in town (the Charnel Yard, R5): it leaves the army for good, goes to
the Memorial with full honors (a headstone at no cost), and joins its line as an ancestor counting double. This gives a
reason to let an outgrown minion go with meaning instead of letting it sit in the Reserve.

## 4. The grave garden

The Embalmery (R5) gains a garden: **plant** a body (kept from a run) in a plot; it grows for days and is raised later,
stronger.

| Days planted | Raised as |
|---|---|
| 1-2 | as the body was (no change), raise +10% |
| 3-4 | one level higher per day; raise +20% |
| 5-7 | **one stage higher** (a Greater from a fresh body), raise +30% |
| 8+ | over-ripe: the body rots (Rotten condition) unless frozen by Vesh's boon (R8) |

- Plots: 2 at Embalmery L1, +1 per level (6 at L5).
- **Fertilizers** (R4 brewing): *Bone Meal* (bone dust: +1 level), *Grave Salt* (keeps the body from rotting a day),
  *Blood Soil* (a mender's trophies: the body rises with a mender trait), *Moonlit Water* (Pale Tide omen days: +stage).
- Seasons (R25): spring grows a day faster; winter a day slower.

## 5. Grafting

At the garden, a planted body can be **grafted** with a trophy of another kind (one per body): it rises with that kind's
kit trait (R1) as a second trait. The first cross-kind minions: a Rat-Warren body grafted with a Shield-bearer trophy
rises guarding.

## 6. Connections

The Memorial (ancestors), the bestiary (lines on pages), traits and compounds (inherited traits feed compounds in
fusion), the Embalmery and brewing (garden and fertilizers), seasons and omens (growth), R12 kill counts (an ancestor's
kills shown), the Choir god (R8: its rank 5 sings for ancestors too).

## 7. Numbers

- Lines should add ~2-3% to the late army's strength for the `full` bot (it retires Elders it outgrows).
- Garden raises: 5-10% of a late game's raises; the stage jump is the attraction for players who can't raise Greater
  bodies yet.
- `"off":["lines","garden"]` each about a point.

## 8. Save

`S.lines = {kind: [{name, trait, mark, kills, day, dbl}]}` (cap 8 per kind), `S.garden = [{body, day, fert:[], graft}]`.

## 9. UI, Turkish, Codex, titles

The garden as plots with growth bars and fertilizer slots; the line on each bestiary page and on the raise card ("Line of
Ash: 3 ancestors, +9%"). ~110 strings. Codex: Bloodlines, Retirement, The grave garden, Grafting. Titles (5): *Dynasty*
(a line of 8), *Green Thumb* (raise 20 garden bodies), *Over-Ripe* (let one rot), *Honorable Discharge* (retire 10),
*Strange Fruit* (raise 10 grafted bodies).

## 10. Tests

`114-lines-garden`: ancestors join on fall and retirement (double); inheritance by count; garden growth by days; rot past
8; fertilizers; grafting; seasons modify growth.

## 11. Bot policy

Retire Elders that leave the top army; plant the best boss or elite body each run; graft a Shield-bearer trophy on
vanguard bodies.

## 12. Risks

- **Lines snowball one kind**: +15% cap; the line helps raising, not fusion stacking.
- **Too many town chores**: the garden auto-replants the last choice if the player wants ("keep planting").
