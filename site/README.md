# Arrow Out Games MVP

This is the first-stage static MVP for the `Arrow Out` validation site.

## Directory

- `index.html` - homepage
- `games/arrow-out.html` - primary game detail page
- `games/arrows-go.html` - adjacent detail page
- `categories/arrow-puzzle-games.html` - category page
- `articles/games-like-arrow-out.html` - long-tail content page
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
- placeholder `https://example.com` URLs
- sitemap entry count
- robots sitemap format
- placeholder domain warnings

## Domain replacement

Before production launch, replace all `https://example.com/...` URLs in:

- HTML `canonical` tags
- HTML Open Graph / Twitter sharing URLs
- `robots.txt`
- `sitemap.xml`

with your final production domain.

Helper:

```bash
npm run set-domain -- https://your-domain.com
npm run verify:production
```

## Local preview

If you want to preview the site locally:

```bash
npm run preview
```

Then open [http://localhost:4173](http://localhost:4173).
