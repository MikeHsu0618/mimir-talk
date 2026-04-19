<template>
  <footer class="slide-footer">
    <span class="footer-left">
      <span>PromConf Taiwan 2026</span>
      <span class="pip"></span>
      <span>Mike Hsu</span>
    </span>
    <span></span>
  </footer>
</template>

<style scoped>
.slide-footer {
  position: fixed;
  bottom: 1.2rem;
  left: 2.5rem;
  right: 2.5rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: #C9BDA9;
  font-family: 'Inter', sans-serif;
  pointer-events: none;
  z-index: 100;
}
.footer-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.pip {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #5296B8;
  flex-shrink: 0;
}
</style>
