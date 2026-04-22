<template>
  <div class="quote-layout" :class="$frontmatter.quote_variant ? `quote-layout--${$frontmatter.quote_variant}` : ''">
    <div class="blob-br" />

    <div class="pre-caption" v-if="$frontmatter.pre">{{ $frontmatter.pre }}</div>

    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* 復刻 template.pdf p.8：大膽黑字引言 + 右下藍色雲朵 + 關鍵字橘色強調 */
.quote-layout {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #FFFAF7;
  color: #0E3F4E;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 5rem 5rem;
  text-align: center;
}

.blob-br {
  position: absolute;
  bottom: -120px;
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
  font-size: 1.2rem;
  font-weight: 500;
  color: #0E3F4E;
  margin-bottom: 1.2rem;
  letter-spacing: 0.01em;
}

.content {
  position: relative;
  z-index: 1;
  max-width: 88%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quote-layout :deep(h1),
.quote-layout :deep(.q-headline) {
  font-size: clamp(3.6rem, 9vw, 5rem);
  font-weight: 900 !important;
  line-height: 1.2 !important;
  color: #111111 !important;
  margin: 0 !important;
}image.png

/* 關鍵字強調：顏色從 #111 → #F26D4F，由 v-click 觸發 */
.quote-layout :deep(h1 .accent),
.quote-layout :deep(.q-headline .accent) {
  color: #111111;
  font-weight: 900 !important;
  transition: color 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  /* 覆蓋 v-click 預設的 opacity:0，保持文字始終可見 */
  opacity: 1 !important;
  pointer-events: auto !important;
}

.quote-layout :deep(h1 .accent:not(.slidev-vclick-hidden)),
.quote-layout :deep(.q-headline .accent:not(.slidev-vclick-hidden)) {
  color: #F26D4F !important;
}

.quote-layout :deep(h1 strong),
.quote-layout :deep(.q-headline strong) {
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

.quote-layout--pivot .content {
  max-width: 92%;
}

.quote-layout--pivot :deep(.pivot-quote) {
  min-height: 68vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 2rem;
}

.quote-layout--pivot :deep(.pivot-quote__eyebrow) {
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  color: #d45a39;
}

.quote-layout--pivot :deep(.pivot-quote__title) {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 0.92;
}

.quote-layout--pivot :deep(.pivot-quote__line) {
  line-height: 1.1;
  font-size: clamp(3.6rem, 9vw, 5rem);
  font-weight: 600;
  color: #111111;
}

.quote-layout--pivot :deep(.pivot-quote__line--accent) {
  color: #F26D4F;
}

.quote-layout--pivot :deep(.pivot-quote__sub) {
  margin: 0.6rem 0 0;
  font-size: 1.2rem;
  line-height: 1.6;
  color: rgba(58, 49, 41, 0.82);
}
</style>
