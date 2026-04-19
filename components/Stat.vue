<script setup lang="ts">
defineProps<{
  value: string
  label: string
  accent?: 'orange' | 'green' | 'red' | 'cyan' | 'purple'
}>()
</script>

<template>
  <div class="stat-card" :class="accent ?? 'orange'">
    <div class="value">{{ value }}</div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #141a2e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.2em 1.8em;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
}

.value {
  font-size: 3em;
  font-weight: 900;
  line-height: 1;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-card.orange .value { background-image: linear-gradient(135deg, #f46800 0%, #ff9b44 100%); }
.stat-card.green  .value { background-image: linear-gradient(135deg, #52c41a 0%, #95de64 100%); }
.stat-card.red    .value { background-image: linear-gradient(135deg, #f5222d 0%, #ff7a7a 100%); }
.stat-card.cyan   .value { background-image: linear-gradient(135deg, #42a5f5 0%, #90caf9 100%); }
.stat-card.purple .value { background-image: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%); }

.label {
  font-size: 0.85em;
  color: #94a0b8;
  margin-top: 0.5em;
  letter-spacing: 0.03em;
  text-align: center;
}
</style>
