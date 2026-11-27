# 3. How the systems connect

This page maps what feeds what, so new work connects systems instead of adding islands. The numbered gaps at the end
(G1, G2, ...) are referenced by the roadmap: a round lists the gaps it closes, and when it ships, the gap is struck
through here with the PR number.

## 3.1 Resource flows

```mermaid
flowchart LR
  subgraph Fight
    KILL[Kill]
  end
  KILL -->|XP| HERO[Hero level<br/>stats, skills]
  KILL -->|body + condition| RAISE[Raise]
  KILL -->|gold| GOLD[(Gold)]
  KILL -->|trophies, hearts| TRO[(Trophies)]
  KILL -->|drops| GEAR[(Gear)]
  KILL -->|kill count| BES[Bestiary mastery]
  KILL -->|Souls| ULT[Ultimate]
  KILL -->|torn pages| STORY[Story]
  RAISE --> ARMY[Army]
  ARMY -->|room XP| EVO[Evolution, marks]
  ARMY -->|25 rooms| BOND[Bonds]
  ARMY -->|elite/boss Commander| RAID[Expeditions]
  ARMY -->|front row| TETHER[Soul Tether]
  ARMY -->|shatters| MEM[Memorial]
  BES -->|raise %, damage, levels| RAISE
  BES -->|second intent, answers| FIGHTUI[Foe cards]
  BES -->|door sight| DOORS[Doors]
  GEAR -->|salvage| DUST[(Bone dust)]
  GEAR -->|sell| GOLD
  GEAR -->|armed kinds| ARMY
  TRO -->|sell| GOLD
  TRO -->|forge 6| GEAR
  TRO -->|brew 4| POT[Potions]
  TRO -->|hearts| AWAKEN[Awakening]
  GOLD --> MARKET[Market, Altar, salts, bag]
  GOLD --> TOWN[Buildings]
  GOLD --> AWAKEN
  GOLD --> MEM
  DUST --> TOWN
  DUST --> ENCH[Enchant]
  DUST --> AWAKEN
  TOWN -->|perks| SIEGE[Sieges]
  TOWN -->|slots, Reserve| ARMY
  SIEGE -->|gold, dust, gear| GOLD
  RAID -->|gold, gear, minion XP| GOLD
  TRIAL[Weekly Trials] -->|boss hearts| AWAKEN
  RIVAL[Rival] -->|steals bodies| RAISE
  RIVAL -->|borrows pages| STORY
  MEM -->|honour, headstones, mausoleums| ARMY
```

## 3.2 System by system

| System | Takes from | Gives to | Notes |
|---|---|---|---|
| Combat | Hero stats, skills, army, gear, statuses, omens, curses, difficulty | Kills, Souls, corpse conditions, records, tallies | Everything ends here; most time is spent here |
| Raising | Bodies, mana, Will, salts, Ossuary, bestiary, corpse condition, omen | The army, titles, tallies | One soul per boss limits boss stacking |
| Army (traits, evolution, marks, fusion, bonds) | Raises, room XP, Bone Altar gold, fusion gold | Combat power, tether, raids, siege wall, titles | The deepest web in the game |
| Bestiary mastery | Kill counts | Raise chance, damage, raise levels, foe-card info, door sight, titles | Kept through NG+ |
| Gear and uniques | Drops, market, forge, raids, sieges, bounties, rival | Hero and gear-bearer stats, unique flags, sets | Rolls, reforge, enchant, temper |
| Awakening | Gold, dust, boss hearts (kills, Trials) | Unique stats | Hearts tie bosses and Trials to the endgame |
| Trophies | Kills | Gold, forged gear, potions, hearts | Tower trophies only sell (G11) |
| Town buildings | Gold, dust, clears, sieges, raids, oath | Slots, Reserve growth, raise %, mana, study, kept bodies, potions, brewing, raids, devotion, siege perks | Eleven buildings to level 5 with forty specializations (R5 PR A) |
| Bounties | Tallies of any activity | Gold, salts, dust, gear | Good glue: reads many systems |
| Expeditions (R6) | Commander minions, squad roles, damage types, bonds, curses, the Tower, the bestiary (mastery), banners | Gold, gear, trophies, hearts, bone dust, minion XP, the Embalmery, dread, Memorial, titles | Three steps a night and a dawn choice (G17 closed); Rally ties the Commander to every fight (G8 closed) |
| Sieges | Town levels, calendar, dread band, Bell Tower defenses, Reserve wall, guard choice | Gold, dust, gear, building damage, dread | Fixed roster (G23) |
| Rival | Calendar, your army's main role, your bodies, sieges, the Reserve | Legendary, gold, page loss or fine, Reclaimed bodies, wagers, story | A five-chapter arc with an ending (R7): their gate, the Reckoning, the rival's book or an ally in NG+ |
| Trials | Throne clear, curses, tiers, seed | Gold, dust, hearts, records | Good: pays the Awakening economy |
| Faith (the pantheon) | Kills, healing, raises, trophies, Siphon, headstones, the Memorial, shrines | Boons by rank, vows, conversion, titles, story, omen forecast/call/ward, Temple chapels, dread, sieges, commissions | |
| Omens | Calendar | Rule changes for a day, titles | Not forecast or caused (G20) |
| Curses | Calendar, cleared gates | Harder runs, more reward, titles, bounty | Ten curses (G24 closed by R13) |
| Hell Tower | Level 10, 3 clears | 12 uniques, titles, story, abyss gold | Wardens reuse gate moves (G3) |
| Rift | Level 40, Throne, sigils, the Memorial (events) | Legendaries, Riftborn gear, Rift Shards (attunement, secret hearts for the Heartforge), records, titles, story (the other half) | - |
| Titles | Tallies, records, everything | One worn bonus, collection gold | 148 titles, small effect (G26) |
| Memorial | Shattered and raid-fallen minions | Honour buff, headstones, mausoleums | Strong emotional link |
| Story and pages | Clears, milestones, page drops | Lore, rival stakes | Missing ending (G16) |
| NG+ | Throne clear | A new cycle with carried knowledge and ascension rules that touch gates, doors, town, omens, market and army | One gate rewritten per cycle; no cycle curse yet (R13) |

