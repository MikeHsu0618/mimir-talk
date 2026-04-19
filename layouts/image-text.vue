<template>
  <div class="image-text-layout">
    <div class="blob-tr" />
    <div class="left">
      <div v-if="$frontmatter.tag" class="tag">{{ $frontmatter.tag }}</div>
      <slot />
    </div>
    <div class="right">
      <div class="image-frame">
        <img v-if="$frontmatter.image" :src="$frontmatter.image" :alt="$frontmatter.imageAlt || ''" />
        <slot v-else name="image" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-text-layout {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #FFFAF7;
  color: #0E3F4E;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 3rem 3.5rem;
  gap: 3rem;
}

.blob-tr {
  position: absolute;
  top: -100px;
  right: -80px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle,
    rgba(162, 206, 230, 0.35) 0%,
    transparent 65%
  );
  border-radius: 50%;
  pointer-events: none;
}

.left {
  position: relative;
  z-index: 1;
  flex: 0 0 38%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.85rem;
  background-color: #ECF5FA;
  color: #5296B8;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  width: fit-content;
  margin-bottom: 0.25rem;
}

.left :deep(h1) {
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #0E3F4E;
  margin: 0;
}

.left :deep(p) {
  font-size: 0.95rem;
  line-height: 1.65;
  color: #35738E;
  margin: 0;
}

.right {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-frame {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(14, 63, 78, 0.12);
  background: #EFE3D6;
}

.image-frame img {
  width: 100%;
  height: auto;
  display: block;
}
</style>
