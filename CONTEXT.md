# Skitgubbe

The Swedish card game Skitgubbe: its rules, explained on a reference site, and played against bots in the browser.

Domain terms stay in Swedish, because that is what players actually call these things. Code and prose around them are English.

## Language

**Skitgubbe**:
The last player left holding cards when everyone else has run out. Also the name of the game itself.
_Avoid_: loser, last player

**Högen**:
The shared pile in the middle of the table that players lay cards onto and, when they cannot or will not play, take into their hand.
_Avoid_: pile, discard pile, stack

**Dragstapeln**:
The face-down deck of undealt cards that players draw from to refill their hand, and that a `chansa` turns its top card from.
_Avoid_: deck, draw pile

**Chansa**:
Turning the top card of `dragstapeln` face up and playing it sight unseen. High enough, it lands on `högen` and the turn continues; too low, the player takes `högen` plus the chanced card.
_Avoid_: gamble, take a chance, flip

**Öppna bordskort**:
The three face-up cards in front of a player, played once their hand is empty.
_Avoid_: face-up cards, table cards, upcards

**Dolda bordskort**:
The three face-down cards beneath a player's `öppna bordskort`, turned over one at a time without looking, and played last of all.
_Avoid_: face-down cards, hidden cards, blind cards

**Fyra lika**:
Four cards of the same rank ending up on top of `högen`, which removes `högen` from play and gives the player another turn. It counts even when different players laid the four cards in sequence.
_Avoid_: four of a kind, quad

**Specialkort**:
The 2 and the 10, playable on anything. A 2 resets `högen`; a 10 removes it from play entirely.
_Avoid_: special cards, wildcards

**Sedda kort**:
Every card that has been turned face up in front of everyone: cards laid on `högen`, cards revealed by a `chansa`, and `dolda bordskort` turned over — including the ones that were too low and got taken back into a hand. Once seen, a card stays seen. This is the public record any attentive player could keep, and the only history a bot is allowed to remember.
_Avoid_: seen cards, discard history, card count

**Förberedelserundan**:
The phase before play starts, where players move cards freely between their hand and their own `öppna bordskort`, and may place a hand card onto an opponent's `öppna bordskort`.
_Avoid_: setup phase, prep round
