<template>
  <div
    class="ics-layout slidev-layout"
    :class="{ 'ics-layout--has-after': !!$slots.after }"
  >
    <header
      v-if="$frontmatter.title || $frontmatter.kicker"
      class="head"
      :class="{ 'head--center': $frontmatter.align === 'center' }"
    >
      <div v-if="$frontmatter.eyebrow" class="eyebrow" v-html="$frontmatter.eyebrow" />
      <h1 v-if="$frontmatter.title" v-html="$frontmatter.title" />
      <div v-if="$frontmatter.kicker" class="kicker">{{ $frontmatter.kicker }}</div>
    </header>

    <div
      class="ics-stack"
      :class="[
        ($frontmatter.stackV === 'top' || $frontmatter.stackV === 'start')
          ? 'ics-stack--top'
          : 'ics-stack--v-center',
        { 'ics-stack--has-after': !!$slots.after },
      ]"
    >
      <div v-if="$slots.default" class="ics-before">
        <slot />
      </div>

      <div
        class="ics-equal"
        :style="{
          gridTemplateColumns: `${Number($frontmatter.ratioLeft ?? 5)}fr ${Number($frontmatter.ratioRight ?? 4)}fr`,
        }"
      >
        <div class="ics-cell ics-cell--image">
          <slot name="left" />
        </div>
        <div class="ics-cell ics-cell--callout">
          <slot name="right" />
        </div>
      </div>

      <div v-if="$slots.after" class="ics-after">
        <slot name="after" />
      </div>
    </div>

    <div v-if="$frontmatter.footnote" class="footnote" v-html="$frontmatter.footnote" />
  </div>
</template>

<style scoped>
/* Shell aligned with inner.vue */
.ics-layout {
  /* Slightly tighter than inner — leaves more vertical room for the split row */
  padding: 2.5rem 3.25rem 2.5rem !important;
  display: flex !important;
  flex-direction: column;
  gap: 0.65rem;
  color: #0e3f4e;
  height: 100%;
}

/* Extra air between title block and body when slide has ::after:: (e.g. stats row) */
.ics-layout--has-after {
  gap: 1rem;
}

.head :deep(h1),
.ics-layout > .head > h1 {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: #0e3f4e;
  margin: 0 0 0.45rem;
}

.head--center {
  text-align: center;
}

.head .eyebrow {
  margin-bottom: 0.55rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #C0502E;
  letter-spacing: 0.06em;
}

.head .kicker {
  font-size: 1.5rem;
  font-weight: 500;
  color: #5296b8;
}

/* stackV default: vertical center (title stays controlled by head--center via align) */
.ics-stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-height: 0;
  font-size: 1.05rem;
  line-height: 1.7;
}

.ics-stack--v-center {
  justify-content: center;
}

.ics-stack--top {
  justify-content: flex-start;
}

/* Callout ↔ split ↔ after: looser rhythm when a bottom band (stats) exists */
.ics-stack--has-after {
  gap: 1.55rem;
}

.ics-before {
  flex-shrink: 0;
  min-width: 0;
}

.ics-before :deep(.callout) {
  padding: 0.65rem 1rem;
  font-size: 0.98rem;
  line-height: 1.45;
}

.ics-before :deep(.callout-title) {
  margin-bottom: 0.35rem;
  font-size: 0.72rem;
}

/* Split row: full width; columns vertically centered to each other */
.ics-equal {
  flex: 0 0 auto;
  width: 100%;
  display: grid;
  gap: 1.25rem 1.75rem;
  align-items: center;
  align-content: center;
  min-height: 0;
}

.ics-cell--image {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  width: 100%;
  min-width: 0;
  height: auto;
}

.ics-cell--image :deep(img) {
  width: 100%;
  max-width: 100%;
  height: auto;
  display: block;
  max-height: min(440px, 58vh);
  object-fit: contain;
  object-position: center;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(14, 63, 78, 0.16);
}

.ics-cell--image :deep(img + div) {
  margin-top: 0.45rem;
  font-size: 0.75rem;
  text-align: center;
  color: #6baebe;
}

.ics-cell--callout {
  display: flex;
  flex-direction: column;
  min-width: 0;
  align-self: center;
  justify-self: stretch;
  width: 100%;
}

/* Tighter vertical rhythm than global .hl-card */
.ics-cell--callout :deep(.hl-card) {
  padding: 0.95rem 1.2rem 1rem;
  gap: 0.3rem;
}

.ics-cell--callout :deep(.hl-card__num) {
  font-size: 2.15rem;
  line-height: 1;
}

.ics-cell--callout :deep(.hl-card__title) {
  margin: 0.1rem 0 0.25rem !important;
}

.ics-cell--callout :deep(.hl-card ul) {
  margin: 0.15rem 0 0;
}

.ics-cell--callout :deep(.hl-card .li-lg li) {
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
}

/* Right-slot Callout: compact, no fill-height centering */
.ics-cell--callout :deep(.callout) {
  padding: 0.5rem 0.85rem 0.55rem;
  box-sizing: border-box;
}

.ics-cell--callout :deep(.callout-title) {
  margin-bottom: 0.25rem;
}

.ics-cell--callout :deep(.callout-body) {
  line-height: 1.45;
}

.ics-after {
  flex-shrink: 0;
  min-width: 0;
}

.ics-stack--has-after .ics-after {
  margin-top: 0.25rem;
  padding-top: 0.2rem;
}


.footnote {
  text-align: center;
  font-size: 1rem;
  color: #6baebe;
}
</style>
