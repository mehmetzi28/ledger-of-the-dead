# R12. Army roles 2.0: charms, minion actives, a fifth role

**Priority** P2. **Closes** G7, G8 (with R6). **Size** XL, two PRs. **Needs** R1 (kits are the charms' source).
**Pillars served**: 1 (the army is the character), 2 (every death is a resource), 3 (read the fight).

## 1. The problem

- Four roles (Vanguard, Striker, Mender, Reaper) with two marks each at Elder (`MARK`). Minions can't be shaped beyond
  traits, fusion and marks.
- Gear: only one armed kind per gate (two in the Tower) takes gear (`ARMED`); a unique on a gear-bearer gives stats, not
  its power.
- Minions never act on command beyond the free orders (Taunt, Focus, ...).
- No role applies conditions: debuffs come from the hero and a few traits.

## 2. Charms

Every minion gets **one charm slot**. A charm is crafted from **6 trophies of one foe kind** (that kind must be Known in
the bestiary) plus gold (`60 x gate tier`), and carries one line from that kind's R1 kit, scaled to minion use:

| Kit | Charm | Effect on the wearer |
|---|---|---|
| shield-bearer | *Bearer's Charm* | once a fight, guards the weakest ally from one blow |
| ambusher | *Ambush Charm* | its first hit each fight targets the back row at +30% |
| mana thief | *Leech Charm* | its hits give the hero 1 mana |
| grave-caller | *Caller's Charm* | once a fight, a fallen foe rises as a 1-turn thrall |
| pack hunter | *Pack Charm* | +5% attack per living minion of the same role |
| bomber | *Bomber's Charm* | on falling, bursts for 30% of its max HP as its type |
| sapper | *Sapper's Charm* | its hits strip 10% of a foe's shield |
| skirmisher | *Skirmish Charm* | steps to the back row under 30% HP (once) |
| bulwark | *Bulwark Charm* | +20% armor every other turn |
| hexer | *Hex Charm* | 15% chance on hit to Hex |
| marker | *Marker's Charm* | its target takes +10% from the army for a turn |
| mender-priest | *Priest's Charm* | cleanses one condition from itself each turn |
| burrower | *Burrow Charm* | untargetable on the first turn of a fight |
| reflector | *Mirror Charm* | reflects 10% of damage taken |
| frenzy | *Frenzy Charm* | +10% attack per fallen ally this fight (cap 30%) |
| banner-bearer | *Banner Charm* | +5% army damage while it stands |

- Charms move freely between minions in town; a charm on a minion that shatters returns to the pouch.
- A charm whose kind's bestiary page is Ledgered gains +50%.
- Fusion keeps the stronger charm and returns the other.

## 3. Gear-bearer powers

A gear-bearer wearing a unique gains a **minion version** of the unique's power flag at 40% (Bone Bank: banks 40% of the
bone, Lifedrain: drains at 40%...). A table `MINION_FLAG` maps each of the 18 flags to its minion effect; flags that make
no sense on a minion (army slots, mana per turn) give +8% stats instead.

## 4. Elder actives

At Elder, a minion gains one **active** by role. Using it is an **order** that costs the hero's action (not mana), once
per room per minion.

| Role | Active | Effect |
|---|---|---|
| Vanguard | **Hold the Line** | taunts every foe and takes 30% less damage for a turn |
| Striker | **Execute Order** | a hit at +60%; a kill refunds the hero's action |
| Mender | **Last Rites** | heals every minion 15% of its max HP |
| Reaper | **Collect** | kills a non-boss foe under 15% HP; the body counts as Clean |
| Hexer | **Doom** | the target takes +25% from the next three hits |

Ancient and Eternal empower the active (+50%, then a second use per room).

## 5. The Hexer, a fifth role

- **Back row**, low HP (0.7x), low attack (0.7x); every hit applies a condition by trait (Hex by default; Rimeborn chill,
  Venomous poison, Necrotic blight, Cinderborn burn, a bleeding striker bleed).
