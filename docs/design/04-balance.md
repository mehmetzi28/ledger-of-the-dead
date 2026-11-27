# 4. Balance

Balance is measured with bots, never guessed. This page holds the targets, the latest numbers, what we have learned
about how the game behaves, the known problems, and the levers. The full measurement history lives in the comments next
to each constant in `src/` and in `claude.md`; this page is the summary to read first.

## 4.1 Targets

| What | Target | Why |
|---|---|---|
| Gate clears, `market` bot, entering at the Recommended level | ~80% per gate; ~85% over a 100-day game | Hard enough that a fair player sometimes falls |
| `full` bot (uses every system) vs `market` | 1 to 3 points above | Systems should help, not trivialize |
| `full` bot on Normal only (`"heat":0`) | at most ~91-92% | The guard rail: Normal must not become a walk |
| No-skill bot | clearly below the skill bot | Skills must matter |
| Recommended level (`gateRec`, `tierRec`) | the lowest level where the bot clears ~75% | The gate card must tell the truth |
| Hell Tower (market) | floor ~43 by day 35, ~68 by day 60, ~78 by day 100 | A climb that lasts the whole game |
| Hell Tower (full) | ~85-90 by day 100 | Floor 100 stays a real goal |
| Sieges held (full) | 80-87% | A real threat to the town |
| Rival challenges won (full) | ~65-75% | They should win sometimes |
| Expedition nights held (full) | ~75-80% (now ~84%) | A reliable but risky order |
| Stat builds (Will + one other) | within ~4 points of each other on gates | No dead stat |
| Rank-3 skill upgrades (a vs b) | within ~2 points | Both choices real |
| Each system switched off (`"off"`) | costs about 1 point of clears or a few Tower floors | Every system pulls its weight |

## 4.2 Latest measurements (2026-11-26, seeds 7700 and 9100, 40 bots x 100 days)

**After Rift sigils and guardians, PR A (R9)**: gates and the Tower unchanged (market 89/90%, Tower 78.6/77.1; full 90/90%, Tower 87.6/86.6). Guardians cost the Rift ~0.5-1 depth: market 15.8/16.2 (was 16.8/16.6), full 19.4/18.8 (was 20.0/18.7). The full bot then makes 12 dives five depths above its best with three sigils (Thin Veil, Old Wounds, Iron Sky first): 53/55% cleared, ~28-29 shards and 4.4-5 guardians a bot. A first build moved the market bots because the Brass Saint's move reused the id `litany` of the Drowned Abbot's move; a test now checks the ids.

**After Riftborn gear, the weekly dive and Rift events, PR B (R9)**: market unchanged (89/90%, Tower 78.6/77.1, Rift 15.7/16.4: Riftborn drops are rolled from a hash, so nothing else in a dive rolls differently). Full: gates 90/91%, level 60.8/61.4 at day 100, Rift 20.7/21.0 (22.1/20.7 with `"off":["weekly","riftborn"]`), ~13 Riftborn pieces found a bot, the weekly dive 14.3-14.5 times a bot (twice a week) to a best of depth ~38. The weekly dive costs the full bot ~3.5 Tower floors (83.6/84.6; 87.1 with `"off":["weekly"]`), in potions and draughts drunk for no XP: a player's choice, left as it is. Three first builds were cut back: with XP and gold the weekly dive took the full bot to level 95 by day 100 (it now pays only shards and a Riftborn piece); with a watch it cost ~4 levels (it now costs none, and nothing shatters or loses XP in it); every guardian in it left a Riftborn piece (~85 a bot; now only a new weekly best does). **Open**: the bot still prefers its uniques and heartforged pieces to Riftborn ones, even in the Rift (0% worn): its gear score only swaps one in past depth ~40. A probe of their real worth in the Rift is left to a later round.

**After the gods' omens, PR B (R8)**: market unchanged (90%, Tower 77.1, Rift 16.6; a first build moved it because Choir Night's minion bonus read omen() in syncArmy and rolled the day's omen early; it now only peeks). full 90/90%, Tower 87.6/86.6, Rift 20.0/18.7, sieges held 79/82%. Every god 89-92% on gates. The bots call 9-26 omens each over 100 days (Ulm most: Bone Harvest pays in trophies; the Choir least: rank 5 late) and ward Soul Storm 0-2 times; with `"off":["calls"]` (7700) clears 90%, Tower 86.8, Rift 19.5, so calls are worth about a Tower floor and half a Rift depth.

