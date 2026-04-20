<template>
  <div class="callout" :class="`callout-${type ?? 'info'}`">
    <div v-if="title" class="callout-title">{{ title }}</div>
    <div class="callout-body"><slot /></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'info' | 'win' | 'warn' | 'error'
  title?: string
}>()
</script>

<style scoped>
.callout {
  border-radius: 14px;
  padding: 1rem 1.25rem 1.1rem;
  border: 1.5px solid transparent;
  box-shadow: 0 3px 14px rgba(14, 63, 78, 0.05);
  color: #0E3F4E;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.callout-title {
  font-weight: 900;
  font-size: 1.2rem;
  line-height: 1.25;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 幾何裝飾：小圓角方塊 */
.callout-title::before {
  content: '';
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.7;
  transform: rotate(12deg);
}

.callout-body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.65;
  color: rgba(14, 63, 78, 0.62);
  padding-left: 1rem; /* 與 title 文字對齊 */
}

.callout-info {
  background: rgba(82, 150, 184, 0.07);
  border-color: rgba(82, 150, 184, 0.28);
}
.callout-info .callout-title { color: #2E6A87; }

.callout-win {
  background: rgba(247, 168, 107, 0.09);
  border-color: rgba(247, 168, 107, 0.38);
}
.callout-win .callout-title { color: #C97C3A; }

.callout-warn {
  background: rgba(242, 109, 79, 0.07);
  border-color: rgba(242, 109, 79, 0.30);
}
.callout-warn .callout-title { color: #C0502E; }

.callout-error {
  background: rgba(242, 109, 79, 0.07);
  border-color: rgba(242, 109, 79, 0.28);
}
.callout-error .callout-title { color: #C0502E; }
</style>
