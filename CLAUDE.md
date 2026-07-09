# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static marketing website for DLCAO (Construction · Real Estate · Investments), a Los Angeles-area
general contractor / real estate / investment business. There is no backend, no build step, and no
package manager — every file is hand-authored HTML, CSS, and vanilla JS served as-is.

Deployment is GitHub Pages, serving directly from the repository root at
`https://t0ny75.github.io/dlcao-website/` (this is also the canonical URL baked into `index.html`'s
`<link rel="canonical">` and JSON-LD). Pushing to the default branch is the deployment mechanism —
there is no CI, no `package.json`, and no separate build/publish step.

## Development workflow

- Edit HTML/CSS/JS directly; there is nothing to install or compile.
- To preview locally, serve the repo root with any static file server (e.g. `python3 -m http.server`)
  and open the port in a browser — opening `index.html` via `file://` will break the `fetch()` calls
  used to load `data/*.json`.
- There are no automated tests or linters in this repo. Verify changes by loading the affected page(s)
  in a browser.
- After deploying, the `_base/README.md` workflow notes to re-test PageSpeed (mobile) and, in Google
  Search Console, request re-indexing of changed URLs.

## Architecture

The site is primarily a single long-scroll landing page (`index.html`) with in-page anchor navigation,
plus a set of thinner secondary pages that share the same CSS/JS bundle.

- **`index.html`** — the live homepage. All primary content (`#home`, `#about`, `#construction`,
  `#projects`, `#buy`, `#sell`, `#rental`, `#sold-properties`, `#investors`, `#client-portal`,
  `#estimate`) lives in this one file as anchored sections; the nav in the header just scrolls to them.
  This is the canonical page — treat it as the source of truth for site copy/design.
- **`assets/css/`** — shared stylesheets loaded (in this order) by every current page:
  `styles.css` (base styles), `animations.css`, `responsive.css` (media queries/breakpoints).
- **`assets/js/`**
  - `app.js` — mobile nav toggle, and the site-wide contact-form handling: forms do **not** post to a
    server. `sendWhatsApp()` intercepts submit on `estimateForm`/`buyForm`/`contactForm`/`propertyForm`,
    serializes the field values into a text message, and opens a `wa.me/<COMPANY_PHONE>` deep link with
    the message pre-filled. `COMPANY_PHONE` at the top of the file is the single place to change the
    contact number.
  - `properties.js` — `loadDLCAOData(file)`, a small `fetch()` + JSON helper used to pull in
    `data/*.json` listings client-side.
  - `calculator.js` — logic backing the pages under `calculators/` (ARV/flip math, rental cash flow,
    ROI), keyed off form element IDs on those pages.
  - `seo.js` — currently an empty placeholder ("reserved for future SEO / analytics hooks").
- **`data/*.json`** (`properties.json`, `rentals.json`, `sold.json`) — static listing data (address,
  city, type, Zillow link) fetched client-side; there is no CMS or API behind these.
- **`pages/`** — standalone secondary pages (`about`, `buy`, `sell`, `rental`, `construction`,
  `projects`, `investors`, `contact`, `sold-properties.html`). These are thin placeholder pages that
  share `assets/` via relative `../assets/...` paths, but are largely disconnected from `index.html`'s
  main nav (their own nav is just Home + Contact). Don't assume editing these changes the homepage.
- **`portal/`** (`login.html`, `dashboard.html`) — client portal placeholder pages with no real
  authentication; explicitly described in the markup as "placeholder for future secure access."
- **`calculators/`** (`roi.html`, `fix-flip.html`, `rental-cashflow.html`) — investor-facing financial
  calculators wired to `assets/js/calculator.js`.

### Legacy/duplicate content — don't confuse these with the live site

The repo contains multiple older snapshots of the site that look similar to the live one but are not
served and should not be assumed to be in sync:

- **Root-level `styles.css` / `script.js` / `sold-properties.html`** — an older, self-contained
  iteration of the site kept only because the root `sold-properties.html` still links to them directly
  (`<link href="styles.css">`, `<script src="script.js">`) instead of `assets/`. This is different from
  `pages/sold-properties.html`, which uses the current shared `assets/` bundle.
- **`_base/`** — a separate "DLCAO Enterprise v25 Performance + Platform Base" bundle (see
  `_base/README.md`) with its own complete `index.html`/`styles.css`/`script.js`/`robots.txt`/
  `sitemap.xml`. It's a reference/upload template, not the deployed site.
- **`dlcao_enterprise_v26_platform_structure/`** — a near-complete duplicate of the entire live site
  (its own `index.html`, `assets/`, `pages/`, `portal/`, `calculators/`, `data/`, `robots.txt`,
  `sitemap.xml`). Its `pages/`, `portal/`, `calculators/`, and `data/` contents are byte-identical to
  the root versions; only `index.html` and `assets/css/styles.css` / `assets/js/app.js` differ slightly
  (mostly SEO meta-description wording — this copy is missing the `<link rel="canonical">` tag the root
  has). Treat it as an unmerged/staged scaffold, not a place to make live changes.

When a task says "update the site" without further qualification, make the change in the root files
(`index.html`, `assets/`, `pages/`, `portal/`, `calculators/`, `data/`) — that's what's actually served.
Only touch `_base/` or `dlcao_enterprise_v26_platform_structure/` if the task explicitly references them.

## SEO/deployment conventions

- `index.html` embeds JSON-LD (`@graph` with `Organization` and `LocalBusiness`) in the `<head>`;
  keep the `@id`/`url` values pointed at the canonical `https://t0ny75.github.io/dlcao-website/`.
- `robots.txt` allows all crawling and points to `sitemap.xml`; `sitemap.xml` currently lists only the
  root URL.
- `site.webmanifest` sets `start_url: "/dlcao-website/"` — keep this consistent with the GitHub Pages
  project path if the repo/site path ever changes.
