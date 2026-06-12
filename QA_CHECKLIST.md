# Arrow Maze QA Checklist

This checklist is the pre-submission validation pass for the current public build.

## Public availability

- Open the current public URL, for example `https://your-project.pages.dev/`, and confirm the homepage resolves publicly.
- Open the current public game URL, for example `https://your-project.pages.dev/games/arrow-maze/`, and confirm the live game page resolves publicly.
- Open the current public Contact, `robots.txt`, `sitemap.xml`, and `404.html` URLs.
- Treat unresolved public DNS, failed HTTPS loading, or mismatched public content as a launch blocker.

## Core playable page

- Open `/games/arrow-maze/` on desktop Chrome or Safari.
- Confirm arrow keys move the marker correctly.
- Confirm `Restart` resets the current level.
- Confirm `Next Level` only unlocks after finishing a level.
- Confirm all fifteen levels can be completed.
- Confirm the visible target-step number matches the current board and that hitting the exact route count records a goal clear.
- Confirm `Replay Run` appears after level fifteen and restarts the sequence from level one without losing saved best-step records.
- Confirm the status text updates after invalid moves, open tiles, and wins.
- Confirm every public `Arrow Out` entry opens the same coming-soon modal instead of a placeholder play box.
- Confirm the modal `Play Arrow Maze` action opens `/games/arrow-maze/`.

## Mobile and narrow screens

- Open `/games/arrow-maze/` on a narrow mobile viewport.
- Confirm the canvas stays inside the page width.
- Confirm the mobile direction buttons are visible and clickable.
- Confirm the game controls and article content do not overlap.
- Confirm the footer links remain readable and tappable.

## Site integrity

- Run `npm run verify`.
- Run `npm run verify:arrow-maze`.
- Confirm there are no missing local resources or broken internal links.
- Confirm `Arrow Out` and `Arrows Go` are overview pages, not fake playable pages.
- Confirm `Contact`, `About`, `Privacy`, `Terms`, and `DMCA` all load and link to one another.
- Confirm public-domain checks are complete before treating local verification as final.

## Pre-submit notes

- `Arrow Maze` is the only real playable game in the current review build.
- `Arrow Out` and `Arrows Go` should remain `noindex, follow` until they gain stronger content or real gameplay.
- Public-domain reachability and cross-device QA on the current public URL are required before submission.
