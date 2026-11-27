# R17. Presentation: music, stage, art

**Priority** P3. **Size** L (two PRs if music grows). **Needs** R1 (types to show), R2 (boss moves to stage).
**Pillars served**: 3 (read the fight: what you see tells you what happens), 5 (mood and story).

## 1. The problem

The game has sound effects (`sfx`), a PixiJS battle stage with particles (`fx.js`) and drawn sprites, but no music, few
effects that say *what kind* of thing happened, no title screen, and minions look the same from raise to Eternal except
for a tag. With R1 and R2, many new rules need to be seen, not only logged.

## 2. Music (procedural, WebAudio)

No audio files (the not-list): music is generated in WebAudio from a small engine (`music.js`): a scale, a tempo, a few
voices (drone, bass, pad, a lead from a motif), and patterns.

| Context | Scale and mood | Voices |
|---|---|---|
| Rat Warren | minor, quick, scratchy | plucked lead, low drone |
| Sunken Crypt | Dorian, slow, echoing | bell lead, water noise |
| Ashen Barrow | Phrygian, driving | low brass-like pad, crackle noise |
| Hollow Cathedral | Aeolian, choral | choir-like pad (detuned saws), organ drone |
| Iron Orchard | whole-tone, uneasy | metallic plucks |
| Throne of Ash | harmonic minor, regal | slow march, low strings |
| Vane Abbey (R3) | Locrian, sparse | a single voice and silence |
| Boss phase one / two | the gate's motif, then faster and higher | + percussion |
| Town | by dread (R5): calm major, terror minor | music box to drone |
| Tower | by floor band | rising pitch every 10 floors |
| Rift | atonal, shifting | randomized motifs |

- Crossfade (1.5 s) on context change; a music volume slider separate from sound; off by default on first launch until
  the player touches the volume (autoplay rules).
- Motifs are short (4-8 notes) and reused across gate, boss and story passages, so the music has themes.

## 3. Stage effects

| Thing | Effect |
|---|---|
| Damage types (R1) | frost shards, fire embers, rot mist, shadow ink, physical sparks on hit; numbers colored by type with a small icon |
| Weak and resist | a cracked-shield pop on weak hits; a dull grey ring on resisted |
| Foe kits (R1) | a small kit icon over each foe; the kit's moment gets a flash (a shield raised, a burrow) |
| Boss moves (R2) | a wind-up pose and a ground marker for telegraphs; the target outlined |
| Phase change | a slow beat (0.4 s at 30% speed), the music shifts, a banner |
| Memorial echoes (R3) | gold-ink outlines and a name plate |
| Crits and executions | hit-stop (60 ms), a screen nudge |

A **Reduced effects** option turns off hit-stop, shake and dense particles.

## 4. Art

- **Evolution by stage**: each stage adds to the sprite: Greater a darker outline, Elder a glow in the role's color,
  Ancient size +10% and particles, Eternal a crown-like halo. Drawn from the same sprite code.
- **Item frames**: Legendary, heartforged (R4), Riftborn (R9) and unique frames on item cards.
- **Title screen**: the drowned chapel at night, the Ledger on a lectern, the save slots as its pages.
- **Epilogue scenes** (R3): two canvas-painted scenes for the endings, built from layered shapes and the palette.
- **Valley map** (optional, see the catalogue): the Gates tab's backdrop as a painted map.

## 5. Feel

- Damage numbers stack and drift rather than overlap; big hits scale up.
- The intent strip animates when an intent changes.
- Minion idle animations by role (vanguard shield shuffle, mender sway).

## 6. Performance budget

60 fps on a mid phone with 12 units on the stage; particles pooled; music engine under 2% CPU; the stage pauses when the
tab is hidden. A frame-time probe in the Codex debug page.

## 7. Save and settings

`settings.music` (0-1), `settings.fx` ('full'|'reduced'), kept in the settings key, not the save.

## 8. Tests

Headless checks only: the music engine builds a graph without errors for every context; every damage type and kit has an
effect entry; every boss move has a stage cue (a table test like `83-boss-kits`); reduced mode turns off hit-stop.

## 9. PR split

- **PR A**: stage effects, type colors, telegraph cues, evolution looks, reduced effects.
- **PR B**: the music engine and themes, title screen, epilogue scenes.

## 10. Risks

- **Procedural music sounds cheap**: keep it sparse, modal and slow; silence is a voice.
- **Effects hide information**: every effect is paired with the log line and the number; the reduced option exists.

## As built

### PR A: what the fight shows
- **Code**: `src/fx-cues.js` (new, after fx.js) holds the tables and readers. Drawing lives in `fx.js` (the overlay and
  the stage) and on the cards (`ui-screens.js`). Two small hooks sit in the rules:
  - `markType` in `hurtFoe`/`hurtAlly` records the biggest hit's type, Weak or Resisted, and an execution in the turn's
    `r.fx` entry.
  - `fxe('typed'|'kit'|'phase')` queues the effects.
  Neither hook draws a random number, so the bots' runs are unchanged.
- **Damage types** (`DT_FX`): each type has a colour (never blue or purple), a 10x10 glyph and a stage burst:
  - physical: sparks
  - frost: shards
  - fire: embers
  - rot: a mist
  - shadow: ink

  On the cards the number takes the type's colour and glyph. A hit on a weakness reads Weak (and is bigger and cracks
  on the stage); a resisted hit reads Resisted (and gets a dull grey ring).
