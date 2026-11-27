# R16. Titles and collection 2.0

**Priority** P3. **Closes** G26. **Size** L. **Needs** nothing; every earlier round adds titles that this one organizes.
**Pillars served**: 7 (a long game), 5 (the Ledger is a story: a collection is a record).

## 1. The problem

148 titles (`TITLES`), earned once and kept through New Game+. One is worn for a small bonus by rarity; every 10 add 1%
kill gold (max 10%). Past ~60 titles the collection pays nothing new, Epic+ titles are hidden until earned with no hints,
and nothing else is collected for its own sake.

## 2. Inscribed titles

- Up to **three earned titles inscribed** beside the worn one. Slots unlock at 40, 80 and 120 titles.
- An inscribed title gives a tiny perk from its **family** (section 3), not its rarity bonus:

| Family | Inscribed perk |
|---|---|
| Gates | +1% damage in that title's gate |
| Army | +1% army max HP |
| Raising | +0.5% raise chance |
| Hero | +1% Strike and Siphon |
| Tower and Rift | +1% damage in endless modes |
| Town | -2% building and upkeep costs |
| Faith | +5% devotion gain |
| Rival and sieges | +2% damage in duels and sieges |
| Story | +2% XP from bosses |
| Secrets | +1% gear drop chance |

Perks of the same family do not stack.

## 3. Families and progress

Titles group into the ten families above. The Titles page shows each family as a row with a progress bar; finishing a
family (all its titles) pays its **family cosmetic** and a family seal on the hero's card.

## 4. Cosmetics

All drawn by the existing renderer and palette system; no outside art.

| Kind | Count | Examples | Where it shows |
|---|---|---|---|
| Robes | 8 | Gravecloth, Ashen, Drowned, Choir-white, Iron, Sovereign's, Abbey brown, Rival red | hero sprite palette and trim |
| Army banners | 6 | Bone, Rat, Ember, Choir, Orchard, Ash | a banner behind the army on the stage |
| Stage backdrops | 6 | night variants of each gate | battle background tint and props |
| Staff heads | 4 | skull, lantern, quill, crown | hero sprite |
| Ledger covers | 4 | leather, iron, vellum, skin | the Ledger UI frame |

Each cosmetic is unlocked by a family, a collection milestone (section 5), or a specific deed (listed in the Codex).

## 5. Collection milestones

| Collection | Milestones | Rewards |
|---|---|---|
| Bestiary Ledgered | 10 / 25 / 50 kinds | a banner; Codex filter by weakness; +1 door sight in Ledgered gates |
| Uniques found | 6 / 12 / 18 | a robe; Awakening -10%; a staff head |
| Sets completed (all 7 pieces held) | 2 / 4 / 6 | a backdrop; +1 bag row; a cover |
| Trophy kinds held | 30 / 60 / all | a robe; one free brew a week (R4); a banner |
| Pages | 10 / 20 / all (with R3) | a cover; a passage; a backdrop |
| Memorial | 50 / 100 / 200 names | a robe; headstones -10%; a cover |

Rule perks stay small and convenience-flavored so collection never becomes required power.

## 6. Hidden titles

After 100 titles, each hidden title shows a one-line hint in the Codex ("Something in the Rift remembers you twice").

## 7. Save

`S.insc = [titleIds]`, `S.cos = {robe, banner, stage, staff, cover, owned:[...]}`, `S.coll = {milestone flags}`. Kept
through New Game+ like titles.

## 8. UI, Turkish, Codex

The Titles page becomes **Collection**: tabs for Titles (by family), Cosmetics (a wardrobe with previews), Milestones.
Inscribed titles on the hero card. ~150 strings. Codex: Inscriptions, Families, Cosmetics, Milestones.

## 9. Tests

`108-collection`: slots unlock at their counts; family perks apply and do not stack; milestones pay once; cosmetics
render without errors; hints appear after 100; NG+ keeps all.

## 10. Bot policy

Inscribe the three titles with the largest measured perk for its build; ignore cosmetics. The worth of inscriptions
should be under a point (`"off":["insc"]`): collection is flavor, not power.

## 11. Risks

- **Inscriptions become mandatory power**: perks are ~1% and capped by family.
- **Sprite palette work is larger than it looks**: robes and staffs reuse the sprite recolor path; backdrops tint the
  existing stage.

## As built (PR A: families, inscriptions, milestones, hints)

- **Code**: `src/game-collection.js` (new, after game-playlog.js).
- **Families** (`famOf`): ten families from an explicit id list (`FAM_LIST`). A title not in the list falls back on its
  group, so new titles always have a family. Gate titles know their gate (`titleGate`).
