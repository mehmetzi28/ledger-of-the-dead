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
