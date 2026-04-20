---
name: slidev-design-principles
description: Design rules for Mike's Slidev presentations — light blue theme, strict 3-color rule, 4 standardized inner layouts, no AI-looking card chrome. Use when creating, editing, or adding slides to Slidev decks (slides.md), designing layouts, styling cards, writing frontmatter, or when the user mentions simplified Chinese/Traditional Chinese 簡報, Slidev, 投影片, 內頁設計, 封面, 章節頁.
---

# Slidev Presentation Design Principles

Apply these rules to every slide. Do not invent new patterns unless explicitly requested.

## Color palette — strict

**Max 3 color families per page.** Blue is always primary; red and orange/yellow are accents only. Green, purple, emerald, violet, indigo, pink, and any high-saturation cyan are **forbidden**.

| Role | Hex | When to use |
|------|-----|-------------|
| Ink (darkest) | `#0E3F4E` | Body text, H1 |
| Primary blue | `#5296B8` | H2, kickers, links |
| Mid blue | `#35738E` | Secondary text, callouts |
| Soft blue | `#6BAEBE` | Labels, captions |
| Light blue | `#ADD3D8` | Borders, dividers |
| **Coral (accent)** | `#F26D4F` | Negatives, warnings, "Prometheus 限制" |
| **Amber (accent)** | `#F7A86B` | Positives, hero numbers, chosen option |

Tailwind allow-list: `blue-*`, `cyan-*` (low sat only, ≤300), `sky-*`, `red-*`, `rose-*`, `amber-*`, `orange-*`. Never use `green-*`, `emerald-*`, `purple-*`, `violet-*`, `indigo-*`, `pink-*`.

## Layout system — 4 inner layouts + 4 structural layouts

Never create ad-hoc layouts. The full set is:

**Inner layouts** (for content pages):

| Layout | Use for | Content source |
|--------|---------|----------------|
| `inner` | Single-column, anything-goes body, auto vertical-centered | default slot, `title` / `kicker` / `footnote` / `align` in frontmatter |
| `split` | Two-column comparison | `::left::` / `::right::` named slots, `ratio: "1:1" \| "3:2" \| "2:3" \| "5:4" \| "4:5"` |
| `image-caption` | Large centered image + caption | `image` / `caption` in frontmatter |
| `image-side` | Image (~58%) + notes (~42%) | `image` in frontmatter + `::notes::` slot |

**Structural layouts** (fixed-purpose, one per deck):

