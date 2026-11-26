# R19. The valley map: roads, sites and travel

**Priority** P4 (new system). **Size** XL, two PRs. **Needs** nothing hard; R20 (villages) lives on this map, R25
(seasons) changes it, R13's nemeses walk it.
**Pillars served**: 5 (the Ledger is a story: the valley is a place), 4 (choices with a cost: where to spend a watch),
2 (every death is a resource: graveyards and battlefields are places to harvest).

## 1. Why

The game's world is a list: six gate cards, the Tower, the Rift, the town. The lore describes a valley with a river, a
drowned chapel, an abbey, villages and roads, and none of it is a place the player stands in. Days are spent by picking
a card. A map makes the valley real, gives watches a geography, and creates a home for content that is not a gate.

## 2. The map

A painted (canvas-drawn) map of the valley, shown on a new **Valley** tab (the Gates tab's cards stay as a list view).

- **Nodes**: the town (center), six gates, the Tower (north), the Rift (under the Throne), the drowned chapel (R3's abbey),
  three villages (R20), and **sites** (section 3). 20-30 nodes.
- **Roads** link nodes; each road has a length in **steps** (1-3). A watch is 3 steps of travel, so the far gates cost
  part of a watch to reach.
- **The hero has a position**. Starting a gate run from a gate node costs no travel; from elsewhere, the travel is paid
  first. Coming home is free (the Ledger pulls you back at day's end).
- To keep the game's pace, travel is a small cost: the six gates are 1-2 steps from town; only sites and villages are far.

### 2.1 Fog and discovery

The map starts with the town, Rat Warren and Sunken Crypt revealed. Clearing a gate reveals its neighbors; scouting
(section 4) reveals sites. Unrevealed nodes show as a smudge on the vellum.

## 3. Sites

Places that are not gates: one visit is one encounter or choice, then the site rests for some days.

| Site | What happens | Rest |
|---|---|---|
| **Old graveyard** (4 on the map) | dig: 2-4 bodies of the nearest gate's kinds (no fight), raise chance -10 (old bones) | 5 days |
| **Battlefield** (2) | a field of fresh dead after a siege or a village raid: 3-6 bodies at +10 raise | after each siege |
| **Ruined shrine** (one per god, R8) | the god's shrine event, guaranteed | 7 days |
| **Crossroads** | a pedlar, a bounty, or a stranger (a rare event: the rival's agent, a nemesis sighting) | 3 days |
| **Hermit's hut** | trade: a lore page, a skill rune hint, or a charm recipe for trophies | 7 days |
| **Collapsed mine** | a mini-gate of 2 rooms: iron foes (A-gate kinds) at your best gate's level, pays ore (heartforging -10% per ore, R4) | 5 days |
| **Gallows hill** | the hanged: a hexer body (R12) or a Choir event | 7 days |
| **Standing stones** | an omen call (R8) for tomorrow, any god, once a week | 7 days |
| **The river ford** | a toll to cross faster (one step saved for the day), or a drowned body (Preserved) | 3 days |
| **Wolf den** | a beast fight (new beast kinds: dire wolf, carrion crow swarm, grave bear) for beast trophies (charms of speed) | 5 days |

Sites roll their contents from the season (R25) and dread (R5) where they exist.

## 4. Scouting and the familiar

A **scouting** action (one step, from town) reveals one unrevealed node on a chosen road and the contents of resting
sites. The War Room (R5) L2 scouts automatically at dawn; the **raven familiar** (Library L3 research or a crossroads
stranger) scouts one node a day and shows nemesis positions (R13).

## 5. Encounters on the road

Each road step has a small chance (5%, +5% at Terror dread, +5% at night watch) of an encounter: a patrol of the living
(fight or bribe), a wandering elite (a named foe from the nearest gate), a corpse cart (bodies for gold), a pilgrim
(dread -2 if spared). Encounters use the existing event and battle code.

## 6. Connections

| System | Link |
|---|---|
| Gates | position matters for the day's plan; clearing reveals neighbors |
| Raising | graveyards and battlefields are body sources outside gates |
| Sieges | battlefields appear after them; the attackers' road is shown on the warning |
| Expeditions (R6) | squads move on the map; a squad's dawn report shows where it is |
| Villages (R20) | live on the map; roads to them can be cut by sieges |
| Nemeses (R13) | walk the roads between gates; meeting one on the road is a fight |
| Seasons (R25) | snow closes mountain roads, floods close the ford |
| Story | the drowned chapel and the abbey are nodes; lore pages hidden at sites |

## 7. Numbers

- Travel should cost about 10-15% of a day's watches on average for the `full` bot (it plans its route).
- Sites add ~5-8% of a game's bodies and ~5% of its gold; graveyards are the early-game body source for players who
  struggle to raise.
- Encounters: one in ~8 days for a bot that travels normally.

## 8. Save

`S.map = {pos, seen:{node:true}, sites:{id:{rest, seed}}, steps}`. The map layout is fixed data (`VALLEY_NODES`,
`VALLEY_ROADS`) and the same for every save, so saves store only state.

## 9. UI, Turkish, Codex, titles

The Valley tab with the painted map, nodes as icons, roads as dotted lines, the hero's marker, a day planner (watches and
steps shown as pips). Tapping a node shows its card (the gate card for gates). ~180 strings (site names and texts, road
encounters). Codex: The valley, Sites, Travel. Titles (5): *Cartographer* (reveal all nodes), *Grave Digger* (dig 100
bodies), *Every Road* (walk every road), *Ford-Crosser*, *Wolf-Skinner*.

## 10. Tests

`110-valley` (use the next free number): travel costs and the free return; fog and reveals; every site's encounter fires
and rests; road encounters; saves round trip; the list view still starts gates.

## 11. Bot policy

Plan the day as gate runs from the nearest gate; visit a graveyard when the army has empty slots; scout once a week.
`"off":["map"]` puts the hero at every gate for free (the old behavior) to measure travel's cost.

## 12. PR split

- **PR A**: the map, travel, fog, the list view, graveyards and battlefields.
- **PR B**: the other sites, encounters, scouting and the raven, connections to R5/R6/R13.

## 13. Risks

- **Travel as a tax**: the gates are close; coming home is free; the list view hides the map for players who prefer it.
- **Map art**: drawn from shapes and the palette; no outside images.
