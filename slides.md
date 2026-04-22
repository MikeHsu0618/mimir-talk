---
theme: default
title: 從 Thanos 到 Mimir 3.0 — 我們如何把可觀測性後端玩到極致
info: |
  ## 從 Thanos 到 Mimir 3.0
  AI 時代下的可觀測性基礎設施重構 — Mimir 3.0 · AutoMQ · Parquet Gateway
author: Mike Hsu
keywords: mimir, thanos, observability, prometheus, kafka, automq, parquet, kip-1150
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
mdc: true
aspectRatio: 16/9
canvasWidth: 1280
colorSchema: light
fonts:
  sans: 'Ubuntu'
  mono: 'JetBrains Mono'
  provider: google
download: false
exportFilename: mimir-talk
seoMeta:
  ogTitle: 從 Thanos 到 Mimir 3.0
  ogDescription: AI 時代下的可觀測性基礎設施重構
defaults:
  transition: fade
layout: cover-template
---

# 從 Thanos<br/>到 Mimir 3.0

## AI 時代下 · 我們如何重構可觀測性的地基

<div class="mt-8 flex flex-col gap-1 tracking-wider" style="color:#5296B8;">
  <div style="font-size:1.15rem;font-weight:500;">Mike Hsu </div>
</div>

<div class="abs-br m-8 flex gap-2">
  <span class="tag new">Mimir 3.0</span>
  <span class="tag new">AutoMQ</span>
  <span class="tag new">Parquet</span>
</div>

<!--
開場建議（自由發揮）：
- 自我介紹 + 今天 40 分鐘要帶大家走的路
- Hook 句：「最神奇的 AI 世界，底下跑的還是這些最不性感的基礎設施」
- 這是一份工程日誌，不是產品宣傳：會有踩坑、會有真實成本數字、會有沒解決的難題
- 這場演講會分享我們從 Thanos 遷移到 Mimir 的真實歷程
- 最後會帶大家看一下長期指標後端的未來方向（Parquet Gateway）
-->

---
layout: quote
---

# 我們 Metrics 後端的<br/>主要使用者<br/><span v-click class="accent">已經不再是人類</span>

<p>觀測者從人換成 Agent， 從偶爾查到 24/7。</p>

<!--
切入動機（hook 要講得慢一點）：
- 以前 metrics 是給 SRE 早上喝咖啡時看 dashboard 用的
- 現在組織裡越來越多人建立自己的 agent — SRE agent、DB agent、service agent
- 一個人消化資訊的能力有限；AI agent 一秒吞下一整面 dashboard，還會追著問下一層
- 查詢模式從「偶爾」變成「連續」、從「手動」變成「程式化」
- 我們原本的 metrics 基礎設施（Thanos）每天被這些 agent 嚴峻考驗
-->

---
layout: inner
title: AI Agent 時代下，基礎設施備受考驗。
---

<div class="w-full flex flex-col gap-5">
<div class="flex justify-center items-center rounded-2xl relative" style="border:1.5px dashed rgba(82,150,184,0.4);background:rgba(82,150,184,0.04);height:400px;">
  <div class="text-center" style="opacity:0.5;">
    <div class="text-xs uppercase tracking-widest mb-2">Reserved for Live Demo</div>
    <div class="text-base">▶ SRE Agent Videos</div>
  </div>
  <div style="position:absolute;bottom:0.75rem;right:1rem;font-size:0.75rem;opacity:0.4;">⏱ 20–30 sec budget</div>
</div>
<div class="grid grid-cols-3 gap-4">
<LabelText title="現在">幾個 agent 在跑。尚未飽和。</LabelText>
<LabelText title="即將到來">DB · Service · Cost · Security agents。</LabelText>
<LabelText title="這只是開始">負載是現在的幾倍。地基得現在打。</LabelText>
</div>
</div>

<!--
這頁是「影片位」，投影片負責 framing：
- 這幾部影片是我們 SRE team 正在跑的 agent
- 它們 24/7 在打我們的 metrics backend — 比任何 dashboard 都兇
- 未來會有更多 agent：DB agent、service agent、cost agent…
- 重點：這還只是 early adopter 階段。一旦全公司飽和，metrics backend 的負載是現在的幾倍
- 所以我們選型時，看的不是今天的工作負載，是兩年後的
-->

---
layout: inner
title: 我們目前的規模
---

<div class="grid grid-cols-4 gap-5 w-full">
  <Stat value="40" label="EKS Clusters" />
  <Stat value="120M" label="Peak Active Series" accent="red" />
  <Stat value="8M" label="Samples / sec" />
  <Stat value="365" label="retention period" />
</div>

<div v-click class="grid grid-cols-4 gap-5 mt-4">
<div class="why-card why-card--ink col-span-2">
  <div class="why-card__head">
    <mdi-memory class="why-card__icon" />
    <div>
      <div class="why-card__title">為什麼訂 Active Series</div>
    </div>
  </div>
  <div class="why-card__note">常駐記憶體 ≈ 8 KB × active series</div>
  <ul class="why-list why-list--loose">
    <li><mdi-clock-outline class="why-list__icon" /><span>TSDB head chunk</span></li>
    <li><mdi-magnify class="why-list__icon" /><span>In-memory postings index</span></li>
    <li><mdi-tune class="why-list__icon" /><span>Label set 本身</span></li>
  </ul>
  <div style="border-top:1px solid rgba(14,63,78,0.08);padding-top:0.75rem;font-weight:600;color:rgba(14,63,78,0.8);">
    120M × 8 KB ≈ <strong>960 GB RAM</strong>
  </div>
</div>
<div class="pain-card col-span-2">
  <div class="pain-card__num">2023 年</div>
  <div class="pain-card__kicker">選擇了 Thanos</div>
  <div class="pain-card__body">當時最成熟的開源選項，唯一能無侵入掛 Sidecar。</div>
  <div class="pain-card__foot">
    <mdi-clock-outline /> 服役時間超過三年。
  </div>
</div>
</div>

<!--
這頁建立 credibility：
- 40 個 EKS cluster、尖峰 1.2 億 active series、每秒 8M samples、365 天保留
- 為什麼盯 active series？因為它直接決定 ingester 記憶體，而記憶體是長期指標後端最貴的資源
- 每條 series 約 8 KB（TSDB head chunk + postings index + label set）
- 1.2 億 × 8 KB = 960 GB — 光 ingester 就要這麼多 RAM
- 2023 選 Thanos 是當時正確的決定（sidecar mode 可以無侵入掛上現有 Prom）
- 但這個量級讓我們踩到所有結構性坑 — 正是今天要分享的故事
-->

---
layout: section-blue
chapter: "01"
parent: Thanos → Mimir 3.0
---

# 長期指標<br/>後端架構

<div class="mt-6 opacity-60 ml-3">兩種架構 · 兩種設計哲學</div>

<!--
進入第一大段：架構介紹
不要花太多時間科普，我們團隊內部都熟悉 Prometheus 生態
這段的目的是讓聽眾跟著我的思路建立對比架構
-->

---
layout: inner
title: Prometheus 孤掌難鳴
---

<div class="w-full flex flex-col h-full pt-20 gap-18">

<div class="grid grid-cols-2 gap-6 items-stretch">

<div class="why-card why-card--red">
  <div class="why-card__head">
    <mdi-alert-circle class="why-card__icon" />
    <div>
      <div class="why-card__title">先天限制</div>
    </div>
  </div>
  <ul class="why-list why-list--loose">
    <li style="font-size:1.15rem!important;"><mdi-clock-alert-outline class="why-list__icon" /><span>本地留 <strong>14 天</strong>就滿。</span></li>
    <li style="font-size:1.15rem!important;"><mdi-database-off-outline class="why-list__icon" /><span>單機儲存，單點壞掉就沒了。</span></li>
    <li style="font-size:1.15rem!important;"><mdi-magnify-close class="why-list__icon" /><span>跨集群無法統一查詢。</span></li>
    <li style="font-size:1.15rem!important;"><mdi-memory class="why-list__icon" /><span>記憶體用量跟著 active series 線性成長<br/>( 垂直擴展瓶頸 )</span></li>
  </ul>
</div>

<div class="why-card why-card--blue">
  <div class="why-card__head">
    <mdi-lightbulb-on-outline class="why-card__icon" />
    <div>
      <div class="why-card__title">被要求做的事</div>
    </div>
  </div>
  <ul class="why-list why-list--loose">
    <li style="font-size:1.15rem!important;"><mdi-history class="why-list__icon" /><span>看上個月的 baseline。</span></li>
    <li style="font-size:1.15rem!important;"><mdi-chart-timeline-variant class="why-list__icon" /><span>熱門節日 vs. 平日。</span></li>
    <li style="font-size:1.15rem!important;"><mdi-trophy-outline class="why-list__icon" /><span>算 SLO 年度達成率。</span></li>
    <li style="font-size:1.15rem!important;"><mdi-robot-outline class="why-list__icon" /><span>讓 AI agent 連續回溯歷史<br/>( 一個窗口可能發幾千個 PromQL )</span></li>
  </ul>
</div>

</div>

<div v-click class="why-conclusion why-conclusion--inline">
  <span>要的是一個</span>
  <span class="why-conclusion__mark">高吞吐</span>
  <span>・</span>
  <span class="why-conclusion__mark">低延遲</span>
  <span>・</span>
  <span class="why-conclusion__mark">便宜</span>
  <span>而且能擺脫單機天花板的長期儲存後端。</span>
</div>

  

</div>

<!--
- 這張快速過，聽眾都懂
- 重點是最後一個 bullet：AI agent 的歷史回溯 — 這是現在新出現的需求
- 強調這跟以往的「偶爾查看 dashboard」是不同量級的
-->

---
layout: split
title: 兩種整合模式
kicker: Sidecar vs. Remote-Write.
ratio: "1:1"
---

::left::

<IntegrationCompare pane="sidecar" />

::right::

<IntegrationCompare pane="remote" />

<!--
補充：
- Sidecar 是 Thanos 的標誌性設計，跟 Cortex/Mimir 的 remote_write 哲學不同
- 兩者各有優缺點，先看 Sidecar 的妙處
-->

---
layout: inner
title: Sidecar 的巧妙之處
kicker: 它不重工，效率至上。
---

