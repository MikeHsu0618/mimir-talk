# DevOpsDays Taipei 2025 — Slide Template Design System

A presentation design system reverse-engineered from `uploads/template.pdf` — a 44-slide keynote template used by **Mike Hsu** (`@MikeHsu0618`) for the talk **"Exploration of LLM Observability"** at **DevOpsDays Taipei 2025**.

This system packages the tokens, component patterns, and ten canonical slide layouts so any agent can build on-brand decks, one-pagers, and supporting artifacts in the same voice.

> **⚠ Visual-fidelity caveat.** The source PDF is 44 pages rendered primarily as text in the file (not as images). The PDF renderer in this sandbox could not reliably produce previews of the pages, so exact hex colors, fonts, and layout proportions were **inferred from the extracted text structure** and typical Taiwanese tech-conference keynote conventions (bilingual 繁中 + English, 16:9, dark section dividers, cyan/teal accent, generous whitespace, monospace for telemetry attributes). **Please verify against the actual deck and correct as needed.**

---

## Sources

| Source | Path | Notes |
|---|---|---|
| Original PDF template | `uploads/template.pdf` | 44 pages, 5.9 MB |
| Extracted text (all pages) | see README `Content excerpts` below | via pdf-parse |

---

## Index

| File / folder | Purpose |
|---|---|
| `colors_and_type.css` | All design tokens — CSS vars for color, type, spacing, radii, shadow, plus drop-in semantic classes (`.ds-h1`, `.ds-eyebrow`, …). |
| `preview/` | Small (~700×<300 px) HTML cards used by the Design System tab to preview each token group. |
| `slides/index.html` | Ten canonical slide layouts built into a live deck (`<deck-stage>` component). |
| `slides/deck-stage.js` | Vendored deck shell — keyboard nav, scale-to-fit, print-to-PDF. |
| `SKILL.md` | Claude-Code-compatible skill manifest. |
| `README.md` | This file. |

### Slides included
1. Cover — big wordmark with cyan full-stop, author block, grid background
2. Agenda — three-column numbered plan
3. Section divider — giant `01` cyan numeral on dark
4. Big quote — serif italic emphasis on a single line
5. Comparison table — two pill-headed columns
6. Four-quadrant features — 2×2 grid with underlined titles
7. Bullet list — `▶` markers + trailing tag pills
8. Big-number stats — 3-up with cyan unit suffix
9. Attribute / code table — OTel `gen_ai.*` keys on dark
10. Thank-you — oversized sign-off with metadata strip

---

## Content fundamentals

**Language.** Bilingual: Traditional Chinese (繁體中文) titles mixed with English technical terms. Body copy is predominantly English for this deck, but chapter/book-style titles in the author blurb are in Chinese (e.g. *從異世界歸來發現只剩自己不會 Kubernetes* 系列文).

**Voice.** *Plainspoken, confident, slightly wry.* The deck personifies a practitioner talking to peers — not a vendor pitch. Examples pulled from the source:

- "Observability **is not equal to** ChatGPT"
- "Without it, **we're flying blind inside a Black Box**"
- "Alright Let's start to make an LLM Application"
- "But… we don't have that much time!"
- "What if you start with a Framework"

The rhythm is short lines, set-up-then-punchline: a premise on one slide, the twist on the next. Use em-dashes and ellipses sparingly for pacing.

**Person.** Mix of `we` (the audience-and-speaker collectively) and direct address (`you`). Avoid first-person `I`. Use `let's` when proposing the next step.

**Casing.**
- Slide titles: **Title Case** (e.g. *"Traditional Observability vs. LLM Observability"*, *"Why LLM Observability Matters"*).
- Eyebrows / section kickers: **UPPERCASE** with extended tracking (`letter-spacing: 0.2em`).
- Body copy: Sentence case.
- Code / attribute names: `snake_case.dot.separated`, in mono.

**Emoji.** Extremely restrained. Only one appears in the source: `✦` as a decorative bullet in the author's credentials ("✦ "從異世界歸來…" 系列文"). **Do not** sprinkle emoji into content slides. A ✦ or • is acceptable in bios.

**Symbols & bullets.** `▶` (filled right-pointing triangle) is the preferred bullet for action lists. `🔸` appears once but should be treated as equivalent-weight marker for paired methodology names. Page numbers use the pattern `-- N of 44 --` in source; formatted decks use `NN / NN`.

