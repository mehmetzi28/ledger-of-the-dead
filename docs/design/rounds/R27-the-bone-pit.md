# R27. The Bone Pit: minion duels and tournaments

**Priority** P4 (new system). **Size** L. **Needs** nothing; R12 (actives and specs) and R22 (constructs) make it
deeper; R20 (villages) brings challengers.
**Pillars served**: 1 (the army is the character: here it is the only character), 3 (read the fight), 7.

## 1. Why

Every fight is the hero plus the army against foes. Minions are never tested on their own, and the Reserve is a bench.
A pit where minions fight minions (other keepers', the villages' champions, beasts) gives the army a stage, trains
benched minions, and makes a minion's build (traits, marks, charms, specs) readable in a 1-on-1 or 3-on-3 fight.

## 2. The Pit

A town building (opened by the first rival duel won or the Charnel Yard L2). Once a day, one **bout**:

- **Format**: 1v1, 2v2 or 3v3 minions. The hero does not fight; the hero gives **orders** only (the free orders, and R12
  actives), one per turn.
- **Opponents** from a ladder of 30 **champions** (section 3).
- **Rules**: no raising, no potions, minions fight at their real stats; a downed minion **does not shatter** (the Pit is
  sport), it's out for the day.

## 3. The ladder

Thirty champions in five ranks (Bronze to Bone King). Each champion is a named minion or team with a theme:

| Rank | Champions (examples) | Theme |
|---|---|---|
| Bronze (1-6) | Old Gnasher (a rat), the Twins of the Ford, a Greyhollow miner | basics: one trait each |
| Iron (7-12) | Sister Ashes (a mender team), the Hound of Saint Aldric's | roles and orders |
| Silver (13-18) | the Choir Trio, Iron Matron (a vanguard with a reflector charm) | kits and charms (R12) |
| Gold (19-24) | the Rival's Pet, the Wyrmling, a nemesis (R13) | marks, specs, damage types |
| Bone King (25-30) | the Eternal of the Pit, the Bone King himself | everything; three-phase final |

Beating a champion moves you up; champions above you challenge you weekly (decline and lose a rank point).

## 4. Rewards

- Each win: gold (by rank), pit XP for the fighters (x2 of normal XP: the Reserve's minions train here), and **Pit
  Tokens**.
- Tokens buy: charms (R12), trait rerolls (one minion, one trait), a mark change, cosmetics (R16 banners), and a
  **champion's body** once you beat them (their body joins your Reserve, raised at Elder).
- Rank rewards: a title per rank; Bone King: the unique *Crown of the Pit* (relic: minions +10% stats in 1v1 situations,
  i.e. when they are the last one standing).

## 5. Betting

Before a bout (yours or a champions' exhibition), bet gold on the outcome; odds come from the strength of the sides and
are shown honestly. Betting caps at 10% of held gold, so it's a small sink with spice.

## 6. Seasonal tournament

At the end of each season (R25) or every 25 days, a **tournament**: an 8-team bracket over three days (one bout a day),
3v3. Winning pays a tournament trophy (a heartforged line of your choice on an item, R4), a title, and a big token
purse.

## 7. Connections

The Reserve (training), R12 (actives and specs shine), R22 (constructs can enter), villages (R20: champions come from
them; standing +5 for beating their champion fairly), nemeses (a captured nemesis can be a champion), the rival (their
pet), presentation (R17: a pit stage).

## 8. Numbers

- Pit XP: a benched Reserve minion fighting daily should gain ~1 level a week at mid game (the Yard is passive, the Pit
  active).
- Ladder: the `full` bot reaches Gold by day 100; Bone King is for players who build for it.
- Betting EV slightly negative (the house keeps 5%).

## 9. Save

`S.pit = {rank, pts, beaten:[ids], tokens, today, bets:[...], tour:{season, round, bracket}}`.

## 10. UI, Turkish, Codex, titles

The Pit page: ladder, today's bout, team picker, odds and bet slider; the bout runs on the battle stage with the hero's
order bar only. ~160 strings (30 champions). Codex: The Pit, Ladder, Tournament, Betting. Titles (7): one per rank (5),
*Tournament Champion*, *House Edge* (win 20 bets).

## 11. Tests

`118-pit`: bouts use real stats and no shatter; orders only; ladder movement and weekly challenges; tokens and their buys;
betting caps and odds; the tournament bracket.

## 12. Bot policy

Field the strongest 3 Reserve minions to train them; bet never (`"pit":"bet"` probe). `"off":["pit"]`.

## 13. Risks

- **A side game that feels detached**: rewards are army growth (XP, charms, bodies), so it feeds the main game.
- **Balance of champions**: they are fixed teams on a curve of the player's best gate, measured by the bot's ladder pace.
