# Mimir 3.0 Talk — Outline (derived from `mimir/project/Mimir 3.0 Talk.html`)

> **來源**：Claude Design 手稿 · 39 張 · PromConf Taiwan 2026 · 40 min
> **用法**：這份是 HTML 稿的 outline 摘要。你在這裡改文字 / 調結構，我再把差異同步回 HTML（或 `slides.md`）。
> **編輯慣例**：
> - 要刪掉整張：在 slide 行前面加 `~~DELETE~~`。
> - 要合併：在兩張上各標 `~~MERGE→N~~`。
> - 要新增：直接在想插入的位置寫 `+ new · <title>`。
> - 單純改字：直接改就好。

---

## 章節地圖

| Part | 章節 | Slides | 預估 |
|---|---|---|---|
| I | 開場 · AI 動機 | 1–4 | 3 min |
| II | 長期指標後端架構 | 5–8 | 5 min |
| III | 痛點 + 三維度選型 | 9–13 | 6 min |
| IV | Mimir 3.0 架構 | 14–21 | 8 min |
| V | Kafka 選型 · AutoMQ | 22–31 | 10 min |
| VI | 成本效能實戰 | 32–34 | 4 min |
| VII | 下一站 · 可觀測性 2.0 | 35–38 | 3 min |
| — | 結語 | 39 | 1 min |

---

# Part I · 開場 · AI 動機

### 1 · Cover
- **Layout**: cover · folio `Observability Day 2026 · A Field Journal · № 01`
- **Eyebrow**: `An engineering notebook · 40 分鐘`
- **Title**: 從 Thanos → Mimir 3.0.
- **Lead**: AI 時代下 · 我們如何重新打造可觀測性地基
- **Footer meta**: 講者 Mike Hsu · 關鍵字 Mimir 3.0 · AutoMQ · Parquet · 場合 Observability Day 2026

### 2 · Hook · Statement
- **Layout**: statement (大字排版)
- **Kicker**: 開場
- **Big line**: 我們 metrics 後端的 **主要使用者** 已經不是人類。
  - 「主要使用者」用 accent 色
- **Lead**: 觀測者從*人*換成 *Agent*，從偶爾查到 24/7。

### 3 · SRE Agent Demo
- **Layout**: content + video placeholder
- **Kicker**: 現場 Demo
- **H3**: AI Agent 時代下，基礎設施備受考驗。
- **Video**: Live demo (20–30 秒上限) · SRE Agent 查 dashboard
- **三欄時間軸**
  1. 現在 — 幾個 agent 在跑。尚未飽和。
  2. 即將到來 — DB · Service · Cost · Security agents。
  3. 兩年後 — 負載是現在的幾倍。地基得現在打。

### 4 · Scale · 我們目前的規模
- **Kicker**: 量級
- **H3**: 我們目前的規模。
- **四個大數字**：40 EKS clusters · **120M** peak active series · 8M samples/sec · 365 天保留
- **左欄 · 為什麼盯 Active Series**
  - 常駐記憶體 ≈ `8 KB × active series`；(TSDB head chunk / 倒排索引 / labelset)。
  - **120M × 8 KB ≈ 960 GB RAM**
- **右欄 · 2023**：選了 Thanos（當時最成熟，唯一能無侵入掛 Sidecar）。服役時間超過三年。

---

# Part II · 長期指標後端架構

### 5 · Part II Opener
- **Layout**: part opener（巨型 roman `II`）
- **Eyebrow**: 第二章
- **H2**: 長期指標後端架構。
- **Lead**: 兩種架構 · 兩種設計哲學

### 6 · Why Long-Term · Prometheus 撐不住
- **H3**: Prometheus 孤掌難鳴。
- **左欄 · 先天限制**（01–04）
  1. 本地留 14 天就滿。
  2. 單機儲存，單點壞掉就沒了。
  3. 跨集群無法統一查詢。
  4. 記憶體用量跟著 active series 線性成長（垂直擴展瓶頸）。
- **右欄 · 被要求做的事**（01–04）
  1. 看上個月的 baseline。
  2. 熱門節日 vs. 平日。
  3. 算 SLO 年度達成率。
  4. 讓 AI agent 連續回溯歷史（一個窗口可能發幾千個 PromQL）。
- **Footer lead**: 要的是 **高吞吐 · 低延遲 · 便宜** 而且能擺脫單機天花板的長期儲存後端。

