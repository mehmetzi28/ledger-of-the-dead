# R20. Villages of the living: trade, tribute and fear

**Priority** P4 (new system). **Size** L. **Needs** R5 (dread); R19 puts the villages on the map (without it they are
cards on the Town tab).
**Pillars served**: 4 (choices with a cost), 5 (the Ledger is a story), 2 (every death is a resource, and the living are
a temptation).

## 1. Why

The living are one faceless force: they siege you. Dread (R5) gives them a mood, but there is no one to deal with, no
moral choice beyond raising or not, and no reason to care whether they fear you. Three villages give the living faces,
needs and a price.

## 2. The villages

| Village | Character | Trades | Needs | Its people (bodies if raided) |
|---|---|---|---|---|
| **Miller's Ford** | river farmers, practical | grain-salt (preserves bodies), cheap potions | protection from beasts and the drowned | farmhands (vanguard), millers (striker) |
| **Greyhollow** | a mining town, hard and proud | ore (heartforging), iron charms | the mine cleared (R19 site), workers | miners (vanguard), foremen (reaper) |
| **Saint Aldric's** | a pilgrim town at the old road, devout | relics, incense, holy water (cures Hex) | the shrines kept, the dead buried | pilgrims (mender), monks (mender), a knight (striker, gear-bearer) |

Each village has a **standing** with you from -100 (hatred) to +100 (allegiance), starting at -20, and a population
(100-300).

## 3. What moves standing

| Deed | Standing |
|---|---|
| A **favor** done (section 4) | +10 to +25 |
| Trade (each purchase) | +1 |
| Tribute paid (gold) | +1 per 200 gold |
| A siege won (they hear of it) | +3 (fear and respect) |
| A siege lost | -5 |
| Raiding the village (section 5) | -40, and -10 to the others |
| Raising a body from that village's graveyard | -3 |
| Dread band Terror | -1 a day; Calm +1 a day |

## 4. Favors

Each village posts one **favor** a week (a short quest, 1-2 watches):

| Village | Favor examples | Pays |
|---|---|---|
| Miller's Ford | clear the wolf den; drive the drowned from the ford; escort the grain cart (a road fight) | standing, grain-salt, cheap potions for a week |
| Greyhollow | clear the collapsed mine; lend two minions as labor for 3 days (they are away; they gain XP) | standing, ore, a free charm |
| Saint Aldric's | bury the dead at the battlefield (lose the bodies, gain standing); keep a shrine for 7 days (no Desecrate) | standing, relics, a blessing (+5% healing for a week) |

## 5. Raiding a village

The dark path: send the army (one watch, a fight against militia and the village's best) to take its gold, goods and
**its people** as bodies (5-10, at a raise bonus of +15, with village traits: *Pious* (mender heals +10%), *Hardened*
(+10% HP), *Farmhand* (+5% everything, cheap)).

- Standing -40 (that village), -10 (others); dread +15; the village's population drops by the bodies taken.
- A village at 0 population is **abandoned**: its trade and favors end for the cycle; its graveyard becomes a big body
  site; the title *Empty Valley* when all three are.
- The Inquisition notices: the next siege comes 2 days sooner and one tier higher (R14).

## 6. Allegiance (+60 and up)

| Village | At +60 | At +100 |
|---|---|---|
| Miller's Ford | its militia fight one siege wave for you | grain-salt stocks: bodies keep 3 more days (Embalmery) |
| Greyhollow | ore delivered weekly | the forge-master: heartforging lines roll at their best |
| Saint Aldric's | holy water and relics in the market | the knight joins as a living **companion** (a non-raised ally who fights in the army, can't be raised or evolve, grows with the village's standing) |

At -60 and below, a village sends **mobs** (a small extra wave) with each siege, and its trade closes.

## 7. Connections

Dread (R5) is the town-wide mood; standing is per village. Sieges, the Inquisition (R14), faith (Saint Aldric's likes
Morrow; Greyhollow trades with Ulm's followers), the map (R19), expeditions (R6 can escort carts), and the story (each
village has 3 passages: first contact, allegiance, abandonment).

## 8. Numbers

- A friendly path (favors and trade) should be worth roughly what a raid path pays in bodies and gold over a game, so it
  is a choice of style, not of strength (bot probes `"villages":"friend"` and `"villages":"raid"` within 2 points).
- Standing at day 100 for the default bot: around +40 to +60 in two villages.

## 9. Save

`S.vil = {mill:{st, pop, favor:{week, k, done}, ally}, grey:{...}, aldric:{...}}`. Companion: `S.companion = {k, lvl}`.

## 10. UI, Turkish, Codex, titles

Village cards (on the map or the Town tab): standing bar, population, trade stall, favor, raid button (with its costs
shown). ~170 strings. Codex: Villages, Standing, Favors, Raiding. Titles (6): *Friend of the Ford*, *Greyhollow's Debt*,
*Saint's Keeper*, *Empty Valley*, *Neither Feared nor Loved* (all three at 0 at day 100), *The Knight's Oath*.

## 11. Tests

`111-villages`: standing moves by deed; favors pay once a week; a raid takes bodies and drops population; abandonment;
allegiance rewards; the companion fights and saves; siege and dread hooks.

## 12. Bot policy

Friendly by default (do favors that fit the day); `"villages":"raid"` probe raids when the army needs bodies.
`"off":["villages"]`.

## 13. Risks

- **The raid path is just better**: its costs (siege tier, dread, trade loss) are measured; tune the bodies taken.
- **Moral weight in a game about necromancy**: the choice is the point; the text never lectures; both paths have endings.
