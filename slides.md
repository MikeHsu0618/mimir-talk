---
theme: default
title: 從 Thanos 到 Mimir 3.0 — 我們如何把可觀測性後端玩到極致
info: |
  ## 從 Thanos 到 Mimir 3.0
  遷移實戰、架構決策、AutoMQ 選型、以及 Parquet Gateway 的未來展望。
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
  sans: 'Inter'
  mono: 'JetBrains Mono'
  provider: google
download: false
exportFilename: mimir-talk
seoMeta:
  ogTitle: 從 Thanos 到 Mimir 3.0
  ogDescription: 可觀測性後端遷移實戰分享
defaults:
  transition: fade
layout: cover-template
---

# 從 Thanos<br/>到 Mimir 3.0

## 我們如何把可觀測性後端玩到極致

<div class="mt-10 flex gap-2 items-center tracking-wider" style="color:#5296B8;font-size:1.15rem;font-weight:500;">
  <span>Mike Hsu</span>
</div>

<div class="abs-br m-8 flex gap-2">
  <span class="tag">40 min</span>
  <span class="tag new">Mimir 3.0</span>
  <span class="tag new">AutoMQ</span>
</div>

<!--
開場建議（自由發揮）：
- 自我介紹 + 今天 40 分鐘要帶大家走的路
- 這場演講會分享我們從 Thanos 遷移到 Mimir 的真實歷程
- 包含選型思考、踩坑、真實成本數字
- 最後會帶大家看一下長期指標後端的未來方向（Parquet Gateway）
-->

---
layout: quote
---

# AI 時代下<br/>可觀測性基礎設施的<br/><span v-click class="accent">全新挑戰</span>

<!--
切入動機（用自己的口吻補充）：
- 以前 metrics 是給 SRE 早上喝咖啡時看 dashboard 用的
- 現在組織裡越來越多人建立自己的 agent — SRE agent、DB agent、service agent
- 一個人消化資訊的能力有限，AI agent 可以一秒內消化大量資料
- 我們原本的 metrics 基礎設施 (Thanos) 每天被這些 agent 嚴峻考驗
- 這就是為什麼我們要認真重新審視整個長期指標後端
-->

---
layout: inner
title: 我們面對的量級
kicker: Sportybet 生產環境實錄
footnote: 橫跨多個 Kubernetes 集群 · 這個規模讓我們踩到了所有 Thanos 會踩的坑
---

<div class="grid grid-cols-2 gap-5 w-full max-w-4xl mx-auto">
  <Stat value="17+" label="Prometheus Clusters" />
  <Stat value="~40M" label="Active Series" accent="sky" />
  <Stat value="~1.2M" label="Samples / sec" accent="blue" />
  <Stat value="2 年" label="Thanos 服役時間" accent="red" />
</div>

<!--
補充（自由發揮）：
- 簡短介紹 Sportybet 的業務規模
- 當初選 Thanos 是 2023 年最成熟的開源方案
- 這個規模讓我們踩到了所有 Thanos 會踩的坑
- 數字可根據公開允許程度調整
-->

---
layout: section-blue
chapter: "01"
parent: Thanos → Mimir 3.0
---

# 長期指標後端<br/>架構介紹

<div class="mt-6 opacity-60">先從兩種主流整合模式切入</div>

<!--
進入第一大段：架構介紹
不要花太多時間科普，我們團隊內部都熟悉 Prometheus 生態
這段的目的是讓聽眾跟著我的思路建立對比架構
-->

---
layout: inner
title: 為什麼需要長期指標後端？
---

<div class="w-full flex flex-col gap-6">

<div class="grid grid-cols-2 gap-6 items-stretch">

<div class="why-card why-card--red">
  <div class="why-card__head">
    <mdi-alert-circle class="why-card__icon" />
    <div>
      <div class="why-card__kicker">問題</div>
      <div class="why-card__title">Prometheus 本身的限制</div>
    </div>
  </div>
  <ul class="why-list">
    <li><mdi-clock-alert-outline class="why-list__icon" /><span>預設本地保留 <strong>15 天</strong></span></li>
    <li><mdi-database-off-outline class="why-list__icon" /><span>單機儲存、單點失敗</span></li>
    <li><mdi-magnify-close class="why-list__icon" /><span>無法跨集群統一查詢</span></li>
  </ul>
</div>

