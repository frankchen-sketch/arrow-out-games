# AdSense Precheck

This document is the source of truth for pre-submission content and trust checks.

## Review build rules

- `Arrow Maze` is the only real playable browser game in the current public review build.
- `Arrow Out` and `Arrows Go` are overview pages and should remain `noindex, follow`.
- `launch-readiness.html` is an internal noindex status page and must stay out of the sitemap.
- No external iframe game source, ad script, analytics SDK, or third-party tracking script should be added in this stage.
- The current ad layout plan is conservative display-only placement: no popunder, forced interstitial, auto redirect, or default-on social bar.

## Content and trust checks

- Confirm `Arrow Maze` includes original game content, controls, FAQ, and Credits / License.
- Confirm the current public Arrow Maze build is stable on mobile after the touch-control anti-zoom fix.
- Confirm `Arrow Out` and `Arrows Go` do not pretend to be live playable pages.
- Confirm About, Contact, Privacy, Terms, and DMCA are all accessible from the public site.
- Confirm the public `Contact` page uses a real working mailbox before public launch.
- Confirm the currently published contact mailbox can receive a real external test message before submission.
- Confirm no page introduces adult, gambling, hateful, infringing, or otherwise unsafe material.

## Policy and transparency checks

- Confirm `Privacy Policy` matches the current live stack and does not imply tools that are not actually installed.
- Confirm `Terms of Service` clearly explains that some pages are reference pages rather than active playable builds.
- Confirm `DMCA` points to the shared contact route and explains what a copyright report should include.
- Confirm there is no visible placeholder policy wording that reads like unfinished legal text.

## Submission notes

- Keep `Arrow Maze` as the main public entry point while the site is under review.
- Do not expand the sitemap with noindex pages.
- Treat unresolved public-domain reachability on the current public URL as a hard blocker for submission.
- Level 10 finish visibility is no longer a submission blocker on the current public build.
- If display ads are tested later, keep them below the main task flow and outside the Arrow Maze canvas, HUD, and mobile control region.
- If ads or analytics are added later, update this document and the relevant policy pages before submitting changes.
