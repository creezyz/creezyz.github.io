# CREEZYZ — Personal Portfolio (Persona 5 Blue Edition)

A personal "about me" website heavily inspired by the user-interface design of the Persona 5 video game series. The site presents a single-page portfolio with collapsible cards for an About section, a separate projects page, and a small German Wordle clone as a side project.

## About the Owner

Hi, I'm Rick, known online as **creezyz**, a 9th-grade student from the Chemnitz area in Germany. This site is my personal hub — a place to drop my social links, my experiments, and the occasional small tool I built just to see if it works.

## Design Philosophy

The visual language borrows three signature traits from the Persona menu UI:

1. **Ransom-note typography** — the title is hand-arranged: each letter of `CREEZYZ` is individually skewed, rotated, given its own border and sometimes its own background, the way cut-out magazine letters are pinned to a wall.
2. **Sliced clip-paths** — every container, button and badge uses one or more `polygon(...)` clip-paths with at least one diagonal edge so that nothing in the layout is a perfectly square rectangle.
3. **Hard offset shadows** — buttons, cards and badges all use stark black or accent-coloured drop shadows that sit flush beneath the element, never softly blurred.

A secondary **blue** accent palette was chosen for the current revision to move away from the original red while keeping the same dramatic contrast between light and dark surfaces (cream vs. anthracite).

## Colour System

| Token | Hex | Usage |
|-------|-----|-------|
| `--p5-blue` | `#2563eb` | Primary accent (buttons, badges, links) |
| `--p5-blue-bright` | `#3b82f6` | Highlight rings, active borders |
| `--p5-blue-dark` | `#1d4ed8` | Drop shadows, depth |
| `--p5-blue-glow` | `rgba(37, 99, 235, 0.45)` | Hover / focus glow |
| `--p5-blue-soft` | `rgba(37, 99, 235, 0.18)` | Diagonal stripe overlay |
| `--p5-cream` | `#fdfbf7` | Light-mode background |
| `--p5-cream-soft` | `#f5efe3` | Light-mode card surface |
| `--p5-cream-edge` | `#e8dfca` | Light-mode separator |
| `--p5-anthracite` | `#1c1c22` | Dark-mode background |
| `--p5-anthracite-soft` | `#27272f` | Dark-mode card surface |
| `--p5-anthracite-light` | `#34343d` | Dark-mode raised elements |
| `--p5-white` | `#ffffff` | Hard contrast / text |
| `--p5-black` | `#000000` | Hard contrast / shadows |

The light / dark switch is exposed as an explicit button (`#themeToggle`) and persisted in `localStorage`. On first visit the system uses `prefers-color-scheme` as the default.

Typography stack:

- **Anton / Impact** — display titles, badges, buttons (compressed, all-caps, condensed)
- **Inter** — body text and long-form paragraphs
- **Courier New** — system hints and meta-labels

## Feature List

- Animated particle canvas background (cream dots with rare blue-tinted accents).
- Diagonal striped overlay (`bg-stripes`) that drifts slowly across the page.
- Top accent bar that pulses a soft blue glow.
- Ransom-note `CREEZYZ` title with hover-flip animation per letter.
- Collapsible About card (toggle via `toggleAbout()`).
- Collapsible Socials card with five social links (toggle via `toggleConnect()`).
- Dedicated projects page (`projects.html`) with a Wordle entry-point modal.
- Self-contained German Wordle clone in `/wordle` that fetches its word list from `words.txt`.
- Per-page theme toggle that stays in sync with the main page through `localStorage`.
- Responsive layout that scales gracefully down to ~360 px wide.
- Accessibility: `aria-label`s on icon-only buttons, focusable inputs.

## File Structure

```
.
├── index.html         Landing page (About + Socials toggles)
├── projects.html      Project showcase + Wordle modal
├── style.css          Shared design system for index / projects
├── script.js          Particles, theme toggle, modal, section toggles
├── README.md          This file
└── wordle/
    ├── wordle.html    Wordle game markup
    ├── script.js      Game logic (German words)
    ├── style.css      Wordle subpage styling (mirrors main theme)
    └── words.txt      Word list (one entry per line)
```

## Build Process

This site went through four iterations:

### v0 — Plain HTML
A minimal landing page with hand-written links, no interactivity beyond plain `<a>` tags. Functional but not visually memorable.

### v1 — First Persona 5 redraft
The ransom-note `CREEZYZ` title was introduced, followed by `clip-path` sliced boxes, a hard-offset shadow system, and a red-on-black accent. The particle canvas and diagonal stripe overlay were added at this point to bring the page closer to the in-game menu feeling.

### v2 — Refinement pass
Spacing was tightened, the About / Connect panels were rewritten as collapsible cards (`max-height` + `opacity` transitions), a manual theme toggle (`data-theme="light|dark"`) was wired up, and the mobile breakpoints were re-tuned so the slices still read clearly on a phone.

### v3 — Current "Blue Edition"
The accent colour was migrated from red to a strong blue (`#2563eb`) while the typography and structural identity stayed the same. The light-background was switched from cold grey to cream (`#fdfbf7`) and the dark-background to anthracite (`#1c1c22`) for a warmer, more professional pairing. Anton was added as a more graphic display face for titles, the Wordle (DE) mini-project was wrapped as a subpage under `/wordle`, and that subpage received a matching toggle system so the theme stays consistent across the whole site while browsing.

## Running Locally

There is no build step. Open `index.html` in any modern browser. The Wordle game uses `fetch('words.txt')`, so it has to be served over `http://` rather than `file://` — any one-liner static server works:

```bash
python3 -m http.server 8000
# Then visit http://localhost:8000/
```

## Browser Support

Tested on the latest stable Chrome, Safari and Firefox. The backdrop-blur on the modal overlay requires a fairly modern browser but degrades cleanly when unavailable.

## Credits

- Design language: inspired by Atlus' Persona 5 / Persona 5 Royal UI.
- Display type: Anton via Google Fonts.
- Body type: Inter via Google Fonts.
- All code, layout and copy written by hand.
