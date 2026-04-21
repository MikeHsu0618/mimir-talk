<template>
  <div class="integration-compare">
    <div class="integration-compare__grid">
      <div class="integration-pane integration-pane--sidecar">
        <div class="integration-pane__chip">SIDECAR MODE</div>
        <div class="integration-pane__title">我們原本的架構</div>

        <div class="flow-frame">
          <Mermaid :code="sidecarMermaid" theme="dark" :scale="0.7" class="integration-mermaid" />
        </div>

        <p class="integration-caption">Sidecar 寄生 Prom Pod，直接上傳 TSDB block。</p>
      </div>

      <div class="integration-pane integration-pane--remote">
        <div class="integration-pane__chip">REMOTE-WRITE MODE</div>
        <div class="integration-pane__title">Mimir / Cortex 走這條</div>

        <div class="flow-frame">
          <img
            src="/rw-flow-light.svg"
            alt="Remote write flow"
            class="integration-remote-img"
          />
        </div>

        <p class="integration-caption">Prom push 給後端，後端再負責壓縮與 index。</p>
      </div>
    </div>
  </div>
</template>

<script setup>

const sidecarMermaid = `
flowchart TB
    subgraph Pod["Prometheus Pod"]
      direction LR
      P1[Prometheus]
      SC[Thanos<br/>Sidecar]
    end
    P1 -.-|讀 block| SC
    SC ==>|upload| S3[(S3)]
    style SC fill:#f4680033,stroke:#f46800
`

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

.integration-compare__grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.integration-pane {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.integration-pane + .integration-pane {
  padding-left: 1.7rem;
  border-left: 1px solid rgba(132, 115, 92, 0.12);
}

.integration-pane__chip {
  display: inline-flex;
  align-self: flex-start;
  padding: 0.16rem 0.45rem 0.12rem;
  border: 1px solid currentColor;
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  line-height: 1.15;
  background: rgba(255, 251, 245, 0.72);
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
  flex: 1;
  min-height: 250px;
  border: 1px solid rgba(228, 216, 200, 0.78);
  background: linear-gradient(180deg, rgba(255, 252, 247, 0.7) 0%, rgba(250, 244, 235, 0.48) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 1.1rem 1rem;
}

.integration-mermaid {
  width: 100%;
}

.integration-mermaid :deep(svg) {
  width: 100% !important;
  height: auto !important;
  max-width: none !important;
}

.integration-remote-img {
  display: block;
  width: 100%;
  max-width: 360px;
  height: auto;
  object-fit: contain;
}

.integration-caption {
  margin: 0.1rem 0 0;
  font-size: 0.72rem;
  line-height: 1.45;
  color: rgba(132, 115, 92, 0.92);
  font-style: italic;
}
</style>