<div class="why-card why-card--blue">
  <div class="why-card__head">
    <mdi-lightbulb-on-outline class="why-card__icon" />
    <div>
      <div class="why-card__kicker">需求</div>
      <div class="why-card__title">工程師 & Agent 真實使用場景</div>
    </div>
  </div>
  <ul class="why-list">
    <li><mdi-history class="why-list__icon" /><span>上個月的 baseline 是什麼？</span></li>
    <li><mdi-chart-timeline-variant class="why-list__icon" /><span>黑五 vs 平日負載對比</span></li>
    <li><mdi-trophy-outline class="why-list__icon" /><span>SLO 的年度達成率</span></li>
    <li><mdi-robot-outline class="why-list__icon" /><span>AI agents 的大量歷史回溯</span></li>
  </ul>
</div>

</div>

<div v-click class="why-conclusion">
  <span class="why-conclusion__label">需要一個</span>
  <div class="why-conclusion__pills">
    <span>高吞吐</span>
    <span>低延遲</span>
    <span>便宜</span>
  </div>
  <span class="why-conclusion__label">的後端</span>
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
ratio: "1:1"
footnote: "我們原本用的是 <strong style='color:#F26D4F'>Sidecar Mode</strong> — 這是個很天才的設計"
---

::left::

<h3 class="text-center" style="color:#F26D4F">Sidecar Mode</h3>

```mermaid {theme: 'dark', scale: 0.7}
flowchart TB
    subgraph Pod["Prometheus Pod"]
      direction LR
      P1[Prometheus]
      SC[Thanos<br/>Sidecar]
    end
    P1 -.-|讀 block| SC
    SC ==>|upload| S3[(S3)]
    style SC fill:#f4680033,stroke:#f46800
```

<p class="text-center text-sm opacity-70">Sidecar 寄生於 Prom Pod · 直接上傳 TSDB block</p>

::right::

<h3 class="text-center" style="color:#5296B8">Remote-Write Mode</h3>

```mermaid {theme: 'dark', scale: 0.7}
flowchart TB
    P2[Prometheus] ==>|remote_write<br/>protobuf| B[Long-term<br/>Backend]
    B ==>|壓縮 + index| S3[(S3)]
    style B fill:#42a5f533,stroke:#42a5f5
```

<p class="text-center text-sm opacity-70">Prom push 給後端 · 後端負責壓縮與 index</p>

<!--
補充：
- Sidecar 是 Thanos 的標誌性設計，跟 Cortex/Mimir 的 remote_write 哲學不同
- 兩者各有優缺點，先看 Sidecar 的妙處
-->

---
layout: split
title: Sidecar Mode 的巧妙之處
ratio: "3:2"
---

::left::

```mermaid {theme: 'dark', scale: 0.85}
flowchart LR
    subgraph Prom["Prometheus 記憶體"]
      direction TB
      TSDB[[in-memory TSDB]]
    end
    TSDB ==>|每 2h 壓縮| B[TSDB Block]
    B --> LD[(Local Disk)]
    B -.->|Sidecar<br/>原封不動 upload| S3[(S3)]
    style B fill:#f4680033,stroke:#f46800,stroke-width:2px
```

::right::

<Callout type="win" title="關鍵洞察">
<strong>S3 上的 block 和本地 disk 完全一樣</strong><br/>
Sidecar 不做任何運算
</Callout>

<Callout v-click type="info" title="對比 Remote-write">
Backend 要解 protobuf → 重新壓縮 → 建 index<br/>
相當於把運算做了兩次
</Callout>

<!--
補充（重要）：
- 這張是為了鋪陳「Sidecar 不是笨設計，它有它的巧妙」
- 這樣接下來的痛點討論才誠實
- 讓聽眾知道我們不是盲目換掉 Sidecar，是因為遇到了 Sidecar 架構的結構性問題
-->

---
layout: split
title: "痛點 ① — 短期查詢放大 Prometheus 垂直瓶頸"
ratio: "3:2"
---

::left::

```mermaid {theme: 'dark', scale: 0.75}
flowchart LR
    G[Grafana<br/>Dashboard] ==>|query| TQ[Thanos<br/>Querier]
    TQ ==>|短期資料| SC[Sidecar]
    SC -.-|同 Pod| P[💥 Prometheus]
    TQ -->|長期資料| SG[Store<br/>Gateway]
    SG --> S3[(S3)]
    style P fill:#f5222d55,stroke:#f5222d,stroke-width:3px,color:#fff
    style SC fill:#f4680033,stroke:#f46800
```

<p class="text-center text-sm opacity-70">短期查詢壓力<strong class="text-red-400">全部打回 Prometheus</strong></p>

::right::

