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

## As built (PR A)

- **Code**: `src/game-builds.js` (new, after game-asc.js); its constants (`LANCE_*`, `PEST_*`, `CON_ENDURE*`, `ENDURE_FROM`,
  `REQUIEM_MUL`, `LNAME_TURNS`, `LONG_HAUL`) sit in game-data.js because skills, ultimates and titles read them as they load.
- **Hoarfrost Lance** (Frost, active, level 24, 16 mana, cooldown 4): 140/170/200% of Siphon as frost, freezes the target a
  turn (bosses hold 50/60/70% of the time, like Grave Chill), and Chills the foes beside it for a turn. *Shatterpoint*: x1.5
  on a frozen target. *Rime Spread*: also freezes one non-boss neighbor.
- **Pestilence** (Rot, passive, level 24): named so to avoid the Plaguebearer trait. Each wound on a foe (any damage over
  time, up to 3) makes the wounds on it tick 5/10/15% harder. *Contagion*: a foe dying with two or more wounds passes one to
  another foe. *Virulence* (renamed from Festering, which is the Rot capstone): wound ticks can crit at Strike's crit chance.
- Every path now holds five skills (`PATHS`); capstones unchanged.
- **Requiem** (ultimate): at the end of the turn, after the haste strikes, every standing minion acts again at 60%.
  **The Long Name**: for 3 turns every non-boss foe that falls rises at once as a thrall (`m.ln`, holds no slot) that fights
  for the room; `lnClear` removes them when the room is won or you go home. Both take Heavy Souls' +25%.
- **Endurance** (`endureK`, in `pierceMul`): past turn 5, you and your army deal +0.3% damage per 10 Constitution per further
  turn, up to +25% (`CON_ENDURE` .003: the spec's .001 assumed 200 Constitution; the bots hold ~25-60). Shown on the Status
  panel and in the Codex. Measured: no change for the bots at .003, .006 or .01 (Will+Constitution market, seed 7700: 93-94%,
  Tower 78.9, Rift 14-16), because their Tower and Rift losses are not long fights. The Rift gap stays open: Will+Con Rift
  15, Will+Str 17.3, Will+Int 26.6; Tower 78.5 / 83 / 82.3 (within the 5-floor target).
- **Respec**: the Library's stat respec (R5) already covers it; nothing new.
- **Titles** (2 of 4; *Runesmith* and *Signature* come with PR B): *Long Haul* (win a fight of 15+ turns), *Five by Five*
  (rank every skill of one path to 3). 196 titles.
- **Bot**: learns Hoarfrost Lance after Reap and Pestilence last; casts the lance on a boss or two or more foes; `"ult"`
  accepts `requiem` (a boss or 3+ minions standing) and `longname` (3+ non-boss foes).
- **Tests**: `tests/groups/98-builds.js` (5 tests). 855 tests.
- **Balance** (seeds 7700/9100): market 88/89% (was 89/90), Tower 78.9/79.3, Rift 15.4/15.9; full (7700) 90%, Tower 85.8
  (83.6), Rift 23.9 (20.7), sieges 82%, rival 52%. Ultimates (market 7700): Death's Toll 88% T78.9 R15.4, Unholy
  Resurrection 88% T79.5 R14.7, Soul Prison 89% T79.9 R16.6, Requiem 89% T79 R16.1, The Long Name 88% T78.8 R15.4: all
  within a point. Fuzz 12/12.

## As built (PR B)

- **Code**: `src/game-builds.js` (signatures, runes); constants `SGN_*`, `RUNE_*` in game-data.js.
- **Signatures** (`SGN`, `sgnPath`, `useSgn`): from level 40 the path with the most skill points (at least 10; a tie goes to
  the path chosen on the Skills tab) gives its signature, 22 mana, once a room. Changed from the spec: **it does not use
  your turn** (like a Rally). As a turn-taking active the bot lost ~4 Rift depths (13.4 vs 17.6 with it off) because a
  crowd-room turn spent on a ward or a drain is worth less than a skill; as a free action it is a pure choice of when.
  *Ossuary Gate*: every minion gets a ward of 15% of its max HP. *Exsanguinate*: drains 8% of every foe's current HP (4%
  from bosses), armor ignored, and heals your side for the total, the most hurt first. *White Silence*: freezes every foe that
  is not a boss; a boss is Chilled 2 turns and its charging move breaks (freezing bosses too was worth +5 Rift depths). *Bloom of Ruin*: every poisoned or blighted foe bursts for 60% of Siphon as rot,
  and every foe is Blighted for a turn. A room the signature ends is won at once. Button in the battle bar, key T.
- **Runes** (`RUNES`, 16, `S.runes` pouch, `S.player.runes` slots): one per active, swapped free in town on the Skills tab.
  Changes from the spec table: Splinter was already Bone Spear's rank-3 upgrade, so Spear's pair is *Marrow* (a kill
  refunds half the mana) and *Sundering Spear* (Sunders 2 turns); *Stitchwork* clears every condition; *Overgrowth* wards
  up to 20% of max HP; *Chain* bursts a second body at 50%; *Deep Curse* drops every resistance 25 points for the room
  (`e.resD`, in `foeRes`); *Avalanche* hits every other foe at 60%; *Glacier* pierces one more foe at 60%; *Soul Reap* is
  *Soul Harvest*. Runes do nothing in a Sweep. Drops: a Tower warden leaves its two runes the first time it falls, then
  10% (rolled by `dayHash`, never `Math.random`); each secret master leaves one; a Rift guardian 15%. A rune you hold
  already crumbles into 20 bone dust.
- **UI**: the signature card and a rune row on each active skill card (Skills tab), the build line on the Status panel
  (path and points, signature, slotted runes), Codex sections *Signatures* and *Runes*, all in Turkish.
- **Titles**: *Runesmith* (all 16 runes), *Signature* (100 casts). 198 titles.
- **Fix**: Deep Winter (the Frost capstone) could kill a foe through weakness or a curse in the end-of-turn tick, which runs
  no death check, leaving a 0 HP foe the battle never ended on (found by the frost-lean probe); it now stops at 1 HP.
- **Bot**: slots its preferred rune (`"runes":"a"|"b"`, else the other), casts the signature on a boss room, three or
  more foes, or (Blood) an army under half HP; `"lean":"bone"|"blood"|"frost"|"rot"` learns that path's skills first and
  follows it; `"off":["runes","sig"]`.
- **Tests**: 4 more in `98-builds.js` (signatures, rune drops and slots, each rune's change, UI/Codex/titles/Turkish).
  859 tests.
- **Balance** (seeds 7700/9100): market 89/90%, Tower 77.9/79.3, Rift 17.1/18 (PR A 15.4/15.9; with the signature off
  17.2, so the free action costs nothing and the rise is noise plus runes); full (7700) 90%, Tower 85.5, Rift 21.2.
  Runes b instead of a: 89%, Tower 78.2, Rift 18.2 (a: 77.9 / 17.1), within the 2-point target. Path leans (market 7700,
  signature on): Bone 90% T78.5 R17.9, Blood 90% T78.3 R17.7, Rot 89% T79 R18.3, Frost 90% T81 R21.8 (9100: T79.6 R20.1).
  Gates within a point; Frost leads the Rift by ~3 depths through White Silence (Frost with the signature off: R17.8),
  left as the control path's edge. Fuzz 12/12.
