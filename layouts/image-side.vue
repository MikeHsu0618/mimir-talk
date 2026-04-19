<template>
  <div class="imgside-layout slidev-layout">
    <header v-if="$frontmatter.title || $frontmatter.kicker" class="head">
      <h1 v-if="$frontmatter.title" v-html="$frontmatter.title" />
      <div v-if="$frontmatter.kicker" class="kicker">{{ $frontmatter.kicker }}</div>
    </header>

    <div class="cols">
      <div class="col-image">
        <img
          v-if="$frontmatter.image"
          :src="$frontmatter.image"
          :alt="$frontmatter.imageAlt || ''"
        />
        <slot v-else name="image" />
      </div>
      <div class="col-notes">
        <slot name="notes" />
      </div>
    </div>

    <div v-if="$frontmatter.footnote" class="footnote" v-html="$frontmatter.footnote" />
  </div>
</template>

<style scoped>
.imgside-layout {
  padding: 3.2rem 3.5rem 3rem !important;
  display: flex !important;
  flex-direction: column;
  gap: 1.25rem;
  color: #0E3F4E;
  height: 100%;
}

.head :deep(h1),
.imgside-layout > .head > h1 {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: #0E3F4E;
  margin: 0 0 0.8rem;
}

.head .kicker {
  font-size: 1.5rem;
  font-weight: 500;
  color: #5296B8;
}

.cols {
  flex: 1;
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: 2.5rem;
  align-items: center;
  min-height: 0;
}

.col-image {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
  min-width: 0;
}

.col-image img {
  max-width: 100%;
  max-height: 500px;
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(14, 63, 78, 0.16);
}

.col-notes {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  min-width: 0;
  font-size: 1.05rem;
  line-height: 1.7;
}

.col-notes :deep(.insight) {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.col-notes :deep(.insight-label) {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6BAEBE;
}

.col-notes :deep(.insight-text) {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.25;
  color: #0E3F4E;
  letter-spacing: -0.02em;
}

.col-notes :deep(.insight-text strong) {
  color: #F26D4F;
  font-weight: 900;
}

.col-notes :deep(.insight p) {
  font-size: 1rem;
  color: rgba(14, 63, 78, 0.6);
  margin: 0;
  line-height: 1.6;
}

.col-notes :deep(h3) {
  font-size: 1.2rem !important;
  font-weight: 700;
  color: #0E3F4E;
  margin: 0 0 0.4rem;
}

.col-notes :deep(p) {
  margin: 0;
  font-size: 1.05rem;
}

.col-notes :deep(li) {
  font-size: 1.05rem;
  line-height: 1.75;
}

.footnote {
  text-align: center;
  font-size: 1rem;
  color: #0E3F4E;
}
</style>
