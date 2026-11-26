# R28. Scars: what death leaves on the hero

**Priority** P4 (new system). **Size** L (small code, broad content). **Needs** nothing; R21 (forms) and R8 (gods) hook in.
**Pillars served**: 2 (every death is a resource: the hero's too), 4 (choices with a cost), 5.

## 1. Why

When the hero falls, the room's spoils and 15% of a level's XP are lost, and the game moves on. Deaths are pure loss,
remembered only in a counter. A hero who has died forty times looks and plays like one who never did. Scars make deaths
leave a mark with a cost and an upside, readable and chosen.

## 2. Scars

When the hero falls, the killing blow's **source** may leave a scar (`SCAR_CH` 30%, 100% on a boss's killing blow the
first time). The scar is named after what caused it and has a **bane** and a **boon**.

| Scar (from) | Bane | Boon |
|---|---|---|
| **Gnawed** (rats, Rat King) | -5% max HP | +10% damage vs Rat Warren kinds; rats flee you (5% chance a rat foe skips its turn) |
| **Frostbitten** (frost) | -10% speed of mana regen in Long Dark (R25) | resist frost +15% |
| **Burned** (fire) | healing received -5% | resist fire +15%; Cinder Wave can't burn you |
| **Rotted** (rot) | poison lasts a turn longer on you | your rot effects +10% |
| **Hollowed** (shadow) | Siphon heals 10% less | shadow damage +10% |
| **Broken** (physical crit) | -5% armor | +10% crit damage |
| **Decreed** (Pale Sovereign) | Royal Decree hits you harder (+10%) | +1 army slot (the court remembers you) |
| **Silenced** (Bishop of Teeth) | the first skill each room costs +2 mana | +10% skill damage after the first |
| **Thorned** (Orchard Mother) | -3% max HP | +5% thorns |
| **Branded** (the Inquisition, R14) | sieges against you +5% foe HP | siege pay +15% |
| **Unwritten** (the Hunger, R3) | -1 Soul max | the Hunger's echoes never include your fallen Eternals |

(Every gate boss, warden and the main damage types have one; ~24 scars in all.)

- At most **5 scars** at once; a sixth asks which to replace.
- Scars show on the hero sprite (R17) and the hero card.

## 3. Healing and deepening

- **Heal** a scar at the Temple (R5) or with Morrow's rank 3 (R8): gold `1,000 x level / 10`, the scar is gone (both
  sides).
- **Deepen** a scar with its source's trophies (10) at the Apothecary: bane and boon both +50%. A deepened scar of a boss
  can be **ritualized** with its heart: the bane is removed, the boon stays (the scar becomes a *Mark of Survival*).

## 4. The death ledger

A page in the Records lists every death: day, room, killer, blow, and the scar it left. Milestones: 10 deaths unlock the
Apothecary deepen; 25 deaths the ritual; 50 deaths the title *Hard to Kill* and a permanent +2% max HP (*Death Knows Your
Name*).

## 5. Connections

Combat (the killing blow's type and move decide the scar, so R1/R2 are its source), the bestiary (a scar's kind shows its
page), gods (Morrow heals, the Choir deepens for free), forms (R21: the Bone Colossus turns scars' armor banes into boons),
Ironman (R15: scars are the only memory of a death that cost the run).

## 6. Numbers

- A scar's bane and boon should net close to zero for the average build, positive for builds that face its source often.
- Default bot: ~3-5 scars by day 100, heals the ones that hurt its build.
- `"off":["scars"]` near zero (it's a choice system).

## 7. Save

`S.player.scars = [{k, deep, rit, day}]`, `S.deaths = [{day, gate, room, killer, blow, scar}]` (capped at 200, older
summarized).

## 8. UI, Turkish, Codex, titles

The scar strip on the hero card (icons with bane/boon tooltips); the replace dialog; the death ledger page. ~110 strings.
Codex: Scars, Deepening and rituals, the Death ledger. Titles (5): *Scarred*, *Five Scars*, *Mark of Survival*, *Hard to
Kill*, *Clean Skin* (reach the Throne with no scars).

## 9. Tests

`119-scars`: a scar from the killing blow's source; the cap and replace; heal, deepen, ritualize; death ledger entries and
milestones.

## 10. Bot policy

Keep scars whose boon fits its next gate; heal banes on its top stat. 

## 11. Risks

- **Deaths become desirable**: boons are matched by banes; a ritual costs a boss heart and ten trophies.
- **Hidden punishment**: every scar shows both sides at once, and the first is explained by a tip.
