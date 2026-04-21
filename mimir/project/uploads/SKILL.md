---
name: devopsdays-taipei-2025-design
description: Use this skill to generate well-branded interfaces and assets for the DevOpsDays Taipei 2025 slide template (Mike Hsu — "Exploration of LLM Observability"), either for production decks or throwaway prototypes / mocks. Contains essential design guidelines, colors, type, fonts, assets, and slide components for prototyping bilingual (繁中 + English) technical keynotes in the same visual voice.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

Key files to get oriented:

- `README.md` — full content + visual foundations, iconography, known gaps.
- `colors_and_type.css` — drop-in CSS tokens and semantic classes.
- `slides/index.html` + `slides/deck-stage.js` — ten canonical slide layouts. Copy either the whole deck shell or individual `<section class="slide …">` blocks for a new deck.
- `preview/` — small specimen cards (colors, type scale, components) — reference only, not for shipping.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy `colors_and_type.css` and `slides/deck-stage.js` into the new output folder and reference them. The system is flat — no build step, no framework dependency beyond Google Fonts.

If working on production code, read the tokens in `colors_and_type.css` as a source of truth for the palette, type scale, spacing, and radii. Do not regenerate colors from scratch.

**Voice & content rules** (see README for detail):

- Plainspoken, slightly wry, practitioner-to-peer. Never vendor-pitch.
- Short lines; set-up-then-punchline pacing across adjacent slides.
- Title Case slide headings, UPPERCASE eyebrows with wide tracking, sentence-case body.
- Mix 繁體中文 titles with English technical terms freely — don't force translation.
- `▶` is the preferred bullet. Emoji are almost absent — only `✦` in bios is established.
- Units (`%`, `×`, `ms`) split from the digit and rendered in `--brand-cyan`.
- Every content slide has the footer: **Event · Name · (handle) · NN / NN** in mono at bottom.

**Visual rules:**

- Two-pole palette: Ink `#0B1B2B` and Cyan `#22D3EE` do the heavy lifting. Everything else (Blue / Amber / Crimson / Jade) is semantic and used sparingly.
- No gradients except the cover's radial aurora and an optional Cyan→Blue linear for feature callouts.
- Shadows are minimal; rely on rule borders (2–3 px top border in Ink) for card separation.
- Section dividers use a giant cyan numeral (220–420 px) on dark ink.
- No icon font / emoji / hand-drawn SVGs unless the user explicitly provides them. Use Lucide via CDN if icons are needed.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts or production code, depending on the need.
