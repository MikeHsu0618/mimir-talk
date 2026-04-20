<template>
  <div class="cover-layout">
    <div class="blob-tl" />
    <div class="blob-r" />

    <div class="top-bar">
      <span class="arrow-deco">————→</span>
      <span class="event-name">Observability Day 2026</span>
    </div>

    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.cover-layout {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #FFFAF7;
  color: #0E3F4E;
  overflow: hidden;
}

.blob-tl {
  position: absolute;
  top: -140px;
  left: -120px;
  width: 560px;
  height: 560px;
  background: radial-gradient(circle,
    rgba(162, 206, 230, 0.52) 0%,
    rgba(194, 229, 245, 0.24) 42%,
    transparent 65%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.blob-r {
  position: absolute;
  top: 22%;
  right: -130px;
  width: 440px;
  height: 440px;
  background: radial-gradient(circle,
    rgba(130, 198, 224, 0.48) 0%,
    rgba(160, 206, 230, 0.22) 45%,
    transparent 68%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.top-bar {
  position: absolute;
  top: 2.8rem;
  left: 3.5rem;
  right: 3.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}

.arrow-deco {
  font-size: 0.75rem;
  color: #5296B8;
  letter-spacing: 0.05em;
}

.event-name {
  font-size: 0.85rem;
  color: #5296B8;
  font-weight: 400;
  letter-spacing: 0.03em;
}

.content {
  position: absolute;
  inset: 0;
  padding: 0 3.5rem 5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 1;
}

.cover-layout :deep(h1) {
  font-size: 6rem;
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: -0.03em;
  color: #0E3F4E;
  margin: 0 0 0.8rem;
}

.cover-layout :deep(h2) {
  font-size: 1.8rem;
  font-weight: 500;
  color: #5296B8;
  letter-spacing: 0.02em;
  margin: 0.4rem 0 0;
}

.cover-layout :deep(p) {
  font-size: 1rem;
  color: #6BAEBE;
  margin: 0.4rem 0 0;
}
</style>
