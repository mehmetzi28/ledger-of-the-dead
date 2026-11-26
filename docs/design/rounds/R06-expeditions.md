# R6. Expeditions: raids rework and Commanders in battle

**Priority** P2. **Closes** G17, G8. **Size** L. **Needs** R5 (the War Room); R1 makes the odds richer (kits and types),
R4 adds war banners, R7 adds the rival's stash as a target.
**Pillars served**: 1 (the army is the character), 4 (choices with a cost), 2 (every death is a resource).

## 1. The problem

A raid today (`sendRaid`, `resolveRaid`): a Commander leads a squad of 1 + 2 + stage + boss bonus against a cleared gate
on Normal; the squad fights with you until nightfall, then marches; one roll from squad attack and HP against the gate
(5-95%). Win: 3x gold, up to three pieces of gear, half a level of minion XP. Loss: each follower may fall (30%). The bot
wins ~77-78%. It is a dice roll with one input (strength), one target type and no decisions after sending. The Commander
trait does nothing in battle.

## 2. The expedition model

An expedition is a squad, a **target**, a **length** in nights, and a **route** of steps. Each night resolves one stage
of three steps; each step has its own odds and its own role. At dawn the player reads a report and chooses what the squad
does next.

### 2.1 Targets

| Target | Opens | Length | Pays | Risk |
|---|---|---|---|---|
| **Gate** (any cleared gate, any cleared difficulty) | first clear | 1-2 | gold x3 of a clear at that difficulty, 1-3 gear, minion XP | base |
| **Cursed gate** (today's curse) | first curse | 1-2 | the curse's reward share x1.5 | +10% per step |
| **Tower band** (10 floors below your best, a band of 10) | Tower floor 20 | 2 | Tower trophies x2 of the band, one Tower-tier piece | the band's warden may appear (20%) |
| **Hunt** (one foe kind from a cleared gate) | Known in the bestiary | 1 | that kind's trophies x3; a boss hunt has a 25% heart chance | the kind's kit counts double |
| **Rival's stash** (R7) | rival chapter 2 | 2 | recover up to 2 stolen bodies, or one of theirs | the rival is warned: their next theft is a day sooner |
| **Vane Abbey** (R3) | the abbey cleared once | 3 | Vellum Scraps, a chance at a Regalia piece | the steps are at -10% |
| **Scavenge** (no fight) | always | 1 | bone dust and common trophies | none: a training run for new squads, half XP |

### 2.2 Steps and roles

Each night is three steps, each with a role that covers it:

| Step | Covered by | Without one |
|---|---|---|
| **Approach** (reach the target unseen) | a vanguard (or a hexer after R12) | -10% on this step |
| **Fight** | strikers and reapers: +3% per member, max +9% | -15% on this step |
| **Haul** (bring back the spoils) | a mender | half of this night's spoils are lost on the way home |

Base odds per step: `clamp(50% + 40% x (squadPower / targetPower - 1), 15%, 95%)`, where the squad's power uses the
existing raid strength (attack and HP), and the target's is the gate's room strength at the chosen difficulty. A night
succeeds when all three steps do; one failed step costs as in section 2.4.

### 2.3 Modifiers

- **Damage types (R1)**: each squad member whose type the target's gate profile is weak to: +3% on Fight; resisted: -3%.
- **Kits (R1)**: War Room intel (L1) names the target's two most common kits; for each kit whose stated answer the squad
  holds (a role or a type), +5% on Fight.
- **War banners (R4)**: +10% on all steps, or +1 member, or +1 body home.
- **War Room** (R5): +2% per level on all steps; squad size +1 at levels 1, 3 and 5.
- **Commander** (section 3): the leader's stage adds +2% per stage (Greater +2 to Eternal +8).
- **Bonds**: two bonded minions in one squad: +3% on Fight.

### 2.4 Dawn reports and choices

After each night the dawn report shows each step's roll, who fought, what was found, and offers:

| Choice | Effect |
|---|---|
| **Press on** (if nights remain) | next night with this night's spoils carried; the next night's spoils +50%, steps -5% |
| **Come home** | bank everything now, the squad returns at dusk and can fight with you tomorrow |
| **Risky path** | skip Approach next night; its spoils +100%; a failed Fight costs the weakest member outright (no shatter roll) |

A failed step: Approach failed: the night is lost (no spoils, no losses). Fight failed: each member rolls the existing
loss chance (30%, minus 3% per Will point's worth of the hero's shatter reduction). Haul failed: half of everything
carried is lost. A squad whose Commander falls comes home at once.

### 2.5 Pay target

An expedition night should be worth about one watch spent fighting at the same gate, measured in gold + XP + gear value
per watch of the hero's time. The hero still spends the watch elsewhere, so expeditions add, they do not replace. Bot
measure: `expValue / watchValue` per target (target 0.8-1.2).

## 3. Commanders in battle

The Commander trait (rare, today only for raids) gains a battle use.

- **Rally**: once per room, a free order (no action, no mana) from the Commander: either **+20% army damage this turn** or
  **cleanse one condition from every minion**. Shown as a button beside the free orders; greyed with its reason when
  used.
- Two Commanders in the army: only one Rally a room; the second adds +5% to the first's damage choice.
- An Elder or higher Commander's first order each fight (Taunt, Focus, ...) lasts one turn longer.
- A Commander on an expedition saves the first member who would fall, once per expedition.
- New compound (R12 ride-along): *Warlord* (Commander + Bloodfiend): Rally twice a room.

## 4. The War Room (R5 building, deepened here)

| Level | Effect |
|---|---|
| 1 | squad +1; intel: target's two most common kits |
| 2 | +2% steps; a second squad can be out at once |
| 3 | squad +1; *Map Table* (3-night expeditions) or *Quartermaster* (banners cost no gold) |
| 4 | +2% steps; dawn reports show the next night's odds |
| 5 | squad +1; *Generals' Hall* (a Commander leader +10% steps) or *Spy Network* (rival thefts warned a day ahead) |

Without R5 (shipping R6 first): one squad, size as today, intel always on.

## 5. Story and events

- Three expedition events that can appear in a dawn report (10% per night): *A lost patrol* (bring back a militia body:
  dread -3 if spared, a raise if taken), *An old camp* (a lore page, once), *Another keeper's squad* (a skirmish: +50%
  spoils if won, a loss roll if not; it is the rival's after R7).
- Passages: *The first long night* (first 2-night expedition), *They came home changed* (an expedition member evolves
  while away).

## 6. Save

`S.exp = [{id, target:{k, gate, diff, kind, band}, nights, night, squad:[uid], spoils:{gold, items, troph, bodies},
log:[...], pick}]` replaces `S.raid`. Loader: a pending raid becomes a 1-night gate expedition with its squad. Members on an
expedition carry `m.away = expId` and are skipped by formation, fusion and the Reserve.

## 7. UI

- The Raids panel becomes **Expeditions**: target cards (with odds by step and what they pay), a squad picker that shows
  which steps are covered, and a route preview.
- Dawn: the report as a three-step strip per night, with the three choices as buttons.
- Battle: the Rally button; the Commander's portrait gets a banner mark.

## 8. Turkish, Codex, titles

~110 strings. Codex: Expeditions (targets, steps, modifiers), Rally. Titles (4): *Long Road* (a 3-night expedition home
whole), *Hunt Master* (10 hunts), *Not a Scratch* (20 expeditions with no losses), *Rallying Cry* (100 Rallies).

## 9. Tests

- `95-expeditions`: every target opens at its condition; step odds and modifiers; choices change spoils and risk; Haul
  failure halves; the Commander saves once; raid save conversion; members away are skipped by formation and fusion.
- `96-rally`: once per room; the two choices; two Commanders; the Elder order extension; fuzz Rally with `act`.

## 10. Bot policy and tuning

- Pick the target with the best expected value per night that the squad covers fully; take *Come home* when the next
  night's Fight odds fall under 70%; never *Risky path* in the default policy (`"exp":"greedy"` probe takes it).
- Rally: +damage on the boss room's first turn; cleanse when two minions carry conditions.
- `"off":["rally","exp"]` (exp off falls back to the old raid roll).
- Targets: expeditions won 75-80% (`full`); `expValue/watchValue` 0.8-1.2; Rally worth ~1 point of boss-room wins.

## 11. Risks

- **Expeditions become the best farm**: the pay target caps them at about a watch's worth; tune `EXP_PAY` per target.
- **Too many dawn decisions**: a "same as last time" toggle per squad, and the bot's choice shown as a hint.

## As built (PR #19)

Shipped in one PR, src/game-exp.js (included after game-dread.js), 2026-11-26.

- **Targets** (`expTargets`, `tValid`, `tName`): a cleared gate (1-2 nights), today's cursed gate (1-2 nights, steps
  -5%, gold x1.25, two pieces of gear at most), ten Tower floors below your best once it reaches floor 20 (2 nights, Tower
  trophies, half the gold, one piece, a warden's heart 20% of nights), a hunt for a kind you have **mastered** (1 night,
  Fight -5%, three of its trophies, a boss's heart 25% of nights) and a scavenge near your deepest gate (1 night, no Fight,
  bone dust and trophies, half the XP). Not built: difficulties as targets, Vane Abbey (3 nights), the rival's stash (R7).
