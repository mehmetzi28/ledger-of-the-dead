# P2 rounds: R6 to R12

Specs for the second tier. Each is one or two PRs; each names its rules, numbers to start from, save fields, tests and
the bot's policy. Numbers are starting points for the bot to tune, never final.

---

## R6. Expeditions: raids rework and Commanders in battle

**Closes** G17, G8. **Needs** R5 (War Room). **Size** L.

### Problem
A raid today is one roll: send a squad to a cleared gate, get gold and items or lose minions. The roll ignores who is in
the squad beyond strength, and the Commander trait does nothing in battle.

### Expeditions
- **Targets**: any cleared gate at any cleared difficulty, a cursed gate (curse rewards, double risk), a **Tower band**
  (10 floors below your best: Tower trophies), a **hunt** (one foe kind: 3x its trophies, a chance at its heart if a
  boss), the **rival's stash** (with R7: recover stolen bodies), and the **abbey** (after R3, 2-night minimum).
- **Length**: 1-3 nights (War Room *Map Table* for 3). A squad away cannot fight with you; its slots stay empty.
- **Dawn reports**: each night resolves as a stage of three steps (approach, fight, haul). Each report offers a choice:
  *Press on* (next night, +50% haul, +risk), *Come home* (bank now), *Risky path* (skip a step, +100% haul on success,
  lose one minion on failure). A squad that loses its last step comes home with half the haul.
- **The odds**: base chance from squad strength vs target (as today), then modifiers:
  - Roles: each role covers a step (vanguard: approach, striker: fight, reaper: fight, mender: haul). A missing role
    costs -10% on its step.
  - Damage types (R1): each squad member whose type the target's profile is weak to: +3%; resisted: -3%.
  - Kits (R1): the War Room intel names the target's kits; a squad with the stated answer role +5% per answered kit.
  - War banners (R4): +10% or +1 member.
- **Losses**: a lost step costs one minion (the weakest, unless *Risky path*); a Commander leading the squad saves the
  first loss once per expedition.
- **Pay target**: an expedition night is worth about one watch spent fighting at the same gate (measure gold+XP+loot per
  watch). Raids won stays 75-80% in `full` with the bot taking the safe choices; probes for "always press on".

### Commanders in battle
A minion with the Commander trait grants **Rally** once per room: a free order (no action) that gives the army +20%
damage this turn, or cleanses one condition from every minion. If two Commanders stand, only one Rally. Elder Commanders
also add +1 to the first order's effect each fight. Rally shows as a button beside the commands.

### Save, tests, bot
- `S.exp = [{id, target, nights, night, squad:[uid], log:[...], pick}]` replaces `S.raids` (loader converts a pending raid
  to a 1-night expedition).
- Tests `95-expeditions` (targets, choices, role and type modifiers, Commander saves, conversion) and `96-rally`.
- Bot: safe choices by default; `"exp":"greedy"` probe; Rally on the boss room's first turn. `"off":["rally"]`.

---

## R7. The rival's war: an arc with an ending

**Closes** G19. **Needs** R2 (rival kit). **Size** L.

### Arc (five chapters, each opened by days and wins)
| Chapter | Opens | What happens |
|---|---|---|
| 1. Margins | rival met (today) | thefts and challenges as now |
| 2. The open hand | 3 challenges won or lost | the rival offers a **wager** before each challenge: stake a body, win one of theirs |
| 3. Fire at the walls | chapter 2 + 10 days | the rival leads a **siege** (their army as wave 3, their kit from R2) |
| 4. Their own gate | the rival siege resolved | **the Rival's Ledger**: a gate of 5 rooms built from the bodies they stole from you (your old minions, their traits, as foes) and their followers; opens for 7 days |
| 5. The reckoning | their gate cleared | the final duel: their whole book (every move from every role they hold), on a stage that shows their tally of thefts |

