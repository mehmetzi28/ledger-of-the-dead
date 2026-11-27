# R15. Modes and playtest logs

**Priority** P3. **Closes** G27, B6. **Size** L. **Needs** nothing.
**Pillars served**: 7 (a long game, replayed), and the project rule that balance is measured, never guessed (B6: never
checked by a human).

## 1. The problem

- One way to play: three save slots, every rule fixed except gate difficulty and pacts.
- All balance comes from bots. There is no record of how a human plays (where they die, what they ignore, how long a run
  takes), so bots and humans may disagree and nobody would know.

## 2. Ironman

- A save slot flagged at creation (cannot be turned on later or off ever).
- Autosaves after every action; no Retry; a lost room costs the run's whole spoils (not just the room's) and one random
  minion that fell in it shatters (no roll).
- Nothing else changes (no extra difficulty): the stakes are the mode.
- Its own titles: *Iron Keeper* (clear the Throne), *Iron Book* (finish R3's ending), *Iron Climb* (Tower 100).
- The save list shows an iron badge and the deaths count.

## 3. Seeded challenges

- A **challenge code** (base-36: seed + rules) creates a new game with the same valley: same dawn rolls, the same first
  rooms, the same market stock. Rules in the code: starting difficulty, pacts, ascension rules (R10), Ironman.
- Local only: the player types or copies a code; nothing is sent anywhere.
- A challenge game records its code in the Records, with its result and the day.
- Implementation note: the game's `Math.random` calls become a seeded stream (`rng()`), already the pattern in
  `siegeGap`; this also helps tests (deterministic fuzz).

## 4. Custom difficulty

Sliders at new game (and in the Codex while playing, if the save is custom):

| Slider | Range | Default |
|---|---|---|
| Foe HP | 50-200% | 100 |
| Foe attack | 50-200% | 100 |
| Raise chance | 50-150% | 100 |
| Gold | 50-200% | 100 |
| Year length | 60-140 days | 100 |
| Siege frequency | off, 50-150% | 100 |

Any slider below 100% (or above for raise and gold) marks the save **Custom**: titles off, Records flagged. A "Story" preset
(foes 60%, raise 130%) and a "Hardened" preset (foes 150%, gold 75%) for quick choice.

## 5. The play log

An opt-in, local record of play, kept in its own storage key (not the save), capped at ~2 MB with the oldest runs
pruned.

| Logged | Per |
|---|---|
| run: gate, difficulty, rooms, outcome, real-time length, actions | run |
| death: room, the blow, its move, its intent shown or not, HP before | death |
| choices: doors, events, orders, skills cast | room |
| town: what was bought, built, crafted; time spent per tab | day |
| systems never opened (Codex pages, tabs, buildings) | game |

- Exported as a JSON file from the Records ("Export play log"), and cleared from there. Never uploaded anywhere.
- A **How I play** page reads it: deaths by cause, average actions per room vs the bot's at the same level, systems never
  used, time per run.

## 6. Bot replay of a log

`node tests/run-balance.js '{"log":"play-log.json"}'`: for each logged room, the bot plays the same seed and level and
reports where its choice differed and how it went. Summary: the human's clear rate vs the bot's at matched levels, deaths
the bot avoided, systems the human never used. This is how a human check reaches balance (B6). A note in 04-balance.md
records each log reviewed.

## 7. Save

Ironman: `S.iron = true`, `S.ironDeaths`. Challenge: `S.code`. Custom: `S.custom = {foeHp, foeAtk, raise, gold, year,
siege}`. Log: separate key `lotd-log`. All optional; old saves unaffected.

## 8. UI, Turkish, Codex

New game page with mode cards (Normal, Ironman, Challenge code, Custom); the How I play page in the Records. ~90 strings.
Codex: Modes, Challenge codes, Play log (what it records, that it stays local).

## 9. Tests

`107-modes`: Ironman forbids Retry and autosaves; a challenge code reproduces the same first rooms and market; custom
sliders apply and mark the save; the log records and prunes; the export is valid JSON; the bot replay runs on a fixture
log.

## 10. Risks

- **Seeding every random call is a large refactor**: do it per system with tests; unseeded calls stay `Math.random` until
  moved, and the challenge promise covers only seeded systems (listed in the Codex).
- **Privacy**: the log never leaves the device; the export is a file the player chooses to share.

## As built (PR A: Ironman and custom difficulty)

- **Code**: `src/game-modes.js` (new, after game-siege2.js); `newGameMode(mode, custom)` wraps `newGame`.
- **Ironman** (`S.iron`, `S.ironDeaths`): set at New game and never changed after; it carries into New Game+. No
  Instant Retry (`canRetry`), no saving to a slot (`slotWrite`). Autosave is unchanged (the game already saves after every
  action). A fall (`ironFall`, from `defeat`, not in the weekly dive or a siege) takes back the run's banked gold
  (`r.goldTot`), its trophies (`r.trTot`, counted only in Ironman) and its gear (`r.spoils`), and one minion downed in that
  room shatters with no roll (into the Memorial). Titles: Iron Keeper (the Throne), Iron Book (end a cycle), Iron Climb
  (Tower 100), each only in an Ironman game. 218 titles.
- **Custom difficulty** (`S.custom = {foeHp, foeAtk, raise, gold, siege}`, whole percentages in steps of 10, written only
  when not all 100): foe HP and attack in `foeScale`, raise chance at the end of `raiseChance`, gold in `bankLoot`, siege
  frequency in `siegeGap` (0 turns sieges off through `siegeOpen`; otherwise 50-150%). Easing any (foes or sieges below
  100, raise or gold above) is Custom: `checkTitles` earns nothing. Presets Story (foes 60%, raise 130%) and Hardened (foes
  150%, gold 75%; earns titles).
- **Not built**: the doc's "Year length" slider (the game has no year).
- **UI**: New game in Settings opens mode cards (Normal, Ironman, Story, Hardened, Custom) with +/- steps for each
  setting; the save list and Settings show the mode (Ironman with its falls; Custom or Harder). The Codex has a Modes page.
- **Bot**: `"iron":true` and `"custom":{...}` probes.
- **Tests**: `tests/groups/98-modes.js` (4 tests).
- **Measured** (market bot, seed 7700, 40 bots): Normal clears 95% of rooms (Tower 84, level 53.9 on day 100). Ironman
  clears 85% (Tower 77.4, level 50.8): losing whole runs' spoils and a minion per fall slows the climb, as intended,
  without changing a rule. Story clears 99% (Tower 88.2, Rift 41 deepest against 21).
