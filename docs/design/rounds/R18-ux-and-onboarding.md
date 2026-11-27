# R18. UX and onboarding pass

**Priority** P3. **Size** L. **Needs** any three rounds before it (then repeat after every five).
**Pillars served**: 3 (read the fight), and every pillar indirectly: a system nobody finds does not exist.

## 1. The problem

Every round adds rules, panels and buttons. The first hour (`OPEN_AT`, 36 tips) was tuned for the game as it was; the
mobile layout was a pass, not a design; late saves are large; there is no way to ask the game "why did I lose".

## 2. The first hour, again

- Replay days 1-10 with the systems as they are now; write the order in which each system appears.
- Rule: **at most one new system a day** in the first 10 days, each introduced by a tip and a Codex link.
- Prune and rewrite the 36 tips: remove what is no longer true, add one per new system, and show tips by context (a tip
  about kits on the first kit foe, not at a fixed day).
- A **"What next"** pass: the existing suggestion line covers every system added since (Forge, Yard, orders, ...).

## 3. Mobile layout

- One-thumb battle: commands in a bottom bar (Strike, Siphon, Ward, skills scroll), orders as a second row.
- The log collapses to the last 3 lines with a pull-up.
- The Town map (R5) scrolls and pins the selected building.
- Every card fits 360 px wide; tooltips become tap-to-open sheets.

## 4. Codex links

Every number in a tooltip that comes from a rule links to the Codex line that explains it (a small dotted underline). A
test walks every link to make sure its target exists.

## 5. Why did I lose

The History gains a **lost room view**: turn by turn, each action, the blow that downed the hero or broke the army, its
move and intent (was it shown?), the answer (from the kit tables of R1 and R2), and what the bestiary knew at the time.
The defeat screen links to it.

## 6. Performance on late saves

- Fixture: a save with 500+ items, 60 minions, 150 titles, 200 Memorial names, 3 cycles of History.
- Budget: Town and Army tabs render under 50 ms; a battle turn under 16 ms of logic.
- History is pruned to the last 200 runs (older runs summarized), and the save size is checked on write (a warning past
  4 MB).

## 7. Accessibility

- Damage types use colors that stay apart for the common color blindnesses, always with an icon.
- A font size setting (90-130%).
- Reduced motion (shared with R17's reduced effects).
- Every button reachable by keyboard; focus visible.

## 8. Tests

`109-ux` (use the next free number): render timings on the fixture save; every Codex link's target exists; tips reference
existing systems; the mobile layout's key panels fit 360 px (a DOM width check in the headless page).

## 9. Bot

None; this round is measured by the timings and by the play log (R15) if a human log exists.

## 10. Risks

- **A UX pass that never ends**: this round has a fixed list (sections 2-7); new findings go to the catalogue.

## As built

### PR A: tips, What next, Codex links, Why did I lose
- **The first hour, measured.** An instrumented bot run (6 bots, 12 days) logged the day each tip's moment first came and
  each system opened. About 15 tips fired on day 1; the Forge, the workbench and brewing opened on day 1, curses and
  raids on day 2, omens on day 4, the town, bounties, the Yard and the Reserve on day 5, faith and the Tower on day 11,
  orders, sieges and dread on day 13.
- **Paced tips** (`TIP_META`, `tipKind`, `tipCx`, `S.tips.pace`). Every tip has a kind and a Codex page:
  - 11 core tips (the first hour's how-to: stats, a fight, raising, traits, skills, orders, doors...) show whenever their
    moment comes.
  - 17 moment tips (a charging boss, a second phase, a nemesis born, a mark to choose) show when it happens.
  - 21 system tips (a system opening) wait if another system was introduced that day: at most one new system a day. A
    second waits for the next dawn. The day's count lives in `S.tips.pace` and is checked by normalizeSave.
  - In town the tip box has a "Read more in the Codex" link (not mid-fight, where it would jump tabs).
- **Pruned and rewritten.** Stale tips fixed: traits evolve at 5, 10, 18 and 28 levels (not 5 and 10); the gods are five
  (also in the Codex and How to play); a second phase adds Sundering Blow or the boss's own twist; the trophy tip reads
  its numbers from the forge and brew constants. New tips for the systems added since: boss hearts at the Forge,
  brewing, daily orders, the town's dread, nemeses, marks, awakening, the black market, inscriptions and cosmetics.
  Two old tips that were only half in Turkish (orders, affixes) are now whole.
- **What next** (`goalsAll`, `goals`): the goal list now also covers a siege warning, today's orders, a nemesis waiting
  (by name and gate), a free inscription slot, a boss heart that can be forged (never one a unique still needs), a tithe
  when the town is afraid, a brew you have the parts for, and the black market's day. Still at most three shown.
- **Codex links** (`H_CX`, `cxHeads`): 31 town panel headings carry a small "?" that opens the Codex page explaining
  them (not inside the Codex itself). A test renders every tab of a rich save and walks every `cxgo` link to a page that
  exists. The spec's "every number in a tooltip" was narrowed to every panel: tooltips are plain titles and cannot hold a link.
- **Why did I lose** (`src/game-lost.js`, new, after game-playlog.js):
  - Every fight room keeps a turn journal: each log line with its turn (`S.run.tj`, at most 120 lines), and at the end
    of each turn your HP and how many minions stand (`S.run.tjh`).
  - A fall keeps the room in `S.lost` (the last 3): the blow (from the existing defeat recap), the foes still standing,
    and what the bestiary knew of the killer's kind (mastery tier, kills, whether its kit was on its card).
  - The view (`lostHTML`) answers three questions: was it shown (a telegraphed move and its warning, a plain blow's
    intent, a wound's ticking), the answers (the move's counters from `chargeInfo`, the kit's answer from `KITS`, a
    wound's cures), and the bestiary. Below, the room turn by turn.
  - The defeat screen opens it ("Why did I fall?"); the History lists the last 3 falls. Lines from a save are escaped.
    New Game+ starts with none.
- **Fixed on the way**: building a siege work stored the works in build order, while a save loads them in table order,
  so a save/load could change the game (found by the fuzzer). Works are now stored in table order.
- **Measured**: no rule changed. Bots match R17 exactly (market 95% clears, Tower 83, Rift 22.4; full 94%, Tower 86.5).
- **Tests**: `tests/groups/98-ux.js` (8 tests).
