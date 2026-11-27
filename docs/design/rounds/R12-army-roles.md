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

## As built (PR A)

- **Code**: `src/game-army.js` (new, after game-builds.js); the echo table in `src/game-kits.js`.
- **Charms**: 6 trophies of one kind that is Known in the bestiary, plus 60 gold per gate tier (Tower kinds count as tier 5),
  make a charm (`{k: kit, src: kind}`). Changed from the spec's table: a charm carries its kind's **echo**, the same table the
  Undone use (`echoV(m, kit)`: 1 for an Undone or a charm, x1.5 for a charm of a Ledgered kind). That gives one system and
  one set of numbers, and it meant the eight kits that only gave the Undone a flat +10% (`ECHO_PLAIN`) now have real echoes:
  - **Ambusher**: first blow each room +30%.
  - **Mana thief**: 1 mana a hit.
  - **Bomber**: bursts for 30% of its max HP as fire on falling.
  - **Sapper**: its hits tear half a foe's shield.
  - **Skirmisher**: 30% less damage under 30% HP.
  - **Hexer**: every third hit hexes, with no Math.random.
  - **Purifier**: sheds one condition each turn.
  - **Burrower**: 50% less damage on turn 1.

  Other charm rules:
  - One charm per minion; swapping is free in town (the Army tab's charm picker).
  - `returnGear` sends a charm back to the pouch whenever its minion leaves (release, shatter, raid loss, sale).
  - Fusion keeps the stronger charm (`charmFuse`).
  - The Army tab has a Charms panel (pouch and bench).
- **Gear-bearer powers** (`MINION_FLAG`): a unique on a gear-bearer gives the minion its own version at about 40%:
  - **Bone Bank**: never shatters.
  - **Echo**: every tenth hit strikes twice.
  - **Undying / Deathless**: 1 / 2 saves a run, at 12% / 20% HP.
  - **Lifedrain**: heals for 32% of its damage.
  - **Soul Harvest / Censer**: kills restore 2 / 4 mana to you.
  - **Headsman**: +20% damage to foes under 35% HP.
  - **Thorns**: reflects 8% of each hit.
  - **Swarmguard**: takes 10% less damage.
  - **Chorus, Wide Arc, Hellfire**: splash a drain, a cut and a scorch onto other foes.
  - **Infernal**: a 10% ward each room.
  - **Halo**: heals 1.6% a turn.
  - **Ruin**: +10% damage.
  - Cheap Dead, Bind Souls, Ledger-Chain and the rival's three uniques give +8% HP and attack instead.
- **Kills and names**: `m.kills` counts the blows that kill (the hitter at the death check). The Memorial headstone keeps the
  count (`kl`). At 100 kills the minion's name goes into the Ledger (`S.nameLines`, at most 10): +1% HP and attack, for good,
  for every minion of its role (`nameK` in `extraMul`).
- **Titles**: *Charmed* (a charm of all 16 kits), *Hundred Kills*, *Ten Names*. 201 titles. *Witch-Keeper*, *Every Role*
  and *By My Order* come with PR B.
- **Bot**:
  - Gives gear-bearers the best spare piece, uniques first (`"off":["mgear"]`).
  - Makes charms (Banner, Shield, Call, Stance, Pack first) while it keeps 3x the cost, and gives guard charms to
    vanguards (`"off":["charms"]`).
- **Tests**: `tests/groups/98-army.js` (5 tests). 864 tests.
- **Balance** (market, seeds 7700/9100):
  - Gates 90/90%, Tower 82.6/83.9, Rift 17.5/18.9 (R11: 89/90%, Tower 77.9/79.3, Rift 17.1/18).
  - Turning features off (seed 7700):
    - Both charms and gear powers off: 89%, Tower 79.7.
    - Charms off: Tower 79.3.
    - Gear powers off: Tower 81.7.
    - So charms are worth about 3 Tower floors and gear-bearer powers about 1. Gates moved 1 point.
  - Full (7700): 91%, Tower 86.4, Rift 26 (R11: 90%, Tower 85.5, Rift 21.2). The full bot's extra gold buys more charms; retuned in PR B (charms at 75%).
  - Fuzz 12/12.

## As built (PR B)

- **The Hexer** (`ROLES.hexer`, the fifth role). Six new foes, one per gate (Bog Witch, Crypt Augur, Ash Seer, Choir Cantor,
  Iron Oracle, Court Astrologer), raise as hexers: back row, low HP and attack (`ROLE_BIAS` relic/weapon). Every hit leaves a
  condition for 2 turns, chosen by trait: Rimeborn chills, Venom poisons, Necrotic blights, Cinderborn burns, the rest Hex
  (`hexHit`, no Math.random). One hexer per 4 army places brings conditions (`hexCap`); more fight plainly, so a hexer army
  cannot lock a room. Two new marks: *Augur* (+1 turn per level) and *Malefic* (+damage to a foe under any condition,
  `condOn`). Hexer foes hex you or a minion on hit. Icons reuse their source kinds with an eye overlay.
- **Specializations** (`SPECS`, `m.spec`): at Elder (stage 2) a minion picks one of two for its role, for good, on the Army
  tab (`mspecPend`, `chooseMSpec`; named so they do not collide with the town buildings' `SPEC`/`chooseSpec`):
  - Vanguard: **Bastion** (+20% HP, Taunt one turn longer) or **Avenger** (hits back 30% of every blow).
  - Striker: **Duelist** (+20% crit on a foe it already hit) or **Cleaver** (25% splash).
  - Mender: **Saint** (heals 25% more) or **Plague-doctor** (heals clear wounds and conditions, 15% less).
  - Reaper: **Soul-taker** (first kill a room harvests a Soul) or **Executioner** (Execute under 50%, Collect under 25%).
  - Hexer: **Seer** (its target takes 10% more from minions next turn) or **Malign** (also Hexes).
- **Elder actives** (`ACTIVES`): from Elder each minion has one order on the battle bar. It costs your action, once a room
  (twice from Eternal); Ancient makes it x1.5 (`maEmp`):
  - Vanguard **Hold the Line**: this turn every foe strikes it, and it takes 30% less.
  - Striker **Execute Order**: 160% of its attack at your target; a kill gives your action back.
  - Mender **Last Rites**: every minion heals 15% of its max HP.
  - Reaper **Collect**: a foe that is not a boss under 15% HP dies at once; the body is Clean.
  - Hexer **Doom**: your target takes 25% more from the next three hits.
- **Charm retune**: a charm now carries its echo at 75% of an Undone body's (`CHARM_K`; Ledgered x1.5 on top). At full
  strength charms were worth almost 4 Tower floors on the market bot.
- **Fixes found on the way**:
  - A bounty order worth 0 gold (`S.orders.bg = 0`) was dropped on load (fuzz seed 5); the save repair keeps any number now.
  - A Bomber echo dragged under by a boss hazard at the end of a turn could burst the last foes and leave the room open
    with no foes; the turn now checks for a won room after the end-of-turn hooks.
  - The Blood Moon omen no longer changes elite odds on weekly-dive and Trial runs (the seeded rooms must match).
- **Titles**: *Witch-Keeper* (raise a hexer), *Every Role* (all five in the army at once), *By My Order* (500 actives).
  204 titles.
- **Bot**: uses actives when they beat its own action (Execute Order for a kill, Collect into a crowd, Last Rites under
  half, Hold the Line on a charge, Doom on a boss); picks specs from a table; keeps hexers to the cap.
  `"off"` switches: `actives`, `specs`, `hexer`.
- **Tests**: 4 more in `tests/groups/98-army.js`. 868 tests. Fuzz 12/12.
- **Balance** (market, seeds 7700/9100): gates 91/90%, Tower 82.1/81.7, Rift 20/19.5 (PR A: 90/90%, 82.6/83.9,
  17.5/18.9). Off probes (seed 7700, before the charm retune, base Tower 83.5): actives off 82.8, specs off 80.7,
  hexer off 82.2, charms off 79.8. So specs are worth about 3 floors, the hexer about 1, actives under 1 (the bot is
  careful with them). Full (7700): 90%, Tower 85.7, Rift 22 (PR A: 91%, 86.4, 26).
- **Done when**: charm, active, spec and hexer use are measurable with `"off"` (above). The bot report does not yet print
  the army's role mix.
