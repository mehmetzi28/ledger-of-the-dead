# R1. Every foe is a puzzle: foe kits and damage types

**Priority** P1, first. **Closes** G1, G2, G4, G5; B1, B2, B5. **Size** XL, two PRs.
**Pillars served**: 3 (read the fight), 2 (every death is a resource), 4 (knowledge compounds).

## 1. The problem in numbers

- 42 gate foes and 8 Tower foes share four stat profiles (their role's). Only the Whisper Choir has a rule of its own.
- The `market` bot ends most rooms in one action once it is ahead; Trial scores floor near 4 turns; orders, statuses and
  combos only matter in boss rooms and Nightmare.
- Frost, fire, rot and shadow exist only as names (Rimeborn, Cinderborn, blight, the Eclipse) with no resistances.
- Farming an outgrown gate costs the same twenty clicks as a real fight.

The round gives every kind of foe a behavior and every gate a damage profile, so the right answer changes from room to
room, then lets a far-ahead player sweep rooms they cannot lose.

## 2. Damage types

Five types. Every damage source gets one; nothing else about the damage formula changes.

| Type | Sources (hero) | Sources (minions) | Sources (foes) |
|---|---|---|---|
| Physical | Strike, Bone Spear, Echo, Wide Arc, Hellfire's splash, Thorns | Every hit without a typed trait; Volley, Spiked | Plain hits, Sundering Blow, Royal Decree |
| Shadow | Soul Siphon, Reap, Death's Toll, Chorus | Bloodfiend's drain | Hymn of Silence's mend is not damage; rival's Decree |
| Frost | Grave Chill, Deep Winter, Soul Prison (no damage) | Rimeborn, Shatterwrought (alternating), Glaciermaul | Drowned Abbot, R2 frost moves |
| Fire | none at start (weapon oils in R4) | Cinderborn, Pyreheart, Shatterwrought | Cinder Wave, burns, Volatile dead, bombers |
| Rot | Corpse Explosion, Plague Bloom, poison and blight ticks | Venomous, Necrotic, Plaguebearer, Witchrot | Plaguebearer affix, Matriarch |

Implementation: `hurtFoe(e,d,type)` and `hurtAlly(a,d,type)` take an optional type (default physical). The module-level
`KILL` already carries `'reap'|'exec'|dot kind`; it becomes `{type, how}`. `resMul(u,type)` returns `1 - res` from
`u.res[type]` (negative values are weaknesses). It applies once, after armor and before shields, so armor and resistance
stay separate levers.

### Gate profiles

Small, readable numbers: weak = +25% damage taken, resist = -25%, strong resist = -50%, immune only on named bosses.

| Gate | Weak to | Resists | Why |
|---|---|---|---|
| Rat Warren | fire | rot | Vermin live in filth; tallow and fur burn |
| Sunken Crypt | frost | fire | Drowned flesh freezes, wet bone won't burn |
| Ashen Barrow | frost | fire (strong) | The mound never stopped smoldering |
| Hollow Cathedral | physical | shadow | Glass and stone crack; the choir lived in the dark |
| Iron Orchard | rot | physical | Iron bark turns blades; rust eats it |
| Throne of Ash | frost | fire, shadow | The court of the book itself |
| Hell Tower | frost | fire (strong) | Devils |
| Rift | rolled per depth (one weak, one resist) | | Shown before you enter |
| Siege (the living) | shadow | none | They are alive; the Ledger feeds on them |

Per-kind overrides live in the kit table (section 3), for example the Glass Sentinel is weak to physical twice over
(+50%).

### Hero and army hooks

- **Bonus lines**: two new roll keys, `fres` / `frres` / `rres` / `sres` (resist one type, 5-20%, armor slot only) and
  `fdmg` / `frdmg` / `rdmg` / `sdmg` (+% damage of one type, weapon and relic only). They join `ROLL_KEYS`, enchanting and
  tempering. Uniques get no new lines.
- **Typed affixes**: two new elite affixes, Frost-touched (its hits chill) and Burning (its hits burn), each with a
  raised-minion trait (Rimeborn, Cinderborn), so typed minions come from fights too.
- **Omens**: the Black Eclipse already boosts shadow; Iron Rain adds "+15% physical resistance to foes", Soul Storm adds
  "+10% shadow damage".
- **Corpse conditions**: a foe killed by damage it is weak to rises **Undone** (raise +10, see 3.4).

## 3. Foe kits

### 3.1 The sixteen kits

Every kit is one rule, shown as a named chip on the foe card. Numbers are starting values to tune.

| Kit | Rule | The answer |
|---|---|---|
| **Shieldbearer** | Every second turn, instead of attacking, shields the most hurt ally for 15% of its own max HP | Kill or freeze it first; Corpse Explosion goes past shields |
| **Ambusher** | Its first attack each fight ignores rows and targets your back row (you, if no minion stands there) for +30% | Ward on turn 1; keep a minion in the back row |
| **Mana thief** | Its hits on you drain mana equal to 10% of your max mana | Keep it off you with Taunt; Bone Shield |
| **Gravecaller** | Once per fight, the turn after an ally falls, raises it at 40% HP (shown as intent) | Kill it first, explode the body, or freeze it on the intent turn |
| **Pack hunter** | +10% attack per other living foe of the same gate (max +30%) | Thin the pack: cleave, Volley, Corpse Explosion |
| **Bomber** | On death deals 40% of its attack as fire to every unit in your front row | Kill it with frost (it rises Preserved and does not burst), or with Reap/Execute (Clean) |
| **Sapper** | Its hits deal double damage to your ward and to Bone Shield | Don't ward against it; kill it before warding |
| **Skirmisher** | Steps to the back row below 50% HP (your melee can't reach it while their front stands) | Strikers, menders' targets, skills |
| **Bulwark stance** | Alternates: on stance turns it takes 50% less damage (the card shows which) | Spend big hits on its open turns; Sunder ignores the stance |
| **Hexer** | Its hits hex 1 time in 3 (today's Whisper Choir rule, generalized) | Ironbound minions; Purifier mark |
| **Marker** | Marks one of your minions: next turn every foe that can reach it attacks it | Taunt overrides the mark; Guard; move the marked minion back |
| **Purifier** | When any foe carries 2+ statuses or damage over time, cleanses one foe instead of acting | Kill it before stacking; burst instead of DoTs |
| **Burrower** | Every third turn it burrows (untargetable for a turn) and surfaces hitting +50% | Ward on the surfacing turn; it can still be hit by room-wide damage |
| **Thorned** | Melee hits on it reflect 15% back to the attacker | Strikers and skills; Stalwart, Ironbound vanguards |
| **Frenzy** | +15% attack each time another foe falls (stacks for the fight) | Kill it first, or last with a burst |
| **Banner-bearer** | While it stands, every other foe deals +10% damage and takes 10% less | Kill it first; it stands in the back row |

Rules for the pool: a kit never stacks with an identical elite affix (a Hexing elite with the Hexer kit gets a different
affix); summoned adds keep their kind's kit; bosses have no kit (they get R2's move sets).

### 3.2 Who gets which kit

Each gate's seven kinds get seven different kits, and the gate's mix fits its profile. The Rat Warren teaches the gentlest
ones.

| Gate | Kind (role): kit |
|---|---|
| Rat Warren | Tunnel Rat (str): Pack hunter · Grave Beetle (van): Bulwark stance · Marrow Mite (men): Purifier · Tannery Brute (van): Shieldbearer · Shiv Cutpurse (str): Ambusher · Tallow Chandler (men): Bomber · Warren Bandit (armed str): Mana thief |
| Sunken Crypt | Skeleton Guard (van): Shieldbearer · Crypt Ghoul (str): Frenzy · Drowned Priest (men): Gravecaller · Drowned Sentinel (van): Thorned · Coffin Crawler (str): Burrower · Tide Acolyte (men): Hexer · Crypt Legionnaire (armed van): Bulwark stance |
| Ashen Barrow | Ash Husk (van): Bomber · Barrow Wight (str): Mana thief · Pyre Witch (men): Banner-bearer · Barrow Thrall (van): Pack hunter · Ember Stalker (str): Ambusher · Cinder Weaver (men): Sapper · Barrow Champion (armed str): Frenzy |
| Hollow Cathedral | Stone Gargoyle (van): Bulwark stance · Nave Stalker (str): Ambusher · Hollow Chorister (men): Banner-bearer · Glass Sentinel (van): Thorned (and weak to physical x2) · Tooth Collector (str): Marker · Vestment Wraith (men): Burrower · Cathedral Templar (armed van): Shieldbearer |
| Iron Orchard | Thorn Troll (van): Thorned · Rust Knight (str): Sapper · Sap Weaver (men): Gravecaller · Iron Scarecrow (van): Marker · Fruit Reaver (str): Bomber · Grove Shepherd (men): Purifier · Orchard Marshal (armed van): Banner-bearer |
| Throne of Ash | Throne Guard (van): Shieldbearer · Ash Revenant (str): Frenzy · Whisper Choir (men): Hexer · Ember Herald (van): Banner-bearer · Crownless Duelist (str): Ambusher · Pallbearer (men): Gravecaller · Ash Praetorian (armed van): Sapper |
| Hell Tower | Imp: Bomber · Hellhound: Pack hunter · Chain Devil: Marker · Pit Warden: Bulwark stance · Soul Tender: Gravecaller · Brimstone Chanter: Banner-bearer · Hell Legionary: Shieldbearer · Infernal Duelist: Mana thief |
| Siege | Militia Spearman: Shieldbearer · Crossbowman: Ambusher · Chaplain: Purifier · Witch-hunter: Marker |
| Rival's followers | Keep their kind's kit; stolen bodies keep it too |

`KITS` (data) and `KIT_OF` (kind -> kit) live in `game-gate-rules.js` beside `CORPSE_CONDS`. Kits act through hooks that
already exist: `rollIntent` (Shieldbearer, Marker, Purifier, Gravecaller intents), `foeOnHit` (Mana thief, Hexer, Sapper),
`checkDeaths` (Bomber, Frenzy, Gravecaller trigger), `hurtFoe` (Bulwark stance, Thorned, Burrower), `rowOf` (Skirmisher),
the damage multiplier in `act` (Pack hunter, Banner-bearer, Ambusher).

### 3.3 What the Ledger shows

| Mastery tier | Foe card shows |
|---|---|
| unknown | A "?" chip: the foe has a kit you haven't learned |
| Studied | The kit's name and its rule on hover |
| Known | The kind's weakness and resistance; the kit's next trigger ("Burrows next turn") |
| Mastered | Kit numbers (shield size, bomb damage on your front row) |
| Ledgered | The best answer, added to the existing answer chips (`blowCounters`) |

Doors show kits for the kinds behind them as far as door sight goes (`doorSight` 1: names and kits, 2: plus weaknesses).

### 3.4 Kits on your side: the Undone

A body killed by damage of a type it is weak to rises **Undone** (a new `CORPSE_CONDS` entry, raise +10). An Undone
minion keeps an echo of its kit, if the kit is one of the eight that make sense for an ally, at 60% strength:

| Ally-side echo | Effect on your side |
|---|---|
| Shieldbearer | Every second turn shields your most hurt minion for 9% of its own max HP |
| Pack hunter | +6% attack per other minion of its gate, max +18% |
| Bulwark stance | Takes 30% less damage every other turn |
| Thorned | Reflects 9% of melee damage taken |
| Frenzy | +9% attack each time a foe falls this fight |
| Banner-bearer | Your other minions deal +6% damage while it stands |
| Marker | Its first hit each fight marks the target: your minions deal +15% to it for 2 turns |
| Gravecaller | Once per room, the first minion of yours to fall gets up at 25% HP |

Other kits give the Undone minion +10% damage of its gate's weakness type instead. The echo is a trait (`undone`, with
`m.kit` holding the kind's kit), so fusion, the Memorial and save repair handle it like any trait.

## 4. Sweep: outgrown rooms in one click

On a Normal, uncursed gate you have cleared, the gate card offers **Sweep** when your level is at least the gate's
Recommended level + 12 and you have cleared it on Normal 5 times. A sweep:

- costs one watch, like a run;
- generates the run's rooms as usual (same foes, same drops, same secret-master roll; a secret master or the rival
  cancels the sweep into a normal boss fight at the boss room);
- awards kill XP at 80% (on top of the farming falloff), gold, trophies, drops, bestiary kills, quest and bounty progress;
- raises nothing and meets no events or doors; downed minions don't happen; no records except kills and gold;
- shows one summary screen (spoils, level-ups, bestiary rungs crossed).

This turns farming into a planning decision (sweep three outgrown runs for trophies and hearts, or spend the watch on
something harder) and keeps the bot's farming fast.

## 5. Numbers to tune and how

1. Ship damage types with resistances set to 0 first and confirm no bot number moves (the plumbing PR).
2. Turn on gate profiles; re-measure; expect the market bot to drop a few points where its typed sources are resisted.
3. Turn on kits; expect a larger drop. Retune `DIFF.foeAtk` and `DIFF.armor` down until gate clears return to ~85%
   (`market`) with room length 2-4 actions at the Recommended level (new bot metric: actions per room by level offset).
4. Re-measure `REC_BASE` with `{"byLvl":true}` and both seeds; update `REC_AT`.
5. Tower and Rift: check the curve (43/68/78 market) and retune `TW.atkG` if needed.

## 6. Save, UI, Turkish, Codex

- **Save**: no new top-level fields. Run-only fields on foes (`e.kitT` counters, `e.stance`, `e.burrow`, `e.mark`) are
  stripped like `dots`/`st`. `m.kit` on Undone minions is repaired by `normalizeSave` (unknown kit -> trait dropped).
- **UI**: a kit chip and type icons on foe cards; damage numbers tinted by type on the stage (`fx.js`); a resist row at
  Known; Sweep button and summary screen on the gate card.
- **Codex**: "Damage types" (the table above, generated from data), "Foe kits" (all sixteen with answers), the Undone.
- **Turkish**: ~140 new strings (`TR_DICT` for kit names and rules, `TR_RX` for "Burrows next turn"-style patterns).
- **Tips**: one for the first kit seen, one for the first weakness hit, one for Sweep.
- **Titles** (4): Kit-Reader (see all 16 kits), Weakness Hunter (500 kills by weakness), Defuser (25 bombers killed by
  frost or Reap), Gravedigger's Bane (kill 50 gravecallers before they call).

## 7. Tests (new groups)

- `79-damage-types`: every source tags its type; resistances apply once; armor and resistance stack as designed; DoT ticks
  typed; Eclipse and Iron Rain hooks.
- `80-foe-kits`: one test per kit (trigger, numbers, the stated answer works), the gate kit table has no duplicate kit per
  gate, summoned adds keep kits, kits survive Retry snapshots, bosses have none.
- `81-undone`: condition fires on weakness kills; each echo works; fusion keeps it; save repair drops unknown kits.
- `82-sweep`: offered only when allowed; pays as specified; a secret master or the rival turns it into a boss fight;
  watches, quest and bounties count.
- Fuzz: add Sweep and kit-intent states to the click pool.

## 8. Bot policy

- Target order: Banner-bearer > Gravecaller (before its trigger) > Shieldbearer > Bomber (only if it is not in front of
  your front row, or with frost/Reap) > Purifier > the rest by threat.
- Don't ward into a Sapper's intent; ward before an Ambusher's first turn and a Burrower's surfacing turn.
- Prefer Siphon or skills over Strike against physical resistance; prefer typed minions in the army for the gate's
  weakness when choosing the Reserve swap.
- Sweep any eligible gate run that is only being farmed.
- New `"off"` switches: `kits`, `types`, `sweep`.

## 9. PR split

- **PR A: damage types.** Plumbing, gate profiles, typed affixes, bonus lines, omen hooks, Codex page, tests 79, retune.
- **PR B: kits, Undone and Sweep.** Kit data and hooks, bestiary display, door display, Undone, Sweep, titles, tips, tests
  80-82, bot policy, retune, `REC_BASE` re-measure, docs update (02 combat and army sections, 03 gaps G1/G2/G4/G5 struck,
  04 measurements, 05 status).

## 10. Risks

- **Turn-length creep**: kits make rooms longer for everyone, including early players. Mitigation: Rat Warren kits are the
  gentlest, and the room-length metric is a done-when, not a hope.
- **Information overload on cards**: one chip per kit, details on hover; the stage shows only the chip's icon.
- **Bot blindness**: a bot that ignores kits will report the game as harder than a player finds it. The bot policy above is
  part of the round, not a follow-up.
