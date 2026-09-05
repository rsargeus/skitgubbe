# Bots receive a PlayerView, never the full game state

Bots run in the same browser as the game, so nothing but discipline stops them from reading hidden information: an opponent's hand, anyone's `dolda bordskort`, or the order of `dragstapeln`. A bot that cheats does not look like a bug — it looks like a strong bot — so the mistake would survive review indefinitely.

Bot decision functions therefore take a `PlayerView`: a projection of the game state that physically omits hidden cards, carrying counts where the real cards are secret, plus `sedda kort` as the memory a level 3+ bot is allowed to keep. Cheating fails to compile rather than being forbidden by convention.

The cost is a second representation of the game and a projection function to maintain. In exchange, bot tests are built by hand-writing a `PlayerView` instead of playing out a game, difficulty levels can only differ in how well they reason, and a future networked multiplayer mode already has the shape of what a server would send each client.