### 7 · Two Modes · Sidecar vs Remote-Write
- **Kicker**: 兩種架構模式 · **H3**: Sidecar vs. Remote-Write。
- **左（accent）· Sidecar Mode · Thanos 獨有**
  - Diagram: `Prometheus — Sidecar` (同 Pod) → S3
  - Caption: Sidecar 寄生 Prom Pod · 直接上傳 TSDB block。
- **右（accent-2）· Remote-Write Mode · Thanos / Mimir / Cortex 主流支持**
  - Diagram: Prometheus → (push protobuf) → Backend → (解碼 · 重壓縮 · 建 index) → S3
  - Caption: Prom push 給後端 · 後端負責所有處理。

### 8 · Sidecar Elegance
- **Kicker**: SIDECAR 的巧妙之處 · **H3**: 它不重工，效率至上。
- **左**：插圖 `images/sidecar-mode.png`
- **右**：
  - 關鍵洞察 — S3 上的 block 跟本地 disk *完全一樣*；Sidecar 不做任何運算。
  - 對比 Remote-Write — Backend 要解 protobuf、壓縮、重建 index；同一份運算做了兩次。
  - Margin note — 所以當初選 Sidecar，是合理的。

---

# Part III · 痛點 + 三維度選型

### 9 · But — Wall · Statement
- **Layout**: statement
- **Kicker**: 但是，三年之後
- **Big line**: 我們 **面臨的痛點。**（accent · 斜體）
- **Lead**: Thanos Sidecar 架構下的兩處侷限。

### 10 · Pain 1 · 512 GiB Money Shot
- **Kicker**: 痛點 ① 短期查詢 · **H3**: 垂直擴展瓶頸被 Sidecar 放大。
- **左 · Query path 圖**
  - Grafana / AI Agent → Thanos Querier
  - 短期 → remote-read → 💥 Prometheus
  - 長期 → Store Gateway → S3
- **右 · money shot**
  - Single Prometheus Pod
  - `512` **GiB RAM**（巨型 serif 數字、accent）
  - Prometheus `400+ GiB` · Sidecar `數十 GiB`
  - Caption: Sidecar 幫短期查詢扛 remote-read buffer——記憶體壓力被放大。
- **Footer lead**: 繼續走，只剩兩條路：買更大的機器，或換架構。

### 11 · Pain 2 · Store Gateway 四項侷限
- **Kicker**: 痛點 ② 長期查詢 · **H3**: Thanos 與 Mimir 查詢細節差異。
- **Sub-lead**: 不是 Thanos 撐不住——是我們這樣的查詢型態，把 SG 的假設逼擠了出來。
- **2×2 grid**
  1. 靜態 Sharding — 寫死在 manifest，改一次需要全部 block 重分配。Mimir: Hash Ring 自動 rebalance。
  2. 多租戶不友善 — 一個 heavy long-range 查詢佔滿所有 worker，其他租戶全部排隊。Mimir: 有 per-tenant fair queuing， 吵鬧鄰居影響不到其他人。
  3. 社群開發節奏慢 - Mimir 2.7（2023-01）預設 batched streaming StoreGateway：5000 series / gRPC message。Thanos 直到 2026-01 才 merge PR #8623 補齊
     — —我們 2025-12 做決定時，它還沒出來。

### 12 · Three Axes · 三條決策維度
- **Kicker**: 三條決策維度 · **H3**: 開始之前，再想清楚。
- **三大卡片**（大型 01 / 02 / 03 編號）
  1. 短期瓶頸 — **Sidecar vs. Remote-Write**。把壓縮、建 index 丟給後端，緩解 Prometheus 瓶頸。
  2. 長期瓶頸 — **Thanos vs. Mimir**。bucket-index、動態 sharding、為多租戶規模而生。
  3. 採集端 — **Prom Server vs. Prom Agent**。所有查詢只依賴統一儲存後端——最激進。風險最高。
- **Footer lead**: 三個維度互相獨立。下一頁把排列組合一一刪去。