**Citations.** Inline `ref:` followed by the URL, at bottom-left of the slide in mono at ~11–14 px. Example from the source: `ref:https://www.kaggle.com/whitepaper-agents`.

**Numbers & units.** Units are **split out** from the digit and often rendered in accent cyan (`99.9%`, `3×`, `<50ms`). Keep the digit bold/black and the unit lighter.

---

## Visual foundations

### Colors

The palette is a two-pole system:

- **Ink (`#0B1B2B`)** — the near-black navy used for primary text on light slides and as the dark-mode page color on section dividers / the close.
- **Cyan (`#22D3EE`)** — the *one* accent that does nearly all the highlighting work: giant section numerals, unit suffixes in big stats, the punctuating full-stop in wordmarks, bullet arrows, footer pips, and title-underlines.
- **Blue (`#2563EB`)** — secondary accent for links, occasional tag pills, and italic serif emphasis where cyan would be too electric.
- **Amber (`#F59E0B`)** — used for warnings / metaphorical "flying blind" / numeric values inside code blocks.
- **Crimson (`#DC2626`)** — reserved for hallucination / risk / danger callouts.
- **Jade (`#10B981`)** — correctness / healthy telemetry / success tag pills.

Neutrals are a clean grayscale running from `#FFFFFF` → `#0B1B2B` with a parallel *on-dark* text ramp (`#FFFFFF` → `#7F91A4`). Dividers are `#E3E7EC` on light, `#1E3550` on dark.

### Typography

Loaded via Google Fonts in each file:

| Family | Role | Weights used |
|---|---|---|
| **Inter** | Latin sans (titles + body) | 300 / 400 / 500 / 600 / 700 / 800 |
| **Noto Sans TC** | Traditional Chinese | 300 / 400 / 500 / 700 / 900 |
| **JetBrains Mono** | Code, OTel attributes, page numbers | 400 / 500 / 700 |
| **Fraunces** | Serif italic accent ("*blind*", quote marks) | 400 / 600, optical |

> **🔴 Font substitution.** The original PDF's exact typefaces could not be extracted in this sandbox. These four are the closest Google Fonts matches to typical Taiwanese conference-deck pairings. **Please confirm or swap in the real files** (drop TTF/OTF into `fonts/` and update `@import` at the top of `colors_and_type.css`).

The **scale** (see `preview/type_scale.html`) assumes a 1920×1080 canvas. Hero = 120 px, display = 88 px, h1 = 64 px, body = 22 px, micro = 14 px. Tracking is negative for all display sizes (`-0.02em` to `-0.035em`) and very wide for eyebrows (`0.18em–0.22em`).

### Spacing, radii, shadow

- **Spacing** is a 4-px base scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 px`. Slide inner padding is **80 px** top/sides, **44 px** for the footer strip.
- **Radii** are tight — `2 · 4 · 8 · 14 · ∞ (pill)`. Cards use 10–14 px, pills use fully rounded.
- **Shadow is minimal.** Conference decks project to screens, so strong shadows read as noise. Three tokens — `sh-1`, `sh-2`, `sh-card` — with ≤ 20 % opacity at the largest blur.

### Backgrounds

Six treatments documented in `preview/brand_backgrounds.html`:

1. **Paper** — plain `bg-0` white for content slides.
2. **Ink** — flat `#0B1B2B` for section dividers and the close.
3. **Aurora glow** — two radial gradients (cyan top-left, blue bottom-right) on ink — used for the cover.
4. **Telemetry grid** — 24 px cyan grid at 7 % opacity on ink, radially masked — subtle texture for cover/divider.
5. **Hatch** — 135° 2-px diagonal hatch at 4 % opacity — for quiet section intros.
6. **Cyan → Blue** — the only linear gradient, for occasional feature callouts.

Decks use **one or at most two** background treatments per section — switching too often breaks rhythm.

### Motion

Minimal. Transitions between slides are instant (handled by `<deck-stage>` — opacity swap, no crossfade). In-slide animation is discouraged — if you must, use **180 ms ease-out** for fades and **240 ms cubic-bezier(.2,.8,.2,1)** for transforms. **No bounce, no spring**. Reveal-on-click builds are acceptable in code/attribute tables.

### Interaction states (for any UI derived from this system)

