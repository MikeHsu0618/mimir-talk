<template>
  <div class="stat-card">
    <div class="stat-value" :class="accentClass">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: string
  label: string
  accent?: 'default' | 'cyan' | 'green' | 'orange' | 'red' | 'purple'
}>()

const accentClass = computed(() => {
  const map: Record<string, string> = {
    cyan: 'accent-cyan',
    green: 'accent-green',
    orange: 'accent-orange',
    red: 'accent-red',
    purple: 'accent-purple',
  }
  return props.accent ? (map[props.accent] ?? '') : ''
})
</script>

<style scoped>
.stat-card {
  text-align: center;
  padding: 2rem 1rem 1.8rem;
  border: 1.5px solid rgba(173, 211, 216, 0.65);
  border-radius: 16px;
  background: rgba(255, 250, 247, 0.85);
  box-shadow: 0 2px 18px rgba(14, 63, 78, 0.07);
}

.stat-value {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #0E3F4E;
}

.stat-label {
  margin-top: 0.6rem;
  font-size: 0.65rem;
  color: #6BAEBE;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.accent-cyan   { color: #6BAEBE; }
.accent-green  { color: #35738E; }
.accent-orange { color: #F7A86B; }
.accent-red    { color: #F26D4F; }
.accent-purple { color: #5296B8; }
</style>
