# R11. Hero builds 2.0

**Priority** P2. **Closes** G25, B2 (the rest). **Size** L. **Needs** nothing; R2 and R9 supply rune drops, R5 the respec.
**Pillars served**: 4 (choices with a cost), 1 (the army is the character: builds lean on it through Command).

## 1. The problem

- 18 skills in four paths: Bone 5, Blood 5, **Frost 4, Rot 4**. Rank-3 upgrades (`SKILL_MODS`) add mechanics; capstones
  (`CAPS`) give each path two choices. Skill reset is free in town; **stat points never move** (no respec).
- Three ultimates (Death's Toll, Unholy Resurrection, Soul Prison).
- Since Command (PR #5) the stats feed the hero from the army's power, and builds are even in the Tower (78/82/81). The Rift
  and very long fights still favor damage; nothing makes a build's identity visible beyond numbers.

## 2. Fifth skills

| Path | Skill | Type, level | Rank effect | Rank-3 upgrades |
|---|---|---|---|---|
| Frost | **Hoarfrost Lance** | active, lv 24, 16 mana, cd 4 | 140/170/200% of Siphon as frost; freezes the target 1 turn; neighbors gain 1 turn of Chill | *Shatterpoint*: a frozen target takes the lance at x1.5 / *Rime Spread*: freezes one neighbor too |
| Rot | **Plague Bearer** | passive, lv 24 | each rot effect on a target makes your rot ticks +5/10/15% harder on it (cap 3 effects) | *Contagion*: a target dying with 2+ rot effects passes one to a neighbor / *Festering*: rot ticks can crit |

Paths become 5/5/5/5; capstones unchanged.

## 3. Signature actives (level 40)

At level 40 the path with the most ranks offers its **signature**: one active, 20+ mana, once per room.

| Path | Signature | Effect |
|---|---|---|
| Bone | **Ossuary Gate** | every minion gains a Bone Wall shield of 15% of its max HP for 2 turns |
| Blood | **Exsanguinate** | drain 8% of current HP from every foe (bosses 4%); heal the army for the total, spread to the most hurt |
| Frost | **White Silence** | freeze every foe 1 turn; a boss instead loses its next move (charging moves are broken) |
| Rot | **Bloom of Ruin** | every Blighted or Poisoned foe bursts for 60% of Siphon as rot; bursts spread 1 turn of Blight |

A player can switch signature when they reset skills (the path with most ranks decides which is offered).

## 4. Skill runes

Runes slot into actives (one per active) and change how it works. Drops: Tower wardens (each warden drops its two runes
on first kill and 10% after), secret masters (one rune each, 100%), Rift guardians (R9, 15%). 16 runes:

| Skill | Rune A | Rune B |
|---|---|---|
| Bone Spear | *Splinter*: hits a second target at 50% | *Marrow*: a kill refunds half the mana |
| Dark Mending | *Stitchwork*: also cleanses one condition | *Overgrowth*: overheal becomes a shield |
| Corpse Explosion | *Chain*: spreads to a second body at 50% | *Bone Shrapnel*: applies bleed to everything hit |
| Curse of Frailty | *Spread*: also curses a neighbor at half | *Deep Curse*: the target's resist to your type drops 25% |
| Grave Chill | *Avalanche*: hits the whole row at 60% | *Permafrost*: freeze lasts a turn longer on non-bosses |
| Unholy Frenzy | *Blood Frenzy*: minions heal 10% of damage dealt | *Last Frenzy*: lasts a turn longer, costs 10% HP |
| Reap | *Second Harvest*: a kill resets the cooldown once a room | *Soul Reap*: a kill harvests a Soul |
| Hoarfrost Lance | *Glacier*: the lance pierces to the back row | *Cold Snap*: a frozen kill refunds the cooldown |

Runes are stored in a rune pouch; swapping in town is free.

## 5. Two more ultimates

| Ultimate | Effect |
|---|---|
| **Requiem** | every minion acts twice this turn; the second action at 60% |
| **The Long Name** | for 3 turns, every foe that falls rises at once as a thrall for this room (bosses excepted) |

## 6. Constitution in long fights

Constitution gains **Endurance**: for every turn past the 5th in a fight, the hero and the army deal +0.1% damage per
10 Constitution (`CON_ENDURE` .001), capped at +25%. A hero with 200 Con gains +2% a turn, reaching the cap at turn 17.
Gates rarely reach turn 6
(lesson 1), so it lives where fights are long: the Tower's upper floors, the Rift, secret masters, sieges. Target: Con
builds within 5 Tower floors and 8 Rift depths of the others.

## 7. Respec

With R5: the Library's respec. Without: a market respec at `1000 x level` gold, once per 7 days, the first free.

## 8. Numbers and tuning

- Path builds (`"path":"bone"` probes, etc.) within ~4 points on gates, within 5 floors in the Tower.
- Signature actives within ~2 points of each other.
- Each rune pair (a vs b) within ~2 points, like rank-3 upgrades.
- New ultimates within ~2 points of the old ones (`"ult"` probe).

## 9. Save

`S.player.runes = {skillId: runeId}`, `S.runes = [ids]` (pouch), `S.player.sig` (chosen signature), `S.respec` (shared with
R5). Loader defaults.

## 10. UI, Turkish, Codex, titles

UI: rune slots on active skill cards; the signature card on the skill tree at 40; Endurance shown in the stat hints; a
"build summary" line on the hero panel (path, signature, runes). ~120 strings. Codex: Signature actives, Runes. Titles
(4): *Runesmith* (all 16 runes), *Signature* (100 signature casts), *Long Haul* (win a 15-turn fight), *Five by Five*
(a path at five skills ranked 3).

## 11. Tests

`101-builds`: the two new skills and their upgrades; signatures once per room; runes change their skills; new ultimates;
Endurance counts turns past 5; respec rules.

## 12. Bot policy

Build probes per path; slot the rune the measurement prefers; cast the signature on the boss room's first turn.
`"off":["runes","sig"]`.

## 13. Risks

- **Power creep at 40+**: signatures are once per room; the late retune absorbs them (`DIFF.foeAtk` for B/A/S).
- **Rune hunting as a grind**: wardens drop their runes on first kill; the rest is a bonus.