- **Hover** — lift `background` by one tonal step (`bg-0` → `bg-1`) or set color to `accent-2`. No scale.
- **Press** — darken text one step, no scale.
- **Focus** — 2 px `brand-cyan` outline with 2 px offset.

### Layout rules

- Footer strip is fixed at `bottom: 44 px`, inset `96 px` from sides, always: **Event · Name · (handle) · page number (right-aligned, mono)**.
- Author lockup lives top-right on the cover, never competes with the title.
- Bottom 44 px of every slide is reserved for the footer — no content below it.
- Content column is never wider than `~52 ch`; large titles may extend to `~12 ch`.
- Big numerals (`01`, `02`, `03` section dividers) hang off the left edge; the title aligns to the numeral's right baseline.

### Transparency & blur

Used sparingly — pill tag backgrounds are `rgba()` of the token color at ~14 % so they sit on both light and dark. No backdrop-filters / glass. No translucent overlays except the aurora glow on the cover.

### Image vibe

When real imagery is used (photography, product screenshots), color-grade cool: desaturated neutrals, cyan-leaning highlights. Never warm/sepia. Prefer **b&w for portraits**, color screenshots for product UI. Avoid stock-photo gloss.

### Card anatomy

"Cards" in this system are mostly **rule-based**, not shadow-based. A card is typically:

- A thick `2–3 px` top border in `--brand-ink` (or `--brand-cyan` on dark)
- A small label above (eyebrow or stat label)
- Flat white background (no shadow)
- Generous internal padding (24–32 px)

Shadowed cards exist (`sh-card`) but are reserved for floating UI — use sparingly.

---

## Iconography

**Primary approach: type + Unicode arrows, not icon sets.**

Looking at the source deck, actual icons appear to be *nearly absent* — the design leans on:

- `▶` (U+25B6) as the dominant bullet / action marker
- `✦` (U+2726) as a decorative credentials bullet
- `🔸` (once) for methodology-pair labelling
- Section numerals (`01`, `02`, `03`) used as **de-facto icons** — their massive scale and cyan fill carry the semantic weight an icon would
- `×` (as in `3×`) and `%` and `ms` as typographic units, colored cyan

No SVG icon set, icon font, or emoji font is used. There is no logo extracted from the PDF (if one exists, please drop it into `assets/` and the lockup preview will render it).

**Recommendation if icons are needed for derived artifacts.** Use **[Lucide](https://lucide.dev/)** via CDN — 1.5 px stroke, 24 px box. The linear stroke weight matches this deck's minimal aesthetic better than Heroicons (too round) or Material Symbols (too heavy).

```html
<script src="https://unpkg.com/lucide@latest"></script>
```

> **🔴 Icon substitution.** This is a best-fit CDN choice; no codebase-internal icon set was provided. If the real template uses a specific icon library, please let me know and I'll swap it.

---

## Known gaps / things to verify

1. **Exact hex colors** — the cyan/blue/amber/crimson/jade values are modern-web stand-ins (Tailwind-adjacent). The real PDF may use different tones.
2. **Fonts** — Inter + Noto Sans TC + JetBrains Mono + Fraunces are substitutions. Real font files welcome.
3. **Exact slide proportions** — 80 px padding, 96 px margins, footer at 44 px are best-guess defaults; the real template may use different grids.
4. **Logos** — no logo/mark was extracted. The "cyan pip" brand lockup is invented.
5. **Speaker's photo / author imagery** — not extracted.
6. **Full list of Mike Hsu's 系列文 (article series)** — see content excerpts below.

---

## Content excerpts (for reference)

Author credentials (from slide 2):
- "從異世界歸來發現只剩自己不會 Kubernetes" 系列文
- "你以為你在學 Grafana 其實你建立了 Kubernetes 可觀測性宇宙" 系列文
- "後 Grafana 時代的自我修養" 系列文
- Google Cloud Summit Taipei 2023 分享 GKE 成本優化

Recurring phrase — the spine of the deck:

> Without it, we're flying blind inside a Black Box.

Section headers:
- `01` — LLM Observability
- `02` — LLM Observability Platform
- `03` — LLM Application

Key conceptual contrasts the template has to accommodate:
- Traditional Observability **vs.** LLM Observability (table)
- Models **vs.** Agents (table)
- MCP **vs.** Function Calling (table)
- Human Eval / LLM-as-a-Judge / Benchmark / Metric-based / Rule-based (bulleted)

Sign-off: *Hands-on Time*.