- **Raised from hexer foes**: six new kinds, one per gate, added to each gate's roster:

| Gate | Hexer foe | Kit |
|---|---|---|
| Rat Warren (E) | Bog Witch | hexer |
| Sunken Crypt (D) | Crypt Augur | marker |
| Ashen Barrow (C) | Ash Seer | hexer (burn) |
| Hollow Cathedral (B) | Choir Cantor | mana thief |
| Iron Orchard (A) | Iron Oracle | marker |
| Throne of Ash (S) | Court Astrologer | hexer (shadow) |

- Formation cap: at most one hexer per two back-row places. Marks at Elder: *Augur* (conditions last a turn longer) /
  *Malefic* (conditions deal +30%).
- Two new compounds with a hexer half: *Witchbone* (Hexer trait *Hexed Bones* + Shatterwrought: shattering hexes the
  room), *Plague Saint* (+ Plaguebearer: menders' heals also poison foes adjacent).

## 6. Role specializations (Elder)

At Elder, besides the mark, pick a **specialization** (two per role, final):

| Role | Spec A | Spec B |
|---|---|---|
| Vanguard | **Bulwark**: +20% HP, Taunt lasts a turn longer | **Avenger**: hits back 30% of each blow it takes |
| Striker | **Duelist**: +20% crit vs the target it hit last | **Cleaver**: hits splash 25% to a neighbor |
| Mender | **Saint**: heals +25% | **Plague-doctor**: heals also cleanse; 15% less healing |
| Reaper | **Harvester**: kills harvest a Soul (once a room) | **Headsman**: execute threshold +10% |
| Hexer | **Augur**: sees and shows foe intents a turn further | **Malefic**: its conditions stack twice |

## 7. Kill counts and the Memorial

Each minion keeps `m.kills`. Headstones show the count. At 100 kills a minion earns a **name line** in the Ledger: +1% to
its role's stats for the whole army (cap 10 lines, so +10%). The lines survive the minion.

## 8. Numbers and tuning

- The bot's army uses every role (each role at least 10% of armies at day 60).
- `"off":["charms"]`, `"off":["actives"]`, `"off":["hexer"]`, `"off":["specs"]`: each worth about a point.
- Elder actives must not replace the hero's action as the best play every turn: the hero's best action is measured
  against the active's average value (target: actives used 1-2 times a room).

## 9. Save

`m.charm = {kind, lv}`, `m.spec`, `m.kills`, `S.charms = [...]` (pouch), `S.nameLines = [{name, role, day}]`. New role key
`hexer` in `ROLES` (loader: none to convert).

## 10. UI, Turkish, Codex, titles

UI: charm slot on the minion card; actives as buttons on the minion's stage portrait (greyed when used); spec choice on
the evolve card; kill count on the card and headstone. ~200 strings (16 charms, 6 hexer foes, 10 specs, actives). Codex:
Charms, Actives, The Hexer, Specializations. Titles (6): *Charmed* (16 charms), *Witch-Keeper* (an Eternal hexer), *Every
Role* (an army with all five at Elder), *Hundred Kills*, *Ten Names*, *By My Order* (500 actives).

## 11. Tests

`102-charms` (crafting needs Known; effects; moves; fusion keeps the stronger), `103-hexer` (raised from hexer foes,
conditions by trait, formation cap, compounds), actives and specs in the same groups, gear-bearer flags.

## 12. Bot policy

Craft charms for the front row first (Bearer's, Bulwark), Banner on a back-row striker; Elder actives when their value
beats the hero's best action; specs by a fixed table. 

## 13. PR split

- **PR A**: charms, gear-bearer powers, kill counts and name lines.
- **PR B**: Elder actives, specializations, the Hexer and its six foes.

## 14. Risks

- **The Hexer crowds the back row**: the formation cap.
- **Too many buttons in battle**: actives live on portraits, not the command bar; only Elders have them.
