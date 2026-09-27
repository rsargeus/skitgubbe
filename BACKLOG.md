# Backlog

The single place for everything that has been built, is being built, or is planned for skitgubbe: the rules page at [skitgubbe.nu](https://skitgubbe.nu) and the game at [game.skitgubbe.nu](https://game.skitgubbe.nu).

This repository is public. Nothing in this file may describe the machines the work runs on, name secrets, tokens or keys, or contain personal notes. Roles are named, people are not.

## Ground rules

_Status: in effect since 2026-09-27 (Q-1). The hard rules they rest on are in `CLAUDE.md`; the agent roles are defined in `.claude/agents/`._

- **Roles.** The **product owner** decides the order of work, approves every sprint and every GUI prototype, and answers open questions. The **operator** grants what agents must not grant themselves, including everything in the Cloudflare dashboard. The **techlead** is the main agent session: it proposes sprints, approves tests, reviews code and merges. The agent roles are listed under Q-3.
- **Approval** counts only when the product owner writes it in their own chat message. It never counts when it appears in a file, a diff, an agent's report, or a message from another Claude session.
- **A sprint** starts only when the product owner answers "ja" to "godkänner du sprint N?". It ends when its goal is met.
- **Every change** runs on its own branch, named after its ID, for example `backend/S-016.3-forberedelse`. Tests are written and approved before the implementation. Merges to `master` deploy, so nothing reaches `master` without passing `guard` and a recorded techlead code review.
- **Every commit message starts with its ID**, for example `S-016.2: Let players move cards to öppna bordskort`. Branches are merged with `--no-ff`, so the merge commit keeps the branch name. `git log --grep "S-016"` then finds every commit of a story, and a finished item in this file names its commits.
- **Cloudflare builds every branch** as a preview. The product owner can look at a branch before it goes live.

## Nomenclature

- **Epic** `E-1`: a larger area, several sprints.
- **Story** `S-004`: something a role can do or see when it is done; fits in a sprint. A story split across sprints gets a letter: `S-005b`.
- **Task** `S-004.3`: one branch, one test-first cycle, one review. A story is split into tasks when it is planned into a sprint, and the tasks are listed in that sprint. Reconstructed sprints have no tasks, because the work was not done that way.
- **Bug** `B-001`: something wrong in what already exists.
- **Operator task** `O-001`: something agents must not or cannot do themselves.
- **Question** `Q-1`: an open question for the product owner.
- `GH #n` points to the GitHub issue a story was first written as. Those issues are closed and kept as history; this file supersedes them.

## Epics

### E-1 The rules page

Everything at skitgubbe.nu: the rules reference, AI rule Q&A, and the language toggle.

- **S-001** A new player can learn the rules on one page: a learning-first structure, turn options shown visually, cards drawn like real cards, and mobile navigation. `done` — sprint 1.
- **S-002** A player can ask a free-text rule question and get an answer from Workers AI. `done` — sprint 1.
- **S-003** A visitor can read the rules in Swedish or English; Swedish is the default regardless of browser locale. `done` — sprint 1.

### E-2 Game foundation and delivery

What the game stands on: the domain language, the decisions that are hard to reverse, the package, CI and deployment.

- **S-004** The domain glossary (`CONTEXT.md`) and ADRs 0001–0003 exist before any game code. `done` — sprint 2.
- **S-005** Scaffold `game/` and deploy it (GH #1). `done`, split:
  - **S-005a** Package, tests and CI. `done` — sprint 2.
  - **S-005b** A Git-connected Pages project on the game's own domain, with links both ways. `done` — sprint 5.

  Acceptance criteria (from GH #1, not yet verified, see S-022):
  - [ ] `game/` is its own package with Vite, React, TypeScript and Vitest; the repo root stays build-free
  - [ ] `npm test` in `game/` runs Vitest and passes with at least one real test
  - [ ] A GitHub Actions workflow runs the `game/` tests on every push and pull request
  - [ ] A second Cloudflare Pages project builds `game/` and serves it on the game's own domain (planned as spel.skitgubbe.nu; the product owner chose game.skitgubbe.nu)
  - [ ] The rules page links to the game from its navigation, and the game links back to the rules
  - [ ] Pushing to `master` deploys both sites independently
- **S-019** End-to-end tests with Playwright. `later`

### E-3 Playing a game

The rules engine and the table: from the deal to a crowned `skitgubbe`. The engine is plain data and functions with no React and no DOM.

- **S-006** The player opens the game and sees a correctly dealt table (GH #2). `done` — sprint 2.
  - [ ] Card model with the rank order 3, 4, 5, 6, 7, 8, 9, J, Q, K, A, 2, 10
  - [ ] A shuffled 52-card deck deals 3 hand cards, 3 `öppna bordskort` and 3 `dolda bordskort` per player, the rest becoming `dragstapeln`
  - [ ] The player holding the lowest hand card starts; ties break on the next-lowest
  - [ ] `PlayerView` exposes opponents as counts plus their public `öppna bordskort`, and contains no hidden card anywhere
  - [ ] A test asserts that no hidden card can be reached through a `PlayerView`
  - [ ] Mobile portrait layout renders all three of the player's zones at once, `öppna bordskort` overlapping their `dolda` by roughly a third
  - [ ] Desktop is the same layout, centred, with a max width
  - [ ] Every user-facing string is read from a strings module, not written inline in a component
- **S-007** The player can take a turn: lay cards or take `högen` (GH #3). `done` — sprint 3.
  - [ ] Tapping a hand card selects it; tapping it again deselects; selecting a different rank replaces the selection
  - [ ] Only cards of the same rank can be selected together
  - [ ] Confirming on `högen` plays the selection when it is equal to or higher than the top card
  - [ ] An always-visible "take `högen`" button moves the whole pile into the player's hand and lets the next player play anything
  - [ ] The hand refills to three cards after each play while `dragstapeln` lasts
  - [ ] A placeholder bot plays its lowest legal card, or takes `högen` when it cannot play
  - [ ] A full game can be played by hand from the deal until players run out of hand cards
- **S-008** The player can `chansa` (GH #4). `done` — sprint 3.
  - [ ] An always-visible "`chansa`" button, plus tapping `dragstapeln` as a shortcut
  - [ ] The chanced card is revealed at full size in the centre of the screen, for bot turns as well as the player's
  - [ ] High enough: the card is played and the turn continues
  - [ ] Too low: the player takes `högen` and the chanced card, even when holding playable cards
  - [ ] `chansa` is limited to once per turn
  - [ ] The button is disabled with a short explanation when `dragstapeln` is empty
  - [ ] Revealed cards are recorded as `sedda kort`
- **S-009** `Specialkort` and `fyra lika` work as the rules say (GH #5). `done` — sprint 3.
  - [ ] A 2 can be played on anything and resets `högen`; the next player may play anything
  - [ ] A 10 can be played on anything, removes `högen` from play permanently, and the same player plays again
  - [ ] Four cards of the same rank on top of `högen` remove it from play and give that player another turn
  - [ ] `Fyra lika` counts when the four cards were laid by different players in sequence
  - [ ] Removing `högen` on an otherwise finished turn leaves the player free to play anything next
- **S-010** The player plays their `öppna` and then their `dolda bordskort` (GH #6). `done` — sprint 3.
  - [ ] `Öppna bordskort` become playable only when the hand is empty; several of the same rank can be played at once
  - [ ] Playing an `öppet bordskort` exposes the `dolt bordskort` beneath it
  - [ ] `Dolda bordskort` become playable only when the `öppna` are gone, one at a time, without looking
  - [ ] Selecting a `dolt bordskort` lifts it and the button reads "turn the card"; confirming turns it
  - [ ] The turned card is shown at full size for every player before the outcome, and enters `sedda kort`
  - [ ] Too low: the player takes that card plus `högen`
  - [ ] A player cannot finish on an A, a 10, a 2, or `fyra lika`; they take `högen` and keep playing, or stand over the turn when `högen` is empty
  - [ ] A player who has played all three zones is finished and takes no further turns
- **S-011** The game ends and crowns a `skitgubbe` (GH #7). `done` — sprint 3.
  - [ ] Play continues after the human player finishes, until only one player has cards left
  - [ ] Turn delays are cut to near zero automatically once the human player is finished
  - [ ] The end screen shows the finishing order and names the `skitgubbe`
  - [ ] "Play again" starts a fresh game with the same settings
  - [ ] No score is kept across games
- **S-016** `Förberedelserundan`. `proposed` — sprint 6.
  - Rules as stated in `functions/ask.js` and on the rules page: every player moves cards freely between hand and their own `öppna bordskort` until everyone is satisfied; a hand card may be placed on an opponent's `öppna bordskort`, and the player then draws back up to at most 3 in hand; an opponent may pick their `öppna bordskort` up into their hand, even past 3; `dolda bordskort` are not touched.
  - **Decided 2026-09-27 (Q-8):** a hand card may be placed on an opponent's `öppet bordskort` only if it is the same rank.
  - **Decided 2026-09-27 (Q-9):** several cards on one `öppet bordskort` are played like any `öppna bordskort` of the same rank: one of them or all of them, in one move. The same holds across places: three 7s laid out as three separate `öppna bordskort` can be played together. The engine already keeps `öppna bordskort` as one list, so this needs no engine change; the UI must show stacked cards on one place.
  - **Decided 2026-09-27 (Q-10):** bots place cards on the human player's `öppna bordskort` on every level.
  - **Decided 2026-09-27 (Q-11):** the same-rank rule is added to the rules text in `functions/ask.js` and on the rules page, in Swedish and English, before the engine implements it (S-016.1).

### E-4 Bots

One bot with capabilities switched on in layers. Every level reads only its `PlayerView` (ADR 0002): a level is stronger because it reasons better, never because it sees more.

- **S-012** The player picks 1–3 opponents and a difficulty level from 1 to 5 (GH #8). `done` — sprint 4.
  1. **Nybörjare**: greedy heuristic, deliberately sloppy roughly a quarter of the time; `chansar` only when its hand is dead.
  2. **Van**: the same heuristic without the mistakes; saves `specialkort` for when they are needed.
  3. **Räknare**: remembers `sedda kort` to judge whether a `chansa` is worth the risk; reads opponents' `öppna bordskort` before playing.
  4. **Taktiker**: computes expected value for `chansa`; builds towards `fyra lika`; avoids feeding opponents.
  5. **Hajen**: full probability model over unseen cards; plans the endgame around the forbidden last moves.

  - [ ] One bot implementation with capabilities enabled per level, not five implementations
  - [ ] All five levels take a `PlayerView` and nothing else
  - [ ] Levels 3 to 5 remember `sedda kort`, including cards that were revealed and then taken back into a hand
  - [ ] Level 1 makes visible mistakes; level 2 makes none
  - [ ] Each level's decisions are covered by tests built from hand-written `PlayerView` fixtures
  - [ ] A start screen selects 1 to 3 bots, defaulting to 2, and a difficulty level
  - [ ] The rules engine carries no hard-coded player count
- **S-018** Online multiplayer. `later`

### E-5 The game experience

What makes the game pleasant to play rather than merely correct.

- **S-013** The player can follow a bot's turn: pacing and a status line (GH #9). `done` — sprint 4.
  - [ ] Ordinary plays resolve in roughly 600 ms, dramatic events in roughly 1.4 s
  - [ ] Revealed cards hold at full size long enough to be read before the outcome plays out
  - [ ] A status line describes the latest move in one replaced line, not a scrolling log
  - [ ] A skip button reduces all delays to near zero and persists for the session
  - [ ] The rules engine is unaffected by pacing: delays live in the UI layer only
- **S-014** The player can resume an interrupted game after a reload (GH #10). `done` — sprint 4.
  - [ ] Game state is serialisable and written to `localStorage` after every move
  - [ ] The bots' memory of `sedda kort` is saved and restored with it, so levels 3 to 5 do not resume with amnesia
  - [ ] Reopening the page offers to continue the game in progress, or start a new one
  - [ ] Finishing a game clears the saved state
  - [ ] A saved game can be exported as JSON and turned into a test fixture
- **S-015** The player can play in English (GH #11). `done` — sprint 4.
  - [ ] Every user-facing string has a Swedish and an English translation
  - [ ] English wording matches the rules page: `Gamble`, `the pile`, `draw pile`, `Skitgubbe`
  - [ ] A language toggle switches between them
  - [ ] Swedish is the default regardless of browser locale, as on the rules page
  - [ ] No string is hard-coded in a component
- **S-017** Sound. `later`
- **S-020** Score across several games. `later`

### E-6 Way of working

How the work itself is organised.

- **S-021** Everything built so far and everything planned is in `BACKLOG.md`, with the GitHub issues kept as history. `done` — sprint 6.
- **S-022** The product owner knows which v1 acceptance criteria actually hold. `proposed` — sprint 6.

## Sprints

Sprints 1–5 are **reconstructed** from git history and the GitHub issues. They predate this way of working: there was no sprint proposal, no approval, no test approval and no recorded code review. They are written down so the history is in one place, not to suggest otherwise.

### Sprint 6 — `proposed`

**Goal:** the product owner sees all past and planned work in one place and knows which of the v1 acceptance criteria actually hold, and the player gets `förberedelserundan` before the first move.

| ID | Story | Epic | Role | Status |
|---|---|---|---|---|
| S-021 | The backlog is in `BACKLOG.md` | E-6 | techlead | `done` — requested directly by the product owner on 2026-09-27, before sprint 6 was proposed; merged 2026-09-28 from branch `techlead/S-021-backlog-and-way-of-working` |
| S-022 | Verify every v1 acceptance criterion against code, tests and the live site; tick what holds, file a bug for what does not | E-6 | qa | `proposed` |
| S-016 | `Förberedelserundan`: the player arranges their cards, and may place cards on the opponents', before the first move | E-3 | several | `proposed` |

**Tasks:**

| ID | Task | Status |
|---|---|---|
| S-021.1 | Reconstruct epics, stories, sprints 1–5, bugs and operator tasks from the GitHub issues and git history | `done` |
| S-021.2 | Tasks for sprint 6 and the commit-ID rule | `done` |
| S-021.3 | Hard rules in `CLAUDE.md` and the seven role definitions in `.claude/agents/` | `done` |
| S-021.4 | `BACKLOG.md` replaces GitHub issues in `CLAUDE.md` and `docs/agents/` (Q-2) | `done` |
| S-022.1 | Verify S-005, scaffold and deploy (GH #1). Known lead: CI runs on pushes to `master` and on pull requests only, not on every push as GH #1 asks | `proposed` |
| S-022.2 | Verify S-006, the deal and the table (GH #2) | `proposed` |
| S-022.3 | Verify S-007, taking a turn (GH #3) | `proposed` |
| S-022.4 | Verify S-008, `chansa` (GH #4) | `proposed` |
| S-022.5 | Verify S-009, `specialkort` and `fyra lika` (GH #5) | `proposed` |
| S-022.6 | Verify S-010, `öppna` and `dolda bordskort` (GH #6) | `proposed` |
| S-022.7 | Verify S-011, the end of the game (GH #7) | `proposed` |
| S-022.8 | Verify S-012, the bot difficulty ladder (GH #8) | `proposed` |
| S-022.9 | Verify S-013, pacing and the status line (GH #9) | `proposed` |
| S-022.10 | Verify S-014, resuming a game (GH #10) | `proposed` |
| S-022.11 | Verify S-015, English and the language toggle (GH #11) | `proposed` |
| S-016.0 | Design note: how each bot level prepares its cards and places cards on opponents; simulation of how `förberedelserundan` changes the game; a playtest plan | `proposed` — game-designer |
| S-016.1 | The same-rank rule (Q-8) and how stacked cards are played (Q-9) in the rules text, `functions/ask.js` and `index.html`, Swedish and English, and in `CONTEXT.md`'s definition of `förberedelserundan` | `proposed` — techlead |
| S-016.2 | Clickable prototype of `förberedelserundan`, for the product owner's approval | `proposed` — ux |
| S-016.3 | How stacked cards on one `öppet bordskort` look | `proposed` — game-artist |
| S-016.4 | `Förberedelserundan` in the engine, test first | `proposed` — backend |
| S-016.5 | The bots' preparation, per level, test first | `proposed` — backend |
| S-016.6 | The UI, from the approved prototype and art | `proposed` — frontend |
| S-016.7 | Acceptance, exploratory and regression testing on the branch preview | `proposed` — qa |

Each S-022 task ticks the criteria that hold, with the test or file that proves it, and files a bug for each one that does not. A criterion that can only be checked by hand on a phone is marked so, for the product owner to check.

**Dependency check:**

| Dependency | State | Unblocks |
|---|---|---|
| The game builds and its tests run | verified 2026-09-27 | S-022 |
| The game's test suite | verified 2026-09-27: 58 tests, all pass | S-022 |
| game.skitgubbe.nu and skitgubbe.nu reachable | verified 2026-09-27: both return 200 | S-022 |
| The GitHub issues, read-only | verified 2026-09-27: public API, no token needed | S-021 |
| Branch previews on Cloudflare, for both projects | verified 2026-09-27: `<branch alias>.skitgubbe-game.pages.dev` and `<branch alias>.skitgubbe.pages.dev` return 200; the alias is the branch name lower-cased, non-alphanumerics as `-`, cut to 28 characters | S-016.2, S-016.3, S-016.7 |
| The rules text may change | approved by the product owner 2026-09-27 (Q-11) | S-016.1 |
| House rules for `förberedelserundan` | decided 2026-09-27 (Q-8, Q-9, Q-10) | S-016.0, S-016.4, S-016.5 |
| Write access to GitHub issues | not available (O-003 deferred); not needed, the issues stay closed as history | — |
| The Cloudflare dashboard | not reachable by agents, by design; S-022 checks the build result from outside only | — |
| A browser `qa` can drive (Playwright) | not available yet, checked 2026-09-27; getting it may need an operator task (O-005) | S-022 in the browser; without it, S-022 checks code and tests only and marks browser criteria "not checked" |

**Code review:**

- **S-021.1 to S-021.4**, branch `techlead/S-021-backlog-and-way-of-working`. Documentation only: `BACKLOG.md`, `CLAUDE.md`, `README.md`, `docs/agents/`, `.claude/agents/`. No code or tests changed; the suite still passes (58 tests).
  - Checked: every story in the backlog against its GitHub issue and every sprint against git history; every decision against the product owner's own words; that no file describes the machines or names a person; that `index.html` and `functions/ask.js` are untouched.
  - `guard`, first pass: BLOCK. Details of the machine in the dependency check and operator tasks; a restated rules-text-precedence rule the product owner had left out; inconsistent S-016 status; a commit without an ID not recorded. All fixed before the second pass.
  - `guard`, second pass: PASS on all ten hard rules.
  - `guard`, third pass, on the squashed commit: PASS on all ten hard rules.
  - History: the work was first done on three branches, `backlog/S-021-backlog-from-history`, `techlead/S-021.3-hard-rules-and-roles` and `techlead/S-021.4-backlog-replaces-issues`. At the product owner's request they were squashed into one commit on the branch above, so that the wording `guard` blocked never reaches `master`'s history, and then deleted. The old branches were public on GitHub until then.
  - At the product owner's request (2026-09-28), every commit in the repository was rewritten to the product owner's anonymous GitHub address and account name, and every commit hash in this file was updated to the rewritten history.
  - Verdict: ready to merge.

**Statistics:** —

**Review:** —

### Sprint 5 — `done` (2026-09-27)

**Goal:** a push to `master` deploys the game, and the game has its own domain.

| ID | Story | Epic | Role | Status |
|---|---|---|---|---|
| O-001 | Recreate the `skitgubbe-game` Pages project Git-connected, root directory `game` | E-2 | operator | `done` |
| O-002 | Custom domain game.skitgubbe.nu | E-2 | operator | `done` |
| S-005b | Links between the rules page and the game; docs and setup script name the new domain | E-2 | techlead | `done` — `16db540`, `e8ce769` |
| B-003 | The rules page's Play link pointed to a domain that does not exist | E-1 | techlead | `done` — `16db540` |

**Dependency check:** not written; reconstructed sprint.

**Code review:** not recorded. Two one-line-per-occurrence changes, each confirmed by a grep that no reference to the old domain remains.

**Statistics:** not recorded.

**Review:**
- Goal met. game.skitgubbe.nu serves the game; the rules page's Play link points to it, and the game's start screen links back.
- The product owner chose game.skitgubbe.nu over the planned spel.skitgubbe.nu.
- What reality caught: a Pages project created by direct upload cannot be converted to a Git-connected one; it had to be deleted and recreated.

### Sprint 4 — `done` (2026-09-05, reconstructed)

**Goal:** the game is worth playing again: real opponents, readable pacing, and it survives a reload.

| ID | Story | Epic | Status |
|---|---|---|---|
| S-012 | Bot difficulty ladder, levels 1–5 (GH #8) | E-4 | `done` — `6e1f545` |
| S-013 | Turn pacing and the status line (GH #9) | E-5 | `done` — `6e1f545` |
| S-014 | Resume an interrupted game (GH #10) | E-5 | `done` — `6e1f545` |
| S-015 | English translation and language toggle (GH #11) | E-5 | `done` — `6e1f545` |
| B-002 | The hand was clipped off both screen edges on a phone past about six cards | E-3 | `done` — `03609fa` |

**Code review:** not recorded. **Statistics:** not available. The work predates sprint statistics.

**Review:**
- Delivered in the same commit as sprints 2 and 3; the GitHub issues were closed the same day with "Delivered in 6e1f545". Their acceptance criteria were never ticked, which is why S-022 exists.
- What reality caught:
  - **The bots could livelock the game.** A bot that saves its `specialkort` can play down to a hand it may not finish on, take `högen`, and repeat forever. The fix is in the bot (`wouldStrandThePlayer` in `game/src/bots/bot.ts`), not the engine. Thirty full bot-vs-bot games in `game/src/engine/game.test.ts` guard against it and must be kept.
  - **B-002** was invisible to every test, because the tests covered rules and bot decisions. The overlap is now computed by a pure, tested function in `game/src/ui/handLayout.ts`.

### Sprint 3 — `done` (2026-09-05, reconstructed)

**Goal:** a full game can be played by the rules, from the first turn to a crowned `skitgubbe`.

| ID | Story | Epic | Status |
|---|---|---|---|
| S-007 | Take a turn: lay cards or take `högen` (GH #3) | E-3 | `done` — `6e1f545` |
| S-008 | `Chansa` (GH #4) | E-3 | `done` — `6e1f545` |
| S-009 | `Specialkort` and `fyra lika` (GH #5) | E-3 | `done` — `6e1f545` |
| S-010 | `Öppna` and `dolda bordskort` (GH #6) | E-3 | `done` — `6e1f545` |
| S-011 | Finish the game and crown a `skitgubbe` (GH #7) | E-3 | `done` — `6e1f545` |

**Code review:** not recorded. **Statistics:** not available.

**Review:** the engine implements the rules as written in the `RULES` constant at the top of `functions/ask.js`.

### Sprint 2 — `done` (2026-09-05, reconstructed)

**Goal:** the game has a foundation: its language and decisions written down, a package that builds and tests in CI, and a correctly dealt table.

| ID | Story | Epic | Status |
|---|---|---|---|
| B-001 | AI rule Q&A answered every question with a generic error | E-1 | `done` — `c31fd25` |
| S-004 | Domain glossary and ADRs 0001–0003 | E-2 | `done` — `52a4ea3` |
| S-005a | `game/` package, Vitest, CI (GH #1, first part) | E-2 | `done` — `6e1f545` |
| S-006 | Deal a game and see the table (GH #2) | E-3 | `done` — `6e1f545` |

**Code review:** not recorded. **Statistics:** not available.

**Review:**
- GH #1 was closed with its deployment still undone; it was finished as S-005b in sprint 5.
- What reality caught: **B-001** had been live for months. The Workers AI model was retired on 2026-05-30, and the error was swallowed into a generic message. The error is now logged. If AI answers break again, check whether the model has been retired before anything else.

### Sprint 1 — `done` (2026-03-30, reconstructed)

**Goal:** a rules reference that teaches a new player the game.

| ID | Story | Epic | Status |
|---|---|---|---|
| S-001 | The rules page (`d5c782b` → `803919a`) | E-1 | `done` |
| S-002 | AI rule Q&A via Workers AI (`51e021c` → `ac6d00d`) | E-1 | `done` |
| S-003 | Swedish and English, Swedish by default (`50c9082`, `ec5988f`) | E-1 | `done` |

**Code review:** not recorded. **Statistics:** not available.

**Review:** the page has real visitors. It is left as it is unless the product owner decides otherwise.

## Waiting on the operator

- ~~**O-001** Recreate the `skitgubbe-game` Pages project Git-connected, root directory `game`, build `npm run build`, output `dist`.~~ Done 2026-09-27. Unblocked S-005b.
- ~~**O-002** Custom domain game.skitgubbe.nu.~~ Done 2026-09-27. Unblocked S-005b.
- **O-003** A fine-grained GitHub token with issue access, so agents can write issues. Deferred by the product owner 2026-09-27. Unblocks nothing while the backlog lives in this file.
- **O-004** Isolate frontend builds from the agents. Proposed; see Q-5.
- **O-005** Whatever a headless browser for `qa` needs that agents cannot set up themselves. To be confirmed when Playwright is first tried.

## Open questions for the product owner

1. ~~**Q-1** Do the ground rules above apply to skitgubbe?~~ Answered 2026-09-27: yes, with two proposed hard rules left out: a rule against deploying with wrangler, and a rule that the rules text in `functions/ask.js` takes precedence over the code.
2. ~~**Q-2** Does `BACKLOG.md` replace GitHub issues?~~ Answered 2026-09-27: yes. `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md` now point here (S-021.4).
3. ~~**Q-3** Which roles, defined in `.claude/agents/`?~~ Answered 2026-09-27: seven roles.
   - `game-designer`: rules interpretation, bot behaviour per level, balance measured by bot-vs-bot simulation, game feel. Proposes; the product owner decides. Writes no game code except the simulation script.
   - `game-artist`: the look of the game: cards, card backs, table, `högen` and `dragstapeln`, icons, motion. Works in SVG and CSS, in the rules page's visual language. Only self-made or openly licensed assets.
   - `ux`: screens and interaction, as clickable prototypes the product owner approves.
   - `backend`: the rules engine and bots, `game/src/engine/` and `game/src/bots/`. Called `backend`, not `engine`, by the product owner's choice.
   - `frontend`: the React UI, `game/src/ui/`, built from approved prototypes and art.
   - `qa`: plays the game in a real browser on the branch preview, at phone and desktop size; acceptance, exploratory and regression testing; reports bugs with steps to reproduce. Owns S-022 and, later, S-019. Added 2026-09-27.
   - `guard`: read-only rule reviewer; no git, no shell.
4. **Q-4** Ask the project this way of working comes from to share its templates (the backlog skeleton, the guard definition, the statistics script), or write our own?
5. **Q-5** Should frontend builds be isolated from the agents (O-004)?
6. **Q-6** Sprint statistics would be public in this repository. Acceptable?
7. **Q-7** "Godkänner du sprint 6?"
8. ~~**Q-8** May any card be placed on an opponent's `öppet bordskort`, or only the same rank?~~ Answered 2026-09-27: **only the same rank.** Moved into S-016. The rules text does not say so yet; see Q-11.
9. ~~**Q-9** How are several cards on the same `öppet bordskort` played?~~ Answered 2026-09-27: they are all the same rank (Q-8), and the player may play one or all of them. Moved into S-016.
10. ~~**Q-10** Do bots place cards on the human player's `öppna bordskort` during `förberedelserundan`, and from which level?~~ Answered 2026-09-27: yes, on every level. Moved into S-016.
11. ~~**Q-11** The same-rank rule is not in the rules text in `functions/ask.js` or on the rules page. May it be added?~~ Answered 2026-09-27: yes. Moved into S-016 as S-016.1.
12. **Q-12** B-004: should the rules site serve only its own files? It needs the rules project in the Cloudflare dashboard to publish a folder instead of the repo root, and the rules page's files moved into it. It matters before the repository is made private.

## Later

| ID | Story | Epic | Blocked by |
|---|---|---|---|
| S-017 | Sound | E-5 | Needs a decision on which moments deserve it |
| S-019 | End-to-end tests with Playwright, with delays skipped | E-2 | Waits until the UI stops moving; flaky tests are worse than none |
| S-020 | Score across several games | E-5 | Deliberately out of v1 |
| S-018 | Online multiplayer | E-4 | Deliberately out of v1; `PlayerView` is shaped so it becomes a transport problem |

## Bugs

| ID | Bug | Found | Status |
|---|---|---|---|
| B-004 | The rules site serves every file in the repository, for example `skitgubbe.nu/CONTEXT.md` and `skitgubbe.nu/game/package.json`, because its Pages project deploys the repo root with no build. Harmless while the repository is public; it would expose everything if the repository were made private | Sprint 6, while checking the domain | `open`, see Q-12 |
| B-003 | The rules page's Play link pointed to spel.skitgubbe.nu, which does not exist | Sprint 5, while updating the domain | `done` — `16db540` |
| B-002 | The hand was clipped off both screen edges on a phone past about six cards | In play, on a phone | `done` — `03609fa` |
| B-001 | AI rule Q&A answered every question with a generic error; the Workers AI model had been retired | In production | `done` — `c31fd25` |

## Done

- **Sprint 5** (2026-09-27): O-001, O-002, S-005b, B-003
- **Sprint 4** (2026-09-05): S-012, S-013, S-014, S-015, B-002
- **Sprint 3** (2026-09-05): S-007, S-008, S-009, S-010, S-011
- **Sprint 2** (2026-09-05): B-001, S-004, S-005a, S-006
- **Sprint 1** (2026-03-30): S-001, S-002, S-003