### 13 · Combinations · 刪去法 (table)
- **Kicker**: 刪去法 · **H3**: 五個排列組合，活下來一個。
- **Table**
  | № | 組合 | 結果 | 判決 |
  |---|---|---|---|
  | ① | Sidecar · Thanos · Prom Server | 維持現況
  | ② | Remote-Write ·Thanos ·  Prom Server | 短期解了，長期查詢沒解
  | ③ | Remote-Write ·Thanos ·  Prom Agent | 長期沒解，還疊加 alert 風險
  | ④ | **Remote-Write ·Mimir ·  Prom Server** | 短期緩解 + 長期解 · Prom Server 留作最後防線
  | ⑤ |Remote-Write · Mimir ·  Prom Agent | HPA / KEDA / Alert 全依賴 Mimir，穩定後的終極優化
- **Margin note**: 保留 Prom Server 是保險決策。這個選擇會在 Slide 31 回收。

---

# Part IV · Mimir 3.0 架構

### 14 · Part III Opener（內文標 Part III／folio 寫 Part III）
- **Layout**: part opener · 巨型 roman `III`
- **Eyebrow**: 第三章 · **H2**: Mimir 3.0 的新地基。
- **Lead**: 為什麼偏偏現在換。
- ⚠️ 內文 opener 寫 III，但在 Outline 分類中屬 Part IV — 保持 HTML 原樣。

### 15 · Why Now
- **Kicker**: 時機 · **H3**: Mimir 3.0 剛好到位。
- **左 · 版本紅利**
  - 2025 九月推出 · 三主題 Reliability / Performance / Cost
  - *Ingest Storage* — Kafka 讀寫解耦
  - *Mimir Query Engine* — streaming + optimization
  - Grafana Cloud dogfood 省 ~25% TCO
- **右 · 個人觀察**
  - Grafana Labs 全力押 LGTM stack
  - Mimir 持續優化底層架構
  - Thanos 社群冷清 · 文件不全 · 有問題得翻 source code

### 16 · Three Pillars
- **Kicker**: 三大支柱 · **H3**: 讀 · 寫 · 成本。
- **左**：插圖 `images/mimir3-3benefits.png`
- **右 · 三欄**
  1. Reliability（accent）— 讀寫徹底解耦。Kafka 當中繼實現持久性 · 讀掛掉寫照常 · quorum 從 2/3 降到 1。
  2. Performance（accent-2）— MQE streaming。Peak CPU ↓80% · Peak Mem ↓3×。
  3. Cost（accent-3）— Querier / Ingester 使用量減半。不再靠 RF=3 · ~25% TCO ↓。

### 17 · Ingest Storage · 寫 3 次 → 寫 1 次
- **Kicker**: Ingest Storage
- **左 · Classic · v2**
  - Diagram: Distributor → RF=3 gRPC Push → Ingester a/b/c → 2/3 quorum → Querier
  - 為什麼要 2/3 quorum · Dynamo 不變式 `R + W > N`。W=2 · R=2 · N=3 → 4 > 3 ✓
- **右 · Ingest Storage · v3**
  - Diagram: Distributor → 寫 1 次 → Kafka → consume → Ingester / Block Builder → quorum=1 → Querier
  - 為什麼 quorum=1 就夠 · Kafka partition = linearized log。每個 consumer 都 replay 同一份 log · 無分歧。

### 18 · Decouple · Quorum = 1
- **Kicker**: Quorum = 1 · **H3**: 讀掛了 · 寫照常。
- **左**：插圖 `images/mimir3-decouple.png`
- **右**
  - 讀取可用行 — v2：過半 zone 健康才算活。v3：**每個 partition 有 1 個消費者就算活。**
  - 可用性解偶 — 熱查詢再兇，寫入只到 Kafka 就結束。Write 永遠 HEALTHY。*

### 19 · Replica Math · 成本最大的一刀
- **Kicker**: Rethinking Replication · **H3**: 可用性不一定要靠 Replication。
- **Table**（選擇 RF=2 + 2 zones 那欄 highlight）
  | 維度 | Classic RF=3 + 3 zones | Ingest 3 zones | **Ingest 2 zones ✦** |
  |---|---|---|---|
  | 副本決定方式 | RF=3（寫 3 次） | zone 數 | zone 數 |
  | 實際副本 | 3× | 3× | **2×** |
  | Write 容錯 | 1 zone · 2/3 quorum | Kafka 負責 | Kafka 負責 |
  | Read quorum | 2/3 | 1/3 | 1/2 |
  | Read 容錯 | 1 zone | 2 zones | 1 zone |
  | Ingester 成本 | 3× | 3× | **2×** |
  | 額外元件 | — | Kafka | Kafka |
- **Footer callout**: 把可用性從*「RF 堆出來」*換成*「Kafka 保證 + partition 調整」*。

