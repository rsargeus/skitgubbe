# Triage labels

The skills speak in terms of five canonical triage roles. With the backlog in `BACKLOG.md` (see `issue-tracker.md`), each role maps to a place or status in that file rather than to a label.

| Label in mattpocock/skills | In `BACKLOG.md` | Meaning |
| -------------------------- | --------------- | ------- |
| `needs-triage` | A row in **Later** with no sprint | The techlead or product owner needs to evaluate it |
| `needs-info` | An **Open question** `Q-n` that blocks the item | Waiting on the product owner for a decision |
| `ready-for-agent` | `todo` in an approved sprint, with a role | Fully specified, ready for an agent |
| `ready-for-human` | An **operator task** `O-n`, or a criterion marked for a human to check | Needs the operator or the product owner |
| `wontfix` | Struck through, with the decision and date | Will not be actioned |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), set the corresponding status in `BACKLOG.md`.
