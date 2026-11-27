# R13. Nemeses and a living valley: content pack

**Priority** P3. **Closes** G24, G20 (the rest). **Size** L. **Needs** R1 (kits; nemeses grow them); R5, R7, R8 give
event outcomes more to touch.
**Pillars served**: 2 (every death is a resource), 5 (the Ledger is a story), 3 (read the fight).

## 1. The problem

- Foes are anonymous: the one that killed your Eternal is the same as any other of its kind.
- Content is thin for a 100-day game played over cycles: 5 curses, 15 events, 7 omens, a few chains. Event outcomes only
  touch gold, HP, Souls and bodies.

## 2. Nemeses

### 2.1 Birth

When a foe downs a minion of **Greater** stage or above, and that foe is still standing when the room ends (the room is
lost, a Retry is used, or it was a skirmisher that stepped away), it may become a **nemesis** (`NEM_CH` 25%, +10% per
stage of the victim above Greater).

A nemesis gets:
- a **name** from a generator (a gate's naming list + an epithet from the victim: "Gutter-Tooth, who ate Brother Ash");
- **+1 level per minion it has downed** (counted across encounters);
- **one trait taken from its victim** (the victim's highest-tier trait; the victim keeps it);
- its kit, plus one more kit from its gate's pool once it has downed two minions.

### 2.2 Life

- At most **3 nemeses** live at once; a fourth replaces the weakest.
- Each haunts its gate: one door in that gate carries its sigil; the nemesis waits behind it as an elite (always visible
  with door sight 0).
- It grows **+1 level each week** it lives and taunts at dawn ("Gutter-Tooth still wears Brother Ash's teeth").
- A nemesis that downs three minions becomes an **arch-nemesis**: a second phase at 50% (it eats its stolen trait for a
  heal of 20%) and the rival's notice (R7 can recruit it as their lieutenant).

### 2.3 Death

Killing a nemesis pays:
- its trophies x3 and its gate's best drop roll;
- its body rises with the condition **Avenged**: +15% raise, and it keeps the stolen trait (a dead minion's trait comes
  home);
- a **Memorial line** beside the victim's headstone ("Avenged on day 64");
- the title track *Avenger* (1, 5, 15 nemeses), and *Old Grudge* (kill a nemesis that lived 4 weeks).

## 3. New curses (5)

Cursed gates today: Volatile dead, Drought, Fury, Bulwark, Horde. Five more:

| Curse | Rule | Reward share |
|---|---|---|
| **Hunger** | your Souls drain by one at the start of each room | +30% |
| **Mirror** | every foe gains your army's most common trait | +35% |
| **Silent** | no free orders | +25% |
| **Long** | every room has one more foe | +30% |
| **Thin** | bodies vanish one turn after the room ends: raise in battle only (a Soul raises at once) | +25% |

## 4. New events (10)

| Event | Choices and outcomes | Touches |
|---|---|---|
| **Mourners at the gate** (Calm dread only) | take the body they bring (a free raise) / bless it and send it home (dread -4) | dread, army |
| **The Hanged Choir** | cut them down (fight: a hexer body) / leave them (Choir devotion +15) | army, faith |
| **The Lost Patrol** | spare them (dread -3) / raise them (two militia bodies, dread +3) | dread, army |
| **The Bone Merchant** | swap one minion for a random one of the same tier / pass | army |
| **A Drowned Bell** | ring it (call tomorrow's omen, any) / silence it (no omen tomorrow) | omens |
| **The Weeping Statue** | read the inscription (a lore page) / take the tears (a bottle: full mana once) | pages, potions |
| **The Ledger Thief** | duel the rival's agent (a mini-fight: win back a stolen body or a torn page) / let them go | rival |
| **The Fever Pit** | throw a minion in (reroll one trait, 30%: it falls) / pass | traits |
| **The Broken Wagon** | take the cargo (trophies a commission wants) / help the driver (dread -2, gold) | commissions, dread |
| **The Hollow Saint** | kneel (convert to its god at 75% devotion) / break it (Profane +20, dread +2) | faith |

## 5. New chains (3, three steps each)

| Chain | Steps | End |
|---|---|---|
| **The Tanner's Debt** (Rat Warren) | a ledger of debts in the vats; three rooms of the Rat King's creditors; the debt paid in his name | the title *Paid in Full* and the Rat King's unique's power +10% for good |
| **The Warden's Relief** (Sunken Crypt) | find the watch roster; lay three watchmen to rest (fights with a Silent curse); stand the last watch yourself | Reserve minions +1 level, a passage |
| **The Ash Choir** (Hollow Cathedral) | hear the missing voice; find the Bishop's lost cantor; choose: free it or bind it | free: Choir devotion +50 / bind: a hexer at Elder |

## 6. New omens (3)

| Omen | Rule |
|---|---|
| **Red Mist** | crit chance +10% for every unit |
| **Grave Wind** | raise chance +5%; Soul max -1 |
| **Still Air** | no damage-over-time ticks, either side |

Omens total 13 (7 now, 3 in R8, 3 here). Each god (R8) gains one of the three in its call list where it fits (Red Mist:
Profane, Grave Wind: Choir, Still Air: Vesh).

## 7. Numbers

- Nemeses: ~2-4 born in a 100-day game for the `full` bot; ~70% avenged.
- Curses: each new curse's clear rate within 5 points of the old curses at the same gate.
- Events: no event's expected value more than 30% above the average event.

## 8. Save

`S.nem = [{id, name, gate, base, lvl, victims:[{name, day}], trait, kits:[...], born, arch}]`, `S.chains` gains three
keys, `S.mods` new curse keys. Loader defaults; no conversion.

## 9. UI, Turkish, Codex, titles

UI: the nemesis sigil door; a "Nemeses" strip on the Gates tab (name, gate, victims, weeks alive); the Avenged line on
headstones. ~230 strings (the name generator's parts, 10 events, 3 chains, curses, omens). Codex: Nemeses, the new curses,
events and omens. Titles (6): *Avenger I/II/III*, *Old Grudge*, *Paid in Full*, *Five Curses Broken*.

## 10. Tests

`104-nemesis` (birth odds and rules, the cap of 3, weekly growth, arch-nemesis phase, Avenged body and Memorial line,
save round trip); `105-content` (every curse, event, chain step and omen fires and logs; fuzz the events).

## 11. Bot policy

Take the nemesis door when the nemesis is at most 5 levels above the room; choose events by expected value; avoid the
Fever Pit unless the minion is in the Reserve. `"off":["nemesis"]`.

## 12. Risks

- **Nemeses snowball a losing player**: they only grow a level a week and by victims; a lost room already costs; the
  nemesis door is optional.
- **Name generator output that reads badly in Turkish**: names stay untranslated proper nouns; epithets are translated
  whole ("who ate {victim}").

## As built (PR A: nemeses)

- **Code**: `src/game-nemesis.js` (new, after game-army.js). Births roll on `dayHash`, never Math.random.
- **Birth**: a foe that downs a minion of Greater stage or above records it (`e.nv`, from the foes' turn in `act`). If that
  foe still stands when the room ends with you falling (`defeat`) or fleeing (`flee`), it becomes a nemesis at 35%
  (`NEM_CH`, raised from the spec's 25% after the bots met too few), +10% per victim stage past Greater. Ordinary gate runs
  only: no Tower, siege, Trial, weekly dive, Rift, rival gate or Reckoning. Skirmishers that step away do not count (no such
  rule exists in combat yet).
- **What it carries** (`S.nem`, at most 3; a fourth pushes out the weakest):
  - A name from its gate's list (seven names a gate, proper nouns kept in Turkish) and its first victim:
    "Gutter-Tooth, who gnawed down Ash".
  - +1 level above its room for every minion downed (`k`) and every week alive (`wk`, the first dawn of each week, with a
    taunt notice).
  - The top trait of its best victim; a second kit from its gate (`kit2`) at 2 victims.
  - At 3 victims it is an arch-nemesis: once, at half HP, it eats the stolen trait and heals 20%.
  - The rival's recruiting of arch-nemeses is not built (the rival is gone for good after its war).
- **The sigil door** (`DOORS.nem`): once a run, in a gate a nemesis haunts, an extra door joins the doors. The room behind it
  is an ordinary room whose first foe is the strongest nemesis of that gate, as an elite; the door is always read (door
  sight 2), whatever you know of the gate.
- **Death**: +4 trophies of its kind, one roll on its gate boss's table, and the body rises **Avenged** (`c.avg`): +15% to
  raise, and the stolen trait replaces the condition's or the random one. The victims' Memorial entries get "Avenged on
  day N" (`av`). `memorialFix` now keeps a save's key order (`keepOrder`), so late keys such as `hs`, `maus` and `av` round-trip.
- **UI**: a Nemeses strip on the Gates tab (name, gate, levels, victims, weeks); the sigil door; the Memorial line; a
  Nemeses page in the Codex (after Foe kits). Titles: *Avenger I/II/III* (1, 5, 15), *Old Grudge* (one that lived 4 weeks).
  208 titles. Turkish for all of it.
- **Bot**: takes the sigil door when the nemesis stands at most 5 levels above the room (`"off":["nemesis"]` never takes it).
  The report prints births, kills, arch-nemeses and those alive at the end.
- **Tests**: `tests/groups/98-nemesis.js` (5 tests). 873 tests. Fuzz 12/12.
- **Balance** (market, seeds 7700/9100): gates 91/90%, Tower 82.4/81.8, Rift 20.1/18.8 (R12: 91/90%, 82.1/81.7, 20/19.5).
  Nemeses a bot: market 0.9/1 born, 0.8/0.9 avenged; full (7700) 2.6 born, 2.5 avenged, 0.3 arch; full gates 90%,
  Tower 85.6, Rift 27.8. The bot avenges about 95%, above the spec's 70%, because it always takes a door it can win.
- PR B followed with the curses, events, chains and omens (below).

## As built (PR B: a living valley)

- **Code**: `src/game-valley.js` (new, after game-nemesis.js). Its tables join `MODS`, `EVENTS`, `OMENS`, `CHAIN_EV`,
  `CHAIN_IDS`, `CHAIN_NEXT`, `OMEN_NAT` and `GOD_OMENS`; the rules are small hooks in combat, rooms and raising.
- **Curses** (10 now). The rewards stay the same for every curse (double gold and trophies, +25% XP, +50% gear); the
  spec's per-curse reward shares were dropped.
  - **Hunger**: a Soul drains at the start of each room (`curseRoom`).
  - **Mirror**: every foe takes your army's most common trait (`armyTrait`). A wound trait (Venomous, Necrotic,
    Cinderborn, Rimeborn) goes on its hits (`foeTraitHit`, also used by a nemesis's stolen trait); any other is +15% HP
    and attack.
  - **Silent**: no free orders (`canCommand`).
  - **Long**: one more room before the boss. The spec's "one more foe" was already Horde. A Trial never draws Long, so it
    keeps four rooms.
  - **Thin**: only two bodies stay after a room, a boss's and the elites' first. Simpler than the spec's one-turn decay.
- **Volatile dead retuned**: the market bot cleared only 39-62% of Volatile gates, against 93-98% for every other curse.
  It now bursts for 30% of the foe's attack, at most 6% of your max HP (was half, uncapped), and clears 94-99%.
- **Omens** (13 now; 10 can come at dawn). Each is also in one god's call list:
  - **Red Mist** (the Profane): +10% crit for you, your minions and foe strikers.
  - **Grave Wind** (the Choir): +5% raise, and the Soul cap is one lower (never below 1).
  - **Still Air** (Vesh): no damage over time ticks, on either side.
- **Events** (`VEV`, ten; `when` limits who meets them):
  - **Mourners** (Calm town only): a free body, or dread -4.
  - **The Hanged Choir**: -15% HP for the gate's hexer body, or Choir devotion +15 (sworn to the Choir).
  - **The lost patrol**: dread -3, or two free bodies and dread +3.
  - **The bone merchant**: your lowest-level minion leaves; a free body of the gate at least its level waits.
  - **A drowned bell**: tomorrow's omen is a random dawn omen, or none.
  - **The weeping statue**: a torn page (50%) or XP; or a mana draught (gold if the belt is full).
  - **The Ledger thief** (once the rival is met): -20% HP for a torn page or gold.
  - **The fever pit**: your lowest-level minion's last trait rerolls, and 30% of the time it is lost to the Memorial.
  - **The broken wagon**: 3 trophies of the gate's first kind, or dread -2 and gold.
  - **The hollow saint** (sworn only): convert keeping 75% of your devotion, or break it (dread +2, Profane devotion +20).
- **Chains** (three steps each; the first meeting and each follow-up appear only in their own gate, `chainGate`):
  - **The Tanner's Debt** (Rat Warren): take the ledger, fight or pay the creditors, settle the debt, which gives the
    title *Paid in Full* (+5% gold). The unique-power reward was dropped.
  - **The Warden's Relief** (Sunken Crypt): the roster, lay three watchmen to rest (-25% HP), stand the last watch (-20% HP):
    every Reserve minion gains a level (up to your level + 2). No Silent fight and no lore passage.
  - **The Ash Choir** (Hollow Cathedral): listen, search (-15% HP), then free the cantor (Choir devotion +50, or a Soul
    and full mana) or bind it (a free Choir Cantor body that rises at Elder with two more traits, `cantorStage`).
- **Titles**: *Five Curses Broken* (a clear under each new curse) and *Paid in Full*. 210 titles.
- **Bot**: event picks for every new event and chain step (it walks past the bone merchant, the bell and the fever pit).
  The report adds clears by curse.
- **Tests**: `tests/groups/98-valley.js` (4 tests). 877 tests. Fuzz 12/12.
- **Balance** (market, seeds 7700/9100): gates 95/95%, Tower 84/83, Rift 20.8/22 (PR A: 91/90%, 82.4/81.8, 20.1/18.8).
  The gate rise is mostly the Volatile fix: those runs had cost about 3 points of clears. Clears by curse (7700): Bulwark
  98, Drought 98, Fury 97, Horde 93, Hunger 98, Long 95, Mirror 95, Silent 98, Thin 93, Volatile 97. Full (7700): 94%,
  Tower 86.1, Rift 27.4.
