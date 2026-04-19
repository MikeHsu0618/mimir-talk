<script setup lang="ts">
defineProps<{
  before: string
  after: string
  label?: string
}>()
</script>

<template>
  <div class="ba-wrap">
    <div v-if="label" class="ba-label">{{ label }}</div>
    <div class="ba-row">
      <div class="before">{{ before }}</div>
      <div class="arrow">
        <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
          <path d="M2 12 L42 12 M32 4 L42 12 L32 20" stroke="#94a0b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="after">{{ after }}</div>
    </div>
  </div>
</template>

<style scoped>
.ba-wrap {
  margin: 0.5em 0;
}

.ba-label {
  font-size: 0.85em;
  color: #94a0b8;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.4em;
  text-align: center;
}

.ba-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5em;
  align-items: center;
}

.before {
  color: #f5222d;
  text-decoration: line-through;
  text-decoration-color: rgba(245, 34, 45, 0.5);
  font-size: 1.8em;
  font-weight: 700;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.after {
  color: #52c41a;
  font-size: 2.2em;
  font-weight: 900;
  text-align: left;
  font-variant-numeric: tabular-nums;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
