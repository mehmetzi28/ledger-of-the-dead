# R14. Sieges 2.0: the Inquisition escalates

**Priority** P3. **Closes** G23. **Size** L. **Needs** R5 (dread, Bell Tower); R1/R2 supply kits for the new foes and bosses.
**Pillars served**: 4 (choices with a cost), 5 (the Ledger is a story), 1 (the army defends its home).

## 1. The problem

Sieges (`SIEGE_*`): every 7-10 days once the town has 2 building levels, three waves (militia, crossbowmen, chaplains,
witch-hunters, then the Inquisitor Captain with Royal Decree) at x2.2 HP, x2.5 attack; you guard one building and bring
up to 2 Reserve minions. Win pays ~1.5 clears; lose damages a building or fines 10% gold. The bot holds 84-86%. It is the
same siege on day 20 and day 100.

## 2. Siege tiers

Five tiers. The tier rises by one after **two sieges won in a row** and falls by one after a loss. Each tier adds a foe
kind, a rule and pay.

| Tier | Name | New foe | Rule | Pay |
|---|---|---|---|---|
| 1 | **Militia** | (today's four kinds) | as today | x1 |
| 2 | **Templars** | Templar Shieldwall (shield-bearer), Flagellant (frenzy) | wave 1 has a Templar elite | x1.2 |
| 3 | **Inquisition** | Relic Bearer (banner-bearer), Exorcist (silences a minion, breaks Ward) | four waves | x1.4 |
| 4 | **Crusade** | Pyre Priest (fire bomber), Hound Master (pack hunter + 2 hounds) | the attackers burn one building's perk for the night | x1.7 |
| 5 | **Purge** | (all of the above) | five waves; the boss has two phases | x2.0 |

Dread (R5) shifts the starting tier: Calm -1, Terror +1.

## 3. Choose the wall

At the warning (the dawn before; a day earlier with the Bell Tower), pick which approach to hold:

| Wall | Waves | Pay | Special |
|---|---|---|---|
| **North road** | +1 foe per wave | +25% | the Bell Tower's defenses work double here |
| **River gate** | one foe fewer, but all elites | +15% | the attackers' boss acts a turn later |
| **Graveyard** | as normal | as normal | the Ossuary perk doubles: fallen attackers rise for you at waves 2 and 3 *and* 4-5 |

The walls you don't hold are left to the Bell Tower. With the Bell Tower at level 3 or higher they cost nothing. Below
that, a lost siege damages a building on an unheld wall instead of the one you guarded.

## 4. Siege bosses by tier

| Tier | Boss | Kit (R2 engine) |
|---|---|---|
| 1-2 | **Inquisitor Captain** | Royal Decree · Purge (strips a minion's evolution buffs for the wave) · Rally (militia +20% attack) |
| 3 | **The Witchfinder General** | Mark of the Witch (marks a minion: +50% damage to it) · Pyre Sentence (telegraphed: burns the marked) · Iron Faith (immune to Hex and Silence) |
| 4 | **The Saint of Pyres** | Pillar of Fire (fire, a column: one front and one back) · Martyr (on first falling to 0, rises at 30% once) · Sermon (+20% damage to all attackers, 2 turns) |
| 5 | **The Grand Inquisitor** | every earlier boss's signature in rotation; phase two *Absolution*: heals all attackers 20% and gains a shield while any Templar stands |

## 5. Defenses built in town

The Bell Tower's wall defenses (R5) are the base. Sieges 2.0 adds **siege works**, bought with gold and bone dust, used
once per siege (rebuilt after):

| Work | Cost | Effect |
|---|---|---|
| Caltrop field | 800 gold | wave 1 starts with 2 bleed stacks each |
| Oil cauldron | 1,500 gold, 10 dust | the first wave's front row takes 15% max HP as fire |
| Bone palisade | 2,000 gold, 20 dust | your front row gains a Bone Wall shield at each wave start |
| Corpse catapult | 3,000 gold, 30 dust | between waves, a stored body is thrown: 20% of its max HP to every attacker |
| Ward stones | 5,000 gold, 50 dust | Royal Decree and Silence are blocked once per wave |

## 6. The Inquisition arc

Four passages as the tiers climb (*Templars on the road*, *An Inquisitor's letter*, *The pyres in the valley*, *The last
crusade*), and a confrontation:

- On first reaching tier 5, the next siege is **The Purge**: five waves, the Grand Inquisitor, no wall choice (all walls).
- **Win**: the Inquisition sues for peace: no sieges for 20 days, dread falls to Calm (10), the title *The Unburnt*, the
  Grand Inquisitor's heart (forges a heartforged piece with Inquisition lines). After the peace, sieges return at tier 3.
- **Lose**: the tier resets to 3; the Purge can be met again on reaching tier 5.

## 7. Numbers and tuning

- Held 80-87% averaged over tiers; at least 70% at Purge; tier 1 at least 90%.
- Pay per siege grows with tier but each wave is harder, so value per siege rises only ~10% per tier.
- Bot measures: tier distribution at day 60 and 100; held per tier; Purge day.

## 8. Save

`S.siege.tier`, `S.siege.streak`, `S.siege.wall`, `S.siege.works = {k:true}`, `S.siege.peace = {until}`, `S.siege.purge
= {won, day}`. Loader: tier 1.

## 9. UI, Turkish, Codex, titles

UI: the siege warning card becomes a planning page (tier, waves preview with kits, wall choice, works to buy, guards);
the tier shown on the Town tab. ~170 strings (6 foes, 3 bosses' kits, works, 4 passages). Codex: Siege tiers, Walls,
Works, the Inquisition. Titles (5): *The Unburnt*, *Holding the Road* (10 north-road wins), *Ten Tiers* (reach tier 5
twice), *Pyre-Proof*, *Every Work Built*.

## 10. Tests

`106-siege-tiers`: tier rises and falls; dread shifts the start; walls change waves and pay; works apply once; each boss's
kit; the Purge and the peace; save round trip.

## 11. Bot policy

Hold the graveyard when the Ossuary is 3+, else the river gate; buy the palisade and caltrops; `"siege":"north"` probe.
`"off":["siegetiers"]`.

## 12. Risks

- **Tier 5 is a wall**: lesson 3; the Purge's difficulty is in rules (waves, two phases), and the target is 70%.
- **Sieges eat too many days**: one siege per 7-10 days as now; the peace gives a long break.

## As built (PR A: tiers, walls, bosses)

- **Code**: `src/game-siege2.js` (new, after game-valley.js). Nothing in it rolls Math.random: the waves are tables and
  the burnt perk follows the guard. `let STIERS_ON` is the bots' `"off":["siegetiers"]` switch (every siege at tier 1).
- **Tier**: `S.siege.tier` and `S.siege.streak`, written only once they change (absent: tier 1). Two held in a row raise
  it, a loss lowers it (`stierMove`, from siegeWon and siegeLost). The night's tier is `siegeTier()`: the stored tier, Calm
  -1, Terror +1, clamped 1-5. Stored on the run as `S.run.tier` with `S.run.rooms` (3, 3, 4, 4, 5).
- **Waves**: `STIER_WAVES` by tier, with seven new kinds in `SIEGE2_FOES`, each with an R1 kit: Templar Shieldwall
  (Shieldbearer, vanguard), Flagellant (Frenzy, reaper), Relic Bearer (Banner-bearer), Exorcist (Sapper), Pyre Priest
  (Bomber), Hound Master (Pack hunter, reaper) and War Hound (Pack hunter; two come with the Hound Master). From tier 2
  wave 1 is led by a Templar elite. Tier 1 is the old table, unchanged.
- **Bosses**: tier 1-2 the Inquisitor Captain; tier 3 the Witchfinder General (Mark of the Witch: the strongest minion
  takes +50% for 3 turns; Pyre Sentence, telegraphed: 180% fire on the marked; Royal Decree; Iron Faith: never Hexed or
  Sundered); tier 4 the Saint of Pyres (Pillar of Fire, telegraphed: 130% fire on one front and one back unit; Sermon:
  every attacker +20% damage for 2 turns; Royal Decree; Martyr: rises once at 30%); tier 5 the Grand Inquisitor (Decree,
  Mark, Pyre, Pillar; second phase Absolution: every attacker heals 20%, and it takes half damage while a Templar
  Shieldwall stands). Boss stats x1 / x1.1 / x1.15 / x1.25 HP.
- **Walls** (`S.siege.road`, picked on the intro screen, tonight only; the Graveyard is the default and is not written):
  North road +1 foe a wave (a militia spearman, at most 5), the Bell Tower's five defenses twice as strong, pay x1.25;
  River gate one foe fewer, every foe an elite, the boss's first move a turn late, pay x1.15; Graveyard as usual, and the
  Ossuary raises two attackers each wave instead of one.
- **Tier 4+**: the strongest perk building you did not guard loses its siege perk for the night (`S.run.burnt`; every
  perk read goes through `sbl(k)`). The intro screen marks it "burnt tonight".
- **Pay**: `siegeGoldPay` x `STIER_PAY` (1, 1.2, 1.4, 1.7, 2) x the wall's pay.
- **Not built**: the doc's "unheld walls below Bell Tower 3" rule; the guard already decides what burns.
- **UI**: the tier chip and wave count on the intro screen, the wall chips (`sroad`), the tier and streak on the Town tab;
  the Codex's sieges page gains Siege tiers, Walls and The living by tier; the bosses page lists all four siege bosses.
- **Tests**: `tests/groups/98-siege2.js` (6 tests). The invariant on siege waves now reads `S.run.rooms`.
- **Tuning** (`STIER_K`, foe HP and attack by tier: x0.8, 1.2, 1.5, 1.85, 2.2): full bot (seeds 7700/9100) holds 94/92%
  of sieges; by tier t1 84/83%, t2 96%, t3 99-100%, t4 97-99%, t5 85-100% (13-15 fought); average tier 2.5-2.6 on day 60,
  4.5-4.6 on day 100. Gates stay at 94% (full) and 95% (market), Tower 86-87, Rift 24-27. Stat multipliers barely move the
  later tiers (the bot ends most waves in one action), so they stay above the 80-87% target; PR B's Purge and works add
  rules instead. The bot holds the Graveyard at tier 1 or with the Ossuary at 3+, else the River gate (holding the River gate
  at tier 1 dropped tier 1 to 65%).

## As built (PR B: works, the arc, the Purge and the peace)

- **Code**: the second half of `src/game-siege2.js`.
- **Siege works** (`WORKS`, `S.siege.works = {k:1}`): built once on the Town tab, each serves every siege after (the doc's
  "rebuilt after" read as kept). Caltrop field 800 gold (wave 1 bleeds 4% max HP a turn for 3 turns), Oil cauldron 1,500
  + 10 dust (wave 1's front row loses 15% as fire), Bone palisade 2,000 + 20 (front-row minions gain a Bone Shield of 15%
  at every wave), Corpse catapult 3,000 + 30 (from wave 2 a fallen attacker is thrown back: every attacker loses 8%),
  Ward stones 5,000 + 50 (once a wave a Royal Decree, Hymn of Silence, Verse of Binding or Decree of Nothing breaks;
  `wardStone` at the top of `fireAbility`).
- **The arc** (`SIEGE_ARC`, `S.siege.arc`): a passage the first time the tier reaches 2, 3, 4 and 5 (Templars on the road,
  An Inquisitor's letter, The pyres in the valley, The last crusade), shown again on the Codex's sieges page.
- **The Purge** (`S.siege.pd`): reaching tier 5 makes the next siege the Purge: tier 5 whatever the dread, every wall at
  once (the wall `all`: one more foe a wave, no wall pay, no choice). Won: `S.siege.peace = {until}` (no siege for 20
  days; `siegeTick` schedules nothing), dread set to 10, the trophy `b:The Inquisition` (the Grand Inquisitor's heart,
  forged at the Forge with fire resistance, Will, Constitution, HP, Ward or attack), tier 3, `S.siege.purge = {won, day}`.
  Lost: tier 3; the Purge returns at tier 5. The tier now moves after the town's siege effects in `siegeWon`.
- **Planning card**: from the warning on, the Town tab lists the waves to come (kinds and kits) and lets you pick the
  wall the day before. The Town tab also shows the peace and the works.
- **Titles** (5): The Unburnt (break the Purge), Holding the Road (10 North-road wins), Ten Tiers (tier 5 twice),
  Pyre-Proof (hold a tier 4+ siege with no minion down at the end), Every Work Built. 215 titles.
- **Bot**: buys the caltrops and the palisade; the report adds Purges broken.
- **Tests**: three more in `98-siege2.js` (9 in all).
- **Measured** (full bot, seeds 7700/9100): sieges held 92/93% (t1 80/82%, t2 96%, t3-t5 98-100%); 8-9 Purges broken of
  8-9 met across 40 bots (target at least 70%: it is easier than meant, for the same alpha-strike reason as PR A); average
  tier 4.2 on day 100 (the peace pulls it back to 3). Gates 94% (full) and 95% (market), Tower 87, Rift 29-31. Making the
  late tiers truly hard needs rules a one-action wave cannot skip; left for a later balance pass.
