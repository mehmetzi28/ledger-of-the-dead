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

## As built

### PR A: villages, standing, the stall, tribute and favors
- **The villages** (`src/game-villages.js`, cards in `src/ui-map.js`): three nodes on the Valley map (Miller's Ford
  south by the river, Greyhollow by the mine, Saint Aldric's on the old road north-east), known from the start, with 11
  new roads. The vellum grew to 100x84. No Town tab cards: the map holds them.
- **Standing** (`stand`, `vilBand`): -100..100 from -20, bands Hatred, Fear, Wary, Friendly, Allegiance. Prices move by
  standing/400 (25% either way at the ends); at -60 and below the stall, tribute and favors shut.
- **The stall**: grain-salt (a new good: at dawn each sack keeps one dug body from crumbling), a Healing Draught at 70%,
  ore, an iron charm (a kit of the Iron Orchard's, Friendly and once a week), a relic (devotion; not for the Profane) and
  incense (dread -3). Each purchase +1. **Tribute**: 25 gold a level for +5, once a day per village.
- **Favors**: one a week per village from `dayHash` of the week. Miller's Ford: the den, a cart, the ford. Greyhollow:
  the mine, a cart, a worker (a dug body). Saint Aldric's: bury a battlefield, keep a shrine, a cart. The den, the mine,
  the ford's search and the shrine choices do them where they happen (`favHook`). The **escort** is a road fight (a run
  flagged `r.sv='escort'`): no watch, like the road's encounters (first built with a watch; the bot runs showed it was
  charged twice and the favor cost too much). A favor is +10 (the spec's 10-25, at the low end so the friendly bot
  lands near the spec's day-100 standing) and pays grain-salt and a draught, ore and gold, or a week's blessing (menders
  heal 5% more, through `healK`).
- **Hooks**: sieges won +3 and lost -5 (every village), a body raised from a village's graveyard -3, Terror -1 and Calm
  +1 a dawn, a pilgrim spared +3 or taken -5 and a shrine desecrated -5 (Saint Aldric's). Population is shown and saved;
  raids use it in PR B.
- **Save**: `S.vil={mill:{st,pop,fav:{w,k,done},td,cw},grey,aldric,salt,bless}`, cleaned by `vilFix`; an old save stays
  without it until a village is looked at.
- **Titles**: Friend of the Ford, Greyhollow's Debt, Saint's Keeper (each at +60). Empty Valley, Neither Feared nor
  Loved and The Knight's Oath wait for PR B.
- **Codex** page "The villages", a tip, Turkish for every string (village names stay English).
- **Bot**: friendly; one favor a week at most, from day 10, only within two steps of where it stands; a weekly tribute
  to the nearest village with the lowest standing; incense when the town is afraid. `"off":["villages"]`.
- **Measured**: see 04-balance (market unchanged; full 91%, Tower 84.8, sieges 91%, about 2 levels lower at day 100
  than with the villages off).
- **Tests**: `tests/groups/98-villages.js` (13 tests); 972 in all.

### PR B: raids, abandonment, allegiance, the knight, the mobs
- **Raids** (`raidStart`/`raidRoom`/`raidWon`, a run flagged `r.sv='raid'`): a walk that must leave a watch, then a
  watch for the fight (three militia and an elite: Miller's Ford a spearman, Greyhollow a witch-hunter, Saint Aldric's
  its knight, or a chaplain when the knight rides with you). Won: 4-6 bodies of its people (Farmhand/Miller,
  Miner/Foreman, Pilgrim/Monk) with a new corpse condition each (`farmhand`, `hardened`, `pious`: +15 to raise and
  the Stalwart, Thick-boned or Warded trait; the spec's own traits would have been three new trait rules, the old ones
  say the same thing), gold (40 a level, more at higher gates) and goods (salt, ore, or devotion for the Profane).
- **What a raid costs**: standing -40 there and -10 with the others; dread +8 (spec 15); the next siege 2 days sooner,
  once until it is fought. The spec's tier bump is built (`VIL_RAID_TIER`) but off: see 04-balance. Population drops
  40-60 a raid; at 0 the village is **abandoned** (`gone`): no stall, favors or raids, standing frozen, its graveyard
  digs twice as deep (`vilGyK`), its last passage.
- **Allegiance**: Miller's Ford +60 holds a siege's first wave once a week (`vilAid`, like the spared rival's aid),
  +100 adds 3 days to the Embalmery (`embDays`); Greyhollow +60 sends 2 ore at the week's first dawn, +100 makes
  reforging roll at the top (`hfReroll`); Saint Aldric's +60 keeps the blessing, +100 sends its knight.
- **The knight** (`knightJoin`/`knightLeave`): Ser Aldwin, a vanguard (hp 1.4, atk 1.1, Stalwart), joins every gate run
  (`startRun`) and siege (`beginSiege`) as a thrall: no army slot, dropped by `returnTown`, `siegeEnd` and any reload,
  so he can never be raised, evolved, sold or saved. His level is your level -3, +1 for every 10 standing over 60. He
  leaves when Saint Aldric's falls under +60, and the village defends with him when you raid it.
- **Mobs**: each village at -60 or worse adds one militia to the first wave of every siege (spec "a small extra wave";
  two each was too many with the dread).
- **Story**: nine passages, act 4 (first dealings on the first trade, allegiance at +60, abandonment).
- **Titles**: Empty Valley, Neither Feared nor Loved (day 100, every village within 10 of 0), The Knight's Oath.
- **Save**: `gone`, `aid` and `S.vil.knight` in `vilFix`; `S.siege.rd` (the raid's notice) in `stierFix`.
- **Bot**: `"villages":"raid"` probe. The friendly default is unchanged.
- **Measured**: see 04-balance.
- **Tests**: 8 more in `tests/groups/98-villages.js` (21 in all); 980 in all.