<div v-click class="text-center">
  <div class="rounded-2xl p-6 bg-red-500/10 border-2 border-red-400/50">
    <div class="text-xs uppercase tracking-widest opacity-60 mb-2">Our Production</div>
    <div class="text-7xl font-black text-red-400">512</div>
    <div class="text-lg mt-1 opacity-90">GiB / Pod</div>
    <div class="text-xs mt-3 opacity-60">Prom + Sidecar 垂直到極限</div>
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
layout: split
title: "痛點 ② — 長期查詢 Store Gateway 掙扎"
ratio: "3:2"
---

::left::

```mermaid {theme: 'dark', scale: 0.7}
flowchart TB
    Q[Thanos Querier]
    Q ==> SG1[Store GW-1]
    Q ==> SG2[Store GW-2]
    Q ==> SG3[Store GW-3]
    Q ==> SGN[Store GW-N]
    SG1 -->|全量<br/>bucket scan| S3[(S3<br/>所有 tenant 的 blocks)]
    SG2 --> S3
    SG3 --> S3
    SGN --> S3
    style Q fill:#f4680033,stroke:#f46800
    style S3 fill:#f5222d22,stroke:#f5222d
```

::right::

<h3 style="color:#5296B8">結構性問題</h3>

<ul class="icon-list">
<li v-click><mdi-magnify /> Bucket scan 是 <code>O(all_blocks)</code></li>
<li v-click><mdi-download /> Index header 先下載才能查</li>
<li v-click><mdi-content-cut /> Sharding <strong>靜態</strong>（硬切 relabel）</li>
<li v-click><mdi-tune /> Cache 參數多 · 難調教</li>
</ul>

<div v-click class="mt-2 text-sm" style="color:#35738E;">
→ Mimir 用 per-tenant <strong style="color:#F7A86B">Bucket Index</strong> + 動態 sharding 解決
</div>

<!--
補充：
- 這段不要深講 11 維度的比較，聽眾會消化不下
- 重點讓聽眾感受：Mimir Store-Gateway 是為大規模多租戶設計的，Thanos 是從 Prometheus 長出來的
- 兩者的設計前提不同，不是誰對誰錯
-->

---
layout: inner
title: 我們考慮的三條路
---

<div class="w-full flex flex-col gap-5">

<div class="path-grid">

<div class="path-card" :class="{ 'is-chosen': $clicks >= 1 }">
  <div class="path-card__ribbon" v-click="1">選這條</div>
  <div class="path-card__num">01</div>
  <div class="path-card__title">保留 Prometheus Server<br/>+ remote_write 到 Mimir</div>
  <div class="path-card__desc">省掉 Sidecar，Prom Server 繼續扮演 alert / HPA / KEDA 的可靠來源</div>
  <div class="path-card__foot" v-click="1">
    <mdi-check-circle /> 風險最低、收益最大
  </div>
</div>

<div class="path-card" :class="{ 'is-rejected': $clicks === 1 || $clicks >= 3, 'is-danger': $clicks === 2 }">
  <div class="path-card__ribbon path-card__ribbon--warn" v-click="1">太激進</div>
  <div class="path-card__num">02</div>
  <div class="path-card__title">拔掉 Prom Server<br/>改用 Prometheus Agent</div>
  <div class="path-card__desc">所有 query 指向 Mimir<br/>對可靠性要求極嚴苛</div>
  <div class="path-card__foot" v-click="1">
    <mdi-alert-octagon /> HPA/KEDA 靠 metrics 作決策 · 不穩 = 業務直接掛掉
  </div>
</div>

<div class="path-card" :class="{ 'is-rejected': $clicks >= 1 }">
  <div class="path-card__ribbon path-card__ribbon--warn" v-click="1">治標不治本</div>
  <div class="path-card__num">03</div>
  <div class="path-card__title">繼續用 Thanos<br/>+ 補強現有架構</div>
  <div class="path-card__desc">短期緩解結構性問題<br/>但遲早還是要還</div>
  <div class="path-card__foot" v-click="1">
    <mdi-clock-outline /> 只是推延，不是解決
  </div>
</div>

</div>

<div v-click="3" class="path-conclusion">
  <mdi-lightbulb-on class="path-conclusion__icon" />
  <div>
    選 ① 的關鍵：Prom Server <strong style="color:#F26D4F">單純穩定</strong> — 是 alert / autoscaling 的最後防線
  </div>
</div>

</div>

