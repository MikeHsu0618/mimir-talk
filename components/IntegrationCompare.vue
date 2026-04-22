<template>
  <div
    class="integration-compare"
    :class="{ 'integration-compare--pane-only': pane !== 'both' }"
  >
    <div
      class="integration-compare__inner"
      :class="pane === 'both' ? 'integration-compare__grid' : 'integration-compare__single'"
    >
      <div v-if="showSidecar" class="integration-pane integration-pane--sidecar">
        <div class="integration-pane__chip">SIDECAR MODE</div>
        <div class="integration-pane__title">Thanos 獨有</div>

        <div class="flow-frame">
          <img
            src="/close-integration.png"
            alt="Sidecar 整合：close integration"
            class="integration-flow-img"
          />
        </div>

        <p class="integration-caption">Sidecar 寄生 Prom Pod，直接上傳 TSDB block。</p>
      </div>
      <div v-if="showSidecar && showRemote" class="integration-compare__divider" aria-hidden="true" />
      <div v-if="showRemote" class="integration-pane integration-pane--remote">
        <div class="integration-pane__chip">REMOTE-WRITE MODE</div>
        <div class="integration-pane__title">Thanos / Mimir / Cortex 主流支持</div>

        <div class="flow-frame">
          <img
            src="/external-client.png"
            alt="Remote-write 整合：external client"
            class="integration-flow-img"
          />
        </div>

        <p class="integration-caption">Prom push 給後端，後端再負責壓縮與 index。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pane: {
    type: String,
    default: 'both',
    validator: (v) => ['both', 'sidecar', 'remote'].includes(v),
  },
})

const showSidecar = computed(() => props.pane === 'both' || props.pane === 'sidecar')
const showRemote = computed(() => props.pane === 'both' || props.pane === 'remote')
</script>

<style scoped>
.integration-compare {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  padding: 0.2rem 0.2rem 0;
}

.integration-compare--pane-only {
  min-height: 0;
  flex: 1;
}

.integration-compare__intro {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}


.integration-compare__eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #f26d4f;
}

.integration-compare__title {
  margin: 0;
  font-size: 2rem;
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: #2c2621;
}

.integration-compare__inner {
  min-height: 0;
}

.integration-compare__grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  column-gap: 2rem;
}

.integration-compare__divider {
  width: 1px;
  background: rgba(132, 115, 92, 0.12);
  align-self: stretch;
}

.integration-compare__single {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.integration-compare--pane-only .integration-pane {
  flex: 1;
  min-height: 0;
}

.integration-pane {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.integration-pane__chip {
  display: inline-flex;
  align-self: flex-start;
  padding: 0.16rem 0.45rem 0.12rem;
  border: 1px solid currentColor;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  line-height: 1.15;
  background: rgba(255, 251, 245, 0.72);
  border-radius: 10px;
}

.integration-pane__title {
  margin: 0;
  font-size: 1.62rem;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.integration-pane--sidecar .integration-pane__chip,
.integration-pane--sidecar .integration-pane__title {
  color: #f26d4f;
}

.integration-pane--remote .integration-pane__chip,
.integration-pane--remote .integration-pane__title {
  color: #0d6e8d;
}

.integration-pane__path {
  font-size: 0.58rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(132, 115, 92, 0.8);
}

.flow-frame {
  /* 兩欄各自 flex 時 header/caption 高度不同會讓 flex:1 的框變不等高；統一用同一個高度 */
  --flow-frame-height: clamp(300px, 42vh, 480px);
  box-sizing: border-box;
  flex: 0 0 380px;
  height: var(--flow-frame-height);
  min-height: 0;
  border: 1px solid rgba(228, 216, 200, 0.78);
  background: linear-gradient(180deg, rgba(255, 252, 247, 0.7) 0%, rgba(250, 244, 235, 0.48) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.45rem 0.5rem;
  overflow: hidden;
  border-radius: 12px;
}

.integration-flow-img {
  display: block;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  height: auto;
  flex: 1;
  min-height: 0;
  object-fit: contain;
  /* 框高度不變，只在框內等比放大 */
  transform: scale(1.14);
  transform-origin: center center;
}

/* 蓋過 layouts/split.vue 的 .col :deep(img)（那條有 box-shadow / border-radius / max-height:380px） */
.integration-compare .integration-flow-img {
  border: none;
  border-radius: 0;
  box-shadow: none;
  max-height: 100%;
}

.integration-caption {
  margin: 0.1rem 0 0;
  font-size: 0.72rem;
  line-height: 1.45;
  color: rgba(132, 115, 92, 0.92);
  font-style: italic;
}

@media (min-aspect-ratio: 21/9) {
  .flow-frame {
    --flow-frame-height: clamp(240px, 34vh, 360px);
  }
}
</style>
