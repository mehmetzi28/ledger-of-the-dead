# R21. The phylactery: corruption and the hero's transformation

**Priority** P4 (new system). **Size** L. **Needs** nothing; R8 (gods) and R11 (builds) interact.
**Pillars served**: 4 (choices with a cost), 5 (the Ledger changes the one who writes in it), 1 (the hero's form serves
the army).

## 1. Why

The hero is a necromancer from level 1 to 100 in the same body. The lore says the Ledger changes its keeper (the Pale
Sovereign wrote his own name; Oswin's hand shook). There is no system where power has a personal cost, and no late-game
change to how the hero plays beyond numbers.

## 2. Corruption

A hero meter from 0 to 100. It rises with dark power used and falls with restraint.

| Raises corruption | Points |
|---|---|
| Raising a boss | +3 |
| Corpse Explosion, Reap, any execute | +0.2 per use |
| Drinking from the defiled altar, desecrating shrines | +5 |
| An Eternal reached in your army | +5 |
| Raiding a village (R20) | +10 |
| A day spent at Terror dread (R5) | +1 |

| Lowers corruption | Points |
|---|---|
| A day without raising | -2 |
| Burying a body at a battlefield (R19/R20) | -1 per body |
| Honoring the Memorial | -2 |
| Morrow's or the Choir's boons at rank 5 (R8) | -1 a day |

Corruption is shown on the hero card as an ink stain that grows.

## 3. The phylactery

At level 30 and corruption 25+, the Ledger offers to **bind your soul into an object**: the phylactery (choose a vessel:
the Ledger's clasp, a bone ring, a skull lantern; cosmetic). Once bound:

- **Death's Door**: once per day, a killing blow on the hero leaves them at 1 HP instead (the phylactery cracks; it mends
  at dawn).
- **Corruption floor**: corruption can no longer fall below 25.
- The **transformations** (section 4) open.

The phylactery can be **shattered** (Temple, 20,000 gold): corruption resets to 0, forms are lost, and the title
*Mortal Again*.

## 4. Forms

At corruption 50 the hero may take one **form**, chosen once per cycle (and changed only by shattering). Each form
replaces part of the hero's kit and changes their look (R17).

| Form | Needs | Gains | Costs |
|---|---|---|---|
| **Lich** | Int highest stat | Soul Siphon becomes *Soul Rend* (hits two foes); +1 Soul max; frost and shadow +15% | healing received -30%; Bone Ward -20% |
| **Blood Lord** | Str highest | Strike heals 15% of damage; minions' Bloodfiend effects double | sunlight: the first room of each day -10% stats |
| **Bone Colossus** | Con highest | the hero stands in the front row: +40% HP, Strike hits the row, the Soul Tether counts the hero | can't use the back-row bonus; Siphon -25% |
| **Choir Saint** | Will highest | every minion's mark empowers one step; orders cost nothing twice per room | the hero's own damage -20% |
| **Plague Herald** | Rot path deepest | all your rot effects spread on death; Corpse Explosion leaves plague | menders heal 15% less |

At corruption 75 the form's **second stage** unlocks (one more gain, e.g. Lich *Phylactery Ward*: the first lethal hit
each room on any minion is absorbed by the hero's mana), and at 100 the **apotheosis** (a once-per-run form ultimate:
Lich *Winter of the Book*, Blood Lord *Red Feast*, Colossus *Earthshaker*, Saint *Hymn of All*, Herald *Pandemic*).

## 5. Corruption's other edge

High corruption also brings trouble, so the meter is a tension, not a ladder:

| Corruption | Effect |
|---|---|
| 50+ | the living notice: sieges +1 foe; village standing (R20) -1 a day |
| 75+ | the Ledger whispers: each dawn, 10% chance of a *Hunger* event (sacrifice a Reserve minion for +5% damage this day, or refuse: -5% HP this day) |
| 100 | the Inquisition's Grand Inquisitor (R14) names you; R3's Hunger fight gains a fourth echo (yourself) |

## 6. Connections

