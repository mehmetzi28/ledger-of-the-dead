# R9. Rift sigils and Riftborn gear

**Priority** P2. **Closes** G22, B4. **Size** L. **Needs** R2 (guardian kits); R1 types make the sigils richer.
**Pillars served**: 4 (choices with a cost), 7 (a long game), 3 (read the fight).

## 1. The problem

The Rift (`RIFT_*`, from level 40 after the Throne): depth n is five rooms of a random gate's dead at the Throne's
strength, at your level + n/3, x(1 + 0.55(n-1)) since PR #5. A new deepest depth leaves a legendary. It is a number that
goes up: no choices before or during a dive, no rewards of its own, no guardians. The `full` bot's depth (~12) says only
that it spends its days elsewhere (B4).

## 2. Sigils

Before a dive, pick up to three sigils. Each makes the dive harder and adds to the **reward multiplier** (gold, XP, drop
tier chance and Riftborn chance).

| Sigil | Rule | Reward |
|---|---|---|
| **Iron Sky** | foes +25% armor | +20% |
| **Hungry Dark** | no healing between depths (rooms within a depth heal as now) | +30% |
| **Many Hands** | +1 foe per room | +25% |
| **Mirror** | the first foe each depth copies your last skill once | +25% |
| **Short Breath** | mana regeneration -30% | +20% |
| **Old Wounds** | minions start each depth at 80% HP | +15% |
| **Named** | every guardian has a second phase | +30% |
| **Loud Grave** | no raising in the Rift | +20% |
| **Typed Dark** (R1) | foes resist your top damage type | +25% |
| **Thin Veil** | foes crit 10% more; so do you | +10% |

Sigils unlock one at a time: the first three at depth 5, one more per 5 depths of best depth. A sigil set can be saved
as a preset.

## 3. Guardians

Every fifth depth ends in a **guardian** instead of the fifth room's ordinary foes. Six guardians in rotation, each with an
R2 kit (move set, a phase two, a hazard):

| Guardian | Moves | Phase two | Hazard |
|---|---|---|---|
| **The Folded Knight** | Fold (swaps your front and back rows) · Edge of Gates (physical, telegraphed, the whole back row) | *Second Fold*: folds every second turn | none |
| **Mother of Gates** | Open Door (summons two foes of a random gate) · Close Door (banishes a minion for 2 turns) | doors open each turn | gate foes keep their gate's resists |
| **The Echo** | Repeat (copies the last action any unit took) · Delay (your next skill lands a turn late) | repeats twice | your skills echo at 20% for foes too |
| **Brass Saint** | Litany (heals 6% per foe alive) · Brass Bell (stuns the front row a turn) | immune to the type that hit it last | ringing: every third turn, Silence on all |
| **The Tear Itself** | Widen (+5% damage taken for both sides, stacking) · Swallow (eats a downed body: no raise) | Widen every turn | the Rift shrinks: lose 2% max HP a turn |
| **The Counting Dead** | Count (marks a minion; at 3 marks it falls) · Tally (heals per mark) | counts two a turn | numbers on the stage are hidden |

Guardian kills give a **Rift Shard** (new currency, section 5) and a Riftborn item the first time each guardian falls at
a new depth band.

## 4. Riftborn items

A new item tag, dropped only in the Rift from depth 10 (5% per room, guardians 100%), and with sigils more.

- Legendary tier of the Throne's set, plus one **rift power** that scales with the item's depth (the depth it dropped at):

| Rift power | Effect at depth d |
|---|---|
| *Descent* | +0.5% damage per depth reached this dive, up to d% |
| *First Light* | your first skill each depth costs no mana (d >= 20: also no cooldown) |
| *Carry Over* | minions keep 50% of a buff between depths |
| *Deep Lungs* | +0.2% mana regen per depth, up to d/5 % |
| *Fold Sense* | the first guardian move each fight is shown two turns ahead |
| *Riftwalker* | +1% Rift reward multiplier per 5 depths of d |

- Outside the Rift, a rift power works at 30%: it matters most where it was found, but is not dead weight in the Tower.
- Riftborn pieces can be **attuned** with Rift Shards: raise their depth by 5 (cost grows), so an old find keeps up.

