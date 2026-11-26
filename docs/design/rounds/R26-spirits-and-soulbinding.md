# R26. Spirits and soulbinding

**Priority** P4 (new system). **Size** L. **Needs** R1 (kits give spirits their powers); R4 (crafting) shares the forge UI.
**Pillars served**: 2 (every death is a resource: even the bodies you fail to raise), 4 (choices with a cost), 3.

## 1. Why

A failed raise is a dead end: the body is gone. Souls exist only inside a run (max 5) for the ultimate. Gear's power
comes from rolled lines and a few unique flags. Spirits turn failed raises into a second resource, give Souls a life
outside the run, and let the player put a foe's nature into gear.

## 2. Spirits

- A body that **fails** its raise roll (or one you choose to *release*) leaves a **spirit** of its kind, 40% of the time
  (60% for elites, 100% for bosses).
- Spirits are kept in the **Spirit Lantern** (a new carry item with 6 places, +2 with the Altar L4) for the run and bank
  in town into the **Spirit Ledger** (a pouch by kind, uncapped).
- A spirit's power comes from its kind's R1 kit, its gate tier and whether it was elite or boss.

## 3. Soulbinding gear

At the Altar, bind a spirit into a piece of gear (weapon, armor or relic): it gains a **soul socket** filled with that
kind's power, shown as a gem on the item.

| Kit of the spirit | Bound power (weapon / armor / relic) |
|---|---|
| shield-bearer | — / a Ward of 5% at room start / minions guard the hero once a fight |
| ambusher | Strike first hit +25% / — / your first skill targets the back row free |
| mana thief | Strike +1 mana / — / Siphon +10% mana back |
| bomber | kills burst 10% / bursts on you deal 30% less / Corpse Explosion +15% |
| pack hunter | +2% per living minion / — / minions +3% per same-role ally |
| frenzy | +5% per fallen foe this room / — / Unholy Frenzy lasts +1 turn |
| reflector | — / reflect 8% / — |
| hexer | Strike hexes 10% / — / curses last +1 turn |

(All 16 kits have a row; the table above is the shape.) Boss spirits bind their signature move at 20% as a proc (Rat
King: 10% chance on hit to call a rat).

- One socket per item; rebinding destroys the old spirit. Uniques can take a socket too.
- Socket strength by spirit tier (gate) and grows with the bestiary mastery of that kind (Ledgered: x1.5).

## 4. Spirit spells

Instead of binding, a spirit can be **spent** in battle as a one-use **spirit spell** (costs no mana and no action; one per
room): the spirit's kit fires once on your side (a shield-bearer spirit guards your weakest minion for a turn; a bomber
spirit bursts on a foe). Up to three spirits slotted as spells per run.

## 5. Souls beyond the run

- Souls left at the end of a run (unspent on the ultimate) are **banked** as *Soul Essence* (1 per Soul).
- Soul Essence is spent at the Altar on: empowering a socket (+10% per essence, up to +50%), freeing a spirit into a
  **wisp** (a permanent minor army buff of its kind, 1% each, cap 10), and calling a boss spirit back from the bestiary
  (Ledgered bosses only, 20 essence).

## 6. Connections

Raising (failure feeds spirits), kits (powers), bestiary (mastery strengthens sockets), gear and uniques (sockets),
ultimates (unspent Souls become essence: a choice between using the ultimate and banking), the Altar building (new
level uses), gods (the Choir doubles essence; Vesh preserves spirits between runs without the lantern).

## 7. Numbers

- Sockets: ~3-6% power per item at full strength; the `full` bot with sockets ~1-2 points over without.
- Essence: ~2-4 per day for an active player; empowering a socket fully takes ~2 weeks.
- `"off":["spirits"]`.

## 8. Save

Items gain `so:{kind, tier, emp}`; `S.spirits = {kind: n}`; `S.essence`; `S.wisps = {kind: n}`; run: `r.lantern = [...]`,
`r.spells = [...]`.

## 9. UI, Turkish, Codex, titles

The lantern beside the Souls counter in battle; spirit spells as small buttons; the socket gem on item cards; a Spirit
Ledger page at the Altar. ~150 strings. Codex: Spirits, Soulbinding, Spirit spells, Soul Essence. Titles (5): *Lantern
Bearer*, *Bound Sixteen* (one socket of each kit), *King in a Gem* (a boss socket), *Will-o'-Wisp* (10 wisps), *Hoarder of
Souls* (500 essence).

## 10. Tests

`117-spirits`: spirit chance on failed raises; the lantern cap and banking; sockets by kit and slot; rebinding; spells
once a room; essence from unspent Souls; wisps cap.

## 11. Bot policy

Socket the weapon with a pack-hunter or frenzy spirit, armor with shield-bearer; bank Souls on easy runs, use the
ultimate on boss runs.

## 12. Risks

- **Another inventory to manage**: the Spirit Ledger is a pouch by kind (no item clutter); sockets are one per item.
- **Ultimate vs banking feels bad**: essence is small; the ultimate stays the better use when the fight is close.