**After the pantheon, PR A (R8)**: market unchanged (90%, Tower 77.1, Rift 16.6). full 90/90%, Tower 86.6/87.4, Rift 20.1/20.9, sieges held 83/81%. Per god (8 bots each, seeds 7700/9100): Morrow 91/91%, Vesh 89/89%, Ulm 90/90%, the Choir 90/90%, the Profane 91/90% (within 2 points); rank 5 on day 33/31 (Morrow), 38/34 (Vesh), 31/32 (Ulm), 37/52 (Choir), 36/40 (Profane); rank 1 on day 14-18 (the Pantheon opens at level 8). DEED_K hon/ulm 1 -> .4 (rank 5 on day ~23), choir 1 -> 3 (~68). Vesh's vow first broke on every Blighted death: the bots' necrotic and witchrot minions broke it ~85 times each and Vesh stayed at rank 0-1; now 3 in one run (VESH_ROT) and the Vesh bot benches rot-spreading minions: 1-3 breaks a bot.

**After the rival's end, chapters 4-5 (R7 PR B)**: market unchanged (89/90%, Tower 78.6/77.1, Rift 16.8/16.6). full
90/90%, Tower 87.8/87.0 (was ~85: the rival's book is worn from day ~70), Rift 20.8/20.2 (was ~15.5), sieges held 80/78%.
The arc ends on day 70-71 in every bot (chapter 4 on day ~65, chapter 5 ~66); their gate cleared 80 of 81 runs; the
Reckoning won 40/58 and 40/62 (69/65%; ARC_DUEL_K x1.25 gave 43%, x1 58%, x.85 73-77%, so x.9; The Last Page's heal
10% -> 6%). Challenges won fell to 46% only because the 40-odd late challenges (day 70-100, nearly all won) no longer
happen once the rival is ended; the rate before day 70 is unchanged. The rival's uniques were first at Tower-floor-30
strength and no bot wore them; now near floors 60-70, all three are worn.

**After the rival's war, chapters 1-3 (R7 PR A)**: market unchanged (89%, Tower 78.6, Rift 16.8). full 90/91%, Tower
84.7/85.4, Rift 15.6/15.4, sieges held 77/80%, rival challenges won 63/65%. Chapter 2 opens on day ~50 (it took ~67 with
three challenges, so two), chapter 3 on day ~60; ~1.2 wagers won a bot (the bot stakes its weakest Reserve body on a
challenge morning); ~3 bodies Reclaimed a bot. The rival's siege was held 93% at a challenge's strength, so its rival
is 25% stronger (ARC_SIEGE_K): 68-85% held (27/40, 34/40), close to the ordinary siege's ~80%.

**After expeditions and Rally (R6)**: market unchanged to the digit (89/90%, Tower 78.6/77.1, Rift 16.8/16.6). full
89/90%, Tower 83.7/85.4, Rift 17.2/15.0, sieges held 81/82%, rival 63/65%, levels 60-61 at day 100. The bot sends ~115
expedition nights a game and holds ~84% of them (target 75-80%; it only sends at 55% or better and covers the steps),
almost all to the day's cursed gate (gold x1.25, two pieces of gear); it presses on at 70% or better and takes two nights
only with no siege within two days. Rally fires ~1,180 times a game and is worth under a point (`"off":["rally"]`: Tower
84.5, Rift 16.3). Expeditions are the Rift's gain: `"off":["exp"]` (plain one-night gate raids, old squad choice) gives
Rift 12.4, so the carried spoils and role-covered squads add ~4 depths without moving gates or the Tower; the cursed pay
was cut from x1.5 and three pieces (Rift 17.0, gold earned +11%) to x1.25 and two. Sieges lose ~2 points because a squad
in the field on a siege night is not on the wall. Left for R9 (the Rift's own retune).

**After the town's dread, daily orders and upkeep (R5 PR B)**: market unchanged (89/90%, Tower 78.6/77.1). full 90/90%,
Tower 84.8/85.3, Rift 11.3, sieges 85/82%, levels 61 at day 100. Daily orders cut the stat points from the day's work from
~95 to ~48 (only Hunts pay one; target 50-60), which costs about a point of clears and 1.5 Tower floors; every order and
an order-less day's work keep the XP, so levels did not move. Upkeep takes ~30k a game; gold held at day 100 ~16.7k. Dread
ends at 41-44 and enters Afraid ~4 times a game. Sieges by band (`"dread"` probe, seed 7700): Calm 82%, Uneasy 85%,
Afraid 80%, Terror 77% at +20% waves and 79% at +15%; all near the 80-87% target.

**After the necropolis grows (R5 PR A)**: market unchanged (89/90%, Tower 78.6/77.1; the market bot does not build).
full 91/91%, Tower 86.6/86.5, Rift 13.6/13.1, sieges 87/83%, rival 67/76%, raids 81/80%. The bot raises ~20 levels of the
new buildings and picks 9-10 specializations a game; `"off":["town2","embalm"]` gives 91%, Tower 86.1, Rift 12.5, so the
town buys about a Rift depth and half a floor at no cost in clears. Gold held at day 100 ~19k (target 10-20k): the new
levels (up to 60k each) take gold that went to headstones before. One finding on the way: a Library roll drew a random
number on every kill even with no Library, which reshuffled the market bots' runs (9100 read 86% from one unlucky bot);
it now rolls only with a Library.

**After brewing, commissions and the black market (R4 PR B)**: market unchanged (89/90% gates, Tower 78.6/77.1:
the market bot does not brew). full 91/91%, Tower 86.9/87.1, Rift 12/11.9, sieges 86/83%, rival 68/75%. The full bot
brews ~160 times a game (~40k gold: an oil for the gate's weakness, incense, a Second Draft and a banner armed, draughts
kept on the belt; ~80 brews carried into runs), fills ~9.5 trophy commissions (+~6.8k gold) and makes 1.4-1.8
black-market trades (it sells its pouch each visit, so it rarely holds 30 deep trophies). With `"off":["brew"]`: 92/92%,
Tower 86.3/85.6, so brewing buys about a Tower floor and costs about a point of gate clears (the gold goes to brews instead
of headstones and the Bone Altar). Lifetime gold ~1.1M; gold held at day 100 ~17.5k (target 10-20k); forging plus
brewing spend ~60k a game against the spec's ~180-280k target, so G10 is narrowed, not closed.

**After heart-forging and the gold soft cap (R4 PR A)**: market 89/90% gates, Tower 78.6/77.1; full 91/91%, Tower
86.9/86.6, Rift 12/11.8, sieges 86/87%, rival 71/72%. A leak was fixed first: the Scribe's Regalia (the abbey's set)
dropped from gate tables, the Tower, master legendaries and Rift records; it now drops only in the abbey, which alone
took market lifetime gold from ~1.73M to ~1.54M (fewer high-value sales). The full bot forges 1.5-1.7 heartforged pieces
a game (~20k gold) from spare hearts. The soft cap moves lifetime gold only ~2% (to ~1.15M in full), far from the spec's
20-25%: most late gold is not the level part (difficulty, curses, bosses, sales). Gold held at day 100 ~20.5k, at the
top of the 10-20k target, but the heart-forging sink is ~20k against a 150-250k target, because the bot holds few spare
hearts; brewing, commissions and the black market (R4 PR B) are the larger sinks still to come.

**After Vane Abbey (R3 PR A)**: the six gates are unchanged (market 90/89%, Tower 78.7/78.2, Rift 15.6/16.5; full
92/92%, Tower 85.2/84.5, Rift 11.2/12.8, sieges 86/84%, rival 74/70%). The abbey opens for no bot inside 100 days: the
bot climbs the Tower only after its days (85 floors on average) and holds the 20 valley pages only near day 100, and no
bot slays all six masters. `ABBEY_TOWER` went 100 -> 90 as the spec says; the page key stays. Players who climb the
Tower as they go reach the deep route around day 90-100 by the same page curve. Tier probe on the abbey (16 bots x 70
days, Normal): 58-90% at Lv28, 80-100% at Lv30, 81-100% at Lv32 (market lowest), so `REC_BASE[6]` = 31 (S is 27);
Hard 53-96% at Lv34, 80-100% at 38-40 (advice 39). At the end of the days (Lv53-62) the bots clear it 99-100% with the
Hunger down in about 3 actions; the 7-10 action target is for Recommended level and could not be measured by the bot
yet.

**After secret-master and warden kits (R2 PR B)**: no retune of the Tower. market 90/89% gates, Tower 78.3/78.4, Rift
22.2/22.5; full 91/91%, Tower 85.8/85.5, Rift 11.3/11.7, sieges 84/86%, rival 71/71%; secret masters slain 88-90% of
meetings (86% before). A duel probe (each cleared gate's boss room at fresh HP, day 50) first showed the Choir Eternal, the
Rootking and the Nameless Sovereign near 0-10% for one seed; the cause was that seed's army (menders and a striker, no
front row, so no Soul Tether), but the flood, regrowth, Crescendo, Decree of Nothing and repeated Edicts were softened
anyway; on seeds 7701 and 9100 every master falls 100% at day 50 (5-11 actions, as before).

**After boss kits for the gate bosses, the rival and the Captain (R2 PR A)**: no retune. market 89/88% gates (S 90 to 88%),
Tower 78.0/77.7, Rift 22.3/22.2; full 91/91%, Tower 85.2/85.5, Rift 12.2/12.1, sieges 85/84%, rival 67/71% (was 71/72).
`"off":["bosskits"]` gives back the R1 numbers exactly (90%, Tower 78.1, Rift 22.9), so the move sets cost about a point
of clears and half a Rift depth. New bot columns (market, 12 bots x 40 days): boss room win rate 90-99% and actions per
won boss room E 5.3, D 7.9, C 8.7, B 4.3, A 5.1, S 8.5, a little over the 4-7 target at D, C and S (the Lock, Burning Ground
and the Edict make the bot spend turns on wards and freezes).

**After foe kits, the Undone and Sweep (R1 PR B)**: before any retune, kits cost the first gates most (market E 92 to 83%,
D 90 to 86%; full E 87 to 81%), Tower 78 to 71-72 and Rift 23 to 18-19. Rat Warren ablation: the Warren Bandit's mana
thief and the Tunnel Rat's pack hunter were each worth 3-4 points of E. Retune: `DIFF.foeAtk` E/D 1.2/.95 to 1.0/.9
(nothing else moved). Then market 90/89% gates (E 89, D 90, C 92, B 91, A 88, S 90), Tower 78.1/78.5, Rift 22.9/23.2;
full 91/91% (E 84, D 85, C 88, B 81, A 84, S 96), Tower 84.6/83.2, Rift 12.1/12.5, sieges 86/84%, rival 71/72%. Turns per
room barely moved (market C 5.3, B 3.4, A 3.7, S 3.0): kits make rooms harder to read, not longer, for a bot that targets
well. `REC_BASE` stands (byLvl and push: D 87% at Lv5, C 78% at 9, B 79-89% at 14-15, A 77-85% at 19, S 86-89% at 26).
The bot's kit policy (target order, no ward into a Sapper, ward before an ambush or surfacing) is worth ~2 points of
clears and ~1 Rift depth (`"off":["kits"]`: 88%, Rift 21.8). Sweep: the market bot sweeps ~105 runs a game (the full bot,
busy elsewhere, under 1); it changes no level, Tower or Rift number (`"off":["sweep"]` 94% clears only because the
swept runs are then fought as easy clears), so it saves clicks without adding power.

**After damage types (R1 PR A)**: profiles, typed affixes and typed lines moved nothing past noise. market 92/93% gates
(main 92/92%), Tower 78.5/78.4, Rift 23-24; full 91/92%, Tower 84-85, Rift 12-13, sieges 85-86%, rival 73-77%. Turns per
room shifted a little where the bots' physical damage meets a profile (Ashen Barrow 5.3 to 5.6, Hollow Cathedral 3.6 to
3.3). The bots ignore types, so this is the floor: types change what a thinking player picks, not what wins. Kits (PR B)
carry the turn-length goal.

