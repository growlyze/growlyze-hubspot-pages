# SETUP.md: instructions for Claude

You are setting up the Growlyze HubSpot landing pages. Read this whole file, then do every step in **Set it up** without asking for confirmation. When you're done, report the three local URLs and the result of each check.

## What this project is

Three static landing pages for Growlyze, a HubSpot Solutions Partner. They're plain HTML, CSS and JS with no build step and no npm dependencies.

| Page | File | Local URL |
|---|---|---|
| HubSpot Implementation | `growlyze-hubspot-implementation.html` | http://localhost:8080/hubspot-implementation |
| HubSpot CRM Migration | `growlyze-hubspot-migration.html` | http://localhost:8080/hubspot-migration |
| HubSpot Onboarding | `growlyze-hubspot-onboarding.html` | http://localhost:8080/hubspot-onboarding |

`server.js` is a small Node server with no dependencies. It serves the pages at clean URLs, sends `charset=utf-8`, and supports video byte-range requests.

## Set it up

1. **Check Node.js.** Run `node --version`. You need v18 or newer. If Node is missing, install the current LTS from https://nodejs.org (on Windows, `winget install OpenJS.NodeJS.LTS`) and then confirm the version.
2. **Go to the repository root**, the folder that contains `server.js`.
3. **Start the server in the background:** `npm start` (same as `node server.js`). It prints `Growlyze preview running at http://localhost:8080`.
   - If port 8080 is busy, run it with `PORT=8081` (bash) or `$env:PORT=8081` (PowerShell), and use that port in every URL below.
4. **Check that each page returns HTTP 200:**
   ```bash
   for p in hubspot-implementation hubspot-migration hubspot-onboarding; do curl -s -o /dev/null -w "$p %{http_code}\n" http://localhost:8080/$p; done
   ```
5. **Check assets.** Pick a few `images/...` and `assets/testimonials/...` paths referenced in the HTML and confirm they return 200. The only expected 404s are `assets/testimonials/client-5.mp4` and `client-5.jpg`, which aren't uploaded yet. The page shows a "Video coming soon" placeholder for them.
6. **Open the three URLs** in the user's browser and tell them setup is complete.

## Folder layout

```
growlyze-hubspot-implementation.html   Implementation page (rebuilt from the live version)
implementation-refinements.css         Extra styles used only by the implementation page
implementation-refinements.js          Hero animation, intent switch, written-inquiry form (implementation only)
growlyze-hubspot-migration.html        Migration page
growlyze-hubspot-onboarding.html       Onboarding page
images/                                All images, shared by all pages (logos, badges, client logos, reviewer photos)
assets/testimonials/                   Testimonial videos client-1..5.mp4 and preview images client-1..5.jpg
server.js                              Local preview server
_originals-DO-NOT-USE/                 The untouched source files this work started from. Reference only.
```

## Rules for editing these pages

- **Never edit or serve anything in `_originals-DO-NOT-USE/`.** Those files are the original, unfixed drafts. They still contain the garbled-character problem, a stray browser-extension widget and inline base64 images.
- **Keep the HTML, CSS and JS files pure ASCII.** Write special characters as escapes:
  - in HTML, use entities: `&#x2713;` for ✓, `&#x2019;` for ’, `&#x2192;` for →
  - in `<script>` and `.js` files, use `✓`
  - in `<style>` and `.css` files, use `\2713 ` (note the trailing space)

  Some hosts serve HTML without a charset, which turns UTF-8 characters into garbage like `âœ“`. To confirm a file is clean, check that `grep -P '[^\x00-\x7F]' file` prints nothing.
- **Images:** add new images to `images/` with a lowercase, hyphenated name and reference them as `images/name.ext`. Don't embed base64 images.
- **Logo:** `images/growlyze-logo.svg` is the official orange (`#F55809`) Growlyze logo. Don't recolour it.
- **Certification badges** (`images/cert-*.png`) are upscaled from small originals. If official high-resolution badges become available from HubSpot Academy, replace them using the same filenames.
- **Testimonial videos:** to add the 5th video, drop `client-5.mp4` (and optionally `client-5.jpg`) into `assets/testimonials/`. No code change is needed. All three pages share these files.
- **Intent switch (implementation page):** the hero "Already on HubSpot / Starting fresh" switch, the "What you get" tabs and the hero path links stay in sync. That logic is in `implementation-refinements.js`. Keep it if you change any of them.

## Configuration still to be filled in

Each page has a `const CONFIG = {...}` block near the start of its main `<script>`. Search for `ghlWebhookUrl`.

| Key | Purpose | Current value |
|---|---|---|
| `ghlWebhookUrl` | GoHighLevel inbound webhook that receives every form submission | **empty**: leads are only captured when the visitor finishes booking on the calendar |
| `calendarUrl` / `calendarEmbedUrl` | GoHighLevel booking calendar | one shared calendar, `xNcrZ08etA4pCGItEIWf`. The code comments ask for separate "Health Check" and "Free Migration Plan" calendars |
| `showFeeSavings` | Shows the HubSpot onboarding-fee saving | `false` until the waiver terms are confirmed |

When the webhook is empty:
- the booking form redirects to the calendar with name, email and website pre-filled
- the written-quote form on the migration page opens a pre-filled email to hello@growlyze.com
- the implementation page's written-inquiry form shows a "Send" button (disabled until the webhook is set) next to an "email us" link that opens a pre-filled email

Other `[BUILD]` and `[CONFIRM]` comments in the HTML mark remaining tasks: Google Tag Manager snippets, SMS consent wording, and fee-waiver wording.

## Deploying

Upload everything except `_originals-DO-NOT-USE/` and `server.js` to any static host, keeping the folder structure. Serve the HTML with `Content-Type: text/html; charset=utf-8`; the pages also declare `<meta charset="utf-8">`. Remove `<meta name="robots" content="noindex, nofollow">` when the pages go live.
