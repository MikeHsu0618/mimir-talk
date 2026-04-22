<template>
  <footer class="slide-footer">
    <span class="footer-title">Observability Day 2026 <span class="footer-dot">·</span> <strong>Mike Hsu</strong></span>
    <span v-if="slideReference" class="footer-reference">reference: {{ slideReference }}</span>
    <span class="footer-page">{{ $nav.currentPage }} / {{ $nav.total }}</span>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const nav = useNav()

const slideReference = computed(() => {
  const refValue = nav.currentSlideRoute.value?.meta?.slide?.frontmatter?.reference
  if (Array.isArray(refValue))
    return refValue.join(' · ')
  return typeof refValue === 'string' ? refValue : ''
})
</script>

<style scoped>
.slide-footer {
  position: fixed;
  bottom: 0.5rem;
  left: 1.5rem;
  right: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.68rem;
  color: #0E3F4E;
  font-family: 'Ubuntu', sans-serif;
  letter-spacing: 0.02em;
  pointer-events: none;
  z-index: 100;
}
.footer-title {
  opacity: 0.65;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.footer-dot {
  margin: 0 0.3em;
  font-weight: 500;
  font-size: 1.2em;
}
.footer-page {
  opacity: 0.50;
  font-weight: 500;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.footer-reference {
  opacity: 0.50;
  font-weight: 500;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

:global(.end-dark) .slide-footer {
  color: rgba(245, 240, 235, 0.45);
}
</style>
