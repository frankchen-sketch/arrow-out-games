# Arrow Games Hub MVP

This is the first-stage static MVP for the `Arrow Out` validation site.

## Directory

- `index.html` - homepage
- `contact.html` - public contact page
- `games/arrow-out.html` - primary game detail page
- `games/arrows-go.html` - adjacent detail page
- `games/arrow-maze/index.html` - live playable game page
- `categories/arrow-puzzle-games.html` - category page
- `articles/games-like-arrow-out.html` - long-tail content page
- `launch-readiness.html` - internal noindex status page
- `assets/styles.css` - shared styling
- `assets/app.js` - small interaction script
- `robots.txt`
- `sitemap.xml`

## Recommended deployment

Default recommendation: **Cloudflare Pages**

### Pages settings

- Framework preset: `None`
- Build command: leave empty
- Build output directory: `site`

## Local validation

From the project root:

```bash
npm run verify
```

This checks:

- missing local `href` / `src` targets
- missing canonical tags
- missing Open Graph / Twitter sharing tags
- missing default share image
- placeholder production URL warnings
- sitemap entry count
- robots sitemap format
- placeholder domain warnings

Arrow Maze-only checks are also available:

```bash
npm run verify:arrow-maze
```

Difficulty-curve analysis for the live Arrow Maze level set:

```bash
npm run analyze:arrow-maze
```

## Domain replacement

Before production launch, replace all placeholder production URLs in:

- HTML `canonical` tags
- HTML Open Graph / Twitter sharing URLs
- `robots.txt`
- `sitemap.xml`

with your final production domain.

Helper:

```bash
npm run set-domain -- https://your-project.pages.dev
npm run verify:production
```

Current production domain:

```bash
npm run set-domain -- https://your-project.pages.dev
npm run verify:production
```

For launch process notes, use:

- `QA_CHECKLIST.md`
- `ADSENSE_PRECHECK.md`
- `DEPLOY_CHECKLIST.md`

For Arrow Maze balancing notes, use:

- `site/internal/arrow-maze-balance.html`

## Local preview

If you want to preview the site locally:

```bash
npm run preview
```

Then open [http://localhost:4173](http://localhost:4173).
