<template>
  <div class="inner-layout slidev-layout">
    <header v-if="$frontmatter.title || $frontmatter.kicker" class="head" :class="{ 'head--center': $frontmatter.align === 'center' }">
      <h1 v-if="$frontmatter.title" v-html="$frontmatter.title" />
      <div v-if="$frontmatter.kicker" class="kicker">{{ $frontmatter.kicker }}</div>
    </header>

    <div class="body" :class="[`align-${$frontmatter.align || 'center'}`]">
      <slot />
    </div>

    <div v-if="$frontmatter.footnote" class="footnote" v-html="$frontmatter.footnote" />
  </div>
</template>

<style scoped>
.inner-layout {
  padding: 3.2rem 3.5rem 3rem !important;
  display: flex !important;
  flex-direction: column;
  gap: 1.25rem;
  color: #0E3F4E;
  height: 100%;
}

.head :deep(h1),
.inner-layout > .head > h1 {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: #0E3F4E;
  margin: 0 0 0.8rem;
}

.head--center { text-align: center; }

.head .kicker {
  font-size: 1.5rem;
  font-weight: 500;
  color: #5296B8;
}

.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1.1rem;
  line-height: 1.7;
  min-height: 0;
}

.body.align-center { justify-content: center; }
.body.align-start { justify-content: flex-start; }

.body :deep(h2) {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0E3F4E;
  margin: 0.5rem 0 0.5rem;
}

.body :deep(h3) {
  font-size: 1.3rem !important;
  font-weight: 700;
  color: #0E3F4E;
  margin: 0.25rem 0 0.5rem;
}

.body :deep(p) {
  font-size: 1.1rem;
  line-height: 1.7;
  margin: 0;
}

.body :deep(li) {
  font-size: 1.1rem;
  line-height: 1.8;
}

.footnote {
  text-align: center;
  font-size: 1rem;
  color: #6BAEBE;
}
</style>
