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
