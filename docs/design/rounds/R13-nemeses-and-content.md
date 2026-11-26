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