<!--
補充（重要）：
- 這張展示我們的選型不是拍腦袋決定
- 特別強調 ②（Prom Agent）的風險：HPA/KEDA 依賴 metrics 作決策，如果 metrics backend 不穩，business 會受直接影響
- 所以保留 Prom Server 是一個「保險」決策 — 未來想切 Prom Agent，這條路還能走
-->

---
layout: section-blue
chapter: "02"
parent: Thanos → Mimir 3.0
---

# Mimir 3.0 架構

<div class="mt-6 opacity-60">Grafana Labs 的新答案</div>

<!--
進入 Mimir 3.0 介紹段
先給大畫面 (官方圖)，再拆解
-->

---
layout: image-caption
title: Mimir 3.0 的三大賣點
image: /mimir3-3benefits.png
caption: "<strong style='color:#F7A86B'>Ingest Storage</strong> · <strong style='color:#F7A86B'>Mimir Query Engine</strong> · 全新設計的架構"
---

<!--
補充：
- 這是 Grafana Labs 官方簡報的一張
- 三個關鍵字：Reliability / Performance / Cost
- 接下來我會拆這兩個支柱講
-->

---
layout: image-side
title: Ingest Storage — Kafka 化的寫入路徑
image: /mimir3-ingest-storage.png
---

::notes::

<Callout type="info" title="Distributors">
無狀態，專注寫入接收與 sharding
</Callout>

<Callout type="info" title="Kafka">
作為寫入的 durable buffer
</Callout>

<Callout type="info" title="Ingester">
變成 Kafka consumer<br/><strong>從 offset 重建狀態</strong>
</Callout>

<!--
補充：
- 這是 Mimir 3.0 架構的核心改變
- 傳統 Mimir 2.x 是 Distributor 直接 push 到 Ingester (gRPC)，Ingester 有狀態 (in-memory TSDB)
- 現在 Distributor 只需要 produce 到 Kafka，Ingester 變成 consumer
- Ingester 重啟只要從 Kafka offset 追回，不怕 gap
- 這個設計的核心：Ingester + Partition 綁定，每個 partition 都是一份完整的資料
-->

---
layout: image-side
title: Write/Read Path 完全解耦
image: /mimir3-decouple.png
---

::notes::

<Callout type="info" title="Write Path">
只到 Kafka 就結束<br/>不會被 query 端牽動
</Callout>

<Callout type="info" title="Read Path">
獨立服務熱查詢<br/>爆炸也不會拖垮寫入
</Callout>

<Callout type="win" title="設計哲學">
<strong>讀取端掛了，寫入端依然健康</strong><br/>query 端問題不再變成寫入事件
</Callout>

<!--
補充：
- 這張圖視覺效果很強：Write ✅ HEALTHY / Read ✗ UNHEALTHY
- 傳統 Mimir 2.x：Ingester 同時服務寫入和讀取，heavy query 會打爆 Ingester
- 現在：Write path 只到 Kafka 就結束了
- 這對運維的意義：query 端的問題不會變成寫入事件
-->

---
layout: split
title: Mimir Query Engine (MQE) 效益
kicker: 1h range query · 1000 series · sum() benchmark
ratio: "3:2"
---

::left::

<img src="/mimir3-mqe-benchmark.png" />

::right::

<Stat value="92%" label="Less memory vs Prometheus" accent="orange" />
<Stat value="38%" label="Faster execution" accent="blue" />

<div v-click class="text-sm leading-relaxed mt-2" style="color:#35738E;">
Grafana Cloud 實測：querier peak memory 降 <strong style="color:#F7A86B">3×</strong>、peak CPU 降 <strong style="color:#F7A86B">80%</strong> — 遷移完即送。
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
layout: section-blue
chapter: "03"
parent: Thanos → Mimir 3.0
---

# Kafka 選型 — AutoMQ

<div class="mt-6 opacity-60">多一個元件，是不是要把自己搞死？</div>

<!--
進入 Kafka / AutoMQ 章節 — 整場演講的重頭戲
開場用這句話引出下一張
-->

---
layout: inner
title: "等等，加 Kafka 不就更複雜嗎？"
align: center
---

<div class="text-center w-full">
  <div class="text-xl opacity-80 mb-6">很多人的第一反應：</div>

  <div v-click class="inline-block rounded-xl p-6 bg-white/50 border border-cyan-200 text-2xl italic mb-12" style="color:#0E3F4E;">
    「原本一個長期指標系統就夠複雜了，<br/>現在還要加 Kafka？」
  </div>

  <div v-click>
    <div class="text-base opacity-70 mb-2">答案要從這個定理說起</div>
    <div class="text-6xl font-black font-mono" style="color:#F7A86B;">L = λ · W</div>
    <div class="text-sm opacity-60 mt-2">Little's Law · 李式定理</div>
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
layout: split
title: 雖然可靠——但真實經驗是...
ratio: "3:2"
footnote: "虛線 = 回堵方向 · 任何一環節的 W 變大都會一路反噬到最上游"
---