### Outcomes
- **Win the reckoning, end them**: their ledger becomes three **rival uniques** (a ring, an off-hand, a cloak; powers tied
  to theft: "+1 body per room from foes you have stolen from"...), all stolen bodies return to the Reserve, title
  *Last Word*.
- **Win and spare them**: they return in NG+ as an **uneasy ally**: a weekly trade (one body for one body, their pick is
  shown), and they fight one siege wave on your side. Title *Mercy in Red Ink*.
- **Lose the reckoning**: chapter 5 repeats after 7 days; the rival steals one more body; never a game over.

### Numbers and save
- Rival strength carries 30% into NG+ (`RIVAL_NGP` .3) if spared; resets if ended.
- Wager: stake shown by tier; the rival stakes a body of the same tier or one higher.
- `S.rival.arc = {ch, wager, gate:{open, until, rooms}, end}`.
- Targets: duel won 65-75% (`full`); the arc completes in a 100-day `full` game (measure `rivalEndDay`, target 70-95).
- Tests `97-rival-arc` (chapters open in order, their gate builds from stolen bodies, both outcomes, NG+ ally trade).
- Story: 6 passages (act V and VI if R3 shipped).

---

## R8. The pantheon: faith rework, gods and omens

**Closes** G18, G20. **Needs** R5 (Temple, dread). **Size** L.

### Gods
Faith today is a binary oath (Honored or Dishonored of the Old Gods). It becomes **four named Old Gods** and a profane
path. Each god owns one damage type, two omens and a playstyle.

| God | Domain | Type | Omens it moves | Boons (devotion ranks 1-5) | Vow (what breaks devotion) |
|---|---|---|---|---|---|
| **Morrow, the Last Light** | mercy, endings | fire | Pale Tide, Ashfall | +heal received; foes slain by fire burn their neighbors; rank 5: once a run, a minion that falls rises at 30% | raising more than 10 bodies in one run |
| **Vesh, the Cold Mother** | sleep, preservation | frost | Soul Storm, Black Eclipse (wards it) | Grave Chill cheaper; Preserved bodies +raise; rank 5: freezing a boss halts its phase change one turn | letting a body rot (Rotten condition) |
| **Ulm of the Furrow** | harvest, rot | rot | Bone Harvest, Iron Rain | more trophies; rot spreads on kills; rank 5: Corpse Explosion leaves a rot pool | selling trophies (you must use them) |
| **The Hollow Choir** | voices, the dead | shadow | Black Eclipse, Blood Moon | Siphon grows per minion; Silence lasts shorter on you; rank 5: Memorial minions sing (+1% army damage each, cap 15%) | losing a minion with a name (any marked or Elder) |
| **Profane (no god)** | defiance | physical | any (random) | the Dishonored path today, kept; plus *Spite*: each broken vow you never made gives +1% damage (cap 10%) | none; the Inquisition hates you (+10 dread) |

- **Devotion grows by deeds**, not days: actions that fit the god (fire kills for Morrow, Preserved bodies for Vesh,
  trophies used for Ulm, Memorial lines for the Choir) give devotion points; breaking the vow costs a rank.
- **Omen forecast**: a sworn necromancer sees tomorrow's omen at dusk. Spending 1 devotion rank (Temple L5: once a week
  free) **calls** one of the god's omens for tomorrow or **wards** off a forecast omen.
- **Shrines in gates**: the existing Old Gods shrine event becomes one per god; meeting your god's shrine gives devotion,
  another god's offers a conversion (lose half devotion, keep the rest).
- **Dread hooks**: Morrow lowers dread drift by 1 a day; the Choir raises the Inquisition's pay; Profane +10 dread base.
- **New omens** (3, to give each god two): *Long Night* (Vesh: one extra watch, foes +10% HP), *Rot Bloom* (Ulm: every
  foe starts Blighted, every body rots unless frozen), *Choir Night* (Choir: Silence on everyone at room start, minions
  deal +15%).
