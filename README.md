# Skitgubbe – Spelregler

An interactive rules reference for **Skitgubbe**, a classic Swedish card game. The site is designed as a learning experience for new players, not just a static reference document.

Live at: [skitgubbe.nu](https://skitgubbe.nu) — and the game at [game.skitgubbe.nu](https://game.skitgubbe.nu)

---

## Features

- **Learning-first structure** — the page opens with a quick 5-minute overview before going into detailed rules
- **Visual card components** — realistic playing cards with suits and rank, fanned four-of-a-kind display, and an interactive rank order display
- **Visual table diagram** — shows players how cards are physically laid out before the game starts
- **AI Q&A** — visitors can ask questions about the rules in natural language and receive answers powered by Cloudflare Workers AI (Llama 3.3 70B)
- **Playable game** — singleplayer against 1–3 bots across five difficulty levels, in `game/`
- **Sticky navigation** with horizontal scroll on mobile
- **Responsive design** — optimized for both desktop and mobile

---

## Tech stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages — two projects: the rules page (no build) and the game (`game/`) |
| Game | TypeScript + Vite + React, tested with Vitest |
| AI | Cloudflare Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) |
| DNS | Cloudflare (nameservers), domain registered at Loopia |
| Frontend | Single-file HTML + CSS + vanilla JS — no framework, no build step |
| Fonts | Google Fonts — Playfair Display (headings), Inter (body) |
| Deployments | Triggered automatically on push to `master` via GitHub integration |

---

## Project structure

```
skitgubbe/
├── index.html          # Rules page — markup, styles and scripts in one file
├── CONTEXT.md          # Domain glossary: the Swedish game terms, defined
├── docs/
│   ├── adr/            # Architecture decision records
│   └── agents/         # Issue tracker, triage labels and domain doc conventions
├── functions/
│   └── ask.js          # Cloudflare Pages Function — handles AI Q&A requests
├── game/               # The playable game (own package, own Pages project)
│   └── src/
│       ├── engine/     # Rules engine: pure data and functions, no DOM
│       ├── bots/       # One bot, five difficulty levels
│       ├── ui/         # React components
│       └── i18n/       # Every user-facing string, Swedish and English
└── scripts/
    └── setup-game-pages.sh   # Wizard for the game's Cloudflare Pages project
```

### `game/`

The rules engine is plain data and functions with no React and no DOM, so it can
be tested on its own — and it is, thoroughly, because Skitgubbe's rules interact
in ways that are easy to get subtly wrong. Bots never see the game state: they
receive a `PlayerView` that physically omits hidden cards, so a bot cannot cheat
even by accident. See [`docs/adr/`](./docs/adr/).

```bash
cd game
npm install
npm run dev      # local dev server
npm test         # Vitest
npm run build    # type-check and build to game/dist
```

### `index.html`

All HTML, CSS and JavaScript lives in a single file. The CSS uses CSS custom properties (`--gold`, `--felt`, etc.) for a consistent design token system. No preprocessor or bundler is used.

### `functions/ask.js`

A Cloudflare Pages Function exposed at `POST /ask`. It receives a JSON body `{ question: string }`, prepends the full game rules as a system prompt, and queries the Cloudflare Workers AI binding (`env.AI`). The AI binding must be configured in the Cloudflare Pages dashboard under **Settings → Bindings → Workers AI** with the variable name `AI`.

---

## Local development

No install required. Serve the root directory with any static file server:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

> Note: the AI Q&A endpoint (`/ask`) requires a Cloudflare Workers AI binding and will not work locally without Wrangler. All other functionality works offline.

---

## Deployment

Deployments are triggered automatically when changes are pushed to the `master` branch. Cloudflare Pages builds and deploys within ~1 minute.

To deploy manually via CLI:

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name skitgubbe
```
