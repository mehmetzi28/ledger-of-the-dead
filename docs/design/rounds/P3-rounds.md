# P3 rounds: R13 to R18

The third tier: content, modes, collection, presentation and UX. Each round is one PR unless noted. Numbers are starting
points for the bot.

---

## R13. Nemeses and a living valley: content pack

**Closes** G24, G20. **Needs** R1. **Size** L.

### Nemeses
- When a foe downs a minion of Veteran tier or above and the room is lost or the foe escapes (a skirmisher that steps
  back, an ambusher that survives a retreat), it may become a **nemesis** (`NEM_CH` 25%): it gains a name ("Gutter-Tooth,
  who ate Brother Ash"), +1 level per minion it has downed, and one trait taken from its victim.
- Up to 3 nemeses live at once. Each haunts its gate: a door marked with its sigil. It grows a level each week it lives.
- **Avenging**: kill it and gain its trophies x3, its stolen trait as a corpse condition (*Avenged*: the body rises with
  that trait), and a Memorial line beside the victim's headstone. Title track: *Avenger* (1, 5, 15).
- A nemesis that downs three minions becomes an **arch-nemesis** with an R1 kit pair and enters the rival's notice (R7:
  the rival may recruit it).

### Content
- **5 curses**: *Hunger Curse* (souls drain one per room), *Mirror Curse* (foes copy your army's top trait), *Silent
  Curse* (no orders), *Long Curse* (rooms +1 foe), *Thin Curse* (bodies vanish after one turn).
- **10 events**: Mourners at the gate (R5 calm), the Hanged Choir (a fight for a hexer), the Lost Patrol (militia to
  spare or raise: dread +/-), the Bone Merchant (swap a minion for one of the same tier, random), a Drowned Bell (an omen
  call), the Weeping Statue (a page), the Ledger Thief (a duel with a minor rival agent), the Fever Pit (risk HP for a
  trait reroll), the Broken Wagon (commission trophies), the Hollow Saint (faith conversion offer).
- **3 chains** (three steps each): *The Tanner's Debt* (Rat King's backstory, ends in a unique vanity title), *The
  Warden's Relief* (lay the Crypt Warden's watchmen to rest: Reserve XP), *Ash Choir* (the Bishop's lost choir: a hexer).
- **3 omens** beyond R8's: *Red Mist* (crits +10% both sides), *Grave Wind* (raise chance +5%, Souls -1), *Still Air*
  (no damage over time ticks, both sides).
- **Event outcomes touch other systems**: each new event moves dread, devotion, rival standing or a nemesis.
- Tests `104-nemesis`, `105-content`.

---

## R14. Sieges 2.0: the Inquisition escalates

**Closes** G23. **Needs** R5. **Size** L.

- **Siege tiers**: five tiers (Militia, Templars, Inquisition, Crusade, Purge) that rise by one after every two sieges
  won and fall by one after a loss. Each tier adds a foe kind and a rule.
- **New foe kinds with kits** (R1): Templar Shieldwall (shield-bearer), Flagellant (frenzy), Relic Bearer (banner),
  Pyre Priest (fire bomber), Hound Master (pack hunter), Exorcist (silences minions, sapper of Ward).
- **Choose the wall**: at the warning, pick which side to hold (north road: more foes, more pay; river gate: fewer but
  elite; graveyard: your Ossuary perk doubles). The other walls use the Bell Tower defenses.
- **Siege bosses** by tier: Inquisitor Captain (Militia/Templars), the Witchfinder General (Inquisition), the Saint of
  Pyres (Crusade), the Grand Inquisitor (Purge), each with an R2 kit.
- **The Inquisition arc**: 4 passages and a confrontation: at Purge tier, a final siege; win it and the Inquisition sues
  for peace (sieges stop for 20 days, dread falls to Calm, title *The Unburnt*), lose it and the tier resets.
- Targets: held 80-87% averaged over tiers, at least 70% at Purge.
- Save: `S.siege.tier`, `S.siege.wall`; tests `106-siege-tiers`.

---

## R15. Modes and playtest logs

**Closes** G27, B6. **Size** L.

- **Ironman** slot: one save, autosaved each action; a death costs the whole run's loot and one random minion falls;
  nothing else changes. Its own title track.
- **Seeded challenges**: a challenge code (base-36 seed + rules) a player can type to start the same valley; local only.
- **Custom difficulty**: sliders for foe HP, foe attack, raise chance, gold and days (each 50-200%); titles off when any
  slider is below 100%.
- **Play log**: a local, opt-in record of runs (gate, room, actions, deaths with their blow, time per run, systems never
  opened), exported as a JSON file from the Records. Never uploaded. A "how I play" summary page reads it.
- **Bot replay of a log**: `tests/run-balance.js '{"log":"file.json"}'` compares a human log to the bot's choices
  (where the human chose differently and how it went), so balance gets checked by a human (B6).
- Tests `107-modes`.

---

## R16. Titles and collection 2.0

**Closes** G26. **Size** L.

- **Inscribed titles**: up to three earned titles shown beside the worn one; slots unlock at 40, 80 and 120 titles. Each
  inscribed title gives a tiny perk from its family (gate titles: +1% damage in that gate; army titles: +1% army HP).
- **Families and progress**: titles grouped into ten families with a progress bar each; finishing a family pays a
  cosmetic.
- **Cosmetics** (all drawn with the existing renderer, no outside art): 8 robes (palette and trim), 6 army banners,
  6 stage backdrops (per gate variants), 4 staff heads, 4 Ledger covers.
- **Collection milestones**: bestiary Ledgered count, uniques found, sets completed, trophies: each milestone a cosmetic
  or a small rule perk (a sixth potion slot, a Codex filter, a reroll a week).
- **Hidden titles** get hints in the Codex after 100 titles.
- Save: `S.insc = [...]`, `S.cos = {robe, banner, stage, staff, cover, owned:[...]}`; tests `108-collection`.

---

## R17. Presentation: music, stage, art

**Needs** R1, R2. **Size** L (two PRs if music is large).

- **Music**: procedural WebAudio themes (no outside files): one per gate (scale and instrument per gate), one per boss
  phase, town by dread band, the Tower by floor band, the abbey; crossfades on room change; a music volume slider.
- **Stage**: kit and damage-type effects (frost shards, fire embers, rot mist, shadow ink, physical sparks) through
  `fx.js` particle presets; boss moves get a wind-up pose and a screen cue for telegraphs; R3's echoes in gold ink.
- **Art**: evolved minion art by stage (outline, size and glow by tier); legendary and Riftborn item frames; a title
  screen with the drowned chapel; painted (canvas-drawn) epilogue scenes for both endings.
- **Feel**: hit-stop on crits and executions, damage numbers colored by type, a slow-motion beat on boss phase changes.
- Performance budget: 60 fps on a mid phone with 12 units on stage; a "reduced effects" option.

---

## R18. UX and onboarding pass

**Needs** any three rounds before it. **Size** L.

- **First hour again**: replay the first 10 days with the new systems; one new system shown per day at most; the
  tutorial tips (36) reviewed and pruned to what is still true.
- **Mobile layout**: one-thumb battle commands, a collapsible log, the Town map scrolls, cards fit 360 px.
- **Codex links**: every number in a tooltip links to the Codex line that explains it.
- **"Why did I lose"**: a History view of a lost room turn by turn with the blow, its move, its answer, and what the
  bestiary knew.
- **Performance**: late saves (500+ items, 60 minions, 150 titles) render the Town and Army tabs under 50 ms; a save size
  check and pruning of old History.
- **Accessibility**: colorblind-safe damage-type colors with icons, font size option, reduced motion.
- Tests: `109-ux` (render timings on a large fixture save, Codex link targets exist).
