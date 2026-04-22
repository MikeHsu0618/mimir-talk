<template>
  <div
    class="split-layout slidev-layout"
    :class="[`ratio-${String($frontmatter.ratio ?? '1-1').replace(':', '-')}`]"
  >
    <header v-if="$frontmatter.eyebrow || $frontmatter.title || $frontmatter.kicker" class="head">
      <div v-if="$frontmatter.eyebrow" class="eyebrow" v-html="$frontmatter.eyebrow" />
      <h1 v-if="$frontmatter.title" v-html="$frontmatter.title" />
      <div v-if="$frontmatter.kicker" class="kicker" v-html="$frontmatter.kicker" />
    </header>

    <div class="cols">
      <div class="col col-left"><slot name="left" /></div>
      <div class="col col-right"><slot name="right" /></div>
    </div>

    <div v-if="$frontmatter.footnote" v-click class="footnote" v-html="$frontmatter.footnote" />
  </div>
</template>

<style scoped>
.split-layout {
  padding: 3.2rem 3.5rem 3rem !important;
  display: flex !important;
  flex-direction: column;
  gap: 1.25rem;
  color: #0E3F4E;
  height: 100%;
}

.head :deep(h1),
.split-layout > .head > h1 {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: #0E3F4E;
  margin: 0 0 0.8rem;
}

.head .eyebrow {
  margin-bottom: 0.55rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #F26D4F;
  letter-spacing: 0.06em;
}

.head .kicker {
  font-size: 1.5rem;
  font-weight: 500;
  color: #5296B8;
}

.head .eyebrow :deep(.title-eyebrow) {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  line-height: 1;
}

.head .eyebrow :deep(.title-eyebrow__num) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 0.95em;
  transform: translateY(0.03em);
}

.cols {
  flex: 1;
  display: grid;
  gap: 2.5rem;
  align-items: center;
  align-content: center;
  min-height: 0;
}

.ratio-1-1 .cols { grid-template-columns: 1fr 1fr; }
.ratio-3-2 .cols { grid-template-columns: 3fr 2fr; }
.ratio-2-3 .cols { grid-template-columns: 2fr 3fr; }
.ratio-4-3 .cols { grid-template-columns: 4fr 3fr; }
.ratio-3-4 .cols { grid-template-columns: 3fr 4fr; }
.ratio-5-3 .cols { grid-template-columns: 5fr 3fr; }
.ratio-3-5 .cols { grid-template-columns: 3fr 5fr; }
.ratio-5-4 .cols { grid-template-columns: 5fr 4fr; }
.ratio-4-5 .cols { grid-template-columns: 4fr 5fr; }

.col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1.05rem;
  line-height: 1.7;
}

.col :deep(h3) {
  font-size: 1.2rem !important;
  font-weight: 700;
  color: #0E3F4E;
  margin: 0 0 0.5rem;
}

.col :deep(p) {
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 0;
}

.col :deep(li) {
  font-size: 1.05rem;
  line-height: 1.75;
}

.col :deep(img) {
  max-width: 100%;
  max-height: 380px;
  object-fit: contain;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(14, 63, 78, 0.16);
}

.footnote {
  text-align: center;
  font-size: 1rem;
  color: #0E3F4E;
}
</style>
