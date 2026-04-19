<script setup lang="ts">
defineProps<{
  type?: 'pain' | 'win' | 'info' | 'warn'
  title?: string
}>()
</script>

<template>
  <div class="callout" :class="type ?? 'info'">
    <div v-if="title" class="callout-title">{{ title }}</div>
    <div class="callout-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.callout {
  border-radius: 8px;
  padding: 0.9em 1.2em;
  margin: 0.6em 0;
  font-size: 0.95em;
  line-height: 1.55;
}

.callout.pain {
  background: rgba(245, 34, 45, 0.08);
  border-left: 4px solid #f5222d;
}

.callout.win {
  background: rgba(82, 196, 26, 0.08);
  border-left: 4px solid #52c41a;
}

.callout.info {
  background: rgba(66, 165, 245, 0.08);
  border-left: 4px solid #42a5f5;
}

.callout.warn {
  background: rgba(255, 155, 68, 0.08);
  border-left: 4px solid #ff9b44;
}

.callout-title {
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 0.3em;
  font-size: 0.95em;
}

.callout.pain .callout-title { color: #ff7a7a; }
.callout.win  .callout-title { color: #95de64; }
.callout.info .callout-title { color: #90caf9; }
.callout.warn .callout-title { color: #ff9b44; }

.callout-body :deep(p) {
  margin: 0;
}
</style>