Gods (Morrow and the Choir pull corruption down; Profane and Ulm do not), villages and dread (they fear a corrupted
keeper), the endings (R3's *Close the book* with corruption under 25 adds *The Clean Hand* epilogue line; above 75, *The
Last Keeper* becomes *The Ledger's Own*), hero builds (forms by highest stat), presentation (forms change the sprite).

## 7. Numbers

- Default `full` bot: corruption ~40-60 at day 100; binds the phylactery around day 45-60.
- Each form within 3 points of the others on gates (probe per form with its matching build); within 5 Tower floors.
- Death's Door should save ~1 run in 10 for a bot near its Recommended level.

## 8. Save

`S.player.corr`, `S.player.phyl = {vessel, cracked}`, `S.player.form = {k, stage}`. NG+ keeps the phylactery bound (the
soul stays bound) but resets the form choice and corruption to the floor.

## 9. UI, Turkish, Codex, titles

The ink stain on the hero card; the binding page; form cards with gains and costs; form looks (R17 ties). ~150 strings.
Codex: Corruption, The phylactery, Forms. Titles (7): one per form, *Mortal Again*, *Apotheosis* (use a form ultimate).

## 10. Tests

`112-phylactery`: corruption gains and losses; binding conditions; Death's Door once a day; forms need their stat; form
gains and costs; stages at 75 and 100; high-corruption effects; shattering resets.

## 11. Bot policy

Bind at the first chance; take the form of its build; keep corruption under 90. `"off":["phyl"]`.

## 12. Risks

- **Death's Door trivializes danger**: once a day, and the Tether already exists; measure deaths prevented.
- **The Colossus breaks row rules**: it is its own test group; the Tether counts the hero as a front-row body.

## As built

### PR A: corruption, the phylactery, the other edge
- **Corruption** (`src/game-phyl.js`, `S.player.corr`, `corrAdd`): 0-100 in five bands (Clean, Stained 25, Marked 50,
  Hungering 75, Named 100); a band crossed is announced. Hooks: `corrRaised` in `tryRaise` (+3 for a boss; every raise
  marks the day as one with raising, `S.player.rday`), `corrSkill` in `useSkill` and `corrExec` on the Execute order
  (+0.2 a use, **at most +0.5 a day**, `CORR_DARK_DAY`: uncapped, the bots reached 100 by day 100), `corrAltar` on the
  defiled altar and a desecrated shrine (+5), `corrEternal` (+5), `corrRaid` in `raidWon` (+10), and at dawn
  (`corrDawn` in `closeDay0`): Terror +1, a day without raising -2, Morrow or the Choir at rank 5 -1. A buried
  battlefield is -1 a body (3, the field's average), the Memorial honoured -2.
- **The phylactery** (`phylCan`/`phylBind`): level 30 and corruption 25, three vessels (cosmetic), chosen on the Status
  panel. **Death's Door** (`phylDoor`, last in `playerFalls`, after gear revives, Grace and the Second Draft): 1 HP,
  once a day, mended at dawn. The floor of 25. **Shattering** (`phylShatter`, the Temple's card, two presses): 20,000
  gold, corruption 0, the vessel, the form (PR B) and the name gone; the title *Mortal Again*. New Game+ keeps the
  vessel and sets corruption to the floor (`phylNgp`).
- **The other edge**: at 50 `phylWave` (in `townSiegeWave`) adds one foe to each wave (a copy of a striker) and
  `corrDawn` takes 1 standing a day from every village; at 75 a 10% dawn **Hunger** (`S.player.hunP`, answered on the
  Status panel with `hungerAnswer`: the weakest Reserve minion for +5% damage that day (in `dmgMul`), or refuse for
  -5% max HP that day (in `pMax`); it lapses at the next dawn, and a gate run started with it open refuses it); at 100
  `S.player.named` for good (until a shattering): siege captains +15% HP and attack, and `phylEcho` (in
  `callEchoes`) has the Hunger read "Echo of the Gravewalker" once as a fourth echo.
- **UI**: the ink stain (an SVG blot that grows, with drops at 25/50/75) and the corruption line on the Status panel,
  the effects line, the Hunger and binding cards; the Codex page *The phylactery*; the tip; three passages (The
  vessel, Named, Mortal again). ~90 Turkish strings.
- **Bots**: bind at the first chance, feed the Hunger, honour the Memorial at 80+, skip boss raises at 87+;
  `"off":["phyl"]`. Measured: see 04-balance (corruption 64 at day 100, 31/40 bound around day 68, sieges 91%).
- **Tests**: `tests/groups/98-phylactery.js` (10 tests); 990 in all.

### PR B: the forms, stages, apotheosis, titles, endings
- **Forms** (`FORMS`, `S.player.form={k,st}`, `takeForm`, offered on the Status panel): bound and at corruption 50, once a
  cycle; the need is checked against `A()` (ties allowed) or the skill ranks on each path (`pathDepth`). Gains and
  costs as the spec, with these readings:
  - **Lich**: Soul Rend is Soul Siphon's same blow on a second foe; +1 Soul is `soulCap`; frost and shadow +15% is
    `formDmgK` on your own blows only (`HITTER`).
  - **Blood Lord**: "-10% stats" in sunlight is -10% to your damage in the first room of each day (`P.sunD`), in gates,
    the Tower and sieges alike.
  - **Bone Colossus**: `rowOf0` puts the hero in the front row (foes' melee reaches the hero; no Tether change was
    needed, since the Tether still guards the hero while a minion stands in front); Strike hits the rest of the
    target's row for 50%.
  - **Choir Saint**: `markLv` counts every mark a minion has one step higher; "orders cost nothing twice" became each
    order may be given a second time, twice a room (`saintOrder`, `r.saintN`); orders were already free.
  - **Plague Herald**: a fallen foe's poison and blight pass to the next foe; Corpse Explosion leaves poison of 8% of
    your Siphon on every foe; menders heal 15% less (`healK`).
- **Second stages** at 75 and **apotheosis** at 100, both sticky (`formStage` on every rise). The apotheosis is act
  `apo`, once a run (`r.apoU`), its button beside the ultimate.
- **Looks**: the hero's sprite is tinted by form (`formTint`, fx.js), the Status panel shows the form card.
- **Titles** (6): The Lich, The Blood Lord, The Bone Colossus, The Choir Saint, The Plague Herald (take the form),
  Apotheosis (use one). With Mortal Again from PR A, the spec's seven.
- **Endings**: `phylEnding` adds The Clean Hand (Close the book under 25) or The Ledger's Own (above 75) to the
  epilogue's variant paragraph; the Last Keeper title keeps its name.
- **Bots**: take the form the build carries (`opts.form` forces one), use the apotheosis on a boss, three foes or under
  35% HP; `"off":["forms"]`. Measured: see 04-balance.
- **Tests**: `tests/groups/98-forms.js` (9 tests, the Colossus in its own); 999 in all.