<div class="flex flex-col gap-3 w-full h-full min-h-0 -mt-20">
<div class="flex-1 min-h-0 flex items-center justify-center">
  <div class="w-full max-w-6xl mx-auto">
    <img
      src="/sidecar-mode.png"
      alt="Sidecar mode flow"
      class="block w-full h-full object-contain"
      style="max-height: 46vh;"
    />
  </div>
</div>

<div class="grid grid-cols-2 gap-4 flex-shrink-0 max-w-5xl mx-auto w-full">
<Callout type="win" title="關鍵洞察">
<strong>S3 上的 block 和本地 disk 完全一樣</strong><br/>
Sidecar 不做任何運算
</Callout>

<Callout type="info" title="對比 Remote-write">
Backend 要解 protobuf、壓縮、重建 index
<br/>
同一份運算做了兩次。</Callout>
</div>

</div>

<!--
補充（重要）：
- 這張是為了鋪陳「Sidecar 不是笨設計，它有它的巧妙」
- 這樣接下來的痛點討論才誠實
- 讓聽眾知道我們不是盲目換掉 Sidecar，是因為遇到了 Sidecar 架構的結構性問題
-->

---
layout: quote
quote_variant: pivot
---

<div class="pivot-quote">
  <div class="pivot-quote__eyebrow">但是，三年之後</div>
  <div class="pivot-quote__title">
    <span class="pivot-quote__line">我們</span>
    <span class="pivot-quote__line pivot-quote__line--accent">面臨的痛點</span>
  </div>
  <p class="pivot-quote__sub">Thanos Sidecar 架構下的兩處侷限。</p>
</div>


<!--
過場頁：給聽眾一個心理緩衝
- 前面講完 Sidecar 的好
- 現在要誠實展示為什麼我們要離開
- 分兩個痛點：短期查詢 + 長期查詢
-->

---
layout: split
eyebrow: '<span class="title-eyebrow"><span>痛點</span><span class="title-eyebrow__num">①</span><span>短期查詢</span></span>'
title: "垂直擴展瓶頸被 Sidecar 放大"
ratio: "3:2"
---

::left::

<img src="/thanos-query-architecture.png" alt="Thanos query architecture" class="w-full" style="border:none;box-shadow:none;border-radius:0;height:420px;max-height:none;width:100%;object-fit:contain;object-position:center;" />

<p v-click class="text-center text-md opacity-70">繼續走，只剩兩條路：<strong class="text-red-400">買更大的機器，或換架構</strong></p>

::right::

<div  class="h-full">
  <div class="h-full rounded-[18px] px-8 pt-8 pb-7 flex flex-col" style="background:linear-gradient(160deg,rgba(242,109,79,0.10) 0%,rgba(255,250,247,0.55) 100%);border:1.5px solid rgba(242,109,79,0.30);color:#0E3F4E;box-shadow:0 4px 20px rgba(14,63,78,0.06);">
    <div class="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit" style="color:#C0502E;border:1.5px solid #C0502E;">Single Prometheus Pod</div>
    <div class="mt-8 text-[9rem] leading-[0.86] font-black" style="color:#F26D4F;letter-spacing:-0.03em;">512</div>
    <div class="text-[2rem] leading-none font-semibold -mt-1" style="color:#0E3F4E;">GiB RAM</div>
    <div class="mt-6 border-t" style="border-color:rgba(14,63,78,0.12);"></div>
    <div class="mt-6 text-[1rem] leading-relaxed">
      <div><strong>Prometheus</strong> 400+ GiB</div>
      <div><strong>Sidecar</strong> 50+ GiB</div>
    </div>
    <div class="mt-auto pt-6 text-sm leading-relaxed italic opacity-75">
      Sidecar 幫短期查詢扛 remote-read buffer <br/><strong>記憶體壓力被放大。</strong>
    </div>
  </div>
</div>

<!--
這是整場第一個 money shot。
補充（自由發揮）：
- 512 GiB 聽起來很誇張，但那是我們真實的 production 數字
- 我們的 Prometheus 已經在單一節點 vertical 到這個程度
- 繼續往下走只剩兩條路：買更大的機器 / 或換架構
- 這個數字是我們決定遷移的第一個導火線
-->

---
layout: inner
eyebrow: '<span class="title-eyebrow"><span>痛點</span><span class="title-eyebrow__num">②</span><span>長期查詢</span></span>'
title: "Thanos 與 Mimir 查詢細節差異"
kicker: "不是 Thanos 不好，只是我們踩坑踩到心力憔悴。"
---

<div class="w-full flex flex-col gap-5">
<div class="path-grid">
  <div class="path-card path-card--danger">
    <div class="path-card__ribbon path-card__ribbon--danger">靜態 SHARDING</div>
    <div class="path-card__num">01</div>
    <div class="path-card__title">寫死在 manifest<br/>改一次要全部 block 重分配</div>
    <div class="path-card__desc">Thanos 的 shard assignment 綁在 manifest，調整一次就要整批 block 重切。<br/>Mimir 用 Hash Ring，自動 rebalance。</div>
    <div class="path-card__foot">
      <mdi-source-branch /> 重新分配成本高
    </div>
  </div>

  <div class="path-card path-card--danger">
    <div class="path-card__ribbon path-card__ribbon--danger">佇列與資源搶奪</div>
    <div class="path-card__num">02</div>
    <div class="path-card__title">Mimir 2.7 已支援<br/>Thanos 到 2026-01 才 merge</div>
    <div class="path-card__desc">Mimir 2.7（2023-10）就有 worker / queue 隔離。<br/>Thanos 要到 2026-01 才 merge PR #8623，把同一支佇列切成 per-tenant。</div>
    <div class="path-card__foot">
      <mdi-timeline-clock /> 多租戶保護成熟度有差
    </div>
  </div>

  <div class="path-card path-card--danger">
    <div class="path-card__ribbon path-card__ribbon--danger">單一租戶卡死</div>
    <div class="path-card__num">03</div>
    <div class="path-card__title">一個 heavy long-range query<br/>拖住所有 worker</div>
    <div class="path-card__desc">單一租戶把 worker 佔滿，其他租戶全部排隊。<br/>Mimir 有 per-tenant fair queuing，用閘門隔離重查詢。</div>
    <div class="path-card__foot">
      <mdi-account-alert /> 單點 heavy query 會放大成全域問題
    </div>
  </div>
</div>
</div>
<!--
補充：
- 這段不要深講 11 維度的比較，聽眾會消化不下
- 重點讓聽眾感受：Mimir Store-Gateway 是為大規模多租戶設計的，Thanos 是從 Prometheus 長出來的
- 兩者的設計前提不同，不是誰對誰錯
-->

---
layout: inner
title: 三條決策維度，我們一條一條想清楚
---

<div class="w-full flex flex-col gap-5">

<div class="path-grid">

<div class="path-card">
  <div class="path-card__ribbon path-card__ribbon--warn">短期瓶頸</div>
  <div class="path-card__num">01</div>
  <div class="path-card__title">Sidecar<br/>vs Remote-Write</div>
  <div class="path-card__desc">把壓縮 / index 的工作交給後端<br/>解放 Prometheus + Sidecar Pod 記憶體</div>
  <div class="path-card__foot">
    <mdi-speedometer /> 緩解短期垂直瓶頸
  </div>
</div>

<div class="path-card">
  <div class="path-card__ribbon path-card__ribbon--warn">長期瓶頸</div>
  <div class="path-card__num">02</div>
  <div class="path-card__title">Thanos<br/>vs Mimir</div>
  <div class="path-card__desc">Mimir 的 bucket-index、動態 sharding、MQE<br/>為大規模多租戶而生</div>
  <div class="path-card__foot">
    <mdi-database-search /> 解決長期查詢瓶頸
  </div>
</div>

<div class="path-card">
  <div class="path-card__ribbon path-card__ribbon--warn">採集端</div>
  <div class="path-card__num">03</div>
  <div class="path-card__title">Prom Server<br/>vs Prom Agent</div>
  <div class="path-card__desc">砍掉 Prom Server 本地 query / alert 責任<br/>徹底消除採集端瓶頸</div>
  <div class="path-card__foot">
    <mdi-alert-octagon /> 最激進 · 風險最高
  </div>
</div>

</div>

<!-- <div v-click="1" class="path-conclusion">
  <mdi-lightbulb-on class="path-conclusion__icon" />
  <div>
    三個維度互相<strong style="color:#F26D4F">獨立</strong> · 下一頁把排列組合攤開，一個一個刪去
  </div>
</div> -->

</div>

<!--
- 一次介紹三個決策維度 — 把思考空間先攤開
- ① 緩解短期瓶頸：可以先做
- ② 解決長期查詢：需要換後端
- ③ 砍 Prom Server：最激進，HPA / KEDA / Alert evaluation 都綁在 Prom 上
- 三個維度是「可以獨立組合」的，所以下一頁會畫排列組合
- 特別強調 ③ Prom Agent 的風險：HPA/KEDA 依賴 metrics 作決策，如果 metrics backend 不穩，business 會受直接影響
-->

---
layout: inner
kicker: ※ 合法性約束：Mimir 只吃 remote-write（無 Sidecar 模式）· Prom Agent 無本地 TSDB（不能配 Sidecar）
title: 排列組合 · 一個一個刪去
---

<div class="w-full flex flex-col gap-3">

<div class="combo-list flex flex-col gap-2.5">

<div class="combo-row">
  <div class="combo-row__num">①</div>
  <div class="combo-row__body">
    <div class="combo-row__title">Thanos · Sidecar · Prom Server <span class="combo-row__hint">（現況）</span></div>
    <div class="combo-row__desc">短期 + 長期都撞牆</div>
  </div>
  <span class="tag warn">撞牆</span>
</div>

<div class="combo-row">
  <div class="combo-row__num">②</div>
  <div class="combo-row__body">
    <div class="combo-row__title">Thanos · Remote-Write (Receiver) · Prom Server</div>
    <div class="combo-row__desc">短期解了，長期 Store Gateway 沒解</div>
  </div>
  <span class="tag warn">半套</span>
</div>

<div class="combo-row">
  <div class="combo-row__num">③</div>
  <div class="combo-row__body">
    <div class="combo-row__title">Thanos · Remote-Write · Prom Agent</div>
    <div class="combo-row__desc">長期沒解 · 又把 alert 風險疊加</div>
  </div>
  <span class="tag warn">風險疊加</span>
