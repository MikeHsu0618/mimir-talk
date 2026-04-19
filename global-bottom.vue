<template>
  <footer class="slide-footer">
    <span class="footer-title">PromConf Taiwan 2026</span>
    <span class="footer-author">Mike Hsu</span>
  </footer>
</template>

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
  font-family: 'Inter', sans-serif;
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
.footer-author {
  opacity: 0.75;
  font-weight: 500;
  flex-shrink: 0;
}
</style>
