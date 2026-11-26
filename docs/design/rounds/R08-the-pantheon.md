# R8. The pantheon: faith rework, gods and omens

**Priority** P2. **Closes** G18, G20. **Size** L (two PRs if the omen calls grow). **Needs** R5 (Temple, dread); R1 gives
each god a damage type.
**Pillars served**: 4 (choices with a cost), 5 (the Ledger is a story), 3 (read the fight: omens you can plan for).

## 1. The problem

- Faith (`FAITH`) is a binary oath from level 8 and 3 clears: Honored (+10% HP, +25% healing; -8% damage, -15% gold) or
  Dishonored (+12% damage, +20% gold; -10% HP, -25% healing). Devotion grows by days alone (x1.5 at 10 days, x2 at 25)
  to one blessing (Grace or Tithe of Souls). Nothing you do changes it.
- Omens (`OMENS`, 7, 25% of days) happen to you; nothing calls, forecasts or wards them.
- The Old Gods are named in the lore but never met.

## 2. The gods

Four Old Gods and one profane path. Each owns a damage type, two omens and a playstyle, and asks a **vow** of you.

| God | Domain | Type | Omens | Playstyle | Vow (breaking costs a rank) |
|---|---|---|---|---|---|
| **Morrow, the Last Light** | mercy, endings | fire | Pale Tide, Ashfall | few, strong minions; healing | never raise more than 10 bodies in one run |
| **Vesh, the Cold Mother** | sleep, preservation | frost | Soul Storm, *Long Night* (new) | freezing, Preserved bodies | never let a body rot (Rotten condition) |
| **Ulm of the Furrow** | harvest, rot | rot | Bone Harvest, *Rot Bloom* (new) | trophies, poison, corpse use | never sell trophies (use them) |
| **The Hollow Choir** | voices, the dead | shadow | Black Eclipse, *Choir Night* (new) | Siphon, the Memorial | never lose a named minion (Elder or marked) |
| **Profane** (no god) | defiance | physical | Blood Moon, Iron Rain (random calls) | today's Dishonored | none; the Inquisition hates you (+10 dread base) |

Today's Honored maps to Morrow, Dishonored to Profane (loader), so old saves keep their oath.

## 3. Devotion and boons

Devotion is points earned by **deeds** the god likes; every 100 points is a rank, five ranks. Breaking the vow loses a
rank (not below 0) and that day's points.

| God | Deeds (points) |
|---|---|
| Morrow | a foe slain by fire (1), a minion healed from under 25% (2), a run with no minion lost (10) |
| Vesh | a foe frozen (1), a Preserved body raised (5), a boss frozen (5) |
| Ulm | a trophy used in a brew, forge or commission (1 each), a rot kill (1), a body exploded (2) |
| Choir | Siphon cast (1), a headstone raised (10), the Memorial honoured (5) |
| Profane | any elite or boss kill (2); devotion decays 5 a day (defiance is spent fast) |

Target pace: rank 1 in ~3 days, rank 5 in ~40 days of play that fits the god.

### Boons (ranks 1-5)