::left::

```mermaid {theme: 'dark', scale: 0.82}
flowchart LR
    P[Prometheus<br/>λ 持續產生] ==>|remote_write| D[Distributor]
    D ==>|produce| K[Kafka]
    K ==>|consume| I[Ingester<br/>⚠️ W 變大]
    I -.->|L 堆積| K
    K -.->|produce timeout| D
    D -.->|queue full| P
    P ==>|🔔| A[On-call<br/>Alert 暴擊]
    style I fill:#f5222d55,stroke:#f5222d,stroke-width:2px,color:#fff
    style A fill:#ff9b4455,stroke:#ff9b44,stroke-width:2px,color:#fff
    style K fill:#a78bfa33,stroke:#a78bfa
```

::right::

<Callout type="warn" title="真實踩坑">
Kafka consumer 慢（根因其實在下游 Ingester）→ Kafka 堆積 → Distributor produce timeout → Prom queue full → 全環境噴 alert
</Callout>

<Callout type="info" title="學到的事">
加 Kafka 不是免費的午餐<br/><strong>你接受了這個複雜度</strong>，換來上層的解耦<br/>所以選型要算清楚這筆帳
</Callout>

<!--
重要（誠實調性）：
- 這段是我想表達的核心態度：不盲目推薦
- 分享真實踩坑：有一次 Kafka consumer 變慢，根因追到 Ingester
- 但當下看到的是「Prom 噴 queue full alert」
- 這種跨元件 debug 是 Kafka 架構的固有複雜度
- 我們接受了這個，因為換來的好處夠大（下面會講）
-->

---
layout: image-side
title: Kafka 的下一個十年
image: /kip1150-xiaohongshu.png
---

::notes::

<Callout type="info" title="KIP-1150 Diskless Topics">
2025/4 提出<br/><strong>2026/3/2 正式通過</strong>
</Callout>

<Callout type="info" title="社群背書">
9 binding + 5 non-binding votes<br/>Confluent · IBM · Aiven · Red Hat
</Callout>

<Callout type="win" title="共識方向">
Broker 變 stateless · state 下放 <strong>object storage</strong><br/><strong>aiven/inkless</strong> 已有 fork 實作
</Callout>

<!--
補充：
- 這張配上小紅書截圖，非常有「真實截圖感」
- 這是 Kafka 社群的重要時刻：連 Apache 官方都承認要往 stateless 走
- AutoMQ 不是一個冒險的選擇，是走在社群共識的前面
- 小紅書那張是 Aiven 的 Josep 和 Greg（Diskless 主力推手）的消息
-->

---
layout: inner
title: 傳統 Kafka 的三大痛點
footnote: "重度使用過 Kafka 的朋友會秒懂 — 這三個是 Kafka 帳單上的主要項目"
---

<div class="pain-grid">

<div class="pain-card">
  <div class="pain-card__num">01</div>
  <div class="pain-card__kicker">維運</div>
  <h3 class="pain-card__title">Broker 是有狀態的</h3>
  <div class="pain-card__body">
    Partition data 存在本地磁碟<br/>
    重啟 / 擴縮 / 修復都要搬資料
  </div>
</div>

<div class="pain-card">
  <div class="pain-card__num">02</div>
  <div class="pain-card__kicker">水平擴展</div>
  <h3 class="pain-card__title">Rebalance storm</h3>
  <div class="pain-card__body">
    加 broker / 縮 broker<br/>
    都會觸發大量 partition 遷移
  </div>
</div>

<div class="pain-card">
  <div class="pain-card__num">03</div>
  <div class="pain-card__kicker">跨區流量</div>
  <h3 class="pain-card__title">大多數成本來源</h3>
  <div class="pain-card__body">
    Replication + producer/consumer<br/>
    <strong>跨 AZ 流量費是帳單主角</strong>
  </div>
</div>

</div>

<!--
補充（誠實聊成本）：
- 第 ③ 項跨區流量通常被低估
- 我們 AWS 帳單上，Kafka 的 cross-AZ data transfer 有時比 EC2 還貴
- 原因：producer-broker / broker-broker replication / broker-consumer 都可能跨 AZ
- 這就是 AutoMQ 最能打的地方
-->

