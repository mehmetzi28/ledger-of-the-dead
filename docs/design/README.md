# Ledger of the Dead: design documents

This folder is the game's design document (GDD). It says what the game is trying to be, how every system works today,
how the systems feed each other, what the balance numbers are, and what to build next. Work on the game should start
here instead of from a blank page.

| File | What it holds | Read it when |
|---|---|---|
| [01-vision.md](01-vision.md) | The pitch, the design pillars, the player fantasy, the loop at each time scale, the rules we don't break | Before deciding whether an idea belongs in the game |
| [02-systems.md](02-systems.md) | Every system as it works on `main` today: rules, key numbers, unlocks, where the code lives | Before touching a system |
| [03-connections.md](03-connections.md) | The map of what feeds what, resource flows, and the numbered list of weak or missing links (G1, G2, ...) | When looking for what to connect next |
| [04-balance.md](04-balance.md) | Targets, the latest bot measurements, known balance problems, tuning levers and how to measure | Before and after any tuning |
| [05-roadmap.md](05-roadmap.md) | The prioritized backlog, grouped into big rounds, plus ride-along fixes and a parking lot | When picking the next round |

## How a round works

Mehmet's rules for this project: every round is a substantial feature or rework (small fixes ride along inside a big
round), the game is never published or deployed, and a round's PR is merged once CI is green.

1. **Pick** the highest open round in [05-roadmap.md](05-roadmap.md) whose dependencies are met. If something more
   urgent came up (a bug, a balance break), put it in the roadmap first, then pick.
2. **Plan** against [02-systems.md](02-systems.md) and [03-connections.md](03-connections.md): list every system the
   round touches and every gap (G-number) it closes. A round should connect at least two systems, not add an island.
3. **Build** in `src/` (see `claude.md` for the build, save and Turkish rules), with tests in `tests/groups/`.
4. **Measure** with the balance bot (`node tests/run-balance.js`, both seeds 7700 and 9100, market and full) and compare
   with the targets in [04-balance.md](04-balance.md). Retune until the targets hold.
5. **Update these docs in the same PR**: the system's section in 02, any new links or closed gaps in 03, the new
   measurements in 04, and the round's status in 05 (move it to "Shipped" with the PR number).
6. **Open the PR**, wait for CI, merge, start the next round from a fresh `main`.

## Status

Written 2026-11-26 against `main` at `b254d15` (PRs #1 to #3 merged: Soul Tether, one soul per boss, Awakening, the
B/A/S retune, Constitution feeding the army, the tier advice refit, harder Weekly Trials that pay boss hearts, the
Eclipse title fix). A round making the hero's power scale with army strength was in progress in another thread.
