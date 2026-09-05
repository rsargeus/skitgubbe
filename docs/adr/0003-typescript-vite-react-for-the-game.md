# The game uses TypeScript, Vite and React, against the grain of this repo

The README describes this repo as "single-file HTML + CSS + vanilla JS — no framework, no build step", and that stays true of the rules page. The game does not follow it.

The rules engine — rank order, `fyra lika` formed across players, `chansa`, the forbidden last moves — is dense logic with many interacting edge cases, and it is built test-first, which requires a test runner and therefore a build. React is there for the UI because the game holds up to four players' three zones plus `högen`, `dragstapeln`, selection and turn state; keeping the DOM in sync with that by hand is where the bugs would go. Vite rather than the esbuild-plus-hand-written-script setup in the author's `chess` repo, because React development leans on a dev server with hot reload.

The rules engine itself stays free of React and of the DOM: state and a move in, new state out, testable with no browser present.