---
layout: image-caption
title: AutoMQ — Shared Storage 架構
image: /automq-shared-storage.png
caption: "核心：<strong style='color:#F7A86B'>Storage 與 Compute 徹底分離</strong> · Broker 變 stateless · P99 &lt; 10ms"
---

<!--
補充：
- 這張是 AutoMQ 官方對比圖
- 左邊是傳統 Kafka (Shared Nothing)：每個 broker 有自己的 disk + replication
- 右邊是 AutoMQ (Shared Storage)：所有 broker 共享 object storage
- 核心優勢：
  1. Storage 和 Compute 分離
  2. Zero partition data replication (因為 S3 本身就是多副本)
  3. Low latency on S3 (P99 < 10ms)
- Kafka API 100% 相容 — 這是關鍵，不用改 client
-->

---
layout: image-side
title: Zero-Zone Router — 跨區流量歸零
image: /automq-zero-zone-router.png
---

::notes::

<Callout type="info" title="Producer">
寫入<strong>本地 AZ</strong> 的 broker<br/>透過 S3 路由給 leader
</Callout>

<Callout type="info" title="Consumer">
從本地 AZ 的<br/>readonly replica 讀取
</Callout>

<Callout type="win" title="結果">
broker ↔ S3 同 region <strong>免費</strong><br/>跨 AZ 流量歸零
</Callout>

<!--
補充（Zero-Zone Router 分步講解，這頁可以講 2-3 分鐘）：
1. Producer 在 AZ2 寫入，它只需要寫到 AZ2 的 broker（本地）
2. AZ2 的 Rack-aware Router 把資料透過 S3 「路由」給 AZ1（leader partition 所在地）
3. AZ1 從 S3 讀取資料完成寫入
4. 所有其他 AZ 透過 S3 複製拿到 readonly 副本
5. Consumer 在 AZ2 讀取，只需從 AZ2 的 readonly replica 讀（本地）
結果：Producer ↔ Broker / Consumer ↔ Broker 全部 in-AZ
唯一的跨 AZ 流量：broker ↔ S3，而這在 AWS 同 region 的 S3 是免費的
-->

---
layout: split
title: 延遲的哲學取捨
kicker: 10 倍延遲差異 — 我們在乎嗎？
ratio: "1:1"
footnote: "長期指標後端不在乎 · Alert / HPA / KEDA 仍然走 Prom Server"
---

::left::

<div class="text-center">
  <div class="text-xs uppercase tracking-widest opacity-60 mb-2">Traditional Kafka (EBS)</div>
  <div class="text-8xl font-black" style="color:#5296B8;">~50<span class="text-3xl">ms</span></div>
  <div class="text-base opacity-70 mt-2">P99 end-to-end</div>
</div>

::right::

<div class="text-center">
  <div class="text-xs uppercase tracking-widest opacity-60 mb-2">AutoMQ S3Stream</div>
  <div class="text-8xl font-black" style="color:#F7A86B;">~500<span class="text-3xl">ms</span></div>
  <div class="text-base opacity-70 mt-2">P99 end-to-end</div>
</div>

<!--
補充（關鍵洞察）：
- 這張呼應前面「為什麼保留 Prom Server」的選型決策
- 關鍵決策鏈條：
  - 保留 Prom Server → 短期查詢走 Prom（毫秒級）
  - 長期查詢走 Mimir → 可以接受 500ms
  - Alert / HPA / KEDA 繼續用 Prom → 業務不受 AutoMQ 延遲影響
- 所以 50ms → 500ms 的代價，換來 10+ 倍成本降低和運維解放
- 這是典型的 engineering tradeoff：知道自己在意什麼，就能做出聰明選擇
-->

---
layout: section-blue
chapter: "04"
parent: Thanos → Mimir 3.0
---

# 成本效能實戰成果

<div class="mt-6 opacity-60">數字會說話</div>

<!--
進入成果展示段
這段要放輕鬆一點，讓聽眾有「哇」的反應
-->

---
layout: split
title: 實測效能對比
kicker: 8 種 query × 6 個時間範圍 = 48 組測試 · cache busting
ratio: "1:1"
---

::left::

<img src="/eval-summary.png" />

::right::

<div class="grid grid-cols-2 gap-4">
  <Stat value="3.4×" label="平均查詢加速" accent="orange" />
  <Stat value="45/48" label="測試項目勝出" accent="sky" />
  <Stat value="16.7×" label="Cross-metric Join 30d" accent="red" />
  <Stat value="8.4×" label="High-cardinality 1h" accent="blue" />
</div>