- **Inscriptions** (`S.insc`, `titleInscribe`): slots at 40, 80 and 120 titles, earned titles only, one per family, in town.
  Erasing frees the slot. Perks: Gates +1% damage in that gate (every gate for titles of no single gate, through `hurtFoe`),
  Army +1% max HP (`extraMul`), Raising +0.5 raise chance, Hero +1% Strike and Soul Siphon, Tower and Rift +1% damage there,
  Town -2% building costs and upkeep, Faith +5% devotion (`deed`), Rival and sieges +2% damage, Story +2% boss XP, Secrets
  +1% gear drop chance. The hero card lists the inscribed titles.
- **Milestones** (`S.coll`, `collCheck` from `checkTitles`; steps are kept for good):
  - Bestiary Ledgered 10/25/50. The middle step gives +1 door sight in every gate (capped at 2). The doc's Codex weakness
    filter was dropped, because Ledgered kinds already give full sight.
  - Uniques ever held 6/12/18 (`S.coll.u`): Awakening -10% gold.
  - Sets with all 7 pieces held at once 2/4/6: +1 bag row.
  - Trophy kinds held at once 30/60/all: one free brew a week.
  - Pages 10/20/all: hidden title hints from 50 titles. This replaces the doc's "a passage".
  - Memorial 50/100/200: headstones -10%.
  - The first and last steps each give a named cosmetic (PR B).
- **Hidden titles**: from 100 titles (50 with the Pages step), a hidden title's requirement shows with most words cut to their
  first letter (`titleHint`).
- **UI**: the Titles tab is now **Collection**, with two views:
  - Titles grouped by family, with progress bars, each family's perk, and Inscribe and Erase buttons.
  - Milestones.
  - The Codex has a new Collection page.
- **Bot**: the bot now earns titles and milestones at dawn (`checkTitles`; until now only the UI ran it), and still wears no
  title. It inscribes Army, Tower and Rift, Hero, Rival, then a gate-free Gates title. `"off":["insc"]` turns this off.
- **Measured** (market bot, seed 7700, 40 bots):
  - With inscriptions: 95% clears, Tower 83, Rift 22.4. Without (`off insc`): 94%, Tower 82.6, Rift 20.
  - Inscriptions are worth under half a Tower floor. The Rift gain (~2 depths) sits within the Rift's usual spread.
  - Bots hold 82-90 titles by day 100, so two slots are open.
  - Full bot (seed 9100): 94% clears, Tower 86.5, sieges held 92%.
- **Fixed on the way**: the fuzzer's new paths turned up three older bugs.
  - A siege wall chosen in town the day before was lost on reload (R14).
  - The bone merchant's trade left the traded minion's partner bonded to nobody (R13).
  - The thrall invariants did not allow the Long Name's thralls or the Ossuary's two-a-wave on the Graveyard.
  - A title worn automatically now updates the army's stats.
- **Tests**: `tests/groups/98-collection.js` (6 tests).

### PR B: cosmetics and seals
- **Code**: the second half of `src/game-collection.js`; drawing in `ui-icons.js` (`heroArt`, `heroRobe`, `STAFF_HEAD`),
  `scenes.js` (`scNight`) and `ui-panels.js` (`wardrobeHTML`, `bannerSVG`, `sealsHTML`).
- **27 looks** (`COS`) in five kinds: 8 robes (the hero's colour), 3 staff heads (lantern, quill, crown in place of the
  skull), 6 army banners (painted behind your side in battle), 6 night backdrops (one per gate: that gate's battles are
  fought under a moon, with a deep blue grade and mist) and 4 Ledger covers (the frame of the Ledger tab's pages).
- **Sources**: each look comes from one of three places.
  - A finished title family. All ten families give one.
  - The first or last step of a milestone. All twelve such steps give one, and each milestone's reward line now names it.
  - A title: the four Nightmare gate titles and the Choir's.
  The doc's Codex-listed deeds became these titles.
- **Saving**: owning a look is read from its source, which is kept for good. Only the worn looks are saved (`S.cos`), and
  New Game+ keeps them. A worn look that is no longer owned is not shown.
- **Seals**: a finished family puts its seal on the hero card.
- **UI**: the Collection tab gets a third view, Cosmetics. It is a wardrobe with a preview of each look and Wear or Take off
  buttons, and it can only be changed in town. The Codex Collection page lists every look and its source.
- **Measured**: no rule changed. The market bot (seed 7700) and full bot (seed 9100) numbers match PR A exactly: 95% and 94%
  clears, Tower 83 and 86.5. Fuzz: 12 of 12 seeds clean.
- **Tests**: `tests/groups/98-cosmetics.js` (4 tests).
