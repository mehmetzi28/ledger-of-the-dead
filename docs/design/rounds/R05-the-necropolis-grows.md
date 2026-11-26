# R5. The necropolis grows: town expansion and the town's dread

**Priority** P1. **Closes** G6, G12, G13, G15, B7. **Size** XL, two PRs. **Needs** R4 helps (the Apothecary brews R4's
recipes, upkeep joins R4's sinks); works without it.
**Pillars served**: 1 (the army is the character), 4 (choices with a cost), 7 (a long game).

## 1. The problem

- The town is four buildings (Crypt, Forge, Ossuary, Altar) of three levels each (`BUILD_MAX` 3, costs 1.5k / 5k+30 dust
  / 14k+90 dust). A bot finishes it by about day 30, and then the Town tab is a place to sell.
- The Reserve (`RESERVE_BASE` 6, +2 per Crypt level) is storage: benched minions do nothing.
- The daily quest is a free stat point a day (~100 over a game) that asks for no choice.
- The living (sieges) react only to buildings built, never to what the player does.

## 2. Buildings

Ten buildings. The four existing ones go to **five levels**; six new ones arrive with the town's growth. Levels 3 and 5
each offer a **specialization** (pick one of two, final for this cycle; NG+ resets buildings as today).

Costs per level, shared by all buildings (gold, bone dust): **1.5k / 5k+30 / 14k+90 / 30k+180 / 60k+300**.
`step:1` buildings stay one step cheaper. Levels 4-5 need the Throne of Ash cleared (late sinks, see R4).

### 2.1 Existing buildings, extended

| Building | L1-3 (as today) | L4 | L5 | Spec at 3 (pick one) | Spec at 5 (pick one) |
|---|---|---|---|---|---|
| **Crypt** | +1 army slot and cap, +2 Reserve | +1 slot | +1 slot, +4 Reserve | *Ossuary Halls* +4 Reserve / *War Crypt* minions +5% HP | *Catacombs*: Reserve minions fight in sieges / *Throne Crypt*: +1 more slot |
| **Forge** | -15% reforge/enchant cost | -15% | -15% and heart-forging (R4) -20% | *Smithy* masterwork chance +10% / *Bonewright* enchants cost no gold | *Great Forge* heartforged 3rd line from any boss / *Tempering Pit* temper goes one step past "best" |
| **Ossuary** | +3% raise chance | +3% | +3% | *Charnel Rites* elites raise +10% / *Soul Well* +1 Soul per gate run | *Grave Lord's Seat* bosses raise +10% / *Deep Ossuary* corpse conditions give +5% more |
| **Altar** | +5% mana, Bone Altar -12% | same | same | *Blood Altar* skills cost 5% less / *Bone Altar* empower +1 step | *Black Altar* ultimate charges 15% faster / *Grave Altar* +1 ult charge after a boss |

### 2.2 New buildings

| Building | Opens | Per level (1-5) | Spec at 3 | Spec at 5 |
|---|---|---|---|---|
| **Charnel Yard** | town open | Reserve minions gain XP each dawn: 4% of a level per level (L5: 20% a day), never past the army's highest level -2 | *Drill Yard*: one Reserve minion a day gains a trait reroll / *Bone Pits*: Reserve minions evolve when they cross a stage | *Yard of Heroes*: Reserve minions may earn marks / *Grave Market*: sell a Reserve minion for gold by tier |
| **Library** | 3rd clear | bestiary study +20% per level; L2 unlocks stat respec (cost below); L3 research projects | *Scriptorium*: lore pages give a small stat each / *Archive*: Codex numbers for kits shown at Known | *Forbidden Stacks*: one extra skill rank / *Grand Archive*: Ledgered bestiary pages give +2% damage vs that kind (cap 20%) |
| **Embalmery** | 4th clear | keep **one body** per run out of the gate (L1), raise it in town later at +5% chance per level; bodies keep 3 days (L1) to 7 days (L5) | *Preservers*: kept bodies count as Preserved / *Body Thieves*: +1 body kept per run | *Grand Embalmery*: a kept boss body can be raised even if that boss's soul is taken (once per cycle) / *Grave Garden*: plant a body, raise it 3 days later one tier higher |
| **Bell Tower** | first siege warned | siege warning one more dawn ahead per two levels; each level adds a **wall defense** (L1 caltrops: wave 1 starts with 1 bleed stack each; L2 oil: wave 2 takes 10% fire; L3 bells: wave 3's boss acts a turn later; L4 arrow slits: 5% of foe HP lost at each wave start; L5 sanctuary: one fallen minion revives between waves) | *Watchtower*: see the siege's composition / *Belfry*: raises the siege's pay +20% | *Toll of the Dead*: a siege won lowers dread twice as much / *Iron Bells*: the Captain loses one move |
| **Apothecary** | Forge L2 | potion prices -10% per level; L1 brewing (R4 recipes), L3 +1 belt slot, L5 brews two at once | *Distillery*: oils last two runs / *Censer House*: incense counts double for raise chance | *Alchemist*: one free brew a day / *Plague Kitchen*: draughts affect the army too |
| **War Room** | first raid | squad size +1 at L1, L3, L5; raids won +2% per level; intel: the dawn report shows the target's kits | *Map Table*: expeditions (R6) can take two nights / *Quartermaster*: war banners cost no gold | *Generals' Hall*: a Commander leads the squad for +10% / *Spy Network*: rival thefts warned a day before |
| **Temple** | an oath sworn | devotion gain +10% per level; L3 a second boon slot; L5 call an omen once a week (R8 makes this richer) | spec by oath (R8) | spec by oath (R8) |

Before R8, the Temple's L3 and L5 are plain: a second boon at half strength, and a weekly omen re-roll.

## 3. The Reserve and the Charnel Yard

The Yard turns the Reserve into a training bench: dawn XP, the stage rules unchanged, never past the army's highest
level minus 2 (so it fills the bench, not the front line). Bot measurement: Reserve average level vs army average at day
60 (target: within 3-5 levels at Yard L3). With *Catacombs* (Crypt L5) Reserve minions fight siege waves as a second
line that enters when an army minion falls.

## 4. Stat respec (Library L2)

Respec all stat points for `500 x level` gold and 20 dust, once per 7 days. The first respec is free (to fix a new
player's mistake). This answers B2's "Constitution builds trail" in part: a player can move to the stat the content needs.

## 5. Dread

A town meter from 0 (calm) to 100 (terror), starting at 30. Shown on the Town tab as a band with its effects listed.

### 5.1 What moves it (per event)

| Event | Dread |
|---|---|
| Siege won | -6 (Bell Tower *Toll of the Dead*: -12) |
| Siege lost | +10 |
| Raising in the gates (per 20 raises) | +2 |
| A raid or expedition won near town (gates E-D) | +3 |
| A commission filled (R4) | -3 |
| Tithe paid at the Old Shrine (new: 5% of held gold) | -5 |
| An oath to the Old Gods kept a week | -2 / a Dishonored oath: +2 |
| Daily drift toward 40 | 1 point a day |
| A building raised to a new level | +2 (the town sees it grow) |

### 5.2 Bands

| Band | Dread | Market | Sieges | Events and other |
|---|---|---|---|---|
| **Calm** | 0-19 | prices -10%, the pedlar appears twice as often | gap 9-12 days, waves -10% | the "Mourners at the gate" event (the living bring a body to raise) |
| **Uneasy** | 20-49 | as now | as now (gap 7-10) | none |
| **Afraid** | 50-79 | prices +10% | gap 6-9, waves +10%, pay +15% | "Tribute" event: the living leave gold at the gate (once a week) |
| **Terror** | 80-100 | prices +25%, no black market | gap 5-7, waves +20%, the Captain brings two elites, pay +30% | "Plunder" order: take gold and bodies from the town once a week (+8 dread) |

The bands are a real choice: a high-dread necromancer earns more and fights more; a calm one buys cheap and sleeps.
Siege tuning targets stay 80-87% held across bands (measured per band).

## 6. Daily orders

The daily quest becomes **daily orders**: at dawn three orders are drawn from a pool; the player picks one (or none).
Each pays one reward from its line.

| Order | Asks | Pays |
|---|---|---|
| *Hunt* | clear a named gate (any difficulty) | 1 stat point |
| *Harvest* | raise 3 minions of a named role | 30 bone dust |
| *Clean kill* | win a room with no minion falling, on the highest gate cleared | an Ossuary-style +5% raise chance for tomorrow |
| *Stand watch* | spend a watch in town (Yard, Library, Temple) | 2 Library study points or devotion |
| *Tribute* | fill a commission | town standing (dread -5) |
| *Climb* | take 3 Tower floors | 1 Tower trophy of your best floor |
| *Old debt* | answer a bounty | gold x1.5 of the bounty |

Stat points from orders: at most 1 a day (as now), but only through *Hunt*, so it is a choice between stats and other
rewards. Measure: stat points from orders per 100 days (target ~50-60, was ~100), and that bots choose differently.

## 7. Upkeep

Every building level past 2 costs `20 x level x (gate cleared+1)` gold at dawn (a full L5 town at S costs ~1.2k a day,
~60k over the late game). Unpaid upkeep (not enough gold) turns off the building's top level until paid, and adds 1 dread.
Shown on the dawn report.

## 8. Siege perks

Every new building gets a `SIEGE_PERK` entry: the Yard (Reserve minions as a second line, with *Catacombs*), the Library
(the Captain's moves shown a turn ahead), the Embalmery (a fallen attacker can be kept as a body), the Bell Tower (its wall
defenses), the Apothecary (one free Healing Draught a wave), the War Room (a squad joins wave 3), the Temple (the god's
boon is doubled during sieges).

## 9. Tuning steps

1. Ship buildings L4-5 and the new six with their costs; measure gold held (R4 target 10-20k with upkeep in play).
2. Measure the Yard: Reserve level gap; tune Yard XP.
3. Dread: run 40 bots with a fixed policy per band (calm / afraid / terror) and check sieges held 80-87% in each.
4. Orders: stat points and choice spread; check stat builds still within 4 points (the respec helps).
5. `"off":["yard","dread","orders","upkeep"]` and per-building off switches for "every system costs ~1 point".

## 10. Bot policy

Build order by measured value (Crypt, Ossuary, Yard, Forge, Altar, the rest); specializations by a fixed table per
build; keep dread in Uneasy by default (`"dread":"calm"|"terror"` to probe); orders: *Hunt* when below the stat curve,
else the reward the bot values most that day.

## 11. Save, UI, Turkish, Codex

- Save: `S.build` keeps `{k:level}` (loader caps at 5); `S.spec = {k:{3:'a',5:'b'}}`; `S.dread` (number); `S.orders =
  {day, list:[...], pick}` replaces `S.quest` (loader keeps clears); `S.embalm = [{body, day}]`; `S.respec = {last}`.
- UI: the Town tab becomes a map of buildings (a grid of cards, each with its level pips, specs and siege perk); the dread
  band bar with its effects; the orders card at dawn; the Yard list of trainees with their XP.
- Codex: one page per building, Dread, Orders, Upkeep. ~260 Turkish strings.

## 12. Tests

- `92-buildings`: every building to L5, specs exclusive, costs and gates (Throne for L4-5), old saves capped right.
- `93-yard-reserve`: dawn XP, the cap, evolution with *Bone Pits*, Catacombs in sieges.
- `94-dread-orders`: each event moves dread as stated, bands apply, orders draw three and pay once, the quest save
  converts; upkeep turns off a top level when unpaid.

## 13. PR split

- **PR A**: buildings to L5, specs, the six new buildings, Yard, respec, Embalmery, siege perks, tests 92-93.
- **PR B**: dread, orders, upkeep, Bell Tower defenses, test 94, retune and docs.

## 14. Risks

- **Upkeep feels like a tax**: it starts only past level 2 and is shown before building ("adds 120 gold a day").
- **Ten buildings overwhelm**: they open over time (section 2.2's Opens column) and the first hour still sees one.
- **Dread punishes raising**: raising adds only +2 per 20; sieges won pull it back. The default bot sits in Uneasy.