</div>

<div class="combo-row" :class="{ 'is-chosen': $clicks >= 1 }">
  <div class="combo-row__num">④</div>
  <div class="combo-row__body">
    <div class="combo-row__title">Mimir · Remote-Write · Prom Server</div>
    <div class="combo-row__desc">同時解短期 + 長期 · Prom Server 保留做 alert / HPA / KEDA 的可靠來源</div>
  </div>
  <span class="tag" :class="$clicks >= 1 ? 'good' : 'warn'">{{ $clicks >= 1 ? '選這條' : '？' }}</span>
</div>

<div class="combo-row">
  <div class="combo-row__num">⑤</div>
  <div class="combo-row__body">
    <div class="combo-row__title">Mimir · Remote-Write · Prom Agent</div>
    <div class="combo-row__desc">太激進 — HPA / KEDA / Alert 全綁 Mimir</div>
  </div>
  <span class="tag warn">激進</span>
</div>

</div>

<div v-click class="path-conclusion">
  <mdi-lightbulb-on class="path-conclusion__icon" />
  <div>
    刪去法 → 剩下 <strong style="color:#F26D4F;">④</strong>：Mimir 換後端、Prom Server <strong>保留</strong> 做最後防線
  </div>
</div>

</div>

<!--
- 排列空間的合法性約束要先點出來：
  - Mimir 沒有 Sidecar 模式（它只吃 remote-write）
  - Prom Agent 無本地 TSDB（沒 block 可給 Sidecar 上傳）
- 所以實際合法組合是 5 個（原本的 Sidecar+Mimir 根本不存在）
- ①②③ 都是 Thanos 系，結構性問題各自沒解完
- ⑤ 太激進：Prom Agent = alert / HPA / KEDA 全交給後端，後端抖動就業務抖動
- 保留 Prom Server 是保險決策 — 未來想切 Agent，這條路還能走
-->

---
layout: section-blue
chapter: "02"
parent: Thanos → Mimir 3.0
---

# Mimir 3.0 架構

<div class="mt-6 opacity-60">為什麼 Mimir 3.0 是這次遷移的臨門一腳</div>

<!--
進入 Mimir 3.0 介紹段
先給大畫面 (官方圖)，再拆解
-->

---
layout: inner
title: 為什麼偏偏挑這個時間點？
---

<div class="w-full flex flex-col gap-4">

<div class="grid grid-cols-2 gap-5 items-stretch">

<div class="why-card why-card--orange">
  <div class="why-card__head">
    <mdi-rocket-launch class="why-card__icon" />
    <div>
      <div class="why-card__kicker">版本時機</div>
      <div class="why-card__title">Mimir 3.0 剛好到位</div>
    </div>
  </div>
  <ul class="why-list">
    <li><mdi-calendar-check class="why-list__icon" /><span>2025 下半年推出 · 三大主題 <strong>Reliability · Performance · Cost</strong></span></li>
    <li><mdi-swap-horizontal class="why-list__icon" /><span><strong>Ingest Storage</strong> — Kafka-API 寫讀解耦</span></li>
    <li><mdi-flash class="why-list__icon" /><span><strong>Mimir Query Engine</strong> — streaming + optimization</span></li>
    <li><mdi-chart-line-variant class="why-list__icon" /><span>Grafana Cloud dogfood · <strong>~25% TCO ↓</strong></span></li>
  </ul>
</div>

<div class="why-card why-card--blue">
  <div class="why-card__head">
    <mdi-trending-up class="why-card__icon" />
    <div>
      <div class="why-card__kicker">生態走勢</div>
      <div class="why-card__title">Grafana vs Thanos 社群態勢</div>
    </div>
  </div>
  <ul class="why-list">
    <li><mdi-fire class="why-list__icon" /><span>Grafana Labs 對 <strong>LGTM</strong> 集中火力投資</span></li>
    <li><mdi-rocket-launch-outline class="why-list__icon" /><span>Mimir <strong>每個 minor</strong> 都在重大升級</span></li>
    <li><mdi-turtle class="why-list__icon" /><span>Thanos 社群節奏<strong>不快</strong>（個人營運經驗）</span></li>
    <li><mdi-file-document-alert-outline class="why-list__icon" /><span>文件<strong>不齊</strong> · 深度問題大多得翻 source code 才有答案</span></li>
    <li><mdi-account-group class="why-list__icon" /><span>下一代儲存 <strong>Parquet Gateway</strong> 由三家社群共同推 — 未來紅利 Thanos 也分得到</span></li>
  </ul>
</div>

</div>

<!-- <div v-click>
<Callout type="win" title="選型的風向判斷">
Thanos 是可靠的老兵，但 <strong>Mimir 正站在浪尖</strong> — 選方向比選當下更重要
</Callout>
</div> -->

</div>

<!--
- Mimir 3.0 剛好在我們評估的時間點推出
- 社群態勢是我自己營運 3 年的第一手經驗，不是引用外部報告
- Thanos 節奏不算快（相對 Mimir 的更新密度）
- 文件不齊全，深度問題（sharding 行為、cache key、memory behavior）大多得翻 source code
- 下一代儲存 Parquet Gateway 三家社群共同推（後面 Slide 會展開）
- 我們選 Mimir 的理由不是「Thanos 要死了」，而是「Mimir 現在就有 Ingest Storage + MQE 可以兌現」
-->

---
layout: split
title: Mimir 3.0 的三大支柱
ratio: "1:1"
---

::left::

<img src="/mimir3-architecture-official.png" class="w-full h-full border-none shadow-none" style="object-fit:cover;" />

::right::

<div class="flex flex-col gap-3">

<div class="pillar-card pillar-card--orange">
  <div class="pillar-card__title"><mdi-check-circle />Reliability</div>
  <div class="pillar-card__note">寫讀徹底解耦</div>
  <div class="pillar-card__body">Kafka 中繼 · 讀端掛了寫依然健康 · quorum 從 2/3 降到 1</div>
</div>

<div class="pillar-card pillar-card--blue">
  <div class="pillar-card__title"><mdi-chart-line />Performance</div>
  <div class="pillar-card__note">Mimir Query Engine</div>
  <div class="pillar-card__body">Streaming 取代全量載入 · Peak CPU ↓80% · Peak Mem ↓3×</div>
</div>

<div class="pillar-card pillar-card--red">
  <div class="pillar-card__title"><mdi-content-cut />Cost</div>
  <div class="pillar-card__note">Ingester 減半</div>
  <div class="pillar-card__body">Zones 從 3 降到 2 · 副本不靠 RF=3 · ~25% TCO ↓</div>
</div>

</div>

<!-- <div v-click style="margin-top:0.75rem;text-align:center;font-size:0.85rem;opacity:0.78;">
  接下來拆兩個支柱講 — 先 <strong style="color:#F7A86B">Ingest Storage</strong>，再 <strong style="color:#5296B8">MQE</strong>
</div> -->

<!--
- Grafana 官方 Mimir 3.0 三大主題：Reliability / Performance / Cost
  - 右半 Data to ingest → distributor → Kafka → ingesters = 寫路徑（Ingest Storage 核心）
  - 左半 Queries → query-frontend → querier → ingesters + store-gateway = 讀路徑
  - Compactor 在 object storage 背後壓縮
- 下方三卡片講三大支柱：Reliability（解耦）/ Performance（MQE）/ Cost（Ingester 減半）
- 下兩頁深入 Ingest Storage
-->

---
layout: split
title: "Ingest Storage"
kicker: "從「3 副本寫入」到「1 次 Kafka produce」"
ratio: "1:1"
---

::left::

<div class="section-badge section-badge--red">Mimir v2 · Classic</div>

<div class="mermaid-eq">

```mermaid {theme: 'dark', scale: 0.68}
flowchart LR
    D[Distributor] ==>|RF=3<br/>gRPC Push| I1[Ingester-a]
    D ==> I2[Ingester-b]
    D ==> I3[Ingester-c]
    I1 -->|2/3 quorum| Q[Querier]
    I2 --> Q
    I3 --> Q
    style I1 fill:#ff8c3c33,stroke:#ff8c3c
    style I2 fill:#ff8c3c33,stroke:#ff8c3c
    style I3 fill:#ff8c3c33,stroke:#ff8c3c
```

</div>

<ul>
  <li><strong>寫 3 次</strong> gRPC Push · Querier 讀 2/3 才算成功</li>
  <li>Ingester 身兼寫入、查詢、建 block、上傳 S3</li>
</ul>

<div v-click class="mt-2 rounded-xl p-3" style="background:rgba(242,109,79,0.06);border:1.5px solid rgba(242,109,79,0.28);">
  <div style="font-size:1rem;font-weight:800;color:#C0502E;margin-bottom:0.35rem;">為什麼要 2/3 quorum？</div>
  <div style="font-size:0.92rem;line-height:1.6;color:rgba(14,63,78,0.72);"><strong>Dynamo-style 不變式：</strong> <code>R + W &gt; N</code><br/>W=2 · R=2 · N=3 → <strong>4 &gt; 3 ✓</strong>　讀集合與最新寫入必交集</div>
</div>

::right::

<div class="section-badge">Mimir 3.0 · Ingest Storage</div>

<div class="mermaid-eq">

```mermaid {theme: 'dark', scale: 0.68}
flowchart LR
    D[Distributor] ==>|ProduceSync<br/>寫 1 次| K[(Kafka API)]
    K -->|consume| I[Ingester<br/>Partition consumer]
    K -->|consume| BB[Block Builder]
    BB --> S3[(S3)]
    Q[Querier] -->|quorum = 1| I
    style K fill:#a78bfa22,stroke:#a78bfa
    style I fill:#ff8c3c33,stroke:#ff8c3c
    style BB fill:#5296B822,stroke:#5296B8
```

</div>

<ul>
  <li><strong>寫 1 次</strong> · Querier 讀 <strong>1 個</strong> 健康 consumer 就夠</li>
  <li>Block Builder 獨立元件 · Ingester 純 consume</li>
</ul>

<div v-click class="mt-2 rounded-xl p-3" style="background:rgba(82,150,184,0.07);border:1.5px solid rgba(82,150,184,0.30);">
  <div style="font-size:1rem;font-weight:800;color:#2E6A87;margin-bottom:0.35rem;">為什麼 quorum = 1 就夠？</div>
  <div style="font-size:0.92rem;line-height:1.6;color:rgba(14,63,78,0.72);"><strong>Kafka partition = linearized log</strong><br/>每個 consumer 都是同一 log 完整 replay · 無分歧狀態 · 不需 overlap</div>