- Targets: each god within 3 points of the others on gates; omen calls used by the bot on boss days. `"off":["gods"]`.
- Save: `S.faith = {god, dev, rank, vow:{...}}` (loader: Honored -> Morrow rank by old devotion; Dishonored -> Profane).
- Tests `98-pantheon`.

---

## R9. Rift sigils and Riftborn gear

**Closes** G22, B4. **Needs** R2. **Size** L.

- **Sigils**: before a dive pick up to three from eight. Each makes the dive harder and raises the depth reward
  multiplier: *Iron Sky* (foes +25% armor, +20%), *Hungry Dark* (no healing between depths, +30%), *Many Hands* (an extra
  foe per depth, +25%), *Mirror* (foes copy your last skill once per depth, +25%), *Short Breath* (mana regen -30%,
  +20%), *Old Wounds* (minions start at 80% HP, +15%), *Named* (every fifth depth's guardian has a second phase, +30%),
  *Loud Grave* (bodies cannot be raised in the Rift, +20%).
- **Guardians** every 5 depths: named, with a kit (R2's engine) from a pool of six Rift guardians: the Folded Knight,
  Mother of Gates, the Echo, Brass Saint, the Tear Itself, the Counting Dead.
- **Riftborn items**: drop only in the Rift (from depth 10). Each has a **rift power** (fixed, scaling with your best
  depth): +x% damage per depth reached this dive; your first skill each depth is free; minions keep 50% of a buff between
  depths. Rift power works at 30% outside the Rift, so it matters most where it was found.
- **Weekly seeded dive** beside the Trial: same seed for the week, sigils fixed, one try a day, best depth recorded.
- **Rift events** (4): a fold that skips 2 depths (risk), a lost minion of yours from another cycle (raise it), a
  fragment of the other half of the Ledger (a lore page), a tear-shrine (trade max HP for depth multiplier).
- **Probe**: a dedicated depth probe (`"rift":true`, 40 bots dive at day 60 with fixed gear) replaces the 100-day
  average. Target: each sigil changes depth by a predictable amount (logged per sigil); Riftborn wanted by the bot.
- Save: `S.rift.sigils`, items with `rb:true`; tests `99-rift`.

---

## R10. Ascension: New Game+ rework

**Closes** G21. **Needs** R3. **Size** L.

- **Ascension levels** replace flat +30% per cycle: each cycle you pick the next level's **rule** from three offered
  (from a list of ~15), and foes grow +15% instead of +30%. Rules: *Two Bosses* (each gate's boss room has its R2 phase
  two from the start), *Fewer Souls* (Soul max -1), *Elite Doors* (one in three doors elite), *Hungry Ledger* (raising
  costs 20% more mana), *Short Year* (100 days become 80, rewards +15%), *Kits Plus* (foes get a second kit), *No Retreat*
  (no Retry), *Cold Town* (dread starts at 60), *Living Rival* (the rival begins at chapter 2), and more.
- **Valley rewrites**: each cycle one gate changes: a boss variant (its Ledger form from R3), two foe kinds swapped for
  variants (new names, new kits), a new curse available only that cycle.
- **Pacts become rules**: the seven pacts stay, and each also changes a rule instead of only numbers (Thick Hides: foes
  with Bulwark stance gain it twice as often...).
- **Carry choices**: at cycle start pick one: a trait to keep on a minion, a mark, a building at level 2, or a Riftborn
  item.
- **Endings tie-in**: Quiet Valley and Keeper's Cycle from R3 are two ascension flavors; Keep writing grants an extra rule
  pick (a harder cycle for more inscriptions).
- Targets: cycles 1-3 play differently (bot logs show different deaths and choices), each on the gate curve.
- Save: `S.asc = {lvl, rules:[...], rewrite:{gate, boss, foes, curse}}`; tests `100-ascension`.

---

## R11. Hero builds 2.0

**Closes** G25, B2. **Size** L.

- **Fifth skills**: Frost gets *Hoarfrost Lance* (active, lv 24: frost damage that freezes the target and spreads 1 turn
  of Chill to its neighbors); Rot gets *Plague Bearer* (passive, lv 24: your rot effects tick 15% harder per rot effect on
  the target, cap 45%). Paths become 5/5/5/5.
- **Signature actives** at level 40 (one per path, chosen with the capstone): Bone *Ossuary Gate* (summon a Bone Wall for
  every minion for 2 turns), Blood *Exsanguinate* (drain 10% HP from every foe, heal the army that much), Frost *White
  Silence* (freeze every foe 1 turn, bosses lose their next move instead), Rot *Bloom of Ruin* (every Blighted foe bursts
  for rot damage).
- **Skill runes**: dropped by wardens and secret masters, slotted into an active (one each), changing it. 14 runes, e.g.
  Bone Spear *Splinter* (hits two), *Marrow* (refunds half mana on a kill); Grave Chill *Avalanche* (hits the row);
  Reap *Second Harvest* (a kill resets the cooldown once); Corpse Explosion *Chain* (spreads to a second body).
- **Two more ultimates**: *Requiem* (every minion acts twice this turn) and *The Long Name* (for 3 turns, every foe that
  falls rises for you as a thrall).
- **Constitution's endless role**: Con grants *Endurance*: 1% damage per 10 Con for every turn past the 5th in a fight
  (Tower and Rift fights are long; gates are not). Target: Con builds within 5 Tower floors and 8 Rift depths.
- **Respec** lives in the Library (R5); if R5 has not shipped, a market respec at 2x cost.
- Targets: path builds within ~4 points on gates; signature actives within 2 points of each other.
- Save: `S.player.runes = {skillId: runeId}`; tests `101-builds`.

---

## R12. Army roles 2.0: charms, minion actives, a fifth role

**Closes** G7, G8. **Needs** R1. **Size** XL.

- **Charms**: every minion gets one charm slot. Charms are crafted from trophies (6 of one kind) and carry one line
  themed on that kind's kit: a Shield-bearer charm (the minion guards the weakest ally once a fight), an Ambusher charm
  (first hit at the back row), a Bomber charm (bursts on death for 30% of its max HP as its type)... 16 charms, one per R1
  kit. A charm moves freely between minions in town.
- **Gear-bearers**: a minion carrying a unique (the existing gear-bearer system) gains a **minion version** of the
  unique's power at 40%.
- **Elder actives**: Elder minions gain one active given by their role, used through an order (costs the hero's action,
  not mana): vanguard *Hold the Line* (taunt + 30% less damage 1 turn), striker *Execute Order* (a hit at +60%),
  mender *Last Rites* (heal the army 15%), reaper *Collect* (kill a foe under 15%), hexer *Doom* (below).
- **The Hexer**, a fifth role: back row, low HP, its hits apply conditions (hex, chill, blight, bleed by trait). Raised
  from new hexer foes (one per gate from R1's roster added: Bog Witch, Crypt Augur, Ash Seer, Choir Cantor, Iron Oracle,
  Court Astrologer) and from mender corpses with a hexer condition. Formation cap: one hexer per two back-row slots.
- **Role specializations at Elder**: pick one of two per role (vanguard: Bulwark or Avenger; striker: Duelist or
  Cleaver; mender: Saint or Plague-doctor; reaper: Harvester or Headsman; hexer: Augur or Malefic).
- **Memorial kill counts**: each minion keeps its kill count; headstones show it; a minion with 100 kills earns a name
  line in the Ledger (+1% to its role's stats for the army, cap 10).
- Targets: the bot's army uses every role; charms and actives each worth ~1 point (`"off":["charms","actives"]`).
- Save: `m.charm`, `m.spec`, `m.kills`; tests `102-charms`, `103-hexer`.
- PR split: A charms, gear-bearer powers, kill counts; B Elder actives, specs, the Hexer.