## 5. Rift Shards

Paid by guardians (1 + depth/10) and sigiled dives (+1 per sigil at the end). Spent on: attuning Riftborn items, unlocking
a sigil early, the weekly dive's extra attempt, and in the black market (R4) for a secret-master heart (40 shards).

## 6. The weekly seeded dive

Beside the Weekly Trial: a seeded dive (same rooms for everyone, same seed all week) with three fixed sigils, from depth 1
to as deep as you go in one try per day. The best depth is recorded with the date. Pays shards by depth and a Riftborn
item for a new weekly best. Local only (no leaderboard).

## 7. Rift events

Between depths, 15% chance of an event:

| Event | Choice |
|---|---|
| **A fold** | skip 2 depths (no rewards for them) / stay |
| **One of yours, from another cycle** | a minion from your Memorial of a past cycle stands here: raise it at Elder / let it go (+20 Choir devotion) |
| **A fragment of the other half** | a lore page of the other half of the Ledger (4 new pages, Rift only) |
| **A tear-shrine** | trade 10% max HP for this dive for +20% reward multiplier |

## 8. Probe and numbers

- A dedicated probe (`"rift":true`): 40 bots at day 60 with fixed gear dive five times each; reports depth per sigil
  set. Replaces the 100-day average as the Rift's measure (B4).
- Each sigil should cost a predictable 1-4 depths for its reward; `full` should want Riftborn items (the bot equips one
  in the Tower at least half the time).
- Targets: market best depth ~25-30 by day 100 without sigils; full with sigils within 5 of market.

## 9. Save

`S.rift.sigils` (last set), `S.rift.presets`, `S.rift.shards`, `S.rift.week = {seed, best, tries}`, `S.rift.guards = {}`
(first kills per band); items `rb:{power, d}`.

## 10. UI, Turkish, Codex, titles

UI: a sigil picker before a dive (shows the multiplier), guardian cards, a Riftborn frame, the weekly dive beside the
Trial. ~140 strings. Codex: Sigils, Guardians, Riftborn, Shards. Titles (5): *Six Guardians*, *Fully Sigiled* (depth 20
with three sigils), *Weekly Diver* (10 weekly bests), *Attuned* (a Riftborn at depth 50), *Other Half* (all four fragment
pages).

## 11. Tests

`99-rift` (use the next free number): sigils change their rules and multiplier; guardians every fifth depth with phase
twos; Riftborn powers scale and work at 30% outside; attunement; the weekly dive is seeded and once a day; events.

## 12. Bot policy

Dive with the sigils the probe rates best for its build; attune the best Riftborn; weekly dive daily after the Trial.
`"off":["sigils","riftborn"]`.

## 13. Risks

- **Riftborn breaks the Tower**: 30% outside the Rift, and *Descent* only counts Rift depths.
- **Guardians as walls**: guardians use R2's phase rules and the alpha-strike lesson (rules over numbers).

## As built (PR A, #24)

- **Where**: `src/game-rift.js` (after game-rival-arc.js). `S.rift = {best, shards?, xs?, sig?, gk?}`: shards, sigils
  opened with shards, the picked set (it is the preset: it stays for the next dive), first guardian kills by band.
- **Sigils**: as the table, with these rules: Hungry Dark weakens all healing in the dive by 40% (a depth is one run, so
  "between depths" has no meaning); Mirror turns the first skill of each room back on you (the Pale Sovereign's book
  move); Old Wounds starts minions at 80% HP; Named puts the dive's master or guardian in phase two; Loud Grave leaves
  no bodies; Typed Dark adds 30% resistance to the type most of your army deals (`r.sigT`). Rewards multiply gold, XP,
  drop chance and the clear's XP. Open: three at depth 5, one per 5 depths, or one early for 10, 20, 30 ... shards.
