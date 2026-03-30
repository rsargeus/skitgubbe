# Skitgubbe – Spelregler

An interactive rules reference for **Skitgubbe**, a classic Swedish card game. The site is designed as a learning experience for new players, not just a static reference document.

Live at: [skitgubbe.nu](https://skitgubbe.nu)

---

## Features

- **Learning-first structure** — the page opens with a quick 5-minute overview before going into detailed rules
- **Visual card components** — realistic playing cards with suits and rank, fanned four-of-a-kind display, and an interactive rank order display
- **Visual table diagram** — shows players how cards are physically laid out before the game starts
- **AI Q&A** — visitors can ask questions about the rules in natural language and receive answers powered by Cloudflare Workers AI (Llama 3.1 8B)
- **Sticky navigation** with horizontal scroll on mobile
- **Responsive design** — optimized for both desktop and mobile

---

## Tech stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages |
| AI | Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`) |
| DNS | Cloudflare (nameservers), domain registered at Loopia |
| Frontend | Single-file HTML + CSS + vanilla JS — no framework, no build step |
| Fonts | Google Fonts — Playfair Display (headings), Inter (body) |
| Deployments | Triggered automatically on push to `master` via GitHub integration |

---

## Project structure

```
skitgubbe/
├── index.html          # Entire site — markup, styles and scripts
└── functions/
    └── ask.js          # Cloudflare Pages Function — handles AI Q&A requests
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
