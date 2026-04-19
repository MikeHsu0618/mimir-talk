<template>
  <footer v-if="$slidev.nav.currentPage > 1 && !$frontmatter.layout?.match(/^(cover|end|statement|fact|section)$/)"
    class="deck-footer">
    <div class="footer-left">
      <span class="brand-dot"></span>
      <span class="brand-text">Thanos → Mimir 3.0 → AutoMQ</span>
    </div>
    <div class="footer-right">
      <span class="page">{{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}</span>
    </div>
  </footer>
</template>

<style scoped>
.deck-footer {
  position: absolute;
  bottom: 0.6rem;
  left: 1.2rem;
  right: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.55rem;
  color: rgba(231, 235, 243, 0.35);
  letter-spacing: 0.08em;
  font-weight: 500;
  pointer-events: none;
  z-index: 10;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f46800;
  box-shadow: 0 0 8px rgba(244, 104, 0, 0.6);
}

.brand-text {
  text-transform: uppercase;
}

.page {
  font-variant-numeric: tabular-nums;
}
</style>
