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