| Layout | Use for |
|--------|---------|
| `cover-template` | Deck cover (title + subtitle + tags + speaker) |
| `speaker` | Self-introduction page (Mike Hsu's bio + creds + icons) — appears once near the start |
| `quote` | Opening quote / motivation hook |
| `section-blue` | Chapter dividers (01, 02, 03, ...) with big chapter number |

Title always in frontmatter (`title: ...`), never `# Title` in markdown body.

## Card design language — no AI chrome

Forbidden: top 4px accent bars, heavy drop shadows, neon gradients, tailwind `shadow-2xl` style glow.

Every card follows this structure (see `.pain-card`, `.path-card`, `.hl-card`, `.why-card` in `style.css`):

- Rounded `18px`
- Border `1.5px solid` in blue/amber/coral tone at 28-45% opacity
- Background: **subtle 160deg linear-gradient** from tinted color (8-14% opacity) to cream `rgba(255, 250, 247, 0.55)`
- Box-shadow: soft `0 4px 20px rgba(14, 63, 78, 0.06)` — never more
- Padding: `2rem 1.75rem 1.75rem` for main cards, `1.6rem 1.5rem 1.5rem` for dense variants

**Internal hierarchy depends on card type:**

**`.hl-card`** (closing slide takeaways, comparison grids):
1. Large number `__num` `2.8rem` weight 900 — decorative index
2. Kicker `__kicker` `1.05rem` weight 700 — category label (secondary)
3. Title `__title` `1.35–1.5rem` weight 800 — **primary message**
4. Body `__sub` / `__body` `1rem` line-height `1.65`

**`.pain-card`** (pain points, numbered problem cards):
1. Large number `__num` `2.8rem` weight 900 — decorative index
2. Kicker `__kicker` `1.5rem` weight 800 — **primary label** (e.g. 維運 / 水平擴展) — NOT uppercase, NOT small
3. Title `__title` `1rem` weight 500 `rgba(14,63,78,0.6)` — annotation/description (secondary)
4. Body `__body` `1rem` line-height `1.65`

⚠️ **`pain-card` hierarchy is inverted vs `hl-card`**: kicker IS the main content, title IS the annotation. Do not make `pain-card__title` visually heavier than `pain-card__kicker`.

Variants use modifier classes: `--pos` (amber), `--neg` (coral), default (blue). Only the gradient stop colors and number/title color change — structure stays identical.

## Typography

- Body text never below `1rem`. Most cards use `1.05–1.1rem`.
- H1 on inner layouts: `3rem` weight 900, letter-spacing `-0.025em`
- H1 on split/image layouts: `2.7rem`
- `hl-card__kicker`: `1.05rem` weight 700, `#35738E` — category label (secondary to title)
- `pain-card__kicker`: `1.5rem` weight 800, `#0E3F4E` — primary label (heavier than title)
- Lists use `line-height: 1.7+`
- Monospace: `JetBrains Mono` for code and hero numbers like `L = λ · W`

## Vertical centering

Every inner layout root has `height: 100%` and its `.body` / `.cols` / `.content-stack` has `flex: 1` + `justify-content: center` (for flex-column) or `align-content: center` (for grid). Never leave pages with big empty bottom space.

## Animation patterns

Use `v-click` strategically, not everywhere. Default: static. Apply animation when:

1. **Choice/comparison reveals**: 3 equal options → one chosen + others fade. Use class binding:
   ```html
   <div class="path-card" :class="{ 'is-chosen': $clicks >= 1 }">
   ```
   CSS transitions `0.5s ease` on `background`, `border-color`, `opacity`, `transform`, `color`.

2. **Progressive disclosure**: `v-click="1"` on labels/ribbons/conclusions that appear *after* initial content.

3. **Never animate** decorative elements, icons, or static text.

## Icon usage

Use `mdi-*` Iconify icons inline. Verified working set (some `mdi-*-outline` / `-variant` variants don't exist — use base names):
- `mdi-alert-circle`, `mdi-alert-octagon`, `mdi-check-circle`, `mdi-clock-outline`
- `mdi-lightbulb-on`, `mdi-lightbulb-on-outline`
- `mdi-magnify`, `mdi-download`, `mdi-tune`, `mdi-content-cut`
- `mdi-history`, `mdi-chart-timeline-variant`, `mdi-chart-line`
- `mdi-robot-outline`, `mdi-trophy-outline`, `mdi-account-group`

**Known-missing icons** (do not use — Vite will throw `Icon not found`): `mdi-kafka`, `mdi-k8s`, `mdi-prometheus`. For branded/unavailable concepts, substitute a semantically-related generic icon (e.g. `mdi-swap-horizontal`, `mdi-pipe`, `mdi-database-sync`).

Bullet list icons align via `display: grid; grid-template-columns: 1.35rem 1fr` — never rely on inline flex ordering. **Always wrap non-icon content in a single `<span>`** so icon + span are the only two grid cells. Leaving raw text + `<strong>` as siblings will blow out the grid and smear text into the icon column.

```html
<!-- ✅ correct -->
<li><mdi-fire class="why-list__icon" /><span>Grafana Labs 對 <strong>LGTM</strong> 集中火力</span></li>

<!-- ❌ wrong — text + <strong> become separate grid items -->
<li><mdi-fire class="why-list__icon" />Grafana Labs 對 <strong>LGTM</strong> 集中火力</li>
```

## Component API

### `<Stat value label accent />`
Container-query powered, values auto-fit:
```css
.stat-card { container-type: inline-size; overflow: hidden; }
.stat-value { font-size: clamp(2.5rem, 30cqw, 6rem); white-space: nowrap; }
```
`accent` accepts `blue | sky | ink | orange | red` (legacy `cyan | green | purple` silently map to blue). Never expose green/purple as new names in slides.

### `<Callout type title>...</Callout>`
```ts
type?: 'info' | 'win' | 'warn' | 'error'   // info=藍 / win=青藍 / warn=琥珀 / error=珊瑚
title?: string                              // renders as uppercase kicker above body
```
`image-side` layout's `::notes::` slot expects 3 stacked `<Callout>`s. Typical pattern: `info` (context) → `win` (positive) → `warn` (caveat).

### Tag badges (cover only)
```html
<div class="abs-br m-8 flex gap-2">
  <span class="tag">40 min</span>
  <span class="tag new">Mimir 3.0</span>
  <span class="tag good">Win</span>
  <span class="tag warn">Caveat</span>
</div>
```

## Auto-behaviors — do not re-implement

These are already wired globally in `style.css`. Writing manual inline styles to "fix" them = bug.

- **`<strong>` → coral `#F26D4F`**. Use `**文字**` for inline highlight, never `<span style="color:#F26D4F">`.
- **Inline `` `code` ``** → auto dark-teal pill with cream text. Don't wrap in `<code style=...>`.
- **Tailwind dark-utility mapping**: `text-red-400`, `bg-white/10`, `border-red-400/30`, `bg-amber-400/10`, `bg-slate-700/50` etc. are all remapped to the light palette. Safe to use as-is. Still forbidden at source: `text-green-*`, `text-purple-*`, `text-emerald-*`, `text-violet-*`, `text-indigo-*`, `text-pink-*` (don't rely on override — write the right class).
- **Bullet triangles**: `<ul><li>text` auto-renders blue `#5296B8` triangle. Nested `<ul><ul>` uses lighter `#A0CEE6`. If `<li>` starts with `<mdi-* />`, the triangle auto-hides.
- **Icon lists**: `<ul class="icon-list">` + `<mdi-xxx />` at start of each `<li>` for flex-aligned icon bullets.
- **`h2` hugs `h1`** via `margin-top: -0.8rem`. Don't manually add `mt-2` / `mb-6` between them.

## Required root frontmatter

Every deck's opening frontmatter block must include:
```yaml
aspectRatio: 16/9
canvasWidth: 1280
colorSchema: light              # never dark
mdc: true                       # required for :::callout / component-in-markdown
highlighter: shiki
lineNumbers: false
transition: slide-left
defaults:
  transition: fade              # inner pages use soft fade
fonts:
  sans: 'Inter'
  mono: 'JetBrains Mono'
  provider: google
```

## Slide-level conventions

- **Speaker notes mandatory**: every slide ends with `<!-- ... -->` block containing presenter notes (bullets are fine). No slide ships without notes.
- **Multi-line CJK titles use `<br/>`**: long titles are force-broken manually, not relying on width wrap. e.g. `# 從 Thanos<br/>到 Mimir 3.0`, `# 長期指標後端<br/>架構介紹`.
- **Forbidden Slidev built-in layouts**: `layout: default`, `layout: center`, `layout: fact`, `layout: two-cols`, `layout: statement`, `layout: intro`, `layout: end`. Always map to our 4 inner layouts instead.
- **One layout change per slide**: don't stack layouts via CSS — if a page needs a different shape, pick a different layout.

## Closing page recipe (the "thank you" slide)

Use `inner` + `align: center` and compose from existing primitives — no dedicated layout needed.

Structure (top to bottom, all centered):
1. **Big title + journey line**: `<h1>` 7xl + monospace tagline summarizing the deck journey (e.g. `Thanos → Mimir 3.0 → AutoMQ → Parquet ?` with last item in amber)
2. **3 takeaways** via `.hl-grid--3` + `.hl-card` — map each to a semantic variant:
   - takeaway 1 → `.hl-card--pos` (amber · hero principle)
   - takeaway 2 → `.hl-card--neg` (coral · contrast / caveat)
   - takeaway 3 → plain `.hl-card` (blue · grounding)
   - Each card uses `__num` (01/02/03) + `__kicker` (one-word category) + `__title` (short phrase) + `__sub` (one-line explanation)
3. **Closing tagline** via `.hl-banner` with a motivational mdi icon (`mdi-compass-outline`, `mdi-lightbulb-on`)
4. **Contact pill** via `.end-page__contact` — inline-flex pill with icon + name + code email, sitting on light blue tinted background

Wrapper: `<div class="end-page w-full flex flex-col items-center gap-8">` — the `gap-8` controls vertical rhythm between the 4 blocks.

Skeleton:
```html
<div class="end-page w-full flex flex-col items-center gap-8">
  <div class="text-center">
    <h1 class="!text-7xl !font-black !mb-3">謝謝聆聽</h1>
    <div class="text-lg opacity-70 font-mono">Journey → Steps → <span style="color:#F7A86B">Future?</span></div>
  </div>

  <div class="hl-grid hl-grid--3 w-full max-w-5xl">
    <!-- 3 hl-cards with variants pos / neg / default -->
  </div>

  <div class="hl-banner w-full max-w-4xl"><mdi-compass-outline class="hl-banner__icon" /><div>tagline</div></div>

  <div class="end-page__contact"><mdi-email-outline /><span>Name</span><span class="end-page__dot">·</span><code>email</code></div>
</div>
```

## Page type → layout mapping

When adding a new slide, pick the layout by intent:

- **A single statement / hero number / quote-like**: `inner` + `align: center` + inline hero class
- **Two concepts side-by-side comparison**: `split` with appropriate ratio
- **One big diagram with a one-line takeaway**: `image-caption`
- **Diagram needing 2-3 bullet-point callouts alongside**: `image-side` with 3 `<Callout>` components stacked
- **3+ entities to highlight equally OR a 2-card pos/neg comparison**: `inner` + `.hl-grid` + `.hl-card`

## Frontmatter cheatsheet

```yaml
# inner
layout: inner
title: 我們面對的量級
kicker: Sportybet 生產環境實錄
footnote: 橫跨多個集群 · 這個規模讓我們踩到所有 Thanos 會踩的坑
align: center  # or 'start' (default: center)

# split
layout: split
title: 痛點 ① — 短期查詢
ratio: "3:2"

# image-caption
layout: image-caption
title: AutoMQ Shared Storage
image: /automq-shared-storage.png
caption: "<strong>Storage 與 Compute 分離</strong> · P99 < 10ms"

# image-side (image always left, notes always right)
layout: image-side
title: Ingest Storage
image: /mimir3-ingest-storage.png
```

## Badge labels for comparison headers

When naming each side of a two-column comparison (e.g., "TSDB on S3" vs "Parquet on S3", "Traditional Kafka (EBS)" vs "AutoMQ S3Stream"), wrap the label in a **pill badge** with a border that matches the text color. Never use plain uppercase text or a Tailwind opacity class for this role.

```html
<div class="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
     style="color:#C0502E;border:1.5px solid #C0502E;width:fit-content;">TSDB on S3</div>
```

Color pairing rule: coral `#C0502E` / `#F26D4F` for the "bad/legacy" side, teal `#35738E` / `#5296B8` for the "good/new" side, amber `#F7A86B` for the "chosen" option.

## Two-column stat comparison pattern (split layout, no cards)

When comparing two options with a hero number each, use this column structure inside `::left::` / `::right::` (no card wrapper needed — the column itself is the container):

```html
<div class="flex flex-col gap-3">
  <!-- 1. Badge label -->
  <div class="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
       style="color:#COLOR;border:1.5px solid #COLOR;width:fit-content;">Label</div>
  <!-- 2. Hero number -->
  <div style="font-size:4.5rem;font-weight:900;line-height:1;letter-spacing:-0.04em;color:#COLOR;">100+</div>
  <!-- 3. Subtitle -->
  <div class="text-lg font-bold" style="color:#COLOR;">random GETs</div>
  <!-- 4. Accent divider -->
  <div class="w-12 h-0.5 rounded" style="background:#COLOR;opacity:0.4;"></div>
  <!-- 5. Bullet list — always use li-lg or li-xl to ensure readability -->
  <ul class="li-lg">
    <li>Description point one</li>
    <li>Description point two</li>
    <li><strong>Key takeaway</strong></li>
  </ul>
</div>
```

## List size helper classes

The global rule sets `ul li { font-size: 1.05rem }` which cannot be overridden by putting `font-size` on `<ul>`. Use these classes on `<ul>` instead:

| Class | Font size | When to use |
|-------|-----------|-------------|
| `li-lg` | `1.2rem` | Most split-layout bullet lists |
| `li-xl` | `1.35rem` | Short lists where each item needs more presence |
| `li-2xl` | `2rem` | Single-line hero lists |

## `insight` block — single key message for image-side right pane

When `image-side` has only **one key insight** (instead of 3 stacked `<Callout>`s), use the `.insight` pattern for larger, more impactful typography:

```html
::notes::

<div class="insight">
  <div class="insight-label">設計哲學</div>
  <div class="insight-text"><strong>主要論點兩行以內</strong></div>
  <p>補充說明一行</p>
</div>
```

CSS is defined in `image-side.vue` scoped styles. The `.insight-text` inherits `strong { color: #F26D4F }` automatically.

## `inner` layout — `align: center` also centers the header

Since `inner.vue` was updated, `align: center` now centers both the **header** (title + kicker) AND the body content. No need to add manual `text-align: center` to the title or kicker.

## `split` layout — `footnote` animates in via v-click

The `footnote` div in `split.vue` is wrapped in `v-click`, so it appears only on click. Use this for supplementary data that should be revealed after the main comparison (e.g., supporting stats, caveats). If a page's footnote should be visible immediately, move the content into the slot body instead.

## `image-side` — image-to-notes ratio is 8:4

The default column ratio is `8fr 4fr` (image ~67%, notes ~33%). The notes pane is vertically centered. Do not revert to `7fr 5fr` — the wider image is intentional.

## Full-height content that reveals a Callout on click

When a slide fills the viewport (e.g. a 2×2 image grid) and a `<Callout>` appears on `v-click`, the grid must be shrinkable so the callout doesn't push content off-screen. Wrap the slide body in a flex column and make the grid `flex-1 min-h-0`:

```html
<div class="flex flex-col gap-2 w-full h-full min-h-0">
  <div class="grid grid-cols-2 gap-2 w-full flex-1 min-h-0">
    <div class="... flex flex-col min-h-0">
      <div>Label</div>
      <img src="..." class="flex-1 min-h-0 w-full object-contain" />
    </div>
    <!-- ... -->
  </div>
  <div v-click class="flex-shrink-0">
    <Callout type="win" title="...">...</Callout>
  </div>
</div>
```

## Common pitfalls to avoid

- ❌ Adding `# Title` to markdown body when `title:` exists in frontmatter
- ❌ Wrapping content in ad-hoc `<div class="grid grid-cols-2">` when `split` layout exists
- ❌ Using `text-green-400`, `text-purple-400`, `text-violet-*`, `text-emerald-*`
- ❌ More than 3 color families on one page (count: blue tones = 1, red = 1, orange = 1)
- ❌ Top 4px color stripe on cards
- ❌ Forgetting `v-html` when injecting HTML-containing frontmatter strings
- ❌ Hard-coding font sizes smaller than 0.92rem
- ❌ Using Slidev `layout: fact` / `layout: default` for substantive content (use `inner` instead)
- ❌ `<li>` with raw text + `<strong>` siblings (breaks `display: grid` icon list) — always wrap non-icon content in `<span>`
- ❌ Unverified `mdi-*` icons (e.g. `mdi-kafka` doesn't exist in the Iconify MDI set) — check before use

## Reference files (inside this repo)

- `layouts/` — the 8 layouts (cover-template, speaker, quote, section-blue, inner, split, image-caption, image-side)
- `style.css` — card classes (`.why-card`, `.path-card`, `.pain-card`, `.hl-card`, `.hl-banner`, `.hl-footer`, `.combo-row`, `.end-page__contact`)
- `components/Stat.vue`, `components/Callout.vue` — reusable components
- `slides.md` — full reference implementation

When editing, match this deck's patterns exactly. If asked to add something the pattern doesn't cover, propose extending an existing class rather than inventing a new one.