</div>

<!--
- 左右對比把最關鍵的變化講清楚：
  - 寫入從 3 副本變 1 次
  - Ingester 從「什麼都做」變成純 consumer
  - Block 建構拆出去 — 各元件獨立 scale
- 兩欄各自底部：2/3 的 Dynamo 不變式 vs Kafka 單一 log 為何只需 quorum=1（純 split，無第三列）
- 引自 Grafana 官方（Jonathan）：「我們依賴的不是 Kafka，是 Kafka API」— 可換 WarpStream / Redpanda / AutoMQ
- Kafka API 不是 Kafka — 這個很重要，為後面 AutoMQ 鋪路
-->

---
layout: split
title: Write/Read Path 完全解耦 · Quorum = 1
ratio: "3:2"
---

::left::

<img src="/mimir3-decouple.png" class="w-full h-full object-contain" style="border:none;box-shadow:none;background:transparent;" />

::right::

<div class="flex flex-col gap-3 justify-center h-full" style="font-size:1.15rem;">
<Callout type="win" title="可用性翻轉">
v2：過半 zone 健康才算活<br/>
v3：<strong>每個 partition 有 1 個消費者</strong>就算活
</Callout>

<Callout type="info" title="可用性變成旋鈕">
想更高可用？<strong>把 partition 數加一倍</strong><br/>
—— 而不是加整組 zone
</Callout>
</div>

<!-- <div v-click class="insight">
  <div class="insight-label">實戰意義</div>
  <div class="insight-text">熱查詢再兇 · 寫入只到 Kafka 就結束<br/><strong>Write 永遠 HEALTHY</strong></div>
</div> -->

<!--
- 這張圖視覺效果很強：Write ✅ / Read ✗
- v2 的 quorum 是 2/3，只要 2 個 zone 各死 1 個 ingester 就掛
- v3 的 quorum 是 1 — 每個 partition 有 1 個 ingester 活著就活
- 想提高可用性？加 partition（便宜），不用加整個 zone（貴）
- 對 SRE 的意義：查詢爆炸不再變成寫入事件；alert 的源頭不會因此消失
-->

---
layout: inner
title: 副本數學 — 成本最大的砍刀
align: start
---

<table style="width:100%;font-size:1rem;">
<thead>
<tr style="font-size:1rem;letter-spacing:0.06em;color:#0E3F4E;border-bottom:2px solid #C9BDA9;">
<th style="text-align:left;padding:0.55rem 0.9rem;">維度</th>
<th style="text-align:center;padding:0.55rem 0.9rem;">Classic RF=3 + 3 zones</th>
<th style="text-align:center;padding:0.55rem 0.9rem;">Ingest Storage + 3 zones</th>
<th style="text-align:center;padding:0.55rem 0.9rem;color:#35738E;font-weight:800;">Ingest Storage + 2 zones ✦</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom:1px solid #E4D8C8;"><td style="padding:0.45rem 0.9rem;color:#000;font-size:0.88rem;font-weight:600;">副本決定方式</td><td style="text-align:center;">RF=3（寫 3 次）</td><td style="text-align:center;">zone 數決定</td><td style="text-align:center;">zone 數決定</td></tr>
<tr style="border-bottom:1px solid #E4D8C8;"><td style="padding:0.45rem 0.9rem;color:#000;font-size:0.88rem;font-weight:600;">實際副本數</td><td style="text-align:center;color:#F26D4F;font-weight:700;">3×</td><td style="text-align:center;">3×</td><td style="text-align:center;color:#35738E;font-weight:800;">2×</td></tr>
<tr style="border-bottom:1px solid #E4D8C8;"><td style="padding:0.45rem 0.9rem;color:#000;font-size:0.88rem;font-weight:600;">Write 容錯</td><td style="text-align:center;">1 zone (2/3 quorum)</td><td style="text-align:center;">Kafka 負責</td><td style="text-align:center;">Kafka 負責</td></tr>
<tr style="border-bottom:1px solid #E4D8C8;"><td style="padding:0.45rem 0.9rem;color:#000;font-size:0.88rem;font-weight:600;">Read quorum</td><td style="text-align:center;color:#F26D4F;font-weight:700;">2/3</td><td style="text-align:center;color:#35738E;">1/3</td><td style="text-align:center;color:#35738E;font-weight:700;">1/2</td></tr>
<tr style="border-bottom:1px solid #E4D8C8;"><td style="padding:0.45rem 0.9rem;color:#000;font-size:0.88rem;font-weight:600;">Read 容錯</td><td style="text-align:center;">1 zone</td><td style="text-align:center;color:#35738E;font-weight:800;">2 zones</td><td style="text-align:center;">1 zone</td></tr>
<tr style="border-bottom:1px solid #E4D8C8;"><td style="padding:0.45rem 0.9rem;color:#000;font-size:0.88rem;font-weight:600;">Ingester 成本</td><td style="text-align:center;color:#F26D4F;font-weight:700;">3×</td><td style="text-align:center;">3×</td><td style="text-align:center;color:#35738E;font-weight:800;">2×</td></tr>
<tr><td style="padding:0.45rem 0.9rem;color:#000;font-size:0.88rem;font-weight:600;">額外成本</td><td style="text-align:center;opacity:0.45;">—</td><td style="text-align:center;">Kafka</td><td style="text-align:center;">Kafka</td></tr>
</tbody>
</table>

<div v-click class="flex justify-center mt-4">
  <div class="flex items-center gap-3 rounded-2xl px-6 py-3" style="background:rgba(247,168,107,0.10);border:1.5px solid rgba(247,168,107,0.40);">
    <div class="flex flex-col items-center gap-1.5">
      <div class="flex items-center gap-2">
        <mdi-trophy-outline style="font-size:1rem;color:#C97C3A;flex-shrink:0;" />
        <div style="font-size:1rem;font-weight:800;color:#C97C3A;letter-spacing:0.06em;">我們的選擇</div>
      </div>
      <div style="font-size:1.25rem;font-weight:600;color:#0E3F4E;line-height:1.5;"><strong>RF=2 + 2 zones</strong> — 把可用性從「RF 堆出來」換成「Kafka 保證 + partition 調整」</div>
    </div>
  </div>
</div>

<!--
- Classic 生產必須 RF=3 + 3 zones（因為 RF=2 是 0 容錯 — quorum 要 2/2）
- v3 改用 PartitionInstanceRing：不再用 RF，由 zone 數決定副本
- 2 zones + Ingest Storage 拿到比 classic 3 zones 還強的 read 容錯
- 真正省到 33% ingester 資源
- 這是整個 Mimir 3.0 最大的成本殺手
-->

---
layout: split
title: Mimir Query Engine · 讀端同步省下來
kicker: MQE 在 Mimir 3.0 是 default · 升級後自動拿到 · 覆蓋 100% 穩定 PromQL
ratio: "3:2"
---

::left::

<img src="/mimir3-mqe-benchmark.png" />

::right::

<div class="grid grid-cols-2 gap-3">
  <Stat value="92%" label="Less memory vs Prometheus" accent="orange" />
  <Stat value="38%" label="Faster execution" accent="blue" />
  <Stat value="3×" label="Querier peak mem ↓" accent="sky" />
  <Stat value="80%" label="Querier peak CPU ↓" accent="orange" />
</div>

<!--
補充：
- MQE 在 Mimir 3.0 是 default
- 相比舊的 Prometheus engine，streaming execution + optimization framework
- 這張 benchmark 是官方 1h range query 1000 series 的 sum() 測試
- 實際 Grafana Cloud 跑下來 querier peak memory 降 3x、peak CPU 降 80%
- 這個是「我們遷移後立刻拿到的」好處，不需要做什麼
-->

---
layout: inner
title: 遷移後 · 寫讀兩端資源同時下降
align: start
---

<div class="flex flex-col gap-2 w-full h-full min-h-0">

<div class="grid grid-cols-2 gap-2 w-full flex-1 min-h-0">
<div class="rounded-lg p-2 flex flex-col min-h-0" style="background:rgba(247,168,107,0.06);border:1px solid rgba(247,168,107,0.25);">
  <div style="font-size:0.65rem;letter-spacing:0.1em;color:#F7A86B;text-align:center;font-weight:700;margin-bottom:0.3rem;">Ingester · CPU</div>
  <img src="/mimir3-ingester-cpu.png" class="rounded flex-1 min-h-0 w-full object-contain" />
</div>
<div class="rounded-lg p-2 flex flex-col min-h-0" style="background:rgba(247,168,107,0.06);border:1px solid rgba(247,168,107,0.25);">
  <div style="font-size:0.65rem;letter-spacing:0.1em;color:#F7A86B;text-align:center;font-weight:700;margin-bottom:0.3rem;">Ingester · Memory</div>
  <img src="/mimir3-ingester-memory.png" class="rounded flex-1 min-h-0 w-full object-contain" />
</div>
<div class="rounded-lg p-2 flex flex-col min-h-0" style="background:rgba(82,150,184,0.06);border:1px solid rgba(82,150,184,0.25);">
  <div style="font-size:0.65rem;letter-spacing:0.1em;color:#5296B8;text-align:center;font-weight:700;margin-bottom:0.3rem;">Querier · CPU</div>
  <img src="/mimir3-querier-cpu.png" class="rounded flex-1 min-h-0 w-full object-contain" />
</div>
<div class="rounded-lg p-2 flex flex-col min-h-0" style="background:rgba(82,150,184,0.06);border:1px solid rgba(82,150,184,0.25);">
  <div style="font-size:0.65rem;letter-spacing:0.1em;color:#5296B8;text-align:center;font-weight:700;margin-bottom:0.3rem;">Querier · Memory</div>
  <img src="/mimir3-querier-memory.png" class="rounded flex-1 min-h-0 w-full object-contain" />
</div>
</div>

