# R7. The rival's war: an arc with an ending

**Priority** P2. **Closes** G19. **Size** L. **Needs** R2 (the rival's kit from stolen roles); R5 makes their siege
richer, R6 adds stash expeditions, R3 lets them speak at the end.
**Pillars served**: 5 (the Ledger is a story), 2 (every death is a resource), 4 (choices with a cost).

## 1. The problem

The rival (one of `RIVAL_NAMES`: Morwen Ashgrave, Corvin Hale, Isolde Vey, Silas Marrow, Edric Thorne, Agna Wexley)
appears after 4 distinct clears, steals a body every 2-6 days (`RIVAL_THEFT`), and waits in a boss room about every two
weeks (`RIVAL_GAP` 12-16) with 2-4 followers made from what they stole. They grow 10% per win of yours. It repeats until
the game ends: no escalation beyond numbers, no story beyond four passages, no ending.

## 2. The arc

Five chapters. Each opens from the last by days and results; the Rival panel shows the chapter, what opens the next, and
the rival's tally (bodies stolen, duels, wagers).

| Ch. | Name | Opens | New rules |
|---|---|---|---|
| 1 | **Margins** | rival met | as today: thefts and challenges; their kit (R2) from the roles they hold |
| 2 | **The Open Hand** | 3 challenges fought | **wagers**: before each challenge, stake a body; win and take one of theirs |
| 3 | **Fire at the Walls** | chapter 2 + 10 days, and a siege held | the rival **leads a siege**: their army is wave 3 instead of the Captain |
| 4 | **Their Own Gate** | the rival siege resolved | **the Rival's Ledger** opens for 7 days: a gate built from what they stole |
| 5 | **The Reckoning** | their gate cleared | the final duel with their whole book |

### 2.1 Wagers (chapter 2+)

- Before a challenge, the rival names their stake: a body from their stash one tier above or equal to the tier you stake
  (shown with its traits). You may stake one minion from the Reserve, or decline (no wager).
- Win: their stake joins your Reserve (a stolen-then-won body keeps a *Reclaimed* mark: +5% stats). Lose: your stake
  joins their stash (it will fight you in chapter 4).
- A body you lost to a wager or a theft shows as "in their book" in your Memorial with its new owner.

### 2.2 The rival's siege (chapter 3)

The next siege after chapter 3 opens is theirs: waves 1-2 as normal (the living were paid by the rival), wave 3 is the
rival and up to 4 followers from their stash, with their R2 kit. Won: their next theft is skipped and they lose 2 bodies
from their stash (returned to you). Lost: the usual siege loss plus a theft.

### 2.3 Their Own Gate (chapter 4)

**The Rival's Ledger**: a temporary gate (7 days, any number of attempts, one per watch) of four rooms:

| Room | Holds |
|---|---|
| 1 | their followers by role (two of yours they stole, at their stash level) |
| 2 | a room of their wager winnings |
| 3 | an elite: the strongest body they hold, with its traits and a mark |
| 4 | their lieutenant: an arch-nemesis (R13) if they recruited one, else a reflected copy of your best minion |

Doors between rooms show which of your old minions wait inside. Each stolen body killed here can be **reclaimed**
(raised at +25% chance, keeping its old traits and name). If the 7 days pass, the gate closes and reopens after 10 days.

### 2.4 The Reckoning (chapter 5)

The duel: the rival with every move their stash's roles grant (R2: Bone Rampart, Called Shot, Black Mass, Harvest all
at once, rotated), Royal Decree, and a phase two at 50% (*The Last Page*: they burn their own followers to heal 10% each).
The stage shows the tally of thefts as torn pages on the floor.

## 3. Outcomes

| Outcome | Rule | Rewards |
|---|---|---|
| **End them** (chosen after the win) | the rival is gone for this save | **three rival uniques** (below), every body in their stash returns to your Reserve (overflow to the Memorial as "freed"), title *Last Word* |
| **Spare them** | they kneel, and return in NG+ as an ally | weekly body trade, they fight one siege wave on your side in NG+, title *Mercy in Red Ink* |
| **Lose** | chapter 5 repeats after 7 days | they steal one more body; the rival's strength stays |

