<template>
  <div class="quote-layout">
    <div class="blob-right" />

    <div class="pre-caption" v-if="$frontmatter.pre">{{ $frontmatter.pre }}</div>

    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* 復刻 template.pdf p.8：大膽黑字引言 + 右側藍色雲朵 + 關鍵字橘色強調 */
.quote-layout {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #FFFAF7;
  color: #0E3F4E;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 5rem 5rem;
}

.blob-right {
  position: absolute;
  top: 8%;
  right: -180px;
  width: 620px;
  height: 560px;
  background: radial-gradient(circle,
    rgba(130, 198, 224, 0.55) 0%,
    rgba(162, 206, 230, 0.26) 42%,
    transparent 68%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.pre-caption {
  position: relative;
  z-index: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0E3F4E;
  margin-bottom: 1.2rem;
  max-width: 70%;
}

.content {
  position: relative;
  z-index: 1;
  max-width: 80%;
}

.quote-layout :deep(h1),
.quote-layout :deep(.q-headline) {
  font-size: 4.2rem !important;
  font-weight: 900 !important;
  line-height: 1.08 !important;
  letter-spacing: -0.025em !important;
  color: #111111 !important;
  margin: 0 !important;
}

/* 在 headline 中的關鍵字強調：用 <span class="accent"> 或 <strong> */
.quote-layout :deep(h1 strong),
.quote-layout :deep(h1 .accent),
.quote-layout :deep(.q-headline strong),
.quote-layout :deep(.q-headline .accent) {
  color: #F26D4F !important;
  font-weight: 900 !important;
}

.quote-layout :deep(h2) {
  font-size: 1rem !important;
  font-weight: 500 !important;
  color: #5296B8 !important;
  letter-spacing: 0.02em !important;
  margin: 0 0 1rem 0 !important;
}

.quote-layout :deep(p) {
  font-size: 1rem;
  color: rgba(14, 63, 78, 0.7);
  margin: 0.4rem 0 0;
}
</style>