<div v-click class="flex justify-center flex-shrink-0">
  <div class="flex flex-col items-center gap-1.5 rounded-2xl px-6 py-3" style="background:rgba(247,168,107,0.10);border:1.5px solid rgba(247,168,107,0.40);width:100%;">
    <div class="flex items-center gap-2">
      <mdi-chart-line style="font-size:1.2rem;color:#C97C3A;flex-shrink:0;" />
      <div style="font-size:1rem;font-weight:800;color:#C97C3A;letter-spacing:0.06em;">寫（Ingester）+ 讀（Querier）同時兌現 · 同一生產集群 · 升級前後</div>
    </div>
    <div style="font-size:1rem;font-weight:600;color:#0E3F4E;line-height:1.5;">RF=3→2 + Ingest Storage → <strong>Ingester</strong> CPU/Mem 雙降 · MQE → <strong>Querier</strong> CPU/Mem 雙降</div>
  </div>
</div>

</div>

<!--
- 這四張是我們自己集群的真實 dashboard 截圖，不是 benchmark
- 橘色兩張：Ingester CPU / Memory — 寫路徑的紅利
  - RF 從 3 降到 2 · Ingest Storage 把副本責任交給 Kafka
  - 明顯看到升級當天一個斷崖式下降
- 青色兩張：Querier CPU / Memory — 讀路徑的紅利
  - MQE streaming execution 讓查詢不再全量載入 series
  - Peak 被壓平
- CPU / Memory 都明顯下降一個 level
- 不是 benchmark，是 production — 數字不漂亮，但真實
-->

---
layout: section-blue
chapter: "03"
parent: Thanos → Mimir 3.0
---

# Kafka 選型

<div class="mt-6 opacity-60">多了一個元件 · 我們是不是在自己給自己找死？</div>

<!--
進入 Kafka / AutoMQ 章節 — 整場演講的重頭戲
開場用這句話引出下一張
-->

---
layout: inner
align: start
clicks: 2
---

<div class="p17-wrap" :class="{ 'p17-wrap--on': $clicks >= 1 }">
  <h1 class="p17-title">等等，加 Kafka不就更複雜嗎？</h1>
  <div class="p17-quote-block" :class="{ 'p17-visible': $clicks >= 1 }">
    <div class="p17-quote-text">原本一個長期指標系統就夠複雜了，<strong>現在還要多一個 Kafka？</strong></div>
  </div>
  <div class="p17-formula-block" :class="{ 'p17-visible': $clicks >= 2 }">
    <div style="font-size:4.5rem;font-weight:900;font-family:'JetBrains Mono',monospace;color:#F7A86B;letter-spacing:-0.02em;margin-top:1.75rem;">L = λ · W</div>
    <div class="text-xs uppercase tracking-widest opacity-50" style="margin-top:0.5rem;">Little's Law · 李式定理</div>
    <div class="grid grid-cols-3 gap-5 w-full max-w-2xl mx-auto" style="margin-top:1.25rem;">
      <div class="flex flex-col items-center gap-2 rounded-2xl p-5" style="background:rgba(82,150,184,0.08);">
        <div class="text-3xl font-black font-mono" style="color:#5296B8;">L</div>
        <div class="text-sm opacity-65 leading-snug">Queue 中的<br/>平均任務數</div>
      </div>
      <div class="flex flex-col items-center gap-2 rounded-2xl p-5" style="background:rgba(247,168,107,0.10);">
        <div class="text-3xl font-black font-mono" style="color:#F7A86B;">λ</div>
        <div class="text-sm opacity-65 leading-snug">系統吞吐率<br/>(samples/s)</div>
      </div>
      <div class="flex flex-col items-center gap-2 rounded-2xl p-5" style="background:rgba(82,150,184,0.08);">
        <div class="text-3xl font-black font-mono" style="color:#5296B8;">W</div>
        <div class="text-sm opacity-65 leading-snug">每個任務的<br/>平均等待時間</div>
      </div>
    </div>
  </div>
</div>

<!--
補充：
- 我當初跟主管討論時也被問過這個問題
- 加一個元件 = 多一份複雜度，這是直覺
- 但實際上複雜度不會憑空消失，你只是選擇把它放在哪裡
- 李式定理告訴我們的是：系統吞吐的本質
-->

---
layout: inner
title: 現實中的 Kafka —— 分散式回堵噩夢
align: start
---

<div class="flex flex-col gap-4 w-full h-full min-h-0">

<div class="flex-1 min-h-0 flex items-center">
  <div class="w-full max-w-8xl mx-auto">
    <img
      src="/kafka-backpressure-flow.png"
      alt="Prometheus Kafka backpressure flow"
      class="block w-full h-auto object-contain"
      style="max-height:46vh;"
    />
  </div>
</div>

<div class="text-center text-xs opacity-70" >虛線 = 回堵方向 · 任何一環節的 W 變大都會一路反噬到最上游</div>

<div class="grid grid-cols-2 gap-3 flex-shrink-0 max-w-5xl mx-auto">
<div class="why-card why-card--ink">
  <div class="why-card__title"><mdi-alert-circle class="why-card__icon" />Kafka 不永遠低延遲</div>
  <p><strong>Rebalance</strong> · <strong>Leader 切換</strong> · <strong>Consumer lag</strong><br/>任一件事都能把 5ms 變成 5 秒</p>
</div>
<div class="why-card why-card--ink">
  <div class="why-card__title"><mdi-lightbulb-on class="why-card__icon" />我們學到的</div>
  <p>加 Kafka 不是免費的午餐<br/>你接受這個複雜度，換來上層解耦<br/><strong>選型要算清楚這筆帳</strong></p>
</div>
</div>

</div>

<!--
重要（誠實調性）：
- 這段是我想表達的核心態度：不盲目推薦
- 分享真實踩坑：有一次 Kafka consumer 變慢，根因追到 Ingester
- 但當下看到的是「Prom 噴 queue full alert」
- 這種跨元件 debug 是 Kafka 架構的固有複雜度
- 我們接受了這個，因為換來的好處夠大（下面會講）
-->

---
layout: inner
align: center
---

<div class="text-center w-full max-w-4xl mx-auto">

# 但如果只是這樣<br/><span class="text-orange-400">我們不會貿然踏上這條不歸路</span>

<div class="mt-8 text-base opacity-75 max-w-3xl mx-auto leading-relaxed">
  Kafka 是許多 on-call 工程師的<strong class="text-red-400">噩夢</strong> —<br/>
  那我們為什麼還是選它？
</div>

<div v-click class="mt-12">
  <div class="text-lg opacity-70">因為我們賭的</div>
  <div class="mt-2 text-3xl font-black">不是「今天的 Kafka」</div>
  <div class="mt-3 text-5xl font-black text-orange-400">是「明天的 Kafka」</div>
</div>

</div>

<!--
- 承接上一頁的踩坑 — rebalance / leader 切換 / consumer lag / broker 掛 / PVC 崩
- 這些我們都真的遇過、都還在踩 — 如果只是要「解耦」，其實沒必要跳進這個坑
- 我們踩下去的原因：社群的下一個十年，已經悄悄改寫了 Kafka
- object storage 是 source of truth · broker stateless · PVC 不再是命脈
- 下一頁帶大家走過這兩年的 diskless 浪潮 — KIP-1150 Diskless Wars
-->

---
layout: split
title: Kafka 的下一個十年 · Diskless Wars
ratio: "4:5"
---

::left::

<div class="flex flex-col gap-1">
<div class="flex items-center gap-3 py-1.5 pl-3" style="border-left:2px solid rgba(82,150,184,0.3);">
  <div style="font-family:monospace;font-size:1rem;width:5rem;color:#5296B8;opacity:0.65;flex-shrink:0;">Aug 2023</div>
  <div style="font-size:1rem;">WarpStream 發表 — Kafka-API on S3 首發商用化</div>
</div>
<div class="flex items-center gap-3 py-1.5 pl-3" style="border-left:2px solid rgba(82,150,184,0.3);">
  <div style="font-family:monospace;font-size:1rem;width:5rem;color:#5296B8;opacity:0.65;flex-shrink:0;">May 2024</div>
  <div style="font-size:1rem;">Confluent Freight 發表</div>
</div>
<div class="flex items-center gap-3 py-1.5 pl-3" style="border-left:2px solid rgba(82,150,184,0.3);">
  <div style="font-family:monospace;font-size:1rem;width:5rem;color:#5296B8;opacity:0.65;flex-shrink:0;">Jul 2024</div>
  <div style="font-size:1rem;"><strong>AutoMQ 1.0</strong> 發布 · S3 Direct 寫入</div>
</div>
<div class="flex items-center gap-3 py-1.5 pl-3" style="border-left:2px solid rgba(82,150,184,0.3);">
  <div style="font-family:monospace;font-size:1rem;width:5rem;color:#5296B8;opacity:0.65;flex-shrink:0;">Sep 2024</div>
  <div style="font-size:1rem;">Confluent 收購 WarpStream — $220M</div>
</div>
<div class="flex items-center gap-3 py-1.5 pl-3" style="border-left:2px solid rgba(82,150,184,0.3);">
  <div style="font-family:monospace;font-size:1rem;width:5rem;color:#5296B8;opacity:0.65;flex-shrink:0;">Apr 2025</div>
  <div style="font-size:1rem;"><strong>Aiven 提出 KIP-1150</strong> Diskless Topics</div>
</div>
<div class="flex items-center gap-3 py-1.5 pl-3" style="border-left:2px solid rgba(82,150,184,0.3);">
  <div style="font-family:monospace;font-size:1rem;width:5rem;color:#5296B8;opacity:0.65;flex-shrink:0;">Nov 2025</div>
  <div style="font-size:1rem;">Redpanda 發表 Cloud Topics</div>
</div>
<div v-click="1" class="flex items-center gap-3 mt-1 rounded-xl px-3 py-2" style="background:rgba(242,109,79,0.07);border:1.5px solid rgba(242,109,79,0.30);transition:all 0.5s ease;">
  <div style="font-family:monospace;font-size:1rem;width:5rem;color:#C0502E;flex-shrink:0;font-weight:800;">Mar 2026</div>
  <div style="font-size:1rem;font-weight:700;color:#0E3F4E;">KIP-1150 正式通過 — Apache Kafka 擁抱 diskless</div>
</div>
<div v-click="2" class="flex items-center gap-2 mt-1 rounded-xl px-3 py-2" style="background:rgba(247,168,107,0.09);border:1.5px solid rgba(247,168,107,0.35);transition:all 0.5s ease;">
  <mdi-check-circle style="font-size:1.2rem;color:#C97C3A;flex-shrink:0;" />
  <div style="font-size:1rem;font-weight:600;color:#0E3F4E;"><strong>社群共識已成形</strong><br/>stateless broker · object storage 為 source of truth</div>
