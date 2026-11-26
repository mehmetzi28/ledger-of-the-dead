# R24. Apprentices: a school of the Ledger

**Priority** P4 (new system). **Size** L. **Needs** R5 (the Library hosts the school); R6 (expeditions) shares the
away-squad rules.
**Pillars served**: 7 (a long game: the keeper becomes a teacher), 4 (choices with a cost), 5 (the Ledger's succession).

## 1. Why

The late game is the hero doing everything personally: every gate, every floor, every siege. Raids hand a little work to
the army; nothing hands work to another necromancer. The story is about who holds the book next. Apprentices let the
player train successors who work on their own, make choices of their own and can be lost, and give the endgame a
management layer that pays for the time it saves.

## 2. Apprentices

An apprentice is a lesser necromancer with a name, a level, a **temperament** and a small army of their own (raised from
bodies the player gives them).

- **Recruited**: one at the Library L3 (a village's child of Saint Aldric's, a Greyhollow outcast, a drowned novice
  found at the abbey), up to three (Library L5 and the abbey cleared).
- **Temperaments** (one, shown at recruitment):

| Temperament | Strength | Flaw |
|---|---|---|
| **Careful** | never loses more than one minion a task | brings back 20% less |
| **Ambitious** | +25% haul | 10% chance a task to keep a body for themselves |
| **Devout** | +devotion to your god for each task (R8) | refuses tasks at Terror dread |
| **Cruel** | +30% raise chance on their tasks | +2 dread per task |
| **Bookish** | +Library study and lore pages | weak in fights (-15%) |

## 3. Tasks

Each dawn, assign each apprentice one task (it takes the day):

| Task | Needs | Pays |
|---|---|---|
| **Farm a gate** | a cleared gate 5+ levels under the hero | a share of a clear's gold, trophies and bodies (they raise some for their own army) |
| **Study** | the Library | bestiary progress on a chosen kind; a research point (R30) |
| **Tend the garden** (R23) | the Embalmery | planted bodies grow a day faster |
| **Hold the walls** | a siege tomorrow | they fight wave 1 with their army |
| **Run an expedition** | R6 | they lead a squad as Commander |
| **Climb** | the Tower | they take floors up to 30 under your best, paying Tower trophies |

Odds and pay use the apprentice's level and army strength against the task, the same way expeditions do.

## 4. Growth

- Apprentices level from tasks (and from the hero's honoring at the Memorial: +XP). Their army grows from bodies they
  raise and bodies you give (give from the Reserve).
- At level 30 an apprentice can be **ordained**: they pick a path (Bone, Blood, Frost, Rot) and gain its passive at half
  strength; their tasks pay +20%.
- **Loyalty** (0-100): rises with gifts, success and the hero's honor; falls with losses, refusals and a Cruel hero
  ordering a Devout apprentice into raids. At 0 they leave, taking their army. At 100 they gain a signature trait
  (*Devoted*: they'll take a killing blow for the hero once per siege).

## 5. Rivalry and succession

- An Ambitious apprentice at low loyalty may **defect to the rival** (R7): they become the rival's lieutenant in their
  gate (a fight against your own student).
- At the ending (R3), the Keep writing choice can **pass the Ledger** to an ordained apprentice: the NG+ cycle starts with
  that apprentice as the new hero (their name, temperament as a perk, their army as a starting Reserve of three), while the
  old hero becomes a **Mentor** (an ally card in town that gives +5% XP). A new ending variant: *The Book Changes Hands*.

## 6. Connections

Library (recruitment and study), dread and faith (temperaments react), expeditions and sieges (tasks), the garden,
the rival (defection), the endings (succession), the Memorial (apprentices who fall get headstones; their army joins
your Memorial too).

## 7. Numbers

- Three apprentices' tasks should be worth about one watch of the hero's own play per day in total (they save time, not
  replace play).
- Apprentices lost by the `full` bot: under 1 per game.
- `"off":["appr"]` worth a point or two in the late game only.

## 8. Save

`S.appr = [{id, name, temp, lvl, xp, loyal, path, army:[minions], task:{k, target}, log}]`. Succession: `S.player.mentor =
{name}` in NG+.

## 9. UI, Turkish, Codex, titles

An Apprentices page in the Library: portraits, temperament, loyalty bar, army, task picker; their dawn report beside the
expedition report. ~160 strings (names, temperaments, tasks, the succession passage). Codex: Apprentices, Tasks, Loyalty,
Succession. Titles (5): *Teacher*, *Three Students*, *Ordained*, *The Book Changes Hands*, *Betrayed* (an apprentice
defects).

## 10. Tests

`115-apprentices`: recruitment caps; tasks by needs and pay; temperament effects; loyalty and leaving; ordination; defection
to the rival; succession at NG+.

## 11. Bot policy

Farm gates with Careful apprentices; study with Bookish; keep loyalty above 50 with gifts. `"off":["appr"]`.

## 12. Risks

- **Idle-game feel**: tasks are a dawn choice with a report, not a timer; capped at three.
- **Succession confuses save identity**: the save keeps the old hero's records under the Mentor's name.