### 20 · MQE · Mimir Query Engine
- **Kicker**: Mimir Query Engine · **H3**: 無痛升級。
- **左**：插圖 `images/mimir3-mqe-benchmark.png`
- **右 · 四個數字**
  - 92% less memory vs Prom engine
  - 38% faster execution
  - 3× querier peak mem ↓
  - 80% querier peak CPU ↓
- **Footer caption**: MQE 在 Mimir 3.0 預設開啟 · 不用改 query、不用加設定 · 覆蓋 100% 穩定 PromQL。

### 21 · Dashboard 2×2 · 遷移後
- **Kicker**: 遷移後 · **H3**: 寫讀兩端同時掉下來。
- **2×2 圖表**
  - Ingester · CPU（accent）- `images/mimir3-ingester-cpu.png`
  - Ingester · Memory（accent）- `images/mimir3-ingester-memory.png`
  - Querier · CPU（accent-2）- `images/mimir3-querier-cpu.png`
  - Querier · Memory（accent-2）- `images/mimir3-querier-memory.png`

---

# Part V · Kafka 選型

### 22 · Part IV Opener
- **Layout**: part opener · 巨型 roman `IV`
- **Eyebrow**: 第四章 · **H2**: Kafka 選型。
- **Lead**: 多一個元件——我們是不是在自找麻煩？

### 23 · Little's Law · 李氏定理
- **Kicker**: 先打個岔
- **H2**: 多加一個 Kafka 是不是把事情 **搞更複雜**？
- **Lead**: 回答這個問題之前，我想先拉出一條基礎定律。任何有 queue 的系統，都躲不過它。
- **Formula block**: `L = λ · W`（巨型 mono accent）
  - L — queue 中的平均任務數
  - λ — 到達速率（samples/s）
  - W — 每件事花的處理時間
- **Closing**: L 堆積 = 流入（控不住）× 處理時間（下游拖慢）。**這就是背壓的來源。**

### 24 · Backpressure · 牽一髮動全身
- **Kicker**: 整條鏈路 · **H3**: 牽一髮，動全身。
- **圖**: `images/kafka-backpressure-flow.png`
- **左 · 真實踩過的坑**
  - Ingester 卡住 → Kafka 堆積 → Distributor produce timeout → Prom queue full → 全環境噴 alert。
  - 根因在最下游，但你看到的是最上游在叫。
- **右 · 我們學到的**
  - Kafka 不永遠低延遲。Rebalance、leader 切換、consumer lag，任一件都能把 5ms 變 5 秒。
  - 沒有免費的午餐。複雜度不會消失，只是換地方放。

### 25 · But Still · Statement
- **Layout**: statement
- **Kicker**: 但我們還是選了它
- **Big line**: 因為我們賭的 / 不是*今天的 Kafka* / 是**明天的**。
- **Lead**: 如果只是要解耦，我們不會跳進這個坑。社群這兩年悄悄決定了 Kafka 的未來。

### 26 · Diskless Timeline · 下一個十年
- **Kicker**: 下一個十年 · **H3**: Diskless Kafka。
- **左 · Timeline**
  - Aug 2023 — WarpStream 發表 · Kafka-API on S3 首發
  - May 2024 — Confluent Freight 發表
  - Jul 2024 — **AutoMQ 1.0** · S3 Direct 寫入
  - Sep 2024 — Confluent 收購 WarpStream · $220M
  - Apr 2025 — Aiven 提出 **KIP-1150** Diskless Topics
  - Nov 2025 — Redpanda 發表 Cloud Topics
  - Mar 2026（key）— KIP-1150 正式通過——Apache Kafka 擁抱 diskless
- **右**：插圖 `images/kip1150-xiaohongshu.png`
  - Margin note: 9 binding + 5 non-binding。不是 PR 稿，是真人真投票。AutoMQ 不是冒險——是共識方向上最早的一批。

### 27 · AutoMQ Philosophy
- **Kicker**: AutoMQ · **H3**: 最小改動的 Diskless Kafka 分支。
- **左**：插圖 `images/automq-architecture.png`
- **右 · 對比**
  - 傳統 Kafka 三痛
    - Broker 有狀態——每次重啟都搬資料。
    - Rebalance storm——加縮 broker 觸發大遷移。
    - 跨 AZ 流量吃掉 60–70% 成本。
  - AutoMQ 換介面 · 全解（accent-2）
    - Broker stateless · spot-friendly · 秒級 rebalance。
    - S3 自帶多副本 · broker 間 zero replication。
    - 100% Kafka API · Producer/Consumer 0 改動。