**After Command (PR #5)**: B/A/S `foeAtk` 7 / 5.7 / 6.1, `TW` hpG/atkG .07/.048, `RIFT_STEP` .55. market 91/92% gates,
Tower 78, Rift 24; full 91%, Tower 84-86, Rift 12, sieges 84-85%, rival 78-80%. Stat builds even: Will+Con/Str/Int Tower
78/82/81 (B2 mostly closed in the Tower). The table below is the earlier baseline.

After the Soul Tether, one soul per boss, Awakening, the B/A/S retune, Constitution feeding the army, the tier advice
refit and Throne-strength Trials:

| Mode | Gate clears | Tower | Rift | Other |
|---|---|---|---|---|
| market | 91 / 91% (B 82-88% at Lv16, A 68-80% at 19, S 80-85% at 27) | 80 / 81 | 31 / 31 | raises answered ~20% of attempts |
| full | 90-91% | 88 | 13 | sieges 86%, rival 79%, raids ~77%, awakening ~7 ranks, ~10 Trial hearts a bot, ~60k gold on awakening |
| builds (market, 7700) | Will+Con 94%, Will+Str 94%, Will+Int 95% | 78 / 87 / 87 | 19 / 40 / 37 | Constitution trails in the endless modes |

Gold at day 100 (before Awakening and headstones): ~33-39k average held, ~1.1M lifetime in `full`.

## 4.3 What we have learned

1. **Combat is alpha-strike.** Strong bots end most rooms in one action, so level offsets barely move results, and
   turn-count scores floor out around 4 for an over-leveled player. Design that relies on long fights only works where
   the player is not far ahead. (Gap G2.)
2. **One-shots hid everything.** Before the tether, ~97% of hero deaths from the B gate on were one blow at full HP (foe
   hits 0.8-1.1x max HP at B-S, 1.6x in the Tower, 5x in the Rift), so foe attack barely moved those gates. With the
   tether, foe attack matters again (B/A/S `foeAtk` 5.2 / 4.2 / 4.5).
3. **Stacked multipliers become walls.** Foe multipliers stacked past ~3x HP per hit stop being harder and start being
   impossible. Prefer rules (an extra elite, a phase sooner, an affix) over bigger numbers.
4. **Bots farm the S gate ~15 levels over.** Its losses were back-row one-shots, so S looked easy only because it was
   farmed; at its Recommended level it is on target.
5. **Late income outruns every capped sink.** Tempering stops once every line is at its best, mausoleums cap at five,
   buildings at three levels. Headstones and Awakening now absorb a lot (~186k and ~60k a bot), but income keeps growing
   with level and difficulty. (Gap G10.)
6. **Constitution needed an army hook.** It was the one stat that gave the army nothing; 1% minion HP per point fixed the
   gates, and it still trails in damage-decided endless modes.
7. **Bosses stacked before one soul per boss.** Armies ended as ten or more Pale Sovereigns and no vanguards.
8. **The Recommended-level model drifts.** `gateRec` shifts the measured `REC_BASE` with the tuning; a test fails once
   the shift passes `REC_DRIFT` (2 levels), and then the gate must be re-measured.

## 4.4 Known problems and open questions

| # | Problem | Status / idea | Roadmap |
|---|---|---|---|
| B1 | `market` sits a few points over the ~85% target on gates (91% after the Con change) | Kits landed (R1 PR B) and E/D were retuned to stay near 90%: the kit-aware bot plays them well. Revisit once boss kits (R2) add their share | R1, R2 |
| B2 | Constitution builds trail Strength and Intelligence builds by ~10 Tower floors and ~20 Rift depths | Damage types and foe kits give Con-heavy builds a role (outlasting attrition kits) | R1, R11 |
| B3 | Late gold surplus | Economy round: income curve and open-ended sinks that connect systems | R4 |
| B4 | The `full` bot's Rift depth (~13) is far below `market` (~31) because it spends days elsewhere | Measure the Rift with a dedicated probe, not the 100-day average | R9 |
| B5 | Trial scores floor out for over-leveled players | Trials now use Throne strength and a fair level per tier; Trial foes carry kits since R1 PR B. Revisit with boss kits | R1, R2 |
| B6 | Balance has never been checked by a human | The tool exists (R15 PR B): play log export and `run-balance.js {"log":...}`. No human log has been reviewed yet; add a row to the log below for each one | R15 |
| ~~B7~~ | Daily quest is a free stat point a day (~100 points over a game) | Closed by R5 PR B: daily orders, only a Hunt pays the point | R5 (ride-along) |
| B8 | Hero could carry rooms alone, then fell far behind the army late | Closed by Command (PR #5): the hero draws on the army's power | R0 shipped |

## 4.5 Levers

| Lever | Where | Moves |
|---|---|---|
| `DIFF.hp`, `DIFF.atk`, `DIFF.gate[]` | `game-data.js` | Foes and minions together |
| `DIFF.armor[]`, `DIFF.foeAtk[]` | `game-data.js` | Living foes only: fight length and danger per gate |
| `DIFF.xpBase`, `DIFF.xpExp`, `DIFF.farm*` | `game-data.js` | Leveling pace, farming falloff |
| `REC_BASE`, `REC_AT`, `REC_TIER` | `game-data.js` | The advice shown to players (re-measure when the drift test fails) |
| `HEAT` | `game-gate-rules.js` | Hard / Brutal / Nightmare foe and reward multipliers |
| `TW` | `game-data.js` | Tower growth, armor, attack |
| `RIFT_*` | `game-skills-market.js` | Rift depth scaling and drops |
| `TETHER`, `SB_TAKE` | `game-faith-story.js` | How much the front row protects you; Guard's cost |
| `CON_*`, `STR_*`, `INT_*` | `game-player.js` | What each stat point gives |
| `RAISE_*`, `SHATTER_*` | `game-runs.js` | Army growth and loss |
| `SIEGE_*` | `game-phases-town.js` | Siege strength and pay |
| `RIVAL_*` | `game-rival-trials.js` | Rival strength, schedule, stash |
| `ARC_*`, `RECL_K`, `BOOK_K` | `game-rival-arc.js` | The rival's war: chapters, their siege, their gate, the Reckoning |
| `TRIAL_*` | `game-rival-trials.js` | Trial strength, par, hearts |
| `AWAKEN_*`, `TEMPER_*`, `HEAD_*`, `MAUS_*` | `game-phases-town.js`, `game-faith-story.js` | Late gold sinks |
| `COMPOUNDS`, `MARK`, `CORPSE_CONDS` | `game-skills-market.js`, `game-gate-rules.js` | Army depth |
| Capstone and pact constants | `game-progression.js` | Paths and New Game+ |
| `NGP_FOE`, `REC_NGP`, `ASC_*` | `game-data.js`, `game-asc.js` | Foe growth per ascension level (+15%), how far the advice moves with it, and each rule's cost and reward |

### Ascension probe (R10, 2026-11-27)

`node tests/run-balance.js '{"seed":7700,"bots":20,"modes":["market"],"ngp":N,"asc":[...]}'` starts each bot as a fresh save at
ascension level N (no carried unique, titles or bestiary, so it is the hard case). First cycle for reference: 89%.

| Probe | Clears | Tower |
|---|---|---|
| NG+1, no rules, advice not moved | 82% | 78.7 |
| NG+3, no rules, advice not moved | 30% | 48.6 |
| NG+3, `REC_NGP` .2 / .5 / 1 | 74% / 92% / 95% | 76.8 / 78.6 / 74.6 |
| NG+1 (`REC_NGP` .5) | 90% | 78.0 |
| NG+1 + Two Faces, Elite Doors, Crowded Gates | 82% | 79.0 |
| NG+1 + Hungry Ledger, No Retreat, Deep Scars, The Book Hungers | 90% | 78.6 |
| NG+1 + Thin Tether, Kits Plus, Heavy Souls | 89% | 78.1 |
| NG+1 + Cold Town, Black Omens, Iron Market, Blood Price, Wandering Masters | 90% | 78.7 |

`REC_NGP` .5 keeps cycles at the first cycle's clear rate when the bot enters at the advice. The gate rules (Two Faces,
Elite Doors, Crowded Gates) cost about 8 points together; the rest cost under 1 point for the market bot, which uses
no Retry, few potions and little forging, so their rewards roughly pay them back.

## 4.6 How to measure

```sh
node tests/run-balance.js                                   # market, default seed
node tests/run-balance.js '{"seed":9100}'                   # the second seed (always run both: results swing ~±7 points per seed set)
node tests/run-balance.js '{"modes":["market","full"]}'     # both modes
node tests/run-balance.js '{"modes":["full"],"off":["raid"]}'   # what a system is worth
node tests/run-balance.js '{"byLvl":true}'                  # clear rate by hero level (Recommended levels)
node tests/run-balance.js '{"tiers":{"gates":[3,4,5],"heats":[1,2,3],"near":20,"every":3}}'   # tier advice probe
LOTD_HTML=/path/to/tuned/index.html node tests/run-balance.js   # test a tuned copy without committing it
```

- Each mode takes ~70-120 s; the machine has 4 cores, so run seeds and modes in parallel.
- `"stats":[...]`, `"mods":"a"|"b"`, `"mod":"skill:a"`, `"faith"`, `"ult"`, `"heat"` measure builds and choices.
- A mid-line `//` comment silently swallows the code after it on a one-line statement: use `/* */` (the lint catches it).
- Write every new measurement next to the constant it justified, and add the headline numbers to 4.2.
- When a round adds a system, teach the `full` bot to use it and add an `"off"` switch, so its worth can be measured.

## Play logs reviewed (R15)

Each human play log (Records, Export play log) replayed with `node tests/run-balance.js '{"log":"file.json"}'` gets a row.

| Date | Log | Runs | Human / bot clear at matched levels | Notes |
|---|---|---|---|---|
| 2026-11-27 | `tests/fixtures/play-log.json` (a scripted careless player, not a human: strikes only, no skills or gear) | 72 | 14% / 93% | Format check only. It shows what the replay reports: deaths the bot avoided, doors, never-opened tabs |