- **Foe kits** (`KIT_FX`): all 16 kits have a glyph, drawn on the kit chip and beside a foe's HP bar on the stage once
  you know the kit. The six kits that act have a moment on the stage:
  - Shieldbearer: a ward
  - Burrower: dust
  - Gravecaller: embers rising
  - Marker: a closing red ring
  - Purifier: green motes
  - Skirmisher: a wisp
- **Boss moves** (`BOSS_CUE`): all 73 moves have a pose (lunge, rear, cast, call, guard) and a target: you, your side,
  your front or back row, one minion, or its own side or itself. While a move gathers, `threatKeys` names the units it
  will land on:
  - The cards mark them Threatened, with the move's name in the tooltip.
  - The stage draws a pulsing red ring under them and the boss holds its wind-up pose.
  - Edict and the Executioner's block name their minion. One-minion moves name the strongest minion they will pick.
  - A locked minion cannot be hit, so it is left out.
- **Feel**:
  - Crits and executions get 60 ms of hit-stop and a nudge.
  - A second phase gets a 0.4 s slow beat at 30% speed and a banner across the stage.
  - Stage numbers stack and drift instead of overlapping; hits over a quarter of max HP are big.
  - A foe's intent that changes pulses for that turn.

  The quiet view (`fxQuiet`: reduced motion, Light effects, or Auto on a phone) turns off hit-stop, the nudge and the
  dense bursts; the Weak pop and the Resisted ring stay. Light effects was already the spec's Reduced effects
  setting, so no new setting was added.
- **Art**:
  - Evolution looks (`evoLook`, inside the icon's markup, so the cards and the stage match): Greater a dark outline,
    Elder a glow in its role's colour, Ancient 10% larger with motes, Eternal a halo.
  - Item frames: unique (a double gold inset), heartforged (an ember glow), Riftborn (a dashed inner edge), Awakened
    (a star after the name).
- **Fixed on the way**: the stage cut a fighter's picture out of its icon with a greedy pattern, so an icon with a role
  badge (now passed for the role glow) lost its picture. The pattern now stops at the icon's own `</svg>`.
- **Measured**: no rule changed. Bots match R16 exactly (market 95% clears, Tower 83; full 94%, Tower 86.5).
- **Tests**: `tests/groups/98-stage.js` (6 tests). Every type, kit, boss move and stage has its cue, and every
  telegraphed move names targets.

### PR B: music, the title screen and the epilogues
- **Music engine** (`scenes.js`, replacing the single pad-and-melody player).
  - `THEMES` holds a theme for each of the seven gates, the Tower, the Rift and the four town dread bands. Each theme
    has a root, a mode, a tempo, a lead voice (`VOICES`: pluck, bell, brass, choir, metal, march, a single voice, a music
    box), a pad (`PADS`: drone, brass, organ, strings), a noise bed (water, crackle, hiss, scratch) and a motif of 4-7
    scale steps.
  - The gates as the spec's table asks:
    - the Rat Warren: quick and minor, plucked
    - the Sunken Crypt: slow Dorian with a bell and lapping water
    - the Ashen Barrow: driving Phrygian brass and crackle
    - the Hollow Cathedral: an Aeolian choir over an organ
    - the Iron Orchard: whole-tone metal
    - the Throne of Ash: a harmonic-minor march over strings
    - Vane Abbey: a Locrian single voice and silence
  - `musicTick` plays each phrase as the motif, then an answer that leans on it, then a wandering line with rests.
    Percussion comes on the bar (on the beat for the march).
  - Bosses keep their own `BOSS_THEME` root, mode and tempo. A gate's boss plays its gate's motif and lead, and a boss of
    no gate gets a motif drawn from its name. The second phase is 25% faster, a whole tone higher, with more drums.
  - The town follows dread: calm Ionian music box, uneasy Dorian, afraid Aeolian, terror a Phrygian drone with hiss.
    A siege plays terror.
  - The Tower rises a semitone and 2 bpm every 10 floors, using your best floor on the Tower tab. The Rift moves to a
    new key every phrase.
  - Crossfades take 1.5 s. The music has its own volume (Settings, minus and plus in 10% steps, kept per browser), and
    touching it turns the music on. It is still off by default until you turn it on or touch the volume.
  - The engine draws on its own seeded dice (`scRand` keyed by the scene), never `Math.random`, so it is the same each
    time and can never move the game's numbers.
- **Title screen** (`titleHTML`, `scTitle`): the drowned chapel at night, its windows lit, the nave half under black
  water, the Ledger glowing on a lectern. Its pages:
  - Go on (this game's day, level and gates cleared), or Open the Ledger on a new save.
  - Each filled slot, opened with two presses.
  - A new book, which opens Settings' New game.

  It shows once when the page opens. Enter or Escape closes it, and Settings can turn it off (`VIEW.notitle`).
- **Epilogues** (`scEpilogue`), painted at the top of the chosen ending's last page:
  - Close the book: dawn over a quiet valley, six dark gates, the book shut on a grave under a cross.
  - Keep writing: night, the road running between burning gates, the Ledger open and glowing.

  Hidden when backgrounds are off.
- **Left out**: the debug frame-time probe; stage idle animations by role. Every fighter already breathes on the stage,
  and the role glow now marks evolved minions. The valley map stays for R20.
- **Measured**: no rule changed. The bots match R16 and PR A exactly. Every theme renders through a real
  `OfflineAudioContext` with no errors and no NaN.
- **Tests**: `tests/groups/98-music-title.js` (7 tests, with a stand-in AudioContext). The music tests in groups 35 and
  50 were updated to the new scene keys.
