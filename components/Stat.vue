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
  accent?: 'default' | 'blue' | 'ink' | 'sky' | 'orange' | 'red' | 'cyan' | 'green' | 'purple'
}>()

const accentClass = computed(() => {
  const map: Record<string, string> = {
    blue: 'accent-blue',
    ink: 'accent-ink',
    sky: 'accent-sky',
    orange: 'accent-orange',
    red: 'accent-red',
    cyan: 'accent-sky',
    green: 'accent-ink',
    purple: 'accent-blue',
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

.accent-sky    { color: #6BAEBE; }
.accent-ink    { color: #35738E; }
.accent-blue   { color: #5296B8; }
.accent-orange { color: #F7A86B; }
.accent-red    { color: #F26D4F; }
</style>
