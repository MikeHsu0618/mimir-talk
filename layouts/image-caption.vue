<template>
  <div class="imgcap-layout slidev-layout">
    <header v-if="$frontmatter.title || $frontmatter.kicker" class="head">
      <h1 v-if="$frontmatter.title" v-html="$frontmatter.title" />
      <div v-if="$frontmatter.kicker" class="kicker">{{ $frontmatter.kicker }}</div>
    </header>

    <figure class="stage">
      <img
        v-if="$frontmatter.image"
        :src="$frontmatter.image"
        :alt="$frontmatter.imageAlt || ''"
      />
      <slot v-else />
      <figcaption v-if="$frontmatter.caption" class="caption" v-html="$frontmatter.caption" />
    </figure>
  </div>
</template>

<style scoped>
.imgcap-layout {
  padding: 2.2rem 3.5rem 3rem !important;
  display: flex !important;
  flex-direction: column;
  gap: 1.25rem;
  color: #0E3F4E;
  height: 100%;
}

.head :deep(h1),
.imgcap-layout > .head > h1 {
  font-size: 2.3rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: #0E3F4E;
  margin: 0 0 0.3rem;
}

.head .kicker {
  font-size: 1.05rem;
  font-weight: 500;
  color: #5296B8;
}

.stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  min-height: 0;
  margin: 0;
}

.stage img {
  max-width: 100%;
  max-height: 440px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 32px rgba(14, 63, 78, 0.18);
}

.caption {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 500;
  color: #0E3F4E;
  line-height: 1.55;
  max-width: 85%;
}

.caption :deep(strong) {
  font-weight: 800;
}
</style>