</div>
</div>

::right::

<div class="flex justify-center items-start">
  <div class="rounded-lg overflow-hidden shadow-lg" style="border:1px solid rgba(14,63,78,0.12);">
    <img src="/kip1150-xiaohongshu.png" style="max-height:540px;" />
  </div>
</div>

<!--
- 左側時間軸：這兩年 Kafka 生態正在經歷一場 diskless 浪潮
  - 從 WarpStream（2023）開局，到 KIP-1150 今年 3/2 正式通過
- 右側截圖：Aiven 的 Josep / Greg 的通告 + 底下 Apache 郵件投票結果
  - 真實感很強，這不是 PR 稿，是社群裡真人真投票
  - 9 binding votes + 5 non-binding votes
- 結論：AutoMQ 不是冒險選擇，是走在共識已成方向上的最早一批
-->

---
layout: split
title: AutoMQ · 重新設計的 Kafka
ratio: "5:4"
---

::left::

<img src="/automq-architecture.png" class="w-full h-full object-contain" style="border:none;box-shadow:none;background:transparent;" />

::right::

<div class="flex flex-col gap-3">

<div class="pillar-card pillar-card--blue">
  <div class="pillar-card__title"><mdi-database-sync />Storage / Compute 分離</div>
  <div class="pillar-card__note">Broker stateless</div>
  <div class="pillar-card__body">Broker 本地不存 partition data · 全部寫 S3</div>
</div>

<div class="pillar-card pillar-card--orange">
  <div class="pillar-card__title"><mdi-content-cut />Zero Partition Replication</div>
  <div class="pillar-card__note">replication 流量歸零</div>
  <div class="pillar-card__body">S3 本身多副本 · 不用 broker 之間互相 copy</div>
</div>

<div class="pillar-card pillar-card--red">
  <div class="pillar-card__title"><mdi-swap-horizontal />100% Kafka API</div>
  <div class="pillar-card__note">切換零遷移成本</div>
  <div class="pillar-card__body">Protocol 原生支援 · 現有 Producer / Consumer 不用改</div>
</div>

</div>

<!--
- AutoMQ 的基本構想：把 Kafka 的 local disk 換成 S3 + 小 WAL
- 傳統 Kafka：PageCache + Local Disk → Consumer（Zero Copy）
- AutoMQ：Producer → WAL + Message Cache → S3；Consumer 從 S3/Cache 拉（沒有 Zero Copy 但也夠快）
- 關鍵：100% Kafka API 相容 — 我們的 Prometheus distributor / Mimir ingester 完全不用改
-->

---
layout: split
title: 跨 AZ 流量 · 傳統 Kafka 的黑洞
ratio: "3:2"
footnote: "AutoMQ 官方數據：大叢集裡 <strong style='color:#F26D4F'>跨 AZ 流量佔 Kafka 總成本的 60–70%</strong> · 這筆錢不是花在你業務上，是花在 AWS 網路上"
---

::left::

<img src="/kafka-inter-zone.png" class="w-full h-full object-contain" style="border:none;box-shadow:none;background:transparent;" />

::right::

<div class="flex flex-col gap-3">

<div class="pillar-card pillar-card--blue">
  <div class="pillar-card__title">① Producer → Broker</div>
  <div class="pillar-card__body">寫入可能 hit 到其他 AZ 的 leader</div>
</div>

<div class="pillar-card pillar-card--blue">
  <div class="pillar-card__title">② Broker ↔ Broker Replication</div>
  <div class="pillar-card__body">副本機制本質上<strong>幾乎必定跨 AZ</strong></div>
</div>

<div class="pillar-card pillar-card--blue">
  <div class="pillar-card__title">③ Consumer ← Broker</div>
  <div class="pillar-card__body">Consumer 不一定跟 leader 同 AZ</div>
</div>

</div>

<!--
- 傳統 Kafka 的三種跨 AZ 流量：
  1. Producer → Broker：client 通常不知道 leader 在哪個 AZ
  2. Broker → Broker replication：這條幾乎免不了，除非 RF=1（不能用在 prod）
  3. Broker → Consumer：consumer 也不一定跟 leader 同 AZ
- 在 AWS 上這三條 traffic 通通算 inter-AZ data transfer（每 GB 都收錢）
- 大叢集可以佔到 60-70% 總成本 — 這比 EC2 本身還貴
- 下一頁看 AutoMQ 怎麼把這筆錢歸零
-->

---
layout: split
title: AutoMQ 的解法 · Zero-Zone Router
ratio: "3:2"
---

::left::

<div class="rounded-xl overflow-hidden" style="box-shadow:0 4px 20px rgba(14,63,78,0.10);">
  <img src="/automq-zero-zone-router.png" class="w-full" style="display:block;" />
</div>

::right::

<div class="section-badge">流量路由設計</div>

<ul class="icon-list">
  <li><mdi-tune /><span>Producer 寫入<strong>本地 AZ</strong> 的 broker</span></li>
  <li><mdi-swap-horizontal /><span>Rack-aware Router 透過 <strong>S3</strong> 路由給 leader partition</span></li>
  <li><mdi-database-sync /><span>其他 AZ 從 S3 同步拿 <strong>readonly 副本</strong></span></li>
  <li><mdi-download /><span>Consumer 從<strong>本地 AZ</strong> 的 readonly replica 讀取</span></li>
</ul>

<div v-click class="quote-bar quote-bar--warn">
唯一跨 AZ 流量：<strong>broker ↔ S3</strong> · AWS 同 region S3 免費
</div>

<!--
Zero-Zone Router 分步講解：
1. Producer 在 AZ2 寫入 → 只寫 AZ2 的 broker（本地，不跨 AZ）
2. AZ2 的 Rack-aware Router 把資料透過 S3「路由」給 AZ1（leader partition 所在地）
3. AZ1 從 S3 讀取完成寫入 · 其他 AZ 也從 S3 拿 readonly 副本
4. Consumer 在 AZ2 讀取 → 只從 AZ2 的 readonly replica 讀（本地，不跨 AZ）
關鍵：
- Producer ↔ Broker / Consumer ↔ Broker 全部 in-AZ
- 唯一跨 AZ 流量：broker ↔ S3，而 AWS 同 region S3 免費
- 把傳統 Kafka 最大的帳單項目（60-70% 成本）直接砍到零
-->

---
layout: split
title: 容量與彈性 · 從「預留」到「按用量」
ratio: "5:4"
---

::left::

<div class="flex justify-center">
  <img src="/automq-elastic-capacity.png" class="rounded-lg"/>
</div>

::right::

<div class="flex flex-col gap-3">
<div class="pillar-card pillar-card--red" style="padding:1.8rem 1.5rem;">
  <div class="pillar-card__title"><mdi-alert-circle />Apache Kafka</div>
  <div class="pillar-card__note">Fixed Capacity · Wasted &gt; 50%</div>
  <div class="pillar-card__body">Local disk 必須預先配足 peak 空間 · 平均使用率低 · scaling 以「小時」計</div>
</div>
<div class="pillar-card pillar-card--blue" style="padding:1.8rem 1.5rem;">
  <div class="pillar-card__title"><mdi-chart-line />AutoMQ</div>
  <div class="pillar-card__note">Elastic Capacity · Pay-as-you-go</div>
  <div class="pillar-card__body">S3 近乎無限 · partition 搬移以「秒」計 · Broker 可用 spot · <strong>真正的 auto-scaling</strong></div>
</div>
</div>

<!--
- Apache Kafka 必須 over-provision — 因為 broker 搬資料需要幾小時
- AutoMQ 因為 partition 不綁 local disk，搬移以「秒」計
- 結果：可以真正跟著業務流量彈性 scale，不用多付 50% 浪費
- 也可以用 spot instance（因為 broker stateless，死了也沒事）
-->

---
layout: inner
title: 但延遲呢？— 整條鏈路才是重點
---

<div class="grid grid-cols-2 gap-4">

<div class="flex flex-col gap-2">
  <div class="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full" style="color:#5296B8;border:1.5px solid #5296B8;width:fit-content;">Traditional Kafka · EBS</div>
  <div class="rounded-xl p-4 text-center" style="background:rgba(82,150,184,0.1);border:1px solid rgba(82,150,184,0.3);">
    <div class="text-5xl font-black" style="color:#5296B8;">5–50<span class="text-xl">ms</span></div>
    <div style="font-size:1rem;opacity:0.65;margin-top:0.25rem;">Produce ACK P99</div>
  </div>
</div>

<div class="flex flex-col gap-2">
  <div class="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full" style="color:#C97C3A;border:1.5px solid #F7A86B;width:fit-content;">AutoMQ · S3Stream</div>
  <div class="rounded-xl p-4 text-center" style="background:rgba(247,168,107,0.1);border:1px solid rgba(247,168,107,0.35);">
    <div class="text-5xl font-black" style="color:#F7A86B;">500ms<span class="text-xl">–2s</span></div>
    <div style="font-size:1rem;opacity:0.65;margin-top:0.25rem;">Produce ACK P99</div>
  </div>
</div>

</div>

```mermaid {theme: 'dark', scale: 0.72}
flowchart LR
    P[Prometheus<br/>scrape] -->|remote_write| D[Distributor]
    D -->|produce| K[Kafka]
    K -->|consume| I[Ingester]
    I -->|可查詢| Q[Querier]
    P -.->|短期查詢直接走 Prom| Q2[Prom Query]
    style K fill:#a78bfa33,stroke:#a78bfa
    style Q2 fill:#52c41a33,stroke:#52c41a
```

<div style="font-size:1rem;text-align:center;color:rgba(14,63,78,0.60);margin-top:0.25rem;">
  scrape → distributor → kafka → ingester → 可讀 · 加上長尾抖動 · <strong>最慢可能 30s 才能查到</strong>
</div>