| Rank | Morrow | Vesh | Ulm | Choir | Profane |
|---|---|---|---|---|---|
| 1 | +15% healing received | Grave Chill -3 mana | +15% trophy drops | Siphon +1% per minion (cap 10%) | +8% damage |
| 2 | +8% HP | frozen foes take +10% | rot ticks +15% | Silence on you lasts a turn less | +15% gold |
| 3 | fire kills burn their neighbors (20% of the blow) | Preserved bodies +10% raise | kills leave rot pools (rot to the next foe in that slot) | the Memorial honour lasts two days | +1 Soul max |
| 4 | the first minion to fall each room stands at 10% | +1 freeze turn on non-bosses | Corpse Explosion -1 cooldown | +2% army damage per honoured stone (cap 10%) | +12% damage, -10% HP |
| 5 | *Grace* (today's) and once a run a fallen minion rises at 30% | *Hibernation*: a frozen boss cannot change phase that turn | *Harvest Home*: each run's last room pays its trophies twice | *Requiem Chorus*: Memorial minions sing (+1% army damage each, cap 15%) | *Tithe of Souls* (today's) |

## 4. Omens: forecast, call, ward

- **Forecast**: a sworn necromancer sees tomorrow's omen (or "no omen") at dusk, on the day-end card.
- **Call**: spend one devotion rank to make tomorrow one of your god's two omens. The Temple (R5) L5 gives one free call
  a week.
- **Ward**: spend one rank to cancel a forecast omen (any god's).
- Profane calls a random omen (from all ten) for free once a week; it cannot ward.
- The new omens:
  - *Long Night* (Vesh): one extra watch today; foes +10% HP.
  - *Rot Bloom* (Ulm): every foe starts Blighted; every body rots unless frozen.
  - *Choir Night* (Choir): every unit starts each room Silenced for a turn; minions deal +15%.
- Omen chance stays 25% (`OMEN_CHANCE`); calls add on top.

## 5. Shrines

The Old Gods shrine event becomes one shrine per god (the existing `oldgods` and `defiled` events become Morrow's and
the Profane altar). Meeting your god's shrine: +20 devotion and its heal. Another god's shrine: offer a **conversion**
(change god, keep half the devotion points), or *Desecrate* it (Profane only: +gold, +10 devotion, +2 dread).

## 6. Hooks into other systems

- **Dread** (R5): Morrow -1 dread drift a day; Choir +10% siege pay; Profane +10 base dread; Vesh sieges lose 1 turn of
  wave 3 to frost; Ulm commissions pay +20%.
- **Sieges**: the Inquisition's Captain's line names your god; Profane sieges bring one more witch-hunter.
- **Temple** (R5): L3 specializations per god (Morrow *Hospice*: town heals the army fully at dawn; Vesh *Ice House*:
  Embalmery bodies never spoil; Ulm *Granary*: brewing costs one fewer part; Choir *Bell Choir*: headstones 20% cheaper;
  Profane *Black Chapel*: devotion decay halved). L5: the free weekly call.
- **Story**: one passage per god at rank 1 and rank 5 (10 passages); R3's epilogue names your god.
- **Titles**: one per god at rank 5 (5), *Weather-Maker* (call 20 omens), *Godless* (finish a cycle Profane), *Turncoat*
  (convert three times).

## 7. Numbers and tuning

- Each god within 3 points of the others on gates (`full`, `"faith":"<god>"`); within 5 Tower floors.
- Omen calls used by the bot on boss days; ward used on omens that hurt the build (Ashfall for a weak army).
- The Profane path's decay is the lever if it leads.

## 8. Save

`S.faith = {god, dev, rank, vow:{broken:day}, calls:{week, used}}`. Loader: `{oath:'hon'}` -> Morrow with rank from old
devotion days (10 days: 2, 25: 4); `{oath:'dis'}` -> Profane likewise. `S.omenNext` (forecast, rolled at dusk instead of
dawn; dawn reads it).

## 9. UI

The Old Shrine becomes the **Pantheon**: five god cards (domain, vow, boons by rank, deeds), the current devotion bar,
and the forecast with Call and Ward buttons. The day-end card shows tomorrow's omen. A god sigil beside the hero's name.

## 10. Turkish, Codex

~220 strings (five gods, 25 boons, deeds, vows, ten passages). Codex: The Pantheon, Devotion, Omen calls.

## 11. Tests

`98-pantheon`: deeds give points; vows break and cost a rank; boons apply by rank; calls and wards change tomorrow; old
oath saves convert; shrines and conversion; dread hooks.

## 12. Bot policy

Pick the god that fits the build (Str: Profane, Int: Choir, Will: Morrow, Con: Vesh by default; probes for each); keep
the vow; call the god's best omen on boss days. `"off":["gods"]` uses today's binary oath.

## 13. Risks

- **Vows that feel like traps**: each vow is shown before swearing, and the game warns before an action that breaks it
  (raising the 11th body under Morrow asks once).
- **Omen calls make days predictable**: calls cost a rank; only one a day.
