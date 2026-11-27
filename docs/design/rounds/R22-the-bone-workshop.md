# R22. The bone workshop: constructs built from parts

**Priority** P4 (new system). **Size** L. **Needs** R4 (trophy uses) helps; R12 (charms) shares the slot rules.
**Pillars served**: 2 (every death is a resource: parts from many bodies make one), 1 (the army is the character: a
construct is designed, not found), 4 (choices with a cost).

## 1. Why

Every minion is a foe that rose. The player can shape one through traits, fusion, marks and (R12) charms, but never
**design** one. Trophies and spare bodies pile up. A workshop where parts from several bodies are sewn into one
construct gives the late game a creative sink and gives every kind of foe a reason to be killed.

## 2. Constructs

A **construct** is a minion built in the workshop (a new town building, the **Bone Workshop**, opened at the Crypt L2).
It counts as a minion (army slot, formation, XP, evolution) with three differences: it cannot be raised, it never
shatters (it **breaks**: repaired in town for gold and dust, unusable for a day), and its traits come from its parts.

### 2.1 Parts

A construct has four part slots. Each part comes from **bodies** (unraised corpses kept by the Embalmery, R5) or from
**trophies** (6 per part), and carries the role factors and one trait of its source:

| Slot | Decides | Example parts |
|---|---|---|
| **Frame** (torso) | role and base HP | Bone Plate frame (vanguard), Ribcage frame (reaper), Censer frame (mender) |
| **Arms** | attack and damage type | Iron Orchard arms (physical, +armor pierce), Ember arms (fire), Drowned arms (frost) |
| **Head** | one trait from the source kind | the source kind's kit as a trait (R1): a Shield-bearer head guards, an Ambusher head ambushes |
| **Core** | special rule | a boss heart core (the boss's signature at 30%), a Soul core (+1 Soul when it kills), a Rift Shard core (R9) |

The frame's gate sets the construct's tier (S frame: S tier). Arms and head from lower gates lower its stats slightly
(average of the four parts' tiers).

### 2.2 Building

- Cost: the four parts + gold (`2,000 x frame tier`) + bone dust (`10 x tier`). Takes one watch.
- Up to **two constructs** in the army at once (three with the Workshop L5).
- Parts can be **replaced** later (the old part is lost), so a construct grows with the player.

## 3. Construct levels and evolution

Constructs gain XP like minions and evolve at the same stages; at each stage they gain a **fifth slot** use: Greater
adds a *plate* (armor), Elder a *second core*, Ancient *wings* (moves between rows once a fight), Eternal a *crown* (the
construct's head trait spreads to adjacent minions at 30%).

## 4. The Bone Workshop building

| Level | Effect |
|---|---|
| 1 | build constructs (one in the army) |
| 2 | two in the army; repair 50% cheaper |
| 3 | spec: *Bonesmith* (parts from 4 trophies instead of 6) / *Flesh Sculptor* (bodies give two parts) |
| 4 | constructs gain +10% HP |
| 5 | three in the army; spec: *Masterwork* (a construct can take two heads) / *Living Steel* (constructs never break in sieges) |

## 5. Connections

Trophies (a new major use), the Embalmery (bodies as parts), bosses (heart cores), R1 kits (head traits), sieges
(constructs hold walls), expeditions (constructs never die on expeditions: they break), the Memorial (a broken construct
is not a loss, so the Memorial stays for the raised dead).

## 6. Numbers

- A construct should be about as strong as a raised minion of the same tier at the same level, with the design freedom
  as its edge (not raw power).
- The `full` bot builds its first construct around day 30-40; two by day 70.
- `"off":["constructs"]` should cost about a point.

## 7. Save

`m.cons = {frame, arms, head, core, extra:{}}` on a minion record (constructs live in `S.army`/`S.reserve` like others),
`m.broken = day`. `S.build.workshop`.

## 8. UI, Turkish, Codex, titles

The Workshop page: four slots with part pickers (each shows its source, stats and trait), a live preview card, the build
button with its cost. ~140 strings (part names per gate). Codex: Constructs, Parts, the Workshop. Titles (5): *First
Stitch*, *Patchwork Army* (three constructs at once), *Heart of a King* (a boss-heart core), *Eternal Machine*, *Every
Gate in One* (parts from four different gates).

## 9. Tests

`113-constructs`: parts set role, type and trait; tier from parts; building cost; break and repair instead of shatter;
evolution slots; replacing parts; the army cap.

## 10. Bot policy

Build a vanguard construct with a Shield-bearer head and a boss core once parts allow; replace parts when a higher frame
is available.

## 11. Risks

- **Constructs replace raising**: capped at two-three, and they cost the late-game currencies raising doesn't.
- **UI depth**: the preview card shows the final minion card, so the player sees the result, not the math.

## As built

### PR A: the Workshop, parts, constructs, breaking and repair
- **The building** (`src/game-workshop.js`, `BUILD.workshop`, opens at the Crypt L2): keeps 1/2/3 constructs at L1/2/5
  (broken ones count), repairs half price at L2, +10% max HP at L4; siege perk +10% max HP on the wall. Specializations:
  L3 *Bonesmith* (4 trophies a part) / *Flesh Sculptor* (two parts a body); L5 *Masterwork* (a second head) / *Living
  Steel* (repairs free and at once; changed from "never break in sieges", which a broken construct already survives).
- **Parts** (`S.parts={kind:n}`): `sewPart` (6 trophies of one kind, a gate or Tower kind) and `cutPart` (a non-boss
  body kept in the Embalmery). Parts are kinds, not named items: the slot decides what a kind gives.
- **Constructs** (`m.cons={fr,ar,hd,co,h2?}` on an ordinary minion record, `buildCons`, `consApply`): frame = role, HP
  factor and tier (its gate); arms = attack factor and damage type (`consType` in minionType: a striker's arms hit with
  their gate's type); head = the kind's kit as a full echo (`consEchoK`/`consKits` in echoV/echoKits) **and** the role's
  trait (Stalwart, Vicious, Warded, Wrathful, Hexing; every kind has a kit, so "a trait when it has no kit" never fired);
  core (`coreOpts`, `consK` in extraMul) = a spare boss heart (+15% HP and attack, +25% a secret master's; the spec's
  "signature at 30%" is left for later), a Soul core (40 dust: a Soul once a room on a kill, `consKill`), a Rift core
  (3 shards: +10% attack, +25% in the Rift). Parts below the frame's gate cost 5% a step of the four-part average.
  Cost 1,000 gold and 10 dust a tier, and a watch (`consWhy` says what is missing). A construct levels and evolves;
  `canFuse`, the Grave Market, wagers, the rival's thefts, the ally trade, the Hunger, commissions and the bone
  merchant's swap all pass it by.
- **Breaking** (`consBreak`, in the shatter roll, Ironman's loss and the fever pit): to `S.broken` with `m.broken=day`;
  `repairCons` after a day for 300 gold and 5 dust a tier. `replacePart` (500 gold a tier, the old part lost; a core is
  paid again). `consFix` cleans the save (only fields present).
- **UI**: the bench in the Workshop's card on the Town tab (`wsHTML`): sew and cut buttons, the slots, the part or core
  picker, the preview card (the minion it would be, HP, attack, type, head, core, cost and why not), the constructs with
  Repair and Replace a part; the Codex's Constructs section on the Kits page; a village shape; the tip. ~90 Turkish strings.
- **Titles**: First Stitch, Patchwork Army, Heart of a King, Every Gate in One (Eternal Machine comes with PR B).
- **Bots**: see 04-balance; `"off":["constructs"]`.
- **Tests**: `tests/groups/98-workshop.js` (8 tests); 1007 in all.
