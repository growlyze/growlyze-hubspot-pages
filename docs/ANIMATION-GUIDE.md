# Growlyze Site: Animation Guide and New Landing Page Recipe

Written for: developers working on this repo, and anyone building a new landing page for a paid campaign.

This file covers two things:

1. [How the site's motion works](#1-how-the-site-moves): the libraries, shared presets, and every animation pattern in use.
2. [Building a new landing page](#2-building-a-new-landing-page): the two routes that exist today and a step-by-step recipe for each.

---

## 1. How the site moves

### 1.1 The stack

| Layer | Library / tech | Where it lives |
|---|---|---|
| Component animation (enter, hover, tap, layout) | `motion` (Framer Motion v12) | Imported in most `src/components/**` files |
| Smooth scrolling | `lenis` | [src/lib/lenis.tsx](../src/lib/lenis.tsx), mounted in [src/app/layout.tsx](../src/app/layout.tsx) |
| Feature-trimmed motion bundle | `LazyMotion` with `domAnimation` | [src/components/layout/FramerMotionProvider.tsx](../src/components/layout/FramerMotionProvider.tsx) |
| Shared animation presets | `fadeUp`, `fadeIn`, `staggerContainer`, `slideDown` | [src/lib/animations.ts](../src/lib/animations.ts) |
| Looping CSS animations | Tailwind v4 `@theme` keyframes and plain CSS keyframes | [src/app/globals.css](../src/app/globals.css) |
| Scroll reveal for server-rendered content | `Reveal` wrapper | [src/components/blog/Reveal.tsx](../src/components/blog/Reveal.tsx) |
| Landing page reveal and interaction | CSS `.rv` class plus an `IntersectionObserver` | [src/app/lp/law-firms/LpBehaviour.tsx](../src/app/lp/law-firms/LpBehaviour.tsx) |

`lottie` and the `public/animations/flow3.*` files exist but nothing in `src/` references them. Treat them as unused unless you find a use.

### 1.2 Global setup

**Provider order** in the root layout is `FramerMotionProvider` (wraps everything), then `LenisProvider`. Every page inherits both, so a page never needs to set them up.

**Lenis** (smooth scroll):
- Duration 1.2s, custom exponential ease-out, vertical only, wheel multiplier 0.95.
- Anchor links (`href="#contact"`) are intercepted and scroll with an `offset: -85` so the fixed navbar does not cover the target.
- Scrolls to the top on route change. Lenis is not created at all when the user has `prefers-reduced-motion: reduce`.
- Any scrollable element that must keep native scrolling needs `data-lenis-prevent`. The mega-menu uses it.

**LazyMotion** means components should import the lightweight `m` component, not `motion`:

```tsx
import { m as motion } from "motion/react"   // correct: works with LazyMotion
import { motion } from "motion/react"        // works, but pulls in the full bundle
```

About 32 files use `m as motion`. Roughly 67 more use the full `motion` import, which defeats the point of `LazyMotion`. New code should use `m`. Existing files can be migrated when they are touched.

**Global CSS** in [globals.css](../src/app/globals.css) sets `scroll-behavior: auto` on `html`, so smooth scrolling comes only from Lenis.

### 1.3 Shared presets

All defined in [src/lib/animations.ts](../src/lib/animations.ts):

| Preset | What it does | Used for |
|---|---|---|
| `fadeUp` | Opacity 0 → 1 and y 24 → 0, 0.6s, `[0.25, 1, 0.5, 1]` | Almost every section heading, paragraph and card |
| `fadeIn` | Opacity only, 0.5s | Quiet fades |
| `staggerContainer` | Parent that staggers children by 0.1s, first child after 0.1s | Lists and grids of `fadeUp` children |
| `slideDown` | Opacity 0 → 1 and y −20 → 0, 0.5s | Navbar items |

The easing `[0.25, 1, 0.5, 1]` (a fast start with a long soft landing) is the house easing. Use it for new motion so the site feels consistent.

### 1.4 Animation patterns in use

#### A. Scroll-triggered reveal (most common)

This is the standard section animation. The section wrapper uses `initial="hidden"` and `whileInView="visible"`:

```tsx
<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
>
  <motion.h2 variants={fadeUp}>...</motion.h2>
  <motion.p variants={fadeUp}>...</motion.p>
</motion.div>
```

- `once: true` means the animation plays once and stays. Keep this on.
- The `margin` controls how far into the viewport an element must be before it triggers. The site uses `-100px` (about 92 places) or `-50px` (about 91 places). Use `-100px` for big sections and `-50px` for small items.

Where it is used: nearly every section component, for example `src/components/sections/*` and `src/components/services/*/ProblemSection.tsx`, `ProofSection.tsx`, `FaqSection.tsx` and so on.

For server-rendered content (for example blog body sections), wrap the content in `<Reveal>` from [Reveal.tsx](../src/components/blog/Reveal.tsx) instead of writing the motion props each time. Pass `stagger` when the children are themselves `motion` elements, such as a grid of blog cards.

#### B. Hero entrance

The hero plays on load, not on scroll: `initial="hidden" animate="visible"`, with a `staggerChildren: 0.1` and `delayChildren: 0.15` container. The headline is a single `h1` split into spans, and the subtext and CTAs use `fadeUp`. See [HeroSection.tsx](../src/components/sections/HeroSection.tsx).

The service-page heroes (for example [services/*/HeroSection.tsx](../src/components/services)) follow the same pattern.

#### C. Navbar

- The nav fades and drops in on load (`opacity` and `y` over 0.4s).
- Items inside the nav use `slideDown` with `staggerContainer`.
- The mobile menu uses `AnimatePresence` for enter and exit.
- The desktop mega-menu is a CSS transition (`transition-all duration-300` with `origin-top`), not a `motion` component.
- The logo has a small scale-in on load.

Source: [Navbar.tsx](../src/components/layout/Navbar.tsx).

#### D. Buttons

Two layers:

1. **Neobrutalist CSS** (`.btn-neobrutalist` and variants in `globals.css`): a hard offset shadow (`3px 3px 0 #140827`). On hover it moves 1px and the shadow shrinks. On press it moves 3px and the shadow disappears. Transitions are 0.1 to 0.2s.
2. **Motion tap feedback** on primary CTAs: `whileTap={{ scale: 0.94 }}` with a spring (`stiffness: 500, damping: 20`).

#### E. Click ripple

[Ripple.tsx](../src/components/ui/Ripple.tsx) exports `useRipple()` and `RippleLayer`. Attach `addRipple` to `onMouseDown` and render `RippleLayer` inside the button (the button needs `relative overflow-hidden`). The ripple is a white circle that scales from 0 and fades over 0.6s. It is used on the hero CTAs.

#### F. Continuous (looping) motion

These run forever and are defined in CSS, not `motion`:

| Name | Where | What it does |
|---|---|---|
| `marquee-up` / `marquee-down` | `globals.css`, used by `TestimonialsSection.tsx` | Vertical auto-scroll columns, 45s. Pauses on hover with `animation-play-state`. |
| `ticker-left` | `globals.css`, used by `LogoBar.tsx` | Logo strip scrolls left, 120s. |
| `float-cyl` / `rotate-cyl` | `globals.css`, used by `HeroIllustration.tsx` | Hero illustration bobs (5s) and rocks in 3D (4s). |
| `ecom-glow-a`, `ecom-glow-b`, `ecom-grid-pan`, `ecom-scan` | `globals.css`, used by `components/industries/ecommerce/EcommerceHeroBackdrop.tsx` | Ambient backdrop on the e-commerce hero: two glow blobs, a panning grid and a scan line. Decorative and `aria-hidden`. |
| `lp-state`, `lp-knob`, `lp-tick` | `app/lp/law-firms/motion.css` | Response-time board on the law-firm landing page. Cycles four states over 14s. |

Rule of thumb: use CSS for looping motion that does not depend on React state, and `motion` for anything tied to scroll, hover or state.

#### G. Scroll-linked motion

[PrincipalSection.tsx](../src/components/sections/PrincipalSection.tsx) uses `useScroll` with `scrollYProgress` to tie motion to the scroll position. This is the only scroll-linked effect; everything else is a one-time reveal.

#### H. Hover and micro-interactions (CSS)

- Logo bar items scale to 1.05 on hover (`.logo-bar-item`).
- Nav links transition colour over 0.2 to 0.3s.
- The "back to top" button (`BackToTop.tsx`) fades and scales in with `AnimatePresence`, and uses the same neobrutalist shadow.
- Blog body links use the same hard-shadow press effect as the buttons.

#### I. Interactive animation

[CaseJourneyPlayer.tsx](../src/components/legal/CaseJourneyPlayer.tsx) and the `legal/*Flowchart` / `*Lifecycle` components are playable diagrams that step through a process. They are the most complex animated components on the site.

### 1.5 Reduced motion

The site respects `prefers-reduced-motion` in several places, but not everywhere:

| Area | Status |
|---|---|
| Lenis smooth scroll | Disabled when reduced motion is on. |
| E-commerce hero backdrop | Glows and grid stop; scan line hidden. |
| Law-firm landing page | Reveal shows content immediately; response-time board shows its final state, held still. |
| Global `authored.css` (landing page) | Collapses all animation durations to near zero. |
| **Framer Motion components** (sections, navbar, hero, buttons) | **Not handled.** There is no `MotionConfig reducedMotion="user"` anywhere in the code. |

**Gap:** most of the site's entrance animations ignore the user's motion setting. The one-line fix is to wrap the app in `<MotionConfig reducedMotion="user">` inside [FramerMotionProvider.tsx](../src/components/layout/FramerMotionProvider.tsx). This has not been made yet.

### 1.6 Performance rules

- Animate `transform` and `opacity` only. Those are GPU-friendly. Avoid animating `top`, `left`, `width` or `height`, except for the one landing-page board that already uses `left` (it is small).
- Add `will-change: transform` only to elements that actually move continuously (the glows, marquees and ticker). Do not add it everywhere.
- Use `viewport={{ once: true }}` so observers are removed after the first trigger.
- The logo ticker in `LogoBar.tsx` renders the logo list twice (`doubled`) and animates `-50%`, so the loop is seamless. Keep that pattern for any new marquee.

---

## 2. Building a new landing page

There are two routes in the codebase that work differently. Pick the one that matches the job.

| | **A. Component page** (like `/services/*`) | **B. Standalone landing page** (like `/lp/law-firms`) |
|---|---|---|
| Use for | Long-term SEO pages, service pages, industry pages | Paid ad destinations with one call to action |
| Indexed? | Yes | No (`robots: { index: false }`) |
| Built from | React components reused from `src/components/` | Hand-written HTML injected into a React route |
| Motion | `motion` components and `fadeUp` presets (section 1) | `.rv` class with an `IntersectionObserver`, plus `motion.css` |
| Nav and footer | Shared `Navbar` and `FooterSection` | Its own nav, one CTA |
| Who edits it | Developers | Campaign owners can edit the HTML directly |

**Default to A** unless the page is for a paid campaign. Two law-firm pages were kept out of the index on purpose because near-identical copy competes in search.

### 2A. Component page (SEO or service page)

Reference: [src/app/services/crm-migration/page.tsx](../src/app/services/crm-migration/page.tsx).

1. **Create the folder and page**

   ```
   src/app/services/<slug>/page.tsx
   ```

   Use the existing service page as the template. Set `metadata` (title and description) at the top.

2. **Build the sections** in `src/components/services/<slug>/`. Copy the closest existing set, for example `hubspot-services/` or `revops/`, and edit the copy. Each section should:
   - Be a client component (`"use client"`) if it uses `motion`.
   - Wrap its content in a `motion.div` with `variants={staggerContainer}`, `initial="hidden"`, `whileInView="visible"` and `viewport={{ once: true, margin: "-100px" }}`.
   - Give each heading and paragraph `variants={fadeUp}`.

3. **Compose the page** in this order (matches the existing pages):

   ```tsx
   <main className="flex min-h-screen flex-col bg-[#140827]">
     <Navbar />
     <HeroSection />
     <LogoBar bgClass="bg-white" borderClass="border-b-2 border-black" />
     {/* problem, what we do, scope, process, proof, fit, FAQ */}
     <ContactSection />
     <PlatformPartnersSection />
     <FooterSection />
   </main>
   ```

4. **Add the page to the sitemap** in [src/app/sitemap.ts](../src/app/sitemap.ts) and to [llms.txt](../src/app/llms.txt) if it should be discoverable.

5. **Check motion**: run `npm run dev` on port 5051, scroll the page, and check that sections reveal once. Then check it with reduced motion turned on in the OS.

### 2B. Standalone landing page (paid campaign)

Reference: [src/app/lp/law-firms/](../src/app/lp/law-firms/).

The folder has these parts:

| File | Role |
|---|---|
| `page.tsx` | Route and `metadata`. Sets `robots: { index: false, follow: false }`. |
| `LandingPage.tsx` | Reads `content-<variant>.html` from disk and injects it. Loads the booking widget script and `LpBehaviour`. |
| `content-*.html` | The page markup: the source of truth for copy and layout. |
| `authored.css` | Styles for the page, generated from the HTML. **Do not hand-edit.** |
| `brand.css` | Maps the page onto Growlyze's type and colours (Switzer, `#f55809`). |
| `motion.css` | Hand-written motion and fixes that must survive regeneration. |
| `LpBehaviour.tsx` | Scroll reveal, the draggable board, and the conversion event. |

**Recipe:**

1. **Create the folder**: `src/app/lp/<slug>/`.

2. **Copy the structure** from `law-firms/`: `page.tsx`, `LandingPage.tsx`, `LpBehaviour.tsx`, `brand.css`, `motion.css`, and one `content-*.html`. Copy `authored.css` too, if you want the same base styles.

3. **Write the markup** in `content-<variant>.html`. Use these hooks so the built-in motion works:
   - Wrap the whole page in the `lp-root` class (set in `LandingPage.tsx`).
   - Add the class `rv` to any element that should fade up on scroll. It goes from `opacity: 0; translateY(20px)` to visible when it enters the viewport (`.rv.in`).
   - Stagger reveals by adding inline `transition-delay` values (for example `style="transition-delay:.1s"`).

4. **Set the metadata** in `page.tsx` and keep `robots: { index: false, follow: false }` for paid pages.

5. **Wire the booking widget and tracking**: `LandingPage.tsx` already loads `form_embed.js`. Any new tracking event goes in `LpBehaviour.tsx`, triggered when the user reaches the calendar.

6. **Add page-specific motion** to `motion.css` only. Keep the `prefers-reduced-motion` block at the bottom of that file, and add your new animations to it so reduced-motion users see the final state.

7. **Test**:
   - Scroll the full page on desktop and mobile. Every `.rv` element should appear once.
   - Turn on reduced motion in the OS. Content must still be visible and nothing should move.
   - Turn off JavaScript. `motion.css` shows `.rv` content by default under `@media (scripting: none)`, so the page must still be readable.

### 2C. Checklist before you publish any new page

- [ ] Copy and headings checked. Heading order is h1, then h2, then h3.
- [ ] Every new section uses the shared presets (`fadeUp`, `staggerContainer`) or the `.rv` class. No ad hoc durations.
- [ ] Animations use `transform` and `opacity` only.
- [ ] `viewport={{ once: true }}` on every `whileInView` element.
- [ ] Reduced motion checked in the OS setting.
- [ ] Page works with JavaScript off (landing pages) or the content is server-rendered (component pages).
- [ ] Sitemap updated for component pages; `robots` set correctly for paid pages.
- [ ] Imports use `m as motion` from `motion/react`, not the full `motion` import.

---

## Known issues and follow-ups

1. **Reduced motion is not applied to Framer Motion components.** Add `<MotionConfig reducedMotion="user">` to [FramerMotionProvider.tsx](../src/components/layout/FramerMotionProvider.tsx).
2. **Most files import the full `motion` instead of `m`**, which defeats `LazyMotion`. Migrate when files are touched.
3. **`public/animations/flow3.json` and `flow3.lottie` are unused.** Delete them or wire them up.
4. **`authored.css` says it is generated** from the source HTML. The generator is not in this repo's `scripts/` folder, so check with whoever produced the law-firm HTML before editing either file.