<div v-click class="flex justify-center">
  <div class="flex flex-col gap-1.5 rounded-2xl px-6 py-3 w-full" style="background:rgba(247,168,107,0.10);border:1.5px solid rgba(247,168,107,0.40);">
    <div class="flex items-center gap-2">
      <mdi-lightbulb-on style="font-size:1.3rem;color:#C97C3A;flex-shrink:0;" />
      <div style="font-size:0.78rem;font-weight:800;color:#C97C3A;letter-spacing:0.06em;">為什麼我們敢接受 10× 延遲</div>
    </div>
    <div style="font-size:1rem;font-weight:600;color:#0E3F4E;line-height:1.6;">Alert / HPA / KEDA <strong>繼續走 Prom Server</strong>（毫秒級）· Mimir 是「秒級」長期後端 · <strong>這是前面保留 Prom Server 的回報</strong></div>
  </div>
</div>

<!--
- 很多人第一眼看到 500ms–2s 會嚇到
- 但關鍵是整條鏈路：
  - scrape interval 本身就 15-30s
  - remote_write 本身有 batch 延遲
  - Kafka produce + consume + ingester index
  - 長尾抖動
  - 加起來 scrape 後 ~30 秒才能查到也是正常的
- 然後呼應前面「保留 Prom Server」的伏筆：
  - 短期查詢 / alert / HPA / KEDA 都走 Prom（毫秒）
  - 長期查詢走 Mimir（秒級可接受）
  - 10× 延遲的代價換來跨 AZ 流量歸零 + 運維解放 + 10× 成本結構差異
- 典型的 engineering tradeoff：知道自己在意什麼，才能做聰明的取捨
-->

---
layout: section-blue
chapter: "04"
parent: Thanos → Mimir 3.0
---

# 成本效能實戰成果

<div class="mt-6 opacity-60">數字說話，數字也認清規模差異</div>

<!--
進入成果展示段
這段要放輕鬆一點，讓聽眾有「哇」的反應
-->

---
layout: inner
title: 實測效能對比
align: start
---

<div class="flex flex-col gap-3 w-full h-full min-h-0">

<div class="flex gap-6 flex-1 min-h-0">

  <div class="flex flex-col gap-8 justify-center" style="width:38%;">
  <div class="flex flex-col gap-3">
    <div class="section-badge" style="width:fit-content;">測試設計</div>
    <ul class="why-list li-xl">
      <li><mdi-check-circle class="why-list__icon" /><span>同一 production 環境 · 相同 tenant</span></li>
      <li><mdi-check-circle class="why-list__icon" /><span><strong>8 種 query × 6 個時間範圍 = 48 組</strong></span></li>
      <li><mdi-check-circle class="why-list__icon" /><span>Cache busting 排除 cache hit 誤差</span></li>
      <li><mdi-check-circle class="why-list__icon" /><span>1h → 30d 時間範圍全覆蓋</span></li>
    </ul>
  </div>
    <div v-click class="rounded-2xl px-5 py-4" style="background:rgba(53,115,142,0.08);border:1.5px solid rgba(53,115,142,0.30);">
      <div style="font-size:0.78rem;font-weight:700;color:#35738E;letter-spacing:0.06em;margin-bottom:0.3rem;">Mimir 勝出</div>
      <div style="font-size:4rem;font-weight:900;line-height:1;letter-spacing:-0.04em;color:#35738E;">45 <span style="font-size:1.8rem;opacity:0.6;">/ 48 tests</span></div>
    </div>
  </div>

  <div v-click class="grid grid-cols-2 gap-3 flex-1 content-center">
    <Stat value="3.4×" label="平均查詢加速" accent="orange" />
    <Stat value="16.7×" label="Cross-metric Join 30d" accent="red" />
    <Stat value="8.4×" label="High-cardinality 1h" accent="sky" />
    <Stat value="6.3×" label="長期 30d 查詢" accent="blue" />
  </div>

</div>

<div v-click class="flex justify-center flex-shrink-0">
  <div class="flex flex-col gap-1.5 rounded-2xl px-6 py-3 w-full" style="background:rgba(82,150,184,0.07);border:1.5px solid rgba(82,150,184,0.30);">
    <div class="flex items-center gap-2">
      <mdi-lightbulb-on style="font-size:1.3rem;color:#2E6A87;flex-shrink:0;" />
      <div style="font-size:0.78rem;font-weight:800;color:#2E6A87;letter-spacing:0.06em;">最反直覺的發現</div>
    </div>
    <div style="font-size:1rem;font-weight:600;color:#0E3F4E;"><strong>長期查詢 Mimir 優勢反而更大</strong>（30d = 6.3×）· 顛覆了「Thanos 擅長長期」的迷思</div>
  </div>
</div>

</div>

<!--
- 48 組測試是我們自己跑的，不是 benchmark，用 production 資料
- 最有趣的發現：長期查詢 Mimir 優勢反而更大
- 因為 Mimir 的 bucket-index + MQE streaming 讓 30d 查詢的記憶體佔用平緩
- Thanos 做同樣查詢時 store gateway 會 OOM
- 完全顛覆「Thanos 擅長長期查詢」的迷思
-->

---
layout: inner
align: center
---

<div class="text-center w-full">

<h1 class="!text-8xl !mb-6" style="color:#F26D4F;letter-spacing:-0.04em;">~49% 更便宜</h1>

<div class="text-xl opacity-80 mb-8">
  3 週 AWS 帳單實測
</div>

<div class="flex items-center justify-center gap-6 text-xl opacity-90">
  <span class="font-black" style="color:#F7A86B;">3.4× 更快</span>
  <span class="opacity-40">·</span>
  <span class="font-black" style="color:#F26D4F;">~49% 更便宜</span>
  <span class="opacity-40">·</span>
  <span class="font-black" style="color:#F7A86B;">~6× 性價比</span>
</div>

<!-- <div class="mt-10 text-sm opacity-60 max-w-2xl mx-auto">
  每家環境量級不同，數字僅供參考<br/>
  我們自己的 annual saving 大約落在 <strong>幾十萬美金</strong>量級
</div> -->

</div>

<!--
- 3 週生產環境並行，AWS Cost Explorer 真實帳單
- Thanos 這邊 EC2 instance 吃掉大頭（Store Gateway 重度 compute）
- Mimir + AutoMQ：EC2 instance 省掉一大截
- Data transfer 差不多（AutoMQ 把跨 AZ 流量歸零，但多了 Kafka 本身的 produce/consume 路徑）
- 每家公司的 baseline 不同，重點不是絕對數字
- 重點是「ROI 好到讓我把遷移提案推上去時非常好講」
-->

---
layout: section-blue
chapter: "05"
parent: Thanos → Mimir 3.0
---

# 下一站 —<br/>可觀測性 2.0?

<div class="mt-6 opacity-60">PromCon 2025 帶回來的新東西</div>

<!--
進入最後一段
這段是「帶禮物回家」的段落
讓聽眾覺得「我學到新東西，還想回去研究」
-->

---
layout: inner
title: 可觀測性 2.0 的訊號
kicker: "logs / traces / metrics 全部進 DataLake · 統一查詢引擎交叉分析"
align: start
---

<div class="flex flex-col gap-3 w-full h-full min-h-0">

<Callout type="info" title="技術主張 · Charity Majors (Honeycomb CTO)">
<strong>單一事實來源 = Wide Events</strong>（富語境的結構化事件） · metrics / logs / traces 全部從同一份 event 推導出來
</Callout>

<div class="hl-grid hl-grid--2 min-h-0">

<div class="hl-card hl-card--pos" >
  <div class="hl-card__num">01</div>
  <div class="hl-card__kicker">真正在動的勢頭</div>
  <ul class="why-list">
    <li style="margin-left:0.25rem;"><mdi-chart-line class="why-list__icon" /><span><strong>Honeycomb</strong> — wide events 先驅，商用化 Scuba 理念</span></li>
    <li style="margin-left:0.25rem;"><mdi-chart-line class="why-list__icon" /><span><strong>ClickHouse / ClickStack</strong> — OTel-native，2025 上 Cloud</span></li>
    <li style="margin-left:0.25rem;"><mdi-chart-line class="why-list__icon" /><span><strong>GreptimeDB · Pinot · DuckDB · InfluxDB IOx</strong> <br/> — OLAP 底座新玩家</span></li>
    <li style="margin-left:0.25rem;"><mdi-chart-line class="why-list__icon" /><span><strong>Iceberg / Delta Lake</strong> — open lake format 成匯流點</span></li>
  </ul>
</div>

<div class="hl-card hl-card--neg">
  <div class="hl-card__num">02</div>
  <div class="hl-card__kicker">為什麼 Prom 生態沒被取代</div>
  <ul class="why-list">
    <li style="margin-left:0.25rem;"><mdi-alert-circle class="why-list__icon" /><span>PromQL + alerts + HPA / KEDA <strong>整個生態綁得太深</strong></span></li>
    <li style="margin-left:0.25rem;"><mdi-alert-circle class="why-list__icon" /><span>SQL ↔ PromQL 心智差異 · 換 = <strong>所有 runbook 重寫</strong></span></li>
    <li style="margin-left:0.25rem;"><mdi-alert-circle class="why-list__icon" /><span>OTel semantic conventions 仍在 stabilize</span></li>
    <li style="margin-left:0.25rem;"><mdi-alert-circle class="why-list__icon" /><span>大部分團隊<strong>先解 cost，再談 paradigm</strong></span></li>
  </ul>
</div>

</div>

<div v-click class="flex justify-center flex-shrink-0">
  <div class="flex flex-col items-center gap-1.5 rounded-2xl px-6 py-3 w-full" style="background:rgba(247,168,107,0.10);border:1.5px solid rgba(247,168,107,0.40);">
    <div class="flex items-center gap-2">
      <mdi-compass-outline style="font-size:1.3rem;color:#C97C3A;flex-shrink:0;" />
      <div style="font-size:1rem;font-weight:800;color:#C97C3A;letter-spacing:0.06em;">結論</div>
    </div>
    <div style="font-size:1rem;font-weight:600;color:#0E3F4E;">Prom 生態 <strong>內部</strong> 也在吸收 wide-event / columnar 的核心價值 </div>
  </div>
</div>

</div>

<!--
- 可觀測性 2.0 不是我憑印象寫的，是個有明確主張、有來源、有社群動能的技術路線
- 術語來自 Charity Majors（Honeycomb CTO）· 原型是 Meta Scuba（VLDB 2013）
- 核心主張：wide events 是唯一事實來源，metrics / logs / traces 都從它派生
- 勢頭側：
  - Honeycomb 是先驅
  - ClickHouse 是商用化主力（ClickStack 2025、自家跑到 100PB 級）
  - GreptimeDB / Pinot / DuckDB / InfluxDB IOx 一整批 OLAP 底座新玩家
  - Iceberg / Delta Lake 讓 wide events 可以和資料湖匯流