- **Odds**: each step is the cube root of the old raid odds (so a covered night is about the old raid's odds), then its
  cover: Approach -10% with no vanguard; Fight -15% with no striker or reaper, +3% each up to +9%, +-3% per member the
  gate is weak to or resists (GATE_RES, TOWER_RES for a band), +3% for a bonded pair, -5% on a hunt; the curse and
  each pressed night -5% on every step; clamped 15-97%. War banners and the War Room act through the old odds
  (`bannerOdds`, `warOdds`). The spec's new power formula and kit intel were not built.
- **Nights and the dawn choice**: spoils are carried (`x.sp`) and banked by `expHome`; at each dawn with nights left the
  squad waits in the field (`expOut`; the War table stays open for it and the hub says so) for press on (+50% spoils a
  night pressed), the risky path (no Approach, spoils doubled, a lost Fight takes the weakest follower) or come home.
  No 3-night expeditions, so *Long Road* asks for two nights.
- **Losses**: a failed Approach loses the night only; a failed Fight rolls each follower (30%, Grave-bound never), the
  Commander shielding the first once an expedition (`x.saved`); a failed Haul halves what is carried; no mender halves
  each night's take.
- **Road events** (10% of nights that hold): a lost patrol (the Embalmery keeps a militia body, or the town calms by 3),
  an old camp (bone dust, not a lore page) and another keeper's squad (60%: spoils +50%; else a follower may fall). No
  passages yet.
- **Rally** (`rally`, `rallyK`, `rallyHTML`): a free order once a room from a living Commander: +20% minion damage this
  turn (+25% with two Commanders) or one condition off every minion. Instead of "the first order lasts a turn longer",
  an Elder Commander (stage 2+) makes Taunt last 3 turns and Bone Shield 25% stronger. No Warlord compound (R12).
- **Save**: raids keep living in `S.raids`/`S.raidOrders` with `t`, `nights`, `night`, `sp`, `log`, `pick`, `pressed`,
  `won`, `saved`, `lostN` (`expFix`, `expOrderFix`); a raid from before loads as a one-night gate expedition. The squad
  keeps its places as raids always did, so no `m.away` flag was needed. `S.raidLog` rows gain `k` and `nights`.
- **Titles** (4): Long Road, Hunt Master, Not a Scratch, Rallying Cry (171 titles).
- **UI**: the War table shows squads in the field with a three-step strip and the three choices, target chips (a Hunts
  group), Nights chips, the squad with roles, each step's odds and what is uncovered; the Codex raids page states it all.
  Turkish for every new string.
- **Bot**: squads of the weakest who cover the three steps; cursed gate first, then the deepest gate, a band, a scavenge,
  at 55% a night or better; two nights at 80% with no siege within two days; presses on at 70%; Rally cleanse with two
  or more afflicted minions, else damage. `"off":["exp"]` (plain gate raids), `"off":["rally"]`.
- **Measured** (seeds 7700/9100): market unchanged; full 89/90%, Tower 83.7/85.4, Rift 17.2/15.0 (12.4 without
  expeditions), sieges 81/82%, expedition nights held ~84%, Rally under a point. See 04-balance.
- **Tests**: 95-expeditions (9), 96-rally (5); 799 in all; fuzz 12/12 clean.
