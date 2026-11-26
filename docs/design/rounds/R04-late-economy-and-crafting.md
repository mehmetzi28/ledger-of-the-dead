# R4. Gold that means something: late economy and crafting

**Priority** P1. **Closes** G10, G11, G14, B3. **Size** L (one PR, two if consumables grow). **Needs** nothing; R2's
hearts make heart-forging richer, R5's Apothecary hosts brewing.
**Pillars served**: 2 (every death is a resource), 4 (choices with a cost), 7 (a long game).

## 1. The problem

- `full` bots hold ~33-39k gold at day 100 and earn ~1.1M over the game. Capped sinks (tempering lines at their best,
  three building levels, five mausoleums) stop absorbing; Awakening (~60k) and headstones (~186k) absorb the most, but
  income keeps growing with level and difficulty.
- Loot dead-ends: Tower trophies (`t:` keys) and abyssal floors only sell; boss hearts past Awakening only sell; any 4
  trophies brew one of only two potions; the belt holds 3 of each.
- The trophy forge (6 same-gate trophies, a heart counts as 5) is the only crafting, and it makes ordinary gate gear.

## 2. Principles

1. **Every trophy kind has at least two uses** besides selling (forge, brew, commission, or trade).
2. **Sinks are open-ended but chosen**: no tax that just deletes gold. Each sink buys power or options the player wants.
3. **Income bends, it does not drop**: kill gold grows more slowly past the Throne, so a later sink is not a race.
4. **Crafting is targeted**: the player names the slot and picks lines, so crafting is how a build is finished, not a
   second lottery.

## 3. The income curve

Kill gold today grows with foe level and gate. Change: past hero level `GOLD_SOFT_LV` (35), the level part of kill and
coffer gold grows at a third of its rate (`GOLD_SOFT_K` .33). Gate, difficulty and pact multipliers stay. Expected effect:
~20-25% less lifetime gold in `full`, almost nothing before the Throne. Bounties, sieges and raids keep their pay (they
are already chosen income). Measure with `goldLife` and `goldHeld` per mode before and after.

## 4. Heart-forging (the Forge)

A new Forge tab beside reforging and enchanting. Inputs: a boss or warden heart, gold, bone dust. Output: a **heartforged**
item: a Legendary-tier piece (the tier already exists) of the boss's gate set, in the slot you pick (weapon, armor or
relic), marked `hf:true`, whose bonus lines you choose instead of rolling.

| Heart | Gold | Dust | Result |
|---|---|---|---|
| Gate boss (E-S) | 2,000 x (gate+1) | 10 x (gate+1) | heartforged piece in any slot, item level of that gate +2, **two lines** picked from the boss's list |
| Tower warden | 6,000 + 200 x floor/10 | 40 | Tower-tier heartforged piece, **two lines** from the warden's list |
| Secret master | 20,000 | 80 | as a gate boss of S, **three lines**, the third from the master's list of minor powers |
| The Hunger (R3) | 40,000 | 150 | three lines plus the Hunger's minor power |

- **Line lists**: each boss has six lines themed on its kit. Example: the Rat King: +raise chance, +rat summons for
  minions with Pack hunter, +bleed damage, +poison resist, +gold from kills, +minion HP. The Ember Knight: +fire damage,
  +fire resist, burn on hit chance, +front-row armor, +Cinder Wave damage, +burn duration. Lines roll their value in the
  gate's range; the player picks which two (not their value).
- **Minor powers** (secret masters, one line): Plague Matriarch *Brood*: your poison kills split a mite (a 1-turn summon);
  Drowned Abbot *Tide*: +2% mana per turn per turn of the fight (cap 10%); Cinder Wyrm *Scales*: the hero reflects 10%
  fire; Choir Eternal *Verse*: every third skill echoes at 30%; Rootking *Regrowth*: minions heal 2% a turn; Nameless
  Sovereign *Mirror*: your second skill each fight repeats your first at 40%.
- **Reforging a heartforged piece** re-rolls values, never which lines; a second heart of the same boss lets you swap one line.
- Hearts kept for Awakening (`heartsKept`) stay protected: the Forge warns before using the last one a unique needs.

## 5. Tower and abyssal trophies

Today `t:` trophies only sell. Give them the trophy forge: **6 Tower trophies forge Tower-tier gear** (item level of
your best floor's band, rolled in the slot you name, 20% masterwork with an extra line). **Abyssal trophies** (floors
past 100, a new key `a:`) forge abyssal gear: the Tower tier plus one **abyssal line** from a small list (+% damage per
floor above 100 you have reached, cap 15%; Tower foes deal less to you, 1% per 10 floors, cap 10%).

## 6. Brewing (consumables 2.0)

Brewing moves from "any 4 trophies make a potion" to a recipe table. Each recipe names trophy **parts** (the role part
words already used in `TROPHY_PART`: Hide, Fang, Relic, Bone Charm...) and a gate tier minimum, so trophies of every role
and gate matter. Old "any 4 make a potion" stays for the two base potions.

