# Skitgubbe

Rules reference site for the Swedish card game Skitgubbe, live at [skitgubbe.nu](https://skitgubbe.nu).

Single-file static site (`index.html`) on Cloudflare Pages, with one Pages Function (`functions/ask.js`) serving AI rule Q&A via Workers AI. No build step, no framework. See `README.md` for the full tech stack.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `rsargeus/skitgubbe`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage labels, used unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
