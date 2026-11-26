# 1. Vision and pillars

## The pitch

You found a book in a drowned chapel. When you wrote your name in it, every grave in the valley turned over. **Ledger of
the Dead** is a single-player, turn-based necromancer RPG that runs in one HTML file in the browser. You fight through six
gates, raise what you kill, and grow an army of the dead that fights beside you, evolves, bonds, grieves, leads raids
and holds your walls. Behind the gates wait a 100-floor Hell Tower, an endless Rift, weekly Trials, a rival keeper and
New Game+, and running through all of it is the story of the Ledger itself and the keepers who held it before you.

## The player fantasy

- **"Everything I kill can become mine."** Every body is a choice: raise it, explode it, or leave it. The army is
  built from what you defeated, so what you fought shapes who you are.
- **"My dead are people."** Minions have names, traits, evolutions, bonds and a Memorial. Losing one matters.
- **"The Ledger knows."** Study a foe and the book shows you more: its drops, its next move, what answers it, what
  waits behind a door. Knowledge is power you earn by killing.
- **"I am the keeper, not the hero."** You stand in the back row. Your front line, your Soul Tether, your orders and
  your timing keep you alive, not your armor.

## Design pillars

These decide arguments. An idea that serves two pillars beats one that serves none.

1. **The army is the character.** The hero is the hand that writes; the army is the body. Systems should flow through
   the dead (raising, traits, evolution, gear-bearers, bonds, the tether) rather than around them. A new feature that
   makes the army matter less is suspect.
2. **Every death is a resource.** Kills give XP, gold, trophies, drops, bestiary knowledge, bodies, souls and conditions.
   New content should add to what a kill can mean, and how a foe dies should keep mattering (corpse conditions).
3. **Read the fight, then answer it.** Foes show their intent, bosses telegraph, doors show what waits, the defeat recap
   names the answers you didn't use. Danger should be visible and answerable; randomness should never be the only reason
   you lost. (This is why the Soul Tether exists: 97% of late deaths were one unanswerable blow.)
4. **Knowledge compounds.** The bestiary, records, titles, the Memorial and the story survive New Game+. Long play is
   rewarded by understanding, not only by numbers.
5. **Nothing is taken for good without a choice.** Sieges damage, never delete. The rival borrows a page, never burns it.
   Shattering is the one true loss, and Will, traits and gear soften it. Big losses must be earned by the player's own
   risk.
6. **The valley is a calendar.** Three watches a day; dawns bring curses, omens, bounties, raids coming home, sieges, the
   rival's schedule, weekly Trials and faith devotion. The day is the spine that connects systems; new systems should
   hang off it.
7. **Grim, worn, hand-made.** Dark palette, painted textured icons, no cartoon look, no italics, synthesized sound and
   music, no image files, no CDNs. Blue and purple belong to Rare and Epic (mana is the one exception).
8. **Measured, not guessed.** Every number is checked by the balance bot against stated targets, and the measurement is
   written next to the constant.

## The loop at each time scale

| Scale | What the player does | What it feeds |
|---|---|---|
| **A turn** (seconds) | Pick a target, Strike / Siphon / Ward / a skill / a potion / Guard; give free orders; watch intents | Kills, souls, statuses, combos, corpse conditions |
| **A room** (a minute) | Win the fight, then raise bodies, pick a door, answer an event | Army growth, XP, loot, bonds (25 rooms) |
| **A run** (a few minutes) | Four rooms and a boss through one gate (or a Tower floor, a Rift dive, a Trial) | Gate clears, uniques, hearts, records, quest |
| **A day** (3 runs) | Spend watches; shop, forge, salvage, build, fuse, order raids; nightfall brings raids and sieges | Calendar systems, economy |
| **A week** | Rival challenge (~14 days), Trial (weekly), devotion steps, siege every 7-10 days | Mid-term goals |
| **A playthrough** (~100 days) | Clear six gates, climb the Tower, open the Rift at level 40 | Titles, bestiary, story acts |
| **The long game** | New Game+ with pacts, Tower past 100, Rift depth, all titles, all pages | Mastery, collection |

## Audience and platform

- One player, offline, any modern browser; one shipped `index.html` (about 1.3 MB) built from `src/`.
- Keyboard and mouse or touch. English and Turkish.
- Sessions can be short (a run is a few minutes, the save happens after every action) or long.
- No accounts, no server, no monetization. **The game is not published or deployed** unless Mehmet asks.

## What the game is not

- Not real-time. Turns are the core; animations never gate input.
- Not a hero brawler. The hero alone should not carry the late game (the "hero power scales with army strength" round
  exists to keep it that way).
- Not a grind for its own sake. Farming far below your level pays less (`farmK`); outgrown content should either be
  fast to clear or pointless to farm.
- Not online. No leaderboards that need a server; seeded challenges stay local.
