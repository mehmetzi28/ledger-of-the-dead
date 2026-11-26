# R30. Necromantic research: a tree that ties everything

**Priority** P4 (new system). **Size** L. **Needs** R5 (the Library); best after several rounds, since its nodes improve
other systems.
**Pillars served**: 7 (a long game: a long-term goal beside the daily ones), 4 (choices with a cost), and the project's
aim to connect systems (each node links two).

## 1. Why

Progress lives in a dozen separate places (skills, buildings, bestiary, titles, Awakening...). There is no long project
the player sets for themselves, and no place where improving one system is explicitly paid for with another's resource.
A research tree, fed by study, is that place: each node is a small rule change that connects two systems.

## 2. Research points

Research points (RP) come from:

| Source | RP |
|---|---|
| A watch of study at the Library (R5) | 3 (+1 per Library level past 2) |
| A bestiary page reaching Ledgered | 5 |
| A lore page found | 3 |
| An apprentice's study task (R24) | 2 |
| A new boss kind's phase two seen (R2) | 2 |
| A secret master slain | 10 |

A `full` bot earns ~150-250 RP over 100 days. Research is kept through New Game+ (it is knowledge, like the bestiary).

## 3. The tree

Four branches, each with ~10 nodes in tiers (a tier needs 2 nodes of the tier below). Every node names the two systems it
ties.

### 3.1 Anatomy (army, raising)

| Node | RP | Effect | Ties |
|---|---|---|---|
| Bone Reading | 10 | see a body's traits before raising | raising, traits |
| Clean Cuts | 15 | Clean condition +5% raise | corpse conditions, skills |
| Sinew Grafts | 20 | fusion keeps a fourth trait | fusion, traits |
| Second Wind | 25 | bind back from a fall at 50% (was 40%) | shattering, Memorial |
| Lineage Charts | 25 | bloodlines (R23) inherit one step sooner | bloodlines, bestiary |
| Deathless Study | 40 | Eternals never shatter | evolution, shattering |

### 3.2 Occult (hero, skills, Souls)

| Node | RP | Effect | Ties |
|---|---|---|---|
| Soul Weights | 10 | Soul max +1 in boss rooms | Souls, bosses |
| Mana Lines | 15 | +5% mana from Strike | hero, combat |
| Rune Theory | 25 | a second rune slot on one active skill (R11) | runes, skills |
| Omenology | 20 | forecast omens without an oath | omens, faith |
| Corruption Theory | 30 | corruption (R21) rises 20% slower | phylactery, hero |
| The Long Name | 40 | ultimates charge from the army's kills too | ultimates, army |

### 3.3 Logistics (town, economy, expeditions)

| Node | RP | Effect | Ties |
|---|---|---|---|
| Ledger Accounts | 10 | trophy sale +10% | market, trophies |
| Cold Storage | 15 | Embalmery bodies keep 2 more days | Embalmery, raising |
| Road Maps | 20 | travel (R19) one step cheaper on long roads | map, gates |
| Supply Lines | 25 | expeditions (R6) +5% Haul | expeditions, economy |
| Tithe Rolls | 25 | village standing (R20) from trade x2 | villages, market |
| Grand Design | 40 | building upkeep (R5) -30% | town, economy |

### 3.4 Warfare (combat, sieges, kits)

| Node | RP | Effect | Ties |
|---|---|---|---|
| Foe Manuals | 10 | kits shown at Studied (was Known) | bestiary, kits |
| Weak Points | 20 | weakness hits +10% | damage types, bestiary |
| Siegecraft | 20 | siege works (R14) cost 25% less | sieges, town |
| Counter-Doctrine | 30 | the first telegraphed boss move each fight is weaker by 25% | bosses, combat |
| War College | 40 | free orders once more per room | commands, army |

(Each branch closes with a **capstone** at ~60 RP: Anatomy *The Perfect Dead* (raise chance cap +5), Occult *Ink of the
Book* (every skill -1 cooldown), Logistics *The Necropolis* (all buildings +1 effective level), Warfare *Undying Legion*
(the Soul Tether caps at 45%).)

## 4. Connections

The tree is the connection layer by design: every node names two systems. When a round adds a system, it adds two to
four nodes here.

## 5. Numbers

- A fully researched branch ~2-3 points of clears; the whole tree (only reachable across cycles) ~6-8 points, which NG+
  difficulty absorbs.
- `"off":["research"]`.

## 6. Save

`S.rp`, `S.research = {nodeId: true}` (top level, survives NG+).

## 7. UI, Turkish, Codex, titles

A Research page in the Library: four branches as a tree, nodes with cost, effect and the two systems they tie (with
links to the Codex). ~130 strings. Codex: Research. Titles (5): one per branch capstone (4), *The Whole Book* (every node).

## 8. Tests

`121-research`: RP sources; tier requirements; each node's effect (a table test); capstones; NG+ keeps research.

## 9. Bot policy

Research by a fixed order per build (Warfare first for market-style, Anatomy for army builds); measure per-branch value.

## 10. Risks

- **Mandatory power**: nodes are small; the tree spans cycles, so a single game finishes about one branch.
- **Nodes for systems not built yet**: a node whose system hasn't shipped stays hidden until it does.