<!--
補充：
- 這是我們跑的 8 種 query × 6 個時間範圍 = 48 組測試
- 用 cache busting 確保測真實效能不是 cache hit rate
- 最有趣的發現：長期查詢 Mimir 的優勢反而更大（30d = 6.3x）
- 完全顛覆「Thanos 擅長長期查詢」的迷思
-->

---
layout: split
title: 3 週 AWS 成本實測
ratio: "1:1"
footnote: "Dec 8-28, 2025 · 同一生產環境 · 真實 AWS billing"
---

::left::

<div class="text-center mb-3">
  <span class="text-teal-400 font-bold text-lg">Thanos</span>
  <div class="text-4xl font-black text-teal-400 mt-1">$32,525</div>
</div>

<img src="/cost-thanos.png" />

::right::

<div class="text-center mb-3">
  <span class="font-bold text-lg text-red-400">Mimir + AutoMQ</span>
  <div class="text-4xl font-black mt-1 text-red-400">$16,602</div>
</div>

<img src="/cost-mimir.png" />

<!--
補充：
- 這是 AWS Cost Explorer 的真實截圖，不是我編造的數字
- Thanos 這邊 EC2 instance 就吃了 $18,058 — 因為 Thanos 的 Store Gateway 要大量 compute
- Mimir 這邊 EC2 instance 只要 $6,132 — MQE + Ingest Storage 的效率
- Data transfer cost Mimir 反而高一點 $9,054 — 因為有 Kafka traffic
- 但整體還是便宜 49%
-->

---
layout: inner
align: center
---

<div class="text-center w-full">

<h1 class="!text-7xl !font-black !mb-6" style="color:#F7A86B;letter-spacing:-0.04em;">49% 更便宜</h1>

<div class="text-3xl opacity-80 mb-12">
  年度預估節省 <strong class="text-red-400">$254,771</strong>
</div>

<div class="flex items-center justify-center gap-6 text-xl opacity-90">
  <span class="font-black" style="color:#F7A86B;">3.4× 更快</span>
  <span class="opacity-40">·</span>
  <span class="font-black" style="color:#F26D4F;">49% 更便宜</span>
  <span class="opacity-40">·</span>
  <span class="font-black" style="color:#F7A86B;">6.6× 性價比</span>
</div>

</div>

<!--
這張是「成果段的 money shot」
講的時候要慢，讓數字在空氣中停留
可以補一句：「這個 ROI 讓我把遷移提案推上去時非常好講」
-->

---
layout: section-blue
chapter: "05"
parent: Thanos → Mimir 3.0
---

# 下一站 —<br/>可觀測性 2.0?

<div class="mt-6 opacity-60">PromCon 2026 帶回來的新東西</div>

<!--
進入最後一段
這段是「帶禮物回家」的段落
讓聽眾覺得「我學到新東西，還想回去研究」
-->

---
layout: inner
title: 可觀測性 2.0 的訊號
kicker: 資料庫派 vs Prometheus 派
---

<div class="w-full flex flex-col gap-5">

<div class="hl-banner">
  <mdi-lightbulb-on class="hl-banner__icon" />
  <div>
    <strong>口號</strong> — 把 <strong>logs / traces / metrics</strong> 全倒進 <strong>data warehouse / data lake</strong>，用統一查詢引擎交叉分析
  </div>
</div>

<div class="hl-grid hl-grid--2">

<div class="hl-card hl-card--pos">
  <div class="hl-card__num">01</div>
  <div class="hl-card__kicker">支持者 · 資料庫廠商</div>
  <div class="hl-card__title">擁抱 columnar 儲存</div>
  <ul>
    <li><strong>ClickHouse</strong> 大力鼓吹</li>
    <li><strong>AWS Athena</strong> — 把 metrics 倒進來</li>
    <li>Columnar 對<strong>高基數</strong>資料超友善</li>
  </ul>
</div>

<div class="hl-card hl-card--neg">
  <div class="hl-card__num">02</div>
  <div class="hl-card__kicker">為何不溫不火</div>
  <div class="hl-card__title">PromQL 生態太穩</div>
  <ul>
    <li>PromQL 生態<strong>太大太穩</strong></li>
    <li>SQL ↔ PromQL <strong>轉換成本高</strong></li>
    <li>Dashboards / alerts <strong>綁死 Prom</strong></li>
  </ul>
</div>

</div>

<div v-click class="hl-footer">
  但 Prometheus 生態<strong>沒有放棄</strong>這個方向 — 下一頁看他們怎麼接招
</div>

