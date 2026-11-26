# R25. Seasons and weather

**Priority** P4 (new system). **Size** L. **Needs** nothing hard; R8 (omens and gods), R19 (map), R23 (garden) all take
hooks.
**Pillars served**: 3 (read the fight: the day's weather is a rule), 7 (a long game with a rhythm), 4 (plan around it).

## 1. Why

The calendar is 100 days of the same valley. Omens (25% of days) are the only daily variation, and they are rare and
unconnected to time. Seasons give the year a shape (the game's 100 days become a year), and weather gives every day a
small readable rule, so planning a day means reading the sky.

## 2. Seasons

The 100-day year has four seasons of 25 days: **Thaw** (spring), **High Sun** (summer), **Harvest** (autumn), **Long
Dark** (winter). Each sets the weather table, a festival of the living, and seasonal rules.

| Season | Rules | Seasonal foes | Festival (day 13) |
|---|---|---|---|
| **Thaw** | bodies keep a day longer; the garden grows faster (R23); floods close the river ford (R19) | Mud-born variants in E and D (resist physical) | *Planting Day*: villages (R20) offer double standing for favors |
| **High Sun** | the first room each day is bright: undead -5% damage (Blood Lord form worse, R21); long days: +1 step of travel per watch | Sun-scorched (fire) variants in C and A | *Midsummer Pyres*: the Inquisition's siege that week is a tier lower but pays half |
| **Harvest** | trophies drop +15%; bodies rot a day sooner; Ulm's deeds +50% (R8) | Scarecrow-thing (a new rare elite in every gate) | *The Reaping*: a free raise of a village body if standing +30 |
| **Long Dark** | each day has an extra night watch at -10% foe sight (ambushes more likely for both sides); frost +10%; mountain roads closed | Frost-wight variants in B and S | *Night of Names*: the Memorial's honor gives a week-long bonus |

NG+ cycles keep the calendar; a year past 100 days (custom year length, R15) wraps seasons.

## 3. Weather

Each day rolls weather from the season's table (shown at dawn, forecast a day ahead by the Bell Tower or a god):

| Weather | Rule | Seasons (weight) |
|---|---|---|
| **Clear** | none | all (high) |
| **Rain** | fire -15%, rot +10%; the river ford closed | Thaw, Harvest |
| **Fog** | door sight -1; foes' intents are hidden for their first turn; ambusher kits +50% | Thaw, Harvest, Long Dark |
| **Heat** | burns last a turn longer; mana regen -10% | High Sun |
| **Storm** | every third turn lightning strikes a random unit (either side) for 10% max HP | High Sun, Harvest |
| **Snow** | frost +15%, travel steps +1 on long roads; freezes last a turn longer | Long Dark |
| **Blood rain** (rare) | crits +10% both sides; raise chance +5 | any (low) |
| **Ashfall wind** (rare) | the Ashen Barrow's foes appear in other gates' rooms | any (low) |

Weather and omens stack; a god's omen call (R8) can't change the weather, but Vesh's rank 5 can call snow and Morrow's
clear skies (one each a week).

## 4. Connections

| System | Link |
|---|---|
| Damage types (R1) | weather shifts types day to day: plan oils (R4) for rain or snow |
| Map (R19) | roads and the ford open and close; snow slows travel |
| Garden and bodies (R23, R5) | growth and rot by season |
| Villages (R20) | festivals; seasonal favors (harvest help, snow clearing) |
| Gods (R8) | each god likes a season (+25% deeds) |
| Sieges | fog sieges: the attackers' first wave is hidden; snow sieges: the Bell Tower's oil freezes (no fire defense) |
| Story | four seasonal passages a year; the first snow passage |
| Presentation (R17) | the stage and map tinted by season; weather particles |

## 5. Numbers

- No weather should move a gate's clear rate more than ~5 points for the `market` bot.
- Seasonal foes: variants on the same stat curve, with a different resist.
- Bot gains from planning around weather (oils, gate choice): ~1 point over a weather-blind bot (`"weather":"blind"`
  probe), so reading the sky is worth it but not mandatory.

## 6. Save

`S.season` derived from the day (no save); `S.wx = {today, tomorrow}`; festival flags in `S.fest = {day: true}`.

## 7. UI, Turkish, Codex, titles

A season banner and weather icon on the day bar; the forecast on the day-end card; the map and stage tinted. ~120 strings.
Codex: Seasons, Weather, Festivals. Titles (5): *Four Seasons* (a full year), *Stormcaller* (win 20 fights in storms),
*Snowbound*, *Night of Names*, *Blood Rain* (raise 10 bodies under it).

## 8. Tests

`116-seasons`: seasons by day and wrap; each weather's rule; forecasts; festivals once a season; seasonal foes appear in
their gates; hooks (ford, garden, oils).

## 9. Bot policy

Brew the oil that weather favors; prefer gates whose foes the weather weakens; `"off":["weather"]`.

## 10. Risks

- **Randomness that frustrates**: weather is shown a day ahead and small; harsh days are rare.
- **Too many daily modifiers** (omen + weather + curse): the day bar shows all three with one-line rules; the Codex has a
  "today" page.
