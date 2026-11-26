# R29. The crypt beneath: tomb robbers and a dungeon to defend

**Priority** P4 (new system). **Size** XL, two PRs. **Needs** R5 (town); R22 (constructs) and R26 (spirits) fill it.
**Pillars served**: 1 (the army is the character: posted, not led), 4 (choices with a cost), 2.

## 1. Why

The player only ever attacks dungeons. Sieges defend the walls in a fixed battle. A dungeon of the player's own, laid out
room by room with traps and posted minions, flips the game's view (you are the gate now), gives the Reserve and
constructs a job, and makes the town's treasure something worth protecting.

## 2. The crypt

Under the town lies the **Crypt** building's deeper levels: a dungeon of **rooms** the player lays out on a grid (a chain
of 3 rooms at first, up to 8, with branches at 5+). Each room has a **type**, a **post** (up to 3 minions from the
Reserve) and up to two **traps**.

| Room type | Effect |
|---|---|
| **Ossuary hall** | posted minions +10% HP |
| **Narrow stair** | intruders fight one at a time |
| **Flooded vault** | intruders are slowed (act after your posts) |
| **Bone maze** | intruders may get lost (25% a turn: skip the room, but face the next with a wound) |
| **Treasure room** (the end) | holds a share of your gold and dust; what intruders steal comes from here |
| **Spirit shrine** (R26) | spirits banked here haunt: 5% of intruder HP lost per spirit kind |
| **Workshop floor** (R22) | a construct posted here repairs itself between waves |

| Trap | Cost | Effect |
|---|---|---|
| Pit of spikes | 300 gold | 15% max HP to the first intruder |
| Collapsing ceiling | 800 gold, 5 dust | 25% to all in the room, once |
| Grave-gas | 600 gold | poison on all, 3 turns |
| Bone snare | 500 gold | roots the strongest intruder for 2 turns |
| Mirror of Names | 2,000 gold, 20 dust | an intruder fights for you one turn |

## 3. Intruders

Every 5-8 days (a separate rhythm from sieges, never the same night), **tomb robbers** come for the treasure room:

| Band | When | Who |
|---|---|---|
| **Grave robbers** | from the first treasure | thieves (striker), diggers (vanguard) |
| **Relic hunters** | 3+ rooms | a scholar (hexer), sellswords, a lockbreaker (sapper kit: disarms a trap) |
| **Templar delvers** | after siege tier 2 (R14) | templars, an exorcist (dispels spirits) |
| **The rival's thieves** | R7 chapter 2+ | the rival's followers; they steal a body, not gold |
| **Delver heroes** | late (gold held 50k+) | a named adventurer party of 4 with kits (a paladin, a ranger, a priest, a rogue) |

Raids on the crypt **resolve automatically** at night (the hero sleeps), shown as a replay the player can watch at dawn
(the battle stage plays it fast). The hero can choose to **stand watch** (spend the evening watch) and fight the final
room personally.

## 4. Outcomes

- **Repelled**: intruders who fall leave bodies (raise at dawn, +10%: they died in your house), gear (adventurer gear is
  good), and **delver trophies** (a new trophy family: forge Delver gear, R4).
- **Robbed**: the treasure room's share is lost (5-15% of held gold, never more than the room holds) and a trap is broken.
- Posted minions that fall in the crypt don't shatter (home ground) but are out for a day.

## 5. Connections

The Reserve (finally a job for benched minions: posts), constructs (R22), spirits (R26), dread (high dread: more robbers,
sure, but Terror makes delvers rarer: nobody dares), sieges (siege nights and crypt nights never coincide), the rival
(their thieves), economy (the treasure room holds gold: a reason to spend it, B3), presentation (the crypt map).

## 6. Numbers

- Repelled ~80-85% for a bot that lays out a sensible crypt.
- The crypt's yield (bodies, gear, delver trophies) worth about one gate clear per raid; losses small but felt.
- Building the crypt: a sink of ~30-60k gold over a game (rooms 2k-15k each, traps).
- `"off":["crypt"]`.

## 7. Save

`S.crypt = {rooms:[{type, post:[uid], traps:[...]}], links:[...], treasure:{share}, next, log:[...], works:{}}`. Posted
minions carry `m.post = roomIx`.

## 8. UI, Turkish, Codex, titles

A crypt editor (a grid of room tiles, drag minions from the Reserve to posts, trap slots); a dawn replay; the warning on
the day bar. ~180 strings (rooms, traps, intruder bands, adventurers' names and lines). Codex: The crypt, Intruders,
Traps. Titles (6): *Dungeon Keeper*, *Nothing Taken* (10 repelled in a row), *Adventurer's End* (repel a delver party),
*Eight Rooms*, *Mirror of Names*, *Home Ground* (stand watch 10 times).

## 9. Tests

`120-crypt`: layout rules (chain, branches, caps); rooms and traps apply; intruder bands by condition; auto-resolve and
stand-watch; outcomes; posted minions don't shatter; never on a siege night.

## 10. Bot policy

Fill posts with Reserve minions by role (vanguards in the stair, menders in the hall), buy spikes and gas early, the
mirror late; stand watch only when the band is delvers.

## 11. PR split

- **PR A**: the crypt layout, rooms, posts, traps, grave robbers and relic hunters, auto-resolve.
- **PR B**: templars, the rival's thieves, delver heroes, stand watch, replays, delver gear.

## 12. Risks

- **A second game inside the game**: the layout is small (3-8 rooms) and auto-resolves; a default layout button exists.
- **Robbery feels like a tax**: the treasure room holds only a share; robbers are repelled most of the time.