</div>

<!--
補充：
- 可觀測性 2.0 是一個 buzzword 但背後有真實的技術洞察
- 問題是轉換成本太高，PromQL 生態太大
- 重點：Prom 生態內部也在吸收這些 columnar 的好處
-->

---
layout: inner
title: PromCon 2026 — Parquet Gateway
kicker: 三大社群聯合發聲
---

<div class="hl-grid hl-grid--3">

<div class="hl-card">
  <div class="hl-card__num">01</div>
  <div class="hl-card__kicker">Grafana Labs</div>
  <div class="hl-card__title">Jesús Vázquez</div>
  <div class="hl-card__sub">Mimir 核心維護者</div>
</div>

<div class="hl-card">
  <div class="hl-card__num">02</div>
  <div class="hl-card__kicker">AWS</div>
  <div class="hl-card__title">Alan Protasio</div>
  <div class="hl-card__sub">Cortex · Amazon Managed Prometheus</div>
</div>

<div class="hl-card">
  <div class="hl-card__num">03</div>
  <div class="hl-card__kicker">Cloudflare</div>
  <div class="hl-card__title">Michael Hoffmann</div>
  <div class="hl-card__sub">Thanos maintainer</div>
</div>

</div>

<div v-click class="hl-banner">
  <mdi-account-group class="hl-banner__icon" />
  <div>
    <strong>Cortex · Thanos · Mimir</strong> 三大社群核心維護者<strong style="color:#F7A86B">同台</strong>宣告下一代 Prometheus 長期儲存後端方向
  </div>
</div>

<div v-click class="hl-footer">
  用 <strong style="color:#F7A86B">Parquet</strong>（columnar format）取代 TSDB block<br/>彌補 TSDB 在 object storage 上的結構性缺陷
</div>

<!--
補充：
- 這個三家同台的畫面本身就是 message
- 過去三個社群是互相競爭的，現在共同發聲
- 背後的源起是 Shopify 的 Filip Petkovski 在 Thanos 提的 Parquet PoC
- Cloudflare 的 parquet-tsdb-poc 是最早的實作
- 最終匯流到 prometheus-community/parquet-common 的共享 library
-->

---
layout: inner
title: 為什麼 TSDB 不適合 Object Storage?
kicker: I/O 經濟學的根本差異
footnote: "<strong style='color:#F7A86B'>Request 數量才是成本</strong>，不是 bytes 數量"
---

<div class="hl-grid hl-grid--2">

<div class="hl-card hl-card--neg">
  <div class="hl-card__kicker">TSDB on S3</div>
  <div class="hl-card__title">100+ <span class="text-[0.7em] font-bold opacity-80">random GETs</span></div>
  <div class="hl-card__sub">
    為本地 SSD 設計<br/>
    每個 request 都是 HTTP round-trip<br/>
    <strong>SSD ~100μs · S3 ~10-50ms</strong>
  </div>
</div>

<div class="hl-card hl-card--pos">
  <div class="hl-card__kicker">Parquet on S3</div>
  <div class="hl-card__title">3-4 <span class="text-[0.7em] font-bold opacity-80">sequential reads</span></div>
  <div class="hl-card__sub">
    columnar 格式 + metadata 集中<br/>
    多讀一點 bytes 沒關係<br/>
    <strong>少發幾次 request 才是王道</strong>
  </div>
</div>

</div>

<div v-click class="grid grid-cols-2 gap-5 max-w-4xl mx-auto w-full">
  <Stat value="-90%" label="GetRange calls 減少" accent="orange" />
  <Stat value="80-90%" label="查詢加速" accent="sky" />
</div>

<!--
補充（first principles）：
- 這是整個 Parquet 故事最核心的 insight
- TSDB 是為本地 SSD 設計的，random read 便宜
- S3 上每個 request 都是 HTTP round-trip
- 所以設計哲學要改：「多讀一點 bytes 沒關係，但少發幾次 request」
- 這就是 columnar + sequential read 的威力
- 實測：GetRange calls 減少 90%，查詢加速 80-90%
-->

---
layout: inner
align: center
---

<div class="end-page w-full flex flex-col items-center gap-8">

<div class="text-center">
  <h1 class="!text-7xl !font-black !mb-3" style="letter-spacing:-0.04em;">謝謝聆聽</h1>
  <div class="text-lg font-mono tracking-wide">
    Thanos → Mimir 3.0 → AutoMQ → <span class="font-bold text-rose-400">Parquet ?</span>
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

<div class="hl-banner w-full max-w-4xl">
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
