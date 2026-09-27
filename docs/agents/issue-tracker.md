# Issue tracker: BACKLOG.md

The backlog for this repo lives in one Markdown file, `BACKLOG.md` at the repo root. The product owner decided on 2026-09-27 that it replaces GitHub issues (Q-2). The GitHub issues #1–#11 are closed and kept as history; every one of them is a story in `BACKLOG.md`, marked `GH #n`. Do not open new GitHub issues.

## Conventions

- **Create an item**: add it to `BACKLOG.md` with the next free ID of its kind (`S-`, `B-`, `O-`, `Q-`). A new story goes under its epic and in **Later**, a bug in **Bugs**, a question in **Open questions**. Never add an item to a running sprint without the product owner's approval.
- **Read an item**: search `BACKLOG.md` for its ID. Its commits are found with `git log --grep "<ID>"`.
- **List open work**: the newest sprint's story and task tables, **Waiting on the operator**, **Open questions** and **Later**.
- **Comment on an item**: add a dated note under it. An answered question keeps its answer and date, is struck through, and its decision moves into the item it unblocks.
- **Change status**: edit the status in the sprint table: `proposed`, `todo`, `in progress`, `blocked (reason)`, `done`, with the commit when done.
- **Close**: an item is `done` when it has passed `guard`, has a recorded techlead code review, and is merged. List it under **Done**.

Every change to `BACKLOG.md` is committed like any other change: on a branch, with its ID first in the commit message.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

Add the item to `BACKLOG.md` as above.

## When a skill says "fetch the relevant ticket"

Read the item's section in `BACKLOG.md`, and for a story that began as a GitHub issue, the closed issue `GH #n` for its original discussion.

## Wayfinding operations

Used by `/wayfinder`.

- **Map**: the epic in `BACKLOG.md`, with its stories as the children.
- **Child ticket**: a story or task under that epic.
- **Blocking**: a `blocked (reason)` status, or a row in **Later** whose "Blocked by" column names the blocker.
- **Frontier query**: the first `todo` item in the newest approved sprint whose blockers are all `done`.
- **Claim**: set the item to `in progress` and name the role.
- **Resolve**: set it to `done` with its commit, and record any decision in the item.