## 3.3 Strong links to keep

These are the connections that make the game feel like one thing. Don't break them; build more like them.

- **How it died decides what it becomes**: kill method -> corpse condition -> raise chance and death trait.
- **Knowledge is sight**: kill counts -> mastery -> foe intents, damage figures, answers, door previews, raise bonuses.
- **Your dead are your armor**: front row -> Soul Tether; Constitution -> minion HP; Guard; Taunt.
- **Theft and reclaim**: the rival steals your best body -> fields it against you -> you kill it and get the body back.
- **Loss becomes a monument**: shatter -> Memorial -> honour, headstones, mausoleums -> army strength.
- **Bosses keep paying**: boss hearts from kills and Trials -> Awakening of that boss's unique.
- **Nightfall ties the day together**: raids march, sieges come, the Reserve guards the wall, dawn brings them home.
- **Bounties read everything**: kills, elites, raises, arches, orders, floors, poisonings, the cursed gate.

## 3.4 Weak or missing links (the gap list)

Each gap names the systems involved and why it matters. The roadmap's rounds reference these numbers.

**Combat depth**

- ~~**G1. Foe kinds have no identity.**~~ Closed by R1 PR B: sixteen foe kits, one per kind, shown on the card by mastery
  tier, listed in door lore and the Codex; weakness kills raise the Undone with an echo of the kit. (Was: The 42 gate foes share their role's stat factors; only the Whisper Choir does
  something of its own. Learning a foe in the bestiary reveals numbers, not behavior, so "read the fight" has little to
  read in ordinary rooms. (Combat, bestiary, doors, corpse conditions.))
- ~~**G2. Strong players alpha-strike.**~~ Closed in part by R1 PR B: kits give rooms at your level something to read
  (shields, marks, burrows, banners, bombers) and the bot now targets by kit; outgrown rooms are swept instead of
  clicked. Boss fights stay for R2. (Was: The bots end most rooms in one action once ahead; turn-based Trial scores floor
  near 4; orders, statuses and combos rarely matter in content you have outgrown. Stacked foe multipliers above ~3x HP per
  hit become walls instead of puzzles. (Combat, difficulty, Trials.))
- ~~**G3. Bosses have one move.**~~ Closed by R2: the six gate bosses, the rival and the Inquisitor Captain fight with move
  sets, twists and hazards (PR A); secret masters have their own kits and a half-HP rule, wardens a signature each (PR B). (Was: Six gate bosses, ten wardens, six secret masters and the rival share seven moves
  between them; wardens and secret masters reuse the gate moves, the rival only has Royal Decree. (Bosses, Tower, secret
  masters, rival.))
- ~~**G4. No damage types.**~~ Closed by R1 PR A: five types, place profiles, typed affixes, resistance and damage bonus lines.
  (Was: Frost, fire, rot and shadow exist as flavor (Rimeborn, Cinderborn, blight, the Eclipse's
  "shadow"), but nothing resists or is weak to them, so gear, affixes, traits and skills cannot specialize against a gate.
  (Combat, traits, gear, omens, bestiary.))