- **Guardians** (every 5th depth, in turn, x1.3 HP, no body): the Folded Knight (Fold: your rows swap; Edge of Gates:
  the back row; Second Fold: the front too), Mother of Gates (Open Door, Close Door; All Doors), the Echo (Repeat:
  your last skill back at you; Delay: skills wait a turn; Twice), Brass Saint (Litany of Brass: 6% per foe; Brass Bell:
  the front row loses a turn; Brass Skin: immune to the last type that hit it; hazard Ringing: a silence every third
  turn), the Tear Itself (Widen: +5% damage both ways, stacking; Swallow: eats a body; Widening; hazard: you lose 2% max
  HP a turn), the Counting Dead (Count: the third count fells a minion; Tally; Two at a Time). They speak (but the
  Tear), have icons, cards and Codex rows.
- **Shards**: 1 + depth/10 a guardian, 1 per sigil on a cleared dive. Spent on opening sigils early (more in PR B).
- **Not built**: Fold Sense, presets beyond the last set.
- **Bot**: after its Rift push, 12 dives at best-4 with every sigil it may carry (BOT_SIG order), opening sigils with
  shards; reports "rift sigils". `"off":["sigils"]`.
- **Measured**: guardians cost ~0.5-1 depth; sigiled dives at best-4 with 3 sigils clear 53-55%. See 04-balance.
- **Tests**: 98-rift (5); 835 in all; fuzz 12/12 clean.

## As built (PR B, #25)

- **Riftborn gear** (`it.rb={p,d,a?}`): from depth RB_AT=10, a room of a dive leaves one at RB_DROP=5% x the reward
  multiplier, a guardian always; never in the weekly dive except for a new weekly best. A legendary Throne-set piece with
  every bonus line it may hold at its best roll and one power (RB_POW): Descent (+0.5% damage per dive depth, up to d/2 %,
  Rift only), First Light (first skill each room free, from d 20 also no cooldown; outside one room in three), Bulwark of
  the Deep (minions take 0.5% per d less, up to 25%), Deep Lungs (0.1% max mana a turn per dive depth, up to d/10 %),
  Riftwalker (+1% Rift rewards per 5 d; outside 30% of it on kill gold), Deep Ward (boss and guardian moves 0.6% per d
  softer, up to 30%; replaces Fold Sense). Bulwark of the Deep replaces Carry Over (no buffs carry between depths: a depth
  is one run). Full in the Rift, 30% elsewhere; the deepest worn piece of a power counts. Rolled from `dayHash` with a
  seeded generator, never Math.random. Attunement: +5 depth for 5, 10, 15... shards, up to 100.
- **Shards** also buy a secret master's heart (40, in turn) for the Heartforge; the weekly dive's extra attempt was not built.
- **The weekly dive** (`S.rift.wk={w,b,day,top}`): once a day and no watch; the week seeds the rooms (`trialRng`) and three
  sigils; one room a depth from depth 1, a guardian on every fifth, no doors, events or Retry. It pays no XP, gold,
  trophies or gear, and nothing shatters or loses XP in it. A new weekly best pays a shard per 5 depths it adds and, from
  depth 10, a Riftborn piece of that depth.
- **Rift events** (EVENTS with `rift:true`; half the events of a dive, RIFT_EV): a fold (the dive counts 2 depths
  deeper), one of yours (the last Memorial name of a gate kind: a free body that keeps its name, or let it go: the army
  mends 20%, +20 Choir devotion if sworn to the Choir), a fragment of the other half (four pages, `S.rift.fr`), a
  tear-shrine (max HP x0.9 for the dive, rewards +20%). rollEvent keeps them out of the gates and the pedlar's odds count
  only the gate events.
- **Titles** (189): Six Guardians, Fully Sigiled (depth 20+ with three sigils), Weekly Diver (10 weekly bests), Attuned
  (a piece at depth 50), Other Half.
- **Bot**: wears Riftborn pieces for its Rift dives only when its gear score says so (it does not: see 04-balance), attunes
  what it wears, dives weekly twice a week, takes the Rift events (fold and tear-shrine when healthy).
  `"off":["riftborn","weekly"]`. Reports a `riftborn:` line.
- **Tests**: 98-riftborn (6); 841 in all; fuzz 12/12 clean.