### 28 · Cross-AZ Black Hole
- **Kicker**: 跨 AZ 流量 · **H3**: 傳統 Kafka 的黑洞。
- **左**：插圖 `images/kafka-inter-zone.png`
- **右 · 三項成本來源**
  1. Producer → Broker — 寫入可能 hit 其他 AZ 的 leader。
  2. Broker ↔ Broker — Replication 幾乎必定跨 AZ。
  3. Consumer ← Broker — Consumer 不一定跟 leader 同 AZ。
- **Footer callout**: AutoMQ 官方：大叢集跨 AZ 流量占 **60–70%** 的 Kafka 總成本——不是花在業務，是花在跨區網路傳輸。

### 29 · Zero-Zone Router · High Point
- **Kicker**: AutoMQ 的解法 · **H3**: Zero-Zone Router。
- **左**：插圖 `images/automq-zero-zone-router.png`
- **右 · 四步驟編號列**
  1. Producer 寫本地 AZ 的 broker。
  2. Rack-aware Router 透過 S3 路由給 leader partition。
  3. 其他 AZ 從 S3 同步拉 readonly 副本。
  4. Consumer 從本地 AZ 的 readonly replica 讀。
- **Footer callout**: AWS 同 region S3 **免費**。把 60–70% 的 Kafka 帳單直接歸零。

### 30 · Elastic Capacity
- **Kicker**: 容量與彈性 · **H3**: 從「預留」到「按用量」。
- **左**：插圖 `images/automq-elastic-capacity.png`
- **右 · 兩張卡**
  - Apache Kafka — Fixed · Wasted > 50%。Local disk 預配足 peak · scaling 以「小時」計。
  - AutoMQ — Pay-as-you-go。S3 近乎無限 · partition 搬移以「秒」計 · Broker 可跑 spot。

### 31 · Latency Payoff · Slide 13 回收
- **Kicker**: 優點都說完了 · **H3**: 那缺點呢？
- **對照兩卡**
  - Traditional Kafka · EBS — **5–50 ms** Produce ACK P99
  - AutoMQ · S3Stream — **500 ms – 1 s** Produce ACK P99（10× 的差距）
- **Full pipeline 圖**: scrape → remote_write → Distributor → Kafka → Ingester → 可查詢（極端情況 ~30 秒才能在 Mimir 讀取）
- **Footer callout · 划算的取捨**
  - Alert · HPA · KEDA *繼續走 Prom Server*（毫秒）—— Mimir 是「秒級」長期後端，業務不受影響。
  - 這就是 Slide 13 保留 Prom Server 的回報。

---

# Part VI · 數字說話

### 32 · Part V Opener
- **Layout**: part opener · 巨型 roman `V`
- **Eyebrow**: 第五章 · **H2**: 數字說話。
- **Lead**: 三週生產並行 · AWS 真實帳單

### 33 · Benchmark · 45/48 wins
- **Kicker**: 實測 · **H3**: Mimir 勝 45 / 48。
- **左 · 測試設計**
  - 同一 production 環境 · 同 tenant。
  - 8 種 query × 6 個時間範圍 = **48 組**。
  - Cache busting。
  - 1h → 30d 全覆蓋。
  - **勝出 45 / 48 tests**
- **右 · 四個數字**
  - 3.4× 平均查詢加速
  - 16.7× Cross-metric join 30d
  - 8.4× High-cardinality 1h
  - 6.3× 長期 30d 查詢

### 34 · Money Shot · 省 49%
- **Layout**: statement
- **Eyebrow**: 3 週 AWS 帳單實測
- **Big number**: `省 49%.`（超大 accent 色）
- **三欄總結**: 3.4× 更快 · ~多數場景勝出 · ~6× 性價比
- **Caption**: 不同環境量級——絕對數字僅供參考。Annual Saving 落在幾十萬美金量級。

---

# Part VII · 下一站 · 可觀測性 2.0

### 35 · Part VI Opener
- **Layout**: part opener · 巨型 roman `VI`
- **Eyebrow**: 第六章 · **H2**: 下一站——可觀測性 2.0?
- **Lead**: PromCon 2025 · 關注社群的前沿趨勢