- ~~**G5. Outgrown content is slow.**~~ Closed by R1 PR B: Sweep wins an outgrown Normal gate run for one watch at 80%
  kill XP. (Was: Farming far below your level pays less but costs the same clicks; there is no quick
  resolve for rooms you cannot lose. (Combat, raids, calendar.))

**Army**

- ~~**G6. The Reserve is only storage.**~~ Closed by R5 PR A: the Charnel Yard trains the Reserve each dawn (Bone Pits up
  to the army's top level), the Grave Market sells a benched minion, and Yard minions on the siege wall have more HP.
  (Was: benched minions did not grow or do anything.) (Reserve, town, sieges.)
- ~~**G7. Most minions cannot use gear.**~~ Closed by R12: every minion takes a charm made from trophies, a unique on a
  gear-bearer gives the minion its power, Elder minions gain an active order and a specialization, and the Hexer is a
  fifth role. (Gear, army, uniques, commands, crafting, Memorial.)
- ~~**G8. Commander only matters for raids.**~~ Closed by R6: a Commander in your army gives a free Rally once a room
  (+20% minion damage or a condition off every minion), and an Elder Commander lengthens Taunt and strengthens Bone Shield.
- **G9. Hero power vs army strength.** ~~The hero alone can still carry rooms.~~ Closed by Command (PR #5): the hero's
  Strike, Siphon and HP grow from the army's three strongest minions.

**Economy and town**

- **G10. Late gold outruns every sink.** ~1.1M lifetime gold in the full bot; most sinks are capped (buildings, bag,
  salts, tempering lines, mausoleums); headstones are the only open-ended one and are softly capped at 6%. (Economy,
  town, Awakening.) (R4 adds heart-forging, a soft cap on late kill gold, brewing, commissions and a black market; the full bot now spends
  ~60k a game on forging and brewing, see 04.)
- **G11. Some loot is dead-end.** Tower trophies (40 gold, sell only), Tower and secret-master hearts beyond Awakening,
  and abyssal floors that pay generic legendaries. (Trophies, Tower, secret masters, crafting.) (Mostly closed by R4 PR A:
  every boss, warden, master and Hunger heart forges a heartforged piece, and six Tower trophies forge Throne-set gear;
  abyssal trophies are still to come.)
- ~~**G12. The town is small and finishes early.**~~ Closed by R5 PR A: eleven buildings of five levels (4-5 after the
  Throne, 30k and 60k gold), forty specializations, and the new buildings touch study, bodies, potions, brewing, raids,
  the oath, the rival and every siege. (Was: four buildings, three levels, done by mid-game.) (Town, sieges, raids,
  faith, Reserve.)
- ~~**G13. The daily quest is not a choice.**~~ Closed by R5 PR B: once a building stands, three daily orders replace
  it; only a Hunt pays the stat point, the others pay dust, a raise bonus, Yard training, calm, a Tower trophy or gold.
  (Was: 8 kills, 4 rooms, 1 clear, always done.) (Quest, calendar, bounties, commissions, the Tower, the Yard.)
- ~~**G14. Consumables are thin.**~~ Closed by R4 PR B: oils, incense, bone charms, war banners and two draughts brewed
  from role parts, a growing belt and run prep on the Gates tab. (Was: two potions and salts, belts of three.)
  (Market, trophies, brewing, combat.)
- ~~**G15. The town's fear has no memory.**~~ Closed by R5 PR B: the dread meter remembers raising, raids, building,
  sieges, commissions and tithes, and its band moves prices, pedlars, the siege gap, strength and pay, the black market
  and the dawn (mourners, tribute, Plunder). (Sieges, market, raids, commissions, events, the Embalmery.)

**Content and modes**

- ~~**G16. The story has no ending.**~~ Closed by R3: act VI and Vane Abbey lead to the Hunger, and the last page lets
  the player close the book or keep writing, each with an epilogue, a title and its own New Game+. Five acts and twenty pages build to "write your name and close the book, or keep
  writing", and the game does not let the player choose. Tower floor 100 makes the book "whole" with no consequence.
  (Story, pages, Tower, secret masters, NG+.)
- ~~**G17. Raids are one dice roll.**~~ Closed by R6: expeditions to gates, the day's cursed gate, Tower bands, hunts and
  scavenges, three steps a night covered by roles, types and bonds, carried spoils and a dawn choice (press on, the risky
  path, come home), road events. Not yet: difficulties, the Rift, the rival's stash (R7) and Vane Abbey as targets.
- ~~**G18. Faith is a binary with a static buff.**~~ Closed by R8: five gods, devotion by deeds, vows, boons by rank,
  shrines per god and passages (PR A); gods foresee, call and ward omens, open Temple chapels and move dread and sieges (PR B).
- ~~**G19. The rival has no arc.**~~ Closed by R7: five chapters (wagers, their siege, their own gate built from your
  stolen dead, the Reckoning) and an ending you choose: end them for their book (three uniques, a set) or spare them for
  an ally in New Game+ (a weekly body trade, a siege's first wave).
  (Rival, story, NG+, raids.)
- **G20. Omens are weather, not choices.** Nothing forecasts, calls or wards off an omen, and the town never reacts to
  one. (Omens, faith, town, calendar.)
- **G21. New Game+ is the same content harder.** (Part closed by R3: the Quiet Valley and the Keeper's Cycle, Ledger
  inscriptions and Ledger-form bosses.) Closed by R10: 15 ascension rules, picked per cycle and kept, reach
  gates, doors, kits, ultimates, the town's dread, sieges, omens, the market, forging and the army; each cycle rewrites one
  gate (Ledger-form boss, Ink-Wet kinds); carries tie Riftborn, forging, buildings and traits to the next cycle; pacts add
  rules; the two endings change the picks. Open: no cycle curse yet (R13). (NG+, story, content.)
- **G22. The Rift only scales.** Closed by R9: sigils to choose before a dive, guardians every fifth depth, Rift Shards
  (PR A); Riftborn gear with rift powers and attunement, the weekly seeded dive, Rift events and the other half's four
  pages (PR B). (Rift, gear, records.)
- **G23. Sieges never change.** One roster, three waves, the same Captain; the Inquisition has no story that escalates
  with your wins and losses. (Sieges, story, town.)
- ~~**G24. Curses and events repeat.**~~ Closed by R13: ten curses, twenty events (ten in R13, touching dread, faith,
  omens, traits, the Reserve, commissions and the rival), six chains (three tied to their gates, three steps each) and
  nemeses that remember your dead. (Curses, events, Trials, nemeses.)

**Hero and meta**

- **G25. Hero builds are narrow.** (Closed by R11: every path has five skills and a signature at level 40, eight actives
  with two runes each, five ultimates, Constitution's Endurance; the Library's respec came with R5.) Still open: the
  Constitution build's Rift depth trails Intelligence (B2). (Skills, paths, stats.)
- **G26. Titles are mostly a list.** 148 titles but only the worn one does anything, and its bonus is small; collection
  pays only gold. (Titles, meta.)
- **G27. Balance is measured only by bots.** No record of how a human plays (deaths, time per run, what they ignore)
  that a playtester could send back. (Tooling.)

**Missing systems** (found 2026-11-26 when the roadmap was deepened; each is a whole system the game lacks, not a weak
link between existing ones)

- **G28. The valley is a list, not a place.** Gates, Tower, Rift and town are cards; the lore's river, roads, villages
  and chapel are never somewhere the player stands. Watches have no geography. (Map, travel, story.) R19.
- **G29. The living are faceless.** They exist only as siege waves; there is no one to trade with, help or prey on, so
  dread and raising have no moral or economic face. (Villages, dread, raising.) R20.
- **G30. Power has no personal cost.** The hero's body and kit never change with what they do; the Ledger's corruption
  of its keeper is only lore. (Hero, faith, story.) R21.
- **G31. Minions can be shaped but never designed.** Every minion is a foe that rose; spare bodies and trophies have no
  creative use. (Army, crafting, trophies.) R22.
- **G32. A fallen minion's line ends.** The Memorial remembers names, but nothing of what a minion was carries into the
  next raise of its kind; raising is only a dice roll, never a slow craft. (Memorial, raising, Embalmery.) R23.
- **G33. The keeper does everything personally.** No one but the hero (and a raid squad) works; no succession for the
  book. (Late game, endings, town.) R24.
- **G34. The year is flat.** 100 days with no seasons; omens are the only daily variation and are unconnected to time.
  (Calendar, omens, garden, map.) R25.
- **G35. A failed raise is a dead end.** The body is gone; Souls exist only inside a run. (Raising, Souls, gear.) R26.
- **G36. Minions are never tested on their own.** The Reserve and the army's builds have no stage of their own. (Army,
  Reserve, commands.) R27.
- **G37. The hero's deaths are pure loss.** A counter remembers them; nothing else does. (Defeat, hero, story.) R28.
- **G38. The player never defends a dungeon.** Sieges are fixed battles at the walls; the town's treasure is never at
  risk in a way the player designs against. (Town, Reserve, economy.) R29.
- **G39. No long project that ties systems.** Progress is split across a dozen places; nothing lets the player pay one
  system's resource to improve another's rules. (Meta, Library, every system.) R30.