| Kind | Recipe | Effect | Lasts |
|---|---|---|---|
| **Weapon oils** (5, one per damage type) | 3 striker parts + 1 reaper part, gate C+ | army hits deal that type for the run; +10% damage against foes weak to it | one run |
| **Incense** (3) | 3 mender parts, gate D+ | Low Incense +5 raise chance; Grave Incense +10 and preserves bodies; Abbot's Incense +1 Soul at the boss | one run |
| **Bone charms** (5) | 2 boss hearts' worth of points (a heart = 5) | *Second Draft*: one free Retry; *Open Door*: a guaranteed elite door in the next run; *Extra Order*: one more command this run; *Quiet Grave*: one run without a siege tick; *Lantern*: door sight +1 for a run | single use |
| **War banners** (3) | 4 vanguard parts, gate B+ | raids/expeditions: +10% win chance, +1 squad member, or bring back one more body | one raid |
| **Draughts** (2 new) | Iron Draught (4 vanguard parts): 25% less damage for 2 turns; Bloodwine (2 reaper + 2 mender): heals the army 15% | drunk in battle like potions, uses the turn |

- **Belt upgrades**: the belt grows from 3 of each potion to a 5-slot belt that holds any drinkable (`BELT_SLOTS` 3 base,
  +1 at Forge level 2 and with the R5 Apothecary at level 3, 5 cap). Save: `S.belt` becomes `{slots:[...]}` with a
  loader that converts `{hp,mp}`.
- **Run slots**: one oil and one incense per run (picked on the Gates tab before entering), so brewing is a pre-run
  choice, not stacking.

## 7. Commissions

The town (R5's board, or the bounty board until R5) posts **three commissions a week**: "4 Bone Plates from the Iron
Orchard", "a heartforged armor piece", "a minion of the striker role at Greater". Fulfilling pays gold at 1.5x the
trophies' sell value, bone dust, and **town standing** (R5: lowers dread). Unfilled commissions expire at week's end.
Commissions are where low-gate trophies stay useful late.

## 8. The black market

A weekly stall (opens day 7 and every 7th day, one watch) that trades without gold:

| Gives | Takes |
|---|---|
| a boss heart of a gate you cleared | 3 hearts of lower gates |
| 50 bone dust | 30 trophies of any gate C+ |
| an abyssal trophy | 4 Tower trophies |
| a random set piece of your best gate, slot chosen | 1 secret-master heart |
| a Soul (for the next run) | 1,500 gold and 5 dust (the only gold trade; once a week) |

Prices fixed and shown in full; it is a converter, so nothing is a dead end.

## 9. Sink accounting (targets)

| Sink | Today (full, gold per bot) | Target |
|---|---|---|
| Headstones | ~186k | keep |
| Awakening | ~60k | keep |
| Heart-forging | 0 | ~150-250k over a game |
| Brewing (gold part of recipes: 50 x gate per brew) | 0 | ~30k |
| Commissions (net earner) | 0 | +20k |
| Black market | 0 | ~10k |
| **Gold held at day 100** | ~33-39k | **10-20k** |

`full` stays 1-3 points over `market` (heartforged pieces help; the soft cap takes back some). `market` gets brewing and
heart-forging rules in its bot policy only if they cost under a point.

## 10. Bot policy

- Forge: after Awakening ranks are bought for held uniques, forge a heartforged piece for the weakest slot when a heart and the
  gold are in hand; pick lines by the bot's build (damage lines for Str/Int, army lines for Will/Con).
- Brew: an oil of the next gate's weakness and Low Incense before each gate run; a war banner before raids.
- Commissions: fill any that the pouch already covers.
- Black market: convert surplus low hearts up.
- `"off":["forge","brew","comm","bmarket"]` switches.

## 11. Save, UI, Turkish, Codex

- Save: `S.belt.slots`, `S.comm = {week, list:[...]}`, `S.bm = {week, used:{}}`, `S.runPrep = {oil, incense}`; heartforged
  items use the item format with `hf:true` and `ro` lines. Loaders default all of them.
- UI: Forge tab (pick heart, slot, two lines; preview the item); Brewing page with a recipe grid that shows what the pouch
  can make now; run prep row on the Gates tab; commission list on the board; black-market stall in the market on its day.
- Codex: Heartforging, Brewing, Commissions, Black Market. ~120 Turkish strings.

## 12. Tests

- `89-forge`: every boss, warden and master has six lines (masters a minor power); line picks apply; heart protection
  warns; old saves keep their items.
- `90-brewing`: recipes check parts and tiers; one oil and one incense per run; belt conversion from `{hp,mp}`.
- `91-trade`: commissions expire weekly and pay; black-market trades are exact; fuzz the new actions.

## 13. Risks

- **Heartforged pieces outclass uniques**: they have no unique power and at most three lines; uniques keep their powers and
  Awakening. If the bot drops uniques for heartforged pieces, cut line values to 80%.
- **Brewing becomes a chore**: recipes show in one grid with a "brew best" button for the next run.