### 36 · Observability 2.0
- **Kicker**: 可觀測性 2.0 · **H3**: 單一事實來源 · Wide Events。
- **Caption**: Charity Majors · 2024 命名 · 原型是 Meta Scuba (VLDB 2013)
- **左 · 主力提倡者**
  - **Honeycomb** — wide events 先驅，把 Scuba 商用化。
  - ClickHouse 自家 observability 撐到 100 PB+。
  - **Iceberg / DeltaLake** — open lake format 成匯流點。
- **右 · 為什麼 Prom 還沒被取代**
  - PromQL + alerts + HPA / KEDA 生態深度綁定。
  - OTel semantic conventions 還沒成熟。
  - 多數團隊先解 cost，再談 paradigm。
- **Margin note**: Prometheus 生態不是被外部吃掉——是自己吸收 columnar / wide-event 的精華。

### 37 · Parquet Gateway
- **Kicker**: PromCon 2025 · **H3**: Parquet Gateway · 三大專案核心成員同台。
- **左**：插圖 `images/parquet-gateway-speakers.png`
- **右**
  - Cortex · Thanos · Mimir maintainer 首次同台
  - 共享 artifact：`prometheus-community/parquet-common`——100% PromQL acceptance · TSDB → Parquet schema converter · Queryable 實作內建。
  - 四個數字：83.6% faster queries · 89.3% less bucket GET-range · 72.4% less memory · 41.6% fewer allocations
  - Caption: Parquet Common · 半年進展。

### 38 · TSDB Wrong Home
- **Kicker**: 為什麼 TSDB 不該住在 S3 · **H3**: I/O 經濟學 資料結構特性才是關鍵。
- **三欄對比**
  - I/O Performance — SSD random read `~100μs` · S3 random read `~10–50ms` · **100–500×**
  - TSDB on S3（accent）— **100+** random GETs，每個都是 HTTP round-trip。
  - Parquet on S3（accent-2）— **3–4** sequential reads，Row-group index + columnar skip。
- **兩欄延伸**
  - TSDB 的結構性不對 — TSDB 為本地 SSD 的 random read 設計——搬到 S3 變成大量小 random GET。
  - Store Gateway 的連鎖代價 — 被迫 stateful · 昂貴本地 disk · 啟動時間長
- **Footer callout**: *Request 數量才是成本，不是 bytes 數量。* Parquet + 無狀態 querier → Store Gateway 的四項代價一次解掉。

---

# 結語

### 39 · End · Thank You
- **Kicker**: 謝謝聆聽
- **Big title**: Thanos → Mimir 3.0 → AutoMQ → Parquet Gateway
- **三欄帶走**
  - 選型 — 理解瓶頸在哪裡比追新技術更重要。
  - 架構 — Stateless 是運維自由的基礎。
  - 心態 — 技術選型永遠是 time-sensitive。
- **Pull quote**: "保持好奇 · 保持懷疑 · 保持實驗。"
- **Footer**: Mike Hsu · Observability Day 2026 · End · № 39 of 39

---

## 視覺規範快查（from `styles.css` / `colors_and_type.css`）

- **主色**：`--accent`（橘紅 / 警示強調）· `--accent-2`（藍綠 / 新方案）· `--accent-3`（第三輔助色）
- **字族**：Inter（拉丁）· Noto Sans TC（中文）· JetBrains Mono（程式 / 數字）· Fraunces（serif italic 重點）
- **Layout 類型**：`cover` · `statement`（大字開場 / 轉場）· `part opener`（巨型羅馬數字）· 一般 content 頁
- **每頁 folio**：左（章節）· 中（英文標題副線）· 右（頁碼，§ 編號）

## 待 Mike 確認的事項

1. **Slide 3 影片**：20–30 秒的 SRE Agent 展示檔案是否已備齊？放 `public/` 哪個路徑？
2. **Slide 33 Benchmark 原始數據**：48 組測試的 raw number 要不要做一份附錄？
3. **Slide 31 latency 範圍**：5–50 ms vs 500 ms–2 s 是最新實測還是 AutoMQ 官方數字？兩者想標註來源嗎？
4. **Slide 34 「annual saving 幾十萬美金」**：要不要具體化（e.g. `~$XXXk/yr`）？還是保持模糊？
5. **部分標號錯位**：HTML 內 Part opener 寫 III / IV / V / VI，但實際是第 3–6 章。要統一嗎？

