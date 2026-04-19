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
  border-radius: 8px;
  padding: 0.85rem 1.1rem;
  font-size: 0.9rem;
  line-height: 1.6;
  border: 1px solid transparent;
  color: #0E3F4E;
}

.callout-title {
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.4rem;
}

.callout-info {
  background: #ECF5FA;
  border-color: #ADD3D8;
}
.callout-info .callout-title { color: #5296B8; }

.callout-win {
  background: rgba(173, 211, 216, 0.18);
  border-color: #ADD3D8;
}
.callout-win .callout-title { color: #35738E; }

.callout-warn {
  background: rgba(247, 168, 107, 0.12);
  border-color: rgba(247, 168, 107, 0.45);
}
.callout-warn .callout-title { color: #C97C3A; }

.callout-error {
  background: rgba(242, 109, 79, 0.08);
  border-color: rgba(242, 109, 79, 0.35);
}
.callout-error .callout-title { color: #C0502E; }
</style>
