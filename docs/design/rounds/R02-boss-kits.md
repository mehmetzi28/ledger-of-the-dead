# R2. Masters worth remembering: boss kits

**Priority** P1, after R1. **Closes** G3, part of G11. **Size** XL, two PRs. **Needs** R1 (damage types, kit hooks).
**Pillars served**: 3 (read the fight), 2 (every death is a resource), 6 (bosses keep paying through hearts).

## 1. The problem

Twenty-four bosses (6 gate bosses, 6 secret masters, 10 Tower wardens, the rival, the Inquisitor Captain) share seven
moves. Every boss's phase two is the same: moves a turn sooner, everything telegraphed, Sundering Blow. Wardens and secret
masters reuse the gate moves. Learning one boss teaches you all of them.

## 2. The boss model

Each boss gets a **move set** (`BOSS_KIT[name] = {moves:[...], phase2:{...}, res:{...}, hazard}`) replacing the single
`e.abil`:

- **2-3 moves** on a rotation the card shows (the existing `abilT` counter becomes a pointer into the rotation). Each move
  has `warn` (telegraphed or not), a damage type and an answer list (feeds `chargeInfo` and `blowCounters`).
- **A phase two of its own** at 50% (65% on Brutal): a twist that changes the fight, plus the existing "a turn sooner".
  Sundering Blow stays only where it fits.
- **Resistances**: bosses have their gate's profile plus one personal entry; a few have one immunity, always stated.
- **An arena hazard** (optional): a rule for the whole room, shown on the boss card and the door (Ledgered).
- Bosses never get R1 kits; their adds do.

The existing move code (`fireAbility`) becomes a table of move functions, so every move is data plus one function, and
the Codex, bestiary and defeat recap read the same table.

### As built (PR A)

- Code in `src/game-boss-kits.js` (after game-kits.js). `BOSS_ABIL` stays the move table (new moves added to it); a boss
  with a kit has `e.kit` (its rotation) and `e.kitIx`, and `e.abil` always holds the next move, so the old intent, charge and
  recap code reads it unchanged. `fireKitMove` handles the new moves; `bossTwist` the second phases; hazards are checked
  while their boss stands (`hazardOn`).
