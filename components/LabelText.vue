<template>
  <div class="label-text">
    <div v-if="title" class="label-text__title">{{ title }}</div>
    <div class="label-text__body"><slot /></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<style scoped>
.label-text {
  padding: 1rem 1.25rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.label-text__title {
  font-weight: 900;
  font-size: 1.2rem;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: #F26D4F;
}

.label-text__body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.65;
  color: #0E3F4E;
}
</style>
