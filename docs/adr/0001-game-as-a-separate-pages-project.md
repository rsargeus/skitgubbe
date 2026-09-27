# The game is a separate Pages project, not a path on skitgubbe.nu

The rules page at the repo root has no build step and serves real traffic today; Cloudflare Pages deploys it by copying files. Putting the game under `/game` in the same project would force a build command onto the whole site, so a broken game build would take the rules page down with it. The game therefore lives in `game/` and deploys as its own Pages project at `game.skitgubbe.nu`, at the cost of one DNS record, a second project in the dashboard, and hand-written links between the two.

This mirrors the split between `landing/` and `frontend/` in the author's `chess` repo.