- `BOSS_KITS_ON` (the bot's `"off":["bosskits"]`) restores the single moves. Secret masters and wardens keep their single
  move and Sundering Blow in phase two until PR B; `giveAbility` strips a kit, so `makeSecret` re-gives the plain move.
- Simplifications: the Keymaster's Lock makes the minion unhittable and idle (foes never aim at it); The Choir Answers
  gives its adds Hasted (a 50% follow-up) while you are silenced rather than a full second action; The Last Watch reflects
  onto whoever landed the hit (`HITTER`: you, then each minion); Let It Burn's immunity leaves 1 damage (`foeRes` returns 1);
  What the Book Gave Me maps your last skill: damage skills hit you for 30% of max HP, Dark Mending mends every foe 15%,
  Curse Sunders you, Unholy Frenzy hastes every foe; with no skill used yet it speaks a Royal Decree. Purge hexes and
  sunders the strongest evolved minion and strips minion wards (no evolution buffs are removed). Rally is +20% attack, once
  per foe.
- The rival keeps Royal Decree and adds the move of its stash's main role; no stash, no kit. The warning names it.
- The boss card shows "Next: X" always and "X → Y" from Known; the hazard and twist as chips. Ledgered doors list every
  move with its answer, the twist and the hazard.
- Tests: one group, `82-boss-kits` (10 tests: table, rotation and card, each move, the Edict, twists, hazards, rival and
  Captain, Codex and Turkish), in place of 83 and 85.
- Bot: targets seedlings while Bloom is on, Taunts or Guards for the Edict's named minion (full), wards before Ember Lance
  and Called Shot; new columns `bossWin` and `bossActs`.
- Measured: about 1 point of clears, no retune (04-balance.md).

## 3. Gate bosses

| Boss | Moves (rotation) | Phase two | Resists / weak | Hazard |
|---|---|---|---|---|
| **The Rat King** (E) | Call the Swarm (2 rats) · Gnaw (a hit that bleeds) | *Crown of Rats*: each Swarm calls 3, and rats gain Pack hunter. On Normal the phase stays off (first boss) | rot / fire | none |
| **The Crypt Warden** (D) | Bone Wall · Keymaster's Lock (telegraphed: one minion is locked for 2 turns, can't act or be hit) · Shield Bash (sunders) | *The Last Watch*: while any Bone Wall shield stands, the Warden reflects 20% of the damage it takes | fire / frost | none |
| **The Ember Knight** (C) | Cinder Wave · Burning Ground (the front row burns for 3 turns) · Ember Lance (fire, telegraphed, at your back row) | *Let It Burn*: immune to fire, Cinder Wave every second move, takes +25% frost | fire (strong) / frost | Smoke: Ward 20% weaker |
| **The Bishop of Teeth** (B) | Hymn of Silence · Tithe of Teeth (drains 20% of your mana, heals for it) · Bite of Faith (a hit that hexes a minion) | *The Choir Answers*: while you are Silenced, his adds act twice | shadow / physical | Echoing nave: the first skill each fight costs double |
| **The Orchard Mother** (A) | Seedfall · Iron Thorns (roots a minion: can't act, rot damage for 2 turns) · Graft (drains a seedling to heal 10%) | *Bloom*: seedlings that live 2 turns mature into Thorn Trolls | physical / rot | Roots: back-row minions take 5% rot a turn |
| **The Pale Sovereign** (S) | Royal Decree · Court Summons (2 Throne Guards) · Edict of Ash (telegraphed: names a minion; if it is alive at his next turn, it is executed. Guard, Taunt onto another vanguard, or freezing him saves it) | *What the Book Gave Me*: every third move copies the last skill you used, against you | fire, shadow / frost | none |

## 4. Secret masters

Each has its own three-move kit and a hazard; they already enter in phase two, so their "phase two" is a second hazard at
50%.

| Master | Moves | At 50% | Notes |
|---|---|---|---|
| **The Plague Matriarch** | Brood (2 mites that burst into poison) · Plague Breath (rot to everyone) · Feed (eats a mite, heals 8%) | *The Swarm Remembers*: every mite death adds a stack of +5% attack | immune to poison |
| **The Drowned Abbot** | Rising Tide (passive counter, +1 a turn; at 5 the room floods: 30% max HP to every unit of yours; a freeze resets it) · Drown (frost hit) · Litany (heals per tide) | *Undertow*: the tide rises 2 a turn | the clock fight |
| **The Cinder Wyrm** | Breath Line (fire, 120% to the whole front row, telegraphed) · Molten Scales (thorns 25% for 2 turns) · Tail Sweep (back row) | *Wyrmfire*: burning ground for the rest of the fight | fire immune, weak frost |
| **The Choir Eternal** | Three bodies share one HP pool (each acts) · Verse of Binding (silences) · Crescendo (damage grows each verse) | *Last Note*: when one body falls the others act twice | kill order matters |
| **The Rootking** | Regrowth (heals 5% a turn unless it carries rot) · Spreading Roots (roots two minions) · Heartwood (armor up 2 turns) | *Deep Roots*: regrowth doubles | Rot builds counter it |
| **The Nameless Sovereign** | Mirror (copies your last skill) · Unwriting (removes one trait from a minion for this fight) · Decree of Nothing (telegraphed, 50% max HP, Ward soaks) | *The Name*: copies two skills per move | the hardest fight in the gates |

## 5. Tower wardens

One signature move each (they keep borrowing a gate move as their second), so a climb is ten different fights.

| Floor | Warden | Signature move |
|---|---|---|
| 10 | The Gate Hound | *Three Heads*: three intents a turn at 50% each (three cards) |
| 20 | Cinder Matron | *Moth Light*: pulls your sturdiest back-row minion into the front row |
| 30 | The Iron Inquisitor | *Confession*: you take +25% damage until you Ward (telegraphed) |
| 40 | Lord of Flies | *Swarm Cloud*: your side misses 1 hit in 5 for 2 turns |
| 50 | The Bone Cantor | *Dirge*: your damage over time ticks twice for 2 turns |
| 60 | Duke of Chains | *Chain*: binds a minion; 30% of the damage he takes is shared to it |
| 70 | The Pale Executioner | *Mark for the Block*: the marked unit is executed next turn if under 40% HP |
| 80 | Archdevil Vael | *Infernal Bargain*: heals 10% each turn unless frost hit him that turn |
| 90 | The Hollow Seraph | *Halo*: reflects 30% of skill damage for 2 turns (telegraphed) |
| 100 | Abaddon, King of Hell | rotates every warden's signature; *The Other Half*: steals your Souls |

Abyssal wardens past 100 roll two signatures from this table.

## 6. The rival and the Captain

- **The rival** builds a move set from the roles of the bodies in their stash at the time of the challenge: mostly
  vanguards -> *Bone Rampart* (shields followers), strikers -> *Called Shot* (focus-crit on your back row), menders ->
  *Black Mass* (heals followers 15%), reapers -> *Harvest* (executes a minion under 25%). Royal Decree stays. So what
  they steal shapes the duel, and the Gates warning names their kit.
- **The Inquisitor Captain** (sieges): Royal Decree · *Purge* (strips a minion's evolution buffs for the wave) · *Rally*
  (militia +20% attack). R14 expands sieges further.

## 7. Hearts, rewards and knowledge

- A boss's heart gains a second use: **heart-forging** (R4). Until R4 lands, secret-master hearts can be traded at the
  Bone Altar for a free empower.
- **Bestiary**: Known shows the rotation; Mastered the numbers; Ledgered the answers for every move and the phase twist.
  The boss door (`doorBoss`) shows the whole kit when Ledgered.
- **Defeat recap** names the move and its answers (already shaped for this: `blowNote`).
- **Titles** (6): one per gate boss for beating its phase two without losing a minion ("Unbroken Court", etc.), plus
  "Ten Faces" (beat every warden's signature move with its stated answer used at least once).

## 8. Numbers and tuning

- Target fight length: 4-7 player actions at the Recommended level (gate bosses), 6-10 (secret masters), and each gate's
  boss room keeps the gate's clear target.
- New bot metric: boss room actions and boss room win rate per gate.
- Tower: the market curve 43/68/78 and full ~88 must hold; tune each warden's signature numbers, not `TW` globals, if one
  floor sticks out (new probe: deaths by floor).
- Rival: 65-75% won in `full`; siege held 80-87%.

## 9. Save, UI, Turkish, Codex

- **Save**: none at top level. `e.kitIx` (rotation pointer), `e.tide`, `e.locked`, `e.chain`, `m.locked` are run-only.
- **UI**: a boss rotation strip on the boss card ("next: Iron Thorns, then Graft"); the phase twist banner; hazard chip
  on the card and the boss door.
- **Codex**: "Bosses" becomes generated from `BOSS_KIT`; one page per boss family.
- **Turkish**: ~200 strings (move names, descriptions, banners, boss lines for new moves).
- **Presentation**: each new move gets a stage effect (`fx.js`), reusing particles where possible (R17 polishes).

## 10. Tests

- `83-boss-kits`: every boss has a valid kit; every move fires, logs, and its stated answer works (freeze breaks warned
  moves, Taunt redirects named blows, Guard saves the Edict target); phase twists trigger once; hazards apply.
- `84-wardens`: each signature; Abaddon's rotation; abyssal wardens roll two.
- `85-rival-kit`: the stash's role mix decides the kit; save round trip mid-challenge-day.

## 11. Bot policy

- Answer table per move (from the kit data: freeze the telegraphed, Guard the Edict, kill seedlings before Bloom, reset
  the tide with Grave Chill, focus one Choir body).
- `"off":["bosskits"]` falls back to the old single moves for measurement.

## 12. PR split

- **PR A**: the move-set engine, gate bosses, the rival's kit, the Captain, bestiary/door/recap, tests 83 and 85.
- **PR B**: secret masters, Tower wardens, titles, tests 84, Tower retune, docs.
