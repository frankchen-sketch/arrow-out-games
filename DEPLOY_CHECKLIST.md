# Deploy Checklist

This document is the source of truth for public launch, Pages deployment, and domain replacement.

## Public launch path

- Publish the site first on a Cloudflare Pages default subdomain.
- Use `Framework preset = None`.
- Leave `Build command` empty.
- Set `Build output directory = site`.

## Repository and Pages setup

- Confirm the GitHub remote used for deployment is correct.
- Push the current launch-ready branch to the remote repository.
- Create the Cloudflare Pages project from the GitHub repository.
- Confirm the first deployment completes successfully.

## Public URL replacement

- Choose the first public URL, which can be the Cloudflare Pages subdomain.
- Run `npm run set-domain -- https://your-project.pages.dev` with the real public URL.
- Run `npm run verify:production` after replacing the domain.
- Confirm `canonical`, `og:url`, `twitter:image`, `robots.txt`, and `sitemap.xml` all point to the same public URL.
- Confirm the current public URL resolves publicly before treating device QA or AdSense review as complete.

## Email Routing

- For the first `pages.dev` launch, keep a real mailbox visible on public pages, such as `a839500525@126.com`.
- Confirm Contact, About, Privacy, Terms, and DMCA pages all point users to the current public support mailbox.
- Send a real external test email to the currently published contact mailbox and confirm it is received before launch.
- If you later buy a custom domain, then add domain email routing or hosted email before switching the public contact address.

## Post-deploy checks

- Open the homepage, `/games/arrow-maze/`, `/contact.html`, `/robots.txt`, `/sitemap.xml`, and `/404.html`.
- Confirm HTTPS is active and assets load without 404s.
- Confirm `Arrow Out` and `Arrows Go` are not present in the sitemap.
- Confirm the internal `launch-readiness.html` page is not present in the sitemap.

## Search submission follow-up

- Submit `sitemap.xml` to Google Search Console after the public site is live.
- Submit the site to Bing Webmaster Tools after the public site is live.
- If a branded custom domain is added later, rerun the domain replacement and production verification pass.