- 阻力側：
  - Prom 生態不只是 query — 是 dashboards / alerts / HPA / KEDA 整套
  - 換成本太高，大部分團隊先解成本問題
  - OTel 語意還沒穩
- 結論：Prom 生態不是被外部吃掉，是**自己吸收** columnar / wide event 的好處 → Parquet Gateway
- 參考：charity.wtf · honeycomb.io/blog · ClickHouse engineering blog
-->

---
layout: image-callout-split
title: PromCon 2025 · Parquet Gateway
align: start
ratioLeft: 5
ratioRight: 4
stackV: top
---

<div class="flex flex-col gap-1 rounded-2xl px-6 py-3" style="background:rgba(82,150,184,0.07);border:1.5px solid rgba(82,150,184,0.30);">
  <div class="flex items-center gap-2">
    <mdi-account-group style="font-size:1.3rem;color:#2E6A87;flex-shrink:0;" />
    <div style="font-size:1rem;font-weight:800;color:#2E6A87;letter-spacing:0.06em;">三大社群聯合發聲</div>
  </div>
  <div style="font-size:1rem;font-weight:600;color:#0E3F4E;"><strong>Cortex · Thanos · Mimir</strong> 核心 maintainer <strong>首次</strong>同台 — 宣告下一代 Prometheus 長期儲存共同方向</div>
</div>

::left::

<img class="pg-parquet__img" src="/parquet-gateway-speakers.png" alt="" />

<div class="text-xs text-center" style="color:#6BAEBE">Grafana · Cloudflare · AWS 同台</div>

::right::

<div class="pg-artifact">
  <div class="pg-artifact__kicker font-mono">prometheus-community / parquet-common</div>
  <div class="pg-artifact__title-badge">共同 Artifact</div>
  <ul class="icon-list li-lg pg-artifact__list">
    <li><mdi-check-decagram /><span>Passes <strong>100%</strong> PromQL acceptance tests ✅</span></li>
    <li><mdi-database-search /><span>Built-in Queryable implementation</span></li>
    <li><mdi-swap-horizontal-variant /><span>TSDB block → Parquet schema converter</span></li>
  </ul>
</div>

::after::

<div v-click class="pg-parquet-stats grid grid-cols-4 gap-1.5 w-full max-w-6xl mx-auto">
  <Stat value="83.6%" label="Faster queries" accent="orange" />
  <Stat value="89.3%" label="Less bucket GET-range" accent="blue" />
  <Stat value="72.4%" label="Less memory" accent="sky" />
  <Stat value="41.6%" label="Fewer allocations" accent="ink" />
</div>

<!--
- 三家同台本身就是 message：Cortex / Thanos / Mimir 過去是競爭關係，現在合流推 Parquet Gateway
- 源頭：Shopify Filip Petkovski 的 Thanos Parquet PoC → Cloudflare parquet-tsdb-poc → 匯流到 prometheus-community/parquet-common 共享 library
- 100% PromQL acceptance tests — 不是新語法，是既有 PromQL 原汁原味
- Parquet Common 實測四格數字已併入本頁；下一張接 banner 敘事
-->



---
layout: inner
title: 為什麼 TSDB 不適合 Object Storage?
align: start
---

<div class="flex flex-col gap-8 w-full h-full min-h-0 mt-10">

<div class="grid grid-cols-3 gap-3 flex-shrink-0">

<div class="pillar-card pillar-card--blue">
  <div class="pillar-card__title"><mdi-flash />I/O 經濟學</div>
  <div class="pillar-card__body">SSD random read <code>~100μs</code><br/>S3 random read <code>~10–50ms</code><br/><strong>差異 100–500×</strong></div>
</div>

<div class="pillar-card pillar-card--red">
  <div class="pillar-card__title"><mdi-alert-octagon />TSDB on S3</div>
  <div class="pillar-card__note">100+ random GETs</div>
  <div class="pillar-card__body">每個 GET 都是 HTTP round-trip</div>
</div>

<div class="pillar-card pillar-card--blue">
  <div class="pillar-card__title"><mdi-check-circle />Parquet on S3</div>
  <div class="pillar-card__note">3–4 sequential reads</div>
  <div class="pillar-card__body">Row-group index + columnar skip</div>
</div>

</div>

<div v-click class="grid grid-cols-2 gap-3 flex-shrink-0">

<div class="why-card why-card--ink" style="padding:0.75rem 1rem;">
  <div class="why-card__title"><mdi-alert-circle class="why-card__icon" />TSDB 的結構性不對</div>
  <ul class="why-list" style="gap:0.2rem;">
    <li><mdi-chevron-right class="why-list__icon" /><span>S3 本質：<strong>高 TTFB + 高 throughput</strong>，怕小塊隨讀</span></li>
    <li><mdi-chevron-right class="why-list__icon" /><span>TSDB 強制<strong>按 timeseries sequential materialize</strong></span></li>
    <li><mdi-chevron-right class="why-list__icon" /><span>退化成<strong>大量小 random reads</strong></span></li>
    <li><mdi-chevron-right class="why-list__icon" /><span>Store Gateway 被迫 stateful 攤平 lookup</span></li>
  </ul>
</div>

<div class="why-card why-card--ink" style="padding:0.75rem 1rem;">
  <div class="why-card__title"><mdi-alert-circle class="why-card__icon" />Store Gateway 的連鎖代價</div>
  <ul class="why-list" style="gap:0.2rem;">
    <li><mdi-chevron-right class="why-list__icon" /><span>昂貴的本地 disk（index header / cache）</span></li>
    <li><mdi-chevron-right class="why-list__icon" /><span>Sync 時間長（restart / scale 都要等）</span></li>
    <li><mdi-chevron-right class="why-list__icon" /><span>可用性風險（disk 壞 = 查詢掛）</span></li>
    <li><mdi-chevron-right class="why-list__icon" /><span>三家（Cortex / Thanos / Mimir）同樣的痛</span></li>
  </ul>
</div>

</div>

<div v-click class="flex justify-center flex-shrink-0">
  <div class="flex flex-col items-center gap-1.5 rounded-2xl px-6 py-3 w-full" style="background:rgba(247,168,107,0.10);border:1.5px solid rgba(247,168,107,0.40);">
    <div class="flex items-center gap-2">
      <mdi-lightbulb-on style="font-size:1.3rem;color:#C97C3A;flex-shrink:0;" />
      <div style="font-size:1rem;font-weight:800;color:#C97C3A;letter-spacing:0.06em;">Request 數量才是成本，不是 bytes 數量</div>
    </div>
    <div style="font-size:1rem;font-weight:600;color:#0E3F4E;">Parquet + 無狀態 querier → Store Gateway 的四項代價一次解掉</div>
  </div>
</div>

</div>

<!--
First-principles + 三家共痛：
- S3 的 I/O 經濟學：TTFB 高（~ms 級）、throughput 高；天生適合順讀大塊、怕小塊隨讀
- TSDB 為本地 SSD 設計，random read 便宜；搬到 S3 就變每次 HTTP round-trip
- 一個典型 PromQL 查詢在 TSDB 可能要 100+ random GETs；同樣查詢在 Parquet 只要 3-4 次 sequential
- TSDB 資料雖然「有序」，但序是對 SSD random 友善，不是對 S3 sequential 友善
- 結果：Store Gateway 被迫扛一堆 state（disk cache / index header）來攤平 lookup → 昂貴 · 慢 · 脆弱 · 過度配置
- 這三個問題在 Cortex / Thanos / Mimir 身上**一模一樣**，所以三家才會坐下來聯合推 Parquet Gateway
- Parquet 格式自帶 row-group index + columnar skip → querier 可以 stateless 直讀 S3
- Michael Hoffmann 在 PromCon 把這段講得很清楚：「gateways have to be stateful to amortize some lookups」— 這不是 bug，是 TSDB 格式搬錯家的結果
-->

---
layout: inner
align: center
class: end-dark
---

<div class="end-page w-full flex flex-col items-center gap-8">

<div class="text-center">
  <h1 class="!text-7xl !font-black !mb-3" style="letter-spacing:-0.04em;color:#F5F0EB;">Thank you</h1>
  <div class="text-lg font-mono tracking-wide" style="color:rgba(245,240,235,0.72);">
    Thanos → Mimir 3.0 → AutoMQ → <span class="font-bold" style="color:#F7A86B;">Parquet Gateway</span>
  </div>
</div>

<div class="hl-grid hl-grid--3 w-full max-w-5xl">

<div class="hl-card">
  <div class="hl-card__num">01</div>
  <div class="hl-card__kicker">選型</div>
  <div class="hl-card__title">理解瓶頸</div>
  <div class="hl-card__sub">理解瓶頸在哪裡<br/>比追新技術更重要</div>
</div>

<div class="hl-card">
  <div class="hl-card__num">02</div>
  <div class="hl-card__kicker">架構</div>
  <div class="hl-card__title">Stateless First</div>
  <div class="hl-card__sub">Stateless 是<br/>運維自由的基礎</div>
</div>

<div class="hl-card hl-card--neg">
  <div class="hl-card__num">03</div>
  <div class="hl-card__kicker">心態</div>
  <div class="hl-card__title">Time-Sensitive</div>
  <div class="hl-card__sub">今天的最優解<br/>可能是明天的 legacy</div>
</div>

</div>

<div class="hl-banner w-full max-w-4xl flex items-center justify-center">
  <mdi-compass-outline class="hl-banner__icon" />
  <div>
    技術選型永遠是 <strong>time-sensitive</strong> — 保持好奇、保持懷疑、保持實驗
  </div>
</div>

<div class="end-page__contact">
  <mdi-email-outline />
  <span>Mike Hsu</span>
  <span class="end-page__dot">·</span>
  <code>mike.hsu@opennet.tw</code>
</div>

</div>

<!--
結語：
- 三個 takeaway 是整場演講的精華
- "time-sensitive selection" 這個 takeaway 很重要
- 我們 2024-2025 年選 Mimir 是對的，但 2027 年的最優解可能是 Parquet-based 的什麼
- 保持學習、保持懷疑、保持實驗
- QA 時間
-->