### 3.1 Rival uniques (one per slot)

| Unique | Slot | Power |
|---|---|---|
| **The Thief's Quill** | weapon | *Pickpocket*: the first foe you kill each room drops its trophy twice; +1 body per room from foes of a kind you have reclaimed from |
| **Margin-Stitched Coat** | armor | *Second Hand*: once per run, a minion that would shatter is "stolen back" and returns at dawn |
| **The Other Ledger** | relic | *Two Books*: your raise chance +1% per stolen body you reclaimed (cap 15%); Royal Decree on you is ignored once a fight |

Together they form a unique set, *The Rival's Book* (3 pieces): +10% to all stats for minions that were once stolen and
won back.

### 3.2 The ally (NG+, spared)

- **Body trade**: once a week, they offer one body from their stash for one of yours of the same tier (both shown).
- **Siege aid**: in the first siege of each NG+ cycle, they hold wave 1 alone (you fight waves 2-3).
- They no longer steal. Their name in the Records stays with *Spared* and the day.
- Rival strength carries 30% into NG+ (`RIVAL_NGP` .3) for their aid fights.

## 4. Story

Six passages: *An offer in red ink* (ch. 2), *They came with torches and a friend* (ch. 3), *A gate of my own dead*
(ch. 4), *The last page* (ch. 5 start), *Last Word* and *Mercy in Red Ink* (endings). Each rival name gets one line of
their own voice in each passage (six variants, ~36 short lines). With R3: if the rival is spared, they appear at the
Hunger's fall; if ended, their ledger is one of the books the Hunger wears.

## 5. Numbers

- Wager odds: the challenge's usual odds; stakes never above the rival's strongest tier.
- Their gate's strength: the challenge strength x1.1; reclaim raise +25%.
- Duel: the challenge strength x1.25, phase at 50%.
- Targets: duel won 65-75% (`full`), arc ends in a 100-day `full` game (`rivalEndDay` 70-95), their gate cleared within
  its 7 days 80%+.

## 6. Save

`S.rival.arc = {ch, opened:{2:day,...}, wager:{stake, theirs}, gate:{open, until, rooms, reclaimed:[]}, end:'ended'|
'spared'|null, endDay}`, `S.rival.ally = {week}` (top level, survives NG+ when spared). Loader: chapter from fights
fought (3+ fights: chapter 2).

## 7. UI

The Rival panel becomes a five-step track with the current chapter, the tally, and the next chapter's condition; the
wager card before a challenge; their gate on the Gates tab with a countdown; the ending choice as a Ledger page.

## 8. Turkish, Codex, titles

~160 strings (36 voice lines). Codex: the Rival's War, Wagers, Their Own Gate. Titles (5): *Last Word*, *Mercy in Red
Ink*, *High Stakes* (win 5 wagers), *Reclaimer* (reclaim 10 stolen bodies), *Not in Their Book* (finish the arc with
fewer than 5 thefts).

## 9. Tests

`97-rival-arc`: chapters open in order and survive save round trips; wagers move bodies both ways; their siege uses their
stash; their gate builds from stolen bodies and closes on day 7; both outcomes; the NG+ ally trade; rival uniques'
powers.

## 10. Bot policy

Wager a Reserve body two tiers under the army's best; always attempt their gate on its first day; End them in the
default policy (`"rival":"spare"` probe). `"off":["rivalarc"]` keeps chapter 1 forever.

## 11. Risks

- **Thefts feel worse with stakes**: thefts stay as today; wagers are optional; reclaiming gives bodies back better.
- **The arc ends too early for long games**: chapter 4's gate needs chapter 3's siege, which needs a town; the earliest
  bot day is checked (no earlier than day 50).
