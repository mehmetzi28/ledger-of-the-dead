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
