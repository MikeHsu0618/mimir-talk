<template>
  <div class="section-blue-layout">
    <div class="blob-tl" />
    <div class="blob-br" />

    <div class="top-bar">
      <span class="arrow-deco">→</span>
      <span v-if="$frontmatter.parent" class="parent-name">{{ $frontmatter.parent }}</span>
    </div>

    <div class="chapter-num" v-if="$frontmatter.chapter">{{ $frontmatter.chapter }}</div>

    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.section-blue-layout {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #FFFAF7;
  color: #0E3F4E;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 4rem 5.5rem;
}

/* 左上小 blob + 右下大 blob，復刻 template p.4 */
.blob-tl {
  position: absolute;
  top: -180px;
  left: -140px;
  width: 560px;
  height: 560px;
  background: radial-gradient(circle,
    rgba(130, 198, 224, 0.42) 0%,
    rgba(162, 206, 230, 0.18) 42%,
    transparent 68%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.blob-br {
  position: absolute;
  bottom: -160px;
  right: -180px;
  width: 620px;
  height: 620px;
  background: radial-gradient(circle,
    rgba(130, 198, 224, 0.52) 0%,
    rgba(162, 206, 230, 0.22) 45%,
    transparent 72%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.top-bar {
  position: absolute;
  top: 2.6rem;
  left: 4rem;
  right: 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}

.arrow-deco {
  font-size: 1.2rem;
  color: #5296B8;
  letter-spacing: 0.05em;
}

.parent-name {
  font-size: 0.8rem;
  color: #6BAEBE;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.chapter-num {
  position: relative;
  z-index: 1;
  font-size: 7.5rem;
  font-weight: 800;
  color: #5296B8;
  letter-spacing: -0.04em;
  line-height: 0.95;
  margin-top: 8rem;
  margin-bottom: 10rem;
  font-feature-settings: "tnum" 1;
}

.content {
  position: relative;
  z-index: 1;
}

.section-blue-layout :deep(h1) {
  font-size: 4.6rem !important;
  font-weight: 900 !important;
  line-height: 1.04 !important;
  letter-spacing: -0.03em !important;
  color: #0E3F4E !important;
  margin: 0 0 1rem !important;
}

.section-blue-layout :deep(h2) {
  font-size: 1.05rem !important;
  font-weight: 400 !important;
  color: #6BAEBE !important;
  letter-spacing: 0.02em !important;
  margin: 0 !important;
}

.section-blue-layout :deep(.content > div) {
  font-size: 1.6rem;
  font-weight: 500;
  color: rgba(14, 63, 78, 0.7);
  margin-top: 2.4rem !important;
  letter-spacing: 0.01em;
}

.section-blue-layout :deep(p) {
  font-size: 0.95rem;
  color: rgba(14, 63, 78, 0.55);
  margin: 0;
}
</style>
