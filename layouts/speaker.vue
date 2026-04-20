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
            <span>Google Cloud Summit Taipei 2023 分享 GKE 成本優化</span>
          </li>
        </ul>
      </div>

      <div class="right-col">
        <img src="/mike-hsu.jpg" class="avatar" alt="Mike Hsu" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.speaker-layout {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #FFFAF7;
  color: #0E3F4E;
  overflow: hidden;
  padding: 3rem 3.5rem 5rem;
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
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;
}

.name-block {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
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
  width: 14rem;
  height: 3px;
  background-color: #0E3F4E;
  border-radius: 2px;
}

.icons-row {
  display: flex;
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
  font-size: 1.2rem;
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
  gap: 0.65rem;
}

.creds li {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #0E3F4E;
  line-height: 1.4;
  padding: 0;
}

.creds li::before {
  display: none;
}

.star {
  color: #5296B8;
  font-size: 1rem;
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
</style>
