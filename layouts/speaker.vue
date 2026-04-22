<template>
  <div class="speaker-layout">
    <div class="blob-tr" />

    <div class="main">
      <div class="left-col">
        <div class="name-block">
          <h1 class="name">Mike Hsu</h1>
          <div class="name-rule" />
        </div>

        <div class="icons-row">
          <div class="icon-item">
            <div class="i-carbon-screen icon-svg" />
            <span class="icon-label">DevOps</span>
          </div>
          <div class="icon-item">
            <div class="i-carbon-logo-github icon-svg" />
            <span class="icon-label">@MikeHsu0618</span>
          </div>
        </div>

        <ul class="creds">
          <li>
            <span class="star">✦</span>
            <span>"從異世界歸來發現只剩自己不會 Kubernetes" <span class="series">系列文</span></span>
          </li>
          <li>
            <span class="star">✦</span>
            <span>"你以為你在學 Grafana 其實你建立了 Kubernetes 可觀測性宇宙" <span class="series">系列文</span></span>
          </li>
          <li>
            <span class="star">✦</span>
            <span>"後 Grafana 時代的自我修養" <span class="series">系列文</span></span>
          </li>
          <li>
            <span class="star">✦</span>
            <span>"初探 LLM 可觀測性：打造可持續擴展的 AI 系統" <span class="series">系列文</span></span>
          </li>
        </ul>
      </div>

      <div class="right-col">
        <img
          v-if="!avatarLoadFailed"
          :src="avatarSrc"
          class="avatar"
          alt="Mike Hsu"
          @error="avatarLoadFailed = true"
        />
        <div v-else class="avatar avatar--fallback">Mike Hsu</div>
        <div class="qr-code">
          <img src="/qr-code.png" alt="QR Code" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const avatarSrc = '/mike-hsu.jpg'
const avatarLoadFailed = ref(false)
</script>

<style scoped>
.speaker-layout {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #FFFAF7;
  color: #0E3F4E;
  overflow: hidden;
  padding: 3rem 5rem 5rem 5rem;
}

.blob-tr {
  position: absolute;
  top: -120px;
  right: -100px;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle,
    rgba(162, 206, 230, 0.48) 0%,
    rgba(194, 229, 245, 0.22) 42%,
    transparent 65%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.main {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  gap: 2rem;
}

.left-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.right-col {
  width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
}

.name-block {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 6rem;
}

.name {
  font-size: 2.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0E3F4E;
  margin: 0;
  line-height: 1;
}

.name-rule {
  width: 11rem;
  height: 3px;
  background-color: #0E3F4E;
  border-radius: 2px;
}

.icons-row {
  display: flex;
  margin-top: 8rem;
  gap: 2.5rem;
  align-items: center;
}

.icon-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.icon-svg {
  width: 2.4rem;
  height: 2.4rem;
  color: #0E3F4E;
  flex-shrink: 0;
}

.icon-label {
  font-size: 2.2rem;
  font-weight: 700;
  color: #0E3F4E;
  letter-spacing: -0.01em;
}

.creds {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: auto;
}

.creds li {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  font-size: 1.25rem;
  color: #0E3F4E;
  line-height: 1.55;
  padding: 0;
}

.creds li::before {
  display: none;
}

.star {
  color: #5296B8;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.series {
  color: #5296B8;
  font-weight: 600;
}

.avatar {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #E4D8C8;
}

.avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: rgba(14, 63, 78, 0.7);
  border: 1.5px solid rgba(82, 150, 184, 0.28);
  background:
    radial-gradient(circle at 30% 25%, rgba(162, 206, 230, 0.42) 0%, transparent 46%),
    rgba(228, 216, 200, 0.46);
}

.qr-code {
  width: 220px;
  height: 220px;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 1rem;
}
</style>
